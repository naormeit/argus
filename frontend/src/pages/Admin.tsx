import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface Stats {
  total_audits:   number
  total_findings: number
  recent_7d:      number
  prev_7d:        number
  users_count:    number
  by_risk:        { risk: string; count: number }[]
  by_language:    { language: string; count: number }[]
  by_source_type: { type: string; count: number }[]
  daily_audits:   { date: string; count: number }[]
}

interface AuditRow {
  id:             string
  created_at:     string
  language:       string
  source_type:    string
  source_ref:     string | null
  network:        string | null
  overall_risk:   string | null
  findings_count: number
  summary:        string | null
}

const RISK_COLOR: Record<string, string> = {
  critical: 'text-red-400 bg-red-900/20 border-red-700/40',
  high:     'text-orange-400 bg-orange-900/20 border-orange-700/40',
  medium:   'text-yellow-400 bg-yellow-900/20 border-yellow-700/40',
  low:      'text-green-400 bg-green-900/20 border-green-700/40',
  info:     'text-blue-400 bg-blue-900/20 border-blue-700/40',
}

const RISK_BAR: Record<string, string> = {
  critical: 'bg-red-500',
  high:     'bg-orange-500',
  medium:   'bg-yellow-500',
  low:      'bg-green-500',
  info:     'bg-blue-500',
}

