import { Map, Navigation } from 'lucide-react'
import { appleMapsHref, googleMapsHref } from '@/lib/business'

type MapDirectionsLinksProps = {
  variant?: 'light' | 'dark'
  className?: string
}

export function MapDirectionsLinks({ variant = 'light', className = '' }: MapDirectionsLinksProps) {
  const secondaryClass =
    variant === 'dark'
      ? 'border border-background/20 bg-background/10 text-background hover:bg-background/18'
      : 'border border-border bg-surface text-foreground hover:bg-surface-warm'

  return (
    <div className={`flex flex-col gap-2 sm:flex-row ${className}`}>
      <a
        href={googleMapsHref()}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-black text-foreground transition hover:bg-brand-dark hover:text-white"
      >
        <Navigation className="size-4" aria-hidden="true" />
        Google Maps
      </a>
      <a
        href={appleMapsHref()}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition ${secondaryClass}`}
      >
        <Map className="size-4" aria-hidden="true" />
        Apple Maps
      </a>
    </div>
  )
}
