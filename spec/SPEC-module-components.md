# SPEC-module-components.md

## Especificação: Módulos de Componentes

### Escopo
Este documento define os requisitos dos três módulos de componentes da plataforma: App Components, Media Components e Export Components.

---

## 1. Conceito de Módulos de Componentes

### Definição

**SPEC-MC-CO-001:** Módulos de Componentes fornecem bibliotecas especializadas

**SPEC-MC-CO-002:** Módulos de Componentes são módulos opcionais

**SPEC-MC-CO-003:** Módulos de Componentes DEVEM ser ativados explicitamente em portais

**SPEC-MC-CO-004:** Módulos de Componentes NÃO são globais por padrão

### Propósito

**SPEC-MC-CO-005:** Permitir lazy loading de bibliotecas pesadas

**SPEC-MC-CO-006:** Otimizar performance de aplicações leves

**SPEC-MC-CO-007:** Centralizar versionamento de bibliotecas

**SPEC-MC-CO-008:** Facilitar manutenção e atualizações

### Características

**SPEC-MC-CO-009:** Type DEVE ser `"components"` no manifesto

**SPEC-MC-CO-010:** Geralmente NÃO exportam rotas

**SPEC-MC-CO-011:** Exportam componentes, hooks e utilities

**SPEC-MC-CO-012:** DEVEM fazer re-export de bibliotecas integradas

---

## 2. Módulo App Components

### Definição

**SPEC-MC-AP-001:** App Components habilita desenvolvimento de aplicativos robustos

**SPEC-MC-AP-002:** Focado em dashboards, CRUDs, helpdesks, kanbans

**SPEC-MC-AP-003:** Transforma plataforma de "site" para "aplicativo"

### Manifesto

**SPEC-MC-AP-004:** Manifesto do módulo:
```typescript
{
  id: "app-components",
  name: "App Components",
  version: "1.0.0",
  type: "components",
  description: "Componentes para aplicativos robustos",
  dependencies: [],
  icon: "Package",
  category: "components"
}
```

### Bibliotecas Incluídas

**SPEC-MC-AP-005:** DEVE incluir TanStack Table

**SPEC-MC-AP-006:** DEVE incluir Recharts

**SPEC-MC-AP-007:** DEVE incluir FullCalendar

**SPEC-MC-AP-008:** DEVE incluir @dnd-kit (drag and drop)

**SPEC-MC-AP-009:** DEVE incluir TipTap (rich text editor)

**SPEC-MC-AP-010:** DEVE incluir react-dropzone

**SPEC-MC-AP-011:** DEVE incluir @tanstack/react-virtual

**SPEC-MC-AP-012:** DEVE incluir react-colorful

**SPEC-MC-AP-013:** PODE incluir outras bibliotecas relacionadas

### Versões

**SPEC-MC-AP-014:** TanStack Table: versão estável compatível com React 19

**SPEC-MC-AP-015:** Recharts: versão estável

**SPEC-MC-AP-016:** FullCalendar: versão 6.x ou superior

**SPEC-MC-AP-017:** @dnd-kit: versão estável

**SPEC-MC-AP-018:** TipTap: versão 2.x

**SPEC-MC-AP-019:** Versões DEVEM ser documentadas no README do módulo

### Exports

**SPEC-MC-AP-020:** DEVE exportar todos os componentes principais de cada biblioteca

**SPEC-MC-AP-021:** DEVE exportar hooks relevantes

**SPEC-MC-AP-022:** DEVE exportar types TypeScript

**SPEC-MC-AP-023:** Exemplo de exports:
```typescript
// TanStack Table
export {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender
} from '@tanstack/react-table';
export type { ColumnDef, Table } from '@tanstack/react-table';

// Recharts
export {
  LineChart,
  BarChart,
  PieChart,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// FullCalendar
export { Calendar } from '@fullcalendar/core';
export { default as FullCalendar } from '@fullcalendar/react';
export { default as dayGridPlugin } from '@fullcalendar/daygrid';
export { default as timeGridPlugin } from '@fullcalendar/timegrid';
export { default as interactionPlugin } from '@fullcalendar/interaction';

// @dnd-kit
export {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDraggable,
  useDroppable,
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
  horizontalListSortingStrategy
} from '@dnd-kit/core';
export { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

// TipTap
export { useEditor, EditorContent } from '@tiptap/react';
export { StarterKit } from '@tiptap/starter-kit';

// react-dropzone
export { useDropzone } from 'react-dropzone';

// @tanstack/react-virtual
export { useVirtualizer } from '@tanstack/react-virtual';

// react-colorful
export { HexColorPicker, RgbColorPicker } from 'react-colorful';
```

