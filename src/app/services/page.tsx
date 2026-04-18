import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import PageHero from '@/components/common/PageHero'
import ScrollAnimWrapper from '@/components/common/ScrollAnimWrapper'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Services',
  description: 'Innovation Music が提供するサービスをご紹介します。',
}

const services = [
  {
    icon: '🎵',
    title: '音楽プロダクション',
    description:
      'プロフェッショナルな音楽制作から編曲、マスタリングまでをワンストップで提供します。経験豊富なプロデューサーとエンジニアが、あなたのビジョンを最高のサウンドで実現します。',
    features: ['楽曲制作・編曲', 'レコーディング', 'ミキシング・マスタリング', 'ライブ音響設計'],
  },
  {
    icon: '🎛️',
    title: 'サウンドデザイン',
    description:
      'ゲーム、映像、インスタレーションのための独創的なサウンドデザインを手がけます。UI/UXサウンドから環境音、エフェクトまで幅広く対応します。',
    features: ['ゲームサウンド', '映像・CM音楽', 'UI/UXサウンド', 'インスタレーション音響'],
  },
  {
    icon: '🌐',
    title: 'デジタル配信支援',
    description:
      '音楽ストリーミングサービスへの配信から戦略立案まで、デジタル展開をサポートします。データ分析を駆使したマーケティング施策も提案します。',
    features: [
      'DSPへの一括配信',
      'リリース戦略立案',
      'データ分析・レポート',
      'プレイリスト施策',
    ],
  },
  {
    icon: '🤝',
    title: 'アーティスト支援',
    description:
      'アーティストの成長をトータルサポートします。ブランディングからファンコミュニティ形成まで、音楽活動の全方位をサポートします。',
    features: ['アーティストブランディング', 'SNS戦略', 'ファンコミュニティ設計', 'グッズ企画'],
  },
  {
    icon: '🎓',
    title: '音楽教育プログラム',
    description:
      'オンライン・オフラインを組み合わせた音楽教育プログラムを提供します。プロを目指す方から趣味として楽しみたい方まで対応します。',
    features: ['個別レッスン', 'グループレッスン', 'オンライン動画講座', 'ワークショップ'],
  },
  {
    icon: '🏢',
    title: 'BGM・環境音楽制作',
    description:
      '商業施設、ホテル、レストランなど様々な空間に最適なBGM・環境音楽を制作・提案します。空間の価値を音で高めます。',
    features: ['空間音楽設計', 'BGM選定・制作', '定期更新サービス', '音響コンサルティング'],
  },
]

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main>
        <PageHero
          title="Services"
          subtitle="音楽とテクノロジーを融合した、革新的なサービスを提供します。"
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Services' }]}
        />

        <section className="section bg-bg">
          <div className="container">
            <ScrollAnimWrapper animation="stagger" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <div
                  key={service.title}
                  className="group rounded-xl border border-border bg-bg-card p-6 transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-2xl transition-all group-hover:bg-accent/20">
                    {service.icon}
                  </div>
                  <h2 className="mb-3 font-display text-xl font-bold text-white">
                    {service.title}
                  </h2>
                  <p className="mb-5 text-sm leading-relaxed text-[#888888]">
                    {service.description}
                  </p>
                  <ul className="space-y-1.5">
                    {service.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-[#888888]">
                        <span className="h-1 w-1 rounded-full bg-accent flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </ScrollAnimWrapper>

            {/* CTA */}
            <ScrollAnimWrapper animation="fadeUp" className="mt-16 text-center">
              <p className="mb-6 text-[#888888]">
                ご不明な点やご相談はお気軽にお問い合わせください。
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-10 py-4 font-medium text-white transition-all hover:bg-accent/80 hover:shadow-[0_0_24px_rgba(229,62,62,0.4)]"
              >
                お問い合わせはこちら →
              </Link>
            </ScrollAnimWrapper>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
