# PLAN_AUTH.md - Implementação de Autenticação com Cookies httpOnly

**Objetivo**: Migrar autenticação de localStorage para cookies httpOnly, eliminando vulnerabilidade XSS e simplificando injeção de tokens

---

## 📋 RESUMO EXECUTIVO

### Problemas Identificados
1. ❌ Tokens JWT armazenados em localStorage (vulnerável a XSS - qualquer script pode acessar)
2. ❌ Injeção manual de JWT em todas as requisições HTTP (código repetitivo e propenso a erros)
3. ❌ Backend não emite cookies httpOnly (workflows n8n JÁ aceitam cookies, mas Express não configura Set-Cookie)

### Solução (Baseada em Padrões)
- ✅ Migrar `refresh_token` para cookie httpOnly com flags de segurança (conforme SPEC-AU-ST-005)
- ✅ Manter `access_token` em memória + Header Authorization (conforme SPEC-AU-ST-001)
- ✅ Backend Express adiciona Set-Cookie nas respostas de autenticação
- ✅ Frontend remove injeção manual (cookies enviados automaticamente)

---

## 🎯 FASE 1: CONFIGURAR BACKEND (EXPRESS)

### 1.1. Instalar Dependências

- [ ] Instalar `cookie-parser` no backend
- [ ] Adicionar `@types/cookie-parser` (TypeScript)
- [ ] ✅ **Checkpoint**: Dependências instaladas e package.json atualizado

**Código de Referência**:
```bash
cd src/backend
npm install cookie-parser
npm install --save-dev @types/cookie-parser
```

---

### 1.2. Configurar Middleware cookie-parser

- [ ] Importar `cookie-parser` em `src/backend/src/app.ts`
- [ ] Adicionar middleware `app.use(cookieParser())` antes das rotas
- [ ] ✅ **Checkpoint**: Backend consegue ler cookies das requisições

**Código de Referência**:
```typescript
import cookieParser from 'cookie-parser';

// Após app.use(express.json())
app.use(cookieParser());
```

---

### 1.3. Configurar CORS para Cookies

- [ ] Atualizar middleware CORS em `src/backend/src/middleware/cors.middleware.ts`
- [ ] Configurar `credentials: true` para permitir cookies
- [ ] Configurar `origin` para domínio específico (não usar wildcard `*`)
- [ ] ✅ **Checkpoint**: CORS aceita cookies cross-origin

**Código de Referência**:
```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true // CRÍTICO: permite cookies
}));
```

---

### 1.4. Modificar Rota POST /api/1/auth/login

- [ ] Abrir/criar `src/backend/src/routes/auth.routes.ts`
- [ ] Após sucesso do n8n, adicionar `res.cookie('refresh_token', ...)`
- [ ] Configurar flags: `httpOnly: true`, `secure: true` (produção), `sameSite: 'strict'`
- [ ] Configurar `maxAge: 7 * 24 * 60 * 60 * 1000` (7 dias)
- [ ] Configurar `path: '/api/1/auth'` (restringir escopo)
- [ ] Retornar apenas `access_token` no body JSON (não retornar refresh_token)
- [ ] ✅ **Checkpoint**: Login emite cookie httpOnly

**Leitura de Referência**
- `spec/SPEC-authentication.md` (SPEC-AU-ST-005 a SPEC-AU-ST-008)
- `workflows/auth/auth-login.json` (estrutura de resposta do n8n)

**Código de Referência**:
```typescript
router.post('/login', async (req, res) => {
  try {
    // Chamar workflow n8n
    const result = await n8nClient.post('/webhook/auth-login', req.body);

    if (result.code === 200) {
      // Configurar cookie httpOnly para refresh_token
      res.cookie('refresh_token', result.data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
        path: '/api/1/auth'
      });

      // Retornar apenas access_token no body
      res.json({
        code: 200,
        data: {
          access_token: result.data.access_token,
          token_type: 'Bearer',
          expires_in: result.data.expires_in,
          payload: result.data.payload
        }
      });
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});
```

