# SPEC-modules.md

## Especificação: Sistema de Módulos

### Escopo
Este documento define os requisitos para criação, estrutura, dependências, exportações e ciclo de vida de módulos na plataforma.

---

## 1. Estrutura de Módulo

### Definição de Módulo

**SPEC-MO-ST-001:** Módulo DEVE ser um pacote JavaScript/TypeScript autocontido

**SPEC-MO-ST-002:** Módulo DEVE ter identificador único (`moduleId`)

**SPEC-MO-ST-003:** Módulo DEVE ter arquivo de manifesto (ex: `module.json` ou export padrão)

**SPEC-MO-ST-004:** Módulo DEVE seguir estrutura de pastas consistente

### Estrutura de Pastas

**SPEC-MO-ST-005:** Estrutura conceitual de um módulo:
```
src/modules/
└─ my-module/
   ├─ index.ts           (entry point, exports)
   ├─ manifest.ts        (metadados do módulo)
   ├─ routes.ts          (definições de rotas, se aplicável)
   ├─ components/        (componentes React)
   ├─ hooks/             (custom hooks)
   ├─ types/             (TypeScript types)
   └─ utils/             (utilidades)
```

**SPEC-MO-ST-006:** Entry point (`index.ts`) DEVE exportar tudo que o módulo disponibiliza

**SPEC-MO-ST-007:** Manifesto DEVE conter metadados do módulo

**SPEC-MO-ST-008:** Estrutura interna é flexível (acima é apenas sugestão)

---

## 2. Manifesto do Módulo

### Campos Obrigatórios

**SPEC-MO-MA-001:** Manifesto DEVE incluir `id` (string, único)

**SPEC-MO-MA-002:** Manifesto DEVE incluir `name` (string, nome legível)

**SPEC-MO-MA-003:** Manifesto DEVE incluir `version` (string, semver)

**SPEC-MO-MA-004:** Manifesto DEVE incluir `type` ("components" ou "functionality")

**SPEC-MO-MA-005:** `id` DEVE ser alfanumérico, sem espaços ou caracteres especiais

**SPEC-MO-MA-006:** `id` DEVE ser único na plataforma

### Campos Opcionais

**SPEC-MO-MA-007:** Manifesto PODE incluir `description` (string)

**SPEC-MO-MA-008:** Manifesto PODE incluir `author` (string)

**SPEC-MO-MA-009:** Manifesto PODE incluir `dependencies` (array de moduleIds)

**SPEC-MO-MA-010:** Manifesto PODE incluir `icon` (nome do ícone Lucide)

**SPEC-MO-MA-011:** Manifesto PODE incluir `category` (string, para organização)

**SPEC-MO-MA-012:** Manifesto PODE incluir `instanceMode` ("single" ou "multiple", padrão: "multiple")

**SPEC-MO-MA-013:** Manifesto PODE incluir metadados customizados

### Exemplo de Manifesto

**SPEC-MO-MA-014:** Formato TypeScript (módulo multiple-instance):
```typescript
export const manifest = {
  id: "chat",
  name: "Chat",
  version: "1.0.0",
  type: "functionality",
  description: "Sistema de mensagens em tempo real",
  author: "Platform Team",
  dependencies: ["media-components", "export-components"],
  icon: "MessageSquare",
  category: "communication",
  instanceMode: "multiple"  // Permite múltiplas instâncias (padrão)
};
```

**SPEC-MO-MA-015:** Formato TypeScript (módulo single-instance):
```typescript
export const manifest = {
  id: "auth",
  name: "Auth",
  version: "1.0.0",
  type: "functionality",
  description: "Sistema de autenticação",
  author: "Platform Team",
  icon: "Lock",
  category: "security",
  instanceMode: "single"  // Apenas UMA instância por portal
};
```

---

## 3. Dependências entre Módulos

### Declaração

**SPEC-MO-DE-001:** Dependências DEVEM ser declaradas no manifesto

**SPEC-MO-DE-002:** Campo `dependencies` DEVE ser array de strings (moduleIds)

**SPEC-MO-DE-003:** Array vazio ou ausência significa sem dependências

