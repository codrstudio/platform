#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promises as fs } from 'fs';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const POSTMAN_BASE_URL = process.env.POSTMAN_SERVER || 'https://api.getpostman.com';
const POSTMAN_API_KEY = process.env.POSTMAN_API_KEY;

/**
 * Client class for interacting with the Postman API
 * Handles authentication and HTTP requests to manage workspaces, collections, environments, and more
 */
class PostmanClient {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
  }

  /**
   * Makes HTTP requests to the Postman API with automatic authentication
   * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
   * @param {string} path - API endpoint path
   * @param {Object} body - Request body (for POST/PUT)
   * @param {Object} queryParams - Query parameters
   * @returns {Promise<Object>} - API response
   */
  async request(method, path, body = null, queryParams = {}) {
    const url = new URL(`${this.baseUrl}${path}`);

    // Add query parameters
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });

    const options = {
      method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Api-Key': this.apiKey,
      }
    };

    return new Promise((resolve, reject) => {
      const protocol = url.protocol === 'https:' ? https : http;

      const req = protocol.request(url, options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const parsed = data ? JSON.parse(data) : {};

            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${parsed.error?.message || data}`));
            }
          } catch (e) {
            reject(new Error(`Failed to parse response: ${data}`));
          }
        });
      });

      req.on('error', reject);

      if (body) {
        req.write(JSON.stringify(body));
      }

      req.end();
    });
  }

  // ========== Workspaces ==========
  /**
   * Get all workspaces accessible to the authenticated user
   * @param {string} type - Filter by workspace type (personal, team, private, public, partner)
   * @returns {Promise<Object>} - List of workspaces
   */
  async getWorkspaces(type) {
    return this.request('GET', '/workspaces', null, { type });
  }

  /**
   * Get details of a specific workspace
   * @param {string} id - Workspace ID
   * @returns {Promise<Object>} - Workspace details
   */
  async getWorkspace(id) {
    return this.request('GET', `/workspaces/${id}`);
  }

  /**
   * Create a new workspace
   * @param {Object} workspace - Workspace data (name, type, description)
   * @returns {Promise<Object>} - Created workspace
   */
  async createWorkspace(workspace) {
    return this.request('POST', '/workspaces', { workspace });
  }

  /**
   * Update an existing workspace
   * @param {string} id - Workspace ID
   * @param {Object} workspace - Updated workspace data
   * @returns {Promise<Object>} - Updated workspace
   */
  async updateWorkspace(id, workspace) {
    return this.request('PUT', `/workspaces/${id}`, { workspace });
  }

  /**
   * Delete a workspace
   * @param {string} id - Workspace ID
   * @returns {Promise<Object>} - Deletion confirmation
   */
  async deleteWorkspace(id) {
    return this.request('DELETE', `/workspaces/${id}`);
  }

  // ========== Collections ==========
  /**
   * Get all collections with minimal metadata (summary only)
   * @param {string} workspace - Workspace ID to filter collections
   * @returns {Promise<Object>} - List of collections with minimal data (id, name, uid, owner)
   */
  async getCollections(workspace) {
    const response = await this.request('GET', '/collections', null, { workspace });

    // Return only essential metadata, stripping out full collection bodies
    if (response.collections) {
      response.collections = response.collections.map(col => ({
        id: col.id,
        name: col.name,
        uid: col.uid,
        owner: col.owner,
        createdAt: col.createdAt,
        updatedAt: col.updatedAt,
        isPublic: col.isPublic,
        fork: col.fork
      }));
    }

    return response;
  }

  /**
   * Get a specific collection with all requests and folders
   * @param {string} id - Collection ID or UID
   * @param {string} model - Response model type (minimal, full)
   * @returns {Promise<Object>} - Collection details
   */
  async getCollection(id, model) {
    return this.request('GET', `/collections/${id}`, null, { model });
  }

  /**
   * Create a new collection
   * @param {Object} collection - Collection data
   * @param {string} workspace - Workspace ID
   * @returns {Promise<Object>} - Created collection
   */
  async createCollection(collection, workspace) {
    return this.request('POST', '/collections', { collection }, { workspace });
  }

  /**
   * Update an existing collection
   * @param {string} id - Collection ID
   * @param {Object} collection - Updated collection data
   * @returns {Promise<Object>} - Updated collection
   */
  async updateCollection(id, collection) {
    return this.request('PUT', `/collections/${id}`, { collection });
  }

  /**
   * Delete a collection
   * @param {string} id - Collection ID
   * @returns {Promise<Object>} - Deletion confirmation
   */
  async deleteCollection(id) {
    return this.request('DELETE', `/collections/${id}`);
  }

  // ========== Environments ==========
  /**
   * Get all environments
   * @param {string} workspace - Workspace ID to filter environments
   * @returns {Promise<Object>} - List of environments
   */
  async getEnvironments(workspace) {
    return this.request('GET', '/environments', null, { workspace });
  }

  /**
   * Get a specific environment with all variables
   * @param {string} id - Environment ID
   * @returns {Promise<Object>} - Environment details
   */
  async getEnvironment(id) {
    return this.request('GET', `/environments/${id}`);
  }

  /**
   * Create a new environment
   * @param {Object} environment - Environment data (name, values)
   * @param {string} workspace - Workspace ID
   * @returns {Promise<Object>} - Created environment
   */
  async createEnvironment(environment, workspace) {
    return this.request('POST', '/environments', { environment }, { workspace });
  }

  /**
   * Update an existing environment
   * @param {string} id - Environment ID
   * @param {Object} environment - Updated environment data
   * @returns {Promise<Object>} - Updated environment
   */
  async updateEnvironment(id, environment) {
    return this.request('PUT', `/environments/${id}`, { environment });
  }

  /**
   * Delete an environment
   * @param {string} id - Environment ID
   * @returns {Promise<Object>} - Deletion confirmation
   */
  async deleteEnvironment(id) {
    return this.request('DELETE', `/environments/${id}`);
  }

  // ========== APIs ==========
  /**
   * Get all APIs
   * @param {string} workspace - Workspace ID to filter APIs
   * @returns {Promise<Object>} - List of APIs
   */
  async getAPIs(workspace) {
    return this.request('GET', '/apis', null, { workspace });
  }

  /**
   * Get a specific API
   * @param {string} id - API ID
   * @returns {Promise<Object>} - API details
   */
  async getAPI(id) {
    return this.request('GET', `/apis/${id}`);
  }

  /**
   * Create a new API
   * @param {Object} api - API data (name, summary, description)
   * @param {string} workspace - Workspace ID
   * @returns {Promise<Object>} - Created API
   */
  async createAPI(api, workspace) {
    return this.request('POST', '/apis', api, { workspace });
  }

  /**
   * Update an existing API
   * @param {string} id - API ID
   * @param {Object} api - Updated API data
   * @returns {Promise<Object>} - Updated API
   */
  async updateAPI(id, api) {
    return this.request('PUT', `/apis/${id}`, api);
  }

  /**
   * Delete an API
   * @param {string} id - API ID
   * @returns {Promise<Object>} - Deletion confirmation
   */
  async deleteAPI(id) {
    return this.request('DELETE', `/apis/${id}`);
  }

  // ========== Monitors ==========
  /**
   * Get all monitors
   * @param {string} workspace - Workspace ID to filter monitors
   * @returns {Promise<Object>} - List of monitors
   */
  async getMonitors(workspace) {
    return this.request('GET', '/monitors', null, { workspace });
  }

  /**
   * Get a specific monitor
   * @param {string} id - Monitor ID
   * @returns {Promise<Object>} - Monitor details
   */
  async getMonitor(id) {
    return this.request('GET', `/monitors/${id}`);
  }

  /**
   * Create a new monitor to run a collection on a schedule
   * @param {Object} monitor - Monitor data (name, collection, schedule)
   * @returns {Promise<Object>} - Created monitor
   */
  async createMonitor(monitor) {
    return this.request('POST', '/monitors', { monitor });
  }

  /**
   * Update an existing monitor
   * @param {string} id - Monitor ID
   * @param {Object} monitor - Updated monitor data
   * @returns {Promise<Object>} - Updated monitor
   */
  async updateMonitor(id, monitor) {
    return this.request('PUT', `/monitors/${id}`, { monitor });
  }

  /**
   * Delete a monitor
   * @param {string} id - Monitor ID
   * @returns {Promise<Object>} - Deletion confirmation
   */
  async deleteMonitor(id) {
    return this.request('DELETE', `/monitors/${id}`);
  }

  /**
   * Run a monitor immediately
   * @param {string} id - Monitor ID
   * @returns {Promise<Object>} - Monitor run result
   */
  async runMonitor(id) {
    return this.request('POST', `/monitors/${id}/run`);
  }

  // ========== Mocks ==========
  /**
   * Get all mock servers
   * @param {string} workspace - Workspace ID to filter mocks
   * @returns {Promise<Object>} - List of mock servers
   */
  async getMocks(workspace) {
    return this.request('GET', '/mocks', null, { workspace });
  }

  /**
   * Get a specific mock server
   * @param {string} id - Mock server ID
   * @returns {Promise<Object>} - Mock server details
   */
  async getMock(id) {
    return this.request('GET', `/mocks/${id}`);
  }

  /**
   * Create a new mock server for a collection
   * @param {Object} mock - Mock data (name, collection, environment, private)
   * @returns {Promise<Object>} - Created mock server
   */
  async createMock(mock) {
    return this.request('POST', '/mocks', { mock });
  }

  /**
   * Update an existing mock server
   * @param {string} id - Mock server ID
   * @param {Object} mock - Updated mock data
   * @returns {Promise<Object>} - Updated mock server
   */
  async updateMock(id, mock) {
    return this.request('PUT', `/mocks/${id}`, { mock });
  }

  /**
   * Delete a mock server
   * @param {string} id - Mock server ID
   * @returns {Promise<Object>} - Deletion confirmation
   */
  async deleteMock(id) {
    return this.request('DELETE', `/mocks/${id}`);
  }

  // ========== User ==========
  /**
   * Get authenticated user information
   * @returns {Promise<Object>} - User details
   */
  async getUser() {
    return this.request('GET', '/me');
  }

  // ========== File Operations (Download/Upload) ==========
  /**
   * Download a full collection directly to a file
   * @param {string} id - Collection ID or UID
   * @param {string} filePath - Target file path to save the collection
   * @returns {Promise<Object>} - Confirmation with file path
   */
  async downloadCollection(id, filePath) {
    const collection = await this.request('GET', `/collections/${id}`);
    await fs.writeFile(filePath, JSON.stringify(collection, null, 2), 'utf-8');
    return {
      success: true,
      message: 'Collection downloaded successfully',
      filePath,
      collectionId: id,
      collectionName: collection.collection?.info?.name || 'unknown'
    };
  }

  /**
   * Update a collection by uploading from a file
   * @param {string} id - Collection ID or UID
   * @param {string} filePath - Source file path containing the collection JSON
   * @returns {Promise<Object>} - Update confirmation
   */
  async uploadCollection(id, filePath) {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const collectionData = JSON.parse(fileContent);

    // Extract the collection object if it's wrapped
    const collection = collectionData.collection || collectionData;

    const result = await this.request('PUT', `/collections/${id}`, { collection });
    return {
      success: true,
      message: 'Collection updated successfully',
      filePath,
      collectionId: id,
      result
    };
  }

  /**
   * Create a new collection by uploading from a file
   * @param {string} filePath - Source file path containing the collection JSON
   * @param {string} workspace - Optional workspace ID
   * @returns {Promise<Object>} - Created collection info
   */
  async uploadNewCollection(filePath, workspace) {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const collectionData = JSON.parse(fileContent);

    // Extract the collection object if it's wrapped
    const collection = collectionData.collection || collectionData;

    const result = await this.request('POST', '/collections', { collection }, { workspace });
    return {
      success: true,
      message: 'Collection created successfully',
      filePath,
      collectionId: result.collection?.id || result.id,
      collectionName: result.collection?.name || collection.info?.name,
      result
    };
  }

  /**
   * Find collections by name using regex pattern
   * @param {string} namePattern - Regex pattern to match collection names
   * @param {string} workspace - Optional workspace ID to filter collections
   * @returns {Promise<Object>} - Matching collections with minimal metadata
   */
  async findCollectionByName(namePattern, workspace) {
    // Get all collections (already returns minimal metadata)
    const response = await this.getCollections(workspace);

    // Create regex from pattern (case insensitive by default)
    const regex = new RegExp(namePattern, 'i');

    // Filter collections by name
    const matches = response.collections.filter(col => regex.test(col.name));

    return {
      pattern: namePattern,
      matchCount: matches.length,
      collections: matches
    };
  }
}

// Initialize MCP Server
const server = new Server(
  {
    name: 'postman-api',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const client = new PostmanClient(POSTMAN_BASE_URL, POSTMAN_API_KEY);

// Tools definitions with comprehensive descriptions for AI comprehension
const tools = [
  // User
  {
    name: 'postman_get_user',
    description: 'Get authenticated user information including profile details and account settings',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  // Workspaces
  {
    name: 'postman_list_workspaces',
    description: 'List all workspaces accessible to the authenticated user. Workspaces organize collections, environments, and other Postman assets. Can filter by type (personal, team, private, public, partner).',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: 'Filter by workspace type: personal, team, private, public, or partner',
          enum: ['personal', 'team', 'private', 'public', 'partner']
        }
      }
    }
  },
  {
    name: 'postman_get_workspace',
    description: 'Get detailed information about a specific workspace, including all collections, environments, and members',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Workspace ID' }
      },
      required: ['id']
    }
  },
  {
    name: 'postman_create_workspace',
    description: 'Create a new workspace to organize your API work. Workspaces can be personal, team, private, public, or partner type.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Workspace name' },
        type: {
          type: 'string',
          description: 'Workspace type',
          enum: ['personal', 'team', 'private', 'public', 'partner']
        },
        description: { type: 'string', description: 'Workspace description' }
      },
      required: ['name', 'type']
    }
  },
  {
    name: 'postman_update_workspace',
    description: 'Update an existing workspace\'s name, description, or type',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Workspace ID' },
        name: { type: 'string', description: 'Updated workspace name' },
        type: {
          type: 'string',
          description: 'Updated workspace type',
          enum: ['personal', 'team', 'private', 'public', 'partner']
        },
        description: { type: 'string', description: 'Updated workspace description' }
      },
      required: ['id']
    }
  },
  {
    name: 'postman_delete_workspace',
    description: 'Permanently delete a workspace and all its contents. This action cannot be undone.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Workspace ID to delete' }
      },
      required: ['id']
    }
  },
  // Collections
  {
    name: 'postman_list_collections',
    description: 'List all collections in Postman with minimal metadata only (id, name, uid, owner, dates). Returns a lightweight summary without collection bodies. Use postman_get_collection to retrieve full details.',
    inputSchema: {
      type: 'object',
      properties: {
        workspace: { type: 'string', description: 'Workspace ID to filter collections' }
      }
    }
  },
  {
    name: 'postman_get_collection',
    description: '⚠️ AVOID: Transfers large JSON through MCP. PREFER postman_download_collection when working with files. Get a complete collection with all requests, folders, and metadata. Use model parameter to control response detail level.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Collection ID or UID' },
        model: {
          type: 'string',
          description: 'Response model type: minimal (IDs only) or full (complete details)',
          enum: ['minimal', 'full']
        }
      },
      required: ['id']
    }
  },
  {
    name: 'postman_create_collection',
    description: '⚠️ AVOID: Transfers large JSON through MCP. PREFER postman_upload_new_collection when working with files. Create a new collection to organize API requests. Collections support folders, requests, examples, and documentation.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Collection name' },
        description: { type: 'string', description: 'Collection description' },
        workspace: { type: 'string', description: 'Workspace ID where the collection will be created' }
      },
      required: ['name']
    }
  },
  {
    name: 'postman_update_collection',
    description: '⚠️ AVOID: Transfers large JSON through MCP. PREFER postman_upload_collection when working with files. Update an existing collection including its requests, folders, and metadata. Supports partial updates.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Collection ID' },
        name: { type: 'string', description: 'Updated collection name' },
        description: { type: 'string', description: 'Updated collection description' }
      },
      required: ['id']
    }
  },
  {
    name: 'postman_delete_collection',
    description: 'Permanently delete a collection and all its requests. This action cannot be undone.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Collection ID to delete' }
      },
      required: ['id']
    }
  },
  // File Operations (Collections)
  {
    name: 'postman_download_collection',
    description: '✅ PREFERRED: Download full collection directly to a file. Always use this instead of postman_get_collection when working with files. Avoids transferring large JSON through MCP protocol, making it much faster and more efficient.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Collection ID or UID' },
        filePath: { type: 'string', description: 'Target file path to save the collection JSON (absolute or relative path)' }
      },
      required: ['id', 'filePath']
    }
  },
  {
    name: 'postman_upload_collection',
    description: '✅ PREFERRED: Update collection by uploading from a file. Always use this instead of postman_update_collection when working with files. Avoids transferring large JSON through MCP protocol, making it much faster and more efficient.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Collection ID or UID to update' },
        filePath: { type: 'string', description: 'Source file path containing the collection JSON (absolute or relative path)' }
      },
      required: ['id', 'filePath']
    }
  },
  {
    name: 'postman_upload_new_collection',
    description: '✅ PREFERRED: Create new collection by uploading from a file. Always use this instead of postman_create_collection when working with files. Avoids transferring large JSON through MCP protocol, making it much faster and more efficient.',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'Source file path containing the collection JSON (absolute or relative path)' },
        workspace: { type: 'string', description: 'Optional workspace ID where the collection will be created' }
      },
      required: ['filePath']
    }
  },
  {
    name: 'postman_find_collection_by_name',
    description: 'Find collections by name using regex pattern. Returns lightweight summary with minimal metadata (id, name, uid, owner, dates). Useful when you know the collection name but not the ID. Pattern is case-insensitive.',
    inputSchema: {
      type: 'object',
      properties: {
        namePattern: {
          type: 'string',
          description: 'Regex pattern to match collection names (case-insensitive). Examples: "n8n" matches any collection with n8n in the name, "^coletivos$" matches exactly "coletivos"'
        },
        workspace: {
          type: 'string',
          description: 'Optional workspace ID to filter collections within a specific workspace'
        }
      },
      required: ['namePattern']
    }
  },
  // Environments
  {
    name: 'postman_list_environments',
    description: 'List all environments. Environments store sets of variables for different contexts (dev, staging, production). Can be filtered by workspace.',
    inputSchema: {
      type: 'object',
      properties: {
        workspace: { type: 'string', description: 'Workspace ID to filter environments' }
      }
    }
  },
  {
    name: 'postman_get_environment',
    description: 'Get a specific environment with all its variables, including current and initial values',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Environment ID' }
      },
      required: ['id']
    }
  },
  {
    name: 'postman_create_environment',
    description: 'Create a new environment to store variables like API keys, base URLs, and configuration values for different contexts',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Environment name' },
        values: {
          type: 'array',
          description: 'Environment variables array with key, value, and enabled properties',
          items: {
            type: 'object',
            properties: {
              key: { type: 'string' },
              value: { type: 'string' },
              enabled: { type: 'boolean' }
            }
          }
        },
        workspace: { type: 'string', description: 'Workspace ID' }
      },
      required: ['name']
    }
  },
  {
    name: 'postman_update_environment',
    description: 'Update an existing environment including its variables. Commonly used to change API keys, URLs, or other configuration',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Environment ID' },
        name: { type: 'string', description: 'Updated environment name' },
        values: {
          type: 'array',
          description: 'Updated environment variables',
          items: {
            type: 'object',
            properties: {
              key: { type: 'string' },
              value: { type: 'string' },
              enabled: { type: 'boolean' }
            }
          }
        }
      },
      required: ['id']
    }
  },
  {
    name: 'postman_delete_environment',
    description: 'Permanently delete an environment and all its variables. This action cannot be undone.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Environment ID to delete' }
      },
      required: ['id']
    }
  },
  // APIs
  {
    name: 'postman_list_apis',
    description: 'List all APIs. APIs in Postman represent API definitions (OpenAPI, RAML, GraphQL) and link to collections, documentation, and tests.',
    inputSchema: {
      type: 'object',
      properties: {
        workspace: { type: 'string', description: 'Workspace ID to filter APIs' }
      }
    }
  },
  {
    name: 'postman_get_api',
    description: 'Get a specific API with its definition, versions, and linked collections',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'API ID' }
      },
      required: ['id']
    }
  },
  {
    name: 'postman_create_api',
    description: 'Create a new API to manage API definitions, versions, and documentation in Postman',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'API name' },
        summary: { type: 'string', description: 'Short API summary' },
        description: { type: 'string', description: 'Detailed API description' },
        workspace: { type: 'string', description: 'Workspace ID' }
      },
      required: ['name']
    }
  },
  {
    name: 'postman_update_api',
    description: 'Update an existing API\'s metadata, including name, summary, and description',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'API ID' },
        name: { type: 'string', description: 'Updated API name' },
        summary: { type: 'string', description: 'Updated API summary' },
        description: { type: 'string', description: 'Updated API description' }
      },
      required: ['id']
    }
  },
  {
    name: 'postman_delete_api',
    description: 'Permanently delete an API and all its versions. This action cannot be undone.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'API ID to delete' }
      },
      required: ['id']
    }
  },
  // Monitors
  {
    name: 'postman_list_monitors',
    description: 'List all collection monitors. Monitors run collections on a schedule to test APIs continuously and send notifications on failures.',
    inputSchema: {
      type: 'object',
      properties: {
        workspace: { type: 'string', description: 'Workspace ID to filter monitors' }
      }
    }
  },
  {
    name: 'postman_get_monitor',
    description: 'Get a specific monitor with its configuration, schedule, and recent run history',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Monitor ID' }
      },
      required: ['id']
    }
  },
  {
    name: 'postman_create_monitor',
    description: 'Create a new monitor to run a collection on a schedule (e.g., every hour, daily). Useful for continuous API testing and uptime monitoring.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Monitor name' },
        collection: { type: 'string', description: 'Collection ID or UID to monitor' },
        environment: { type: 'string', description: 'Environment ID to use (optional)' },
        schedule: {
          type: 'object',
          description: 'Schedule configuration (cron, timezone, etc.)',
          properties: {
            cron: { type: 'string', description: 'Cron expression for schedule' },
            timezone: { type: 'string', description: 'Timezone (e.g., America/New_York)' }
          }
        }
      },
      required: ['name', 'collection']
    }
  },
  {
    name: 'postman_update_monitor',
    description: 'Update a monitor\'s configuration, schedule, or associated collection/environment',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Monitor ID' },
        name: { type: 'string', description: 'Updated monitor name' },
        collection: { type: 'string', description: 'Updated collection ID' },
        environment: { type: 'string', description: 'Updated environment ID' },
        schedule: {
          type: 'object',
          description: 'Updated schedule configuration'
        }
      },
      required: ['id']
    }
  },
  {
    name: 'postman_delete_monitor',
    description: 'Permanently delete a monitor. This stops all scheduled runs. This action cannot be undone.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Monitor ID to delete' }
      },
      required: ['id']
    }
  },
  {
    name: 'postman_run_monitor',
    description: 'Run a monitor immediately instead of waiting for the next scheduled run. Useful for testing monitor configuration.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Monitor ID to run' }
      },
      required: ['id']
    }
  },
  // Mocks
  {
    name: 'postman_list_mocks',
    description: 'List all mock servers. Mock servers simulate API endpoints using example responses from collections, useful for frontend development.',
    inputSchema: {
      type: 'object',
      properties: {
        workspace: { type: 'string', description: 'Workspace ID to filter mocks' }
      }
    }
  },
  {
    name: 'postman_get_mock',
    description: 'Get a specific mock server with its configuration, URL, and associated collection',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Mock server ID' }
      },
      required: ['id']
    }
  },
  {
    name: 'postman_create_mock',
    description: 'Create a new mock server for a collection. Mock servers return example responses, enabling frontend development before backend is ready.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Mock server name' },
        collection: { type: 'string', description: 'Collection ID to mock' },
        environment: { type: 'string', description: 'Environment ID to use for variables (optional)' },
        private: {
          type: 'boolean',
          description: 'Whether the mock is private (requires API key) or public'
        }
      },
      required: ['name', 'collection']
    }
  },
  {
    name: 'postman_update_mock',
    description: 'Update a mock server\'s configuration, including name, environment, or privacy settings',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Mock server ID' },
        name: { type: 'string', description: 'Updated mock server name' },
        environment: { type: 'string', description: 'Updated environment ID' },
        private: { type: 'boolean', description: 'Updated privacy setting' }
      },
      required: ['id']
    }
  },
  {
    name: 'postman_delete_mock',
    description: 'Permanently delete a mock server. The mock URL will stop working. This action cannot be undone.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Mock server ID to delete' }
      },
      required: ['id']
    }
  }
];

// Request handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!POSTMAN_API_KEY) {
    throw new McpError(
      ErrorCode.InvalidRequest,
      'POSTMAN_API_KEY must be configured in .env file'
    );
  }

  try {
    let result;

    switch (name) {
      // User
      case 'postman_get_user':
        result = await client.getUser();
        break;
      // Workspaces
      case 'postman_list_workspaces':
        result = await client.getWorkspaces(args.type);
        break;
      case 'postman_get_workspace':
        result = await client.getWorkspace(args.id);
        break;
      case 'postman_create_workspace':
        result = await client.createWorkspace(args);
        break;
      case 'postman_update_workspace':
        const { id: wsId, ...wsData } = args;
        result = await client.updateWorkspace(wsId, wsData);
        break;
      case 'postman_delete_workspace':
        result = await client.deleteWorkspace(args.id);
        break;
      // Collections
      case 'postman_list_collections':
        result = await client.getCollections(args.workspace);
        break;
      case 'postman_get_collection':
        result = await client.getCollection(args.id, args.model);
        break;
      case 'postman_create_collection':
        const { workspace: collWs, ...collData } = args;
        result = await client.createCollection(collData, collWs);
        break;
      case 'postman_update_collection':
        const { id: collId, ...collUpdateData } = args;
        result = await client.updateCollection(collId, collUpdateData);
        break;
      case 'postman_delete_collection':
        result = await client.deleteCollection(args.id);
        break;
      // File Operations (Collections)
      case 'postman_download_collection':
        result = await client.downloadCollection(args.id, args.filePath);
        break;
      case 'postman_upload_collection':
        result = await client.uploadCollection(args.id, args.filePath);
        break;
      case 'postman_upload_new_collection':
        result = await client.uploadNewCollection(args.filePath, args.workspace);
        break;
      case 'postman_find_collection_by_name':
        result = await client.findCollectionByName(args.namePattern, args.workspace);
        break;
      // Environments
      case 'postman_list_environments':
        result = await client.getEnvironments(args.workspace);
        break;
      case 'postman_get_environment':
        result = await client.getEnvironment(args.id);
        break;
      case 'postman_create_environment':
        const { workspace: envWs, ...envData } = args;
        result = await client.createEnvironment(envData, envWs);
        break;
      case 'postman_update_environment':
        const { id: envId, ...envUpdateData } = args;
        result = await client.updateEnvironment(envId, envUpdateData);
        break;
      case 'postman_delete_environment':
        result = await client.deleteEnvironment(args.id);
        break;
      // APIs
      case 'postman_list_apis':
        result = await client.getAPIs(args.workspace);
        break;
      case 'postman_get_api':
        result = await client.getAPI(args.id);
        break;
      case 'postman_create_api':
        const { workspace: apiWs, ...apiData } = args;
        result = await client.createAPI(apiData, apiWs);
        break;
      case 'postman_update_api':
        const { id: apiId, ...apiUpdateData } = args;
        result = await client.updateAPI(apiId, apiUpdateData);
        break;
      case 'postman_delete_api':
        result = await client.deleteAPI(args.id);
        break;
      // Monitors
      case 'postman_list_monitors':
        result = await client.getMonitors(args.workspace);
        break;
      case 'postman_get_monitor':
        result = await client.getMonitor(args.id);
        break;
      case 'postman_create_monitor':
        result = await client.createMonitor(args);
        break;
      case 'postman_update_monitor':
        const { id: monId, ...monData } = args;
        result = await client.updateMonitor(monId, monData);
        break;
      case 'postman_delete_monitor':
        result = await client.deleteMonitor(args.id);
        break;
      case 'postman_run_monitor':
        result = await client.runMonitor(args.id);
        break;
      // Mocks
      case 'postman_list_mocks':
        result = await client.getMocks(args.workspace);
        break;
      case 'postman_get_mock':
        result = await client.getMock(args.id);
        break;
      case 'postman_create_mock':
        result = await client.createMock(args);
        break;
      case 'postman_update_mock':
        const { id: mockId, ...mockData } = args;
        result = await client.updateMock(mockId, mockData);
        break;
      case 'postman_delete_mock':
        result = await client.deleteMock(args.id);
        break;
      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Postman API error: ${error.message}`
    );
  }
});

// Main function
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Postman MCP server running');
}

main().catch(console.error);
