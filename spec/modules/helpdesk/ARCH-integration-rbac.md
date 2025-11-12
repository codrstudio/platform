# RBAC sem Autenticação

## Visão Geral

Os módulos helpdesk, sac e gestao-sac **não implementam autenticação própria**. Toda autenticação e autorização é delegada à **plataforma**.

**Princípio fundamental**: Módulos definem **papéis e permissões**, mas a plataforma é responsável por:
- Autenticar usuários (login, JWT)
- Validar tokens
- Verificar permissões em cada requisição

## Autenticação (Responsabilidade da Plataforma)

### Fluxo de Autenticação

```
┌─────────┐
│ Usuário │  Acessa aplicação
└────┬────┘
     │
     ▼
┌──────────────┐
│  Plataforma  │  Verifica se está autenticado
│   (Router)   │  Se não: redireciona para /login
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ auth-login   │  Workflow n8n processa login
│  (n8n)       │  Valida credenciais
└──────┬───────┘  Emite JWT + refresh token
       │
       ▼
┌──────────────┐
│  Plataforma  │  Armazena JWT em localStorage
│   (Frontend) │  Inclui em todas requisições: Authorization: Bearer {jwt}
└──────────────┘
```

### JWT Payload

Token JWT contém informações do usuário:

```json
{
  "sub": "uuid-usuario",
  "email": "usuario@example.com",
  "nome": "João Silva",
  "papeis": ["atendente", "helpdesk:operador"],
  "departamentoId": "uuid-departamento",
  "clienteId": null,
  "iat": 1640000000,
  "exp": 1640086400
}
```

## Autorização (Integração Módulo ↔ Plataforma)

### Definição de Papéis por Módulo

Cada módulo define os papéis que utiliza:

#### Módulo: helpdesk

| Papel | Descrição | Escopo |
|-------|-----------|--------|
| `helpdesk:atendente` | Atendente de suporte | Departamento |
| `helpdesk:supervisor` | Supervisor de equipe | Departamento + subordinados |
| `helpdesk:admin` | Administrador do helpdesk | Global |

#### Módulo: sac

| Papel | Descrição | Escopo |
|-------|-----------|--------|
| `sac:cliente` | Cliente com acesso ao portal | Próprio clienteId |
| `sac:contato` | Contato de cliente | Próprios chamados |

#### Módulo: gestao-sac

| Papel | Descrição | Escopo |
|-------|-----------|--------|
| `gestao:gestor` | Gestor de SAC | Global (leitura) |
| `gestao:admin` | Administrador | Global (leitura/escrita) |

### Definição de Permissões

Permissões seguem formato:
```
{schema}:{entidade}:{operacao}
```

#### Operações Base
- `read` - Leitura
- `write` - Criação e edição
- `delete` - Exclusão

#### Mapeamento Papel → Permissões

**helpdesk:atendente**
```json
{
  "permissions": [
    "helpdesk:chamado:read",
    "helpdesk:chamado:write",
    "helpdesk:comentario:read",
    "helpdesk:comentario:write",
    "helpdesk:anexo:read",
    "helpdesk:anexo:write",
    "helpdesk:categoria:read",
    "system:cliente:read",
    "system:contato:read",
    "system:departamento:read"
  ],
  "scope": {
    "departamentoId": "{usuario.departamentoId}"
  }
}
```

**helpdesk:supervisor**
```json
{
  "permissions": [
    "helpdesk:*:read",
    "helpdesk:*:write",
    "system:cliente:read",
    "system:contato:read",
    "system:departamento:read"
  ],
  "scope": {
    "departamentoId": {
      "$in": ["{usuario.departamentoId}", "{subordinados}"]
    }
  }
}
```

**sac:cliente**
```json
{
  "permissions": [
    "helpdesk:chamado:read",
    "helpdesk:chamado:write",
    "helpdesk:comentario:read",
    "helpdesk:comentario:write",
    "helpdesk:anexo:read",
    "helpdesk:anexo:write",
    "helpdesk:categoria:read"
  ],
  "scope": {
    "clienteId": "{usuario.clienteId}"
  }
}
```

**gestao:admin**
```json
{
  "permissions": [
    "helpdesk:*:*",
    "system:*:*"
  ],
  "scope": null  // acesso global
}
```

