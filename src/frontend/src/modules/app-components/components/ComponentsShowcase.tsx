/**
 * ComponentsShowcase - Demonstração dos componentes com tema aplicado
 *
 * Exemplo prático de uso dos componentes base com integração de tema.
 * SPEC-MC-AP-024, SPEC-MC-AP-025, SPEC-MC-AP-026
 */

import { DataTable } from './DataTable';
import { SimpleChart } from './SimpleChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ColumnDef } from '../table';

interface SampleData {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  value: number;
}

const sampleData: SampleData[] = [
  { id: '1', name: 'Item 1', status: 'active', value: 100 },
  { id: '2', name: 'Item 2', status: 'pending', value: 75 },
  { id: '3', name: 'Item 3', status: 'inactive', value: 50 },
  { id: '4', name: 'Item 4', status: 'active', value: 125 },
  { id: '5', name: 'Item 5', status: 'pending', value: 90 },
];

const columns: ColumnDef<SampleData>[] = [
  {
    accessorKey: 'name',
    header: 'Nome',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const variant =
        status === 'active'
          ? 'default'
          : status === 'pending'
            ? 'secondary'
            : 'outline';

      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: 'value',
    header: 'Valor',
    cell: ({ row }) => {
      const value = row.getValue('value') as number;
      return <span className="font-mono">{value}</span>;
    },
  },
];

const chartData = [
  { name: 'Jan', value: 100 },
  { name: 'Fev', value: 120 },
  { name: 'Mar', value: 115 },
  { name: 'Abr', value: 140 },
  { name: 'Mai', value: 130 },
  { name: 'Jun', value: 160 },
];

/**
 * Componente de showcase
 *
 * Este componente demonstra:
 * - Uso de DataTable com tema aplicado
 * - Gráficos com cores do tema
 * - Cards usando CSS custom properties
 * - Badges com cores semânticas
 */
export function ComponentsShowcase() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Componentes Base</h2>
        <p className="text-muted-foreground">
          Demonstração de componentes com tema aplicado automaticamente
        </p>
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>DataTable</CardTitle>
          <CardDescription>
            Tabela com sorting, filtering e pagination
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={sampleData}
            searchColumn="name"
            searchPlaceholder="Buscar por nome..."
            pageSize={5}
          />
        </CardContent>
      </Card>

      {/* Gráfico */}
      <Card>
        <CardHeader>
          <CardTitle>Gráfico</CardTitle>
          <CardDescription>
            Gráfico usando cores do tema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SimpleChart data={chartData} />
        </CardContent>
      </Card>

      {/* Demonstração de cores semânticas */}
      <Card>
        <CardHeader>
          <CardTitle>Cores Semânticas</CardTitle>
          <CardDescription>
            Cores que se adaptam automaticamente ao tema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-success text-success-foreground">
              Success
            </div>
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-warning text-warning-foreground">
              Warning
            </div>
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-info text-info-foreground">
              Info
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nota sobre CSS custom properties */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-primary">ℹ️</span>
            CSS Custom Properties
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Todos os componentes utilizam CSS custom properties definidas no tema:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li><code className="text-xs bg-muted px-1 py-0.5 rounded">--primary</code> - Cor primária (brand color)</li>
            <li><code className="text-xs bg-muted px-1 py-0.5 rounded">--background</code> - Cor de fundo</li>
            <li><code className="text-xs bg-muted px-1 py-0.5 rounded">--foreground</code> - Cor do texto</li>
            <li><code className="text-xs bg-muted px-1 py-0.5 rounded">--success, --warning, --destructive, --info</code> - Cores semânticas</li>
          </ul>
          <p className="pt-2">
            A mudança de tema (claro/escuro) ou brand color é automática e instantânea.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
