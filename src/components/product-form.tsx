'use client'

import { Upload } from 'lucide-react'
import { FormEvent, useMemo, useState, useTransition } from 'react'
import { categories } from '@/lib/catalog-data'
import { getBrowserSupabaseClient } from '@/lib/supabase/client'
import type { Product } from '@/lib/types'

const productImageBucket = 'product-images'

const priceUnits = [
  ['sq_ft', 'Square foot'],
  ['ln_ft', 'Linear foot'],
  ['box', 'Box'],
  ['bundle', 'Bundle'],
  ['board', 'Board'],
  ['roll', 'Roll'],
  ['unit', 'Unit'],
] as const

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

export function ProductForm({ product, submitLabel, action, error }: ProductFormProps) {
  const [imageUrls, setImageUrls] = useState(product?.images.join('\n') ?? '')
  const [clientError, setClientError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const imagePreview = useMemo(() => imageUrls.split(/\n|,/).map((url) => url.trim()).filter(Boolean), [imageUrls])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setClientError(null)

    const form = event.currentTarget
    const formData = new FormData(form)
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

    const mergedImages = [...imagePreview, ...uploadedUrls]
    formData.set('images', mergedImages.join('\n'))
    formData.delete('new_images')

    startTransition(() => {
      void action(formData)
    })
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      {error || clientError ? (
        <div className="rounded-lg bg-danger-soft p-4 text-sm font-semibold text-danger">{clientError || error}</div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold">
          Product title
          <input className="field" name="title" defaultValue={product?.title ?? ''} required />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          URL slug
          <input className="field" name="slug" defaultValue={product?.slug ?? ''} placeholder="rustic-oak-vinyl" />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-semibold">
        Description
        <textarea className="field min-h-32 resize-none" name="description" defaultValue={product?.description ?? ''} />
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold">
          Category
          <select className="field" name="category" defaultValue={product?.category ?? 'flooring'}>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Subcategory
          <input className="field" name="subcategory" defaultValue={product?.subcategory ?? ''} placeholder="vinyl" />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        <label className="grid gap-2 text-sm font-semibold md:col-span-2">
          Price
          <input className="field" name="price" type="number" step="0.01" min="0" defaultValue={product?.price ?? 0} required />
        </label>
        <label className="grid gap-2 text-sm font-semibold md:col-span-2">
          Price unit
          <select className="field" name="price_unit" defaultValue={product?.price_unit ?? 'sq_ft'}>
            {priceUnits.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold">
          Coverage per box
          <input className="field" name="coverage_per_box" type="number" step="0.01" min="0" defaultValue={product?.coverage_per_box ?? ''} placeholder="23.6" />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Coverage unit
          <select className="field" name="coverage_unit" defaultValue={product?.coverage_unit ?? 'sq_ft'}>
            <option value="">None</option>
            <option value="sq_ft">Square feet</option>
            <option value="ln_ft">Linear feet</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4">
        <label className="grid gap-2 text-sm font-semibold">
          Image URLs
          <textarea className="field min-h-28 resize-none" name="image_urls" value={imageUrls} onChange={(event) => setImageUrls(event.target.value)} placeholder="One image URL per line" />
        </label>
        <input type="hidden" name="images" value={imageUrls} />
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
          <input className="size-4 accent-brand" name="in_stock" type="checkbox" defaultChecked={product?.in_stock ?? true} />
          In stock
        </label>
        <label className="flex items-center gap-3 text-sm font-semibold">
          <input className="size-4 accent-brand" name="featured" type="checkbox" defaultChecked={product?.featured ?? false} />
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
