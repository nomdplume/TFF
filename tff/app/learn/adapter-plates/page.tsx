// src/app/learn/adapter-plates/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Optic Adapter Plates Explained | Tactical Fit Finder",
  description:
    "Learn how optic adapter plates work, why your handgun's slide cut matters, and how to figure out which red dot sights will fit your pistol — without the guesswork.",
  keywords: [
    "optic adapter plate",
    "handgun red dot mounting",
    "RMR footprint",
    "Shield RMSc footprint",
    "optic cut handgun",
    "pistol optic compatibility",
    "direct mount optic",
    "Holosun mounting plate",
  ],
  openGraph: {
    title: "Optic Adapter Plates Explained | Tactical Fit Finder",
    description:
      "A beginner's guide to handgun optic footprints, slide cuts, and how adapter plates bridge the gap between your pistol and your red dot.",
    type: "article",
  },
};

// ─── Icons ───────────────────────────────────────────────────────────────────

function IconSlide() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="2" y="10" width="28" height="12" rx="2" stroke="#e8b94a" strokeWidth="1.5" />
      <rect x="10" y="7" width="12" height="6" rx="1" stroke="#e8b94a" strokeWidth="1.5" />
      <line x1="6" y1="16" x2="26" y2="16" stroke="#e8b94a" strokeWidth="1" strokeDasharray="2 2" />
    </svg>
  );
}

function IconPlate() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="4" y="13" width="24" height="6" rx="1" fill="#e8b94a22" stroke="#e8b94a" strokeWidth="1.5" />
      <rect x="8" y="8" width="16" height="6" rx="1" stroke="#e8b94a" strokeWidth="1.5" strokeDasharray="3 1.5" />
      <rect x="8" y="18" width="16" height="6" rx="1" stroke="#e8b94a" strokeWidth="1.5" strokeDasharray="3 1.5" />
    </svg>
  );
}

function IconDirect() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="4" y="12" width="24" height="8" rx="2" stroke="#e8b94a" strokeWidth="1.5" />
      <rect x="8" y="7" width="16" height="6" rx="1" stroke="#e8b94a" strokeWidth="1.5" />
      <path d="M12 20 L20 20" stroke="#e8b94a" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 17 L18 17" stroke="#e8b94a" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── Step Card ───────────────────────────────────────────────────────────────

