# SPEC-module-markbrowser.md

## Especificação: Módulo MarkBrowser

### Escopo
Este documento especifica o módulo MarkBrowser, responsável por navegação, visualização e edição de documentos Markdown acessados via JQEL.

---

## 1. Definição

### Propósito
O módulo MarkBrowser fornece interface para navegar, visualizar e opcionalmente editar documentos Markdown armazenados em diferentes fontes (local, Google Drive, etc), mantendo documentação viva e centralizada.

### Natureza
- **Tipo**: Módulo de Funcionalidade
- **Dependências**: Media Components (react-markdown, Mermaid, Prism)
- **Opcional**: Sim

---

## 2. Responsabilidades

### SPEC-MARKBROWSER-R-001
O módulo MarkBrowser DEVE fornecer interface de navegação em árvore para documentos

### SPEC-MARKBROWSER-R-002
O módulo MarkBrowser DEVE renderizar documentos Markdown com formatação

### SPEC-MARKBROWSER-R-003
O módulo MarkBrowser DEVE acessar documentos via JQEL

### SPEC-MARKBROWSER-R-004
O módulo MarkBrowser PODE permitir edição de documentos

### SPEC-MARKBROWSER-R-005
O módulo MarkBrowser PODE criar múltiplas instâncias apontando para diferentes fontes

---

## 3. Estrutura de Dados

### Documento

**SPEC-MARKBROWSER-D-001:** Documento DEVE ter estrutura:
```typescript
{
  id: string;                    // Identificador único
  path: string;                  // Caminho completo (ex: /docs/api/jqel.md)
  name: string;                  // Nome do arquivo
  title?: string;                // Título extraído do conteúdo
  content: string;               // Conteúdo Markdown
  lastModified: string;          // ISO datetime
  size?: number;                 // Tamanho em bytes
  isDirectory: boolean;          // Se é pasta
  parent?: string;               // ID do diretório pai
}
```

### Árvore de Navegação

**SPEC-MARKBROWSER-D-002:** Estrutura de árvore DEVE ter:
```typescript
{
  id: string;
  name: string;
  path: string;
  isDirectory: boolean;
  children?: TreeNode[];
}
```

**SPEC-MARKBROWSER-D-003:** Árvore DEVE ser construída a partir da lista de documentos

**SPEC-MARKBROWSER-D-004:** Pastas vazias PODEM ser omitidas ou exibidas

---

## 4. Funcionalidades Obrigatórias

### Navegação

**SPEC-MARKBROWSER-F-001:** Instância DEVE exibir árvore de navegação

**SPEC-MARKBROWSER-F-002:** Árvore DEVE ser hierárquica baseada em paths

**SPEC-MARKBROWSER-F-003:** Pastas DEVEM ser colapsáveis/expandíveis

**SPEC-MARKBROWSER-F-004:** Clicar em documento DEVE carregar seu conteúdo

**SPEC-MARKBROWSER-F-005:** Documento ativo DEVE ser visualmente destacado na árvore

### Visualização de Markdown

**SPEC-MARKBROWSER-F-006:** Conteúdo Markdown DEVE ser renderizado com formatação

**SPEC-MARKBROWSER-F-007:** Renderização DEVE suportar:
- Headers (h1-h6)
- Parágrafos e quebras de linha
- Listas (ordenadas e não-ordenadas)
- Links
- Imagens
- Blockquotes
- Tabelas
- Código inline
- Blocos de código com syntax highlighting

**SPEC-MARKBROWSER-F-008:** Blocos de código DEVEM ter syntax highlighting via Prism

**SPEC-MARKBROWSER-F-009:** Diagramas Mermaid DEVEM ser renderizados

**SPEC-MARKBROWSER-F-010:** Links internos (entre documentos) DEVEM funcionar

### Carregamento de Dados

**SPEC-MARKBROWSER-F-011:** Instância DEVE carregar lista de documentos via JQEL na inicialização

**SPEC-MARKBROWSER-F-012:** Conteúdo de documento DEVE ser carregado sob demanda (ao clicar)

**SPEC-MARKBROWSER-F-013:** Durante carregamento, DEVE exibir loading state

**SPEC-MARKBROWSER-F-014:** Se carregamento falhar, DEVE exibir mensagem de erro

