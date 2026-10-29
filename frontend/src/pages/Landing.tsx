import { Link } from 'react-router-dom'

/* ── Inline SVG icons — no emoji ───────────────────────────── */
function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}
function IconTarget() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  )
}
function IconCode() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>
  )
}
function IconShield() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  )
}
function IconArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  )
}
function IconLock() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  )
}
function IconZap() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  )
}
function IconFile() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  )
}
function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}
function IconGithub() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12"/>
    </svg>
  )
}

/* ── Terminal hero visual ───────────────────────────────────── */
function TerminalPreview() {
  return (
    <div className="relative">
      {/* Subtle glow behind the terminal */}
      <div className="absolute inset-0 bg-blue-600/10 blur-3xl rounded-3xl -z-10 scale-110" />

      <div className="rounded-2xl border border-white/10 bg-zinc-950 overflow-hidden shadow-2xl">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8 bg-black/40">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-white/10" />
            <div className="w-3 h-3 rounded-full bg-white/10" />
            <div className="w-3 h-3 rounded-full bg-white/10" />
          </div>
          <span className="text-xs text-white/30 font-mono ml-2">argus audit</span>
        </div>

        {/* Content */}
        <div className="p-5 font-mono text-sm space-y-4">
          {/* Command */}
          <div>
            <span className="text-white/30">$ </span>
            <span className="text-white/70">argus audit</span>
            <span className="text-blue-400"> VulnerableBank.sol</span>
          </div>

          {/* Agent progress */}
          <div className="space-y-2.5">
            {[
              { name: 'Scout',   time: '8s',  label: 'attack surface mapped' },
              { name: 'Hunter',  time: '14s', label: '3 exploit paths found'  },
              { name: 'Forge',   time: '22s', label: 'PoC exploit generated'  },
              { name: 'Arbiter', time: '6s',  label: 'report verified & signed' },
            ].map(({ name, time, label }) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-white/20 text-xs w-4">↳</span>
                <span className="text-white/60 w-14 text-xs">{name}</span>
                <div className="flex-1 h-px bg-white/8 relative">
                  <div className="absolute inset-0 bg-green-500/60" />
                </div>
                <span className="text-white/30 text-xs w-6 text-right">{time}</span>
                <span className="text-green-400 text-xs">✓</span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-white/6" />

          {/* Finding */}
          <div className="rounded-lg border border-red-500/25 bg-red-500/5 p-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 bg-red-500/15 px-2 py-0.5 rounded">
                CRITICAL
              </span>
              <span className="text-white/80 text-xs">Reentrancy in withdraw()</span>
            </div>
            <div className="text-white/35 text-xs">confidence 97% · PoC exploit attached</div>
            <div className="text-xs text-orange-400/80 mt-1">
              + 2 HIGH · 1 MEDIUM findings
            </div>
          </div>

          {/* Signature */}
          <div className="flex items-center gap-2 text-xs text-white/20">
            <span className="text-green-400/60">✓</span>
            <span>HMAC-SHA256</span>
            <span className="text-white/10">·</span>
            <span className="font-mono text-white/15 truncate">sig: a1b2c3d4e5f6789abc…</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main component ─────────────────────────────────────────── */
export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Very subtle noise/grid — just barely visible */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-28 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div>
          <div className="text-xs text-blue-400 font-mono uppercase tracking-widest mb-6">
            Multi-Agent Security Auditor
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.05] text-white mb-6">
            Find vulnerabilities<br />
            <span className="text-white/40">before attackers do.</span>
          </h1>

          <p className="text-lg text-zinc-400 leading-relaxed mb-10 max-w-lg">
            Argus runs a four-agent AI pipeline — Scout, Hunter, Forge, and Arbiter —
            to analyse your smart contracts and produce a cryptographically signed
            security report in under 90 seconds.
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <Link
              to="/audit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-black font-semibold text-sm
                hover:bg-zinc-100 transition-colors shadow-lg shadow-white/10"
            >
              Run an Audit <IconArrow />
            </Link>
            <a
              href="https://github.com/naormeit/argus"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/10 text-zinc-400
                hover:border-white/20 hover:text-white transition-colors text-sm"
            >
              <IconGithub /> View on GitHub
            </a>
          </div>

          {/* Trust line */}
          <div className="mt-10 flex items-center gap-6 text-xs text-zinc-600">
            <span className="flex items-center gap-1.5 text-zinc-500"><span className="text-green-400"><IconCheck /></span> No sign-up required</span>
            <span className="flex items-center gap-1.5 text-zinc-500"><span className="text-green-400"><IconCheck /></span> Open source</span>
            <span className="flex items-center gap-1.5 text-zinc-500"><span className="text-green-400"><IconCheck /></span> HMAC-signed reports</span>
          </div>
        </div>

        {/* Right — terminal preview */}
        <TerminalPreview />
      </section>

      {/* ── Divider ──────────────────────────────────────── */}
      <div className="border-t border-white/6 max-w-7xl mx-auto" />

      {/* ── Pipeline ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="mb-16">
          <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">The Pipeline</div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Four agents. One signed report.
          </h2>
          <p className="text-zinc-400 mt-3 max-w-xl text-sm leading-relaxed">
            Each agent owns one phase of the audit. Results are passed via HMAC-signed
            handoffs — creating an unbroken chain of custody from first parse to final verdict.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              n: '01', icon: <IconSearch />, name: 'Scout',
              title: 'Attack surface mapping',
              desc: 'Parses every function, modifier, and state variable. Builds a complete call graph and flags all external interactions.',
            },
            {
              n: '02', icon: <IconTarget />, name: 'Hunter',
              title: 'Exploit path reasoning',
              desc: 'Traces data-flow and control-flow to discover reentrancy loops, integer overflows, and access control gaps.',
            },
            {
              n: '03', icon: <IconCode />, name: 'Forge',
              title: 'PoC exploit generation',
              desc: 'Writes working proof-of-concept exploit code for each confirmed vulnerability with step-by-step attack narration.',
            },
            {
              n: '04', icon: <IconShield />, name: 'Arbiter',
              title: 'Verification & signing',
              desc: 'Cross-validates all findings, assigns confidence scores, and seals the report with an HMAC-SHA256 signature.',
            },
          ].map(({ n, icon, name, title, desc }) => (
            <div
              key={n}
              className="group rounded-xl border border-white/8 bg-white/[0.02] p-5
                hover:border-white/16 hover:bg-white/[0.04] transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-9 h-9 rounded-lg border border-white/10 bg-white/5
                  flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:border-white/20 transition-colors">
                  {icon}
                </div>
                <span className="text-xs font-mono text-zinc-700">{n}</span>
              </div>
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">{name}</div>
              <h3 className="text-sm font-semibold text-white mb-2 leading-snug">{title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Divider ──────────────────────────────────────── */}
      <div className="border-t border-white/6 max-w-7xl mx-auto" />

      {/* ── Features ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="mb-16">
          <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">Why Argus</div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Built for serious security work.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <IconZap />,
              title: 'Results in under 90 seconds',
              desc: 'The full four-agent pipeline runs concurrently where possible. You get a complete report faster than a manual review of the imports.',
            },
            {
              icon: <IconCode />,
              title: 'Working PoC exploits',
              desc: 'Forge doesn\'t just flag issues — it writes the exploit. You see exactly how an attacker would drain your contract.',
            },
            {
              icon: <IconFile />,
              title: 'Tamper-evident reports',
              desc: 'Every report is signed with HMAC-SHA256 via Loom-Protocol. The signature proves the findings were generated by this exact pipeline.',
            },
            {
              icon: <IconShield />,
              title: 'Multi-language support',
              desc: 'Supports Solidity, Python, TypeScript, JavaScript, Rust, and Go. The same pipeline handles every language.',
            },
            {
              icon: <IconLock />,
              title: 'Chain of custody',
              desc: 'Each agent-to-agent handoff is signed. If any step is tampered with, the final Arbiter signature will not verify.',
            },
            {
              icon: <IconSearch />,
              title: 'Open source',
              desc: 'The full pipeline is on GitHub. Audit the auditor. Understand exactly what\'s analysing your code.',
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="p-5">
              <div className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-zinc-400 mb-4">
                {icon}
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Divider ──────────────────────────────────────── */}
      <div className="border-t border-white/6 max-w-7xl mx-auto" />

      {/* ── Loom-Protocol ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">Loom-Protocol</div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-4">
            Cryptographic chain of custody.
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-8">
            Most AI tools produce outputs with no provenance. Argus uses Loom-Protocol to
            sign every inter-agent message with HMAC-SHA256. The final report's signature
            is a mathematical proof that the findings were produced by this exact pipeline,
            in this exact order, on this exact code.
          </p>
          <div className="space-y-3">
            {[
              'Every handoff between agents is individually signed',
              'The final signature chains all intermediate signatures',
              'Verification requires only the report and the public key',
            ].map(item => (
              <div key={item} className="flex items-start gap-3 text-sm text-zinc-400">
                <span className="text-green-400 mt-0.5 flex-shrink-0"><IconCheck /></span>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Signature visual */}
        <div className="rounded-xl border border-white/8 bg-white/[0.02] p-6 font-mono text-xs space-y-3">
          <div className="text-zinc-500 mb-2">Loom-Protocol signature chain</div>
          {[
            { label: 'scout→hunter',   sig: 'hmac:2f8a1b4c9d3e7f0a…', ok: true },
            { label: 'hunter→forge',   sig: 'hmac:9c4d2a7e1b6f3c8d…', ok: true },
            { label: 'forge→arbiter',  sig: 'hmac:7e3c9a2f4b1d8e6c…', ok: true },
            { label: 'arbiter→report', sig: 'hmac:1a6f3c8d2e7b4a9c…', ok: true },
          ].map(({ label, sig, ok }) => (
            <div key={label} className="flex items-center gap-3">
              <span className={`flex-shrink-0 ${ok ? 'text-green-400/70' : 'text-red-400'}`}>✓</span>
              <span className="text-zinc-600 w-28">{label}</span>
              <span className="text-zinc-500 truncate">{sig}</span>
            </div>
          ))}
          <div className="border-t border-white/6 pt-3 mt-3">
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span className="text-white/50">chain verified</span>
              <span className="ml-auto text-zinc-700">audit_id: a1b2c3d4</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="border-t border-white/6">
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-white mb-4">
            Ready to audit?
          </h2>
          <p className="text-zinc-400 mb-8 text-sm leading-relaxed max-w-md mx-auto">
            No account. No waiting list. Paste your contract and get a full report with
            working PoC exploits in under 90 seconds.
          </p>
          <Link
            to="/audit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-black font-semibold
              hover:bg-zinc-100 transition-colors text-sm shadow-xl shadow-white/10"
          >
            Start free audit <IconArrow />
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-white/6">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">A</span>
              </div>
              <span className="text-sm font-bold text-white">Argus</span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Multi-agent AI security auditor. Built for the Meta AI Global Hackathon 2026.
            </p>
          </div>

          <div>
            <div className="text-xs font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Product</div>
            <div className="space-y-2">
              {[['Audit', '/audit'], ['How it works', '/#how-it-works']].map(([label, to]) => (
                <Link key={label} to={to} className="block text-xs text-zinc-600 hover:text-white transition-colors">{label}</Link>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Pipeline</div>
            <div className="space-y-2">
              {['Scout', 'Hunter', 'Forge', 'Arbiter'].map(a => (
                <div key={a} className="text-xs text-zinc-600">{a}</div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Links</div>
            <div className="space-y-2">
              <a href="https://github.com/naormeit/argus" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-white transition-colors">
                <IconGithub /> GitHub
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/6 max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xs text-zinc-700">© 2026 Argus</span>
          <span className="text-xs text-zinc-700">Powered by Groq</span>
        </div>
      </footer>
    </div>
  )
}
