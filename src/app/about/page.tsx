import type { Metadata } from 'next'
import Image from 'next/image'
import { CheckCircle2, Clock, MapPin, MessageSquare, PackageSearch, Ruler } from 'lucide-react'
import { ChatOpenButton } from '@/components/chat-open-button'
import { business, textHref } from '@/lib/business'

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about ModHaus, an Orange County, California building supply reseller.',
}

const buyingSteps = [
  {
    step: '01',
    title: 'Browse current categories',
    description: 'Start with flooring, decking, roofing, or other building supply closeouts and compare the available listings.',
  },
  {
    step: '02',
    title: 'Estimate the material',
    description: 'Use the product calculator to estimate square footage, box count, and a rough material total before reaching out.',
  },
  {
    step: '03',
    title: 'Confirm stock by message',
    description: 'Send the product name, room size, or a photo. ModHaus confirms availability and the next pickup window.',
  },
]

const inventoryNotes = [
  {
    title: 'Limited lots',
    description: 'Inventory can move quickly, so listings are meant to help shoppers narrow down what is worth checking first.',
    icon: PackageSearch,
  },
  {
    title: 'Estimate-ready details',
    description: 'Products can include price, coverage per box, photos, stock status, and the unit needed for quick job math.',
    icon: Ruler,
  },
  {
    title: 'Local pickup flow',
    description: 'The site is built for in-person cash purchases, with chat and text as the main way to confirm the details.',
    icon: CheckCircle2,
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-surface-warm">
      <section className="section-y bg-background">
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
              <a href={textHref()} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-foreground px-5 py-3 text-sm font-bold text-background hover:bg-foreground/88">
                <MessageSquare className="size-4" aria-hidden="true" />
                Text {business.phoneDisplay}
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

      <section className="bg-surface-warm py-8 md:py-10">
        <div className="page-container grid gap-5 md:grid-cols-3">
          <div className="surface-card p-5 md:p-6">
            <MapPin className="size-6 text-brand" aria-hidden="true" />
            <h2 className="mt-5 text-xl font-black">Location</h2>
            <p className="mt-2 leading-7 text-muted">{business.address}</p>
          </div>
          <div className="surface-card p-5 md:p-6">
            <Clock className="size-6 text-brand" aria-hidden="true" />
            <h2 className="mt-5 text-xl font-black">Hours</h2>
            <p className="mt-2 leading-7 text-muted">{business.hours}</p>
          </div>
          <div className="surface-card p-5 md:p-6">
            <MessageSquare className="size-6 text-brand" aria-hidden="true" />
            <h2 className="mt-5 text-xl font-black">Best way to check stock</h2>
            <p className="mt-2 leading-7 text-muted">Send a product name, photo, or room size through chat or text.</p>
          </div>
        </div>
      </section>

      <section className="bg-surface-warm pb-14 md:pb-20">
        <div className="page-container grid gap-10 lg:grid-cols-[0.82fr_1fr] lg:items-start">
          <div className="max-w-xl">
            <p className="text-sm font-bold uppercase tracking-wide text-brand-dark">How ModHaus works</p>
            <h2 className="mt-3 text-3xl font-black tracking-normal md:text-5xl">A short path from browsing to pickup.</h2>
            <p className="mt-5 text-lg leading-8 text-muted">
              The goal is to keep the buying process simple for local projects. Shoppers can inspect what is available, estimate the material, then
              message before making the drive.
            </p>
          </div>

          <div className="grid gap-4">
            {buyingSteps.map((item) => (
              <div key={item.step} className="surface-card grid gap-3 p-5 md:grid-cols-[4rem_1fr] md:p-6">
                <p className="font-mono text-sm font-black text-brand-dark">{item.step}</p>
                <div>
                  <h3 className="text-lg font-black">{item.title}</h3>
                  <p className="mt-2 leading-7 text-muted">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="page-container mt-10 grid gap-5 md:grid-cols-3">
          {inventoryNotes.map((item) => (
            <div key={item.title} className="rounded-lg border border-border bg-background p-5 md:p-6">
              <item.icon className="size-6 text-brand" aria-hidden="true" />
              <h3 className="mt-5 text-lg font-black">{item.title}</h3>
              <p className="mt-2 leading-7 text-muted">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
