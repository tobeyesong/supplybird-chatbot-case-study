import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Clock, Hammer, Layers, MapPin, MessageSquare, Package, Phone, Warehouse } from 'lucide-react'
import { ChatOpenButton } from '@/components/chat-open-button'
import { ProductCard } from '@/components/product-card'
import { business, phoneHref, textHref } from '@/lib/business'
import { getCategoriesWithSettings, getProducts } from '@/lib/catalog'
import type { ProductCategory } from '@/lib/types'

const categoryIcons = {
  flooring: Layers,
  decking: Warehouse,
  roofing: Hammer,
  other: Package,
} satisfies Record<ProductCategory, typeof Layers>

export const revalidate = 60

export default async function HomePage() {
  const featuredProducts = await getProducts({ featured: true, limit: 4 })
  const categories = await getCategoriesWithSettings()

  return (
    <>
      <section className="relative min-h-[560px] overflow-hidden bg-foreground text-background sm:min-h-[620px]">
        <Image
          src="/supplybird-assets/flooring.png"
          alt="Warm wood-look flooring in a finished room"
          fill
          sizes="100vw"
          className="object-cover opacity-42"
          loading="eager"
          priority
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(26_26_26/0.92),rgb(26_26_26/0.64),rgb(26_26_26/0.22))]" />
        <div className="page-container relative flex min-h-[560px] items-center py-16 sm:min-h-[620px] sm:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-wide text-brand-soft">{business.city} closeout materials</p>
            <h1 className="mt-5 text-4xl font-black leading-[1.04] tracking-normal text-white sm:text-5xl md:text-7xl">
              <span className="block sm:inline">Flooring, decking,</span>{' '}
              <span className="block sm:inline">and building supplies</span>{' '}
              <span className="block sm:inline">priced for the job.</span>
            </h1>
            <p className="mt-6 max-w-[22rem] text-base leading-7 text-background/76 sm:max-w-2xl sm:text-lg sm:leading-8">
              Browse current ModHaus inventory, estimate coverage, then call or chat to confirm what is still in stock.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ChatOpenButton label="Need an estimate?" />
              <Link
                href="/shop/flooring"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-background px-5 py-3 text-base font-bold text-foreground shadow-card transition hover:bg-brand-soft sm:w-auto sm:text-sm"
              >
                Browse products
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-y bg-background">
        <div className="page-container">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-wide text-brand-dark">Shop by category</p>
              <h2 className="mt-3 text-3xl font-black tracking-normal md:text-5xl">Start with the material type.</h2>
            </div>
            <p className="max-w-md text-base leading-7 text-muted">
              Pricing changes with closeout lots, so every category points shoppers toward a quick stock check before they drive in.
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-6 lg:grid-rows-2">
            {categories.map((category, index) => (
              <div key={category.slug} className={`flex p-px ${index === 0 || index === 3 ? 'lg:col-span-4' : 'lg:col-span-2'}`}>
                <Link className="group w-full overflow-hidden rounded-lg bg-surface shadow-card outline outline-1 outline-border/60" href={`/shop/${category.slug}`}>
                  <div className="relative h-52 overflow-hidden bg-foreground sm:h-64">
                    <Image
                      src={category.image}
                      alt=""
                      fill
                      sizes={index === 0 || index === 3 ? '(min-width: 1024px) 66vw, 100vw' : '(min-width: 1024px) 33vw, 100vw'}
                      className="object-cover opacity-72 transition duration-300 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(26_26_26/0.04),rgb(26_26_26/0.76))]" />
                    <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-background px-3 py-1.5 text-sm font-bold text-foreground shadow-card">
                      {(() => {
                        const Icon = categoryIcons[category.slug]
                        return <Icon className="size-4 text-brand" aria-hidden="true" />
                      })()}
                      {category.startingPrice}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-black tracking-normal">{category.name}</h3>
                    <p className="mt-2 text-base leading-7 text-muted sm:text-sm sm:leading-6">{category.description}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-y bg-surface-warm">
        <div className="page-container">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-brand-dark">Featured inventory</p>
              <h2 className="mt-3 text-3xl font-black tracking-normal md:text-5xl">Current deals worth checking first.</h2>
            </div>
            <Link href="/shop/flooring" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-foreground px-5 py-3 text-base font-bold text-background hover:bg-foreground/88 sm:w-fit sm:text-sm">
              View catalog
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-y bg-background">
        <div className="page-container grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-lg bg-foreground p-8 text-background shadow-card md:p-10">
            <p className="text-sm font-bold uppercase tracking-wide text-brand-soft">Need an estimate?</p>
            <h2 className="mt-4 text-3xl font-black tracking-normal text-white md:text-5xl">Send the room size or product name and get a stock check.</h2>
            <p className="mt-5 max-w-2xl text-background/74">
              ModHaus handles purchases in person. Use chat or text to confirm price, availability, and pickup timing.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ChatOpenButton label="Chat" />
              <a href={textHref()} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-background/12 px-5 py-3 text-base font-bold text-background hover:bg-background/18 sm:w-auto sm:text-sm">
                <MessageSquare className="size-4" aria-hidden="true" />
                Text
              </a>
            </div>
          </div>

          <div className="surface-card grid content-between gap-8 p-8 md:p-10">
            <div>
              <h2 className="text-2xl font-black">Location and hours</h2>
              <div className="mt-6 grid gap-4 text-muted">
                <p className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
                  {business.address}
                </p>
                <p className="flex items-start gap-3">
                  <Clock className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
                  {business.hours}
                </p>
                <a className="flex items-center gap-3 font-bold text-foreground hover:text-brand-dark" href={phoneHref()}>
                  <Phone className="size-5 text-brand" aria-hidden="true" />
                  {business.phoneDisplay}
                </a>
              </div>
            </div>
            <div className="rounded-lg bg-surface-warm p-5">
              <p className="font-bold">Buying process</p>
              <p className="mt-2 text-base leading-7 text-muted sm:text-sm sm:leading-6">
                Browse online, confirm stock by message, then arrange pickup and pay in person.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
