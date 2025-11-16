/**
 * Blueprint Slot Configuration Schemas
 *
 * Zod schemas for validating slot component configurations
 */

import { z } from 'zod';

/**
 * Menu Item Schema (for both header and sidebar)
 */
export const menuItemSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  label: z.string().min(1, 'Label is required'),
  href: z.string().min(1, 'URL is required'),
  icon: z.string().optional(), // Lucide icon name
  submenus: z.array(
    z.object({
      id: z.string().min(1, 'Submenu ID is required'),
      label: z.string().min(1, 'Submenu label is required'),
      href: z.string().min(1, 'Submenu URL is required'),
    })
  ).optional(),
});

export type MenuItem = z.infer<typeof menuItemSchema>;

/**
 * BlueprintHeader Configuration Schema
 */
export const blueprintHeaderConfigSchema = z.object({
  menuItems: z.array(menuItemSchema).default([]),
  showBrandLogo: z.boolean().default(true),
  showThemeToggle: z.boolean().default(true),
  sticky: z.boolean().default(true),
});

export type BlueprintHeaderConfig = z.infer<typeof blueprintHeaderConfigSchema>;

/**
 * BlueprintSidebar Configuration Schema
 */
export const blueprintSidebarConfigSchema = z.object({
  menuItems: z.array(menuItemSchema).default([]),
  width: z.enum(['sm', 'md', 'lg']).default('md'),
  collapsible: z.boolean().default(true),
  defaultCollapsed: z.boolean().default(false),
});

export type BlueprintSidebarConfig = z.infer<typeof blueprintSidebarConfigSchema>;

/**
 * Default configurations
 */
export const defaultBlueprintHeaderConfig: BlueprintHeaderConfig = {
  menuItems: [
    { id: 'home', label: 'Início', icon: 'Home', href: '#' },
    { id: 'docs', label: 'Documentação', icon: 'FileText', href: '#' },
    { id: 'settings', label: 'Configurações', icon: 'Settings', href: '#' },
    { id: 'about', label: 'Sobre', icon: 'Info', href: '#' },
  ],
  showBrandLogo: true,
  showThemeToggle: true,
  sticky: true,
};

export const defaultBlueprintSidebarConfig: BlueprintSidebarConfig = {
  menuItems: [
    { id: 'home', label: 'Início', icon: 'Home', href: '#' },
    { id: 'docs', label: 'Documentação', icon: 'FileText', href: '#' },
    { id: 'settings', label: 'Configurações', icon: 'Settings', href: '#' },
    { id: 'about', label: 'Sobre', icon: 'Info', href: '#' },
  ],
  width: 'md',
  collapsible: true,
  defaultCollapsed: false,
};