# SPEC-module-auth.md

## Especificação: Módulo de Autenticação

### Escopo
Este documento especifica o módulo Auth, responsável pela experiência de usuário (UI/UX) do sistema de autenticação da plataforma.

---

## 1. Definição

### Propósito
O módulo Auth fornece interfaces visuais para login, logout, registro e gerenciamento de sessão, utilizando o Canal de Autenticação da plataforma.

### Natureza
- **Tipo**: Módulo de Funcionalidade
- **Dependências**: Nenhuma
- **Opcional**: Sim (plataforma pode funcionar sem autenticação)

---

## 2. Responsabilidades

### SPEC-AUTH-R-001
O módulo Auth DEVE fornecer componentes de interface para autenticação

### SPEC-AUTH-R-002
O módulo Auth NÃO DEVE implementar lógica de autenticação (responsabilidade do Canal de Autenticação)

### SPEC-AUTH-R-003
O módulo Auth DEVE ser um wrapper sobre o Canal de Autenticação (`/api/1/auth/*`)

### SPEC-AUTH-R-004
O módulo Auth PODE criar múltiplas instâncias com diferentes experiências de usuário

---

## 3. Funcionalidades Obrigatórias

### Login

**SPEC-AUTH-F-001:** Toda instância DEVE fornecer interface de login

**SPEC-AUTH-F-002:** Interface de login DEVE aceitar:
- `realm` (opcional, string)
- `schema` (opcional, string)
- `username` (obrigatório, string)
- `password` (obrigatório, string)

**SPEC-AUTH-F-003:** Interface de login DEVE chamar `/api/1/auth/login` via POST

**SPEC-AUTH-F-004:** Ao receber tokens (access_token, refresh_token), o módulo DEVE armazená-los

**SPEC-AUTH-F-005:** Armazenamento de tokens DEVE ser em memória ou cookie seguro (HttpOnly)

**SPEC-AUTH-F-006:** Módulo NÃO DEVE armazenar tokens em localStorage

### Logout

**SPEC-AUTH-F-007:** Toda instância DEVE fornecer funcionalidade de logout

**SPEC-AUTH-F-008:** Logout DEVE chamar `/api/1/auth/logout` com refresh_token

**SPEC-AUTH-F-009:** Após logout, módulo DEVE remover tokens armazenados

**SPEC-AUTH-F-010:** Logout PODE redirecionar para rota configurada na instância

### Refresh Automático

**SPEC-AUTH-F-011:** Módulo DEVE implementar renovação automática de tokens

**SPEC-AUTH-F-012:** Renovação DEVE ocorrer antes do access_token expirar

**SPEC-AUTH-F-013:** Renovação DEVE chamar `/api/1/auth/refresh` com refresh_token

**SPEC-AUTH-F-014:** Se renovação falhar, módulo DEVE fazer logout automático

### Proteção de Rotas

**SPEC-AUTH-F-015:** Módulo DEVE fornecer mecanismo para proteger rotas

**SPEC-AUTH-F-016:** Rotas protegidas DEVEM redirecionar para login se usuário não autenticado

**SPEC-AUTH-F-017:** Após login bem-sucedido, módulo DEVE redirecionar para rota original solicitada

---

## 4. Funcionalidades Opcionais

### Registro (Sign Up)

**SPEC-AUTH-O-001:** Instância PODE fornecer interface de registro

**SPEC-AUTH-O-002:** Registro DEVE ser implementado via JQEL (não há rota dedicada no Canal de Autenticação)

### Recuperação de Senha

**SPEC-AUTH-O-003:** Instância PODE fornecer fluxo de recuperação de senha

**SPEC-AUTH-O-004:** Recuperação DEVE ser implementada via workflows n8n + Canal de Eventos

### Logout de Todas as Sessões

**SPEC-AUTH-O-005:** Instância PODE fornecer opção "Logout de todos os dispositivos"

**SPEC-AUTH-O-006:** Esta funcionalidade DEVE chamar `/api/1/auth/logout-all`

### Seleção de Realm/Schema

**SPEC-AUTH-O-007:** Instância PODE permitir usuário selecionar realm ou schema

