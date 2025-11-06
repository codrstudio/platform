/**
 * Token storage module - Secure persistence for auth tokens
 *
 * Based on SPEC-authentication.md SPEC-AU-ST-001:012
 *
 * Storage strategy:
 * - Access token: sessionStorage (tab-scoped, cleared on close)
 * - Refresh token: localStorage (persistent, session restoration)
 *
 * Security:
 * - Access tokens NEVER go to localStorage (XSS risk)
 * - All operations wrapped in try-catch (graceful degradation)
 * - Consistent key namespace: platform:auth:*
 */

import { SessionStorageStrategy, LocalStorageStrategy } from './storageStrategies';

// Storage keys with consistent namespace
const ACCESS_TOKEN_KEY = 'platform:auth:access_token';
const REFRESH_TOKEN_KEY = 'platform:auth:refresh_token';

// Strategy instances
const sessionStrategy = new SessionStorageStrategy();
const localStrategy = new LocalStorageStrategy();

/**
 * Save access token to sessionStorage
 * Tab-scoped, cleared on tab close
 *
 * @param token - JWT access token
 */
export function saveAccessToken(token: string): void {
  sessionStrategy.save(ACCESS_TOKEN_KEY, token);
}

/**
 * Save refresh token to localStorage
 * Persistent across tabs and sessions
 *
 * @param token - Refresh token
 */
export function saveRefreshToken(token: string): void {
  localStrategy.save(REFRESH_TOKEN_KEY, token);
}

/**
 * Load access token from sessionStorage
 *
 * @returns Access token or null if not found
 */
export function loadAccessToken(): string | null {
  return sessionStrategy.load(ACCESS_TOKEN_KEY);
}

/**
 * Load refresh token from localStorage
 * Used for session restoration on page load
 *
 * @returns Refresh token or null if not found
 */
export function loadRefreshToken(): string | null {
  return localStrategy.load(REFRESH_TOKEN_KEY);
}

/**
 * Clear access token from sessionStorage
 */
export function clearAccessToken(): void {
  sessionStrategy.remove(ACCESS_TOKEN_KEY);
}

/**
 * Clear refresh token from localStorage
 */
export function clearRefreshToken(): void {
  localStrategy.remove(REFRESH_TOKEN_KEY);
}

/**
 * Clear all tokens from storage
 * Called on logout to ensure complete cleanup
 */
export function clearAllTokens(): void {
  clearAccessToken();
  clearRefreshToken();
}

/**
 * Check if refresh token exists in storage
 * Used to determine if session restoration is possible
 *
 * @returns True if refresh token exists
 */
export function hasRefreshToken(): boolean {
  return localStrategy.has(REFRESH_TOKEN_KEY);
}
