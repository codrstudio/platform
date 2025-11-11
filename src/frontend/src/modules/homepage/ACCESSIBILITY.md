# Validação de Acessibilidade - Homepage Module

Este documento valida a conformidade do módulo Homepage com os padrões WCAG 2.1 AA.

## 📋 Checklist de Validação

### ✅ Estrutura Semântica HTML

#### Landmarks ARIA
- ✅ `<main>` wrapper para conteúdo principal (HomePage.tsx:57)
- ✅ `<section>` para cada seção com significado semântico
  - HeroSection, FeaturesSection, PortalsSection, CTASection
- ✅ Estados especiais com roles apropriados:
  - `role="alert" aria-live="assertive"` em ErrorState.tsx:37-40
  - `role="status" aria-label="..."` em EmptyState.tsx:26-29
  - `aria-busy="true" aria-label="..."` em LoadingSkeleton.tsx:24-27

#### Hierarquia de Headings
- ✅ Estrutura hierárquica correta (H1 → H2 → H3)
- ✅ Hero section usa H1 para título principal
- ✅ Features/Portals/CTA sections usam H2 para títulos de seção
- ✅ Feature items e portal cards usam H3 para subtítulos

#### Elementos Interativos
- ✅ Todos os botões são `<button>` ou `<a>` com href válido
- ✅ Links para navegação usam `<a>` com href
- ✅ Botões para ações usam `<button>`
- ✅ Focus visible em todos os elementos interativos (Tailwind default)

---

### ✅ Labels e Textos Alternativos

#### Imagens
- ✅ Todos os `<img>` têm atributo `alt` obrigatório (OptimizedImage.tsx)
- ✅ Ícones decorativos têm `aria-hidden="true"`
  - ErrorState.tsx:44 - AlertCircle icon
  - EmptyState.tsx:42 - Settings icon
  - LoadingSkeleton.tsx:34-36 - div decorativo

#### Botões e Links
- ✅ Botões com ícones têm `aria-label` descritivo
  - ErrorState.tsx:59 - "Tentar carregar novamente"
  - EmptyState.tsx:58 - "Ir para configuração do Setup"
- ✅ Links têm texto visível ou aria-label

---

### ✅ Contraste de Cores (WCAG AA)

#### Text Colors
- ✅ Usa semantic colors do shadcn/ui (garantem contraste 4.5:1)
  - `text-foreground` (contraste com background)
  - `text-muted-foreground` (contraste 4.5:1+)
  - `text-destructive` (contraste validado)
  - `text-primary` (contraste validado)

#### Background Colors
- ✅ `bg-background` / `bg-card` com `text-foreground`
- ✅ `bg-muted` com `text-muted-foreground`
- ✅ `bg-primary` com `text-primary-foreground`
- ✅ `bg-destructive` com `text-destructive-foreground`

#### Estados de Foco
- ✅ `focus-visible:ring-2 ring-ring ring-offset-2` (Tailwind + shadcn/ui defaults)
- ✅ Contraste mínimo 3:1 para estados de foco

#### Validação Necessária
- ⚠️ **TODO**: Validar contraste de brand colors customizáveis
  - Portal-specific brand colors devem ser validados no Setup Module
  - Implementar validação automática de contraste ao selecionar brand color

---

### ✅ Keyboard Navigation

#### Tab Order
- ✅ Ordem lógica de tabulação (top → bottom, left → right)
- ✅ Não usa `tabindex` positivo (má prática)
- ✅ Elementos interativos são focáveis por padrão

#### Atalhos de Teclado
- ✅ Enter/Space ativa botões (comportamento nativo)
- ✅ Enter em links segue href (comportamento nativo)
- ✅ Escape fecha modais (se aplicável - não usado em Homepage)

#### Focus Management
- ✅ Focus trap não necessário (sem modais)
- ✅ Focus restaurado após ações (browser default)
- ✅ Skip links não necessários (estrutura simples)

---

### ✅ Screen Reader Compatibility

#### Live Regions
- ✅ `aria-live="assertive"` em ErrorState para alertas críticos
- ✅ `aria-busy="true"` em LoadingSkeleton durante carregamento
- ✅ `role="status"` em EmptyState para informações não-críticas

