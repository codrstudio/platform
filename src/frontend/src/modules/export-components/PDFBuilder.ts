/**
 * PDFBuilder - Fluent API para construção de PDFs
 *
 * Facilita a criação de PDFs complexos com uma API fluente e intuitiva.
 *
 * Exemplo:
 * ```typescript
 * new PDFBuilder()
 *   .setTitle('Relatório')
 *   .addSection('Resumo', 'Texto do resumo...')
 *   .addTable(data)
 *   .download('relatorio.pdf');
 * ```
 */

import type { Content, StyleDictionary } from 'pdfmake/interfaces';
import { exportToPDF, createTable, createList, type TableData } from './pdf';

export class PDFBuilder {
  private title?: string;
  private subtitle?: string;
  private content: Content[] = [];
  private metadata: {
    author?: string;
    subject?: string;
    keywords?: string;
  } = {};
  private styles: StyleDictionary = {};
  private pageSize: 'A4' | 'LETTER' | 'LEGAL' = 'A4';
  private pageOrientation: 'portrait' | 'landscape' = 'portrait';

  /**
   * Definir título do documento
   */
  setTitle(title: string): this {
    this.title = title;
    return this;
  }

  /**
   * Definir subtítulo do documento
   */
  setSubtitle(subtitle: string): this {
    this.subtitle = subtitle;
    return this;
  }

  /**
   * Definir autor
   */
  setAuthor(author: string): this {
    this.metadata.author = author;
    return this;
  }

  /**
   * Definir assunto
   */
  setSubject(subject: string): this {
    this.metadata.subject = subject;
    return this;
  }

  /**
   * Definir palavras-chave
   */
  setKeywords(keywords: string): this {
    this.metadata.keywords = keywords;
    return this;
  }

  /**
   * Definir tamanho da página
   */
  setPageSize(size: 'A4' | 'LETTER' | 'LEGAL'): this {
    this.pageSize = size;
    return this;
  }

  /**
   * Definir orientação da página
   */
  setPageOrientation(orientation: 'portrait' | 'landscape'): this {
    this.pageOrientation = orientation;
    return this;
  }

  /**
   * Adicionar parágrafo
   */
  addParagraph(text: string, style?: string): this {
    this.content.push({
      text,
      style: style || 'paragraph',
    });
    return this;
  }

  /**
   * Adicionar seção com título
   */
  addSection(title: string, content: string | Content): this {
    this.content.push({
      text: title,
      style: 'header',
    });

    if (typeof content === 'string') {
      this.content.push({
        text: content,
        style: 'paragraph',
      });
    } else {
      this.content.push(content);
    }

    return this;
  }

  /**
   * Adicionar cabeçalho
   */
  addHeading(text: string, level: 1 | 2 | 3 = 1): this {
    const styleMap = {
      1: 'header',
      2: 'subheader',
      3: 'subheader',
    };

    this.content.push({
      text,
      style: styleMap[level],
      fontSize: level === 1 ? 18 : level === 2 ? 14 : 12,
    });

    return this;
  }

  /**
   * Adicionar tabela
   */
  addTable(data: TableData): this {
    this.content.push(createTable(data));
    return this;
  }

  /**
   * Adicionar lista
   */
  addList(items: string[], ordered = false): this {
    this.content.push(createList(items, ordered));
    return this;
  }

  /**
   * Adicionar imagem
   */
  addImage(imageUrl: string, width?: number, height?: number): this {
    this.content.push({
      image: imageUrl,
      width: width || 400,
      height: height,
      margin: [0, 10, 0, 10],
    });
    return this;
  }

  /**
   * Adicionar quebra de página
   */
  addPageBreak(): this {
    this.content.push({
      text: '',
      pageBreak: 'after',
    });
    return this;
  }

  /**
   * Adicionar espaçamento
   */
  addSpace(height = 20): this {
    this.content.push({
      text: '',
      margin: [0, 0, 0, height],
    });
    return this;
  }

  /**
   * Adicionar linha horizontal
   */
  addHorizontalLine(): this {
    this.content.push({
      canvas: [
        {
          type: 'line',
          x1: 0,
          y1: 0,
          x2: 515, // A4 width - margins
          y2: 0,
          lineWidth: 1,
          lineColor: '#E5E7EB',
        },
      ],
      margin: [0, 10, 0, 10],
    });
    return this;
  }

  /**
   * Adicionar capa
   */
  addCover(options: {
    title: string;
    subtitle?: string;
    logo?: string;
    date?: string;
  }): this {
    const coverContent: Content[] = [];

    // Logo
    if (options.logo) {
      coverContent.push({
        image: options.logo,
        width: 150,
        alignment: 'center',
        margin: [0, 100, 0, 50],
      });
    }

    // Título
    coverContent.push({
      text: options.title,
      fontSize: 32,
      bold: true,
      alignment: 'center',
      margin: [0, options.logo ? 0 : 200, 0, 20],
    });

    // Subtítulo
    if (options.subtitle) {
      coverContent.push({
        text: options.subtitle,
        fontSize: 18,
        italics: true,
        color: '#666',
        alignment: 'center',
        margin: [0, 0, 0, 100],
      });
    }

    // Data
    if (options.date) {
      coverContent.push({
        text: options.date,
        fontSize: 12,
        color: '#999',
        alignment: 'center',
        margin: [0, 0, 0, 0],
      });
    }

    this.content.push(...coverContent);
    this.addPageBreak();

    return this;
  }

  /**
   * Adicionar índice (Table of Contents)
   */
  addTableOfContents(items: { title: string; page: number }[]): this {
    this.content.push({
      text: 'Índice',
      style: 'header',
      margin: [0, 0, 0, 20],
    });

    items.forEach((item) => {
      this.content.push({
        text: `${item.title}`,
        link: `#page${item.page}`,
        style: 'paragraph',
        margin: [0, 5, 0, 5],
      });
    });

    this.addPageBreak();

    return this;
  }

  /**
   * Adicionar conteúdo customizado
   */
  addCustomContent(content: Content): this {
    this.content.push(content);
    return this;
  }

  /**
   * Definir estilos customizados
   */
  setStyles(styles: StyleDictionary): this {
    this.styles = { ...this.styles, ...styles };
    return this;
  }

  /**
   * Construir e baixar PDF
   */
  download(filename: string): void {
    exportToPDF(
      {
        title: this.title,
        subtitle: this.subtitle,
        content: this.content,
        metadata: this.metadata,
        styles: this.styles,
        pageSize: this.pageSize,
        pageOrientation: this.pageOrientation,
      },
      filename
    );
  }

  /**
   * Obter definição do documento (para preview ou processamento adicional)
   */
  build() {
    return {
      title: this.title,
      subtitle: this.subtitle,
      content: this.content,
      metadata: this.metadata,
      styles: this.styles,
      pageSize: this.pageSize,
      pageOrientation: this.pageOrientation,
    };
  }
}
