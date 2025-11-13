# STORY-module-helpdesk-reports-satisfaction.md

## Área Temática: Relatórios e Satisfação do Cliente

### Visão Geral

Esta área representa as **ferramentas de análise detalhada e feedback do cliente** do sistema HelpDesk. As histórias deste grupo definem como usuários geram relatórios personalizados, exportam dados para análise externa, identificam tendências operacionais e coletam feedback direto dos clientes através de pesquisas de satisfação.

O agrupamento forma uma unidade coesa que implementa geração de relatórios customizáveis com múltiplos filtros, exportação em diversos formatos (PDF, Excel, CSV), análise de tendências com identificação de padrões, sistema completo de pesquisa de satisfação pós-atendimento e análise de sentimento dos feedbacks. Esta área é essencial para melhoria contínua e gestão baseada em dados.

---

## User Stories

### US031 - Relatórios Personalizados
**Como** supervisor
**Eu quero** gerar relatórios detalhados de chamados
**Para que** eu possa analisar padrões e performance

**Critérios de Sucesso:**
- [ ] Filtros múltiplos (período, status, cliente, etc.)
- [ ] Agrupamentos configuráveis
- [ ] Gráficos e tabelas dinâmicas
- [ ] Drill-down para detalhes
- [ ] Exportação em múltiplos formatos
- [ ] Agendamento de relatórios
- [ ] Compartilhamento por email

**Tabelas Relacionadas:** `TBchamado`, `TBchamado_historico`, `TBcontato`, `TBatendente`

---

### US032 - Relatório de Performance
**Como** gestor
**Eu quero** avaliar performance dos atendentes
**Para que** eu possa identificar necessidades de treinamento

**Critérios de Sucesso:**
- [ ] Métricas individuais por atendente
- [ ] Comparativos entre atendentes
- [ ] Tempo médio de resolução
- [ ] Taxa de satisfação do cliente
- [ ] Volume de chamados atendidos
- [ ] Cumprimento de SLA
- [ ] Gráficos de evolução temporal

**Tabelas Relacionadas:** `TBatendente`, `TBchamado`, `TBchamado_satisfacao`, `TBatendimento`

---

### US033 - Pesquisa de Satisfação
**Como** cliente
**Eu quero** avaliar o atendimento recebido
**Para que** eu possa contribuir com feedback

**Critérios de Sucesso:**
- [ ] Formulário simples e rápido
- [ ] Escala de 1 a 5 estrelas
- [ ] Campo opcional para comentários
- [ ] Envio por email após fechamento
- [ ] Link único e seguro
- [ ] Prazo de validade da pesquisa
- [ ] Confirmação de envio

**Tabelas Relacionadas:** `TBchamado_satisfacao`, `TBchamado`, `TBtemplate_email`

---

### US046 - Análise de Tendências
**Como** analista
**Eu quero** visualizar tendências dos chamados
**Para que** eu possa identificar padrões e oportunidades de melhoria

**Critérios de Sucesso:**
- [ ] Gráficos de tendências temporais
- [ ] Análise sazonal
- [ ] Comparativos entre períodos
- [ ] Identificação de picos e vales
- [ ] Correlação entre variáveis
- [ ] Projeções futuras
- [ ] Alertas de anomalias

**Tabelas Relacionadas:** `TBchamado`, `TBchamado_historico`

---

### US047 - Análise de Satisfação
**Como** gestor de qualidade
**Eu quero** analisar dados de satisfação
**Para que** eu possa melhorar a qualidade do atendimento

**Critérios de Sucesso:**
- [ ] Métricas de satisfação por período
- [ ] Análise por atendente/departamento
- [ ] Correlação satisfação vs. tempo de resolução
- [ ] Análise de comentários (sentiment analysis)
- [ ] Identificação de pontos de melhoria
- [ ] Benchmarking interno
- [ ] Planos de ação baseados em dados

**Tabelas Relacionadas:** `TBchamado_satisfacao`, `TBchamado`, `TBatendente`

---

## Schema do Banco de Dados

### Tabelas de Satisfação
- **TBchamado_satisfacao**: Respostas de pesquisas de satisfação
  - Chamado relacionado
  - Nota (1-5 estrelas)
  - Comentários do cliente (opcional)
  - Data de envio da pesquisa
  - Data de resposta
  - IP de resposta (auditoria)
  - Token único de acesso
  - Status (pendente, respondida, expirada)

