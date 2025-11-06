# Plano de Implementação: Setup Module UI/UX

**Baseado em**: `spec/ui/setup-module-interfaces.md` + `spec/SPEC-module-setup.md`
**Prototype**: prototype-1
**Status**: Planejamento
**Created**: 2025-11-06

---

## ⚠️ CRITICAL IMPLEMENTATION RULES

**BEFORE implementing ANY task in this plan:**

1. **READ THE SPECIFICATION FIRST**
   - Primary: `spec/ui/setup-module-interfaces.md` (UI/UX design patterns)
   - Secondary: `spec/SPEC-module-setup.md` (functional requirements)
   - Tertiary: `spec/SPEC-concepts.md`, `spec/SPEC-architecture.md`

2. **FOLLOW UI/UX PATTERNS EXACTLY**
   - Wireframes in ASCII are AUTHORITATIVE
   - Component structures are defined
   - Responsiveness breakpoints are specified
   - Accessibility requirements are mandatory (WCAG 2.1 AA)

3. **USE ONLY APPROVED TECHNOLOGIES**
   - React 19 + TypeScript
   - shadcn/ui (ONLY UI library allowed)
   - Tailwind CSS (zero custom CSS)
   - React Hook Form + Zod (forms)
   - TanStack Query (JQEL data access)
   - Lucide React (icons)

4. **CHECK EXISTING IMPLEMENTATIONS**
   - Review `src/prototype-1/modules/setup/` (current implementation)
   - Identify what needs to be refactored
   - Preserve JQEL integration patterns
   - Maintain routing structure

---

## Legend

- `[ ]` — Pendente (0%)
- `[-]` — Em Implementação (>0% e <100%)
- `[x]` — Feito (100%)

---

## 1. PREPARAÇÃO E SETUP BASE

### 1.1 Análise da Implementação Atual
- [ ] **Audit Current Setup Module**
  - [ ] Documentar estrutura atual de pastas
  - [ ] Listar componentes existentes
  - [ ] Identificar rotas implementadas
  - [ ] Mapear queries JQEL existentes
  - [ ] Avaliar conformidade com SPEC-module-setup.md
  - [ ] Identificar gaps vs spec/ui/setup-module-interfaces.md

### 1.2 Instalação de Dependências UI
- [ ] **shadcn/ui Components Required**
  - [ ] Instalar componentes base (button, card, input, label)
  - [ ] Instalar form components (form, checkbox, radio-group, select)
  - [ ] Instalar navigation (breadcrumb, tabs, dropdown-menu)
  - [ ] Instalar feedback (toast, alert, dialog, badge)
  - [ ] Instalar data display (table, skeleton, separator, scroll-area)
  - [ ] Instalar advanced (popover, tooltip, sheet, command)
  - [ ] Configurar theme provider (já existe, validar)

### 1.3 Estrutura de Pastas (Refactor)
- [ ] **Reorganizar módulo Setup**
  ```
  src/modules/setup/
  ├── manifest.ts                    # Module manifest
  ├── index.ts                       # Entry point
  ├── routes.ts                      # Route definitions
  ├── pages/                         # Page components
  │   ├── Dashboard.tsx              # Main dashboard (/)
  │   ├── PortalList.tsx             # List portals (/portals)
  │   ├── PortalForm.tsx             # Create/Edit portal (/portals/:id?)
  │   ├── PortalModules.tsx          # Modules per portal (/portals/:id/modules)
  │   ├── InstanceList.tsx           # Instances (/portals/:pid/modules/:mid/instances)
  │   ├── InstanceForm.tsx           # Create/Edit instance
  │   ├── ThemeConfig.tsx            # Theme configuration (/portals/:id/theme)
  │   └── PlatformSettings.tsx       # Platform settings (read-only)
  ├── components/                    # Reusable components
  │   ├── PortalCard.tsx             # Portal display card
  │   ├── ModuleCard.tsx             # Module display card
  │   ├── InstanceCard.tsx           # Instance display card
  │   ├── StatCard.tsx               # Statistics card
  │   ├── QuickAccessCard.tsx        # Quick access card
  │   ├── ActivityItem.tsx           # Activity log item
  │   ├── BreadcrumbNav.tsx          # Breadcrumb navigation
  │   ├── HealthCheckCard.tsx        # Health check display
  │   ├── ColorPicker.tsx            # Color picker with contrast validation
  │   ├── ThemePreview.tsx           # Dual theme preview
  │   ├── ConfirmDialog.tsx          # Confirmation modal
  │   ├── SearchFilter.tsx           # Search/filter bar
  │   └── EmptyState.tsx             # Empty state component
  ├── hooks/                         # Custom hooks
  │   ├── usePortals.ts              # Portal CRUD operations
  │   ├── useModules.ts              # Module activation/deactivation
  │   ├── useInstances.ts            # Instance CRUD operations
  │   ├── useTheme.ts                # Theme configuration
  │   ├── usePlatformSettings.ts     # Platform settings queries
  │   ├── useHealthChecks.ts         # Health check polling
  │   └── useFormValidation.ts       # Form validation utilities
  ├── schemas/                       # Zod schemas
  │   ├── portalSchema.ts            # Portal validation schema
  │   ├── moduleSchema.ts            # Module validation schema
  │   ├── instanceSchema.ts          # Instance validation schema
  │   └── themeSchema.ts             # Theme validation schema
  ├── types/                         # TypeScript types
  │   ├── portal.ts                  # Portal types
  │   ├── module.ts                  # Module types
  │   ├── instance.ts                # Instance types
  │   ├── theme.ts                   # Theme types
  │   └── health.ts                  # Health check types
  └── utils/                         # Utility functions
      ├── validation.ts              # Validation helpers
      ├── contrast.ts                # WCAG contrast calculation
      ├── formatters.ts              # Data formatters
      └── constants.ts               # Constants
  ```

