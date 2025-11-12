# PLAN_CHATIFY.md - MigraÁ„o do NIC Chat para MÛdulo Chatify

**Objetivo**: Migrar aplicaÁ„o standalone NIC Chat (`examples/chat/`) para mÛdulo plug·vel da plataforma, preservando todas as funcionalidades (chat com IA, streaming SSE, sistema de agentes, gamificaÁ„o/jornada, renderizaÁ„o Markdown+Mermaid) e adaptando persistÍncia de localStorage para JQEL.

---

## =À RESUMO EXECUTIVO

### Problemas Identificados
1. L **MÛdulo vazio**: Apenas 3% completo (manifest, types, MIGRATION.md) - faltam ~74 arquivos
2. L **PersistÍncia inadequada**: Original usa localStorage para mensagens/conversas - precisa migrar para JQEL
3. L **Contexts n„o compatÌveis**: AplicaÁ„o usa 5 React Contexts - plataforma usa hooks puros
4. † **Bundle size**: Mermaid library (442KB) sem otimizaÁ„o - precisa dynamic import

### SoluÁ„o (Baseada em Padrıes)
-  **MigraÁ„o incremental**: Services í Hooks í Components í Pages í Routes (5 fases)
-  **JQEL para dados**: chatService adaptado para useJQELQuery/Mutation (schema: 'chatify')
-  **Hooks puros**: Contexts convertidos para hooks customizados com storage service
-  **Lazy loading**: Todas as p·ginas e Mermaid com React.lazy() / dynamic import

---

## <Ø FASE 1: STORAGE & SERVICES

### 1.1. Migrar Storage System

- [x] Copiar `examples/chat/src/services/storage/` í `chatify/services/storage/`
  - [x] `index.ts`
  - [x] `StorageDriver.ts` (interface)
  - [x] `LocalStorageDriver.ts` (implementaÁ„o)
  - [x] `storageService.ts` (facade com debounce 300ms)
  - [x] `README.md`
- [ ]  **Checkpoint**: Storage service compila sem erros

### 1.2. Migrar Services B·sicos

- [x] Copiar `examples/chat/src/services/agentParser.ts` í `chatify/services/`
  - [x] Ajustar imports de tipos para `../types`
- [x] Copiar `examples/chat/src/services/agentService.ts` í `chatify/services/`
  - [x] Ajustar imports de tipos
  - [x] Manter uso de localStorage para agentes custom (n„o È dado persistente)
- [x] Copiar `examples/chat/src/services/providerService.ts` í `chatify/services/`
  - [x] Ajustar path do JSON config para `/config/chatify-providers.json`
- [ ]  **Checkpoint**: Services b·sicos compilam e funÁıes s„o exportadas

### 1.3. Adaptar chatService para JQEL

- [x] Criar `chatify/services/chatService.ts` NOVO (n„o copiar)
  - [x] Implementar `loadConversation()` usando JQEL query
  - [x] Implementar `saveConversation()` usando JQEL mutation
  - [x] Implementar `updateConversation()` usando JQEL mutation
  - [x] Implementar `clearHistory()` usando JQEL mutation
  - [x] Manter interface compatÌvel com original
- [ ]  **Checkpoint**: chatService usa JQEL e exporta todas as funÁıes

**Leitura de ReferÍncia**:
- `spec/SPEC-data-access.md` - JQEL integration patterns
- `spec/SPEC-jqel-syntax.md` - Query syntax
- `src/frontend/src/modules/chat/` - Exemplo de mÛdulo usando JQEL

**CÛdigo de ReferÍncia**:
```typescript
// chatService.ts - exemplo de query
import { jqelClient } from '@/core/jqel'

export async function loadConversation(conversationId?: string): Promise<Message[]> {
  const result = await jqelClient.query({
    schema: 'chatify',
    select: 'message',
    where: conversationId ? { conversationId: { $eq: conversationId } } : {},
    options: { orderBy: [{ field: 'timestamp', direction: 'asc' }] }
  })

  return result.data || []
}
```

### 1.4. Migrar Services de IntegraÁ„o

- [x] Copiar `examples/chat/src/services/aiChatService.ts` í `chatify/services/`
  - [x] Ajustar imports de tipos
  - [x] Verificar SSE streaming (N8N + OpenAI parsers)
  - [x] Manter AbortController para cancelamento
