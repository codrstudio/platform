# UI/UX Design: Módulo App Components

## Especificação de Interfaces do Módulo App Components

### Escopo
Este documento define guidelines de UI/UX e documentação de uso para o módulo App Components, uma biblioteca de componentes especializados para aplicações complexas. Baseado em SPEC-module-app-components.md, SPEC-concepts.md e SPEC-architecture.md.

---

## 1. Visão Geral do Módulo

### 1.1 Propósito

**App Components é um módulo de biblioteca** que fornece componentes avançados para construção de aplicações complexas:

```
┌─────────────────────────────────────────────────────────┐
│  PLATAFORMA                                             │
│  ├── SEM App Components:                                │
│  │   ✓ Landing pages                                    │
│  │   ✓ Portais informativos                             │
│  │   ✓ Sites simples                                    │
│  │                                                       │
│  └── COM App Components:                                 │
│      ✓ Dashboards com gráficos                          │
│      ✓ CRUDs com tabelas avançadas                      │
│      ✓ Sistemas de agendamento                          │
│      ✓ Kanban boards                                     │
│      ✓ Editores de texto rico                           │
│      ✓ Upload de arquivos                               │
│      ✓ Aplicações de gerenciamento                      │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Características

**Natureza**:
- Tipo: **Componentes** (não possui UI própria)
- Dependências: Nenhuma
- Opcional: Sim
- Instâncias: Não cria instâncias

**O que FORNECE**:
- Biblioteca de componentes prontos para uso
- Integração automática com tema da plataforma
- Code splitting por componente
- Tree shaking de código não utilizado

**O que NÃO FORNECE**:
- Páginas ou rotas próprias
- Lógica de negócio
- Gestão de estado global
- Backend integration

---

## 2. Bibliotecas Incluídas

### 2.1 Componentes Disponíveis

| Biblioteca | Componentes | Use Cases |
|------------|------------|-----------|
| **Recharts** | BarChart, LineChart, PieChart, AreaChart, RadarChart | Dashboards, relatórios, analytics |
| **TanStack Table** | useReactTable, Table, Column, Row | CRUDs, listagens, data grids |
| **FullCalendar** | Calendar, DayGrid, TimeGrid, EventCard | Agendamentos, calendários, cronogramas |
| **@dnd-kit** | DndContext, Draggable, Droppable, Sortable | Kanbans, reordenação, drag-and-drop |
| **TipTap** | Editor, BubbleMenu, FloatingMenu | Editores de conteúdo, rich text |
| **react-dropzone** | Dropzone, FileUpload | Upload de arquivos, imagens |
| **TanStack Virtual** | useVirtualizer | Listas longas, tabelas grandes |
| **react-colorful** | ColorPicker, HexColorInput | Seletor de cores, temas |

### 2.2 Importação de Componentes

```typescript
// Recharts (Gráficos)
import {
  BarChart,
  LineChart,
  PieChart,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from '@platform/app-components/recharts';

// TanStack Table
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel
} from '@platform/app-components/table';

// FullCalendar
import {
  Calendar,
  DayGridView,
  TimeGridView
} from '@platform/app-components/calendar';

// DnD Kit
import {
  DndContext,
  useDraggable,
  useDroppable,
  useSortable
} from '@platform/app-components/dnd';

// TipTap
import {
  useEditor,
  EditorContent,
  BubbleMenu
} from '@platform/app-components/tiptap';

// Dropzone
import {
  useDropzone,
  FileUpload
} from '@platform/app-components/dropzone';

// Virtualizer
import {
  useVirtualizer
} from '@platform/app-components/virtual';

// Color Picker
import {
  HexColorPicker,
  RgbColorPicker
} from '@platform/app-components/colorful';
```

---

## 3. Integração com Tema da Plataforma

### 3.1 Configuração Automática

Todos os componentes são **automaticamente configurados** para respeitar:

1. **Theme Mode** (light/dark)
2. **Brand Color** do portal
3. **Design Tokens** do shadcn/ui

```typescript
// Configuração automática pelo sistema
// NÃO é necessário configurar manualmente
const theme = useTheme();

