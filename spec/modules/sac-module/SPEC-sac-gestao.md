# SPEC-sac-gestao.md

## Especificacao: Modulo Gestao-SAC (Analytics)

### Escopo

Este documento define os requisitos tecnicos formais do modulo **gestao-sac**, que fornece interface de analytics, dashboards e relatorios para gestores monitora rem performance, identificarem gargalos e tomarem decisoes baseadas em dados sobre a operacao de atendimento ao cliente.

**Publico**: Desenvolvedores frontend/backend, arquitetos, analistas de qualidade.

**Referencias**:
- `spec/modules/sac-module/SPEC-sac-concepts.md` - Conceitos compartilhados (194 requisitos)
- `spec/modules/sac-module/gestao-sac/USER-STORIES.md` - 21 user stories do gestao-sac
- `spec/modules/sac-module/CONSTRAINTS.md` - Restricoes e limitacoes
- `spec/SPEC-data-access.md` - JQEL (acesso a dados)

---

## 1. Dashboards Operacionais

### Definicao

Funcionalidades de visualizacao de metricas principais em tempo real para monitoramento da operacao.

### Requisitos

#### 1.1. Dashboard Geral

**SPEC-sac-GS-DSH-001:** Sistema DEVE exibir dashboard geral com metricas principais em tempo real.

**SPEC-sac-GS-DSH-002:** Dashboard DEVE incluir cards com metricas de tickets:
- Tickets abertos hoje
- Tickets resolvidos hoje
- Taxa de resolucao (resolvidos / abertos)

**SPEC-sac-GS-DSH-003:** Dashboard DEVE incluir cards com metricas de chat:
- Chats em andamento
- Tempo medio de espera
- Satisfacao media

**SPEC-sac-GS-DSH-004:** Dashboard DEVE incluir metricas de SLA:
- Tickets em breach
- Taxa de cumprimento de SLA (%)

**SPEC-sac-GS-DSH-005:** Dashboard DEVE exibir graficos visuais (barras, linhas, pizza) para principais metricas.

**SPEC-sac-GS-DSH-006:** Dashboard DEVE atualizar automaticamente a cada minuto via polling ou SSE.

**SPEC-sac-GS-DSH-007:** Query JQEL DEVE agregar dados com funcoes `COUNT`, `AVG`, `SUM`.

**SPEC-sac-GS-DSH-008:** Componente React DEVE ser `<OperationalDashboard />` com sub-componentes `<MetricCard />`, `<Chart />`.

#### 1.2. Monitoramento em Tempo Real

**SPEC-sac-GS-DSH-009:** Sistema DEVE exibir situacao atual da operacao em tempo real.

**SPEC-sac-GS-DSH-010:** Dashboard DEVE mostrar contador de tickets/chats ativos neste momento.

**SPEC-sac-GS-DSH-011:** Dashboard DEVE listar agentes online/offline.

**SPEC-sac-GS-DSH-012:** Dashboard DEVE exibir fila de espera atual:
- Tickets nao atribuidos
- Chats aguardando atendimento

**SPEC-sac-GS-DSH-013:** Sistema DEVE exibir alertas visuais quando metricas criticas ultrapassam limites:
- Fila muito grande (>10 pessoas)
- SLA em risco (>5 tickets proximos de breach)

**SPEC-sac-GS-DSH-014:** Dashboard DEVE permitir filtro por departamento.

**SPEC-sac-GS-DSH-015:** Componente React DEVE ser `<RealTimeMonitor />` com atualizacao via SSE.

#### 1.3. Alertas Criticos

**SPEC-sac-GS-DSH-016:** Sistema DEVE notificar gestor de situacoes criticas.

**SPEC-sac-GS-DSH-017:** Alerta DEVE ser enviado quando fila de espera ultrapassa limite configuravel (padrao: 10).

**SPEC-sac-GS-DSH-018:** Alerta DEVE ser enviado quando tickets proximos de breach ultrapassam limite (padrao: 5).

**SPEC-sac-GS-DSH-019:** Alerta DEVE ser enviado quando satisfacao media cai abaixo de patamar (padrao: <3.5).

**SPEC-sac-GS-DSH-020:** Notificacoes DEVEM ser enviadas in-app (SSE) e/ou email.

**SPEC-sac-GS-DSH-021:** Limites de alertas DEVEM ser configuraveir por gestor.

