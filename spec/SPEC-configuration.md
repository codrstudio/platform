# SPEC-configuration.md

## Especificação: Configuração da Plataforma

### Escopo
Este documento define os requisitos de configuração da plataforma, incluindo Platform Settings, variáveis de ambiente, segurança e persistência.

---

## 1. Tipos de Configuração

### Definições

**SPEC-CF-TI-001:** A plataforma DEVE distinguir entre dois tipos de configuração

**SPEC-CF-TI-002:** Platform Settings: configurações de infraestrutura e arquitetura

**SPEC-CF-TI-003:** Application Settings: configurações de portais, módulos e instâncias

**SPEC-CF-TI-004:** Ambos os tipos têm propósitos, armazenamento e acesso diferentes

### Platform Settings

**SPEC-CF-TI-005:** Platform Settings são configurações estruturais da plataforma

**SPEC-CF-TI-006:** Platform Settings afetam funcionamento básico do sistema

**SPEC-CF-TI-007:** Platform Settings DEVEM ser definidas via arquivos `.env`

**SPEC-CF-TI-008:** Platform Settings NÃO DEVEM ser editáveis via interface web

**SPEC-CF-TI-009:** Alteração de Platform Settings DEVE requerer restart da aplicação

**SPEC-CF-TI-010:** Exemplos: URLs do n8n, secrets, credenciais Redis, JWT secret

### Application Settings

**SPEC-CF-TI-011:** Application Settings são configurações de portais/módulos/instâncias

**SPEC-CF-TI-012:** Application Settings DEVEM ser persistidas em arquivos JSON

**SPEC-CF-TI-013:** Application Settings DEVEM ser acessadas via JQEL

**SPEC-CF-TI-014:** Application Settings PODEM ser editadas via módulo Setup

**SPEC-CF-TI-015:** Alteração de Application Settings NÃO DEVE requerer restart

**SPEC-CF-TI-016:** Exemplos: portais ativos, módulos ativados, instâncias criadas, temas

---

## 2. Platform Settings (.env)

### Localização

**SPEC-CF-PS-001:** Arquivo `.env` DEVE estar na raiz do projeto Backend

**SPEC-CF-PS-002:** DEVE existir `.env.example` como template

**SPEC-CF-PS-003:** `.env` NÃO DEVE ser versionado em Git

**SPEC-CF-PS-004:** `.gitignore` DEVE incluir `.env`

**SPEC-CF-PS-005:** `.env.example` DEVE ser versionado com valores placeholder

### Formato

**SPEC-CF-PS-006:** Arquivo DEVE usar formato `KEY=value`

**SPEC-CF-PS-007:** Uma variável por linha

**SPEC-CF-PS-008:** Comentários DEVEM usar `#`

**SPEC-CF-PS-009:** Valores com espaços DEVEM usar aspas: `KEY="value with spaces"`

**SPEC-CF-PS-010:** Não usar espaços ao redor do `=`

---

## 3. Variáveis de Ambiente Obrigatórias

### Backend

**SPEC-CF-VE-001:** `NODE_ENV` - Ambiente (development, staging, production)

**SPEC-CF-VE-002:** `PORT` - Porta do servidor Backend (ex: 3000)

**SPEC-CF-VE-003:** `FRONTEND_URL` - URL do Frontend (para CORS)

**SPEC-CF-VE-004:** `BACKEND_URL` - URL do Backend (para n8n chamar de volta)

### Backbone (n8n)

