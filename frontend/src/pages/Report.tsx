import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import AuditReport from '../components/AuditReport'
import { AuditReport as Report } from '../types'

export default function ReportPage() {
  const { id } = useParams<{ id: string }>()
  const [report, setReport]   = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    fetch(`/api/report/${id}`)
      .then(r => {
        if (!r.ok) throw new Error(r.status === 404 ? 'Report not found.' : `HTTP ${r.status}`)
        return r.json()
      })
      .then(setReport)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div className="min-h-screen bg-lux-black text-lux-white relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(212,160,82,0.03) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <main className="relative z-10 max-w-3xl mx-auto px-4 py-10">
        <div className="mb-6 flex items-center gap-3">
          <Link to="/audit" className="text-xs text-argus-muted hover:text-white transition-colors">← New Audit</Link>
          <span className="text-argus-border">|</span>
          <span className="text-xs text-argus-muted font-mono">{id}</span>
        </div>

        {loading && (
          <div className="flex items-center gap-3 text-argus-muted text-sm">
            <span className="inline-block w-4 h-4 border-2 border-argus-border border-t-blue-400 rounded-full animate-spin" />
            Loading report…
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-700/50 bg-red-900/20 p-4 text-sm text-red-400 font-mono">
            ✗ {error}
          </div>
        )}

        {report && <AuditReport report={report} />}
      </main>
    </div>
  )
}
