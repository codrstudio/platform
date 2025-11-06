# UI/UX Design: Módulo Auth (Autenticação)

## Especificação de Interfaces do Módulo Auth

### Escopo
Este documento define a arquitetura de interface e padrões de UI/UX para o módulo Auth, o sistema de autenticação da plataforma. Baseado em SPEC-module-auth.md, SPEC-authentication.md, SPEC-concepts.md e SPEC-architecture.md.

---

## 1. Arquitetura de Autenticação

### 1.1 Fluxos Principais

```
┌─────────────────────────────────────────────────────────┐
│  FLUXOS DE AUTENTICAÇÃO                                 │
│                                                         │
│  1. Login                                               │
│     User → LoginForm → POST /api/1/auth/login          │
│     → Tokens → Storage → AuthContext → Redirect        │
│                                                         │
│  2. Refresh (Automático)                                │
│     Token Expiring → POST /api/1/auth/refresh          │
│     → New Tokens → Update Storage → Continue           │
│                                                         │
│  3. Logout                                              │
│     User → POST /api/1/auth/logout → Clear Tokens      │
│     → AuthContext Clear → Redirect to Login            │
│                                                         │
│  4. Protected Route                                     │
│     Route Access → Check AuthContext → If Authenticated│
│     → Allow Access | Else → Redirect to Login          │
│                                                         │
│  5. Permission Check (Opcional)                         │
│     Component → usePermission(permission) → POST       │
│     /api/1/auth/authorize → Allow | Deny Render        │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Padrões de Navegação Adotados

**Authentication Flow Pattern**: Fluxo linear de autenticação
- Login → Success → Redirect to original route
- Login → Failure → Show error → Retry

**Session Persistence Pattern**: Manutenção de sessão
- Tokens em HttpOnly cookies (preferencial)
- Refresh automático antes de expirar
- Logout limpa todos os tokens

**Protected Route Pattern**: Proteção de acesso
- Guard em rotas privadas
- Redirect to login preservando rota original
- Return to original route após login

**Permission-Based Rendering**: Controle granular
- Componentes visíveis apenas com permissão
- Verificação via `/api/1/auth/authorize`
- Fallback quando sem permissão

---

## 2. Login Page

### 2.1 Wireframe (Desktop - Layout Centrado)

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│                                                                │
│              ┌────────────────────────────────────┐           │
│              │                                    │           │
│              │  [Logo]                            │           │
│              │                                    │           │
│              │  Bem-vindo de volta                │           │
│              │  Entre com suas credenciais        │           │
│              │                                    │           │
│              │  Email / Usuário *                 │           │
│              │  ┌──────────────────────────────┐ │           │
│              │  │  usuario@email.com           │ │           │
│              │  └──────────────────────────────┘ │           │
│              │                                    │           │
│              │  Senha *                           │           │
│              │  ┌──────────────────────────────┐ │           │
│              │  │  ••••••••••        [👁️]     │ │           │
│              │  └──────────────────────────────┘ │           │
│              │                                    │           │
│              │  ☐ Lembrar de mim                 │           │
│              │                                    │           │
│              │  [Entrar ──────────────────────]  │           │
│              │                                    │           │
│              │  Esqueceu a senha?                 │           │
│              │                                    │           │
│              │  ─────────── ou ───────────       │           │
│              │                                    │           │
│              │  [Continuar com Google]            │           │
│              │  [Continuar com Microsoft]         │           │
│              │                                    │           │
│              │  Não tem conta? Cadastre-se       │           │
│              │                                    │           │
│              └────────────────────────────────────┘           │
│                                                                │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 2.2 Componentes do Login

**Logo/Brand**:
- Imagem ou texto
- Posição: topo centralizado
- Tamanho: 48-64px altura

**Heading & Subheading**:
- Título: "Bem-vindo de volta" (h1, font-bold, text-2xl)
- Subtítulo: "Entre com suas credenciais" (text-muted-foreground, text-sm)

**Email/Username Field**:
- Label: "Email / Usuário" com asterisco (*)
- Input type="email" ou type="text"
- Placeholder: "usuario@email.com"
- Validação inline: formato de email (se email)
- Autocomplete: "username email"

**Password Field**:
- Label: "Senha" com asterisco (*)
- Input type="password"
- Botão toggle show/hide (ícone 👁️)
- Autocomplete: "current-password"

**Remember Me Checkbox**:
- Checkbox + Label "Lembrar de mim"
- Opcional (configurável na instância)
- Armazena preferência em localStorage

**Submit Button**:
- Text: "Entrar" ou "Login"
- Full width
- Primary variant
- Loading state com spinner
- Disabled durante submissão

**Forgot Password Link**:
- Link: "Esqueceu a senha?"
- Abre modal ou navega para recovery page
- Opcional (se enablePasswordRecovery = true)

**Social Login (OAuth)**:
- Separador "ou" com linhas horizontais
- Botões de OAuth providers
- Ícones + texto: "Continuar com [Provider]"
- Opcional (configurável na instância)

**Signup Link**:
- Text: "Não tem conta? Cadastre-se"
- Link para signup page
- Opcional (se enableSignup = true)

### 2.3 Validações

**Client-side (Zod)**:
```typescript
const loginSchema = z.object({
  username: z.string()
    .min(1, "Campo obrigatório")
    .email("Email inválido") // Se for email
    .or(z.string().min(3, "Mínimo 3 caracteres")), // Se for username
  password: z.string()
    .min(1, "Campo obrigatório"),
  rememberMe: z.boolean().optional()
});
```

**Validação Inline**:
- Validar ao perder foco (onBlur)
- Mostrar erro abaixo do campo
- Ícone ✗ vermelho ao lado do input

**Validação de Submit**:
- Validar todos os campos antes de enviar
- Botão disabled se houver erros
- Focus no primeiro campo com erro

### 2.4 Estados Visuais

**Normal**:
```
Email / Usuário *
┌──────────────────────────────┐
│  usuario@email.com           │
└──────────────────────────────┘
```

**Error**:
```
Email / Usuário *
┌──────────────────────────────┐
│  invalido              ✗     │ ← Border red
└──────────────────────────────┘
✗ Email inválido                 ← Error message
```

**Loading (Submitting)**:
```
┌──────────────────────────────┐
│  [⟳] Entrando...             │ ← Button disabled, spinner
└──────────────────────────────┘
```

**Success (Redirect)**:
```
┌──────────────────────────────┐
│  [✓] Login realizado!        │ ← Brief success message
└──────────────────────────────┘
(Redirecting...)
```

**Error (Server)**:
```
┌────────────────────────────────┐
│  ⚠️  Credenciais inválidas     │ ← Alert banner
│  Verifique seu email e senha   │
└────────────────────────────────┘
```

### 2.5 Mensagens de Erro

**Credenciais Inválidas**:
```
⚠️  Credenciais inválidas
Verifique seu email e senha e tente novamente.
```

**Usuário Bloqueado**:
```
⚠️  Conta temporariamente bloqueada
Muitas tentativas de login. Tente novamente em 15 minutos.
```

**Erro de Rede**:
```
⚠️  Erro de conexão
Verifique sua internet e tente novamente.
```

**Erro do Servidor**:
```
⚠️  Erro no servidor
Tente novamente em alguns instantes.
```

---

## 3. Login Page - Variações

### 3.1 Layout Split Screen

```
┌─────────────────────────────────────────────────────────┐
│  ┌──────────────────────┐  ┌──────────────────────┐    │
│  │                      │  │                      │    │
│  │  [Background Image]  │  │  [Logo]              │    │
│  │                      │  │                      │    │
│  │  Título grande       │  │  Bem-vindo           │    │
│  │  Descrição           │  │                      │    │
│  │  Marketing content   │  │  Email *             │    │
│  │                      │  │  ┌────────────────┐  │    │
│  │                      │  │  │                │  │    │
│  │                      │  │  └────────────────┘  │    │
│  │                      │  │                      │    │
│  │                      │  │  Senha *             │    │
│  │                      │  │  ┌────────────────┐  │    │
│  │                      │  │  │                │  │    │
│  │                      │  │  └────────────────┘  │    │
│  │                      │  │                      │    │
│  │                      │  │  [Entrar ─────────] │    │
│  │                      │  │                      │    │
│  └──────────────────────┘  └──────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

