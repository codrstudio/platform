# UI/UX Design: Módulo Task

## Especificação de Interfaces do Módulo Task

### Escopo
Este documento define a arquitetura de interface e padrões de UI/UX para o módulo Task, um sistema de gerenciamento de tarefas com suporte a múltiplas visualizações (lista, kanban, timeline). Baseado em SPEC-concepts.md e SPEC-architecture.md.

---

## 1. Arquitetura de Navegação

### 1.1 Estrutura Hierárquica

```
┌─────────────────────────────────────────────────────────┐
│  PLATAFORMA                                             │
│  └── Portal: [qualquer] (/portal)                      │
│      └── Módulo: task (instância: [instanceId])       │
│          ├── Lista de Tarefas (/)                      │
│          ├── Kanban Board (/kanban)                    │
│          ├── Timeline (/timeline)                      │
│          ├── Criar Tarefa (/new)                       │
│          ├── Editar Tarefa (/:taskId/edit)            │
│          └── Detalhes (:taskId)                        │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Padrões de Navegação Adotados

**Multi-View Pattern**: Múltiplas visualizações dos mesmos dados
- Toggle entre lista, kanban, timeline
- Filtros e buscas compartilhados entre views
- Estado de filtro persistido ao trocar views

**Quick Actions**: Ações rápidas em cards
- Marcar como completo (checkbox)
- Editar inline (click no título)
- Menu de ações (3 pontos)
- Drag & drop (kanban)

**Modal vs Navigation**:
- **Modal**: Criar tarefa rápida, confirmar exclusão
- **Navigation**: Editar tarefa completa, detalhes expandidos

---

## 2. Lista de Tarefas

### 2.1 Wireframe

```
┌────────────────────────────────────────────────────────────────┐
│  [≡] Tarefas                     [Lista] [Kanban] [Timeline]   │
│                                  [🔍 Buscar]  [+ Nova Tarefa]  │
├────────────────────────────────────────────────────────────────┤
│  [Filtros ▾] [Status ▾] [Prioridade ▾] [Responsável ▾]        │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  [ ] Implementar autenticação                         [⋮] │ │
│  │  ────────────────────────────────────────────────────────  │ │
│  │  🔴 Alta  │  📅 Amanhã  │  👤 João Silva                  │ │
│  │  #auth #backend                                           │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  [✓] Criar componentes de UI                         [⋮] │ │
│  │  ────────────────────────────────────────────────────────  │ │
│  │  🟢 Baixa  │  ✓ Concluído  │  👤 Maria Santos            │ │
│  │  #ui #frontend                                            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  [ ] Revisar documentação                            [⋮] │ │
│  │  ────────────────────────────────────────────────────────  │ │
│  │  🟡 Média  │  📅 Próxima semana  │  👤 Não atribuído      │ │
│  │  #docs                                                    │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  [Mostrando 3 de 12 tarefas]  [Carregar mais]                │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 2.2 Componentes

**Header com View Switcher**:
- Toggle buttons: Lista | Kanban | Timeline
- Active view: destaque visual (border bottom ou background)
- Busca global de tarefas
- Botão "Nova Tarefa" (primário)

**Barra de Filtros**:
- Dropdown: Filtros (Todas, Minhas, Delegadas, Sem responsável)
- Dropdown: Status (Todas, Pendente, Em progresso, Concluído, Cancelado)
- Dropdown: Prioridade (Todas, Alta, Média, Baixa)
- Dropdown: Responsável (Todos, + lista de usuários)
- Badge de contador: quantos filtros ativos

**Card de Tarefa**:
- Checkbox: marcar/desmarcar completo
- Título: clicável (navega para detalhes)
- Indicador de prioridade: 🔴 Alta, 🟡 Média, 🟢 Baixa
- Data: prazo relativo ("Hoje", "Amanhã", "Atrasado")
- Responsável: avatar + nome
- Tags: badges coloridos
- Menu ações: editar, duplicar, arquivar, deletar

**Estados de Checkbox**:
- `[ ]` - Pendente (unchecked)
- `[✓]` - Concluído (checked, texto com line-through)
- `[⋯]` - Em progresso (indeterminate state)

### 2.3 Interações

**Marcar como Completo**:
- Click no checkbox: toggle status
- Animação: fade out + line-through (se filtro não incluir concluídos)
- Toast: "Tarefa marcada como concluída" com botão "Desfazer"

