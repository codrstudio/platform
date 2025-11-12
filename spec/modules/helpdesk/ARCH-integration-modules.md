# Integração entre Módulos

## Visão Geral

O ecossistema HelpDesk/SAC é composto por **3 módulos independentes** que compartilham dados e se complementam:

1. **helpdesk** - Operação interna completa
2. **sac** - Interface simplificada para clientes
3. **gestao-sac** - Administração e analytics

## Arquitetura de Módulos

```
┌─────────────────────────────────────────────────────┐
│                    PLATAFORMA                        │
│  - Autenticação (JWT)                                │
│  - Autorização (JQEL authorize)                      │
│  - Roteamento                                        │
└─────────────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼──────┐  ┌──────▼─────┐  ┌──────▼────────┐
│   helpdesk   │  │    sac     │  │  gestao-sac   │
│  (operação)  │  │ (cliente)  │  │  (gestão)     │
└──────┬───────┘  └─────┬──────┘  └───────┬───────┘
       │                │                  │
       └────────────────┼──────────────────┘
                        │
                ┌───────▼────────┐
                │  JQEL SCHEMAS  │
                │   (dados)      │
                └────────────────┘
                        │
                ┌───────▼────────┐
                │   n8n Backbone │
                │  (lógica)      │
                └────────────────┘
```

## Dependências entre Módulos

### helpdesk (Base)
- **Dependências**: Nenhuma
- **Função**: Módulo base que define os schemas principais
- **Schemas proprietários**:
  - `helpdesk.chamado`
  - `helpdesk.comentario`
  - `helpdesk.anexo`
  - `helpdesk.categoria`
  - `helpdesk.tag`
  - `helpdesk.sla`
  - `helpdesk.automacao`
- **Schemas compartilhados**:
  - `system.cliente`
  - `system.contato`
  - `system.departamento`

### sac (Dependente)
- **Dependências**: helpdesk (usa seus schemas)
- **Função**: Interface simplificada para clientes
- **Schemas consumidos**:
  - `helpdesk.chamado` (leitura limitada)
  - `helpdesk.comentario` (leitura/escrita com restrições)
  - `helpdesk.anexo` (leitura limitada)
  - `helpdesk.categoria` (leitura apenas)
  - `system.cliente` (leitura próprio registro)
  - `system.contato` (leitura próprio registro)
- **Não consome**:
  - `helpdesk.sla` (não exposto ao cliente)
  - `helpdesk.automacao` (interno)
  - `system.departamento` (interno)

### gestao-sac (Dependente)
- **Dependências**: helpdesk (configura e analisa)
- **Função**: Administração e relatórios
- **Schemas consumidos**:
  - Todos os schemas de `helpdesk.*` (leitura completa)
  - Todos os schemas de `system.*` (leitura/escrita)
- **Foco especial**:
  - `helpdesk.sla` (configuração)
  - `helpdesk.automacao` (criação de regras)
  - `system.departamento` (gestão)

## Dados Compartilhados

### Leitura e Escrita Completa

| Schema | helpdesk | sac | gestao-sac |
|--------|----------|-----|------------|
| `helpdesk.chamado` | ✅ R/W completo | 🔒 R limitado, W próprios | ✅ R completo |
| `helpdesk.comentario` | ✅ R/W completo | 🔒 R/W limitado | ✅ R completo |
| `helpdesk.anexo` | ✅ R/W completo | 🔒 R/W limitado | ✅ R completo |
| `helpdesk.categoria` | ✅ R/W completo | 👁️ R apenas | ✅ R/W completo |
| `helpdesk.tag` | ✅ R/W completo | ❌ Sem acesso | ✅ R/W completo |
| `helpdesk.sla` | 👁️ R apenas | ❌ Sem acesso | ✅ R/W completo |
| `helpdesk.automacao` | 👁️ R apenas | ❌ Sem acesso | ✅ R/W completo |
| `system.cliente` | ✅ R/W completo | 🔒 R próprio | ✅ R/W completo |
| `system.contato` | ✅ R/W completo | 🔒 R próprio | ✅ R/W completo |
| `system.departamento` | 👁️ R apenas | ❌ Sem acesso | ✅ R/W completo |

**Legenda:**
- ✅ R/W completo: Leitura e escrita sem restrições
- 👁️ R apenas: Leitura apenas
- 🔒 R/W limitado: Leitura/escrita com Row-Level Security
- ❌ Sem acesso: Não tem permissão

## Eventos Publicados/Consumidos

Cada módulo pode publicar e consumir eventos via Redis Pub/Sub.

### helpdesk (Publica)
```typescript
// Eventos publicados
- helpdesk.chamado.criado
- helpdesk.chamado.atualizado
- helpdesk.chamado.atribuido
- helpdesk.chamado.status_alterado
- helpdesk.chamado.sla_violado
- helpdesk.comentario.criado
- helpdesk.anexo.adicionado
```

### sac (Publica)
```typescript
// Eventos publicados
- sac.chamado.criado_por_cliente
- sac.comentario.adicionado_por_cliente
- sac.avaliacao.enviada
```

### gestao-sac (Publica)
```typescript
// Eventos publicados
- gestao.configuracao.alterada
- gestao.automacao.criada
- gestao.automacao.executada
- gestao.sla.alterado
- gestao.relatorio.gerado
```

### Consumo de Eventos

Todos os módulos podem consumir eventos para:
- Atualizar UI em tempo real (via SSE)
- Invalidar cache do TanStack Query
- Mostrar notificações ao usuário

