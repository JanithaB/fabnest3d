"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { getOrdersByUserId } from "@/lib/orders"
import { Package, Settings, User, ShoppingBag } from "lucide-react"

export default function AccountPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || !user) {
    return null
  }

  const orders = getOrdersByUserId(user.id)
  const activeOrders = orders.filter((o) => !["delivered", "cancelled"].includes(o.status))

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Account</h1>
          <p className="text-muted-foreground">Manage your profile, orders, and settings</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Profile</CardTitle>
                  <CardDescription>View your information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member since</p>
                  <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Orders</CardTitle>
                  <CardDescription>Track your prints</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total orders</span>
                  <span className="text-2xl font-bold">{orders.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active orders</span>
                  <span className="text-2xl font-bold">{activeOrders.length}</span>
                </div>
                <Button asChild className="w-full mt-2">
                  <Link href="/account/orders">View All Orders</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Settings</CardTitle>
                  <CardDescription>Manage preferences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-4">Update your account settings and preferences</p>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/account/settings">Go to Settings</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with your next print</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Button asChild variant="outline" size="lg" className="h-auto py-4 bg-transparent">
              <Link href="/shop/products" className="flex flex-col items-start gap-2">
                <ShoppingBag className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">Browse Marketplace</div>
                  <div className="text-sm text-muted-foreground font-normal">Explore our collection of 3D models</div>
                </div>
              </Link>
            </Button>
            <Button asChild size="lg" className="h-auto py-4">
              <Link href="/shop/upload" className="flex flex-col items-start gap-2">
                <Package className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">Upload Custom Design</div>
                  <div className="text-sm font-normal opacity-90">Print your own 3D model</div>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