**SPEC-sac-GS-DSH-022:** Sistema DEVE evitar spam de alertas (cooldown de 30 minutos entre alertas do mesmo tipo).

---

## 2. Metricas de SLA

### Definicao

Funcionalidades de analise de cumprimento de Service Level Agreements.

### Requisitos

#### 2.1. Taxa de Cumprimento

**SPEC-sac-GS-SLA-001:** Sistema DEVE calcular percentual de tickets que cumpriram SLA.

**SPEC-sac-GS-SLA-002:** Taxa DEVE ser calculada separadamente para:
- SLA de primeira resposta
- SLA de resolucao

**SPEC-sac-GS-SLA-003:** Sistema DEVE exibir grafico de tendencia (semana, mes, trimestre).

**SPEC-sac-GS-SLA-004:** Sistema DEVE detalhar taxa de cumprimento por prioridade:
- Urgente
- Alta
- Normal
- Baixa

**SPEC-sac-GS-SLA-005:** Dashboard DEVE exibir meta de SLA configurada (ex: 95% de cumprimento).

**SPEC-sac-GS-SLA-006:** Sistema DEVE destacar visualmente se meta foi atingida (verde) ou nao (vermelho).

**SPEC-sac-GS-SLA-007:** Query JQEL DEVE calcular:
```sql
(COUNT(tickets com SLA cumprido) / COUNT(tickets totais)) * 100
```

**SPEC-sac-GS-SLA-008:** Componente React DEVE ser `<SLAComplianceChart />` usando Recharts.

#### 2.2. Tickets em Breach

**SPEC-sac-GS-SLA-009:** Sistema DEVE exibir lista de tickets que estouraram SLA.

**SPEC-sac-GS-SLA-010:** Lista DEVE permitir filtro por tipo de breach:
- Primeira resposta
- Resolucao

**SPEC-sac-GS-SLA-011:** Lista DEVE mostrar informacoes:
- Protocolo
- Cliente
- Agente responsavel
- Tempo de atraso

**SPEC-sac-GS-SLA-012:** Lista DEVE ser ordenada por gravidade do atraso (mais atrasado primeiro).

**SPEC-sac-GS-SLA-013:** Sistema DEVE permitir exportacao da lista para CSV ou Excel.

**SPEC-sac-GS-SLA-014:** Query JQEL DEVE filtrar `where: { sla_status: "breach" }`.

**SPEC-sac-GS-SLA-015:** Componente React DEVE ser `<BreachTicketsList />` com tabela paginada.

#### 2.3. Analise de Tendencias

**SPEC-sac-GS-SLA-016:** Sistema DEVE exibir grafico de evolucao de SLA ao longo do tempo.

**SPEC-sac-GS-SLA-017:** Grafico DEVE mostrar taxa de cumprimento por periodo (dia, semana, mes).

**SPEC-sac-GS-SLA-018:** Sistema DEVE permitir comparacao mes a mes ou semana a semana.

**SPEC-sac-GS-SLA-019:** Sistema DEVE identificar picos de breach (quando aconteceram).

**SPEC-sac-GS-SLA-020:** Sistema DEVE permitir correlacionar picos de breach com volume de tickets.

**SPEC-sac-GS-SLA-021:** Componente React DEVE ser `<SLATrendChart />` usando Recharts com linha temporal.

---

## 3. Performance de Equipe

### Definicao

Funcionalidades de analise de desempenho individual e coletivo dos agentes.

### Requisitos

#### 3.1. Metricas Individuais

**SPEC-sac-GS-PER-001:** Sistema DEVE exibir tabela com metricas de cada agente.

**SPEC-sac-GS-PER-002:** Tabela DEVE incluir colunas:
- Nome do agente
- Tickets resolvidos
- Tempo medio de resolucao
- Satisfacao media
- Taxa de reabertura

**SPEC-sac-GS-PER-003:** Tabela DEVE incluir coluna "Tickets em breach de SLA".

**SPEC-sac-GS-PER-004:** Tabela DEVE permitir ordenacao por qualquer coluna.

**SPEC-sac-GS-PER-005:** Sistema DEVE permitir filtro por departamento e periodo.

**SPEC-sac-GS-PER-006:** Query JQEL DEVE usar agregacoes `GROUP BY atendente_id`.

