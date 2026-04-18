'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import Image from 'next/image'
import Link from 'next/link'

type Slide = {
  id: number
  title: string
  subtitle: string
  cta: { label: string; href: string }
  image: string
  accent: string
}

const DEFAULT_SLIDES: Slide[] = [
  {
    id: 1,
    title: 'Sound\nBeyond Limits',
    subtitle: '音楽とテクノロジーの融合で、聴こえたことのない体験を創り出す',
    cta: { label: 'サービスを見る', href: '/services' },
    image: '/images/hero-1.jpg',
    accent: '#e53e3e',
  },
  {
    id: 2,
    title: 'Digital\nHarmony',
    subtitle: 'デジタルの力で、音楽ビジネスを次のステージへと進化させる',
    cta: { label: '私たちについて', href: '/about' },
    image: '/images/hero-2.jpg',
    accent: '#fc8181',
  },
  {
    id: 3,
    title: 'Crafting\nExperiences',
    subtitle: '人の心を震わせる音楽体験を、テクノロジーで創り続ける',
    cta: { label: 'お問い合わせ', href: '/contact' },
    image: '/images/hero-3.jpg',
    accent: '#e53e3e',
  },
]

export default function HeroSlider({ slides = DEFAULT_SLIDES }: { slides?: Slide[] }) {
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const textRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()

  const animateText = () => {
    if (!textRef.current) return
    gsap.fromTo(
      textRef.current.querySelectorAll('.hero-anim'),
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out' }
    )
  }

  const goTo = (index: number) => {
    if (isTransitioning || index === current) return
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrent(index)
      setIsTransitioning(false)
      animateText()
    }, 400)
  }

  useEffect(() => {
    animateText()
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
      animateText()
    }, 6000)
    return () => clearInterval(intervalRef.current)
  }, [slides.length])

  const slide = slides[current]

  return (
    <section className="relative h-screen min-h-[600px] overflow-hidden bg-bg">
      {/* Background images */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={s.image}
            alt={s.title.replace('\n', ' ')}
            fill
            className="object-cover opacity-20"
            priority={i === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent" />
        </div>
      ))}

      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(229,62,62,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(229,62,62,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Accent top line */}
      <div
        className="absolute left-0 top-0 h-0.5 w-full transition-all duration-1000"
        style={{ background: `linear-gradient(90deg, ${slide.accent}, transparent)` }}
      />

      {/* Text content */}
      <div ref={textRef} className="relative z-10 flex h-full items-center">
        <div className="container">
          <span
            className="hero-anim mb-4 inline-block text-xs font-medium tracking-[0.4em] uppercase"
            style={{ color: slide.accent }}
          >
            {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
          </span>

          <h1 className="hero-anim mb-6 whitespace-pre-line font-display text-5xl font-bold leading-tight text-white lg:text-7xl xl:text-8xl">
            {slide.title}
          </h1>

          <p className="hero-anim mb-8 max-w-md text-base text-[#888888] lg:text-lg">
            {slide.subtitle}
          </p>

          <Link
            href={slide.cta.href}
            className="hero-anim inline-flex items-center gap-2 rounded-full border border-accent px-8 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-accent hover:shadow-[0_0_24px_rgba(229,62,62,0.4)]"
          >
            {slide.cta.label}
            <span className="text-lg">→</span>
          </Link>
        </div>
      </div>

      {/* Slide navigation dots */}
      <div className="absolute bottom-8 right-8 z-10 flex gap-3 md:right-12">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === current ? 'w-8 bg-accent' : 'w-3 bg-white/30 hover:bg-white/60'
            }`}
            aria-label={`スライド ${i + 1}`}
            aria-current={i === current ? 'true' : undefined}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-white/40">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <div className="h-8 w-px animate-pulse bg-white/30" />
      </div>
    </section>
  )
}
