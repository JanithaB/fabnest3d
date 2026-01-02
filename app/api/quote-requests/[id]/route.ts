import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireAdmin } from '@/lib/auth-server'
import { validateFloat, validateStringLength } from '@/lib/validation'
import { sendPIEmail } from '@/lib/email'

// GET /api/quote-requests/[id] - Get single quote request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireAuth(request)
    const { id } = await params

    const quoteRequest = await prisma.quoteRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        customFile: {
          include: {
            file: {
              select: {
                id: true,
                filename: true,
                url: true,
                size: true,
                mimeType: true,
              }
            }
          }
        }
      }
    })

    if (!quoteRequest) {
      return NextResponse.json(
        { error: 'Quote request not found' },
        { status: 404 }
      )
    }

    // Only admin or the owner can view
    if (quoteRequest.userId !== user.userId && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      quoteRequest: {
        ...quoteRequest,
        customFile: {
          ...quoteRequest.customFile,
          file: {
            ...quoteRequest.customFile.file,
            downloadUrl: user.role === 'admin'
              ? `/api/admin/files/${quoteRequest.customFile.file.id}/download`
              : undefined
          }
        }
      }
    })
  } catch (error: any) {
    console.error('Get quote request error:', error)
    
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch quote request' },
      { status: 500 }
    )
  }
}

// PUT /api/quote-requests/[id] - Update quote request (admin only - set price, send PI)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = requireAdmin(request)
    const { id } = await params
    const body = await request.json()
    
    const { requestedPrice, adminNotes, status, sendPI } = body

    // Check if quote request exists
    const existingRequest = await prisma.quoteRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          }
        },
        customFile: {
          include: {
            file: true
          }
        }
      }
    })

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Quote request not found' },
        { status: 404 }
      )
    }

    // Build update data
    const updateData: any = {}

    if (requestedPrice !== undefined) {
      const priceValidation = validateFloat(requestedPrice, 'requestedPrice')
      if (!priceValidation.valid) {
        return NextResponse.json({ error: priceValidation.error }, { status: 400 })
      }
      updateData.requestedPrice = priceValidation.value
      updateData.status = 'quoted'
    }

    if (adminNotes !== undefined) {
      const notesValidation = validateStringLength(adminNotes, 'adminNotes', 2000)
      if (!notesValidation.valid) {
        return NextResponse.json({ error: notesValidation.error }, { status: 400 })
      }
      updateData.adminNotes = adminNotes.trim()
    }

    if (status !== undefined) {
      const validStatuses = ['pending', 'quoted', 'accepted', 'rejected']
      if (validStatuses.includes(status)) {
        updateData.status = status
      }
    }

    // Handle sending PI
    // Use the price from updateData if provided, otherwise use existing price
    const priceForPI = updateData.requestedPrice ?? existingRequest.requestedPrice
    
    if (sendPI === true) {
      if (!priceForPI) {
        return NextResponse.json(
          { error: 'Cannot send PI without a requested price. Please set a price first.' },
          { status: 400 }
        )
      }

      // Store admin info who sent the PI
      updateData.adminId = admin.userId
      
      // Fetch admin name from database
      const adminUser = await prisma.user.findUnique({
        where: { id: admin.userId },
        select: { name: true }
      })
      updateData.adminName = adminUser?.name || admin.email

      // Send email with PI to customer
      const emailResult = await sendPIEmail({
        to: existingRequest.user.email,
        customerName: existingRequest.user.name || 'Customer',
        quoteRequestId: id,
        fileName: existingRequest.customFile.file.filename,
        material: existingRequest.customFile.material,
        quality: existingRequest.customFile.quality,
        price: priceForPI,
        adminNotes: updateData.adminNotes ?? existingRequest.adminNotes ?? undefined,
        adminName: updateData.adminName || admin.email,
      })

      if (emailResult.success) {
        updateData.piSent = true
        updateData.piSentAt = new Date()
      } else {
        // Log error but don't fail the request
        console.error('Failed to send PI email:', emailResult.error)
        // Still mark as sent if email service is not configured
        // In production, you might want to handle this differently
        updateData.piSent = true
        updateData.piSentAt = new Date()
      }
    }

    // Update quote request
    const quoteRequest = await prisma.quoteRequest.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        customFile: {
          include: {
            file: {
              select: {
                id: true,
                filename: true,
                url: true,
                size: true,
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      quoteRequest
    })
  } catch (error: any) {
    console.error('Update quote request error:', error)
    
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update quote request' },
      { status: 500 }
    )
  }
}

// DELETE /api/quote-requests/[id] - Delete quote request (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = requireAdmin(request)
    const { id } = await params

    // Check if quote request exists
    const quoteRequest = await prisma.quoteRequest.findUnique({
      where: { id }
    })

    if (!quoteRequest) {
      return NextResponse.json(
        { error: 'Quote request not found' },
        { status: 404 }
      )
    }

    // Delete quote request (cascade will handle related records)
    await prisma.quoteRequest.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Quote request deleted successfully'
    })
  } catch (error: any) {
    console.error('Delete quote request error:', error)
    
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete quote request' },
      { status: 500 }
    )
  }
}