**SPEC-sac-GS-PER-007:** Componente React DEVE ser `<AgentPerformanceTable />` usando TanStack Table.

#### 3.2. Comparacao entre Agentes

**SPEC-sac-GS-PER-008:** Sistema DEVE exibir ranking de agentes por metrica selecionada.

**SPEC-sac-GS-PER-009:** Sistema DEVE mostrar media da equipe para comparacao.

**SPEC-sac-GS-PER-010:** Sistema DEVE exibir graficos comparativos (barras horizontais).

**SPEC-sac-GS-PER-011:** Sistema DEVE destacar top performers (top 3) e bottom performers.

**SPEC-sac-GS-PER-012:** Sistema DEVE permitir selecionar metrica de ranking:
- Tickets resolvidos
- Satisfacao media
- Tempo medio de resolucao
- Taxa de SLA cumprido

**SPEC-sac-GS-PER-013:** Componente React DEVE ser `<AgentRanking />` com grafico de barras.

#### 3.3. Metricas por Departamento

**SPEC-sac-GS-PER-014:** Sistema DEVE exibir comparacao entre departamentos.

**SPEC-sac-GS-PER-015:** Comparacao DEVE incluir metricas:
- Volume de tickets
- Tempo medio de resolucao
- Satisfacao media

**SPEC-sac-GS-PER-016:** Sistema DEVE mostrar SLA por departamento.

**SPEC-sac-GS-PER-017:** Sistema DEVE calcular capacidade vs demanda:
- Agentes disponiveis
- Volume de tickets

**SPEC-sac-GS-PER-018:** Sistema DEVE identificar departamentos com gargalos (demanda > capacidade).

**SPEC-sac-GS-PER-019:** Query JQEL DEVE usar agregacoes `GROUP BY departamento_id`.

**SPEC-sac-GS-PER-020:** Componente React DEVE ser `<DepartmentComparison />`.

---

## 4. Analise de Volume

### Definicao

Funcionalidades de analise de volume de tickets e chats ao longo do tempo.

### Requisitos

#### 4.1. Volume por Periodo

**SPEC-sac-GS-VOL-001:** Sistema DEVE exibir grafico de tickets criados por periodo.

**SPEC-sac-GS-VOL-002:** Grafico DEVE suportar visualizacao por:
- Dia
- Semana
- Mes

**SPEC-sac-GS-VOL-003:** Sistema DEVE permitir comparacao com periodo anterior.

**SPEC-sac-GS-VOL-004:** Sistema DEVE permitir filtro por departamento, categoria, prioridade.

**SPEC-sac-GS-VOL-005:** Sistema DEVE identificar sazonalidade (dias/horarios de pico).

**SPEC-sac-GS-VOL-006:** Query JQEL DEVE usar agregacao temporal `GROUP BY DATE(data_criacao)`.

**SPEC-sac-GS-VOL-007:** Componente React DEVE ser `<VolumeChart />` usando Recharts com linha ou barras.

#### 4.2. Volume por Canal

**SPEC-sac-GS-VOL-008:** Sistema DEVE exibir grafico de pizza mostrando distribuicao por canal.

**SPEC-sac-GS-VOL-009:** Grafico DEVE mostrar canais:
- Portal
- Email
- Chat
- Telefone
- Interno

**SPEC-sac-GS-VOL-010:** Sistema DEVE exibir volume absoluto e percentual.

**SPEC-sac-GS-VOL-011:** Sistema DEVE mostrar tendencia ao longo do tempo (crescimento/reducao por canal).

**SPEC-sac-GS-VOL-012:** Sistema DEVE mostrar satisfacao media por canal.

**SPEC-sac-GS-VOL-013:** Query JQEL DEVE usar `GROUP BY canal_origem`.

**SPEC-sac-GS-VOL-014:** Componente React DEVE ser `<ChannelDistribution />` com grafico de pizza.

#### 4.3. Volume por Categoria

**SPEC-sac-GS-VOL-015:** Sistema DEVE exibir ranking de categorias por volume.

**SPEC-sac-GS-VOL-016:** Ranking DEVE mostrar top 10 categorias mais frequentes.

**SPEC-sac-GS-VOL-017:** Sistema DEVE mostrar tendencia de crescimento/reducao por categoria.

**SPEC-sac-GS-VOL-018:** Sistema DEVE mostrar tempo medio de resolucao por categoria.

