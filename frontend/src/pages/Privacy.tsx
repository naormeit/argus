import { Link } from 'react-router-dom'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-lux-black text-lux-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link to="/" className="text-xs text-lux-ice/40 hover:text-lux-ice/70 transition-colors mb-10 inline-block">
          ← Back to home
        </Link>

        <h1 className="text-3xl font-bold font-display text-white mb-2 tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-lux-ice/40 mb-10">Last updated: 14 November 2026</p>

        <div className="space-y-8 text-sm text-lux-ice/70 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-white mb-3">1. Introduction</h2>
            <p>
              Argus ("we", "our", "us") is a multi-agent AI security auditor for smart contracts. This Privacy Policy
              explains what personal data we collect, how we use it, and your rights regarding that data. By using
              Argus you agree to this policy.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">2. Data We Collect</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li><strong className="text-lux-ice/90">Account data:</strong> Email address and hashed password, stored securely by Supabase Auth.</li>
              <li><strong className="text-lux-ice/90">Audit data:</strong> Smart contract source code you submit for analysis and the resulting audit reports. These are stored in our database to power your audit history.</li>
              <li><strong className="text-lux-ice/90">Billing data:</strong> Payment information is processed by Stripe. We store only your Stripe customer ID and subscription status — never card numbers.</li>
              <li><strong className="text-lux-ice/90">Usage data:</strong> IP address, browser type, pages visited, and timestamps, collected automatically for security and analytics purposes.</li>
              <li><strong className="text-lux-ice/90">Cookies:</strong> Session cookies (required for authentication), analytics cookies (Google Analytics / AdSense), and preference cookies. See Section 6.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">3. How We Use Your Data</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>To provide, operate, and improve the Argus service.</li>
              <li>To process payments and manage your subscription or credits.</li>
              <li>To email you transactional messages (account confirmation, payment receipts). We do not send unsolicited marketing.</li>
              <li>To detect and prevent fraud and abuse.</li>
              <li>To comply with legal obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">4. Data Sharing</h2>
            <p>We do not sell your personal data. We share data only with:</p>
            <ul className="space-y-2 list-disc pl-5 mt-2">
              <li><strong className="text-lux-ice/90">Supabase</strong> — authentication and database (US/EU infrastructure).</li>
              <li><strong className="text-lux-ice/90">Stripe</strong> — payment processing.</li>
              <li><strong className="text-lux-ice/90">Render</strong> — backend hosting.</li>
              <li><strong className="text-lux-ice/90">Vercel</strong> — frontend hosting.</li>
              <li><strong className="text-lux-ice/90">Google</strong> — analytics and advertising (AdSense), subject to your cookie consent.</li>
              <li>Law enforcement, when required by law or court order.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">5. Data Retention</h2>
            <p>
              Account data is retained for as long as your account is active. Audit reports are retained indefinitely
              to power your history; you may request deletion at any time. Billing records are retained for 7 years
              as required by tax law.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">6. Cookies</h2>
            <p className="mb-2">We use the following types of cookies:</p>
            <ul className="space-y-2 list-disc pl-5">
              <li><strong className="text-lux-ice/90">Essential cookies:</strong> Required for authentication and security. These cannot be disabled.</li>
              <li><strong className="text-lux-ice/90">Analytics cookies:</strong> Google Analytics to understand how visitors use the site. Only placed with your consent.</li>
              <li><strong className="text-lux-ice/90">Advertising cookies:</strong> Google AdSense to show relevant ads. Only placed with your consent.</li>
            </ul>
            <p className="mt-2">You can manage your cookie preferences at any time via the banner on this site.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">7. Your Rights (GDPR / UK GDPR)</h2>
            <p>If you are in the EU or UK, you have the right to:</p>
            <ul className="space-y-2 list-disc pl-5 mt-2">
              <li>Access the personal data we hold about you.</li>
              <li>Correct inaccurate data.</li>
              <li>Request deletion ("right to be forgotten").</li>
              <li>Restrict or object to processing.</li>
              <li>Data portability.</li>
              <li>Lodge a complaint with your local supervisory authority.</li>
            </ul>
            <p className="mt-2">To exercise any of these rights, email us at the address below.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">8. Children</h2>
            <p>Argus is not directed to children under 13. We do not knowingly collect data from children.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">9. Changes</h2>
            <p>
              We may update this policy. We will notify registered users by email of material changes.
              The "last updated" date at the top of this page reflects the latest revision.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">10. Contact</h2>
            <p>
              For privacy questions or data requests, contact us at{' '}
              <span className="text-lux-gold font-mono text-xs select-all">privacy@argus.app</span>.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-lux-white/5 flex gap-6 text-xs text-lux-ice/30">
          <Link to="/terms" className="hover:text-lux-ice/60 transition-colors">Terms of Service</Link>
          <Link to="/" className="hover:text-lux-ice/60 transition-colors">Home</Link>
        </div>
      </div>
    </div>
  )
}