---

## 5. Funcionalidades Opcionais

### Busca

**SPEC-MARKBROWSER-O-001:** Instância PODE fornecer busca de documentos

**SPEC-MARKBROWSER-O-002:** Busca PODE ser por:
- Nome do arquivo
- Título do documento
- Conteúdo (full-text)

**SPEC-MARKBROWSER-O-003:** Resultados DEVEM destacar termo buscado

**SPEC-MARKBROWSER-O-004:** Busca PODE executar via JQEL ou client-side

### Edição

**SPEC-MARKBROWSER-O-005:** Instância PODE habilitar modo de edição

**SPEC-MARKBROWSER-O-006:** Edição DEVE fornecer editor de texto Markdown

**SPEC-MARKBROWSER-O-007:** Editor PODE ter:
- Syntax highlighting para Markdown
- Preview em tempo real (side-by-side ou toggle)
- Toolbar com ações comuns (bold, italic, link, etc)

**SPEC-MARKBROWSER-O-008:** Salvar DEVE enviar conteúdo via JQEL mutation

**SPEC-MARKBROWSER-O-009:** Se salvamento falhar, DEVE exibir erro e não perder conteúdo

**SPEC-MARKBROWSER-O-010:** Editor PODE ter autosave (salvar automaticamente)

### Criação/Deleção

**SPEC-MARKBROWSER-O-011:** Instância PODE permitir criar novo documento

**SPEC-MARKBROWSER-O-012:** Criação DEVE especificar path e nome

**SPEC-MARKBROWSER-O-013:** Instância PODE permitir deletar documento

**SPEC-MARKBROWSER-O-014:** Deleção DEVE pedir confirmação

**SPEC-MARKBROWSER-O-015:** Instância PODE permitir criar pastas

**SPEC-MARKBROWSER-O-016:** Instância PODE permitir renomear documentos/pastas

### Table of Contents (TOC)

**SPEC-MARKBROWSER-O-017:** Instância PODE exibir índice do documento atual

**SPEC-MARKBROWSER-O-018:** TOC DEVE ser gerado a partir dos headers (h1-h6)

**SPEC-MARKBROWSER-O-019:** Clicar em item do TOC DEVE rolar para seção correspondente

**SPEC-MARKBROWSER-O-020:** TOC PODE destacar seção atual durante scroll

### Breadcrumbs

**SPEC-MARKBROWSER-O-021:** Instância PODE exibir breadcrumbs do path atual

**SPEC-MARKBROWSER-O-022:** Breadcrumbs DEVEM ser clicáveis para navegar

### Histórico de Navegação

**SPEC-MARKBROWSER-O-023:** Instância PODE manter histórico de documentos visitados

**SPEC-MARKBROWSER-O-024:** Usuário PODE voltar/avançar no histórico

### Export

**SPEC-MARKBROWSER-O-025:** Documento PODE ser exportado para PDF

**SPEC-MARKBROWSER-O-026:** Documento PODE ser exportado para HTML

**SPEC-MARKBROWSER-O-027:** Export DEVE usar Export Components module

### Favoritos

**SPEC-MARKBROWSER-O-028:** Usuário PODE marcar documentos como favoritos

**SPEC-MARKBROWSER-O-029:** Favoritos DEVEM ser persistidos (via JQEL ou localStorage)

**SPEC-MARKBROWSER-O-030:** Instância PODE exibir lista de favoritos

---

## 6. Configuração de Instância

### Parâmetros Obrigatórios

**SPEC-MARKBROWSER-C-001:** Toda instância DEVE configurar:
```typescript
{
  dataSource: {
    schema: string;              // Schema JQEL
    documentsEntity: string;     // Entity dos documentos
  }
}
```

### Parâmetros Opcionais

