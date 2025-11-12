# Schema: helpdesk.automacao

## Descrição
Regras de automação para processamento automático de chamados.

## Campos

- **id** (UUID, PK)
- **nome** (string, obrigatório, max: 100)
- **descricao** (text, nullable)
- **ativo** (boolean, default: true)
- **prioridade** (integer, default: 0) - ordem de execução
- **gatilho** (enum, obrigatório)
  - `criar_chamado`, `atualizar_chamado`, `comentario_adicionado`, `status_alterado`, `sla_proximidade`, `sla_violado`, `tempo_decorrido`
- **condicoes** (jsonb, obrigatório) - condições para execução (query-like)
- **acoes** (jsonb, obrigatório) - ações a executar
- **departamentoId** (UUID, FK → system.departamento, nullable) - escopo (null = global)
- **criadoPorId** (UUID, FK → system.usuario, obrigatório)
- **dataCriacao** (datetime, obrigatório)
- **dataUltimaExecucao** (datetime, nullable)
- **contagemExecucoes** (integer, default: 0)

## Estrutura JSON

### condicoes (exemplo)
```json
{
  "all": [
    { "field": "prioridade", "operator": "eq", "value": "urgente" },
    { "field": "departamentoId", "operator": "eq", "value": "uuid" }
  ]
}
```

### acoes (exemplo)
```json
[
  { "tipo": "atribuir", "atendenteId": "uuid" },
  { "tipo": "enviar_email", "template": "notificacao_urgente" },
  { "tipo": "adicionar_tag", "tag": "automatico" }
]
```

## Permissões

- **Read**: admin, gestor
- **Write**: admin, gestor
- **Delete**: admin

## Exemplo de Query JQEL

```json
{
  "schema": "helpdesk",
  "select": "automacao",
  "where": {
    "ativo": { "$eq": true },
    "gatilho": { "$eq": "criar_chamado" }
  },
  "options": {
    "orderBy": [{ "field": "prioridade", "direction": "DESC" }]
  }
}
```