---

## 2. COMPONENTES GLOBAIS E INFRA

### 2.1 Layout e Navegação
- [ ] **BreadcrumbNav Component** (**spec/ui/setup-module-interfaces.md** §10.1)
  - [ ] Criar componente com shadcn/ui breadcrumb
  - [ ] Suporte a hierarquia (Home > Portais > app > Módulos)
  - [ ] Todos os níveis clicáveis exceto atual
  - [ ] Separador ">"
  - [ ] Current item: bold ou cor diferente

- [ ] **Header Global Component** (**spec/ui/setup-module-interfaces.md** §2.2)
  - [ ] Logo/Título: "Setup Dashboard"
  - [ ] Menu hambúrguer (mobile)
  - [ ] User menu (direita)
  - [ ] Theme toggle (direita)
  - [ ] Responsivo (mobile < 640px)

- [ ] **Botão Voltar Pattern** (**spec/ui/setup-module-interfaces.md** §10.1)
  - [ ] Sempre no canto superior esquerdo
  - [ ] Ícone [←] (Lucide: ArrowLeft)
  - [ ] Volta para página anterior da hierarquia
  - [ ] Não usar history.back()

### 2.2 Estados e Feedback
- [ ] **Loading States** (**spec/ui/setup-module-interfaces.md** §10.2)
  - [ ] Skeleton loaders para listas
  - [ ] Skeleton loaders para cards
  - [ ] Skeleton loaders para formulários
  - [ ] Spinners para botões (inline)
  - [ ] Spinners centralizados para páginas
  - [ ] Animação de shimmer (opcional)

- [ ] **EmptyState Component** (**spec/ui/setup-module-interfaces.md** §10.3)
  - [ ] Padrão consistente: Ícone + Mensagem + Descrição + Ação
  - [ ] Ícones contextuais (Globe para portais, Package para módulos, Settings para instâncias)
  - [ ] Mensagem clara e acionável
  - [ ] Botão de ação primária
  - [ ] Variantes: portals, modules, instances

- [ ] **Toast/Snackbar System** (**spec/ui/setup-module-interfaces.md** §10.4)
  - [ ] Usar shadcn/ui toast
  - [ ] 4 tipos: success (✓), info (ℹ️), warning (⚠️), error (✗)
  - [ ] Posicionamento: top-right (desktop), top-center (mobile)
  - [ ] Durações: success (3s), info (5s), warning (7s), error (manual)
  - [ ] Ação de desfazer quando aplicável

- [ ] **ConfirmDialog Component** (**spec/ui/setup-module-interfaces.md** §10.5)
  - [ ] Usar shadcn/ui dialog
  - [ ] Padrão destrutivo: ⚠️ + título + descrição + consequências + ações
  - [ ] Padrão informativo: ℹ️ + título + info + ações
  - [ ] Botões: Cancelar (secundário) + Ação (primário/danger)
  - [ ] Listar consequências (ex: "X instâncias serão removidas")

### 2.3 Componentes Reutilizáveis
- [ ] **SearchFilter Component** (**spec/ui/setup-module-interfaces.md** §3.2)
  - [ ] Input de busca com ícone Search (Lucide)
  - [ ] Debounce de 300ms
  - [ ] Dropdown de filtros (opcional)
  - [ ] Client-side para < 50 itens
  - [ ] Server-side para > 50 itens

- [ ] **StatCard Component** (**spec/ui/setup-module-interfaces.md** §2.2)
  - [ ] Ícone grande + título + números
  - [ ] Clicável (link para lista)
  - [ ] Cores semânticas: info, primary, success
  - [ ] Hover: elevação + brand color

- [ ] **QuickAccessCard Component** (**spec/ui/setup-module-interfaces.md** §2.2)
  - [ ] Título + descrição breve
  - [ ] Ícone à esquerda
  - [ ] Seta → à direita
  - [ ] Hover: elevação + brand color

- [ ] **ActivityItem Component** (**spec/ui/setup-module-interfaces.md** §2.2)
  - [ ] Lista temporal de ações
  - [ ] Timestamp relativo ("há X horas")
  - [ ] Ícone de tipo de ação

---

## 3. DASHBOARD PRINCIPAL

