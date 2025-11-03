/**
 * Module Route Component
 * Wrapper for lazy-loaded module routes with context
 * SPEC-C-M-* compliance
 */

import { createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import type { ModuleContext } from '../modules/types';

// Create Module Context
const ModuleContextInstance = createContext<ModuleContext | null>(null);

/**
 * Hook to access module context
 */
export function useModuleContext(): ModuleContext {
  const context = useContext(ModuleContextInstance);

  if (!context) {
    throw new Error('useModuleContext must be used within a ModuleRoute');
  }

  return context;
}

interface ModuleRouteProps {
  moduleId: string;
  portalId: string;
  instanceId?: string;
  config?: Record<string, any>;
  children?: React.ReactNode;
}

/**
 * Module Route Component
 * Provides ModuleContext to child routes
 */
export function ModuleRoute({
  moduleId,
  portalId,
  instanceId,
  config,
  children,
}: ModuleRouteProps) {
  const contextValue: ModuleContext = {
    moduleId,
    portalId,
    instanceId,
    config,
  };

  return (
    <ModuleContextInstance.Provider value={contextValue}>
      {children || <Outlet />}
    </ModuleContextInstance.Provider>
  );
}

/**
 * Higher-Order Component to wrap component with ModuleContext
 */
export function withModuleContext<P extends object>(
  Component: React.ComponentType<P>,
  moduleContext: ModuleContext
) {
  return function ModuleContextWrapper(props: P) {
    return (
      <ModuleContextInstance.Provider value={moduleContext}>
        <Component {...props} />
      </ModuleContextInstance.Provider>
    );
  };
}
