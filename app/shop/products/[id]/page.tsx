"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams } from "next/navigation"
import { PriceCalculator } from "@/components/price-calculator"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"

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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([])
  const touchStartX = useRef<number>(0)

  const fetchProduct = useCallback(async () => {
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
  }, [id])

  useEffect(() => {
    if (id) {
      fetchProduct()
    }
  }, [id, fetchProduct])

  if (loading) {
    return (
      <main className="flex-1 py-6 sm:py-8 lg:py-12 px-4 sm:px-6">
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

  const displayImages = product.images && product.images.length > 0
    ? product.images.map((img) => img.url)
    : product.image
      ? [product.image]
      : []
  const hasMultiple = displayImages.length > 1
  const slides = displayImages.length > 0 ? displayImages : [product.image || "/gallery/placeholder.svg"]

  const goTo = (index: number) => {
    if (displayImages.length === 0) return
    const i = (index + displayImages.length) % displayImages.length
    setSelectedImageIndex(i)
    thumbRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.targetTouches?.[0]
    if (t) touchStartX.current = t.clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const t = e.changedTouches?.[0]
    if (!t) return
    const delta = touchStartX.current - t.clientX
    const minSwipe = 50
    if (delta > minSwipe) goTo(selectedImageIndex + 1)
    else if (delta < -minSwipe) goTo(selectedImageIndex - 1)
  }

  return (
    <main className="flex-1 py-6 sm:py-8 lg:py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Product Images - Carousel */}
          <div className="space-y-4 min-w-0">
            <Card className="overflow-hidden border-2 p-0 relative">
              <CardContent className="p-0">
                <div
                  className="aspect-square w-full relative overflow-hidden bg-muted touch-pan-y select-none"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  {/* Sliding strip: duration-700 ease-in-out; swipe on touch */}
                  <div
                    className="flex h-full transition-transform duration-700 ease-in-out"
                    style={{
                      width: `${slides.length * 100}%`,
                      transform: `translateX(-${(selectedImageIndex / slides.length) * 100}%)`,
                    }}
                  >
                    {slides.map((url, index) => (
                      <div
                        key={index}
                        className="relative flex-shrink-0 h-full w-full"
                        style={{ width: `${100 / slides.length}%`, minWidth: `${100 / slides.length}%` }}
                      >
                        <Image
                          src={url}
                          alt={`${product.name} - ${index + 1}`}
                          fill
                          className="object-cover object-center w-full h-full"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 50vw"
                          priority={index === 0}
                        />
                      </div>
                    ))}
                  </div>
                  {hasMultiple && (
                    <>
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 min-h-[44px] min-w-[44px] h-9 w-9 sm:h-10 sm:w-10 rounded-full shadow-md opacity-90 hover:opacity-100 touch-manipulation"
                        onClick={() => goTo(selectedImageIndex - 1)}
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-5 w-5 sm:h-5 sm:w-5" />
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 min-h-[44px] min-w-[44px] h-9 w-9 sm:h-10 sm:w-10 rounded-full shadow-md opacity-90 hover:opacity-100 touch-manipulation"
                        onClick={() => goTo(selectedImageIndex + 1)}
                        aria-label="Next image"
                      >
                        <ChevronRight className="h-5 w-5 sm:h-5 sm:w-5" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            {hasMultiple && (
              <div
                className="flex gap-2 overflow-x-auto overflow-y-hidden scroll-smooth pb-1 overscroll-x-contain touch-pan-y"
                style={{ scrollbarWidth: "thin", WebkitOverflowScrolling: "touch" }}
              >
                {displayImages.map((url, index) => (
                  <button
                    key={index}
                    type="button"
                    ref={(el) => { thumbRefs.current[index] = el }}
                    onClick={() => goTo(index)}
                    className={`relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 min-w-[56px] min-h-[56px] rounded-lg overflow-hidden border-2 transition-all touch-manipulation active:scale-95 ${
                      selectedImageIndex === index
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-transparent hover:border-primary/50"
                    }`}
                  >
                    <Image
                      src={url}
                      alt={`${product.name} - ${index + 1}`}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2 flex-wrap">
              {(product.tags ?? []).map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-balance">{product.name}</h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold">Product Details</h2>
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
