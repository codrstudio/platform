# SPEC-theming.md

## Especificação: Sistema de Temas

### Escopo
Este documento define os requisitos do sistema de temas da plataforma, incluindo tema claro/escuro, brand colors, prefixos por portal e acessibilidade.

---

## 1. Conceitos Fundamentais

### Definições

**SPEC-TH-CO-001:** Sistema de temas gerencia aparência visual da plataforma

**SPEC-TH-CO-002:** Temas DEVEM ser configuráveis por portal

**SPEC-TH-CO-003:** Portais PODEM compartilhar tema usando mesmo `settings-key`

**SPEC-TH-CO-004:** Sistema DEVE suportar tema claro e escuro

**SPEC-TH-CO-005:** Sistema DEVE suportar brand color customizável

### Escopo do Tema

**SPEC-TH-CO-006:** Tema afeta toda a interface do portal

**SPEC-TH-CO-007:** Tema afeta componentes shadcn/ui

**SPEC-TH-CO-008:** Tema afeta módulos ativos no portal

**SPEC-TH-CO-009:** Tema NÃO afeta outros portais (isolamento)

---

## 2. Settings Key

### Conceito

**SPEC-TH-SK-001:** Cada portal DEVE ter uma propriedade `settings-key`

**SPEC-TH-SK-002:** `settings-key` é uma string que prefixará chaves de configuração de tema

**SPEC-TH-SK-003:** Valor padrão DEVE ser `"default"`

**SPEC-TH-SK-004:** `settings-key` DEVE ser configurável por portal

### Compartilhamento de Tema

**SPEC-TH-SK-005:** Portais com mesmo `settings-key` DEVEM compartilhar configurações de tema

**SPEC-TH-SK-006:** Portais com `settings-key` diferentes DEVEM ter temas independentes

**SPEC-TH-SK-007:** Mudança de tema em um portal DEVE afetar todos os portais com mesmo `settings-key`

### Geração de Chaves

**SPEC-TH-SK-008:** Chaves de tema DEVEM usar formato `{settings-key}:{config}`

**SPEC-TH-SK-009:** Exemplo: portal com `settings-key="default"` gera chave `default:theme`

**SPEC-TH-SK-010:** Exemplo: portal com `settings-key="sac"` gera chave `sac:theme`

**SPEC-TH-SK-011:** Chaves diferentes resultam em valores independentes

### Chaves de Configuração

**SPEC-TH-SK-012:** DEVE existir chave `{settings-key}:theme` (valores: "light", "dark", "system")

**SPEC-TH-SK-013:** DEVE existir chave `{settings-key}:brand-color` (valor: cor HEX)

**SPEC-TH-SK-014:** PODE existir outras chaves: `{settings-key}:radius`, `{settings-key}:font`, etc

---

## 3. Tema Claro e Escuro

### Requisitos Básicos

**SPEC-TH-LD-001:** Plataforma DEVE suportar tema claro

**SPEC-TH-LD-002:** Plataforma DEVE suportar tema escuro

**SPEC-TH-LD-003:** Plataforma DEVE suportar modo "system" (segue preferência do SO)

**SPEC-TH-LD-004:** Troca de tema DEVE ser instantânea (sem reload)

### Valores Permitidos

**SPEC-TH-LD-005:** Valor de tema DEVE ser: `"light"`, `"dark"` ou `"system"`

**SPEC-TH-LD-006:** Valor inválido DEVE usar `"system"` como fallback

**SPEC-TH-LD-007:** Tema `"system"` DEVE detectar `prefers-color-scheme` do navegador

### Armazenamento

**SPEC-TH-LD-008:** Preferência de tema DEVE ser armazenada em localStorage

**SPEC-TH-LD-009:** Chave no localStorage DEVE ser `{settings-key}:theme`

**SPEC-TH-LD-010:** Valor DEVE ser sincronizado entre abas (BroadcastChannel ou storage event)

**SPEC-TH-LD-011:** Preferência DEVE persistir entre sessões

### Aplicação do Tema

**SPEC-TH-LD-012:** Tema DEVE ser aplicado via classe CSS no elemento `<html>` ou `<body>`

**SPEC-TH-LD-013:** Classe DEVE ser `"light"` ou `"dark"` (não "system")

