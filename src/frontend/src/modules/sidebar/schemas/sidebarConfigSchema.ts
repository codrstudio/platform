/**
 * Sidebar Configuration Schema (Zod Validation)
 *
 * Schema de validação para configuração do módulo Sidebar
 * Usado pelo SidebarConfigForm
 */

import { z } from 'zod';

/**
 * Schema para validar MenuItem individual
 */
const menuItemBaseSchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
  label: z.string().min(1, 'Label é obrigatório'),
  icon: z.string().optional(),
  route: z.string().optional(),
  badge: z.object({
    text: z.string(),
    variant: z.enum(['default', 'primary', 'success', 'warning', 'danger']),
  }).optional(),
  onClick: z.string().optional(),
  permission: z.string().optional(),
  disabled: z.boolean().optional(),
});

/**
 * Schema recursivo para MenuItem com children
 */
export type MenuItem = z.infer<typeof menuItemBaseSchema> & {
  children?: MenuItem[];
};

const menuItemSchema: z.ZodType<MenuItem> = menuItemBaseSchema.extend({
  children: z.lazy(() => menuItemSchema.array()).optional(),
});

/**
 * Schema para validar items como array direto
 * (usado com MenuItemsEditor visual)
 */
const itemsSchema = z.array(menuItemSchema);

/**
 * Schema completo para configuração do Sidebar
 * Usado pelo SidebarConfigForm
 */
export const sidebarConfigSchema = z.object({
  // Layout
  layout: z.enum(['sidebar-left', 'sidebar-right'], {
    required_error: 'Selecione um layout',
  }),

  // Menu Items (array direto)
  items: itemsSchema,

  // Features
  enableSearch: z.boolean(),
  enableUserMenu: z.boolean(),
  enableThemeToggle: z.boolean(),

  // Brand
  portalName: z.string().min(1, 'Nome do portal é obrigatório'),
  showLogo: z.boolean(),

  // Dimensions
  width: z
    .number({ invalid_type_error: 'Largura deve ser um número' })
    .min(200, 'Largura mínima: 200px')
    .max(400, 'Largura máxima: 400px'),

  collapsedWidth: z
    .number({ invalid_type_error: 'Largura colapsada deve ser um número' })
    .min(60, 'Largura colapsada mínima: 60px')
    .max(120, 'Largura colapsada máxima: 120px'),

  // Behavior
  collapsible: z.boolean().optional(),
  defaultCollapsed: z.boolean().optional(),
  persistState: z.boolean().optional(),
  closeOnNavigate: z.boolean().optional(),

  // Style
  variant: z.enum(['default', 'bordered', 'floating']).optional(),
  showIcons: z.boolean().optional(),
  showBadges: z.boolean().optional(),

  // Permissions
  checkPermissions: z.boolean().optional(),
});

/**
 * Type inference do schema
 */
export type SidebarConfigFormData = z.infer<typeof sidebarConfigSchema>;

/**
 * Exports adicionais para MenuItemsEditor
 */
export { menuItemSchema };
export type { MenuItem };

/**
 * Exemplo de items válido (para placeholder/ajuda)
 */
export const MENU_ITEMS_EXAMPLE = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    route: '/dashboard'
  },
  {
    id: 'users',
    label: 'Usuários',
    icon: 'Users',
    route: '/users',
    badge: {
      text: '5',
      variant: 'primary' as const
    }
  },
  {
    id: 'settings',
    label: 'Configurações',
    icon: 'Settings',
    children: [
      {
        id: 'general',
        label: 'Geral',
        icon: 'Sliders',
        route: '/settings/general'
      },
      {
        id: 'security',
        label: 'Segurança',
        icon: 'Shield',
        route: '/settings/security'
      }
    ]
  }
];
