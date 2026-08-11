/**
 * Build WhatsApp click-to-chat URLs from NEXT_PUBLIC_WHATSAPP_NUMBER
 */

export function getWhatsAppNumber(): string | null {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim()
  if (!raw) return null
  const digits = raw.replace(/\D/g, '')
  return digits.length >= 8 ? digits : null
}

export function getWhatsAppUrl(prefillText?: string): string | null {
  const number = getWhatsAppNumber()
  if (!number) return null

  const base = `https://wa.me/${number}`
  if (!prefillText?.trim()) return base

  return `${base}?text=${encodeURIComponent(prefillText.trim())}`
}
