# SPEC-sac-backbone.md

## Especificacao: Backbone (Processos Automatizados)

### Escopo

Este documento define os requisitos tecnicos formais do **backbone**, que implementa processos automatizados via workflows n8n para suportar os tres modulos de frontend (helpdesk, atendimento, gestao-sac). O backbone e responsavel por logica de negocio, automacoes, calculos, notificacoes e integracao de dados.

**Publico**: Desenvolvedores n8n, arquitetos, analistas de negocio.

**Referencias**:
- `spec/modules/sac-module/SPEC-sac-concepts.md` - Conceitos compartilhados (194 requisitos)
- `spec/modules/sac-module/backbone/USER-STORIES.md` - 27 user stories do backbone
- `spec/modules/sac-module/CONSTRAINTS.md` - Restricoes e limitacoes
- `workflows/` - Workflows n8n existentes como referencia

---

## 1. Gestao de SLA

### Definicao

Workflows responsaveis por calcular, monitorar e gerenciar Service Level Agreements.

### Requisitos

#### 1.1. Calculo de SLA ao Criar Ticket

**SPEC-sac-BB-SLA-001:** Workflow DEVE ser disparado ao criar ticket via webhook ou evento.

**SPEC-sac-BB-SLA-002:** Workflow DEVE buscar regra de SLA aplicavel seguindo hierarquia:
1. Cliente especifico
2. Categoria do ticket
3. Prioridade do ticket
4. Regra geral (padrao)

**SPEC-sac-BB-SLA-003:** Workflow DEVE calcular prazo de primeira resposta baseado em horario comercial.

**SPEC-sac-BB-SLA-004:** Workflow DEVE calcular prazo de resolucao baseado em horario comercial.

**SPEC-sac-BB-SLA-005:** Calculo DEVE considerar feriados cadastrados (nao contam como dias uteis).

**SPEC-sac-BB-SLA-006:** Calculo DEVE considerar fins de semana (nao contam como dias uteis).

**SPEC-sac-BB-SLA-007:** Workflow DEVE salvar timestamps dos prazos em campos:
- `sla_primeira_resposta_prazo`
- `sla_resolucao_prazo`

**SPEC-sac-BB-SLA-008:** Workflow DEVE usar node "Function" para logica de calculo de datas.

**SPEC-sac-BB-SLA-009:** Workflow DEVE usar node "MySQL" para consultar tabelas `TBsla_configuracao` e `TBferiado`.

**SPEC-sac-BB-SLA-010:** Workflow DEVE retornar timestamps calculados via webhook response.

#### 1.2. Monitoramento de Prazos

**SPEC-sac-BB-SLA-011:** Workflow DEVE ser executado periodicamente (schedule: a cada 5 minutos).

**SPEC-sac-BB-SLA-012:** Workflow DEVE buscar todos os tickets ativos (status != "Fechado" e != "Cancelado").

**SPEC-sac-BB-SLA-013:** Workflow DEVE calcular tempo restante para cada SLA (primeira resposta e resolucao).

**SPEC-sac-BB-SLA-014:** Workflow DEVE identificar tickets proximos do breach (ex: <20% do tempo restante).

**SPEC-sac-BB-SLA-015:** Workflow DEVE identificar tickets que ja estouraram SLA (tempo restante <= 0).

**SPEC-sac-BB-SLA-016:** Workflow DEVE atualizar campo `sla_status` com valores:
- "conformidade" (>50% tempo restante)
- "proximo" (20-50% tempo restante)
- "breach" (<0% tempo restante)

**SPEC-sac-BB-SLA-017:** Workflow DEVE usar node "Schedule Trigger" para execucao periodica.

**SPEC-sac-BB-SLA-018:** Workflow DEVE usar node "MySQL" para consultar e atualizar tickets.

#### 1.3. Alertas de Breach Proximo

**SPEC-sac-BB-SLA-019:** Workflow DEVE enviar alerta quando SLA atinge 20% do tempo restante.

**SPEC-sac-BB-SLA-020:** Workflow DEVE criar notificacao in-app na tabela `TBnotificacao`.

