# Guia Rápido de Desenvolvimento de Módulos

**Baseado em**: SPEC-MODULE-PATTERNS.md
**Versão**: 1.0.0
**Última Atualização**: 2025-01-16

## 🚀 Quick Start - Criando um Novo Módulo

### Passo 1: Criar Estrutura

```bash
# Navegue até src/frontend/src/modules/
cd src/frontend/src/modules/

# Crie a estrutura do módulo (substitua 'my-module' pelo nome do seu módulo)
MODULE="my-module"
mkdir -p $MODULE/{assets,components,hooks,pages,types,schemas}
```

### Passo 2: Criar Arquivos Essenciais

#### manifest.ts
```typescript
import type { ModuleManifest } from '@/types/module';

export const myModuleManifest: ModuleManifest = {
  id: 'my-module',
  version: '1.0.0',
  name: 'My Module',
  description: 'Descrição clara do módulo',
  type: 'functionality',
  category: 'business',
  capabilities: {
    providesRoutes: true,      // Se tem páginas
    providesComponents: false,  // Se exporta componentes
  },
  routes: [
    { path: '/my-route', index: false }
  ],
};
```

#### index.ts
```typescript
import type { ModuleExports } from '@/types/module';
import { myModuleManifest } from './manifest';
import { myModuleRoutes } from './routes';
import { moduleRegistry } from '@/core/modules';

export const myModuleModule: ModuleExports = {
  manifest: myModuleManifest,
  routes: myModuleRoutes,
};

// Auto-registro (OBRIGATÓRIO!)
moduleRegistry.register(myModuleModule);
```

#### routes.tsx
```typescript
import { lazy } from 'react';
import type { ModuleRoute } from '@/types/module';

const MyModulePage = lazy(() =>
  import('./pages/MyModulePage').then(m => ({ default: m.MyModulePage }))
);

export const myModuleRoutes: ModuleRoute[] = [
  {
    path: '/my-route',
    component: MyModulePage,
    meta: {
      title: 'My Module',
      description: 'Página principal do módulo',
    },
  },
];
```

### Passo 3: Registrar o Módulo

Em `src/frontend/src/modules/index.ts`, adicione:

```typescript
import './my-module';  // Isso ativa o auto-registro!
```

## 📋 Checklists por Tipo de Módulo

### Módulo Simples (Sem Rotas)

```typescript
// Estrutura mínima necessária:
my-module/
├── components/           # ✅ Componentes reutilizáveis
├── hooks/               # ✅ Hooks do módulo
├── types/               # ✅ TypeScript types
├── manifest.ts          # ✅ OBRIGATÓRIO
├── index.ts            # ✅ OBRIGATÓRIO
└── README.md           # ✅ Recomendado

// manifest.ts
capabilities: {
  providesRoutes: false,     // Sem páginas próprias
  providesComponents: true,   // Exporta componentes
}
```

### Módulo com Páginas

```typescript
// Adicionar à estrutura mínima:
my-module/
├── pages/               # ✅ Páginas do módulo
├── routes.tsx          # ✅ Definição de rotas
└── ...

// manifest.ts
capabilities: {
  providesRoutes: true,      // Tem páginas
  providesComponents: false,
}
routes: [
  { path: '/dashboard', index: false },
  { path: '/settings', index: false },
]
```

### Módulo com Configuração

```typescript
// Adicionar à estrutura:
my-module/
├── components/
│   └── setup/
│       └── MyModuleConfigForm.tsx  # ✅ Form de configuração
├── schemas/
│   └── configSchemas.ts           # ✅ Validação Zod
└── ...

// index.ts
const MyModuleConfigForm = lazy(() =>
  import('./components/setup/MyModuleConfigForm').then(m => ({
    default: m.MyModuleConfigForm
  }))
);

export const myModuleModule: ModuleExports = {
  // ...
  configComponent: MyModuleConfigForm,
};

// manifest.ts
config: {
  schema: {
    type: 'object',
    properties: {
      apiKey: { type: 'string' },
      enabled: { type: 'boolean' },
    },
  },
  defaults: {
    apiKey: '',
    enabled: true,
  },
},
```

