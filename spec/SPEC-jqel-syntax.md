# SPEC-jqel-syntax.md

## Especificação: Sintaxe JQEL

### Escopo
Este documento especifica a sintaxe completa da linguagem JQEL (JSON Query Expression Language), incluindo estrutura de queries, operadores, formato de resposta e regras de validação.

---

## 1. Definição

### O que é JQEL

**SPEC-JQEL-DEF-001:** JQEL significa "JSON Query Expression Language"

**SPEC-JQEL-DEF-002:** JQEL é uma linguagem declarativa para consulta e manipulação de dados

**SPEC-JQEL-DEF-003:** Queries JQEL são objetos JSON válidos

**SPEC-JQEL-DEF-004:** JQEL é independente de banco de dados (abstração)

### Propósito

**SPEC-JQEL-DEF-005:** JQEL unifica acesso a dados em toda a plataforma

**SPEC-JQEL-DEF-006:** JQEL facilita validação, autorização e logging

**SPEC-JQEL-DEF-007:** JQEL abstrai implementação do backend/backbone

---

## 2. Estrutura Básica

### Campos da Query

**SPEC-JQEL-STR-001:** Query JQEL DEVE ser objeto JSON

**SPEC-JQEL-STR-002:** Estrutura completa:
```json
{
  "schema": string,
  "select": string | "mutate": string,
  "action": string?,
  "values": object?,
  "where": object?,
  "options": {
    "limit": number?,
    "offset": number?,
    "orderBy": array?
  },
  "output": array?,
  "except": array?
}
```

### Campos Obrigatórios

**SPEC-JQEL-STR-003:** Campo `schema` é OBRIGATÓRIO

**SPEC-JQEL-STR-004:** Campo `select` OU `mutate` é OBRIGATÓRIO

**SPEC-JQEL-STR-005:** `select` e `mutate` são mutuamente exclusivos

**SPEC-JQEL-STR-006:** Se `mutate`, campo `action` é OBRIGATÓRIO

---

## 3. Schema

### Definição

**SPEC-JQEL-SCH-001:** Schema identifica domínio ou fonte de dados

**SPEC-JQEL-SCH-002:** Schema DEVE ser string alfanumérica

**SPEC-JQEL-SCH-003:** Schema determina onde/como query é processada

### Schemas Reservados

**SPEC-JQEL-SCH-004:** Três schemas são reservados pela plataforma:
- `platform` - Processado pelo Backbone (n8n)
- `backend` - Processado pelo Backend (Express)
- `system` - Processado conforme configuração

**SPEC-JQEL-SCH-005:** Schemas não-reservados são schemas de aplicação

**SPEC-JQEL-SCH-006:** Schemas de aplicação são processados pelo Backbone

### Exemplos

**SPEC-JQEL-SCH-007:** Exemplos válidos:
```json
{ "schema": "sac" }
{ "schema": "crm" }
{ "schema": "platform" }
{ "schema": "backend" }
```

---

## 4. Entity (Entidade)

### Definição

**SPEC-JQEL-ENT-001:** Entity é nome da tabela/coleção alvo

**SPEC-JQEL-ENT-002:** Entity DEVE estar no singular

**SPEC-JQEL-ENT-003:** Entity DEVE ser string alfanumérica

**SPEC-JQEL-ENT-004:** Entity DEVE usar snake_case

### Exemplos

**SPEC-JQEL-ENT-005:** Correto:
```json
{ "select": "usuario" }
{ "select": "atendimento" }
{ "mutate": "chamado" }
```

**SPEC-JQEL-ENT-006:** Incorreto:
```json
{ "select": "usuarios" }     // Plural
{ "select": "Atendimento" }  // PascalCase
{ "mutate": "chamado-ativo" } // kebab-case
```

---

## 5. SELECT - Operações de Leitura

### Estrutura

**SPEC-JQEL-SEL-001:** SELECT usa campo `select` com nome da entidade

**SPEC-JQEL-SEL-002:** SELECT mínimo válido:
```json
{
  "schema": "sac",
  "select": "usuario"
}
```

