# Chatify Module - Migration Documentation

## Overview

Este documento registra a migração do **NIC Chat** standalone (`examples/chat/`) para o módulo **Chatify** da plataforma (`src/frontend/src/modules/chatify/`).

O projeto original foi transformado em um módulo plugável seguindo as convenções da plataforma, mantendo todas as funcionalidades principais intactas.

## Migration Date

**Start:** 2025-11-11
**Status:** Em progresso

---

## Original Project Analysis

### Source: `examples/chat/` (NIC Chat Standalone)

**Características Principais:**
- Aplicação React 18 + TypeScript + Vite standalone
- Sistema de 3 tipos de agentes (built-in via .env, N8N-discovered, custom via UI)
- Múltiplos provedores de IA (NIC, OpenAI) com seleção de modelo
- Streaming SSE unificado (N8N + OpenAI compatible)
- Renderização avançada: Markdown (GFM) + Mermaid diagrams + Imagens inline
- Gamificação: Jornada de 14 etapas em 4 fases (descoberta, exploração, domínio, maestria)
- Sistema de storage abstrato com padrão driver/facade
- PWA completo (Service Worker, manifest, ícones light/dark)
- Sidebar responsiva (diferente desktop/mobile)
- FAB Stack (Material Design) com widget de chat flutuante
- Tema light/dark com auto-detecção de sistema

**Estatísticas:**
- **Frontend:** 63 arquivos TypeScript/TSX
- **Backend:** 6 arquivos TypeScript (Express proxy)
- **Conteúdo:** 14 arquivos Markdown (jornada)
- **Contextos:** 5 (Theme, Chat, JourneyProgress, NextStepWidget, Sidebar)
- **Hooks Customizados:** 8
- **Componentes:** 30+
- **Bundle Size:** ~1.1MB minificado (~316KB gzip) - inclui Mermaid library (442KB)

---

## Architecture Changes

### 1. Context Providers → Platform Hooks

**Original (Standalone):**
- `ThemeContext` - Gerenciamento de tema light/dark
- `ChatContext` - Estado de mensagens, conversas, agente selecionado
- `JourneyProgressContext` - Progresso da jornada e configurações
- `NextStepWidgetContext` - Visibilidade do widget de próxima etapa
- `SidebarContext` - Estado da sidebar (expanded/collapsed, mobile)

**Migration (Platform Module):**
- Contexts NÃO serão criados (anti-pattern na plataforma)
- Substituídos por **hooks locais** que usam state management da plataforma
- Hooks se comunicam via:
  - `useJQEL` para persistência de dados
  - `localStorage` para preferências de UI (tema, sidebar, journey)
  - Event listeners para sincronização entre abas

**Changes:**
- `ThemeContext` → `useTheme` hook (usa `localStorage` + `matchMedia`)
- `ChatContext` → `useChatify` hook (usa `useJQELQuery` + `useJQELMutation`)
- `JourneyProgressContext` → `useJourneyProgress` hook (usa storage service)
- `NextStepWidgetContext` → `useNextStepWidget` hook (usa `localStorage`)
- `SidebarContext` → `useSidebar` hook (usa `localStorage` + resize listener)

### 2. Data Access - JQEL Integration

**Original:**
- `localStorage` para mensagens e conversas
- Sem backend real (prototype)
- Backend Express apenas para proxy de APIs externas (NIC, OpenAI)

**Migration:**
- TODAS as mensagens e conversas vão para JQEL (schema: `'chatify'`)
- `localStorage` APENAS para:
  - Preferências de UI (tema, sidebar expanded, journey settings)
  - Cache temporário (journey progress, widget dismissed)
- Backend Express mantido para proxy de APIs externas (NIC, OpenAI)
  - Roteado via `/api/chatify/*` (separado do backend principal)

**JQEL Queries Example:**
```typescript
// Buscar mensagens
useJQELQuery({
  schema: 'chatify',
  select: 'message',
  where: { conversationId: { $eq: conversationId } },
  options: { orderBy: [{ field: 'timestamp', direction: 'asc' }], limit: 100 }
})

// Salvar mensagem
useJQELMutation({
  schema: 'chatify',
  mutate: 'message',
  action: 'insert'
})
```

### 3. Storage System

