# Navigation Components

Componentes reutilizáveis para navegação na plataforma.

## PageBreadcrumb

Componente de breadcrumb padronizado para todas as páginas.

### Features

- ✅ Breadcrumb consistente em todas as páginas
- ✅ Suporte automático ao link "Home"
- ✅ Ícones opcionais nos items
- ✅ Último item automaticamente não clicável (página atual)
- ✅ Responsivo e acessível
- ✅ Integração com React Router

### Uso Básico

```tsx
import { PageBreadcrumb } from '@/components/navigation';

function MyPage() {
  return (
    <div>
      <PageBreadcrumb items={[
        { label: 'Setup', href: '/setup' },
        { label: 'Portais', href: '/setup/portals' },
        { label: 'Editar Portal' } // Página atual (sem href)
      ]} />

      {/* Conteúdo da página */}
    </div>
  );
}
```

### Com Ícones

```tsx
import { Settings, Package } from 'lucide-react';

<PageBreadcrumb items={[
  {
    label: 'Setup',
    href: '/setup',
    icon: <Settings className="h-4 w-4" />
  },
  {
    label: 'Módulos',
    icon: <Package className="h-4 w-4" />
  }
]} />
```

### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `items` | `BreadcrumbItemData[]` | - | Array de items do breadcrumb |
| `includeHome` | `boolean` | `true` | Incluir link "Home" automaticamente |
| `className` | `string` | `'mb-6'` | Classes CSS adicionais |

### BreadcrumbItemData

```typescript
interface BreadcrumbItemData {
  label: string;        // Texto do item
  href?: string;        // Link (opcional - último item não deve ter)
  icon?: React.ReactNode; // Ícone opcional
}
```

## useBreadcrumb Hook

Hook para gerar breadcrumbs automaticamente baseado no contexto.

### Uso Básico

```tsx
import { PageBreadcrumb } from '@/components/navigation';
import { useBreadcrumb } from '@/hooks/useBreadcrumb';

function MyPage() {
  const breadcrumbItems = useBreadcrumb({
    portalId: 'main',
    portalName: 'Portal Principal',
    pageLabel: 'Configurações'
  });

  return (
    <div>
      <PageBreadcrumb items={breadcrumbItems} />
      {/* ... */}
    </div>
  );
}
```

### Hooks Especializados

#### useSetupBreadcrumb

Para páginas do módulo Setup:

```tsx
import { useSetupBreadcrumb } from '@/hooks/useBreadcrumb';

function PortalList() {
  const breadcrumbItems = useSetupBreadcrumb('Portais');

  return <PageBreadcrumb items={breadcrumbItems} />;
  // Resultado: Home > Setup > Portais
}
```

#### useMainPortalBreadcrumb

Para páginas do portal principal:

```tsx
import { useMainPortalBreadcrumb } from '@/hooks/useBreadcrumb';

function Dashboard() {
  const breadcrumbItems = useMainPortalBreadcrumb('Dashboard');

  return <PageBreadcrumb items={breadcrumbItems} />;
  // Resultado: Home > Dashboard
}
```

#### useBreadcrumbFromPath

Gera breadcrumb automaticamente da URL:

```tsx
import { useBreadcrumbFromPath } from '@/hooks/useBreadcrumb';

function MyPage() {
  const breadcrumbItems = useBreadcrumbFromPath();

  return <PageBreadcrumb items={breadcrumbItems} />;
  // URL: /setup/portals/edit
  // Resultado: Home > Setup > Portals > Edit
}
```

### Custom Items

Para total controle:

```tsx
const breadcrumbItems = useBreadcrumb({
  customItems: [
    { label: 'Custom', href: '/custom' },
    { label: 'Path', href: '/custom/path' },
    { label: 'Current Page' }
  ]
});
```

## PageBreadcrumbCompact

Variante compacta com menos espaçamento (mb-4 ao invés de mb-6):

```tsx
import { PageBreadcrumbCompact } from '@/components/navigation';

<PageBreadcrumbCompact items={breadcrumbItems} />
```

## Exemplos Completos

### Página Simples

```tsx
import { PageBreadcrumb } from '@/components/navigation';
import { useSetupBreadcrumb } from '@/hooks/useBreadcrumb';

export function PortalList() {
  const breadcrumbItems = useSetupBreadcrumb('Portais');

  return (
    <div className="container mx-auto p-6">
      <PageBreadcrumb items={breadcrumbItems} />

      <h1>Gerenciar Portais</h1>
      {/* Conteúdo */}
    </div>
  );
}
```

### Página com Navegação Profunda

```tsx
import { PageBreadcrumb } from '@/components/navigation';
import { useBreadcrumb } from '@/hooks/useBreadcrumb';
import { useParams } from 'react-router-dom';

export function PortalEdit() {
  const { portalId } = useParams();

  const breadcrumbItems = useBreadcrumb({
    customItems: [
      { label: 'Setup', href: '/setup' },
      { label: 'Portais', href: '/setup/portals' },
      { label: `Editar: ${portalId}` }
    ]
  });

  return (
    <div className="container mx-auto p-6">
      <PageBreadcrumb items={breadcrumbItems} />

      <h1>Editar Portal: {portalId}</h1>
      {/* Formulário */}
    </div>
  );
}
```

### Breadcrumb Condicional

```tsx
import { PageBreadcrumb } from '@/components/navigation';
import { useBreadcrumb } from '@/hooks/useBreadcrumb';
import { usePortalExists } from '@/hooks/usePortalExists';

export function MyPage({ portalId }: { portalId: string }) {
  const { data: setupExists } = usePortalExists('setup');

  const breadcrumbItems = useBreadcrumb({
    portalId,
    portalName: 'My Portal',
    customItems: setupExists ? [
      { label: 'My Portal' },
      { label: 'Editar', href: `/setup/portals/${portalId}` }
    ] : undefined
  });

  return (
    <div>
      <PageBreadcrumb items={breadcrumbItems} />
      {/* ... */}
    </div>
  );
}
```

## Padrão Recomendado

Para manter consistência, recomendamos:

1. **Sempre incluir breadcrumb** em páginas com conteúdo
2. **Usar hooks especializados** quando possível (useSetupBreadcrumb, useMainPortalBreadcrumb)
3. **Customizar apenas quando necessário** (customItems)
4. **Último item sem href** (representa página atual)
5. **Ícones opcionais** apenas quando ajudam na navegação

## Estrutura de Arquivos

```
src/frontend/src/
├── components/
│   └── navigation/
│       ├── PageBreadcrumb.tsx      # Componente principal
│       ├── index.ts                # Barrel export
│       └── README.md               # Esta documentação
└── hooks/
    └── useBreadcrumb.ts            # Hooks para geração de breadcrumbs
```

## Acessibilidade

- ✅ Navegação via teclado (Tab)
- ✅ `aria-hidden` em ícones decorativos
- ✅ Semântica correta com componentes shadcn/ui
- ✅ Links e páginas atuais claramente identificados

## Integração com Outros Componentes

O PageBreadcrumb já está integrado em:

- ✅ `PortalDefaultView` (página home dos portais)
- ✅ `SetupDashboard` (dashboard do módulo Setup)
- ✅ `PortalList` (listagem de portais)

Para adicionar em outras páginas, siga os exemplos acima.