**SPEC-sac-BB-SLA-021:** Workflow DEVE enviar email ao agente responsavel via node "Send Email".

**SPEC-sac-BB-SLA-022:** Email DEVE usar template especifico de alerta de SLA.

**SPEC-sac-BB-SLA-023:** Notificacao DEVE incluir:
- Protocolo do ticket
- Tempo restante
- Link direto para o ticket

**SPEC-sac-BB-SLA-024:** Workflow DEVE evitar envio duplicado (flag `alerta_enviado` no ticket).

**SPEC-sac-BB-SLA-025:** Workflow DEVE publicar evento SSE em canal Redis `sac:sla:warning`.

#### 1.4. Pausa e Retomada de SLA

**SPEC-sac-BB-SLA-026:** Workflow DEVE ser disparado ao mudar status do ticket.

**SPEC-sac-BB-SLA-027:** Workflow DEVE pausar SLA se status muda para "Aguardando Cliente".

**SPEC-sac-BB-SLA-028:** Pausa DEVE registrar timestamp em campo `sla_pausado_em`.

**SPEC-sac-BB-SLA-029:** Workflow DEVE retomar SLA se status muda de "Aguardando Cliente" para outro.

**SPEC-sac-BB-SLA-030:** Retomada DEVE calcular tempo pausado e adicionar aos prazos.

**SPEC-sac-BB-SLA-031:** Historico DEVE registrar periodos de pausa via insert em `TBchamado_historico`.

---

## 2. Regras de Automacao

### Definicao

Workflows responsaveis por executar regras de automacao configuradas (if-this-then-that).

### Requisitos

#### 2.1. Execucao ao Criar Ticket

**SPEC-sac-BB-AUT-001:** Workflow DEVE ser disparado ao criar ticket via evento.

**SPEC-sac-BB-AUT-002:** Workflow DEVE buscar regras ativas com gatilho "CRIAR_CHAMADO" em `TBautomacao_regra`.

**SPEC-sac-BB-AUT-003:** Workflow DEVE avaliar condicoes de cada regra (campo `condicoes` JSON).

**SPEC-sac-BB-AUT-004:** Avaliacao DEVE verificar se ticket atende criterios (matching de campos).

**SPEC-sac-BB-AUT-005:** Workflow DEVE executar acoes das regras que deram match (campo `acoes` JSON).

**SPEC-sac-BB-AUT-006:** Workflow DEVE registrar execucao em tabela de auditoria.

**SPEC-sac-BB-AUT-007:** Workflow DEVE incrementar contador `total_execucoes` da regra.

**SPEC-sac-BB-AUT-008:** Workflow DEVE usar node "Switch" para roteamento baseado em condicoes.

#### 2.2. Execucao ao Mudar Status

**SPEC-sac-BB-AUT-009:** Workflow DEVE ser disparado ao mudar status do ticket.

**SPEC-sac-BB-AUT-010:** Workflow DEVE buscar regras com gatilho "MUDAR_STATUS".

**SPEC-sac-BB-AUT-011:** Avaliacao DEVE considerar status anterior e novo status.

**SPEC-sac-BB-AUT-012:** Avaliacao DEVE considerar outros campos do ticket (categoria, prioridade, etc).

**SPEC-sac-BB-AUT-013:** Workflow DEVE executar acoes configuradas.

**SPEC-sac-BB-AUT-014:** Workflow DEVE registrar no historico do ticket.

#### 2.3. Avaliacao de Condicoes

**SPEC-sac-BB-AUT-015:** Workflow DEVE suportar condicoes JSON flexiveis (campo: valor).

**SPEC-sac-BB-AUT-016:** Workflow DEVE suportar operadores:
- `$eq` - Igual
- `$ne` - Diferente
- `$in` - Contem
- `$gt` - Maior que
- `$lt` - Menor que

**SPEC-sac-BB-AUT-017:** Workflow DEVE suportar condicoes multiplas (AND logico).

**SPEC-sac-BB-AUT-018:** Workflow DEVE suportar condicoes hierarquicas (departamento, categoria, prioridade, cliente).

