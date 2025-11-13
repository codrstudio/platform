# SPEC-sac-concepts.md

## Especificacao: Conceitos de Negocio do SAC Module

### Escopo

Este documento define os **requisitos conceituais compartilhados** entre os tres modulos do SAC (helpdesk, atendimento, gestao-sac), estabelecendo conceitos de negocio universais do dominio de atendimento ao cliente inspirados em sistemas como Zendesk, Freshdesk, ServiceNow, TOPdesk e Jira Service Management.

**Publico**: Desenvolvedores, arquitetos, analistas de negocio, gestores de produto.

**Referencias**:
- `spec/modules/sac-module/CONCEPTS.md` - Documento original de conceitos
- `spec/modules/sac-module/CONSTRAINTS.md` - Restricoes e limitacoes
- `spec/modules/sac-module/database-schema/` - Schema SQL (imutavel)

---

## 1. Entidades de Negocio

### Definicao

Entidades sao os objetos fundamentais do dominio de atendimento ao cliente que representam pessoas, organizacoes, solicitacoes e estruturas organizacionais.

### Requisitos

#### 1.1. Ticket (Chamado)

**SPEC-sac-C-ENT-001:** Ticket DEVE ser a unidade fundamental de trabalho no atendimento ao cliente, representando qualquer tipo de interacao que requer resposta ou acao da equipe de suporte.

**SPEC-sac-C-ENT-002:** Todo ticket DEVE ter identificador unico visivel ao cliente (protocolo, numero ou codigo).

**SPEC-sac-C-ENT-003:** Ticket DEVE possuir ciclo de vida com estados (aberto, em andamento, resolvido, fechado).

**SPEC-sac-C-ENT-004:** Ticket DEVE conter descricao do problema ou solicitacao.

**SPEC-sac-C-ENT-005:** Ticket DEVE registrar historico completo de todas interacoes.

**SPEC-sac-C-ENT-006:** Ticket DEVE permitir arquivos anexados.

**SPEC-sac-C-ENT-007:** Ticket DEVE ser classificado por tipo, categoria e prioridade.

**SPEC-sac-C-ENT-008:** Ticket DEVE registrar timestamps de criacao, primeira resposta, resolucao e fechamento.

**SPEC-sac-C-ENT-009:** Sistema DEVE suportar os seguintes tipos de ticket:
- **Incidente**: Problema tecnico que afeta operacao
- **Requisicao de Servico**: Solicitacao de algo (acesso, informacao, mudanca)
- **Problema**: Causa raiz de multiplos incidentes
- **Consulta**: Pergunta ou duvida
- **Reclamacao**: Insatisfacao com produto/servico

**SPEC-sac-C-ENT-010:** Sistema DEVE suportar as seguintes prioridades:
- **Baixa**: Pode esperar, sem impacto operacional
- **Normal**: Atendimento regular
- **Alta**: Impacto significativo, requer atencao prioritaria
- **Urgente/Critica**: Impacto severo, requer atencao imediata

#### 1.2. Cliente (Customer/Organization)

**SPEC-sac-C-ENT-011:** Cliente DEVE representar entidade juridica ou organizacional que recebe atendimento.

**SPEC-sac-C-ENT-012:** Cliente PODE ter estrutura hierarquica (matriz → filiais, departamento → subdepartamentos).

**SPEC-sac-C-ENT-013:** Cliente DEVE possuir multiplos contatos (pessoas).

**SPEC-sac-C-ENT-014:** Cliente PODE ter contratos de SLA especificos.

**SPEC-sac-C-ENT-015:** Cliente PODE ter configuracoes personalizadas (categorias customizadas, campos adicionais).

**SPEC-sac-C-ENT-016:** Tickets DEVEM pertencer ao cliente, nao ao contato individual.

#### 1.3. Contato (End User/Requester)

**SPEC-sac-C-ENT-017:** Contato DEVE representar pessoa fisica que interage com o sistema.

**SPEC-sac-C-ENT-018:** Contato DEVE pertencer a um cliente (organizacao).

