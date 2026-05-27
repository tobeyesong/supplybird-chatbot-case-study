'use client'

import { Calculator } from 'lucide-react'
import { useMemo, useState } from 'react'

type CoverageCalculatorProps = {
  coveragePerBox: number | null
  price: number
  priceUnit: string
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function estimateMaterialPrice(options: { adjustedSqft: number; boxes: number; price: number; priceUnit: string }) {
  if (options.price <= 0) return null

  if (options.priceUnit === 'sq_ft') {
    return options.adjustedSqft * options.price
  }

  if (['box', 'bundle', 'unit'].includes(options.priceUnit)) {
    return options.boxes * options.price
  }

  return null
}

export function CoverageCalculator({ coveragePerBox, price, priceUnit }: CoverageCalculatorProps) {
  const [mode, setMode] = useState<'room' | 'total'>('room')
  const [length, setLength] = useState('')
  const [width, setWidth] = useState('')
  const [total, setTotal] = useState('')

  const result = useMemo(() => {
    if (!coveragePerBox) return null

    const rawSqft = mode === 'room' ? Number(length) * Number(width) : Number(total)
    if (!Number.isFinite(rawSqft) || rawSqft <= 0) return null

    const adjustedSqft = rawSqft * 1.1
    const boxes = Math.ceil(adjustedSqft / coveragePerBox)
    const estimatedPrice = estimateMaterialPrice({ adjustedSqft, boxes, price, priceUnit })

    return {
      boxes,
      adjustedSqft,
      coveredSqft: boxes * coveragePerBox,
      estimatedPrice,
    }
  }, [coveragePerBox, length, mode, price, priceUnit, total, width])

  if (!coveragePerBox) {
    return (
      <div className="surface-card p-5">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-lg bg-brand-soft text-brand-dark">
            <Calculator className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-bold">Coverage calculator</h2>
            <p className="text-sm text-muted">Ask us to confirm coverage for this item.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="surface-card p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-lg bg-brand-soft text-brand-dark">
            <Calculator className="size-5" aria-hidden="true" />
          </span>
          <h2 className="font-bold">Coverage calculator</h2>
        </div>
        <p className="text-sm font-semibold text-muted">{coveragePerBox} sq.ft. / box</p>
      </div>

      <div className="mt-5 grid grid-cols-2 rounded-lg bg-surface-warm p-1">
        <button
          type="button"
          className={`min-h-10 rounded-md text-sm font-bold ${mode === 'room' ? 'bg-surface text-foreground shadow-card' : 'text-muted'}`}
          onClick={() => setMode('room')}
        >
          By room
        </button>
        <button
          type="button"
          className={`min-h-10 rounded-md text-sm font-bold ${mode === 'total' ? 'bg-surface text-foreground shadow-card' : 'text-muted'}`}
          onClick={() => setMode('total')}
        >
          Enter total
        </button>
      </div>

      {mode === 'room' ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold">
            Length
            <div className="flex items-center gap-2">
              <input className="field" value={length} onChange={(event) => setLength(event.target.value)} inputMode="decimal" placeholder="18" />
              <span className="text-sm text-muted">ft</span>
            </div>
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Width
            <div className="flex items-center gap-2">
              <input className="field" value={width} onChange={(event) => setWidth(event.target.value)} inputMode="decimal" placeholder="12" />
              <span className="text-sm text-muted">ft</span>
            </div>
          </label>
        </div>
      ) : (
        <label className="mt-5 grid gap-2 text-sm font-semibold">
          Total square feet
          <div className="flex items-center gap-2">
            <input className="field" value={total} onChange={(event) => setTotal(event.target.value)} inputMode="decimal" placeholder="450" />
            <span className="text-sm text-muted">sq.ft.</span>
          </div>
        </label>
      )}

      <div className="mt-5 rounded-lg bg-foreground p-4 text-background">
        {result ? (
          <p className="text-sm leading-6">
            You will need <span className="font-bold text-white">~{result.boxes} boxes</span>, covering about{' '}
            <span className="font-bold text-white">{Math.round(result.coveredSqft)} sq.ft.</span> including 10% waste.
            {result.estimatedPrice ? (
              <>
                {' '}
                Estimated material total: <span className="font-bold text-white">~{formatCurrency(result.estimatedPrice)}</span>.
              </>
            ) : null}{' '}
            Contact us to confirm availability.
          </p>
        ) : (
          <p className="text-sm text-background/72">Enter dimensions to estimate boxes with 10% waste included.</p>
        )}
      </div>
    </div>
  )
}
