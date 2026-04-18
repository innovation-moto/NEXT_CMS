import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import PageHero from '@/components/common/PageHero'
import ScrollAnimWrapper from '@/components/common/ScrollAnimWrapper'

export const metadata: Metadata = {
  title: 'About',
  description: 'Innovation Music の会社概要・ミッション・沿革についてご紹介します。',
}

const companyInfo = [
  { label: '会社名', value: 'Innovation Music 株式会社' },
  { label: '設立', value: '2020年4月' },
  { label: '所在地', value: '東京都渋谷区道玄坂2-10-12' },
  { label: '代表取締役', value: '佐藤 革新' },
  { label: '事業内容', value: '音楽プロダクション、サウンドデザイン、デジタル音楽配信支援' },
  { label: 'URL', value: 'https://innovation-music.com' },
]

const timeline = [
  { year: '2020', event: '東京都渋谷区にて Innovation Music 株式会社設立' },
  { year: '2021', event: '音楽プロダクション事業を本格開始。初年度に10タイトルをリリース' },
  { year: '2022', event: 'サウンドデザイン部門を新設。ゲーム・映像業界への参入' },
  { year: '2023', event: 'デジタル配信支援サービス「Sound Studio Pro」をリリース' },
  { year: '2024', event: '累計リリース楽曲100作品突破。海外アーティストとのコラボ開始' },
]

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        <PageHero
          title="About"
          subtitle="音楽とテクノロジーの融合で、新しい体験を創り出す。"
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'About' }]}
        />

        {/* Mission & Vision */}
        <section className="section bg-bg">
          <div className="container">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <ScrollAnimWrapper animation="slideLeft">
                <div className="rounded-xl border border-border bg-bg-card p-8">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-2xl">
                    🎯
                  </div>
                  <h2 className="mb-3 font-display text-2xl font-bold text-white">Mission</h2>
                  <p className="leading-relaxed text-[#888888]">
                    テクノロジーの力で音楽の可能性を拡張し、アーティストとリスナーがより深く繋がれる世界を実現する。
                  </p>
                </div>
              </ScrollAnimWrapper>

              <ScrollAnimWrapper animation="slideRight">
                <div className="rounded-xl border border-border bg-bg-card p-8">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-2xl">
                    🔭
                  </div>
                  <h2 className="mb-3 font-display text-2xl font-bold text-white">Vision</h2>
                  <p className="leading-relaxed text-[#888888]">
                    音楽産業とテクノロジー産業の垣根を取り払い、次世代の音楽体験を世界中に届けるプラットフォームになる。
                  </p>
                </div>
              </ScrollAnimWrapper>
            </div>
          </div>
        </section>

        {/* Company Info */}
        <section className="section bg-bg-card">
          <div className="container max-w-3xl">
            <ScrollAnimWrapper animation="fadeIn">
              <p className="section-label mb-3">Company</p>
              <h2 className="section-title mb-8">会社概要</h2>
            </ScrollAnimWrapper>

            <ScrollAnimWrapper animation="fadeUp">
              <div className="overflow-hidden rounded-xl border border-border">
                {companyInfo.map((item, i) => (
                  <div
                    key={item.label}
                    className={`flex flex-col gap-2 p-4 sm:flex-row sm:gap-8 ${
                      i !== companyInfo.length - 1 ? 'border-b border-border' : ''
                    }`}
                  >
                    <dt className="min-w-32 text-sm font-medium text-[#888888]">{item.label}</dt>
                    <dd className="text-sm text-white">{item.value}</dd>
                  </div>
                ))}
              </div>
            </ScrollAnimWrapper>
          </div>
        </section>

        {/* Timeline */}
        <section className="section bg-bg">
          <div className="container max-w-3xl">
            <ScrollAnimWrapper animation="fadeIn">
              <p className="section-label mb-3">History</p>
              <h2 className="section-title mb-12">沿革</h2>
            </ScrollAnimWrapper>

            <ScrollAnimWrapper animation="stagger" className="relative space-y-0">
              {/* Vertical line */}
              <div className="absolute left-[3.25rem] top-0 h-full w-px bg-border" />

              {timeline.map((item) => (
                <div key={item.year} className="relative flex gap-6 pb-10 last:pb-0">
                  {/* Year badge */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="flex h-[1.625rem] w-[1.625rem] items-center justify-center rounded-full border-2 border-accent bg-bg">
                      <div className="h-2 w-2 rounded-full bg-accent" />
                    </div>
                  </div>
                  <div className="pb-2 pt-0">
                    <span className="mb-1 block text-sm font-bold text-accent">{item.year}</span>
                    <p className="text-sm leading-relaxed text-[#888888]">{item.event}</p>
                  </div>
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
