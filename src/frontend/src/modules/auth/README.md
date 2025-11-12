# Auth Module

Módulo de proteção de rotas que ativa/desativa a autenticação em portais da plataforma.

## Visão Geral

O módulo Auth funciona como um **mecanismo de proteção de rotas**. Quando ativo em um portal, exige que usuários estejam autenticados para acessar as rotas daquele portal. Quando inativo, o portal permite acesso público sem autenticação.

**IMPORTANTE**: Este módulo **NÃO fornece UI de autenticação** (login pages, logout buttons, user avatars). Ele apenas controla se as rotas são protegidas ou públicas. A UI de login é fornecida globalmente pela aplicação em `src/frontend/src/pages/LoginPage.tsx`.

## Mudança Conceitual (v2.0.0)

### Antes (v1.0.0)
O módulo Auth fornecia:
- ✓ UI de login (LoginPage, layouts variados)
- ✓ Componentes de UI (LogoutButton, UserAvatar)
- ✓ Rotas próprias (`/login`, `/signup`, etc.)
- ✓ Proteção de rotas

### Agora (v2.0.0)
O módulo Auth fornece:
- ✓ **APENAS** controle de proteção de rotas (ativo/inativo)

A aplicação global fornece:
- ✓ UI de login (`src/frontend/src/pages/LoginPage.tsx`)
- ✓ AuthContext para gerenciar autenticação (`src/frontend/src/contexts/AuthContext.tsx`)
- ✓ Rota `/login` global
- ✓ Componente `<ProtectedRoute />` global

**Resultado**: Módulo Auth se torna um "switch" para proteção de rotas, não um fornecedor de UI.

## SPEC Compliance

- **spec/SPEC-module-auth.md**: Especificação completa do módulo (v2.0.0)
- **spec/SPEC-authentication.md**: Canal de autenticação e contratos
- **spec/SPEC-routing.md**: Sistema de roteamento e proteção

## Características

### Responsabilidades (SPEC-AUTH-R-*)

- ✅ **Controlar proteção de rotas** (ativo/inativo)
- ❌ **NÃO fornece UI** de autenticação
- ❌ **NÃO implementa lógica** de autenticação (responsabilidade do AuthContext global)
- ✅ **Single-instance** (apenas UMA instância por portal)
- ✅ **Instância automática** com `instanceId="default"`

### Comportamento de Proteção (SPEC-AUTH-RP-*)

**Se módulo Auth ESTÁ ativo no portal:**
- Todas as rotas do portal exigem autenticação
- Usuários não autenticados são redirecionados para `/login`
- Após login bem-sucedido, usuário é redirecionado para rota original

**Se módulo Auth NÃO ESTÁ ativo no portal:**
- Todas as rotas do portal são públicas (sem proteção)
- Não há redirect para login
- Acesso direto ao conteúdo

## Componentes Fornecidos

### `<ProtectedRoute />` (Opcional)

O módulo **PODE** fornecer seu próprio componente `<ProtectedRoute />`, mas é **opcional** porque já existe uma versão global.

A versão global (`src/frontend/src/components/routing/ProtectedRoute.tsx`) já implementa a lógica de verificação usando `hasModule('auth')`.

## Instalação

O módulo é registrado automaticamente ao importar:

```typescript
import { authModule } from '@/modules/auth';
```

## Configuração de Instância

### Configuração Mínima

Como o módulo Auth é single-instance e funciona como um simples "switch" de proteção, a configuração é mínima ou vazia:

```json
{
  "instanceId": "default",
  "moduleId": "auth",
  "portalId": "main",
  "active": true,
  "config": {}
}
```

**SPEC-AUTH-C-001 a C-004**: Configuração NÃO é necessária para o funcionamento básico. Ativar/desativar proteção depende apenas de:
- Módulo "auth" estar em `portal.activeModules`
- Instância "default" estar com `active: true`

### Configurações Futuras

O módulo PODE suportar configurações adicionais no futuro, como:

```json
{
  "config": {
    "sessionTimeout": 1800000,
    "sharedAcrossPortals": false
  }
}
```

Mas atualmente, essas configurações não são implementadas.

## Exemplos de Uso

### Portal COM Proteção - "main"

**Configuração do Portal:**
```json
{
  "portalId": "main",
  "activeModules": ["dashboard", "auth"]  // auth está ativo
}
```

**Configuração da Instância:**
```json
{
  "instanceId": "default",
  "moduleId": "auth",
  "portalId": "main",
  "active": true,
  "config": {}
}
```

**Resultado**: Todas as rotas do portal "main" exigem autenticação. Redirect para `/login` se não autenticado.

---

### Portal SEM Proteção - "setup"

**Configuração do Portal:**
```json
{
  "portalId": "setup",
  "activeModules": ["setup"]  // auth NÃO está ativo
}
```

**Resultado**: Todas as rotas do portal "setup" são públicas. Sem redirect para login.

---

### Portal com Auth Desativado - "sandbox"

**Configuração do Portal:**
```json
{
  "portalId": "sandbox",
  "activeModules": ["auth"]  // auth está na lista
}
```

**Configuração da Instância:**
```json
{
  "instanceId": "default",
  "moduleId": "auth",
  "portalId": "sandbox",
  "active": false,  // mas instância está INATIVA
  "config": {}
}
```

