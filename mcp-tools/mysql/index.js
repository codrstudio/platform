#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import mysql from 'mysql2/promise';
import { Client } from 'ssh2';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from project root
dotenv.config({ path: path.join(__dirname, '.env') });

class MySQLServer {
  constructor() {
    this.server = new Server(
      {
        name: 'mysql-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Check if SSH tunnel is configured
    this.useSshTunnel = !!(process.env.SSH_HOST && process.env.SSH_USER);

    this.sshConfig = this.useSshTunnel ? {
      host: process.env.SSH_HOST,
      port: parseInt(process.env.SSH_PORT) || 22,
      username: process.env.SSH_USER,
      password: process.env.SSH_PASSWORD,
    } : null;

    this.dbConfig = {
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    };

    this.validateTenantId = process.env.VALIDATE_TENANT_ID === 'true';
    this.defaultTenantId = parseInt(process.env.DEFAULT_TENANT_ID) || 1;

    this.sshClient = null;
    this.dbConnection = null;

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'testConnection',
          description: 'Test MySQL database connection (via SSH tunnel if configured)',
          inputSchema: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
        {
          name: 'query',
          description: 'Execute SQL query on MySQL database (validates multi-tenancy)',
          inputSchema: {
            type: 'object',
            properties: {
              sql: {
                type: 'string',
                description: 'SQL query to execute',
              },
              tenantId: {
                type: 'number',
                description: 'Tenant ID for multi-tenancy (optional, uses DEFAULT_TENANT_ID if not provided)',
              },
            },
            required: ['sql'],
          },
        },
        {
          name: 'getTables',
          description: 'List all tables in the database with their metadata',
          inputSchema: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
        {
          name: 'getSchema',
          description: 'Get detailed schema information for a specific table',
          inputSchema: {
            type: 'object',
            properties: {
              tableName: {
                type: 'string',
                description: 'Name of the table to get schema for',
              },
            },
            required: ['tableName'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'testConnection':
            return await this.testConnection();
          case 'query':
            return await this.executeQuery(args.sql, args.tenantId);
          case 'getTables':
            return await this.getTables();
          case 'getSchema':
            return await this.getSchema(args.tableName);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async createSSHTunnel() {
    return new Promise((resolve, reject) => {
      const sshClient = new Client();

      sshClient.on('ready', () => {
        console.error('SSH tunnel established');
        sshClient.forwardOut(
          '127.0.0.1',
          0,
          this.dbConfig.host,
          this.dbConfig.port,
          (err, stream) => {
            if (err) {
              sshClient.end();
              reject(err);
              return;
            }
            resolve({ sshClient, stream });
          }
        );
      });

      sshClient.on('error', (err) => {
        reject(new Error(`SSH connection failed: ${err.message}`));
      });

      sshClient.connect(this.sshConfig);
    });
  }

  async connectToDatabase() {
    try {
      if (this.useSshTunnel) {
        // Connect via SSH tunnel
        const { sshClient, stream } = await this.createSSHTunnel();

        const connection = await mysql.createConnection({
          ...this.dbConfig,
          stream,
        });

        this.sshClient = sshClient;
        this.dbConnection = connection;

        return connection;
      } else {
        // Direct connection (no SSH tunnel)
        const connection = await mysql.createConnection(this.dbConfig);
        this.dbConnection = connection;
        return connection;
      }
    } catch (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }

  async closeConnection() {
    if (this.dbConnection) {
      await this.dbConnection.end();
      this.dbConnection = null;
    }
    if (this.sshClient) {
      this.sshClient.end();
      this.sshClient = null;
    }
  }

  async testConnection() {
    try {
      const connection = await this.connectToDatabase();
      const [rows] = await connection.query('SELECT 1 as test, VERSION() as version');
      await this.closeConnection();

      const response = {
        success: true,
        message: this.useSshTunnel
          ? 'Connection successful (via SSH tunnel)'
          : 'Connection successful (direct)',
        database: {
          host: this.dbConfig.host,
          port: this.dbConfig.port,
          database: this.dbConfig.database,
          user: this.dbConfig.user,
        },
        testResult: rows[0],
      };

      if (this.useSshTunnel) {
        response.ssh = {
          host: this.sshConfig.host,
          port: this.sshConfig.port,
          username: this.sshConfig.username,
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    } catch (error) {
      const response = {
        success: false,
        message: 'Connection failed',
        error: error.message,
        database: {
          host: this.dbConfig.host,
          port: this.dbConfig.port,
          database: this.dbConfig.database,
          user: this.dbConfig.user,
        },
      };

      if (this.useSshTunnel) {
        response.ssh = {
          host: this.sshConfig.host,
          port: this.sshConfig.port,
          username: this.sshConfig.username,
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(response, null, 2),
          },
        ],
        isError: true,
      };
    }
  }

  async executeQuery(queryString, tenantId) {
    if (!queryString || queryString.trim() === '') {
      throw new Error('SQL query cannot be empty');
    }

    const effectiveTenantId = tenantId || this.defaultTenantId;

    // Validate multi-tenancy for queries (basic check)
    if (this.validateTenantId) {
      const lowerQuery = queryString.toLowerCase().trim();
      const isSelectQuery = lowerQuery.startsWith('select');
      const hasTenantFilter = lowerQuery.includes('tenant_id');

      // System tables that don't require tenant_id
      const systemTables = ['users', 'unidades', 'perfis', 'migrations'];
      const isSystemTable = systemTables.some(table => lowerQuery.includes(table));

      if (isSelectQuery && !hasTenantFilter && !isSystemTable) {
        console.error(`WARNING: Query may be missing tenant_id filter. Using tenant_id = ${effectiveTenantId}`);
      }
    }

    try {
      const connection = await this.connectToDatabase();
      const [rows, fields] = await connection.query(queryString);
      await this.closeConnection();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              tenantId: effectiveTenantId,
              rowCount: Array.isArray(rows) ? rows.length : rows.affectedRows,
              affectedRows: rows.affectedRows,
              insertId: rows.insertId,
              data: Array.isArray(rows) ? rows : [],
              fields: fields ? fields.map(f => ({
                name: f.name,
                type: f.type,
                table: f.table,
              })) : [],
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Query execution failed: ${error.message}`);
    }
  }

  async getTables() {
    try {
      const connection = await this.connectToDatabase();

      const [tables] = await connection.query(`
        SELECT
          TABLE_NAME,
          TABLE_ROWS,
          TABLE_COMMENT,
          CREATE_TIME,
          UPDATE_TIME
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = ?
        ORDER BY TABLE_NAME
      `, [this.dbConfig.database]);

      // Check which tables have tenant_id
      const tablesWithTenancy = [];
      for (const table of tables) {
        const [columns] = await connection.query(`
          SELECT COLUMN_NAME
          FROM information_schema.COLUMNS
          WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = 'tenant_id'
        `, [this.dbConfig.database, table.TABLE_NAME]);

        tablesWithTenancy.push({
          ...table,
          HAS_TENANT_ID: columns.length > 0,
        });
      }

      await this.closeConnection();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              database: this.dbConfig.database,
              tableCount: tablesWithTenancy.length,
              multiTenantTables: tablesWithTenancy.filter(t => t.HAS_TENANT_ID).length,
              tables: tablesWithTenancy,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get tables: ${error.message}`);
    }
  }

  async getSchema(tableName) {
    if (!tableName || tableName.trim() === '') {
      throw new Error('Table name cannot be empty');
    }

    try {
      const connection = await this.connectToDatabase();

      // Get columns
      const [columns] = await connection.query(`
        SELECT
          COLUMN_NAME,
          COLUMN_TYPE,
          IS_NULLABLE,
          COLUMN_KEY,
          COLUMN_DEFAULT,
          EXTRA,
          COLUMN_COMMENT
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
        ORDER BY ORDINAL_POSITION
      `, [this.dbConfig.database, tableName]);

      if (columns.length === 0) {
        throw new Error(`Table '${tableName}' not found`);
      }

      // Get indexes
      const [indexes] = await connection.query(`
        SELECT
          INDEX_NAME,
          COLUMN_NAME,
          NON_UNIQUE,
          SEQ_IN_INDEX
        FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
        ORDER BY INDEX_NAME, SEQ_IN_INDEX
      `, [this.dbConfig.database, tableName]);

      // Get foreign keys
      const [foreignKeys] = await connection.query(`
        SELECT
          CONSTRAINT_NAME,
          COLUMN_NAME,
          REFERENCED_TABLE_NAME,
          REFERENCED_COLUMN_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL
      `, [this.dbConfig.database, tableName]);

      await this.closeConnection();

      const hasTenantId = columns.some(col => col.COLUMN_NAME === 'tenant_id');

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              table: tableName,
              database: this.dbConfig.database,
              multiTenant: hasTenantId,
              columnCount: columns.length,
              columns,
              indexes,
              foreignKeys,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get schema for '${tableName}': ${error.message}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    const connectionMode = this.useSshTunnel ? 'with SSH tunnel' : 'direct connection';
    console.error(`MySQL MCP server running on stdio (${connectionMode})`);
  }
}

const server = new MySQLServer();
server.run().catch(console.error);
