'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { ProductImage } from '@/components/product-image'

type ProductGalleryProps = {
  images: string[]
  title: string
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selectedImage = images[selectedIndex] ?? images[0]
  const visibleThumbnailIndexes =
    images.length <= 4
      ? images.map((_, index) => index)
      : [0, 1, 2, selectedIndex > 2 ? selectedIndex : 3]
  const hiddenCount = Math.max(images.length - 4, 0)

  function showPreviousImage() {
    setSelectedIndex((index) => (index === 0 ? images.length - 1 : index - 1))
  }

  function showNextImage() {
    setSelectedIndex((index) => (index + 1) % images.length)
  }

  return (
    <div className="grid gap-4">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-surface-warm shadow-card">
        <ProductImage src={selectedImage} alt={title} className="h-full w-full object-cover" />
        {images.length > 1 ? (
          <>
            <button
              type="button"
              className="absolute left-3 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-card backdrop-blur hover:bg-background sm:size-10"
              aria-label="View previous product image"
              onClick={showPreviousImage}
            >
              <ChevronLeft className="size-6 sm:size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="absolute right-3 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-card backdrop-blur hover:bg-background sm:size-10"
              aria-label="View next product image"
              onClick={showNextImage}
            >
              <ChevronRight className="size-6 sm:size-5" aria-hidden="true" />
            </button>
          </>
        ) : null}
      </div>
      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-3 sm:gap-4">
          {visibleThumbnailIndexes.map((imageIndex, slotIndex) => {
            const image = images[imageIndex]
            const isSelected = imageIndex === selectedIndex
            const isOverflowSlot = images.length > 4 && slotIndex === 3

            return (
              <button
                key={`${image}-${imageIndex}`}
                type="button"
                className={`relative aspect-square overflow-hidden rounded-lg border-2 bg-surface-warm shadow-card transition ${
                  isSelected ? 'border-brand' : 'border-transparent hover:border-border'
                }`}
                aria-label={`View image ${imageIndex + 1} for ${title}`}
                aria-pressed={isSelected}
                onClick={() => setSelectedIndex(imageIndex)}
              >
                <ProductImage src={image} alt="" className="h-full w-full object-cover" />
                {isOverflowSlot ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-foreground/48 text-base font-black text-white backdrop-blur-[1px] sm:text-sm">
                    {selectedIndex > 3 ? `${selectedIndex + 1}/${images.length}` : `+${hiddenCount}`}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
