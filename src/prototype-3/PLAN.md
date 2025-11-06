# Platform Implementation Plan - Value-Driven

**Metodologia:** Value-Driven (User-Centric)  
**Versão:** 1.0  
**Data:** 2025-11-05  
**Status:** 0% Completo

---

## Legenda

- `[ ]` — Pendente (0%)
- `[-]` — Em Implementação (>0% e <100%)
- `[x]` — Feito (100%)

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
**Status:** 0% Completo

---

### EPIC 1.1: Ambiente de Desenvolvimento

#### Story: Setup do projeto base
```
Como desenvolvedor,
Quero ter um ambiente de desenvolvimento configurado,
Para começar a implementar features da plataforma

Refs: SPEC-architecture.md (SPEC-A-FE-*, SPEC-A-BE-*)
```
- [x] Setup do projeto base

#### Story: PWA funcional
```
Como usuário,
Quero poder instalar a aplicação no meu dispositivo,
Para ter acesso offline e experiência nativa

Refs: SPEC-architecture.md (SPEC-A-PWA-*)
```
- [x] PWA funcional

---

### EPIC 1.2: Sistema de Autenticação

#### Story: Login com credenciais
```
Como usuário,
Quero fazer login com usuário e senha,
Para acessar o sistema de forma segura

Refs: SPEC-authentication.md (SPEC-AU-LO-*), SPEC-frontend-state.md (SPEC-FS-AU-*)
```
- [x] Login com credenciais

#### Story: Sessão persistente
```
Como usuário,
Quero que minha sessão seja mantida entre recarregamentos,
Para não precisar fazer login toda vez

Refs: SPEC-authentication.md (SPEC-AU-RE-*, SPEC-AU-TO-*)
```
- [x] Sessão persistente

#### Story: Logout seguro
```
Como usuário,
Quero fazer logout e encerrar minha sessão,
Para garantir segurança em dispositivos compartilhados

Refs: SPEC-authentication.md (SPEC-AU-LGT-*, SPEC-AU-LA-*)
```
- [ ] Logout seguro

#### Story: Validação de permissões
```
Como sistema,
Quero validar permissões do usuário antes de executar ações,
Para garantir segurança e controle de acesso

Refs: SPEC-authentication.md (SPEC-AU-AZ-*)
```
- [x] Validação de permissões
  - Implementado tipos para autorização (AuthorizeRequest, AuthorizeResponse, PermissionCheck)
  - Hook useAuthorize() para chamar /api/1/auth/authorize
  - Hook usePermission() para verificação declarativa com loading states
  - Componente RequirePermission para proteção de UI baseada em permissões
  - Componente ProtectedRoute com suporte opcional a verificação de permissões
  - Exemplos de uso em SessionStatus (hook-based e component-based)

#### Story: Proteção contra ataques
```
Como sistema,
Quero ter proteção contra brute force e rate limiting,
Para garantir segurança da aplicação

Refs: SPEC-authentication.md (SPEC-AU-RL-*)
```
- [x] Proteção contra ataques
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

#### Story: Navegação entre portais
```
Como usuário,
Quero navegar entre diferentes portais da plataforma,
Para acessar diferentes áreas da aplicação

Refs: SPEC-routing.md (SPEC-R-BS-*), SPEC-concepts.md
```
- [ ] Navegação entre portais

#### Story: Rotas protegidas
```
Como sistema,
Quero proteger rotas que requerem autenticação,
Para garantir que apenas usuários autenticados acessem áreas restritas

Refs: SPEC-routing.md (SPEC-R-PR-*)
```
- [x] Navegação entre portais (Story 1.3.1 completa)
  - Backend: Portal CRUD routes (/api/portals) com file-based storage
  - Backend: Portal service com CRUD operations em config/portals.json
  - Backend: Portal types (Portal interface)
  - Frontend: Portal types (Portal, PortalResponse, PortalListResponse)
  - Frontend: Routing types (RouteDefinition, PortalRouteConfig, RouteMatch)
  - Frontend: portalClient service (fetchAllPortals, fetchPortalById, createPortal, updatePortal, deletePortal)
  - Frontend: PortalLoader component com loading/error states
  - Frontend: PortalRouter component (main portal "/" + outros "/:portalId/*")
  - Frontend: NotFound page (404)
  - Frontend: App.tsx integrado com PortalRouter
  - Initial portals: "main" (empty) e "setup" (com module "setup")
  - SPEC-R-STR-001: Main portal usa "/", outros usam "/:portalId/*"
  - SPEC-R-PRI-001: Route priority implementada (exact > partial > wildcard)