### Integração com Tema

**SPEC-MC-AP-024:** Componentes DEVEM respeitar tema da plataforma (claro/escuro)

**SPEC-MC-AP-025:** Cores DEVEM usar CSS custom properties quando possível

**SPEC-MC-AP-026:** Brand color DEVE ser aplicável aos componentes

---

## 3. Módulo Media Components

### Definição

**SPEC-MC-ME-001:** Media Components permite visualização de conteúdo rico

**SPEC-MC-ME-002:** Focado em markdown, PDFs, vídeos, áudio, diagramas

**SPEC-MC-ME-003:** Módulo leve e específico

**SPEC-MC-ME-004:** Pode ser usado isoladamente (ex: chat em landing page)

### Manifesto

**SPEC-MC-ME-005:** Manifesto do módulo:
```typescript
{
  id: "media-components",
  name: "Media Components",
  version: "1.0.0",
  type: "components",
  description: "Visualização de conteúdo rico e mídia",
  dependencies: [],
  icon: "Image",
  category: "components"
}
```

### Bibliotecas Incluídas

**SPEC-MC-ME-006:** DEVE incluir react-markdown

**SPEC-MC-ME-007:** DEVE incluir react-pdf

**SPEC-MC-ME-008:** DEVE incluir Mermaid

**SPEC-MC-ME-009:** DEVE incluir Prism.js ou highlight.js

**SPEC-MC-ME-010:** DEVE incluir react-player

**SPEC-MC-ME-011:** DEVE incluir wavesurfer.js

**SPEC-MC-ME-012:** DEVE incluir Papa Parse (para leitura de CSV)

**SPEC-MC-ME-013:** PODE incluir outras bibliotecas relacionadas

### Versões

**SPEC-MC-ME-014:** react-markdown: versão estável

**SPEC-MC-ME-015:** react-pdf: versão compatível com React 19

**SPEC-MC-ME-016:** Mermaid: versão estável

**SPEC-MC-ME-017:** Prism.js: versão estável (ou highlight.js como alternativa)

**SPEC-MC-ME-018:** react-player: versão estável

**SPEC-MC-ME-019:** wavesurfer.js: versão 7.x ou superior

**SPEC-MC-ME-020:** Papa Parse: versão estável

**SPEC-MC-ME-021:** Versões DEVEM ser documentadas no README do módulo

### Exports

**SPEC-MC-ME-022:** DEVE exportar componentes principais

**SPEC-MC-ME-023:** DEVE exportar utilities relevantes

**SPEC-MC-ME-024:** DEVE exportar types TypeScript

**SPEC-MC-ME-025:** Exemplo de exports:
```typescript
// react-markdown
export { default as ReactMarkdown } from 'react-markdown';
export { default as remarkGfm } from 'remark-gfm';

// react-pdf
export { Document, Page, pdfjs } from 'react-pdf';

// Mermaid
export { default as mermaid } from 'mermaid';

// Prism.js
export { default as Prism } from 'prismjs';
export { highlight, languages } from 'prismjs';

// react-player
export { default as ReactPlayer } from 'react-player';

// wavesurfer.js
export { default as WaveSurfer } from 'wavesurfer.js';

// Papa Parse
export { default as Papa } from 'papaparse';
export { parse, unparse } from 'papaparse';
```

### Integração com Tema

**SPEC-MC-ME-026:** Syntax highlighting DEVE respeitar tema (claro/escuro)

**SPEC-MC-ME-027:** Players DEVEM usar cores do tema quando possível

**SPEC-MC-ME-028:** Markdown DEVE usar CSS do tema

---

## 4. Módulo Export Components

### Definição

**SPEC-MC-EX-001:** Export Components permite exportação de conteúdo

**SPEC-MC-EX-002:** Focado em geração de PDF, DOCX, CSV

**SPEC-MC-EX-003:** Totalmente implementado no frontend (sem backend)

**SPEC-MC-EX-004:** Nem todas aplicações precisam exportar conteúdo

### Manifesto

**SPEC-MC-EX-005:** Manifesto do módulo:
```typescript
{
  id: "export-components",
  name: "Export Components",
  version: "1.0.0",
  type: "components",
  description: "Exportação de conteúdo em diversos formatos",
  dependencies: [],
  icon: "Download",
  category: "components"
}
```

### Bibliotecas Incluídas

**SPEC-MC-EX-006:** DEVE incluir pdfmake

**SPEC-MC-EX-007:** DEVE incluir docx (docx.js)

