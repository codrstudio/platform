# PRP: plan-monitor VSCode Extension

**Feature Name**: plan-monitor - Plan/Checklist Monitoring Sidebar Extension for VSCode/VSCodium
**Created**: 2025-11-05
**Complexity**: Medium-High
**Estimated Implementation Time**: 4-6 hours

---

## Goal

Create a **VSCode/VSCodium extension** called `plan-monitor` that provides a **sidebar panel (WebviewViewProvider)** to visualize and monitor Markdown checklist files matching the pattern `PLAN*.md` in the workspace. The extension enables real-time tracking of project plans with hierarchical task visualization, automatic updates on file changes, and efficient caching.

**End State**:
- Extension installable via `.vsix` package (`vsce package`)
- Sidebar panel visible in Explorer activity bar
- Dropdown to switch between multiple `PLAN*.md` files
- Visual hierarchical rendering of tasks with 4 states: `[ ]` pending, `[x]` done, `[-]` in-progress, `[!]` blocked
- Click-to-navigate to exact line in source file
- Auto-refresh on file modifications (FileSystemWatcher)
- Efficient mtime-based caching

---

## Why

- **Business Value**: Provides developers with at-a-glance project status visibility directly in their IDE
- **User Impact**: Eliminates context switching between IDE and external task tracking tools
- **Integration**: Works seamlessly with existing markdown-based planning workflows (see `spec/PLAN.md` in this codebase as example)
- **Problems Solved**:
  - Real-time project progress tracking
  - Hierarchical task visualization
  - Quick navigation to specific plan sections
  - Reduces cognitive load by surfacing plan status in sidebar

---

## What

### User-Visible Behavior

1. **Sidebar Panel**:
   - Appears in Explorer view container
   - Shows icon and title "Plan Monitor"
   - Expandable/collapsible like other sidebar panels

2. **File Selector**:
   - Dropdown at top of panel
   - Lists all `PLAN*.md` files found in workspace
   - Shows file path relative to workspace root
   - Persists selected file across sessions

3. **Task Visualization**:
   - Hierarchical tree structure based on markdown headings
   - Visual indicators for task states:
     - `[ ]` → 📝 Pending (gray)
     - `[x]` → ✅ Done (green)
     - `[-]` → 🔄 In Progress (blue)
     - `[!]` → ⚠️ Blocked (red)
   - Expandable/collapsible sections
   - Shows task counts per section

4. **Navigation**:
   - Click any task → Opens source file at exact line
   - Highlights the clicked line

5. **Auto-Update**:
   - Detects file changes automatically
   - Refreshes view without user action
   - Shows loading indicator during refresh

### Technical Requirements

- **TypeScript**: Strict mode, ES2020 target
- **Compatibility**: Works on VSCode and VSCodium
- **Performance**: Cache with mtime invalidation (no unnecessary parsing)
- **Read-Only**: No file modifications, only visualization
- **Error Handling**: Graceful degradation if files can't be parsed

### Success Criteria

- [ ] Extension loads without errors in VSCode/VSCodium
- [ ] Discovers and lists all `PLAN*.md` files in workspace
- [ ] Correctly parses all 4 checkbox states: `[ ]`, `[x]`, `[-]`, `[!]`
- [ ] Renders hierarchical structure based on heading levels (`#`, `##`, `###`, etc.)
- [ ] Click-to-navigate opens file at correct line number
- [ ] FileSystemWatcher triggers view refresh on file changes
- [ ] Cache prevents reparsing when file hasn't changed (mtime check)
- [ ] Builds successfully with `npm run compile`
- [ ] Packages successfully with `vsce package`
- [ ] No TypeScript errors or warnings

---

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Core VSCode Extension Development

- url: https://code.visualstudio.com/api/extension-guides/webview
  why: Official Webview API guide - understand content security policy, resource loading, message passing
  critical: Security settings (localResourceRoots, CSP) are mandatory for webviews

- url: https://code.visualstudio.com/api/ux-guidelines/sidebars
  why: Official sidebar UX guidelines - learn proper placement, icon usage, container setup
  critical: Must use WebviewViewProvider (not WebviewPanel) for sidebar views

- url: https://github.com/microsoft/vscode-extension-samples/blob/main/webview-view-sample/src/extension.ts
  why: Official Microsoft sample showing WebviewViewProvider implementation pattern
  critical: Shows proper activation, registration, and lifecycle management

- url: https://code.visualstudio.com/api/references/vscode-api#FileSystemWatcher
  why: API reference for file watching
  critical: Use workspace.createFileSystemWatcher() with glob pattern

# Markdown Parsing

- url: https://www.npmjs.com/package/markdown-it
  why: Fast, lightweight markdown parser with plugin ecosystem
  critical: Most popular choice for TypeScript markdown parsing

- url: https://github.com/mcecot/markdown-it-checkbox
  why: Plugin for parsing GitHub-style checkboxes
  critical: Handles [ ] and [x] states natively

