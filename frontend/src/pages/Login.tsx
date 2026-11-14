import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const [mode,     setMode]     = useState<'signin' | 'signup' | 'reset'>('signin')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [success,  setSuccess]  = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        navigate('/dashboard')
      }
    } else if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setSuccess('Check your email for a confirmation link.')
      }
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login?mode=update-password`,
      })
      if (error) {
        setError(error.message)
      } else {
        setSuccess('Password reset email sent. Check your inbox.')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-lux-black text-lux-white flex items-center justify-center px-4">
      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(212,160,82,0.03) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2.5 group mb-6">
            <div className="w-9 h-9 rounded-xl border border-lux-gold/30 bg-lux-gold/8
              flex items-center justify-center
              group-hover:border-lux-gold/50 group-hover:bg-lux-gold/15 transition-all">
              <span className="text-sm font-bold font-display text-lux-gold">A</span>
            </div>
            <span className="text-lg font-bold font-display text-lux-white tracking-tight">Argus</span>
          </Link>
          <h1 className="text-xl font-bold text-white">
            {mode === 'signin' ? 'Sign in to your account'
              : mode === 'signup' ? 'Create an account'
              : 'Reset your password'}
          </h1>
          <p className="mt-1 text-sm text-lux-ice/40">
            {mode === 'signin' ? 'Access your audit history'
              : mode === 'signup' ? 'Start auditing smart contracts'
              : 'Enter your email and we\'ll send a reset link'}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-lux-white/8 bg-lux-white/3 backdrop-blur-sm p-6 shadow-2xl">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-lux-ice/60 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-black/40 border border-lux-white/10 text-white text-sm
                  rounded-lg px-3 py-2.5 outline-none placeholder:text-lux-ice/25
                  focus:border-lux-gold/40 focus:ring-1 focus:ring-lux-gold/20 transition-colors"
              />
            </div>

            {mode !== 'reset' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-lux-ice/60 uppercase tracking-wider">
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => { setMode('reset'); setError(null); setSuccess(null) }}
                      className="text-xs text-lux-ice/35 hover:text-lux-gold/70 transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-lux-white/10 text-white text-sm
                    rounded-lg px-3 py-2.5 outline-none placeholder:text-lux-ice/25
                    focus:border-lux-gold/40 focus:ring-1 focus:ring-lux-gold/20 transition-colors"
                />
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-700/50 bg-red-900/20 px-3 py-2.5 text-xs text-red-400">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-lg border border-green-700/50 bg-green-900/20 px-3 py-2.5 text-xs text-green-400">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
                bg-lux-gold text-lux-black font-semibold text-sm
                hover:bg-lux-gold/90 transition-colors shadow-md shadow-lux-gold/20
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-lux-black/30 border-t-lux-black rounded-full animate-spin" />
              ) : mode === 'signin' ? 'Sign In'
                : mode === 'signup' ? 'Create Account'
                : 'Send Reset Email'}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-lux-ice/40">
            {mode === 'reset' ? (
              <button onClick={() => { setMode('signin'); setError(null); setSuccess(null) }}
                className="text-lux-gold hover:text-lux-gold/80 font-medium transition-colors">
                ← Back to sign in
              </button>
            ) : mode === 'signin' ? (
              <>Don't have an account?{' '}
                <button onClick={() => { setMode('signup'); setError(null); setSuccess(null) }}
                  className="text-lux-gold hover:text-lux-gold/80 font-medium transition-colors">
                  Sign up
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button onClick={() => { setMode('signin'); setError(null); setSuccess(null) }}
                  className="text-lux-gold hover:text-lux-gold/80 font-medium transition-colors">
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-xs text-lux-ice/30 hover:text-lux-ice/60 transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
