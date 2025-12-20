import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg"
}

export function Logo({ className, showText = true, size = "md" }: LogoProps) {
  const sizes = {
    sm: { logo: 24, text: "text-base" },
    md: { logo: 32, text: "text-xl" },
    lg: { logo: 40, text: "text-2xl" },
  }

  const { logo: logoSize, text: textSize } = sizes[size]

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        width={logoSize}
        height={logoSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Cube structure with gradient glow */}
        <defs>
          <linearGradient id="cubeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="1" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="1" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Top face of cube */}
        <path
          d="M8 16 L24 8 L40 16 L24 24 Z"
          fill="#1f2937"
          stroke="url(#cubeGradient)"
          strokeWidth="1.5"
        />
        {/* Right face of cube */}
        <path
          d="M24 8 L40 16 L40 32 L24 40 Z"
          fill="#1f2937"
          stroke="url(#cubeGradient)"
          strokeWidth="1.5"
        />
        {/* Left face of cube (darker) */}
        <path
          d="M8 16 L24 24 L24 40 L8 32 Z"
          fill="#111827"
          stroke="url(#cubeGradient)"
          strokeWidth="1.5"
        />

        {/* F letter integrated into cube - vertical stem */}
        <line x1="12" y1="20" x2="12" y2="36" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
        {/* Top horizontal bar */}
        <line x1="12" y1="20" x2="20" y2="20" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
        {/* Middle horizontal bar */}
        <line x1="12" y1="28" x2="18" y2="28" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      {showText && (
        <span className={cn("font-bold tracking-tight", textSize)}>
          FABNEST
        </span>
      )}
    </div>
  )
}

