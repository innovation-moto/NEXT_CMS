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
        const childEls = Array.from(el.querySelectorAll(':scope > *'))
        if (childEls.length === 0) return

        // 初期状態をセット（immediateRender を使わず明示的に set する）
        gsap.set(childEls, { opacity: 0, y: 30 })

        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          once: true,
          onEnter: () => {
            gsap.to(childEls, {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.15,
              ease: 'power3.out',
            })
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
