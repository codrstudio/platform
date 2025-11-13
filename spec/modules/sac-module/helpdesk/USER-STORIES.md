# Helpdesk Module - User Stories

Historias de usuario para o modulo helpdesk (interface de agentes de suporte para gestao de tickets).

---

## 1. Gestao de Chamados (Tickets)

### US-HD-001: Visualizar Dashboard de Tickets

> Como analista de suporte,
> Quero ver dashboard com meus tickets,
> Para ter visao geral do meu trabalho e priorizar urgencias.

**Criterios de Aceitacao**:
- Dashboard mostra apenas tickets atribuidos ao agente logado
- Tickets agrupados por status (Aberto, Em Atendimento, Aguardando Cliente, Resolvido)
- Contador de tickets por status visivel
- Ordenacao padrao: tickets mais proximos do breach de SLA primeiro
- Badge visual de SLA (verde: ok, amarelo: proximo, vermelho: breach)

---

### US-HD-002: Criar Ticket em Nome do Cliente

> Como analista de suporte,
> Quero criar ticket registrando ligacao ou email recebido,
> Para centralizar todas as solicitacoes no sistema.

**Criterios de Aceitacao**:
- Formulario solicita: cliente, contato, departamento, categoria, prioridade, titulo, descricao
- Sistema gera protocolo unico automaticamente
- Campo de canal de origem (Portal, Email, Chat, Telefone, Interno)
- Validacao: campos obrigatorios nao podem ficar vazios
- Apos criar, ticket aparece com status "Aberto"

---

### US-HD-003: Ver Detalhes Completos do Ticket

> Como analista de suporte,
> Quero ver todas as informacoes do ticket em uma tela,
> Para entender contexto completo antes de responder.

**Criterios de Aceitacao**:
- Exibe: protocolo, titulo, descricao, status, prioridade, categoria
- Exibe: cliente, contato, departamento, agente atribuido
- Exibe: datas (criacao, primeira resposta, resolucao, fechamento)
- Exibe: SLA (prazo primeira resposta, prazo resolucao, tempo restante)
- Exibe: tags aplicadas

---

### US-HD-004: Atualizar Campos do Ticket

> Como analista de suporte,
> Quero alterar prioridade, categoria ou status do ticket,
> Para manter informacoes atualizadas conforme situacao evolui.

**Criterios de Aceitacao**:
- Campos editaveis: prioridade, categoria, status, tags
- Alteracoes registradas no historico automaticamente
- Mudanca de status pode pausar/retomar SLA (ex: "Aguardando Cliente" pausa)
- Sistema valida transicoes de status permitidas

---

### US-HD-005: Resolver Ticket

> Como analista de suporte,
> Quero marcar ticket como resolvido,
> Para finalizar atendimento e solicitar feedback do cliente.

**Criterios de Aceitacao**:
- Botao "Resolver" muda status para "Resolvido"
- Sistema registra timestamp de resolucao
- Sistema calcula tempo total de resolucao
- Sistema verifica se houve breach de SLA
- Cliente recebe notificacao automatica com link de avaliacao

---

### US-HD-006: Reabrir Ticket Resolvido

> Como analista de suporte,
> Quero reabrir ticket que cliente disse nao estar resolvido,
> Para continuar atendimento sem perder historico.

**Criterios de Aceitacao**:
- Botao "Reabrir" disponivel em tickets resolvidos
- Status volta para "Em Atendimento"
- SLA recalculado a partir da reabertura
- Reabertura registrada no historico
- Contador de reaberturas incrementado

---

## 2. Comunicacao e Colaboracao

### US-HD-007: Responder ao Cliente

> Como analista de suporte,
> Quero adicionar resposta publica ao ticket,
> Para comunicar solucao ao cliente.

**Criterios de Aceitacao**:
- Editor de texto com formatacao basica (negrito, italico, listas, links)
- Opcao de resposta publica (cliente ve) claramente marcada
- Sistema registra timestamp da primeira resposta
- Resposta adicionada ao historico do ticket
- Cliente recebe notificacao da resposta

---

### US-HD-008: Adicionar Comentario Interno

> Como analista de suporte,
> Quero adicionar nota interna no ticket,
> Para compartilhar informacao com equipe sem cliente ver.

**Criterios de Aceitacao**:
- Campo de comentario marcado como "Interno"
- Comentario visivel apenas para equipe (nao para cliente)
- Util para documentar troubleshooting ou combinar acoes
- Comentario aparece no historico com indicacao "Interno"

---

### US-HD-009: Anexar Arquivo ao Ticket

> Como analista de suporte,
> Quero anexar prints, logs ou documentos ao ticket,
> Para documentar problema ou compartilhar solucao.

