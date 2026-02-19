'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

gsap.registerPlugin(ScrollTrigger)

export function CtaSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)
  const btnsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const title = titleRef.current
    const text = textRef.current
    if (!section || !title) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          toggleActions: 'play none none none',
          invalidateOnRefresh: true,
        },
      })
      tl.fromTo(title, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out', force3D: true })
      if (text) tl.fromTo(text, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out', force3D: true }, '-=0.25')
      if (btnsRef.current) tl.fromTo(btnsRef.current, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out', force3D: true }, '-=0.15')
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <h2 ref={titleRef} className="text-3xl md:text-4xl font-bold text-balance">
          Ready to Get Started?
        </h2>
        <p ref={textRef} className="text-lg text-muted-foreground">
          Browse our gallery of pre-designed models or upload your own custom design today.
        </p>
        <div ref={btnsRef} className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button asChild size="lg">
            <Link href="/gallery">View Gallery</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/shop/products">Browse Marketplace</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="bg-background/80 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none">
            <Link href="/shop/upload">Upload Design</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
