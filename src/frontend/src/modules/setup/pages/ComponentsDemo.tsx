/**
 * ComponentsDemo - Demonstração dos Componentes Base
 *
 * Página de demonstração dos três módulos de componentes:
 * - App Components
 * - Media Components
 * - Export Components
 *
 * EPIC 6.4: Componentes Base
 */

import { ComponentsShowcase } from '@/modules/app-components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarkdownRenderer, CodeBlock } from '@/modules/media-components';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { exportToPDF, exportToCSV } from '@/modules/export-components';

const sampleCode = `import { DataTable, SimpleChart } from 'app-components';
import { MarkdownRenderer, CodeBlock } from 'media-components';
import { exportToPDF } from 'export-components';

// Usar componentes com tema aplicado automaticamente
<DataTable columns={columns} data={data} />
<SimpleChart data={chartData} />
<MarkdownRenderer content={markdown} />
<CodeBlock code={code} language="typescript" />`;

const sampleMarkdown = `# Exemplo de Markdown

Este é um exemplo de **markdown** com *diversos* recursos:

- Lista de itens
- Com \`código inline\`
- E [links](https://example.com)

## Tabela

| Coluna 1 | Coluna 2 | Coluna 3 |
|----------|----------|----------|
| A        | B        | C        |
| 1        | 2        | 3        |

### Blockquote

> Este é um blockquote que demonstra
> como o markdown é renderizado.

\`\`\`typescript
// Código com syntax highlighting
function hello() {
  console.log("Olá, mundo!");
}
\`\`\`
`;

/**
 * Página de demonstração dos componentes
 */
export function ComponentsDemo() {
  const handleExportPDF = () => {
    const doc = {
      title: 'Demonstração de Export',
      subtitle: 'Este PDF foi gerado usando o módulo export-components',
      content: [
        { text: 'Características:', style: 'subheader' },
        {
          ul: [
            'Geração totalmente no frontend',
            'Suporte a estilos personalizados',
            'Integração com tema da plataforma',
            'Fácil de usar',
          ],
        },
      ] as any[],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10] as [number, number, number, number],
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 5] as [number, number, number, number],
        },
      },
    };

    exportToPDF(doc, 'demonstracao.pdf');
  };

  const handleExportCSV = () => {
    const data = [
      ['Nome', 'Email', 'Status'],
      ['João Silva', 'joao@example.com', 'Ativo'],
      ['Maria Santos', 'maria@example.com', 'Ativo'],
      ['Pedro Oliveira', 'pedro@example.com', 'Inativo'],
    ];

    exportToCSV(data, 'demonstracao.csv');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">
          Demonstração de Componentes
        </h1>
        <p className="text-muted-foreground text-lg">
          EPIC 6.4: Componentes Base com integração de tema
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="app" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="app">App Components</TabsTrigger>
          <TabsTrigger value="media">Media Components</TabsTrigger>
          <TabsTrigger value="export">Export Components</TabsTrigger>
          <TabsTrigger value="code">Código</TabsTrigger>
        </TabsList>

        {/* App Components */}
        <TabsContent value="app" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>App Components</CardTitle>
              <CardDescription>
                Componentes para aplicativos robustos (dashboards, CRUDs, helpdesks)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ComponentsShowcase />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media Components */}
        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Media Components</CardTitle>
              <CardDescription>
                Componentes para visualização de conteúdo rico
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Markdown */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Markdown Renderer</h3>
                <MarkdownRenderer content={sampleMarkdown} />
              </div>

              {/* Code Block */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Code Block</h3>
                <CodeBlock
                  code={sampleCode}
                  language="typescript"
                  showLineNumbers
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export Components */}
        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Components</CardTitle>
              <CardDescription>
                Exportação de conteúdo em diversos formatos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Demonstração das funcionalidades de exportação. Clique nos botões
                abaixo para baixar arquivos de exemplo.
              </p>

              <div className="flex gap-2">
                <Button onClick={handleExportPDF} variant="outline">
                  <FileDown className="mr-2 h-4 w-4" />
                  Exportar PDF
                </Button>
                <Button onClick={handleExportCSV} variant="outline">
                  <FileDown className="mr-2 h-4 w-4" />
                  Exportar CSV
                </Button>
              </div>

              <div className="rounded-lg border border-info/20 bg-info/5 p-4">
                <p className="text-sm">
                  <strong>Nota:</strong> Os arquivos são gerados totalmente no
                  frontend, sem necessidade de servidor. Ideal para aplicações
                  offline ou com requisitos de privacidade.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Código */}
        <TabsContent value="code" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Código de Exemplo</CardTitle>
              <CardDescription>
                Como usar os componentes em sua aplicação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock
                code={sampleCode}
                language="typescript"
                showLineNumbers
              />

              <div className="mt-6 space-y-2">
                <h3 className="text-sm font-semibold">Documentação</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>
                    📘{' '}
                    <code className="bg-muted px-1 py-0.5 rounded text-xs">
                      app-components/THEME_GUIDE.md
                    </code>{' '}
                    - Guia completo de integração com tema
                  </li>
                  <li>
                    📘{' '}
                    <code className="bg-muted px-1 py-0.5 rounded text-xs">
                      app-components/README.md
                    </code>{' '}
                    - Bibliotecas e versões
                  </li>
                  <li>
                    📘{' '}
                    <code className="bg-muted px-1 py-0.5 rounded text-xs">
                      COMPONENTS_INTEGRATION.md
                    </code>{' '}
                    - Documentação de implementação
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info adicional */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-primary">Sobre os Componentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Todos os componentes demonstrados acima integram automaticamente com o
            sistema de temas da plataforma:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Modo claro/escuro - troca instantânea sem reload</li>
            <li>Brand color - personalizável por portal</li>
            <li>Cores semânticas - success, warning, destructive, info</li>
            <li>CSS custom properties - integração nativa com Tailwind</li>
            <li>Lazy loading - carregados apenas quando ativados</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
