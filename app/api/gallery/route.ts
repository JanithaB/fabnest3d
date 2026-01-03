import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-server'
import { validateStringLength } from '@/lib/validation'

// GET /api/gallery - List all gallery items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const tag = searchParams.get('tag')
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50'), 1), 100) // Between 1 and 100
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0) // Minimum 0

    const where: any = {}
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (tag) {
      where.tags = { has: tag }
    }

    const [galleryItems, total] = await Promise.all([
      (prisma.galleryItem.findMany as any)({
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
      prisma.galleryItem.count({ where })
    ])

    // Transform to include primary image URL for backward compatibility
    const itemsWithImages = (galleryItems as any[]).map((item: any) => ({
      ...item,
      image: item.images?.[0]?.file?.url || '',
      images: (item.images || []).map((img: any) => ({
        id: img.id,
        fileId: img.file?.id || '',
        url: img.file?.url || '',
        order: img.order,
      }))
    }))

    return NextResponse.json({
      items: itemsWithImages,
      total,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error('Get gallery error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gallery items' },
      { status: 500 }
    )
  }
}

// POST /api/gallery - Create gallery item (admin only)
export async function POST(request: NextRequest) {
  try {
    const admin = requireAdmin(request)
    const body = await request.json()
    
    const { title, description, customerName, tags, imageFileId } = body

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description' },
        { status: 400 }
      )
    }

    // Validate string lengths
    const titleValidation = validateStringLength(title, 'title', 255)
    if (!titleValidation.valid) {
      return NextResponse.json({ error: titleValidation.error }, { status: 400 })
    }

    const descriptionValidation = validateStringLength(description, 'description', 5000)
    if (!descriptionValidation.valid) {
      return NextResponse.json({ error: descriptionValidation.error }, { status: 400 })
    }

    if (customerName) {
      const customerNameValidation = validateStringLength(customerName, 'customerName', 255)
      if (!customerNameValidation.valid) {
        return NextResponse.json({ error: customerNameValidation.error }, { status: 400 })
      }
    }

    // Create gallery item
    const galleryItem = await (prisma.galleryItem.create as any)({
      data: {
        title: title.trim(),
        description: description.trim(),
        customerName: customerName?.trim() || null,
        tags: Array.isArray(tags) ? tags.slice(0, 20) : [], // Limit tags to 20
      }
    })

    // If image provided, create gallery image record
    if (imageFileId) {
      await (prisma as any).galleryImage.create({
        data: {
          galleryItemId: galleryItem.id,
          fileId: imageFileId,
          order: 0,
        }
      })
    }

    // Fetch gallery item with images
    const itemWithImages = await (prisma.galleryItem.findUnique as any)({
      where: { id: galleryItem.id },
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
      item: {
        ...itemWithImages,
        image: itemWithImages?.images[0]?.file.url || '',
      }
    }, { status: 201 })
  } catch (error: any) {
    console.error('Create gallery item error:', error)
    
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create gallery item' },
      { status: 500 }
    )
  }
}

