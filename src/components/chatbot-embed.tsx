'use client'

import Script from 'next/script'
import { MessageCircle, Send, X } from 'lucide-react'
import { FormEvent, useEffect, useState } from 'react'

type ChatState = 'idle' | 'sent'

export function ChatbotEmbed() {
  const scriptSrc = process.env.NEXT_PUBLIC_CHATBOT_EMBED_SRC
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<ChatState>('idle')

  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener('modhaus:open-chat', handler)
    return () => window.removeEventListener('modhaus:open-chat', handler)
  }, [])

  if (scriptSrc) {
    return <Script src={scriptSrc} strategy="afterInteractive" />
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const phone = String(formData.get('phone') || '').trim()
    const email = String(formData.get('email') || '').trim()
    const message = String(formData.get('message') || '').trim()

    console.info('ModHaus chat message', { phone, email, message })
    setState('sent')
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 hidden size-14 items-center justify-center rounded-full bg-brand text-white shadow-float transition hover:bg-brand-dark md:inline-flex"
        aria-label="Chat"
      >
        <MessageCircle className="size-6" aria-hidden="true" />
      </button>

      {open ? (
        <div className="fixed inset-x-4 bottom-24 z-50 mx-auto max-h-[calc(100dvh-8rem)] max-w-md overflow-y-auto md:bottom-24 md:left-auto md:right-6 md:mx-0">
          <div className="overflow-hidden rounded-lg bg-surface shadow-float">
            <div className="flex items-center justify-between bg-foreground px-5 py-4 text-background">
              <div>
                <p className="font-bold">Chat</p>
                <p className="text-base text-background/70 sm:text-sm">Phone, email, and your question.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex size-9 items-center justify-center rounded-lg bg-background/10 text-background hover:bg-background/18"
                aria-label="Close chat"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            {state === 'sent' ? (
              <div className="p-5">
                <p className="text-lg font-bold">Okay, thank you for your message.</p>
                <p className="mt-2 text-base text-muted">We will reply shortly.</p>
                <button
                  type="button"
                  className="mt-5 min-h-11 w-full rounded-lg bg-brand px-4 py-2.5 text-base font-bold text-white hover:bg-brand-dark sm:text-sm"
                  onClick={() => {
                    setState('idle')
                    setOpen(false)
                  }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form className="grid gap-4 p-5" onSubmit={handleSubmit}>
                <label className="grid gap-2 text-base font-semibold sm:text-sm">
                  Phone number
                  <input className="field" name="phone" type="tel" placeholder="(714) 555-0138" required />
                </label>
                <label className="grid gap-2 text-base font-semibold sm:text-sm">
                  Email
                  <input className="field" name="email" type="email" placeholder="you@example.com" required />
                </label>
                <label className="grid gap-2 text-base font-semibold sm:text-sm">
                  Message
                  <textarea className="field min-h-28 resize-none" name="message" placeholder="Tell us what you need." required />
                </label>
                <button
                  type="submit"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-brand px-4 py-3 text-base font-bold text-white hover:bg-brand-dark sm:text-sm"
                >
                  Send message
                  <Send className="size-4" aria-hidden="true" />
                </button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  )
}
