# SPEC-jqel-schema-sql.md

## Especificação: SQL Schema Mapping

### Escopo
Este documento especifica o campo `sqlMapping` que descreve como entidades e ações SDL mapeiam para estruturas SQL (tabelas, colunas, relacionamentos).

---

## 1. Definição

**SPEC-SQLMAP-DEF-001:** `sqlMapping` descreve tradução de entidade ou ação SDL para estruturas SQL

**SPEC-SQLMAP-DEF-002:** Estrutura diferente para entity vs action

**SPEC-SQLMAP-DEF-003:** Ver seção 2 (Entity Mapping) e seção 5 (Action Mapping)

---

## 2. Entity SQL Mapping

**SPEC-SQLMAP-ENT-001:** `sqlMapping` em entity define mapeamento da entidade para tabela(s) física(s)

**SPEC-SQLMAP-ENT-002:** Formato:
```json
{
  "sqlMapping": {
    "schema": "sac",
    "table": "TBusuario",
    "columns": { ... },
    "queryableFields": [...],
    "relationships": { ... }
  }
}
```

**SPEC-SQLMAP-ENT-003:** Campos obrigatórios: `table`, `columns`

**SPEC-SQLMAP-ENT-004:** Campo opcional: `schema` (schema do banco de dados)

### Schema do Banco

**SPEC-SQLMAP-SCH-001:** Campo `schema` especifica o schema do banco de dados (SQL Server, PostgreSQL, etc.)

**SPEC-SQLMAP-SCH-002:** Campo `schema` é OPCIONAL (padrão: schema padrão do banco ou dbo)

**SPEC-SQLMAP-SCH-003:** Quando presente, DEVE ser usado para qualificar nome da tabela

**SPEC-SQLMAP-SCH-004:** Exemplo:
```json
{
  "schema": "sac",
  "table": "TBusuario"
}
```
Gera SQL: `SELECT ... FROM [sac].[TBusuario]` (SQL Server) ou `SELECT ... FROM sac.TBusuario` (MySQL/PostgreSQL)

**SPEC-SQLMAP-SCH-005:** Se `schema` ausente, usa apenas nome da tabela:
```json
{
  "table": "usuarios"
}
```
Gera SQL: `SELECT ... FROM [usuarios]` ou `SELECT ... FROM usuarios`

### Tabela Principal

**SPEC-SQLMAP-TBL-001:** Campo `table` especifica nome da tabela física (sem schema)

**SPEC-SQLMAP-TBL-002:** Exemplo simples (sem schema):
```json
{
  "table": "TBusuario"
}
```

**SPEC-SQLMAP-TBL-003:** Exemplo com schema:
```json
{
  "schema": "sac",
  "table": "TBusuario"
}
```

### Mapeamento de Colunas

**SPEC-SQLMAP-COL-001:** Campo `columns` mapeia campos SDL para colunas SQL

**SPEC-SQLMAP-COL-002:** Estrutura simplificada (mesmo nome):
```json
{
  "columns": {
    "id": "id",
    "nome": "nome"
  }
}
```

**SPEC-SQLMAP-COL-003:** Estrutura detalhada (nomes diferentes):
```json
{
  "columns": {
    "id": {
      "column": "DFid_usuario",
      "type": "integer"
    },
    "nome": {
      "column": "DFnome_usuario",
      "type": "string"
    }
  }
}
```

**SPEC-SQLMAP-COL-004:** Se campo SDL = coluna SQL, ambos são idênticos

**SPEC-SQLMAP-COL-005:** Tipos suportados:
| Tipo | Descrição |
|------|-----------|
| `integer` | Número inteiro |
| `string` | Texto VARCHAR/CHAR |
| `boolean` | Boolean/Bit |
| `date` | Data DATE |
| `datetime` | Data e hora DATETIME/TIMESTAMP |
| `decimal` | Número com decimais |

**SPEC-SQLMAP-COL-006:** Campo `type` é opcional (padrão: inferido do SDL)

### Campos Consultáveis

**SPEC-SQLMAP-QRY-001:** Campo `queryableFields` lista campos que podem estar em WHERE/ORDER BY

