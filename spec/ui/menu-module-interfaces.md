# UI/UX Design: Módulo Menu (Sidebar)

## Especificação de Interfaces do Módulo Menu

### Escopo
Este documento define a arquitetura de interface e padrões de UI/UX para o módulo Menu (Sidebar), o sistema de navegação da plataforma. Baseado em SPEC-module-sidebar.md, SPEC-concepts.md e SPEC-architecture.md.

---

## 1. Arquitetura de Navegação

### 1.1 Tipos de Layout

```
┌─────────────────────────────────────────────────────────┐
│  LAYOUTS DISPONÍVEIS                                    │
│                                                         │
│  1. Sidebar Lateral (Esquerda)                         │
│     ┌──────┬─────────────────────────────┐            │
│     │ MENU │ CONTEÚDO                    │            │
│     │      │                             │            │
│     └──────┴─────────────────────────────┘            │
│                                                         │
│  2. Sidebar Lateral (Direita)                          │
│     ┌─────────────────────────────┬──────┐            │
│     │ CONTEÚDO                    │ MENU │            │
│     │                             │      │            │
│     └─────────────────────────────┴──────┘            │
│                                                         │
│  3. Navbar Superior                                     │
│     ┌─────────────────────────────────────┐           │
│     │ MENU HORIZONTAL                      │           │
│     ├─────────────────────────────────────┤           │
│     │ CONTEÚDO                            │           │
│     │                                     │           │
│     └─────────────────────────────────────┘           │
│                                                         │
│  4. Mobile Drawer (Overlay)                            │
│     ┌─────────────────────────────────────┐           │
│     │ [☰] HEADER                          │           │
│     ├──────┬──────────────────────────────┤           │
│     │ MENU │ CONTEÚDO (sobreposto)        │           │
│     │      │                              │           │
│     └──────┴──────────────────────────────┘           │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Padrões de Navegação Adotados

**Hierarchical Navigation Pattern**: Navegação em árvore com níveis
- Até 3 níveis de profundidade
- Expandir/colapsar com chevron
- Breadcrumb opcional para contexto

**Active State Pattern**: Indicação clara da rota atual
- Item ativo destacado visualmente
- Auto-expansão do pai se item está em submenu
- Persistência de estado de expansão

**Responsive Pattern**: Adaptação por tamanho de tela
- Desktop: Sidebar expandido por padrão
- Tablet: Sidebar colapsável (ícones + texto)
- Mobile: Drawer com overlay

**Permission-Based Pattern**: Controle de visibilidade
- Itens com permissão verificada via `/api/1/auth/authorize`
- Itens sem permissão não são renderizados

---

## 2. Sidebar Lateral - Expandido

### 2.1 Wireframe (Desktop - Expandido)

```
┌────────────────────────────────────────────────────────────────┐
│  ┌──────────────────────┐  ┌──────────────────────────────┐   │
│  │  SIDEBAR (256px)     │  │  CONTEÚDO PRINCIPAL          │   │
│  ├──────────────────────┤  │                              │   │
│  │                      │  │                              │   │
│  │  ┌────────────────┐  │  │                              │   │
│  │  │ [👤] John Doe  │  │  │                              │   │
│  │  │  john@email.com│  │  │                              │   │
│  │  └────────────────┘  │  │                              │   │
│  │                      │  │                              │   │
│  │  [🔍 Buscar...]     │  │                              │   │
│  │                      │  │                              │   │
│  │  ──────────────────  │  │                              │   │
│  │                      │  │                              │   │
│  │  [📊] Dashboard      │  │                              │   │
│  │  [👥] Usuários       │  │                              │   │
│  │  [💬] Chat       [3] │  │                              │   │
│  │  [📝] Tarefas   [12] │  │                              │   │
│  │  [🔔] Notific.   [5] │  │                              │   │
│  │                      │  │                              │   │
│  │  ● Configurações ▾   │  │                              │   │
│  │    ├─ Perfil        │  │                              │   │
│  │    ├─ Segurança     │  │                              │   │
│  │    └─ Preferências  │  │                              │   │
│  │                      │  │                              │   │
│  │  ● Relatórios ▸      │  │                              │   │
│  │                      │  │                              │   │
│  │  ──────────────────  │  │                              │   │
│  │                      │  │                              │   │
│  │  [🌙] Tema          │  │                              │   │
│  │  [❓] Ajuda         │  │                              │   │
│  │  [⚙️] Setup          │  │                              │   │
│  │                      │  │                              │   │
│  │  [◀] Recolher       │  │                              │   │
│  │                      │  │                              │   │
│  └──────────────────────┘  └──────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

### 2.2 Componentes da Sidebar Expandida

**User Menu (Topo)**:
- Avatar (imagem ou iniciais)
- Nome do usuário
- Email (opcional)
- Dropdown ao clicar (Perfil, Configurações, Logout)
- Status online/offline (opcional)

**Search Field**:
- Input com ícone de busca
- Placeholder: "Buscar..."
- Filtra itens do menu em tempo real
- Debounce de 300ms
- Limpar busca com X

**Menu Items**:
- Ícone (Lucide React) + Label
- Estado normal/hover/active
- Badge (contador) à direita
- Indicador visual de item ativo (borda ou background)
- Submenu com chevron (▸ colapsado, ▾ expandido)

**Submenu Items**:
- Indentação visual (padding-left)
- Animação de slide down/up
- Estado de expansão persistido
- Até 3 níveis de profundidade

**Separadores**:
- Linha horizontal (`<Separator />`)
- Espaçamento adequado (my-2)

**Footer Actions**:
- Ações globais (Tema, Ajuda, Setup)
- Botão de collapse/expand

**Collapse Button**:
- Ícone ◀ (esquerda) ou ▶ (direita)
- Tooltip: "Recolher menu" / "Expandir menu"
- Transição suave de largura

### 2.3 Estados Visuais