**SPEC-sac-C-ENT-019:** Contato DEVE poder abrir tickets.

**SPEC-sac-C-ENT-020:** Contato DEVE receber notificacoes sobre seus tickets.

**SPEC-sac-C-ENT-021:** Contato DEVE possuir dados de contato (email, telefone).

**SPEC-sac-C-ENT-022:** Contato PODE ter ou nao acesso ao portal de autoatendimento.

#### 1.4. Agente (Agent/Technician/Atendente)

**SPEC-sac-C-ENT-023:** Agente DEVE representar profissional da equipe interna responsavel por resolver tickets.

**SPEC-sac-C-ENT-024:** Agente DEVE pertencer a um ou mais grupos/departamentos.

**SPEC-sac-C-ENT-025:** Agente PODE possuir especialidades ou competencias especificas.

**SPEC-sac-C-ENT-026:** Agente PODE ser atribuido a tickets.

**SPEC-sac-C-ENT-027:** Agente DEVE ter carga de trabalho rastreavel (numero de tickets ativos).

**SPEC-sac-C-ENT-028:** Agente DEVE possuir metricas de desempenho calculadas.

#### 1.5. Grupo/Departamento (Team/Department)

**SPEC-sac-C-ENT-029:** Grupo DEVE representar area da equipe interna responsavel por tipos especificos de atendimento.

**SPEC-sac-C-ENT-030:** Grupo DEVE conter agentes.

**SPEC-sac-C-ENT-031:** Grupo PODE ter hierarquia (equipe → subequipes).

**SPEC-sac-C-ENT-032:** Tickets DEVEM poder ser atribuidos a grupos antes de agentes.

**SPEC-sac-C-ENT-033:** Grupo DEVE possuir filas de trabalho.

**SPEC-sac-C-ENT-034:** Grupo PODE ter horarios de funcionamento especificos.

**SPEC-sac-C-ENT-035:** Sistema DEVE suportar grupos tipicos como: Suporte Tecnico (TI), Suporte Comercial/Vendas, Financeiro, RH, Facilities (infraestrutura fisica).

#### 1.6. Categoria (Category/Type)

**SPEC-sac-C-ENT-036:** Categoria DEVE representar classificacao tematica do ticket.

**SPEC-sac-C-ENT-037:** Categoria PODE ser hierarquica (categoria → subcategoria → sub-subcategoria).

**SPEC-sac-C-ENT-038:** Categoria DEVE ser usada para roteamento automatico de tickets.

**SPEC-sac-C-ENT-039:** Categoria DEVE definir SLA padrao aplicavel.

**SPEC-sac-C-ENT-040:** Categoria DEVE permitir analise de tendencias e volume.

**SPEC-sac-C-ENT-041:** Sistema DEVE suportar categorias hierarquicas como:
- Hardware → Impressora → Impressao lenta
- Software → Email → Nao recebe emails
- Acesso → VPN → Conexao instavel
- Requisicao → Compra → Material de escritorio

#### 1.7. Tag (Label)

**SPEC-sac-C-ENT-042:** Tag DEVE representar marcador livre para classificacao adicional.

**SPEC-sac-C-ENT-043:** Tag NAO DEVE ser hierarquica.

**SPEC-sac-C-ENT-044:** Ticket DEVE suportar multiplas tags simultaneamente.

**SPEC-sac-C-ENT-045:** Tag DEVE permitir criacao dinamica por usuarios autorizados.

**SPEC-sac-C-ENT-046:** Tag DEVE ser usada para filtros e buscas.

**SPEC-sac-C-ENT-047:** Tag PODE ter cores semanticas associadas.

**SPEC-sac-C-ENT-048:** Sistema DEVE suportar tags comuns como: vip, urgente, bug, feature-request, windows, mac, mobile.

---

## 2. Ciclo de Vida e Workflow

### Definicao

Ciclo de vida define a sequencia de estados pelos quais um ticket passa desde criacao ate fechamento, representando o fluxo operacional do atendimento.

### Requisitos

#### 2.1. Estados do Ticket

