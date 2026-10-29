import { Link, useLocation } from 'react-router-dom'

function IconArrow() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
}
function IconGithub() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12"/></svg>
}

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <header className="sticky top-0 z-50 border-b border-lux-white/6 bg-lux-black/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg border border-lux-gold/30 bg-lux-gold/8
            flex items-center justify-center
            group-hover:border-lux-gold/50 group-hover:bg-lux-gold/15 transition-all">
            <span className="text-[11px] font-bold text-lux-gold">A</span>
          </div>
          <span className="text-sm font-semibold text-lux-white tracking-tight">Argus</span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {[
            { to: '/',      label: 'Home'  },
            { to: '/audit', label: 'Audit' },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                pathname === to
                  ? 'text-lux-gold/80 bg-lux-gold/8'
                  : 'text-lux-ice/40 hover:text-lux-white hover:bg-lux-white/5'
              }`}
            >
              {label}
            </Link>
          ))}
          <a
            href="https://github.com/naormeit/argus"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-md text-sm text-lux-ice/40 hover:text-lux-white hover:bg-lux-white/5 transition-colors flex items-center gap-1.5"
          >
            <IconGithub /> GitHub
          </a>
        </nav>

        {/* CTA */}
        <Link
          to="/audit"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg
            bg-lux-gold text-lux-black font-semibold text-sm
            hover:bg-lux-gold/90 transition-colors shadow-md shadow-lux-gold/20"
        >
          Run Audit <IconArrow />
        </Link>
      </div>
    </header>
  )
}
