'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Upload } from 'lucide-react'
import type { BaseSyntheticEvent } from 'react'
import { useMemo, useState, useTransition } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { categories } from '@/lib/catalog-data'
import {
  productCoverageUnits,
  productFormSchema,
  productPriceUnits,
  type ParsedProductFormValues,
  type ProductFormValues,
} from '@/lib/product-form-schema'
import { getBrowserSupabaseClient } from '@/lib/supabase/client'
import type { Product } from '@/lib/types'

const productImageBucket = 'product-images'

type ProductFormProps = {
  product?: Product
  submitLabel: string
  action: (formData: FormData) => Promise<void>
  error?: string
}

function safeFileName(fileName: string) {
  return fileName.toLowerCase().replace(/[^a-z0-9.]+/g, '-')
}

function uploadErrorMessage(message: string) {
  const normalizedMessage = message.toLowerCase()

  if (normalizedMessage.includes('bucket not found')) {
    return 'Supabase Storage bucket "product-images" is missing. Create the bucket or rerun supabase/schema.sql before uploading images.'
  }

  if (normalizedMessage.includes('row-level security') || normalizedMessage.includes('unauthorized') || normalizedMessage.includes('permission')) {
    return 'This admin account can save products, but Supabase Storage is blocking image uploads. Rerun the latest storage policies in supabase/schema.sql.'
  }

  return message
}

function fieldClassName(hasError: boolean) {
  return ['field', hasError ? 'border-danger bg-danger-soft/20' : ''].filter(Boolean).join(' ')
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return (
    <p className="text-sm font-semibold text-danger" role="alert">
      {message}
    </p>
  )
}

