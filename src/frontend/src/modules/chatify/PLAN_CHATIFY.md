# PLAN_CHATIFY.md - Migração do NIC Chat para Módulo Chatify

**Objetivo**: Migrar aplicação standalone NIC Chat (`examples/chat/`) para módulo plugável da plataforma, preservando todas as funcionalidades (chat com IA, streaming SSE, sistema de agentes, gamificação/jornada, renderização Markdown+Mermaid) e adaptando persistência de localStorage para JQEL.

---

## =Ë RESUMO EXECUTIVO

### Problemas Identificados
1. L **Módulo vazio**: Apenas 3% completo (manifest, types, MIGRATION.md) - faltam ~74 arquivos
2. L **Persistência inadequada**: Original usa localStorage para mensagens/conversas - precisa migrar para JQEL
3. L **Contexts não compatíveis**: Aplicação usa 5 React Contexts - plataforma usa hooks puros
4.   **Bundle size**: Mermaid library (442KB) sem otimização - precisa dynamic import

### Solução (Baseada em Padrões)
-  **Migração incremental**: Services ’ Hooks ’ Components ’ Pages ’ Routes (5 fases)
-  **JQEL para dados**: chatService adaptado para useJQELQuery/Mutation (schema: 'chatify')
-  **Hooks puros**: Contexts convertidos para hooks customizados com storage service
-  **Lazy loading**: Todas as páginas e Mermaid com React.lazy() / dynamic import

---

## <¯ FASE 1: STORAGE & SERVICES

### 1.1. Migrar Storage System

- [ ] Copiar `examples/chat/src/services/storage/` ’ `chatify/services/storage/`
  - [ ] `index.ts`
  - [ ] `StorageDriver.ts` (interface)
  - [ ] `LocalStorageDriver.ts` (implementação)
  - [ ] `storageService.ts` (facade com debounce 300ms)
  - [ ] `README.md`
- [ ]  **Checkpoint**: Storage service compila sem erros

### 1.2. Migrar Services Básicos

- [ ] Copiar `examples/chat/src/services/agentParser.ts` ’ `chatify/services/`
  - [ ] Ajustar imports de tipos para `../types`
- [ ] Copiar `examples/chat/src/services/agentService.ts` ’ `chatify/services/`
  - [ ] Ajustar imports de tipos
  - [ ] Manter uso de localStorage para agentes custom (não é dado persistente)
- [ ] Copiar `examples/chat/src/services/providerService.ts` ’ `chatify/services/`
  - [ ] Ajustar path do JSON config para `/config/chatify-providers.json`
- [ ]  **Checkpoint**: Services básicos compilam e funções são exportadas

### 1.3. Adaptar chatService para JQEL

- [ ] Criar `chatify/services/chatService.ts` NOVO (não copiar)
  - [ ] Implementar `loadConversation()` usando JQEL query
  - [ ] Implementar `saveConversation()` usando JQEL mutation
  - [ ] Implementar `updateConversation()` usando JQEL mutation
  - [ ] Implementar `clearHistory()` usando JQEL mutation
  - [ ] Manter interface compatível com original
- [ ]  **Checkpoint**: chatService usa JQEL e exporta todas as funções

**Leitura de Referência**:
- `spec/SPEC-data-access.md` - JQEL integration patterns
- `spec/SPEC-jqel-syntax.md` - Query syntax
- `src/frontend/src/modules/chat/` - Exemplo de módulo usando JQEL

**Código de Referência**:
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

### 1.4. Migrar Services de Integração

- [ ] Copiar `examples/chat/src/services/aiChatService.ts` ’ `chatify/services/`
  - [ ] Ajustar imports de tipos
  - [ ] Verificar SSE streaming (N8N + OpenAI parsers)
  - [ ] Manter AbortController para cancelamento
- [ ] Copiar `examples/chat/src/services/n8nChatService.ts` ’ `chatify/services/`
  - [ ] Ajustar imports de tipos
  - [ ] Verificar integração com N8N
