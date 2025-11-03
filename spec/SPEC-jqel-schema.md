# SPEC-jqel-schema.md

## Especificação: JQEL Schema Definition Language (SDL)

### Escopo
Este documento especifica o formato SDL (Schema Definition Language) usado para definir schemas, entidades e ações disponíveis em sistemas baseados em JQEL.

---

## 1. Definição

### Propósito
SDL descreve formalmente quais queries e mutations são permitidas no sistema, suas capacidades e retornos esperados.

### Natureza
- Inspirado em W3C JSON Schema
- Simplificado para descrever operações JQEL
- Autodescritivo e validável
- Usado pelo Command Palette para descoberta

---

## 2. Estrutura Raiz

### Documento SDL

**SPEC-SDL-R-001:** Documento SDL DEVE ser objeto JSON

**SPEC-SDL-R-002:** Documento SDL DEVE conter três seções principais:
```json
{
  "schemas": [...],
  "entities": [...],
  "actions": [...]
}
```

**SPEC-SDL-R-003:** Todas as seções são obrigatórias (podem ser arrays vazios)

---

## 3. Seção: Schemas

### Definição

**SPEC-SDL-S-001:** Seção `schemas` lista todos os schemas disponíveis no sistema

**SPEC-SDL-S-002:** Formato:
```json
{
  "schemas": [
    { "name": "cia" },
    { "name": "sac" },
    { "name": "crm" }
  ]
}
```

### Propriedades de Schema

**SPEC-SDL-S-003:** Cada schema DEVE ter:
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `name` | string | Sim | Nome único do schema |

**SPEC-SDL-S-004:** Nome do schema DEVE ser:
- Minúsculas
- Sem espaços
- Alfanumérico (pode ter `-` ou `_`)

**SPEC-SDL-S-005:** Nome do schema DEVE ser único no documento

### Schemas Reservados

**SPEC-SDL-S-006:** Schemas reservados pela plataforma:
- `platform` - Processado pelo Backbone (configuração)
- `backend` - Processado pelo Backend (operações locais)
- `system` - Processado conforme configuração
- `frontend` - Bounce back (processado pelo próprio frontend)

**SPEC-SDL-S-007:** Schemas não-reservados são considerados schemas de aplicação

---

## 4. Seção: Entities

### Definição

**SPEC-SDL-E-001:** Seção `entities` define estruturas de dados disponíveis

**SPEC-SDL-E-002:** Formato:
```json
{
  "entities": [
    {
      "name": "role",
      "schema": "cia",
      "properties": { ... },
      "required": [...]
    }
  ]
}
```

### Propriedades de Entity

**SPEC-SDL-E-003:** Cada entity DEVE ter:
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `name` | string | Sim | Nome único da entidade no schema |
| `schema` | string | Sim | Schema ao qual pertence |
| `properties` | object | Sim | Definição dos campos (JSON Schema) |
| `required` | array | Não | Lista de campos obrigatórios |

**SPEC-SDL-E-004:** Nome da entity DEVE ser:
- Singular
- Minúsculas
- snake_case

**SPEC-SDL-E-005:** Schema referenciado DEVE existir na seção `schemas`

**SPEC-SDL-E-006:** Combinação `schema + name` DEVE ser única

### Properties (Campos da Entity)

**SPEC-SDL-E-007:** `properties` DEVE seguir JSON Schema standard

**SPEC-SDL-E-008:** Tipos suportados:
- `integer`
- `string`
- `boolean`
- `array`
- `object`

