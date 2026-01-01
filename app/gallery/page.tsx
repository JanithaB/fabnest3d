"use client"

import { useState, useEffect } from "react"
import { GalleryCard } from "@/components/gallery-card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"

const ITEMS_PER_PAGE = 12

type GalleryItem = {
  id: string
  title: string
  description: string
  image: string
  customerName?: string
  tags: string[]
  createdAt: string
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    fetchGalleryItems()
  }, [currentPage])

  const fetchGalleryItems = async () => {
    setLoading(true)
    try {
      const offset = (currentPage - 1) * ITEMS_PER_PAGE
      const response = await fetch(`/api/gallery?limit=${ITEMS_PER_PAGE}&offset=${offset}`)
      
      if (response.ok) {
        const data = await response.json()
        setItems(data.items || [])
        setTotal(data.total || 0)
        setTotalPages(Math.ceil((data.total || 0) / ITEMS_PER_PAGE))
      }
    } catch (error) {
      console.error('Failed to fetch gallery items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePageClick = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-balance">Our Work Gallery</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Explore our portfolio of completed 3D printing projects. See the quality and precision we deliver to our customers.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-muted-foreground text-lg">No gallery items found</p>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {items.map((item) => (
                  <GalleryCard 
                    key={item.id} 
                    item={{
                      ...item,
                      createdAt: new Date(item.createdAt)
                    }} 
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col items-center gap-4 mt-12">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1 || loading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Show first page, last page, current page, and pages around current
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageClick(page)}
                              disabled={loading}
                              className="min-w-[40px]"
                            >
                              {page}
                            </Button>
                          )
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return (
                            <span key={page} className="px-2 text-muted-foreground">
                              ...
                            </span>
                          )
                        }
                        return null
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages || loading}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, total)} of {total} items
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

