import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Gallery",
  description: "See customer prints and showcase work from FABNEST.",
}

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return children
}