**Uso**: Landing pages, marketing-heavy portals
- 50/50 split (desktop)
- Marketing à esquerda, form à direita
- Mobile: stacked (marketing acima, form abaixo)

### 3.2 Layout Minimal

```
┌─────────────────────────────────┐
│                                 │
│  [Logo pequeno]                 │
│                                 │
│  Email                          │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│  Senha                          │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│  [Entrar ─────────────────]    │
│                                 │
└─────────────────────────────────┘
```

**Uso**: Admin panels, internal tools
- Mínimo de distrações
- Foco no login rápido
- Sem marketing content

### 3.3 Layout Card (Modal-style)

```
┌─────────────────────────────────────────────────────────┐
│  [Background pattern or gradient]                       │
│                                                         │
│        ┌───────────────────────────────────┐           │
│        │  [Logo]                           │           │
│        │                                   │           │
│        │  Email *                          │           │
│        │  ┌─────────────────────────────┐  │           │
│        │  │                             │  │           │
│        │  └─────────────────────────────┘  │           │
│        │                                   │           │
│        │  Senha *                          │           │
│        │  ┌─────────────────────────────┐  │           │
│        │  │                             │  │           │
│        │  └─────────────────────────────┘  │           │
│        │                                   │           │
│        │  [Entrar ───────────────────]    │           │
│        │                                   │           │
│        └───────────────────────────────────┘           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Uso**: Modern apps, SaaS platforms
- Card flutuante centralizado
- Background decorativo
- Sombra/elevação no card

---

## 4. Realm/Schema Selection (Opcional)

### 4.1 Wireframe (Com Seleção)

```
┌────────────────────────────────────┐
│  [Logo]                            │
│                                    │
│  Selecione o ambiente              │
│                                    │
│  Realm *                           │
│  ┌──────────────────────────────┐ │
│  │  default              [▾]    │ │
│  └──────────────────────────────┘ │
│  ┌──────────────────────────────┐ │
│  │  • default                   │ │
│  │  • clientes                  │ │
│  │  • admin                     │ │
│  └──────────────────────────────┘ │
│                                    │
│  Schema *                          │
│  ┌──────────────────────────────┐ │
│  │  app                  [▾]    │ │
│  └──────────────────────────────┘ │
│                                    │
│  Email / Usuário *                 │
│  ┌──────────────────────────────┐ │
│  │                              │ │
│  └──────────────────────────────┘ │
│                                    │
│  Senha *                           │
│  ┌──────────────────────────────┐ │
│  │                              │ │
│  └──────────────────────────────┘ │
│                                    │
│  [Entrar ──────────────────────]  │
│                                    │
└────────────────────────────────────┘
```

### 4.2 Comportamento

**Realm Dropdown**:
- Lista de realms disponíveis
- Configurado na instância ou buscado via API
- Default pre-selecionado (se configurado)

**Schema Dropdown**:
- Lista de schemas do realm selecionado
- Pode depender do realm escolhido
- Default pre-selecionado

**Opcional**:
- Se `allowRealmSelection = false`, campo hidden com valor default
- Se `allowSchemaSelection = false`, campo hidden com valor default

---

## 5. Signup Page (Opcional)

### 5.1 Wireframe

```
┌────────────────────────────────────┐
│  [Logo]                            │
│                                    │
│  Criar conta                       │
│  Preencha os dados abaixo          │
│                                    │
│  Nome completo *                   │
│  ┌──────────────────────────────┐ │
│  │  João Silva                  │ │
│  └──────────────────────────────┘ │
│                                    │
│  Email *                           │
│  ┌──────────────────────────────┐ │
│  │  joao@email.com              │ │
│  └──────────────────────────────┘ │
│                                    │
│  Senha *                           │
│  ┌──────────────────────────────┐ │
│  │  ••••••••••        [👁️]     │ │
│  └──────────────────────────────┘ │
│  Mínimo 8 caracteres               │
│                                    │
│  Confirmar senha *                 │
│  ┌──────────────────────────────┐ │
│  │  ••••••••••        [👁️]     │ │
│  └──────────────────────────────┘ │
│                                    │
│  ☑ Aceito os termos de uso         │
│                                    │
│  [Criar conta ──────────────────]  │
│                                    │
│  Já tem conta? Faça login          │
│                                    │
└────────────────────────────────────┘
```

### 5.2 Validações de Signup

```typescript
const signupSchema = z.object({
  name: z.string()
    .min(3, "Mínimo 3 caracteres"),
  email: z.string()
    .email("Email inválido"),
  password: z.string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Deve conter maiúscula")
    .regex(/[a-z]/, "Deve conter minúscula")
    .regex(/[0-9]/, "Deve conter número"),
  passwordConfirmation: z.string(),
  acceptTerms: z.boolean()
    .refine(val => val === true, "Você deve aceitar os termos")
}).refine(data => data.password === data.passwordConfirmation, {
  message: "Senhas não conferem",
  path: ["passwordConfirmation"]
});
```

### 5.3 Password Strength Indicator

```
Senha *
┌──────────────────────────────┐
│  ••••••••                    │
└──────────────────────────────┘
Força: ▓▓▓▓░░░░ Média         ← Visual indicator

