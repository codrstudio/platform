# Módulo MarkBrowser

Módulo de navegação, visualização e edição de documentos Markdown.

## Especificação

SPEC: `spec/SPEC-module-markbrowser.md`

## Funcionalidades

### Implementadas

- **Navegação em Árvore** (SPEC-MARKBROWSER-F-001 a F-005)
  - Estrutura hierárquica baseada em paths
  - Pastas colapsáveis/expandíveis
  - Documento ativo visualmente destacado
  - Navegação por teclado

- **Visualização de Markdown** (SPEC-MARKBROWSER-F-006 a F-010)
  - Renderização completa de Markdown (headers, listas, links, imagens, tabelas, etc)
  - Syntax highlighting via Prism
  - Suporte a diagramas Mermaid
  - Links internos funcionais
  - Suporte a fórmulas matemáticas (KaTeX)

- **Carregamento de Dados** (SPEC-MARKBROWSER-F-011 a F-014)
  - Lista de documentos via JQEL
  - Conteúdo sob demanda (lazy loading)
  - Loading states
  - Tratamento de erros

- **Busca** (SPEC-MARKBROWSER-O-001 a O-004)
  - Busca por nome, título e conteúdo
  - Resultados com destaque do termo buscado
  - Busca client-side

- **Table of Contents** (SPEC-MARKBROWSER-O-017 a O-020)
  - Gerado automaticamente dos headers
  - Navegação por clique
  - Destaque da seção atual durante scroll

- **Breadcrumbs** (SPEC-MARKBROWSER-O-021, O-022)
  - Caminho atual clicável
  - Navegação entre níveis

### Não Implementadas (Opcionais)

- Edição de documentos (SPEC-MARKBROWSER-O-005 a O-010)
- Criação/Deleção de documentos (SPEC-MARKBROWSER-O-011 a O-016)
- Histórico de navegação (SPEC-MARKBROWSER-O-023, O-024)
- Export (SPEC-MARKBROWSER-O-025 a O-027)
- Favoritos (SPEC-MARKBROWSER-O-028 a O-030)

## Estrutura

```
markbrowser/
├── components/
│   ├── DocumentTree.tsx          # Árvore de navegação
│   ├── MarkdownViewer.tsx        # Renderizador de Markdown
│   ├── TableOfContents.tsx       # Índice do documento
│   ├── DocumentBreadcrumbs.tsx   # Breadcrumbs
│   ├── DocumentSearch.tsx        # Busca de documentos
│   └── index.ts
├── hooks/
│   ├── useDocuments.ts           # Hooks JQEL
│   └── index.ts
├── pages/
│   └── MarkBrowserView.tsx       # Componente principal
├── types/
│   └── index.ts                  # TypeScript types
├── utils/
│   └── tree.ts                   # Utilidades (árvore, TOC, links)
├── index.ts
├── routes.tsx
├── manifest.json
└── README.md
```

## Componentes Exportados

### Principais
- `<MarkBrowserView />` - Componente principal do módulo

### Reutilizáveis
- `<DocumentTree />` - Árvore de navegação
- `<MarkdownViewer />` - Visualizador de Markdown
- `<TableOfContents />` - Índice do documento
- `<DocumentBreadcrumbs />` - Breadcrumbs
- `<DocumentSearch />` - Busca de documentos

## Hooks

- `useDocuments({ dataSource, rootPath })` - Lista de documentos
- `useDocument({ dataSource, documentId })` - Documento individual
- `useDocumentMutations({ dataSource, onSuccess })` - Mutações (criar, atualizar, deletar)

## Configuração

### Obrigatória

```typescript
{
  dataSource: {
    schema: string;              // Schema JQEL
    documentsEntity: string;     // Entity dos documentos
  }
}
```

### Opcional

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
    enableEdit: boolean;         // Não implementado
    enableCreate: boolean;       // Não implementado
    enableDelete: boolean;       // Não implementado
    enableExport: boolean;       // Não implementado
    enableFavorites: boolean;    // Não implementado
  };

  rendering: {
    theme: 'light' | 'dark';
    syntaxTheme: string;
    linkTarget: '_self' | '_blank';
  };
}
```

## Exemplo de Uso

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
      "enableExport": false,
      "enableFavorites": true
    },
    "rendering": {
      "theme": "light",
      "syntaxTheme": "oneDark",
      "linkTarget": "_self"
    }
  }
}
```

## Estrutura de Dados

### Document

```typescript
{
  id: string;
  path: string;
  name: string;
  title?: string;
  content: string;
  lastModified: string;
  size?: number;
  isDirectory: boolean;
  parent?: string;
}
```

## Dependências

- `react-markdown` - Renderização de Markdown
- `remark-gfm` - GitHub Flavored Markdown
- `remark-math` - Suporte a fórmulas matemáticas
- `rehype-katex` - Renderização de KaTeX
- `rehype-raw` - HTML raw em Markdown
- `react-syntax-highlighter` - Syntax highlighting
- `mermaid` - Diagramas Mermaid
- `katex` - Fórmulas matemáticas

## Performance

- **Lazy Loading**: Conteúdo carregado sob demanda
- **Cache**: TanStack Query com invalidação baseada em `lastModified`
- **Code Splitting**: Módulo lazy-loaded

## Acessibilidade

- Árvore navegável via teclado
- Estrutura semântica correta
- TOC com `aria-label`
- Imagens com alt text
- Code blocks anunciados corretamente

## Limitações Conhecidas

1. **Edição não implementada** - Apenas visualização
2. **Busca client-side** - Para muitos documentos, pode ser lenta
3. **Sem virtualização** - Árvores muito grandes podem ter performance degradada
4. **Imagens relativas** - Dependem de configuração específica do JQEL

## Próximos Passos

1. Implementar edição de documentos
2. Implementar criação/deleção
3. Adicionar export para PDF/HTML
4. Implementar favoritos
5. Otimizar busca para grandes volumes
6. Adicionar virtualização para árvores grandes
