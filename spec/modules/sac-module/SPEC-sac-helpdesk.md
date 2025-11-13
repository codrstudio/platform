# SPEC-sac-helpdesk.md

## Especificacao: Modulo Helpdesk

### Escopo

Este documento define os requisitos tecnicos formais do modulo **helpdesk**, que fornece interface de gestao de tickets (chamados) para agentes de suporte. O modulo implementa funcionalidades de ticketing tradicional inspiradas em sistemas como Zendesk, Freshdesk e ServiceNow.

**Publico**: Desenvolvedores frontend/backend, arquitetos, analistas de qualidade.

**Referencias**:
- `spec/modules/sac-module/SPEC-sac-concepts.md` - Conceitos compartilhados (194 requisitos)
- `spec/modules/sac-module/helpdesk/USER-STORIES.md` - 28 user stories do helpdesk
- `spec/modules/sac-module/CONSTRAINTS.md` - Restricoes e limitacoes
- `spec/SPEC-data-access.md` - JQEL (acesso a dados)
- `spec/SPEC-modules.md` - Sistema de modulos da plataforma

---

## 1. Gestao de Tickets

### Definicao

Funcionalidades principais de visualizacao, criacao e manipulacao de tickets pelos agentes de suporte.

### Requisitos

#### 1.1. Dashboard de Tickets

**SPEC-sac-HD-TIC-001:** Sistema DEVE exibir dashboard personalizado mostrando apenas tickets atribuidos ao agente autenticado.

**SPEC-sac-HD-TIC-002:** Dashboard DEVE agrupar tickets por status (Aberto, Em Atendimento, Aguardando Cliente, Resolvido).

**SPEC-sac-HD-TIC-003:** Dashboard DEVE exibir contador de tickets por status.

**SPEC-sac-HD-TIC-004:** Dashboard DEVE ordenar tickets por padrao com tickets mais proximos do breach de SLA primeiro.

**SPEC-sac-HD-TIC-005:** Dashboard DEVE exibir badge visual de SLA com cores semanticas:
- Verde: >50% do tempo restante (conformidade)
- Amarelo: 20-50% do tempo restante (proximo ao vencimento)
- Vermelho: <20% do tempo restante ou breach

**SPEC-sac-HD-TIC-006:** Query JQEL para dashboard DEVE usar schema "sac" com filtro `where: { agente_id: { $eq: <usuario_logado> } }`.

**SPEC-sac-HD-TIC-007:** Componente React DEVE ser `<TicketDashboard />` com suporte a TanStack Query para auto-refresh.

#### 1.2. Criacao de Ticket

**SPEC-sac-HD-TIC-008:** Sistema DEVE permitir agente criar ticket em nome do cliente.

**SPEC-sac-HD-TIC-009:** Formulario de criacao DEVE solicitar campos obrigatorios:
- Cliente (cliente_id)
- Contato (contato_id)
- Departamento (departamento_id)
- Categoria (categoria_id)
- Prioridade (tipo_prioridade_id)
- Titulo (titulo)
- Descricao (descricao)

**SPEC-sac-HD-TIC-010:** Formulario DEVE incluir campo "Canal de Origem" com opcoes: Portal, Email, Chat, Telefone, Interno.

**SPEC-sac-HD-TIC-011:** Sistema DEVE gerar protocolo unico automaticamente no formato configuravel (ex: YYYY-NNNNNN).

**SPEC-sac-HD-TIC-012:** Sistema DEVE validar campos obrigatorios antes de permitir submissao.

**SPEC-sac-HD-TIC-013:** Ticket criado DEVE ter status inicial "Aberto".

**SPEC-sac-HD-TIC-014:** Mutacao JQEL DEVE usar `schema: "sac", mutate: "chamado", action: "insert"`.

**SPEC-sac-HD-TIC-015:** Componente React DEVE ser `<TicketCreateForm />` usando React Hook Form + Zod para validacao.

#### 1.3. Visualizacao de Detalhes

**SPEC-sac-HD-TIC-016:** Sistema DEVE exibir tela de detalhes completos do ticket.

**SPEC-sac-HD-TIC-017:** Tela de detalhes DEVE exibir campos principais:
- Protocolo, titulo, descricao
- Status, prioridade, categoria
- Cliente, contato, departamento, agente atribuido
- Tags aplicadas

**SPEC-sac-HD-TIC-018:** Tela de detalhes DEVE exibir timestamps:
- Data/hora de criacao
- Data/hora de primeira resposta
- Data/hora de resolucao
- Data/hora de fechamento

**SPEC-sac-HD-TIC-019:** Tela de detalhes DEVE exibir informacoes de SLA:
- Prazo de primeira resposta
- Prazo de resolucao
- Tempo restante para cada SLA
- Status de cumprimento (conformidade, proximo, breach)

**SPEC-sac-HD-TIC-020:** Query JQEL DEVE usar `schema: "sac", select: "chamado", where: { chamado_id: { $eq: <id> } }` com joins para entidades relacionadas.