**SPEC-sac-BB-AUT-019:** Avaliacao DEVE usar node "Function" com logica JavaScript.

#### 2.4. Execucao de Acoes

**SPEC-sac-BB-AUT-020:** Workflow DEVE suportar acao "Atribuir a agente/grupo".

**SPEC-sac-BB-AUT-021:** Workflow DEVE suportar acao "Mudar prioridade".

**SPEC-sac-BB-AUT-022:** Workflow DEVE suportar acao "Mudar status".

**SPEC-sac-BB-AUT-023:** Workflow DEVE suportar acao "Enviar email/notificacao".

**SPEC-sac-BB-AUT-024:** Workflow DEVE suportar acao "Adicionar tag".

**SPEC-sac-BB-AUT-025:** Workflow DEVE suportar acao "Escalar ticket".

**SPEC-sac-BB-AUT-026:** Workflow DEVE usar node "HTTP Request" para acoes externas (webhook).

**SPEC-sac-BB-AUT-027:** Workflow DEVE usar node "MySQL" para acoes de atualizacao no banco.

---

## 3. Atribuicao Automatica

### Definicao

Workflows responsaveis por distribuir tickets entre agentes automaticamente.

### Requisitos

#### 3.1. Round-Robin

**SPEC-sac-BB-ATR-001:** Workflow DEVE distribuir tickets sequencialmente entre agentes.

**SPEC-sac-BB-ATR-002:** Workflow DEVE buscar lista de agentes disponiveis do departamento.

**SPEC-sac-BB-ATR-003:** Workflow DEVE considerar apenas agentes online/disponiveis.

**SPEC-sac-BB-ATR-004:** Workflow DEVE evitar sobrecarregar agente (limite de tickets simultaneos).

**SPEC-sac-BB-ATR-005:** Workflow DEVE manter contador de ultimo agente atribuido (round-robin state).

**SPEC-sac-BB-ATR-006:** Atribuicao DEVE ser registrada no historico do ticket.

**SPEC-sac-BB-ATR-007:** Workflow DEVE usar node "MySQL" para consultar agentes e atualizar ticket.

#### 3.2. Por Habilidade

**SPEC-sac-BB-ATR-008:** Workflow DEVE fazer matching de categoria/tag do ticket com especialidades do agente.

**SPEC-sac-BB-ATR-009:** Workflow DEVE consultar campo `especialidades` (JSON) do agente.

**SPEC-sac-BB-ATR-010:** Se multiplos agentes qualificados, Workflow DEVE aplicar round-robin entre eles.

**SPEC-sac-BB-ATR-011:** Se nenhum agente qualificado, Workflow DEVE atribuir ao supervisor do departamento.

**SPEC-sac-BB-ATR-012:** Workflow DEVE priorizar agente com menor carga atual.

**SPEC-sac-BB-ATR-013:** Workflow DEVE usar node "Function" para logica de matching.

#### 3.3. Balanceamento de Carga

**SPEC-sac-BB-ATR-014:** Workflow DEVE calcular numero de tickets ativos por agente.

**SPEC-sac-BB-ATR-015:** Workflow DEVE priorizar agentes com menos tickets.

**SPEC-sac-BB-ATR-016:** Workflow DEVE respeitar limite maximo de tickets por agente (configuravel).

**SPEC-sac-BB-ATR-017:** Workflow DEVE considerar complexidade (tickets urgentes pesam mais).

**SPEC-sac-BB-ATR-018:** Calculo de carga DEVE usar formula: `carga = count(tickets) + sum(peso_prioridade)`.

**SPEC-sac-BB-ATR-019:** Workflow DEVE usar node "MySQL" com agregacoes para calcular carga.

---

## 4. Notificacoes

### Definicao

Workflows responsaveis por enviar notificacoes via multiplos canais.

### Requisitos

#### 4.1. Email

**SPEC-sac-BB-NOT-001:** Workflow DEVE enviar emails via SMTP configurado.

**SPEC-sac-BB-NOT-002:** Workflow DEVE usar template de email apropriado ao evento.