### Tabelas de Dados Operacionais
- **TBchamado**: Dados completos de chamados
- **TBchamado_historico**: Timeline de atividades
- **TBatendente**: Performance individual
- **TBcontato**: Segmentação por cliente
- **TBatendimento**: Dados de atendimentos online
- **TBdepartamento**: Segmentação por área
- **TBcategoria**: Classificação de problemas

### Tabelas de Comunicação
- **TBtemplate_email**: Templates para envio de pesquisas

---

## Requisitos Relacionados

Esta área de User Stories implementa os seguintes requisitos (OSD):

**Relatórios:**
- SPEC-MH-REP-001 a SPEC-MH-REP-007: Relatórios detalhados, performance, SLA, agendamento, exportação

**Pesquisa de Satisfação:**
- SPEC-MH-SAT-001 a SPEC-MH-SAT-007: Envio automático, escala, links seguros, validade, auditoria

---

## Relatórios Disponíveis

### 1. Relatório Geral de Chamados

**Filtros:**
- Período (data início/fim)
- Status (todos, novo, em atendimento, etc.)
- Departamento
- Categoria
- Prioridade
- Cliente
- Atendente
- Tags

**Agrupamentos:**
- Por dia/semana/mês
- Por status
- Por departamento
- Por categoria
- Por cliente
- Por atendente

**Métricas Incluídas:**
- Volume total de chamados
- Distribuição por status
- Tempo médio de resolução
- Taxa de cumprimento de SLA
- Taxa de reabertura

---

### 2. Relatório de Performance por Atendente

**Métricas Principais:**
```
┌────────────────────────────────────────────────────┐
│ Atendente: Maria Santos                            │
│ Período: Janeiro 2025                              │
├────────────────────────────────────────────────────┤
│ Chamados Atribuídos:           67                  │
│ Chamados Resolvidos:           64                  │
│ Taxa de Resolução:             95.5%               │
│                                                    │
│ Tempo Médio Primeira Resposta: 1.2 horas          │
│ Tempo Médio de Resolução:      4.3 horas          │
│                                                    │
│ SLA Cumprido:                  96.2%               │
│ SLA Violado:                   3.8% (2 chamados)  │
│                                                    │
│ Satisfação Média:              4.8 / 5.0          │
│ NPS (Net Promoter Score):      +75                 │
│                                                    │
│ Taxa de Reabertura:            3.1%                │
│ Comentários em Chamados:       182                 │
│                                                    │
│ Distribuição por Categoria:                       │
│   Hardware:     45%                                │
│   Software:     35%                                │
│   Rede:         20%                                │
└────────────────────────────────────────────────────┘
```

**Comparativo com Equipe:**
- Ranking de produtividade
- Comparação de tempos médios
- Comparação de satisfação

---

### 3. Relatório de SLA

**Visão Consolidada:**
```
┌────────────────────────────────────────────────────┐
│ CUMPRIMENTO DE SLA - JANEIRO 2025                  │
├────────────────────────────────────────────────────┤
│                                                    │
│ Chamados Dentro do SLA:    245 (94.2%)            │
│ Chamados Fora do SLA:       15 (5.8%)             │
│ Total de Chamados:         260                     │
│                                                    │
│ Por Departamento:                                  │
│   Suporte Técnico:         96.5% ✓                │
│   Financeiro:              91.2% ⚠                │
│   Comercial:               93.8% ✓                │
│   RH:                      88.5% ✗                │
│                                                    │
│ Por Prioridade:                                    │
│   Urgente:                 98.0% ✓                │
│   Alta:                    95.5% ✓                │
│   Média:                   92.8% ✓                │
│   Baixa:                   89.2% ⚠                │
│                                                    │
│ Tempo Médio de Vencimento: +2.3 horas             │
│ Pior caso:                 -8.5 horas (atrasado)  │
│ Melhor caso:               +23.1 horas (antecip.) │
└────────────────────────────────────────────────────┘
```

---

### 4. Relatório de Satisfação

