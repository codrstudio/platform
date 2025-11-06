# UI/UX Design: Módulo Setup

## Especificação de Interfaces do Módulo Setup

### Escopo
Este documento define a arquitetura de interface e padrões de UI/UX para o módulo Setup, o configurador visual da plataforma. Baseado em SPEC-module-setup.md, SPEC-concepts.md e SPEC-architecture.md.

---

## 1. Arquitetura de Navegação

### 1.1 Estrutura Hierárquica

```
┌─────────────────────────────────────────────────────────┐
│  PLATAFORMA                                             │
│  └── Portal: setup (/setup)                            │
│      └── Módulo: setup (instância: configurator)       │
│          ├── Dashboard (/)                             │
│          ├── Portals (/portals)                        │
│          │   ├── List                                  │
│          │   ├── New                                   │
│          │   ├── Edit (:portalId)                      │
│          │   ├── Theme (:portalId/theme)               │
│          │   └── Modules (:portalId/modules)           │
│          │       └── Instances                         │
│          │           (:portalId/modules/:moduleId/     │
│          │            instances)                       │
│          └── Platform Settings (/platform-settings)    │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Padrões de Navegação Adotados

**Dashboard Pattern**: Ponto de entrada com visão geral e acesso rápido
- Cards clicáveis para cada seção
- Estatísticas visuais (número de portais, módulos ativos, etc.)
- Ações rápidas (Criar Portal, Ver Platform Settings)

**Master-Detail Pattern**: Para listas e detalhes
- Lista à esquerda (ou acima em mobile)
- Detalhes/formulário à direita (ou abaixo em mobile)
- Breadcrumbs para contexto

**Modal vs Navigation**:
- **Modals**: Para confirmações destrutivas, avisos de dependências
- **Navigation**: Para formulários de criação/edição (preservar URL)

**Tabs**: Não usar tabs no primeiro nível (usar navegação de página)
- Usar tabs apenas dentro de formulários complexos (ex: config + preview)

---

## 2. Dashboard Principal

### 2.1 Wireframe

```
┌────────────────────────────────────────────────────────────────┐
│  [≡] Setup Dashboard                         [User] [Theme]    │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Visão Geral da Plataforma                               │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │ │
│  │  │  [🌐]        │  │  [📦]        │  │  [⚙️]        │   │ │
│  │  │              │  │              │  │              │   │ │
│  │  │  3 Portais   │  │  12 Módulos  │  │  25 Instânc. │   │ │
│  │  │  2 Ativos    │  │  8 Ativos    │  │  Portal Main │   │ │
│  │  │              │  │              │  │              │   │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Acesso Rápido                                           │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │  ┌────────────────────────────────────────────┐          │ │
│  │  │  [🌐] Gerenciar Portais                   │          │ │
│  │  │  Configure portais, módulos e instâncias  │→         │ │
│  │  └────────────────────────────────────────────┘          │ │
│  │                                                          │ │
│  │  ┌────────────────────────────────────────────┐          │ │
│  │  │  [⚙️] Platform Settings (Read-only)       │          │ │
│  │  │  Visualizar variáveis e health checks     │→         │ │
│  │  └────────────────────────────────────────────┘          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Atividade Recente                                       │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │  ● Portal "app" criado                    há 2 horas     │ │
│  │  ● Módulo "auth" ativado em "app"         há 3 horas     │ │
│  │  ● Instância "login-form" criada          há 3 horas     │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 2.2 Componentes

**Header Global**:
- Logo/Título: "Setup Dashboard"
- Menu hambúrguer (mobile)
- User menu (direita)
- Theme toggle (direita)

**Cards de Estatísticas** (3 cards horizontais):
- Ícone grande + título + números
- Clicáveis (levam para lista respectiva)
- Cores semânticas: info (portais), primary (módulos), success (instâncias)

**Cards de Acesso Rápido**:
- Título + descrição breve
- Ícone à esquerda
- Seta → à direita
- Hover: elevação + brand color

**Atividade Recente** (opcional):
- Lista temporal de últimas ações
- Timestamp relativo ("há X horas")
- Limite: 5 itens

### 2.3 Responsividade

**Mobile (< 640px)**:
- Cards de estatísticas: vertical (1 coluna)
- Acesso rápido: vertical
- Atividade: ocultar ou colapsar

**Tablet (640px - 1024px)**:
- Cards de estatísticas: 2 colunas + 1 linha
- Acesso rápido: vertical

**Desktop (> 1024px)**:
- Layout conforme wireframe
- Cards de estatísticas: 3 colunas

---

## 3. Lista de Portais

### 3.1 Wireframe

