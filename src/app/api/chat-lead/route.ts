import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const MAX_MESSAGE_LENGTH = 900
const MAX_SOURCE_LENGTH = 300

function cleanText(value: unknown, maxLength: number) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, maxLength)
}

function hasValidEmailShape(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function hasUsablePhoneShape(phone: string) {
  return phone.replace(/\D/g, '').length >= 10
}

function looksLikeSpam(message: string) {
  const urls = message.match(/https?:\/\/|www\./gi) ?? []
  return urls.length > 2
}

async function sendTwilioSms(body: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_FROM_NUMBER || process.env.NEXT_PUBLIC_TEXT_NUMBER
  const ownerNumber = process.env.TWILIO_OWNER_TO_NUMBER

  if (!accountSid || !authToken || !fromNumber || !ownerNumber) {
    return { ok: false, skipped: true }
  }

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64')
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      To: ownerNumber,
      From: fromNumber,
      Body: body.slice(0, 1500),
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Twilio lead SMS failed', response.status, error.slice(0, 500))
    return { ok: false, skipped: false }
  }

  return { ok: true, skipped: false }
}

export async function POST(request: Request) {
  let payload: Record<string, unknown>

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const honeypot = cleanText(payload.botField ?? payload['bot-field'], 100)
  if (honeypot) {
    return NextResponse.json({ ok: true })
  }

  const phone = cleanText(payload.phone, 40)
  const email = cleanText(payload.email, 120).toLowerCase()
  const message = cleanText(payload.message, MAX_MESSAGE_LENGTH)
  const source = cleanText(payload.source, MAX_SOURCE_LENGTH)

  if (!phone || !email || !message || !hasUsablePhoneShape(phone) || !hasValidEmailShape(email) || looksLikeSpam(message)) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const smsBody = [
    'New ModHaus chat lead',
    `Phone: ${phone}`,
    `Email: ${email}`,
    `Message: ${message}`,
    source ? `Source: ${source}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  const result = await sendTwilioSms(smsBody)

  if (!result.ok && !result.skipped) {
    return NextResponse.json({ ok: false }, { status: 502 })
  }

  return NextResponse.json({ ok: true, smsConfigured: !result.skipped })
}
