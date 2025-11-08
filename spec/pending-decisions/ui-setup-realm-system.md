# Decisão Pendente: Atualização de UI/UX do Módulo Setup para Sistema de Realms

**Data:** 2025-11-07
**Status:** Análise Completa - Aguardando Atualização da Spec
**Prioridade:** Alta
**Relacionado:** `spec/ui/setup-module-interfaces.md`, `spec/SPEC-realms.md`, `spec/whats-new/2025-11-07-realm-system.md`

---

## 1. CONTEXTO

O sistema de Realms foi implementado em 07/11/2025 (ver `spec/whats-new/2025-11-07-realm-system.md`), substituindo o conceito de `settings-key` por um sistema mais robusto de agrupamento de portais.

**Problema identificado:** A especificação de UI (`spec/ui/setup-module-interfaces.md`) foi escrita ANTES da implementação de Realms e não reflete:
- Hierarquia com Realms
- Páginas de gerenciamento de Reinos
- Sistema de tema em 3 níveis (Sistema → Realm → Portal)
- Browser de módulos com busca/filtros

**Análise realizada:** Investigação completa da implementação atual revelou que o código está **85% conforme** e bem implementado, mas a spec precisa ser atualizada para documentar a realidade.

---

## 2. PROBLEMA IDENTIFICADO

### 2.1 Conceito de Hierarquia vs Agrupamento

**Spec UI original sugeria:**
```
Sistema → Portal → Módulo → Instância
```

**Realidade com Realms:**
- **Hierarquia real (navegação):** Sistema → Portal → Módulo → Instância
- **Agrupamento lateral:** Reino ← conecta → [Portal A, Portal B, Portal C]

**Reino NÃO é pai hierárquico dos portais**, é um **agrupador** que permite compartilhar configurações (tema, etc.).

### 2.2 Páginas Faltantes na Spec

**Implementado mas não especificado:**
- `/setup/realms` - Lista de reinos
- `/setup/realms/new` - Criar reino
- `/setup/realms/:realmId` - Editar reino
- `/setup/realms/:realmId/theme` - Tema do reino (FALTA IMPLEMENTAR)
- `/setup/about` - Sobre a plataforma

### 2.3 ThemeConfig - Abordagem Diferente

**Spec original:** 2 abas (Reino/Portal) lado a lado

**UX Melhorada Proposta:**
- **Estado único** que muda baseado em override
- **Estado 1 (usando reino):** Color picker com cadeado 🔒 (readonly)
  - Botões: "Usar Cor Diferente do Reino" | "Editar Cor do Reino →"
- **Estado 2 (customizado):** Color picker editável
  - Botão: "Usar Tema do Reino"

**Vantagem:** Mais claro para o user (vê só um tema por vez, não dois)

### 2.4 Módulos do Portal - Browser Necessário

**Spec original:** Lista única ou tabs Ativos/Disponíveis

**Problema real:** Com muitos módulos (50+), lista única não escala.

**Solução proposta:**
- **Seção 1:** Módulos Associados (toggle Ativo/Inativo, botão Remover)
- **Seção 2:** Botão "+ Adicionar Módulos" abre Dialog/Sheet com:
  - Busca por nome/descrição
  - Filtros por categoria/tipo
  - Cards com preview (descrição, dependências, versão)
  - Seleção múltipla opcional
  - Validação de dependências ao adicionar

**Componentes shadcn/ui:** Dialog, Input (busca), Select (filtros), Card

---

## 3. ANÁLISE DETALHADA DA IMPLEMENTAÇÃO ATUAL

### 3.1 Conformidade Geral: 85%

**Métricas:**
- Sistema de Realms: ✅ 100% implementado
- ThemeConfig (2 abas): ✅ 100% implementado
- Hooks JQEL: ✅ 100% implementados
- Rotas: ✅ 95% (falta `/setup/realms/:realmId/theme`)
- UI Consistency: ✅ 90% (pequenos ajustes)
- Dados Reais: ⚠️ 60% (Dashboard e Settings hardcoded)
- Formulários: ⚠️ 70% (falta InstanceForm)

