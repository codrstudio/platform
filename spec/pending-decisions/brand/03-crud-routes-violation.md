# CRUD Routes Violation - Erro Arquitetural Identificado

## Problema Identificado

Durante análise do sistema, foram encontradas **rotas REST de CRUD criadas no backend**, violando a arquitetura JQEL.

### Rotas Violadoras (Provável)

Backend pode ter rotas como:
- `GET /api/1/config/realm/:realmId`
- `PATCH /api/1/config/realm/:realmId`
- `GET /api/1/config/portal/:portalId`
- `PATCH /api/1/config/portal/:portalId`

Essas rotas **NÃO DEVEM EXISTIR**. Acesso a dados deve ser via JQEL.

## Arquitetura Correta

### Acesso a Configs de Realm/Portal

**Errado**:
```typescript
fetch('/api/1/config/realm/default')
```

**Correto** (JQEL):
```typescript
POST /api/jqel
{
  "schema": "backend",
  "select": "realm",
  "where": { "realmId": { "$eq": "default" } }
}
```

### Atualização de Configs

**Errado**:
```typescript
PATCH /api/1/config/realm/default
{ "brand": { "color": "..." } }
```

**Correto** (JQEL):
```typescript
POST /api/jqel
{
  "schema": "backend",
  "mutate": "realm",
  "action": "update",
  "where": { "realmId": { "$eq": "default" } },
  "values": { "brand": { "color": "..." } }
}
```

## Schema JQEL para Backend Configs

Segundo `SPEC-jqel-schema.md`, schema `"backend"` é processado pelo Backend (Express) para configs de portal/module/instance.

Precisa incluir:
- Entity: `"realm"` - CRUD de realms
- Entity: `"portal"` - CRUD de portals

## Ação Necessária

1. **Auditar backend**: identificar todas as rotas REST de CRUD criadas
2. **Remover rotas violadoras**
3. **Implementar handlers JQEL** para entities `realm` e `portal` no schema `backend`
4. **Atualizar frontend** para usar JQEL em vez de fetch direto

## Impacto no Brand

Brand deve usar JQEL para:
- Ler configurações: `select: "realm"`, `select: "portal"`
- Atualizar brand: `mutate: "realm"`, `action: "update"`, `values: { brand: {...} }`

Não criar rotas REST para brand CRUD.
