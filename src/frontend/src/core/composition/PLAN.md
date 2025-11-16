# PLAN_COMPOSITION_EDITOR.md - Editor de Composições com SlotConfigForm

**Objetivo**: Implementar editor visual de composições com preview em tempo real e configuração inline de componentes

---

## 📋 RESUMO EXECUTIVO

### Problemas Identificados
1. ❌ Não existe editor visual para composições - apenas código
2. ❌ Componentes de slot não podem ser customizados
3. ⚠️ Preview ASCII é inadequado para projeto React/shadcn moderno

### Solução (Baseada em Padrões)
- ✅ Editor visual com ResizablePanel 60/40 baseado no LoginBrandingEditor
- ✅ SlotConfigForm Registry para configuração inline de componentes
- ✅ Preview em tempo real com zero latência e theme isolation

---

## 🎯 FASE 1: INFRAESTRUTURA BASE

### 1.1. SlotConfigForm Registry

- [x] Criar `SlotConfigFormRegistry.ts` (ref: DES-ARCH-002)
- [x] Expandir `types.ts` com `slotConfigs` (ref: DES-ARCH-003)
- [x] Criar hook `useSlotConfigForm.ts`
- [x] Atualizar `ModuleRegistry` para auto-registro de forms

**Leitura de Referência**
- DESIGN.md: DES-ARCH-002, DES-ARCH-003
- LoginBrandingEditor para padrão de registry

### 1.2. Tipos e Validação

- [x] Definir `SlotConfigFormProps` interface (ref: DES-COMP-003)
- [x] Criar `SlotComponentConfig` type
- [x] Criar schemas Zod para composições expandidas
- [x] Definir `CompositionEditorState` type

**Código de Referência**:
```typescript
interface SlotConfigFormProps {
  slotType: SlotType;
  componentId: string;
  config: SlotComponentConfig;
  onChange: (config: SlotComponentConfig) => void;
}
```

---

## 🎯 FASE 2: COMPONENTES DE PREVIEW

### 2.1. CompositionPreview

- [x] Criar `CompositionPreview.tsx` (ref: DES-UI-002)
  - [x] Renderização HTML real da estrutura
  - [x] Badge "PREVIEW - Clique para editar"
  - [x] Suporte a edição inline com Popovers
- [x] Criar `CompositionThemeProvider.tsx` (ref: DES-COMP-004)
  - [x] Isolar CSS variables no container
  - [x] Usar `data-composition-preview="true"`

**Leitura de Referência**
- DESIGN.md: DES-UI-002, DES-COMP-004
- LoginPreview e LoginThemeProvider como base

### 2.2. Layout com ResizablePanel

- [x] Implementar layout 60/40 (ref: DES-UI-001)
- [x] Adicionar ResizableHandle com controle
- [x] Configurar min/max sizes dos painéis

---

## 🎯 FASE 3: EDITOR DE COMPOSIÇÕES ✅

### 3.1. CompositionEditor Principal

- [x] Criar `CompositionEditor.tsx` (ref: DES-COMP-001)
  - [x] Estado centralizado (ref: DES-ARCH-001)
  - [x] Change detection com useEffect
  - [x] Handlers para cada aspecto da composição
- [x] Implementar tabs para Controls
  - [x] Tab Layout (width selector)
  - [x] Tab Slots (toggle checkboxes)
  - [x] Tab Components (slot cards)

### 3.2. SlotCard Dinâmico

- [x] Criar `SlotCard.tsx` (ref: DES-COMP-002)
  - [x] Card expandível/colapsável
  - [x] ComponentSelector dropdown
  - [x] Renderização condicional de SlotConfigForm
  - [x] Validação com feedback visual
- [x] Criar `ComponentSelector.tsx`
  - [x] Agrupar por provider
  - [x] Mostrar metadados do componente
- [x] Criar `SlotCardList.tsx`
  - [x] Lista dinâmica de SlotCards para slots ativos

---

## 🎯 FASE 4: SLOTCONFIGFORMS ✅

