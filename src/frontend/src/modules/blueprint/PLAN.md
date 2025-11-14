# PLAN_BLUEPRINT.md - Módulo Blueprint + Sistema de Homepage

**Objetivo**: Criar módulo de referência que demonstra padrões corretos de desenvolvimento e implementar sistema de homepage para portais.

---

## 📋 RESUMO EXECUTIVO

### Problemas Identificados
1. ❌ Módulos novos são criados com erros recorrentes (dependências externas, rotas no backend)
2. ❌ Desenvolvedores não seguem padrões estabelecidos (JQEL, auto-contenção)
3. ❌ Falta de exemplo concreto demonstrando as práticas corretas
4. ⚠️ Portais não possuem sistema de homepage configurável

### Solução (Baseada em Padrões)
- ✅ Criar módulo **blueprint** como exemplo de referência completo
- ✅ Documentar todos os padrões em README.md dentro do módulo
- ✅ Implementar sistema de homepage do portal (redirect para subrota)
- ✅ Demonstrar uso correto de JQEL, assets, single-instance, lazy-loading

**Referência de Design**: `src/frontend/src/modules/blueprint/DESIGN.md`

---

## 🎯 FASE 1: ESTRUTURA BASE DO MÓDULO BLUEPRINT

### 1.1. Criar Estrutura de Pastas

- [x] Criar `src/frontend/src/modules/blueprint/assets/`
- [x] Criar `src/frontend/src/modules/blueprint/components/`
- [x] Criar `src/frontend/src/modules/blueprint/pages/`
- [x] Criar `src/frontend/src/modules/blueprint/hooks/`
- [x] Criar `src/frontend/src/modules/blueprint/types/`

### 1.2. Criar Asset de Exemplo (banner.svg)

- [x] Criar `assets/banner.svg` com SVG simples
  - [x] SVG deve ter dimensões 800x200
  - [x] Conter texto "Blueprint Module"
  - [x] Usar cores da paleta da plataforma

### 1.3. Criar Types

- [x] Criar `types/index.ts`
  - [x] Type `BlueprintConfig` para configuração da instância
  - [x] Type `BlueprintPageProps` para props dos componentes

**Código de Referência**:
```typescript
// types/index.ts
export interface BlueprintConfig {
  title?: string;
  description?: string;
  showExamples?: boolean;
}

export interface BlueprintPageProps {
  config: BlueprintConfig;
}
```

---

## 🎯 FASE 2: MANIFEST E ROTAS

### 2.1. Criar Manifest (Single-Instance)

- [x] Criar `manifest.ts`
  - [x] `id: 'blueprint'`
  - [x] `singleInstance: true`
  - [x] `type: 'functionality'`
  - [x] `category: 'system'`
  - [x] Config schema opcional (title, description)
  - [x] Dependencies vazias `[]`

**Código de Referência**:
```typescript
// manifest.ts
import type { ModuleManifest } from '@/types/module';

export const blueprintManifest: ModuleManifest = {
  id: 'blueprint',
  version: '1.0.0',
  name: 'Blueprint',
  description: 'Módulo de referência demonstrando padrões corretos de desenvolvimento',
  type: 'functionality',
  category: 'system',
  dependencies: [],
  singleInstance: true,

  capabilities: {
    providesRoutes: true,
    providesComponents: true,
  },

  routes: [
    { path: '/ola', index: false }
  ],

  config: {
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          default: 'Blueprint Module',
          description: 'Título exibido na página'
        },
        description: {
          type: 'string',
          default: 'Exemplo de módulo bem estruturado',
          description: 'Descrição do módulo'
        }
      }
    },
    defaults: {
      title: 'Blueprint Module',
      description: 'Exemplo de módulo bem estruturado'
    }
  },

  permissions: []
};
```

### 2.2. Criar Routes

- [x] Criar `routes.tsx`
  - [x] Importar `BlueprintPage` com lazy loading
  - [x] Registrar rota `/ola` (path fixo)

