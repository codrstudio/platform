# SPEC-authentication.md

## Especificação: Sistema de Autenticação

### Escopo
Este documento define os requisitos do sistema de autenticação da plataforma, incluindo rotas, JWT, permissões e integração com módulos.

---

## 1. Arquitetura de Autenticação

### Responsabilidades

**SPEC-AU-AR-001:** Autenticação DEVE ser responsabilidade do Backbone (n8n)

**SPEC-AU-AR-002:** Backend DEVE atuar como proxy para rotas de autenticação

**SPEC-AU-AR-003:** Backend PODE validar formato de requisições antes de repassar

**SPEC-AU-AR-004:** Frontend DEVE consumir rotas de autenticação via Canal de Autenticação

**SPEC-AU-AR-005:** Módulos de Auth DEVEM fornecer apenas experiência de usuário (UI/UX)

### Separação de Responsabilidades

**SPEC-AU-AR-006:** Plataforma (Backend + Backbone) fornece segurança

**SPEC-AU-AR-007:** Módulos de Auth fornecem interface e fluxos

**SPEC-AU-AR-008:** Módulos NÃO DEVEM implementar lógica de autenticação

**SPEC-AU-AR-009:** Módulos DEVEM ser wrappers das rotas da plataforma

---

## 2. Rotas de Autenticação

### Prefixo e Protocolo

**SPEC-AU-RO-001:** Todas as rotas DEVEM usar prefixo `/api/1/auth/`

**SPEC-AU-RO-002:** Todas as rotas DEVEM usar método POST

**SPEC-AU-RO-003:** Todas as rotas DEVEM aceitar e retornar JSON

**SPEC-AU-RO-004:** Todas as rotas DEVEM usar HTTPS em produção

### Rotas Obrigatórias

**SPEC-AU-RO-005:** DEVE existir `/api/1/auth/login`

**SPEC-AU-RO-006:** DEVE existir `/api/1/auth/refresh`

**SPEC-AU-RO-007:** DEVE existir `/api/1/auth/logout`

**SPEC-AU-RO-008:** DEVE existir `/api/1/auth/logout-all`

**SPEC-AU-RO-009:** DEVE existir `/api/1/auth/authorize`

---

## 3. Login (/api/1/auth/login)

### Entrada

**SPEC-AU-LI-001:** DEVE aceitar campo `username` (string, obrigatório)

**SPEC-AU-LI-002:** DEVE aceitar campo `password` (string, obrigatório)

**SPEC-AU-LI-003:** DEVE aceitar campo `realm` (string, opcional)

**SPEC-AU-LI-004:** DEVE aceitar campo `schema` (string, opcional)

**SPEC-AU-LI-005:** `realm` permite direcionar autenticação para domínio específico

**SPEC-AU-LI-006:** `schema` permite direcionar autenticação para fonte de dados específica

### Processamento

**SPEC-AU-LI-007:** Backend DEVE validar presença de `username` e `password`

**SPEC-AU-LI-008:** Backend DEVE repassar requisição ao Backbone

**SPEC-AU-LI-009:** Backbone DEVE validar credenciais

**SPEC-AU-LI-010:** Backbone DEVE buscar dados do usuário

**SPEC-AU-LI-011:** Backbone DEVE gerar tokens (access e refresh)

### Saída (Sucesso)

**SPEC-AU-LI-012:** DEVE retornar campo `code` (string, ex: "success")

**SPEC-AU-LI-013:** DEVE retornar campo `access_token` (string, JWT)

**SPEC-AU-LI-014:** DEVE retornar campo `refresh_token` (string)

**SPEC-AU-LI-015:** DEVE retornar campo `token_type` (string, "Bearer")

**SPEC-AU-LI-016:** DEVE retornar campo `expires_in` (number, segundos)

**SPEC-AU-LI-017:** DEVE retornar campo `payload` (object, dados do usuário)

**SPEC-AU-LI-018:** `payload` PODE incluir: `userId`, `username`, `email`, `roles`, `permissions`

### Saída (Erro)

**SPEC-AU-LI-019:** Credenciais inválidas DEVEM retornar HTTP 401

**SPEC-AU-LI-020:** DEVE retornar campo `code` (string, ex: "invalid_credentials")

**SPEC-AU-LI-021:** DEVE retornar campo `message` (string, descrição do erro)

