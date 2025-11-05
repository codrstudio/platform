const MarkdownIt = require('markdown-it');
const taskLists = require('markdown-it-task-lists');

const testContent = `
- [x] Item done
- [ ] Item pending  
- [-] Item in progress
- [!] Item blocked
`;

const md = new MarkdownIt();
md.use(taskLists, { enabled: true });

const tokens = md.parse(testContent, {});

console.log('\n===== CHILDREN DETAILS =====\n');

for (let i = 0; i < tokens.length; i++) {
  if (tokens[i].type === 'list_item_open') {
    const contentToken = tokens[i + 2];
    console.log('\nlist_item_open:', {
      attrs: tokens[i].attrs,
      content: contentToken.content,
      children: contentToken.children.map(c => ({
        type: c.type,
        content: c.content,
        tag: c.tag,
        attrs: c.attrs
      }))
    });
  }
}