**SPEC-sac-GS-VOL-019:** Sistema DEVE identificar categorias problematicas (alto volume + baixa satisfacao).

**SPEC-sac-GS-VOL-020:** Query JQEL DEVE usar `GROUP BY categoria_id` com `ORDER BY COUNT(*) DESC`.

**SPEC-sac-GS-VOL-021:** Componente React DEVE ser `<CategoryVolume />` com grafico de barras.

---

## 5. Satisfacao e Qualidade

### Definicao

Funcionalidades de analise de satisfacao do cliente e qualidade do atendimento.

### Requisitos

#### 5.1. CSAT Geral

**SPEC-sac-GS-SAT-001:** Sistema DEVE calcular CSAT (Customer Satisfaction Score) medio.

**SPEC-sac-GS-SAT-002:** CSAT DEVE ser nota media de 1 a 5.

**SPEC-sac-GS-SAT-003:** Sistema DEVE exibir distribuicao de notas (quantos deram 1, 2, 3, 4, 5).

**SPEC-sac-GS-SAT-004:** Sistema DEVE exibir grafico de tendencia ao longo do tempo.

**SPEC-sac-GS-SAT-005:** Sistema DEVE permitir filtro por departamento, agente, canal, periodo.

**SPEC-sac-GS-SAT-006:** Query JQEL DEVE calcular `AVG(nota_satisfacao)`.

**SPEC-sac-GS-SAT-007:** Componente React DEVE ser `<CSATDashboard />` com gauge e distribuicao.

#### 5.2. NPS (Net Promoter Score)

**SPEC-sac-GS-SAT-008:** Sistema DEVE calcular NPS automaticamente.

**SPEC-sac-GS-SAT-009:** Sistema DEVE classificar avaliacoes:
- Detratores: notas 1-3
- Neutros: nota 4
- Promotores: nota 5

**SPEC-sac-GS-SAT-010:** NPS DEVE ser calculado como: `(% Promotores) - (% Detratores)`.

**SPEC-sac-GS-SAT-011:** Sistema DEVE exibir tendencia de NPS ao longo do tempo.

**SPEC-sac-GS-SAT-012:** Query JQEL DEVE contar registros por faixa de nota.

**SPEC-sac-GS-SAT-013:** Componente React DEVE ser `<NPSChart />`.

#### 5.3. Feedback Qualitativo

**SPEC-sac-GS-SAT-014:** Sistema DEVE exibir lista de comentarios dos clientes.

**SPEC-sac-GS-SAT-015:** Sistema DEVE permitir filtro por nota (ex: ver apenas comentarios de avaliacao 1 ou 2).

**SPEC-sac-GS-SAT-016:** Sistema DEVE permitir busca por palavra-chave nos comentarios.

**SPEC-sac-GS-SAT-017:** Sistema DEVE contar palavras/termos mais mencionados (nuvem de palavras).

**SPEC-sac-GS-SAT-018:** Sistema DEVE fornecer link para ticket/chat original.

**SPEC-sac-GS-SAT-019:** Query JQEL DEVE usar `where: { comentario_satisfacao: { $ne: null } }`.

**SPEC-sac-GS-SAT-020:** Componente React DEVE ser `<FeedbackComments />` com lista paginada e busca.

---

## 6. Relatorios e Exportacao

### Definicao

Funcionalidades de geracao de relatorios personalizados e exportacao de dados.

### Requisitos

#### 6.1. Relatorio Personalizado

**SPEC-sac-GS-REL-001:** Sistema DEVE permitir construcao de relatorio com metricas especificas.

**SPEC-sac-GS-REL-002:** Construtor DEVE permitir selecao de metricas desejadas:
- Volume
- SLA
- Satisfacao
- Performance de agentes
- Tempo de resolucao

**SPEC-sac-GS-REL-003:** Sistema DEVE permitir configuracao de filtros:
- Periodo (data inicio/fim)
- Departamento
- Agente
- Categoria

**SPEC-sac-GS-REL-004:** Sistema DEVE exibir preview do relatorio antes de gerar.

**SPEC-sac-GS-REL-005:** Sistema DEVE permitir selecao de formato de saida:
- PDF
- Excel (XLSX)

**SPEC-sac-GS-REL-006:** Relatorio DEVE incluir graficos e tabelas conforme metricas selecionadas.

