import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Marketplace",
  description: "Browse ready-to-print 3D products from FABNEST.",
}

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children
}
