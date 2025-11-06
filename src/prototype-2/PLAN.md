# Platform Implementation Plan - Task-Driven

**Metodologia:** Task-Driven (Sistêmico)  
**Versão:** 1.0  
**Data:** 2025-11-05  
**Status:** Fundamentos Completos | Módulos Pendentes

---

## Legenda

- `[ ]` — Pendente (0%)
- `[-]` — Em Implementação (>0% e <100%)
- `[x]` — Feito (100%)

---

## LEITURA FUNDAMENTAL

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

## INCREMENTO 1: PLATFORM FOUNDATION ✅

**Objetivo:** Base funcional da plataforma - autenticação, rotas, dados, eventos.  
**Status:** 0% Completo

---

### SISTEMA 1.1: Projeto Base ✅

#### Componente: Setup Inicial
- [x] Criar estrutura de pastas (frontend, backend, shared)
  Refs: SPEC-architecture.md (SPEC-A-FE-001:006, SPEC-A-BE-001:005)

- [x] Configurar TypeScript (tsconfig para frontend e backend)
  Refs: SPEC-architecture.md (SPEC-A-FE-002, SPEC-A-BE-002)

- [x] Configurar Vite para frontend
  Refs: SPEC-architecture.md (SPEC-A-FE-003)

- [x] Configurar Express para backend
  Refs: SPEC-architecture.md (SPEC-A-BE-003)

#### Componente: PWA Setup
- [x] Criar manifest.json
  Refs: SPEC-architecture.md (SPEC-A-PWA-001:003)

- [x] Implementar service worker básico
  Refs: SPEC-architecture.md (SPEC-A-PWA-004:006)

- [x] Configurar code splitting no Vite
  Refs: SPEC-architecture.md (SPEC-A-LL-001:010)

---

### SISTEMA 1.2: Roteamento ✅

#### Componente: Router Base
- [x] Implementar PortalRouter com React Router
  Refs: SPEC-routing.md (SPEC-R-BS-001:008)

- [x] Implementar rota "/" para portal main
  Refs: SPEC-routing.md (SPEC-R-BS-001, SPEC-R-BS-003)

- [x] Implementar rota "/:portalId/*" para outros portais
  Refs: SPEC-routing.md (SPEC-R-BS-002, SPEC-R-BS-004)

#### Componente: Dynamic Routes
- [x] Criar função registerRoutes()
  Refs: SPEC-routing.md (SPEC-R-DY-001:009), SPEC-module-loading.md (SPEC-LOAD-R-001:007)

- [x] Implementar prefixação automática por portal
  Refs: SPEC-routing.md (SPEC-R-PR-001:004)

- [x] Implementar lazy loading de rotas
  Refs: SPEC-routing.md (SPEC-R-LL-001:007)

#### Componente: Protected Routes
- [x] Criar componente ProtectedRoute
  Refs: SPEC-routing.md (SPEC-R-PR-001:008)

- [x] Implementar validação de autenticação
  Refs: SPEC-routing.md (SPEC-R-PR-002:005)

- [x] Implementar redirecionamento para login
  Refs: SPEC-routing.md (SPEC-R-PR-006:008)

---

### SISTEMA 1.3: Autenticação ✅

#### Componente: Auth Endpoints Backend
- [x] Implementar /api/1/auth/login
  Refs: SPEC-authentication.md (SPEC-AU-LO-*)

- [x] Implementar /api/1/auth/refresh
  Refs: SPEC-authentication.md (SPEC-AU-RE-*)

- [x] Implementar /api/1/auth/logout
  Refs: SPEC-authentication.md (SPEC-AU-LGT-*)

- [x] Implementar /api/1/auth/logout-all
  Refs: SPEC-authentication.md (SPEC-AU-LA-*)

- [x] Implementar /api/1/auth/authorize
  Refs: SPEC-authentication.md (SPEC-AU-AZ-*)

#### Componente: Token Management
- [x] Implementar geração de JWT
  Refs: SPEC-authentication.md (SPEC-AU-LO-013:016)

- [x] Implementar rotação de refresh tokens
  Refs: SPEC-authentication.md (SPEC-AU-RE-012:015)

- [x] Implementar detecção de reuso de tokens
  Refs: SPEC-authentication.md (SPEC-AU-RE-016:021)

- [x] Implementar revogação de tokens
  Refs: SPEC-authentication.md (SPEC-AU-LGT-006:007)

#### Componente: Auth Context Frontend
- [x] Criar AuthContext com React Context
  Refs: SPEC-frontend-state.md (SPEC-FS-AU-001:007)

- [x] Implementar armazenamento seguro de tokens
  Refs: SPEC-authentication.md (SPEC-AU-TO-001:005)

- [x] Implementar renovação automática de tokens
  Refs: SPEC-authentication.md (SPEC-AU-TO-006:009)

#### Componente: Rate Limiting
- [x] Implementar rate limiting por IP
  Refs: SPEC-authentication.md (SPEC-AU-RL-001:008)

