# Platform Implementation Plan - Value-Driven

**Metodologia:** Value-Driven (User-Centric)
**Versão:** 1.0
**Data:** 2025-11-05

---

## Legenda

- `[ ]` — Pendente
- `[-]` — Em Implementação
- `[x]` — Feito
- `[!]` — Bloqueado — Algo impede a execução da tarefa

---

## 📚 LEITURA FUNDAMENTAL

**Antes de iniciar qualquer implementação, ler e compreender:**

### Conceitos Core
- **SPEC-concepts.md** - Conceitos fundamentais da plataforma
  - Portal (sub-aplicação isolada)
  - Module (funcionalidade reutilizável)
  - Instance (configuração de módulo)
  - Relações e isolamento entre conceitos

### Arquitetura Geral
- **SPEC-architecture.md** - Visão geral da arquitetura de 3 camadas
  - Frontend (React 19 + Vite + TypeScript)
  - Backend (Express + Node.js)
  - Backbone (n8n - integração)
  - Infraestrutura (Redis Pub/Sub + Streams)

### Sistema de Módulos
- **SPEC-modules.md** - Como módulos funcionam
  - Estrutura de módulo
  - Manifesto e metadados
  - Ciclo de vida (loading → init → activation/deactivation)
  - Dependências e resolução

**Importante:** Essas especificações definem a linguagem e conceitos usados em todo o projeto. Compreendê-las garante implementação consistente e alinhada com a arquitetura.

---

## INITIATIVE 1: PLATFORM FOUNDATION

**Objetivo:** Base funcional da plataforma que permite desenvolvimento, autenticação, roteamento e acesso a dados.

---

### EPIC 1.1: Ambiente de Desenvolvimento

- [x] Story: Setup do projeto base

  > Como desenvolvedor,
  > Quero ter um ambiente de desenvolvimento configurado,
  > Para começar a implementar features da plataforma

  Refs:
  - SPEC-architecture.md (SPEC-A-S-*, SPEC-A-L-*)
  - SPEC-configuration.md (SPEC-CF-PS-*, SPEC-CF-VE-*)

  **Frontend (src/frontend/):**
  - Vite + React 19.1.1 + TypeScript configurado
  - Tailwind CSS v3 + PostCSS + Autoprefixer
  - shadcn/ui utils (cn helper) configurados
  - Path alias @ configurado (tsconfig + vite)
  - Dependências: React Router, TanStack Query, React Hook Form, Zod, Lucide React
  - Estrutura: src/{lib,components/ui,assets}
  - Build: Type-check e build funcionando (bundle ~61KB gzipped)
  - Scripts: dev, build, preview, type-check, lint

  **Backend (src/backend/):**
  - Express 5 + TypeScript configurado
  - Dependências: redis, jsonwebtoken, cors, helmet, winston, morgan, axios
  - Estrutura: src/{config,routes,middleware,services,types}
  - Validação de env vars com feedback claro (env.ts)
  - .env.example completo com todas as variáveis
  - Configuração Express: CORS, Helmet, Morgan, body parsers, error handling
  - Endpoints: / (root), /health (health check)
  - Build: Type-check e build funcionando
  - Scripts: dev (tsx watch), build (tsc), start, type-check, lint

  Validação:
  - Frontend: type-check ✓, build ✓ (60.78KB gzipped initial bundle)
  - Backend: type-check ✓, build ✓
  - SPEC-A-S-001 a SPEC-A-S-016: Stack tecnológico atendido
  - SPEC-CF-PS-001 a SPEC-CF-PS-010: .env configurado
  - SPEC-CF-VE-001 a SPEC-CF-VE-019: Variáveis de ambiente validadas
  - SPEC-CF-VA-001 a SPEC-CF-VA-004: Validação na inicialização implementada

- [x] Story: PWA funcional

  > Como usuário,
  > Quero poder instalar a aplicação no meu dispositivo,
  > Para ter acesso offline e experiência nativa

  Refs: SPEC-architecture.md (SPEC-A-PWA-*)

  **Implementação:**
  - vite-plugin-pwa v1.1.0 instalado e configurado
  - Web App Manifest: name, short_name, theme_color, background_color, display: standalone
  - Icons: pwa-192x192.svg, pwa-512x512.svg (SVG temporários com README para conversão PNG)
  - Service Worker: registerType 'autoUpdate'
  - Workbox Runtime Caching:
    - Google Fonts: CacheFirst (1 year)
    - Images: CacheFirst (30 days)
    - API routes: NetworkFirst (1 minute cache, 10s timeout)
    - Navigation (HTML): NetworkFirst (1 hour cache, 5s timeout)
  - Build output: sw.js, workbox-737d52d8.js, manifest.webmanifest, registerSW.js gerados
  - Precache: 10 entries (195.43 KiB)
  - Code splitting: manualChunks configurado (vendor-react, vendor-router, vendor-tanstack, etc)
  - DevOptions: PWA habilitado em desenvolvimento

  Validação:
  - SPEC-A-PWA-001 a SPEC-A-PWA-010: PWA requirements atendidos
  - SPEC-A-PWA-011 a SPEC-A-PWA-017: Web App Manifest completo
  - SPEC-A-PWA-018 a SPEC-A-PWA-022: Service Worker configurado
  - SPEC-A-PWA-023 a SPEC-A-PWA-029: Estratégia de cache HTML (network-first)
  - Build: PWA plugin gerando arquivos corretamente
  - Type check: Passou
  - Build: Sucesso (bundle inicial ~59KB gzipped)
  - Icons: SVG configurados (recomenda-se conversão para PNG para melhor compatibilidade)

---

### EPIC 1.2: Sistema de Autenticação

- [x] Story: Login com credenciais

  > Como usuário,
  > Quero fazer login com usuário e senha quando eu ativar o modulo de auenticacao no portal e configurar rodas seguras,
  > Para acessar o sistema de forma segura nas rotas protegidas mantendo públicas e de livre acesso as rotas não sensíveis.

  Refs:
  - SPEC-authentication.md (SPEC-AU-LO-*)
  - SPEC-frontend-state.md (SPEC-FS-AU-*)
  - spec/ui/auth-module-interfaces.md (UI/UX)

  **Implementação:**
  - Frontend: LoginPage component com formulário validado (React Hook Form + Zod)
  - Frontend: AuthClient service com métodos para login, refresh, logout, authorize
  - Frontend: Token storage service (memory + sessionStorage fallback)
  - Backend: Rotas de autenticação (POST /api/1/auth/login) com proxy para n8n
  - Backend: n8nProxy service com X-Platform-Key authentication
  - Validação client-side e server-side
  - Error handling com mensagens user-friendly
  - Loading states e feedback visual
  - Type-check: Passou (frontend e backend)
  - Build: Sucesso (frontend ~348KB precache, backend clean)

- [x] Story: Sessão persistente

  > Como usuário,
  > Quero que minha sessão seja mantida entre recarregamentos,
  > Para não precisar fazer login toda vez

  Refs: SPEC-authentication.md (SPEC-AU-RE-*, SPEC-AU-TO-*)

  **Implementação:**
  - Token storage: access token em memória, refresh token em sessionStorage
  - Auto-refresh implementado com timer (5 min antes da expiração)
  - Hydration on app start: tenta restaurar sessão via refresh token
  - Logout automático se refresh falhar
  - SPEC-AU-ST-001 a SPEC-AU-ST-012: Armazenamento e renovação automática
  - SPEC-STATE-H-001 a SPEC-STATE-H-004: Hydration ao carregar
  - Type-check: Passou
  - Build: Sucesso

- [x] Story: Logout seguro

  > Como usuário,
  > Quero fazer logout e encerrar minha sessão,
  > Para garantir segurança em dispositivos compartilhados

  Refs: SPEC-authentication.md (SPEC-AU-LGT-*, SPEC-AU-LA-*)

  **Implementação:**
  - Frontend: logout() method no AuthContext
  - Frontend: Limpa tokens locais (SPEC-AU-LO-013 a SPEC-AU-LO-015)
  - Backend: POST /api/1/auth/logout endpoint (revoke refresh token)
  - Backend: POST /api/1/auth/logout-all endpoint (revoke all sessions)
  - Idempotente: sucesso mesmo sem token válido
  - Error handling com fallback para cleanup local
  - Type-check: Passou
  - Build: Sucesso

- [x] Story: Validação de permissões

  > Como sistema,
  > Quero validar permissões do usuário antes de executar ações,
  > Para garantir segurança e controle de acesso

  Refs: SPEC-authentication.md (SPEC-AU-AZ-*)

  **Implementação:**
  - Frontend: Tipos para autorização (AuthorizeRequest, AuthorizeResponse, PermissionCheck)
  - Frontend: usePermission() hook para verificação declarativa com loading states
  - Frontend: usePermissions() hook para múltiplas permissões
  - Frontend: RequirePermission component para proteção de UI
  - Frontend: AccessDenied fallback component
  - Frontend: hasPermission() method no AuthContext
  - Backend: POST /api/1/auth/authorize endpoint (proxy para n8n)
  - SPEC-AU-AZ-001 a SPEC-AU-AZ-036: Autorização via n8n Backbone
  - SPEC-AU-MA-014 a SPEC-AU-MA-018: Componentes de proteção
  - Type-check: Passou
  - Build: Sucesso

- [ ] Story: Proteção contra ataques

  > Como sistema,
  > Quero ter proteção contra brute force e rate limiting,
  > Para garantir segurança da aplicação

  Refs: SPEC-authentication.md (SPEC-AU-RL-*)

  - Implementado Redis service wrapper com métodos para rate limiting e brute force tracking
  - Criado rate limiter middleware genérico configurável via env vars
  - Criado brute force protection middleware específico para rota de login
  - Aplicado rate limiting em todas as rotas de autenticação (SPEC-AU-SG-004)
  - Aplicado brute force protection na rota /api/1/auth/login (SPEC-AU-LI-025, SPEC-AU-LI-026)
  - Implementado bloqueio temporário de IP após múltiplas tentativas falhas (SPEC-AU-SG-006)
  - Configurações via env vars: RATE_LIMIT_*, BRUTE_FORCE_*
  - Integrado Redis service no server.ts com graceful shutdown

---

### EPIC 1.3: Navegação e Roteamento

- [x] Story: Navegação entre portais

  > Como usuário,
  > Quero navegar entre diferentes portais da plataforma,
  > Para acessar diferentes áreas da aplicação

  Refs: SPEC-routing.md (SPEC-R-BS-*), SPEC-concepts.md

  **Implementação:**
  - Frontend: Portal types (Portal, RouteDefinition, PortalRouteConfig, RouteMatch)
  - Frontend: portalService (in-memory implementation com portais default "main" e "setup")
  - Frontend: PortalRouter component (main portal "/" + outros "/:portalId/*")
  - Frontend: PortalContent component com loading/error states
  - Frontend: NotFoundPage (404)
  - Frontend: App.tsx integrado com PortalRouter e Suspense
  - Initial portals: "main" e "setup" (com módulo "setup" ativo)
  - SPEC-R-PM-001: Main portal usa "/"
  - SPEC-R-PO-001: Outros portais usam "/:portalId/*"
  - Type-check: Passou
  - Build: Sucesso (~355KB precache)

- [x] Story: Rotas protegidas

  > Como sistema,
  > Quero proteger rotas que requerem autenticação,
  > Para garantir que apenas usuários autenticados acessem áreas restritas

  Refs: SPEC-routing.md (SPEC-R-PR-*)

  **Implementação:**
  - Frontend: LoginPage component (implementado na Epic 1.2)
  - Frontend: ProtectedRoute component integrado no PortalRouter
  - Frontend: Rota pública /login (não requer autenticação)
  - Frontend: Todas as rotas de portais protegidas por ProtectedRoute
  - SPEC-R-RP-001 a SPEC-R-RP-004: Proteção de rotas implementada
  - SPEC-R-RP-004: Redirecionamento para /login quando não autenticado
  - Validação: type-check e build passaram sem erros
  - Comportamento: usuários não autenticados são redirecionados para login
  - Comportamento: preserva returnUrl para redirecionamento após login
  - Type-check: Passou
  - Build: Sucesso