**Original:**
- Sistema abstrato com padrão driver/facade
- `LocalStorageDriver` implementado
- Debounce automático (300ms)
- Sincronização entre abas via storage events

**Migration:**
- Sistema de storage MANTIDO (muito bem projetado)
- Movido para `services/storage/`
- Usado APENAS para preferências de UI e cache temporário
- Dados persistentes (mensagens) vão para JQEL

### 4. Backend Express (Proxy)

**Original:**
- Porta 7007 (configurável)
- Rotas:
  - `/api/ai/:provider/models` - Lista modelos
  - `/api/ai/:provider/chat/completions` - Chat SSE
  - `/api/agents/n8n` - Descoberta de agentes N8N
- Injeta API keys do .env (server-side)

**Migration:**
- Backend mantido como microserviço separado
- Prefixo: `/api/chatify/*` (namespace do módulo)
- Rotas renomeadas:
  - `/api/chatify/ai/:provider/models`
  - `/api/chatify/ai/:provider/chat/completions`
  - `/api/chatify/agents/n8n`
- Porta: Configurável via `CHATIFY_BACKEND_PORT` (default: 7007)
- API Keys: `NIC_API_KEY`, `OPENAI_API_KEY` mantidas no .env

**Nota:** Backend não é parte do módulo frontend, mas documentado aqui por dependência.

### 5. Routing

**Original:**
```typescript
// React Router standalone
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/chat" element={<Chat />} />
    <Route path="/admin" element={<Admin />} />
    <Route path="/guide" element={<Guide />} />
  </Routes>
</BrowserRouter>
```

**Migration:**
```typescript
// Platform module routes (lazy loaded)
export const chatifyRoutes: RouteDefinition[] = [
  {
    path: '/',
    component: lazy(() => import('./pages/Home').then(m => ({ default: m.Home })))
  },
  {
    path: '/chat',
    component: lazy(() => import('./pages/ChatInterface').then(m => ({ default: m.ChatInterface })))
  },
  {
    path: '/admin',
    component: lazy(() => import('./pages/Admin').then(m => ({ default: m.Admin })))
  },
  {
    path: '/guide',
    component: lazy(() => import('./pages/Guide').then(m => ({ default: m.Guide })))
  }
]
```

**Portal Prefixes:**
- Main portal: `/` → routes como `/chat`, `/admin`
- Other portal: `/:portalId` → routes como `/setup/chat`, `/setup/admin`

### 6. Environment Variables

**Original (Build-time + Server-side):**

**Frontend (Vite - VITE_ prefix):**
```bash
# Built-in agents (parsed at build-time)
VITE_AGENT_NIC_ENABLED=true
VITE_AGENT_NIC_TITLE=NIC
VITE_AGENT_NIC_SYSTEM_PROMPT=...
VITE_AGENT_NIC_ICON=🤖
VITE_AGENT_NIC_COLOR=#3D95DF
VITE_AGENT_NIC_TAGS=geral,assistente
```

**Backend (Node.js):**
```bash
PORT=7007
N8N_BASE_URL=https://n8n.codrstudio.dev/webhook/nic/v1
NIC_API_KEY=...
OPENAI_API_KEY=...
```

**Migration:**
- **Frontend:** Variáveis `VITE_AGENT_*` MANTIDAS (parsing de agentes built-in)
- **Backend:** Variáveis MANTIDAS no backend separado
- **Nota:** Configuração de instância via `ChatifyInstanceConfig` (manifest defaults)

---

## Feature Preservation Checklist

### ✅ Core Features (Must Preserve)

- [x] **Sistema de 3 tipos de agentes**
  - Built-in (via .env)
  - N8N-discovered (API + cache 5min)
  - Custom (criados via UI + localStorage)

- [x] **Sistema de múltiplos provedores**
  - Configuração via JSON (`public/config/ai-providers.json`)
  - Suporte a NIC, OpenAI (extensível)
  - Seleção de modelo por provedor

- [x] **Streaming SSE unificado**
  - Parser N8N (JSON direto)
  - Parser OpenAI (`data:` prefix)
  - AbortController para cancelamento

- [x] **Renderização avançada de Markdown**
  - react-markdown + remark-gfm + rehype-raw
  - Diagramas Mermaid (hook `useMermaid`)
  - Imagens inline (URLs, base64, data URIs)
  - Code blocks com syntax highlighting

