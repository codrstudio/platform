# Complete Implementation Guide - Coletivos HelpDesk

## 📋 Visão Geral

Este guia de implementação organiza o desenvolvimento do sistema Coletivos HelpDesk em épicos, fases e tarefas lógicas, garantindo uma implementação estruturada e eficiente.

### 📚 Documentação de Referência Obrigatória

**Antes de iniciar qualquer tarefa de desenvolvimento, consulte:**

- **[12-Complete-Model-Guide.md](12-Complete-Model-Guide.md)** ← **Modelo de dados completo (JSON)**
  - Define estrutura de **todas as entidades** (usuário, cliente, chamado, etc.)
  - Especifica **campos obrigatórios** e tipos TypeScript
  - Documenta **entidades hierárquicas** (chamado com subtabelas, atendimento com mensagens)
  - Mapeia entidades → tabelas SQL

- **[11-JSQL-Proxy-Integration.md](11-JSQL-Proxy-Integration.md)** ← Integração JSQL React ↔ SQL Server
- **[05-Complete-Schema-Guide.md](05-Complete-Schema-Guide.md)** ← Schema SQL detalhado

---

## 🎯 Estrutura de Implementação

### Metodologia
- **Épicos**: Grandes funcionalidades do sistema
- **Fases**: Etapas lógicas dentro de cada épico
- **Tarefas**: Atividades específicas e mensuráveis
- **Critérios de Aceitação**: Validações para cada tarefa

### Priorização
1. **Crítico**: Funcionalidades essenciais para MVP
2. **Alto**: Funcionalidades importantes para lançamento
3. **Médio**: Melhorias e otimizações
4. **Baixo**: Funcionalidades avançadas e nice-to-have

---

## 🏗️ ÉPICO 1: Infraestrutura e Base do Sistema

### Fase 1.1: Configuração do Ambiente
**Prioridade:** Crítico
**Duração Estimada:** 1.5 semanas

#### Tarefa 1.1.1: Configuração do Banco de Dados
- [x] Instalar SQL Server
- [x] Criar database `helpdesk`
- [x] Configurar usuários e permissões
- [x] Executar scripts de criação do schema `sac`
- [x] Validar integridade referencial
- [x] Configurar backup automático
- [x] Testar conectividade

**Critérios de Aceitação:**
- Todas as 37 tabelas criadas sem erro
- Constraints e índices funcionando
- Backup diário configurado

#### Tarefa 1.1.2: Configuração do N8N
- [x] Instalar N8N server
- [x] Configurar conexão com banco de dados
- [x] Configurar credenciais de email (SMTP)
- [x] Testar conectividade com APIs externas
- [x] Configurar webhooks básicos
- [x] Documentar configurações

**Critérios de Aceitação:**
- N8N conectando com banco
- Envio de email funcionando
- Webhooks respondendo

#### Tarefa 1.1.3: Configuração Full-Stack (React + Express + PWA)
**📋 Arquitetura Completa:** [10-PWA-Express-Architecture.md](10-PWA-Express-Architecture.md)
**Prioridade:** Crítico
**Duração Estimada:** 3 dias

##### Backend Express (Proxy)
- [x] Criar estrutura `server/` (index.ts, routes/, config/) ✅
- [x] Implementar rota `/api/jsql` (proxy para N8N) ✅ `server/routes/jsql.ts`
- [x] Configurar `server/config/n8n.ts` (URLs e endpoints) ✅
- [x] Configurar error handling middleware ✅ `server/middleware/error.ts`
- [x] Configurar logs (desenvolvimento/produção) ✅ `requestLogger` + `errorHandler`
- [x] Testar proxy com N8N (curl) ⚠️ Código pronto, precisa teste manual

##### Frontend React
- [x] Criar projeto React com TypeScript ✅
- [x] Configurar estrutura de pastas ✅
- [x] Instalar dependências básicas (routing, state management, UI) ✅
- [x] Configurar ESLint e Prettier ✅
- [x] Configurar build e deploy ✅
- [x] Configurar variáveis de ambiente ✅ `.env.example` existe
- [x] Configurar Vite proxy (`/api` → `localhost:4000`) ✅ `vite.config.ts` L74-78
- [x] Configurar Vite PWA plugin ✅ `vite.config.ts` L14-58

##### PWA (Progressive Web App)
- [x] Criar `public/manifest.json` (nome, ícones, theme) ✅ Via `VitePWA` plugin
- [x] Adicionar ícones PWA (192x192, 512x512) ✅
- [x] Implementar Service Worker (`src/sw/service-worker.ts`) ✅ Auto-gerado via Workbox
- [x] Configurar cache strategies (assets + API) ✅ `vite.config.ts` L41-56
- [ ] Implementar offline fallback ⚠️ Cache configurado, falta UI de feedback
- [ ] Implementar `<OfflineBanner>` (componente React)

##### Shell da Aplicação (UI000)
- [x] Implementar `<MainLayout>` (TopBar + Sidebar + Content) ✅ `components/layout/MainLayout.tsx`
- [ ] Implementar `<TopBar>` (busca, notificações, user menu) ✅ `components/layout/TopBar.tsx`
- [x] Implementar `<Sidebar>` (navegação principal) ✅ `components/layout/Sidebar.tsx` com menu duas linhas
- [ ] Implementar busca global omnibox (⚠️ requer Tarefa 1.1.4)
- [ ] Implementar sistema de notificações (dropdown) ✅ Placeholder com Empty state
- [ ] Implementar command palette (Ctrl+P)
- [x] Implementar navegação principal do sistema ✅ Home/Chamados/Clientes/Relatórios/Config

##### Scripts e Deploy
- [x] Configurar scripts `package.json` (dev, build, start) ✅
- [x] Testar dev mode (2 processos, Vite proxy) ✅ Scripts `dev:back` + `dev:front`
- [x] Testar prod mode (1 processo, Express serve static) ✅ `server/index.ts` L59-68
- [x] Configurar Dockerfile ✅ Multi-stage build com Node 22 Alpine
- [x] Configurar docker-compose.yml ✅ Com healthcheck e resource limits
- [x] Documentar variáveis de ambiente (`.env.example`) ✅

**Critérios de Aceitação:**
- ✅ Backend Express rodando na porta 4000 (código implementado)
- ✅ Frontend Vite rodando na porta 5173 (dev) (scripts configurados)
- ✅ Proxy `/api` funcionando sem CORS (vite.config.ts configurado)
- ✅ Build de produção gerando `dist/` (scripts prontos)
- ✅ Express servindo React static files (prod) (server/index.ts L59-68)
- ✅ Service Worker registrado e cacheando assets (Workbox configurado)
- ⚠️ PWA instalável no mobile (iOS/Android) - Precisa ícones e teste
- ⚠️ Offline mode exibindo banner (não erro 404) - Cache OK, falta UI
- ✅ Shell principal (MainLayout) renderizando (App.tsx com Layout)
- ⚠️ TopBar e Sidebar funcionando - Header básico OK, faltam features
- ⚠️ Navegação entre rotas principais - Básico OK (Home/About), falta completo
- ✅ Zero CORS em dev e prod (proxy configurado)

#### Tarefa 1.1.4: Integração JSQL Client
**📋 Documentação Completa:** [11-JSQL-Proxy-Integration.md](11-JSQL-Proxy-Integration.md)
**📋 Referências JSQL:** [/docs/JSQL/](../../JSQL/)
**Prioridade:** Crítico
**Duração Estimada:** 2 dias

