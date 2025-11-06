import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface Portal {
  portalId: string;
  name: string;
  path: string;
  activeModules: string[];
  settings?: Record<string, unknown>;
}

const PORTALS_FILE = path.join(__dirname, '../config/portals.json');

export class PortalsService {
  /**
   * Reads all portals from portals.json
   */
  static async getAllPortals(): Promise<Portal[]> {
    try {
      const data = await fs.readFile(PORTALS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading portals.json:', error);
      throw new Error('Failed to read portal configurations');
    }
  }

  /**
   * Returns a specific portal by ID
   */
  static async getPortalById(portalId: string): Promise<Portal | null> {
    const portals = await this.getAllPortals();
    return portals.find((p) => p.portalId === portalId) || null;
  }
}
