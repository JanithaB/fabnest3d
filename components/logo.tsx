"use client"

import { cn } from "@/lib/utils"
import Image from "next/image"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface LogoProps {
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg"
}

export function Logo({ className, showText = false, size = "md" }: LogoProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const sizes = {
    sm: { logo: { width: 96, height: 32 }, text: "text-base" },
    md: { logo: { width: 180, height: 60 }, text: "text-xl" },
    lg: { logo: { width: 168, height: 56 }, text: "text-2xl" },
  }

  const { logo: logoDimensions, text: textSize } = sizes[size]

  // Use black logo for light mode, white logo for dark mode
  // Default to black logo if theme is not yet mounted
  const logoSrc = mounted && theme === "dark" 
    ? "/xmas-logo-white.png" 
    : "/xmas-logo-black.png"

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src={logoSrc}
        alt="FABNEST Logo"
        width={logoDimensions.width}
        height={logoDimensions.height}
        className="flex-shrink-0 pt-2"
        priority
      />
      {showText && (
        <span className={cn("font-bold tracking-tight", textSize)}>
          FABNEST
        </span>
      )}
    </div>
  )
}

