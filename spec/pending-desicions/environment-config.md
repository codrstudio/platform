# Pending Decision: Sequential Environment Configuration Loading

**Date**: 2025-11-05
**Status**: 🔄 PENDING APPROVAL
**Related SPEC**: SPEC-architecture.md, SPEC-environment.md (to be created)

---

## Context

Atualmente, a maioria dos sistemas Node.js carrega variáveis de ambiente de forma simultânea ou sobrescreve completamente um arquivo pelo outro. Isso cria limitações na configuração de diferentes ambientes (development, staging, production) pois:

### Problema Atual

1. **Configuração inflexível**: Não é possível definir a variável `environment` no próprio `.env` base e usar esse valor para carregar configurações específicas
2. **Duplicação**: Configurações comuns precisam ser duplicadas em cada arquivo `.env.{environment}`
3. **Ordem de precedência indefinida**: Quando ambos os arquivos existem, o comportamento pode variar dependendo da lib usada (dotenv, dotenv-expand, etc)
4. **Cenários específicos não suportados**: Em alguns casos (Docker, CI/CD), seria útil definir o `environment` no `.env` base e deixar o sistema carregar automaticamente o arquivo correto

### Cenário de Uso

```bash
# .env (base - sempre lido primeiro)
NODE_ENV=development
ENVIRONMENT=staging
DATABASE_HOST=localhost
REDIS_HOST=localhost

# .env.staging (lido depois, sobrescreve variáveis específicas)
DATABASE_HOST=staging-db.example.com
DATABASE_PASSWORD=staging-secret
REDIS_HOST=staging-redis.example.com
```

No cenário acima, o resultado final deve ser:
- `NODE_ENV=development` (do .env)
- `ENVIRONMENT=staging` (do .env)
- `DATABASE_HOST=staging-db.example.com` (sobrescrito pelo .env.staging)
- `DATABASE_PASSWORD=staging-secret` (do .env.staging)
- `REDIS_HOST=staging-redis.example.com` (sobrescrito pelo .env.staging)

---

## Proposed Solution

Implementar um sistema de carregamento **sequencial** de arquivos de configuração no backend:

### Fluxo de Carregamento

```
1. Backend inicia
2. Verifica se .env existe → Se sim, lê e carrega variáveis
3. Lê valor de process.env.ENVIRONMENT (pode vir de .env ou de variável de sistema)
4. Verifica se .env.{ENVIRONMENT} existe → Se sim, lê e sobrescreve/adiciona variáveis
5. Variáveis finais disponíveis em process.env
```

### Regras de Precedência

1. **Variáveis de sistema** (definidas no shell/Docker) têm precedência máxima
2. **Arquivo .env.{environment}** sobrescreve valores do .env base
3. **Arquivo .env** fornece valores padrão

### Ordem de Prioridade (maior para menor)

```
Variáveis de Sistema > .env.{environment} > .env
```

---

## Implementation Details

### Estrutura de Arquivos

```
src/prototype-X/backend/
├── .env                    # Configurações base + definição de ENVIRONMENT
├── .env.development        # Overrides para desenvolvimento local
├── .env.staging            # Overrides para staging
├── .env.production         # Overrides para produção
└── src/
    └── config/
        └── env.ts          # Carregador de ambiente (implementa lógica sequencial)
```

### Implementação: env.ts

**File**: `src/prototype-X/backend/src/config/env.ts`

