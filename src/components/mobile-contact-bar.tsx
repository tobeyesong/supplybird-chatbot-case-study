'use client'

import { MessageCircle, Phone } from 'lucide-react'
import { phoneHref } from '@/lib/business'

export function MobileContactBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/96 px-4 py-3 shadow-float backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md gap-2">
        <a className="inline-flex min-h-12 min-w-0 flex-1 basis-0 items-center justify-center gap-1.5 rounded-lg bg-foreground px-2 text-sm font-bold text-background" href={phoneHref()}>
          <Phone className="size-4 shrink-0" aria-hidden="true" />
          Call
        </a>
        <button
          type="button"
          className="inline-flex min-h-12 min-w-0 flex-1 basis-0 items-center justify-center gap-1.5 rounded-lg bg-brand px-2 text-sm font-bold text-white"
          onClick={() => window.dispatchEvent(new Event('modhaus:open-chat'))}
        >
          <MessageCircle className="size-4 shrink-0" aria-hidden="true" />
          Chat
        </button>
      </div>
    </div>
  )
}