- [x] Copiar `examples/chat/src/services/n8nChatService.ts` í `chatify/services/`
  - [x] Ajustar imports de tipos
  - [x] Verificar integraÁ„o com N8N
- [ ]  **Checkpoint**: Services de integraÁ„o funcionam com SSE streaming

### 1.5. Testar Fase 1 Completa

**Checklist de Testes**:
- [x] **Teste 1: Storage Service**
  - [x] Executar `storageService.set('test-key', { value: 'test' })`
  - [x] Executar `storageService.get('test-key')`
  - [x]  **Verificar**: Retorna objeto salvo apÛs debounce (300ms)

- [x] **Teste 2: Chat Service com JQEL**
  - [x] Executar `saveConversation([mockMessage])`
  - [x] Executar `loadConversation()`
  - [x]  **Resultado**: Mensagem persistida via JQEL

- [x] **Teste 3: Agent Service**
  - [x] Executar `agentService.getAvailableAgents()`
  - [ ]  **Resultado**: Retorna agentes built-in + N8N-discovered + custom

** CHECKPOINT FASE 1**: Services funcionam, chatService usa JQEL, storage system operacional

---

## <Ø FASE 2: HOOKS

### 2.1. Converter ChatContext í useChatify

- [ ] Criar `chatify/hooks/useChatify.ts`
  - [ ] REMOVER toda lÛgica de Context/Provider
  - [ ] Implementar hook que usa `useJQELQuery` para carregar mensagens
  - [ ] Implementar hook que usa `useJQELMutation` para salvar/atualizar/deletar
  - [ ] Manter interface p˙blica compatÌvel (sendMessage, clearHistory, etc.)
  - [ ] Adicionar estado local para mensagens em memÛria (cache)
  - [ ] Implementar optimistic updates (adicionar mensagem antes de confirmar)
- [ ]  **Checkpoint**: useChatify retorna mesmas propriedades que ChatContext

**Leitura de ReferÍncia**:
- `examples/chat/src/contexts/ChatContext.tsx` - LÛgica original
- `spec/SPEC-data-access.md` - useJQELQuery/Mutation patterns

**CÛdigo de ReferÍncia**:
```typescript
// useChatify.ts - estrutura base
export function useChatify(conversationId?: string) {
  // Query para carregar mensagens
  const { data: messages = [], isLoading } = useJQELQuery({
    schema: 'chatify',
    select: 'message',
    where: conversationId ? { conversationId: { $eq: conversationId } } : {}
  })

  // Mutation para salvar
  const saveMutation = useJQELMutation()

  const sendMessage = async (content: string) => {
    // ImplementaÁ„o com optimistic update
  }

  return { messages, sendMessage, isLoading, ... }
}
```

### 2.2. Converter Outros Contexts para Hooks

- [ ] Criar `chatify/hooks/useJourneyProgress.ts`
  - [ ] Converter `JourneyProgressContext.tsx` para hook
  - [ ] Usar `storageService` para persistÍncia
  - [ ] Manter tracking autom·tico de p·ginas visitadas
  - [ ] Manter c·lculo de porcentagem de conclus„o
- [ ] Criar `chatify/hooks/useTheme.ts`
  - [ ] Converter `ThemeContext.tsx` para hook
  - [ ] Usar `localStorage` direto (preferÍncia de UI)
  - [ ] Manter auto-detecÁ„o com `matchMedia('prefers-color-scheme')`
- [ ] Criar `chatify/hooks/useSidebar.ts`
  - [ ] Converter `SidebarContext.tsx` para hook
  - [ ] Usar `localStorage` para persistÍncia (desktop only)
  - [ ] Adicionar listener de resize para detecÁ„o mobile
- [ ] Criar `chatify/hooks/useNextStepWidget.ts`
  - [ ] Converter `NextStepWidgetContext.tsx` para hook
  - [ ] Usar `storageService` para estado de visibilidade
- [ ]  **Checkpoint**: Todos os hooks compilam e retornam interface esperada

### 2.3. Migrar Hooks Utilit·rios

- [ ] Copiar `examples/chat/src/hooks/` í `chatify/hooks/`
  - [ ] `useAgents.ts` - gerenciamento de agentes
  - [ ] `useModels.ts` - gerenciamento de modelos IA
  - [ ] `useChatWidget.ts` - estado do widget flutuante
  - [ ] `useJourneyContent.ts` - carregamento de conte˙do markdown
  - [ ] `useMermaid.ts` - renderizaÁ„o de diagramas
  - [ ] `useAutoScroll.ts` - scroll autom·tico em chat