**SPEC-AU-LI-022:** DEVE retornar campo `details` (object, opcional, informações adicionais)

### Segurança

**SPEC-AU-LI-023:** Password NÃO DEVE ser logado

**SPEC-AU-LI-024:** Password NÃO DEVE ser armazenado em plain text

**SPEC-AU-LI-025:** Múltiplas tentativas falhadas PODEM resultar em rate limiting

**SPEC-AU-LI-026:** Rate limiting DEVE ser implementado no Backbone

---

## 4. Refresh (/api/1/auth/refresh)

### Entrada

**SPEC-AU-RF-001:** DEVE aceitar `refresh_token` no body JSON

**SPEC-AU-RF-002:** PODE aceitar `refresh_token` em cookie HTTP-only

**SPEC-AU-RF-003:** Se ambos presentes, body tem prioridade

**SPEC-AU-RF-004:** `refresh_token` DEVE ser string

### Processamento

**SPEC-AU-RF-005:** Backend DEVE repassar ao Backbone

**SPEC-AU-RF-006:** Backbone DEVE validar `refresh_token`

**SPEC-AU-RF-007:** Backbone DEVE verificar se token não foi revogado

**SPEC-AU-RF-008:** Backbone DEVE detectar reuso de token

**SPEC-AU-RF-009:** Reuso detectado DEVE revogar família inteira de tokens

**SPEC-AU-RF-010:** Token válido DEVE gerar novo access token

**SPEC-AU-RF-011:** Token válido DEVE gerar novo refresh token (rotação)

**SPEC-AU-RF-012:** Refresh token antigo DEVE ser invalidado

### Saída (Sucesso)

**SPEC-AU-RF-013:** DEVE retornar novo `access_token` (JWT)

**SPEC-AU-RF-014:** DEVE retornar novo `refresh_token`

**SPEC-AU-RF-015:** DEVE retornar `token_type` ("Bearer")

**SPEC-AU-RF-016:** DEVE retornar `expires_in` (segundos)

**SPEC-AU-RF-017:** PODE retornar `payload` atualizado do usuário

### Saída (Erro)

**SPEC-AU-RF-018:** Token inválido ou expirado DEVE retornar HTTP 401

**SPEC-AU-RF-019:** Reuso detectado DEVE retornar HTTP 401

**SPEC-AU-RF-020:** DEVE retornar `code` e `message` apropriados

### Família de Tokens

**SPEC-AU-RF-021:** Refresh tokens DEVEM pertencer a uma "família"

**SPEC-AU-RF-022:** Rotação mantém token na mesma família

**SPEC-AU-RF-023:** Reuso invalida toda a família

**SPEC-AU-RF-024:** Família DEVE ser identificável internamente

---

## 5. Logout (/api/1/auth/logout)

### Entrada

**SPEC-AU-LO-001:** DEVE aceitar `refresh_token` no body JSON

**SPEC-AU-LO-002:** PODE aceitar `refresh_token` em cookie HTTP-only

**SPEC-AU-LO-003:** Se ambos presentes, body tem prioridade

### Processamento

**SPEC-AU-LO-004:** Backend DEVE repassar ao Backbone

**SPEC-AU-LO-005:** Backbone DEVE revogar o `refresh_token` específico

**SPEC-AU-LO-006:** Revogação DEVE ser imediata

**SPEC-AU-LO-007:** Token revogado NÃO PODE mais ser usado para refresh

### Saída (Sucesso)

**SPEC-AU-LO-008:** DEVE retornar HTTP 200

**SPEC-AU-LO-009:** DEVE retornar campo `code` (ex: "success")

**SPEC-AU-LO-010:** DEVE retornar campo `message` (ex: "Logged out successfully")

### Saída (Erro)

**SPEC-AU-LO-011:** Token inválido PODE retornar sucesso (idempotente)

**SPEC-AU-LO-012:** Erro interno DEVE retornar HTTP 500

### Frontend

**SPEC-AU-LO-013:** Frontend DEVE limpar access token local

**SPEC-AU-LO-014:** Frontend DEVE limpar refresh token local

**SPEC-AU-LO-015:** Frontend DEVE limpar estado de autenticação

---

## 6. Logout All (/api/1/auth/logout-all)

### Entrada

**SPEC-AU-LA-001:** DEVE aceitar `access_token` no body JSON

