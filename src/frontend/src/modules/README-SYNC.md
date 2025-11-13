# ✅ FONTE DA VERDADE - Módulos Disponíveis

## O que mudou?

**ANTES (manual):**
- Você tinha que editar 2 arquivos: `index.ts` E `modules.json`
- Se esquecesse de sincronizar, módulos sumiam ou não apareciam

**AGORA (automático):**
- `index.ts` **É A FONTE DA VERDADE**
- O backend **filtra automaticamente** `modules.json` pelos módulos importados aqui
- Você só precisa comentar/descomentar imports!

## Arquivos Relacionados

- **`index.ts`** (aqui): Controla quais módulos estão disponíveis (**FONTE DA VERDADE**)
- **`modules.json`** (backend): Contém metadados dos módulos (filtrado automaticamente pelo backend)

## Workflow Simplificado ao Adicionar Novo Módulo

### 1. Criar o módulo
```bash
src/frontend/src/modules/meu-novo-modulo/
├── index.ts          # Auto-registra no ModuleRegistry
├── manifest.ts       # Define metadados do módulo
├── routes.ts         # Define rotas do módulo
└── pages/            # Componentes lazy-loaded
```

### 2. Adicionar import no index.ts (aqui)
```typescript
// Descomentar ou adicionar:
import './meu-novo-modulo';
```

### 3. Adicionar metadados no modules.json (backend)
```json
{
  "moduleId": "meu-novo-modulo",
  "name": "Meu Novo Módulo",
  "description": "Descrição do módulo",
  "type": "functionality",
  "dependencies": [],
  "version": "1.0.0",
  "enabled": true,
  "metadata": {}
}
```

### 4. PRONTO!
O backend detecta automaticamente que você importou o módulo e o retorna na lista de módulos disponíveis.

## Como Funciona a Filtragem Automática?

```
┌─────────────────────────────────────────┐
│  Frontend: index.ts                     │
│  import './setup'   // ✅ ativo         │
│  import './auth'    // ✅ ativo         │
│  // import './chat' // ❌ comentado     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Backend: configService.getModules()    │
│  1. Lê modules.json (todos os módulos)  │
│  2. Lê index.ts (módulos importados)    │
│  3. Filtra: retorna apenas importados   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Resultado: ["setup", "auth", "chatify"]│
│  (outros não aparecem, mesmo estando no │
│   modules.json)                         │
└─────────────────────────────────────────┘
```

## ✅ Vantagens

1. **Único ponto de controle**: `index.ts` decide o que está ativo
2. **Sincronização automática**: Backend filtra automaticamente
3. **Menos erros**: Impossível esquecer de sincronizar
4. **Remoção fácil**: Basta comentar o import
5. **Flexibilidade**: `modules.json` pode ter módulos desabilitados para referência futura

## ✅ Checklist ao Adicionar Módulo

- [ ] Criar estrutura do módulo em `src/modules/meu-modulo/`
- [ ] Adicionar import em `src/modules/index.ts`
- [ ] Adicionar entrada em `src/backend/config/modules.json` (metadados)
- [ ] Verificar que ambos usam o mesmo `moduleId`
- [ ] Testar que o módulo aparece na tela "Adicionar Módulos"
- [ ] Testar que as rotas funcionam após adicionar ao portal

## Estado Atual (Módulos Ativos)

Módulos atualmente ativos (importados no index.ts):
1. `setup` - Setup e configuração
2. `auth` - Autenticação
3. `chatify` - Chat em tempo real (v2)

Módulos desabilitados (comentados no index.ts):
- `chat`, `dashboard`, `tasks`, `kanban`, `journey`, `notifications`, `homepage`
- `sidebar`, `loading`, `forms`, `command-palette`, `markbrowser`
- `media-components`, `export-components`, `app-components`

Todos os módulos comentados têm `"enabled": false` no modules.json para referência.
