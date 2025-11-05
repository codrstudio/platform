// JQEL type definitions
// Based on SPEC-jqel-syntax.md and SPEC-data-access.md

export interface JQELQuery {
  schema: string;
  select?: string;
  mutate?: string;
  where?: Record<string, unknown>;
  options?: {
    limit?: number;
    offset?: number;
    orderBy?: Array<{ field: string; order: 'asc' | 'desc' }>;
  };
  output?: string[];
  except?: string[];
}

export interface JResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}
