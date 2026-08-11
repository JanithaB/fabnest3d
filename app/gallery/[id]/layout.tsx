import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"

type Props = {
  params: Promise<{ id: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const item = await prisma.galleryItem.findUnique({
      where: { id },
      select: { title: true, description: true },
    })
    if (!item) return { title: "Gallery piece" }
    return {
      title: item.title,
      description: item.description.slice(0, 160),
    }
  } catch {
    return { title: "Gallery piece" }
  }
}

export default function GalleryItemLayout({ children }: Props) {
  return children
}
