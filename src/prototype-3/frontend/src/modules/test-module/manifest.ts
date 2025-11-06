/**
 * Test Module Manifest
 *
 * Simple test module to validate dependency loading.
 * Depends on 'setup' module.
 */

import type { ModuleManifest } from '../../types/module';

export const manifest: ModuleManifest = {
  id: 'test-module',
  name: 'Test Module',
  version: '1.0.0',
  type: 'functionality',
  description: 'Test module for validating dependency loading',
  author: 'Platform Team',
  dependencies: ['setup'], // Depends on setup module
  icon: 'TestTube',
  category: 'testing',
};