- [x] **Sistema de jornada (14 etapas)**
  - 4 fases: descoberta (25%), exploração (25%), domínio (25%), maestria (25%)
  - Tracking automático via pathname + hash
  - Barra de progresso (header)
  - Widget de próxima etapa (bottom-left)
  - Índice de jornada (modal)
  - Badge de conquista 100%
  - Efeito de confetes ao completar

- [x] **Sistema de storage abstrato**
  - Padrão driver/facade
  - Debounce automático (300ms)
  - Sincronização entre abas

- [x] **FAB Stack (Material Design)**
  - FAB principal (contexto-sensível)
  - Speed Dial (3 FABs secundários)
  - Expansão no hover
  - Badge de notificações

- [x] **Widget de chat flutuante**
  - Header com logo + minimize + novo chat
  - ChatHistory integrado
  - ChatInput integrado
  - Minimizado mostra badge de notificações

- [x] **Sidebar responsiva**
  - Desktop: Inicia expandido, persistência localStorage
  - Mobile: Inicia fechado, overlay, sem persistência
  - Auto-close ao navegar (mobile)
  - Listener de resize para detecção desktop/mobile

- [x] **Tema light/dark**
  - Auto-detecção de sistema (`prefers-color-scheme`)
  - Toggle manual
  - Persistência localStorage

### 🔄 Modified Features

- [ ] **Data Persistence** (localStorage → JQEL)
  - Mensagens: localStorage → JQEL (schema: `'chatify'`)
  - Conversas: localStorage → JQEL (schema: `'chatify'`)
  - Preferências UI: localStorage MANTIDO

### ➕ New Features (Platform Integration)

- [ ] **Module Auto-registration**
  - Export `chatifyModule: ModuleExports`
  - Auto-register via `moduleRegistry.register(chatifyModule)`

- [ ] **Lazy Loading**
  - Todas as páginas via `React.lazy()`
  - Code splitting automático

- [ ] **Instance Configuration**
  - Configuração via `ChatifyInstanceConfig` (manifest)
  - Props injetadas pelo portal loader

---

## File Structure Mapping

### Original → Migration