**Item Normal**:
```
┌────────────────────────┐
│  [📊] Dashboard        │  ← Hover: bg-accent
└────────────────────────┘
```

**Item Ativo**:
```
┌────────────────────────┐
│ │[📊] Dashboard        │  ← Borda esquerda + bg-primary/10
└────────────────────────┘
```

**Item com Badge**:
```
┌────────────────────────┐
│  [💬] Chat         [3] │  ← Badge com cor semântica
└────────────────────────┘
```

**Item Expandido**:
```
┌────────────────────────┐
│  ● Configurações ▾     │  ← Chevron indica expandido
│    ├─ Perfil          │  ← Subitens indentados
│    ├─ Segurança       │
│    └─ Preferências    │
└────────────────────────┘
```

**Item Colapsado (Parent)**:
```
┌────────────────────────┐
│  ● Relatórios ▸        │  ← Chevron indica colapsado
└────────────────────────┘
```

---

## 3. Sidebar Lateral - Colapsado

### 3.1 Wireframe (Desktop - Colapsado)

```
┌────────────────────────────────────────────────────────┐
│  ┌─────┐  ┌────────────────────────────────────────┐  │
│  │ 64px│  │  CONTEÚDO PRINCIPAL                    │  │
│  ├─────┤  │                                        │  │
│  │     │  │                                        │  │
│  │ [👤]│  │                                        │  │
│  │     │  │                                        │  │
│  │ [🔍]│  │                                        │  │
│  │     │  │                                        │  │
│  │ ─── │  │                                        │  │
│  │     │  │                                        │  │
│  │ [📊]│  │                                        │  │
│  │ [👥]│  │                                        │  │
│  │ [💬]│ 3│                                        │  │
│  │ [📝]│12│                                        │  │
│  │ [🔔]│ 5│                                        │  │
│  │     │  │                                        │  │
│  │ [⚙️]│  │                                        │  │
│  │     │  │                                        │  │
│  │ ─── │  │                                        │  │
│  │     │  │                                        │  │
│  │ [🌙]│  │                                        │  │
│  │ [❓]│  │                                        │  │
│  │ [⚙️]│  │                                        │  │
│  │     │  │                                        │  │
│  │ [▶] │  │                                        │  │
│  │     │  │                                        │  │
│  └─────┘  └────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### 3.2 Comportamento Colapsado

**Ícones Apenas**:
- Largura: 64px (configurável)
- Apenas ícones visíveis
- Labels ocultos
- Badges posicionados no canto superior direito do ícone

**Tooltips Obrigatórios**:
```
┌─────────────────────┐
│  Tooltip: "Chat"    │
│  ┌─────┐            │
│  │ [💬]│            │
│  └─────┘            │
└─────────────────────┘
```
- Tooltip em todos os ícones
- Posição: direita (sidebar esquerda) ou esquerda (sidebar direita)
- Delay: 500ms

**Submenu em Hover**:
```
┌─────┐  ┌────────────────────┐
│ [⚙️]│──│ Configurações      │
│     │  ├────────────────────┤
│     │  │  Perfil           │
│     │  │  Segurança        │
│     │  │  Preferências     │
│     │  └────────────────────┘
└─────┘
```
- Hover no ícone mostra submenu em popover
- Popover posicionado à direita/esquerda
- Animação de fade in
- Fecha ao sair do hover (delay 300ms)

**User Menu Colapsado**:
- Apenas avatar
- Tooltip com nome do usuário
- Click abre dropdown (mesmas opções)

**Search Colapsado**:
- Ícone 🔍 apenas
- Click expande sidebar temporariamente OU abre Command Palette

---

## 4. Navbar Superior

### 4.1 Wireframe (Desktop)

```
┌────────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ [Logo] Home  Docs  Pricing  About      [🔍] [🔔][👤]▾  │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                                                          │  │
│  │  CONTEÚDO PRINCIPAL                                     │  │
│  │                                                          │  │
│  │                                                          │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### 4.2 Componentes da Navbar

**Layout Horizontal**:
- Altura: 64px (configurável)
- Sticky/Fixed no topo (opcional)
- Flex layout: esquerda + centro + direita

**Área Esquerda**:
- Logo (opcional, link para home)
- Itens de menu principais
- Dropdown para submenus

**Área Centro**:
- Itens de menu secundários (opcional)
- Busca centralizada (opcional)

**Área Direita**:
- Ícones de ação (busca, notificações)
- Theme toggle
- User menu com dropdown
- Avatar + nome (pode esconder nome em mobile)

**Dropdown de Submenu**:
```
┌──────────────────────┐
│  Configurações  ▾    │
└──────┬───────────────┘
       │ ┌──────────────────┐
       └─│  Perfil         │
         │  Segurança      │
         │  Preferências   │
         └──────────────────┘
```
- Posicionado abaixo do item
- Animação de slide down
- Fecha ao clicar fora
- Até 2 níveis de submenu

### 4.3 Responsividade da Navbar

**Desktop (>1024px)**:
- Todos os itens visíveis
- Menus dropdown

**Tablet (768px - 1024px)**:
- Itens principais visíveis
- Itens secundários em "More" menu

**Mobile (<768px)**:
- Logo + Hamburger + User menu
- Hamburger abre drawer com todos os itens

---

## 5. Mobile Drawer

### 5.1 Wireframe (Mobile)

```
┌─────────────────────────────┐
│ [☰]  App Name      [👤]    │  ← Header fixo
├─────────────────────────────┤
│ [Overlay escuro - 50%]      │
│ ┌───────────────────────┐   │
│ │ DRAWER (80% width)    │   │
│ │                       │   │
│ │ [👤] John Doe         │   │
│ │     john@email.com    │   │
│ │                       │   │
│ │ [🔍 Buscar...]        │   │
│ │                       │   │
│ │ ─────────────────     │   │
│ │                       │   │
│ │ [📊] Dashboard        │   │
│ │ [👥] Usuários         │   │
│ │ [💬] Chat         [3] │   │
│ │ [📝] Tarefas     [12] │   │
│ │                       │   │
│ │ ● Config. ▾           │   │
│ │   ├─ Perfil          │   │
│ │   └─ Segurança       │   │
│ │                       │   │
│ │ ─────────────────     │   │
│ │                       │   │
│ │ [🌙] Tema             │   │
│ │ [❓] Ajuda            │   │
│ │                       │   │
│ └───────────────────────┘   │
│                             │
└─────────────────────────────┘
```