**SPEC-SQLMAP-QRY-002:** DEVE ser array de strings

**SPEC-SQLMAP-QRY-003:** Campos indexados DEVEM estar em `queryableFields`

**SPEC-SQLMAP-QRY-004:** Campos com relacionamentos DEVEM estar em `queryableFields`

**SPEC-SQLMAP-QRY-005:** Demais campos: decisão manual do especificador

**SPEC-SQLMAP-QRY-006:** Exemplo:
```json
{
  "queryableFields": ["id", "nome", "email", "status", "criado_em"]
}
```

**SPEC-SQLMAP-QRY-007:** Se campo não está em `queryableFields` e usado em WHERE, transpiler retorna erro

### Relacionamentos

#### Definição Geral

**SPEC-SQLMAP-REL-001:** Campo `relationships` descreve relacionamentos com outras entidades

**SPEC-SQLMAP-REL-002:** DEVE ser objeto opcional (ausência = sem relacionamentos)

**SPEC-SQLMAP-REL-003:** Estrutura:
```json
{
  "relationships": {
    "nomoCampo": { ... }
  }
}
```

#### Relacionamento 1:1 (Um-para-Um)

**SPEC-SQLMAP-REL1TO1-001:** Tipo `"one"` indica um-para-um

**SPEC-SQLMAP-REL1TO1-002:** Estrutura:
```json
{
  "author": {
    "type": "one",
    "column": "author_id",
    "target": {
      "entity": "usuario",
      "schema": "app1"
    }
  }
}
```

**SPEC-SQLMAP-REL1TO1-003:** Campo `column` é a chave estrangeira na tabela atual

**SPEC-SQLMAP-REL1TO1-004:** Campo `target` identifica entidade alvo

#### Relacionamento 1:N (Um-para-Muitos / Array)

**SPEC-SQLMAP-REL1TON-001:** Tipo `"array"` indica um-para-muitos

**SPEC-SQLMAP-REL1TON-002:** Estrutura simples:
```json
{
  "comentarios": {
    "type": "array",
    "table": "TBcomment",
    "fk_source": "post_id",
    "target": {
      "entity": "comentario",
      "schema": "app1"
    }
  }
}
```

**SPEC-SQLMAP-REL1TON-003:** `table` é a tabela relacionada

**SPEC-SQLMAP-REL1TON-004:** `fk_source` é coluna na tabela relacionada que aponta para entidade atual

#### Relacionamento N:N (Muitos-para-Muitos / Junction)

**SPEC-SQLMAP-RELNTON-001:** Tipo `"array"` com junction table

**SPEC-SQLMAP-RELNTON-002:** Estrutura:
```json
{
  "tags": {
    "type": "array",
    "junction": {
      "table": "TBpost_tag",
      "fk_source": "post_id",
      "fk_target": "tag_id"
    },
    "target": {
      "entity": "tag",
      "schema": "app1"
    }
  }
}
```

**SPEC-SQLMAP-RELNTON-003:** `fk_source` aponta para entidade atual

**SPEC-SQLMAP-RELNTON-004:** `fk_target` aponta para entidade alvo

#### Target (Alvo do Relacionamento)

**SPEC-SQLMAP-RELTARGET-001:** Campo `target` DEVE conter `entity`

**SPEC-SQLMAP-RELTARGET-002:** Campo `schema` é opcional (padrão: mesmo schema)

---

## 3. Exemplo Completo - Entity Mapping

```json
{
  "sqlMapping": {
    "schema": "sac",
    "table": "TBusuario",
    "columns": {
      "id": {
        "column": "DFid_usuario",
        "type": "integer"
      },
      "nome": {
        "column": "DFnome_usuario",
        "type": "string"
      },
      "email": {
        "column": "DFemail",
        "type": "string"
      },
      "status": {
        "column": "DFstatus",
        "type": "string"
      },
      "criado_em": {
        "column": "data_criacao",
        "type": "datetime"
      }
    },
    "queryableFields": ["id", "nome", "email", "status", "criado_em"],
    "relationships": {
      "comentarios": {
        "type": "array",
        "table": "TBcomment",
        "fk_source": "DFid_usuario",
        "target": { "entity": "comentario", "schema": "app1" }
      },
      "tags": {
        "type": "array",
        "junction": {
          "table": "TBusuario_tag",
          "fk_source": "DFid_usuario",
          "fk_target": "DFid_tag"
        },
        "target": { "entity": "tag", "schema": "app1" }
      }
    }
  }
}
```

