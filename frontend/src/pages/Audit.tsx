import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CodeEditor from '../components/CodeEditor'
import AgentTimeline from '../components/AgentTimeline'
import AuditReport from '../components/AuditReport'
import { AgentStatus, AuditReport as Report } from '../types'

const LANGUAGES = ['solidity', 'python', 'javascript', 'typescript', 'rust', 'go']

const NETWORKS = [
  { value: 'ethereum', label: 'Ethereum' },
  { value: 'base',     label: 'Base' },
  { value: 'polygon',  label: 'Polygon' },
  { value: 'arbitrum', label: 'Arbitrum' },
  { value: 'bsc',      label: 'BSC' },
]

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

type InputTab = 'paste' | 'address' | 'github'

export default function Audit() {
  const navigate = useNavigate()

  const [inputTab, setInputTab]       = useState<InputTab>('paste')
  const [code, setCode]               = useState(VULNERABLE_BANK)
  const [language, setLanguage]       = useState('solidity')
  const [address, setAddress]         = useState('')
  const [network, setNetwork]         = useState('ethereum')
  const [githubUrl, setGithubUrl]     = useState('')
  const [running, setRunning]         = useState(false)
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null)
  const [agentTimes, setAgentTimes]   = useState<Record<string, number>>({})
  const [report, setReport]           = useState<Report | null>(null)
  const [error, setError]             = useState<string | null>(null)
  const [elapsed, setElapsed]         = useState<number | null>(null)
  const [copied, setCopied]           = useState(false)

  const shareReport = () => {
    if (!report) return
    const url = `${window.location.origin}/report/${report.audit_id}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const viewReport = () => {
    if (!report) return
    navigate(`/report/${report.audit_id}`)
  }

  const startAudit = async () => {
    const isAddress = inputTab === 'address'
    const isGithub  = inputTab === 'github'
    if (isAddress && !address.trim()) return
    if (isGithub  && !githubUrl.trim()) return
    if (!isAddress && !isGithub && !code.trim()) return

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
      let res: Response
      if (isAddress) {
        const params = new URLSearchParams({ address: address.trim(), network })
        res = await fetch(`/api/audit/address?${params}`, { method: 'POST' })
      } else if (isGithub) {
        const params = new URLSearchParams({ url: githubUrl.trim() })
        res = await fetch(`/api/audit/github?${params}`, { method: 'POST' })
      } else {
        res = await fetch('/api/audit/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, language }),
        })
      }

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
    <div className="min-h-screen bg-lux-black text-lux-white relative overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(212,160,82,0.03) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Left column */}
        <div className="space-y-4">
          {/* Page title */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h1 className="text-lg font-bold text-white">Security Audit</h1>
              <p className="text-xs text-argus-muted">Run the 4-agent pipeline on any smart contract</p>
            </div>
            {elapsed && (
              <span className="animate-fade-in text-xs text-argus-muted">
                Completed in <span className="text-green-400 font-semibold">{elapsed}s</span>
              </span>
            )}
          </div>

          {/* Input tab switcher */}
          <div className="flex gap-1 p-1 bg-argus-panel border border-argus-border rounded-lg w-fit">
            {([
              { id: 'paste',   label: '📋 Paste Code' },
              { id: 'address', label: '🔗 Contract Address' },
              { id: 'github',  label: '🐙 GitHub URL' },
            ] as { id: InputTab; label: string }[]).map(({ id, label }) => (
              <button
                key={id}
                onClick={() => !running && setInputTab(id)}
                disabled={running}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 disabled:opacity-40
                  ${inputTab === id
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-argus-muted hover:text-white'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            {inputTab === 'paste' ? (
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                disabled={running}
                className="bg-argus-panel border border-argus-border text-white text-sm rounded-lg px-3 py-2 outline-none
                  focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 disabled:opacity-50 transition-colors"
              >
                {LANGUAGES.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            ) : inputTab === 'address' ? (
              <>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="0x… contract address"
                  disabled={running}
                  className="bg-argus-panel border border-argus-border text-white text-sm rounded-lg px-3 py-2 outline-none
                    focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 disabled:opacity-50 transition-colors
                    placeholder:text-argus-muted/50 font-mono w-72"
                />
                <select
                  value={network}
                  onChange={e => setNetwork(e.target.value)}
                  disabled={running}
                  className="bg-argus-panel border border-argus-border text-white text-sm rounded-lg px-3 py-2 outline-none
                    focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 disabled:opacity-50 transition-colors"
                >
                  {NETWORKS.map(n => (
                    <option key={n.value} value={n.value}>{n.label}</option>
                  ))}
                </select>
              </>
            ) : null /* GitHub URL is in the input area below */}

            <button
              onClick={running ? undefined : startAudit}
              disabled={running || (inputTab === 'paste' ? !code.trim() : inputTab === 'address' ? !address.trim() : !githubUrl.trim())}
              className={`relative flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-sm transition-all duration-200
                disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden
                ${running
                  ? 'btn-shimmer text-white'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/40 hover:shadow-blue-600/40 hover:scale-[1.02] active:scale-[0.98]'
                }`}
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
              <>
                <button
                  onClick={downloadReport}
                  className="animate-fade-in flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-argus-muted
                    border border-argus-border hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-900/10 transition-all"
                >
                  ↓ Download Report
                </button>
                <button
                  onClick={shareReport}
                  className="animate-fade-in flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-argus-muted
                    border border-argus-border hover:border-green-500/50 hover:text-green-400 hover:bg-green-900/10 transition-all"
                >
                  {copied ? '✓ Copied!' : '🔗 Share'}
                </button>
                <button
                  onClick={viewReport}
                  className="animate-fade-in flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-argus-muted
                    border border-argus-border hover:border-purple-500/50 hover:text-purple-400 hover:bg-purple-900/10 transition-all"
                >
                  ↗ View Report
                </button>
              </>
            )}

            {(report || error) && !running && (
              <button
                onClick={reset}
                className="animate-fade-in px-4 py-2 rounded-lg text-sm text-argus-muted
                  border border-argus-border hover:border-white/30 hover:text-white transition-all"
              >
                New Audit
              </button>
            )}
          </div>

          {/* Input area */}
          {inputTab === 'paste' ? (
            <CodeEditor
              value={code}
              onChange={setCode}
              language={language}
              disabled={running}
            />
          ) : inputTab === 'address' ? (
            <div className="rounded-xl border border-argus-border bg-argus-panel p-5 text-sm text-argus-muted space-y-2">
              <p>Enter a verified contract address above. Argus will fetch its source code from the block explorer and run the full audit pipeline.</p>
              <p className="text-xs text-argus-muted/60">Only verified contracts (source published on Etherscan/Basescan/etc.) can be audited.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-argus-border bg-argus-panel p-5 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-argus-muted uppercase tracking-wider">GitHub URL</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={e => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo/blob/main/contracts/Token.sol"
                  disabled={running}
                  className="w-full bg-black/40 border border-argus-border text-white text-sm rounded-lg px-3 py-2.5 outline-none
                    focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 disabled:opacity-50 transition-colors
                    placeholder:text-argus-muted/40 font-mono"
                />
              </div>
              <div className="text-xs text-argus-muted/70 space-y-1">
                <p className="font-semibold text-argus-muted">Supported URL formats:</p>
                <p>• Single file — <span className="font-mono">github.com/owner/repo/blob/main/contracts/Token.sol</span></p>
                <p>• Directory  — <span className="font-mono">github.com/owner/repo/tree/main/contracts</span></p>
                <p>• Repo root  — <span className="font-mono">github.com/owner/repo</span></p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="animate-fade-in-up rounded-lg border border-red-700/50 bg-red-900/20 p-4 text-sm text-red-400 font-mono glow-red">
              ✗ {error}
            </div>
          )}

          {/* Report */}
          {report && <AuditReport report={report} />}
        </div>

        {/* Right column — timeline */}
        <div className="space-y-4">
          <div className={`rounded-xl border bg-argus-panel/90 p-5 sticky top-20 transition-all duration-500 ${
            running ? 'border-blue-500/40 shadow-lg shadow-blue-900/20' : 'border-argus-border'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white tracking-tight">Agent Pipeline</h2>
              {agentStatus?.audit_id && (
                <span className="text-[10px] text-argus-muted font-mono truncate max-w-[120px] bg-black/30 px-1.5 py-0.5 rounded" title={agentStatus.audit_id}>
                  {agentStatus.audit_id.slice(0, 8)}…
                </span>
              )}
            </div>
            <AgentTimeline agentStatus={agentStatus} agentTimes={agentTimes} />

            {agentStatus?.status === 'complete' && (
              <div className="animate-fade-in-up mt-4 p-3 rounded-lg bg-green-900/30 border border-green-700/40 text-xs text-green-400 flex items-center gap-2 glow-green">
                <span className="text-base">✓</span>
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
          <div className={`rounded-xl border bg-argus-panel p-4 transition-all duration-500 ${
            report ? 'border-purple-500/40 shadow-lg shadow-purple-900/20' : 'border-argus-border'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-sm transition-all duration-300 ${
                report ? 'bg-purple-600/40 border border-purple-500/50 shadow-md shadow-purple-900/30' : 'bg-purple-600/20 border border-purple-500/20'
              }`}>🔗</div>
              <div className="text-xs font-bold text-white">Loom-Protocol</div>
            </div>
            <div className="text-xs text-argus-muted leading-relaxed space-y-2">
              {[
                'HMAC-SHA256 signed handoffs',
                'Cryptographic chain of custody',
                'Tamper-evident final report',
              ].map((label, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={`transition-all duration-500 ${report ? 'text-green-400 scale-110' : 'text-argus-border'}`}>●</span>
                  <span className={`transition-colors duration-300 ${report ? 'text-gray-300' : ''}`}>{label}</span>
                </div>
              ))}
            </div>
            {report && (
              <div className="animate-fade-in mt-3 pt-3 border-t border-purple-500/20">
                <div className="text-[10px] text-purple-300/70 font-mono truncate" title={report.signature}>
                  sig: {report.signature.slice(0, 24)}…
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
