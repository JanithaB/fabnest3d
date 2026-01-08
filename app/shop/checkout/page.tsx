"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/cart"
import { useAuth } from "@/lib/auth"
import { formatCurrency } from "@/lib/currency"
import { useToast } from "@/hooks/use-toast"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getSubtotal, getShipping, getTax, getTotal, clearCart } = useCart()
  const { user, token } = useAuth()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Redirect admins to admin dashboard
    if (user?.role === "admin") {
      router.push("/admin")
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      const subtotal = getSubtotal()
      const shipping = getShipping()
      const tax = getTax()
      const total = getTotal()

      // Get token from auth store to ensure we have the latest value
      const currentToken = useAuth.getState().token
      if (!currentToken) {
        throw new Error('Authentication required. Please log in.')
      }

      // Format items for API
      const orderItems = items.map((item) => {
        // Extract productId from cart item id (format: `${product.id}-${material}-${size}`)
        // CUIDs don't contain dashes, so split by '-' and take all parts except last 2
        const parts = item.id.split('-')
        const productId = parts.length >= 3 ? parts.slice(0, -2).join('-') : null

        return {
          productId: productId || null,
          productName: item.name,
          material: item.material,
          size: item.size,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
          color: null,
          isCustom: false,
        }
      })

      // Create order via API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`,
        },
        body: JSON.stringify({
          items: orderItems,
          subtotal,
          shipping,
          tax,
          total,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order')
      }

      // Success
      clearCart()
      toast({
        title: "Order Placed",
        description: "Your order has been placed successfully!",
      })
      router.push("/account/orders")
    } catch (error: any) {
      console.error('Order placement error:', error)
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Add some items to your cart to checkout</p>
        <Button onClick={() => router.push("/shop/products")}>Browse Marketplace</Button>
      </div>
    )
  }

  const subtotal = getSubtotal()
  const shipping = getShipping()
  const tax = getTax()
  const total = getTotal()

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Checkout</h1>
          <p className="text-lg text-muted-foreground">Review your order and complete your purchase.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" defaultValue={user?.name.split(" ")[0] || ""} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" defaultValue={user?.name.split(" ")[1] || ""} required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      defaultValue={user?.email || ""}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="(555) 123-4567" required />
                  </div>

                  <Separator className="my-6" />

                  <h3 className="text-lg font-semibold">Shipping Address</h3>

                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input id="address" placeholder="123 Main St" required />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" placeholder="New York" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input id="zip" placeholder="10001" required />
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full mt-6" disabled={isProcessing}>
                    {isProcessing ? "Placing Order..." : "Order Now"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="space-y-1">
                    <div className="flex justify-between font-medium">
                      <span>{item.name}</span>
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.material} • {item.size} • Qty: {item.quantity}
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shipping === 0 ? "FREE" : formatCurrency(shipping)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