**Código de Referência**:
```typescript
// routes.tsx
import { lazy } from 'react';
import type { ModuleRoute } from '@/types/module';

const BlueprintPage = lazy(() =>
  import('./pages/BlueprintPage').then(m => ({ default: m.BlueprintPage }))
);

export const blueprintRoutes: ModuleRoute[] = [
  {
    path: '/ola',
    component: BlueprintPage,
    meta: {
      title: 'Blueprint - Exemplo de Módulo',
      description: 'Página de demonstração do módulo Blueprint'
    }
  }
];
```

---

## 🎯 FASE 3: HOOKS E COMPONENTES

### 3.1. Criar Hook useBlueprintConfig

- [x] Criar `hooks/useBlueprintConfig.ts`
  - [x] Buscar instância via JQEL (schema: backend, select: instance)
  - [x] Where: `moduleId = 'blueprint'` e `portalId = current`
  - [x] Retornar `config` da instância
  - [x] Usar TanStack Query com cache

**Código de Referência**:
```typescript
// hooks/useBlueprintConfig.ts
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { jqelClient } from '@/services/jqelClient';
import type { BlueprintConfig } from '../types';

export function useBlueprintConfig() {
  const { portalId = 'main' } = useParams();

  return useQuery({
    queryKey: ['blueprint', 'config', portalId],
    queryFn: async () => {
      const result = await jqelClient.query({
        schema: 'backend',
        select: 'instance',
        where: {
          portalId: { $eq: portalId },
          moduleId: { $eq: 'blueprint' }
        },
        output: ['config']
      });

      if (!result.data || result.data.length === 0) {
        return { title: 'Blueprint Module', description: '' } as BlueprintConfig;
      }

      return result.data[0].config as BlueprintConfig;
    },
    staleTime: 5 * 60 * 1000
  });
}
```

### 3.2. Criar BlueprintCard Component

- [x] Criar `components/BlueprintCard.tsx`
  - [x] Receber title, description como props
  - [x] Usar shadcn/ui Card component
  - [x] Estilizar com Tailwind

**Código de Referência**:
```typescript
// components/BlueprintCard.tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface BlueprintCardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function BlueprintCard({ title, description, children }: BlueprintCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
}
```

### 3.3. Criar HomepageToggle Component

- [x] Criar `components/HomepageToggle.tsx`
  - [x] Buscar portal atual via `usePortal()`
  - [x] Verificar se `portal.homepage.value === '/ola'`
  - [x] Botão toggle (Switch do shadcn/ui)
  - [x] Mutation para atualizar `portal.homepage` via JQEL
  - [x] Toast de feedback (sucesso/erro)

**Código de Referência**:
```typescript
// components/HomepageToggle.tsx
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { usePortal, useUpdatePortal } from '@/hooks/usePortals';
import { useParams } from 'react-router-dom';

export function HomepageToggle() {
  const { portalId = 'main' } = useParams();
  const { data: portalResult } = usePortal(portalId);
  const updatePortal = useUpdatePortal();
  const { toast } = useToast();

  const portal = portalResult?.data?.[0];
  const isHomepage = portal?.homepage?.type === 'subroute' && portal?.homepage?.value === '/ola';

  const handleToggle = async (checked: boolean) => {
    try {
      await updatePortal.mutateAsync({
        portalId,
        homepage: checked
          ? { type: 'subroute', value: '/ola' }
          : { type: 'none' }
      });

      toast({
        title: checked ? 'Homepage ativada' : 'Homepage desativada',
        description: checked
          ? 'Este módulo agora é a homepage do portal'
          : 'Homepage removida do portal'
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a homepage',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch id="homepage" checked={isHomepage} onCheckedChange={handleToggle} />
      <Label htmlFor="homepage">Usar como homepage do portal</Label>
    </div>
  );
}
```

---

## 🎯 FASE 4: PÁGINA PRINCIPAL

### 4.1. Criar BlueprintPage

