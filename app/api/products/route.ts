import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-server'
import { validateFloat, validateStringLength } from '@/lib/validation'
import { normalizeFileUrl } from '@/lib/file-url'

// GET /api/products - List all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '100'), 1), 100) // Between 1 and 100
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0) // Minimum 0

    const where: any = {}
    
    if (category) {
      where.category = category
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ]
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: {
            include: {
              file: {
                select: {
                  id: true,
                  url: true,
                  filename: true,
                }
              }
            },
            orderBy: {
              order: 'asc'
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.product.count({ where })
    ])

    // Transform to include primary image URL for backward compatibility
    const productsWithImages = products.map(product => {
      // Filter out images with missing files
      const validImages = product.images.filter(img => img.file != null)
      
      return {
        ...product,
        image: normalizeFileUrl(validImages.find(img => img.isPrimary)?.file.url || validImages[0]?.file.url || ''),
        images: validImages.map(img => ({
          id: img.id,
          fileId: img.file.id,
          url: normalizeFileUrl(img.file.url),
          isPrimary: img.isPrimary,
          order: img.order,
        }))
      }
    })

    return NextResponse.json({
      products: productsWithImages,
      total,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error('Get products error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST /api/products - Create product (admin only)
export async function POST(request: NextRequest) {
  try {
    const admin = requireAdmin(request)
    const body = await request.json()
    
    const { name, description, basePrice, category, tags, printTime, imageUrl, imageFileId, imageFileIds, primaryImageIndex } = body

    const fileIds = Array.isArray(imageFileIds) && imageFileIds.length > 0
      ? imageFileIds.filter((id: string) => id && typeof id === 'string')
      : imageFileId ? [imageFileId] : []
    const primaryIndex = typeof primaryImageIndex === 'number' && primaryImageIndex >= 0 && primaryImageIndex < fileIds.length
      ? primaryImageIndex
      : 0

    // Validate required fields
    if (!name || !description || basePrice === undefined || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, basePrice, category' },
        { status: 400 }
      )
    }

    // Validate string lengths
    const nameValidation = validateStringLength(name, 'name', 255)
    if (!nameValidation.valid) {
      return NextResponse.json({ error: nameValidation.error }, { status: 400 })
    }

    const descriptionValidation = validateStringLength(description, 'description', 5000)
    if (!descriptionValidation.valid) {
      return NextResponse.json({ error: descriptionValidation.error }, { status: 400 })
    }

    const categoryValidation = validateStringLength(category, 'category', 100)
    if (!categoryValidation.valid) {
      return NextResponse.json({ error: categoryValidation.error }, { status: 400 })
    }

    // Validate basePrice
    const priceValidation = validateFloat(basePrice, 'basePrice')
    if (!priceValidation.valid) {
      return NextResponse.json({ error: priceValidation.error }, { status: 400 })
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        basePrice: priceValidation.value!,
        category: category.trim(),
        tags: Array.isArray(tags) ? tags.slice(0, 20) : [], // Limit tags to 20
        printTime: printTime ? (printTime.length > 50 ? printTime.substring(0, 50) : printTime) : null,
      }
    })

    // Create product image records (multiple images; first or primaryIndex is primary)
    if (fileIds.length > 0) {
      await prisma.productImage.createMany({
        data: fileIds.map((fileId: string, index: number) => ({
          productId: product.id,
          fileId,
          isPrimary: index === primaryIndex,
          order: index,
        }))
      })
    } else if (imageUrl && !imageFileId) {
      return NextResponse.json(
        { error: 'Please upload image file first and provide imageFileId or imageFileIds' },
        { status: 400 }
      )
    }

    // Fetch product with images
    const productWithImages = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        images: {
          include: {
            file: {
              select: {
                id: true,
                url: true,
                filename: true,
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      product: {
        ...productWithImages,
        image: normalizeFileUrl(productWithImages?.images.find(img => img.isPrimary)?.file.url || productWithImages?.images[0]?.file.url || ''),
      }
    }, { status: 201 })
  } catch (error: any) {
    console.error('Create product error:', error)
    
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}