```typescript
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Carrega variáveis de ambiente de forma sequencial:
 * 1. Carrega .env (se existir)
 * 2. Carrega .env.{ENVIRONMENT} (se existir)
 *
 * IMPORTANTE: Os arquivos são lidos sequencialmente, não simultaneamente.
 * O segundo arquivo sobrescreve valores do primeiro.
 */
export function loadEnvironment(): void {
  const rootDir = path.resolve(__dirname, '../../');

  // ETAPA 1: Carregar .env base (se existir)
  const baseEnvPath = path.join(rootDir, '.env');
  if (fs.existsSync(baseEnvPath)) {
    console.log('[ENV] Loading base .env file');
    dotenv.config({ path: baseEnvPath });
  } else {
    console.log('[ENV] No .env file found, skipping base config');
  }

  // ETAPA 2: Determinar ambiente
  // Prioridade: variável de sistema > .env file
  const environment = process.env.ENVIRONMENT || process.env.NODE_ENV || 'development';
  console.log(`[ENV] Detected environment: ${environment}`);

  // ETAPA 3: Carregar .env.{environment} (se existir)
  const envSpecificPath = path.join(rootDir, `.env.${environment}`);
  if (fs.existsSync(envSpecificPath)) {
    console.log(`[ENV] Loading environment-specific file: .env.${environment}`);
    // override: true permite sobrescrever variáveis já definidas
    dotenv.config({ path: envSpecificPath, override: true });
  } else {
    console.log(`[ENV] No .env.${environment} file found, using only base config`);
  }

  console.log('[ENV] Environment configuration loaded successfully');
}

/**
 * Valida que variáveis obrigatórias estão definidas
 */
export function validateEnvironment(requiredVars: string[]): void {
  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please check your .env files.`
    );
  }
}

/**
 * Exporta configuração tipada
 */
export const config = {
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  environment: process.env.ENVIRONMENT || 'development',

  // Database
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    name: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },

  // n8n
  n8n: {
    webhookBaseUrl: process.env.N8N_WEBHOOK_BASE_URL,
    apiKey: process.env.N8N_API_KEY,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
};
```

### Uso no app.ts

**File**: `src/prototype-X/backend/src/app.ts`

```typescript
import { loadEnvironment, validateEnvironment, config } from './config/env';

// IMPORTANTE: Carregar environment ANTES de qualquer outra importação
loadEnvironment();

// Validar variáveis obrigatórias
validateEnvironment([
  'DATABASE_HOST',
  'DATABASE_NAME',
  'DATABASE_USER',
  'DATABASE_PASSWORD',
  'REDIS_HOST',
  'N8N_WEBHOOK_BASE_URL',
  'JWT_SECRET',
]);

// Agora pode usar as variáveis com segurança
import express from 'express';
import { createRedisClient } from './services/redis';
// ... outras importações

const app = express();

// Server inicia com configuração carregada
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`Environment: ${config.environment}`);
  console.log(`Node environment: ${config.nodeEnv}`);
});
```

---

## Expected Behavior

### Cenário 1: Desenvolvimento Local

```bash
# .env
ENVIRONMENT=development
DATABASE_HOST=localhost

# .env.development
DATABASE_HOST=localhost
DATABASE_NAME=platform_dev
DATABASE_USER=dev_user
DATABASE_PASSWORD=dev_pass
```

**Resultado**:
- `ENVIRONMENT=development` (do .env)
- `DATABASE_HOST=localhost` (sobrescrito pelo .env.development, mas valor é igual)
- `DATABASE_NAME=platform_dev` (do .env.development)
- `DATABASE_USER=dev_user` (do .env.development)
- `DATABASE_PASSWORD=dev_pass` (do .env.development)

### Cenário 2: Staging via Docker

```bash
# .env
ENVIRONMENT=staging
DATABASE_HOST=localhost  # será sobrescrito

# .env.staging
DATABASE_HOST=staging-postgres.internal
DATABASE_NAME=platform_staging
DATABASE_PASSWORD=staging-secret-xyz
REDIS_HOST=staging-redis.internal
```

**Docker compose** não precisa definir `ENVIRONMENT` porque já está no .env:

```yaml
services:
  backend:
    environment:
      # Não precisa definir ENVIRONMENT, vai ler do .env
      # Pode sobrescrever apenas o que for específico do container
      PORT: 4000
