#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import sql from 'mssql';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from project root
dotenv.config({ path: path.join(__dirname, '.env') });

class MSSQLServer {
  constructor() {
    this.server = new Server(
      {
        name: 'mssql-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.config = {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      server: process.env.DB_SERVER,
      database: process.env.DB_DATABASE,
      port: parseInt(process.env.DB_PORT) || 1433,
      options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
      },
    };

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'testConnection',
          description: 'Test SQL Server database connection',
          inputSchema: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
        {
          name: 'query',
          description: 'Execute SQL query on SQL Server database',
          inputSchema: {
            type: 'object',
            properties: {
              sql: {
                type: 'string',
                description: 'SQL query to execute',
              },
            },
            required: ['sql'],
          },
        },
        {
          name: 'queryBatch',
          description: 'Execute SQL batch script with GO statements on SQL Server database',
          inputSchema: {
            type: 'object',
            properties: {
              sql: {
                type: 'string',
                description: 'SQL batch script to execute (supports GO statements)',
              },
            },
            required: ['sql'],
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
            return await this.executeQuery(args.sql);
          case 'queryBatch':
            return await this.executeBatch(args.sql);
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

  async testConnection() {
    try {
      const pool = await sql.connect(this.config);
      const result = await pool.request().query('SELECT 1 as test');
      await pool.close();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: 'Connection successful',
              server: this.config.server,
              database: this.config.database,
              user: this.config.user,
              testResult: result.recordset[0],
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              message: 'Connection failed',
              error: error.message,
              server: this.config.server,
              database: this.config.database,
              user: this.config.user,
            }, null, 2),
          },
        ],
        isError: true,
      };
    }
  }

  async executeQuery(queryString) {
    if (!queryString || queryString.trim() === '') {
      throw new Error('SQL query cannot be empty');
    }

    try {
      const pool = await sql.connect(this.config);
      const result = await pool.request().query(queryString);
      await pool.close();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              rowsAffected: result.rowsAffected,
              recordset: result.recordset,
              recordsets: result.recordsets,
              output: result.output,
              returnValue: result.returnValue,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Query execution failed: ${error.message}`);
    }
  }

  async executeBatch(batchScript) {
    if (!batchScript || batchScript.trim() === '') {
      throw new Error('SQL batch script cannot be empty');
    }

    try {
      const pool = await sql.connect(this.config);

      // Split the script by GO statements (case insensitive)
      // Handle GO on its own line with optional whitespace
      const batches = batchScript
        .split(/^\s*GO\s*$/gmi)
        .map(batch => batch.trim())
        .filter(batch => batch.length > 0);

      const results = [];
      let totalRowsAffected = [];

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        if (!batch) continue;

        try {
          const result = await pool.request().query(batch);
          results.push({
            batchIndex: i + 1,
            success: true,
            rowsAffected: result.rowsAffected,
            recordset: result.recordset,
            recordsets: result.recordsets,
            output: result.output,
            returnValue: result.returnValue,
          });

          if (result.rowsAffected) {
            totalRowsAffected = totalRowsAffected.concat(result.rowsAffected);
          }
        } catch (batchError) {
          results.push({
            batchIndex: i + 1,
            success: false,
            error: batchError.message,
            sql: batch.substring(0, 200) + (batch.length > 200 ? '...' : ''),
          });

          // Continue with next batch even if this one fails
          console.error(`Batch ${i + 1} failed:`, batchError.message);
        }
      }

      await pool.close();

      const successfulBatches = results.filter(r => r.success).length;
      const failedBatches = results.filter(r => !r.success).length;

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: failedBatches === 0,
              message: `Executed ${batches.length} batches: ${successfulBatches} successful, ${failedBatches} failed`,
              totalBatches: batches.length,
              successfulBatches,
              failedBatches,
              totalRowsAffected,
              results,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Batch execution failed: ${error.message}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MSSQL MCP server running on stdio');
  }
}

const server = new MSSQLServer();
server.run().catch(console.error);