### Action (Opcional)

**SPEC-JQEL-SEL-003:** SELECT PODE ter campo `action`

**SPEC-JQEL-SEL-004:** Action em SELECT permite transformações:
- Views
- Relatórios
- Agregações
- Formatos especiais

**SPEC-JQEL-SEL-005:** Exemplos de actions:
```json
{ "select": "atendimento", "action": "dashboard" }
{ "select": "vendas", "action": "relatorio_mensal" }
{ "select": "pedido", "action": "impressora_zebra" }
```

### Campos Opcionais

**SPEC-JQEL-SEL-006:** SELECT PODE incluir:
- `where` - Filtros
- `options` - Paginação e ordenação
- `output` - Projeção por inclusão
- `except` - Projeção por exclusão

---

## 6. MUTATE - Operações de Escrita

### Estrutura

**SPEC-JQEL-MUT-001:** MUTATE usa campo `mutate` com nome da entidade

**SPEC-JQEL-MUT-002:** Campo `action` é OBRIGATÓRIO em MUTATE

**SPEC-JQEL-MUT-003:** MUTATE mínimo válido:
```json
{
  "schema": "sac",
  "mutate": "usuario",
  "action": "insert",
  "values": { "nome": "João" }
}
```

### Actions Padrão

**SPEC-JQEL-MUT-004:** Actions padrão obrigatórias:
- `insert` - Criar novo registro
- `update` - Atualizar registro existente
- `delete` - Remover registro
- `upsert` - Atualizar ou inserir

**SPEC-JQEL-MUT-005:** Cada action tem semântica específica:

| Action | SQL Equivalente | Requer WHERE | Requer VALUES |
|--------|-----------------|--------------|---------------|
| insert | INSERT INTO | Não | Sim |
| update | UPDATE | Sim | Sim |
| delete | DELETE FROM | Sim | Não |
| upsert | MERGE | Não | Sim |

### Actions Customizadas

**SPEC-JQEL-MUT-006:** MUTATE PODE ter actions customizadas

**SPEC-JQEL-MUT-007:** Exemplos de actions customizadas:
```json
{ "mutate": "usuario", "action": "ativar" }
{ "mutate": "usuario", "action": "reset_senha" }
{ "mutate": "atendimento", "action": "transferir" }
```

### Campos Opcionais

**SPEC-JQEL-MUT-008:** MUTATE PODE incluir:
- `where` - Condições para update/delete
- `values` - Dados para insert/update/upsert
- `output` - Projeção da resposta
- `except` - Exclusão de campos da resposta

---

## 7. WHERE - Condições de Filtro

### Estrutura

**SPEC-JQEL-WHE-001:** WHERE é objeto JSON com condições

**SPEC-JQEL-WHE-002:** WHERE é opcional (ausência = sem filtro)

**SPEC-JQEL-WHE-003:** Estrutura básica:
```json
{
  "where": {
    "campo": { "operador": valor }
  }
}
```

### Operadores Relacionais

**SPEC-JQEL-WHE-004:** Operadores relacionais obrigatórios:

| Operador | Significado | Tipo |
|----------|-------------|------|
| `eq` | Igual | any |
| `ne` | Diferente | any |
| `gt` | Maior que | number, string, date |
| `gte` | Maior ou igual | number, string, date |
| `lt` | Menor que | number, string, date |
| `lte` | Menor ou igual | number, string, date |

**SPEC-JQEL-WHE-005:** Exemplos:
```json
{ "status": { "eq": "ativo" } }
{ "idade": { "gte": 18 } }
{ "prioridade": { "lt": 5 } }
{ "data_cadastro": { "gte": "2024-01-01" } }
```

### Operador de Conjunto

**SPEC-JQEL-WHE-006:** Operador `in` verifica pertencimento em lista

**SPEC-JQEL-WHE-007:** Sintaxe:
```json
{ "status": { "in": ["ativo", "pendente", "processando"] } }
```

**SPEC-JQEL-WHE-008:** Valor DEVE ser array