**Resultado**: Rotas do portal "sandbox" são públicas (instância inativa = sem proteção).

## Fluxo de Verificação de Proteção

### Lógica Implementada (SPEC-AUTH-FL-001)

Componente global `<ProtectedRoute />` implementa esta lógica:

```typescript
// 1. Verifica se módulo auth está ativo no portal atual
const authModuleActive = hasModule('auth');

// 2. Se auth NÃO está ativo → rotas são públicas
if (!authModuleActive) {
  return <>{children}</>;  // Renderiza sem proteção
}

// 3. Se auth ESTÁ ativo → verifica autenticação
const { isAuthenticated } = useAuth();

if (!isAuthenticated) {
  // Salva URL atual para redirect após login
  sessionStorage.setItem('returnUrl', location.pathname);
  return <Navigate to="/login" replace />;
}

// 4. Usuário autenticado → renderiza conteúdo protegido
return <>{children}</>;
```

**SPEC-AUTH-FL-002**: Como módulo é singleInstance, não precisa verificar qual instância (sempre "default").

## Integração com Aplicação

### App.tsx

Estrutura de rotas globais:

```tsx
<Routes>
  {/* Rota pública: Login */}
  <Route path="/login" element={<LoginPage />} />

  {/* Rotas de portais: Proteção condicional */}
  <Route path="/*" element={
    <ProtectedRoute>
      <PortalRouter />
    </ProtectedRoute>
  } />
</Routes>
```

- `<ProtectedRoute />` envolve `<PortalRouter />` para proteger condicionalmente
- Dentro de cada portal, a proteção é determinada pelo módulo auth daquele portal
- Rota `/login` é sempre pública (não protegida)

## Single Instance

### Comportamento (SPEC-AUTH-M-*)

- Cada portal PODE ter no máximo UMA instância do módulo auth
- Instância DEVE ter `instanceId="default"` (fixo)
- Instância DEVE ser criada automaticamente ao ativar módulo no portal
- Instância default NÃO PODE ser removida manualmente
- Instância default PODE ser desativada (mas não removida)

### Isolamento entre Portais

- Instâncias em portais diferentes DEVEM ser independentes
- Portal "main" com auth ativo NÃO afeta proteção do portal "setup" sem auth
- Cada portal controla independentemente se suas rotas são protegidas

## Infraestrutura de Autenticação

### Responsabilidade do AuthContext Global (SPEC-AUTH-INF-*)

A infraestrutura de autenticação (login, logout, refresh, estado) É fornecida pelo `AuthContext` global:

```typescript
// src/frontend/src/contexts/AuthContext.tsx
const {
  user,
  isAuthenticated,
  isLoading,
  login,
  logout,
  refresh
} = useAuth();
```

O módulo Auth **NÃO** fornece:
- AuthContext (já existe globalmente)
- LoginPage (já existe globalmente em `src/frontend/src/pages/LoginPage.tsx`)
- Lógica de autenticação (responsabilidade do AuthContext)

O módulo Auth apenas controla **SE** a proteção está ativa, não **COMO** ela funciona.

### Canal de Autenticação (SPEC-AUTH-INF-005, INF-006)

Autenticação utiliza o Canal de Autenticação (`/api/1/auth/*`):

- `POST /api/1/auth/login` - Autenticação
- `POST /api/1/auth/refresh` - Renovação de tokens
- `POST /api/1/auth/logout` - Logout
- `POST /api/1/auth/logout-all` - Logout de todas as sessões
- `POST /api/1/auth/authorize` - Validação de permissões

## Estrutura de Arquivos

```
src/modules/auth/
├── manifest.ts              # Manifesto do módulo (v2.0.0)
├── index.ts                 # Exportações principais
├── README.md                # Esta documentação
└── components/
    ├── index.ts             # Barrel export
    └── ProtectedRoute.tsx   # Proteção de rotas (opcional)
```

**Removido em v2.0.0:**
- `pages/LoginPage.tsx` (movido para global)
- `components/LogoutButton.tsx` (UI não é mais responsabilidade)
- `components/UserAvatar.tsx` (UI não é mais responsabilidade)
- `routes.ts` (não tem mais rotas próprias)

## Dependências

### Nenhuma

O módulo Auth é completamente **independente** (sem dependências de outros módulos).

### Integrações

O módulo Auth é **utilizado** por:
- **ProtectedRoute global**: Verifica se módulo está ativo via `hasModule('auth')`
- **Portal configuration**: Define quais portais têm proteção ativa
- **Todos os módulos**: Herdam proteção do portal onde estão ativos

## Changelog

### v2.0.0 (2025-11-11)
- **BREAKING CHANGE**: Módulo reformulado como mecanismo de proteção de rotas
- Removido: LoginPage, LogoutButton, UserAvatar (movidos para global)
- Removido: routes.ts (não tem mais rotas próprias)
- Removido: Configuração complexa (agora é mínima/vazia)
- Simplificado: Manifest com foco em proteção de rotas
- Atualizado: SPEC-module-auth.md para refletir novo propósito

### v1.0.0 (2025-11-07)
- Implementação inicial do módulo Auth
- LoginPage com suporte a configuração de instância
- ProtectedRoute component
- LogoutButton e UserAvatar
- Layouts: centered, split, minimal, card
- Suporte a Realm/Schema selection
- Integração com AuthContext existente
