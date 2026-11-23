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

    const open = () => setVisible(true)
    window.addEventListener('argus:consent-open', open)
    return () => window.removeEventListener('argus:consent-open', open)
  }, [])

  const choose = (choice: 'accepted' | 'declined') => {
    try { localStorage.setItem(STORAGE_KEY, choice) } catch { /* ignore */ }
    // Analytics or other optional scripts can listen for this event and only
    // initialise when `analytics` is true.
    window.dispatchEvent(new CustomEvent('argus:consent', { detail: { analytics: choice === 'accepted' } }))
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Privacy preferences"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-lux-white/10
        bg-lux-black/95 backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <p className="text-xs text-lux-ice/60 leading-relaxed max-w-2xl">
          We keep your sign-in session in your browser and store this choice locally. Optional analytics only
          run with your consent, and we do not use advertising cookies. See our{' '}
          <Link to="/privacy" className="text-lux-gold hover:underline">Privacy Policy</Link>{' '}
          for the full list of processors.
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => choose('declined')}
            className="px-4 py-1.5 rounded-lg border border-lux-white/15 text-xs font-medium
              text-lux-ice/60 hover:text-lux-ice/90 hover:border-lux-white/30 transition-colors"
          >
            Essential only
          </button>
          <button
            onClick={() => choose('accepted')}
            className="px-4 py-1.5 rounded-lg bg-lux-gold text-lux-black text-xs font-semibold
              hover:bg-lux-gold/90 transition-colors"
          >
            Allow analytics
          </button>
        </div>
      </div>
    </div>
  )
}