**SPEC-sac-HD-TIC-021:** Componente React DEVE ser `<TicketDetail />` com sub-componentes `<TicketHeader />`, `<TicketInfo />`, `<TicketTimeline />`.

#### 1.4. Atualizacao de Campos

**SPEC-sac-HD-TIC-022:** Sistema DEVE permitir edicao de campos: prioridade, categoria, status, tags.

**SPEC-sac-HD-TIC-023:** Sistema DEVE registrar todas alteracoes em tabela de historico automaticamente.

**SPEC-sac-HD-TIC-024:** Mudanca de status para "Aguardando Cliente" DEVE pausar contagem de SLA.

**SPEC-sac-HD-TIC-025:** Mudanca de status de "Aguardando Cliente" para outro DEVE retomar contagem de SLA.

**SPEC-sac-HD-TIC-026:** Sistema DEVE validar transicoes de status permitidas conforme workflow configurado.

**SPEC-sac-HD-TIC-027:** Mutacao JQEL DEVE usar `schema: "sac", mutate: "chamado", action: "update"`.

**SPEC-sac-HD-TIC-028:** Sistema DEVE disparar evento via SSE ao atualizar ticket para invalidar queries em outros dispositivos.

#### 1.5. Resolucao de Ticket

**SPEC-sac-HD-TIC-029:** Sistema DEVE fornecer acao "Resolver Ticket" que muda status para "Resolvido".

**SPEC-sac-HD-TIC-030:** Sistema DEVE registrar timestamp de resolucao ao resolver ticket.

**SPEC-sac-HD-TIC-031:** Sistema DEVE calcular tempo total de resolucao (diferenca entre criacao e resolucao).

**SPEC-sac-HD-TIC-032:** Sistema DEVE verificar se houve breach de SLA e registrar resultado.

**SPEC-sac-HD-TIC-033:** Sistema DEVE enviar notificacao automatica ao cliente com link de avaliacao via n8n workflow.

**SPEC-sac-HD-TIC-034:** Acao DEVE ser implementada como botao `<ResolveTicketButton />` com confirmacao.

#### 1.6. Reabertura de Ticket

**SPEC-sac-HD-TIC-035:** Sistema DEVE permitir reabrir tickets com status "Resolvido".

**SPEC-sac-HD-TIC-036:** Reabertura DEVE mudar status para "Em Atendimento".

**SPEC-sac-HD-TIC-037:** Sistema DEVE recalcular SLA a partir do momento da reabertura.

**SPEC-sac-HD-TIC-038:** Sistema DEVE registrar reabertura no historico do ticket.

**SPEC-sac-HD-TIC-039:** Sistema DEVE incrementar contador de reaberturas (campo `contador_reaberturas`).

**SPEC-sac-HD-TIC-040:** Acao DEVE ser implementada como botao `<ReopenTicketButton />` disponivel apenas em tickets resolvidos.

---

## 2. Comunicacao e Colaboracao

### Definicao

Funcionalidades de troca de mensagens entre agente e cliente, e colaboracao interna da equipe.

### Requisitos

#### 2.1. Resposta ao Cliente

**SPEC-sac-HD-COM-001:** Sistema DEVE permitir agente adicionar resposta publica ao ticket.

**SPEC-sac-HD-COM-002:** Editor de resposta DEVE suportar formatacao rica: negrito, italico, listas, links.

**SPEC-sac-HD-COM-003:** Resposta DEVE ser claramente marcada como "Publica" (visivel para cliente).

**SPEC-sac-HD-COM-004:** Sistema DEVE registrar timestamp da primeira resposta publica.

**SPEC-sac-HD-COM-005:** Resposta DEVE ser adicionada ao historico do ticket cronologicamente.

**SPEC-sac-HD-COM-006:** Sistema DEVE enviar notificacao ao cliente via n8n workflow ao adicionar resposta.

**SPEC-sac-HD-COM-007:** Mutacao JQEL DEVE usar `schema: "sac", mutate: "chamado_comentario", action: "insert"` com `tipo: "publico"`.

**SPEC-sac-HD-COM-008:** Componente React DEVE ser `<ReplyEditor />` usando editor de texto rico (TipTap ou similar).

#### 2.2. Comentario Interno

**SPEC-sac-HD-COM-009:** Sistema DEVE permitir agente adicionar comentario interno ao ticket.

**SPEC-sac-HD-COM-010:** Comentario interno DEVE ser marcado como "Interno" e visivel apenas para equipe.

**SPEC-sac-HD-COM-011:** Comentario interno NAO DEVE ser visivel para cliente em nenhuma circunstancia.

**SPEC-sac-HD-COM-012:** Comentario interno DEVE aparecer no historico com indicacao clara "Interno".

**SPEC-sac-HD-COM-013:** Mutacao JQEL DEVE usar `schema: "sac", mutate: "chamado_comentario", action: "insert"` com `tipo: "interno"`.

**SPEC-sac-HD-COM-014:** Componente React DEVE ser `<InternalNoteEditor />` com estilo visual diferenciado.

