# Sistema de Cores Adaptativo - Módulo Webpage

Este documento especifica o sistema de cores que suporta temas claro e escuro de forma inteligente.

## Visão Geral

O sistema de cores funciona em 3 níveis de customização:

1. **Padrão (Sem customização)** - Usa cores do tema do sistema
2. **Cor Única Adaptativa** - Uma cor que se adapta automaticamente
3. **Cores por Tema** - Cores específicas para claro e escuro

---

## Sistema de 3 Níveis

### Nível 1: Cores do Tema (Padrão)

Quando nenhuma customização é feita, o sistema usa automaticamente as cores semânticas do tema:

```typescript
// Cores semânticas do tema (já otimizadas para claro/escuro)
const themeColors = {
  light: {
    primary: 'hsl(222.2 47.4% 11.2%)',      // Quase preto
    secondary: 'hsl(210 40% 96.1%)',        // Cinza claro
    background: 'hsl(0 0% 100%)',           // Branco
    foreground: 'hsl(222.2 84% 4.9%)',      // Preto
    muted: 'hsl(210 40% 96.1%)',
    accent: 'hsl(210 40% 96.1%)',
    // ... outras cores
  },
  dark: {
    primary: 'hsl(210 40% 98%)',            // Quase branco
    secondary: 'hsl(217.2 32.6% 17.5%)',    // Cinza escuro
    background: 'hsl(222.2 84% 4.9%)',      // Quase preto
    foreground: 'hsl(210 40% 98%)',         // Branco
    muted: 'hsl(217.2 32.6% 17.5%)',
    accent: 'hsl(217.2 32.6% 17.5%)',
    // ... outras cores
  }
};
```

### Nível 2: Cor Única Adaptativa

Usuário escolhe uma cor que é automaticamente ajustada para cada tema:

```typescript
interface AdaptiveColor {
  baseColor: string;  // Ex: '#3B82F6' (azul)

  // Sistema gera automaticamente variações
  light: {
    default: string;      // Cor base
    hover: string;        // 10% mais escuro
    active: string;       // 20% mais escuro
    contrast: string;     // Texto sobre a cor (branco/preto)
  };

  dark: {
    default: string;      // Cor ajustada (mais brilho/saturação)
    hover: string;        // 10% mais claro
    active: string;       // 20% mais claro
    contrast: string;     // Texto sobre a cor (branco/preto)
  };
}
```

**Algoritmo de Adaptação**:
```typescript
function adaptColorForDarkTheme(color: string): string {
  const hsl = hexToHSL(color);

  // Ajusta luminosidade e saturação para tema escuro
  return {
    h: hsl.h,
    s: Math.min(hsl.s * 1.1, 100),  // +10% saturação
    l: Math.min(hsl.l * 1.2, 85)    // +20% luminosidade (max 85%)
  };
}
```

### Nível 3: Cores Específicas por Tema

Usuário define cores diferentes para cada tema:

```typescript
interface ThemeSpecificColors {
  light: string;  // Ex: '#1E40AF' (azul escuro)
  dark: string;   // Ex: '#60A5FA' (azul claro)
}
```

---

## Interface de Configuração de Cor

### UI Progressiva

```
Color Configuration:
┌──────────────────────────────────────┐
│ Color Mode: [Theme Default ▼]        │
├──────────────────────────────────────┤
│                                      │
│ ✓ Using theme colors                │
│ No customization needed              │
│                                      │
└──────────────────────────────────────┘

Quando seleciona "Custom Color":
┌──────────────────────────────────────┐
│ Color Mode: [Custom Color ▼]         │
├──────────────────────────────────────┤
│ Base Color: [🎨 #3B82F6]            │
│                                      │
│ Preview:                             │
│ Light: [████] Dark: [████]          │
│                                      │
│ [Advanced: Set per theme]           │
└──────────────────────────────────────┘

Quando clica em "Advanced":
┌──────────────────────────────────────┐
│ Color Mode: [Per Theme ▼]            │
├──────────────────────────────────────┤
│ Light Theme: [🎨 #1E40AF]           │
│ Dark Theme:  [🎨 #60A5FA]           │
│                                      │
│ [Sync colors] [Auto-adapt]          │
└──────────────────────────────────────┘
```

---

## Propriedades de Cor nos Blocos

### Schema Atualizado

```typescript
interface ColorProperty {
  type: 'theme' | 'adaptive' | 'custom';

  // Quando type === 'theme'
  semantic?: 'primary' | 'secondary' | 'accent' | 'muted';

  // Quando type === 'adaptive'
  base?: string;

  // Quando type === 'custom'
  light?: string;
  dark?: string;
}

// Exemplo em um bloco Hero
interface HeroProps {
  backgroundColor?: ColorProperty;
  textColor?: ColorProperty;
  buttonColor?: ColorProperty;
}
```

