import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET

// Validate JWT_SECRET is set, especially in production
if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable must be set in production')
  }
  console.warn('⚠️  WARNING: JWT_SECRET not set. Using default (INSECURE - only for development)')
}

const DEFAULT_SECRET = 'your-secret-key-change-in-production'
const SECRET = JWT_SECRET || DEFAULT_SECRET

if (process.env.NODE_ENV === 'production' && SECRET === DEFAULT_SECRET) {
  throw new Error('JWT_SECRET must be changed from default value in production')
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(userId: string, email: string, role: string): string {
  return jwt.sign(
    { userId, email, role },
    SECRET,
    { expiresIn: '7d' }
  )
}

/**
 * Get authenticated user from request
 * Returns null if not authenticated
 */
export function getAuthUser(request: NextRequest): { userId: string; email: string; role: string } | null {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.replace('Bearer ', '')
  
  try {
    const decoded = jwt.verify(token, SECRET) as { userId: string; email: string; role: string }
    return decoded
  } catch {
    return null
  }
}

/**
 * Require authentication - throws error if not authenticated
 */
export function requireAuth(request: NextRequest): { userId: string; email: string; role: string } {
  const user = getAuthUser(request)
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  return user
}

/**
 * Require admin role - throws error if not admin
 */
export function requireAdmin(request: NextRequest): { userId: string; email: string; role: string } {
  const user = requireAuth(request)
  
  if (user.role !== 'admin') {
    throw new Error('Forbidden')
  }
  
  return user
}