#### 2.3. Anexos de Arquivo

**SPEC-sac-HD-COM-015:** Sistema DEVE permitir upload de arquivos (imagens, PDFs, documentos, logs).

**SPEC-sac-HD-COM-016:** Sistema DEVE validar limite de tamanho por arquivo (configuravel, padrao: 10MB).

**SPEC-sac-HD-COM-017:** Sistema DEVE exibir preview de imagens inline no historico.

**SPEC-sac-HD-COM-018:** Anexos DEVEM poder ser marcados como publicos (cliente ve) ou internos.

**SPEC-sac-HD-COM-019:** Anexos DEVEM ser listados no historico do ticket com icone de tipo de arquivo.

**SPEC-sac-HD-COM-020:** Upload DEVE ser processado via endpoint `/api/upload` com retorno de URL permanente.

**SPEC-sac-HD-COM-021:** Mutacao JQEL DEVE usar `schema: "sac", mutate: "chamado_anexo", action: "insert"`.

**SPEC-sac-HD-COM-022:** Componente React DEVE ser `<FileUpload />` com drag-and-drop e progress bar.

#### 2.4. Timeline de Historico

**SPEC-sac-HD-COM-023:** Sistema DEVE exibir timeline cronologica de todas interacoes e alteracoes.

**SPEC-sac-HD-COM-024:** Timeline DEVE diferenciar visualmente mensagens publicas de internas.

**SPEC-sac-HD-COM-025:** Timeline DEVE exibir alteracoes de campos (status, prioridade, atribuicao) como eventos do sistema.

**SPEC-sac-HD-COM-026:** Timeline DEVE identificar autor de cada acao (nome do agente ou "Sistema").

**SPEC-sac-HD-COM-027:** Timeline DEVE exibir anexos inline quando possivel (imagens).

**SPEC-sac-HD-COM-028:** Timeline DEVE permitir ordenacao mais recente no topo OU embaixo (configuravel).

**SPEC-sac-HD-COM-029:** Query JQEL DEVE usar `schema: "sac", select: "chamado_historico"` com joins para autor e tipo de evento.

**SPEC-sac-HD-COM-030:** Componente React DEVE ser `<TicketTimeline />` com sub-componentes `<TimelineEvent />`.

---

## 3. Atribuicao e Transferencia

### Definicao

Funcionalidades de designacao de responsavel pelo ticket e movimentacao entre agentes/departamentos.

### Requisitos

#### 3.1. Auto-Atribuicao

**SPEC-sac-HD-ATR-001:** Sistema DEVE permitir agente atribuir ticket nao atribuido a si mesmo.

**SPEC-sac-HD-ATR-002:** Acao "Atribuir a Mim" DEVE estar disponivel apenas em tickets sem agente atribuido.

**SPEC-sac-HD-ATR-003:** Atribuicao DEVE fazer ticket aparecer em "Meus Tickets" do agente.

**SPEC-sac-HD-ATR-004:** Status DEVE mudar automaticamente para "Em Atendimento" ao atribuir.

**SPEC-sac-HD-ATR-005:** Atribuicao DEVE ser registrada no historico do ticket.

**SPEC-sac-HD-ATR-006:** Mutacao JQEL DEVE usar `schema: "sac", mutate: "chamado", action: "update"` atualizando `atendente_id`.

**SPEC-sac-HD-ATR-007:** Componente React DEVE ser botao `<AssignToMeButton />`.

#### 3.2. Transferencia para Agente

**SPEC-sac-HD-ATR-008:** Sistema DEVE permitir transferencia de ticket para outro agente.

**SPEC-sac-HD-ATR-009:** Dialog de transferencia DEVE exibir lista de agentes do mesmo departamento.

**SPEC-sac-HD-ATR-010:** Dialog PODE exibir agentes de outros departamentos (configuravel).

**SPEC-sac-HD-ATR-011:** Dialog DEVE incluir campo para comentario interno explicando motivo da transferencia.

**SPEC-sac-HD-ATR-012:** Novo agente DEVE receber notificacao da transferencia via n8n workflow.

**SPEC-sac-HD-ATR-013:** Transferencia DEVE ser registrada no historico do ticket.

**SPEC-sac-HD-ATR-014:** Mutacao JQEL DEVE atualizar `atendente_id` e criar entrada em historico.

**SPEC-sac-HD-ATR-015:** Componente React DEVE ser `<TransferTicketDialog />` com `<AgentSelector />`.

#### 3.3. Transferencia para Departamento

**SPEC-sac-HD-ATR-016:** Sistema DEVE permitir supervisores transferir ticket para outro departamento.

**SPEC-sac-HD-ATR-017:** Dialog DEVE exibir lista de departamentos disponiveis.

**SPEC-sac-HD-ATR-018:** Transferencia DEVE remover ticket da fila atual e adicionar a fila do novo departamento.

**SPEC-sac-HD-ATR-019:** Atribuicao de agente DEVE ser removida (ticket volta para status "Aberto" na fila).

