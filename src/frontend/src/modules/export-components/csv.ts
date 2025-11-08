/**
 * CSV Export Utilities
 *
 * Exportação de dados para CSV usando Papa Parse
 *
 * Features:
 * - Conversão de arrays/objetos para CSV
 * - Delimitadores configuráveis
 * - UTF-8 com BOM (para Excel)
 * - Headers customizados
 */

import Papa from 'papaparse';
import { saveAs } from 'file-saver';

export interface CSVOptions {
  delimiter?: string;
  headers?: string[];
  encoding?: 'utf-8' | 'utf-8-bom';
  newline?: string;
  skipEmptyLines?: boolean;
}

/**
 * Exportar dados para CSV
 */
export function exportToCSV(
  data: any[],
  filename: string,
  options: CSVOptions = {}
): void {
  const {
    delimiter = ',',
    headers,
    encoding = 'utf-8-bom', // Para Excel
    newline = '\r\n',
    skipEmptyLines = true,
  } = options;

  // Converter dados para CSV
  const csv = Papa.unparse(data, {
    delimiter,
    header: true,
    columns: headers,
    newline,
    skipEmptyLines,
  });

  // Criar blob com encoding apropriado
  let blob: Blob;

  if (encoding === 'utf-8-bom') {
    // Adicionar BOM para Excel reconhecer UTF-8
    const BOM = '\uFEFF';
    blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' });
  } else {
    blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  }

  // Baixar arquivo
  saveAs(blob, filename);
}

/**
 * Converter dados para string CSV (sem baixar)
 */
export function dataToCSV(
  data: any[],
  options: Omit<CSVOptions, 'encoding'> = {}
): string {
  const {
    delimiter = ',',
    headers,
    newline = '\r\n',
    skipEmptyLines = true,
  } = options;

  return Papa.unparse(data, {
    delimiter,
    header: true,
    columns: headers,
    newline,
    skipEmptyLines,
  });
}

/**
 * Parsear CSV para objetos (útil para re-exportação)
 */
export function parseCSV<T = any>(
  csvString: string,
  options: {
    header?: boolean;
    delimiter?: string;
    skipEmptyLines?: boolean;
  } = {}
): T[] {
  const { header = true, delimiter, skipEmptyLines = true } = options;

  const result = Papa.parse<T>(csvString, {
    header,
    delimiter,
    skipEmptyLines,
    dynamicTyping: true,
  });

  return result.data;
}

/**
 * Exportar tabela HTML para CSV
 */
export function exportTableToCSV(
  tableElement: HTMLTableElement,
  filename: string,
  options: CSVOptions = {}
): void {
  const data: any[] = [];

  // Extrair headers
  const headerRow = tableElement.querySelector('thead tr');
  const headers: string[] = [];

  if (headerRow) {
    headerRow.querySelectorAll('th').forEach((th) => {
      headers.push(th.textContent?.trim() || '');
    });
  }

  // Extrair dados
  const rows = tableElement.querySelectorAll('tbody tr');
  rows.forEach((row) => {
    const rowData: any = {};
    row.querySelectorAll('td').forEach((td, index) => {
      const header = headers[index] || `Column ${index + 1}`;
      rowData[header] = td.textContent?.trim() || '';
    });
    data.push(rowData);
  });

  // Exportar
  exportToCSV(data, filename, { ...options, headers });
}

/**
 * Formatar dados para CSV (adicionar headers se necessário)
 */
export function formatDataForCSV(
  data: any[],
  columnMapping?: Record<string, string>
): any[] {
  if (!columnMapping) return data;

  return data.map((row) => {
    const formatted: any = {};
    Object.entries(columnMapping).forEach(([key, label]) => {
      formatted[label] = row[key];
    });
    return formatted;
  });
}
