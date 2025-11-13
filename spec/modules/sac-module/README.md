# SAC Module - Sistema de Atendimento ao Cliente

## Visao de Negocio

O SAC Module e um sistema completo de atendimento ao cliente que permite empresas gerenciarem relacionamento com clientes atraves de multiplos canais de comunicacao, garantindo qualidade de servico, rastreamento de solicitacoes e analise de performance.

Inspirado em plataformas lideres de mercado como Zendesk, Freshdesk e ServiceNow, o SAC Module implementa conceitos universais de atendimento ao cliente adaptados para diferentes necessidades de negocio.

---

## Tres Modulos de Negocio

O SAC Module e organizado em tres modulos independentes, cada um atendendo uma necessidade de negocio especifica:

### 1. helpdesk - Gestao de Solicitacoes (Ticketing)

**Necessidade de Negocio**: Rastrear, organizar e resolver solicitacoes de clientes de forma estruturada, com controle de prazos e qualidade.

**Para quem**: Equipes de suporte interno (agentes, analistas, especialistas)

**Valor de Negocio**:
- Centralizacao de todas as solicitacoes em um unico lugar
- Controle de prazos (SLA) para garantir tempo de resposta
- Historico completo de interacoes com cada cliente
- Distribuicao inteligente de trabalho entre agentes
- Priorizacao baseada em urgencia e impacto
- Visibilidade completa do status de cada solicitacao
- Medicao de qualidade atraves de satisfacao do cliente

**Conceito Central**: **Ticket (Chamado)** - registro formal de uma solicitacao que passa por um ciclo de vida completo (abertura -> atendimento -> resolucao -> fechamento).

**Exemplos de Uso**:
- Empresa de software gerenciando bugs reportados por clientes
- Departamento de TI atendendo solicitacoes internas
- SAC de e-commerce resolvendo problemas de pedidos
- Suporte tecnico de produto com SLA contratual

---

### 2. atendimento - Relacionamento em Tempo Real (Live Chat)

**Necessidade de Negocio**: Oferecer atendimento imediato e humanizado aos clientes atraves de conversas em tempo real.

**Para quem**: Clientes e potenciais clientes que buscam suporte rapido

**Valor de Negocio**:
- Reducao de tempo de espera (atendimento imediato)
- Aumento de satisfacao atraves de interacao humana
- Oportunidade de vendas durante o atendimento
- Menor custo por atendimento vs telefone
- Capacidade de atender multiplos clientes simultaneamente
- Captura de informacoes qualitativas sobre duvidas comuns
- Conversao de visitantes em clientes

**Conceito Central**: **Conversa (Atendimento)** - dialogo em tempo real entre cliente e agente, com inicio, desenvolvimento e finalizacao.

**Exemplos de Uso**:
- E-commerce oferecendo ajuda durante processo de compra
- SaaS esclarecendo duvidas de novos usuarios
- Banco respondendo questoes sobre produtos financeiros
- Suporte tecnico para troubleshooting rapido

---

### 3. gestao-sac - Inteligencia de Operacao (Analytics)

**Necessidade de Negocio**: Monitorar performance, identificar gargalos e tomar decisoes baseadas em dados para melhorar qualidade de atendimento.

**Para quem**: Gestores, supervisores, diretores de operacao

**Valor de Negocio**:
- Visibilidade em tempo real de metricas operacionais
- Identificacao de problemas antes que escalem
- Avaliacao objetiva de performance de equipes
- Justificativa de investimentos em atendimento com dados
- Previsao de demanda e planejamento de capacidade
- Identificacao de oportunidades de melhoria
- Benchmarking de qualidade de servico

**Conceito Central**: **Indicadores (KPIs)** - metricas que revelam saude e eficiencia da operacao de atendimento.

**Metricas Principais**:
- **Operacionais**: Volume de tickets, tempo de resolucao, taxa de reabertura
- **SLA**: Cumprimento de prazos, breaches, alertas
- **Qualidade**: Satisfacao do cliente (CSAT), NPS, qualidade de resposta
- **Produtividade**: Tickets por agente, tempo medio de atendimento
- **Tendencias**: Crescimento de demanda, sazonalidade, forecasting

**Exemplos de Uso**:
- Gerente de SAC monitorando cumprimento de SLA
- Diretor avaliando ROI de investimento em equipe
- Supervisor identificando agentes que precisam treinamento
- Analista de qualidade investigando causas de insatisfacao

---

## Conceitos de Negocio Fundamentais

Este modulo implementa conceitos universais de atendimento ao cliente. Ver [SPEC-sac-concepts.md](./SPEC-sac-concepts.md) para requisitos formais completos (194 requisitos seguindo padrao OSD).

### Entidades de Negocio