---

### 1.5. Modificar Rota POST /api/1/auth/refresh

- [ ] Abrir `src/backend/src/routes/auth.routes.ts`
- [ ] Extrair `refresh_token` do cookie (n8n fará isso automaticamente via header Cookie)
- [ ] Repassar header `Cookie` para o n8n
- [ ] Após sucesso, renovar cookie com novo `refresh_token`
- [ ] Retornar apenas `access_token` no body JSON
- [ ] ✅ **Checkpoint**: Refresh renova cookie automaticamente

**Leitura de Referência**
- `workflows/auth/auth-refresh.json` (linha 23: função `getRefreshTokenFromCookie`)

**Código de Referência**:
```typescript
router.post('/refresh', async (req, res) => {
  try {
    // n8n extrai refresh_token do header Cookie automaticamente
    const result = await n8nClient.post('/webhook/auth-refresh', {}, {
      headers: {
        Cookie: req.headers.cookie // Repassar cookie
      }
    });

    if (result.code === 200) {
      // Renovar cookie com novo refresh_token
      res.cookie('refresh_token', result.data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/api/1/auth'
      });

      res.json({
        code: 200,
        data: {
          access_token: result.data.access_token,
          token_type: 'Bearer',
          expires_in: result.data.expires_in
        }
      });
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});
```

---

### 1.6. Modificar Rota POST /api/1/auth/logout

- [ ] Abrir `src/backend/src/routes/auth.routes.ts`
- [ ] Limpar cookie com `res.clearCookie('refresh_token', { path: '/api/1/auth' })`
- [ ] Repassar header `Cookie` para o n8n (para revogar token no banco)
- [ ] ✅ **Checkpoint**: Logout remove cookie do navegador

**Leitura de Referência**
- `workflows/auth/auth-logout.json` (linha 24: função `getRefreshTokenFromCookie`)

**Código de Referência**:
```typescript
router.post('/logout', async (req, res) => {
  try {
    // Limpar cookie imediatamente
    res.clearCookie('refresh_token', { path: '/api/1/auth' });

    // n8n revoga refresh_token no banco
    const result = await n8nClient.post('/webhook/auth-logout', {}, {
      headers: {
        Cookie: req.headers.cookie
      }
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});
```

---

### 1.7. Modificar Rota POST /api/1/auth/logout-all

- [ ] Abrir `src/backend/src/routes/auth.routes.ts`
- [ ] Limpar cookie local com `res.clearCookie('refresh_token', { path: '/api/1/auth' })`
- [ ] Repassar header `Authorization` para o n8n (access_token para identificar usuário)
- [ ] ✅ **Checkpoint**: Logout-all revoga todas as sessões

**Leitura de Referência**
- `workflows/auth/auth-logout-all.json` (linha 24: função `getAccessTokenFromCookie`)

**Código de Referência**:
```typescript
router.post('/logout-all', async (req, res) => {
  try {
    // Limpar cookie local
    res.clearCookie('refresh_token', { path: '/api/1/auth' });

    // n8n revoga TODOS os refresh_tokens do usuário
    const result = await n8nClient.post('/webhook/auth-logout-all', {}, {
      headers: {
        Authorization: req.headers.authorization,
        Cookie: req.headers.cookie
      }
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});
```

---

### 1.8. Testar Fase 1 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Login emite cookie**
  - [ ] POST /api/1/auth/login com credenciais válidas
  - [ ] ✅ **Verificar**: Response tem `Set-Cookie: refresh_token=...; HttpOnly; Secure; SameSite=Strict`
  - [ ] ✅ **Verificar**: Body JSON contém apenas `access_token` (não contém `refresh_token`)

- [ ] **Teste 2: Refresh usa cookie automaticamente**
  - [ ] POST /api/1/auth/refresh (sem body, cookie enviado automaticamente)
  - [ ] ✅ **Verificar**: Response renova cookie `Set-Cookie: refresh_token=...`
  - [ ] ✅ **Verificar**: Body JSON contém novo `access_token`

