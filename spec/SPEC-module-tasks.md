# SPEC-module-tasks.md

## Especificação: Módulo Tasks

### Escopo
Este documento especifica o módulo Tasks, responsável pela interface de usuário para interagir com tarefas (action items) enviadas pelo sistema via Canal de Eventos.

---

## 1. Definição

### Propósito
O módulo Tasks fornece interface visual para visualizar, interagir e responder a tarefas que requerem ação do usuário, enviadas pelo backend/backbone via SSE.

### Natureza
- **Tipo**: Módulo de Funcionalidade
- **Dependências**: App Components (para visualização Kanban), Media Components (para renderização de conteúdo)
- **Opcional**: Sim

### Diferença de Notifications

**SPEC-TASKS-D-001:** Tasks requerem ação do usuário (interativas, com status)

**SPEC-TASKS-D-002:** Notifications são informativas (passivas, sem ação obrigatória)

**SPEC-TASKS-D-003:** Tasks têm ciclo de vida (pending → in_progress → completed/cancelled)

**SPEC-TASKS-D-004:** Notifications são apenas lidas/não-lidas

---

## 2. Responsabilidades

### SPEC-TASKS-R-001
O módulo Tasks DEVE fornecer interface para visualizar tasks recebidas via SSE

### SPEC-TASKS-R-002
O módulo Tasks DEVE permitir interação com tasks (aprovar, rejeitar, responder)

### SPEC-TASKS-R-003
O módulo Tasks DEVE enviar respostas de volta ao backend/backbone

### SPEC-TASKS-R-004
O módulo Tasks DEVE rastrear status das tasks

### SPEC-TASKS-R-005
O módulo Tasks NÃO DEVE implementar lógica de processamento (responsabilidade do backend)

---

## 3. Estrutura de Task

### Payload Mínimo

**SPEC-TASKS-S-001:** Task recebida via SSE DEVE ter estrutura mínima:
```typescript
{
  id: string;                      // ID único da task
  type: 'task';                    // Tipo do evento
  category: string;                // Categoria (email_approval, system_error, etc)
  priority: 'low' | 'normal' | 'high';
  timestamp: string;               // ISO 8601
  userId?: string;                 // Usuário destinatário (opcional se broadcast)
}
```

### Dados Completos

**SPEC-TASKS-S-002:** Dados completos da task DEVEM ser buscados via JQEL:
```typescript
{
  id: string;
  category: string;
  priority: 'low' | 'normal' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  title: string;
  description?: string;
  data: object;                    // Dados específicos da categoria
  actions: TaskAction[];           // Ações disponíveis
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  assignedTo?: string[];
}
```

### Task Actions

**SPEC-TASKS-S-003:** Cada task DEVE definir ações disponíveis:
```typescript
{
  actions: [
    {
      id: string;                  // ID da ação
      label: string;               // Label do botão
      type: 'primary' | 'secondary' | 'danger';
      requiresInput: boolean;      // Requer input do usuário?
      inputSchema?: object;        // Schema do input (JSON Schema)
    }
  ]
}
```

---

## 4. Funcionalidades Obrigatórias

### Ícone de Tasks

**SPEC-TASKS-F-001:** Instância DEVE fornecer ícone/badge no header/navbar

**SPEC-TASKS-F-002:** Badge DEVE exibir contagem de tasks pendentes

**SPEC-TASKS-F-003:** Badge DEVE atualizar em tempo real ao receber novas tasks

**SPEC-TASKS-F-004:** Cor do badge DEVE indicar prioridade máxima:
- `high` → vermelho
- `normal` → azul
- `low` → cinza

### Preview Suspenso

**SPEC-TASKS-F-005:** Ao clicar/hover no ícone, DEVE exibir preview suspenso

**SPEC-TASKS-F-006:** Preview DEVE listar últimas N tasks (padrão: 5)

**SPEC-TASKS-F-007:** Cada item do preview DEVE exibir:
- Título
- Categoria (ícone ou label)
- Prioridade (indicador visual)
- Timestamp relativo ("5 min atrás")