Requisitos:
✓ Mínimo 8 caracteres
✓ Contém maiúscula
✗ Contém número               ← Checklist
✗ Contém caractere especial
```

---

## 6. Password Recovery Page (Opcional)

### 6.1 Wireframe (Step 1: Request)

```
┌────────────────────────────────────┐
│  [Logo]                            │
│                                    │
│  Recuperar senha                   │
│  Digite seu email para receber     │
│  instruções de recuperação         │
│                                    │
│  Email *                           │
│  ┌──────────────────────────────┐ │
│  │  joao@email.com              │ │
│  └──────────────────────────────┘ │
│                                    │
│  [Enviar instruções ────────────]  │
│                                    │
│  ← Voltar para login               │
│                                    │
└────────────────────────────────────┘
```

### 6.2 Wireframe (Step 2: Success Message)

```
┌────────────────────────────────────┐
│  [Logo]                            │
│                                    │
│  ✉️                                │
│                                    │
│  Email enviado!                    │
│                                    │
│  Enviamos instruções para:         │
│  joao@email.com                    │
│                                    │
│  Verifique sua caixa de entrada    │
│  e spam.                           │
│                                    │
│  [Voltar para login]               │
│                                    │
│  Não recebeu? Reenviar             │
│                                    │
└────────────────────────────────────┘
```

### 6.3 Wireframe (Step 3: Reset Password)

```
┌────────────────────────────────────┐
│  [Logo]                            │
│                                    │
│  Redefinir senha                   │
│  Digite sua nova senha             │
│                                    │
│  Nova senha *                      │
│  ┌──────────────────────────────┐ │
│  │  ••••••••••        [👁️]     │ │
│  └──────────────────────────────┘ │
│  Força: ▓▓▓▓▓▓░░ Forte            │
│                                    │
│  Confirmar nova senha *            │
│  ┌──────────────────────────────┐ │
│  │  ••••••••••        [👁️]     │ │
│  └──────────────────────────────┘ │
│                                    │
│  [Redefinir senha ───────────────] │
│                                    │
└────────────────────────────────────┘
```

---

## 7. Session Management Page (Opcional)

### 7.1 Wireframe

```
┌────────────────────────────────────────────────────────────────┐
│  ← Voltar      Sessões ativas                                  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Gerencie suas sessões ativas em diferentes dispositivos       │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │  [💻] Chrome no Windows                             │ │ │
│  │  │  ─────────────────────────────────────────────────  │ │ │
│  │  │  IP: 192.168.1.100                                  │ │ │
│  │  │  Último acesso: há 2 minutos                        │ │ │
│  │  │  Sessão atual                          [Esta sessão]│ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │                                                          │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │  [📱] Safari no iPhone 13                           │ │ │
│  │  │  ─────────────────────────────────────────────────  │ │ │
│  │  │  IP: 192.168.1.105                                  │ │ │
│  │  │  Último acesso: há 3 horas                          │ │ │
│  │  │                                         [🗑️ Revogar]│ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │                                                          │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │  [💻] Firefox no macOS                              │ │ │
│  │  │  ─────────────────────────────────────────────────  │ │ │
│  │  │  IP: 10.0.0.50                                      │ │ │
│  │  │  Último acesso: há 2 dias                           │ │ │
│  │  │                                         [🗑️ Revogar]│ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  [🗑️ Encerrar todas as outras sessões]                        │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 7.2 Componentes

