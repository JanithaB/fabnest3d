import type { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fabnest3d.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/gallery",
    "/shop/products",
    "/shop/upload",
    "/shop/cart",
    "/auth/login",
    "/auth/register",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }))

  let productRoutes: MetadataRoute.Sitemap = []
  let galleryRoutes: MetadataRoute.Sitemap = []

  try {
    const [products, galleryItems] = await Promise.all([
      prisma.product.findMany({
        select: { id: true, updatedAt: true },
      }),
      prisma.galleryItem.findMany({
        select: { id: true, updatedAt: true },
      }),
    ])

    productRoutes = products.map((p) => ({
      url: `${siteUrl}/shop/products/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }))

    galleryRoutes = galleryItems.map((g) => ({
      url: `${siteUrl}/gallery/${g.id}`,
      lastModified: g.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }))
  } catch (error) {
    console.error("Sitemap dynamic routes skipped:", error)
  }

  return [...staticRoutes, ...productRoutes, ...galleryRoutes]
}
