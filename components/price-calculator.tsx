"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Product } from "@/lib/types"
import { useRouter } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/currency"

interface PriceCalculatorProps {
  product: Product
}

// Material pricing multipliers
const MATERIALS = [
  { value: "pla", label: "PLA (Standard)", multiplier: 1.0 },
  { value: "abs", label: "ABS (Durable)", multiplier: 1.2 },
  { value: "petg", label: "PETG (Strong)", multiplier: 1.3 },
  { value: "tpu", label: "TPU (Flexible)", multiplier: 1.5 },
  { value: "resin", label: "Resin (High Detail)", multiplier: 2.0 },
]

// Size pricing multipliers
const SIZES = [
  { value: "small", label: "Small (5cm)", multiplier: 0.7 },
  { value: "medium", label: "Medium (10cm)", multiplier: 1.0 },
  { value: "large", label: "Large (15cm)", multiplier: 1.5 },
  { value: "xlarge", label: "X-Large (20cm)", multiplier: 2.0 },
]

const QUANTITIES = [1, 2, 3, 5, 10, 25, 50]

export function PriceCalculator({ product }: PriceCalculatorProps) {
  const router = useRouter()
  const [material, setMaterial] = useState("pla")
  const [size, setSize] = useState("medium")
  const [quantity, setQuantity] = useState(1)

  // Calculate price based on selections
  const materialMultiplier = MATERIALS.find((m) => m.value === material)?.multiplier || 1
  const sizeMultiplier = SIZES.find((s) => s.value === size)?.multiplier || 1
  const unitPrice = product.basePrice * materialMultiplier * sizeMultiplier
  const totalPrice = unitPrice * quantity

  const handleOrderNow = () => {
    // In a real app, this would add to cart/state
    router.push("/checkout")
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Configure Your Print</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Material Selection */}
        <div className="space-y-2">
          <Label htmlFor="material">Material</Label>
          <Select value={material} onValueChange={setMaterial}>
            <SelectTrigger id="material">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MATERIALS.map((mat) => (
                <SelectItem key={mat.value} value={mat.value}>
                  {mat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Choose the material that best suits your needs</p>
        </div>

        {/* Size Selection */}
        <div className="space-y-2">
          <Label htmlFor="size">Size</Label>
          <Select value={size} onValueChange={setSize}>
            <SelectTrigger id="size">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SIZES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Select your preferred print size</p>
        </div>

        {/* Quantity Selection */}
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Select value={quantity.toString()} onValueChange={(val) => setQuantity(Number(val))}>
            <SelectTrigger id="quantity">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUANTITIES.map((q) => (
                <SelectItem key={q} value={q.toString()}>
                  {q} {q === 1 ? "unit" : "units"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Bulk discounts available for orders over 10 units</p>
        </div>

        <Separator />

        {/* Price Display */}
        <div className="space-y-3 bg-muted/50 rounded-lg p-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Unit Price:</span>
            <span className="font-medium">{formatCurrency(unitPrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Quantity:</span>
            <span className="font-medium">×{quantity}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span className="text-primary">{formatCurrency(totalPrice)}</span>
          </div>
        </div>

        <Button onClick={handleOrderNow} size="lg" className="w-full">
          Order Now
        </Button>

        <p className="text-xs text-center text-muted-foreground">Estimated delivery: 3-5 business days</p>
      </CardContent>
    </Card>
  )
}