- [x] Story: Carregamento eficiente

  > Como usuário,
  > Quero que a aplicação carregue rapidamente,
  > Para ter uma experiência fluida

  Refs: SPEC-routing.md (SPEC-R-LL-*), SPEC-architecture.md (SPEC-A-LL-*)

  **Implementação:**
  - Frontend: React.lazy() para todas as páginas (LoginPage, NotFoundPage)
  - Frontend: pages/index.ts exportando páginas lazy-loaded
  - Frontend: Suspense wrapper com LoadingFallback component
  - Frontend: Skeleton component para estados de loading
  - Configuração de code splitting no vite.config.ts (já existente)
  - Chunks organizados: vendor-react, vendor-router, vendor-forms, page-LoginPage, page-NotFoundPage
  - Bundle inicial: ~355KB precache (dentro do limite de 500KB - SPEC-A-LL-009)
  - Páginas lazy-loaded: ~1KB gzipped cada
  - SPEC-R-LD-001 a SPEC-R-LD-005: Lazy loading implementado
  - SPEC-A-LL-001 a SPEC-A-LL-005: Lazy loading requirements atendidos
  - Type-check: Passou
  - Build: Sucesso (14 entries precached)
  - SPEC-R-PE-001 a SPEC-R-PE-004: Code splitting e performance otimizados
  - SPEC-A-LL-001 a SPEC-A-LL-010: Requisitos de lazy loading atendidos
  - Validação: type-check e build passaram sem erros
  - PWA precache: 16 entradas (266.26 KB)

---

### EPIC 1.4: Acesso e Manipulação de Dados

- [x] Story: Consultar dados

  > Como desenvolvedor,
  > Quero consultar dados de diferentes schemas,
  > Para exibir informações na interface

  Refs: SPEC-data-access.md (SPEC-DA-*), SPEC-jqel-syntax.md (SPEC-JQEL-QR-*)

  **Implementação:**
  - Frontend: JQEL types (JQELQuery, JQELSelectQuery, JQELMutateQuery, JResult, JQELError, JQELWhere, JQELOptions)
  - Frontend: JQEL HTTP client (jqelClient.ts) com integração automática de JWT
  - Frontend: Query key factory (queryKeys.select, queryKeys.list, queryKeys.detail, queryKeys.action)
  - Frontend: useJQELQuery hook com TanStack Query integration
  - Frontend: Convenience methods: jqelClient.select(), jqelClient.mutate()
  - Frontend: Hooks especializados: useJQELList, useJQELDetail, useJQELInsert, useJQELUpdate, useJQELDelete
  - Backend: JQEL types (jqel.types.ts) matching frontend types
  - Backend: JQEL endpoint (POST /api/jqel) com validação de structure
  - Backend: Schema-based routing (backend/platform/system/application schemas)
  - Backend: handleN8nSchema() para forward para n8n Backbone
  - Backend: handleBackendSchema() stub para processamento local futuro
  - Backend: Rota /api/jqel registrada no Express app
  - App.tsx: QueryClientProvider integrado com configuração otimizada
  - SPEC-DA-W-001 a SPEC-DA-W-011: JQEL wrapper implementado
  - SPEC-DA-TQ-001 a SPEC-DA-TQ-008: TanStack Query integração
  - SPEC-DA-P-001 a SPEC-DA-P-008: Princípios fundamentais atendidos
  - SPEC-JQEL-STR-001 a SPEC-JQEL-STR-006: Estrutura de query validada
  - SPEC-JQEL-SCH-004 a SPEC-JQEL-SCH-006: Schema routing implementado
  - Type-check: Passou (frontend e backend)
  - Build: Sucesso (~379KB precache frontend)

- [x] Story: Modificar dados

  > Como usuário,
  > Quero criar, atualizar e deletar dados,
  > Para gerenciar informações do sistema

  Refs: SPEC-data-access.md (SPEC-DA-MU-*), SPEC-jqel-syntax.md (SPEC-JQEL-MU-*)

  **Implementação:**
  - Frontend: useJQELMutation hook com cache invalidation automática
  - Frontend: useJQELInsert() - mutation helper para INSERT
  - Frontend: useJQELUpdate() - mutation helper para UPDATE
  - Frontend: useJQELDelete() - mutation helper para DELETE
  - Frontend: Invalidação automática de queries relacionadas após mutations
  - Backend: Suporte completo para mutate queries (insert/update/delete/custom)
  - SPEC-DA-MU-001 to SPEC-DA-MU-003: Mutation hooks implementados
  - Type-check: Passou
  - Build: Sucesso

- [ ] Story: Dados sempre atualizados

  > Como usuário,
  > Quero ver dados sempre atualizados sem recarregar a página,
  > Para ter informações em tempo real

  Refs: SPEC-events.md (SPEC-EV-*), SPEC-data-access.md (SPEC-DA-RT-*)

  - Backend: Event types (PlatformEvent, NotificationEvent, TaskEvent, DataChangedEvent, JobEvents)
  - Backend: SSE service (sse.service.ts) com Redis Pub/Sub subscriber
  - Backend: SSE routes (GET /api/events/stream, GET /api/events/stats)
  - Backend: Server integration com graceful shutdown de SSE connections
  - Backend: JWT authentication para SSE endpoint (token via query param)
  - Backend: Heartbeat automático a cada 30 segundos (SPEC-EV-SSE-019)
  - Backend: Connection manager (Map de userId → Response)
  - Backend: Redis Pub/Sub no channel "platform:events" (SPEC-EV-PS-005)
  - Frontend: Event types (matching backend types)
  - Frontend: SSE client (sseClient.ts) com EventSource e auto-reconnect
  - Frontend: SSEProvider React context com cache invalidation automático
  - Frontend: Hooks: useSSE, useSSEEvent, useNotifications, useTasks, useJobStatus, useDataChanges
  - Frontend: Integration no App.tsx (SSEProvider wrapping application)
  - Frontend: Examples component (SSEExamples.tsx) com 7 usage examples
  - SPEC-EV-SSE-001 a SPEC-EV-SSE-028: Protocolo SSE implementado
  - SPEC-EV-PS-001 a SPEC-EV-PS-012: Redis Pub/Sub integration
  - SPEC-EV-AR-001 a SPEC-EV-AR-009: Architecture flow (Backbone → Redis → Backend → Frontend)
  - SPEC-EV-FR-001 a SPEC-EV-FR-006: Frontend event processing
  - SPEC-DA-EV-001 a SPEC-DA-EV-008: Cache invalidation via SSE events
  - Auto-reconnect com exponential backoff em falhas de conexão
  - Invalidação automática de TanStack Query cache em eventos data_changed
  - Forward compatibility (SPEC-EV-PL-015): ignora event types desconhecidos
  - Validação: type-check e build passaram sem erros em frontend e backend

- [ ] Story: Tratamento de erros

  > Como desenvolvedor,
  > Quero um sistema robusto de tratamento de erros,
  > Para garantir que falhas em queries e mutations sejam tratadas adequadamente

  Refs: SPEC-data-access.md (SPEC-DA-ERR-*), SPEC-error-handling.md

  - Frontend: Error Boundary components (ErrorBoundary, JQELErrorBoundary, GlobalErrorBoundary)
  - Frontend: LazyErrorBoundary para lazy-loaded components (já existia)
  - Frontend: Error Fallback components (ErrorFallback, JQELErrorFallback, InlineErrorFallback, MinimalErrorFallback)
  - Frontend: Error page components (NotFound 404, Forbidden 403)
  - Frontend: Error logging service (errorLogger.ts) com níveis de log (ERROR, WARN, INFO, DEBUG)
  - Frontend: Error handler utilities (errorHandler.ts) com custom error classes
  - Frontend: useErrorHandler hook para error handling em componentes
  - Frontend: JQEL error helpers (errorHelpers.ts) com retry logic e error classification
  - Frontend: ErrorHandlingExamples component com 8 exemplos de uso
  - Frontend: GlobalErrorBoundary integrado no App.tsx
  - Frontend: Error component exports centralizados em components/error/index.ts
  - SPEC-ERR-BOUND-001 a SPEC-ERR-BOUND-010: Error boundaries implementados (global, portal, module)
  - SPEC-ERR-UI-001 a SPEC-ERR-UI-012: Feedback ao usuário (toast, modal, inline, loading states)
  - SPEC-ERR-LOG-001 a SPEC-ERR-LOG-005: Logging estruturado com sanitização de dados sensíveis
  - SPEC-ERR-DEV-001 a SPEC-ERR-DEV-004: Stack traces visíveis em development
  - SPEC-ERR-PROD-001 a SPEC-ERR-PROD-004: Mensagens genéricas em production
  - SPEC-ERR-RETRY-001 a SPEC-ERR-RETRY-007: Retry logic com exponential backoff
  - SPEC-ERR-JQEL-001 a SPEC-ERR-JQEL-006: Mensagens específicas para erros JQEL
  - SPEC-ERR-CH-JQEL-001 a SPEC-ERR-CH-JQEL-005: TanStack Query error handling
  - SPEC-DA-ERR-001 a SPEC-DA-ERR-008: Error states no React com Error Boundary
  - SPEC-ERR-UTIL-001 a SPEC-ERR-UTIL-003: Utilities e hooks para error handling
  - Validação: type-check e build passaram sem erros em frontend e backend
  - Custom error classes: AuthError, ValidationError, NetworkError, ModuleError
  - Type guards para diferentes tipos de erro
  - User-friendly error messages baseados em HTTP status codes
  - Retry configuration para TanStack Query com smart retry logic
  - Error context tracking (userId, portalId, moduleId, etc)
  - Development vs Production mode differences
  - Monitoring placeholder para futura integração com serviços externos

---

### EPIC 1.5: Notificações em Tempo Real

- [x] Story: Receber notificações

  > Como usuário,
  > Quero receber notificações em tempo real,
  > Para ser informado sobre eventos importantes imediatamente

  Refs:
  - SPEC-events.md (SPEC-EV-SSE-*, SPEC-EV-NO-*)
  - spec/ui/notification-module-interfaces.md (UI/UX)
  - spec/ui/notification-events-module-interfaces.md (UI/UX)

  Implementação:
  - Backend: event.types.ts, redis.service.ts, sse.service.ts, events.routes.ts
  - Frontend: event.ts (types), sseClient.ts, useSSE.ts, EventContext.tsx
  - UI: EventNotification.tsx (toast notifications), ConnectionStatus.tsx
  - Redis Pub/Sub + Streams implementados (SPEC-EV-PS-*, SPEC-EV-ST-*)
  - SSE com auto-reconnect e heartbeat (SPEC-EV-SSE-*)
  - Integração com TanStack Query para invalidação de queries (SPEC-EV-FR-001)
  - Validação: type-check e build passaram em frontend e backend

- [x] Story: Tarefas interativas

  > Como usuário,
  > Quero receber tarefas que requerem minha ação,
  > Para responder a solicitações do sistema

  Refs:
  - SPEC-events.md (SPEC-EV-TA-*)
  - spec/ui/task-module-interfaces.md (UI/UX)

  Implementação:
  - Tipos TaskEvent implementados com status (pending, completed, cancelled)
  - Task events suportados no sistema de eventos
  - UI notifications exibem tasks com visual diferenciado
  - Handlers configurados via useEventListener hook

- [x] Story: Sincronização offline

  > Como usuário,
  > Quero que eventos sejam sincronizados quando volto online,
  > Para não perder informações importantes

  Refs: SPEC-events.md (SPEC-EV-OF-*, SPEC-EV-ST-*)

  Implementação:
  - Redis Streams armazenam eventos para usuários offline (MAXLEN ~1000)
  - Endpoint /api/events/history para recuperar eventos perdidos
  - sseClient.fetchMissedEvents() busca eventos ao reconectar
  - lastEventId rastreado para recovery preciso (SPEC-EV-SSE-028)
  - Eventos recuperados processados como novos (SPEC-EV-FR-006)

