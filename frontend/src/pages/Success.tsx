import { Link, useSearchParams } from 'react-router-dom'

export default function Success() {
  const [params] = useSearchParams()
  const type = params.get('type')
  const isPro = type === 'pro'

  return (
    <div className="min-h-screen bg-lux-black text-lux-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-6">{isPro ? '🛡️' : '⚡'}</div>
        <h1 className="text-2xl font-bold text-white mb-3">
          {isPro ? 'Welcome to Pro!' : 'Credits added!'}
        </h1>
        <p className="text-sm text-lux-ice/50 mb-8">
          {isPro
            ? 'You now have unlimited audits, GitHub integration, and priority processing. Run your first audit whenever you\'re ready.'
            : 'Your 10 audit credits have been added to your account. They never expire.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/audit"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg
              bg-lux-gold text-lux-black font-semibold text-sm
              hover:bg-lux-gold/90 transition-colors shadow-md shadow-lux-gold/20"
          >
            Run an Audit
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg
              border border-lux-white/15 text-lux-ice/60 font-semibold text-sm
              hover:border-lux-white/30 hover:text-lux-ice/90 transition-colors"
          >
            View Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