- [x] Implementar proteção contra brute force
  Refs: SPEC-authentication.md (SPEC-AU-RL-009:013)

#### Componente: Logout UI (User Story: Logout seguro)
- [x] Criar SessionStatus component com informações do usuário
  Refs: SPEC-authentication.md (SPEC-AU-LO-*, SPEC-AU-LA-*)

- [x] Implementar botão de logout (sessão atual)
  Refs: SPEC-authentication.md (SPEC-AU-LO-013:015)

- [x] Implementar botão de logout-all (todos os dispositivos)
  Refs: SPEC-authentication.md (SPEC-AU-LA-010)

- [x] Adicionar confirmação antes de logout-all
  Best practice: Prevenir logout acidental de todas as sessões

- [x] Adicionar feedback visual com toast após logout
  UX: Confirmar ação bem-sucedida ao usuário

- [x] Criar AlertDialog component (shadcn/ui pattern)
  Componente reutilizável para confirmações críticas

---

### SISTEMA 1.4: Acesso a Dados (JQEL) ✅

#### Componente: JQEL Endpoint
- [x] Criar /api/jqel no backend
  Refs: SPEC-data-access.md (SPEC-DA-EP-001:009)

- [x] Implementar validação de queries
  Refs: SPEC-jqel-syntax.md (SPEC-JQEL-QR-*, SPEC-JQEL-MU-*)

- [x] Implementar envelope JResult
  Refs: SPEC-jqel-syntax.md (SPEC-JQEL-RE-001:009)

#### Componente: JQEL Router
- [x] Implementar roteamento por schema
  Refs: SPEC-data-access.md (SPEC-DA-SC-001:007), SPEC-channels.md (SPEC-CH-RO-*)

- [x] Implementar proxy para n8n (schema "platform")
  Refs: SPEC-architecture.md (SPEC-A-D-007)

- [x] Implementar processamento local (schema "backend")
  Refs: SPEC-architecture.md (SPEC-A-D-008)

#### Componente: TanStack Query Integration
- [x] Criar hooks useJQELQuery
  Refs: SPEC-data-access.md (SPEC-DA-TQ-001:010)

- [x] Criar hooks useJQELMutation
  Refs: SPEC-data-access.md (SPEC-DA-MU-001:012)

- [x] Implementar invalidação de cache
  Refs: SPEC-data-access.md (SPEC-DA-IN-001:008)

- [x] Implementar optimistic updates
  Refs: SPEC-data-access.md (SPEC-DA-OP-001:009)

#### Componente: Error Handling
- [x] Implementar retry logic
  Refs: SPEC-data-access.md (SPEC-DA-ERR-004:005)

- [x] Implementar error boundaries
  Refs: SPEC-data-access.md (SPEC-DA-ERR-006:008)

---

### SISTEMA 1.5: Eventos em Tempo Real ✅ CONCLUÍDO

#### Componente: SSE Server
- [x] Criar endpoint /api/events (SSE)
  Refs: SPEC-events.md (SPEC-EV-SSE-001:016)
  Status: ✅ CONCLUÍDO - Task 1.5.1

- [x] Implementar heartbeat e keepalive
  Refs: SPEC-events.md (SPEC-EV-SSE-010:012)
  Status: ✅ CONCLUÍDO - Task 1.5.2 (integrado no SSE service)

- [x] Implementar reconnection automática
  Refs: SPEC-events.md (SPEC-EV-SSE-013:016)
  Status: ✅ CONCLUÍDO - Task 1.5.3 (suporte via Last-Event-ID)

#### Componente: Redis Integration
- [x] Configurar Redis Pub/Sub
  Refs: SPEC-events.md (SPEC-EV-PS-001:010)
  Status: ✅ CONCLUÍDO - Task 1.5.4

- [x] Configurar Redis Streams para buffering
  Refs: SPEC-events.md (SPEC-EV-ST-001:013)
  Status: ✅ CONCLUÍDO - Task 1.5.5

- [x] Implementar recuperação offline
  Refs: SPEC-events.md (SPEC-EV-OF-001:010)
  Status: ✅ CONCLUÍDO - Task 1.5.6

#### Componente: Event Types
- [x] Implementar Notification events
  Refs: SPEC-events.md (SPEC-EV-NO-001:009)
  Status: ✅ CONCLUÍDO - Task 1.5.7

- [x] Implementar Task events
  Refs: SPEC-events.md (SPEC-EV-TA-001:010)
  Status: ✅ CONCLUÍDO - Task 1.5.8

#### Componente: Frontend SSE Client
- [x] Criar EventSource connection manager
  Refs: SPEC-events.md (SPEC-EV-FE-001:007)
  Status: ✅ CONCLUÍDO - Task 1.5.9

- [x] Implementar event handlers
  Refs: SPEC-events.md (SPEC-EV-FE-008:012)
  Status: ✅ CONCLUÍDO - Task 1.5.10

