// Acquire VSCode API
const vscode = acquireVsCodeApi();

// State management
let currentPlan = null;
let availableFiles = [];
let expandedSections = new Set();

// Message handler
window.addEventListener('message', event => {
  const message = event.data;

  switch (message.type) {
    case 'updatePlan':
      currentPlan = message.plan;
      renderPlan(currentPlan);
      break;

    case 'fileList':
      availableFiles = message.files;
      renderFileSelector();
      break;

    case 'error':
      renderError(message.message);
      break;

    case 'loading':
      renderLoading(message.message);
      break;

    case 'empty':
      renderEmptyState();
      break;
  }
});

/**
 * Renders the plan in the UI
 */
function renderPlan(plan) {
  if (!plan) {
    renderEmptyState();
    return;
  }

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="file-selector" id="file-selector"></div>
    <div class="header">
      <h2>${escapeHtml(plan.title)}</h2>
      <p class="subtitle">${escapeHtml(plan.subtitle)}</p>
      <div class="stats">
        <span class="pending">📝 ${plan.stateCount.pending} pending</span>
        <span class="done">✅ ${plan.stateCount.done} done</span>
        <span class="in-progress">🔄 ${plan.stateCount.inProgress} in progress</span>
        <span class="blocked">⚠️ ${plan.stateCount.blocked} blocked</span>
      </div>
    </div>
    <div class="task-list">
      ${renderTaskList(plan.tasks)}
    </div>
  `;

  // Render file selector
  renderFileSelector();

  // Attach click handlers
  attachHandlers();
}

/**
 * Renders file selector dropdown
 */
function renderFileSelector() {
  const container = document.getElementById('file-selector');
  if (!container || availableFiles.length === 0) {
    return;
  }

  const currentPath = currentPlan ? currentPlan.filePath : '';

  container.innerHTML = `
    <select id="file-select">
      ${availableFiles.map(file => `
        <option value="${escapeHtml(file.path)}" ${file.path === currentPath ? 'selected' : ''}>
          ${escapeHtml(file.relativePath)}
        </option>
      `).join('')}
    </select>
  `;

  // Attach change handler
  const select = document.getElementById('file-select');
  if (select) {
    select.addEventListener('change', (e) => {
      vscode.postMessage({
        type: 'selectFile',
        filePath: e.target.value
      });
    });
  }
}

/**
 * Renders hierarchical list (headings + tasks)
 */
function renderTaskList(items, level = 0) {
  if (!items || items.length === 0) {
    return '<div class="empty-state"><p>No items found</p></div>';
  }

  return items.map(item => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.has(item.id);
    const isHeading = item.type === 'heading';
    const isTask = item.type === 'task';

    if (isHeading) {
      // Render heading
      return `
        <div class="hierarchy-item heading-item level-${level}" data-type="heading" data-id="${escapeHtml(item.id)}">
          <div class="heading-header" data-line="${item.line}" data-file="${escapeHtml(currentPlan.filePath)}">
            ${hasChildren ? `<span class="toggle" data-id="${escapeHtml(item.id)}">${isExpanded ? '▼' : '▶'}</span>` : '<span class="toggle"></span>'}
            <span class="heading-text">${escapeHtml(item.text)}</span>
          </div>
          ${hasChildren && isExpanded ? `
            <div class="hierarchy-children">
              ${renderTaskList(item.children, level + 1)}
            </div>
          ` : ''}
        </div>
      `;
    } else if (isTask) {
      // Render task
      const icon = getStateIcon(item.state);
      return `
        <div class="hierarchy-item task-item level-${level}" data-state="${item.state}" data-type="task" data-id="${escapeHtml(item.id)}">
          <div class="task-header" data-line="${item.line}" data-file="${escapeHtml(currentPlan.filePath)}">
            ${hasChildren ? `<span class="toggle" data-id="${escapeHtml(item.id)}">${isExpanded ? '▼' : '▶'}</span>` : '<span class="toggle"></span>'}
            <span class="icon">${icon}</span>
            <span class="text">${escapeHtml(item.text)}</span>
          </div>
          ${hasChildren && isExpanded ? `
            <div class="hierarchy-children">
              ${renderTaskList(item.children, level + 1)}
            </div>
          ` : ''}
        </div>
      `;
    }

    return '';
  }).join('');
}

/**
 * Gets icon for task state
 */
function getStateIcon(state) {
  switch (state) {
    case 'pending':
      return '📝';
    case 'done':
      return '✅';
    case 'in-progress':
      return '🔄';
    case 'blocked':
      return '⚠️';
    default:
      return '•';
  }
}

/**
 * Attaches event handlers to interactive elements
 */
function attachHandlers() {
  // Click to navigate (both tasks and headings)
  document.querySelectorAll('.task-header, .heading-header').forEach(el => {
    el.addEventListener('click', (e) => {
      // Don't navigate if clicking on toggle
      if (e.target.classList.contains('toggle')) {
        return;
      }

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
    const itemId = el.dataset.id;
    if (!itemId) return;

    el.addEventListener('click', (e) => {
      e.stopPropagation();

      if (expandedSections.has(itemId)) {
        expandedSections.delete(itemId);
      } else {
        expandedSections.add(itemId);
      }

      renderPlan(currentPlan);
    });
  });
}

/**
 * Renders error message
 */
function renderError(message) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="error">
      <strong>Error:</strong> ${escapeHtml(message)}
    </div>
  `;
}

/**
 * Renders empty state when no plan files found
 */
function renderEmptyState() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="empty-state">
      <p>No PLAN*.md files found in workspace</p>
      <p>Create a file starting with "PLAN" and ending with ".md"</p>
    </div>
  `;
}

/**
 * Renders loading state
 */
function renderLoading(message) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="loading">
      ${escapeHtml(message || 'Loading...')}
    </div>
  `;
}

/**
 * Escapes HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize
renderEmptyState();