- [x] Criar `pages/BlueprintPage.tsx`
  - [x] Importar banner.svg com path relativo
  - [x] Usar `useBlueprintConfig()` hook
  - [x] Renderizar banner (img src={bannerSvg})
  - [x] Exibir config via BlueprintCard
  - [x] Incluir HomepageToggle component
  - [x] Adicionar exemplos de código comentados

**Código de Referência**:
```typescript
// pages/BlueprintPage.tsx
import bannerSvg from '../assets/banner.svg';
import { BlueprintCard } from '../components/BlueprintCard';
import { HomepageToggle } from '../components/HomepageToggle';
import { useBlueprintConfig } from '../hooks/useBlueprintConfig';
import { Code2, Database, FileCode } from 'lucide-react';

export function BlueprintPage() {
  const { data: config, isLoading } = useBlueprintConfig();

  if (isLoading) {
    return <div className="p-8">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      {/* Banner */}
      <div className="w-full">
        <img
          src={bannerSvg}
          alt="Blueprint Module Banner"
          className="w-full rounded-lg shadow-md"
        />
      </div>

      {/* Configuração da Instância */}
      <BlueprintCard
        title={config?.title || 'Blueprint Module'}
        description={config?.description}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Esta página demonstra as práticas corretas para criar módulos na plataforma.
          </p>

          {/* Toggle Homepage */}
          <HomepageToggle />
        </div>
      </BlueprintCard>

      {/* Exemplos */}
      <BlueprintCard title="Padrões Demonstrados">
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <FileCode className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <strong>Assets Internos:</strong> Banner importado de <code>./assets/banner.svg</code>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <Database className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <strong>JQEL:</strong> Config carregada via <code>useBlueprintConfig()</code> hook
            </div>
          </li>
          <li className="flex items-start gap-2">
            <Code2 className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <strong>Single-Instance:</strong> Apenas uma instância por portal
            </div>
          </li>
        </ul>
      </BlueprintCard>
    </div>
  );
}
```

---

## 🎯 FASE 5: AUTO-REGISTRO E README

### 5.1. Criar index.ts (Auto-registro)

- [x] Criar `index.ts`
  - [x] Exportar `blueprintModule` (ModuleExports)
  - [x] Chamar `moduleRegistry.register(blueprintModule)`

**Código de Referência**:
```typescript
// index.ts
import type { ModuleExports } from '@/types/module';
import { blueprintManifest } from './manifest';
import { blueprintRoutes } from './routes';
import { moduleRegistry } from '@/core/modules';

export const blueprintModule: ModuleExports = {
  manifest: blueprintManifest,
  routes: blueprintRoutes
};

moduleRegistry.register(blueprintModule);
```

### 5.2. Criar README.md (Documentação)

- [x] Criar `README.md`
  - [x] Seção: Estrutura de pastas obrigatória
  - [x] Seção: Como usar JQEL (NUNCA criar rotas no backend)
  - [x] Seção: Como importar assets (path relativo)
  - [x] Seção: Single vs Multi-instance
  - [x] Seção: Lazy-loading de componentes
  - [x] Seção: Auto-registro no moduleRegistry
  - [x] Exemplos de código

**Leitura de Referência**
- `CLAUDE.md` - Seção "Module Development"
- `spec/SPEC-modules.md` - Especificação completa de módulos
- `spec/SPEC-data-access.md` - Como usar JQEL corretamente

---

## 🎯 FASE 6: SISTEMA DE HOMEPAGE DO PORTAL

### 6.1. Atualizar Types do Portal

- [x] Editar `src/types/portal.ts`
  - [x] Adicionar campo `homepage` na interface `Portal`
  - [x] Type: `{ type: 'none' | 'subroute'; value?: string }`

**Código de Referência**:
```typescript
// src/types/portal.ts
export interface Portal {
  portalId: string;
  name: string;
  description?: string;
  realmId: string;
  availableModules: string[];
  activeModules: string[];
  removable: boolean;
  homepage?: {
    type: 'none' | 'subroute';
    value?: string;
  };
  metadata?: Record<string, unknown>;
}
```

### 6.2. Atualizar Portals.json

