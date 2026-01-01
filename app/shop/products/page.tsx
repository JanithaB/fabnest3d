"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "@/components/product-card"
import { Loader2 } from "lucide-react"

type Product = {
  id: string
  name: string
  description: string
  image: string
  basePrice: number
  category: string
  tags: string[]
}

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex-1 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-balance">3D Print Marketplace</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Explore our collection of ready-to-print models. Choose your material, size, and quantity to get started.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground text-lg">No products available</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
