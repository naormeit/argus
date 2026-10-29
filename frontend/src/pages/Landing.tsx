import { Link } from 'react-router-dom'

/* ── SVG icons ──────────────────────────────────────────────── */
function IconSearch() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
}
function IconTarget() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
}
function IconCode() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
}
function IconShield() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
}
function IconArrow() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
}
function IconLock() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
}
function IconZap() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
}
function IconFile() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
}
function IconCheck() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
}
function IconGithub() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12"/></svg>
}

/* ── Terminal preview ────────────────────────────────────────── */
function TerminalPreview() {
  return (
    <div className="relative">
      {/* Ambient glow — gold tint */}
      <div className="absolute -inset-4 bg-lux-gold/5 blur-3xl rounded-3xl -z-10" />
      <div className="absolute -inset-2 bg-lux-sapphire/10 blur-2xl rounded-3xl -z-10" />

      <div className="rounded-2xl border border-lux-gold/15 bg-lux-black overflow-hidden shadow-2xl">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/6 bg-lux-sapphire/10">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-white/8" />
            <div className="w-3 h-3 rounded-full bg-white/8" />
            <div className="w-3 h-3 rounded-full bg-white/8" />
          </div>
          <span className="text-xs text-lux-ice/30 font-mono ml-2">argus audit</span>
        </div>

        <div className="p-5 font-mono text-sm space-y-4">
          {/* Command */}
          <div>
            <span className="text-lux-ice/20">$ </span>
            <span className="text-lux-ice/50">argus audit</span>
            <span className="text-lux-gold/80"> VulnerableBank.sol</span>
          </div>

          {/* Agent rows */}
          <div className="space-y-2.5">
            {[
              { name: 'Scout',   time: '8s'  },
              { name: 'Hunter',  time: '14s' },
              { name: 'Forge',   time: '22s' },
              { name: 'Arbiter', time: '6s'  },
            ].map(({ name, time }) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-lux-ice/15 text-xs w-4">↳</span>
                <span className="text-lux-silver/50 w-14 text-xs">{name}</span>
                <div className="flex-1 h-px bg-white/6 relative">
                  <div className="absolute inset-0 bg-lux-sapphire/60" />
                  <div className="absolute inset-0 bg-lux-gold/40" style={{ width: '100%' }} />
                </div>
                <span className="text-lux-ice/20 text-xs w-6 text-right">{time}</span>
                <span className="text-lux-gold/70 text-xs">✓</span>
              </div>
            ))}
          </div>

          <div className="border-t border-white/5" />

          {/* Critical finding */}
          <div className="rounded-lg border border-red-500/20 bg-red-900/10 p-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                CRITICAL
              </span>
              <span className="text-lux-silver/70 text-xs">Reentrancy in withdraw()</span>
            </div>
            <div className="text-lux-ice/30 text-xs">confidence 97% · PoC exploit attached</div>
            <div className="text-xs text-lux-gold/60">+ 2 HIGH · 1 MEDIUM findings</div>
          </div>

          {/* Signature */}
          <div className="flex items-center gap-2 text-xs text-lux-ice/15">
            <span className="text-lux-gold/50">✓</span>
            <span>HMAC-SHA256 verified</span>
            <span className="ml-auto font-mono text-lux-ice/10 truncate">sig: a1b2c3d4e5f6…</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Page ───────────────────────────────────────────────────── */
export default function Landing() {
  return (
    <div className="min-h-screen bg-lux-black text-lux-white font-sans">
      {/* Subtle texture */}
      <div className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(212,160,82,0.04) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />
      {/* Deep sapphire vignette top */}
      <div className="fixed top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-lux-sapphire/8 to-transparent pointer-events-none" />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-28 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-lux-gold/70 mb-8">
            <span className="w-4 h-px bg-lux-gold/40" />
            Multi-Agent Security Auditor
            <span className="w-4 h-px bg-lux-gold/40" />
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.05] mb-6">
            <span className="text-lux-white">Find vulnerabilities</span>
            <br />
            <span className="text-lux-ice/30">before attackers do.</span>
          </h1>

          <p className="text-base text-lux-ice/55 leading-relaxed mb-10 max-w-lg">
            Argus runs a four-agent AI pipeline — Scout, Hunter, Forge, and Arbiter —
            to analyse your smart contracts and produce a cryptographically signed
            security report in under 90 seconds.
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <Link
              to="/audit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm
                bg-lux-gold text-lux-black hover:bg-lux-gold/90 transition-colors shadow-lg shadow-lux-gold/20"
            >
              Run an Audit <IconArrow />
            </Link>
            <a
              href="https://github.com/naormeit/argus"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-lux-white/10
                text-lux-ice/50 hover:border-lux-gold/30 hover:text-lux-gold/80 transition-colors text-sm"
            >
              <IconGithub /> View on GitHub
            </a>
          </div>

          {/* Trust */}
          <div className="mt-10 flex items-center gap-6 flex-wrap">
            {['No sign-up required', 'Open source', 'HMAC-signed reports'].map(t => (
              <span key={t} className="flex items-center gap-1.5 text-xs text-lux-ice/35">
                <span className="text-lux-gold/70"><IconCheck /></span> {t}
              </span>
            ))}
          </div>
        </div>

        <TerminalPreview />
      </section>

      {/* ── Divider ──────────────────────────────────────── */}
      <div className="border-t border-lux-white/6 max-w-7xl mx-auto" />

      {/* ── Pipeline ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="mb-16">
          <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-lux-gold/60 mb-4">
            <span className="w-6 h-px bg-lux-gold/30" /> The Pipeline
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-lux-white">
            Four agents. One signed report.
          </h2>
          <p className="text-lux-ice/45 mt-3 max-w-xl text-sm leading-relaxed">
            Each agent owns one phase of the audit. Results are passed via HMAC-signed
            handoffs — creating an unbroken chain of custody from first parse to final verdict.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-lux-white/5 rounded-2xl overflow-hidden border border-lux-white/6">
          {[
            { n: '01', icon: <IconSearch />, name: 'Scout',   title: 'Attack surface mapping',   desc: 'Parses every function, modifier, and state variable. Builds a complete call graph and flags all external interactions.' },
            { n: '02', icon: <IconTarget />, name: 'Hunter',  title: 'Exploit path reasoning',   desc: 'Traces data-flow and control-flow to discover reentrancy loops, integer overflows, and access control gaps.' },
            { n: '03', icon: <IconCode />,   name: 'Forge',   title: 'PoC exploit generation',   desc: 'Writes working proof-of-concept exploit code for each confirmed vulnerability with step-by-step attack narration.' },
            { n: '04', icon: <IconShield />, name: 'Arbiter', title: 'Verification & signing',   desc: 'Cross-validates all findings, assigns confidence scores, and seals the report with HMAC-SHA256 via Loom-Protocol.' },
          ].map(({ n, icon, name, title, desc }) => (
            <div key={n} className="group bg-lux-black p-6 hover:bg-lux-sapphire/10 transition-colors duration-300">
              <div className="flex items-start justify-between mb-5">
                <div className="w-9 h-9 rounded-lg border border-lux-gold/20 bg-lux-gold/5
                  flex items-center justify-center text-lux-gold/60
                  group-hover:border-lux-gold/40 group-hover:text-lux-gold/90 transition-colors">
                  {icon}
                </div>
                <span className="text-xs font-mono text-lux-white/15">{n}</span>
              </div>
              <div className="text-[10px] font-mono text-lux-gold/50 uppercase tracking-widest mb-1">{name}</div>
              <h3 className="text-sm font-semibold text-lux-white/80 mb-2 leading-snug group-hover:text-lux-white transition-colors">{title}</h3>
              <p className="text-xs text-lux-ice/30 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Divider ──────────────────────────────────────── */}
      <div className="border-t border-lux-white/6 max-w-7xl mx-auto" />

      {/* ── Features ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="mb-16">
          <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-lux-gold/60 mb-4">
            <span className="w-6 h-px bg-lux-gold/30" /> Why Argus
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-lux-white">
            Built for serious security work.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <IconZap />,    title: 'Results in under 90 seconds',  desc: 'The full four-agent pipeline runs concurrently where possible. You get a complete report faster than a manual review of the imports.' },
            { icon: <IconCode />,   title: 'Working PoC exploits',         desc: "Forge doesn't just flag issues — it writes the exploit. You see exactly how an attacker would drain your contract." },
            { icon: <IconFile />,   title: 'Tamper-evident reports',       desc: 'Every report is signed with HMAC-SHA256. The signature proves the findings were generated by this exact pipeline.' },
            { icon: <IconShield />, title: 'Multi-language support',       desc: 'Supports Solidity, Python, TypeScript, JavaScript, Rust, and Go. The same pipeline handles every language.' },
            { icon: <IconLock />,   title: 'Chain of custody',             desc: 'Each agent-to-agent handoff is signed. If any step is tampered with, the final Arbiter signature will not verify.' },
            { icon: <IconSearch />, title: 'Open source',                  desc: "The full pipeline is on GitHub. Audit the auditor. Understand exactly what's analysing your code." },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="group p-6 rounded-xl border border-lux-white/6 hover:border-lux-gold/20 hover:bg-lux-sapphire/8 transition-all duration-300">
              <div className="w-8 h-8 rounded-lg border border-lux-gold/20 bg-lux-gold/5
                flex items-center justify-center text-lux-gold/50 mb-4
                group-hover:border-lux-gold/40 group-hover:text-lux-gold/80 transition-colors">
                {icon}
              </div>
              <h3 className="text-sm font-semibold text-lux-white/80 mb-2 group-hover:text-lux-white transition-colors">{title}</h3>
              <p className="text-xs text-lux-ice/30 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Divider ──────────────────────────────────────── */}
      <div className="border-t border-lux-white/6 max-w-7xl mx-auto" />

      {/* ── Loom-Protocol ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-lux-gold/60 mb-4">
            <span className="w-6 h-px bg-lux-gold/30" /> Loom-Protocol
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-lux-white mb-4">
            Cryptographic chain of custody.
          </h2>
          <p className="text-lux-ice/45 text-sm leading-relaxed mb-8">
            Most AI tools produce outputs with no provenance. Argus uses Loom-Protocol to
            sign every inter-agent message with HMAC-SHA256. The final report's signature
            is a mathematical proof that the findings were produced by this exact pipeline,
            in this exact order, on this exact code.
          </p>
          <div className="space-y-3">
            {[
              'Every handoff between agents is individually signed',
              'The final signature chains all intermediate signatures',
              'Verification requires only the report and the secret key',
            ].map(item => (
              <div key={item} className="flex items-start gap-3 text-sm text-lux-ice/40">
                <span className="text-lux-gold/60 mt-0.5 flex-shrink-0"><IconCheck /></span>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Signature chain visual */}
        <div className="rounded-xl border border-lux-sapphire/40 bg-lux-sapphire/8 p-6 font-mono text-xs space-y-3">
          <div className="text-lux-ice/30 mb-2 text-[10px] uppercase tracking-wider">Loom-Protocol · signature chain</div>
          {[
            { label: 'scout → hunter',   sig: 'hmac:2f8a1b4c9d3e7f0a…' },
            { label: 'hunter → forge',   sig: 'hmac:9c4d2a7e1b6f3c8d…' },
            { label: 'forge → arbiter',  sig: 'hmac:7e3c9a2f4b1d8e6c…' },
            { label: 'arbiter → report', sig: 'hmac:1a6f3c8d2e7b4a9c…' },
          ].map(({ label, sig }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-lux-gold/50 flex-shrink-0">✓</span>
              <span className="text-lux-ice/30 w-28">{label}</span>
              <span className="text-lux-ice/20 truncate">{sig}</span>
            </div>
          ))}
          <div className="border-t border-lux-gold/10 pt-3">
            <div className="flex items-center gap-2">
              <span className="text-lux-gold/70">✓</span>
              <span className="text-lux-silver/50">chain verified</span>
              <span className="ml-auto text-lux-ice/20">audit_id: a1b2c3d4</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="border-t border-lux-white/6">
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-lux-gold/50 mb-6">
            <span className="w-6 h-px bg-lux-gold/25" /> Get started <span className="w-6 h-px bg-lux-gold/25" />
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-lux-white mb-4">
            Ready to audit?
          </h2>
          <p className="text-lux-ice/40 mb-10 text-sm leading-relaxed max-w-md mx-auto">
            No account. No waiting list. Paste your contract and get a full report
            with working PoC exploits in under 90 seconds.
          </p>
          <Link
            to="/audit"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-lg font-semibold text-sm
              bg-lux-gold text-lux-black hover:bg-lux-gold/90 transition-colors shadow-xl shadow-lux-gold/20"
          >
            Start free audit <IconArrow />
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-lux-white/6">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md border border-lux-gold/30 bg-lux-gold/10 flex items-center justify-center">
                <span className="text-[10px] font-bold text-lux-gold">A</span>
              </div>
              <span className="text-sm font-bold text-lux-white">Argus</span>
            </div>
            <p className="text-xs text-lux-ice/25 leading-relaxed">
              Multi-agent AI security auditor.<br />Built for Meta AI Global Hackathon 2026.
            </p>
          </div>

          <div>
            <div className="text-[10px] font-mono text-lux-gold/40 mb-4 uppercase tracking-widest">Product</div>
            <div className="space-y-2.5">
              {[['Audit', '/audit'], ['Home', '/']].map(([label, to]) => (
                <Link key={label} to={to} className="block text-xs text-lux-ice/30 hover:text-lux-gold/70 transition-colors">{label}</Link>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-mono text-lux-gold/40 mb-4 uppercase tracking-widest">Pipeline</div>
            <div className="space-y-2.5">
              {['Scout', 'Hunter', 'Forge', 'Arbiter'].map(a => (
                <div key={a} className="text-xs text-lux-ice/25">{a}</div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-mono text-lux-gold/40 mb-4 uppercase tracking-widest">Links</div>
            <div className="space-y-2.5">
              <a href="https://github.com/naormeit/argus" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-lux-ice/30 hover:text-lux-gold/70 transition-colors">
                <IconGithub /> GitHub
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-lux-white/5 max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xs text-lux-ice/15">© 2026 Argus</span>
          <span className="text-xs text-lux-ice/15">Powered by Groq</span>
        </div>
      </footer>
    </div>
  )
}