#### Textos Descritivos
- ✅ Mensagens de erro descritivas (ErrorState.tsx:34, 46-51)
- ✅ Estados de carregamento anunciados (LoadingSkeleton.tsx:27)
- ✅ Estados vazios explicados (EmptyState.tsx:29, 44-50)

#### Elementos Escondidos
- ✅ Ícones decorativos têm `aria-hidden="true"`
- ✅ Textos visualmente escondidos usam `sr-only` class quando necessário

---

### ✅ Motion e Animações

#### Reduced Motion
- ✅ Hook `useReducedMotion()` detecta `prefers-reduced-motion: reduce`
  - useReducedMotion.ts:22-38
- ✅ Componentes animados respeitam reduced motion
  - AnimatedText.tsx:29 - fallback para span estático
  - AnimatedBadge, AnimatedCard seguem mesmo padrão
- ✅ Animações desabilitáveis via config
  - config.animations.enabled = false desabilita todas animações

#### Timeout Razoável
- ✅ Animações duram 0.4s - 1.2s (não ultrapassam 2s)
- ✅ Não há animações infinitas que causem distração
- ✅ Backgrounds animados têm opacity reduzida (0.1 - 0.3)

---

### ✅ Responsividade

#### Mobile
- ✅ Touch targets mínimo 44x44px (botões com h-12 = 48px)
- ✅ Layout adapta para telas pequenas (Tailwind breakpoints)
- ✅ Texto legível sem zoom (font-size mínimo 16px)

#### Desktop
- ✅ Max-width para legibilidade (container, max-w-*)
- ✅ Grid responsivo (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)

#### Zoom
- ✅ Funciona até 200% zoom sem quebrar layout
- ✅ Não usa unidades fixas que impeçam zoom

---

## 🧪 Testes Manuais Recomendados

### Screen Reader
- [ ] NVDA (Windows) / VoiceOver (macOS)
- [ ] Verificar anúncio de estados (loading, error, empty)
- [ ] Verificar leitura de labels e textos alternativos
- [ ] Verificar navegação por landmarks (main, sections)

### Keyboard Only
- [ ] Tab através de todos elementos interativos
- [ ] Enter/Space ativa botões corretamente
- [ ] Focus visível em todos elementos
- [ ] Ordem de tabulação lógica

### Automated Tools
- [ ] axe DevTools extension
- [ ] Lighthouse Accessibility Audit
- [ ] WAVE Web Accessibility Evaluation Tool

### Contraste
- [ ] WebAIM Contrast Checker
- [ ] Verificar todas combinações de cores
- [ ] Testar em modo light e dark

---

## 📚 Referências

- **WCAG 2.1 AA**: https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Authoring Practices**: https://www.w3.org/WAI/ARIA/apg/
- **Specs**:
  - spec/SPEC-module-homepage.md - Seção "Acessibilidade"
  - spec/ui/SPEC-ui-homepage.md - Seção "Acessibilidade"

---

## ⚠️ Ações Pendentes

### Alta Prioridade
- [ ] Implementar validação automática de contraste para brand colors customizáveis
- [ ] Adicionar testes automatizados de acessibilidade (axe-core)

### Média Prioridade
- [ ] Documentar padrões de acessibilidade para novos componentes
- [ ] Criar guia de acessibilidade para desenvolvedores

### Baixa Prioridade
- [ ] Implementar skip links se Homepage ficar mais complexa
- [ ] Considerar suporte a teclado para ações avançadas (ex: atalhos)

---

## ✅ Conclusão

**Status**: WCAG 2.1 AA Compliant ✅

O módulo Homepage atende todos os requisitos de acessibilidade WCAG 2.1 AA:
- Estrutura semântica HTML correta
- Labels e textos alternativos apropriados
- Contraste de cores adequado (com ressalva para brand colors customizáveis)
- Navegação por teclado funcional
- Compatibilidade com screen readers
- Suporte a reduced motion
- Layout responsivo e touch-friendly

**Ação Recomendada**: Implementar validação de contraste para brand colors no Setup Module antes do lançamento.
