# SPEC-accessibility.md

## Especificação: Acessibilidade e Usabilidade

### Escopo
Este documento define os requisitos de acessibilidade da plataforma, garantindo conformidade com WCAG 2.1 AA e melhores práticas de UX baseadas no shadcn/ui.

### Referências
- **WCAG 2.1**: Web Content Accessibility Guidelines
- **shadcn/ui**: Todos os componentes seguem padrões de acessibilidade
- **Radix UI**: Primitivos acessíveis usados pelo shadcn/ui
- **React ARIA**: Padrões de acessibilidade para React

---

## 1. Princípios Fundamentais

### SPEC-A11Y-P-001
A plataforma DEVE seguir os 4 princípios WCAG: Perceptível, Operável, Compreensível, Robusto

### SPEC-A11Y-P-002
Todos os componentes shadcn/ui DEVEM manter suas propriedades de acessibilidade nativas

### SPEC-A11Y-P-003
Customizações de componentes NÃO DEVEM remover atributos ARIA ou comportamentos acessíveis

### SPEC-A11Y-P-004
A plataforma DEVE ser testável com:
- Leitores de tela (NVDA, JAWS, VoiceOver)
- Navegação por teclado
- Zoom até 200%
- Modo de alto contraste

---

## 2. Navegação por Teclado

### Requisitos Gerais

**SPEC-A11Y-KB-001:** Todos os elementos interativos DEVEM ser acessíveis via teclado

**SPEC-A11Y-KB-002:** Ordem de foco (tab order) DEVE ser lógica e previsível

**SPEC-A11Y-KB-003:** Focus DEVE ser sempre visível (outline ou ring do shadcn/ui)

**SPEC-A11Y-KB-004:** Focus NÃO DEVE ser removido via CSS (`outline: none` proibido sem alternativa)

### Atalhos de Teclado

**SPEC-A11Y-KB-005:** Atalhos globais DEVEM usar modificadores (Ctrl, Alt, Shift)

**SPEC-A11Y-KB-006:** Atalhos DEVEM ser documentados e acessíveis via help

**SPEC-A11Y-KB-007:** Atalhos PODEM ser customizáveis pelo usuário

**SPEC-A11Y-KB-008:** Componente **Command** (Command Palette) DEVE ser atalho padrão: `Ctrl+K` ou `Cmd+K`

### Navegação em Componentes

**SPEC-A11Y-KB-009:** **Dialog** e **Alert Dialog**:
- ESC fecha o dialog
- Tab cicla entre elementos internos
- Focus trap ativo (não sai do dialog)

**SPEC-A11Y-KB-010:** **Dropdown Menu**:
- Space ou Enter abre o menu
- Setas navegam itens
- ESC fecha o menu
- Letras ativam busca de item

**SPEC-A11Y-KB-011:** **Select**:
- Space ou Enter abre
- Setas navegam opções
- Home/End vão para primeira/última opção
- Type-ahead para buscar

**SPEC-A11Y-KB-012:** **Tabs**:
- Setas left/right navegam entre tabs
- Home/End vão para primeira/última tab
- Enter ou Space ativam tab

**SPEC-A11Y-KB-013:** **Radio Group**:
- Setas navegam opções
- Apenas uma opção pode ter foco (roving tabindex)

**SPEC-A11Y-KB-014:** **Combobox**:
- Setas navegam sugestões
- Enter seleciona
- ESC fecha lista

---

## 3. Leitores de Tela

### ARIA Labels e Descriptions

**SPEC-A11Y-SR-001:** Todos os botões sem texto visível DEVEM ter `aria-label`

**SPEC-A11Y-SR-002:** Ícones decorativos DEVEM ter `aria-hidden="true"`

**SPEC-A11Y-SR-003:** Ícones informativos DEVEM ter `aria-label` ou texto alternativo

**SPEC-A11Y-SR-004:** Campos de formulário DEVEM ter labels associados (via `htmlFor` ou wrapping)

**SPEC-A11Y-SR-005:** Mensagens de erro DEVEM usar `aria-describedby` ou `aria-errormessage`

**SPEC-A11Y-SR-006:** Loading states DEVEM usar `aria-busy="true"` ou `aria-live`

### Live Regions

**SPEC-A11Y-SR-007:** Notificações (toasts) DEVEM usar `aria-live="polite"` ou `role="status"`

**SPEC-A11Y-SR-008:** Alertas urgentes DEVEM usar `aria-live="assertive"` ou `role="alert"`

**SPEC-A11Y-SR-009:** Mudanças dinâmicas de conteúdo DEVEM ser anunciadas quando relevantes

