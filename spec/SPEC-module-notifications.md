# SPEC-module-notifications.md

## Especificação: Módulo Notifications

### Escopo
Este documento especifica o módulo Notifications, responsável pela interface de visualização e gerenciamento de notificações do sistema recebidas via Canal de Eventos.

---

## 1. Definição

### Propósito
O módulo Notifications fornece interface visual para que usuários visualizem, marquem como lidas e gerenciem notificações passivas enviadas pelo sistema.

### Natureza
- **Tipo**: Módulo de Funcionalidade
- **Dependências**: Nenhuma
- **Opcional**: Sim

---

## 2. Responsabilidades

### SPEC-NOTIF-R-001
O módulo Notifications DEVE fornecer interface para visualização de notificações

### SPEC-NOTIF-R-002
O módulo Notifications DEVE consumir eventos do Canal de Eventos (SSE)

### SPEC-NOTIF-R-003
O módulo Notifications NÃO DEVE lidar com tasks (responsabilidade do módulo Tasks)

### SPEC-NOTIF-R-004
O módulo Notifications DEVE persistir estado via JQEL

---

## 3. Tipos de Notificação

### Categorias

**SPEC-NOTIF-T-001:** Sistema DEVE suportar categorias de notificação:
- `system_info` - Informações do sistema
- `batch_processing` - Processamentos em lote
- `user_action` - Ações de outros usuários
- `milestone` - Marcos alcançados
- `alert` - Alertas importantes
- Outras categorias customizadas

### Prioridades

**SPEC-NOTIF-T-002:** Notificação DEVE ter prioridade:
- `low` - Informativo, não urgente
- `normal` - Padrão (default)
- `high` - Importante, requer atenção

**SPEC-NOTIF-T-003:** Prioridade DEVE afetar visualização (cores, posição, som)

---

## 4. Estrutura de Dados

### Notificação

**SPEC-NOTIF-D-001:** Notificação DEVE ter estrutura:
```typescript
{
  id: string;                    // Identificador único
  userId: string;                // Destinatário
  type: 'notification';          // Tipo fixo
  category: string;              // Categoria da notificação
  priority: 'low' | 'normal' | 'high';
  timestamp: string;             // ISO 8601
  read: boolean;                 // Se foi lida
  readAt?: string;               // Quando foi lida
  data: {                        // Payload customizado
    title?: string;
    message?: string;
    icon?: string;
    url?: string;
    [key: string]: any;
  }
}
```

**SPEC-NOTIF-D-002:** Payload `data` DEVE ser minimalista (metadados apenas)

**SPEC-NOTIF-D-003:** Dados completos DEVEM ser buscados via JQEL se necessário

---

## 5. Componentes de Interface

### Badge/Ícone

**SPEC-NOTIF-UI-001:** Módulo DEVE fornecer ícone de notificações na UI

**SPEC-NOTIF-UI-002:** Ícone DEVE exibir badge com contagem de não-lidas

**SPEC-NOTIF-UI-003:** Badge DEVE desaparecer quando todas forem lidas

**SPEC-NOTIF-UI-004:** Ícone DEVE ser clicável para abrir dropdown ou página

### Dropdown Suspenso

**SPEC-NOTIF-UI-005:** Módulo DEVE fornecer dropdown de acesso rápido

**SPEC-NOTIF-UI-006:** Dropdown DEVE exibir últimas N notificações (padrão: 5)

**SPEC-NOTIF-UI-007:** Dropdown DEVE mostrar preview de cada notificação:
- Ícone/categoria
- Título
- Timestamp relativo (ex: "há 5 minutos")
- Indicador de lida/não-lida

**SPEC-NOTIF-UI-008:** Dropdown DEVE ter link "Ver todas" para página completa

**SPEC-NOTIF-UI-009:** Dropdown DEVE ter ação "Marcar todas como lidas"

### Página Completa

**SPEC-NOTIF-UI-010:** Módulo DEVE fornecer página de listagem completa

**SPEC-NOTIF-UI-011:** Página DEVE listar todas as notificações