**SPEC-sac-HD-ATR-020:** Departamento receptor DEVE receber notificacao via n8n workflow.

**SPEC-sac-HD-ATR-021:** Transferencia DEVE ser registrada no historico.

**SPEC-sac-HD-ATR-022:** Mutacao JQEL DEVE atualizar `departamento_id` e limpar `atendente_id`.

**SPEC-sac-HD-ATR-023:** Componente React DEVE ser `<TransferDepartmentDialog />` restrito a papel de supervisor.

#### 3.4. Escalacao

**SPEC-sac-HD-ATR-024:** Sistema DEVE permitir supervisores escalar ticket.

**SPEC-sac-HD-ATR-025:** Escalacao DEVE aumentar prioridade automaticamente (ex: Normal → Alta).

**SPEC-sac-HD-ATR-026:** Sistema DEVE adicionar tag "escalado" ao ticket.

**SPEC-sac-HD-ATR-027:** Especialista ou gestor configurado DEVE ser notificado via n8n workflow.

**SPEC-sac-HD-ATR-028:** Dialog DEVE incluir campo obrigatorio para motivo da escalacao.

**SPEC-sac-HD-ATR-029:** Escalacao DEVE ser registrada no historico.

**SPEC-sac-HD-ATR-030:** Mutacao JQEL DEVE atualizar prioridade, tags e criar entrada em historico.

**SPEC-sac-HD-ATR-031:** Componente React DEVE ser `<EscalateTicketDialog />` restrito a papel de supervisor.

---

## 4. Organizacao e Classificacao

### Definicao

Funcionalidades de categorizacao, tagueamento e alteracao de propriedades organizacionais do ticket.

### Requisitos

#### 4.1. Categoria

**SPEC-sac-HD-ORG-001:** Sistema DEVE permitir selecao de categoria hierarquica (ex: TI > Hardware > Impressora).

**SPEC-sac-HD-ORG-002:** Categoria DEVE poder ser alterada a qualquer momento durante ciclo de vida do ticket.

**SPEC-sac-HD-ORG-003:** Alteracao de categoria DEVE recalcular SLA se categoria tem configuracao de SLA especifica.

**SPEC-sac-HD-ORG-004:** Alteracao de categoria DEVE ser registrada no historico.

**SPEC-sac-HD-ORG-005:** Query JQEL DEVE carregar arvore de categorias com `schema: "sac", select: "categoria"`.

**SPEC-sac-HD-ORG-006:** Componente React DEVE ser `<CategorySelector />` com suporte a hierarquia (tree select).

#### 4.2. Tags

**SPEC-sac-HD-ORG-007:** Sistema DEVE permitir aplicar multiplas tags ao ticket.

**SPEC-sac-HD-ORG-008:** Tags predefinidas DEVEM estar disponiveis para selecao rapida.

**SPEC-sac-HD-ORG-009:** Sistema DEVE permitir criacao de novas tags dinamicamente.

**SPEC-sac-HD-ORG-010:** Tags DEVEM ser visiveis no card do ticket (lista e detalhe).

**SPEC-sac-HD-ORG-011:** Tags DEVEM poder ser removidas a qualquer momento.

**SPEC-sac-HD-ORG-012:** Mutacao JQEL DEVE usar `schema: "sac", mutate: "entidade_tag", action: "insert"` para adicionar tag.

**SPEC-sac-HD-ORG-013:** Componente React DEVE ser `<TagSelector />` com autocomplete e criacao inline.

#### 4.3. Prioridade

**SPEC-sac-HD-ORG-014:** Sistema DEVE suportar prioridades: Baixa, Normal, Alta, Urgente.

**SPEC-sac-HD-ORG-015:** Mudanca de prioridade DEVE recalcular prazos de SLA.

**SPEC-sac-HD-ORG-016:** Prioridade DEVE ser exibida com cor semantica:
- Baixa: Verde
- Normal: Azul
- Alta: Laranja
- Urgente: Vermelho

**SPEC-sac-HD-ORG-017:** Alteracao de prioridade DEVE ser registrada no historico.

**SPEC-sac-HD-ORG-018:** Mutacao JQEL DEVE usar `schema: "sac", mutate: "chamado", action: "update"` atualizando `tipo_prioridade_id`.

**SPEC-sac-HD-ORG-019:** Componente React DEVE ser `<PrioritySelector />` com badges coloridos.

#### 4.4. Status

**SPEC-sac-HD-ORG-020:** Sistema DEVE suportar status: Aberto, Em Atendimento, Aguardando Cliente, Resolvido, Cancelado.

**SPEC-sac-HD-ORG-021:** Sistema DEVE validar transicoes de status permitidas conforme workflow.

**SPEC-sac-HD-ORG-022:** Status "Aguardando Cliente" DEVE pausar SLA automaticamente.

**SPEC-sac-HD-ORG-023:** Mudanca de status DEVE ser registrada no historico.

