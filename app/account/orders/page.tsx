"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth"
import { getOrdersByUserId, type Order, type OrderStatus } from "@/lib/orders"
import { ArrowLeft, Package } from "lucide-react"

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  processing: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  printing: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  shipped: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  delivered: "bg-green-500/10 text-green-700 dark:text-green-400",
  cancelled: "bg-red-500/10 text-red-700 dark:text-red-400",
}

function OrderCard({ order }: { order: Order }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            <Image
              src={order.productImage || "/placeholder.svg"}
              alt={order.productName}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h3 className="font-semibold text-lg mb-1">{order.productName}</h3>
                <p className="text-sm text-muted-foreground">Order #{order.id}</p>
              </div>
              <Badge className={statusColors[order.status]} variant="secondary">
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
              <div>
                <span className="text-muted-foreground">Material: </span>
                <span className="font-medium">{order.material}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Color: </span>
                <span className="font-medium">{order.color}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Quantity: </span>
                <span className="font-medium">{order.quantity}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Price: </span>
                <span className="font-medium">${order.price.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Order Date: </span>
                <span className="font-medium">{new Date(order.orderDate).toLocaleDateString()}</span>
              </div>
              <span className="hidden sm:inline text-muted-foreground">•</span>
              <div>
                <span className="text-muted-foreground">Est. Delivery: </span>
                <span className="font-medium">{new Date(order.estimatedDelivery).toLocaleDateString()}</span>
              </div>
              {order.trackingNumber && (
                <>
                  <span className="hidden sm:inline text-muted-foreground">•</span>
                  <div>
                    <span className="text-muted-foreground">Tracking: </span>
                    <span className="font-medium">{order.trackingNumber}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function OrdersPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login")
    } else if (user) {
      setOrders(getOrdersByUserId(user.id))
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || !user) {
    return null
  }

  const activeOrders = orders.filter((o) => !["delivered", "cancelled"].includes(o.status))
  const completedOrders = orders.filter((o) => o.status === "delivered")
  const cancelledOrders = orders.filter((o) => o.status === "cancelled")

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/account">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Account
            </Link>
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <Package className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">My Orders</h1>
          </div>
          <p className="text-muted-foreground">Track and manage your 3D printing orders</p>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="active">
              Active
              {activeOrders.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeOrders.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeOrders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No active orders</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    You don't have any active orders at the moment
                  </p>
                  <Button asChild>
                    <Link href="/shop/products">Browse Marketplace</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              activeOrders.map((order) => <OrderCard key={order.id} order={order} />)
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedOrders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No completed orders</h3>
                  <p className="text-muted-foreground text-center">You haven't completed any orders yet</p>
                </CardContent>
              </Card>
            ) : (
              completedOrders.map((order) => <OrderCard key={order.id} order={order} />)
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            {cancelledOrders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No cancelled orders</h3>
                  <p className="text-muted-foreground text-center">You don't have any cancelled orders</p>
                </CardContent>
              </Card>
            ) : (
              cancelledOrders.map((order) => <OrderCard key={order.id} order={order} />)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
