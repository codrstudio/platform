# Auth Module

Módulo de autenticação da plataforma que fornece interfaces para login, logout, registro e gerenciamento de sessão.

## Visão Geral

O módulo Auth é um **wrapper sobre o Canal de Autenticação** (`/api/1/auth/*`), fornecendo componentes de UI para interagir com o sistema de autenticação da plataforma. Ele **não implementa lógica de autenticação**, delegando toda a validação e processamento para o Backend/Backbone.

## SPEC Compliance

- **SPEC-module-auth.md**: Especificação completa do módulo
- **spec/ui/auth-module-interfaces.md**: UI/UX e wireframes
- **SPEC-authentication.md**: Canal de autenticação e contratos

## Características

### Obrigatórias (SPEC-AUTH-F-*)

- ✅ **Login** com credenciais (username/password)
- ✅ **Logout** seguro com revogação de tokens
- ✅ **Refresh automático** de tokens
- ✅ **Proteção de rotas** com redirect inteligente

### Opcionais (SPEC-AUTH-O-*)

- 🔲 **Registro** (signup) via JQEL
- 🔲 **Recuperação de senha** via workflows n8n
- 🔲 **Logout de todas as sessões**
- ✅ **Seleção de Realm/Schema**

## Componentes Exportados

### Obrigatórios (SPEC-AUTH-E-001)

- **`<LoginPage />`**: Página completa de login
- **`<ProtectedRoute />`**: Wrapper para rotas protegidas
- **`useAuth()`**: Hook do AuthContext (já existe em `/contexts/AuthContext`)

### Opcionais (SPEC-AUTH-E-002)

- **`<LogoutButton />`**: Botão de logout com confirmação opcional
- **`<UserAvatar />`**: Avatar do usuário com dropdown menu
- **`<RequirePermission />`**: Wrapper para permissões (já existe em `/components/auth/RequirePermission`)

## Instalação

O módulo é registrado automaticamente ao importar:

```typescript
import { authModule } from '@/modules/auth';
```

## Configuração de Instância

### Exemplo Básico

```json
{
  "instanceId": "login-main",
  "moduleId": "auth",
  "portalId": "main",
  "config": {
    "loginRoute": "/login",
    "logoutRedirect": "/",
    "realm": "default",
    "schema": "app",
    "layout": "centered"
  }
}
```

### Exemplo Completo

```json
{
  "instanceId": "auth-portal-app",
  "moduleId": "auth",
  "portalId": "app",
  "config": {
    "loginRoute": "/app/login",
    "logoutRedirect": "/app/login",
    "realm": "clientes",
    "schema": "app",
    "allowRealmSelection": false,
    "allowSchemaSelection": false,
    "enableSignup": false,
    "enablePasswordRecovery": false,
    "enableRememberMe": true,
    "sessionTimeout": 1800000,
    "autoRefresh": true,
    "layout": "card",
    "logo": "/assets/logo.svg",
    "brandColor": "#3B82F6",
    "texts": {
      "loginTitle": "Acesse sua conta",
      "loginSubtitle": "Continue de onde parou"
    }
  }
}
```

### Parâmetros de Configuração

| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| `loginRoute` | string | `/login` | Rota da página de login |
| `logoutRedirect` | string | `/login` | Rota após logout |
| `realm` | string | `default` | Realm padrão |
| `schema` | string | `app` | Schema padrão |
| `allowRealmSelection` | boolean | `false` | Permitir seleção de realm |
| `allowSchemaSelection` | boolean | `false` | Permitir seleção de schema |
| `enableRememberMe` | boolean | `true` | Habilitar "Lembrar de mim" |
| `sessionTimeout` | number | `1800000` | Timeout em ms (30 min) |
| `autoRefresh` | boolean | `true` | Auto-refresh de tokens |
| `layout` | enum | `centered` | Layout: `centered`, `split`, `minimal`, `card` |
| `logo` | string | `` | URL da logo |
| `brandColor` | string | `#3B82F6` | Cor principal |

## Uso

### Login Page

```typescript
import { LoginPage } from '@/modules/auth';

// Standalone (sem instância)
<LoginPage />

// Com instância configurada
<LoginPage
  instanceId="login-main"
  portalId="main"
  moduleId="auth"
/>
```

### Protected Route

```typescript
import { ProtectedRoute } from '@/modules/auth';

<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    }
  />
</Routes>
```

### Logout Button

```typescript
import { LogoutButton } from '@/modules/auth';

// Simples
<LogoutButton />

// Com confirmação
<LogoutButton confirmLogout />

// Customizado
<LogoutButton
  variant="ghost"
  showIcon={false}
  text="Sign out"
/>
```

### User Avatar

```typescript
import { UserAvatar } from '@/modules/auth';

// Avatar simples
<UserAvatar />

// Com dropdown menu
<UserAvatar showDropdown />

// Tamanho customizado
<UserAvatar size="lg" showDropdown />
```

## Fluxos

### Fluxo de Login (SPEC-AUTH-I-001)