- [x] Integrar com TanStack Query (invalidação)
  Refs: SPEC-events.md (SPEC-EV-FE-013:016)
  Status: ✅ CONCLUÍDO - Task 1.5.11

---

### SISTEMA 1.6: Temas e UI ✅

#### Componente: Theme System
- [x] Criar ThemeProvider
  Refs: SPEC-theming.md (SPEC-TH-PR-001:006)

- [x] Implementar detecção de modo (light/dark/system)
  Refs: SPEC-theming.md (SPEC-TH-MO-001:008)

- [x] Implementar persistência de preferências
  Refs: SPEC-theming.md (SPEC-TH-PE-001:004)

#### Componente: Color Generation
- [x] Implementar geração de paleta a partir de brand color
  Refs: SPEC-theming.md (SPEC-TH-CO-001:009)

- [x] Implementar validação WCAG AA
  Refs: SPEC-theming.md (SPEC-TH-AC-001:007)

- [x] Gerar cores semânticas (success, warning, error, info)
  Refs: SPEC-theming.md (SPEC-TH-SE-001:004)

#### Componente: CSS Variables
- [x] Gerar CSS custom properties
  Refs: SPEC-theming.md (SPEC-TH-CS-001:008)

- [x] Aplicar tema globalmente
  Refs: SPEC-theming.md (SPEC-TH-AP-001:005)

#### Componente: Settings Key
- [x] Implementar compartilhamento de tema por settings-key
  Refs: SPEC-theming.md (SPEC-TH-SK-001:005)

---

### SISTEMA 1.7: Configuração ✅

#### Componente: Platform Settings
- [x] Configurar .env para settings de plataforma
  Refs: SPEC-configuration.md (SPEC-CF-PS-001:012)

- [x] Validar variáveis obrigatórias no startup
  Refs: SPEC-configuration.md (SPEC-CF-PS-013:016)

- [x] Implementar carregamento por ambiente
  Refs: SPEC-configuration.md (SPEC-CF-PS-017:019)

#### Componente: Application Settings
- [x] Criar estrutura de arquivos JSON
  Refs: SPEC-configuration.md (SPEC-CF-AS-001:004)

- [x] Implementar acesso via JQEL
  Refs: SPEC-configuration.md (SPEC-CF-AS-005:008)

- [x] Implementar hot reload de configurações
  Refs: SPEC-configuration.md (SPEC-CF-AS-012:013)

#### Componente: n8n Integration
- [x] Implementar header X-Platform-Key
  Refs: SPEC-configuration.md (SPEC-CF-N8-001:006)

- [x] Validar chave de plataforma
  Refs: SPEC-configuration.md (SPEC-CF-N8-007:009)

---

### SISTEMA 1.8: Tratamento de Erros ✅

#### Componente: Error Boundaries
- [x] Criar GlobalErrorBoundary
  Refs: SPEC-error-handling.md (SPEC-EH-EB-001:006)

- [x] Criar PortalErrorBoundary
  Refs: SPEC-error-handling.md (SPEC-EH-EB-007:010)

- [x] Criar ModuleErrorBoundary
  Refs: SPEC-error-handling.md (SPEC-EH-EB-011:014)

#### Componente: Logging System
- [x] Configurar Winston para logging
  Refs: SPEC-error-handling.md (SPEC-EH-LO-001:010)

- [x] Implementar níveis (ERROR, WARN, INFO, DEBUG)
  Refs: SPEC-error-handling.md (SPEC-EH-LO-011:014)

- [x] Implementar logging estruturado
  Refs: SPEC-error-handling.md (SPEC-EH-LO-015:018)

#### Componente: Error Display
- [x] Implementar exibição via toast
  Refs: SPEC-error-handling.md (SPEC-EH-DI-001:004)

- [x] Implementar exibição via modal
  Refs: SPEC-error-handling.md (SPEC-EH-DI-005:007)

- [x] Implementar exibição inline
  Refs: SPEC-error-handling.md (SPEC-EH-DI-008:010)

#### Componente: Retry Logic
- [x] Implementar retry com backoff exponencial
  Refs: SPEC-error-handling.md (SPEC-EH-RE-001:007)

- [x] Implementar circuit breaker
  Refs: SPEC-error-handling.md (SPEC-EH-RE-008:012)

---

### SISTEMA 1.9: Estado Frontend ✅

#### Componente: Platform State
- [x] Criar PlatformContext
  Refs: SPEC-frontend-state.md (SPEC-FS-PL-001:007)
  Implementado em: PlatformProvider.tsx (Task 1.9.1)

- [x] Gerenciar lista de portais
  Refs: SPEC-frontend-state.md (SPEC-FS-PL-008:010)
  Implementado em: PlatformProvider.tsx (Task 1.9.2)

- [x] Gerenciar lista de módulos
  Refs: SPEC-frontend-state.md (SPEC-FS-PL-011:013)
  Implementado em: PlatformProvider.tsx (Task 1.9.3)