### 3.2 O Que Está CORRETO e Pode Aproveitar

#### Sistema de Realms - 100% Implementado ✅

**RealmList.tsx:**
- Cards com contador de portais
- Preview da cor do tema (círculo colorido)
- Badge "Sistema" para não removíveis
- Navegação para editar

**RealmForm.tsx:**
- Campos: realmId, name, description
- ID imutável após criação
- Cards para "Tema do Reino" e "Portais do Reino" (rotas não implementadas)

**ThemeConfig.tsx (2 abas):**
- Aba Reino: configura cor para todos os portais
- Aba Portal: override específico com badge "Custom"
- Funções localStorage corretas
- Sistema de 3 níveis funciona

**PortalForm.tsx:**
- Select de Realm funcional
- Mostra nome + descrição de cada reino
- Validação que realmId existe

#### Hooks JQEL - Todos Implementados ✅

```typescript
// Realms
useRealms, useRealm, useCreateRealm, useUpdateRealm, useDeleteRealm

// Portals
usePortals, usePortal, useCreatePortal, useUpdatePortal, useDeletePortal

// Modules
useModules, useModule, usePortalModules

// Instances
useInstances, useInstance, useCreateInstance, useUpdateInstance, useDeleteInstance
```

#### Breadcrumbs - Consistentes ✅

- Componente `PageBreadcrumb` global reutilizado
- Hook `useSetupBreadcrumb()` para páginas padrão
- Breadcrumbs dinâmicos com `useMemo()` para parâmetros

#### Padrões de UI - Bem Estruturados ✅

- Cards com hover effect
- Badges para status (Ativo/Inativo, Sistema, Custom)
- Botões com ícones Lucide React
- Separators entre seções
- Estados de loading e vazio
- Confirmações antes de deletar

### 3.3 Ajustes Necessários

#### Prioridade 1 - CRÍTICA

1. **Remover cards para rotas inexistentes em RealmForm:**
   - "Tema do Reino" → `/setup/realms/:realmId/theme` (NÃO EXISTE)
   - "Portais do Reino" → `/setup/realms/:realmId/portais` (NÃO EXISTE)
   - **Ação:** Criar rota de tema do reino ou remover cards

2. **Remover botão "Adicionar Módulo" não funcional:**
   - PortalModules.tsx linha 120-123
   - **Ação:** Remover OU implementar browser de módulos

3. **Implementar InstanceForm:**
   - Criar/editar instâncias via UI
   - Formulário dinâmico baseado em schema do módulo

#### Prioridade 2 - ALTA

4. **Mostrar realmId em PortalList:**
   - Adicionar badge ou linha mostrando reino do portal

5. **Substituir dados hardcoded:**
   - SetupDashboard: estatísticas mockadas
   - PlatformSettings: variáveis e health checks mockados

6. **Melhorar UX:**
   - Substituir `alert()` e `confirm()` por Dialog/AlertDialog
   - Aplicar tema sem reload (ThemeProvider dinâmico)

#### Prioridade 3 - MÉDIA

7. **Adicionar busca e filtros:**
   - PortalList: busca + filtros
   - RealmList: busca + filtros
   - PortalModules: browser de módulos

8. **Skeleton loaders:**
   - Substituir texto "Carregando..." por skeleton components

---

## 4. SOLUÇÃO PROPOSTA

### 4.1 Atualizar spec/ui/setup-module-interfaces.md

**Mudanças necessárias:**

#### Seção 1: Arquitetura de Navegação
- Adicionar rotas de Realms
- Clarificar Realm como agrupador (não pai hierárquico)
- Atualizar hierarquia de conceitos