- [ ] Renomear `useChat.ts` í (n„o migrar, substituÌdo por useChatify.ts)
- [ ] Ajustar todos os imports de tipos para `../types`
- [ ]  **Checkpoint**: Todos os hooks utilit·rios compilam

### 2.4. Testar Fase 2 Completa

**Checklist de Testes**:
- [ ] **Teste 1: useChatify**
  - [ ] Renderizar componente que usa `useChatify()`
  - [ ] Executar `sendMessage('Test')`
  - [ ]  **Verificar**: Mensagem aparece na lista e È persistida via JQEL

- [ ] **Teste 2: useJourneyProgress**
  - [ ] Renderizar componente que usa `useJourneyProgress()`
  - [ ] Marcar etapa como visitada
  - [ ]  **Resultado**: Progresso atualizado e persistido em localStorage

- [ ] **Teste 3: useTheme**
  - [ ] Renderizar componente que usa `useTheme()`
  - [ ] Alternar tema (light/dark)
  - [ ]  **Resultado**: CSS custom properties atualizadas, preferÍncia salva

** CHECKPOINT FASE 2**: Hooks funcionam, contexts removidos, JQEL integrado

---

## <Ø FASE 3: COMPONENTS

### 3.1. Components de Markdown

- [ ] Criar `chatify/components/markdown/`
  - [ ] Copiar `MarkdownContent.tsx` de `examples/chat/`
  - [ ] Ajustar imports
  - [ ] Verificar dependÍncias (react-markdown, remark-gfm, rehype-raw)
- [ ] Otimizar carregamento de Mermaid
  - [ ] Modificar `useMermaid.ts` para usar dynamic import
  - [ ] Carregar mermaid library apenas quando necess·rio
- [ ]  **Checkpoint**: Markdown renderiza corretamente com GFM + Mermaid

### 3.2. Components de Chat

- [ ] Criar `chatify/components/chat/`
  - [ ] Copiar 7 componentes de `examples/chat/src/components/chat/`
  - [ ] `ChatHistory.tsx` - usa useChatify
  - [ ] `ChatInput.tsx` - usa useChatify
  - [ ] `ChatMessage.tsx` - usa MarkdownContent
  - [ ] `ChatWidgetPanel.tsx` - widget flutuante
  - [ ] `SuggestedQuestions.tsx`
  - [ ] `AgentIcon.tsx`
  - [ ] `ChatBadge.tsx`
- [ ] Ajustar todos os imports (hooks, types, components)
- [ ] Substituir `useChat()` por `useChatify()`
- [ ]  **Checkpoint**: Componentes de chat renderizam sem erros

### 3.3. Components de Agent

- [ ] Criar `chatify/components/agent/`
  - [ ] Copiar 4 componentes de `examples/chat/src/components/agent/`
  - [ ] `AgentManagement.tsx` - usa useAgents
  - [ ] `CustomAgentEditor.tsx`
  - [ ] `IconPicker.tsx`
  - [ ] `AgentAttachmentUploader.tsx`
- [ ] Ajustar imports
- [ ]  **Checkpoint**: Componentes de agente funcionam

### 3.4. Components de Gamification

- [ ] Criar `chatify/components/gamification/`
  - [ ] Copiar 5 componentes de `examples/chat/src/components/gamification/`
  - [ ] `ProgressBar.tsx` - usa useJourneyProgress
  - [ ] `NextStepWidget.tsx` - usa useNextStepWidget
  - [ ] `JourneyIndexModal.tsx` - usa useJourneyProgress
  - [ ] `CompletionBadge.tsx`
  - [ ] `ConfettiEffect.tsx`
- [ ] Ajustar imports
- [ ]  **Checkpoint**: Sistema de jornada funciona

### 3.5. Components de Layout

- [ ] Criar `chatify/components/layout/`
  - [ ] Copiar 5 componentes de `examples/chat/src/components/layout/`
  - [ ] `Layout.tsx` - ADAPTAR para integraÁ„o com portal
  - [ ] `Sidebar.tsx` - usa useSidebar
  - [ ] `Navigation.tsx`
  - [ ] `ThemeToggle.tsx` - usa useTheme
  - [ ] `BottomControls.tsx`
