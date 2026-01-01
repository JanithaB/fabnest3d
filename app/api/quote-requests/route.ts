import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireAdmin } from '@/lib/auth-server'

// GET /api/quote-requests - Get quote requests (user's own or all if admin)
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request)
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50'), 1), 100)
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0)

    const where: any = {}
    
    // Regular users can only see their own quote requests
    if (user.role !== 'admin') {
      where.userId = user.userId
    }
    
    if (status) {
      where.status = status
    }

    const [quoteRequests, total] = await Promise.all([
      prisma.quoteRequest.findMany({
        where,
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
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.quoteRequest.count({ where })
    ])

    // Add download URL for admins
    const quoteRequestsWithDownload = quoteRequests.map(qr => ({
      ...qr,
      customFile: {
        ...qr.customFile,
        file: {
          ...qr.customFile.file,
          downloadUrl: user.role === 'admin' 
            ? `/api/admin/files/${qr.customFile.file.id}/download`
            : undefined,
        }
      }
    }))

    return NextResponse.json({
      quoteRequests: quoteRequestsWithDownload,
      total,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error('Get quote requests error:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch quote requests' },
      { status: 500 }
    )
  }
}

// POST /api/quote-requests - Create quote request
export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request)
    const body = await request.json()
    
    const { customFileId } = body

    if (!customFileId) {
      return NextResponse.json(
        { error: 'customFileId is required' },
        { status: 400 }
      )
    }

    // Verify custom file exists and belongs to user
    const customFile = await prisma.customOrderFile.findUnique({
      where: { id: customFileId },
      include: { user: { select: { id: true } } }
    })

    if (!customFile) {
      return NextResponse.json(
        { error: 'Custom file not found' },
        { status: 404 }
      )
    }

    // Verify file belongs to user (unless admin)
    if (customFile.userId !== user.userId && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized to use this file' },
        { status: 403 }
      )
    }

    // Check if quote request already exists
    const existingRequest = await prisma.quoteRequest.findUnique({
      where: { customFileId }
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: 'Quote request already exists for this file' },
        { status: 400 }
      )
    }

    // Create quote request
    const quoteRequest = await prisma.quoteRequest.create({
      data: {
        userId: user.userId,
        customFileId: customFileId,
        status: 'pending',
      },
      include: {
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
    }, { status: 201 })
  } catch (error: any) {
    console.error('Create quote request error:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Quote request already exists for this file' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create quote request' },
      { status: 500 }
    )
  }
}

