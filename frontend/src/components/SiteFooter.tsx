import { Link } from 'react-router-dom'
import { CONTACT_EMAIL, GITHUB_REPO, LEGAL_LOCATION } from '../lib/site'

const PRODUCT = [
  { label: 'Run an audit', to: '/audit' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'GitHub App', to: '/github' },
]

const COMPANY = [
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

const LEGAL = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
]

export default function SiteFooter() {
  return (
    <footer className="border-t border-lux-white/5 bg-lux-black relative">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 sm:grid-cols-4 gap-8">
        <div className="col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-md border border-lux-gold/30 bg-lux-gold/10 flex items-center justify-center">
              <span className="text-[10px] font-bold font-display text-lux-gold">A</span>
            </div>
            <span className="text-sm font-bold font-display text-lux-white">Argus</span>
          </div>
          <p className="text-xs text-lux-ice/30 leading-relaxed">
            Multi-agent AI security auditor for smart contracts.
          </p>
        </div>

        <div>
          <div className="text-[10px] font-mono text-lux-gold/40 mb-4 uppercase tracking-widest">Product</div>
          <div className="space-y-2.5">
            {PRODUCT.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className="block text-xs text-lux-ice/30 hover:text-lux-gold/70 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-mono text-lux-gold/40 mb-4 uppercase tracking-widest">Company</div>
          <div className="space-y-2.5">
            {COMPANY.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className="block text-xs text-lux-ice/30 hover:text-lux-gold/70 transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-xs text-lux-ice/30 hover:text-lux-gold/70 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>

        <div>
          <div className="text-[10px] font-mono text-lux-gold/40 mb-4 uppercase tracking-widest">Legal</div>
          <div className="space-y-2.5">
            {LEGAL.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className="block text-xs text-lux-ice/30 hover:text-lux-gold/70 transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="block text-xs text-lux-ice/30 hover:text-lux-gold/70 transition-colors break-all"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-lux-white/5 max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row gap-2 items-center justify-between">
        <span className="text-xs text-lux-ice/20">© {new Date().getFullYear()} Argus · {LEGAL_LOCATION}</span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event('argus:consent-open'))}
            className="text-xs text-lux-ice/20 hover:text-lux-gold/60 transition-colors"
          >
            Privacy settings
          </button>
          <span className="text-xs text-lux-ice/20">AI-assisted security analysis — not a substitute for a manual audit</span>
        </div>
      </div>
    </footer>
  )
}