- url: https://github.com/hedgedoc/markdown-it-better-task-lists
  why: Extended task list support with custom states
  critical: Can be extended to support [-] and [!] states

# Extension Packaging

- url: https://code.visualstudio.com/api/working-with-extensions/publishing-extension
  why: Official guide for packaging with vsce
  critical: Need @vscode/vsce package, proper package.json setup

- url: https://www.npmjs.com/package/@vscode/vsce
  why: Official VS Code Extension Manager CLI
  critical: Use this for building .vsix packages

- url: https://github.com/VSCodium/vscodium/blob/master/docs/extensions.md
  why: VSCodium extension compatibility notes
  critical: Extensions built for VSCode work in VSCodium if no marketplace dependencies

# Example Reference from This Codebase

- file: spec/PLAN.md
  why: Real example of a PLAN*.md file to test against
  critical: Shows actual checkbox usage [ ], [x], [-], [!] and hierarchical structure
```

### Current Codebase Overview

This extension will be created as a **standalone project** in a new directory (not integrated into the existing platform codebase). However, understanding the project context helps:

```
platform/
├── spec/
│   └── PLAN.md                    # Example file to test parsing
├── src/
│   └── prototype-1/               # Existing platform code (NOT related to extension)
│       ├── frontend/              # React app
│       └── backend/               # Express server
├── PRPs/                          # Implementation plans
│   ├── templates/
│   │   └── prp_base.md           # PRP template used
│   └── plan-monitor-extension.md # THIS FILE
└── PROMPT.md                      # Original feature request
```

**Key Pattern from Codebase**: The project uses TypeScript with strict compilation (see `src/prototype-1/backend/tsconfig.json`):
- `target: ES2020`
- `module: ESNext`
- `strict: true`
- Uses path aliases with `@/` prefix

### Desired Extension Structure

```
src/vsc-task-view/                    # Extension root directory
├── package.json                       # Extension manifest + npm config
├── tsconfig.json                      # TypeScript configuration
├── .vscodeignore                      # Files to exclude from package
├── README.md                          # Extension documentation
├── CHANGELOG.md                       # Version history
├── src/
│   ├── extension.ts                   # Entry point - activation function
│   ├── planMonitorProvider.ts        # WebviewViewProvider implementation
│   ├── planParser.ts                  # Markdown parsing logic
│   ├── planCache.ts                   # Mtime-based caching layer
│   ├── fileDiscovery.ts               # PLAN*.md file discovery
│   └── types.ts                       # TypeScript interfaces/types
├── webview/
│   ├── main.js                        # Webview UI script (loaded in webview context)
│   └── style.css                      # Webview styling
└── dist/                              # Compiled output (created by tsc)
```

**File Responsibilities**:
- `extension.ts`: Registers provider, creates FileSystemWatcher, handles activation/deactivation
- `planMonitorProvider.ts`: Implements WebviewViewProvider, manages webview lifecycle, handles messages
- `planParser.ts`: Parses markdown, extracts tasks with states and line numbers, builds hierarchy
- `planCache.ts`: Stores parsed results with mtime, checks validity, invalidates on change
- `fileDiscovery.ts`: Finds PLAN*.md files using workspace.findFiles(), returns file URIs
- `types.ts`: Defines TaskItem, TaskState, ParsedPlan, CacheEntry interfaces

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: VSCode API restrictions
// - Webviews run in isolated context (separate from extension)
// - Cannot directly pass functions or DOM elements to webview
// - Must use postMessage for communication
// - All resources must be explicitly allowed via localResourceRoots

// CRITICAL: markdown-it setup
import MarkdownIt from 'markdown-it';
import taskLists from 'markdown-it-task-lists';

const md = new MarkdownIt();
md.use(taskLists, {
  enabled: true,
  label: true,        // Wrap in <label> for accessibility
  labelAfter: false   // Place label before checkbox
});

// GOTCHA: Standard plugin only supports [ ] and [x]
// Need custom renderer for [-] and [!] states:
md.renderer.rules.list_item_open = function(tokens, idx) {
  const token = tokens[idx];
  const content = tokens[idx + 2].content;

  // Match custom states
  if (content.match(/^\[-\]/)) {
    token.attrSet('data-task-state', 'in-progress');
  } else if (content.match(/^\[!\]/)) {
    token.attrSet('data-task-state', 'blocked');
  }

  return '<li' + self.renderAttrs(token) + '>';
};

// CRITICAL: FileSystemWatcher patterns
// Use glob pattern, not regex: "**/*.md" for all markdown files
const watcher = vscode.workspace.createFileSystemWatcher(
  new vscode.RelativePattern(workspaceFolder, 'PLAN*.md')
);

// GOTCHA: Must dispose watcher to prevent memory leaks
context.subscriptions.push(watcher);

// CRITICAL: Line number mapping
// markdown-it doesn't provide source line numbers by default
// Need to use markdown-it-attrs or track manually during parsing
// Store original line numbers in token.map property (if available)

// CRITICAL: Mtime caching pattern
import * as fs from 'fs';

interface CacheEntry {
  mtime: number;
  parsed: ParsedPlan;
}

const cache = new Map<string, CacheEntry>();

function getCached(filePath: string): ParsedPlan | null {
  const stats = fs.statSync(filePath);
  const cached = cache.get(filePath);

  if (cached && cached.mtime === stats.mtimeMs) {
    return cached.parsed; // File unchanged
  }

  return null; // Cache miss or invalidated
}

// CRITICAL: VSCode extension activation
// Must declare activationEvents in package.json
{
  "activationEvents": [
    "onView:planMonitorView",        // Activate when view is opened
    "workspaceContains:**/PLAN*.md"  // Or when PLAN*.md exists
  ]
}

// GOTCHA: Extension context is required for many operations
// Always pass context.subscriptions.push() for disposable resources

// CRITICAL: Webview HTML Content Security Policy
const webviewHtml = `<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'none';
                 style-src ${webview.cspSource} 'unsafe-inline';
                 script-src ${webview.cspSource};">