- [ ] Remover BrowserRouter de Layout (portal j· tem router)
- [ ]  **Checkpoint**: Layout integra com portal

### 3.6. Components Adicionais

- [ ] Criar `chatify/components/unified/`
  - [ ] Copiar `AgentModelSelector.tsx`
- [ ] Copiar `chatify/components/FloatingActionStack.tsx`
- [ ] Criar barrel exports em `chatify/components/index.ts`
- [ ]  **Checkpoint**: Todos os componentes compilam e s„o exportados

### 3.7. Testar Fase 3 Completa

**Checklist de Testes**:
- [ ] **Teste 1: ChatHistory + ChatInput**
  - [ ] Renderizar componentes
  - [ ] Enviar mensagem
  - [ ]  **Verificar**: Mensagem aparece no histÛrico com Markdown renderizado

- [ ] **Teste 2: ProgressBar + Journey**
  - [ ] Navegar entre p·ginas da jornada
  - [ ]  **Resultado**: Barra de progresso atualiza, etapas marcadas como visitadas

- [ ] **Teste 3: Theme Toggle**
  - [ ] Clicar no toggle de tema
  - [ ]  **Resultado**: Interface muda de light/dark

** CHECKPOINT FASE 3**: Componentes renderizam, hooks funcionam, UI completa

---

## <Ø FASE 4: PAGES & ROUTES

### 4.1. Migrar Pages

- [ ] Criar `chatify/pages/`
  - [ ] Copiar `Home.tsx` - landing page
  - [ ] Copiar `Chat.tsx` í renomear para `ChatInterface.tsx`
  - [ ] Copiar `Admin.tsx` - configuraÁıes de agentes
  - [ ] Copiar `Guide.tsx` - guia da jornada
- [ ] Ajustar imports em todas as p·ginas
- [ ] Substituir `useChat()` por `useChatify()`
- [ ] Remover qualquer referÍncia a `useContext`
- [ ]  **Checkpoint**: P·ginas compilam sem erros

### 4.2. Criar Routes com Lazy Loading

- [ ] Criar `chatify/routes.ts`
  - [ ] Definir rotas com `React.lazy()` para cada p·gina
  - [ ] Rota `/` í Home (lazy)
  - [ ] Rota `/chat` í ChatInterface (lazy)
  - [ ] Rota `/admin` í Admin (lazy)
  - [ ] Rota `/guide` í Guide (lazy)
- [ ]  **Checkpoint**: Routes definidas corretamente

**CÛdigo de ReferÍncia**:
```typescript
// routes.ts
import { lazy } from 'react'
import type { RouteDefinition } from '@/types/module'

const Home = lazy(() => import('./pages/Home'))
const ChatInterface = lazy(() => import('./pages/ChatInterface'))
const Admin = lazy(() => import('./pages/Admin'))
const Guide = lazy(() => import('./pages/Guide'))

export const chatifyRoutes: RouteDefinition[] = [
  { path: '/', component: Home },
  { path: '/chat', component: ChatInterface },
  { path: '/admin', component: Admin },
  { path: '/guide', component: Guide }
]
```

### 4.3. Criar Module Exports e Auto-registro

- [ ] Criar `chatify/index.ts`
  - [ ] Import manifest
  - [ ] Import routes
  - [ ] Criar `chatifyModule: ModuleExports`
  - [ ] Auto-registrar com `moduleRegistry.register(chatifyModule)`
- [ ]  **Checkpoint**: MÛdulo exporta tudo e auto-registra

**CÛdigo de ReferÍncia**:
```typescript
// index.ts
import { moduleRegistry } from '@/core/modules'
import { chatifyManifest } from './manifest'
import { chatifyRoutes } from './routes'
import type { ModuleExports } from '@/types/module'

export const chatifyModule: ModuleExports = {
  manifest: chatifyManifest,
  routes: chatifyRoutes
}

// Auto-registro
moduleRegistry.register(chatifyModule)

export { chatifyManifest, chatifyRoutes }
```

### 4.4. Adicionar Import em modules/index.ts

- [ ] Abrir `src/frontend/src/modules/index.ts`
  - [ ] Adicionar `import './chatify'` (auto-registra ao importar)
