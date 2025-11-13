# Integração com JQEL

## Visão Geral

Todos os módulos do ecossistema HelpDesk/SAC (helpdesk, sac, gestao-sac) acessam dados **exclusivamente via JQEL** (JSON Query Expression Language).

JQEL é o sistema unificado de acesso a dados da plataforma, fornecendo:
- Abstração do banco de dados
- Validação automática de permissões
- Auditoria de todas as operações
- Suporte a queries complexas
- Resposta padronizada (JResult)

## Endpoint

**Todas** as operações de dados devem usar:

```
POST /api/jqel
Content-Type: application/json
Authorization: Bearer {jwt-token}
```

## Schemas Disponíveis

### Namespace: helpdesk

Entidades específicas do domínio de chamados:

| Schema | Descrição | Documentação |
|--------|-----------|--------------|
| `helpdesk.chamado` | Chamados/tickets | [helpdesk.chamado.md](jqel-schema/helpdesk.chamado.md) |
| `helpdesk.comentario` | Comentários em chamados | [helpdesk.comentario.md](jqel-schema/helpdesk.comentario.md) |
| `helpdesk.anexo` | Arquivos anexados | [helpdesk.anexo.md](jqel-schema/helpdesk.anexo.md) |
| `helpdesk.categoria` | Categorias hierárquicas | [helpdesk.categoria.md](jqel-schema/helpdesk.categoria.md) |
| `helpdesk.tag` | Tags contextuais | [helpdesk.tag.md](jqel-schema/helpdesk.tag.md) |
| `helpdesk.sla` | Configurações de SLA | [helpdesk.sla.md](jqel-schema/helpdesk.sla.md) |
| `helpdesk.automacao` | Regras de automação | [helpdesk.automacao.md](jqel-schema/helpdesk.automacao.md) |

### Namespace: system

Entidades compartilhadas com outros módulos do CRM:

| Schema | Descrição | Documentação |
|--------|-----------|--------------|
| `system.cliente` | Clientes (empresas) | [system.cliente.md](jqel-schema/system.cliente.md) |
| `system.contato` | Pessoas de contato | [system.contato.md](jqel-schema/system.contato.md) |
| `system.departamento` | Departamentos internos | [system.departamento.md](jqel-schema/system.departamento.md) |

## Estrutura de Query JQEL

### Select (Leitura)

```json
{
  "schema": "helpdesk" | "system",
  "select": "chamado" | "comentario" | "cliente" | ...,
  "where": {
    "campo": { "$eq": "valor" },
    "outroCampo": { "$in": ["val1", "val2"] }
  },
  "options": {
    "orderBy": [
      { "field": "dataCriacao", "direction": "DESC" }
    ],
    "limit": 50,
    "offset": 0
  },
  "output": ["campo1", "campo2", "campo3"]
}
```

### Mutate (Escrita)

#### Insert
```json
{
  "schema": "helpdesk",
  "mutate": "chamado",
  "action": "insert",
  "values": {
    "titulo": "Novo chamado",
    "descricao": "Descrição...",
    "clienteId": "uuid",
    "departamentoId": "uuid",
    "prioridade": "alta"
  }
}
```

#### Update
```json
{
  "schema": "helpdesk",
  "mutate": "chamado",
  "action": "update",
  "where": {
    "id": { "$eq": "uuid-chamado" }
  },
  "values": {
    "status": "em_andamento",
    "atendenteId": "uuid-atendente"
  }
}
```

#### Delete
```json
{
  "schema": "helpdesk",
  "mutate": "comentario",
  "action": "delete",
  "where": {
    "id": { "$eq": "uuid-comentario" }
  }
}
```

## Operadores Disponíveis

### Comparação
- `$eq` - Igual
- `$ne` - Diferente
- `$gt` - Maior que
- `$gte` - Maior ou igual
- `$lt` - Menor que
- `$lte` - Menor ou igual

### Listas
- `$in` - Contido em array
- `$nin` - Não contido em array

### Strings
- `$contains` - Contém substring (case-insensitive)
- `$startsWith` - Começa com
- `$endsWith` - Termina com

### Lógicos
- `$and` - E lógico (padrão)
- `$or` - OU lógico
- `$not` - Negação

### Null
- `$isNull` - É nulo
- `$isNotNull` - Não é nulo

## Permissões e Autorização

### Validação Automática

Toda requisição JQEL é automaticamente validada:

1. **Autenticação**: JWT válido no header Authorization
2. **Autorização**: Permissão para acessar o schema
3. **Escopo**: Limitação por papel do usuário

### Formato de Permissões

```
{schema}:{entidade}:{operacao}

Exemplos:
- helpdesk:chamado:read
- helpdesk:chamado:write
- system:cliente:read
```

### Papéis e Permissões

| Papel | Permissões | Escopo |
|-------|------------|--------|
| **atendente** | helpdesk:*:read, helpdesk:chamado:write | Apenas seu departamento |
| **supervisor** | helpdesk:*:read/write | Seu departamento + subordinados |
| **admin** | helpdesk:*:*, system:*:* | Todos os dados |
| **cliente** (via SAC) | helpdesk:chamado:read | Apenas seus próprios chamados |
| **contato** (via SAC) | helpdesk:chamado:read | Apenas chamados onde é solicitante |
| **gestor** | system:*:read/write, helpdesk:*:read | Gestão e visualização |