</head>
<body>...</body>
</html>`;

// GOTCHA: Opening document at specific line
vscode.window.showTextDocument(uri, {
  selection: new vscode.Range(lineNumber, 0, lineNumber, 0)
});
```

---

## Implementation Blueprint

### Data Models and Structure

```typescript
// src/types.ts

/** Represents the state of a task checkbox */
export enum TaskState {
  Pending = 'pending',      // [ ]
  Done = 'done',            // [x]
  InProgress = 'in-progress', // [-]
  Blocked = 'blocked'       // [!]
}

/** A single task item extracted from markdown */
export interface TaskItem {
  id: string;              // Unique identifier (file + line)
  text: string;            // Task description (without checkbox)
  state: TaskState;        // Current task state
  line: number;            // Line number in source file (0-indexed)
  level: number;           // Heading level (1-6, or 0 for root items)
  children: TaskItem[];    // Nested tasks
}

/** Root structure of a parsed plan file */
export interface ParsedPlan {
  title: string;           // First line or filename
  subtitle: string;        // Filename as link
  filePath: string;        // Full path to source file
  tasks: TaskItem[];       // Root-level tasks
  totalCount: number;      // Total task count
  stateCount: {            // Count by state
    pending: number;
    done: number;
    inProgress: number;
    blocked: number;
  };
}

/** Cache entry with modification time */
export interface CacheEntry {
  mtime: number;           // File modification time (ms since epoch)
  parsed: ParsedPlan;      // Cached parse result
}

/** Message types for webview communication */
export enum MessageType {
  UpdatePlan = 'updatePlan',       // Extension → Webview: New plan data
  NavigateToLine = 'navigateToLine', // Webview → Extension: User clicked task
  SelectFile = 'selectFile'        // Webview → Extension: User changed file
}

export interface NavigateMessage {
  type: MessageType.NavigateToLine;
  filePath: string;
  line: number;
}

export interface UpdateMessage {
  type: MessageType.UpdatePlan;
  plan: ParsedPlan;
}

export interface SelectMessage {
  type: MessageType.SelectFile;
  filePath: string;
}
```

### Implementation Tasks (Ordered)

