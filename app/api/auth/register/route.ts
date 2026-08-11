import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth-server'
import { validateEmail, validateStringLength, validateWhatsAppNumber } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, whatsappNumber } = await request.json()

    // Validate input
    if (!email || !password || !name || !whatsappNumber) {
      return NextResponse.json(
        { error: 'Email, password, name, and WhatsApp number are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      )
    }

    // Validate password strength
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

    // Validate name length
    const nameValidation = validateStringLength(name, 'name', 255)
    if (!nameValidation.valid) {
      return NextResponse.json({ error: nameValidation.error }, { status: 400 })
    }

    // Validate WhatsApp number
    const whatsappValidation = validateWhatsAppNumber(whatsappNumber)
    if (!whatsappValidation.valid) {
      return NextResponse.json(
        { error: whatsappValidation.error },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name: name.trim(),
        whatsappNumber: whatsappValidation.value,
        role: 'user', // Default role
      }
    })

    // Generate JWT token
    const token = generateToken(user.id, user.email, user.role)

    // Return user data (without password) and token
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        whatsappNumber: user.whatsappNumber,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      }
    }, { status: 201 })
  } catch (error: any) {
    console.error('Registration error:', error)
    
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