### Row-Level Security (RLS)

O backend aplica automaticamente filtros baseados no papel:

**Exemplo: Cliente via SAC**
```json
// Query do cliente
{
  "schema": "helpdesk",
  "select": "chamado",
  "where": { "status": { "$eq": "aberto" } }
}

// Backend adiciona automaticamente:
where.clienteId = { "$eq": "{clienteId-do-usuario}" }
```

## Padrões de Acesso

### Frontend → JQEL

No frontend, encapsular JQEL com TanStack Query:

```typescript
// hooks/useHelpdeskData.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { jqel } from '@/services/jqel';

export function useChamados(departamentoId?: string) {
  return useQuery({
    queryKey: ['chamados', departamentoId],
    queryFn: () => jqel.query({
      schema: 'helpdesk',
      select: 'chamado',
      where: departamentoId
        ? { departamentoId: { $eq: departamentoId } }
        : {},
      options: {
        orderBy: [{ field: 'dataAbertura', direction: 'DESC' }],
        limit: 50
      },
      output: ['id', 'numero', 'titulo', 'status', 'prioridade']
    })
  });
}

export function useCreateChamado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NovoChamado) => jqel.mutate({
      schema: 'helpdesk',
      mutate: 'chamado',
      action: 'insert',
      values: data
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chamados'] });
    }
  });
}
```

### Backend → n8n (Backbone)

Backend atua como proxy:

1. Recebe query JQEL do frontend
2. Valida JWT e permissões
3. Aplica Row-Level Security
4. Encaminha para n8n via HTTP
5. Retorna resposta padronizada

```typescript
// Backend simplificado
app.post('/api/jqel', authenticate, authorize, async (req, res) => {
  const query = req.body;
  const user = req.user;

  // Aplicar RLS
  const secureQuery = applyRowLevelSecurity(query, user);

  // Enviar para n8n
  const result = await fetch('https://n8n.codrstudio.dev/webhook/jqel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(secureQuery)
  });

  return res.json(await result.json());
});
```

## Tratamento de Erros

### Códigos de Erro

| Código | Significado | Ação |
|--------|-------------|------|
| 401 | Não autenticado | Redirecionar para login |
| 403 | Sem permissão | Mostrar mensagem de acesso negado |
| 404 | Recurso não encontrado | Mostrar "não encontrado" |
| 422 | Validação falhou | Mostrar erros de validação |
| 500 | Erro interno | Mostrar erro genérico + log |

### Formato de Resposta de Erro

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Campos obrigatórios ausentes",
    "details": [
      { "field": "titulo", "message": "Campo obrigatório" },
      { "field": "clienteId", "message": "Cliente não encontrado" }
    ]
  }
}
```

## Performance

### Paginação

Sempre usar `limit` e `offset` para grandes resultados:

```json
{
  "schema": "helpdesk",
  "select": "chamado",
  "options": {
    "limit": 50,
    "offset": 0
  }
}
```

### Projeção (output)

Solicitar apenas campos necessários:

```json
{
  "schema": "helpdesk",
  "select": "chamado",
  "output": ["id", "numero", "titulo", "status"]
  // Não carregar descrição, comentários, etc
}
```

### Cache

TanStack Query implementa cache automático. Configurar:

```typescript
{
  queryKey: ['chamados', filtros],
  staleTime: 5 * 60 * 1000, // 5 minutos
  cacheTime: 10 * 60 * 1000  // 10 minutos
}
```

## Exemplo Completo

### Caso de Uso: Atribuir Chamado

**Frontend:**
```typescript
const mutation = useMutation({
  mutationFn: async ({ chamadoId, atendenteId }: AtribuirParams) => {
    return jqel.mutate({
      schema: 'helpdesk',
      mutate: 'chamado',
      action: 'update',
      where: {
        id: { $eq: chamadoId }
      },
      values: {
        atendenteId,
        status: 'em_andamento'
      }
    });
  },
  onSuccess: (data, variables) => {
    queryClient.invalidateQueries({ queryKey: ['chamados'] });
    queryClient.invalidateQueries({
      queryKey: ['chamado', variables.chamadoId]
    });
    toast.success('Chamado atribuído com sucesso');
  },
  onError: (error) => {
    toast.error('Erro ao atribuir chamado');
  }
});
```

**Uso:**
```typescript
<Button onClick={() => mutation.mutate({
  chamadoId: '123',
  atendenteId: '456'
})}>
  Atribuir para mim
</Button>
```

## Referências

- [SPEC-data-access.md](../../SPEC-data-access.md) - Especificação completa de JQEL
- [SPEC-jqel-syntax.md](../../SPEC-jqel-syntax.md) - Sintaxe JQEL detalhada
- [SPEC-jqel-schemas-organization.md](../../SPEC-jqel-schemas-organization.md) - Organização de schemas
- Schemas individuais em [jqel-schema/](jqel-schema/)
