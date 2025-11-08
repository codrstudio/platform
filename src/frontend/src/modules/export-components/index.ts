/**
 * Export Components Module
 *
 * Capacidades de exportação de conteúdo em diversos formatos:
 * - PDF (pdfmake)
 * - DOCX (docx.js)
 * - CSV (Papa Parse)
 *
 * Geração ocorre completamente no frontend, sem necessidade de backend.
 *
 * @module export-components
 * @type components
 */

// PDF
export {
  exportToPDF,
  createTable,
  createSection,
  createList,
  previewPDF,
  type PDFContent,
  type TableData,
} from './pdf';

// DOCX
export {
  exportToDOCX,
  createDOCXTable,
  type DOCXContent,
  type DOCXSection,
  type DOCXTableData,
} from './docx';

// CSV
export {
  exportToCSV,
  dataToCSV,
  parseCSV,
  exportTableToCSV,
  formatDataForCSV,
  type CSVOptions,
} from './csv';

// PDFBuilder (Fluent API)
export { PDFBuilder } from './PDFBuilder';

// Utilities
export * from './utils';
