/**
 * PDF Export Utilities
 *
 * Geração de PDFs usando pdfmake com suporte a:
 * - Layout customizado
 * - Tabelas
 * - Imagens
 * - Headers/Footers
 * - Índice automático
 */

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import type {
  TDocumentDefinitions,
  Content,
  StyleDictionary,
} from 'pdfmake/interfaces';

// Configurar fontes
if (pdfMake.vfs === undefined) {
  pdfMake.vfs = (pdfFonts as any).pdfMake.vfs;
}

export interface PDFContent {
  title?: string;
  subtitle?: string;
  content: Content[];
  metadata?: {
    author?: string;
    subject?: string;
    keywords?: string;
  };
  styles?: StyleDictionary;
  header?: Content;
  footer?: Content;
  pageSize?: 'A4' | 'LETTER' | 'LEGAL';
  pageOrientation?: 'portrait' | 'landscape';
}

export interface TableData {
  headers: string[];
  rows: (string | number)[][];
  widths?: (string | number)[];
}

/**
 * Exportar conteúdo para PDF
 */
export function exportToPDF(content: PDFContent, filename: string): void {
  const docDefinition: TDocumentDefinitions = {
    // Metadados
    info: {
      title: content.title || filename,
      author: content.metadata?.author || 'Platform',
      subject: content.metadata?.subject,
      keywords: content.metadata?.keywords,
    },

    // Configuração de página
    pageSize: content.pageSize || 'A4',
    pageOrientation: content.pageOrientation || 'portrait',
    pageMargins: [40, 60, 40, 60],

    // Conteúdo
    content: [
      // Título
      ...(content.title
        ? [
            {
              text: content.title,
              style: 'title',
            } as Content,
          ]
        : []),

      // Subtítulo
      ...(content.subtitle
        ? [
            {
              text: content.subtitle,
              style: 'subtitle',
              margin: [0, 5, 0, 20],
            } as Content,
          ]
        : []),

      // Conteúdo principal
      ...content.content,
    ] as Content,

    // Header e Footer
    header: content.header,
    footer: content.footer || ((currentPage: number, pageCount: number) => ({
      columns: [
        { text: '', width: '*' },
        {
          text: `Página ${currentPage} de ${pageCount}`,
          alignment: 'right',
          margin: [0, 0, 40, 0],
          fontSize: 9,
          color: '#666',
        },
      ],
    })),

    // Estilos
    styles: {
      title: {
        fontSize: 24,
        bold: true,
        margin: [0, 0, 0, 10],
      },
      subtitle: {
        fontSize: 16,
        italics: true,
        color: '#666',
      },
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 20, 0, 10],
      },
      subheader: {
        fontSize: 14,
        bold: true,
        margin: [0, 15, 0, 8],
      },
      paragraph: {
        fontSize: 11,
        lineHeight: 1.5,
        alignment: 'justify',
        margin: [0, 5, 0, 10],
      },
      tableHeader: {
        bold: true,
        fontSize: 11,
        color: 'white',
        fillColor: '#3B82F6',
      },
      ...content.styles,
    },

    // Configurações padrão
    defaultStyle: {
      font: 'Roboto',
      fontSize: 11,
    },
  };

  // Gerar e baixar PDF
  pdfMake.createPdf(docDefinition).download(filename);
}

/**
 * Criar definição de tabela para pdfmake
 */
export function createTable(data: TableData): Content {
  return {
    table: {
      headerRows: 1,
      widths: data.widths || Array(data.headers.length).fill('*'),
      body: [
        // Headers
        data.headers.map((header) => ({
          text: header,
          style: 'tableHeader',
        })),
        // Rows
        ...data.rows.map((row) =>
          row.map((cell) => ({
            text: String(cell),
            fontSize: 10,
          }))
        ),
      ],
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => '#E5E7EB',
      vLineColor: () => '#E5E7EB',
      paddingLeft: () => 8,
      paddingRight: () => 8,
      paddingTop: () => 6,
      paddingBottom: () => 6,
    },
    margin: [0, 10, 0, 10],
  };
}

/**
 * Criar seção com título
 */
export function createSection(title: string, content: Content): Content[] {
  return [
    {
      text: title,
      style: 'header',
    },
    content,
  ];
}

/**
 * Criar lista
 */
export function createList(items: string[], ordered = false): Content {
  return {
    [ordered ? 'ol' : 'ul']: items.map((item) => ({
      text: item,
      fontSize: 11,
      margin: [0, 2, 0, 2],
    })),
    margin: [0, 5, 0, 10],
  } as unknown as Content;
}

/**
 * Preview do PDF (abre em nova aba)
 */
export function previewPDF(content: PDFContent): void {
  const docDefinition: TDocumentDefinitions = {
    info: {
      title: content.title || 'Preview',
    },
    pageSize: content.pageSize || 'A4',
    pageOrientation: content.pageOrientation || 'portrait',
    pageMargins: [40, 60, 40, 60],
    content: content.content,
    styles: content.styles,
    defaultStyle: {
      font: 'Roboto',
      fontSize: 11,
    },
  };

  pdfMake.createPdf(docDefinition).open();
}