**SPEC-SDL-E-009:** Formato de property:
```json
{
  "properties": {
    "id": {
      "type": "integer",
      "description": "Identificador único"
    },
    "nome": {
      "type": "string",
      "description": "Nome completo"
    },
    "ativo": {
      "type": "boolean"
    },
    "tags": {
      "type": "array",
      "items": { "type": "string" }
    },
    "criado_em": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

**SPEC-SDL-E-010:** Campo `description` é opcional mas recomendado

**SPEC-SDL-E-011:** Campos com `format` específico DEVEM seguir padrões:
- `date-time` - ISO 8601
- `email` - RFC 5322
- `uri` - RFC 3986

### Required Fields

**SPEC-SDL-E-012:** `required` é array de strings

**SPEC-SDL-E-013:** Strings em `required` DEVEM corresponder a campos em `properties`

**SPEC-SDL-E-014:** Exemplo:
```json
{
  "properties": {
    "id": { "type": "integer" },
    "nome": { "type": "string" },
    "email": { "type": "string" }
  },
  "required": ["id", "nome"]
}
```

---

## 5. Seção: Actions

### Definição

**SPEC-SDL-A-001:** Seção `actions` define operações disponíveis

**SPEC-SDL-A-002:** Actions representam queries (SELECT) e mutations (MUTATE)

**SPEC-SDL-A-003:** Formato:
```json
{
  "actions": [
    {
      "name": "select.permission",
      "schema": "cia",
      "operation": "select",
      "entity": "permission",
      "supports": { ... },
      "returns": { ... }
    }
  ]
}
```

### Propriedades de Action

**SPEC-SDL-A-004:** Cada action DEVE ter:
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `name` | string | Sim | Nome único da action |
| `schema` | string | Sim | Schema da action |
| `operation` | enum | Sim | `"select"` ou `"mutate"` |
| `entity` | string | Sim | Nome da entidade alvo |
| `action` | string | Condicional* | Ação específica (ex: insert, update) |
| `supports` | object | Não | Capacidades JQEL suportadas |
| `returns` | object | Sim | Tipo de retorno (JSON Schema) |

*Obrigatório quando `operation: "mutate"`

### Nomenclatura de Actions

**SPEC-SDL-A-005:** Nome da action DEVE seguir formato:
- SELECT: `select.{entity}`
- MUTATE: `mutate.{entity}.{action}`

**SPEC-SDL-A-006:** Exemplos válidos:
- `select.role`
- `select.usuario`
- `mutate.usuario.insert`
- `mutate.usuario.update`
- `mutate.usuario.delete`

**SPEC-SDL-A-007:** Nome da action DEVE ser único no schema

### Operation

**SPEC-SDL-A-008:** `operation` DEVE ser exatamente `"select"` ou `"mutate"`

**SPEC-SDL-A-009:** `"select"` indica operação de leitura (query)

**SPEC-SDL-A-010:** `"mutate"` indica operação de escrita (mutation)

### Action (campo)

**SPEC-SDL-A-011:** Campo `action` é obrigatório quando `operation: "mutate"`

**SPEC-SDL-A-012:** Actions padrão para mutate:
- `insert` - Criar novo registro
- `update` - Atualizar registro existente
- `delete` - Remover registro
- `upsert` - Criar ou atualizar

**SPEC-SDL-A-013:** Actions customizadas são permitidas

**SPEC-SDL-A-014:** Exemplos de actions customizadas:
- `activate`
- `deactivate`
- `transfer`
- `reset_password`

---

## 6. Supports (Capacidades)

### Definição

**SPEC-SDL-SUP-001:** `supports` define quais parâmetros JQEL a action aceita

**SPEC-SDL-SUP-002:** `supports` é objeto opcional

**SPEC-SDL-SUP-003:** Se ausente, action não suporta parâmetros JQEL

### Valores Possíveis

**SPEC-SDL-SUP-004:** Cada capacidade pode ter:
| Valor | Significado |
|-------|-------------|
| `true` | Suporte total (todos os campos/valores) |
| `array` | Suporte restrito (apenas itens listados) |
| ausente | Não suporta |

### Capacidade: limit

**SPEC-SDL-SUP-005:** `limit` controla se aceita limitação de registros

**SPEC-SDL-SUP-006:** Formato:
```json
{ "limit": true }
```

**SPEC-SDL-SUP-007:** `limit: true` permite qualquer valor numérico

### Capacidade: orderBy

**SPEC-SDL-SUP-008:** `orderBy` controla ordenação de resultados

**SPEC-SDL-SUP-009:** Suporte total:
```json
{ "orderBy": true }
```

**SPEC-SDL-SUP-010:** Suporte restrito:
```json
{ "orderBy": ["id", "nome", "data_criacao"] }
```

**SPEC-SDL-SUP-011:** Array lista campos permitidos para ordenação

### Capacidade: output

**SPEC-SDL-SUP-012:** `output` controla projeção de campos (inclusão)

**SPEC-SDL-SUP-013:** Suporte total:
```json
{ "output": true }
```

**SPEC-SDL-SUP-014:** Suporte restrito:
```json
{ "output": ["id", "nome", "email", "status"] }
```

**SPEC-SDL-SUP-015:** Array lista campos que podem ser projetados

### Capacidade: except

**SPEC-SDL-SUP-016:** `except` controla projeção de campos (exclusão)

**SPEC-SDL-SUP-017:** Suporte total:
```json
{ "except": true }
```

**SPEC-SDL-SUP-018:** Suporte restrito:
```json
{ "except": ["senha_hash", "token"] }
```

**SPEC-SDL-SUP-019:** Array lista campos que podem ser excluídos

### Capacidade: values

**SPEC-SDL-SUP-020:** `values` define quais campos podem ser modificados

**SPEC-SDL-SUP-021:** Aplicável APENAS para `operation: "mutate"`

**SPEC-SDL-SUP-022:** Suporte total:
```json
{ "values": true }
```

**SPEC-SDL-SUP-023:** Suporte restrito:
```json
{ "values": ["nome", "email", "status"] }
```

**SPEC-SDL-SUP-024:** Array lista campos modificáveis

---

## 7. Returns (Tipo de Retorno)

### Definição

**SPEC-SDL-RET-001:** `returns` define tipo de dado retornado pela action

**SPEC-SDL-RET-002:** `returns` DEVE seguir JSON Schema standard

**SPEC-SDL-RET-003:** `returns` é obrigatório

### Array de Entidade

**SPEC-SDL-RET-004:** Formato para retornar lista de registros:
```json
{
  "returns": {
    "type": "array",
    "items": { "ref": "permission" }
  }
}
```

**SPEC-SDL-RET-005:** `ref` referencia entity definida

### Objeto Único

**SPEC-SDL-RET-006:** Formato para retornar objeto estruturado:
```json
{
  "returns": {
    "type": "object",
    "properties": {
      "count": { "type": "integer" },
      "success": { "type": "boolean" }
    }
  }
}
```

### Objeto Genérico

**SPEC-SDL-RET-007:** Formato para retorno flexível:
```json
{
  "returns": {
    "type": "object"
  }
}
```

### Referências (ref)

**SPEC-SDL-RET-008:** `ref` referencia entity por nome

**SPEC-SDL-RET-009:** Mesma schema (implícito):
```json
{
  "schema": "cia",
  "returns": {
    "type": "array",
    "items": { "ref": "permission" }
  }
}
```

**SPEC-SDL-RET-010:** Cross-schema (explícito):
```json
{
  "schema": "sac",
  "returns": {
    "type": "array",
    "items": { "ref": "cia:permission" }
  }
}
```

**SPEC-SDL-RET-011:** Formato cross-schema: `"{schema}:{entity}"`

**SPEC-SDL-RET-012:** Entity referenciada DEVE existir no documento SDL

---

## 8. Extensão: Searchable (Command Palette)

### Definição

**SPEC-SDL-SEARCH-001:** Actions PODEM ter campo `searchable` para integração com Command Palette

**SPEC-SDL-SEARCH-002:** `searchable` é objeto opcional

**SPEC-SDL-SEARCH-003:** Se ausente, action não aparece no Command Palette

### Estrutura

**SPEC-SDL-SEARCH-004:** Formato completo:
```json
{
  "searchable": {
    "enabled": true,
    "title": "Buscar Usuários",
    "description": "Pesquisa usuários por nome ou email",
    "keywords": ["user", "users", "pessoas"],
    "category": "dados",
    "icon": "users",
    "searchFields": ["nome", "email"],
    "searchOperator": "LIKE",
    "trigger": "/criar-usuario",
    "params": [...]
  }
}
```

### Campos de Searchable

**SPEC-SDL-SEARCH-005:** Campos disponíveis:
| Campo | Tipo | Obrigatório | Aplicável | Descrição |
|-------|------|-------------|-----------|-----------|
| `enabled` | boolean | Sim | Todos | Se aparece no Command Palette |
| `title` | string | Sim | Todos | Nome exibido |
| `description` | string | Não | Todos | Texto explicativo |
| `keywords` | array | Não | Todos | Termos de busca adicionais |
| `category` | string | Não | Todos | Agrupamento visual |
| `icon` | string | Não | Todos | Ícone lucide-react |
| `searchFields` | array | Não | SELECT | Campos usados na busca |
| `searchOperator` | string | Não | SELECT | Operador (LIKE, eq, etc) |
| `trigger` | string | Não | MUTATE | Comando (ex: /criar-portal) |
| `params` | array | Não | MUTATE | Parâmetros do comando |

### Searchable para SELECT

**SPEC-SDL-SEARCH-006:** SELECT searchable exemplo:
```json
{
  "name": "select.usuario",
  "operation": "select",
  "searchable": {
    "enabled": true,
    "title": "Usuários",
    "keywords": ["users", "pessoas"],
    "category": "dados",
    "searchFields": ["nome", "email"],
    "searchOperator": "LIKE"
  }
}
```

**SPEC-SDL-SEARCH-007:** `searchFields` define campos usados em WHERE

**SPEC-SDL-SEARCH-008:** `searchOperator` define como comparar (default: `"LIKE"`)

### Searchable para MUTATE

**SPEC-SDL-SEARCH-009:** MUTATE searchable exemplo:
```json
{
  "name": "mutate.portal.create",
  "operation": "mutate",
  "searchable": {
    "enabled": true,
    "title": "Criar Portal",
    "description": "Criar novo portal na plataforma",
    "category": "acoes",
    "trigger": "/criar-portal",
    "params": [
      {
        "name": "portalId",
        "type": "string",
        "required": true,
        "description": "ID único do portal",
        "placeholder": "ex: sac, app"
      }
    ]
  }
}
```

### Params (Parâmetros de Comando)

**SPEC-SDL-SEARCH-010:** `params` define parâmetros para comandos

**SPEC-SDL-SEARCH-011:** Estrutura de param:
```json
{
  "name": "portalId",
  "type": "string|enum|select|boolean|array",
  "required": true,
  "description": "ID único do portal",
  "placeholder": "ex: sac, app",
  "default": null,
  "options": ["claro", "escuro"],
  "source": {
    "schema": "platform",
    "entity": "module",
    "labelField": "name"
  }
}
```

**SPEC-SDL-SEARCH-012:** Tipos de parâmetro:
- `string` - Texto livre
- `enum` - Lista fixa (usa `options`)
- `select` - Busca dinâmica (usa `source`)
- `boolean` - Flag true/false
- `array` - Múltiplos valores

**SPEC-SDL-SEARCH-013:** `description` e `placeholder` são opcionais mas recomendados

---

## 9. Convenções

### Nomenclatura

**SPEC-SDL-CONV-001:** Schemas: minúsculas, sem espaços (ex: `cia`, `sac`, `crm`)

**SPEC-SDL-CONV-002:** Entities: singular, minúsculas (ex: `role`, `permission`, `usuario`)

**SPEC-SDL-CONV-003:** Actions: `operation.entity[.action]` (ex: `select.role`, `mutate.usuario.insert`)

**SPEC-SDL-CONV-004:** Properties: snake_case (ex: `role_id`, `data_criacao`)

### Ordem dos Campos

**SPEC-SDL-CONV-005:** Entity - ordem recomendada:
1. `name`
2. `schema`
3. `properties`
4. `required`

**SPEC-SDL-CONV-006:** Action - ordem recomendada:
1. `name`
2. `schema`
3. `operation`
4. `entity`
5. `action` (se aplicável)
6. `supports`
7. `returns`
8. `searchable` (se aplicável)

---

## 10. Validação

### Regras Obrigatórias

**SPEC-SDL-VAL-001:** Schema referenciado DEVE existir em `schemas`

**SPEC-SDL-VAL-002:** Entity referenciada em action DEVE existir em `entities`

**SPEC-SDL-VAL-003:** Referências cross-schema DEVEM usar formato `schema:entity`

**SPEC-SDL-VAL-004:** `supports` SÓ aceita valores `true` ou `array`

**SPEC-SDL-VAL-005:** Action name DEVE seguir formato `operation.entity[.action]`

**SPEC-SDL-VAL-006:** MUTATE DEVE ter campo `action` definido

**SPEC-SDL-VAL-007:** Campos em `required` DEVEM existir em `properties`

**SPEC-SDL-VAL-008:** Campos em `supports.orderBy` (array) DEVEM existir em entity

**SPEC-SDL-VAL-009:** Campos em `supports.output` (array) DEVEM existir em entity

**SPEC-SDL-VAL-010:** Campos em `supports.values` (array) DEVEM existir em entity

### Validação de Searchable

**SPEC-SDL-VAL-011:** Se `searchable.enabled: true`, campo `title` é obrigatório

**SPEC-SDL-VAL-012:** `searchFields` DEVEM referenciar campos da entity

**SPEC-SDL-VAL-013:** `trigger` DEVE começar com `/`

**SPEC-SDL-VAL-014:** `params[].name` DEVE corresponder a campo em `supports.values`

---

*Esta especificação define o formato SDL para descrição de schemas JQEL. Implementação e uso em outras especificações.*