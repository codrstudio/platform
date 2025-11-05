
# SPEC-module-loading.md

## Especificação: Sistema de Carregamento de Módulos

### Escopo
Este documento especifica como módulos são carregados dinamicamente, registrados, e gerenciados em runtime na plataforma.

---

## 1. Definição

### Propósito
Definir a estrutura, processo e requisitos para carregamento dinâmico (lazy loading) de módulos, garantindo performance, isolamento e extensibilidade.

### Princípios
- **Lazy loading obrigatório**: Módulos só são carregados quando necessários
- **Code splitting automático**: Cada módulo é um bundle separado
- **Registro declarativo**: Módulos declaram capacidades, plataforma injeta
- **Hot activation**: Módulos podem ser ativados em runtime sem reload

---

## 2. Estrutura de Módulo

### Arquivo de Manifest

**SPEC-LOAD-S-001:** Todo módulo DEVE ter arquivo `module.json` na raiz

**SPEC-LOAD-S-002:** Manifest DEVE conter:
```json
{
  "moduleId": "chat",
  "name": "Chat Module",
  "version": "1.0.0",
  "type": "functionality",
  "description": "Sistema de mensagens e conversas",
  "dependencies": ["media-components", "export-components"],
  "exports": {
    "routes": true,
    "components": true,
    "hooks": false,
    "utils": false
  },
  "entrypoint": "./index.tsx",
  "assets": ["./styles.css", "./icons/*"]
}
```

### Campos Obrigatórios

**SPEC-LOAD-S-003:** Campos obrigatórios do manifest:
- `moduleId` (string) - Identificador único
- `name` (string) - Nome legível
- `version` (string) - Semver
- `type` (enum: "functionality" | "components")
- `entrypoint` (string) - Caminho do arquivo principal

### Campos Opcionais

**SPEC-LOAD-S-004:** Campos opcionais do manifest:
- `description` (string)
- `dependencies` (string[]) - IDs de módulos necessários
- `exports` (object) - O que o módulo exporta
- `assets` (string[]) - Arquivos estáticos
- `config` (object) - Schema de configuração de instâncias

---

## 3. Entrypoint do Módulo

### Estrutura do Export

**SPEC-LOAD-E-001:** Entrypoint DEVE usar default export:
```typescript
export default {
  routes?: RouteDefinition[];
  components?: Record<string, React.Component>;
  hooks?: Record<string, Function>;
  onActivate?: (portal: Portal) => void;
  onDeactivate?: (portal: Portal) => void;
}
```

### Rotas

**SPEC-LOAD-E-002:** Se módulo exporta rotas, DEVE ter formato:
```typescript
routes: [
  {
    path: string;
    component: React.ComponentType;
    requiresAuth?: boolean;
    permissions?: string[];
    layout?: 'default' | 'full' | 'minimal';
  }
]
```

**SPEC-LOAD-E-003:** Rotas DEVEM ser relativas (sem prefixo de portal)

**SPEC-LOAD-E-004:** Exemplo:
```typescript
routes: [
  {
    path: '/chat/:instanceId',
    component: ChatRoom,
    requiresAuth: true
  }
]
```

### Componentes

**SPEC-LOAD-E-005:** Se módulo exporta componentes, DEVE usar formato:
```typescript
components: {
  'ComponentName': React.ComponentType
}
```

**SPEC-LOAD-E-006:** Componentes exportados ficam disponíveis globalmente no portal

### Lifecycle Hooks

**SPEC-LOAD-E-007:** Módulo PODE implementar `onActivate`:
```typescript
onActivate: (portal: Portal) => {
  // Executado quando módulo é ativado
  console.log(`Module activated in portal ${portal.id}`);
}
```

**SPEC-LOAD-E-008:** Módulo PODE implementar `onDeactivate`:
```typescript
onDeactivate: (portal: Portal) => {
  // Executado quando módulo é desativado
  // Cleanup de recursos
}
```

---

## 4. Carregamento Inicial

### Ao Abrir Portal

**SPEC-LOAD-I-001:** Quando portal é acessado, plataforma DEVE:
1. Ler configuração do portal via JQEL
2. Identificar módulos ativos
3. Carregar módulos em paralelo
4. Registrar rotas/componentes
5. Renderizar portal

