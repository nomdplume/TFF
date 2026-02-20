import { Syne, DM_Sans } from 'next/font/google'

const syne = Syne({ subsets: ['latin'] })
const dmSans = DM_Sans({ subsets: ['latin'] })

export default function TermsOfUse() {
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
        <h1 className={`text-3xl font-bold text-[#e6edf3] mb-2 ${syne.className}`}>Terms of Use</h1>
        <p className="text-sm text-[#484f58] mb-10">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="grid gap-8 text-[#8b949e] leading-relaxed">

          <section>
            <h2 className={`text-lg font-semibold text-[#e6edf3] mb-3 ${syne.className}`}>1. Acceptance of Terms</h2>
            <p>By accessing or using tacticalfitfinder.com ("the Site"), you agree to be bound by these Terms of Use. If you do not agree, please do not use the Site.</p>
          </section>

          <section>
            <h2 className={`text-lg font-semibold text-[#e6edf3] mb-3 ${syne.className}`}>2. Purpose of the Site</h2>
            <p>Tactical Fit Finder is an informational reference tool designed to help users identify which optics may be compatible with specific handgun models based on their mounting footprint. The Site is provided for general informational purposes only and does not constitute professional advice of any kind.</p>
          </section>

          <section>
            <h2 className={`text-lg font-semibold text-[#e6edf3] mb-3 ${syne.className}`}>3. Eligibility and Intended Audience</h2>
            <p className="mb-3">This Site is intended solely for use by adults who are legally permitted to possess and purchase firearms and firearm accessories under applicable federal, state, and local law.</p>
            <p className="mb-3"><span className="text-[#c9d1d9]">This Site is not intended for persons under the age of 18.</span> In jurisdictions where the minimum age to purchase or possess a handgun is 21, this Site is not intended for persons under the age of 21. By using this Site, you represent that you meet the minimum age requirement applicable in your jurisdiction.</p>
            <p className="mb-3"><span className="text-[#c9d1d9]">This Site is intended for use by residents of the United States only.</span> We make no representation that the information provided is appropriate, legal, or available in other countries. If you access this Site from outside the United States, you do so at your own risk and are responsible for compliance with your local laws.</p>
            <p><span className="text-[#c9d1d9]">This Site is not intended for use by any person who is prohibited from possessing firearms under federal, state, or local law</span>, including but not limited to convicted felons, persons under indictment for a felony, persons adjudicated as mentally defective, persons subject to certain restraining orders, or any other prohibited possessor as defined under 18 U.S.C. § 922(g). By using this Site, you represent that you are not a prohibited person under applicable law.</p>
          </section>

          <section>
            <h2 className={`text-lg font-semibold text-[#e6edf3] mb-3 ${syne.className}`}>4. Firearm Safety</h2>
            <p className="mb-4">Tactical Fit Finder is committed to promoting responsible firearm ownership. We strongly encourage all users to follow established firearm safety principles at all times. The four fundamental rules of firearm safety are:</p>

            <div className="grid gap-3 mb-4">
              {[
                {
                  rule: 'Rule 1',
                  title: 'Treat Every Firearm as if it is Loaded',
                  body: 'Never assume a firearm is unloaded. Always handle every firearm with the same care and respect you would give a loaded weapon, regardless of whether you believe it to be unloaded.'
                },
                {
                  rule: 'Rule 2',
                  title: 'Never Point a Firearm at Anything You Are Not Willing to Destroy',
                  body: 'Always be aware of where the muzzle is pointing. Never direct a firearm at any person, animal, or object that you do not intend to shoot.'
                },
                {
                  rule: 'Rule 3',
                  title: 'Keep Your Finger Off the Trigger Until Ready to Shoot',
                  body: 'Keep your finger straight, off the trigger, and outside the trigger guard until you have made the conscious decision to fire. This is one of the most important habits a firearm owner can develop.'
                },
                {
                  rule: 'Rule 4',
                  title: 'Know Your Target and What is Beyond It',
                  body: 'Before firing, positively identify your target and be aware of what lies beyond it. Bullets can travel through targets and travel significant distances. You are responsible for every round you fire.'
                }
              ].map(({ rule, title, body }) => (
                <div key={rule} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                  <div className="text-xs font-semibold uppercase tracking-widest text-[#3fb950] mb-1 font-[family-name:var(--font-syne)]">{rule}</div>
                  <div className="font-medium text-[#c9d1d9] mb-1.5">{title}</div>
                  <p className="text-sm">{body}</p>
                </div>
              ))}
            </div>

            <p>These rules are not exhaustive. We encourage all firearm owners to seek formal safety training from a qualified instructor and to store all firearms securely and responsibly.</p>
          </section>

          <section>
            <h2 className={`text-lg font-semibold text-[#e6edf3] mb-3 ${syne.className}`}>5. Youth Handgun Safety Act</h2>
            <p className="mb-3">In accordance with the spirit of the Youth Handgun Safety Act (18 U.S.C. § 922(x)), we remind users of the following:</p>
            <ul className="list-disc list-inside grid gap-2 ml-2 mb-3">
              <li>It is generally unlawful to transfer a handgun or handgun ammunition to any person who the transferor knows or has reasonable cause to believe is a juvenile (under 18 years of age).</li>
              <li>It is generally unlawful for a juvenile to possess a handgun or handgun ammunition.</li>
              <li>A juvenile who violates these provisions may be prosecuted in federal court.</li>
              <li>Exceptions exist for certain supervised activities including supervised target shooting, hunting, and when a juvenile is acting with the permission of a parent or guardian in limited circumstances — consult the full text of the statute and applicable state law for details.</li>
            </ul>
            <p className="mb-3">This Site does not facilitate the transfer or sale of any firearm or ammunition. However, we include this notice as part of our commitment to responsible firearm ownership and youth safety.</p>
            <p>Parents and guardians are encouraged to discuss firearm safety with minors in their care and to ensure that all firearms in the home are stored securely and inaccessibly to children. Resources including the <span className="text-[#c9d1d9]">ASK Campaign</span> and <span className="text-[#c9d1d9]">Project ChildSafe</span> offer guidance on safe storage practices.</p>
          </section>

          <section>
            <h2 className={`text-lg font-semibold text-[#e6edf3] mb-3 ${syne.className}`}>6. No Guarantee of Compatibility</h2>
            <p className="mb-3">The compatibility information provided on this Site represents an honest effort to compile accurate data from publicly available sources. However, <span className="text-[#c9d1d9]">we make no guarantee, warranty, or assurance that any optic listed as compatible will physically fit, function correctly, or be suitable for any specific firearm or use case.</span></p>
            <p className="mb-3">Firearm and optic specifications can vary between production runs, model years, and regional variants. Manufacturer specifications are subject to change without notice. What fits one example of a given model may not fit another.</p>
            <p>You are solely responsible for independently verifying compatibility before making any purchase. We strongly recommend consulting the manufacturer's official specifications, contacting the retailer directly, and where appropriate, working with a qualified gunsmith before installing any optic on any firearm.</p>
          </section>

          <section>
            <h2 className={`text-lg font-semibold text-[#e6edf3] mb-3 ${syne.className}`}>7. AI-Generated Content</h2>
            <p className="mb-3">This Site and portions of its content were developed with the assistance of artificial intelligence tools. While we review and curate the information presented, AI-assisted content may contain errors, omissions, or outdated information.</p>
            <p><span className="text-[#c9d1d9]">All information on this Site should be independently verified and fact-checked before making any purchasing decision.</span> We accept no responsibility for losses, damages, or dissatisfaction arising from reliance on information that has not been independently confirmed.</p>
          </section>

          <section>
            <h2 className={`text-lg font-semibold text-[#e6edf3] mb-3 ${syne.className}`}>8. Accuracy of Information</h2>
            <p className="mb-3">We make every reasonable effort to ensure the data on this Site is accurate and current. However, we cannot guarantee that all information is complete, error-free, or up to date at the time of your visit.</p>
            <p>Nothing on this Site should be taken as a definitive or authoritative statement of product specifications. Always refer to the manufacturer's current official documentation as the primary source of truth.</p>
          </section>

          <section>
            <h2 className={`text-lg font-semibold text-[#e6edf3] mb-3 ${syne.className}`}>9. External Links and Third Party Vendors</h2>
            <p className="mb-3">This Site contains links to third party websites, retailers, and vendors. These links are provided for convenience only. <span className="text-[#c9d1d9]">Once you leave this Site, you are subject to the terms, policies, and practices of the destination website, over which we have no control and for which we accept no responsibility.</span></p>
            <p className="mb-3">We make no warranties or representations of any kind regarding the content, accuracy, availability, or reliability of any third party website, nor regarding any products or services offered by third party vendors.</p>
            <p>Any purchase you make through a third party vendor is a transaction solely between you and that vendor. We are not a party to any such transaction and accept no liability for any loss, damage, dissatisfaction, or dispute arising from purchases made through links on this Site, including purchases where a product does not fit or function as expected.</p>
          </section>

          <section>
            <h2 className={`text-lg font-semibold text-[#e6edf3] mb-3 ${syne.className}`}>10. Disclaimer of Warranties</h2>
            <p>The Site and its content are provided "as is" and "as available" without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement. We do not warrant that the Site will be uninterrupted, error-free, or free of viruses or other harmful components.</p>
          </section>

          <section>
            <h2 className={`text-lg font-semibold text-[#e6edf3] mb-3 ${syne.className}`}>11. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, Tactical Fit Finder and its operators shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of the Site or reliance on any information provided herein, including but not limited to damages resulting from incorrect compatibility information, purchases that do not meet expectations, or transactions with third party vendors.</p>
          </section>

          <section>
            <h2 className={`text-lg font-semibold text-[#e6edf3] mb-3 ${syne.className}`}>12. Intellectual Property</h2>
            <p>All content on this Site, including text, design, and data, is the property of Tactical Fit Finder unless otherwise noted. You may not reproduce, distribute, or use any content from this Site without prior written permission.</p>
          </section>

          <section>
            <h2 className={`text-lg font-semibold text-[#e6edf3] mb-3 ${syne.className}`}>13. Prohibited Use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc list-inside grid gap-1.5 ml-2">
              <li>Use the Site for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to any part of the Site</li>
              <li>Scrape, crawl, or systematically extract data from the Site without permission</li>
              <li>Interfere with or disrupt the operation of the Site</li>
            </ul>
          </section>

          <section>
            <h2 className={`text-lg font-semibold text-[#e6edf3] mb-3 ${syne.className}`}>14. Changes to These Terms</h2>
            <p>We reserve the right to modify these Terms of Use at any time. Changes will be posted on this page with an updated date. Continued use of the Site after changes constitutes your acceptance of the revised terms.</p>
          </section>

          <section>
            <h2 className={`text-lg font-semibold text-[#e6edf3] mb-3 ${syne.className}`}>15. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of the United States. Any disputes arising from use of the Site shall be subject to the exclusive jurisdiction of the courts of the United States.</p>
          </section>

          <section>
            <h2 className={`text-lg font-semibold text-[#e6edf3] mb-3 ${syne.className}`}>16. Contact</h2>
            <p>If you have questions about these Terms, you can reach us at <span className="text-[#c9d1d9]">contact@tacticalfitfinder.com</span>.</p>
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