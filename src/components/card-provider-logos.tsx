import Image from 'next/image'

const cardProviders = [
  { name: 'Visa', logo: '/payment-logos/visa.svg' },
  { name: 'Mastercard', logo: '/payment-logos/mastercard.svg' },
  { name: 'American Express', logo: '/payment-logos/amex.svg' },
  { name: 'Discover', logo: '/payment-logos/discover.svg' },
]

type CardProviderLogosProps = {
  className?: string
}

export function CardProviderLogos({ className = '' }: CardProviderLogosProps) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`} aria-label="Accepted card providers">
      {cardProviders.map((provider) => (
        <span key={provider.name} className="inline-flex overflow-hidden rounded-md shadow-sm" title={provider.name}>
          <Image src={provider.logo} alt={`${provider.name} accepted`} width={780} height={500} className="h-9 w-auto" />
        </span>
      ))}
    </div>
  )
}