**Click no Título**:
- Navega para página de detalhes
- Preserva contexto de filtros (query params)

**Drag & Drop** (opcional na lista):
- Arrastar card para reordenar
- Visual: elevação + placeholder
- Salva ordem customizada

**Busca**:
- Debounce de 300ms
- Busca em: título, descrição, tags
- Highlight de termos encontrados

---

## 3. Kanban Board

### 3.1 Wireframe

```
┌────────────────────────────────────────────────────────────────┐
│  [≡] Tarefas                     [Lista] [Kanban] [Timeline]   │
│                                  [🔍 Buscar]  [+ Nova Tarefa]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────┐│
│  │ 📋 Pendente  │ │ 🔄 Progresso │ │ ✓ Concluído  │ │🗑️ Canc││
│  │     (3)      │ │     (2)      │ │     (5)      │ │   (1) ││
│  ├──────────────┤ ├──────────────┤ ├──────────────┤ ├───────┤│
│  │              │ │              │ │              │ │       ││
│  │ ┌──────────┐ │ │ ┌──────────┐ │ │ ┌──────────┐ │ │ ┌────││
│  │ │[  ]      │ │ │ │[⋯]       │ │ │ │[✓]       │ │ │ │[✗] ││
│  │ │Implement │ │ │ │Criar UI  │ │ │ │Revisar   │ │ │ │Bug ││
│  │ │auth      │ │ │ │components│ │ │ │docs      │ │ │ │fix ││
│  │ │          │ │ │ │          │ │ │ │          │ │ │ │    ││
│  │ │🔴 Alta   │ │ │ │🟡 Média  │ │ │ │🟢 Baixa  │ │ │ │🔴  ││
│  │ │📅 Amanhã │ │ │ │👤 Maria  │ │ │ │👤 João   │ │ │ │    ││
│  │ │👤 João   │ │ │ │          │ │ │ │          │ │ │ │    ││
│  │ └──────────┘ │ │ └──────────┘ │ │ └──────────┘ │ │ └────││
│  │              │ │              │ │              │ │       ││
│  │ ┌──────────┐ │ │ ┌──────────┐ │ │ ┌──────────┐ │ │       ││
│  │ │[  ] ...  │ │ │ │[⋯] ...   │ │ │ │[✓] ...   │ │ │       ││
│  │ └──────────┘ │ │ └──────────┘ │ │ └──────────┘ │ │       ││
│  │              │ │              │ │              │ │       ││
│  │ [+ Tarefa]   │ │ [+ Tarefa]   │ │              │ │       ││
│  └──────────────┘ └──────────────┘ └──────────────┘ └───────┘│
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 3.2 Componentes

**Colunas de Status**:
- Título + ícone semântico
- Contador de tarefas
- Cor de destaque sutil (border top)
- Área de drop zone (highlight ao arrastar)

**Status Padrão**:
- 📋 Pendente (to-do)
- 🔄 Em Progresso (in-progress)
- ✓ Concluído (done)
- 🗑️ Cancelado (cancelled)

**Card de Tarefa Kanban**:
- Versão compacta do card de lista
- Checkbox: status inline
- Título + descrição (truncada)
- Prioridade + prazo + responsável
- Drag handle: cursor grab
- Tags: máximo 2 visíveis, + contador

**Botão "Nova Tarefa" por Coluna**:
- No bottom de cada coluna
- Cria tarefa já com status da coluna
- Modal quick-create

### 3.3 Interações

**Drag & Drop**:
```
Arrastar tarefa entre colunas:
1. Pegar card (cursor: grabbing)
2. Mover sobre coluna (coluna destaca)
3. Drop (card move + API update)
4. Animação: slide para nova posição
5. Toast: "Tarefa movida para [Status]" com "Desfazer"
```

**Reordenar dentro da Coluna**:
- Arrastar acima/abaixo de outros cards
- Placeholder: linha azul indica posição
- Persiste ordem customizada

**Quick Create**:
```
┌────────────────────────────────┐
│  Nova Tarefa Pendente          │
├────────────────────────────────┤
│  Título *                      │
│  ┌──────────────────────────┐  │
│  │                          │  │
│  └──────────────────────────┘  │
│                                │
│  Responsável                   │
│  ┌──────────────────────────┐  │
│  │  João Silva         [▾]  │  │
│  └──────────────────────────┘  │
│                                │
│  [Cancelar]     [Criar Tarefa]│
└────────────────────────────────┘
```

**Limitações de Coluna** (opcional):
- Work In Progress (WIP) limit
- Aviso visual se exceder limite
- Bloqueia drop se WIP excedido

---

## 4. Timeline View

### 4.1 Wireframe

```
┌────────────────────────────────────────────────────────────────┐
│  [≡] Tarefas                     [Lista] [Kanban] [Timeline]   │
│                                  [🔍 Buscar]  [+ Nova Tarefa]  │
├────────────────────────────────────────────────────────────────┤
│  [Hoje] [Semana] [Mês]                         [◀ Nov 2025 ▶] │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│       Segunda    Terça    Quarta    Quinta    Sexta           │
│          4         5        6         7         8             │
│  ──────────────────────────────────────────────────────────────│
│  João  │         │ ■■■■■  │         │         │               │
│        │         │ Auth   │         │         │               │
│  ──────┼─────────┼────────┼─────────┼─────────┼───────────────│
│  Maria │ ■■■■    │ ■■■■■■ │         │         │               │
│        │ UI Comp │ Review │         │         │               │
│  ──────┼─────────┼────────┼─────────┼─────────┼───────────────│
│  Pedro │         │         │         │ ■■      │               │
│        │         │         │         │ Tests  │               │
│  ──────┴─────────┴────────┴─────────┴─────────┴───────────────│
│                                                                │
│  Legenda:  ■ Pendente  ■ Em Progresso  ■ Concluído           │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 4.2 Componentes

