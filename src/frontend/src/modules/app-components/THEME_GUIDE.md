# Guia de Integração com Tema

Este guia explica como os componentes do módulo `app-components` integram com o sistema de temas da plataforma.

## Visão Geral

**SPEC-MC-AP-024, SPEC-MC-AP-025, SPEC-MC-AP-026, SPEC-MC-CF-005 a SPEC-MC-CF-008**

Todos os componentes do módulo `app-components` respeitam automaticamente:

- ✅ **Tema claro/escuro** - Troca instantânea sem reload
- ✅ **Brand color** - Cor primária customizável por portal
- ✅ **Cores semânticas** - Success, warning, destructive, info
- ✅ **CSS custom properties** - Integração nativa com Tailwind

## Como Funciona

### 1. CSS Custom Properties

Todos os componentes usam CSS custom properties definidas no `index.css`:

```css
/* Tema claro */
:root {
  --primary: 0 0% 9%;
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --success: 142 76% 36%;
  --warning: 38 92% 50%;
  --destructive: 0 84.2% 60.2%;
  --info: 199 89% 48%;
  /* ... outros tokens */
}

/* Tema escuro */
.dark {
  --primary: 0 0% 98%;
  --background: 0 0% 12%;
  --foreground: 0 0% 98%;
  --success: 142 70% 45%;
  --warning: 38 90% 55%;
  --destructive: 0 62.8% 30.6%;
  --info: 199 85% 55%;
  /* ... outros tokens */
}
```

### 2. Integração Automática

Os componentes usam classes Tailwind que referenciam as CSS custom properties:

```tsx
// ✅ Correto - usa CSS custom properties
<div className="bg-primary text-primary-foreground">
  Texto com brand color
</div>

// ✅ Correto - cores semânticas
<Badge variant="default">Primary</Badge>
<div className="bg-success text-success-foreground">Sucesso</div>
<div className="bg-warning text-warning-foreground">Aviso</div>

// ❌ Evitar - cores hardcoded
<div className="bg-blue-500 text-white">
  Cor fixa (não respeita tema)
</div>
```

### 3. Tema Claro/Escuro

A classe `.dark` no `<html>` controla o tema:

```tsx
// Gerenciado automaticamente pelo ThemeContext
<html class="dark"> <!-- Tema escuro ativo -->
  <!-- ... -->
</html>
```

Componentes com classes condicionais:

```tsx
// ✅ Tailwind automaticamente aplica dark:
<div className="bg-background text-foreground">
  Cor se adapta automaticamente
</div>

// ✅ Variantes prose para markdown
<div className="prose dark:prose-invert">
  {/* Markdown com tema */}
</div>
```

### 4. Brand Color

O brand color é aplicado via CSS custom property `--primary`:

```tsx
// Todos esses elementos usam o brand color:
<Button variant="default">Botão primário</Button>
<Badge variant="default">Badge primário</Badge>
<a className="text-primary">Link</a>
```

Quando o usuário altera o brand color, a variável `--primary` é atualizada dinamicamente e todos os componentes refletem a mudança **instantaneamente**.

## Uso dos Componentes

### DataTable

```tsx
import { DataTable } from 'app-components';

// Usa cores do tema automaticamente
<DataTable
  columns={columns}
  data={data}
  searchColumn="name"
/>
```

### Gráficos (Recharts)

```tsx
import { LineChart, Line, XAxis, YAxis } from 'app-components';

// Cores via CSS custom properties
<LineChart data={data}>
  <Line
    stroke="hsl(var(--primary))"
    strokeWidth={2}
  />
  <XAxis stroke="hsl(var(--muted-foreground))" />
</LineChart>
```

### FullCalendar

```tsx
import { FullCalendar } from 'app-components';

// Tema aplicado via classe CSS
<FullCalendar
  // ... configurações
/>
```

O tema é aplicado automaticamente pela função `applyFullCalendarTheme()`.

### TipTap Editor

```tsx
import { useEditor, EditorContent } from 'app-components';

const editor = useEditor({
  // ... configurações
});

// Usa classe prose do Tailwind Typography
<EditorContent
  editor={editor}
  className="prose dark:prose-invert"
/>
```

### Drag and Drop (@dnd-kit)

```tsx
import { DndContext, useDraggable } from 'app-components';

// Componentes usam classes Tailwind com tema
<DndContext>
  <div className="bg-card border border-border">
    {/* Cores do tema */}
  </div>
</DndContext>
```

## Hook de Tema (Opcional)

O hook `useAppComponentsTheme()` configura bibliotecas que precisam de setup imperativo:

```tsx
import { useAppComponentsTheme } from 'app-components';

function App() {
  // Configura FullCalendar, TipTap, etc.
  useAppComponentsTheme();

  return <div>{/* ... */}</div>;
}
```

**Nota:** Este hook é **opcional**. A maioria dos componentes funciona corretamente usando apenas CSS custom properties.

