'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireOwner } from '@/lib/supabase/auth'
import { slugify } from '@/lib/format'

function nullableNumber(value: FormDataEntryValue | null) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function imageList(formData: FormData) {
  const raw = String(formData.get('images') || formData.get('image_urls') || '')
  return raw
    .split(/\n|,/)
    .map((url) => url.trim())
    .filter(Boolean)
}

function productPayload(formData: FormData) {
  const title = String(formData.get('title') || '').trim()
  const slug = String(formData.get('slug') || '').trim() || slugify(title)
  const price = Number(formData.get('price'))

  if (!title) {
    throw new Error('Title is required.')
  }

  if (!slug) {
    throw new Error('Slug is required.')
  }

  if (!Number.isFinite(price) || price < 0) {
    throw new Error('Price must be a valid number.')
  }

  return {
    title,
    slug,
    description: String(formData.get('description') || '').trim(),
    category: String(formData.get('category') || 'flooring'),
    subcategory: String(formData.get('subcategory') || '').trim() || null,
    price,
    price_unit: String(formData.get('price_unit') || 'sq_ft'),
    coverage_per_box: nullableNumber(formData.get('coverage_per_box')),
    coverage_unit: String(formData.get('coverage_unit') || '').trim() || null,
    images: imageList(formData),
    in_stock: formData.get('in_stock') === 'on',
    featured: formData.get('featured') === 'on',
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

  const flooringDefault = nullableNumber(formData.get('flooring_default_price'))
  const roofingDefault = nullableNumber(formData.get('roofing_default_price'))

  if (!flooringDefault || !roofingDefault) {
    redirect('/admin?error=Enter%20valid%20flooring%20and%20roofing%20default%20prices.')
  }

  const { error } = await supabase.from('category_settings').upsert([
    {
      category: 'flooring',
      default_price: flooringDefault,
      price_unit: 'sq_ft',
      updated_at: new Date().toISOString(),
    },
    {
      category: 'roofing',
      default_price: roofingDefault,
      price_unit: 'sq_ft',
      updated_at: new Date().toISOString(),
    },
  ])

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
    redirectWithError('/admin/products/new', error instanceof Error ? error.message : 'Could not create product.')
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
    redirectWithError(`/admin/products/${id}`, error instanceof Error ? error.message : 'Could not update product.')
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
