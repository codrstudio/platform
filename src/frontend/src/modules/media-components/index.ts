/**
 * Media Components Module
 *
 * Componentes para visualização e consumo de conteúdo rico em diversos formatos:
 * - Markdown (GFM)
 * - PDF
 * - Diagramas (Mermaid)
 * - Código (syntax highlighting)
 * - Vídeo (YouTube, Vimeo, local, streaming)
 * - Áudio (com waveform)
 * - CSV
 *
 * @module media-components
 * @type components
 */

// Markdown
export { MarkdownRenderer } from './MarkdownRenderer';

// PDF
export { PdfViewer } from './PdfViewer';

// Diagramas
export { MermaidDiagram } from './MermaidDiagram';

// Código
export { CodeBlock, InlineCode } from './CodeBlock';

// Vídeo
export { VideoPlayer } from './VideoPlayer';

// Áudio
export { AudioPlayer } from './AudioPlayer';

// CSV
export { CsvViewer } from './CsvViewer';
