import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-server'
import { hashPassword } from '@/lib/auth-server'
import { validateEmail, validateStringLength } from '@/lib/validation'

// PUT /api/admin/users/[id] - Update user (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = requireAdmin(request)
    const { id } = await params
    const body = await request.json()
    
    const { email, password, name, role } = body

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent admin from removing their own admin role
    if (existingUser.id === admin.userId && role === 'user') {
      return NextResponse.json(
        { error: 'Cannot remove your own admin role' },
        { status: 400 }
      )
    }

    // Build update data
    const updateData: any = {}

    if (email !== undefined) {
      const emailValidation = validateEmail(email)
      if (!emailValidation.valid) {
        return NextResponse.json(
          { error: emailValidation.error },
          { status: 400 }
        )
      }

      // Check if email is already taken by another user
      const emailTaken = await prisma.user.findFirst({
        where: {
          email: email.toLowerCase().trim(),
          NOT: { id }
        }
      })

      if (emailTaken) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 400 }
        )
      }

      updateData.email = email.toLowerCase().trim()
    }

    if (name !== undefined) {
      const nameValidation = validateStringLength(name, 'name', 255)
      if (!nameValidation.valid) {
        return NextResponse.json({ error: nameValidation.error }, { status: 400 })
      }
      updateData.name = name.trim()
    }

    if (password !== undefined) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters long' },
          { status: 400 }
        )
      }

      if (password.length > 128) {
        return NextResponse.json(
          { error: 'Password must be at most 128 characters long' },
          { status: 400 }
        )
      }

      updateData.password = await hashPassword(password)
    }

    if (role !== undefined) {
      if (!['user', 'admin'].includes(role)) {
        return NextResponse.json(
          { error: 'Role must be either "user" or "admin"' },
          { status: 400 }
        )
      }
      
      // Prevent removing admin role from the last admin
      if (existingUser.role === 'admin' && role === 'user') {
        const adminCount = await prisma.user.count({
          where: { role: 'admin' }
        })
        
        if (adminCount <= 1) {
          return NextResponse.json(
            { error: 'Cannot remove admin role from the last admin user' },
            { status: 400 }
          )
        }
      }
      
      updateData.role = role
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return NextResponse.json({
      success: true,
      user: user
    })
  } catch (error: any) {
    console.error('Update user error:', error)
    
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      )
    }

    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[id] - Delete user (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = requireAdmin(request)
    const { id } = await params

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent admin from deleting themselves
    if (user.id === admin.userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await prisma.user.count({
        where: { role: 'admin' }
      })

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the last admin user' },
          { status: 400 }
        )
      }
    }

    // Get all custom files uploaded by this user to delete physical files
    const customFiles = await prisma.customOrderFile.findMany({
      where: { userId: id },
      include: {
        file: {
          select: {
            id: true,
            path: true,
          }
        }
      }
    })

    // Collect file paths to delete
    const filePaths = customFiles.map(cf => cf.file.path)

    // Delete user (cascade will handle CustomOrderFile and File records)
    await prisma.user.delete({
      where: { id }
    })

    // Delete files from filesystem
    const { deleteFilesFromDisk } = await import('@/lib/file-utils')
    await deleteFilesFromDisk(filePaths)

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error: any) {
    console.error('Delete user error:', error)
    
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}