**SPEC-A11Y-SR-010:** Sonner (toast) do shadcn/ui JÁ inclui `aria-live` correto

### Roles e States

**SPEC-A11Y-SR-011:** Componentes customizados DEVEM usar roles ARIA apropriados

**SPEC-A11Y-SR-012:** Estados DEVEM ser comunicados via `aria-expanded`, `aria-selected`, `aria-checked`

**SPEC-A11Y-SR-013:** Elementos desabilitados DEVEM usar `aria-disabled="true"` e `disabled` HTML

**SPEC-A11Y-SR-014:** Tooltips DEVEM usar `role="tooltip"` e serem referenciados por `aria-describedby`

### Anúncios de Ações

**SPEC-A11Y-SR-015:** Ao salvar dados com sucesso, DEVE anunciar "Dados salvos com sucesso"

**SPEC-A11Y-SR-016:** Ao deletar item, DEVE anunciar "Item deletado"

**SPEC-A11Y-SR-017:** Ao carregar dados, PODE anunciar "Carregando..." (se demorado)

**SPEC-A11Y-SR-018:** Erros DEVEM ser anunciados imediatamente

---

## 4. Contraste e Cores

### Requisitos de Contraste

**SPEC-A11Y-CO-001:** Texto normal DEVE ter contraste mínimo 4.5:1 (WCAG AA)

**SPEC-A11Y-CO-002:** Texto grande (18pt+ ou 14pt+ bold) DEVE ter contraste mínimo 3:1

**SPEC-A11Y-CO-003:** Componentes de UI (botões, inputs) DEVEM ter contraste mínimo 3:1

**SPEC-A11Y-CO-004:** Focus indicators DEVEM ter contraste mínimo 3:1

**SPEC-A11Y-CO-005:** shadcn/ui color tokens JÁ garantem contraste adequado quando usados corretamente

### Cores Semânticas

**SPEC-A11Y-CO-006:** Informação NÃO DEVE depender apenas de cor

**SPEC-A11Y-CO-007:** Estados de erro DEVEM ter ícone + cor + texto

**SPEC-A11Y-CO-008:** Sucesso DEVE ter ícone + cor + texto

**SPEC-A11Y-CO-009:** Avisos DEVEM ter ícone + cor + texto

**SPEC-A11Y-CO-010:** Links DEVEM ser distinguíveis por mais que apenas cor (underline, ícone, bold)

### Modo Alto Contraste

**SPEC-A11Y-CO-011:** Plataforma DEVE funcionar em modo de alto contraste do Windows

**SPEC-A11Y-CO-012:** Bordas de componentes DEVEM ser visíveis em alto contraste

**SPEC-A11Y-CO-013:** Ícones DEVEM usar `currentColor` para respeitar preferências de contraste

---

## 5. Formulários

### Labels e Instruções

**SPEC-A11Y-FORM-001:** Todo campo DEVE ter label visível

**SPEC-A11Y-FORM-002:** Label DEVE usar `<label>` HTML com `htmlFor` ou wrapping do input

**SPEC-A11Y-FORM-003:** Campos obrigatórios DEVEM indicar visualmente e semanticamente (`aria-required="true"`)

**SPEC-A11Y-FORM-004:** Instruções de preenchimento DEVEM estar antes do campo ou associadas via `aria-describedby`

**SPEC-A11Y-FORM-005:** Placeholder NÃO substitui label

### Validação e Erros

**SPEC-A11Y-FORM-006:** Erros DEVEM ser anunciados por leitores de tela

**SPEC-A11Y-FORM-007:** Campos com erro DEVEM usar `aria-invalid="true"`

**SPEC-A11Y-FORM-008:** Mensagem de erro DEVE estar associada ao campo via `aria-describedby`

**SPEC-A11Y-FORM-009:** Ao submeter formulário com erros, DEVE focar primeiro campo inválido

**SPEC-A11Y-FORM-010:** Componente **Form** do shadcn/ui JÁ implementa estas práticas

### Grupos de Campos

**SPEC-A11Y-FORM-011:** Radio buttons DEVEM usar `<RadioGroup>` com label de grupo

**SPEC-A11Y-FORM-012:** Checkboxes relacionados DEVEM usar `<fieldset>` e `<legend>`

**SPEC-A11Y-FORM-013:** Campos condicionais DEVEM anunciar quando aparecem/desaparecem

---

## 6. Componentes Interativos

### Botões

**SPEC-A11Y-BTN-001:** Botões DEVEM usar `<button>` HTML (não `<div>` com `onClick`)