**SPEC-LOAD-I-002:** Fluxo de carregamento:
```typescript
async function loadPortal(portalId: string) {
  // 1. Buscar configuração
  const config = await jqel.query({
    schema: 'platform',
    operation: 'select',
    entity: 'portal',
    where: { portalId }
  });
  
  // 2. Carregar módulos ativos
  const modules = await Promise.all(
    config.activeModules.map(moduleId => 
      loadModule(moduleId)
    )
  );
  
  // 3. Registrar rotas
  modules.forEach(mod => {
    if (mod.routes) {
      registerRoutes(portalId, mod.routes);
    }
  });
  
  // 4. Registrar componentes
  modules.forEach(mod => {
    if (mod.components) {
      registerComponents(portalId, mod.components);
    }
  });
  
  // 5. Executar onActivate
  modules.forEach(mod => {
    mod.onActivate?.(portal);
  });
}
```

### Loading State

**SPEC-LOAD-I-003:** Durante carregamento, portal DEVE exibir loading indicator

**SPEC-LOAD-I-004:** Loading DEVE mostrar progresso se múltiplos módulos

**SPEC-LOAD-I-005:** Exemplo:
```
Carregando módulos... (2/5)
✓ App Components
✓ Media Components
⏳ Chat Module
○ Dashboard Module
○ Menu Module
```

---

## 5. Carregamento Dinâmico (Runtime)

### Ativação em Runtime

**SPEC-LOAD-D-001:** Quando módulo é ativado via Setup, plataforma DEVE:
1. Fazer download do módulo
2. Carregar dependências (se necessário)
3. Registrar rotas/componentes
4. Executar `onActivate`
5. Atualizar UI

**SPEC-LOAD-D-002:** Carregamento DEVE ser em background (não bloquear UI)

**SPEC-LOAD-D-003:** Ao concluir, DEVE exibir notificação de sucesso

**SPEC-LOAD-D-004:** Se falhar, DEVE reverter ativação e exibir erro

**SPEC-LOAD-D-018:** Cache de HTML NÃO DEVE impedir ativação em runtime de funcionar

**SPEC-LOAD-D-019:** Estratégia network-first para HTML DEVE ser usada para garantir que mudanças de configuração sejam refletidas

### Desativação em Runtime

**SPEC-LOAD-D-005:** Quando módulo é desativado via Setup, plataforma DEVE:
1. Executar `onDeactivate`
2. Desregistrar rotas (não renderiza mais)
3. Desregistrar componentes (não acessíveis)
4. **NÃO** descarregar código da memória

**SPEC-LOAD-D-006:** Módulo desativado permanece em memória até refresh

**SPEC-LOAD-D-007:** No próximo acesso ao portal, módulo NÃO DEVE ser carregado

---

## 6. Gerenciamento de Dependências

### Resolução de Dependências

**SPEC-LOAD-DEP-001:** Antes de carregar módulo, plataforma DEVE verificar dependências

**SPEC-LOAD-DEP-002:** Se dependência não está carregada, DEVE carregar primeiro

**SPEC-LOAD-DEP-003:** Carregamento DEVE ser recursivo (dependências de dependências)

**SPEC-LOAD-DEP-004:** Exemplo:
```typescript
async function loadModule(moduleId: string) {
  const manifest = await fetchManifest(moduleId);
  
  // Carregar dependências primeiro
  if (manifest.dependencies) {
    await Promise.all(
      manifest.dependencies.map(dep => 
        loadModule(dep)
      )
    );
  }
  
  // Carregar módulo
  const module = await import(`/modules/${moduleId}/${manifest.entrypoint}`);
  return module.default;
}
```

### Dependências Circulares

**SPEC-LOAD-DEP-005:** Plataforma DEVE detectar dependências circulares

**SPEC-LOAD-DEP-006:** Se detectada, DEVE rejeitar carregamento e exibir erro

**SPEC-LOAD-DEP-007:** Exemplo:
```
Erro: Dependência circular detectada
A → B → C → A

Módulos envolvidos:
- chat
- notifications
- tasks
```

---

## 7. Registro de Rotas

### Injeção no React Router

**SPEC-LOAD-R-001:** Rotas de módulos DEVEM ser injetadas dinamicamente no React Router

**SPEC-LOAD-R-002:** Estrutura conceitual:
```typescript
// PortalRouter.tsx
function PortalRouter({ portalId }) {
  const modules = usePortalModules(portalId);
  const routes = useMemo(
    () => modules.flatMap(m => m.routes || []),
    [modules]
  );
  
  return (
    <Routes>
      {routes.map(route => (
        <Route
          key={route.path}
          path={route.path}
          element={<route.component />}
        />
      ))}
    </Routes>
  );
}
```

