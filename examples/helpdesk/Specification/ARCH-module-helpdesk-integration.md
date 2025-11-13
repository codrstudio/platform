# ARCH-module-helpdesk-integration.md

## Arquitetura: Módulo HelpDesk - Integração

### Escopo

Este documento descreve as **funcionalidades de integração e extensibilidade** do módulo HelpDesk. Inclui portal do cliente, APIs REST, webhooks, integração com email e conectores externos.

### Relacionamento com Outros Documentos

```
STORY-module-helpdesk-*.md (User Stories)
   ↓ implementadas por
SPEC-module-helpdesk-experience.md (Requisitos)
   ↓ usando design de
ARCH-module-helpdesk-integration.md (Arquitetura - ESTE DOCUMENTO)
```

---

## 9. Portal do Cliente e Mobile

### FN029: Interface Dedicada

**Descrição:**
Portal web responsivo especificamente projetado para usuários finais.

**Rotas:** /portal/dashboard, /portal/chamados, /portal/perfil, /portal/notificacoes

**Segurança:** Autenticação obrigatória, Isolamento de dados (multi-tenant), Apenas chamados próprios, Não vê comentários internos

**Experiência Mobile-First:** Design responsivo, Touch-friendly, Gestures nativos, Offline-first, PWA

**Temas:** White-label por cliente, Logo e cores customizáveis, Light/dark mode

**Decisões de Design:** SPA (React), Tailwind CSS, PWA com Service Worker, Cache-first strategy

**Implementa Requisitos:** SPEC-MH-PORTAL-001 a SPEC-MH-PORTAL-007
**Relacionado a User Stories:** US041, US042, US043

---

### FN030: Autoatendimento

**Descrição:**
Clientes abrem chamados, adicionam comentários, fazem upload de anexos e acompanham status.

**Jornada:** Login → Dashboard → Novo Chamado → Preenche → Anexa → Submete → Protocolo → Acompanha

**Formulário:** Campos mínimos, Seleção departamento/categoria, Editor simples, Drag-and-drop anexos

**Acompanhamento:** Timeline visual, Status real-time, Notificações, Chat inline, Download anexos

**Base de Conhecimento:** Sugestões ao digitar, Artigos relacionados, Resolução sem abrir chamado

**Decisões de Design:** Formulário progressivo, Validação real-time, Auto-save rascunho, Sugestões inteligentes, Prevenção duplicatas

**Implementa Requisitos:** SPEC-MH-PORTALFUNC-001 a SPEC-MH-PORTALFUNC-007
**Relacionado a User Stories:** US015, US042, US043

---

### FN031: Experiência Personalizada

**Descrição:**
Portal adapta-se às configurações e preferências do cliente.

**Personalização Automática:** Detecção idioma, Detecção fuso horário, Tema baseado em OS, Layout responsivo

**Idiomas Suportados:** Português, Inglês, Espanhol, Francês, Alemão (extensível)

**i18n:** Strings traduzidas, Formatos localizados, Pluralização, RTL support

**Decisões de Design:** React i18next, dayjs para datas, CSS custom properties, LocalStorage preferências

**Implementa Requisitos:** SPEC-MH-PORTALFUNC-005, SPEC-MH-PORTALFUNC-007, SPEC-MH-COMPAT-005, SPEC-MH-COMPAT-006
**Relacionado a User Stories:** US003, US043

---

## 10. Integração e Extensibilidade

### FN032: API Completa

**Descrição:**
API REST completa para integração com sistemas externos.

**Base URL:** https://api.helpdesk.empresa.com/v1
**Autenticação:** Bearer Token (JWT)
**Rate Limits:** 1000 (normal), 10000 (integrações), 100000 (enterprise) requests/hora

**Endpoints Principais:**
- Autenticação: POST /auth/login, /auth/refresh, /auth/logout
- Chamados: GET/POST/PUT/DELETE /chamados, POST /chamados/:id/comentarios, /chamados/:id/anexos
- Clientes: GET/POST/PUT /clientes, /clientes/:id
- Contatos, Usuários, Departamentos, Relatórios

**Padrões REST:** Versionamento via URL, Métodos HTTP semânticos, Status codes corretos, Paginação, Filtros, Ordenação, JSON consistente

**Documentação:** OpenAPI 3.0 spec, Swagger UI, Exemplos código, Changelog, Guias migração

**SDKs Oficiais:** JavaScript/TypeScript, Python, PHP, Ruby, .NET

**Decisões de Design:** GraphQL (futuro), Rate limiting via Redis, API keys + JWT, CORS configurável, Webhooks