#### Story: Rotas protegidas
```
Como sistema,
Quero proteger rotas que requerem autenticação,
Para garantir que apenas usuários autenticados acessem áreas restritas

Refs: SPEC-routing.md (SPEC-R-PR-*)
```
- [x] Rotas protegidas (Story 1.3.2 completa)
  - Frontend: Login page component (/pages/Login.tsx)
  - Frontend: ProtectedRoute component integrado no PortalRouter
  - Frontend: Rota pública /login (não requer autenticação)
  - Frontend: Todas as rotas de portais protegidas por ProtectedRoute
  - SPEC-R-RP-001 a SPEC-R-RP-004: Proteção de rotas implementada
  - SPEC-R-RP-004: Redirecionamento para /login quando não autenticado
  - Validação: type-check e build passaram sem erros
  - Comportamento: usuários não autenticados são redirecionados para login
  - Comportamento: usuários autenticados redirecionados de /login para /

#### Story: Carregamento eficiente
```
Como usuário,
Quero que a aplicação carregue rapidamente,
Para ter uma experiência fluida

Refs: SPEC-routing.md (SPEC-R-LL-*), SPEC-architecture.md (SPEC-A-LL-*)
```
- [x] Carregamento eficiente (Story 1.3.3 completa)
  - Implementado React.lazy() para todas as páginas (Login, NotFound, PortalLanding, PortalContent)
  - Criado LazyErrorBoundary para tratamento de erros de carregamento (SPEC-R-TE-004 a SPEC-R-TE-009)
  - Adicionados Suspense wrappers com skeleton loaders (PageSkeleton, PortalSkeleton, ModuleSkeleton)
  - Otimizada configuração de code splitting no vite.config.ts
  - Chunks organizados por categoria: vendor-react, vendor-router, vendor-tanstack, vendor-icons, vendor-ui, vendor-forms
  - Chunks de páginas separados: page-Login, page-NotFound, page-PortalLanding, page-PortalContent
  - Chunks de core separados: core-routing, core-auth, core-services
  - Bundle inicial: ~77KB gzipped (bem abaixo do limite de 200KB - SPEC-A-LL-007)
  - Todos os chunks < 500KB (SPEC-A-LL-009)
  - Maior chunk: vendor-react 64KB gzipped
  - Páginas lazy-loaded: 0.35-0.45 KB gzipped cada
  - SPEC-R-LD-001 a SPEC-R-LD-005: Lazy loading implementado
  - SPEC-R-PE-001 a SPEC-R-PE-004: Code splitting e performance otimizados
  - SPEC-A-LL-001 a SPEC-A-LL-010: Requisitos de lazy loading atendidos
  - Validação: type-check e build passaram sem erros
  - PWA precache: 16 entradas (266.26 KB)

---

### EPIC 1.4: Acesso e Manipulação de Dados

#### Story: Consultar dados
```
Como desenvolvedor,
Quero consultar dados de diferentes schemas,
Para exibir informações na interface

Refs: SPEC-data-access.md (SPEC-DA-*), SPEC-jqel-syntax.md (SPEC-JQEL-QR-*)
```
- [x] Consultar dados (Story 1.4.1 completa)
  - Frontend: JQEL types (JQELQuery, JQELSelectQuery, JQELMutateQuery, JResult, JQELError)
  - Frontend: JQEL HTTP client (jqelClient.ts) com token refresh automático
  - Frontend: Query key factory (queryKeys.ts) para gerenciamento de cache
  - Frontend: useJQELQuery hook com TanStack Query integration
  - Frontend: Hooks especializados (useJQELRecord, useJQELList, useJQELPaginated)
  - Frontend: Example components (PortalListExample.tsx) demonstrando uso
  - Backend: JQEL types (jqel.types.ts)
  - Backend: JQEL endpoint (POST /api/jqel) com validação de queries
  - Backend: JQEL router service (schema-based routing: backend/platform/system/app)
  - Backend: Backend processor service (file-based CRUD para backend schema)
  - Backend: Rota /api/jqel registrada no Express app
  - SPEC-DA-W-001 a SPEC-DA-W-011: JQEL wrapper implementado
  - SPEC-DA-TQ-001 a SPEC-DA-TQ-015: TanStack Query integração completa
  - SPEC-DA-ERR-001 a SPEC-DA-ERR-008: Error handling e retry logic
  - SPEC-DA-PERF-001 a SPEC-DA-PERF-003: Cache configuration otimizado
  - SPEC-JQEL-STR-001 a SPEC-JQEL-STR-006: Estrutura de query validada
  - SPEC-JQEL-SCH-004 a SPEC-JQEL-SCH-006: Schema routing implementado
  - Validação: type-check e build passaram em frontend e backend
  - Exemplo funcional: consulta de portals via JQEL com loading/error states

