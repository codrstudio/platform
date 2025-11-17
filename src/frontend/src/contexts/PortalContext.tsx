/**
 * Portal Context
 *
 * Provides portal information throughout the component tree.
 * Extracts portalId from route params and makes it available via context.
 *
 * Usage:
 * ```tsx
 * const { portalId } = usePortal()
 * ```
 */

import React, { createContext, useContext } from 'react'
import { useParams } from 'react-router-dom'

interface PortalContextValue {
  portalId: string
}

const PortalContext = createContext<PortalContextValue | null>(null)

interface PortalProviderProps {
  children: React.ReactNode
  /** Optional override for portalId (useful for testing or special cases) */
  portalId?: string
}

/**
 * PortalProvider Component
 *
 * Wraps components that need access to portal information.
 * Automatically extracts portalId from route params.
 */
export function PortalProvider({ children, portalId: overridePortalId }: PortalProviderProps) {
  const params = useParams<{ portalId?: string }>()
  const portalId = overridePortalId || params.portalId || 'main'

  return (
    <PortalContext.Provider value={{ portalId }}>
      {children}
    </PortalContext.Provider>
  )
}

/**
 * usePortal Hook
 *
 * Access portal information from context.
 *
 * @throws {Error} If used outside of PortalProvider
 * @returns Portal context value with portalId
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { portalId } = usePortal()
 *   return <div>Portal: {portalId}</div>
 * }
 * ```
 */
export function usePortal(): PortalContextValue {
  const context = useContext(PortalContext)

  if (!context) {
    throw new Error('usePortal must be used within a PortalProvider')
  }

  return context
}
