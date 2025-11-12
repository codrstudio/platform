# Schema: system.departamento

## Descrição
Departamentos internos responsáveis pelo atendimento. Schema compartilhado que pode ser usado por outros módulos do CRM.

## Campos

### Identificação
- **id** (UUID, PK)
- **nome** (string, obrigatório, unique, max: 100)
- **sigla** (string, nullable, unique, max: 10)
- **descricao** (text, nullable)

### Hierarquia
- **departamentoPaiId** (UUID, FK → system.departamento, nullable)
  - Permite estrutura hierárquica de departamentos

### Configuração
- **email** (string, nullable) - email geral do departamento
- **cor** (string, nullable) - código hex para UI
- **ordem** (integer, default: 0) - ordem de exibição
- **ativo** (boolean, default: true)

### SLA Padrão
- **slaDefaultId** (UUID, FK → helpdesk.sla, nullable)
  - SLA padrão para chamados deste departamento

### Gestão
- **gestorId** (UUID, FK → system.usuario, nullable)
  - Responsável pelo departamento
- **horarioAtendimento** (jsonb, nullable)
  - Estrutura com horários de funcionamento

### Auditoria
- **dataCriacao** (datetime, obrigatório)
- **dataUltimaAtualizacao** (datetime, obrigatório)

## Estrutura horarioAtendimento

```json
{
  "segunda": { "inicio": "08:00", "fim": "18:00" },
  "terca": { "inicio": "08:00", "fim": "18:00" },
  "quarta": { "inicio": "08:00", "fim": "18:00" },
  "quinta": { "inicio": "08:00", "fim": "18:00" },
  "sexta": { "inicio": "08:00", "fim": "17:00" },
  "sabado": null,
  "domingo": null
}
```

## Relacionamentos

- Pode ter: departamento pai (hierarquia)
- Tem muitos: departamentos filhos
- Tem: gestor (usuario)
- Tem: SLA padrão
- Tem muitos: `helpdesk.chamado`
- Tem muitos: `system.usuario` (atendentes do departamento)

## Permissões

- **Read**: todos (usuários internos)
- **Write**: admin, gestor (apenas de seu departamento)
- **Delete**: admin (soft delete - marcar como inativo)

## Validações

- Nome único
- Sigla única se informada
- Não pode ser pai de si mesmo

## Exemplo de Query JQEL

```json
{
  "schema": "system",
  "select": "departamento",
  "where": {
    "ativo": { "$eq": true },
    "departamentoPaiId": { "$isNull": true }
  },
  "options": {
    "orderBy": [{ "field": "ordem", "direction": "ASC" }]
  },
  "output": ["id", "nome", "sigla", "email", "cor", "gestorId"]
}
```
