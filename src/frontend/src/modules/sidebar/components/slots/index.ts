/**
 * Slot Components Export
 *
 * SPEC Compliance:
 * - SPEC-MD-COM-004: Exporta array de SlotComponent
 * - SPEC-MD-STR-003: Organização em components/slots/
 */

import type { SlotComponent } from '@/core/composition/types';
import { Sidebar } from './Sidebar';

/**
 * Slot components provided by sidebar module
 *
 * Note: The Sidebar component is NOT lazy-loaded because:
 * 1. It's a critical layout component needed immediately
 * 2. It's relatively small in size
 * 3. Used on almost every page when sidebar layout is active
 */
export const slotComponents: SlotComponent[] = [
  {
    slot: 'sidebar',
    componentId: 'sidebar-main',
    component: Sidebar,
    providedBy: 'sidebar',
    name: 'Sidebar',
    replace: true, // Replaces default sidebar
    metadata: {
      description: 'Sidebar principal com menu de navegação, busca e menu de usuário',
      features: ['responsive', 'collapsible', 'search', 'user-menu', 'theme-toggle'],
    },
  },
];