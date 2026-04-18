'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import MobileMenu from './MobileMenu'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/news', label: 'News' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/team', label: 'Team' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // ルート変更時にメニューを閉じる
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'border-b border-border bg-bg/90 backdrop-blur-md'
            : 'bg-transparent'
        }`}
      >
        <div className="container">
          <div className="flex h-16 items-center justify-between lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent transition-all group-hover:bg-accent/80">
                <span className="font-display text-sm font-bold text-white">IM</span>
              </div>
              <span className="font-display text-lg font-bold text-white">
                Innovation<span className="text-accent">Music</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-8 lg:flex" aria-label="メインナビゲーション">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'text-accent'
                      : 'text-[#888888] hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* CTA + Hamburger */}
            <div className="flex items-center gap-4">
              <Link
                href="/contact"
                className="hidden rounded-full border border-accent px-5 py-2 text-sm font-medium text-accent transition-all hover:bg-accent hover:text-white hover:shadow-[0_0_20px_rgba(229,62,62,0.3)] lg:block"
              >
                お問い合わせ
              </Link>

              {/* Hamburger button (mobile) */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-md border border-border bg-bg-card lg:hidden"
                aria-label={menuOpen ? 'メニューを閉じる' : 'メニューを開く'}
                aria-expanded={menuOpen}
              >
                <span
                  className={`block h-0.5 w-5 bg-white transition-all duration-300 ${
                    menuOpen ? 'translate-y-2 rotate-45' : ''
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 bg-white transition-all duration-300 ${
                    menuOpen ? 'opacity-0' : ''
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 bg-white transition-all duration-300 ${
                    menuOpen ? '-translate-y-2 -rotate-45' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} links={navLinks} />
    </>
  )
}
