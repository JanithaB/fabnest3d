'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function HeroSection() {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const btnsRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const spans = headingRef.current?.querySelectorAll('span')
      if (spans?.length) gsap.fromTo(spans, { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out', force3D: true })
      if (subRef.current) gsap.fromTo(subRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, delay: 0.2, ease: 'power2.out', force3D: true })
      if (btnsRef.current) gsap.fromTo(btnsRef.current, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, delay: 0.4, ease: 'power2.out', force3D: true })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] min-h-[100dvh] md:min-h-[85vh] pt-[max(3.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] px-4 sm:pt-20 sm:pb-32 sm:px-6 overflow-hidden flex flex-col md:block"
    >
      {/* Mobile: gradient only (no bg image) */}
      <div className="absolute inset-0 z-0 sm:hidden bg-gradient-to-b from-background via-muted/20 to-background" />

      {/* Desktop: background image + overlay */}
      <div className="absolute inset-0 z-0 hidden sm:block">
        <Image
          src="/site_images/background.webp"
          alt=""
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/50 to-background/70" />
      </div>

      {/* VR character: hidden on mobile, visible from sm; desktop = left overlay (mirrored 180°) */}
      <div className="absolute inset-0 z-[1] pointer-events-none hidden sm:flex flex-col justify-end items-center md:items-start md:justify-end">
        <div className="w-full max-w-[320px] h-[clamp(260px,42vh,360px)] min-[480px]:max-w-[360px] min-[480px]:h-[clamp(280px,44vh,380px)] sm:max-w-[320px] sm:h-[clamp(240px,38vh,340px)] md:max-w-[680px] md:h-[clamp(480px,75vh,800px)] md:w-[min(55vw,680px)] relative shrink-0 md:mt-0 scale-x-[-1] px-4 pb-0 pt-4 sm:px-0 sm:pt-0 sm:pb-0 md:pl-0">
          <Image
            src="/site_images/character-boy-with-virtual-reality-device-metaverse-3d-illustration.png"
            alt="Person in VR exploring 3D"
            width={720}
            height={840}
            className="object-contain object-bottom w-full h-full [mix-blend-mode:lighten]"
            priority
            sizes="(max-width: 480px) 320px, (max-width: 640px) 360px, (max-width: 768px) 320px, 680px"
          />
        </div>
      </div>

      {/* Baby dragon – bottom-right; hidden on mobile, visible from sm */}
      {/* <div className="absolute bottom-0 right-0 z-[2] pointer-events-none hidden sm:flex items-end justify-end pr-[max(0.5rem,env(safe-area-inset-right))] pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:pr-6 sm:pb-4 md:pr-8 md:pb-6">
        <Image
          src="/site_images/baby_dragon.gif"
          alt=""
          width={320}
          height={320}
          className="w-24 h-24 min-[480px]:w-28 min-[480px]:h-28 sm:w-36 sm:h-36 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-72 xl:h-72 object-contain object-bottom drop-shadow-md"
          unoptimized
        />
      </div> */}

      {/* Subtle gradient orbs for depth */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl opacity-40 animate-pulse z-[1]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/15 rounded-full blur-3xl opacity-40 animate-pulse z-[1] [animation-delay:1s]" />

      <div className="max-w-6xl mx-auto relative z-10 flex-1 flex flex-col justify-center md:block pt-2 sm:pt-4 md:pt-0">
        <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-6">
          <h1 ref={headingRef} className="text-3xl min-[480px]:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance relative px-1">
            <span className="relative z-10 block">Precision 3D Printing</span>
            <span className="block text-primary relative z-10">
              Made Simple
              <span className="absolute -inset-1 bg-primary/20 blur-xl opacity-50 animate-pulse" />
            </span>
          </h1>
          <p ref={subRef} className="text-sm min-[480px]:text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed px-2">
            Transform your ideas into reality with professional-grade 3D printing. Fast turnaround, multiple
            materials, and custom orders.
          </p>
          <div ref={btnsRef} className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2 sm:pt-4 px-2 pb-4 sm:pb-0">
            <Button asChild size="lg" className="text-base w-full sm:w-auto min-h-11 touch-manipulation">
              <Link href="/shop/products">
                Browse Marketplace
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-base w-full sm:w-auto min-h-11 touch-manipulation bg-background/80 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none"
            >
              <Link href="/shop/upload">Upload Your Design</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