### Valores Padrão

```typescript
const defaultColors: Record<string, ColorProperty> = {
  // Backgrounds
  heroBackground: { type: 'theme', semantic: 'background' },
  sectionBackground: { type: 'theme', semantic: 'background' },
  cardBackground: { type: 'theme', semantic: 'background' },

  // Texts
  headingColor: { type: 'theme', semantic: 'foreground' },
  bodyTextColor: { type: 'theme', semantic: 'foreground' },
  mutedTextColor: { type: 'theme', semantic: 'muted-foreground' },

  // Interactive
  buttonPrimary: { type: 'theme', semantic: 'primary' },
  buttonSecondary: { type: 'theme', semantic: 'secondary' },
  linkColor: { type: 'theme', semantic: 'primary' },

  // Accents
  borderColor: { type: 'theme', semantic: 'border' },
  dividerColor: { type: 'theme', semantic: 'border' },
  iconColor: { type: 'theme', semantic: 'foreground' }
};
```

---

## Renderização

### Component Helper

```typescript
function useBlockColor(colorProp?: ColorProperty): string {
  const { theme } = useTheme(); // 'light' | 'dark'

  if (!colorProp || colorProp.type === 'theme') {
    // Usa cor semântica do tema
    const semantic = colorProp?.semantic || 'primary';
    return `hsl(var(--${semantic}))`;
  }

  if (colorProp.type === 'adaptive') {
    // Adapta cor base para o tema atual
    const adapted = adaptColor(colorProp.base!, theme);
    return adapted;
  }

  if (colorProp.type === 'custom') {
    // Usa cor específica do tema
    return theme === 'dark' ? colorProp.dark! : colorProp.light!;
  }
}

// Uso no componente
function HeroBlock({ backgroundColor, textColor, ...props }) {
  const bgColor = useBlockColor(backgroundColor);
  const txtColor = useBlockColor(textColor);

  return (
    <div
      style={{
        backgroundColor: bgColor,
        color: txtColor
      }}
    >
      {/* conteúdo */}
    </div>
  );
}
```

---

## Color Picker Inteligente

### Componente ColorPicker

```typescript
interface SmartColorPickerProps {
  value: ColorProperty;
  onChange: (value: ColorProperty) => void;
  label: string;
  allowTheme?: boolean;  // Permite usar cores do tema
  allowAdaptive?: boolean; // Permite cor adaptativa
  allowCustom?: boolean;   // Permite cores por tema
}

function SmartColorPicker({ value, onChange, ...props }: SmartColorPickerProps) {
  const [mode, setMode] = useState(value.type);

  return (
    <div className="color-picker">
      {/* Selector de modo */}
      <Select value={mode} onChange={setMode}>
        {props.allowTheme && <Option value="theme">Theme Default</Option>}
        {props.allowAdaptive && <Option value="adaptive">Custom Color</Option>}
        {props.allowCustom && <Option value="custom">Per Theme</Option>}
      </Select>

      {/* Interface específica por modo */}
      {mode === 'theme' && <ThemeColorSelector />}
      {mode === 'adaptive' && <AdaptiveColorPicker />}
      {mode === 'custom' && <PerThemeColorPicker />}
    </div>
  );
}
```

### Theme Color Selector

```
Theme Colors:
┌─────────────────────────────────────┐
│ Primary   [████]                    │
│ Secondary [████]                    │
│ Accent    [████]                    │
│ Muted     [████]                    │
│ Success   [████]                    │
│ Warning   [████]                    │
│ Error     [████]                    │
└─────────────────────────────────────┘
```

### Adaptive Color Picker

```
Custom Color:
┌─────────────────────────────────────┐
│ Base: [🎨 #3B82F6]                  │
│                                     │
│ Auto-adapted preview:               │
│ ┌─────────┬─────────┐              │
│ │ Light   │ Dark    │              │
│ │ [████]  │ [████]  │              │
│ └─────────┴─────────┘              │
│                                     │
│ Contrast check: ✅ WCAG AA         │
└─────────────────────────────────────┘
```

---

## Presets de Cores

### Paletas Pré-definidas

```typescript
const colorPresets = {
  // Cores que funcionam bem em ambos os temas
  'Blue': {
    adaptive: '#3B82F6',
    light: '#1E40AF',
    dark: '#60A5FA'
  },
  'Green': {
    adaptive: '#10B981',
    light: '#059669',
    dark: '#34D399'
  },
  'Purple': {
    adaptive: '#8B5CF6',
    light: '#7C3AED',
    dark: '#A78BFA'
  },
  'Red': {
    adaptive: '#EF4444',
    light: '#DC2626',
    dark: '#F87171'
  },
  'Orange': {
    adaptive: '#F97316',
    light: '#EA580C',
    dark: '#FB923C'
  },
  'Teal': {
    adaptive: '#14B8A6',
    light: '#0D9488',
    dark: '#2DD4BF'
  }
};
```