**SPEC-sac-HD-ORG-024:** Mutacao JQEL DEVE usar `schema: "sac", mutate: "chamado", action: "update"` atualizando `status_chamado_id`.

**SPEC-sac-HD-ORG-025:** Componente React DEVE ser `<StatusSelector />` com validacao de transicoes permitidas.

---

## 5. Busca e Filtragem

### Definicao

Funcionalidades de localizacao e filtragem de tickets para facilitar navegacao e organizacao.

### Requisitos

#### 5.1. Busca por Protocolo

**SPEC-sac-HD-BUS-001:** Sistema DEVE permitir busca de ticket por protocolo completo.

**SPEC-sac-HD-BUS-002:** Busca DEVE suportar protocolo parcial (ex: "123" encontra "2024-000123").

**SPEC-sac-HD-BUS-003:** Resultado DEVE ser exibido instantaneamente (debounce de 300ms).

**SPEC-sac-HD-BUS-004:** Sistema DEVE exibir mensagem "Ticket nao encontrado" se protocolo nao existir.

**SPEC-sac-HD-BUS-005:** Query JQEL DEVE usar `where: { protocolo: { $like: "%<termo>%" } }`.

**SPEC-sac-HD-BUS-006:** Componente React DEVE ser `<TicketSearch />` com campo de busca e resultados instantaneos.

#### 5.2. Filtros

**SPEC-sac-HD-BUS-007:** Sistema DEVE suportar filtro por status com multipla selecao.

**SPEC-sac-HD-BUS-008:** Sistema DEVE suportar filtro por departamento.

**SPEC-sac-HD-BUS-009:** Sistema DEVE suportar filtro por agente atribuido.

**SPEC-sac-HD-BUS-010:** Sistema DEVE incluir opcao "Nao atribuido" no filtro de agente.

**SPEC-sac-HD-BUS-011:** Filtros DEVEM ser aplicados instantaneamente.

**SPEC-sac-HD-BUS-012:** Contador de tickets DEVE ser atualizado conforme filtros aplicados.

**SPEC-sac-HD-BUS-013:** Filtros DEVEM ser salvos em localStorage durante sessao.

**SPEC-sac-HD-BUS-014:** Query JQEL DEVE construir `where` dinamicamente baseado em filtros ativos.

**SPEC-sac-HD-BUS-015:** Componente React DEVE ser `<TicketFilters />` com checkboxes e selects.

#### 5.3. Views Salvas

**SPEC-sac-HD-BUS-016:** Sistema DEVE permitir salvar combinacao de filtros como "View".

**SPEC-sac-HD-BUS-017:** Agente DEVE poder dar nome personalizado a view.

**SPEC-sac-HD-BUS-018:** Views salvas DEVEM aparecer em menu lateral ou dropdown.

**SPEC-sac-HD-BUS-019:** Clicar em view DEVE aplicar filtros automaticamente.

**SPEC-sac-HD-BUS-020:** Sistema DEVE permitir editar ou excluir views salvas.

**SPEC-sac-HD-BUS-021:** Views DEVEM ser armazenadas com `schema: "frontend", storage: "localStorage"` (por usuario).

**SPEC-sac-HD-BUS-022:** Componente React DEVE ser `<SavedViews />` com menu de views e dialog de criacao/edicao.

---

## 6. SLA e Prazos

### Definicao

Funcionalidades de monitoramento e gerenciamento de Service Level Agreements (prazos contratuais).

### Requisitos

#### 6.1. Visualizacao de SLA

**SPEC-sac-HD-SLA-001:** Sistema DEVE exibir badge de SLA com cores semanticas:
- Verde: >50% do tempo restante
- Amarelo: 20-50% do tempo restante
- Vermelho: <20% do tempo restante ou breach

**SPEC-sac-HD-SLA-002:** Sistema DEVE exibir tempo restante em formato legivel (ex: "2h 15min restantes").

**SPEC-sac-HD-SLA-003:** Sistema DEVE exibir SLA de primeira resposta separado de SLA de resolucao.

**SPEC-sac-HD-SLA-004:** Sistema DEVE exibir indicacao clara quando SLA ja estourou (breach).

**SPEC-sac-HD-SLA-005:** Calculos de SLA DEVEM ser realizados no backbone (n8n) e sincronizados via eventos.

**SPEC-sac-HD-SLA-006:** Componente React DEVE ser `<SLABadge />` com tooltip mostrando detalhes.

#### 6.2. Alertas de Breach

**SPEC-sac-HD-SLA-007:** Sistema DEVE enviar notificacao quando SLA atinge 20% do tempo restante.

**SPEC-sac-HD-SLA-008:** Notificacao DEVE ser exibida in-app (sistema) via SSE.

**SPEC-sac-HD-SLA-009:** Notificacao PODE ser enviada via email (configuravel).

**SPEC-sac-HD-SLA-010:** Alerta DEVE identificar qual ticket esta proximo do breach.

**SPEC-sac-HD-SLA-011:** Notificacao DEVE incluir link direto para o ticket.