**SPEC-MARKBROWSER-C-002:** Instância PODE configurar:
```typescript
{
  title?: string;                // Título da instância
  rootPath?: string;             // Path raiz (filtrar documentos)
  
  navigation: {
    showTree: boolean;           // Exibir árvore de navegação
    showBreadcrumbs: boolean;    // Exibir breadcrumbs
    showTOC: boolean;            // Exibir table of contents
    expandDepth: number;         // Níveis expandidos por padrão
  };
  
  features: {
    enableSearch: boolean;
    enableEdit: boolean;
    enableCreate: boolean;
    enableDelete: boolean;
    enableExport: boolean;
    enableFavorites: boolean;
  };
  
  editor?: {
    autosave: boolean;
    autosaveInterval: number;    // ms
    showPreview: boolean;
    previewMode: 'side' | 'toggle';
  };
  
  rendering: {
    theme: 'light' | 'dark';
    syntaxTheme: string;         // Prism theme
    linkTarget: '_self' | '_blank';
  };
  
  permissions?: {
    canView: string;             // Permissão para visualizar
    canEdit: string;             // Permissão para editar
    canManage: string;           // Permissão para criar/deletar
  };
}
```

---

## 7. Integração com JQEL

### Queries Necessárias

**SPEC-MARKBROWSER-J-001:** Ao carregar, DEVE executar:
```typescript
// Buscar lista de documentos
{
  schema: config.dataSource.schema,
  operation: 'select',
  entity: config.dataSource.documentsEntity,
  where: config.rootPath ? { path: { startsWith: config.rootPath } } : {},
  output: ['id', 'path', 'name', 'title', 'isDirectory', 'lastModified']
}
```

**SPEC-MARKBROWSER-J-002:** Ao abrir documento, DEVE executar:
```typescript
// Buscar conteúdo completo
{
  schema: config.dataSource.schema,
  operation: 'select',
  entity: config.dataSource.documentsEntity,
  where: { id: documentId },
  output: ['id', 'path', 'name', 'title', 'content', 'lastModified']
}
```

### Mutations (Se Edição Habilitada)

**SPEC-MARKBROWSER-J-003:** Ao salvar documento, DEVE executar:
```typescript
{
  schema: config.dataSource.schema,
  operation: 'mutate',
  entity: config.dataSource.documentsEntity,
  action: 'update',
  where: { id: documentId },
  values: {
    content: newContent,
    lastModified: new Date().toISOString()
  }
}
```

**SPEC-MARKBROWSER-J-004:** Ao criar documento, DEVE executar:
```typescript
{
  schema: config.dataSource.schema,
  operation: 'mutate',
  entity: config.dataSource.documentsEntity,
  action: 'insert',
  values: {
    path: documentPath,
    name: fileName,
    content: initialContent,
    isDirectory: false,
    lastModified: new Date().toISOString()
  }
}
```

---

## 8. Componentes Exportados

### Obrigatórios

**SPEC-MARKBROWSER-E-001:** Módulo DEVE exportar:
- `<MarkBrowser />` - Componente principal
- `<DocumentTree />` - Árvore de navegação
- `<MarkdownViewer />` - Visualizador de Markdown

### Opcionais

**SPEC-MARKBROWSER-E-002:** Módulo PODE exportar:
- `<MarkdownEditor />` - Editor de Markdown
- `<DocumentSearch />` - Busca de documentos
- `<TableOfContents />` - Índice do documento
- `<DocumentBreadcrumbs />` - Breadcrumbs

---

## 9. Layout

### Estrutura Padrão

**SPEC-MARKBROWSER-L-001:** Layout DEVE ter:
```
┌─────────────────────────────────────────────┐
│ [Title]              [Search] [Actions]     │
├──────────┬──────────────────────┬───────────┤
│          │                      │           │
│  Tree    │   Document Content   │   TOC     │
│  (Nav)   │                      │ (Optional)│
│          │                      │           │
│          │                      │           │
└──────────┴──────────────────────┴───────────┘
```

**SPEC-MARKBROWSER-L-002:** Tree PODE ser colapsável

**SPEC-MARKBROWSER-L-003:** TOC PODE ser colapsável ou oculto

**SPEC-MARKBROWSER-L-004:** Em mobile, Tree DEVE colapsar em drawer

---

## 10. Renderização de Markdown

### Elementos Suportados

**SPEC-MARKBROWSER-M-001:** DEVE renderizar corretamente:
- `# Header` → `<h1>`
- `**bold**` → `<strong>`
- `*italic*` → `<em>`
- `` `code` `` → `<code>`
- `[link](url)` → `<a>`
- `![alt](image.png)` → `<img>`
- Tabelas Markdown → `<table>`
- Blockquotes → `<blockquote>`
- Listas → `<ul>`, `<ol>`

