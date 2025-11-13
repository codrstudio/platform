# Backbone - User Stories

Historias de usuario para processos automatizados (workflows n8n que suportam os tres modulos).

---

## 1. Gestao de SLA

### US-BB-001: Calcular SLA ao Criar Ticket

> Como sistema,
> Ao criar ticket, devo calcular prazos de SLA automaticamente,
> Para agentes saberem deadlines sem calcular manualmente.

**Criterios de Aceitacao**:
- Ao criar ticket, buscar regra de SLA aplicavel (hierarquia: cliente > categoria > prioridade > geral)
- Calcular prazo de primeira resposta baseado em horario comercial
- Calcular prazo de resolucao baseado em horario comercial
- Considerar feriados e fins de semana (nao contam)
- Salvar timestamps dos prazos no ticket

---

### US-BB-002: Monitorar Prazos de SLA

> Como sistema,
> Devo monitorar tickets em andamento continuamente,
> Para identificar quando estao proximos de breach.

**Criterios de Aceitacao**:
- Job executado periodicamente (ex: a cada 5 minutos)
- Calcula tempo restante para cada ticket ativo
- Identifica tickets proximos do breach (ex: <20% do tempo restante)
- Identifica tickets que ja estouraram SLA
- Marca flags de alerta e breach no ticket

---

### US-BB-003: Enviar Alertas de Breach Proximo

> Como sistema,
> Devo notificar agente quando SLA proximo de estourar,
> Para permitir acao antes do breach.

**Criterios de Aceitacao**:
- Notificacao enviada quando SLA atinge 20% do tempo restante
- Notificacao in-app (sistema) criada
- Email enviado ao agente responsavel
- Notificacao identifica ticket e tempo restante
- Evitar envio duplicado (apenas uma vez por alerta)

---

### US-BB-004: Pausar SLA ao Mudar Status

> Como sistema,
> Ao mudar status para "Aguardando Cliente", devo pausar SLA,
> Para nao penalizar agente por tempo de espera do cliente.

**Criterios de Aceitacao**:
- Status "Aguardando Cliente" pausa contagem de SLA
- Timestamp de pausa registrado
- Quando status muda novamente, SLA retoma de onde parou
- Tempo pausado nao conta para calculo de breach
- Historico registra periodos de pausa

---

## 2. Regras de Automacao

### US-BB-005: Executar Automacao ao Criar Ticket

> Como sistema,
> Ao criar ticket, devo executar regras de automacao configuradas,
> Para aplicar acoes automaticas consistentemente.

**Criterios de Aceitacao**:
- Buscar regras ativas com trigger "CRIAR_CHAMADO"
- Avaliar condicoes de cada regra (matching JSON)
- Executar acoes das regras que deram match
- Registrar execucao (sucesso/falha) para auditoria
- Incrementar contador de execucoes da regra

---

### US-BB-006: Executar Automacao ao Mudar Status

> Como sistema,
> Ao mudar status do ticket, devo executar automacoes,
> Para acoes automaticas baseadas em transicao de estado.

**Criterios de Aceitacao**:
- Buscar regras com trigger "MUDAR_STATUS"
- Avaliar condicoes (status anterior, novo status, outros campos)
- Executar acoes configuradas
- Registrar no historico do ticket

---

### US-BB-007: Avaliar Condicoes de Regra

> Como sistema,
> Devo avaliar se ticket atende condicoes da regra,
> Para executar apenas quando apropriado.

**Criterios de Aceitacao**:
- Suporte a condicoes JSON flexiveis (campo: valor)
- Operadores: igual, diferente, contem, maior, menor
- Condicoes multiplas (AND logico)
- Condicoes hierarquicas (departamento, categoria, prioridade, cliente)

---

### US-BB-008: Executar Acoes de Regra

> Como sistema,
> Ao regra dar match, devo executar acoes configuradas,
> Para automatizar processos de negocio.

**Criterios de Aceitacao**:
- Acoes suportadas: atribuir agente, mudar prioridade, adicionar tag, notificar, escalar
- Atribuicao round-robin entre agentes disponiveis
- Atribuicao por habilidade (matching especialidade)
- Adicao de tags automatica
- Notificacao de supervisor ou gestor

---

## 3. Atribuicao Automatica

