# Sistema de Persistência NIC Chat

Sistema centralizado e extensível para persistência de dados no navegador, com suporte futuro para sincronização com servidor.

## Arquitetura

```
┌─────────────────────────────────────┐
│  Contexts (Journey, Theme, etc)     │
│  - JourneyProgressContext           │
│  - NextStepWidgetContext            │
│  - ThemeContext                     │
│  - SidebarContext                   │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  StorageService (Facade/Singleton)  │
│  - get<T>(key): T | null            │
│  - set<T>(key, value): void         │
│  - remove(key): void                │
│  - subscribe<T>(key, listener)      │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  StorageDriver (Interface)          │
│                                     │
├─────────────────┬───────────────────┤
│                 │                   │
▼                 ▼                   ▼
LocalStorage    ServerStorage      MemoryStorage
(padrão)        (futuro)           (testes)
```

## Componentes

### 1. StorageDriver (Interface)

Interface abstrata que define o contrato para qualquer implementação de storage.

**Métodos:**
- `get<T>(key): T | null` - Recupera e deserializa valor
- `set<T>(key, value): void` - Serializa e salva valor
- `remove(key): void` - Remove item
- `clear(): void` - Limpa todo o storage do namespace
- `has(key): boolean` - Verifica se chave existe

### 2. LocalStorageDriver (Implementação Padrão)

Implementação usando `localStorage` do browser.

**Features:**
- ✅ Serialização/deserialização JSON automática
- ✅ Namespace automático (`nic-chat-*`) para evitar colisões
- ✅ Debounce configurável para writes frequentes
- ✅ Error handling com fallbacks
- ✅ Eventos customizados para sincronização entre abas
- ✅ Método `flush()` para forçar writes pendentes

**Configuração:**
```typescript
const driver = new LocalStorageDriver({
  namespace: 'nic-chat-',
  debounceMs: 1000, // Agrupar writes em janela de 1s
  onError: (error, operation) => {
    console.error(`Storage error in ${operation}:`, error)
  }
})
```

### 3. StorageService (Facade/Singleton)

Service centralizado que encapsula o driver e fornece API simplificada.

**Features:**
- ✅ API type-safe com TypeScript generics
- ✅ Sistema de listeners para sincronização
- ✅ Eventos nativos do browser (storage event)
- ✅ Eventos customizados para mesma aba
- ✅ Troca de driver em runtime (útil para testes)

## Uso Básico

### Salvando e Recuperando Dados

```typescript
import { storageService } from '@/services/storage'

// Salvar dados (serialização automática)
const progress = {
  visitedPages: ['home', 'chat'],
  completionPercentage: 25
}
storageService.set('journey-progress', progress)

// Recuperar dados (type-safe)
const saved = storageService.get<JourneyProgress>('journey-progress')
if (saved) {
  console.log(saved.visitedPages) // ['home', 'chat']
}

// Remover
storageService.remove('journey-progress')

// Verificar existência
if (storageService.has('journey-progress')) {
  // ...
}
```

### Sincronização entre Abas

```typescript
import { useEffect, useState } from 'react'
import { storageService } from '@/services/storage'

function MyComponent() {
  const [data, setData] = useState(() =>
    storageService.get<MyData>('my-key')
  )

  // Listener para mudanças (outras abas ou mesma aba)
  useEffect(() => {
    const unsubscribe = storageService.subscribe<MyData>(
      'my-key',
      (newValue) => {
        if (newValue) {
          setData(newValue)
        }
      }
    )

    return unsubscribe // Cleanup
  }, [])

  // Salvar mudanças (notifica automaticamente todos os listeners)
  const updateData = (newData: MyData) => {
    setData(newData)
    storageService.set('my-key', newData)
  }

  return <div>...</div>
}
```

## Migração para Servidor (Futuro)

Quando estiver pronto para sincronizar com servidor, basta criar um `ServerStorageDriver`:

```typescript
// ServerStorageDriver.ts
import { StorageDriver } from './StorageDriver'

export class ServerStorageDriver implements StorageDriver {
  constructor(private apiClient: ApiClient) {}

  async get<T>(key: string): Promise<T | null> {
    const response = await this.apiClient.get(`/user/preferences/${key}`)
    return response.data
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.apiClient.post(`/user/preferences/${key}`, value)
  }

  // ... implementar outros métodos
}

// Trocar driver no início da app
import { storageService } from '@/services/storage'
import { ServerStorageDriver } from './ServerStorageDriver'

const serverDriver = new ServerStorageDriver(apiClient)
storageService.setDriver(serverDriver)

// TODO código continua funcionando sem mudanças!
```

## Dados Persistidos Atualmente

### 1. Progresso da Jornada (`journey-progress`)

**Tipo:** `JourneyProgress`

```typescript
{
  visitedPages: string[]           // IDs das páginas visitadas
  lastVisited: string              // Última página visitada
  completionPercentage: number     // 0-100
  currentPhase: JourneyPhase       // descoberta|exploracao|dominio|maestria|completo
  timestamp: number                // Date.now()
  achievementShown: boolean        // Se mostrou modal de conquista 100%
  widgetDismissed: boolean         // Se usuário dispensou widget permanentemente
  welcomeShown: boolean            // Se mostrou mensagem de boas-vindas
  settings: {
    showProgressBar: boolean
    showNextStepWidget: boolean
  }
}
```

