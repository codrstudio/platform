# SPEC-module-sidebar.md

## Especificação: Módulo Sidebar

### Escopo
Este documento especifica o módulo Sidebar, responsável por fornecer navegação lateral ou superior para aplicações.

---

## 1. Definição

### Propósito
O módulo Sidebar fornece componentes de navegação estruturada (lateral ou superior) com suporte a menus aninhados, ícones, badges e estados ativos.

### Natureza
- **Tipo**: Módulo de Funcionalidade
- **Dependências**: Nenhuma
- **Opcional**: Sim

---

## 2. Responsabilidades

### SPEC-SIDEBAR-R-001
O módulo Sidebar DEVE fornecer componente de navegação visual

### SPEC-SIDEBAR-R-002
O módulo Sidebar NÃO DEVE gerenciar rotas (responsabilidade do React Router)

### SPEC-SIDEBAR-R-003
O módulo Sidebar DEVE ser um componente de apresentação

### SPEC-SIDEBAR-R-004
O módulo Sidebar PODE criar múltiplas instâncias com diferentes configurações

---

## 3. Tipos de Layout

### Sidebar Lateral

**SPEC-SIDEBAR-T-001:** Layout lateral DEVE ser posicionado à esquerda ou direita

**SPEC-SIDEBAR-T-002:** Layout lateral DEVE ter largura configurável

**SPEC-SIDEBAR-T-003:** Layout lateral PODE ser colapsável

**SPEC-SIDEBAR-T-004:** Quando colapsado, DEVE exibir apenas ícones

**SPEC-SIDEBAR-T-005:** Layout lateral DEVE ser fixo ou scrollable

### Navbar Superior

**SPEC-SIDEBAR-T-006:** Layout superior DEVE ser posicionado no topo

**SPEC-SIDEBAR-T-007:** Layout superior DEVE ter altura configurável

**SPEC-SIDEBAR-T-008:** Layout superior PODE ser fixo (sticky) ou estático

**SPEC-SIDEBAR-T-009:** Layout superior DEVE adaptar-se a diferentes larguras de tela

---

## 4. Estrutura de Menu

### Itens de Menu

**SPEC-SIDEBAR-M-001:** Item de menu DEVE ter estrutura:
```typescript
{
  id: string;                    // Identificador único
  label: string;                 // Texto exibido
  icon?: string;                 // Ícone (lucide-react)
  route?: string;                // Rota de navegação
  badge?: {
    text: string;
    variant: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  };
  onClick?: () => void;          // Handler customizado
  permission?: string;           // Permissão necessária
  children?: MenuItem[];         // Subitens (menu aninhado)
}
```

**SPEC-SIDEBAR-M-002:** Item PODE ter rota OU onClick, não ambos

**SPEC-SIDEBAR-M-003:** Item com children DEVE ser expansível

**SPEC-SIDEBAR-M-004:** Item sem children e sem route/onClick é apenas divisor/header

### Menu Aninhado

**SPEC-SIDEBAR-M-005:** Menu PODE ter até 3 níveis de profundidade

**SPEC-SIDEBAR-M-006:** Subitens DEVEM ser indentados visualmente

**SPEC-SIDEBAR-M-007:** Item pai DEVE ter indicador de expansão (chevron)

**SPEC-SIDEBAR-M-008:** Clicar no pai DEVE expandir/colapsar subitens

**SPEC-SIDEBAR-M-009:** Estado de expansão PODE ser persistido (localStorage)

### Separadores e Headers

**SPEC-SIDEBAR-M-010:** Menu PODE ter separadores visuais entre grupos

**SPEC-SIDEBAR-M-011:** Menu PODE ter headers de seção (texto não clicável)

---

## 5. Funcionalidades Obrigatórias

### Navegação

**SPEC-SIDEBAR-F-001:** Clicar em item com route DEVE navegar via React Router

**SPEC-SIDEBAR-F-002:** Item ativo (rota atual) DEVE ser destacado visualmente

**SPEC-SIDEBAR-F-003:** Se rota atual está em submenu, o pai DEVE estar expandido

### Responsividade

**SPEC-SIDEBAR-F-004:** Em mobile (<768px), sidebar lateral DEVE colapsar automaticamente

**SPEC-SIDEBAR-F-005:** Em mobile, DEVE ter botão toggle (hamburger menu)

**SPEC-SIDEBAR-F-006:** Ao abrir em mobile, DEVE sobrepor conteúdo (drawer)

**SPEC-SIDEBAR-F-007:** Clicar fora DEVE fechar sidebar em mobile

### Ícones

**SPEC-SIDEBAR-F-008:** Todos os ícones DEVEM ser do lucide-react

**SPEC-SIDEBAR-F-009:** Ícones DEVEM ter tamanho consistente

**SPEC-SIDEBAR-F-010:** Quando colapsado, apenas ícone DEVE ser visível

---

## 6. Funcionalidades Opcionais

### Badges

**SPEC-SIDEBAR-O-001:** Item PODE ter badge (contador, status)

