# Export Components Module

Módulo de capacidades de exportação de conteúdo para PDF, DOCX e CSV diretamente no frontend, sem necessidade de processamento no backend.

## Características

- **Frontend-only**: Toda geração ocorre no navegador
- **Múltiplos formatos**: PDF, DOCX, CSV
- **Fluent API**: PDFBuilder para construção intuitiva de PDFs
- **Layout customizado**: Controle total de formatação
- **TypeScript**: Totalmente tipado

## Bibliotecas Incluídas

- **pdfmake** - Geração de PDFs
- **docx** - Geração de arquivos DOCX (Microsoft Word)
- **Papa Parse** - Parse e stringify de CSV
- **file-saver** - Download de arquivos no navegador

## Exportação para PDF

### Uso Básico

```typescript
import { exportToPDF } from '@/modules/export-components';

exportToPDF({
  title: 'Relatório Mensal',
  subtitle: 'Vendas de Outubro',
  content: [
    { text: 'Resumo Executivo', style: 'header' },
    { text: 'Texto do relatório...', style: 'paragraph' },
  ]
}, 'relatorio-outubro.pdf');
```

### PDFBuilder (Fluent API)

```typescript
import { PDFBuilder } from '@/modules/export-components';

new PDFBuilder()
  .setTitle('Relatório de Vendas')
  .setSubtitle('Q3 2025')
  .setAuthor('João Silva')
  .addSection('Resumo Executivo', 'Texto do resumo...')
  .addTable({
    headers: ['Produto', 'Quantidade', 'Valor'],
    rows: [
      ['Produto A', 100, 'R$ 10.000'],
      ['Produto B', 50, 'R$ 5.000'],
    ]
  })
  .addPageBreak()
  .addSection('Conclusão', 'Texto da conclusão...')
  .download('relatorio-vendas.pdf');
```

### Com Capa

```typescript
new PDFBuilder()
  .addCover({
    title: 'Relatório Anual',
    subtitle: '2025',
    logo: 'data:image/png;base64,...',
    date: '31 de Dezembro de 2025'
  })
  .addTableOfContents([
    { title: 'Introdução', page: 2 },
    { title: 'Análise de Dados', page: 5 },
    { title: 'Conclusão', page: 10 },
  ])
  .addSection('Introdução', '...')
  .download('relatorio-anual.pdf');
```

### Tabelas Avançadas

```typescript
import { createTable } from '@/modules/export-components';

const table = createTable({
  headers: ['Nome', 'Email', 'Status'],
  rows: [
    ['João Silva', 'joao@email.com', 'Ativo'],
    ['Maria Santos', 'maria@email.com', 'Ativo'],
  ],
  widths: ['*', '*', 100] // Larguras customizadas
});

exportToPDF({
  title: 'Lista de Usuários',
  content: [table]
}, 'usuarios.pdf');
```

### Preview antes de Baixar

```typescript
import { previewPDF } from '@/modules/export-components';

previewPDF({
  title: 'Preview',
  content: [
    { text: 'Conteúdo do documento...', style: 'paragraph' }
  ]
});
// Abre em nova aba para visualização
```

## Exportação para DOCX

### Uso Básico

```typescript
import { exportToDOCX } from '@/modules/export-components';

await exportToDOCX({
  title: 'Documento de Requisitos',
  metadata: {
    author: 'Equipe de Produto',
    subject: 'Especificação Técnica',
  },
  sections: [
    { type: 'title', content: 'Documento de Requisitos' },
    { type: 'heading1', content: '1. Introdução' },
    { type: 'paragraph', content: 'Este documento descreve...' },
    { type: 'heading2', content: '1.1 Objetivos' },
    { type: 'list', content: ['Objetivo 1', 'Objetivo 2', 'Objetivo 3'] },
  ]
}, 'requisitos.docx');
```

### Tipos de Seções

```typescript
{
  sections: [
    { type: 'title', content: 'Título Principal' },
    { type: 'heading1', content: 'Heading 1' },
    { type: 'heading2', content: 'Heading 2' },
    { type: 'heading3', content: 'Heading 3' },
    { type: 'paragraph', content: 'Parágrafo normal', alignment: 'justify' },
    { type: 'list', content: ['Item 1', 'Item 2', 'Item 3'] },
  ]
}
```

## Exportação para CSV

### Uso Básico

```typescript
import { exportToCSV } from '@/modules/export-components';

const data = [
  { nome: 'João', email: 'joao@email.com', idade: 30 },
  { nome: 'Maria', email: 'maria@email.com', idade: 25 },
];

exportToCSV(data, 'usuarios.csv');
```

### Opções de CSV

```typescript
exportToCSV(data, 'usuarios.csv', {
  delimiter: ';',           // Delimitador (padrão: ',')
  encoding: 'utf-8-bom',    // UTF-8 com BOM para Excel (padrão)
  headers: ['Nome', 'E-mail', 'Idade'], // Headers customizados
});
```

### Exportar Tabela HTML