**SPEC-sac-BB-NOT-003:** Workflow DEVE substituir variaveis no template (ex: {{protocolo}}, {{titulo}}).

**SPEC-sac-BB-NOT-004:** Workflow DEVE rastrear status de envio (enviado, falha) em `TBnotificacao`.

**SPEC-sac-BB-NOT-005:** Workflow DEVE implementar retry automatico em caso de falha (max 3 tentativas).

**SPEC-sac-BB-NOT-006:** Workflow DEVE usar node "Send Email" (SMTP).

**SPEC-sac-BB-NOT-007:** Workflow DEVE usar node "Error Trigger" para capturar falhas e retry.

#### 4.2. In-App

**SPEC-sac-BB-NOT-008:** Workflow DEVE criar notificacao na tabela `TBnotificacao`.

**SPEC-sac-BB-NOT-009:** Notificacao DEVE ter tipo: "sistema" (in-app).

**SPEC-sac-BB-NOT-010:** Notificacao DEVE identificar usuario destinatario.

**SPEC-sac-BB-NOT-011:** Notificacao DEVE incluir conteudo e link de acao.

**SPEC-sac-BB-NOT-012:** Notificacao DEVE ter status inicial: "pendente" (nao lida).

**SPEC-sac-BB-NOT-013:** Workflow DEVE publicar evento SSE em canal Redis `sac:notification:<usuario_id>`.

**SPEC-sac-BB-NOT-014:** Workflow DEVE usar node "MySQL" para insert e node "Redis" para publish.

#### 4.3. Push Notification

**SPEC-sac-BB-NOT-015:** Workflow DEVE enviar notificacoes push para dispositivos moveis.

**SPEC-sac-BB-NOT-016:** Workflow DEVE integrar com servico de push (Firebase/OneSignal).

**SPEC-sac-BB-NOT-017:** Workflow DEVE identificar destinatario por token de dispositivo.

**SPEC-sac-BB-NOT-018:** Conteudo DEVE ser curto e objetivo.

**SPEC-sac-BB-NOT-019:** Push DEVE incluir deep link para acao relevante.

**SPEC-sac-BB-NOT-020:** Workflow DEVE rastrear entrega via callback.

**SPEC-sac-BB-NOT-021:** Workflow DEVE usar node "HTTP Request" para API do servico de push.

#### 4.4. WhatsApp

**SPEC-sac-BB-NOT-022:** Workflow DEVE enviar notificacoes via API oficial do WhatsApp.

**SPEC-sac-BB-NOT-023:** Workflow DEVE validar numero de telefone do destinatario.

**SPEC-sac-BB-NOT-024:** Workflow DEVE usar template aprovado pela API do WhatsApp.

**SPEC-sac-BB-NOT-025:** Workflow DEVE rastrear status de entrega (enviado, lido, falha).

**SPEC-sac-BB-NOT-026:** WhatsApp DEVE ser usado apenas para eventos criticos (breach SLA, ticket criado).

**SPEC-sac-BB-NOT-027:** Workflow DEVE usar node "HTTP Request" para API do WhatsApp Business.

---

## 5. Templates de Comunicacao

### Definicao

Workflows responsaveis por processar e aplicar templates de email e mensagens.

### Requisitos

#### 5.1. Aplicacao de Template

**SPEC-sac-BB-TPL-001:** Workflow DEVE buscar template por tipo de evento em `TBtemplate_email`.

**SPEC-sac-BB-TPL-002:** Template DEVE conter versao HTML e versao plain text.

**SPEC-sac-BB-TPL-003:** Workflow DEVE permitir templates customizados por departamento.

**SPEC-sac-BB-TPL-004:** Workflow DEVE usar template padrao se customizado nao existe (fallback).

**SPEC-sac-BB-TPL-005:** Workflow DEVE usar node "MySQL" para consultar templates.

#### 5.2. Substituicao de Variaveis

**SPEC-sac-BB-TPL-006:** Workflow DEVE substituir variaveis dinamicas no template.

