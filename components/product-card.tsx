import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="group overflow-hidden border-2 hover:border-primary transition-colors">
      <Link href={`/shop/products/${product.id}`}>
        <CardContent className="p-0">
          <div className="aspect-square relative overflow-hidden bg-muted">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start p-4 space-y-2">
          <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between w-full pt-2">
            <p className="text-sm text-muted-foreground">Starting from</p>
            <p className="font-bold text-lg">${product.basePrice.toFixed(2)}</p>
          </div>
          <Button className="w-full" size="sm">
            View Details
          </Button>
        </CardFooter>
      </Link>
    </Card>
  )
}