**SPEC-AU-LA-002:** PODE aceitar `access_token` em header `Authorization: Bearer <token>`

**SPEC-AU-LA-003:** PODE aceitar `access_token` em cookie HTTP-only

**SPEC-AU-LA-004:** Se múltiplos presentes, ordem de prioridade: header > body > cookie

### Processamento

**SPEC-AU-LA-005:** Backend DEVE validar `access_token` (JWT)

**SPEC-AU-LA-006:** Backend DEVE extrair `userId` do token

**SPEC-AU-LA-007:** Backend DEVE repassar ao Backbone

**SPEC-AU-LA-008:** Backbone DEVE revogar TODOS os refresh tokens do usuário

**SPEC-AU-LA-009:** Revogação DEVE ser imediata

**SPEC-AU-LA-010:** Todas as sessões do usuário DEVEM ser encerradas

### Saída (Sucesso)

**SPEC-AU-LA-011:** DEVE retornar HTTP 200

**SPEC-AU-LA-012:** DEVE retornar campo `code` (ex: "success")

**SPEC-AU-LA-013:** DEVE retornar campo `message` (ex: "All sessions logged out")

**SPEC-AU-LA-014:** PODE retornar número de sessões revogadas

### Saída (Erro)

**SPEC-AU-LA-015:** Token inválido DEVE retornar HTTP 401

**SPEC-AU-LA-016:** Token expirado DEVE retornar HTTP 401

**SPEC-AU-LA-017:** Erro interno DEVE retornar HTTP 500

---

## 7. Authorize (/api/1/auth/authorize)

### Entrada - Token

**SPEC-AU-AZ-001:** DEVE aceitar `access_token` no body JSON

**SPEC-AU-AZ-002:** PODE aceitar `access_token` em header `Authorization: Bearer <token>`

**SPEC-AU-AZ-003:** PODE aceitar `access_token` em cookie HTTP-only

**SPEC-AU-AZ-004:** Se múltiplos presentes, ordem de prioridade: header > body > cookie

### Entrada - Permissão

**SPEC-AU-AZ-005:** PODE aceitar `schema` (string)

**SPEC-AU-AZ-006:** PODE aceitar `permission` (string)

**SPEC-AU-AZ-007:** PODE aceitar query JQEL completa

**SPEC-AU-AZ-008:** Se apenas validar token, `schema` e `permission` são opcionais

### Formato de Permissão

**SPEC-AU-AZ-009:** Permissão DEVE seguir formato `{operation}.{entity}[.{action}]`

**SPEC-AU-AZ-010:** `operation` exemplos: `read`, `write`, `delete`, `execute`

**SPEC-AU-AZ-011:** `entity` exemplos: `users`, `orders`, `posts`, `reports`

**SPEC-AU-AZ-012:** `action` (opcional) exemplos: `approve`, `reject`, `publish`

**SPEC-AU-AZ-013:** Exemplos válidos: `read.users`, `write.orders.approve`, `delete.posts`

### Processamento

**SPEC-AU-AZ-014:** Backend DEVE validar JWT (signature, expiration)

**SPEC-AU-AZ-015:** Backend DEVE extrair payload do JWT

**SPEC-AU-AZ-016:** Se permissão especificada, Backend DEVE repassar ao Backbone

**SPEC-AU-AZ-017:** Backbone DEVE verificar se usuário tem permissão

**SPEC-AU-AZ-018:** Resultado DEVE ser cacheado em Redis

**SPEC-AU-AZ-019:** Cache DEVE ter TTL configurável (ex: 5 minutos)

### Saída (Sucesso - Autorizado)

**SPEC-AU-AZ-020:** DEVE retornar HTTP 200

**SPEC-AU-AZ-021:** DEVE retornar campo `code` (ex: "authorized")

**SPEC-AU-AZ-022:** DEVE retornar campo `payload` (dados do usuário do JWT)

**SPEC-AU-AZ-023:** DEVE retornar campo `authorized` (boolean, true)

**SPEC-AU-AZ-024:** PODE retornar campo `permissions` (array, permissões do usuário)

### Saída (Sucesso - Não Autorizado)

**SPEC-AU-AZ-025:** DEVE retornar HTTP 403

**SPEC-AU-AZ-026:** DEVE retornar campo `code` (ex: "forbidden")