**SPEC-sac-BB-TPL-007:** Workflow DEVE suportar variaveis:
- `{{protocolo}}` - Numero do ticket
- `{{titulo}}` - Titulo do ticket
- `{{nome_contato}}` - Nome do solicitante
- `{{nome_agente}}` - Nome do agente
- `{{cliente}}` - Nome do cliente/empresa

**SPEC-sac-BB-TPL-008:** Workflow DEVE suportar variaveis de URL:
- `{{link_ticket}}` - Link para visualizar ticket
- `{{link_avaliacao}}` - Link para avaliar atendimento

**SPEC-sac-BB-TPL-009:** Workflow DEVE suportar variaveis de data/hora formatadas:
- `{{data_criacao}}` - Data de criacao formatada
- `{{prazo_sla}}` - Prazo de SLA formatado

**SPEC-sac-BB-TPL-010:** Workflow DEVE tratar variaveis ausentes (substituir por vazio ou "N/A").

**SPEC-sac-BB-TPL-011:** Workflow DEVE usar node "Function" para logica de substituicao.

#### 5.3. Personalizacao por Contexto

**SPEC-sac-BB-TPL-012:** Workflow DEVE selecionar template apropriado ao tipo de evento.

**SPEC-sac-BB-TPL-013:** Workflow DEVE suportar eventos:
- Ticket criado
- Ticket resolvido
- SLA em breach
- Chat finalizado
- Transferencia de ticket

**SPEC-sac-BB-TPL-014:** Template PODE incluir branding do cliente (multitenancy).

**SPEC-sac-BB-TPL-015:** Workflow DEVE consultar configuracoes de branding por cliente.

---

## 6. Coleta de Metricas

### Definicao

Workflows responsaveis por calcular metricas e alimentar dashboards.

### Requisitos

#### 6.1. Metricas ao Resolver Ticket

**SPEC-sac-BB-MET-001:** Workflow DEVE ser disparado ao resolver ticket.

**SPEC-sac-BB-MET-002:** Workflow DEVE calcular tempo de primeira resposta (FRT):
```
FRT = primeira_resposta_timestamp - criacao_timestamp
```

**SPEC-sac-BB-MET-003:** Workflow DEVE calcular tempo total de resolucao (TTR):
```
TTR = resolucao_timestamp - criacao_timestamp - tempo_pausado
```

**SPEC-sac-BB-MET-004:** Workflow DEVE verificar se houve breach de SLA.

**SPEC-sac-BB-MET-005:** Workflow DEVE contar numero de interacoes (mensagens trocadas).

**SPEC-sac-BB-MET-006:** Workflow DEVE registrar satisfacao do cliente (se disponivel).

**SPEC-sac-BB-MET-007:** Workflow DEVE atualizar campos calculados no ticket.

**SPEC-sac-BB-MET-008:** Workflow DEVE usar node "Function" para calculos de tempo.

#### 6.2. Metricas ao Finalizar Chat

**SPEC-sac-BB-MET-009:** Workflow DEVE ser disparado ao finalizar chat.

**SPEC-sac-BB-MET-010:** Workflow DEVE calcular tempo de espera:
```
Tempo_espera = aceite_timestamp - criacao_timestamp
```

**SPEC-sac-BB-MET-011:** Workflow DEVE calcular tempo de atendimento:
```
Tempo_atendimento = finalizacao_timestamp - aceite_timestamp
```

**SPEC-sac-BB-MET-012:** Workflow DEVE calcular tempo total:
```
Tempo_total = finalizacao_timestamp - criacao_timestamp
```

**SPEC-sac-BB-MET-013:** Workflow DEVE contar numero de mensagens trocadas.

**SPEC-sac-BB-MET-014:** Workflow DEVE registrar satisfacao do cliente (se disponivel).

**SPEC-sac-BB-MET-015:** Workflow DEVE atualizar campos calculados no atendimento.

#### 6.3. Agregacao de Metricas

**SPEC-sac-BB-MET-016:** Workflow DEVE ser executado diariamente (schedule: meia-noite).

**SPEC-sac-BB-MET-017:** Workflow DEVE agregar metricas do dia:
- Volume de tickets
- FRT medio
- TTR medio
- Satisfacao media

