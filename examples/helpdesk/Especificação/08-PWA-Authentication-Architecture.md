# 8. Arquitetura de Autenticação para PWA - Coletivos HelpDesk

## 📋 Visão Geral

Este documento especifica a arquitetura de autenticação para Progressive Web Apps (PWA) da plataforma Coletivos Processa, resolvendo os desafios de Single Sign-On (SSO) entre aplicativos React instaláveis mantendo segurança e experiência de usuário unificada.

---

## 🎯 Contexto e Desafios

### Requisitos do Sistema

1. **PWA Instalável**: Cada aplicativo (helpdesk, etc.) deve ser instalável como app standalone
2. **SSO Corporativo**: Login único compartilhado entre todos os apps no browser
3. **Componentes Compartilhados**: Interface de autenticação reutilizável via `@coletivos/auth-lib`
4. **Mesmo Domínio**: Todos os apps rodam em `*.coletivos.com.br`

### Problema Arquitetural

**Abordagem tradicional (Backend + HttpOnly Cookie):**
- ✅ Backend Express centralizado
- ✅ Cookie HttpOnly compartilhado
- ✅ SSO perfeito no browser
- ❌ **QUEBRA em PWA standalone** (cookies isolados por sandboxing do SO)

**Por que HttpOnly não funciona em PWA?**
- iOS/Android isolam storage entre PWA e browser
- Cookie HttpOnly não é compartilhado entre apps instalados
- Cada PWA teria login independente (UX ruim)

---

## 🏗️ Arquitetura Proposta: Auth-lib com Storage Compartilhado

### Princípios

1. **100% React**: Sem dependência de backend centralizado
2. **Segurança em camadas**: IndexedDB criptografado + Service Worker + CSP
3. **SSO same-origin**: BroadcastChannel para sincronização cross-tab
4. **Compatível com PWA**: Funciona em standalone e browser

### Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│              @coletivos/auth-lib (Biblioteca)               │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────────────────┐   │
│  │   React Layer    │  │     Service Worker Layer     │   │
│  │                  │  │                              │   │
│  │ • AuthProvider   │  │ • Intercepta fetch('/api/*') │   │
│  │ • ThemeProvider  │  │ • Injeta Authorization header│   │
│  │ • LoginPage      │  │ • Cache offline inteligente  │   │
│  │ • ProtectedRoute │  │ • Valida token expiração     │   │
│  └──────────────────┘  └──────────────────────────────┘   │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │          Storage & Sync Layer                         │ │
│  │                                                       │ │
│  │ • IndexedDB (token criptografado)                    │ │
│  │ • BroadcastChannel (sync cross-tab/cross-app)        │ │
│  │ • Crypto API (AES-GCM encryption)                    │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           ↓
              ┌────────────────────────────┐
              │     N8N Authentication     │
              │  (Backend Serverless)      │
              └────────────────────────────┘
```

---

## 🔐 Componentes de Segurança

### 1. Storage Seguro (IndexedDB)

**Por quê IndexedDB?**
- ✅ Compartilhado entre apps do mesmo domínio
- ✅ Maior capacidade que localStorage (50MB+)
- ✅ API assíncrona (não bloqueia UI)
- ✅ Suporta criptografia client-side

**Implementação:**
```typescript
// Estrutura IndexedDB
Database: 'coletivos_auth'
  Store: 'tokens'
    - access_token: EncryptedString
    - refresh_token: EncryptedString (futuro)
    - expires_at: Timestamp
    - user_data: EncryptedJSON
