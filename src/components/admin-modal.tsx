'use client'

import type { ReactNode } from 'react'
import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'

type AdminModalTone = 'default' | 'danger'

type AdminModalProps = {
  open: boolean
  onClose: () => void
  eyebrow: string
  title: string
  description?: string
  tone?: AdminModalTone
  children: ReactNode
}

export function AdminModal({
  open,
  onClose,
  eyebrow,
  title,
  description,
  tone = 'default',
  children,
}: AdminModalProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const isDanger = tone === 'danger'

  useEffect(() => {
    if (!open) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusFrame = window.requestAnimationFrame(() => {
      panelRef.current?.focus()
    })

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.cancelAnimationFrame(focusFrame)
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose, open])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto">
      <div className="flex min-h-dvh items-center justify-center px-4 py-8">
        <button
          type="button"
          aria-label="Close modal"
          className="fixed inset-0 bg-foreground/60 backdrop-blur-[2px]"
          onClick={onClose}
        />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className="relative w-full max-w-xl overflow-hidden rounded-lg border border-border bg-background text-left shadow-float focus:outline-none"
        >
          <div className={isDanger ? 'h-1 bg-danger' : 'h-1 bg-brand'} />
          <div className="bg-foreground p-5 text-background sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={isDanger ? 'text-xs font-bold uppercase tracking-wide text-red-100' : 'text-xs font-bold uppercase tracking-wide text-brand-soft'}>
                  {eyebrow}
                </p>
                <h2 id={titleId} className="mt-3 text-2xl font-black tracking-normal text-white">
                  {title}
                </h2>
                {description ? <p className="mt-2 max-w-md text-sm leading-6 text-background/72">{description}</p> : null}
              </div>
              <button
                type="button"
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/16"
                aria-label="Close modal"
                onClick={onClose}
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="bg-surface p-5 sm:p-6">{children}</div>
        </div>
      </div>
    </div>
  )
}