- [ ]  **Checkpoint**: Services de integração funcionam com SSE streaming

### 1.5. Testar Fase 1 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Storage Service**
  - [ ] Executar `storageService.set('test-key', { value: 'test' })`
  - [ ] Executar `storageService.get('test-key')`
  - [ ]  **Verificar**: Retorna objeto salvo após debounce (300ms)

- [ ] **Teste 2: Chat Service com JQEL**
  - [ ] Executar `saveConversation([mockMessage])`
  - [ ] Executar `loadConversation()`
  - [ ]  **Resultado**: Mensagem persistida via JQEL

- [ ] **Teste 3: Agent Service**
  - [ ] Executar `agentService.getAvailableAgents()`
  - [ ]  **Resultado**: Retorna agentes built-in + N8N-discovered + custom

** CHECKPOINT FASE 1**: Services funcionam, chatService usa JQEL, storage system operacional

---

## <¯ FASE 2: HOOKS

### 2.1. Converter ChatContext ’ useChatify

- [ ] Criar `chatify/hooks/useChatify.ts`
  - [ ] REMOVER toda lógica de Context/Provider
  - [ ] Implementar hook que usa `useJQELQuery` para carregar mensagens
  - [ ] Implementar hook que usa `useJQELMutation` para salvar/atualizar/deletar
  - [ ] Manter interface pública compatível (sendMessage, clearHistory, etc.)
  - [ ] Adicionar estado local para mensagens em memória (cache)
  - [ ] Implementar optimistic updates (adicionar mensagem antes de confirmar)
- [ ]  **Checkpoint**: useChatify retorna mesmas propriedades que ChatContext

**Leitura de Referência**:
- `examples/chat/src/contexts/ChatContext.tsx` - Lógica original
- `spec/SPEC-data-access.md` - useJQELQuery/Mutation patterns