**SPEC-AUTH-O-008:** Se não fornecido, instância DEVE usar valores padrão configurados

---

## 5. Configuração de Instância

### Parâmetros Obrigatórios

**SPEC-AUTH-C-001:** Toda instância DEVE ter rota de login configurada

**SPEC-AUTH-C-002:** Rota de login DEVE ser única no portal

### Parâmetros Opcionais

**SPEC-AUTH-C-003:** Instância PODE configurar:
```typescript
{
  loginRoute: string;              // Rota da página de login
  logoutRedirect: string;          // Para onde redirecionar após logout
  realm?: string;                  // Realm padrão
  schema?: string;                 // Schema padrão
  allowRealmSelection: boolean;    // Permitir escolher realm
  allowSchemaSelection: boolean;   // Permitir escolher schema
  enableSignup: boolean;           // Habilitar registro
  enablePasswordRecovery: boolean; // Habilitar recuperação de senha
  sessionTimeout: number;          // Tempo de inatividade para logout (ms)
}
```

---

## 6. Estado e Contexto

### Context Provider

**SPEC-AUTH-S-001:** Módulo DEVE fornecer React Context para estado de autenticação

**SPEC-AUTH-S-002:** Context DEVE expor:
```typescript
{
  user: User | null;           // Usuário autenticado
  isAuthenticated: boolean;    // Se está autenticado
  isLoading: boolean;          // Se está carregando
  login: (credentials) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}
```

**SPEC-AUTH-S-003:** Context DEVE estar disponível para todos os componentes do portal

### Persistência

**SPEC-AUTH-S-004:** Estado de autenticação DEVE sobreviver refresh da página

**SPEC-AUTH-S-005:** Ao carregar página, módulo DEVE verificar se há tokens válidos

**SPEC-AUTH-S-006:** Se tokens existem mas estão expirados, módulo DEVE tentar refresh

---

## 7. Componentes Exportados

### Obrigatórios

**SPEC-AUTH-E-001:** Módulo DEVE exportar:
- `<LoginForm />` - Formulário de login
- `<ProtectedRoute />` - Wrapper para rotas protegidas
- `<AuthProvider />` - Context provider
- `useAuth()` - Hook para acessar contexto

### Opcionais

**SPEC-AUTH-E-002:** Módulo PODE exportar:
- `<SignupForm />` - Formulário de registro
- `<PasswordRecoveryForm />` - Recuperação de senha
- `<LogoutButton />` - Botão de logout
- `<UserAvatar />` - Avatar do usuário logado
- `<RequirePermission />` - Wrapper para permissões específicas

---

## 8. Integração com Canal de Autenticação

### Fluxo de Login

**SPEC-AUTH-I-001:** Login DEVE seguir este fluxo:
```
1. Usuário preenche formulário
2. Módulo valida campos (client-side)
3. POST /api/1/auth/login com { realm?, schema?, username, password }
4. Backend/Backbone valida credenciais
5. Retorna { access_token, refresh_token, payload }
6. Módulo armazena tokens
7. Atualiza contexto com usuário autenticado
8. Redireciona para rota protegida ou dashboard
```

### Fluxo de Refresh

**SPEC-AUTH-I-002:** Refresh DEVE seguir este fluxo:
```
1. Access token próximo de expirar (ou já expirado)
2. POST /api/1/auth/refresh com refresh_token
3. Backend valida refresh_token
4. Retorna novos access_token e refresh_token
5. Módulo atualiza tokens armazenados
6. Continua operação normalmente
```

### Fluxo de Logout

**SPEC-AUTH-I-003:** Logout DEVE seguir este fluxo:
```
1. Usuário clica em logout
2. POST /api/1/auth/logout com refresh_token
3. Backend revoga refresh_token
4. Módulo remove tokens armazenados
5. Atualiza contexto (user = null)
6. Redireciona para página de login
```

---

## 9. Validação de Permissões

### Hook usePermission

**SPEC-AUTH-P-001:** Módulo PODE fornecer hook `usePermission(permission: string)`

**SPEC-AUTH-P-002:** Hook DEVE chamar `/api/1/auth/authorize` com access_token e permission