**SPEC-MO-DE-004:** Dependências DEVEM referenciar `id` exato de outros módulos

### Validação

**SPEC-MO-DE-005:** Plataforma DEVE validar dependências ao ativar módulo

**SPEC-MO-DE-006:** Se módulo B depende de A, A DEVE estar ativo no mesmo portal

**SPEC-MO-DE-007:** Ativação de B DEVE ativar A automaticamente se não estiver ativo

**SPEC-MO-DE-008:** Dependência circular DEVE ser detectada e rejeitada

**SPEC-MO-DE-009:** Dependência de módulo inexistente DEVE impedir ativação

### Desativação

**SPEC-MO-DE-010:** Para desativar módulo A, todos os módulos dependentes DEVEM ser desativados primeiro

**SPEC-MO-DE-011:** Plataforma DEVE listar módulos dependentes ao tentar desativar

**SPEC-MO-DE-012:** Desativação em cascata PODE ser oferecida (desativar A + todos dependentes)

**SPEC-MO-DE-013:** Usuário DEVE confirmar desativação em cascata

### Resolução

**SPEC-MO-DE-014:** Dependências DEVEM ser resolvidas em ordem topológica

**SPEC-MO-DE-015:** Módulos sem dependências carregam primeiro

**SPEC-MO-DE-016:** Módulos dependentes carregam após suas dependências

**SPEC-MO-DE-017:** Ordem de carregamento DEVE ser determinística

---

## 4. Exportações de Módulo

### Tipos de Exportação

**SPEC-MO-EX-001:** Módulo PODE exportar rotas

**SPEC-MO-EX-002:** Módulo PODE exportar componentes React

**SPEC-MO-EX-003:** Módulo PODE exportar hooks

**SPEC-MO-EX-004:** Módulo PODE exportar utilities/functions

**SPEC-MO-EX-005:** Módulo PODE exportar types TypeScript

**SPEC-MO-EX-006:** Módulo PODE não exportar rotas (ex: módulos de componentes)

### Entry Point

**SPEC-MO-EX-007:** `index.ts` DEVE ser o entry point do módulo

**SPEC-MO-EX-008:** `index.ts` DEVE usar named exports ou default export

**SPEC-MO-EX-009:** Preferir named exports para clareza

**SPEC-MO-EX-010:** Tudo que módulo disponibiliza DEVE ser exportado de `index.ts`

### Exemplo

**SPEC-MO-EX-011:** Formato de exportação:
```typescript
// index.ts
export { manifest } from './manifest';
export { routes } from './routes';
export { ChatWindow, ChatList } from './components';
export { useChat } from './hooks';
export type { Message, ChatConfig } from './types';
```

---

## 5. Rotas de Módulo

### Definição

**SPEC-MO-RO-001:** Módulos com rotas DEVEM exportar array de definições

**SPEC-MO-RO-002:** Export DEVE ser nomeado `routes`

**SPEC-MO-RO-003:** Cada rota DEVE ser um objeto com campos específicos

### Campos de Rota

**SPEC-MO-RO-004:** Rota DEVE incluir `path` (string)

**SPEC-MO-RO-005:** Rota DEVE incluir `component` (React component)

**SPEC-MO-RO-006:** Rota PODE incluir `requiresAuth` (boolean)

**SPEC-MO-RO-007:** Rota PODE incluir `permissions` (array de permissões necessárias)

**SPEC-MO-RO-008:** Rota PODE incluir `layout` (componente de layout)

**SPEC-MO-RO-009:** Rota PODE incluir metadados customizados

### Path Relativo

**SPEC-MO-RO-010:** `path` DEVE ser relativo (sem prefixo de portal)

**SPEC-MO-RO-011:** Portal injeta prefixo automaticamente

**SPEC-MO-RO-012:** Exemplo: módulo exporta `/chat/:id`, portal "sac" injeta como `/sac/chat/:id`

**SPEC-MO-RO-013:** Exemplo: módulo exporta `/chat/:id`, portal "main" injeta como `/chat/:id`

### Rotas Fixas vs Livres

**SPEC-MO-RO-014:** Módulo PODE ter rotas com estrutura fixa

