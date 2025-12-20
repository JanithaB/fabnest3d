/**
 * Product interface for 3D printable models
 */
export interface Product {
  id: string
  name: string
  description: string
  image: string
  basePrice: number
  category: string
  tags: string[]
}

/**
 * Material options for 3D printing
 */
export interface Material {
  id: string
  name: string
  description: string
  multiplier: number
}

/**
 * Order item interface
 */
export interface OrderItem {
  productId: string
  productName: string
  material: string
  size: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

/**
 * Order interface
 */
export interface Order {
  id: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  status: "pending" | "processing" | "completed" | "cancelled"
  createdAt: Date
}
