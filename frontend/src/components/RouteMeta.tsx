import { Helmet } from 'react-helmet-async'
import { matchPath, useLocation } from 'react-router-dom'
import { CONTACT_EMAIL, LEGAL_LOCATION, LEGAL_NAME, SITE_URL, SOCIAL_IMAGE } from '../lib/site'

interface PageMeta {
  title: string
  description: string
  /** Canonical path. Dynamic routes collapse to a stable parent path. */
  path: string
  noindex?: boolean
  ogType?: 'website' | 'article'
}

const HOME_DESCRIPTION =
  'Argus runs four AI security agents over your smart contracts: risk triage, vulnerability hunting, working proof-of-concept exploits and a signed report in under 90 seconds.'

const PAGES: Record<string, PageMeta> = {
  '/': {
    title: 'Argus — Multi-Agent Smart Contract Security Auditor',
    description: HOME_DESCRIPTION,
    path: '/',
  },
  '/pricing': {
    title: 'Pricing — Argus',
    description:
      'Start with 3 free smart contract audits. Buy a 10-audit credit pack for $9.99 or get unlimited audits with Pro for $29/month. Cancel anytime.',
    path: '/pricing',
  },
  '/about': {
    title: 'About — Argus',
    description:
      'Argus is an independent, multi-agent AI security auditor for Ethereum and EVM smart contracts, built by Naorem Nganthoiba Singh.',
    path: '/about',
  },
  '/contact': {
    title: 'Contact — Argus',
    description: 'Contact the Argus team for support, security disclosures, privacy requests or billing questions.',
    path: '/contact',
  },
  '/privacy': {
    title: 'Privacy Policy — Argus',
    description:
      'How Argus collects, uses and protects your account data, submitted smart contract code and billing information.',
    path: '/privacy',
  },
  '/terms': {
    title: 'Terms of Service — Argus',
    description: 'The terms that govern your use of Argus, including credits, subscriptions, refunds and liability.',
    path: '/terms',
  },
  '/audit': {
    title: 'Run an audit — Argus',
    description: 'Paste a contract, fetch verified source from a block explorer, or scan a GitHub repository.',
    path: '/audit',
    noindex: true,
  },
  '/login': {
    title: 'Sign in — Argus',
    description: 'Sign in to your Argus account to run audits and view your reports.',
    path: '/login',
    noindex: true,
  },
  '/reset-password': {
    title: 'Reset your password — Argus',
    description: 'Choose a new password for your Argus account.',
    path: '/reset-password',
    noindex: true,
  },
  '/dashboard': {
    title: 'Dashboard — Argus',
    description: 'Your Argus audit history, credit balance and reports.',
    path: '/dashboard',
    noindex: true,
  },
  '/success': {
    title: 'Purchase complete — Argus',
    description: 'Your Argus purchase was completed.',
    path: '/success',
    noindex: true,
  },
  '/github': {
    title: 'GitHub App — Argus',
    description: 'Install the Argus GitHub App to scan pull requests automatically.',
    path: '/github',
    noindex: true,
  },
  '/admin': {
    title: 'Admin — Argus',
    description: 'Argus administration.',
    path: '/admin',
    noindex: true,
  },
}

const NOT_FOUND: PageMeta = {
  title: 'Page not found — Argus',
  description: 'The page you are looking for does not exist.',
  path: '/404',
  noindex: true,
}

const REPORT_META: PageMeta = {
  title: 'Security audit report — Argus',
  description: 'A smart contract security audit produced by the Argus multi-agent pipeline.',
  path: '/report',
  noindex: true,
}

/** Resolve metadata for the current path. Unknown paths are noindexed. */
export function pageMetaFor(pathname: string): PageMeta {
  const normalized = pathname !== '/' ? pathname.replace(/\/+$/, '') : '/'
  if (PAGES[normalized]) return PAGES[normalized]
  if (matchPath('/report/:id', normalized)) return REPORT_META
  return NOT_FOUND
}

export default function RouteMeta() {
  const { pathname } = useLocation()
  const meta = pageMetaFor(pathname)
  const canonical = meta.path === '/' ? `${SITE_URL}/` : `${SITE_URL}${meta.path}`
  const jsonLd = meta.path === '/'
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            name: 'Argus',
            url: `${SITE_URL}/`,
            logo: `${SITE_URL}/favicon.svg`,
            email: CONTACT_EMAIL,
            founder: { '@type': 'Person', name: LEGAL_NAME },
            address: {
              '@type': 'PostalAddress',
              addressLocality: LEGAL_LOCATION.split(',')[0]?.trim(),
              addressRegion: 'Karnataka',
              addressCountry: 'IN',
            },
          },
          {
            '@type': 'WebSite',
            name: 'Argus',
            url: `${SITE_URL}/`,
            description: 'Multi-agent AI security auditor for smart contracts.',
          },
          {
            '@type': 'SoftwareApplication',
            name: 'Argus',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            description: 'Automated multi-agent security analysis for Ethereum and EVM smart contracts.',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          },
        ],
      }
    : null

  return (
    <Helmet prioritizeSeoTags>
      <html lang="en" />
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <link rel="canonical" href={canonical} />
      <meta
        name="robots"
        content={meta.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'}
      />
      <meta property="og:site_name" content="Argus" />
      <meta property="og:type" content={meta.ogType ?? 'website'} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={SOCIAL_IMAGE} />
      <meta property="og:image:alt" content="Argus — multi-agent smart contract security auditor" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={SOCIAL_IMAGE} />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  )
}
