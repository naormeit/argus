import { useState } from 'react'
import CodeEditor from './components/CodeEditor'
import AgentTimeline from './components/AgentTimeline'
import AuditReport from './components/AuditReport'
import { AgentStatus, AuditReport as Report } from './types'

const LANGUAGES = ['solidity', 'python', 'javascript', 'typescript', 'rust', 'go']

const VULNERABLE_BANK = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title VulnerableBank — DO NOT USE IN PRODUCTION
/// @notice Classic reentrancy vulnerability: state update happens AFTER external call
contract VulnerableBank {
    mapping(address => uint256) public balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() external {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No balance");
        // BUG: external call before state update — reentrancy!
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "Transfer failed");
        balances[msg.sender] = 0;  // too late
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}`

export default function App() {
  const [code, setCode]               = useState(VULNERABLE_BANK)
  const [language, setLanguage]       = useState('solidity')
  const [running, setRunning]         = useState(false)
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null)
  const [agentTimes, setAgentTimes]   = useState<Record<string, number>>({})
  const [report, setReport]           = useState<Report | null>(null)
  const [error, setError]             = useState<string | null>(null)
  const [elapsed, setElapsed]         = useState<number | null>(null)

  const startAudit = async () => {
    if (!code.trim()) return
    setRunning(true)
    setReport(null)
    setError(null)
    setElapsed(null)
    setAgentTimes({})
    setAgentStatus({ audit_id: '', status: 'started', progress: 0 })

    const wallStart = Date.now()
    let lastAgent: string | null = null
    let lastAgentStart = wallStart

    try {
      const res = await fetch('/audit/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `HTTP ${res.status}`)
      }
      if (!res.body) throw new Error('No response body')

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer    = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (raw === '[DONE]') break

          const data: AgentStatus = JSON.parse(raw)
          setAgentStatus(data)

          // track per-agent elapsed time
          if (data.current_agent && data.current_agent !== lastAgent) {
            const now = Date.now()
            if (lastAgent) {
              setAgentTimes(prev => ({ ...prev, [lastAgent!]: Math.round((now - lastAgentStart) / 1000) }))
            }
            lastAgent = data.current_agent
            lastAgentStart = now
          }

          if (data.status === 'complete') {
            const now = Date.now()
            if (lastAgent) {
              setAgentTimes(prev => ({ ...prev, [lastAgent!]: Math.round((now - lastAgentStart) / 1000) }))
            }
            setElapsed(Math.round((now - wallStart) / 1000))
            if (data.report) setReport(data.report)
          }
          if (data.status === 'error') {
            setError('Pipeline error — check browser console for details.')
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setRunning(false)
    }
  }

  const reset = () => {
    setAgentStatus(null)
    setReport(null)
    setError(null)
    setRunning(false)
    setElapsed(null)
    setAgentTimes({})
  }

  const downloadReport = () => {
    if (!report) return
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `argus-report-${report.audit_id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-argus-bg text-white">
      {/* Header */}
      <header className="border-b border-argus-border bg-argus-panel px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold">A</div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">Argus</h1>
            <p className="text-xs text-argus-muted">Multi-Agent Security Auditor · Muse Spark + Muse Code</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {elapsed && (
            <span className="text-xs text-argus-muted">
              Completed in <span className="text-white font-semibold">{elapsed}s</span>
            </span>
          )}
          <div className="text-xs text-argus-muted hidden sm:flex items-center gap-1">
            <span className="text-argus-muted/60">Scout</span>
            <span className="text-argus-border">→</span>
            <span className="text-argus-muted/60">Hunter</span>
            <span className="text-argus-border">→</span>
            <span className="text-argus-muted/60">Forge</span>
            <span className="text-argus-border">→</span>
            <span className="text-argus-muted/60">Arbiter</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Left column */}
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              disabled={running}
              className="bg-argus-panel border border-argus-border text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500 disabled:opacity-50"
            >
              {LANGUAGES.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>

            <button
              onClick={running ? undefined : startAudit}
              disabled={running || !code.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-sm transition-all duration-200
                bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-900/30"
            >
              {running ? (
                <>
                  <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Auditing…
                </>
              ) : (
                <>
                  <span>⚡</span> Run Audit
                </>
              )}
            </button>

            {report && !running && (
              <button
                onClick={downloadReport}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-argus-muted border border-argus-border hover:border-blue-500/50 hover:text-blue-400 transition-colors"
              >
                ↓ Download Report
              </button>
            )}

            {(report || error) && !running && (
              <button
                onClick={reset}
                className="px-4 py-2 rounded-lg text-sm text-argus-muted border border-argus-border hover:border-white/40 transition-colors"
              >
                New Audit
              </button>
            )}
          </div>

          {/* Code editor */}
          <CodeEditor
            value={code}
            onChange={setCode}
            language={language}
            disabled={running}
          />

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-700/50 bg-red-900/20 p-4 text-sm text-red-400 font-mono">
              ✗ {error}
            </div>
          )}

          {/* Report */}
          {report && <AuditReport report={report} />}
        </div>

        {/* Right column — timeline */}
        <div className="space-y-4">
          <div className="rounded-xl border border-argus-border bg-argus-panel p-5 sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white">Agent Pipeline</h2>
              {agentStatus?.audit_id && (
                <span className="text-[10px] text-argus-muted font-mono truncate max-w-[120px]" title={agentStatus.audit_id}>
                  {agentStatus.audit_id.slice(0, 8)}…
                </span>
              )}
            </div>
            <AgentTimeline agentStatus={agentStatus} agentTimes={agentTimes} />

            {agentStatus?.status === 'complete' && (
              <div className="mt-4 p-3 rounded-lg bg-green-900/30 border border-green-700/40 text-xs text-green-400 flex items-center gap-2">
                <span>✓</span>
                <span>All agents complete</span>
              </div>
            )}

            {!agentStatus && (
              <div className="mt-4 text-xs text-argus-muted leading-relaxed">
                Paste code and click <span className="text-white font-semibold">Run Audit</span> to start the 4-agent security pipeline.
              </div>
            )}
          </div>

          {/* Loom-Protocol card */}
          <div className="rounded-xl border border-argus-border bg-argus-panel p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded bg-purple-600/30 border border-purple-500/30 flex items-center justify-center text-[10px]">🔗</div>
              <div className="text-xs font-bold text-white">Loom-Protocol</div>
            </div>
            <div className="text-xs text-argus-muted leading-relaxed space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className={report ? 'text-green-400' : 'text-argus-border'}>●</span>
                <span>HMAC-SHA256 signed handoffs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={report ? 'text-green-400' : 'text-argus-border'}>●</span>
                <span>Cryptographic chain of custody</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={report ? 'text-green-400' : 'text-argus-border'}>●</span>
                <span>Tamper-evident final report</span>
              </div>
            </div>
            {report && (
              <div className="mt-3 pt-3 border-t border-argus-border">
                <div className="text-[10px] text-argus-muted font-mono truncate" title={report.signature}>
                  sig: {report.signature.slice(0, 20)}…
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