```
examples/chat/                              → src/frontend/src/modules/chatify/

├── src/
│   ├── types/                              → types.ts (unificado)
│   │   ├── chat.ts
│   │   ├── agent.ts
│   │   ├── provider.ts
│   │   ├── journey.ts
│   │   └── streaming.ts
│   │
│   ├── contexts/                           → hooks/ (convertidos)
│   │   ├── ThemeContext.tsx               → hooks/useTheme.ts
│   │   ├── ChatContext.tsx                → hooks/useChatify.ts
│   │   ├── JourneyProgressContext.tsx     → hooks/useJourneyProgress.ts
│   │   ├── NextStepWidgetContext.tsx      → hooks/useNextStepWidget.ts
│   │   └── SidebarContext.tsx             → hooks/useSidebar.ts
│   │
│   ├── services/                           → services/ (mantidos)
│   │   ├── chatService.ts                 → services/chatService.ts
│   │   ├── aiChatService.ts               → services/aiChatService.ts
│   │   ├── agentService.ts                → services/agentService.ts
│   │   ├── agentParser.ts                 → services/agentParser.ts
│   │   ├── providerService.ts             → services/providerService.ts
│   │   ├── n8nChatService.ts              → services/n8nChatService.ts
│   │   └── storage/                       → services/storage/ (mantido)
│   │       ├── index.ts
│   │       ├── storageService.ts
│   │       ├── StorageDriver.ts
│   │       ├── LocalStorageDriver.ts
│   │       └── README.md
│   │
│   ├── components/                         → components/ (mantidos)
│   │   ├── chat/                          → components/chat/
│   │   │   ├── ChatHistory.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── ChatWidgetPanel.tsx
│   │   │   ├── SuggestedQuestions.tsx
│   │   │   ├── AgentIcon.tsx
│   │   │   └── ChatBadge.tsx
│   │   │
│   │   ├── agent/                         → components/agent/
│   │   │   ├── AgentManagement.tsx
│   │   │   ├── CustomAgentEditor.tsx
│   │   │   ├── IconPicker.tsx
│   │   │   └── AgentAttachmentUploader.tsx
│   │   │
│   │   ├── gamification/                  → components/gamification/
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── NextStepWidget.tsx
│   │   │   ├── JourneyIndexModal.tsx
│   │   │   ├── CompletionBadge.tsx
│   │   │   └── ConfettiEffect.tsx
│   │   │
│   │   ├── layout/                        → components/layout/
│   │   │   ├── Layout.tsx                 → (adaptado para portal)
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   └── BottomControls.tsx
│   │   │
│   │   ├── markdown/                      → components/markdown/
│   │   │   └── MarkdownContent.tsx
│   │   │
│   │   ├── unified/                       → components/unified/
│   │   │   └── AgentModelSelector.tsx
│   │   │
│   │   └── FloatingActionStack.tsx        → components/FloatingActionStack.tsx
│   │
│   ├── hooks/                              → hooks/ (mantidos + novos)
│   │   ├── useChat.ts                     → hooks/useChatify.ts (renomeado + adaptado)
│   │   ├── useChatWidget.ts               → hooks/useChatWidget.ts
│   │   ├── useJourneyProgress.ts          → hooks/useJourneyProgress.ts
│   │   ├── useJourneyContent.ts           → hooks/useJourneyContent.ts
│   │   ├── useAgents.ts                   → hooks/useAgents.ts
│   │   ├── useModels.ts                   → hooks/useModels.ts
│   │   ├── useMermaid.ts                  → hooks/useMermaid.ts
│   │   └── useAutoScroll.ts               → hooks/useAutoScroll.ts
│   │
│   ├── pages/                              → pages/
│   │   ├── Home.tsx                       → pages/Home.tsx (landing page)
│   │   ├── Chat.tsx                       → pages/ChatInterface.tsx (renomeado)
│   │   ├── Admin.tsx                      → pages/Admin.tsx
│   │   └── Guide.tsx                      → pages/Guide.tsx
│   │
│   ├── utils/                              → utils/
│   │   ├── journeyMap.ts                  → utils/journeyMap.ts
│   │   └── colorUtils.ts                  → utils/colorUtils.ts
│   │
│   ├── data/                               → data/
│   │   ├── emojiCategories.ts             → data/emojiCategories.ts
│   │   └── lucideIcons.ts                 → data/lucideIcons.ts
│   │
│   └── app/                                → (removido - integração com portal)
│       └── App.tsx
│
├── content/                                → assets/content/ (movido)
│   └── journey/*.md                       → assets/content/journey/*.md
│
├── assets/                                 → assets/
│   ├── nic-logo-dark.svg                  → assets/nic-logo-dark.svg
│   └── nic-logo-light.svg                 → assets/nic-logo-light.svg
│
├── public/
│   ├── config/
│   │   └── ai-providers.json              → public/config/chatify-providers.json
│   │
│   └── icons/                              → (mantidos no public root)
│       ├── light/*.png
│       └── dark/*.png
│
├── server/                                 → (separado - não faz parte do módulo frontend)
│   ├── index.ts
│   ├── routes/
│   │   ├── ai.ts
│   │   └── agents.ts
│   └── services/
│       ├── aiProxyService.ts
│       ├── endpointResolver.ts
│       └── n8nAgentService.ts
│
└── (Novos arquivos do módulo)
    ├── index.ts                            → index.ts (exports + auto-register)
    ├── manifest.ts                         → manifest.ts
    └── routes.ts                           → routes.ts
```

---

## Dependencies

### Original (package.json)

**Production:**
- react@18.2.0
- react-dom@18.2.0
- react-router-dom@6.21.0
- tailwindcss@3.4.0
- lucide-react@0.294.0
- react-markdown@10.1.0
- remark-gfm@4.0.1
- rehype-raw@7.0.0
- mermaid@11.12.0
- gray-matter@4.0.3
- express@5.1.0
- cors@2.8.5
- dotenv@17.2.3

**Development:**
- vite@5.0.8
- @vitejs/plugin-react@4.2.1
- vite-plugin-pwa@1.1.0
- typescript@5.3.3
- @types/react@18.2.45
- @types/react-dom@18.2.18
- @types/express@5.0.3

### Migration

**Keep (já na plataforma):**
- react (19+ na plataforma)
- react-dom (19+ na plataforma)
- react-router-dom (6.x já na plataforma)
- tailwindcss (já configurado)
- lucide-react (já na plataforma)
- vite (já configurado)
- typescript (já configurado)

