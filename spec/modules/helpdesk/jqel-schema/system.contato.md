# Schema: system.contato

## Descrição
Pessoas de contato vinculadas a clientes. Schema compartilhado que pode ser usado por outros módulos do CRM.

## Campos

### Identificação
- **id** (UUID, PK)
- **clienteId** (UUID, FK → system.cliente, obrigatório)
- **nome** (string, obrigatório, max: 255)
- **sobrenome** (string, nullable, max: 255)
- **nomeCompleto** (string, computed) - nome + sobrenome

### Contato
- **email** (string, obrigatório, unique)
- **telefone** (string, nullable)
- **celular** (string, nullable)
- **ramal** (string, nullable)

### Profissional
- **cargo** (string, nullable, max: 100)
- **departamento** (string, nullable, max: 100)
- **principal** (boolean, default: false) - contato principal do cliente

### Gestão
- **status** (enum, default: "ativo")
  - `ativo`, `inativo`
- **recebeNotificacoes** (boolean, default: true)
- **idioma** (string, default: "pt-BR")

### Vinculação com Sistema
- **usuarioId** (UUID, FK → system.usuario, nullable)
  - Se preenchido, este contato tem acesso ao sistema (módulo SAC)

### Auditoria
- **dataCadastro** (datetime, obrigatório)
- **dataUltimaAtualizacao** (datetime, obrigatório)
- **criadoPorId** (UUID, FK → system.usuario, obrigatório)

### Metadata
- **observacoes** (text, nullable)
- **metadados** (jsonb, nullable)

## Relacionamentos

- Pertence a: `system.cliente` (N:1)
- Pode ter: `system.usuario` (vinculação para acesso ao sistema)
- Tem muitos: `helpdesk.chamado` (como solicitante)

## Permissões

- **Read**: atendente, supervisor, admin (todos os contatos)
- **Read**: cliente/contato (apenas próprio registro via SAC)
- **Write**: supervisor, admin, gestor
- **Delete**: admin (soft delete)

## Validações

- Email único
- clienteId deve existir e estar ativo
- Email válido (formato)
- Apenas 1 contato principal por cliente

## Exemplo de Query JQEL

```json
{
  "schema": "system",
  "select": "contato",
  "where": {
    "clienteId": { "$eq": "uuid-cliente" },
    "status": { "$eq": "ativo" }
  },
  "options": {
    "orderBy": [
      { "field": "principal", "direction": "DESC" },
      { "field": "nome", "direction": "ASC" }
    ]
  },
  "output": ["id", "nomeCompleto", "email", "telefone", "cargo", "principal"]
}
```
