# Gestao-SAC Module - User Stories

Historias de usuario para o modulo gestao-sac (interface de gestores para analytics e dashboards).

---

## 1. Dashboards Operacionais

### US-GS-001: Ver Dashboard Geral de Operacao

> Como gestor de SAC,
> Quero ver metricas principais em tempo real,
> Para ter visao geral da operacao e identificar problemas rapidamente.

**Criterios de Aceitacao**:
- Cards com metricas principais: tickets abertos hoje, tickets resolvidos hoje, taxa de resolucao
- Cards com metricas de chat: chats em andamento, tempo medio de espera, satisfacao media
- Metricas de SLA: tickets em breach, taxa de cumprimento de SLA
- Graficos visuais (barras, linhas, pizza) para principais metricas
- Atualizacao automatica a cada minuto

---

### US-GS-002: Monitorar Operacao em Tempo Real

> Como gestor de SAC,
> Quero ver situacao atual da operacao,
> Para intervir rapidamente quando necessario.

**Criterios de Aceitacao**:
- Contador de tickets/chats ativos neste momento
- Lista de agentes online/offline
- Fila de espera atual (tickets nao atribuidos, chats aguardando)
- Alertas visuais quando metricas criticas (ex: fila muito grande, SLA em risco)
- Possibilidade de filtrar por departamento

---

### US-GS-003: Receber Alertas de Situacoes Criticas

> Como gestor de SAC,
> Quero ser notificado de situacoes criticas,
> Para agir antes que problema escale.

**Criterios de Aceitacao**:
- Alerta quando fila de espera ultrapassa limite (ex: 10 pessoas)
- Alerta quando tickets proximos de breach de SLA ultrapassam limite
- Alerta quando satisfacao media cai abaixo de patamar (ex: <3.5)
- Notificacoes in-app e/ou email
- Configuracao de limites personalizaveis

---

## 2. Metricas de SLA

### US-GS-004: Ver Taxa de Cumprimento de SLA

> Como gestor de SAC,
> Quero ver percentual de SLA cumprido,
> Para garantir qualidade contratual com clientes.

**Criterios de Aceitacao**:
- Percentual de tickets que cumpriram SLA de primeira resposta
- Percentual de tickets que cumpriram SLA de resolucao
- Grafico de tendencia (semana, mes, trimestre)
- Detalhamento por prioridade (Urgente, Alta, Normal, Baixa)
- Meta de SLA visivel (ex: 95% de cumprimento)

---

### US-GS-005: Identificar Tickets em Breach de SLA

> Como gestor de SAC,
> Quero ver lista de tickets que estouraram SLA,
> Para entender causas e prevenir recorrencia.

**Criterios de Aceitacao**:
- Lista de tickets em breach (ja estouraram prazo)
- Filtro por tipo de breach (primeira resposta ou resolucao)
- Informacoes: protocolo, cliente, agente, tempo de atraso
- Ordenacao por gravidade do atraso
- Exportacao da lista para analise

---

### US-GS-006: Analisar Tendencias de SLA

> Como gestor de SAC,
> Quero ver evolucao de SLA ao longo do tempo,
> Para identificar se estamos melhorando ou piorando.

**Criterios de Aceitacao**:
- Grafico de linha mostrando taxa de cumprimento por periodo
- Comparacao mes a mes ou semana a semana
- Identificacao de picos de breach (quando aconteceram e por que)
- Correlacao com volume de tickets

---

## 3. Performance de Equipe

### US-GS-007: Ver Metricas Individuais de Agentes

> Como gestor de SAC,
> Quero ver performance de cada agente,
> Para identificar quem precisa treinamento ou reconhecimento.

**Criterios de Aceitacao**:
- Tabela com agentes e metricas: tickets resolvidos, tempo medio de resolucao, satisfacao media
- Taxa de reabertura de tickets (indicador de qualidade)
- Tickets em breach de SLA por agente
- Ordenacao por qualquer coluna
- Filtro por departamento e periodo

---

### US-GS-008: Comparar Performance entre Agentes

> Como gestor de SAC,
> Quero comparar agentes entre si,
> Para identificar melhores praticas e oportunidades de melhoria.

**Criterios de Aceitacao**:
- Ranking de agentes por metrica selecionada
- Media da equipe visivel para comparacao
- Graficos comparativos (barras)
- Destaque para top performers e bottom performers

---

### US-GS-009: Ver Metricas por Departamento

> Como gestor de SAC,
> Quero ver performance de cada departamento,
> Para identificar equipes que precisam de suporte.

**Criterios de Aceitacao**:
- Comparacao entre departamentos: volume, tempo de resolucao, satisfacao
- SLA por departamento
- Capacidade vs demanda (agentes disponiveis vs volume de tickets)
- Identificacao de gargalos

---

## 4. Analise de Volume

### US-GS-010: Ver Volume de Tickets por Periodo

> Como gestor de SAC,
> Quero ver quantos tickets foram criados por periodo,
> Para entender demanda e planejar capacidade.

**Criterios de Aceitacao**:
- Grafico de barras ou linhas: tickets criados por dia/semana/mes
- Comparacao com periodo anterior
- Filtro por departamento, categoria, prioridade
- Identificacao de sazonalidade (dias/horarios de pico)

