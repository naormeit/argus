/**
 * Single source of truth for canonical URLs, contact details and social assets.
 * Every value can be overridden at build time so a custom domain needs no code
 * changes:
 *   VITE_SITE_URL       e.g. https://argus.app
 *   VITE_CONTACT_EMAIL  e.g. security@argus.app
 */
const rawSiteUrl = (import.meta.env.VITE_SITE_URL as string | undefined)?.trim()

export const SITE_URL = (rawSiteUrl || 'https://frontend-eight-theta-43.vercel.app').replace(/\/+$/, '')

export const CONTACT_EMAIL =
  ((import.meta.env.VITE_CONTACT_EMAIL as string | undefined)?.trim() || 'necrospre@gmail.com')

export const LEGAL_NAME = 'Naorem Nganthoiba Singh'
export const LEGAL_LOCATION = 'Bangalore, Karnataka, India'

export const SOCIAL_IMAGE = `${SITE_URL}/og.png`
export const GITHUB_REPO = 'https://github.com/naormeit/argus'

export function absoluteUrl(path: string): string {
  if (!path || path === '/') return `${SITE_URL}/`
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export function mailtoLink(subject?: string): string {
  const query = subject ? `?subject=${encodeURIComponent(subject)}` : ''
  return `mailto:${CONTACT_EMAIL}${query}`
}
