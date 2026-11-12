import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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

const RISK_COLORS: Record<string, string> = {
  critical: 'text-red-400 bg-red-900/20 border-red-700/40',
  high:     'text-orange-400 bg-orange-900/20 border-orange-700/40',
  medium:   'text-yellow-400 bg-yellow-900/20 border-yellow-700/40',
  low:      'text-green-400 bg-green-900/20 border-green-700/40',
  info:     'text-blue-400 bg-blue-900/20 border-blue-700/40',
}

function RiskBadge({ risk }: { risk: string | null }) {
  if (!risk) return <span className="text-xs text-argus-muted">—</span>
  const cls = RISK_COLORS[risk.toLowerCase()] ?? 'text-gray-400 bg-gray-900/20 border-gray-700/40'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${cls}`}>
      {risk}
    </span>
  )
}

function SourceLabel({ type, ref: sourceRef }: { type: string; ref: string | null; network: string | null }) {
  if (type === 'address' && sourceRef) {
    return <span className="font-mono text-xs text-lux-ice/50">{sourceRef.slice(0, 10)}…</span>
  }
  if (type === 'github' && sourceRef) {
    const short = sourceRef.replace(/https?:\/\/github\.com\//, '')
    return <span className="font-mono text-xs text-lux-ice/50">{short.slice(0, 32)}{short.length > 32 ? '…' : ''}</span>
  }
  return <span className="text-xs text-lux-ice/40 capitalize">{type}</span>
}

export default function Dashboard() {
  const { user, session, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [audits,  setAudits]  = useState<AuditRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (!session) return
    setLoading(true)
    fetch('/api/audits/me', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data: AuditRow[]) => { setAudits(data); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [session])

  if (authLoading) return null

  const email = user?.email ?? ''

  return (
    <div className="min-h-screen bg-lux-black text-lux-white relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(212,160,82,0.03) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <main className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">My Audits</h1>
            <p className="text-xs text-lux-ice/40 mt-0.5">{email}</p>
          </div>
          <Link
            to="/audit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg
              bg-lux-gold text-lux-black font-semibold text-sm
              hover:bg-lux-gold/90 transition-colors shadow-md shadow-lux-gold/20"
          >
            ⚡ New Audit
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-lux-ice/30 text-sm">
            <span className="inline-block w-5 h-5 border-2 border-lux-ice/20 border-t-lux-ice/60 rounded-full animate-spin mr-3" />
            Loading audits…
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-700/50 bg-red-900/20 p-4 text-sm text-red-400">
            Failed to load audits: {error}
          </div>
        ) : audits.length === 0 ? (
          <div className="rounded-2xl border border-lux-white/8 bg-lux-white/3 p-12 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="text-lg font-bold text-white mb-2">No audits yet</h2>
            <p className="text-sm text-lux-ice/40 mb-6">
              Run your first smart contract audit to see results here.
            </p>
            <Link
              to="/audit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                bg-lux-gold text-lux-black font-semibold text-sm
                hover:bg-lux-gold/90 transition-colors shadow-md shadow-lux-gold/20"
            >
              ⚡ Run Your First Audit
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-lux-white/8 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_80px_90px_90px_60px] gap-4 px-5 py-3
              bg-lux-white/3 border-b border-lux-white/6
              text-[10px] font-semibold uppercase tracking-widest text-lux-ice/30">
              <div>Source</div>
              <div>Language</div>
              <div>Risk</div>
              <div>Findings</div>
              <div>Date</div>
            </div>

            {/* Rows */}
            {audits.map((audit, i) => (
              <Link
                key={audit.id}
                to={`/report/${audit.id}`}
                className={`grid grid-cols-[1fr_80px_90px_90px_60px] gap-4 px-5 py-3.5 items-center
                  hover:bg-lux-white/4 transition-colors cursor-pointer group
                  ${i < audits.length - 1 ? 'border-b border-lux-white/5' : ''}`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-lux-ice/70 capitalize">{audit.source_type}</span>
                    {audit.network && (
                      <span className="text-[10px] text-lux-ice/30 capitalize">{audit.network}</span>
                    )}
                  </div>
                  <div className="mt-0.5 truncate">
                    <SourceLabel type={audit.source_type} ref={audit.source_ref} network={audit.network} />
                  </div>
                  {audit.summary && (
                    <p className="mt-0.5 text-[11px] text-lux-ice/30 truncate">{audit.summary.slice(0, 80)}</p>
                  )}
                </div>
                <div className="text-xs text-lux-ice/50 font-mono">{audit.language}</div>
                <div><RiskBadge risk={audit.overall_risk} /></div>
                <div className="text-sm font-semibold text-lux-ice/70">
                  {audit.findings_count}
                  <span className="text-xs text-lux-ice/30 ml-1">finding{audit.findings_count !== 1 ? 's' : ''}</span>
                </div>
                <div className="text-[10px] text-lux-ice/30">
                  {new Date(audit.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
