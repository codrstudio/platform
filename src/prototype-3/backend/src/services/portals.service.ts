/**
 * Portals Service
 *
 * Manages portal configurations stored in config/portals.json.
 * Provides CRUD operations for portal data.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Portal } from '../types/portal.types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORTALS_FILE = path.join(__dirname, '../../config/portals.json');

class PortalsService {
  /**
   * Read all portals from file
   */
  async getAllPortals(): Promise<Portal[]> {
    try {
      const data = await fs.readFile(PORTALS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // If file doesn't exist, return empty array
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  /**
   * Get a specific portal by ID
   */
  async getPortalById(portalId: string): Promise<Portal | null> {
    const portals = await this.getAllPortals();
    return portals.find(p => p.portalId === portalId) || null;
  }

  /**
   * Create a new portal
   */
  async createPortal(portal: Portal): Promise<Portal> {
    const portals = await this.getAllPortals();

    // Check if portal already exists
    const exists = portals.some(p => p.portalId === portal.portalId);
    if (exists) {
      throw new Error(`Portal with ID '${portal.portalId}' already exists`);
    }

    // Add new portal
    portals.push(portal);
    await this.savePortals(portals);

    return portal;
  }

  /**
   * Update an existing portal
   */
  async updatePortal(portalId: string, updates: Partial<Portal>): Promise<Portal | null> {
    const portals = await this.getAllPortals();
    const index = portals.findIndex(p => p.portalId === portalId);

    if (index === -1) {
      return null;
    }

    // Merge updates
    portals[index] = {
      ...portals[index],
      ...updates,
      portalId // Ensure portalId cannot be changed
    };

    await this.savePortals(portals);
    return portals[index];
  }

  /**
   * Delete a portal
   */
  async deletePortal(portalId: string): Promise<boolean> {
    const portals = await this.getAllPortals();
    const initialLength = portals.length;
    const filtered = portals.filter(p => p.portalId !== portalId);

    if (filtered.length === initialLength) {
      return false; // Portal not found
    }

    await this.savePortals(filtered);
    return true;
  }

  /**
   * Save portals to file
   */
  private async savePortals(portals: Portal[]): Promise<void> {
    // Ensure config directory exists
    const configDir = path.dirname(PORTALS_FILE);
    await fs.mkdir(configDir, { recursive: true });

    // Write with formatting for readability
    await fs.writeFile(PORTALS_FILE, JSON.stringify(portals, null, 2), 'utf-8');
  }
}

export const portalsService = new PortalsService();
