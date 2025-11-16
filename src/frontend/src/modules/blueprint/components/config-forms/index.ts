/**
 * Blueprint Slot Config Forms
 *
 * Configuration forms for Blueprint slot components
 */

import { lazy } from 'react';
import type { SlotConfigFormRegistration } from '@/core/composition/types';
import {
  defaultBlueprintHeaderConfig,
  defaultBlueprintSidebarConfig,
} from '../../schemas/slotConfigSchemas';

// Lazy-load config forms
const BlueprintHeaderConfigForm = lazy(() =>
  import('./BlueprintHeaderConfigForm').then((m) => ({
    default: m.BlueprintHeaderConfigForm,
  }))
);

const BlueprintSidebarConfigForm = lazy(() =>
  import('./BlueprintSidebarConfigForm').then((m) => ({
    default: m.BlueprintSidebarConfigForm,
  }))
);

/**
 * Slot Config Form Registrations
 *
 * These are automatically discovered and registered by the SlotConfigFormRegistry
 */
export const slotConfigForms: SlotConfigFormRegistration[] = [
  {
    componentId: 'blueprint-header',
    slotTypes: ['navbar'],
    FormComponent: BlueprintHeaderConfigForm,
    metadata: {
      name: 'Blueprint Header Configuration',
      description: 'Configure menu items, logo, and theme toggle for the header',
    },
    defaultConfig: defaultBlueprintHeaderConfig,
  },
  {
    componentId: 'blueprint-sidebar',
    slotTypes: ['sidebar'],
    FormComponent: BlueprintSidebarConfigForm,
    metadata: {
      name: 'Blueprint Sidebar Configuration',
      description: 'Configure menu items, width, and collapsible behavior',
    },
    defaultConfig: defaultBlueprintSidebarConfig,
  },
];