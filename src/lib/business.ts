const defaultPhoneNumber = '+17145550138'

export const business = {
  name: 'ModHaus',
  tagline: 'Flooring, decking, roofing, and home supply closeouts.',
  address: 'Orange County, California',
  city: 'Orange County, California',
  hours: 'Open daily, 10:00 AM - 6:00 PM',
  phoneDisplay: '(714) 555-0138',
  phoneNumber: process.env.NEXT_PUBLIC_PHONE_NUMBER || defaultPhoneNumber,
  instagramUrl: '#',
  facebookUrl: '#',
}

export function phoneHref() {
  return `tel:${business.phoneNumber}`
}
