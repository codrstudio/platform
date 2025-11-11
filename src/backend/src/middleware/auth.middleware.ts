// Auth Middleware
// Simple wrapper to use JWT validation as Express middleware

import { Request, Response, NextFunction } from 'express'
import { validateJWT as validateJWTFunction } from './jwt-validation.middleware.js'
import { env } from '../config/env.js'

/**
 * Express middleware for JWT validation
 * Validates token from Authorization header
 */
export function validateJWT(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Missing token'
    })
    return
  }

  const validationResult = validateJWTFunction(token, env.JWT_SECRET)

  if (!validationResult.valid) {
    res.status(401).json({
      success: false,
      error: validationResult.error || 'Unauthorized'
    })
    return
  }

  // Attach decoded payload to request for downstream use
  ;(req as any).user = validationResult.decoded

  next()
}