**SPEC-TASKS-F-008:** Preview DEVE ter link "Ver todas" para página completa

### Página de Tasks

**SPEC-TASKS-F-009:** Instância DEVE fornecer rota para página completa de tasks

**SPEC-TASKS-F-010:** Página DEVE ter duas visualizações:
- Lista (padrão)
- Kanban (opcional)

**SPEC-TASKS-F-011:** Página DEVE permitir filtros:
- Status (pending, in_progress, completed, cancelled)
- Categoria
- Prioridade
- Data

**SPEC-TASKS-F-012:** Página DEVE permitir ordenação:
- Data (mais recente/antiga)
- Prioridade (alta/baixa)
- Categoria

### Interação com Task

**SPEC-TASKS-F-013:** Clicar em task DEVE abrir modal/drawer de detalhes

**SPEC-TASKS-F-014:** Detalhes DEVEM exibir:
- Título completo
- Descrição
- Dados específicos (renderizado por categoria)
- Ações disponíveis
- Status atual
- Histórico (opcional)

**SPEC-TASKS-F-015:** Usuário DEVE poder executar ações disponíveis

**SPEC-TASKS-F-016:** Se ação requer input, DEVE exibir formulário baseado em `inputSchema`

**SPEC-TASKS-F-017:** Ao executar ação, DEVE enviar resposta via JQEL

**SPEC-TASKS-F-018:** Após envio, status DEVE atualizar para `in_progress` ou `completed`

---

## 5. Recebimento de Tasks via SSE

### Listener de Eventos

**SPEC-TASKS-E-001:** Módulo DEVE conectar ao Canal de Eventos (SSE)

**SPEC-TASKS-E-002:** Módulo DEVE escutar eventos com `type: "task"`

**SPEC-TASKS-E-003:** Ao receber evento, DEVE:
1. Atualizar badge (+1)
2. Invalidar query TanStack (`tasks.pending`)
3. Exibir notificação toast (opcional)
4. Reproduzir som (opcional)

### Query de Tasks

**SPEC-TASKS-E-004:** Módulo DEVE usar TanStack Query para buscar tasks:
```typescript
useQuery({
  queryKey: ['tasks', status, filters],
  queryFn: () => jqel.query({
    schema: 'system',
    operation: 'select',
    entity: 'tasks',
    where: { status, ...filters },
    orderBy: ['-priority', '-createdAt']
  })
})
```

**SPEC-TASKS-E-005:** Query DEVE ser invalidada ao receber evento SSE

---

## 6. Envio de Respostas

### Mutation

**SPEC-TASKS-R-001:** Ao executar ação, DEVE enviar via JQEL:
```typescript
useMutation({
  mutationFn: (response) => jqel.mutate({
    schema: 'system',
    operation: 'mutate',
    entity: 'task_response',
    action: 'insert',
    values: {
      taskId: task.id,
      actionId: action.id,
      userId: currentUser.id,
      data: response.data,
      timestamp: new Date().toISOString()
    }
  })
})
```

**SPEC-TASKS-R-002:** Backend DEVE processar resposta e atualizar task

**SPEC-TASKS-R-003:** Backend PODE enviar evento SSE de confirmação

### Notificação de Workflows

**SPEC-TASKS-R-004:** Se task foi criada por workflow n8n aguardando resposta, backend DEVE notificar workflow

**SPEC-TASKS-R-005:** Workflow DEVE receber via webhook:
```json
{
  "taskId": "task_123",
  "actionId": "approve",
  "userId": "user_456",
  "data": { ... }
}
```

---

## 7. Visualizações

### Lista (Padrão)

**SPEC-TASKS-V-001:** Visualização em lista DEVE agrupar tasks por status

**SPEC-TASKS-V-002:** Cada grupo DEVE ser colapsável

