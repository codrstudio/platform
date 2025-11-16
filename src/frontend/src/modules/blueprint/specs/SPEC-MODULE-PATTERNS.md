# SPEC-MODULE-PATTERNS - Especificação de Padrões para Desenvolvimento de Módulos

**Versão**: 1.0.0
**Última Atualização**: 2025-01-16
**Status**: Normativo
**Baseado em**: Módulo Blueprint v1.0.0

## 1. RESUMO EXECUTIVO

Esta especificação define os **padrões obrigatórios** para desenvolvimento de módulos na plataforma. O módulo **Blueprint** serve como implementação de referência e todos os novos módulos **DEVEM** seguir esta estrutura.

### 1.1 Objetivos

- Garantir **consistência** entre todos os módulos
- Facilitar **manutenção** e evolução do código
- Promover **reusabilidade** de componentes
- Assegurar **compatibilidade** com o sistema de composição
- Manter **isolamento** e portabilidade dos módulos

### 1.2 Escopo

Esta especificação cobre:
- Estrutura de diretórios e arquivos
- Convenções de nomenclatura
- Padrões de implementação
- Integração com sistemas da plataforma (JQEL, composição, roteamento)
- Regras de lazy-loading e performance
- Documentação obrigatória

## 2. ESTRUTURA DE DIRETÓRIOS

### 2.1 Estrutura Obrigatória

Todo módulo **DEVE** seguir esta estrutura de diretórios:

```
<module-name>/
├── assets/                          # [OPCIONAL] Assets internos do módulo
├── components/                      # [OBRIGATÓRIO] Componentes React
│   ├── slots/                      # [CONDICIONAL] Slot components (se fornece slots)
│   ├── config-forms/                # [CONDICIONAL] Forms de configuração de slots
│   └── setup/                       # [CONDICIONAL] Form de configuração de instância
├── hooks/                           # [OPCIONAL] React hooks customizados
├── pages/                           # [CONDICIONAL] Páginas (se providesRoutes: true)
├── types/                           # [OPCIONAL] TypeScript types/interfaces
├── schemas/                         # [OPCIONAL] Zod schemas para validação
├── specs/                           # [OPCIONAL] Documentação técnica/design
├── manifest.ts                      # [OBRIGATÓRIO] Metadados do módulo
├── index.ts                         # [OBRIGATÓRIO] Entry point + auto-registro
├── routes.tsx                       # [CONDICIONAL] Rotas (se providesRoutes: true)
├── compositions.ts                  # [CONDICIONAL] Composições (se fornece compositions)
└── README.md                        # [RECOMENDADO] Documentação do módulo
```

### 2.2 Regras de Estrutura

**SPEC-MP-STR-001**: Diretórios marcados como [OBRIGATÓRIO] **DEVEM** existir em todos os módulos.

**SPEC-MP-STR-002**: Diretórios marcados como [CONDICIONAL] **DEVEM** existir se a condição for verdadeira.

**SPEC-MP-STR-003**: Diretórios marcados como [OPCIONAL] **PODEM** existir conforme necessidade.

**SPEC-MP-STR-004**: Módulos **NÃO DEVEM** criar diretórios além dos especificados sem justificativa documentada.

## 3. ARQUIVOS OBRIGATÓRIOS

### 3.1 manifest.ts

**SPEC-MP-MAN-001**: Todo módulo **DEVE** ter um arquivo `manifest.ts` exportando um objeto `ModuleManifest`:

