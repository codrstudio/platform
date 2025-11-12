# Schema: helpdesk.categoria

## Descrição
Categorias hierárquicas para classificação de chamados.

## Campos

- **id** (UUID, PK)
- **nome** (string, obrigatório, max: 100)
- **descricao** (text, nullable)
- **categoriaPaiId** (UUID, FK → helpdesk.categoria, nullable) - hierarquia
- **cor** (string, nullable) - código hex para UI
- **icone** (string, nullable) - nome do ícone
- **ordem** (integer, default: 0) - ordem de exibição
- **ativo** (boolean, default: true)
- **departamentoId** (UUID, FK → system.departamento, nullable) - categoria específica de departamento
- **slaDefaultId** (UUID, FK → helpdesk.sla, nullable) - SLA padrão para esta categoria

## Relacionamentos

- Pode ter: categoria pai (hierarquia)
- Tem muitos: categorias filhas
- Pertence a: departamento (opcional)
- Tem: SLA padrão (opcional)

## Permissões

- **Read**: todos
- **Write**: admin, gestor
- **Delete**: admin (soft delete - marcar como inativo)

## Validações

- Nome único por departamento (ou global se departamentoId = null)
- Não pode ser pai de si mesmo
- Máximo 3 níveis de hierarquia

## Exemplo de Query JQEL

```json
{
  "schema": "helpdesk",
  "select": "categoria",
  "where": {
    "ativo": { "$eq": true },
    "categoriaPaiId": { "$isNull": true }
  },
  "options": {
    "orderBy": [{ "field": "ordem", "direction": "ASC" }]
  },
  "output": ["id", "nome", "descricao", "cor", "icone"]
}
```