useEffect(() => {
  configureAppComponents({
    theme: theme.mode, // 'light' | 'dark' | 'system'
    brandColor: theme.brandColor, // '#3B82F6'
    tokens: theme.tokens // shadcn/ui tokens
  });
}, [theme]);
```

### 3.2 Cores Semânticas

Todos os componentes usam **cores semânticas** da plataforma:

```typescript
// Cores automáticas baseadas no tema
const colors = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  error: 'hsl(var(--destructive))',
  info: 'hsl(var(--info))',
  muted: 'hsl(var(--muted))',
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))'
};
```

---

## 4. Recharts - Gráficos e Visualizações

### 4.1 Bar Chart (Gráfico de Barras)

**Wireframe**:
```
┌────────────────────────────────────────────────────────────┐
│  Vendas por Mês                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  40K│                                   ▓▓▓               │
│     │                                   ▓▓▓               │
│  30K│                         ▓▓▓       ▓▓▓               │
│     │               ▓▓▓       ▓▓▓       ▓▓▓               │
│  20K│     ▓▓▓       ▓▓▓       ▓▓▓       ▓▓▓       ▓▓▓     │
│     │     ▓▓▓       ▓▓▓       ▓▓▓       ▓▓▓       ▓▓▓     │
│  10K│     ▓▓▓       ▓▓▓       ▓▓▓       ▓▓▓       ▓▓▓     │
│     │     ▓▓▓       ▓▓▓       ▓▓▓       ▓▓▓       ▓▓▓     │
│   0 └─────┴─────────┴─────────┴─────────┴─────────┴───── │
│         Jan    Feb    Mar    Apr    May    Jun           │
│                                                            │
│         Legend: [■ Vendas] [■ Meta]                       │
└────────────────────────────────────────────────────────────┘
```

**Código Exemplo**:
```typescript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from '@platform/app-components/recharts';

function SalesChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="sales" fill="hsl(var(--primary))" />
        <Bar dataKey="target" fill="hsl(var(--secondary))" />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

### 4.2 Line Chart (Gráfico de Linhas)

**Wireframe**:
```
┌────────────────────────────────────────────────────────────┐
│  Performance no Período                                     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  100│                                            ●─────●   │
│     │                                   ●───────●           │
│   80│                          ●───────●                   │
│     │                 ●───────●                            │
│   60│        ●───────●                                     │
│     │   ●───●                                              │
│   40│  ●                                                   │
│     │                                                      │
│   20│                                                      │
│     │                                                      │
│    0└──────┴──────┴──────┴──────┴──────┴──────┴──────    │
│      Jan  Feb  Mar  Apr  May  Jun  Jul  Aug             │
│                                                            │
│         Legend: [─ Conversões] [─ Visitas]                │
└────────────────────────────────────────────────────────────┘
```

**Código Exemplo**:
```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from '@platform/app-components/recharts';

function PerformanceChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="conversions"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ fill: 'hsl(var(--primary))' }}
        />
        <Line
          type="monotone"
          dataKey="visits"
          stroke="hsl(var(--secondary))"
          strokeWidth={2}
          dot={{ fill: 'hsl(var(--secondary))' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

### 4.3 Pie Chart (Gráfico de Pizza)

**Wireframe**:
```
┌────────────────────────────────────────────────────────────┐
│  Distribuição por Categoria                                │
├────────────────────────────────────────────────────────────┤
│                                                            │
│                    ┌─────────────┐                        │
│                   ╱ Eletrônicos  ╲                        │
│                  │  (35%)         │                       │
│              ┌───┼────────────────┼───┐                   │
│              │   │                │   │                   │
│     Livros   │   └────────────────┘   │  Roupas          │
│     (20%)    │                        │  (25%)           │
│              │    ╲              ╱    │                   │
│              └─────┼────────────┼─────┘                   │
│                    │  Outros    │                        │
│                    │  (20%)     │                        │
│                    └────────────┘                        │
│                                                            │
│  Legend: [■ Eletrônicos] [■ Roupas] [■ Livros] [■ Outros]│
└────────────────────────────────────────────────────────────┘
```

**Código Exemplo**:
```typescript
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from '@platform/app-components/recharts';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--success))',
  'hsl(var(--warning))'
];

function CategoryChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={120}
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
```

### 4.4 Guidelines Recharts

**Responsividade**:
- SEMPRE use `<ResponsiveContainer>` para adaptar ao container
- Height mínimo: 300px
- Height recomendado: 400px

**Cores**:
- Use cores semânticas do tema (--primary, --secondary, etc.)
- Máximo 5 cores distintas por gráfico
- Contraste adequado (WCAG AA)

**Tooltips**:
- SEMPRE habilite tooltips para melhor UX
- Formato: valor + unidade (ex: "R$ 10.000")

**Legends**:
- Posição: bottom (padrão)
- Sempre presente se múltiplas séries

**Animações**:
- Habilitar por padrão (smooth transitions)
- Desabilitar se muitos dados (>1000 pontos)

---

## 5. TanStack Table - Tabelas Avançadas

### 5.1 Data Table Básica

**Wireframe**:
```
┌────────────────────────────────────────────────────────────┐
│  Usuários                                [🔍 Buscar...] [⚙️]│
├────────────────────────────────────────────────────────────┤
│  ☐ │ Nome          │ Email              │ Status    │ Ações│
├───┼───────────────┼────────────────────┼───────────┼──────┤
│  ☐ │ João Silva ▲  │ joao@email.com     │ ● Ativo   │ ⋮   │
│  ☐ │ Maria Santos  │ maria@email.com    │ ● Ativo   │ ⋮   │
│  ☑ │ Pedro Costa   │ pedro@email.com    │ ○ Inativo │ ⋮   │
│  ☐ │ Ana Oliveira  │ ana@email.com      │ ● Ativo   │ ⋮   │
│  ☐ │ Carlos Lima   │ carlos@email.com   │ ● Ativo   │ ⋮   │
├────────────────────────────────────────────────────────────┤
│  Mostrando 1-5 de 150              [◀] 1 2 3 ... 30 [▶]   │
└────────────────────────────────────────────────────────────┘
```

**Features Obrigatórias**:
- Sorting (click no header)
- Selection (checkboxes)
- Pagination
- Row actions menu

**Código Exemplo**:
```typescript
import { useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel } from '@platform/app-components/table';
import { flexRender } from '@tanstack/react-table';