### Operador de Padrão

**SPEC-JQEL-WHE-009:** Operador `like` para pattern matching em strings

**SPEC-JQEL-WHE-010:** Wildcards:
- `%` - Zero ou mais caracteres
- `_` - Exatamente um caractere

**SPEC-JQEL-WHE-011:** Exemplos:
```json
{ "nome": { "like": "%Silva%" } }      // Contém
{ "email": { "like": "joao@%" } }      // Começa com
{ "codigo": { "like": "ABC_%" } }      // 4+ chars, inicia ABC
```

**SPEC-JQEL-WHE-012:** Case-insensitive (dependente do banco)

### Operadores Lógicos

#### AND (Implícito)

**SPEC-JQEL-WHE-013:** AND é implícito entre campos diferentes:
```json
{
  "status": { "eq": "ativo" },
  "idade": { "gte": 18 }
}
// SQL: WHERE status = 'ativo' AND idade >= 18
```

**SPEC-JQEL-WHE-014:** Múltiplos operadores no mesmo campo criam AND:
```json
{
  "idade": { "gte": 18, "lte": 65 }
}
// SQL: WHERE idade >= 18 AND idade <= 65
```

#### OR

**SPEC-JQEL-WHE-015:** Operador `or` é array de condições

**SPEC-JQEL-WHE-016:** Pelo menos uma condição deve ser verdadeira

**SPEC-JQEL-WHE-017:** Sintaxe:
```json
{
  "or": [
    { "status": { "eq": "ativo" } },
    { "status": { "eq": "pendente" } }
  ]
}
// SQL: WHERE status = 'ativo' OR status = 'pendente'
```

#### NOT

**SPEC-JQEL-WHE-018:** Operador `not` nega condição

**SPEC-JQEL-WHE-019:** Sintaxe:
```json
{
  "not": { "status": { "eq": "inativo" } }
}
// SQL: WHERE NOT (status = 'inativo')
```

### Intervalos

**SPEC-JQEL-WHE-020:** Múltiplos operadores relacionais no mesmo campo criam intervalo

**SPEC-JQEL-WHE-021:** Exemplos:
```json
// Intervalo inclusivo
{
  "data_cadastro": {
    "gte": "2024-01-01",
    "lte": "2024-12-31"
  }
}

// Intervalo exclusivo
{
  "preco": {
    "gt": 100,
    "lt": 500
  }
}

// Misto
{
  "idade": {
    "gte": 18,
    "ne": 21
  }
}
```

### Valores Especiais

**SPEC-JQEL-WHE-022:** NULL:
```json
{ "telefone": { "eq": null } }   // IS NULL
{ "telefone": { "ne": null } }   // IS NOT NULL
```

**SPEC-JQEL-WHE-023:** Boolean:
```json
{ "ativo": { "eq": true } }
{ "ativo": { "eq": false } }
```

**SPEC-JQEL-WHE-024:** Datas DEVEM usar ISO 8601:
```json
{ "data_cadastro": { "eq": "2024-01-15" } }
{ "data_hora": { "gte": "2024-01-15T10:00:00Z" } }
```

### Campos Relacionados

**SPEC-JQEL-WHE-025:** Campos relacionados usam notação de ponto:
```json
{
  "cliente.cidade": { "eq": "São Paulo" },
  "atendente.status": { "eq": "disponivel" }
}
```

---

## 8. OPTIONS - Configurações de Query

### Estrutura

**SPEC-JQEL-OPT-001:** OPTIONS é objeto com parâmetros de configuração

**SPEC-JQEL-OPT-002:** OPTIONS é opcional

**SPEC-JQEL-OPT-003:** Estrutura:
```json
{
  "options": {
    "limit": number,
    "offset": number,
    "orderBy": array
  }
}
```

### Limit

**SPEC-JQEL-OPT-004:** `limit` define número máximo de registros

**SPEC-JQEL-OPT-005:** `limit` DEVE ser inteiro positivo

**SPEC-JQEL-OPT-006:** Valor máximo recomendado: 1000

