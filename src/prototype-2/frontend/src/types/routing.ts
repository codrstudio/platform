// Route type definitions
// Based on SPEC-routing.md Route concept

export interface RouteDefinition {
  path: string;
  component: React.ComponentType;
  requiresAuth?: boolean;
  permissions?: string[];
  layout?: 'default' | 'full' | 'minimal';
}

export interface PrefixedRoute extends RouteDefinition {
  originalPath: string;
  prefixedPath: string;
}