**Sincronização:**
- ✅ Entre abas (storage event + custom event)
- ✅ Debounce de 1s para evitar writes excessivos
- ✅ Restaurado ao recarregar página

### 2. Visibilidade do NextStepWidget (`next-step-widget-visible`)

**Tipo:** `boolean`

**Comportamento:**
- `false` = Widget oculto (padrão inicial)
- `true` = Widget visível
- Separado de `widgetDismissed` (que é permanente)
- Sincronizado entre abas em tempo real

### 3. Tema (`theme`)

**Tipo:** `'light' | 'dark'`

**Gerenciado por:** `ThemeContext` (usa localStorage diretamente, pode migrar para storageService)

### 4. Sidebar (`sidebar-expanded`)

**Tipo:** `boolean`

**Gerenciado por:** `SidebarContext` (usa localStorage diretamente, pode migrar para storageService)

## Comportamento do NextStepWidget

### Dois Níveis de Controle

**1. Visibilidade Temporária (NextStepWidgetContext)**
- `hide()` / `show()` / `toggle()`
- Persiste estado no storage (`next-step-widget-visible`)
- Reaparece quando:
  - Auto-show (30s ou scroll 70%)
  - Usuário clica no botão toggle no FAB

**2. Dispensar Permanente (JourneyProgressContext)**
- `dismissWidget()` - Marca `widgetDismissed = true`
- `undismissWidget()` - Reseta para `widgetDismissed = false`
- Quando dispensado, widget NÃO renderiza mesmo que `isVisible = true`
- Apenas reabilitado quando usuário clica no botão toggle do FAB

### Fluxo de Uso

```
1. Usuário entra no site
   → Widget inicia oculto (isVisible = false)

2. Após 30s ou scroll 70%
   → Widget aparece automaticamente (isVisible = true)

3. Usuário clica no X (fechar)
   → dismissWidget() + hide()
   → Widget dispensado permanentemente (widgetDismissed = true)

4. Usuário recarrega página
   → Widget NÃO aparece (widgetDismissed = true)
   → Auto-show NÃO funciona (verificação antes de show)

5. Usuário clica no botão "Guia da Jornada" no FAB
   → undismissWidget() + show()
   → Widget reaparece e volta a funcionar normalmente
```

## Debug e Inspeção

### Console do Browser

```javascript
// Inspecionar dados salvos
console.log(localStorage.getItem('nic-chat-journey-progress'))
console.log(localStorage.getItem('nic-chat-next-step-widget-visible'))

// Limpar dados (resetar jornada)
localStorage.removeItem('nic-chat-journey-progress')
localStorage.removeItem('nic-chat-next-step-widget-visible')

// Ver todas as chaves do NIC Chat
Object.keys(localStorage).filter(key => key.startsWith('nic-chat-'))
```

### React DevTools

Inspecionar contextos:
- `JourneyProgressContext` → Ver `progress` e flags
- `NextStepWidgetContext` → Ver `isVisible`

## Testes

### Testar Persistência

1. Abrir aplicação
2. Interagir com jornada (visitar páginas)
3. Fechar navegador completamente
4. Reabrir navegador
5. ✅ Verificar que progresso foi restaurado

### Testar Sincronização entre Abas

1. Abrir aplicação em 2 abas
2. Na aba 1, visitar uma página nova
3. ✅ Na aba 2, verificar que progresso atualizou
4. Na aba 1, dispensar widget (clicar no X)
5. ✅ Na aba 2, verificar que widget sumiu

### Testar Widget Dispensado

1. Abrir aplicação
2. Aguardar widget aparecer (30s ou scroll)
3. Clicar no X (dispensar permanentemente)
4. Recarregar página
5. ✅ Verificar que widget NÃO reapareceu
6. Clicar no botão "Guia da Jornada" no FAB
7. ✅ Verificar que widget reapareceu

## Performance

### Otimizações Implementadas

1. **Debounce de writes (1s):**
   - Evita writes excessivos no localStorage
   - Agrupa múltiplas mudanças em uma única operação
   - Configurável via `LocalStorageDriver({ debounceMs })`

2. **Listeners eficientes:**
   - Cleanup automático em `useEffect` return
   - Apenas listeners ativos recebem notificações
   - Garbage collection automática de listeners vazios

3. **Serialização otimizada:**
   - JSON nativo do browser (rápido)
   - Sem bibliotecas externas
   - Type-safe com TypeScript generics

### Limites do localStorage

- **Quota:** ~5-10MB por domínio (varia por browser)
- **Performance:** Síncrono (pode bloquear main thread em writes grandes)
- **Recomendação:** Usar apenas para preferências e estado pequeno
- **Futuro:** Migrar dados grandes para IndexedDB ou servidor

## Extensões Futuras

### 1. ServerStorageDriver

```typescript
// Sincronizar com backend
const driver = new ServerStorageDriver({
  baseUrl: 'https://api.nic.chat',
  authToken: userToken
})
```

### 2. IndexedDBDriver

```typescript
// Para dados maiores
const driver = new IndexedDBDriver({
  dbName: 'nic-chat',
  version: 1
})
```

### 3. HybridDriver

```typescript
// localStorage como cache + servidor como source of truth
const driver = new HybridDriver({
  local: new LocalStorageDriver(),
  remote: new ServerStorageDriver(apiClient),
  syncStrategy: 'eventual' // 'immediate' | 'eventual'
})
```

---

**Última atualização:** 2025-10-19
**Autor:** Sistema de Persistência NIC Chat
**Versão:** 1.0.0