**SPEC-JQEL-OPT-007:** Exemplo:
```json
{ "options": { "limit": 50 } }
```

### Offset

**SPEC-JQEL-OPT-008:** `offset` define deslocamento inicial (paginação)

**SPEC-JQEL-OPT-009:** `offset` DEVE ser inteiro não-negativo

**SPEC-JQEL-OPT-010:** `offset` REQUER `orderBy` (SQL Server)

**SPEC-JQEL-OPT-011:** Exemplo:
```json
{ "options": { "limit": 10, "offset": 20 } }
```

### OrderBy

**SPEC-JQEL-OPT-012:** `orderBy` é array de objetos de ordenação

**SPEC-JQEL-OPT-013:** Cada objeto tem campo e direção

**SPEC-JQEL-OPT-014:** Direções válidas: `"asc"` e `"desc"`

**SPEC-JQEL-OPT-015:** Ordem no array determina prioridade

**SPEC-JQEL-OPT-016:** Estrutura:
```json
{
  "orderBy": [
    { "campo1": "direção" },
    { "campo2": "direção" }
  ]
}
```

**SPEC-JQEL-OPT-017:** Exemplos:
```json
// Ordenação simples
{ "orderBy": [{ "nome": "asc" }] }

// Ordenação múltipla
{
  "orderBy": [
    { "data_criacao": "desc" },
    { "nome_completo": "asc" }
  ]
}
```

**SPEC-JQEL-OPT-018:** Campos relacionados usam notação de ponto:
```json
{ "orderBy": [{ "cliente.nome": "asc" }] }
```

---

## 9. Projeção de Campos

### Output (Inclusão)

**SPEC-JQEL-PRJ-001:** `output` especifica campos a retornar

**SPEC-JQEL-PRJ-002:** `output` é array de strings

**SPEC-JQEL-PRJ-003:** `output` é opcional

**SPEC-JQEL-PRJ-004:** Estrutura:
```json
{
  "output": ["campo1", "campo2", "campo3"]
}
```

**SPEC-JQEL-PRJ-005:** Campos relacionados usam notação de ponto:
```json
{
  "output": [
    "id_atendimento",
    "cliente.nome",
    "cliente.telefone",
    "atendente.nome_completo"
  ]
}
```

### Except (Exclusão)

**SPEC-JQEL-PRJ-006:** `except` exclui campos específicos

**SPEC-JQEL-PRJ-007:** `except` é array de strings

**SPEC-JQEL-PRJ-008:** `except` é opcional

**SPEC-JQEL-PRJ-009:** `except` retorna todos os campos EXCETO os listados

**SPEC-JQEL-PRJ-010:** Estrutura:
```json
{
  "except": ["senha_hash", "token_recuperacao"]
}
```

**SPEC-JQEL-PRJ-011:** Excluir campo pai remove objeto completo:
```json
{
  "except": ["cliente"]  // Remove todo objeto cliente
}
```

**SPEC-JQEL-PRJ-012:** Excluir subcampo preserva demais:
```json
{
  "except": ["cliente.telefone"]  // Remove só telefone
}
```

### Exclusividade

**SPEC-JQEL-PRJ-013:** `output` e `except` NÃO PODEM ser usados juntos

**SPEC-JQEL-PRJ-014:** Se ambos presentes, DEVE retornar erro 400

**SPEC-JQEL-PRJ-015:** Mensagem: "Não use 'output' e 'except' juntos"

### Comportamento Padrão

**SPEC-JQEL-PRJ-016:** Se nenhum em SELECT: retorna todos os campos

**SPEC-JQEL-PRJ-017:** Se nenhum em MUTATE: conforme procedure

---

## 10. VALUES - Dados para Mutação

### Estrutura

**SPEC-JQEL-VAL-001:** `values` é objeto com dados para insert/update/upsert

**SPEC-JQEL-VAL-002:** `values` é obrigatório para insert/update/upsert

**SPEC-JQEL-VAL-003:** `values` é ignorado em delete