**SPEC-sac-HD-SLA-012:** Workflow n8n DEVE processar monitoramento de SLA e disparar alertas.

**SPEC-sac-HD-SLA-013:** Componente React DEVE ser `<NotificationToast />` para alertas em tempo real.

#### 6.3. Pausa de SLA

**SPEC-sac-HD-SLA-014:** Status "Aguardando Cliente" DEVE pausar contagem de SLA automaticamente.

**SPEC-sac-HD-SLA-015:** Quando cliente responde, SLA DEVE retomar de onde parou.

**SPEC-sac-HD-SLA-016:** Historico DEVE mostrar periodos de pausa claramente.

**SPEC-sac-HD-SLA-017:** Tempo pausado NAO DEVE contar para calculo de breach.

**SPEC-sac-HD-SLA-018:** Logica de pausa DEVE ser implementada no backbone (n8n workflow).

---

## 7. Satisfacao do Cliente

### Definicao

Funcionalidades de coleta e visualizacao de feedback dos clientes sobre qualidade do atendimento.

### Requisitos

#### 7.1. Solicitacao de Avaliacao

**SPEC-sac-HD-SAT-001:** Sistema DEVE enviar email automatico quando ticket marcado como "Resolvido".

**SPEC-sac-HD-SAT-002:** Email DEVE conter link de avaliacao unico e anonimo (nao requer login).

**SPEC-sac-HD-SAT-003:** Formulario de avaliacao DEVE usar escala de 1 a 5 (Ruim a Excelente).

**SPEC-sac-HD-SAT-004:** Formulario DEVE incluir campo opcional para comentario qualitativo.

**SPEC-sac-HD-SAT-005:** Link de avaliacao DEVE expirar apos 30 dias.

**SPEC-sac-HD-SAT-006:** Envio de email DEVE ser processado via n8n workflow.

**SPEC-sac-HD-SAT-007:** Mutacao JQEL DEVE usar `schema: "sac", mutate: "chamado_satisfacao", action: "insert"` ao submeter avaliacao.

#### 7.2. Visualizacao de Avaliacoes

**SPEC-sac-HD-SAT-008:** Sistema DEVE permitir agente ver avaliacoes recebidas.

**SPEC-sac-HD-SAT-009:** Lista DEVE exibir tickets resolvidos com nota de 1 a 5.

**SPEC-sac-HD-SAT-010:** Lista DEVE exibir comentarios qualitativos do cliente.

**SPEC-sac-HD-SAT-011:** Sistema DEVE calcular media geral de satisfacao do agente.

**SPEC-sac-HD-SAT-012:** Sistema DEVE permitir filtro por periodo (semana, mes, trimestre).

**SPEC-sac-HD-SAT-013:** Query JQEL DEVE usar `schema: "sac", select: "chamado_satisfacao"` com join para chamado.

**SPEC-sac-HD-SAT-014:** Componente React DEVE ser `<AgentFeedback />` com lista de avaliacoes e estatisticas.

---

## 8. Integracao com Backbone

### Definicao

Pontos de integracao com workflows n8n (backend/backbone) para processos automatizados.

### Requisitos

**SPEC-sac-HD-INT-001:** Criacao de ticket DEVE disparar workflow n8n para calculo de SLA.

**SPEC-sac-HD-INT-002:** Criacao de ticket DEVE disparar workflow n8n para execucao de automacoes (regras).

**SPEC-sac-HD-INT-003:** Resolucao de ticket DEVE disparar workflow n8n para envio de pesquisa de satisfacao.

**SPEC-sac-HD-INT-004:** Mudanca de status DEVE disparar workflow n8n para verificacao de regras de automacao.

**SPEC-sac-HD-INT-005:** Transferencia de ticket DEVE disparar workflow n8n para notificacao de novo responsavel.

**SPEC-sac-HD-INT-006:** Escalacao DEVE disparar workflow n8n para notificacao de gestor/especialista.

**SPEC-sac-HD-INT-007:** Todos os workflows DEVEM ser invocados via eventos SSE ou webhooks HTTP.

**SPEC-sac-HD-INT-008:** Backend DEVE publicar eventos em canal Redis `sac:ticket:events` para consumo pelo n8n.

---

## 9. Componentes React

### Definicao

Especificacao dos principais componentes React que compoem a interface do modulo helpdesk.

### Requisitos

**SPEC-sac-HD-UI-001:** Modulo DEVE exportar componentes principais:
- `<TicketDashboard />` - Dashboard principal
- `<TicketList />` - Lista de tickets com paginacao
- `<TicketDetail />` - Detalhes completos do ticket
- `<TicketCreateForm />` - Formulario de criacao
- `<TicketTimeline />` - Timeline de historico