#### Story: Modificar dados
```
Como usuário,
Quero criar, atualizar e deletar dados,
Para gerenciar informações do sistema

Refs: SPEC-data-access.md (SPEC-DA-MU-*), SPEC-jqel-syntax.md (SPEC-JQEL-MU-*)
```
- [x] Modificar dados (Story 1.4.2 completa - useJQELMutation, useInsert, useUpdate, useDelete, optimistic updates, cache invalidation)

#### Story: Dados sempre atualizados
```
Como usuário,
Quero ver dados sempre atualizados sem recarregar a página,
Para ter informações em tempo real

Refs: SPEC-events.md (SPEC-EV-*), SPEC-data-access.md (SPEC-DA-RT-*)
```
- [x] Dados sempre atualizados (Story 1.4.3 completa)
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

#### Story: Tratamento de erros
```
Como desenvolvedor,
Quero um sistema robusto de tratamento de erros,
Para garantir que falhas em queries e mutations sejam tratadas adequadamente

Refs: SPEC-data-access.md (SPEC-DA-ERR-*), SPEC-error-handling.md
```
- [x] Tratamento de erros (Story 1.4.4 completa)
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

#### Story: Receber notificações
```
Como usuário,
Quero receber notificações em tempo real,
Para ser informado sobre eventos importantes imediatamente

Refs: SPEC-events.md (SPEC-EV-SSE-*, SPEC-EV-NO-*)
```
- [x] Receber notificações (Story 1.5.1 completa - 2025-11-06)

#### Story: Tarefas interativas
```
Como usuário,
Quero receber tarefas que requerem minha ação,
Para responder a solicitações do sistema

Refs: SPEC-events.md (SPEC-EV-TA-*)
```
- [x] Tarefas interativas (Story 1.5.2 completa - 2025-11-06)

#### Story: Sincronização offline
```
Como usuário,
Quero que eventos sejam sincronizados quando volto online,
Para não perder informações importantes

Refs: SPEC-events.md (SPEC-EV-OF-*, SPEC-EV-ST-*)
```
- [x] Sincronização offline (Story 1.5.3 completa - 2025-11-06)

---

### EPIC 1.6: Personalização Visual

#### Story: Tema claro e escuro
```
Como usuário,
Quero escolher entre tema claro e escuro,
Para adaptar a interface ao meu ambiente e preferência

Refs: SPEC-theming.md (SPEC-TH-MO-*, SPEC-TH-PR-*)
```
- [x] Tema claro e escuro (Implementado em Story 2.2.4 - ThemeProvider com light/dark/system modes)

#### Story: Identidade visual customizada
```
Como administrador,
Quero definir a cor da marca da aplicação,
Para manter identidade visual da organização

Refs: SPEC-theming.md (SPEC-TH-CO-*, SPEC-TH-SE-*)
```
- [x] Identidade visual customizada (Implementado em Story 2.2.4 - Brand color picker com palette generation)

#### Story: Tema compartilhado
```
Como usuário,
Quero que minhas preferências de tema sejam compartilhadas entre portais,
Para ter experiência visual consistente

Refs: SPEC-theming.md (SPEC-TH-SK-*)
```
- [x] Tema compartilhado (Implementado em Story 2.2.4 - Settings key scoping para theme sharing)

#### Story: Acessibilidade visual
```
Como usuário com deficiência visual,
Quero que o contraste de cores seja adequado,
Para conseguir ler e usar a aplicação

Refs: SPEC-theming.md (SPEC-TH-AC-*)
```
- [x] Acessibilidade visual (Implementado em Story 2.2.4 - WCAG AA contrast validation)

---

