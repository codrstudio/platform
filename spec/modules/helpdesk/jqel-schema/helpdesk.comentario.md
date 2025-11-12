# Schema: helpdesk.comentario

## Descrição
Comentários e interações em chamados. Representa toda comunicação entre atendentes, supervisores e clientes dentro de um chamado.

## Campos

### Identificação
- **id** (UUID, PK, obrigatório)
  - Identificador único do comentário

- **chamadoId** (UUID, FK → helpdesk.chamado, obrigatório)
  - Chamado ao qual o comentário pertence

### Conteúdo
- **mensagem** (text, obrigatório)
  - Conteúdo do comentário
  - Suporta texto longo e formatação básica (Markdown)

- **tipo** (enum, obrigatório, default: "comentario")
  - Tipos possíveis:
    - `comentario` - comentário comum
    - `resolucao` - descrição da resolução do problema
    - `nota_interna` - nota privada entre atendentes
    - `email` - comentário gerado a partir de email
    - `sistema` - mensagem automática do sistema

- **visibilidade** (enum, obrigatório, default: "publico")
  - `publico` - visível para cliente e equipe interna
  - `interno` - visível apenas para equipe interna (atendentes, supervisores)

### Autoria
- **autorId** (UUID, FK → system.usuario, obrigatório)
  - Usuário que criou o comentário

- **autorTipo** (enum, obrigatório)
  - Tipo do autor: `atendente`, `supervisor`, `admin`, `cliente`, `contato`, `sistema`
  - Usado para exibição e filtros

### Datas
- **dataCriacao** (datetime, obrigatório)
  - Data/hora de criação do comentário
  - Gerado automaticamente

- **dataEdicao** (datetime, nullable)
  - Data/hora da última edição
  - Null se nunca foi editado

- **editadoPorId** (UUID, FK → system.usuario, nullable)
  - Usuário que editou o comentário

### Flags
- **foiEditado** (boolean, default: false)
  - Indica se o comentário foi editado após criação

- **marcarPrimeiraResposta** (boolean, default: false)
  - Se true, atualiza `dataPrimeiraResposta` do chamado

### Metadata
- **origem** (enum, nullable)
  - Canal de origem: `web`, `email`, `api`, `sistema`

- **metadados** (jsonb, nullable)
  - Dados adicionais (ex: headers de email, IP do cliente, etc)

## Relacionamentos

### Pertence a:
- `helpdesk.chamado` (N:1 - um comentário pertence a um chamado)
- `system.usuario` (N:1 - um comentário tem um autor)

### Tem muitos:
- `helpdesk.anexo` (1:N - um comentário pode ter anexos)

## Índices

### Primário
- `PRIMARY KEY (id)`

### Busca
- `INDEX idx_comentario_chamado (chamadoId, dataCriacao DESC)`
- `INDEX idx_comentario_autor (autorId)`
- `INDEX idx_comentario_tipo (tipo)`
- `INDEX idx_comentario_visibilidade (visibilidade)`

### Full-text
- `FULLTEXT idx_comentario_mensagem (mensagem)`

## Permissões

### Read (helpdesk:comentario:read)
- **atendente/supervisor/admin**:
  - Todos os comentários (incluindo internos) dos chamados que têm permissão
- **cliente/contato**:
  - Apenas comentários públicos dos seus próprios chamados
  - Não vê comentários com `visibilidade = interno`

### Write (helpdesk:comentario:write)
- **atendente/supervisor/admin**:
  - Pode criar comentários públicos e internos
  - Pode editar próprios comentários (dentro de 15 minutos)
- **cliente/contato**:
  - Pode criar apenas comentários públicos
  - Pode editar próprios comentários (dentro de 15 minutos)

### Delete (helpdesk:comentario:delete)
- **admin**: pode deletar qualquer comentário
- **supervisor**: pode deletar comentários do seu departamento
- Soft delete preferencial (marcar como deletado, mas manter no histórico)

## Validações

### Obrigatórios no Create
- mensagem (não vazio, min 1 caractere)
- chamadoId (deve existir em helpdesk.chamado)
- tipo (valor enum válido)
- visibilidade (valor enum válido)

### Regras de Negócio
1. Comentários de tipo `nota_interna` devem ter `visibilidade = interno`
2. Comentários de `cliente/contato` devem ter `visibilidade = publico`
3. Comentários de tipo `sistema` não podem ser editados
4. Apenas o autor pode editar seu comentário (dentro do prazo)
5. Ao criar comentário com `marcarPrimeiraResposta = true`:
   - Atualizar `dataPrimeiraResposta` do chamado (se ainda for null)
   - Autor deve ser atendente/supervisor/admin

### Valores Padrão
- tipo = "comentario"
- visibilidade = "publico"
- dataCriacao = now()
- autorId = usuário da requisição
- autorTipo = tipo do usuário da requisição
- foiEditado = false
- marcarPrimeiraResposta = false

## Exemplo de Query JQEL

### Buscar comentários de um chamado (visão cliente)
```json
{
  "schema": "helpdesk",
  "select": "comentario",
  "where": {
    "chamadoId": { "$eq": "uuid-chamado" },
    "visibilidade": { "$eq": "publico" }
  },
  "options": {
    "orderBy": [{ "field": "dataCriacao", "direction": "ASC" }]
  },
  "output": ["id", "mensagem", "autorId", "autorTipo", "dataCriacao", "foiEditado"]
}
```

### Criar comentário público
```json
{
  "schema": "helpdesk",
  "mutate": "comentario",
  "action": "insert",
  "values": {
    "chamadoId": "uuid-chamado",
    "mensagem": "Estamos analisando o problema...",
    "tipo": "comentario",
    "visibilidade": "publico",
    "marcarPrimeiraResposta": true
  }
}
```

### Criar nota interna (visível apenas para equipe)
```json
{
  "schema": "helpdesk",
  "mutate": "comentario",
  "action": "insert",
  "values": {
    "chamadoId": "uuid-chamado",
    "mensagem": "Cliente já ligou 3x hoje. Priorizar.",
    "tipo": "nota_interna",
    "visibilidade": "interno"
  }
}
```

### Editar comentário
```json
{
  "schema": "helpdesk",
  "mutate": "comentario",
  "action": "update",
  "where": {
    "id": { "$eq": "uuid-comentario" },
    "autorId": { "$eq": "uuid-usuario-atual" }
  },
  "values": {
    "mensagem": "Mensagem corrigida...",
    "foiEditado": true,
    "dataEdicao": "now()"
  }
}
```

## Eventos Publicados

- `helpdesk.comentario.criado` - novo comentário adicionado
- `helpdesk.comentario.editado` - comentário modificado
- `helpdesk.comentario.deletado` - comentário removido

### Payload do Evento
```json
{
  "type": "helpdesk.comentario.criado",
  "target": "chamado:{chamadoId}",
  "data": {
    "comentarioId": "uuid",
    "chamadoId": "uuid",
    "autorId": "uuid",
    "autorTipo": "atendente",
    "visibilidade": "publico",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## Notificações Automáticas

Ao criar comentário, o sistema pode notificar:
- **Comentário público**: notifica cliente/contato + atendente responsável
- **Nota interna**: notifica apenas atendente + supervisor do chamado
- **Primeira resposta**: notifica cliente via email (template configurável)
