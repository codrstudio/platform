import type { ModuleManifest } from '@/types/module';

export const manifest: ModuleManifest = {
  id: 'homepage',
  name: 'Home Page',
  version: '1.0.0',
  type: 'functionality',
  description: 'Beautiful, animated landing page with customizable sections (Hero, Features, Portals, CTA) and professional animations',
  author: 'Platform Team',
  dependencies: ['auth'],
  category: 'core',
  permissions: [],
};
