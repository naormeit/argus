import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <header className="sticky top-0 z-50 border-b border-argus-border/60 bg-argus-bg/80 header-blur px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 flex items-center justify-center">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-[-2px] rounded-[13px] bg-gradient-to-br from-blue-400 via-purple-500 to-blue-600 opacity-50 blur-sm" />
            <span className="relative text-sm font-bold text-white z-10">A</span>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Argus</h1>
            <p className="text-[10px] text-argus-muted hidden sm:block">Multi-Agent Security Auditor</p>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { to: '/', label: 'Home' },
            { to: '/audit', label: 'Audit' },
            { to: '/how-it-works', label: 'How it works' },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                pathname === to
                  ? 'text-white bg-white/5'
                  : 'text-argus-muted hover:text-white hover:bg-white/5'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <Link
          to="/audit"
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-900/40"
        >
          <span>⚡</span> Run Audit
        </Link>
      </div>
    </header>
  )
}
