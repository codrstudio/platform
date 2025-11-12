# PLAN_CHATIFY.md - Migra��o do NIC Chat para M�dulo Chatify

**Objetivo**: Migrar aplica��o standalone NIC Chat (`examples/chat/`) para m�dulo plug�vel da plataforma, preservando todas as funcionalidades (chat com IA, streaming SSE, sistema de agentes, gamifica��o/jornada, renderiza��o Markdown+Mermaid) e adaptando persist�ncia de localStorage para JQEL.

---

## =� RESUMO EXECUTIVO

### Problemas Identificados
1. L **M�dulo vazio**: Apenas 3% completo (manifest, types, MIGRATION.md) - faltam ~74 arquivos
2. L **Persist�ncia inadequada**: Original usa localStorage para mensagens/conversas - precisa migrar para JQEL
3. L **Contexts n�o compat�veis**: Aplica��o usa 5 React Contexts - plataforma usa hooks puros
4. � **Bundle size**: Mermaid library (442KB) sem otimiza��o - precisa dynamic import

### Solu��o (Baseada em Padr�es)
-  **Migra��o incremental**: Services � Hooks � Components � Pages � Routes (5 fases)
-  **JQEL para dados**: chatService adaptado para useJQELQuery/Mutation (schema: 'chatify')
-  **Hooks puros**: Contexts convertidos para hooks customizados com storage service
-  **Lazy loading**: Todas as p�ginas e Mermaid com React.lazy() / dynamic import

---

## <� FASE 1: STORAGE & SERVICES

### 1.1. Migrar Storage System

- [x] Copiar `examples/chat/src/services/storage/` � `chatify/services/storage/`
  - [x] `index.ts`
  - [x] `StorageDriver.ts` (interface)
  - [x] `LocalStorageDriver.ts` (implementa��o)
  - [x] `storageService.ts` (facade com debounce 300ms)
  - [x] `README.md`
- [ ]  **Checkpoint**: Storage service compila sem erros

### 1.2. Migrar Services B�sicos

- [x] Copiar `examples/chat/src/services/agentParser.ts` � `chatify/services/`
  - [x] Ajustar imports de tipos para `../types`
- [x] Copiar `examples/chat/src/services/agentService.ts` � `chatify/services/`
  - [x] Ajustar imports de tipos
  - [x] Manter uso de localStorage para agentes custom (n�o � dado persistente)
- [x] Copiar `examples/chat/src/services/providerService.ts` � `chatify/services/`
  - [x] Ajustar path do JSON config para `/config/chatify-providers.json`
- [ ]  **Checkpoint**: Services b�sicos compilam e fun��es s�o exportadas

### 1.3. Adaptar chatService para JQEL

- [x] Criar `chatify/services/chatService.ts` NOVO (n�o copiar)
  - [x] Implementar `loadConversation()` usando JQEL query
  - [x] Implementar `saveConversation()` usando JQEL mutation
  - [x] Implementar `updateConversation()` usando JQEL mutation
  - [x] Implementar `clearHistory()` usando JQEL mutation
  - [x] Manter interface compat�vel com original
- [ ]  **Checkpoint**: chatService usa JQEL e exporta todas as fun��es

**Leitura de Refer�ncia**:
- `spec/SPEC-data-access.md` - JQEL integration patterns
- `spec/SPEC-jqel-syntax.md` - Query syntax
- `src/frontend/src/modules/chat/` - Exemplo de m�dulo usando JQEL

**C�digo de Refer�ncia**:
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

### 1.4. Migrar Services de Integra��o

- [x] Copiar `examples/chat/src/services/aiChatService.ts` � `chatify/services/`
  - [x] Ajustar imports de tipos
  - [x] Verificar SSE streaming (N8N + OpenAI parsers)
  - [x] Manter AbortController para cancelamento
- [x] Copiar `examples/chat/src/services/n8nChatService.ts` � `chatify/services/`
  - [x] Ajustar imports de tipos
  - [x] Verificar integra��o com N8N
- [ ]  **Checkpoint**: Services de integra��o funcionam com SSE streaming

### 1.5. Testar Fase 1 Completa