- [ ] **Teste 3: Logout limpa cookie**
  - [ ] POST /api/1/auth/logout
  - [ ] ✅ **Verificar**: Response tem `Set-Cookie: refresh_token=; Expires=Thu, 01 Jan 1970`
  - [ ] ✅ **Verificar**: Cookie `refresh_token` removido do navegador

- [ ] **Teste 4: CORS permite cookies**
  - [ ] Requisição cross-origin com `credentials: 'include'`
  - [ ] ✅ **Verificar**: Response tem header `Access-Control-Allow-Credentials: true`

**✅ CHECKPOINT FASE 1**: Backend emite e gerencia cookies httpOnly corretamente

---

## 🎯 FASE 2: ATUALIZAR FRONTEND (REACT)

### 2.1. Criar Service de Autenticação

- [ ] Criar `src/frontend/src/services/auth.service.ts`
- [ ] Implementar armazenamento de `access_token` em memória (variável privada)
- [ ] Implementar métodos: `login()`, `refresh()`, `logout()`, `getAccessToken()`
- [ ] Configurar `credentials: 'include'` em todas as requisições
- [ ] ✅ **Checkpoint**: Service gerencia access_token em memória

**Leitura de Referência**
- `spec/SPEC-authentication.md` (SPEC-AU-ST-001 a SPEC-AU-ST-004)

**Código de Referência**:
```typescript
// src/frontend/src/services/auth.service.ts

// Armazenar access_token em memória (mais seguro que localStorage)
let accessToken: string | null = null;

export const authService = {
  async login(username: string, password: string) {
    const response = await fetch('/api/1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // CRÍTICO: envia/recebe cookies
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();

    if (result.code === 200) {
      accessToken = result.data.access_token;
      // refresh_token está no cookie httpOnly (não acessível aqui)
      return result.data.payload;
    }

    throw new Error(result.message || 'Login failed');
  },

  async refresh() {
    const response = await fetch('/api/1/auth/refresh', {
      method: 'POST',
      credentials: 'include' // Envia cookie refresh_token automaticamente
    });

    const result = await response.json();

    if (result.code === 200) {
      accessToken = result.data.access_token;
      return true;
    }

    return false;
  },

  async logout() {
    const response = await fetch('/api/1/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });

    accessToken = null;
    return response.json();
  },

  getAccessToken(): string | null {
    return accessToken;
  },

  setAccessToken(token: string | null) {
    accessToken = token;
  }
};
```

---

### 2.2. Configurar Axios Interceptor

- [ ] Abrir/criar `src/frontend/src/utils/axios.ts`
- [ ] Configurar `axios.defaults.withCredentials = true` (global)
- [ ] Criar interceptor de requisição para adicionar header `Authorization: Bearer <token>`
- [ ] Criar interceptor de resposta para renovar token em erro 401
- [ ] ✅ **Checkpoint**: Axios envia cookies e headers automaticamente

**Código de Referência**:
```typescript
// src/frontend/src/utils/axios.ts
import axios from 'axios';
import { authService } from '../services/auth.service';

// Configuração global: enviar cookies em todas as requisições
axios.defaults.withCredentials = true;

// Interceptor de requisição: adicionar Authorization header
axios.interceptors.request.use(
  config => {
    const token = authService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Interceptor de resposta: renovar token em 401
axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Se 401 e ainda não tentou renovar
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshed = await authService.refresh();

      if (refreshed) {
        // Reenviar requisição original com novo token
        const token = authService.getAccessToken();
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axios(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export default axios;
```

---

### 2.3. Atualizar AuthContext

- [ ] Abrir `src/frontend/src/contexts/AuthContext.tsx`
- [ ] Remover `localStorage.setItem('refresh_token', ...)` (não é mais necessário)
- [ ] Usar `authService.login()` ao invés de fetch direto
- [ ] Remover acesso a `refresh_token` (gerenciado por cookie)
- [ ] ✅ **Checkpoint**: AuthContext usa authService