**Métricas Gerais:**
```
┌────────────────────────────────────────────────────┐
│ SATISFAÇÃO DO CLIENTE - JANEIRO 2025               │
├────────────────────────────────────────────────────┤
│                                                    │
│ Pesquisas Enviadas:        195                     │
│ Pesquisas Respondidas:     147 (75.4%)            │
│                                                    │
│ Satisfação Média:          4.6 / 5.0              │
│ NPS Geral:                 +68                     │
│                                                    │
│ Distribuição de Notas:                            │
│   5 estrelas: ██████████████████ 72 (49%)        │
│   4 estrelas: ████████████ 48 (33%)              │
│   3 estrelas: ████ 18 (12%)                      │
│   2 estrelas: ██ 6 (4%)                          │
│   1 estrela:  █ 3 (2%)                           │
│                                                    │
│ Promotores (4-5):          120 (82%)              │
│ Neutros (3):                18 (12%)              │
│ Detratores (1-2):           9 (6%)                │
│                                                    │
│ Tempo Médio de Resposta: 2.3 dias                 │
└────────────────────────────────────────────────────┘
```

---

## Pesquisa de Satisfação

### Fluxo de Envio
```
1. Chamado é marcado como "Resolvido"
   ↓
2. Sistema aguarda 1 hora (cooldown)
   ↓
3. Gera token único para pesquisa
   ↓
4. Envia email com link da pesquisa
   ↓
5. Define validade de 7 dias
   ↓
6. Cliente clica no link
   ↓
7. Formulário de avaliação é exibido
   ↓
8. Cliente avalia (1-5 estrelas) + comentários
   ↓
9. Sistema registra resposta com IP e data
   ↓
10. Email de agradecimento é enviado
```

### Formulário de Avaliação

```html
┌────────────────────────────────────────────────────┐
│ AVALIE SEU ATENDIMENTO                             │
├────────────────────────────────────────────────────┤
│                                                    │
│ Protocolo: #2025-00123                            │
│ Problema: Impressora não funciona                  │
│ Atendente: Maria Santos                            │
│                                                    │
│ Como você avalia este atendimento?                 │
│                                                    │
│   ☆ ☆ ☆ ☆ ☆                                      │
│   1 2 3 4 5                                        │
│                                                    │
│ Comentários (opcional):                           │
│ ┌──────────────────────────────────────────────┐  │
│ │                                              │  │
│ │                                              │  │
│ │                                              │  │
│ └──────────────────────────────────────────────┘  │
│                                                    │
│ [ENVIAR AVALIAÇÃO]                                │
│                                                    │
│ Link válido até: 25/01/2025                       │
└────────────────────────────────────────────────────┘
```

---

## Análise de Sentimento (Comentários)

### Classificação Automática

**Positivo:**
```
"Excelente atendimento! Resolveram meu problema rapidamente."
"Maria foi muito atenciosa e competente."
```

**Neutro:**
```
"Problema resolvido conforme esperado."
"Atendimento padrão."
```

**Negativo:**
```
"Demorou muito para resolver."
"Tive que explicar o problema várias vezes."
```

### Extração de Temas

Identificação automática de temas recorrentes:
- "tempo de resposta" (25 menções)
- "conhecimento técnico" (18 menções)
- "cordialidade" (42 menções)
- "solução efetiva" (31 menções)

---

## Exportação de Dados

### Formatos Suportados

**PDF:**
- Relatório formatado e visual
- Gráficos renderizados
- Ideal para apresentações

**Excel (.xlsx):**
- Dados tabulares
- Múltiplas abas
- Gráficos nativos do Excel
- Tabelas dinâmicas

**CSV:**
- Dados brutos
- Ideal para importação em outras ferramentas
- Separador configurável (vírgula, ponto-e-vírgula)

**JSON:**
- Estrutura completa de dados
- Ideal para integrações via API

---

## Agendamento de Relatórios

### Configuração

```javascript
{
  nome: "Relatório Semanal de Performance",
  tipo: "performance_atendentes",
  frequencia: "semanal",
  dia_semana: "segunda",
  horario: "08:00",
  destinatarios: [
    "gestor@empresa.com",
    "supervisor@empresa.com"
  ],
  filtros: {
    departamento: "suporte-tecnico",
    periodo: "ultimos-7-dias"
  },
  formato: "pdf",
  ativo: true
}
```

---

## Resumo

**Total de User Stories:** 5
**Personas Envolvidas:** Supervisores, Gestores, Analistas, Clientes
**Complexidade:** Alta (análises estatísticas complexas)
**Prioridade:** Média-Alta (essencial para melhoria contínua)
**Dependências:**
- STORY-module-helpdesk-ticket-management (dados operacionais)
- STORY-module-helpdesk-ticket-lifecycle (resolução de chamados)
- STORY-module-helpdesk-client-management (segmentação)