#### Componente: Auth State
- [x] Criar AuthContext
  Refs: SPEC-frontend-state.md (SPEC-FS-AU-001:007)
  Implementado em: AuthProvider.tsx (Task 1.3.10)

- [x] Gerenciar tokens em memória
  Refs: SPEC-frontend-state.md (SPEC-FS-AU-008:010)
  Implementado em: AuthProvider.tsx (access token em state, refresh em storage)

- [x] Gerenciar user info
  Refs: SPEC-frontend-state.md (SPEC-FS-AU-011:013)
  Implementado em: AuthProvider.tsx (user state com todos os campos)

#### Componente: Data State
- [x] Configurar QueryClient (TanStack Query)
  Refs: SPEC-frontend-state.md (SPEC-FS-DA-001:007)
  Implementado em: main.tsx (Task 1.4.3)

- [x] Configurar cache defaults
  Refs: SPEC-frontend-state.md (SPEC-FS-DA-008:010)
  Implementado em: main.tsx (refetchOnWindowFocus, retry, staleTime)

#### Componente: Hydration Order
- [ ] Implementar ordem de hidratação  
  Refs: SPEC-frontend-state.md (SPEC-FS-HY-001:007)

---

### SISTEMA 1.10: Canais e Acesso

#### Componente: Data Channels
- [x] Implementar roteamento por schema
  Refs: SPEC-channels.md (SPEC-CH-RO-*)

- [x] Implementar schemas reservados (platform, backend, system)
  Refs: SPEC-channels.md (SPEC-CH-P-*, SPEC-CH-B-*, SPEC-CH-S-*)

#### Componente: Access Parameters
- [x] Implementar validação de parâmetros
  Refs: SPEC-access-parameters.md (SPEC-AP-*)
  Status: ✅ CONCLUÍDO - Task 1.10.3 (2025-11-06)

- [x] Implementar controle granular de permissões
  Refs: SPEC-access-parameters.md (SPEC-AP-*)
  Status: ✅ CONCLUÍDO - Task 1.10.4 (2025-11-06)

---

## INCREMENTO 2: MODULE SYSTEM ✅

**Objetivo:** Infraestrutura para carregar e gerenciar módulos dinamicamente.  
**Status:** 0% Completo

---

### SISTEMA 2.1: Module Infrastructure ✅

**US-2.1: Infraestrutura de Módulos**
- [x] Backend: Criar rotas `/api/1/portals` (GET / e GET /:portalId)
- [x] Backend: Criar serviço de leitura de portals.json
- [x] Frontend: Criar types para Portal e Routing
- [x] Frontend: Criar portalClient para fetch de configurações
- [x] Frontend: Criar PortalLoader para carregar configuração
- [x] Frontend: Integrar React Router no App.tsx
- [x] Frontend: Criar página NotFound para 404 global
- [x] Validação: type-check backend e frontend
Status: ✅ Completo (2025-11-06)

#### Componente: Module Manifest
- [ ] Definir estrutura do manifesto
  Refs: SPEC-modules.md (SPEC-MO-MA-001:013)

- [ ] Implementar validação de manifesto
  Refs: SPEC-modules.md (SPEC-MO-MA-005:006)

#### Componente: Module Loading
- [ ] Criar função loadModule()
  Refs: SPEC-module-loading.md (SPEC-LOAD-I-001:005)

- [ ] Implementar lazy loading com dynamic imports
  Refs: SPEC-module-loading.md (SPEC-LOAD-CS-001:005)

- [ ] Implementar loading states
  Refs: SPEC-module-loading.md (SPEC-LOAD-I-003:005)

#### Componente: Dependency Resolution
- [ ] Implementar resolução de dependências
  Refs: SPEC-modules.md (SPEC-MO-DE-014:017), SPEC-module-loading.md (SPEC-LOAD-DEP-001:004)

- [ ] Detectar dependências circulares
  Refs: SPEC-module-loading.md (SPEC-LOAD-DEP-005:007)

- [ ] Ativar dependências automaticamente
  Refs: SPEC-modules.md (SPEC-MO-DE-007)

#### Componente: Module Registry
- [ ] Criar registry de módulos carregados
  Refs: SPEC-module-loading.md (SPEC-LOAD-C-001:002)

- [ ] Criar registry de rotas por portal
  Refs: SPEC-module-loading.md (SPEC-LOAD-R-001:002)

- [ ] Criar registry de componentes por portal
  Refs: SPEC-module-loading.md (SPEC-LOAD-C-003:005)

#### Componente: Module Lifecycle
- [ ] Implementar onActivate hook
  Refs: SPEC-modules.md (SPEC-MO-LC-009:013), SPEC-module-loading.md (SPEC-LOAD-E-007)

- [ ] Implementar onDeactivate hook  
  Refs: SPEC-modules.md (SPEC-MO-LC-014:017), SPEC-module-loading.md (SPEC-LOAD-E-008)

