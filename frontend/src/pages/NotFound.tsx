import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-lux-black text-lux-white flex items-center justify-center px-6 py-20">
      <div className="max-w-lg w-full text-center">
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-lux-gold/60 mb-4">Error 404</div>
        <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight text-lux-white mb-4">
          This page is not here
        </h1>
        <p className="text-sm text-lux-ice/50 leading-relaxed mb-10">
          The link may be mistyped, or the page may have moved. If you followed a report link, check that the
          whole URL was copied — report IDs are long and case-sensitive.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-lux-gold text-lux-black font-semibold text-sm
              hover:bg-lux-gold/90 transition-colors shadow-md shadow-lux-gold/20"
          >
            Back to home
          </Link>
          <Link
            to="/audit"
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-lux-white/15 text-sm
              text-lux-ice/70 hover:border-lux-gold/40 hover:text-lux-gold/80 transition-colors"
          >
            Run an audit
          </Link>
          <Link
            to="/contact"
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-lux-white/15 text-sm
              text-lux-ice/70 hover:border-lux-gold/40 hover:text-lux-gold/80 transition-colors"
          >
            Contact
          </Link>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-xs text-lux-ice/25">
          <Link to="/pricing" className="hover:text-lux-gold/70 transition-colors">Pricing</Link>
          <Link to="/about" className="hover:text-lux-gold/70 transition-colors">About</Link>
          <Link to="/privacy" className="hover:text-lux-gold/70 transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-lux-gold/70 transition-colors">Terms</Link>
        </div>
      </div>
    </div>
  )
}