## Componentes Customizados

Ao criar componentes customizados, siga estas práticas:

### ✅ Boas Práticas

```tsx
// Usar cores semânticas
<div className="bg-success text-success-foreground">
  Operação bem-sucedida
</div>

// Usar classes condicionais dark:
<div className="bg-white dark:bg-gray-900">
  Conteúdo
</div>

// Usar CSS custom properties via Tailwind
<div className="border-primary text-primary">
  Brand color
</div>

// Ler valores via JavaScript quando necessário
const primaryColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--primary')
  .trim();
```

### ❌ Evitar

```tsx
// ❌ Cores hardcoded
<div className="bg-blue-500">Conteúdo</div>

// ❌ Verificar tema manualmente
const isDark = localStorage.getItem('theme') === 'dark';

// ❌ Ignorar CSS custom properties
<div style={{ color: '#000000' }}>Texto</div>
```

## Cores Disponíveis

### Cores Base

- `--background` / `--foreground`
- `--card` / `--card-foreground`
- `--popover` / `--popover-foreground`

### Cores de Ação

- `--primary` / `--primary-foreground` (brand color)
- `--secondary` / `--secondary-foreground`
- `--accent` / `--accent-foreground`
- `--muted` / `--muted-foreground`

### Cores Semânticas

- `--success` / `--success-foreground` (verde)
- `--warning` / `--warning-foreground` (amarelo/laranja)
- `--destructive` / `--destructive-foreground` (vermelho)
- `--info` / `--info-foreground` (azul)

### Cores de UI

- `--border` - Bordas
- `--input` - Campos de entrada
- `--ring` - Focus ring

### Cores de Gráficos

- `--chart-1` a `--chart-5` - Paleta para gráficos

## Exemplos Completos

### Exemplo 1: Card com Tema

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

function ThemedCard() {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-primary">
          Título com Brand Color
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-foreground">
          Texto que se adapta ao tema
        </p>
        <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded">
          <p className="text-success-foreground">
            Mensagem de sucesso
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Exemplo 2: Gráfico com Tema

```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'app-components';

function ThemedChart({ data }: { data: any[] }) {
  return (
    <LineChart width={600} height={300} data={data}>
      <CartesianGrid
        stroke="hsl(var(--border))"
        strokeDasharray="3 3"
      />
      <XAxis
        stroke="hsl(var(--muted-foreground))"
        tick={{ fill: 'hsl(var(--muted-foreground))' }}
      />
      <YAxis
        stroke="hsl(var(--muted-foreground))"
        tick={{ fill: 'hsl(var(--muted-foreground))' }}
      />
      <Tooltip
        contentStyle={{
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          color: 'hsl(var(--card-foreground))',
        }}
      />
      <Line
        type="monotone"
        dataKey="value"
        stroke="hsl(var(--primary))"
        strokeWidth={2}
      />
    </LineChart>
  );
}
```

### Exemplo 3: Tabela com Cores Semânticas

```tsx
import { DataTable } from 'app-components';
import { Badge } from '@/components/ui/badge';
import type { ColumnDef } from 'app-components';

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
}

const columns: ColumnDef<Task>[] = [
  {
    accessorKey: 'title',
    header: 'Título',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;

      // Mapear status para cores semânticas
      const config = {
        pending: { label: 'Pendente', className: 'bg-muted text-muted-foreground' },
        'in-progress': { label: 'Em andamento', className: 'bg-info text-info-foreground' },
        completed: { label: 'Completo', className: 'bg-success text-success-foreground' },
        failed: { label: 'Falhou', className: 'bg-destructive text-destructive-foreground' },
      }[status];

      return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.className}`}>
          {config.label}
        </span>
      );
    },
  },
];

function TasksTable({ tasks }: { tasks: Task[] }) {
  return <DataTable columns={columns} data={tasks} />;
}
```

## Demonstração

Execute o componente `ComponentsShowcase` para ver exemplos práticos de todos os componentes com tema aplicado:

```tsx
import { ComponentsShowcase } from 'app-components';

function DemoPage() {
  return <ComponentsShowcase />;
}
```

## Referências

- **SPEC-theming.md** - Especificação completa do sistema de temas
- **SPEC-module-components.md** - Requisitos dos módulos de componentes
- **index.css** - Definição de CSS custom properties
- **ThemeContext.tsx** - Implementação do contexto de tema

## Resumo

1. ✅ **Use CSS custom properties** via classes Tailwind
2. ✅ **Cores semânticas** para estados (success, warning, etc.)
3. ✅ **Variantes dark:** para modo escuro (`dark:bg-gray-900`)
4. ✅ **Brand color** via `--primary`
5. ❌ **Evite cores hardcoded** (bg-blue-500, etc.)
6. ❌ **Não gerencie tema manualmente** - use ThemeContext

Todos os componentes já estão prontos para uso. Basta importar e usar normalmente. O tema será aplicado automaticamente! 🎨