### US-BB-009: Atribuir Ticket via Round-Robin

> Como sistema,
> Ao criar ticket nao atribuido, devo distribuir para proximo agente na fila,
> Para balancear carga de trabalho.

**Criterios de Aceitacao**:
- Lista de agentes disponiveis do departamento
- Distribuicao sequencial (round-robin)
- Considera apenas agentes online/disponiveis
- Evita sobrecarregar agente (limite de tickets simultaneos)
- Atribuicao registrada no historico

---

### US-BB-010: Atribuir Ticket por Habilidade

> Como sistema,
> Devo atribuir ticket para agente com especialidade correta,
> Para garantir resolucao por quem tem conhecimento.

**Criterios de Aceitacao**:
- Matching de categoria/tag do ticket com especialidades do agente
- Se multiplos agentes qualificados, aplicar round-robin
- Se nenhum agente qualificado, atribuir ao supervisor
- Preferencia para agente com menor carga atual

---

### US-BB-011: Balancear Carga entre Agentes

> Como sistema,
> Devo distribuir tickets considerando carga atual,
> Para evitar sobrecarga de alguns agentes.

**Criterios de Aceitacao**:
- Calcula numero de tickets ativos por agente
- Prioriza agentes com menos tickets
- Respeita limite maximo de tickets por agente
- Considera complexidade (tickets urgentes pesam mais)

---

## 4. Notificacoes

### US-BB-012: Enviar Notificacao por Email

> Como sistema,
> Devo enviar emails para comunicacao com clientes e agentes,
> Para manter todos informados de eventos importantes.

**Criterios de Aceitacao**:
- Envio via SMTP configurado
- Usa template de email apropriado ao evento
- Substitui variaveis no template
- Rastreia status de envio (enviado, falha)
- Retry automatico em caso de falha (max 3 tentativas)

---

### US-BB-013: Enviar Notificacao In-App

> Como sistema,
> Devo criar notificacoes no sistema,
> Para alertar usuarios em tempo real.

**Criterios de Aceitacao**:
- Notificacao criada na tabela de notificacoes
- Tipo: sistema (in-app)
- Usuario destinatario identificado
- Conteudo e link de acao incluidos
- Status: pendente (nao lida)

---

### US-BB-014: Enviar Notificacao Push

> Como sistema,
> Devo enviar notificacoes push para dispositivos moveis,
> Para alertar usuarios mesmo fora do sistema.

**Criterios de Aceitacao**:
- Integracao com servico de push (Firebase/OneSignal)
- Destinatario identificado por token de dispositivo
- Conteudo curto e objetivo
- Deep link para acao relevante
- Rastreamento de entrega

---

### US-BB-015: Enviar Notificacao via WhatsApp

> Como sistema,
> Devo enviar notificacoes via WhatsApp,
> Para comunicacao rapida com clientes.

**Criterios de Aceitacao**:
- Integracao com API oficial do WhatsApp
- Valida numero de telefone do destinatario
- Usa template aprovado
- Rastreia status de entrega (enviado, lido, falha)
- Apenas para eventos criticos (breach SLA, ticket criado)

---

## 5. Templates de Comunicacao

### US-BB-016: Aplicar Template de Email

> Como sistema,
> Ao enviar email, devo usar template configurado,
> Para comunicacao consistente e profissional.

**Criterios de Aceitacao**:
- Busca template por tipo de evento (ticket criado, resolvido, breach)
- Template contem HTML e versao plain text
- Suporta variaveis dinamicas
- Template pode ser customizado por departamento

---

### US-BB-017: Substituir Variaveis em Template

> Como sistema,
> Devo substituir variaveis no template por valores reais,
> Para personalizar mensagem.

**Criterios de Aceitacao**:
- Variaveis suportadas: protocolo, titulo, nome contato, nome agente, cliente
- Variaveis de URL: link para ticket, link para avaliacao
- Variaveis de data/hora formatadas
- Tratamento de variaveis ausentes (substitui por vazio ou "N/A")

---

### US-BB-018: Personalizar Template por Contexto

> Como sistema,
> Devo selecionar template apropriado ao contexto,
> Para comunicacao relevante.

**Criterios de Aceitacao**:
- Template diferente por tipo de evento
- Template pode ser customizado por departamento
- Template pode incluir branding do cliente (multitenancy)
- Fallback para template padrao se customizado nao existe