**Seletor de Período**:
- Tabs: Hoje | Semana | Mês
- Navegação: setas ◀ ▶
- Label de período atual

**Grade de Timeline**:
- Eixo X: dias da semana/mês
- Eixo Y: responsáveis
- Células: tarefas posicionadas por prazo
- Cores por status

**Barra de Tarefa**:
- Largura: duração estimada (se disponível)
- Cor: status (pendente, progresso, concluído)
- Texto: título truncado
- Tooltip: detalhes completos

**Agrupamento**:
- Por responsável (padrão)
- Por projeto (se disponível)
- Por prioridade

### 4.3 Interações

**Hover em Barra**:
```
┌────────────────────────────────┐
│  Implementar autenticação      │
│  ────────────────────────────  │
│  Status: Em progresso          │
│  Prioridade: Alta              │
│  Prazo: 06/11/2025             │
│  Responsável: João Silva       │
│                                │
│  [Abrir] [Editar]              │
└────────────────────────────────┘
```

**Click em Barra**:
- Navega para detalhes da tarefa
- OU abre modal inline com actions

**Drag na Timeline** (opcional):
- Arrastar barra horizontalmente: altera prazo
- Visual: nova posição com outline

---

## 5. Criar/Editar Tarefa

### 5.1 Wireframe (Modal Rápido)

```
┌────────────────────────────────────────────────────────────────┐
│  Nova Tarefa                                        [× Fechar] │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Título *                                                      │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Implementar autenticação JWT                            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  Descrição                                                     │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Criar sistema de login com tokens JWT, incluindo       │ │
│  │  refresh tokens e validação de permissões.              │ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────┐ │
│  │ Status          │  │ Prioridade      │  │ Prazo         │ │
│  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌───────────┐ │ │
│  │ │ Pendente [▾]│ │  │ │ Alta    [▾]│ │  │ │06/11/2025│ │ │
│  │ └─────────────┘ │  │ └─────────────┘ │  │ └───────────┘ │ │
│  └─────────────────┘  └─────────────────┘  └───────────────┘ │
│                                                                │
│  Responsável                                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  João Silva                                         [▾]  │ │
│  └──────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  João Silva                                              │ │
│  │  Maria Santos                                            │ │
│  │  Pedro Oliveira                                          │ │
│  │  [Não atribuído]                                         │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  Tags                                                          │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  [auth ×] [backend ×] [+ Adicionar]                      │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  [Cancelar]                          [Criar Tarefa]           │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 5.2 Wireframe (Página Completa)

```
┌────────────────────────────────────────────────────────────────┐
│  [←] Editar Tarefa                                             │
├────────────────────────────────────────────────────────────────┤
│  Home > Tarefas > Implementar autenticação                     │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Informações Básicas                                     │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │                                                          │ │
│  │  Título *                                                │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │  Implementar autenticação JWT                      │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  │                                                          │ │
│  │  Descrição                                               │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │  [B] [I] [Link] [Lista]                            │ │ │
│  │  │  ────────────────────────────────────────────────  │ │ │
│  │  │  Criar sistema de login com tokens JWT, incluindo │ │ │
│  │  │  refresh tokens e validação de permissões.        │ │ │
│  │  │                                                    │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  │  Editor de texto rico (Markdown ou TipTap)             │ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Configurações                                           │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │                                                          │ │
│  │  Status                  Prioridade            Prazo    │ │
│  │  ┌────────────┐          ┌────────────┐      ┌───────┐ │ │
│  │  │ Progresso▾ │          │ Alta    ▾  │      │06/11  │ │ │
│  │  └────────────┘          └────────────┘      └───────┘ │ │
│  │                                                          │ │
│  │  Responsável                                             │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │  João Silva                                   [▾]  │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  │                                                          │ │
│  │  Tags                                                    │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │  [auth ×] [backend ×] [+ Adicionar]                │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  │                                                          │ │
│  │  Estimativa de Tempo (horas)                            │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │  8                                                  │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Anexos                                                  │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │  [📎 design-mockup.png] [🗑️]                            │ │
│  │  [📎 requirements.pdf] [🗑️]                             │ │
│  │                                                          │ │
│  │  [📤 Upload arquivo] ou arraste aqui                    │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Subtarefas                                              │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │  [✓] Criar endpoint de login                            │ │
│  │  [ ] Implementar refresh tokens                         │ │
│  │  [ ] Adicionar validação de permissões                  │ │
│  │                                                          │ │
│  │  [+ Adicionar subtarefa]                                │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  [Deletar]  [Cancelar]                     [Salvar Alterações]│
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 5.3 Componentes

