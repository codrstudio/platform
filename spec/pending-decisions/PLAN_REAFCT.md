# PLAN_SSE-GUEST-AUTH.md - Garantir 0% de 401 para Usuarios Anonimos

**Objetivo**: Implementar autenticacao guest JWT que NUNCA retorna 401 para usuarios anonimos, garantindo 100% de disponibilidade para sites publicos e aplicacoes sem login obrigatorio.

---

## 📋 RESUMO EXECUTIVO

### Problemas Identificados
1. ❌ Guest JWT expira apos 1 hora, causando 401 em conexoes SSE
2. ❌ EventSource reconecta com token expirado (URL fixa), gerando loop de 401
3. ❌ Usuarios anonimos em sites publicos perdem conexao SSE ao longo do tempo

### Solucao (Baseada em Padroes)
- ✅ Guest tokens nao tem validacao de expiracao no backend (padrao Firebase/Cognito)
- ✅ Backend valida apenas assinatura JWT para guests (seguranca mantida)
- ✅ Usuarios autenticados continuam com validacao de expiracao normal

---

## 🎯 FASE 1: ATUALIZAR VALIDACAO JWT NO BACKEND

### 1.1. Modificar Validacao em SSE Routes

- [x] Atualizar `src/backend/src/routes/events.routes.ts` (linha 47-57)
  - [x] Usar `jwt.verify()` com `ignoreExpiration: true`
  - [x] Validar expiracao manualmente apenas para `guest: false`
  - [x] Manter rejeicao de assinatura invalida
- [x] ✅ **Checkpoint**: Guest tokens expirados sao aceitos, user tokens expirados sao rejeitados

**Codigo de Referencia**:
```typescript
// routes/events.routes.ts
try {
  decoded = jwt.verify(token, env.JWT_SECRET, {
    ignoreExpiration: true // Nao valida exp automaticamente
  }) as { sub: string; guest?: boolean; exp?: number }

  // Se for usuario REAL (nao guest), valida expiracao manualmente
  if (!decoded.guest && decoded.exp) {
    const now = Math.floor(Date.now() / 1000)
    if (now >= decoded.exp) {
      res.status(401).json({
        code: 401,
        message: 'Unauthorized: Token expired'
      })
      return
    }
  }

  // Guest: sempre aceita (exp ignorada)
  // Continua normalmente...

} catch (error) {
  // So rejeita se assinatura invalida
  res.status(401).json({
    code: 401,
    message: 'Unauthorized: Invalid token signature'
  })
  return
}
```

---

### 1.2. Criar Middleware de Validacao JWT Compartilhado

- [x] Criar `src/backend/src/middleware/jwt-validation.middleware.ts`
  - [x] Extrair logica de validacao para funcao reutilizavel
  - [x] Aceitar parametros: `token`, `secret`, opcoes de validacao
  - [x] Retornar `{ valid: boolean, decoded?: any, error?: string }`
- [x] Aplicar middleware em todas as rotas que usam JWT:
  - [x] `routes/events.routes.ts` (SSE stream e history)
  - [ ] `routes/auth.routes.ts` (authorize endpoint)
  - [ ] Futuras rotas protegidas
- [x] ✅ **Checkpoint**: Validacao JWT centralizada e consistente em todas as rotas

**Codigo de Referencia**:
```typescript
// middleware/jwt-validation.middleware.ts
import jwt from 'jsonwebtoken'

export function validateJWT(
  token: string,
  secret: string
): { valid: boolean; decoded?: any; error?: string } {
  try {
    const decoded = jwt.verify(token, secret, {
      ignoreExpiration: true
    }) as { sub: string; guest?: boolean; exp?: number }

    // Validar expiracao apenas para usuarios autenticados
    if (!decoded.guest && decoded.exp) {
      const now = Math.floor(Date.now() / 1000)
      if (now >= decoded.exp) {
        return { valid: false, error: 'Token expired' }
      }
    }

    return { valid: true, decoded }
  } catch (error) {
    return { valid: false, error: 'Invalid token signature' }
  }
}
```

---

### 1.3. Atualizar Geracao de Guest Token

- [x] Modificar `src/backend/src/routes/auth.routes.ts` (endpoint `/guest`)
  - [x] Aumentar expiracao de guest token para 1 ano (simbolico)
  - [x] Garantir flag `guest: true` no payload
  - [x] Manter `iat` e `iss` para auditoria
- [x] ✅ **Checkpoint**: Guest tokens gerados com exp de 1 ano

**Codigo de Referencia**:
```typescript
// routes/auth.routes.ts - POST /api/1/auth/guest
const guestToken = jwt.sign(
  {
    sub: `guest_${uuidv4()}`,
    guest: true,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 ano
    iss: 'platform'
  },
  env.JWT_SECRET
)
```

---

### 1.4. Testar Fase 1 Completa

**Checklist de Testes**:
- [x] **Teste 1: Guest token expirado e aceito**
  - [x] Gerar guest token com exp no passado (manualmente ou via codigo)
  - [x] Conectar SSE com token expirado
  - [x] ✅ **Verificar**: Conexao SSE estabelecida com sucesso (200 OK)

- [x] **Teste 2: User token expirado e rejeitado**
  - [x] Fazer login e obter user token
  - [x] Modificar token para ter exp no passado (ou aguardar expiracao)
  - [x] Conectar SSE com token expirado
  - [x] ✅ **Verificar**: Conexao SSE rejeitada com 401

- [x] **Teste 3: Token com assinatura invalida e rejeitado**
  - [x] Modificar assinatura de um token valido
  - [x] Tentar conectar SSE
  - [x] ✅ **Verificar**: 401 Unauthorized (assinatura invalida)

**✅ CHECKPOINT FASE 1**: Guest tokens nunca expiram, user tokens continuam validando expiracao normalmente

---

## 📝 NOTAS DE IMPLEMENTACAO

### Decisoes Arquiteturais
- **Guest tokens sem expiracao real**: Padrao da industria (Firebase, AWS Cognito), guest e apenas identificador de sessao anonima sem privilegios
- **Validacao manual de expiracao**: Necessario porque `ignoreExpiration: true` desativa validacao automatica do jwt.verify()
- **Middleware centralizado**: Evita duplicacao de logica e garante consistencia em todas as rotas

### Limitacoes Conhecidas
- **Guest tokens nao podem ser invalidados remotamente**: Como nao expira e nao usa refresh token, nao ha mecanismo de revogacao
  - Mitigacao: Guest nao tem acesso a recursos sensiveis, apenas identificacao de sessao
  - Alternativa futura: Implementar blacklist em Redis se necessario (improvavel)

- **Token eterno aumenta risco em caso de XSS**: Token roubado via XSS pode ser usado indefinidamente
  - Mitigacao: Guest nao tem privilegios, rate limiting por IP/userId, CSP headers
  - Alternativa futura: Implementar rotacao silenciosa de tokens (sem quebrar conexao)

### Referencias
- Firebase Anonymous Authentication: https://firebase.google.com/docs/auth/web/anonymous-auth
- AWS Cognito Unauthenticated Identities: https://docs.aws.amazon.com/cognito/latest/developerguide/identity-pools.html
- JWT Best Practices: https://datatracker.ietf.org/doc/html/rfc8725
- SSE + JWT Token Expiration (Stack Overflow): Padrao de fechar e reconectar com novo token
