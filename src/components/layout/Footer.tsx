import Link from 'next/link'

const footerLinks = [
  {
    title: 'コンテンツ',
    links: [
      { href: '/news', label: 'ニュース' },
      { href: '/blog', label: 'ブログ' },
    ],
  },
  {
    title: '会社情報',
    links: [
      { href: '/about', label: '会社概要' },
      { href: '/services', label: 'サービス' },
      { href: '/team', label: 'チーム' },
    ],
  },
  {
    title: 'お問い合わせ',
    links: [
      { href: '/contact', label: 'お問い合わせフォーム' },
    ],
  },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-bg-card">
      <div className="container py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="group inline-flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent">
                <span className="font-display text-sm font-bold text-white">IM</span>
              </div>
              <span className="font-display text-lg font-bold text-white">
                Innovation<span className="text-accent">Music</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-[#888888]">
              音楽とテクノロジーの融合で、<br />新しい体験を創り出す。
            </p>
          </div>

          {/* Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#888888]">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#888888] transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-xs text-[#888888]">
            © {currentYear} Innovation Music. All rights reserved.
          </p>
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-xs text-[#888888]">
              Powered by Next.js + Supabase
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