### Quick Select

```
Quick Colors:
┌─────────────────────────────────────┐
│ ● Blue   ● Green  ● Purple         │
│ ● Red    ● Orange ● Teal           │
│                                     │
│ [Custom color...]                   │
└─────────────────────────────────────┘
```

---

## Contraste e Acessibilidade

### Validação Automática

```typescript
function validateContrast(
  foreground: string,
  background: string
): ContrastResult {
  const ratio = getContrastRatio(foreground, background);

  return {
    ratio,
    AA: ratio >= 4.5,      // WCAG AA
    AAA: ratio >= 7,       // WCAG AAA
    largeAA: ratio >= 3,   // Large text AA
    largeAAA: ratio >= 4.5 // Large text AAA
  };
}

// Sugestão automática
function suggestContrastColor(
  background: string,
  preferLight: boolean = false
): string {
  const bg = parseColor(background);
  const isLight = bg.luminance > 0.5;

  if (isLight) {
    // Fundo claro → texto escuro
    return preferLight
      ? lighten(background, 0.8)  // Ainda mais claro
      : darken(background, 0.7);   // Bem escuro
  } else {
    // Fundo escuro → texto claro
    return preferLight
      ? lighten(background, 0.7)   // Bem claro
      : darken(background, 0.8);    // Ainda mais escuro
  }
}
```

### Indicadores Visuais

```
Color Contrast:
┌─────────────────────────────────────┐
│ Text on Background:                 │
│                                     │
│ Aa  Contrast: 7.5:1                │
│ ███  ✅ WCAG AA  ✅ WCAG AAA      │
│                                     │
│ [Auto-fix contrast]                │
└─────────────────────────────────────┘
```

---

## Migração de Cores

### De Cor Fixa para Adaptativa

```typescript
function migrateColors(blocks: Block[]): Block[] {
  return blocks.map(block => {
    const updated = { ...block };

    // Migra cores fixas para adaptativas
    if (block.props.backgroundColor && typeof block.props.backgroundColor === 'string') {
      updated.props.backgroundColor = {
        type: 'adaptive',
        base: block.props.backgroundColor
      };
    }

    return updated;
  });
}
```

---

## CSS Variables

### Geração Automática

```css
/* Cores do tema (sempre disponíveis) */
:root {
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  /* ... */
}

/* Cores customizadas (quando definidas) */
.block-hero {
  --block-bg: var(--primary);  /* Fallback para tema */
  --block-text: var(--primary-foreground);
}

/* Override quando customizado */
.block-hero[data-custom-colors] {
  --block-bg: #3B82F6;  /* Cor customizada */
  --block-text: #FFFFFF;
}

/* Tema escuro */
.dark .block-hero[data-custom-colors] {
  --block-bg: #60A5FA;  /* Cor adaptada */
  --block-text: #000000;
}
```

---

## Performance

### Otimizações

1. **Cache de Adaptações**: Cores adaptadas são calculadas uma vez e cacheadas
2. **CSS Variables**: Usa variáveis CSS em vez de inline styles
3. **Lazy Calculation**: Só calcula adaptações quando necessário
4. **Batch Updates**: Agrupa mudanças de cor

```typescript
const colorCache = new Map<string, AdaptedColors>();

function getAdaptedColors(base: string): AdaptedColors {
  if (colorCache.has(base)) {
    return colorCache.get(base)!;
  }

  const adapted = calculateAdaptations(base);
  colorCache.set(base, adapted);
  return adapted;
}
```

---

## Exemplos de Uso

### Hero Block com Cores

```typescript
// Padrão - Usa cores do tema
<HeroBlock />

// Cor única adaptativa
<HeroBlock
  backgroundColor={{
    type: 'adaptive',
    base: '#3B82F6'
  }}
/>

// Cores específicas por tema
<HeroBlock
  backgroundColor={{
    type: 'custom',
    light: '#EFF6FF',  // Azul muito claro
    dark: '#1E3A8A'    // Azul muito escuro
  }}
  textColor={{
    type: 'custom',
    light: '#1E40AF',  // Azul escuro
    dark: '#DBEAFE'    // Azul claro
  }}
/>
```

### Migração Simples

```typescript
// Antes (cor fixa)
backgroundColor: '#3B82F6'

// Depois (adaptativa)
backgroundColor: {
  type: 'adaptive',
  base: '#3B82F6'
}

// Ou usa tema (melhor opção)
backgroundColor: {
  type: 'theme',
  semantic: 'primary'
}
```