**Criterios de Aceitacao**:
- Upload de arquivos (imagens, PDFs, documentos, logs)
- Limite de tamanho por arquivo (ex: 10MB)
- Preview de imagens inline
- Anexos marcados como publicos (cliente ve) ou internos
- Anexos listados no historico do ticket

---

### US-HD-010: Ver Historico Completo de Interacoes

> Como analista de suporte,
> Quero ver timeline de todas as mensagens e alteracoes,
> Para entender evolucao completa do ticket.

**Criterios de Aceitacao**:
- Timeline cronologica (mais recente no topo ou embaixo)
- Diferencia mensagens publicas de internas
- Mostra alteracoes de campos (status, prioridade, atribuicao)
- Identifica autor de cada acao (agente ou sistema)
- Anexos exibidos inline quando possivel

---

## 3. Atribuicao e Transferencia

### US-HD-011: Atribuir Ticket a Mim Mesmo

> Como analista de suporte,
> Quero assumir ticket da fila,
> Para comecar a trabalhar nele.

**Criterios de Aceitacao**:
- Botao "Atribuir a Mim" em tickets nao atribuidos
- Ticket passa a aparecer em "Meus Tickets"
- Status muda para "Em Atendimento" automaticamente
- Atribuicao registrada no historico

---

### US-HD-012: Transferir Ticket para Outro Agente

> Como analista de suporte,
> Quero transferir ticket para colega especializado,
> Para garantir que problema seja resolvido por quem tem conhecimento.

**Criterios de Aceitacao**:
- Botao "Transferir" abre dialogo de selecao de agente
- Lista mostra agentes do mesmo departamento ou de outros
- Campo para adicionar comentario interno explicando motivo
- Novo agente recebe notificacao da transferencia
- Transferencia registrada no historico

---

### US-HD-013: Transferir Ticket para Outro Departamento

> Como supervisor de suporte,
> Quero transferir ticket para departamento correto,
> Para garantir que ticket seja tratado pela equipe certa.

**Criterios de Aceitacao**:
- Botao "Transferir para Departamento" abre lista de departamentos
- Ticket removido da fila atual e adicionado a fila do novo departamento
- Atribuicao atual removida (ticket volta para fila)
- Departamento receptor recebe notificacao
- Transferencia registrada no historico

---

### US-HD-014: Escalar Ticket

> Como supervisor de suporte,
> Quero escalar ticket para nivel superior,
> Para resolver problema que minha equipe nao conseguiu.

**Criterios de Aceitacao**:
- Botao "Escalar" disponivel para supervisores
- Prioridade aumentada automaticamente
- Tag "escalado" adicionada
- Especialista ou gestor notificado
- Campo para adicionar motivo da escalacao
- Escalacao registrada no historico

---

## 4. Organizacao e Classificacao

### US-HD-015: Aplicar Categoria ao Ticket

> Como analista de suporte,
> Quero classificar ticket em categoria,
> Para organizar por tipo de problema e facilitar busca futura.

**Criterios de Aceitacao**:
- Selecao de categoria hierarquica (ex: TI > Hardware > Impressora)
- Categoria pode ser alterada a qualquer momento
- Categoria influencia SLA (categorias podem ter SLAs diferentes)
- Alteracao de categoria registrada no historico

---

### US-HD-016: Adicionar Tags ao Ticket

> Como analista de suporte,
> Quero adicionar tags descritivas ao ticket,
> Para classificar de forma flexivel e facilitar busca.

**Criterios de Aceitacao**:
- Tags predefinidas disponiveis (ex: "urgente", "bug", "cliente-vip")
- Possibilidade de criar novas tags
- Multiplas tags podem ser aplicadas
- Tags visiveis no card do ticket (lista e detalhe)
- Tags podem ser removidas

---

### US-HD-017: Alterar Prioridade do Ticket

> Como supervisor de suporte,
> Quero mudar prioridade do ticket,
> Para refletir urgencia real apos avaliar situacao.

**Criterios de Aceitacao**:
- Prioridades disponiveis: Baixa, Normal, Alta, Urgente
- Mudanca de prioridade recalcula SLA
- Prioridade visivel com cor semantica (vermelho=urgente, verde=baixa)
- Alteracao registrada no historico

---

### US-HD-018: Mudar Status do Ticket

> Como analista de suporte,
> Quero mudar status do ticket conforme atendimento evolui,
> Para refletir situacao atual.

**Criterios de Aceitacao**:
- Status disponiveis: Aberto, Em Atendimento, Aguardando Cliente, Resolvido, Cancelado
- Validacao de transicoes permitidas (ex: nao pode ir de Aberto direto para Resolvido)
- Status "Aguardando Cliente" pausa SLA
- Mudanca de status registrada no historico