### 5.2 Comportamento Mobile

**Hamburger Menu**:
- Ícone ☰ (três linhas horizontais)
- Posição: canto superior esquerdo
- Click abre drawer
- Animação de slide in da esquerda

**Drawer Overlay**:
- Background escuro semi-transparente (50% opacity)
- Cobre toda a tela
- Click no overlay fecha drawer
- Swipe para esquerda fecha drawer

**Drawer Panel**:
- Largura: 80% da tela (max 320px)
- Slide in da esquerda
- Todos os itens do menu
- Scroll interno se necessário

**Comportamento de Navegação**:
- Click em item fecha drawer automaticamente (configurável)
- Animação de fade out
- Transição suave (300ms)

**Estados do Hamburger**:
```
Fechado: ☰  (três linhas)
Aberto:  ✕  (X para fechar)
```

---

## 6. Menu Items - Especificação Detalhada

### 6.1 Estrutura de Dados

```typescript
interface MenuItem {
  id: string;                    // Identificador único
  label: string;                 // Texto exibido
  icon?: string;                 // Ícone (lucide-react)
  route?: string;                // Rota de navegação
  onClick?: () => void;          // Handler customizado
  permission?: string;           // Permissão necessária
  badge?: MenuBadge;             // Badge (contador, status)
  children?: MenuItem[];         // Subitens (menu aninhado)
  disabled?: boolean;            // Item desabilitado
  divider?: boolean;             // Inserir separador após item
  header?: boolean;              // Item é header (não clicável)
}

interface MenuBadge {
  text: string;                  // Texto do badge
  variant: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  pulse?: boolean;               // Animação de pulso
}
```

### 6.2 Tipos de Item

**Item de Navegação**:
```typescript
{
  id: "dashboard",
  label: "Dashboard",
  icon: "LayoutDashboard",
  route: "/dashboard"
}
```
- Navega via React Router
- Detecta se está ativo via `useLocation()`
- Usa `<Link>` component

**Item com Action**:
```typescript
{
  id: "logout",
  label: "Sair",
  icon: "LogOut",
  onClick: () => handleLogout()
}
```
- Executa função customizada
- Não navega
- Útil para modals, confirmações, etc.

**Item com Submenu**:
```typescript
{
  id: "settings",
  label: "Configurações",
  icon: "Settings",
  children: [
    { id: "profile", label: "Perfil", route: "/settings/profile" },
    { id: "security", label: "Segurança", route: "/settings/security" }
  ]
}
```
- Chevron à direita
- Expandir/colapsar ao clicar
- Subitens indentados

**Header (Não Clicável)**:
```typescript
{
  id: "section-admin",
  label: "ADMINISTRAÇÃO",
  header: true
}
```
- Texto em uppercase/small font
- Não clicável
- Usado para separar seções

**Separador**:
```typescript
{
  id: "sep-1",
  divider: true
}
```
- Linha horizontal
- Sem label ou ícone

### 6.3 Badges Dinâmicos

**Contador**:
```
[💬] Chat              [3]
```
- Variant: `primary` (azul)
- Atualizado via SSE ou polling
- Formato: número ou "99+"

**Status**:
```
[🔔] Notificações      [•]
```
- Variant: `danger` (vermelho)
- Indicador de "novo"
- Pode ter pulso animado

**Implementação**:
```typescript
// Hook para badges dinâmicos
const { badge } = useMenuBadge('chat', {
  query: { schema: 'platform', select: 'messages', where: { unread: true } },
  format: (count) => count > 99 ? '99+' : String(count),
  variant: 'primary'
});
```

---

## 7. Permissões e Visibilidade

### 7.1 Controle de Acesso

**Item com Permissão**:
```typescript
{
  id: "users",
  label: "Usuários",
  icon: "Users",
  route: "/users",
  permission: "read.usuarios"
}
```

**Verificação de Permissão**:
```typescript
// Componente interno verifica permissão
const { hasPermission, isLoading } = usePermission(item.permission);

if (isLoading) return <SkeletonMenuItem />;
if (!hasPermission) return null; // Não renderiza
return <MenuItem {...item} />;
```

**Chamada para Backend**:
```typescript
POST /api/1/auth/authorize
{
  "resource": "read.usuarios",
  "action": "read",
  "context": {
    "portalId": "app",
    "moduleId": "sidebar"
  }
}
```

### 7.2 Estados de Loading

**Menu Loading (First Render)**:
```
┌────────────────────────┐
│  [▓▓▓▓▓▓▓▓▓▓▓▓▓▓]      │  ← Skeleton
│  [▓▓▓▓▓▓▓▓▓▓▓▓▓▓]      │
│  [▓▓▓▓▓▓▓▓▓▓▓▓▓▓]      │
└────────────────────────┘
```

**Permission Checking (Progressive)**:
- Itens sem permissão aparecem imediatamente
- Itens com permissão aparecem após verificação
- Skeleton durante loading (200-500ms)

---

## 8. Animações e Transições

### 8.1 Animações Obrigatórias

**Expand/Collapse Sidebar**:
```css
transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1);
/* 256px → 64px (ou vice-versa) */
```

**Expand/Collapse Submenu**:
```css
@keyframes slideDown {
  from { height: 0; opacity: 0; }
  to { height: auto; opacity: 1; }
}
animation: slideDown 200ms ease-out;
```

**Drawer Open/Close**:
```css
@keyframes slideInLeft {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
animation: slideInLeft 300ms ease-out;
```