**Session Card**:
- Ícone de dispositivo (💻 Desktop, 📱 Mobile, 🖥️ Tablet)
- Navegador + Sistema Operacional
- IP address
- Timestamp de último acesso
- Badge "Sessão atual" (para sessão ativa)
- Botão "Revogar" (para outras sessões)

**Confirmação de Revogação**:
```
┌────────────────────────────────────┐
│  ⚠️  Revogar sessão?               │
│                                    │
│  Safari no iPhone 13               │
│  IP: 192.168.1.105                 │
│                                    │
│  Esta ação não pode ser desfeita.  │
│                                    │
│  [Cancelar]         [🗑️ Revogar]  │
└────────────────────────────────────┘
```

**Logout All (Exceto Atual)**:
- Botão destrutivo
- Confirmação modal
- Chama `/api/1/auth/logout-all`

---

## 8. Protected Route Component

### 8.1 Comportamento

**User Não Autenticado**:
```typescript
// Fluxo automático
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>

// Se não autenticado:
// 1. Salva rota atual em sessionStorage
// 2. Redireciona para /login
// 3. Após login, redireciona de volta
```

**Loading State**:
```
┌─────────────────────────────────┐
│                                 │
│         [⟳]                     │
│                                 │
│    Verificando autenticação...  │
│                                 │
└─────────────────────────────────┘
```

**User Autenticado**:
```typescript
// Renderiza conteúdo normalmente
<DashboardPage />
```