### Módulo com Slots para Composição

```typescript
// Adicionar à estrutura:
my-module/
├── components/
│   ├── slots/                     # ✅ Componentes de slot
│   │   ├── MyHeader.tsx
│   │   └── index.ts
│   └── config-forms/              # ✅ Config dos slots
│       ├── MyHeaderConfigForm.tsx
│       └── index.ts
├── compositions.ts                # ✅ Layouts
└── ...

// components/slots/index.ts
export const slotComponents: SlotComponent[] = [
  {
    slot: 'navbar',
    componentId: 'my-module-header',
    component: MyHeader,
    providedBy: 'my-module',
    name: 'My Custom Header',
  },
];

// compositions.ts
export const compositions: Composition[] = [
  {
    id: 'my-module-layout',
    name: 'My Module Layout',
    providedBy: 'my-module',
    slots: {
      navbar: true,
      desktop: true,
    },
    components: {
      navbar: 'my-module-header',
    },
  },
];
```

## 🎯 Exemplos de Código por Funcionalidade

### 1. Buscar Dados com JQEL

```typescript
// hooks/useMyModuleData.ts
import { useJQELQuery } from '@/hooks/useJQEL';
import { useParams } from 'react-router-dom';

export function useMyModuleData() {
  const { portalId = 'main' } = useParams();

  return useJQELQuery({
    schema: 'backend',
    select: 'instance',
    where: {
      portalId: { $eq: portalId },
      moduleId: { $eq: 'my-module' }
    },
    output: ['config', 'active']
  }, {
    staleTime: 5 * 60 * 1000
  });
}

// Uso no componente:
function MyComponent() {
  const { data, isLoading, error } = useMyModuleData();

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;

  return <div>{data?.data[0]?.config?.title}</div>;
}
```

### 2. Salvar Dados com JQEL

```typescript
// hooks/useUpdateMyModule.ts
import { useJQELMutation } from '@/hooks/useJQEL';

export function useUpdateMyModule() {
  return useJQELMutation({
    schema: 'backend',
    mutate: 'instance',
    action: 'update'
  });
}

// Uso no componente:
function SaveButton({ config }) {
  const mutation = useUpdateMyModule();

  const handleSave = () => {
    mutation.mutate({
      values: { config },
      where: {
        instanceId: { $eq: 'default' },
        moduleId: { $eq: 'my-module' }
      }
    });
  };

  return (
    <Button
      onClick={handleSave}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? 'Salvando...' : 'Salvar'}
    </Button>
  );
}
```

### 3. Criar Página com Composição

```typescript
// pages/MyModulePage.tsx
import { Page } from '@/core/composition';
import { useMyModuleData } from '../hooks/useMyModuleData';

export function MyModulePage() {
  const { data, isLoading } = useMyModuleData();

  return (
    <Page composition="app-layout">  {/* ou omitir para 'default' */}
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">
          Meu Módulo
        </h1>

        {isLoading ? (
          <div>Carregando...</div>
        ) : (
          <div>
            {/* Conteúdo da página */}
          </div>
        )}
      </div>
    </Page>
  );
}
```

### 4. Form de Configuração com Validação

