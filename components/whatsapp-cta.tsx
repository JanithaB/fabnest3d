"use client"

import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getWhatsAppUrl } from "@/lib/whatsapp"
import { cn } from "@/lib/utils"

type WhatsAppCtaProps = {
  prefillText?: string
  label?: string
  variant?: "default" | "outline" | "ghost" | "secondary" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  asLink?: boolean
}

export function WhatsAppCta({
  prefillText,
  label = "Chat on WhatsApp",
  variant = "outline",
  size = "sm",
  className,
  asLink = false,
}: WhatsAppCtaProps) {
  const href = getWhatsAppUrl(prefillText)
  if (!href) return null

  if (asLink) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5",
          className
        )}
      >
        <MessageCircle className="h-3.5 w-3.5" />
        {label}
      </a>
    )
  }

  return (
    <Button variant={variant} size={size} className={className} asChild>
      <a href={href} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="mr-2 h-4 w-4" />
        {label}
      </a>
    </Button>
  )
}
