import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-server'

// Maximum file size: 100MB
const MAX_FILE_SIZE = 100 * 1024 * 1024
// Minimum file size: 1 byte (to prevent empty files)
const MIN_FILE_SIZE = 1

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request)
    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileType = formData.get('fileType') as string // 'image' | 'model'
    const destination = formData.get('destination') as string | null // 'products' | 'gallery' | null (for models)
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!fileType || !['image', 'model'].includes(fileType)) {
      return NextResponse.json(
        { error: 'Invalid fileType. Must be "image" or "model"' },
        { status: 400 }
      )
    }

    // Determine storage directory based on file type and destination
    let storageDir: string
    let urlPrefix: string
    
    if (fileType === 'model') {
      // User-uploaded models always go to /public/uploads/model
      storageDir = join(process.cwd(), 'public', 'uploads', 'model')
      urlPrefix = '/uploads/model'
    } else if (fileType === 'image') {
      // Admin-uploaded images go to specific directories
      if (destination === 'products') {
        storageDir = join(process.cwd(), 'public', 'products')
        urlPrefix = '/products'
      } else if (destination === 'gallery') {
        storageDir = join(process.cwd(), 'public', 'gallery')
        urlPrefix = '/gallery'
      } else {
        // Default to uploads/image if no destination specified (backward compatibility)
        storageDir = join(process.cwd(), 'public', 'uploads', 'image')
        urlPrefix = '/uploads/image'
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid fileType' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size === 0 || file.size < MIN_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File is empty' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 100MB' },
        { status: 400 }
      )
    }

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    const validImageExtensions = ['jpg', 'jpeg', 'png', 'webp']
    const validModelExtensions = ['stl', 'obj', '3mf', 'rar', 'zip'] // Added RAR and ZIP support
    const mimeType = file.type || 'application/octet-stream'
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    
    if (fileType === 'image') {
      // Check both MIME type and file extension (extension as fallback)
      const isValidMimeType = validImageTypes.includes(mimeType)
      const isValidExtension = validImageExtensions.includes(ext)
      
      if (!isValidMimeType && !isValidExtension) {
        return NextResponse.json(
          { error: 'Invalid image type. Use JPEG, PNG, or WebP' },
          { status: 400 }
        )
      }
    }
    
    if (fileType === 'model' && !validModelExtensions.includes(ext)) {
      return NextResponse.json(
        { error: 'Invalid model type. Use STL, OBJ, 3MF, RAR, or ZIP' },
        { status: 400 }
      )
    }

    // Create storage directory if it doesn't exist
    if (!existsSync(storageDir)) {
      await mkdir(storageDir, { recursive: true })
    }

    // Sanitize file extension to prevent path traversal
    const sanitizedExt = ext.replace(/[^a-z0-9]/gi, '').toLowerCase()
    if (!sanitizedExt) {
      return NextResponse.json(
        { error: 'Invalid file extension' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const filename = `${timestamp}-${randomString}.${sanitizedExt}`
    const filepath = join(storageDir, filename)

    // Additional security: Ensure filepath is within the intended storage directory (prevent path traversal)
    const resolvedPath = join(storageDir, filename)
    if (!resolvedPath.startsWith(storageDir)) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      )
    }

    // Save file to disk
    let fileWritten = false
    try {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filepath, buffer)
      fileWritten = true

      // Create public URL (relative to public folder)
      const url = `${urlPrefix}/${filename}`

      // Save file metadata to database
      const fileRecord = await prisma.file.create({
        data: {
          filename: file.name,
          path: filepath,
          url: url,
          mimeType: mimeType,
          fileType: fileType,
          size: file.size,
          uploadedBy: user.userId,
        }
      })

      return NextResponse.json({
        success: true,
        file: {
          id: fileRecord.id,
          url: fileRecord.url,
          filename: fileRecord.filename,
          size: fileRecord.size,
          fileType: fileRecord.fileType,
        }
      })
    } catch (error: any) {
      // Clean up file if database insert failed
      if (fileWritten && existsSync(filepath)) {
        try {
          await unlink(filepath)
        } catch (unlinkError) {
          console.error('Failed to cleanup file:', unlinkError)
        }
      }
      throw error
    }

  } catch (error: any) {
    console.error('Upload error:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    )
  }
}