```
1. Usuário preenche formulário
2. Validação client-side (React Hook Form + Zod)
3. POST /api/1/auth/login { realm?, schema?, username, password }
4. Backend/Backbone valida credenciais
5. Retorna { access_token, refresh_token, payload }
6. AuthContext armazena tokens (memória + sessionStorage)
7. Atualiza estado com usuário autenticado
8. Redireciona para rota original (returnUrl)
```

### Fluxo de Logout (SPEC-AUTH-I-003)

```
1. Usuário clica em logout
2. POST /api/1/auth/logout { refresh_token }
3. Backend revoga refresh_token
4. AuthContext remove tokens locais
5. Atualiza estado (user = null)
6. Redireciona para página de login
```

### Fluxo de Refresh (SPEC-AUTH-I-002)

```
1. Access token próximo de expirar (timer de 5 min antes)
2. POST /api/1/auth/refresh { refresh_token }
3. Backend valida refresh_token
4. Retorna novos access_token e refresh_token
5. AuthContext atualiza tokens
6. Continua operação normalmente
```

## Layouts Suportados

### Centered (Padrão)
Card centralizado em fundo neutro. Ideal para aplicações simples.

### Split
Tela dividida 50/50: marketing à esquerda, formulário à direita. Para landing pages.

### Minimal
Layout mínimo sem distrações. Para painéis administrativos.

### Card
Card flutuante com background decorativo. Para apps modernos/SaaS.

## Segurança

### ✅ Implementado

- Tokens em memória (access) + sessionStorage (refresh)
- HTTPS obrigatório via Backend
- Validação client-side e server-side
- Rate limiting (Backend)
- CSRF protection (Backend)
- Auto-logout em refresh failure

### ❌ Proibido

- Armazenar senhas em qualquer lugar
- Armazenar tokens em localStorage
- Expor tokens em console.log ou URLs
- Enviar tokens em query params

## Acessibilidade

- ✅ Navegação por teclado completa
- ✅ Labels apropriados para screen readers
- ✅ Erros anunciados via `role="alert"`
- ✅ Show/hide password com `aria-label`
- ✅ Loading states com `aria-busy`

## Roadmap

### Fase 1: Login Básico ✅
- [x] LoginForm component
- [x] AuthProvider integration (já existe)
- [x] Token storage (já existe)
- [x] Login API integration
- [x] Redirect após login
- [x] Validação (React Hook Form + Zod)

### Fase 2: Protected Routes ✅
- [x] ProtectedRoute component
- [x] Loading state
- [x] Redirect para login
- [x] Return URL preservation

### Fase 3: Logout ✅
- [x] Logout API integration (já existe)
- [x] LogoutButton component
- [x] Clear tokens
- [x] Confirmação opcional

### Fase 4: Auto-Refresh ✅
- [x] Token expiry detection (já existe)
- [x] Refresh API integration (já existe)
- [x] Auto-refresh timer (já existe)
- [x] Logout on failure (já existe)

### Fase 5: Features Opcionais 🔲
- [ ] Signup page
- [ ] Password recovery flow
- [ ] Remember me functionality
- [ ] Realm/Schema selection (UI pronta)

### Fase 6: Session Management 🔲
- [ ] Session list page
- [ ] Revoke individual session
- [ ] Logout all devices

### Fase 7: Permissions ✅
- [x] RequirePermission component (já existe)
- [x] usePermission hook (já existe)
- [x] Authorize API integration (já existe)

## Estrutura de Arquivos

```
src/modules/auth/
├── manifest.ts              # Manifesto do módulo
├── routes.ts                # Rotas do módulo
├── index.ts                 # Exportações principais
├── README.md                # Esta documentação
├── components/
│   ├── index.ts             # Barrel export
│   ├── ProtectedRoute.tsx   # Proteção de rotas
│   ├── LogoutButton.tsx     # Botão de logout
│   └── UserAvatar.tsx       # Avatar do usuário
└── pages/
    └── LoginPage.tsx        # Página de login
```

## Dependências

### React Ecosystem
- React 19
- React Router
- React Hook Form + Zod

### UI Components (shadcn/ui)
- Button, Input, Label
- Alert, AlertDialog
- Avatar, DropdownMenu

### Icons
- Lucide React (Eye, EyeOff, LogOut, User, Loader2, AlertCircle)

### Contextos
- AuthContext (já existe em `/contexts/AuthContext`)
- ThemeContext (opcional, para branding)

## Integração com Outros Módulos

O módulo Auth é **independente** (sem dependências de outros módulos), mas pode ser **utilizado** por:

- **Setup Module**: Gerenciamento de portais e módulos
- **Sidebar Module**: Menu com UserAvatar
- **Todos os módulos**: Uso de ProtectedRoute e RequirePermission

## Changelog

### v1.0.0 (2025-11-07)
- Implementação inicial do módulo Auth
- LoginPage com suporte a configuração de instância
- ProtectedRoute component
- LogoutButton e UserAvatar
- Layouts: centered, split, minimal, card
- Suporte a Realm/Schema selection
- Integração com AuthContext existente
