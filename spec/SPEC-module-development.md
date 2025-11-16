# SPEC-module-development.md

## Especificação: Padrões de Desenvolvimento de Módulos

### Escopo

Este documento define formalmente os padrões obrigatórios para desenvolvimento de módulos na plataforma, baseado na implementação de referência do módulo **Blueprint**. Estabelece estrutura de diretórios, convenções de nomenclatura, padrões de implementação e integração com sistemas da plataforma.

---

## 1. Estrutura de Módulo

### Definição

Um módulo é uma unidade de funcionalidade encapsulada que segue estrutura padronizada para garantir consistência, manutenibilidade e interoperabilidade na plataforma.

### Estrutura de Diretórios

**SPEC-MD-STR-001:** Todo módulo DEVE residir em `src/frontend/src/modules/<module-name>/`

**SPEC-MD-STR-002:** O nome do diretório do módulo DEVE usar apenas lowercase com hífen para separar palavras

**SPEC-MD-STR-003:** Todo módulo DEVE seguir esta estrutura de diretórios:

```
<module-name>/
├── assets/                          # [OPCIONAL] Assets internos
├── components/                      # [OBRIGATÓRIO] Componentes React
│   ├── slots/                      # [CONDICIONAL] Componentes de slot
│   ├── config-forms/                # [CONDICIONAL] Forms de configuração de slots
│   └── setup/                       # [CONDICIONAL] Form de configuração de instância
├── hooks/                           # [OPCIONAL] React hooks customizados
├── pages/                           # [CONDICIONAL] Páginas do módulo
├── types/                           # [OPCIONAL] TypeScript types
├── schemas/                         # [OPCIONAL] Zod schemas
├── specs/                           # [OPCIONAL] Documentação técnica
├── manifest.ts                      # [OBRIGATÓRIO] Metadados do módulo
├── index.ts                         # [OBRIGATÓRIO] Entry point e auto-registro
├── routes.tsx                       # [CONDICIONAL] Definições de rotas
├── compositions.ts                  # [CONDICIONAL] Composições de layout
└── README.md                        # [RECOMENDADO] Documentação
```

**SPEC-MD-STR-004:** Diretórios marcados como [OBRIGATÓRIO] DEVEM existir em todos os módulos

**SPEC-MD-STR-005:** Diretórios marcados como [CONDICIONAL] DEVEM existir quando a condição especificada for verdadeira

**SPEC-MD-STR-006:** Módulos NÃO DEVEM criar diretórios além dos especificados sem justificativa documentada

---

## 2. Arquivos Obrigatórios

### Manifest do Módulo

**SPEC-MD-MAN-001:** Todo módulo DEVE ter arquivo `manifest.ts` exportando objeto `ModuleManifest`:

```typescript
import type { ModuleManifest } from '@/types/module';

export const <moduleName>Manifest: ModuleManifest = {
  id: string,                        // OBRIGATÓRIO: ID único
  version: string,                    // OBRIGATÓRIO: Semver (x.y.z)
  name: string,                       // OBRIGATÓRIO: Nome display
  description: string,                // OBRIGATÓRIO: Descrição clara
  type: 'functionality' | 'component', // OBRIGATÓRIO: Tipo
  category: 'system' | 'business' | 'productivity' | 'communication',
  singleInstance?: boolean,           // OPCIONAL: Uma instância por portal
  dependencies?: string[],             // OPCIONAL: IDs de dependências
  capabilities: {                     // OBRIGATÓRIO: Capacidades
    providesRoutes: boolean,
    providesComponents: boolean,
    providesSlots?: boolean,
    providesCompositions?: boolean,
  },
  config?: {                         // OPCIONAL: Schema de config
    schema: object,
    defaults: object,
  },
  routes?: Array<{path: string, index: boolean}>, // CONDICIONAL
  permissions?: string[],            // OPCIONAL: Permissões
};
```

**SPEC-MD-MAN-002:** O campo `id` DEVE usar apenas lowercase com hífen (padrão: `^[a-z][a-z0-9-]*$`)

**SPEC-MD-MAN-003:** O campo `version` DEVE seguir versionamento semântico

**SPEC-MD-MAN-004:** Se `singleInstance: true`, módulo PODE ter apenas uma instância por portal

**SPEC-MD-MAN-005:** Se `capabilities.providesRoutes: true`, arquivo `routes.tsx` DEVE existir