**SPEC-AUTH-P-003:** Hook DEVE retornar:
```typescript
{
  hasPermission: boolean;
  isLoading: boolean;
  error: Error | null;
}
```

### Componente RequirePermission

**SPEC-AUTH-P-004:** Módulo PODE fornecer componente:
```typescript
<RequirePermission permission="read.usuarios">
  <ConteudoProtegido />
</RequirePermission>
```

**SPEC-AUTH-P-005:** Se usuário não tem permissão, componente DEVE renderizar fallback ou nada

---

## 10. Tratamento de Erros

### Erros de Login

**SPEC-AUTH-E-001:** Módulo DEVE exibir mensagens claras para:
- Credenciais inválidas
- Usuário bloqueado
- Erro de rede
- Erro do servidor

**SPEC-AUTH-E-002:** Mensagens NÃO DEVEM expor detalhes de segurança

### Sessão Expirada

**SPEC-AUTH-E-003:** Se refresh falhar, módulo DEVE:
1. Fazer logout automático
2. Exibir notificação "Sessão expirada"
3. Redirecionar para login

### Múltiplas Tentativas

**SPEC-AUTH-E-004:** Módulo PODE implementar rate limiting client-side

**SPEC-AUTH-E-005:** Após N tentativas falhas, módulo PODE bloquear temporariamente

---

## 11. Múltiplas Instâncias

### Isolamento

**SPEC-AUTH-M-001:** Múltiplas instâncias em portais diferentes DEVEM ser independentes

**SPEC-AUTH-M-002:** Login em uma instância NÃO DEVE autenticar em outra automaticamente

### Compartilhamento (Opcional)

**SPEC-AUTH-M-003:** Instâncias PODEM compartilhar sessão via mesmo realm/schema

**SPEC-AUTH-M-004:** Compartilhamento DEVE usar storage do browser (cookies ou sessionStorage)

**SPEC-AUTH-M-005:** Configuração de compartilhamento DEVE ser explícita na instância

---

## 12. Acessibilidade

**SPEC-AUTH-A-001:** Formulários DEVEM ser acessíveis via teclado

**SPEC-AUTH-A-002:** Campos DEVEM ter labels apropriados

**SPEC-AUTH-A-003:** Erros DEVEM ser anunciados para screen readers

**SPEC-AUTH-A-004:** Campos de senha DEVEM ter opção "mostrar/ocultar"

---

## 13. Segurança

**SPEC-AUTH-SEC-001:** Módulo NÃO DEVE armazenar senhas em nenhum momento

**SPEC-AUTH-SEC-002:** Tokens DEVEM ser transmitidos apenas via HTTPS

**SPEC-AUTH-SEC-003:** Refresh tokens DEVEM ser HttpOnly cookies quando possível

**SPEC-AUTH-SEC-004:** Access tokens PODEM ser armazenados em memória (React state)

**SPEC-AUTH-SEC-005:** Módulo NÃO DEVE expor tokens em console.log ou URLs

---

## 14. Exemplos de Uso

### Instância Básica (Login Simples)
```json
{
  "instanceId": "login-main",
  "moduleId": "auth",
  "config": {
    "loginRoute": "/login",
    "logoutRedirect": "/",
    "realm": "default",
    "schema": "app"
  }
}
```

### Instância Completa (Com Registro e Recuperação)
```json
{
  "instanceId": "auth-portal-sac",
  "moduleId": "auth",
  "config": {
    "loginRoute": "/sac/login",
    "logoutRedirect": "/sac",
    "realm": "clientes",
    "schema": "sac",
    "allowRealmSelection": false,
    "enableSignup": true,
    "enablePasswordRecovery": true,
    "sessionTimeout": 1800000
  }
}
```

### Instância Multi-Realm
```json
{
  "instanceId": "login-admin",
  "moduleId": "auth",
  "config": {
    "loginRoute": "/admin/login",
    "allowRealmSelection": true,
    "allowSchemaSelection": true,
    "sessionTimeout": 900000
  }
}
```

---

*Esta especificação define os requisitos do módulo Auth. Implementação técnica em documentação separada.*