**Add to Platform:**
- react-markdown@10.1.0
- remark-gfm@4.0.1
- rehype-raw@7.0.0
- mermaid@11.12.0
- gray-matter@4.0.3
- date-fns@3.x (para formatação de datas)

**Separate (backend):**
- express@5.1.0
- cors@2.8.5
- dotenv@17.2.3

---

## Implementation Roadmap

### Phase 1: Foundation ✅ (Current)

- [x] Criar estrutura de diretórios
- [x] Migrar tipos TypeScript (unificado em `types.ts`)
- [x] Criar manifest com schema de configuração completo
- [ ] Criar MIGRATION.md (este documento)

### Phase 2: Core Services

- [ ] Migrar storage system (`services/storage/`)
- [ ] Migrar services básicos:
  - [ ] `chatService.ts`
  - [ ] `agentService.ts`
  - [ ] `agentParser.ts`
  - [ ] `providerService.ts`
- [ ] Migrar services de integração:
  - [ ] `aiChatService.ts` (SSE streaming)
  - [ ] `n8nChatService.ts` (N8N integration)

### Phase 3: Hooks

- [ ] Converter contexts para hooks:
  - [ ] `useTheme` (Theme context)
  - [ ] `useChatify` (Chat context + JQEL integration)
  - [ ] `useJourneyProgress` (Journey context)
  - [ ] `useNextStepWidget` (Widget context)
  - [ ] `useSidebar` (Sidebar context)
- [ ] Migrar hooks utilitários:
  - [ ] `useChatWidget`
  - [ ] `useJourneyContent`
  - [ ] `useAgents`
  - [ ] `useModels`
  - [ ] `useMermaid`
  - [ ] `useAutoScroll`

### Phase 4: Components - Chat

- [ ] `components/chat/`:
  - [ ] `ChatHistory.tsx`
  - [ ] `ChatInput.tsx`
  - [ ] `ChatMessage.tsx` (com Markdown + Mermaid)
  - [ ] `ChatWidgetPanel.tsx`
  - [ ] `SuggestedQuestions.tsx`
  - [ ] `AgentIcon.tsx`
  - [ ] `ChatBadge.tsx`

### Phase 5: Components - Agents

- [ ] `components/agent/`:
  - [ ] `AgentManagement.tsx`
  - [ ] `CustomAgentEditor.tsx`
  - [ ] `IconPicker.tsx`
  - [ ] `AgentAttachmentUploader.tsx`

### Phase 6: Components - Gamification

- [ ] `components/gamification/`:
  - [ ] `ProgressBar.tsx`
  - [ ] `NextStepWidget.tsx`
  - [ ] `JourneyIndexModal.tsx`
  - [ ] `CompletionBadge.tsx`
  - [ ] `ConfettiEffect.tsx`

### Phase 7: Components - Layout & Other

- [ ] `components/layout/`:
  - [ ] `Layout.tsx` (adaptar para portal)
  - [ ] `Sidebar.tsx`
  - [ ] `Navigation.tsx`
  - [ ] `ThemeToggle.tsx`
  - [ ] `BottomControls.tsx`
- [ ] `components/markdown/`:
  - [ ] `MarkdownContent.tsx`
- [ ] `components/unified/`:
  - [ ] `AgentModelSelector.tsx`
- [ ] `components/`:
  - [ ] `FloatingActionStack.tsx`

### Phase 8: Pages

- [ ] `pages/Home.tsx` (landing page)
- [ ] `pages/ChatInterface.tsx` (interface principal)
- [ ] `pages/Admin.tsx` (configurações)
- [ ] `pages/Guide.tsx` (guia da jornada)

### Phase 9: Routes & Registration

- [ ] Criar `routes.ts` com lazy loading
- [ ] Criar `index.ts` com exports e auto-registro
- [ ] Criar barrel exports em `components/index.ts`

### Phase 10: Assets & Content

- [ ] Copiar logos para `assets/`
- [ ] Copiar conteúdo markdown da jornada para `assets/content/journey/`
- [ ] Copiar configuração de provedores para `public/config/chatify-providers.json`
- [ ] Verificar ícones PWA (se necessário)

### Phase 11: Integration Testing

