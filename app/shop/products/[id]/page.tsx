import { PriceCalculator } from "@/components/price-calculator"
import { products } from "@/lib/mock-data"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = products.find((p) => p.id === id)

  if (!product) {
    notFound()
  }

  return (
    <main className="flex-1 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <Card className="overflow-hidden border-2">
              <CardContent className="p-0">
                <div className="aspect-square relative bg-muted">
                  <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
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