### Entry Point do Módulo

**SPEC-MD-IDX-001:** Todo módulo DEVE ter arquivo `index.ts` com estrutura:

```typescript
import { lazy } from 'react';
import type { ModuleExports } from '@/types/module';
import { <moduleName>Manifest } from './manifest';
import { moduleRegistry } from '@/core/modules';

// Lazy-load de componente de configuração (se existe)
const ConfigForm = lazy(() =>
  import('./components/setup/ConfigForm').then(m => ({
    default: m.ConfigForm
  }))
);

export const <moduleName>Module: ModuleExports = {
  manifest: <moduleName>Manifest,
  routes: <moduleName>Routes,         // SE providesRoutes
  configComponent: ConfigForm,        // SE tem config
  slotComponents,                     // SE providesSlots
  compositions,                        // SE providesCompositions
  slotConfigForms,                    // SE tem slot config forms
};

// Auto-registro OBRIGATÓRIO
moduleRegistry.register(<moduleName>Module);
```

**SPEC-MD-IDX-002:** O módulo DEVE se auto-registrar chamando `moduleRegistry.register()`

**SPEC-MD-IDX-003:** O módulo DEVE ser importado em `src/modules/index.ts` para ativação

**SPEC-MD-IDX-004:** Componentes de configuração DEVEM usar lazy-loading

---

## 3. Sistema de Roteamento

### Definição de Rotas

**SPEC-MD-ROU-001:** Se `providesRoutes: true`, módulo DEVE ter arquivo `routes.tsx`:

```typescript
import { lazy } from 'react';
import type { ModuleRoute } from '@/types/module';

const PageComponent = lazy(() =>
  import('./pages/PageComponent').then(m => ({
    default: m.PageComponent
  }))
);

export const <moduleName>Routes: ModuleRoute[] = [
  {
    path: '/relative-path',          // Relativo ao portal
    component: PageComponent,        // Componente lazy-loaded
    meta: {
      title: string,
      description: string,
      requiresAuth?: boolean,
      permissions?: string[],
    }
  }
];
```

**SPEC-MD-ROU-002:** Todas as páginas DEVEM usar lazy-loading com `React.lazy()`

**SPEC-MD-ROU-003:** Caminhos de rota DEVEM ser relativos ao portal (sem prefixo)

**SPEC-MD-ROU-004:** Rotas NÃO DEVEM incluir `portalId` no path

---

## 4. Convenções de Nomenclatura

### Nomes de Arquivos

**SPEC-MD-NAM-001:** Arquivos de componentes DEVEM usar PascalCase: `ComponentName.tsx`

**SPEC-MD-NAM-002:** Arquivos de hooks DEVEM usar camelCase com prefixo `use`: `useModuleName.ts`

**SPEC-MD-NAM-003:** Arquivos de tipos DEVEM usar `index.ts` ou `<name>.types.ts`

**SPEC-MD-NAM-004:** Arquivos de schemas DEVEM usar sufixo `Schemas`: `configSchemas.ts`

### Nomes de Variáveis e Funções

**SPEC-MD-NAM-005:** Componentes React DEVEM usar PascalCase

**SPEC-MD-NAM-006:** Hooks DEVEM começar com `use` seguido de PascalCase

**SPEC-MD-NAM-007:** Funções utilitárias DEVEM usar camelCase

**SPEC-MD-NAM-008:** Constantes DEVEM usar UPPER_SNAKE_CASE

**SPEC-MD-NAM-009:** Interfaces e types DEVEM usar PascalCase

---

## 5. Componentes e Páginas

### Componentes de Página

**SPEC-MD-COM-001:** Páginas DEVEM usar componente `Page` do sistema de composição:

```typescript
import { Page } from '@/core/composition';

export function MyModulePage() {
  return (
    <Page composition="app-layout">
      <div className="container mx-auto p-6">
        {/* Conteúdo */}
      </div>
    </Page>
  );
}
```

**SPEC-MD-COM-002:** Componentes DEVEM tratar estados de loading, error e empty

**SPEC-MD-COM-003:** Componentes DEVEM ser funcionais (não usar class components)

### Slot Components

**SPEC-MD-COM-004:** Se módulo fornece slot components, DEVE exportar array em `components/slots/index.ts`:

```typescript
import type { SlotComponent } from '@/core/composition/types';

export const slotComponents: SlotComponent[] = [
  {
    slot: 'navbar' | 'sidebar' | 'breadcrumb' | 'footer',
    componentId: '<module>-<component>',
    component: MySlotComponent,
    providedBy: '<module-id>',
    name: 'Display Name',
    metadata: {
      description: string,
      features: string[],
    },
  },
];
```

---

## 6. Acesso a Dados com JQEL

### Uso Obrigatório de JQEL

**SPEC-MD-DAT-001:** Todo acesso a dados DEVE usar hooks JQEL:

```typescript
import { useJQELQuery, useJQELMutation } from '@/hooks/useJQEL';
```

**SPEC-MD-DAT-002:** Módulos NÃO DEVEM usar `fetch()` ou `axios` diretamente

**SPEC-MD-DAT-003:** Módulos NÃO DEVEM criar rotas backend próprias para dados

**SPEC-MD-DAT-004:** Módulos DEVEM usar schemas apropriados conforme `SPEC-jqel-schemas-organization.md`

### Padrão de Hook de Query

**SPEC-MD-DAT-005:** Hooks de query DEVEM seguir estrutura:

```typescript
export function useModuleData(portalId: string) {
  return useJQELQuery<DataType>({
    schema: 'backend' | 'platform' | 'system' | '<custom>',
    select: '<entity>',
    where: { portalId: { $eq: portalId } },
    output: ['field1', 'field2'],
  }, {
    staleTime: 5 * 60 * 1000,
    enabled: !!portalId,
  });
}
```

---

## 7. Configuração de Módulo

### Formulário de Configuração

**SPEC-MD-CFG-001:** Se módulo tem configuração, DEVE implementar `ConfigComponentProps`:

```typescript
interface ConfigComponentProps {
  instanceId: string;
  portalId: string;
  moduleId: string;
  config: Record<string, any>;
  onSave: (config: any) => Promise<void>;
  onCancel: () => void;
}
```

**SPEC-MD-CFG-002:** Formulários de configuração DEVEM usar React Hook Form com Zod:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const configSchema = z.object({
  // Campos de configuração
});

export function ConfigForm(props: ConfigComponentProps) {
  const form = useForm({
    resolver: zodResolver(configSchema),
    defaultValues: props.config,
  });
  // ...
}
```

---

## 8. Sistema de Composição

### Definição de Composições

**SPEC-MD-CMP-001:** Se módulo fornece composições, DEVE criar `compositions.ts`:

```typescript
import type { Composition } from '@/core/composition/types';

export const compositions: Composition[] = [
  {
    id: '<module>-<variant>',
    name: 'Nome da Composição',
    providedBy: '<module-id>',
    slots: {
      navbar: boolean,
      sidebar: boolean,
      desktop: true,              // SEMPRE true
      companion: boolean,
      breadcrumb: boolean,
      footer: boolean,
    },
    components: {
      navbar: '<module>-header',
      breadcrumb: 'portal-breadcrumb',
    },
    layout: {
      width: 'full' | 'centered',
    },
    metadata: {
      description: string,
      recommended: string,
      features: string[],
    },
  },
];
```

---

## 9. Lazy Loading e Performance

### Estratégia de Dois Níveis

**SPEC-MD-LAZ-001:** Módulos DEVEM implementar lazy-loading em dois níveis:

1. **Nível de Registro** (estático, leve): Apenas metadados (~1-2KB)
2. **Nível de Componente** (dinâmico, pesado): Código real sob demanda

**SPEC-MD-LAZ-002:** Os seguintes componentes DEVEM usar lazy-loading:
- Páginas em `routes.tsx`
- Formulários de configuração de instância
- Formulários de configuração de slots
- Componentes > 50KB

**SPEC-MD-LAZ-003:** Os seguintes NÃO DEVEM usar lazy-loading:
- Manifest
- Types/Interfaces
- Hooks
- Utilitários pequenos

---

## 10. UI e Componentes

### Uso de shadcn/ui

**SPEC-MD-UI-001:** Módulos DEVEM usar APENAS shadcn/ui para componentes UI

**SPEC-MD-UI-002:** Módulos NÃO DEVEM usar outras bibliotecas UI (Material-UI, Ant Design, etc.)

**SPEC-MD-UI-003:** Estilos DEVEM usar classes Tailwind CSS

**SPEC-MD-UI-004:** Módulos DEVEM minimizar CSS customizado

### Suporte a Temas

**SPEC-MD-UI-005:** Componentes DEVEM funcionar em light mode e dark mode

**SPEC-MD-UI-006:** Componentes DEVEM usar variáveis CSS do tema

---

## 11. Gestão de Assets

### Importação de Assets

**SPEC-MD-ASS-001:** Assets DEVEM ser importados com caminhos relativos:

```typescript
// CORRETO
import logo from '../assets/logo.svg';

