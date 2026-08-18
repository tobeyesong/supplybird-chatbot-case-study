const defaultSiteUrl = 'https://modhauschat.netlify.app'

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.URL || defaultSiteUrl
  const normalizedUrl = /^https?:\/\//i.test(configuredUrl) ? configuredUrl : `https://${configuredUrl}`

  try {
    return new URL(normalizedUrl)
  } catch {
    return new URL(defaultSiteUrl)
  }
}

export function absoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path
  return new URL(path, getSiteUrl()).toString()
}
