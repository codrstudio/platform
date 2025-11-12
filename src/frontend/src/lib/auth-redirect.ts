/**
 * Authentication redirect utilities
 * Implements hybrid approach: sessionStorage (primary) + query parameter (fallback)
 *
 * Security: Validates redirect URLs to prevent open redirect attacks
 */

const RETURN_URL_KEY = 'auth:returnUrl';
const DEFAULT_REDIRECT = '/';
const MAX_REDIRECT_LENGTH = 500;

/**
 * Validates a redirect URL to prevent open redirect attacks
 *
 * Security checks:
 * - Only allows relative paths (no absolute URLs)
 * - Blocks protocol handlers (javascript:, data:, etc)
 * - Enforces path must start with /
 * - Limits URL length to prevent overflow
 *
 * @param url - URL to validate
 * @returns true if URL is safe to redirect to
 */
export const isValidRedirect = (url: string): boolean => {
  // Empty or null
  if (!url) return false;

  // Block absolute URLs (http://, https://, //)
  if (url.match(/^(https?:)?\/\//i)) {
    console.warn('[Auth] Blocked absolute URL redirect:', url);
    return false;
  }

  // Block protocol handlers (javascript:, data:, file:, etc)
  if (url.match(/^[a-z][a-z0-9+.-]*:/i)) {
    console.warn('[Auth] Blocked protocol handler redirect:', url);
    return false;
  }

  // Must start with /
  if (!url.startsWith('/')) {
    console.warn('[Auth] Redirect must start with /:', url);
    return false;
  }

  // Prevent excessively long URLs (potential overflow/DoS)
  if (url.length > MAX_REDIRECT_LENGTH) {
    console.warn('[Auth] Redirect URL too long:', url.length);
    return false;
  }

  return true;
};

/**
 * Saves the current URL for post-login redirect
 * Uses both sessionStorage (primary) and returns encoded URL for query param (fallback)
 *
 * @param pathname - Current pathname
 * @param search - Current search params
 * @returns Encoded URL for query parameter
 */
export const saveReturnUrl = (pathname: string, search: string = ''): string => {
  const fullPath = pathname + search;

  // Save to sessionStorage (primary - works in SPA navigation)
  try {
    sessionStorage.setItem(RETURN_URL_KEY, fullPath);
  } catch (error) {
    console.warn('[Auth] Failed to save return URL to sessionStorage:', error);
  }

  // Return encoded URL for query parameter (fallback - works with deep links)
  return encodeURIComponent(fullPath);
};

/**
 * Retrieves the return URL from storage or query params
 * Priority: sessionStorage → query param → default
 *
 * @param queryParam - Redirect URL from query parameter (optional)
 * @returns Validated redirect URL or default
 */
export const getReturnUrl = (queryParam?: string | null): string => {
  let returnUrl: string | null = null;

  // 1. Try sessionStorage first (SPA navigation flow)
  try {
    returnUrl = sessionStorage.getItem(RETURN_URL_KEY);
  } catch (error) {
    console.warn('[Auth] Failed to read return URL from sessionStorage:', error);
  }

  // 2. Fallback to query parameter (deep links from email/notifications)
  if (!returnUrl && queryParam) {
    returnUrl = queryParam;
  }

  // 3. Validate redirect URL (security)
  if (returnUrl && !isValidRedirect(returnUrl)) {
    console.warn('[Auth] Invalid redirect URL detected, using default:', returnUrl);
    returnUrl = null;
  }

  // 4. Clear sessionStorage (one-time use - prevent replay)
  try {
    sessionStorage.removeItem(RETURN_URL_KEY);
  } catch (error) {
    console.warn('[Auth] Failed to clear return URL from sessionStorage:', error);
  }

  return returnUrl || DEFAULT_REDIRECT;
};

/**
 * Checks if current path should skip redirect saving
 * (e.g., already on login page)
 *
 * @param pathname - Current pathname
 * @returns true if should skip saving redirect
 */
export const shouldSkipRedirectSave = (pathname: string): boolean => {
  const skipPaths = ['/login', '/logout'];
  return skipPaths.includes(pathname);
};