- **Ticket (Chamado)**: Solicitacao formal com ciclo de vida rastreado
- **Cliente**: Empresa ou organizacao que contrata o servico
- **Contato**: Pessoa fisica (usuario final) que abre tickets
- **Agente**: Profissional responsavel por resolver solicitacoes
- **Departamento/Grupo**: Equipe especializada em determinado tipo de atendimento
- **Categoria**: Classificacao hierarquica de tipos de solicitacao
- **SLA (Service Level Agreement)**: Acordo de nivel de servico com prazos definidos
- **Tag**: Rotulo flexivel para classificacao e busca

### Processos de Negocio

- **Ciclo de Vida do Ticket**: Aberto -> Em Atendimento -> Aguardando Cliente -> Resolvido -> Fechado
- **Atribuicao**: Designacao de tickets para agentes (manual, round-robin, por habilidade)
- **Escalacao**: Movimentacao de tickets para niveis superiores quando nao resolvidos
- **Automacao**: Execucao automatica de acoes baseada em regras de negocio
- **SLA**: Calculo e monitoramento de prazos com alertas de breach
- **Satisfacao**: Coleta de feedback pos-atendimento

### Canais de Atendimento

- **Portal Web**: Cliente acessa sistema para abrir e acompanhar tickets
- **Email**: Tickets criados e atualizados via email
- **Chat**: Conversa em tempo real (modulo atendimento)
- **API**: Integracao com sistemas externos
- **Telefone**: Registro manual de chamadas telefonicas

---

## Restricoes de Negocio

Este modulo deve respeitar restricoes criticas documentadas em [CONSTRAINTS.md](./CONSTRAINTS.md):

- Base de dados NAO esta sob nosso controle (imutavel)
- Acesso a dados exclusivamente via integracao com Backbone
- Modulos devem ser independentes (podem ser ativados separadamente)
- Multi-tenancy (isolamento de dados entre clientes)

---

## Base de Dados (Fonte da Verdade)

A base de dados existente possui 38 tabelas organizadas funcionalmente. Ver arquivos SQL em `database-schema/` para detalhes completos.

**Principais Grupos de Tabelas**:
- **Gestao de Clientes**: TBcliente, TBcontato
- **Tickets**: TBchamado, TBchamado_historico, TBchamado_anexo, TBchamado_satisfacao
- **Agentes**: TBatendente, TBdepartamento, TBatendente_departamento
- **Live Chat**: TBatendimento, TBatendimento_mensagem
- **SLA**: TBsla_configuracao, TBferiado
- **Automacao**: TBautomacao_regra
- **Notificacoes**: TBnotificacao, TBtemplate_email
- **Organizacao**: TBcategoria, TBstatus_chamado, TBtag, TBentidade_tag

---

## Estrutura de Especificacoes

```
spec/modules/sac-module/
|-- README.md              # Este arquivo (visao de negocio)
|-- SPEC-sac-concepts.md   # Requisitos formais compartilhados (194 requisitos OSD)
|-- CONSTRAINTS.md         # Restricoes tecnicas criticas
|-- PLAN_SAC.md            # Plano de criacao de user stories (completado)
|-- PLAN_SAC_SPEC.md       # Plano de criacao de especificacoes tecnicas (em andamento)
|-- database-schema/       # 39 arquivos SQL (read-only)
|
|-- helpdesk/              # USER-STORIES.md (28 stories) + SPEC-sac-helpdesk.md (233 requisitos)
|-- atendimento/           # USER-STORIES.md (24 stories) + SPEC-sac-atendimento.md (244 requisitos)
|-- gestao-sac/            # USER-STORIES.md (21 stories) + SPEC-sac-gestao.md (235 requisitos)
+-- backbone/              # USER-STORIES.md (27 stories) + SPEC-sac-backbone.md (215 requisitos)
```

---

## Indice de Especificacoes

### Especificacoes Tecnicas (SPEC)

O SAC Module possui 5 especificacoes tecnicas formais seguindo padrao OSD (Operational System Design):

#### 1. SPEC-sac-concepts.md (194 requisitos)
**Escopo**: Conceitos de negocio compartilhados entre todos os modulos

**Secoes**:
- Entidades de Negocio (48 req) - Ticket, Cliente, Contato, Agente, Departamento
- Ciclo de Vida (8 req) - Estados e transicoes
- Atribuicao (8 req) - Designacao de tickets
- Escalacao (5 req) - Movimentacao hierarquica
- SLA (14 req) - Acordos de nivel de servico
- Comunicacao (7 req) - Canais e mensagens
- Automacao (20 req) - Regras e triggers
- Canais (21 req) - Portal, email, chat, API
- Metricas (26 req) - KPIs e indicadores
- Satisfacao (9 req) - CSAT e NPS
- Base de Conhecimento (8 req) - Artigos e respostas
- Auditoria (8 req) - Logs e rastreamento
- Papeis (5 req) - Perfis de usuario
- Principios (7 req) - Diretrizes arquiteturais

#### 2. SPEC-sac-helpdesk.md (233 requisitos)
**Escopo**: Modulo de gestao de tickets para agentes internos

