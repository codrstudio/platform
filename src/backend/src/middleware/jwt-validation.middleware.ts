// JWT Validation Middleware
// Based on PLAN_REAFCT.md - FASE 1: ATUALIZAR VALIDACAO JWT NO BACKEND

import jwt from 'jsonwebtoken'

/**
 * JWT Payload Interface
 */
export interface JWTPayload {
  sub: string
  guest?: boolean
  exp?: number
  iat?: number
  iss?: string
  username?: string
  email?: string
  roles?: string[]
  permissions?: string[]
  [key: string]: unknown
}

/**
 * JWT Validation Result
 */
export interface JWTValidationResult {
  valid: boolean
  decoded?: JWTPayload
  error?: string
}

/**
 * Validate JWT with special handling for guest tokens
 *
 * IMPORTANT: Guest tokens (guest: true) do NOT have expiration validation
 * This ensures 0% of 401 errors for anonymous users in public sites
 *
 * User tokens (guest: false or undefined) validate expiration normally
 *
 * @param token - JWT token to validate
 * @param secret - JWT secret for signature verification
 * @returns Validation result with decoded payload or error
 */
export function validateJWT(token: string, secret: string): JWTValidationResult {
  try {
    // Verify signature but ignore expiration (we'll validate manually)
    const decoded = jwt.verify(token, secret, {
      ignoreExpiration: true, // Don't validate exp automatically
    }) as JWTPayload

    // Validate expiration ONLY for authenticated users (not guests)
    if (!decoded.guest && decoded.exp) {
      const now = Math.floor(Date.now() / 1000)
      if (now >= decoded.exp) {
        return { valid: false, error: 'Token expired' }
      }
    }

    // Guest tokens: always accept (exp ignored)
    // User tokens: accepted if not expired
    return { valid: true, decoded }
  } catch (error) {
    // Only reject if signature is invalid (not expiration)
    return { valid: false, error: 'Invalid token signature' }
  }
}
