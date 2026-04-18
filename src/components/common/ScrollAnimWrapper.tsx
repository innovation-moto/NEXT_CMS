'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface Props {
  children: React.ReactNode
  animation?: 'fadeUp' | 'fadeIn' | 'slideLeft' | 'slideRight' | 'stagger'
  delay?: number
  className?: string
}

export default function ScrollAnimWrapper({
  children,
  animation = 'fadeUp',
  delay = 0,
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // gsap.context() を使うことで、アンマウント時に全トゥイーン・
    // ScrollTrigger を一括クリーンアップできる（React Strict Mode 対応）
    const ctx = gsap.context(() => {
      if (animation === 'stagger') {
        const childEls = el.querySelectorAll(':scope > *')
        gsap.from(childEls, {
          opacity: 0,
          y: 30,
          duration: 0.7,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
        })
        return
      }

      const fromVars: gsap.TweenVars = { opacity: 0 }
      const toVars: gsap.TweenVars = {
        opacity: 1,
        duration: 0.8,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
      }

      if (animation === 'fadeUp') {
        fromVars.y = 40
        toVars.y = 0
      }
      if (animation === 'slideLeft') {
        fromVars.x = -60
        toVars.x = 0
      }
      if (animation === 'slideRight') {
        fromVars.x = 60
        toVars.x = 0
      }

      gsap.fromTo(el, fromVars, toVars)
    }, el)

    return () => ctx.revert()
  }, [animation, delay])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
