import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

function IconGithub() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12"/></svg>
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-lux-gold/15 border border-lux-gold/30 flex items-center justify-center">
        <span className="text-xs font-bold text-lux-gold">{n}</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-lux-white mb-1">{title}</p>
        <div className="text-sm text-lux-ice/50">{children}</div>
      </div>
    </div>
  )
}

export default function GitHub() {
  const { user } = useAuth()
  const [installUrl, setInstallUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/github/install-url')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.url) setInstallUrl(d.url) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (!user) {
    return (
      <div className="min-h-screen bg-lux-black flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-lux-ice/50 text-sm mb-4">Sign in to connect GitHub</p>
          <Link to="/login?next=/github"
            className="px-5 py-2 rounded-lg bg-lux-gold text-lux-black font-semibold text-sm hover:bg-lux-gold/90 transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-lux-black text-lux-white">
      <div className="max-w-2xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl border border-lux-gold/30 bg-lux-gold/8 flex items-center justify-center text-lux-gold">
            <IconGithub />
          </div>
          <h1 className="text-2xl font-bold font-display">GitHub Integration</h1>
        </div>
        <p className="text-lux-ice/50 text-sm mb-10">
          Automatically audit Solidity files whenever a pull request is opened on your repository.
        </p>

        {/* How it works */}
        <div className="bg-lux-white/3 border border-lux-white/8 rounded-xl p-6 mb-8 space-y-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-lux-ice/30 mb-4">How it works</p>
          <Step n={1} title="Install the Argus GitHub App">
            Click the button below to install the app on the repositories you want to protect.
          </Step>
          <Step n={2} title="Open a pull request">
            When a PR is opened (or updated) containing <code className="text-lux-gold/80 text-xs">.sol</code> files, Argus automatically scans them.
          </Step>
          <Step n={3} title="Review findings in the PR">
            Argus posts a detailed security report as a PR comment — directly in GitHub, no dashboard required.
          </Step>
        </div>

        {/* Install button */}
        <div className="flex flex-col items-start gap-3">
          {loading ? (
            <div className="h-10 w-48 rounded-lg bg-lux-white/5 animate-pulse" />
          ) : installUrl ? (
            <a
              href={installUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-lg
                bg-lux-gold text-lux-black font-semibold text-sm
                hover:bg-lux-gold/90 transition-colors shadow-md shadow-lux-gold/20"
            >
              <IconGithub /> Install Argus on GitHub
            </a>
          ) : (
            <div className="text-sm text-lux-ice/40 border border-lux-white/8 rounded-lg px-4 py-3">
              GitHub App not configured yet — check back soon.
            </div>
          )}
          <p className="text-xs text-lux-ice/30">
            Requires <span className="text-lux-ice/50">Contents: read</span> and{' '}
            <span className="text-lux-ice/50">Pull requests: write</span> permissions.
          </p>
        </div>

        {/* Supported file types */}
        <div className="mt-10 pt-8 border-t border-lux-white/6">
          <p className="text-xs font-semibold uppercase tracking-widest text-lux-ice/30 mb-3">Supported</p>
          <div className="flex gap-2 flex-wrap">
            {['Solidity (.sol)', 'Reentrancy', 'Access control', 'Integer overflow', 'Arbitrary calls'].map(tag => (
              <span key={tag} className="px-2.5 py-1 rounded-full text-xs border border-lux-white/10 text-lux-ice/40">
                {tag}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
