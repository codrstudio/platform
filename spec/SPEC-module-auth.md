# SPEC-module-auth.md

## Especificação: Módulo de Autenticação (Route Protection)

### Escopo
Este documento especifica o módulo Auth, responsável por ativar/desativar a proteção de rotas em portais da plataforma.

---

## 1. Definição

### Propósito
O módulo Auth funciona como um **mecanismo de proteção de rotas**. Quando ativo em um portal, ele exige que usuários estejam autenticados para acessar as rotas daquele portal. Quando inativo, o portal permite acesso público sem autenticação.

**IMPORTANTE**: O módulo Auth **NÃO** fornece UI de autenticação (login pages, logout buttons, etc). Ele apenas controla se as rotas são protegidas ou públicas. A UI de login é fornecida globalmente pela aplicação.

### Natureza
- **Tipo**: Módulo de Funcionalidade
- **Modo de Instância**: Single (apenas UMA instância por portal)
- **Dependências**: Nenhuma
- **Opcional**: Sim (portais podem funcionar sem proteção de rotas)

---

## 2. Responsabilidades

### SPEC-AUTH-R-001
O módulo Auth DEVE controlar se as rotas de um portal são protegidas ou públicas

### SPEC-AUTH-R-002
O módulo Auth NÃO DEVE fornecer UI de autenticação (login, logout, avatars)

### SPEC-AUTH-R-003
O módulo Auth NÃO DEVE implementar lógica de autenticação (responsabilidade do AuthContext global)

### SPEC-AUTH-R-004
O módulo Auth DEVE ter exatamente UMA instância por portal (single-instance)

### SPEC-AUTH-R-005
Instância DEVE ser criada automaticamente com `instanceId="default"` ao ativar o módulo

---

## 3. Funcionalidades

### Proteção de Rotas

**SPEC-AUTH-RP-001:** Se módulo Auth ESTÁ ativo no portal:
- Todas as rotas do portal DEVEM exigir autenticação
- Usuários não autenticados DEVEM ser redirecionados para `/login`
- Após login bem-sucedido, usuário DEVE ser redirecionado para rota original

**SPEC-AUTH-RP-002:** Se módulo Auth NÃO ESTÁ ativo no portal:
- Todas as rotas do portal DEVEM ser públicas (sem proteção)
- Não há redirect para login
- Acesso direto ao conteúdo do portal

**SPEC-AUTH-RP-003:** A verificação de proteção DEVE considerar:
- Se módulo Auth está ativo no portal (`activeModules` inclui "auth")
- Como módulo é singleInstance, sempre usa a instância "default"

**SPEC-AUTH-RP-004:** Proteção de rotas DEVE ser implementada pelo componente global `<ProtectedRoute />`

**SPEC-AUTH-RP-005:** `<ProtectedRoute />` DEVE verificar se módulo Auth está ativo usando `hasModule('auth')`

**SPEC-AUTH-RP-006:** Rota `/login` DEVE sempre ser pública (não protegida)

---

## 4. Infraestrutura de Autenticação

### Responsabilidade do AuthContext Global

**SPEC-AUTH-INF-001:** A infraestrutura de autenticação (login, logout, refresh, estado) É fornecida pelo `AuthContext` global da aplicação

**SPEC-AUTH-INF-002:** O módulo Auth NÃO fornece AuthContext (já existe globalmente)

**SPEC-AUTH-INF-003:** O módulo Auth NÃO fornece LoginPage (já existe globalmente em `src/frontend/src/pages/LoginPage.tsx`)

**SPEC-AUTH-INF-004:** O módulo Auth apenas controla SE a proteção está ativa, não COMO ela funciona

### Canal de Autenticação

**SPEC-AUTH-INF-005:** Autenticação utiliza o Canal de Autenticação (`/api/1/auth/*`)

**SPEC-AUTH-INF-006:** Canal de Autenticação oferece rotas:
- `POST /api/1/auth/login` - Autenticação
- `POST /api/1/auth/refresh` - Renovação de tokens
- `POST /api/1/auth/logout` - Logout
- `POST /api/1/auth/logout-all` - Logout de todas as sessões
- `POST /api/1/auth/authorize` - Validação de permissões

---

## 5. Configuração de Instância

### Parâmetros

**SPEC-AUTH-C-001:** Instância do módulo Auth PODE ter configuração mínima ou vazia

