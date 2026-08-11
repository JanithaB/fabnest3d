import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"

export default function NotFound() {
  return (
    <main className="min-h-[100svh] flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center space-y-8">
        <Link href="/" className="inline-flex justify-center">
          <Logo size="lg" />
        </Link>
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">404</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance">
            Page not found
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            That link doesn&apos;t lead anywhere. Head back to the marketplace or upload a design to get a quote.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/">Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/shop/products">Marketplace</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/shop/upload">Upload design</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