**SPEC-MO-RO-015:** Módulo PODE permitir rotas customizáveis por instância

**SPEC-MO-RO-016:** Decisão é do módulo, não da plataforma

### Exemplo

**SPEC-MO-RO-017:** Formato de rotas:
```typescript
// routes.ts
import { ChatDetail, ChatList } from './components';

export const routes = [
  {
    path: '/chat',
    component: ChatList,
    requiresAuth: true
  },
  {
    path: '/chat/:instanceId',
    component: ChatDetail,
    requiresAuth: true,
    permissions: ['read.chat']
  }
];
```

---

## 6. Componentes de Módulo

### Disponibilidade

**SPEC-MO-CO-001:** Componentes exportados DEVEM estar disponíveis globalmente no portal

**SPEC-MO-CO-002:** Outros módulos do mesmo portal PODEM importar componentes

**SPEC-MO-CO-003:** Módulos de outros portais NÃO PODEM acessar componentes

**SPEC-MO-CO-004:** Componentes DEVEM seguir convenções React

### Tipos de Componentes

**SPEC-MO-CO-005:** Componentes de página (usados em rotas)

**SPEC-MO-CO-006:** Componentes reutilizáveis (botões, cards, etc)

**SPEC-MO-CO-007:** Componentes de layout (headers, sidebars, etc)

**SPEC-MO-CO-008:** Providers (context providers)

### Props e TypeScript

**SPEC-MO-CO-009:** Componentes DEVEM ter props tipadas (TypeScript)

**SPEC-MO-CO-010:** Props types DEVEM ser exportadas

**SPEC-MO-CO-011:** Componentes DEVEM ter defaults para props opcionais

**SPEC-MO-CO-012:** Componentes usados em rotas NÃO DEVEM ter props obrigatórias

### Estilização

**SPEC-MO-CO-013:** Componentes DEVEM usar Tailwind utility classes

**SPEC-MO-CO-014:** Componentes DEVEM usar componentes shadcn/ui quando possível

**SPEC-MO-CO-015:** Componentes DEVEM respeitar tema do portal (claro/escuro)

**SPEC-MO-CO-016:** Componentes DEVEM usar cores semânticas

**SPEC-MO-CO-017:** Componentes NÃO DEVEM ter CSS customizado extenso

---

## 7. Hooks de Módulo

### Definição

**SPEC-MO-HO-001:** Módulos PODEM exportar custom hooks

**SPEC-MO-HO-002:** Hooks DEVEM seguir convenções React (nome começa com `use`)

**SPEC-MO-HO-003:** Hooks DEVEM ser funções puras (sem side effects globais)

**SPEC-MO-HO-004:** Hooks DEVEM ser tipados (TypeScript)

### Exemplos Comuns

**SPEC-MO-HO-005:** `useModuleName()` - hook principal do módulo

**SPEC-MO-HO-006:** `useModuleConfig()` - acesso à configuração

**SPEC-MO-HO-007:** `useModuleData()` - fetch de dados via JQEL

**SPEC-MO-HO-008:** Hooks PODEM usar TanStack Query internamente

### Disponibilidade

**SPEC-MO-HO-009:** Hooks exportados DEVEM estar disponíveis para outros módulos do portal

**SPEC-MO-HO-010:** Hooks NÃO DEVEM estar disponíveis em outros portais

---

## 8. Instâncias de Módulo

### Configuração

**SPEC-MO-IN-001:** Estrutura de configuração é definida pelo módulo

**SPEC-MO-IN-002:** Plataforma NÃO impõe estrutura específica

**SPEC-MO-IN-003:** Módulo DEVE documentar estrutura de configuração

**SPEC-MO-IN-004:** Configuração DEVE ser serializável como JSON

### Validação

**SPEC-MO-IN-005:** Módulo PODE fornecer schema de validação (ex: Zod)

**SPEC-MO-IN-006:** Validação DEVE acontecer ao criar/editar instância

**SPEC-MO-IN-007:** Erro de validação DEVE impedir criação/edição

**SPEC-MO-IN-008:** Mensagens de erro DEVEM ser claras

### Acesso à Configuração

