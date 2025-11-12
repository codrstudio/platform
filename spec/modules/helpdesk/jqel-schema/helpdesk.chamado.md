# Schema: helpdesk.chamado

## Descrição
Entidade principal do sistema de chamados (tickets). Representa uma solicitação de atendimento feita por um cliente ou contato.

## Campos

### Identificação
- **id** (UUID, PK, obrigatório)
  - Identificador único do chamado
  - Gerado automaticamente no momento da criação

- **numero** (string, único, obrigatório)
  - Número sequencial do chamado (ex: "CHM-2024-0001")
  - Gerado automaticamente com padrão configurável
  - Usado para referência externa

### Informações Básicas
- **titulo** (string, obrigatório, max: 255)
  - Título resumido do chamado
  - Deve descrever o problema/solicitação de forma concisa

- **descricao** (text, obrigatório)
  - Descrição detalhada do problema ou solicitação
  - Suporta texto longo e formatação básica

### Classificação
- **status** (enum, obrigatório, default: "aberto")
  - Estados possíveis: `aberto`, `em_andamento`, `aguardando_cliente`, `aguardando_interno`, `resolvido`, `fechado`, `cancelado`
  - Workflow configurável por departamento

- **prioridade** (enum, obrigatório, default: "media")
  - Níveis: `baixa`, `media`, `alta`, `urgente`
  - Afeta ordem de atendimento e cálculo de SLA

- **tipo** (enum, nullable)
  - Tipos: `incidente`, `requisicao`, `problema`, `mudanca`, `consulta`
  - Usado para categorização e relatórios

### Relacionamentos
- **clienteId** (UUID, FK → system.cliente, obrigatório)
  - Cliente ao qual o chamado pertence

- **contatoId** (UUID, FK → system.contato, nullable)
  - Contato específico que abriu o chamado
  - Se null, chamado foi aberto por sistema interno

- **departamentoId** (UUID, FK → system.departamento, obrigatório)
  - Departamento responsável pelo atendimento

- **categoriaId** (UUID, FK → helpdesk.categoria, nullable)
  - Categoria do chamado para classificação

- **atendenteId** (UUID, FK → system.usuario, nullable)
  - Atendente atualmente responsável
  - Null = não atribuído

- **supervisorId** (UUID, FK → system.usuario, nullable)
  - Supervisor acompanhando o chamado

### Controle de SLA
- **slaId** (UUID, FK → helpdesk.sla, nullable)
  - Configuração de SLA aplicada ao chamado

- **dataLimiteSla** (datetime, nullable)
  - Data/hora limite para resolução conforme SLA
  - Calculado automaticamente com base no slaId

- **violouSla** (boolean, default: false)
  - Indica se o SLA foi violado

### Datas e Auditoria
- **dataAbertura** (datetime, obrigatório)
  - Data/hora de criação do chamado
  - Gerado automaticamente

- **dataPrimeiraResposta** (datetime, nullable)
  - Data/hora da primeira interação do atendente
  - Usado para métricas de tempo de resposta

- **dataResolucao** (datetime, nullable)
  - Data/hora em que o chamado foi marcado como resolvido

- **dataFechamento** (datetime, nullable)
  - Data/hora do fechamento definitivo
  - Apenas chamados fechados têm este campo preenchido

- **dataCancelamento** (datetime, nullable)
  - Data/hora do cancelamento (se aplicável)

- **dataUltimaAtualizacao** (datetime, obrigatório)
  - Data/hora da última modificação
  - Atualizado automaticamente

- **criadoPorId** (UUID, FK → system.usuario, obrigatório)
  - Usuário que criou o chamado

- **atualizadoPorId** (UUID, FK → system.usuario, nullable)
  - Último usuário a modificar o chamado

### Métricas
- **tempoTotalAtendimento** (integer, nullable)
  - Tempo total em minutos desde abertura até fechamento
  - Calculado automaticamente

- **tempoEsperaCliente** (integer, default: 0)
  - Tempo acumulado em status "aguardando_cliente" (minutos)

- **numeroReatribui­coes** (integer, default: 0)
  - Quantidade de vezes que foi reatribuído

- **numeroEscalacoes** (integer, default: 0)
  - Quantidade de vezes que foi escalado

### Outros
- **canal** (enum, nullable)
  - Canal de origem: `web`, `email`, `telefone`, `chat`, `whatsapp`, `api`, `sistema`

- **avaliacaoSatisfacao** (integer, nullable, min: 1, max: 5)
  - Nota de satisfação dada pelo cliente (1-5)

- **comentarioAvaliacao** (text, nullable)
  - Comentário opcional na avaliação

- **tags** (array[string], nullable)
  - Tags contextuais para busca e categorização

- **metadados** (jsonb, nullable)
  - Dados adicionais específicos do cliente/integração

## Relacionamentos

### Pertence a:
- `system.cliente` (1:N - um cliente tem muitos chamados)
- `system.contato` (1:N - um contato pode ter muitos chamados)
- `system.departamento` (1:N - um departamento atende muitos chamados)
- `helpdesk.categoria` (1:N - uma categoria pode ter muitos chamados)
- `helpdesk.sla` (1:N - um SLA se aplica a muitos chamados)