### 3.1 Dashboard Page (**spec/ui/setup-module-interfaces.md** §2)
- [ ] **Implementar Dashboard** (rota: `/`)
  - [ ] Header global (logo, user menu, theme toggle)
  - [ ] Seção "Visão Geral da Plataforma"
  - [ ] 3 StatCards: Portais, Módulos, Instâncias
  - [ ] Seção "Acesso Rápido"
  - [ ] 2 QuickAccessCards: Gerenciar Portais, Platform Settings
  - [ ] Seção "Atividade Recente" (opcional)
  - [ ] Limite: 5 últimos itens

### 3.2 Dashboard Data
- [ ] **usePortals Hook** (query)
  - [ ] Query JQEL: `{ schema: 'backend', select: 'portal' }`
  - [ ] Contar total de portais
  - [ ] Contar portais removíveis
  - [ ] TanStack Query integration

- [ ] **useModules Hook** (query)
  - [ ] Query JQEL: `{ schema: 'backend', select: 'module' }`
  - [ ] Contar total de módulos
  - [ ] Contar módulos ativos (por portal?)
  - [ ] TanStack Query integration

- [ ] **useInstances Hook** (query)
  - [ ] Query JQEL: `{ schema: 'backend', select: 'instance' }`
  - [ ] Contar total de instâncias
  - [ ] Agrupar por portal
  - [ ] TanStack Query integration

### 3.3 Responsividade Dashboard
- [ ] **Mobile (< 640px)**
  - [ ] StatCards: vertical (1 coluna)
  - [ ] QuickAccess: vertical
  - [ ] Atividade: ocultar ou colapsar

- [ ] **Tablet (640px - 1024px)**
  - [ ] StatCards: 2 colunas + 1 linha
  - [ ] QuickAccess: vertical

- [ ] **Desktop (> 1024px)**
  - [ ] Layout conforme wireframe
  - [ ] StatCards: 3 colunas

---

## 4. GERENCIAMENTO DE PORTAIS

### 4.1 Lista de Portais (**spec/ui/setup-module-interfaces.md** §3)
- [ ] **PortalList Page** (rota: `/portals`)
  - [ ] Header: botão voltar + título + "Novo Portal"
  - [ ] Breadcrumb: Home > Portais
  - [ ] SearchFilter: busca por portalId, rota
  - [ ] Dropdown de filtros: Todos | Removíveis | Protegidos
  - [ ] Grid de PortalCards
  - [ ] EmptyState quando vazio
  - [ ] Paginação (se > 50 portais)

- [ ] **PortalCard Component** (**spec/ui/setup-module-interfaces.md** §3.2)
  - [ ] Ícone de portal (Globe) + portalId
  - [ ] Badge "🔒 Protegido" se removable=false
  - [ ] Informações: rota, settings-key, módulos ativos
  - [ ] Ações rápidas (botões):
    - [ ] ✏️ Editar
    - [ ] 🎨 Tema
    - [ ] 📦 Módulos
    - [ ] 🗑️ Remover (apenas se removable=true)
  - [ ] Hover: elevação + border com brand color
  - [ ] Click: expandir ou navegar

### 4.2 Criar/Editar Portal (**spec/ui/setup-module-interfaces.md** §4)
- [ ] **PortalForm Page** (rotas: `/portals/new`, `/portals/:portalId`)
  - [ ] Header: botão voltar + título + fechar
  - [ ] Breadcrumb: Home > Portais > Novo/Editar
  - [ ] Formulário com React Hook Form + Zod
  - [ ] Seção "Informações Básicas"
  - [ ] Painel de Validação (fixo bottom ou floating)
  - [ ] Botões: Cancelar + Criar/Salvar

- [ ] **Portal Form Fields** (**spec/ui/setup-module-interfaces.md** §4.2)
  - [ ] Portal ID (Input text)
    - [ ] Validação: alfanumérico, único, 2-32 chars
    - [ ] Hint: "Não pode ser alterado após criação"
    - [ ] Disabled em modo edição
  - [ ] Rota (Input text com prefixo "/")
    - [ ] Validação: único, formato de rota válido
    - [ ] Preview da URL completa abaixo
    - [ ] Suggestion: auto-preencher com "/" + portalId
  - [ ] Settings Key (Input text com autocomplete)
    - [ ] Ícone ℹ️ com tooltip explicativo
    - [ ] Mostrar lista de portais usando o mesmo key
    - [ ] Validação: alfanumérico
    - [ ] Default: "default"
  - [ ] Portal Removível (Checkbox)
    - [ ] Texto explicativo
    - [ ] Disabled para portal "main" (sempre false)