**SPEC-MO-IN-009:** Configuração DEVE ser acessível via JQEL

**SPEC-MO-IN-010:** Módulo PODE fornecer hook `useInstanceConfig(instanceId)`

**SPEC-MO-IN-011:** Hook DEVE usar TanStack Query para cache

**SPEC-MO-IN-012:** Configuração DEVE ser tipada (TypeScript)

### Modo de Instância

**SPEC-MO-IN-013:** Módulo "multiple-instance" DEVE suportar múltiplas instâncias no mesmo portal (comportamento padrão)

**SPEC-MO-IN-014:** Módulo "single-instance" DEVE ter exatamente UMA instância por portal onde está ativo

**SPEC-MO-IN-015:** Módulo "single-instance" DEVE criar automaticamente instância `"default"` ao ser ativado

**SPEC-MO-IN-016:** Instância default de módulo "single-instance" DEVE ser criada ATIVA

**SPEC-MO-IN-017:** Instância default de módulo "single-instance" NÃO PODE ser removida

**SPEC-MO-IN-018:** Sistema DEVE prevenir criação de instâncias adicionais em módulos "single-instance"

### Múltiplas Instâncias

**SPEC-MO-IN-019:** Cada instância DEVE ter configuração independente

**SPEC-MO-IN-020:** Instâncias PODEM ter rotas diferentes

**SPEC-MO-IN-021:** Instâncias NÃO DEVEM interferir entre si

---

## 9. Ciclo de Vida do Módulo

### Carregamento

**SPEC-MO-LC-001:** Módulo é carregado quando portal que o ativa é aberto

**SPEC-MO-LC-002:** Carregamento usa dynamic import: `import('./modules/my-module')`

**SPEC-MO-LC-003:** Carregamento é assíncrono (lazy loading)

**SPEC-MO-LC-004:** Erro no carregamento DEVE ser tratado gracefully

### Inicialização

**SPEC-MO-LC-005:** Módulo PODE ter função de inicialização

**SPEC-MO-LC-006:** Inicialização PODE registrar providers, contexts, etc

**SPEC-MO-LC-007:** Inicialização DEVE ser rápida (não bloquear UI)

**SPEC-MO-LC-008:** Erro na inicialização DEVE ser logado

### Ativação em Runtime

**SPEC-MO-LC-009:** Módulo ativado em runtime DEVE ser baixado imediatamente

**SPEC-MO-LC-010:** Download DEVE acontecer em segundo plano

**SPEC-MO-LC-011:** Após carregamento, rotas DEVEM estar disponíveis

**SPEC-MO-LC-012:** Componentes DEVEM estar disponíveis

**SPEC-MO-LC-013:** Usuário NÃO DEVE precisar recarregar página

### Desativação em Runtime

**SPEC-MO-LC-014:** Módulo desativado NÃO DEVE ser removido da memória até refresh

**SPEC-MO-LC-015:** Rotas DEVEM deixar de funcionar

**SPEC-MO-LC-016:** Instâncias DEVEM ser desativadas

**SPEC-MO-LC-017:** Após refresh, módulo NÃO DEVE ser carregado

---

## 10. Módulos de Componentes

### Definição

**SPEC-MO-MC-001:** Módulos de Componentes fornecem bibliotecas especializadas

**SPEC-MO-MC-002:** `type` no manifesto DEVE ser `"components"`

**SPEC-MO-MC-003:** NÃO exportam rotas (geralmente)

**SPEC-MO-MC-004:** Exportam componentes, hooks e utilities

### Três Módulos Padrão

**SPEC-MO-MC-005:** DEVE existir módulo "app-components"

**SPEC-MO-MC-006:** DEVE existir módulo "media-components"

**SPEC-MO-MC-007:** DEVE existir módulo "export-components"

**SPEC-MO-MC-008:** Especificações em `02-SPEC-architecture.md`

### Re-exports

**SPEC-MO-MC-009:** Módulos de Componentes DEVEM re-exportar bibliotecas integradas

**SPEC-MO-MC-010:** Exemplo: `export { default as DataTable } from '@tanstack/react-table'`

**SPEC-MO-MC-011:** Configurações DEVEM ser encapsuladas (ex: tema aplicado)