#### Nova Seção 3: Lista de Reinos
```
Wireframe:
- Header: "Gerenciar Reinos" + botão "+ Novo Reino"
- Cards de reino:
  - Nome, descrição, realmId
  - Badge "Sistema" se não removível
  - Contador de portais
  - Preview da cor do tema (círculo)
  - Botões: "Configurar", "Excluir"
- Estado vazio
- Busca/filtros (futuro)
```

#### Nova Seção 4: Criar/Editar Reino
```
Wireframe:
- Breadcrumb dinâmico
- Formulário: realmId, name, description
- Validação com Zod (ou useState simples)
- Cards após editar:
  - "Tema do Reino" (implementar rota)
  - Remover "Portais do Reino"
```

#### Nova Seção 4.5: Tema do Reino
```
Rota: /setup/realms/:realmId/theme

Componente reutilizável ThemePicker:
- Color picker + input hex
- Preview paleta (10 shades)
- Card cores semânticas

Aviso: "Afetará X portais do reino"
Botão: "Aplicar a Todos os Portais do Reino"
```

#### Seção 5: Criar/Editar Portal (atualizar)
- Campo "Settings Key" → "Reino" (Select dropdown)
- Mostra lista de reinos com nome + descrição
- Validação que realmId existe

#### Seção 6: Módulos do Portal (reescrever)

**Abordagem de Browser:**

```
Seção 1: Módulos Associados
- Lista apenas módulos já adicionados
- Toggle Ativo/Inativo em cada
- Botão "Remover" (desassocia)
- Botão "Gerenciar Instâncias" (se ativo)

Seção 2: Browser de Módulos (Dialog)
- Botão "+ Adicionar Módulos ao Portal"
- Abre Dialog/Sheet com:
  - Input de busca
  - Select de filtros (categoria)
  - Cards de módulos disponíveis
  - Preview com dependências
  - Botão "Adicionar" em cada
  - Validação de dependências
```

**Componentes shadcn/ui:**
- Dialog (browser)
- Input (busca)
- Select (filtros)
- Card (preview módulos)
- Switch (ativo/inativo)
- Badge (status, versão, categoria)

#### Seção 7: Tema do Portal (reescrever)

**UX com Estados:**

```
Estado 1: Usando Tema do Reino
┌────────────────────────────────────┐
│ Cor Principal    Valor Hexadecimal │
│ [● #0ea5e9 🔒]   [#0ea5e9]        │
│ (readonly)        (disabled)       │
│                                    │
│ [Usar Cor Diferente do Reino]     │
│ [Editar Cor do Reino →]           │
└────────────────────────────────────┘

Estado 2: Tema Customizado
┌────────────────────────────────────┐
│ Cor Principal    Valor Hexadecimal │
│ [● #ef4444]      [#ef4444]        │
│ (editável)        (editável)       │
│                                    │
│ [Usar Tema do Reino]               │
└────────────────────────────────────┘
```

**Decisão:** Campo `portal.customBrandColor`
- `null` → usando tema do reino (cadeado)
- `string` → tema customizado (editável)

**localStorage:** Apenas cache, backend é fonte da verdade

#### Seção 9: Platform Settings
- Manter como está
- Marcar TODO: dados hardcoded

### 4.2 Componentes a Criar

#### ThemePicker.tsx (Reutilizável)
```typescript
interface ThemePickerProps {
  value: string;
  onChange: (color: string) => void;
  readonly?: boolean;
}
```

**Usado em:**
- ThemeConfig (portal)
- RealmTheme (reino)

#### ModuleBrowser.tsx (Dialog)
```typescript
interface ModuleBrowserProps {
  portalId: string;
  excludeModuleIds: string[];
  onAddModules: (moduleIds: string[]) => void;
}
```

**Features:**
- Busca com debounce
- Filtros por categoria
- Validação de dependências
- Seleção múltipla

---

## 5. DECISÃO PENDENTE

### 5.1 Módulos do Portal

