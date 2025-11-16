# Catálogo de Blocos - Módulo Webpage

Este documento especifica todos os blocos disponíveis no editor visual de páginas, organizados por categoria.

## Índice de Categorias

1. [Hero & Headers](#1-hero--headers) - 6 blocos
2. [Conteúdo & Texto](#2-conteúdo--texto) - 5 blocos
3. [Mídia & Visual](#3-mídia--visual) - 6 blocos
4. [Listas & Dados](#4-listas--dados) - 4 blocos
5. [Interação & Formulários](#5-interação--formulários) - 4 blocos
6. [Navegação](#6-navegação) - 3 blocos
7. [Social & Prova Social](#7-social--prova-social) - 4 blocos
8. [Call-to-Action](#8-call-to-action) - 3 blocos
9. [Conteúdo Dinâmico](#9-conteúdo-dinâmico) - 3 blocos
10. [E-commerce](#10-e-commerce) - 2 blocos
11. [Blocos Especiais](#11-blocos-especiais) - 4 blocos
12. [Estrutural](#12-estrutural) - 2 blocos

**Total**: 46 blocos

---

## 1. Hero & Headers

### 1.1 Hero Minimal

**ID**: `hero-minimal`

**Descrição**: Hero limpo e minimalista com foco no conteúdo textual e CTAs.

**Componentes Base**:
- Typography (shadcn/ui)
- Button (shadcn/ui)
- Badge (shadcn/ui)
- Container

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| title | text (max 120) | "Welcome" | Título principal |
| subtitle | text (max 250) | "" | Subtítulo descritivo |
| badge | text (max 30) | "" | Badge opcional acima do título |
| badgeVariant | enum | "default" | default, secondary, destructive, outline |
| primaryButton | object | null | {text, href, variant, icon} |
| secondaryButton | object | null | {text, href, variant, icon} |
| alignment | enum | "center" | left, center, right |
| spacing | enum | "default" | compact, default, spacious |
| animationPreset | enum | "fade" | fade, slideUp, blurIn, letterPull |
| backgroundColor | ColorProperty | {type: 'theme', semantic: 'background'} | Cor de fundo adaptativa |
| textColor | ColorProperty | {type: 'theme', semantic: 'foreground'} | Cor do texto adaptativa |
| accentColor | ColorProperty | {type: 'theme', semantic: 'primary'} | Cor de destaque (badge, botões) |

**Variantes**:
- Minimal (apenas texto)
- Centered (centralizado)
- Side-by-side (botões lado a lado)

**Casos de Uso**:
- Landing pages minimalistas
- Páginas de "coming soon"
- Seções de boas-vindas em apps

### 1.2 Hero with Background

**ID**: `hero-background`

**Descrição**: Hero dramático com imagem ou vídeo de fundo e overlay.

**Componentes Base**:
- Typography (shadcn/ui)
- Button (shadcn/ui)
- AspectRatio (shadcn/ui)
- Overlay customizado

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| ...todas de Hero Minimal | - | - | - |
| backgroundImage | url | "" | URL da imagem de fundo |
| backgroundVideo | url | "" | URL do vídeo de fundo (opcional) |
| overlayOpacity | number (0-100) | 40 | Opacidade do overlay |
| overlayColor | ColorProperty | {type: 'adaptive', base: '#000000'} | Cor do overlay adaptativa |
| parallaxEffect | boolean | false | Ativa efeito parallax no scroll |
| particleEffect | enum | "none" | none, stars, snow, bubbles |
| contentPosition | enum | "center" | center, left, right, bottom |
| minHeight | string | "80vh" | Altura mínima da seção |

**Casos de Uso**:
- Home pages impactantes
- Campanhas de marketing
- Páginas de eventos

### 1.3 Hero with Device Mockup

**ID**: `hero-device`

**Descrição**: Hero com mockup de dispositivo mostrando preview do produto.

**Componentes Base**:
- Typography (shadcn/ui)
- Button (shadcn/ui)
- MacBook/iPhone/iPad (Eldora UI)
- AnimatedBadge (Eldora UI)

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| ...todas de Hero Minimal | - | - | - |
| deviceType | enum | "macbook" | macbook, iphone, ipad, browser |
| mockupContent | url/html | "" | Conteúdo do mockup |
| mockupAnimation | enum | "float" | float, rotate3d, bounce, none |
| mockupPosition | enum | "right" | right, left, bottom |
| mockupSize | enum | "medium" | small, medium, large |
| showReflection | boolean | true | Reflexo no dispositivo |

**Casos de Uso**:
- Apps SaaS
- Demonstrações de produto
- Portfolios de desenvolvimento

### 1.4 Hero Split

**ID**: `hero-split`

**Descrição**: Hero dividido em duas colunas com conteúdo e imagem.

**Componentes Base**:
- Typography (shadcn/ui)
- Button (shadcn/ui)
- AspectRatio (shadcn/ui)
- Grid layout

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| ...conteúdo textual | - | - | - |
| imageUrl | url | "" | Imagem lateral |
| imagePosition | enum | "right" | left, right |
| imageFit | enum | "cover" | cover, contain, fill |
| splitRatio | enum | "50-50" | 50-50, 60-40, 40-60 |
| verticalAlign | enum | "center" | top, center, bottom |
| reverseOnMobile | boolean | true | Inverte ordem no mobile |

**Casos de Uso**:
- Páginas de produto
- About sections
- Feature highlights

### 1.5 Hero Gradient

**ID**: `hero-gradient`

**Descrição**: Hero com gradiente animado de fundo.

**Componentes Base**:
- Typography (shadcn/ui)
- Button (shadcn/ui)
- Gradient animation (custom)

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| ...todas de Hero Minimal | - | - | - |
| gradientColors | array | ["#667eea", "#764ba2"] | Cores do gradiente |
| gradientDirection | enum | "diagonal" | horizontal, vertical, diagonal, radial |
| animateGradient | boolean | true | Anima o gradiente |
| animationSpeed | number | 15 | Velocidade em segundos |
| meshGradient | boolean | false | Usa mesh gradient (mais complexo) |

**Casos de Uso**:
- Landing pages modernas
- Páginas criativas
- Portfolios

### 1.6 Hero Animated

**ID**: `hero-animated`

**Descrição**: Hero com animações avançadas de texto e elementos.

**Componentes Base**:
- GradualSpacingText (Eldora UI)
- BlurInText (Eldora UI)
- AnimatedShinyButton (Eldora UI)
- OrbitRotation (Eldora UI)

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| title | text | "" | Título com animação |
| titleAnimation | enum | "gradualSpacing" | gradualSpacing, blurIn, letterPull, wordPull |
| subtitle | text | "" | Subtítulo |
| subtitleDelay | number | 500 | Delay da animação em ms |
| orbitingElements | array | [] | Elementos em órbita [{icon, radius, duration}] |
| backgroundPattern | enum | "none" | none, dots, grid, waves |

**Casos de Uso**:
- Sites de tecnologia
- Portfolios criativos
- Páginas experimentais

---

## 2. Conteúdo & Texto

### 2.1 Rich Text Block

**ID**: `text-rich`

**Descrição**: Bloco de texto rico com formatação completa.

**Componentes Base**:
- Editor (PlateJS)
- Typography (shadcn/ui)

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| content | rich-text | "" | Conteúdo formatado |
| columns | number (1-3) | 1 | Número de colunas |
| dropcap | boolean | false | Primeira letra grande |
| textSize | enum | "default" | small, default, large, extra-large |
| lineHeight | enum | "normal" | tight, normal, relaxed |
| maxWidth | enum | "prose" | prose, full, wide |
| enableHighlight | boolean | false | Permite destacar texto |
| enableAnnotations | boolean | false | Notas laterais |

**Casos de Uso**:
- Artigos e blogs
- Documentação
- Páginas de políticas

### 2.2 Quote Block

**ID**: `quote-block`

**Descrição**: Citação elegante com atribuição.

**Componentes Base**:
- Card (shadcn/ui)
- Typography (shadcn/ui)
- Avatar (shadcn/ui)
- Separator (shadcn/ui)

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| quote | text (max 500) | "" | Texto da citação |
| author | text | "" | Nome do autor |
| role | text | "" | Cargo/título |
| company | text | "" | Empresa |
| avatar | url | "" | Foto do autor |
| style | enum | "bordered" | minimal, bordered, highlighted, large |
| quoteIcon | boolean | true | Mostrar aspas decorativas |
| animation | enum | "none" | none, fadeIn, slideInLeft |

**Casos de Uso**:
- Depoimentos destacados
- Citações de autoridade
- Pullquotes em artigos

### 2.3 Two Column Text

**ID**: `text-columns`

**Descrição**: Texto organizado em duas colunas.

**Componentes Base**:
- Typography (shadcn/ui)
- Grid layout

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| leftContent | rich-text | "" | Conteúdo coluna esquerda |
| rightContent | rich-text | "" | Conteúdo coluna direita |
| gap | enum | "medium" | small, medium, large |
| verticalAlign | enum | "top" | top, middle, bottom |
| separator | boolean | false | Linha divisória |
| mobileStack | boolean | true | Empilha no mobile |

**Casos de Uso**:
- Comparações
- Listas paralelas
- Layouts de revista

### 2.4 Text with Image

**ID**: `text-image`

**Descrição**: Combinação de texto e imagem lado a lado.

**Componentes Base**:
- Typography (shadcn/ui)
- AspectRatio (shadcn/ui)
- Card (shadcn/ui)

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| title | text | "" | Título da seção |
| content | rich-text | "" | Conteúdo textual |
| imageUrl | url | "" | URL da imagem |
| imageAlt | text | "" | Texto alternativo |
| imagePosition | enum | "right" | left, right |
| imageSize | enum | "50%" | 30%, 40%, 50%, 60% |
| verticalAlign | enum | "center" | top, center, bottom |
| imageShape | enum | "rectangle" | rectangle, rounded, circle |
| reverseOnMobile | boolean | true | Inverte no mobile |

**Casos de Uso**:
- Sobre nós
- Features detalhadas
- Biografias

### 2.5 Expandable Text

**ID**: `text-expandable`

**Descrição**: Texto com "leia mais" expansível.

**Componentes Base**:
- Typography (shadcn/ui)
- Collapsible (shadcn/ui)
- Button (shadcn/ui)

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| content | rich-text | "" | Conteúdo completo |
| previewLines | number | 3 | Linhas visíveis inicialmente |
| showMoreText | text | "Leia mais" | Texto do botão expandir |
| showLessText | text | "Leia menos" | Texto do botão colapsar |
| animation | enum | "slide" | none, slide, fade |
| gradient | boolean | true | Gradiente no preview |

**Casos de Uso**:
- FAQs longas
- Descrições de produto
- Termos e condições

---

## 3. Mídia & Visual

### 3.1 Image Gallery

**ID**: `gallery-images`

**Descrição**: Galeria de imagens responsiva com múltiplos layouts.

**Componentes Base**:
- Carousel (shadcn/ui)
- AspectRatio (shadcn/ui)
- Dialog (shadcn/ui)
- Skeleton (shadcn/ui)

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| images | array | [] | [{url, alt, caption, link}] |
| layout | enum | "grid" | grid, masonry, carousel, collage |
| columns | number (2-6) | 3 | Colunas no grid |
| aspectRatio | enum | "16:9" | square, 16:9, 4:3, free |
| gap | enum | "medium" | none, small, medium, large |
| lightbox | boolean | true | Abrir em modal ao clicar |
| autoplay | boolean | false | Auto-play para carousel |
| autoplaySpeed | number | 5000 | Velocidade em ms |
| animationOnScroll | enum | "fadeIn" | none, fadeIn, zoomIn, slideUp |
| hoverEffect | enum | "zoom" | none, zoom, overlay, flip |

**Casos de Uso**:
- Portfólios
- Galerias de produtos
- Eventos e cobertura

### 3.2 Video Player

**ID**: `video-player`

**Descrição**: Player de vídeo customizado com controles.

**Componentes Base**:
- AspectRatio (shadcn/ui)
- Button (shadcn/ui)
- Progress (shadcn/ui)
- Custom video player

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| videoUrl | url | "" | URL do vídeo |
| videoType | enum | "hosted" | hosted, youtube, vimeo |
| poster | url | "" | Imagem de capa |
| autoplay | boolean | false | Iniciar automaticamente |
| muted | boolean | false | Iniciar mutado |
| loop | boolean | false | Loop infinito |
| controls | boolean | true | Mostrar controles |
| playbackSpeed | array | [1] | Opções de velocidade |
| captions | array | [] | [{lang, url}] legendas |
| aspectRatio | enum | "16:9" | 16:9, 4:3, 1:1, 9:16 |

**Casos de Uso**:
- Tutoriais
- Apresentações
- Trailers de produto

### 3.3 3D Globe Interactive

**ID**: `globe-3d`

**Descrição**: Globo 3D interativo com marcadores.

**Componentes Base**:
- Cobe Globe (Eldora UI)
- Card (shadcn/ui)
- Popover (shadcn/ui)

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| markers | array | [] | [{lat, lng, label, color, size}] |
| autoRotate | boolean | true | Rotação automática |
| rotationSpeed | number (0.1-2) | 0.5 | Velocidade de rotação |
| globeColor | color | "#1e40af" | Cor base do globo |
| markerColor | color | "#ef4444" | Cor dos marcadores |
| atmosphereColor | color | "#3b82f6" | Cor da atmosfera |
| showGraticules | boolean | false | Linhas de latitude/longitude |
| cameraDistance | number | 400 | Distância da câmera (200-500) |
| interactive | boolean | true | Permite interação do usuário |

**Casos de Uso**:
- Presença global
- Localizações de escritórios
- Mapas de cobertura

### 3.4 Before/After Slider

**ID**: `before-after`

**Descrição**: Slider comparativo de duas imagens.

**Componentes Base**:
- Slider (shadcn/ui)
- AspectRatio (shadcn/ui)
- Custom comparison logic

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| beforeImage | url | "" | Imagem "antes" |
| afterImage | url | "" | Imagem "depois" |
| startPosition | number (0-100) | 50 | Posição inicial do slider |
| orientation | enum | "horizontal" | horizontal, vertical |
| showLabels | boolean | true | Mostrar labels |
| beforeLabel | text | "Antes" | Label da imagem antes |
| afterLabel | text | "Depois" | Label da imagem depois |
| sliderColor | color | "#ffffff" | Cor do slider |
| sliderWidth | number | 3 | Largura do slider em px |

**Casos de Uso**:
- Comparações de resultado
- Transformações
- Edição de imagens

### 3.5 Audio Player

**ID**: `audio-player`

**Descrição**: Player de áudio/podcast completo.

**Componentes Base**:
- AudioPlayer (ElevenLabs)
- Progress (shadcn/ui)
- Button (shadcn/ui)

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| audioUrl | url | "" | URL do áudio |
| title | text | "" | Título do áudio |
| artist | text | "" | Artista/Autor |
| cover | url | "" | Imagem de capa |
| chapters | array | [] | [{time, title}] capítulos |
| transcript | text/url | "" | Transcrição |
| showWaveform | boolean | false | Visualização de onda |
| showTranscript | boolean | false | Mostrar transcrição |
| playbackSpeed | array | [1, 1.5, 2] | Velocidades disponíveis |
| theme | enum | "minimal" | minimal, detailed, spotify |

**Casos de Uso**:
- Podcasts
- Audiobooks
- Música

### 3.6 360° Product View

**ID**: `product-360`

**Descrição**: Visualização 360 graus de produto.

**Componentes Base**:
- OrbitRotation (Eldora UI)
- Container
- Preloader

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| images | array | [] | 36+ imagens para rotação |
| autoRotate | boolean | true | Rotação automática |
| rotationSpeed | number | 3 | Velocidade (1-10) |
| showControls | boolean | true | Controles de rotação |
| enableZoom | boolean | true | Permitir zoom |
| startFrame | number | 0 | Frame inicial |
| direction | enum | "horizontal" | horizontal, vertical, both |
| showHotspots | boolean | false | Pontos interativos |
| hotspots | array | [] | [{frame, x, y, label, description}] |

**Casos de Uso**:
- E-commerce
- Demonstrações de produto
- Showroom virtual

---

## 4. Listas & Dados

### 4.1 Feature Grid

**ID**: `feature-grid`

**Descrição**: Grid de features com ícones e descrições.

**Componentes Base**:
- Card (shadcn/ui)
- Grid (Eldora UI)
- Badge (shadcn/ui)
- Lucide Icons

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| features | array | [] | [{icon, title, description, link, badge}] |
| columns | enum | "3" | 2, 3, 4, 6 |
| iconStyle | enum | "outline" | outline, filled, duotone |
| iconSize | enum | "medium" | small, medium, large |
| iconColor | color | "primary" | Cor dos ícones |
| cardVariant | enum | "bordered" | bordered, ghost, elevated |
| showBadge | boolean | false | Mostrar badge NEW/BETA |
| animation | enum | "stagger" | none, stagger, fadeIn |
| hoverEffect | enum | "lift" | none, lift, glow, scale |
| alignment | enum | "left" | left, center |

**Casos de Uso**:
- Features de produto
- Serviços oferecidos
- Benefícios

### 4.2 Pricing Cards

**ID**: `pricing-cards`

**Descrição**: Cards de preços com comparação de planos.

**Componentes Base**:
- Card (shadcn/ui)
- Button (shadcn/ui)
- Badge (shadcn/ui)
- Toggle (shadcn/ui)
- AnimatedList (Eldora UI)

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| plans | array | [] | [{name, price, period, features, cta, recommended}] |
| columns | number (1-4) | 3 | Número de colunas |
| showToggle | boolean | true | Toggle mensal/anual |
| currency | text | "USD" | Moeda (USD, EUR, BRL) |
| currencyPosition | enum | "before" | before, after |
| highlightBest | boolean | true | Destacar melhor plano |
| comparisonTable | boolean | false | Tabela comparativa |
| animation | enum | "slideUp" | none, slideUp, scale |
| ctaStyle | enum | "button" | button, link, outline |

**Casos de Uso**:
- Páginas de pricing
- Comparação de planos
- Ofertas de serviço

### 4.3 Data Table

**ID**: `data-table`

**Descrição**: Tabela de dados interativa com filtros.

**Componentes Base**:
- DataTable (TanStack Table)
- Input (shadcn/ui)
- Button (shadcn/ui)
- Dropdown (shadcn/ui)
- Pagination (shadcn/ui)

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| data | json/api | [] | Fonte de dados |
| columns | array | [] | Definições de colunas |
| enableSearch | boolean | true | Campo de busca |
| enableFilters | boolean | true | Filtros por coluna |
| enableSorting | boolean | true | Ordenação |
| enablePagination | boolean | true | Paginação |
| rowsPerPage | enum | "25" | 10, 25, 50, 100 |
| enableExport | boolean | false | Exportar dados |
| stickyHeader | boolean | false | Header fixo |
| striped | boolean | false | Linhas alternadas |

**Casos de Uso**:
- Dashboards
- Relatórios
- Listagens de dados

### 4.4 Stats Counter

**ID**: `stats-counter`

**Descrição**: Contadores animados de estatísticas.

**Componentes Base**:
- Card (shadcn/ui)
- Typography (shadcn/ui)
- Progress (shadcn/ui)
- AnimatedList (Eldora UI)

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| stats | array | [] | [{value, label, suffix, prefix, icon}] |
| columns | number (2-4) | 4 | Número de colunas |
| animateOnScroll | boolean | true | Animar ao aparecer |
| duration | number | 2000 | Duração em ms |
| showProgress | boolean | false | Barra de progresso |
| style | enum | "minimal" | minimal, card, highlighted |
| separator | boolean | false | Separadores visuais |
| animation | enum | "countUp" | countUp, fadeIn, slideUp |
| numberFormat | enum | "standard" | standard, compact, currency |

**Casos de Uso**:
- Métricas de sucesso
- Conquistas
- KPIs

---

## 5. Interação & Formulários

### 5.1 Contact Form

**ID**: `form-contact`

**Descrição**: Formulário de contato responsivo.

**Componentes Base**:
- Form (shadcn/ui)
- Input (shadcn/ui)
- Textarea (shadcn/ui)
- Button (shadcn/ui)
- Select (shadcn/ui)

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| fields | array | [...default] | Configuração de campos |
| layout | enum | "stacked" | stacked, inline, two-column |
| showLabels | boolean | true | Mostrar labels |
| placeholders | boolean | true | Mostrar placeholders |
| validation | object | {...} | Regras de validação |
| submitEndpoint | url | "" | Endpoint de submissão |
| successMessage | text | "Mensagem enviada!" | Mensagem de sucesso |
| errorMessage | text | "Erro ao enviar" | Mensagem de erro |
| captcha | enum | "none" | none, recaptcha, hcaptcha |

**Casos de Uso**:
- Página de contato
- Captura de leads
- Feedback

### 5.2 Newsletter Signup

**ID**: `newsletter-signup`

**Descrição**: Formulário de inscrição em newsletter.

**Componentes Base**:
- Input (shadcn/ui)
- Button (shadcn/ui)
- Sonner (shadcn/ui)
- AnimatedBadge (Eldora UI)

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| title | text | "Newsletter" | Título do CTA |
| description | text | "" | Descrição |
| inputPlaceholder | text | "Seu email" | Placeholder |
| buttonText | text | "Inscrever" | Texto do botão |
| layout | enum | "inline" | inline, stacked, card |
| showPrivacy | boolean | true | Link de privacidade |
| endpoint | url | "" | Endpoint de submissão |
| incentive | text | "" | "Ganhe 10% de desconto" |
| animation | enum | "none" | none, pulse, glow |

**Casos de Uso**:
- Captura de emails
- Marketing
- Atualizações

### 5.3 Interactive Quiz

**ID**: `quiz-interactive`

**Descrição**: Quiz/enquete interativo.

**Componentes Base**:
- Card (shadcn/ui)
- RadioGroup (shadcn/ui)
- Button (shadcn/ui)
- Progress (shadcn/ui)
- Tabs (shadcn/ui)

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| questions | array | [] | [{question, options, correct, explanation}] |
| mode | enum | "quiz" | quiz, survey, poll |
| showProgress | boolean | true | Barra de progresso |
| showResults | boolean | true | Mostrar resultados |
| allowRetake | boolean | true | Permitir refazer |
| randomizeQuestions | boolean | false | Ordem aleatória |
| timeLimit | number | 0 | Segundos por questão |
| scoring | object | {} | Configuração de pontos |
| animation | enum | "slide" | slide, fade, flip |

**Casos de Uso**:
- Educação
- Engajamento
- Pesquisas

### 5.4 File Upload

**ID**: `file-upload`

**Descrição**: Área de upload de arquivos.

**Componentes Base**:
- UploadDropzone (Better Upload)
- Button (shadcn/ui)
- Progress (shadcn/ui)
- FileList custom

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| accept | string | "*" | Tipos aceitos |
| maxSize | number | 10 | MB máximo |
| maxFiles | number | 5 | Máximo de arquivos |
| multiple | boolean | false | Múltiplos arquivos |
| showPreview | boolean | true | Preview de imagens |
| uploadEndpoint | url | "" | Endpoint de upload |
| autoUpload | boolean | false | Upload automático |
| dragDropText | text | "Arraste arquivos" | Texto da área |

**Casos de Uso**:
- Formulários com anexos
- Upload de documentos
- Galeria de imagens

---

## 6. Navegação

### 6.1 Navigation Bar

**ID**: `nav-bar`

**Descrição**: Barra de navegação responsiva.

**Componentes Base**:
- NavigationMenu (shadcn/ui)
- Button (shadcn/ui)
- Avatar (shadcn/ui)
- DropdownMenu (shadcn/ui)

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| logo | object | {} | {image, text, link} |
| menuItems | array | [] | Estrutura de navegação |
| ctaButton | object | null | Botão de CTA |
| sticky | boolean | false | Fixar no topo |
| transparent | boolean | false | Fundo transparente |
| showSearch | boolean | false | Campo de busca |
| showLanguage | boolean | false | Seletor de idioma |
| mobileMenuStyle | enum | "slide" | slide, dropdown, fullscreen |
| animation | enum | "none" | none, slideDown, fadeIn |

**Casos de Uso**:
- Header principal
- Navegação do site
- Menu de app

### 6.2 Footer

**ID**: `footer-advanced`

**Descrição**: Footer com múltiplas seções.

**Componentes Base**:
- Separator (shadcn/ui)
- Typography (shadcn/ui)
- Button (shadcn/ui)
- Input (shadcn/ui)

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| columns | array | [] | [{title, links}] seções |
| logo | object | {} | {image, text} |
| description | text | "" | Sobre a empresa |
| socialLinks | array | [] | [{platform, url, icon}] |
| newsletter | boolean | false | Incluir newsletter |
| copyright | text | "" | Texto de copyright |
| legalLinks | array | [] | [{text, url}] links legais |
| layout | enum | "columns" | columns, centered, minimal |
| theme | enum | "dark" | light, dark, brand |

**Casos de Uso**:
- Footer de site
- Informações de contato
- Links importantes

### 6.3 Breadcrumb

**ID**: `breadcrumb`

**Descrição**: Navegação em migalhas de pão.

**Componentes Base**:
- Breadcrumb (shadcn/ui)
- ChevronRight (Lucide Icons)

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| items | array | [] | [{label, url}] itens |
| separator | enum | "chevron" | chevron, slash, arrow, dot |
| showHome | boolean | true | Mostrar home |
| maxItems | number | 0 | Colapsar com "..." |
| showCurrent | boolean | true | Mostrar página atual |
| size | enum | "default" | small, default, large |
| animation | enum | "none" | none, fadeIn, slideRight |

**Casos de Uso**:
- Navegação hierárquica
- E-commerce
- Documentação

---

## 7. Social & Prova Social

### 7.1 Testimonial Carousel

**ID**: `testimonial-carousel`

**Descrição**: Carrossel de depoimentos.

**Componentes Base**:
- Carousel (shadcn/ui)
- Card (shadcn/ui)
- Avatar (shadcn/ui)
- Quote custom
- Rating custom

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| testimonials | array | [] | [{text, author, role, company, avatar, rating}] |
| layout | enum | "carousel" | carousel, grid, masonry |
| showRating | boolean | true | Mostrar estrelas |
| showCompanyLogo | boolean | false | Logo da empresa |
| autoplay | boolean | true | Auto-rotação |
| autoplaySpeed | number | 5000 | Velocidade em ms |
| animation | enum | "slide" | slide, fade, scale |
| cardsToShow | number | 1 | Cards visíveis (1-3) |

**Casos de Uso**:
- Prova social
- Reviews de clientes
- Feedback

### 7.2 Team Grid

**ID**: `team-grid`

**Descrição**: Grid de membros da equipe.

**Componentes Base**:
- Card (shadcn/ui)
- Avatar (shadcn/ui)
- Badge (shadcn/ui)
- HoverCard (shadcn/ui)

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| members | array | [] | [{name, role, bio, avatar, social}] |
| columns | number | 4 | Colunas (2-4) |
| showSocial | boolean | true | Links sociais |
| showBio | boolean | true | Biografia |
| cardStyle | enum | "minimal" | minimal, bordered, elevated |
| hoverEffect | enum | "expand" | none, flip, expand, overlay |
| avatarShape | enum | "circle" | circle, square, hexagon |
| animation | enum | "stagger" | none, stagger, fadeIn |

**Casos de Uso**:
- Página sobre
- Equipe
- Speakers de evento

### 7.3 Client Logos

**ID**: `client-logos`

**Descrição**: Logos de clientes/parceiros.

**Componentes Base**:
- Integrations (Eldora UI)
- LogoTimeline (Eldora UI)
- AnimatedList (Eldora UI)

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| logos | array | [] | [{name, logo, url}] |
| layout | enum | "grid" | grid, carousel, marquee |
| columns | number | 5 | Colunas no grid |
| grayscale | boolean | true | Logos em cinza |
| hoverColor | boolean | true | Colorir no hover |
| animation | enum | "none" | none, scroll, fade |
| title | text | "" | Título da seção |
| autoScroll | boolean | false | Scroll automático |

**Casos de Uso**:
- Credibilidade
- Parceiros
- Integrações

### 7.4 Social Proof Bar

**ID**: `social-proof`

**Descrição**: Barra com prova social (avatares, números).

**Componentes Base**:
- AvatarGroup (shadcn/ui)
- Badge (shadcn/ui)
- AnimatedList (Eldora UI)

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| avatars | array | [] | URLs das fotos |
| text | text | "" | "10.000+ usuários" |
| showAnimation | boolean | true | Animar avatares |
| rating | number | 0 | Nota (0-5) |
| verifiedBadge | boolean | false | Badge verificado |
| position | enum | "inline" | inline, floating, sticky |
| animation | enum | "pulse" | pulse, bounce, fade |
| updateInterval | number | 0 | Atualizar número (ms) |

**Casos de Uso**:
- Landing pages
- Conversão
- Credibilidade

---

## 8. Call-to-Action

### 8.1 CTA Section

**ID**: `cta-section`

**Descrição**: Seção de call-to-action destacada.

**Componentes Base**:
- Card (shadcn/ui)
- Button (shadcn/ui)
- Typography (shadcn/ui)
- GradualSpacingText (Eldora UI)

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| headline | text | "" | Título principal |
| subheadline | text | "" | Subtítulo |
| primaryButton | object | {} | Botão primário |
| secondaryButton | object | {} | Botão secundário |
| background | enum | "gradient" | solid, gradient, pattern, image |
| backgroundImage | url | "" | Se background = image |
| textAlign | enum | "center" | left, center, right |
| animation | enum | "none" | none, pulse, glow, shimmer |
| urgency | text | "" | "Oferta limitada" |

**Casos de Uso**:
- Conversão
- Ofertas especiais
- Sign-ups

### 8.2 Floating Action Button

**ID**: `fab-button`

**Descrição**: Botão flutuante de ação.

**Componentes Base**:
- Button (shadcn/ui)
- Popover (shadcn/ui)
- AnimatedShinyButton (Eldora UI)

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| icon | icon | "message" | Ícone do botão |
| text | text | "" | Texto opcional |
| position | enum | "bottom-right" | Posição na tela |
| style | enum | "circle" | circle, pill, square |
| color | color | "primary" | Cor do botão |
| animation | enum | "pulse" | pulse, bounce, rotate, none |
| hideOnScroll | boolean | false | Esconder no scroll |
| showAfterScroll | number | 0 | Mostrar após X pixels |
| action | enum | "custom" | chat, phone, form, custom |

**Casos de Uso**:
- Chat/suporte
- WhatsApp
- Ações rápidas

### 8.3 Banner CTA

**ID**: `cta-banner`

**Descrição**: Banner horizontal de CTA.

**Componentes Base**:
- Alert (shadcn/ui)
- Button (shadcn/ui)
- Typography (shadcn/ui)

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| text | text | "" | Texto do banner |
| buttonText | text | "" | Texto do botão |
| buttonLink | url | "" | Link do botão |
| dismissible | boolean | false | Pode fechar |
| position | enum | "top" | top, bottom, inline |
| variant | enum | "info" | info, success, warning, error |
| icon | icon | "" | Ícone opcional |
| animation | enum | "slide" | none, slide, fade |

**Casos de Uso**:
- Anúncios
- Promoções
- Avisos importantes

---

## 9. Conteúdo Dinâmico

### 9.1 FAQ Accordion

**ID**: `faq-accordion`

**Descrição**: Perguntas frequentes em accordion.

**Componentes Base**:
- Accordion (shadcn/ui)
- Typography (shadcn/ui)
- Badge (shadcn/ui)
- Search custom

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| items | array | [] | [{question, answer, category}] |
| defaultOpen | array | [] | Índices abertos |
| allowMultiple | boolean | false | Múltiplos abertos |
| showCategories | boolean | false | Mostrar categorias |
| searchable | boolean | false | Campo de busca |
| animation | enum | "slide" | none, slide, fade |
| iconPosition | enum | "right" | left, right |
| dividers | boolean | true | Linhas divisórias |

**Casos de Uso**:
- FAQs
- Documentação
- Suporte

### 9.2 Timeline

**ID**: `timeline`

**Descrição**: Timeline de eventos.

**Componentes Base**:
- LogoTimeline (Eldora UI)
- Card (shadcn/ui)
- Badge (shadcn/ui)

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| events | array | [] | [{date, title, description, icon, image}] |
| orientation | enum | "vertical" | vertical, horizontal |
| alternating | boolean | true | Alternar lados |
| showConnector | boolean | true | Linha conectora |
| dateFormat | text | "DD/MM/YYYY" | Formato de data |
| animation | enum | "stagger" | none, stagger, fadeIn |
| iconStyle | enum | "circle" | circle, square, custom |
| compactMode | boolean | false | Modo compacto |

**Casos de Uso**:
- História da empresa
- Roadmap
- Processo/steps

### 9.3 Tabs Content

**ID**: `tabs-content`

**Descrição**: Conteúdo organizado em abas.

**Componentes Base**:
- Tabs (shadcn/ui)
- Card (shadcn/ui)
- Typography (shadcn/ui)

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| tabs | array | [] | [{label, content, icon}] |
| defaultTab | number | 0 | Aba inicial |
| orientation | enum | "horizontal" | horizontal, vertical |
| variant | enum | "default" | default, pills, underline |
| fullWidth | boolean | false | Largura total |
| animation | enum | "fade" | none, fade, slide |
| iconPosition | enum | "left" | left, top |

**Casos de Uso**:
- Organização de conteúdo
- Features por categoria
- Documentação

---

## 10. E-commerce

### 10.1 Product Cards

**ID**: `product-cards`

**Descrição**: Grid de cards de produtos.

**Componentes Base**:
- Card (shadcn/ui)
- Badge (shadcn/ui)
- Button (shadcn/ui)
- AspectRatio (shadcn/ui)
- HoverCard (shadcn/ui)

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| products | array | [] | [{name, price, image, description}] |
| columns | number | 3 | Colunas (2-4) |
| showRating | boolean | true | Mostrar avaliação |
| showBadge | boolean | true | Badge NEW/SALE |
| priceFormat | text | "$" | Formato do preço |
| showQuickView | boolean | true | Botão quick view |
| showWishlist | boolean | true | Botão favoritos |
| hoverEffect | enum | "zoom" | none, zoom, slide, flip |
| layout | enum | "vertical" | vertical, horizontal |

**Casos de Uso**:
- Catálogo de produtos
- Vitrine
- Produtos relacionados

### 10.2 Product Gallery

**ID**: `product-gallery`

**Descrição**: Galeria de produto com miniaturas.

**Componentes Base**:
- Carousel (shadcn/ui)
- AspectRatio (shadcn/ui)
- Dialog (shadcn/ui)
- Zoom custom

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| images | array | [] | URLs das imagens |
| thumbnailPosition | enum | "bottom" | bottom, left, right |
| enableZoom | boolean | true | Zoom no hover |
| zoomLevel | number | 2 | Nível de zoom (1.5-3) |
| showArrows | boolean | true | Setas navegação |
| showDots | boolean | false | Pontos navegação |
| autoplay | boolean | false | Auto-rotação |
| aspectRatio | enum | "square" | square, portrait, landscape |
| lightbox | boolean | true | Abrir em modal |

**Casos de Uso**:
- Página de produto
- Detalhes do produto
- Preview

---

## 11. Blocos Especiais

### 11.1 Code Block

**ID**: `code-showcase`

**Descrição**: Bloco de código com syntax highlighting.

**Componentes Base**:
- Code (Animate Code)
- CodeTabs custom
- Terminal (Eldora UI)
- Copy button

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| code | text | "" | Código a exibir |
| language | enum | "javascript" | Linguagem |
| theme | enum | "dark" | dark, light, dracula, github |
| showLineNumbers | boolean | true | Números de linha |
| highlightLines | array | [] | Linhas destacadas |
| showCopy | boolean | true | Botão copiar |
| title | text | "" | Título/filename |
| tabs | array | [] | [{label, code, language}] |
| terminal | boolean | false | Estilo terminal |

**Casos de Uso**:
- Documentação técnica
- Tutoriais
- Exemplos de código

### 11.2 Map Interactive

**ID**: `map-interactive`

**Descrição**: Mapa interativo com marcadores.

**Componentes Base**:
- Map (Mapbox/Leaflet)
- Card (shadcn/ui)
- Popover (shadcn/ui)

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| center | object | {} | {lat, lng} centro |
| zoom | number | 12 | Zoom inicial (1-20) |
| markers | array | [] | [{lat, lng, label, popup}] |
| style | enum | "streets" | streets, satellite, dark, light |
| showControls | boolean | true | Controles de zoom |
| enableInteraction | boolean | true | Interação do usuário |
| height | number | 400 | Altura em px |
| showSearch | boolean | false | Campo de busca |
| clusterMarkers | boolean | false | Agrupar marcadores |

**Casos de Uso**:
- Localização
- Store locator
- Eventos

### 11.3 Comments Section

**ID**: `comments-section`

**Descrição**: Seção de comentários.

**Componentes Base**:
- Card (shadcn/ui)
- Avatar (shadcn/ui)
- Button (shadcn/ui)
- Textarea (shadcn/ui)

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| comments | array | [] | Lista de comentários |
| allowReplies | boolean | true | Permitir respostas |
| requireAuth | boolean | true | Exigir login |
| moderation | boolean | false | Moderar comentários |
| sortBy | enum | "newest" | newest, oldest, popular |
| showAvatar | boolean | true | Mostrar avatares |
| maxDepth | number | 3 | Profundidade de respostas |
| pagination | boolean | true | Paginar comentários |

**Casos de Uso**:
- Blogs
- Discussões
- Feedback

### 11.4 Weather Widget

**ID**: `weather-widget`

**Descrição**: Widget de previsão do tempo.

**Componentes Base**:
- Card (shadcn/ui)
- Typography (shadcn/ui)
- Weather icons custom

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| location | text | "" | Cidade/coordenadas |
| units | enum | "celsius" | celsius, fahrenheit |
| showForecast | boolean | true | Previsão 5 dias |
| showDetails | boolean | true | Umidade, vento, etc |
| theme | enum | "auto" | auto, light, dark |
| compact | boolean | false | Modo compacto |
| autoDetect | boolean | false | Detectar localização |

**Casos de Uso**:
- Portais de notícias
- Apps de viagem
- Dashboards

---

## 12. Estrutural

### 12.1 Spacer

**ID**: `spacer`

**Descrição**: Espaçador vertical ajustável.

**Componentes Base**:
- Div com height customizado

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| height | number | 40 | Altura em pixels |
| mobileHeight | number | 20 | Altura no mobile |
| background | enum | "transparent" | transparent, gradient, pattern |

**Casos de Uso**:
- Espaçamento entre seções
- Ajuste de layout
- Respiração visual

### 12.2 Divider

**ID**: `divider`

**Descrição**: Divisor visual entre seções.

**Componentes Base**:
- Separator (shadcn/ui)
- Typography (shadcn/ui)

**Propriedades Editáveis**:

| Propriedade | Tipo | Padrão | Descrição |
|------------|------|---------|-----------|
| style | enum | "solid" | solid, dashed, dotted, gradient |
| width | enum | "full" | full, medium, small |
| color | color | "border" | Cor da linha |
| text | text | "" | Texto opcional no centro |
| icon | icon | "" | Ícone opcional |
| margin | enum | "medium" | small, medium, large |
| animation | enum | "none" | none, fadeIn, slideIn |

**Casos de Uso**:
- Separação de conteúdo
- Organização visual
- Transições entre seções

---

## Sistema de Smart Blocks

### Recomendações Contextuais

O sistema analisa o contexto da página e sugere próximos blocos baseado em padrões comuns:

```javascript
const recommendations = {
  afterHero: ['feature-grid', 'stats-counter', 'text-image', 'video-player'],
  afterFeatures: ['testimonial-carousel', 'pricing-cards', 'cta-section'],
  afterPricing: ['faq-accordion', 'testimonial-carousel', 'cta-section'],
  afterTestimonials: ['cta-section', 'faq-accordion', 'form-contact'],
  afterContent: ['cta-section', 'newsletter-signup', 'related-content'],
  beforeFooter: ['cta-section', 'newsletter-signup', 'form-contact', 'client-logos']
}
```

### Auto-Adaptação

Blocos se adaptam automaticamente ao contexto:

- **Layout**: Ajusta colunas baseado no espaço disponível
- **Conteúdo**: Trunca texto com "read more" quando necessário
- **Imagens**: Redimensiona mantendo aspect ratio
- **Responsividade**: Adapta automaticamente para mobile/tablet
- **Tema**: Herda cores e fontes do tema global

### Smart Placeholders

Conteúdo de exemplo contextual:

- **Texto**: Lorem ipsum específico por indústria
- **Imagens**: Unsplash API com keywords relevantes
- **Ícones**: Sugestões baseadas no tipo de conteúdo
- **Dados**: Informações fake realistas (nomes, números, datas)
- **Cores**: Paleta automática baseada na brand color

---

## Notas de Implementação

### Performance

- Lazy loading de blocos pesados (especialmente com animações)
- Code splitting por tipo de bloco
- Otimização automática de imagens
- CSS crítico inline
- Prefetch de blocos prováveis

### Acessibilidade

- Todos os blocos seguem WCAG 2.1 AA
- ARIA labels apropriados
- Navegação por teclado
- Screen reader friendly
- Contraste automático de cores

### SEO

- Schema markup automático por tipo de bloco
- Meta tags dinâmicas
- Sitemap generation
- Lazy loading com fallback para crawlers
- Structured data para rich snippets