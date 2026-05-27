'use client'

import { AlertTriangle, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { AdminModal } from '@/components/admin-modal'

function DeleteSubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-danger px-5 py-2.5 text-sm font-bold text-white hover:bg-danger/88 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      type="submit"
      disabled={pending}
    >
      {pending ? 'Deleting...' : 'Delete product'}
    </button>
  )
}

export function DeleteProductForm({
  productTitle,
  action,
}: {
  productTitle: string
  action: () => Promise<void>
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        className="inline-flex size-10 items-center justify-center rounded-lg bg-danger-soft text-danger hover:bg-danger-soft/70"
        type="button"
        aria-label={`Delete ${productTitle}`}
        onClick={() => setIsOpen(true)}
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>

      <AdminModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        eyebrow="Confirm delete"
        title="Delete product"
        description="Use this only when the listing should be removed from the catalog."
        tone="danger"
      >
        <div className="flex items-start gap-4">
          <div className="inline-flex size-12 shrink-0 items-center justify-center rounded-lg bg-danger-soft text-danger">
            <AlertTriangle className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="font-black">Permanent change</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Delete <span className="font-bold text-foreground">{productTitle}</span>? This removes the product from the admin inventory and public catalog.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-surface-warm px-5 py-2.5 text-sm font-bold text-foreground hover:bg-brand-soft sm:w-auto"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </button>
          <form action={action}>
            <DeleteSubmitButton />
          </form>
        </div>
      </AdminModal>
    </>
  )
}
