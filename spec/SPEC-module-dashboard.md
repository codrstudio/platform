# SPEC-module-dashboard.md

## Especificação: Módulo Dashboard

### Escopo
Este documento especifica o módulo Dashboard, responsável por criar painéis de visualização de dados e métricas com componentes interativos.

---

## 1. Definição

### Propósito
O módulo Dashboard fornece interface para criar e exibir painéis customizáveis com widgets de dados, gráficos, tabelas e métricas em tempo real.

### Natureza
- **Tipo**: Módulo de Funcionalidade
- **Dependências**: App Components (obrigatório)
- **Opcional**: Sim

---

## 2. Responsabilidades

### SPEC-DASH-R-001
O módulo Dashboard DEVE fornecer sistema de grid para posicionamento de widgets

### SPEC-DASH-R-002
O módulo Dashboard DEVE permitir criação de múltiplas instâncias (dashboards diferentes)

### SPEC-DASH-R-003
O módulo Dashboard DEVE buscar dados via JQEL

### SPEC-DASH-R-004
O módulo Dashboard DEVE suportar atualização automática de dados (polling ou SSE)

---

## 3. Componentes (Widgets)

### Widgets Obrigatórios

**SPEC-DASH-W-001:** Todo dashboard DEVE suportar os seguintes tipos de widget:

#### Metric Card (Cartão de Métrica)
- Valor numérico destacado
- Rótulo/título
- Variação/tendência (opcional)
- Ícone (opcional)

#### Line Chart (Gráfico de Linha)
- Séries temporais
- Múltiplas linhas
- Zoom/pan
- Tooltip interativo

#### Bar Chart (Gráfico de Barras)
- Horizontal ou vertical
- Agrupado ou empilhado
- Múltiplas séries

#### Pie Chart (Gráfico de Pizza/Donut)
- Distribuição percentual
- Labels customizáveis
- Interativo (hover/click)

#### Table (Tabela)
- Sorting por coluna
- Filtros
- Paginação
- Exportação (via Export Components)

#### Text Widget (Texto/Markdown)
- Título estático
- Descrição/anotação
- Markdown suportado

### Widgets Opcionais

**SPEC-DASH-W-002:** Dashboard PODE suportar widgets adicionais:
- Area Chart
- Scatter Plot
- Heatmap
- Gauge (medidor)
- Progress Bar
- List (lista customizada)
- Iframe (embed externo)

---

## 4. Sistema de Grid

### Layout

**SPEC-DASH-G-001:** Dashboard DEVE usar sistema de grid responsivo

**SPEC-DASH-G-002:** Grid DEVE ter número configurável de colunas (padrão: 12)

**SPEC-DASH-G-003:** Cada widget DEVE ocupar número definido de colunas

**SPEC-DASH-G-004:** Widgets DEVEM ajustar automaticamente em telas menores (breakpoints)

### Posicionamento

**SPEC-DASH-G-005:** Widgets DEVEM ter posição definida por:
```typescript
{
  x: number;      // Coluna inicial (0-11)
  y: number;      // Linha
  w: number;      // Largura em colunas
  h: number;      // Altura em unidades de grid
}
```

**SPEC-DASH-G-006:** Sistema DEVE prevenir sobreposição de widgets

### Redimensionamento e Drag-and-Drop

**SPEC-DASH-G-007:** No modo de edição, widgets DEVEM ser redimensionáveis

**SPEC-DASH-G-008:** No modo de edição, widgets DEVEM ser arrastáveis (drag-and-drop)

**SPEC-DASH-G-009:** No modo de visualização, widgets DEVEM ser fixos

---

## 5. Configuração de Instância

### Parâmetros Obrigatórios

**SPEC-DASH-C-001:** Toda instância DEVE ter:
```typescript
{
  instanceId: string;
  title: string;           // Título do dashboard
  route: string;           // Rota de acesso
  widgets: Widget[];       // Array de widgets
}
```

### Parâmetros Opcionais

**SPEC-DASH-C-002:** Instância PODE configurar:
```typescript
{
  description?: string;              // Descrição do dashboard
  refreshInterval?: number;          // Auto-refresh em ms (0 = desabilitado)
  gridColumns?: number;              // Número de colunas (padrão: 12)
  editable?: boolean;                // Permite edição via UI
  requiresAuth?: boolean;            // Requer autenticação
  requiredPermission?: string;       // Permissão necessária
  theme?: 'default' | 'compact';     // Estilo do dashboard
  fullscreen?: boolean;              // Modo fullscreen disponível
}
```