```

**Criptografia:**
- Algoritmo: AES-GCM 256-bit
- Chave derivada: PBKDF2 (device fingerprint + salt)
- IV único por operação
- Proteção contra XSS: token nunca em memória global

### 2. Service Worker de Autenticação

**Responsabilidades:**
1. **Interceptação de Requisições**: Captura todas as chamadas `/api/*`
2. **Injeção de Token**: Adiciona `Authorization: Bearer {token}` automaticamente
3. **Validação**: Verifica expiração antes de usar token
4. **Renovação**: Solicita refresh token quando necessário
5. **Offline**: Cache inteligente de respostas

**Fluxo:**
```
Fetch('/api/chamados')
  ↓
Service Worker intercepta
  ↓
Busca token em IndexedDB
  ↓
Valida expiração
  ↓
Injeta header Authorization
  ↓
Envia request modificado
  ↓
Cache response (se offline-friendly)
```

### 3. Sincronização Cross-App (BroadcastChannel)

**Problema:** Login em App A deve autenticar App B/C instantaneamente

**Solução:**
```typescript
// Broadcast login event
const authChannel = new BroadcastChannel('coletivos_auth')

// App A faz login
authChannel.postMessage({
  type: 'AUTH_LOGIN',
  user: { id: 123, nome: 'João' },
  timestamp: Date.now()
})

// Apps B e C escutam
authChannel.onmessage = (event) => {
  if (event.data.type === 'AUTH_LOGIN') {
    // Atualiza estado local
    setUser(event.data.user)
  }
}
```

**Eventos sincronizados:**
- `AUTH_LOGIN`: Login realizado
- `AUTH_LOGOUT`: Logout global
- `AUTH_REFRESH`: Token renovado
- `AUTH_EXPIRE`: Sessão expirada

---

## 🔄 Fluxos de Autenticação

### Fluxo 1: Login Inicial

```
1. Usuário preenche LoginForm
   ↓
2. AuthProvider.login()
   ↓
3. POST /webhook/.../autenticar (N8N)
   ↓
4. Recebe { access_token, payload, expires_in }
   ↓
5. Criptografa token → IndexedDB
   ↓
6. BroadcastChannel.postMessage('AUTH_LOGIN')
   ↓
7. Service Worker ativado
   ↓
8. Outros apps/abas recebem evento → SSO automático
```

### Fluxo 2: Verificação de Autenticação (Page Load)

```
1. App inicia → AuthProvider.initialize()
   ↓
2. Busca token em IndexedDB
   ↓
3. Valida expiração
   ↓
4. Se válido:
   ├─ Descriptografa user_data
   ├─ setUser(userData)
   └─ Estado: autenticado
   ↓
5. Se expirado/inválido:
   ├─ clearAuth()
   └─ Estado: não autenticado
```

### Fluxo 3: Request com Autenticação

```
1. React: fetch('/api/chamados')
   ↓
2. Service Worker intercepta
   ↓
3. getToken() → IndexedDB
   ↓
4. Valida expiração
   ↓
5. Clona request + header:
   Authorization: Bearer {token}
   ↓
6. fetch(modifiedRequest)
   ↓
7. Se 401: dispara evento AUTH_EXPIRE
```

### Fluxo 4: Logout Global

```
1. Usuário clica "Sair"
   ↓
2. AuthProvider.logout()
   ↓
3. BroadcastChannel.postMessage('AUTH_LOGOUT')
   ↓
4. Limpa IndexedDB (todos os apps)
   ↓
5. Service Worker invalida cache
   ↓
6. Todos apps/abas → redirect login
```

---

## 🛡️ Camadas de Segurança

### 1. Content Security Policy (CSP)

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'wasm-unsafe-eval';
  connect-src 'self' https://n8n.codrstudio.dev;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
">
```

**Proteções:**
- ✅ Previne XSS inline
- ✅ Bloqueia scripts externos
- ✅ Apenas conexões autorizadas
- ✅ HTTPS obrigatório

### 2. Criptografia de Token

**Método:**
```typescript
// Derivação de chave
const keyMaterial = await crypto.subtle.importKey(
  'raw',
  deviceFingerprint, // Único por dispositivo
  { name: 'PBKDF2' },
  false,
  ['deriveKey']
)

const key = await crypto.subtle.deriveKey(
  {
    name: 'PBKDF2',
    salt: randomSalt,
    iterations: 100000,
    hash: 'SHA-256'
  },
  keyMaterial,
  { name: 'AES-GCM', length: 256 },
  false,
  ['encrypt', 'decrypt']
)

// Criptografia
const encrypted = await crypto.subtle.encrypt(
  {
    name: 'AES-GCM',
    iv: randomIV
  },
  key,
  tokenBuffer
)
```

### 3. Validação de Expiração

```typescript
// Service Worker valida antes de usar
async function getValidToken(): Promise<string | null> {
  const tokenData = await db.get('tokens', 'access_token')

  if (!tokenData) return null

  const now = Date.now()
  if (now >= tokenData.expires_at) {
    // Token expirado
    await clearAuth()
    broadcastEvent('AUTH_EXPIRE')
    return null
  }

  return await decryptToken(tokenData.encrypted)
}
```

### 4. Device Fingerprint

**Componentes:**
- Screen resolution
- Timezone
- Language
- Platform
- CPU cores
- UserAgent hash

**Uso:**
- Chave de criptografia única por dispositivo
- Dificulta roubo de token entre devices
- Não previne 100% (não é 2FA), mas adiciona camada

---

## 📱 Compatibilidade PWA

### Detecção de Ambiente

```typescript
export function detectEnvironment() {
  const isStandalone = window.matchMedia(
    '(display-mode: standalone)'
  ).matches

  const isIOSWebClip = 'standalone' in window.navigator &&
    (window.navigator as any).standalone

  return {
    isPWA: isStandalone || isIOSWebClip,
    isBrowser: !isStandalone && !isIOSWebClip
  }
}
```

### Estratégia por Ambiente

| Ambiente | Storage | Sync | Offline |
|----------|---------|------|---------|
| **Browser Multi-tab** | IndexedDB | BroadcastChannel | Service Worker |
| **PWA Standalone** | IndexedDB | N/A (single instance) | Service Worker |
| **Browser Single-tab** | IndexedDB | N/A | Service Worker |

### Limitações Conhecidas

**iOS:**
- Service Worker limitado a 50MB cache
- IndexedDB pode ser limpo se device com pouco espaço
- BroadcastChannel não funciona entre PWA e Safari (OK - são instâncias separadas)

**Android:**
- Funciona perfeitamente
- Sem limitações significativas

**Mitigação:**
- Verificar disponibilidade de storage periodicamente
- Fallback gracioso se IndexedDB indisponível
- Aviso ao usuário se storage crítico

---

## 🔧 Implementação Técnica

### Estrutura de Arquivos

```
src/auth-lib/src/
├── components/
│   ├── LoginPage.tsx
│   ├── LoginForm.tsx
│   ├── ProtectedRoute.tsx
│   └── ThemeToggle.tsx
├── context/
│   ├── AuthContext.tsx       # SSO-aware
│   └── ThemeContext.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useTheme.ts
│   └── useAuthStorage.ts     # IndexedDB wrapper
├── services/
│   ├── authService.ts        # N8N communication
│   ├── secureStorage.ts      # Crypto + IndexedDB
│   ├── authSync.ts           # BroadcastChannel
│   └── deviceFingerprint.ts
├── service-worker/
│   └── auth-sw.ts            # SW auth logic
└── types/
    └── index.ts
```

### Dependências Necessárias

```json
{
  "dependencies": {
    "axios": "^1.12.2",           // HTTP client
    "idb": "^8.0.0",              // IndexedDB wrapper
    "@fingerprintjs/fingerprintjs": "^4.0.0"  // Device ID
  }
}
```

### Registro do Service Worker

```typescript
// src/auth-lib/src/services/registerServiceWorker.ts
export async function registerAuthServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        '/auth-sw.js',
        { scope: '/' }
      )

      console.log('[Auth SW] Registered:', registration.scope)

      // Espera ativação
      if (registration.active) {
        console.log('[Auth SW] Active')
      } else {
        registration.addEventListener('updatefound', () => {
          console.log('[Auth SW] Update found')
        })
      }

      return registration
    } catch (error) {
      console.error('[Auth SW] Registration failed:', error)
    }
  }
}
```

---

## 🚀 Plano de Migração

### Fase 1: Preparação (1 semana)

**Tarefas:**
1. ✅ Implementar `secureStorage.ts` (IndexedDB + Crypto)
2. ✅ Implementar `authSync.ts` (BroadcastChannel)
3. ✅ Implementar `deviceFingerprint.ts`
4. ✅ Criar `auth-sw.ts` (Service Worker)
5. ✅ Atualizar `AuthContext` para usar novo storage
6. ✅ Testes unitários de cada módulo

### Fase 2: Integração (1 semana)

**Tarefas:**
1. ✅ Atualizar `@coletivos/auth-lib` com novos módulos
2. ✅ Build e publicação da lib
3. ✅ Criar PWA manifest para helpdesk
4. ✅ Configurar CSP headers
5. ✅ Testes de integração

### Fase 3: Migração Helpdesk (3 dias)

**Tarefas:**
1. ✅ Atualizar `package.json` do helpdesk
2. ✅ Substituir `AuthContext` local por `@coletivos/auth-lib`
3. ✅ Registrar Service Worker no bootstrap
4. ✅ Remover código legado (proxy backend)
5. ✅ Testes E2E

### Fase 4: Validação (2 dias)

**Cenários de Teste:**
- [ ] Login em browser → abrir nova aba → SSO funciona
- [ ] Login em PWA standalone → funciona
- [ ] Login em App A → App B auto-autentica
- [ ] Logout em App A → App B desloga
- [ ] Token expira → todos apps deslogam
- [ ] Offline → cache funciona
- [ ] iOS Safari + PWA → ambos funcionam independente
- [ ] Android Chrome + PWA → SSO funciona

---

## 📊 Comparação de Segurança

| Aspecto | Cookie HttpOnly | IndexedDB + SW + Crypto |
|---------|----------------|------------------------|
| **XSS Protection** | 🟢 Imune (JS não acessa) | 🟡 Vulnerável (precisa CSP rigoroso) |
| **CSRF Protection** | 🟡 Precisa token CSRF | 🟢 Não vulnerável (header custom) |
| **Man-in-Middle** | 🟢 HTTPS + Secure flag | 🟢 HTTPS obrigatório |
| **Token Theft** | 🟢 Difícil | 🟡 Possível com XSS |
| **Device Binding** | ❌ Não | 🟢 Fingerprint |
| **Offline** | ❌ Não funciona | 🟢 Funciona |
| **PWA Support** | ❌ Quebra | 🟢 Nativo |
| **SSO Multi-app** | 🟢 Cookie domain | 🟢 BroadcastChannel |

**Veredito:**
- HttpOnly é **mais seguro contra XSS**
- Nossa solução é **segura O SUFICIENTE** com CSP + criptografia
- **Única opção viável** para PWA standalone
- Trade-off aceitável: pequena redução de segurança vs grande ganho de funcionalidade

---

## ✅ Critérios de Aceitação

### Funcionais

- [ ] Login em um app autentica automaticamente outros apps do mesmo domínio
- [ ] PWA standalone funciona offline com token cacheado
- [ ] Logout em qualquer app desloga todos instantaneamente
- [ ] Token expirado força re-login em todos os apps
- [ ] Interface de login idêntica em todos os apps (`@coletivos/auth-lib`)
- [ ] Tema (claro/escuro) sincronizado via `pref-theme`

### Segurança

- [ ] Token criptografado em IndexedDB (AES-GCM 256)
- [ ] CSP configurado e validado
- [ ] Service Worker valida expiração antes de usar token
- [ ] Device fingerprint protege contra roubo de token
- [ ] Sem tokens em localStorage (apenas IndexedDB)
- [ ] HTTPS obrigatório em produção

### Performance

- [ ] Login < 2s (incluindo criptografia)
- [ ] Sincronização cross-app < 100ms
- [ ] Service Worker não bloqueia UI
- [ ] IndexedDB operações < 50ms
- [ ] PWA offline-ready em < 5s após install

### Compatibilidade

- [ ] Chrome/Edge 90+
- [ ] Firefox 88+
- [ ] Safari 15+ (iOS 15+)
- [ ] PWA instalável em iOS e Android
- [ ] BroadcastChannel fallback se não suportado

---

## 📚 Referências Técnicas

### Especificações Web

- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [BroadcastChannel API](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

### Artigos de Referência

- [Securing Tokens in PWA](https://www.mckennaconsultants.com/securing-tokens-in-a-progressive-web-app/)
- [Building Multiple PWAs on Same Domain](https://web.dev/articles/building-multiple-pwas-on-the-same-domain)
- [PWA Authentication Best Practices 2024](https://web.dev/learn/pwa/progressive-web-apps)

### Ferramentas

- [idb library](https://github.com/jakearchibald/idb) - IndexedDB wrapper
- [FingerprintJS](https://github.com/fingerprintjs/fingerprintjs) - Device fingerprinting
- [Workbox](https://developers.google.com/web/tools/workbox) - Service Worker toolkit

---

## 🔄 Manutenção e Evolução

### Roadmap Futuro

**v1.1 - Refresh Token:**
- Implementar rotação automática de tokens
- Renovação silenciosa sem re-login

**v1.2 - Biometria:**
- WebAuthn para login biométrico
- Fallback para senha tradicional

**v1.3 - 2FA:**
- TOTP (Google Authenticator)
- SMS/Email OTP

**v1.4 - Session Management:**
- Dashboard de sessões ativas
- Logout remoto de dispositivos

### Monitoramento

**Métricas:**
- Taxa de login bem-sucedidos
- Tempo médio de autenticação
- Falhas de sincronização cross-app
- Erros de Service Worker
- Storage usage (IndexedDB)

**Alertas:**
- Taxa de erro > 5%
- Latência > 3s
- Storage > 80% capacity
- Service Worker crashes

---

## 📝 Conclusão

Esta arquitetura resolve o conflito entre PWA standalone e SSO corporativo através de uma solução 100% React que:

✅ **Mantém SSO** entre apps do mesmo domínio
✅ **Funciona em PWA** standalone (iOS/Android)
✅ **Segurança robusta** (criptografia + CSP + SW)
✅ **Componentes compartilhados** (`@coletivos/auth-lib`)
✅ **Offline-first** com Service Worker
✅ **Experiência unificada** para usuários

O trade-off de segurança (vs HttpOnly cookie) é **aceitável e mitigado** pelas camadas de proteção implementadas.

---

**Versão:** 1.0
**Data:** 2025-10-02
**Autor:** Sistema de Documentação Coletivos
**Status:** ✅ Aprovado para Implementação
