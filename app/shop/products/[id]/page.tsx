"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { PriceCalculator } from "@/components/price-calculator"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

type Product = {
  id: string
  name: string
  description: string
  image: string
  basePrice: number
  category: string
  tags: string[]
  images?: Array<{
    id: string
    url: string
    isPrimary: boolean
    order: number
  }>
}

export default function ProductPage() {
  const params = useParams()
  const id = params.id as string
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchProduct()
    }
  }, [id])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${id}`)
      if (response.ok) {
        const data = await response.json()
        // API returns product directly, not wrapped in 'product' property
        setProduct(data)
      } else if (response.status === 404) {
        setProduct(null)
      }
    } catch (error) {
      console.error("Failed to fetch product:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="flex-1 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </main>
    )
  }

  if (!product) {
    notFound()
  }

  // API returns images with 'url' directly, not nested in 'file'
  const productImage = product.images?.[0]?.url || product.image || "/gallery/placeholder.svg"

  return (
    <main className="flex-1 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <Card className="overflow-hidden border-2">
              <CardContent className="p-0">
                <div className="aspect-square relative bg-muted">
                  <Image src={productImage} alt={product.name} fill className="object-cover" />
                </div>
              </CardContent>
            </Card>
            <div className="flex gap-2 flex-wrap">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-balance">{product.name}</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Product Details</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Category:</strong> {product.category}
                </p>
                <p>
                  <strong className="text-foreground">Recommended Material:</strong> PLA, ABS
                </p>
                <p>
                  <strong className="text-foreground">Print Time:</strong> Varies by size
                </p>
                <p>
                  <strong className="text-foreground">Layer Height:</strong> 0.2mm standard
                </p>
              </div>
            </div>

            {/* Price Calculator Component */}
            <PriceCalculator product={product} />
          </div>
        </div>
      </div>
    </main>
  )
}
