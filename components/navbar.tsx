"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Box, ShoppingCart, Menu } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { UserMenu } from "@/components/user-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

export function Navbar() {
  const { isAuthenticated } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Box className="h-6 w-6 text-primary" />
          <span>Fabnest3D</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/shop/products"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Gallery
          </Link>
          <Link
            href="/shop/upload"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Upload
          </Link>
          <Link
            href="/shop/cart"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cart
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
            <Link href="/shop/cart">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Shopping cart</span>
            </Link>
          </Button>

          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <>
                <Button variant="ghost" asChild size="sm">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/auth/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link
                  href="/shop/products"
                  className="text-lg font-medium hover:text-primary transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Gallery
                </Link>
                <Link
                  href="/shop/upload"
                  className="text-lg font-medium hover:text-primary transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Upload
                </Link>
                <Link
                  href="/shop/cart"
                  className="text-lg font-medium hover:text-primary transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Cart
                </Link>

                <div className="border-t pt-4 mt-4 flex flex-col gap-3">
                  {isAuthenticated ? (
                    <>
                      <Button asChild variant="outline" onClick={() => setOpen(false)}>
                        <Link href="/account">My Account</Link>
                      </Button>
                      <Button asChild variant="outline" onClick={() => setOpen(false)}>
                        <Link href="/account/orders">My Orders</Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button asChild variant="outline" onClick={() => setOpen(false)}>
                        <Link href="/auth/login">Sign In</Link>
                      </Button>
                      <Button asChild onClick={() => setOpen(false)}>
                        <Link href="/auth/register">Get Started</Link>
                      </Button>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
