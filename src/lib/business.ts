const defaultPhoneNumber = '+19499430957'
const defaultTextNumber = '+19499430957'
const phoneNumber = process.env.NEXT_PUBLIC_PHONE_NUMBER || defaultPhoneNumber
const textNumber = process.env.NEXT_PUBLIC_TEXT_NUMBER || defaultTextNumber

function formatPhoneDisplay(phone: string) {
  const digits = phone.replace(/\D/g, '')
  const tenDigitNumber = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits

  if (tenDigitNumber.length !== 10) return phone

  return `(${tenDigitNumber.slice(0, 3)}) ${tenDigitNumber.slice(3, 6)}-${tenDigitNumber.slice(6)}`
}

export const business = {
  name: 'ModHaus',
  tagline: 'Flooring, decking, roofing, and home supply closeouts.',
  address: 'Orange County, California',
  city: 'Orange County, California',
  hours: 'Open daily, 10:00 AM - 6:00 PM',
  phoneDisplay: formatPhoneDisplay(phoneNumber),
  phoneNumber,
  textDisplay: formatPhoneDisplay(textNumber),
  textNumber,
  instagramUrl: '#',
  facebookUrl: '#',
}

export function phoneHref() {
  return `tel:${business.phoneNumber}`
}

export function textHref() {
  return `sms:${business.textNumber}`
}