### Prefixo de Portal

**SPEC-LOAD-R-003:** Rotas de módulos DEVEM ser prefixadas com rota do portal

**SPEC-LOAD-R-004:** Exemplo:
```typescript
// Módulo define: /chat/:instanceId
// Portal "app" tem rota: /app
// Rota final: /app/chat/:instanceId

// Módulo define: /chat/:instanceId
// Portal "main" tem rota: /
// Rota final: /chat/:instanceId
```

### Conflitos de Rota

**SPEC-LOAD-R-005:** Plataforma NÃO DEVE validar conflitos de rota

**SPEC-LOAD-R-006:** Último módulo carregado sobrescreve rota

**SPEC-LOAD-R-007:** Erros do React Router servem como feedback

---

## 8. Registro de Componentes

### Registry Global

**SPEC-LOAD-C-001:** Plataforma DEVE manter registry de componentes por portal

**SPEC-LOAD-C-002:** Estrutura:
```typescript
const componentRegistry = new Map<string, Map<string, React.Component>>();

// Adicionar componente
componentRegistry
  .get(portalId)
  ?.set('ChatRoom', ChatRoomComponent);
```

### Acesso a Componentes

**SPEC-LOAD-C-003:** Componentes registrados DEVEM ser acessíveis via hook:
```typescript
const ChatRoom = usePortalComponent('ChatRoom');
```

**SPEC-LOAD-C-004:** Se componente não existe, hook DEVE retornar `null`

**SPEC-LOAD-C-005:** Componente PODE ser usado condicionalmente:
```typescript
const ChatRoom = usePortalComponent('ChatRoom');

return (
  <>
    {ChatRoom && <ChatRoom instanceId="support" />}
  </>
);
```

---

## 9. Code Splitting

### Estratégia de Bundles

**SPEC-LOAD-CS-001:** Cada módulo DEVE ser um chunk separado

**SPEC-LOAD-CS-002:** Build DEVE gerar:
```
dist/
├─ main.js              # Core da plataforma
├─ modules/
│  ├─ chat.js           # Módulo chat
│  ├─ dashboard.js      # Módulo dashboard
│  ├─ app-components.js # Módulo app-components
│  └─ ...
```

**SPEC-LOAD-CS-003:** Vite/Webpack DEVE usar dynamic imports:
```typescript
const module = await import(`/modules/${moduleId}/index.tsx`);
```

### Shared Dependencies

**SPEC-LOAD-CS-004:** Dependências comuns DEVEM ser shared chunks:
- React, React DOM
- TanStack Query
- Tailwind CSS
- shadcn/ui

**SPEC-LOAD-CS-005:** Módulos NÃO DEVEM incluir shared dependencies em seus bundles

---

## 10. Tratamento de Erros

### Erro ao Carregar Módulo

**SPEC-LOAD-ERR-001:** Se módulo falhar ao carregar:
1. Exibir erro específico ao usuário
2. Log detalhado no console
3. **NÃO** quebrar aplicação
4. Portal continua funcionando com módulos carregados

**SPEC-LOAD-ERR-002:** Mensagem de erro DEVE incluir:
- Nome do módulo
- Razão da falha (network, parse, etc)
- Ação sugerida

**SPEC-LOAD-ERR-003:** Exemplo:
```
Erro ao carregar módulo "chat"
Razão: Falha de rede ao baixar arquivo
Ação: Verifique sua conexão e tente novamente
```

### Erro em Dependência

**SPEC-LOAD-ERR-004:** Se dependência falhar, módulo dependente NÃO DEVE carregar

**SPEC-LOAD-ERR-005:** Erro DEVE indicar qual dependência falhou:
```
Erro ao carregar módulo "chat"
Razão: Dependência "media-components" não pôde ser carregada
```

### Error Boundary

**SPEC-LOAD-ERR-006:** Cada módulo DEVE ser envolvido em Error Boundary

**SPEC-LOAD-ERR-007:** Erro em módulo NÃO DEVE afetar outros módulos

**SPEC-LOAD-ERR-008:** Error Boundary DEVE exibir fallback UI:
```typescript
<ErrorBoundary
  fallback={
    <ModuleError 
      moduleId={moduleId}
      onRetry={() => reloadModule(moduleId)}
    />
  }
>
  <ModuleComponent />
</ErrorBoundary>
```