**SPEC-CF-VE-005:** `N8N_BASE_URL` - URL base do n8n (ex: https://n8n.example.com)

**SPEC-CF-VE-006:** `N8N_SHARED_SECRET` - Secret compartilhado para autenticação mútua

**SPEC-CF-VE-007:** `N8N_SHARED_SECRET` DEVE ter mínimo 32 caracteres

**SPEC-CF-VE-008:** `N8N_SHARED_SECRET` DEVE ser alfanumérico aleatório

### Redis

**SPEC-CF-VE-011:** `REDIS_DB` - Número do banco Redis (opcional, padrão: 0)

### Autenticação

**SPEC-CF-VE-012:** `JWT_SECRET` - Secret para assinar JWT

**SPEC-CF-VE-013:** `JWT_SECRET` DEVE ter mínimo 256 bits (32 bytes)

**SPEC-CF-VE-014:** `JWT_SECRET` DEVE ser aleatório e único por ambiente

**SPEC-CF-VE-015:** `JWT_ACCESS_TOKEN_EXPIRES_IN` - Tempo de expiração access token (ex: 15m)

**SPEC-CF-VE-016:** `JWT_REFRESH_TOKEN_EXPIRES_IN` - Tempo de expiração refresh token (ex: 7d)

### Segurança

**SPEC-CF-VE-017:** `PLATFORM_SHARED_SECRET` - Secret para n8n → Plataforma

**SPEC-CF-VE-018:** `PLATFORM_SHARED_SECRET` DEVE ser igual a `N8N_SHARED_SECRET`

**SPEC-CF-VE-019:** `PLATFORM_SHARED_SECRET` DEVE ter mínimo 32 caracteres

---

## 4. Variáveis de Ambiente Opcionais

### Performance

**SPEC-CF-VEO-001:** `MAX_REQUEST_SIZE` - Tamanho máximo de requisição (padrão: 10mb)

**SPEC-CF-VEO-002:** `REQUEST_TIMEOUT` - Timeout de requisições (padrão: 30s)

**SPEC-CF-VEO-003:** `SSE_HEARTBEAT_INTERVAL` - Intervalo de heartbeat SSE (padrão: 30s)

### Logging

**SPEC-CF-VEO-004:** `LOG_LEVEL` - Nível de log (debug, info, warn, error, padrão: info)

**SPEC-CF-VEO-005:** `LOG_FORMAT` - Formato de log (json, text, padrão: json em produção)

### Cache

**SPEC-CF-VEO-006:** `CACHE_TTL_AUTH` - TTL cache de autorização (padrão: 5m)

**SPEC-CF-VEO-007:** `CACHE_TTL_JQEL` - TTL cache de queries JQEL (padrão: 1m)

### Rate Limiting

**SPEC-CF-VEO-008:** `RATE_LIMIT_LOGIN` - Tentativas de login por minuto (padrão: 5)

**SPEC-CF-VEO-009:** `RATE_LIMIT_API` - Requisições API por minuto (padrão: 100)

---

## 5. Configuração do n8n (.env do n8n)

### Variáveis para Integração

**SPEC-CF-N8-001:** `.env` do n8n DEVE incluir `PLATFORM_BASE_URL`

**SPEC-CF-N8-002:** `PLATFORM_BASE_URL` - URL do Backend da plataforma

**SPEC-CF-N8-003:** `.env` do n8n DEVE incluir `PLATFORM_SHARED_SECRET`

**SPEC-CF-N8-004:** `PLATFORM_SHARED_SECRET` DEVE ser igual ao do Backend

### Redis no n8n

**SPEC-CF-N8-005:** `.env` do n8n DEVE incluir `REDIS_URL` (mesmo Redis do Backend)

**SPEC-CF-N8-006:** n8n DEVE ter acesso ao mesmo Redis para publicar eventos

---

## 6. Autenticação Mútua (X-Platform-Key)

### Header de Segurança

**SPEC-CF-AM-001:** Comunicação Plataforma ↔ n8n DEVE usar header `X-Platform-Key`

**SPEC-CF-AM-002:** Valor do header DEVE ser o shared secret

**SPEC-CF-AM-003:** Header DEVE ser incluído em TODAS as requisições entre sistemas

### Backend → n8n

**SPEC-CF-AM-004:** Backend DEVE incluir `X-Platform-Key` ao chamar n8n

**SPEC-CF-AM-005:** Valor DEVE vir de `N8N_SHARED_SECRET`

**SPEC-CF-AM-006:** n8n DEVE validar header antes de processar

**SPEC-CF-AM-007:** Header inválido DEVE retornar HTTP 401

### n8n → Backend

**SPEC-CF-AM-008:** n8n DEVE incluir `X-Platform-Key` ao chamar Backend

**SPEC-CF-AM-009:** Valor DEVE vir de `PLATFORM_SHARED_SECRET` (mesmo valor)

**SPEC-CF-AM-010:** Backend DEVE validar header antes de processar

**SPEC-CF-AM-011:** Header inválido DEVE retornar HTTP 401

### Validação

**SPEC-CF-AM-012:** Validação DEVE ser case-sensitive

**SPEC-CF-AM-013:** Validação DEVE usar comparação constant-time (evitar timing attacks)

**SPEC-CF-AM-014:** Secret vazio ou ausente DEVE ser rejeitado

---

## 7. Application Settings (Persistência)

### Armazenamento

**SPEC-CF-AS-001:** Application Settings DEVEM ser armazenadas em arquivos JSON

**SPEC-CF-AS-002:** Arquivos PODEM estar em `/config` no Backend

**SPEC-CF-AS-003:** Estrutura exata (um ou múltiplos arquivos) fica a critério da implementação

**SPEC-CF-AS-004:** Arquivos DEVEM ser legíveis e editáveis manualmente (emergências)

### Acesso

**SPEC-CF-AS-005:** Application Settings DEVEM ser acessadas via JQEL

**SPEC-CF-AS-006:** Application Settings NÃO DEVEM ser acessadas diretamente pelo Frontend

**SPEC-CF-AS-007:** Schema JQEL DEVE ser `backend` ou `system`

**SPEC-CF-AS-008:** Backend DEVE processar queries para Application Settings

### Exemplo de Estrutura

**SPEC-CF-AS-009:** Estrutura conceitual (pode variar):
```json
{
  "portals": {
    "main": {
      "id": "main",
      "route": "/",
      "removable": false,
      "settingsKey": "default",
      "modules": []
    },
    "setup": {
      "id": "setup",
      "route": "/setup",
      "removable": true,
      "settingsKey": "default",
      "modules": ["setup"]
    }
  },
  "modules": {
    "setup": {
      "instances": {
        "setup_default": {
          "config": {}
        }
      }
    }
  }
}
```

### Edição

**SPEC-CF-AS-010:** Edição DEVE ser via módulo Setup (UI)

**SPEC-CF-AS-011:** Edição DEVE usar mutations JQEL

**SPEC-CF-AS-012:** Edição manual de arquivos JSON PODE ser feita (em produção, requer cuidado)

**SPEC-CF-AS-013:** Após edição manual, Backend DEVE recarregar configurações

**SPEC-CF-AS-014:** Respostas HTML DEVEM usar estratégia de cache network-first para refletir mudanças de configuração

**SPEC-CF-AS-015:** Service Worker DEVE buscar HTML atualizado da rede após mutations de configuração

---

## 8. Configurações Opcionais do Frontend (/config/*.json)

### Propósito

**SPEC-CF-FE-001:** Frontend PODE ter arquivos de configuração em `/config/*.json`

**SPEC-CF-FE-002:** Esses arquivos são para a PLATAFORMA React, NÃO para portais/módulos

**SPEC-CF-FE-003:** Configurações de portais/módulos DEVEM usar JQEL, NÃO esses arquivos

**SPEC-CF-FE-004:** Uso é OPCIONAL - pode não existir

### Exemplos Válidos

**SPEC-CF-FE-005:** Configurações de acessibilidade da plataforma

**SPEC-CF-FE-006:** Preferências de UI da plataforma (não do usuário)

**SPEC-CF-FE-007:** Feature flags da plataforma

**SPEC-CF-FE-008:** Constantes de configuração técnica

### Exemplos Inválidos

**SPEC-CF-FE-009:** NÃO usar para portais

**SPEC-CF-FE-010:** NÃO usar para módulos

**SPEC-CF-FE-011:** NÃO usar para instâncias

**SPEC-CF-FE-012:** NÃO usar para dados de usuários

### Acesso

**SPEC-CF-FE-013:** Arquivos DEVEM ser servidos via rota `/config/*.json`

**SPEC-CF-FE-014:** Arquivos DEVEM ser JSON válido

**SPEC-CF-FE-015:** Frontend PODE fazer fetch desses arquivos na inicialização

**SPEC-CF-FE-016:** Erros ao carregar DEVEM ser tratados gracefully (usar defaults)

---

## 9. Módulo Setup - Visualização de Platform Settings

### Interface Read-Only

**SPEC-CF-MS-001:** Módulo Setup PODE incluir aba "Platform Settings"

**SPEC-CF-MS-002:** Aba DEVE exibir Platform Settings atuais

**SPEC-CF-MS-003:** Aba DEVE ser READ-ONLY (não editável)

**SPEC-CF-MS-004:** Aba DEVE incluir mensagem clara sobre como editar

### Informações Exibidas

**SPEC-CF-MS-005:** DEVE mostrar: `N8N_BASE_URL`

**SPEC-CF-MS-006:** DEVE mostrar: `REDIS_URL` (mascarar senha se presente)

**SPEC-CF-MS-007:** DEVE mostrar: `NODE_ENV`

**SPEC-CF-MS-008:** NÃO DEVE mostrar: secrets (`JWT_SECRET`, `N8N_SHARED_SECRET`, etc)

**SPEC-CF-MS-009:** PODE mostrar: configurações não-sensíveis

### Health Check

**SPEC-CF-MS-010:** DEVE incluir indicadores de saúde das conexões

**SPEC-CF-MS-011:** Indicador n8n: conectado/desconectado

**SPEC-CF-MS-012:** Indicador Redis: conectado/desconectado

**SPEC-CF-MS-013:** Health checks DEVEM ser via requisições ao Backend

### Mensagem ao Usuário

**SPEC-CF-MS-014:** DEVE exibir mensagem:
> "Estas configurações são definidas no arquivo `.env` no servidor. Alterações requerem edição manual do arquivo e restart da aplicação."

**SPEC-CF-MS-015:** PODE incluir link para documentação

---

## 10. Segurança de Configurações

### Secrets

**SPEC-CF-SEC-001:** Secrets NUNCA DEVEM ser expostos ao Frontend

**SPEC-CF-SEC-002:** Secrets NUNCA DEVEM estar em logs

**SPEC-CF-SEC-003:** Secrets NUNCA DEVEM ser versionados em Git

**SPEC-CF-SEC-004:** Secrets DEVEM ser diferentes em cada ambiente (dev/staging/prod)

### Acesso a .env

**SPEC-CF-SEC-005:** Arquivo `.env` DEVE ter permissões restritas (600 ou 400)

**SPEC-CF-SEC-006:** Apenas usuário do processo DEVE ter acesso de leitura

**SPEC-CF-SEC-007:** `.env` NÃO DEVE estar acessível via web

### Validação

**SPEC-CF-SEC-008:** Backend DEVE validar presença de variáveis obrigatórias na inicialização

**SPEC-CF-SEC-009:** Variável obrigatória ausente DEVE impedir inicialização

**SPEC-CF-SEC-010:** Backend DEVE logar erro claro indicando qual variável falta

**SPEC-CF-SEC-011:** Backend DEVE validar formato de URLs

**SPEC-CF-SEC-012:** Backend DEVE validar tamanho mínimo de secrets

### Rotação de Secrets

**SPEC-CF-SEC-013:** Rotação de `JWT_SECRET` DEVE invalidar todos os tokens

**SPEC-CF-SEC-014:** Rotação de `N8N_SHARED_SECRET` DEVE ser coordenada (atualizar ambos os lados)

**SPEC-CF-SEC-015:** Rotação DEVE ser documentada em procedimentos operacionais

---

## 11. Ambientes (Development, Staging, Production)

### Development

**SPEC-CF-ENV-001:** Development PODE usar HTTP (localhost)

**SPEC-CF-ENV-002:** Development PODE usar secrets simples

**SPEC-CF-ENV-003:** Development PODE ter logs verbosos (LOG_LEVEL=debug)

**SPEC-CF-ENV-004:** Development PODE desabilitar rate limiting

### Staging

**SPEC-CF-ENV-005:** Staging DEVE usar HTTPS

**SPEC-CF-ENV-006:** Staging DEVE usar secrets fortes (diferentes de prod)

**SPEC-CF-ENV-007:** Staging DEVE simular ambiente de produção

**SPEC-CF-ENV-008:** Staging PODE ter logs mais verbosos que produção

### Production

**SPEC-CF-ENV-009:** Production DEVE usar HTTPS obrigatoriamente

**SPEC-CF-ENV-010:** Production DEVE usar secrets fortes e únicos

**SPEC-CF-ENV-011:** Production DEVE ter `NODE_ENV=production`

**SPEC-CF-ENV-012:** Production DEVE ter `LOG_LEVEL=info` ou `warn`

**SPEC-CF-ENV-013:** Production DEVE ter rate limiting habilitado

**SPEC-CF-ENV-014:** Production DEVE ter monitoring habilitado

---

## 12. Backup e Recuperação

### Application Settings

**SPEC-CF-BK-001:** Application Settings DEVEM ter backup regular

**SPEC-CF-BK-002:** Backup DEVE incluir todos os arquivos JSON de configuração

**SPEC-CF-BK-003:** Backup DEVE ser versionado (manter histórico)

**SPEC-CF-BK-004:** Restauração DEVE ser simples (copiar arquivos + restart)

### Platform Settings

**SPEC-CF-BK-005:** Arquivo `.env` DEVE ter backup

**SPEC-CF-BK-006:** Backup de `.env` DEVE ser criptografado

**SPEC-CF-BK-007:** Backup de `.env` DEVE ter acesso restrito

**SPEC-CF-BK-008:** `.env.example` serve como template para recuperação

### Disaster Recovery

**SPEC-CF-BK-009:** Documentação DEVE incluir procedimento de recuperação completa

**SPEC-CF-BK-010:** Procedimento DEVE cobrir: reinstalação, restauração de configs, validação

---

## 13. Validação e Defaults

### Validação na Inicialização

**SPEC-CF-VA-001:** Backend DEVE validar todas as variáveis obrigatórias

**SPEC-CF-VA-002:** Validação DEVE acontecer antes de iniciar servidor

**SPEC-CF-VA-003:** Erro de validação DEVE logar mensagem clara

**SPEC-CF-VA-004:** Erro de validação DEVE impedir inicialização

### Valores Padrão

**SPEC-CF-VA-005:** Variáveis opcionais DEVEM ter defaults razoáveis

**SPEC-CF-VA-006:** Defaults DEVEM ser documentados

**SPEC-CF-VA-007:** Defaults DEVEM ser seguros (não comprometer segurança)

### Exemplo de Validação

**SPEC-CF-VA-008:** Validar que `N8N_BASE_URL` é URL válida

**SPEC-CF-VA-009:** Validar que `PORT` é número entre 1-65535

**SPEC-CF-VA-010:** Validar que `JWT_SECRET` tem tamanho mínimo

**SPEC-CF-VA-011:** Validar que `NODE_ENV` é um valor permitido

---

## 14. Documentação de Configurações

### README ou Docs

**SPEC-CF-DOC-001:** DEVE existir documentação de todas as variáveis de ambiente

**SPEC-CF-DOC-002:** Documentação DEVE incluir: nome, descrição, tipo, obrigatório/opcional, default

**SPEC-CF-DOC-003:** Documentação DEVE incluir exemplos

**SPEC-CF-DOC-004:** Documentação DEVE estar atualizada

### .env.example

**SPEC-CF-DOC-005:** `.env.example` DEVE listar todas as variáveis

**SPEC-CF-DOC-006:** `.env.example` DEVE incluir comentários explicativos

**SPEC-CF-DOC-007:** `.env.example` DEVE usar placeholders: `JWT_SECRET=your_secret_here`

**SPEC-CF-DOC-008:** `.env.example` NÃO DEVE conter secrets reais

---

*Esta especificação define requisitos de configuração da plataforma. Implementação de temas, módulos e rotas em especificações separadas.*