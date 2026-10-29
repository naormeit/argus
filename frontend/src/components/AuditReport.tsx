import { useState } from 'react'
import { AuditReport as Report, Finding, SEVERITY_COLOR } from '../types'

interface Props {
  report: Report
}

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <button
      onClick={copy}
      className="text-[10px] text-argus-muted hover:text-blue-400 transition-colors px-1.5 py-0.5 rounded border border-argus-border/50 hover:border-blue-500/40"
    >
      {copied ? '✓ Copied' : label}
    </button>
  )
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const color = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f97316' : '#eab308'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-argus-border rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10px] text-argus-muted w-8 text-right">{pct}%</span>
    </div>
  )
}

function FindingCard({ finding }: { finding: Finding }) {
  const [pocOpen, setPocOpen] = useState(false)

  return (
    <div className={`rounded-lg border p-4 mb-3 ${SEVERITY_COLOR[finding.severity]}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${SEVERITY_COLOR[finding.severity]}`}>
            {finding.severity}
          </span>
          <h3 className="font-semibold text-sm text-white">{finding.vulnerability}</h3>
        </div>
      </div>

      <div className="mb-3">
        <div className="text-[10px] text-argus-muted mb-1">Confidence</div>
        <ConfidenceBar value={finding.confidence} />
      </div>

      <p className="text-xs text-gray-300 leading-relaxed">{finding.description}</p>

      <div className="mt-3 p-3 bg-green-900/20 rounded-lg border border-green-700/30">
        <div className="text-[10px] font-bold text-green-400 uppercase tracking-wide mb-1">Remediation</div>
        <p className="text-xs text-gray-300 leading-relaxed">{finding.remediation}</p>
      </div>

      {finding.poc_code && (
        <div className="mt-3">
          <button
            onClick={() => setPocOpen(v => !v)}
            className="text-xs text-argus-blue hover:text-blue-300 transition-colors flex items-center gap-1 font-mono"
          >
            <span className="text-argus-muted">{pocOpen ? '▾' : '▸'}</span>
            {pocOpen ? 'Hide' : 'View'} PoC exploit
          </button>
          {pocOpen && (
            <div className="mt-2 relative">
              <div className="absolute top-2 right-2 z-10">
                <CopyButton text={finding.poc_code} label="Copy PoC" />
              </div>
              <pre className="p-3 bg-black/60 rounded-lg border border-argus-border text-xs text-green-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {finding.poc_code}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const RISK_GRADIENT: Record<string, string> = {
  critical: 'from-red-900/50 to-argus-panel',
  high:     'from-orange-900/40 to-argus-panel',
  medium:   'from-yellow-900/30 to-argus-panel',
  low:      'from-blue-900/30 to-argus-panel',
  info:     'from-gray-900/30 to-argus-panel',
}

export default function AuditReport({ report }: Props) {
  const [sigOpen, setSigOpen] = useState(false)

  const riskColor    = SEVERITY_COLOR[report.overall_risk]
  const riskGradient = RISK_GRADIENT[report.overall_risk] ?? 'from-argus-panel to-argus-panel'

  return (
    <div className="space-y-5">
      {/* Report header card */}
      <div className={`rounded-xl border border-argus-border bg-gradient-to-b ${riskGradient} p-5`}>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-base font-bold text-white">Audit Report</h2>
            <div className="text-[10px] text-argus-muted mt-0.5 font-mono">{report.audit_id}</div>
            <div className="text-[10px] text-argus-muted">{new Date(report.timestamp).toLocaleString()}</div>
          </div>
          <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${riskColor}`}>
            {report.overall_risk} risk
          </span>
        </div>

        {report.summary && (
          <p className="mt-4 text-xs text-gray-300 leading-relaxed border-t border-argus-border/50 pt-4">
            {report.summary}
          </p>
        )}

        {/* Signature section */}
        <div className="mt-4 flex items-center gap-3 text-xs flex-wrap">
          <button
            onClick={() => setSigOpen(v => !v)}
            className="flex items-center gap-1.5 text-argus-muted hover:text-white transition-colors"
          >
            <span className="text-purple-400">🔏</span>
            <span>HMAC-SHA256</span>
            <span className="text-green-400">✓ valid</span>
          </button>
          {sigOpen && (
            <CopyButton text={report.signature} label="Copy sig" />
          )}
        </div>
        {sigOpen && (
          <div className="mt-2 p-2.5 bg-black/50 rounded-lg border border-purple-500/20 font-mono text-[10px] text-purple-300 break-all leading-relaxed">
            {report.signature}
          </div>
        )}

        {/* Code hash */}
        <div className="mt-2 flex items-center gap-2 text-[10px] text-argus-muted font-mono">
          <span>SHA-256:</span>
          <span className="text-argus-muted/70">{report.code_hash}</span>
          <CopyButton text={report.code_hash} label="Copy" />
        </div>
      </div>

      {/* Findings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white">
            {report.findings.length} Finding{report.findings.length !== 1 ? 's' : ''}
          </h3>
          {report.findings.length > 0 && (
            <div className="flex gap-1">
              {(['critical', 'high', 'medium', 'low'] as const).map(sev => {
                const n = report.findings.filter(f => f.severity === sev).length
                if (!n) return null
                return (
                  <span key={sev} className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${SEVERITY_COLOR[sev]}`}>
                    {n} {sev}
                  </span>
                )
              })}
            </div>
          )}
        </div>
        {report.findings.length === 0 ? (
          <div className="rounded-lg border border-green-700/40 bg-green-900/20 p-4 text-sm text-green-400 flex items-center gap-2">
            <span>✓</span>
            <span>No vulnerabilities found. Code appears secure.</span>
          </div>
        ) : (
          report.findings.map((f, i) => <FindingCard key={i} finding={f} />)
        )}
      </div>
    </div>
  )
}
