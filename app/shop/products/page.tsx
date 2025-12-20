import { ProductCard } from "@/components/product-card"
import { products } from "@/lib/mock-data"

export default function MarketplacePage() {
  return (
    <main className="flex-1 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-balance">3D Print Marketplace</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Explore our collection of ready-to-print models. Choose your material, size, and quantity to get started.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </main>
  )
}