### Tem muitos:
- `helpdesk.comentario` (1:N - um chamado tem muitos comentários)
- `helpdesk.anexo` (1:N - um chamado pode ter muitos anexos)
- `helpdesk.historico` (1:N - registros de mudanças de status)

### Pode ter:
- Chamado pai (relacionamento hierárquico - chamados relacionados)
- Chamados filhos (sub-chamados)

## Índices

### Primário
- `PRIMARY KEY (id)`

### Únicos
- `UNIQUE (numero)`

### Busca
- `INDEX idx_chamado_cliente (clienteId)`
- `INDEX idx_chamado_contato (contatoId)`
- `INDEX idx_chamado_departamento (departamentoId)`
- `INDEX idx_chamado_atendente (atendenteId)`
- `INDEX idx_chamado_status (status)`
- `INDEX idx_chamado_prioridade (prioridade)`
- `INDEX idx_chamado_sla (slaId, dataLimiteSla)`
- `INDEX idx_chamado_data_abertura (dataAbertura DESC)`
- `INDEX idx_chamado_data_atualizacao (dataUltimaAtualizacao DESC)`

### Full-text
- `FULLTEXT idx_chamado_busca (numero, titulo, descricao)`

## Permissões

### Read (helpdesk:chamado:read)
- **atendente**: apenas chamados do seu departamento
- **supervisor**: todos do seu departamento + departamentos subordinados
- **admin**: todos os chamados
- **cliente**: apenas chamados do seu clienteId (via sac)
- **contato**: apenas chamados onde contatoId = seu id (via sac)

### Write (helpdesk:chamado:write)
- **atendente**: pode criar e editar chamados do seu departamento
- **supervisor**: pode criar e editar chamados do seu departamento + subordinados
- **admin**: pode criar e editar qualquer chamado
- **cliente/contato**: pode criar novos chamados, mas apenas adicionar comentários em existentes

### Delete (helpdesk:chamado:delete)
- **admin**: pode deletar qualquer chamado
- Soft delete preferencial (marcar como cancelado)

### Status Transitions
Permissões específicas para mudanças de status:
- `aberto → em_andamento`: atendente, supervisor, admin
- `em_andamento → aguardando_cliente`: atendente, supervisor, admin
- `em_andamento → resolvido`: atendente, supervisor, admin
- `resolvido → fechado`: atendente, supervisor, admin, cliente (aprovação)
- `* → cancelado`: supervisor, admin

## Validações

### Obrigatórios no Create
- titulo (não vazio, max 255)
- descricao (não vazio)
- clienteId (deve existir em system.cliente)
- departamentoId (deve existir e estar ativo)
- prioridade (valor enum válido)

### Regras de Negócio
1. **dataFechamento** só pode ser definida se status = "fechado"
2. **dataCancelamento** só pode ser definida se status = "cancelado"
3. **avaliacaoSatisfacao** só pode ser definida após chamado fechado
4. **atendenteId** deve pertencer ao departamentoId indicado
5. Ao mudar para "resolvido", deve ter pelo menos 1 comentário de resolução
6. **violouSla** = true se (agora > dataLimiteSla) e status != "fechado"

### Valores Padrão
- status = "aberto"
- prioridade = "media"
- dataAbertura = now()
- dataUltimaAtualizacao = now()
- criadoPorId = usuário da requisição
- numeroReatribuicoes = 0
- numeroEscalacoes = 0
- violouSla = false

## Exemplo de Query JQEL

### Buscar chamados abertos do departamento
```json
{
  "schema": "helpdesk",
  "select": "chamado",
  "where": {
    "departamentoId": { "$eq": "uuid-do-departamento" },
    "status": { "$in": ["aberto", "em_andamento"] }
  },
  "options": {
    "orderBy": [
      { "field": "prioridade", "direction": "DESC" },
      { "field": "dataAbertura", "direction": "ASC" }
    ],
    "limit": 50
  },
  "output": ["id", "numero", "titulo", "status", "prioridade", "dataAbertura", "atendenteId"]
}
```

### Criar novo chamado
```json
{
  "schema": "helpdesk",
  "mutate": "chamado",
  "action": "insert",
  "values": {
    "titulo": "Sistema não está respondendo",
    "descricao": "Detalhes do problema...",
    "clienteId": "uuid-cliente",
    "contatoId": "uuid-contato",
    "departamentoId": "uuid-departamento",
    "prioridade": "alta",
    "canal": "web"
  }
}
```

### Atribuir chamado a atendente
```json
{
  "schema": "helpdesk",
  "mutate": "chamado",
  "action": "update",
  "where": {
    "id": { "$eq": "uuid-chamado" }
  },
  "values": {
    "atendenteId": "uuid-atendente",
    "status": "em_andamento"
  }
}
```

## Eventos Publicados

Ao modificar um chamado, o sistema publica eventos via Redis Pub/Sub:

- `helpdesk.chamado.criado` - novo chamado criado
- `helpdesk.chamado.atualizado` - chamado modificado
- `helpdesk.chamado.atribuido` - chamado atribuído a atendente
- `helpdesk.chamado.status_alterado` - mudança de status
- `helpdesk.chamado.sla_violado` - SLA violado
- `helpdesk.chamado.fechado` - chamado fechado