---

## 6. Coleta de Metricas

### US-BB-019: Calcular Metricas de Ticket ao Resolver

> Como sistema,
> Ao resolver ticket, devo calcular metricas,
> Para alimentar dashboards de gestao.

**Criterios de Aceitacao**:
- Calcula tempo de primeira resposta (FRT)
- Calcula tempo total de resolucao (TTR)
- Verifica se houve breach de SLA
- Conta numero de interacoes (mensagens trocadas)
- Registra satisfacao do cliente (se disponivel)

---

### US-BB-020: Calcular Metricas de Chat ao Finalizar

> Como sistema,
> Ao finalizar chat, devo calcular metricas,
> Para analise de performance de atendimento.

**Criterios de Aceitacao**:
- Calcula tempo de espera (inicio ate aceite por agente)
- Calcula tempo de atendimento (aceite ate finalizacao)
- Calcula tempo total (inicio ate finalizacao)
- Conta numero de mensagens trocadas
- Registra satisfacao do cliente (se disponivel)

---

### US-BB-021: Agregar Metricas por Periodo

> Como sistema,
> Devo calcular metricas agregadas periodicamente,
> Para relatorios e dashboards de gestao.

**Criterios de Aceitacao**:
- Job executado diariamente (ex: meia-noite)
- Agrega metricas do dia: volume, FRT medio, TTR medio, satisfacao media
- Agrega por agente, departamento, categoria
- Calcula taxa de cumprimento de SLA
- Armazena agregacoes para consulta rapida

---

## 7. Auditoria e Compliance

### US-BB-022: Registrar Auditoria de Criacao de Ticket

> Como sistema,
> Ao criar ticket, devo registrar em log de auditoria,
> Para rastreabilidade completa.

**Criterios de Aceitacao**:
- Registro imutavel em tabela de auditoria
- Campos: usuario, timestamp, IP, acao (CREATE)
- Entidade afetada (id do ticket)
- Estado completo do ticket criado (JSON)
- Sessao de usuario rastreada

---

### US-BB-023: Registrar Auditoria de Alteracoes

> Como sistema,
> Ao alterar ticket, devo registrar antes/depois,
> Para rastreamento de mudancas.

**Criterios de Aceitacao**:
- Acao: UPDATE
- Estado anterior do ticket (JSON)
- Estado novo do ticket (JSON)
- Campos alterados identificados
- Motivo da alteracao (se fornecido)

---

### US-BB-024: Registrar Auditoria de Acoes Criticas

> Como sistema,
> Devo registrar acoes sensiveis em auditoria,
> Para compliance e seguranca.

**Criterios de Aceitacao**:
- Acoes auditadas: transferir ticket, escalar, deletar, visualizar dados sensiveis
- Registro de acesso a informacoes confidenciais
- IP e user agent do usuario
- Sessao de autenticacao rastreada
- Log append-only (nunca deletar)

---

## 8. Integracao de Dados

### US-BB-025: Sincronizar Dados entre Sistemas

> Como sistema,
> Devo manter dados consistentes entre modulos,
> Para garantir integridade.

**Criterios de Aceitacao**:
- Sincronizacao de cliente/contato entre sistemas
- Sincronizacao de status e dados de ticket
- Uso de eventos para propagacao de mudancas
- Retry automatico em caso de falha de sincronizacao

---

### US-BB-026: Converter Chat em Ticket

> Como sistema,
> Ao finalizar chat, devo permitir conversao em ticket,
> Para continuidade de atendimento.

**Criterios de Aceitacao**:
- Opcao de "Criar Ticket" ao finalizar chat
- Ticket criado com historico completo do chat
- Anexos do chat transferidos para ticket
- Cliente e contato vinculados automaticamente
- Referencia cruzada entre chat e ticket

---

### US-BB-027: Consolidar Informacoes de Cliente

> Como sistema,
> Devo consolidar dados de cliente de multiplas fontes,
> Para visao unificada.

**Criterios de Aceitacao**:
- Historico de tickets do cliente
- Historico de chats do cliente
- Dados de satisfacao consolidados
- Volume de interacoes por periodo
- Dados disponiveis para agente durante atendimento

---

**Total**: 27 historias de usuario para o backbone