**SPEC-NOTIF-UI-012:** Página DEVE ter filtros:
- Por categoria
- Por prioridade
- Por status (lidas/não-lidas)
- Por período

**SPEC-NOTIF-UI-013:** Página DEVE ter paginação ou scroll infinito

**SPEC-NOTIF-UI-014:** Página DEVE ter busca por texto

---

## 6. Funcionalidades Obrigatórias

### Recebimento de Notificações

**SPEC-NOTIF-F-001:** Módulo DEVE escutar Canal de Eventos (SSE)

**SPEC-NOTIF-F-002:** Ao receber evento `type: "notification"`, DEVE:
1. Incrementar badge
2. Adicionar à lista de notificações
3. Exibir toast/snackbar (opcional, configurável)
4. Tocar som (opcional, configurável)

**SPEC-NOTIF-F-003:** Notificações DEVEM ser armazenadas via JQEL

**SPEC-NOTIF-F-004:** Módulo DEVE invalidar queries do TanStack Query ao receber nova notificação

### Marcar como Lida

**SPEC-NOTIF-F-005:** Usuário DEVE poder marcar notificação individual como lida

**SPEC-NOTIF-F-006:** Clicar em notificação DEVE marcar como lida automaticamente

**SPEC-NOTIF-F-007:** Usuário DEVE poder marcar todas como lidas

**SPEC-NOTIF-F-008:** Marcar como lida DEVE:
1. Atualizar via JQEL (`read: true`, `readAt: timestamp`)
2. Decrementar badge
3. Atualizar UI

### Busca de Notificações

**SPEC-NOTIF-F-009:** Módulo DEVE buscar notificações via JQEL na inicialização

**SPEC-NOTIF-F-010:** Query DEVE buscar apenas notificações do usuário logado

**SPEC-NOTIF-F-011:** Query DEVE ordenar por timestamp (mais recentes primeiro)

**SPEC-NOTIF-F-012:** Módulo DEVE usar TanStack Query para cache e invalidação

### Exclusão

**SPEC-NOTIF-F-013:** Usuário PODE deletar notificações individuais

**SPEC-NOTIF-F-014:** Usuário PODE deletar todas as lidas

**SPEC-NOTIF-F-015:** Exclusão DEVE ser via JQEL mutation

---

## 7. Funcionalidades Opcionais

### Toast/Snackbar

**SPEC-NOTIF-O-001:** Módulo PODE exibir toast ao receber notificação

**SPEC-NOTIF-O-002:** Toast DEVE ser configurável por instância

**SPEC-NOTIF-O-003:** Toast DEVE ter timeout (desaparecer automaticamente)

**SPEC-NOTIF-O-004:** Toast PODE ter ações inline (ex: "Ver", "Dispensar")

### Som de Notificação

**SPEC-NOTIF-O-005:** Módulo PODE tocar som ao receber notificação

**SPEC-NOTIF-O-006:** Som DEVE ser configurável (on/off, arquivo)

**SPEC-NOTIF-O-007:** Som DEVE respeitar prioridade (high = som mais forte)

### Notificações do Navegador

**SPEC-NOTIF-O-008:** Módulo PODE usar Notification API do browser

**SPEC-NOTIF-O-009:** DEVE pedir permissão ao usuário primeiro

**SPEC-NOTIF-O-010:** Notificações do browser DEVEM funcionar mesmo com aba em background

### Agrupamento

**SPEC-NOTIF-O-011:** Módulo PODE agrupar notificações similares

**SPEC-NOTIF-O-012:** Exemplo: "5 novas mensagens" em vez de 5 notificações separadas

**SPEC-NOTIF-O-013:** Agrupamento DEVE ser configurável por categoria

### Arquivamento

**SPEC-NOTIF-O-014:** Usuário PODE arquivar notificações em vez de deletar

**SPEC-NOTIF-O-015:** Notificações arquivadas NÃO DEVEM aparecer na lista principal

**SPEC-NOTIF-O-016:** Usuário PODE visualizar arquivadas em seção separada

### Ações Inline

