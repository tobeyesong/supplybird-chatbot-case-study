import {
  BarChart3,
  CheckCircle2,
  Clock,
  Database,
  Edit3,
  Filter,
  ImagePlus,
  Layers3,
  LockKeyhole,
  LogOut,
  MapPin,
  Menu,
  MessageSquareText,
  PackagePlus,
  Phone,
  PlugZap,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Table2,
  X,
} from 'lucide-react'
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from 'react'
import {
  categoryNames,
  inventory,
  projectTypes,
  seededLeads,
  type Availability,
  type Fulfillment,
  type Lead,
  type LeadStatus,
  type Product,
  type ProjectType,
  type Timeline,
} from './data'
import { auth, googleProvider, isFirebaseConfigured } from './firebase'

type PriceFilter = 'all' | 'budget' | 'mid' | 'large'
type AssistantSource = 'chatbot' | 'product CTA'
type OwnerTab = 'leads' | 'listings' | 'stack'
type OwnerSession = {
  displayName: string
  email: string
  photoURL?: string
  mode: 'google' | 'demo'
}

type AssistantDraft = {
  projectType: ProjectType
  productInterest: string
  estimatedQuantity: string
  urgency: Timeline
  fulfillment: Fulfillment
  location: string
  budget: string
  contactName: string
  contactMethod: string
  notes: string
}

const defaultDraft: AssistantDraft = {
  projectType: 'flooring',
  productInterest: '',
  estimatedQuantity: '',
  urgency: 'this week',
  fulfillment: 'pickup',
  location: '43055',
  budget: '',
  contactName: '',
  contactMethod: '',
  notes: '',
}

const availabilityOptions: Availability[] = ['In stock', 'Low stock', 'Special order']
const statusOptions: LeadStatus[] = ['new', 'contacted', 'quoted', 'won', 'lost']
const timelineOptions: Timeline[] = ['today', 'this week', 'this month', 'just researching']
const fulfillmentOptions: Fulfillment[] = ['pickup', 'delivery']
const allowedOwnerEmails = ['toanlam01@gmail.com', 'owner@supplybird.net']

const categoryDescriptions = {
  Flooring: 'Waterproof, laminate, hardwood, and accessories',
  Vinyl: 'Fast-turn waterproof planks and closeout lots',
  Laminate: 'Durable plank options for remodels',
  'Engineered Hardwood': 'Warmer finishes for higher-end jobs',
  Decking: 'Boards, fascia, skirting, and accessories',
  Roofing: 'Shingles and material bundles ready to quote',
  Windows: 'Replacement sizes for remodels and rentals',
  Appliances: 'Scratch-and-dent units for property turns',
  'Other Supplies': 'Underlayment, accessories, and jobsite extras',
}

const categoryImages = {
  Flooring: '/supplybird-assets/flooring.png',
  Vinyl: '/supplybird-assets/flooring.png',
  Laminate: '/supplybird-assets/flooring.png',
  'Engineered Hardwood': '/supplybird-assets/flooring.png',
  Decking: '/supplybird-assets/decking.png',
  Roofing: '/supplybird-assets/roofing.png',
  Windows: '/supplybird-assets/windows.png',
  Appliances: '/supplybird-assets/appliances-supplies.png',
  'Other Supplies': '/supplybird-assets/appliances-supplies.png',
}

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function canManageStore(email?: string | null) {
  return Boolean(email && allowedOwnerEmails.includes(email.trim().toLowerCase()))
}

function ownerFromFirebaseUser(user: User): OwnerSession {
  return {
    displayName: user.displayName?.trim() || user.email?.split('@')[0] || 'Google user',
    email: user.email || '',
    photoURL: user.photoURL || undefined,
    mode: 'google',
  }
}

function newProductDraft(): Product {
  const createdAt = Date.now()

  return {
    id: `product-${createdAt}`,
    name: 'New SupplyBird listing',
    category: 'Flooring',
    projectType: 'flooring',
    price: 0,
    priceLabel: 'Quote pending',
    availability: 'In stock',
    condition: 'New or inspected',
    specs: 'Add dimensions, coverage, quantity, or relevant specs.',
    notes: 'Add the best use case, constraints, or follow-up notes.',
    image: '/supplybird-assets/flooring.png',
    imageAlt: 'SupplyBird inventory listing image.',
  }
}

function useLocalStorageState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const storedValue = window.localStorage.getItem(key)

    if (!storedValue) {
      return initialValue
    }

    try {
      return JSON.parse(storedValue) as T
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue] as const
}

function leadPriority(lead: Lead) {
  if (lead.urgency === 'today') {
    return 'hot'
  }

  if (lead.urgency === 'this week' || lead.fulfillment === 'delivery') {
    return 'warm'
  }

  return 'nurture'
}

function priorityClasses(priority: string) {
  if (priority === 'hot') {
    return 'bg-rose-50 text-rose-700 ring-rose-600/15'
  }

  if (priority === 'warm') {
    return 'bg-amber-50 text-amber-700 ring-amber-600/20'
  }

  return 'bg-slate-100 text-slate-700 ring-slate-600/10'
}