**SPEC-AUTH-C-002:** Configuração NÃO é necessária para o funcionamento básico (apenas ativo/inativo)

**SPEC-AUTH-C-003:** Instância PODE ter configuração futura para:
```typescript
{
  // Configurações futuras (se necessário)
  // Ex: timeout de sessão, compartilhamento entre portals, etc.
}
```

**SPEC-AUTH-C-004:** Ativar/desativar proteção depende apenas de:
- Módulo "auth" estar em `portal.activeModules`
- Instância "default" estar com `active: true`

---

## 6. Componentes Fornecidos

### Único Componente

**SPEC-AUTH-E-001:** Módulo Auth PODE fornecer componente `<ProtectedRoute />` (opcional)

**SPEC-AUTH-E-002:** Componente `<ProtectedRoute />` do módulo é OPCIONAL porque já existe versão global

**SPEC-AUTH-E-003:** Versão global de `<ProtectedRoute />` já implementa a lógica de verificação via `hasModule('auth')`

---

## 7. Single Instance

### Comportamento

**SPEC-AUTH-M-001:** Cada portal PODE ter no máximo UMA instância do módulo auth

**SPEC-AUTH-M-002:** Instância DEVE ter `instanceId="default"` (fixo)

**SPEC-AUTH-M-003:** Instância DEVE ser criada automaticamente ao ativar módulo no portal

**SPEC-AUTH-M-004:** Instância default NÃO PODE ser removida manualmente

**SPEC-AUTH-M-005:** Instância default PODE ser desativada (mas não removida)

### Isolamento entre Portais

**SPEC-AUTH-M-006:** Instâncias em portais diferentes DEVEM ser independentes

**SPEC-AUTH-M-007:** Portal "main" com auth ativo NÃO afeta proteção do portal "setup" sem auth

**SPEC-AUTH-M-008:** Cada portal controla independentemente se suas rotas são protegidas

---

## 8. Exemplos de Uso

**Nota**: Como auth é single-instance, todas as instâncias usam `instanceId="default"` (criado automaticamente).

### Portal COM Proteção - "main"
```json
{
  "portalId": "main",
  "activeModules": ["dashboard", "auth"]  // auth está ativo
}
```

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
```json
{
  "portalId": "setup",
  "activeModules": ["setup"]  // auth NÃO está ativo
}
```

**Resultado**: Todas as rotas do portal "setup" são públicas. Sem redirect para login.

---

### Portal com Auth Desativado - "sandbox"
```json
{
  "portalId": "sandbox",
  "activeModules": ["auth"]  // auth está na lista
}
```

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

---

## 9. Fluxo de Verificação de Proteção

### Lógica Implementada

**SPEC-AUTH-FL-001:** Componente global `<ProtectedRoute />` implementa esta lógica:

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

**SPEC-AUTH-FL-002:** Como módulo é singleInstance, não precisa verificar qual instância (sempre "default")

---

## 10. Integração com Aplicação

### App.tsx

**SPEC-AUTH-INT-001:** Estrutura de rotas globais:
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

**SPEC-AUTH-INT-002:** `<ProtectedRoute />` envolve `<PortalRouter />` para proteger condicionalmente

**SPEC-AUTH-INT-003:** Dentro de cada portal, a proteção é determinada pelo módulo auth daquele portal

---

## 11. Diferença Conceitual

### Antes da Reformulação

O módulo Auth fornecia:
- ✓ UI de login (LoginPage, layouts variados)
- ✓ Componentes de UI (LogoutButton, UserAvatar)
- ✓ Rotas próprias (`/login`, `/signup`, etc.)
- ✓ Proteção de rotas

### Depois da Reformulação (Atual)

O módulo Auth fornece:
- ✓ **APENAS** controle de proteção de rotas (ativo/inativo)

A aplicação global fornece:
- ✓ UI de login (`src/frontend/src/pages/LoginPage.tsx`)
- ✓ AuthContext para gerenciar autenticação
- ✓ Rota `/login` global
- ✓ Componente `<ProtectedRoute />` global

**Resultado**: Módulo Auth se torna um "switch" para proteção de rotas, não um fornecedor de UI.

---

*Esta especificação define os requisitos do módulo Auth como mecanismo de proteção de rotas. Implementação técnica em documentação separada.*