---

## 11. Performance

### Preloading

**SPEC-LOAD-PERF-001:** Plataforma PODE preload módulos prováveis:
```typescript
// Usuário está no portal main
// Preload módulos do portal app (provável próxima navegação)
const link = document.createElement('link');
link.rel = 'prefetch';
link.href = '/modules/dashboard.js';
document.head.appendChild(link);
```

**SPEC-LOAD-PERF-002:** Preloading DEVE ser baixa prioridade (não bloquear)

### Caching

**SPEC-LOAD-PERF-003:** Módulos carregados DEVEM ser cacheados no browser

**SPEC-LOAD-PERF-004:** Cache DEVE usar versionamento (hash no filename)

**SPEC-LOAD-PERF-005:** Exemplo:
```
/modules/chat.a7f3b2c.js
/modules/dashboard.9d4e1f0.js
```

### Bundle Size

**SPEC-LOAD-PERF-006:** Módulos de Componentes DEVEM ter < 200KB (gzipped)

**SPEC-LOAD-PERF-007:** Módulos de Funcionalidade DEVEM ter < 500KB (gzipped)

**SPEC-LOAD-PERF-008:** Build DEVE alertar se limites excedidos

---

## 12. Desenvolvimento

### Hot Module Replacement (HMR)

**SPEC-LOAD-DEV-001:** Em desenvolvimento, módulos DEVEM suportar HMR

**SPEC-LOAD-DEV-002:** Mudanças em módulo DEVEM recarregar apenas aquele módulo

**SPEC-LOAD-DEV-003:** Estado do portal DEVE ser preservado quando possível

### Module Registry Inspector

**SPEC-LOAD-DEV-004:** Em desenvolvimento, DEVE haver ferramenta de debug:
```typescript
window.__MODULE_REGISTRY__ = {
  portals: Map<string, Portal>,
  modules: Map<string, Module>,
  routes: Map<string, Route[]>,
  components: Map<string, Component>
}
```

**SPEC-LOAD-DEV-005:** Console DEVE ter comandos úteis:
```javascript
// Listar módulos carregados
console.log(window.__MODULE_REGISTRY__.modules);

// Recarregar módulo
await window.__MODULE_REGISTRY__.reload('chat');

// Inspecionar rotas
console.log(window.__MODULE_REGISTRY__.routes.get('app'));
```

---

## 13. Exemplo Completo

### Módulo Chat

**Estrutura de arquivos:**
```
modules/chat/
├─ module.json
├─ index.tsx
├─ components/
│  ├─ ChatRoom.tsx
│  └─ ChatMessage.tsx
└─ hooks/
   └─ useChat.ts
```

**module.json:**
```json
{
  "moduleId": "chat",
  "name": "Chat Module",
  "version": "1.0.0",
  "type": "functionality",
  "dependencies": ["media-components", "export-components"],
  "entrypoint": "./index.tsx"
}
```

**index.tsx:**
```typescript
import ChatRoom from './components/ChatRoom';
import ChatMessage from './components/ChatMessage';

export default {
  routes: [
    {
      path: '/chat/:instanceId',
      component: ChatRoom,
      requiresAuth: true
    }
  ],
  
  components: {
    'ChatRoom': ChatRoom,
    'ChatMessage': ChatMessage
  },
  
  onActivate: (portal) => {
    console.log(`Chat module activated in ${portal.id}`);
  },
  
  onDeactivate: (portal) => {
    console.log(`Chat module deactivated from ${portal.id}`);
  }
};
```

### Carregamento no Portal

```typescript
// Portal "app" ativa módulo "chat"

// 1. Plataforma carrega dependências
await loadModule('media-components');
await loadModule('export-components');

// 2. Plataforma carrega módulo chat
const chatModule = await import('/modules/chat/index.tsx');

// 3. Registra rotas
registerRoutes('app', chatModule.default.routes);
// Rota final: /app/chat/:instanceId

// 4. Registra componentes
registerComponents('app', chatModule.default.components);
// Componentes acessíveis via usePortalComponent('ChatRoom')

// 5. Executa onActivate
chatModule.default.onActivate(portal);
```

---

*Esta especificação define o sistema de carregamento de módulos. Implementação técnica em documentação separada.*