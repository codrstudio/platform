/**
 * Forms Module Manifest
 *
 * SPEC Compliance: SPEC-FORMS-R-*
 */

import type { ModuleManifest } from '@/types/module';

export const formsManifest: ModuleManifest = {
  id: 'forms',
  moduleId: 'forms',
  name: 'Forms',
  version: '1.0.0',
  description: 'Create and manage custom forms with multiple field types',
  type: 'functionality',
  category: 'productivity',
  dependencies: [],
  permissions: ['forms:read', 'forms:write', 'forms:submit'],
  config: {
    schema: {
      instanceId: {
        type: 'string',
        required: true,
        description: 'Unique form instance identifier'
      },
      formId: {
        type: 'string',
        required: true,
        description: 'Form configuration identifier'
      },
      route: {
        type: 'string',
        required: true,
        description: 'Form route path'
      },
      title: {
        type: 'string',
        required: false,
        description: 'Form title override'
      }
    },
    defaults: {
      instanceId: '',
      formId: '',
      route: '/form'
    }
  }
};
