# Sidebar Module

Sistema de navegação lateral moderno construído com shadcn/ui components.

## Características

- Sidebar esquerda/direita com comportamento collapsible
- Logo + nome do portal com hover para expandir/colapsar
- Menus customizáveis com overflow scrollable
- Busca integrada com filtragem recursiva
- Theme toggle (integrado com ThemeProvider)
- User menu com avatar e ações customizáveis
- Ícones do Lucide React
- Badges com cores semânticas
- Suporte para menu aninhado (nested items)
- Responsive (mobile overlay com Sheet)
- Persistência de estado em localStorage
- Tooltips quando colapsado

## Uso Básico

### 1. Wrapper com SidebarProvider

O componente Sidebar **deve** ser envolvido pelo `SidebarProvider` do shadcn/ui:

```tsx
import { SidebarProvider } from '@/components/ui/sidebar';
import { Sidebar } from '@/modules/sidebar';

function App() {
  const sidebarConfig = {
    layout: 'sidebar-left',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'home',
        route: '/dashboard'
      },
      {
        id: 'users',
        label: 'Usuários',
        icon: 'users',
        route: '/users',
        badge: {
          text: '5',
          variant: 'primary'
        }
      }
    ],
    enableSearch: true,
    enableUserMenu: true,
    enableThemeToggle: true,
    brand: {
      portalName: 'Meu Portal',
      showLogo: true
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar config={sidebarConfig} />

      {/* Seu conteúdo principal aqui */}
      <main className="flex-1 p-4">
        {/* ... */}
      </main>
    </SidebarProvider>
  );
}
```

### 2. Trigger Button (Mobile)

O shadcn/ui sidebar gerencia automaticamente o comportamento mobile. Para adicionar um botão de toggle no header da aplicação:

```tsx
import { SidebarTrigger } from '@/components/ui/sidebar';

function Header() {
  return (
    <header className="border-b p-4">
      <SidebarTrigger />
      <h1>Minha Aplicação</h1>
    </header>
  );
}
```

## Configuração

### SidebarConfig

```typescript
interface SidebarConfig {
  // Layout (OBRIGATÓRIO)
  layout: 'sidebar-left' | 'sidebar-right';
  items: MenuItem[];

  // Brand (Logo + Nome)
  brand?: {
    portalName?: string;
    logo?: React.ReactNode | string;
    showLogo?: boolean;
  };

  // Comportamento
  collapsible?: boolean;          // Padrão: true
  defaultCollapsed?: boolean;     // Padrão: false
  persistState?: boolean;         // Padrão: true
  closeOnNavigate?: boolean;      // Padrão: true (mobile)

  // Features
  enableSearch?: boolean;         // Padrão: false
  enableUserMenu?: boolean;       // Padrão: false
  enableThemeToggle?: boolean;    // Padrão: false

  // Estilo
  variant?: 'default' | 'bordered' | 'floating';
  showIcons?: boolean;            // Padrão: true
  showBadges?: boolean;           // Padrão: true

  // User Menu
  userMenu?: {
    position: 'top' | 'bottom';
    showAvatar: boolean;
    showName: boolean;
    showEmail: boolean;
    actions: UserAction[];
  };

  // Permissões
  checkPermissions?: boolean;     // Padrão: false
}
```

### MenuItem

```typescript
interface MenuItem {
  id: string;
  label: string;
  icon?: string;                  // Nome do ícone Lucide (ex: 'home', 'users')
  route?: string;                 // Rota React Router
  badge?: {
    text: string;
    variant: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  };
  onClick?: () => void;           // Handler customizado
  permission?: string;            // Permissão necessária
  children?: MenuItem[];          // Subitens (nested menu)
  disabled?: boolean;
}
```

## Exemplos

### Menu com Subitens

```tsx
const config = {
  layout: 'sidebar-left',
  items: [
    {
      id: 'settings',
      label: 'Configurações',
      icon: 'settings',
      children: [
        {
          id: 'general',
          label: 'Geral',
          icon: 'sliders',
          route: '/settings/general'
        },
        {
          id: 'security',
          label: 'Segurança',
          icon: 'shield',
          route: '/settings/security'
        }
      ]
    }
  ]
};
```

### Logo Customizado

```tsx
const config = {
  layout: 'sidebar-left',
  brand: {
    portalName: 'Acme Inc',
    logo: <img src="/logo.png" alt="Logo" className="h-8 w-8" />,
    showLogo: true
  },
  items: [/* ... */]
};
```

### User Menu com Ações Customizadas

```tsx
const config = {
  layout: 'sidebar-left',
  enableUserMenu: true,
  userMenu: {
    position: 'bottom',
    showAvatar: true,
    showName: true,
    showEmail: true,
    actions: [
      {
        label: 'Configurações',
        icon: 'settings',
        route: '/settings'
      },
      {
        label: 'Ajuda',
        icon: 'help-circle',
        onClick: () => window.open('https://help.example.com')
      }
    ]
  },
  items: [/* ... */]
};
```

### Sidebar com Busca

```tsx
const config = {
  layout: 'sidebar-left',
  enableSearch: true,
  items: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'layout-dashboard',
      route: '/dashboard'
    },
    {
      id: 'products',
      label: 'Produtos',
      icon: 'package',
      route: '/products'
    },
    // Ao buscar por "prod", apenas "Produtos" será exibido
  ]
};
```

## Ícones Lucide

Use os nomes dos ícones no formato kebab-case. Serão convertidos automaticamente:

```tsx
{
  icon: 'arrow-right'    // → ArrowRight
  icon: 'layout-dashboard' // → LayoutDashboard
  icon: 'user-circle'    // → UserCircle
}
```

Veja todos os ícones disponíveis em: https://lucide.dev/icons

## Atalhos de Teclado

- `Ctrl+B` / `Cmd+B` - Toggle sidebar (desktop)
- `Ctrl+K` / `Cmd+K` - Focar campo de busca

## Theming

O sidebar usa CSS variables do shadcn/ui:

```css
--sidebar-background
--sidebar-foreground
--sidebar-primary
--sidebar-primary-foreground
--sidebar-accent
--sidebar-accent-foreground
--sidebar-border
--sidebar-ring
```

Para customizar, sobrescreva essas variáveis no seu tema.

## Responsividade

- **Desktop (≥768px)**: Sidebar inline com collapse
- **Mobile (<768px)**: Sheet overlay (slide-in)

O comportamento é gerenciado automaticamente pelo `SidebarProvider`.

## Persistência de Estado

Quando `persistState: true`, o estado collapsed/expanded é salvo em:

```
localStorage['sidebar_state'] = 'true' | 'false'
```

## Integração com Autenticação

O `SidebarUserMenu` integra automaticamente com `useAuth()` do `AuthContext`:

- Exibe avatar, nome e email do usuário logado
- Ação "Sair" chama `logout()` e redireciona para `/auth/login`
- Se não autenticado, o menu não é renderizado

## Componentes Internos

Se precisar de controle granular, use os componentes individuais:

```tsx
import {
  SidebarBrand,
  SidebarUserMenu,
  SidebarSearch,
  SidebarItem
} from '@/modules/sidebar';
```

Mas geralmente o componente `<Sidebar config={...} />` é suficiente.
