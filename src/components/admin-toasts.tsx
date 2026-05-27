'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Info, Trash2, X } from 'lucide-react'

export type AdminToastTone = 'success' | 'info' | 'danger' | 'error'

export type AdminToastMessage = {
  id: string
  tone: AdminToastTone
  title: string
  message: string
}

type AdminToastsProps = {
  toast: AdminToastMessage | null
}

const toastStyles: Record<AdminToastTone, { iconWrap: string; Icon: typeof CheckCircle2 }> = {
  success: {
    iconWrap: 'bg-success-soft text-success',
    Icon: CheckCircle2,
  },
  info: {
    iconWrap: 'bg-brand-soft text-brand-dark',
    Icon: Info,
  },
  danger: {
    iconWrap: 'bg-danger-soft text-danger',
    Icon: Trash2,
  },
  error: {
    iconWrap: 'bg-danger-soft text-danger',
    Icon: AlertTriangle,
  },
}

export function AdminToasts({ toast }: AdminToastsProps) {
  const [dismissedId, setDismissedId] = useState<string | null>(null)
  const isVisible = Boolean(toast && toast.id !== dismissedId)

  useEffect(() => {
    if (!toast) {
      return
    }

    const timer = window.setTimeout(() => {
      setDismissedId(toast.id)
    }, 3500)

    return () => {
      window.clearTimeout(timer)
    }
  }, [toast])

  if (!toast || !isVisible) {
    return null
  }

  const { Icon, iconWrap } = toastStyles[toast.tone]

  return (
    <div className="fixed inset-x-4 top-4 z-[90] flex justify-center sm:inset-x-auto sm:right-4 sm:justify-end" aria-live="polite">
      <div className="flex w-full max-w-md items-start gap-3 rounded-lg border border-border bg-surface p-4 text-foreground shadow-float">
        <div className={`inline-flex size-10 shrink-0 items-center justify-center rounded-lg ${iconWrap}`}>
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black">{toast.title}</p>
          <p className="mt-1 text-sm leading-6 text-muted">{toast.message}</p>
        </div>
        <button
          type="button"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface-warm hover:text-foreground"
          aria-label="Dismiss notification"
          onClick={() => setDismissedId(toast.id)}
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
