/**
 * Authorization Service
 *
 * Handles authorization checks by calling the n8n /auth/authorize workflow.
 * Implements SPEC-authentication.md authorization requirements.
 */

import axios from 'axios';
import { JQELQuery, AuthorizationContext, isSelectQuery, isMutateQuery } from '../types/jqel.types';

interface AuthorizeRequest {
  token: string;
  resource: string;
  action: string;
  context?: Record<string, any>;
}

interface AuthorizeResponse {
  success: boolean;
  authorized: boolean;
  permissions?: string[];
  user?: {
    userId: string;
    email: string;
    roles: string[];
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Authorization Service
 * Calls n8n /auth/authorize workflow to validate permissions
 */
export class AuthorizationService {
  private n8nBaseUrl: string;

  constructor() {
    this.n8nBaseUrl = process.env.N8N_WEBHOOK_BASE_URL || 'http://localhost:5678';
  }

  /**
   * Check if user is authorized to perform a JQEL query
   */
  async authorizeJQELQuery(
    token: string,
    query: JQELQuery,
    context: AuthorizationContext
  ): Promise<AuthorizeResponse> {
    try {
      const resource = this.buildResourceIdentifier(query);
      const action = this.determineAction(query);

      const entity = isSelectQuery(query) ? query.select : isMutateQuery(query) ? query.mutate : undefined;
      const operation = isMutateQuery(query) ? query.action : undefined;

      const response = await axios.post<AuthorizeResponse>(
        `${this.n8nBaseUrl}/webhook/auth/authorize`,
        {
          token,
          resource,
          action,
          context: {
            schema: query.schema,
            entity,
            operation,
            portalId: context.portalId,
            moduleId: context.moduleId,
            instanceId: context.instanceId
          }
        } as AuthorizeRequest,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as AuthorizeResponse;
      }

      return {
        success: false,
        authorized: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown authorization error'
        }
      };
    }
  }

  /**
   * Build resource identifier from JQEL query
   * Format: schema:entity or schema:entity:id
   */
  private buildResourceIdentifier(query: JQELQuery): string {
    const entity = isSelectQuery(query) ? query.select : isMutateQuery(query) ? query.mutate : undefined;

    if (!entity) {
      return query.schema;
    }

    // If query has a specific ID in where clause, include it
    const id = this.extractIdFromWhere(query.where);
    if (id) {
      return `${query.schema}:${entity}:${id}`;
    }

    return `${query.schema}:${entity}`;
  }

  /**
   * Determine action from JQEL query
   */
  private determineAction(query: JQELQuery): string {
    if (isSelectQuery(query)) {
      return 'read';
    }

    if (isMutateQuery(query)) {
      switch (query.action) {
        case 'insert':
          return 'create';
        case 'update':
          return 'update';
        case 'delete':
          return 'delete';
        case 'custom':
          return 'execute';
        default:
          return 'write';
      }
    }

    return 'read';
  }

  /**
   * Extract ID from where clause if present
   */
  private extractIdFromWhere(where?: Record<string, any>): string | null {
    if (!where) {
      return null;
    }

    // Check for common ID field patterns
    const idFields = ['id', 'userId', 'portalId', 'moduleId', 'instanceId'];

    for (const field of idFields) {
      if (where[field]) {
        if (typeof where[field] === 'string') {
          return where[field];
        }
        if (where[field].$eq) {
          return where[field].$eq;
        }
      }
    }

    return null;
  }

  /**
   * Check if user has specific permission
   */
  async hasPermission(
    token: string,
    permission: string,
    context?: Record<string, any>
  ): Promise<boolean> {
    try {
      const response = await this.authorizeJQELQuery(
        token,
        { schema: 'platform', select: 'permission' } as JQELQuery,
        { permission, ...context } as AuthorizationContext
      );

      return response.success && response.authorized;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const authorizationService = new AuthorizationService();
