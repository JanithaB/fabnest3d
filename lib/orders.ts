export type OrderStatus = "pending" | "processing" | "printing" | "shipped" | "delivered" | "completed" | "cancelled"

export type Order = {
  id: string
  userId: string
  productName: string
  productImage: string
  material: string
  color: string
  quantity: number
  price: number
  status: OrderStatus
  orderDate: string
  estimatedDelivery: string
  trackingNumber?: string
}
