# SPEC-module-kanban.md

## Especificação: Módulo Kanban

### Escopo
Este documento especifica o módulo Kanban, responsável por fornecer quadros Kanban com drag-and-drop para organização visual de tarefas e itens.

---

## 1. Definição

### Propósito
O módulo Kanban fornece interface visual para organização de itens em colunas, com suporte a drag-and-drop, filtros, visualizações customizadas e persistência via JQEL.

### Natureza
- **Tipo**: Módulo de Funcionalidade
- **Dependências**: App Components (dnd-kit)
- **Opcional**: Sim

---

## 2. Responsabilidades

### SPEC-KANBAN-R-001
O módulo Kanban DEVE fornecer quadros visuais com colunas e cards

### SPEC-KANBAN-R-002
O módulo Kanban DEVE permitir drag-and-drop de cards entre colunas

### SPEC-KANBAN-R-003
O módulo Kanban DEVE persistir mudanças via JQEL

### SPEC-KANBAN-R-004
O módulo Kanban PODE criar múltiplas instâncias com diferentes configurações

---

## 3. Estrutura de Dados

### Colunas

**SPEC-KANBAN-D-001:** Toda instância DEVE ter uma ou mais colunas

**SPEC-KANBAN-D-002:** Coluna DEVE ter:
```typescript
{
  id: string;                    // Identificador único
  title: string;                 // Título visível
  color?: string;                // Cor da coluna (hex)
  order: number;                 // Ordem de exibição
  limit?: number;                // Limite de cards (WIP limit)
  collapsible?: boolean;         // Pode ser colapsada
}
```

**SPEC-KANBAN-D-003:** Colunas DEVEM ser ordenáveis

**SPEC-KANBAN-D-004:** Ordem das colunas DEVE ser persistida via JQEL

### Cards

**SPEC-KANBAN-D-005:** Card DEVE ter estrutura mínima:
```typescript
{
  id: string;                    // Identificador único
  columnId: string;              // Coluna atual
  title: string;                 // Título do card
  order: number;                 // Ordem dentro da coluna
}
```

**SPEC-KANBAN-D-006:** Card PODE ter campos adicionais customizados

**SPEC-KANBAN-D-007:** Estrutura de campos customizados DEVE ser definida na configuração da instância

---

## 4. Funcionalidades Obrigatórias

### Visualização

**SPEC-KANBAN-F-001:** Instância DEVE exibir colunas horizontalmente

**SPEC-KANBAN-F-002:** Cada coluna DEVE exibir seus cards verticalmente

**SPEC-KANBAN-F-003:** Cards DEVEM ser scrollable dentro da coluna

**SPEC-KANBAN-F-004:** Board completo DEVE ser scrollable horizontalmente

### Drag and Drop

**SPEC-KANBAN-F-005:** Usuário DEVE poder arrastar cards entre colunas

**SPEC-KANBAN-F-006:** Usuário DEVE poder reordenar cards dentro da mesma coluna

**SPEC-KANBAN-F-007:** Durante drag, DEVE exibir preview visual do card

**SPEC-KANBAN-F-008:** Ao drop, DEVE atualizar posição via JQEL imediatamente

**SPEC-KANBAN-F-009:** Se atualização falhar, DEVE reverter posição e exibir erro

### CRUD de Cards

**SPEC-KANBAN-F-010:** Instância DEVE permitir criar novo card

**SPEC-KANBAN-F-011:** Criação DEVE especificar coluna de destino

**SPEC-KANBAN-F-012:** Instância DEVE permitir editar card existente

**SPEC-KANBAN-F-013:** Instância DEVE permitir deletar card

**SPEC-KANBAN-F-014:** Todas as operações DEVEM persistir via JQEL

### Carregamento de Dados

**SPEC-KANBAN-F-015:** Instância DEVE carregar dados via JQEL na inicialização

**SPEC-KANBAN-F-016:** Carregamento DEVE buscar colunas e cards em queries separadas ou única

**SPEC-KANBAN-F-017:** Durante carregamento, DEVE exibir skeleton ou loading state

---

## 5. Funcionalidades Opcionais

### WIP Limit

**SPEC-KANBAN-O-001:** Coluna PODE ter limite de cards (Work In Progress limit)

**SPEC-KANBAN-O-002:** Se WIP limit atingido, DEVE impedir drop de novos cards

**SPEC-KANBAN-O-003:** DEVE exibir indicador visual quando próximo ou acima do limite

### Filtros

**SPEC-KANBAN-O-004:** Instância PODE fornecer filtros de cards

**SPEC-KANBAN-O-005:** Filtros PODEM ser por:
- Texto (busca em título/descrição)
- Tags/Labels
- Assignee (responsável)
- Data/Prazo
- Campos customizados

**SPEC-KANBAN-O-006:** Filtros DEVEM ser aplicados client-side após carregamento

**SPEC-KANBAN-O-007:** Filtros ativos DEVEM ser visualmente indicados

### Agrupamento

