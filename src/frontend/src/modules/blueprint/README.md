# Blueprint Module - Guia de Desenvolvimento de Módulos

Este módulo serve como **referência e exemplo** para a criação de novos módulos na plataforma. Ele demonstra todos os padrões e práticas recomendadas que devem ser seguidos.

---

## 📁 Estrutura de Pastas Obrigatória

Todo módulo DEVE seguir esta estrutura:

```
module-name/
├── assets/              # Assets internos (imagens, ícones, SVGs)
│   └── banner.svg       # Exemplo: banner do módulo
├── components/          # Componentes React reutilizáveis
│   ├── Component1.tsx
│   └── Component2.tsx
├── pages/              # Páginas (rotas) do módulo
│   └── MainPage.tsx
├── hooks/              # Custom hooks do módulo
│   └── useModuleData.ts
├── types/              # TypeScript types e interfaces
│   └── index.ts
├── manifest.ts         # Metadados do módulo (OBRIGATÓRIO)
├── routes.tsx          # Definição de rotas (OBRIGATÓRIO)
├── index.ts            # Entry point + auto-registro (OBRIGATÓRIO)
└── README.md           # Documentação do módulo
```

### Pastas Opcionais

Adicione conforme necessário:

- `contexts/` - React Contexts
- `services/` - Lógica de negócio/API
- `utils/` - Funções utilitárias
- `data/` - Dados estáticos/mocks

---

## 🚫 NUNCA Crie Rotas no Backend

**CRÍTICO**: Todos os dados DEVEM ser acessados via **JQEL** (JSON Query Expression Language).

### ❌ ERRADO: Criar rota no backend

```typescript
// backend/routes/mymodule.ts
app.get('/api/mymodule/data', async (req, res) => {
  const data = await database.query('SELECT * FROM data');
  res.json(data);
});
```

### ✅ CORRETO: Usar JQEL

```typescript
// hooks/useMyModuleData.ts
import { useQuery } from '@tanstack/react-query';
import { jqelClient } from '@/services/jqelClient';

export function useMyModuleData() {
  return useQuery({
    queryKey: ['mymodule', 'data'],
    queryFn: async () => {
      const result = await jqelClient.query({
        schema: 'backend',  // ou 'platform', 'custom-schema'
        select: 'entity',
        where: { /* condições */ },
        output: ['field1', 'field2']
      });
      return result.data;
    },
    staleTime: 5 * 60 * 1000  // Cache 5 minutos
  });
}
```

### Schemas JQEL Disponíveis

- `backend` - Configuração de portais, módulos, instâncias
- `platform` - Recursos do sistema (via n8n)
- `frontend` - Dados locais (localStorage)
- `{custom}` - Schema customizado para seu módulo (ex: `chat`, `kanban`)

**Referência**: `spec/SPEC-data-access.md`, `spec/SPEC-jqel-syntax.md`

---

## 🖼️ Como Importar Assets

Assets DEVEM estar dentro da pasta `assets/` do módulo e serem importados com **path relativo**.

### ✅ CORRETO

```typescript
// pages/MyPage.tsx
import logoSvg from '../assets/logo.svg';
import bannerPng from '../assets/banner.png';

export function MyPage() {
  return (
    <div>
      <img src={logoSvg} alt="Logo" />
      <img src={bannerPng} alt="Banner" />
    </div>
  );
}
```

### ❌ ERRADO

```typescript
// NÃO use paths absolutos ou externos
import logo from '/public/logo.svg';  // ❌
import banner from '@/assets/banner.png';  // ❌
```

### Por Que?

- **Auto-contenção**: Módulo é totalmente independente
- **Portabilidade**: Pode ser movido/copiado sem quebrar
- **Bundling**: Vite otimiza e agrupa assets automaticamente

---

## 🔄 Single-Instance vs Multi-Instance

### Single-Instance

**Quando usar**: Módulos de infraestrutura/configuração que devem ter apenas UMA instância por portal.

**Exemplos**: `auth`, `setup`, `blueprint`

```typescript
// manifest.ts
export const myManifest: ModuleManifest = {
  id: 'my-module',
  singleInstance: true,  // ⭐ Apenas UMA instância
  // ...
};
```

**Instância no backend**:
```json
{
  "instanceId": "default",  // Sempre "default"
  "portalId": "main",
  "moduleId": "my-module",
  "config": {},
  "active": true
}
```

### Multi-Instance

**Quando usar**: Módulos que podem ter múltiplas configurações/instâncias no mesmo portal.

**Exemplos**: `chat`, `chatify`, `forms`, `homepage`

```typescript
// manifest.ts
export const myManifest: ModuleManifest = {
  id: 'my-module',
  singleInstance: false,  // ou omitir (padrão)

  config: {
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', default: 'Default' },
        color: { type: 'string', default: '#000' }
      }
    },
    defaults: { title: 'Default', color: '#000' }
  }
};
```

