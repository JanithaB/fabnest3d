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
import { ArrowLeft, Package, FileText, Loader2 } from "lucide-react"
import { formatCurrency } from "@/lib/currency"

type OrderStatus = "pending" | "processing" | "printing" | "shipped" | "delivered" | "completed" | "cancelled"

// Loading card component
const LoadingCard = () => (
  <Card>
    <CardContent className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
      <p className="text-muted-foreground">Loading orders...</p>
    </CardContent>
  </Card>
)

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  processing: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  printing: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  shipped: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  delivered: "bg-green-500/10 text-green-700 dark:text-green-400",
  completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  cancelled: "bg-red-500/10 text-red-700 dark:text-red-400",
}

function OrderCard({ order }: { order: any }) {
  const firstItem = order.items?.[0]
  const productName = firstItem?.productName || "Custom Order"
  const productImage = firstItem?.productImage || "/gallery/placeholder.svg"
  const material = firstItem?.material || "N/A"
  const color = firstItem?.color || "N/A"
  const quantity = firstItem?.quantity || 0
  const totalPrice = order.total || 0

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            <Image
              src={productImage}
              alt={productName}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h3 className="font-semibold text-lg mb-1">{productName}</h3>
                <p className="text-sm text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
              </div>
              <Badge className={statusColors[order.status as keyof typeof statusColors] || statusColors.pending} variant="secondary">
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
              <div>
                <span className="text-muted-foreground">Material: </span>
                <span className="font-medium">{material}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Color: </span>
                <span className="font-medium">{color}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Items: </span>
                <span className="font-medium">{order.items?.length || 0}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total: </span>
                <span className="font-medium">{formatCurrency(totalPrice)}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Order Date: </span>
                <span className="font-medium">{new Date(order.orderDate).toLocaleDateString()}</span>
              </div>
              {order.estimatedDelivery && (
                <>
                  <span className="hidden sm:inline text-muted-foreground">•</span>
                  <div>
                    <span className="text-muted-foreground">Est. Delivery: </span>
                    <span className="font-medium">{new Date(order.estimatedDelivery).toLocaleDateString()}</span>
                  </div>
                </>
              )}
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

type QuoteRequest = {
  id: string
  status: "pending" | "quoted" | "accepted" | "rejected"
  requestedPrice: number | null
  adminNotes: string | null
  adminName: string | null
  piSent: boolean
  piSentAt: string | null
  createdAt: string
  customFile: {
    material: string
    quality: string
    notes: string | null
    file: {
      filename: string
      url: string
      size: number
    }
  }
}

export default function OrdersPage() {
  const router = useRouter()
  const { user, isAuthenticated, token, _hasHydrated } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingQuotes, setLoadingQuotes] = useState(true)
  const [placingOrder, setPlacingOrder] = useState<string | null>(null)

  useEffect(() => {
    // Wait for Zustand to hydrate from localStorage before checking auth
    if (!_hasHydrated) return

    // Redirect admins to admin dashboard
    if (user?.role === "admin") {
      router.push("/admin")
      return
    }
    
    if (!isAuthenticated) {
      router.push("/auth/login")
      return
    }
    
    if (user && token) {
      fetchOrders()
      fetchQuoteRequests()
    }
  }, [_hasHydrated, isAuthenticated, user, token, router])

  const fetchOrders = async () => {
    try {
      // Get current token from store to ensure we have the latest value
      const currentToken = useAuth.getState().token
      if (!currentToken) {
        console.error('No token available for fetching orders')
        return
      }
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchQuoteRequests = async () => {
    try {
      // Get current token from store to ensure we have the latest value
      const currentToken = useAuth.getState().token
      if (!currentToken) {
        console.error('No token available for fetching quote requests')
        return
      }
      const response = await fetch('/api/quote-requests', {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setQuoteRequests(data.quoteRequests || [])
      }
    } catch (error) {
      console.error('Failed to fetch quote requests:', error)
    } finally {
      setLoadingQuotes(false)
    }
  }

  // Show loading while Zustand hydrates from localStorage
  if (!_hasHydrated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (user?.role === "admin" || !isAuthenticated || !user) {
    return null
  }

  const activeOrders = orders.filter((o) => !["delivered", "completed", "cancelled"].includes(o.status))
  const completedOrders = orders.filter((o) => ["delivered", "completed"].includes(o.status))
  const cancelledOrders = orders.filter((o) => o.status === "cancelled")
  
  const pendingQuotes = quoteRequests.filter((q) => q.status === "pending")
  const quotedQuotes = quoteRequests.filter((q) => q.status === "quoted")
  const allQuotes = quoteRequests

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

        <Tabs defaultValue="quotes" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="quotes">
              Quote Requests
              {pendingQuotes.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {pendingQuotes.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="active">
              Active Orders
              {activeOrders.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeOrders.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed
              {completedOrders.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {completedOrders.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled
              {cancelledOrders.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {cancelledOrders.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quotes" className="space-y-4">
            {loadingQuotes ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Loading quote requests...</p>
                </CardContent>
              </Card>
            ) : allQuotes.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No quote requests</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    You haven't submitted any quote requests yet
                  </p>
                  <Button asChild>
                    <Link href="/shop/upload">Upload a File</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              allQuotes.map((quote) => (
                <Card key={quote.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                        <FileText className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">
                              {quote.customFile.file.filename}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Request #{quote.id.slice(0, 8)}
                            </p>
                          </div>
                          <Badge
                            className={
                              quote.status === "pending"
                                ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                                : quote.status === "quoted"
                                ? "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                                : quote.status === "accepted"
                                ? "bg-green-500/10 text-green-700 dark:text-green-400"
                                : "bg-red-500/10 text-red-700 dark:text-red-400"
                            }
                            variant="secondary"
                          >
                            {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
                          <div>
                            <span className="text-muted-foreground">Material: </span>
                            <span className="font-medium capitalize">{quote.customFile.material}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Quality: </span>
                            <span className="font-medium capitalize">{quote.customFile.quality}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">File Size: </span>
                            <span className="font-medium">
                              {(quote.customFile.file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                          {quote.requestedPrice && (
                            <div>
                              <span className="text-muted-foreground">Quoted Price: </span>
                              <span className="font-medium text-primary">
                                {formatCurrency(quote.requestedPrice)}
                              </span>
                            </div>
                          )}
                        </div>
                        {quote.adminNotes && (
                          <div className="mb-4 p-3 rounded-lg bg-muted/50">
                            <p className="text-sm">
                              <span className="font-medium">Admin Notes: </span>
                              <span className="text-muted-foreground">{quote.adminNotes}</span>
                            </p>
                          </div>
                        )}
                        <div className="flex flex-col sm:flex-row gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Requested: </span>
                            <span className="font-medium">
                              {new Date(quote.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {quote.piSent && (
                            <>
                              <span className="hidden sm:inline text-muted-foreground">•</span>
                              <div>
                                <span className="text-muted-foreground">PI Sent: </span>
                                <span className="font-medium text-green-600">
                                  {quote.piSentAt ? new Date(quote.piSentAt).toLocaleDateString() : 'Yes'}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                        {quote.status === "quoted" && quote.requestedPrice && (
                          <div className="mt-4 pt-4 border-t space-y-3">
                            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                              <h4 className="font-semibold mb-2">Proforma Invoice</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Subtotal:</span>
                                  <span className="font-medium">{formatCurrency(quote.requestedPrice)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Shipping:</span>
                                  <span className="font-medium">{formatCurrency(0)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Tax:</span>
                                  <span className="font-medium">{formatCurrency(0)}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-primary/20">
                                  <span className="font-semibold">Total:</span>
                                  <span className="font-bold text-lg text-primary">{formatCurrency(quote.requestedPrice)}</span>
                                </div>
                              </div>
                              {quote.piSent && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  A Proforma Invoice has been sent to your email.
                                </p>
                              )}
                            </div>
                            <Button 
                              onClick={async () => {
                                if (placingOrder) return // Prevent double-click
                                
                                setPlacingOrder(quote.id)
                                try {
                                  const response = await fetch(`/api/quote-requests/${quote.id}/create-order`, {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${token}`
                                    },
                                    body: JSON.stringify({
                                      shipping: 0,
                                      tax: 0
                                    })
                                  })

                                  if (response.ok) {
                                    const data = await response.json()
                                    // Refetch quote requests to show updated status (accepted)
                                    await fetchQuoteRequests()
                                    // Refetch orders to show the new order
                                    await fetchOrders()
                                    alert('Order created successfully!')
                                  } else {
                                    const error = await response.json()
                                    alert(error.error || 'Failed to create order')
                                  }
                                } catch (error) {
                                  console.error('Error creating order:', error)
                                  alert('Failed to create order. Please try again.')
                                } finally {
                                  setPlacingOrder(null)
                                }
                              }}
                              className="w-full"
                              disabled={placingOrder === quote.id}
                            >
                              {placingOrder === quote.id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Placing Order...
                                </>
                              ) : (
                                'Place Order'
                              )}
                            </Button>
                          </div>
                        )}
                        {quote.status === "accepted" && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-sm text-green-600 font-medium">
                              ✓ Order has been placed for this quote request
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {loading ? (
              <LoadingCard />
            ) : activeOrders.length === 0 ? (
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
            {loading ? (
              <LoadingCard />
            ) : completedOrders.length === 0 ? (
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
            {loading ? (
              <LoadingCard />
            ) : cancelledOrders.length === 0 ? (
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