// INCORRETO
import logo from '/public/logo.svg';
import logo from '@/assets/logo.svg';
```

**SPEC-MD-ASS-002:** Assets DEVEM residir em `<module>/assets/`

---

## 12. Validação e Schemas

### Schemas Zod

**SPEC-MD-VAL-001:** Validação de dados DEVE usar Zod:

```typescript
import { z } from 'zod';

export const moduleConfigSchema = z.object({
  field1: z.string().min(1, 'Campo obrigatório'),
  field2: z.number().positive(),
});

export type ModuleConfig = z.infer<typeof moduleConfigSchema>;
```

**SPEC-MD-VAL-002:** Mensagens de erro DEVEM estar em português

---

## 13. Integração com Plataforma

### Auto-Registro

**SPEC-MD-INT-001:** Módulo DEVE se auto-registrar ao ser importado

**SPEC-MD-INT-002:** Registro DEVE ocorrer em `src/modules/index.ts`:

```typescript
// src/modules/index.ts
import './my-module';  // Ativa auto-registro
```

### Sistema de Eventos

**SPEC-MD-INT-003:** Módulos PODEM escutar eventos SSE conforme `SPEC-events.md`

**SPEC-MD-INT-004:** Módulos PODEM publicar eventos via Redis conforme `SPEC-channels.md`

---

## 14. Documentação

### README do Módulo

**SPEC-MD-DOC-001:** Todo módulo DEVE ter README.md contendo:
- Descrição
- Funcionalidades
- Instalação
- Configuração
- Uso
- API/Hooks exportados
- Dependências
- Changelog

### Comentários JSDoc

**SPEC-MD-DOC-002:** Funções públicas DEVEM ter documentação JSDoc:

```typescript
/**
 * Descrição da função
 * @param {tipo} param - Descrição
 * @returns {tipo} Descrição
 * @example
 * exemplo()
 */
```

---

## 15. Anti-Padrões Proibidos

### Práticas Não Permitidas

**SPEC-MD-ANT-001:** Módulos NÃO DEVEM criar rotas backend específicas

**SPEC-MD-ANT-002:** Módulos NÃO DEVEM usar fetch/axios diretamente

**SPEC-MD-ANT-003:** Módulos NÃO DEVEM importar assets de fora do módulo

**SPEC-MD-ANT-004:** Módulos NÃO DEVEM usar bibliotecas UI além de shadcn

**SPEC-MD-ANT-005:** Módulos NÃO DEVEM acessar localStorage diretamente (usar JQEL com schema: 'frontend')

**SPEC-MD-ANT-006:** Módulos NÃO DEVEM usar IDs com maiúsculas

---

## 16. Checklist de Conformidade

### Validação Obrigatória

**SPEC-MD-CHK-001:** Antes de publicação, módulo DEVE passar validação:

1. Estrutura de diretórios conforme especificação
2. Arquivos obrigatórios presentes
3. Auto-registro funcionando
4. Lazy-loading implementado
5. JQEL para todo acesso a dados
6. Sem rotas backend próprias
7. Apenas shadcn/ui usado
8. Funciona em light/dark mode
9. TypeScript sem erros
10. Documentação completa

**SPEC-MD-CHK-002:** Módulos DEVEM atingir score mínimo de 90% no checklist de validação

---

## 17. Referência de Implementação

### Módulo Blueprint

**SPEC-MD-REF-001:** O módulo Blueprint em `src/frontend/src/modules/blueprint/` é a implementação de referência

**SPEC-MD-REF-002:** Novos módulos DEVEM seguir os padrões demonstrados no Blueprint

**SPEC-MD-REF-003:** Em caso de dúvida, o Blueprint prevalece como exemplo correto

---

*Esta especificação define padrões obrigatórios para desenvolvimento de módulos. O módulo Blueprint serve como implementação de referência. Veja também `SPEC-modules.md` para arquitetura geral de módulos.*