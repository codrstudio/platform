/**
 * Sidebar Module Types
 *
 * SPEC Compliance:
 * - SPEC-MD-NAM-003: Types em index.ts
 * - SPEC-MD-NAM-009: PascalCase para interfaces
 * - SPEC-SIDEBAR-M-001: MenuItem structure
 * - SPEC-SIDEBAR-T-*: Layout types
 * - SPEC-SIDEBAR-C-*: Configuration
 */

/**
 * Sidebar layout type
 * SPEC-SIDEBAR-T-001, T-006
 */
export type SidebarLayout = 'sidebar-left' | 'sidebar-right' | 'navbar-top';

/**
 * Sidebar variant
 */
export type SidebarVariant = 'default' | 'bordered' | 'floating';

/**
 * Badge variant
 * SPEC-SIDEBAR-O-002
 */
export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger';

/**
 * Menu item badge
 * SPEC-SIDEBAR-O-001 to O-004
 */
export interface MenuBadge {
  text: string;
  variant: BadgeVariant;
}

/**
 * Menu item definition
 * SPEC-SIDEBAR-M-001
 */
export interface MenuItem {
  id: string;
  label: string;
  icon?: string; // Lucide icon name
  route?: string;
  badge?: MenuBadge;
  onClick?: () => void;
  permission?: string;
  children?: MenuItem[];
  disabled?: boolean;
}

/**
 * User action for user menu
 * SPEC-SIDEBAR-O-009 to O-011
 */
export interface UserAction {
  label: string;
  icon?: string;
  route?: string;
  onClick?: string | (() => void);
}

/**
 * User menu configuration
 * SPEC-SIDEBAR-O-009 to O-011
 */
export interface UserMenuConfig {
  position: 'top' | 'bottom';
  showAvatar: boolean;
  showName: boolean;
  showEmail: boolean;
  actions: UserAction[];
}

/**
 * Brand configuration (Logo + Portal Name)
 */
export interface SidebarBrandConfig {
  /** Portal name to display */
  portalName?: string;
  /** Logo component or image URL */
  logo?: React.ReactNode | string;
  /** Show/hide logo */
  showLogo?: boolean;
}

/**
 * Sidebar configuration
 * SPEC-SIDEBAR-C-001, C-002
 */
export interface SidebarConfig {
  // Layout (REQUIRED - SPEC-SIDEBAR-C-001)
  layout: SidebarLayout;
  items: MenuItem[];

  // Dimensions (SPEC-SIDEBAR-T-002, T-007)
  width?: number; // Default: 256px
  height?: number; // Default: 64px (navbar)
  collapsedWidth?: number; // Default: 80px

  // Behavior (SPEC-SIDEBAR-T-003, SPEC-SIDEBAR-M-009)
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  persistState?: boolean;
  closeOnNavigate?: boolean;

  // Features (SPEC-SIDEBAR-O-*)
  enableSearch?: boolean;
  enableUserMenu?: boolean;
  enableThemeToggle?: boolean;

  // Style (SPEC-SIDEBAR-V-*)
  variant?: SidebarVariant;
  showIcons?: boolean;
  showBadges?: boolean;

  // Brand (Logo + Portal Name)
  brand?: SidebarBrandConfig;

  // User Menu (if enabled)
  userMenu?: UserMenuConfig;

  // Permissions (SPEC-SIDEBAR-O-014 to O-016)
  checkPermissions?: boolean;
}