function UsersTable({ data }) {
  const columns = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      )
    },
    {
      accessorKey: 'name',
      header: 'Nome',
      cell: info => info.getValue()
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: info => info.getValue()
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: info => (
        <Badge variant={info.getValue() === 'active' ? 'success' : 'secondary'}>
          {info.getValue()}
        </Badge>
      )
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Editar</DropdownMenuItem>
            <DropdownMenuItem>Deletar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <DataTablePagination table={table} />
    </div>
  );
}
```

### 5.2 Guidelines TanStack Table

**Performance**:
- Use virtualização para tabelas com >100 linhas
- Pagination: 10, 25, 50, 100 items per page
- Debounce de 300ms em search/filter

**Sorting**:
- Indicador visual: ▲ (asc) ▼ (desc) ─ (none)
- Multi-column sorting com Shift+Click
- Sorting numérico, alfabético, por data

**Selection**:
- Checkbox na primeira coluna
- Select all no header
- Visual feedback (background highlight)

**Actions Column**:
- Sempre última coluna
- Dropdown menu com ações contextuais
- Ícone: ⋮ (três pontos verticais)

**Empty State**:
```
┌────────────────────────────────────┐
│                                    │
│         [📋]                       │
│                                    │
│    Nenhum registro encontrado     │
│                                    │
│  Ajuste os filtros ou adicione    │
│  novos registros.                  │
│                                    │
└────────────────────────────────────┘
```

---

## 6. FullCalendar - Calendários

### 6.1 Month View

**Wireframe**:
```
┌────────────────────────────────────────────────────────────┐
│  ◀ Março 2025 ▶                        [Hoje] [Mês▾] [+]  │
├────────────────────────────────────────────────────────────┤
│  Dom │ Seg │ Ter │ Qua │ Qui │ Sex │ Sáb                  │
├──────┼─────┼─────┼─────┼─────┼─────┼──────                │
│   1  │  2  │  3  │  4  │  5  │  6  │  7                   │
│      │     │     │ [Meeting] │     │                       │
├──────┼─────┼─────┼─────┼─────┼─────┼──────                │
│   8  │  9  │ 10  │ 11  │ 12  │ 13  │ 14                   │
│      │     │     │     │ [Workshop]│                       │
├──────┼─────┼─────┼─────┼─────┼─────┼──────                │
│  15  │ 16  │ 17  │ 18  │ 19  │ 20  │ 21                   │
│ [Event]  │     │ [Deadline]│     │                       │
└────────────────────────────────────────────────────────────┘
```

**Código Exemplo**:
```typescript
import { Calendar } from '@platform/app-components/calendar';

function EventCalendar() {
  const events = [
    {
      title: 'Meeting',
      start: '2025-03-04T10:00:00',
      end: '2025-03-04T11:00:00',
      backgroundColor: 'hsl(var(--primary))'
    },
    {
      title: 'Workshop',
      start: '2025-03-12T14:00:00',
      end: '2025-03-12T17:00:00',
      backgroundColor: 'hsl(var(--success))'
    }
  ];

  return (
    <Calendar
      initialView="dayGridMonth"
      events={events}
      editable={true}
      selectable={true}
      eventClick={handleEventClick}
      dateClick={handleDateClick}
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      }}
    />
  );
}
```

### 6.2 Week View

**Wireframe**:
```
┌────────────────────────────────────────────────────────────┐
│  ◀ 10-16 Mar 2025 ▶                   [Hoje] [Semana▾] [+]│
├────────────────────────────────────────────────────────────┤
│      │ Seg 10│ Ter 11│ Qua 12│ Qui 13│ Sex 14│ Sáb 15     │
├──────┼───────┼───────┼───────┼───────┼───────┼────────    │
│ 08:00│       │       │       │       │       │            │
│ 09:00│       │       │       │       │       │            │
│ 10:00│       │ [───Meeting───]       │       │            │
│ 11:00│       │       │       │       │       │            │
│ 12:00│       │       │       │       │       │            │
│ 13:00│       │       │       │       │       │            │
│ 14:00│       │       │ [────Workshop────────]│            │
│ 15:00│       │       │       │       │       │            │
└────────────────────────────────────────────────────────────┘
```

### 6.3 Guidelines FullCalendar

**Event Colors**:
- Use cores semânticas para tipos de evento
- Background + border matching
- Text color automático (preto/branco) baseado em contraste

**Drag & Drop**:
- Habilitar `editable={true}` para permitir arrastar
- Visual feedback durante drag
- Confirmação após drop (opcional)

**Event Creation**:
- Click em data abre modal de criação
- Drag select para criar evento com duração

**Responsive**:
- Mobile: mostrar apenas Day view
- Tablet: Month/Week views
- Desktop: Todas as views

---

## 7. @dnd-kit - Drag and Drop

### 7.1 Kanban Board

**Wireframe**:
```
┌────────────────────────────────────────────────────────────┐
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │ To Do (3)   │  │ In Progress │  │ Done (5)    │       │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤       │
│  │ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌─────────┐ │       │
│  │ │ Task #1 │ │  │ │ Task #4 │ │  │ │ Task #7 │ │       │
│  │ │ [High]  │ │  │ │ [Medium]│ │  │ │ [Low]   │ │       │
│  │ └─────────┘ │  │ └─────────┘ │  │ └─────────┘ │       │
│  │             │  │ ┌─────────┐ │  │ ┌─────────┐ │       │
│  │ ┌─────────┐ │  │ │ Task #5 │ │  │ │ Task #8 │ │       │
│  │ │ Task #2 │ │  │ │ [High]  │ │  │ │ [Medium]│ │       │
│  │ │ [Medium]│ │  │ └─────────┘ │  │ └─────────┘ │       │
│  │ └─────────┘ │  │             │  │             │       │
│  │             │  │             │  │ [+ Add]     │       │
│  │ [+ Add]     │  │ [+ Add]     │  │             │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
└────────────────────────────────────────────────────────────┘
```

**Código Exemplo**:
```typescript
import { DndContext, DragOverlay, useDraggable, useDroppable } from '@platform/app-components/dnd';

