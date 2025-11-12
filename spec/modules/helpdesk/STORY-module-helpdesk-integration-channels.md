# STORY-module-helpdesk-integration-channels.md

## Área Temática: Integrações e Canais de Comunicação

### Visão Geral

Esta área representa as **conexões do sistema com o mundo externo**. As histórias deste grupo definem como o HelpDesk se comunica através de múltiplos canais (email, push, WhatsApp), como desenvolvedores integram com outros sistemas (APIs, webhooks) e como o sistema processa comunicações recebidas (emails que viram chamados).

O agrupamento forma uma unidade coesa que implementa sistema multicanal de notificações, APIs REST completas para integração, webhooks para eventos em tempo real, integração bidirecional com email e suporte a aplicativo mobile. Esta área é essencial para extensibilidade do sistema e comunicação omnichannel.

---

## User Stories

### US044 - Central de Notificações
**Como** usuário do sistema
**Eu quero** visualizar minhas notificações
**Para que** eu possa me manter informado sobre atualizações importantes

**Critérios de Sucesso:**
- [ ] Lista de notificações não lidas
- [ ] Marcação como lida/não lida
- [ ] Filtros por tipo de notificação
- [ ] Ações diretas das notificações
- [ ] Configuração de preferências
- [ ] Histórico de notificações
- [ ] Limpeza em lote

**Tabelas Relacionadas:** `TBnotificacao`, `TBtipo_notificacao`

---

### US045 - Configuração de Notificações
**Como** usuário
**Eu quero** configurar minhas preferências de notificação
**Para que** eu receba apenas as informações relevantes

**Critérios de Sucesso:**
- [ ] Configuração por tipo de evento
- [ ] Escolha de canais (email, push, sistema)
- [ ] Horários para recebimento
- [ ] Frequência de notificações
- [ ] Filtros por prioridade
- [ ] Teste de configurações
- [ ] Salvamento automático

**Tabelas Relacionadas:** `TBusuario`, `TBtipo_canal_notificacao`

---

### US048 - API para Integrações
**Como** desenvolvedor
**Eu quero** acessar APIs do sistema
**Para que** eu possa integrar com outros sistemas

**Critérios de Sucesso:**
- [ ] Documentação completa da API
- [ ] Autenticação via token
- [ ] Endpoints para todas as entidades principais
- [ ] Rate limiting e controle de acesso
- [ ] Webhooks para eventos importantes
- [ ] SDKs em linguagens populares
- [ ] Ambiente de sandbox para testes

**Tabelas Relacionadas:** Todas (via API)

---

### US049 - Integração com Email
**Como** administrador
**Eu quero** integrar o sistema com email
**Para que** chamados possam ser criados via email

**Critérios de Sucesso:**
- [ ] Configuração de contas de email
- [ ] Parsing automático de emails
- [ ] Criação de chamados a partir de emails
- [ ] Resposta via email atualiza chamados
- [ ] Tratamento de anexos
- [ ] Filtros anti-spam
- [ ] Log de processamento

**Tabelas Relacionadas:** `TBchamado`, `TBchamado_anexo`, `TBcontato`

---

### US050 - App Mobile para Atendentes
**Como** atendente
**Eu quero** acessar o sistema via mobile
**Para que** eu possa trabalhar mesmo fora do escritório

**Critérios de Sucesso:**
- [ ] Login seguro
- [ ] Lista de chamados otimizada para mobile
- [ ] Visualização de detalhes do chamado
- [ ] Adição de comentários
- [ ] Mudança de status
- [ ] Notificações push
- [ ] Modo offline básico
- [ ] Sincronização automática

**Tabelas Relacionadas:** `TBchamado`, `TBchamado_comentario`, `TBnotificacao`

---

## Schema do Banco de Dados

### Tabelas de Notificações
- **TBnotificacao**: Notificações enviadas/recebidas
  - Usuário destinatário
  - Tipo de notificação
  - Canal de envio (email, push, sistema, whatsapp, sms)
  - Status (pendente, enviada, lida, erro)
  - Data de envio
  - Data de leitura
  - Conteúdo/payload (JSON)
  - Entidade relacionada (chamado, cliente, etc.)
- **TBtipo_notificacao**: Tipos de notificação
  - Novo chamado, atualização, comentário, SLA, etc.
- **TBtipo_canal_notificacao**: Canais disponíveis
  - Email, Push, Sistema, WhatsApp, SMS