**SPEC-AU-AZ-027:** DEVE retornar campo `message` (ex: "Permission denied")

**SPEC-AU-AZ-028:** DEVE retornar campo `authorized` (boolean, false)

**SPEC-AU-AZ-029:** PODE retornar campo `required_permission` (permissão necessária)

### Saída (Erro)

**SPEC-AU-AZ-030:** Token inválido DEVE retornar HTTP 401

**SPEC-AU-AZ-031:** Token expirado DEVE retornar HTTP 401

**SPEC-AU-AZ-032:** DEVE retornar `code` e `message` apropriados

### Cache

**SPEC-AU-AZ-033:** Decisões de autorização DEVEM ser cacheadas em Redis

**SPEC-AU-AZ-034:** Chave de cache DEVE incluir: `userId`, `permission`

**SPEC-AU-AZ-035:** Cache DEVE ser invalidado ao mudar permissões do usuário

**SPEC-AU-AZ-036:** Cache DEVE ter TTL entre 1-10 minutos

---

## 8. JSON Web Token (JWT)

### Estrutura

**SPEC-AU-JWT-001:** Access token DEVE ser JWT (JSON Web Token)

**SPEC-AU-JWT-002:** JWT DEVE usar algoritmo HS256 ou RS256

**SPEC-AU-JWT-003:** JWT DEVE ser assinado

**SPEC-AU-JWT-004:** JWT DEVE incluir header, payload e signature

### Payload Obrigatório

**SPEC-AU-JWT-005:** Payload DEVE incluir `sub` (subject, userId)

**SPEC-AU-JWT-006:** Payload DEVE incluir `iat` (issued at, timestamp)

**SPEC-AU-JWT-007:** Payload DEVE incluir `exp` (expiration, timestamp)

**SPEC-AU-JWT-008:** Payload DEVE incluir `iss` (issuer, identificação da plataforma)

### Payload Opcional

**SPEC-AU-JWT-009:** Payload PODE incluir `username`

**SPEC-AU-JWT-010:** Payload PODE incluir `email`

**SPEC-AU-JWT-011:** Payload PODE incluir `roles` (array)

**SPEC-AU-JWT-012:** Payload PODE incluir `permissions` (array)

**SPEC-AU-JWT-013:** Payload PODE incluir outros dados relevantes

### Expiração

**SPEC-AU-JWT-014:** Access token DEVE ter expiração curta (ex: 15 minutos)

**SPEC-AU-JWT-015:** Refresh token DEVE ter expiração longa (ex: 7 dias)

**SPEC-AU-JWT-016:** Expiração DEVE ser configurável via `.env`

**SPEC-AU-JWT-017:** Token expirado NÃO PODE ser usado

### Segurança

**SPEC-AU-JWT-018:** Secret de assinatura DEVE ser forte (mínimo 256 bits)

**SPEC-AU-JWT-019:** Secret DEVE ser armazenado em `.env`

**SPEC-AU-JWT-020:** Secret NÃO DEVE ser versionado em Git

**SPEC-AU-JWT-021:** Secret DEVE ser diferente em dev/staging/prod

---

## 9. Armazenamento de Tokens no Frontend

### Access Token

**SPEC-AU-ST-001:** Access token DEVE ser armazenado em memória (variável)

**SPEC-AU-ST-002:** Access token PODE ser armazenado em sessionStorage

**SPEC-AU-ST-003:** Access token NÃO DEVE ser armazenado em localStorage (risco XSS)

**SPEC-AU-ST-004:** Access token DEVE ser incluído em header `Authorization: Bearer <token>`

### Refresh Token

**SPEC-AU-ST-005:** Refresh token DEVE ser armazenado em cookie HTTP-only (mais seguro)

**SPEC-AU-ST-006:** Refresh token PODE ser armazenado em localStorage (menos seguro)

**SPEC-AU-ST-007:** Cookie HTTP-only DEVE ter flag `Secure` (HTTPS only)

**SPEC-AU-ST-008:** Cookie HTTP-only DEVE ter flag `SameSite=Strict`

### Renovação Automática

**SPEC-AU-ST-009:** Frontend DEVE renovar access token antes de expirar

**SPEC-AU-ST-010:** Renovação DEVE acontecer automaticamente (ex: 1 minuto antes)

