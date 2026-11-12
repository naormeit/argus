import { Link } from 'react-router-dom'

export default function Success() {
  return (
    <div className="min-h-screen bg-lux-black text-lux-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-6">⚡</div>
        <h1 className="text-2xl font-bold text-white mb-3">You're all set!</h1>
        <p className="text-sm text-lux-ice/50 mb-8">
          Your credits have been added. Run your next audit whenever you're ready.
        </p>
        <Link
          to="/audit"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg
            bg-lux-gold text-lux-black font-semibold text-sm
            hover:bg-lux-gold/90 transition-colors shadow-md shadow-lux-gold/20"
        >
          Run an Audit
        </Link>
      </div>
    </div>
  )
}