**SPEC-TASKS-V-003:** Tasks DEVEM ter visual distinto por prioridade:
```
┌─────────────────────────────────────────┐
│ 🔴 [HIGH] Aprovar envio de email        │
│    Campanha Black Friday precisa        │
│    aprovação. 5 min atrás                │
│    [Ver detalhes] [Aprovar] [Rejeitar]  │
├─────────────────────────────────────────┤
│ 🔵 [NORMAL] Validar dados importados    │
│    CSV importado com 3 erros.            │
│    20 min atrás                          │
│    [Ver detalhes]                        │
└─────────────────────────────────────────┘
```

### Kanban (Opcional)

**SPEC-TASKS-V-004:** Visualização Kanban DEVE ter colunas por status:
- Pending
- In Progress
- Completed
- Cancelled

**SPEC-TASKS-V-005:** Tasks DEVEM ser draggable entre colunas

**SPEC-TASKS-V-006:** Drag DEVE atualizar status via JQEL

**SPEC-TASKS-V-007:** Kanban DEVE usar módulo Kanban se disponível

---

## 8. Categorias de Tasks

### Categorias Padrão

**SPEC-TASKS-C-001:** Módulo DEVE suportar categorias comuns:
- `email_approval` - Aprovação de emails
- `system_error` - Erros que precisam decisão
- `data_validation` - Validação de dados
- `manual_review` - Revisão manual necessária
- `configuration_required` - Configuração pendente

### Renderização por Categoria

**SPEC-TASKS-C-002:** Cada categoria PODE ter componente de renderização customizado

**SPEC-TASKS-C-003:** Componente customizado DEVE receber `task.data`

**SPEC-TASKS-C-004:** Se sem componente customizado, DEVE usar renderização genérica

### Exemplo: Email Approval

**SPEC-TASKS-C-005:** Categoria `email_approval` PODE renderizar:
```typescript
<EmailApprovalTask data={{
  subject: "Campanha Black Friday",
  recipients: 5000,
  previewUrl: "https://preview.com/email/789",
  scheduledFor: "2025-11-15T09:00:00Z"
}}>
  <EmailPreview url={data.previewUrl} />
  <TaskActions>
    <Button action="approve">Aprovar Envio</Button>
    <Button action="reject">Rejeitar</Button>
    <Button action="reschedule">Reagendar</Button>
  </TaskActions>
</EmailApprovalTask>
```

---

## 9. Configuração de Instância

### Parâmetros Obrigatórios

**SPEC-TASKS-CFG-001:** Toda instância DEVE configurar:
```typescript
{
  iconPosition: 'header' | 'navbar' | 'custom';
  taskRoute: string;               // Rota da página de tasks
}
```

### Parâmetros Opcionais

**SPEC-TASKS-CFG-002:** Instância PODE configurar:
```typescript
{
  previewSize: number;             // Quantas tasks no preview (padrão: 5)
  defaultView: 'list' | 'kanban';  // Visualização padrão
  enableKanban: boolean;           // Habilitar visualização Kanban
  enableSound: boolean;            // Tocar som ao receber task
  soundUrl?: string;               // URL do som customizado
  enableToast: boolean;            // Exibir toast ao receber task
  autoRefresh: number;             // Auto-refresh (ms, 0 = desabilitado)
  
  categories: {
    [category: string]: {
      icon: string;                // Ícone lucide-react
      color: string;               // Cor do badge
      component?: string;          // Componente customizado
    }
  };
  
  permissions?: {
    canView: string;               // Permissão para visualizar
    canRespond: string;            // Permissão para responder
  };
}
```

---

## 10. Status de Tasks

### Estados

**SPEC-TASKS-ST-001:** Task DEVE ter um dos seguintes status:

**`pending`:**
- Task recebida, aguardando ação do usuário
- Badge conta como pendente

**`in_progress`:**
- Usuário iniciou interação mas não completou
- Exemplo: abriu modal, preenchendo formulário

**`completed`:**
- Usuário completou ação com sucesso
- Não conta mais no badge

**`cancelled`:**
- Task foi cancelada (pelo sistema ou usuário)
- Não conta mais no badge

