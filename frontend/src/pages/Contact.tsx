import { Link } from 'react-router-dom'
import { CONTACT_EMAIL, GITHUB_REPO, LEGAL_NAME, mailtoLink } from '../lib/site'

const TOPICS = [
  {
    title: 'Product support',
    body: 'Stuck on an audit, a failed run, or a report you cannot open? Include the report link and roughly when it ran.',
    subject: 'Argus support request',
  },
  {
    title: 'Billing and refunds',
    body: 'Questions about credit packs, Pro subscriptions or an accidental duplicate charge. Include the email used at checkout.',
    subject: 'Argus billing question',
  },
  {
    title: 'Privacy requests',
    body: 'Access, correction or deletion of your account data. We may ask you to verify control of the account email.',
    subject: 'Argus privacy request',
  },
  {
    title: 'Security disclosure',
    body: 'Found a vulnerability in Argus itself? Please report it privately first and give us time to fix it before publication.',
    subject: 'Argus security disclosure',
  },
]

export default function Contact() {
  return (
    <div className="min-h-screen bg-lux-black text-lux-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link to="/" className="text-xs text-lux-ice/40 hover:text-lux-ice/70 transition-colors mb-10 inline-block">
          ← Back to home
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold font-display text-white mb-4 tracking-tight">Contact</h1>
        <p className="text-sm text-lux-ice/60 leading-relaxed mb-8 max-w-2xl">
          Argus is run by a small team, so email is the fastest way to reach us. Use the address below and pick the
          subject that matches your question.
        </p>

        <div className="rounded-2xl border border-lux-gold/25 bg-lux-gold/5 p-6 mb-10">
          <div className="text-[10px] font-mono uppercase tracking-widest text-lux-gold/60 mb-2">Email</div>
          <a
            href={mailtoLink('Argus enquiry')}
            className="text-lg sm:text-xl font-display font-semibold text-lux-gold hover:underline break-all"
          >
            {CONTACT_EMAIL}
          </a>
          <p className="mt-3 text-xs text-lux-ice/50">
            Operated by {LEGAL_NAME}. We usually reply within two business days.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 mb-10">
          {TOPICS.map(topic => (
            <div key={topic.title} className="rounded-xl border border-lux-white/10 bg-lux-white/5 p-4 flex flex-col">
              <h2 className="text-sm font-semibold text-lux-white mb-2">{topic.title}</h2>
              <p className="text-xs text-lux-ice/50 leading-relaxed mb-3 flex-1">{topic.body}</p>
              <a
                href={mailtoLink(topic.subject)}
                className="text-xs font-medium text-lux-gold/80 hover:text-lux-gold transition-colors"
              >
                Email about this →
              </a>
            </div>
          ))}
        </div>

        <section className="text-sm text-lux-ice/60 leading-relaxed">
          <h2 className="text-base font-semibold text-white mb-2">Bug reports and feature requests</h2>
          <p>
            Non-sensitive issues can also be filed publicly in the{' '}
            <a href={`${GITHUB_REPO}/issues`} target="_blank" rel="noopener noreferrer" className="text-lux-gold hover:underline">
              GitHub issue tracker
            </a>
            . Please do not post exploit details for the Argus service itself in a public issue.
          </p>
        </section>

        <div className="mt-12 pt-8 border-t border-lux-white/5 flex flex-wrap gap-6 text-xs text-lux-ice/40">
          <Link to="/about" className="hover:text-lux-gold/70 transition-colors">About Argus</Link>
          <Link to="/privacy" className="hover:text-lux-gold/70 transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-lux-gold/70 transition-colors">Terms of Service</Link>
        </div>
      </div>
    </div>
  )
}
