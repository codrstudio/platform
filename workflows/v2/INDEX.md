# Índice de Workflows v2

Estrutura completa dos workflows refatorados com API plugável.

## Arquivos Criados: 24 total

### Documentação (2 arquivos)
- `README.md` - Guia completo de uso e implementação
- `_contracts.md` - Contratos detalhados de todas as 17 funções API
- `INDEX.md` - Este arquivo (índice)

### API Workflows - Auth (8 arquivos)
Funções plugáveis de autenticação (cliente implementa):

- `api/auth/fn_find_user.json` - Buscar usuário por credenciais
- `api/auth/fn_store_refresh_token.json` - Persistir refresh token
- `api/auth/fn_revoke_refresh_token.json` - Revogar token específico
- `api/auth/fn_revoke_all_user_sessions.json` - Revogar todas sessões
- `api/auth/fn_get_refresh_token.json` - Buscar metadata do token
- `api/auth/fn_revoke_token_family.json` - Revogar família (reuso)
- `api/auth/fn_mark_token_consumed.json` - Marcar token usado
- `api/auth/fn_get_user_permissions.json` - Validar permissões

### API Workflows - System (6 arquivos)
Funções plugáveis de sistema (cliente implementa):

- `api/system/fn_list_schemas.json` - Listar schemas JQEL
- `api/system/fn_list_entities.json` - Listar entidades com metadata
- `api/system/fn_execute_jqel_query.json` - Executar query JQEL (COMPLEXA)
- `api/system/fn_audit_mutation.json` - Registrar auditoria
- `api/system/fn_query_datatable.json` - Query DataTable abstrato
- `api/system/fn_introspect_database.json` - Introspecção de schema

### API Workflows - Chat (3 arquivos)
Funções plugáveis de chat (cliente implementa):

- `api/chat/fn_list_agents.json` - Listar agentes IA
- `api/chat/fn_list_models.json` - Listar modelos LLM
- `api/chat/fn_get_agent_config.json` - Config de agente

### Platform Workflows - Auth (2 arquivos)
Workflows 100% genéricos (não modificados):

- `auth/lib/fn-jwt-emission.json` - Emissão de JWT
- `auth/lib/fn-jwt-validation.json` - Validação de JWT

### Platform Workflows - System (1 arquivo)
Workflows 100% genéricos (não modificados):

- `system/health.json` - Health check

### Platform Workflows - Channels (2 arquivos)
Workflows 100% genéricos (não modificados):

- `channels/fn-notification.json` - Publicar notificação
- `channels/fn-task.json` - Publicar tarefa

## Visão Geral por Categoria

| Categoria | Quantidade | Status |
|-----------|------------|--------|
| **API Auth** | 8 | ✅ Esqueletos criados (JSON mock) |
| **API System** | 6 | ✅ Esqueletos criados (JSON mock) |
| **API Chat** | 3 | ✅ Esqueletos criados (JSON mock) |
| **Platform Auth** | 2 | ✅ Copiados (puros) |
| **Platform System** | 1 | ✅ Copiado (puro) |
| **Platform Channels** | 2 | ✅ Copiados (puros) |
| **Documentação** | 2 | ✅ Completa |
| **TOTAL** | 24 | ✅ |

## Workflows Pendentes (Refatoração)

Estes workflows precisam ser refatorados para chamar as funções API:

### Auth (5 workflows)
- `auth/auth-login.json` - Chamar fn_find_user, fn_store_refresh_token
- `auth/auth-logout.json` - Chamar fn_revoke_refresh_token
- `auth/auth-logout-all.json` - Chamar fn_revoke_all_user_sessions
- `auth/auth-refresh.json` - Chamar fn_get_refresh_token, fn_revoke_token_family, fn_mark_token_consumed
- `auth/authorize.json` - Chamar fn_get_user_permissions

### System (2 workflows)
- `system/chat.json` - Chamar fn_list_agents, fn_list_models, fn_get_agent_config
- `system/request.json` - Chamar fn_list_schemas, fn_introspect_database, fn_query_datatable

### System (1 workflow novo)
- `system/request_database.json` - Chamar fn_execute_jqel_query, fn_audit_mutation

## Mapeamento: Workflow Original → Funções API

### auth-login.json
```
Linha ~278: fn-find-user → api/auth/fn_find_user
Linha ~444: DataTable upsert → api/auth/fn_store_refresh_token
```

### auth-logout.json
```
Linha ~237: DataTable update → api/auth/fn_revoke_refresh_token
```

### auth-logout-all.json
```
Linha ~284: DataTable bulk update → api/auth/fn_revoke_all_user_sessions
```

### auth-refresh.json
```
Linha ~147: DataTable get → api/auth/fn_get_refresh_token
Linha ~161: DataTable bulk update → api/auth/fn_revoke_token_family
Linha ~360: DataTable update → api/auth/fn_mark_token_consumed
Linha ~XXX: fn-find-user → api/auth/fn_find_user
```

### authorize.json
```
Linha ~419: Hardcoded permissions → api/auth/fn_get_user_permissions
```

### chat.json
```
Linha ~106: Hardcoded agents → api/chat/fn_list_agents
Linha ~91: Hardcoded models → api/chat/fn_list_models
Nova: Get agent config → api/chat/fn_get_agent_config
```

### request.json
```
Linha ~493: Hardcoded schemas → api/system/fn_list_schemas
Linha ~479: Database introspection → api/system/fn_introspect_database
Linha ~772: DataTable operations → api/system/fn_query_datatable
```

### request_database.json
```
Linha ~320: Stored procedure execution → api/system/fn_execute_jqel_query
Linha ~363: Audit procedure → api/system/fn_audit_mutation
```

## Próximos Passos

### Fase 1: Implementar API Functions (Cliente)
1. Escolher tecnologia (MySQL, PostgreSQL, MongoDB, REST API)
2. Implementar funções de auth (prioridade ALTA)
3. Implementar funções de system (prioridade MÉDIA)
4. Implementar funções de chat (prioridade BAIXA)
5. Testar cada função isoladamente

### Fase 2: Refatorar Platform Workflows
1. Atualizar auth workflows para chamar API functions
2. Atualizar system workflows para chamar API functions
3. Testar fluxos end-to-end
4. Validar com usuários beta

### Fase 3: Deploy
1. Upload de todos workflows v2 para n8n
2. Ativar workflows gradualmente
3. Monitorar erros e performance
4. Documentar lições aprendidas

## Benefícios Alcançados

✅ **Separação clara**: Platform (genérico) vs API (cliente)
✅ **Contratos bem definidos**: 17 funções documentadas em `_contracts.md`
✅ **Flexibilidade**: Cliente escolhe tecnologia de implementação
✅ **Manutenibilidade**: Platform evolui independente do cliente
✅ **Testabilidade**: Funções API podem ser testadas isoladamente
✅ **Segurança**: Lógica sensível fica sob controle do cliente

## Referências

- `README.md` - Guia completo de implementação
- `_contracts.md` - Contratos detalhados de entrada/saída
- `../workflows/` - Workflows originais (referência)
- `https://docs.n8n.io/workflows/execute-workflow/` - Documentação n8n