**Título**:
- Input text
- Obrigatório
- Max 200 caracteres
- Validação inline

**Descrição**:
- Modal rápido: Textarea simples
- Página completa: Editor rico (Markdown ou TipTap)
- Suporte a formatação, links, listas

**Status**:
- Dropdown: Pendente, Em Progresso, Concluído, Cancelado
- Cor semântica por status

**Prioridade**:
- Dropdown: Baixa 🟢, Média 🟡, Alta 🔴
- Visual: ícone + cor

**Prazo**:
- Date picker
- Opcional
- Feedback visual: hoje, atrasado, próximo

**Responsável**:
- Dropdown com busca
- Avatar + nome
- Opção: "Não atribuído"

**Tags**:
- Input com autocomplete
- Criar tag on-the-fly
- Remover tag: click no ×
- Badge colorido

**Estimativa de Tempo** (opcional):
- Input number (horas)
- Para tracking de tempo

**Anexos** (página completa):
- Upload área: drag & drop ou click
- Lista de arquivos anexados
- Remover anexo individual

**Subtarefas** (página completa):
- Lista de checkboxes
- Adicionar/remover subtarefas
- Progresso: X de Y concluídas

### 5.4 Validação

**Client-side (Zod)**:
```typescript
const taskSchema = z.object({
  title: z.string()
    .min(1, "Título é obrigatório")
    .max(200, "Título muito longo"),
  description: z.string().optional(),
  status: z.enum(["pending", "in-progress", "done", "cancelled"]),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.date().optional(),
  assigneeId: z.string().optional(),
  tags: z.array(z.string()),
  estimatedHours: z.number().positive().optional(),
  subtasks: z.array(z.object({
    title: z.string(),
    completed: z.boolean()
  })).optional()
})
```

### 5.5 Estados

**Salvando**:
- Inputs desabilitados
- Botão com spinner: "Salvando..."
- Desabilitar envio duplo

**Sucesso**:
- Toast: "Tarefa criada com sucesso"
- Redirecionar para lista ou detalhes

**Erro**:
- Toast: "Erro ao salvar tarefa"
- Manter no formulário
- Exibir erros específicos

---

## 6. Detalhes da Tarefa

### 6.1 Wireframe