## Validação de Permissões

### Fluxo de Autorização

```
┌──────────┐
│ Frontend │  Faz requisição JQEL com JWT
└─────┬────┘
      │ POST /api/jqel
      │ Authorization: Bearer {jwt}
      │
      ▼
┌─────────────┐
│   Backend   │  1. Valida JWT (assinatura, expiração)
│ (Middleware)│  2. Extrai payload (papeis, departamentoId, clienteId)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Authorize  │  3. Verifica se usuário tem permissão para:
│ (Middleware)│     - Schema (helpdesk, system)
└──────┬──────┘     - Entidade (chamado, cliente)
       │            - Operação (read, write, delete)
       │
       ▼
┌─────────────┐
│  Apply RLS  │  4. Aplica Row-Level Security:
│ (Middleware)│     - Filtra por departamentoId (atendente)
└──────┬──────┘     - Filtra por clienteId (cliente SAC)
       │            - Adiciona condições ao WHERE
       │
       ▼
┌─────────────┐
│ Forward n8n │  5. Encaminha query segura para n8n
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Response  │  6. Retorna apenas dados que usuário pode ver
└─────────────┘
```

### Exemplo: Row-Level Security (RLS)

#### Query Original (Cliente via SAC)
```json
{
  "schema": "helpdesk",
  "select": "chamado",
  "where": {
    "status": { "$eq": "aberto" }
  }
}
```

#### Após Aplicar RLS
```json
{
  "schema": "helpdesk",
  "select": "chamado",
  "where": {
    "$and": [
      { "status": { "$eq": "aberto" } },
      { "clienteId": { "$eq": "uuid-do-cliente" } }  // ← Adicionado pelo backend
    ]
  }
}
```

#### Query Original (Atendente)
```json
{
  "schema": "helpdesk",
  "select": "chamado",
  "where": {
    "prioridade": { "$eq": "alta" }
  }
}
```

#### Após Aplicar RLS
```json
{
  "schema": "helpdesk",
  "select": "chamado",
  "where": {
    "$and": [
      { "prioridade": { "$eq": "alta" } },
      { "departamentoId": { "$eq": "uuid-do-departamento" } }  // ← Adicionado
    ]
  }
}
```

## Implementação no Backend

### Middleware de Autorização

```typescript
// middleware/authorize.ts
export function authorize(req: Request, res: Response, next: NextFunction) {
  const query = req.body;
  const user = req.user; // extraído do JWT pelo middleware authenticate

  // 1. Verificar se tem permissão para o schema + operação
  const operation = query.select ? 'read' : 'write';
  const permission = `${query.schema}:${query.select || query.mutate}:${operation}`;

  if (!userHasPermission(user, permission)) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Você não tem permissão para esta operação'
      }
    });
  }

  // 2. Aplicar Row-Level Security
  req.body = applyRowLevelSecurity(query, user);

  next();
}
```

### Aplicação de RLS

```typescript
// utils/row-level-security.ts
export function applyRowLevelSecurity(query: JQELQuery, user: User): JQELQuery {
  const papel = user.papeis[0]; // papel principal

  switch (papel) {
    case 'helpdesk:atendente':
      // Filtrar por departamento
      return {
        ...query,
        where: {
          $and: [
            query.where || {},
            { departamentoId: { $eq: user.departamentoId } }
          ]
        }
      };

    case 'sac:cliente':
      // Filtrar por clienteId
      return {
        ...query,
        where: {
          $and: [
            query.where || {},
            { clienteId: { $eq: user.clienteId } }
          ]
        }
      };

    case 'sac:contato':
      // Filtrar por contatoId (apenas seus chamados)
      return {
        ...query,
        where: {
          $and: [
            query.where || {},
            { contatoId: { $eq: user.contatoId } }
          ]
        }
      };

    case 'helpdesk:admin':
    case 'gestao:admin':
      // Sem filtro adicional (acesso global)
      return query;

    default:
      throw new Error(`Papel desconhecido: ${papel}`);
  }
}
```

## Frontend: Controle de UI

### Verificação de Permissões no Frontend

