'use client'

import { useEffect, useRef } from 'react'

export function TechEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const particlesRef = useRef<Array<{
    x: number
    y: number
    vx: number
    vy: number
    size: number
    opacity: number
  }>>([])
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      console.log('Canvas not found')
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.log('Context not found')
      return
    }

    let width = window.innerWidth
    let height = window.innerHeight

    // Initialize canvas size
    const setCanvasSize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'
    }
    setCanvasSize()

    // Initialize mouse position
    mouseRef.current = { x: width / 2, y: height / 2 }

    // Create particles - more visible
    const particleCount = 50
    particlesRef.current = []
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1,
        vy: (Math.random() - 0.5) * 1,
        size: Math.random() * 1.5 + 1,
        opacity: Math.random() * 0.3 + 0.7,
      })
    }

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('resize', setCanvasSize)

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height)

      const particles = particlesRef.current

      particles.forEach((particle, i) => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Wrap around
        if (particle.x < 0) particle.x = width
        if (particle.x > width) particle.x = 0
        if (particle.y < 0) particle.y = height
        if (particle.y > height) particle.y = 0

        // Mouse interaction
        const dx = mouseRef.current.x - particle.x
        const dy = mouseRef.current.y - particle.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 120) {
          const force = (120 - dist) / 120
          particle.vx -= (dx / dist) * force * 0.03
          particle.vy -= (dy / dist) * force * 0.03
        }

        // Draw glow first (behind)
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.size * 3
        )
        gradient.addColorStop(0, `rgba(100, 150, 255, ${particle.opacity * 0.8})`)
        gradient.addColorStop(0.5, `rgba(100, 150, 255, ${particle.opacity * 0.4})`)
        gradient.addColorStop(1, 'rgba(100, 150, 255, 0)')
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Draw particle core - very bright
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(120, 180, 255, 1)`
        ctx.fill()

        // Draw bright center - white
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.fill()

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const other = particles[j]
          const dx = particle.x - other.x
          const dy = particle.y - other.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 250) {
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(other.x, other.y)
            ctx.strokeStyle = `rgba(100, 150, 255, ${(1 - distance / 250) * 0.5})`
            ctx.lineWidth = 1.5
            ctx.stroke()
          }
        }
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    console.log('TechEffects: Starting animation with', particleCount, 'particles')
    animate()

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', setCanvasSize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <div 
      className="fixed inset-0 pointer-events-none" 
      style={{ 
        zIndex: -1,
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  )
}