- [x] Editar `src/backend/config/portals.json`
  - [x] Adicionar campo `homepage` nos portais existentes (opcional)
  - [x] Exemplo: `{ "type": "none" }` como padrão

### 6.3. Criar Hook usePortalHomepage

- [x] Criar `src/hooks/usePortalHomepage.ts`
  - [x] Hook que encapsula lógica de homepage
  - [x] Retorna: `isHomepage(path)`, `setHomepage(path)`, `clearHomepage()`

### 6.4. Atualizar PortalRouter (Redirect Logic)

- [x] Editar `src/components/routing/PortalRouter.tsx`
  - [x] Buscar `portal.homepage` após carregar portal
  - [x] Se `homepage.type === 'subroute'` e `homepage.value` existe
  - [x] Adicionar `<Route path="/" element={<Navigate to={homepage.value} replace />} />`
  - [x] Deve vir ANTES das rotas dos módulos

**Código de Referência**:
```typescript
// Dentro de PortalRouter.tsx
if (portal?.homepage?.type === 'subroute' && portal.homepage.value) {
  routes.unshift(
    <Route
      key="homepage-redirect"
      path="/"
      element={<Navigate to={portal.homepage.value} replace />}
    />
  );
}
```

---

## 🎯 FASE 7: ATIVAÇÃO DO MÓDULO

### 7.1. Registrar em modules/index.ts

- [x] Editar `src/frontend/src/modules/index.ts`
  - [x] Adicionar `'blueprint'` ao array `ACTIVE_MODULES`
  - [x] Adicionar `import './blueprint';`

### 7.2. Adicionar Metadados (modules.json)

- [x] Editar `src/backend/config/modules.json`
  - [x] Adicionar entrada para módulo `blueprint`
  - [x] Copiar estrutura de outros módulos

**Código de Referência**:
```json
{
  "moduleId": "blueprint",
  "name": "Blueprint",
  "description": "Módulo de referência demonstrando padrões corretos",
  "type": "functionality",
  "category": "system",
  "version": "1.0.0",
  "enabled": true,
  "dependencies": [],
  "singleInstance": true
}
```

### 7.3. Criar Instância Default (instances.json)

- [x] Editar `src/backend/config/instances.json`
  - [x] Adicionar instância para portal `setup`
  - [x] `instanceId: "default"`
  - [x] `moduleId: "blueprint"`
  - [x] `config: {}`

**Código de Referência**:
```json
{
  "instanceId": "default",
  "portalId": "setup",
  "moduleId": "blueprint",
  "config": {
    "title": "Blueprint Module",
    "description": "Módulo de referência para desenvolvimento"
  },
  "active": true,
  "metadata": {
    "createdAt": "2025-01-14T00:00:00Z",
    "createdBy": "system"
  }
}
```

---

## 📝 NOTAS DE IMPLEMENTAÇÃO

### Decisões Arquiteturais
- **Single-Instance para Blueprint**: Cada portal tem apenas uma instância de exemplo, suficiente para demonstrar padrões
- **Rota Fixa `/ola`**: Simplifica demonstração, não requer configuração adicional
- **Homepage via Redirect**: Implementação mais simples que component direto, suficiente para v1
- **Auto-registro automático**: Módulo se registra ao ser importado, seguindo padrão existente

### Limitações Conhecidas
- **Homepage não suporta componente direto**: Apenas redirect para subrota
  - Mitigação: Usar redirect para rota do módulo desejado
  - Alternativa futura: Implementar `homepage.type = 'component'` com lazy-loading de componente
- **Banner SVG é estático**: Não personalizado por tema
  - Mitigação: Usar cores neutras que funcionam em light/dark
  - Alternativa futura: Gerar SVG dinamicamente baseado em tema

### Referências
- `DESIGN.md` - Design detalhado aprovado pelo usuário
- `CLAUDE.md` - Padrões de desenvolvimento de módulos
- `spec/SPEC-modules.md` - Especificação formal de módulos
- `spec/SPEC-data-access.md` - Como usar JQEL corretamente
- `spec/SPEC-routing.md` - Sistema de rotas e lazy-loading