**Instâncias no backend**:
```json
[
  {
    "instanceId": "chat-support",
    "portalId": "main",
    "moduleId": "chat",
    "config": { "title": "Suporte", "agentId": "support-bot" }
  },
  {
    "instanceId": "chat-sales",
    "portalId": "main",
    "moduleId": "chat",
    "config": { "title": "Vendas", "agentId": "sales-bot" }
  }
]
```

---

## ⚡ Lazy-Loading de Componentes

**SEMPRE** use lazy-loading para páginas (rotas).

### ✅ CORRETO

```typescript
// routes.tsx
import { lazy } from 'react';
import type { ModuleRoute } from '@/types/module';

const MainPage = lazy(() =>
  import('./pages/MainPage').then(m => ({ default: m.MainPage }))
);

const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage }))
);

export const myRoutes: ModuleRoute[] = [
  { path: '/', component: MainPage, index: true },
  { path: '/settings', component: SettingsPage }
];
```

### ❌ ERRADO

```typescript
// NÃO importe diretamente
import { MainPage } from './pages/MainPage';  // ❌

export const myRoutes = [
  { path: '/', component: MainPage }  // ❌ Não será lazy-loaded
];
```

### Por Que?

- **Performance**: Código é baixado apenas quando a rota é acessada
- **Bundle Size**: Cada módulo gera chunk separado
- **Escalabilidade**: Suporta 100+ módulos sem impacto na performance inicial

---

## 🔧 Auto-Registro no ModuleRegistry

Todo módulo DEVE se auto-registrar ao ser importado.

### index.ts (Entry Point)

```typescript
// index.ts
import type { ModuleExports } from '@/types/module';
import { myManifest } from './manifest';
import { myRoutes } from './routes';
import { moduleRegistry } from '@/core/modules';

export const myModule: ModuleExports = {
  manifest: myManifest,
  routes: myRoutes
};

// ⭐ Auto-registro
moduleRegistry.register(myModule);
```

### Ativar no Sistema

**1. Adicionar em `src/modules/index.ts`:**

```typescript
export const ACTIVE_MODULES = [
  'setup',
  'auth',
  'chatify',
  'my-module',  // ← Adicionar aqui
] as const;

import './setup';
import './auth';
import './chatify';
import './my-module';  // ← Importar aqui (trigger auto-registro)
```

**2. Adicionar metadados em `src/backend/config/modules.json`:**

```json
{
  "moduleId": "my-module",
  "name": "My Module",
  "description": "Descrição do módulo",
  "type": "functionality",
  "category": "business",
  "version": "1.0.0",
  "enabled": true,
  "dependencies": [],
  "singleInstance": false
}
```

**3. Criar instância em `src/backend/config/instances.json`:**

```json
{
  "instanceId": "default",
  "portalId": "main",
  "moduleId": "my-module",
  "config": {},
  "active": true
}
```

---

## 📝 Exemplo Completo: Manifest

```typescript
// manifest.ts
import type { ModuleManifest } from '@/types/module';

export const myManifest: ModuleManifest = {
  id: 'my-module',
  version: '1.0.0',
  name: 'My Module',
  description: 'Descrição do módulo',
  type: 'functionality',  // ou 'component'
  category: 'business',   // system | business | productivity | communication | core
  dependencies: [],       // ['other-module-id']
  singleInstance: false,  // true para single-instance

  capabilities: {
    providesRoutes: true,
    providesComponents: true,
    providesWidgets: false
  },

  routes: [
    { path: '/', index: true },
    { path: '/settings', index: false }
  ],

  config: {
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          default: 'Default Title',
          description: 'Título exibido'
        }
      }
    },
    defaults: {
      title: 'Default Title'
    }
  },

  permissions: ['read', 'write']
};
```

---

## 📚 Referências

### Documentação Oficial

- **CLAUDE.md** - Seção "Module Development" (guia geral)
- **spec/SPEC-modules.md** - Especificação completa de módulos
- **spec/SPEC-data-access.md** - Como usar JQEL corretamente
- **spec/SPEC-routing.md** - Sistema de rotas e lazy-loading
- **spec/SPEC-jqel-syntax.md** - Sintaxe completa do JQEL

### Exemplos de Módulos

- **blueprint** (este módulo) - Single-instance, demonstração de padrões
- **auth** - Single-instance, configuração simples
- **chatify** - Multi-instance, config extensa
- **setup** - Single-instance, rotas complexas

---

## ✅ Checklist para Novos Módulos

Antes de criar um módulo, verifique:

- [ ] Estrutura de pastas segue o padrão
- [ ] Manifest configurado corretamente (id, version, name, type, category)
- [ ] Routes usa lazy-loading para todas as páginas
- [ ] Dados acessados via JQEL (NUNCA rotas no backend)
- [ ] Assets importados com path relativo (`../assets/`)
- [ ] index.ts faz auto-registro no moduleRegistry
- [ ] Módulo adicionado em `modules/index.ts` (ACTIVE_MODULES)
- [ ] Metadados em `backend/config/modules.json`
- [ ] Instância criada em `backend/config/instances.json`
- [ ] README.md documentando funcionalidades

---

**Lembre-se**: Este módulo Blueprint é a referência. Quando em dúvida, consulte o código aqui!