```yaml
# ============================================================================
# Task 1: Project Setup & Configuration
# ============================================================================

CREATE src/vsc-task-view/package.json:
  - PATTERN: VSCode extension manifest format
  - INCLUDE:
    name: "plan-monitor"
    displayName: "Plan Monitor"
    description: "Visualize PLAN*.md checklist files in sidebar"
    version: "0.1.0"
    engines: { vscode: "^1.75.0" }
    categories: ["Visualization", "Other"]
    activationEvents: ["onView:planMonitorView", "workspaceContains:**/PLAN*.md"]
    main: "./dist/extension.js"
    contributes:
      views:
        explorer:
          - id: "planMonitorView"
            name: "Plan Monitor"
            icon: "$(checklist)"
    devDependencies:
      @types/vscode: "^1.75.0"
      @types/node: "^18.0.0"
      @types/markdown-it: "^13.0.0"
      @vscode/vsce: "^2.22.0"
      typescript: "^5.0.0"
    dependencies:
      markdown-it: "^14.0.0"
      markdown-it-task-lists: "^2.1.1"

CREATE src/vsc-task-view/tsconfig.json:
  - MIRROR: src/prototype-1/backend/tsconfig.json
  - MODIFY:
    compilerOptions.target: "ES2020"
    compilerOptions.module: "commonjs"  # VSCode extensions use CommonJS
    compilerOptions.outDir: "./dist"
    compilerOptions.rootDir: "./src"
    compilerOptions.lib: ["ES2020"]
    compilerOptions.moduleResolution: "node"
    compilerOptions.strict: true
  - ADD:
    compilerOptions.types: ["vscode", "node"]
  - INCLUDE: ["src/**/*"]
  - EXCLUDE: ["node_modules", "dist"]

CREATE src/vsc-task-view/.vscodeignore:
  - EXCLUDE from package:
    .vscode/**
    src/**
    tsconfig.json
    **/*.map
    **/*.ts
    !dist/**/*.js
    node_modules/**
    .gitignore
    .eslintrc.json

CREATE src/vsc-task-view/README.md:
  - DOCUMENT:
    - What the extension does
    - How to install from .vsix
    - Supported checkbox states
    - How it detects PLAN*.md files
    - Click-to-navigate feature
    - Auto-refresh behavior

# ============================================================================
# Task 2: TypeScript Types Definition
# ============================================================================

CREATE src/vsc-task-view/src/types.ts:
  - IMPLEMENT: All interfaces defined in "Data Models" section above
  - EXPORT: TaskState enum, TaskItem, ParsedPlan, CacheEntry interfaces
  - EXPORT: MessageType enum and message interfaces

# ============================================================================
# Task 3: File Discovery Service
# ============================================================================

CREATE src/vsc-task-view/src/fileDiscovery.ts:
  - FUNCTION findPlanFiles():
    INPUT: vscode.WorkspaceFolder | undefined
    OUTPUT: Promise<vscode.Uri[]>
    LOGIC:
      - Use vscode.workspace.findFiles("**/PLAN*.md", "**/node_modules/**")
      - Return array of URIs sorted alphabetically by filename
      - Handle case when no workspace is open (return empty array)
    ERROR HANDLING:
      - Try-catch around findFiles
      - Log to OutputChannel if errors occur
      - Return empty array on failure

  - FUNCTION getWorkspaceRelativePath():
    INPUT: vscode.Uri
    OUTPUT: string
    LOGIC:
      - Use vscode.workspace.asRelativePath()
      - Returns path relative to workspace root
      - Falls back to full path if not in workspace

# ============================================================================
# Task 4: Markdown Parser with Custom States
# ============================================================================

CREATE src/vsc-task-view/src/planParser.ts:
  - IMPORT: markdown-it, markdown-it-task-lists
  - IMPORT: TaskItem, TaskState, ParsedPlan from './types'

  - FUNCTION parsePlan():
    INPUT: fileContent: string, filePath: string
    OUTPUT: ParsedPlan

    LOGIC:
      1. Initialize markdown-it with task-lists plugin
      2. Create custom renderer for extended states ([-] and [!])
      3. Parse markdown to tokens
      4. Walk token tree, building TaskItem hierarchy:
         - Track heading levels as section boundaries
         - Extract checkbox states from list items
         - Map line numbers from token.map property
         - Build parent-child relationships based on heading nesting
      5. Calculate task counts by state
      6. Extract title (first line without #) and subtitle (filename)
      7. Return ParsedPlan object

    PATTERNS:
      - Regex for checkbox detection: /^\[([ x\-!])\]/i
        - [ ] → TaskState.Pending
        - [x] or [X] → TaskState.Done
        - [-] → TaskState.InProgress
        - [!] → TaskState.Blocked

      - Heading level extraction: token.tag = 'h1'...'h6' → level 1-6

      - Line number mapping:
        if (token.map) {
          lineNumber = token.map[0]; // Start line of token
        }

    ERROR HANDLING:
      - Validate input is not null/empty
      - Handle malformed markdown gracefully (skip invalid items)
      - Default to level 0 if heading structure is unclear
      - Generate unique IDs even if line numbers are missing

  - HELPER buildHierarchy():
    INPUT: flatItems: Array<{item: TaskItem, level: number}>
    OUTPUT: TaskItem[] (hierarchical structure)
    LOGIC:
      - Use stack to track parent items at each level
      - When level increases, push to children of current parent
      - When level decreases, pop stack to correct parent
      - Return root-level items

# ============================================================================
# Task 5: Mtime-Based Caching Layer
# ============================================================================

CREATE src/vsc-task-view/src/planCache.ts:
  - IMPORT: fs from 'fs/promises'
  - IMPORT: CacheEntry, ParsedPlan from './types'

  - CLASS PlanCache:
    PROPERTIES:
      - cache: Map<string, CacheEntry>  // filePath → CacheEntry
      - outputChannel: vscode.OutputChannel (for logging)

    METHOD get(filePath: string):
      INPUT: filePath: string
      OUTPUT: ParsedPlan | null
      LOGIC:
        1. Check if filePath exists in cache
        2. Get file stats (fs.stat)
        3. Compare cached mtime with current file mtime
        4. If match, return cached.parsed
        5. If mismatch or missing, return null (cache miss)
      ERROR HANDLING:
        - Catch file not found → return null
        - Log cache hits/misses to outputChannel

    METHOD set(filePath: string, plan: ParsedPlan):
      INPUT: filePath: string, plan: ParsedPlan
      OUTPUT: void
      LOGIC:
        1. Get current file stats (fs.stat)
        2. Store { mtime: stats.mtimeMs, parsed: plan }
        3. Log cache update to outputChannel
      ERROR HANDLING:
        - Catch errors and log warnings (don't throw)

    METHOD invalidate(filePath: string):
      INPUT: filePath: string
      OUTPUT: void
      LOGIC:
        - Delete entry from cache map
        - Log invalidation to outputChannel

    METHOD clear():
      OUTPUT: void
      LOGIC:
        - Clear entire cache map
        - Log cache clear operation

# ============================================================================
# Task 6: WebviewViewProvider Implementation
# ============================================================================

CREATE src/vsc-task-view/src/planMonitorProvider.ts:
  - IMPORT: vscode, types
  - IMPORT: parsePlan from './planParser'
  - IMPORT: PlanCache from './planCache'
  - IMPORT: findPlanFiles from './fileDiscovery'

  - CLASS PlanMonitorProvider IMPLEMENTS vscode.WebviewViewProvider:
    PROPERTIES:
      - view: vscode.WebviewView | undefined
      - context: vscode.ExtensionContext
      - cache: PlanCache
      - planFiles: vscode.Uri[] = []
      - currentFile: vscode.Uri | undefined
      - outputChannel: vscode.OutputChannel

    CONSTRUCTOR(context, outputChannel):
      - Store context and outputChannel
      - Initialize cache
      - Discover plan files on construction

    METHOD resolveWebviewView(webviewView, context, token):
      LOGIC:
        1. Store webviewView reference
        2. Set webview options:
           - enableScripts: true
           - localResourceRoots: [context.extensionUri]
        3. Set webview HTML content (from getHtmlForWebview)
        4. Set up message handler (webviewView.webview.onDidReceiveMessage)
        5. Load initial plan (first file if available)
        6. Handle panel visibility changes (onDidChangeVisibility)

    METHOD handleMessage(message):
      INPUT: message: any
      LOGIC:
        SWITCH message.type:
          CASE MessageType.NavigateToLine:
            - Open document at specified line
            - Show in editor with line selected
          CASE MessageType.SelectFile:
            - Update currentFile
            - Load and send plan to webview

    METHOD refreshView():
      LOGIC:
        1. Re-discover plan files
        2. If currentFile was deleted, select first available
        3. Load current plan and send to webview

    METHOD loadPlan(fileUri):
      INPUT: fileUri: vscode.Uri
      OUTPUT: Promise<void>
      LOGIC:
        1. Read file content (fs.readFile)
        2. Check cache for parsed result
        3. If cache miss:
           - Parse with parsePlan()
           - Store in cache
        4. Send UpdateMessage to webview with parsed plan
        5. Update file list in webview
      ERROR HANDLING:
        - Try-catch with user-friendly error display
        - Show error message in webview HTML

    METHOD getHtmlForWebview(webview):
      OUTPUT: string (HTML content)
      LOGIC:
        - Load webview/main.js and webview/style.css
        - Convert to webview URIs using webview.asWebviewUri()
        - Build HTML with:
          - Content Security Policy meta tag
          - Link to style.css
          - Script tag for main.js
          - Basic structure: <div id="app"></div>
      CRITICAL:
        - CSP must allow scripts and styles from webview.cspSource
        - All resources must be loaded via asWebviewUri()

    METHOD sendMessage(message):
      INPUT: message: UpdateMessage | any
      LOGIC:
        - Check if view and webview exist
        - Use view.webview.postMessage(message)

# ============================================================================
# Task 7: Webview UI (HTML/CSS/JS)
# ============================================================================

CREATE src/vsc-task-view/webview/style.css:
  - IMPLEMENT:
    - Reset styles for consistent rendering
    - CSS variables for VSCode theme colors (use var(--vscode-*))
    - Dropdown styling for file selector
    - Task list styling:
      - Hierarchical indentation (padding-left based on level)
      - State-specific colors:
        - pending: var(--vscode-descriptionForeground)
        - done: var(--vscode-testing-iconPassed)
        - in-progress: var(--vscode-testing-iconQueued)
        - blocked: var(--vscode-testing-iconFailed)
    - Icons/emojis for states (📝 ✅ 🔄 ⚠️)
    - Hover states for clickable items
    - Loading spinner animation
    - Expandable section toggles (▶ ▼ triangles)

CREATE src/vsc-task-view/webview/main.js:
  - IMPLEMENT:

    // Acquire VSCode API
    const vscode = acquireVsCodeApi();

    // State management
    let currentPlan = null;
    let expandedSections = new Set(); // Track which sections are expanded

    // Message handler
    window.addEventListener('message', event => {
      const message = event.data;
      switch (message.type) {
        case 'updatePlan':
          currentPlan = message.plan;
          renderPlan(currentPlan);
          break;
      }
    });

    // Render plan hierarchy
    function renderPlan(plan) {
      const app = document.getElementById('app');
      app.innerHTML = `
        <div class="header">
          <h2>${plan.title}</h2>
          <p class="subtitle">${plan.subtitle}</p>
          <div class="stats">
            <span class="pending">${plan.stateCount.pending} pending</span>
            <span class="done">${plan.stateCount.done} done</span>
            <span class="in-progress">${plan.stateCount.inProgress} in progress</span>
            <span class="blocked">${plan.stateCount.blocked} blocked</span>
          </div>
        </div>
        <div class="task-list">
          ${renderTaskList(plan.tasks)}
        </div>
      `;

      // Attach click handlers
      attachHandlers();
    }

    function renderTaskList(tasks, level = 0) {
      return tasks.map(task => {
        const hasChildren = task.children && task.children.length > 0;
        const isExpanded = expandedSections.has(task.id);
        const icon = getStateIcon(task.state);

        return `
          <div class="task-item level-${level}" data-id="${task.id}">
            <div class="task-header" data-line="${task.line}" data-file="${currentPlan.filePath}">
              ${hasChildren ? `<span class="toggle">${isExpanded ? '▼' : '▶'}</span>` : ''}
              <span class="icon">${icon}</span>
              <span class="text">${task.text}</span>
            </div>
            ${hasChildren && isExpanded ? `
              <div class="task-children">
                ${renderTaskList(task.children, level + 1)}
              </div>
            ` : ''}
          </div>
        `;
      }).join('');
    }

    function getStateIcon(state) {
      switch(state) {
        case 'pending': return '📝';
        case 'done': return '✅';
        case 'in-progress': return '🔄';
        case 'blocked': return '⚠️';
        default: return '•';
      }
    }

    function attachHandlers() {
      // Click to navigate
      document.querySelectorAll('.task-header').forEach(el => {
        el.addEventListener('click', () => {
          const line = parseInt(el.dataset.line);
          const file = el.dataset.file;
          vscode.postMessage({
            type: 'navigateToLine',
            filePath: file,
            line: line
          });
        });
      });

      // Toggle sections
      document.querySelectorAll('.toggle').forEach(el => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          const taskItem = el.closest('.task-item');
          const id = taskItem.dataset.id;

          if (expandedSections.has(id)) {
            expandedSections.delete(id);
          } else {
            expandedSections.add(id);
          }

          renderPlan(currentPlan); // Re-render
        });
      });
    }

# ============================================================================
# Task 8: Extension Entry Point & Activation
# ============================================================================

CREATE src/vsc-task-view/src/extension.ts:
  - IMPORT: vscode, PlanMonitorProvider, findPlanFiles

  - EXPORT FUNCTION activate(context):
    LOGIC:
      1. Create OutputChannel for logging:
         const output = vscode.window.createOutputChannel('Plan Monitor');

      2. Register WebviewViewProvider:
         const provider = new PlanMonitorProvider(context, output);
         context.subscriptions.push(
           vscode.window.registerWebviewViewProvider(
             'planMonitorView',
             provider,
             { webviewOptions: { retainContextWhenHidden: true } }
           )
         );

      3. Create FileSystemWatcher:
         const watcher = vscode.workspace.createFileSystemWatcher(
           new vscode.RelativePattern(
             vscode.workspace.workspaceFolders?.[0] || '',
             'PLAN*.md'
           )
         );

      4. Hook up watcher events:
         watcher.onDidChange(() => provider.refreshView());
         watcher.onDidCreate(() => provider.refreshView());
         watcher.onDidDelete(() => provider.refreshView());

      5. Add watcher to subscriptions:
         context.subscriptions.push(watcher);

      6. Log activation:
         output.appendLine('Plan Monitor extension activated');

  - EXPORT FUNCTION deactivate():
    LOGIC:
      - Log deactivation (subscriptions auto-disposed by VSCode)

# ============================================================================
# Task 9: Build Scripts & Compilation
# ============================================================================

UPDATE src/vsc-task-view/package.json:
  - ADD scripts:
    "vscode:prepublish": "npm run compile"
    "compile": "tsc -p ./"
    "watch": "tsc -watch -p ./"
    "package": "vsce package"
    "lint": "eslint src --ext ts"

# ============================================================================
# Task 10: Integration Testing & Validation
# ============================================================================

MANUAL TEST CHECKLIST:
  1. Install dependencies: cd src/vsc-task-view && npm install
  2. Compile: npm run compile
  3. Open extension development host: F5 in VSCode
  4. Verify:
     - Plan Monitor appears in sidebar
     - spec/PLAN.md is discovered and listed
     - All 4 checkbox states render correctly
     - Click navigation opens file at correct line
     - File changes trigger auto-refresh
  5. Package: npm run package
  6. Install .vsix: Extensions panel → ... → Install from VSIX
  7. Test in clean VSCode/VSCodium instance
```