```typescript
import type { ModuleManifest } from '@/types/module';

export const <moduleName>Manifest: ModuleManifest = {
  // Identificação
  id: string,                        // OBRIGATÓRIO: ID único do módulo (lowercase, hífen)
  version: string,                    // OBRIGATÓRIO: Versionamento semântico (x.y.z)
  name: string,                       // OBRIGATÓRIO: Nome de exibição
  description: string,                // OBRIGATÓRIO: Descrição clara do módulo

  // Classificação
  type: 'functionality' | 'component', // OBRIGATÓRIO: Tipo do módulo
  category: 'system' | 'business' | 'productivity' | 'communication', // OBRIGATÓRIO

  // Comportamento
  singleInstance?: boolean,           // OPCIONAL: true = apenas uma instância por portal
  dependencies?: string[],             // OPCIONAL: IDs de módulos dependentes

  // Capacidades
  capabilities: {                     // OBRIGATÓRIO
    providesRoutes: boolean,          // Define se módulo tem páginas próprias
    providesComponents: boolean,      // Define se exporta componentes
    providesWidgets?: boolean,        // Define se fornece widgets
    providesSlots?: boolean,          // Define se fornece slot components
    providesCompositions?: boolean,   // Define se fornece composições
  },

  // Configuração
  config?: {                         // OPCIONAL: Schema de configuração da instância
    schema: object,                   // JSON Schema para validação
    defaults: object,                 // Valores padrão
  },

  // Rotas (se providesRoutes: true)
  routes?: Array<{                   // CONDICIONAL: Lista de rotas do módulo
    path: string,                     // Caminho relativo ao portal
    index: boolean,                   // Se é rota index
  }>,

  // Permissões
  permissions?: string[],            // OPCIONAL: Permissões requeridas
};
```

### 3.2 index.ts

**SPEC-MP-IDX-001**: Todo módulo **DEVE** ter um arquivo `index.ts` que:

1. Importa lazy components quando necessário
2. Exporta objeto `ModuleExports`
3. Auto-registra no `moduleRegistry`

```typescript
import { lazy } from 'react';
import type { ModuleExports } from '@/types/module';
import { <moduleName>Manifest } from './manifest';
import { <moduleName>Routes } from './routes';
import { moduleRegistry } from '@/core/modules';

// Lazy-load do componente de configuração (se existe)
const <ModuleName>ConfigForm = lazy(() =>
  import('./components/setup/<ModuleName>ConfigForm').then(m => ({
    default: m.<ModuleName>ConfigForm
  }))
);

export const <moduleName>Module: ModuleExports = {
  manifest: <moduleName>Manifest,              // OBRIGATÓRIO
  routes: <moduleName>Routes,                  // CONDICIONAL (se providesRoutes)
  configComponent: <ModuleName>ConfigForm,     // CONDICIONAL (se tem config)
  slotComponents,                              // CONDICIONAL (se providesSlots)
  compositions,                                // CONDICIONAL (se providesCompositions)
  slotConfigForms,                             // CONDICIONAL (se tem slot config forms)
};

// Auto-registro OBRIGATÓRIO
moduleRegistry.register(<moduleName>Module);
```

**SPEC-MP-IDX-002**: O módulo **DEVE** se auto-registrar chamando `moduleRegistry.register()`.

**SPEC-MP-IDX-003**: O arquivo index.ts **NÃO DEVE** conter lógica de negócio, apenas exportação e registro.

### 3.3 routes.tsx

**SPEC-MP-ROU-001**: Se `providesRoutes: true`, o módulo **DEVE** ter arquivo `routes.tsx`:

```typescript
import { lazy } from 'react';
import type { ModuleRoute } from '@/types/module';

// OBRIGATÓRIO: Lazy-loading de páginas
const <PageName> = lazy(() =>
  import('./pages/<PageName>').then(m => ({ default: m.<PageName> }))
);

export const <moduleName>Routes: ModuleRoute[] = [
  {
    path: '/relative-path',           // OBRIGATÓRIO: Caminho relativo ao portal
    component: <PageName>,            // OBRIGATÓRIO: Componente lazy-loaded
    meta: {                          // RECOMENDADO: Metadados da rota
      title: string,                 // Título da página
      description: string,           // Descrição para SEO
      requiresAuth?: boolean,        // Se requer autenticação
      permissions?: string[],        // Permissões requeridas
    }
  }
];
```

**SPEC-MP-ROU-002**: Todas as páginas **DEVEM** usar lazy-loading com `React.lazy()`.

**SPEC-MP-ROU-003**: Caminhos de rota **DEVEM** ser relativos ao portal (sem prefixo de portal).

