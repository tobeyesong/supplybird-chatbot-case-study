'use client'

import { Trash2 } from 'lucide-react'

export function DeleteProductForm({
  productTitle,
  action,
}: {
  productTitle: string
  action: () => Promise<void>
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(`Delete ${productTitle}? This cannot be undone.`)) {
          event.preventDefault()
        }
      }}
    >
      <button
        className="inline-flex size-10 items-center justify-center rounded-lg bg-danger-soft text-danger hover:bg-danger-soft/70"
        type="submit"
        aria-label={`Delete ${productTitle}`}
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
    </form>
  )
}