function KanbanBoard({ columns, tasks }) {
  const [activeId, setActiveId] = useState(null);

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4">
        {columns.map(column => (
          <KanbanColumn key={column.id} column={column}>
            {tasks
              .filter(task => task.columnId === column.id)
              .map(task => (
                <KanbanCard key={task.id} task={task} />
              ))}
          </KanbanColumn>
        ))}
      </div>

      <DragOverlay>
        {activeId ? <KanbanCard task={getTask(activeId)} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanCard({ task }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="p-4 bg-card rounded-lg shadow cursor-move"
    >
      <h4>{task.title}</h4>
      <Badge>{task.priority}</Badge>
    </div>
  );
}
```

### 7.2 Guidelines Drag & Drop

**Visual Feedback**:
- Cursor: `cursor: move` em draggable
- Opacity: 0.5 durante drag
- Drop zone highlight quando hover

**Constraints**:
- Definir áreas válidas de drop
- Feedback visual de "can drop" vs "cannot drop"

**Accessibility**:
- Adicionar keyboard support (Arrow keys)
- Screen reader announcements

---

## 8. TipTap - Editor de Texto Rico

### 8.1 Rich Text Editor

**Wireframe**:
```
┌────────────────────────────────────────────────────────────┐
│  [B] [I] [U] [S] │ [H1] [H2] [H3] │ [≡] [≡] [≡] │ [🔗] [📷] │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  # Título Principal                                        │
│                                                            │
│  Este é um parágrafo com **negrito** e *itálico*.         │
│                                                            │
│  - Item de lista 1                                        │
│  - Item de lista 2                                        │
│                                                            │
│  > Citação em bloco                                       │
│                                                            │
│  [Link para documentação](#)                              │
│                                                            │
│  │                                                         │
└────────────────────────────────────────────────────────────┘
```

**Código Exemplo**:
```typescript
import { useEditor, EditorContent, BubbleMenu } from '@platform/app-components/tiptap';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';

function RichTextEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div>
      <EditorToolbar editor={editor} />

      {editor && (
        <BubbleMenu editor={editor}>
          <Button onClick={() => editor.chain().focus().toggleBold().run()}>
            Bold
          </Button>
          <Button onClick={() => editor.chain().focus().toggleItalic().run()}>
            Italic
          </Button>
        </BubbleMenu>
      )}

      <EditorContent editor={editor} className="prose dark:prose-invert" />
    </div>
  );
}
```

### 8.2 Guidelines TipTap

**Toolbar**:
- Sticky no topo do editor
- Agrupamento lógico: formatação, alinhamento, inserção
- Icons clear (Lucide React)

**Extensions Básicas**:
- Bold, Italic, Underline, Strike
- Headings (H1, H2, H3)
- Lists (ordered, unordered)
- Links
- Images
- Code blocks
- Blockquote

**Styling**:
- Use `prose` class do Tailwind Typography
- Respeit automaticamente theme light/dark

---

## 9. react-dropzone - Upload de Arquivos

### 9.1 File Upload Zone

**Wireframe**:
```
┌────────────────────────────────────────────────────────────┐
│  Fazer upload de arquivos                                   │
├────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                      │  │
│  │                    [📁]                              │  │
│  │                                                      │  │
│  │    Arraste arquivos aqui ou clique para selecionar  │  │
│  │                                                      │  │
│  │    PDF, PNG, JPG até 10MB                           │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  Arquivos selecionados:                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ [📄] documento.pdf          2.5 MB        [✕]       │  │
│  │ [🖼️] imagem.png             1.2 MB        [✕]       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  [Cancelar]                          [Upload 2 arquivos]  │
└────────────────────────────────────────────────────────────┘
```

**Código Exemplo**:
```typescript
import { useDropzone } from '@platform/app-components/dropzone';