**SPEC-A11Y-BTN-002:** Botões sem texto DEVEM ter `aria-label` descritivo

**SPEC-A11Y-BTN-003:** Estado de loading DEVE ter `aria-busy="true"` e `disabled`

**SPEC-A11Y-BTN-004:** Ícone + texto: ícone DEVE ter `aria-hidden="true"`

**SPEC-A11Y-BTN-005:** Componente **Button** do shadcn/ui JÁ é acessível

### Modais e Dialogs

**SPEC-A11Y-MODAL-001:** Dialog DEVE usar `role="dialog"` ou `role="alertdialog"`

**SPEC-A11Y-MODAL-002:** Dialog DEVE ter `aria-labelledby` apontando para título

**SPEC-A11Y-MODAL-003:** Dialog PODE ter `aria-describedby` apontando para descrição

**SPEC-A11Y-MODAL-004:** Focus DEVE mover para dialog ao abrir

**SPEC-A11Y-MODAL-005:** Focus DEVE voltar ao trigger ao fechar

**SPEC-A11Y-MODAL-006:** Focus DEVE estar "preso" dentro do dialog (focus trap)

**SPEC-A11Y-MODAL-007:** ESC DEVE fechar dialog (exceto quando ação crítica pendente)

**SPEC-A11Y-MODAL-008:** Componentes **Dialog** e **Alert Dialog** do shadcn/ui JÁ implementam tudo isso

### Tooltips

**SPEC-A11Y-TIP-001:** Tooltip DEVE usar `role="tooltip"`

**SPEC-A11Y-TIP-002:** Elemento com tooltip DEVE ter `aria-describedby` referenciando tooltip

**SPEC-A11Y-TIP-003:** Tooltip DEVE aparecer no hover E no focus

**SPEC-A11Y-TIP-004:** Tooltip DEVE ser descartável (ESC fecha)

**SPEC-A11Y-TIP-005:** Tooltip NÃO DEVE conter informação essencial (apenas suplementar)

**SPEC-A11Y-TIP-006:** Componente **Tooltip** do shadcn/ui JÁ é acessível

### Dropdowns e Menus

**SPEC-A11Y-DROP-001:** Menu DEVE usar `role="menu"` e itens `role="menuitem"`

**SPEC-A11Y-DROP-002:** Trigger DEVE ter `aria-haspopup="true"` e `aria-expanded`

**SPEC-A11Y-DROP-003:** Setas DEVEM navegar entre itens

**SPEC-A11Y-DROP-004:** Enter ou Space DEVEM ativar item

**SPEC-A11Y-DROP-005:** ESC DEVE fechar menu

**SPEC-A11Y-DROP-006:** Componente **Dropdown Menu** do shadcn/ui JÁ implementa padrões ARIA Menu

---

## 7. Tabelas e Listas

### Tabelas de Dados

**SPEC-A11Y-TABLE-001:** Tabelas DEVEM usar `<table>` HTML semântico

**SPEC-A11Y-TABLE-002:** Cabeçalhos DEVEM usar `<th>` com `scope="col"` ou `scope="row"`

**SPEC-A11Y-TABLE-003:** Caption DEVE descrever propósito da tabela

**SPEC-A11Y-TABLE-004:** Tabelas complexas PODEM usar `aria-describedby` para descrição detalhada

**SPEC-A11Y-TABLE-005:** Componente **Data Table** do shadcn/ui JÁ é acessível

### Ordenação e Filtros

**SPEC-A11Y-TABLE-006:** Colunas ordenáveis DEVEM anunciar direção atual

**SPEC-A11Y-TABLE-007:** Mudança de ordenação DEVE anunciar nova ordenação

**SPEC-A11Y-TABLE-008:** Filtros aplicados DEVEM ser anunciados

### Paginação

**SPEC-A11Y-TABLE-009:** Paginação DEVE usar `<nav>` com `aria-label="Paginação"`

**SPEC-A11Y-TABLE-010:** Página atual DEVE ter `aria-current="page"`

**SPEC-A11Y-TABLE-011:** Total de páginas DEVE ser anunciado

**SPEC-A11Y-TABLE-012:** Componente **Pagination** do shadcn/ui JÁ é acessível

---

## 8. Navegação e Landmarks

### Landmarks ARIA

**SPEC-A11Y-NAV-001:** Usar elementos semânticos HTML5: `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`

**SPEC-A11Y-NAV-002:** Múltiplos landmarks do mesmo tipo DEVEM ter `aria-label` descritivo

**SPEC-A11Y-NAV-003:** Conteúdo principal DEVE estar em `<main>` (único por página)