**SPEC-NOTIF-O-017:** Notificação PODE ter ações inline (botões)

**SPEC-NOTIF-O-018:** Exemplo: "Aprovar" / "Rejeitar" diretamente na notificação

**SPEC-NOTIF-O-019:** Ações DEVEM chamar JQEL mutations ou Canal de Agentes

---

## 8. Configuração de Instância

### Parâmetros Obrigatórios

**SPEC-NOTIF-C-001:** Toda instância DEVE configurar:
```typescript
{
  dataSource: {
    schema: string;              // Schema JQEL
    entity: string;              // Entity das notificações
  }
}
```

### Parâmetros Opcionais

**SPEC-NOTIF-C-002:** Instância PODE configurar:
```typescript
{
  ui: {
    position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    badgeColor: string;          // Cor do badge
    maxDropdownItems: number;    // Máx itens no dropdown (default: 5)
  };
  
  behavior: {
    showToast: boolean;          // Exibir toast ao receber
    toastDuration: number;       // Duração do toast (ms)
    playSound: boolean;          // Tocar som
    soundFile?: string;          // URL do arquivo de som
    browserNotifications: boolean; // Usar Notification API
    autoMarkReadOnClick: boolean; // Marcar como lida ao clicar
    groupSimilar: boolean;       // Agrupar similares
  };
  
  features: {
    allowDelete: boolean;        // Permitir deletar
    allowArchive: boolean;       // Permitir arquivar
    allowMarkAllRead: boolean;   // Permitir marcar todas como lidas
    allowInlineActions: boolean; // Permitir ações inline
  };
  
  filters: {
    categories?: string[];       // Categorias disponíveis para filtro
    priorities?: ('low' | 'normal' | 'high')[];
  };
  
  pagination: {
    pageSize: number;            // Itens por página (default: 20)
    mode: 'pagination' | 'infinite'; // Modo de paginação
  };
}
```

---

## 9. Integração com Canal de Eventos

### Escuta de Eventos

**SPEC-NOTIF-E-001:** Módulo DEVE abrir conexão SSE ao inicializar:
```typescript
const eventSource = new EventSource('/api/events/stream', {
  headers: { Authorization: `Bearer ${accessToken}` }
});
```

**SPEC-NOTIF-E-002:** Módulo DEVE escutar eventos com `type: "notification"`

**SPEC-NOTIF-E-003:** Módulo DEVE ignorar eventos com `type: "task"`

### Processamento de Eventos

**SPEC-NOTIF-E-004:** Ao receber evento, módulo DEVE:
```typescript
1. Validar estrutura do evento
2. Adicionar ao estado local (optimistic update)
3. Incrementar badge
4. Exibir toast (se configurado)
5. Tocar som (se configurado)
6. Invalidar query do TanStack Query
7. TanStack Query refaz fetch e sincroniza
```

**SPEC-NOTIF-E-005:** Se conexão SSE cair, módulo DEVE:
1. Tentar reconectar automaticamente
2. Buscar notificações perdidas via JQEL

---

## 10. Integração com JQEL

### Queries

**SPEC-NOTIF-J-001:** Buscar notificações do usuário:
```typescript
{
  schema: config.dataSource.schema,
  operation: 'select',
  entity: config.dataSource.entity,
  where: {
    userId: currentUserId,
    type: 'notification'
  },
  orderBy: ['timestamp:desc'],
  limit: 20
}
```

**SPEC-NOTIF-J-002:** Contar não-lidas:
```typescript
{
  schema: config.dataSource.schema,
  operation: 'select',
  entity: config.dataSource.entity,
  where: {
    userId: currentUserId,
    type: 'notification',
    read: false
  },
  output: ['count']
}
```

### Mutations

**SPEC-NOTIF-J-003:** Marcar como lida:
```typescript
{
  schema: config.dataSource.schema,
  operation: 'mutate',
  entity: config.dataSource.entity,
  action: 'update',
  where: { id: notificationId },
  values: {
    read: true,
    readAt: new Date().toISOString()
  }
}
```

