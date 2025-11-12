# Coletivos HelpDesk - Visão Geral do Sistema

## 1. Introdução

**Coletivos HelpDesk** é um sistema moderno e completo de atendimento ao cliente (SAC - Sistema de Atendimento ao Cliente) construído com arquitetura serverless e tecnologias de ponta. O sistema oferece uma solução integrada para gestão de chamados, atendimento em tempo real, portal do cliente e ferramentas administrativas avançadas.

### Objetivos Principais

- **Centralizar** o atendimento ao cliente em uma plataforma única e integrada
- **Automatizar** processos de triagem, roteamento e resolução de chamados
- **Empoderar** equipes de suporte com ferramentas eficientes e intuitivas
- **Proporcionar** experiência excepcional aos clientes através de portal self-service
- **Monitorar** performance e qualidade do atendimento através de dashboards e relatórios

---

## 2. Arquitetura Geral

O sistema é construído em uma arquitetura moderna de três camadas:

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND PWA (React)                      │
│  React 19 + TypeScript 5.8 + Vite 7 + Ant Design 5          │
│  - Interface do usuário (atendentes e clientes)             │
│  - Gerenciamento de estado (Zustand + React Query)          │
│  - Autenticação JWT via @coletivos/authz-client             │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST
                     │ /helpdesk/api/jsql
                     │ /helpdesk/authz/*
┌────────────────────▼────────────────────────────────────────┐
│                 BACKEND PROXY (Express)                      │
│  Express 4 + TypeScript                                      │
│  - Proxy para N8N workflows                                  │
│  - Validação e sanitização de requisições                   │
│  - Gerenciamento de autenticação/autorização                │
│  - Retry logic e error handling                             │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/Webhook
                     │ N8N API
┌────────────────────▼────────────────────────────────────────┐
│                      BACKBONE (N8N)                         │
│  N8N Workflows                                               │
│  - coletivos-requisicao: Processador JSQL                   │
│  - coletivos-aut: Autenticação JWT                          │
│  - coletivos-registro-falha: Auditoria de erros            │
└────────────────────┬────────────────────────────────────────┘
                     │ SQL Procedures
                     │ JSQL Protocol
┌────────────────────▼────────────────────────────────────────┐
│                 BANCO DE DADOS (SQL Server)                  │
│  SQL Server com 4 schemas                                    │
│  - sac: Schema principal (tabelas e JSQL procedures)        │
│  - jsql: Metadados e procedures JSQL                        │
│  - api: Utilitários de schema management                    │
│  - tom: Dados legados (migração)                            │
└─────────────────────────────────────────────────────────────┘
```

### Características da Arquitetura

- **Serverless**: Backend implementado com N8N workflows, sem servidor tradicional
- **API-First**: Toda comunicação via JSQL (JSON-based SQL query language)
- **Stateless**: Autenticação via JWT, sem sessões server-side
- **Progressive Web App (PWA)**: Frontend instalável e com suporte offline
- **Microservices Ready**: Arquitetura preparada para escalabilidade horizontal

---

## 3. Stack Tecnológica

### Frontend (PWA)

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| React | 19.1 | Framework UI principal |
| TypeScript | 5.8 | Tipagem estática |
| Vite | 7.1 | Build tool e dev server |
| Ant Design | 5.21 | Biblioteca de componentes UI |
| React Router | 7.9 | Roteamento SPA |
| Zustand | 5.0 | State management |
| @tanstack/react-query | 5.90 | Cache e sincronização de dados |
| Axios | 1.12 | Cliente HTTP |
| @coletivos/authz-client | local | Autenticação/Autorização |

### Backend (Proxy + Workflows)

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| Express | 4.21 | Servidor HTTP proxy |
| N8N | latest | Workflow engine (backbone) |
| @coletivos/authz | local | Middleware de autenticação |
| tsx | 4.20 | Runtime TypeScript |

### Banco de Dados

| Tecnologia | Propósito |
|------------|-----------|
| SQL Server | Database principal |
| JSQL | Query language JSON-based |
| pyodbc | Driver Python para migrations |

### Ferramentas de Desenvolvimento

- **ESLint**: Linting de código
- **Prettier**: Formatação de código
- **Vitest**: Testes unitários e de integração
- **Docker**: Containerização (opcional)

---

## 4. Conceitos-Chave

### 4.1 JSQL (JSON-based SQL Query Language)

JSQL é a linguagem de consulta proprietária do sistema, que traduz queries JSON em SQL procedures otimizadas.

**Exemplo de Select:**
```json
{
  "select": "chamado",
  "where": {
    "status": { "eq": "aberto" },
    "prioridade": { "in": ["alta", "urgente"] }
  },
  "options": { "limit": 10, "orderBy": "data_criacao DESC" },
  "output": ["id_chamado", "titulo", "status", "prioridade"]
}
```

**Exemplo de Mutate:**
```json
{
  "mutate": "chamado",
  "action": "update",
  "where": { "id_chamado": { "eq": 123 } },
  "values": { "status": "em_atendimento" },
  "output": ["id_chamado", "status"]
}
```

Todas as queries JSQL são enviadas para `POST /helpdesk/api/jsql` e processadas pelo workflow N8N `coletivos-requisicao`.

### 4.2 RBAC (Role-Based Access Control)

Sistema hierárquico de permissões baseado em papéis:

- **Permissões atômicas**: `select__entidade`, `mutate__entidade`, `configure__sistema`
- **Papéis (Roles)**: Agrupamento de permissões (espectador, gerente, administrador)
- **Atribuição flexível**: Usuários podem ter múltiplos papéis
- **Permissões específicas**: Override de permissões de papel por usuário

**Papéis Fixos (não podem ser deletados):**
- `espectador`: Acesso somente leitura
- `administrador`: Acesso total ao sistema

**Implementação no Frontend:**
```tsx
// Componente com proteção de permissão
<RequirePermission permission="select__usuario">
  <UserTable />
</RequirePermission>

// Hook para validação
const { hasPermission, canExecuteJSQL } = usePermission()
if (hasPermission('mutate__chamado')) {
  // Executar ação
}
```

### 4.3 Autenticação/Autorização Centralizada

- **JWT Tokens**: Autenticação stateless via tokens JWT
- **httpOnly Cookies**: Tokens armazenados em cookies seguros (não acessíveis por JS)
- **Refresh Tokens**: Renovação automática de tokens expirados
- **Single Sign-On Ready**: Arquitetura preparada para SSO
- **Pacote @coletivos/authz**: Biblioteca compartilhada para auth/authz

**Fluxo de Autenticação:**
1. Usuário faz login via `POST /helpdesk/authz/login`
2. Backend valida credenciais no N8N workflow `coletivos-aut`
3. Token JWT é gerado e armazenado em httpOnly cookie
4. Frontend recebe resposta com dados do usuário (sem token)
5. Requisições subsequentes incluem cookie automaticamente

### 4.4 Status-Driven Workflow

Chamados fluem através de estados definidos:

```
┌─────────┐    ┌─────────────────┐    ┌──────────────────┐
│ aberto  │───▶│ em_atendimento  │───▶│ aguardando_      │
└─────────┘    └─────────────────┘    │ contato          │
                                       └────────┬─────────┘
                                                │
                        ┌───────────────────────┴────────┐
                        ▼                                ▼
                  ┌───────────┐                  ┌──────────┐
                  │ resolvido │                  │cancelado │
                  └───────────┘                  └──────────┘
```

Cada status possui:
- **DFtipo_status**: A=Aberto, P=Progresso, F=Finalizado, C=Cancelado
- **DFstatus_inicial**: Indica se é status de entrada
- **DFstatus_final**: Indica se é status de saída (finalização)

---

## 5. Principais Funcionalidades

### 5.1 Gestão de Chamados

- **Criação de chamados**: Por atendentes ou clientes via portal
- **Atribuição automática/manual**: Baseada em regras de automação
- **Priorização inteligente**: 4 níveis (baixa, normal, alta, urgente)
- **Categorização**: Organização por categorias e subcategorias
- **Tags**: Etiquetagem flexível para classificação adicional
- **SLA tracking**: Monitoramento de tempo de resposta e resolução
- **Histórico completo**: Auditoria de todas as mudanças

### 5.2 Atendimento em Tempo Real (Chat)

- **Console de chat**: Interface para atendentes gerenciarem conversas
- **Chat widget**: Widget embarcável para sites de clientes
- **Histórico de conversas**: Registro completo de interações
- **Chatbot integrado**: Atendimento automatizado com IA
- **Transferência de atendimento**: Entre atendentes e departamentos
- **Mensagens offline**: Armazenamento quando cliente está desconectado

### 5.3 Portal do Cliente

- **Dashboard personalizado**: Visão geral dos chamados do cliente
- **Abertura de chamados**: Interface simplificada para clientes
- **Acompanhamento**: Status e histórico de chamados
- **Base de conhecimento**: Artigos e FAQs (futuro)
- **Pesquisa de satisfação**: Avaliação do atendimento recebido

### 5.4 Administração

**Usuários e Permissões:**
- Gerenciamento de usuários do sistema
- Atribuição de papéis (roles)
- Concessão/revogação de permissões específicas
- Ativação/desativação de contas
- Bloqueio/desbloqueio por tentativas de login

**Estrutura Organizacional:**
- Gerenciamento de departamentos
- Cadastro de atendentes
- Definição de especialidades
- Horários de funcionamento
- Feriados e calendário

**Configurações do Sistema:**
- Status de chamados personalizáveis
- Prioridades configuráveis
- Categorias e subcategorias
- Templates de email
- Regras de automação
- Configurações de SLA

### 5.5 Relatórios e Dashboards

**Dashboard Executivo:**
- Total de chamados por período
- Taxa de resolução
- Tempo médio de atendimento
- Distribuição por status
- Distribuição por prioridade
- Top categorias
- Performance por atendente

**Relatórios:**
- Relatório de chamados (filtros avançados)
- Relatório de SLA
- Relatório de satisfação
- Relatório de produtividade
- Exportação para Excel/PDF

### 5.6 Notificações

- **Email**: Notificações por email para eventos importantes
- **In-app**: Notificações na interface do sistema
- **Configuráveis**: Usuários podem escolher quais notificações receber
- **Eventos**: Novo chamado, mudança de status, comentário, atribuição, etc.

---

## 6. Estrutura do Código

### 6.1 Organização de Pastas (Frontend)

```
src/helpdesk/src/
├── components/          # Componentes reutilizáveis
│   ├── layout/         # Layout principal, sidebar, header
│   ├── tags/           # Componentes de tags
│   └── RequirePermission.tsx  # HOC de proteção de permissão
│
├── context/            # Contextos React
│   └── ThemeContext.tsx
│
├── entities/           # Módulos por entidade (Domain-Driven Design)
│   ├── chamado/       # Hooks e tipos de chamado
│   ├── usuario/       # Hooks e tipos de usuário
│   ├── cliente/       # Hooks e tipos de cliente
│   ├── contato/       # Hooks e tipos de contato
│   ├── departamento/  # Hooks e tipos de departamento
│   ├── papel/         # Hooks e tipos de papel (role)
│   ├── permissao/     # Hooks e tipos de permissão
│   ├── atendente/     # Hooks e tipos de atendente
│   ├── atendimento/   # Hooks e tipos de atendimento (chat)
│   ├── dashboard/     # Hooks e tipos de dashboard
│   ├── relatorio/     # Hooks e tipos de relatório
│   ├── categoria/     # Hooks e tipos de categoria
│   ├── tag/           # Hooks e tipos de tag
│   ├── prioridade/    # Hooks e tipos de prioridade
│   └── status_chamado/ # Hooks e tipos de status
│
├── pages/              # Páginas/rotas da aplicação
│   ├── admin/         # Páginas administrativas
│   │   ├── users/     # Gestão de usuários
│   │   ├── roles/     # Gestão de papéis
│   │   ├── departamentos/  # Gestão de departamentos
│   │   └── atendentes/     # Gestão de atendentes
│   ├── chamados/      # Páginas de chamados
│   ├── chat/          # Páginas de chat/atendimento
│   ├── clientes/      # Páginas de clientes
│   ├── contatos/      # Páginas de contatos
│   ├── dashboards/    # Páginas de dashboards
│   ├── relatorios/    # Páginas de relatórios
│   ├── portal/        # Páginas do portal do cliente
│   ├── profile/       # Páginas de perfil de usuário
│   ├── configuracoes/ # Páginas de configurações
│   ├── notificacoes/  # Páginas de notificações
│   ├── busca/         # Busca global
│   └── Home.tsx       # Página inicial
│
├── shared/             # Código compartilhado
│   ├── api/           # Cliente API e configuração
│   │   ├── axiosConfig.ts      # Configuração Axios
│   │   ├── jsqlClient.ts       # Cliente JSQL
│   │   └── permissionService.ts # Serviço de permissões
│   ├── hooks/         # Hooks compartilhados
│   │   ├── usePermission.ts    # Hook de permissões
│   │   ├── useRequirePermission.ts
│   │   ├── useJSQLQuery.ts     # Hook de queries JSQL
│   │   └── useKeyboardShortcut.ts
│   ├── types/         # Tipos TypeScript compartilhados
│   │   ├── entities.ts         # Tipos de entidades
│   │   └── jsql.types.ts       # Tipos JSQL
│   └── utils/         # Utilitários
│       ├── jwt.ts              # Utilitários JWT
│       ├── exportUtils.tsx     # Exportação de dados
│       └── tokenRefreshOnFocus.ts
│
├── App.tsx             # Componente raiz com rotas
├── main.tsx            # Entry point (monta providers)
└── vite-env.d.ts       # Tipos ambiente Vite
```

### 6.2 Organização de Pastas (Backend)

```
src/helpdesk/
├── server/             # Backend Express
│   ├── config/
│   │   └── n8n.ts     # Configuração endpoints N8N
│   ├── middleware/
│   │   └── error.ts   # Middleware de tratamento de erros
│   ├── routes/
│   │   ├── jsql.ts    # Proxy JSQL para N8N
│   │   └── auth.ts    # Rotas de autenticação
│   └── index.ts       # Entry point do servidor
│
└── dist-server/        # Build do backend (gerado)
```

### 6.3 Entidades Principais

| Entidade | Descrição |
|----------|-----------|
| **TBusuario** | Usuários do sistema (atendentes e clientes) |
| **TBatendente** | Atendentes vinculados a usuários |
| **TBcliente** | Empresas/organizações clientes |
| **TBcontato** | Contatos de clientes (pessoas) |
| **TBchamado** | Tickets/chamados de suporte |
| **TBchamado_comentario** | Comentários em chamados |
| **TBchamado_anexo** | Anexos de chamados |
| **TBatendimento** | Sessões de chat/atendimento |
| **TBatendimento_mensagem** | Mensagens de chat |
| **TBdepartamento** | Departamentos da organização |
| **TBpapel** | Papéis (roles) do sistema RBAC |
| **TBpermissao** | Permissões atômicas |
| **TBusuario_papel** | Relação usuário-papel (N:N) |
| **TBusuario_permissao** | Permissões específicas de usuário |
| **TBstatus_chamado** | Status possíveis de chamados |
| **TBprioridade** | Prioridades de chamados |
| **TBcategoria** | Categorias de chamados |
| **TBtag** | Tags para classificação |
| **TBentidade_tag** | Relação polimórfica entidade-tag |

---

## 7. Fluxos Principais

### 7.1 Fluxo de Autenticação

```
1. Usuário acessa /helpdesk/login
   └─▶ Frontend carrega LoginPage (@coletivos/authz-client)

2. Usuário preenche credenciais e submete
   └─▶ POST /helpdesk/authz/login
       ├─ email
       └─ senha

3. Express recebe e valida request
   └─▶ Chama N8N workflow 'coletivos-aut'
       └─▶ Workflow executa jsql__select__usuario
           └─▶ Valida hash de senha (SHA-512)
               ├─ Senha inválida: retorna 401
               └─ Senha válida: gera JWT token

4. N8N retorna token JWT + dados do usuário
   └─▶ Express armazena token em httpOnly cookie
       └─▶ Retorna dados do usuário (sem token)

5. Frontend recebe sucesso
   └─▶ AuthProvider atualiza estado
       └─▶ Redireciona para /helpdesk
```

### 7.2 Fluxo de Consulta JSQL

```
1. Componente React precisa de dados
   └─▶ Usa hook customizado (ex: useChamados)
       └─▶ useJSQLQuery({ select: 'chamado', ... })

2. Hook verifica permissão localmente
   └─▶ permissionStore.canExecuteJSQL(query)
       ├─ Sem permissão: retorna erro
       └─ Com permissão: prossegue

3. Hook faz requisição HTTP
   └─▶ POST /helpdesk/api/jsql
       ├─ Cookie JWT incluído automaticamente
       └─ Body: { select: 'chamado', where: {...}, ... }

4. Express valida token JWT
   └─▶ Middleware @coletivos/authz
       ├─ Token inválido/expirado: 401
       └─ Token válido: prossegue

5. Express proxy para N8N
   └─▶ POST N8N_BASE_URL/requisicao
       └─▶ Workflow 'coletivos-requisicao'
           └─▶ Executa sac.jsql__select__chamado
               └─▶ Valida permissões no banco
                   └─▶ Retorna dados ou erro

6. Express recebe resposta
   └─▶ Valida envelope { code, message, data }
       └─▶ Retorna para frontend

7. Frontend recebe dados
   └─▶ React Query atualiza cache
       └─▶ Componente re-renderiza com novos dados
```

### 7.3 Fluxo de Criação de Chamado

```
1. Usuário clica em "Novo Chamado"
   └─▶ Navega para /helpdesk/chamados/novo

2. Componente NovoChamadoRapido renderiza
   └─▶ Carrega dados necessários:
       ├─ Categorias (jsql__select__categoria)
       ├─ Prioridades (jsql__select__prioridade)
       ├─ Status (jsql__select__status_chamado)
       └─ Clientes (jsql__select__cliente)

3. Usuário preenche formulário
   └─▶ Ant Design Form com validação
       ├─ Título (obrigatório)
       ├─ Descrição (obrigatório)
       ├─ Cliente (obrigatório)
       ├─ Categoria (opcional)
       ├─ Prioridade (padrão: normal)
       └─ Anexos (opcional)

4. Usuário submete formulário
   └─▶ Validação client-side (react-hook-form + zod)
       └─▶ POST /helpdesk/api/jsql
           Body: {
             mutate: 'chamado',
             action: 'abrirPorAtendente',
             values: { ... },
             output: ['id_chamado', 'titulo', 'status']
           }

5. Backend processa mutation
   └─▶ N8N executa jsql__mutate__chamado__abrirPorAtendente
       ├─ Cria registro em TBchamado
       ├─ Define status inicial (DFstatus_inicial = true)
       ├─ Registra histórico (TBchamado_historico)
       ├─ Aplica regras de automação
       ├─ Atribui a departamento/atendente (se configurado)
       └─ Envia notificações

6. Frontend recebe sucesso
   └─▶ Exibe mensagem de sucesso (toast)
       └─▶ Redireciona para /helpdesk/chamados/:id
           └─▶ Página de detalhes do chamado
```

### 7.4 Fluxo de Atendimento (Chat)

```
1. Cliente acessa chat widget
   └─▶ Widget embarcado em chat-widget.html
       └─▶ Identifica-se ou cria contato anônimo

2. Cliente envia mensagem
   └─▶ POST /helpdesk/api/jsql
       Body: {
         mutate: 'atendimento_mensagem',
         action: 'enviar',
         values: {
           id_atendimento: null,  # Novo atendimento
           mensagem: 'Olá, preciso de ajuda'
         }
       }

3. Backend processa mensagem
   └─▶ jsql__mutate__atendimento_mensagem__enviar
       ├─ Se id_atendimento = null:
       │   └─▶ Chama jsql__mutate__atendimento__iniciar
       │       ├─ Cria TBatendimento
       │       └─ Atribui a atendente disponível
       └─▶ Cria TBatendimento_mensagem
           └─▶ Envia notificação para atendente

4. Atendente recebe notificação
   └─▶ Console de chat (/helpdesk/chat/console)
       └─▶ Lista atualiza via polling/websocket (futuro)
           └─▶ Exibe novo atendimento

5. Atendente responde
   └─▶ POST /helpdesk/api/jsql
       Body: {
         mutate: 'atendimento_mensagem',
         action: 'enviar',
         values: {
           id_atendimento: 123,
           mensagem: 'Como posso ajudá-lo?'
         }
       }

6. Cliente recebe resposta
   └─▶ Widget atualiza via polling
       └─▶ Exibe mensagem do atendente

7. Finalização do atendimento
   └─▶ Atendente clica em "Finalizar"
       └─▶ POST /helpdesk/api/jsql
           Body: {
             mutate: 'atendimento',
             action: 'finalizar',
             where: { id_atendimento: { eq: 123 } }
           }
       └─▶ jsql__mutate__atendimento__finalizar
           ├─ Atualiza status para 'finalizado'
           ├─ Registra data/hora finalização
           └─▶ Opcionalmente cria chamado se necessário
```

---

## 8. Segurança

### 8.1 Autenticação

- **JWT Tokens**: Tokens assinados com chave secreta (HS256)
- **httpOnly Cookies**: Proteção contra XSS
- **Secure Flag**: Cookies transmitidos apenas via HTTPS
- **SameSite**: Proteção contra CSRF
- **Token Expiration**: Tokens com TTL configurável
- **Refresh Tokens**: Renovação sem re-autenticação

### 8.2 Autorização

- **Permission Checks**: Validação em múltiplas camadas
  - Frontend: UI condicional e validação pré-request
  - Backend Proxy: Validação antes de proxy
  - JSQL Procedures: Validação final no banco de dados
- **Least Privilege**: Usuários recebem apenas permissões necessárias
- **Audit Trail**: Registro de todas as operações sensíveis

### 8.3 Proteções

- **SQL Injection**: Prevenido por stored procedures e prepared statements
- **XSS**: React escapa automaticamente, sanitização adicional no backend
- **CSRF**: Tokens SameSite e validação de origin
- **Rate Limiting**: Limitação de requisições por IP (implementar)
- **Input Validation**: Validação rigorosa em todas as camadas

---

## 9. Performance e Escalabilidade

### 9.1 Estratégias de Cache

- **React Query**: Cache client-side com TTL e invalidação inteligente
- **Permission Store**: Cache de permissões com TTL de 5 minutos
- **Browser Cache**: Assets estáticos com cache HTTP
- **Service Worker**: Cache offline para PWA

### 9.2 Otimizações

- **Code Splitting**: Lazy loading de rotas e componentes
- **Tree Shaking**: Eliminação de código não utilizado
- **Bundle Optimization**: Chunks otimizados pelo Vite
- **Image Optimization**: Compressão e lazy loading de imagens
- **Virtual Scrolling**: Tabelas grandes com scroll virtual (futuro)

### 9.3 Escalabilidade

- **Stateless Architecture**: Permite scaling horizontal do Express
- **Serverless Workflows**: N8N workflows escalam automaticamente
- **Database Indexing**: Índices otimizados em queries frequentes
- **Connection Pooling**: Pool de conexões SQL Server
- **CDN Ready**: Assets podem ser servidos via CDN

---

## 10. Monitoramento e Observabilidade

### 10.1 Logs

- **Application Logs**: Logs estruturados no Express
- **N8N Execution Logs**: Histórico de execução de workflows
- **Error Tracking**: Workflow dedicado para captura de erros
- **Audit Logs**: TBauditoria registra operações críticas

### 10.2 Métricas

- **Dashboard Executivo**: Métricas de negócio em tempo real
- **Performance Metrics**: Tempo de resposta de queries
- **User Metrics**: Usuários ativos, sessões, etc.
- **Error Rate**: Taxa de erros por endpoint

### 10.3 Alertas (Futuro)

- Email/SMS para erros críticos
- Alertas de SLA ultrapassado
- Notificações de downtime
- Alertas de uso de recursos

---

## 11. Roadmap e Próximos Passos

### 11.1 Curto Prazo (3 meses)

- [ ] Implementar notificações em tempo real (WebSockets)
- [ ] Base de conhecimento para clientes
- [ ] Melhorias no chatbot com IA
- [ ] Dashboard de performance de atendentes
- [ ] Integração com WhatsApp Business API

### 11.2 Médio Prazo (6 meses)

- [ ] Aplicativo mobile nativo (React Native)
- [ ] Integração com Telegram
- [ ] Sistema de automações avançadas
- [ ] Workflow builder visual
- [ ] Multi-tenancy (SaaS mode)

### 11.3 Longo Prazo (12 meses)

- [ ] Inteligência artificial para categorização automática
- [ ] Análise de sentimento em atendimentos
- [ ] Previsão de SLA com machine learning
- [ ] Internacionalização (i18n)
- [ ] API pública para integrações

---

## 12. Referências e Documentação Adicional

### Documentação Técnica

- **JSQL Query Language**: `docs/JSQL/README.md`
- **Convenções SQL Server**: `docs/SQLServer-Convenções-de-Nomenclatura.md`
- **Sistema de Permissões**: `docs/Coletivos-HelpDesk/Sistema-de-Permissões-Guia-de-Uso.md`
- **Arquitetura de Autenticação**: `docs/Coletivos-HelpDesk/Especificação/08-PWA-Authentication-Architecture.md`
- **Arquitetura Express**: `docs/Coletivos-HelpDesk/Especificação/10-PWA-Express-Architecture.md`
- **Schema do Banco**: `docs/Coletivos-HelpDesk/Especificação/Guia-de-Schema/helpdesk_schema_documentation.md`

### Guias de Desenvolvimento

- **README Principal**: `CLAUDE.md`
- **README HelpDesk**: `src/helpdesk/README.md`
- **Guia de Componentes Ant Design**: `docs/Guias/Guia-de-Componentes-AntiDesign.md`
- **JSQL Frontend Integration**: `docs/Coletivos-HelpDesk/JSQL-Frontend-Integration.md`

### Especificações

- **User Stories**: `docs/Coletivos-HelpDesk/Especificação/01-Complete-User-Stories.md`
- **Requisitos**: `docs/Coletivos-HelpDesk/Especificação/02-Complete-Requirements.md`
- **Funcionalidades**: `docs/Coletivos-HelpDesk/Especificação/03-Complete-Functionalities.md`
- **Workflows N8N**: `docs/Coletivos-HelpDesk/Especificação/04-Complete-Workflows.md`

---

## 13. Contato e Suporte

Para dúvidas, sugestões ou contribuições:

- **Repositório**: `/home/coder/sources/coletivos`
- **Documentação**: `docs/`
- **Issues**: Reportar problemas e sugestões via sistema de issues

---

**Última atualização**: 2025-10-09
**Versão do documento**: 1.0.0