**SPEC-A11Y-NAV-004:** Skip links DEVEM permitir pular para conteúdo principal

### Navegação Breadcrumb

**SPEC-A11Y-NAV-005:** Breadcrumb DEVE usar `<nav>` com `aria-label="Breadcrumb"`

**SPEC-A11Y-NAV-006:** Página atual DEVE ter `aria-current="page"`

**SPEC-A11Y-NAV-007:** Componente **Breadcrumb** do shadcn/ui JÁ é acessível

### Sidebar

**SPEC-A11Y-NAV-008:** Sidebar DEVE usar `<aside>` ou `<nav>` conforme contexto

**SPEC-A11Y-NAV-009:** Toggle de sidebar DEVE anunciar estado (aberto/fechado)

**SPEC-A11Y-NAV-010:** Sidebar colapsada DEVE manter navegação acessível

**SPEC-A11Y-NAV-011:** Componente **Sidebar** do shadcn/ui JÁ é acessível

---

## 9. Imagens e Mídia

### Textos Alternativos

**SPEC-A11Y-IMG-001:** Imagens informativas DEVEM ter `alt` descritivo

**SPEC-A11Y-IMG-002:** Imagens decorativas DEVEM ter `alt=""` (vazio)

**SPEC-A11Y-IMG-003:** Imagens complexas (gráficos, diagramas) DEVEM ter descrição detalhada via `aria-describedby`

**SPEC-A11Y-IMG-004:** Ícones como imagens DEVEM ter `alt` ou `aria-label`

### Vídeos e Áudio

**SPEC-A11Y-MEDIA-001:** Vídeos DEVEM ter legendas (captions)

**SPEC-A11Y-MEDIA-002:** Vídeos PODEM ter audiodescrição

**SPEC-A11Y-MEDIA-003:** Players DEVEM ter controles acessíveis por teclado

**SPEC-A11Y-MEDIA-004:** Autoplay DEVE ser evitado ou ter controle para pausar

---

## 10. Responsividade e Zoom

### Zoom

**SPEC-A11Y-ZOOM-001:** Interface DEVE funcionar com zoom até 200%

**SPEC-A11Y-ZOOM-002:** Conteúdo NÃO DEVE exigir scroll horizontal com zoom 200%

**SPEC-A11Y-ZOOM-003:** Texto NÃO DEVE sobrepor ou ser cortado com zoom

**SPEC-A11Y-ZOOM-004:** Componentes shadcn/ui usam unidades relativas (rem) e funcionam bem com zoom

### Responsividade

**SPEC-A11Y-RESP-001:** Layout DEVE adaptar para mobile, tablet, desktop

**SPEC-A11Y-RESP-002:** Touch targets DEVEM ter mínimo 44x44px (mobile)

**SPEC-A11Y-RESP-003:** Texto DEVE ser legível em todas as resoluções (mínimo 16px base)

**SPEC-A11Y-RESP-004:** Navegação DEVE funcionar bem em touch (menus expansíveis, etc)

---

## 11. Movimento e Animações

### Redução de Movimento

**SPEC-A11Y-MOTION-001:** Respeitar `prefers-reduced-motion` do sistema

**SPEC-A11Y-MOTION-002:** Animações essenciais DEVEM ter versão reduzida

**SPEC-A11Y-MOTION-003:** Animações puramente decorativas DEVEM ser desabilitadas se `prefers-reduced-motion: reduce`

**SPEC-A11Y-MOTION-004:** Exemplo de CSS:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**SPEC-A11Y-MOTION-005:** shadcn/ui JÁ inclui suporte a `prefers-reduced-motion`

### Animações Automáticas

**SPEC-A11Y-MOTION-006:** Carrosséis automáticos DEVEM ter controle de pausa

**SPEC-A11Y-MOTION-007:** Parallax e scroll-triggered animations DEVEM respeitar `prefers-reduced-motion`

---

## 12. Testes de Acessibilidade

### Ferramentas Obrigatórias

**SPEC-A11Y-TEST-001:** Usar axe DevTools para testes automáticos

**SPEC-A11Y-TEST-002:** Usar Lighthouse accessibility audit

**SPEC-A11Y-TEST-003:** Testar com leitor de tela (NVDA no Windows, VoiceOver no macOS)

**SPEC-A11Y-TEST-004:** Testar navegação apenas por teclado

### Checklist de Testes

**SPEC-A11Y-TEST-005:** Desconectar mouse e navegar apenas por teclado

**SPEC-A11Y-TEST-006:** Ativar leitor de tela e navegar pela aplicação