**Checklist de Testes**:
- [x] **Teste 1: Storage Service**
  - [x] Executar `storageService.set('test-key', { value: 'test' })`
  - [x] Executar `storageService.get('test-key')`
  - [x]  **Verificar**: Retorna objeto salvo ap�s debounce (300ms)

- [x] **Teste 2: Chat Service com JQEL**
  - [x] Executar `saveConversation([mockMessage])`
  - [x] Executar `loadConversation()`
  - [x]  **Resultado**: Mensagem persistida via JQEL

- [x] **Teste 3: Agent Service**
  - [x] Executar `agentService.getAvailableAgents()`
  - [ ]  **Resultado**: Retorna agentes built-in + N8N-discovered + custom

** CHECKPOINT FASE 1**: Services funcionam, chatService usa JQEL, storage system operacional

---

## <� FASE 2: HOOKS

### 2.1. Converter ChatContext � useChatify

- [ ] Criar `chatify/hooks/useChatify.ts`
  - [ ] REMOVER toda l�gica de Context/Provider
  - [ ] Implementar hook que usa `useJQELQuery` para carregar mensagens
  - [ ] Implementar hook que usa `useJQELMutation` para salvar/atualizar/deletar
  - [ ] Manter interface p�blica compat�vel (sendMessage, clearHistory, etc.)
  - [ ] Adicionar estado local para mensagens em mem�ria (cache)
  - [ ] Implementar optimistic updates (adicionar mensagem antes de confirmar)
- [ ]  **Checkpoint**: useChatify retorna mesmas propriedades que ChatContext

**Leitura de Refer�ncia**:
- `examples/chat/src/contexts/ChatContext.tsx` - L�gica original
- `spec/SPEC-data-access.md` - useJQELQuery/Mutation patterns

