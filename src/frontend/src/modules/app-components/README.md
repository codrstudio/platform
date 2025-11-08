# App Components Module

Módulo de componentes especializados para construção de aplicativos robustos (dashboards, CRUDs, helpdesks, kanbans).

## Características

- **8 bibliotecas incluídas**: Recharts, TanStack Table, FullCalendar, DnD Kit, TipTap, react-dropzone, TanStack Virtual, react-colorful
- **Code splitting automático**: Cada biblioteca é carregada sob demanda
- **Tree shaking**: Remove código não utilizado
- **Integração com tema**: Respeita automaticamente light/dark mode e brand color
- **TypeScript**: Totalmente tipado
- **Componentes pré-construídos**: DataTable e FileUpload prontos para uso

## Instalação

O módulo já vem instalado com todas as dependências necessárias.

## Uso

### Importação

```typescript
// Importar de subpaths específicos para melhor tree-shaking
import { BarChart, LineChart } from '@/modules/app-components/recharts';
import { useReactTable } from '@/modules/app-components/table';
import { Calendar } from '@/modules/app-components/calendar';

// Ou importar do index principal
import { BarChart, useReactTable, Calendar } from '@/modules/app-components';
```

### Recharts - Gráficos

```typescript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from '@/modules/app-components/recharts';

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
      </BarChart>
    </ResponsiveContainer>
  );
}
```

### TanStack Table - DataTable

```typescript
import { DataTable } from '@/modules/app-components/components';

function UsersTable() {
  const columns = [
    { accessorKey: 'name', header: 'Nome' },
    { accessorKey: 'email', header: 'Email' },
  ];

  return (
    <DataTable
      columns={columns}
      data={users}
      searchPlaceholder="Buscar usuários..."
      searchColumn="name"
      pageSize={10}
    />
  );
}
```

### FullCalendar

```typescript
import { Calendar, dayGridPlugin, timeGridPlugin, interactionPlugin } from '@/modules/app-components/calendar';

function EventCalendar() {
  return (
    <Calendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      events={events}
      editable={true}
      selectable={true}
    />
  );
}
```

### DnD Kit - Drag and Drop

```typescript
import { DndContext, useDraggable, useDroppable } from '@/modules/app-components/dnd';

function KanbanBoard() {
  return (
    <DndContext onDragEnd={handleDragEnd}>
      <KanbanColumn id="todo">
        <KanbanCard id="1" />
      </KanbanColumn>
    </DndContext>
  );
}
```

### TipTap - Rich Text Editor

```typescript
import { useEditor, EditorContent, StarterKit } from '@/modules/app-components/tiptap';

function RichTextEditor() {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Hello World!</p>',
  });

  return <EditorContent editor={editor} />;
}
```

### FileUpload

```typescript
import { FileUpload } from '@/modules/app-components/components';

function UploadForm() {
  const handleFiles = (files: File[]) => {
    console.log('Accepted files:', files);
  };

  return (
    <FileUpload
      onFilesAccepted={handleFiles}
      maxSize={10 * 1024 * 1024}
      accept={{
        'image/*': ['.png', '.jpg', '.jpeg'],
        'application/pdf': ['.pdf']
      }}
    />
  );
}
```

### TanStack Virtual - Virtualização

```typescript
import { useVirtualizer } from '@/modules/app-components/virtual';

function VirtualList({ items }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      {/* Virtual items */}
    </div>
  );
}
```

### Color Picker

```typescript
import { HexColorPicker } from '@/modules/app-components/colorful';

function ColorSelector() {
  const [color, setColor] = useState('#3B82F6');

  return <HexColorPicker color={color} onChange={setColor} />;
}
```

## Integração com Tema

O módulo se integra automaticamente com o tema da plataforma:

```typescript
import { useAppComponentsTheme } from '@/modules/app-components';

// Em _app.tsx ou App.tsx
function App() {
  useAppComponentsTheme(); // Auto-configura todos os componentes

  return <YourApp />;
}
```

### Cores Semânticas

Todos os componentes respeitam as cores semânticas do tema:

```typescript
import { RECHARTS_COLORS } from '@/modules/app-components/recharts';

// Usar em gráficos
<Bar dataKey="sales" fill={RECHARTS_COLORS.primary} />
<Bar dataKey="target" fill={RECHARTS_COLORS.secondary} />
```

## Bundle Size

| Biblioteca | Tamanho (gzipped) |
|------------|-------------------|
| Recharts   | ~120KB            |
| TanStack Table | ~45KB         |
| FullCalendar | ~180KB          |
| DnD Kit    | ~35KB             |
| TipTap     | ~250KB            |
| react-dropzone | ~15KB         |
| TanStack Virtual | ~8KB        |
| react-colorful | ~12KB         |
| **Total**  | **~665KB**        |

**Nota**: Graças ao code splitting, apenas as bibliotecas utilizadas são carregadas.

## Performance

- **Code Splitting**: Cada biblioteca é um chunk separado
- **Tree Shaking**: Remove código não utilizado em produção
- **Lazy Loading**: Bibliotecas são carregadas sob demanda
- **Virtualização**: Use TanStack Virtual para listas longas (>100 items)

## TypeScript

Todos os componentes são totalmente tipados:

```typescript
import type { ColumnDef } from '@/modules/app-components/table';
import type { CalendarOptions } from '@/modules/app-components/calendar';
import type { Editor } from '@/modules/app-components/tiptap';
```

## Documentação

- [Recharts](https://recharts.org/)
- [TanStack Table](https://tanstack.com/table)
- [FullCalendar](https://fullcalendar.io/)
- [DnD Kit](https://dndkit.com/)
- [TipTap](https://tiptap.dev/)
- [react-dropzone](https://react-dropzone.js.org/)
- [TanStack Virtual](https://tanstack.com/virtual)
- [react-colorful](https://omgovich.github.io/react-colorful/)

## Exemplos

Veja `spec/ui/app-components-module-interfaces.md` para exemplos completos de UI/UX.
