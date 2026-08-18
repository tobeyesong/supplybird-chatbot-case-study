import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ChatbotEmbed } from '@/components/chatbot-embed'
import { MobileContactBar } from '@/components/mobile-contact-bar'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { business } from '@/lib/business'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: `${business.name} | Building Supply Deals in Orange County, California`,
    template: `%s | ${business.name}`,
  },
  description: 'Browse flooring, doors, roofing, windows, appliances, and job-site supply closeouts in Orange County, California.',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-background text-foreground antialiased">
        <SiteHeader />
        <main className="min-h-screen pb-24 md:pb-0">{children}</main>
        <SiteFooter />
        <MobileContactBar />
        <ChatbotEmbed />
      </body>
    </html>
  )
}
