# Schema: helpdesk.sla

## Descrição
Configurações de SLA (Service Level Agreement) para definir prazos de atendimento.

## Campos

- **id** (UUID, PK)
- **nome** (string, obrigatório, max: 100)
- **descricao** (text, nullable)
- **prioridadeBaixa­Horas** (integer, nullable) - prazo em horas para prioridade baixa
- **prioridadeMedia­Horas** (integer, nullable) - prazo para prioridade média
- **prioridadeAlta­Horas** (integer, nullable) - prazo para prioridade alta
- **prioridadeUrgente­Horas** (integer, nullable) - prazo para prioridade urgente
- **horarioComercial** (boolean, default: true) - contar apenas horário comercial
- **inicioHorario** (time, nullable) - início do horário comercial (ex: 08:00)
- **fimHorario** (time, nullable) - fim do horário comercial (ex: 18:00)
- **considerarFeriados** (boolean, default: true)
- **ativo** (boolean, default: true)

## Relacionamentos

- Usado por: `helpdesk.chamado` (1:N)
- Pode ser padrão de: `helpdesk.categoria` (1:N)

## Permissões

- **Read**: todos
- **Write**: admin, gestor
- **Delete**: admin (soft delete)

## Validações

- Pelo menos um prazo de prioridade deve estar definido
- Prazos devem ser > 0
- Se horarioComercial = true, deve ter inicioHorario e fimHorario

## Exemplo de Query JQEL

```json
{
  "schema": "helpdesk",
  "select": "sla",
  "where": {
    "ativo": { "$eq": true }
  },
  "output": ["id", "nome", "prioridadeBaixaHoras", "prioridadeMediaHoras", "prioridadeAltaHoras", "prioridadeUrgenteHoras"]
}
```
