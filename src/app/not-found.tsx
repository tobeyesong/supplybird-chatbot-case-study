import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="section-y">
      <div className="page-container max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-wide text-brand-dark">404</p>
        <h1 className="mt-4 text-4xl font-black tracking-normal">This page is not available.</h1>
        <p className="mt-4 text-muted">The product may have moved, sold out, or not been listed yet.</p>
        <Link href="/" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-lg bg-brand px-5 py-3 text-sm font-bold text-white hover:bg-brand-dark">
          Back home
        </Link>
      </div>
    </section>
  )
}
