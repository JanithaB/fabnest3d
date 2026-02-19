'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Cable as Cube, Zap, Layers } from 'lucide-react'
import Link from 'next/link'

gsap.registerPlugin(ScrollTrigger)

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const title = titleRef.current
      const cards = section.querySelectorAll<HTMLElement>('[data-feature-card]')
      if (!title || cards.length === 0) return

      gsap.set([title, ...cards], { opacity: 0, y: 32 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 88%',
          end: 'top 20%',
          toggleActions: 'play none none none',
          invalidateOnRefresh: true,
        },
      })
      tl.to(title, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', force3D: true })
      tl.to(cards, { y: 0, opacity: 1, duration: 0.55, stagger: 0.1, ease: 'power3.out', force3D: true }, '-=0.35')

      ScrollTrigger.refresh()
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-20 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <h2
          ref={titleRef}
          className="text-3xl md:text-4xl font-bold text-center mb-12 text-balance"
        >
          Why Choose Our Service
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card
            data-feature-card
            ref={(el) => { cardsRef.current[0] = el }}
            className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="pt-6 space-y-4 relative z-10">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300 group-hover:scale-110 transform">
                <Zap className="h-6 w-6 text-primary group-hover:animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold">Fast Printing</h3>
              <p className="text-muted-foreground leading-relaxed">
                Quick turnaround times without compromising on quality. Most orders completed within 24-48 hours.
              </p>
            </CardContent>
          </Card>

          <Card
            data-feature-card
            ref={(el) => { cardsRef.current[1] = el }}
            className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="pt-6 space-y-4 relative z-10">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300 group-hover:scale-110 transform">
                <Layers className="h-6 w-6 text-primary group-hover:animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold">Multiple Materials</h3>
              <p className="text-muted-foreground leading-relaxed">
                Choose from PLA, ABS, PETG, TPU, and more. Each material optimized for different applications.
              </p>
            </CardContent>
          </Card>

          <Card
            data-feature-card
            ref={(el) => { cardsRef.current[2] = el }}
            className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="pt-6 space-y-4 relative z-10">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300 group-hover:scale-110 transform">
                <Cube className="h-6 w-6 text-primary group-hover:animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold">Custom Orders</h3>
              <p className="text-muted-foreground leading-relaxed">
                Upload your own designs or choose from our curated gallery. Professional support for complex projects.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
