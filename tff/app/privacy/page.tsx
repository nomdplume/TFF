import { Syne, DM_Sans } from 'next/font/google'

const syne = Syne({ subsets: ['latin'] })
const dmSans = DM_Sans({ subsets: ['latin'] })

export default function PrivacyPolicy() {
  return (
    <div className={`min-h-screen bg-[#0d1117] text-[#e6edf3] ${dmSans.className}`}>
      <header className="border-b border-[#21262d]">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <a href="/" className={`font-bold text-[#e6edf3] hover:text-white transition-colors ${syne.className}`}>
            ← Tactical Fit Finder
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className={`text-3xl font-bold text-[#e6edf3] mb-2 ${syne.className}`}>Privacy Policy</h1>
        <p className="text-sm text-[#484f58] mb-10">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="grid gap-8 text-[#8b949e] leading-relaxed">

          <section>
            <h2 className={`text-lg font-semibold text-[#e6edf3] mb-3 ${syne.className}`}>1. Overview</h2>
            <p>Tactical Fit Finder ("we", "us", or "our") operates tacticalfitfinder.com. This Privacy Policy explains how we handle information when you use our website. We are committed to keeping things simple and transparent.</p>
          </section>

          <section>
            <h2 className={`text-lg font-semibold text-[#e6edf3] mb-3 ${syne.className}`}>2. Information We Collect</h2>
            <p className="mb-3">We do not require you to create an account or provide any personal information to use Tactical Fit Finder.</p>
            <p className="mb-3">When you visit our site, standard server and analytics logs may automatically collect:</p>
            <ul className="list-disc list-inside grid gap-1.5 ml-2">
              <li>Your IP address</li>
              <li>Browser type and version</li>
              <li>Pages visited and time spent</li>
              <li>Referring website</li>
              <li>Date and time of your visit</li>
            </ul>
            <p className="mt-3">This information is used solely to understand how the site is being used and to improve the experience. It is not sold or shared with third parties for marketing purposes.</p>
          </section>

          <section>
            <h2 className={`text-lg font-semibold text-[#e6edf3] mb-3 ${syne.className}`}>3. Cookies</h2>
            <p>We do not use tracking cookies or advertising cookies. Our site may use essential session cookies required for basic functionality. We do not use cookies to track you across other websites.</p>
          </section>

          <section>
            <h2 className={`text-lg font-semibold text-[#e6edf3] mb-3 ${syne.className}`}>4. Third Party Services</h2>
            <p className="mb-3">We use the following third party services to operate this website:</p>
            <ul className="list-disc list-inside grid gap-1.5 ml-2">
              <li><span className="text-[#c9d1d9]">Vercel</span> — website hosting and deployment</li>
              <li><span className="text-[#c9d1d9]">Supabase</span> — database infrastructure</li>
            </ul>
            <p className="mt-3">Each of these services has their own privacy policy governing how they handle data. We encourage you to review their policies if you have concerns.</p>
          </section>

          <section>
            <h2 className={`text-lg font-semibold text-[#e6edf3] mb-3 ${syne.className}`}>5. External Links</h2>
            <p>Our site may contain links to third party websites including retailers. We are not responsible for the privacy practices of those websites and encourage you to review their policies before providing any personal information.</p>
          </section>

          <section>
            <h2 className={`text-lg font-semibold text-[#e6edf3] mb-3 ${syne.className}`}>6. Children's Privacy</h2>
            <p>Tactical Fit Finder is not directed at children under the age of 13 and we do not knowingly collect personal information from children.</p>
          </section>

          <section>
            <h2 className={`text-lg font-semibold text-[#e6edf3] mb-3 ${syne.className}`}>7. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Any changes will be reflected on this page with an updated date. Continued use of the site after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className={`text-lg font-semibold text-[#e6edf3] mb-3 ${syne.className}`}>8. Contact</h2>
            <p>If you have questions about this Privacy Policy, you can reach us at <span className="text-[#c9d1d9]">contact@tacticalfitfinder.com</span>.</p>
          </section>

        </div>
      </main>

      <footer className="border-t border-[#21262d] mt-12">
        <div className="max-w-3xl mx-auto px-6 py-8 flex items-center justify-between">
          <span className={`font-bold text-[#484f58] text-sm ${syne.className}`}>Tactical Fit Finder</span>
          <div className="flex gap-6 text-xs text-[#484f58]">
            <a href="/terms" className="hover:text-[#8b949e] transition-colors">Terms of Use</a>
            <a href="/privacy" className="hover:text-[#8b949e] transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  )
}