**SPEC-MO-MC-012:** Versões DEVEM ser gerenciadas centralmente

---

## 11. Módulos de Funcionalidade

### Definição

**SPEC-MO-MF-001:** Módulos de Funcionalidade fornecem experiências completas

**SPEC-MO-MF-002:** `type` no manifesto DEVE ser `"functionality"`

**SPEC-MO-MF-003:** PODEM exportar rotas

**SPEC-MO-MF-004:** PODEM exportar componentes, hooks, utilities

### Exemplos

**SPEC-MO-MF-005:** Chat, Dashboard, Forms, Auth, Menu, Kanban, etc

**SPEC-MO-MF-006:** Cada um com responsabilidade clara e delimitada

### Dependências Comuns

**SPEC-MO-MF-007:** Módulos de Funcionalidade GERALMENTE dependem de Módulos de Componentes

**SPEC-MO-MF-008:** Exemplo: Chat depende de Media Components e Export Components

**SPEC-MO-MF-009:** Dependências DEVEM ser declaradas no manifesto

---

## 12. Integração com TanStack Query

### Uso Obrigatório

**SPEC-MO-TQ-001:** Acesso a dados DEVE usar TanStack Query

**SPEC-MO-TQ-002:** Módulos DEVEM encapsular JQEL via TanStack Query

**SPEC-MO-TQ-003:** Módulos NÃO DEVEM fazer fetch diretamente

### Queries

**SPEC-MO-TQ-004:** Módulos DEVEM fornecer hooks de query

**SPEC-MO-TQ-005:** Exemplo: `useInstanceConfig(instanceId)`, `useNotifications()`

**SPEC-MO-TQ-006:** Query keys DEVEM ser consistentes e documentadas

**SPEC-MO-TQ-007:** Exemplo: `['module', moduleId, 'instance', instanceId]`

### Mutations

**SPEC-MO-TQ-008:** Módulos DEVEM fornecer hooks de mutation

**SPEC-MO-TQ-009:** Exemplo: `useUpdateInstance()`, `useMarkAsRead()`

**SPEC-MO-TQ-010:** Mutations DEVEM invalidar queries apropriadas

**SPEC-MO-TQ-011:** Mutations PODEM usar optimistic updates

### Cache

**SPEC-MO-TQ-012:** Cache DEVE ser gerenciado pelo TanStack Query

**SPEC-MO-TQ-013:** TTL DEVE ser configurável (staleTime)

**SPEC-MO-TQ-014:** Invalidação DEVE ser explícita quando necessário

---

## 13. Integração com Sistema de Eventos

### Escuta de Eventos

**SPEC-MO-EV-001:** Módulos que usam eventos DEVEM escutar via plataforma (SSE)

**SPEC-MO-EV-002:** Módulos NÃO DEVEM implementar próprio sistema de eventos

**SPEC-MO-EV-003:** Ao receber evento, DEVEM invalidar queries TanStack Query

**SPEC-MO-EV-004:** Exemplo: evento `type=notification` invalida `['notifications']`

### Processamento

**SPEC-MO-EV-005:** Módulos NÃO DEVEM usar dados do evento diretamente

**SPEC-MO-EV-006:** Módulos DEVEM buscar dados via JQEL após invalidação

**SPEC-MO-EV-007:** TanStack Query cuida do refetch automaticamente

---

## 14. Testes de Módulo

### Requisitos

**SPEC-MO-TE-001:** Módulos DEVEM ter testes unitários

**SPEC-MO-TE-002:** Componentes DEVEM ter testes de renderização

**SPEC-MO-TE-003:** Hooks DEVEM ter testes

**SPEC-MO-TE-004:** Utilities DEVEM ter testes

### Ferramentas

**SPEC-MO-TE-005:** Usar Vitest para testes unitários

**SPEC-MO-TE-006:** Usar React Testing Library para componentes

**SPEC-MO-TE-007:** Usar @testing-library/react-hooks para hooks

### Cobertura

**SPEC-MO-TE-008:** Cobertura mínima recomendada: 80%

**SPEC-MO-TE-009:** Componentes críticos DEVEM ter 100% de cobertura