**SPEC-AU-ST-011:** Renovação usa rota `/api/1/auth/refresh`

**SPEC-AU-ST-012:** Se refresh falhar, usuário DEVE ser redirecionado para login

---

## 10. Integração com Módulos de Auth

### Responsabilidade dos Módulos

**SPEC-AU-MA-001:** Módulos de Auth fornecem UI de login/signup

**SPEC-AU-MA-002:** Módulos de Auth implementam fluxos de onboarding

**SPEC-AU-MA-003:** Módulos de Auth gerenciam redirecionamentos

**SPEC-AU-MA-004:** Módulos de Auth controlam seleção de `realm`/`schema`

**SPEC-AU-MA-005:** Módulos de Auth NÃO implementam lógica de validação

### Uso das Rotas

**SPEC-AU-MA-006:** Módulos DEVEM usar rotas `/api/1/auth/*`

**SPEC-AU-MA-007:** Módulos NÃO DEVEM criar rotas de autenticação próprias

**SPEC-AU-MA-008:** Módulos DEVEM usar fetch ou axios para chamar rotas

**SPEC-AU-MA-009:** Módulos DEVEM tratar erros das rotas apropriadamente

### Context/State

**SPEC-AU-MA-010:** Módulos PODEM criar React Context para estado de auth

**SPEC-AU-MA-011:** Context PODE incluir: `user`, `isAuthenticated`, `login()`, `logout()`

**SPEC-AU-MA-012:** Context DEVE ser provider no nível do portal

**SPEC-AU-MA-013:** Componentes PODEM consumir context via hook (ex: `useAuth()`)

### Protected Routes

**SPEC-AU-MA-014:** Módulos PODEM fornecer componente `<ProtectedRoute>`

**SPEC-AU-MA-015:** `<ProtectedRoute>` DEVE verificar autenticação

**SPEC-AU-MA-016:** `<ProtectedRoute>` PODE verificar permissões específicas

**SPEC-AU-MA-017:** Sem autenticação, DEVE redirecionar para login

**SPEC-AU-MA-018:** Sem permissão, DEVE exibir erro 403

---

## 11. Guest Authentication

### Objetivo

**SPEC-AU-GUEST-001:** Sistema DEVE suportar autenticação de usuários anônimos

**SPEC-AU-GUEST-002:** Usuários anônimos DEVEM poder acessar SSE e recursos públicos

**SPEC-AU-GUEST-003:** Guest JWT DEVE ser temporário e limitado

### Rota de Guest Authentication

**SPEC-AU-GUEST-004:** DEVE existir `/api/1/auth/guest`

**SPEC-AU-GUEST-005:** Rota DEVE usar método POST

**SPEC-AU-GUEST-006:** Rota NÃO DEVE exigir autenticação prévia

**SPEC-AU-GUEST-007:** Rota DEVE ser acessível sem credenciais

### Processamento

**SPEC-AU-GUEST-008:** Backend DEVE gerar `guestId` único

**SPEC-AU-GUEST-009:** `guestId` DEVE usar formato `guest_<uuid>`

**SPEC-AU-GUEST-010:** Backend DEVE gerar JWT com payload mínimo

**SPEC-AU-GUEST-011:** Backend NÃO DEVE armazenar guest user em banco de dados

### JWT Payload

**SPEC-AU-GUEST-012:** Payload DEVE incluir `sub` com valor `guestId`

**SPEC-AU-GUEST-013:** Payload DEVE incluir claim `guest: true`

**SPEC-AU-GUEST-014:** Payload DEVE incluir `iat` (issued at)

**SPEC-AU-GUEST-015:** Payload DEVE incluir `exp` (expiration)

**SPEC-AU-GUEST-016:** Payload DEVE incluir `iss` (issuer)

### Expiração

**SPEC-AU-GUEST-017:** Guest JWT DEVE expirar em 1 hora

**SPEC-AU-GUEST-018:** Expiração PODE ser configurável via `.env`

**SPEC-AU-GUEST-019:** Após expiração, novo guest JWT DEVE ser gerado

**SPEC-AU-GUEST-020:** Frontend PODE renovar guest JWT automaticamente

### Saída (Sucesso)

**SPEC-AU-GUEST-021:** DEVE retornar HTTP 200

**SPEC-AU-GUEST-022:** DEVE retornar campo `code` (string, "success")

