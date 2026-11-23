import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type Status = 'checking' | 'ready' | 'expired'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [status,   setStatus]   = useState<Status>('checking')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [done,     setDone]     = useState(false)

  useEffect(() => {
    let cancelled = false

    // Supabase puts the recovery token in the URL hash and emits
    // PASSWORD_RECOVERY once it has exchanged it for a session.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return
      if ((event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') && session) {
        setStatus('ready')
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled && session) setStatus('ready')
    })

    // Give the client time to parse the hash before declaring the link dead.
    const timer = window.setTimeout(() => {
      if (!cancelled) setStatus(current => (current === 'checking' ? 'expired' : current))
    }, 3000)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      subscription.unsubscribe()
    }
  }, [])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Use at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('The two passwords do not match.')
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }
    setDone(true)
    window.setTimeout(() => navigate('/dashboard', { replace: true }), 1800)
  }

  return (
    <div className="min-h-screen bg-lux-black text-lux-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2.5 group mb-6">
            <div className="w-9 h-9 rounded-xl border border-lux-gold/30 bg-lux-gold/10
              flex items-center justify-center group-hover:border-lux-gold/50 transition-all">
              <span className="text-sm font-bold font-display text-lux-gold">A</span>
            </div>
            <span className="text-lg font-bold font-display text-lux-white tracking-tight">Argus</span>
          </Link>
          <h1 className="text-xl font-bold text-white">Set a new password</h1>
          <p className="mt-1 text-sm text-lux-ice/40 text-center">
            {status === 'expired'
              ? 'This reset link is no longer valid.'
              : 'Choose a new password for your account.'}
          </p>
        </div>

        <div className="rounded-2xl border border-lux-white/10 bg-lux-white/5 p-6 shadow-2xl">
          {status === 'checking' && (
            <div className="flex items-center justify-center gap-3 py-6 text-sm text-lux-ice/50">
              <span className="inline-block w-4 h-4 border-2 border-lux-ice/20 border-t-lux-gold rounded-full animate-spin" />
              Verifying your reset link…
            </div>
          )}

          {status === 'expired' && (
            <div className="space-y-4 text-sm text-lux-ice/60">
              <p>
                Reset links expire after a short time and can only be used once. Request a new email from the
                sign-in page and open the newest link.
              </p>
              <Link
                to="/login?mode=reset"
                className="block text-center w-full px-4 py-2.5 rounded-lg bg-lux-gold text-lux-black
                  font-semibold text-sm hover:bg-lux-gold/90 transition-colors"
              >
                Request a new link
              </Link>
            </div>
          )}

          {status === 'ready' && !done && (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label htmlFor="new-password" className="block text-xs font-semibold text-lux-ice/60 uppercase tracking-wider mb-1.5">
                  New password
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-lux-white/10 text-white text-sm
                    rounded-lg px-3 py-2.5 outline-none placeholder:text-lux-ice/25
                    focus:border-lux-gold/40 focus:ring-1 focus:ring-lux-gold/20 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-xs font-semibold text-lux-ice/60 uppercase tracking-wider mb-1.5">
                  Confirm new password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirm}
                  onChange={event => setConfirm(event.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-lux-white/10 text-white text-sm
                    rounded-lg px-3 py-2.5 outline-none placeholder:text-lux-ice/25
                    focus:border-lux-gold/40 focus:ring-1 focus:ring-lux-gold/20 transition-colors"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-700/50 bg-red-900/20 px-3 py-2.5 text-xs text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
                  bg-lux-gold text-lux-black font-semibold text-sm hover:bg-lux-gold/90
                  transition-colors shadow-md shadow-lux-gold/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? <span className="inline-block w-4 h-4 border-2 border-lux-black/30 border-t-lux-black rounded-full animate-spin" />
                  : 'Update password'}
              </button>
            </form>
          )}

          {done && (
            <div className="rounded-lg border border-green-700/50 bg-green-900/20 px-3 py-3 text-sm text-green-400">
              Password updated. Taking you to your dashboard…
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-xs text-lux-ice/30 hover:text-lux-ice/60 transition-colors">
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