**SPEC-sac-C-CIC-001:** Todo ticket DEVE possuir um estado que representa sua situacao atual no ciclo de vida.

**SPEC-sac-C-CIC-002:** Sistema DEVE suportar os seguintes estados tipicos:
1. **Novo/Aberto**: Criado, aguardando triagem
2. **Em Andamento**: Agente trabalhando ativamente
3. **Aguardando Cliente**: Esperando resposta/informacao do solicitante
4. **Aguardando Terceiros**: Esperando fornecedor externo ou outra area
5. **Resolvido**: Solucao implementada, aguardando confirmacao
6. **Fechado**: Confirmado como resolvido, arquivado
7. **Cancelado**: Cancelado sem resolucao

**SPEC-sac-C-CIC-003:** Estados DEVEM refletir claramente quem esta com a responsabilidade de acao (agente, cliente ou terceiro).

**SPEC-sac-C-CIC-004:** Transicoes entre estados DEVEM ser registradas em historico com timestamp e usuario responsavel.

**SPEC-sac-C-CIC-005:** Estados PODEM ter configuracoes especificas de comportamento (pausar SLA, permitir edicao, etc.).

#### 2.2. Workflow e Transicoes

**SPEC-sac-C-CIC-006:** Sistema DEVE suportar configuracao de workflows customizados por categoria ou cliente.

**SPEC-sac-C-CIC-007:** Workflow PODE restringir transicoes permitidas entre estados (ex: "Resolvido" so pode ir para "Fechado" ou "Em Andamento").

**SPEC-sac-C-CIC-008:** Sistema DEVE validar transicoes de estado conforme regras de workflow configuradas.

---

## 3. Atribuicao e Roteamento

### Definicao

Atribuicao e o processo de designar um ticket a um agente ou grupo responsavel pela sua resolucao.

### Requisitos

**SPEC-sac-C-ATR-001:** Sistema DEVE suportar atribuicao manual de tickets por supervisores.

**SPEC-sac-C-ATR-002:** Sistema DEVE suportar atribuicao automatica baseada em regras.

**SPEC-sac-C-ATR-003:** Sistema DEVE suportar auto-atribuicao onde agente "pega" ticket da fila.

**SPEC-sac-C-ATR-004:** Sistema DEVE suportar atribuicao a grupo sem agente especifico.

**SPEC-sac-C-ATR-005:** Atribuicao automatica DEVE suportar estrategia round-robin (distribuicao circular entre agentes).

**SPEC-sac-C-ATR-006:** Atribuicao automatica DEVE suportar balanceamento por carga de trabalho atual.

**SPEC-sac-C-ATR-007:** Atribuicao automatica DEVE suportar matching por especialidade ou competencia.

**SPEC-sac-C-ATR-008:** Sistema DEVE registrar historico completo de atribuicoes (quem atribuiu, quando, para quem).

---

## 4. Escalacao

### Definicao

Escalacao e a transferencia de ticket para nivel superior ou especialista quando o agente atual nao consegue resolver.

### Requisitos

**SPEC-sac-C-ESC-001:** Sistema DEVE suportar escalacao hierarquica (Atendente → Supervisor → Gerente).

**SPEC-sac-C-ESC-002:** Sistema DEVE suportar escalacao funcional (Grupo A → Grupo B especialista).

**SPEC-sac-C-ESC-003:** Sistema DEVE suportar escalacao automatica temporal (apos X tempo sem resolucao).

**SPEC-sac-C-ESC-004:** Escalacao DEVE registrar motivo e responsavel pela acao.

**SPEC-sac-C-ESC-005:** Escalacao DEVE preservar historico completo do ticket.

---

## 5. SLA (Service Level Agreement)

### Definicao

SLA e o compromisso contratual de prazos para resposta e resolucao de tickets.

### Requisitos

#### 5.1. Metricas de SLA

**SPEC-sac-C-SLA-001:** Sistema DEVE suportar metrica "Tempo de Primeira Resposta" (prazo para primeiro contato com cliente).

