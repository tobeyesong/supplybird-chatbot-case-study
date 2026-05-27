'use client'

import { MessageCircle } from 'lucide-react'

export function ChatOpenButton({ label = 'Message us' }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event('modhaus:open-chat'))}
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 text-base font-bold text-white shadow-card transition hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:w-auto sm:text-sm"
    >
      <MessageCircle className="size-4" aria-hidden="true" />
      {label}
    </button>
  )
}