- [ ] **Portal Form Validation** (**spec/ui/setup-module-interfaces.md** §4.3)
  - [ ] Zod schema (portalSchema.ts)
  - [ ] Client-side validation inline (onBlur + onChange com debounce)
  - [ ] Server-side validation via JQEL
  - [ ] Verificar unicidade de portalId
  - [ ] Verificar unicidade de rota
  - [ ] Validar que "main" não pode ser removível
  - [ ] Não conflitar com rotas estáticas (/health, /assets/*)

- [ ] **Portal Form States** (**spec/ui/setup-module-interfaces.md** §4.4)
  - [ ] Loading inicial (skeleton loaders em modo edição)
  - [ ] Salvando (inputs desabilitados + spinner)
  - [ ] Sucesso (toast + redirecionamento)
  - [ ] Erro (toast + manter no formulário)

### 4.3 Remover Portal (**spec/ui/setup-module-interfaces.md** §3.3)
- [ ] **usePortalDelete Hook**
  - [ ] Mutation JQEL: `{ schema: 'backend', mutate: 'portal', action: 'delete' }`
  - [ ] TanStack Query mutation
  - [ ] Invalidar cache após remoção

- [ ] **Confirmação de Remoção**
  - [ ] ConfirmDialog com padrão destrutivo
  - [ ] Listar consequências:
    - [ ] "Desativar X módulos"
    - [ ] "Remover Y instâncias"
    - [ ] "Remover configurações de tema"
  - [ ] Aviso: "Esta ação não pode ser desfeita."
  - [ ] Botão danger: "🗑️ Remover"

---

## 5. GERENCIAMENTO DE MÓDULOS

### 5.1 Módulos do Portal (**spec/ui/setup-module-interfaces.md** §5)
- [ ] **PortalModules Page** (rota: `/portals/:portalId/modules`)
  - [ ] Header: botão voltar + título
  - [ ] Breadcrumb: Home > Portais > {portalId} > Módulos
  - [ ] Tabs/Sections: Ativos | Disponíveis
  - [ ] SearchFilter (na seção Disponíveis)
  - [ ] Lista de ModuleCards (Ativos)
  - [ ] Lista de ModuleCards (Disponíveis)

- [ ] **ModuleCard Component (Ativo)** (**spec/ui/setup-module-interfaces.md** §5.2)
  - [ ] Checkbox checked (visual only)
  - [ ] moduleId + versão
  - [ ] Link "→ Instâncias"
  - [ ] Descrição
  - [ ] Tipo (badge colorido)
  - [ ] Dependências (lista clicável)
  - [ ] Contador de instâncias
  - [ ] Indicador de dependentes (se houver)
  - [ ] Botão "Desativar" (disabled se tem dependentes)

- [ ] **ModuleCard Component (Disponível)** (**spec/ui/setup-module-interfaces.md** §5.2)
  - [ ] Checkbox unchecked (visual only)
  - [ ] moduleId + versão
  - [ ] Descrição
  - [ ] Tipo (badge)
  - [ ] Dependências
  - [ ] Aviso se ativar dependências automaticamente
  - [ ] Botão "Ativar"

### 5.2 Ativação/Desativação de Módulos
- [ ] **useModuleActivation Hook**
  - [ ] Mutation JQEL: `{ schema: 'backend', mutate: 'module', action: 'activate' }`
  - [ ] Validar dependências antes de ativar
  - [ ] Ativar dependências automaticamente (com confirmação)
  - [ ] TanStack Query mutation

- [ ] **useModuleDeactivation Hook**
  - [ ] Mutation JQEL: `{ schema: 'backend', mutate: 'module', action: 'deactivate' }`
  - [ ] Validar dependentes antes de desativar
  - [ ] Impedir se houver dependentes
  - [ ] TanStack Query mutation

- [ ] **Ativação com Dependências** (**spec/ui/setup-module-interfaces.md** §5.2)
  - [ ] ConfirmDialog com padrão informativo
  - [ ] Listar dependências que serão ativadas
  - [ ] Pergunta: "Deseja continuar?"
  - [ ] Botão: "✓ Ativar"

- [ ] **Desativação com Dependentes** (**spec/ui/setup-module-interfaces.md** §5.2)
  - [ ] ConfirmDialog com padrão de erro
  - [ ] Listar módulos dependentes
  - [ ] Mensagem: "Desative estes módulos primeiro."
  - [ ] Botão: "Entendi"

### 5.3 Grafo de Dependências (Opcional) (**spec/ui/setup-module-interfaces.md** §5.3)
- [ ] **DependencyGraph Component**
  - [ ] Visualização de dependências (ASCII art ou lib gráfica)
  - [ ] Destacar ativos vs inativos
  - [ ] Legenda: ■ Ativo, □ Inativo

---

## 6. GERENCIAMENTO DE INSTÂNCIAS

### 6.1 Lista de Instâncias (**spec/ui/setup-module-interfaces.md** §6)
- [ ] **InstanceList Page** (rota: `/portals/:portalId/modules/:moduleId/instances`)
  - [ ] Header: botão voltar + título + "Nova Instância"
  - [ ] Breadcrumb: Home > Portais > {portalId} > Módulos > {moduleId} > Instâncias
  - [ ] Lista de InstanceCards
  - [ ] EmptyState quando vazio
  - [ ] Mensagem: "Este módulo está ativo mas não possui instâncias configuradas."

- [ ] **InstanceCard Component** (**spec/ui/setup-module-interfaces.md** §6.1)
  - [ ] Ícone Settings + instanceId
  - [ ] Status: Ativo
  - [ ] Resumo da configuração (lista de chave: valor)
  - [ ] Ações:
    - [ ] ✏️ Editar
    - [ ] 🗑️ Remover
    - [ ] Duplicar (opcional)
  - [ ] Botões: [Editar] [Duplicar]

### 6.2 Criar/Editar Instância (**spec/ui/setup-module-interfaces.md** §7)
- [ ] **InstanceForm Page** (rotas: `/portals/:pid/modules/:mid/instances/new`, `.../instances/:instanceId`)
  - [ ] Header: botão voltar + título + fechar
  - [ ] Breadcrumb completo
  - [ ] Formulário dinâmico baseado em schema do módulo
  - [ ] Seção "Identificação" (instanceId)
  - [ ] Seção "Configuração" (campos gerados do schema)
  - [ ] Tabs: Configuração | Preview (se módulo suportar)
  - [ ] Botões: Cancelar + Salvar

- [ ] **Instance Form Fields** (**spec/ui/setup-module-interfaces.md** §7.1)
  - [ ] Instance ID (Input text)
    - [ ] Validação: alfanumérico, único no portal
    - [ ] Hint: "Único no portal"
  - [ ] Campos dinâmicos (baseados em schema do módulo)

- [ ] **Dynamic Form Generator** (**spec/ui/setup-module-interfaces.md** §7.2)
  - [ ] Schema do módulo define campos
  - [ ] Mapear tipos para componentes:
    - [ ] `string` → Input text
    - [ ] `number` → Input number (com min/max)
    - [ ] `boolean` → Checkbox
    - [ ] `enum` → Select dropdown
    - [ ] `array` → Checkboxes múltiplos ou multi-select
    - [ ] `object` → Grupo de campos aninhados
  - [ ] Gerar Zod schema do schema do módulo
  - [ ] Validação em tempo real

- [ ] **Instance Preview (Opcional)** (**spec/ui/setup-module-interfaces.md** §7.3)
  - [ ] Aba "Preview" se módulo suportar
  - [ ] Renderizar preview do módulo com configuração atual
  - [ ] Atualização em tempo real

### 6.3 CRUD de Instâncias
- [ ] **useInstanceCreate Hook**
  - [ ] Mutation JQEL: `{ schema: 'backend', mutate: 'instance', action: 'insert' }`
  - [ ] Validar schema do módulo
  - [ ] TanStack Query mutation

- [ ] **useInstanceUpdate Hook**
  - [ ] Mutation JQEL: `{ schema: 'backend', mutate: 'instance', action: 'update' }`
  - [ ] Validar schema do módulo
  - [ ] TanStack Query mutation

- [ ] **useInstanceDelete Hook**
  - [ ] Mutation JQEL: `{ schema: 'backend', mutate: 'instance', action: 'delete' }`
  - [ ] Confirmação antes de remover
  - [ ] TanStack Query mutation

---

## 7. CONFIGURAÇÃO DE TEMA

### 7.1 Theme Config Page (**spec/ui/setup-module-interfaces.md** §8)
- [ ] **ThemeConfig Page** (rota: `/portals/:portalId/theme`)
  - [ ] Header: botão voltar + título
  - [ ] Breadcrumb: Home > Portais > {portalId} > Tema
  - [ ] Layout: 2 colunas (Configuração | Preview)
  - [ ] Seção Configuração (esquerda)
  - [ ] Seção Preview (direita)
  - [ ] Botões: Cancelar + Salvar

### 7.2 Theme Configuration (**spec/ui/setup-module-interfaces.md** §8.2)
- [ ] **Theme Mode Selector**
  - [ ] Radio buttons: Light, Dark, System
  - [ ] Ícones visuais: ☀️ (Sun), ☾ (Moon), 🖥️ (Monitor) - Lucide
  - [ ] Preview atualiza em tempo real

- [ ] **ColorPicker Component** (**spec/ui/setup-module-interfaces.md** §8.2)
  - [ ] Usar react-colorful (App Components)
  - [ ] Input hex color
  - [ ] Validação de contraste WCAG AA automática
  - [ ] Indicadores: ✓ OK, ⚠️ Contraste baixo, ✗ Insuficiente
  - [ ] Sugestão de ajuste automático se < WCAG AA

- [ ] **Contrast Validation** (**spec/ui/setup-module-interfaces.md** §8.2)
  - [ ] Calcular contraste (util: contrast.ts)
  - [ ] Validar WCAG AA (4.5:1 texto normal, 3:1 texto grande)
  - [ ] Exibir contraste calculado (ex: "7.2:1 (AA)")
  - [ ] Modal de sugestão se contraste insuficiente
  - [ ] Opções: Ignorar | Usar Sugestão

- [ ] **Settings Key Management** (**spec/ui/setup-module-interfaces.md** §8.2)
  - [ ] Input text para settings-key
  - [ ] Lista de portais compartilhando o mesmo key
  - [ ] Botão "Criar Novo" → modal para novo settings key
  - [ ] Ícone ℹ️ com tooltip explicativo

### 7.3 Theme Preview (**spec/ui/setup-module-interfaces.md** §8.1)
- [ ] **ThemePreview Component** (Dual)
  - [ ] Preview Light Mode
    - [ ] Botões primários e secundários
    - [ ] Texto em backgrounds
    - [ ] Indicador de contraste
  - [ ] Preview Dark Mode
    - [ ] Botões primários e secundários
    - [ ] Texto em backgrounds
    - [ ] Indicador de contraste
  - [ ] Layout: lado a lado (desktop), stacked (mobile)
  - [ ] Atualização em tempo real

### 7.4 Theme Persistence
- [ ] **useThemeConfig Hook**
  - [ ] Query JQEL: `{ schema: 'backend', select: 'portal', where: { portalId } }`
  - [ ] Mutation JQEL: `{ schema: 'backend', mutate: 'portal', action: 'update', values: { theme } }`
  - [ ] TanStack Query integration
  - [ ] Invalidar cache após salvar

---

## 8. PLATFORM SETTINGS (READ-ONLY)

### 8.1 Platform Settings Page (**spec/ui/setup-module-interfaces.md** §9)
- [ ] **PlatformSettings Page** (rota: `/platform-settings`)
  - [ ] Header: botão voltar + título
  - [ ] Breadcrumb: Home > Platform Settings
  - [ ] Banner informativo (read-only)
  - [ ] Seção "Variáveis de Ambiente"
  - [ ] Seção "Health Checks"
  - [ ] Botão: Atualizar Todos (health checks)

### 8.2 Environment Variables (**spec/ui/setup-module-interfaces.md** §9.2)
- [ ] **Variáveis de Ambiente Display**
  - [ ] Lista key-value (não editável)
  - [ ] Exibir: NODE_ENV, BACKEND_URL, N8N_BASE_URL, REDIS_URL
  - [ ] Mascarar senhas (ex: "redis://localhost:6379 (senha oculta)")
  - [ ] NÃO mostrar secrets (JWT_SECRET, N8N_SHARED_SECRET)
  - [ ] Copy-to-clipboard (ícone 📋)

- [ ] **Banner Read-only** (**spec/ui/setup-module-interfaces.md** §9.2)
  - [ ] Cor: info (azul)
  - [ ] Ícone: ℹ️
  - [ ] Mensagem: "Estas configurações são definidas no arquivo `.env` no servidor. Alterações requerem edição manual do arquivo e restart da aplicação."

### 8.3 Health Checks (**spec/ui/setup-module-interfaces.md** §9.1)
- [ ] **HealthCheckCard Component** (**spec/ui/setup-module-interfaces.md** §9.2)
  - [ ] Status visual: ✓ (verde), ✗ (vermelho), ⟳ (loading)
  - [ ] Nome do serviço
  - [ ] Status textual (Conectado/Erro/Verificando)
  - [ ] URL/configuração (se aplicável)
  - [ ] Timestamp da última verificação
  - [ ] Botão "Tentar Novamente" se erro
  - [ ] Auto-refresh a cada 30s

- [ ] **useHealthChecks Hook** (**spec/ui/setup-module-interfaces.md** §9.2)
  - [ ] Indicador Backend: GET /health
  - [ ] Indicador n8n: GET /health (via backend proxy)
  - [ ] Indicador Redis: GET /health (via backend)
  - [ ] Polling a cada 30s
  - [ ] TanStack Query com refetchInterval

---

## 9. RESPONSIVIDADE

### 9.1 Breakpoints (SPEC-architecture.md §5, spec/ui/setup-module-interfaces.md §11)
- [ ] **Mobile (< 640px)**
  - [ ] Dashboard: cards vertical (1 coluna)
  - [ ] Lista de Portais: cards full width, ações em dropdown (3 pontos)
  - [ ] Formulários: inputs full width, botões full width stacked
  - [ ] Módulos: tabs scrollable horizontal, cards vertical
  - [ ] Tema: config e preview stacked (config acima, preview abaixo)

- [ ] **Tablet (640px - 1024px)**
  - [ ] Dashboard: cards 2 colunas + 1 linha
  - [ ] Lista de Portais: cards 2 colunas ou full width
  - [ ] Formulários: campos menores em 2 colunas, grandes full width
  - [ ] Tema: side-by-side com ajustes

- [ ] **Desktop (> 1024px)**
  - [ ] Layout conforme wireframes
  - [ ] Aproveitamento de espaço horizontal
  - [ ] Master-detail lado a lado

### 9.2 Touch e Gestos (SPEC-architecture.md §5)
- [ ] **Touch Support**
  - [ ] Botões e links: área de toque mínima 44x44px
  - [ ] Suporte a swipe (opcional, onde apropriado)
  - [ ] Pinch-to-zoom desabilitado na interface

---

## 10. ACESSIBILIDADE (WCAG 2.1 AA)

### 10.1 Navegação por Teclado (**spec/ui/setup-module-interfaces.md** §12.1)
- [ ] **Tab Order**
  - [ ] Header (logo, menu) → Breadcrumb → Conteúdo → Ações → Footer
  - [ ] Top-to-bottom, left-to-right

- [ ] **Keyboard Shortcuts**
  - [ ] `Esc`: Fechar modal/dropdown
  - [ ] `Enter`: Confirmar/Salvar
  - [ ] `Space`: Toggle checkbox/radio
  - [ ] `Arrow Keys`: Navegar em dropdowns/listas

- [ ] **Focus Visible** (**spec/ui/setup-module-interfaces.md** §12.1)
  - [ ] Ring azul (2px) em elementos focados
  - [ ] Configurar em Tailwind: focus-visible:ring-2

### 10.2 Leitores de Tela (**spec/ui/setup-module-interfaces.md** §12.2)
- [ ] **Landmarks ARIA**
  - [ ] `<header>`: Cabeçalho global
  - [ ] `<nav>`: Breadcrumb e navegação
  - [ ] `<main>`: Conteúdo principal
  - [ ] `<aside>`: Informações complementares (se houver)
  - [ ] `<footer>`: Rodapé (se houver)

- [ ] **ARIA Labels**
  - [ ] Botões com ícones: `aria-label="Editar portal"`
  - [ ] Inputs: associar com `<label>` via `htmlFor`
  - [ ] Status: `aria-live="polite"` para toasts
  - [ ] Loading: `aria-busy="true"`

- [ ] **Alt Text**
  - [ ] Ícones decorativos: `aria-hidden="true"`
  - [ ] Ícones funcionais: `aria-label`

### 10.3 Contraste de Cores (**spec/ui/setup-module-interfaces.md** §12.3)
- [ ] **Validação WCAG AA**
  - [ ] Texto normal: mínimo 4.5:1
  - [ ] Texto grande (18px+): mínimo 3:1
  - [ ] Elementos UI (botões, borders): mínimo 3:1
  - [ ] Color picker valida automaticamente
  - [ ] Avisar se < WCAG AA
  - [ ] Sugerir ajustes automáticos

---

## 11. PERFORMANCE E OTIMIZAÇÕES

### 11.1 Code Splitting (**spec/ui/setup-module-interfaces.md** §13.1)
- [ ] **Lazy Load de Páginas**
  - [ ] Dashboard: `React.lazy(() => import('./pages/Dashboard'))`
  - [ ] PortalList: `React.lazy(() => import('./pages/PortalList'))`
  - [ ] PortalForm: `React.lazy(() => import('./pages/PortalForm'))`
  - [ ] Demais páginas: lazy load

- [ ] **Suspense Boundaries**
  - [ ] Skeleton loaders durante loading
  - [ ] Error boundaries por página

### 11.2 Otimizações (**spec/ui/setup-module-interfaces.md** §13.2)
- [ ] **Virtualização**
  - [ ] Se > 50 portais/módulos: usar TanStack Virtual
  - [ ] Renderizar apenas items visíveis

- [ ] **Debounce**
  - [ ] Busca: 300ms
  - [ ] Validação inline: 500ms

- [ ] **Cache (TanStack Query)**
  - [ ] Cache de queries JQEL
  - [ ] Invalidar após mutations
  - [ ] Stale time configurável

- [ ] **Imagens**
  - [ ] Ícones: usar Lucide (SVG)
  - [ ] Logos: lazy load (se houver)

---

## 12. VALIDAÇÕES E TESTES

### 12.1 Validação de Formulários
- [ ] **portalSchema.ts** (Zod)
  - [ ] portalId: alfanumérico, 2-32 chars, único
  - [ ] route: formato de rota válido, único
  - [ ] settingsKey: alfanumérico, default "default"
  - [ ] removable: boolean, default true

- [ ] **moduleSchema.ts** (Zod)
  - [ ] Validação de ativação/desativação
  - [ ] Dependências

- [ ] **instanceSchema.ts** (Zod)
  - [ ] instanceId: alfanumérico, único no portal
  - [ ] config: validação baseada em schema do módulo

- [ ] **themeSchema.ts** (Zod)
  - [ ] mode: 'light' | 'dark' | 'system'
  - [ ] brandColor: hex color, contraste WCAG AA

### 12.2 Checklist de Validação UI/UX (**spec/ui/setup-module-interfaces.md** §15.1)
- [ ] **Navegação**
  - [ ] Breadcrumbs funcionam corretamente
  - [ ] Botão voltar leva para página correta
  - [ ] Links levam para rotas corretas
  - [ ] Menu hambúrguer funciona em mobile

- [ ] **Formulários**
  - [ ] Validação inline funciona
  - [ ] Erros são exibidos claramente
  - [ ] Sucesso mostra feedback
  - [ ] Cancelar volta sem salvar

- [ ] **Listas**
  - [ ] Busca funciona
  - [ ] Filtros funcionam
  - [ ] Cards clicáveis
  - [ ] Ações rápidas funcionam
  - [ ] Estado vazio exibido corretamente

- [ ] **Modais**
  - [ ] Confirmações destrutivas claras
  - [ ] Esc fecha modal
  - [ ] Click fora fecha modal
  - [ ] Focus trap funciona

- [ ] **Loading**
  - [ ] Skeleton loaders visíveis
  - [ ] Spinners em botões
  - [ ] Sem flash de conteúdo

- [ ] **Responsividade**
  - [ ] Mobile (< 640px) funcional
  - [ ] Tablet (640-1024px) funcional
  - [ ] Desktop (> 1024px) funcional
  - [ ] Touch gestures funcionam

- [ ] **Acessibilidade**
  - [ ] Navegação por teclado funciona
  - [ ] Focus visível
  - [ ] Labels corretos
  - [ ] Contraste adequado
  - [ ] Leitor de tela funciona

---

## Progress Summary

| Categoria | Total | Feito | Em Progresso | Pendente |
|-----------|-------|-------|--------------|----------|
| **1. Preparação e Setup Base** | 3 tasks | 0 | 0 | 3 |
| **2. Componentes Globais e Infra** | 3 sections | 0 | 0 | 3 |
| **3. Dashboard Principal** | 3 sections | 0 | 0 | 3 |
| **4. Gerenciamento de Portais** | 3 sections | 0 | 0 | 3 |
| **5. Gerenciamento de Módulos** | 3 sections | 0 | 0 | 3 |
| **6. Gerenciamento de Instâncias** | 3 sections | 0 | 0 | 3 |
| **7. Configuração de Tema** | 4 sections | 0 | 0 | 4 |
| **8. Platform Settings** | 3 sections | 0 | 0 | 3 |
| **9. Responsividade** | 2 sections | 0 | 0 | 2 |
| **10. Acessibilidade** | 3 sections | 0 | 0 | 3 |
| **11. Performance** | 2 sections | 0 | 0 | 2 |
| **12. Validações e Testes** | 2 sections | 0 | 0 | 2 |
| **TOTAL** | **31 sections** | **0 (0%)** | **0 (0%)** | **31 (100%)** |

---

## Implementation Phases

### 📋 Phase 1: FOUNDATION & COMPONENTS (Weeks 1-2)
**Focus**: Base components and infrastructure
**Tasks**:
1. Audit current implementation
2. Install shadcn/ui components
3. Refactor folder structure
4. Implement global components (BreadcrumbNav, Header, EmptyState, Toast, ConfirmDialog)
5. Implement reusable components (SearchFilter, StatCard, QuickAccessCard, ActivityItem)
6. Setup loading states (skeletons, spinners)

### 📋 Phase 2: DASHBOARD & PORTALS (Weeks 3-4)
**Focus**: Dashboard and portal management
**Tasks**:
1. Implement Dashboard page with stats
2. Implement PortalList page
3. Implement PortalForm page (create/edit)
4. Implement PortalCard component
5. Implement portal deletion with confirmation
6. Test portal CRUD operations

### 📋 Phase 3: MODULES & INSTANCES (Weeks 5-6)
**Focus**: Module and instance management
**Tasks**:
1. Implement PortalModules page (tabs: active/available)
2. Implement ModuleCard components (active/available)
3. Implement module activation/deactivation with dependency validation
4. Implement InstanceList page
5. Implement InstanceForm page (dynamic form generator)
6. Implement instance CRUD operations

### 📋 Phase 4: THEME & SETTINGS (Week 7)
**Focus**: Theme configuration and platform settings
**Tasks**:
1. Implement ThemeConfig page
2. Implement ColorPicker component with contrast validation
3. Implement ThemePreview component (dual mode)
4. Implement Settings Key management
5. Implement PlatformSettings page (read-only)
6. Implement HealthCheckCard component with polling

### 📋 Phase 5: POLISH & VALIDATION (Week 8)
**Focus**: Responsiveness, accessibility, and testing
**Tasks**:
1. Implement responsive layouts (mobile, tablet, desktop)
2. Implement keyboard navigation
3. Add ARIA labels and landmarks
4. Validate contrast and accessibility
5. Run UI/UX validation checklist
6. Performance optimizations (code splitting, virtualization, debounce)
7. Final testing and bug fixes

---

## Next Actions

1. **Immediate**: Start Phase 1 (Foundation)
   - Audit current Setup module implementation
   - Document gaps vs spec/ui/setup-module-interfaces.md
   - Install all required shadcn/ui components
   - Create base component structure

2. **Short-term**: Complete Phase 1 (Week 1-2)
   - Refactor folder structure
   - Implement all global and reusable components
   - Setup validation schemas (Zod)
   - Setup custom hooks structure

3. **Medium-term**: Execute Phases 2-4 (Weeks 3-7)
   - Follow implementation order (Dashboard → Portals → Modules → Instances → Theme → Settings)
   - Test each section before moving to next
   - Maintain SPEC compliance throughout

---

## References

- **UI/UX Design**: `spec/ui/setup-module-interfaces.md` (PRIMARY)
- **Functional Requirements**: `spec/SPEC-module-setup.md`
- **Core Concepts**: `spec/SPEC-concepts.md`, `spec/SPEC-architecture.md`
- **Current Implementation**: `src/prototype-1/modules/setup/`
- **JQEL Integration**: `spec/SPEC-data-access.md`, `spec/SPEC-jqel-syntax.md`
- **Theming**: `spec/SPEC-theming.md`
- **Error Handling**: `spec/SPEC-error-handling.md`

---

**Document Version**: 1.0
**Created**: 2025-11-06
**Status**: Planejamento Completo | Aguardando Início de Implementação
**Estimated Duration**: 8 weeks (with 1 developer full-time)