#### Componente: HMR (Development)
- [ ] Implementar Hot Module Replacement  
  Refs: SPEC-module-loading.md (SPEC-LOAD-DEV-001:003)

- [ ] Criar Module Registry Inspector  
  Refs: SPEC-module-loading.md (SPEC-LOAD-DEV-004:005)

---

### SISTEMA 2.2: Setup Module ✅

#### Componente: Portal CRUD
- [ ] Implementar listagem de portais  
  Refs: SPEC-module-setup.md (SPEC-MS-FU-001)

- [ ] Implementar criação de portal  
  Refs: SPEC-module-setup.md (SPEC-MS-FU-002)

- [ ] Implementar edição de portal  
  Refs: SPEC-module-setup.md (SPEC-MS-FU-003)

- [ ] Implementar remoção de portal  
  Refs: SPEC-module-setup.md (SPEC-MS-FU-004:005)

#### Componente: Module Management
- [ ] Implementar listagem de módulos disponíveis  
  Refs: SPEC-module-setup.md (SPEC-MS-FU-006)

- [ ] Implementar ativação de módulo  
  Refs: SPEC-module-setup.md (SPEC-MS-FU-007)

- [ ] Implementar desativação de módulo  
  Refs: SPEC-module-setup.md (SPEC-MS-FU-008)

- [ ] Exibir e resolver dependências  
  Refs: SPEC-module-setup.md (SPEC-MS-FU-009:012)

#### Componente: Instance CRUD
- [ ] Implementar listagem de instâncias  
  Refs: SPEC-module-setup.md (SPEC-MS-FU-013)

- [ ] Implementar criação de instância  
  Refs: SPEC-module-setup.md (SPEC-MS-FU-014)

- [ ] Implementar edição de instância  
  Refs: SPEC-module-setup.md (SPEC-MS-FU-015)

- [ ] Implementar remoção de instância  
  Refs: SPEC-module-setup.md (SPEC-MS-FU-016)

- [ ] Validar configuração com schema  
  Refs: SPEC-module-setup.md (SPEC-MS-FU-017)

#### Componente: Theme Configuration
- [ ] Implementar color picker para brand color  
  Refs: SPEC-module-setup.md (SPEC-MS-TH-001:006)

- [ ] Preview de tema em tempo real  
  Refs: SPEC-module-setup.md (SPEC-MS-TH-007:010)

#### Componente: Platform Settings View
- [ ] Exibir platform settings (read-only)  
  Refs: SPEC-module-setup.md (SPEC-MS-PS-001:005)

#### Componente: Health Checks
- [ ] Implementar health check n8n  
  Refs: SPEC-module-setup.md (SPEC-MS-HE-001:003)

- [ ] Implementar health check Redis  
  Refs: SPEC-module-setup.md (SPEC-MS-HE-004:006)

- [ ] Implementar health check Backend  
  Refs: SPEC-module-setup.md (SPEC-MS-HE-007:009)

---

## INCREMENTO 3: FUNCTIONAL MODULES

**Objetivo:** Módulos de funcionalidade que entregam experiências completas.  
**Status:** 0% Completo

---

### SISTEMA 3.1: Authentication Module

#### Componente: Auth UI
- [ ] Criar tela de login  
  Refs: SPEC-module-auth.md (SPEC-AUTH-UI-001:010)

- [ ] Criar formulário de login  
  Refs: SPEC-module-auth.md (SPEC-AUTH-UI-011:015)

- [ ] Implementar validação client-side  
  Refs: SPEC-module-auth.md (SPEC-AUTH-UI-016:020)

#### Componente: Auth Context Provider
- [ ] Criar AuthProvider para módulo  
  Refs: SPEC-module-auth.md (SPEC-AUTH-CT-001:008)

- [ ] Gerenciar estado de autenticação  
  Refs: SPEC-module-auth.md (SPEC-AUTH-CT-009:013)

#### Componente: Protected Route Component
- [ ] Criar componente ProtectedRoute reutilizável  
  Refs: SPEC-module-auth.md (SPEC-AUTH-PR-001:008)

#### Componente: Token Renewal
- [ ] Implementar renovação automática  
  Refs: SPEC-module-auth.md (SPEC-AUTH-RN-001:008)

#### Componente: Realm Selection
- [ ] Implementar seleção de realm configurável  
  Refs: SPEC-module-auth.md (SPEC-AUTH-RE-001:006)

#### Componente: Permission Validation
- [ ] Integrar com /api/1/auth/authorize  
  Refs: SPEC-module-auth.md (SPEC-AUTH-PV-001:007)

---

### SISTEMA 3.2: Chat Module

#### Componente: Chat Interface
- [ ] Criar interface de chat principal  
  Refs: SPEC-module-chat.md (SPEC-CHAT-UI-001:010)

- [ ] Implementar lista de mensagens  
  Refs: SPEC-module-chat.md (SPEC-CHAT-UI-011:015)