function recommendedNextStep(draft: AssistantDraft) {
  if (draft.urgency === 'today') {
    return 'Call now, confirm availability, and reserve the matching material.'
  }

  if (draft.fulfillment === 'delivery') {
    return 'Prepare a material count and delivery quote for the requested location.'
  }

  if (draft.urgency === 'just researching') {
    return 'Send product options and ask whether measurements or photos are available.'
  }

  return 'Confirm quantity, quote the closest in-stock option, and schedule follow-up.'
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function normalizeProjectType(value: string): ProjectType {
  const normalized = value.toLowerCase()

  if (normalized.includes('deck')) {
    return 'decking'
  }

  if (normalized.includes('roof')) {
    return 'roofing'
  }

  if (normalized.includes('window')) {
    return 'window'
  }

  if (normalized.includes('appliance')) {
    return 'appliance'
  }

  if (normalized.includes('floor') || normalized.includes('vinyl') || normalized.includes('laminate')) {
    return 'flooring'
  }

  return projectTypes.find((type) => type === normalized) ?? 'other'
}

function normalizeTimeline(value: string): Timeline {
  const normalized = value.toLowerCase()

  if (normalized.includes('today')) {
    return 'today'
  }

  if (normalized.includes('week')) {
    return 'this week'
  }

  if (normalized.includes('research')) {
    return 'just researching'
  }

  return 'this month'
}

function normalizeFulfillment(value: string): Fulfillment {
  return value.toLowerCase().includes('deliver') ? 'delivery' : 'pickup'
}

function parseContact(value: string) {
  const [name, ...contactParts] = value.split(',')
  const contact = contactParts.join(',').trim()

  if (contact) {
    return {
      contactName: name.trim(),
      contactMethod: contact,
    }
  }

  return {
    contactName: '',
    contactMethod: value.trim(),
  }
}

function Header({ onOpenAssistant }: { onOpenAssistant: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-2 text-sm sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-slate-200">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4 text-yellow-300" aria-hidden="true" />
              160 S 21st Street, Newark, OH 43055
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4 text-yellow-300" aria-hidden="true" />
              Open every day, 10:00 AM - 6:00 PM
            </span>
          </div>
          <a href="tel:+17408996629" className="inline-flex items-center gap-1.5 font-medium text-white">
            <Phone className="size-4 text-yellow-300" aria-hidden="true" />
            (740) 899-6629
          </a>
        </div>
      </div>

      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="#catalog" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded bg-yellow-300 text-lg font-black text-slate-950">
            SB
          </span>
          <span>
            <span className="block text-base font-semibold leading-5 text-slate-950">SupplyBird</span>
            <span className="block text-sm text-slate-500">Inventory + estimate intake</span>
          </span>
        </a>

        <div className="hidden items-center gap-7 lg:flex">
          {['Catalog', 'Dashboard', 'Case Study'].map((item) => (
            <a
              key={item}
              href={`#${item === 'Case Study' ? 'case-study' : item.toLowerCase()}`}
              className="text-sm font-medium text-slate-600 hover:text-slate-950"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenAssistant}
            className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
          >
            <MessageSquareText className="size-4" aria-hidden="true" />
            Estimate Assistant
          </button>
          <button
            type="button"
            title="Open navigation"
            onClick={() => setMobileOpen(true)}
            className="inline-flex size-10 items-center justify-center rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 lg:hidden"
          >
            <span className="sr-only">Open navigation</span>
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </div>
      </nav>

      {mobileOpen ? (
        <div className="border-t border-slate-200 bg-white px-4 py-4 shadow-lg lg:hidden">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-950">Navigation</p>
            <button
              type="button"
              title="Close navigation"
              onClick={() => setMobileOpen(false)}
              className="inline-flex size-9 items-center justify-center rounded-md bg-slate-100 text-slate-700"
            >
              <span className="sr-only">Close navigation</span>
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-4 grid gap-2">
            {['Catalog', 'Dashboard', 'Case Study'].map((item) => (
              <a
                key={item}
                href={`#${item === 'Case Study' ? 'case-study' : item.toLowerCase()}`}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  )
}

function FilterPanel({
  search,
  setSearch,
  category,
  setCategory,
  availability,
  setAvailability,
  priceFilter,
  setPriceFilter,
  projectType,
  setProjectType,
  onOpenAssistant,
}: {
  search: string
  setSearch: (value: string) => void
  category: string
  setCategory: (value: string) => void
  availability: string
  setAvailability: (value: string) => void
  priceFilter: PriceFilter
  setPriceFilter: (value: PriceFilter) => void
  projectType: string
  setProjectType: (value: string) => void
  onOpenAssistant: () => void
}) {
  const resetFilters = () => {
    setSearch('')
    setCategory('All')
    setAvailability('All')
    setPriceFilter('all')
    setProjectType('All')
  }

  return (
    <aside className="lg:sticky lg:top-32">
      <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="inline-flex items-center gap-2 text-base font-semibold text-slate-950">
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            Catalog filters
          </h2>
          <button
            type="button"
            onClick={resetFilters}
            className="text-sm font-medium text-slate-500 hover:text-slate-950"
          >
            Reset
          </button>
        </div>

        <div className="mt-5 space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Search inventory</span>
            <span className="mt-2 flex items-center rounded-md bg-white px-3 outline-1 -outline-offset-1 outline-slate-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-slate-950">
              <Search className="size-4 text-slate-400" aria-hidden="true" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="vinyl, shingles, range"
                className="block w-full bg-transparent py-2 pl-2 text-sm text-slate-950 outline-none placeholder:text-slate-400"
              />
            </span>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-sm text-slate-950 outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-slate-950"
            >
              <option>All</option>
              {categoryNames.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Availability</span>
            <select
              value={availability}
              onChange={(event) => setAvailability(event.target.value)}
              className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-sm text-slate-950 outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-slate-950"
            >
              <option>All</option>
              {availabilityOptions.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Price range</span>
            <select
              value={priceFilter}
              onChange={(event) => setPriceFilter(event.target.value as PriceFilter)}
              className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-sm text-slate-950 outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-slate-950"
            >
              <option value="all">All prices</option>
              <option value="budget">Under $2 per unit</option>
              <option value="mid">$2 - $50 per unit</option>
              <option value="large">$50+ per unit</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Project type</span>
            <select
              value={projectType}
              onChange={(event) => setProjectType(event.target.value)}
              className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-sm text-slate-950 outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-slate-950"
            >
              <option>All</option>
              {projectTypes.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-slate-950 p-4 text-white shadow-sm">
        <p className="text-sm font-semibold">Need an estimate?</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Capture product, quantity, timeline, pickup or delivery, location, and contact details before staff follow up.
        </p>
        <button
          type="button"
          onClick={onOpenAssistant}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-yellow-300 px-3 py-2.5 text-sm font-semibold text-slate-950 hover:bg-yellow-200"
        >
          <MessageSquareText className="size-4" aria-hidden="true" />
          Start intake
        </button>
      </div>
    </aside>
  )
}

function CategoryStrip({
  products,
  activeCategory,
  onSelectCategory,
}: {
  products: Product[]
  activeCategory: string
  onSelectCategory: (value: string) => void
}) {
  return (
    <div className="grid grid-flow-col auto-cols-[minmax(190px,1fr)] gap-4 overflow-x-auto pb-2">
      {categoryNames.map((category) => {
        const count = products.filter((product) => product.category === category).length

        return (
          <button
            type="button"
            key={category}
            onClick={() => onSelectCategory(category)}
            className={classNames(
              'group relative min-h-36 overflow-hidden rounded-lg bg-slate-900 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
              activeCategory === category && 'ring-2 ring-yellow-300',
            )}
          >
            <img
              src={categoryImages[category]}
              alt=""
              className="absolute inset-0 size-full object-cover opacity-45 transition group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/10" />
            <span className="relative flex h-full flex-col justify-end">
              <span className="text-sm font-semibold text-white">{category}</span>
              <span className="mt-1 text-xs leading-5 text-slate-200">{categoryDescriptions[category]}</span>
              <span className="mt-2 text-xs font-medium text-yellow-200">
                {count ? `${count} sampled item${count > 1 ? 's' : ''}` : 'Category ready'}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

function ProductGrid({ products, onEstimate }: { products: Product[]; onEstimate: (product: Product) => void }) {
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <article key={product.id} className="group overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-900/5">
          <div className="aspect-[4/3] overflow-hidden bg-slate-100">
            <img
              src={product.image}
              alt={product.imageAlt}
              className="size-full object-cover transition duration-300 group-hover:scale-105"
            />
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">{product.category}</p>
                <h3 className="mt-1 text-base font-semibold leading-6 text-slate-950">{product.name}</h3>
              </div>
              <span
                className={classNames(
                  'shrink-0 rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset',
                  product.availability === 'In stock' && 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
                  product.availability === 'Low stock' && 'bg-amber-50 text-amber-700 ring-amber-600/20',
                  product.availability === 'Special order' && 'bg-sky-50 text-sky-700 ring-sky-600/15',
                )}
              >
                {product.availability}
              </span>
            </div>

            <p className="mt-3 text-lg font-semibold text-slate-950">{product.priceLabel}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{product.specs}</p>

            <dl className="mt-4 grid gap-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Condition</dt>
                <dd className="text-right font-medium text-slate-800">{product.condition}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Use case</dt>
                <dd className="text-right font-medium text-slate-800">{product.projectType}</dd>
              </div>
            </dl>

            <p className="mt-4 text-sm leading-6 text-slate-600">{product.notes}</p>

            <button
              type="button"
              onClick={() => onEstimate(product)}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-3 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
            >
              <MessageSquareText className="size-4" aria-hidden="true" />
              Ask / Get estimate
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}

function LeadDashboard({
  leads,
  onStatusChange,
  onResetLeads,
  embedded = false,
}: {
  leads: Lead[]
  onStatusChange: (leadId: string, status: LeadStatus) => void
  onResetLeads: () => void
  embedded?: boolean
}) {
  const leadCounts = statusOptions.map((status) => ({
    status,
    total: leads.filter((lead) => lead.status === status).length,
  }))

  return (
    <section id={embedded ? undefined : 'leads'} className={embedded ? '' : 'bg-white py-14 sm:py-16'}>
      <div className={embedded ? '' : 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'}>
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-slate-500">Seller view</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">
              Lead dashboard
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Captured estimate requests are structured for follow-up: intent, quantity, urgency, fulfillment, location,
              contact, and next step.
            </p>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-5 gap-2">
              {leadCounts.map((item) => (
                <div key={item.status} className="rounded-md bg-slate-50 px-3 py-2 text-center">
                  <p className="text-lg font-semibold text-slate-950">{item.total}</p>
                  <p className="text-xs capitalize text-slate-500">{item.status}</p>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={onResetLeads}
              className="inline-flex w-full items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-900/10 hover:bg-slate-50"
            >
              Reset demo data
            </button>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-900/5">
          <div className="hidden grid-cols-[1.1fr_1.4fr_0.7fr_0.7fr_0.8fr] gap-4 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-normal text-slate-500 md:grid">
            <span>Buyer</span>
            <span>Project summary</span>
            <span>Priority</span>
            <span>Source</span>
            <span>Status</span>
          </div>

          <div className="divide-y divide-slate-100">
            {leads.map((lead) => {
              const priority = leadPriority(lead)

              return (
                <article
                  key={lead.id}
                  className="grid gap-4 px-5 py-5 md:grid-cols-[1.1fr_1.4fr_0.7fr_0.7fr_0.8fr] md:items-center"
                >
                  <div>
                    <p className="font-semibold text-slate-950">{lead.contactName || 'Unnamed buyer'}</p>
                    <p className="mt-1 text-sm text-slate-500">{lead.contactMethod}</p>
                    <p className="mt-1 text-xs text-slate-400">{formatDate(lead.createdAt)}</p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {lead.productInterest || lead.projectType} · {lead.estimatedQuantity || 'quantity pending'}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {lead.urgency}, {lead.fulfillment}, {lead.location || 'location pending'}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{lead.recommendedNextStep}</p>
                  </div>

                  <div>
                    <span
                      className={classNames(
                        'inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ring-1 ring-inset',
                        priorityClasses(priority),
                      )}
                    >
                      {priority}
                    </span>
                  </div>

                  <p className="text-sm capitalize text-slate-600">{lead.source}</p>

                  <select
                    value={lead.status}
                    onChange={(event) => onStatusChange(lead.id, event.target.value as LeadStatus)}
                    className="w-full rounded-md bg-white px-3 py-2 text-sm capitalize text-slate-950 outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-slate-950"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function OwnerDashboard({
  leads,
  products,
  onStatusChange,
  onResetLeads,
  onSaveProduct,
  onResetProducts,
}: {
  leads: Lead[]
  products: Product[]
  onStatusChange: (leadId: string, status: LeadStatus) => void
  onResetLeads: () => void
  onSaveProduct: (product: Product) => void
  onResetProducts: () => void
}) {
  const [activeTab, setActiveTab] = useState<OwnerTab>('leads')
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [demoOwner, setDemoOwner] = useLocalStorageState<OwnerSession | null>(
    'supplybird.case-study.owner',
    null,
  )
  const [authError, setAuthError] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  useEffect(() => {
    if (!auth) {
      return
    }

    return onAuthStateChanged(auth, (nextUser) => {
      setFirebaseUser(nextUser)
    })
  }, [])

  const owner = firebaseUser ? ownerFromFirebaseUser(firebaseUser) : demoOwner
  const hasAccess = Boolean(owner && (owner.mode === 'demo' || canManageStore(owner.email)))
  const hotLeads = leads.filter((lead) => leadPriority(lead) === 'hot').length
  const lowStockProducts = products.filter((product) => product.availability === 'Low stock').length
  const ownerInitial = owner?.displayName?.charAt(0).toUpperCase() || 'S'
  const tabs: Array<{ id: OwnerTab; label: string; icon: typeof MessageSquareText }> = [
    { id: 'leads', label: 'Leads', icon: MessageSquareText },
    { id: 'listings', label: 'Listings', icon: ImagePlus },
    { id: 'stack', label: 'Stack', icon: Database },
  ]

  const handleGoogleSignIn = async () => {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      setAuthError('Firebase is not configured yet. Add VITE_FIREBASE_* env vars or use demo owner mode.')
      return
    }

    try {
      setIsPending(true)
      setAuthError('')
      await signInWithPopup(auth, googleProvider)
      setDemoOwner(null)
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Google sign-in failed.')
    } finally {
      setIsPending(false)
    }
  }

  const handleDemoSignIn = () => {
    setAuthError('')
    setDemoOwner({
      displayName: 'SupplyBird Owner',
      email: 'owner@supplybird.net',
      mode: 'demo',
    })
  }

  const handleSignOut = async () => {
    try {
      setIsPending(true)
      setAuthError('')

      if (auth && firebaseUser) {
        await signOut(auth)
      }

      setDemoOwner(null)
      setFirebaseUser(null)
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Sign-out failed.')
    } finally {
      setIsPending(false)
    }
  }

  const saveProduct = (product: Product) => {
    onSaveProduct(product)
    setEditingProduct(null)
  }

  return (
    <section id="dashboard" className="bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-slate-500">Owner workspace</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">
              Seller dashboard
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Google-gated workspace for captured leads, editable listings, image updates, and the path from
              localStorage prototype to Airtable or Supabase.
            </p>
          </div>

          {owner ? (
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3">
              {owner.photoURL ? (
                <img src={owner.photoURL} alt="" className="size-10 rounded-full object-cover" />
              ) : (
                <span className="flex size-10 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                  {ownerInitial}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">{owner.displayName}</p>
                <p className="truncate text-xs text-slate-500">{owner.email}</p>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isPending}
                title="Sign out"
                className="ml-2 inline-flex size-9 items-center justify-center rounded-md bg-white text-slate-600 shadow-sm ring-1 ring-slate-900/10 hover:bg-slate-100 disabled:opacity-60"
              >
                <span className="sr-only">Sign out</span>
                <LogOut className="size-4" aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>

        {!owner ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div className="rounded-lg bg-slate-950 p-6 text-white shadow-sm">
              <LockKeyhole className="size-6 text-yellow-300" aria-hidden="true" />
              <h3 className="mt-5 text-lg font-semibold">Owner login</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                The production path should use Google Sign-In for the owner or seller. This local prototype includes the
                Firebase hook from the Video X pattern and a demo owner mode while env vars are not configured.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-yellow-300 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-yellow-200 disabled:opacity-60"
                >
                  <ShieldCheck className="size-4" aria-hidden="true" />
                  {isPending ? 'Connecting...' : 'Sign in with Google'}
                </button>
                <button
                  type="button"
                  onClick={handleDemoSignIn}
                  className="inline-flex items-center justify-center rounded-md bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15"
                >
                  Use demo owner mode
                </button>
              </div>
              {authError ? <p className="mt-4 text-sm leading-6 text-yellow-100">{authError}</p> : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ['Leads', 'Review estimate requests, assign statuses, and identify hot opportunities.'],
                ['Listings', 'Update product copy, pricing, stock state, specs, and images without editing code.'],
                ['Images', 'Paste hosted image URLs or preview a local image file during the prototype.'],
                ['Pilot stack', 'Move the same records into Airtable first, then Supabase when auth and APIs matter.'],
              ].map(([title, body]) => (
                <div key={title} className="rounded-lg bg-slate-50 p-5">
                  <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {owner && !hasAccess ? (
          <div className="mt-8 rounded-lg bg-rose-50 p-5 text-sm leading-6 text-rose-800 ring-1 ring-rose-600/10">
            {owner.email || 'This Google account'} is not on the owner allowlist. Sign out and use an approved account
            or update `allowedOwnerEmails` for the pilot.
          </div>
        ) : null}

        {hasAccess ? (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Total leads', leads.length.toString(), 'Estimate requests captured'],
                ['Hot leads', hotLeads.toString(), 'Same-day follow-up priority'],
                ['Listings', products.length.toString(), 'Editable catalog records'],
                ['Low stock', lowStockProducts.toString(), 'Inventory items to review'],
              ].map(([label, value, note]) => (
                <div key={label} className="rounded-lg bg-slate-50 p-5">
                  <p className="text-sm font-medium text-slate-500">{label}</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
                  <p className="mt-1 text-sm text-slate-500">{note}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={classNames(
                    'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold',
                    activeTab === tab.id
                      ? 'bg-slate-950 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                  )}
                >
                  <tab.icon className="size-4" aria-hidden="true" />
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'leads' ? (
              <div className="mt-8">
                <LeadDashboard
                  leads={leads}
                  onStatusChange={onStatusChange}
                  onResetLeads={onResetLeads}
                  embedded
                />
              </div>
            ) : null}

            {activeTab === 'listings' ? (
              <div className="mt-8">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-base font-semibold text-slate-950">Editable listings</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Updates persist locally and immediately affect the storefront plus assistant suggestions.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingProduct(newProductDraft())}
                      className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      <PackagePlus className="size-4" aria-hidden="true" />
                      Add listing
                    </button>
                    <button
                      type="button"
                      onClick={onResetProducts}
                      className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-900/10 hover:bg-slate-50"
                    >
                      Reset listings
                    </button>
                  </div>
                </div>

                <div className="mt-6 overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-900/5">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-950 sm:pl-5">
                          Listing
                        </th>
                        <th className="hidden px-3 py-3.5 text-left text-sm font-semibold text-slate-950 lg:table-cell">
                          Specs
                        </th>
                        <th className="hidden px-3 py-3.5 text-left text-sm font-semibold text-slate-950 sm:table-cell">
                          Stock
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-950">Price</th>
                        <th className="py-3.5 pl-3 pr-4 text-right text-sm font-semibold text-slate-950 sm:pr-5">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {products.map((product) => (
                        <tr key={product.id}>
                          <td className="w-full max-w-0 py-4 pl-4 pr-3 text-sm sm:w-auto sm:max-w-none sm:pl-5">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.image}
                                alt=""
                                className="size-12 shrink-0 rounded-md bg-slate-100 object-cover"
                              />
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-slate-950">{product.name}</p>
                                <p className="mt-1 text-slate-500">{product.category}</p>
                                <dl className="font-normal lg:hidden">
                                  <dt className="sr-only">Specs</dt>
                                  <dd className="mt-1 truncate text-slate-600">{product.specs}</dd>
                                  <dt className="sr-only sm:hidden">Availability</dt>
                                  <dd className="mt-1 truncate text-slate-500 sm:hidden">{product.availability}</dd>
                                </dl>
                              </div>
                            </div>
                          </td>
                          <td className="hidden max-w-md px-3 py-4 text-sm text-slate-500 lg:table-cell">
                            <p className="line-clamp-2">{product.specs}</p>
                          </td>
                          <td className="hidden px-3 py-4 text-sm text-slate-500 sm:table-cell">
                            {product.availability}
                          </td>
                          <td className="px-3 py-4 text-sm font-medium text-slate-950">{product.priceLabel}</td>
                          <td className="py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-5">
                            <button
                              type="button"
                              onClick={() => setEditingProduct(product)}
                              className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                            >
                              <Edit3 className="size-4" aria-hidden="true" />
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {activeTab === 'stack' ? (
              <div className="mt-8 grid gap-5 lg:grid-cols-3">
                {[
                  [
                    'Prototype now',
                    'Vite, React, Tailwind, Firebase Auth hooks, and localStorage for products and leads.',
                  ],
                  [
                    'Airtable pilot',
                    'Move Products, Leads, Follow Up Tasks, and Activity Log into Airtable so the owner can operate it without engineering help.',
                  ],
                  [
                    'Scalable app',
                    'Use Supabase Postgres, Storage, Auth/RLS, and serverless functions when permissions, APIs, and volume matter.',
                  ],
                ].map(([title, body]) => (
                  <div key={title} className="rounded-lg bg-slate-50 p-5">
                    <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      {editingProduct ? (
        <ProductEditorDrawer
          key={editingProduct.id}
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={saveProduct}
        />
      ) : null}
    </section>
  )
}

function ProductEditorDrawer({
  product,
  onClose,
  onSave,
}: {
  product: Product
  onClose: () => void
  onSave: (product: Product) => void
}) {
  const [draft, setDraft] = useState<Product>(product)

  const updateDraft = (updates: Partial<Product>) => {
    setDraft((current) => ({ ...current, ...updates }))
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      updateDraft({
        image: String(reader.result),
        imageAlt: `${draft.name} listing image.`,
      })
    }

    reader.readAsDataURL(file)
  }

  const saveListing = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSave(draft)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <button
        type="button"
        aria-label="Close listing editor"
        className="absolute inset-0 bg-slate-950/35"
        onClick={onClose}
      />
      <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-8 sm:pl-16">
        <form
          onSubmit={saveListing}
          className="pointer-events-auto flex w-screen max-w-xl flex-col bg-white shadow-2xl"
        >
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-normal text-slate-500">Listing editor</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-950">{draft.name}</h2>
            </div>
            <button
              type="button"
              title="Close listing editor"
              onClick={onClose}
              className="inline-flex size-9 items-center justify-center rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              <span className="sr-only">Close listing editor</span>
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-5 py-6">
            <div className="grid gap-5 sm:grid-cols-[160px_1fr] sm:items-start">
              <img src={draft.image} alt="" className="aspect-square w-full rounded-lg bg-slate-100 object-cover" />
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Image URL</span>
                  <input
                    value={draft.image}
                    onChange={(event) => updateDraft({ image: event.target.value })}
                    className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-sm text-slate-950 outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-slate-950"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Preview local image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mt-2 block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-950 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
                  />
                </label>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">Product name</span>
                <input
                  value={draft.name}
                  onChange={(event) => updateDraft({ name: event.target.value })}
                  className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-sm text-slate-950 outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-slate-950"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Category</span>
                <select
                  value={draft.category}
                  onChange={(event) => updateDraft({ category: event.target.value as Product['category'] })}
                  className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-sm text-slate-950 outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-slate-950"
                >
                  {categoryNames.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Project type</span>
                <select
                  value={draft.projectType}
                  onChange={(event) => updateDraft({ projectType: event.target.value as ProjectType })}
                  className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-sm text-slate-950 outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-slate-950"
                >
                  {projectTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Price number</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={draft.price}
                  onChange={(event) => updateDraft({ price: Number(event.target.value) })}
                  className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-sm text-slate-950 outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-slate-950"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Price label</span>
                <input
                  value={draft.priceLabel}
                  onChange={(event) => updateDraft({ priceLabel: event.target.value })}
                  className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-sm text-slate-950 outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-slate-950"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Availability</span>
                <select
                  value={draft.availability}
                  onChange={(event) => updateDraft({ availability: event.target.value as Availability })}
                  className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-sm text-slate-950 outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-slate-950"
                >
                  {availabilityOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Condition</span>
                <input
                  value={draft.condition}
                  onChange={(event) => updateDraft({ condition: event.target.value })}
                  className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-sm text-slate-950 outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-slate-950"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">Specs</span>
                <textarea
                  rows={3}
                  value={draft.specs}
                  onChange={(event) => updateDraft({ specs: event.target.value })}
                  className="mt-2 block w-full resize-none rounded-md bg-white px-3 py-2 text-sm text-slate-950 outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-slate-950"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">Notes</span>
                <textarea
                  rows={3}
                  value={draft.notes}
                  onChange={(event) => updateDraft({ notes: event.target.value })}
                  className="mt-2 block w-full resize-none rounded-md bg-white px-3 py-2 text-sm text-slate-950 outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-slate-950"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">Image alt text</span>
                <input
                  value={draft.imageAlt}
                  onChange={(event) => updateDraft({ imageAlt: event.target.value })}
                  className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-sm text-slate-950 outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-slate-950"
                />
              </label>
            </div>
          </div>

          <div className="flex shrink-0 justify-end gap-3 border-t border-slate-200 px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-900/10 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Save listing
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CaseStudySection() {
  const beforeAfter = [
    {
      label: 'Before',
      steps: [
        'Buyer asks if material is available',
        'Staff asks for size, quantity, timing, and delivery details',
        'Quote waits until enough context is collected',
      ],
    },
    {
      label: 'After',
      steps: [
        'Buyer picks product or project type',
        'Assistant captures estimate-ready details',
        'Lead lands in dashboard with urgency and next step',
      ],
    },
  ]

  const metrics = [
    { label: 'Response time', value: '< 10 min', note: 'placeholder target' },
    { label: 'Qualified leads', value: '+30%', note: 'hypothesis' },
    { label: 'Quote requests', value: '+18%', note: 'hypothesis' },
    { label: 'Follow-up completion', value: '85%', note: 'placeholder target' },
  ]

  const stackPath = [
    {
      title: 'Current widget layer',
      icon: MessageSquareText,
      body: 'Chatway can stay as the visible chat/contact channel, but its pre-chat form should route into structured estimate intake instead of stopping at name, phone, and email.',
    },
    {
      title: 'Case-study prototype',
      icon: Layers3,
      body: 'The scripted React assistant captures project type, material interest, quantity, urgency, fulfillment, location, budget, contact, notes, and a next step.',
    },
    {
      title: 'Pilot data layer',
      icon: Table2,
      body: 'Airtable is the fastest scalable MVP for leads, statuses, products, follow-up tasks, and lightweight reporting. Supabase is the stronger option when auth, APIs, and richer app logic matter.',
    },
    {
      title: 'Automation layer',
      icon: PlugZap,
      body: 'Make, Zapier, n8n, or serverless functions can notify the team, create follow-up tasks, send buyer confirmations, and sync qualified opportunities into a CRM.',
    },
  ]

  return (
    <section id="case-study" className="bg-slate-50 py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-slate-500">Case study logic</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">
              Speed-to-lead for estimate requests
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              The problem is not a lack of chat. Buyers often ask vague, repeated questions before staff can quote. The
              assistant makes product intent, quantity, timeline, pickup or delivery, location, and contact details
              explicit before handoff.
            </p>

            <div className="mt-7 space-y-4">
              {beforeAfter.map((group) => (
                <div key={group.label} className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
                  <h3 className="text-sm font-semibold text-slate-950">{group.label}</h3>
                  <ol className="mt-4 space-y-3">
                    {group.steps.map((step, index) => (
                      <li key={step} className="flex gap-3 text-sm leading-6 text-slate-600">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                          {index + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
              <h3 className="text-base font-semibold text-slate-950">Business impact hypothesis</h3>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  'Faster estimates',
                  'Cleaner lead handoff',
                  'Fewer back-and-forth messages',
                  'Better follow-up on serious buyers',
                ].map((item) => (
                  <div key={item} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden="true" />
                    <p className="text-sm leading-6 text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-500">{metric.label}</p>
                    <BarChart3 className="size-4 text-slate-400" aria-hidden="true" />
                  </div>
                  <p className="mt-3 text-3xl font-semibold text-slate-950">{metric.value}</p>
                  <p className="mt-1 text-xs text-slate-500">{metric.note}</p>
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-slate-950 p-6 text-white shadow-sm">
              <h3 className="text-base font-semibold">What this validates</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                A narrow buyer-response assistant can turn catalog browsing into structured estimate intake without
                pretending to be a general AI chatbot. The value is routing serious leads faster.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-normal text-slate-500">Production blueprint</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-950">
              Chatway is the channel. The product is the lead-response system.
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              The scalable version follows the blueprint: traffic source to intake assistant, qualification logic, lead
              database, notifications, dashboard, and human sales handoff. Airtable is a good first real database because
              the team can operate it immediately while the website still feels lightweight.
            </p>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stackPath.map((item) => (
              <div key={item.title} className="rounded-lg bg-slate-50 p-5">
                <item.icon className="size-5 text-slate-500" aria-hidden="true" />
                <h4 className="mt-4 text-sm font-semibold text-slate-950">{item.title}</h4>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function AssistantDrawer({
  open,
  source,
  product,
  products,
  onClose,
  onSubmitLead,
}: {
  open: boolean
  source: AssistantSource
  product: Product | null
  products: Product[]
  onClose: () => void
  onSubmitLead: (lead: Lead) => void
}) {
  const [step, setStep] = useState(0)
  const [reply, setReply] = useState('')
  const [draft, setDraft] = useState<AssistantDraft>(() => ({
    ...defaultDraft,
    projectType: product?.projectType ?? 'flooring',
    productInterest: product?.name ?? '',
  }))
  const [submittedLead, setSubmittedLead] = useState<Lead | null>(null)

  const matchingProducts = products.filter((item) => item.projectType === draft.projectType)

  const buildLead = (leadDraft: AssistantDraft, createdAt: string): Lead => ({
    id: `lead-${createdAt}`,
    createdAt,
    source,
    status: 'new',
    projectType: leadDraft.projectType,
    productInterest: leadDraft.productInterest || `${leadDraft.projectType} project`,
    estimatedQuantity: leadDraft.estimatedQuantity,
    urgency: leadDraft.urgency,
    fulfillment: leadDraft.fulfillment,
    location: leadDraft.location,
    budget: leadDraft.budget || 'not provided',
    contactName: leadDraft.contactName || 'Name pending',
    contactMethod: leadDraft.contactMethod || 'Contact pending',
    notes: leadDraft.notes,
    recommendedNextStep: recommendedNextStep(leadDraft),
  })

  const questions = [
    {
      id: 'project',
      prompt: product
        ? `I can help price out ${product.name}. What kind of project is this for?`
        : 'What are you working on today?',
      helper: 'Pick the closest option so I can ask the right estimate questions.',
      quickReplies: projectTypes.map((type) => type),
      placeholder: 'Type a project type',
      answer: draft.projectType,
      apply: (value: string) => {
        const nextProjectType = normalizeProjectType(value)

        return {
          projectType: nextProjectType,
          productInterest: product?.projectType === nextProjectType ? (product?.name ?? '') : '',
        }
      },
    },
    {
      id: 'product',
      prompt: 'What material or product are you interested in?',
      helper: matchingProducts.length
        ? 'You can choose an inventory item or describe what the buyer is asking about.'
        : 'Describe the item, brand, material, color, or category as clearly as possible.',
      suggestions: matchingProducts.map((item) => ({
        label: item.name,
        value: item.name,
        meta: item.priceLabel,
      })),
      placeholder: 'Example: rustic oak vinyl, charcoal shingles',
      answer: draft.productInterest,
      apply: (value: string) => ({ productInterest: value }),
    },
    {
      id: 'quantity',
      prompt: 'About how much do you need?',
      helper: 'Square footage, linear footage, bundle count, board count, or unit count is enough for a first pass.',
      quickReplies: ['500 sq.ft.', '875 sq.ft.', '1,200 sq.ft.', '3 units'],
      placeholder: 'Example: 900 sq.ft., 420 linear feet, 3 units',
      answer: draft.estimatedQuantity,
      apply: (value: string) => ({ estimatedQuantity: value }),
    },
    {
      id: 'timeline',
      prompt: 'How soon do you need it?',
      helper: 'This drives lead priority and how quickly the team should follow up.',
      quickReplies: timelineOptions.map((timeline) => timeline),
      placeholder: 'Type a timeline',
      answer: draft.urgency,
      apply: (value: string) => ({ urgency: normalizeTimeline(value) }),
    },
    {
      id: 'fulfillment',
      prompt: 'Are you planning pickup or delivery?',
      helper: 'Delivery usually needs location and scheduling details before quoting.',
      quickReplies: fulfillmentOptions.map((option) => option),
      placeholder: 'Pickup or delivery',
      answer: draft.fulfillment,
      apply: (value: string) => ({ fulfillment: normalizeFulfillment(value) }),
    },
    {
      id: 'location',
      prompt: 'What ZIP code or city is the project in?',
      helper: 'Newark-area leads can usually be routed faster, especially if delivery is requested.',
      quickReplies: ['Newark, OH 43055', 'Heath, OH 43056', 'Granville, OH 43023'],
      placeholder: 'Example: Newark, OH 43055',
      answer: draft.location,
      apply: (value: string) => ({ location: value }),
    },
    {
      id: 'budget',
      prompt: 'Do you have a budget range in mind?',
      helper: 'Optional, but it helps staff recommend the right material tier.',
      quickReplies: ['Under $500', '$500 - $1,000', '$1,000 - $2,500', '$2,500+'],
      placeholder: 'Example: $1,000 - $1,500',
      optional: true,
      answer: draft.budget || 'Not provided',
      apply: (value: string) => ({ budget: value === 'Skip' ? '' : value }),
    },
    {
      id: 'contact',
      prompt: 'Who should SupplyBird follow up with?',
      helper: 'Send name and best phone or email in one message.',
      quickReplies: ['Demo Buyer, (740) 555-0199'],
      placeholder: 'Example: Dana Miller, (740) 555-0188',
      answer:
        draft.contactName || draft.contactMethod
          ? `${draft.contactName || 'Name pending'} · ${draft.contactMethod || 'Contact pending'}`
          : '',
      apply: (value: string) => parseContact(value),
    },
    {
      id: 'notes',
      prompt: 'Any notes or photos the team should know about?',
      helper: 'Room count, measurements, delivery constraints, or photo notes all help the handoff.',
      quickReplies: ['No extra notes', 'I have photos to share', 'Need help measuring'],
      placeholder: 'Type notes for the estimate handoff',
      optional: true,
      multiline: true,
      answer: draft.notes || 'No extra notes',
      apply: (value: string) => ({ notes: value === 'No extra notes' ? '' : value }),
    },
  ]

  const submitAnswer = (value: string) => {
    const currentQuestion = questions[step]
    const cleanValue = value.trim()

    if (!cleanValue && !currentQuestion.optional) {
      return
    }

    const answer = cleanValue || 'Skip'
    const nextDraft = {
      ...draft,
      ...currentQuestion.apply(answer),
    }

    setDraft(nextDraft)
    setReply('')

    if (step === questions.length - 1) {
      const lead = buildLead(nextDraft, new Date().toISOString())
      onSubmitLead(lead)
      setSubmittedLead(lead)
      return
    }

    setStep((current) => current + 1)
  }

  const submitComposer = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    submitAnswer(reply)
  }

  if (!open) {
    return null
  }

  const currentQuestion = questions[step]
  const isFinalStep = step === questions.length - 1
  const answeredQuestions = questions.slice(0, step)

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <button
        type="button"
        aria-label="Close estimate assistant"
        className="absolute inset-0 size-full bg-slate-950/35"
        onClick={onClose}
      />
      <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-8 sm:pl-16">
        <div className="pointer-events-auto w-screen max-w-lg transform bg-slate-50 shadow-2xl">
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-200 bg-yellow-300 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    Estimate bot online
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-950">Project Estimate Assistant</h2>
                </div>
                <button
                  type="button"
                  title="Close assistant"
                  onClick={onClose}
                  className="inline-flex size-9 items-center justify-center rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200"
                >
                  <span className="sr-only">Close assistant</span>
                  <X className="size-5" aria-hidden="true" />
                </button>
              </div>
            </div>

            {submittedLead ? (
              <div className="flex-1 overflow-y-auto px-5 py-6">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-yellow-300 text-sm font-black text-slate-950">
                    SB
                  </div>
                  <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-white p-4 text-sm leading-6 text-slate-700 shadow-sm ring-1 ring-slate-900/5">
                    <div className="flex items-center gap-2 font-semibold text-emerald-700">
                      <CheckCircle2 className="size-5" aria-hidden="true" />
                      Lead saved
                    </div>
                    <p className="mt-2">I turned the conversation into a structured request for the sales dashboard.</p>
                  </div>
                </div>

                <div className="mt-5 rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
                  <h3 className="text-sm font-semibold text-slate-950">AI-style lead summary</h3>
                  <dl className="mt-4 space-y-3 text-sm">
                    {[
                      ['Project', submittedLead.projectType],
                      ['Interest', submittedLead.productInterest],
                      ['Quantity', submittedLead.estimatedQuantity || 'pending'],
                      ['Urgency', submittedLead.urgency],
                      ['Pickup / delivery', submittedLead.fulfillment],
                      ['Location', submittedLead.location || 'pending'],
                      ['Contact', `${submittedLead.contactName} · ${submittedLead.contactMethod}`],
                      ['Next step', submittedLead.recommendedNextStep],
                    ].map(([label, value]) => (
                      <div key={label} className="grid grid-cols-[110px_1fr] gap-3">
                        <dt className="text-slate-500">{label}</dt>
                        <dd className="font-medium text-slate-800">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-slate-950 px-3 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  View in dashboard
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-5 overflow-y-auto px-5 py-6">
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-yellow-300 text-sm font-black text-slate-950">
                      SB
                    </div>
                    <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-white p-4 text-sm leading-6 text-slate-700 shadow-sm ring-1 ring-slate-900/5">
                      <p className="font-semibold text-slate-950">Hi, I can help prep an estimate request.</p>
                      <p className="mt-1">
                        I’ll ask a few quick questions, then send SupplyBird a quote-ready summary for follow-up.
                      </p>
                    </div>
                  </div>

                  {answeredQuestions.map((question) => (
                    <div key={question.id} className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-yellow-300 text-sm font-black text-slate-950">
                          SB
                        </div>
                        <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-white p-4 text-sm leading-6 text-slate-700 shadow-sm ring-1 ring-slate-900/5">
                          {question.prompt}
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="max-w-[82%] rounded-2xl rounded-tr-md bg-slate-950 px-4 py-3 text-sm leading-6 text-white">
                          {question.answer || 'Not provided'}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-yellow-300 text-sm font-black text-slate-950">
                      SB
                    </div>
                    <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-white p-4 text-sm leading-6 text-slate-700 shadow-sm ring-1 ring-slate-900/5">
                      <p className="font-semibold text-slate-950">{currentQuestion.prompt}</p>
                      <p className="mt-1 text-slate-600">{currentQuestion.helper}</p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                      <span>
                        Question {step + 1} of {questions.length}
                      </span>
                      <span className="capitalize">{source}</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-yellow-300"
                        style={{ width: `${((step + 1) / questions.length) * 100}%` }}
                      />
                    </div>

                    {currentQuestion.suggestions ? (
                      <div className="mt-4 grid gap-2">
                        {currentQuestion.suggestions.map((suggestion) => (
                          <button
                            type="button"
                            key={suggestion.value}
                            onClick={() => submitAnswer(suggestion.value)}
                            className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                          >
                            <span>{suggestion.label}</span>
                            <span className="shrink-0 font-medium text-slate-950">{suggestion.meta}</span>
                          </button>
                        ))}
                      </div>
                    ) : null}

                    {currentQuestion.quickReplies ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {currentQuestion.quickReplies.map((option) => (
                          <button
                            type="button"
                            key={option}
                            onClick={() => submitAnswer(option)}
                            className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium capitalize text-slate-700 hover:bg-slate-200"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    ) : null}

                    {currentQuestion.id === 'notes' ? (
                      <div className="mt-4 rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
                        Photo upload placeholder: the production version can accept room, roof, window, appliance, or
                        material photos.
                      </div>
                    ) : null}
                  </div>
                </div>

                <form onSubmit={submitComposer} className="border-t border-slate-200 bg-white px-5 py-4">
                  <div className="flex items-end gap-3">
                    <button
                      type="button"
                      onClick={() => setStep((current) => Math.max(current - 1, 0))}
                      disabled={step === 0}
                      className="rounded-md px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
                    >
                      Back
                    </button>

                    {currentQuestion.multiline ? (
                      <textarea
                        value={reply}
                        onChange={(event) => setReply(event.target.value)}
                        rows={2}
                        placeholder={currentQuestion.placeholder}
                        className="min-h-11 flex-1 resize-none rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-950 outline-1 -outline-offset-1 outline-slate-300 placeholder:text-slate-400 focus:outline-2 focus:-outline-offset-2 focus:outline-slate-950"
                      />
                    ) : (
                      <input
                        value={reply}
                        onChange={(event) => setReply(event.target.value)}
                        placeholder={currentQuestion.placeholder}
                        className="h-11 min-w-0 flex-1 rounded-md bg-slate-50 px-3 text-sm text-slate-950 outline-1 -outline-offset-1 outline-slate-300 placeholder:text-slate-400 focus:outline-2 focus:-outline-offset-2 focus:outline-slate-950"
                      />
                    )}

                    {currentQuestion.optional && !reply.trim() ? (
                      <button
                        type="button"
                        onClick={() => submitAnswer('Skip')}
                        className="rounded-md px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                      >
                        Skip
                      </button>
                    ) : null}

                    <button
                      type="submit"
                      className="inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-slate-950 text-white hover:bg-slate-800"
                      title={isFinalStep ? 'Send lead' : 'Send reply'}
                    >
                      <span className="sr-only">{isFinalStep ? 'Send lead' : 'Send reply'}</span>
                      <Send className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [leads, setLeads] = useLocalStorageState<Lead[]>('supplybird.case-study.leads', seededLeads)
  const [products, setProducts] = useLocalStorageState<Product[]>('supplybird.case-study.products', inventory)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [availability, setAvailability] = useState('All')
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all')
  const [projectType, setProjectType] = useState('All')
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [assistantSource, setAssistantSource] = useState<AssistantSource>('chatbot')
  const [assistantSession, setAssistantSession] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        [product.name, product.category, product.condition, product.specs, product.notes].some((value) =>
          value.toLowerCase().includes(normalizedSearch),
        )
      const matchesCategory = category === 'All' || product.category === category
      const matchesAvailability = availability === 'All' || product.availability === availability
      const matchesProjectType = projectType === 'All' || product.projectType === projectType
      const matchesPrice =
        priceFilter === 'all' ||
        (priceFilter === 'budget' && product.price < 2) ||
        (priceFilter === 'mid' && product.price >= 2 && product.price < 50) ||
        (priceFilter === 'large' && product.price >= 50)

      return matchesSearch && matchesCategory && matchesAvailability && matchesProjectType && matchesPrice
    })
  }, [availability, category, priceFilter, products, projectType, search])

  const openAssistant = () => {
    setSelectedProduct(null)
    setAssistantSource('chatbot')
    setAssistantSession((current) => current + 1)
    setAssistantOpen(true)
  }

  const openAssistantForProduct = (product: Product) => {
    setSelectedProduct(product)
    setAssistantSource('product CTA')
    setAssistantSession((current) => current + 1)
    setAssistantOpen(true)
  }

  const addLead = (lead: Lead) => {
    setLeads((current) => [lead, ...current])
  }

  const updateLeadStatus = (leadId: string, status: LeadStatus) => {
    setLeads((current) => current.map((lead) => (lead.id === leadId ? { ...lead, status } : lead)))
  }

  const saveProduct = (product: Product) => {
    setProducts((current) => {
      const existingProduct = current.some((item) => item.id === product.id)

      if (existingProduct) {
        return current.map((item) => (item.id === product.id ? product : item))
      }

      return [product, ...current]
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Header onOpenAssistant={openAssistant} />

      <main>
        <section id="catalog" className="bg-slate-50 py-8 sm:py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div>
                <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-normal text-slate-500">
                  <Filter className="size-4" aria-hidden="true" />
                  Local catalog
                </p>
                <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
                  Browse SupplyBird-style inventory and send estimate-ready requests.
                </h1>
              </div>
              <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-3 lg:min-w-[480px]">
                <div className="rounded-md bg-white px-4 py-3 shadow-sm ring-1 ring-slate-900/5">
                  <span className="block font-semibold text-slate-950">{products.length}</span>
                  Sample inventory items
                </div>
                <div className="rounded-md bg-white px-4 py-3 shadow-sm ring-1 ring-slate-900/5">
                  <span className="block font-semibold text-slate-950">{leads.length}</span>
                  Captured leads
                </div>
                <div className="rounded-md bg-white px-4 py-3 shadow-sm ring-1 ring-slate-900/5">
                  <span className="block font-semibold text-slate-950">10-6</span>
                  Daily store hours
                </div>
              </div>
            </div>

            <div className="mb-8">
              <CategoryStrip products={products} activeCategory={category} onSelectCategory={setCategory} />
            </div>

            <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:items-start">
              <FilterPanel
                search={search}
                setSearch={setSearch}
                category={category}
                setCategory={setCategory}
                availability={availability}
                setAvailability={setAvailability}
                priceFilter={priceFilter}
                setPriceFilter={setPriceFilter}
                projectType={projectType}
                setProjectType={setProjectType}
                onOpenAssistant={openAssistant}
              />

              <div>
                <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">Inventory results</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {filteredProducts.length} matching item{filteredProducts.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={openAssistant}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-950 shadow-sm ring-1 ring-slate-900/10 hover:bg-slate-50"
                  >
                    <MessageSquareText className="size-4" aria-hidden="true" />
                    Qualify a custom request
                  </button>
                </div>

                {filteredProducts.length ? (
                  <ProductGrid products={filteredProducts} onEstimate={openAssistantForProduct} />
                ) : (
                  <div className="rounded-lg bg-white px-6 py-12 text-center shadow-sm ring-1 ring-slate-900/5">
                    <p className="text-base font-semibold text-slate-950">No matching inventory</p>
                    <p className="mt-2 text-sm text-slate-500">Adjust the filters or start a custom estimate request.</p>
                    <button
                      type="button"
                      onClick={openAssistant}
                      className="mt-5 inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      <MessageSquareText className="size-4" aria-hidden="true" />
                      Start intake
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <OwnerDashboard
          leads={leads}
          products={products}
          onStatusChange={updateLeadStatus}
          onResetLeads={() => setLeads(seededLeads)}
          onSaveProduct={saveProduct}
          onResetProducts={() => setProducts(inventory)}
        />
        <CaseStudySection />
      </main>

      <AssistantDrawer
        key={assistantSession}
        open={assistantOpen}
        source={assistantSource}
        product={selectedProduct}
        products={products}
        onClose={() => setAssistantOpen(false)}
        onSubmitLead={addLead}
      />
    </div>
  )
}

export default App
