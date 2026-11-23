import { Link } from 'react-router-dom'
import { CONTACT_EMAIL, LEGAL_LOCATION, LEGAL_NAME, mailtoLink } from '../lib/site'

const UPDATED = '23 November 2026'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-white mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

export default function Privacy() {
  return (
    <div className="min-h-screen bg-lux-black text-lux-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link to="/" className="text-xs text-lux-ice/40 hover:text-lux-ice/70 transition-colors mb-10 inline-block">
          ← Back to home
        </Link>

        <h1 className="text-3xl font-bold font-display text-white mb-2 tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-lux-ice/40 mb-10">Last updated: {UPDATED}</p>

        <div className="space-y-8 text-sm text-lux-ice/70 leading-relaxed">
          <Section title="1. Who is responsible">
            <p>
              Argus is operated by {LEGAL_NAME}, {LEGAL_LOCATION} ("Argus", "we", "us"). We are the controller of
              the personal data described here. For any privacy question or request, email{' '}
              <a href={mailtoLink('Argus privacy request')} className="text-lux-gold hover:underline">{CONTACT_EMAIL}</a>.
            </p>
            <p>
              This policy explains what we collect, why, who processes it, how long we keep it, and the rights you
              have. It applies to the Argus website, API and audit service.
            </p>
          </Section>

          <Section title="2. Data we collect">
            <ul className="space-y-2 list-disc pl-5">
              <li>
                <strong className="text-lux-ice/90">Account data.</strong> Your email address and an
                authentication record managed by Supabase. Passwords are hashed by Supabase Auth; we never see
                them. If you enable a GitHub App installation, we also receive the installation ID and the
                repository metadata needed to scan pull requests.
              </li>
              <li>
                <strong className="text-lux-ice/90">Submitted code and reports.</strong> Smart contract source
                code you paste or fetch, the source reference (contract address or repository/PR URL), the
                requested network, and the generated report. These are stored so you can revisit and share your
                audit history.
              </li>
              <li>
                <strong className="text-lux-ice/90">Billing data.</strong> Purchases are handled by Lemon Squeezy
                as merchant of record. We receive an order or subscription identifier, your customer ID, the
                email used at checkout, the product purchased and its status. We do not receive or store full
                card numbers.
              </li>
              <li>
                <strong className="text-lux-ice/90">Usage and security data.</strong> IP address, request paths,
                timestamps, user agent and error information in server logs, kept to operate the service, rate
                limit abuse and investigate incidents.
              </li>
              <li>
                <strong className="text-lux-ice/90">Local storage.</strong> Your Supabase session and your
                privacy choice are stored in your browser's local storage. See section 7.
              </li>
            </ul>
          </Section>

          <Section title="3. Why we use it">
            <ul className="space-y-2 list-disc pl-5">
              <li>To create and secure your account, and to authenticate requests (performance of a contract).</li>
              <li>To run the audit pipeline and store or display the resulting report (contract).</li>
              <li>To process credit packs and Pro subscriptions, prevent duplicate webhook processing and reconcile orders (contract and legal obligations).</li>
              <li>To keep the service available, rate limit abuse and debug failures (legitimate interests).</li>
              <li>To reply to support, privacy and security reports (legitimate interests or legal obligation).</li>
              <li>To send transactional email such as confirmation and password reset messages (contract). We do not send marketing email.</li>
            </ul>
            <p>
              We do not sell personal data, do not build advertising profiles, and do not use your submitted
              contract code to train AI models.
            </p>
          </Section>

          <Section title="4. Processors and recipients">
            <p>We share the minimum necessary data with these service providers:</p>
            <ul className="space-y-2 list-disc pl-5">
              <li><strong className="text-lux-ice/90">Supabase</strong> — authentication, email delivery for auth messages, and the Postgres database holding accounts, credits and audit records.</li>
              <li><strong className="text-lux-ice/90">Render</strong> — hosts the Argus API and processes submitted code while an audit runs.</li>
              <li><strong className="text-lux-ice/90">Vercel</strong> — hosts this website and its CDN, and keeps standard access logs.</li>
              <li><strong className="text-lux-ice/90">Lemon Squeezy</strong> — merchant of record for payments, subscriptions, invoices and applicable taxes.</li>
              <li><strong className="text-lux-ice/90">Groq</strong> — provides the language-model inference used by the audit agents. The contract source you submit is sent to Groq's API for analysis.</li>
              <li><strong className="text-lux-ice/90">Block explorer APIs</strong> (such as Etherscan and compatible explorers) — used only when you look up a contract address, to retrieve its publicly verified source code.</li>
              <li><strong className="text-lux-ice/90">GitHub</strong> — used only when you submit a repository URL or install the GitHub App, to read the files or pull request you asked us to scan and to post a review comment.</li>
            </ul>
            <p>
              These providers may process data outside your country, including in the United States and the
              European Union, under their standard contractual safeguards. We may also disclose data where
              required by law or to protect the service and its users.
            </p>
          </Section>

          <Section title="5. Retention">
            <ul className="space-y-2 list-disc pl-5">
              <li>Account and audit records are kept while your account is active, or until you ask us to delete them.</li>
              <li>Billing and tax records are kept as long as required by applicable law and by our merchant of record.</li>
              <li>Server logs are kept for a short operational window (normally 30 days or less).</li>
              <li>Webhook event identifiers are retained to prevent duplicate credit grants and subscription changes.</li>
              <li>Deleted account data may remain in encrypted backups for a limited period before being overwritten.</li>
            </ul>
          </Section>

          <Section title="6. Security">
            <p>
              Data is transmitted over TLS. Passwords are hashed by Supabase Auth. Database access uses
              row-level security for client-facing keys, and the API connects with a restricted service
              credential. Access to production systems is limited to the operator. No system is perfectly
              secure, so please avoid submitting secrets that are not part of the contract under review.
            </p>
          </Section>

          <Section title="7. Cookies and local storage">
            <p>
              We do not use advertising cookies or third-party tracking pixels. The site stores your Supabase
              session and your privacy preference in local storage; these are required for sign-in and to
              remember your choice. If optional analytics are enabled in future, they will load only after you
              choose "Allow analytics", and you can change that choice at any time via "Privacy settings" in the
              footer.
            </p>
          </Section>

          <Section title="8. Your rights">
            <p>
              Depending on where you live — including under the EU/UK GDPR and India's Digital Personal Data
              Protection Act, 2023 — you may have the right to access, correct, delete, restrict or object to
              processing, receive a portable copy of your data, withdraw consent, and complain to a supervisory
              authority. To exercise a right, email{' '}
              <a href={mailtoLink('Argus privacy request')} className="text-lux-gold hover:underline">{CONTACT_EMAIL}</a>{' '}
              from the address associated with your account. We may ask you to verify control of that address and
              will respond within the period required by law.
            </p>
            <p>
              You can ask us to delete individual audits or your whole account. Some records may be retained
              where the law requires it.
            </p>
          </Section>

          <Section title="9. Children">
            <p>
              Argus is a business tool for smart contract developers and is not directed to anyone under 18. We
              do not knowingly collect data from children. If you believe a child has created an account, contact
              us and we will remove it.
            </p>
          </Section>

          <Section title="10. Changes">
            <p>
              We may update this policy as the service or the law changes. Material changes will be announced on
              this page and, for registered users, by email. The date at the top always reflects the current
              version.
            </p>
          </Section>

          <Section title="11. Contact">
            <p>
              Privacy questions and requests:{' '}
              <a href={mailtoLink('Argus privacy request')} className="text-lux-gold hover:underline break-all">{CONTACT_EMAIL}</a>.
              Postal enquiries can be addressed to {LEGAL_NAME}, {LEGAL_LOCATION}.
            </p>
          </Section>
        </div>

        <div className="mt-12 pt-8 border-t border-lux-white/5 flex gap-6 text-xs text-lux-ice/30">
          <Link to="/terms" className="hover:text-lux-ice/60 transition-colors">Terms of Service</Link>
          <Link to="/contact" className="hover:text-lux-ice/60 transition-colors">Contact</Link>
          <Link to="/" className="hover:text-lux-ice/60 transition-colors">Home</Link>
        </div>
      </div>
    </div>
  )
}