**SPEC-A11Y-TEST-007:** Ativar modo de alto contraste

**SPEC-A11Y-TEST-008:** Zoom para 200% e verificar usabilidade

**SPEC-A11Y-TEST-009:** Testar em mobile com touch

**SPEC-A11Y-TEST-010:** Verificar contraste de todas as cores

---

## 13. Documentação de Acessibilidade

### Guia de Uso

**SPEC-A11Y-DOC-001:** DEVE existir documentação de atalhos de teclado

**SPEC-A11Y-DOC-002:** DEVE existir guia de navegação por teclado

**SPEC-A11Y-DOC-003:** PODE existir página "Acessibilidade" explicando recursos

### ARIA Pattern Reference

**SPEC-A11Y-DOC-004:** Componentes customizados DEVEM documentar padrões ARIA usados

**SPEC-A11Y-DOC-005:** Documentação DEVE referenciar WAI-ARIA Authoring Practices quando aplicável

---

## 14. Componentes shadcn/ui e Acessibilidade

### Componentes Nativamente Acessíveis

**SPEC-A11Y-SHADCN-001:** Os seguintes componentes shadcn/ui JÁ são totalmente acessíveis:
- **Button**: roles, states, keyboard
- **Dialog**: focus trap, ESC, aria-labelledby
- **Alert Dialog**: mesmo que Dialog + alertdialog role
- **Dropdown Menu**: menu role, keyboard navigation
- **Select**: combobox pattern completo
- **Radio Group**: roving tabindex, arrow navigation
- **Checkbox**: states, keyboard
- **Switch**: switch role, keyboard
- **Tooltip**: tooltip role, hover + focus
- **Tabs**: tab pattern, arrow navigation
- **Accordion**: button + region pattern
- **Form**: error announcements, aria-describedby
- **Data Table**: semantic HTML, sortable headers
- **Pagination**: nav, aria-current

**SPEC-A11Y-SHADCN-002:** Componentes DEVEM ser usados sem modificações que removam acessibilidade

**SPEC-A11Y-SHADCN-003:** Customizações visuais (Tailwind classes) NÃO afetam acessibilidade

### Radix UI Primitivos

**SPEC-A11Y-SHADCN-004:** shadcn/ui é construído sobre Radix UI primitivos

**SPEC-A11Y-SHADCN-005:** Radix UI segue WAI-ARIA Authoring Practices Guide

**SPEC-A11Y-SHADCN-006:** Modificações nos componentes DEVEM preservar primitivos do Radix

---

## 15. Conformidade WCAG 2.1 AA

### Critérios de Sucesso Nível A

**SPEC-A11Y-WCAG-A-001:** 1.1.1 Non-text Content (textos alternativos)

**SPEC-A11Y-WCAG-A-002:** 2.1.1 Keyboard (acesso por teclado)

**SPEC-A11Y-WCAG-A-003:** 2.1.2 No Keyboard Trap (sem armadilhas de teclado)

**SPEC-A11Y-WCAG-A-004:** 3.1.1 Language of Page (idioma da página)

**SPEC-A11Y-WCAG-A-005:** 4.1.1 Parsing (HTML válido)

**SPEC-A11Y-WCAG-A-006:** 4.1.2 Name, Role, Value (componentes acessíveis)

### Critérios de Sucesso Nível AA

**SPEC-A11Y-WCAG-AA-001:** 1.4.3 Contrast Minimum (contraste 4.5:1)

**SPEC-A11Y-WCAG-AA-002:** 1.4.5 Images of Text (evitar texto em imagens)

**SPEC-A11Y-WCAG-AA-003:** 2.4.5 Multiple Ways (múltiplas formas de navegação)

**SPEC-A11Y-WCAG-AA-004:** 2.4.6 Headings and Labels (headings e labels descritivos)

**SPEC-A11Y-WCAG-AA-005:** 2.4.7 Focus Visible (foco visível)

**SPEC-A11Y-WCAG-AA-006:** 3.1.2 Language of Parts (idioma de partes)

**SPEC-A11Y-WCAG-AA-007:** 3.2.3 Consistent Navigation (navegação consistente)

**SPEC-A11Y-WCAG-AA-008:** 3.2.4 Consistent Identification (identificação consistente)

**SPEC-A11Y-WCAG-AA-009:** 3.3.3 Error Suggestion (sugestões de erro)

**SPEC-A11Y-WCAG-AA-010:** 3.3.4 Error Prevention (prevenção de erros)

---

*Esta especificação define os requisitos de acessibilidade da plataforma. Todos os componentes shadcn/ui já implementam a maioria destes requisitos nativamente.*