- [ ] Testar registro do módulo
- [ ] Testar lazy loading de rotas
- [ ] Testar integração com JQEL
- [ ] Testar streaming SSE
- [ ] Testar sistema de agentes
- [ ] Testar sistema de jornada
- [ ] Testar tema light/dark
- [ ] Testar responsividade (mobile/desktop)
- [ ] Testar FAB Stack e widget
- [ ] Testar persistência de dados

### Phase 12: Backend Integration

- [ ] Configurar backend Express como microserviço
- [ ] Configurar proxy routes `/api/chatify/*`
- [ ] Testar integração com N8N
- [ ] Testar integração com OpenAI
- [ ] Testar descoberta de agentes N8N
- [ ] Testar streaming SSE via backend

### Phase 13: Documentation & Polish

- [ ] Atualizar MIGRATION.md com mudanças finais
- [ ] Criar README.md do módulo
- [ ] Documentar APIs e hooks
- [ ] Revisar SPEC compliance
- [ ] Code review completo

---

## Breaking Changes

### For End Users

- **URLs:** As rotas agora incluem prefixo do portal
  - Antes: `/chat`
  - Depois (main portal): `/chat` (sem mudança)
  - Depois (outro portal): `/setup/chat`

- **Data Persistence:** Histórico de conversas migrado de localStorage para JQEL
  - Histórico antigo (se existir) deve ser migrado manualmente
  - Preferências de UI mantidas em localStorage

### For Developers

- **Contexts removidos:** Usar hooks em vez de contexts
  - `useTheme()` em vez de `useContext(ThemeContext)`
  - `useChatify()` em vez de `useContext(ChatContext)`
  - etc.

- **Data access:** SEMPRE usar JQEL para mensagens/conversas
  - Não usar `localStorage` diretamente para dados persistentes
  - `localStorage` apenas para preferências de UI

- **Module import:** Auto-registro no import
  ```typescript
  // Importar módulo registra automaticamente
  import { chatifyModule } from '@/modules/chatify'
  ```

---

## Performance Considerations

### Bundle Size

**Original:** ~1.1MB minified (~316KB gzip)
- Mermaid library: 442KB (maior componente)
- React Markdown + plugins: ~150KB
- React + Router: ~200KB
- Outros: ~300KB

**Migration Target:** < 1.5MB minified (< 400KB gzip)
- Lazy loading de páginas → code splitting automático
- Mermaid carregado apenas quando necessário (hook `useMermaid`)
- Markdown plugins carregados on-demand

### Optimizations

- [x] Lazy loading de todas as páginas
- [ ] Mermaid library com dynamic import
- [ ] Storage service com debounce (300ms) - já implementado
- [ ] TanStack Query cache strategies
- [ ] Service Worker cache (PWA)

---

## Security Considerations

### API Keys

**Backend Proxy:**
- API keys NUNCA expostas no frontend
- Injetadas pelo backend no header `Authorization`
- Armazenadas em `.env` do backend (server-side only)

### CORS

**Backend Express:**
- CORS habilitado apenas para domínios permitidos
- Headers de segurança via Helmet (se ainda não configurado)

### XSS Prevention

**Markdown Rendering:**
- `rehype-raw` permite HTML → potencial XSS
- Mensagens de usuários DEVEM ser sanitizadas
- Mensagens de agentes (assistant) são confiáveis (vem do backend)

**TODO:** Adicionar sanitização de HTML nas mensagens de usuários antes de renderizar.

---

## Testing Strategy

### Unit Tests

- [ ] Hooks: `useChatify`, `useJourneyProgress`, `useAgents`, etc.
- [ ] Services: `agentParser`, `providerService`, `storageService`
- [ ] Utils: `journeyMap`, `colorUtils`

### Integration Tests

- [ ] JQEL integration (queries + mutations)
- [ ] SSE streaming (N8N + OpenAI)
- [ ] Storage sync entre abas
- [ ] Journey tracking automático

### E2E Tests (Playwright)

- [ ] Fluxo completo de chat
- [ ] Criação de agente custom
- [ ] Sistema de jornada (14 etapas)
- [ ] Widget flutuante
- [ ] Responsividade (mobile/desktop)
- [ ] Tema light/dark

---

## Known Issues & TODOs

### Issues

1. **Mermaid Bundle Size:** 442KB é grande
   - **Solução:** Dynamic import com lazy loading
   - **Status:** TODO

