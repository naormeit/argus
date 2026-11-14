import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

interface Plan {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  cta: string
  highlight: boolean
  action: 'free' | 'credits' | 'pro'
}

const PLANS: Plan[] = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: '3 audits included when you sign up.',
    features: [
      '3 audits on sign-up',
      'Full 4-agent pipeline',
      'Shareable report links',
      'Audit history dashboard',
    ],
    cta: 'Get started free',
    highlight: false,
    action: 'free',
  },
  {
    name: 'Credits',
    price: '$9.99',
    period: 'per 10 audits',
    description: 'Top up whenever you need more.',
    features: [
      '10 audit credits',
      'Credits never expire',
      'Full 4-agent pipeline',
      'Shareable report links',
    ],
    cta: 'Buy 10 audits',
    highlight: true,
    action: 'credits',
  },
  {
    name: 'Pro',
    price: '$29',
    period: 'per month',
    description: 'Unlimited audits for power users.',
    features: [
      'Unlimited audits',
      'Full 4-agent pipeline',
      'Priority processing',
      'Audit history dashboard',
    ],
    cta: 'Start Pro',
    highlight: false,
    action: 'pro',
  },
]

export default function Pricing() {
  const { user, session } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAction = async (action: Plan['action']) => {
    if (action === 'free') {
      navigate(user ? '/audit' : '/login')
      return
    }
    if (!user || !session) {
      navigate('/login?next=/pricing')
      return
    }
    setLoading(action)
    setError(null)
    try {
      const endpoint = action === 'credits' ? '/api/checkout/credits' : '/api/checkout/subscribe'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ email: user.email }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const { url } = await res.json()
      window.location.href = url
    } catch (err) {
      setError('Failed to start checkout. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-lux-black text-lux-white relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(212,160,82,0.03) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <main className="relative z-10 max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-3">Simple, transparent pricing</h1>
          <p className="text-sm text-lux-ice/50">Start free. Scale as you grow.</p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-8 rounded-lg border border-red-700/50 bg-red-900/20 p-3 text-sm text-red-400 text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-6 flex flex-col
                ${plan.highlight
                  ? 'border-lux-gold/40 bg-lux-gold/5'
                  : 'border-lux-white/8 bg-lux-white/2'}`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-lux-gold text-lux-black">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-sm font-semibold text-lux-ice/60 uppercase tracking-widest mb-1">{plan.name}</h2>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-xs text-lux-ice/40">{plan.period}</span>
                </div>
                <p className="text-xs text-lux-ice/40">{plan.description}</p>
              </div>

              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-lux-ice/70">
                    <span className="text-lux-gold/70 flex-shrink-0"><CheckIcon /></span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleAction(plan.action)}
                disabled={loading !== null}
                className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors
                  ${plan.highlight
                    ? 'bg-lux-gold text-lux-black hover:bg-lux-gold/90 shadow-md shadow-lux-gold/20'
                    : 'border border-lux-white/15 text-lux-ice/70 hover:border-lux-white/30 hover:text-white'}
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading === plan.action ? 'Redirecting…' : plan.cta}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-lux-ice/30 mt-10">
          Payments processed securely by Lemon Squeezy. Cancel anytime.
        </p>
      </main>
    </div>
  )
}