### Transições

**SPEC-TASKS-ST-002:** Transições válidas:
```
pending → in_progress → completed
pending → cancelled
in_progress → cancelled
```

**SPEC-TASKS-ST-003:** Transições inválidas DEVEM ser rejeitadas

---

## 11. Expiração de Tasks

**SPEC-TASKS-EXP-001:** Task PODE ter `expiresAt` (timestamp)

**SPEC-TASKS-EXP-002:** Task expirada DEVE ser marcada visualmente

**SPEC-TASKS-EXP-003:** Task expirada PODE ser automaticamente cancelada

**SPEC-TASKS-EXP-004:** Timer visual PODE exibir tempo restante

**SPEC-TASKS-EXP-005:** Exemplo:
```
┌─────────────────────────────────────────┐
│ ⏰ Expira em 15 minutos                 │
│ 🔴 [HIGH] Aprovar envio de email        │
│    ...                                   │
└─────────────────────────────────────────┘
```

---

## 12. Delegação de Tasks

**SPEC-TASKS-DEL-001:** Task PODE ser atribuída a múltiplos usuários

**SPEC-TASKS-DEL-002:** Qualquer usuário atribuído PODE responder

**SPEC-TASKS-DEL-003:** Primeira resposta PODE automaticamente completar task

**SPEC-TASKS-DEL-004:** Usuário PODE reatribuir task a outro usuário (se permitido)

---

## 13. Histórico e Auditoria

**SPEC-TASKS-AUD-001:** Task PODE ter histórico de ações:
```typescript
{
  history: [
    {
      timestamp: string;
      userId: string;
      action: string;
      data?: object;
    }
  ]
}
```

**SPEC-TASKS-AUD-002:** Histórico DEVE ser exibido no modal de detalhes

**SPEC-TASKS-AUD-003:** Histórico DEVE incluir:
- Criação da task
- Visualizações
- Mudanças de status
- Respostas/ações executadas

---

## 14. Performance

### Lazy Loading

**SPEC-TASKS-PERF-001:** Lista de tasks DEVE usar paginação ou infinite scroll

**SPEC-TASKS-PERF-002:** Página inicial DEVE carregar apenas tasks pendentes

**SPEC-TASKS-PERF-003:** Tasks antigas (>30 dias) PODEM ser arquivadas automaticamente

### Optimistic Updates

**SPEC-TASKS-PERF-004:** Executar ação DEVE usar optimistic update

**SPEC-TASKS-PERF-005:** UI DEVE atualizar imediatamente, antes da resposta

**SPEC-TASKS-PERF-006:** Se falhar, DEVE reverter e exibir erro

---

## 15. Acessibilidade

**SPEC-TASKS-A11Y-001:** Badge DEVE ter aria-label com contagem

**SPEC-TASKS-A11Y-002:** Preview DEVE ser navegável via teclado

**SPEC-TASKS-A11Y-003:** Modal de detalhes DEVE ter foco apropriado

**SPEC-TASKS-A11Y-004:** Screen readers DEVEM anunciar novas tasks

---

## 16. Exemplos de Uso

### Instância Básica
```json
{
  "instanceId": "tasks-main",
  "moduleId": "tasks",
  "config": {
    "iconPosition": "header",
    "taskRoute": "/tasks",
    "previewSize": 5,
    "defaultView": "list",
    "enableSound": true,
    "enableToast": true
  }
}
```

### Instância com Kanban
```json
{
  "instanceId": "tasks-admin",
  "moduleId": "tasks",
  "config": {
    "iconPosition": "navbar",
    "taskRoute": "/admin/tasks",
    "defaultView": "kanban",
    "enableKanban": true,
    "categories": {
      "email_approval": {
        "icon": "mail-check",
        "color": "#3b82f6"
      },
      "system_error": {
        "icon": "alert-triangle",
        "color": "#ef4444"
      }
    }
  }
}
```

---

*Esta especificação define os requisitos do módulo Tasks. Implementação técnica em documentação separada.*