2. **XSS em Markdown:** `rehype-raw` permite HTML
   - **Solução:** Sanitizar mensagens de usuários
   - **Status:** TODO

3. **N8N Cache:** Cache de 5 min pode estar desatualizado
   - **Solução:** Botão de refresh manual (já implementado)
   - **Status:** OK

4. **localStorage Sync:** Storage events não funcionam na mesma aba
   - **Solução:** Usar BroadcastChannel ou MessageChannel
   - **Status:** TODO (baixa prioridade)

### TODOs

- [ ] Migrar histórico antigo de localStorage para JQEL (script de migração)
- [ ] Adicionar testes unitários para todos os hooks
- [ ] Adicionar testes E2E para jornada completa
- [ ] Documentar APIs dos hooks no README
- [ ] Criar guia de configuração de agentes built-in via .env
- [ ] Otimizar bundle size (Mermaid dynamic import)
- [ ] Adicionar sanitização de HTML em mensagens de usuários
- [ ] Configurar Service Worker para cache offline
- [ ] Adicionar suporte a mais provedores de IA (Anthropic, Google)
- [ ] Implementar busca no histórico (feature já no config, falta implementar UI)

---

## Appendix

### A. Dependency Chart

```
chatifyModule (exports)
  ├── manifest.ts
  ├── routes.ts
  ├── types.ts
  ├── hooks/
  │   ├── useChatify.ts → useJQELQuery, useJQELMutation
  │   ├── useJourneyProgress.ts → storageService
  │   ├── useTheme.ts → localStorage
  │   └── ...
  ├── services/
  │   ├── chatService.ts
  │   ├── agentService.ts → agentParser, localStorage
  │   ├── providerService.ts → fetch JSON config
  │   ├── aiChatService.ts → SSE, backend proxy
  │   └── storage/ → localStorage, storage events
  ├── components/
  │   ├── chat/ → hooks/useChatify, services/aiChatService
  │   ├── agent/ → hooks/useAgents, services/agentService
  │   ├── gamification/ → hooks/useJourneyProgress
  │   └── layout/ → hooks/useSidebar, hooks/useTheme
  └── pages/
      ├── Home.tsx
      ├── ChatInterface.tsx → components/chat, components/layout
      ├── Admin.tsx → components/agent, components/gamification
      └── Guide.tsx → hooks/useJourneyContent
```

### B. Storage Keys

**localStorage:**
- `chatify-theme` - Tema (light/dark/system)
- `chatify-sidebar-expanded` - Sidebar expandida (desktop only)
- `chatify-journey-progress` - Progresso da jornada (via storageService)
- `chatify-next-step-widget-visible` - Visibilidade do widget (via storageService)
- `chatify-agent-preferences` - Preferências de agentes (via storageService)
- `chatify-custom-agents` - Agentes custom (via storageService)
- `chatify-last-read` - Timestamp da última leitura (insights)

**JQEL (schema: 'chatify'):**
- `message` - Mensagens do chat
- `conversation` - Conversas

### C. Backend Routes

**Proxy:**
- `GET /api/chatify/ai/:provider/models` - Lista modelos do provedor
- `POST /api/chatify/ai/:provider/chat/completions` - Chat completion (SSE)

**Agents:**
- `GET /api/chatify/agents/n8n` - Lista agentes N8N (cache 5min)
- `GET /api/chatify/agents/n8n/refresh` - Força atualização do cache
- `GET /api/chatify/agents/n8n/cache` - Info do cache

**Health:**
- `GET /api/chatify/health` - Health check

---

## Changelog

### 2025-11-11

- **CREATED:** Initial migration documentation
- **COMPLETED:** Structure planning
- **COMPLETED:** Type system migration (`types.ts`)
- **COMPLETED:** Manifest creation (`manifest.ts`)
- **IN PROGRESS:** Services migration

---

## References

- Original Project: `examples/chat/`
- Platform Docs: `CLAUDE.md`, `spec/SPEC-*.md`
- Module System: `src/frontend/src/core/modules/`
- JQEL Spec: `spec/SPEC-data-access.md`, `spec/SPEC-jqel-syntax.md`
- Chat Module: `src/frontend/src/modules/chat/` (reference implementation)

---

**Documento vivo - atualizado conforme progresso da migração.**