## 4. CONVENÇÕES DE NOMENCLATURA

### 4.1 Nomes de Arquivos

**SPEC-MP-NAM-001**: Arquivos **DEVEM** seguir estas convenções:

| Tipo de Arquivo | Padrão | Exemplo |
|-----------------|--------|---------|
| Componentes | `PascalCase.tsx` | `UserCard.tsx`, `MainMenu.tsx` |
| Páginas | `<Name>Page.tsx` ou `<Name>.tsx` | `DashboardPage.tsx`, `Settings.tsx` |
| Hooks | `use<Name>.ts` | `useUserData.ts`, `useAuth.ts` |
| Types/Interfaces | `index.ts` ou `<name>.types.ts` | `types/index.ts`, `user.types.ts` |
| Schemas | `<name>Schemas.ts` | `configSchemas.ts`, `validationSchemas.ts` |
| Utilitários | `camelCase.ts` | `formatters.ts`, `validators.ts` |
| Constantes | `UPPER_SNAKE_CASE.ts` ou `constants.ts` | `API_ENDPOINTS.ts`, `constants.ts` |

### 4.2 Nomes de Variáveis e Funções

**SPEC-MP-NAM-002**: Variáveis e funções **DEVEM** seguir estas convenções:

```typescript
// Componentes: PascalCase
export function UserProfile() { ... }
export const UserCard: React.FC = () => { ... }

// Hooks: camelCase começando com 'use'
export function useUserData() { ... }
export const useAuth = () => { ... }

// Funções utilitárias: camelCase
export function formatDate(date: Date) { ... }
export const validateEmail = (email: string) => { ... }

// Constantes: UPPER_SNAKE_CASE ou camelCase
export const API_BASE_URL = 'https://...';
export const defaultConfig = { ... };

// Types/Interfaces: PascalCase
export interface UserData { ... }
export type UserRole = 'admin' | 'user';

// Schemas Zod: camelCase com sufixo 'Schema'
export const userConfigSchema = z.object({ ... });
export const validationSchema = z.object({ ... });
```

### 4.3 Identificadores de Módulo

**SPEC-MP-NAM-003**: IDs de módulo **DEVEM**:
- Usar apenas lowercase
- Usar hífen para separar palavras
- Ser únicos na plataforma
- Ser descritivos mas concisos

```typescript
// ✅ CORRETO
id: 'user-profile'
id: 'task-manager'
id: 'auth'

// ❌ INCORRETO
id: 'UserProfile'      // Não use PascalCase
id: 'user_profile'     // Não use underscore
id: 'usr-prof'         // Muito abreviado
```

## 5. PADRÕES DE COMPONENTES

### 5.1 Estrutura de Componentes

**SPEC-MP-COM-001**: Componentes **DEVEM** seguir esta estrutura:

```typescript
import React from 'react';
// Imports de types/interfaces
import type { ComponentProps } from './types';
// Imports de UI (shadcn/ui)
import { Button } from '@/components/ui/button';
// Imports de hooks
import { useModuleData } from '../hooks/useModuleData';
// Imports de utilitários
import { cn } from '@/lib/utils';

interface <ComponentName>Props {
  // Props definition
}

export function <ComponentName>({
  prop1,
  prop2,
  ...rest
}: <ComponentName>Props) {
  // Hooks no topo
  const { data, isLoading } = useModuleData();

  // Estado local
  const [state, setState] = useState();

  // Effects
  useEffect(() => {
    // ...
  }, []);

  // Handlers
  const handleClick = () => {
    // ...
  };

  // Render
  if (isLoading) return <LoadingState />;
  if (!data) return <EmptyState />;

  return (
    <div className="...">
      {/* Component JSX */}
    </div>
  );
}
```

### 5.2 Componentes de Página

**SPEC-MP-COM-002**: Páginas **DEVEM** usar o componente `Page` do sistema de composição:

```typescript
import { Page } from '@/core/composition';

export function MyModulePage() {
  return (
    <Page composition="app-layout">  {/* ou omitir para usar 'default' */}
      <div className="container mx-auto p-6">
        {/* Conteúdo da página */}
      </div>
    </Page>
  );
}
```