**SPEC-sac-C-SLA-002:** Sistema DEVE suportar metrica "Tempo de Resolucao" (prazo para resolver completamente o ticket).

**SPEC-sac-C-SLA-003:** Sistema PODE suportar metrica "Tempo de Resposta" (prazo para responder cada interacao do cliente).

**SPEC-sac-C-SLA-004:** SLA DEVE considerar apenas horario comercial configurado, excluindo fins de semana e feriados, a menos que configurado como 24/7.

**SPEC-sac-C-SLA-005:** SLA DEVE ser pausado quando ticket estiver em estado "Aguardando Cliente" ou "Aguardando Terceiros".

#### 5.2. Configuracao de SLA

**SPEC-sac-C-SLA-006:** SLA DEVE ser configuravel por prioridade do ticket.

**SPEC-sac-C-SLA-007:** SLA DEVE ser configuravel por categoria do ticket.

**SPEC-sac-C-SLA-008:** SLA DEVE ser configuravel por cliente especifico (contratos premium).

**SPEC-sac-C-SLA-009:** SLA DEVE ter hierarquia de aplicacao: Cliente > Categoria > Prioridade > Padrao Geral.

#### 5.3. Estados de SLA

**SPEC-sac-C-SLA-010:** Sistema DEVE classificar ticket como "Em Conformidade" quando dentro do prazo.

**SPEC-sac-C-SLA-011:** Sistema DEVE classificar ticket como "Proximo ao Vencimento" quando X% do prazo foi consumido (configuravel, ex: 80%).

**SPEC-sac-C-SLA-012:** Sistema DEVE classificar ticket como "Violado" quando prazo venceu.

**SPEC-sac-C-SLA-013:** Sistema DEVE emitir alertas automaticos quando SLA proximo ao vencimento.

**SPEC-sac-C-SLA-014:** Sistema DEVE registrar todas violacoes de SLA para auditoria e metricas.

---

## 6. Comunicacao e Interacoes

### Definicao

Interacoes sao comunicacoes registradas no contexto do ticket entre equipe e cliente.

### Requisitos

**SPEC-sac-C-COM-001:** Sistema DEVE suportar interacoes publicas (visiveis para cliente e equipe).

**SPEC-sac-C-COM-002:** Sistema DEVE suportar interacoes privadas/internas (apenas equipe ve).

**SPEC-sac-C-COM-003:** Sistema DEVE registrar interacoes automaticas do sistema (mudanca de status, atribuicao).

**SPEC-sac-C-COM-004:** Toda interacao DEVE ter timestamp e autor identificado.

**SPEC-sac-C-COM-005:** Interacoes DEVEM ser exibidas em ordem cronologica no historico do ticket.

**SPEC-sac-C-COM-006:** Sistema DEVE suportar anexos (imagens, documentos) em interacoes.

**SPEC-sac-C-COM-007:** Sistema DEVE suportar formatacao rica de texto (negrito, italico, listas, links).

---

## 7. Automacao

### Definicao

Automacao sao regras de negocio que executam acoes automaticamente baseadas em eventos e condicoes.

### Requisitos

#### 7.1. Estrutura de Automacao

**SPEC-sac-C-AUT-001:** Automacao DEVE seguir estrutura: Gatilho (When) + Condicao (If) + Acao (Then).

**SPEC-sac-C-AUT-002:** Gatilho DEVE definir evento que dispara execucao da regra.

**SPEC-sac-C-AUT-003:** Condicao DEVE ser opcional e permitir refinamento de quando executar.

**SPEC-sac-C-AUT-004:** Acao DEVE definir o que sera executado quando regra ativa.

#### 7.2. Gatilhos Suportados

**SPEC-sac-C-AUT-005:** Sistema DEVE suportar gatilho "Ticket criado".

**SPEC-sac-C-AUT-006:** Sistema DEVE suportar gatilho "Ticket atualizado".

**SPEC-sac-C-AUT-007:** Sistema DEVE suportar gatilho "Status alterado".

**SPEC-sac-C-AUT-008:** Sistema DEVE suportar gatilho "Comentario adicionado".

