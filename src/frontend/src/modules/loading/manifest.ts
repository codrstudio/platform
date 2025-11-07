/**
 * Loading Module Manifest
 *
 * Module for loading states, skeleton placeholders, and spinners.
 *
 * SPEC Compliance: To be documented
 * - SPEC-LOAD-SK-*: Skeleton loading states
 * - SPEC-LOAD-SP-*: Spinner indicators
 */

import type { ModuleManifest } from '@/types/module';

export const loadingManifest: ModuleManifest = {
  id: 'loading',
  moduleId: 'loading',
  name: 'Loading States',
  version: '1.0.0',
  description: 'Skeleton placeholders, spinners, and loading overlays',

  type: 'component',
  category: 'core',

  dependencies: [],
  permissions: [],

  config: {
    schema: {
      defaultSkeletonAnimation: {
        type: 'string',
        enum: ['pulse', 'wave', 'none'],
        default: 'pulse',
        description: 'Default animation for skeleton components'
      },
      defaultSpinnerSize: {
        type: 'string',
        enum: ['xs', 'sm', 'md', 'lg', 'xl'],
        default: 'md',
        description: 'Default size for spinner components'
      },
      defaultSpinnerVariant: {
        type: 'string',
        enum: ['default', 'primary', 'secondary', 'accent'],
        default: 'primary',
        description: 'Default variant for spinner components'
      },
      showLabels: {
        type: 'boolean',
        default: true,
        description: 'Show loading labels by default'
      }
    },
    defaults: {
      defaultSkeletonAnimation: 'pulse',
      defaultSpinnerSize: 'md',
      defaultSpinnerVariant: 'primary',
      showLabels: true
    }
  }
};
