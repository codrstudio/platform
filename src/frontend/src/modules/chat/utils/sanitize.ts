/**
 * HTML Sanitization Utilities
 *
 * Sanitize HTML content to prevent XSS attacks
 * SPEC-CHAT-F-014: HTML sanitization for security
 *
 * Note: rehype-raw already provides some level of sanitization,
 * but we use defaultUrlTransform from react-markdown for URL validation
 */

/**
 * Validate URLs to prevent XSS
 * Allows:
 * - http/https URLs
 * - data: URIs for base64 images
 * - mailto: links
 *
 * Blocks:
 * - javascript: URIs
 * - vbscript: URIs
 * - file: URIs
 * - Other potentially dangerous protocols
 */
export function isValidUrl(url: string): boolean {
  if (!url) return false

  // Allow data: URIs for base64 images
  if (url.startsWith('data:image/')) return true

  // Allow mailto:
  if (url.startsWith('mailto:')) return true

  // Allow http and https
  if (url.startsWith('http://') || url.startsWith('https://')) return true

  // Block everything else (javascript:, vbscript:, file:, etc.)
  return false
}

/**
 * Sanitize URL for use in markdown
 * Returns the URL if valid, empty string otherwise
 */
export function sanitizeUrl(url: string): string {
  return isValidUrl(url) ? url : ''
}