- [ ] Implementar campo de input  
  Refs: SPEC-module-chat.md (SPEC-CHAT-UI-016:020)

#### Componente: Real-time Messaging
- [ ] Integrar com SSE para mensagens  
  Refs: SPEC-module-chat.md (SPEC-CHAT-RT-001:008)

- [ ] Implementar presença de usuários  
  Refs: SPEC-module-chat.md (SPEC-CHAT-RT-009:013)

#### Componente: Message History
- [ ] Implementar carregamento de histórico via JQEL  
  Refs: SPEC-module-chat.md (SPEC-CHAT-P-001:004)

- [ ] Implementar paginação  
  Refs: SPEC-module-chat.md (SPEC-CHAT-P-004)

#### Componente: File Upload
- [ ] Implementar upload de arquivos  
  Refs: SPEC-module-chat.md (SPEC-CHAT-E-002)

#### Componente: Agent Integration
- [ ] Integrar com canal de agentes  
  Refs: SPEC-module-chat.md (SPEC-CHAT-I-001:007)

---

### SISTEMA 3.3: Dashboard Module

#### Componente: Dashboard Layout
- [ ] Criar sistema de grid para widgets  
  Refs: SPEC-module-dashboard.md (SPEC-DASH-LA-*)

- [ ] Implementar drag-and-drop de widgets  
  Refs: SPEC-module-dashboard.md (SPEC-DASH-DD-*)

#### Componente: Widget System
- [ ] Criar arquitetura de widgets  
  Refs: SPEC-module-dashboard.md (SPEC-DASH-WI-*)

- [ ] Implementar widgets de métricas  
  Refs: SPEC-module-dashboard.md (SPEC-DASH-ME-*)

#### Componente: Data Visualization
- [ ] Integrar Recharts para gráficos  
  Refs: SPEC-module-dashboard.md (SPEC-DASH-VI-*)

- [ ] Criar componentes de visualização  
  Refs: SPEC-module-dashboard.md (SPEC-DASH-CO-*)

---

### SISTEMA 3.4: Kanban Module

#### Componente: Board Layout
- [ ] Criar estrutura de board  
  Refs: SPEC-module-kanban.md (SPEC-KANBAN-BO-001:010)

- [ ] Implementar colunas  
  Refs: SPEC-module-kanban.md (SPEC-KANBAN-CO-001:008)

#### Componente: Card System
- [ ] Criar componente de card  
  Refs: SPEC-module-kanban.md (SPEC-KANBAN-CA-001:012)

- [ ] Implementar campos customizáveis  
  Refs: SPEC-module-kanban.md (SPEC-KANBAN-CA-013:018)

#### Componente: Drag and Drop
- [ ] Integrar @dnd-kit  
  Refs: SPEC-module-kanban.md (SPEC-KANBAN-DD-001:010)

- [ ] Implementar persistência via JQEL  
  Refs: SPEC-module-kanban.md (SPEC-KANBAN-J-001:003)

---

### SISTEMA 3.5: Forms Module

#### Componente: Form Generator
- [ ] Criar gerador de formulários dinâmicos  
  Refs: SPEC-module-forms.md (SPEC-FORMS-GE-*)

#### Componente: Validation
- [ ] Integrar React Hook Form + Zod  
  Refs: SPEC-module-forms.md (SPEC-FORMS-VA-*)

#### Componente: Multi-step Forms
- [ ] Implementar wizard multi-step  
  Refs: SPEC-module-forms.md (SPEC-FORMS-MS-*)

---

### SISTEMA 3.6: Notifications Module

#### Componente: Notification Badge
- [ ] Criar badge de notificações  
  Refs: SPEC-module-notifications.md (SPEC-NOTIF-UI-001:004)

#### Componente: Notification Dropdown
- [ ] Criar dropdown com últimas notificações  
  Refs: SPEC-module-notifications.md (SPEC-NOTIF-UI-005:009)

#### Componente: Notification Center
- [ ] Criar página completa de notificações  
  Refs: SPEC-module-notifications.md (SPEC-NOTIF-UI-010:014)

#### Componente: SSE Integration
- [ ] Escutar eventos via SSE  
  Refs: SPEC-module-notifications.md (SPEC-NOTIF-F-001:004)

- [ ] Implementar toast/snackbar  
  Refs: SPEC-module-notifications.md (SPEC-NOTIF-O-001:004)

---

### SISTEMA 3.7: Tasks Module

#### Componente: Task List
- [ ] Criar lista de tasks  
  Refs: SPEC-module-tasks.md (SPEC-TASKS-UI-*)

#### Componente: Task Actions
- [ ] Implementar ações de task  
  Refs: SPEC-module-tasks.md (SPEC-TASKS-AC-*)

#### Componente: Task Status
- [ ] Gerenciar estados de task  
  Refs: SPEC-module-tasks.md (SPEC-TASKS-ST-*)