**SPEC-sac-C-AUT-009:** Sistema DEVE suportar gatilho "SLA proximo de vencer".

**SPEC-sac-C-AUT-010:** Sistema DEVE suportar gatilho temporal "X horas/dias sem atualizacao".

#### 7.3. Acoes Suportadas

**SPEC-sac-C-AUT-011:** Sistema DEVE suportar acao "Atribuir a agente/grupo".

**SPEC-sac-C-AUT-012:** Sistema DEVE suportar acao "Mudar prioridade".

**SPEC-sac-C-AUT-013:** Sistema DEVE suportar acao "Mudar status".

**SPEC-sac-C-AUT-014:** Sistema DEVE suportar acao "Enviar email/notificacao".

**SPEC-sac-C-AUT-015:** Sistema DEVE suportar acao "Adicionar tag".

**SPEC-sac-C-AUT-016:** Sistema DEVE suportar acao "Escalar ticket".

**SPEC-sac-C-AUT-017:** Sistema PODE suportar acao "Executar webhook" para integracoes externas.

#### 7.4. Gestao de Automacoes

**SPEC-sac-C-AUT-018:** Automacoes DEVEM poder ser ativadas/desativadas sem deletar configuracao.

**SPEC-sac-C-AUT-019:** Sistema DEVE registrar execucoes de automacoes para auditoria.

**SPEC-sac-C-AUT-020:** Sistema DEVE prevenir loops infinitos de automacoes.

---

## 8. Canais de Atendimento

### Definicao

Canais sao os meios pelos quais clientes iniciam e acompanham tickets.

### Requisitos

**SPEC-sac-C-CAN-001:** Sistema DEVE suportar canal "Portal Web" (self-service).

**SPEC-sac-C-CAN-002:** Sistema DEVE suportar canal "Email" com parsing automatico.

**SPEC-sac-C-CAN-003:** Sistema DEVE suportar canal "Chat" (live support).

**SPEC-sac-C-CAN-004:** Sistema DEVE suportar canal "Telefone" com registro manual pelo agente.

**SPEC-sac-C-CAN-005:** Sistema DEVE suportar canal "API" para integracoes.

**SPEC-sac-C-CAN-006:** Sistema PODE suportar canal "WhatsApp" ou "Redes Sociais".

**SPEC-sac-C-CAN-007:** Ticket DEVE registrar canal de origem.

**SPEC-sac-C-CAN-008:** Sistema DEVE manter consistencia de historico independente do canal usado.

#### 8.1. Portal Web

**SPEC-sac-C-CAN-009:** Portal Web DEVE permitir cliente abrir novo ticket.

**SPEC-sac-C-CAN-010:** Portal Web DEVE permitir cliente ver lista de tickets proprios.

**SPEC-sac-C-CAN-011:** Portal Web DEVE permitir cliente ver detalhes e historico completo.

**SPEC-sac-C-CAN-012:** Portal Web DEVE permitir cliente adicionar comentarios.

**SPEC-sac-C-CAN-013:** Portal Web DEVE permitir cliente fazer upload de anexos.

**SPEC-sac-C-CAN-014:** Portal Web DEVE permitir busca na base de conhecimento.

#### 8.2. Email

**SPEC-sac-C-CAN-015:** Sistema DEVE criar ticket automaticamente ao receber email em endereco de suporte configurado.

**SPEC-sac-C-CAN-016:** Sistema DEVE responder com numero/protocolo do ticket criado.

**SPEC-sac-C-CAN-017:** Sistema DEVE adicionar respostas ao email como comentarios no ticket.

**SPEC-sac-C-CAN-018:** Sistema DEVE preservar anexos do email no ticket.

#### 8.3. Chat (Live Support)

**SPEC-sac-C-CAN-019:** Chat DEVE permitir conversa instantanea entre cliente e agente.

**SPEC-sac-C-CAN-020:** Chat DEVE permitir conversao em ticket ao final da conversa.