**SPEC-JQEL-VAL-004:** Estrutura:
```json
{
  "values": {
    "campo1": valor1,
    "campo2": valor2
  }
}
```

### Exemplos

**SPEC-JQEL-VAL-005:** INSERT:
```json
{
  "mutate": "usuario",
  "action": "insert",
  "values": {
    "nome_completo": "João Silva",
    "email": "joao@example.com",
    "telefone": "11999887766"
  }
}
```

**SPEC-JQEL-VAL-006:** UPDATE:
```json
{
  "mutate": "usuario",
  "action": "update",
  "where": { "id_usuario": { "eq": 123 } },
  "values": {
    "telefone": "11988776655",
    "status": "inativo"
  }
}
```

---

## 11. Formato de Resposta (JResult)

### Estrutura

**SPEC-JQEL-RES-001:** Toda query JQEL retorna envelope JResult

**SPEC-JQEL-RES-002:** Estrutura completa:
```json
{
  "code": number,
  "message": string?,
  "field": string?,
  "data": array?,
  "warnings": array?
}
```

### Campo code (Obrigatório)

**SPEC-JQEL-RES-003:** `code` é OBRIGATÓRIO

**SPEC-JQEL-RES-004:** `code` é inteiro (HTTP status code)

**SPEC-JQEL-RES-005:** Valores comuns:
- 200 - OK
- 201 - Created
- 400 - Bad Request
- 401 - Unauthorized
- 403 - Forbidden
- 404 - Not Found
- 409 - Conflict
- 422 - Unprocessable Entity
- 500 - Internal Server Error

### Campo message (Opcional)

**SPEC-JQEL-RES-006:** `message` é string descritiva

**SPEC-JQEL-RES-007:** Geralmente vazio em sucesso (200/201)

**SPEC-JQEL-RES-008:** Obrigatório em erros (400+)

**SPEC-JQEL-RES-009:** Exemplos:
```json
"Campo 'email' é obrigatório"
"Email já cadastrado no sistema"
"Usuário 999 não encontrado"
```

### Campo field (Opcional)

**SPEC-JQEL-RES-010:** `field` identifica campo com erro

**SPEC-JQEL-RES-011:** Usado em validação (400) e conflitos (409)

**SPEC-JQEL-RES-012:** Exemplo:
```json
{
  "code": 400,
  "message": "Email inválido",
  "field": "email"
}
```

### Campo data (Condicional)

**SPEC-JQEL-RES-013:** `data` é SEMPRE array (mesmo um registro)

**SPEC-JQEL-RES-014:** `data` PODE ser omitido quando não há dados

**SPEC-JQEL-RES-015:** Array vazio em SELECT sem resultados:
```json
{ "code": 200, "data": [] }
```

**SPEC-JQEL-RES-016:** Um registro:
```json
{
  "code": 200,
  "data": [
    { "id": 123, "nome": "João" }
  ]
}
```

### Campo warnings (Opcional)

**SPEC-JQEL-RES-017:** `warnings` é array de objetos JResult

**SPEC-JQEL-RES-018:** Alertas não-bloqueantes

**SPEC-JQEL-RES-019:** Operação concluída mesmo com warnings

**SPEC-JQEL-RES-020:** Estrutura de warning:
```json
{
  "warnings": [
    {
      "code": 299,
      "message": "Campo será removido em 2025-06-01",
      "field": "telefone_fixo"
    }
  ]
}
```

---

## 12. Códigos de Status HTTP

### Sucesso (2xx)

**SPEC-JQEL-STA-001:** 200 OK - SELECT, UPDATE, DELETE bem-sucedidos

**SPEC-JQEL-STA-002:** 201 Created - INSERT, UPSERT (criação)

**SPEC-JQEL-STA-003:** 299 Deprecation - Warning em `warnings`

### Erro do Cliente (4xx)

**SPEC-JQEL-STA-004:** 400 Bad Request - Validação, sintaxe, campos obrigatórios

**SPEC-JQEL-STA-005:** 401 Unauthorized - Autenticação ausente/inválida

**SPEC-JQEL-STA-006:** 403 Forbidden - Sem permissão

