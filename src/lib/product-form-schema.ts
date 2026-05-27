import { z } from 'zod'

export const productCategoryValues = ['flooring', 'decking', 'roofing', 'other'] as const

export const productPriceUnits = [
  ['sq_ft', 'Square foot'],
  ['ln_ft', 'Linear foot'],
  ['box', 'Box'],
  ['bundle', 'Bundle'],
  ['board', 'Board'],
  ['roll', 'Roll'],
  ['unit', 'Unit'],
] as const

export const productCoverageUnits = [
  ['', 'None'],
  ['sq_ft', 'Square feet'],
  ['ln_ft', 'Linear feet'],
] as const

const productPriceUnitValues = productPriceUnits.map(([value]) => value) as [string, ...string[]]
const productCoverageUnitValues = productCoverageUnits.map(([value]) => value) as [string, ...string[]]

function requiredNumber(message: string) {
  return z.preprocess((value) => {
    if (value === '' || value === null || typeof value === 'undefined') {
      return undefined
    }

    return Number(value)
  }, z.number(message).min(0, 'Price must be 0 or higher.'))
}

function optionalPositiveNumber(message: string) {
  return z.preprocess((value) => {
    if (value === '' || value === null || typeof value === 'undefined') {
      return null
    }

    return Number(value)
  }, z.number(message).positive('Coverage must be greater than 0.').nullable())
}

export const productFormSchema = z
  .object({
    title: z.string().trim().min(1, 'Product title is required.'),
    slug: z.string().trim().optional().default(''),
    description: z.string().trim().optional().default(''),
    category: z.enum(productCategoryValues, 'Choose a valid category.'),
    subcategory: z.string().trim().optional().default(''),
    price: requiredNumber('Price is required.'),
    price_unit: z.enum(productPriceUnitValues, 'Choose a valid price unit.'),
    coverage_per_box: optionalPositiveNumber('Enter a valid coverage number.'),
    coverage_unit: z.enum(productCoverageUnitValues, 'Choose a valid coverage unit.'),
    image_urls: z.string().optional().default(''),
    images: z.string().optional().default(''),
    in_stock: z.boolean().default(false),
    featured: z.boolean().default(false),
  })
  .superRefine((product, context) => {
    if (product.coverage_per_box && !product.coverage_unit) {
      context.addIssue({
        code: 'custom',
        path: ['coverage_unit'],
        message: 'Choose a coverage unit.',
      })
    }
  })

export type ProductFormValues = z.input<typeof productFormSchema>
export type ParsedProductFormValues = z.output<typeof productFormSchema>
