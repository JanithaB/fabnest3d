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

/**
 * Validate and normalize a Sri Lankan WhatsApp number.
 * Accepts: +947XXXXXXXX | 07XXXXXXXX | 7XXXXXXXX
 * Stores as digits: 947XXXXXXXX (for wa.me links)
 */
export function validateWhatsAppNumber(
  value: unknown,
  options: { required?: boolean } = { required: true }
): { valid: boolean; value?: string; error?: string } {
  const required = options.required !== false

  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    if (!required) {
      return { valid: true, value: undefined }
    }
    return { valid: false, error: 'WhatsApp number is required' }
  }

  if (typeof value !== 'string') {
    return { valid: false, error: 'WhatsApp number must be a string' }
  }

  const digits = value.trim().replace(/[\s\-()]/g, '').replace(/^\+/, '')

  if (!/^\d+$/.test(digits)) {
    return { valid: false, error: 'Enter a valid WhatsApp number' }
  }

  let normalized: string

  if (/^947\d{8}$/.test(digits)) {
    // +947XXXXXXXX / 947XXXXXXXX
    normalized = digits
  } else if (/^07\d{8}$/.test(digits)) {
    // 07XXXXXXXX
    normalized = `94${digits.slice(1)}`
  } else if (/^7\d{8}$/.test(digits)) {
    // 7XXXXXXXX
    normalized = `94${digits}`
  } else {
    return {
      valid: false,
      error: 'Enter a valid number like +9477xxxxxxx, 07xxxxxxxx, or 7xxxxxxxx',
    }
  }

  return { valid: true, value: normalized }
}