---

## 6. Configuração de Widget

### Estrutura Base

**SPEC-DASH-WC-001:** Todo widget DEVE ter:
```typescript
{
  id: string;                    // ID único no dashboard
  type: WidgetType;              // Tipo do widget
  title: string;                 // Título exibido
  position: GridPosition;        // Posição no grid
  dataSource: DataSource;        // Fonte de dados (JQEL)
}
```

### Data Source (JQEL)

**SPEC-DASH-WC-002:** DataSource DEVE ser definido como:
```typescript
{
  schema: string;
  operation: 'select';
  entity: string;
  where?: object;
  orderBy?: string[];
  limit?: number;
  output?: string[];
  refreshInterval?: number;      // Override do refresh global
}
```

### Configurações Específicas

**SPEC-DASH-WC-003:** Cada tipo de widget PODE ter configurações adicionais:

#### Metric Card
```typescript
{
  valueField: string;            // Campo do resultado a exibir
  format?: 'number' | 'currency' | 'percentage';
  prefix?: string;               // Ex: "R$"
  suffix?: string;               // Ex: "%"
  icon?: string;                 // Ícone lucide
  trendField?: string;           // Campo para calcular tendência
  trendType?: 'positive-up' | 'negative-up';
}
```

#### Chart (genérico)
```typescript
{
  xField: string;                // Campo do eixo X
  yField: string | string[];     // Campo(s) do eixo Y
  series?: SeriesConfig[];       // Múltiplas séries
  colors?: string[];             // Cores customizadas
  legend?: boolean;              // Mostrar legenda
  grid?: boolean;                // Mostrar grid
}
```

#### Table
```typescript
{
  columns: ColumnConfig[];       // Definição das colunas
  sortable?: boolean;
  filterable?: boolean;
  paginated?: boolean;
  pageSize?: number;
  exportable?: boolean;          // Habilita export (requer Export Components)
}
```

---

## 7. Atualização de Dados

### Polling

**SPEC-DASH-U-001:** Se `refreshInterval` configurado, dashboard DEVE fazer polling via JQEL

**SPEC-DASH-U-002:** Polling DEVE usar TanStack Query com `refetchInterval`

**SPEC-DASH-U-003:** Polling DEVE pausar quando aba do navegador não está visível

### Server-Sent Events

**SPEC-DASH-U-004:** Dashboard PODE escutar Canal de Eventos para updates

**SPEC-DASH-U-005:** Ao receber evento relevante, dashboard DEVE invalidar queries afetadas

### Manual Refresh

**SPEC-DASH-U-006:** Dashboard DEVE fornecer botão de refresh manual

**SPEC-DASH-U-007:** Refresh manual DEVE recarregar dados de todos os widgets

---

## 8. Interatividade

### Drill-Down

**SPEC-DASH-I-001:** Widgets PODEM ter ação de drill-down configurada

**SPEC-DASH-I-002:** Drill-down PODE:
- Navegar para outra rota
- Abrir modal com detalhes
- Aplicar filtro em outro widget
- Executar JQEL mutation

### Filtros Globais

**SPEC-DASH-I-003:** Dashboard PODE ter filtros globais que afetam múltiplos widgets

**SPEC-DASH-I-004:** Filtros DEVEM ser aplicados ao `where` do JQEL de cada widget

**SPEC-DASH-I-005:** Exemplo de filtros globais:
```typescript
{
  filters: [
    {
      id: 'dateRange',
      type: 'dateRange',
      label: 'Período',
      default: 'last30days'
    },
    {
      id: 'status',
      type: 'select',
      label: 'Status',
      options: ['ativo', 'inativo', 'todos']
    }
  ]
}
```

### Cross-Widget Communication

**SPEC-DASH-I-006:** Widgets PODEM se comunicar via eventos

**SPEC-DASH-I-007:** Exemplo: Click em widget A filtra dados do widget B

---

## 9. Modos de Operação

### Modo Visualização

**SPEC-DASH-M-001:** Modo padrão para usuários finais

**SPEC-DASH-M-002:** Widgets são fixos (não movíveis/redimensionáveis)

**SPEC-DASH-M-003:** Dados são atualizados conforme `refreshInterval`

### Modo Edição