**Opção A:** Implementar browser de módulos (Dialog com busca)
**Opção B:** Manter lista única simples
**Opção C:** Tabs Ativos/Disponíveis (spec original)

**Recomendação:** Opção A (escalável, melhor UX)

### 5.2 ThemeConfig

**Opção A:** Estados dinâmicos (cadeado vs editável) - UX PROPOSTA
**Opção B:** 2 abas lado a lado (implementação atual)

**Recomendação:** Opção A (mais claro para user)

### 5.3 Validação de Formulários

**Opção A:** Migrar para React Hook Form + Zod
**Opção B:** Manter useState simples

**Recomendação:** Opção B agora, Opção A depois (refatoração futura)

### 5.4 Nível de Detalhe da Spec

**Opção A:** Spec super detalhada (wireframes ASCII completos)
**Opção B:** Spec concisa (elementos principais)
**Opção C:** Híbrida (detalhada nas partes novas, concisa nas existentes)

**Recomendação:** Opção C

---

## 6. PRÓXIMOS PASSOS

### Fase 1: Atualizar Spec UI
1. Reescrever seções com Realms
2. Adicionar wireframes atualizados
3. Documentar estados de ThemeConfig
4. Especificar browser de módulos
5. Marcar TODOs conhecidos

### Fase 2: Ajustes de Implementação
1. Criar rota `/setup/realms/:realmId/theme`
2. Refatorar ThemeConfig (estados com cadeado)
3. Implementar ModuleBrowser
4. Criar InstanceForm
5. Substituir dados hardcoded

### Fase 3: Melhorias de UX
1. Skeleton loaders
2. Dialog/AlertDialog (substituir alerts)
3. Tema sem reload
4. Busca e filtros em listas

---

## 7. REFERÊNCIAS

**Specs Relacionadas:**
- `spec/SPEC-realms.md` - 151 requisitos de Realms
- `spec/SPEC-concepts.md` - Conceitos atualizados com Realms
- `spec/SPEC-theming.md` - Hierarquia de 3 níveis
- `spec/whats-new/2025-11-07-realm-system.md` - Implementação completa

**Implementação Atual:**
- `src/frontend/src/modules/setup/pages/` - 11 páginas
- `src/frontend/src/hooks/useJQEL.ts` - Hooks completos
- `src/frontend/src/contexts/ThemeContext.tsx` - Theme com realmId

**Análises Detalhadas:**
- `.tmp/ui-spec-realm-updates.md` - Mudanças necessárias
- `.tmp/resumo-implementacao-vs-spec.md` - Conformidade 85%

---

## 8. NOTAS ADICIONAIS

### 8.1 Conformidade com shadcn/ui

**Componentes já usados:**
- Card, Button, Badge, Input, Label, Separator
- Select (reino no PortalForm)
- Tabs (ThemeConfig atual)

**Componentes necessários:**
- Dialog/Sheet (browser de módulos)
- AlertDialog (substituir confirms)
- Skeleton (loading states)
- Toast/Sonner (feedback)

### 8.2 Performance

- Code splitting implementado (lazy loading)
- TanStack Query com cache
- Falta: TanStack Virtual para listas longas
- Falta: Debounce em buscas

### 8.3 Acessibilidade

- Componentes shadcn/ui são acessíveis por padrão
- Falta verificar: tab order, ARIA labels, contraste WCAG AA

---

## CONCLUSÃO

A implementação atual está **bem feita e correta** (85% conforme), seguindo o sistema de Realms perfeitamente. A spec precisa ser atualizada para **refletir a implementação**, não o contrário.

**Principais ajustes:**
1. Documentar sistema de Realms como agrupador
2. Especificar UX melhorada do ThemeConfig (estados)
3. Adicionar browser de módulos
4. Marcar funcionalidades pendentes (InstanceForm, dados reais)

**Decisão recomendada:** Atualizar spec conforme análise acima, implementar ajustes de Prioridade 1, e deixar melhorias para iterações futuras.