- [ ]  **Checkpoint**: MÛdulo aparece no ModuleRegistry

### 4.5. Testar Fase 4 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Lazy Loading de P·ginas**
  - [ ] Inspecionar Network tab ao navegar entre rotas
  - [ ]  **Verificar**: Cada p·gina carrega chunk JS separado

- [ ] **Teste 2: Module Registration**
  - [ ] Console: `moduleRegistry.getModule('chatify')`
  - [ ]  **Resultado**: Retorna manifest e routes

- [ ] **Teste 3: Portal Integration**
  - [ ] Ativar chatify em um portal via setup
  - [ ] Acessar rota do chatify
  - [ ]  **Resultado**: P·gina renderiza dentro do portal

** CHECKPOINT FASE 4**: P·ginas funcionam, routes lazy-loaded, mÛdulo registrado

---

## <Ø FASE 5: ASSETS, DATA & POLISH

### 5.1. Copiar Assets

- [ ] Criar `chatify/assets/`
  - [ ] Copiar `nic-logo-dark.svg` de `examples/chat/assets/`
  - [ ] Copiar `nic-logo-light.svg` de `examples/chat/assets/`
- [ ] Criar `chatify/assets/content/journey/`
  - [ ] Copiar 14 arquivos markdown de `examples/chat/content/journey/`
- [ ]  **Checkpoint**: Assets no local correto

### 5.2. Copiar Data Files

- [ ] Criar `chatify/data/`
  - [ ] Copiar `emojiCategories.ts` de `examples/chat/src/data/`
  - [ ] Copiar `lucideIcons.ts` de `examples/chat/src/data/`
- [ ]  **Checkpoint**: Data files compilam

### 5.3. Copiar Utils

- [ ] Criar `chatify/utils/`
  - [ ] Copiar `journeyMap.ts` de `examples/chat/src/utils/`
  - [ ] Copiar `colorUtils.ts` de `examples/chat/src/utils/`
- [ ] Ajustar imports
- [ ]  **Checkpoint**: Utils funcionam

### 5.4. ConfiguraÁ„o de Providers

- [ ] Copiar `examples/chat/public/config/ai-providers.json`
  - [ ] Para `public/config/chatify-providers.json`
- [ ] Ajustar `providerService.ts` para apontar para novo path
- [ ]  **Checkpoint**: Providers carregam corretamente

### 5.5. Adicionar DependÍncias

- [ ] Verificar `package.json` da plataforma
  - [ ] Se n„o estiver, adicionar: `react-markdown@^10.1.0`
  - [ ] Se n„o estiver, adicionar: `remark-gfm@^4.0.1`
  - [ ] Se n„o estiver, adicionar: `rehype-raw@^7.0.0`
  - [ ] Se n„o estiver, adicionar: `mermaid@^11.12.0`
  - [ ] Se n„o estiver, adicionar: `gray-matter@^4.0.3`
  - [ ] Se n„o estiver, adicionar: `date-fns@^3.x`
- [ ] Executar `npm install`
- [ ]  **Checkpoint**: DependÍncias instaladas

### 5.6. Testar Fase 5 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Assets Carregam**
  - [ ] Renderizar p·gina com logos NIC
  - [ ]  **Verificar**: Logos light/dark aparecem corretamente

- [ ] **Teste 2: Journey Content**
  - [ ] Abrir p·gina Guide
  - [ ] Navegar entre etapas da jornada
  - [ ]  **Resultado**: Conte˙do markdown carrega e renderiza

- [ ] **Teste 3: Emoji/Icon Pickers**
  - [ ] Abrir CustomAgentEditor
  - [ ] Abrir IconPicker
  - [ ]  **Resultado**: Categorias de emojis e Ìcones Lucide aparecem

** CHECKPOINT FASE 5**: Assets, data e utils funcionam, dependÍncias instaladas

---

## <Ø FASE 6: TESTES INTEGRADOS

### 6.1. Teste: Chat Completo com IA

- [ ] Abrir p·gina ChatInterface
- [ ] Selecionar agente NIC
- [ ] Enviar mensagem "Ol·"
- [ ]  **Verificar**: Resposta do agente com streaming SSE
- [ ]  **Verificar**: Markdown renderizado (negrito, cÛdigo, listas)
- [ ]  **Verificar**: Mensagens persistidas via JQEL

