const MarkdownIt = require('markdown-it');
const taskLists = require('markdown-it-task-lists');

const testContent = `
# Platform Implementation Plan

## 1. FUNDAMENTOS DA PLATAFORMA

### 1.1 Arquitetura Base
- [x] **SPEC-concepts.md** - Conceitos Fundamentais
  - [x] Portal (sub-aplicação isolada)
  - [x] Module (funcionalidade reutilizável)
  - [ ] Instance (configuração de módulo)
  - [-] Estado inicial (portais "main" e "setup")

- [ ] **SPEC-architecture.md** - Arquitetura 3 Camadas
  - [!] Frontend (React 19 + Vite + TypeScript)
`;

const md = new MarkdownIt();
md.use(taskLists, {
  enabled: true,
  label: true,
  labelAfter: false
});

// Parse to tokens
const tokens = md.parse(testContent, {});

console.log('\n===== TOTAL TOKENS:', tokens.length, '=====\n');

// Show list-related tokens
tokens.forEach((token, idx) => {
  if (token.type.includes('list') || token.type.includes('item')) {
    console.log(`[${idx}] ${token.type}`, {
      tag: token.tag,
      content: token.content,
      children: token.children ? token.children.length : 0,
      attrs: token.attrs,
      map: token.map
    });
    
    // Show children
    if (token.children) {
      token.children.forEach((child, cidx) => {
        console.log(`  [${idx}.${cidx}] ${child.type}:`, child.content);
      });
    }
  }
});

console.log('\n===== LOOKING FOR CHECKBOXES =====\n');

// Try to find checkboxes
for (let i = 0; i < tokens.length; i++) {
  const token = tokens[i];
  
  if (token.type === 'list_item_open') {
    const contentToken = tokens[i + 2];
    console.log('list_item_open at', i, {
      attrs: token.attrs,
      nextToken: tokens[i+1] ? tokens[i+1].type : null,
      contentToken: contentToken ? {
        type: contentToken.type,
        content: contentToken.content,
        children: contentToken.children ? contentToken.children.map(c => ({ type: c.type, content: c.content })) : null
      } : null
    });
  }
}