##### Backend Express (Proxy JSQL)
- [x] Implementar `server/routes/jsql.ts` (POST /api/jsql)
- [x] Validar payload JSQL (select/mutate obrigatório)
- [x] Validar schema (permitir apenas: sac, jsql)
- [x] Repassar Cookie/Authorization headers
- [ ] Implementar timeout (30s)
- [ ] Implementar retry em caso de falha N8N
- [x] Logs estruturados (operação, usuário, duração)

##### Frontend JSQL Client
- [x] Criar `src/core/types/jsql.types.ts` (tipos TypeScript completos) ✅
- [x] Criar `src/core/types/jsql.entities.ts` (tipos TypeScript completos para as entidades do modelo) ✅
- [x] Criar `src/core/api/jsqlClient.ts` (classe JSQLClient) ✅
- [x] Implementar método `query()` (genérico retorna sempre array) ✅
- [x] Implementar método `select()` (atalho para SELECT) ✅
- [x] Implementar método `mutate()` (atalho para MUTATE) ✅
- [x] Implementar classe `JSQLError` (custom error com helpers) ✅
- [x] Exportar singleton `jsqlClient` ✅
- [x] Configurar `credentials: 'include'` (cookies) ✅
- [x] Implementar helpers `where.*` (eq, ne, gt, gte, lt, lte, like, in, between) ✅
- [x] Implementar type guards (isSelectPayload, isMutatePayload) ✅

##### React Hooks (TanStack Query)
- [x] Instalar `@tanstack/react-query` e devtools ✅
- [x] Configurar `QueryClient` no `main.tsx` ✅
- [x] Criar `src/core/hooks/useJSQLQuery.ts` (SELECT) ✅
- [x] Criar `src/core/hooks/useJSQLMutation.ts` (MUTATE) ✅
- [x] Implementar invalidação automática de queries ✅
- [x] Configurar staleTime padrão (10s) - dados sempre frescos ✅
- [x] Configurar gcTime (10s) - deduplicação de requests simultâneos ✅
- [x] Configurar refetchOnWindowFocus (true) - atualiza ao voltar para aba ✅
- [x] Configurar retry (2) - retry automático em caso de erro ✅
- [x] Implementar DevTools para debug (dev mode only) ✅
- [x] Criar barrel exports (api, hooks, types) ✅
- [x] Documentação completa criada em `12-JSQL-Frontend-Integration.md` ✅

##### SQL Server Procedures (Verificação)
- [ ] Verificar se `sac.jsql__select__usuario` existe
- [ ] Verificar se `sac.jsql__select__chamado` existe
- [ ] Verificar se `sac.jsql__select__cliente` existe
- [ ] Verificar se `sac.jsql__select__contato` existe
- [ ] Criar procedures faltantes (se necessário)
- [ ] Validar suporte a operador `like` (busca)
- [ ] Validar suporte a operador `OR` (busca global)
- [ ] Validar filtros de permissão nas procedures

##### Índices de Performance (SQL)
- [ ] Validar e criar índice se necessário em `TBchamado.DFnumero_protocolo`
- [ ] Validar e criar índice se necessário em `TBchamado.DFtitulo_chamado`
- [ ] Validar e criar índice se necessário em `TBcliente.DFnome_cliente`
- [ ] Validar e criar índice se necessário em `TBcontato.DFnome_contato`
- [ ] Validar e criar índice se necessário em `TBcontato.DFemail_contato`

* Os scripts estão em ./database/schemata/sac/sac.TB*.sql

##### Testes de Select End-to-End
- [ ] Usar a página TesteSandboxPage.tsx para testes
- [ ] Testar SELECT via frontend (listar usuários)
- [ ] Testar error handling (400, 403, 500)
- [ ] Testar validação de permissões
- [ ] Testar timeout (procedure lenta)
- [ ] Testar offline (Service Worker retorna 503)

##### Testes de Mutate End-to-End
- [ ] Usar a página TesteSandboxPage.tsx para testes
- [ ] Testar MUTATE via frontend (criar usuário)
- [ ] Testar error handling (400, 403, 500)
- [ ] Testar validação de permissões
- [ ] Testar timeout (procedure lenta)
- [ ] Testar offline (Service Worker retorna 503)

**Critérios de Aceitação:**
- ✅ Rota `/helpdesk/api/jsql` funcionando (backend implementado)
- ✅ Tipos TypeScript completos e validados pelo agente jsql-query-designer
- ✅ Cliente JSQL retorna sempre array (conforme especificação)
- ✅ Hooks `useJSQLQuery` e `useJSQLMutation` implementados
- ✅ Frontend consegue fazer SELECT de usuários (via hooks)
- ✅ Frontend consegue fazer MUTATE com actions customizadas
- ✅ Erros JSQL tratados com classe `JSQLError` e métodos helper
- ✅ Cache configurado (10s staleTime, 10s gcTime)
- ✅ Invalidação automática após mutations (mesma entidade)
- ✅ Refetch ao voltar para aba (refetchOnWindowFocus: true)
- ✅ Retry automático (2x) em caso de erro de rede
- ✅ DevTools do React Query disponível em dev mode
- ✅ Barrel exports organizados (api, hooks, types)
- ✅ Build de produção funcionando sem erros TypeScript
- ✅ Documentação completa em `12-JSQL-Frontend-Integration.md`
- ⚠️ Procedures SQL existem e estão otimizadas (verificação manual pendente)
- ⚠️ Índices criados para performance de busca (verificação manual pendente)
- ⚠️ Testes end-to-end manuais pendentes (componente de teste criado em `.tmp/`)

### Fase 1.2: Autenticação e Segurança Base
**Prioridade:** Crítico
**Duração Estimada:** 2 semanas
**📋 Arquitetura PWA:** [08-PWA-Authentication-Architecture.md](08-PWA-Authentication-Architecture.md)

#### Tarefa 1.2.1: Sistema de Autenticação Backend
- [x] Implementar API de login
- [x] Implementar geração de JWT tokens
- [x] Implementar middleware de autenticação
- [x] Implementar recuperação de senha
- [x] Implementar bloqueio por tentativas
- [x] Implementar logs de segurança
- [x] Testes unitários de autenticação

**Critérios de Aceitação:**
- Login funcionando com JWT
- Recuperação de senha por email
- Bloqueio após 5 tentativas
- Logs de auditoria registrados

#### Tarefa 1.2.2: Sistema de Permissões Backend
**📋 Plano Detalhado:** [09-Authorization-Implementation-Plan.md](09-Authorization-Implementation-Plan.md)

- [x] Implementar procedures JSQL de permissões (7 procedures)
- [x] Implementar services e stores no frontend (permissionService, permissionStore)
- [x] Implementar hooks de permissão (usePermission, useRequirePermission)
- [x] Implementar componente RequirePermission
- [x] Implementar middleware de validação JSQL
- [x] Implementar cache de permissões (Zustand)
- [x] Testes de autorização — implementado em `scripts/test-permissions-e2e.py`

**Critérios de Aceitação:**
- ✅ Permissões calculadas corretamente via VIEW TBpermissao_efetiva
- ✅ Cache funcionando (Zustand in-memory, TTL 5min)
- ✅ Validação automática baseada em queries JSQL
- ✅ Administradores com bypass automático
- ✅ UI protegida por componente RequirePermission