```
┌────────────────────────────────────────────────────────────────┐
│  [←] Portais                                    [+ Novo Portal]│
├────────────────────────────────────────────────────────────────┤
│  Home > Portais                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  [🔍 Buscar portais...]                       [⚙️ Filtros ▾]  │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  ┌────────────────────────────────────────────────────┐  │ │
│  │  │  [🌐] main                           [🔒 Protegido] │  │ │
│  │  │  ────────────────────────────────────────────────  │  │ │
│  │  │  Rota: /                                          │  │ │
│  │  │  Settings Key: default                            │  │ │
│  │  │  Módulos ativos: 0                                │  │ │
│  │  │                                                    │  │ │
│  │  │  [✏️ Editar] [🎨 Tema] [📦 Módulos]               │  │ │
│  │  └────────────────────────────────────────────────────┘  │ │
│  │                                                          │ │
│  │  ┌────────────────────────────────────────────────────┐  │ │
│  │  │  [🌐] setup                                        │  │ │
│  │  │  ────────────────────────────────────────────────  │  │ │
│  │  │  Rota: /setup                                     │  │ │
│  │  │  Settings Key: default                            │  │ │
│  │  │  Módulos ativos: 1 (setup)                        │  │ │
│  │  │                                                    │  │ │
│  │  │  [✏️ Editar] [🎨 Tema] [📦 Módulos] [🗑️ Remover]  │  │ │
│  │  └────────────────────────────────────────────────────┘  │ │
│  │                                                          │ │
│  │  ┌────────────────────────────────────────────────────┐  │ │
│  │  │  [🌐] app                                          │  │ │
│  │  │  ────────────────────────────────────────────────  │  │ │
│  │  │  Rota: /app                                       │  │ │
│  │  │  Settings Key: default                            │  │ │
│  │  │  Módulos ativos: 3 (auth, dashboard, menu)       │  │ │
│  │  │                                                    │  │ │
│  │  │  [✏️ Editar] [🎨 Tema] [📦 Módulos] [🗑️ Remover]  │  │ │
│  │  └────────────────────────────────────────────────────┘  │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  [Mostrando 3 de 3 portais]                                   │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 3.2 Componentes

**Header**:
- Botão voltar ([←])
- Título: "Portais"
- Botão primário: "+ Novo Portal" (destaque)

**Breadcrumb**:
- Home > Portais
- Clicável

**Barra de Busca/Filtro**:
- Input de busca (busca por portalId, rota)
- Dropdown de filtros: Todos | Apenas removíveis | Apenas protegidos

**Cards de Portal**:
- Ícone de portal + portalId
- Badge "🔒 Protegido" se removable=false
- Informações: rota, settings-key, módulos ativos
- Ações rápidas (botões secundários):
  - ✏️ Editar
  - 🎨 Tema
  - 📦 Módulos
  - 🗑️ Remover (apenas se removable=true)

**Estado Vazio**:
```
┌────────────────────────────────────┐
│                                    │
│         [🌐]                       │
│                                    │
│    Nenhum portal criado ainda     │
│                                    │
│  Clique em "Novo Portal" para     │
│  começar                           │
│                                    │
│      [+ Novo Portal]               │
│                                    │
└────────────────────────────────────┘
```

### 3.3 Interações

**Hover em Card**:
- Elevação (shadow)
- Border com brand color

**Click em Card**:
- Expandir para mostrar mais detalhes
- OU navegar para /portals/:portalId

**Busca**:
- Debounce de 300ms
- Filtro client-side (se < 50 portais)
- Filtro server-side (se > 50 portais)

**Remover Portal**:
- Modal de confirmação:
  ```
  ┌────────────────────────────────────┐
  │  ⚠️  Remover Portal "app"?         │
  │                                    │
  │  Esta ação irá:                    │
  │  • Desativar 3 módulos             │
  │  • Remover 5 instâncias            │
  │  • Remover configurações de tema   │
  │                                    │
  │  Esta ação não pode ser desfeita.  │
  │                                    │
  │  [Cancelar]      [🗑️ Remover]     │
  └────────────────────────────────────┘
  ```

---

## 4. Criar/Editar Portal

### 4.1 Wireframe (Criar)

```
┌────────────────────────────────────────────────────────────────┐
│  [←] Novo Portal                                     [× Fechar]│
├────────────────────────────────────────────────────────────────┤
│  Home > Portais > Novo                                         │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Informações Básicas                                   │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │                                                        │   │
│  │  Portal ID *                                           │   │
│  │  ┌──────────────────────────────────────────────────┐ │   │
│  │  │  app                                             │ │   │
│  │  └──────────────────────────────────────────────────┘ │   │
│  │  Alfanumérico, sem espaços. Não pode ser alterado.   │   │
│  │                                                        │   │
│  │  Rota *                                                │   │
│  │  ┌──────────────────────────────────────────────────┐ │   │
│  │  │  /app                                            │ │   │
│  │  └──────────────────────────────────────────────────┘ │   │
│  │  Preview: https://plataforma.com/app                  │   │
│  │                                                        │   │
│  │  Settings Key                                          │   │
│  │  ┌──────────────────────────────────────────────────┐ │   │
│  │  │  default                                    [ℹ️]  │ │   │
│  │  └──────────────────────────────────────────────────┘ │   │
│  │  Portais com mesmo Settings Key compartilham tema.   │   │
│  │  Outros portais usando "default": main, setup         │   │
│  │                                                        │   │
│  │  ☐ Portal pode ser removido                           │   │
│  │     Desmarque para tornar o portal permanente.        │   │
│  │                                                        │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  ⚠️  Validações                                         │   │
│  │  • Portal ID "app" já existe                            │   │
│  │  • Rota "/app" conflita com portal existente           │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
│  [Cancelar]                                    [💾 Criar]     │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 4.2 Componentes

**Formulário com Validação Real-time**:
- React Hook Form + Zod
- Validação client-side inline
- Erros exibidos abaixo do campo
- Campos obrigatórios com asterisco (*)

**Portal ID**:
- Input text
- Validações:
  - Alfanumérico sem espaços
  - Único (verificar via JQEL)
  - Não pode ser "main" ou "setup" (reservados)
- Hint: "Não pode ser alterado após criação"
- Disabled em modo edição