### 4.1. BlueprintHeaderConfigForm

- [x] Criar `BlueprintHeaderConfigForm.tsx` (ref: DES-FORM-001, DES-FORM-002)
  - [x] Editor de menu items (adicionar/remover/reordenar)
  - [x] Seletor de ícones Lucide
  - [x] Toggles para brand logo e theme switcher
  - [x] Suporte a submenus
- [x] Criar schema de validação Zod
- [x] Registrar no módulo Blueprint

### 4.2. BlueprintSidebarConfigForm

- [x] Criar `BlueprintSidebarConfigForm.tsx`
  - [x] Seletor de largura (sm/md/lg)
  - [x] Toggle para collapsible
  - [x] Editor de items similar ao header
- [x] Registrar no módulo Blueprint

### 4.3. Integração com ModuleRegistry

- [x] Adicionar `slotConfigForms` ao `ModuleExports` type
- [x] Atualizar `ModuleRegistry` para auto-registro de forms
- [x] Implementar desregistração de forms no cleanup

---

## 🎯 FASE 5: INTEGRAÇÃO E PERSISTÊNCIA ✅

### 5.1. Fluxo de Dados

- [x] Implementar ciclo de atualização (ref: DES-FLOW-001)
  - Já implementado via estado centralizado no CompositionEditor
- [x] Implementar descoberta de forms (ref: DES-FLOW-002)
  - Auto-registro via ModuleRegistry
- [x] Conectar onChange callbacks em cascata
  - Callbacks conectados em todos os componentes
- [x] Sincronizar preview com controls
  - Sincronização via estado compartilhado

### 5.2. Storage e Persistência

- [x] Implementar JQEL mutations (ref: DES-STORE-002)
  - [x] Hook useCreateComposition
  - [x] Hook useUpdateComposition
  - [x] Hook useDeleteComposition
  - [x] Hook useComposition (query single)
  - [x] Hook useCompositions (query list)
- [x] Integrar mutations no CompositionEditor
  - [x] Load composition on edit
  - [x] Save via create/update mutations
  - [x] Loading states

### 5.3. Rotas no Setup

- [x] Adicionar rota `/setup/portals/:portalId/compositions`
- [x] Adicionar rota `/setup/portals/:portalId/compositions/new`
- [x] Adicionar rota `/setup/portals/:portalId/compositions/:compositionId`
- [x] Criar página CompositionList
- [ ] Adicionar link em PortalEdit (pendente)

---

### 5.4. Testar Fase 5 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Criar Nova Composição**
  - [ ] Abrir editor vazio
  - [ ] Selecionar slots ativos
  - [ ] Atribuir componentes
  - [ ] ✅ **Verificar**: Preview atualiza em tempo real

- [ ] **Teste 2: Configurar BlueprintHeader**
  - [ ] Selecionar blueprint-header no slot navbar
  - [ ] Ver form inline aparecer
  - [ ] Adicionar itens de menu
  - [ ] ✅ **Resultado**: Menu aparece no preview instantaneamente

- [ ] **Teste 3: Salvar e Recuperar**
  - [ ] Salvar composição
  - [ ] Recarregar página
  - [ ] Abrir composição salva
  - [ ] ✅ **Verificar**: Configurações mantidas

---

## 📝 NOTAS DE IMPLEMENTAÇÃO

### Decisões Arquiteturais
- **Estado Centralizado**: Seguir padrão do LoginBrandingEditor para zero latência
- **Theme Isolation**: Usar data-attributes para isolar CSS do preview
- **Discovery Automático**: Módulos exportam slotConfigForms array

### Limitações Conhecidas
- **Tipos Dinâmicos**: slotConfigs usa Record<string, any> por flexibilidade
  - Mitigação: Validação com Zod schemas específicos
  - Alternativa futura: Tipos genéricos por componente

### Referências
- DESIGN.md: Especificação completa com IDs de referência
- LoginBrandingEditor: `src/frontend/src/modules/setup/pages/PlatformSettings.tsx`
- Composition System: `src/frontend/src/core/composition/`