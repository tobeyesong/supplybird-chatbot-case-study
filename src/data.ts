export const categoryNames = [
  'Flooring',
  'Vinyl',
  'Laminate',
  'Engineered Hardwood',
  'Decking',
  'Roofing',
  'Windows',
  'Appliances',
  'Other Supplies',
] as const

export type Category = (typeof categoryNames)[number]

export const projectTypes = ['flooring', 'decking', 'roofing', 'window', 'appliance', 'other'] as const

export type ProjectType = (typeof projectTypes)[number]

export type Availability = 'In stock' | 'Low stock' | 'Special order'
export type LeadStatus = 'new' | 'contacted' | 'quoted' | 'won' | 'lost'
export type LeadSource = 'chatbot' | 'product CTA' | 'contact form'
export type Timeline = 'today' | 'this week' | 'this month' | 'just researching'
export type Fulfillment = 'pickup' | 'delivery'

export type Product = {
  id: string
  name: string
  category: Category
  projectType: ProjectType
  price: number
  priceLabel: string
  availability: Availability
  coveragePerBoxSqft: number | null
  stockQuantity: number | null
  stockUnit: string
  condition: string
  specs: string
  notes: string
  image: string
  imageAlt: string
}

export type Lead = {
  id: string
  createdAt: string
  source: LeadSource
  status: LeadStatus
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
  recommendedNextStep: string
}

const imageUrls = {
  flooring: '/supplybird-assets/flooring.png',
  vinyl: '/supplybird-assets/flooring.png',
  decking: '/supplybird-assets/decking.png',
  roofing: '/supplybird-assets/roofing.png',
  windows: '/supplybird-assets/windows.png',
  supplies: '/supplybird-assets/appliances-supplies.png',
}

