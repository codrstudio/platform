# SPEC-module-media-components.md

## Especificação: Módulo Media Components

### Escopo
Este documento especifica o módulo Media Components, responsável por fornecer componentes para visualização e consumo de conteúdo rico em diversos formatos.

---

## 1. Definição

### Propósito
O módulo Media Components fornece bibliotecas e componentes para renderização de Markdown, PDFs, diagramas, código com syntax highlighting, vídeos, áudio e arquivos CSV.

### Natureza
- **Tipo**: Módulo de Componentes
- **Dependências**: Nenhuma
- **Opcional**: Sim

---

## 2. Responsabilidades

### SPEC-MEDIA-R-001
O módulo Media Components DEVE fornecer componentes prontos para visualização de mídia

### SPEC-MEDIA-R-002
O módulo Media Components NÃO DEVE implementar lógica de negócio

### SPEC-MEDIA-R-003
O módulo Media Components DEVE ser leve e focado em visualização

### SPEC-MEDIA-R-004
O módulo Media Components DEVE integrar-se com tema da plataforma (claro/escuro)

---

## 3. Bibliotecas Incluídas

### SPEC-MEDIA-L-001: react-markdown
**Propósito:** Renderização de Markdown

**Versão mínima:** 8.0+

**Funcionalidades obrigatórias:**
- Renderizar texto Markdown padrão
- Suporte a GFM (GitHub Flavored Markdown)
- Suporte a tabelas
- Suporte a listas de tarefas
- Sanitização de HTML por padrão

### SPEC-MEDIA-L-002: react-pdf
**Propósito:** Visualização de arquivos PDF

**Versão mínima:** 7.0+

**Funcionalidades obrigatórias:**
- Renderizar documentos PDF
- Navegação entre páginas
- Zoom in/out
- Controles de navegação

### SPEC-MEDIA-L-003: Mermaid
**Propósito:** Renderização de diagramas

**Versão mínima:** 10.0+

**Funcionalidades obrigatórias:**
- Renderizar diagramas de fluxo
- Renderizar diagramas de sequência
- Renderizar diagramas de classes
- Renderizar diagramas ER
- Renderizar gantt charts
- Tema adaptável (claro/escuro)

### SPEC-MEDIA-L-004: Prism.js ou highlight.js
**Propósito:** Syntax highlighting para código

**Versão mínima:** Prism 1.29+ ou highlight.js 11.0+

**Funcionalidades obrigatórias:**
- Syntax highlighting para linguagens comuns (JS, TS, Python, Java, etc)
- Temas claro e escuro
- Números de linha (opcional)
- Copy to clipboard (opcional)

### SPEC-MEDIA-L-005: react-player
**Propósito:** Player de vídeo universal

**Versão mínima:** 2.13+

**Funcionalidades obrigatórias:**
- Reproduzir vídeos locais
- Reproduzir YouTube
- Reproduzir Vimeo
- Reproduzir streaming (HLS, DASH)
- Controles padrão
- Fullscreen
- Velocidade de reprodução

### SPEC-MEDIA-L-006: wavesurfer.js
**Propósito:** Player de áudio com waveform

**Versão mínima:** 7.0+

**Funcionalidades obrigatórias:**
- Renderizar waveform visual
- Controles de play/pause
- Seek na timeline
- Volume control
- Visualização responsiva

### SPEC-MEDIA-L-007: Papa Parse
**Propósito:** Parser e visualizador de CSV

**Versão mínima:** 5.4+

**Funcionalidades obrigatórias:**
- Parsear arquivos CSV
- Detectar delimitadores automaticamente
- Converter para JSON
- Streaming de arquivos grandes
- Encoding detection

---

## 4. Componentes Exportados

### Obrigatórios

**SPEC-MEDIA-C-001:** Módulo DEVE exportar:
```typescript
// Markdown
<MarkdownRenderer content={string} />
<MarkdownEditor value={string} onChange={fn} /> // opcional

// PDF
<PdfViewer url={string} />
<PdfViewer file={File} />

// Diagramas
<MermaidDiagram code={string} />

// Código
<CodeBlock code={string} language={string} />
<InlineCode code={string} />

// Vídeo
<VideoPlayer url={string} />
<VideoPlayer sources={Source[]} />

// Áudio
<AudioPlayer url={string} />
<AudioWaveform url={string} />

// CSV
<CsvViewer data={string | File} />
<CsvTable data={ParsedCsv} />
```

---

## 5. Markdown Component

### Renderização

**SPEC-MEDIA-MD-001:** Componente DEVE renderizar Markdown padrão (CommonMark)

**SPEC-MEDIA-MD-002:** Componente DEVE suportar GFM (GitHub Flavored Markdown):
- Tabelas
- Strikethrough (~~texto~~)
- Task lists (- [ ] tarefa)
- Autolinks

**SPEC-MEDIA-MD-003:** Componente DEVE sanitizar HTML por padrão

**SPEC-MEDIA-MD-004:** Componente PODE permitir HTML raw se explicitamente configurado

