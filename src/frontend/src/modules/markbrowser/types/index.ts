/**
 * MarkBrowser Module Types
 * SPEC-MARKBROWSER-D-001, SPEC-MARKBROWSER-D-002
 */

export interface Document {
  id: string;
  path: string;
  name: string;
  title?: string;
  content: string;
  lastModified: string;
  size?: number;
  isDirectory: boolean;
  parent?: string;
}

export interface TreeNode {
  id: string;
  name: string;
  path: string;
  isDirectory: boolean;
  children?: TreeNode[];
}

export interface DataSourceConfig {
  schema: string;
  documentsEntity: string;
}

export interface NavigationConfig {
  showTree: boolean;
  showBreadcrumbs: boolean;
  showTOC: boolean;
  expandDepth: number;
}

export interface FeaturesConfig {
  enableSearch: boolean;
  enableEdit: boolean;
  enableCreate: boolean;
  enableDelete: boolean;
  enableExport: boolean;
  enableFavorites: boolean;
}

export interface EditorConfig {
  autosave: boolean;
  autosaveInterval: number;
  showPreview: boolean;
  previewMode: 'side' | 'toggle';
}

export interface RenderingConfig {
  theme: 'light' | 'dark';
  syntaxTheme: string;
  linkTarget: '_self' | '_blank';
}

export interface PermissionsConfig {
  canView: string;
  canEdit: string;
  canManage: string;
}

export interface MarkBrowserConfig {
  title?: string;
  rootPath?: string;
  dataSource: DataSourceConfig;
  navigation: NavigationConfig;
  features: FeaturesConfig;
  editor?: EditorConfig;
  rendering: RenderingConfig;
  permissions?: PermissionsConfig;
}
