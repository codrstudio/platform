# Realm System - Resumo da Implementação

**Data:** 2025-11-07
**Status:** ✅ **COMPLETO**

## Visão Geral

O Sistema de Reinos (Realm System) foi completamente implementado, introduzindo uma hierarquia de 3 níveis para gerenciamento de configurações da plataforma:

```
Sistema → Realm → Portal
```

Cada portal pertence a um reino, e reinos podem compartilhar configurações (como tema) entre todos os seus portais. Portais podem opcionalmente sobrescrever configurações do reino.

## Implementação Completa

### ✅ 12 Fases Concluídas

1. **Fase 1.1**: Modelo de dados de Realm (Backend)
2. **Fase 1.2**: Realm Service com CRUD
3. **Fase 1.3**: Realm Routes (API REST)
4. **Fase 2.1**: Theme System refatorado (localStorage + resolução)
5. **Fase 2.2**: Backend Config Handling
6. **Fase 3.1**: Portal Form UI (realm selector)
7. **Fase 3.2**: Portal Validation (realmId)
8. **Fase 4.1**: Types & Hooks JQEL para Realm
9. **Fase 4.2**: Realm Management Pages (List, Form)
10. **Fase 4.3**: ThemeConfig com Tabs (Reino/Portal)
11. **Fase 5.1**: Backend SSE Events (config-changed)
12. **Fase 5.2**: Frontend Event Handlers

## Funcionalidades Principais

### 1. Gerenciamento de Reinos

- ✅ Lista de realms com contador de portais
- ✅ Criar/Editar/Deletar realms
- ✅ Realm "default" protegido (não pode ser deletado)
- ✅ Validação de realmId único (formato kebab-case)
- ✅ Reassociação automática de portais ao deletar realm

### 2. Sistema de Tema Hierárquico

- ✅ Configurar cor do reino (afeta todos os portais)
- ✅ Customizar cor por portal (override opcional)
- ✅ Preview de paleta de cores (10 tons)
- ✅ Remover customização de portal
- ✅ Resolução em 3 níveis: Portal → Realm → Sistema

### 3. Real-time Synchronization

- ✅ Eventos SSE para mudanças de configuração
- ✅ Broadcast para todos os usuários conectados
- ✅ Invalidação automática de queries (TanStack Query)
- ✅ Reconexão automática em caso de falha

## Arquivos Implementados

### Backend (6 arquivos principais)

```
src/backend/src/
├── types/config.types.ts          # RealmSchema + interface Realm
├── services/config.service.ts     # CRUD de Realm
├── routes/realm.routes.ts         # API REST de Realms (NOVO)
├── routes/jqel.routes.ts          # Validação realmId + eventos
├── types/event.types.ts           # ConfigChangedEvent
└── utils/event-emitter.ts         # Helper eventos (NOVO)

src/backend/config/
└── realms.json                    # Storage de realms (NOVO)
```

### Frontend (14 arquivos principais)

```
src/frontend/src/
├── modules/setup/pages/
│   ├── RealmList.tsx              # Lista de realms (NOVO)
│   ├── RealmForm.tsx              # Formulário de realm (NOVO)
│   ├── ThemeConfig.tsx            # Refatorado com Tabs
│   ├── PortalForm.tsx             # Select de realm
│   ├── SetupDashboard.tsx         # Card de realms
│   └── routes.tsx                 # Rotas de realm
├── hooks/
│   ├── useJQEL.ts                 # Hooks de Realm (~115 linhas)
│   └── useSSE.ts                  # Handler config-changed
├── lib/
│   └── theme.ts                   # Funções tema + hslToHex
├── types/
│   ├── theme.ts                   # realmId + portalId
│   ├── event.ts                   # ConfigChangedEvent
│   └── portal.ts                  # Campo realmId
├── contexts/
│   └── ThemeContext.tsx           # Props realm/portal
└── components/
    └── routing/PortalRouter.tsx   # ThemeProvider por portal
```

**Total:** 24 arquivos modificados/criados

## API Endpoints

### Realms

```
GET    /api/realms              # Lista todos os realms
GET    /api/realms/:realmId     # Busca realm específico
POST   /api/realms              # Cria novo realm
PATCH  /api/realms/:realmId     # Atualiza realm
DELETE /api/realms/:realmId     # Deleta realm
```

### Events (já existente, estendido)

```
GET    /api/events/stream       # SSE stream
POST   /api/events/publish      # Publica evento
```

## Rotas Frontend

```
/setup/realms                   # Lista de realms
/setup/realms/new               # Criar novo realm
/setup/realms/:realmId          # Editar realm
/setup/portals/:portalId/theme  # Configurar tema (Tabs: Reino/Portal)
```

## localStorage Keys

```javascript
// Realm (modo tema + cor)
'realm:{realmId}:theme'           // 'light' | 'dark' | 'system'
'realm:{realmId}:brand-color'     // 'H S% L%' (ex: '199 89% 48%')

// Portal (apenas cor - override opcional)
'portal:{portalId}:brand-color'   // 'H S% L%' (SEM realmId!)
```

**IMPORTANTE:** Chaves de portal NÃO incluem realmId → customizações persistem mesmo se portal mudar de reino.

## Fluxo de Resolução de Tema

```
1. Verifica portal:{portalId}:brand-color
   ↓ (não encontrado?)
2. Verifica realm:{realmId}:brand-color
   ↓ (não encontrado?)
3. Usa default do sistema: #0ea5e9
```