**Badge Pulse**:
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
animation: pulse 2s infinite;
```

### 8.2 Micro-Interações

**Hover State**:
```css
transition: background-color 150ms ease-in-out;
```

**Active State**:
```css
transition: border-color 150ms ease-in-out;
```

**Icon Rotation (Chevron)**:
```css
transition: transform 200ms ease-in-out;
/* rotate(0deg) → rotate(90deg) */
```

### 8.3 Acessibilidade (prefers-reduced-motion)

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 9. Configuração de Instância

### 9.1 Schema de Configuração

```typescript
interface SidebarConfig {
  // Layout
  layout: 'sidebar-left' | 'sidebar-right' | 'navbar-top';

  // Dimensões
  width?: number;                // Largura (sidebar) em px (default: 256)
  height?: number;               // Altura (navbar) em px (default: 64)
  collapsedWidth?: number;       // Largura quando colapsado (default: 64)

  // Comportamento
  collapsible?: boolean;         // Pode colapsar (default: true)
  defaultCollapsed?: boolean;    // Inicia colapsado (default: false)
  persistState?: boolean;        // Salva estado no localStorage (default: true)
  closeOnNavigate?: boolean;     // Fecha após navegar (mobile) (default: true)

  // Features
  enableSearch?: boolean;        // Habilita busca (default: false)
  enableUserMenu?: boolean;      // Habilita user menu (default: false)
  enableThemeToggle?: boolean;   // Habilita toggle de tema (default: false)

  // Estilo
  variant?: 'default' | 'bordered' | 'floating';
  showIcons?: boolean;           // Exibir ícones (default: true)
  showBadges?: boolean;          // Exibir badges (default: true)

  // User Menu (se habilitado)
  userMenu?: {
    position: 'top' | 'bottom';
    showAvatar: boolean;
    showName: boolean;
    showEmail: boolean;
    actions: UserAction[];
  };

  // Permissões
  checkPermissions?: boolean;    // Verificar permissões de itens (default: true)

  // Items
  items: MenuItem[];
}
```

### 9.2 Exemplo: Sidebar Lateral Completo

```json
{
  "instanceId": "app-sidebar",
  "moduleId": "menu",
  "config": {
    "layout": "sidebar-left",
    "width": 256,
    "collapsedWidth": 64,
    "collapsible": true,
    "defaultCollapsed": false,
    "persistState": true,
    "enableSearch": true,
    "enableUserMenu": true,
    "enableThemeToggle": true,
    "variant": "default",
    "showIcons": true,
    "showBadges": true,
    "userMenu": {
      "position": "top",
      "showAvatar": true,
      "showName": true,
      "showEmail": true,
      "actions": [
        {
          "label": "Perfil",
          "icon": "User",
          "route": "/profile"
        },
        {
          "label": "Configurações",
          "icon": "Settings",
          "route": "/settings"
        },
        {
          "label": "Sair",
          "icon": "LogOut",
          "onClick": "logout"
        }
      ]
    },
    "checkPermissions": true,
    "items": [
      {
        "id": "dashboard",
        "label": "Dashboard",
        "icon": "LayoutDashboard",
        "route": "/app/dashboard"
      },
      {
        "id": "users",
        "label": "Usuários",
        "icon": "Users",
        "route": "/app/users",
        "permission": "read.usuarios"
      },
      {
        "id": "chat",
        "label": "Chat",
        "icon": "MessageSquare",
        "route": "/app/chat",
        "badge": {
          "text": "3",
          "variant": "primary",
          "pulse": true
        }
      },
      {
        "id": "tasks",
        "label": "Tarefas",
        "icon": "CheckSquare",
        "route": "/app/tasks",
        "badge": {
          "text": "12",
          "variant": "warning"
        }
      },
      {
        "id": "divider-1",
        "divider": true
      },
      {
        "id": "settings",
        "label": "Configurações",
        "icon": "Settings",
        "children": [
          {
            "id": "profile",
            "label": "Perfil",
            "route": "/app/settings/profile"
          },
          {
            "id": "security",
            "label": "Segurança",
            "route": "/app/settings/security"
          },
          {
            "id": "preferences",
            "label": "Preferências",
            "route": "/app/settings/preferences"
          }
        ]
      },
      {
        "id": "reports",
        "label": "Relatórios",
        "icon": "BarChart",
        "children": [
          {
            "id": "sales",
            "label": "Vendas",
            "route": "/app/reports/sales"
          },
          {
            "id": "users-report",
            "label": "Usuários",
            "route": "/app/reports/users"
          }
        ]
      }
    ]
  }
}
```

### 9.3 Exemplo: Navbar Superior Simples

```json
{
  "instanceId": "landing-navbar",
  "moduleId": "menu",
  "config": {
    "layout": "navbar-top",
    "height": 64,
    "variant": "default",
    "showIcons": false,
    "enableUserMenu": false,
    "enableThemeToggle": true,
    "items": [
      {
        "id": "home",
        "label": "Home",
        "route": "/"
      },
      {
        "id": "features",
        "label": "Features",
        "route": "/features"
      },
      {
        "id": "pricing",
        "label": "Pricing",
        "route": "/pricing"
      },
      {
        "id": "docs",
        "label": "Docs",
        "route": "/docs"
      },
      {
        "id": "contact",
        "label": "Contact",
        "route": "/contact"
      }
    ]
  }
}
```

### 9.4 Exemplo: Mobile Drawer

```json
{
  "instanceId": "mobile-menu",
  "moduleId": "menu",
  "config": {
    "layout": "sidebar-left",
    "width": 320,
    "collapsible": false,
    "closeOnNavigate": true,
    "enableSearch": true,
    "enableUserMenu": true,
    "showIcons": true,
    "showBadges": true,
    "items": [
      {
        "id": "home",
        "label": "Home",
        "icon": "Home",
        "route": "/app"
      },
      {
        "id": "notifications",
        "label": "Notificações",
        "icon": "Bell",
        "route": "/app/notifications",
        "badge": {
          "text": "5",
          "variant": "danger",
          "pulse": true
        }
      },
      {
        "id": "profile",
        "label": "Meu Perfil",
        "icon": "User",
        "route": "/app/profile"
      },
      {
        "id": "settings",
        "label": "Configurações",
        "icon": "Settings",
        "route": "/app/settings"
      },
      {
        "id": "divider-1",
        "divider": true
      },
      {
        "id": "help",
        "label": "Ajuda",
        "icon": "HelpCircle",
        "route": "/app/help"
      },
      {
        "id": "logout",
        "label": "Sair",
        "icon": "LogOut",
        "onClick": "logout"
      }
    ]
  }
}
```

---

## 10. Responsividade

### 10.1 Breakpoints (Tailwind)

```typescript
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet portrait
  lg: '1024px',  // Tablet landscape / Desktop
  xl: '1280px',  // Desktop large
  '2xl': '1536px' // Desktop extra large
};
```

### 10.2 Comportamento por Breakpoint

**Mobile (< 768px)**:
- Sidebar lateral → Drawer com overlay
- Navbar superior → Hamburger + Logo + User
- Botão hamburger sempre visível
- Drawer ocupa 80% da largura (max 320px)
- Fecha após navegação (closeOnNavigate: true)
- Swipe para fechar

**Tablet (768px - 1024px)**:
- Sidebar lateral pode ser colapsada (64px)
- Navbar superior funcional
- Toggle collapse visível
- Todos os itens acessíveis

**Desktop (> 1024px)**:
- Sidebar lateral expandido por padrão (256px)
- Navbar superior com todos os itens
- Collapse opcional
- Menus dropdown funcionais

### 10.3 Adaptações Visuais

**Sidebar em Mobile**:
```
Desktop:                Mobile:
┌──────┬──────┐        ┌─────────────┐
│ SIDE │ CONT │        │ [☰] [👤]   │
│      │      │   →    ├─────────────┤
│      │      │        │ [overlay]   │
└──────┴──────┘        └─────────────┘
```

**Navbar em Mobile**:
```
Desktop:                Mobile:
┌────────────────┐     ┌─────────────┐
│ Logo  A B C [👤]│     │ [☰] Logo [👤]│
│                │  →  ├─────────────┤
│ CONTENT        │     │ CONTENT     │
└────────────────┘     └─────────────┘
```

---

## 11. Busca no Menu

### 11.1 Componente de Busca

**Wireframe**:
```
┌────────────────────────┐
│  [🔍 Buscar menu...]   │  ← Search input
└────────────────────────┘