---

### SISTEMA 3.8: Sidebar Module

#### Componente: Sidebar Layout
- [ ] Criar estrutura de sidebar  
  Refs: SPEC-module-sidebar.md (SPEC-SB-LA-*)

#### Componente: Navigation Menu
- [ ] Implementar menu de navegação  
  Refs: SPEC-module-sidebar.md (SPEC-SB-NA-*)

#### Componente: Collapsible
- [ ] Implementar collapse/expand  
  Refs: SPEC-module-sidebar.md (SPEC-SB-CO-*)

---

### SISTEMA 3.9: Journey Module

#### Componente: Journey Flow
- [ ] Criar fluxo de onboarding  
  Refs: SPEC-module-journey.md (SPEC-JO-FL-*)

#### Componente: Progress Tracking
- [ ] Implementar tracking de progresso  
  Refs: SPEC-module-journey.md (SPEC-JO-PR-*)

---

### SISTEMA 3.10: Command Palette Module

#### Componente: Palette UI
- [ ] Criar interface suspensa  
  Refs: SPEC-module-command-palette.md (SPEC-CP-M-001:005)

- [ ] Criar interface expandida  
  Refs: SPEC-module-command-palette.md (SPEC-CP-M-006:009)

#### Componente: Search Engine
- [ ] Implementar busca fuzzy  
  Refs: SPEC-module-command-palette.md (SPEC-CP-S-001:008)

#### Componente: SDL Integration
- [ ] Integrar com JQEL SDL searchable  
  Refs: SPEC-module-command-palette.md (SPEC-CP-SD-001:011)

#### Componente: Keyboard Shortcuts
- [ ] Implementar atalhos de teclado  
  Refs: SPEC-module-command-palette.md (SPEC-CP-K-001:004)

---

### SISTEMA 3.11: Loading Module

#### Componente: Loading States
- [ ] Criar componentes de skeleton  
  Refs: SPEC-module-loading.md (SPEC-LOAD-SK-*)

- [ ] Criar componentes de spinner  
  Refs: SPEC-module-loading.md (SPEC-LOAD-SP-*)

#### Componente: Error Fallbacks
- [ ] Criar fallbacks de erro  
  Refs: SPEC-module-loading.md (SPEC-LOAD-ERR-*)

---

### SISTEMA 3.12: MarkBrowser Module

#### Componente: Markdown Renderer
- [ ] Integrar react-markdown  
  Refs: SPEC-module-markbrowser.md (SPEC-MARKBROWSER-RE-*)

#### Componente: Document Navigation
- [ ] Criar navegação de documentos  
  Refs: SPEC-module-markbrowser.md (SPEC-MARKBROWSER-NA-*)

#### Componente: Syntax Highlighting
- [ ] Integrar Prism.js  
  Refs: SPEC-module-markbrowser.md (SPEC-MARKBROWSER-SH-*)

---

## INCREMENTO 4: COMPONENT LIBRARIES

**Objetivo:** Bibliotecas reutilizáveis de componentes.  
**Status:** 0% Completo

---

### SISTEMA 4.1: App Components

#### Componente: Module Setup
- [ ] Criar estrutura do módulo  
  Refs: SPEC-module-app-components.md (SPEC-MAC-001:005)

- [ ] Configurar package.json  
  Refs: SPEC-module-app-components.md (SPEC-MAC-006:010)

#### Componente: TanStack Table
- [ ] Re-exportar TanStack Table  
  Refs: SPEC-module-app-components.md (SPEC-MAC-011)

- [ ] Criar wrapper com tema  
  Refs: SPEC-module-app-components.md (SPEC-MAC-012:015)

#### Componente: Recharts
- [ ] Re-exportar Recharts  
  Refs: SPEC-module-app-components.md (SPEC-MAC-016)

- [ ] Aplicar tema da plataforma  
  Refs: SPEC-module-app-components.md (SPEC-MAC-017:020)

#### Componente: FullCalendar
- [ ] Re-exportar FullCalendar  
  Refs: SPEC-module-app-components.md (SPEC-MAC-021)

#### Componente: DnD Kit
- [ ] Re-exportar @dnd-kit  
  Refs: SPEC-module-app-components.md (SPEC-MAC-022)

#### Componente: TipTap
- [ ] Re-exportar TipTap  
  Refs: SPEC-module-app-components.md (SPEC-MAC-023)

#### Componente: Outros
- [ ] Re-exportar react-dropzone  
  Refs: SPEC-module-app-components.md (SPEC-MAC-024)

- [ ] Re-exportar react-colorful  
  Refs: SPEC-module-app-components.md (SPEC-MAC-025)

- [ ] Re-exportar @tanstack/react-virtual  
  Refs: SPEC-module-app-components.md (SPEC-MAC-026)

---

### SISTEMA 4.2: Media Components

#### Componente: Module Setup
- [ ] Criar estrutura do módulo  
  Refs: SPEC-module-media-components.md (SPEC-MMC-001:005)