**SPEC-MO-TE-010:** Testes DEVEM ser executados em CI/CD

---

## 15. Documentação de Módulo

### README

**SPEC-MO-DO-001:** Cada módulo DEVE ter README.md

**SPEC-MO-DO-002:** README DEVE incluir: propósito, instalação, uso, API, exemplos

**SPEC-MO-DO-003:** README DEVE listar dependências

**SPEC-MO-DO-004:** README DEVE incluir screenshots/GIFs quando aplicável

### API Documentation

**SPEC-MO-DO-005:** Componentes DEVEM ser documentados (props, exemplos)

**SPEC-MO-DO-006:** Hooks DEVEM ser documentados (parâmetros, retorno, exemplos)

**SPEC-MO-DO-007:** Types DEVEM ter comentários JSDoc

**SPEC-MO-DO-008:** Rotas DEVEM ser documentadas (path, params, auth)

### Changelog

**SPEC-MO-DO-009:** Módulo DEVE ter CHANGELOG.md

**SPEC-MO-DO-010:** CHANGELOG DEVE seguir Keep a Changelog format

**SPEC-MO-DO-011:** CHANGELOG DEVE listar breaking changes claramente

---

## 16. Versionamento

### Semantic Versioning

**SPEC-MO-VE-001:** Módulos DEVEM usar Semantic Versioning (semver)

**SPEC-MO-VE-002:** Formato: `MAJOR.MINOR.PATCH`

**SPEC-MO-VE-003:** MAJOR: breaking changes

**SPEC-MO-VE-004:** MINOR: novas funcionalidades (backward compatible)

**SPEC-MO-VE-005:** PATCH: bug fixes

### Compatibilidade

**SPEC-MO-VE-006:** Breaking changes DEVEM incrementar MAJOR

**SPEC-MO-VE-007:** Breaking changes DEVEM ser documentadas

**SPEC-MO-VE-008:** Módulos dependentes DEVEM especificar versão mínima

**SPEC-MO-VE-009:** Plataforma PODE validar compatibilidade de versões

---

## 17. Performance

### Bundle Size

**SPEC-MO-PE-001:** Módulos DEVEM ser otimizados para tamanho

**SPEC-MO-PE-002:** Módulos DEVEM usar tree-shaking

**SPEC-MO-PE-003:** Módulos NÃO DEVEM incluir código não usado

**SPEC-MO-PE-004:** Módulos grandes PODEM ser divididos em sub-módulos

### Lazy Loading

**SPEC-MO-PE-005:** Componentes pesados DEVEM usar React.lazy()

**SPEC-MO-PE-006:** Rotas DEVEM usar lazy loading

**SPEC-MO-PE-007:** Imports DEVEM ser dinâmicos quando apropriado

### Renderização

**SPEC-MO-PE-008:** Componentes DEVEM ser otimizados (memoization quando necessário)

**SPEC-MO-PE-009:** Evitar re-renders desnecessários

**SPEC-MO-PE-010:** Usar React.memo, useMemo, useCallback apropriadamente

---

## 18. Segurança

### Validação de Entrada

**SPEC-MO-SE-001:** Módulos DEVEM validar toda entrada do usuário

**SPEC-MO-SE-002:** Usar Zod ou similar para validação

**SPEC-MO-SE-003:** Validação DEVE acontecer no frontend E backend

### XSS Prevention

**SPEC-MO-SE-004:** Módulos DEVEM sanitizar conteúdo HTML

**SPEC-MO-SE-005:** Usar bibliotecas confiáveis (DOMPurify)

**SPEC-MO-SE-006:** Evitar `dangerouslySetInnerHTML` quando possível

### Autenticação/Autorização

**SPEC-MO-SE-007:** Módulos DEVEM usar sistema de auth da plataforma

**SPEC-MO-SE-008:** Módulos NÃO DEVEM implementar auth próprio

**SPEC-MO-SE-009:** Rotas protegidas DEVEM validar auth via Canal de Autenticação

---

*Esta especificação define requisitos para módulos da plataforma. Guias de desenvolvimento fornecem exemplos práticos de implementação.*