# SPEC-module-export-components.md

## Especificação: Módulo Export Components

### Escopo
Este documento especifica o módulo Export Components, responsável por fornecer capacidades de exportação de conteúdo em diversos formatos diretamente no frontend.

---

## 1. Definição

### Propósito
O módulo Export Components fornece bibliotecas e utilitários para gerar e exportar arquivos (PDF, DOCX, CSV) de forma programática no frontend, sem necessidade de processamento no backend.

### Natureza
- **Tipo**: Módulo de Componentes
- **Dependências**: Nenhuma
- **Opcional**: Sim

---

## 2. Bibliotecas Incluídas

### SPEC-EXPORT-L-001
O módulo DEVE incluir as seguintes bibliotecas:
- **pdfmake** - Geração de PDFs com controle total de layout
- **docx** - Geração de arquivos DOCX (Microsoft Word - Open XML Format)
- **Papa Parse** - Geração e exportação de arquivos CSV
- **file-saver** - Helper para trigger de downloads no navegador

### SPEC-EXPORT-L-002
Todas as bibliotecas DEVEM ser disponibilizadas globalmente no portal onde o módulo está ativo

### SPEC-EXPORT-L-003
Bibliotecas NÃO DEVEM ser carregadas em portais onde o módulo não está ativo

---

## 3. Capacidades por Formato

### PDF (pdfmake)

**SPEC-EXPORT-PDF-001:** Módulo DEVE permitir geração de PDFs com:
- Controle total de layout (margens, orientação, tamanho de página)
- Texto com múltiplos estilos (fontes, tamanhos, cores, negrito, itálico)
- Imagens (base64, URLs)
- Tabelas com formatação customizada
- Listas ordenadas e não ordenadas
- Headers e footers dinâmicos
- Quebras de página
- Índice automático
- Numeração de páginas

**SPEC-EXPORT-PDF-002:** Geração DEVE ocorrer completamente no frontend

**SPEC-EXPORT-PDF-003:** PDF gerado DEVE ser baixado diretamente pelo navegador

**SPEC-EXPORT-PDF-004:** Módulo PODE suportar preview do PDF antes do download

### DOCX (docx.js)

**SPEC-EXPORT-DOCX-001:** Módulo DEVE permitir geração de arquivos DOCX com:
- Parágrafos com formatação (fontes, tamanhos, cores, alinhamento)
- Títulos (Heading 1-6)
- Listas ordenadas e não ordenadas
- Tabelas
- Imagens
- Quebras de página
- Headers e footers
- Numeração de páginas

**SPEC-EXPORT-DOCX-002:** Arquivos DEVEM ser compatíveis com Microsoft Word e LibreOffice

**SPEC-EXPORT-DOCX-003:** Geração DEVE ocorrer completamente no frontend

**SPEC-EXPORT-DOCX-004:** DOCX gerado DEVE ser baixado diretamente pelo navegador

### CSV (Papa Parse)

**SPEC-EXPORT-CSV-001:** Módulo DEVE permitir conversão de arrays/objetos JavaScript para CSV

**SPEC-EXPORT-CSV-002:** Módulo DEVE suportar:
- Headers customizados
- Delimitadores configuráveis (vírgula, ponto-e-vírgula, tab)
- Encoding UTF-8 com BOM (para Excel)
- Escape de aspas e caracteres especiais

**SPEC-EXPORT-CSV-003:** CSV gerado DEVE ser baixado diretamente pelo navegador

**SPEC-EXPORT-CSV-004:** Módulo DEVE suportar conversão bidirecional (parse e stringify)

---

## 4. API Exportada

### Helpers

**SPEC-EXPORT-API-001:** Módulo DEVE exportar helpers simplificados:

```typescript
// PDF
exportToPDF(content: PDFContent, filename: string): void

// DOCX
exportToDOCX(content: DOCXContent, filename: string): void

// CSV
exportToCSV(data: any[], filename: string, options?: CSVOptions): void
```

### Classes/Builders

**SPEC-EXPORT-API-002:** Módulo PODE exportar builders para construção fluente:

```typescript
const pdf = new PDFBuilder()
  .addTitle('Relatório')
  .addParagraph('Conteúdo...')
  .addTable(data)
  .build();

pdf.download('relatorio.pdf');
```

### Utilitários

**SPEC-EXPORT-API-003:** Módulo DEVE exportar utilitários comuns:

```typescript
// Conversão de dados
dataToCSV(data: any[]): string
dataToTable(data: any[]): TableDefinition

// Formatação
formatCurrency(value: number): string
formatDate(date: Date): string
```

---

## 5. Configuração de Instância

### SPEC-EXPORT-C-001
Módulo Export Components NÃO cria instâncias

### SPEC-EXPORT-C-002
Módulo fornece capacidades que outros módulos utilizam

### SPEC-EXPORT-C-003
Ativação do módulo disponibiliza bibliotecas globalmente no portal

---

## 6. Casos de Uso

### Exportar Conversas de Chat

**SPEC-EXPORT-UC-001:** Módulo Chat pode usar Export Components para:
```typescript
import { exportToPDF, exportToDOCX } from '@/modules/export-components';

// Exportar histórico de chat
exportToPDF({
  title: 'Conversa com Suporte',
  messages: chatHistory,
  metadata: { date, user }
}, 'conversa-suporte.pdf');
```