```
┌────────────────────────────────────────────────────────────────┐
│  [←] Tarefa                            [✏️ Editar] [⋮ Mais]    │
├────────────────────────────────────────────────────────────────┤
│  Home > Tarefas > Implementar autenticação                     │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  [ ] Implementar autenticação JWT                        │ │
│  │  ──────────────────────────────────────────────────────  │ │
│  │  🔴 Alta  │  📅 Vence amanhã  │  👤 João Silva          │ │
│  │  [auth] [backend] [jwt]                                  │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Descrição                                               │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │                                                          │ │
│  │  Criar sistema de login com tokens JWT, incluindo       │ │
│  │  refresh tokens e validação de permissões.              │ │
│  │                                                          │ │
│  │  Requisitos:                                             │ │
│  │  • Endpoint POST /auth/login                             │ │
│  │  • Geração de access + refresh token                     │ │
│  │  • Middleware de autorização                             │ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Subtarefas (1/3 concluídas)                            │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │  [✓] Criar endpoint de login                            │ │
│  │  [ ] Implementar refresh tokens                         │ │
│  │  [ ] Adicionar validação de permissões                  │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Anexos (2)                                              │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │  📎 design-mockup.png                    [Download]     │ │
│  │  📎 requirements.pdf                     [Download]     │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Atividade                                               │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │  👤 Maria Santos                          há 2 horas    │ │
│  │  Comentou: "Precisa revisar a validação de tokens"      │ │
│  │                                                          │ │
│  │  👤 João Silva                            há 5 horas    │ │
│  │  Marcou subtarefa "Criar endpoint" como concluída       │ │
│  │                                                          │ │
│  │  👤 Pedro Oliveira                        ontem         │ │
│  │  Atribuiu tarefa para João Silva                        │ │
│  │                                                          │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │  Adicionar comentário...                           │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  │  [Comentar]                                            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 6.2 Componentes

**Header da Tarefa**:
- Checkbox grande: marcar completo
- Título (não editável, use botão Editar)
- Prioridade + prazo + responsável
- Tags
- Botões: Editar, Menu (duplicar, arquivar, deletar)

**Seção de Descrição**:
- Renderizar Markdown ou HTML (se editor rico)
- Read-only
- Botão "Editar" inline

**Subtarefas**:
- Lista de checkboxes
- Checkbox clicável (toggle completo)
- Barra de progresso: X de Y concluídas

**Anexos**:
- Lista de arquivos
- Ícone por tipo de arquivo
- Botão Download
- Preview inline (imagens)

**Feed de Atividade**:
- Timeline cronológica (mais recente no topo)
- Avatar + nome + ação + timestamp
- Tipos: comentário, mudança de status, atribuição, anexo
- Área para adicionar comentário

**Adicionar Comentário**:
- Textarea
- Botão "Comentar"
- Suporte a Markdown (opcional)

### 6.3 Interações

**Marcar Subtarefa**:
- Click no checkbox
- Atualiza contador de progresso
- Adiciona entry no feed de atividade

**Adicionar Comentário**:
- Digitar comentário
- Enter para enviar (Shift+Enter para quebra de linha)
- Toast: "Comentário adicionado"
- Aparece no topo do feed

**Download de Anexo**:
- Click no botão Download
- Inicia download do arquivo

---

## 7. Padrões Globais de UI

### 7.1 Cores e Semântica

**Prioridade**:
- 🔴 Alta: `text-red-600 dark:text-red-400`
- 🟡 Média: `text-yellow-600 dark:text-yellow-400`
- 🟢 Baixa: `text-green-600 dark:text-green-400`

**Status**:
- Pendente: `text-gray-600 dark:text-gray-400`
- Em Progresso: `text-blue-600 dark:text-blue-400`
- Concluído: `text-green-600 dark:text-green-400`
- Cancelado: `text-red-600 dark:text-red-400`

**Prazo**:
- Atrasado: `text-red-600 bg-red-50 dark:bg-red-950`
- Hoje: `text-orange-600 bg-orange-50 dark:bg-orange-950`
- Próximo: `text-gray-600`

### 7.2 Ícones (Lucide React)

- Tarefa: `CheckSquare`
- Prioridade: `AlertCircle` (alta), `Circle` (média/baixa)
- Prazo: `Calendar`
- Responsável: `User`
- Anexo: `Paperclip`
- Comentário: `MessageSquare`
- Editar: `Edit2`
- Deletar: `Trash2`
- Mais opções: `MoreVertical`
- Adicionar: `Plus`
- Buscar: `Search`
- Filtro: `Filter`

### 7.3 Loading States

**Skeleton para Lista**:
```
┌────────────────────────────────┐
│  [▓] ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  [▓] │
│  ▓▓▓  │  ▓▓▓▓▓▓  │  ▓▓▓▓▓▓▓▓  │
└────────────────────────────────┘
```

**Skeleton para Kanban**:
```
┌──────────┐ ┌──────────┐ ┌──────────┐
│ ▓▓▓▓▓▓   │ │ ▓▓▓▓▓▓   │ │ ▓▓▓▓▓▓   │
│          │ │          │ │          │
│ ┌──────┐ │ │ ┌──────┐ │ │ ┌──────┐ │
│ │ ▓▓▓▓ │ │ │ │ ▓▓▓▓ │ │ │ │ ▓▓▓▓ │ │
│ └──────┘ │ │ └──────┘ │ │ └──────┘ │
└──────────┘ └──────────┘ └──────────┘
```

**Loading de Ações**:
- Botão: spinner + "Salvando..."
- Card drag: opacity 0.5

### 7.4 Estado Vazio

```
┌────────────────────────────────┐
│                                │
│         [CheckSquare]          │
│                                │
│    Nenhuma tarefa encontrada   │
│                                │
│  Crie sua primeira tarefa para │
│  começar a organizar seu       │
│  trabalho.                     │
│                                │
│      [+ Nova Tarefa]           │
│                                │
└────────────────────────────────┘
```

**Estado Vazio com Filtros**:
```
┌────────────────────────────────┐
│                                │
│         [Filter]               │
│                                │
│  Nenhuma tarefa corresponde    │
│  aos filtros aplicados         │
│                                │
│  Ajuste os filtros ou crie uma │
│  nova tarefa.                  │
│                                │
│  [Limpar Filtros] [Nova Tarefa]│
│                                │
└────────────────────────────────┘
```

---

## 8. Responsividade

### 8.1 Mobile (< 640px)

**Lista de Tarefas**:
- Cards: full width
- Ocultar tags (mostrar contador)
- Menu de ações: dropdown (⋮)
- Filtros: drawer lateral

**Kanban**:
- Scroll horizontal entre colunas
- Uma coluna visível por vez
- Swipe para trocar coluna
- Cards: width 280px

**Timeline**:
- Não recomendado em mobile
- Mostrar lista cronológica como fallback

**Detalhes**:
- Layout vertical
- Seções colapsáveis
- Ações: botão fixo no bottom

### 8.2 Tablet (640px - 1024px)

**Lista**:
- Cards: full width ou 2 colunas
- Todos os campos visíveis

**Kanban**:
- 2-3 colunas visíveis
- Scroll horizontal suave

**Timeline**:
- Layout adaptado: scroll horizontal
- Dias no eixo X

### 8.3 Desktop (> 1024px)

- Layout conforme wireframes
- Drag & drop habilitado
- Tooltips e hover states completos

---

## 9. Acessibilidade (WCAG 2.1 AA)

### 9.1 Navegação por Teclado

**Lista de Tarefas**:
- `Tab`: navegar entre cards
- `Space`: toggle checkbox
- `Enter`: abrir detalhes
- `Esc`: fechar filtros/modals

**Kanban**:
- `Tab`: navegar entre cards
- `Space`: pegar/soltar card
- `Arrow keys`: mover card entre colunas (quando em drag mode)

### 9.2 ARIA Labels

- Checkbox: `aria-label="Marcar tarefa como concluída"`
- Botão editar: `aria-label="Editar tarefa [título]"`
- Dropdown status: `aria-label="Alterar status da tarefa"`
- Drag handle: `aria-label="Arrastar tarefa"`

### 9.3 Focus Visible

```css
.task-card:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