---

### US-GS-011: Ver Volume de Tickets por Canal

> Como gestor de SAC,
> Quero saber quantos tickets vem de cada canal,
> Para decidir onde investir recursos.

**Criterios de Aceitacao**:
- Grafico de pizza: distribuicao por canal (Portal, Email, Chat, Telefone, Interno)
- Volume absoluto e percentual
- Tendencia ao longo do tempo
- Satisfacao media por canal

---

### US-GS-012: Ver Volume de Tickets por Categoria

> Como gestor de SAC,
> Quero saber quais tipos de problema sao mais comuns,
> Para criar documentacao ou melhorar produto.

**Criterios de Aceitacao**:
- Ranking de categorias por volume
- Tendencia de crescimento/reducao por categoria
- Tempo medio de resolucao por categoria
- Identificacao de categorias problematicas (alto volume + baixa satisfacao)

---

## 5. Satisfacao e Qualidade

### US-GS-013: Ver Satisfacao Geral (CSAT)

> Como gestor de SAC,
> Quero ver nota media de satisfacao,
> Para medir qualidade percebida pelos clientes.

**Criterios de Aceitacao**:
- CSAT (Customer Satisfaction Score) medio: nota de 1 a 5
- Distribuicao de notas (quantos deram 1, 2, 3, 4, 5)
- Tendencia ao longo do tempo
- Filtro por departamento, agente, canal, periodo

---

### US-GS-014: Calcular NPS (Net Promoter Score)

> Como gestor de SAC,
> Quero calcular NPS,
> Para medir lealdade dos clientes.

**Criterios de Aceitacao**:
- NPS calculado automaticamente baseado em avaliacoes
- Classificacao: Detratores (1-3), Neutros (4), Promotores (5)
- Score NPS final (% Promotores - % Detratores)
- Tendencia de NPS ao longo do tempo

---

### US-GS-015: Analisar Feedback Qualitativo

> Como gestor de SAC,
> Quero ler comentarios dos clientes,
> Para entender causas de insatisfacao ou satisfacao.

**Criterios de Aceitacao**:
- Lista de comentarios deixados em pesquisas de satisfacao
- Filtro por nota (ex: ver apenas comentarios de avaliacao 1 ou 2)
- Busca por palavra-chave nos comentarios
- Contagem de palavras/termos mais mencionados
- Link para ticket/chat original

---

## 6. Relatorios e Exportacao

### US-GS-016: Gerar Relatorio Personalizado

> Como gestor de SAC,
> Quero criar relatorio com metricas especificas,
> Para apresentar em reuniao de diretoria.

**Criterios de Aceitacao**:
- Construtor de relatorio com selecao de metricas
- Filtros: periodo, departamento, agente, categoria
- Preview do relatorio antes de gerar
- Formato de saida: PDF ou Excel
- Inclusao de graficos e tabelas

---

### US-GS-017: Exportar Dados para Analise Externa

> Como gestor de SAC,
> Quero exportar dados brutos,
> Para fazer analises personalizadas em outras ferramentas.

**Criterios de Aceitacao**:
- Exportacao de listas (tickets, chats, avaliacoes) para CSV ou Excel
- Selecao de campos a exportar
- Filtros aplicados antes da exportacao
- Limite de registros por exportacao

---

### US-GS-018: Agendar Envio Automatico de Relatorios

> Como gestor de SAC,
> Quero receber relatorios periodicos por email,
> Para nao precisar gerar manualmente toda semana.

**Criterios de Aceitacao**:
- Configuracao de relatorio recorrente (diario, semanal, mensal)
- Selecao de destinatarios (emails)
- Formato do relatorio (PDF ou Excel)
- Metricas e filtros pre-configurados
- Possibilidade de editar ou cancelar agendamento

---

## 7. Tendencias e Forecasting

### US-GS-019: Ver Tendencia de Crescimento de Demanda

> Como gestor de SAC,
> Quero ver se volume de tickets esta crescendo,
> Para planejar contratacoes.

**Criterios de Aceitacao**:
- Grafico de tendencia (volume ao longo dos ultimos 3-6 meses)
- Taxa de crescimento mensal em percentual
- Projecao simples para proximos 30-60 dias
- Alerta se crescimento e acelerado (>20% ao mes)

---

### US-GS-020: Identificar Sazonalidade

> Como gestor de SAC,
> Quero identificar padroes de sazonalidade,
> Para me preparar para periodos de pico.

**Criterios de Aceitacao**:
- Analise de padroes por dia da semana (seg-dom)
- Analise de padroes por horario do dia
- Analise de padroes por mes do ano
- Identificacao de datas/periodos de pico historico
- Comparacao ano a ano

---

### US-GS-021: Projetar Capacidade Necessaria

> Como gestor de SAC,
> Quero projecao de demanda futura,
> Para planejar numero de agentes necessarios.

**Criterios de Aceitacao**:
- Projecao de volume de tickets para proximo mes/trimestre
- Calculo de agentes necessarios baseado em produtividade media
- Cenarios (pessimista, realista, otimista)
- Recomendacao de acao (contratar, manter, realocar)

---

**Total**: 21 historias de usuario para o modulo gestao-sac
