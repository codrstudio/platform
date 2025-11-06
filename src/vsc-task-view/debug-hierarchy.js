// Simulate buildHierarchy function
function buildHierarchy(flatItems) {
  const root = [];
  const stack = [{ level: 0, children: root }];

  flatItems.forEach(({ item, level }) => {
    console.log(`\nProcessing: ${item.type} level=${level} "${item.text}"`);
    console.log(`  Stack before: [${stack.map(s => s.level).join(', ')}]`);

    // Pop stack until we find parent level
    while (stack.length > 1 && stack[stack.length - 1].level >= level) {
      const popped = stack.pop();
      console.log(`  Popped level ${popped.level}`);
    }

    console.log(`  Stack after pop: [${stack.map(s => s.level).join(', ')}]`);

    // Add to current parent's children
    const parent = stack[stack.length - 1];
    console.log(`  Adding to parent level=${parent.level}`);
    parent.children.push(item);

    // Push this item as potential parent
    stack.push({ level, children: item.children });
    console.log(`  Pushed level ${level}`);
  });

  return root;
}

// Test data from previous output
const flatItems = [
  { item: { type: 'heading', text: '1. FUNDAMENTOS DA PLATAFORMA', children: [] }, level: 2 },
  { item: { type: 'heading', text: '1.1 Arquitetura Base', children: [] }, level: 3 },
  { item: { type: 'task', text: 'SPEC-concepts.md - Conceitos Fundamentais', children: [] }, level: 4 },
  { item: { type: 'task', text: 'Portal (sub-aplicação isolada)', children: [] }, level: 5 }
];

console.log('=== BUILDING HIERARCHY ===');
const hierarchy = buildHierarchy(flatItems);

console.log('\n\n=== FINAL HIERARCHY ===');
function printHierarchy(items, indent = 0) {
  items.forEach(item => {
    const prefix = '  '.repeat(indent);
    console.log(`${prefix}${item.type}: ${item.text}`);
    if (item.children && item.children.length > 0) {
      printHierarchy(item.children, indent + 1);
    }
  });
}

printHierarchy(hierarchy);