---

## Validation Loop

### Level 1: Syntax & Type Checking

```bash
# Navigate to extension directory
cd src/vsc-task-view

# Install dependencies
npm install

# Compile TypeScript (must succeed with 0 errors)
npm run compile

# Expected: No TypeScript errors, dist/ folder created with .js files
```

**Fix Cycle**: If errors occur:
1. Read error message carefully
2. Check type definitions match interfaces in types.ts
3. Ensure all imports are correct
4. Re-run `npm run compile`

### Level 2: Extension Validation

```bash
# Package extension
npm run package

# Expected: plan-monitor-0.1.0.vsix file created
# Expected: No packaging errors
```

**Fix Cycle**: If packaging fails:
1. Check package.json has required fields (name, publisher, version, engines)
2. Ensure all required files are in dist/
3. Verify .vscodeignore doesn't exclude dist/
4. Re-run `npm run package`

### Level 3: Manual Testing in Extension Development Host

```bash
# In VSCode:
# 1. Open src/vsc-task-view folder
# 2. Press F5 to launch Extension Development Host
# 3. Open workspace containing spec/PLAN.md (this project)
```

**Test Cases**:

1. **Sidebar Visibility**:
   - ✓ "Plan Monitor" appears in Explorer sidebar
   - ✓ Icon is visible
   - ✓ Panel is expandable

