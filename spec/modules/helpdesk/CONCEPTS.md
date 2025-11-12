# Conceitos do Sistema HelpDesk/SAC

Guia rápido de conceitos, keywords e glossário. Não replica documentação existente.

---

## Entidades Principais

### Chamado (Ticket)
Solicitação de atendimento feita por cliente ou contato.

**Estados**: `aberto` → `em_andamento` → `aguardando_cliente` → `resolvido` → `fechado`

**Prioridades**: `baixa` | `media` | `alta` | `urgente`

**Tipos**: `incidente` | `requisicao` | `problema` | `mudanca` | `consulta`

### Cliente
Empresa/organização atendida. Pode ter hierarquia (matriz/filial).

### Contato
Pessoa física vinculada a um cliente. Pode ter acesso ao SAC.

### Departamento
Área interna responsável por atendimento. Pode ter hierarquia.

---

## Conceitos de Operação

### Atribuição
Associar chamado a um atendente específico. Pode ser:
- **Manual**: Supervisor atribui
- **Automática**: Regra de automação atribui
- **Auto-atribuição**: Atendente pega da fila

### Escalação
Transferir chamado para nível superior (ex: atendente → supervisor).

### SLA (Service Level Agreement)
Prazo acordado para resposta/resolução baseado em prioridade.

**Métricas**:
- Tempo de primeira resposta
- Tempo de resolução
- Taxa de violação

### Comentário
Interação em um chamado. Pode ser:
- **Público**: Visível para cliente
- **Interno**: Apenas equipe vê

### Workflow
Fluxo de estados configurável por departamento.

---

## Papéis (Roles)

| Papel | Escopo | Acesso |
|-------|--------|--------|
| **helpdesk:atendente** | Departamento | R/W chamados do dept |
| **helpdesk:supervisor** | Dept + subordinados | R/W + gestão equipe |
| **helpdesk:admin** | Global | R/W/D tudo |
| **sac:cliente** | Próprio clienteId | R próprios chamados |
| **sac:contato** | Próprios chamados | R onde é solicitante |
| **gestao:gestor** | Global | R analytics |
| **gestao:admin** | Global | R/W configurações |

---

## Schemas JQEL

### Namespace: helpdesk
- `chamado` - Tickets
- `comentario` - Interações
- `anexo` - Arquivos
- `categoria` - Classificação hierárquica
- `tag` - Classificação livre
- `sla` - Configurações de prazo
- `automacao` - Regras de negócio

### Namespace: system
- `cliente` - Empresas
- `contato` - Pessoas
- `departamento` - Áreas internas

---

## Operações Principais

### Fluxo Cliente
1. Cliente abre chamado (via SAC)
2. Sistema atribui departamento (automação)
3. Atendente pega da fila
4. Atendente responde (primeiro contato)
5. Conversa até resolução
6. Cliente confirma resolução
7. Chamado fechado
8. Cliente avalia (opcional)

### Fluxo Atendente
1. Ver fila de chamados do departamento
2. Pegar chamado (auto-atribuição)
3. Analisar histórico e contexto
4. Responder cliente
5. Adicionar notas internas
6. Marcar como resolvido
7. Aguardar confirmação cliente

### Fluxo Gestor
1. Ver dashboard de métricas
2. Identificar gargalos
3. Ajustar SLAs
4. Criar automações
5. Gerar relatórios
6. Analisar satisfação

---

## Canais de Entrada

- **Web**: Portal SAC ou helpdesk interno
- **Email**: Parsing automático cria chamado
- **API**: Integração com sistemas externos
- **Chat**: Atendimento síncrono
- **WhatsApp**: Via integração
- **Telefone**: Registro manual

---

## Automações

**Gatilhos** (quando executar):
- Criar chamado
- Atualizar chamado
- Comentário adicionado
- Status alterado
- SLA próximo de violar
- SLA violado
- Tempo decorrido

**Ações** (o que fazer):
- Atribuir a atendente/departamento
- Mudar status/prioridade
- Adicionar tag
- Enviar email
- Enviar notificação
- Executar webhook

**Condições** (se):
- Campo = valor
- Campo contém texto
- Prioridade = X
- Departamento = Y
- Cliente = Z

---

## Métricas Importantes

### Operacionais
- Chamados abertos
- Chamados em fila (não atribuídos)
- Tempo médio primeira resposta
- Tempo médio de resolução
- Taxa de SLA cumprido

### Qualidade
- Avaliação média (1-5)
- Taxa de resolução no primeiro contato
- Taxa de reativação (reabertos)
- Chamados escalados