**SPEC-sac-C-CAN-021:** Chat DEVE anexar historico completo da conversa ao ticket gerado.

---

## 9. Metricas e KPIs

### Definicao

Metricas sao indicadores quantitativos de desempenho operacional, qualidade e produtividade do atendimento.

### Requisitos

#### 9.1. Metricas de Volume

**SPEC-sac-C-MET-001:** Sistema DEVE calcular "Total de tickets abertos".

**SPEC-sac-C-MET-002:** Sistema DEVE calcular "Total de tickets fechados".

**SPEC-sac-C-MET-003:** Sistema DEVE calcular "Total de tickets em andamento".

**SPEC-sac-C-MET-004:** Sistema DEVE calcular "Tickets novos" (criados em periodo especifico).

**SPEC-sac-C-MET-005:** Sistema DEVE calcular "Backlog" (tickets ainda abertos).

**SPEC-sac-C-MET-006:** Sistema DEVE calcular "Taxa de criacao" (tickets/dia ou tickets/mes).

#### 9.2. Metricas de Tempo

**SPEC-sac-C-MET-007:** Sistema DEVE calcular "Tempo medio de primeira resposta".

**SPEC-sac-C-MET-008:** Sistema DEVE calcular "Tempo medio de resolucao".

**SPEC-sac-C-MET-009:** Sistema DEVE calcular "Tempo medio por status".

**SPEC-sac-C-MET-010:** Sistema DEVE calcular "Tempo de espera em fila" (antes de atribuicao).

#### 9.3. Metricas de SLA

**SPEC-sac-C-MET-011:** Sistema DEVE calcular "Taxa de cumprimento de SLA" (%).

**SPEC-sac-C-MET-012:** Sistema DEVE calcular "Numero de violacoes de SLA".

**SPEC-sac-C-MET-013:** Sistema DEVE calcular "Tickets proximos de vencer SLA".

#### 9.4. Metricas de Qualidade

**SPEC-sac-C-MET-014:** Sistema DEVE calcular "Avaliacao media" (CSAT - Customer Satisfaction Score).

**SPEC-sac-C-MET-015:** Sistema PODE calcular "NPS" (Net Promoter Score).

**SPEC-sac-C-MET-016:** Sistema DEVE calcular "Taxa de resolucao no primeiro contato" (FCR - First Contact Resolution).

**SPEC-sac-C-MET-017:** Sistema DEVE calcular "Taxa de reativacao" (tickets reabertos).

**SPEC-sac-C-MET-018:** Sistema DEVE calcular "Taxa de escalacao".

#### 9.5. Metricas de Produtividade

**SPEC-sac-C-MET-019:** Sistema DEVE calcular "Tickets resolvidos por agente" (por dia/semana/mes).

**SPEC-sac-C-MET-020:** Sistema DEVE calcular "Tickets ativos por agente" (carga de trabalho).

**SPEC-sac-C-MET-021:** Sistema DEVE calcular "Tempo medio de resolucao por agente".

**SPEC-sac-C-MET-022:** Sistema DEVE calcular "Taxa de SLA cumprido por agente".

**SPEC-sac-C-MET-023:** Sistema DEVE calcular metricas por grupo/departamento.

#### 9.6. Analise Temporal

**SPEC-sac-C-MET-024:** Sistema DEVE identificar "Pico de demanda" (hora do dia, dia da semana).

**SPEC-sac-C-MET-025:** Sistema DEVE identificar "Tendencias mensais/anuais".

**SPEC-sac-C-MET-026:** Sistema DEVE identificar "Sazonalidade".

---

## 10. Satisfacao do Cliente

### Definicao

Satisfacao e a avaliacao do atendimento pelo cliente, medindo qualidade percebida do servico.

### Requisitos

**SPEC-sac-C-SAT-001:** Sistema DEVE permitir cliente avaliar atendimento recebido.

**SPEC-sac-C-SAT-002:** Sistema DEVE suportar escala numerica de avaliacao (ex: 1-5 estrelas, 1-10).