**SPEC-sac-HD-UI-002:** Modulo DEVE exportar componentes de acao:
- `<ReplyEditor />` - Editor de resposta publica
- `<InternalNoteEditor />` - Editor de nota interna
- `<FileUpload />` - Upload de anexos
- `<AssignToMeButton />` - Auto-atribuicao
- `<TransferTicketDialog />` - Transferencia para agente
- `<TransferDepartmentDialog />` - Transferencia para departamento
- `<EscalateTicketDialog />` - Escalacao

**SPEC-sac-HD-UI-003:** Modulo DEVE exportar componentes de organizacao:
- `<CategorySelector />` - Seletor de categoria hierarquica
- `<TagSelector />` - Seletor de tags com criacao
- `<PrioritySelector />` - Seletor de prioridade
- `<StatusSelector />` - Seletor de status com validacao

**SPEC-sac-HD-UI-004:** Modulo DEVE exportar componentes de busca:
- `<TicketSearch />` - Busca por protocolo
- `<TicketFilters />` - Filtros multiplos
- `<SavedViews />` - Views salvas

**SPEC-sac-HD-UI-005:** Modulo DEVE exportar componentes de SLA:
- `<SLABadge />` - Badge de status de SLA
- `<SLATimer />` - Contador de tempo restante

**SPEC-sac-HD-UI-006:** Modulo DEVE exportar componentes de feedback:
- `<AgentFeedback />` - Visualizacao de avaliacoes
- `<SatisfactionForm />` - Formulario publico de avaliacao (cliente)

**SPEC-sac-HD-UI-007:** Todos os componentes DEVEM usar shadcn/ui como base de componentes UI.

**SPEC-sac-HD-UI-008:** Todos os componentes DEVEM suportar tema light/dark via ThemeProvider.

**SPEC-sac-HD-UI-009:** Todos os componentes DEVEM ser responsivos (mobile, tablet, desktop).

---

## 10. Queries JQEL

### Definicao

Especificacao das queries JQEL necessarias para acesso a dados do modulo helpdesk.

### Requisitos

**SPEC-sac-HD-JQEL-001:** Sistema DEVE usar schema "sac" para todas as queries de tickets.

**SPEC-sac-HD-JQEL-002:** Query de dashboard DEVE incluir:
```json
{
  "schema": "sac",
  "select": "chamado",
  "where": {
    "atendente_id": { "$eq": "<usuario_logado>" }
  },
  "options": {
    "orderBy": [{ "field": "sla_tempo_restante", "direction": "asc" }],
    "limit": 50
  },
  "output": ["chamado_id", "protocolo", "titulo", "status_chamado_id", "prioridade_id", "sla_tempo_restante", "sla_status"]
}
```

**SPEC-sac-HD-JQEL-003:** Query de detalhes DEVE incluir joins para entidades relacionadas:
```json
{
  "schema": "sac",
  "select": "chamado",
  "where": { "chamado_id": { "$eq": "<id>" } },
  "joins": [
    { "entity": "cliente", "on": "cliente_id" },
    { "entity": "contato", "on": "contato_id" },
    { "entity": "departamento", "on": "departamento_id" },
    { "entity": "atendente", "on": "atendente_id" },
    { "entity": "status_chamado", "on": "status_chamado_id" },
    { "entity": "tipo_prioridade", "on": "tipo_prioridade_id" },
    { "entity": "categoria", "on": "categoria_id" }
  ]
}
```

**SPEC-sac-HD-JQEL-004:** Query de historico DEVE incluir:
```json
{
  "schema": "sac",
  "select": "chamado_historico",
  "where": { "chamado_id": { "$eq": "<id>" } },
  "options": {
    "orderBy": [{ "field": "data_hora", "direction": "desc" }]
  },
  "joins": [
    { "entity": "usuario", "on": "usuario_id" }
  ]
}
```

**SPEC-sac-HD-JQEL-005:** Mutacao de criacao DEVE incluir:
```json
{
  "schema": "sac",
  "mutate": "chamado",
  "action": "insert",
  "values": {
    "cliente_id": "<id>",
    "contato_id": "<id>",
    "departamento_id": "<id>",
    "categoria_id": "<id>",
    "tipo_prioridade_id": "<id>",
    "titulo": "<texto>",
    "descricao": "<texto>",
    "canal_origem": "<Portal|Email|Chat|Telefone|Interno>",
    "status_chamado_id": 1,
    "data_criacao": "<timestamp>"
  }
}
```

**SPEC-sac-HD-JQEL-006:** Mutacao de atualizacao DEVE incluir:
```json
{
  "schema": "sac",
  "mutate": "chamado",
  "action": "update",
  "where": { "chamado_id": { "$eq": "<id>" } },
  "values": {
    "status_chamado_id": "<novo_id>",
    "tipo_prioridade_id": "<novo_id>",
    "categoria_id": "<novo_id>"
  }
}
```

---

## 11. Rotas do Modulo

### Definicao

Especificacao das rotas exportadas pelo modulo helpdesk.

### Requisitos

