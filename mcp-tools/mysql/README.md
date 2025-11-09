# MySQL MCP Server

MCP (Model Context Protocol) server for MySQL database operations with SSH tunnel support for CiaPrime API.

## Features

- **SSH Tunnel Support** - Secure connection to remote MySQL databases via SSH
- **Multi-Tenancy Validation** - Automatic validation of `tenant_id` filters
- **Schema Introspection** - List tables and inspect column definitions
- **Query Execution** - Execute SQL queries with tenant isolation
- **Error Handling** - Comprehensive error messages and validation

## Installation

```bash
cd mcp-tools/mysql
npm install
```

## Configuration

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Configure your environment variables:

```bash
# SSH Tunnel Configuration (Hostinger)
SSH_HOST=your-ssh-host.com
SSH_PORT=22
SSH_USER=your-ssh-user
SSH_PASSWORD=your-ssh-password

# MySQL Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=ciaprime
DB_PASSWORD=your-db-password
DB_NAME=ciaprime

# Multi-tenancy Configuration
DEFAULT_TENANT_ID=1
VALIDATE_TENANT_ID=true
```

## Usage

### Running the Server

The server is automatically started by Claude Code when configured in `.mcp.json`.

Manual testing:

```bash
npm start
```

### Available Tools

#### 1. testConnection

Test the SSH tunnel and MySQL database connection.

**Parameters:** None

**Example Response:**

```json
{
  "success": true,
  "message": "Connection successful (via SSH tunnel)",
  "ssh": {
    "host": "example.com",
    "port": 22,
    "username": "user"
  },
  "database": {
    "host": "127.0.0.1",
    "port": 3306,
    "database": "ciaprime",
    "user": "ciaprime"
  },
  "testResult": {
    "test": 1,
    "version": "8.0.32"
  }
}
```

#### 2. query

Execute SQL queries with multi-tenancy validation.

**Parameters:**
- `sql` (string, required) - SQL query to execute
- `tenantId` (number, optional) - Tenant ID (defaults to DEFAULT_TENANT_ID)

**Example:**

```sql
SELECT * FROM funcionarios WHERE tenant_id = 1 LIMIT 10
```

**Response:**

```json
{
  "success": true,
  "tenantId": 1,
  "rowCount": 10,
  "affectedRows": 0,
  "data": [...],
  "fields": [
    {
      "name": "id",
      "type": 3,
      "table": "funcionarios"
    }
  ]
}
```

**Multi-Tenancy Validation:**

The server automatically warns if SELECT queries are missing `tenant_id` filters (except for system tables like `users`, `unidades`, `perfis`, `migrations`).

#### 3. getTables

List all tables in the database with metadata.

**Parameters:** None

**Example Response:**

```json
{
  "success": true,
  "database": "ciaprime",
  "tableCount": 135,
  "multiTenantTables": 120,
  "tables": [
    {
      "TABLE_NAME": "funcionarios",
      "TABLE_ROWS": 1523,
      "TABLE_COMMENT": "Employee records",
      "CREATE_TIME": "2024-01-15T10:30:00.000Z",
      "UPDATE_TIME": "2024-01-20T14:20:00.000Z",
      "HAS_TENANT_ID": true
    }
  ]
}
```

#### 4. getSchema

Get detailed schema information for a specific table.

**Parameters:**
- `tableName` (string, required) - Name of the table

**Example Response:**

```json
{
  "success": true,
  "table": "funcionarios",
  "database": "ciaprime",
  "multiTenant": true,
  "columnCount": 45,
  "columns": [
    {
      "COLUMN_NAME": "id",
      "COLUMN_TYPE": "int(11)",
      "IS_NULLABLE": "NO",
      "COLUMN_KEY": "PRI",
      "COLUMN_DEFAULT": null,
      "EXTRA": "auto_increment",
      "COLUMN_COMMENT": "Primary key"
    },
    {
      "COLUMN_NAME": "tenant_id",
      "COLUMN_TYPE": "int(11)",
      "IS_NULLABLE": "NO",
      "COLUMN_KEY": "MUL",
      "COLUMN_DEFAULT": null,
      "EXTRA": "",
      "COLUMN_COMMENT": "Multi-tenancy isolation"
    }
  ],
  "indexes": [...],
  "foreignKeys": [...]
}
```

## Architecture

### Connection Flow

```
Claude Code → MCP Server → SSH Tunnel → Hostinger → MySQL
                (stdio)      (ssh2)      (mysql2)
```

### Multi-Tenancy

The server implements **mandatory multi-tenancy** with `tenant_id` column isolation:

- **Validation**: Warns when SELECT queries lack `tenant_id` filters
- **Default Tenant**: Uses `DEFAULT_TENANT_ID` from environment
- **System Tables**: Automatically excludes tables that don't require tenant isolation

**Active Tenants (Unidades):**
- ID 1: Primary tenant
- ID 8: Secondary tenant
- ID 12: Tertiary tenant

## Security Considerations

1. **SSH Tunnel**: All database connections go through encrypted SSH tunnel
2. **Environment Variables**: Never commit `.env` file with credentials
3. **Query Validation**: Basic SQL injection protection via parameterized queries
4. **Tenant Isolation**: Automatic validation of multi-tenant queries

## Integration with .mcp.json

The server is configured in the project's `.mcp.json`:

```json
{
  "mcpServers": {
    "mysql": {
      "type": "stdio",
      "command": "node",
      "args": ["mcp-tools/mysql/index.js"],
      "env": {}
    }
  }
}
```

## Troubleshooting

### SSH Connection Fails

- Verify SSH credentials in `.env`
- Check SSH host/port accessibility
- Ensure SSH user has proper permissions

### Database Connection Fails

- Verify database credentials
- Check if MySQL is running
- Ensure database exists

### Missing tenant_id Warning

This is expected for queries on system tables. For regular tables, add `WHERE tenant_id = ?` filter.

## Development

### Run in Development Mode

```bash
npm run dev
```

This uses Node's `--watch` flag for automatic restarts on file changes.

## Database Documentation

See project documentation for database architecture:
- `docs/database/README.md` - Complete database documentation
- `docs/seguranca.md` - Security model and multi-tenancy details

## Author

**CODR Studio**
- Website: https://codr.studio
- Email: dev@codrstudio.com

## License

MIT