**SPEC-sac-C-SAT-003:** Sistema PODE suportar avaliacao binaria (Bom/Ruim, Satisfeito/Insatisfeito).

**SPEC-sac-C-SAT-004:** Sistema PODE suportar NPS (Net Promoter Score) com pergunta "Recomendaria de 0-10?".

**SPEC-sac-C-SAT-005:** Sistema DEVE permitir cliente adicionar comentario qualitativo opcional.

**SPEC-sac-C-SAT-006:** Avaliacao DEVE ser solicitada ao resolver ticket.

**SPEC-sac-C-SAT-007:** Avaliacao PODE ser enviada via email automatico apos fechamento.

**SPEC-sac-C-SAT-008:** Sistema DEVE calcular CSAT medio por agente, grupo, periodo e geral.

**SPEC-sac-C-SAT-009:** Sistema DEVE permitir analise de feedback qualitativo (comentarios).

---

## 11. Base de Conhecimento

### Definicao

Base de conhecimento e repositorio de artigos de ajuda e solucoes conhecidas para autoatendimento.

### Requisitos

**SPEC-sac-C-KB-001:** Sistema DEVE suportar criacao de artigos de ajuda.

**SPEC-sac-C-KB-002:** Artigos DEVEM ser organizados por categorias.

**SPEC-sac-C-KB-003:** Sistema DEVE permitir busca de artigos por palavras-chave.

**SPEC-sac-C-KB-004:** Artigos PODEM ser publicos (acessiveis a clientes) ou privados (apenas equipe).

**SPEC-sac-C-KB-005:** Sistema PODE sugerir artigos relevantes durante abertura de ticket.

**SPEC-sac-C-KB-006:** Sistema DEVE rastrear metricas de utilidade ("isso ajudou?", visualizacoes).

**SPEC-sac-C-KB-007:** Artigos DEVEM suportar formatacao rica (texto, imagens, videos, links).

**SPEC-sac-C-KB-008:** Sistema DEVE permitir versionamento de artigos.

---

## 12. Auditoria e Rastreabilidade

### Definicao

Auditoria e o registro completo e imutavel de todas acoes realizadas no sistema para compliance e rastreamento.

### Requisitos

**SPEC-sac-C-AUD-001:** Sistema DEVE registrar todas criações de tickets em log de auditoria.

**SPEC-sac-C-AUD-002:** Sistema DEVE registrar todas alteracoes de tickets (estado anterior e novo).

**SPEC-sac-C-AUD-003:** Sistema DEVE registrar todas atribuicoes e transferencias.

**SPEC-sac-C-AUD-004:** Sistema DEVE registrar todas escalacoes.

**SPEC-sac-C-AUD-005:** Log de auditoria DEVE incluir: usuario, timestamp, IP, acao, entidade afetada.

**SPEC-sac-C-AUD-006:** Log de auditoria DEVE ser imutavel (append-only, nunca deletar).

**SPEC-sac-C-AUD-007:** Sistema DEVE registrar acoes sensiveis (visualizacao de dados confidenciais, delecoes).

**SPEC-sac-C-AUD-008:** Sistema DEVE permitir consulta de logs de auditoria por gestores e auditores.

---

## 13. Papeis e Responsabilidades

### Definicao

Papeis definem grupos de usuarios com responsabilidades e permissoes especificas no sistema.

### Requisitos

**SPEC-sac-C-ROL-001:** Sistema DEVE suportar papel "Solicitante/End User" com permissoes para:
- Abrir tickets
- Ver tickets proprios
- Adicionar comentarios em tickets proprios
- Avaliar atendimento

**SPEC-sac-C-ROL-002:** Sistema DEVE suportar papel "Agente/Technician" com permissoes para:
- Atender tickets de sua fila/grupo
- Responder clientes
- Atualizar status e prioridade
- Documentar solucoes
- Escalar quando necessario

**SPEC-sac-C-ROL-003:** Sistema DEVE suportar papel "Supervisor/Team Lead" com permissoes para:
- Gerenciar fila do grupo
- Atribuir tickets manualmente
- Monitorar SLA e metricas da equipe
- Tratar escalacoes