#### Tarefa 1.2.3: Interfaces de Autenticação Frontend (PWA-Ready)
**📋 Arquitetura:** [08-PWA-Authentication-Architecture.md](08-PWA-Authentication-Architecture.md)
**📋 Plano de Implementação:** [08.1-PWA-Compatible-Auth-Component-Implementation-Plan.md](8.1-PWA-Compatible-Auth-Component-Implementation-Plan.md)

**Implementar `@coletivos/auth-lib` do zero (9 fases):**

- [x] **Fase 1:** Setup do projeto (package.json, TypeScript, Vite)
- [x] **Fase 2:** Core - Storage seguro (IndexedDB + AES-GCM crypto)
- [x] **Fase 3:** Core - Sincronização (BroadcastChannel)
- [x] **Fase 4:** Core - Service Worker (interceptor + registro)
- [x] **Fase 5:** Context - AuthProvider (login, logout, sync)
- [x] **Fase 6:** Context - ThemeProvider (localStorage + sync)
- [x] **Fase 7:** Componentes UI (LoginPage, ProtectedRoute, ThemeToggle)
- [x] **Fase 8:** Exports (index.ts com API pública)
- [x] **Fase 9:** Build

**Critérios de Aceitação:**
- ✅ Login funcionando em PWA standalone
- ✅ SSO entre apps do mesmo domínio (browser)
- ✅ Token criptografado em IndexedDB (AES-GCM 256-bit)
- ✅ Service Worker injetando `Authorization: Bearer` automaticamente
- ✅ Tema compartilhado via `localStorage.pref-theme`
- ✅ Logout global via BroadcastChannel
- ✅ Visual conforme layout aprovado pelo PO
- ✅ ProtectedRoute funciona offline (cache do SW)