**Código de Referência**:
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
    // Implementação com optimistic update
  }

  return { messages, sendMessage, isLoading, ... }
}
```

### 2.2. Converter Outros Contexts para Hooks

- [ ] Criar `chatify/hooks/useJourneyProgress.ts`
  - [ ] Converter `JourneyProgressContext.tsx` para hook
  - [ ] Usar `storageService` para persistência
  - [ ] Manter tracking automático de páginas visitadas
  - [ ] Manter cálculo de porcentagem de conclusão
- [ ] Criar `chatify/hooks/useTheme.ts`
  - [ ] Converter `ThemeContext.tsx` para hook
  - [ ] Usar `localStorage` direto (preferência de UI)
  - [ ] Manter auto-detecção com `matchMedia('prefers-color-scheme')`
- [ ] Criar `chatify/hooks/useSidebar.ts`
  - [ ] Converter `SidebarContext.tsx` para hook
  - [ ] Usar `localStorage` para persistência (desktop only)
  - [ ] Adicionar listener de resize para detecção mobile
- [ ] Criar `chatify/hooks/useNextStepWidget.ts`
  - [ ] Converter `NextStepWidgetContext.tsx` para hook
  - [ ] Usar `storageService` para estado de visibilidade
- [ ]  **Checkpoint**: Todos os hooks compilam e retornam interface esperada

### 2.3. Migrar Hooks Utilitários

- [ ] Copiar `examples/chat/src/hooks/` ’ `chatify/hooks/`
  - [ ] `useAgents.ts` - gerenciamento de agentes
  - [ ] `useModels.ts` - gerenciamento de modelos IA
  - [ ] `useChatWidget.ts` - estado do widget flutuante
  - [ ] `useJourneyContent.ts` - carregamento de conteúdo markdown
  - [ ] `useMermaid.ts` - renderização de diagramas
  - [ ] `useAutoScroll.ts` - scroll automático em chat
- [ ] Renomear `useChat.ts` ’ (não migrar, substituído por useChatify.ts)
- [ ] Ajustar todos os imports de tipos para `../types`
- [ ]  **Checkpoint**: Todos os hooks utilitários compilam

### 2.4. Testar Fase 2 Completa

**Checklist de Testes**:
- [ ] **Teste 1: useChatify**
  - [ ] Renderizar componente que usa `useChatify()`
  - [ ] Executar `sendMessage('Test')`
  - [ ]  **Verificar**: Mensagem aparece na lista e é persistida via JQEL

- [ ] **Teste 2: useJourneyProgress**
  - [ ] Renderizar componente que usa `useJourneyProgress()`
  - [ ] Marcar etapa como visitada
  - [ ]  **Resultado**: Progresso atualizado e persistido em localStorage

- [ ] **Teste 3: useTheme**
  - [ ] Renderizar componente que usa `useTheme()`
  - [ ] Alternar tema (light/dark)
  - [ ]  **Resultado**: CSS custom properties atualizadas, preferência salva

** CHECKPOINT FASE 2**: Hooks funcionam, contexts removidos, JQEL integrado

---

## <¯ FASE 3: COMPONENTS

### 3.1. Components de Markdown

- [ ] Criar `chatify/components/markdown/`
  - [ ] Copiar `MarkdownContent.tsx` de `examples/chat/`
  - [ ] Ajustar imports
  - [ ] Verificar dependências (react-markdown, remark-gfm, rehype-raw)
- [ ] Otimizar carregamento de Mermaid
  - [ ] Modificar `useMermaid.ts` para usar dynamic import
  - [ ] Carregar mermaid library apenas quando necessário
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
  - [ ] `Layout.tsx` - ADAPTAR para integração com portal
  - [ ] `Sidebar.tsx` - usa useSidebar
  - [ ] `Navigation.tsx`
  - [ ] `ThemeToggle.tsx` - usa useTheme
  - [ ] `BottomControls.tsx`
- [ ] Remover BrowserRouter de Layout (portal já tem router)
- [ ]  **Checkpoint**: Layout integra com portal

### 3.6. Components Adicionais

- [ ] Criar `chatify/components/unified/`
  - [ ] Copiar `AgentModelSelector.tsx`
- [ ] Copiar `chatify/components/FloatingActionStack.tsx`
- [ ] Criar barrel exports em `chatify/components/index.ts`
- [ ]  **Checkpoint**: Todos os componentes compilam e são exportados

### 3.7. Testar Fase 3 Completa

**Checklist de Testes**:
- [ ] **Teste 1: ChatHistory + ChatInput**
  - [ ] Renderizar componentes
  - [ ] Enviar mensagem
  - [ ]  **Verificar**: Mensagem aparece no histórico com Markdown renderizado

- [ ] **Teste 2: ProgressBar + Journey**
  - [ ] Navegar entre páginas da jornada
  - [ ]  **Resultado**: Barra de progresso atualiza, etapas marcadas como visitadas

- [ ] **Teste 3: Theme Toggle**
  - [ ] Clicar no toggle de tema
  - [ ]  **Resultado**: Interface muda de light/dark

** CHECKPOINT FASE 3**: Componentes renderizam, hooks funcionam, UI completa

---

## <¯ FASE 4: PAGES & ROUTES

### 4.1. Migrar Pages

- [ ] Criar `chatify/pages/`
  - [ ] Copiar `Home.tsx` - landing page
  - [ ] Copiar `Chat.tsx` ’ renomear para `ChatInterface.tsx`
  - [ ] Copiar `Admin.tsx` - configurações de agentes
  - [ ] Copiar `Guide.tsx` - guia da jornada
- [ ] Ajustar imports em todas as páginas
- [ ] Substituir `useChat()` por `useChatify()`
- [ ] Remover qualquer referência a `useContext`
- [ ]  **Checkpoint**: Páginas compilam sem erros

### 4.2. Criar Routes com Lazy Loading

- [ ] Criar `chatify/routes.ts`
  - [ ] Definir rotas com `React.lazy()` para cada página
  - [ ] Rota `/` ’ Home (lazy)
  - [ ] Rota `/chat` ’ ChatInterface (lazy)
  - [ ] Rota `/admin` ’ Admin (lazy)
  - [ ] Rota `/guide` ’ Guide (lazy)
- [ ]  **Checkpoint**: Routes definidas corretamente

**Código de Referência**:
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
- [ ]  **Checkpoint**: Módulo exporta tudo e auto-registra

**Código de Referência**:
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
- [ ]  **Checkpoint**: Módulo aparece no ModuleRegistry

### 4.5. Testar Fase 4 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Lazy Loading de Páginas**
  - [ ] Inspecionar Network tab ao navegar entre rotas
  - [ ]  **Verificar**: Cada página carrega chunk JS separado

- [ ] **Teste 2: Module Registration**
  - [ ] Console: `moduleRegistry.getModule('chatify')`
  - [ ]  **Resultado**: Retorna manifest e routes

- [ ] **Teste 3: Portal Integration**
  - [ ] Ativar chatify em um portal via setup
  - [ ] Acessar rota do chatify
  - [ ]  **Resultado**: Página renderiza dentro do portal

** CHECKPOINT FASE 4**: Páginas funcionam, routes lazy-loaded, módulo registrado

---

## <¯ FASE 5: ASSETS, DATA & POLISH

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

### 5.4. Configuração de Providers

- [ ] Copiar `examples/chat/public/config/ai-providers.json`
  - [ ] Para `public/config/chatify-providers.json`
- [ ] Ajustar `providerService.ts` para apontar para novo path
- [ ]  **Checkpoint**: Providers carregam corretamente

### 5.5. Adicionar Dependências

- [ ] Verificar `package.json` da plataforma
  - [ ] Se não estiver, adicionar: `react-markdown@^10.1.0`
  - [ ] Se não estiver, adicionar: `remark-gfm@^4.0.1`
  - [ ] Se não estiver, adicionar: `rehype-raw@^7.0.0`
  - [ ] Se não estiver, adicionar: `mermaid@^11.12.0`
  - [ ] Se não estiver, adicionar: `gray-matter@^4.0.3`
  - [ ] Se não estiver, adicionar: `date-fns@^3.x`
- [ ] Executar `npm install`
- [ ]  **Checkpoint**: Dependências instaladas

### 5.6. Testar Fase 5 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Assets Carregam**
  - [ ] Renderizar página com logos NIC
  - [ ]  **Verificar**: Logos light/dark aparecem corretamente

- [ ] **Teste 2: Journey Content**
  - [ ] Abrir página Guide
  - [ ] Navegar entre etapas da jornada
  - [ ]  **Resultado**: Conteúdo markdown carrega e renderiza

- [ ] **Teste 3: Emoji/Icon Pickers**
  - [ ] Abrir CustomAgentEditor
  - [ ] Abrir IconPicker
  - [ ]  **Resultado**: Categorias de emojis e ícones Lucide aparecem

** CHECKPOINT FASE 5**: Assets, data e utils funcionam, dependências instaladas

---

## <¯ FASE 6: TESTES INTEGRADOS

### 6.1. Teste: Chat Completo com IA

- [ ] Abrir página ChatInterface
- [ ] Selecionar agente NIC
- [ ] Enviar mensagem "Olá"
- [ ]  **Verificar**: Resposta do agente com streaming SSE
- [ ]  **Verificar**: Markdown renderizado (negrito, código, listas)
- [ ]  **Verificar**: Mensagens persistidas via JQEL

### 6.2. Teste: Sistema de Agentes

- [ ] Abrir página Admin
- [ ] Verificar agentes built-in (da .env)
- [ ] Verificar agentes N8N-discovered
- [ ] Criar agente custom
- [ ]  **Verificar**: Agente custom salvo em localStorage
- [ ] Selecionar agente custom no chat
- [ ]  **Verificar**: Chat funciona com agente custom

### 6.3. Teste: Sistema de Jornada

- [ ] Abrir página Home
- [ ]  **Verificar**: Barra de progresso aparece (0%)
- [ ] Navegar todas as 14 etapas (Home ’ Guide ’ etapas)
- [ ]  **Verificar**: Progresso atualiza até 100%
- [ ]  **Verificar**: Badge de conclusão + confetes ao completar
- [ ] Recarregar página
- [ ]  **Verificar**: Progresso mantido (localStorage)

### 6.4. Teste: Widget Flutuante

- [ ] Abrir qualquer página
- [ ] Clicar no FAB principal
- [ ]  **Verificar**: Widget de chat abre
- [ ] Enviar mensagem no widget
- [ ]  **Verificar**: Mensagem aparece no widget
- [ ] Minimizar widget
- [ ]  **Verificar**: Badge de notificações aparece

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
- [ ]  **Verificar**: Logos mudam (dark ’ light)
- [ ] Recarregar página
- [ ]  **Verificar**: Tema dark mantido

### 6.7. Teste: Markdown + Mermaid

- [ ] Enviar mensagem com código:
  ```
  **Negrito** e *itálico*

  ` ```javascript
  const x = 1
  ` ```

  ` ```mermaid
  graph TD
  A-->B
  ` ```
  ```
- [ ]  **Verificar**: Negrito e itálico renderizados
- [ ]  **Verificar**: Code block com syntax highlighting
- [ ]  **Verificar**: Diagrama Mermaid renderizado

** CHECKPOINT FASE 6**: Sistema completo funciona end-to-end

---

## =Ý NOTAS DE IMPLEMENTAÇÃO

### Decisões Arquiteturais

- **JQEL para Mensagens**: Mensagens e conversas migradas de localStorage para JQEL (schema: 'chatify') para persistência real e suporte a múltiplos dispositivos. localStorage mantido apenas para preferências de UI.

- **Hooks Puros**: Contexts removidos para aderir ao padrão da plataforma. Cada hook gerencia seu próprio estado usando storage service ou JQEL, sem necessidade de Providers.

- **Lazy Loading**: Todas as páginas e Mermaid library com dynamic import para otimizar bundle size (~316KB gzip inicial, Mermaid carrega sob demanda).

- **Backend Separado**: Express backend mantido como microserviço separado (não parte do módulo frontend) com rotas prefixadas `/api/chatify/*` para proxy de APIs externas (NIC, OpenAI).

### Limitações Conhecidas

- **Mermaid Bundle Size**: Library de 442KB é grande mesmo com dynamic import
  - Mitigação: Carregado apenas quando diagrama detectado no markdown
  - Alternativa futura: Substituir por biblioteca menor ou renderizar server-side

- **XSS em Markdown**: rehype-raw permite HTML bruto nas mensagens
  - Mitigação: Sanitizar mensagens de usuários antes de renderizar (DOMPurify)
  - Alternativa futura: Remover rehype-raw e desabilitar HTML inline

- **N8N Cache**: Agentes N8N descobertos tem cache de 5min, pode estar desatualizado
  - Mitigação: Botão de refresh manual já implementado
  - Alternativa futura: WebSocket para notificações de mudanças em tempo real

- **localStorage Sync**: Storage events não funcionam na mesma aba
  - Mitigação: Cada aba mantém estado independente
  - Alternativa futura: BroadcastChannel API para sync cross-tab

### Referências

- `examples/chat/` - Projeto original standalone
- `spec/SPEC-data-access.md` - JQEL integration patterns
- `spec/SPEC-jqel-syntax.md` - JQEL query syntax
- `spec/SPEC-modules.md` - Module system design
- `spec/SPEC-routing.md` - Lazy loading patterns
- `src/frontend/src/modules/chat/` - Módulo de referência usando JQEL
- `chatify/MIGRATION.md` - Documentação detalhada da migração
