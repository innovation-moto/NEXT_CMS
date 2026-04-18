'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

interface NavItem {
  href: string
  label: string
  icon: string
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  { href: '/admin', label: 'ダッシュボード', icon: '🏠' },
  { href: '/admin/posts?type=news', label: 'ニュース', icon: '📰' },
  { href: '/admin/posts?type=blog', label: 'ブログ', icon: '📝' },
  { href: '/admin/media', label: 'メディア', icon: '🖼️' },
  { href: '/admin/contact', label: 'お問い合わせ', icon: '📧' },
  { href: '/admin/users', label: 'ユーザー管理', icon: '👥', adminOnly: true },
]

interface Props {
  userRole: string
}

export default function AdminSidebar({ userRole }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isAdmin = userRole === 'admin'

  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin)

  function isActive(itemHref: string): boolean {
    const [itemPath, itemQuery] = itemHref.split('?')
    if (itemHref === '/admin') return pathname === '/admin'

    if (!pathname.startsWith(itemPath)) return false

    // クエリパラメータがある場合はそれも一致確認
    if (itemQuery) {
      const [key, value] = itemQuery.split('=')
      return searchParams.get(key) === value
    }

    return true
  }

  return (
    <aside className="flex w-60 flex-shrink-0 flex-col border-r border-[#1a1a28] bg-[#111118]">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-[#1a1a28] px-6">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent">
            <span className="font-display text-xs font-bold text-white">IM</span>
          </div>
          <span className="font-display text-sm font-bold text-white">
            Innovation<span className="text-accent">Music</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4" aria-label="管理画面ナビゲーション">
        <ul className="space-y-0.5 px-3">
          {visibleItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive(item.href)
                    ? 'border-l-2 border-accent bg-accent/10 pl-[10px] text-white'
                    : 'text-[#888888] hover:bg-[#1a1a28] hover:text-white'
                }`}
              >
                <span className="w-5 text-center text-base">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Divider */}
        <div className="mx-3 my-4 border-t border-[#1a1a28]" />

        {/* Site link */}
        <div className="px-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#888888] hover:bg-[#1a1a28] hover:text-white"
          >
            <span className="w-5 text-center text-base">🌐</span>
            サイトを見る
          </Link>
        </div>
      </nav>

      {/* Role badge */}
      <div className="border-t border-[#1a1a28] px-4 py-3">
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isAdmin
              ? 'bg-accent/20 text-accent'
              : 'bg-[#1a1a28] text-[#888888]'
          }`}
        >
          {isAdmin ? '管理者' : '編集者'}
        </span>
      </div>
    </aside>
  )
}