**SPEC-sac-GS-REL-007:** Componente React DEVE ser `<ReportBuilder />` com interface drag-and-drop ou checkboxes.

#### 6.2. Exportacao de Dados

**SPEC-sac-GS-REL-008:** Sistema DEVE permitir exportacao de listas para CSV ou Excel.

**SPEC-sac-GS-REL-009:** Exportacao DEVE incluir listas de:
- Tickets
- Chats
- Avaliacoes

**SPEC-sac-GS-REL-010:** Sistema DEVE permitir selecao de campos a exportar (projection).

**SPEC-sac-GS-REL-011:** Filtros aplicados no dashboard DEVEM ser respeitados na exportacao.

**SPEC-sac-GS-REL-012:** Sistema DEVE validar limite de registros por exportacao (max: 10.000).

**SPEC-sac-GS-REL-013:** Exportacao DEVE ser processada em background para grandes volumes.

**SPEC-sac-GS-REL-014:** Sistema DEVE notificar usuario quando exportacao estiver pronta.

**SPEC-sac-GS-REL-015:** Componente React DEVE ser `<ExportDialog />`.

#### 6.3. Agendamento de Relatorios

**SPEC-sac-GS-REL-016:** Sistema DEVE permitir agendamento de relatorios recorrentes.

**SPEC-sac-GS-REL-017:** Agendamento DEVE suportar frequencias:
- Diario
- Semanal (dia da semana especifico)
- Mensal (dia do mes especifico)

**SPEC-sac-GS-REL-018:** Sistema DEVE permitir selecao de destinatarios (emails).

**SPEC-sac-GS-REL-019:** Sistema DEVE permitir configuracao de formato (PDF ou Excel).

**SPEC-sac-GS-REL-020:** Metricas e filtros DEVEM ser pre-configurados.

**SPEC-sac-GS-REL-021:** Sistema DEVE permitir editar ou cancelar agendamento.

**SPEC-sac-GS-REL-022:** Envio de relatorio DEVE ser processado via n8n workflow.

**SPEC-sac-GS-REL-023:** Mutacao JQEL DEVE usar `schema: "sac", mutate: "relatorio_agendado", action: "insert"`.

**SPEC-sac-GS-REL-024:** Componente React DEVE ser `<ScheduledReports />` com lista e dialog de criacao/edicao.

---

## 7. Tendencias e Forecasting

### Definicao

Funcionalidades de analise de tendencias e projecoes de demanda futura.

### Requisitos

#### 7.1. Tendencia de Crescimento

**SPEC-sac-GS-TEN-001:** Sistema DEVE exibir grafico de tendencia de volume de tickets.

**SPEC-sac-GS-TEN-002:** Grafico DEVE mostrar volume ao longo dos ultimos 3-6 meses.

**SPEC-sac-GS-TEN-003:** Sistema DEVE calcular taxa de crescimento mensal em percentual.

**SPEC-sac-GS-TEN-004:** Sistema DEVE exibir projecao simples para proximos 30-60 dias (regressao linear).

**SPEC-sac-GS-TEN-005:** Sistema DEVE emitir alerta se crescimento e acelerado (>20% ao mes).

**SPEC-sac-GS-TEN-006:** Componente React DEVE ser `<GrowthTrendChart />` com linha de tendencia.

#### 7.2. Identificacao de Sazonalidade

**SPEC-sac-GS-TEN-007:** Sistema DEVE analisar padroes por dia da semana.

**SPEC-sac-GS-TEN-008:** Sistema DEVE analisar padroes por horario do dia.

**SPEC-sac-GS-TEN-009:** Sistema DEVE analisar padroes por mes do ano.

**SPEC-sac-GS-TEN-010:** Sistema DEVE identificar datas/periodos de pico historico.

**SPEC-sac-GS-TEN-011:** Sistema DEVE permitir comparacao ano a ano.

**SPEC-sac-GS-TEN-012:** Query JQEL DEVE usar `GROUP BY DAYOFWEEK(data_criacao)` e `GROUP BY HOUR(data_criacao)`.

**SPEC-sac-GS-TEN-013:** Componente React DEVE ser `<SeasonalityAnalysis />` com heatmap ou graficos de barras.

#### 7.3. Projecao de Capacidade

**SPEC-sac-GS-TEN-014:** Sistema DEVE calcular projecao de volume para proximo mes/trimestre.

