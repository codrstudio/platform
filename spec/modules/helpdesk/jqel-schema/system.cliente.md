# Schema: system.cliente

## Descrição
Cadastro de clientes (empresas/organizações) atendidos pelo helpdesk. Schema compartilhado que pode ser usado por outros módulos do CRM.

## Campos

### Identificação
- **id** (UUID, PK)
- **nome** (string, obrigatório, max: 255) - razão social ou nome
- **nomeFantasia** (string, nullable, max: 255)
- **documento** (string, nullable, unique) - CNPJ/CPF ou equivalente
- **tipoDocumento** (enum, nullable) - `cnpj`, `cpf`, `outro`

### Contato
- **email** (string, nullable)
- **telefone** (string, nullable)
- **website** (string, nullable)

### Endereço
- **endereco** (text, nullable)
- **cidade** (string, nullable)
- **estado** (string, nullable)
- **cep** (string, nullable)
- **pais** (string, default: "BR")

### Gestão
- **status** (enum, default: "ativo")
  - `ativo`, `inativo`, `suspenso`, `bloqueado`
- **segmento** (string, nullable) - ramo de atividade
- **porte** (enum, nullable) - `pequeno`, `medio`, `grande`
- **gestorContaId** (UUID, FK → system.usuario, nullable) - account manager

### Hierarquia
- **clientePaiId** (UUID, FK → system.cliente, nullable) - cliente matriz

### Auditoria
- **dataCadastro** (datetime, obrigatório)
- **dataUltimaAtualizacao** (datetime, obrigatório)
- **criadoPorId** (UUID, FK → system.usuario, obrigatório)

### Metadata
- **observacoes** (text, nullable)
- **metadados** (jsonb, nullable)

## Relacionamentos

- Pode ter: cliente pai (hierarquia)
- Tem muitos: clientes filhos (filiais)
- Tem muitos: `system.contato`
- Tem muitos: `helpdesk.chamado`
- Tem: gestor de conta (usuario)

## Permissões

- **Read**: atendente, supervisor, admin, gestor (visualização limitada)
- **Write**: supervisor, admin, gestor
- **Delete**: admin (soft delete - marcar como inativo)

## Validações

- Documento único se informado
- Email válido se informado
- Nome obrigatório

## Exemplo de Query JQEL

```json
{
  "schema": "system",
  "select": "cliente",
  "where": {
    "status": { "$eq": "ativo" },
    "nome": { "$contains": "Tech" }
  },
  "options": {
    "orderBy": [{ "field": "nome", "direction": "ASC" }],
    "limit": 50
  },
  "output": ["id", "nome", "nomeFantasia", "email", "telefone", "status"]
}
```
