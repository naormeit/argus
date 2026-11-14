import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'argus_cookie_consent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
    } catch {
      // localStorage blocked (private browsing) — show banner
      setVisible(true)
    }
  }, [])

  const accept = () => {
    try { localStorage.setItem(STORAGE_KEY, 'accepted') } catch { /* ignore */ }
    setVisible(false)
  }

  const decline = () => {
    try { localStorage.setItem(STORAGE_KEY, 'declined') } catch { /* ignore */ }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-lux-white/8
        bg-lux-black/95 backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <p className="text-xs text-lux-ice/60 leading-relaxed max-w-2xl">
          We use cookies for authentication and, with your consent, for analytics and advertising (Google AdSense).
          See our{' '}
          <Link to="/privacy" className="text-lux-gold hover:underline">Privacy Policy</Link>{' '}
          for details.
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={decline}
            className="px-4 py-1.5 rounded-lg border border-lux-white/15 text-xs font-medium
              text-lux-ice/60 hover:text-lux-ice/90 hover:border-lux-white/30 transition-colors"
          >
            Decline optional
          </button>
          <button
            onClick={accept}
            className="px-4 py-1.5 rounded-lg bg-lux-gold text-lux-black text-xs font-semibold
              hover:bg-lux-gold/90 transition-colors"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  )
}
