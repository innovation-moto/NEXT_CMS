import type { Metadata } from 'next'
import { Inter, Syne } from 'next/font/google'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
})

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Innovation Music'
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://innovation-music.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description:
    'Innovation Music — 音楽とテクノロジーの融合で、新しい体験を創り出す。',
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: siteUrl,
    siteName,
    title: siteName,
    description: 'Innovation Music — 音楽とテクノロジーの融合で、新しい体験を創り出す。',
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: 'Innovation Music — 音楽とテクノロジーの融合で、新しい体験を創り出す。',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={`${inter.variable} ${syne.variable}`}>
      <body className="bg-bg text-[#e8e8e8] antialiased">{children}</body>
    </html>
  )
}
