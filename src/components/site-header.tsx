'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown, Hammer, Info, Layers, Menu, MessageCircle, MessageSquare, Package, Phone, Warehouse, X } from 'lucide-react'
import { useState } from 'react'
import { business, phoneHref, textHref } from '@/lib/business'
import { categories } from '@/lib/catalog-data'
import type { ProductCategory } from '@/lib/types'

const categoryIcons = {
  flooring: Layers,
  decking: Warehouse,
  roofing: Hammer,
  other: Package,
} satisfies Record<ProductCategory, typeof Layers>

function openChatbot() {
  window.dispatchEvent(new Event('modhaus:open-chat'))
}

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur">
      <div className="bg-foreground text-background">
        <div className="page-container flex items-center justify-between gap-4 py-2 text-sm">
          <p className="hidden text-background/78 md:block">{business.address}</p>
          <p className="text-background/78">{business.hours}</p>
          <a href={phoneHref()} className="hidden items-center gap-2 font-semibold text-background md:inline-flex">
            <Phone className="size-4 text-brand" aria-hidden="true" />
            {business.phoneDisplay}
          </a>
        </div>
      </div>

      <nav className="page-container flex min-h-18 items-center justify-between gap-5 py-4">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label={`${business.name} home`}>
          <Image src="/modhaus-mark.svg" alt="" width={44} height={44} className="rounded-lg" priority />
            <span className="min-w-0">
              <span className="block text-base font-bold leading-5 tracking-normal text-foreground">{business.name}</span>
              <span className="hidden text-sm leading-5 text-muted sm:block">Orange County Building Supply</span>
            </span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          <Link href="/" className="text-sm font-semibold text-foreground/80 hover:text-foreground">
            Home
          </Link>

          <div className="group relative">
            <button className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground/80 hover:text-foreground">
              Shop
              <ChevronDown className="size-4" aria-hidden="true" />
            </button>
            <div className="invisible absolute left-1/2 top-full w-72 -translate-x-1/2 pt-4 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              <div className="surface-card grid gap-1 p-2">
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/shop/${category.slug}`}
                    className="flex items-start gap-3 rounded-md px-3 py-2.5 text-sm hover:bg-surface-warm"
                  >
                    {(() => {
                      const Icon = categoryIcons[category.slug]
                      return (
                        <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-dark">
                          <Icon className="size-4" aria-hidden="true" />
                        </span>
                      )
                    })()}
                    <span>
                      <span className="block font-semibold text-foreground">{category.name}</span>
                      <span className="block text-muted">{category.startingPrice}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link href="/about" className="text-sm font-semibold text-foreground/80 hover:text-foreground">
            About
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openChatbot}
            className="hidden min-h-11 items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:inline-flex"
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            Chat
          </button>
          <a
            href={textHref()}
            className="hidden min-h-11 items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-bold text-background transition hover:bg-foreground/88 md:inline-flex"
          >
            <MessageSquare className="size-4" aria-hidden="true" />
            Text
          </a>
          <button
            type="button"
            onClick={() => setMobileOpen((isOpen) => !isOpen)}
            className="inline-flex size-11 items-center justify-center rounded-lg bg-surface text-foreground shadow-card md:hidden"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {mobileOpen ? (
        <div className="border-t border-border bg-background md:hidden">
          <div className="page-container grid gap-2 py-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/shop/${category.slug}`}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold hover:bg-surface-warm"
                onClick={() => setMobileOpen(false)}
              >
                {(() => {
                  const Icon = categoryIcons[category.slug]
                  return <Icon className="size-4 text-brand" aria-hidden="true" />
                })()}
                {category.name}
              </Link>
            ))}
            <Link href="/about" className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold hover:bg-surface-warm" onClick={() => setMobileOpen(false)}>
              <Info className="size-4 text-brand" aria-hidden="true" />
              About
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  )
}
