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
- Usado para descoberta e apresentação de objetos

---

## 2. Estrutura

**SPEC-SDL-STR-001:** SDL é composto por três estruturas isoladas e independentes

**SPEC-SDL-STR-002:** Cada estrutura é um array de objetos:
```json
// schemas.json
[ { "name": "app1" }, { "name": "app2" } ]

// entities.json
[ { "name": "usuario", "schema": "app1", ... } ]

// actions.json
[ { "name": "select.usuario", "schema": "app1", "entity": "usuario", ... } ]
```

**SPEC-SDL-STR-003:** Cada arquivo pode ser processado independentemente

**SPEC-SDL-STR-004:** Actions referenciam entity e schema por nome (não aninhadas)

---

## 2.1. Convenção de Nomenclatura

**SPEC-SDL-NOM-001:** Todos os nomes (schemas, entities, actions) DEVEM usar snake_case

**SPEC-SDL-NOM-002:** Válido:
- `nome_da_acao`
- `nome_da_entidade`
- `app_principal`
- `select_usuarios_ativos`

**SPEC-SDL-NOM-003:** Inválido:
- `nomeDaAcao` (camelCase)
- `nome-da-acao` (kebab-case)
- `NomeDaEntidade` (PascalCase)

**SPEC-SDL-NOM-004:** Justificativa: Maximiza compatibilidade com diferentes data sources e target use cases, utilizando apenas minúsculas e sublinha que são amplamente suportados

---

## 3. Schemas

**SPEC-SDL-SCH-001:** Schemas definem domínios ou aplicações no sistema

**SPEC-SDL-SCH-002:** Formato:
```json
[
  { "name": "app1" },
  { "name": "app2" }
]
```

**SPEC-SDL-SCH-003:** Cada schema DEVE ter:
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `name` | string | Sim | Nome único do schema (snake_case) |

---

## 4. Entities

**SPEC-SDL-ENT-001:** Entities definem estruturas de dados (tabelas, collections, etc)

**SPEC-SDL-ENT-002:** Formato:
```json
[
  {
    "name": "usuario",
    "schema": "app1",
    "properties": { ... },
    "required": [...],
    "sqlMapping": { ... },
    "metadata": { ... }
  }
]
```

**SPEC-SDL-ENT-003:** Cada entity DEVE ter:
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `name` | string | Sim | Nome único da entidade (singular, snake_case) |
| `schema` | string | Sim | Schema ao qual pertence |
| `properties` | object | Sim | Campos (JSON Schema standard) |

**SPEC-SDL-ENT-004:** Campos opcionais:
- `required` - Array de campos obrigatórios
- `sqlMapping` - Mapeamento SQL (ver SPEC-jqel-schema-sql.md)
- `metadata` - Informações de apresentação

**SPEC-SDL-ENT-005:** Combinação `schema + name` DEVE ser única

---

## 5. Properties (Campos da Entity)

**SPEC-SDL-PRP-001:** `properties` DEVE seguir JSON Schema standard

**SPEC-SDL-PRP-002:** Tipos suportados:
| Tipo | Descrição |
|------|-----------|
| `integer` | Número inteiro |
| `string` | Texto |
| `boolean` | Verdadeiro/Falso |
| `array` | Lista de elementos |
| `object` | Objeto estruturado |

