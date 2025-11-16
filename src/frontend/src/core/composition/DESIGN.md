# DESIGN - Editor de Composições com SlotConfigForm

**Versão**: 1.0
**Data**: 2024-11-15

---

## 📋 VISÃO GERAL

Sistema completo para edição visual de composições de layout com configuração inline de componentes, baseado na técnica fantástica do LoginBrandingEditor.

---

## 🎨 ARQUITETURA

### [DES-ARCH-001] Estado Centralizado

Estado único de verdade mantido no componente principal:

```typescript
const [config, setConfig] = useState<Composition>(initialComposition);
const [hasChanges, setHasChanges] = useState(false);
```

Fluxo: User → handleChange → setState → Preview atualiza → hasChanges detecta

### [DES-ARCH-002] SlotConfigForm Registry

Registry central para forms de configuração de slots:

```typescript
class SlotConfigFormRegistry {
  register(metadata: SlotConfigFormMetadata): void;
  getForm(componentId: string): SlotConfigFormMetadata | undefined;
}
```

Discovery automático: módulos exportam `slotConfigForms` array.

### [DES-ARCH-003] Estrutura de Dados Expandida

```typescript
interface Composition {
  // campos existentes...
  slotConfigs: {
    [componentId: string]: {
      [key: string]: any;
    };
  };
}
```

Configurações específicas de cada componente armazenadas junto com a composição.

---

## 🖼️ LAYOUT VISUAL

### [DES-UI-001] Layout ResizablePanel

Layout side-by-side ajustável com proporção 60/40:

```
┌─────────────────────────────────────────────────────┐
│ Header: "Editar Composição: {name}"                 │
├──────────────────────┬──────────────────────────────┤
│  CompositionPreview  │  Controls (Tabs)            │
│  (60% width)         │  (40% width)                 │
│                      │  - Layout                    │
│  Preview em          │  - Slots                     │
│  tempo real          │  - Components                │
│                      │                              │
└──────────────────────┴──────────────────────────────┘
│ Footer: [Cancel] [Reset]          [Save Composition]│
└─────────────────────────────────────────────────────┘
```

### [DES-UI-002] CompositionPreview

- Renderização HTML real da estrutura de composição
- Badge indicador "PREVIEW - Clique para editar"
- Edição inline via Popovers
- Theme isolation via CompositionThemeProvider
- Zero latência nas atualizações

### [DES-UI-003] SlotCard Dinâmico

Cada slot tem um card que:
1. Permite selecionar componente via dropdown
2. Exibe SlotConfigForm inline quando disponível
3. Validação em tempo real com feedback visual
4. Estado expandido/colapsado

---

## 🔧 COMPONENTES

### [DES-COMP-001] CompositionEditor

Componente principal orquestrador:

```typescript
interface CompositionEditorProps {
  compositionId?: string;
  portalId: string;
  onSave: (composition: Composition) => void;
  onClose: () => void;
}
```

### [DES-COMP-002] SlotCard

```typescript
interface SlotCardProps {
  slotType: SlotType;
  config?: { componentId?: string; config?: Record<string, any> };
  onComponentChange: (componentId: string | undefined) => void;
  onConfigChange: (config: Record<string, any>) => void;
  validationError?: string;
}
```

### [DES-COMP-003] SlotConfigForm

Interface padrão para forms de configuração:

```typescript
interface SlotConfigFormProps {
  slotType: SlotType;
  componentId: string;
  config: SlotComponentConfig;
  onChange: (config: SlotComponentConfig) => void;
}
```

### [DES-COMP-004] CompositionThemeProvider

Provider isolado para aplicar estilos sem afetar o resto da página:

```typescript
<CompositionThemeProvider composition={config}>
  <div data-composition-preview="true">
    {children}
  </div>
</CompositionThemeProvider>
```

---

## 📝 EXEMPLO: BlueprintHeaderConfigForm

### [DES-FORM-001] Estrutura de Configuração