2. **File Discovery**:
   - ✓ spec/PLAN.md is discovered automatically
   - ✓ If multiple PLAN*.md exist, dropdown shows all
   - ✓ File paths are workspace-relative

3. **Parsing Accuracy**:
   - ✓ `[ ]` renders as 📝 (pending)
   - ✓ `[x]` renders as ✅ (done)
   - ✓ `[-]` renders as 🔄 (in-progress)
   - ✓ `[!]` renders as ⚠️ (blocked) [NOTE: spec/PLAN.md may not have this, manually test]
   - ✓ Hierarchical structure matches heading levels
   - ✓ Task counts are accurate

4. **Navigation**:
   - ✓ Click any task → Opens spec/PLAN.md
   - ✓ Cursor jumps to correct line
   - ✓ Line is highlighted

5. **Auto-Refresh**:
   - ✓ Edit spec/PLAN.md (change `[ ]` to `[x]`)
   - ✓ Save file
   - ✓ Sidebar updates automatically within 1 second
   - ✓ No errors in console

6. **Caching**:
   - ✓ Open large PLAN*.md file (100+ tasks)
   - ✓ Switch to different file
   - ✓ Switch back → should load instantly (cache hit)
   - ✓ Check Debug Console for "Cache hit" log message

7. **Error Handling**:
   - ✓ Delete all PLAN*.md files → Shows "No plan files found" message
   - ✓ Create malformed markdown → Parses gracefully, skips invalid items
   - ✓ No uncaught exceptions in Debug Console