**SPEC-sac-HD-ROU-001:** Modulo DEVE exportar rotas principais:
- `/` - Dashboard de tickets (default)
- `/tickets` - Lista completa de tickets
- `/tickets/new` - Formulario de criacao
- `/tickets/:id` - Detalhes do ticket
- `/tickets/:id/edit` - Edicao de campos do ticket
- `/my-feedback` - Avaliacoes recebidas pelo agente

**SPEC-sac-HD-ROU-002:** Todas as rotas DEVEM ser relativas (portal prefix injetado automaticamente).

**SPEC-sac-HD-ROU-003:** Rotas DEVEM usar lazy-loading de componentes via `React.lazy()`.

**SPEC-sac-HD-ROU-004:** Rotas DEVEM validar autenticacao via `<ProtectedRoute />`.

**SPEC-sac-HD-ROU-005:** Rotas DEVEM validar permissoes via RBAC (papel de agente minimo).

---

## 12. Permissoes e RBAC

### Definicao

Especificacao de controle de acesso baseado em papeis para o modulo helpdesk.

### Requisitos

**SPEC-sac-HD-RBAC-001:** Acesso ao modulo DEVE requerer papel minimo: "Agente".

**SPEC-sac-HD-RBAC-002:** Acoes de transferencia para departamento DEVEM requerer papel: "Supervisor".

**SPEC-sac-HD-RBAC-003:** Acoes de escalacao DEVEM requerer papel: "Supervisor".

**SPEC-sac-HD-RBAC-004:** Agentes DEVEM ver apenas tickets:
- Atribuidos a eles
- Nao atribuidos de seus departamentos
- Publicos conforme politica de visibilidade

**SPEC-sac-HD-RBAC-005:** Supervisores DEVEM ver todos os tickets de seus departamentos.

**SPEC-sac-HD-RBAC-006:** Administradores DEVEM ver todos os tickets do sistema.

**SPEC-sac-HD-RBAC-007:** Validacao de permissoes DEVE ocorrer tanto no frontend (UX) quanto no backend (seguranca).

**SPEC-sac-HD-RBAC-008:** Backend DEVE implementar RLS (Row-Level Security) via JQEL para garantir isolamento.

---

## 13. Eventos e Notificacoes

### Definicao

Especificacao de eventos em tempo real via SSE e notificacoes.

### Requisitos

**SPEC-sac-HD-EVT-001:** Sistema DEVE emitir evento SSE ao criar ticket:
```json
{
  "type": "ticket-created",
  "target": "department:<dept_id>",
  "data": { "ticket_id": "<id>", "protocol": "<protocolo>" }
}
```

**SPEC-sac-HD-EVT-002:** Sistema DEVE emitir evento SSE ao atualizar ticket:
```json
{
  "type": "ticket-updated",
  "target": "ticket:<id>",
  "data": { "ticket_id": "<id>", "field": "<campo>", "value": "<novo_valor>" }
}
```

**SPEC-sac-HD-EVT-003:** Sistema DEVE emitir evento SSE ao adicionar resposta:
```json
{
  "type": "ticket-replied",
  "target": "ticket:<id>",
  "data": { "ticket_id": "<id>", "author": "<nome>", "public": true }
}
```

**SPEC-sac-HD-EVT-004:** Sistema DEVE emitir evento SSE de alerta de SLA:
```json
{
  "type": "sla-warning",
  "target": "user:<agent_id>",
  "data": { "ticket_id": "<id>", "protocol": "<protocolo>", "time_remaining": "<minutos>" }
}
```

**SPEC-sac-HD-EVT-005:** Frontend DEVE escutar eventos via EventSource em `/api/events/stream`.

**SPEC-sac-HD-EVT-006:** Frontend DEVE invalidar queries TanStack Query relevantes ao receber eventos.

**SPEC-sac-HD-EVT-007:** Frontend DEVE exibir toast notifications para eventos importantes (transferencia, escalacao, SLA).

---

## 14. Performance e Otimizacao

### Definicao

Requisitos de performance e otimizacao para garantir experiencia fluida.

### Requisitos

**SPEC-sac-HD-PERF-001:** Dashboard DEVE carregar em menos de 1 segundo (rede 3G).

**SPEC-sac-HD-PERF-002:** Lista de tickets DEVE usar paginacao com limite de 50 registros por pagina.

**SPEC-sac-HD-PERF-003:** Lista de tickets DEVE implementar virtualizacao para listas longas (>100 itens).

**SPEC-sac-HD-PERF-004:** Busca DEVE usar debounce de 300ms para evitar queries excessivas.

**SPEC-sac-HD-PERF-005:** Imagens anexadas DEVEM ser lazy-loaded e otimizadas.

**SPEC-sac-HD-PERF-006:** Componentes DEVEM usar React.memo para evitar re-renders desnecessarios.

**SPEC-sac-HD-PERF-007:** Queries JQEL DEVEM usar projection (`output`) para reduzir payload.

**SPEC-sac-HD-PERF-008:** Modulo DEVE ser code-split em chunks separados via Vite.

---

**Versao**: 1.0
**Data**: 2025-01-12
**Status**: Ativo
**Total de Requisitos**: 233
