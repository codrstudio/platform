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
import https from 'https';
import http from 'http';
import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import FormData from 'form-data';
import mime from 'mime-types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const N8N_BASE_URL = process.env.N8N_BASE_URL || '';
const N8N_API_KEY = process.env.N8N_API_KEY;
const AUTH_METHOD = process.env.AUTH_METHOD || 'header'; // 'header' or 'cookie'

const CACHE_DIR = join(__dirname, '.cache');
const SCHEMA_DIR = join(__dirname, 'schema');
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

// Cache manager class
class CacheManager {
  constructor(cacheDir) {
    this.cacheDir = cacheDir;
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000); // Cleanup every minute
  }

  getCacheKey(method, path, params) {
    const data = `${method}:${path}:${JSON.stringify(params || {})}`;
    return crypto.createHash('md5').update(data).digest('hex');
  }

  getCachePath(key) {
    return join(this.cacheDir, `${key}.json`);
  }

  get(key) {
    try {
      const cachePath = this.getCachePath(key);
      if (fs.existsSync(cachePath)) {
        const data = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
        if (Date.now() - data.timestamp < CACHE_TTL) {
          return data.response;
        }
        fs.unlinkSync(cachePath); // Delete expired cache
      }
    } catch (error) {
      console.error('Cache read error:', error);
    }
    return null;
  }

  set(key, response) {
    try {
      const cachePath = this.getCachePath(key);
      fs.writeFileSync(cachePath, JSON.stringify({
        timestamp: Date.now(),
        response
      }));
    } catch (error) {
      console.error('Cache write error:', error);
    }
  }

  cleanup() {
    try {
      const files = fs.readdirSync(this.cacheDir);
      const now = Date.now();
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = join(this.cacheDir, file);
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          if (now - data.timestamp > CACHE_TTL) {
            fs.unlinkSync(filePath);
          }
        }
      }
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }

  destroy() {
    clearInterval(this.cleanupInterval);
  }
}

// Projection utility
function applyProjection(data, fields) {
  if (!fields || fields.length === 0) return data;

  const project = (obj) => {
    if (!obj) return obj;
    if (Array.isArray(obj)) {
      return obj.map(item => project(item));
    }
    if (typeof obj === 'object') {
      const result = {};
      for (const field of fields) {
        if (field.includes('.')) {
          // Handle nested fields like "settings.saveDataSuccessExecution"
          const parts = field.split('.');
          let value = obj;
          for (const part of parts) {
            value = value?.[part];
          }
          if (value !== undefined) {
            const firstPart = parts[0];
            if (!result[firstPart]) result[firstPart] = {};
            let target = result[firstPart];
            for (let i = 1; i < parts.length - 1; i++) {
              if (!target[parts[i]]) target[parts[i]] = {};
              target = target[parts[i]];
            }
            target[parts[parts.length - 1]] = value;
          }
        } else if (obj.hasOwnProperty(field)) {
          result[field] = obj[field];
        }
      }
      return result;
    }
    return obj;
  };

  // Special handling for n8n API responses with {data: [...]} structure
  if (data && typeof data === 'object' && Array.isArray(data.data)) {
    const result = {};

    // Project each item in the data array
    result.data = data.data.map(item => project(item));

    // Preserve other root-level properties (like nextCursor, pagination, etc.)
    for (const key in data) {
      if (key !== 'data') {
        result[key] = data[key];
      }
    }

    return result;
  }

  return project(data);
}

// Schema manager
class SchemaManager {
  constructor(schemaDir) {
    this.schemaDir = schemaDir;
  }

  getVersions() {
    try {
      if (!fs.existsSync(this.schemaDir)) return [];
      return fs.readdirSync(this.schemaDir)
        .filter(dir => fs.statSync(join(this.schemaDir, dir)).isDirectory());
    } catch (error) {
      console.error('Schema versions error:', error);
      return [];
    }
  }

  getSchemas(version = '1.0.0') {
    try {
      const versionDir = join(this.schemaDir, version);
      if (!fs.existsSync(versionDir)) return [];

      return fs.readdirSync(versionDir)
        .filter(file => file.endsWith('.json'))
        .map(file => ({
          name: file.replace('.json', ''),
          version,
          path: join(versionDir, file)
        }));
    } catch (error) {
      console.error('Schema list error:', error);
      return [];
    }
  }

  getSchema(name, version = '1.0.0') {
    try {
      const schemaPath = join(this.schemaDir, version, `${name}.json`);
      if (fs.existsSync(schemaPath)) {
        return JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
      }
    } catch (error) {
      console.error('Schema read error:', error);
    }
    return null;
  }
}

const cache = new CacheManager(CACHE_DIR);
const schemaManager = new SchemaManager(SCHEMA_DIR);

// File utilities
function getMimeType(filePath) {
  return mime.lookup(filePath) || 'application/octet-stream';
}

function validateFilePath(filePath) {
  // Prevent directory traversal
  const normalized = path.normalize(filePath);
  if (normalized.includes('..')) {
    throw new Error('Invalid file path: directory traversal detected');
  }
  return normalized;
}