### 8.2 Implementação

```typescript
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Salva rota original
      sessionStorage.setItem('returnUrl', location.pathname);
      // Redireciona para login
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, location, navigate]);

  if (isLoading) {
    return <LoadingPage message="Verificando autenticação..." />;
  }

  if (!isAuthenticated) {
    return null; // Ou redirect (handled by useEffect)
  }

  return <>{children}</>;
}
```

---

## 9. Permission-Based Components

### 9.1 RequirePermission Component

**Exemplo de Uso**:
```typescript
<RequirePermission permission="read.usuarios">
  <UserManagementPanel />
</RequirePermission>

// Ou com fallback:
<RequirePermission
  permission="admin"
  fallback={<AccessDenied />}
>
  <AdminPanel />
</RequirePermission>
```

**Estados**:

**Loading**:
```
┌─────────────────────────────────┐
│  [Skeleton do conteúdo]         │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓          │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓                 │
└─────────────────────────────────┘
```

**Sem Permissão (Default)**:
```
(Nada é renderizado)
```

**Sem Permissão (Com Fallback)**:
```
┌─────────────────────────────────┐
│         [🔒]                    │
│                                 │
│    Acesso negado                │
│                                 │
│  Você não tem permissão para    │
│  acessar este recurso.          │
│                                 │
│  [← Voltar]                     │
└─────────────────────────────────┘
```

**Com Permissão**:
```
<UserManagementPanel />  ← Renderizado normalmente
```

### 9.2 usePermission Hook

```typescript
function MyComponent() {
  const { hasPermission, isLoading } = usePermission('delete.usuarios');

  if (isLoading) return <Skeleton />;

  return (
    <div>
      <h1>Usuários</h1>
      {hasPermission && (
        <Button variant="destructive" onClick={handleDelete}>
          Deletar
        </Button>
      )}
    </div>
  );
}
```

---

## 10. Auth Context & State

### 10.1 AuthProvider

**Estrutura**:
```typescript
interface AuthContextValue {
  // Estado
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Ações
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;

  // Helpers
  hasPermission: (permission: string) => Promise<boolean>;
}
```

**Uso no App**:
```typescript
function App() {
  return (
    <AuthProvider config={authConfig}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/app/*" element={
            <ProtectedRoute>
              <AppRoutes />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
```

### 10.2 Token Storage

**Preferência (HttpOnly Cookies)**:
```typescript
// Backend define cookies:
Set-Cookie: access_token=...; HttpOnly; Secure; SameSite=Strict
Set-Cookie: refresh_token=...; HttpOnly; Secure; SameSite=Strict
```

**Fallback (Memory + SessionStorage)**:
```typescript
// Para desenvolvimento ou quando cookies não disponíveis
const tokenStorage = {
  accessToken: null, // Memory
  refreshToken: sessionStorage.getItem('refresh_token') // SessionStorage
};
```

**❌ Proibido**:
```typescript
// NUNCA armazenar em localStorage
localStorage.setItem('access_token', token); // ❌ INSEGURO
```

### 10.3 Auto-Refresh

**Trigger**:
```typescript
// Renovar 5 minutos antes de expirar
const REFRESH_BEFORE_EXPIRY = 5 * 60 * 1000; // 5 min

useEffect(() => {
  const token = getAccessToken();
  if (!token) return;

  const expiresAt = parseJWT(token).exp * 1000;
  const now = Date.now();
  const timeUntilRefresh = expiresAt - now - REFRESH_BEFORE_EXPIRY;

  const timer = setTimeout(() => {
    refresh();
  }, timeUntilRefresh);

  return () => clearTimeout(timer);
}, [refresh]);
```

**Fluxo**:
```
1. Access token expira em 30 min
2. Timer agendado para 25 min
3. Ao disparar, chama refresh()
4. POST /api/1/auth/refresh
5. Atualiza tokens em storage
6. Agenda novo timer
```

---

## 11. Logout Components

### 11.1 LogoutButton Component

**Simples**:
```typescript
<Button variant="ghost" onClick={logout}>
  <LogOut className="mr-2 h-4 w-4" />
  Sair
</Button>
```

**Com Confirmação**:
```
┌────────────────────────────────────┐
│  ⚠️  Sair da conta?                │
│                                    │
│  Você será desconectado e          │
│  redirecionado para login.         │
│                                    │
│  [Cancelar]              [Sair]   │
└────────────────────────────────────┘
```

