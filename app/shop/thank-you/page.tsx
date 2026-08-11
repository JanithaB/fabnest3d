"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

function ThankYouContent() {
  const searchParams = useSearchParams()
  const type = searchParams.get("type") === "quote" ? "quote" : "order"
  const id = searchParams.get("id")

  const title = type === "quote" ? "Quote request received" : "Thank you for your order"
  const description =
    type === "quote"
      ? "We received your design. Our team will review it and respond within 1 business day with a Proforma Invoice."
      : "Your order has been placed successfully. You can track progress from your account."

  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center space-y-6">
        <CheckCircle2 className="h-14 w-14 text-primary mx-auto" aria-hidden />
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance">{title}</h1>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
          {id && (
            <p className="text-sm text-muted-foreground">
              Reference: <span className="font-medium text-foreground">{id}</span>
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button asChild>
            <Link href="/account/orders">View my orders</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/shop/products">Continue shopping</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[70vh] flex items-center justify-center px-4">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      }
    >
      <ThankYouContent />
    </Suspense>
  )
}
