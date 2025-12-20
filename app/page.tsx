import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Cable as Cube, Zap, Layers, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <>
      <Navbar />
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 bg-gradient-to-br from-background via-background to-accent/5 overflow-hidden">
        {/* Animated gradient orb */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse opacity-50" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse opacity-50" style={{ animationDelay: '1s' }} />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance relative">
              <span className="relative z-10">Precision 3D Printing</span>
              <span className="block text-primary relative z-10">
                Made Simple
                <span className="absolute -inset-1 bg-primary/20 blur-xl opacity-50 animate-pulse" />
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Transform your ideas into reality with professional-grade 3D printing. Fast turnaround, multiple
              materials, and custom orders.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" className="text-base">
                <Link href="/shop/products">
                  Browse Prints
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base bg-transparent">
                <Link href="/shop/upload">Upload Your Design</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-balance">Why Choose Our Service</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="pt-6 space-y-4 relative z-10">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300 group-hover:scale-110 transform">
                  <Zap className="h-6 w-6 text-primary group-hover:animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold">Fast Printing</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Quick turnaround times without compromising on quality. Most orders completed within 24-48 hours.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="pt-6 space-y-4 relative z-10">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300 group-hover:scale-110 transform">
                  <Layers className="h-6 w-6 text-primary group-hover:animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold">Multiple Materials</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Choose from PLA, ABS, PETG, TPU, and more. Each material optimized for different applications.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="pt-6 space-y-4 relative z-10">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300 group-hover:scale-110 transform">
                  <Cube className="h-6 w-6 text-primary group-hover:animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold">Custom Orders</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Upload your own designs or choose from our curated gallery. Professional support for complex projects.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-balance">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground">
            Browse our gallery of pre-designed models or upload your own custom design today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg">
              <Link href="/shop/products">View Gallery</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/shop/upload">Upload Design</Link>
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
