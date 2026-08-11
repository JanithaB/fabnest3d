import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"

type Props = {
  params: Promise<{ id: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      select: { name: true, description: true },
    })
    if (!product) return { title: "Product" }
    return {
      title: product.name,
      description: product.description.slice(0, 160),
    }
  } catch {
    return { title: "Product" }
  }
}

export default function ProductDetailLayout({ children }: Props) {
  return children
}