**SPEC-AU-GUEST-023:** DEVE retornar campo `access_token` (string, JWT)

**SPEC-AU-GUEST-024:** DEVE retornar campo `token_type` (string, "Bearer")

**SPEC-AU-GUEST-025:** DEVE retornar campo `expires_in` (number, 3600)

**SPEC-AU-GUEST-026:** NÃO DEVE retornar `refresh_token`

### Limitações

**SPEC-AU-GUEST-027:** Guest users NÃO PODEM acessar recursos autenticados

**SPEC-AU-GUEST-028:** Guest users PODEM acessar SSE para eventos públicos

**SPEC-AU-GUEST-029:** Guest users PODEM acessar landing pages e recursos públicos

**SPEC-AU-GUEST-030:** Guest users NÃO PODEM executar operações de escrita

### Conversão para Usuário Autenticado

**SPEC-AU-GUEST-031:** Guest user DEVE poder fazer login

**SPEC-AU-GUEST-032:** Após login, guest JWT DEVE ser descartado

**SPEC-AU-GUEST-033:** Frontend DEVE trocar guest JWT por user JWT

**SPEC-AU-GUEST-034:** SSE DEVE reconectar com novo user JWT

**SPEC-AU-GUEST-035:** Estado de sessão PODE ser preservado durante conversão

### Segurança

**SPEC-AU-GUEST-036:** Guest JWT NÃO DEVE ter permissões elevadas

**SPEC-AU-GUEST-037:** Guest JWT DEVE ter permissões somente leitura

**SPEC-AU-GUEST-038:** Backend DEVE validar claim `guest: true` em rotas protegidas

**SPEC-AU-GUEST-039:** Recursos sensíveis DEVEM rejeitar guest JWT

**SPEC-AU-GUEST-040:** Rate limiting DEVE aplicar-se a guest users

---

## 12. SSO e 2FA (Futuro)

### Single Sign-On

**SPEC-AU-SSO-001:** SSO PODE ser adicionado no futuro

**SPEC-AU-SSO-002:** SSO DEVE ser implementado no Backbone

**SPEC-AU-SSO-003:** SSO PODE usar OAuth2, SAML ou outros protocolos

**SPEC-AU-SSO-004:** Módulos de Auth DEVEM adaptar UI para SSO

### Two-Factor Authentication

**SPEC-AU-2FA-001:** 2FA PODE ser adicionado no futuro

**SPEC-AU-2FA-002:** 2FA DEVE ser implementado no Backbone

**SPEC-AU-2FA-003:** 2FA PODE usar TOTP, SMS ou outros métodos

**SPEC-AU-2FA-004:** Rota `/api/1/auth/login` DEVE suportar segundo fator

**SPEC-AU-2FA-005:** Módulos de Auth DEVEM adaptar UI para 2FA

---

## 12. Segurança Geral

### HTTPS

**SPEC-AU-SG-001:** Produção DEVE usar HTTPS obrigatoriamente

**SPEC-AU-SG-002:** HTTP PODE ser usado apenas em desenvolvimento local

**SPEC-AU-SG-003:** Certificados SSL DEVEM ser válidos

### Rate Limiting

**SPEC-AU-SG-004:** Login DEVE ter rate limiting (ex: 5 tentativas / minuto)

**SPEC-AU-SG-005:** Rate limiting DEVE ser implementado no Backend ou Backbone

**SPEC-AU-SG-006:** IP bloqueado temporariamente após múltiplas falhas

### CORS

**SPEC-AU-SG-007:** Backend DEVE configurar CORS apropriadamente

**SPEC-AU-SG-008:** CORS DEVE permitir origem do Frontend

**SPEC-AU-SG-009:** CORS DEVE permitir credentials (cookies)

**SPEC-AU-SG-010:** CORS NÃO DEVE permitir `*` em produção

### Headers de Segurança

**SPEC-AU-SG-011:** Backend DEVE incluir header `X-Content-Type-Options: nosniff`

**SPEC-AU-SG-012:** Backend DEVE incluir header `X-Frame-Options: DENY`

**SPEC-AU-SG-013:** Backend DEVE incluir header `Strict-Transport-Security` (HSTS)

---

*Esta especificação define requisitos do sistema de autenticação. Implementação de eventos, configurações e módulos em especificações separadas.*