**SPEC-sac-BB-MET-018:** Workflow DEVE agregar por dimensoes:
- Agente
- Departamento
- Categoria

**SPEC-sac-BB-MET-019:** Workflow DEVE calcular taxa de cumprimento de SLA:
```
Taxa_SLA = (tickets_cumpridos / tickets_totais) * 100
```

**SPEC-sac-BB-MET-020:** Workflow DEVE armazenar agregacoes em tabela de cache para consulta rapida.

**SPEC-sac-BB-MET-021:** Workflow DEVE usar node "MySQL" com queries de agregacao (GROUP BY).

---

## 7. Auditoria e Compliance

### Definicao

Workflows responsaveis por registrar logs de auditoria para rastreabilidade.

### Requisitos

#### 7.1. Auditoria de Criacao

**SPEC-sac-BB-AUD-001:** Workflow DEVE ser disparado ao criar ticket.

**SPEC-sac-BB-AUD-002:** Workflow DEVE criar registro imutavel em `TBauditoria`.

**SPEC-sac-BB-AUD-003:** Registro DEVE incluir campos:
- Usuario (quem criou)
- Timestamp
- IP do usuario
- Acao: "CREATE"
- Entidade afetada: ID do ticket
- Estado completo do ticket criado (JSON)

**SPEC-sac-BB-AUD-004:** Workflow DEVE rastrear sessao de usuario.

**SPEC-sac-BB-AUD-005:** Workflow DEVE usar node "MySQL" para insert append-only.

#### 7.2. Auditoria de Alteracoes

**SPEC-sac-BB-AUD-006:** Workflow DEVE ser disparado ao alterar ticket.

**SPEC-sac-BB-AUD-007:** Workflow DEVE registrar acao: "UPDATE".

**SPEC-sac-BB-AUD-008:** Registro DEVE incluir:
- Estado anterior do ticket (JSON)
- Estado novo do ticket (JSON)
- Campos alterados identificados (diff)
- Motivo da alteracao (se fornecido)

**SPEC-sac-BB-AUD-009:** Workflow DEVE usar node "Function" para calcular diff entre estados.

#### 7.3. Auditoria de Acoes Criticas

**SPEC-sac-BB-AUD-010:** Workflow DEVE registrar acoes sensiveis em auditoria.

**SPEC-sac-BB-AUD-011:** Acoes auditadas DEVEM incluir:
- Transferir ticket
- Escalar ticket
- Deletar ticket
- Visualizar dados sensiveis

**SPEC-sac-BB-AUD-012:** Workflow DEVE registrar acesso a informacoes confidenciais.

**SPEC-sac-BB-AUD-013:** Workflow DEVE registrar IP e user agent do usuario.

**SPEC-sac-BB-AUD-014:** Workflow DEVE rastrear sessao de autenticacao.

**SPEC-sac-BB-AUD-015:** Log DEVE ser append-only (nunca deletar).

---

## 8. Integracao de Dados

### Definicao

Workflows responsaveis por sincronizar e consolidar dados entre sistemas.

### Requisitos

#### 8.1. Sincronizacao entre Sistemas

**SPEC-sac-BB-INT-001:** Workflow DEVE manter dados consistentes entre modulos.

**SPEC-sac-BB-INT-002:** Workflow DEVE sincronizar dados de cliente/contato.

**SPEC-sac-BB-INT-003:** Workflow DEVE sincronizar status e dados de ticket.

**SPEC-sac-BB-INT-004:** Workflow DEVE usar eventos para propagacao de mudancas.

**SPEC-sac-BB-INT-005:** Workflow DEVE implementar retry automatico em caso de falha de sincronizacao.

**SPEC-sac-BB-INT-006:** Workflow DEVE usar node "HTTP Request" para comunicacao entre sistemas.

#### 8.2. Conversao Chat em Ticket

**SPEC-sac-BB-INT-007:** Workflow DEVE permitir conversao de chat finalizado em ticket.

**SPEC-sac-BB-INT-008:** Workflow DEVE criar ticket com historico completo do chat.

**SPEC-sac-BB-INT-009:** Workflow DEVE transferir anexos do chat para ticket.