**Secoes**:
- Gestao de Tickets (40 req) - CRUD, visualizacao, filtros
- Comunicacao (30 req) - Comentarios, anexos, historico
- Atribuicao (31 req) - Manual, automatica, grupos
- Organizacao (25 req) - Categorias, tags, prioridades
- Busca e Filtragem (22 req) - Pesquisa avancada
- SLA (18 req) - Monitoramento e alertas
- Satisfacao (14 req) - Pesquisas pos-atendimento
- Integracao Backbone (8 req) - Workflows n8n
- Componentes React (9 req) - UI components
- Queries JQEL (6 req) - Acesso a dados
- Rotas (5 req) - URLs e navegacao
- RBAC (8 req) - Controle de acesso
- Eventos SSE (7 req) - Atualizacoes real-time
- Performance (8 req) - Otimizacoes

#### 3. SPEC-sac-atendimento.md (244 requisitos)
**Escopo**: Modulo de chat em tempo real para clientes

**Secoes**:
- Iniciacao de Chat (21 req) - Widget, formulario pre-chat
- Mensagens (27 req) - Envio, recepcao, digitacao
- Recursos de Comunicacao (19 req) - Emojis, anexos, formatacao
- Gestao de Conversas (19 req) - Historico, busca
- Gestao de Atendimentos (44 req) - Fila, distribuicao, transferencia
- Contexto (20 req) - Informacoes do cliente
- Avaliacao (15 req) - Rating pos-atendimento
- Protocolo SSE (14 req) - Eventos real-time
- Componentes React (9 req) - UI chat
- Queries JQEL (6 req) - Dados de atendimento
- Rotas (6 req) - URLs
- RBAC (8 req) - Permissoes
- Performance (9 req) - Otimizacoes
- Integracao Backbone (7 req) - n8n workflows

#### 4. SPEC-sac-gestao.md (235 requisitos)
**Escopo**: Modulo de analytics e dashboards para gestores

**Secoes**:
- Dashboards (22 req) - Visao geral de metricas
- Metricas SLA (21 req) - Cumprimento de prazos
- Performance (20 req) - Produtividade de agentes
- Volume (21 req) - Tickets por periodo
- Satisfacao (20 req) - CSAT e NPS
- Relatorios (24 req) - Exportacao e agendamento
- Tendencias (18 req) - Previsoes e sazonalidade
- Componentes de Visualizacao (9 req) - Graficos Recharts
- Componentes React (10 req) - UI dashboards
- Queries JQEL (8 req) - Agregacoes
- Rotas (5 req) - URLs
- RBAC (7 req) - Permissoes
- Performance (10 req) - Cache e otimizacoes
- Integracao Backbone (7 req) - Metricas pre-calculadas

#### 5. SPEC-sac-backbone.md (215 requisitos)
**Escopo**: Workflows automatizados via n8n

**Secoes**:
- Gestao de SLA (31 req) - Calculo automatico de prazos
- Regras de Automacao (27 req) - Triggers e acoes
- Atribuicao Automatica (19 req) - Round-robin, load balancing
- Notificacoes (27 req) - Email e eventos SSE
- Templates (15 req) - Templates dinamicos
- Coleta de Metricas (21 req) - Agregacoes para dashboards
- Auditoria (15 req) - Logs de alteracoes
- Integracao de Dados (19 req) - Sincronizacao externa
- Estrutura de Workflows (8 req) - Padroes n8n
- Triggers e Eventos (7 req) - Disparos automaticos
- Nodes Principais (6 req) - HTTP, MySQL, Redis
- Tratamento de Erros (7 req) - Retry e fallback
- Performance (8 req) - Limites e otimizacoes
- Configuracao (5 req) - Variaveis de ambiente

**Total Geral**: 1.121 requisitos formais

---

## Referencias

- [SPEC-sac-concepts.md](./SPEC-sac-concepts.md) - Requisitos formais de conceitos de negocio (194 requisitos)
- [SPEC-sac-helpdesk.md](./SPEC-sac-helpdesk.md) - Requisitos formais do modulo helpdesk (233 requisitos)
- [SPEC-sac-atendimento.md](./SPEC-sac-atendimento.md) - Requisitos formais do modulo atendimento (244 requisitos)
- [SPEC-sac-gestao.md](./SPEC-sac-gestao.md) - Requisitos formais do modulo gestao-sac (235 requisitos)
- [SPEC-sac-backbone.md](./SPEC-sac-backbone.md) - Requisitos formais do backbone (workflows n8n) (215 requisitos)
- [CONSTRAINTS.md](./CONSTRAINTS.md) - Restricoes tecnicas obrigatorias
- [PLAN_SAC_STORY.md](./PLAN_SAC_STORY.md) - Plano de criacao de user stories (completado - 100 stories)
- [PLAN_SAC_SPEC.md](./PLAN_SAC_SPEC.md) - Plano de criacao de especificacoes tecnicas (completo - 1.121 requisitos)
- `database-schema/` - Arquivos SQL (fonte da verdade do schema)