---

## 10. Performance

### 10.1 Otimizações de Lista

**Virtualização**:
- Se > 50 tarefas, usar `@tanstack/react-virtual`
- Renderizar apenas items visíveis
- Height estimado: 120px por card

**Debounce**:
- Busca: 300ms
- Filtros: 500ms

**Cache**:
- TanStack Query cache para lista de tarefas
- Invalidar ao criar/editar/deletar

### 10.2 Kanban Performance

**Lazy Loading de Colunas**:
- Carregar colunas visíveis primeiro
- Lazy load colunas ao scroll

**Drag & Drop Otimizado**:
- Usar `@dnd-kit` com performance mode
- Virtual scrolling em colunas longas

---

## 11. Padrões de Código

### 11.1 Componente de Card de Tarefa

```typescript
// src/modules/task/components/TaskCard.tsx

interface TaskCardProps {
  task: Task;
  view: 'list' | 'kanban';
  onToggleComplete: (taskId: string) => void;
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCard({ task, view, onToggleComplete, onEdit, onDelete }: TaskCardProps) {
  return (
    <Card className={cn(
      "p-4 hover:shadow-md transition-shadow",
      task.status === 'done' && "opacity-60"
    )}>
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.status === 'done'}
          onCheckedChange={() => onToggleComplete(task.id)}
          aria-label={`Marcar tarefa "${task.title}" como concluída`}
        />

        <div className="flex-1 min-w-0">
          <Link to={`/tasks/${task.id}`} className="hover:underline">
            <h3 className={cn(
              "font-medium",
              task.status === 'done' && "line-through"
            )}>
              {task.title}
            </h3>
          </Link>

          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <PriorityBadge priority={task.priority} />
            <DueDateBadge dueDate={task.dueDate} />
            {task.assignee && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{task.assignee.name}</span>
              </div>
            )}
          </div>

          {task.tags.length > 0 && (
            <div className="flex gap-1 mt-2">
              {task.tags.slice(0, view === 'list' ? 5 : 2).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {task.tags.length > (view === 'list' ? 5 : 2) && (
                <Badge variant="secondary" className="text-xs">
                  +{task.tags.length - (view === 'list' ? 5 : 2)}
                </Badge>
              )}
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task.id)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(task.id)}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(task.id)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Deletar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
```

