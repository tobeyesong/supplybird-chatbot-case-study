import type { MetadataRoute } from 'next'
import { categories } from '@/lib/catalog-data'
import { getProducts } from '@/lib/catalog'
import { absoluteUrl } from '@/lib/site-url'

const aboutLastModified = new Date('2026-08-18T00:00:00.000Z')

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts({ actualOnly: true })
  const productDates = products
    .map((product) => product.created_at)
    .filter((date): date is string => Boolean(date))
    .map((date) => new Date(date))
  const inventoryLastModified = productDates.length
    ? new Date(Math.max(...productDates.map((date) => date.getTime())))
    : aboutLastModified

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl('/'),
      lastModified: inventoryLastModified,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: absoluteUrl('/about'),
      lastModified: aboutLastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: absoluteUrl(`/shop/${category.slug}`),
    lastModified: inventoryLastModified,
    changeFrequency: 'daily',
    priority: category.slug === 'flooring' ? 0.9 : 0.8,
    images: [absoluteUrl(category.image)],
  }))

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: absoluteUrl(`/shop/${product.category}/${product.slug}`),
    lastModified: product.created_at ? new Date(product.created_at) : inventoryLastModified,
    changeFrequency: 'daily',
    priority: product.featured ? 0.9 : 0.8,
    images: product.images.map(absoluteUrl),
  }))

  return [...staticPages, ...categoryPages, ...productPages]
}