**SPEC-MC-EX-008:** DEVE incluir Papa Parse (para exportação de CSV)

**SPEC-MC-EX-009:** DEVE incluir file-saver ou downloadjs

**SPEC-MC-EX-010:** PODE incluir outras bibliotecas relacionadas

### Versões

**SPEC-MC-EX-011:** pdfmake: versão estável

**SPEC-MC-EX-012:** docx: versão estável

**SPEC-MC-EX-013:** Papa Parse: versão estável (mesma do Media Components)

**SPEC-MC-EX-014:** file-saver: versão estável

**SPEC-MC-EX-015:** Versões DEVEM ser documentadas no README do módulo

### Exports

**SPEC-MC-EX-016:** DEVE exportar funções principais

**SPEC-MC-EX-017:** DEVE exportar utilities de geração

**SPEC-MC-EX-018:** DEVE exportar types TypeScript

**SPEC-MC-EX-019:** Exemplo de exports:
```typescript
// pdfmake
export { default as pdfMake } from 'pdfmake/build/pdfmake';
export { default as pdfFonts } from 'pdfmake/build/vfs_fonts';
export type { TDocumentDefinitions, Content } from 'pdfmake/interfaces';

// docx
export {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell
} from 'docx';

// Papa Parse (export)
export { unparse } from 'papaparse';

// file-saver
export { saveAs } from 'file-saver';
```

### Funcionalidades

**SPEC-MC-EX-020:** DEVE facilitar geração programática de PDFs

**SPEC-MC-EX-021:** DEVE facilitar geração de arquivos DOCX

**SPEC-MC-EX-022:** DEVE facilitar exportação de dados para CSV

**SPEC-MC-EX-023:** DEVE facilitar download de arquivos gerados

---

## 5. Dependências entre Módulos

### Declaração

**SPEC-MC-DE-001:** Módulos de funcionalidade PODEM depender de módulos de componentes

**SPEC-MC-DE-002:** Dependências DEVEM ser declaradas no manifesto

**SPEC-MC-DE-003:** Ativação automática de dependências

### Exemplos

**SPEC-MC-DE-004:** Módulo Chat depende de:
```typescript
{
  dependencies: ["media-components", "export-components"]
}
```

**SPEC-MC-DE-005:** Módulo Dashboard depende de:
```typescript
{
  dependencies: ["app-components", "export-components"]
}
```

**SPEC-MC-DE-006:** Módulo Kanban depende de:
```typescript
{
  dependencies: ["app-components"]
}
```

---

## 6. Disponibilidade

### Após Ativação

**SPEC-MC-DI-001:** Uma vez ativado, módulo DEVE estar disponível globalmente no portal

**SPEC-MC-DI-002:** Outros módulos do portal PODEM importar diretamente

**SPEC-MC-DI-003:** Exemplo de import:
```typescript
import { useReactTable } from 'app-components';
import { ReactMarkdown } from 'media-components';
import { pdfMake } from 'export-components';
```

### Isolamento por Portal

**SPEC-MC-DI-004:** Módulos de componentes ativos em um portal NÃO estão disponíveis em outros portais

**SPEC-MC-DI-005:** Cada portal gerencia suas próprias ativações

---

## 7. Configuração e Inicialização

### Setup

**SPEC-MC-CF-001:** Módulos de componentes PODEM ter configuração inicial

**SPEC-MC-CF-002:** Exemplo: configurar pdfFonts no pdfmake

**SPEC-MC-CF-003:** Configuração DEVE acontecer na inicialização do módulo

**SPEC-MC-CF-004:** Configuração NÃO DEVE bloquear carregamento da UI

### Tema

**SPEC-MC-CF-005:** Módulos DEVEM integrar com sistema de temas

**SPEC-MC-CF-006:** Componentes DEVEM usar CSS custom properties

**SPEC-MC-CF-007:** Componentes DEVEM funcionar em tema claro e escuro

**SPEC-MC-CF-008:** Brand color DEVE ser aplicável quando relevante

---

## 8. Performance

### Bundle Size

**SPEC-MC-PE-001:** Cada módulo DEVE ser um chunk separado

**SPEC-MC-PE-002:** Módulos NÃO DEVEM estar no bundle principal

**SPEC-MC-PE-003:** Lazy loading DEVE ser usado

**SPEC-MC-PE-004:** Tree-shaking DEVE ser aproveitado quando possível

### Carregamento

**SPEC-MC-PE-005:** Módulos DEVEM ser carregados apenas quando ativados

**SPEC-MC-PE-006:** Carregamento DEVE ser assíncrono

**SPEC-MC-PE-007:** Indicador de loading PODE ser exibido

