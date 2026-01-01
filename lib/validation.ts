/**
 * Validation utilities for API routes
 */

/**
 * Validate and parse a float value
 */
export function validateFloat(value: any, fieldName: string): { valid: boolean; value?: number; error?: string } {
  if (value === undefined || value === null) {
    return { valid: false, error: `${fieldName} is required` }
  }

  const parsed = parseFloat(value)
  if (isNaN(parsed) || !isFinite(parsed)) {
    return { valid: false, error: `${fieldName} must be a valid number` }
  }

  if (parsed < 0) {
    return { valid: false, error: `${fieldName} must be non-negative` }
  }

  return { valid: true, value: parsed }
}

/**
 * Validate and parse an integer value
 */
export function validateInt(value: any, fieldName: string, min: number = 1): { valid: boolean; value?: number; error?: string } {
  if (value === undefined || value === null) {
    return { valid: false, error: `${fieldName} is required` }
  }

  const parsed = parseInt(value, 10)
  if (isNaN(parsed) || !isFinite(parsed)) {
    return { valid: false, error: `${fieldName} must be a valid integer` }
  }

  if (parsed < min) {
    return { valid: false, error: `${fieldName} must be at least ${min}` }
  }

  return { valid: true, value: parsed }
}

/**
 * Validate string length
 */
export function validateStringLength(value: string, fieldName: string, maxLength: number, minLength: number = 1): { valid: boolean; error?: string } {
  if (!value || typeof value !== 'string') {
    return { valid: false, error: `${fieldName} is required` }
  }

  const trimmed = value.trim()
  if (trimmed.length < minLength) {
    return { valid: false, error: `${fieldName} must be at least ${minLength} characters` }
  }

  if (trimmed.length > maxLength) {
    return { valid: false, error: `${fieldName} must be at most ${maxLength} characters` }
  }

  return { valid: true }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' }
  }

  return { valid: true }
}

