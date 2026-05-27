'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { categories } from '@/lib/catalog-data'
import { slugify } from '@/lib/format'
import { productFormSchema, productPriceUnits } from '@/lib/product-form-schema'
import { requireOwner } from '@/lib/supabase/auth'

function nullableNumber(value: FormDataEntryValue | null) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

const allowedPriceUnits = new Set<string>(productPriceUnits.map(([unit]) => unit))

function imageList(raw: string) {
  return raw
    .split(/\n|,/)
    .map((url) => url.trim())
    .filter(Boolean)
}

function formValue(formData: FormData, name: string) {
  return formData.get(name) ?? ''
}

function actionErrorMessage(error: unknown, fallback: string) {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? fallback
  }

  return error instanceof Error ? error.message : fallback
}

function productPayload(formData: FormData) {
  const parsed = productFormSchema.parse({
    title: formValue(formData, 'title'),
    slug: formValue(formData, 'slug'),
    description: formValue(formData, 'description'),
    category: formValue(formData, 'category'),
    subcategory: formValue(formData, 'subcategory'),
    price: formValue(formData, 'price'),
    price_unit: formValue(formData, 'price_unit'),
    coverage_per_box: formValue(formData, 'coverage_per_box'),
    coverage_unit: formValue(formData, 'coverage_unit'),
    image_urls: formValue(formData, 'image_urls'),
    images: formValue(formData, 'images'),
    in_stock: formData.get('in_stock') === 'on',
    featured: formData.get('featured') === 'on',
  })

  return {
    title: parsed.title,
    slug: parsed.slug || slugify(parsed.title),
    description: parsed.description,
    category: parsed.category,
    subcategory: parsed.subcategory || null,
    price: parsed.price,
    price_unit: parsed.price_unit,
    coverage_per_box: parsed.coverage_per_box,
    coverage_unit: parsed.coverage_unit || null,
    images: imageList(parsed.images || parsed.image_urls),
    in_stock: parsed.in_stock,
    featured: parsed.featured,
  }
}

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`)
}

export async function updateCategoryPricing(formData: FormData) {
  const { supabase } = await requireOwner()

  if (!supabase) {
    redirect('/admin?error=Connect%20Supabase%20to%20save%20category%20pricing.%20Demo%20login%20is%20read-only.')
  }

  const now = new Date().toISOString()
  const payload = categories.map((category) => {
    const defaultPrice = nullableNumber(formData.get(`${category.slug}_default_price`))
    const requestedUnit = String(formData.get(`${category.slug}_price_unit`) || category.price_unit)

    if (!defaultPrice) {
      redirect(`/admin?error=${encodeURIComponent(`Enter a valid ${category.name} default price.`)}`)
    }

    return {
      category: category.slug,
      default_price: defaultPrice,
      price_unit: allowedPriceUnits.has(requestedUnit) ? requestedUnit : category.price_unit,
      updated_at: now,
    }
  })

  const { error } = await supabase.from('category_settings').upsert(payload)

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/')
  revalidatePath('/shop/[category]', 'page')
  redirect('/admin?pricing=1')
}

export async function createProduct(formData: FormData) {
  const { supabase } = await requireOwner()

  if (!supabase) {
    redirectWithError('/admin/products/new', 'Connect Supabase to save inventory changes. Demo login is read-only.')
  }

  try {
    const payload = productPayload(formData)
    const { error } = await supabase.from('products').insert(payload)

    if (error) {
      redirectWithError('/admin/products/new', error.message)
    }
  } catch (error) {
    redirectWithError('/admin/products/new', actionErrorMessage(error, 'Could not create product.'))
  }

  revalidatePath('/')
  revalidatePath('/shop/[category]', 'page')
  redirect('/admin?created=1')
}

export async function updateProduct(id: string, formData: FormData) {
  const { supabase } = await requireOwner()

  if (!supabase) {
    redirectWithError(`/admin/products/${id}`, 'Connect Supabase to save inventory changes. Demo login is read-only.')
  }

  try {
    const payload = productPayload(formData)
    const { error } = await supabase.from('products').update(payload).eq('id', id)

    if (error) {
      redirectWithError(`/admin/products/${id}`, error.message)
    }
  } catch (error) {
    redirectWithError(`/admin/products/${id}`, actionErrorMessage(error, 'Could not update product.'))
  }

  revalidatePath('/')
  revalidatePath('/shop/[category]', 'page')
  revalidatePath('/shop/[category]/[slug]', 'page')
  redirect('/admin?updated=1')
}

export async function deleteProduct(id: string) {
  const { supabase } = await requireOwner()

  if (!supabase) {
    redirect('/admin?error=Connect%20Supabase%20to%20save%20inventory%20changes.%20Demo%20login%20is%20read-only.')
  }

  const { error } = await supabase.from('products').delete().eq('id', id)

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/')
  revalidatePath('/shop/[category]', 'page')
  redirect('/admin?deleted=1')
}