**SPEC-NOTIF-J-004:** Marcar todas como lidas:
```typescript
{
  schema: config.dataSource.schema,
  operation: 'mutate',
  entity: config.dataSource.entity,
  action: 'update',
  where: {
    userId: currentUserId,
    read: false
  },
  values: {
    read: true,
    readAt: new Date().toISOString()
  }
}
```

**SPEC-NOTIF-J-005:** Deletar notificação:
```typescript
{
  schema: config.dataSource.schema,
  operation: 'mutate',
  entity: config.dataSource.entity,
  action: 'delete',
  where: { id: notificationId }
}
```

---

## 11. Componentes Exportados

### Obrigatórios

**SPEC-NOTIF-COMP-001:** Módulo DEVE exportar:
- `<NotificationIcon />` - Ícone com badge
- `<NotificationDropdown />` - Dropdown suspenso
- `<NotificationList />` - Lista completa
- `<NotificationItem />` - Item individual
- `useNotifications()` - Hook para estado

### Opcionais

**SPEC-NOTIF-COMP-002:** Módulo PODE exportar:
- `<NotificationToast />` - Toast de nova notificação
- `<NotificationFilters />` - Barra de filtros
- `<NotificationBell />` - Ícone animado de sino

---

## 12. Estado e Hooks

### Hook useNotifications

**SPEC-NOTIF-H-001:** Hook DEVE expor:
```typescript
{
  notifications: Notification[];     // Lista de notificações
  unreadCount: number;               // Contagem de não-lidas
  isLoading: boolean;                // Se está carregando
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}
```

---

## 13. Visualização por Categoria

**SPEC-NOTIF-V-001:** Categorias DEVEM ter representação visual:
```
system_info       → ícone: Info, cor: azul
batch_processing  → ícone: Loader, cor: roxo
user_action       → ícone: User, cor: verde
milestone         → ícone: Trophy, cor: amarelo
alert             → ícone: AlertTriangle, cor: laranja/vermelho
```

**SPEC-NOTIF-V-002:** Representação DEVE ser configurável por instância

---

## 14. Performance

### Cache

**SPEC-NOTIF-P-001:** Módulo DEVE usar TanStack Query para cache

**SPEC-NOTIF-P-002:** Cache DEVE ser invalidado ao:
- Receber novo evento SSE
- Marcar como lida
- Deletar notificação

### Paginação

**SPEC-NOTIF-P-003:** Lista completa DEVE usar paginação ou scroll infinito

**SPEC-NOTIF-P-004:** Inicial load DEVE buscar apenas primeira página

**SPEC-NOTIF-P-005:** Scroll infinito DEVE carregar próxima página automaticamente

---

## 15. Acessibilidade

**SPEC-NOTIF-A-001:** Badge DEVE ter aria-label com contagem

**SPEC-NOTIF-A-002:** Notificações não-lidas DEVEM ter indicador visual claro

**SPEC-NOTIF-A-003:** Dropdown DEVE ser navegável via teclado

**SPEC-NOTIF-A-004:** Screen readers DEVEM anunciar novas notificações

---

## 16. Exemplos de Uso

### Instância Básica
```json
{
  "instanceId": "user-notifications",
  "moduleId": "notifications",
  "config": {
    "dataSource": {
      "schema": "system",
      "entity": "notification"
    },
    "behavior": {
      "showToast": true,
      "toastDuration": 5000,
      "autoMarkReadOnClick": true
    }
  }
}
```

### Instância com Som e Browser Notifications
```json
{
  "instanceId": "admin-notifications",
  "moduleId": "notifications",
  "config": {
    "dataSource": {
      "schema": "system",
      "entity": "notification"
    },
    "behavior": {
      "showToast": true,
      "playSound": true,
      "soundFile": "/sounds/notification.mp3",
      "browserNotifications": true
    },
    "filters": {
      "categories": ["system_info", "alert"],
      "priorities": ["normal", "high"]
    }
  }
}
```

---

*Esta especificação define os requisitos do módulo Notifications. Implementação técnica em documentação separada.*