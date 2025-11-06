// Simulate full parsing pipeline

// Step 1: buildHierarchy
function buildHierarchy(flatItems) {
  const root = [];
  const stack = [{ level: 0, children: root }];

  flatItems.forEach(({ item, level }) => {
    while (stack.length > 1 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }
    const parent = stack[stack.length - 1];
    parent.children.push(item);
    stack.push({ level, children: item.children });
  });

  return root;
}

// Step 2: markTaskDescendants
function markTaskDescendants(items) {
  let hasAnyTasks = false;

  for (const item of items) {
    console.log(`  Checking: ${item.type} "${item.text}" (${item.children.length} children)`);

    if (item.type === 'task') {
      item.hasTaskDescendants = true;
      console.log(`    -> Task marked as hasTaskDescendants=true`);
      hasAnyTasks = true;
      // Tasks can have children (subtasks) - mark them too
      if (item.children.length > 0) {
        console.log(`    -> Task has children, recursing...`);
        markTaskDescendants(item.children);
      }
    } else if (item.children.length > 0) {
      console.log(`    -> Has children, recursing...`);
      const childrenHaveTasks = markTaskDescendants(item.children);
      item.hasTaskDescendants = childrenHaveTasks;
      console.log(`    -> Children have tasks: ${childrenHaveTasks}`);
      if (childrenHaveTasks) {
        hasAnyTasks = true;
      }
    } else {
      item.hasTaskDescendants = false;
      console.log(`    -> No children, marked as hasTaskDescendants=false`);
    }
  }

  return hasAnyTasks;
}

// Step 3: filterTaskBranches
function filterTaskBranches(items) {
  return items
    .filter(item => item.hasTaskDescendants)
    .map(item => ({
      ...item,
      children: filterTaskBranches(item.children)
    }));
}

// Test data
const flatItems = [
  { item: { type: 'heading', text: '1. FUNDAMENTOS', children: [] }, level: 2 },
  { item: { type: 'heading', text: '1.1 Arquitetura Base', children: [] }, level: 3 },
  { item: { type: 'task', text: 'SPEC-concepts.md', children: [] }, level: 4 },
  { item: { type: 'task', text: 'Portal (sub-aplicação isolada)', children: [] }, level: 5 }
];

console.log('=== STEP 1: BUILD HIERARCHY ===');
let hierarchy = buildHierarchy(flatItems);

function printHierarchy(items, indent = 0) {
  items.forEach(item => {
    const prefix = '  '.repeat(indent);
    const hasDesc = item.hasTaskDescendants !== undefined ? ` [hasTaskDesc=${item.hasTaskDescendants}]` : '';
    console.log(`${prefix}${item.type}: ${item.text}${hasDesc} (${item.children.length} children)`);
    if (item.children && item.children.length > 0) {
      printHierarchy(item.children, indent + 1);
    }
  });
}

printHierarchy(hierarchy);

console.log('\n=== STEP 2: MARK TASK DESCENDANTS ===');
markTaskDescendants(hierarchy);
printHierarchy(hierarchy);

console.log('\n=== STEP 3: FILTER TASK BRANCHES ===');
hierarchy = filterTaskBranches(hierarchy);
printHierarchy(hierarchy);
