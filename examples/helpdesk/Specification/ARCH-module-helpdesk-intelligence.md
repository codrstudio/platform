# ARCH-module-helpdesk-intelligence.md

## Arquitetura: Módulo HelpDesk - Inteligência

### Escopo

Este documento descreve as **funcionalidades de análise, relatórios e inteligência de dados** do módulo HelpDesk. Inclui dashboards executivos, relatórios operacionais, pesquisa de satisfação e analytics preditivos.

### Relacionamento com Outros Documentos

```
STORY-module-helpdesk-*.md (User Stories)
   ↓ implementadas por
SPEC-module-helpdesk-intelligence.md (Requisitos)
   ↓ usando design de
ARCH-module-helpdesk-intelligence.md (Arquitetura - ESTE DOCUMENTO)
```

---

## 6. Inteligência e Analytics

### FN018: Dashboards Executivos

**Descrição:**
O sistema oferece dashboards configuráveis que apresentam KPIs críticos em tempo real. Gestores podem visualizar métricas de performance, tendências de volume, cumprimento de SLA e satisfação do cliente em interfaces visuais intuitivas.

**KPIs Principais:**
- Volume (Total de chamados, Abertos vs. fechados, Tendência, Distribuição por status)
- SLA (Cumprimento %, Chamados fora do prazo, Média de resolução)
- Satisfação (NPS, Satisfação média, Taxa de resposta, Tendência)
- Performance (Chamados por atendente, Taxa de resolução primeiro contato, Tempo médio resposta, Top 5 atendentes)

**Características:**
- Atualização em tempo real (WebSocket)
- Drill-down para detalhes
- Filtros por período/departamento/atendente
- Comparação com períodos anteriores
- Exportação de gráficos (PNG, PDF)
- Personalização por usuário

**Decisões de Design:**
- Pré-agregação de métricas (performance)
- Jobs noturnos para consolidação histórica
- Cache Redis para dashboards frequentes
- Biblioteca de gráficos: Chart.js ou Recharts

**Implementa Requisitos:** SPEC-MH-DASH-001 a SPEC-MH-DASH-007
**Relacionado a User Stories:** US030

---

### FN019: Relatórios Operacionais

**Descrição:**
A funcionalidade de relatórios permite análises profundas de todos os aspectos do atendimento. Relatórios podem ser filtrados por múltiplos critérios, agrupados por diferentes dimensões e exportados em vários formatos.

**Tipos de Relatórios:**
1. **Relatório de Chamados** - Filtros, agrupamentos, métricas de volume/tempo/SLA, Formatos: PDF/Excel/CSV
2. **Relatório de Performance** - Por atendente individual, Comparativo entre atendentes, Evolução temporal
3. **Relatório de SLA** - Cumprimento por departamento/categoria, Violações, Análise de causas
4. **Relatório de Satisfação** - Distribuição de notas, Análise de comentários, Correlações, Tendências

**Funcionalidades Avançadas:**
- Agendamento automático (diário, semanal, mensal)
- Envio por email para stakeholders
- Modelos de relatório salvos
- Drill-down interativo
- Exportação em múltiplos formatos

**Decisões de Design:**
- Geração assíncrona (fila de jobs)
- Armazenamento temporário de relatórios
- PDFs com charts embutidos
- Excel com pivot tables
- API para integração BI externo

**Implementa Requisitos:** SPEC-MH-REP-001 a SPEC-MH-REP-007
**Relacionado a User Stories:** US031, US032

---

### FN020: Sistema de Satisfação

**Descrição:**
A pesquisa de satisfação é automaticamente enviada após o fechamento de chamados, utilizando links únicos e seguros. O sistema coleta avaliações em escala de 1 a 5 estrelas com comentários opcionais, registrando dados de auditoria para garantir integridade.

**Fluxo de Pesquisa:**
```
Chamado fechado → Sistema aguarda X horas → Envia email com pesquisa
→ Cliente avalia (1-5 estrelas + comentário) → Sistema registra
→ Notifica atendente (se nota < 3)
```

**Escala de Avaliação:**
- ⭐ (1) - Muito insatisfeito
- ⭐⭐ (2) - Insatisfeito
- ⭐⭐⭐ (3) - Neutro
- ⭐⭐⭐⭐ (4) - Satisfeito
- ⭐⭐⭐⭐⭐ (5) - Muito satisfeito

**Cálculo de NPS:**
```
Promotores (4-5): +1
Neutros (3): 0
Detratores (1-2): -1
NPS = (Promotores - Detratores) / Total × 100
```

**Características:**
- Token único e seguro
- Expiração configurável
- Apenas uma avaliação por chamado
- Registro de IP/timestamp (auditoria)
- Alertas para notas baixas

**Decisões de Design:**
- Token JWT assinado (segurança)
- Página sem autenticação (facilidade)
- Registro imutável após submissão
- Agregação para métricas em tempo real

**Implementa Requisitos:** SPEC-MH-SAT-001 a SPEC-MH-SAT-007
**Relacionado a User Stories:** US033

---

### FN021: Analytics Preditivos

**Descrição:**
O sistema coleta dados históricos para análises preditivas, identificação de tendências sazonais e previsão de demanda. Ajuda gestores a planejar recursos e antecipar necessidades futuras.

**Capacidades:**
1. **Previsão de Demanda** - Modelo ARIMA, Previsão para 30 dias, Identificação de sazonalidade, Alertas de picos
2. **Análise de Tendências** - Tendência de volume, Mudanças em categorias, Evolução de satisfação, Padrões temporais
3. **Detecção de Anomalias** - Volume anormal, Crescimento súbito, Queda de satisfação, Violações de SLA
4. **Recomendações** - Sugestão de contratação, Identificação de treinamentos, Otimização de horários

**Dados Utilizados:**
- Histórico de chamados (12+ meses)
- Dados de satisfação
- Métricas de performance
- Eventos externos

**Decisões de Design:**
- Pipeline separado (batch processing)
- Machine Learning em Python (scikit-learn)
- Execução diária de modelos
- Resultados em cache
- APIs para consumo de previsões

**Implementa Requisitos:** Complementa SPEC-MH-DASH-*, SPEC-MH-REP-*
**Relacionado a User Stories:** US046, US047

---

## Resumo de Funcionalidades

### Estatísticas
- **Total de Funcionalidades:** 4 (FN018-FN021)
- **Categorias:** 1 módulo (Inteligência e Analytics)
- **Requisitos Implementados:** 28 (SPEC-MH-DASH-*, REP-*, SAT-*)
- **User Stories Cobertas:** US030-US033, US046-US047

### Princípios Arquiteturais
1. **Tempo Real:** WebSocket para dashboards dinâmicos
2. **Pré-Agregação:** Cálculo noturno para performance
3. **Flexibilidade:** Relatórios customizáveis e agendáveis
4. **Inteligência:** ML para previsões e anomalias

---

**Documento gerado a partir de:** `ARCH-module-helpdesk.md`
**Data de divisão:** 2025-01-12
**Versão:** 1.0
