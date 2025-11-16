# Editor Interface - Módulo Webpage

Este documento especifica a interface completa do editor visual de páginas, incluindo layout, interações, controles e experiência do usuário.

## Índice

1. [Layout Principal](#layout-principal)
2. [Área de Preview](#área-de-preview)
3. [Painel de Propriedades](#painel-de-propriedades)
4. [Sistema de Drag & Drop](#sistema-de-drag--drop)
5. [Edição Inline](#edição-inline)
6. [Toolbar e Controles](#toolbar-e-controles)
7. [Atalhos de Teclado](#atalhos-de-teclado)
8. [Sistema de Responsividade](#sistema-de-responsividade)
9. [Undo/Redo e Histórico](#undoredo-e-histórico)
10. [Colaboração em Tempo Real](#colaboração-em-tempo-real)

---

## Layout Principal

### Estrutura Split-Screen

```
┌─────────────────────────────────────────────────────────────────────┐
│  Header Toolbar (60px)                                             │
│  ┌─────────┬──────────────────────────────────┬────────────────┐  │
│  │  Logo   │  Page Title | Status | Viewport  │  Save | Publish │  │
│  └─────────┴──────────────────────────────────┴────────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────┬────────────────────────────────┐ │
│  │                              │                                │ │
│  │   Preview Area               │   Properties Panel             │ │
│  │   (60% - Resizable)          │   (40% - Resizable)            │ │
│  │                              │                                │ │
│  │   ┌──────────────────────┐   │  ┌──────────────────────────┐ │ │
│  │   │                      │   │  │ Block Properties         │ │ │
│  │   │                      │   │  ├──────────────────────────┤ │ │
│  │   │   Live Page Preview  │   │  │ • Content                │ │ │
│  │   │                      │   │  │ • Style                  │ │ │
│  │   │   Interactive        │   │  │ • Layout                 │ │ │
│  │   │   Drag & Drop        │   │  │ • Responsive             │ │ │
│  │   │                      │   │  │ • Animation              │ │ │
│  │   │                      │   │  │ • Advanced               │ │ │
│  │   │                      │   │  └──────────────────────────┘ │ │
│  │   └──────────────────────┘   │                                │ │
│  │                              │   [+ Add Block]                │ │
│  │  ┌──────────────────────┐   │                                │ │
│  │  │ Device: Desktop ▼    │   │                                │ │
│  │  └──────────────────────┘   │                                │ │
│  └──────────────────────────────┴────────────────────────────────┘ │
│                                                                     │
│  Status Bar (30px)                                                 │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ 👥 3 editing | 💾 Auto-saved | ⚡ Performance: Good         │  │
│  └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Componentes do Layout

#### Header Toolbar

**Seções da esquerda para direita:**

1. **Logo/Menu**
   - Logo clicável → Dashboard
   - Menu hambúrguer → Navegação

2. **Page Info**
   ```
   [📄 Landing Page] [Draft ▼] [Desktop 💻]
   ```
   - Nome da página (editável inline)
   - Status dropdown (Draft/Published/Scheduled)
   - Viewport selector

3. **Actions**
   ```
   [↶ Undo] [↷ Redo] [👁 Preview] [💾 Save] [🚀 Publish]
   ```
   - Undo/Redo com histórico
   - Preview em nova aba
   - Save manual
   - Publish com opções

#### Status Bar

Informações em tempo real:
```
👥 3 editing | 💾 Auto-saved 2 min ago | ⚡ Performance: Good | 📊 1.2MB
```

---

## Área de Preview

### Canvas Principal

#### Estados Visuais dos Blocos

**Normal:**
```
┌─────────────────────┐
│                     │
│    Block Content    │
│                     │
└─────────────────────┘
```

**Hover:**
```
┌─────────────────────┐ ← Outline sutil (border: 1px dashed #cbd5e1)
│                     │
│    Block Content    │ ← Cursor: move
│                     │
└─────────────────────┘
```

**Selecionado:**
```
╔═════════════════════╗ ← Outline forte (border: 2px solid #3b82f6)
║  [↑][↓][⋮][🗑]     ║ ← Toolbar flutuante
║                     ║
║    Block Content    ║
║                     ║
╚═════════════════════╝
```

**Arrastando:**
```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐ ← Ghost (opacity: 0.5)
│                     │
│    Block Content    │ ← Cursor: grabbing
│                     │
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘

════════════════════════ ← Drop indicator (height: 3px, background: #3b82f6)
```

### Indicadores Visuais

#### Grid e Guides

```
Preview com Grid (8px):
├─┼─┼─┼─┼─┼─┼─┼─┼─┤
│ │ │ │ │ │ │ │ │ │
├─┼─┼─┼─┼─┼─┼─┼─┼─┤
│ │ │ │ │ │ │ │ │ │
├─┼─┼─┼─┼─┼─┼─┼─┼─┤

Smart Guides ao arrastar:
│
│  ┌─────────┐
│  │ Block 1 │ ← ─ ─ ─ Alinhamento horizontal
│  └─────────┘
│       |
│       |  ← ─ ─ ─ ─ ─ Alinhamento central
│       |
│  ┌─────────┐
│  │ Block 2 │
│  └─────────┘
│
```

#### Distance Badges

Ao mover/redimensionar blocos:
```
┌─────────┐
│ Block 1 │
└─────────┘
    ↕ 24px    ← Badge de distância
┌─────────┐
│ Block 2 │
└─────────┘
```

### Botão de Adicionar Bloco

Entre blocos aparece ao hover:
```
─────────────────────

    [ + Add Block ]   ← Aparece ao hover entre blocos

─────────────────────
```

---

## Painel de Propriedades

### Estrutura de Tabs

```
┌─────────────────────────────────┐
│ Block: Hero Minimal             │
├─────────────────────────────────┤
│ Content | Style | Layout | ...  │ ← Tabs
├─────────────────────────────────┤
│                                 │
│ ┌─ Content Tab ───────────────┐ │
│ │                              │ │
│ │ Title                        │ │
│ │ [Welcome to our site____]    │ │
│ │                              │ │
│ │ Subtitle                     │ │
│ │ [Your success starts___]     │ │
│ │ [here__________________]     │ │
│ │                              │ │
│ │ Primary Button               │ │
│ │ Text: [Get Started_____]     │ │
│ │ Link: [/signup_________]     │ │
│ │ Icon: [→] Choose Icon        │ │
│ │                              │ │
│ └──────────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

### Tipos de Controles

#### Text Input
```
Label
┌────────────────────┐
│ Value              │
└────────────────────┘
Helper text
```

#### Textarea
```
Description
┌────────────────────┐
│ Multiple lines     │
│ of text here...    │
└────────────────────┘
0/500 characters
```

#### Select Dropdown
```
Alignment
┌────────────────────┐
│ Center          ▼  │
├────────────────────┤
│ • Left             │
│ • Center ✓         │
│ • Right            │
└────────────────────┘
```

#### Color Picker
```
Brand Color
┌──┬─────────────────┐
│🎨│ #3B82F6         │
└──┴─────────────────┘
    ↓ Click opens
┌────────────────────┐
│ ┌──────────────┐   │
│ │              │   │ ← Color space
│ │      •       │   │
│ └──────────────┘   │
│ Hue: ████████████  │
│                    │
│ Recent: ● ● ● ● ●  │
│ Theme:  ● ● ● ● ●  │
└────────────────────┘
```

#### Slider
```
Opacity: 75%
┌────────────────────┐
│ ──────────●──────  │
└────────────────────┘
0%                100%
```

#### Toggle Switch
```
Show Title  [●━━] On
            [━━○] Off
```

#### Icon Picker
```
Icon
┌────────────────────┐
│ 🔍 Search icons... │
├────────────────────┤
│ 🏠 📱 💡 ⚙️ 📊    │
│ 👤 📧 🔔 💬 🎯    │
│ ✨ 🚀 💎 🔥 ⭐    │
└────────────────────┘
```

#### Media Picker
```
Hero Image
┌────────────────────┐
│  ┌──────────────┐  │
│  │              │  │
│  │   [Upload]   │  │ ← Drop zone
│  │   or browse  │  │
│  └──────────────┘  │
│                    │
│ Or enter URL:      │
│ [____________]     │
│                    │
│ Library:           │
│ [img] [img] [img]  │ ← Recent uploads
└────────────────────┘
```

#### Spacing Control
```
Padding
┌────────────────────┐
│    ┌─24─┐          │
│ 16 │    │ 16       │ ← Visual padding editor
│    └─24─┘          │
│                    │
│ T:[24] R:[16]      │ ← Input fields
│ B:[24] L:[16]      │
└────────────────────┘
```

### Grupos Colapsáveis

```
▼ Typography Settings      ← Expandido
  Font Family: [Inter ▼]
  Font Size: [16px ▼]
  Font Weight: [400 ▼]
  Line Height: [1.5]

▶ Advanced Settings        ← Colapsado
```

---

## Sistema de Drag & Drop

### Fluxo de Interação

#### 1. Início do Drag
```
Mouse down → Delay 150ms ou Move 5px
                ↓
┌─────────────────────┐
│ Block (scale: 1.02) │ ← Elevação visual
│ shadow: elevated    │
└─────────────────────┘
```

#### 2. Durante o Drag
```
Cursor Position
       ↓
┌ ─ ─ ─ ─ ─ ┐ ← Ghost element (opacity: 0.5)
│   Block    │   follows cursor
└ ─ ─ ─ ─ ─ ┘

Original Position:
┌─────────────┐
│ [Empty]     │ ← Placeholder mantido
└─────────────┘

Drop Zones:
════════════════ ← Indicadores azuis pulsantes
                    onde pode ser dropado
```

#### 3. Hover sobre Drop Zone
```
════════════════ ← Aumenta para 4px
   ↓ ↑ ↓ ↑      ← Animação pulse
Background: rgba(59, 130, 246, 0.1)
```

#### 4. Drop Válido
```
Spring animation (300ms):
Position inicial → Position final
Scale: 0.95 → 1.0 → 1.02 → 1.0
```

#### 5. Drop Inválido
```
┌─────────────┐
│   Block     │ ← Shake animation
└─────────────┘   + red border flash
    ↓
Retorna à posição original
```

### Auto-Scroll

Quando arrastar próximo às bordas:
```
┌─────────────────────┐
│ ↑ Scroll zone (20px)│ ← Auto-scroll up
├─────────────────────┤
│                     │
│   Drag area         │
│                     │
├─────────────────────┤
│ ↓ Scroll zone (20px)│ ← Auto-scroll down
└─────────────────────┘
```

---

## Edição Inline

### Edição de Texto

**Estado normal:**
```
┌─────────────────────┐
│ Welcome to our site │ ← Cursor: default
└─────────────────────┘
```

**Hover (editável):**
```
┌─────────────────────┐
│ Welcome to our site │ ← Cursor: text
└─────────────────────┘   Dashed underline
```

**Editando (após duplo-clique):**
```
┌─────────────────────┐
│ Welcome to our site│ │ ← Cursor piscando
└─────────────────────┘   Border: 2px solid blue
```

### Edição de Imagem

**Hover sobre imagem:**
```
┌─────────────────────┐
│                     │
│    [📷 Change]      │ ← Overlay com botão
│                     │
└─────────────────────┘
```

**Ao clicar:**
```
┌─────────────────────────┐
│  Upload | URL | Library │ ← Modal de seleção
├─────────────────────────┤
│                         │
│  Drop image here        │
│  or click to browse     │
│                         │
└─────────────────────────┘
```

### Toolbar Flutuante

Aparece acima do bloco selecionado:
```
  ┌──────────────────────────────┐
  │ B I U | 🔗 | Left Center Right│ ← Formatting toolbar
  └────────────┬─────────────────┘
               ↓
         Selected Text
```

---

## Toolbar e Controles

### Toolbar Principal (Header)

```
┌───────────────────────────────────────────────────────────────┐
│ 📄 Page ▼ | ↶ ↷ | 💻 Desktop ▼ | 👁 | Grid | Guides | 💾 | 🚀 │
└───────────────────────────────────────────────────────────────┘

Componentes:
📄 Page ▼      → Page selector/switcher
↶ ↷           → Undo/Redo
💻 Desktop ▼   → Viewport selector
👁            → Preview mode toggle
Grid          → Toggle grid overlay
Guides        → Toggle smart guides
💾            → Save (com indicador de status)
🚀            → Publish dropdown
```

### Context Toolbar (Bloco)

```
┌─────────────────────────────┐
│ ⋮ | ↑ | ↓ | 📋 | 🗑 | ⚙️   │
└─────────────────────────────┘

⋮  → Drag handle
↑  → Move up
↓  → Move down
📋 → Duplicate
🗑 → Delete
⚙️ → Advanced settings
```

### Quick Actions Bar

Flutua no canto inferior direito:
```
┌───┐
│ + │ → Add block (abre radial menu)
├───┤
│ ? │ → Help/Tour
├───┤
│ ⌨ │ → Keyboard shortcuts
└───┘
```

---

## Atalhos de Teclado

### Navegação

| Atalho | Ação |
|--------|------|
| `↑` `↓` | Navegar entre blocos |
| `Tab` | Próximo campo editável |
| `Shift+Tab` | Campo anterior |
| `Esc` | Deselecionar/Sair do modo edição |
| `Space` | Scroll down (quando não editando) |

### Edição

| Atalho | Ação |
|--------|------|
| `Cmd/Ctrl+D` | Duplicar bloco selecionado |
| `Delete` | Deletar bloco selecionado |
| `Cmd/Ctrl+Z` | Undo |
| `Cmd/Ctrl+Y` | Redo |
| `Cmd/Ctrl+C` | Copiar bloco |
| `Cmd/Ctrl+V` | Colar bloco |
| `Cmd/Ctrl+X` | Cortar bloco |
| `Cmd/Ctrl+Shift+V` | Colar sem formatação |

### Formatação de Texto

| Atalho | Ação |
|--------|------|
| `Cmd/Ctrl+B` | Bold |
| `Cmd/Ctrl+I` | Italic |
| `Cmd/Ctrl+U` | Underline |
| `Cmd/Ctrl+K` | Insert/Edit link |
| `Cmd/Ctrl+Shift+K` | Remove link |

### Visualização

| Atalho | Ação |
|--------|------|
| `Cmd/Ctrl+P` | Toggle preview mode |
| `Cmd/Ctrl+Shift+M` | Toggle mobile view |
| `Cmd/Ctrl+G` | Toggle grid |
| `Cmd/Ctrl+;` | Toggle guides |
| `Cmd/Ctrl+0` | Reset zoom |
| `Cmd/Ctrl++` | Zoom in |
| `Cmd/Ctrl+-` | Zoom out |

### Blocos

| Atalho | Ação |
|--------|------|
| `Cmd/Ctrl+/` | Command palette (inserir bloco) |
| `Cmd/Ctrl+Enter` | Adicionar bloco abaixo |
| `Cmd/Ctrl+Shift+Enter` | Adicionar bloco acima |
| `Alt+↑` | Mover bloco para cima |
| `Alt+↓` | Mover bloco para baixo |

### Arquivo

| Atalho | Ação |
|--------|------|
| `Cmd/Ctrl+S` | Salvar |
| `Cmd/Ctrl+Shift+S` | Salvar e publicar |
| `Cmd/Ctrl+O` | Abrir página |
| `Cmd/Ctrl+N` | Nova página |

---

## Sistema de Responsividade

### Device Selector

```
┌──────────────────────────────────────┐
│ Device: [💻 Desktop (1440px) ▼]     │
├──────────────────────────────────────┤
│ 💻 Desktop      1440px              │
│ 💻 Laptop       1024px              │
│ 📱 Tablet       768px               │
│ 📱 Mobile       375px               │
│ ⚙️ Custom...    [____]px           │
└──────────────────────────────────────┘
```

### Preview Responsivo

```
Desktop View:
┌──────────────────────────────┐
│                              │
│     Full width preview       │
│                              │
└──────────────────────────────┘

Tablet View:
┌───────────────────┐
│                   │
│   Tablet preview  │ ← Centered com background
│                   │
└───────────────────┘

Mobile View:
┌──────────┐
│          │
│  Mobile  │ ← Com device frame opcional
│ preview  │
│          │
└──────────┘
```

### Propriedades Responsivas

No painel de propriedades:
```
Font Size
┌────────────────────────────────┐
│ 💻 Desktop: [24px ▼]           │
│ 📱 Tablet:  [20px ▼] inherited │
│ 📱 Mobile:  [16px ▼]           │
│                                │
│ [✓] Sync all devices          │
└────────────────────────────────┘
```

Indicador de override:
```
[20px ▼] ● ← Ponto azul = valor customizado
[inherit] ○ ← Ponto cinza = herdado
```

---

## Undo/Redo e Histórico

### Timeline Visual

```
┌─────────────────────────────────┐
│ History                     [-] │
├─────────────────────────────────┤
│ ┌───────────────────────────┐   │
│ │ Now                       │   │
│ └───────────────────────────┘   │
│                                 │
│ 2:45 PM - Added Hero Block     │
│ 2:44 PM - Changed text         │
│ 2:43 PM - Moved block up       │
│ 2:42 PM - Deleted paragraph    │
│ 2:40 PM - Save point ⭐        │
│ 2:38 PM - Added feature grid   │
│                                 │
│ [Load more...]                  │
└─────────────────────────────────┘
```

### Comparação de Versões

```
┌──────────────────┬──────────────────┐
│ Version 12       │ Version 13       │
│ 2:40 PM          │ Current          │
├──────────────────┼──────────────────┤
│                  │                  │
│ - Old content    │ + New content    │ ← Diff highlighting
│                  │                  │
└──────────────────┴──────────────────┘
        [← Use This] [Use This →]
```

### Save Points

```
Create Save Point:
┌──────────────────────┐
│ Name this version:   │
│ [Landing v2_____]    │
│                      │
│ [💾 Create]          │
└──────────────────────┘
```

---

## Colaboração em Tempo Real

### Cursores Múltiplos

```
┌─────────────────────────┐
│                         │
│  Jane ●                 │ ← Cursor colorido com nome
│      ↓                  │
│  [Editing...]           │
│                         │
│         John ●          │ ← Outro colaborador
│              ↓          │
│         [Selecting...]  │
│                         │
└─────────────────────────┘
```

### Indicadores de Presença

```
Currently editing:
┌─────────────────────────┐
│ 👤 You                  │
│ 👤 Jane (editing hero)  │
│ 👤 John (footer)        │
│ 👤 Sarah (idle 5m)      │
└─────────────────────────┘
```

### Comentários em Blocos

```
┌─────────────────────┐
│ Block Content    💬3│ ← Badge de comentários
└─────────────────────┘
        ↓ Click
┌──────────────────────────┐
│ Comments                 │
├──────────────────────────┤
│ Jane: "Can we make this │
│ text larger?"            │
│ 2 min ago · Reply        │
│                          │
│ You: "Sure! Updating..." │
│ Just now                 │
│                          │
│ [Add comment...]         │
└──────────────────────────┘
```

### Conflitos de Edição

```
⚠️ Conflict Detected
┌──────────────────────────────┐
│ Jane is editing this block  │
│                              │
│ [Wait] [Take Control] [Merge]│
└──────────────────────────────┘
```

---

## Estados e Feedback

### Loading States

```
Carregando bloco:
┌─────────────────────┐
│ ░░░░░░░░░░░░░░░░░░ │ ← Skeleton loader
│ ░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░ │
└─────────────────────┘

Salvando:
[💾 Saving...] → [✓ Saved]

Publicando:
[🚀 Publishing...] → [✓ Published]
```

### Mensagens de Feedback

```
Toast notifications (canto superior direito):
┌──────────────────────┐
│ ✓ Block added        │
└──────────────────────┘

┌──────────────────────┐
│ ⚠️ Connection lost   │
│ Retrying...          │
└──────────────────────┘

┌──────────────────────┐
│ ❌ Error saving      │
│ [Retry] [Dismiss]    │
└──────────────────────┘
```

### Empty States

```
Página vazia:
┌─────────────────────────────┐
│                             │
│      Start building         │
│    your page with our       │
│     amazing blocks          │
│                             │
│   [+ Add First Block]       │
│                             │
│   Or choose a template:     │
│  [T1] [T2] [T3] [More...]   │
│                             │
└─────────────────────────────┘
```

---

## Performance Indicators

### Real-time Metrics

```
Status bar:
├─ Page size: 1.2MB
├─ Load time: 1.8s
├─ Performance score: 92/100
└─ SEO score: 88/100
```

### Optimization Suggestions

```
⚡ Performance Tips
┌──────────────────────────────┐
│ • Compress images (save 400KB)│
│ • Enable lazy loading         │
│ • Minimize custom CSS         │
│                              │
│ [Optimize Now] [Learn More]  │
└──────────────────────────────┘
```

---

## Accessibility Features

### Keyboard Navigation

- Todos os elementos interativos acessíveis via Tab
- Skip links para navegação rápida
- Focus visible em todos elementos

### Screen Reader Support

```html
<div role="application" aria-label="Page editor">
  <div role="region" aria-label="Preview area">
    <div role="article" aria-label="Hero block">
      <!-- Block content -->
    </div>
  </div>
</div>
```

### High Contrast Mode

```
Normal:
┌─────────────┐
│ Light gray  │
└─────────────┘

High Contrast:
╔═════════════╗
║ Strong black║
╚═════════════╝
```

---

## Mobile/Touch Support

### Touch Gestures

- **Tap**: Selecionar bloco
- **Double tap**: Editar inline
- **Long press**: Context menu
- **Drag**: Mover bloco
- **Pinch**: Zoom in/out
- **Two-finger scroll**: Pan

### Touch-Optimized Controls

```
Botões maiores (min 44x44px):
┌──────────┐
│          │
│    Tap   │ ← Touch target
│          │
└──────────┘

Espaçamento aumentado:
[Button 1]   [Button 2]
    ↑            ↑
  8px gap for fingers
```

---

## Command Palette

Ativado com `Cmd/Ctrl+/`:

```
┌─────────────────────────────────┐
│ 🔍 Type a command...            │
├─────────────────────────────────┤
│ Blocks                          │
│ > Add Hero Block                │
│ > Add Feature Grid              │
│ > Add Testimonial               │
│                                 │
│ Actions                         │
│ > Save Page                     │
│ > Publish                       │
│ > Preview                       │
│                                 │
│ Navigation                      │
│ > Go to Dashboard               │
│ > Page Settings                 │
└─────────────────────────────────┘
```

---

## Notas de Implementação

### Prioridades de UX

1. **Resposta Imediata**: Toda ação deve ter feedback visual instantâneo
2. **Prevenção de Erros**: Confirmações para ações destrutivas
3. **Recovery**: Undo ilimitado durante a sessão
4. **Descoberta**: Tooltips e hints para features avançadas
5. **Performance**: Lazy loading e otimizações para fluidez

### Animações e Transições

```css
/* Padrões de animação */
.transition-fast { transition: all 150ms ease; }
.transition-normal { transition: all 300ms ease; }
.transition-slow { transition: all 500ms ease; }

/* Spring animation para drops */
@keyframes spring-drop {
  0% { transform: scale(0.95); }
  40% { transform: scale(1.02); }
  80% { transform: scale(0.98); }
  100% { transform: scale(1); }
}
```

### Breakpoints Responsivos

```typescript
const breakpoints = {
  mobile: 375,
  tablet: 768,
  laptop: 1024,
  desktop: 1440,
  wide: 1920
};
```

### Z-Index Stack

```css
.drag-ghost { z-index: 1000; }
.dropdown { z-index: 900; }
.modal { z-index: 800; }
.toolbar { z-index: 700; }
.overlay { z-index: 600; }
.sticky-header { z-index: 500; }
```