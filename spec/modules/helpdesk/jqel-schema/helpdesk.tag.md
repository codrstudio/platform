# Schema: helpdesk.tag

## Descrição
Tags contextuais para classificação e busca de chamados.

## Campos

- **id** (UUID, PK)
- **nome** (string, obrigatório, unique, max: 50)
- **cor** (string, nullable) - código hex para UI
- **descricao** (text, nullable)
- **usageCount** (integer, default: 0) - quantidade de vezes usada
- **criadoPorId** (UUID, FK → system.usuario, obrigatório)
- **dataCriacao** (datetime, obrigatório)

## Relacionamentos

- Usado em: `helpdesk.chamado.tags` (array)

## Permissões

- **Read**: todos
- **Write**: atendente, supervisor, admin
- **Delete**: admin (apenas se usageCount = 0)

## Validações

- Nome único, lowercase, sem espaços (usar hífen)
- Padrão: `^[a-z0-9-]+$`

## Exemplo de Query JQEL

```json
{
  "schema": "helpdesk",
  "select": "tag",
  "options": {
    "orderBy": [{ "field": "usageCount", "direction": "DESC" }],
    "limit": 20
  },
  "output": ["id", "nome", "cor", "usageCount"]
}
```