---

## 5. Busca e Filtragem

### US-HD-019: Buscar Ticket por Protocolo

> Como analista de suporte,
> Quero buscar ticket digitando numero do protocolo,
> Para encontrar rapidamente quando cliente liga informando numero.

**Criterios de Aceitacao**:
- Campo de busca aceita protocolo completo (ex: 2024-000123)
- Busca parcial funciona (ex: "123" encontra 2024-000123)
- Resultado exibido instantaneamente
- Se nao encontrado, mensagem clara "Ticket nao encontrado"

---

### US-HD-020: Filtrar Tickets por Status

> Como analista de suporte,
> Quero filtrar tickets por status,
> Para focar apenas em tickets abertos ou aguardando cliente.

**Criterios de Aceitacao**:
- Filtro de status com multipla selecao
- Filtros aplicados instantaneamente
- Contador de tickets atualizado com filtro
- Filtros ficam salvos durante sessao

---

### US-HD-021: Filtrar Tickets por Departamento

> Como supervisor de suporte,
> Quero ver tickets de um departamento especifico,
> Para monitorar fila de cada equipe.

**Criterios de Aceitacao**:
- Lista de departamentos disponiveis
- Filtro por um ou multiplos departamentos
- Util para supervisores que gerenciam multiplas equipes

---

### US-HD-022: Filtrar Tickets por Agente

> Como supervisor de suporte,
> Quero ver tickets atribuidos a agente especifico,
> Para acompanhar trabalho individual.

**Criterios de Aceitacao**:
- Lista de agentes do(s) departamento(s) visiveis
- Filtro por agente individual
- Opcao "Nao atribuido" mostra tickets na fila

---

### US-HD-023: Criar View Salva

> Como analista de suporte,
> Quero salvar combinacao de filtros que uso frequentemente,
> Para nao precisar refazer filtros toda vez.

**Criterios de Aceitacao**:
- Botao "Salvar View" apos aplicar filtros
- Nome personalizado para view
- Views salvas aparecem em menu lateral
- Clicar em view aplica filtros automaticamente
- Possibilidade de editar ou excluir views

---

## 6. SLA e Prazos

### US-HD-024: Ver Tempo Restante de SLA

> Como analista de suporte,
> Quero ver quanto tempo resta ate breach de SLA,
> Para priorizar tickets mais urgentes.

**Criterios de Aceitacao**:
- Badge de SLA com cores (verde: >50% tempo, amarelo: 20-50%, vermelho: <20% ou breach)
- Tempo restante exibido (ex: "2h 15min restantes")
- SLA de primeira resposta e SLA de resolucao visiveis
- Indicacao clara quando SLA ja estourou

---

### US-HD-025: Receber Alerta de Breach Proximo

> Como analista de suporte,
> Quero ser notificado quando SLA esta proximo de estourar,
> Para agir antes do breach.

**Criterios de Aceitacao**:
- Notificacao quando SLA atinge 20% do tempo restante
- Notificacao in-app (sistema) e/ou email
- Alerta identifica qual ticket esta proximo do breach
- Link direto para o ticket na notificacao

---

### US-HD-026: Pausar SLA ao Aguardar Cliente

> Como sistema,
> SLA deve pausar quando ticket aguarda resposta do cliente,
> Para nao penalizar agente por tempo de espera do cliente.

**Criterios de Aceitacao**:
- Status "Aguardando Cliente" pausa contagem de SLA automaticamente
- Quando cliente responde, SLA retoma de onde parou
- Historico mostra periodos de pausa
- Tempo pausado nao conta para calculo de breach

---

## 7. Satisfacao do Cliente

### US-HD-027: Solicitar Avaliacao do Cliente

> Como sistema,
> Ao resolver ticket, devo enviar pesquisa de satisfacao ao cliente,
> Para coletar feedback sobre qualidade do atendimento.

**Criterios de Aceitacao**:
- Email automatico enviado quando ticket marcado como "Resolvido"
- Link de avaliacao unico e anonimo (nao requer login)
- Escala de 1 a 5 (Ruim a Excelente)
- Campo opcional para comentario
- Expiracao do link apos 30 dias

---

### US-HD-028: Ver Avaliacoes Recebidas

> Como analista de suporte,
> Quero ver avaliacoes que recebi dos clientes,
> Para entender qualidade do meu atendimento e melhorar.

**Criterios de Aceitacao**:
- Lista de tickets resolvidos com avaliacao
- Nota de 1 a 5 visivel
- Comentarios do cliente exibidos
- Media geral de satisfacao calculada
- Filtro por periodo (semana, mes, trimestre)

---

**Total**: 28 historias de usuario para o modulo helpdesk
