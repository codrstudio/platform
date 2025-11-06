/**
 * Module Registry Initialization
 * Registers all available modules
 * SPEC-MO-R-* compliance
 */

import { moduleRegistry } from './ModuleRegistry';

/**
 * Register all available modules
 * This file is imported in main.tsx to ensure modules are registered
 * before the application starts
 */

// Register setup module
moduleRegistry.register('setup', () => import('@/modules/setup'));

// Register auth module
moduleRegistry.register('auth', () => import('@/modules/auth'));

// Register additional modules here as they are created
// Example:
// moduleRegistry.register('chat', () => import('@/modules/chat'));
// moduleRegistry.register('dashboard', () => import('@/modules/dashboard'));

console.log(`[Module Registry] Registered ${moduleRegistry.size} module(s)`);