**SPEC-TH-LD-014:** Tema "system" DEVE resolver para "light" ou "dark" baseado no SO

**SPEC-TH-LD-015:** Mudança de preferência do SO DEVE atualizar tema automaticamente (se modo "system")

### Detecção do Sistema

**SPEC-TH-LD-016:** DEVE usar `window.matchMedia('(prefers-color-scheme: dark)')`

**SPEC-TH-LD-017:** DEVE escutar evento `change` do media query

**SPEC-TH-LD-018:** Mudança DEVE ser imediata (sem reload)

---

## 4. Brand Color

### Conceito

**SPEC-TH-BC-001:** Brand color é a cor primária da aplicação

**SPEC-TH-BC-002:** Brand color DEVE gerar paleta temática automaticamente

**SPEC-TH-BC-003:** Brand color DEVE ser aplicada a componentes shadcn/ui

**SPEC-TH-BC-004:** Brand color DEVE funcionar em tema claro e escuro

### Formato

**SPEC-TH-BC-005:** Brand color DEVE ser armazenada em formato HSL

**SPEC-TH-BC-006:** Formato: `"hue saturation% lightness%"` (ex: `"221 83% 53%"`)

**SPEC-TH-BC-007:** Frontend PODE aceitar HEX (#rrggbb) e converter para HSL

**SPEC-TH-BC-008:** Armazenamento DEVE usar HSL (facilita manipulação)

### Armazenamento

**SPEC-TH-BC-009:** Brand color DEVE ser armazenada em localStorage

**SPEC-TH-BC-010:** Chave DEVE ser `{settings-key}:brand-color`

**SPEC-TH-BC-011:** Valor DEVE ser string HSL

**SPEC-TH-BC-012:** Valor DEVE persistir entre sessões

### Geração de Paleta

**SPEC-TH-BC-013:** A partir do brand color, DEVE gerar variantes:
- `primary` (base)
- `primary-foreground` (texto sobre primary)

**SPEC-TH-BC-014:** Variantes DEVEM ser calculadas dinamicamente

**SPEC-TH-BC-015:** Algoritmo DEVE garantir contraste adequado (WCAG AA)

**SPEC-TH-BC-016:** Paleta DEVE funcionar em tema claro e escuro

### Aplicação

**SPEC-TH-BC-017:** Brand color DEVE ser aplicada via CSS custom properties

**SPEC-TH-BC-018:** Propriedade DEVE ser `--primary` (HSL values)

**SPEC-TH-BC-019:** shadcn/ui DEVE usar `hsl(var(--primary))`

**SPEC-TH-BC-020:** Mudança de brand color DEVE atualizar instantaneamente

### Valor Padrão

**SPEC-TH-BC-021:** Se não configurado, DEVE usar cor padrão do shadcn/ui

**SPEC-TH-BC-022:** Cor padrão: `"221 83% 53%"` (azul)

---

## 5. Cores Semânticas

### Definição

**SPEC-TH-CS-001:** Cores semânticas comunicam estado ou significado

**SPEC-TH-CS-002:** DEVEM existir as cores: `success`, `warning`, `error`, `info`

**SPEC-TH-CS-003:** Cores semânticas DEVEM funcionar em tema claro e escuro

**SPEC-TH-CS-004:** Cores semânticas NÃO são customizáveis por portal (fixas da plataforma)

### Success

**SPEC-TH-CS-005:** Success indica operação bem-sucedida

**SPEC-TH-CS-006:** Cor base DEVE ser verde

**SPEC-TH-CS-007:** DEVE ter variantes: `success`, `success-foreground`

### Warning

**SPEC-TH-CS-008:** Warning indica atenção necessária

**SPEC-TH-CS-009:** Cor base DEVE ser amarelo/laranja

**SPEC-TH-CS-010:** DEVE ter variantes: `warning`, `warning-foreground`

### Error

**SPEC-TH-CS-011:** Error indica falha ou problema

**SPEC-TH-CS-012:** Cor base DEVE ser vermelho

**SPEC-TH-CS-013:** DEVE ter variantes: `error`, `error-foreground` ou `destructive`, `destructive-foreground`

### Info

**SPEC-TH-CS-014:** Info indica informação neutra

**SPEC-TH-CS-015:** Cor base DEVE ser azul

**SPEC-TH-CS-016:** DEVE ter variantes: `info`, `info-foreground`

### Aplicação

**SPEC-TH-CS-017:** Cores semânticas DEVEM ser CSS custom properties

**SPEC-TH-CS-018:** Exemplo: `--success`, `--success-foreground`

**SPEC-TH-CS-019:** Valores DEVEM ser diferentes para tema claro e escuro

**SPEC-TH-CS-020:** Ícones Lucide DEVEM reforçar semântica visual

---

## 6. Ícones

### Biblioteca

**SPEC-TH-IC-001:** Plataforma DEVE usar Lucide React para ícones

**SPEC-TH-IC-002:** Lucide DEVE ser a ÚNICA biblioteca de ícones

**SPEC-TH-IC-003:** NÃO usar outras bibliotecas (Font Awesome, Material Icons, etc)

### Uso Semântico

**SPEC-TH-IC-004:** Ícones DEVEM reforçar cores semânticas

**SPEC-TH-IC-005:** Success: ícones como `CheckCircle`, `Check`, `ThumbsUp`

**SPEC-TH-IC-006:** Warning: ícones como `AlertTriangle`, `AlertCircle`

**SPEC-TH-IC-007:** Error: ícones como `XCircle`, `AlertOctagon`

**SPEC-TH-IC-008:** Info: ícones como `Info`, `HelpCircle`

### Consistência

**SPEC-TH-IC-009:** Mesmo tipo de ação DEVE usar mesmo ícone

**SPEC-TH-IC-010:** Exemplo: "fechar" sempre usa `X`

**SPEC-TH-IC-011:** Exemplo: "menu" sempre usa `Menu`

**SPEC-TH-IC-012:** Documentação DEVE listar ícones padrão para ações comuns

### Tamanho e Cor

**SPEC-TH-IC-013:** Tamanho padrão DEVE ser 24px (1.5rem)

**SPEC-TH-IC-014:** Tamanho PODE ser ajustado conforme contexto

**SPEC-TH-IC-015:** Cor DEVE herdar do texto (`currentColor`) quando apropriado

**SPEC-TH-IC-016:** Cor PODE ser explícita para reforçar semântica

---

## 7. Acessibilidade

### Contraste

**SPEC-TH-AC-001:** Plataforma DEVE seguir WCAG 2.1 nível AA

**SPEC-TH-AC-002:** Contraste texto normal DEVE ser mínimo 4.5:1

**SPEC-TH-AC-003:** Contraste texto grande (18pt+ ou 14pt+ bold) DEVE ser mínimo 3:1

**SPEC-TH-AC-004:** Contraste elementos de UI (botões, inputs) DEVE ser mínimo 3:1

### Validação de Brand Color

**SPEC-TH-AC-005:** Ao definir brand color, sistema DEVE validar contraste

**SPEC-TH-AC-006:** Se contraste insuficiente, DEVE ajustar lightness automaticamente

**SPEC-TH-AC-007:** Sistema DEVE avisar usuário sobre ajuste

**SPEC-TH-AC-008:** Usuário PODE aceitar ou escolher outra cor

### Focus

**SPEC-TH-AC-009:** Todos os elementos interativos DEVEM ter focus visível

**SPEC-TH-AC-010:** Focus DEVE usar outline ou ring com contraste adequado

**SPEC-TH-AC-011:** Focus DEVE ser consistente em toda a interface

**SPEC-TH-AC-012:** Focus DEVE funcionar em tema claro e escuro

### Navegação por Teclado

**SPEC-TH-AC-013:** Troca de tema DEVE ser acessível via teclado

**SPEC-TH-AC-014:** Dropdown de seleção de tema DEVE ser navegável por tab

**SPEC-TH-AC-015:** Seleção DEVE funcionar com Enter ou Space

### Leitores de Tela

**SPEC-TH-AC-016:** Botão de troca de tema DEVE ter `aria-label` descritivo

**SPEC-TH-AC-017:** Estado atual DEVE ser anunciado (ex: "Tema escuro ativo")

**SPEC-TH-AC-018:** Mudança de tema PODE anunciar novo estado

---

## 8. Componentes shadcn/ui

### Integração

**SPEC-TH-SH-001:** Todos os componentes shadcn/ui DEVEM usar CSS custom properties

**SPEC-TH-SH-002:** Propriedades DEVEM estar definidas em `:root` (tema claro) e `.dark` (tema escuro)

**SPEC-TH-SH-003:** Componentes NÃO DEVEM ter cores hardcoded

**SPEC-TH-SH-004:** Customização DEVE ser via custom properties

### Propriedades Obrigatórias

**SPEC-TH-SH-005:** DEVE existir `--background` (cor de fundo principal)

**SPEC-TH-SH-006:** DEVE existir `--foreground` (cor de texto principal)

**SPEC-TH-SH-007:** DEVE existir `--primary` (brand color)

**SPEC-TH-SH-008:** DEVE existir `--primary-foreground` (texto sobre primary)

**SPEC-TH-SH-009:** DEVE existir `--secondary`, `--secondary-foreground`

**SPEC-TH-SH-010:** DEVE existir `--muted`, `--muted-foreground`

**SPEC-TH-SH-011:** DEVE existir `--accent`, `--accent-foreground`

**SPEC-TH-SH-012:** DEVE existir `--destructive`, `--destructive-foreground`

**SPEC-TH-SH-013:** DEVE existir `--border`, `--input`, `--ring`

**SPEC-TH-SH-014:** DEVE existir `--radius` (border radius padrão)

### Valores

**SPEC-TH-SH-015:** Valores DEVEM ser HSL (sem `hsl()` wrapper)

**SPEC-TH-SH-016:** Exemplo: `--primary: 221 83% 53%;` (não `hsl(221, 83%, 53%)`)

**SPEC-TH-SH-017:** Uso: `background-color: hsl(var(--primary))`

---

## 9. Aplicação de Tema no Portal

### Inicialização

**SPEC-TH-AP-001:** Tema DEVE ser aplicado antes do primeiro render

**SPEC-TH-AP-002:** DEVE ler `settings-key` do portal atual

**SPEC-TH-AP-003:** DEVE ler `{settings-key}:theme` do localStorage

**SPEC-TH-AP-004:** DEVE ler `{settings-key}:brand-color` do localStorage

**SPEC-TH-AP-005:** DEVE aplicar classe de tema no `<html>`

**SPEC-TH-AP-006:** DEVE aplicar custom properties no `:root`

### Mudança de Tema

**SPEC-TH-AP-007:** Usuário DEVE poder trocar tema via componente de UI

**SPEC-TH-AP-008:** Componente PODE ser toggle (light/dark) ou dropdown (light/dark/system)

**SPEC-TH-AP-009:** Mudança DEVE atualizar localStorage

**SPEC-TH-AP-010:** Mudança DEVE atualizar classe CSS imediatamente

**SPEC-TH-AP-011:** Mudança DEVE sincronizar entre abas

### Mudança de Brand Color

**SPEC-TH-AP-012:** Módulo Setup DEVE fornecer color picker

**SPEC-TH-AP-013:** Color picker DEVE mostrar preview em tempo real

**SPEC-TH-AP-014:** Ao salvar, DEVE atualizar localStorage

**SPEC-TH-AP-015:** Ao salvar, DEVE atualizar custom properties

**SPEC-TH-AP-016:** Mudança DEVE sincronizar entre abas

### Context/Provider

**SPEC-TH-AP-017:** Plataforma PODE usar React Context para gerenciar tema

**SPEC-TH-AP-018:** Context PODE incluir: `theme`, `brandColor`, `setTheme()`, `setBrandColor()`

**SPEC-TH-AP-019:** Provider DEVE estar no nível do portal (não global)

**SPEC-TH-AP-020:** Hook `useTheme()` PODE ser fornecido para componentes

---

## 10. Navegação entre Portais

### Isolamento

**SPEC-TH-NP-001:** Cada portal DEVE aplicar seu próprio tema

**SPEC-TH-NP-002:** Navegação para outro portal DEVE carregar tema daquele portal

**SPEC-TH-NP-003:** Se portais compartilham `settings-key`, tema é o mesmo

**SPEC-TH-NP-004:** Se portais têm `settings-key` diferente, temas são independentes

### Transição

**SPEC-TH-NP-005:** Mudança de tema entre portais DEVE ser suave

**SPEC-TH-NP-006:** PODE usar transição CSS para cores (ex: `transition: background-color 0.2s`)

**SPEC-TH-NP-007:** Transição NÃO DEVE causar flash ou piscar

---

## 11. Customização de CSS

### Restrições

**SPEC-TH-CU-001:** Customização de CSS DEVE ser mínima ou zero

**SPEC-TH-CU-002:** Prefira usar componentes shadcn/ui sem modificações

**SPEC-TH-CU-003:** Se customização necessária, usar Tailwind utility classes

**SPEC-TH-CU-004:** Evitar CSS customizado em arquivos `.css`

### Tailwind

**SPEC-TH-CU-005:** Usar apenas utility classes do Tailwind core

**SPEC-TH-CU-006:** NÃO usar classes customizadas que requerem compilação

**SPEC-TH-CU-007:** Classes DEVEM funcionar com tema claro e escuro

**SPEC-TH-CU-008:** Usar prefixo `dark:` para variantes de tema escuro

### Exemplo

**SPEC-TH-CU-009:** Correto: `bg-background text-foreground`

**SPEC-TH-CU-010:** Correto: `dark:bg-gray-800`

**SPEC-TH-CU-011:** Incorreto: classes customizadas não compiladas

---

## 12. Emojis

### Restrição

**SPEC-TH-EM-001:** Emojis NÃO DEVEM ser usados na interface

**SPEC-TH-EM-002:** Exceção: se usuário explicitamente solicitar

**SPEC-TH-EM-003:** Prefira ícones Lucide em vez de emojis

**SPEC-TH-EM-004:** Emojis prejudicam acessibilidade e consistência visual

### Alternativas

**SPEC-TH-EM-005:** Para expressar emoção/estado: usar cores semânticas + ícones

**SPEC-TH-EM-006:** Para categorização: usar ícones descritivos

**SPEC-TH-EM-007:** Para feedback: usar texto + ícone

---

## 13. Performance

### Carregamento Inicial

**SPEC-TH-PE-001:** Tema DEVE ser aplicado antes do primeiro render (evitar flash)

**SPEC-TH-PE-002:** Pode usar script inline no `<head>` para aplicar tema

**SPEC-TH-PE-003:** Script DEVE ser mínimo e rápido

### Transições

**SPEC-TH-PE-004:** Transições de tema DEVEM usar CSS transitions

**SPEC-TH-PE-005:** Transições NÃO DEVEM afetar performance

**SPEC-TH-PE-006:** Duração DEVE ser curta (100-300ms)

**SPEC-TH-PE-007:** Apenas cores essenciais DEVEM ter transição

### Cache

**SPEC-TH-PE-008:** Preferências DEVEM ser cacheadas em localStorage

**SPEC-TH-PE-009:** Leitura DEVE ser síncrona (não esperar fetch)

**SPEC-TH-PE-010:** Escrita PODE ser assíncrona

---

## 14. Módulo Setup - Configuração de Tema

### Interface

**SPEC-TH-MS-001:** Módulo Setup DEVE fornecer interface para configurar tema

**SPEC-TH-MS-002:** DEVE mostrar preview em tempo real

**SPEC-TH-MS-003:** DEVE permitir selecionar tema (light/dark/system)

**SPEC-TH-MS-004:** DEVE permitir escolher brand color

**SPEC-TH-MS-005:** DEVE mostrar como tema ficará em ambos os modos (claro e escuro)

### Configuração por Portal

**SPEC-TH-MS-006:** DEVE permitir configurar `settings-key` do portal

**SPEC-TH-MS-007:** DEVE explicar conceito de `settings-key` (compartilhamento de tema)

**SPEC-TH-MS-008:** DEVE mostrar quais portais compartilham tema

**SPEC-TH-MS-009:** DEVE permitir criar novo `settings-key` (tema independente)

### Validação

**SPEC-TH-MS-010:** DEVE validar contraste ao escolher brand color

**SPEC-TH-MS-011:** DEVE avisar se contraste insuficiente

**SPEC-TH-MS-012:** DEVE sugerir ajuste automático

**SPEC-TH-MS-013:** DEVE permitir usuário aceitar/rejeitar ajuste

---

*Esta especificação define requisitos do sistema de temas. Implementação de módulos, instalação e desenvolvimento em especificações e guias separados.*