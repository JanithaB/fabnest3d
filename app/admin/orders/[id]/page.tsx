"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth"
import { ArrowLeft, Loader2, Package, User, Calendar, DollarSign, Truck, FileText, Download } from "lucide-react"
import { formatCurrency } from "@/lib/currency"
import type { OrderStatus } from "@/lib/orders"

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  processing: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  printing: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  shipped: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  delivered: "bg-green-500/10 text-green-700 dark:text-green-400",
  completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  cancelled: "bg-red-500/10 text-red-700 dark:text-red-400",
}

type OrderItem = {
  id: string
  productName: string
  material: string
  color?: string
  size: string
  quantity: number
  unitPrice: number
  totalPrice: number
  isCustom: boolean
  customFile?: {
    id: string
    file: {
      id: string
      filename: string
      url: string
    }
  }
  product?: {
    id: string
    name: string
    images?: Array<{
      file: {
        url: string
      }
    }>
  }
}

type Order = {
  id: string
  userId: string
  status: OrderStatus
  subtotal: number
  shipping: number
  tax: number
  total: number
  orderDate: string
  estimatedDelivery?: string
  trackingNumber?: string
  items: OrderItem[]
  user?: {
    id: string
    name: string
    email: string
  }
}

export default function AdminOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { token } = useAuth()
  const id = params.id as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id && token) {
      fetchOrder()
    }
  }, [id, token])

  const fetchOrder = async () => {
    try {
      const currentToken = useAuth.getState().token
      if (!currentToken) return

      const response = await fetch(`/api/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setOrder(data.order)
      } else if (response.status === 404) {
        router.push("/admin/orders")
      }
    } catch (error) {
      console.error("Failed to fetch order:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadFile = async (fileId: string, filename: string) => {
    try {
      const currentToken = useAuth.getState().token
      if (!currentToken) {
        alert('Authentication required')
        return
      }

      const response = await fetch(`/api/admin/files/${fileId}/download`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to download file')
      }
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download file')
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-8">
        <div className="text-center py-24">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <Button asChild>
            <Link href="/admin/orders">Back to Orders</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Order Details</h1>
          <Badge className={statusColors[order.status] || statusColors.pending} variant="secondary">
            {order.status}
          </Badge>
        </div>
        <p className="text-muted-foreground">Order #{order.id}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {item.isCustom && item.customFile ? (
                        <div className="flex items-center justify-center h-full">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                      ) : item.product?.images?.[0]?.file?.url ? (
                        <Image
                          src={item.product.images[0].file.url}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1">{item.productName}</h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Material: {item.material}</p>
                        {item.color && <p>Color: {item.color}</p>}
                        <p>Size: {item.size}</p>
                        <p>Quantity: {item.quantity}</p>
                        {item.isCustom && item.customFile && (
                          <div className="mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadFile(
                                item.customFile!.file.id,
                                item.customFile!.file.filename
                              )}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download File
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(item.totalPrice)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.unitPrice)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">{formatCurrency(order.shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium">{formatCurrency(order.tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Total</span>
                <span className="font-bold">{formatCurrency(order.total)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {order.user ? (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{order.user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{order.user.email}</p>
                  </div>
                </>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-medium">{order.userId}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Order Date</p>
                <p className="font-medium">
                  {new Date(order.orderDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {order.estimatedDelivery && (
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                  <p className="font-medium">
                    {new Date(order.estimatedDelivery).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
              {order.trackingNumber && (
                <div>
                  <p className="text-sm text-muted-foreground">Tracking Number</p>
                  <p className="font-medium">{order.trackingNumber}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