### 11.2 Hook de Tarefas (JQEL)

```typescript
// src/modules/task/hooks/useTasks.ts

import { useJQELQuery } from '@/hooks/jqel/useJQELQuery';
import { useJQELMutation } from '@/hooks/jqel/useJQELMutation';

interface UseTasksOptions {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assigneeId?: string;
  search?: string;
}

export function useTasks(options: UseTasksOptions = {}) {
  const { status, priority, assigneeId, search } = options;

  const where: any = {};
  if (status?.length) where.status = { $in: status };
  if (priority?.length) where.priority = { $in: priority };
  if (assigneeId) where.assigneeId = { $eq: assigneeId };
  if (search) where.title = { $contains: search };

  const query = useJQELQuery({
    schema: 'platform',
    select: 'task',
    where,
    options: {
      orderBy: [
        { field: 'priority', direction: 'desc' },
        { field: 'dueDate', direction: 'asc' }
      ]
    }
  });

  return query;
}

export function useCreateTask() {
  const mutation = useJQELMutation();

  return {
    createTask: (data: CreateTaskInput) =>
      mutation.mutate({
        schema: 'platform',
        mutate: 'task',
        action: 'insert',
        values: data
      }),
    isLoading: mutation.isPending,
    error: mutation.error
  };
}

export function useUpdateTask() {
  const mutation = useJQELMutation();

  return {
    updateTask: (taskId: string, data: Partial<Task>) =>
      mutation.mutate({
        schema: 'platform',
        mutate: 'task',
        action: 'update',
        values: data,
        where: { id: { $eq: taskId } }
      }),
    isLoading: mutation.isPending,
    error: mutation.error
  };
}

export function useToggleTaskComplete() {
  const { updateTask } = useUpdateTask();

  return (taskId: string, currentStatus: TaskStatus) => {
    const newStatus = currentStatus === 'done' ? 'pending' : 'done';
    updateTask(taskId, { status: newStatus });
  };
}
```

### 11.3 Kanban Board Component

```typescript
// src/modules/task/pages/KanbanView.tsx

import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { KanbanColumn } from '../components/KanbanColumn';
import { useTasks, useUpdateTask } from '../hooks/useTasks';

const COLUMNS: { id: TaskStatus; title: string; icon: React.ReactNode }[] = [
  { id: 'pending', title: 'Pendente', icon: <List /> },
  { id: 'in-progress', title: 'Em Progresso', icon: <Loader /> },
  { id: 'done', title: 'Concluído', icon: <CheckCircle2 /> },
  { id: 'cancelled', title: 'Cancelado', icon: <XCircle /> }
];

export function KanbanView() {
  const { data: tasks, isLoading } = useTasks();
  const { updateTask } = useUpdateTask();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    updateTask(taskId, { status: newStatus });

    toast.success(`Tarefa movida para ${COLUMNS.find(c => c.id === newStatus)?.title}`, {
      action: {
        label: 'Desfazer',
        onClick: () => {
          // Rollback via optimistic update
        }
      }
    });
  };

  if (isLoading) return <KanbanSkeleton />;

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto p-4">
        {COLUMNS.map(column => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            icon={column.icon}
            tasks={tasks?.filter(t => t.status === column.id) || []}
          />
        ))}
      </div>
    </DndContext>
  );
}
```

