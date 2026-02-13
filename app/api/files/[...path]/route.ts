import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// MIME types for supported file extensions
const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  stl: 'application/sla',
  obj: 'text/plain',
  '3mf': 'application/vnd.ms-package.3dmanufacturing-3dmodel+xml',
  zip: 'application/zip',
  rar: 'application/vnd.rar',
}

// Allowed root directories within public/ that can be served
const ALLOWED_ROOTS = ['products', 'gallery', 'uploads']

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await params

    if (!segments || segments.length === 0) {
      return new NextResponse('Not found', { status: 404 })
    }

    // Security: only allow serving from known subdirectories
    const root = segments[0]
    if (!ALLOWED_ROOTS.includes(root)) {
      return new NextResponse('Not found', { status: 404 })
    }

    // Security: reject path traversal attempts
    for (const segment of segments) {
      if (segment === '..' || segment === '.' || segment.includes('\\') || segment.includes('/')) {
        return new NextResponse('Not found', { status: 404 })
      }
    }

    const filePath = join(process.cwd(), 'public', ...segments)

    // Security: double-check resolved path stays within public/
    const publicDir = join(process.cwd(), 'public')
    if (!filePath.startsWith(publicDir)) {
      return new NextResponse('Not found', { status: 404 })
    }

    if (!existsSync(filePath)) {
      return new NextResponse('Not found', { status: 404 })
    }

    const fileBuffer = await readFile(filePath)
    const ext = segments[segments.length - 1].split('.').pop()?.toLowerCase() || ''
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        // Immutable cache: filenames contain timestamp + random string, so they never change
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': String(fileBuffer.length),
      },
    })
  } catch (error) {
    console.error('File serving error:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