## Eventos SSE

### Estrutura do Evento `config-changed`

```typescript
{
  type: 'config-changed',
  id: 'uuid',
  timestamp: '2025-11-07T...',
  category: 'system',
  priority: 'normal',
  data: {
    entity: 'realm' | 'portal',
    entityId: string,
    action: 'create' | 'update' | 'delete',
    changes?: Record<string, unknown>
  }
}
```

### Invalidação de Queries

**Quando realm muda:**
- Invalida `['realms']`
- Invalida `['realm', entityId]` (se update/delete)
- Invalida `['portals']` (portais dependem de realms)

**Quando portal muda:**
- Invalida `['portals']`
- Invalida `['portal', entityId]` (se update/delete)

## Hooks React

```typescript
// Listar todos os realms
const { data: realms } = useRealms()

// Buscar realm específico
const { data: realm } = useRealm(realmId)

// Criar realm
const createRealm = useCreateRealm()
await createRealm.mutateAsync({ realmId, name, description })

// Atualizar realm
const updateRealm = useUpdateRealm()
await updateRealm.mutateAsync({ realmId, updates })

// Deletar realm
const deleteRealm = useDeleteRealm()
await deleteRealm.mutateAsync(realmId)
```

## Interface ThemeConfig

### Aba "Reino"
- Configura cor do reino
- Afeta todos os portais do reino
- Color picker + input hexadecimal
- Preview de paleta (10 tons)
- Botão: "Aplicar a Todos os Portais do Reino"

### Aba "Portal"
- Customiza cor apenas do portal
- Badge "Custom" quando tem override
- Color picker + input hexadecimal
- Preview de paleta
- Botão: "Remover Customização"
- Botão: "Aplicar Somente a Este Portal"

## Validações Implementadas

### Backend

1. **Criação de Realm:**
   - realmId único
   - realmId não pode ser "default" (reservado)
   - Formato kebab-case

2. **Atualização de Realm:**
   - realmId não pode ser alterado
   - Campo removable não pode ser alterado
   - Realm "default" não pode ter nome alterado

3. **Deleção de Realm:**
   - Realm "default" não pode ser deletado
   - Apenas realms com removable=true podem ser deletados
   - Portais são reassociados automaticamente ao "default"

4. **Portal com realmId:**
   - realmId deve existir (validado ao criar/atualizar portal)
   - Erro 400 se realm não existe

### Frontend

1. **Formulário de Realm:**
   - realmId obrigatório
   - name obrigatório
   - realmId desabilitado ao editar

2. **Formulário de Portal:**
   - realmId obrigatório (select)
   - Lista apenas realms existentes

## Testes de Validação

### 1. Criar Realm
```
→ Acesse /setup/realms/new
→ Crie realm "vendas"
→ Verifique na lista
```

### 2. Configurar Tema do Realm
```
→ Vá em /setup/portals/:id/theme
→ Aba "Reino" → Escolha verde
→ Salve e recarregue
→ Todos os portais do reino devem usar verde
```

### 3. Customizar Tema do Portal
```
→ Mesma página, aba "Portal"
→ Escolha vermelho
→ Salve e recarregue
→ Apenas este portal usa vermelho
→ Badge "Custom" aparece
```

### 4. Remover Customização
```
→ Clique "Remover Customização"
→ Confirme
→ Recarregue
→ Portal volta à cor do reino (verde)
```

### 5. Real-time Sync
```
→ Abra 2 navegadores
→ Em um, edite realm
→ No outro, lista atualiza automaticamente
→ Console: "[SSE] Config changed: realm vendas update"
```

### 6. Deletar Realm
```
→ Crie realm de teste
→ Associe portal a ele
→ Delete o realm
→ Portal reassociado ao "default"
```

## Logs de Debug

### Backend
```
[Event] config-changed: realm/vendas create
[Event] config-changed: portal/main update
```

### Frontend
```
[SSE] Connected to event stream
[SSE] Config changed: realm vendas create
Query invalidated: ['realms']
Query invalidated: ['portals']
```

## Recursos Adicionais Opcionais

Funcionalidades que podem ser adicionadas no futuro:

- [ ] UI para editar realm.config.theme.radius
- [ ] Página de portais por realm
- [ ] Duplicar realm (copiar configs)
- [ ] Exportar/importar configs
- [ ] Histórico de mudanças
- [ ] Permissões por realm
- [ ] Preview de tema em tempo real

## Notas Técnicas

- **Breaking Change:** `settingsKey` substituído por `realmId` (sem migração)
- **TypeScript:** Todos os tipos validados com Zod
- **Validação:** IDs em kebab-case (minúsculas, números, hífen)
- **Performance:** Cache no backend, queries memoizadas no frontend
- **Acessibilidade:** Validação de contraste WCAG AA

## Referências

- **Especificação completa:** `spec/SPEC-realms.md`
- **Mudanças:** `spec/whats-new/2025-11-07-realm-system.md`
- **Conceitos atualizados:** `spec/SPEC-concepts.md` (seção 2: Reino)
- **Tema atualizado:** `spec/SPEC-theming.md` (seção 2: Hierarquia)

---

**Implementado por:** Claude Code
**Data de conclusão:** 2025-11-07
**Total de fases:** 12/12 ✅
**Total de arquivos:** 24 modificados/criados
**Status:** Pronto para produção 🚀