**SPEC-sac-C-ROL-004:** Sistema DEVE suportar papel "Administrador/Admin" com permissoes para:
- Configurar sistema completo
- Gerenciar usuarios e permissoes
- Criar relatorios
- Manter base de conhecimento
- Configurar integracoes

**SPEC-sac-C-ROL-005:** Sistema DEVE suportar papel "Gestor/Manager" com permissoes para:
- Analisar metricas estrategicas
- Visualizar relatorios executivos
- Configurar politicas de SLA
- Acessar dashboards de performance

---

## 14. Principios de Negocio

### Definicao

Principios sao diretrizes fundamentais que guiam o comportamento do sistema.

### Requisitos

**SPEC-sac-C-PRI-001:** Sistema DEVE garantir **Rastreabilidade**: Todo ticket deve ter historico completo e auditavel de todas interacoes e mudancas.

**SPEC-sac-C-PRI-002:** Sistema DEVE garantir **Responsabilizacao**: Todo ticket deve ter um responsavel claro (agente ou grupo) identificado.

**SPEC-sac-C-PRI-003:** Sistema DEVE garantir **Transparencia**: Cliente deve poder acompanhar status e historico de seus tickets.

**SPEC-sac-C-PRI-004:** Sistema DEVE garantir **Cumprimento de SLA**: Compromissos de prazo devem ser rastreados e reportados.

**SPEC-sac-C-PRI-005:** Sistema DEVE garantir **Coleta de Satisfacao**: Cliente deve poder avaliar qualidade do atendimento.

**SPEC-sac-C-PRI-006:** Sistema DEVE garantir **Eficiencia via Automacao**: Automacoes devem reduzir trabalho manual repetitivo.

**SPEC-sac-C-PRI-007:** Sistema DEVE garantir **Autoatendimento**: Clientes devem ter acesso a base de conhecimento para resolver problemas simples sem abrir ticket.

---

## 15. Glossario de Negocios

### Definicoes

**Ticket**: Registro de solicitacao de atendimento.

**Protocolo**: Identificador unico do ticket visivel ao cliente.

**SLA**: Acordo de tempo de resposta/resolucao (Service Level Agreement).

**FCR**: Resolucao no primeiro contato (First Contact Resolution).

**Backlog**: Acumulo de tickets nao resolvidos.

**Escalacao**: Transferencia para nivel superior ou especialista.

**Atribuicao**: Designacao de responsavel pelo ticket.

**Fila**: Lista de tickets aguardando atendimento.

**CSAT**: Indice de satisfacao do cliente (Customer Satisfaction).

**NPS**: Metrica de lealdade do cliente (Net Promoter Score).

**Workflow**: Fluxo de estados do ticket.

**Triagem**: Processo inicial de classificacao e roteamento.

**Base de Conhecimento**: Repositorio de artigos de ajuda.

**Self-Service**: Autoatendimento onde cliente resolve sem agente.

**Automacao**: Regra de negocio que executa acoes automaticamente.

**Round-robin**: Distribuicao circular entre agentes.

**Carga de trabalho**: Numero de tickets ativos por agente.

**Reativacao**: Ticket reaberto apos fechamento.

---

## 16. Referenciais de Mercado

### Inspiracoes

Este documento de conceitos e inspirado nas praticas de mercado de:

- **Zendesk**: Lider em helpdesk cloud, foco em simplicidade
- **Freshdesk**: Interface moderna, automacoes poderosas
- **ServiceNow**: ITSM enterprise, ITIL compliance
- **TOPdesk**: Gestao de facilities e ativos
- **Jira Service Management**: Integracao com desenvolvimento

**IMPORTANTE**: Este documento descreve requisitos conceituais universais. A implementacao tecnica sera definida nas especificacoes de cada modulo (SPEC-sac-helpdesk.md, SPEC-sac-atendimento.md, SPEC-sac-gestao.md, SPEC-sac-backbone.md).

---

**Versao**: 1.0
**Data**: 2025-01-12
**Status**: Ativo
