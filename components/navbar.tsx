"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Menu, Image, Upload, ShoppingBag } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { UserMenu } from "@/components/user-menu"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { Separator } from "@/components/ui/separator"
import { Logo } from "@/components/logo"
import { useState } from "react"

export function Navbar() {
  const { isAuthenticated, user } = useAuth()
  const [open, setOpen] = useState(false)
  const isAdmin = user?.role === "admin"

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Logo size="md" showText={false} />
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {!isAdmin && (
            <>
              <Link
                href="/gallery"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Gallery
              </Link>
              <Link
                href="/shop/products"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Marketplace
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
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!isAdmin && (
            <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
              <Link href="/shop/cart">
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Shopping cart</span>
              </Link>
            </Button>
          )}

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
            <SheetContent side="right" className="w-[280px] sm:w-[320px] p-0">
              <SheetHeader className="px-6 pt-6 pb-4 border-b">
                <div className="flex items-center justify-between">
                  <SheetTitle>
                    <Logo size="md" showText={false} />
                  </SheetTitle>
                </div>
              </SheetHeader>
              
              <nav className="flex flex-col py-4">
                <div className="px-4 space-y-1">
                  {!isAdmin && (
                    <>
                      <Link
                        href="/gallery"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        onClick={() => setOpen(false)}
                      >
                        <Image className="h-5 w-5" />
                        Gallery
                      </Link>
                      <Link
                        href="/shop/products"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        onClick={() => setOpen(false)}
                      >
                        <ShoppingBag className="h-5 w-5" />
                        Marketplace
                      </Link>
                      <Link
                        href="/shop/upload"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        onClick={() => setOpen(false)}
                      >
                        <Upload className="h-5 w-5" />
                        Upload
                      </Link>
                      <Link
                        href="/shop/cart"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        onClick={() => setOpen(false)}
                      >
                        <ShoppingCart className="h-5 w-5" />
                        Cart
                      </Link>
                    </>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="px-4 space-y-2">
                  {isAuthenticated ? (
                    <>
                      <Button asChild variant="outline" className="w-full justify-start" onClick={() => setOpen(false)}>
                        <Link href="/account">My Account</Link>
                      </Button>
                      {!isAdmin && (
                        <Button asChild variant="outline" className="w-full justify-start" onClick={() => setOpen(false)}>
                          <Link href="/account/orders">My Orders</Link>
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <Button asChild variant="outline" className="w-full" onClick={() => setOpen(false)}>
                        <Link href="/auth/login">Sign In</Link>
                      </Button>
                      <Button asChild className="w-full" onClick={() => setOpen(false)}>
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