**SPEC-sac-BB-INT-010:** Workflow DEVE vincular cliente e contato automaticamente.

**SPEC-sac-BB-INT-011:** Workflow DEVE criar referencia cruzada entre chat e ticket.

**SPEC-sac-BB-INT-012:** Workflow DEVE usar node "MySQL" para consultar mensagens do chat e criar ticket.

#### 8.3. Consolidacao de Informacoes

**SPEC-sac-BB-INT-013:** Workflow DEVE consolidar dados de cliente de multiplas fontes.

**SPEC-sac-BB-INT-014:** Workflow DEVE agregar historico de tickets do cliente.

**SPEC-sac-BB-INT-015:** Workflow DEVE agregar historico de chats do cliente.

**SPEC-sac-BB-INT-016:** Workflow DEVE consolidar dados de satisfacao.

**SPEC-sac-BB-INT-017:** Workflow DEVE calcular volume de interacoes por periodo.

**SPEC-sac-BB-INT-018:** Dados consolidados DEVEM estar disponiveis para agente durante atendimento.

**SPEC-sac-BB-INT-019:** Workflow DEVE cachear dados consolidados para consulta rapida.

---

## 9. Estrutura de Workflows

### Definicao

Especificacao da estrutura e organizacao dos workflows n8n.

### Requisitos

**SPEC-sac-BB-WF-001:** Cada workflow DEVE ter nome descritivo e unico.

**SPEC-sac-BB-WF-002:** Nome DEVE seguir padrao: `sac-<modulo>-<funcao>` (ex: `sac-helpdesk-sla-calc`).

**SPEC-sac-BB-WF-003:** Workflow DEVE ter tags para organizacao:
- `sac` - Tag do modulo
- `helpdesk` | `atendimento` | `gestao` | `backbone` - Tag do sub-modulo
- `sla` | `automacao` | `notificacao` | etc - Tag da funcionalidade

**SPEC-sac-BB-WF-004:** Workflow DEVE ter descricao clara do proposito.

**SPEC-sac-BB-WF-005:** Workflow DEVE ter notes documentando logica complexa.

**SPEC-sac-BB-WF-006:** Workflow DEVE ter error handling adequado (Error Trigger nodes).

**SPEC-sac-BB-WF-007:** Workflow DEVE ter logging de execucao para debug.

**SPEC-sac-BB-WF-008:** Workflow DEVE ter versionamento (campo `version` nos settings).

---

## 10. Triggers e Eventos

### Definicao

Especificacao de como workflows sao disparados.

### Requisitos

**SPEC-sac-BB-TRG-001:** Workflows DEVEM suportar triggers:
- Webhook (HTTP POST)
- Schedule (cron)
- Redis (consumer de eventos)

**SPEC-sac-BB-TRG-002:** Webhook DEVE ter autenticacao via header `X-API-Key`.

**SPEC-sac-BB-TRG-003:** Webhook DEVE validar payload JSON recebido.

**SPEC-sac-BB-TRG-004:** Webhook DEVE retornar resposta padrao JResult:
```json
{
  "success": true,
  "data": { /* resultado */ },
  "error": null
}
```

**SPEC-sac-BB-TRG-005:** Schedule DEVE usar expressao cron valida.

**SPEC-sac-BB-TRG-006:** Redis consumer DEVE se inscrever em canais especificos:
- `sac:ticket:events` - Eventos de tickets
- `sac:chat:events` - Eventos de chats

**SPEC-sac-BB-TRG-007:** Workflow DEVE processar eventos de forma assincrona (nao bloquear publisher).

---

## 11. Nodes Principais Utilizados

### Definicao

Especificacao dos nodes n8n mais utilizados nos workflows.

### Requisitos

**SPEC-sac-BB-NOD-001:** Workflows DEVEM usar nodes principais:
- **Webhook** - Receber requisicoes HTTP
- **HTTP Request** - Fazer chamadas HTTP
- **MySQL** - Consultar e atualizar banco de dados
- **Redis** - Publicar eventos e gerenciar cache
- **Function** - Logica JavaScript customizada
- **Send Email** - Enviar emails via SMTP
- **Switch** - Roteamento condicional
- **Error Trigger** - Tratamento de erros
- **Schedule Trigger** - Execucao periodica

