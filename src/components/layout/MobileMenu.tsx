'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import gsap from 'gsap'

interface NavLink {
  href: string
  label: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  links: NavLink[]
}

export default function MobileMenu({ isOpen, onClose, links }: Props) {
  const menuRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<HTMLLIElement[]>([])
  const pathname = usePathname()

  useEffect(() => {
    const menu = menuRef.current
    if (!menu) return

    if (isOpen) {
      gsap.fromTo(
        menu,
        { x: '100%', opacity: 0 },
        { x: '0%', opacity: 1, duration: 0.35, ease: 'power3.out' }
      )
      gsap.fromTo(
        itemsRef.current,
        { x: 30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, stagger: 0.06, delay: 0.15, ease: 'power3.out' }
      )
      document.body.style.overflow = 'hidden'
    } else {
      gsap.to(menu, { x: '100%', opacity: 0, duration: 0.3, ease: 'power3.in' })
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Menu Panel */}
      <div
        ref={menuRef}
        className="fixed right-0 top-0 z-50 flex h-full w-72 flex-col bg-bg-card p-8 shadow-2xl lg:hidden"
        style={{ transform: 'translateX(100%)' }}
        role="dialog"
        aria-modal="true"
        aria-label="モバイルメニュー"
      >
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <span className="font-display text-lg font-bold text-white">
            Innovation<span className="text-accent">Music</span>
          </span>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-[#888888] hover:text-white"
            aria-label="メニューを閉じる"
          >
            ×
          </button>
        </div>

        {/* Links */}
        <nav aria-label="モバイルナビゲーション">
          <ul className="space-y-1">
            {links.map((link, i) => (
              <li
                key={link.href}
                ref={(el) => {
                  if (el) itemsRef.current[i] = el
                }}
              >
                <Link
                  href={link.href}
                  onClick={onClose}
                  className={`block rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-accent/10 text-accent'
                      : 'text-[#888888] hover:bg-bg-elevated hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* CTA */}
        <div className="mt-auto pt-8 border-t border-border">
          <Link
            href="/contact"
            onClick={onClose}
            className="block w-full rounded-full bg-accent py-3 text-center text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            お問い合わせ
          </Link>
        </div>
      </div>
    </>
  )
}
