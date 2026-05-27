'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { Mail, MessageCircle, Send, X } from 'lucide-react'
import { FormEvent, useEffect, useState } from 'react'
import { emailHref, textHref } from '@/lib/business'

type ChatState = 'idle' | 'sending' | 'sent'
type ContactChannel = 'text' | 'email'

export function ChatbotEmbed() {
  const scriptSrc = process.env.NEXT_PUBLIC_CHATBOT_EMBED_SRC
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<ChatState>('idle')
  const [channel, setChannel] = useState<ContactChannel>('text')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener('modhaus:open-chat', handler)
    return () => window.removeEventListener('modhaus:open-chat', handler)
  }, [])

  if (pathname.startsWith('/admin')) {
    return null
  }

  if (scriptSrc) {
    return <Script src={scriptSrc} strategy="afterInteractive" />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setState('sending')

    const formData = new FormData(event.currentTarget)
    const phone = String(formData.get('phone') || '').trim()
    const email = String(formData.get('email') || '').trim()
    const message = String(formData.get('message') || '').trim()
    const body = new URLSearchParams({
      'form-name': 'modhaus-chat',
      'bot-field': '',
      channel,
      phone,
      email,
      message,
      source: window.location.href,
    })

    try {
      const response = await fetch('/netlify-forms.html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      })

      if (!response.ok) {
        throw new Error('Message failed to send.')
      }

      setState('sent')
      if (channel === 'text') {
        window.location.href = textHref(`Hi ModHaus, ${message}${phone ? `\n\nMy phone: ${phone}` : ''}`)
      } else {
        window.location.href = emailHref('ModHaus inventory request', `${message}${email ? `\n\nMy email: ${email}` : ''}`)
      }
    } catch {
      setState('idle')
      setError('Could not open that channel. Please try the other option.')
    }
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
        <div className="fixed inset-x-0 bottom-20 z-50 mx-auto max-h-[calc(100dvh-6rem)] overflow-y-auto px-3 sm:inset-x-4 sm:bottom-24 sm:max-w-md sm:px-0 md:left-auto md:right-6 md:mx-0">
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
                  className="mt-5 min-h-12 w-full rounded-lg bg-brand px-4 py-3 text-base font-bold text-white hover:bg-brand-dark sm:min-h-11 sm:py-2.5 sm:text-sm"
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
                {error ? <div className="rounded-lg bg-danger-soft p-4 text-sm font-semibold text-danger">{error}</div> : null}
                <div className="grid grid-cols-2 gap-1 rounded-lg bg-surface-warm p-1">
                  <button
                    type="button"
                    onClick={() => setChannel('text')}
                    className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-3 text-base font-bold transition sm:min-h-11 sm:text-sm ${
                      channel === 'text' ? 'bg-foreground text-background shadow-card' : 'text-foreground hover:bg-background'
                    }`}
                    aria-pressed={channel === 'text'}
                  >
                    <MessageCircle className="size-4" aria-hidden="true" />
                    Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('email')}
                    className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-3 text-base font-bold transition sm:min-h-11 sm:text-sm ${
                      channel === 'email' ? 'bg-foreground text-background shadow-card' : 'text-foreground hover:bg-background'
                    }`}
                    aria-pressed={channel === 'email'}
                  >
                    <Mail className="size-4" aria-hidden="true" />
                    Email
                  </button>
                </div>
                {channel === 'text' ? (
                  <label className="grid gap-2 text-base font-semibold sm:text-sm">
                    Phone number
                    <input className="field" name="phone" type="tel" placeholder="(555) 123-4567" required />
                  </label>
                ) : (
                  <label className="grid gap-2 text-base font-semibold sm:text-sm">
                    Email
                    <input className="field" name="email" type="email" placeholder="you@example.com" required />
                  </label>
                )}
                <label className="grid gap-2 text-base font-semibold sm:text-sm">
                  Message
                  <textarea className="field min-h-28 resize-none" name="message" placeholder="Tell us what you need." required />
                </label>
                <button
                  type="submit"
                  disabled={state === 'sending'}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-brand px-4 py-3 text-base font-bold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
                >
                  {state === 'sending' ? 'Sending...' : channel === 'text' ? 'Send text' : 'Send email'}
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