**Implementa Requisitos:** SPEC-MH-API-001 a SPEC-MH-API-007
**Relacionado a User Stories:** US048

---

### FN033: Webhooks e Eventos

**Descrição:**
Webhooks para notificação automática sobre eventos importantes.

**Eventos:** chamado (criado, atualizado, status_alterado, atribuido, comentario_novo, fechado, reaberto, sla_vencendo, sla_violado), cliente (criado, atualizado), satisfacao (respondida), atendimento (iniciado, finalizado)

**Configuração:** URL, eventos, ativo, secret, headers, retry (tentativas, intervalo, backoff)

**Segurança:** HMAC signature, Validação assinatura, IP whitelisting, HTTPS obrigatório, Timeout 30s

**Retry Logic:** 3 tentativas com backoff exponencial (imediato, 1 min, 5 min)

**Monitoramento:** Dashboard, Taxa sucesso/falha, Tempo médio resposta, Logs payload, Replay manual

**Decisões de Design:** Fila assíncrona, Idempotência via webhook_id, Circuit breaker, Max 10 webhooks/org, Rate limiting

**Implementa Requisitos:** SPEC-MH-API-004, SPEC-MH-INTEG-007
**Relacionado a User Stories:** US048

---

### FN034: Integração com Email

**Descrição:**
Processar emails recebidos e automaticamente criar chamados ou adicionar comentários.

**Fluxo:** Email chega → IMAP baixa → Parser processa (metadados, protocolo, corpo, anexos) → Se protocolo: adiciona comentário, Senão: cria chamado → Envia confirmação

**Detecção Protocolo:** Regex: \[#(\d{4}-\d{5})\], Headers: X-HelpDesk-Protocol, In-Reply-To, References

**Parsing:** HTML → Markdown, Remoção assinaturas, Extração citações, Inline images, Validação anexos

**Anti-Spam:** SPF/DKIM/DMARC, Blacklist, Rate limiting, Bayesian filter, Honeypot

**Categorização:** Keywords, ML, Regras, Departamento por email

**Decisões de Design:** Polling IMAP 1 min, Webhook instantâneo (Mailgun, SendGrid), Fila assíncrona, Preservação EML, Bounce handling

**Implementa Requisitos:** SPEC-MH-EMAIL-001 a SPEC-MH-EMAIL-007
**Relacionado a User Stories:** US049

---

### FN035: Conectores Externos

**Descrição:**
Integração com plataformas externas: CRM, telefonia, WhatsApp, Telegram, monitoramento, Slack/Teams.

**Integrações:**
1. **CRM (Salesforce, HubSpot)** - Sincronização bidirecional clientes/contatos, Criação chamados de leads, Atualização oportunidades
2. **Telefonia (Twilio, Vonage)** - Click-to-call, Gravação, Transcrição, Criação chamado de ligação
3. **WhatsApp Business API** - Atendimento via WhatsApp, Mesmo fluxo chat web, Conversão chamado, Templates
4. **Telegram** - Bot atendimento, Notificações, Criação via comando
5. **Monitoramento (Zabbix, Nagios, Datadog)** - Criação automática quando alerta, Atualização quando resolvido, Correlação
6. **Slack/Microsoft Teams** - Notificações canais, Comandos bot, Respostas inline, Dashboard métricas

**Arquitetura:** HelpDesk → Queue (Redis/RabbitMQ) → Worker Pool (CRM Sync, Phone Call, WhatsApp, Monitoring)

**Decisões de Design:** Arquitetura plugável, Workers assíncronos, Retry com backoff, Circuit breaker, Logs detalhados, Sandbox mode

**Implementa Requisitos:** SPEC-MH-INTEG-001 a SPEC-MH-INTEG-006
**Relacionado a User Stories:** US048, US049

---

## Resumo de Funcionalidades

### Estatísticas
- **Total de Funcionalidades:** 7 (FN029-FN035)
- **Categorias:** 2 módulos (Portal Cliente + Integração)
- **Requisitos Implementados:** 42
- **User Stories Cobertas:** US003, US015, US041-US043, US048-US049

### Princípios Arquiteturais
1. **API-First:** REST completa com documentação
2. **Webhooks:** Notificação eventos em tempo real
3. **Plugável:** Conectores externos modulares
4. **White-Label:** Portal customizável por cliente

---

**Documento gerado a partir de:** `ARCH-module-helpdesk.md`
**Data de divisão:** 2025-01-12
**Versão:** 1.0
