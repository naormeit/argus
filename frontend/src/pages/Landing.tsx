import { Link } from 'react-router-dom'

const AGENTS = [
  {
    icon: '🔍',
    name: 'Scout',
    color: 'blue',
    title: 'Attack Surface Mapping',
    desc: 'Parses every function, modifier, and state variable. Identifies external call patterns, access control gaps, and entry points for further analysis.',
  },
  {
    icon: '🎯',
    name: 'Hunter',
    color: 'purple',
    title: 'Exploit Path Reasoning',
    desc: 'Traces data-flow and control-flow graphs to discover reentrancy loops, integer overflow vectors, and privilege escalation chains.',
  },
  {
    icon: '⚒️',
    name: 'Forge',
    color: 'orange',
    title: 'PoC Exploit Generation',
    desc: 'Produces working proof-of-concept exploit code for each confirmed vulnerability, complete with step-by-step attack narration.',
  },
  {
    icon: '🔏',
    name: 'Arbiter',
    color: 'green',
    title: 'Verification & Signing',
    desc: 'Cross-validates all findings, assigns confidence scores, and stamps the final report with an HMAC-SHA256 chain-of-custody signature via Loom-Protocol.',
  },
]

const STATS = [
  { value: '4', label: 'Specialized Agents' },
  { value: '< 90s', label: 'Avg Audit Time' },
  { value: 'HMAC', label: 'Signed Reports' },
  { value: '100%', label: 'Open Source' },
]

const AGENT_COLOR: Record<string, string> = {
  blue:   'from-blue-500/20 to-transparent border-blue-500/30 shadow-blue-900/20',
  purple: 'from-purple-500/20 to-transparent border-purple-500/30 shadow-purple-900/20',
  orange: 'from-orange-500/20 to-transparent border-orange-500/30 shadow-orange-900/20',
  green:  'from-green-500/20 to-transparent border-green-500/30 shadow-green-900/20',
}

