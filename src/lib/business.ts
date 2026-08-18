const defaultPhoneNumber = '+19499430957'
const defaultTextNumber = '+19499430957'
const defaultEmailAddress = 'modhausllc@gmail.com'
const phoneNumber = process.env.NEXT_PUBLIC_PHONE_NUMBER || defaultPhoneNumber
const textNumber = process.env.NEXT_PUBLIC_TEXT_NUMBER || defaultTextNumber
const emailAddress = process.env.NEXT_PUBLIC_EMAIL_ADDRESS || defaultEmailAddress

function formatPhoneDisplay(phone: string) {
  const digits = phone.replace(/\D/g, '')
  const tenDigitNumber = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits

  if (tenDigitNumber.length !== 10) return phone

  return `(${tenDigitNumber.slice(0, 3)}) ${tenDigitNumber.slice(3, 6)}-${tenDigitNumber.slice(6)}`
}

export const business = {
  name: 'ModHaus',
  tagline: 'Flooring, doors, roofing, and home supply closeouts.',
  address: '1516 E Edinger Ave Ste D, Santa Ana, CA 92705',
  city: 'Santa Ana, CA 92705',
  hours: 'By appointment only',
  phoneDisplay: formatPhoneDisplay(phoneNumber),
  phoneNumber,
  textDisplay: formatPhoneDisplay(textNumber),
  textNumber,
  emailAddress,
  instagramUrl: '#',
  facebookUrl: '#',
}

export function phoneHref() {
  return `tel:${business.phoneNumber}`
}

export function textHref(body?: string) {
  const encodedBody = body ? `?body=${encodeURIComponent(body)}` : ''
  return `sms:${business.textNumber}${encodedBody}`
}

export function emailHref(subject: string, body: string) {
  const params = new URLSearchParams({ subject, body })
  return `mailto:${business.emailAddress}?${params.toString()}`
}