**Com Dropdown (User Menu)**:
```
[👤] João Silva ▾
       ↓
┌────────────────────────────────┐
│  João Silva                    │
│  joao@email.com                │
├────────────────────────────────┤
│  [👤] Perfil                   │
│  [⚙️] Configurações            │
│  [📱] Sessões ativas           │
├────────────────────────────────┤
│  [⬅️] Sair                     │
└────────────────────────────────┘
```

### 11.2 Session Expired Notification

**Toast (Auto-dismiss)**:
```
┌───────────────────────────────────┐
│  ⚠️  Sessão expirada              │
│  Faça login novamente             │
└───────────────────────────────────┘
```

**Modal (Bloqueante)**:
```
┌────────────────────────────────────┐
│  ⚠️  Sessão expirada               │
│                                    │
│  Sua sessão expirou por            │
│  inatividade.                      │
│                                    │
│  Faça login novamente para         │
│  continuar.                        │
│                                    │
│  [Fazer login]                     │
└────────────────────────────────────┘
```

---

## 12. Responsividade

### 12.1 Login Page

**Desktop (> 1024px)**:
- Card centralizado: 400-450px largura
- Ou split screen (50/50)

**Tablet (768px - 1024px)**:
- Card centralizado: 90% largura (max 500px)

**Mobile (< 768px)**:
- Full width com padding
- Formulário ocupa toda altura disponível
- Social buttons stacked verticalmente

### 12.2 Signup Page

**Mobile Adaptations**:
- Campos full width
- Botões full width
- Password strength indicator compacto
- Terms checkbox com texto menor

### 12.3 Session Management

**Mobile**:
- Cards de sessão stacked verticalmente
- Detalhes de IP/device podem ser colapsáveis
- Botão "Revogar" fica visível sempre

---

## 13. Acessibilidade (WCAG 2.1 AA)

### 13.1 Keyboard Navigation

**Tab Order**:
1. Email/Username field
2. Password field
3. Remember me checkbox (se presente)
4. Submit button
5. Forgot password link
6. Signup link

**Atalhos**:
- `Enter`: Submit form
- `Tab`: Próximo campo
- `Shift + Tab`: Campo anterior
- `Escape`: Fechar modals

### 13.2 Screen Readers

**Labels**:
```html
<label htmlFor="email">Email / Usuário *</label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-invalid={hasError}
  aria-describedby={hasError ? "email-error" : undefined}
/>
{hasError && (
  <span id="email-error" role="alert">
    Email inválido
  </span>
)}
```

**Show/Hide Password**:
```html
<button
  type="button"
  aria-label="Mostrar senha"
  onClick={togglePasswordVisibility}
>
  <Eye aria-hidden="true" />
</button>
```

**Loading States**:
```html
<button disabled aria-busy="true">
  <Loader2 className="animate-spin" aria-hidden="true" />
  Entrando...
</button>
```

### 13.3 Error Announcements

```html
<div role="alert" aria-live="assertive">
  Credenciais inválidas. Verifique seu email e senha.
</div>
```

---

## 14. Segurança

### 14.1 Best Practices

**❌ Proibido**:
- Armazenar senhas em qualquer lugar
- Armazenar tokens em localStorage
- Expor tokens em console.log
- Enviar tokens em query params
- Exibir senhas em plain text (sem toggle)

**✅ Obrigatório**:
- HttpOnly cookies para refresh tokens
- HTTPS para todas as comunicações
- Validação client-side + server-side
- Rate limiting (client e server)
- CSRF protection
- Timeout de inatividade

### 14.2 Rate Limiting (Client-side)

```typescript
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 min

function useLoginAttempts() {
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  const isLocked = lockedUntil && Date.now() < lockedUntil;

  const recordAttempt = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      setLockedUntil(Date.now() + LOCKOUT_TIME);
    }
  };

  const resetAttempts = () => {
    setAttempts(0);
    setLockedUntil(null);
  };

  return { attempts, isLocked, recordAttempt, resetAttempts };
}
```

**UI quando bloqueado**:
```
┌────────────────────────────────────┐
│  ⚠️  Conta temporariamente bloqueada│
│                                    │
│  Muitas tentativas de login.       │
│  Tente novamente em 14:32          │
│                                    │
│  [OK]                              │
└────────────────────────────────────┘
```

---

## 15. Configuração de Instância

### 15.1 Schema Completo