function RiskBadge({ risk }: { risk: string | null }) {
  if (!risk) return <span className="text-xs text-white/30">—</span>
  const cls = RISK_COLOR[risk.toLowerCase()] ?? 'text-gray-400 bg-gray-900/20 border-gray-700/40'
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${cls}`}>
      {risk}
    </span>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/3 px-5 py-4">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-1">{label}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-white/30 mt-0.5">{sub}</div>}
    </div>
  )
}

export default function Admin() {
  const { user, session, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [stats,   setStats]   = useState<Stats | null>(null)
  const [audits,  setAudits]  = useState<AuditRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) navigate('/login')
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (!session) return
    const headers = { Authorization: `Bearer ${session.access_token}` }
    setLoading(true)

    Promise.all([
      fetch('/api/admin/stats',  { headers }).then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json() }),
      fetch('/api/admin/audits?limit=50', { headers }).then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json() }),
    ])
      .then(([s, a]) => { setStats(s); setAudits(a); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [session])

  if (authLoading) return null

  const weekChange = stats
    ? stats.prev_7d === 0
      ? stats.recent_7d > 0 ? '+100%' : '0%'
      : `${stats.recent_7d >= stats.prev_7d ? '+' : ''}${Math.round(((stats.recent_7d - stats.prev_7d) / stats.prev_7d) * 100)}%`
    : '—'

  const maxRisk = stats ? Math.max(...stats.by_risk.map(r => r.count), 1) : 1
  const maxLang = stats ? Math.max(...stats.by_language.map(l => l.count), 1) : 1
  const maxDay  = stats ? Math.max(...stats.daily_audits.map(d => d.count), 1) : 1

  return (
    <div className="min-h-screen bg-lux-black text-lux-white relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(212,160,82,0.03) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-lux-gold/60 border border-lux-gold/20 rounded px-1.5 py-0.5">Admin</span>
            </div>
            <h1 className="text-xl font-bold text-white">Dashboard</h1>
            <p className="text-xs text-white/30 mt-0.5">Usage stats &amp; audit management</p>
          </div>
          <Link to="/audit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-lux-gold text-lux-black font-semibold text-sm hover:bg-lux-gold/90 transition-colors">
            ⚡ New Audit
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-white/30 text-sm">
            <span className="inline-block w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin mr-3" />
            Loading dashboard…
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-700/50 bg-red-900/20 p-6 text-sm text-red-400">
            {error === '403' ? 'Access denied. Set ADMIN_EMAIL on the backend to match your account.' : `Failed to load: ${error}`}
          </div>
        ) : stats ? (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              <StatCard label="Total Audits"   value={stats.total_audits.toLocaleString()} />
              <StatCard label="This Week"      value={stats.recent_7d}  sub={`${weekChange} vs last week`} />
              <StatCard label="Total Findings" value={stats.total_findings.toLocaleString()} />
              <StatCard label="Users"          value={stats.users_count} sub="with at least 1 audit" />
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">

              {/* Risk breakdown */}
              <div className="rounded-xl border border-white/8 bg-white/3 p-5">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">By Risk Level</h2>
                <div className="space-y-2.5">
                  {['critical','high','medium','low','info'].map(risk => {
                    const entry = stats.by_risk.find(r => r.risk === risk)
                    const count = entry?.count ?? 0
                    return (
                      <div key={risk} className="flex items-center gap-3">
                        <span className="w-16 text-[11px] font-bold uppercase text-white/50 text-right">{risk}</span>
                        <div className="flex-1 h-2 rounded-full bg-white/6 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${RISK_BAR[risk] ?? 'bg-gray-500'}`}
                            style={{ width: `${(count / maxRisk) * 100}%` }}
                          />
                        </div>
                        <span className="w-8 text-xs text-white/40 text-right">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Language breakdown */}
              <div className="rounded-xl border border-white/8 bg-white/3 p-5">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">By Language</h2>
                <div className="space-y-2.5">
                  {stats.by_language.slice(0, 6).map(({ language, count }) => (
                    <div key={language} className="flex items-center gap-3">
                      <span className="w-20 text-[11px] font-mono text-white/50 text-right truncate">{language}</span>
                      <div className="flex-1 h-2 rounded-full bg-white/6 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-lux-gold/60 transition-all"
                          style={{ width: `${(count / maxLang) * 100}%` }}
                        />
                      </div>
                      <span className="w-8 text-xs text-white/40 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity chart — last 14 days */}
            {stats.daily_audits.length > 0 && (
              <div className="rounded-xl border border-white/8 bg-white/3 p-5 mb-8">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">Activity — Last 14 Days</h2>
                <div className="flex items-end gap-1 h-16">
                  {(() => {
                    // Fill all 14 days
                    const days: { date: string; count: number }[] = []
                    for (let i = 13; i >= 0; i--) {
                      const d = new Date()
                      d.setDate(d.getDate() - i)
                      const key = d.toISOString().slice(0, 10)
                      const found = stats.daily_audits.find(x => x.date === key)
                      days.push({ date: key, count: found?.count ?? 0 })
                    }
                    return days.map(({ date, count }) => (
                      <div key={date} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div
                          className="w-full rounded-sm bg-lux-gold/40 hover:bg-lux-gold/70 transition-colors"
                          style={{ height: `${Math.max((count / maxDay) * 56, count > 0 ? 4 : 1)}px` }}
                          title={`${date}: ${count}`}
                        />
                      </div>
                    ))
                  })()}
                </div>
                <div className="flex justify-between mt-1 text-[9px] text-white/20">
                  <span>14 days ago</span>
                  <span>today</span>
                </div>
              </div>
            )}

            {/* Source type distribution */}
            <div className="flex gap-3 mb-8 flex-wrap">
              {stats.by_source_type.map(({ type, count }) => (
                <div key={type} className="rounded-lg border border-white/8 bg-white/3 px-4 py-2.5 flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-white/40 tracking-wide">{type}</span>
                  <span className="text-sm font-bold text-white">{count}</span>
                </div>
              ))}
            </div>

            {/* Recent audits table */}
            <div className="rounded-2xl border border-white/8 overflow-hidden">
              <div className="px-5 py-3 bg-white/3 border-b border-white/6 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
                  Recent Audits ({audits.length})
                </span>
              </div>
              <div className="grid grid-cols-[1fr_72px_90px_60px_80px] gap-4 px-5 py-2.5
                bg-white/2 border-b border-white/5
                text-[10px] font-semibold uppercase tracking-widest text-white/20">
                <div>Source</div>
                <div>Lang</div>
                <div>Risk</div>
                <div>Findings</div>
                <div>Date</div>
              </div>
              {audits.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-white/20">No audits yet.</div>
              ) : (
                audits.map((a, i) => (
                  <Link
                    key={a.id}
                    to={`/report/${a.id}`}
                    className={`grid grid-cols-[1fr_72px_90px_60px_80px] gap-4 px-5 py-3 items-center
                      hover:bg-white/4 transition-colors
                      ${i < audits.length - 1 ? 'border-b border-white/5' : ''}`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-white/40 capitalize">{a.source_type}</span>
                        {a.network && <span className="text-[9px] text-white/20 capitalize">{a.network}</span>}
                      </div>
                      {a.source_ref && (
                        <div className="font-mono text-[10px] text-white/30 truncate">{a.source_ref.slice(0, 40)}</div>
                      )}
                    </div>
                    <div className="text-xs font-mono text-white/40">{a.language}</div>
                    <div><RiskBadge risk={a.overall_risk} /></div>
                    <div className="text-sm font-semibold text-white/60">{a.findings_count}</div>
                    <div className="text-[10px] text-white/25">
                      {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </>
        ) : null}
      </main>
    </div>
  )
}