---

## 12. Testes de UI/UX

### 12.1 Checklist de Validação

**Lista de Tarefas**:
- [ ] Busca funciona e destaca termos
- [ ] Filtros aplicam corretamente
- [ ] Checkbox marca/desmarca tarefa
- [ ] Click no título navega para detalhes
- [ ] Menu de ações funciona
- [ ] Estado vazio exibido corretamente
- [ ] Loading skeleton visível

**Kanban Board**:
- [ ] Drag & drop entre colunas funciona
- [ ] Contador de tarefas atualiza
- [ ] Quick create por coluna funciona
- [ ] Cards visualmente distintos por status
- [ ] Scroll horizontal suave

**Timeline**:
- [ ] Navegação entre períodos funciona
- [ ] Tarefas posicionadas corretamente
- [ ] Hover mostra tooltip com detalhes
- [ ] Click abre detalhes

**Formulário**:
- [ ] Validação inline funciona
- [ ] Campos obrigatórios marcados
- [ ] Date picker funciona
- [ ] Dropdown de responsável funciona
- [ ] Tags adicionam/removem corretamente
- [ ] Subtarefas adicionam/removem
- [ ] Upload de anexos funciona

**Detalhes**:
- [ ] Todas as informações exibidas
- [ ] Subtarefas marcam/desmarcam
- [ ] Comentários adicionam corretamente
- [ ] Feed de atividade cronológico
- [ ] Anexos baixam corretamente

**Responsividade**:
- [ ] Mobile: layout vertical funciona
- [ ] Tablet: layout híbrido funciona
- [ ] Desktop: todas as features disponíveis
- [ ] Touch gestures funcionam (swipe, drag)

**Acessibilidade**:
- [ ] Navegação por teclado funciona
- [ ] Focus visível
- [ ] ARIA labels corretos
- [ ] Contraste adequado (WCAG AA)
- [ ] Leitor de tela funciona

---

## 13. Próximos Passos

### 13.1 Fase 1: Estrutura Base
1. Criar tipos TypeScript (Task, TaskStatus, TaskPriority)
2. Implementar hooks JQEL (useTasks, useCreateTask, useUpdateTask)
3. Criar componentes base (TaskCard, PriorityBadge, DueDateBadge)

### 13.2 Fase 2: Lista de Tarefas
1. Página de lista com filtros
2. Busca de tarefas
3. Toggle de complete
4. Menu de ações

### 13.3 Fase 3: Kanban Board
1. Layout de colunas
2. Integração com @dnd-kit
3. Drag & drop entre colunas
4. Quick create por coluna

### 13.4 Fase 4: Formulário de Tarefa
1. Modal rápido (título + básico)
2. Página completa (todos os campos)
3. Editor de descrição
4. Subtarefas
5. Upload de anexos

### 13.5 Fase 5: Detalhes da Tarefa
1. Visualização read-only
2. Feed de atividade
3. Adicionar comentários
4. Download de anexos

### 13.6 Fase 6: Timeline (Opcional)
1. Layout de timeline
2. Posicionamento por data
3. Navegação de período

### 13.7 Fase 7: Polimento
1. Animações e transições
2. Otimizações de performance
3. Virtual scrolling (lista longa)
4. Testes de acessibilidade

---

## Conclusão

Este documento define a arquitetura completa de UI/UX para o módulo Task, seguindo:

- **SPEC-concepts.md**: Conceitos de Portal, Módulo, Instância
- **SPEC-architecture.md**: Stack tecnológico (React 19, shadcn/ui, Tailwind, etc.)

**Padrões Adotados**:
- Multi-view (lista, kanban, timeline)
- Quick actions em cards
- Drag & drop com @dnd-kit
- Formulário com validação inline (React Hook Form + Zod)
- Feed de atividade com comentários
- Responsividade (mobile-first)
- Acessibilidade (WCAG 2.1 AA)

**Tecnologias**:
- React 19 + TypeScript
- shadcn/ui (única biblioteca de UI permitida)
- Tailwind CSS (zero CSS customizado)
- React Hook Form + Zod
- Lucide React (ícones)
- TanStack Query (JQEL)
- @dnd-kit (drag & drop)
- @tanstack/react-virtual (virtualização)

Esta especificação serve como guia completo para implementação do módulo Task, garantindo consistência, qualidade e aderência aos requisitos da plataforma.
