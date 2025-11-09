# n8n MCP Server

A Model Context Protocol (MCP) server for interacting with n8n API.

## Features

### ✨ New Intelligent Features

1. **Schema Exploration**
   - Browse available API schemas by version
   - Get detailed field information for each endpoint
   - Located in `.mcp/n8n/schema/{version}/`

2. **Field Projection**
   - Select only the fields you need in API responses
   - Reduces response size and improves performance
   - Available on main list and get operations

3. **Smart Caching**
   - Automatic 15-minute cache for GET requests
   - Cache stored in `.mcp/n8n/.cache/`
   - Self-cleaning mechanism

4. **File Upload/Download** 🆕
   - Upload files to workflows (base64 for <10MB)
   - Upload large files via multipart/form-data
   - Download execution data with binary extraction
   - Auto MIME type detection

5. **Override Mode** 🆕
   - Create workflows with auto-update if exists
   - Download files with overwrite protection
   - Control data replacement behavior

## Usage Examples

### Explore Available Schemas
```javascript
// List all schemas for version 1.0.0
mcp_n8n_explore_schema({ version: "1.0.0" })

// Get detailed schema for workflows
mcp_n8n_get_schema({ name: "workflows", version: "1.0.0" })
```

### Use Field Projection
```javascript
// Get only id and name from workflows
mcp_n8n_list_workflows({
  projection: ["id", "name"]
})

// Get specific fields from a workflow
mcp_n8n_get_workflow({
  id: "abc123",
  projection: ["id", "name", "active", "nodes"]
})

// Get only essential execution info
mcp_n8n_list_executions({
  projection: ["id", "status", "startedAt", "workflowId"]
})
```

### Upload Files
```javascript
// Upload small file (< 10MB) using base64
mcp_n8n_upload_file_to_workflow({
  workflowId: "abc123",
  filePath: "/path/to/document.pdf",
  fieldName: "file",
  override: false
})

// Upload large file using multipart/form-data
mcp_n8n_upload_file_multipart({
  webhookPath: "/webhook/coletivos/upload",
  filePath: "/path/to/large-video.mp4",
  additionalData: { userId: "123", description: "Video upload" },
  override: true
})
```

### Download Files
```javascript
// Download execution data (auto-extracts binary if present)
mcp_n8n_download_execution_data({
  executionId: "exec123",
  outputPath: "/path/to/output.pdf",
  override: true  // Overwrite if file exists
})

// If execution has no binary data, saves as JSON
mcp_n8n_download_execution_data({
  executionId: "exec456",
  outputPath: "/path/to/execution-data.json",
  override: false  // Error if file exists
})
```

### Use Override Mode
```javascript
// Create or update workflow (update if name exists)
mcp_n8n_create_workflow({
  name: "my-workflow",
  nodes: [...],
  connections: {...},
  override: true  // Updates existing workflow with same name
})

// Download with overwrite protection
mcp_n8n_download_execution_data({
  executionId: "exec789",
  outputPath: "/path/to/file.json",
  override: false  // Throws error if file exists
})
```

## Directory Structure

```
.mcp/n8n/
├── server.js           # Main server with cache & projection
├── schema/             # API schemas by version
│   └── 1.0.0/
│       ├── workflows.json
│       ├── executions.json
│       └── credentials.json
├── .cache/             # Response cache (auto-managed)
└── .env               # Configuration (API key, etc)
```

## Configuration

Create `.env` file:
```env
N8N_BASE_URL=https://your-n8n-instance.com
N8N_API_KEY=your-api-key-here
AUTH_METHOD=header  # or 'cookie'
```

## How It Works

1. **Schema Discovery**: First explore schemas to understand available fields
2. **Smart Requests**: Use projection to get only needed data
3. **Automatic Caching**: Responses cached for 15 minutes
4. **Field Filtering**: Projection applied after cache retrieval

## Benefits

- ⚡ **Performance**: Reduced data transfer with field projection
- 🚀 **Speed**: 15-minute cache for repeated requests
- 📊 **Discovery**: Explore schemas to understand API structure
- 🎯 **Precision**: Get exactly the fields you need
- 📁 **File Support**: Upload/download files with automatic type detection
- 🔒 **Safety**: Path validation and overwrite protection
- 🔄 **Smart Override**: Auto-update workflows or protect existing data

## New Tools Available

### File Operations

- `n8n_upload_file_to_workflow` - Upload file to workflow (base64, max 10MB)
- `n8n_upload_file_multipart` - Upload via multipart/form-data (large files)
- `n8n_download_execution_data` - Download execution data with binary extraction

### Features

**Upload:**
- ✅ Automatic MIME type detection
- ✅ File size validation (10MB limit for base64)
- ✅ Path security validation (prevents directory traversal)
- ✅ Support for additional form data (multipart)

**Download:**
- ✅ Binary data extraction from executions
- ✅ Automatic JSON fallback
- ✅ Directory creation if needed
- ✅ Overwrite protection with `override` flag

**Override Mode:**
- ✅ Workflows: Update if name exists (create otherwise)
- ✅ Files: Protect or overwrite existing files
- ✅ Explicit control over data replacement