---

## 4. Action SQL Template

**SPEC-SQLMAP-ACT-001:** `sqlTemplate` em action define como executar a action no banco SQL

**SPEC-SQLMAP-ACT-002:** Campo simples (string) diferente de entity mapping

**SPEC-SQLMAP-ACT-003:** Valores possíveis:
| Valor | Significado |
|-------|-------------|
| `"select"` | Usa query-template select |
| `"insert"` | Usa query-template insert |
| `"update"` | Usa query-template update |
| `"delete"` | Usa query-template delete |
| `"upsert"` | Usa query-template upsert |
| `""` (vazio) | Pede template ao TemplateDriver |
| `null` | Pede template ao TemplateDriver |
| Ausente | Pede template ao TemplateDriver |

### Fluxo de Execução

**SPEC-SQLMAP-ACT-004:** Fluxo geral:
```
Action chega
  ↓
Caller tenta interceptar
  ├─ Sim → Processa fora do SQL (email, webhook, etc)
  └─ Não → Vai pro Transpiler
       ↓
       Transpiler verifica sqlTemplate
       ├─ query-template definida (select/insert/update/delete/upsert)?
       │   └─ Sim → Gera SQL usando query-template
       └─ Vazio, null ou ausente?
           └─ Pede template ao TemplateDriver
               ├─ Encontrou? → Retorna para Transpiler
               └─ Não encontrou? → Erro (action não mapeada)
```

### Query Templates

**SPEC-SQLMAP-QT-001:** Query templates são estratégias padrão de geração SQL

**SPEC-SQLMAP-QT-002:** SELECT template:
- Lê entity mapping
- Aplica filtros WHERE
- Aplica ORDER BY
- Aplica LIMIT/OFFSET
- Aplica projeção (output/except)

**SPEC-SQLMAP-QT-003:** INSERT template:
- Insere registro em tabela principal
- Retorna dados inseridos (conforme supports)

**SPEC-SQLMAP-QT-004:** UPDATE template:
- Requer WHERE obrigatório (validação em Validator)
- Atualiza registro em tabela principal
- Retorna dados atualizados (conforme supports)

**SPEC-SQLMAP-QT-005:** DELETE template:
- Requer WHERE obrigatório (validação em Validator)
- Remove registro da tabela principal
- Retorna status de sucesso

**SPEC-SQLMAP-QT-006:** UPSERT template:
- INSERT ou UPDATE baseado em existência de chave primária
- Requer identificação de chave primária
- Retorna dados (conforme supports)

### TemplateDriver

**SPEC-SQLMAP-DRIVER-001:** TemplateDriver é componente plugável que busca templates customizados

**SPEC-SQLMAP-DRIVER-002:** Utilizado quando `sqlTemplate` não especifica query-template

**SPEC-SQLMAP-DRIVER-003:** Recebe: `schema`, `entity`, `operation`, `action`

**SPEC-SQLMAP-DRIVER-004:** Retorna: SQL string ou null (se não encontrado)

**SPEC-SQLMAP-DRIVER-005:** Implementações possíveis:
- Filesystem (arquivos .sql)
- MongoDB (collection de templates)
- Cache em memória
- API remota
- Qualquer fonte de dados

**SPEC-SQLMAP-DRIVER-006:** Naming convention sugerida: `{operation}.{entity}.{action_name}.sql`

**SPEC-SQLMAP-DRIVER-007:** Exemplos:
- `select.usuario.ativas.sql`
- `mutate.usuario.activate.sql`
- `mutate.usuario.notify_by_email.sql`

---

## 5. Resultado e Metadados

**SPEC-SQLMAP-RES-001:** Todas as SQLs retornam resultados tratados por JqelResultBuilder

**SPEC-SQLMAP-RES-002:** SQL (query-template ou customizada) pode retornar metadados usando notação `status.*`

