# PLAN_FIX_COMPOSITION.md - Plano de Correção do Sistema de Composições

**Data**: 2025-11-15
**Status**: 🔴 CRÍTICO - Site quebrado, página não renderiza

---

## 🚨 PROBLEMA IDENTIFICADO

### Sintoma
- Página inicial completamente em branco
- Nenhum conteúdo renderizado (sem `#portal-root`, `#main-content`, etc.)
- Console do navegador mostra erro:
  ```
  The requested module '/src/core/composition/types.ts' does not provide an export named 'Composition'
  ```

### Causa Raiz

**Importações Inconsistentes de Tipos**

O sistema de composições foi implementado corretamente, mas há **inconsistência nas importações de tipos TypeScript**:

1. **Arquivo `core/composition/index.ts`** re-exporta tipos usando `export type { ... }`
2. **Alguns arquivos importam diretamente de `types.ts`**:
   - `core/modules/ModuleRegistry.ts` (linha 11)
   - `types/module.ts` (linha 5)
3. **Outros arquivos importam dos registries diretamente**:
   - `core/modules/ModuleRegistry.ts` (linhas 9-10)

Isso cria um problema de **ordem de inicialização** ou **referência circular** que impede o módulo de tipos de ser carregado corretamente.

### Impacto

```
App.tsx (linha 24)
    ↓
initializePlatformCompositions()
    ↓
registerPlatformCompositions()
    ↓
compositionRegistry.register({ ... }) ← ❌ Não consegue importar tipo 'Composition'
    ↓
Erro fatal no carregamento do módulo
    ↓
Aplicação não renderiza (página em branco)
```

---

## 🎯 ESTRATÉGIA DE CORREÇÃO

### Princípio

**Padronizar TODAS as importações para usar o ponto de entrada único: `@/core/composition`**

Conforme a especificação `DESIGN_COMPOSITION.md`, o sistema deve:
- Ter um ponto de entrada único (`index.ts`)
- Re-exportar tudo de forma consistente
- Evitar importações diretas de arquivos internos

### Arquivos Afetados

#### 1. `src/frontend/src/core/modules/ModuleRegistry.ts`
**Problema**: Importa tipos diretamente de `types.ts` e registries de arquivos específicos
```typescript
// ❌ ATUAL - Importações inconsistentes
import { slotComponentRegistry } from '@/core/composition/SlotComponentRegistry';
import { compositionRegistry } from '@/core/composition/CompositionRegistry';
import type { SlotComponent, Composition } from '@/core/composition/types';
```

**Solução**: Importar TUDO de `@/core/composition`
```typescript
// ✅ CORRETO - Importação do ponto de entrada único
import {
  slotComponentRegistry,
  compositionRegistry
} from '@/core/composition';
import type { SlotComponent, Composition } from '@/core/composition';
```

#### 2. `src/frontend/src/types/module.ts`
**Problema**: Importa tipos diretamente de `types.ts`
```typescript
// ❌ ATUAL
import type { SlotComponent, Composition } from '@/core/composition/types';
```

**Solução**: Importar do ponto de entrada único
```typescript
// ✅ CORRETO
import type { SlotComponent, Composition } from '@/core/composition';
```

---

## 📋 PLANO DE AÇÃO

### FASE 1: Correção de Importações (CRÍTICO)

#### Tarefa 1.1: Corrigir ModuleRegistry.ts
- [ ] Modificar linha 9: `import { slotComponentRegistry, compositionRegistry } from '@/core/composition';`
- [ ] Modificar linha 11: `import type { SlotComponent, Composition } from '@/core/composition';`
- [ ] Remover linhas 9-10 antigas (imports específicos)
- [ ] Validar que o TypeScript compila sem erros

#### Tarefa 1.2: Corrigir types/module.ts
- [ ] Modificar linha 5: `import type { SlotComponent, Composition } from '@/core/composition';`
- [ ] Validar que o TypeScript compila sem erros

#### Tarefa 1.3: Verificar index.ts da composição
- [ ] Garantir que `core/composition/index.ts` exporta TUDO corretamente
- [ ] Verificar exports de tipos: `export type { ... }`
- [ ] Verificar exports de registries: `export { ... }`
- [ ] Verificar exports de componentes: `export { Page, CompositionRenderer }`

### FASE 2: Validação e Teste

#### Tarefa 2.1: Validar build TypeScript
- [ ] Executar `npm run type-check` no frontend
- [ ] Garantir zero erros de tipos
- [ ] Verificar que não há imports circulares

#### Tarefa 2.2: Testar renderização
- [ ] Iniciar dev server: `npm run dev`
- [ ] Navegar para `http://localhost:3000`
- [ ] Verificar que página inicial renderiza
- [ ] Verificar que `#portal-root` existe no DOM
- [ ] Verificar que `#main-content` existe no DOM
- [ ] Verificar que `#breadcrumb` existe no DOM (composição default)

#### Tarefa 2.3: Testar composições
- [ ] Verificar que composição 'default' funciona
- [ ] Verificar que composição 'settings' funciona
- [ ] Verificar que PlatformBreadcrumb renderiza
- [ ] Verificar navegação de breadcrumb

### FASE 3: Limpeza e Documentação

#### Tarefa 3.1: Revisar todas as importações
- [ ] Buscar TODOS os arquivos que importam de `@/core/composition`
- [ ] Garantir que NENHUM importa de arquivos internos (`/types`, `/SlotComponentRegistry`, etc.)
- [ ] Criar regra de lint para evitar importações diretas (opcional)

