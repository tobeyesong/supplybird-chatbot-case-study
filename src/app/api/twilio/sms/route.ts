import crypto from 'node:crypto'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function twiml(message: string) {
  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(message)}</Message></Response>`, {
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
  })
}

function getPublicRequestUrl(request: Request) {
  const currentUrl = new URL(request.url)
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || currentUrl.host
  const protocol = request.headers.get('x-forwarded-proto') || currentUrl.protocol.replace(':', '') || 'https'

  return `${protocol}://${host}${currentUrl.pathname}${currentUrl.search}`
}

function isValidTwilioSignature(request: Request, params: URLSearchParams) {
  const authToken = process.env.TWILIO_WEBHOOK_AUTH_TOKEN || process.env.TWILIO_AUTH_TOKEN
  const signature = request.headers.get('x-twilio-signature')

  if (!authToken || !signature) return false

  const signedData = Array.from(params.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .reduce((data, [key, value]) => `${data}${key}${value}`, getPublicRequestUrl(request))

  const expected = crypto.createHmac('sha1', authToken).update(signedData).digest('base64')
  const expectedBuffer = Buffer.from(expected)
  const actualBuffer = Buffer.from(signature)

  return expectedBuffer.length === actualBuffer.length && crypto.timingSafeEqual(expectedBuffer, actualBuffer)
}

function hasValidWebhookSecret(request: Request) {
  const webhookSecret = process.env.TWILIO_WEBHOOK_SECRET
  if (!webhookSecret) return false

  const requestSecret = new URL(request.url).searchParams.get('secret')
  if (!requestSecret) return false

  const expectedBuffer = Buffer.from(webhookSecret)
  const actualBuffer = Buffer.from(requestSecret)

  return expectedBuffer.length === actualBuffer.length && crypto.timingSafeEqual(expectedBuffer, actualBuffer)
}

function isAuthorizedWebhook(request: Request, params: URLSearchParams) {
  if (hasValidWebhookSecret(request)) return true
  if (process.env.TWILIO_VALIDATE_WEBHOOKS === 'false') return true

  return isValidTwilioSignature(request, params)
}

async function submitSmsLead(params: URLSearchParams) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  const from = String(params.get('From') || '').trim()
  const body = String(params.get('Body') || '').trim().slice(0, 900)

  if (!siteUrl || !from || !body) return

  await fetch(`${siteUrl.replace(/\/$/, '')}/netlify-forms.html`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      'form-name': 'modhaus-chat',
      'bot-field': '',
      phone: from,
      email: '',
      message: body,
      source: 'SMS via Twilio',
    }),
  }).catch((error) => {
    console.error('Failed to submit inbound SMS lead', error)
  })
}

export async function POST(request: Request) {
  const rawBody = await request.text()
  const params = new URLSearchParams(rawBody)

  if (!isAuthorizedWebhook(request, params)) {
    return NextResponse.json({ ok: false }, { status: 403 })
  }

  await submitSmsLead(params)

  return twiml('Okay, thank you for your message. We will reply shortly.')
}
