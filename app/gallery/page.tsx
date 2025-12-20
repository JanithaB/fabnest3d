import { GalleryCard } from "@/components/gallery-card"
import { galleryItems } from "@/lib/gallery-data"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function GalleryPage() {
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

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.map((item) => (
              <GalleryCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