### Code Blocks

**SPEC-MARKBROWSER-M-002:** Code block DEVE ter formato:
````markdown
```javascript
const x = 10;
```
````

**SPEC-MARKBROWSER-M-003:** Linguagem DEVE ser detectada e aplicar syntax highlighting

**SPEC-MARKBROWSER-M-004:** Code block PODE ter botão "copiar"

### Diagramas Mermaid

**SPEC-MARKBROWSER-M-005:** Mermaid DEVE ser renderizado de:
````markdown
```mermaid
graph TD;
    A-->B;
```
````

**SPEC-MARKBROWSER-M-006:** Se Mermaid falhar, DEVE exibir código como fallback

### Links Internos

**SPEC-MARKBROWSER-M-007:** Link para outro documento DEVE abrir nesse documento:
```markdown
[Veja conceitos](./concepts.md)
```

**SPEC-MARKBROWSER-M-008:** Path relativo DEVE ser resolvido baseado no documento atual

**SPEC-MARKBROWSER-M-009:** Âncoras DEVEM funcionar:
```markdown
[Ir para seção](#secao-titulo)
```

### Imagens

**SPEC-MARKBROWSER-M-010:** Imagens DEVEM ser carregadas de:
- URLs absolutas
- Paths relativos (via JQEL)
- Data URIs (base64)

**SPEC-MARKBROWSER-M-011:** Imagens PODEM ter lightbox ao clicar

---

## 11. Performance

### Lazy Loading

**SPEC-MARKBROWSER-P-001:** Conteúdo de documento SÓ DEVE ser carregado ao abrir

**SPEC-MARKBROWSER-P-002:** Lista de documentos PODE ser carregada progressivamente

### Cache

**SPEC-MARKBROWSER-P-003:** Documentos visitados DEVEM ser cacheados (TanStack Query)

**SPEC-MARKBROWSER-P-004:** Cache DEVE respeitar `lastModified` para invalidação

### Virtualização

**SPEC-MARKBROWSER-P-005:** Árvore com muitos itens (>100) PODE usar virtualização

---

## 12. Acessibilidade

**SPEC-MARKBROWSER-A-001:** Árvore DEVE ser navegável via teclado

**SPEC-MARKBROWSER-A-002:** Documento DEVE ter estrutura semântica correta (headers hierárquicos)

**SPEC-MARKBROWSER-A-003:** TOC DEVE usar `<nav>` com `aria-label`

**SPEC-MARKBROWSER-A-004:** Imagens DEVEM ter alt text

**SPEC-MARKBROWSER-A-005:** Code blocks DEVEM ser anunciados corretamente

---

## 13. Exemplos de Uso

### Instância Read-Only (Documentação)
```json
{
  "instanceId": "docs-platform",
  "moduleId": "markbrowser",
  "config": {
    "title": "Platform Documentation",
    "dataSource": {
      "schema": "docs",
      "documentsEntity": "markdown_file"
    },
    "rootPath": "/docs/platform",
    "navigation": {
      "showTree": true,
      "showBreadcrumbs": true,
      "showTOC": true,
      "expandDepth": 2
    },
    "features": {
      "enableSearch": true,
      "enableEdit": false,
      "enableExport": true,
      "enableFavorites": true
    }
  }
}
```

### Instância com Edição (Wiki Interno)
```json
{
  "instanceId": "wiki-internal",
  "moduleId": "markbrowser",
  "config": {
    "title": "Internal Wiki",
    "dataSource": {
      "schema": "internal",
      "documentsEntity": "wiki_page"
    },
    "navigation": {
      "showTree": true,
      "showBreadcrumbs": true,
      "showTOC": true
    },
    "features": {
      "enableSearch": true,
      "enableEdit": true,
      "enableCreate": true,
      "enableDelete": true,
      "enableExport": true
    },
    "editor": {
      "autosave": true,
      "autosaveInterval": 30000,
      "showPreview": true,
      "previewMode": "side"
    },
    "permissions": {
      "canView": "read.wiki",
      "canEdit": "write.wiki",
      "canManage": "manage.wiki"
    }
  }
}
```

---

*Esta especificação define os requisitos do módulo MarkBrowser. Implementação técnica em documentação separada.*