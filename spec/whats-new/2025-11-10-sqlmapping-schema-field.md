# 2025-11-10: Campo `schema` em sqlMapping

## Contexto

Durante a implementação dos testes do JqelTranspiler, identificou-se que queries SQL geradas para SQL Server estavam falhando com erro "Invalid object name 'TBusuario'".

**Causa raiz**: No SQL Server, tabelas frequentemente pertencem a schemas específicos (como `sac`, `dbo`, etc.). O nome completo da tabela deveria ser `sac.TBusuario`, não apenas `TBusuario`.

## Mudança

### Antes (INCORRETO)

```json
{
  "sqlMapping": {
    "table": "TBusuario",
    "columns": { ... }
  }
}
```

Gerava SQL:
```sql
SELECT ... FROM [TBusuario]  -- ❌ Tabela não encontrada!
```

### Depois (CORRETO)

```json
{
  "sqlMapping": {
    "schema": "sac",
    "table": "TBusuario",
    "columns": { ... }
  }
}
```

Gera SQL:
```sql
SELECT ... FROM [sac].[TBusuario]  -- ✅ Tabela qualificada com schema
```

## Especificações Atualizadas

### SPEC-jqel-schema-sql.md

- **SPEC-SQLMAP-ENT-004**: Campo opcional `schema` adicionado
- **SPEC-SQLMAP-SCH-001 a 005**: Nova seção "Schema do Banco"
  - SCH-001: Define campo `schema`
  - SCH-002: Campo é opcional (padrão: schema padrão do banco)
  - SCH-003: Quando presente, DEVE qualificar nome da tabela
  - SCH-004: Exemplo com SQL gerado
  - SCH-005: Comportamento quando ausente

## Impacto

### Transpiler (JqelTranspiler.ts)

**PENDENTE**: O transpiler precisa ser atualizado para:

1. Ler campo `schema` de `sqlMapping`
2. Quando presente, qualificar tabela com schema:
   - SQL Server: `[schema].[table]`
   - MySQL: `schema.table` (sem backticks no schema)
   - PostgreSQL: `schema.table`

### Entities Atualizadas

- `coletivos:usuario` → `schema: "sac"`, `table: "TBusuario"`
- `coletivos:produto` → `schema: "sac"`, `table: "TBproduto"`
- `ciaprime:cliente` → sem schema (MySQL não usa)
- `ciaprime:pedido` → sem schema (MySQL não usa)

## Compatibilidade

**Retrocompatibilidade**: ✅ MANTIDA

Entities sem campo `schema` continuam funcionando normalmente. O campo é **opcional** e só é usado quando presente.

## Migração MongoDB

**Script criado**: `src/jqel-sql/migrations/001-add-schema-to-sqlmapping.ts`

Para executar a migração:

```bash
cd src/jqel-sql/migrations
npx tsx 001-add-schema-to-sqlmapping.ts
```

A migração atualiza:
- `coletivos:usuario` → adiciona `sqlMapping.schema = "sac"`
- `coletivos:produto` → adiciona `sqlMapping.schema = "sac"`

**Status**: ⏳ Pendente de execução

## Próximos Passos

1. [ ] **EXECUTAR MIGRAÇÃO**: Rodar script de migração no MongoDB
2. [ ] Implementar leitura do campo `schema` no JqelTranspiler
3. [ ] Atualizar SqlBuilder para qualificar tabelas com schema
4. [ ] Executar testes para validar correção

## Referências

- Issue: Testes falhando com "Invalid object name 'TBusuario'"
- SPEC: `spec/SPEC-jqel-schema-sql.md`
- Entities: `src/jqel-sql/sample-case/schemas/entities.json`
- Database: SQL Server DBcoletivos, schema `sac`
