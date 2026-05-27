import Image from 'next/image'
import Link from 'next/link'
import { Clock, MapPin, Phone } from 'lucide-react'
import { business, phoneHref } from '@/lib/business'
import { categories } from '@/lib/catalog-data'

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-foreground pb-24 text-background md:pb-0">
      <div className="page-container grid gap-10 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div className="max-w-md">
          <div className="flex items-center gap-3">
            <Image src="/modhaus-mark.svg" alt="" width={44} height={44} className="rounded-lg" />
            <div>
              <p className="font-bold">{business.name}</p>
              <p className="text-sm text-background/70">{business.city}</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-6 text-background/72">{business.tagline}</p>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-background">Shop</h2>
          <div className="mt-4 grid gap-3 text-sm text-background/72">
            {categories.map((category) => (
              <Link key={category.slug} href={`/shop/${category.slug}`} className="hover:text-background">
                {category.name}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-background">Visit</h2>
          <div className="mt-4 grid gap-3 text-sm text-background/72">
            <p className="inline-flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
              {business.address}
            </p>
            <p className="inline-flex items-start gap-2">
              <Clock className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
              {business.hours}
            </p>
            <a href={phoneHref()} className="inline-flex items-center gap-2 hover:text-background">
              <Phone className="size-4 text-brand" aria-hidden="true" />
              {business.phoneDisplay}
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-background/10">
        <div className="page-container py-5 text-sm text-background/56">
          <p>© {new Date().getFullYear()} {business.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