#### Componente: Markdown
- [ ] Re-exportar react-markdown  
  Refs: SPEC-module-media-components.md (SPEC-MMC-006)

#### Componente: PDF
- [ ] Re-exportar react-pdf  
  Refs: SPEC-module-media-components.md (SPEC-MMC-007)

#### Componente: Mermaid
- [ ] Re-exportar Mermaid  
  Refs: SPEC-module-media-components.md (SPEC-MMC-008)

#### Componente: Syntax Highlighting
- [ ] Re-exportar Prism.js  
  Refs: SPEC-module-media-components.md (SPEC-MMC-009)

#### Componente: Video Player
- [ ] Re-exportar react-player  
  Refs: SPEC-module-media-components.md (SPEC-MMC-010)

#### Componente: Audio
- [ ] Re-exportar wavesurfer.js  
  Refs: SPEC-module-media-components.md (SPEC-MMC-011)

#### Componente: CSV Parser
- [ ] Re-exportar Papa Parse  
  Refs: SPEC-module-media-components.md (SPEC-MMC-012)

---

### SISTEMA 4.3: Export Components

#### Componente: Module Setup
- [ ] Criar estrutura do módulo  
  Refs: SPEC-module-export-components.md (SPEC-EXPORT-001:005)

#### Componente: PDF Generation
- [ ] Re-exportar pdfmake  
  Refs: SPEC-module-export-components.md (SPEC-EXPORT-006)

- [ ] Configurar fontes  
  Refs: SPEC-module-export-components.md (SPEC-EXPORT-F-001:005)

#### Componente: Word Generation
- [ ] Re-exportar docx.js  
  Refs: SPEC-module-export-components.md (SPEC-EXPORT-007)

#### Componente: CSV Export
- [ ] Re-exportar Papa Parse  
  Refs: SPEC-module-export-components.md (SPEC-EXPORT-008)

#### Componente: File Saver
- [ ] Re-exportar file-saver  
  Refs: SPEC-module-export-components.md (SPEC-EXPORT-009)

---

### SISTEMA 4.4: Base Components

#### Componente: Module Setup
- [ ] Criar estrutura do módulo  
  Refs: SPEC-module-components.md (SPEC-MC-001:005)

#### Componente: shadcn/ui Integration
- [ ] Re-exportar shadcn/ui com tema  
  Refs: SPEC-module-components.md (SPEC-MC-006:010)

---

## INCREMENTO 5: ADVANCED FEATURES

**Objetivo:** Features avançadas da plataforma.  
**Status:** 0% Completo

---

### SISTEMA 5.1: JQEL SDL

#### Componente: SDL Parser
- [ ] Criar parser de SDL  
  Refs: SPEC-jqel-schema.md (SPEC-SDL-PA-*)

- [ ] Validar schemas  
  Refs: SPEC-jqel-schema.md (SPEC-SDL-VA-*)

#### Componente: Type Generation
- [ ] Gerar tipos TypeScript  
  Refs: SPEC-jqel-schema.md (SPEC-SDL-TY-*)

#### Componente: Capability Discovery
- [ ] Implementar descoberta de capabilities  
  Refs: SPEC-jqel-schema.md (SPEC-SDL-CA-*)

#### Componente: Searchable Extension
- [ ] Implementar extensão searchable  
  Refs: SPEC-jqel-schema.md (SPEC-SDL-SEARCH-001:005)

---

### SISTEMA 5.2: Advanced Channels

#### Componente: Channel Routing
- [ ] Implementar roteamento avançado  
  Refs: SPEC-channels.md (SPEC-CH-RO-*)

#### Componente: Schema Isolation
- [ ] Implementar isolamento de schemas  
  Refs: SPEC-channels.md (SPEC-CH-IS-*)

---

### SISTEMA 5.3: Access Parameters

#### Componente: Parameter Validation
- [ ] Implementar sistema de validação  
  Refs: SPEC-access-parameters.md (SPEC-AP-VA-*)

#### Componente: Permission Control
- [ ] Implementar controle granular  
  Refs: SPEC-access-parameters.md (SPEC-AP-PE-*)

---

## Summary

- ✅ Completo
- ⏳ Incompleto

| Incremento | Sistemas | Componentes | Tarefas | Status |
|------------|----------|-------------|---------|--------|
| 1. Foundation | 10 | 42 | 120+ | ⏳ 0% |
| 2. Module System | 2 | 12 | 35+ | ⏳ 0% |
| 3. Functional Modules | 12 | 48+ | 150+ | ⏳ 0% |
| 4. Component Libraries | 4 | 16+ | 50+ | ⏳ 0% |
| 5. Advanced Features | 3 | 9+ | 30+ | ⏳ 0% |
| **TOTAL** | **31** | **127+** | **385+** | **0%** |

---

**Próximo:** Iniciar Incremento 1 (Platform Foundation)
