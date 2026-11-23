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

export default function Terms() {
  return (
    <div className="min-h-screen bg-lux-black text-lux-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link to="/" className="text-xs text-lux-ice/40 hover:text-lux-ice/70 transition-colors mb-10 inline-block">
          ← Back to home
        </Link>

        <h1 className="text-3xl font-bold font-display text-white mb-2 tracking-tight">Terms of Service</h1>
        <p className="text-sm text-lux-ice/40 mb-10">Last updated: {UPDATED}</p>

        <div className="space-y-8 text-sm text-lux-ice/70 leading-relaxed">
          <Section title="1. Acceptance">
            <p>
              These Terms are an agreement between you and {LEGAL_NAME}, {LEGAL_LOCATION} ("Argus", "we", "us").
              By creating an account, buying credits or using the service, you accept them. If you do not agree,
              do not use Argus.
            </p>
            <p>
              You must be at least 18 years old and able to enter a binding contract. If you use Argus for an
              organisation, you confirm you are authorised to accept these Terms for it.
            </p>
          </Section>

          <Section title="2. What Argus does">
            <p>
              Argus runs automated, multi-agent AI analysis over smart contract source code. It produces a
              structured report that may include risk ratings, explanations, suggested fixes and proof-of-concept
              exploit sketches.
            </p>
            <p>
              Reports are informational. AI analysis can miss vulnerabilities and can report issues that do not
              exist. Argus is not a formal security certification, a professional audit opinion or a guarantee
              that a contract is safe to deploy. You remain responsible for your contracts and for obtaining a
              manual audit where appropriate.
            </p>
          </Section>

          <Section title="3. Accounts">
            <ul className="space-y-2 list-disc pl-5">
              <li>Provide a valid email address you control and keep your password secure.</li>
              <li>You are responsible for activity under your account. Tell us promptly if you suspect unauthorised access.</li>
              <li>One account per person. Do not share credentials or resell access.</li>
              <li>You can stop using Argus at any time and ask us to delete your account.</li>
            </ul>
          </Section>

          <Section title="4. Credits, subscriptions and billing">
            <ul className="space-y-2 list-disc pl-5">
              <li><strong className="text-lux-ice/90">Free tier.</strong> New accounts receive 3 audit credits. We may change or withdraw the free tier for future accounts.</li>
              <li><strong className="text-lux-ice/90">Credit packs.</strong> A pack adds 10 audit credits for the price shown at checkout (currently US$9.99). One credit is used per audit that starts. Credits do not expire, and unused credits are not refundable except where the law requires it.</li>
              <li><strong className="text-lux-ice/90">Failed audits.</strong> If an audit fails before a report is produced, the credit is refunded automatically. If a refund does not appear, contact us with the time of the attempt.</li>
              <li><strong className="text-lux-ice/90">Pro subscription.</strong> Pro is billed monthly in advance at the price shown at checkout (currently US$29/month) and renews automatically until cancelled. You can cancel at any time from the Lemon Squeezy customer portal or by contacting us; access continues until the end of the period you have already paid for. We do not provide partial refunds for a period already started, except where the law requires it.</li>
              <li><strong className="text-lux-ice/90">Merchant of record.</strong> Payments, invoices and applicable taxes are handled by Lemon Squeezy. Their checkout terms and refund policy also apply to the payment transaction.</li>
              <li><strong className="text-lux-ice/90">Price changes.</strong> We may change prices for future purchases or renewal periods. We will give notice before a change affects an existing subscription.</li>
              <li><strong className="text-lux-ice/90">Duplicate charges.</strong> If you are charged twice for the same purchase, contact us and we will arrange a refund of the duplicate through Lemon Squeezy.</li>
            </ul>
            <p>
              Nothing in these Terms limits mandatory consumer rights, including any statutory right of
              withdrawal. Where you have a right to cancel a distance purchase, you acknowledge that the service
              begins immediately and that the right may end once a credit has been used.
            </p>
          </Section>

          <Section title="5. Acceptable use">
            <p>You agree not to:</p>
            <ul className="space-y-2 list-disc pl-5">
              <li>Submit code you have no right to analyse, or use Argus to attack systems you do not own or have permission to test.</li>
              <li>Attempt to disrupt, overload, scrape or reverse engineer the service, or bypass rate limits, authentication or credit accounting.</li>
              <li>Resell or redistribute Argus access or bulk reports commercially without written permission.</li>
              <li>Use the service for unlawful purposes, malware development, or to infringe the rights of others.</li>
              <li>Upload personal data, secrets or keys that are not necessary for the contract review.</li>
            </ul>
            <p>
              We may suspend or terminate an account that violates these rules, abuses infrastructure, or creates
              legal or security risk. Where reasonable, we will explain the reason and allow you to export your
              reports first.
            </p>
          </Section>

          <Section title="6. Your code and reports">
            <p>
              You retain ownership of the code you submit. You grant us a limited, non-exclusive licence to
              process, store and display that code and the resulting report solely to provide the service to
              you. We do not use submitted code to train AI models.
            </p>
            <p>
              You may share your reports, including publicly, with attribution to Argus. The Argus name, logo and
              report presentation remain ours. Third-party services you ask us to fetch from (GitHub, block
              explorers) remain subject to their own terms.
            </p>
          </Section>

          <Section title="7. Availability and changes">
            <p>
              Argus is provided on an as-is basis. Features may change, and the service may be unavailable during
              maintenance, provider outages or capacity limits. We do not guarantee uninterrupted availability or
              any particular turnaround time. We may add, modify or discontinue features, but will not remove
              paid credits without a refund or a reasonable replacement.
            </p>
          </Section>

          <Section title="8. Disclaimer of warranties">
            <p>
              TO THE FULLEST EXTENT PERMITTED BY LAW, THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
              WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR
              PURPOSE, NON-INFRINGEMENT AND ACCURACY. WE DO NOT WARRANT THAT REPORTS ARE COMPLETE, CORRECT OR
              SUFFICIENT FOR ANY DEPLOYMENT DECISION.
            </p>
          </Section>

          <Section title="9. Limitation of liability">
            <p>
              TO THE FULLEST EXTENT PERMITTED BY LAW, WE ARE NOT LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL,
              CONSEQUENTIAL OR PUNITIVE DAMAGES, OR FOR LOST PROFITS, LOST DATA OR LOSSES ARISING FROM RELIANCE ON
              A REPORT. OUR TOTAL AGGREGATE LIABILITY ARISING FROM THE SERVICE IS LIMITED TO THE GREATER OF THE
              AMOUNT YOU PAID US IN THE 12 MONTHS BEFORE THE CLAIM OR US$50.
            </p>
            <p>
              Nothing in these Terms excludes liability that cannot lawfully be excluded, including liability for
              fraud or for death or personal injury caused by negligence.
            </p>
          </Section>

          <Section title="10. Indemnity">
            <p>
              To the extent permitted by law, you agree to indemnify us against third-party claims arising from
              code you submit, your breach of these Terms, or your unlawful use of the service.
            </p>
          </Section>

          <Section title="11. Termination">
            <p>
              You may stop using Argus at any time. We may suspend or end access for material breach, non-payment,
              or legal necessity. On termination, your right to use the service ends; sections that by their
              nature should survive (including intellectual property, disclaimers, liability and governing law)
              continue to apply.
            </p>
          </Section>

          <Section title="12. Governing law">
            <p>
              These Terms are governed by the laws of India. The courts at Bangalore, Karnataka have exclusive
              jurisdiction, subject to any mandatory consumer protection rules in your country of residence.
            </p>
          </Section>

          <Section title="13. Changes to these Terms">
            <p>
              We may update these Terms. Material changes will be posted on this page and, for registered users,
              notified by email before they take effect. Continued use after the effective date means you accept
              the updated Terms.
            </p>
          </Section>

          <Section title="14. Contact">
            <p>
              Questions about these Terms or billing:{' '}
              <a href={mailtoLink('Argus terms question')} className="text-lux-gold hover:underline break-all">{CONTACT_EMAIL}</a>.
              Postal enquiries can be addressed to {LEGAL_NAME}, {LEGAL_LOCATION}.
            </p>
          </Section>
        </div>

        <div className="mt-12 pt-8 border-t border-lux-white/5 flex gap-6 text-xs text-lux-ice/30">
          <Link to="/privacy" className="hover:text-lux-ice/60 transition-colors">Privacy Policy</Link>
          <Link to="/contact" className="hover:text-lux-ice/60 transition-colors">Contact</Link>
          <Link to="/" className="hover:text-lux-ice/60 transition-colors">Home</Link>
        </div>
      </div>
    </div>
  )
}