**Código de Referência**:
```typescript
// src/frontend/src/contexts/AuthContext.tsx
import { authService } from '../services/auth.service';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (username: string, password: string) => {
    try {
      const payload = await authService.login(username, password);
      setUser(payload.user);
      // refresh_token gerenciado automaticamente por cookie httpOnly
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  // ... resto do contexto
};
```

---

### 2.4. Remover Injeção Manual de JWT

- [ ] Buscar todas as ocorrências de `Authorization: \`Bearer ${token}\`` no frontend
- [ ] Remover injeção manual (axios interceptor fará isso)
- [ ] Buscar todas as ocorrências de `tokenStorage.getAccessToken()`
- [ ] Substituir por uso do axios configurado
- [ ] ✅ **Checkpoint**: Nenhuma injeção manual de JWT no código

**Código de Referência**:
```typescript
// ANTES (injeção manual)
const token = tokenStorage.getAccessToken();
const response = await fetch('/api/1/assets/icons', {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  }
});

// DEPOIS (automático via interceptor)
import axios from '../utils/axios';

const response = await axios.delete('/api/1/assets/icons', {
  data: { scope, filename }
});
```

---

### 2.5. Atualizar Componentes de UI

- [ ] Buscar componentes que usam `localStorage.getItem('token')`
- [ ] Substituir por `authService.getAccessToken()` (se realmente necessário)
- [ ] Preferencialmente, usar `useAuth()` context ao invés de acessar token diretamente
- [ ] ✅ **Checkpoint**: Componentes usam abstrações corretas

---

### 2.6. Testar Fase 2 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Login armazena token em memória**
  - [ ] Fazer login via UI
  - [ ] ✅ **Verificar**: `localStorage` NÃO contém `refresh_token`
  - [ ] ✅ **Verificar**: DevTools > Application > Cookies mostra `refresh_token` com flag `HttpOnly`

- [ ] **Teste 2: Requisições incluem token automaticamente**
  - [ ] Fazer requisição autenticada (ex: GET /api/1/portals)
  - [ ] ✅ **Verificar**: DevTools > Network > Headers mostra `Authorization: Bearer ...`
  - [ ] ✅ **Verificar**: DevTools > Network > Cookies mostra `refresh_token` enviado

- [ ] **Teste 3: Refresh automático em 401**
  - [ ] Esperar access_token expirar (15 minutos) ou forçar 401
  - [ ] Fazer requisição
  - [ ] ✅ **Verificar**: Interceptor renova token automaticamente
  - [ ] ✅ **Verificar**: Requisição original é reenviada com sucesso

- [ ] **Teste 4: Logout limpa tudo**
  - [ ] Fazer logout via UI
  - [ ] ✅ **Verificar**: Cookie `refresh_token` removido
  - [ ] ✅ **Verificar**: `authService.getAccessToken()` retorna `null`

**✅ CHECKPOINT FASE 2**: Frontend usa cookies e memória, sem injeção manual

---

## 🎯 FASE 3: VALIDAÇÃO COMPLETA

### 3.1. Validar Segurança de Cookies

- [ ] Abrir DevTools > Application > Cookies
- [ ] Verificar cookie `refresh_token` possui flag `HttpOnly` (não acessível via JavaScript)
- [ ] Verificar cookie possui flag `Secure` (somente HTTPS em produção)
- [ ] Verificar cookie possui flag `SameSite=Strict` (proteção CSRF)
- [ ] Verificar `Path=/api/1/auth` (escopo restrito)
- [ ] Tentar acessar cookie via console: `document.cookie` NÃO deve mostrar `refresh_token`
- [ ] ✅ **Checkpoint**: Cookies protegidos contra XSS

---

### 3.2. Validar Workflows n8n