### 5.3 Slot Components

**SPEC-MP-COM-003**: Se o módulo fornece slot components, **DEVE**:

1. Criar componentes em `components/slots/`
2. Exportar array em `components/slots/index.ts`

```typescript
// components/slots/MySlotComponent.tsx
export function MySlotComponent({ config }: SlotComponentProps) {
  return <nav>{/* Component implementation */}</nav>;
}

// components/slots/index.ts
import type { SlotComponent } from '@/core/composition/types';
import { MySlotComponent } from './MySlotComponent';

export const slotComponents: SlotComponent[] = [
  {
    slot: 'navbar',                          // Tipo de slot
    componentId: '<module>-<component>',     // ID único
    component: MySlotComponent,              // Componente React
    providedBy: '<module-id>',               // ID do módulo
    name: 'Display Name',                    // Nome para exibição
    metadata: {
      description: '...',
      features: ['feature1', 'feature2'],
    },
  },
];
```

## 6. PADRÕES DE HOOKS

### 6.1 Hooks JQEL

**SPEC-MP-HOO-001**: Hooks de dados **DEVEM** usar JQEL exclusivamente:

```typescript
import { useJQELQuery, useJQELMutation } from '@/hooks/useJQEL';

// Hook de Query
export function useModuleData(portalId: string) {
  return useJQELQuery<DataType>(
    {
      schema: 'backend' | 'platform' | 'system' | '<custom>',
      select: '<entity>',
      where: { portalId: { $eq: portalId } },
      output: ['field1', 'field2'],    // Projeção opcional
      options: { limit: 10, offset: 0 } // Paginação opcional
    },
    {
      staleTime: 5 * 60 * 1000,        // Opções do TanStack Query
      cacheTime: 10 * 60 * 1000,
    }
  );
}

// Hook de Mutation
export function useUpdateModuleData() {
  return useJQELMutation({
    schema: 'backend',
    mutate: '<entity>',
    action: 'insert' | 'update' | 'delete',
  });
}
```

**SPEC-MP-HOO-002**: Hooks **NÃO DEVEM** fazer chamadas diretas com `fetch()` ou `axios`.

**SPEC-MP-HOO-003**: Hooks **NÃO DEVEM** acessar backend diretamente, apenas via JQEL.

### 6.2 Hooks Customizados

**SPEC-MP-HOO-004**: Hooks customizados **DEVEM**:
- Começar com `use`
- Retornar valores consistentes
- Ser puros (sem side effects diretos)
- Ter documentação JSDoc

```typescript
/**
 * Hook para gerenciar estado do módulo
 * @param initialState - Estado inicial
 * @returns {object} Estado e funções de atualização
 */
export function useModuleState<T>(initialState: T) {
  const [state, setState] = useState<T>(initialState);

  const updateState = useCallback((updates: Partial<T>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetState = useCallback(() => {
    setState(initialState);
  }, [initialState]);

  return {
    state,
    updateState,
    resetState,
  };
}
```

## 7. PADRÕES DE CONFIGURAÇÃO

### 7.1 Configuração de Instância

**SPEC-MP-CFG-001**: Formulário de configuração **DEVE** implementar `ConfigComponentProps`:

```typescript
// components/setup/<ModuleName>ConfigForm.tsx
import type { ConfigComponentProps } from '@/types/module';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Schema de validação
const configSchema = z.object({
  // Definir campos de configuração
});

type ModuleConfig = z.infer<typeof configSchema>;

export function <ModuleName>ConfigForm({
  instanceId,
  portalId,
  moduleId,
  config,
  onSave,
  onCancel,
}: ConfigComponentProps) {
  const form = useForm<ModuleConfig>({
    resolver: zodResolver(configSchema),
    defaultValues: config,
  });

  const handleSubmit = async (data: ModuleConfig) => {
    await onSave(data);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      {/* Campos do formulário */}
      <Button type="submit">Salvar</Button>
      <Button type="button" onClick={onCancel}>Cancelar</Button>
    </form>
  );
}
```