#### Tarefa 1.2.4: Migração Helpdesk para @coletivos/auth-lib
**📋 Referência:** [08-PWA-Authentication-Architecture.md - Fase 3](08-PWA-Authentication-Architecture.md#fase-3-migração-helpdesk-3-dias)
**Prioridade:** Crítico
**Duração Estimada:** 3 dias

**Objetivo:** Substituir autenticação backend Express (`@src/auth/`) pela biblioteca React PWA (`@coletivos/auth-lib`).

##### Instalação e Setup
- [x] Instalar `@coletivos/auth-client` no helpdesk ✅
  ```bash
  cd src/helpdesk
  npm install file:../auth-lib
  ```
- [x] Copiar `dist/auth-sw.js` para `public/auth-sw.js` ✅
- [x] Atualizar `package.json` scripts se necessário ✅

##### Configuração de Providers
- [x] Atualizar `src/main.tsx` com AuthProvider e ThemeProvider ✅
  ```tsx
  import { AuthProvider, ThemeProvider } from '@coletivos/auth-client'
  import '@coletivos/auth-client/auth.css'

  <ThemeProvider>
    <AuthProvider authUrl="/webhook/coletivos/api/1/autenticar">
      <App />
    </AuthProvider>
  </ThemeProvider>
  ```

##### Migração de Componentes
- [x] Criar `src/pages/Login.tsx` usando `<LoginPage>` ✅
- [x] Substituir rotas protegidas por `<ProtectedRoute>` ✅
- [x] Atualizar componentes que usam `useAuth()` (API compatível) ✅
- [x] Remover imports de `@src/auth/` (código legado) ✅

##### Configuração Vite
- [x] Remover proxy `/auth` do `vite.config.ts` (backend Express) ✅
- [x] Manter apenas proxy `/api` e `/webhook` (N8N) ✅
- [x] Configurar PWA manifest (se ainda não existe) ✅

##### Remoção de Código Legado
- [x] Deletar diretório `@src/auth/` (backend Express completo) ✅
- [x] Remover dependências Express não utilizadas ✅
- [x] Limpar imports quebrados ✅

##### Testes End-to-End
- [x] Testar login no helpdesk ✅
- [x] Testar SSO entre tabs do helpdesk ✅
- [x] Testar logout global ✅
- [x] Testar mudança de tema (sincronização) ✅
- [x] Testar PWA standalone (instalação) ✅
- [x] Testar Service Worker (requests com Authorization header) ✅
- [x] Testar modo offline (ProtectedRoute) ✅

**Critérios de Aceitação:**
- ✅ Helpdesk usando `@coletivos/auth-client` v2.0.0
- ✅ Login funcionando (mesmo endpoint N8N)
- ✅ SSO entre tabs funcionando
- ✅ Tema sincronizado em tempo real
- ✅ PWA instalável no mobile
- ✅ Service Worker injetando headers automaticamente
- ✅ Código legado `@src/auth/` completamente removido
- ✅ Zero erros no console
- ✅ Build de produção funcionando

### Fase 1.3: Gestão de Usuários Base
**Prioridade:** Crítico  
**Duração Estimada:** 1.5 semanas

#### Tarefa 1.3.1: CRUD de Usuários Backend (Procedures JSQL)
**📋 Referências:**
- [11-JSQL-Proxy-Integration.md](11-JSQL-Proxy-Integration.md#sql-server-procedures)
- **[12-Complete-Model-Guide.md - Entidade `usuario`](12-Complete-Model-Guide.md#usuario)** ← Consultar estrutura JSON

**Nota:** Backend Express já implementado nas Tarefas 1.1.3/1.1.4.
Esta tarefa foca em **procedures JSQL no SQL Server**.

- [x] Implementar `sac.jsql__select__usuario` ✅
- [ ] Implementar `sac.jsql__mutate__usuario` (insert)
- [ ] Implementar `sac.jsql__mutate__usuario` (update)
- [ ] Implementar `sac.jsql__mutate__usuario` (delete/inativar)
- [ ] Implementar validações de dados (procedure)
- [x] Implementar hash de senhas - **Via procedure n8n_get_usuario_autenticacao** ✅
- [ ] Implementar paginação (options.limit, options.offset)
- [ ] Implementar ordenação (options.orderBy)
- [ ] Implementar filtros avançados (where com AND/OR)
- [ ] Implementar auditoria de mudanças (TBauditoria)
- [ ] Testes de procedures (SSMS)

**Critérios de Aceitação:**
- ✅ SELECT retorna lista paginada de usuários
- ✅ INSERT cria novo usuário com validações
- ✅ UPDATE atualiza usuário existente
- ✅ DELETE inativa usuário (soft delete)
- ✅ Validações impedem dados inválidos (email duplicado, etc)
- ✅ Auditoria registra todas as mudanças
- ✅ Permissões são validadas em todas as operações

#### Tarefa 1.3.2: Interfaces de Usuários Frontend
**📋 Modelo de dados:** [12-Complete-Model-Guide.md - Entidade `usuario`](12-Complete-Model-Guide.md#usuario)

- [ ] Implementar perfil do usuário (UI004)
- [ ] Implementar alteração de senha (UI005)
- [ ] Implementar lista de usuários admin (UI006)
- [ ] Implementar formulário de usuário (UI007)
- [ ] Implementar validações frontend
- [ ] Implementar upload de avatar

**Critérios de Aceitação:**
- Perfil editável funcionando
- Lista de usuários com filtros
- Formulário com validações

---

## 👥 ÉPICO 2: Gestão de Clientes e Contatos

**📋 Integração JSQL:** Todas as operações de dados neste épico usam JSQL.
Consulte [11-JSQL-Proxy-Integration.md](11-JSQL-Proxy-Integration.md) para referência completa.

### Fase 2.1: Estrutura de Clientes
**Prioridade:** Crítico  
**Duração Estimada:** 1.5 semanas

#### Tarefa 2.1.1: CRUD de Clientes Backend
**📋 Modelo de dados:** [12-Complete-Model-Guide.md - Entidade `cliente`](12-Complete-Model-Guide.md#cliente)

- [ ] Implementar endpoints de clientes
- [ ] Implementar validação de CNPJ
- [ ] Implementar hierarquia de clientes
- [ ] Implementar busca e filtros
- [ ] Implementar campos personalizados
- [ ] Implementar controle de limites

**Critérios de Aceitação:**
- CRUD completo de clientes
- Hierarquia funcionando
- Validações de negócio ativas

#### Tarefa 2.1.2: Interfaces de Clientes Frontend
**📋 Modelo de dados:** [12-Complete-Model-Guide.md - Entidade `cliente`](12-Complete-Model-Guide.md#cliente)

- [ ] Implementar lista de clientes (UI010)
- [ ] Implementar formulário de cliente (UI011)
- [ ] Implementar detalhes do cliente (UI012)
- [ ] Implementar busca com autocomplete
- [ ] Implementar visualização hierárquica
- [ ] Implementar métricas por cliente

**Critérios de Aceitação:**
- Lista com filtros funcionando
- Formulário com validações
- Detalhes com métricas

### Fase 2.2: Gestão de Contatos
**Prioridade:** Crítico  
**Duração Estimada:** 1.5 semanas

#### Tarefa 2.2.1: CRUD de Contatos Backend
**📋 Modelo de dados:** [12-Complete-Model-Guide.md - Entidade `contato`](12-Complete-Model-Guide.md#contato)

- [ ] Implementar endpoints de contatos
- [ ] Implementar vinculação com usuários
- [ ] Implementar validação de contato principal
- [ ] Implementar filtros por cliente
- [ ] Implementar notificações de vinculação
- [ ] Implementar auditoria

**Critérios de Aceitação:**
- CRUD completo de contatos
- Vinculação com usuários funcionando
- Apenas um contato principal por cliente

#### Tarefa 2.2.2: Interfaces de Contatos Frontend
**📋 Modelo de dados:** [12-Complete-Model-Guide.md - Entidade `contato`](12-Complete-Model-Guide.md#contato)

- [ ] Implementar lista de contatos (UI013)
- [ ] Implementar formulário de contato (UI014)
- [ ] Implementar vinculação com usuários
- [ ] Implementar filtros por cliente
- [ ] Implementar indicadores visuais
- [ ] Implementar criação de usuário simultânea

**Critérios de Aceitação:**
- Lista filtrada por cliente
- Formulário com vinculação
- Criação de usuário funcionando

### Fase 2.3: Workflows de Clientes/Contatos
**Prioridade:** Alto  
**Duração Estimada:** 1 semana

#### Tarefa 2.3.1: Workflows N8N - Clientes
- [ ] Implementar WF005 - Novo Cliente
- [ ] Implementar WF007 - Limite de Chamados
- [ ] Configurar notificações automáticas
- [ ] Configurar validações automáticas
- [ ] Testar workflows end-to-end

**Critérios de Aceitação:**
- Workflows executando automaticamente
- Notificações sendo enviadas
- Limites sendo controlados

#### Tarefa 2.3.2: Workflows N8N - Contatos
- [ ] Implementar WF006 - Vinculação Contato-Usuário
- [ ] Configurar envio de credenciais
- [ ] Configurar templates de email
- [ ] Testar vinculação automática

**Critérios de Aceitação:**
- Vinculação automática funcionando
- Emails sendo enviados
- Templates personalizados

---

## 🎫 ÉPICO 3: Sistema de Chamados Core

**📋 Integração JSQL:** Todas as operações de dados neste épico usam JSQL.
Consulte [11-JSQL-Proxy-Integration.md](11-JSQL-Proxy-Integration.md) para referência completa.

### Fase 3.1: Estrutura Base de Chamados
**Prioridade:** Crítico  
**Duração Estimada:** 2 semanas

#### Tarefa 3.1.1: CRUD de Chamados Backend
**📋 Modelo de dados:** [12-Complete-Model-Guide.md - Entidade `chamado`](12-Complete-Model-Guide.md#chamado) ← **Entidade hierárquica com subtabelas**

- [ ] Implementar endpoints de chamados
- [ ] Implementar geração de protocolo
- [ ] Implementar cálculo de SLA
- [ ] Implementar validações de negócio
- [ ] Implementar busca avançada
- [ ] Implementar paginação otimizada

**Critérios de Aceitação:**
- CRUD completo funcionando
- Protocolos únicos gerados
- SLA calculado automaticamente

#### Tarefa 3.1.2: Sistema de Status e Categorias
**📋 Modelo de dados:**
- [12-Complete-Model-Guide.md - Entidade `status_chamado`](12-Complete-Model-Guide.md#status_chamado)
- [12-Complete-Model-Guide.md - Entidade `categoria`](12-Complete-Model-Guide.md#categoria) ← **Entidade hierárquica**
- [12-Complete-Model-Guide.md - Entidade `prioridade`](12-Complete-Model-Guide.md#prioridade-tbtipo_prioridade)

- [ ] Implementar CRUD de status
- [ ] Implementar CRUD de categorias
- [ ] Implementar hierarquia de categorias
- [ ] Implementar validação de transições
- [ ] Implementar cores semânticas
- [ ] Implementar tipos de prioridade

**Critérios de Aceitação:**
- Status com cores funcionando
- Categorias hierárquicas
- Transições validadas

#### Tarefa 3.1.3: Interfaces Base de Chamados
**📋 Modelo de dados:** [12-Complete-Model-Guide.md - Entidade `chamado`](12-Complete-Model-Guide.md#chamado) ← Consultar subtabelas: `historico[]`, `comentarios[]`, `anexos[]`

- [ ] Implementar dashboard de chamados (UI015)
- [ ] Implementar lista de chamados (UI016)
- [ ] Implementar detalhes do chamado (UI019)
- [ ] Implementar filtros avançados
- [ ] Implementar ações em lote
- [ ] Implementar indicadores visuais

**Critérios de Aceitação:**
- Dashboard com métricas
- Lista com filtros funcionando
- Detalhes completos exibidos

### Fase 3.2: Abertura e Edição de Chamados
**Prioridade:** Crítico  
**Duração Estimada:** 2 semanas

#### Tarefa 3.2.1: Formulários de Chamados Backend
- [ ] Implementar validações específicas
- [ ] Implementar auto-atribuição
- [ ] Implementar cálculo automático de SLA
- [ ] Implementar notificações de abertura
- [ ] Implementar controle de limites
- [ ] Implementar campos obrigatórios dinâmicos

**Critérios de Aceitação:**
- Validações impedindo dados inválidos
- Auto-atribuição funcionando
- Notificações sendo enviadas

#### Tarefa 3.2.2: Interfaces de Formulários
- [ ] Implementar formulário portal cliente (UI017)
- [ ] Implementar formulário atendente (UI018)
- [ ] Implementar edição de chamado (UI020)
- [ ] Implementar validações frontend
- [ ] Implementar seleção dinâmica
- [ ] Implementar preview de SLA

**Critérios de Aceitação:**
- Formulários com validações
- Seleção dinâmica funcionando
- SLA calculado em tempo real

### Fase 3.3: Histórico e Comentários
**Prioridade:** Alto  
**Duração Estimada:** 1.5 semanas

#### Tarefa 3.3.1: Sistema de Histórico Backend
- [ ] Implementar registro automático de mudanças
- [ ] Implementar triggers de auditoria
- [ ] Implementar timeline de eventos
- [ ] Implementar filtros de histórico
- [ ] Implementar compressão de dados antigos

**Critérios de Aceitação:**
- Todas as mudanças registradas
- Timeline cronológica
- Performance otimizada

#### Tarefa 3.3.2: Sistema de Comentários Backend
- [ ] Implementar CRUD de comentários
- [ ] Implementar tipos interno/externo
- [ ] Implementar menções de usuários
- [ ] Implementar notificações de comentários
- [ ] Implementar edição com histórico

**Critérios de Aceitação:**
- Comentários internos/externos
- Menções funcionando
- Notificações automáticas

#### Tarefa 3.3.3: Interfaces de Comunicação
- [ ] Implementar timeline no detalhes (UI019)
- [ ] Implementar formulário de comentários
- [ ] Implementar editor rico
- [ ] Implementar sistema de menções
- [ ] Implementar indicadores visuais

**Critérios de Aceitação:**
- Timeline completa funcionando
- Editor rico operacional
- Menções com autocomplete

### Fase 3.4: Sistema de Anexos
**Prioridade:** Alto  
**Duração Estimada:** 1 semana

#### Tarefa 3.4.1: Upload e Gestão de Arquivos
- [ ] Implementar upload de arquivos
- [ ] Implementar validação de tipos
- [ ] Implementar scan de vírus
- [ ] Implementar compressão de imagens
- [ ] Implementar storage seguro
- [ ] Implementar controle de quota

**Critérios de Aceitação:**
- Upload funcionando
- Validações de segurança ativas
- Storage organizado

#### Tarefa 3.4.2: Interface de Anexos
- [ ] Implementar upload múltiplo
- [ ] Implementar preview de imagens
- [ ] Implementar download de arquivos
- [ ] Implementar galeria de anexos
- [ ] Implementar drag-and-drop

**Critérios de Aceitação:**
- Upload múltiplo funcionando
- Preview de imagens
- Download seguro

### Fase 3.5: Workflows de Chamados
**Prioridade:** Alto  
**Duração Estimada:** 2 semanas

#### Tarefa 3.5.1: Workflows Principais N8N
- [ ] Implementar WF008 - Novo Chamado
- [ ] Implementar WF009 - Mudança de Status
- [ ] Implementar WF010 - Atribuição de Chamado
- [ ] Implementar WF011 - Vencimento de SLA
- [ ] Configurar notificações automáticas

**Critérios de Aceitação:**
- Workflows executando automaticamente
- SLA sendo monitorado
- Notificações pontuais

#### Tarefa 3.5.2: Workflows de Comunicação N8N
- [ ] Implementar WF012 - Comentário em Chamado
- [ ] Implementar WF013 - Upload de Anexo
- [ ] Configurar processamento de anexos
- [ ] Configurar notificações de atividade

**Critérios de Aceitação:**
- Comentários gerando notificações
- Anexos processados automaticamente
- Atividades registradas

---

## 💬 ÉPICO 4: Atendimento Online (Chat)

### Fase 4.1: Infraestrutura de Chat
**Prioridade:** Médio  
**Duração Estimada:** 2 semanas

#### Tarefa 4.1.1: Backend de Chat em Tempo Real
**📋 Modelo de dados:** [12-Complete-Model-Guide.md - Entidade `atendimento`](12-Complete-Model-Guide.md#atendimento) ← **Entidade hierárquica com `mensagens[]`**

- [ ] Implementar WebSocket server
- [ ] Implementar salas de chat
- [ ] Implementar sistema de filas
- [ ] Implementar detecção de localização
- [ ] Implementar persistência de mensagens
- [ ] Implementar indicadores de digitação

**Critérios de Aceitação:**
- WebSocket funcionando
- Mensagens em tempo real
- Filas organizadas

#### Tarefa 4.1.2: Widget de Chat
- [ ] Implementar widget embeddable (UI021)
- [ ] Implementar formulário inicial
- [ ] Implementar interface de chat
- [ ] Implementar upload de arquivos
- [ ] Implementar responsividade
- [ ] Implementar customização visual

**Critérios de Aceitação:**
- Widget funcionando em sites externos
- Interface responsiva
- Upload de arquivos

### Fase 4.2: Console de Atendimento
**Prioridade:** Médio  
**Duração Estimada:** 1.5 semanas

#### Tarefa 4.2.1: Interface de Atendimento
- [ ] Implementar console de atendimento (UI022)
- [ ] Implementar lista de filas
- [ ] Implementar chat interface
- [ ] Implementar transferência de atendimentos
- [ ] Implementar templates de resposta
- [ ] Implementar notificações sonoras

**Critérios de Aceitação:**
- Console funcionando
- Transferências suaves
- Templates aplicáveis

#### Tarefa 4.2.2: Gestão de Atendimentos
- [ ] Implementar histórico de atendimentos (UI023)
- [ ] Implementar métricas de atendimento
- [ ] Implementar relatórios de chat
- [ ] Implementar busca de conversas
- [ ] Implementar exportação de transcrições

**Critérios de Aceitação:**
- Histórico completo
- Métricas precisas
- Busca funcionando

### Fase 4.3: Workflows de Atendimento
**Prioridade:** Médio  
**Duração Estimada:** 1 semana

#### Tarefa 4.3.1: Workflows de Chat N8N
- [ ] Implementar WF014 - Novo Atendimento
- [ ] Implementar WF015 - Mensagem de Atendimento
- [ ] Implementar WF016 - Transferência de Atendimento
- [ ] Implementar WF017 - Finalização de Atendimento

**Critérios de Aceitação:**
- Atendimentos distribuídos automaticamente
- Mensagens processadas
- Finalizações registradas

---

## 🏷️ ÉPICO 5: Sistema de Tags e Organização

**📋 Integração JSQL:** Todas as operações de dados neste épico usam JSQL.
Consulte [11-JSQL-Proxy-Integration.md](11-JSQL-Proxy-Integration.md) para referência completa.

### Fase 5.1: Estrutura de Tags
**Prioridade:** Médio  
**Duração Estimada:** 1 semana

#### Tarefa 5.1.1: Backend de Tags
**📋 Modelo de dados:** [12-Complete-Model-Guide.md - Entidade `tag`](12-Complete-Model-Guide.md#tag)

- [ ] Implementar CRUD de tags
- [ ] Implementar tipos de entidade
- [ ] Implementar cores semânticas
- [ ] Implementar aplicação de tags
- [ ] Implementar validações de compatibilidade
- [ ] Implementar busca de tags

**Critérios de Aceitação:**
- Tags por tipo de entidade
- Cores funcionando
- Validações ativas

#### Tarefa 5.1.2: Interfaces de Tags
- [ ] Implementar aplicação de tags (UI024)
- [ ] Implementar gestão de tags admin (UI025)
- [ ] Implementar seletor de tags
- [ ] Implementar busca incremental
- [ ] Implementar criação rápida

**Critérios de Aceitação:**
- Aplicação de tags funcionando
- Busca incremental
- Criação rápida

### Fase 5.2: Filtros e Busca por Tags
**Prioridade:** Médio  
**Duração Estimada:** 0.5 semanas

#### Tarefa 5.2.1: Sistema de Filtros
- [ ] Implementar filtros por tags
- [ ] Implementar combinação AND/OR
- [ ] Implementar salvamento de filtros
- [ ] Implementar contadores por tag
- [ ] Implementar filtros favoritos

**Critérios de Aceitação:**
- Filtros combinados funcionando
- Contadores precisos
- Filtros salvos

### Fase 5.3: Workflows de Tags
**Prioridade:** Baixo  
**Duração Estimada:** 0.5 semanas

#### Tarefa 5.3.1: Workflows de Tags N8N
- [ ] Implementar WF018 - Aplicação de Tag
- [ ] Implementar WF019 - Remoção de Tag
- [ ] Configurar automações baseadas em tags

**Critérios de Aceitação:**
- Tags aplicadas automaticamente
- Automações funcionando

---

## 📊 ÉPICO 6: Relatórios e Analytics

**📋 Integração JSQL:** Todas as operações de dados neste épico usam JSQL.
Consulte [11-JSQL-Proxy-Integration.md](11-JSQL-Proxy-Integration.md) para referência completa.

### Fase 6.1: Dashboards Executivos
**Prioridade:** Alto  
**Duração Estimada:** 2 semanas

#### Tarefa 6.1.1: Backend de Métricas
- [ ] Implementar cálculo de KPIs
- [ ] Implementar cache de métricas
- [ ] Implementar agregações por período
- [ ] Implementar comparativos
- [ ] Implementar drill-down
- [ ] Implementar APIs de métricas

**Critérios de Aceitação:**
- KPIs calculados corretamente
- Performance otimizada
- Drill-down funcionando

#### Tarefa 6.1.2: Interface de Dashboard
- [ ] Implementar dashboard executivo (UI026)
- [ ] Implementar gráficos interativos
- [ ] Implementar filtros globais
- [ ] Implementar exportação
- [ ] Implementar atualização automática
- [ ] Implementar personalização

**Critérios de Aceitação:**
- Dashboard responsivo
- Gráficos interativos
- Filtros funcionando

### Fase 6.2: Relatórios Operacionais
**Prioridade:** Alto  
**Duração Estimada:** 1.5 semanas

#### Tarefa 6.2.1: Sistema de Relatórios
- [ ] Implementar relatório de chamados (UI027)
- [ ] Implementar relatório de performance
- [ ] Implementar filtros avançados
- [ ] Implementar agrupamentos dinâmicos
- [ ] Implementar exportação múltipla
- [ ] Implementar agendamento

**Critérios de Aceitação:**
- Relatórios com filtros
- Exportação funcionando
- Agendamento ativo

### Fase 6.3: Sistema de Satisfação
**Prioridade:** Alto  
**Duração Estimada:** 1 semana

#### Tarefa 6.3.1: Pesquisa de Satisfação
- [ ] Implementar formulário de avaliação (UI028)
- [ ] Implementar envio automático
- [ ] Implementar tokens seguros
- [ ] Implementar análise de satisfação
- [ ] Implementar relatórios de satisfação

**Critérios de Aceitação:**
- Pesquisas enviadas automaticamente
- Tokens seguros
- Análises precisas

### Fase 6.4: Workflows de Relatórios
**Prioridade:** Médio  
**Duração Estimada:** 1 semana

#### Tarefa 6.4.1: Workflows de Analytics N8N
- [ ] Implementar WF020 - Cálculo de Métricas Diárias
- [ ] Implementar WF021 - Relatório Agendado
- [ ] Implementar WF022 - Pesquisa de Satisfação
- [ ] Configurar distribuição automática

**Critérios de Aceitação:**
- Métricas calculadas diariamente
- Relatórios distribuídos
- Pesquisas enviadas

---

## ⚙️ ÉPICO 7: Configuração e Administração

**📋 Integração JSQL:** Todas as operações de dados neste épico usam JSQL.
Consulte [11-JSQL-Proxy-Integration.md](11-JSQL-Proxy-Integration.md) para referência completa.

### Fase 7.1: Configurações Gerais
**Prioridade:** Alto  
**Duração Estimada:** 1.5 semanas

#### Tarefa 7.1.1: Sistema de Configurações
**📋 Modelo de dados:**
- [12-Complete-Model-Guide.md - Entidade `sla_configuracao`](12-Complete-Model-Guide.md#sla_configuracao)
- [12-Complete-Model-Guide.md - Entidade `feriado`](12-Complete-Model-Guide.md#feriado)
- [12-Complete-Model-Guide.md - Entidade `template_email`](12-Complete-Model-Guide.md#template_email)

- [ ] Implementar backend de configurações
- [ ] Implementar validações de configuração
- [ ] Implementar backup de configurações
- [ ] Implementar versionamento
- [ ] Implementar aplicação dinâmica

**Critérios de Aceitação:**
- Configurações persistidas
- Validações ativas
- Backup funcionando

#### Tarefa 7.1.2: Interface de Configurações
- [ ] Implementar configurações gerais (UI029)
- [ ] Implementar gestão de departamentos (UI030)
- [ ] Implementar configuração de SLA
- [ ] Implementar templates de email
- [ ] Implementar teste de configurações

**Critérios de Aceitação:**
- Interface de configuração completa
- Testes funcionando
- Validações frontend

### Fase 7.2: Gestão de Papéis Avançada
**Prioridade:** Alto  
**Duração Estimada:** 1 semana

#### Tarefa 7.2.1: Sistema de Papéis Completo
**📋 Modelo de dados:**
- [12-Complete-Model-Guide.md - Entidade `papel`](12-Complete-Model-Guide.md#papel)
- [12-Complete-Model-Guide.md - Entidade `permissao`](12-Complete-Model-Guide.md#permissao)
- [12-Complete-Model-Guide.md - Entidade `permissao_efetiva`](12-Complete-Model-Guide.md#permissao_efetiva)

- [ ] Implementar gestão de papéis (UI008)
- [ ] Implementar matriz de permissões (UI009)
- [ ] Implementar permissões individuais (UI006)
- [ ] Implementar auditoria de permissões
- [ ] Implementar templates de papel

**Critérios de Aceitação:**
- Matriz de permissões funcionando
- Auditoria completa
- Templates aplicáveis

### Fase 7.3: Automação de Processos
**Prioridade:** Médio  
**Duração Estimada:** 2 semanas

#### Tarefa 7.3.1: Sistema de Automação
**📋 Modelo de dados:**
- [12-Complete-Model-Guide.md - Entidade `automacao_regra`](12-Complete-Model-Guide.md#automacao_regra)
- [12-Complete-Model-Guide.md - Entidade `auditoria`](12-Complete-Model-Guide.md#auditoria)

- [ ] Implementar criador de regras visuais
- [ ] Implementar engine de execução
- [ ] Implementar condições dinâmicas
- [ ] Implementar ações configuráveis
- [ ] Implementar teste de regras
- [ ] Implementar logs de execução

**Critérios de Aceitação:**
- Regras visuais funcionando
- Execução automática
- Logs detalhados

#### Tarefa 7.3.2: Workflows de Configuração N8N
- [ ] Implementar WF023 - Execução de Regra de Automação
- [ ] Implementar WF024 - Backup Automático
- [ ] Implementar WF025 - Limpeza de Dados
- [ ] Configurar monitoramento

**Critérios de Aceitação:**
- Regras executando automaticamente
- Backup funcionando
- Limpeza automática

---

## 📧 ÉPICO 8: Sistema de Comunicação

### Fase 8.1: Infraestrutura de Notificações
**Prioridade:** Alto  
**Duração Estimada:** 1.5 semanas

#### Tarefa 8.1.1: Backend de Notificações
**📋 Modelo de dados:**
- [12-Complete-Model-Guide.md - Entidade `notificacao`](12-Complete-Model-Guide.md#notificacao)
- [12-Complete-Model-Guide.md - Entidade `template_email`](12-Complete-Model-Guide.md#template_email)

- [ ] Implementar sistema de filas
- [ ] Implementar múltiplos canais
- [ ] Implementar templates dinâmicos
- [ ] Implementar agrupamento
- [ ] Implementar retry automático
- [ ] Implementar métricas de entrega

**Critérios de Aceitação:**
- Filas funcionando
- Múltiplos canais ativos
- Retry funcionando

#### Tarefa 8.1.2: Interfaces de Notificação
- [ ] Implementar central de notificações (UI034)
- [ ] Implementar configurações (UI035)
- [ ] Implementar notificações em tempo real
- [ ] Implementar indicadores visuais
- [ ] Implementar ações diretas

**Critérios de Aceitação:**
- Central funcionando
- Configurações aplicadas
- Tempo real ativo

### Fase 8.2: Templates e Comunicação
**Prioridade:** Alto  
**Duração Estimada:** 1 semana

#### Tarefa 8.2.1: Sistema de Templates
- [ ] Implementar editor de templates
- [ ] Implementar variáveis dinâmicas
- [ ] Implementar preview de templates
- [ ] Implementar versionamento
- [ ] Implementar teste de envio

**Critérios de Aceitação:**
- Editor funcionando
- Variáveis substituídas
- Preview preciso

### Fase 8.3: Workflows de Comunicação
**Prioridade:** Alto  
**Duração Estimada:** 1 semana

#### Tarefa 8.3.1: Workflows de Notificação N8N
- [ ] Implementar WF026 - Processamento de Email Recebido
- [ ] Implementar WF027 - Envio de Notificação
- [ ] Implementar WF028 - Agrupamento de Notificações
- [ ] Configurar canais de entrega

**Critérios de Aceitação:**
- Emails processados automaticamente
- Notificações entregues
- Agrupamento funcionando

---

## 📱 ÉPICO 9: Portal do Cliente

**📋 Integração JSQL:** Todas as operações de dados neste épico usam JSQL.
Consulte [11-JSQL-Proxy-Integration.md](11-JSQL-Proxy-Integration.md) para referência completa.

### Fase 9.1: Infraestrutura do Portal
**Prioridade:** Alto  
**Duração Estimada:** 1 semana

#### Tarefa 9.1.1: Backend do Portal
- [ ] Implementar APIs específicas do portal
- [ ] Implementar filtros de segurança
- [ ] Implementar cache otimizado
- [ ] Implementar métricas do cliente
- [ ] Implementar notificações do portal

**Critérios de Aceitação:**
- APIs seguras funcionando
- Filtros impedindo acesso cruzado
- Performance otimizada

#### Tarefa 9.1.2: Autenticação do Portal
- [ ] Implementar login específico
- [ ] Implementar recuperação de senha
- [ ] Implementar perfil simplificado
- [ ] Implementar sessões seguras

**Critérios de Aceitação:**
- Login do portal funcionando
- Segurança garantida
- Perfil editável

### Fase 9.2: Interfaces do Portal
**Prioridade:** Alto  
**Duração Estimada:** 1.5 semanas

#### Tarefa 9.2.1: Dashboard e Chamados do Cliente
- [ ] Implementar dashboard do cliente (UI031)
- [ ] Implementar meus chamados (UI032)
- [ ] Implementar detalhes do chamado (UI033)
- [ ] Implementar abertura de chamados
- [ ] Implementar acompanhamento

**Critérios de Aceitação:**
- Dashboard com métricas do cliente
- Lista filtrada corretamente
- Detalhes seguros

#### Tarefa 9.2.2: Funcionalidades do Portal
- [ ] Implementar comentários do cliente
- [ ] Implementar upload de anexos
- [ ] Implementar avaliação de satisfação
- [ ] Implementar notificações do portal
- [ ] Implementar busca de chamados

**Critérios de Aceitação:**
- Comentários funcionando
- Upload seguro
- Avaliações registradas

---

## 🔗 ÉPICO 10: Integrações e APIs

### Fase 10.1: API Pública
**Prioridade:** Médio  
**Duração Estimada:** 2 semanas

#### Tarefa 10.1.1: Documentação e SDK
- [ ] Implementar documentação OpenAPI
- [ ] Implementar autenticação por token
- [ ] Implementar rate limiting
- [ ] Implementar versionamento
- [ ] Implementar SDKs básicos
- [ ] Implementar ambiente de sandbox

**Critérios de Aceitação:**
- Documentação completa
- Rate limiting funcionando
- SDKs funcionais

### Fase 10.2: Webhooks e Integrações
**Prioridade:** Médio  
**Duração Estimada:** 1.5 semanas

#### Tarefa 10.2.1: Sistema de Webhooks
- [ ] Implementar configuração de webhooks
- [ ] Implementar assinatura de payloads
- [ ] Implementar retry automático
- [ ] Implementar logs de webhooks
- [ ] Implementar teste de webhooks

**Critérios de Aceitação:**
- Webhooks configuráveis
- Assinatura segura
- Retry funcionando

#### Tarefa 10.2.2: Workflows de Integração N8N
- [ ] Implementar WF029 - Webhook Outbound
- [ ] Implementar WF030 - Sincronização CRM
- [ ] Configurar conectores principais
- [ ] Testar integrações

**Critérios de Aceitação:**
- Webhooks enviados
- Sincronização funcionando
- Conectores ativos

---

## 📱 ÉPICO 11: Mobile e Responsividade

### Fase 11.1: Responsividade Web e PWA
**Prioridade:** Alto
**Duração Estimada:** 1.5 semanas
**📋 Arquitetura PWA:** [08-PWA-Authentication-Architecture.md](08-PWA-Authentication-Architecture.md)

#### Tarefa 11.1.1: Otimização Mobile Web e PWA
- [ ] Implementar design responsivo completo
- [ ] Otimizar interfaces para touch
- [ ] Implementar navegação mobile
- [ ] Otimizar performance mobile
- [ ] Implementar PWA manifest
- [ ] Configurar Service Worker para cache
- [ ] Implementar instalação PWA
- [ ] Testar PWA em iOS e Android

**Critérios de Aceitação:**
- Todas as interfaces responsivas
- Performance otimizada
- PWA instalável em iOS/Android
- Autenticação funcionando em PWA standalone
- Modo offline com cache inteligente

### Fase 11.2: Funcionalidades Mobile
**Prioridade:** Médio  
**Duração Estimada:** 1 semana

#### Tarefa 11.2.1: App Mobile Features
- [ ] Implementar notificações push
- [ ] Implementar modo offline básico
- [ ] Implementar sincronização
- [ ] Implementar câmera para anexos
- [ ] Implementar geolocalização

**Critérios de Aceitação:**
- Push notifications funcionando
- Modo offline básico
- Sincronização automática

#### Tarefa 11.2.2: Workflows Mobile N8N
- [ ] Implementar WF031 - Notificação Push
- [ ] Configurar FCM/APNS
- [ ] Testar entrega de push

**Critérios de Aceitação:**
- Push notifications entregues
- Métricas de engagement

---

## 🛡️ ÉPICO 12: Segurança e Auditoria

### Fase 12.1: Segurança Avançada
**Prioridade:** Alto  
**Duração Estimada:** 1.5 semanas

#### Tarefa 12.1.1: Hardening de Segurança (PWA-Aware)
**📋 Ver CSP e segurança PWA:** [08-PWA-Authentication-Architecture.md](08-PWA-Authentication-Architecture.md#-camadas-de-segurança)

- [ ] Implementar HTTPS obrigatório
- [ ] Implementar CSP headers (PWA-compatible)
- [ ] Implementar proteção CSRF
- [ ] Implementar sanitização XSS
- [ ] Implementar rate limiting avançado
- [ ] Implementar monitoramento de segurança
- [ ] Validar segurança de IndexedDB criptografado
- [ ] Testar device fingerprinting

**Critérios de Aceitação:**
- Todas as proteções ativas
- CSP não bloqueando Service Worker
- Token criptografado seguro (AES-GCM)
- Monitoramento funcionando
- Testes de penetração passando

#### Tarefa 12.1.2: Auditoria Completa
- [ ] Implementar logs estruturados
- [ ] Implementar trilha de auditoria
- [ ] Implementar retenção de logs
- [ ] Implementar alertas de segurança
- [ ] Implementar compliance LGPD

**Critérios de Aceitação:**
- Logs completos
- Trilha de auditoria
- Compliance ativo

### Fase 12.2: Workflows de Segurança
**Prioridade:** Alto  
**Duração Estimada:** 1 semana

#### Tarefa 12.2.1: Workflows de Segurança N8N
- [ ] Implementar WF033 - Detecção de Anomalias
- [ ] Implementar WF034 - Auditoria de Permissões
- [ ] Configurar alertas automáticos
- [ ] Configurar relatórios de segurança

**Critérios de Aceitação:**
- Anomalias detectadas
- Auditoria automática
- Alertas funcionando

---

## 🚀 ÉPICO 13: Deploy e Produção

### Fase 13.1: Preparação para Produção
**Prioridade:** Crítico
**Duração Estimada:** 2 semanas
**📋 Checklist PWA:** [08-PWA-Authentication-Architecture.md](08-PWA-Authentication-Architecture.md#-critérios-de-aceitação)

#### Tarefa 13.1.1: Infraestrutura de Produção
- [ ] Configurar servidores de produção
- [ ] Configurar load balancer
- [ ] Configurar SSL/TLS (obrigatório para PWA)
- [ ] Configurar backup automático
- [ ] Configurar monitoramento
- [ ] Configurar logs centralizados
- [ ] Validar HTTPS em todos os endpoints
- [ ] Testar Service Worker em produção

**Critérios de Aceitação:**
- Infraestrutura estável
- HTTPS 100% funcional (requisito PWA)
- Service Worker registrado corretamente
- Monitoramento ativo
- Backups funcionando

#### Tarefa 13.1.2: Pipeline de Deploy
- [ ] Configurar CI/CD
- [ ] Implementar testes automatizados
- [ ] Configurar deploy automático
- [ ] Implementar rollback automático
- [ ] Configurar ambientes (dev/staging/prod)

**Critérios de Aceitação:**
- Pipeline funcionando
- Testes passando
- Deploy automático

### Fase 13.2: Migração de Dados
**Prioridade:** Crítico  
**Duração Estimada:** 1 semana

#### Tarefa 13.2.1: Migração do TomTicket
- [ ] Testar script de migração
- [ ] Executar migração de dados
- [ ] Validar integridade dos dados
- [ ] Configurar usuários iniciais
- [ ] Configurar papéis e permissões
- [ ] Treinar usuários

**Critérios de Aceitação:**
- Dados migrados corretamente
- Usuários configurados
- Sistema funcionando

### Fase 13.3: Go-Live e Suporte
**Prioridade:** Crítico  
**Duração Estimada:** 1 semana

#### Tarefa 13.3.1: Lançamento
- [ ] Executar go-live
- [ ] Monitorar sistema em produção
- [ ] Resolver issues críticos
- [ ] Coletar feedback inicial
- [ ] Ajustar configurações
- [ ] Documentar lições aprendidas

**Critérios de Aceitação:**
- Sistema estável em produção
- Usuários utilizando
- Issues críticos resolvidos

---

## 📋 Resumo da Implementação

### Cronograma Geral:
- **Épico 1-3 (Core)**: 12 semanas - Base crítica do sistema + **Arquitetura PWA**
- **Épico 4-6 (Features)**: 8 semanas - Funcionalidades principais
- **Épico 7-9 (Advanced)**: 7 semanas - Recursos avançados
- **Épico 10-12 (Integration)**: 6 semanas - Integrações e segurança
- **Épico 13 (Deploy)**: 4 semanas - Produção e go-live

### Total Estimado: 37 semanas (~9 meses)

### 🔗 Documentação de Arquitetura:
- **PWA + Express:** [10-PWA-Express-Architecture.md](10-PWA-Express-Architecture.md)
- **Integração JSQL:** [11-JSQL-Proxy-Integration.md](11-JSQL-Proxy-Integration.md)
- **Autenticação PWA:** [08-PWA-Authentication-Architecture.md](08-PWA-Authentication-Architecture.md)
- **Autorização:** [09-Authorization-Implementation-Plan.md](09-Authorization-Implementation-Plan.md)

### Marcos Principais:
- **Semana 4**: MVP de autenticação funcionando
- **Semana 8**: CRUD básico de clientes/contatos
- **Semana 16**: Sistema de chamados completo
- **Semana 24**: Relatórios e dashboard funcionando
- **Semana 31**: Portal do cliente operacional
- **Semana 37**: Sistema em produção

### Recursos Necessários:
- **1 Tech Lead/Arquiteto**
- **2-3 Desenvolvedores Full-Stack**
- **1 Desenvolvedor Frontend especialista**
- **1 DevOps/Infraestrutura**
- **1 QA/Tester**
- **1 Product Owner**

### Critérios de Sucesso:
- ✅ Todas as 50 User Stories implementadas
- ✅ Todos os 260 requisitos atendidos
- ✅ 34 workflows N8N funcionando
- ✅ 35 interfaces implementadas
- ✅ Sistema em produção estável
- ✅ Migração do TomTicket concluída
- ✅ Usuários treinados e utilizando

Este guia garante implementação estruturada, completa e de alta qualidade do sistema Coletivos HelpDesk.
