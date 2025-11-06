const fs = require('fs');
const MarkdownIt = require('markdown-it');
const taskLists = require('markdown-it-task-lists');

const content = fs.readFileSync('test-plan-sample.md', 'utf-8');

const md = new MarkdownIt();
md.use(taskLists, { enabled: true, label: true, labelAfter: false });

const tokens = md.parse(content, {});

console.log('=== ALL TOKENS ===\n');
tokens.forEach((token, i) => {
  if (token.type.includes('heading') || token.type.includes('list')) {
    console.log(`[${i}] ${token.type} ${token.tag || ''}`);
    if (token.attrs) console.log('    attrs:', token.attrs);
    if (token.type === 'inline' || tokens[i-1]?.type === 'heading_open') {
      console.log('    content:', token.content);
    }
  }
});

console.log('\n=== DETAILED LIST ITEMS ===\n');
tokens.forEach((token, i) => {
  if (token.type === 'list_item_open') {
    console.log(`\n[${i}] LIST ITEM:`);
    console.log('  attrs:', token.attrs);

    // Get next few tokens
    for (let j = i + 1; j < Math.min(i + 5, tokens.length); j++) {
      const t = tokens[j];
      console.log(`  [${j}] ${t.type}:`, t.content || t.tag);
      if (t.type === 'inline' && t.children) {
        t.children.forEach((c, ci) => {
          console.log(`    [${ci}] ${c.type}:`, c.content.substring(0, 50));
        });
      }
    }
  }
});