### EPIC 1.7: Configuração da Plataforma

#### Story: Configurações persistentes
```
Como administrador,
Quero que configurações da aplicação sejam salvas,
Para não perder configurações após restart

Refs: SPEC-configuration.md (SPEC-CF-AS-*, SPEC-CF-PS-*)
```
- [x] Configurações persistentes (Story 1.7.1 completa - 2025-11-06)
  - Backend: configService.ts - File-based configuration management (portals.json, modules.json, instances.json)
  - Backend: Config validation with Zod schemas (Portal, Module, Instance schemas)
  - Backend: File loading with validation and error handling
  - Backend: Save methods for portals, modules, instances
  - Backend: Config caching with invalidation on save
  - SPEC-CF-AS-001: Application Settings stored in JSON files
  - SPEC-CF-AS-002: Files in /config directory on Backend
  - SPEC-CF-AS-004: Files are readable and editable manually (emergency access)
  - Type check: Passou (backend e frontend)
  - Build: Sucesso (backend e frontend)

#### Story: Configuração sem restart
```
Como administrador,
Quero alterar configurações da aplicação sem restart,
Para aplicar mudanças imediatamente

Refs: SPEC-configuration.md (SPEC-CF-AS-012:013)
```
- [x] Configuração sem restart (Story 1.7.2 completa - 2025-11-06)
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

#### Story: Integração segura com n8n
```
Como sistema,
Quero comunicar com n8n de forma segura,
Para processar workflows no backbone

Refs: SPEC-configuration.md (SPEC-CF-N8-*)
```
- [x] Integração segura com n8n (Story 1.7.3 completa - 2025-11-06)
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

#### Story: Mensagens de erro claras
```
Como usuário,
Quero ver mensagens de erro claras e acionáveis,
Para entender o que aconteceu e como resolver

Refs: SPEC-error-handling.md (SPEC-EH-DI-*, SPEC-EH-EB-*)
```
- [x] Mensagens de erro claras (Implementado em Story 1.4.4 - Error boundaries, fallback components, user-friendly messages)

#### Story: Recuperação automática
```
Como usuário,
Quero que o sistema tente recuperar automaticamente de erros,
Para ter menos interrupções na minha experiência

Refs: SPEC-error-handling.md (SPEC-EH-RE-*)
```
- [x] Recuperação automática (Implementado em Story 1.4.4 - Retry logic com exponential backoff, error recovery mechanisms)

#### Story: Logs para debug
```
Como desenvolvedor,
Quero ter logs estruturados de erros,
Para debugar problemas em produção

Refs: SPEC-error-handling.md (SPEC-EH-LO-*)
```
- [x] Logs para debug (Implementado em Story 1.4.4 - errorLogger.ts com níveis ERROR/WARN/INFO/DEBUG, sanitização de dados sensíveis)

---

### EPIC 1.9: Roteamento de Dados

#### Story: Canais de dados isolados
```
Como desenvolvedor,
Quero que diferentes schemas de dados sejam isolados,
Para garantir segurança e organização

Refs: SPEC-channels.md (SPEC-CH-*)
```
- [x] Canais de dados isolados (Story 1.9.1 completa - 2025-11-06)
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

#### Story: Controle de acesso granular
```
Como administrador,
Quero controlar quem pode acessar quais dados,
Para garantir segurança e compliance

Refs: SPEC-access-parameters.md (SPEC-AP-*)
```
- [x] Controle de acesso granular (Story 1.9.2 completa - 2025-11-06)
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
**Status:** 5% Completo

---

### Foundation: Module Type System & Setup Module Definition