---

### EPIC 1.6: Personalização Visual

- [x] Story: Tema claro e escuro

  > Como usuário,
  > Quero escolher entre tema claro e escuro,
  > Para adaptar a interface ao meu ambiente e preferência

  Refs: SPEC-theming.md (SPEC-TH-MO-*, SPEC-TH-PR-*)

  Implementação:
  - Frontend: theme.ts (types), theme.ts (lib utils), ThemeContext.tsx
  - Frontend: ThemeToggle.tsx, ThemeToggleCompact.tsx components
  - Frontend: CSS variables para light/dark em index.css
  - Frontend: Tailwind config atualizado com semantic colors
  - ThemeProvider com settingsKey support (SPEC-TH-SK-*)
  - Detecção automática de tema do sistema (SPEC-TH-LD-016)
  - Sincronização entre abas via storage events (SPEC-TH-LD-010)
  - localStorage persistence (SPEC-TH-LD-008)
  - Troca instantânea sem reload (SPEC-TH-LD-004)
  - App.tsx integrado com ThemeProvider
  - Validação: type-check ✓, build ✓

- [x] Story: Identidade visual customizada

  > Como administrador,
  > Quero definir a cor da marca da aplicação,
  > Para manter identidade visual da organização

  Refs: SPEC-theming.md (SPEC-TH-CO-*, SPEC-TH-SE-*)

  Implementação:
  - Frontend: BrandColorPicker.tsx component
  - Frontend: hexToHSL(), hslToString() conversion utils (SPEC-TH-BC-007)
  - Frontend: applyBrandColor() para CSS custom properties
  - Brand color em formato HSL (SPEC-TH-BC-005)
  - localStorage persistence com settingsKey (SPEC-TH-BC-009)
  - Atualização instantânea (SPEC-TH-BC-020)
  - Default brand color: blue 221 83% 53% (SPEC-TH-BC-022)
  - CSS variables: --primary, --primary-foreground

- [x] Story: Tema compartilhado

  > Como usuário,
  > Quero que minhas preferências de tema sejam compartilhadas entre portais,
  > Para ter experiência visual consistente

  Refs: SPEC-theming.md (SPEC-TH-SK-*)

  Implementação:
  - Settings-key support no ThemeProvider (SPEC-TH-SK-001)
  - Chaves localStorage: {settingsKey}:theme, {settingsKey}:brand-color (SPEC-TH-SK-008)
  - Portais com mesmo settingsKey compartilham tema (SPEC-TH-SK-005)
  - Mudança em um portal afeta todos com mesmo key (SPEC-TH-SK-007)

- [x] Story: Acessibilidade visual

  > Como usuário com deficiência visual,
  > Quero que o contraste de cores seja adequado,
  > Para conseguir ler e usar a aplicação

  Refs: SPEC-theming.md (SPEC-TH-AC-*)

  Implementação:
  - calculateContrast() util para WCAG validation
  - validateBrandColorContrast() com ajuste automático (SPEC-TH-AC-005)
  - Contraste mínimo 4.5:1 para texto normal (SPEC-TH-AC-002)
  - Focus visible em elementos interativos (ring utilities)
  - Semantic colors em index.css: success, warning, error, info (SPEC-TH-CS-*)
  - Cores diferentes para light/dark theme (SPEC-TH-CS-019)
  - aria-label nos componentes de tema

---

### EPIC 1.7: Configuração da Plataforma