### 7.2 Configuração de Slots

**SPEC-MP-CFG-002**: Formulários de configuração de slots **DEVEM**:

```typescript
// components/config-forms/<SlotName>ConfigForm.tsx
import type { SlotConfigFormProps } from '@/core/composition/types';

export function <SlotName>ConfigForm({
  slotType,
  componentId,
  config = {},
  onChange,
}: SlotConfigFormProps) {
  // Merge com valores padrão
  const currentConfig = {
    ...defaultConfig,
    ...config,
  };

  const handleChange = (updates: Partial<ConfigType>) => {
    const newConfig = { ...currentConfig, ...updates };
    onChange(newConfig);
  };

  return (
    <div>
      {/* UI do formulário */}
    </div>
  );
}

// components/config-forms/index.ts
export const slotConfigForms: SlotConfigFormRegistration[] = [
  {
    componentId: '<module>-<slot>',
    slotTypes: ['navbar', 'sidebar'],
    FormComponent: <SlotName>ConfigForm,
    metadata: { name: '...', description: '...' },
    defaultConfig: { ... },
  },
];
```

## 8. PADRÕES DE SCHEMAS

### 8.1 Schemas Zod

**SPEC-MP-SCH-001**: Schemas de validação **DEVEM** usar Zod:

```typescript
// schemas/configSchemas.ts
import { z } from 'zod';

// Schema principal
export const moduleConfigSchema = z.object({
  field1: z.string().min(1, 'Campo obrigatório'),
  field2: z.number().positive('Deve ser positivo'),
  field3: z.boolean().default(false),
  nested: z.object({
    subField: z.string().optional(),
  }),
});

// Type derivado do schema
export type ModuleConfig = z.infer<typeof moduleConfigSchema>;

// Valores padrão
export const defaultModuleConfig: ModuleConfig = {
  field1: 'Valor padrão',
  field2: 100,
  field3: false,
  nested: {
    subField: undefined,
  },
};

// Validação customizada
export const validateConfig = (config: unknown): ModuleConfig => {
  return moduleConfigSchema.parse(config);
};
```

## 9. PADRÕES DE COMPOSIÇÃO

### 9.1 Definição de Composições

**SPEC-MP-CMP-001**: Se o módulo fornece composições, **DEVE** criar `compositions.ts`:

```typescript
import type { Composition } from '@/core/composition/types';

export const compositions: Composition[] = [
  {
    id: '<module>-<variant>',              // ID único da composição
    name: 'Nome da Composição',            // Nome para exibição
    providedBy: '<module-id>',             // Módulo que fornece

    slots: {                               // Slots disponíveis
      navbar: true,
      sidebar: false,
      desktop: true,                       // OBRIGATÓRIO: sempre true
      companion: false,
      breadcrumb: true,
      footer: false,
    },

    components: {                          // Componentes para cada slot
      navbar: '<module>-header',           // ID do slot component
      breadcrumb: 'portal-breadcrumb',     // Componente da plataforma
    },

    layout: {
      width: 'full' | 'centered',          // Largura do layout
      maxWidth?: '1280px',                 // Largura máxima (se centered)
    },

    metadata: {
      description: '...',
      recommended: 'web-apps' | 'websites' | 'admin-panels',
      features: ['responsive', 'accessible'],
    },
  },
];
```

## 10. PADRÕES DE ACESSO A DADOS

### 10.1 Uso Exclusivo de JQEL

**SPEC-MP-DAT-001**: Todo acesso a dados **DEVE** usar JQEL:

```typescript
// ✅ CORRETO: Via JQEL
const { data } = useJQELQuery({
  schema: 'backend',
  select: 'instance',
  where: { moduleId: { $eq: 'my-module' } }
});

// ❌ INCORRETO: Fetch direto
const response = await fetch('/api/my-module/data');

// ❌ INCORRETO: Axios
const { data } = await axios.get('/api/my-module/data');

// ❌ INCORRETO: Criar rotas no backend
app.get('/api/my-module/data', handler);
```

