import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/types"
import { formatCurrency } from "@/lib/currency"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="group overflow-hidden border-2 hover:border-primary transition-colors w-full p-0 flex flex-col">
      <Link href={`/shop/products/${product.id}`} className="block w-full flex flex-col">
        <CardContent className="p-0">
          <div className="relative w-full aspect-square overflow-hidden">
            <Image
              src={product.image || "/gallery/placeholder.svg"}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start p-4 space-y-2">
          <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between w-full pt-2">
            <p className="text-sm text-muted-foreground">Starting from</p>
            <p className="font-bold text-lg">{formatCurrency(product.basePrice)}</p>
          </div>
          <Button className="w-full" size="sm">
            View Details
          </Button>
        </CardFooter>
      </Link>
    </Card>
  )
}