function StepCard({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 bg-[#161b22] border border-[#30363d] rounded-xl p-5 hover:border-[#e8b94a]/30 transition-colors mb-2">
      <div className="shrink-0 w-9 h-9 rounded-full bg-[#1a1508] border border-[#3a2f0e] flex items-center justify-center font-[family-name:var(--font-syne)] font-bold text-sm text-[#e8b94a]">
        {number}
      </div>
      <div className="flex-1">
        <h3 className="font-[family-name:var(--font-syne)] font-semibold text-[#e6edf3] mb-1">{title}</h3>
        <p className="text-sm text-[#8b949e] leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

// ─── Scenario Card ───────────────────────────────────────────────────────────

type BadgeColor = "green" | "amber" | "blue";

const badgeStyles: Record<BadgeColor, string> = {
  green: "bg-[#052010] border border-[#166534] text-[#4ade80]",
  amber: "bg-[#1a1508] border border-[#3a2f0e] text-[#e8b94a]",
  blue:  "bg-[#060e1f] border border-[#1e3a6e] text-[#60a5fa]",
};

const cardHoverStyles: Record<BadgeColor, string> = {
  green: "hover:border-[#166534]",
  amber: "hover:border-[#e8b94a]/40",
  blue:  "hover:border-[#1e3a6e]",
};

function ScenarioCard({
  icon, label, title, description, badge, badgeColor,
}: {
  icon: React.ReactNode; label: string; title: string;
  description: string; badge: string; badgeColor: BadgeColor;
}) {
  return (
    <div className={`bg-[#161b22] border border-[#30363d] rounded-xl p-5 transition-colors ${cardHoverStyles[badgeColor]}`}>
      <div className="flex justify-between items-start mb-4">
        {icon}
        <span className={`text-xs font-[family-name:var(--font-syne)] tracking-widest uppercase px-2.5 py-1 rounded-full ${badgeStyles[badgeColor]}`}>
          {badge}
        </span>
      </div>
      <p className="text-xs font-[family-name:var(--font-syne)] tracking-widest uppercase text-[#484f58] mb-1">{label}</p>
      <h3 className="font-[family-name:var(--font-syne)] font-semibold text-[#e6edf3] mb-2">{title}</h3>
      <p className="text-sm text-[#8b949e] leading-relaxed">{description}</p>
    </div>
  );
}

// ─── Infobox ─────────────────────────────────────────────────────────────────

function Infobox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#161b22] border border-[#30363d] border-l-[3px] border-l-[#e8b94a] rounded-xl px-5 py-4 my-6 text-sm text-[#8b949e] leading-relaxed">
      {children}
    </div>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────

function Divider() {
  return <div className="h-px bg-[#21262d] my-12 max-w-3xl mx-auto px-6" />;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdapterPlatesPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] font-[family-name:var(--font-dm-sans)]">

      {/* ── Hero ── */}
      <header className="max-w-3xl mx-auto px-6 pt-16 pb-10">
        <div className="flex items-center gap-2 text-xs font-[family-name:var(--font-syne)] tracking-widest uppercase text-[#484f58] mb-8">
          <Link href="/" className="hover:text-[#e8b94a] transition-colors">Home</Link>
          <span>/</span>
          <span>Learn</span>
          <span>/</span>
          <span className="text-[#8b949e]">Adapter Plates</span>
        </div>

        <div className="inline-flex items-center gap-2 bg-[#1a1508] border border-[#3a2f0e] text-[#e8b94a] text-xs font-[family-name:var(--font-syne)] tracking-widest uppercase px-3 py-1.5 rounded-full mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#e8b94a]" />
          Beginner's Guide
        </div>

        <h1 className="font-[family-name:var(--font-syne)] text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-white mb-4">
          How Optic Adapter Plates{" "}
          <span className="text-[#e8b94a]">Actually Work</span>
        </h1>
        <p className="text-lg text-[#8b949e] leading-relaxed max-w-2xl font-light">
          Mounting a red dot on your handgun sounds straightforward — until you realize your
          pistol's slide cut and your optic of choice speak different languages. Here's everything
          you need to know before you buy.
        </p>
      </header>

      <Divider />

      {/* ── Section 1: The Cut ── */}
      <section className="max-w-3xl mx-auto px-6">
        <p className="text-xs font-[family-name:var(--font-syne)] tracking-widest uppercase text-[#e8b94a] mb-2">The Basics</p>
        <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-white mb-4">Your Slide Has a Cut. That Cut Has a Shape.</h2>

        <p className="text-[#8b949e] font-light leading-relaxed mb-4">
          When a modern handgun is machined to accept a red dot sight, the manufacturer removes
          material from the top of the slide to create a recessed mounting area. This is called
          the <strong className="text-[#e6edf3] font-medium">optic cut</strong> (or sometimes the "milling"). The specific shape,
          screw pattern, and dimensions of that cut are called the <strong className="text-[#e6edf3] font-medium">footprint</strong>.
        </p>
        <p className="text-[#8b949e] font-light leading-relaxed mb-4">
          Think of it like a USB port. Just like you can't plug a USB-C cable into a USB-A port
          without an adapter, you can't bolt an optic with one footprint shape onto a slide cut
          for a different footprint — not without help.
        </p>

        <Infobox>
          <strong className="text-[#e8b94a]">Why does this matter?</strong> If you buy the wrong optic for your slide's cut,
          it simply won't mount. No amount of force or creativity will make mismatched footprints work.
          Knowing your slide's footprint before you shop saves you a frustrating return.
        </Infobox>

        <p className="text-[#8b949e] font-light leading-relaxed mb-4">
          There are a handful of footprints that have become industry standards, and most modern
          optics-ready (OR) handguns use one of them. Here are the most common ones you'll encounter:
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {[
            "Trijicon RMR", "Shield RMSc", "Holosun 507K / K-Pattern",
            "Leupold DeltaPoint Pro", "Vortex Venom / Viper",
            "C-More STS", "Glock MOS", "Sig Romeo Zero",
          ].map((fp) => (
            <span key={fp} className="bg-[#161b22] border border-[#30363d] text-[#e6edf3] font-[family-name:var(--font-syne)] text-xs tracking-wide px-3 py-1.5 rounded-full">
              {fp}
            </span>
          ))}
        </div>

        <p className="text-[#8b949e] font-light leading-relaxed">
          Some manufacturers also have their own <strong className="text-[#e6edf3] font-medium">proprietary footprints</strong> that
          don't match any universal standard — meaning only specific optics designed for that
          gun will fit without an adapter.
        </p>
      </section>

      <Divider />

      {/* ── Section 2: Three Scenarios ── */}
      <section className="max-w-3xl mx-auto px-6">
        <p className="text-xs font-[family-name:var(--font-syne)] tracking-widest uppercase text-[#e8b94a] mb-2">Mounting Methods</p>
        <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-white mb-3">Three Ways an Optic Gets Onto Your Slide</h2>
        <p className="text-[#8b949e] font-light leading-relaxed mb-6">
          Once you know your slide has an optic cut, there are three scenarios you might encounter
          depending on the combination of your gun and the optic you want.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <ScenarioCard
            icon={<IconDirect />} label="Scenario 1" title="Direct Mount"
            description="Your slide's cut and your optic's footprint are a perfect match. The optic screws directly into the slide — no adapter needed. This is the cleanest, most rigid setup possible."
            badge="Simplest" badgeColor="green"
          />
          <ScenarioCard
            icon={<IconPlate />} label="Scenario 2" title="Plate-Assisted Mount"
            description="Your slide uses a universal or wide-format cut (like a Glock MOS or SIG KORE system). A thin metal adapter plate bolts into that cut and gives your specific optic a new surface to mount to."
            badge="Most Common" badgeColor="amber"
          />
          <ScenarioCard
            icon={<IconSlide />} label="Scenario 3" title="Proprietary Cut"
            description="Your slide has a manufacturer-specific cut that only accepts that brand's adapter system. You'll need to use their plates or buy an optic that matches the proprietary footprint exactly."
            badge="Brand-Specific" badgeColor="blue"
          />
        </div>

        <Infobox>
          <strong className="text-[#e8b94a]">Real-world example:</strong> An RMSc-cut Hellcat can accept Shield RMSc optics
          directly — no plate. But if you want to mount a Trijicon RMR on that same gun, you'd need
          an adapter plate that sits between the RMSc cut and the RMR's footprint. Some plates for
          this exist; some combinations don't have a viable adapter at all.
        </Infobox>
      </section>

      <Divider />

      {/* ── Section 3: What Is a Plate ── */}
      <section className="max-w-3xl mx-auto px-6">
        <p className="text-xs font-[family-name:var(--font-syne)] tracking-widest uppercase text-[#e8b94a] mb-2">Adapter Plates, Explained</p>
        <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-white mb-4">What Is an Optic Adapter Plate, Exactly?</h2>

        <p className="text-[#8b949e] font-light leading-relaxed mb-4">
          An adapter plate (sometimes called an optic plate or mounting plate) is a small, precisely
          machined piece of metal — usually aluminum or steel — that acts as a translator between
          your slide's cut and an optic that doesn't natively fit it.
        </p>
        <p className="text-[#8b949e] font-light leading-relaxed mb-4">
          The <strong className="text-[#e6edf3] font-medium">bottom of the plate</strong> is shaped to match your slide's cut and screw pattern.
          The <strong className="text-[#e6edf3] font-medium">top of the plate</strong> is shaped to match your optic's footprint and screw pattern.
          By stacking the plate between the two, you create a secure mounting path where none existed before.
        </p>
        <p className="text-[#8b949e] font-light leading-relaxed mb-6">
          Most plates are only a few millimeters thick, so they add minimal height to your optic.
          Quality plates from reputable manufacturers are machined to extremely tight tolerances and
          won't compromise your zero under recoil. Cheap or poorly-made plates, however, can shift
          under fire — always use plates from trusted sources.
        </p>

        <div>
          <StepCard number="1" title="Identify your slide's cut">
            Check your gun's manual, the manufacturer's website, or the markings on your slide.
            It will be listed as "RMR cut," "MOS," "KORE," "RMSc cut," etc. This is the most
            important step — everything else depends on it.
          </StepCard>
          <StepCard number="2" title="Choose your optic">
            Pick the red dot you want. Know its footprint name — it's listed in the optic's
            spec sheet. Common examples: Holosun 507C uses an RMR footprint. Holosun 507K uses
            a K-footprint (RMSc-compatible).
          </StepCard>
          <StepCard number="3" title="Check if they match directly">
            If your slide cut and optic footprint are the same, you're done — mount directly.
            If they're different, you need a plate (or a different optic).
          </StepCard>
          <StepCard number="4" title="Find the right adapter plate">
            Search for a plate that bridges your specific slide cut to your specific optic footprint.
            Plate compatibility is very model-specific — a plate for a Glock 17 MOS won't necessarily
            work on a Glock 43X MOS, even though both are "MOS" guns.
          </StepCard>
          <StepCard number="5" title="Use thread locker and torque to spec">
            When mounting, use a medium-strength thread locker (like blue Loctite) on the screws and
            torque to the manufacturer's specification. Over-tightening can strip threads; under-tightening
            causes the optic to shift.
          </StepCard>
        </div>
      </section>

      <Divider />

      {/* ── Section 4: Common Questions ── */}
      <section className="max-w-3xl mx-auto px-6">
        <p className="text-xs font-[family-name:var(--font-syne)] tracking-widest uppercase text-[#e8b94a] mb-2">Common Questions</p>
        <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-white mb-6">Things That Trip Up New Buyers</h2>

        <div className="flex flex-col gap-6">
          <div>
            <p className="font-medium text-[#e6edf3] mb-2">
              "My gun and my optic are both 'MOS compatible' — why don't they fit?"
            </p>
            <p className="text-sm text-[#8b949e] font-light leading-relaxed">
              "MOS" (Modular Optic System) is Glock's term for their plate-based adapter system,
              not a single universal footprint. Each MOS-ready Glock comes with a set of plates
              for common optics, but they're not all the same across Glock models. Always verify
              the exact plate number for your gun's frame size.
            </p>
          </div>
          <div className="h-px bg-[#21262d]" />
          <div>
            <p className="font-medium text-[#e6edf3] mb-2">
              "The optic says it fits 'RMR footprint' guns. My gun has an RMR cut. But the screw holes don't line up."
            </p>
            <p className="text-sm text-[#8b949e] font-light leading-relaxed">
              The RMR footprint is one of the most copied in the industry, but there are subtle
              variations in screw hole spacing and depth across manufacturers. Always cross-reference
              the specific gun model and optic model — not just the footprint name.
            </p>
          </div>
          <div className="h-px bg-[#21262d]" />
          <div>
            <p className="font-medium text-[#e6edf3] mb-2">
              "Can I just mill (cut) my own slide to fit any optic?"
            </p>
            <p className="text-sm text-[#8b949e] font-light leading-relaxed">
              Custom milling is a real option performed by gunsmiths, and it's how many older pistols
              get optic-ready. But it's a permanent modification that requires professional work.
              It's not something you do at home with a Dremel. If you want to explore this route,
              find a gunsmith who specializes in optic cuts.
            </p>
          </div>
        </div>

        <Infobox>
          <strong className="text-[#e8b94a]">Bottom line:</strong> The safest approach is to use Tactical Fit Finder's
          compatibility tool to enter your exact gun model and the optic you're considering.
          We cross-reference mounting footprints and known plate compatibility so you know
          exactly what you're working with before anything is purchased.
        </Infobox>
      </section>

      {/* ── CTA ── */}
      <div className="max-w-3xl mx-auto px-6 mt-12">
        <div className="bg-[#161b22] border border-[#30363d] border-t-2 border-t-[#e8b94a] rounded-xl p-8 text-center">
          <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-white mb-2">Ready to Find Your Fit?</h2>
          <p className="text-[#8b949e] font-light mb-6 max-w-md mx-auto">
            Enter your handgun and see which optics mount directly — and which ones need a plate.
            No guesswork, no wasted returns.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#e8b94a] hover:bg-[#f0c95c] text-[#0d1117] font-[family-name:var(--font-syne)] font-bold text-sm px-6 py-3 rounded-lg transition-colors"
          >
            Search Compatibility →
          </Link>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-[#21262d] mt-16">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between flex-wrap gap-4">
          <span className="font-[family-name:var(--font-syne)] font-bold text-[#484f58] text-sm">Tactical Fit Finder</span>
          <div className="flex gap-6 text-xs text-[#484f58]">
            <a href="/terms" className="hover:text-[#8b949e] transition-colors">Terms of Use</a>
            <a href="/privacy" className="hover:text-[#8b949e] transition-colors">Privacy Policy</a>
            <span>© {new Date().getFullYear()} tacticalfitfinder.com</span>
          </div>
        </div>
      </footer>

    </div>
  );
}