function FileUpload({ onUpload }) {
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
    onDrop: handleDrop
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer",
          isDragActive ? "border-primary bg-primary/10" : "border-border"
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-2">
          {isDragActive
            ? "Solte os arquivos aqui"
            : "Arraste arquivos aqui ou clique para selecionar"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          PDF, PNG, JPG até 10MB
        </p>
      </div>

      {acceptedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="font-medium">Arquivos selecionados:</p>
          {acceptedFiles.map((file, index) => (
            <FilePreview key={index} file={file} onRemove={() => removeFile(index)} />
          ))}
        </div>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={handleCancel}>
          Cancelar
        </Button>
        <Button onClick={handleUpload} disabled={acceptedFiles.length === 0}>
          Upload {acceptedFiles.length} arquivo(s)
        </Button>
      </div>
    </div>
  );
}
```

### 9.2 Guidelines File Upload

**Drag & Drop Zone**:
- Border dashed quando idle
- Background highlight quando drag over
- Visual feedback claro

**File Restrictions**:
- Validar tipo de arquivo
- Validar tamanho máximo
- Exibir mensagens de erro claras

**Preview**:
- Mostrar nome, tamanho, tipo
- Ícone apropriado por tipo
- Botão para remover

**Upload Progress**:
```
┌────────────────────────────────────────┐
│ [📄] documento.pdf                    │
│ ▓▓▓▓▓▓▓▓▓▓░░░░░░░░░ 60%              │
│ Enviando... 1.5 MB / 2.5 MB           │
└────────────────────────────────────────┘
```

---

## 10. TanStack Virtual - Virtualização

### 10.1 Virtual List

**Uso para listas longas** (>100 itens):

```typescript
import { useVirtualizer } from '@platform/app-components/virtual';

function VirtualList({ items }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Altura de cada item
    overscan: 5 // Items extras para suavizar scroll
  });

  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`
            }}
          >
            <ListItem item={items[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 10.2 Guidelines Virtualização

**Quando Usar**:
- Listas com >100 itens
- Tabelas com >50 linhas
- Scroll infinito

**Performance**:
- EstimateSize preciso melhora performance
- Overscan: 5-10 items
- Scroll suave com CSS

---

## 11. react-colorful - Color Picker

### 11.1 Hex Color Picker

**Wireframe**:
```
┌────────────────────────────────────┐
│  Escolha uma cor                   │
├────────────────────────────────────┤
│  ┌────────────────────────────┐   │
│  │                            │   │
│  │  [Gradient picker visual]  │   │
│  │            ○               │   │
│  │                            │   │
│  └────────────────────────────┘   │
│                                    │
│  ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░  ○          │
│                                    │
│  #3B82F6                           │
│  ┌──────────────────────────────┐ │
│  │  #3B82F6                     │ │
│  └──────────────────────────────┘ │
│                                    │
│  [Cancelar]           [Aplicar]   │
└────────────────────────────────────┘
```

**Código Exemplo**:
```typescript
import { HexColorPicker, HexColorInput } from '@platform/app-components/colorful';

