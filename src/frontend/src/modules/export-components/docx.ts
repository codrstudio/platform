/**
 * DOCX Export Utilities
 *
 * Geração de arquivos DOCX (Microsoft Word) usando docx.js
 *
 * Features:
 * - Parágrafos com formatação
 * - Títulos (Heading 1-6)
 * - Listas
 * - Tabelas
 * - Imagens
 * - Headers/Footers
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from 'docx';
import { saveAs } from 'file-saver';

export interface DOCXContent {
  title?: string;
  sections: DOCXSection[];
  metadata?: {
    author?: string;
    subject?: string;
    keywords?: string;
  };
}

export interface DOCXSection {
  type:
    | 'title'
    | 'heading1'
    | 'heading2'
    | 'heading3'
    | 'paragraph'
    | 'list'
    | 'table';
  content: any;
  alignment?: 'left' | 'center' | 'right' | 'justify';
}

export interface DOCXTableData {
  headers: string[];
  rows: (string | number)[][];
}

/**
 * Exportar conteúdo para DOCX
 */
export async function exportToDOCX(
  content: DOCXContent,
  filename: string
): Promise<void> {
  const paragraphs: Paragraph[] = [];

  // Processar cada seção
  for (const section of content.sections) {
    switch (section.type) {
      case 'title':
        paragraphs.push(
          new Paragraph({
            text: section.content,
            heading: HeadingLevel.TITLE,
            alignment: getAlignment(section.alignment || 'center'),
            spacing: { after: 400 },
          })
        );
        break;

      case 'heading1':
        paragraphs.push(
          new Paragraph({
            text: section.content,
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          })
        );
        break;

      case 'heading2':
        paragraphs.push(
          new Paragraph({
            text: section.content,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 150 },
          })
        );
        break;

      case 'heading3':
        paragraphs.push(
          new Paragraph({
            text: section.content,
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 100 },
          })
        );
        break;

      case 'paragraph':
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: section.content,
                size: 22, // 11pt
              }),
            ],
            alignment: getAlignment(section.alignment || 'justify'),
            spacing: { after: 200 },
          })
        );
        break;

      case 'list':
        const items = Array.isArray(section.content)
          ? section.content
          : [section.content];
        items.forEach((item: string) => {
          paragraphs.push(
            new Paragraph({
              text: `• ${item}`,
              spacing: { after: 100 },
            })
          );
        });
        break;

      case 'table':
        // Tabelas são adicionadas via createTable
        break;
    }
  }

  // Criar documento
  const doc = new Document({
    creator: content.metadata?.author || 'Platform',
    title: content.title,
    subject: content.metadata?.subject,
    keywords: content.metadata?.keywords,
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  // Gerar e baixar
  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}

/**
 * Criar tabela para DOCX
 */
export function createDOCXTable(data: DOCXTableData): Table {
  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    rows: [
      // Header row
      new TableRow({
        children: data.headers.map(
          (header) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: header,
                      bold: true,
                    }),
                  ],
                }),
              ],
              shading: {
                fill: '3B82F6',
                color: 'FFFFFF',
              },
            })
        ),
      }),
      // Data rows
      ...data.rows.map(
        (row) =>
          new TableRow({
            children: row.map(
              (cell) =>
                new TableCell({
                  children: [new Paragraph(String(cell))],
                })
            ),
          })
      ),
    ],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
      left: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
      right: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
    },
  });
}

/**
 * Helper para obter alignment enum
 */
function getAlignment(
  alignment: 'left' | 'center' | 'right' | 'justify'
): typeof AlignmentType[keyof typeof AlignmentType] {
  switch (alignment) {
    case 'left':
      return AlignmentType.LEFT;
    case 'center':
      return AlignmentType.CENTER;
    case 'right':
      return AlignmentType.RIGHT;
    case 'justify':
      return AlignmentType.JUSTIFIED;
    default:
      return AlignmentType.LEFT;
  }
}
