// Place this file at: src/app/learn/adapter-plates/page.tsx
// Also create src/app/learn/adapter-plates/ directory if it doesn't exist.

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

// ─── Small Icon Components ──────────────────────────────────────────────────

function IconSlide() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="2" y="10" width="28" height="12" rx="2" stroke="#e8b94a" strokeWidth="1.5" />
      <rect x="10" y="7" width="12" height="6" rx="1" stroke="#e8b94a" strokeWidth="1.5" />
      <line x1="6" y1="16" x2="26" y2="16" stroke="#e8b94a" strokeWidth="1" strokeDasharray="2 2" />
    </svg>
  );
}

function IconOptic() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="6" y="10" width="20" height="13" rx="2" stroke="#e8b94a" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="4" stroke="#e8b94a" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="1" fill="#e8b94a" />
      <rect x="10" y="6" width="12" height="5" rx="1" stroke="#e8b94a" strokeWidth="1.5" />
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

function StepCard({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="step-card">
      <div className="step-number">{number}</div>
      <div className="step-body">
        <h3 className="step-title">{title}</h3>
        <div className="step-content">{children}</div>
      </div>
    </div>
  );
}

// ─── Scenario Card ───────────────────────────────────────────────────────────

function ScenarioCard({
  icon,
  label,
  title,
  description,
  badge,
  badgeColor,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  description: string;
  badge: string;
  badgeColor: "green" | "amber" | "blue";
}) {
  return (
    <div className={`scenario-card scenario-${badgeColor}`}>
      <div className="scenario-header">
        {icon}
        <span className={`scenario-badge badge-${badgeColor}`}>{badge}</span>
      </div>
      <p className="scenario-label">{label}</p>
      <h3 className="scenario-title">{title}</h3>
      <p className="scenario-desc">{description}</p>
    </div>
  );
}

// ─── Footprint Pill ──────────────────────────────────────────────────────────