### Exportar Dados de Tabela

**SPEC-EXPORT-UC-002:** Módulo Dashboard pode usar Export Components para:
```typescript
import { exportToCSV } from '@/modules/export-components';

// Exportar dados de tabela
exportToCSV(tableData, 'relatorio-vendas.csv', {
  delimiter: ';',
  encoding: 'utf-8-bom' // Para Excel
});
```

### Gerar Relatórios

**SPEC-EXPORT-UC-003:** Módulo Dashboard pode usar Export Components para:
```typescript
import { PDFBuilder } from '@/modules/export-components';

// Relatório formatado
new PDFBuilder()
  .addCover({ title, subtitle, logo })
  .addSection('Resumo Executivo', summary)
  .addChart(chartImage)
  .addSection('Dados Detalhados')
  .addTable(detailedData)
  .download('relatorio-q3.pdf');
```

---

## 7. Dependências de Outros Módulos

### SPEC-EXPORT-D-001
Módulos que dependem de Export Components:
- Chat (exportar conversas)
- Dashboard (exportar relatórios e dados)
- Forms (exportar respostas)
- Tasks (exportar lista de tarefas)

### SPEC-EXPORT-D-002
Quando esses módulos são ativados, Export Components DEVE ser ativado automaticamente (dependência declarativa)

---

## 8. Performance

### SPEC-EXPORT-P-001
Geração de arquivos grandes (>1000 páginas ou >10MB) DEVE ser assíncrona

### SPEC-EXPORT-P-002
Durante geração, módulo DEVE exibir indicador de progresso

### SPEC-EXPORT-P-003
Geração NÃO DEVE bloquear interface do usuário

### SPEC-EXPORT-P-004
Para datasets muito grandes (>10k registros), módulo DEVE processar em chunks

---

## 9. Limitações

### SPEC-EXPORT-L-001
Módulo opera apenas no frontend (sem backend)

### SPEC-EXPORT-L-002
Arquivos gerados são limitados pela memória do navegador

### SPEC-EXPORT-L-003
PDFs não suportam funcionalidades avançadas (formulários editáveis, assinaturas digitais)

### SPEC-EXPORT-L-004
DOCX gerados podem ter formatação limitada comparado ao Word nativo

---

## 10. Fontes e Recursos

### Fontes PDF

**SPEC-EXPORT-F-001:** PDFs DEVEM usar fontes embutidas ou web-safe

**SPEC-EXPORT-F-002:** Módulo DEVE incluir fontes padrão:
- Roboto (sans-serif)
- Open Sans (sans-serif)
- Courier New (monospace)

**SPEC-EXPORT-F-003:** Instâncias de outros módulos PODEM registrar fontes customizadas

### Imagens

**SPEC-EXPORT-F-004:** Módulo DEVE suportar imagens em:
- Base64 (embedded)
- URLs (externas)
- Data URLs

**SPEC-EXPORT-F-005:** Imagens DEVEM ser otimizadas antes de inclusão (redimensionamento, compressão)

---

## 11. Integração com Tema

### SPEC-EXPORT-T-001
Documentos exportados PODEM usar brand color do portal

### SPEC-EXPORT-T-002
Templates de PDF/DOCX DEVEM respeitar identidade visual configurada

### SPEC-EXPORT-T-003
Módulo DEVE fornecer templates padrão que usam cores do tema

---

## 12. Exemplos de Configuração

### Ativação Simples
```json
{
  "portalId": "app",
  "modules": [
    {
      "moduleId": "export-components",
      "active": true
    }
  ]
}
```

### Uso por Outro Módulo
```json
{
  "portalId": "app",
  "modules": [
    {
      "moduleId": "dashboard",
      "active": true,
      "dependencies": ["export-components"]
    }
  ]
}
```

---

## 13. Testes e Validação

### SPEC-EXPORT-V-001
Arquivos gerados DEVEM ser validados:
- PDF: abrir em Adobe Reader e navegadores
- DOCX: abrir em Microsoft Word e LibreOffice
- CSV: importar em Excel e Google Sheets

### SPEC-EXPORT-V-002
Encoding UTF-8 com BOM DEVE ser testado especificamente com Excel

### SPEC-EXPORT-V-003
Caracteres especiais (acentos, símbolos) DEVEM ser renderizados corretamente

---

## 14. Segurança

### SPEC-EXPORT-S-001
Módulo NÃO DEVE enviar dados para servidores externos durante geração

### SPEC-EXPORT-S-002
Arquivos gerados DEVEM ser criados apenas em memória local

### SPEC-EXPORT-S-003
Downloads DEVEM usar `file-saver` com configurações seguras

### SPEC-EXPORT-S-004
Conteúdo sensível exportado DEVE respeitar permissões do usuário

---

## 15. Acessibilidade

### SPEC-EXPORT-A-001
PDFs gerados DEVEM incluir metadados (título, autor, subject)

### SPEC-EXPORT-A-002
PDFs DEVEM ter estrutura de documento (headings, lists) quando possível

### SPEC-EXPORT-A-003
Imagens em PDFs DEVEM ter texto alternativo quando disponível

---

*Esta especificação define os requisitos do módulo Export Components. Implementação técnica em documentação separada.*