```typescript
// hooks/usePermissions.ts
import { useAuth } from '@/contexts/AuthContext';

export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    // Admin tem todas permissões
    if (user.papeis.includes('helpdesk:admin') ||
        user.papeis.includes('gestao:admin')) {
      return true;
    }

    // Verificar permissão específica
    const [schema, entity, operation] = permission.split(':');

    // Mapear papéis para permissões
    const permissions = getRolePermissions(user.papeis);

    return permissions.some(p => {
      if (p === permission) return true;
      if (p === `${schema}:*:${operation}`) return true;
      if (p === `${schema}:${entity}:*`) return true;
      if (p === `${schema}:*:*`) return true;
      return false;
    });
  };

  const canRead = (schema: string, entity: string) =>
    hasPermission(`${schema}:${entity}:read`);

  const canWrite = (schema: string, entity: string) =>
    hasPermission(`${schema}:${entity}:write`);

  const canDelete = (schema: string, entity: string) =>
    hasPermission(`${schema}:${entity}:delete`);

  return { hasPermission, canRead, canWrite, canDelete };
}
```

### Uso em Componentes

```typescript
// components/ChamadoActions.tsx
function ChamadoActions({ chamado }: Props) {
  const { canWrite, canDelete } = usePermissions();

  return (
    <div>
      {canWrite('helpdesk', 'chamado') && (
        <Button onClick={handleEdit}>Editar</Button>
      )}

      {canDelete('helpdesk', 'chamado') && (
        <Button variant="destructive" onClick={handleDelete}>
          Deletar
        </Button>
      )}
    </div>
  );
}
```

### Proteção de Rotas

```typescript
// components/ProtectedRoute.tsx
function ProtectedRoute({ permission, children }: Props) {
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasPermission(permission)) {
      toast.error('Você não tem permissão para acessar esta página');
      navigate('/dashboard');
    }
  }, [permission, hasPermission]);

  if (!hasPermission(permission)) {
    return null;
  }

  return <>{children}</>;
}

// Uso
<Route
  path="/gestao-sac/automacoes"
  element={
    <ProtectedRoute permission="helpdesk:automacao:read">
      <AutomacoesPage />
    </ProtectedRoute>
  }
/>
```

## Gestão de Papéis e Usuários

### Atribuição de Papéis

A plataforma fornece interface para:
1. Criar usuários
2. Atribuir papéis
3. Definir escopo (departamentoId, clienteId)

```typescript
// Exemplo: Criar atendente
POST /api/jqel
{
  "schema": "platform",
  "mutate": "usuario",
  "action": "insert",
  "values": {
    "nome": "Maria Santos",
    "email": "maria@example.com",
    "papeis": ["helpdesk:atendente"],
    "departamentoId": "uuid-departamento-suporte"
  }
}
```

### Múltiplos Papéis

Um usuário pode ter múltiplos papéis:

```json
{
  "papeis": [
    "helpdesk:atendente",
    "helpdesk:supervisor"
  ]
}
```

Sistema avalia permissões de **todos os papéis** (união de permissões).

## Auditoria

Toda operação JQEL é automaticamente auditada:

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "usuarioId": "uuid",
  "email": "usuario@example.com",
  "papeis": ["helpdesk:atendente"],
  "operacao": "update",
  "schema": "helpdesk",
  "entidade": "chamado",
  "registroId": "uuid-chamado",
  "alteracoes": {
    "status": { "antes": "aberto", "depois": "em_andamento" }
  }
}
```

## Resumo: O que Módulos NÃO fazem

❌ **Login**: Não implementam tela de login
❌ **Validação de senha**: Não verificam credenciais
❌ **Emissão de JWT**: Não criam tokens
❌ **Gestão de sessão**: Não controlam sessões
❌ **Recuperação de senha**: Não enviam emails de reset

## Resumo: O que Módulos FAZEM

✅ **Definem papéis**: Especificam papéis necessários (atendente, supervisor)
✅ **Definem permissões**: Mapeiam papéis → permissões
✅ **Verificam UI**: Mostram/escondem elementos baseado em permissões
✅ **Confiam na plataforma**: Assumem que JWT é válido se chegou até eles

## Referências

- [SPEC-authentication.md](../../SPEC-authentication.md) - Autenticação da plataforma
- [ARCH-integration-jqel.md](ARCH-integration-jqel.md) - Validação de permissões via JQEL
- [workflows/auth/authorize.json](../../../workflows/auth/authorize.json) - Workflow de autorização