```

**Resultado**:
- `ENVIRONMENT=staging` (do .env)
- `DATABASE_HOST=staging-postgres.internal` (sobrescrito pelo .env.staging)
- `DATABASE_NAME=platform_staging` (do .env.staging)
- `DATABASE_PASSWORD=staging-secret-xyz` (do .env.staging)
- `REDIS_HOST=staging-redis.internal` (do .env.staging)
- `PORT=4000` (sobrescrito por variável de sistema do Docker)

### Cenário 3: Production com Variáveis de Sistema

```bash
# .env
ENVIRONMENT=production
# Valores sensíveis NÃO devem estar aqui em produção

# .env.production
DATABASE_HOST=prod-postgres.internal
REDIS_HOST=prod-redis.internal
# Passwords vêm de variáveis de sistema (Kubernetes secrets, AWS Secrets Manager, etc)
```

**Sistema** define variáveis via secrets:

```bash
export DATABASE_PASSWORD=super-secret-prod-password
export JWT_SECRET=ultra-secret-jwt-key
```

**Resultado** (ordem de precedência):
- `ENVIRONMENT=production` (do .env)
- `DATABASE_HOST=prod-postgres.internal` (do .env.production)
- `REDIS_HOST=prod-redis.internal` (do .env.production)
- `DATABASE_PASSWORD=super-secret-prod-password` (variável de sistema - maior precedência)
- `JWT_SECRET=ultra-secret-jwt-key` (variável de sistema - maior precedência)

### Cenário 4: Arquivo .env.{environment} Não Existe

```bash
# .env
ENVIRONMENT=testing
DATABASE_HOST=localhost
DATABASE_NAME=platform_test

