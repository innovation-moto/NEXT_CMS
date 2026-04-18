import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import PageHero from '@/components/common/PageHero'
import ScrollAnimWrapper from '@/components/common/ScrollAnimWrapper'

export const metadata: Metadata = {
  title: 'Team',
  description: 'Innovation Music のチームメンバーをご紹介します。',
}

const members = [
  {
    name: '佐藤 革新',
    role: '代表取締役 / CEO',
    bio: '音楽プロデューサーとして15年以上のキャリアを持つ。テクノロジーと音楽の融合に情熱を注ぐ。',
    emoji: '🎹',
  },
  {
    name: '田中 音',
    role: 'CTO / サウンドエンジニア',
    bio: 'MIT出身のエンジニアでありながら音楽理論にも精通。革新的な音楽テクノロジーを開発。',
    emoji: '💻',
  },
  {
    name: '山田 旋律',
    role: 'クリエイティブディレクター',
    bio: '広告・映像業界でのサウンドデザイン経験を持つ。ブランドの声を音楽で表現するプロ。',
    emoji: '🎨',
  },
  {
    name: '鈴木 リズム',
    role: 'アーティストリレーション',
    bio: 'レコード会社A&Rを経て参画。国内外200名以上のアーティストとのリレーションを持つ。',
    emoji: '🤝',
  },
  {
    name: '伊藤 ハーモニー',
    role: 'プロデューサー',
    bio: 'J-POPからEDMまで幅広いジャンルに対応するトップクリエイター。数々のヒット曲を手掛ける。',
    emoji: '🎧',
  },
  {
    name: '渡辺 ビート',
    role: 'マーケティングマネージャー',
    bio: '音楽×SNSマーケティングの専門家。TikTokバイラルを多数実現した戦略家。',
    emoji: '📊',
  },
]

export default function TeamPage() {
  return (
    <>
      <Header />
      <main>
        <PageHero
          title="Team"
          subtitle="音楽とテクノロジーを愛する、多彩なメンバーが集まっています。"
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Team' }]}
        />

        <section className="section bg-bg">
          <div className="container">
            <ScrollAnimWrapper animation="stagger" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <div
                  key={member.name}
                  className="group rounded-xl border border-border bg-bg-card p-6 transition-all hover:-translate-y-1 hover:border-accent/40"
                >
                  {/* Avatar */}
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-border bg-bg-elevated text-3xl transition-all group-hover:border-accent">
                    {member.emoji}
                  </div>

                  {/* Info */}
                  <h2 className="mb-0.5 font-display text-lg font-bold text-white">
                    {member.name}
                  </h2>
                  <p className="mb-3 text-xs font-medium text-accent">{member.role}</p>
                  <p className="text-sm leading-relaxed text-[#888888]">{member.bio}</p>
                </div>
              ))}
            </ScrollAnimWrapper>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
