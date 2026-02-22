'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const navLinks = [
  { href: '/',                     label: 'Home' },
  { href: '/learn/adapter-plates', label: 'Adapters' },
  { href: '/submit',               label: 'Submit a Fit' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#21262d] bg-[#0d1117]/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 h-[60px] flex items-center justify-between">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-[#21262d] rounded flex items-center justify-center text-xs text-[#484f58] group-hover:bg-[#30363d] transition-colors">
              TFF
            </div>
            <span className="font-[family-name:var(--font-syne)] font-bold text-[#e6edf3] text-lg tracking-tight">
              Tactical Fit Finder
            </span>
          </Link>

          {/* Desktop links */}
          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map(({ href, label }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`
                    px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                    font-[family-name:var(--font-syne)]
                    ${isActive
                      ? 'bg-[#21262d] text-[#e6edf3]'
                      : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#161b22]'
                    }
                  `}
                >
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Hamburger button (mobile only) */}
          <button
            className="sm:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5 group"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span className={`block h-px w-5 bg-[#8b949e] transition-all duration-200 origin-center ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`block h-px w-5 bg-[#8b949e] transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-px w-5 bg-[#8b949e] transition-all duration-200 origin-center ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
          </button>

        </div>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          className="sm:hidden fixed inset-0 z-40 bg-[#0d1117]/80 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile menu drawer */}
      <nav
        className={`
          sm:hidden fixed top-[60px] left-0 right-0 z-40
          bg-[#0d1117] border-b border-[#21262d]
          transition-all duration-200 ease-in-out overflow-hidden
          ${menuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="px-6 py-4 flex flex-col gap-1">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`
                  px-3 py-2.5 rounded-md text-sm font-medium transition-colors
                  font-[family-name:var(--font-syne)]
                  ${isActive
                    ? 'bg-[#21262d] text-[#e6edf3]'
                    : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#161b22]'
                  }
                `}
              >
                {label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}