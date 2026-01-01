"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Calendar, User, ImageIcon } from "lucide-react"

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

  useEffect(() => {
    if (id) {
      fetchGalleryItem()
    }
  }, [id])

  const fetchGalleryItem = async () => {
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
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 py-12 px-4">
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
        <main className="flex-1 py-12 px-4">
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

  return (
    <>
      <Navbar />
      <main className="flex-1 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Images Section */}
            <div className="space-y-4">
              {/* Main Image */}
              <Card className="overflow-hidden border-2">
                <CardContent className="p-0">
                  <div className="aspect-square relative bg-muted">
                    {displayImages.length > 0 ? (
                      <Image
                        src={displayImages[selectedImageIndex] || "/gallery/placeholder.svg"}
                        alt={item.title}
                        fill
                        className="object-cover"
                        priority
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ImageIcon className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Thumbnail Gallery */}
              {displayImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {displayImages.map((imageUrl, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                        selectedImageIndex === index
                          ? "border-primary"
                          : "border-transparent hover:border-primary/50"
                      }`}
                    >
                      <Image
                        src={imageUrl}
                        alt={`${item.title} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold">{item.title}</h1>
                
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
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Description</h2>
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