**SPEC-KANBAN-O-008:** Instância PODE agrupar cards dentro de colunas

**SPEC-KANBAN-O-009:** Agrupamento PODE ser por:
- Assignee
- Prioridade
- Tags
- Campos customizados

**SPEC-KANBAN-O-010:** Grupos DEVEM ser colapsáveis

### Swimlanes

**SPEC-KANBAN-O-011:** Instância PODE exibir swimlanes horizontais

**SPEC-KANBAN-O-012:** Swimlane agrupa linhas completas de colunas

**SPEC-KANBAN-O-013:** Exemplo: Swimlane por projeto, cada projeto tem suas colunas

### Visualizações Alternativas

**SPEC-KANBAN-O-014:** Instância PODE oferecer visualização de lista

**SPEC-KANBAN-O-015:** Instância PODE oferecer visualização de calendário

**SPEC-KANBAN-O-016:** Instância PODE oferecer visualização de timeline/roadmap

**SPEC-KANBAN-O-017:** Mudança de visualização NÃO DEVE recarregar dados

### Arquivamento

**SPEC-KANBAN-O-018:** Cards PODEM ser arquivados em vez de deletados

**SPEC-KANBAN-O-019:** Cards arquivados NÃO DEVEM aparecer no board

**SPEC-KANBAN-O-020:** Instância PODE fornecer visualização de cards arquivados

**SPEC-KANBAN-O-021:** Cards arquivados PODEM ser restaurados

### Automações

**SPEC-KANBAN-O-022:** Mudança de coluna PODE disparar automação via n8n

**SPEC-KANBAN-O-023:** Exemplo: Card movido para "Done" → enviar notificação

**SPEC-KANBAN-O-024:** Automação DEVE ser configurada via webhook n8n

---

## 6. Configuração de Instância

### Parâmetros Obrigatórios

**SPEC-KANBAN-C-001:** Toda instância DEVE configurar:
```typescript
{
  dataSource: {
    schema: string;              // Schema JQEL
    columnsEntity: string;       // Entity das colunas
    cardsEntity: string;         // Entity dos cards
  }
}
```

### Parâmetros Opcionais

**SPEC-KANBAN-C-002:** Instância PODE configurar:
```typescript
{
  title: string;                 // Título do board
  description?: string;          // Descrição
  
  columns: {
    allowReorder: boolean;       // Permitir reordenar colunas
    allowCreate: boolean;        // Permitir criar colunas
    allowEdit: boolean;          // Permitir editar colunas
    allowDelete: boolean;        // Permitir deletar colunas
  };
  
  cards: {
    allowCreate: boolean;
    allowEdit: boolean;
    allowDelete: boolean;
    allowArchive: boolean;
    customFields: CustomField[]; // Campos adicionais
    template?: string;           // Template do card
  };
  
  features: {
    enableWipLimit: boolean;
    enableFilters: boolean;
    enableGrouping: boolean;
    enableSwimlanes: boolean;
    enableArchive: boolean;
    enableAutomations: boolean;
  };
  
  views: {
    default: 'board' | 'list' | 'calendar';
    available: ('board' | 'list' | 'calendar' | 'timeline')[];
  };
  
  permissions?: {
    canView: string;             // Permissão para visualizar
    canEdit: string;             // Permissão para editar
    canManage: string;           // Permissão para gerenciar
  };
}
```

---

## 7. Integração com JQEL

### Queries Necessárias

**SPEC-KANBAN-J-001:** Instância DEVE executar ao carregar:
```typescript
// Buscar colunas
{
  schema: config.dataSource.schema,
  operation: 'select',
  entity: config.dataSource.columnsEntity,
  orderBy: ['order']
}

// Buscar cards
{
  schema: config.dataSource.schema,
  operation: 'select',
  entity: config.dataSource.cardsEntity,
  orderBy: ['columnId', 'order']
}
```

### Mutations Necessárias

**SPEC-KANBAN-J-002:** Ao mover card, DEVE executar:
```typescript
{
  schema: config.dataSource.schema,
  operation: 'mutate',
  entity: config.dataSource.cardsEntity,
  action: 'update',
  where: { id: cardId },
  values: {
    columnId: newColumnId,
    order: newOrder
  }
}
```

**SPEC-KANBAN-J-003:** Ao criar card, DEVE executar:
```typescript
{
  schema: config.dataSource.schema,
  operation: 'mutate',
  entity: config.dataSource.cardsEntity,
  action: 'insert',
  values: {
    columnId: targetColumnId,
    title: cardTitle,
    order: nextOrder,
    ...customFields
  }
}
```

---

## 8. Componentes Exportados

### Obrigatórios

**SPEC-KANBAN-E-001:** Módulo DEVE exportar:
- `<KanbanBoard />` - Board completo
- `<KanbanColumn />` - Coluna individual
- `<KanbanCard />` - Card individual

### Opcionais