- [ ] Fazer login via UI
- [ ] Abrir n8n logs ou usar webhook.site para capturar requisição
- [ ] Verificar header `Cookie: refresh_token=...` é enviado para n8n
- [ ] Verificar workflow `auth-refresh.json` extrai token corretamente
- [ ] ✅ **Checkpoint**: n8n recebe e processa cookies

---

### 3.3. Validar Fluxo Completo

- [ ] **Teste 1: Login → Requisições → Logout**
  - [ ] Login com credenciais válidas
  - [ ] Fazer 3 requisições autenticadas (ex: GET /api/1/portals, GET /api/jqel, etc)
  - [ ] Logout
  - [ ] ✅ **Verificar**: Todas as requisições usam cookie automaticamente

- [ ] **Teste 2: Login → Esperar expiração → Refresh automático**
  - [ ] Login com credenciais válidas
  - [ ] Aguardar 15 minutos (expiração do access_token) ou forçar 401
  - [ ] Fazer requisição autenticada
  - [ ] ✅ **Verificar**: Interceptor renova token sem intervenção do usuário
  - [ ] ✅ **Verificar**: Usuário não percebe renovação (UX transparente)

- [ ] **Teste 3: Login em múltiplas abas**
  - [ ] Login em uma aba
  - [ ] Abrir segunda aba no mesmo navegador
  - [ ] ✅ **Verificar**: Cookie compartilhado entre abas
  - [ ] ✅ **Verificar**: Logout em uma aba revoga acesso em todas

- [ ] **Teste 4: Proteção contra XSS**
  - [ ] Abrir DevTools > Console
  - [ ] Executar: `console.log(document.cookie)`
  - [ ] ✅ **Verificar**: `refresh_token` NÃO aparece (httpOnly protege)
  - [ ] ✅ **Verificar**: Apenas cookies não-httpOnly são visíveis

**✅ CHECKPOINT FASE 3**: Sistema 100% funcional e seguro

---

## 📝 NOTAS DE IMPLEMENTAÇÃO

### Decisões Arquiteturais
- **Abordagem Mista (spec SPEC-AU-ST-*)**: `refresh_token` em cookie httpOnly (segurança máxima) + `access_token` em memória (compatibilidade e controle)
- **Zero Mudanças no Backbone**: Workflows n8n JÁ aceitam cookies (implementado em `workflows/auth/*.json`), apenas Backend Express adiciona `Set-Cookie`
- **Interceptor Automático**: Renovação de token transparente para o usuário (UX melhorada)
- **Flags de Segurança Obrigatórias**: `HttpOnly` (anti-XSS) + `Secure` (HTTPS) + `SameSite=Strict` (anti-CSRF)

### Limitações Conhecidas
- **Mobile Apps Nativos**: Cookies httpOnly não funcionam em apps nativos (React Native, etc)
  - Mitigação: Para mobile, usar abordagem alternativa com Secure Storage
  - Alternativa futura: Implementar OAuth2 com PKCE para apps nativos

- **Desenvolvimento Local (HTTP)**: Flag `Secure` deve ser `false` em `NODE_ENV=development`
  - Mitigação: Usar variável de ambiente `process.env.NODE_ENV === 'production'`
  - Alternativa futura: Usar HTTPS local com certificado self-signed

- **CORS Cross-Domain**: Cookies requerem `origin` específico, não funciona com wildcard `*`
  - Mitigação: Configurar lista de origins permitidos em whitelist
  - Alternativa futura: Subdomínios compartilham cookies automaticamente

### Referências
- `spec/SPEC-authentication.md` (SPEC-AU-ST-001 a SPEC-AU-ST-008)
- `workflows/auth/auth-login.json` (linha 23: suporte a cookies)
- `workflows/auth/auth-refresh.json` (linha 23: função `getRefreshTokenFromCookie`)
- `workflows/auth/auth-logout.json` (linha 24: extração de cookie)
- `workflows/auth/authorize.json` (linha 399: função `getAccessTokenFromCookie`)
- RFC 6265 - HTTP State Management Mechanism (Cookies)
- OWASP Authentication Cheat Sheet - Token Storage