```typescript
// components/setup/MyModuleConfigForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ConfigComponentProps } from '@/types/module';

const configSchema = z.object({
  apiKey: z.string().min(10, 'API Key deve ter pelo menos 10 caracteres'),
  webhookUrl: z.string().url('URL inválida').optional(),
  enabled: z.boolean().default(true),
});

type MyModuleConfig = z.infer<typeof configSchema>;

export function MyModuleConfigForm({
  config,
  onSave,
  onCancel,
}: ConfigComponentProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<MyModuleConfig>({
    resolver: zodResolver(configSchema),
    defaultValues: config,
  });

  const onSubmit = async (data: MyModuleConfig) => {
    await onSave(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="apiKey">API Key</Label>
        <Input
          id="apiKey"
          {...register('apiKey')}
          placeholder="Digite sua API Key"
        />
        {errors.apiKey && (
          <p className="text-sm text-destructive">
            {errors.apiKey.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="webhookUrl">Webhook URL (Opcional)</Label>
        <Input
          id="webhookUrl"
          {...register('webhookUrl')}
          placeholder="https://example.com/webhook"
        />
        {errors.webhookUrl && (
          <p className="text-sm text-destructive">
            {errors.webhookUrl.message}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={!isDirty}>
          Salvar
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
```

## 🚫 Erros Comuns e Como Evitar

### ❌ Erro 1: Não usar lazy-loading

```typescript
// ERRADO
import { MyPage } from './pages/MyPage';

// CORRETO
const MyPage = lazy(() =>
  import('./pages/MyPage').then(m => ({ default: m.MyPage }))
);
```

### ❌ Erro 2: Usar fetch diretamente

```typescript
// ERRADO
const response = await fetch('/api/my-data');
const data = await response.json();

// CORRETO
const { data } = useJQELQuery({
  schema: 'backend',
  select: 'my-entity',
  where: { /* filters */ }
});
```

### ❌ Erro 3: Esquecer auto-registro

```typescript
// ERRADO - Esquecer esta linha
// moduleRegistry.register(myModule);

// CORRETO - No final do index.ts
moduleRegistry.register(myModuleModule);
```

### ❌ Erro 4: Importar assets incorretamente

```typescript
// ERRADO
import logo from '/public/logo.svg';
import icon from '@/assets/icon.png';

// CORRETO
import logo from '../assets/logo.svg';
import icon from './assets/icon.png';
```

### ❌ Erro 5: Criar rotas backend

```typescript
// ERRADO - Nunca criar rotas no backend
app.get('/api/my-module/data', (req, res) => {
  // ...
});

// CORRETO - Usar JQEL
// Dados vêm via /api/jqel com query apropriada
```

## 🔧 Utilitários e Helpers

### Helper para Menu Items

```typescript
// types/menu.ts
export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  href?: string;
  children?: MenuItem[];
}

// utils/menuHelpers.ts
export function findMenuItem(
  items: MenuItem[],
  id: string
): MenuItem | undefined {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findMenuItem(item.children, id);
      if (found) return found;
    }
  }
  return undefined;
}
```

### Helper para Validação

```typescript
// utils/validation.ts
import { z } from 'zod';

export function safeParseConfig<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  defaults: T
): T {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  console.warn('Config validation failed:', result.error);
  return defaults;
}
```

### Helper para Formatação

```typescript
// utils/formatters.ts
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
```

## 📝 Template de README para Módulo

```markdown
# [Nome do Módulo]

## 📋 Descrição

[Descrição concisa do que o módulo faz e seu propósito]

## ✨ Funcionalidades

- [ ] Funcionalidade 1
- [ ] Funcionalidade 2
- [ ] Funcionalidade 3

## 🚀 Instalação

1. O módulo já está registrado automaticamente
2. Ative no portal desejado via Setup
3. Configure as opções necessárias

## ⚙️ Configuração

| Campo | Tipo | Descrição | Padrão |
|-------|------|-----------|--------|
| apiKey | string | Chave de API | - |
| enabled | boolean | Ativar módulo | true |

## 📖 Uso

### Como acessar o módulo

Após ativação, acesse via menu ou diretamente em:
- Portal Main: `/my-route`
- Outros portais: `/[portal-id]/my-route`

### Hooks Disponíveis

\`\`\`typescript
// Buscar dados do módulo
const { data, isLoading } = useMyModuleData();

// Atualizar configuração
const mutation = useUpdateMyModule();
\`\`\`

## 🔗 Dependências

- Nenhuma dependência de outros módulos

## 📚 API

### Entidades JQEL

- `my-entity`: Dados principais do módulo

### Eventos SSE

- `my-module:update`: Quando dados são atualizados

## 🛠️ Desenvolvimento

### Estrutura

\`\`\`
my-module/
├── components/     # Componentes React
├── hooks/         # React hooks
├── pages/         # Páginas
├── types/         # TypeScript types
└── manifest.ts    # Configuração do módulo
\`\`\`

### Comandos

\`\`\`bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Testes
npm test
\`\`\`

## 📄 Changelog

### v1.0.0 (2025-01-16)
- Versão inicial
- Funcionalidades básicas implementadas
```