#### Tarefa 3.2: Atualizar documentação
- [ ] Marcar PLAN_COMPOSITION.md como concluído
- [ ] Documentar a regra de importação em DESIGN_COMPOSITION.md
- [ ] Adicionar nota sobre ponto de entrada único

---

## 🔍 VALIDAÇÃO FINAL

### Checklist de Sucesso

- [ ] ✅ Site carrega sem erros no console
- [ ] ✅ Página inicial renderiza conteúdo
- [ ] ✅ Elementos com IDs padronizados existem no DOM:
  - [ ] `#portal-root`
  - [ ] `#main-content`
  - [ ] `#breadcrumb`
- [ ] ✅ Breadcrumb funciona e mostra navegação
- [ ] ✅ TypeScript compila sem erros
- [ ] ✅ Nenhuma importação direta de arquivos internos de composition
- [ ] ✅ Setup dashboard carrega corretamente em `/setup`

### Testes de Regressão

```bash
# 1. Build TypeScript
npm run type-check

# 2. Build de produção
npm run build

# 3. Dev server
npm run dev

# 4. Navegação
# - Acessar http://localhost:3000
# - Acessar http://localhost:3000/setup
# - Verificar breadcrumb em ambas
```

---

## 📊 ANÁLISE TÉCNICA

### Por que isso aconteceu?

1. **Mix de padrões de importação**:
   - Alguns arquivos importavam do `index.ts` (ponto de entrada)
   - Outros importavam diretamente de arquivos internos
   - TypeScript/Vite pode ter dificuldade com ordem de inicialização

2. **Re-exports de tipos**:
   - `export type { ... }` funciona diferente de `export { ... }`
   - Importações diretas de `types.ts` podem causar problemas de resolução
   - ESM (ES Modules) é sensível à ordem de inicialização

3. **Registries singleton**:
   - `compositionRegistry` e `slotComponentRegistry` são singletons
   - Importações diretas podem criar instâncias duplicadas
   - Ponto de entrada único garante singleton único

### Solução Definitiva

**SEMPRE importar de `@/core/composition` (index.ts)**

```typescript
// ✅ CORRETO
import {
  Page,
  CompositionProvider,
  useComposition,
  compositionRegistry,
  slotComponentRegistry,
  initializePlatformCompositions
} from '@/core/composition';

import type {
  Composition,
  SlotComponent,
  ResolvedComposition,
  SlotType,
  LayoutWidth,
  LayoutSize
} from '@/core/composition';

// ❌ ERRADO - NÃO FAZER
import { compositionRegistry } from '@/core/composition/CompositionRegistry';
import type { Composition } from '@/core/composition/types';
```

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ **ENTENDER O PROBLEMA** - Concluído
2. ✅ **IDENTIFICAR CAUSA RAIZ** - Concluído
3. ✅ **MONTAR PLANO DE CORREÇÃO** - Concluído
4. ⏭️ **EXECUTAR CORREÇÃO** - Aguardando aprovação
5. ⏭️ **VALIDAR E TESTAR** - Após execução
6. ⏭️ **DOCUMENTAR LIÇÕES APRENDIDAS** - Após validação

---

## 📝 NOTAS IMPORTANTES

### Regra de Ouro: Ponto de Entrada Único

**SEMPRE use `@/core/composition` para importações**

Essa regra:
- Evita importações circulares
- Garante singleton único para registries
- Facilita refatorações futuras
- Melhora tree-shaking no build
- Mantém compatibilidade com HMR (Hot Module Replacement)

### Arquivos Internos (Não Importar Diretamente)

```
core/composition/
  ├── types.ts                    ← ❌ Não importar diretamente
  ├── CompositionRegistry.ts      ← ❌ Não importar diretamente
  ├── SlotComponentRegistry.ts    ← ❌ Não importar diretamente
  ├── CompositionContext.tsx      ← ❌ Não importar diretamente
  ├── Page.tsx                    ← ❌ Não importar diretamente
  ├── CompositionRenderer.tsx     ← ❌ Não importar diretamente
  ├── platform/                   ← ❌ Não importar diretamente
  ├── components/                 ← ❌ Não importar diretamente
  ├── hooks/                      ← ❌ Não importar diretamente
  └── index.ts                    ← ✅ ÚNICO ponto de entrada
```

### Ponto de Entrada Único (Sempre Usar)

```typescript
// ✅ index.ts - Exporta TUDO
export type { ... } from './types';
export { compositionRegistry } from './CompositionRegistry';
export { slotComponentRegistry } from './SlotComponentRegistry';
export { Page } from './Page';
// ... todos os exports
```

---

## 🔗 REFERÊNCIAS

- **Especificação**: `specs/DESIGN_COMPOSITION.md`
- **Plano de Implementação**: `PLAN_COMPOSITION.md`
- **Erro Console**: "The requested module '/src/core/composition/types.ts' does not provide an export named 'Composition'"
- **Screenshot**: `.tmp/page-screenshot.png`
- **Investigação Playwright**: `.tmp/investigate-page.js`

---

**PRIORIDADE**: 🔴 CRÍTICA
**ESTIMATIVA**: 15-30 minutos
**IMPACTO**: Alto - Site completamente quebrado
**RISCO**: Baixo - Mudança simples e bem definida
