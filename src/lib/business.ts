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
  hours: 'Appointment only — no set business hours',
  appointmentNotice: 'Please do not arrive without a confirmed appointment, as we do not maintain set business hours and want to ensure someone is available to assist you.',
  paymentMethods: ['Cash', 'Zelle', 'Card'],
  paymentNotice: 'A 3% card processing fee applies to card payments. Cash and Zelle payments are not subject to this fee.',
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

export function googleMapsHref() {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(business.address)}`
}

export function appleMapsHref() {
  return `https://maps.apple.com/?daddr=${encodeURIComponent(business.address)}&dirflg=d`
}

export function textHref(body?: string) {
  const encodedBody = body ? `?body=${encodeURIComponent(body)}` : ''
  return `sms:${business.textNumber}${encodedBody}`
}

export function emailHref(subject: string, body: string) {
  const params = new URLSearchParams({ subject, body })
  return `mailto:${business.emailAddress}?${params.toString()}`
}