**Rota**:
- Input text com prefixo "/"
- Preview da URL completa abaixo
- Validações:
  - Começar com "/"
  - Única
  - Não conflitar com rotas estáticas (/health, /assets/*)
- Suggestion: Auto-preencher com "/" + portalId

**Settings Key**:
- Input text com autocomplete
- Ícone ℹ️ com tooltip explicativo
- Mostrar lista de portais usando o mesmo settings-key
- Validação: alfanumérico

**Portal Removível**:
- Checkbox
- Texto explicativo
- Disabled para portal "main" (sempre false)

**Painel de Validação**:
- Fixo no bottom (ou floating)
- Lista de erros/avisos
- Ícone ⚠️ para avisos, ❌ para erros
- Auto-hide quando não há erros

**Botões de Ação**:
- Cancelar (secundário, esquerda)
- Criar/Salvar (primário, direita)
- Disabled enquanto houver erros
- Loading spinner durante salvamento

### 4.3 Validações

**Client-side (Zod)**:
```typescript
const portalSchema = z.object({
  portalId: z.string()
    .regex(/^[a-z0-9]+$/i, "Apenas alfanumérico")
    .min(2, "Mínimo 2 caracteres")
    .max(32, "Máximo 32 caracteres"),
  route: z.string()
    .regex(/^\/[a-z0-9\-_/]*$/i, "Formato de rota inválido"),
  settingsKey: z.string()
    .regex(/^[a-z0-9]+$/i, "Apenas alfanumérico")
    .default("default"),
  removable: z.boolean().default(true)
})
```

**Server-side (JQEL)**:
- Verificar unicidade de portalId
- Verificar unicidade de rota
- Validar que portal "main" não pode ser removível

### 4.4 Estados

**Loading Inicial** (modo edição):
```
┌────────────────────────────────┐
│  [━━━━━━━━━━━━━━━━━]          │
│  [━━━━━━━━━━━━━━━━━]          │
│  [━━━━━━━━━━━━━━━━━]          │
│  Skeleton loaders              │
└────────────────────────────────┘
```

**Salvando**:
- Inputs desabilitados
- Botão "Salvar" com spinner
- Feedback: "Salvando portal..."

**Sucesso**:
- Toast: "✓ Portal criado com sucesso"
- Redirecionamento para /portals ou /portals/:portalId/modules

**Erro**:
- Toast: "✗ Erro ao criar portal"
- Manter no formulário
- Exibir mensagem de erro específica

---

## 5. Módulos do Portal

### 5.1 Wireframe

```
┌────────────────────────────────────────────────────────────────┐
│  [←] Módulos do Portal: app                                    │
├────────────────────────────────────────────────────────────────┤
│  Home > Portais > app > Módulos                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  [📦 Ativos (3)]  [📋 Disponíveis (9)]                   │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │                                                          │ │
│  │  MÓDULOS ATIVOS                                          │ │
│  │                                                          │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │  [✓] auth                      v1.0.0   [→ Instânc.]│ │ │
│  │  │  ─────────────────────────────────────────────────  │ │ │
│  │  │  Autenticação e autorização                        │ │ │
│  │  │  Tipo: Funcionalidade  |  Dependências: nenhuma    │ │ │
│  │  │  Instâncias: 1                                     │ │ │
│  │  │  [Desativar]                                       │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  │                                                          │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │  [✓] app-components            v2.1.0   [→ Instânc.]│ │ │
│  │  │  ─────────────────────────────────────────────────  │ │ │
│  │  │  Componentes especializados (Tables, Charts, etc)  │ │ │
│  │  │  Tipo: Componentes  |  Dependências: nenhuma       │ │ │
│  │  │  Instâncias: 0                                     │ │ │
│  │  │  🔗 Dependência de: dashboard                      │ │ │
│  │  │  [Desativar] (desabilitado)                        │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  │                                                          │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │  [✓] dashboard                 v1.5.2   [→ Instânc.]│ │ │
│  │  │  ─────────────────────────────────────────────────  │ │ │
│  │  │  Dashboard com métricas e gráficos                 │ │ │
│  │  │  Tipo: Funcionalidade  |  Dependências: app-comp.  │ │ │
│  │  │  Instâncias: 2                                     │ │ │
│  │  │  [Desativar]                                       │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  MÓDULOS DISPONÍVEIS                                     │ │
│  │                                                          │ │
│  │  [🔍 Buscar módulos...]                 [🏷️ Filtros ▾]  │ │
│  │                                                          │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │  [ ] chat                      v1.0.0              │ │ │
│  │  │  ─────────────────────────────────────────────────  │ │ │
│  │  │  Chat em tempo real com suporte a SSE             │ │ │
│  │  │  Tipo: Funcionalidade  |  Dependências: nenhuma    │ │ │
│  │  │  [Ativar]                                          │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  │                                                          │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │  [ ] menu                      v2.0.0              │ │ │
│  │  │  ─────────────────────────────────────────────────  │ │ │
│  │  │  Sistema de navegação e menu lateral              │ │ │
│  │  │  Tipo: Componentes  |  Dependências: app-comp.     │ │ │
│  │  │  [Ativar] ⓘ Ativará também: app-components        │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  │                                                          │ │
│  │  [... 7 módulos restantes]                              │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 5.2 Componentes

**Tabs/Sections**:
- Ativos (com contador)
- Disponíveis (com contador)
- Toggle entre visualizações

**Card de Módulo Ativo**:
- Checkbox checked (visual only, não interativo)
- moduleId + versão
- Link "→ Instâncias" (navega para lista de instâncias)
- Descrição
- Tipo (badge colorido)
- Dependências (lista clicável)
- Contador de instâncias
- Indicador de dependentes (se houver)
- Botão "Desativar" (disabled se tem dependentes)

**Card de Módulo Disponível**:
- Checkbox unchecked (visual only)
- moduleId + versão
- Descrição
- Tipo (badge)
- Dependências
- Aviso se ativar dependências automaticamente
- Botão "Ativar"

**Ativação com Dependências**:
```
┌────────────────────────────────────┐
│  🔗 Ativar Módulo "menu"?          │
│                                    │
│  Este módulo depende de:           │
│  • app-components (será ativado)   │
│                                    │
│  Deseja continuar?                 │
│                                    │
│  [Cancelar]         [✓ Ativar]    │
└────────────────────────────────────┘
```

**Desativação com Dependentes**:
```
┌────────────────────────────────────┐
│  ⚠️  Não é possível desativar      │
│                                    │
│  O módulo "app-components" é       │
│  usado por:                        │
│  • dashboard                       │
│  • menu                            │
│                                    │
│  Desative estes módulos primeiro.  │
│                                    │
│  [Entendi]                         │
└────────────────────────────────────┘
```

### 5.3 Visualização de Dependências (Opcional)

**Grafo de Dependências**:
```
┌────────────────────────────────────────────────────┐
│  [≡] Grafo de Dependências                         │
├────────────────────────────────────────────────────┤
│                                                    │
│         ┌───────────────┐                          │
│         │ app-components│                          │
│         └───────┬───────┘                          │
│                 │                                  │
│        ┌────────┴────────┐                         │
│        │                 │                         │
│   ┌────▼────┐      ┌────▼────┐                    │
│   │dashboard│      │  menu   │                    │
│   └─────────┘      └─────────┘                    │
│                                                    │
│   ┌─────────┐                                     │
│   │  auth   │  (sem dependências)                 │
│   └─────────┘                                     │
│                                                    │
│  Legenda:                                         │
│  ■ Ativo   □ Inativo                              │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## 6. Instâncias de Módulo

### 6.1 Wireframe

```
┌────────────────────────────────────────────────────────────────┐
│  [←] Instâncias: dashboard (portal: app)      [+ Nova Instância]│
├────────────────────────────────────────────────────────────────┤
│  Home > Portais > app > Módulos > dashboard > Instâncias       │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  ┌────────────────────────────────────────────────────┐  │ │
│  │  │  [⚙️] metrics                        [✏️] [🗑️]     │  │ │
│  │  │  ─────────────────────────────────────────────────  │  │ │
│  │  │  Status: Ativo                                     │  │ │
│  │  │  Configuração:                                     │  │ │
│  │  │    • refreshInterval: 30s                          │  │ │
│  │  │    • charts: ['bar', 'line', 'pie']                │  │ │
│  │  │    • datasource: 'platform'                        │  │ │
│  │  │                                                    │  │ │
│  │  │  [Editar] [Duplicar]                               │  │ │
│  │  └────────────────────────────────────────────────────┘  │ │
│  │                                                          │ │
│  │  ┌────────────────────────────────────────────────────┐  │ │
│  │  │  [⚙️] sales-dashboard                [✏️] [🗑️]     │  │ │
│  │  │  ─────────────────────────────────────────────────  │  │ │
│  │  │  Status: Ativo                                     │  │ │
│  │  │  Configuração:                                     │  │ │
│  │  │    • refreshInterval: 60s                          │  │ │
│  │  │    • charts: ['line', 'area']                      │  │ │
│  │  │    • datasource: 'sales'                           │  │ │
│  │  │                                                    │  │ │
│  │  │  [Editar] [Duplicar]                               │  │ │
│  │  └────────────────────────────────────────────────────┘  │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 6.2 Estado Vazio

```
┌────────────────────────────────────┐
│                                    │
│         [⚙️]                       │
│                                    │
│  Nenhuma instância criada ainda   │
│                                    │
│  Este módulo está ativo mas não   │
│  possui instâncias configuradas.   │
│                                    │
│      [+ Nova Instância]            │
│                                    │
└────────────────────────────────────┘
```

---

## 7. Criar/Editar Instância

### 7.1 Wireframe (Schema Simples)

```
┌────────────────────────────────────────────────────────────────┐
│  [←] Nova Instância: dashboard                      [× Fechar] │
├────────────────────────────────────────────────────────────────┤
│  Home > Portais > app > Módulos > dashboard > Nova Instância   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Identificação                                         │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │                                                        │   │
│  │  Instance ID *                                         │   │
│  │  ┌──────────────────────────────────────────────────┐ │   │
│  │  │  sales-dashboard                                 │ │   │
│  │  └──────────────────────────────────────────────────┘ │   │
│  │  Alfanumérico, sem espaços. Único no portal.         │   │
│  │                                                        │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Configuração                                          │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │                                                        │   │
│  │  Refresh Interval (segundos) *                        │   │
│  │  ┌──────────────────────────────────────────────────┐ │   │
│  │  │  60                                              │ │   │
│  │  └──────────────────────────────────────────────────┘ │   │
│  │  Intervalo de atualização dos dados.                 │   │
│  │                                                        │   │
│  │  Charts (selecione um ou mais)                        │   │
│  │  ☑ Bar Chart                                          │   │
│  │  ☐ Line Chart                                         │   │
│  │  ☑ Area Chart                                         │   │
│  │  ☐ Pie Chart                                          │   │
│  │                                                        │   │
│  │  Datasource *                                          │   │
│  │  ┌──────────────────────────────────────────────────┐ │   │
│  │  │  sales                                      [▾]  │ │   │
│  │  └──────────────────────────────────────────────────┘ │   │
│  │  ┌──────────────────────────────────────────────────┐ │   │
│  │  │  • sales                                         │ │   │
│  │  │  • platform                                      │ │   │
│  │  │  • analytics                                     │ │   │
│  │  └──────────────────────────────────────────────────┘ │   │
│  │                                                        │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
│  [Cancelar]                                    [💾 Salvar]    │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 7.2 Formulário Dinâmico (baseado em Schema)

**Schema do Módulo** (exemplo):
```typescript
{
  instanceId: { type: 'string', required: true },
  refreshInterval: { type: 'number', min: 10, max: 300, default: 30 },
  charts: { type: 'array', items: ['bar', 'line', 'area', 'pie'] },
  datasource: { type: 'enum', values: ['sales', 'platform', 'analytics'] }
}
```

**Geração Automática de Campos**:
- `string` → Input text
- `number` → Input number (com min/max)
- `boolean` → Checkbox
- `enum` → Select dropdown
- `array` → Checkboxes múltiplos ou multi-select
- `object` → Grupo de campos aninhados

**Validação**:
- React Hook Form + Zod (gerado do schema)
- Validação em tempo real
- Erros inline

### 7.3 Preview (Opcional)

Se o módulo suportar preview, exibir aba adicional:

```
┌────────────────────────────────────────────────────────────────┐
│  [Configuração]  [Preview]                                     │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Preview: Dashboard                                      │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │                                                          │ │
│  │  ┌────────────┐  ┌────────────┐                         │ │
│  │  │   [Bar]    │  │   [Area]   │                         │ │
│  │  │            │  │            │                         │ │
│  │  │    ▇ ▇     │  │    ╱╲      │                         │ │
│  │  │  ▇ ▇ ▇     │  │   ╱  ╲     │                         │ │
│  │  └────────────┘  └────────────┘                         │ │
│  │                                                          │ │
│  │  Datasource: sales                                       │ │
│  │  Refresh: a cada 60s                                     │ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 8. Configuração de Tema

### 8.1 Wireframe

```
┌────────────────────────────────────────────────────────────────┐
│  [←] Tema: Portal app                                          │
├────────────────────────────────────────────────────────────────┤
│  Home > Portais > app > Tema                                   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────┐  ┌──────────────────────────────────┐   │
│  │  Configuração    │  │  Preview                         │   │
│  │                  │  │                                  │   │
│  │  Theme Mode      │  │  ┌────────────────────────────┐ │   │
│  │  ( ) Light       │  │  │  [Light Mode Preview]      │ │   │
│  │  (●) Dark        │  │  │                            │ │   │
│  │  ( ) System      │  │  │  ┌──────────────────────┐  │ │   │
│  │                  │  │  │  │  [Button Primary]   │  │ │   │
│  │  Brand Color     │  │  │  │  [Button Secondary] │  │ │   │
│  │  ┌────────────┐  │  │  │  └──────────────────────┘  │ │   │
│  │  │   [🎨]     │  │  │  │                            │ │   │
│  │  │   #3B82F6  │  │  │  │  Text colors OK ✓          │ │   │
│  │  └────────────┘  │  │  │  Contrast: 7.2:1 (AA)      │ │   │
│  │                  │  │  └────────────────────────────┘ │   │
│  │  ✓ Contraste OK  │  │                                  │   │
│  │  WCAG AA         │  │  ┌────────────────────────────┐ │   │
│  │                  │  │  │  [Dark Mode Preview]       │ │   │
│  │  Settings Key    │  │  │                            │ │   │
│  │  ┌────────────┐  │  │  │  ┌──────────────────────┐  │ │   │
│  │  │  default   │  │  │  │  │  [Button Primary]   │  │ │   │
│  │  └────────────┘  │  │  │  │  [Button Secondary] │  │ │   │
│  │  ℹ️  Compartilha │  │  │  └──────────────────────┘  │ │   │
│  │  com: main,setup│  │  │                            │ │   │
│  │                  │  │  │  Text colors OK ✓          │ │   │
│  │  [Criar Novo]    │  │  │  Contrast: 8.1:1 (AAA)     │ │   │
│  │                  │  │  └────────────────────────────┘ │   │
│  │                  │  │                                  │   │
│  └──────────────────┘  └──────────────────────────────────┘   │
│                                                                │
│  [Cancelar]                                    [💾 Salvar]    │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 8.2 Componentes

**Theme Mode**:
- Radio buttons: Light, Dark, System
- Ícones visuais (☀️ ☾ 🖥️)
- Preview atualiza em tempo real

**Brand Color Picker**:
- Componente `react-colorful`
- Input hex color
- Validação de contraste automática
- Indicador visual: ✓ OK, ⚠️ Contraste baixo, ✗ Insuficiente
- Sugestão de ajuste automático se contraste < WCAG AA

**Preview Dual**:
- Duas seções: Light e Dark
- Preview lado a lado (desktop) ou stacked (mobile)
- Mostra: botões, cards, texto em background
- Indicadores de contraste por seção

**Settings Key**:
- Input text
- Lista de portais compartilhando o mesmo key
- Botão "Criar Novo" → modal para novo settings key

**Validação de Contraste**:
```
┌────────────────────────────────────┐
│  ⚠️  Contraste Insuficiente         │
│                                    │
│  A cor escolhida (#E0E0E0) não     │
│  atinge contraste mínimo WCAG AA.  │
│                                    │
│  Contraste atual: 2.8:1            │
│  Necessário: 4.5:1                 │
│                                    │
│  Sugestão: #B8B8B8 (4.6:1)         │
│                                    │
│  [Ignorar]      [Usar Sugestão]   │
└────────────────────────────────────┘
```

---

## 9. Platform Settings (Read-only)

### 9.1 Wireframe

```
┌────────────────────────────────────────────────────────────────┐
│  [←] Platform Settings                                         │
├────────────────────────────────────────────────────────────────┤
│  Home > Platform Settings                                      │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  ℹ️  Estas configurações são definidas no arquivo `.env`  │ │
│  │  no servidor. Alterações requerem edição manual do       │ │
│  │  arquivo e restart da aplicação.                         │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Variáveis de Ambiente                                   │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │                                                          │ │
│  │  NODE_ENV                                                │ │
│  │  production                                              │ │
│  │                                                          │ │
│  │  BACKEND_URL                                             │ │
│  │  https://api.plataforma.com                              │ │
│  │                                                          │ │
│  │  N8N_BASE_URL                                            │ │
│  │  https://n8n.plataforma.com                              │ │
│  │                                                          │ │
│  │  REDIS_URL                                               │ │
│  │  redis://localhost:6379 (senha oculta)                   │ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Health Checks                                           │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │                                                          │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │  [✓] Backend          Funcionando                  │ │ │
│  │  │  ────────────────────────────────────────────────  │ │ │
│  │  │  Last check: há 5 segundos                         │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  │                                                          │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │  [✓] n8n              Conectado                    │ │ │
│  │  │  ────────────────────────────────────────────────  │ │ │
│  │  │  URL: https://n8n.plataforma.com                   │ │ │
│  │  │  Last check: há 5 segundos                         │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  │                                                          │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │  [✓] Redis            Conectado                    │ │ │
│  │  │  ────────────────────────────────────────────────  │ │ │
│  │  │  URL: redis://localhost:6379                       │ │ │
│  │  │  Last check: há 5 segundos                         │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  │                                                          │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │  [✗] Database         Erro de conexão              │ │ │
│  │  │  ────────────────────────────────────────────────  │ │ │
│  │  │  Erro: Connection timeout                          │ │ │
│  │  │  Last check: há 5 segundos                         │ │ │
│  │  │  [Tentar Novamente]                                │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  │                                                          │ │
│  │  [🔄 Atualizar Todos]                                   │ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 9.2 Componentes

**Aviso Read-only**:
- Banner informativo no topo
- Cor: info (azul)
- Ícone ℹ️

**Variáveis de Ambiente**:
- Lista key-value
- Texto não editável
- Valores sensíveis mascarados (senhas)
- Copy-to-clipboard (ícone 📋)

**Health Check Cards**:
- Status visual: ✓ (verde), ✗ (vermelho), ⟳ (loading)
- Nome do serviço
- Status textual
- URL/configuração (se aplicável)
- Timestamp da última verificação
- Botão "Tentar Novamente" se erro
- Auto-refresh a cada 30s

**Estados**:
- ✓ Conectado (verde)
- ✗ Erro (vermelho)
- ⟳ Verificando (cinza, spinner)

---

## 10. Padrões Globais de UI

### 10.1 Navegação e Breadcrumbs

**Breadcrumb Pattern**:
```
Home > Portais > app > Módulos > dashboard > Instâncias
  ↑       ↑       ↑       ↑         ↑            ↑
  Link    Link    Link    Link      Link      Current
```

- Todos os níveis clicáveis (exceto o atual)
- Separador: ">"
- Current: bold ou cor diferente

**Botão Voltar**:
- Sempre presente no canto superior esquerdo
- Ícone [←]
- Volta para página anterior da hierarquia (não history.back())

### 10.2 Loading States

**Skeleton Loaders**:
```
┌────────────────────────────────┐
│  [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓]    │  ← Título
│  [▓▓▓▓▓▓▓▓▓▓▓]                │  ← Subtítulo
│  [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] │  ← Conteúdo
│  [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓]    │
└────────────────────────────────┘
```

- Usar para listas, cards, formulários
- Animação de shimmer (opcional)
- Cor: cinza claro

**Spinners**:
- Botões: spinner pequeno ao lado do texto
- Páginas: spinner centralizado
- Cards: spinner no centro do card

### 10.3 Estados Vazios

**Padrão Consistente**:
```
┌────────────────────────────────┐
│                                │
│         [Ícone Grande]         │
│                                │
│      Mensagem Principal        │
│                                │
│  Descrição opcional mais       │
│  detalhada do estado vazio     │
│                                │
│      [Ação Principal]          │
│                                │
└────────────────────────────────┘
```

- Ícone: relacionado ao contexto (🌐 portais, 📦 módulos, ⚙️ instâncias)
- Mensagem: clara e acionável
- Ação: botão primário (ex: "Criar Portal")

### 10.4 Feedback (Toasts/Snackbars)

**Posicionamento**:
- Top-right (desktop)
- Top-center (mobile)

**Tipos**:
```
┌─────────────────────────────────┐
│  ✓  Sucesso!                    │ ← Verde
│  Portal criado com sucesso.     │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  ℹ️  Informação                  │ ← Azul
│  Módulo sendo carregado...      │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  ⚠️  Atenção                     │ ← Amarelo
│  Contraste abaixo do mínimo.    │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  ✗  Erro                        │ ← Vermelho
│  Falha ao salvar portal.        │
│  [Tentar Novamente]             │
└─────────────────────────────────┘
```

**Duração**:
- Sucesso: 3s
- Info: 5s
- Atenção: 7s
- Erro: manual (botão fechar)

**Ação de Desfazer**:
```
┌─────────────────────────────────┐
│  ✓  Portal removido             │
│  [Desfazer]                     │
└─────────────────────────────────┘
```

### 10.5 Modais de Confirmação

**Padrão Destrutivo**:
```
┌────────────────────────────────────┐
│  ⚠️  Título da Ação Destrutiva     │
│                                    │
│  Descrição clara do que vai        │
│  acontecer se confirmar.           │
│                                    │
│  Consequências:                    │
│  • Item 1                          │
│  • Item 2                          │
│                                    │
│  Esta ação não pode ser desfeita.  │
│                                    │
│  [Cancelar]      [🗑️ Confirmar]   │
│  (secundário)    (danger)          │
└────────────────────────────────────┘
```

**Padrão Informativo**:
```
┌────────────────────────────────────┐
│  ℹ️  Título Informativo             │
│                                    │
│  Informação relevante para a       │
│  ação que o usuário vai tomar.     │
│                                    │
│  Detalhes adicionais se necessário.│
│                                    │
│  [Cancelar]      [✓ Continuar]    │
└────────────────────────────────────┘
```

### 10.6 Validação de Formulários

**Inline Validation**:
```
Instance ID *
┌──────────────────────────────┐
│  my instance                 │
└──────────────────────────────┘
✗ Espaços não são permitidos
```

**Sucesso**:
```
Portal ID *
┌──────────────────────────────┐
│  myapp                   ✓   │
└──────────────────────────────┘
```

**Regras**:
- Validar ao perder foco (onBlur)
- Validar ao digitar (com debounce) se campo tem erro
- Ícones: ✓ (sucesso), ✗ (erro), ⚠️ (aviso)
- Cores semânticas

---

## 11. Responsividade

### 11.1 Mobile (< 640px)

**Dashboard**:
- Cards de estatísticas: vertical (1 coluna)
- Acesso rápido: vertical
- Atividade: ocultar ou colapsar

**Lista de Portais**:
- Cards: full width
- Ações: menu dropdown (3 pontos)

**Formulários**:
- Inputs: full width
- Botões: full width, stacked

**Módulos do Portal**:
- Tabs: scrollable horizontal
- Cards: vertical

**Tema**:
- Configuração e Preview: stacked (config acima, preview abaixo)

### 11.2 Tablet (640px - 1024px)

**Dashboard**:
- Cards de estatísticas: 2 colunas
- Layout híbrido

**Lista de Portais**:
- Cards: 2 colunas ou full width

**Formulários**:
- Campos menores: 2 colunas
- Campos grandes: full width

**Tema**:
- Side-by-side com ajustes

### 11.3 Desktop (> 1024px)

- Layout conforme wireframes
- Aproveitamento de espaço horizontal
- Master-detail: lado a lado

---

## 12. Acessibilidade (WCAG 2.1 AA)

### 12.1 Navegação por Teclado

**Tab Order**:
1. Header (logo, menu)
2. Breadcrumb
3. Conteúdo principal (top-to-bottom, left-to-right)
4. Ações primárias
5. Footer (se houver)

**Atalhos**:
- `Esc`: Fechar modal/dropdown
- `Enter`: Confirmar/Salvar
- `Space`: Toggle checkbox/radio
- `Arrow Keys`: Navegar em dropdowns/listas

**Focus Visible**:
```
┌──────────────────────────────┐
│  Button com Focus        ←──────── Ring azul (2px)
└──────────────────────────────┘
```

### 12.2 Leitores de Tela

**Landmarks**:
- `<header>`: Cabeçalho global
- `<nav>`: Breadcrumb e navegação
- `<main>`: Conteúdo principal
- `<aside>`: Informações complementares
- `<footer>`: Rodapé

**ARIA Labels**:
- Botões com ícones: `aria-label="Editar portal"`
- Inputs: associar com `<label>` via `htmlFor`
- Status: `aria-live="polite"` para toasts
- Loading: `aria-busy="true"`

**Alt Text**:
- Ícones decorativos: `aria-hidden="true"`
- Ícones funcionais: `aria-label`

### 12.3 Contraste de Cores

**Mínimos WCAG AA**:
- Texto normal: 4.5:1
- Texto grande (18px+): 3:1
- Elementos UI (botões, borders): 3:1

**Validação Automática**:
- Color picker deve validar contraste
- Avisar se < WCAG AA
- Sugerir ajustes automáticos

---

## 13. Performance

### 13.1 Code Splitting

**Por Rota**:
```typescript
// Lazy load de páginas
const PortalList = lazy(() => import('./pages/PortalList'))
const PortalForm = lazy(() => import('./pages/PortalForm'))
const ModuleList = lazy(() => import('./pages/ModuleList'))
```

**Por Módulo**:
- Módulo Setup deve ser um chunk separado
- Sub-páginas do Setup podem ser lazy-loaded

### 13.2 Otimizações

**Listas Virtualizadas**:
- Se > 50 portais/módulos, usar TanStack Virtual
- Renderizar apenas items visíveis

**Debounce**:
- Busca: 300ms
- Validação inline: 500ms

**Cache**:
- TanStack Query cache para JQEL queries
- Invalidar após mutations

**Imagens**:
- Ícones: usar Lucide (SVG)
- Logos: lazy load

---

## 14. Padrões de Código

### 14.1 Estrutura de Componentes

```typescript
// src/modules/setup/pages/PortalList.tsx

import { useState } from 'react'
import { useJQELQuery } from '@/hooks/jqel/useJQELQuery'
import { PortalCard } from '../components/PortalCard'
import { Button } from '@/components/ui/button'
import { Search, Plus } from 'lucide-react'

export function PortalList() {
  const [search, setSearch] = useState('')

  const { data: portals, isLoading } = useJQELQuery({
    schema: 'backend',
    select: 'portal'
  })

  const filteredPortals = portals?.filter(p =>
    p.portalId.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) return <PortalListSkeleton />

  return (
    <div className="container mx-auto p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Portais</h1>
        <Button asChild>
          <Link to="/portals/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Portal
          </Link>
        </Button>
      </header>

      <div className="mb-4">
        <Input
          placeholder="Buscar portais..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search />}
        />
      </div>

      <div className="grid gap-4">
        {filteredPortals?.map(portal => (
          <PortalCard key={portal.portalId} portal={portal} />
        ))}
      </div>
    </div>
  )
}
```

### 14.2 Formulários

```typescript
// src/modules/setup/pages/PortalForm.tsx

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useJQELMutation } from '@/hooks/jqel/useJQELMutation'
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

const portalSchema = z.object({
  portalId: z.string()
    .regex(/^[a-z0-9]+$/i, "Apenas alfanumérico")
    .min(2, "Mínimo 2 caracteres"),
  route: z.string()
    .regex(/^\/[a-z0-9\-_/]*$/i, "Formato de rota inválido"),
  settingsKey: z.string().default("default"),
  removable: z.boolean().default(true)
})

type PortalFormValues = z.infer<typeof portalSchema>

export function PortalForm() {
  const form = useForm<PortalFormValues>({
    resolver: zodResolver(portalSchema),
    defaultValues: {
      settingsKey: "default",
      removable: true
    }
  })

  const mutation = useJQELMutation()

  const onSubmit = (data: PortalFormValues) => {
    mutation.mutate({
      schema: 'backend',
      mutate: 'portal',
      action: 'insert',
      values: data
    }, {
      onSuccess: () => {
        toast.success('Portal criado com sucesso')
        navigate('/portals')
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="portalId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Portal ID *</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Alfanumérico, sem espaços. Não pode ser alterado.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Outros campos... */}

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Salvando...' : 'Criar'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
```

---

## 15. Testes de UI/UX

### 15.1 Checklist de Validação

**Navegação**:
- [ ] Breadcrumbs funcionam corretamente
- [ ] Botão voltar leva para página correta
- [ ] Links levam para rotas corretas
- [ ] Menu hambúrguer funciona em mobile

**Formulários**:
- [ ] Validação inline funciona
- [ ] Erros são exibidos claramente
- [ ] Sucesso mostra feedback
- [ ] Cancelar volta sem salvar

**Listas**:
- [ ] Busca funciona
- [ ] Filtros funcionam
- [ ] Cards clicáveis
- [ ] Ações rápidas funcionam
- [ ] Estado vazio exibido corretamente

**Modais**:
- [ ] Confirmações destrutivas claras
- [ ] Esc fecha modal
- [ ] Click fora fecha modal
- [ ] Focus trap funciona

**Loading**:
- [ ] Skeleton loaders visíveis
- [ ] Spinners em botões
- [ ] Sem flash de conteúdo

**Responsividade**:
- [ ] Mobile (< 640px) funcional
- [ ] Tablet (640-1024px) funcional
- [ ] Desktop (> 1024px) funcional
- [ ] Touch gestures funcionam

**Acessibilidade**:
- [ ] Navegação por teclado funciona
- [ ] Focus visível
- [ ] Labels corretos
- [ ] Contraste adequado
- [ ] Leitor de tela funciona

---

## 16. Próximos Passos

### 16.1 Fase 1: Estrutura Base
1. Criar componentes UI base (shadcn/ui)
2. Implementar roteamento do módulo Setup
3. Criar layouts responsivos base

### 16.2 Fase 2: Gerenciamento de Portais
1. Lista de portais
2. Criar portal
3. Editar portal
4. Remover portal

### 16.3 Fase 3: Gerenciamento de Módulos
1. Lista de módulos por portal
2. Ativar módulo
3. Desativar módulo
4. Validação de dependências

### 16.4 Fase 4: Gerenciamento de Instâncias
1. Lista de instâncias
2. Criar instância (formulário dinâmico)
3. Editar instância
4. Remover instância

### 16.5 Fase 5: Configuração de Tema
1. Seletor de theme mode
2. Color picker com validação de contraste
3. Preview dual (light/dark)
4. Settings key management

### 16.6 Fase 6: Platform Settings
1. Visualização de variáveis de ambiente
2. Health checks
3. Auto-refresh

### 16.7 Fase 7: Polimento
1. Animações e transições
2. Melhorias de performance
3. Testes de acessibilidade
4. Ajustes de responsividade

---

## Conclusão

Este documento define a arquitetura completa de UI/UX para o módulo Setup, seguindo:

- **SPEC-module-setup.md**: Todas as funcionalidades especificadas
- **SPEC-concepts.md**: Conceitos de Portal, Módulo, Instância
- **SPEC-architecture.md**: Stack tecnológico (React 19, shadcn/ui, Tailwind, etc.)

**Padrões Adotados**:
- Dashboard como ponto de entrada
- Master-Detail para listas
- Navegação hierárquica com breadcrumbs
- Formulários com validação inline (React Hook Form + Zod)
- Modais para confirmações destrutivas
- Feedback via toasts
- Loading com skeletons
- Estados vazios claros e acionáveis
- Responsividade (mobile-first)
- Acessibilidade (WCAG 2.1 AA)

**Tecnologias**:
- React 19 + TypeScript
- shadcn/ui (única biblioteca de UI permitida)
- Tailwind CSS (zero CSS customizado)
- React Hook Form + Zod
- Lucide React (ícones)
- TanStack Query (JQEL)

Esta especificação serve como guia completo para implementação do módulo Setup, garantindo consistência, qualidade e aderência aos requisitos da plataforma.
