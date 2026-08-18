import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ChatbotEmbed } from '@/components/chatbot-embed'
import { MobileContactBar } from '@/components/mobile-contact-bar'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { business } from '@/lib/business'
import { absoluteUrl, getSiteUrl } from '@/lib/site-url'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const siteUrl = getSiteUrl()
const siteDescription = 'Shop closeout flooring, doors, roofing, windows, appliances, and building supplies in Santa Ana and Orange County, California.'
const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: business.name,
  title: {
    default: `${business.name} | Building Supply Deals in Orange County, California`,
    template: `%s | ${business.name}`,
  },
  description: siteDescription,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: business.name,
    title: `${business.name} | Building Supply Deals in Orange County, California`,
    description: siteDescription,
    locale: 'en_US',
    images: [
      {
        url: '/supplybird-assets/flooring.png',
        alt: 'Wood-look flooring available from ModHaus in Santa Ana, California',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${business.name} | Building Supply Deals in Orange County, California`,
    description: siteDescription,
    images: ['/supplybird-assets/flooring.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: googleVerification ? { google: googleVerification } : undefined,
  icons: {
    icon: '/favicon.svg',
  },
}

const socialProfiles = [business.instagramUrl, business.facebookUrl].filter((url) => url !== '#')
const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HomeGoodsStore',
  '@id': `${siteUrl.origin}/#business`,
  name: business.name,
  description: business.tagline,
  url: siteUrl.origin,
  logo: absoluteUrl('/modhaus-mark.svg'),
  image: absoluteUrl('/supplybird-assets/flooring.png'),
  telephone: business.phoneNumber,
  email: business.emailAddress,
  address: {
    '@type': 'PostalAddress',
    ...business.addressDetails,
  },
  areaServed: {
    '@type': 'AdministrativeArea',
    name: 'Orange County, California',
  },
  currenciesAccepted: 'USD',
  paymentAccepted: business.paymentMethods.join(', '),
  priceRange: '$',
  sameAs: socialProfiles.length ? socialProfiles : undefined,
}
const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${siteUrl.origin}/#website`,
  url: siteUrl.origin,
  name: business.name,
  description: siteDescription,
  publisher: {
    '@id': `${siteUrl.origin}/#business`,
  },
  inLanguage: 'en-US',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-background text-foreground antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd).replace(/</g, '\\u003c') }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd).replace(/</g, '\\u003c') }} />
        <SiteHeader />
        <main className="min-h-screen pb-24 md:pb-0">{children}</main>
        <SiteFooter />
        <MobileContactBar />
        <ChatbotEmbed />
      </body>
    </html>
  )
}
