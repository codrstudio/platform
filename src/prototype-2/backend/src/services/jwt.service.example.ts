// backend/src/services/jwt.service.example.ts
// This file demonstrates how to use JwtService in auth routes
// DO NOT import this file in production code

import { jwtService } from './jwt.service.js';
import type { JwtPayload } from '../types/auth.types.js';

// Example 1: Generate tokens during login
export async function loginExample(userId: string, username: string, email: string) {
  // Prepare payload with user data
  const payload: JwtPayload = {
    sub: userId,           // Required: User ID
    username,              // Optional: Username
    email,                 // Optional: Email
    roles: ['user'],       // Optional: User roles
    permissions: ['read'], // Optional: Permissions
  };

  // Generate token pair
  const tokenResponse = jwtService.generateTokenPair(payload);

  // tokenResponse contains:
  // - tokens.access_token: JWT for Authorization header
  // - tokens.refresh_token: Opaque token for refresh endpoint
  // - tokens.token_type: 'bearer'
  // - tokens.expires_in: TTL in seconds
  // - tokens_control.refresh_token_hash: Store this in database
  // - tokens_control.familia_id: Store this for rotation detection
  // - tokens_control.expires_at: Refresh token expiration date

  // Store tokens_control in database (via n8n)
  // Return tokens to client
  return {
    access_token: tokenResponse.tokens.access_token,
    refresh_token: tokenResponse.tokens.refresh_token,
    token_type: tokenResponse.tokens.token_type,
    expires_in: tokenResponse.tokens.expires_in,
  };
}

// Example 2: Verify token in middleware (future use)
export async function verifyTokenExample(token: string) {
  try {
    const payload = jwtService.verifyAccessToken(token);
    // Token is valid, payload contains user data
    return payload;
  } catch (error) {
    // Token is invalid or expired
    console.error('Token verification failed:', error);
    throw error;
  }
}

// Example 3: Decode token for inspection (debugging only)
export function inspectTokenExample(token: string) {
  const payload = jwtService.decodeToken(token);
  // WARNING: This does NOT verify the signature
  // Only use for debugging, never for authentication
  console.log('Token payload (unverified):', payload);
}