**SPEC-sac-BB-NOD-002:** Node MySQL DEVE usar connection string configurada em credentials.

**SPEC-sac-BB-NOD-003:** Node Redis DEVE usar connection configurada em credentials.

**SPEC-sac-BB-NOD-004:** Node Function DEVE ter error handling (try-catch).

**SPEC-sac-BB-NOD-005:** Node HTTP Request DEVE ter timeout configurado (default: 30s).

**SPEC-sac-BB-NOD-006:** Node Send Email DEVE usar template HTML com fallback plain text.

---

## 12. Tratamento de Erros

### Definicao

Especificacao de como workflows tratam erros e falhas.

### Requisitos

**SPEC-sac-BB-ERR-001:** Workflow DEVE ter node "Error Trigger" para capturar erros.

**SPEC-sac-BB-ERR-002:** Erro DEVE ser logado com detalhes:
- Workflow name
- Node que falhou
- Mensagem de erro
- Stack trace
- Payload que causou erro

**SPEC-sac-BB-ERR-003:** Workflow DEVE implementar retry para operacoes transientes:
- Falha de rede
- Timeout de banco de dados
- Servico temporariamente indisponivel

**SPEC-sac-BB-ERR-004:** Retry DEVE usar backoff exponencial (1s, 2s, 4s, 8s, max 3 tentativas).

**SPEC-sac-BB-ERR-005:** Erro critico DEVE enviar notificacao para administradores.

**SPEC-sac-BB-ERR-006:** Workflow DEVE ter dead letter queue para erros nao recuperaveis.

**SPEC-sac-BB-ERR-007:** Workflow DEVE usar node "Set" para padronizar formato de erro.

---

## 13. Performance e Otimizacao

### Definicao

Requisitos de performance para workflows.

### Requisitos

**SPEC-sac-BB-PERF-001:** Workflow DEVE processar eventos em menos de 5 segundos.

**SPEC-sac-BB-PERF-002:** Workflow de SLA DEVE processar todos os tickets ativos em menos de 2 minutos.

**SPEC-sac-BB-PERF-003:** Workflow DEVE usar batch processing para operacoes em massa (>100 registros).

**SPEC-sac-BB-PERF-004:** Workflow DEVE usar indices otimizados nas queries MySQL.

**SPEC-sac-BB-PERF-005:** Workflow DEVE cachear resultados de consultas frequentes (Redis).

**SPEC-sac-BB-PERF-006:** Workflow DEVE usar connection pooling para banco de dados.

**SPEC-sac-BB-PERF-007:** Workflow DEVE processar eventos assincronamente (nao bloquear caller).

**SPEC-sac-BB-PERF-008:** Workflow DEVE ter limite de execucoes simultaneas para evitar sobrecarga.

---

## 14. Configuracao e Credentials

### Definicao

Especificacao de configuracoes e credenciais dos workflows.

### Requisitos

**SPEC-sac-BB-CFG-001:** Credentials DEVEM ser armazenadas em n8n credentials store (criptografadas).

**SPEC-sac-BB-CFG-002:** Credentials necessarias:
- MySQL (connection string)
- Redis (connection string)
- SMTP (email server)
- WhatsApp API (token)
- Push Notification Service (API key)

**SPEC-sac-BB-CFG-003:** Variaveis de ambiente DEVEM ser usadas para configuracoes:
- `SAC_API_URL` - URL base da API do SAC
- `SAC_WEBHOOK_KEY` - Chave de autenticacao de webhooks
- `SAC_FRONTEND_URL` - URL do frontend (para links em emails)

**SPEC-sac-BB-CFG-004:** Configuracoes DEVEM ter valores default sensiveis.

**SPEC-sac-BB-CFG-005:** Credentials DEVEM ter rotacao periodica (recomendado: 90 dias).

---

**Versao**: 1.0
**Data**: 2025-01-12
**Status**: Ativo
**Total de Requisitos**: 234
