'use client'

import { useState } from 'react'
import { ProductImage } from '@/components/product-image'

type ProductGalleryProps = {
  images: string[]
  title: string
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0])

  return (
    <div className="grid gap-4">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-surface-warm shadow-card">
        <ProductImage src={selectedImage} alt={title} className="h-full w-full object-cover" />
      </div>
      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-3 sm:gap-4">
          {images.slice(0, 5).map((image, index) => {
            const isSelected = image === selectedImage

            return (
              <button
                key={`${image}-${index}`}
                type="button"
                className={`relative aspect-square overflow-hidden rounded-lg bg-surface-warm shadow-card ring-offset-2 ring-offset-background transition ${
                  isSelected ? 'ring-2 ring-brand' : 'hover:ring-2 hover:ring-border'
                }`}
                aria-label={`View image ${index + 1} for ${title}`}
                aria-pressed={isSelected}
                onClick={() => setSelectedImage(image)}
              >
                <ProductImage src={image} alt="" className="h-full w-full object-cover" />
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
