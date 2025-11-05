import React from 'react';

/**
 * Route definition format exported by modules
 * This is what modules export from their routes.ts file
 */
export interface RouteDefinition {
  path: string;
  component: React.ComponentType;
  requiresAuth?: boolean;
  permissions?: string[];
  layout?: 'default' | 'full' | 'minimal';
}

/**
 * Internal route representation with metadata
 * Compatible with React Router's RouteObject but with platform-specific fields
 */
export interface RegisteredRoute {
  path?: string;
  index?: boolean;
  children?: RegisteredRoute[];
  caseSensitive?: boolean;
  id?: string;
  element?: React.ReactNode;
  errorElement?: React.ReactNode;
  // Platform-specific fields
  moduleId?: string;
  requiresAuth?: boolean;
  permissions?: string[];
  layout?: string;
}

/**
 * Registry type: Map of portalId to array of routes
 */
export type RouteRegistryMap = Map<string, RegisteredRoute[]>;

/**
 * Props for ProtectedRoute component
 * Defines authentication and authorization requirements for a route
 */
export interface ProtectedRouteProps {
  /**
   * Content to render when user is authenticated and authorized
   */
  children: React.ReactNode;

  /**
   * Whether authentication is required to access this route
   * @default true
   */
  requireAuth?: boolean;

  /**
   * Optional permission string to check via /api/1/auth/authorize
   * Format: {operation}.{entity}[.{action}]
   * Examples: "read.users", "write.orders.approve"
   */
  requiredPermission?: string;

  /**
   * Custom loading indicator while checking authentication
   * If not provided, shows default loading message
   */
  fallback?: React.ReactNode;

  /**
   * Custom component to show when user lacks required permission
   * If not provided, shows default 403 Forbidden message
   */
  forbiddenFallback?: React.ReactNode;

  /**
   * Redirect path for unauthenticated users
   * @default "/login"
   */
  redirectTo?: string;
}
