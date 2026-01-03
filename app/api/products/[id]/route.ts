import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-server'
import { validateFloat, validateStringLength } from '@/lib/validation'

// Helper function to handle API errors
function handleApiError(error: any, defaultMessage: string): NextResponse {
  console.error(defaultMessage, error)
  
  if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
    return NextResponse.json(
      { error: error.message },
      { status: error.message === 'Unauthorized' ? 401 : 403 }
    )
  }
  
  return NextResponse.json(
    { error: defaultMessage },
    { status: 500 }
  )
}

// GET /api/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
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
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Transform to include primary image URL
    // Filter out images with missing files
    const validImages = product.images.filter(img => img.file != null)
    
    return NextResponse.json({
      ...product,
      image: validImages.find(img => img.isPrimary)?.file.url || validImages[0]?.file.url || '',
      images: validImages.map(img => ({
        id: img.id,
        url: img.file.url,
        isPrimary: img.isPrimary,
        order: img.order,
      }))
    })
  } catch (error: any) {
    console.error('Get product error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] - Update product (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = requireAdmin(request)
    const { id } = await params
    const body = await request.json()
    
    const { name, description, basePrice, category, tags, printTime, imageFileId } = body

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Update product with validation
    const updateData: any = {}
    if (name !== undefined) {
      const nameValidation = validateStringLength(name, 'name', 255)
      if (!nameValidation.valid) {
        return NextResponse.json({ error: nameValidation.error }, { status: 400 })
      }
      updateData.name = name.trim()
    }
    if (description !== undefined) {
      const descValidation = validateStringLength(description, 'description', 5000)
      if (!descValidation.valid) {
        return NextResponse.json({ error: descValidation.error }, { status: 400 })
      }
      updateData.description = description.trim()
    }
    if (basePrice !== undefined) {
      const priceValidation = validateFloat(basePrice, 'basePrice')
      if (!priceValidation.valid) {
        return NextResponse.json({ error: priceValidation.error }, { status: 400 })
      }
      updateData.basePrice = priceValidation.value
    }
    if (category !== undefined) {
      const catValidation = validateStringLength(category, 'category', 100)
      if (!catValidation.valid) {
        return NextResponse.json({ error: catValidation.error }, { status: 400 })
      }
      updateData.category = category.trim()
    }
    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags) ? tags.slice(0, 20) : []
    }
    if (printTime !== undefined) {
      updateData.printTime = printTime ? (printTime.length > 50 ? printTime.substring(0, 50) : printTime) : null
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    })

    // Handle image update if provided
    if (imageFileId) {
      // Remove existing primary images
      await prisma.productImage.updateMany({
        where: {
          productId: id,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        }
      })

      // Check if this file is already linked
      const existingImage = await prisma.productImage.findFirst({
        where: {
          productId: id,
          fileId: imageFileId,
        }
      })

      if (existingImage) {
        // Make it primary
        await prisma.productImage.update({
          where: { id: existingImage.id },
          data: { isPrimary: true },
        })
      } else {
        // Create new product image
        await prisma.productImage.create({
          data: {
            productId: id,
            fileId: imageFileId,
            isPrimary: true,
            order: 0,
          }
        })
      }
    }

    // Fetch updated product with images
    const productWithImages = await prisma.product.findUnique({
      where: { id },
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
        image: productWithImages?.images.find(img => img.isPrimary)?.file.url || productWithImages?.images[0]?.file.url || '',
      }
    })
  } catch (error: any) {
    return handleApiError(error, 'Failed to update product')
  }
}

// DELETE /api/products/[id] - Delete product (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = requireAdmin(request)
    const { id } = await params

    // Check if product exists and get associated files
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          include: {
            file: true
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Collect file IDs and paths to delete
    const fileIds = product.images.map(img => img.file.id)
    const filePaths = product.images.map(img => img.file.path)

    // Delete product (cascade will handle ProductImage records)
    await prisma.product.delete({
      where: { id }
    })

    // Delete File records that are no longer referenced by any ProductImage
    // (A file might be used by multiple products, so we check if it's still referenced)
    const filesToDelete: string[] = []
    for (let i = 0; i < fileIds.length; i++) {
      const fileId = fileIds[i]
      const stillReferenced = await prisma.productImage.count({
        where: { fileId }
      })
      
      if (stillReferenced === 0) {
        // File is not referenced by any other product, safe to delete
        try {
          await prisma.file.delete({
            where: { id: fileId }
          })
          // Only delete physical file if database record was successfully deleted
          filesToDelete.push(filePaths[i])
        } catch (err) {
          console.error(`Failed to delete file record ${fileId}:`, err)
        }
      }
    }

    // Delete files from filesystem (only for files whose records were deleted)
    if (filesToDelete.length > 0) {
      const { deleteFilesFromDisk } = await import('@/lib/file-utils')
      await deleteFilesFromDisk(filesToDelete)
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    })
  } catch (error: any) {
    return handleApiError(error, 'Failed to delete product')
  }
}

