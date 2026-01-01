import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request)
    const body = await request.json()
    
    const { fileId, material, quality, notes } = body

    if (!fileId || !material || !quality) {
      return NextResponse.json(
        { error: 'Missing required fields: fileId, material, and quality are required' },
        { status: 400 }
      )
    }

    // Verify the file exists and belongs to the user
    const file = await prisma.file.findUnique({
      where: { id: fileId }
    })

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    if (file.fileType !== 'model') {
      return NextResponse.json(
        { error: 'File must be a 3D model' },
        { status: 400 }
      )
    }

    // Verify file belongs to user (optional check - you might want to allow admins to create orders for any file)
    if (file.uploadedBy && file.uploadedBy !== user.userId && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized to use this file' },
        { status: 403 }
      )
    }

    // Create custom order file record
    const customFile = await prisma.customOrderFile.create({
      data: {
        userId: user.userId,
        fileId: fileId,
        material: material,
        quality: quality,
        notes: notes || null,
        status: 'pending',
      },
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
    })

    return NextResponse.json({
      success: true,
      customFile: customFile,
    })
  } catch (error: any) {
    console.error('Custom order upload error:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to create custom order' },
      { status: 500 }
    )
  }
}