### 10.2 Schemas JQEL

**SPEC-MP-DAT-002**: Módulos **DEVEM** usar schemas apropriados:

| Schema | Uso | Exemplos de Entidades |
|--------|-----|----------------------|
| `frontend` | Dados locais do cliente | localStorage, sessionStorage |
| `backend` | Configurações da plataforma | portal, module, instance, realm |
| `platform` | Recursos do sistema | Roteado para n8n |
| `backbone` | Integração direta n8n | workflows, automations |
| `system` | Dados da aplicação | users, organizations |
| `<custom>` | Dados específicos do módulo | chat-messages, kanban-boards |

**SPEC-MP-DAT-003**: Módulos **PODEM** criar schemas customizados seguindo:
- Apenas lowercase
- Hífen para separar palavras
- Padrão: `^[a-z][a-z0-9-]*$`
- Não conflitar com schemas da plataforma

## 11. PADRÕES DE LAZY-LOADING

### 11.1 Estratégia de Dois Níveis

**SPEC-MP-LAZ-001**: Módulos **DEVEM** implementar lazy-loading em dois níveis:

```typescript
// Nível 1: Registro (Estático, Leve)
// src/modules/index.ts
import './my-module';  // Carrega apenas metadados (~1-2KB)

// Nível 2: Componentes (Dinâmico, Pesado)
// my-module/routes.tsx
const MyPage = lazy(() =>
  import('./pages/MyPage')  // Carregado sob demanda
);

// my-module/index.ts
const ConfigForm = lazy(() =>
  import('./components/setup/ConfigForm')  // Carregado quando necessário
);
```

### 11.2 Componentes que Devem ser Lazy-Loaded

**SPEC-MP-LAZ-002**: Os seguintes componentes **DEVEM** usar lazy-loading:

- Páginas (em `routes.tsx`)
- Formulários de configuração de instância
- Formulários de configuração de slots
- Componentes pesados (> 50KB)
- Componentes raramente usados

**SPEC-MP-LAZ-003**: Os seguintes **NÃO DEVEM** usar lazy-loading:

- Manifest
- Types/Interfaces
- Hooks
- Utilitários pequenos
- Componentes críticos para renderização inicial

## 12. PADRÕES DE ASSETS

### 12.1 Importação de Assets

**SPEC-MP-ASS-001**: Assets **DEVEM** ser importados com caminhos relativos:

```typescript
// ✅ CORRETO: Caminho relativo dentro do módulo
import logo from '../assets/logo.svg';
import banner from './assets/banner.png';

// ❌ INCORRETO: Caminhos absolutos ou públicos
import logo from '/public/logo.svg';
import logo from '@/assets/logo.svg';
import logo from '/assets/logo.svg';
```

### 12.2 Organização de Assets

**SPEC-MP-ASS-002**: Assets **DEVEM** ser organizados em `<module>/assets/`:

```
my-module/
  assets/
    images/
      logo.svg
      banner.png
    icons/
      custom-icon.svg
    data/
      initial-data.json
```

## 13. PADRÕES DE DOCUMENTAÇÃO

### 13.1 README.md do Módulo

**SPEC-MP-DOC-001**: Todo módulo **DEVE** ter um README.md contendo:

```markdown
# Nome do Módulo

## Descrição
Breve descrição do que o módulo faz.

## Funcionalidades
- Funcionalidade 1
- Funcionalidade 2

## Instalação
Como ativar o módulo em um portal.

## Configuração
Opções de configuração disponíveis.

## Uso
Como usar o módulo após instalação.

## Desenvolvimento
Instruções para desenvolvedores.

## API/Hooks
Hooks e APIs exportados pelo módulo.

## Dependências
Módulos dos quais este depende.

## Changelog
Histórico de versões.
```

### 13.2 Comentários JSDoc

**SPEC-MP-DOC-002**: Funções públicas **DEVEM** ter documentação JSDoc:

