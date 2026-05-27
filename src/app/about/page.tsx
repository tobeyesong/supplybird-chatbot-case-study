import type { Metadata } from 'next'
import Image from 'next/image'
import { Clock, MapPin, Phone } from 'lucide-react'
import { ChatOpenButton } from '@/components/chat-open-button'
import { business, phoneHref } from '@/lib/business'

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about ModHaus, an Orange County, California building supply reseller.',
}

export default function AboutPage() {
  return (
    <>
      <section className="section-y">
        <div className="page-container grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-brand-dark">{business.city}</p>
            <h1 className="mt-4 text-4xl font-black tracking-normal md:text-6xl">Local building supply inventory without the big-box runaround.</h1>
            <p className="mt-6 text-lg leading-8 text-muted">
              ModHaus helps contractors, landlords, and homeowners find practical closeout materials for flooring, decking, roofing, windows,
              appliances, and job-site supplies.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ChatOpenButton label="Ask about inventory" />
              <a href={phoneHref()} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-foreground px-5 py-3 text-sm font-bold text-background hover:bg-foreground/88">
                <Phone className="size-4" aria-hidden="true" />
                Call {business.phoneDisplay}
              </a>
            </div>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-surface-warm shadow-card">
            <Image
              src="/supplybird-assets/decking.png"
              alt="Stacked decking inventory"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              loading="eager"
              priority
            />
          </div>
        </div>
      </section>

      <section className="section-y bg-surface-warm">
        <div className="page-container grid gap-5 md:grid-cols-3">
          <div className="surface-card p-6">
            <MapPin className="size-6 text-brand" aria-hidden="true" />
            <h2 className="mt-5 text-xl font-black">Location</h2>
            <p className="mt-2 leading-7 text-muted">{business.address}</p>
          </div>
          <div className="surface-card p-6">
            <Clock className="size-6 text-brand" aria-hidden="true" />
            <h2 className="mt-5 text-xl font-black">Hours</h2>
            <p className="mt-2 leading-7 text-muted">{business.hours}</p>
          </div>
          <div className="surface-card p-6">
            <Phone className="size-6 text-brand" aria-hidden="true" />
            <h2 className="mt-5 text-xl font-black">Best way to check stock</h2>
            <p className="mt-2 leading-7 text-muted">Send a product name, photo, or room size through chat or phone.</p>
          </div>
        </div>
      </section>
    </>
  )
}