**SPEC-DASH-M-004:** Disponível apenas se `editable: true` e usuário tem permissão

**SPEC-DASH-M-005:** Permite:
- Adicionar/remover widgets
- Mover e redimensionar widgets
- Editar configurações de widgets
- Salvar alterações

**SPEC-DASH-M-006:** Alterações DEVEM ser salvas via JQEL

### Modo Fullscreen

**SPEC-DASH-M-007:** Se `fullscreen: true`, dashboard DEVE ter botão para fullscreen

**SPEC-DASH-M-008:** Fullscreen DEVE ocultar navegação do portal

---

## 10. Permissões

**SPEC-DASH-P-001:** Se `requiresAuth: true`, dashboard DEVE verificar autenticação

**SPEC-DASH-P-002:** Se `requiredPermission` definido, DEVE validar via `/api/1/auth/authorize`

**SPEC-DASH-P-003:** Widgets individuais PODEM ter permissões específicas

**SPEC-DASH-P-004:** Widget sem permissão DEVE mostrar placeholder "Sem acesso"

---

## 11. Performance

**SPEC-DASH-PERF-001:** Queries JQEL DEVEM usar cache do TanStack Query

**SPEC-DASH-PERF-002:** Widgets fora da viewport PODEM usar lazy loading

**SPEC-DASH-PERF-003:** Gráficos com muitos pontos DEVEM usar virtualização ou downsampling

**SPEC-DASH-PERF-004:** Dashboard DEVE mostrar skeleton/loading state durante carregamento

---

## 12. Exportação

**SPEC-DASH-EXP-001:** Dashboard PODE ter botão "Exportar Dashboard"

**SPEC-DASH-EXP-002:** Exportação DEVE gerar PDF com snapshot de todos os widgets (requer Export Components)

**SPEC-DASH-EXP-003:** Widgets individuais PODEM ter exportação de dados (CSV, Excel)

---

## 13. Temas e Customização

**SPEC-DASH-T-001:** Dashboard DEVE respeitar tema do portal (claro/escuro)

**SPEC-DASH-T-002:** Gráficos DEVEM usar brand color do portal

**SPEC-DASH-T-003:** Widgets PODEM ter cores customizadas que sobrescrevem padrão

---

## 14. Exemplos de Configuração

### Dashboard Simples (Métricas)
```json
{
  "instanceId": "dash-vendas",
  "title": "Dashboard de Vendas",
  "route": "/app/dashboard/vendas",
  "refreshInterval": 60000,
  "gridColumns": 12,
  "widgets": [
    {
      "id": "metric-receita",
      "type": "metric",
      "title": "Receita Mensal",
      "position": { "x": 0, "y": 0, "w": 3, "h": 2 },
      "dataSource": {
        "schema": "vendas",
        "operation": "select",
        "entity": "receita_mensal"
      },
      "config": {
        "valueField": "total",
        "format": "currency",
        "prefix": "R$",
        "icon": "dollar-sign",
        "trendField": "variacao"
      }
    }
  ]
}
```

### Dashboard com Gráfico
```json
{
  "id": "chart-vendas-tempo",
  "type": "lineChart",
  "title": "Vendas nos Últimos 30 Dias",
  "position": { "x": 0, "y": 2, "w": 8, "h": 4 },
  "dataSource": {
    "schema": "vendas",
    "operation": "select",
    "entity": "vendas_diarias",
    "where": {
      "data": { "$gte": "{{today-30d}}" }
    },
    "orderBy": ["data"]
  },
  "config": {
    "xField": "data",
    "yField": "valor",
    "colors": ["#8b5cf6"],
    "legend": true,
    "grid": true
  }
}
```

### Dashboard com Tabela
```json
{
  "id": "table-top-produtos",
  "type": "table",
  "title": "Top 10 Produtos",
  "position": { "x": 8, "y": 2, "w": 4, "h": 4 },
  "dataSource": {
    "schema": "vendas",
    "operation": "select",
    "entity": "produtos",
    "orderBy": ["vendas:desc"],
    "limit": 10
  },
  "config": {
    "columns": [
      { "field": "nome", "label": "Produto" },
      { "field": "vendas", "label": "Vendas", "format": "number" },
      { "field": "receita", "label": "Receita", "format": "currency" }
    ],
    "sortable": true,
    "exportable": true
  }
}
```

---

*Esta especificação define os requisitos do módulo Dashboard. Implementação técnica em documentação separada.*