const fs = require('fs');
const path = require('path');

// Import parser
const { parsePlan } = require('./out/planParser.js');

const filePath = path.join(__dirname, 'test-plan-sample.md');
const content = fs.readFileSync(filePath, 'utf-8');

console.log('=== PARSING TEST FILE ===\n');
const result = parsePlan(content, filePath);

console.log('\n=== RESULT ===');
console.log('Title:', result.title);
console.log('Total tasks:', result.totalCount);
console.log('State counts:', result.stateCount);
console.log('\n=== HIERARCHY ===');

function printHierarchy(items, indent = 0) {
  items.forEach(item => {
    const prefix = '  '.repeat(indent);
    const type = item.type === 'heading' ? 'HEADING' : 'TASK';
    const level = item.level ? ` (level ${item.level})` : '';
    const state = item.state ? ` [${item.state}]` : '';
    const aggStatus = item.aggregatedStatus ? ` {agg: ${item.aggregatedStatus}}` : '';

    console.log(`${prefix}${type}${level}${state}${aggStatus}: ${item.text}`);

    if (item.children && item.children.length > 0) {
      printHierarchy(item.children, indent + 1);
    }
  });
}

printHierarchy(result.tasks);
