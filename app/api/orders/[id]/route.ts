import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireAdmin } from '@/lib/auth-server'
import { validateStringLength } from '@/lib/validation'

// GET /api/orders/[id] - Get order details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireAuth(request)
    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                  include: {
                    file: {
                      select: {
                        url: true,
                      }
                    }
                  },
                  take: 1,
                }
              }
            },
            customFile: {
              include: {
                file: {
                  select: {
                    id: true,
                    url: true,
                    filename: true,
                    size: true,
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if user has permission (own order or admin)
    if (order.userId !== user.userId && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Transform to include product images and file download info for admins
    const orderWithImages = {
      ...order,
      items: order.items.map(item => ({
        ...item,
        productImage: item.product?.images[0]?.file.url || null,
        customFileUrl: item.customFile?.file.url || null,
        // Add file download info for admins
        customFile: item.customFile ? {
          ...item.customFile,
          file: {
            ...item.customFile.file,
            downloadUrl: user.role === 'admin' 
              ? `/api/admin/files/${item.customFile.file.id}/download`
              : undefined,
          }
        } : null,
      }))
    }

    return NextResponse.json({
      order: orderWithImages
    })
  } catch (error: any) {
    console.error('Get order error:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

// PUT /api/orders/[id] - Update order (status, tracking, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireAuth(request)
    const { id } = await params
    const body = await request.json()
    
    const { status, trackingNumber, estimatedDelivery } = body

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id }
    })

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Regular users can only update their own orders (limited fields)
    // Admins can update any order
    if (existingOrder.userId !== user.userId && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Regular users can only cancel their own orders
    if (user.role !== 'admin' && status && status !== 'cancelled') {
      return NextResponse.json(
        { error: 'You can only cancel orders' },
        { status: 403 }
      )
    }

    // Build update data
    const updateData: any = {}
    if (status !== undefined) {
      const validStatuses = ['pending', 'processing', 'printing', 'shipped', 'delivered', 'completed', 'cancelled']
      if (validStatuses.includes(status)) {
        updateData.status = status
      }
    }
    if (trackingNumber !== undefined && user.role === 'admin') {
      if (trackingNumber) {
        const trackingValidation = validateStringLength(trackingNumber, 'trackingNumber', 100)
        if (!trackingValidation.valid) {
          return NextResponse.json({ error: trackingValidation.error }, { status: 400 })
        }
        updateData.trackingNumber = trackingNumber.trim()
      } else {
        updateData.trackingNumber = null
      }
    }
    if (estimatedDelivery !== undefined && user.role === 'admin') {
      updateData.estimatedDelivery = estimatedDelivery ? new Date(estimatedDelivery) : null
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            product: true,
            customFile: {
              include: {
                file: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      order
    })
  } catch (error: any) {
    console.error('Update order error:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}

// DELETE /api/orders/[id] - Delete order (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = requireAdmin(request)
    const { id } = await params

    // Check if order exists and get associated custom files
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            customFile: {
              include: {
                file: {
                  select: {
                    id: true,
                    path: true,
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Collect file paths from custom order files
    const filePaths: string[] = []
    for (const item of order.items) {
      if (item.customFile?.file) {
        filePaths.push(item.customFile.file.path)
      }
    }

    // Delete order (cascade will handle OrderItem, CustomOrderFile, and File records)
    await prisma.order.delete({
      where: { id }
    })

    // Delete files from filesystem
    if (filePaths.length > 0) {
      const { deleteFilesFromDisk } = await import('@/lib/file-utils')
      await deleteFilesFromDisk(filePaths)
    }

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully'
    })
  } catch (error: any) {
    console.error('Delete order error:', error)
    
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    )
  }
}