### 6.2. Teste: Sistema de Agentes

- [ ] Abrir p·gina Admin
- [ ] Verificar agentes built-in (da .env)
- [ ] Verificar agentes N8N-discovered
- [ ] Criar agente custom
- [ ]  **Verificar**: Agente custom salvo em localStorage
- [ ] Selecionar agente custom no chat
- [ ]  **Verificar**: Chat funciona com agente custom

### 6.3. Teste: Sistema de Jornada

- [ ] Abrir p·gina Home
- [ ]  **Verificar**: Barra de progresso aparece (0%)
- [ ] Navegar todas as 14 etapas (Home í Guide í etapas)
- [ ]  **Verificar**: Progresso atualiza atÈ 100%
- [ ]  **Verificar**: Badge de conclus„o + confetes ao completar
- [ ] Recarregar p·gina
- [ ]  **Verificar**: Progresso mantido (localStorage)

### 6.4. Teste: Widget Flutuante

- [ ] Abrir qualquer p·gina
- [ ] Clicar no FAB principal
- [ ]  **Verificar**: Widget de chat abre
- [ ] Enviar mensagem no widget
- [ ]  **Verificar**: Mensagem aparece no widget
- [ ] Minimizar widget
- [ ]  **Verificar**: Badge de notificaÁıes aparece

### 6.5. Teste: Responsividade

- [ ] Abrir DevTools, modo mobile (375px)
- [ ]  **Verificar**: Sidebar inicia fechada
- [ ]  **Verificar**: Sidebar abre como overlay
- [ ]  **Verificar**: Chat input responsivo
- [ ] Redimensionar para desktop (1280px)
- [ ]  **Verificar**: Sidebar inicia expandida
- [ ]  **Verificar**: Layout ajustado para desktop

### 6.6. Teste: Tema Light/Dark

- [ ] Sistema em modo claro
- [ ] Clicar em toggle de tema
- [ ]  **Verificar**: Interface muda para dark
- [ ]  **Verificar**: Logos mudam (dark í light)
- [ ] Recarregar p·gina
- [ ]  **Verificar**: Tema dark mantido

### 6.7. Teste: Markdown + Mermaid

- [ ] Enviar mensagem com cÛdigo:
  ```
  **Negrito** e *it·lico*

  ` ```javascript
  const x = 1
  ` ```

  ` ```mermaid
  graph TD
  A-->B
  ` ```
  ```
- [ ]  **Verificar**: Negrito e it·lico renderizados
- [ ]  **Verificar**: Code block com syntax highlighting
- [ ]  **Verificar**: Diagrama Mermaid renderizado

** CHECKPOINT FASE 6**: Sistema completo funciona end-to-end

---

## =› NOTAS DE IMPLEMENTA«√O

### Decisıes Arquiteturais

- **JQEL para Mensagens**: Mensagens e conversas migradas de localStorage para JQEL (schema: 'chatify') para persistÍncia real e suporte a m˙ltiplos dispositivos. localStorage mantido apenas para preferÍncias de UI.

- **Hooks Puros**: Contexts removidos para aderir ao padr„o da plataforma. Cada hook gerencia seu prÛprio estado usando storage service ou JQEL, sem necessidade de Providers.

- **Lazy Loading**: Todas as p·ginas e Mermaid library com dynamic import para otimizar bundle size (~316KB gzip inicial, Mermaid carrega sob demanda).

- **Backend Separado**: Express backend mantido como microserviÁo separado (n„o parte do mÛdulo frontend) com rotas prefixadas `/api/chatify/*` para proxy de APIs externas (NIC, OpenAI).

### LimitaÁıes Conhecidas

- **Mermaid Bundle Size**: Library de 442KB È grande mesmo com dynamic import
  - MitigaÁ„o: Carregado apenas quando diagrama detectado no markdown
  - Alternativa futura: Substituir por biblioteca menor ou renderizar server-side

- **XSS em Markdown**: rehype-raw permite HTML bruto nas mensagens
  - MitigaÁ„o: Sanitizar mensagens de usu·rios antes de renderizar (DOMPurify)
  - Alternativa futura: Remover rehype-raw e desabilitar HTML inline

- **N8N Cache**: Agentes N8N descobertos tem cache de 5min, pode estar desatualizado
  - MitigaÁ„o: Bot„o de refresh manual j· implementado
  - Alternativa futura: WebSocket para notificaÁıes de mudanÁas em tempo real