**SPEC-SDL-PRP-003:** Exemplo:
```json
{
  "properties": {
    "id": {
      "type": "integer",
      "description": "ID único"
    },
    "nome": {
      "type": "string",
      "description": "Nome completo"
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "criado_em": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

**SPEC-SDL-PRP-004:** Campo `required` lista campos obrigatórios (separado de properties):
```json
{
  "required": ["id", "nome", "email"]
}
```

### Formatos Suportados

**SPEC-SDL-FMT-001:** Campo `format` em properties especifica formato do dado

**SPEC-SDL-FMT-002:** Formatos JSON Schema standard:
| Format | Descrição |
|--------|-----------|
| `email` | RFC 5322 |
| `uri` | RFC 3986 |
| `url` | Alias para uri |
| `date` | ISO 8601 (YYYY-MM-DD) |
| `date-time` | ISO 8601 (YYYY-MM-DDTHH:MM:SSZ) |
| `time` | ISO 8601 (HH:MM:SS) |
| `uuid` | UUID v4 |

**SPEC-SDL-FMT-003:** Formatos adicionais:
| Format | Descrição |
|--------|-----------|
| `phone` | Telefone (formato variável por país) |
| `ipv4` | Endereço IPv4 |
| `ipv6` | Endereço IPv6 |
| `hex-color` | Cor em hexadecimal (#RRGGBB) |
| `json` | String contendo JSON válido |

**SPEC-SDL-FMT-004:** Formatos de documentos brasileiros:
| Format | Descrição |
|--------|-----------|
| `cpf` | CPF (formato XXX.XXX.XXX-XX) |
| `cnpj` | CNPJ (formato XX.XXX.XXX/XXXX-XX) |
| `rg` | RG (formato estadual variável) |
| `cep` | CEP (formato XXXXX-XXX) |
| `document` | Documento genérico (validator decide) |

**SPEC-SDL-FMT-005:** Exemplo com formatos:
```json
{
  "properties": {
    "email": { "type": "string", "format": "email" },
    "telefone": { "type": "string", "format": "phone" },
    "cpf": { "type": "string", "format": "cpf" },
    "cnpj": { "type": "string", "format": "cnpj" },
    "site": { "type": "string", "format": "uri" },
    "data_nascimento": { "type": "string", "format": "date" }
  }
}
```

---

## 6. Actions

**SPEC-SDL-ACT-001:** Actions definem operações (queries ou mutations) que podem ser executadas

**SPEC-SDL-ACT-002:** Actions são estruturas isoladas que referenciam entidades por nome

**SPEC-SDL-ACT-003:** Formato:
```json
[
  {
    "name": "select.usuario",
    "schema": "app1",
    "entity": "usuario",
    "operation": "select",
    "sqlTemplate": "select",
    "supports": { ... },
    "returns": { ... },
    "metadata": { ... }
  }
]
```

**SPEC-SDL-ACT-004:** Cada action DEVE ter:
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `name` | string | Sim | Nome único da action (snake_case) |
| `schema` | string | Sim | Schema ao qual pertence |
| `entity` | string | Sim | Entidade que a action opera |
| `operation` | enum | Sim | `"select"` ou `"mutate"` |
| `returns` | object | Sim | Tipo de retorno (JSON Schema) |

**SPEC-SDL-ACT-005:** Campos opcionais:
- `supports` - Capacidades JQEL suportadas
- `sqlTemplate` - Tipo de template SQL (ver SPEC-jqel-schema-sql.md)
- `metadata` - Informações de apresentação

### Nomenclatura

**SPEC-SDL-ACT-006:** Padrão de nomenclatura:
- SELECT: `select.{entity}` ou `select.{entity}.{action_name}`
- MUTATE: `mutate.{entity}.{action_name}`

**SPEC-SDL-ACT-007:** Exemplos:
- `select.usuario`
- `select.usuario.ativas`
- `mutate.usuario.insert`
- `mutate.usuario.activate`

### Operation

**SPEC-SDL-ACT-008:** `operation` DEVE ser `"select"` ou `"mutate"`

### sqlTemplate (em Action)

**SPEC-SDL-ACT-009:** Campo `sqlTemplate` define como executar a action no banco SQL

**SPEC-SDL-ACT-010:** Ver SPEC-jqel-schema-sql.md para definição completa de `sqlTemplate`

**SPEC-SDL-ACT-011:** Actions SEM `sqlTemplate` são válidas - serão interceptadas pelo caller e processadas em outro contexto (ex: API de email, webhook, etc)

**SPEC-SDL-ACT-012:** Exemplo de action sem sqlTemplate:
```json
{
  "name": "mutate.usuario.notify_by_email",
  "schema": "app1",
  "entity": "usuario",
  "operation": "mutate",
  "supports": {
    "where": {
      "properties": {
        "id": { "type": "integer", "operators": ["eq"] }
      },
      "required": ["id"]
    }
  },
  "returns": {
    "type": "object",
    "properties": {
      "email_sent": { "type": "boolean" }
    }
  }
}
```

---

## 7. Supports (Capacidades)

**SPEC-SDL-SUP-001:** Campo `supports` define quais parâmetros JQEL a action aceita

**SPEC-SDL-SUP-002:** Estrutura:
```json
{
  "supports": {
    "where": { ... },
    "values": { ... },
    "limit": boolean,
    "offset": boolean,
    "orderBy": array,
    "output": boolean,
    "except": boolean
  }
}
```

### Where (Filtros)

**SPEC-SDL-SUP-003:** Campo `where` define quais campos podem ser filtrados

**SPEC-SDL-SUP-004:** Estrutura com properties e required:
```json
{
  "where": {
    "properties": {
      "id": {
        "type": "integer",
        "operators": ["eq", "in"]
      },
      "nome": {
        "type": "string",
        "operators": ["like", "eq"]
      }
    },
    "required": ["id"]
  }
}
```

**SPEC-SDL-SUP-005:** Cada campo em `properties` pode ter:
- `type` - Tipo do dado (ver seção 5)
- `operators` - Array de operadores JQEL suportados (eq, ne, gt, gte, lt, lte, in, like, etc)

**SPEC-SDL-SUP-006:** Campo `required` lista campos obrigatórios em WHERE

**SPEC-SDL-SUP-007:** Se `where` ausente, action não suporta filtros

### Values (Modificação)

**SPEC-SDL-SUP-008:** Campo `values` define quais campos podem ser modificados (MUTATE)

**SPEC-SDL-SUP-009:** Estrutura com properties e required:
```json
{
  "values": {
    "properties": {
      "nome": { "type": "string" },
      "email": { "type": "string", "format": "email" },
      "status": {
        "type": "string",
        "enum": ["ativo", "inativo", "pendente"]
      }
    },
    "required": ["nome", "email"]
  }
}
```

**SPEC-SDL-SUP-010:** Cada campo em `properties` pode ter:
- `type` - Tipo do dado (ver seção 5)
- `format` - Formato específico (ver seção 5)
- `enum` - Valores permitidos (array)

**SPEC-SDL-SUP-011:** Campo `required` lista campos obrigatórios em VALUES

**SPEC-SDL-SUP-012:** Se `values` ausente, action não suporta modificação

### Pagination e Ordering

**SPEC-SDL-SUP-013:** `limit` - Boolean indicando suporte a limitação de registros

**SPEC-SDL-SUP-014:** `offset` - Boolean indicando suporte a paginação

**SPEC-SDL-SUP-015:** `orderBy` - Array de campos permitidos para ordenação
```json
{
  "orderBy": ["id", "nome", "criado_em"]
}
```

### Projection

**SPEC-SDL-SUP-016:** `output` - Boolean indicando suporte a projeção por inclusão

**SPEC-SDL-SUP-017:** `except` - Boolean indicando suporte a projeção por exclusão

### Exemplo Completo

**SPEC-SDL-SUP-018:** Exemplo de `supports`:
```json
{
  "supports": {
    "where": {
      "properties": {
        "id": {
          "type": "integer",
          "operators": ["eq", "in"]
        },
        "status": {
          "type": "string",
          "operators": ["eq"]
        }
      },
      "required": ["id"]
    },
    "values": {
      "properties": {
        "nome": { "type": "string" },
        "email": { "type": "string", "format": "email" },
        "status": { "type": "string" }
      },
      "required": ["nome", "email"]
    },
    "limit": true,
    "orderBy": ["id", "nome"],
    "output": true
  }
}
```

---

## 8. Returns (Tipo de Retorno)

**SPEC-SDL-RET-001:** Campo `returns` define tipo retornado (JSON Schema)

**SPEC-SDL-RET-002:** Formato array:
```json
{
  "returns": {
    "type": "array",
    "items": { "ref": "usuario" }
  }
}
```

**SPEC-SDL-RET-003:** Formato objeto:
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

---

## 9. Metadata (Apresentação)

**SPEC-SDL-META-001:** Campo `metadata` descreve como objeto é apresentado e descoberto

**SPEC-SDL-META-002:** Pode estar em entities ou actions

**SPEC-SDL-META-003:** Estrutura:
```json
{
  "metadata": {
    "discoverable": true,
    "severity": "normal",
    "title": "Buscar Usuários",
    "description": "Pesquisa usuários por nome ou email",
    "icon": "users",
    "keywords": ["user", "usuarios", "pessoas"],
    "categories": ["dados"]
  }
}
```

**SPEC-SDL-META-004:** Campos de metadata:
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `discoverable` | boolean | Sim | Se objeto pode ser pesquisado |
| `severity` | enum | Não | Semântica visual do objeto |
| `title` | string | Não | Nome amigável para apresentação |
| `description` | string | Não | Descrição completa |
| `icon` | string | Não | Ícone lucide-react |
| `keywords` | array | Não | Termos para busca (não visível) |
| `categories` | array | Não | Classificações (visível ao usuário) |

### Severity (Semântica Visual)

**SPEC-SDL-META-005:** Campo `severity` indica semântica visual do objeto

**SPEC-SDL-META-006:** Valores possíveis:
- `grayed` - Neutral (cinza)
- `normal` - Default (padrão)
- `information` - Info (azul)
- `highlight` - Attention (violeta)
- `success` - Positive (verde)
- `warning` - Preventive alert (amarelo)
- `concern` - Active issue (laranja)
- `error` - Failure (vermelho)
- `critical` - Severe failure (vermelho vibrante)

**SPEC-SDL-META-007:** Semântica:
- `grayed` - Neutral, sem ação necessária
- `normal` - Operação padrão
- `information` - Informação relevante
- `highlight` - Requer atenção do usuário
- `success` - Operação bem-sucedida
- `warning` - Alerta preventivo, algo pode dar ruim
- `concern` - Problema ativo, identificado mas controlável
- `error` - Falha, operação falhou
- `critical` - Falha crítica, falha severa no sistema

---

## 10. sqlMapping (Entity) e sqlTemplate (Action)

**SPEC-SDL-SQLMAP-001:** Campo `sqlMapping` em entities descreve mapeamento para SQL (opcional)

**SPEC-SDL-SQLMAP-002:** Campo `sqlTemplate` em actions descreve template SQL (opcional)

**SPEC-SDL-SQLMAP-003:** Estrutura e detalhes COMPLETOS em SPEC-jqel-schema-sql.md

**SPEC-SDL-SQLMAP-004:** Nota: `sqlMapping` (entity) é DIFERENTE de `sqlTemplate` (action) - consulte SPEC-jqel-schema-sql.md para ambos os casos

---

## 11. Exemplos Completos

### Schemas

```json
[
  { "name": "app1" },
  { "name": "app2" }
]
```

### Entities

```json
[
  {
    "name": "usuario",
    "schema": "app1",
    "properties": {
      "id": { "type": "integer" },
      "nome": { "type": "string" },
      "email": { "type": "string", "format": "email" },
      "telefone": { "type": "string", "format": "phone" },
      "cpf": { "type": "string", "format": "cpf" },
      "status": { "type": "string" },
      "criado_em": { "type": "string", "format": "date-time" }
    },
    "required": ["id", "nome", "email"],
    "metadata": {
      "discoverable": true,
      "severity": "normal",
      "title": "Usuário",
      "description": "Entidade de usuário do sistema",
      "icon": "user",
      "keywords": ["user", "person"],
      "categories": ["autenticação"]
    },
    "sqlMapping": { }
  }
]
```

### Actions

```json
[
  {
    "name": "select.usuario",
    "schema": "app1",
    "entity": "usuario",
    "operation": "select",
    "sqlTemplate": "select",
    "supports": {
      "where": {
        "properties": {
          "id": { "type": "integer", "operators": ["eq", "in"] },
          "nome": { "type": "string", "operators": ["like", "eq"] }
        },
        "required": []
      },
      "limit": true,
      "orderBy": ["id", "nome"],
      "output": true
    },
    "returns": {
      "type": "array",
      "items": { "ref": "usuario" }
    },
    "metadata": {
      "discoverable": true,
      "severity": "normal",
      "title": "Buscar Usuários",
      "icon": "search",
      "keywords": ["search", "list"],
      "categories": ["dados"]
    }
  },
  {
    "name": "mutate.usuario.insert",
    "schema": "app1",
    "entity": "usuario",
    "operation": "mutate",
    "sqlTemplate": "insert",
    "supports": {
      "values": {
        "properties": {
          "nome": { "type": "string" },
          "email": { "type": "string", "format": "email" },
          "telefone": { "type": "string", "format": "phone" },
          "cpf": { "type": "string", "format": "cpf" },
          "status": { "type": "string" }
        },
        "required": ["nome", "email"]
      }
    },
    "returns": {
      "type": "array",
      "items": { "ref": "usuario" }
    },
    "metadata": {
      "discoverable": true,
      "severity": "success",
      "title": "Criar Usuário",
      "icon": "user-plus",
      "keywords": ["novo", "add"],
      "categories": ["admin"]
    }
  },
  {
    "name": "mutate.usuario.delete",
    "schema": "app1",
    "entity": "usuario",
    "operation": "mutate",
    "sqlTemplate": "delete",
    "supports": {
      "where": {
        "properties": {
          "id": { "type": "integer", "operators": ["eq"] }
        },
        "required": ["id"]
      }
    },
    "returns": {
      "type": "object",
      "properties": {
        "deleted": { "type": "boolean" }
      }
    },
    "metadata": {
      "discoverable": true,
      "severity": "error",
      "title": "Deletar Usuário",
      "description": "Remove permanentemente usuário do sistema",
      "icon": "trash-2",
      "keywords": ["delete", "remove"],
      "categories": ["admin"]
    }
  }
]
```

---

*Especificação de schemas, entidades e ações JQEL. Mapeamento SQL em SPEC-jqel-schema-sql.md.*