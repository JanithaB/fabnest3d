import dynamic from "next/dynamic"
import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { FaqSection } from "@/components/faq-section"

const FeaturesSection = dynamic(
  () => import("@/components/features-section").then((m) => m.FeaturesSection),
  { ssr: true },
)
const CtaSection = dynamic(
  () => import("@/components/cta-section").then((m) => m.CtaSection),
  { ssr: true },
)

export const metadata: Metadata = {
  title: "Professional 3D Printing Service",
  description:
    "Transform your ideas into reality with professional-grade 3D printing. Fast turnaround, multiple materials, and custom orders.",
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <FaqSection />
      <CtaSection />
      <Footer />
    </>
  )
}
