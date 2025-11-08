/**
 * Forms Module - Main Export
 *
 * Create and manage custom forms with multiple field types.
 *
 * SPEC: SPEC-module-forms.md
 */

import { formsManifest } from './manifest';
import { formsRoutes } from './routes';
import type { ModuleExports } from '@/types/module';

// Components
export * from './components';

// Fields
export * from './fields';

// Pages
export { FormView } from './pages/FormView';

// Hooks
export { useForms } from './hooks/useForms';

// Types
export type {
  FieldType,
  Choice,
  TextValidation,
  NumberValidation,
  DateValidation,
  FileOptions,
  TextareaOptions,
  SelectOptions,
  RadioOptions,
  CheckboxOptions,
  SwitchOptions,
  FieldOptions,
  FieldValidation,
  ConditionalLogic,
  FormField,
  FormSettings,
  FormStyling,
  FormConfig,
  FormSubmission,
  FormInstanceConfig,
  FormState
} from './types';

// Module Exports
export const formsModule: ModuleExports = {
  manifest: formsManifest,
  routes: formsRoutes
};

// Auto-register module on import
import { moduleRegistry } from '@/core/modules';

moduleRegistry.register(formsModule);