**SPEC-KANBAN-E-002:** Módulo PODE exportar:
- `<KanbanFilters />` - Barra de filtros
- `<KanbanCreateCard />` - Formulário de criação
- `<KanbanCardModal />` - Modal de detalhes do card
- `<KanbanListView />` - Visualização em lista
- `<KanbanCalendarView />` - Visualização em calendário

---

## 9. Customização de Cards

### Template de Card

**SPEC-KANBAN-T-001:** Card PODE usar template customizado

**SPEC-KANBAN-T-002:** Template DEVE ter acesso a todos os campos do card

**SPEC-KANBAN-T-003:** Template padrão DEVE exibir:
- Título
- Ícone de prioridade (se configurado)
- Avatar de assignee (se configurado)
- Tags/Labels (se configurados)

### Campos Customizados

**SPEC-KANBAN-T-004:** Instância PODE definir campos customizados:
```typescript
{
  customFields: [
    {
      name: 'priority',
      type: 'select',
      options: ['high', 'medium', 'low'],
      label: 'Prioridade',
      showInCard: true
    },
    {
      name: 'assignee',
      type: 'user',
      label: 'Responsável',
      showInCard: true
    },
    {
      name: 'dueDate',
      type: 'date',
      label: 'Prazo',
      showInCard: true
    },
    {
      name: 'tags',
      type: 'multiselect',
      options: ['bug', 'feature', 'improvement'],
      label: 'Tags',
      showInCard: true
    }
  ]
}
```

**SPEC-KANBAN-T-005:** Campos com `showInCard: true` DEVEM aparecer no card

**SPEC-KANBAN-T-006:** Campos customizados DEVEM ser editáveis no modal de detalhes

---

## 10. Performance

### Lazy Loading

**SPEC-KANBAN-P-001:** Se board tem muitos cards (>100), PODE usar lazy loading

**SPEC-KANBAN-P-002:** Lazy loading DEVE carregar cards visíveis primeiro

**SPEC-KANBAN-P-003:** Scroll DEVE carregar mais cards conforme necessário

### Virtualização

**SPEC-KANBAN-P-004:** Colunas com muitos cards PODEM usar virtualização (react-virtual)

**SPEC-KANBAN-P-005:** Virtualização DEVE renderizar apenas cards visíveis no viewport

### Optimistic Updates

**SPEC-KANBAN-P-006:** Drag-and-drop DEVE usar optimistic update

**SPEC-KANBAN-P-007:** UI DEVE atualizar imediatamente, antes da resposta do servidor

**SPEC-KANBAN-P-008:** Se mutation falhar, DEVE reverter mudança visual

---

## 11. Acessibilidade

**SPEC-KANBAN-A-001:** Board DEVE ser navegável via teclado

**SPEC-KANBAN-A-002:** Cards DEVEM ser focáveis (Tab)

**SPEC-KANBAN-A-003:** Drag-and-drop DEVE ter alternativa de teclado

**SPEC-KANBAN-A-004:** Screen readers DEVEM anunciar mudanças de coluna

**SPEC-KANBAN-A-005:** Cores NÃO DEVEM ser única forma de transmitir informação

---

## 12. Responsividade

**SPEC-KANBAN-R-001:** Em telas pequenas (<768px), colunas DEVEM empilhar verticalmente

**SPEC-KANBAN-R-002:** Em mobile, drag-and-drop PODE ser substituído por menu de ações

**SPEC-KANBAN-R-003:** Filtros DEVEM colapsar em drawer em telas pequenas

---

## 13. Exemplos de Uso

### Instância Básica (Task Board)
```json
{
  "instanceId": "tasks-dev-team",
  "moduleId": "kanban",
  "config": {
    "title": "Dev Team Tasks",
    "dataSource": {
      "schema": "app",
      "columnsEntity": "task_column",
      "cardsEntity": "task"
    },
    "cards": {
      "allowCreate": true,
      "allowEdit": true,
      "allowDelete": true,
      "customFields": [
        {
          "name": "assignee",
          "type": "user",
          "label": "Assignee",
          "showInCard": true
        },
        {
          "name": "priority",
          "type": "select",
          "options": ["high", "medium", "low"],
          "label": "Priority",
          "showInCard": true
        }
      ]
    }
  }
}
```

### Instância com Swimlanes (Multi-Projeto)
```json
{
  "instanceId": "projects-overview",
  "moduleId": "kanban",
  "config": {
    "title": "Projects Overview",
    "dataSource": {
      "schema": "app",
      "columnsEntity": "project_stage",
      "cardsEntity": "project"
    },
    "features": {
      "enableSwimlanes": true,
      "enableWipLimit": true
    },
    "cards": {
      "customFields": [
        {
          "name": "client",
          "type": "string",
          "label": "Cliente",
          "showInCard": true
        },
        {
          "name": "deadline",
          "type": "date",
          "label": "Deadline",
          "showInCard": true
        }
      ]
    },
    "views": {
      "default": "board",
      "available": ["board", "timeline"]
    }
  }
}
```

---

*Esta especificação define os requisitos do módulo Kanban. Implementação técnica em documentação separada.*