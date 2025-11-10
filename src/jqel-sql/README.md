# JQEL Transpiler

Converte **JQEL** (JSON Query Expression Language) em **SQL** otimizado para múltiplos bancos de dados.

## Conceito

JQEL é uma linguagem declarativa agnóstica que descreve operações de dados. O transpiler traduz queries JQEL para SQL específico do banco (MySQL, SQL Server, etc), resolvendo automaticamente complexidades como JOINs, relacionamentos e estratégias de execução.

```json
// JQEL input
{
  "schema": "app1",
  "select": "usuario",
  "where": { "status": { "eq": "ativo" } },
  "options": { "limit": 10 }
}
```

```typescript
// SQL output
{
  "sql": "SELECT * FROM TBusuario WHERE DFstatus = ? LIMIT 10",
  "params": ["ativo"]
}
```

## Arquitetura

```
JqelTranspiler (orquestrador)
├─ Validator (validação opcional)
├─ Analyzer (análise semântica)
├─ Planner (estratégia de execução)
├─ SqlBuilder (construção SQL)
├─ Dialect (MySQL, SQL Server)
└─ TemplateDriver (queries customizadas)

JqelResultBuilder (normalização)
└─ Converte resultado do banco para JResult
```

## Uso

### 1. Inicializar

```typescript
import { JqelTranspiler } from './transpiler/JqelTranspiler'
import { FileSystemTemplateDriver } from './transpiler/TemplateDriver'

const transpiler = new JqelTranspiler({
  dialect: 'mysql',
  entityMappings: loadMappings(), // { 'schema:entity': { sqlMapping: {...} } }
  templateDriver: new FileSystemTemplateDriver('./sql-templates'),
  validateInput: false
})
```

### 2. Transpilar JQEL para SQL

```typescript
const jqel = {
  schema: 'app1',
  select: 'usuario',
  where: { email: { like: '%@gmail.com' } },
  options: { limit: 5, orderBy: [{ nome: 'asc' }] },
  output: ['id', 'nome', 'email']
}

const result = transpiler.transpile(jqel)

if (!result.success) {
  console.error(result.error)
  return
}

console.log(result.sql)    // SELECT ...
console.log(result.params) // ["@gmail.com"]
```

### 3. Executar e converter resultado

```typescript
import { JqelResultBuilder } from './builder/JqelResultBuilder'

const builder = new JqelResultBuilder('mysql')

const rows = await db.query(result.sql, result.params)
const jresult = builder.build(rows)

console.log(jresult)
// { code: 200, data: [...] }
```

## Entity Mapping

Define como entidades SDL mapeiam para tabelas SQL:

```json
{
  "app1:usuario": {
    "sqlMapping": {
      "table": "TBusuario",
      "columns": {
        "id": { "column": "DFid_usuario", "type": "integer" },
        "nome": { "column": "DFnome_usuario", "type": "string" },
        "email": { "column": "DFemail", "type": "string" }
      },
      "queryableFields": ["id", "nome", "email"],
      "relationships": {
        "comentarios": {
          "type": "array",
          "table": "TBcomment",
          "fk_source": "DFid_usuario",
          "target": { "entity": "comentario", "schema": "app1" }
        }
      }
    }
  }
}
```

## Query Templates vs Customizadas

### Query-Template (automático)

```json
{ "sqlMapping": "select" }  → Usa template SELECT
{ "sqlMapping": "insert" }  → Usa template INSERT
{ "sqlMapping": "update" }  → Usa template UPDATE
{ "sqlMapping": "delete" }  → Usa template DELETE
{ "sqlMapping": "upsert" }  → Usa template UPSERT
```

### Customizada (TemplateDriver)

```json
{ "sqlMapping": "" }  → Busca em TemplateDriver
{ }                   → Busca em TemplateDriver (omitido)
```

Estrutura de pasta:
```
sql-templates/
├─ app1/
│  ├─ select.usuario.ativas.sql
│  ├─ mutate.usuario.activate.sql
│  └─ ...
└─ app2/
   └─ ...
```

## Resultado com Metadados

SQL pode retornar metadados usando notação `status.*`:

```sql
SELECT 
  202 AS "status.code",
  'Processamento iniciado' AS "status.message",
  JSON_ARRAY(JSON_OBJECT('id', u.id)) AS "status.data"
FROM usuarios u
WHERE id = ?
```

JResult resultado:
```json
{
  "code": 202,
  "message": "Processamento iniciado",
  "data": [{ "id": 1 }]
}
```

## Tratamento de Erros

```typescript
const result = transpiler.transpile(jqel)

if (!result.success) {
  // Possíveis erros
  console.log(result.error)                // Mensagem principal
  console.log(result.validationErrors)     // Se validator ativado
}
```

Se análise falha e validator desativado, o transpiler reativa automaticamente para fornecer contexto.

## TemplateDriver Plugável

Implemente sua própria estratégia:

```typescript
export interface TemplateDriver {
  getTemplate(schema: string, entity: string, operation: string, action?: string): Promise<string | null>
}

// Exemplos incluídos:
// - FileSystemTemplateDriver (arquivos .sql)
// - MongoTemplateDriver (MongoDB collection)
// - CacheTemplateDriver (em memória)
```

## Drivers Suportados

- **MySQL** (`mysql`, `mysql2`)
- **PostgreSQL** (`pg`)
- **SQL Server** (`mssql`)
- **SQLite** (`better-sqlite3`)

---

**Veja:** `example.ts` para demonstração completa end-to-end.