function ColorPickerDialog({ color, onChange, onClose }) {
  const [selectedColor, setSelectedColor] = useState(color);

  return (
    <Dialog>
      <DialogContent>
        <DialogTitle>Escolha uma cor</DialogTitle>

        <HexColorPicker
          color={selectedColor}
          onChange={setSelectedColor}
        />

        <div className="mt-4">
          <Label htmlFor="hex">Código hexadecimal</Label>
          <HexColorInput
            id="hex"
            color={selectedColor}
            onChange={setSelectedColor}
            prefixed
            className="mt-1"
          />
        </div>

        <div className="flex items-center gap-2 mt-4">
          <div
            className="w-12 h-12 rounded border"
            style={{ backgroundColor: selectedColor }}
          />
          <div className="text-sm text-muted-foreground">
            Preview
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => onChange(selectedColor)}>
            Aplicar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 12. Performance & Bundle Size

### 12.1 Code Splitting

Cada biblioteca é um **chunk separado**:

```
app-components.recharts.js     (120KB gzip)
app-components.table.js         (45KB gzip)
app-components.calendar.js      (180KB gzip)
app-components.dnd.js          (35KB gzip)
app-components.tiptap.js       (250KB gzip)
app-components.dropzone.js     (15KB gzip)
app-components.virtual.js      (8KB gzip)
app-components.colorful.js     (12KB gzip)
────────────────────────────────────────────
Total (se carregar tudo):      (665KB gzip) ✓
```

### 12.2 Tree Shaking

Apenas o que é **usado** é incluído:

```typescript
// ✓ Correto - tree-shakeable
import { BarChart, LineChart } from '@platform/app-components/recharts';

// ✗ Errado - importa tudo
import * as Recharts from '@platform/app-components/recharts';
```

---

## 13. Roadmap de Implementação

### 13.1 Fase 1: Setup & Infraestrutura (1 dia)
1. Configurar code splitting por biblioteca
2. Setup de theme integration
3. Exports e barrel files
4. Type definitions

### 13.2 Fase 2: Recharts Integration (1 dia)
1. Wrapper components com tema
2. Color palette auto-config
3. Responsive containers
4. Exemplos de uso

### 13.3 Fase 3: TanStack Table (1-2 dias)
1. DataTable component base
2. Sorting, filtering, pagination
3. Selection e actions
4. Virtualization support

### 13.4 Fase 4: FullCalendar (1-2 dias)
1. Calendar wrapper com tema
2. Event CRUD integration
3. Views (month, week, day)
4. Drag & drop events

### 13.5 Fase 5: DnD Kit (1 dia)
1. Kanban board example
2. Sortable lists
3. Drag constraints
4. Accessibility

### 13.6 Fase 6: TipTap (1-2 dias)
1. Editor wrapper
2. Toolbar component
3. Extensions básicas
4. Image upload integration

### 13.7 Fase 7: Outros Componentes (1 dia)
1. Dropzone wrapper
2. Color picker wrapper
3. Virtualizer examples
4. Documentation

### 13.8 Fase 8: Documentação (1 dia)
1. Usage examples
2. Best practices guide
3. Performance tips
4. Troubleshooting

---

## Conclusão

Este documento define guidelines completos para o módulo App Components:

**O que este módulo fornece**:
- 8 bibliotecas especializadas para aplicações complexas
- Integração automática com tema da plataforma
- Code splitting inteligente
- Tree shaking para otimização

**Guidelines de Uso**:
- Sempre use ResponsiveContainer (Recharts)
- Habilite virtualização para listas longas (TanStack Virtual)
- Use cores semânticas do tema
- Siga accessibility best practices

**Performance**:
- Bundle total: ~665KB gzipped (se carregar tudo)
- Lazy loading por biblioteca
- Tree shaking remove código não usado
- Otimizado para produção

Esta especificação serve como referência para desenvolvedores que utilizarão os componentes avançados fornecidos pelo módulo App Components.