### Level 4: Installation Testing

```bash
# Install extension from .vsix
# In VSCode: Extensions panel → ... menu → Install from VSIX
# Select: src/vsc-task-view/plan-monitor-0.1.0.vsix
```

**Test Cases**:
- ✓ Extension installs successfully
- ✓ Extension loads on VSCode restart
- ✓ All functionality works same as development host
- ✓ Works in VSCodium (if available)

---

## Final Validation Checklist

- [ ] All TypeScript files compile without errors: `npm run compile`
- [ ] Extension packages successfully: `npm run package`
- [ ] Extension loads in development host (F5)
- [ ] All 4 checkbox states render correctly ([ ], [x], [-], [!])
- [ ] Hierarchical structure based on headings works
- [ ] Click-to-navigate opens file at correct line
- [ ] FileSystemWatcher triggers refresh on file changes
- [ ] Caching prevents unnecessary reparsing (verify via logs)
- [ ] spec/PLAN.md from this codebase is correctly parsed
- [ ] Extension installs from .vsix file
- [ ] README.md documents installation and usage
- [ ] No console errors during normal operation
- [ ] Works on both VSCode and VSCodium

---

## Anti-Patterns to Avoid

- ❌ Don't use WebviewPanel - must use WebviewViewProvider for sidebar
- ❌ Don't forget Content Security Policy in webview HTML
- ❌ Don't pass functions/objects directly to webview - use postMessage
- ❌ Don't forget to dispose FileSystemWatcher (add to subscriptions)
- ❌ Don't parse markdown on every file change - use mtime cache
- ❌ Don't hardcode file paths - use workspace-relative paths
- ❌ Don't modify PLAN*.md files - extension is read-only
- ❌ Don't forget to handle "no workspace open" case
- ❌ Don't use sync fs operations - use async (fs.promises)
- ❌ Don't ignore line numbers - crucial for click-to-navigate
- ❌ Don't assume markdown-it provides line numbers - track manually if needed
- ❌ Don't skip error handling in file I/O operations

---

## Pseudocode for Critical Functions

### parsePlan() - Core Parsing Logic

