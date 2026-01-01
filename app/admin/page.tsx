"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ShoppingBag, Package, Users, Loader2, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth"
import type { OrderStatus } from "@/lib/orders"
import Link from "next/link"
import { formatCurrency } from "@/lib/currency"

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  processing: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  printing: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  shipped: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  delivered: "bg-green-500/10 text-green-700 dark:text-green-400",
  completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  cancelled: "bg-red-500/10 text-red-700 dark:text-red-400",
}

export default function AdminDashboard() {
  const { token } = useAuth()
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeOrders: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalQuoteRequests: 0,
    pendingQuotes: 0,
    quotedQuotes: 0,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [recentQuoteRequests, setRecentQuoteRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [token])

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, usersRes, quoteRequestsRes] = await Promise.all([
        fetch('/api/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/quote-requests', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        const orders = ordersData.orders || []
        
        const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0)
        const activeOrders = orders.filter((o: any) => !["delivered", "cancelled"].includes(o.status)).length
        
        setStats(prev => ({
          ...prev,
          totalRevenue,
          activeOrders,
          totalOrders: orders.length,
        }))
        setRecentOrders(orders.slice(0, 5))
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        const users = usersData.users || []
        setStats(prev => ({
          ...prev,
          totalUsers: users.filter((u: any) => u.role === "user").length
        }))
      }

      if (quoteRequestsRes.ok) {
        const quoteRequestsData = await quoteRequestsRes.json()
        const quoteRequests = quoteRequestsData.quoteRequests || []
        
        const pendingQuotes = quoteRequests.filter((q: any) => q.status === "pending").length
        const quotedQuotes = quoteRequests.filter((q: any) => q.status === "quoted").length
        
        setStats(prev => ({
          ...prev,
          totalQuoteRequests: quoteRequests.length,
          pendingQuotes,
          quotedQuotes,
        }))
        setRecentQuoteRequests(quoteRequests.slice(0, 5))
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">Monitor your 3D printing business performance</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">+12.5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered customers</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Quote Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuoteRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">Total requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Quotes</CardTitle>
            <FileText className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingQuotes}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Quoted</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.quotedQuotes}</div>
            <p className="text-xs text-muted-foreground mt-1">Price sent</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Link href="/admin/orders" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No orders yet</p>
              ) : (
                recentOrders.map((order) => {
                  const firstItem = order.items?.[0]
                  const productName = firstItem?.productName || "Custom Order"
                  return (
                    <Link key={order.id} href={`/admin/orders/${order.id}`}>
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <p className="font-semibold">{productName}</p>
                            <Badge className={statusColors[order.status as OrderStatus] || statusColors.pending} variant="secondary">
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(order.total || 0)}</p>
                          <p className="text-sm text-muted-foreground">{new Date(order.orderDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Quote Requests</CardTitle>
            <Link href="/admin/quote-requests" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentQuoteRequests.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No quote requests yet</p>
              ) : (
                recentQuoteRequests.map((quote) => {
                  const fileName = quote.customFile?.file?.filename || "Unknown file"
                  const quoteStatusColors: Record<string, string> = {
                    pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
                    quoted: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
                    accepted: "bg-green-500/10 text-green-700 dark:text-green-400",
                    rejected: "bg-red-500/10 text-red-700 dark:text-red-400",
                  }
                  return (
                    <Link key={quote.id} href={`/admin/quote-requests/${quote.id}`}>
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <p className="font-semibold truncate">{fileName}</p>
                            <Badge className={quoteStatusColors[quote.status] || quoteStatusColors.pending} variant="secondary">
                              {quote.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">Request #{quote.id.slice(0, 8)}</p>
                        </div>
                        <div className="text-right">
                          {quote.requestedPrice ? (
                            <p className="font-semibold">{formatCurrency(quote.requestedPrice)}</p>
                          ) : (
                            <p className="font-semibold text-muted-foreground">-</p>
                          )}
                          <p className="text-sm text-muted-foreground">{new Date(quote.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