#### Story 2.0.1: Definir tipos e estrutura de módulo
```
Como desenvolvedor,
Quero ter tipos TypeScript claros para o sistema de módulos,
Para garantir type safety ao criar e gerenciar módulos

Refs: SPEC-concepts.md (SPEC-C-M-*), SPEC-modules.md (SPEC-MO-MA-*, SPEC-MO-RO-*)
```
- [x] Definir tipos de módulo (Story 2.0.1 completa - 2025-11-06)
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
  - Arquivos criados em src/prototype-3/frontend/src/types/module.ts
  - Arquivos criados em src/prototype-3/frontend/src/modules/setup/*

---

### EPIC 2.1: Gerenciamento de Módulos
#### Story 2.1.1: Registrar módulo```Como sistema,Quero registrar módulos disponíveis no sistema,Para que eles possam ser descobertos e carregadosRefs: SPEC-modules.md (SPEC-MO-RE-*)```- [x] Registrar módulo (Story 2.1.1 completa - 2025-11-06)  - Frontend: ModuleRegistry.ts - Central module registry singleton  - Frontend: ModuleRegistry methods: register(), getModule(), getAllModules(), hasModule(), unregister()  - Frontend: ModuleRegistry methods: getModulesByType(), getModulesByCategory(), validateDependencies(), getStats(), clear()  - Frontend: registerModules.ts - Function to register all platform modules  - Frontend: core/modules/index.ts - Barrel export for module system  - Frontend: App.tsx - Initialize module registry on app startup via useEffect  - SPEC-MO-ST-001 to SPEC-MO-ST-008: Module structure requirements  - SPEC-MO-MA-001 to SPEC-MO-MA-012: Module manifest validation  - SPEC-MO-DE-005 to SPEC-MO-DE-009: Dependency validation  - SPEC-MO-MC-002: Component modules type filtering  - SPEC-MO-MF-002: Functionality modules type filtering  - Registry is singleton pattern for thread-safe operations  - Type-safe storage with TypeScript  - Defensive programming with validation (alphanumeric IDs, duplicate prevention)  - Development mode logging for debugging  - Validation: type-check passed  - Validation: build passed (bundle size: initial ~77KB gzipped)  - Setup module auto-registers on import  - Arquivos criados em src/prototype-3/frontend/src/core/modules/*

#### Story 2.1.2: Carregar módulos sob demanda
```
Como sistema,
Quero carregar módulos apenas quando necessário,
Para ter melhor performance e tempo de carregamento

Refs: SPEC-modules.md (SPEC-MO-LC-*), SPEC-architecture.md (SPEC-A-LL-*)
```
- [x] Carregar módulos sob demanda (Story 2.1.2 completa - 2025-11-06)
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

#### Story 1.5.4: Gerenciar dependências
```
Como sistema,
Quero gerenciar dependências entre módulos automaticamente,
Para garantir que módulos funcionem corretamente

Refs: SPEC-modules.md (SPEC-MO-DE-*)
```
- [x] Gerenciar dependências (Story 1.5.4 completa - 2025-11-06)
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

#### Story: Ativar e desativar módulos
```
Como administrador,
Quero ativar e desativar módulos em tempo real,
Para controlar quais funcionalidades estão disponíveis

Refs: SPEC-modules.md (SPEC-MO-LC-009:017), SPEC-module-loading.md (SPEC-LOAD-D-*)
```
---
- [x] Ativar e desativar módulos (Story completa - 2025-11-06)
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

#### Story: Gerenciar portais
```
Como administrador,
Quero criar e gerenciar diferentes portais,
Para organizar a aplicação em áreas distintas

Refs: SPEC-module-setup.md (SPEC-MS-FU-001:005), SPEC-concepts.md
```
- [x] Gerenciar portais (Story completa - 2025-11-06)
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

#### Story: Ativar módulos por portal
```
Como administrador,
Quero ativar módulos específicos em cada portal,
Para customizar funcionalidades por área

Refs: SPEC-module-setup.md (SPEC-MS-FU-006:012)
```
- [x] Ativar módulos por portal (Story completa - 2025-11-06)
- Frontend: PortalModules.tsx - Página completa de gerenciamento de módulos por portal (implementado)  - Frontend: ModuleActivationCard.tsx - Card para ativação/desativação com dependências (criado)  - Frontend: usePortalModules.ts - Hook customizado para gerenciar módulos do portal (criado)  - Frontend: moduleActivationSchema.ts - Schemas Zod para validação de ativação/desativação (criado)  - Frontend: PortalModuleActivationExample.tsx - 5 exemplos completos de uso (criado)  - UI: Listagem de módulos com filtros (todos/ativos/disponíveis) e busca  - UI: Cards de módulos com toggle de ativação, dependências e status visual  - UI: Confirmação ao ativar (mostra dependências que serão ativadas)  - UI: Validação ao desativar (impede se houver dependentes ativos)  - JQEL: useUpdate para persistir portal.activeModules (schema: platform, entity: portal)  - ActivationManager: Runtime activation via activateModule (SPEC-MO-LC-009:013)  - ActivationManager: Runtime deactivation via deactivateModule (SPEC-MO-LC-014:017)  - Validação: Dependências devem estar ativas antes de ativar módulo (SPEC-MS-VA-007)  - Validação: Dependentes devem ser desativados antes de desativar módulo (SPEC-MS-VA-008)  - Validação: Detecção de dependências circulares (SPEC-MS-VA-009)  - Features: Auto-ativação de dependências com confirmação  - Features: Listagem de dependentes ao tentar desativar  - Features: Portal-scoped activation (mesmo módulo estados diferentes por portal)  - Features: Busca e filtros para encontrar módulos  - Features: Stats de módulos (total, ativos, disponíveis)  - Type check: Passou  - Build: Sucesso (bundle size dentro dos limites)  - SPEC compliance: SPEC-MS-FU-006:012 (gerenciamento de módulos por portal)  - SPEC compliance: SPEC-MS-UI-016:021 (interface de módulos)  - SPEC compliance: SPEC-MO-LC-009:017 (ativação/desativação runtime)  - SPEC compliance: SPEC-MO-DE-005:011 (gerenciamento de dependências)

#### Story: Configurar instâncias de módulos
```
Como administrador,
Quero configurar múltiplas instâncias de um módulo,
Para ter diferentes configurações do mesmo módulo

Refs: SPEC-module-setup.md (SPEC-MS-FU-013:017), SPEC-modules.md (SPEC-MO-IN-*)
```
- [x] Configurar instâncias de módulos (Story 1.5.5 completa - 2025-11-06)
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

#### Story: Customizar tema visualmente
```
Como administrador,
Quero escolher cores do tema usando um color picker,
Para personalizar a aparência facilmente

Refs: SPEC-module-setup.md (SPEC-MS-TH-*), SPEC-theming.md (SPEC-TH-*)
```
- [x] Customizar tema visualmente (Story completa - 2025-11-06)
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

#### Story: Monitorar saúde do sistema
```
Como administrador,
Quero ver o status de saúde dos serviços,
Para identificar problemas rapidamente

Refs: SPEC-module-setup.md (SPEC-MS-HE-*)
```
- [x] Monitorar saúde do sistema (Story completa - 2025-11-06)
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
**Status:** 0% Completo

---

### EPIC 3.1: Autenticação de Usuários

#### Story: Login rápido
```
Como usuário,
Quero fazer login de forma rápida e intuitiva,
Para acessar o sistema sem fricção

Refs: SPEC-module-auth.md (SPEC-AUTH-UI-*, SPEC-AUTH-CT-*)
```
- [ ] Login rápido

#### Story: Múltiplos métodos de autenticação
```
Como usuário,
Quero escolher diferentes formas de autenticação,
Para usar o método mais conveniente

Refs: SPEC-module-auth.md (SPEC-AUTH-RE-*)
```
- [ ] Múltiplos métodos de autenticação

#### Story: Acesso protegido
```
Como desenvolvedor,
Quero proteger rotas facilmente com um componente,
Para garantir que apenas usuários autorizados acessem

Refs: SPEC-module-auth.md (SPEC-AUTH-PR-*)
```
- [ ] Acesso protegido

---

### EPIC 3.2: Centro de Notificações

#### Story: Ver notificações recentes
```
Como usuário,
Quero ver minhas notificações mais recentes,
Para me manter informado sobre eventos importantes

Refs: SPEC-module-notifications.md (SPEC-NOTIF-UI-001:009)
```
- [ ] Ver notificações recentes

#### Story: Histórico completo
```
Como usuário,
Quero acessar histórico completo de notificações,
Para revisar notificações antigas

Refs: SPEC-module-notifications.md (SPEC-NOTIF-UI-010:014)
```
- [ ] Histórico completo

#### Story: Notificações em tempo real
```
Como usuário,
Quero receber notificações instantaneamente,
Para ser alertado sobre eventos importantes imediatamente

Refs: SPEC-module-notifications.md (SPEC-NOTIF-F-001:004)
```
- [ ] Notificações em tempo real

#### Story: Gerenciar notificações
```
Como usuário,
Quero marcar notificações como lidas e arquivar,
Para manter meu centro de notificações organizado

Refs: SPEC-module-notifications.md (SPEC-NOTIF-F-005:008, SPEC-NOTIF-O-014:016)
```
- [ ] Gerenciar notificações

---

### EPIC 3.3: Tarefas Interativas

#### Story: Ver tarefas pendentes
```
Como usuário,
Quero ver todas as tarefas que requerem minha ação,
Para saber o que preciso fazer

Refs: SPEC-module-tasks.md (SPEC-TASKS-UI-*)
```
- [ ] Ver tarefas pendentes

#### Story: Responder tarefas
```
Como usuário,
Quero responder tarefas diretamente na interface,
Para completar ações requeridas rapidamente

Refs: SPEC-module-tasks.md (SPEC-TASKS-AC-*, SPEC-TASKS-S-*)
```
- [ ] Responder tarefas

---

### EPIC 3.4: Busca Rápida

#### Story: Buscar em todo o sistema
```
Como usuário,
Quero buscar qualquer coisa no sistema rapidamente,
Para encontrar o que preciso sem navegar menus

Refs: SPEC-module-command-palette.md (SPEC-CP-M-*, SPEC-CP-S-*)
```
- [ ] Buscar em todo o sistema

#### Story: Executar comandos rápidos
```
Como usuário,
Quero executar ações comuns via atalhos,
Para ser mais produtivo

Refs: SPEC-module-command-palette.md (SPEC-CP-K-*, SPEC-CP-C-*)
```
- [ ] Executar comandos rápidos

#### Story: Invocar agentes
```
Como usuário,
Quero invocar agentes de IA para me ajudar,
Para obter assistência inteligente

Refs: SPEC-module-command-palette.md (SPEC-CP-AG-*)
```
- [ ] Invocar agentes

---

### EPIC 3.5: Navegação Principal

#### Story: Menu lateral
```
Como usuário,
Quero ter um menu lateral para navegar,
Para acessar diferentes áreas rapidamente

Refs: SPEC-module-sidebar.md (SPEC-SB-*)
```
- [ ] Menu lateral

---

### EPIC 3.6: Guias e Onboarding

#### Story: Jornada de onboarding
```
Como novo usuário,
Quero ser guiado pelos recursos da plataforma,
Para aprender a usar o sistema rapidamente

Refs: SPEC-module-journey.md (SPEC-JO-*)
```
- [ ] Jornada de onboarding

---

### EPIC 3.7: Estados de Carregamento

#### Story: Feedback visual de carregamento
```
Como usuário,
Quero ver indicadores claros quando algo está carregando,
Para saber que o sistema está processando

Refs: SPEC-module-loading.md (SPEC-LOAD-SK-*, SPEC-LOAD-SP-*)
```
- [ ] Feedback visual de carregamento

---

## INITIATIVE 4: COMMUNICATION & COLLABORATION

**Objetivo:** Ferramentas para comunicação e colaboração entre usuários.  
**Status:** 0% Completo

---

### EPIC 4.1: Chat em Tempo Real

#### Story: Conversar com outros usuários
```
Como usuário,
Quero enviar mensagens para outros usuários,
Para me comunicar em tempo real

Refs: SPEC-module-chat.md (SPEC-CHAT-UI-*, SPEC-CHAT-RT-*)
```
- [ ] Conversar com outros usuários

#### Story: Histórico de conversas
```
Como usuário,
Quero acessar histórico de conversas anteriores,
Para revisar informações trocadas

Refs: SPEC-module-chat.md (SPEC-CHAT-P-*)
```
- [ ] Histórico de conversas

#### Story: Compartilhar arquivos
```
Como usuário,
Quero compartilhar arquivos no chat,
Para trocar documentos facilmente

Refs: SPEC-module-chat.md (SPEC-CHAT-E-002)
```
- [ ] Compartilhar arquivos

#### Story: Chat com agentes IA
```
Como usuário,
Quero conversar com agentes de IA,
Para obter assistência automatizada

Refs: SPEC-module-chat.md (SPEC-CHAT-I-*)
```
- [ ] Chat com agentes IA

---

## INITIATIVE 5: PRODUCTIVITY TOOLS

**Objetivo:** Ferramentas para organização e produtividade.  
**Status:** 0% Completo

---

### EPIC 5.1: Quadro Kanban

#### Story: Organizar tarefas visualmente
```
Como usuário,
Quero organizar tarefas em colunas,
Para visualizar meu fluxo de trabalho

Refs: SPEC-module-kanban.md (SPEC-KANBAN-BO-*, SPEC-KANBAN-CO-*)
```
- [ ] Organizar tarefas visualmente

#### Story: Mover tarefas com drag-and-drop
```
Como usuário,
Quero arrastar tarefas entre colunas,
Para atualizar status facilmente

Refs: SPEC-module-kanban.md (SPEC-KANBAN-DD-*)
```
- [ ] Mover tarefas com drag-and-drop

#### Story: Campos customizados
```
Como usuário,
Quero adicionar campos customizados aos cards,
Para capturar informações específicas do meu processo

Refs: SPEC-module-kanban.md (SPEC-KANBAN-CA-*)
```
- [ ] Campos customizados

---

### EPIC 5.2: Dashboard de Métricas

#### Story: Visualizar métricas importantes
```
Como usuário,
Quero ver métricas e KPIs em um dashboard,
Para acompanhar performance

Refs: SPEC-module-dashboard.md (SPEC-DASH-*)
```
- [ ] Visualizar métricas importantes

---

### EPIC 5.3: Formulários Dinâmicos

#### Story: Criar formulários facilmente
```
Como administrador,
Quero criar formulários customizados sem código,
Para coletar dados específicos

Refs: SPEC-module-forms.md (SPEC-FORMS-*)
```
- [ ] Criar formulários facilmente

---

### EPIC 5.4: Documentação

#### Story: Navegar documentação
```
Como usuário,
Quero navegar e buscar na documentação,
Para aprender sobre o sistema

Refs: SPEC-module-markbrowser.md (SPEC-MARKBROWSER-*)
```
- [ ] Navegar documentação

---

## INITIATIVE 6: COMPONENT LIBRARIES

**Objetivo:** Bibliotecas de componentes reutilizáveis.  
**Status:** 0% Completo

---

### EPIC 6.1: Componentes de Aplicação

#### Story: Componentes avançados disponíveis
```
Como desenvolvedor,
Quero ter acesso a componentes avançados (tabelas, gráficos, calendário),
Para construir interfaces ricas rapidamente

Refs: SPEC-module-app-components.md (SPEC-MAC-*)
```
- [ ] Componentes avançados disponíveis

---

### EPIC 6.2: Componentes de Mídia

#### Story: Renderizar conteúdo rico
```
Como desenvolvedor,
Quero renderizar Markdown, PDF, diagramas e código,
Para exibir conteúdo formatado

Refs: SPEC-module-media-components.md (SPEC-MMC-*)
```
- [ ] Renderizar conteúdo rico

---

### EPIC 6.3: Exportação de Documentos

#### Story: Exportar para PDF e Word
```
Como usuário,
Quero exportar dados para PDF e Word,
Para compartilhar informações fora do sistema

Refs: SPEC-module-export-components.md (SPEC-EXPORT-*)
```
- [ ] Exportar para PDF e Word

---

### EPIC 6.4: Componentes Base

#### Story: Componentes UI consistentes
```
Como desenvolvedor,
Quero usar componentes UI base com tema aplicado,
Para manter consistência visual

Refs: SPEC-module-components.md (SPEC-MC-*)
```
- [ ] Componentes UI consistentes

---

## INITIATIVE 7: ADVANCED FEATURES

**Objetivo:** Features avançadas da plataforma.  
**Status:** 0% Completo

---

### EPIC 7.1: Schema Discovery

#### Story: Descobrir schemas dinamicamente
```
Como desenvolvedor,
Quero descobrir schemas e suas capabilities automaticamente,
Para integrar com dados sem configuração manual

Refs: SPEC-jqel-schema.md (SPEC-SDL-*)
```
- [ ] Descobrir schemas dinamicamente

---

## Summary

| Initiative | Epics | Stories | Status |
|-----------|-------|---------|--------|
| 1. Foundation | 9 | 28 | ⏳ 0% |
| 2. Module System | 2 | 5 | ⏳ 0% |
| 3. User Experience | 7 | 12 | ⏳ 0% |
| 4. Communication | 1 | 4 | ⏳ 0% |
| 5. Productivity | 4 | 5 | ⏳ 0% |
| 6. Component Libraries | 4 | 4 | ⏳ 0% |
| 7. Advanced Features | 1 | 1 | ⏳ 0% |
| **TOTAL** | **28** | **59** | **0%** |

---

**Próximo:** Iniciar Initiative 1 (Platform Foundation)
