export type OrderStatus = "pending" | "processing" | "printing" | "shipped" | "delivered" | "cancelled"

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

// Mock orders data
export const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-001",
    userId: "2",
    productName: "Geometric Vase",
    productImage: "/geometric-vase.jpg",
    material: "PLA",
    color: "White",
    quantity: 2,
    price: 49.98,
    status: "delivered",
    orderDate: "2024-01-15",
    estimatedDelivery: "2024-01-22",
    trackingNumber: "TRK123456789",
  },
  {
    id: "ORD-002",
    userId: "2",
    productName: "Abstract Sculpture",
    productImage: "/abstract-sculpture.jpg",
    material: "PETG",
    color: "Black",
    quantity: 1,
    price: 89.99,
    status: "printing",
    orderDate: "2024-02-01",
    estimatedDelivery: "2024-02-08",
  },
  {
    id: "ORD-003",
    userId: "2",
    productName: "Custom Phone Stand",
    productImage: "/phone-stand.jpg",
    material: "ABS",
    color: "Blue",
    quantity: 1,
    price: 24.99,
    status: "processing",
    orderDate: "2024-02-10",
    estimatedDelivery: "2024-02-17",
  },
]

export function getOrdersByUserId(userId: string): Order[] {
  return MOCK_ORDERS.filter((order) => order.userId === userId)
}

export function getOrderById(orderId: string): Order | undefined {
  return MOCK_ORDERS.find((order) => order.id === orderId)
}

export function getAllOrders(): Order[] {
  return MOCK_ORDERS
}