```typescript
import { exportTableToCSV } from '@/modules/export-components';

const tableElement = document.querySelector('table');
exportTableToCSV(tableElement, 'dados-tabela.csv');
```

### Parse de CSV

```typescript
import { parseCSV } from '@/modules/export-components';

const csvString = 'nome,email\nJoão,joao@email.com';
const data = parseCSV(csvString);
// [{ nome: 'João', email: 'joao@email.com' }]
```

## Utilitários

### Formatação

```typescript
import {
  formatCurrency,
  formatDate,
  formatNumber,
  objectToTableData,
  sanitizeFilename,
  generateFilename,
} from '@/modules/export-components';

// Moeda
formatCurrency(10000); // "R$ 10.000,00"
formatCurrency(10000, 'USD'); // "$10,000.00"

// Data
formatDate(new Date(), 'short'); // "08/11/2025"
formatDate(new Date(), 'long'); // "08 de novembro de 2025"

// Número
formatNumber(1234.567, 2); // "1.234,57"

// Converter objeto para tabela
const users = [
  { name: 'João', email: 'joao@email.com' },
  { name: 'Maria', email: 'maria@email.com' },
];

const tableData = objectToTableData(users);
// { headers: ['name', 'email'], rows: [['João', 'joao@email.com'], ...] }

// Sanitizar filename
sanitizeFilename('Relatório: Vendas 2025'); // "relatorio_vendas_2025"

// Gerar filename com timestamp
generateFilename('relatorio', 'pdf'); // "relatorio_2025-11-08T10-30-00.pdf"
```

### Imagens em PDF

```typescript
import { imageUrlToBase64 } from '@/modules/export-components';

// Converter URL para base64
const base64 = await imageUrlToBase64('https://example.com/logo.png');

new PDFBuilder()
  .addImage(base64, 200, 100)
  .download('documento.pdf');
```

## Casos de Uso

### Exportar Chat para PDF

```typescript
import { PDFBuilder } from '@/modules/export-components';

new PDFBuilder()
  .setTitle('Conversa com Suporte')
  .setSubtitle(`${chatDate}`)
  .setAuthor(userName)
  .addSection('Histórico de Mensagens', '')
  .addList(messages.map(m => `${m.time} - ${m.author}: ${m.text}`))
  .download('conversa-suporte.pdf');
```

### Exportar Dados de Dashboard

```typescript
import { exportToCSV, objectToTableData } from '@/modules/export-components';

// Dados de vendas
const salesData = await fetchSalesData();

// Exportar para CSV
exportToCSV(salesData, 'vendas-q3.csv', {
  delimiter: ';',
  encoding: 'utf-8-bom', // Para Excel
});

// OU exportar para PDF
const tableData = objectToTableData(salesData);

new PDFBuilder()
  .setTitle('Relatório de Vendas')
  .addTable(tableData)
  .download('vendas-q3.pdf');
```

### Gerar Relatório Completo

```typescript
new PDFBuilder()
  .setTitle('Relatório Trimestral')
  .setPageOrientation('portrait')
  .setAuthor('Equipe de Analytics')

  .addCover({
    title: 'Relatório Q3 2025',
    subtitle: 'Análise de Performance',
    date: formatDate(new Date(), 'long'),
  })

  .addTableOfContents([
    { title: 'Resumo Executivo', page: 2 },
    { title: 'Métricas Principais', page: 3 },
    { title: 'Análise Detalhada', page: 5 },
  ])

  .addSection('Resumo Executivo', summaryText)

  .addPageBreak()

  .addSection('Métricas Principais', '')
  .addTable({
    headers: ['Métrica', 'Valor', 'Variação'],
    rows: [
      ['Vendas', formatCurrency(150000), '+15%'],
      ['Clientes', formatNumber(1250), '+8%'],
    ]
  })

  .download('relatorio-q3.pdf');
```

## Performance

- **Arquivos grandes**: Use processamento assíncrono
- **Datasets grandes**: Processe em chunks (>10k registros)
- **Imagens**: Otimize/redimensione antes de incluir
- **Bundle**: ~320KB gzipped (todas bibliotecas)

## Limitações

- Arquivos limitados pela memória do navegador
- PDFs sem funcionalidades avançadas (formulários editáveis, assinaturas digitais)
- DOCX com formatação limitada comparado ao Word nativo
- Geração totalmente no frontend (sem backend)

## Segurança

- ✅ Não envia dados para servidores externos
- ✅ Arquivos gerados apenas em memória local
- ✅ Downloads seguros via file-saver
- ✅ Respeita permissões do usuário

## TypeScript

Todos os helpers são totalmente tipados:

```typescript
import type {
  PDFContent,
  TableData,
  DOCXContent,
  DOCXSection,
  CSVOptions,
} from '@/modules/export-components';
```

## Módulos Dependentes

Os seguintes módulos podem usar Export Components:
- Chat (exportar conversas)
- Dashboard (exportar relatórios e dados)
- Forms (exportar respostas)
- Tasks (exportar lista de tarefas)
- Documents (gerar documentos)