const AGENT_ICON_BG: Record<string, string> = {
  blue:   'bg-blue-500/20 border-blue-500/40',
  purple: 'bg-purple-500/20 border-purple-500/40',
  orange: 'bg-orange-500/20 border-orange-500/40',
  green:  'bg-green-500/20 border-green-500/40',
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-argus-bg text-white relative overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-dot-grid opacity-30 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-40 left-[15%] w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-40 right-[15%] w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-900/20 text-xs text-blue-300 mb-8 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          Powered by Groq · Muse Spark + Muse Code
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6 animate-fade-in-up">
          <span className="bg-gradient-to-r from-white via-blue-100 to-blue-300 bg-clip-text text-transparent">
            AI-Powered Smart
          </span>
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-300 bg-clip-text text-transparent">
            Contract Security
          </span>
        </h1>

        <p className="text-lg text-argus-muted max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up stagger-1">
          Argus is a multi-agent pipeline that audits your Solidity, Rust, and Python code in under 90 seconds.
          Four specialized agents — Scout, Hunter, Forge, and Arbiter — collaborate to find and prove vulnerabilities,
          then seal the report with a cryptographic chain of custody.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap animate-fade-in-up stagger-2">
          <Link
            to="/audit"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all hover:scale-[1.03] active:scale-[0.97] shadow-xl shadow-blue-900/50 text-base"
          >
            <span>⚡</span> Start Free Audit
          </Link>
          <a
            href="https://github.com/naormeit/argus"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-argus-border hover:border-white/30 text-argus-muted hover:text-white transition-all text-base"
          >
            <span>⭐</span> GitHub
          </a>
        </div>

        {/* Stats bar */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-px bg-argus-border/40 rounded-2xl overflow-hidden border border-argus-border/40 animate-fade-in-up stagger-3">
          {STATS.map(({ value, label }) => (
            <div key={label} className="bg-argus-panel/80 px-6 py-5 text-center">
              <div className="text-2xl font-extrabold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">{value}</div>
              <div className="text-xs text-argus-muted mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Agent cards ──────────────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div className="text-xs text-blue-400 font-semibold uppercase tracking-widest mb-3">The Pipeline</div>
          <h2 className="text-3xl font-bold text-white">Four Agents. One Report.</h2>
          <p className="text-argus-muted mt-3 max-w-xl mx-auto text-sm">
            Each agent specialises in one phase of security analysis and passes cryptographically signed results to the next.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {AGENTS.map((agent, i) => (
            <div
              key={agent.name}
              className={`relative rounded-2xl border bg-gradient-to-b ${AGENT_COLOR[agent.color]} p-5 shadow-lg animate-fade-in-up`}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {/* Step number */}
              <div className="absolute top-4 right-4 text-[10px] font-mono text-argus-muted/50">{String(i + 1).padStart(2, '0')}</div>

              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-xl mb-4 ${AGENT_ICON_BG[agent.color]}`}>
                {agent.icon}
              </div>
              <div className="text-xs font-bold text-argus-muted uppercase tracking-widest mb-1">{agent.name}</div>
              <h3 className="text-sm font-bold text-white mb-2">{agent.title}</h3>
              <p className="text-xs text-argus-muted/80 leading-relaxed">{agent.desc}</p>

              {/* Connector arrow (not on last) */}
              {i < AGENTS.length - 1 && (
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 hidden lg:flex w-6 h-6 items-center justify-center">
                  <span className="text-argus-border/60 text-xs">→</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20" id="how-it-works">
        <div className="text-center mb-12">
          <div className="text-xs text-purple-400 font-semibold uppercase tracking-widest mb-3">Process</div>
          <h2 className="text-3xl font-bold text-white">How It Works</h2>
        </div>

        <div className="space-y-6">
          {[
            {
              step: '01',
              icon: '📋',
              title: 'Paste Your Contract',
              desc: 'Drop any Solidity, Rust, Python, Go, or TypeScript code into the editor. Argus supports 6 languages out of the box.',
              color: 'blue',
            },
            {
              step: '02',
              icon: '🤖',
              title: 'Agents Collaborate',
              desc: 'The four-agent pipeline runs automatically. Scout maps the surface, Hunter traces exploits, Forge writes PoC code, Arbiter signs the final verdict.',
              color: 'purple',
            },
            {
              step: '03',
              icon: '📄',
              title: 'Get a Signed Report',
              desc: 'Download a tamper-evident JSON report sealed with HMAC-SHA256. Share it with your team or upload it to a smart-contract audit platform.',
              color: 'green',
            },
          ].map(({ step, icon, title, desc, color }, i) => (
            <div
              key={step}
              className={`flex items-start gap-5 p-5 rounded-2xl border border-argus-border/40 bg-argus-panel/60 animate-fade-in-up`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-${color}-500/10 border border-${color}-500/30`}>
                {icon}
              </div>
              <div>
                <div className="text-[10px] font-mono text-argus-muted/50 mb-0.5">{step}</div>
                <h3 className="text-base font-bold text-white mb-1">{title}</h3>
                <p className="text-sm text-argus-muted leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Loom-Protocol highlight ──────────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-900/30 to-argus-panel p-8 shadow-xl shadow-purple-900/20 text-center">
          <div className="w-12 h-12 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-2xl mx-auto mb-4">🔗</div>
          <h2 className="text-2xl font-bold text-white mb-3">Loom-Protocol Chain of Custody</h2>
          <p className="text-argus-muted text-sm max-w-lg mx-auto mb-6 leading-relaxed">
            Every agent-to-agent handoff is signed with HMAC-SHA256. The final Arbiter report carries a cryptographic
            proof that the findings were generated by the exact pipeline — not tampered with after the fact.
          </p>
          <div className="flex justify-center gap-4 flex-wrap text-xs">
            {['HMAC-SHA256 signed handoffs', 'Cryptographic chain of custody', 'Tamper-evident final report'].map(f => (
              <span key={f} className="flex items-center gap-1.5 text-purple-300/80">
                <span className="text-green-400">✓</span> {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ───────────────────────────────────────── */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to audit your contract?</h2>
        <p className="text-argus-muted mb-8 text-sm">Paste your code and get a full security report in under 90 seconds. No sign-up required.</p>
        <Link
          to="/audit"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base transition-all hover:scale-[1.03] active:scale-[0.97] shadow-xl shadow-blue-900/50 btn-shimmer"
        >
          <span>⚡</span> Launch Audit Tool
        </Link>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-argus-border/40 py-8 px-6 text-center text-xs text-argus-muted/60">
        <p>Argus · Multi-Agent Security Auditor · Built for Meta AI Global Hackathon 2026</p>
        <p className="mt-1">
          <a href="https://github.com/naormeit/argus" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">github.com/naormeit/argus</a>
        </p>
      </footer>
    </div>
  )
}