Digitando "conf":

┌────────────────────────┐
│  [🔍 conf         ✕]   │
├────────────────────────┤
│  [⚙️] Configurações     │  ← Match
│    ├─ Perfil          │
│    └─ Segurança       │
└────────────────────────┘
```

**Comportamento**:
- Debounce de 300ms
- Filtra por label (case-insensitive)
- Mostra apenas itens correspondentes
- Auto-expande pais de itens correspondentes
- Destaca texto correspondente (opcional)
- Botão ✕ para limpar busca

**Implementação**:
```typescript
const [search, setSearch] = useState('');

const filteredItems = useMemo(() => {
  if (!search) return items;

  return filterMenuItems(items, search);
}, [items, search]);

// Função recursiva para filtrar
function filterMenuItems(items: MenuItem[], query: string): MenuItem[] {
  return items
    .map(item => {
      // Se item tem filhos, filtra recursivamente
      if (item.children) {
        const filteredChildren = filterMenuItems(item.children, query);
        if (filteredChildren.length > 0) {
          return { ...item, children: filteredChildren, expanded: true };
        }
      }

      // Verifica se label contém query
      if (item.label.toLowerCase().includes(query.toLowerCase())) {
        return item;
      }

      return null;
    })
    .filter(Boolean) as MenuItem[];
}
```

### 11.2 Estados de Busca

**Vazio (Sem Resultados)**:
```
┌────────────────────────┐
│  [🔍 xyz          ✕]   │
├────────────────────────┤
│                        │
│     [🔍]               │
│                        │
│  Nenhum resultado      │
│  encontrado            │
│                        │
└────────────────────────┘
```

**Busca Ativa**:
- Itens não correspondentes ficam ocultos
- Contagem de resultados (opcional): "3 resultados"
- Highlight no texto correspondente

---

## 12. User Menu

### 12.1 Wireframe (Expandido)

```
┌────────────────────────┐
│  ┌──────────────────┐  │
│  │ [👤] John Doe    │  │  ← Avatar + Nome
│  │  john@email.com  │  │  ← Email (opcional)
│  └──────────────────┘  │
│          │             │
│          ▼ (click)     │
│  ┌──────────────────┐  │
│  │  Perfil     [👤] │  │
│  │  Config.    [⚙️] │  │
│  │  ───────────────  │  │
│  │  Sair       [⬅️] │  │
│  └──────────────────┘  │
└────────────────────────┘
```

### 12.2 Posições

**Top (position: 'top')**:
- No topo da sidebar
- Antes dos itens de menu
- Comum em sidebars laterais

**Bottom (position: 'bottom')**:
- No rodapé da sidebar
- Após todos os itens
- Pode ser fixo (sticky bottom)

### 12.3 Componentes

**Avatar**:
- Imagem ou iniciais
- Tamanho: 40px x 40px
- Border-radius: circular
- Fallback: iniciais (ex: "JD")

**User Info**:
- Nome do usuário (bold)
- Email (secondary color, smaller font)
- Status online (opcional, badge verde)

**Dropdown Actions**:
```typescript
interface UserAction {
  label: string;
  icon: string;
  route?: string;
  onClick?: () => void;
  divider?: boolean;
}
```

**Exemplo de Actions**:
```typescript
[
  { label: "Perfil", icon: "User", route: "/profile" },
  { label: "Configurações", icon: "Settings", route: "/settings" },
  { divider: true },
  { label: "Sair", icon: "LogOut", onClick: () => handleLogout() }
]
```

### 12.4 User Menu Colapsado

```
┌─────┐
│ [👤]│  ← Apenas avatar
└──┬──┘
   │ (hover/click)
   ▼