### Produtividade
- Chamados por atendente/dia
- Taxa de ociosidade
- Distribuição por departamento
- Pico de demanda (hora/dia)

---

## Estados do Chamado

```
┌────────┐
│ aberto │  ← Criado, aguardando atribuição
└───┬────┘
    ↓
┌────────────────┐
│ em_andamento   │  ← Atendente trabalhando
└───┬────────────┘
    ↓
┌───────────────────────┐
│ aguardando_cliente    │  ← Esperando resposta do cliente
└───────┬───────────────┘
    ↓
┌────────────────────────┐
│ aguardando_interno     │  ← Esperando outra área interna
└───────┬────────────────┘
    ↓
┌──────────┐
│ resolvido│  ← Solução implementada
└────┬─────┘
     ↓
┌──────────┐
│ fechado  │  ← Confirmado e encerrado
└──────────┘

      ┌──────────┐
      │cancelado │  ← Cancelado (qualquer estado)
      └──────────┘
```

---

## Permissões JQEL

**Formato**: `{schema}:{entidade}:{operacao}`

**Operações**: `read` | `write` | `delete`

**Wildcards**:
- `helpdesk:*:read` - Ler tudo de helpdesk
- `helpdesk:chamado:*` - Todas ops em chamado
- `helpdesk:*:*` - Admin total

**Row-Level Security (RLS)**:
- Backend adiciona filtros automáticos
- Cliente vê apenas seus chamados
- Atendente vê apenas seu departamento

---

## Integrações

### n8n (Backbone)
- Processa todas operações JQEL
- Executa lógica de negócio
- Envia emails/notificações
- Integra sistemas externos

### Redis
- **Pub/Sub**: Eventos em tempo real
- **Streams**: Filas de tarefas
- **Cache**: Performance

### SSE (Server-Sent Events)
- Frontend recebe eventos ao vivo
- Atualização de UI automática
- Notificações em tempo real

---

## Convenções de Nomenclatura

### Eventos
```
{modulo}.{entidade}.{acao}

Exemplos:
- helpdesk.chamado.criado
- sac.avaliacao.enviada
- gestao.sla.alterado
```

### Query Keys (TanStack Query)
```
['{modulo}', '{entidade}', ...filtros]

Exemplos:
- ['helpdesk', 'chamados', departamentoId]
- ['sac', 'meus-chamados']
```

### Rotas
```
/{portal-id}/{modulo-id}/{funcionalidade}

Exemplos:
- /main/helpdesk/chamados
- /main/sac/meus-tickets
- /main/gestao-sac/dashboard
```

---

## Keywords/Tags

### Por Funcionalidade
`#atendimento` `#suporte` `#ticket` `#sac` `#crm`

### Por Domínio
`#cliente` `#contato` `#departamento` `#categoria`

### Por Operação
`#atribuicao` `#escalacao` `#sla` `#automacao` `#workflow`

### Por Tecnologia
`#jqel` `#n8n` `#redis` `#sse` `#jwt`

### Por Módulo
`#helpdesk` `#sac` `#gestao-sac`

---

## Glossário Técnico

**JQEL**: JSON Query Expression Language - linguagem de query da plataforma

**RLS**: Row-Level Security - filtros automáticos por permissão

**SSE**: Server-Sent Events - push de eventos do servidor

**JWT**: JSON Web Token - token de autenticação

**Backbone**: Camada n8n que processa lógica de negócio

**Portal**: Sub-aplicação isolada dentro da plataforma

**Módulo**: Funcionalidade reutilizável que pode ser ativada em portais

**Instance**: Configuração específica de um módulo em um portal

---

## Anti-Patterns (Evitar)

❌ **Autenticação no módulo**: Sempre delegar à plataforma

❌ **Queries SQL diretas**: Sempre usar JQEL

❌ **Fetch/axios direto**: Sempre encapsular com TanStack Query

❌ **Lógica de negócio no frontend**: Sempre no backbone (n8n)

❌ **Acesso direto entre módulos**: Sempre via dados/eventos compartilhados

❌ **Hardcode de permissões**: Sempre via JQEL authorize

---

## Referências Rápidas

**Specs**: `spec/modules/{helpdesk,sac,gestao-sac}/`

**Schemas**: `spec/modules/helpdesk/jqel-schema/`

**Arquitetura**: `spec/modules/helpdesk/ARCH-*.md`

**Workflows n8n**: `workflows/system/`

**Plataforma**: `spec/SPEC-*.md`