export const inventory: Product[] = [
  {
    id: 'vinyl-rustic-oak',
    name: 'Rustic Reclaimed Oak Waterproof Vinyl',
    category: 'Vinyl',
    projectType: 'flooring',
    price: 0.99,
    priceLabel: '$0.99 / sq.ft.',
    availability: 'In stock',
    coveragePerBoxSqft: 23.6,
    stockQuantity: 48,
    stockUnit: 'boxes',
    condition: 'Closeout lot, boxed',
    specs: '7 in. planks, 23.6 sq.ft. per carton, 48 cartons available',
    notes: 'Good fit for rentals, basements, mudrooms, and light commercial spaces.',
    image: imageUrls.vinyl,
    imageAlt: 'Room scene with rustic oak vinyl plank flooring.',
  },
  {
    id: 'laminate-harbor-gray',
    name: 'Harbor Gray AC4 Laminate',
    category: 'Laminate',
    projectType: 'flooring',
    price: 1.19,
    priceLabel: '$1.19 / sq.ft.',
    availability: 'Low stock',
    coveragePerBoxSqft: 20.1,
    stockQuantity: 28,
    stockUnit: 'boxes',
    condition: 'Open pallet, inspected',
    specs: '12 mm plank, AC4 wear rating, 760 sq.ft. total coverage',
    notes: 'Durable option for bedrooms, offices, and quick-turn remodels.',
    image: imageUrls.flooring,
    imageAlt: 'Living room with light wood-look flooring.',
  },
  {
    id: 'engineered-maple',
    name: 'Natural Maple Engineered Hardwood',
    category: 'Engineered Hardwood',
    projectType: 'flooring',
    price: 2.85,
    priceLabel: '$2.85 / sq.ft.',
    availability: 'Special order',
    coveragePerBoxSqft: 24.8,
    stockQuantity: null,
    stockUnit: 'boxes',
    condition: 'New supplier run',
    specs: '5 in. width, click-lock, estimate minimum 500 sq.ft.',
    notes: 'Best for customers who want a warmer finished look than vinyl.',
    image: imageUrls.flooring,
    imageAlt: 'Finished interior with wood-look flooring.',
  },
  {
    id: 'decking-coastal-brown',
    name: 'Coastal Brown Composite Deck Board',
    category: 'Decking',
    projectType: 'decking',
    price: 1.4,
    priceLabel: '$1.40 / ln.ft.',
    availability: 'In stock',
    coveragePerBoxSqft: null,
    stockQuantity: 82,
    stockUnit: 'boards',
    condition: 'New, by the board',
    specs: '12 ft., 16 ft., and 20 ft. boards, matching fascia available',
    notes: 'Low-maintenance boards for porch, patio, and full deck builds.',
    image: imageUrls.decking,
    imageAlt: 'Stacked composite decking boards outside.',
  },
  {
    id: 'decking-fascia-slate',
    name: 'Slate Composite Fascia / Skirting',
    category: 'Decking',
    projectType: 'decking',
    price: 2.1,
    priceLabel: '$2.10 / ln.ft.',
    availability: 'Low stock',
    coveragePerBoxSqft: null,
    stockQuantity: 31,
    stockUnit: 'boards',
    condition: 'New, mixed lengths',
    specs: '11.25 in. fascia boards, 12 ft. average length, 31 boards',
    notes: 'Pairs with composite deck boards for finished stair and perimeter details.',
    image: imageUrls.decking,
    imageAlt: 'Composite decking material in a warehouse setting.',
  },
  {
    id: 'roofing-charcoal-bundle',
    name: 'Charcoal Architectural Shingles',
    category: 'Roofing',
    projectType: 'roofing',
    price: 22.99,
    priceLabel: '$22.99 / bundle',
    availability: 'In stock',
    coveragePerBoxSqft: 33.3,
    stockQuantity: 93,
    stockUnit: 'bundles',
    condition: 'New, sealed bundles',
    specs: '33.3 sq.ft. per bundle, 93 bundles available',
    notes: 'Strong candidate for repair jobs, garages, sheds, and full roof estimates.',
    image: imageUrls.roofing,
    imageAlt: 'Roof with dark asphalt shingles.',
  },
  {
    id: 'window-white-vinyl-36',
    name: 'White Vinyl Double-Hung Window',
    category: 'Windows',
    projectType: 'window',
    price: 119,
    priceLabel: '$119 / unit',
    availability: 'In stock',
    coveragePerBoxSqft: null,
    stockQuantity: 18,
    stockUnit: 'units',
    condition: 'New, boxed',
    specs: '36 in. x 48 in., insulated glass, 18 units available',
    notes: 'Good replacement size for rentals and renovation punch lists.',
    image: imageUrls.windows,
    imageAlt: 'Home improvement materials and window installation supplies.',
  },
  {
    id: 'appliance-range-stainless',
    name: 'Stainless Electric Range',
    category: 'Appliances',
    projectType: 'appliance',
    price: 389,
    priceLabel: '$389 / unit',
    availability: 'Low stock',
    coveragePerBoxSqft: null,
    stockQuantity: 3,
    stockUnit: 'units',
    condition: 'Scratch-and-dent, tested',
    specs: '30 in. freestanding range, 4-burner cooktop, 3 units available',
    notes: 'Useful for property turns when speed and budget matter.',
    image: imageUrls.supplies,
    imageAlt: 'Home supplies arranged in a retail warehouse.',
  },
  {
    id: 'other-underlayment-roll',
    name: 'Premium Flooring Underlayment Roll',
    category: 'Other Supplies',
    projectType: 'other',
    price: 36,
    priceLabel: '$36 / roll',
    availability: 'In stock',
    coveragePerBoxSqft: 100,
    stockQuantity: 74,
    stockUnit: 'rolls',
    condition: 'New',
    specs: '100 sq.ft. roll, vapor barrier, 74 rolls available',
    notes: 'Common add-on for vinyl, laminate, and engineered flooring estimates.',
    image: imageUrls.supplies,
    imageAlt: 'Building supplies in a home improvement setting.',
  },
]

export const seededLeads: Lead[] = [
  {
    id: 'lead-101',
    createdAt: '2026-05-21T09:25:00.000Z',
    source: 'chatbot',
    status: 'new',
    projectType: 'flooring',
    productInterest: 'Rustic Reclaimed Oak Waterproof Vinyl',
    estimatedQuantity: '900 sq.ft.',
    urgency: 'this week',
    fulfillment: 'pickup',
    location: 'Newark, OH 43055',
    budget: '$1,000 - $1,500',
    contactName: 'Dana Miller',
    contactMethod: '(740) 555-0188',
    notes: 'Rental turn. Wants enough cartons plus underlayment recommendation.',
    recommendedNextStep: 'Confirm carton count and hold inventory for pickup.',
  },
  {
    id: 'lead-102',
    createdAt: '2026-05-20T15:40:00.000Z',
    source: 'product CTA',
    status: 'contacted',
    projectType: 'decking',
    productInterest: 'Coastal Brown Composite Deck Board',
    estimatedQuantity: '420 linear feet',
    urgency: 'this month',
    fulfillment: 'delivery',
    location: 'Granville, OH 43023',
    budget: '$600 - $900',
    contactName: 'Marcus Lee',
    contactMethod: 'marcus@example.com',
    notes: 'Comparing 16 ft. and 20 ft. board availability for a backyard deck.',
    recommendedNextStep: 'Send board-count estimate with delivery availability.',
  },
]