### Customização

**SPEC-MEDIA-MD-005:** Componente DEVE aceitar componentes customizados:
```typescript
<MarkdownRenderer
  content={markdown}
  components={{
    h1: CustomH1,
    a: CustomLink,
    code: CustomCodeBlock
  }}
/>
```

**SPEC-MEDIA-MD-006:** Links externos DEVEM abrir em nova aba por padrão

**SPEC-MEDIA-MD-007:** Links internos DEVEM usar React Router

### Syntax Highlighting

**SPEC-MEDIA-MD-008:** Code blocks DEVEM ter syntax highlighting automático

**SPEC-MEDIA-MD-009:** Linguagem DEVE ser detectada pelo fence (```language)

---

## 6. PDF Component

### Visualização

**SPEC-MEDIA-PDF-001:** Componente DEVE renderizar PDF de URL ou File

**SPEC-MEDIA-PDF-002:** Componente DEVE exibir controles:
- Navegação (anterior/próxima página)
- Input de página (ir para página X)
- Zoom in/out
- Fit to width/height
- Download

**SPEC-MEDIA-PDF-003:** Componente DEVE exibir loading durante carregamento

**SPEC-MEDIA-PDF-004:** Componente DEVE exibir erro se falhar

### Performance

**SPEC-MEDIA-PDF-005:** Componente PODE usar lazy loading de páginas

**SPEC-MEDIA-PDF-006:** Componente DEVE renderizar apenas páginas visíveis

---

## 7. Mermaid Component

### Renderização

**SPEC-MEDIA-MERM-001:** Componente DEVE renderizar diagramas Mermaid válidos

**SPEC-MEDIA-MERM-002:** Componente DEVE usar tema claro/escuro da plataforma

**SPEC-MEDIA-MERM-003:** Componente DEVE exibir erro se sintaxe inválida

**SPEC-MEDIA-MERM-004:** Erro NÃO DEVE quebrar página, apenas exibir mensagem

### Tipos Suportados

**SPEC-MEDIA-MERM-005:** Componente DEVE suportar:
- Flowchart
- Sequence diagram
- Class diagram
- State diagram
- ER diagram
- Gantt chart
- Pie chart
- Git graph

---

## 8. Code Block Component

### Syntax Highlighting

**SPEC-MEDIA-CODE-001:** Componente DEVE aplicar syntax highlighting

**SPEC-MEDIA-CODE-002:** Componente DEVE suportar linguagens comuns:
- JavaScript, TypeScript
- Python
- Java, C#, C++
- HTML, CSS
- SQL
- JSON, YAML
- Bash/Shell
- Markdown

**SPEC-MEDIA-CODE-003:** Componente DEVE usar tema claro/escuro da plataforma

### Funcionalidades Opcionais

**SPEC-MEDIA-CODE-004:** Componente PODE exibir números de linha

**SPEC-MEDIA-CODE-005:** Componente PODE ter botão "Copy to clipboard"

**SPEC-MEDIA-CODE-006:** Componente PODE destacar linhas específicas

**SPEC-MEDIA-CODE-007:** Componente PODE exibir diff (adições/remoções)

---

## 9. Video Player Component

### Reprodução

**SPEC-MEDIA-VID-001:** Componente DEVE reproduzir vídeos de múltiplas fontes:
- Arquivos locais (mp4, webm, ogg)
- YouTube (URL)
- Vimeo (URL)
- Streaming (HLS, DASH)

**SPEC-MEDIA-VID-002:** Componente DEVE exibir controles padrão:
- Play/pause
- Timeline/scrubber
- Volume
- Fullscreen
- Velocidade de reprodução

**SPEC-MEDIA-VID-003:** Componente DEVE adaptar-se ao tamanho do container

### Funcionalidades Opcionais

**SPEC-MEDIA-VID-004:** Componente PODE exibir thumbnail de preview

**SPEC-MEDIA-VID-005:** Componente PODE ter Picture-in-Picture

**SPEC-MEDIA-VID-006:** Componente PODE ter legendas/subtitles

---

## 10. Audio Player Component

### Reprodução

**SPEC-MEDIA-AUD-001:** Componente DEVE reproduzir arquivos de áudio (mp3, wav, ogg)

**SPEC-MEDIA-AUD-002:** Componente DEVE exibir controles:
- Play/pause
- Timeline/scrubber
- Volume
- Velocidade de reprodução

### Waveform

**SPEC-MEDIA-AUD-003:** Componente com waveform DEVE renderizar visualização de onda

**SPEC-MEDIA-AUD-004:** Waveform DEVE ser interativo (clicar para seek)

**SPEC-MEDIA-AUD-005:** Waveform DEVE usar cores do tema da plataforma

---

## 11. CSV Component

### Parsing

**SPEC-MEDIA-CSV-001:** Componente DEVE parsear CSV de string ou File

**SPEC-MEDIA-CSV-002:** Componente DEVE detectar delimitador automaticamente (`,` `;` `\t` `|`)

**SPEC-MEDIA-CSV-003:** Componente DEVE detectar encoding (UTF-8, Latin1, etc)

**SPEC-MEDIA-CSV-004:** Componente DEVE tratar headers automaticamente

### Visualização

**SPEC-MEDIA-CSV-005:** Componente DEVE exibir dados em tabela

**SPEC-MEDIA-CSV-006:** Tabela DEVE ter scroll horizontal se muitas colunas

**SPEC-MEDIA-CSV-007:** Tabela DEVE ter scroll vertical se muitas linhas

**SPEC-MEDIA-CSV-008:** Componente PODE usar virtualização para CSVs grandes (>1000 linhas)

### Funcionalidades Opcionais

**SPEC-MEDIA-CSV-009:** Componente PODE permitir ordenação por coluna

**SPEC-MEDIA-CSV-010:** Componente PODE permitir filtro por coluna

**SPEC-MEDIA-CSV-011:** Componente PODE exportar dados filtrados

---

## 12. Integração com Tema

### Cores

**SPEC-MEDIA-THEME-001:** Todos os componentes DEVEM respeitar tema claro/escuro

**SPEC-MEDIA-THEME-002:** Componentes DEVEM usar cores semânticas do Tailwind:
- `text-foreground`, `text-muted-foreground`
- `bg-background`, `bg-card`
- `border-border`

**SPEC-MEDIA-THEME-003:** Syntax highlighting DEVE ter temas claro e escuro

**SPEC-MEDIA-THEME-004:** Mermaid DEVE usar tema matching da plataforma

### Responsividade

**SPEC-MEDIA-THEME-005:** Todos os componentes DEVEM ser responsivos

**SPEC-MEDIA-THEME-006:** Componentes DEVEM funcionar em mobile, tablet e desktop

---

## 13. Performance

### Lazy Loading

**SPEC-MEDIA-PERF-001:** Bibliotecas pesadas DEVEM usar lazy loading:
```typescript
const PdfViewer = lazy(() => import('./PdfViewer'));
const VideoPlayer = lazy(() => import('./VideoPlayer'));
```

**SPEC-MEDIA-PERF-002:** Componentes lazy DEVEM ter fallback de loading

### Bundle Size

**SPEC-MEDIA-PERF-003:** Módulo completo DEVE ter < 500KB (gzipped)

**SPEC-MEDIA-PERF-004:** Cada componente PODE ser importado individualmente

**SPEC-MEDIA-PERF-005:** Tree shaking DEVE funcionar corretamente

---

## 14. Acessibilidade

**SPEC-MEDIA-A11Y-001:** Vídeos e áudios DEVEM ter controles acessíveis via teclado

**SPEC-MEDIA-A11Y-002:** Vídeos DEVEM suportar legendas quando fornecidas

**SPEC-MEDIA-A11Y-003:** Imagens em Markdown DEVEM ter alt text

**SPEC-MEDIA-A11Y-004:** Código DEVE ser lido por screen readers

**SPEC-MEDIA-A11Y-005:** Tabelas CSV DEVEM ter headers apropriados

---

## 15. Tratamento de Erros

**SPEC-MEDIA-ERR-001:** Todos os componentes DEVEM tratar erros gracefully

**SPEC-MEDIA-ERR-002:** Erros DEVEM exibir mensagem clara ao usuário

**SPEC-MEDIA-ERR-003:** Erros NÃO DEVEM quebrar aplicação

**SPEC-MEDIA-ERR-004:** Componentes PODEM ter fallback customizável:
```typescript
<PdfViewer 
  url={url}
  onError={(error) => <CustomError error={error} />}
/>
```

---

## 16. Exemplos de Uso

### Markdown em Chat
```typescript
<MarkdownRenderer 
  content={message.content}
  components={{
    code: CodeBlock,
    a: ExternalLink
  }}
/>
```

### PDF Viewer em Documentação
```typescript
<PdfViewer
  url="/docs/manual.pdf"
  defaultPage={1}
  showDownload={true}
/>
```

### Video Player em Landing Page
```typescript
<VideoPlayer
  url="https://youtube.com/watch?v=..."
  width="100%"
  controls={true}
  playing={false}
/>
```

### CSV Viewer em Dashboard
```typescript
<CsvViewer
  file={uploadedFile}
  pagination={true}
  pageSize={50}
  allowSort={true}
/>
```

### Mermaid em Documentação
```typescript
<MermaidDiagram code={`
  graph TD
    A[Start] --> B[Process]
    B --> C[End]
`} />
```

---

## 17. Dependências de Módulos

**SPEC-MEDIA-DEP-001:** Módulos que dependem de Media Components:
- Chat Module (Markdown, PDF, vídeo em mensagens)
- MarkBrowser Module (Markdown rendering)
- Dashboard Module (CSV visualization)
- Documentation Module (todos os tipos)

**SPEC-MEDIA-DEP-002:** Ativação automática quando módulos dependentes são ativados

---

*Esta especificação define os requisitos do módulo Media Components. Implementação técnica em documentação separada.*