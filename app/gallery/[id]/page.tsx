"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Calendar, User, ImageIcon, ChevronLeft, ChevronRight } from "lucide-react"

type GalleryItem = {
  id: string
  title: string
  description: string
  image: string
  images: Array<{
    id: string
    url: string
    order: number
  }>
  customerName?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export default function GalleryItemPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [item, setItem] = useState<GalleryItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([])
  const touchStartX = useRef<number>(0)

  const fetchGalleryItem = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/gallery/${id}`)
      
      if (response.ok) {
        const data = await response.json()
        setItem(data)
      } else if (response.status === 404) {
        router.push("/gallery")
      }
    } catch (error) {
      console.error("Failed to fetch gallery item:", error)
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    if (id) {
      fetchGalleryItem()
    }
  }, [id, fetchGalleryItem])

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 py-6 sm:py-8 lg:py-12 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!item) {
    return (
      <>
        <Navbar />
        <main className="flex-1 py-6 sm:py-8 lg:py-12 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-24">
              <h1 className="text-2xl font-bold mb-4">Gallery Item Not Found</h1>
              <Button asChild>
                <Link href="/gallery">Back to Gallery</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const displayImages = item.images && item.images.length > 0 
    ? item.images.map(img => img.url)
    : item.image 
      ? [item.image]
      : []
  const hasMultiple = displayImages.length > 1

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
    <>
      <Navbar />
      <main className="flex-1 py-6 sm:py-8 lg:py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-4 sm:mb-6 min-h-[44px] touch-manipulation"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            {/* Images Section - Carousel */}
            <div className="space-y-4 min-w-0">
              {/* Main Image - sliding carousel (duration-700 ease-in-out) */}
              <Card className="overflow-hidden border-2 p-0 relative">
                <CardContent className="p-0">
                  <div
                    className="aspect-square w-full relative overflow-hidden bg-muted touch-pan-y select-none"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                  >
                    {displayImages.length > 0 ? (
                      <>
                        <div
                          className="flex h-full transition-transform duration-700 ease-in-out"
                          style={{
                            width: `${displayImages.length * 100}%`,
                            transform: `translateX(-${(selectedImageIndex / displayImages.length) * 100}%)`,
                          }}
                        >
                          {displayImages.map((imageUrl, index) => (
                            <div
                              key={index}
                              className="relative flex-shrink-0 h-full w-full"
                              style={{ width: `${100 / displayImages.length}%`, minWidth: `${100 / displayImages.length}%` }}
                            >
                              <Image
                                src={imageUrl}
                                alt={`${item.title} - ${index + 1}`}
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
                              <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              size="icon"
                              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 min-h-[44px] min-w-[44px] h-9 w-9 sm:h-10 sm:w-10 rounded-full shadow-md opacity-90 hover:opacity-100 touch-manipulation"
                              onClick={() => goTo(selectedImageIndex + 1)}
                              aria-label="Next image"
                            >
                              <ChevronRight className="h-5 w-5" />
                            </Button>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ImageIcon className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Mini thumbnail bar - horizontal scroll */}
              {hasMultiple && (
                <div
                  className="flex gap-2 overflow-x-auto overflow-y-hidden scroll-smooth pb-1 overscroll-x-contain touch-pan-y"
                  style={{ scrollbarWidth: "thin", WebkitOverflowScrolling: "touch" }}
                >
                  {displayImages.map((imageUrl, index) => (
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
                        src={imageUrl}
                        alt={`${item.title} - Image ${index + 1}`}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-3 sm:space-y-4">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">{item.title}</h1>
                
                <div className="flex flex-col gap-3 text-muted-foreground">
                  {item.customerName && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="text-sm">Customer: {item.customerName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      Created: {new Date(item.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {(item.tags ?? []).map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-semibold">Description</h2>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-4">
                <Button asChild variant="outline">
                  <Link href="/gallery">View All Gallery Items</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