```typescript
/**
 * Processa dados do módulo
 * @param {string} data - Dados a processar
 * @param {ProcessOptions} options - Opções de processamento
 * @returns {ProcessedData} Dados processados
 * @throws {ValidationError} Se dados inválidos
 * @example
 * const result = processModuleData(data, { validate: true });
 */
export function processModuleData(
  data: string,
  options?: ProcessOptions
): ProcessedData {
  // Implementation
}
```

## 14. INTEGRAÇÃO COM SISTEMAS DA PLATAFORMA

### 14.1 Sistema de Roteamento

**SPEC-MP-INT-001**: Rotas do módulo são automaticamente prefixadas pelo portal:

```typescript
// Definição no módulo
routes: [{ path: '/dashboard' }]

// URL final renderizada
// Portal 'main': /dashboard
// Portal 'admin': /admin/dashboard
```

### 14.2 Sistema de Composição

**SPEC-MP-INT-002**: Módulos integram com composição via:

1. **slotComponents**: Componentes para preencher slots
2. **compositions**: Layouts completos
3. **slotConfigForms**: Formulários de configuração

### 14.3 Sistema de Eventos

**SPEC-MP-INT-003**: Módulos **PODEM** escutar eventos SSE:

```typescript
useEffect(() => {
  const eventSource = new EventSource('/api/events/stream');

  eventSource.addEventListener('module-event', (e) => {
    const data = JSON.parse(e.data);
    if (data.target === `module:${moduleId}`) {
      // Processar evento
    }
  });

  return () => eventSource.close();
}, []);
```

## 15. VALIDAÇÃO E TESTES

### 15.1 Checklist de Validação

**SPEC-MP-VAL-001**: Antes de publicar, validar que o módulo:

- [ ] Segue estrutura de diretórios especificada
- [ ] Tem todos os arquivos obrigatórios
- [ ] Usa convenções de nomenclatura corretas
- [ ] Implementa lazy-loading apropriadamente
- [ ] Usa JQEL para todo acesso a dados
- [ ] Não cria rotas backend próprias
- [ ] Auto-registra no moduleRegistry
- [ ] Tem documentação README.md
- [ ] Valida configurações com Zod
- [ ] Usa apenas shadcn/ui para UI
- [ ] Importa assets com caminhos relativos
- [ ] Implementa ConfigComponentProps (se aplicável)
- [ ] Exporta tipos TypeScript apropriados
- [ ] Não tem dependências circulares
- [ ] Funciona em modo light e dark

### 15.2 Testes Mínimos

**SPEC-MP-VAL-002**: Módulos **DEVEM** ser testados para:

1. **Registro**: Módulo registra corretamente
2. **Rotas**: Páginas carregam sem erro
3. **Configuração**: Formulário salva/carrega config
4. **JQEL**: Queries retornam dados esperados
5. **Composição**: Slot components renderizam
6. **Responsividade**: Funciona em mobile/desktop
7. **Tema**: Funciona em light/dark mode

## 16. ANTI-PADRÕES (O QUE NÃO FAZER)

### 16.1 Lista de Anti-Padrões

**SPEC-MP-ANT-001**: Os seguintes anti-padrões são **PROIBIDOS**:

```typescript
// ❌ Criar rotas backend específicas do módulo
app.get('/api/my-module/data', handler);

// ❌ Usar fetch/axios diretamente
const data = await fetch('/api/data');

// ❌ Importar assets de fora do módulo
import logo from '@/assets/logo.svg';

// ❌ Não usar lazy-loading para páginas
import { MyPage } from './pages/MyPage';

// ❌ Registro manual em outro lugar
// Em src/modules/index.ts:
registerModule(myModule);  // ❌ Módulo deve se auto-registrar

// ❌ Usar bibliotecas UI além de shadcn
import { Button } from '@mui/material';

// ❌ Criar CSS customizado extensivo
.my-custom-class {
  /* Evitar CSS customizado, usar Tailwind */
}

// ❌ Acessar localStorage diretamente
localStorage.setItem('key', 'value');  // Use JQEL com schema: 'frontend'

// ❌ Misturar lógica de negócio em componentes
function MyComponent() {
  // ❌ Lógica complexa aqui
  const processedData = complexBusinessLogic(data);
}

// ❌ Usar IDs de módulo com maiúsculas
id: 'MyModule'  // Deve ser 'my-module'
```