```typescript
// Exemplo: helpdesk consome evento de avaliação do SAC
events.on('sac.avaliacao.enviada', (data) => {
  queryClient.invalidateQueries({
    queryKey: ['chamado', data.chamadoId]
  });

  toast.info(`Cliente avaliou chamado ${data.numero}`);
});
```

## Fluxos Integrados

### Fluxo 1: Cliente Abre Chamado

```
┌─────────┐
│   SAC   │  Cliente acessa portal
└────┬────┘
     │ POST /api/jqel
     │ { schema: "helpdesk", mutate: "chamado", action: "insert" }
     │
     ▼
┌─────────┐
│  JQEL   │  Valida permissões (cliente pode criar)
└────┬────┘  Aplica RLS (clienteId = seu id)
     │
     ▼
┌─────────┐
│   n8n   │  Cria chamado
└────┬────┘  Publica evento: helpdesk.chamado.criado
     │
     ├──────────────────┬───────────────┐
     │                  │               │
     ▼                  ▼               ▼
┌─────────┐      ┌──────────┐    ┌────────────┐
│   SAC   │      │ helpdesk │    │ gestao-sac │
│(atualiza│      │(notifica │    │ (contagem) │
│   UI)   │      │atendente)│    │            │
└─────────┘      └──────────┘    └────────────┘
```

### Fluxo 2: Atendente Responde Chamado

```
┌──────────┐
│ helpdesk │  Atendente adiciona comentário
└─────┬────┘
      │ POST /api/jqel
      │ { schema: "helpdesk", mutate: "comentario",
      │   values: { visibilidade: "publico" } }
      │
      ▼
┌─────────┐
│  JQEL   │  Valida permissões
└────┬────┘  Atualiza dataPrimeiraResposta se necessário
      │
      ▼
┌─────────┐
│   n8n   │  Cria comentário
└────┬────┘  Publica evento: helpdesk.comentario.criado
      │      Envia email para cliente
      │
      ▼
┌─────────┐
│   SAC   │  Cliente recebe notificação em tempo real
└─────────┘  UI atualiza automaticamente (SSE)
```

### Fluxo 3: Gestor Configura Automação

```
┌────────────┐
│ gestao-sac │  Gestor cria regra de automação
└──────┬─────┘
       │ POST /api/jqel
       │ { schema: "helpdesk", mutate: "automacao" }
       │
       ▼
┌─────────┐
│  JQEL   │  Valida permissões (admin/gestor)
└────┬────┘
       │
       ▼
┌─────────┐
│   n8n   │  Salva automação
└────┬────┘  Publica: gestao.automacao.criada
       │
       ▼
┌──────────┐
│ helpdesk │  Sistema carrega nova automação
└──────────┘  Passa a executá-la em novos chamados
```

## Comunicação entre Módulos

### Via Dados (Padrão)
Módulos se comunicam **indiretamente** através de dados compartilhados:

```typescript
// SAC cria chamado
await jqel.mutate({
  schema: 'helpdesk',
  mutate: 'chamado',
  action: 'insert',
  values: { ... }
});

// helpdesk lê chamado
const chamados = await jqel.query({
  schema: 'helpdesk',
  select: 'chamado',
  where: { status: { $eq: 'aberto' } }
});
```

### Via Eventos (Tempo Real)
Para notificações e atualizações em tempo real:

```typescript
// Publicar evento (qualquer módulo)
await redis.publish('platform:events', JSON.stringify({
  type: 'helpdesk.chamado.atribuido',
  target: `atendente:${atendenteId}`,
  data: { chamadoId, numero, titulo }
}));

// Consumir evento (qualquer módulo)
eventSource.addEventListener('helpdesk.chamado.atribuido', (event) => {
  const data = JSON.parse(event.data);
  queryClient.invalidateQueries(['chamados']);
  toast.info(`Novo chamado atribuído: ${data.numero}`);
});
```

### Direct API Calls (Evitar)
Módulos **não devem** fazer chamadas diretas uns aos outros. Toda comunicação deve ser via:
1. Dados compartilhados (JQEL)
2. Eventos (Redis Pub/Sub)

## Isolamento e Desacoplamento

### Princípios

1. **Módulos são independentes**: Podem ser ativados/desativados separadamente
2. **Schemas são compartilhados**: Definidos em `helpdesk/jqel-schema/`
3. **Nenhum import direto**: Um módulo não importa código de outro
4. **Comunicação via contratos**: JQEL schemas são o contrato entre módulos

### Ativação de Módulos

Em um portal, pode-se ativar:

**Cenário 1: Apenas helpdesk**
- Equipe interna usa sistema completo
- Clientes não têm acesso (sem módulo SAC)

**Cenário 2: helpdesk + sac**
- Equipe interna + clientes têm acesso
- Sem módulo de gestão avançada

**Cenário 3: Todos os 3**
- Sistema completo com gestão + operação + cliente

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
- ['gestao', 'analytics', 'dashboard']
```

### Rotas
```
/{portal-id}/{modulo-id}/{funcionalidade}

Exemplos:
- /main/helpdesk/chamados
- /main/sac/meus-tickets
- /main/gestao-sac/dashboard
```

## Referências

- [ARCH-integration-jqel.md](ARCH-integration-jqel.md) - Integração com JQEL
- [ARCH-integration-rbac.md](ARCH-integration-rbac.md) - Controle de acesso
- [SPEC-modules.md](../../SPEC-modules.md) - Sistema de módulos da plataforma
- [SPEC-events.md](../../SPEC-events.md) - Sistema de eventos SSE
