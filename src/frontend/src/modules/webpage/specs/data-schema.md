# Data Schema - Módulo Webpage

Este documento define os schemas TypeScript para todas as estruturas de dados do módulo webpage.

## Índice

1. [Core Schemas](#core-schemas)
2. [Block System](#block-system)
3. [Template System](#template-system)
4. [Editor State](#editor-state)
5. [Publishing System](#publishing-system)
6. [Design Tokens](#design-tokens)
7. [Analytics & Tracking](#analytics--tracking)

---

## Core Schemas

### Page

Estrutura principal de uma página no sistema.

```typescript
interface Page {
  // Identificação
  id: string;                    // UUID único da página
  instanceId: string;             // ID da instância do módulo webpage
  slug: string;                   // URL slug da página

  // Metadados
  title: string;                  // Título da página
  description?: string;           // Descrição para SEO
  thumbnail?: string;             // URL da thumbnail para preview

  // Estado e Versionamento
  status: PageStatus;             // Estado atual da página
  version: number;                // Versão atual (draft)
  publishedVersion?: number;      // Versão publicada
  scheduledVersion?: number;      // Versão agendada

  // Conteúdo
  blocks: Block[];                // Array de blocos da página
  settings: PageSettings;         // Configurações da página
  tokens?: DesignTokens;          // Tokens customizados

  // SEO & Meta
  seo: SEOSettings;               // Configurações de SEO
  socialMeta?: SocialMetaTags;    // Open Graph e Twitter Cards

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  scheduledFor?: Date;
  archivedAt?: Date;

  // Autoria
  createdBy: string;              // User ID do criador
  lastEditedBy: string;           // User ID do último editor
  publishedBy?: string;           // User ID de quem publicou

  // A/B Testing
  isVariant?: boolean;            // É uma variante A/B
  variantOf?: string;             // ID da página original
  variantSettings?: VariantSettings;

  // Analytics
  analytics?: AnalyticsConfig;    // Configurações de analytics

  // Colaboração
  currentEditors?: string[];      // IDs dos editores atuais
  lockedBy?: string;              // ID de quem travou para edição
  lockedAt?: Date;
}

type PageStatus =
  | 'draft'        // Em edição
  | 'review'       // Em revisão
  | 'scheduled'    // Agendado para publicação
  | 'published'    // Publicado e ativo
  | 'archived';    // Arquivado

interface PageSettings {
  // Layout
  layout: PageLayout;
  maxWidth?: string;              // ex: "1200px", "100%"
  padding?: SpacingConfig;

  // Background
  background?: BackgroundSettings;

  // Comportamento
  smoothScroll?: boolean;
  stickyHeader?: boolean;
  showBackToTop?: boolean;

  // Custom Code
  customCss?: string;
  customJs?: string;
  headScripts?: string;           // Scripts no <head>
  bodyScripts?: string;           // Scripts antes do </body>

  // Proteção
  password?: string;              // Proteção por senha
  requireAuth?: boolean;          // Requer autenticação
  allowedRoles?: string[];        // Roles permitidos
}

type PageLayout =
  | 'full-width'      // 100% largura
  | 'boxed'           // Container com max-width
  | 'sidebar-left'    // Sidebar à esquerda
  | 'sidebar-right';  // Sidebar à direita

interface BackgroundSettings {
  type: 'color' | 'gradient' | 'image' | 'video' | 'pattern';
  value: string;                  // Cor, URL, ou gradiente CSS
  overlay?: {
    enabled: boolean;
    color: string;
    opacity: number;              // 0-100
  };
  parallax?: boolean;
  fixed?: boolean;
}

interface SpacingConfig {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  // Ou shorthand
  all?: string;
  horizontal?: string;
  vertical?: string;
}
```

---

## Block System

### Block

Estrutura de um bloco individual na página.

```typescript
interface Block {
  // Identificação
  id: string;                     // UUID único do bloco
  type: string;                   // Tipo do bloco (hero-minimal, etc)
  order: number;                  // Ordem na página

  // Hierarquia
  parentId?: string;              // ID do bloco pai (para nested)
  children?: Block[];             // Blocos filhos

  // Conteúdo
  props: BlockProps;              // Propriedades específicas do tipo

  // Responsividade
  responsive?: ResponsiveProps;   // Overrides por breakpoint

  // Animação
  animation?: AnimationSettings;  // Configurações de animação

  // Visibilidade
  visible: boolean;               // Visível ou não
  conditions?: VisibilityCondition[]; // Condições de visibilidade

  // Estilos
  customStyles?: CustomStyles;    // CSS customizado
  className?: string;             // Classes CSS adicionais

  // Metadados
  locked?: boolean;               // Bloqueado para edição
  notes?: string;                 // Notas internas
  tags?: string[];                // Tags para organização

  // A/B Testing
  testVariants?: BlockVariant[];  // Variantes para teste
  activeVariant?: string;         // Variante ativa
}

interface BlockProps {
  [key: string]: any;             // Props específicas por tipo de bloco

  // Props comuns opcionais
  title?: string;
  subtitle?: string;
  description?: string;
  image?: MediaAsset;
  link?: LinkConfig;
  buttons?: ButtonConfig[];

  // Sistema de cores adaptativo
  backgroundColor?: ColorProperty;
  textColor?: ColorProperty;
  accentColor?: ColorProperty;
  borderColor?: ColorProperty;
}

interface ResponsiveProps {
  mobile?: Partial<BlockProps>;   // <= 768px
  tablet?: Partial<BlockProps>;   // 769px - 1024px
  desktop?: Partial<BlockProps>;  // > 1024px

  // Breakpoints customizados
  custom?: {
    breakpoint: number;
    props: Partial<BlockProps>;
  }[];
}

interface AnimationSettings {
  // Trigger
  trigger: AnimationTrigger;
  triggerOffset?: number;         // Pixels ou porcentagem

  // Animação de entrada
  entrance?: {
    type: AnimationType;
    duration: number;             // ms
    delay: number;                // ms
    easing: AnimationEasing;
  };

  // Animação contínua
  continuous?: {
    type: ContinuousAnimationType;
    duration: number;
    repeat: 'infinite' | number;
  };

  // Animação de interação
  hover?: {
    type: HoverAnimationType;
    duration: number;
  };

  // Parallax
  parallax?: {
    speed: number;                // -1 to 1
    offset: number;
  };
}

type AnimationTrigger =
  | 'onLoad'        // Ao carregar a página
  | 'onScroll'      // Ao aparecer no scroll
  | 'onHover'       // Ao hover
  | 'onClick';      // Ao clicar

type AnimationType =
  | 'fadeIn'
  | 'slideUp'
  | 'slideDown'
  | 'slideLeft'
  | 'slideRight'
  | 'zoomIn'
  | 'zoomOut'
  | 'rotateIn'
  | 'blurIn'
  | 'letterPull'
  | 'wordPull';

type AnimationEasing =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'spring'
  | 'bounce';

interface VisibilityCondition {
  type: 'device' | 'user' | 'date' | 'custom';
  operator: 'is' | 'isNot' | 'contains' | 'greaterThan' | 'lessThan';
  value: any;
}

interface CustomStyles {
  desktop?: string;               // CSS para desktop
  tablet?: string;                // CSS para tablet
  mobile?: string;                // CSS para mobile
}
```

### Block Definition

Definição de um tipo de bloco no sistema.

```typescript
interface BlockDefinition {
  // Identificação
  id: string;                     // ID único do tipo (hero-minimal)
  name: string;                   // Nome display
  category: BlockCategory;        // Categoria do bloco
  icon: string;                   // Ícone (Lucide icon name)
  description: string;            // Descrição breve

  // Schema
  props: PropDefinition[];        // Definição das propriedades
  slots?: SlotDefinition[];       // Slots para children

  // Presets
  presets: BlockPreset[];         // Presets/variantes prontas
  defaultProps: BlockProps;       // Props padrão

  // Componente
  component: string;              // Path do componente React
  loadComponent?: () => Promise<any>; // Lazy loading

  // Editor
  editorConfig: EditorConfig;     // Configurações do editor

  // Metadados
  tags: string[];                 // Tags de busca
  isPro?: boolean;                // Requer plano Pro
  isNew?: boolean;                // Badge "NEW"
  isBeta?: boolean;               // Badge "BETA"
  documentation?: string;         // URL da documentação
  examples?: BlockExample[];      // Exemplos de uso

  // Compatibilidade
  minVersion?: string;            // Versão mínima do editor
  dependencies?: string[];        // Dependências de outros blocos
  incompatible?: string[];        // Blocos incompatíveis
}

type BlockCategory =
  | 'hero'
  | 'content'
  | 'media'
  | 'lists'
  | 'forms'
  | 'navigation'
  | 'social'
  | 'cta'
  | 'dynamic'
  | 'ecommerce'
  | 'special'
  | 'structural';

interface PropDefinition {
  key: string;                    // Nome da propriedade
  label: string;                  // Label no editor
  type: PropType;                 // Tipo de dado
  defaultValue?: any;             // Valor padrão
  required?: boolean;             // Obrigatório

  // Validação
  validation?: ValidationRule;

  // UI Control
  control: ControlType;           // Tipo de controle no editor
  controlConfig?: any;            // Config específica do controle

  // Comportamento
  placeholder?: string;           // Placeholder
  helperText?: string;            // Texto de ajuda
  tooltip?: string;               // Tooltip

  // Condicional
  showIf?: ConditionRule;        // Mostrar apenas se
  enableIf?: ConditionRule;      // Habilitar apenas se

  // Responsivo
  responsive?: boolean;           // Permite valores por breakpoint

  // Agrupamento
  group?: string;                 // Grupo no painel
  order?: number;                 // Ordem no grupo
}

type PropType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object'
  | 'date'
  | 'color'
  | 'url'
  | 'icon'
  | 'image'
  | 'video'
  | 'richtext'
  | 'json';

type ControlType =
  | 'text'          // Input texto
  | 'textarea'      // Textarea
  | 'number'        // Input número
  | 'select'        // Dropdown
  | 'multiselect'   // Multi-select
  | 'radio'         // Radio buttons
  | 'checkbox'      // Checkbox
  | 'toggle'        // Switch toggle
  | 'slider'        // Slider
  | 'color'         // Color picker
  | 'date'          // Date picker
  | 'time'          // Time picker
  | 'media'         // Media picker
  | 'icon'          // Icon picker
  | 'link'          // Link builder
  | 'richtext'      // Rich text editor
  | 'code'          // Code editor
  | 'json'          // JSON editor
  | 'repeater'      // Repeater field
  | 'group';        // Field group

interface ValidationRule {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
  message?: string;
}

interface SlotDefinition {
  name: string;
  label: string;
  accepts: string[];              // Tipos de blocos aceitos
  maxItems?: number;
  minItems?: number;
  defaultBlocks?: Block[];
}

interface BlockPreset {
  id: string;
  name: string;
  thumbnail?: string;
  props: BlockProps;
  description?: string;
}

interface EditorConfig {
  // Preview
  previewMode: 'live' | 'static' | 'none';
  previewComponent?: string;

  // Painéis
  panels: EditorPanel[];
  defaultPanel?: string;

  // Comportamento
  resizable?: boolean;
  draggable?: boolean;
  duplicatable?: boolean;
  deletable?: boolean;

  // Inline editing
  inlineEditable?: string[];     // Props editáveis inline
  doubleClickEdit?: boolean;

  // Toolbar
  toolbar?: ToolbarConfig;
}

interface EditorPanel {
  id: string;
  label: string;
  icon?: string;
  groups: PropGroup[];
}

interface PropGroup {
  label: string;
  props: string[];                // Keys das props
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}
```

---

## Template System

### Template

Estrutura de um template de página.

```typescript
interface Template {
  // Identificação
  id: string;
  name: string;
  slug: string;

  // Categorização
  category: TemplateCategory;
  tags: string[];
  industries?: string[];          // Indústrias relevantes

  // Visual
  thumbnail: string;               // URL da thumbnail
  preview?: string;                // URL do preview live
  screenshots?: string[];          // Screenshots adicionais

  // Conteúdo
  description: string;
  features?: string[];             // Lista de features
  blocks: Block[];                 // Blocos do template
  settings?: PageSettings;         // Settings predefinidos
  tokens?: DesignTokens;           // Tokens customizados

  // Metadata
  isPremium?: boolean;             // Template premium
  price?: number;                  // Preço se premium
  author?: string;                 // Autor do template
  version: string;                 // Versão do template

  // Estatísticas
  usageCount: number;              // Vezes usado
  rating?: number;                 // Avaliação média
  reviews?: number;                // Número de reviews

  // Dados de exemplo
  sampleData?: SampleData;         // Dados de exemplo

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

type TemplateCategory =
  | 'landing'
  | 'portfolio'
  | 'blog'
  | 'ecommerce'
  | 'saas'
  | 'restaurant'
  | 'event'
  | 'documentation'
  | 'personal'
  | 'corporate'
  | 'education'
  | 'nonprofit'
  | 'blank';

interface SampleData {
  // Textos
  companyName?: string;
  tagline?: string;
  description?: string;

  // Imagens
  logo?: string;
  heroImage?: string;
  gallery?: string[];

  // Dados estruturados
  features?: Array<{
    icon: string;
    title: string;
    description: string;
  }>;

  testimonials?: Array<{
    text: string;
    author: string;
    role: string;
    avatar: string;
  }>;

  team?: Array<{
    name: string;
    role: string;
    bio: string;
    photo: string;
  }>;

  // Outros dados específicos
  [key: string]: any;
}

interface TemplateCollection {
  id: string;
  name: string;
  description: string;
  templates: string[];             // IDs dos templates
  featured?: boolean;
  order?: number;
}
```

---

## Editor State

### EditorState

Estado global do editor.

```typescript
interface EditorState {
  // Página atual
  currentPage: Page | null;
  originalPage: Page | null;       // Para comparação
  isDirty: boolean;                // Tem mudanças não salvas

  // Seleção
  selectedBlockIds: string[];      // Blocos selecionados
  hoveredBlockId: string | null;   // Bloco com hover
  focusedBlockId: string | null;   // Bloco com foco

  // Modo de edição
  mode: EditorMode;
  viewport: ViewportMode;
  zoom: number;                    // 25-200%

  // UI State
  panels: {
    left: PanelState;
    right: PanelState;
  };
  toolbar: ToolbarState;

  // Histórico
  history: HistoryState;

  // Colaboração
  collaborators: Collaborator[];

  // Clipboard
  clipboard: ClipboardState;

  // Drag & Drop
  dragState: DragState | null;

  // Configurações
  settings: EditorSettings;
}

type EditorMode =
  | 'edit'          // Modo edição
  | 'preview'       // Preview
  | 'responsive'    // Preview responsivo
  | 'collaborate'   // Colaboração
  | 'comments';     // Comentários

type ViewportMode =
  | 'desktop'       // 1440px
  | 'laptop'        // 1024px
  | 'tablet'        // 768px
  | 'mobile'        // 375px
  | 'custom';       // Customizado

interface PanelState {
  visible: boolean;
  width: number;                  // Pixels
  activeTab?: string;
  collapsed?: boolean;
  pinned?: boolean;
}

interface ToolbarState {
  visible: boolean;
  position: 'top' | 'bottom' | 'floating';
  tools: string[];                // IDs das ferramentas ativas
}

interface HistoryState {
  past: HistoryEntry[];
  future: HistoryEntry[];
  currentEntry: HistoryEntry;
  maxEntries: number;             // Limite de entradas

  // Savepoints
  savepoints: SavePoint[];
  lastAutoSave?: Date;
}

interface HistoryEntry {
  id: string;
  timestamp: Date;
  action: string;                 // Descrição da ação
  page: Page;                     // Snapshot da página
  userId: string;

  // Agrupamento
  groupId?: string;               // Para agrupar ações relacionadas
  groupSequence?: number;
}

interface SavePoint {
  id: string;
  name: string;
  timestamp: Date;
  page: Page;
  userId: string;
}

interface Collaborator {
  userId: string;
  name: string;
  avatar?: string;
  color: string;                  // Cor do cursor
  cursor?: CursorPosition;
  selection?: string[];           // IDs dos blocos selecionados
  isActive: boolean;
  lastActivity: Date;
}

interface CursorPosition {
  x: number;
  y: number;
  blockId?: string;
}

interface ClipboardState {
  content: ClipboardContent | null;
  history: ClipboardContent[];    // Histórico de clipboard
  maxHistory: number;
}

interface ClipboardContent {
  type: 'block' | 'blocks' | 'text' | 'styles';
  data: any;
  timestamp: Date;
  source: 'cut' | 'copy';
}

interface DragState {
  isDragging: boolean;
  draggedBlock: Block | null;
  draggedFrom: number;            // Índice original
  draggedOver: number | null;     // Índice atual do hover
  dropEffect: 'move' | 'copy';
  ghostImage?: HTMLElement;
}

interface EditorSettings {
  // Visual
  theme: 'light' | 'dark' | 'auto';
  showGrid: boolean;
  gridSize: number;               // 8, 16, 24 pixels
  snapToGrid: boolean;

  // Guides
  showGuides: boolean;
  showRulers: boolean;
  showDimensions: boolean;

  // Comportamento
  autoSave: boolean;
  autoSaveInterval: number;       // Minutos
  confirmDelete: boolean;

  // Performance
  instantPreview: boolean;
  lowPerformanceMode: boolean;

  // Acessibilidade
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
}
```

---

## Publishing System

### PublishingState

Sistema de publicação e versionamento.

```typescript
interface PublishingState {
  // Versões
  versions: PageVersion[];
  currentVersion: number;
  publishedVersion: number | null;

  // Agendamento
  scheduledPublish?: ScheduledPublish;

  // Comparação
  comparison?: VersionComparison;

  // Workflow
  workflow?: PublishWorkflow;
}

interface PageVersion {
  version: number;
  page: Page;

  // Metadados
  createdAt: Date;
  createdBy: string;
  message?: string;               // Mensagem de commit

  // Estado
  status: VersionStatus;
  isPublished: boolean;
  publishedAt?: Date;
  publishedBy?: string;

  // Tags
  tags?: string[];
  isMajor?: boolean;              // Versão major

  // Comparação
  changes?: ChangeSet;
}

type VersionStatus =
  | 'draft'
  | 'review'
  | 'approved'
  | 'published'
  | 'archived';

interface ScheduledPublish {
  version: number;
  scheduledFor: Date;
  timezone: string;

  // Opções
  unpublishAt?: Date;             // Auto-despublicar
  recurring?: RecurringSchedule;

  // Estado
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

interface RecurringSchedule {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;               // A cada N frequências
  daysOfWeek?: number[];         // 0-6 (domingo-sábado)
  dayOfMonth?: number;           // 1-31
  time: string;                   // HH:MM
  endDate?: Date;
}

interface VersionComparison {
  from: number;                   // Versão de origem
  to: number;                     // Versão de destino
  changes: ChangeSet;

  // Visual diff
  visualDiff?: VisualDiff;
}

interface ChangeSet {
  added: string[];                // IDs dos blocos adicionados
  removed: string[];              // IDs dos blocos removidos
  modified: Array<{
    blockId: string;
    changes: PropertyChange[];
  }>;
  reordered: Array<{
    blockId: string;
    from: number;
    to: number;
  }>;

  // Resumo
  summary: string;
  totalChanges: number;
}

interface PropertyChange {
  property: string;
  oldValue: any;
  newValue: any;
}

interface VisualDiff {
  enabled: boolean;
  mode: 'side-by-side' | 'overlay' | 'slider';
  highlights: Array<{
    blockId: string;
    type: 'added' | 'removed' | 'modified';
  }>;
}

interface PublishWorkflow {
  stages: WorkflowStage[];
  currentStage: number;

  // Aprovações
  approvals: Approval[];
  requiredApprovals: number;

  // Comentários
  comments: WorkflowComment[];
}

interface WorkflowStage {
  id: string;
  name: string;
  order: number;

  // Condições
  autoAdvance?: boolean;
  conditions?: WorkflowCondition[];

  // Ações
  actions?: WorkflowAction[];
}

interface Approval {
  userId: string;
  userName: string;
  timestamp: Date;
  status: 'approved' | 'rejected' | 'pending';
  comment?: string;
}

interface WorkflowComment {
  id: string;
  userId: string;
  userName: string;
  timestamp: Date;
  text: string;
  blockId?: string;               // Comentário em bloco específico
}
```

---

## Design Tokens

### DesignTokens

Sistema de design tokens customizáveis.

```typescript
interface DesignTokens {
  // Cores
  colors: ColorTokens;

  // Tipografia
  typography: TypographyTokens;

  // Espaçamento
  spacing: SpacingTokens;

  // Bordas
  borders: BorderTokens;

  // Sombras
  shadows: ShadowTokens;

  // Animações
  animation: AnimationTokens;

  // Breakpoints
  breakpoints: BreakpointTokens;

  // Z-index
  zIndex: ZIndexTokens;

  // Custom tokens
  custom?: Record<string, any>;
}

interface ColorTokens {
  // Brand colors
  primary: ColorScale;
  secondary: ColorScale;
  accent?: ColorScale;

  // Neutral colors
  neutral: ColorScale;

  // Semantic colors
  success: ColorScale;
  warning: ColorScale;
  error: ColorScale;
  info: ColorScale;

  // Surface colors
  background: string;
  foreground: string;
  surface: string;
  surfaceVariant: string;

  // Borders
  border: string;
  borderVariant: string;

  // Custom colors
  custom?: Record<string, string | ColorScale>;
}

interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;   // Default
  600: string;
  700: string;
  800: string;
  900: string;
  950?: string;
}

interface TypographyTokens {
  // Font families
  fontFamily: {
    heading: string;
    body: string;
    mono: string;
    custom?: Record<string, string>;
  };

  // Font sizes
  fontSize: {
    xs: string;     // 12px
    sm: string;     // 14px
    base: string;   // 16px
    lg: string;     // 18px
    xl: string;     // 20px
    '2xl': string;  // 24px
    '3xl': string;  // 30px
    '4xl': string;  // 36px
    '5xl': string;  // 48px
    '6xl': string;  // 60px
    '7xl': string;  // 72px
    '8xl': string;  // 96px
    '9xl': string;  // 128px
  };

  // Font weight
  fontWeight: {
    light: number;      // 300
    regular: number;    // 400
    medium: number;     // 500
    semibold: number;   // 600
    bold: number;       // 700
    extrabold: number;  // 800
  };

  // Line height
  lineHeight: {
    tight: number;      // 1.25
    normal: number;     // 1.5
    relaxed: number;    // 1.75
    loose: number;      // 2
  };

  // Letter spacing
  letterSpacing: {
    tighter: string;    // -0.05em
    tight: string;      // -0.025em
    normal: string;     // 0
    wide: string;       // 0.025em
    wider: string;      // 0.05em
    widest: string;     // 0.1em
  };
}

interface SpacingTokens {
  0: string;      // 0px
  0.5: string;    // 2px
  1: string;      // 4px
  1.5: string;    // 6px
  2: string;      // 8px
  2.5: string;    // 10px
  3: string;      // 12px
  3.5: string;    // 14px
  4: string;      // 16px
  5: string;      // 20px
  6: string;      // 24px
  7: string;      // 28px
  8: string;      // 32px
  9: string;      // 36px
  10: string;     // 40px
  11: string;     // 44px
  12: string;     // 48px
  14: string;     // 56px
  16: string;     // 64px
  20: string;     // 80px
  24: string;     // 96px
  28: string;     // 112px
  32: string;     // 128px
  36: string;     // 144px
  40: string;     // 160px
  44: string;     // 176px
  48: string;     // 192px
  52: string;     // 208px
  56: string;     // 224px
  60: string;     // 240px
  64: string;     // 256px
  72: string;     // 288px
  80: string;     // 320px
  96: string;     // 384px
}

interface BorderTokens {
  radius: {
    none: string;       // 0
    sm: string;         // 2px
    base: string;       // 4px
    md: string;         // 6px
    lg: string;         // 8px
    xl: string;         // 12px
    '2xl': string;      // 16px
    '3xl': string;      // 24px
    full: string;       // 9999px
  };

  width: {
    0: string;          // 0px
    1: string;          // 1px
    2: string;          // 2px
    4: string;          // 4px
    8: string;          // 8px
  };
}

interface ShadowTokens {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
}

interface AnimationTokens {
  duration: {
    instant: string;    // 0ms
    fast: string;       // 150ms
    normal: string;     // 300ms
    slow: string;       // 500ms
    slower: string;     // 700ms
    slowest: string;    // 1000ms
  };

  easing: {
    linear: string;
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
    spring: string;     // cubic-bezier
    bounce: string;     // cubic-bezier
  };
}

interface BreakpointTokens {
  xs: number;     // 475px
  sm: number;     // 640px
  md: number;     // 768px
  lg: number;     // 1024px
  xl: number;     // 1280px
  '2xl': number;  // 1536px
}

interface ZIndexTokens {
  hide: number;           // -1
  base: number;           // 0
  dropdown: number;       // 10
  sticky: number;         // 20
  overlay: number;        // 30
  modal: number;          // 40
  popover: number;        // 50
  toast: number;          // 60
  tooltip: number;        // 70
}
```

---

## Analytics & Tracking

### AnalyticsConfig

Configuração de analytics e tracking.

```typescript
interface AnalyticsConfig {
  // Tracking IDs
  googleAnalytics?: string;
  facebookPixel?: string;
  hotjar?: string;
  clarity?: string;
  customTracking?: CustomTracker[];

  // Eventos
  trackingEvents: TrackingEvent[];

  // Conversões
  conversions: ConversionGoal[];

  // Heatmaps
  heatmaps?: HeatmapConfig;

  // A/B Testing
  experiments?: Experiment[];
}

interface CustomTracker {
  id: string;
  name: string;
  script: string;
  enabled: boolean;
}

interface TrackingEvent {
  id: string;
  name: string;
  trigger: EventTrigger;

  // Dados do evento
  category?: string;
  action?: string;
  label?: string;
  value?: number;

  // Condições
  conditions?: EventCondition[];

  // Destinos
  sendTo: ('ga' | 'fb' | 'custom')[];
}

type EventTrigger =
  | 'pageView'
  | 'click'
  | 'scroll'
  | 'formSubmit'
  | 'videoPlay'
  | 'custom';

interface EventCondition {
  type: 'element' | 'url' | 'time' | 'scroll';
  operator: string;
  value: any;
}

interface ConversionGoal {
  id: string;
  name: string;
  type: 'event' | 'pageview' | 'duration' | 'custom';
  value?: number;

  // Funil
  funnel?: FunnelStep[];

  // Atribuição
  attribution: 'lastClick' | 'firstClick' | 'linear' | 'timeDecay';
}

interface FunnelStep {
  name: string;
  url?: string;
  event?: string;
  required: boolean;
}

interface HeatmapConfig {
  enabled: boolean;
  type: 'clicks' | 'moves' | 'scroll' | 'all';
  sampleRate: number;             // 0-100%
  excludeElements?: string[];     // CSS selectors
}

interface Experiment {
  id: string;
  name: string;
  status: 'draft' | 'running' | 'paused' | 'completed';

  // Variantes
  variants: ExperimentVariant[];
  control: string;                // ID da variante controle

  // Targeting
  traffic: number;                 // 0-100%
  audience?: AudienceRule[];

  // Métricas
  primaryMetric: string;
  secondaryMetrics?: string[];

  // Resultados
  results?: ExperimentResults;
}

interface ExperimentVariant {
  id: string;
  name: string;
  weight: number;                  // Peso na distribuição
  changes: VariantChange[];
}

interface VariantChange {
  blockId: string;
  property: string;
  value: any;
}

interface ExperimentResults {
  winner?: string;                 // ID da variante vencedora
  confidence: number;              // 0-100%

  // Métricas por variante
  variantMetrics: Array<{
    variantId: string;
    views: number;
    conversions: number;
    conversionRate: number;
    averageValue?: number;
  }>;
}
```

---

## Tipos Auxiliares

### Common Types

Tipos comuns usados em múltiplos schemas.

```typescript
// Media Assets
interface MediaAsset {
  url: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
  mimeType?: string;
  size?: number;                  // Bytes

  // Responsivo
  sources?: Array<{
    url: string;
    media: string;                // Media query
  }>;

  // Thumbnails
  thumbnails?: Array<{
    url: string;
    width: number;
    height: number;
  }>;
}

// Color System - Suporta temas claro/escuro
interface ColorProperty {
  type: 'theme' | 'adaptive' | 'custom';

  // Quando type === 'theme' (usa cores semânticas do tema)
  semantic?: 'primary' | 'secondary' | 'accent' | 'muted' |
             'background' | 'foreground' | 'border' |
             'success' | 'warning' | 'error' | 'info';

  // Quando type === 'adaptive' (uma cor que se adapta ao tema)
  base?: string;                  // Cor base (ex: #3B82F6)

  // Quando type === 'custom' (cores específicas por tema)
  light?: string;                 // Cor para tema claro
  dark?: string;                  // Cor para tema escuro

  // Contraste e acessibilidade
  contrast?: 'auto' | 'light' | 'dark';  // Força cor de contraste
}

// Links
interface LinkConfig {
  href: string;
  target?: '_self' | '_blank' | '_parent' | '_top';
  rel?: string;
  title?: string;

  // Tracking
  trackingId?: string;
  trackingCategory?: string;

  // Behavior
  smooth?: boolean;               // Smooth scroll para anchors
  prefetch?: boolean;             // Prefetch da página
}

// Buttons
interface ButtonConfig {
  text: string;
  link?: LinkConfig;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;                  // Lucide icon name
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;

  // Tracking
  trackingId?: string;
  trackingLabel?: string;
}

type ButtonVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'link'
  | 'destructive';

type ButtonSize =
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl';

// SEO
interface SEOSettings {
  title?: string;
  description?: string;
  keywords?: string[];

  // URLs
  canonical?: string;
  alternates?: Array<{
    hreflang: string;
    href: string;
  }>;

  // Robots
  robots?: {
    index?: boolean;
    follow?: boolean;
    noarchive?: boolean;
    noimageindex?: boolean;
    maxSnippet?: number;
    maxImagePreview?: 'none' | 'standard' | 'large';
  };

  // Schema.org
  schema?: any;                   // JSON-LD schema
}

// Social Meta Tags
interface SocialMetaTags {
  // Open Graph
  og?: {
    title?: string;
    description?: string;
    image?: string;
    type?: string;
    url?: string;
    siteName?: string;
    locale?: string;
  };

  // Twitter
  twitter?: {
    card?: 'summary' | 'summary_large_image' | 'app' | 'player';
    site?: string;
    creator?: string;
    title?: string;
    description?: string;
    image?: string;
  };

  // Facebook
  fb?: {
    appId?: string;
    admins?: string[];
  };
}

// Variant Settings (A/B Testing)
interface VariantSettings {
  name: string;
  traffic: number;                 // 0-100%

  // Targeting
  audience?: AudienceRule[];

  // Mudanças
  changes: Array<{
    blockId: string;
    props: Partial<BlockProps>;
  }>;

  // Goals
  goals: string[];                // IDs dos conversion goals
}

// Audience Rules
interface AudienceRule {
  type: 'device' | 'location' | 'referrer' | 'cookie' | 'custom';
  operator: 'is' | 'isNot' | 'contains' | 'startsWith' | 'endsWith';
  value: any;

  // Combinação
  and?: AudienceRule[];
  or?: AudienceRule[];
}

// Error Types
interface ValidationError {
  field: string;
  message: string;
  code?: string;
  severity?: 'error' | 'warning' | 'info';
}

interface APIError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  path?: string;
}

// Response Types
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: APIError;
  metadata?: ResponseMetadata;
}

interface ResponseMetadata {
  page?: number;
  pageSize?: number;
  total?: number;
  hasMore?: boolean;
  timestamp?: Date;
}
```

---

## Notas de Implementação

### Type Guards

```typescript
// Type guards úteis
function isPage(obj: any): obj is Page {
  return obj && typeof obj.id === 'string' && Array.isArray(obj.blocks);
}

function isBlock(obj: any): obj is Block {
  return obj && typeof obj.id === 'string' && typeof obj.type === 'string';
}

function isTemplate(obj: any): obj is Template {
  return obj && typeof obj.id === 'string' && typeof obj.category === 'string';
}
```

### Validação

```typescript
// Schemas de validação com Zod
import { z } from 'zod';

const PageSchema = z.object({
  id: z.string().uuid(),
  instanceId: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  status: z.enum(['draft', 'review', 'scheduled', 'published', 'archived']),
  blocks: z.array(BlockSchema),
  // ... resto das propriedades
});

// Validação
function validatePage(data: unknown): Page {
  return PageSchema.parse(data);
}
```

### Factories

```typescript
// Factories para criar objetos
function createPage(partial: Partial<Page>): Page {
  return {
    id: generateId(),
    instanceId: '',
    slug: '',
    title: 'Untitled Page',
    status: 'draft',
    version: 1,
    blocks: [],
    settings: createDefaultPageSettings(),
    seo: createDefaultSEOSettings(),
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: '',
    lastEditedBy: '',
    ...partial
  };
}

function createBlock(type: string, props: BlockProps = {}): Block {
  const definition = getBlockDefinition(type);
  return {
    id: generateId(),
    type,
    order: 0,
    props: { ...definition.defaultProps, ...props },
    visible: true,
    animation: undefined,
    responsive: undefined
  };
}
```

### Utilities

```typescript
// Utilidades para trabalhar com os dados
function findBlockById(page: Page, blockId: string): Block | undefined {
  function search(blocks: Block[]): Block | undefined {
    for (const block of blocks) {
      if (block.id === blockId) return block;
      if (block.children) {
        const found = search(block.children);
        if (found) return found;
      }
    }
    return undefined;
  }
  return search(page.blocks);
}

function updateBlock(page: Page, blockId: string, update: Partial<Block>): Page {
  // Deep clone e update
  const newPage = deepClone(page);
  const block = findBlockById(newPage, blockId);
  if (block) {
    Object.assign(block, update);
  }
  return newPage;
}

function reorderBlocks(blocks: Block[], fromIndex: number, toIndex: number): Block[] {
  const result = [...blocks];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result.map((block, index) => ({ ...block, order: index }));
}
```