**SPEC-sac-GS-TEN-015:** Sistema DEVE calcular numero de agentes necessarios baseado em:
- Volume projetado
- Produtividade media (tickets por agente por dia)

**SPEC-sac-GS-TEN-016:** Sistema DEVE exibir cenarios:
- Pessimista (crescimento alto)
- Realista (tendencia atual)
- Otimista (crescimento baixo)

**SPEC-sac-GS-TEN-017:** Sistema DEVE fornecer recomendacao de acao:
- Contratar novos agentes
- Manter equipe atual
- Realocar agentes entre departamentos

**SPEC-sac-GS-TEN-018:** Componente React DEVE ser `<CapacityPlanning />` com tabela de cenarios.

---

## 8. Componentes de Visualizacao

### Definicao

Especificacao de componentes de graficos e visualizacao de dados.

### Requisitos

**SPEC-sac-GS-VIZ-001:** Sistema DEVE usar biblioteca Recharts para graficos.

**SPEC-sac-GS-VIZ-002:** Graficos DEVEM suportar tipos:
- Linha (tendencias temporais)
- Barra (comparacoes)
- Pizza (distribuicoes)
- Area (volumes acumulados)
- Gauge (metricas de meta)

**SPEC-sac-GS-VIZ-003:** Graficos DEVEM ser responsivos (adaptar a tamanho da tela).

**SPEC-sac-GS-VIZ-004:** Graficos DEVEM suportar tema light/dark.

**SPEC-sac-GS-VIZ-005:** Graficos DEVEM ter tooltips ao passar mouse.

**SPEC-sac-GS-VIZ-006:** Graficos DEVEM permitir zoom e pan quando apropriado.

**SPEC-sac-GS-VIZ-007:** Graficos DEVEM ter legenda clara.

**SPEC-sac-GS-VIZ-008:** Cores DEVEM seguir paleta semantica:
- Verde: positivo, meta atingida
- Amarelo: atencao, proximo ao limite
- Vermelho: critico, meta nao atingida
- Azul: neutro, informativo

**SPEC-sac-GS-VIZ-009:** Sistema DEVE fornecer componentes reutilizaveis:
- `<LineChart />` - Grafico de linha
- `<BarChart />` - Grafico de barras
- `<PieChart />` - Grafico de pizza
- `<GaugeChart />` - Medidor de meta
- `<HeatMap />` - Mapa de calor

---

## 9. Componentes React

### Definicao

Especificacao dos principais componentes React que compoem a interface do modulo gestao-sac.

### Requisitos

**SPEC-sac-GS-UI-001:** Modulo DEVE exportar componentes de dashboard:
- `<OperationalDashboard />` - Dashboard geral
- `<RealTimeMonitor />` - Monitor em tempo real
- `<MetricCard />` - Card de metrica individual

**SPEC-sac-GS-UI-002:** Modulo DEVE exportar componentes de SLA:
- `<SLAComplianceChart />` - Taxa de cumprimento
- `<BreachTicketsList />` - Lista de tickets em breach
- `<SLATrendChart />` - Tendencia de SLA

**SPEC-sac-GS-UI-003:** Modulo DEVE exportar componentes de performance:
- `<AgentPerformanceTable />` - Tabela de agentes
- `<AgentRanking />` - Ranking de agentes
- `<DepartmentComparison />` - Comparacao de departamentos

**SPEC-sac-GS-UI-004:** Modulo DEVE exportar componentes de volume:
- `<VolumeChart />` - Volume por periodo
- `<ChannelDistribution />` - Distribuicao por canal
- `<CategoryVolume />` - Volume por categoria

**SPEC-sac-GS-UI-005:** Modulo DEVE exportar componentes de satisfacao:
- `<CSATDashboard />` - Dashboard de CSAT
- `<NPSChart />` - Grafico de NPS
- `<FeedbackComments />` - Lista de comentarios

**SPEC-sac-GS-UI-006:** Modulo DEVE exportar componentes de relatorios:
- `<ReportBuilder />` - Construtor de relatorios
- `<ExportDialog />` - Dialog de exportacao
- `<ScheduledReports />` - Gerenciamento de agendamentos