┌─────────────────┐
│ John Doe        │
│ john@email.com  │
├─────────────────┤
│ Perfil     [👤] │
│ Config.    [⚙️] │
│ ───────────────  │
│ Sair       [⬅️] │
└─────────────────┘
```

---

## 13. Theme Toggle

### 13.1 Componente

**Wireframe (Expanded)**:
```
┌────────────────────────┐
│  [🌙] Tema        ▾    │  ← Click para expandir
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  ( ) ☀️  Light         │
│  (●) 🌙  Dark          │
│  ( ) 🖥️  System        │
└────────────────────────┘
```

**Wireframe (Collapsed)**:
```
┌─────┐
│ [🌙]│  ← Ícone do tema atual
└──┬──┘
   │ (click)
   ▼
┌────────────────────────┐
│  ( ) ☀️  Light         │
│  (●) 🌙  Dark          │
│  ( ) 🖥️  System        │
└────────────────────────┘
```

### 13.2 Comportamento

**Modos Disponíveis**:
- Light (☀️)
- Dark (🌙)
- System (🖥️) - Auto-detect

**Implementação**:
```typescript
import { useTheme } from '@/hooks/useTheme';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light', label: 'Light', icon: 'Sun' },
    { value: 'dark', label: 'Dark', icon: 'Moon' },
    { value: 'system', label: 'System', icon: 'Monitor' }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost">
          <Icon name={currentIcon} />
          <span>Tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {themes.map(({ value, label, icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
          >
            <Icon name={icon} />
            <span>{label}</span>
            {theme === value && <Check />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## 14. Context Menu (Clique Direito)

### 14.1 Conceito

**Objetivo**: Menu contextual ao clicar com botão direito em itens do menu ou conteúdo.

**Wireframe**:
```
Clicar direito em item:

[📊] Dashboard  ← (right-click)
                  ↓
             ┌────────────────┐
             │ Abrir nova aba │
             │ Copiar link    │
             │ ───────────    │
             │ Fixar item     │
             └────────────────┘
```

### 14.2 Funcionalidades

**Opções Comuns**:
- Abrir em nova aba
- Copiar link
- Fixar/Desfixar item
- Marcar como favorito
- Editar item (se admin)

**Implementação**:
```typescript
<ContextMenu>
  <ContextMenuTrigger>
    <MenuItem {...item} />
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem onClick={openInNewTab}>
      <ExternalLink /> Abrir em nova aba
    </ContextMenuItem>
    <ContextMenuItem onClick={copyLink}>
      <Copy /> Copiar link
    </ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem onClick={togglePin}>
      <Pin /> {item.pinned ? 'Desfixar' : 'Fixar'}
    </ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

### 14.3 Keyboard Shortcut

**Atalho**: `Shift + F10` ou `Context Menu Key`
- Abre context menu do item focado
- Navegação por setas
- Enter para selecionar

---

## 15. Estados de Loading e Erro

### 15.1 Loading States

**Initial Load (Skeleton)**:
```
┌────────────────────────┐
│  [▓▓▓▓▓▓▓▓▓▓▓▓▓▓]      │
│  [▓▓▓▓▓▓▓▓▓▓▓▓▓▓]      │
│  [▓▓▓▓▓▓▓▓▓▓▓▓▓▓]      │
│  [▓▓▓▓▓▓▓▓▓▓▓▓▓▓]      │
│  [▓▓▓▓▓▓▓▓▓▓▓▓▓▓]      │
└────────────────────────┘
```

**Permission Check (Progressive)**:
```
┌────────────────────────┐
│  [📊] Dashboard        │  ← Loaded
│  [👥] Usuários         │  ← Loaded
│  [▓▓▓▓▓▓▓▓▓▓▓▓▓▓]      │  ← Loading
│  [▓▓▓▓▓▓▓▓▓▓▓▓▓▓]      │  ← Loading
└────────────────────────┘
```

**Badge Loading**:
```
┌────────────────────────┐
│  [💬] Chat         [⟳] │  ← Spinner
└────────────────────────┘
```

### 15.2 Error States

**Config Load Error**:
```
┌────────────────────────┐
│                        │
│      [⚠️]              │
│                        │
│  Erro ao carregar menu │
│                        │
│  [Tentar Novamente]    │
│                        │
└────────────────────────┘
```

**Permission Error (Item)**:
```
┌────────────────────────┐
│  [📊] Dashboard        │  ← OK
│  [⚠️] Usuários         │  ← Erro (não oculta, mostra erro)
│     Sem permissão      │
└────────────────────────┘
```
- Geralmente, itens sem permissão são ocultos
- Mas pode-se configurar para mostrar com indicador de erro

**Badge Error**:
```
┌────────────────────────┐
│  [💬] Chat         [!] │  ← Erro ao carregar contador
└────────────────────────┘
```

---

## 16. Padrões Globais de UI

### 16.1 Cores e Estados

**Item Normal**:
```css
background: transparent;
color: foreground;
```

**Item Hover**:
```css
background: accent;
color: accent-foreground;
```

**Item Ativo**:
```css
background: primary/10;
color: primary;
border-left: 3px solid primary; /* Sidebar */
border-bottom: 3px solid primary; /* Navbar */
```

**Item Disabled**:
```css
opacity: 0.5;
cursor: not-allowed;
pointer-events: none;
```

### 16.2 Espaçamento

**Sidebar**:
- Padding interno: 16px
- Espaçamento entre itens: 4px
- Indentação submenu: 16px por nível

**Navbar**:
- Padding horizontal: 24px
- Espaçamento entre itens: 16px
- Altura: 64px (default)

### 16.3 Tipografia

**Labels**:
- Font: inherit (do tema)
- Size: 14px (sm)
- Weight: 500 (medium)

**Headers**:
- Font: inherit
- Size: 12px (xs)
- Weight: 600 (semibold)
- Transform: uppercase
- Color: muted-foreground

**Badges**:
- Font: inherit
- Size: 12px (xs)
- Weight: 600 (semibold)

---

## 17. Acessibilidade (WCAG 2.1 AA)

### 17.1 Navegação por Teclado

**Tab Order**:
1. User menu (se no topo)
2. Search field (se habilitado)
3. Menu items (ordem visual)
4. Footer actions
5. Collapse button

**Atalhos**:
- `Tab`: Próximo item
- `Shift + Tab`: Item anterior
- `Enter` / `Space`: Ativar item
- `Arrow Down/Up`: Próximo/anterior (em menus)
- `Arrow Right`: Expandir submenu
- `Arrow Left`: Colapsar submenu
- `Escape`: Fechar drawer/dropdown
- `Shift + F10`: Context menu

### 17.2 Screen Readers

**ARIA Labels**:
```html
<nav role="navigation" aria-label="Menu principal">
  <button aria-label="Toggle menu" aria-expanded="false">
    <span aria-hidden="true">☰</span>
  </button>

  <ul role="menu">
    <li role="menuitem">
      <a href="/dashboard" aria-current="page">
        <span aria-hidden="true">📊</span>
        Dashboard
      </a>
    </li>

    <li role="menuitem" aria-haspopup="true" aria-expanded="false">
      <button>
        Configurações
        <span aria-hidden="true">▸</span>
      </button>
      <ul role="menu">
        <li role="menuitem">Perfil</li>
        <li role="menuitem">Segurança</li>
      </ul>
    </li>
  </ul>
</nav>
```

**Live Regions**:
```html
<div aria-live="polite" aria-atomic="true">
  <!-- Badge updates announced -->
  <span>3 novas mensagens</span>
</div>
```

### 17.3 Contraste de Cores

**Mínimos WCAG AA**:
- Texto normal: 4.5:1
- Texto grande: 3:1
- Elementos UI: 3:1

**Validação**:
- Item ativo deve ter contraste adequado
- Badges devem ter contraste com background
- Ícones devem ser distinguíveis

### 17.4 Focus Visible

```css
.menu-item:focus-visible {
  outline: 2px solid primary;
  outline-offset: 2px;
  border-radius: 4px;
}
```

---

## 18. Performance

### 18.1 Otimizações Obrigatórias

**Memoização de Itens**:
```typescript
const MenuItemMemo = React.memo(MenuItem, (prev, next) => {
  return (
    prev.item.id === next.item.id &&
    prev.isActive === next.isActive &&
    prev.isExpanded === next.isExpanded &&
    prev.item.badge?.text === next.item.badge?.text
  );
});
```

**Virtualização (>50 itens)**:
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualizedMenu({ items }: { items: MenuItem[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40, // Altura estimada de cada item
  });

  return (
    <div ref={parentRef} className="overflow-auto h-full">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <MenuItem item={items[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Lazy Loading de Badges**:
```typescript
// Carregar badges apenas quando item está visível
const { data: badge } = useQuery({
  queryKey: ['badge', itemId],
  queryFn: () => fetchBadgeCount(itemId),
  enabled: isVisible, // IntersectionObserver
  refetchInterval: 30000 // 30s
});
```

### 18.2 Debounce e Throttle

**Search Input**:
```typescript
const debouncedSearch = useDebouncedValue(search, 300);
```

**Scroll Events** (se necessário):
```typescript
const handleScroll = useThrottle(() => {
  // Handle scroll
}, 100);
```

### 18.3 Bundle Size

**Code Splitting**:
```typescript
// Lazy load menu module
const Menu = lazy(() => import('./modules/menu'));

// Lazy load user menu dropdown
const UserMenuDropdown = lazy(() => import('./UserMenuDropdown'));
```

**Icons**:
```typescript
// Import apenas ícones usados
import { LayoutDashboard, Users, MessageSquare } from 'lucide-react';

// Não importar *
// import * from 'lucide-react'; ❌
```

---

## 19. Testes de UI/UX

### 19.1 Checklist de Validação

**Navegação**:
- [ ] Todos os itens navegam corretamente
- [ ] Item ativo é destacado visualmente
- [ ] Submenu expande/colapsa corretamente
- [ ] Navegação por teclado funciona
- [ ] Context menu funciona (desktop)

**Responsividade**:
- [ ] Mobile: Drawer funciona corretamente
- [ ] Mobile: Overlay fecha ao clicar fora
- [ ] Mobile: Swipe fecha o drawer
- [ ] Tablet: Sidebar colapsável funciona
- [ ] Desktop: Sidebar expandido funciona

**Permissões**:
- [ ] Itens sem permissão são ocultos
- [ ] Verificação via `/api/1/auth/authorize`
- [ ] Loading state durante verificação

**Badges**:
- [ ] Badges são exibidos corretamente
- [ ] Badges atualizam dinamicamente
- [ ] Variantes de cor funcionam
- [ ] Pulso animado funciona (se habilitado)

**Busca**:
- [ ] Busca filtra itens corretamente
- [ ] Debounce funciona (300ms)
- [ ] Auto-expande pais de resultados
- [ ] Estado vazio é exibido
- [ ] Limpar busca restaura menu

**User Menu**:
- [ ] Avatar/Nome exibidos corretamente
- [ ] Dropdown abre/fecha
- [ ] Actions funcionam (navegação, logout)
- [ ] Posição (top/bottom) funciona

**Theme Toggle**:
- [ ] Todos os modos são exibidos
- [ ] Mudança de tema funciona
- [ ] Ícone atual é destacado
- [ ] Integra com ThemeProvider

**Animações**:
- [ ] Expand/collapse é animado
- [ ] Drawer slide in/out é animado
- [ ] Submenu slide down/up é animado
- [ ] Respeitam prefers-reduced-motion

**Acessibilidade**:
- [ ] Navegação por teclado funciona
- [ ] Focus visible é claro
- [ ] Screen reader announces corretamente
- [ ] ARIA labels estão corretos
- [ ] Contraste de cores adequado

**Performance**:
- [ ] Menu renderiza em < 100ms
- [ ] Sem re-renders desnecessários
- [ ] Badges carregam progressivamente
- [ ] Virtualização funciona (>50 itens)

---

## 20. Exemplos de Uso

### 20.1 Sidebar Básico (Portal App)

```json
{
  "instanceId": "app-main-sidebar",
  "moduleId": "menu",
  "portalId": "app",
  "config": {
    "layout": "sidebar-left",
    "width": 256,
    "collapsible": true,
    "enableSearch": false,
    "enableUserMenu": true,
    "items": [
      {
        "id": "dashboard",
        "label": "Dashboard",
        "icon": "LayoutDashboard",
        "route": "/app/dashboard"
      },
      {
        "id": "users",
        "label": "Usuários",
        "icon": "Users",
        "route": "/app/users",
        "permission": "read.usuarios"
      }
    ]
  }
}
```

### 20.2 Navbar Landing Page

```json
{
  "instanceId": "landing-navbar",
  "moduleId": "menu",
  "portalId": "main",
  "config": {
    "layout": "navbar-top",
    "height": 64,
    "showIcons": false,
    "enableThemeToggle": true,
    "items": [
      { "id": "home", "label": "Home", "route": "/" },
      { "id": "features", "label": "Features", "route": "/features" },
      { "id": "pricing", "label": "Pricing", "route": "/pricing" },
      { "id": "docs", "label": "Docs", "route": "/docs" }
    ]
  }
}
```

### 20.3 Sidebar com Badges Dinâmicos

```json
{
  "instanceId": "app-sidebar-notifications",
  "moduleId": "menu",
  "config": {
    "layout": "sidebar-left",
    "showBadges": true,
    "items": [
      {
        "id": "chat",
        "label": "Chat",
        "icon": "MessageSquare",
        "route": "/app/chat",
        "badge": {
          "text": "3",
          "variant": "primary",
          "pulse": true
        }
      },
      {
        "id": "tasks",
        "label": "Tarefas",
        "icon": "CheckSquare",
        "route": "/app/tasks",
        "badge": {
          "text": "12",
          "variant": "warning"
        }
      },
      {
        "id": "notifications",
        "label": "Notificações",
        "icon": "Bell",
        "route": "/app/notifications",
        "badge": {
          "text": "5",
          "variant": "danger",
          "pulse": true
        }
      }
    ]
  }
}
```

---

## 21. Roadmap de Implementação

### 21.1 Fase 1: Estrutura Base (1-2 dias)
1. Criar componentes UI base (MenuItem, MenuGroup, Separator)
2. Implementar layout básico (Sidebar, Navbar)
3. Integrar com React Router (Link, useLocation)
4. Estados visuais (normal, hover, active)

### 21.2 Fase 2: Funcionalidades Core (2-3 dias)
1. Sistema de submenu (expand/collapse)
2. Persistência de estado (localStorage)
3. Responsividade (mobile drawer)
4. Hamburger menu e overlay

### 21.3 Fase 3: Features Avançadas (2-3 dias)
1. Busca no menu (debounce, filtragem)
2. User menu (avatar, dropdown, actions)
3. Theme toggle (light/dark/system)
4. Badges dinâmicos (SSE integration)

### 21.4 Fase 4: Permissões e Segurança (1-2 dias)
1. Integração com `/api/1/auth/authorize`
2. Verificação de permissões por item
3. Loading states para permission checks
4. Progressive rendering

### 21.5 Fase 5: Animações e Polimento (1-2 dias)
1. Animações de expand/collapse
2. Transições suaves (sidebar, drawer)
3. Micro-interações (hover, focus)
4. prefers-reduced-motion support

### 21.6 Fase 6: Performance (1 dia)
1. Memoização de componentes
2. Virtualização (>50 itens)
3. Lazy loading de badges
4. Bundle optimization

### 21.7 Fase 7: Acessibilidade (1 dia)
1. Navegação por teclado
2. ARIA labels e roles
3. Screen reader testing
4. Contraste de cores (WCAG AA)

### 21.8 Fase 8: Testes e Documentação (1 dia)
1. Testes de UI/UX (checklist)
2. Exemplos de uso
3. Documentação para desenvolvedores
4. Storybook stories (opcional)

---

## Conclusão

Este documento define a arquitetura completa de UI/UX para o módulo Menu (Sidebar), seguindo:

- **SPEC-module-sidebar.md**: Todas as funcionalidades especificadas
- **SPEC-concepts.md**: Conceitos de Portal e Módulo
- **SPEC-architecture.md**: Stack tecnológico (React 19, shadcn/ui, Tailwind, Lucide React)

**Padrões Adotados**:
- Navegação hierárquica com até 3 níveis
- Responsive design (mobile drawer, tablet colapsável, desktop expandido)
- Permission-based visibility
- Dynamic badges com SSE integration
- Animações suaves com prefers-reduced-motion
- Acessibilidade WCAG 2.1 AA
- Performance otimizada (memoização, virtualização)

**Tecnologias**:
- React 19 + TypeScript
- shadcn/ui (única biblioteca de UI)
- Tailwind CSS (zero CSS customizado)
- Lucide React (ícones)
- React Router (navegação)
- TanStack Query (badges dinâmicos)

**Layouts Suportados**:
1. Sidebar Lateral (esquerda/direita, expandido/colapsado)
2. Navbar Superior (horizontal, sticky)
3. Mobile Drawer (overlay, swipeable)
4. Context Menu (clique direito)

Esta especificação serve como guia completo para implementação do módulo Menu, garantindo consistência, qualidade e aderência aos requisitos da plataforma.
