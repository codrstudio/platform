// Setup module entry point
// Module exports structure for dynamic loading

import type { ModuleExports } from '../../types/module';
import routes from './routes';

const setupModule: ModuleExports = {
  routes,
  onActivate: (portal) => {
    console.log(`Setup module activated in portal: ${portal.portalId}`);
  },
  onDeactivate: (portal) => {
    console.log(`Setup module deactivated from portal: ${portal.portalId}`);
  },
};

export default setupModule;