## 🎨 Componentes shadcn/ui Mais Usados

```typescript
// Formulários
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Layout
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

// Feedback
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

// Overlays
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Dados
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Navegação
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';

// Utilidades
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
```

## 📊 Performance Checklist

- [ ] **Lazy-loading implementado** para páginas
- [ ] **Lazy-loading implementado** para formulários de config
- [ ] **Bundle size < 50KB** para componentes principais
- [ ] **Cache configurado** em queries JQEL (staleTime)
- [ ] **Memoização** onde apropriado (useMemo, useCallback)
- [ ] **Imagens otimizadas** (WebP, lazy-loading nativo)
- [ ] **CSS mínimo** (apenas Tailwind classes)

## 🔍 Debug e Troubleshooting

### Módulo não aparece no sistema

```typescript
// Verificar em src/modules/index.ts
import './my-module';  // Esta linha existe?

// Verificar auto-registro em my-module/index.ts
moduleRegistry.register(myModuleModule);  // Esta linha existe?
```

### Rotas não funcionam

```typescript
// Verificar manifest.ts
capabilities: {
  providesRoutes: true,  // Está true?
}
routes: [
  { path: '/my-route', index: false }  // Path está correto?
]

// Verificar routes.tsx
export const myModuleRoutes  // Nome está correto?

// Verificar lazy-loading
const Page = lazy(() => import('./pages/Page'))  // Import está correto?
```

### Dados não carregam

```typescript
// Verificar schema JQEL
schema: 'backend',  // Schema existe?
select: 'instance',  // Entity correta?

// Verificar where clause
where: {
  portalId: { $eq: portalId },  // portalId está definido?
  moduleId: { $eq: 'my-module' }  // ID do módulo correto?
}

// Verificar resposta
data?.data  // JQEL retorna data.data (array)
```

## 🏁 Checklist Final

Antes de considerar o módulo pronto:

### Estrutura
- [ ] Segue estrutura de diretórios padrão
- [ ] Todos arquivos obrigatórios presentes
- [ ] Convenções de nomenclatura seguidas

### Código
- [ ] Lazy-loading implementado
- [ ] JQEL usado para todos os dados
- [ ] Sem rotas backend customizadas
- [ ] Auto-registro funcionando
- [ ] TypeScript sem erros

### UI/UX
- [ ] Apenas shadcn/ui usado
- [ ] Funciona em light/dark mode
- [ ] Responsivo (mobile/desktop)
- [ ] Acessibilidade básica

### Documentação
- [ ] README.md completo
- [ ] Comentários JSDoc onde necessário
- [ ] Changelog atualizado

### Testes
- [ ] Módulo registra corretamente
- [ ] Páginas carregam sem erro
- [ ] Configuração salva/carrega
- [ ] Queries JQEL funcionam

---

**Dica Final**: Use o módulo Blueprint como referência!
Localização: `src/frontend/src/modules/blueprint/`

**Precisa de ajuda?** Consulte:
- SPEC-MODULE-PATTERNS.md (especificação completa)
- Módulo Blueprint (implementação de referência)
- Documentação da plataforma em `spec/`