## 17. MIGRAÇÃO DE MÓDULOS EXISTENTES

### 17.1 Guia de Migração

Para migrar módulos existentes para este padrão:

1. **Auditoria**: Verificar estrutura atual vs especificação
2. **Reestruturação**: Mover arquivos para estrutura correta
3. **Nomenclatura**: Renomear arquivos/funções conforme padrões
4. **Lazy-Loading**: Implementar para páginas e config forms
5. **JQEL**: Converter fetch/axios para useJQEL hooks
6. **Auto-Registro**: Adicionar moduleRegistry.register()
7. **Configuração**: Implementar ConfigComponentProps
8. **Documentação**: Criar/atualizar README.md
9. **Validação**: Executar checklist de validação
10. **Testes**: Garantir funcionamento completo

## 18. EXEMPLOS DE REFERÊNCIA

### 18.1 Módulo Blueprint

O módulo **Blueprint** é a implementação de referência:

```
Localização: src/frontend/src/modules/blueprint/
Características:
- Estrutura completa e correta
- Todos os padrões implementados
- Documentação exemplar
- Código limpo e organizado
```

### 18.2 Estrutura Mínima de Novo Módulo

```typescript
// my-module/manifest.ts
export const myModuleManifest: ModuleManifest = {
  id: 'my-module',
  version: '1.0.0',
  name: 'My Module',
  description: 'Description of my module',
  type: 'functionality',
  category: 'business',
  capabilities: {
    providesRoutes: false,
    providesComponents: true,
  },
};

// my-module/index.ts
import type { ModuleExports } from '@/types/module';
import { myModuleManifest } from './manifest';
import { moduleRegistry } from '@/core/modules';

export const myModuleModule: ModuleExports = {
  manifest: myModuleManifest,
};

moduleRegistry.register(myModuleModule);

// src/modules/index.ts
import './my-module';  // Adicionar esta linha
```

## 19. VERSIONAMENTO

### 19.1 Semantic Versioning

**SPEC-MP-VER-001**: Módulos **DEVEM** usar versionamento semântico:

- **MAJOR**: Mudanças incompatíveis na API
- **MINOR**: Novas funcionalidades compatíveis
- **PATCH**: Correções de bugs compatíveis

```typescript
version: '1.0.0'   // Inicial
version: '1.0.1'   // Bug fix
version: '1.1.0'   // Nova funcionalidade
version: '2.0.0'   // Breaking change
```

## 20. CONCLUSÃO

Esta especificação define os padrões **obrigatórios** para desenvolvimento de módulos na plataforma. O cumprimento destes padrões garante:

- **Consistência** entre todos os módulos
- **Manutenibilidade** do código
- **Interoperabilidade** com sistemas da plataforma
- **Performance** otimizada via lazy-loading
- **Qualidade** através de validação e tipos

**Referência**: Módulo Blueprint em `src/frontend/src/modules/blueprint/`

**Versão da Especificação**: 1.0.0
**Data**: 2025-01-16
**Status**: Normativo

---

## ANEXO A: TEMPLATE DE MÓDULO

```bash
# Script para criar estrutura de novo módulo
MODULE_NAME="my-module"
mkdir -p $MODULE_NAME/{assets,components/{slots,config-forms,setup},hooks,pages,types,schemas,specs}
touch $MODULE_NAME/{manifest.ts,index.ts,routes.tsx,compositions.ts,README.md}
```

## ANEXO B: REFERÊNCIAS

- Módulo Blueprint: `src/frontend/src/modules/blueprint/`
- Tipos do Sistema: `src/frontend/src/types/module.ts`
- Sistema de Composição: `src/frontend/src/core/composition/`
- JQEL Hooks: `src/frontend/src/hooks/useJQEL.ts`
- Especificações da Plataforma: `spec/`