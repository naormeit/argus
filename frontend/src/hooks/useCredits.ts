import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'

interface CreditsInfo {
  credits: number
  plan: 'free' | 'credits' | 'pro'
  subscription_status: string | null
}

export function useCredits() {
  const { session } = useAuth()
  const [info, setInfo] = useState<CreditsInfo | null>(null)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!session?.access_token) { setInfo(null); return }
    setLoading(true)
    try {
      const res = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (res.ok) setInfo(await res.json())
    } catch {
      // non-fatal
    } finally {
      setLoading(false)
    }
  }, [session?.access_token])

  useEffect(() => { refresh() }, [refresh])

  const hasAccess = info
    ? (info.plan === 'pro' && info.subscription_status === 'active') || info.credits > 0
    : null

  return { info, loading, refresh, hasAccess }
}