**SPEC-sac-GS-UI-007:** Modulo DEVE exportar componentes de tendencias:
- `<GrowthTrendChart />` - Tendencia de crescimento
- `<SeasonalityAnalysis />` - Analise de sazonalidade
- `<CapacityPlanning />` - Planejamento de capacidade

**SPEC-sac-GS-UI-008:** Todos os componentes DEVEM usar shadcn/ui como base.

**SPEC-sac-GS-UI-009:** Todos os componentes DEVEM suportar tema light/dark.

**SPEC-sac-GS-UI-010:** Todos os componentes DEVEM ser responsivos.

---

## 10. Queries JQEL e Agregacoes

### Definicao

Especificacao das queries JQEL para calculo de metricas e agregacoes.

### Requisitos

**SPEC-sac-GS-JQEL-001:** Sistema DEVE usar schema "sac" para todas as queries de metricas.

**SPEC-sac-GS-JQEL-002:** Query de dashboard geral DEVE incluir agregacoes:
```json
{
  "schema": "sac",
  "select": "chamado",
  "aggregate": [
    { "function": "COUNT", "field": "*", "alias": "total_tickets" },
    { "function": "COUNT", "field": "*", "where": { "status": "aberto" }, "alias": "tickets_abertos" },
    { "function": "COUNT", "field": "*", "where": { "status": "resolvido", "data_resolucao": { "$gte": "today" } }, "alias": "resolvidos_hoje" }
  ]
}
```

**SPEC-sac-GS-JQEL-003:** Query de metricas de SLA DEVE incluir:
```json
{
  "schema": "sac",
  "select": "chamado",
  "aggregate": [
    { "function": "COUNT", "field": "*", "where": { "sla_status": "cumprido" }, "alias": "sla_cumprido" },
    { "function": "COUNT", "field": "*", "where": { "sla_status": "breach" }, "alias": "sla_breach" },
    { "function": "COUNT", "field": "*", "alias": "total" }
  ]
}
```

**SPEC-sac-GS-JQEL-004:** Query de volume por periodo DEVE usar agregacao temporal:
```json
{
  "schema": "sac",
  "select": "chamado",
  "aggregate": [
    { "function": "COUNT", "field": "*", "groupBy": ["DATE(data_criacao)"], "alias": "volume" }
  ],
  "options": {
    "where": {
      "data_criacao": { "$gte": "<data_inicio>", "$lte": "<data_fim>" }
    }
  }
}
```

**SPEC-sac-GS-JQEL-005:** Query de performance por agente DEVE usar GROUP BY:
```json
{
  "schema": "sac",
  "select": "chamado",
  "aggregate": [
    { "function": "COUNT", "field": "*", "groupBy": ["atendente_id"], "alias": "tickets_resolvidos" },
    { "function": "AVG", "field": "tempo_resolucao", "groupBy": ["atendente_id"], "alias": "tempo_medio" }
  ],
  "joins": [
    { "entity": "atendente", "on": "atendente_id" },
    { "entity": "chamado_satisfacao", "on": "chamado_id", "type": "left" }
  ]
}
```

**SPEC-sac-GS-JQEL-006:** Query de satisfacao DEVE calcular CSAT:
```json
{
  "schema": "sac",
  "select": "chamado_satisfacao",
  "aggregate": [
    { "function": "AVG", "field": "nota", "alias": "csat_medio" },
    { "function": "COUNT", "field": "*", "where": { "nota": 1 }, "alias": "nota_1" },
    { "function": "COUNT", "field": "*", "where": { "nota": 2 }, "alias": "nota_2" },
    { "function": "COUNT", "field": "*", "where": { "nota": 3 }, "alias": "nota_3" },
    { "function": "COUNT", "field": "*", "where": { "nota": 4 }, "alias": "nota_4" },
    { "function": "COUNT", "field": "*", "where": { "nota": 5 }, "alias": "nota_5" }
  ]
}
```

**SPEC-sac-GS-JQEL-007:** Sistema DEVE cachear resultados de agregacoes pesadas por 5-15 minutos.

**SPEC-sac-GS-JQEL-008:** Backend PODE pre-calcular metricas em tabelas de agregacao via n8n workflow diario.

---

## 11. Rotas do Modulo

### Definicao

Especificacao das rotas exportadas pelo modulo gestao-sac.

### Requisitos