**SPEC-SIDEBAR-O-002:** Badge DEVE suportar variantes de cor

**SPEC-SIDEBAR-O-003:** Badge PODE ser atualizado dinamicamente

**SPEC-SIDEBAR-O-004:** Exemplo: notificações não lidas, tasks pendentes

### Busca

**SPEC-SIDEBAR-O-005:** Sidebar PODE ter campo de busca

**SPEC-SIDEBAR-O-006:** Busca DEVE filtrar itens por label

**SPEC-SIDEBAR-O-007:** Busca DEVE exibir apenas itens correspondentes

**SPEC-SIDEBAR-O-008:** Limpar busca DEVE restaurar menu completo

### User Menu

**SPEC-SIDEBAR-O-009:** Sidebar PODE ter área de usuário (avatar, nome)

**SPEC-SIDEBAR-O-010:** User menu PODE ter dropdown com ações (perfil, logout)

**SPEC-SIDEBAR-O-011:** User menu PODE ser no topo ou rodapé

### Temas

**SPEC-SIDEBAR-O-012:** Sidebar PODE ter toggle de tema claro/escuro

**SPEC-SIDEBAR-O-013:** Toggle DEVE chamar função de mudança de tema da plataforma

### Permissões

**SPEC-SIDEBAR-O-014:** Itens com `permission` DEVEM verificar permissão do usuário

**SPEC-SIDEBAR-O-015:** Se usuário não tem permissão, item NÃO DEVE ser exibido

**SPEC-SIDEBAR-O-016:** Verificação DEVE usar `/api/1/auth/authorize`

---

## 7. Configuração de Instância

### Parâmetros Obrigatórios

**SPEC-SIDEBAR-C-001:** Toda instância DEVE configurar:
```typescript
{
  layout: 'sidebar-left' | 'sidebar-right' | 'navbar-top';
  items: MenuItem[];
}
```

### Parâmetros Opcionais

**SPEC-SIDEBAR-C-002:** Instância PODE configurar:
```typescript
{
  // Layout
  layout: 'sidebar-left' | 'sidebar-right' | 'navbar-top';
  
  // Dimensões
  width?: number;                // Largura (sidebar) em px
  height?: number;               // Altura (navbar) em px
  collapsedWidth?: number;       // Largura quando colapsado
  
  // Comportamento
  collapsible?: boolean;         // Pode colapsar
  defaultCollapsed?: boolean;    // Inicia colapsado
  persistState?: boolean;        // Salva estado no localStorage
  closeOnNavigate?: boolean;     // Fecha após navegar (mobile)
  
  // Features
  enableSearch?: boolean;        // Habilita busca
  enableUserMenu?: boolean;      // Habilita user menu
  enableThemeToggle?: boolean;   // Habilita toggle de tema
  
  // Estilo
  variant?: 'default' | 'bordered' | 'floating';
  showIcons?: boolean;           // Exibir ícones
  showBadges?: boolean;          // Exibir badges
  
  // User Menu (se habilitado)
  userMenu?: {
    position: 'top' | 'bottom';
    showAvatar: boolean;
    showName: boolean;
    showEmail: boolean;
    actions: UserAction[];
  };
  
  // Permissões
  checkPermissions?: boolean;    // Verificar permissões de itens
}
```

---

## 8. Estados Visuais

### Item Normal

**SPEC-SIDEBAR-V-001:** Item normal DEVE ter:
- Ícone (se configurado)
- Label
- Badge (se configurado)
- Hover state

### Item Ativo

**SPEC-SIDEBAR-V-002:** Item ativo (rota atual) DEVE ter:
- Background destacado
- Borda ou indicador visual
- Cor de texto diferenciada

### Item Disabled

**SPEC-SIDEBAR-V-003:** Item disabled DEVE ter:
- Opacidade reduzida
- Cursor not-allowed
- Não ser clicável

### Item com Submenu

**SPEC-SIDEBAR-V-004:** Item pai DEVE ter:
- Chevron indicando expansão
- Estado expandido/colapsado
- Animação de transição

---

## 9. Animações

**SPEC-SIDEBAR-A-001:** Expansão de submenu DEVE ser animada (slide down/up)

**SPEC-SIDEBAR-A-002:** Colapsar sidebar DEVE ser animado (width transition)

**SPEC-SIDEBAR-A-003:** Abertura de drawer (mobile) DEVE ser animada (slide in)

**SPEC-SIDEBAR-A-004:** Animações DEVEM ser suaves (200-300ms)

**SPEC-SIDEBAR-A-005:** Animações DEVEM respeitar preferências de acessibilidade (prefers-reduced-motion)

---

## 10. Integração com React Router

**SPEC-SIDEBAR-ROUTER-001:** Módulo DEVE usar React Router para navegação

**SPEC-SIDEBAR-ROUTER-002:** Item ativo DEVE ser detectado via `useLocation()`

**SPEC-SIDEBAR-ROUTER-003:** Navegação DEVE usar `<Link>` ou `navigate()`