---

## 9. Documentação

### README

**SPEC-MC-DO-001:** Cada módulo DEVE ter README.md

**SPEC-MC-DO-002:** README DEVE listar todas as bibliotecas incluídas

**SPEC-MC-DO-003:** README DEVE incluir versões das bibliotecas

**SPEC-MC-DO-004:** README DEVE incluir exemplos de uso

**SPEC-MC-DO-005:** README DEVE incluir links para documentação oficial das bibliotecas

### Exemplos

**SPEC-MC-DO-006:** Módulo DEVE incluir exemplos práticos

**SPEC-MC-DO-007:** Exemplos DEVEM ser funcionais (copiar e colar)

**SPEC-MC-DO-008:** Exemplos DEVEM cobrir casos de uso comuns

---

## 10. Testes

**SPEC-MC-TE-001:** Módulos DEVEM ter testes de integração

**SPEC-MC-TE-002:** Testes DEVEM verificar que bibliotecas carregam corretamente

**SPEC-MC-TE-003:** Testes DEVEM verificar exports principais

**SPEC-MC-TE-004:** Testes NÃO precisam testar bibliotecas em si (já testadas)

---

## 11. Versionamento

**SPEC-MC-VE-001:** Módulos DEVEM usar Semantic Versioning

**SPEC-MC-VE-002:** MAJOR: breaking changes (mudança de biblioteca, remoção de exports)

**SPEC-MC-VE-003:** MINOR: novas bibliotecas, novos exports

**SPEC-MC-VE-004:** PATCH: bug fixes, atualizações de dependências

**SPEC-MC-VE-005:** Changelog DEVE documentar mudanças de versão de bibliotecas

---

## 12. Atualização de Bibliotecas

**SPEC-MC-AT-001:** Bibliotecas DEVEM ser atualizadas regularmente

**SPEC-MC-AT-002:** Atualizações DEVEM ser testadas antes de release

**SPEC-MC-AT-003:** Breaking changes de bibliotecas DEVEM incrementar MAJOR do módulo

**SPEC-MC-AT-004:** Atualizações DEVEM ser documentadas no Changelog

---

## 13. Expansibilidade

### Novos Módulos

**SPEC-MC-EXP-001:** Novos módulos de componentes PODEM ser criados

**SPEC-MC-EXP-002:** Exemplos futuros: 3D Components, Map Components, Animation Components

**SPEC-MC-EXP-003:** Novos módulos DEVEM seguir mesma estrutura

**SPEC-MC-EXP-004:** Novos módulos DEVEM ter manifesto consistente

### Adição de Bibliotecas

**SPEC-MC-EXP-005:** Bibliotecas PODEM ser adicionadas a módulos existentes

**SPEC-MC-EXP-006:** Adição DEVE incrementar versão MINOR

**SPEC-MC-EXP-007:** Adição DEVE ser documentada no Changelog

---

## 14. Estrutura de Arquivos

**SPEC-MC-AR-001:** Estrutura sugerida:
```
src/modules/app-components/
├─ index.ts                 (exports principais)
├─ manifest.ts              (manifesto do módulo)
├─ README.md                (documentação)
├─ CHANGELOG.md             (histórico de versões)
├─ config/
│  ├─ tanstack-table.ts     (configurações específicas)
│  ├─ recharts.ts
│  └─ fullcalendar.ts
├─ examples/
│  ├─ table-example.tsx
│  ├─ chart-example.tsx
│  └─ calendar-example.tsx
└─ tests/
   └─ exports.test.ts
```

---

## 15. Compatibilidade

**SPEC-MC-CM-001:** Módulos DEVEM ser compatíveis com React 19

**SPEC-MC-CM-002:** Módulos DEVEM ser compatíveis com Vite

**SPEC-MC-CM-003:** Módulos DEVEM ser compatíveis com TypeScript

**SPEC-MC-CM-004:** Módulos DEVEM funcionar em todos os navegadores modernos

**SPEC-MC-CM-005:** Compatibilidade DEVE ser testada em CI/CD

---

## 16. Licenciamento

**SPEC-MC-LI-001:** Todas as bibliotecas incluídas DEVEM ter licenças compatíveis

**SPEC-MC-LI-002:** Licenças DEVEM ser documentadas no README

**SPEC-MC-LI-003:** Licenças DEVEM permitir uso comercial

**SPEC-MC-LI-004:** Preferir licenças MIT, Apache 2.0, BSD

---

*Esta especificação define requisitos dos módulos de componentes da plataforma. Implementação e uso detalhado em guias de desenvolvimento.*