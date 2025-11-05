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
console.log('[Module Registry] Registering setup module...');
moduleRegistry.register('setup', () => import('@/modules/setup'));
console.log('[Module Registry] Setup registered. Size:', moduleRegistry.size);

// Register auth module
console.log('[Module Registry] Registering auth module...');
moduleRegistry.register('auth', () => import('@/modules/auth'));
console.log('[Module Registry] Auth registered. Size:', moduleRegistry.size);

// Register additional modules here as they are created
// Example:
// moduleRegistry.register('chat', () => import('@/modules/chat'));
// moduleRegistry.register('dashboard', () => import('@/modules/dashboard'));

console.log(`[Module Registry] Total registered: ${moduleRegistry.size} module(s)`);
console.log('[Module Registry] Module list:', moduleRegistry.list());