**SPEC-SIDEBAR-ROUTER-004:** Match de rota ativa PODE ser exact ou partial:
```typescript
// Exact: /dashboard === /dashboard
// Partial: /dashboard/settings matches /dashboard
```

---

## 11. Componentes Exportados

### Obrigatórios

**SPEC-SIDEBAR-E-001:** Módulo DEVE exportar:
```typescript
<Sidebar config={SidebarConfig} />
<SidebarItem item={MenuItem} />
<SidebarGroup items={MenuItem[]} />
```

### Opcionais

**SPEC-SIDEBAR-E-002:** Módulo PODE exportar:
```typescript
<SidebarSearch onSearch={fn} />
<SidebarUserMenu user={User} actions={Action[]} />
<SidebarToggle />
<SidebarBadge text={string} variant={string} />
```

---

## 12. Responsividade - Breakpoints

**SPEC-SIDEBAR-RESP-001:** Breakpoints DEVEM seguir Tailwind:
```
sm: 640px   - Sidebar colapsado, toggle visível
md: 768px   - Sidebar pode expandir
lg: 1024px  - Sidebar expandido por padrão
xl: 1280px  - Sidebar sempre visível
```

**SPEC-SIDEBAR-RESP-002:** Comportamento por tela:
```
Mobile (<768px):
  - Sidebar como drawer sobreposto
  - Botão hamburger visível
  - Fecha após navegação

Tablet (768px - 1024px):
  - Sidebar colapsável
  - Pode fixar expandido
  - Ícones sempre visíveis

Desktop (>1024px):
  - Sidebar expandido por padrão
  - Totalmente funcional
  - Pode colapsar manualmente
```

---

## 13. Acessibilidade

**SPEC-SIDEBAR-A11Y-001:** Sidebar DEVE ser navegável via teclado (Tab, Enter, Arrow keys)

**SPEC-SIDEBAR-A11Y-002:** Items DEVEM ter `role="navigation"` ou `role="menuitem"`

**SPEC-SIDEBAR-A11Y-003:** Estado expandido/colapsado DEVE ter `aria-expanded`

**SPEC-SIDEBAR-A11Y-004:** Toggle mobile DEVE ter `aria-label="Toggle menu"`

**SPEC-SIDEBAR-A11Y-005:** Ícones decorativos DEVEM ter `aria-hidden="true"`

**SPEC-SIDEBAR-A11Y-006:** Focus visible DEVE ser claramente indicado

---

## 14. Performance

**SPEC-SIDEBAR-PERF-001:** Renderização de muitos itens (>50) PODE usar virtualização

**SPEC-SIDEBAR-PERF-002:** Badges dinâmicos DEVEM usar React.memo

**SPEC-SIDEBAR-PERF-003:** Estado de expansão DEVE ser otimizado (não re-render desnecessários)

---

## 15. Exemplos de Uso

### Sidebar Lateral Básico
```json
{
  "instanceId": "main-sidebar",
  "moduleId": "sidebar",
  "config": {
    "layout": "sidebar-left",
    "width": 256,
    "collapsible": true,
    "items": [
      {
        "id": "dashboard",
        "label": "Dashboard",
        "icon": "layout-dashboard",
        "route": "/app/dashboard"
      },
      {
        "id": "users",
        "label": "Usuários",
        "icon": "users",
        "route": "/app/users",
        "permission": "read.usuarios"
      },
      {
        "id": "settings",
        "label": "Configurações",
        "icon": "settings",
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
          }
        ]
      }
    ]
  }
}
```

### Navbar Superior com User Menu
```json
{
  "instanceId": "top-navbar",
  "moduleId": "sidebar",
  "config": {
    "layout": "navbar-top",
    "height": 64,
    "enableUserMenu": true,
    "enableThemeToggle": true,
    "items": [
      {
        "id": "home",
        "label": "Home",
        "route": "/"
      },
      {
        "id": "docs",
        "label": "Documentação",
        "route": "/docs"
      },
      {
        "id": "pricing",
        "label": "Preços",
        "route": "/pricing"
      }
    ],
    "userMenu": {
      "position": "top",
      "showAvatar": true,
      "showName": true,
      "actions": [
        {
          "label": "Perfil",
          "icon": "user",
          "route": "/profile"
        },
        {
          "label": "Sair",
          "icon": "log-out",
          "onClick": "logout"
        }
      ]
    }
  }
}
```

### Sidebar com Badges Dinâmicos
```json
{
  "instanceId": "app-sidebar",
  "moduleId": "sidebar",
  "config": {
    "layout": "sidebar-left",
    "showBadges": true,
    "items": [
      {
        "id": "notifications",
        "label": "Notificações",
        "icon": "bell",
        "route": "/notifications",
        "badge": {
          "text": "3",
          "variant": "primary"
        }
      },
      {
        "id": "tasks",
        "label": "Tarefas",
        "icon": "check-square",
        "route": "/tasks",
        "badge": {
          "text": "12",
          "variant": "warning"
        }
      }
    ]
  }
}
```

---

*Esta especificação define os requisitos do módulo Sidebar. Implementação técnica em documentação separada.*