# Não existe .env.testing
```

**Resultado**:
- Sistema carrega apenas .env
- Log: `[ENV] No .env.testing file found, using only base config`
- Todas as variáveis vêm do .env base

---

## Benefits

### Flexibilidade
✅ **Configuração em camadas**: .env base + overrides específicos por ambiente
✅ **DRY principle**: Não duplicar configurações comuns em todos os arquivos
✅ **Cenários específicos**: Definir `ENVIRONMENT` no .env e carregar automaticamente
✅ **Múltiplos ambientes**: development, staging, production, testing, etc

### Segurança
✅ **Secrets em variáveis de sistema**: Produção não precisa ter secrets em arquivos
✅ **Ordem de precedência clara**: Variáveis de sistema > arquivo específico > base
✅ **Validação centralizada**: `validateEnvironment()` garante que vars obrigatórias existem
✅ **.env files no .gitignore**: Nenhum arquivo .env deve ser commitado

### Developer Experience
✅ **Comportamento previsível**: Ordem de carregamento clara e documentada
✅ **Logs informativos**: Mostra qual arquivo foi carregado
✅ **TypeScript support**: Config exportado com tipos
✅ **Fácil debugging**: `console.log(config)` mostra valores finais

### DevOps
✅ **Docker-friendly**: Funciona bem com docker-compose e Kubernetes
✅ **CI/CD-friendly**: Pode definir `ENVIRONMENT` via variável de sistema
✅ **Portabilidade**: Mesmo código funciona em todos os ambientes
✅ **Auditável**: Logs mostram de onde cada config veio

---

## Risks

### Confusão sobre Precedência

**Concern**: Desenvolvedores podem não entender qual arquivo tem prioridade

**Mitigation**:
- ✅ Documentar claramente no código (comentários)
- ✅ Logs informativos mostrando qual arquivo foi carregado
- ✅ README com exemplos de cada cenário
- ✅ Validação mostra erros claros quando variável falta

### Arquivos .env Commitados

**Concern**: Desenvolvedores podem commitar .env com secrets

**Mitigation**:
- ✅ `.env*` no .gitignore (exceto `.env.example`)
- ✅ Pre-commit hook validando que .env não está no commit
- ✅ Documentação clara sobre não commitar .env
- ✅ Usar `.env.example` como template (sem valores reais)

### Sobrescrever Acidentalmente

**Concern**: .env.{environment} pode sobrescrever valor importante sem querer

**Mitigation**:
- ✅ Logs mostram quando valor foi sobrescrito
- ✅ Comentários nos arquivos .env indicando variáveis sobrescritas
- ✅ Validação de variáveis obrigatórias
- ✅ Testes de integração verificam configuração correta

### Performance

**Concern**: Ler dois arquivos pode ser mais lento?

**Mitigation**:
- ✅ Arquivos são lidos apenas uma vez no startup (não runtime)
- ✅ Overhead é <10ms (negligível no startup)
- ✅ Configuração é cacheada em memória
- ✅ Não afeta performance de requests

---

## Spec Changes Required

Esta decisão requer criação de novo arquivo de especificação:

### Novo arquivo: SPEC-environment.md

Criar especificação detalhada sobre:

#### Seção: Environment Loading

**SPEC-ENV-LOAD-001**: Backend MUST load `.env` file first if it exists
**SPEC-ENV-LOAD-002**: Backend MUST load `.env.{ENVIRONMENT}` file second if it exists, where `{ENVIRONMENT}` is the value of `process.env.ENVIRONMENT`
**SPEC-ENV-LOAD-003**: Files MUST be loaded sequentially, NOT simultaneously
**SPEC-ENV-LOAD-004**: `.env.{ENVIRONMENT}` values MUST override `.env` values for same variables
**SPEC-ENV-LOAD-005**: System environment variables MUST have highest precedence (override file values)

#### Seção: Precedence Rules

**SPEC-ENV-PREC-001**: Precedence order MUST be (highest to lowest): System variables > `.env.{ENVIRONMENT}` > `.env`
**SPEC-ENV-PREC-002**: If variable is defined in multiple sources, highest precedence value MUST be used
**SPEC-ENV-PREC-003**: If `.env` does not exist, system SHOULD continue without error
**SPEC-ENV-PREC-004**: If `.env.{ENVIRONMENT}` does not exist, system SHOULD use only `.env` values

#### Seção: Environment Detection

**SPEC-ENV-DET-001**: `ENVIRONMENT` variable SHOULD be read from `process.env.ENVIRONMENT` first
**SPEC-ENV-DET-002**: If `ENVIRONMENT` is not set, system SHOULD fallback to `process.env.NODE_ENV`
**SPEC-ENV-DET-003**: If neither is set, system SHOULD default to `'development'`
**SPEC-ENV-DET-004**: Valid environment values SHOULD include: `development`, `staging`, `production`, `testing`

#### Seção: Validation

**SPEC-ENV-VAL-001**: Backend MUST validate required variables before starting server
**SPEC-ENV-VAL-002**: Missing required variables MUST throw error with clear message listing missing vars
**SPEC-ENV-VAL-003**: Validation MUST happen after all files are loaded
**SPEC-ENV-VAL-004**: Error message SHOULD suggest checking `.env` files

#### Seção: Logging

**SPEC-ENV-LOG-001**: System SHOULD log when `.env` file is loaded
**SPEC-ENV-LOG-002**: System SHOULD log when `.env.{ENVIRONMENT}` file is loaded
**SPEC-ENV-LOG-003**: System SHOULD log detected environment value
**SPEC-ENV-LOG-004**: System SHOULD log if expected file does not exist
**SPEC-ENV-LOG-005**: Logs MUST NOT contain sensitive values (passwords, secrets, keys)

#### Seção: Security

**SPEC-ENV-SEC-001**: `.env*` files MUST be in `.gitignore` (except `.env.example`)
**SPEC-ENV-SEC-002**: `.env.example` MUST NOT contain real secrets or passwords
**SPEC-ENV-SEC-003**: Production secrets SHOULD be provided via system environment variables
**SPEC-ENV-SEC-004**: Files MUST be stored with restricted permissions (600 or 400)

#### Seção: Type Safety

**SPEC-ENV-TYPE-001**: Configuration SHOULD be exported as typed object
**SPEC-ENV-TYPE-002**: Port numbers SHOULD be parsed as integers
**SPEC-ENV-TYPE-003**: Boolean values SHOULD be parsed correctly (`'true'` → `true`)
**SPEC-ENV-TYPE-004**: Default values SHOULD be provided for optional variables

### Atualização: SPEC-architecture.md

**Nova seção**: Backend - Environment Configuration

**SPEC-B-ENV-001**: Backend MUST use sequential environment file loading (`.env` then `.env.{ENVIRONMENT}`)
**SPEC-B-ENV-002**: Environment loading MUST happen before any other imports
**SPEC-B-ENV-003**: Configuration MUST be centralized in `src/config/env.ts`
**SPEC-B-ENV-004**: Application code SHOULD access config via typed `config` object, NOT `process.env` directly

---

## Alternatives Considered

### Alternative 1: Usar apenas NODE_ENV

**Pros**:
- Padrão do Node.js
- Amplamente conhecido

**Cons**:
❌ `NODE_ENV` é usado pelo próprio Node.js e muitas bibliotecas (express, webpack, etc)
❌ Conflito entre "ambiente de execução do Node" e "ambiente de deploy"
❌ Limitado a valores específicos (development, production)
❌ Não permite ambientes customizados (staging, testing, qa, etc)

**Conclusion**: `ENVIRONMENT` separado de `NODE_ENV` oferece mais flexibilidade

### Alternative 2: Usar dotenv-flow

**Pros**:
- Biblioteca pronta com essa funcionalidade
- Suporta `.env.local`, `.env.development.local`, etc

**Cons**:
❌ Dependência adicional
❌ Convenção de nomes mais complexa (muitos arquivos)
❌ Menos controle sobre ordem de precedência
❌ Curva de aprendizado

**Conclusion**: Implementação customizada é mais simples e clara para este projeto

### Alternative 3: Carregar apenas .env.{ENVIRONMENT}

**Pros**:
- Mais simples (um arquivo por ambiente)
- Não há sobrescrita

**Cons**:
❌ Duplicação massiva de configurações comuns
❌ Difícil manter sincronizado (ex: atualizar DATABASE_HOST em 4 arquivos)
❌ Não permite valores padrão
❌ Erro se desenvolvedor esquecer de criar `.env.development`

**Conclusion**: Abordagem em camadas reduz duplicação

### Alternative 4: Usar config service (Consul, etcd, etc)

**Pros**:
- Configuração centralizada
- Atualizações em runtime
- Auditoria

**Cons**:
❌ Infraestrutura adicional complexa
❌ Overkill para este projeto
❌ Dependência externa crítica
❌ Não funciona em desenvolvimento local sem setup

**Conclusion**: Arquivos .env são suficientes para esta plataforma

---

## Recommendation

**APPROVE** a implementação de carregamento sequencial de arquivos de ambiente (`.env` → `.env.{ENVIRONMENT}`).

**Reasoning**:
1. **Flexibilidade**: Permite definir `ENVIRONMENT` no .env e carregar automaticamente
2. **DRY**: Reduz duplicação de configurações comuns
3. **Segurança**: Suporta secrets via variáveis de sistema em produção
4. **Precedência clara**: Ordem bem definida e documentada
5. **Zero breaking changes**: Não afeta implementações existentes
6. **DevOps-friendly**: Funciona bem com Docker, Kubernetes, CI/CD
7. **Developer-friendly**: Comportamento previsível e bem documentado

---

## Next Steps (if approved)

### Phase 1: Implementação Base
1. ☐ Criar `src/backend/src/config/env.ts` com lógica de carregamento sequencial
2. ☐ Adicionar função `validateEnvironment()` para validação de vars obrigatórias
3. ☐ Exportar `config` object tipado com TypeScript
4. ☐ Adicionar logs informativos do processo de carregamento

### Phase 2: Integração
5. ☐ Atualizar `src/backend/src/app.ts` para chamar `loadEnvironment()` primeiro
6. ☐ Substituir `process.env` por `config` object em todo o código
7. ☐ Criar arquivos `.env.example`, `.env.development.example`, `.env.production.example`
8. ☐ Atualizar `.gitignore` para incluir `.env*` (exceto `.env*.example`)

### Phase 3: Documentação
9. ☐ Criar `SPEC-environment.md` com especificação completa
10. ☐ Atualizar `SPEC-architecture.md` (seção Backend - Environment Configuration)
11. ☐ Adicionar seção ao README do prototype explicando configuração de ambiente
12. ☐ Documentar cenários de uso (local, Docker, production)

### Phase 4: Validação
13. ☐ Testar cenário 1: desenvolvimento local
14. ☐ Testar cenário 2: staging via Docker
15. ☐ Testar cenário 3: production com variáveis de sistema
16. ☐ Testar cenário 4: arquivo .env.{environment} não existe
17. ☐ Validar logs e mensagens de erro

### Phase 5: Segurança
18. ☐ Adicionar pre-commit hook para prevenir commit de .env
19. ☐ Verificar permissões de arquivos .env (600)
20. ☐ Auditar código para garantir que secrets não aparecem em logs
21. ☐ Documentar best practices de segurança

---

## Implementation Example

### Estrutura Final

```
src/prototype-2/backend/
├── .env.example                 # Template (commitado)
├── .env.development.example     # Template dev (commitado)
├── .env.production.example      # Template prod (commitado)
├── .env                         # Local (gitignored)
├── .env.development             # Local (gitignored)
├── .gitignore                   # Inclui .env*
└── src/
    ├── config/
    │   └── env.ts              # Carregador sequencial
    └── app.ts                  # Usa loadEnvironment()
