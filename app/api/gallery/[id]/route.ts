import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-server'
import { validateStringLength } from '@/lib/validation'

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

// GET /api/gallery/[id] - Get single gallery item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const galleryItem = await prisma.galleryItem.findUnique({
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

    if (!galleryItem) {
      return NextResponse.json(
        { error: 'Gallery item not found' },
        { status: 404 }
      )
    }

    // Transform to include primary image URL
    return NextResponse.json({
      ...galleryItem,
      image: galleryItem.images[0]?.file.url || '',
      images: galleryItem.images.map(img => ({
        id: img.id,
        fileId: img.file.id,
        url: img.file.url,
        order: img.order,
      }))
    })
  } catch (error: any) {
    console.error('Get gallery item error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gallery item' },
      { status: 500 }
    )
  }
}

// PUT /api/gallery/[id] - Update gallery item (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = requireAdmin(request)
    const { id } = await params
    const body = await request.json()
    
    const { title, description, customerName, tags, imageFileId } = body

    // Check if gallery item exists
    const existingItem = await prisma.galleryItem.findUnique({
      where: { id }
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Gallery item not found' },
        { status: 404 }
      )
    }

    // Update gallery item with validation
    const updateData: any = {}
    if (title !== undefined) {
      const titleValidation = validateStringLength(title, 'title', 255)
      if (!titleValidation.valid) {
        return NextResponse.json({ error: titleValidation.error }, { status: 400 })
      }
      updateData.title = title.trim()
    }
    if (description !== undefined) {
      const descValidation = validateStringLength(description, 'description', 5000)
      if (!descValidation.valid) {
        return NextResponse.json({ error: descValidation.error }, { status: 400 })
      }
      updateData.description = description.trim()
    }
    if (customerName !== undefined) {
      if (customerName) {
        const customerNameValidation = validateStringLength(customerName, 'customerName', 255)
        if (!customerNameValidation.valid) {
          return NextResponse.json({ error: customerNameValidation.error }, { status: 400 })
        }
        updateData.customerName = customerName.trim()
      } else {
        updateData.customerName = null
      }
    }
    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags) ? tags.slice(0, 20) : []
    }

    const galleryItem = await prisma.galleryItem.update({
      where: { id },
      data: updateData,
    })

    // Handle image update if provided
    if (imageFileId) {
      // Check if this file is already linked
      const existingImage = await prisma.galleryImage.findFirst({
        where: {
          galleryItemId: id,
          fileId: imageFileId,
        }
      })

      if (!existingImage) {
        // Create new gallery image
        await prisma.galleryImage.create({
          data: {
            galleryItemId: id,
            fileId: imageFileId,
            order: 0,
          }
        })
      }
    }

    // Fetch updated gallery item with images
    const itemWithImages = await prisma.galleryItem.findUnique({
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
      item: {
        ...itemWithImages,
        image: itemWithImages?.images[0]?.file.url || '',
      }
    })
  } catch (error: any) {
    return handleApiError(error, 'Failed to update gallery item')
  }
}

// DELETE /api/gallery/[id] - Delete gallery item (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = requireAdmin(request)
    const { id } = await params

    // Check if gallery item exists and get associated files
    const galleryItem = await prisma.galleryItem.findUnique({
      where: { id },
      include: {
        images: {
          include: {
            file: true
          }
        }
      }
    })

    if (!galleryItem) {
      return NextResponse.json(
        { error: 'Gallery item not found' },
        { status: 404 }
      )
    }

    // Collect file IDs and paths to delete
    const fileIds = galleryItem.images.map(img => img.file.id)
    const filePaths = galleryItem.images.map(img => img.file.path)

    // Delete gallery item (cascade will handle GalleryImage records)
    await prisma.galleryItem.delete({
      where: { id }
    })

    // Delete File records that are no longer referenced by any GalleryImage
    // (A file might be used by multiple gallery items, so we check if it's still referenced)
    const filesToDelete: string[] = []
    for (let i = 0; i < fileIds.length; i++) {
      const fileId = fileIds[i]
      const stillReferenced = await prisma.galleryImage.count({
        where: { fileId }
      })
      
      if (stillReferenced === 0) {
        // File is not referenced by any other gallery item, safe to delete
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
      message: 'Gallery item deleted successfully'
    })
  } catch (error: any) {
    return handleApiError(error, 'Failed to delete gallery item')
  }
}