**SPEC-JQEL-STA-007:** 404 Not Found - Entidade/registro não encontrado

**SPEC-JQEL-STA-008:** 409 Conflict - Violação de constraint

**SPEC-JQEL-STA-009:** 422 Unprocessable Entity - Erro semântico

**SPEC-JQEL-STA-010:** 429 Too Many Requests - Rate limit

### Erro do Servidor (5xx)

**SPEC-JQEL-STA-011:** 500 Internal Server Error - Erro não tratado

**SPEC-JQEL-STA-012:** 503 Service Unavailable - Serviço indisponível

### Diretrizes

**SPEC-JQEL-STA-013:** SELECT sem resultados usa 200 com `data: []`, não 404

**SPEC-JQEL-STA-014:** 404 apenas quando registro esperado não existe

**SPEC-JQEL-STA-015:** 400 para erros de sintaxe/estrutura

**SPEC-JQEL-STA-016:** 422 para erros semânticos/lógicos

**SPEC-JQEL-STA-017:** 409 para conflitos de constraint/estado

---

## 13. Validação

### Estrutura da Query

**SPEC-JQEL-VAL-001:** Query DEVE ser JSON válido

**SPEC-JQEL-VAL-002:** Campo `schema` DEVE estar presente

**SPEC-JQEL-VAL-003:** Campo `select` OU `mutate` DEVE estar presente

**SPEC-JQEL-VAL-004:** `select` e `mutate` NÃO PODEM coexistir

**SPEC-JQEL-VAL-005:** Se `mutate`, campo `action` DEVE estar presente

### Tipos de Dados

**SPEC-JQEL-VAL-006:** `schema` DEVE ser string

**SPEC-JQEL-VAL-007:** `select`/`mutate` DEVE ser string

**SPEC-JQEL-VAL-008:** `action` DEVE ser string

**SPEC-JQEL-VAL-009:** `where` DEVE ser object

**SPEC-JQEL-VAL-010:** `values` DEVE ser object

**SPEC-JQEL-VAL-011:** `options` DEVE ser object

**SPEC-JQEL-VAL-012:** `output` DEVE ser array de strings

**SPEC-JQEL-VAL-013:** `except` DEVE ser array de strings

### Valores

**SPEC-JQEL-VAL-014:** `limit` DEVE ser inteiro positivo

**SPEC-JQEL-VAL-015:** `offset` DEVE ser inteiro não-negativo

**SPEC-JQEL-VAL-016:** `orderBy` DEVE ser array de objects

**SPEC-JQEL-VAL-017:** Direção em `orderBy` DEVE ser "asc" ou "desc"

**SPEC-JQEL-VAL-018:** Operadores WHERE DEVEM ser válidos

**SPEC-JQEL-VAL-019:** `output` e `except` NÃO PODEM coexistir

---

## 14. Boas Práticas

### WHERE

**SPEC-JQEL-BP-001:** Usar `in` para múltiplos valores em vez de múltiplos `or`

**SPEC-JQEL-BP-002:** Usar múltiplos operadores no mesmo campo para intervalos

**SPEC-JQEL-BP-003:** AND é implícito entre campos diferentes

### OPTIONS

**SPEC-JQEL-BP-004:** Sempre usar `orderBy` com `offset`

**SPEC-JQEL-BP-005:** Ordenar por campos indexados quando possível

**SPEC-JQEL-BP-006:** Limite máximo recomendado: 1000 registros

### Projeção

**SPEC-JQEL-BP-007:** Sempre especificar projeção em listagens

**SPEC-JQEL-BP-008:** Incluir IDs de entidades relacionadas

**SPEC-JQEL-BP-009:** Evitar campos grandes (BLOBs) sem necessidade

### MUTATE

**SPEC-JQEL-BP-010:** Sempre usar `where` em update/delete

**SPEC-JQEL-BP-011:** Especificar `output` para confirmar mudanças

---

*Esta especificação define a sintaxe completa de JQEL. Integração com a plataforma em SPEC-data-access.md.*