```

### Arquivo .env.example

```bash
# ENVIRONMENT CONFIGURATION
# Copy this file to .env and fill with your values

# Environment name (determines which .env.{ENVIRONMENT} file to load)
ENVIRONMENT=development

# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=platform_dev
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# n8n
N8N_WEBHOOK_BASE_URL=http://localhost:5678/webhook
N8N_API_KEY=your_n8n_api_key

# JWT
JWT_SECRET=your_jwt_secret_key_min_32_chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### Arquivo .env.production.example

```bash
# PRODUCTION ENVIRONMENT OVERRIDES
# This file is loaded AFTER .env if ENVIRONMENT=production

# Database (production values)
DATABASE_HOST=prod-postgres.internal
DATABASE_PORT=5432
# DATABASE_PASSWORD should come from system env var (Kubernetes secret)

# Redis (production values)
REDIS_HOST=prod-redis.internal
REDIS_PORT=6379
# REDIS_PASSWORD should come from system env var

# n8n (production webhook)
N8N_WEBHOOK_BASE_URL=https://n8n.yourdomain.com/webhook
# N8N_API_KEY should come from system env var

# JWT
# JWT_SECRET should come from system env var
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

---

## References

- **dotenv Documentation**: https://github.com/motdotla/dotenv
- **12-Factor App - Config**: https://12factor.net/config
- **Node.js Environment Best Practices**: https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
- **Docker Environment Variables**: https://docs.docker.com/compose/environment-variables/

---

## Questions for Discussion

1. **Naming**: A variável `ENVIRONMENT` é um bom nome ou deveria ser `APP_ENV`, `DEPLOY_ENV`, outro?

2. **Fallback**: Se nem `ENVIRONMENT` nem `NODE_ENV` estiverem definidos, defaultar para `'development'` é seguro?

3. **Validation**: Quais variáveis devem ser obrigatórias vs opcionais?

4. **Logging**: O nível de detalhe dos logs está adequado ou deveria ter mais/menos informação?

5. **Environments**: Além de `development`, `staging`, `production`, `testing` - há outros ambientes necessários?

6. **Override behavior**: Usar `override: true` do dotenv é adequado ou deveria ter lógica customizada de merge?

7. **Type conversion**: A conversão de tipos (string → number, string → boolean) deve ser automática ou manual?

8. **Secrets**: Em produção, TODAS as secrets devem vir de variáveis de sistema ou pode ter algumas no .env.production?