function FootprintPill({ name }: { name: string }) {
  return <span className="footprint-pill">{name}</span>;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdapterPlatesPage() {
  return (
    <>
      <style>{`
        /* ── Fonts ── */
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:       #0c0d0f;
          --surface:  #13151a;
          --border:   #232530;
          --gold:     #e8b94a;
          --gold-dim: #a07d2a;
          --text:     #e2e4ea;
          --muted:    #7a7f8e;
          --green:    #4ade80;
          --blue:     #60a5fa;
          --red:      #f87171;
          --radius:   8px;
          --font-head: 'Syne', sans-serif;
          --font-body: 'DM Sans', sans-serif;
        }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: var(--font-body);
          font-size: 16px;
          line-height: 1.7;
          -webkit-font-smoothing: antialiased;
        }

        /* ── Nav ── */
        .nav {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(12,13,15,0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
          padding: 0 max(1.5rem, 5vw);
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .nav-brand {
          font-family: var(--font-head);
          font-weight: 800;
          font-size: 1.05rem;
          letter-spacing: .04em;
          color: var(--text);
          text-decoration: none;
        }
        .nav-brand span { color: var(--gold); }
        .nav-link {
          font-size: .85rem;
          color: var(--muted);
          text-decoration: none;
          transition: color .2s;
        }
        .nav-link:hover { color: var(--text); }

        /* ── Hero ── */
        .hero {
          padding: 5rem max(1.5rem, 8vw) 3.5rem;
          max-width: 860px;
          margin: 0 auto;
        }
        .breadcrumb {
          display: flex;
          align-items: center;
          gap: .5rem;
          font-size: .8rem;
          color: var(--muted);
          margin-bottom: 2rem;
          font-family: var(--font-head);
          letter-spacing: .06em;
          text-transform: uppercase;
        }
        .breadcrumb a { color: var(--muted); text-decoration: none; }
        .breadcrumb a:hover { color: var(--gold); }
        .breadcrumb-sep { color: var(--border); }

        .hero-tag {
          display: inline-flex;
          align-items: center;
          gap: .4rem;
          background: #1a1508;
          border: 1px solid #3a2f0e;
          color: var(--gold);
          font-size: .75rem;
          font-family: var(--font-head);
          letter-spacing: .1em;
          text-transform: uppercase;
          padding: .3rem .75rem;
          border-radius: 2rem;
          margin-bottom: 1.5rem;
        }
        .hero-tag::before {
          content: '';
          width: 6px; height: 6px;
          background: var(--gold);
          border-radius: 50%;
        }

        .hero h1 {
          font-family: var(--font-head);
          font-size: clamp(2rem, 5vw, 3.25rem);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -.02em;
          color: #fff;
          margin-bottom: 1.25rem;
        }
        .hero h1 em {
          font-style: normal;
          color: var(--gold);
        }

        .hero-lead {
          font-size: 1.15rem;
          color: var(--muted);
          max-width: 640px;
          line-height: 1.75;
          font-weight: 300;
        }

        /* ── Divider ── */
        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--border) 20%, var(--border) 80%, transparent);
          margin: 3rem max(1.5rem, 8vw);
        }

        /* ── Section ── */
        .section {
          max-width: 860px;
          margin: 0 auto;
          padding: 0 max(1.5rem, 8vw);
        }
        .section + .section { margin-top: 4rem; }

        .section-label {
          font-family: var(--font-head);
          font-size: .75rem;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: .75rem;
        }
        .section h2 {
          font-family: var(--font-head);
          font-size: clamp(1.4rem, 3vw, 2rem);
          font-weight: 700;
          letter-spacing: -.015em;
          color: #fff;
          margin-bottom: 1.25rem;
        }
        .section p {
          color: var(--muted);
          margin-bottom: 1rem;
          font-weight: 300;
        }
        .section p:last-child { margin-bottom: 0; }
        .section strong { color: var(--text); font-weight: 500; }

        /* ── Infobox ── */
        .infobox {
          background: var(--surface);
          border: 1px solid var(--border);
          border-left: 3px solid var(--gold);
          border-radius: var(--radius);
          padding: 1.25rem 1.5rem;
          margin: 1.75rem 0;
          color: var(--muted);
          font-size: .95rem;
        }
        .infobox strong { color: var(--gold); }

        /* ── Footprint pills ── */
        .footprint-grid {
          display: flex;
          flex-wrap: wrap;
          gap: .5rem;
          margin: 1rem 0 1.5rem;
        }
        .footprint-pill {
          background: #1a1a22;
          border: 1px solid #2e3040;
          color: var(--text);
          font-family: var(--font-head);
          font-size: .75rem;
          letter-spacing: .06em;
          padding: .3rem .75rem;
          border-radius: 2rem;
        }

        /* ── Steps ── */
        .steps { display: flex; flex-direction: column; gap: 1px; margin: 2rem 0; }
        .step-card {
          display: flex;
          gap: 1.5rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.5rem;
          position: relative;
          transition: border-color .2s;
          margin-bottom: .5rem;
        }
        .step-card:hover { border-color: var(--gold-dim); }
        .step-number {
          flex-shrink: 0;
          width: 36px; height: 36px;
          background: #1a1508;
          border: 1px solid #3a2f0e;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-head);
          font-weight: 700;
          font-size: .85rem;
          color: var(--gold);
        }
        .step-body { flex: 1; }
        .step-title {
          font-family: var(--font-head);
          font-size: 1rem;
          font-weight: 600;
          color: #fff;
          margin-bottom: .4rem;
        }
        .step-content { color: var(--muted); font-size: .95rem; }

        /* ── Scenarios ── */
        .scenarios {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
          margin: 2rem 0;
        }
        .scenario-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.5rem;
          transition: transform .2s, border-color .2s;
        }
        .scenario-card:hover { transform: translateY(-2px); }
        .scenario-green:hover { border-color: #166534; }
        .scenario-amber:hover { border-color: var(--gold-dim); }
        .scenario-blue:hover { border-color: #1e40af; }

        .scenario-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        .scenario-badge {
          font-family: var(--font-head);
          font-size: .7rem;
          letter-spacing: .08em;
          text-transform: uppercase;
          padding: .2rem .6rem;
          border-radius: 2rem;
        }
        .badge-green { background: #052010; border: 1px solid #166534; color: var(--green); }
        .badge-amber { background: #1a1508; border: 1px solid #3a2f0e; color: var(--gold); }
        .badge-blue  { background: #060e1f; border: 1px solid #1e3a6e; color: var(--blue); }

        .scenario-label {
          font-size: .75rem;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: .25rem;
          font-family: var(--font-head);
        }
        .scenario-title {
          font-family: var(--font-head);
          font-size: 1rem;
          font-weight: 600;
          color: #fff;
          margin-bottom: .5rem;
        }
        .scenario-desc {
          font-size: .875rem;
          color: var(--muted);
          line-height: 1.6;
        }

        /* ── CTA ── */
        .cta-block {
          background: var(--surface);
          border: 1px solid var(--border);
          border-top: 2px solid var(--gold);
          border-radius: var(--radius);
          padding: 2.5rem;
          text-align: center;
          margin: 4rem max(1.5rem, 8vw);
          max-width: 860px;
          margin-left: auto;
          margin-right: auto;
        }
        .cta-block h2 {
          font-family: var(--font-head);
          font-size: 1.5rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: .75rem;
        }
        .cta-block p {
          color: var(--muted);
          font-weight: 300;
          margin-bottom: 1.5rem;
          max-width: 480px;
          margin-left: auto;
          margin-right: auto;
        }
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: .5rem;
          background: var(--gold);
          color: #0c0d0f;
          font-family: var(--font-head);
          font-weight: 700;
          font-size: .9rem;
          letter-spacing: .04em;
          padding: .75rem 1.75rem;
          border-radius: var(--radius);
          text-decoration: none;
          transition: background .2s, transform .15s;
        }
        .btn-primary:hover { background: #f0c95c; transform: translateY(-1px); }

        /* ── Footer ── */
        .page-footer {
          border-top: 1px solid var(--border);
          padding: 2rem max(1.5rem, 8vw);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          margin-top: 4rem;
        }
        .footer-brand {
          font-family: var(--font-head);
          font-size: .85rem;
          font-weight: 700;
          color: var(--muted);
        }
        .footer-brand span { color: var(--gold); }
        .footer-note {
          font-size: .75rem;
          color: #4a4f5e;
          max-width: 480px;
          text-align: right;
        }

        @media (max-width: 600px) {
          .scenarios { grid-template-columns: 1fr; }
          .footer-note { text-align: left; }
        }
      `}</style>

      {/* ── Nav ── */}
      <nav className="nav">
        <Link href="/" className="nav-brand">
          Tactical<span>Fit</span>Finder
        </Link>
        <Link href="/" className="nav-link">← Back to Search</Link>
      </nav>

      {/* ── Hero ── */}
      <header className="hero">
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <span>Learn</span>
          <span className="breadcrumb-sep">/</span>
          <span>Adapter Plates</span>
        </div>

        <div className="hero-tag">Beginner's Guide</div>

        <h1>
          How Optic Adapter Plates<br />
          <em>Actually Work</em>
        </h1>
        <p className="hero-lead">
          Mounting a red dot on your handgun sounds straightforward — until you realize your
          pistol's slide cut and your optic of choice speak different languages. Here's everything
          you need to know before you buy.
        </p>
      </header>

      <div className="divider" />

      {/* ── Section 1: The Cut ── */}
      <section className="section">
        <p className="section-label">The Basics</p>
        <h2>Your Slide Has a Cut. That Cut Has a Shape.</h2>

        <p>
          When a modern handgun is machined to accept a red dot sight, the manufacturer removes
          material from the top of the slide to create a recessed mounting area. This is called
          the <strong>optic cut</strong> (or sometimes the "milling"). The specific shape,
          screw pattern, and dimensions of that cut are called the <strong>footprint</strong>.
        </p>
        <p>
          Think of it like a USB port. Just like you can't plug a USB-C cable into a USB-A port
          without an adapter, you can't bolt an optic with one footprint shape onto a slide cut
          for a different footprint — not without help.
        </p>

        <div className="infobox">
          <strong>Why does this matter?</strong> If you buy the wrong optic for your slide's cut,
          it simply won't mount. No amount of force or creativity will make mismatched footprints work.
          Knowing your slide's footprint before you shop saves you a frustrating return.
        </div>

        <p>
          There are a handful of footprints that have become industry standards, and most modern
          optics-ready (OR) handguns use one of them. Here are the most common ones you'll encounter:
        </p>

        <div className="footprint-grid">
          {[
            "Trijicon RMR",
            "Shield RMSc",
            "Holosun 507K / K-Pattern",
            "Leupold DeltaPoint Pro",
            "Vortex Venom / Viper",
            "C-More STS",
            "Glock MOS",
            "Sig Romeo Zero",
          ].map((fp) => (
            <FootprintPill key={fp} name={fp} />
          ))}
        </div>

        <p>
          Some manufacturers also have their own <strong>proprietary footprints</strong> that
          don't match any universal standard — meaning only specific optics designed for that
          gun will fit without an adapter.
        </p>
      </section>

      <div className="divider" />

      {/* ── Section 2: How Mounting Works ── */}
      <section className="section">
        <p className="section-label">Mounting Methods</p>
        <h2>Three Ways an Optic Gets Onto Your Slide</h2>
        <p>
          Once you know your slide has an optic cut, there are three scenarios you might encounter
          depending on the combination of your gun and the optic you want.
        </p>

        <div className="scenarios">
          <ScenarioCard
            icon={<IconDirect />}
            label="Scenario 1"
            title="Direct Mount"
            description="Your slide's cut and your optic's footprint are a perfect match. The optic screws directly into the slide — no adapter needed. This is the cleanest, most rigid setup possible."
            badge="Simplest"
            badgeColor="green"
          />
          <ScenarioCard
            icon={<IconPlate />}
            label="Scenario 2"
            title="Plate-Assisted Mount"
            description="Your slide uses a universal or wide-format cut (like a Glock MOS or SIG KORE system). A thin metal adapter plate bolts into that cut and gives your specific optic a new surface to mount to."
            badge="Most Common"
            badgeColor="amber"
          />
          <ScenarioCard
            icon={<IconSlide />}
            label="Scenario 3"
            title="Proprietary Cut"
            description="Your slide has a manufacturer-specific cut that only accepts that brand's adapter system. You'll need to use their plates or buy an optic that matches the proprietary footprint exactly."
            badge="Brand-Specific"
            badgeColor="blue"
          />
        </div>

        <div className="infobox">
          <strong>Real-world example:</strong> An RMSc-cut Hellcat can accept Shield RMSc optics
          directly — no plate. But if you want to mount a Trijicon RMR on that same gun, you'd need
          an adapter plate that sits between the RMSc cut and the RMR's footprint. Some plates for
          this exist; some combinations don't have a viable adapter at all.
        </div>
      </section>

      <div className="divider" />

      {/* ── Section 3: What are adapter plates ── */}
      <section className="section">
        <p className="section-label">Adapter Plates, Explained</p>
        <h2>What Is an Optic Adapter Plate, Exactly?</h2>

        <p>
          An adapter plate (sometimes called an optic plate or mounting plate) is a small, precisely
          machined piece of metal — usually aluminum or steel — that acts as a translator between
          your slide's cut and an optic that doesn't natively fit it.
        </p>
        <p>
          The <strong>bottom of the plate</strong> is shaped to match your slide's cut and screw pattern.
          The <strong>top of the plate</strong> is shaped to match your optic's footprint and screw pattern.
          By stacking the plate between the two, you create a secure mounting path where none existed before.
        </p>
        <p>
          Most plates are only a few millimeters thick, so they add minimal height to your optic.
          Quality plates from reputable manufacturers are machined to extremely tight tolerances and
          won't compromise your zero under recoil. Cheap or poorly-made plates, however, can shift
          under fire — always use plates from trusted sources.
        </p>

        <div className="steps">
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

      <div className="divider" />

      {/* ── Section 4: Common Misconceptions ── */}
      <section className="section">
        <p className="section-label">Common Questions</p>
        <h2>Things That Trip Up New Buyers</h2>

        <p>
          <strong>
            "My gun and my optic are both 'MOS compatible' — why don't they fit?"
          </strong>
          <br />
          "MOS" (Modular Optic System) is Glock's term for their plate-based adapter system,
          not a single universal footprint. Each MOS-ready Glock comes with a set of plates
          for common optics, but they're not all the same across Glock models. Always verify
          the exact plate number for your gun's frame size.
        </p>

        <p style={{ marginTop: "1.5rem" }}>
          <strong>
            "The optic says it fits 'RMR footprint' guns. My gun has an RMR cut. But the screw holes don't line up."
          </strong>
          <br />
          The RMR footprint is one of the most copied in the industry, but there are subtle
          variations in screw hole spacing and depth across manufacturers. Always cross-reference
          the specific gun model and optic model — not just the footprint name.
        </p>

        <p style={{ marginTop: "1.5rem" }}>
          <strong>
            "Can I just mill (cut) my own slide to fit any optic?"
          </strong>
          <br />
          Custom milling is a real option performed by gunsmiths, and it's how many older pistols
          get optic-ready. But it's a permanent modification that requires professional work.
          It's not something you do at home with a Dremel. If you want to explore this route,
          find a gunsmith who specializes in optic cuts.
        </p>

        <div className="infobox">
          <strong>Bottom line:</strong> The safest approach is to use Tactical Fit Finder's
          compatibility tool to enter your exact gun model and the optic you're considering.
          We cross-reference mounting footprints and known plate compatibility so you know
          exactly what you're working with before anything is purchased.
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="cta-block">
        <h2>Ready to Find Your Fit?</h2>
        <p>
          Enter your handgun and see which optics mount directly — and which ones need a plate.
          No guesswork, no wasted returns.
        </p>
        <Link href="/" className="btn-primary">
          Search Compatibility →
        </Link>
      </div>

      {/* ── Footer ── */}
      <footer className="page-footer">
        <div className="footer-brand">
          Tactical<span>Fit</span>Finder
        </div>
        <p className="footer-note">
          Compatibility information is provided for reference only. Always verify fitment with
          your firearm's manufacturer before purchase. Safe gun handling practices should be
          observed at all times.
        </p>
      </footer>
    </>
  );
}