**SPEC-sac-GS-ROU-001:** Modulo DEVE exportar rotas principais:
- `/` - Dashboard operacional (default)
- `/sla` - Analise de SLA
- `/performance` - Performance de equipe
- `/volume` - Analise de volume
- `/satisfaction` - Satisfacao e qualidade
- `/reports` - Relatorios e exportacao
- `/trends` - Tendencias e forecasting

**SPEC-sac-GS-ROU-002:** Todas as rotas DEVEM ser relativas (portal prefix injetado automaticamente).

**SPEC-sac-GS-ROU-003:** Rotas DEVEM usar lazy-loading via `React.lazy()`.

**SPEC-sac-GS-ROU-004:** Rotas DEVEM validar autenticacao via `<ProtectedRoute />`.

**SPEC-sac-GS-ROU-005:** Rotas DEVEM validar permissoes via RBAC (papel de gestor minimo).

---

## 12. Permissoes e RBAC

### Definicao

Especificacao de controle de acesso baseado em papeis para o modulo gestao-sac.

### Requisitos

**SPEC-sac-GS-RBAC-001:** Acesso ao modulo DEVE requerer papel minimo: "Gestor" ou "Supervisor".

**SPEC-sac-GS-RBAC-002:** Supervisores DEVEM ver metricas apenas de seus departamentos.

**SPEC-sac-GS-RBAC-003:** Gestores DEVEM ver metricas de todos os departamentos.

**SPEC-sac-GS-RBAC-004:** Administradores DEVEM ter acesso completo a todas as funcionalidades.

**SPEC-sac-GS-RBAC-005:** Agentes NAO DEVEM ter acesso ao modulo gestao-sac.

**SPEC-sac-GS-RBAC-006:** Validacao DEVE ocorrer no frontend (UX) e backend (seguranca).

**SPEC-sac-GS-RBAC-007:** Backend DEVE implementar RLS via JQEL filtrando por departamentos permitidos.

---

## 13. Performance e Otimizacao

### Definicao

Requisitos de performance para garantir experiencia fluida com grandes volumes de dados.

### Requisitos

**SPEC-sac-GS-PERF-001:** Dashboard principal DEVE carregar em menos de 2 segundos.

**SPEC-sac-GS-PERF-002:** Graficos DEVEM renderizar em menos de 1 segundo.

**SPEC-sac-GS-PERF-003:** Queries de agregacao DEVEM usar indices otimizados no banco de dados.

**SPEC-sac-GS-PERF-004:** Sistema DEVE cachear resultados de agregacoes pesadas.

**SPEC-sac-GS-PERF-005:** Sistema DEVE usar paginacao para listas longas (>100 registros).

**SPEC-sac-GS-PERF-006:** Exportacoes grandes (>1000 registros) DEVEM ser processadas em background.

**SPEC-sac-GS-PERF-007:** Graficos DEVEM usar virtualizacao para grandes datasets (>1000 pontos).

**SPEC-sac-GS-PERF-008:** Sistema DEVE implementar debounce em filtros (300ms).

**SPEC-sac-GS-PERF-009:** Componentes DEVEM usar React.memo para evitar re-renders desnecessarios.

**SPEC-sac-GS-PERF-010:** Modulo DEVE ser code-split em chunks separados via Vite.

---

## 14. Integracao com Backbone

### Definicao

Pontos de integracao com workflows n8n para processamento de metricas.

### Requisitos

**SPEC-sac-GS-INT-001:** Workflow n8n DEVE calcular metricas agregadas diariamente (meia-noite).

**SPEC-sac-GS-INT-002:** Workflow DEVE armazenar agregacoes em tabelas de cache para consulta rapida.

**SPEC-sac-GS-INT-003:** Workflow DEVE calcular metricas por:
- Agente
- Departamento
- Categoria
- Canal
- Periodo (dia, semana, mes)

**SPEC-sac-GS-INT-004:** Workflow DEVE calcular tendencias e projecoes usando algoritmos de regressao.

**SPEC-sac-GS-INT-005:** Workflow DEVE enviar relatorios agendados via email.

**SPEC-sac-GS-INT-006:** Workflow DEVE monitorar alertas criticos e notificar gestores.

**SPEC-sac-GS-INT-007:** Backend DEVE publicar eventos de metricas atualizadas em canal Redis `sac:metrics:updated`.

---

**Versao**: 1.0
**Data**: 2025-01-12
**Status**: Ativo
**Total de Requisitos**: 235
