import { Syne, DM_Sans } from 'next/font/google'

const syne = Syne({ subsets: ['latin'] })
const dmSans = DM_Sans({ subsets: ['latin'] })

export default function ComingSoon() {
  return (
    <div className={`min-h-screen bg-[#0d1117] flex flex-col items-center justify-center p-8 ${dmSans.className}`}>
      <div className="max-w-md w-full text-center">

        {/* Logo / wordmark */}
        <div className={`text-3xl font-bold text-[#e6edf3] mb-2 tracking-tight ${syne.className}`}>
          Tactical Fit Finder
        </div>

        {/* Divider */}
        <div className="w-12 h-px bg-[#30363d] mx-auto my-6" />

        {/* Status */}
        <div className="inline-flex items-center gap-2 bg-[#161b22] border border-[#30363d] rounded-full px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] animate-pulse" />
          <span className="text-sm text-[#8b949e]">In development</span>
        </div>

        {/* Headline */}
        <h1 className={`text-xl font-semibold text-[#e6edf3] mb-3 ${syne.className}`}>
          Coming Soon
        </h1>

        {/* Subtext */}
        <p className="text-[#8b949e] text-sm leading-relaxed">
          We're building the most comprehensive handgun optics compatibility tool available.
          Find the exact optic that fits your pistol's footprint — no guesswork required.
        </p>

        {/* Bottom rule */}
        <div className="w-12 h-px bg-[#21262d] mx-auto mt-10" />
        <p className="text-[#484f58] text-xs mt-4">tacticalfitfinder.com</p>

      </div>
    </div>
  )
}