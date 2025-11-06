const fs = require('fs');
const MarkdownIt = require('markdown-it');
const taskLists = require('markdown-it-task-lists');

const content = fs.readFileSync('test-plan-sample.md', 'utf-8');

const md = new MarkdownIt();
md.use(taskLists, { enabled: true, label: true, labelAfter: false });

const tokens = md.parse(content, {});

// Simulate parser logic
const flatItems = [];
let listDepth = 0;
let currentHeadingLevel = 0;

for (let i = 0; i < tokens.length; i++) {
  const token = tokens[i];

  // Extract headings (H2+)
  if (token.type === 'heading_open') {
    const headingLevel = parseInt(token.tag.substring(1));
    if (headingLevel >= 2) {
      const contentToken = tokens[i + 1];
      if (contentToken && contentToken.type === 'inline') {
        currentHeadingLevel = headingLevel;
        flatItems.push({
          type: 'heading',
          level: headingLevel,
          text: contentToken.content,
          line: token.map ? token.map[0] : 0
        });
        console.log(`[HEADING h${headingLevel}] ${contentToken.content}`);
      }
    }
  }

  // Track list depth
  if (token.type === 'bullet_list_open' || token.type === 'ordered_list_open') {
    listDepth++;
    console.log(`  --> List depth now: ${listDepth}`);
  }
  if (token.type === 'bullet_list_close' || token.type === 'ordered_list_close') {
    listDepth--;
    console.log(`  <-- List depth now: ${listDepth}`);
  }

  // Extract tasks
  if (token.type === 'list_item_open') {
    const hasTaskClass = token.attrs?.some(([key, val]) =>
      key === 'class' && val.includes('task-list-item')
    );

    if (hasTaskClass) {
      const contentToken = tokens[i + 2];
      if (contentToken && contentToken.type === 'inline') {
        const text = contentToken.children
          .filter(c => c.type !== 'html_inline')
          .map(c => c.content)
          .join('')
          .trim();

        const taskLevel = currentHeadingLevel + listDepth;

        flatItems.push({
          type: 'task',
          level: taskLevel,
          text: text,
          line: token.map ? token.map[0] : 0
        });

        console.log(`  [TASK level=${taskLevel} (heading=${currentHeadingLevel} + list=${listDepth})] ${text}`);
      }
    }
  }
}

console.log('\n=== FLAT ITEMS ===');
flatItems.forEach((item, i) => {
  console.log(`${i}: ${item.type} level=${item.level} - ${item.text}`);
});