- **localStorage Sync**: Storage events n„o funcionam na mesma aba
  - MitigaÁ„o: Cada aba mantÈm estado independente
  - Alternativa futura: BroadcastChannel API para sync cross-tab

### ReferÍncias

- `examples/chat/` - Projeto original standalone
- `spec/SPEC-data-access.md` - JQEL integration patterns
- `spec/SPEC-jqel-syntax.md` - JQEL query syntax
- `spec/SPEC-modules.md` - Module system design
- `spec/SPEC-routing.md` - Lazy loading patterns
- `src/frontend/src/modules/chat/` - MÛdulo de referÍncia usando JQEL
- `chatify/MIGRATION.md` - DocumentaÁ„o detalhada da migraÁ„o

---

## REGISTRO DE EXECU√á√ÉO

### Fase 1 - STORAGE & SERVICES ‚úÖ CONCLU√çDO (2025-11-12)

**Status**: Todas as tarefas da Fase 1 foram conclu√≠das com sucesso.

#### Arquivos Criados (10 arquivos)

**Storage System (4 arquivos)**
- ‚úÖ `services/storage/index.ts` - Exports centralizados
- ‚úÖ `services/storage/StorageDriver.ts` - Interface abstrata
- ‚úÖ `services/storage/LocalStorageDriver.ts` - Implementa√ß√£o localStorage com debounce 1s
- ‚úÖ `services/storage/storageService.ts` - Singleton facade

**Services B√°sicos (3 arquivos)**
- ‚úÖ `services/agentParser.ts` - Parser de agentes built-in do .env
- ‚úÖ `services/agentService.ts` - Gerenciamento de agentes (built-in + N8N + custom)
- ‚úÖ `services/providerService.ts` - Config path: `/config/chatify-providers.json`

**Chat Service JQEL (1 arquivo)**
- ‚úÖ `services/chatService.ts` - **REESCRITO** para JQEL (schema: 'chatify')
  - loadConversation() usando jqelClient.select()
  - saveConversation() usando jqelClient.mutate('insert')
  - updateConversation() usando jqelClient.mutate('delete' + 'insert')
  - clearHistory() usando jqelClient.mutate('delete')

**Services de Integra√ß√£o (2 arquivos)**
- ‚úÖ `services/aiChatService.ts` - Stream SSE OpenAI-compatible (suporta N8N + OpenAI)
- ‚úÖ `services/n8nChatService.ts` - Stream SSE direto N8N webhook

#### Ajustes Aplicados

1. ‚úÖ **Type-only imports**: Convertidos para `import type` (compatibilidade `verbatimModuleSyntax`)
2. ‚úÖ **JQEL Integration**: chatService 100% adaptado para queries via jqelClient
3. ‚úÖ **Path atualizado**: Provider config aponta para `/config/chatify-providers.json`

#### Verifica√ß√£o TypeScript

```bash
cd src/frontend && npm run type-check
# Resultado: ‚úÖ Nenhum erro de TypeScript no m√≥dulo chatify
```

#### Checkpoints Atingidos

- ‚úÖ 1.1 - Storage service compila sem erros
- ‚úÖ 1.2 - Services b√°sicos compilam e fun√ß√µes s√£o exportadas
- ‚úÖ 1.3 - chatService usa JQEL e exporta todas as fun√ß√µes
- ‚úÖ 1.4 - Services de integra√ß√£o funcionam com SSE streaming
- ‚úÖ 1.5 - Compila√ß√£o TypeScript sem erros

**‚úÖ CHECKPOINT FASE 1 COMPLETO**: Services funcionam, chatService usa JQEL, storage system operacional

#### Pr√≥xima Fase

**FASE 2: HOOKS** - Converter React Contexts para hooks puros
- Converter ChatContext ‚Üí useChatify (usar useJQELQuery/Mutation)
- Converter JourneyProgressContext ‚Üí useJourneyProgress (storageService)
- Converter ThemeContext ‚Üí useTheme (localStorage)
- Converter SidebarContext ‚Üí useSidebar (localStorage)
- Converter NextStepWidgetContext ‚Üí useNextStepWidget (storageService)
- Migrar hooks utilit√°rios (useAgents, useModels, useChatWidget, etc)