### Tabelas de Integração
- **TBapi_token**: Tokens de API para integrações
- **TBwebhook_config**: Configurações de webhooks
- **TBwebhook_log**: Log de entregas de webhooks

---

## Requisitos Relacionados

Esta área de User Stories implementa os seguintes requisitos (OSD):

**Notificações:**
- SPEC-MH-NOTIF-001 a SPEC-MH-NOTIF-007: Multicanal, preferências, templates, agrupamento, retry
- SPEC-MH-NOTIFCTR-001 a SPEC-MH-NOTIFCTR-007: Central unificada, filtros, ações, retenção

**APIs:**
- SPEC-MH-API-001 a SPEC-MH-API-007: REST, autenticação, rate limiting, webhooks, documentação

**Email:**
- SPEC-MH-EMAIL-001 a SPEC-MH-EMAIL-007: Criação de chamados, parsing, anexos, anti-spam

**Mobile:**
- SPEC-MH-MOBILE-001 a SPEC-MH-MOBILE-007: App nativo/PWA, funcionalidades, push, offline

**Integrações:**
- SPEC-MH-INTEG-001 a SPEC-MH-INTEG-007: CRM, SSO, telefonia, chat, inventário, monitoramento

---

## Sistema de Notificações Multicanal

### Canais Suportados

**1. Email**
- Servidor SMTP configurável
- Templates HTML personalizados
- Tracking de abertura (opcional)

**2. Push (Navegador)**
- Web Push API
- Funciona com navegador fechado
- Ações diretas

**3. Sistema (In-App)**
- Central no sistema
- Badge com contador
- Som/vibração

**4. WhatsApp (Integração)**
- Via API WhatsApp Business
- Templates pré-aprovados

**5. SMS (Opcional)**
- Para notificações críticas
- Via gateway SMS

---

## API REST

### Autenticação

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "***"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "...",
  "expires_in": 3600
}
```

### Endpoints Principais

**Chamados:**
```
GET    /api/chamados              # Listar
POST   /api/chamados              # Criar
GET    /api/chamados/:id          # Detalhes
PUT    /api/chamados/:id          # Atualizar
DELETE /api/chamados/:id          # Deletar
POST   /api/chamados/:id/comentarios
POST   /api/chamados/:id/anexos
PUT    /api/chamados/:id/status
```

**Clientes:**
```
GET    /api/clientes
POST   /api/clientes
GET    /api/clientes/:id
PUT    /api/clientes/:id
```

### Webhooks

**Eventos Disponíveis:**
- `chamado.criado`
- `chamado.atualizado`
- `chamado.status_alterado`
- `chamado.comentario_novo`
- `chamado.fechado`
- `chamado.reaberto`
- `chamado.sla_vencendo`
- `satisfacao.respondida`

**Payload Exemplo:**
```json
{
  "evento": "chamado.criado",
  "timestamp": "2025-01-15T14:30:00Z",
  "dados": {
    "chamado_id": "chamado-789",
    "protocolo": "2025-00123",
    "titulo": "Problema com impressora",
    "cliente_id": "cliente-456",
    "prioridade": "media",
    "departamento": "suporte-tecnico"
  }
}
```

---

## Integração com Email

### Fluxo de Criação via Email

```
1. Email chega em helpdesk@xpto.com
   ↓
2. Sistema processa:
   - Identifica remetente
   - Extrai assunto → título
   - Extrai corpo → descrição
   - Processa anexos
   ↓
3. Cria chamado automaticamente
   ↓
4. Envia confirmação ao remetente
```

### Fluxo de Resposta

```
1. Cliente responde email do chamado
   ↓
2. Sistema detecta protocolo no subject
   ↓
3. Adiciona resposta como comentário
   ↓
4. Notifica atendente
```

---

## App Mobile

### Plataformas
- iOS (Swift/SwiftUI)
- Android (Kotlin/Jetpack Compose)
- PWA (alternativa multiplataforma)

### Funcionalidades Offline
- Cache de chamados recentes
- Rascunho de comentários
- Sincronização quando online

---

## Resumo

**Total de User Stories:** 5
**Personas Envolvidas:** Todos os usuários, Desenvolvedores, Administradores
**Complexidade:** Alta (múltiplos canais e plataformas)
**Prioridade:** Alta (comunicação é crítica)
**Dependências:**
- STORY-module-helpdesk-authentication (autenticação)
- STORY-module-helpdesk-ticket-management (entidades para integração)
- STORY-module-helpdesk-automation-sla (templates de email)