function ensureDirectoryExists(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

class N8nClient {
  constructor(baseUrl, apiKey, authMethod) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
    this.authMethod = authMethod;
  }

  async request(method, path, body = null, queryParams = {}, useCache = true) {
    // Try to get from cache for GET requests
    if (method === 'GET' && useCache) {
      const cacheKey = cache.getCacheKey(method, path, { body, queryParams });
      const cached = cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

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
      }
    };

    // Handle authentication
    if (this.authMethod === 'cookie' && this.apiKey) {
      // Cookie-based authentication with API key
      options.headers['Cookie'] = `n8n-api-key=${this.apiKey}`;
    } else if (this.apiKey) {
      // Header-based authentication with API key (default)
      options.headers['X-N8N-API-KEY'] = this.apiKey;
    }

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
              // Save to cache for successful GET requests
              if (method === 'GET' && useCache) {
                const cacheKey = cache.getCacheKey(method, path, { body, queryParams });
                cache.set(cacheKey, parsed);
              }
              resolve(parsed);
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${parsed.message || data}`));
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

  // Workflows
  async getWorkflows(limit, active, tags, workflowIds, name, cursor) {
    const params = {};
    if (limit !== undefined) params.limit = limit;
    if (active !== undefined) params.active = active;
    if (tags) params.tags = tags;
    if (workflowIds) params.workflowIds = workflowIds;
    if (name) params.name = name;
    if (cursor) params.cursor = cursor;

    return this.request('GET', '/api/v1/workflows', null, params);
  }

  async createWorkflow(workflow) {
    return this.request('POST', '/api/v1/workflows', workflow);
  }

  async getWorkflow(id) {
    return this.request('GET', `/api/v1/workflows/${id}`);
  }

  async updateWorkflow(id, workflow) {
    return this.request('PUT', `/api/v1/workflows/${id}`, workflow);
  }

  async deleteWorkflow(id) {
    return this.request('DELETE', `/api/v1/workflows/${id}`);
  }

  async activateWorkflow(id) {
    return this.request('POST', `/api/v1/workflows/${id}/activate`);
  }

  async deactivateWorkflow(id) {
    return this.request('POST', `/api/v1/workflows/${id}/deactivate`);
  }

  // Executions
  async getExecutions(limit, status, workflowId) {
    return this.request('GET', '/api/v1/executions', null, { limit, status, workflowId });
  }

  async getExecution(id, includeData) {
    return this.request('GET', `/api/v1/executions/${id}`, null, { includeData });
  }

  async deleteExecution(id) {
    return this.request('DELETE', `/api/v1/executions/${id}`);
  }

  // Execute workflow
  async executeWorkflow(workflowId, data) {
    return this.request('POST', `/api/v1/workflows/${workflowId}/execute`, data);
  }

  // Credentials
  async getCredentials(limit) {
    return this.request('GET', '/api/v1/credentials', null, { limit });
  }

  async createCredential(credential) {
    return this.request('POST', '/api/v1/credentials', credential);
  }

  async getCredential(id, includeData) {
    return this.request('GET', `/api/v1/credentials/${id}`, null, { includeData });
  }

  async updateCredential(id, credential) {
    return this.request('PUT', `/api/v1/credentials/${id}`, credential);
  }

  async deleteCredential(id) {
    return this.request('DELETE', `/api/v1/credentials/${id}`);
  }

  // Credential Types
  async getCredentialTypes() {
    return this.request('GET', '/api/v1/credential-types');
  }

  // Users
  async getUsers(limit, includeRole) {
    return this.request('GET', '/api/v1/users', null, { limit, includeRole });
  }

  async getUser(id, includeRole) {
    return this.request('GET', `/api/v1/users/${id}`, null, { includeRole });
  }

  // Source Control
  async getSourceControlStatus() {
    return this.request('GET', '/api/v1/source-control/status');
  }

  async pullSourceControl(force) {
    return this.request('POST', '/api/v1/source-control/pull', { force });
  }

  async pushSourceControl(force, commitMessage) {
    return this.request('POST', '/api/v1/source-control/push', { force, commitMessage });
  }

  // Variables
  async getVariables(limit) {
    return this.request('GET', '/api/v1/variables', null, { limit });
  }

  async createVariable(variable) {
    return this.request('POST', '/api/v1/variables', variable);
  }

  async getVariable(id) {
    return this.request('GET', `/api/v1/variables/${id}`);
  }

  async updateVariable(id, variable) {
    return this.request('PUT', `/api/v1/variables/${id}`, variable);
  }

  async deleteVariable(id) {
    return this.request('DELETE', `/api/v1/variables/${id}`);
  }

  // Tags
  async getTags(limit) {
    return this.request('GET', '/api/v1/tags', null, { limit });
  }

  async createTag(tag) {
    return this.request('POST', '/api/v1/tags', tag);
  }

  async getTag(id) {
    return this.request('GET', `/api/v1/tags/${id}`);
  }

  async updateTag(id, tag) {
    return this.request('PUT', `/api/v1/tags/${id}`, tag);
  }

  async deleteTag(id) {
    return this.request('DELETE', `/api/v1/tags/${id}`);
  }

  // Audit
  async getAuditLogs(limit, resource, operation, userId, startDate, endDate) {
    return this.request('GET', '/api/v1/audit', null, {
      limit, resource, operation, userId, startDate, endDate
    });
  }

  // External Secrets
  async getExternalSecrets() {
    return this.request('GET', '/api/v1/external-secrets');
  }

  async getExternalSecretsProviders() {
    return this.request('GET', '/api/v1/external-secrets/providers');
  }

  async updateExternalSecretsProvider(provider, config) {
    return this.request('PUT', `/api/v1/external-secrets/providers/${provider}`, config);
  }

  async testExternalSecretsProvider(provider) {
    return this.request('POST', `/api/v1/external-secrets/providers/${provider}/test`);
  }

  async updateExternalSecretsSettings(settings) {
    return this.request('POST', '/api/v1/external-secrets/settings', settings);
  }

  async reloadExternalSecrets() {
    return this.request('POST', '/api/v1/external-secrets/reload');
  }

  // LDAP
  async getLdapConfig() {
    return this.request('GET', '/api/v1/ldap/config');
  }

  async updateLdapConfig(config) {
    return this.request('PUT', '/api/v1/ldap/config', config);
  }

  async testLdapConnection() {
    return this.request('POST', '/api/v1/ldap/test-connection');
  }

  async syncLdap(type) {
    return this.request('POST', '/api/v1/ldap/sync', { type });
  }

  // File operations
  async uploadFileToWorkflow(workflowId, filePath, fieldName = 'file', override = false) {
    const validatedPath = validateFilePath(filePath);

    if (!fs.existsSync(validatedPath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const stats = fs.statSync(validatedPath);
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (stats.size > maxSize) {
      throw new Error(`File too large for base64 upload (${stats.size} bytes). Use multipart upload for files > 10MB`);
    }

    const fileContent = fs.readFileSync(validatedPath);
    const base64 = fileContent.toString('base64');
    const fileName = path.basename(validatedPath);
    const mimeType = getMimeType(validatedPath);

    return this.request('POST', `/api/v1/workflows/${workflowId}/execute`, {
      data: {
        [fieldName]: {
          fileName,
          mimeType,
          data: base64
        }
      },
      override
    });
  }

  async uploadFileMultipart(webhookPath, filePath, additionalData = {}, override = false) {
    const validatedPath = validateFilePath(filePath);

    if (!fs.existsSync(validatedPath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const form = new FormData();
    form.append('file', fs.createReadStream(validatedPath));

    // Add additional form data
    Object.entries(additionalData).forEach(([key, value]) => {
      form.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
    });

    if (override !== undefined) {
      form.append('override', override.toString());
    }

    const url = new URL(`${this.baseUrl}${webhookPath}`);

    return new Promise((resolve, reject) => {
      const protocol = url.protocol === 'https:' ? https : http;

      const options = {
        method: 'POST',
        headers: {
          ...form.getHeaders(),
        }
      };

      // Handle authentication
      if (this.authMethod === 'cookie' && this.apiKey) {
        options.headers['Cookie'] = `n8n-api-key=${this.apiKey}`;
      } else if (this.apiKey) {
        options.headers['X-N8N-API-KEY'] = this.apiKey;
      }

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
              reject(new Error(`HTTP ${res.statusCode}: ${parsed.message || data}`));
            }
          } catch (e) {
            reject(new Error(`Failed to parse response: ${data}`));
          }
        });
      });

      req.on('error', reject);
      form.pipe(req);
    });
  }

  async downloadExecutionData(executionId, outputPath, override = false) {
    const validatedPath = validateFilePath(outputPath);

    // Check if file exists and override is false
    if (fs.existsSync(validatedPath) && !override) {
      throw new Error(`File already exists: ${outputPath}. Use override=true to overwrite`);
    }

    const execution = await this.getExecution(executionId, true);

    ensureDirectoryExists(validatedPath);

    // Try to extract binary data if present
    let dataToWrite;

    if (execution.data?.resultData?.runData) {
      const runData = execution.data.resultData.runData;
      const firstNode = Object.keys(runData)[0];
      const nodeData = runData[firstNode]?.[0]?.data;

      if (nodeData?.main?.[0]?.[0]?.binary) {
        // Binary data present - extract first binary field
        const binaryData = nodeData.main[0][0].binary;
        const firstBinaryKey = Object.keys(binaryData)[0];
        const binary = binaryData[firstBinaryKey];

        if (binary.data) {
          // Decode base64
          const buffer = Buffer.from(binary.data, 'base64');
          fs.writeFileSync(validatedPath, buffer);
          return {
            success: true,
            path: validatedPath,
            mimeType: binary.mimeType,
            size: buffer.length
          };
        }
      }

      // No binary data - save as JSON
      dataToWrite = JSON.stringify(execution, null, 2);
    } else {
      dataToWrite = JSON.stringify(execution, null, 2);
    }

    fs.writeFileSync(validatedPath, dataToWrite);

    return {
      success: true,
      path: validatedPath,
      size: dataToWrite.length
    };
  }

  async createWorkflowWithOverride(workflow, override = false) {
    if (override) {
      // Check if workflow with same name exists
      const existing = await this.getWorkflows(undefined, undefined, undefined, undefined, workflow.name);

      if (existing.data && existing.data.length > 0) {
        // Update existing workflow
        const existingId = existing.data[0].id;
        return this.updateWorkflow(existingId, workflow);
      }
    }

    // Create new workflow
    return this.createWorkflow(workflow);
  }
}

const server = new Server(
  {
    name: 'n8n-api',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const client = new N8nClient(N8N_BASE_URL, N8N_API_KEY, AUTH_METHOD);

// Tools definitions
const tools = [
  // Schema exploration tools
  {
    name: 'n8n_explore_schema',
    description: 'List available API schemas and versions',
    inputSchema: {
      type: 'object',
      properties: {
        version: { type: 'string', description: 'Schema version (default: 1.0.0)' }
      }
    }
  },
  {
    name: 'n8n_get_schema',
    description: 'Get detailed schema for a specific endpoint',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Schema name (e.g., workflows, executions)' },
        version: { type: 'string', description: 'Schema version (default: 1.0.0)' }
      },
      required: ['name']
    }
  },
  // Workflows
  {
    name: 'n8n_list_workflows',
    description: '⚠️ WARNING: Can transfer large data. ALWAYS use projection parameter to reduce response size. PREFER n8n_download_workflows_bulk for backup operations. List workflows with filtering, search and pagination capabilities',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Filter by workflow name (exact or partial match)'
        },
        limit: {
          type: 'number',
          description: 'Max results per page (default: 10, max: 250)'
        },
        cursor: {
          type: 'string',
          description: 'Pagination cursor from previous response nextCursor field'
        },
        active: {
          type: 'boolean',
          description: 'Filter by active status (true = active, false = inactive)'
        },
        tags: {
          type: 'string',
          description: 'Comma-separated list of tag names to filter'
        },
        workflowIds: {
          type: 'string',
          description: 'Comma-separated list of specific workflow IDs to retrieve'
        },
        projection: {
          type: 'array',
          description: 'IMPORTANT: Always use projection to reduce response size and token consumption. Fields to include in response (e.g., ["id", "name", "active"]). Common projections: ["id", "name"] for selection, ["id", "name", "active", "tags"] for listing, ["id", "name", "nodes", "connections"] for editing. See schema for all available fields.',
          items: { type: 'string' }
        }
      },
      examples: [
        {
          title: 'Efficient listing (recommended)',
          value: { projection: ["id", "name", "active"], limit: 20 }
        },
        {
          title: 'Find workflow by name',
          value: { name: 'coletivos-requisicao', projection: ["id", "name"], limit: 1 }
        },
        {
          title: 'List active workflows with tag',
          value: { active: true, tags: 'production,critical', projection: ["id", "name", "active", "tags"] }
        },
        {
          title: 'For backup operations',
          value: { /* Use n8n_download_workflows_bulk instead of this method for better performance */ }
        }
      ]
    }
  },
  {
    name: 'n8n_create_workflow',
    description: 'Create a new workflow (with optional override to update existing)',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Workflow name' },
        nodes: { type: 'array', description: 'Workflow nodes' },
        connections: { type: 'object', description: 'Node connections' },
        active: { type: 'boolean', description: 'Whether workflow is active' },
        settings: { type: 'object', description: 'Workflow settings' },
        tags: { type: 'array', description: 'Workflow tags' },
        override: { type: 'boolean', description: 'If true, updates existing workflow with same name' }
      },
      required: ['name', 'nodes', 'connections']
    }
  },
  {
    name: 'n8n_get_workflow',
    description: '⚠️ AVOID: Transfers large workflow JSON through MCP. PREFER n8n_download_workflow when saving to file. Get a workflow by ID with optional field projection',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Workflow ID' },
        projection: {
          type: 'array',
          description: 'Fields to include in response (e.g., ["id", "name", "nodes"]). See schema for available fields.',
          items: { type: 'string' }
        }
      },
      required: ['id']
    }
  },
  {
    name: 'n8n_update_workflow',
    description: '⚠️ AVOID: Transfers large workflow JSON through MCP. PREFER n8n_upload_workflow when updating from file. Update a workflow',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Workflow ID' },
        name: { type: 'string', description: 'Workflow name' },
        nodes: { type: 'array', description: 'Workflow nodes' },
        connections: { type: 'object', description: 'Node connections' },
        active: { type: 'boolean', description: 'Whether workflow is active' },
        settings: { type: 'object', description: 'Workflow settings' },
        tags: { type: 'array', description: 'Workflow tags' }
      },
      required: ['id']
    }
  },
  {
    name: 'n8n_delete_workflow',
    description: 'Delete a workflow',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Workflow ID' }
      },
      required: ['id']
    }
  },
  {
    name: 'n8n_activate_workflow',
    description: 'Activate a workflow',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Workflow ID' }
      },
      required: ['id']
    }
  },
  {
    name: 'n8n_deactivate_workflow',
    description: 'Deactivate a workflow',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Workflow ID' }
      },
      required: ['id']
    }
  },
  {
    name: 'n8n_execute_workflow',
    description: 'Execute a workflow',
    inputSchema: {
      type: 'object',
      properties: {
        workflowId: { type: 'string', description: 'Workflow ID' },
        data: { type: 'object', description: 'Input data for the workflow' }
      },
      required: ['workflowId']
    }
  },
  // Executions
  {
    name: 'n8n_list_executions',
    description: 'List workflow executions with optional field projection. IMPORTANT: Always use projection to reduce response size.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Max number of results (recommended: 10-20 max)' },
        status: { type: 'string', description: 'Filter by status (waiting, running, success, error)' },
        workflowId: { type: 'string', description: 'Filter by workflow ID' },
        projection: {
          type: 'array',
          description: 'IMPORTANT: Always use projection to reduce response size. Fields to include in response (e.g., ["id", "status", "startedAt"]). Common projections: ["id", "status", "workflowId", "startedAt", "stoppedAt"] for monitoring. See schema for available fields.',
          items: { type: 'string' }
        }
      }
    }
  },
  {
    name: 'n8n_get_execution',
    description: '⚠️ AVOID: With includeData=true, transfers large execution data through MCP. PREFER n8n_download_execution when saving to file. Get an execution by ID with optional field projection',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Execution ID' },
        includeData: { type: 'boolean', description: 'Include execution data' },
        projection: {
          type: 'array',
          description: 'Fields to include in response (e.g., ["id", "status", "workflowId"]). See schema for available fields.',
          items: { type: 'string' }
        }
      },
      required: ['id']
    }
  },
  {
    name: 'n8n_delete_execution',
    description: 'Delete an execution',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Execution ID' }
      },
      required: ['id']
    }
  },
  // Credentials
  {
    name: 'n8n_list_credentials',
    description: 'List all credentials',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Max number of results' }
      }
    }
  },
  {
    name: 'n8n_create_credential',
    description: 'Create a new credential',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Credential name' },
        type: { type: 'string', description: 'Credential type' },
        data: { type: 'object', description: 'Credential data (encrypted)' }
      },
      required: ['name', 'type', 'data']
    }
  },
  {
    name: 'n8n_get_credential',
    description: 'Get a credential by ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Credential ID' },
        includeData: { type: 'boolean', description: 'Include credential data' }
      },
      required: ['id']
    }
  },
  {
    name: 'n8n_update_credential',
    description: 'Update a credential',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Credential ID' },
        name: { type: 'string', description: 'Credential name' },
        type: { type: 'string', description: 'Credential type' },
        data: { type: 'object', description: 'Credential data (encrypted)' }
      },
      required: ['id']
    }
  },
  {
    name: 'n8n_delete_credential',
    description: 'Delete a credential',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Credential ID' }
      },
      required: ['id']
    }
  },
  {
    name: 'n8n_get_credential_types',
    description: 'Get all available credential types',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  // Users
  {
    name: 'n8n_list_users',
    description: 'List all users',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Max number of results' },
        includeRole: { type: 'boolean', description: 'Include user role information' }
      }
    }
  },
  {
    name: 'n8n_get_user',
    description: 'Get a user by ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'User ID' },
        includeRole: { type: 'boolean', description: 'Include user role information' }
      },
      required: ['id']
    }
  },
  // Variables
  {
    name: 'n8n_list_variables',
    description: 'List all variables',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Max number of results' }
      }
    }
  },
  {
    name: 'n8n_create_variable',
    description: 'Create a new variable',
    inputSchema: {
      type: 'object',
      properties: {
        key: { type: 'string', description: 'Variable key' },
        value: { type: 'string', description: 'Variable value' }
      },
      required: ['key', 'value']
    }
  },
  {
    name: 'n8n_get_variable',
    description: 'Get a variable by ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Variable ID' }
      },
      required: ['id']
    }
  },
  {
    name: 'n8n_update_variable',
    description: 'Update a variable',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Variable ID' },
        key: { type: 'string', description: 'Variable key' },
        value: { type: 'string', description: 'Variable value' }
      },
      required: ['id']
    }
  },
  {
    name: 'n8n_delete_variable',
    description: 'Delete a variable',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Variable ID' }
      },
      required: ['id']
    }
  },
  // Tags
  {
    name: 'n8n_list_tags',
    description: 'List all tags',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Max number of results' }
      }
    }
  },
  {
    name: 'n8n_create_tag',
    description: 'Create a new tag',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Tag name' }
      },
      required: ['name']
    }
  },
  {
    name: 'n8n_get_tag',
    description: 'Get a tag by ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Tag ID' }
      },
      required: ['id']
    }
  },
  {
    name: 'n8n_update_tag',
    description: 'Update a tag',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Tag ID' },
        name: { type: 'string', description: 'Tag name' }
      },
      required: ['id', 'name']
    }
  },
  {
    name: 'n8n_delete_tag',
    description: 'Delete a tag',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Tag ID' }
      },
      required: ['id']
    }
  },
  // Source Control
  {
    name: 'n8n_source_control_status',
    description: 'Get source control status',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'n8n_source_control_pull',
    description: 'Pull from source control',
    inputSchema: {
      type: 'object',
      properties: {
        force: { type: 'boolean', description: 'Force pull' }
      }
    }
  },
  {
    name: 'n8n_source_control_push',
    description: 'Push to source control',
    inputSchema: {
      type: 'object',
      properties: {
        force: { type: 'boolean', description: 'Force push' },
        commitMessage: { type: 'string', description: 'Commit message' }
      }
    }
  },
  // Audit
  {
    name: 'n8n_list_audit_logs',
    description: 'List audit logs',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Max number of results' },
        resource: { type: 'string', description: 'Resource type' },
        operation: { type: 'string', description: 'Operation type' },
        userId: { type: 'string', description: 'User ID' },
        startDate: { type: 'string', description: 'Start date (ISO 8601)' },
        endDate: { type: 'string', description: 'End date (ISO 8601)' }
      }
    }
  },
  // External Secrets
  {
    name: 'n8n_get_external_secrets',
    description: 'Get external secrets configuration',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'n8n_get_external_secrets_providers',
    description: 'Get external secrets providers',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'n8n_update_external_secrets_provider',
    description: 'Update external secrets provider',
    inputSchema: {
      type: 'object',
      properties: {
        provider: { type: 'string', description: 'Provider name' },
        config: { type: 'object', description: 'Provider configuration' }
      },
      required: ['provider', 'config']
    }
  },
  {
    name: 'n8n_test_external_secrets_provider',
    description: 'Test external secrets provider',
    inputSchema: {
      type: 'object',
      properties: {
        provider: { type: 'string', description: 'Provider name' }
      },
      required: ['provider']
    }
  },
  {
    name: 'n8n_update_external_secrets_settings',
    description: 'Update external secrets settings',
    inputSchema: {
      type: 'object',
      properties: {
        settings: { type: 'object', description: 'External secrets settings' }
      },
      required: ['settings']
    }
  },
  {
    name: 'n8n_reload_external_secrets',
    description: 'Reload external secrets',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  // LDAP
  {
    name: 'n8n_get_ldap_config',
    description: 'Get LDAP configuration',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'n8n_update_ldap_config',
    description: 'Update LDAP configuration',
    inputSchema: {
      type: 'object',
      properties: {
        config: { type: 'object', description: 'LDAP configuration' }
      },
      required: ['config']
    }
  },
  {
    name: 'n8n_test_ldap_connection',
    description: 'Test LDAP connection',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'n8n_sync_ldap',
    description: 'Sync with LDAP',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', description: 'Sync type (dry-run or live)' }
      }
    }
  },
  // File operations
  {
    name: 'n8n_upload_file_to_workflow',
    description: 'Upload a file to a workflow (base64, max 10MB)',
    inputSchema: {
      type: 'object',
      properties: {
        workflowId: { type: 'string', description: 'Workflow ID to execute with file' },
        filePath: { type: 'string', description: 'Local file path to upload' },
        fieldName: { type: 'string', description: 'Field name for the file (default: "file")' },
        override: { type: 'boolean', description: 'Override existing data (default: false)' }
      },
      required: ['workflowId', 'filePath']
    }
  },
  {
    name: 'n8n_upload_file_multipart',
    description: 'Upload a file via webhook using multipart/form-data (for large files)',
    inputSchema: {
      type: 'object',
      properties: {
        webhookPath: { type: 'string', description: 'Webhook path (e.g., "/webhook/upload")' },
        filePath: { type: 'string', description: 'Local file path to upload' },
        additionalData: { type: 'object', description: 'Additional form data to send' },
        override: { type: 'boolean', description: 'Override existing data (default: false)' }
      },
      required: ['webhookPath', 'filePath']
    }
  },
  {
    name: 'n8n_download_execution_data',
    description: 'Download execution data to a local file (supports binary data extraction)',
    inputSchema: {
      type: 'object',
      properties: {
        executionId: { type: 'string', description: 'Execution ID' },
        outputPath: { type: 'string', description: 'Local file path to save data' },
        override: { type: 'boolean', description: 'Override existing file (default: false)' }
      },
      required: ['executionId', 'outputPath']
    }
  },
  // Workflow file operations (preferred for large data)
  {
    name: 'n8n_download_workflow',
    description: '✅ PREFERRED: Download workflow directly to a file. Always use this instead of n8n_get_workflow when working with files. Avoids transferring large JSON through MCP protocol, making it much faster and more efficient.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Workflow ID' },
        filePath: { type: 'string', description: 'Target file path to save workflow JSON (absolute or relative path)' },
        override: { type: 'boolean', description: 'Override existing file (default: false)' }
      },
      required: ['id', 'filePath']
    }
  },
  {
    name: 'n8n_upload_workflow',
    description: '✅ PREFERRED: Update workflow by uploading from a file. Always use this instead of n8n_update_workflow when working with files. Avoids transferring large JSON through MCP protocol, making it much faster and more efficient.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Workflow ID to update' },
        filePath: { type: 'string', description: 'Source file path containing workflow JSON (absolute or relative path)' }
      },
      required: ['id', 'filePath']
    }
  },
  {
    name: 'n8n_download_workflows_bulk',
    description: '✅ PREFERRED: Download multiple workflows to a single file. Perfect for backup operations or bulk analysis. Use this when you need to backup all workflows or work with multiple workflows at once. Automatically fetches all workflows matching the filters.',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'Target file path to save workflows JSON array (absolute or relative path)' },
        limit: { type: 'number', description: 'Max workflows to download (default: 100)' },
        active: { type: 'boolean', description: 'Filter by active status' },
        tags: { type: 'string', description: 'Filter by tags (comma-separated)' },
        override: { type: 'boolean', description: 'Override existing file (default: false)' }
      },
      required: ['filePath']
    }
  },
  {
    name: 'n8n_download_execution',
    description: '✅ PREFERRED: Download execution data directly to a file. Always use this instead of n8n_get_execution with includeData=true when saving to file. Automatically extracts binary data if present, otherwise saves as JSON.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Execution ID' },
        filePath: { type: 'string', description: 'Target file path to save execution data (absolute or relative path)' },
        override: { type: 'boolean', description: 'Override existing file (default: false)' }
      },
      required: ['id', 'filePath']
    }
  }
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!N8N_API_KEY) {
    throw new McpError(
      ErrorCode.InvalidRequest,
      'N8N_API_KEY must be configured in .env file'
    );
  }

  try {
    let result;

    switch (name) {
      // Schema exploration
      case 'n8n_explore_schema':
        const schemas = schemaManager.getSchemas(args.version || '1.0.0');
        const versions = schemaManager.getVersions();
        result = {
          availableVersions: versions,
          currentVersion: args.version || '1.0.0',
          schemas: schemas.map(s => ({
            name: s.name,
            description: `Schema for ${s.name} endpoints`
          }))
        };
        break;
      case 'n8n_get_schema':
        const schema = schemaManager.getSchema(args.name, args.version || '1.0.0');
        if (!schema) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Schema not found: ${args.name} (version: ${args.version || '1.0.0'})`
          );
        }
        result = schema;
        break;
      // Workflows
      case 'n8n_list_workflows':
        result = await client.getWorkflows(args.limit, args.active, args.tags, args.workflowIds, args.name, args.cursor);
        if (args.projection) {
          result = applyProjection(result, args.projection);
        }
        break;
      case 'n8n_create_workflow':
        if (args.override) {
          result = await client.createWorkflowWithOverride(args, args.override);
        } else {
          result = await client.createWorkflow(args);
        }
        break;
      case 'n8n_get_workflow':
        result = await client.getWorkflow(args.id);
        if (args.projection) {
          result = applyProjection(result, args.projection);
        }
        break;
      case 'n8n_update_workflow':
        const { id: updateId, active, ...workflowData } = args;

        // Buscar workflow existente para fazer merge
        const existingWorkflow = await client.getWorkflow(updateId);

        // Remove campos read-only e não permitidos
        const cleanedData = {};
        const allowedFields = ['name', 'nodes', 'connections', 'settings'];

        // Fazer merge: usar dados novos se fornecidos, senão manter existentes
        for (const field of allowedFields) {
          if (workflowData[field] !== undefined) {
            cleanedData[field] = workflowData[field];
          } else if (existingWorkflow[field] !== undefined) {
            // Manter dados existentes para campos obrigatórios
            cleanedData[field] = existingWorkflow[field];
          }
        }

        // Limpa settings se presente
        if (cleanedData.settings) {
          const allowedSettings = [
            'executionOrder',
            'saveDataErrorExecution',
            'saveDataSuccessExecution',
            'saveExecutionProgress',
            'saveManualExecutions'
          ];
          const cleanedSettings = {};
          for (const setting of allowedSettings) {
            if (cleanedData.settings[setting] !== undefined) {
              cleanedSettings[setting] = cleanedData.settings[setting];
            }
          }
          cleanedData.settings = cleanedSettings;
        }

        // Garante que settings existe (obrigatório)
        if (!cleanedData.settings) {
          cleanedData.settings = existingWorkflow.settings || {};
        }

        result = await client.updateWorkflow(updateId, cleanedData);

        // Se 'active' foi fornecido, atualizar separadamente
        if (active !== undefined && result.active !== active) {
          if (active) {
            result = await client.activateWorkflow(updateId);
          } else {
            result = await client.deactivateWorkflow(updateId);
          }
        }
        break;
      case 'n8n_delete_workflow':
        result = await client.deleteWorkflow(args.id);
        break;
      case 'n8n_activate_workflow':
        result = await client.activateWorkflow(args.id);
        break;
      case 'n8n_deactivate_workflow':
        result = await client.deactivateWorkflow(args.id);
        break;
      case 'n8n_execute_workflow':
        result = await client.executeWorkflow(args.workflowId, args.data || {});
        break;
      // Executions
      case 'n8n_list_executions':
        result = await client.getExecutions(args.limit, args.status, args.workflowId);
        if (args.projection) {
          result = applyProjection(result, args.projection);
        }
        break;
      case 'n8n_get_execution':
        result = await client.getExecution(args.id, args.includeData);
        if (args.projection) {
          result = applyProjection(result, args.projection);
        }
        break;
      case 'n8n_delete_execution':
        result = await client.deleteExecution(args.id);
        break;
      // Credentials
      case 'n8n_list_credentials':
        result = await client.getCredentials(args.limit);
        break;
      case 'n8n_create_credential':
        result = await client.createCredential(args);
        break;
      case 'n8n_get_credential':
        result = await client.getCredential(args.id, args.includeData);
        break;
      case 'n8n_update_credential':
        const { id: credId, ...credData } = args;
        result = await client.updateCredential(credId, credData);
        break;
      case 'n8n_delete_credential':
        result = await client.deleteCredential(args.id);
        break;
      case 'n8n_get_credential_types':
        result = await client.getCredentialTypes();
        break;
      // Users
      case 'n8n_list_users':
        result = await client.getUsers(args.limit, args.includeRole);
        break;
      case 'n8n_get_user':
        result = await client.getUser(args.id, args.includeRole);
        break;
      // Variables
      case 'n8n_list_variables':
        result = await client.getVariables(args.limit);
        break;
      case 'n8n_create_variable':
        result = await client.createVariable(args);
        break;
      case 'n8n_get_variable':
        result = await client.getVariable(args.id);
        break;
      case 'n8n_update_variable':
        const { id: varId, ...varData } = args;
        result = await client.updateVariable(varId, varData);
        break;
      case 'n8n_delete_variable':
        result = await client.deleteVariable(args.id);
        break;
      // Tags
      case 'n8n_list_tags':
        result = await client.getTags(args.limit);
        break;
      case 'n8n_create_tag':
        result = await client.createTag(args);
        break;
      case 'n8n_get_tag':
        result = await client.getTag(args.id);
        break;
      case 'n8n_update_tag':
        const { id: tagId, ...tagData } = args;
        result = await client.updateTag(tagId, tagData);
        break;
      case 'n8n_delete_tag':
        result = await client.deleteTag(args.id);
        break;
      // Source Control
      case 'n8n_source_control_status':
        result = await client.getSourceControlStatus();
        break;
      case 'n8n_source_control_pull':
        result = await client.pullSourceControl(args.force);
        break;
      case 'n8n_source_control_push':
        result = await client.pushSourceControl(args.force, args.commitMessage);
        break;
      // Audit
      case 'n8n_list_audit_logs':
        result = await client.getAuditLogs(
          args.limit, args.resource, args.operation,
          args.userId, args.startDate, args.endDate
        );
        break;
      // External Secrets
      case 'n8n_get_external_secrets':
        result = await client.getExternalSecrets();
        break;
      case 'n8n_get_external_secrets_providers':
        result = await client.getExternalSecretsProviders();
        break;
      case 'n8n_update_external_secrets_provider':
        result = await client.updateExternalSecretsProvider(args.provider, args.config);
        break;
      case 'n8n_test_external_secrets_provider':
        result = await client.testExternalSecretsProvider(args.provider);
        break;
      case 'n8n_update_external_secrets_settings':
        result = await client.updateExternalSecretsSettings(args.settings);
        break;
      case 'n8n_reload_external_secrets':
        result = await client.reloadExternalSecrets();
        break;
      // LDAP
      case 'n8n_get_ldap_config':
        result = await client.getLdapConfig();
        break;
      case 'n8n_update_ldap_config':
        result = await client.updateLdapConfig(args.config);
        break;
      case 'n8n_test_ldap_connection':
        result = await client.testLdapConnection();
        break;
      case 'n8n_sync_ldap':
        result = await client.syncLdap(args.type);
        break;
      // File operations
      case 'n8n_upload_file_to_workflow':
        result = await client.uploadFileToWorkflow(
          args.workflowId,
          args.filePath,
          args.fieldName || 'file',
          args.override || false
        );
        break;
      case 'n8n_upload_file_multipart':
        result = await client.uploadFileMultipart(
          args.webhookPath,
          args.filePath,
          args.additionalData || {},
          args.override || false
        );
        break;
      case 'n8n_download_execution_data':
        result = await client.downloadExecutionData(
          args.executionId,
          args.outputPath,
          args.override || false
        );
        break;
      // New workflow file operations
      case 'n8n_download_workflow':
        const downloadedWorkflow = await client.getWorkflow(args.id);
        const validatedWorkflowPath = validateFilePath(args.filePath);

        if (fs.existsSync(validatedWorkflowPath) && !args.override) {
          throw new Error(`File already exists: ${args.filePath}. Use override=true to overwrite`);
        }

        ensureDirectoryExists(validatedWorkflowPath);
        fs.writeFileSync(validatedWorkflowPath, JSON.stringify(downloadedWorkflow, null, 2), 'utf8');

        result = {
          success: true,
          path: validatedWorkflowPath,
          workflowId: downloadedWorkflow.id,
          workflowName: downloadedWorkflow.name,
          size: JSON.stringify(downloadedWorkflow).length
        };
        break;
      case 'n8n_upload_workflow':
        const validatedUploadPath = validateFilePath(args.filePath);

        if (!fs.existsSync(validatedUploadPath)) {
          throw new Error(`File not found: ${args.filePath}`);
        }

        const uploadedWorkflowData = JSON.parse(fs.readFileSync(validatedUploadPath, 'utf8'));

        // Remove read-only fields
        const { id: _wfId, createdAt: _wfCreatedAt, updatedAt: _wfUpdatedAt, ...updateData } = uploadedWorkflowData;

        result = await client.updateWorkflow(args.id, updateData);
        break;
      case 'n8n_download_workflows_bulk':
        const validatedBulkPath = validateFilePath(args.filePath);

        if (fs.existsSync(validatedBulkPath) && !args.override) {
          throw new Error(`File already exists: ${args.filePath}. Use override=true to overwrite`);
        }

        // Fetch all workflows matching filters
        const allWorkflows = [];
        let bulkCursor = null;
        const batchLimit = args.limit || 100;

        do {
          const batch = await client.getWorkflows(
            Math.min(50, batchLimit - allWorkflows.length),
            args.active,
            args.tags,
            undefined,
            undefined,
            bulkCursor
          );

          if (batch.data && batch.data.length > 0) {
            allWorkflows.push(...batch.data);
          }

          bulkCursor = batch.nextCursor;

          // Stop if we reached the limit or no more results
          if (!bulkCursor || allWorkflows.length >= batchLimit) {
            break;
          }
        } while (bulkCursor);

        ensureDirectoryExists(validatedBulkPath);
        fs.writeFileSync(validatedBulkPath, JSON.stringify(allWorkflows, null, 2), 'utf8');

        result = {
          success: true,
          path: validatedBulkPath,
          count: allWorkflows.length,
          size: JSON.stringify(allWorkflows).length
        };
        break;
      case 'n8n_download_execution':
        const downloadedExecution = await client.getExecution(args.id, true);
        const validatedExecPath = validateFilePath(args.filePath);

        if (fs.existsSync(validatedExecPath) && !args.override) {
          throw new Error(`File already exists: ${args.filePath}. Use override=true to overwrite`);
        }

        ensureDirectoryExists(validatedExecPath);

        // Try to extract binary data if present
        let execDataToWrite;
        let isBinary = false;

        if (downloadedExecution.data?.resultData?.runData) {
          const execRunData = downloadedExecution.data.resultData.runData;
          const firstNode = Object.keys(execRunData)[0];
          const execNodeData = execRunData[firstNode]?.[0]?.data;

          if (execNodeData?.main?.[0]?.[0]?.binary) {
            // Binary data present - extract first binary field
            const execBinaryData = execNodeData.main[0][0].binary;
            const firstBinaryKey = Object.keys(execBinaryData)[0];
            const execBinary = execBinaryData[firstBinaryKey];

            if (execBinary.data) {
              // Decode base64
              const execBuffer = Buffer.from(execBinary.data, 'base64');
              fs.writeFileSync(validatedExecPath, execBuffer);
              isBinary = true;

              result = {
                success: true,
                path: validatedExecPath,
                executionId: downloadedExecution.id,
                type: 'binary',
                mimeType: execBinary.mimeType,
                size: execBuffer.length
              };
            }
          }
        }

        if (!isBinary) {
          // No binary data - save as JSON
          execDataToWrite = JSON.stringify(downloadedExecution, null, 2);
          fs.writeFileSync(validatedExecPath, execDataToWrite, 'utf8');

          result = {
            success: true,
            path: validatedExecPath,
            executionId: downloadedExecution.id,
            type: 'json',
            size: execDataToWrite.length
          };
        }
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
      `n8n API error: ${error.message}`
    );
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('n8n MCP server running');

  // Cleanup on exit
  process.on('SIGINT', () => {
    cache.destroy();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    cache.destroy();
    process.exit(0);
  });
}

main().catch(console.error);