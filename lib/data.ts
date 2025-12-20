export type Product = {
  id: string
  name: string
  description: string
  category: string
  basePrice: number
  image: string
  printTime: string
  tags: string[]
}

// Re-export products from mock-data for backward compatibility
export { products } from "./mock-data"
