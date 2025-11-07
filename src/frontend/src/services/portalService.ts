// Portal Service
// Based on SPEC-concepts.md

import type { Portal } from '@/types/portal';

/**
 * Portal Service
 *
 * Manages portal data and configuration
 * This is a simple in-memory implementation
 * In production, this would fetch from backend /api/portals
 */
class PortalService {
  private portals: Map<string, Portal> = new Map();

  constructor() {
    // Initialize with default portals (SPEC-C-P-001)
    this.initializeDefaultPortals();
  }

  /**
   * Initialize default portals
   * SPEC-C-P-001: Main portal and Setup portal
   */
  private initializeDefaultPortals(): void {
    // Main portal (SPEC-R-PM-001)
    this.portals.set('main', {
      portalId: 'main',
      name: 'Principal',
      description: 'Portal principal da plataforma',
      settingsKey: 'main',
      activeModules: [],
      removable: false,
    });

    // Setup portal
    this.portals.set('setup', {
      portalId: 'setup',
      name: 'Configuração',
      description: 'Portal de configuração da plataforma',
      settingsKey: 'setup',
      activeModules: ['setup'],
      removable: false,
    });
  }

  /**
   * Get all portals
   */
  async getAllPortals(): Promise<Portal[]> {
    return Array.from(this.portals.values());
  }

  /**
   * Get portal by ID
   */
  async getPortalById(portalId: string): Promise<Portal | null> {
    return this.portals.get(portalId) || null;
  }

  /**
   * Create portal
   */
  async createPortal(portal: Omit<Portal, 'activeModules' | 'removable'>): Promise<Portal> {
    const newPortal: Portal = {
      ...portal,
      activeModules: [],
      removable: true,
    };

    this.portals.set(portal.portalId, newPortal);
    return newPortal;
  }

  /**
   * Update portal
   */
  async updatePortal(portalId: string, updates: Partial<Portal>): Promise<Portal | null> {
    const portal = this.portals.get(portalId);
    if (!portal) return null;

    const updated = { ...portal, ...updates, portalId }; // portalId immutable
    this.portals.set(portalId, updated);
    return updated;
  }

  /**
   * Delete portal
   */
  async deletePortal(portalId: string): Promise<boolean> {
    const portal = this.portals.get(portalId);
    if (!portal || !portal.removable) return false;

    return this.portals.delete(portalId);
  }

  /**
   * Check if portal exists
   */
  async portalExists(portalId: string): Promise<boolean> {
    return this.portals.has(portalId);
  }
}

// Singleton instance
export const portalService = new PortalService();