export function ProductForm({ product, submitLabel, action, error }: ProductFormProps) {
  const [clientError, setClientError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProductFormValues, unknown, ParsedProductFormValues>({
    resolver: zodResolver(productFormSchema),
    mode: 'onBlur',
    defaultValues: {
      title: product?.title ?? '',
      slug: product?.slug ?? '',
      description: product?.description ?? '',
      category: product?.category ?? 'flooring',
      subcategory: product?.subcategory ?? '',
      price: product?.price ?? 0,
      price_unit: product?.price_unit ?? 'sq_ft',
      coverage_per_box: product?.coverage_per_box ?? '',
      coverage_unit: product?.coverage_unit ?? '',
      image_urls: product?.images.join('\n') ?? '',
      images: product?.images.join('\n') ?? '',
      in_stock: product?.in_stock ?? true,
      featured: product?.featured ?? false,
    },
  })

  const imageUrls = useWatch({ control, name: 'image_urls' }) || ''
  const imagePreview = useMemo(() => imageUrls.split(/\n|,/).map((url) => url.trim()).filter(Boolean), [imageUrls])

  async function onValidSubmit(_values: ParsedProductFormValues, event?: BaseSyntheticEvent) {
    setClientError(null)

    const form = event?.currentTarget instanceof HTMLFormElement ? event.currentTarget : null
    if (!form) {
      setClientError('The form is not ready. Refresh and try again.')
      return
    }

    const formData = new FormData(form)
    const currentImageUrls = String(formData.get('image_urls') || '')
    const currentImagePreview = currentImageUrls.split(/\n|,/).map((url) => url.trim()).filter(Boolean)
    const files = formData.getAll('new_images').filter((file): file is File => file instanceof File && file.size > 0)
    const uploadedUrls: string[] = []

    if (files.length > 0) {
      const supabase = getBrowserSupabaseClient()

      if (!supabase) {
        setClientError('Supabase environment variables are required before images can be uploaded.')
        return
      }

      for (const file of files) {
        const path = `products/${crypto.randomUUID()}-${safeFileName(file.name)}`
        const { error: uploadError } = await supabase.storage.from(productImageBucket).upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        })

        if (uploadError) {
          setClientError(uploadErrorMessage(uploadError.message))
          return
        }

        const { data } = supabase.storage.from(productImageBucket).getPublicUrl(path)
        uploadedUrls.push(data.publicUrl)
      }
    }

    const mergedImages = [...currentImagePreview, ...uploadedUrls]
    formData.set('images', mergedImages.join('\n'))
    formData.delete('new_images')

    startTransition(() => {
      void action(formData)
    })
  }

  return (
    <form className="grid gap-5" noValidate onSubmit={handleSubmit(onValidSubmit, () => setClientError('Fix the highlighted fields before saving.'))}>
      {error || clientError ? (
        <div className="rounded-lg bg-danger-soft p-4 text-sm font-semibold text-danger">{clientError || error}</div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold">
          Product title
          <input className={fieldClassName(Boolean(errors.title))} aria-invalid={Boolean(errors.title)} {...register('title')} />
          <FieldError message={errors.title?.message} />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          URL slug
          <input className={fieldClassName(Boolean(errors.slug))} placeholder="rustic-oak-vinyl" aria-invalid={Boolean(errors.slug)} {...register('slug')} />
          <FieldError message={errors.slug?.message} />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-semibold">
        Description
        <textarea className={`${fieldClassName(Boolean(errors.description))} min-h-32 resize-none`} aria-invalid={Boolean(errors.description)} {...register('description')} />
        <FieldError message={errors.description?.message} />
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold">
          Category
          <select className={fieldClassName(Boolean(errors.category))} aria-invalid={Boolean(errors.category)} {...register('category')}>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
          <FieldError message={errors.category?.message} />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Subcategory
          <input className={fieldClassName(Boolean(errors.subcategory))} placeholder="vinyl" aria-invalid={Boolean(errors.subcategory)} {...register('subcategory')} />
          <FieldError message={errors.subcategory?.message} />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        <label className="grid gap-2 text-sm font-semibold md:col-span-2">
          Price
          <input className={fieldClassName(Boolean(errors.price))} type="number" step="0.01" min="0" aria-invalid={Boolean(errors.price)} {...register('price')} />
          <FieldError message={errors.price?.message} />
        </label>
        <label className="grid gap-2 text-sm font-semibold md:col-span-2">
          Price unit
          <select className={fieldClassName(Boolean(errors.price_unit))} aria-invalid={Boolean(errors.price_unit)} {...register('price_unit')}>
            {productPriceUnits.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <FieldError message={errors.price_unit?.message} />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold">
          Coverage per box
          <input
            className={fieldClassName(Boolean(errors.coverage_per_box))}
            type="number"
            step="0.01"
            min="0"
            placeholder="23.6"
            aria-invalid={Boolean(errors.coverage_per_box)}
            {...register('coverage_per_box')}
          />
          <FieldError message={errors.coverage_per_box?.message} />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Coverage unit
          <select className={fieldClassName(Boolean(errors.coverage_unit))} aria-invalid={Boolean(errors.coverage_unit)} {...register('coverage_unit')}>
            {productCoverageUnits.map(([value, label]) => (
              <option key={value || 'none'} value={value}>
                {label}
              </option>
            ))}
          </select>
          <FieldError message={errors.coverage_unit?.message} />
        </label>
      </div>

      <div className="grid gap-4">
        <label className="grid gap-2 text-sm font-semibold">
          Image URLs
          <textarea className={`${fieldClassName(Boolean(errors.image_urls))} min-h-28 resize-none`} placeholder="One image URL per line" aria-invalid={Boolean(errors.image_urls)} {...register('image_urls')} />
          <FieldError message={errors.image_urls?.message} />
        </label>
        <input type="hidden" value={imageUrls} {...register('images')} />
        <label className="grid gap-2 text-sm font-semibold">
          Upload new images
          <span className="flex min-h-24 cursor-pointer items-center justify-center rounded-lg border border-dashed border-border bg-surface px-4 py-5 text-center text-sm text-muted hover:bg-surface-warm">
            <span className="inline-flex items-center gap-2">
              <Upload className="size-4 text-brand" aria-hidden="true" />
              Choose product photos
            </span>
            <input className="sr-only" name="new_images" type="file" accept="image/*" multiple />
          </span>
        </label>
        {imagePreview.length > 0 ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {imagePreview.slice(0, 5).map((image) => (
              <div
                key={image}
                className="aspect-square rounded-lg bg-surface-warm bg-cover bg-center"
                style={{ backgroundImage: `url(${image})` }}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-3 rounded-lg bg-surface-warm p-4 sm:grid-cols-2">
        <label className="flex items-center gap-3 text-sm font-semibold">
          <input className="size-4 accent-brand" type="checkbox" {...register('in_stock')} />
          In stock
        </label>
        <label className="flex items-center gap-3 text-sm font-semibold">
          <input className="size-4 accent-brand" type="checkbox" {...register('featured')} />
          Featured on homepage
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-brand px-5 py-3 text-sm font-bold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
      >
        {isPending ? 'Saving...' : submitLabel}
      </button>
    </form>
  )
}