```typescript
interface AuthInstanceConfig {
  // Rotas
  loginRoute: string;              // Rota da página de login
  logoutRedirect?: string;         // Rota após logout (default: loginRoute)
  signupRoute?: string;            // Rota de signup (se habilitado)
  recoveryRoute?: string;          // Rota de recuperação (se habilitado)

  // Realm/Schema
  realm?: string;                  // Realm padrão
  schema?: string;                 // Schema padrão
  allowRealmSelection?: boolean;   // Permitir escolher realm
  allowSchemaSelection?: boolean;  // Permitir escolher schema
  realms?: string[];               // Lista de realms disponíveis
  schemas?: string[];              // Lista de schemas disponíveis

  // Features
  enableSignup?: boolean;          // Habilitar registro (default: false)
  enablePasswordRecovery?: boolean;// Habilitar recuperação (default: false)
  enableRememberMe?: boolean;      // Habilitar "lembrar-me" (default: true)
  enableSocialLogin?: boolean;     // Habilitar OAuth (default: false)
  socialProviders?: string[];      // ['google', 'microsoft', 'github']

  // Sessão
  sessionTimeout?: number;         // Timeout de inatividade (ms)
  autoRefresh?: boolean;           // Auto-refresh tokens (default: true)

  // UI
  layout?: 'centered' | 'split' | 'minimal' | 'card';
  logo?: string;                   // URL da logo
  backgroundImage?: string;        // Background image (split/card layouts)
  brandColor?: string;             // Cor principal

  // Textos customizáveis
  texts?: {
    loginTitle?: string;           // Default: "Bem-vindo de volta"
    loginSubtitle?: string;        // Default: "Entre com suas credenciais"
    signupTitle?: string;
    recoveryTitle?: string;
  };
}
```

### 15.2 Exemplo: Login Básico

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

### 15.3 Exemplo: Login Completo (Com Signup)

```json
{
  "instanceId": "auth-portal-app",
  "moduleId": "auth",
  "portalId": "app",
  "config": {
    "loginRoute": "/app/login",
    "signupRoute": "/app/signup",
    "recoveryRoute": "/app/forgot-password",
    "logoutRedirect": "/app/login",
    "realm": "clientes",
    "schema": "app",
    "enableSignup": true,
    "enablePasswordRecovery": true,
    "enableRememberMe": true,
    "enableSocialLogin": true,
    "socialProviders": ["google", "microsoft"],
    "sessionTimeout": 1800000,
    "layout": "card",
    "logo": "/assets/logo.svg",
    "brandColor": "#3B82F6",
    "texts": {
      "loginTitle": "Acesse sua conta",
      "loginSubtitle": "Continue de onde parou",
      "signupTitle": "Crie sua conta grátis"
    }
  }
}
```

### 15.4 Exemplo: Login Multi-Realm

```json
{
  "instanceId": "login-admin",
  "moduleId": "auth",
  "portalId": "admin",
  "config": {
    "loginRoute": "/admin/login",
    "allowRealmSelection": true,
    "allowSchemaSelection": true,
    "realms": ["default", "admin", "staff"],
    "schemas": ["platform", "system"],
    "sessionTimeout": 900000,
    "layout": "minimal"
  }
}
```

---

## 16. Padrões de Código