```typescript
function parsePlan(content: string, filePath: string): ParsedPlan {
  // STEP 1: Initialize markdown-it with plugins
  const md = new MarkdownIt();
  md.use(taskLists, { enabled: true });

  // STEP 2: Customize renderer for extended states
  const originalListItemOpen = md.renderer.rules.list_item_open;
  md.renderer.rules.list_item_open = function(tokens, idx, options, env, self) {
    const contentToken = tokens[idx + 2]; // Look ahead to content
    if (contentToken && contentToken.content) {
      // Match extended states
      if (contentToken.content.match(/^\[-\]/)) {
        tokens[idx].attrSet('data-state', 'in-progress');
      } else if (contentToken.content.match(/^\[!\]/)) {
        tokens[idx].attrSet('data-state', 'blocked');
      } else if (contentToken.content.match(/^\[x\]/i)) {
        tokens[idx].attrSet('data-state', 'done');
      } else if (contentToken.content.match(/^\[ \]/)) {
        tokens[idx].attrSet('data-state', 'pending');
      }
    }
    return originalListItemOpen(tokens, idx, options, env, self);
  };

  // STEP 3: Parse content to tokens
  const tokens = md.parse(content, {});

  // STEP 4: Extract tasks from token stream
  const flatTasks: Array<{ item: TaskItem, level: number }> = [];
  let currentLevel = 0;
  let lineCounter = 0;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    // Track heading levels
    if (token.type === 'heading_open') {
      currentLevel = parseInt(token.tag.substring(1)); // h1 → 1, h2 → 2, etc.
    }

    // Extract task items
    if (token.type === 'list_item_open') {
      const state = token.attrGet('data-state') || 'pending';
      const contentToken = tokens[i + 2];
      const text = contentToken.content
        .replace(/^\[[ x\-!]\]\s*/i, '') // Remove checkbox
        .trim();

      const lineNumber = token.map ? token.map[0] : lineCounter;

      flatTasks.push({
        item: {
          id: `${filePath}:${lineNumber}`,
          text,
          state: state as TaskState,
          line: lineNumber,
          level: currentLevel,
          children: []
        },
        level: currentLevel
      });
    }

    lineCounter++;
  }

  // STEP 5: Build hierarchy from flat list
  const hierarchical = buildHierarchy(flatTasks);

  // STEP 6: Calculate statistics
  const counts = { pending: 0, done: 0, inProgress: 0, blocked: 0 };
  const countTasks = (tasks: TaskItem[]) => {
    tasks.forEach(task => {
      counts[task.state]++;
      if (task.children.length > 0) countTasks(task.children);
    });
  };
  countTasks(hierarchical);

  // STEP 7: Extract title and subtitle
  const firstLine = content.split('\n')[0].replace(/^#+\s*/, '').trim();
  const fileName = filePath.split('/').pop() || filePath;

  return {
    title: firstLine || 'Untitled Plan',
    subtitle: fileName,
    filePath,
    tasks: hierarchical,
    totalCount: flatTasks.length,
    stateCount: counts
  };
}

function buildHierarchy(
  flatTasks: Array<{ item: TaskItem, level: number }>
): TaskItem[] {
  const root: TaskItem[] = [];
  const stack: Array<{ level: number, children: TaskItem[] }> = [
    { level: -1, children: root }
  ];

  flatTasks.forEach(({ item, level }) => {
    // Pop stack until we find parent level
    while (stack.length > 1 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    // Add to current parent's children
    const parent = stack[stack.length - 1];
    parent.children.push(item);

    // Push this item as potential parent
    stack.push({ level, children: item.children });
  });

  return root;
}
```

---

## PRP Quality Score

**Confidence Level for One-Pass Implementation**: **8.5/10**

### Scoring Rationale:

**Strengths (+)**:
- ✅ Comprehensive context provided (official docs, examples, patterns)
- ✅ Clear task breakdown with ordered implementation steps
- ✅ Detailed pseudocode for complex parsing logic
- ✅ Multiple validation levels (compile, package, manual test)
- ✅ Anti-patterns explicitly called out
- ✅ Real example file (spec/PLAN.md) available for testing
- ✅ Extension structure follows official VSCode patterns
- ✅ TypeScript strict mode enforced
- ✅ Caching strategy clearly defined

**Risks (-)**:
- ⚠️ Custom markdown-it renderer for extended states ([-], [!]) requires careful implementation
- ⚠️ Line number tracking may need manual implementation if token.map is unreliable
- ⚠️ Hierarchical task building from flat list needs testing with edge cases
- ⚠️ Webview CSP configuration can be tricky (security restrictions)

**Mitigations**:
- Provided detailed pseudocode for parser
- Included fallback strategies (e.g., line counter if token.map unavailable)
- Validation loops include manual testing of all states
- CSP example provided in gotchas section

**Estimated Implementation Time**: 4-6 hours for experienced TypeScript developer familiar with VSCode extensions.

---

## References for AI Agent

During implementation, refer to these URLs for additional details:

1. **WebviewViewProvider API**: https://code.visualstudio.com/api/references/vscode-api#WebviewViewProvider
2. **FileSystemWatcher API**: https://code.visualstudio.com/api/references/vscode-api#FileSystemWatcher
3. **markdown-it documentation**: https://markdown-it.github.io/
4. **markdown-it-task-lists**: https://www.npmjs.com/package/markdown-it-task-lists
5. **Extension Samples Repo**: https://github.com/microsoft/vscode-extension-samples
6. **VSCE Documentation**: https://code.visualstudio.com/api/working-with-extensions/publishing-extension

Test against: `spec/PLAN.md` in this codebase.

---

**End of PRP**