```typescript
interface BlueprintHeaderConfig {
  menuItems: Array<{
    id: string;
    label: string;
    href: string;
    icon?: string;      // Nome do ícone Lucide
    submenus?: Array<{
      id: string;
      label: string;
      href: string;
    }>;
  }>;
  showBrandLogo?: boolean;
  showThemeToggle?: boolean;
  sticky?: boolean;
}
```

### [DES-FORM-002] Componente de Edição

```typescript
export function BlueprintHeaderConfigForm({
  config,
  onChange,
}: SlotConfigFormProps) {
  // Adicionar/remover/reordenar itens
  // Configurar ícones e submenus
  // Toggles para brand logo e theme switcher
  // Propagação instantânea via onChange
}
```

---

## 🔄 FLUXO DE DADOS

### [DES-FLOW-001] Ciclo de Atualização

```
1. User interage com Control
   ↓
2. handleChange() chamado
   ↓
3. setConfig() atualiza estado
   ↓
4. CompositionPreview recebe novo config via prop
   ↓
5. Renderização instantânea (zero latência)
   ↓
6. useEffect detecta hasChanges
   ↓
7. Botão Save ativa/desativa
```

### [DES-FLOW-002] Descoberta de Forms

```
1. Módulo registra slotConfigForms
   ↓
2. SlotConfigFormRegistry.register()
   ↓
3. SlotCard consulta registry
   ↓
4. Se existe form, renderiza inline
   ↓
5. onChange propaga para CompositionEditor
```

---

## 💾 PERSISTÊNCIA

### [DES-STORE-001] Storage Local

```typescript
function getStorageKey(compositionId: string): string {
  return `composition:${compositionId}:config`;
}

export function getComposition(id: string): Composition | null {
  const stored = localStorage.getItem(getStorageKey(id));
  return stored ? CompositionSchema.parse(JSON.parse(stored)) : null;
}
```

### [DES-STORE-002] Persistência Backend

Via JQEL com schema="backend":

```typescript
{
  schema: 'backend',
  mutate: 'composition',
  action: 'insert',
  values: {
    id: compositionId,
    portalId: portalId,
    ...config,
    slotConfigs: {...}
  }
}
```

---

## 🏗️ ESTRUTURA DE ARQUIVOS

### [DES-FILES-001] Organização de Módulos

```
modules/setup/
├── pages/
│   └── CompositionEditor.tsx
├── components/composition/
│   ├── CompositionPreview.tsx
│   ├── CompositionThemeProvider.tsx
│   ├── SlotCard.tsx
│   └── ComponentSelector.tsx
└── hooks/
    └── useComposition.ts

modules/blueprint/
└── setup/forms/
    ├── BlueprintHeaderConfigForm.tsx
    └── BlueprintSidebarConfigForm.tsx
```

### [DES-FILES-002] Core Extensions

```
core/composition/
├── SlotConfigFormRegistry.ts    [NOVO]
├── types.ts                     [EXPANDIR com slotConfigs]
└── hooks/
    └── useSlotConfigForm.ts     [NOVO]
```

---

## 🎯 TÉCNICAS PRINCIPAIS

### [DES-TECH-001] Zero Latência
Preview atualiza instantaneamente via props, sem debounce.

### [DES-TECH-002] Theme Isolation
CSS variables aplicadas apenas dentro do container de preview.

### [DES-TECH-003] Componentes Compostos
SlotCard contém ComponentSelector + SlotConfigForm opcionalmente.

### [DES-TECH-004] Change Detection
useEffect compara config atual vs original para detectar mudanças.

### [DES-TECH-005] Validação com Zod
Schemas para cada configuração garantem type-safety.

---

## 📚 REFERÊNCIAS

- LoginBrandingEditor: `src/frontend/src/modules/setup/pages/PlatformSettings.tsx`
- ResizablePanel: shadcn/ui components
- Composition System: `src/frontend/src/core/composition/`
- Blueprint Module: `src/frontend/src/modules/blueprint/`