**SPEC-SQLMAP-RES-003:** Campos de status:
| Campo | Obrigatório | Descrição |
|-------|-------------|-----------|
| `status.code` | Sim (se houver metadados) | Código HTTP |
| `status.message` | Não | Mensagem descritiva |
| `status.field` | Não | Campo relacionado ao status |
| `status.data` | Não | Dados estruturados em JSON |
| `status.warnings` | Não | Avisos em JSON array |

### Detecção de Metadados

**SPEC-SQLMAP-RES-004:** Se primeira coluna resultado é `status.code`, JqelResultBuilder trata como metadados

**SPEC-SQLMAP-RES-005:** Se primeira coluna não é `status.code`, resultado é tratado como data array

### Exemplo: Status Simples

**SPEC-SQLMAP-RES-006:** SQL que retorna apenas status:
```sql
SELECT 
  404 AS "status.code",
  'Usuário não encontrado' AS "status.message"
```

### Exemplo: Status com Dados

**SPEC-SQLMAP-RES-007:** SQL que retorna status e dados estruturados:
```sql
SELECT 
  200 AS "status.code",
  'Processamento iniciado' AS "status.message",
  JSON_ARRAY(
    JSON_OBJECT('id', u.id, 'nome', u.nome)
  ) AS "status.data"
FROM usuarios u
WHERE u.id = ?
```

### Exemplo: Dados Simples

**SPEC-SQLMAP-RES-008:** SQL que retorna apenas dados (sem status):
```sql
SELECT id, nome, email FROM usuarios WHERE status = 'ativo'
```

Resultado:
```json
{
  "code": 200,
  "data": [
    { "id": 1, "nome": "João", "email": "joao@example.com" }
  ]
}
```

---

## 6. Validação

**SPEC-SQLMAP-VAL-001:** Para Entity Mapping:
- Campos obrigatórios: `table`, `columns`
- `columns` DEVE ser objeto não-vazio
- `queryableFields` DEVE referenciar campos em `columns`
- Targets DEVEM referenciar entidades válidas

**SPEC-SQLMAP-VAL-002:** Para Action Template:
- `sqlTemplate` DEVE ser: query-template válida, string vazia, null, ou ausente
- Se query-template não encontrada e TemplateDriver retorna null → erro

---

## 7. Exemplos Completos

### Action com Query-Template

```json
{
  "name": "select.usuario",
  "schema": "app1",
  "entity": "usuario",
  "operation": "select",
  "sqlTemplate": "select"
}
```

Transpiler gera automaticamente usando query-template select:
```sql
SELECT DFid_usuario as id, DFnome_usuario as nome, ... 
FROM TBusuario 
WHERE DFstatus = ?
ORDER BY DFnome_usuario ASC
LIMIT 10
```

### Action com Template Customizado

```json
{
  "name": "select.usuario.ativas",
  "schema": "app1",
  "entity": "usuario",
  "operation": "select",
  "sqlTemplate": ""
}
```

TemplateDriver busca: `select.usuario.ativas.sql`

```sql
SELECT 
  DFid_usuario as id,
  DFnome_usuario as nome,
  COUNT(*) OVER () as total_registros
FROM TBusuario
WHERE DFstatus = 'ativo'
ORDER BY data_criacao DESC
```

### Action sem SQL Template

```json
{
  "name": "mutate.usuario.notify_by_email",
  "schema": "app1",
  "entity": "usuario",
  "operation": "mutate"
}
```

Sem `sqlTemplate` definida → Caller pode interceptar e processar em contexto externo (email, webhook, etc)

---

## 8. Diferenças Entity Mapping vs Action Template

| Aspecto | Entity (`sqlMapping`) | Action (`sqlTemplate`) |
|---------|--------|--------|
| Onde fica | Dentro de entity | Objeto isolado |
| Estrutura | Objeto complexo (table, columns, relationships) | String simples ou ausente |
| Objetivo | Descrever tabela física | Descrever como executar operação |
| Valores | N/A | query-template ou TemplateDriver |
| Customização | Via relationships | Via TemplateDriver |

---

*Especificação de mapeamento SQL para transpilação JQEL. Ver SPEC-jqel-schema.md para definição de entidades e ações.*