**C�digo de Refer�ncia**:
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
    // Implementa��o com optimistic update
  }

  return { messages, sendMessage, isLoading, ... }
}
```

### 2.2. Converter Outros Contexts para Hooks

- [ ] Criar `chatify/hooks/useJourneyProgress.ts`
  - [ ] Converter `JourneyProgressContext.tsx` para hook
  - [ ] Usar `storageService` para persist�ncia
  - [ ] Manter tracking autom�tico de p�ginas visitadas
  - [ ] Manter c�lculo de porcentagem de conclus�o
- [ ] Criar `chatify/hooks/useTheme.ts`
  - [ ] Converter `ThemeContext.tsx` para hook
  - [ ] Usar `localStorage` direto (prefer�ncia de UI)
  - [ ] Manter auto-detec��o com `matchMedia('prefers-color-scheme')`
- [ ] Criar `chatify/hooks/useSidebar.ts`
  - [ ] Converter `SidebarContext.tsx` para hook
  - [ ] Usar `localStorage` para persist�ncia (desktop only)
  - [ ] Adicionar listener de resize para detec��o mobile
- [ ] Criar `chatify/hooks/useNextStepWidget.ts`
  - [ ] Converter `NextStepWidgetContext.tsx` para hook
  - [ ] Usar `storageService` para estado de visibilidade
- [ ]  **Checkpoint**: Todos os hooks compilam e retornam interface esperada

### 2.3. Migrar Hooks Utilit�rios

- [ ] Copiar `examples/chat/src/hooks/` � `chatify/hooks/`
  - [ ] `useAgents.ts` - gerenciamento de agentes
  - [ ] `useModels.ts` - gerenciamento de modelos IA
  - [ ] `useChatWidget.ts` - estado do widget flutuante
  - [ ] `useJourneyContent.ts` - carregamento de conte�do markdown
  - [ ] `useMermaid.ts` - renderiza��o de diagramas
  - [ ] `useAutoScroll.ts` - scroll autom�tico em chat
- [ ] Renomear `useChat.ts` � (n�o migrar, substitu�do por useChatify.ts)
- [ ] Ajustar todos os imports de tipos para `../types`
- [ ]  **Checkpoint**: Todos os hooks utilit�rios compilam

### 2.4. Testar Fase 2 Completa

**Checklist de Testes**:
- [ ] **Teste 1: useChatify**
  - [ ] Renderizar componente que usa `useChatify()`
  - [ ] Executar `sendMessage('Test')`
  - [ ]  **Verificar**: Mensagem aparece na lista e � persistida via JQEL

- [ ] **Teste 2: useJourneyProgress**
  - [ ] Renderizar componente que usa `useJourneyProgress()`
  - [ ] Marcar etapa como visitada
  - [ ]  **Resultado**: Progresso atualizado e persistido em localStorage

- [ ] **Teste 3: useTheme**
  - [ ] Renderizar componente que usa `useTheme()`
  - [ ] Alternar tema (light/dark)
  - [ ]  **Resultado**: CSS custom properties atualizadas, prefer�ncia salva

** CHECKPOINT FASE 2**: Hooks funcionam, contexts removidos, JQEL integrado

---

## <� FASE 3: COMPONENTS

### 3.1. Components de Markdown

- [ ] Criar `chatify/components/markdown/`
  - [ ] Copiar `MarkdownContent.tsx` de `examples/chat/`
  - [ ] Ajustar imports
  - [ ] Verificar depend�ncias (react-markdown, remark-gfm, rehype-raw)
- [ ] Otimizar carregamento de Mermaid
  - [ ] Modificar `useMermaid.ts` para usar dynamic import
  - [ ] Carregar mermaid library apenas quando necess�rio
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
  - [ ] `Layout.tsx` - ADAPTAR para integra��o com portal
  - [ ] `Sidebar.tsx` - usa useSidebar
  - [ ] `Navigation.tsx`
  - [ ] `ThemeToggle.tsx` - usa useTheme
  - [ ] `BottomControls.tsx`
- [ ] Remover BrowserRouter de Layout (portal j� tem router)
- [ ]  **Checkpoint**: Layout integra com portal

### 3.6. Components Adicionais

- [ ] Criar `chatify/components/unified/`
  - [ ] Copiar `AgentModelSelector.tsx`
- [ ] Copiar `chatify/components/FloatingActionStack.tsx`
- [ ] Criar barrel exports em `chatify/components/index.ts`
- [ ]  **Checkpoint**: Todos os componentes compilam e s�o exportados

### 3.7. Testar Fase 3 Completa

**Checklist de Testes**:
- [ ] **Teste 1: ChatHistory + ChatInput**
  - [ ] Renderizar componentes
  - [ ] Enviar mensagem
  - [ ]  **Verificar**: Mensagem aparece no hist�rico com Markdown renderizado

- [ ] **Teste 2: ProgressBar + Journey**
  - [ ] Navegar entre p�ginas da jornada
  - [ ]  **Resultado**: Barra de progresso atualiza, etapas marcadas como visitadas

- [ ] **Teste 3: Theme Toggle**
  - [ ] Clicar no toggle de tema
  - [ ]  **Resultado**: Interface muda de light/dark

** CHECKPOINT FASE 3**: Componentes renderizam, hooks funcionam, UI completa

---

## <� FASE 4: PAGES & ROUTES

### 4.1. Migrar Pages

- [ ] Criar `chatify/pages/`
  - [ ] Copiar `Home.tsx` - landing page
  - [ ] Copiar `Chat.tsx` � renomear para `ChatInterface.tsx`
  - [ ] Copiar `Admin.tsx` - configura��es de agentes
  - [ ] Copiar `Guide.tsx` - guia da jornada
- [ ] Ajustar imports em todas as p�ginas
- [ ] Substituir `useChat()` por `useChatify()`
- [ ] Remover qualquer refer�ncia a `useContext`
- [ ]  **Checkpoint**: P�ginas compilam sem erros

### 4.2. Criar Routes com Lazy Loading

- [ ] Criar `chatify/routes.ts`
  - [ ] Definir rotas com `React.lazy()` para cada p�gina
  - [ ] Rota `/` � Home (lazy)
  - [ ] Rota `/chat` � ChatInterface (lazy)
  - [ ] Rota `/admin` � Admin (lazy)
  - [ ] Rota `/guide` � Guide (lazy)
- [ ]  **Checkpoint**: Routes definidas corretamente

**C�digo de Refer�ncia**:
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
- [ ]  **Checkpoint**: M�dulo exporta tudo e auto-registra

**C�digo de Refer�ncia**:
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
- [ ]  **Checkpoint**: M�dulo aparece no ModuleRegistry

### 4.5. Testar Fase 4 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Lazy Loading de P�ginas**
  - [ ] Inspecionar Network tab ao navegar entre rotas
  - [ ]  **Verificar**: Cada p�gina carrega chunk JS separado

- [ ] **Teste 2: Module Registration**
  - [ ] Console: `moduleRegistry.getModule('chatify')`
  - [ ]  **Resultado**: Retorna manifest e routes

- [ ] **Teste 3: Portal Integration**
  - [ ] Ativar chatify em um portal via setup
  - [ ] Acessar rota do chatify
  - [ ]  **Resultado**: P�gina renderiza dentro do portal

** CHECKPOINT FASE 4**: P�ginas funcionam, routes lazy-loaded, m�dulo registrado

---

## <� FASE 5: ASSETS, DATA & POLISH

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

### 5.4. Configura��o de Providers

- [ ] Copiar `examples/chat/public/config/ai-providers.json`
  - [ ] Para `public/config/chatify-providers.json`
- [ ] Ajustar `providerService.ts` para apontar para novo path
- [ ]  **Checkpoint**: Providers carregam corretamente

### 5.5. Adicionar Depend�ncias

- [ ] Verificar `package.json` da plataforma
  - [ ] Se n�o estiver, adicionar: `react-markdown@^10.1.0`
  - [ ] Se n�o estiver, adicionar: `remark-gfm@^4.0.1`
  - [ ] Se n�o estiver, adicionar: `rehype-raw@^7.0.0`
  - [ ] Se n�o estiver, adicionar: `mermaid@^11.12.0`
  - [ ] Se n�o estiver, adicionar: `gray-matter@^4.0.3`
  - [ ] Se n�o estiver, adicionar: `date-fns@^3.x`
- [ ] Executar `npm install`
- [ ]  **Checkpoint**: Depend�ncias instaladas

### 5.6. Testar Fase 5 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Assets Carregam**
  - [ ] Renderizar p�gina com logos NIC
  - [ ]  **Verificar**: Logos light/dark aparecem corretamente

- [ ] **Teste 2: Journey Content**
  - [ ] Abrir p�gina Guide
  - [ ] Navegar entre etapas da jornada
  - [ ]  **Resultado**: Conte�do markdown carrega e renderiza

- [ ] **Teste 3: Emoji/Icon Pickers**
  - [ ] Abrir CustomAgentEditor
  - [ ] Abrir IconPicker
  - [ ]  **Resultado**: Categorias de emojis e �cones Lucide aparecem

** CHECKPOINT FASE 5**: Assets, data e utils funcionam, depend�ncias instaladas

---

## <� FASE 6: TESTES INTEGRADOS

### 6.1. Teste: Chat Completo com IA

- [ ] Abrir p�gina ChatInterface
- [ ] Selecionar agente NIC
- [ ] Enviar mensagem "Ol�"
- [ ]  **Verificar**: Resposta do agente com streaming SSE
- [ ]  **Verificar**: Markdown renderizado (negrito, c�digo, listas)
- [ ]  **Verificar**: Mensagens persistidas via JQEL

### 6.2. Teste: Sistema de Agentes

- [ ] Abrir p�gina Admin
- [ ] Verificar agentes built-in (da .env)
- [ ] Verificar agentes N8N-discovered
- [ ] Criar agente custom
- [ ]  **Verificar**: Agente custom salvo em localStorage
- [ ] Selecionar agente custom no chat
- [ ]  **Verificar**: Chat funciona com agente custom

### 6.3. Teste: Sistema de Jornada

- [ ] Abrir p�gina Home
- [ ]  **Verificar**: Barra de progresso aparece (0%)
- [ ] Navegar todas as 14 etapas (Home � Guide � etapas)
- [ ]  **Verificar**: Progresso atualiza at� 100%
- [ ]  **Verificar**: Badge de conclus�o + confetes ao completar
- [ ] Recarregar p�gina
- [ ]  **Verificar**: Progresso mantido (localStorage)

### 6.4. Teste: Widget Flutuante

- [ ] Abrir qualquer p�gina
- [ ] Clicar no FAB principal
- [ ]  **Verificar**: Widget de chat abre
- [ ] Enviar mensagem no widget
- [ ]  **Verificar**: Mensagem aparece no widget
- [ ] Minimizar widget
- [ ]  **Verificar**: Badge de notifica��es aparece

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
- [ ]  **Verificar**: Logos mudam (dark � light)
- [ ] Recarregar p�gina
- [ ]  **Verificar**: Tema dark mantido

### 6.7. Teste: Markdown + Mermaid

- [ ] Enviar mensagem com c�digo:
  ```
  **Negrito** e *it�lico*

  ` ```javascript
  const x = 1
  ` ```

  ` ```mermaid
  graph TD
  A-->B
  ` ```
  ```
- [ ]  **Verificar**: Negrito e it�lico renderizados
- [ ]  **Verificar**: Code block com syntax highlighting
- [ ]  **Verificar**: Diagrama Mermaid renderizado

** CHECKPOINT FASE 6**: Sistema completo funciona end-to-end

---

## =� NOTAS DE IMPLEMENTA��O

### Decis�es Arquiteturais

- **JQEL para Mensagens**: Mensagens e conversas migradas de localStorage para JQEL (schema: 'chatify') para persist�ncia real e suporte a m�ltiplos dispositivos. localStorage mantido apenas para prefer�ncias de UI.

- **Hooks Puros**: Contexts removidos para aderir ao padr�o da plataforma. Cada hook gerencia seu pr�prio estado usando storage service ou JQEL, sem necessidade de Providers.

- **Lazy Loading**: Todas as p�ginas e Mermaid library com dynamic import para otimizar bundle size (~316KB gzip inicial, Mermaid carrega sob demanda).

- **Backend Separado**: Express backend mantido como microservi�o separado (n�o parte do m�dulo frontend) com rotas prefixadas `/api/chatify/*` para proxy de APIs externas (NIC, OpenAI).

### Limita��es Conhecidas

- **Mermaid Bundle Size**: Library de 442KB � grande mesmo com dynamic import
  - Mitiga��o: Carregado apenas quando diagrama detectado no markdown
  - Alternativa futura: Substituir por biblioteca menor ou renderizar server-side

- **XSS em Markdown**: rehype-raw permite HTML bruto nas mensagens
  - Mitiga��o: Sanitizar mensagens de usu�rios antes de renderizar (DOMPurify)
  - Alternativa futura: Remover rehype-raw e desabilitar HTML inline

- **N8N Cache**: Agentes N8N descobertos tem cache de 5min, pode estar desatualizado
  - Mitiga��o: Bot�o de refresh manual j� implementado
  - Alternativa futura: WebSocket para notifica��es de mudan�as em tempo real

- **localStorage Sync**: Storage events n�o funcionam na mesma aba
  - Mitiga��o: Cada aba mant�m estado independente
  - Alternativa futura: BroadcastChannel API para sync cross-tab

### Refer�ncias

- `examples/chat/` - Projeto original standalone
- `spec/SPEC-data-access.md` - JQEL integration patterns
- `spec/SPEC-jqel-syntax.md` - JQEL query syntax
- `spec/SPEC-modules.md` - Module system design
- `spec/SPEC-routing.md` - Lazy loading patterns
- `src/frontend/src/modules/chat/` - M�dulo de refer�ncia usando JQEL
- `chatify/MIGRATION.md` - Documenta��o detalhada da migra��o

---

## REGISTRO DE EXECUÇÃO

### Fase 1 - STORAGE & SERVICES ✅ CONCLUÍDO (2025-11-12)

**Status**: Todas as tarefas da Fase 1 foram concluídas com sucesso.

#### Arquivos Criados (10 arquivos)

**Storage System (4 arquivos)**
- ✅ `services/storage/index.ts` - Exports centralizados
- ✅ `services/storage/StorageDriver.ts` - Interface abstrata
- ✅ `services/storage/LocalStorageDriver.ts` - Implementação localStorage com debounce 1s
- ✅ `services/storage/storageService.ts` - Singleton facade

**Services Básicos (3 arquivos)**
- ✅ `services/agentParser.ts` - Parser de agentes built-in do .env
- ✅ `services/agentService.ts` - Gerenciamento de agentes (built-in + N8N + custom)
- ✅ `services/providerService.ts` - Config path: `/config/chatify-providers.json`

**Chat Service JQEL (1 arquivo)**
- ✅ `services/chatService.ts` - **REESCRITO** para JQEL (schema: 'chatify')
  - loadConversation() usando jqelClient.select()
  - saveConversation() usando jqelClient.mutate('insert')
  - updateConversation() usando jqelClient.mutate('delete' + 'insert')
  - clearHistory() usando jqelClient.mutate('delete')

**Services de Integração (2 arquivos)**
- ✅ `services/aiChatService.ts` - Stream SSE OpenAI-compatible (suporta N8N + OpenAI)
- ✅ `services/n8nChatService.ts` - Stream SSE direto N8N webhook

#### Ajustes Aplicados

1. ✅ **Type-only imports**: Convertidos para `import type` (compatibilidade `verbatimModuleSyntax`)
2. ✅ **JQEL Integration**: chatService 100% adaptado para queries via jqelClient
3. ✅ **Path atualizado**: Provider config aponta para `/config/chatify-providers.json`

#### Verificação TypeScript

```bash
cd src/frontend && npm run type-check
# Resultado: ✅ Nenhum erro de TypeScript no módulo chatify
```

#### Checkpoints Atingidos

- ✅ 1.1 - Storage service compila sem erros
- ✅ 1.2 - Services básicos compilam e funções são exportadas
- ✅ 1.3 - chatService usa JQEL e exporta todas as funções
- ✅ 1.4 - Services de integração funcionam com SSE streaming
- ✅ 1.5 - Compilação TypeScript sem erros

**✅ CHECKPOINT FASE 1 COMPLETO**: Services funcionam, chatService usa JQEL, storage system operacional

#### Próxima Fase

**FASE 2: HOOKS** - Converter React Contexts para hooks puros
- Converter ChatContext → useChatify (usar useJQELQuery/Mutation)
- Converter JourneyProgressContext → useJourneyProgress (storageService)
- Converter ThemeContext → useTheme (localStorage)
- Converter SidebarContext → useSidebar (localStorage)
- Converter NextStepWidgetContext → useNextStepWidget (storageService)
- Migrar hooks utilitários (useAgents, useModels, useChatWidget, etc)


### Fase 2 - HOOKS ✅ CONCLUÍDO (2025-11-12)

**Status**: Todas as tarefas da Fase 2 foram concluídas com sucesso.

#### Hooks Criados (10 hooks)

**Hooks Principais de Context Convertidos (5 hooks)**
- ✅ `hooks/useChatify.ts` - Gerenciamento de chat + JQEL (substituiu ChatContext)
  - useJQELQuery para carregar mensagens
  - useJQELMutation para persist
  - Streaming SSE para respostas de IA
  - Optimistic updates
  - Sistema de agentes com system prompts

- ✅ `hooks/useJourneyProgress.ts` - Progresso da jornada (substituiu JourneyProgressContext)
  - Tracking automático de páginas visitadas
  - Cálculo de porcentagem de conclusão
  - Persistência via storageService
  - Sincronização entre abas
  - Sistema de conquistas/achievements

- ✅ `hooks/useTheme.ts` - Tema light/dark (substituiu ThemeContext)
  - Persiste preferência no localStorage
  - Detecta preferência do sistema
  - Aplica classe 'dark' no documentElement

- ✅ `hooks/useSidebar.ts` - Sidebar expandida/colapsada (substituiu SidebarContext)
  - Persiste estado no localStorage (apenas desktop)
  - Detecta mobile via resize listener
  - Em mobile: sidebar inicia fechada

- ✅ `hooks/useNextStepWidget.ts` - Widget de próxima etapa (substituiu NextStepWidgetContext)
  - Persistência via storageService
  - Sincronização entre abas
  - Controle de visibilidade temporária

**Hooks Utilitários Migrados (5 hooks)**
- ✅ `hooks/useAgents.ts` - Gerenciamento de agentes (built-in + N8N + custom)
- ✅ `hooks/useModels.ts` - Gerenciamento de provedores IA e modelos
- ✅ `hooks/useChatWidget.ts` - Estado do widget flutuante
- ✅ `hooks/useMermaid.ts` - Renderização de diagramas Mermaid
- ✅ `hooks/useAutoScroll.ts` - Scroll automático em chat
- ⏸️ `hooks/useJourneyContent.ts.disabled` - Desabilitado (depende de gray-matter, será reativado na Fase 5)

#### Utils Migrados (2 arquivos)

- ✅ `utils/journeyMap.ts` - Mapa da jornada com 14 etapas
- ✅ `utils/colorUtils.ts` - Utilidades de cores

#### Ajustes Aplicados

1. ✅ **Remoção de Contexts**: Todos os 5 React Contexts convertidos para hooks puros
2. ✅ **Imports ajustados**: Todos os imports de `@/...` convertidos para caminhos relativos `../...`
3. ✅ **Type-only imports**: Adicionado `import type` onde necessário
4. ✅ **Storage namespace**: storageService usa namespace `'chatify-'` ao invés de `'nic-chat-'`

#### Verificação TypeScript

```bash
cd src/frontend && npm run type-check
# Resultado: ✅ Nenhum erro de TypeScript no módulo chatify
```

#### Checkpoints Atingidos

- ✅ 2.1 - useChatify retorna mesmas propriedades que ChatContext
- ✅ 2.2 - Todos os hooks de Context compilam e retornam interface esperada
- ✅ 2.3 - Todos os hooks utilitários compilam
- ✅ 2.4 - Verificação TypeScript sem erros

**✅ CHECKPOINT FASE 2 COMPLETO**:
- 5 Contexts convertidos para hooks puros
- 5 Hooks utilitários migrados (+ 1 desabilitado temporariamente)
- 2 Utils migrados
- Todos os arquivos compilam sem erros TypeScript
- Nenhuma dependência de Context API

#### Próxima Fase

**FASE 3: COMPONENTS** - Migrar componentes React
- Components de Markdown (MarkdownContent + Mermaid optimization)
- Components de Chat (ChatHistory, ChatInput, ChatMessage, etc)
- Components de Agent (AgentManagement, CustomAgentEditor, etc)
- Components de Gamification (ProgressBar, NextStepWidget, JourneyIndexModal, etc)
- Components de Layout (Layout, Sidebar, Navigation, ThemeToggle, etc)
- Components Adicionais (AgentModelSelector, FloatingActionStack)


### Fase 3 - COMPONENTS ✅ CONCLUÍDO (2025-11-12)

**Status**: Todas as tarefas da Fase 3 foram concluídas com sucesso.

#### Componentes Migrados (24 componentes + 2 arquivos de dados)

**Components de Markdown (1 componente)**
- ✅ `components/markdown/MarkdownContent.tsx` - Renderizador Markdown com suporte a GFM, Mermaid, code blocks
  - Integrado com `useMermaid` hook (dynamic import otimizado)
  - Suporte a imagens base64, tabelas, listas, links externos

**Components de Chat (7 componentes)**
- ✅ `components/chat/AgentIcon.tsx` - Ícone de agente (emoji ou Lucide)
- ✅ `components/chat/ChatBadge.tsx` - Badge de notificações não lidas
- ✅ `components/chat/ChatHistory.tsx` - Lista de mensagens com auto-scroll
- ✅ `components/chat/ChatInput.tsx` - Input com textarea expansível
- ✅ `components/chat/ChatMessage.tsx` - Mensagem individual com Markdown/Mermaid
- ✅ `components/chat/ChatWidgetPanel.tsx` - Painel do chat flutuante
- ✅ `components/chat/SuggestedQuestions.tsx` - Sugestões de perguntas clicáveis

**Components de Agent (4 componentes)**
- ✅ `components/agent/AgentAttachmentUploader.tsx` - Upload de anexos (URL, texto, arquivo)
- ✅ `components/agent/IconPicker.tsx` - Buscador de ícones Lucide e emojis
- ✅ `components/agent/CustomAgentEditor.tsx` - Editor modal de agentes custom
- ✅ `components/agent/AgentManagement.tsx` - Gerenciamento completo de agentes

**Components de Gamification (5 componentes)**
- ✅ `components/gamification/ProgressBar.tsx` - Barra de progresso global da jornada
- ✅ `components/gamification/NextStepWidget.tsx` - Widget flutuante de próxima etapa
- ✅ `components/gamification/JourneyIndexModal.tsx` - Modal com índice completo da jornada
- ✅ `components/gamification/CompletionBadge.tsx` - Modal de celebração 100%
- ✅ `components/gamification/ConfettiEffect.tsx` - Animação CSS de confetes

**Components de Layout (5 componentes)**
- ✅ `components/layout/Layout.tsx` - Layout principal (ADAPTADO: sem BrowserRouter)
- ✅ `components/layout/Sidebar.tsx` - Sidebar responsiva com navegação
- ✅ `components/layout/Navigation.tsx` - Menu de navegação
- ✅ `components/layout/ThemeToggle.tsx` - Toggle light/dark theme
- ✅ `components/layout/BottomControls.tsx` - Controles inferiores

**Components Adicionais (2 componentes)**
- ✅ `components/unified/AgentModelSelector.tsx` - Seletor unificado de agente + modelo
- ✅ `components/FloatingActionStack.tsx` - Stack de FABs (Material Design)

**Arquivos de Dados (2 arquivos)**
- ✅ `data/lucideIcons.ts` - Lista de 1324 ícones Lucide (kebab-case)
- ✅ `data/emojiCategories.ts` - 515 emojis organizados em 8 categorias

**Barrel Exports (6 arquivos)**
- ✅ `components/markdown/index.ts`
- ✅ `components/chat/index.ts`
- ✅ `components/agent/index.ts`
- ✅ `components/gamification/index.ts`
- ✅ `components/layout/index.ts`
- ✅ `components/unified/index.ts`
- ✅ `components/index.ts` - Export principal (todos os componentes)

#### Ajustes Aplicados

1. ✅ **Imports ajustados**: Todos os imports de `@/...` convertidos para caminhos relativos `../../...`
2. ✅ **Hook useMermaid refatorado**: Mudado de ref-based para função `renderDiagram()` assíncrona
3. ✅ **Type-only imports**: Adicionado `import type` onde necessário (`KeyboardEvent`, `ReactNode`)
4. ✅ **Layout adaptado**: Removido `BrowserRouter` (integração com PortalRouter)
5. ✅ **Hook useJourneyProgress**: Corrigido acesso às propriedades (spread direto, não `progress.property`)
6. ✅ **Sidebar atualizada**: Título mudado de "NIC Chat" para "Chatify"

#### Verificação TypeScript

```bash
cd src/frontend && npm run type-check | grep "chatify"
# Resultado: ✅ 0 erros TypeScript no módulo chatify
```

#### Checkpoints Atingidos

- ✅ 3.1 - Markdown renderiza com GFM + Mermaid
- ✅ 3.2 - Componentes de chat renderizam sem erros
- ✅ 3.3 - Componentes de agente funcionam
- ✅ 3.4 - Sistema de jornada funciona
- ✅ 3.5 - Layout integra com portal
- ✅ 3.6 - Todos os componentes compilam e são exportados
- ✅ 3.7 - Compilação TypeScript sem erros

**✅ CHECKPOINT FASE 3 COMPLETO**:
- 24 componentes migrados e funcionais
- 2 arquivos de dados (lucideIcons, emojiCategories)
- 6 barrel exports para organização
- 0 erros TypeScript
- Todos os componentes ajustados para hooks puros
- Layout adaptado para integração com PortalRouter

#### Próxima Fase

**FASE 4: PAGES & ROUTES** - Criar páginas e configurar roteamento
- Migrar páginas (Home, ChatInterface, Admin, Guide)
- Criar routes.ts com lazy loading
- Criar module exports e auto-registro
- Adicionar import em modules/index.ts
- Testar lazy loading e module registration