### 16.1 LoginForm Component

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(1, "Campo obrigatório"),
  password: z.string().min(1, "Campo obrigatório"),
  rememberMe: z.boolean().optional()
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setError(null);
      await login({
        username: data.username,
        password: data.password,
        rememberMe: data.rememberMe
      });
      // Redirecionamento handled by AuthContext
    } catch (err) {
      setError(err.message || "Erro ao fazer login");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          {error}
        </Alert>
      )}

      <div>
        <Label htmlFor="username">Email / Usuário *</Label>
        <Input
          id="username"
          type="text"
          autoComplete="username"
          {...form.register('username')}
          aria-invalid={!!form.formState.errors.username}
        />
        {form.formState.errors.username && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.username.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="password">Senha *</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            {...form.register('password')}
            aria-invalid={!!form.formState.errors.password}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {form.formState.errors.password && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      <div className="flex items-center">
        <input
          id="rememberMe"
          type="checkbox"
          {...form.register('rememberMe')}
          className="mr-2"
        />
        <Label htmlFor="rememberMe" className="font-normal">
          Lembrar de mim
        </Label>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Entrando...
          </>
        ) : (
          'Entrar'
        )}
      </Button>
    </form>
  );
}
```

---

## 17. Testes de UI/UX

### 17.1 Checklist de Validação

**Login**:
- [ ] Formulário valida campos obrigatórios
- [ ] Validação inline funciona (onBlur)
- [ ] Botão disabled durante submissão
- [ ] Mensagens de erro são claras
- [ ] Show/hide password funciona
- [ ] Remember me persiste preferência
- [ ] Redirect após login funciona
- [ ] Redirect preserva rota original

**Signup** (se habilitado):
- [ ] Password strength indicator funciona
- [ ] Confirmação de senha valida igualdade
- [ ] Terms checkbox é obrigatório
- [ ] Validação de email funciona

**Password Recovery** (se habilitado):
- [ ] Email enviado com sucesso
- [ ] Token válido permite reset
- [ ] Nova senha valida requisitos
- [ ] Redirect após reset funciona

**Session Management** (se habilitado):
- [ ] Lista de sessões carrega corretamente
- [ ] Sessão atual é identificada
- [ ] Revogação individual funciona
- [ ] Logout all funciona

**Protected Routes**:
- [ ] Redirect para login se não autenticado
- [ ] Loading state é exibido
- [ ] Return URL funciona após login

**Permissions**:
- [ ] RequirePermission oculta conteúdo sem permissão
- [ ] usePermission retorna resultado correto
- [ ] Loading state durante verificação

**Auto-Refresh**:
- [ ] Token é renovado antes de expirar
- [ ] Logout automático se refresh falha
- [ ] Notificação de sessão expirada

**Responsividade**:
- [ ] Mobile: formulário full width
- [ ] Tablet: card centralizado
- [ ] Desktop: layout adequado

**Acessibilidade**:
- [ ] Navegação por teclado funciona
- [ ] Labels corretos para screen readers
- [ ] Errors são anunciados
- [ ] Focus visible é claro

**Segurança**:
- [ ] Tokens não expostos em console
- [ ] HTTPS obrigatório
- [ ] Rate limiting funciona
- [ ] HttpOnly cookies (se disponível)

---

## 18. Roadmap de Implementação

### 18.1 Fase 1: Login Básico (2-3 dias)
1. LoginForm component (email/password)
2. AuthProvider (context + state)
3. Token storage (memory + sessionStorage fallback)
4. Login API integration (/api/1/auth/login)
5. Redirect após login
6. Validação com React Hook Form + Zod

### 18.2 Fase 2: Protected Routes (1 dia)
1. ProtectedRoute component
2. Loading state
3. Redirect para login
4. Return URL preservation
5. Integration com AuthContext

### 18.3 Fase 3: Logout (1 dia)
1. Logout API integration (/api/1/auth/logout)
2. LogoutButton component
3. Clear tokens
4. Redirect para login
5. Confirmação opcional

### 18.4 Fase 4: Auto-Refresh (1-2 dias)
1. Token expiry detection
2. Refresh API integration (/api/1/auth/refresh)
3. Auto-refresh timer
4. Logout on refresh failure
5. Session expired notification

### 18.5 Fase 5: Features Opcionais (2-3 dias)
1. Signup page (se habilitado)
2. Password recovery flow (se habilitado)
3. Remember me functionality
4. Realm/Schema selection (se habilitado)

### 18.6 Fase 6: Session Management (1-2 dias)
1. Session list page
2. Revoke individual session
3. Logout all devices
4. Device/browser detection

### 18.7 Fase 7: Permissions (1 dia)
1. RequirePermission component
2. usePermission hook
3. Authorize API integration
4. Loading states

### 18.8 Fase 8: Polish & Security (1-2 dias)
1. Rate limiting client-side
2. Security audit
3. Accessibility improvements
4. Animações e transições
5. Error handling refinement

---

## Conclusão

Este documento define a arquitetura completa de UI/UX para o módulo Auth, seguindo:

- **SPEC-module-auth.md**: Todas as funcionalidades especificadas
- **SPEC-authentication.md**: Canal de autenticação e contratos
- **SPEC-concepts.md**: Conceitos de Portal e Módulo
- **SPEC-architecture.md**: Stack tecnológico

**Padrões Adotados**:
- Login/Signup com validação inline (React Hook Form + Zod)
- Token management seguro (HttpOnly cookies preferencial)
- Auto-refresh automático de tokens
- Protected routes com redirect inteligente
- Permission-based rendering
- Session management completo
- Layouts responsivos (mobile-first)
- Acessibilidade WCAG 2.1 AA

**Tecnologias**:
- React 19 + TypeScript
- shadcn/ui (única biblioteca de UI)
- Tailwind CSS (zero CSS customizado)
- React Hook Form + Zod
- Lucide React (ícones)
- React Router (navegação protegida)

**Layouts Suportados**:
1. Centered (card centralizado)
2. Split Screen (marketing + form)
3. Minimal (admin panels)
4. Card (floating card com background)

**Security First**:
- Tokens nunca em localStorage
- HttpOnly cookies
- HTTPS obrigatório
- Rate limiting
- Session timeout
- CSRF protection

Esta especificação serve como guia completo para implementação do módulo Auth, garantindo segurança, usabilidade e aderência aos requisitos da plataforma.
