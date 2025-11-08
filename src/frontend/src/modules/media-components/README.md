# Media Components Module

Módulo de componentes para visualização e consumo de conteúdo rico em diversos formatos.

## Componentes Disponíveis

### 1. MarkdownRenderer
Renderiza conteúdo Markdown com suporte a GFM (GitHub Flavored Markdown).

**Features:**
- CommonMark + GFM (tabelas, strikethrough, task lists)
- Syntax highlighting automático para code blocks
- Suporte a matemática (KaTeX)
- Links externos abrem em nova aba
- Tema claro/escuro automático

**Uso:**
```typescript
import { MarkdownRenderer } from '@/modules/media-components';

<MarkdownRenderer
  content={markdownText}
  allowHtml={false}
  components={{
    a: CustomLink,
    code: CustomCodeBlock
  }}
/>
```

### 2. PdfViewer
Visualizador de arquivos PDF com controles completos.

**Features:**
- Navegação entre páginas
- Zoom in/out
- Fit to width
- Download
- Loading state

**Uso:**
```typescript
import { PdfViewer } from '@/modules/media-components';

<PdfViewer
  url="/docs/manual.pdf"
  defaultPage={1}
  showDownload={true}
/>

// Ou com arquivo local
<PdfViewer
  file={uploadedFile}
/>
```

### 3. MermaidDiagram
Renderização de diagramas Mermaid.

**Features:**
- Flowchart, Sequence, Class, State, ER, Gantt, Pie, Git graphs
- Tema claro/escuro automático
- Error handling graceful

**Uso:**
```typescript
import { MermaidDiagram } from '@/modules/media-components';

<MermaidDiagram code={`
  graph TD
    A[Start] --> B[Process]
    B --> C{Decision}
    C -->|Yes| D[End]
    C -->|No| B
`} />
```

### 4. CodeBlock
Bloco de código com syntax highlighting.

**Features:**
- Syntax highlighting para 50+ linguagens
- Tema claro/escuro
- Números de linha (opcional)
- Copy to clipboard
- Highlight de linhas específicas

**Uso:**
```typescript
import { CodeBlock, InlineCode } from '@/modules/media-components';

<CodeBlock
  code={codeString}
  language="typescript"
  showLineNumbers={true}
  highlightLines={[5, 6, 7]}
/>

// Código inline
<InlineCode code="const x = 10;" />
```

### 5. VideoPlayer
Player de vídeo universal.

**Features:**
- Vídeos locais (mp4, webm, ogg)
- YouTube, Vimeo
- Streaming (HLS, DASH)
- Controles completos
- Fullscreen
- Velocidade de reprodução

**Uso:**
```typescript
import { VideoPlayer } from '@/modules/media-components';

// YouTube
<VideoPlayer
  url="https://youtube.com/watch?v=..."
  controls={true}
/>

// Vídeo local
<VideoPlayer
  url="/videos/demo.mp4"
  playing={false}
  volume={0.8}
/>
```

### 6. AudioPlayer
Player de áudio com visualização de waveform.

**Features:**
- Waveform visual interativo
- Controles de play/pause
- Seek na timeline
- Volume control
- Integração com tema

**Uso:**
```typescript
import { AudioPlayer } from '@/modules/media-components';

<AudioPlayer
  url="/audio/track.mp3"
  waveColor="hsl(var(--muted-foreground))"
  progressColor="hsl(var(--primary))"
  height={80}
/>
```

### 7. CsvViewer
Visualizador de arquivos CSV.

**Features:**
- Parse de CSV (string ou File)
- Detecção automática de delimitador
- Ordenação por coluna
- Filtro por coluna
- Virtualização para CSVs grandes (>1000 linhas)

**Uso:**
```typescript
import { CsvViewer } from '@/modules/media-components';

<CsvViewer
  file={csvFile}
  allowSort={true}
  allowFilter={true}
  maxRows={10000}
/>

// Ou com string
<CsvViewer
  data={csvString}
  pagination={true}
  pageSize={50}
/>
```

## Integração com Tema

Todos os componentes respeitam automaticamente o tema claro/escuro da plataforma:

- MarkdownRenderer usa `prose dark:prose-invert`
- PdfViewer adapta controles ao tema
- MermaidDiagram muda tema dos diagramas
- CodeBlock usa temas Prism light/dark
- AudioPlayer usa cores semânticas

## Performance

- **Lazy Loading**: Componentes pesados (PDF, Video) podem ser lazy-loaded
- **Code Splitting**: Cada componente é um chunk separado
- **Virtualização**: CsvViewer usa virtualização para CSVs grandes
- **Bundle Total**: ~500KB gzipped

## Acessibilidade

- Vídeos e áudios com controles acessíveis via teclado
- Suporte a legendas em vídeos (quando fornecidas)
- Alt text em imagens Markdown
- Código acessível para screen readers
- Tabelas CSV com headers apropriados

## Tratamento de Erros

Todos os componentes tratam erros gracefully:

```typescript
// PdfViewer exibe erro se PDF inválido
<PdfViewer url={invalidUrl} />
// Mostra: "Erro ao carregar PDF"

// MermaidDiagram exibe erro se sintaxe inválida
<MermaidDiagram code={invalidSyntax} />
// Mostra: "Erro no diagrama Mermaid: [mensagem]"

// CsvViewer exibe erro se parsing falhar
<CsvViewer data={invalidCsv} />
// Mostra: "Erro ao parsear CSV: [mensagem]"
```

## Linguagens Suportadas (CodeBlock)

- JavaScript, TypeScript
- Python, Ruby, PHP
- Java, C#, C++, Go, Rust
- HTML, CSS, SCSS
- JSON, YAML, XML
- SQL, GraphQL
- Bash/Shell
- Markdown
- E muitas outras...

## Tipos de Diagramas Mermaid

- Flowchart (graph)
- Sequence Diagram (sequenceDiagram)
- Class Diagram (classDiagram)
- State Diagram (stateDiagram)
- ER Diagram (erDiagram)
- Gantt Chart (gantt)
- Pie Chart (pie)
- Git Graph (gitGraph)

## Exemplos de Uso

### Chat com Markdown
```typescript
<MarkdownRenderer
  content={message.content}
  components={{
    code: CodeBlock,
    a: ExternalLink
  }}
/>
```

### Documentação com PDF
```typescript
<PdfViewer
  url="/docs/manual.pdf"
  defaultPage={1}
  showDownload={true}
/>
```

### Landing Page com Vídeo
```typescript
<VideoPlayer
  url="https://youtube.com/watch?v=..."
  width="100%"
  controls={true}
/>
```

### Dashboard com CSV
```typescript
<CsvViewer
  file={uploadedFile}
  allowSort={true}
  allowFilter={true}
/>
```

## Dependências

- react-markdown (Markdown)
- react-pdf (PDF)
- mermaid (Diagramas)
- react-syntax-highlighter (Código)
- react-player (Vídeo)
- wavesurfer.js (Áudio)
- papaparse (CSV)

## TypeScript

Todos os componentes são totalmente tipados:

```typescript
import type { MarkdownRendererProps } from '@/modules/media-components';
import type { PdfViewerProps } from '@/modules/media-components';
```

## Módulos Dependentes

Os seguintes módulos dependem de Media Components:
- Chat Module (Markdown, PDF, vídeo)
- MarkBrowser Module (Markdown)
- Dashboard Module (CSV)
- Documentation Module (todos)