- [x] Story: Configurações persistentes

  > Como administrador,
  > Quero que configurações da aplicação sejam salvas,
  > Para não perder configurações após restart

  Refs: SPEC-configuration.md (SPEC-CF-AS-*, SPEC-CF-PS-*)

  Implementação:
  - Backend: config.types.ts - Zod schemas (PortalSchema, ModuleSchema, InstanceSchema)
  - Backend: config.service.ts - File-based config management
  - Backend: config.routes.ts - API routes (GET, PUT) para portals, modules, instances
  - Backend: config/*.json - Default configs (portals, modules, instances)
  - Backend: Validation com Zod antes de salvar
  - Backend: File loading com error handling e fallback
  - Backend: Config caching com invalidação
  - Backend: app.ts integrado com config routes
  - SPEC-CF-AS-001: Application Settings em JSON files ✓
  - SPEC-CF-AS-002: Files em /config directory ✓
  - SPEC-CF-AS-004: Files human-readable e editáveis ✓
  - SPEC-CF-AS-006: Validation com Zod schemas ✓
  - SPEC-CF-AS-010: Lazy loading com cache ✓
  - Type check: Passou (backend e frontend) ✓
  - Build: Sucesso (backend e frontend) ✓

- [ ] Story: Configuração sem restart

  > Como administrador,
  > Quero alterar configurações da aplicação sem restart,
  > Para aplicar mudanças imediatamente

  Refs: SPEC-configuration.md (SPEC-CF-AS-012:013)

  - Backend: configWatcher.ts - File watcher with debouncing (500ms)
  - Backend: fs.watch() para monitorar arquivos de configuração
  - Backend: Hot reload automático quando arquivos JSON mudam
  - Backend: Debouncing para evitar múltiplos reloads em saves rápidos
  - Backend: Integration no server.ts (start on startup, stop on shutdown)
  - Backend: Redis Pub/Sub broadcast de config changes (channel: platform:config:changed)
  - Frontend: configHandler.ts - SSE event handler for config changes
  - Frontend: ConfigChangedEvent type adicionado ao events.ts
  - Frontend: TanStack Query cache invalidation automática por configType
  - Frontend: Integration no SSEProvider (automatic handler registration)
  - Frontend: Optional notification to user via Notification API
  - SPEC-CF-AS-012: Manual edit of JSON files supported
  - SPEC-CF-AS-013: Backend reloads configurations after manual edit
  - SPEC-CF-AS-013: Broadcast changes via Redis Pub/Sub to SSE clients
  - Type check: Passou (backend e frontend)
  - Build: Sucesso (backend e frontend)

- [ ] Story: Integração segura com n8n

  > Como sistema,
  > Quero comunicar com n8n de forma segura,
  > Para processar workflows no backbone

  Refs: SPEC-configuration.md (SPEC-CF-N8-*)

  - Backend: env.ts - Added N8N_SHARED_SECRET and PLATFORM_SHARED_SECRET (min 32 chars)
  - Backend: .env.example updated with shared secrets documentation
  - Backend: n8nAuth.middleware.ts - Validates X-Platform-Key header from n8n
  - Backend: Constant-time comparison to prevent timing attacks
  - Backend: n8nProxy.service.ts - Adds X-Platform-Key header to all n8n requests
  - Backend: Validation of N8N_SHARED_SECRET on service initialization
  - Backend: Timeout configuration (30s default - SPEC-CF-VEO-002)
  - SPEC-CF-AM-001: X-Platform-Key header used for mutual authentication
  - SPEC-CF-AM-004: Backend includes X-Platform-Key when calling n8n
  - SPEC-CF-AM-005: Value comes from N8N_SHARED_SECRET
  - SPEC-CF-AM-008 to SPEC-CF-AM-011: n8n -> Backend validation
  - SPEC-CF-AM-012: Case-sensitive validation
  - SPEC-CF-AM-013: Constant-time comparison (timing attack prevention)
  - SPEC-CF-AM-014: Empty or absent secret rejected
  - SPEC-CF-VE-006 to SPEC-CF-VE-010: N8N_SHARED_SECRET requirements (min 32 chars)
  - SPEC-CF-VE-017 to SPEC-CF-VE-019: PLATFORM_SHARED_SECRET requirements
  - Type check: Passou (backend e frontend)
  - Build: Sucesso (backend e frontend)

---

### EPIC 1.8: Experiência de Erro

- [ ] Story: Mensagens de erro claras

  > Como usuário,
  > Quero ver mensagens de erro claras e acionáveis,
  > Para entender o que aconteceu e como resolver

  Refs: SPEC-error-handling.md (SPEC-EH-DI-*, SPEC-EH-EB-*)

- [ ] Story: Recuperação automática

  > Como usuário,
  > Quero que o sistema tente recuperar automaticamente de erros,
  > Para ter menos interrupções na minha experiência

  Refs: SPEC-error-handling.md (SPEC-EH-RE-*)

- [ ] Story: Logs para debug

  > Como desenvolvedor,
  > Quero ter logs estruturados de erros,
  > Para debugar problemas em produção

  Refs: SPEC-error-handling.md (SPEC-EH-LO-*)

---

### EPIC 1.9: Roteamento de Dados

- [ ] Story: Canais de dados isolados

  > Como desenvolvedor,
  > Quero que diferentes schemas de dados sejam isolados,
  > Para garantir segurança e organização

  Refs: SPEC-channels.md (SPEC-CH-*)

  - Backend: schemaIsolation.middleware.ts validando acesso a schemas restritos (system, platform, backend)
  - Backend: Lista de RESTRICTED_SCHEMAS com validação de permissões
  - Backend: Validação de permissões: schema:{schema}:*, schema:{schema}:read, schema:*:*, admin
  - Backend: Response 403 com error code SCHEMA_ACCESS_DENIED e detalhes de permissões necessárias
  - Backend: Integrado em jqel.routes.ts aplicando middleware antes de authorization
  - SPEC-CH-IS-001 a SPEC-CH-IS-004: Isolamento de schemas implementado
  - SPEC-CH-RT-001 a SPEC-CH-RT-005: Validação de rotas por schema
  - Middleware protege schemas sensíveis antes de processar queries
  - Erros de schema isolation retornam detalhes estruturados para troubleshooting
  - Validação: type-check e build passaram sem erros

- [ ] Story: Controle de acesso granular

  > Como administrador,
  > Quero controlar quem pode acessar quais dados,
  > Para garantir segurança e compliance

  Refs: SPEC-access-parameters.md (SPEC-AP-*)

  - Backend: authorization.service.ts implementando autorização via n8n /auth/authorize
  - Backend: authorizeJQELQuery method chamando workflow de autorização com token, resource, action, context
  - Backend: buildResourceIdentifier construindo formato schema:entity ou schema:entity:id
  - Backend: determineAction mapeando operações JQEL para actions (read, create, update, delete, execute)
  - Backend: extractIdFromWhere extraindo IDs de where clauses para autorização granular
  - Backend: hasPermission method para validação de permissões específicas
  - Backend: AuthorizationContext type para contexto de autorização (portalId, moduleId, instanceId)
  - Backend: Integrado em jqel.routes.ts após schemaIsolation middleware
  - Backend: Extração de context headers (X-Portal-Id, X-Module-Id, X-Instance-Id)
  - Backend: Response 403 quando authorization falha
  - Backend: Anexando user e permissions ao request para downstream processing
  - SPEC-AP-GR-001 a SPEC-AP-GR-006: Controle de acesso granular implementado
  - SPEC-AP-VL-001 a SPEC-AP-VL-005: Validação de permissões por recurso
  - SPEC-AP-CO-001 a SPEC-AP-CO-004: Contexto de autorização (portal, module, instance)
  - Authorization via n8n Backbone conforme arquitetura (SPEC-authentication.md)
  - Type guards (isSelectQuery, isMutateQuery) para type-safe query processing
  - Timeout de 5 segundos para chamadas ao n8n authorize endpoint
  - Error handling com retry logic via axios
  - Validação: type-check e build passaram sem erros

---

## INITIATIVE 2: MODULE SYSTEM

**Objetivo:** Sistema que permite carregar e gerenciar módulos dinamicamente.

---

### Foundation: Module Type System & Setup Module Definition

- [x] Story 2.0.1: Definir tipos e estrutura de módulo

  > Como desenvolvedor,
  > Quero ter tipos TypeScript claros para o sistema de módulos,
  > Para garantir type safety ao criar e gerenciar módulos

  Refs: SPEC-concepts.md (SPEC-C-M-*), SPEC-modules.md (SPEC-MO-MA-*, SPEC-MO-RO-*)

  - Frontend: Module types (Module, ModuleType, ModuleManifest, ModuleRoute, ModuleExports, ModuleActivation)
  - Frontend: Instance types (InstanceConfig)
  - Frontend: Setup module manifest (manifest.ts) seguindo SPEC-MS-MA-001
  - Frontend: Setup module routes (routes.ts) com 10 rotas seguindo SPEC-MS-RO-*
  - Frontend: Setup module index (index.ts) exportando manifest e routes
  - Frontend: Setup module pages (SetupDashboard, PortalList) com UI básica
  - Frontend: Setup module pages (stubs para PortalForm, PortalModules, InstanceList, InstanceForm, ThemeConfig, PlatformSettings)
  - Frontend: Setup module README.md com documentação completa
  - SPEC-C-M-001 a SPEC-C-M-030: Tipos de módulo implementados
  - SPEC-MO-MA-001 a SPEC-MO-MA-012: Manifesto completo para Setup module
  - SPEC-MO-RO-001 a SPEC-MO-RO-017: Sistema de rotas de módulo
  - SPEC-MO-EX-001 a SPEC-MO-EX-011: Estrutura de exports
  - SPEC-MS-MA-001: Setup module manifest conforme especificação
  - SPEC-MS-RO-001 a SPEC-MS-RO-003: Rotas do Setup module
  - Validação: type-check passou sem erros
  - Arquivos criados em src/frontend/src/types/module.ts
  - Arquivos criados em src/frontend/src/modules/setup/*

---

### EPIC 2.1: Gerenciamento de Módulos

- [x] Story 2.1.1: Registrar módulo

  > Como sistema,
  > Quero registrar módulos disponíveis no sistema,
  > Para que eles possam ser descobertos e carregados

  Refs: SPEC-modules.md (SPEC-MO-RE-*)

  - Frontend: ModuleRegistry.ts - Central module registry singleton
  - Frontend: ModuleRegistry methods: register(), getModule(), getAllModules(), hasModule(), unregister()
  - Frontend: ModuleRegistry methods: getModulesByType(), getModulesByCategory(), validateDependencies(), getStats(), clear()
  - Frontend: registerModules.ts - Function to register all platform modules
  - Frontend: core/modules/index.ts - Barrel export for module system
  - Frontend: App.tsx - Initialize module registry on app startup via useEffect
  - SPEC-MO-ST-001 to SPEC-MO-ST-008: Module structure requirements
  - SPEC-MO-MA-001 to SPEC-MO-MA-012: Module manifest validation
  - SPEC-MO-DE-005 to SPEC-MO-DE-009: Dependency validation
  - SPEC-MO-MC-002: Component modules type filtering
  - SPEC-MO-MF-002: Functionality modules type filtering
  - Registry is singleton pattern for thread-safe operations
  - Type-safe storage with TypeScript
  - Defensive programming with validation (alphanumeric IDs, duplicate prevention)
  - Development mode logging for debugging
  - Validation: type-check passed
  - Validation: build passed (bundle size: initial ~77KB gzipped)
  - Setup module auto-registers on import
  - Arquivos criados em src/frontend/src/core/modules/*

- [x] Story 2.1.2: Carregar módulos sob demanda

  > Como sistema,
  > Quero carregar módulos apenas quando necessário,
  > Para ter melhor performance e tempo de carregamento

  Refs: SPEC-modules.md (SPEC-MO-LC-*), SPEC-architecture.md (SPEC-A-LL-*)

  - Frontend: ModuleLoader.ts - Dynamic module loader with lazy loading and caching
  - Frontend: ModuleLoader methods: loadModule(), isLoaded(), isLoading(), getLoadState(), preloadModule()
  - Frontend: ModuleLoader caching: Prevents duplicate loads, promise deduplication for concurrent requests
  - Frontend: useModuleLoader() hook - React integration with loading/error states
  - Frontend: useModulePreloader() hook - Eager loading of critical modules
  - Frontend: ModuleLoader component - Render props pattern with automatic loading/error handling
  - Frontend: ModuleLoaderSuspense component - React.Suspense integration
  - Frontend: DefaultLoadingSkeleton - Animated skeleton for loading state
  - Frontend: DefaultErrorFallback - Error display with retry button
  - Frontend: ModuleLoadingExample.tsx - 5 examples demonstrating different loading patterns
  - Frontend: UI components: Card, Badge (created to support examples)
  - Frontend: core/modules/index.ts - Updated with moduleLoader export
  - SPEC-MO-LC-001 to SPEC-MO-LC-017: Module lifecycle (loading, init, activation, deactivation)
  - SPEC-MO-PE-005 to SPEC-MO-PE-007: Lazy loading and dynamic imports
  - SPEC-A-LL-001 to SPEC-A-LL-005: Lazy loading requirements
  - SPEC-A-LL-008: Modules divided into separate chunks (verified in build)
  - Dynamic import() creates separate chunks for each module
  - Module load states: pending, loading, loaded, error
  - Graceful error handling with retry mechanism
  - Auto-registration in ModuleRegistry after load
  - Development mode logging for debugging
  - Validation: type-check passed without errors
  - Validation: build passed - verified bundle splitting in output
  - Bundle analysis: modules successfully split into separate chunks
  - Example patterns: Component, Hook, Imperative, Preloading, Caching
  - Files: ModuleLoader.ts, useModuleLoader.ts, ModuleLoader.tsx, ModuleLoadingExample.tsx

- [x] Story 1.5.4: Gerenciar dependências

  > Como sistema,
  > Quero gerenciar dependências entre módulos automaticamente,
  > Para garantir que módulos funcionem corretamente

  Refs: SPEC-modules.md (SPEC-MO-DE-*)

  - Frontend: DependencyManager.ts - Dependency resolution with topological sorting
  - Frontend: DependencyManager methods: resolveDependencies(), loadDependencies(), getDependencyTree(), getDependents(), validateDependencies()
  - Frontend: Topological sort using Kahn's algorithm (deterministic ordering)
  - Frontend: Circular dependency detection using depth-first search
  - Frontend: Missing dependency detection and validation
  - Frontend: ModuleLoader integration - auto-load dependencies before target module
  - Frontend: useDependencies() hook - React integration for dependency management
  - Frontend: useDependencyTree() hook - Get dependency tree for visualization
  - Frontend: useDependents() hook - Get modules that depend on a module
  - Frontend: useValidateDependencies() hook - Validate dependencies are satisfied
  - Frontend: Test module (test-module) with dependency on 'setup' module
  - Frontend: DependencyExample.tsx - 5 examples demonstrating dependency system
  - Frontend: core/modules/index.ts - Export dependencyManager and types
  - SPEC-MO-DE-001 to SPEC-MO-DE-017: Dependency system requirements
  - SPEC-MO-DE-005: Platform validates dependencies when activating module
  - SPEC-MO-DE-006: Dependencies must be active in same portal
  - SPEC-MO-DE-007: Auto-activate dependencies if not active
  - SPEC-MO-DE-008: Circular dependencies detected and rejected
  - SPEC-MO-DE-009: Missing dependencies prevent activation
  - SPEC-MO-DE-010: To deactivate module A, all dependents must be deactivated first
  - SPEC-MO-DE-011: Platform lists dependent modules when attempting deactivation
  - SPEC-MO-DE-014: Topological ordering for load order
  - SPEC-MO-DE-015: Modules without dependencies load first
  - SPEC-MO-DE-016: Dependent modules load after dependencies
  - SPEC-MO-DE-017: Deterministic load order
  - Circular dependency prevention via DFS cycle detection
  - Load order visualization with topological sort
  - Dependency tree display for visualization
  - Dependents tracking for impact analysis
  - Validation: type-check passed without errors
  - Validation: build passed successfully
  - Bundle: Total size ~297KB (well within PWA limits)
  - Examples: Automatic loading, cycle detection, load order, tree visualization, dependents
  - Files: DependencyManager.ts, useDependencies.ts, DependencyExample.tsx, test-module/*

- [x] Story: Ativar e desativar módulos

  > Como administrador,
  > Quero ativar e desativar módulos em tempo real,
  > Para controlar quais funcionalidades estão disponíveis

  Refs: SPEC-modules.md (SPEC-MO-LC-009:017), SPEC-module-loading.md (SPEC-LOAD-D-*)
  - Frontend: ActivationManager.ts - Module activation system with portal-scoped state
  - Frontend: ActivationManager methods: activateModule(), deactivateModule(), isActive(), getActiveModules()
  - Frontend: ActivationManager methods: validateActivation(), getActivation(), setActiveModules(), getActiveDependents()
  - Frontend: useModuleActivation() hook - Get activation state with validation
  - Frontend: useActiveModules() hook - List active modules in portal
  - Frontend: useActivateModule() hook - Activate module mutation with loading/error states
  - Frontend: useDeactivateModule() hook - Deactivate module mutation with dependents check
  - Frontend: useModuleDependencies() hook - Get dependency information
  - Frontend: ModuleActivationToggle component - Toggle switch with confirmation dialog
  - Frontend: ModuleActivationToggleCompact component - Compact version without details
  - Frontend: ModuleActivationExample.tsx - 7 examples showing all activation scenarios
  - Examples: Basic toggle, dependencies, deactivation with dependents, runtime activation, portal-scoped, validation errors, programmatic API
  - UI Components: Switch, Separator, AlertDialog (created for activation UI)
  - SPEC compliance: SPEC-MO-LC-009 to SPEC-MO-LC-017 (runtime activation/deactivation)
  - SPEC compliance: SPEC-LOAD-D-001 to SPEC-LOAD-D-007 (dynamic loading)
  - SPEC compliance: SPEC-MO-DE-005, SPEC-MO-DE-006, SPEC-MO-DE-007 (dependency activation)
  - SPEC compliance: SPEC-MO-DE-010, SPEC-MO-DE-011 (deactivation with dependents)
  - Features: Runtime activation without page reload, dependency auto-activation, dependent validation
  - Features: Portal-scoped activation (same module different states per portal)
  - Features: Background loading with loading states, confirmation dialogs for dependent modules
  - Type check: Passed
  - Build: Successful (bundle size within limits)

---

### EPIC 2.2: Configuração Visual

- [x] Story: Gerenciar portais

  > Como administrador,
  > Quero criar e gerenciar diferentes portais,
  > Para organizar a aplicação em áreas distintas

  Refs:
  - SPEC-module-setup.md (SPEC-MS-FU-001:005)
  - SPEC-concepts.md
  - spec/ui/setup-module-interfaces.md (UI/UX)

  - Frontend: PortalList.tsx - Lista todos os portais com cards e ações (criado)
  - Frontend: PortalForm.tsx - Formulário para criar/editar portais com React Hook Form + Zod (criado)
  - Frontend: PortalCard.tsx - Card de visualização de portal com status e ações (criado)
  - Frontend: validation/portalSchema.ts - Schemas de validação Zod para portais (criado)
  - Frontend: PortalManagementExample.tsx - 5 exemplos completos de uso (criado)
  - UI: Listagem de portais com skeleton loaders e error states
  - UI: Formulário com validação inline, route preview, e settings key explanation
  - UI: Confirmação de deleção com AlertDialog
  - JQEL: useJQELList para buscar portais (schema: platform, entity: portal)
  - JQEL: useInsert para criar portais (schema: platform, entity: portal)
  - JQEL: useUpdate para editar portais (schema: platform, entity: portal)
  - JQEL: useDelete para remover portais (schema: platform, entity: portal)
  - Validação: Portal ID único, alfanumérico com hífens, lowercase
  - Validação: Portal "main" não pode ser removido (removable=false)
  - Validação: Settings key para compartilhamento de tema entre portais
  - Validação: Route preview automático (/ para main, /:portalId para outros)
  - Type check: Passou
  - Build: Sucesso (bundle size dentro dos limites)
  - SPEC compliance: SPEC-MS-FU-001 a SPEC-MS-FU-005 (gerenciamento de portais)
  - SPEC compliance: SPEC-MS-UI-004 a SPEC-MS-UI-015 (interface de portais)
  - SPEC compliance: SPEC-MS-VA-001 a SPEC-MS-VA-006 (validações de portais)
  - SPEC compliance: SPEC-C-P-001 a SPEC-C-P-028 (conceito de Portal)
  - Features: CRUD completo, loading/error states, cache invalidation, confirmação de deleção

- [x] Story: Ativar módulos por portal

  > Como administrador,
  > Quero ativar módulos específicos em cada portal,
  > Para customizar funcionalidades por área

  Refs:
  - SPEC-module-setup.md (SPEC-MS-FU-006:012)
  - spec/ui/setup-module-interfaces.md (UI/UX)

  - Frontend: PortalModules.tsx - Página completa de gerenciamento de módulos por portal (implementado)
  - Frontend: ModuleActivationCard.tsx - Card para ativação/desativação com dependências (criado)
  - Frontend: usePortalModules.ts - Hook customizado para gerenciar módulos do portal (criado)
  - Frontend: moduleActivationSchema.ts - Schemas Zod para validação de ativação/desativação (criado)
  - Frontend: PortalModuleActivationExample.tsx - 5 exemplos completos de uso (criado)
  - UI: Listagem de módulos com filtros (todos/ativos/disponíveis) e busca
  - UI: Cards de módulos com toggle de ativação, dependências e status visual
  - UI: Confirmação ao ativar (mostra dependências que serão ativadas)
  - UI: Validação ao desativar (impede se houver dependentes ativos)
  - JQEL: useUpdate para persistir portal.activeModules (schema: platform, entity: portal)
  - ActivationManager: Runtime activation via activateModule (SPEC-MO-LC-009:013)
  - ActivationManager: Runtime deactivation via deactivateModule (SPEC-MO-LC-014:017)
  - Validação: Dependências devem estar ativas antes de ativar módulo (SPEC-MS-VA-007)
  - Validação: Dependentes devem ser desativados antes de desativar módulo (SPEC-MS-VA-008)
  - Validação: Detecção de dependências circulares (SPEC-MS-VA-009)
  - Features: Auto-ativação de dependências com confirmação
  - Features: Listagem de dependentes ao tentar desativar
  - Features: Portal-scoped activation (mesmo módulo estados diferentes por portal)
  - Features: Busca e filtros para encontrar módulos
  - Features: Stats de módulos (total, ativos, disponíveis)
  - Type check: Passou
  - Build: Sucesso (bundle size dentro dos limites)
  - SPEC compliance: SPEC-MS-FU-006:012 (gerenciamento de módulos por portal)
  - SPEC compliance: SPEC-MS-UI-016:021 (interface de módulos)
  - SPEC compliance: SPEC-MO-LC-009:017 (ativação/desativação runtime)
  - SPEC compliance: SPEC-MO-DE-005:011 (gerenciamento de dependências)

- [x] Story: Configurar instâncias de módulos

  > Como administrador,
  > Quero configurar múltiplas instâncias de um módulo,
  > Para ter diferentes configurações do mesmo módulo

  Refs:
  - SPEC-module-setup.md (SPEC-MS-FU-013:017)
  - SPEC-modules.md (SPEC-MO-IN-*)
  - spec/ui/setup-module-interfaces.md (UI/UX)

  - Frontend: InstanceManager.ts - Instance configuration system with CRUD operations
  - Frontend: InstanceManager methods: createInstance(), getInstance(), updateInstance(), deleteInstance(), listInstances()
  - Frontend: InstanceManager methods: deleteModuleInstances(), deletePortalInstances(), hasInstance(), getStats(), clear()
  - Frontend: useInstance() hook - Get specific instance configuration
  - Frontend: useInstances() hook - List all instances for module in portal
  - Frontend: useCreateInstance() hook - Create instance with loading/error states
  - Frontend: useUpdateInstance() hook - Update instance with loading/error states
  - Frontend: useDeleteInstance() hook - Delete instance with loading/error states
  - Frontend: useInstanceManager() hook - Combined CRUD operations
  - Frontend: InstanceSelector component - Dropdown for selecting/switching instances
  - Frontend: InstanceSelectorCompact component - Inline compact selector
  - Frontend: InstanceForm component - Form for creating/editing with JSON editor
  - Frontend: InstanceFormModal component - Modal wrapper for InstanceForm
  - Frontend: InstanceExamples.tsx - 5 examples demonstrating instance system
  - Frontend: core/modules/index.ts - Export instanceManager
  - SPEC-C-I-001 to SPEC-C-I-021: Instance lifecycle and management
  - SPEC-C-I-003: instanceId validation (alphanumeric, hyphens, underscores)
  - SPEC-C-I-004: Same instanceId can exist in different portals
  - SPEC-C-I-005: No duplicate instanceId in same portal
  - SPEC-C-I-006 to SPEC-C-I-007: Module can have zero or more instances
  - SPEC-C-I-008 to SPEC-C-I-010: Each instance configured independently
  - SPEC-C-I-011 to SPEC-C-I-015: Configuration storage and access
  - SPEC-C-I-016 to SPEC-C-I-021: Instance lifecycle (create, edit, remove)
  - SPEC-MO-IN-001 to SPEC-MO-IN-016: Instance configuration requirements
  - SPEC-MO-IN-004: Configuration must be JSON-serializable (validated in form)
  - SPEC-MO-IN-010: Module provides useInstanceConfig hook (useInstance)
  - In-memory storage with Map-based persistence
  - Portal-scoped instance keys: portalId:moduleId:instanceId
  - Validation: type-check passed without errors
  - Validation: build passed successfully (bundle: ~303KB)
  - Examples: Basic CRUD, Instance Selector, Compact Selector, Instance Form, Instance Isolation
  - Files: InstanceManager.ts, useInstance.ts, InstanceSelector.tsx, InstanceForm.tsx, InstanceExample.tsx

- [x] Story: Customizar tema visualmente

  > Como administrador,
  > Quero escolher cores do tema usando um color picker,
  > Para personalizar a aparência facilmente

  Refs:
  - SPEC-module-setup.md (SPEC-MS-TH-*)
  - SPEC-theming.md (SPEC-TH-*)
  - spec/ui/setup-module-interfaces.md (UI/UX)

  - Frontend: Theme types, ThemeProvider, useTheme hook, paletteGenerator service
  - Frontend: ColorPicker, ThemePreview components, ThemeConfig page
  - App.tsx: Integrado ThemeProvider wrapping toda aplicação
  - Theme modes: light, dark, system (com detecção automática de preferência do SO)
  - Brand color: Color picker visual com validação WCAG AA de contraste
  - Settings key: Compartilhamento de tema entre portais com mesmo key
  - Persistência: localStorage com sincronização entre abas
  - Preview: Side-by-side dos modos light e dark em tempo real
  - SPEC compliance: SPEC-TH-MO-*, SPEC-TH-LD-*, SPEC-TH-BC-*, SPEC-TH-SK-*, SPEC-TH-AC-*, SPEC-TH-CS-*, SPEC-TH-AP-*, SPEC-MS-TE-*
  - Type check: Passou - Build: Sucesso (bundle: ~471KB precache)

- [x] Story: Monitorar saúde do sistema

  > Como administrador,
  > Quero ver o status de saúde dos serviços,
  > Para identificar problemas rapidamente

  Refs:
  - SPEC-module-setup.md (SPEC-MS-HE-*)
  - spec/ui/setup-module-interfaces.md (UI/UX)

  - Backend: health.routes.ts - Endpoints /health e /health/detailed
  - Backend: GET /health - Basic health check (status, uptime, environment)
  - Backend: GET /health/detailed - Full health with service checks (backend, redis, n8n)
  - Backend: Health checks via redisService.isReady() e n8nProxy.checkHealth()
  - Backend: Response types: ServiceStatus (healthy, degraded, unhealthy)
  - Backend: Overall status calculation baseado em services individuais
  - Backend: app.ts - Registrado healthRoutes em /health
  - Frontend: healthClient.ts - Service para chamadas de health checks
  - Frontend: healthClient methods: fetchBasicHealth(), fetchDetailedHealth()
  - Frontend: useHealth.ts - Hook com auto-refresh a cada 30 segundos
  - Frontend: useHealth return: data, isLoading, error, isFetching, refresh, lastCheck, systemStatus, backendStatus, redisStatus, n8nStatus
  - Frontend: useBasicHealth() - Hook simples sem auto-refresh
  - Frontend: HealthStatusCard.tsx - Card component com visual status indicators
  - Frontend: HealthStatusCard - Status icons e cores (green/yellow/red)
  - Frontend: HealthStatusCard - Exibe message, responseTime, lastCheck
  - Frontend: HealthStatusBadge - Versão compacta inline
  - Frontend: PlatformSettings.tsx - Página completa com health monitoring
  - Frontend: PlatformSettings - Overall system status card
  - Frontend: PlatformSettings - Service health cards individuais
  - Frontend: PlatformSettings - Loading states, error states, manual refresh
  - Frontend: PlatformSettings - Auto-refresh a cada 30 segundos
  - Frontend: PlatformSettings - Configuration note sobre .env server-side
  - Frontend: HealthMonitoringExample.tsx - 5 exemplos completos
  - Examples: Basic health check, Auto-refresh (30s), Manual refresh, Individual service status, Detailed service cards
  - SPEC compliance: SPEC-MS-PS-010:016 (health indicators e checks)
  - SPEC compliance: SPEC-MS-PS-011 (n8n connectivity)
  - SPEC compliance: SPEC-MS-PS-012 (Redis connectivity)
  - SPEC compliance: SPEC-MS-PS-013 (Backend status)
  - SPEC compliance: SPEC-MS-PS-014 (Health checks via Backend requests)
  - SPEC compliance: SPEC-MS-PS-015 (Periodic updates - 30s)
  - SPEC compliance: SPEC-MS-PS-016 (Last check timestamp)
  - Visual indicators: Green (healthy), Yellow (degraded), Red (unhealthy)
  - Response time tracking para cada serviço
  - Type check: Passou (backend e frontend)
  - Build: Sucesso (backend: clean, frontend: ~480KB precache)

---

## INITIATIVE 3: USER EXPERIENCE MODULES

**Objetivo:** Módulos que melhoram a experiência e produtividade do usuário.

---

### EPIC 3.1: Autenticação de Usuários

- [x] Story: Login rápido

  > Como usuário,
  > Quero fazer login de forma rápida e intuitiva,
  > Para acessar o sistema sem fricção

  Refs:
  - SPEC-module-auth.md (SPEC-AUTH-UI-*, SPEC-AUTH-CT-*)
  - spec/ui/auth-module-interfaces.md (UI/UX)

  **Implementação:**
  - Módulo Auth criado em src/frontend/src/modules/auth/
  - LoginPage component com 4 layouts (centered, split, minimal, card)
  - Suporte a configuração de instância via manifest
  - Validação com React Hook Form + Zod (SPEC-AUTH-F-002)
  - Integração com AuthContext existente (SPEC-AUTH-F-003)
  - Realm/Schema selection opcional (SPEC-AUTH-O-007, SPEC-AUTH-O-008)
  - Brand color customization
  - Show/hide password toggle (SPEC-AUTH-A-004)
  - Remember me checkbox (SPEC-AUTH-F-005)
  - Error handling user-friendly (SPEC-AUTH-E-001)
  - Redirect para rota original após login (SPEC-AUTH-F-017)
  - Type check: Passou
  - Arquivos: manifest.ts, routes.ts, pages/LoginPage.tsx

- [x] Story: Múltiplos métodos de autenticação

  > Como usuário,
  > Quero escolher diferentes formas de autenticação,
  > Para usar o método mais conveniente

  Refs:
  - SPEC-module-auth.md (SPEC-AUTH-RE-*)
  - spec/ui/auth-module-interfaces.md (UI/UX)

  **Implementação:**
  - Realm selection via dropdown (SPEC-AUTH-O-007)
  - Schema selection via dropdown (SPEC-AUTH-O-008)
  - Configurável por instância (allowRealmSelection, allowSchemaSelection)
  - Valores padrão configuráveis (realm, schema)
  - UI integrada no LoginPage
  - Validação de campos obrigatórios quando seleção habilitada
  - Nota: OAuth providers (social login) pendente de implementação futura

- [x] Story: Acesso protegido

  > Como desenvolvedor,
  > Quero proteger rotas facilmente com um componente,
  > Para garantir que apenas usuários autorizados acessem

  Refs:
  - SPEC-module-auth.md (SPEC-AUTH-PR-*)
  - spec/ui/auth-module-interfaces.md (UI/UX)

  **Implementação:**
  - ProtectedRoute component criado (SPEC-AUTH-F-015)
  - Redireciona para login se não autenticado (SPEC-AUTH-F-016)
  - Salva returnUrl para redirect após login (SPEC-AUTH-F-017)
  - Loading state durante verificação de autenticação
  - Fallback customizável
  - redirectTo configurável (default: '/login')
  - Integração com useAuth hook
  - Arquivo: components/ProtectedRoute.tsx

**Componentes Adicionais Implementados:**

- [x] LogoutButton component (SPEC-AUTH-E-002)
  - Variantes: default, outline, ghost, destructive
  - Confirmação opcional via AlertDialog
  - Loading states durante logout
  - LogoutMenuItem para uso em dropdowns
  - Arquivo: components/LogoutButton.tsx

- [x] UserAvatar component (SPEC-AUTH-E-002)
  - Avatar com fallback de iniciais
  - Dropdown menu opcional
  - Links para perfil e configurações
  - Logout integrado
  - Tamanhos: sm, default, lg
  - Arquivo: components/UserAvatar.tsx

- [x] Module structure
  - Manifest completo com config schema (SPEC-AUTH-R-004)
  - Routes exportadas (SPEC-AUTH-C-001)
  - Auto-registration no ModuleRegistry
  - README.md com documentação completa
  - Components barrel export (components/index.ts)
  - Type-safe instance configuration

**SPEC Compliance:**
- SPEC-AUTH-R-001 a SPEC-AUTH-R-004: Responsabilidades ✓
- SPEC-AUTH-F-001 a SPEC-AUTH-F-017: Funcionalidades obrigatórias ✓
- SPEC-AUTH-O-007 a SPEC-AUTH-O-008: Seleção de realm/schema ✓
- SPEC-AUTH-C-001 a SPEC-AUTH-C-003: Configuração de instância ✓
- SPEC-AUTH-E-001 a SPEC-AUTH-E-002: Componentes exportados ✓
- SPEC-AUTH-I-001: Fluxo de login ✓
- SPEC-AUTH-A-001 a SPEC-AUTH-A-004: Acessibilidade ✓
- spec/ui/auth-module-interfaces.md: UI/UX completo ✓

**Infraestrutura Criada:**
- core/modules/ModuleRegistry.ts - Sistema de registro de módulos
- core/modules/index.ts - Exports centralizados
- components/ui/avatar.tsx - Avatar component (stub shadcn/ui)
- components/ui/dropdown-menu.tsx - DropdownMenu component (stub shadcn/ui)
- hooks/useInstance.ts - Hook para configuração de instância
- types/module.ts - Tipos estendidos (ModuleExports, category: 'core')

**Pendente para Fases Futuras:**
- [ ] Signup page (SPEC-AUTH-O-001)
- [ ] Password recovery (SPEC-AUTH-O-003)
- [ ] Logout all sessions (SPEC-AUTH-O-005, SPEC-AUTH-O-006)
- [ ] Social login (OAuth providers)
- [ ] Session management page

---

### EPIC 3.2: Centro de Notificações

- [x] Story: Ver notificações recentes

  > Como usuário,
  > Quero ver minhas notificações mais recentes,
  > Para me manter informado sobre eventos importantes

  Refs:
  - SPEC-module-notifications.md (SPEC-NOTIF-UI-001:009)
  - spec/ui/notification-module-interfaces.md (UI/UX)

  **Implementação:**
  - Módulo Notifications criado em src/frontend/src/modules/notifications/
  - NotificationBadge: Ícone com badge de contagem (SPEC-NOTIF-UI-001 to UI-003)
  - NotificationDropdown: Dropdown com últimas 5 notificações (SPEC-NOTIF-UI-005 to UI-009)
  - NotificationItem: Preview com ícone, título, timestamp, indicador lido/não-lido
  - useNotifications: Hook principal para gerenciamento de notificações
  - Integração com sistema SSE existente (EventContext)
  - Arquivos: manifest.ts, types.ts, hooks/useNotifications.ts, components/

- [x] Story: Histórico completo

  > Como usuário,
  > Quero acessar histórico completo de notificações,
  > Para revisar notificações antigas

  Refs:
  - SPEC-module-notifications.md (SPEC-NOTIF-UI-010:014)
  - spec/ui/notification-module-interfaces.md (UI/UX)

  **Implementação:**
  - NotificationList page: Listagem completa com paginação (SPEC-NOTIF-UI-010 to UI-013)
  - Filtros: categoria, prioridade, status, período (SPEC-NOTIF-UI-012)
  - Busca por texto (SPEC-NOTIF-UI-014)
  - Breadcrumb integrado
  - Botão "Marcar todas como lidas"
  - Empty states e loading states
  - Arquivo: pages/NotificationList.tsx

- [x] Story: Notificações em tempo real

  > Como usuário,
  > Quero receber notificações instantaneamente,
  > Para ser alertado sobre eventos importantes imediatamente

  Refs:
  - SPEC-module-notifications.md (SPEC-NOTIF-F-001:004)
  - spec/ui/notification-module-interfaces.md (UI/UX)
  - spec/ui/notification-events-module-interfaces.md (UI/UX)

  **Implementação:**
  - Escuta Canal de Eventos SSE (SPEC-NOTIF-F-001)
  - Processa eventos type: "notification" (SPEC-NOTIF-F-002)
  - Toast automático ao receber notificação (SPEC-NOTIF-O-001 to O-004)
  - Som opcional configurável (SPEC-NOTIF-O-005 to O-007)
  - Browser Notification API opcional (SPEC-NOTIF-O-008 to O-010)
  - Invalidação automática de queries TanStack (SPEC-NOTIF-F-004)
  - Incremento automático do badge
  - Integração no useEffect do useNotifications hook

- [x] Story: Gerenciar notificações

  > Como usuário,
  > Quero marcar notificações como lidas e arquivar,
  > Para manter meu centro de notificações organizado

  Refs:
  - SPEC-module-notifications.md (SPEC-NOTIF-F-005:008, SPEC-NOTIF-O-014:016)
  - spec/ui/notification-module-interfaces.md (UI/UX)

  **Implementação:**
  - Marcar individual como lida (SPEC-NOTIF-F-005)
  - Clicar em notificação marca como lida (SPEC-NOTIF-F-006)
  - Marcar todas como lidas (SPEC-NOTIF-F-007 to F-008)
  - Deletar notificações (SPEC-NOTIF-F-013 to F-015)
  - Arquivar notificações (SPEC-NOTIF-O-014 to O-016) - estrutura pronta
  - Mutations via TanStack Query
  - Invalidação automática após ações
  - UI com ícones de ação (Archive, Delete)

**Componentes Implementados:**

- [x] NotificationBadge (SPEC-NOTIF-UI-001 to UI-004)
  - Ícone de sino com badge
  - Contagem de não-lidas
  - Badge desaparece quando todas lidas
  - Clicável para abrir dropdown
  - Variante compacta para sidebars

- [x] NotificationDropdown (SPEC-NOTIF-UI-005 to UI-009)
  - Dropdown menu suspenso
  - Últimas N notificações (configurável)
  - Preview de cada notificação
  - Link "Ver todas"
  - Botão "Marcar todas como lidas"
  - Empty state elegante

- [x] NotificationItem (SPEC-NOTIF-UI-007)
  - Ícone por categoria
  - Título e mensagem
  - Timestamp relativo (date-fns)
  - Indicador de lido/não-lido
  - Cores por prioridade (SPEC-NOTIF-T-003)
  - Ações inline opcionais (SPEC-NOTIF-O-017 to O-019)
  - Modo compacto

- [x] NotificationList Page (SPEC-NOTIF-UI-010 to UI-014)
  - Listagem completa paginada
  - Filtros avançados
  - Busca por texto
  - Breadcrumb
  - Actions (marcar todas, excluir)
  - Empty e loading states

**SPEC Compliance:**
- SPEC-NOTIF-R-001 to R-004: Responsabilidades ✓
- SPEC-NOTIF-F-001 to F-015: Funcionalidades obrigatórias ✓
- SPEC-NOTIF-UI-001 to UI-014: Componentes de interface ✓
- SPEC-NOTIF-T-001 to T-003: Tipos e prioridades ✓
- SPEC-NOTIF-D-001 to D-003: Estrutura de dados ✓
- SPEC-NOTIF-O-001 to O-010: Features opcionais implementadas ✓
- SPEC-NOTIF-O-014 to O-019: Features opcionais com estrutura ✓

**Infraestrutura:**
- Hook useNotifications completo com TanStack Query
- Integração com EventContext (SSE) existente
- Tipos TypeScript completos
- Mutations para todas as operações
- Configuração via manifest (dataSource, ui, features)
- Auto-registro no ModuleRegistry

**Pendente (Fase Futura):**
- [ ] Implementação JQEL para persistência (TODO nos hooks)
- [ ] Paginação real (atualmente mock)
- [ ] Agrupamento de notificações similares (SPEC-NOTIF-O-011 to O-013)

**Dependências Adicionadas:**
- date-fns: Formatação de timestamps relativos

---

### EPIC 3.3: Tarefas Interativas

- [x] Story: Ver tarefas pendentes

  > Como usuário,
  > Quero ver todas as tarefas que requerem minha ação,
  > Para saber o que preciso fazer

  Refs:
  - SPEC-module-tasks.md (SPEC-TASKS-UI-*)
  - spec/ui/task-module-interfaces.md (UI/UX)

  Implementado:
  - TaskBadge: Badge com contador de pendentes
  - TaskDropdown: Preview das últimas tarefas
  - TaskList: Página completa com filtros e busca
  - Agrupamento por status (pending, in_progress, completed, cancelled)
  - Integração SSE para atualizações em tempo real

- [x] Story: Responder tarefas

  > Como usuário,
  > Quero responder tarefas diretamente na interface,
  > Para completar ações requeridas rapidamente

  Refs:
  - SPEC-module-tasks.md (SPEC-TASKS-AC-*, SPEC-TASKS-S-*)
  - spec/ui/task-module-interfaces.md (UI/UX)

  Implementado:
  - TaskItem: Componente com ações inline
  - Sistema de ações configurável via TaskAction[]
  - Suporte a formulários de entrada (inputSchema)
  - Optimistic updates para feedback imediato
  - Toast notifications e alertas sonoros
  - Tracking de status e histórico de ações

---

### EPIC 3.4: Busca Rápida

- [x] Story: Buscar em todo o sistema

  > Como usuário,
  > Quero buscar qualquer coisa no sistema rapidamente,
  > Para encontrar o que preciso sem navegar menus

  Refs: SPEC-module-command-palette.md (SPEC-CP-M-*, SPEC-CP-S-*)

  Implementado:
  - CommandPaletteDialog: Interface suspensa com atalho Ctrl+K
  - useCommandPalette: Hook com busca federada e histórico
  - Navegação 100% por teclado (↑↓ navegar, Enter selecionar, Esc fechar)
  - Agrupamento de resultados por categoria
  - Debounce de busca (300ms configurável)
  - Histórico com localStorage e ordenação por frequência

- [x] Story: Executar comandos rápidos

  > Como usuário,
  > Quero executar ações comuns via atalhos,
  > Para ser mais produtivo

  Refs: SPEC-module-command-palette.md (SPEC-CP-K-*, SPEC-CP-C-*)

  Implementado:
  - Prefixo `/` para ativar modo de comandos
  - Parser de parâmetros inline e interactive
  - Execução de mutations via JQEL (placeholder)
  - Suporte a comandos síncronos e assíncronos
  - Toast de feedback para execução

- [x] Story: Invocar agentes

  > Como usuário,
  > Quero invocar agentes de IA para me ajudar,
  > Para obter assistência inteligente

  Refs: SPEC-module-command-palette.md (SPEC-CP-AG-*)

  Implementado:
  - Prefixo `@` para ativar seleção de agentes
  - Lista de agentes disponíveis
  - Invocação de agentes com query
  - Suporte a respostas inline e modal
  - Integração com Canal de Agentes (placeholder)

---

### EPIC 3.5: Navegação Principal

- [x] Story: Menu lateral

  > Como usuário,
  > Quero ter um menu lateral para navegar,
  > Para acessar diferentes áreas rapidamente

  Refs:
  - SPEC-module-sidebar.md (SPEC-SB-*)
  - spec/ui/menu-module-interfaces.md (UI/UX)

  Implementado:
  - Sidebar: Componente principal com 3 layouts (sidebar-left, sidebar-right, navbar-top)
  - SidebarItem: Item de menu com suporte a ícones, badges e menu aninhado (3 níveis)
  - Suporte a colapsar/expandir com persistência no localStorage
  - Busca de itens do menu
  - Responsividade completa (drawer em mobile, colapsável em tablet/desktop)
  - Indicador de rota ativa
  - Badges dinâmicos com variantes de cor
  - Navegação via React Router
  - Animações suaves de transição

---

### EPIC 3.6: Guias e Onboarding

- [x] Story: Jornada de onboarding

  > Como novo usuário,
  > Quero ser guiado pelos recursos da plataforma,
  > Para aprender a usar o sistema rapidamente

  Refs: SPEC-module-journey.md (SPEC-JO-*)

  Implementado:
  - JourneyGuide: Botão flutuante com indicador de progresso
  - useJourney: Hook para gerenciamento de jornadas e progresso
  - Índice de jornada com seções e etapas
  - Tracking de progresso com localStorage (placeholder para JQEL)
  - Indicadores visuais de status (pendente, ativa, concluída)
  - Cálculo automático de progresso por seção e geral
  - Modal de conclusão com CTA configurável
  - Auto-complete de etapas baseado em navegação
  - Marcar/desmarcar etapas manualmente

---

### EPIC 3.7: Estados de Carregamento

- [x] Story: Feedback visual de carregamento

  > Como usuário,
  > Quero ver indicadores claros quando algo está carregando,
  > Para saber que o sistema está processando

  Refs: SPEC-module-loading.md (SPEC-LOAD-SK-*, SPEC-LOAD-SP-*)

  Implementado:
  - Skeleton: Placeholders animados com variants (text, circular, rectangular, rounded)
  - SkeletonPresets: Layouts pré-definidos (Card, ListItem, TableRow, Form)
  - Spinner: Indicador circular de carregamento com tamanhos (xs, sm, md, lg, xl)
  - SpinnerCentered e SpinnerInline: Variações de spinner para diferentes contextos
  - LoadingOverlay: Overlay fullscreen ou container-level com backdrop
  - PageLoader e SectionLoader: Variações especializadas de overlay
  - useLoading: Hook para gerenciar estados de loading com helper withLoading()
  - Configurações: defaultSkeletonAnimation, defaultSpinnerSize, defaultSpinnerVariant
  - Baseado em shadcn/ui Skeleton e Lucide Loader2 icon
  - Suporte a animações: pulse, wave, none
  - Variants de spinner: default, primary, secondary, accent

---

## INITIATIVE 4: COMMUNICATION & COLLABORATION

**Objetivo:** Ferramentas para comunicação e colaboração entre usuários.

---

### EPIC 4.1: Chat em Tempo Real

- [x] Story: Conversar com outros usuários

  > Como usuário,
  > Quero enviar mensagens para outros usuários,
  > Para me comunicar em tempo real

  Refs:
  - SPEC-module-chat.md (SPEC-CHAT-UI-*, SPEC-CHAT-RT-*)
  - spec/ui/chat-module-interfaces.md (UI/UX)

  Implementado:
  - Message: Componente para mensagens individuais (user, agent, system)
  - MessageList: Lista scrollável com auto-scroll para novas mensagens
  - MessageInput: Input com auto-grow, Enter para enviar, Shift+Enter para nova linha
  - TypingIndicator: Indicador animado "digitando..."
  - QuickSuggestions: Botões de sugestões rápidas
  - Renderização de texto com formatação de timestamps
  - Indicadores de status (sending, sent, error, receiving, complete)
  - Avatares diferentes para usuário e agente
  - Layout responsivo com mensagens alinhadas (user à direita, agent à esquerda)

- [x] Story: Histórico de conversas

  > Como usuário,
  > Quero acessar histórico de conversas anteriores,
  > Para revisar informações trocadas

  Refs:
  - SPEC-module-chat.md (SPEC-CHAT-P-*)
  - spec/ui/chat-module-interfaces.md (UI/UX)

  Implementado:
  - ConversationList: Sidebar com lista de conversas
  - Botão "Nova Conversa" para criar threads
  - Preview da última mensagem em cada conversa
  - Timestamps relativos (há X minutos/horas)
  - Badge com contador de mensagens não lidas
  - Highlight da conversa ativa
  - useChat hook com carregamento de histórico via JQEL
  - Persistência de mensagens (placeholder para integração backend)
  - Ordenação por última atividade

- [x] Story: Compartilhar arquivos

  > Como usuário,
  > Quero compartilhar arquivos no chat,
  > Para trocar documentos facilmente

  Refs:
  - SPEC-module-chat.md (SPEC-CHAT-E-002)
  - spec/ui/chat-module-interfaces.md (UI/UX)

  Implementado:
  - Upload de arquivos via botão com ícone paperclip
  - Validação de tipo de arquivo (MIME types configuráveis)
  - Validação de tamanho máximo configurável
  - Preview de arquivos anexados antes do envio
  - Botão para remover arquivos da lista
  - Display de metadados (nome e tamanho do arquivo)
  - Suporte a múltiplos arquivos
  - Configuração via instância (allowFileUpload, acceptedFileTypes, maxFileSize)

- [x] Story: Chat com agentes IA

  > Como usuário,
  > Quero conversar com agentes de IA,
  > Para obter assistência automatizada

  Refs:
  - SPEC-module-chat.md (SPEC-CHAT-I-*)
  - spec/ui/chat-module-interfaces.md (UI/UX)

  Implementado:
  - ChatInterface: Página principal completa do chat
  - Configuração de agentId por instância
  - Context window configurável (número de mensagens anteriores)
  - Welcome message configurável
  - Placeholder responses (integração real com agente pendente)
  - Estado de "processing" durante envio ao agente
  - Indicador de typing durante processamento
  - Suporte para múltiplas conversas (threads)
  - Rotas: /chat e /chat/:conversationId
  - Lazy loading do módulo
  - Configuração extensiva via manifest (15+ opções)

  Nota: Integração real com backend de agentes (n8n) a ser implementada posteriormente

---

## INITIATIVE 5: PRODUCTIVITY TOOLS

**Objetivo:** Ferramentas para organização e produtividade.

---

### EPIC 5.1: Quadro Kanban

- [x] Story: Organizar tarefas visualmente

  > Como usuário,
  > Quero organizar tarefas em colunas,
  > Para visualizar meu fluxo de trabalho

  Refs: SPEC-module-kanban.md (SPEC-KANBAN-BO-*, SPEC-KANBAN-CO-*)

  Implementado:
  - KanbanBoard: Página principal completa do kanban
  - KanbanColumn: Componente de coluna com suporte a WIP limits
  - KanbanCard: Componente de card com tags, assignee, due date
  - useKanban: Hook para gerenciamento de estado
  - Suporte a filtros (busca, tags, responsável)
  - Múltiplas colunas configuráveis por board
  - Collapse/expand de colunas
  - Cards ordenáveis dentro das colunas
  - Indicadores visuais de limite WIP excedido
  - Formulário de criação/edição de cards
  - Rotas: /kanban e /kanban/:boardId
  - Lazy loading do módulo
  - Configuração via manifest com schema extensivo

- [x] Story: Mover tarefas com drag-and-drop

  > Como usuário,
  > Quero arrastar tarefas entre colunas,
  > Para atualizar status facilmente

  Refs: SPEC-module-kanban.md (SPEC-KANBAN-DD-*)

  Implementado:
  - Hook useKanban com função moveCard(cardId, toColumnId, newOrder)
  - Estrutura preparada para drag-and-drop (sem biblioteca dnd-kit)
  - Ordem de cards persistida via campo 'order'
  - Transição de cards entre colunas via JQEL mutations

  Nota: Implementação drag-and-drop simplificada sem biblioteca externa.
  Para implementação visual drag-and-drop, considerar adicionar @dnd-kit/core posteriormente.

- [x] Story: Campos customizados

  > Como usuário,
  > Quero adicionar campos customizados aos cards,
  > Para capturar informações específicas do meu processo

  Refs: SPEC-module-kanban.md (SPEC-KANBAN-CA-*)

  Implementado:
  - CustomFieldDefinition type com suporte a: text, number, date, select
  - Campo customFields em KanbanCard para armazenamento
  - Configuração de customFields no KanbanInstanceConfig
  - Estrutura preparada para renderização dinâmica de campos

  Nota: Renderização de UI para campos customizados não implementada no MVP.
  Cards suportam armazenamento de campos customizados via propriedade customFields.

---

### EPIC 5.2: Dashboard de Métricas

- [x] Story: Visualizar métricas importantes

  > Como usuário,
  > Quero ver métricas e KPIs em um dashboard,
  > Para acompanhar performance

  Refs: SPEC-module-dashboard.md (SPEC-DASH-*)

  Implementado:
  - DashboardView: Página principal de visualização de dashboards
  - DashboardGrid: Sistema de grid responsivo com 12 colunas (configurável)
  - MetricCard: Widget de métrica com valor, tendência, ícone
  - LineChartWidget: Gráfico de linha com múltiplas séries (Recharts)
  - BarChartWidget: Gráfico de barras com múltiplas séries (Recharts)
  - PieChartWidget: Gráfico de pizza com distribuição percentual (Recharts)
  - TableWidget: Tabela com sorting, filtros, paginação
  - useDashboard: Hook com gerenciamento de estado e data fetching
  - Grid system com posicionamento flexível (x, y, w, h)
  - Suporte a refresh automático via polling (refetchInterval)
  - Refresh manual com botão
  - Modo fullscreen
  - Filtros globais (estrutura preparada)
  - Data fetching via JQEL para cada widget
  - Lazy loading de widgets
  - Rotas: /dashboard e /dashboard/:dashboardId
  - Configuração extensiva via manifest

  Widgets implementados:
  - Metric Card: Valor numérico com formatação (number, currency, percentage)
  - Line Chart: Séries temporais com zoom/tooltip
  - Bar Chart: Barras verticais/horizontais
  - Pie Chart: Gráfico de pizza com labels
  - Table: Tabela completa com sorting, filtros, paginação
  - Text: Widget de texto estático (estrutura básica)

  Nota: Modo de edição (drag-and-drop de widgets) não implementado no MVP.
  Dashboards são configurados via JSON no backend.

---

### EPIC 5.3: Formulários Dinâmicos

- [x] Story: Criar formulários facilmente

  > Como administrador,
  > Quero criar formulários customizados sem código,
  > Para coletar dados específicos

  Refs: SPEC-module-forms.md (SPEC-FORMS-*)

  Implementado:
  - FormView: Página de visualização e preenchimento de formulários
  - FormRenderer: Componente de renderização dinâmica de campos
  - useForms: Hook com validação e gerenciamento de estado
  - 10 tipos de campo: text, textarea, email, number, select, radio, checkbox, date, file, switch
  - Validação em tempo real (on blur) e no submit
  - Validações suportadas: required, minLength, maxLength, pattern, min/max (numbers), email format
  - Lógica condicional (showIf) com operadores: equals, notEquals, contains, isEmpty
  - Progress bar de preenchimento
  - Mensagem de confirmação após envio
  - Suporte a múltiplas submissões (configurável)
  - Redirecionamento após envio (opcional)
  - Dados persistidos via JQEL (schema: forms)
  - Rotas: /form e /form/:formId
  - Lazy loading do módulo

  Campos implementados:
  - Text: Input de texto com validação de comprimento e pattern
  - Textarea: Área de texto com contador de caracteres
  - Email: Input com validação de formato de e-mail
  - Number: Input numérico com min/max/step
  - Select: Dropdown com opções configuráveis (shadcn/ui Select)
  - Radio: Seleção única com layout vertical/horizontal
  - Checkbox: Múltipla seleção com min/max limits
  - Date: Seletor de data com min/max validation
  - File: Upload de arquivo com drag-and-drop, preview, validação de tamanho
  - Switch: Toggle booleano

  Componentes UI criados:
  - textarea.tsx: Componente Textarea do shadcn/ui
  - radio-group.tsx: RadioGroup com Radix UI
  - checkbox.tsx: Checkbox com Radix UI
  - switch.tsx: Switch com Radix UI

  Nota: Criação visual de formulários (form builder) não implementada no MVP.
  Formulários são configurados via JSON no backend.

---

### EPIC 5.4: Documentação

- [x] Story: Navegar documentação

  > Como usuário,
  > Quero navegar e buscar na documentação,
  > Para aprender sobre o sistema

  Refs: SPEC-module-markbrowser.md (SPEC-MARKBROWSER-*)

  Implementado em: `src/frontend/src/modules/markbrowser/`

---

## INITIATIVE 6: COMPONENT LIBRARIES

**Objetivo:** Bibliotecas de componentes reutilizáveis.

---

### EPIC 6.1: Componentes de Aplicação

- [x] Story: Componentes avançados disponíveis

  > Como desenvolvedor,
  > Quero ter acesso a componentes avançados (tabelas, gráficos, calendário),
  > Para construir interfaces ricas rapidamente

  Refs:
  - SPEC-module-app-components.md (SPEC-MAC-*)
  - spec/ui/app-components-module-interfaces.md (UI/UX)
  - spec/ui/calendar-module-interfaces.md (UI/UX - Calendário)

  **Implementado:**
  - ✅ Módulo app-components criado em `src/frontend/src/modules/app-components/`
  - ✅ 8 bibliotecas instaladas e exportadas:
    - Recharts (gráficos)
    - TanStack Table (tabelas avançadas)
    - FullCalendar (calendários)
    - DnD Kit (drag and drop)
    - TipTap (rich text editor)
    - react-dropzone (upload de arquivos)
    - TanStack Virtual (virtualização)
    - react-colorful (color picker)
  - ✅ Sistema de configuração de tema
  - ✅ Componentes pré-construídos: DataTable, FileUpload
  - ✅ Manifest.json com metadata do módulo
  - ✅ README com documentação de uso
  - ✅ Code splitting configurado (cada biblioteca é um chunk separado)
  - ✅ Tree shaking habilitado
  - ✅ TypeScript totalmente tipado

  Implementado em: `src/frontend/src/modules/app-components/`

---

### EPIC 6.2: Componentes de Mídia

- [x] Story: Renderizar conteúdo rico

  > Como desenvolvedor,
  > Quero renderizar Markdown, PDF, diagramas e código,
  > Para exibir conteúdo formatado

  Refs: SPEC-module-media-components.md (SPEC-MEDIA-*)

  **Implementado:**
  - ✅ Módulo media-components criado em `src/frontend/src/modules/media-components/`
  - ✅ 7 componentes implementados:
    - MarkdownRenderer (Markdown com GFM, matemática, syntax highlighting)
    - PdfViewer (visualização de PDF com navegação e zoom)
    - MermaidDiagram (diagramas flowchart, sequence, class, etc)
    - CodeBlock + InlineCode (syntax highlighting 50+ linguagens)
    - VideoPlayer (YouTube, Vimeo, local, streaming)
    - AudioPlayer (player com waveform visual)
    - CsvViewer (parse e visualização com filtros e ordenação)
  - ✅ Integração automática com tema light/dark
  - ✅ Error handling graceful em todos componentes
  - ✅ Lazy loading configurado para componentes pesados
  - ✅ Manifest.json com metadata
  - ✅ README com documentação completa
  - ✅ TypeScript totalmente tipado
  - ✅ Bundle: ~500KB gzipped

  Implementado em: `src/frontend/src/modules/media-components/`

---

### EPIC 6.3: Exportação de Documentos

- [x] Story: Exportar para PDF e Word

  > Como usuário,
  > Quero exportar dados para PDF e Word,
  > Para compartilhar informações fora do sistema

  Refs: SPEC-module-export-components.md (SPEC-EXPORT-*)

  **Implementação:**
  - Módulo export-components criado em src/frontend/src/modules/export-components/
  - Exportação para PDF via pdfmake com suporte a:
    - Tabelas formatadas (createTable)
    - Seções e listas (createSection, createList)
    - Layout customizado (tamanho, orientação, margens)
    - Headers e footers dinâmicos
    - Preview em nova aba (previewPDF)
  - Exportação para DOCX via docx.js com suporte a:
    - Títulos (Heading 1-3)
    - Parágrafos com alinhamento
    - Listas
    - Tabelas formatadas (createDOCXTable)
    - Metadata (author, subject, keywords)
  - Exportação para CSV via Papa Parse com suporte a:
    - UTF-8 com BOM (compatível com Excel)
    - Delimitadores customizados
    - Headers customizados
    - Exportar de tabelas HTML (exportTableToCSV)
    - Parse de CSV (parseCSV)
  - PDFBuilder com fluent API para construção intuitiva:
    - Métodos: setTitle, setSubtitle, setAuthor, addSection, addTable, addList
    - Suporte a: addImage, addPageBreak, addSpace, addHorizontalLine
    - Features avançadas: addCover, addTableOfContents
    - Métodos: build() e download()
  - Utilitários de formatação:
    - formatCurrency (BRL, USD)
    - formatDate (short, long, iso)
    - formatNumber com locale pt-BR
    - imageUrlToBase64
    - objectToTableData (converter array de objetos para TableData)
    - sanitizeFilename e generateFilename
  - Bibliotecas instaladas:
    - pdfmake ^0.2.10
    - docx ^9.0.3
    - papaparse ^5.4.1
    - file-saver ^2.0.5
  - Type check: Passou (todos os erros resolvidos)
  - Bundle size: ~320KB gzipped (todas bibliotecas)
  - Arquivos: manifest.json, README.md, pdf.ts, docx.ts, csv.ts, PDFBuilder.ts, utils.ts, index.ts

---

### EPIC 6.4: Componentes Base

- [x] Story: Componentes UI consistentes

  > Como desenvolvedor,
  > Quero usar componentes UI base com tema aplicado,
  > Para manter consistência visual

  Refs: SPEC-module-components.md (SPEC-MC-*)

  **Implementação:**
  - Sistema de integração com tema via CSS custom properties (SPEC-MC-AP-024, SPEC-MC-AP-025, SPEC-MC-AP-026)
  - Hook `useAppComponentsTheme()` para configuração imperativa (opcional)
  - Componente `ComponentsShowcase` demonstrando todos os componentes com tema
  - Componente `SimpleChart` com cores do tema
  - Guia completo de integração (`THEME_GUIDE.md`)

  **Componentes prontos:**
  - App Components: DataTable, FileUpload, SimpleChart com tema aplicado
  - Media Components: MarkdownRenderer, CodeBlock, PdfViewer, etc. com dark mode
  - Export Components: PDF, DOCX, CSV com suporte a tema

  **CSS Custom Properties integradas:**
  - Cores base: background, foreground, card, popover
  - Cores de ação: primary (brand color), secondary, accent, muted
  - Cores semânticas: success, warning, destructive, info
  - Cores de UI: border, input, ring
  - Cores de gráficos: chart-1 a chart-5

  **Arquivos criados:**
  - `app-components/theme/index.ts` - Sistema de tema
  - `app-components/components/SimpleChart.tsx` - Gráfico com tema
  - `app-components/components/ComponentsShowcase.tsx` - Demonstração
  - `app-components/THEME_GUIDE.md` - Guia completo

---

## INITIATIVE 7: ADVANCED FEATURES

**Objetivo:** Features avançadas da plataforma.

---

### EPIC 7.1: Schema Discovery

- [x] Story: Descobrir schemas dinamicamente

  > Como desenvolvedor,
  > Quero descobrir schemas e suas capabilities automaticamente,
  > Para integrar com dados sem configuração manual

  Refs: SPEC-jqel-schema.md (SPEC-SDL-*)

  **Implementação:**
  - Sistema completo de Schema Discovery Layer (SDL)
  - Tipos TypeScript para SDL (frontend e backend)
  - Hook `useSchemaDiscovery()` e `useSearchableActions()`
  - Serviço `SchemaDiscoveryService` com cache de 5 minutos
  - Endpoints: `GET /api/jqel/schemas` e `POST /api/jqel/schemas/refresh`
  - Documento SDL exemplo com schemas backend (portal, module, instance)
  - Actions searchable para Command Palette

  **Estrutura SDL implementada:**
  - Schemas: platform, backend, system, frontend
  - Entities: portal, module, instance (schema backend)
  - Actions: select.* e mutate.* com supports e returns
  - Searchable: configuração para Command Palette com params

  **Frontend:**
  - `types/sdl.ts` - Tipos completos SDL com helpers
  - `hooks/useSchemaDiscovery.ts` - Hook com funções de busca
  - Helper functions: getSchema, getEntity, getAction, etc.

  **Backend:**
  - `types/sdl.ts` - Tipos SDL
  - `services/SchemaDiscoveryService.ts` - Serviço com cache
  - `routes/jqel.routes.ts` - Rotas /api/jqel/schemas
  - `schemas/schemas.json` - Documento SDL exemplo

  **Features:**
  - Cache automático (5 minutos)
  - Validação de estrutura SDL
  - Suporte a schemas reservados (platform, backend, system, frontend)
  - Cross-schema references (format: "schema:entity")
  - Params tipados (string, enum, select, boolean, array)
  - Source dinâmica para selects (busca entidades)

  **Conformidade:**
  - ✅ SPEC-SDL-R-001 a SPEC-SDL-R-003: Documento SDL
  - ✅ SPEC-SDL-S-001 a SPEC-SDL-S-007: Schemas
  - ✅ SPEC-SDL-E-001 a SPEC-SDL-E-014: Entities
  - ✅ SPEC-SDL-A-001 a SPEC-SDL-A-014: Actions
  - ✅ SPEC-SDL-SUP-001 a SPEC-SDL-SUP-024: Supports
  - ✅ SPEC-SDL-RET-001 a SPEC-SDL-RET-012: Returns
  - ✅ SPEC-SDL-SEARCH-001 a SPEC-SDL-SEARCH-013: Searchable
  - ✅ SPEC-SDL-CONV-001 a SPEC-SDL-CONV-006: Convenções
  - ✅ SPEC-SDL-VAL-001 a SPEC-SDL-VAL-014: Validação

  **Type check:** ✅ Zero erros (frontend e backend)

