# SPEC-architecture.md

## Especificação: Arquitetura da Plataforma

### Escopo
Este documento define os requisitos arquiteturais da plataforma, incluindo stack tecnológico obrigatório, camadas de sistema e decisões de design.

---

## 1. Arquitetura em Três Camadas

### Definição

**SPEC-A-L-001:** A plataforma DEVE ser implementada em três camadas distintas

**SPEC-A-L-002:** As três camadas DEVEM ser: Frontend, Backend e Backbone

**SPEC-A-L-003:** Cada camada DEVE ter responsabilidades claramente definidas

### Camada Frontend

**SPEC-A-L-004:** O Frontend DEVE ser implementado como Single Page Application (SPA)

**SPEC-A-L-005:** O Frontend DEVE gerenciar rotas da aplicação

**SPEC-A-L-006:** O Frontend DEVE gerenciar carregamento de módulos

**SPEC-A-L-007:** O Frontend DEVE gerenciar estado da aplicação

**SPEC-A-L-008:** O Frontend DEVE renderizar interface de usuário

**SPEC-A-L-009:** O Frontend NÃO DEVE conter lógica de negócio complexa

**SPEC-A-L-010:** O Frontend NÃO DEVE acessar bancos de dados diretamente

### Camada Backend

**SPEC-A-L-011:** O Backend DEVE atuar como proxy entre Frontend e Backbone

**SPEC-A-L-012:** O Backend DEVE validar requisições do Frontend

**SPEC-A-L-013:** O Backend DEVE autenticar requisições do Frontend

**SPEC-A-L-014:** O Backend DEVE rotear requisições para o Backbone

**SPEC-A-L-015:** O Backend PODE executar operações de controle simples

**SPEC-A-L-016:** O Backend NÃO DEVE conter lógica de negócio da aplicação

**SPEC-A-L-017:** O Backend NÃO DEVE acessar bancos de dados da aplicação diretamente

### Camada Backbone

**SPEC-A-L-018:** O Backbone DEVE conter toda a lógica de negócio

**SPEC-A-L-019:** O Backbone DEVE processar workflows e automações

**SPEC-A-L-020:** O Backbone DEVE gerenciar acesso a dados

**SPEC-A-L-021:** O Backbone DEVE integrar com sistemas externos

**SPEC-A-L-022:** O Backbone DEVE processar autenticação e autorização

---

## 2. Stack Tecnológico Obrigatório

### Frontend

**SPEC-A-S-001:** O Frontend DEVE usar React versão 19 ou superior

**SPEC-A-S-002:** O Frontend DEVE usar Vite como build tool

**SPEC-A-S-003:** O Frontend DEVE usar TypeScript

**SPEC-A-S-004:** O Frontend DEVE usar React Router para roteamento

**SPEC-A-S-005:** O Frontend DEVE usar Tailwind CSS para estilização

**SPEC-A-S-006:** O Frontend DEVE usar shadcn/ui como biblioteca de componentes base

**SPEC-A-S-007:** O Frontend DEVE usar React Hook Form para formulários

**SPEC-A-S-008:** O Frontend DEVE usar Zod para validação de schemas

**SPEC-A-S-009:** O Frontend DEVE usar TanStack Query para gerenciamento de estado assíncrono

**SPEC-A-S-010:** O Frontend DEVE usar Lucide React para ícones

**SPEC-A-S-011:** O Frontend NÃO DEVE usar outras bibliotecas de UI além de shadcn/ui

**SPEC-A-S-012:** O Frontend NÃO DEVE usar CSS customizado extensivamente

**SPEC-A-S-013:** Customização de CSS DEVE ser mínima ou zero

### Backend

**SPEC-A-S-014:** O Backend DEVE usar Node.js

**SPEC-A-S-015:** O Backend DEVE usar Express.js

**SPEC-A-S-016:** O Backend PODE usar TypeScript (recomendado)

### Backbone

**SPEC-A-S-017:** O Backbone DEVE usar n8n como plataforma de automação

**SPEC-A-S-018:** O Backbone DEVE estar acessível via HTTP/HTTPS

### Infraestrutura

**SPEC-A-S-019:** A plataforma DEVE usar Redis para Pub/Sub

**SPEC-A-S-020:** A plataforma DEVE usar Redis Streams para buffer de eventos

**SPEC-A-S-021:** A plataforma PODE usar Redis para cache (opcional)

**SPEC-A-S-022:** A plataforma DEVE usar BullMQ para processamento assíncrono de tarefas

**SPEC-A-S-023:** BullMQ DEVE usar a mesma infraestrutura Redis

---

## 3. Sistema de Filas (Queue System)

### Requisitos Obrigatórios

**SPEC-A-Q-001:** Backend DEVE usar BullMQ para processamento assíncrono de tarefas

**SPEC-A-Q-002:** Sistema de filas DEVE usar Redis como message broker

**SPEC-A-Q-003:** Sistema DEVE definir filas separadas por domínio funcional

**SPEC-A-Q-004:** Workers DEVEM rodar em processos separados do servidor API

**SPEC-A-Q-005:** Jobs DEVEM ter configuração de retry com backoff exponencial

### Retenção e Limpeza

**SPEC-A-Q-006:** Jobs completados DEVEM ser retidos por no mínimo 100 execuções

**SPEC-A-Q-007:** Jobs falhados DEVEM ser retidos por no mínimo 500 execuções

**SPEC-A-Q-008:** Jobs antigos DEVEM ser removidos automaticamente após retenção

### Monitoramento

**SPEC-A-Q-009:** Sistema DEVE fornecer UI de monitoramento via BullBoard

**SPEC-A-Q-010:** UI de monitoramento DEVE ser protegida por autenticação

**SPEC-A-Q-011:** Monitoramento DEVE ser acessível em rota administrativa (ex: /admin/queues)

### Integração com Backbone

**SPEC-A-Q-012:** Backbone (n8n) PODE adicionar jobs às filas via nodo BullMQ

**SPEC-A-Q-013:** Workers PODEM chamar webhooks n8n para processar lógica de negócio

**SPEC-A-Q-014:** Jobs NÃO DEVEM conter lógica de negócio complexa (delegada ao Backbone)

---

## 4. Progressive Web App (PWA)

### Requisitos Obrigatórios

**SPEC-A-PWA-001:** A plataforma DEVE ser uma Progressive Web App (PWA)

**SPEC-A-PWA-002:** A plataforma DEVE incluir um Service Worker

**SPEC-A-PWA-003:** A plataforma DEVE incluir um Web App Manifest

**SPEC-A-PWA-004:** A plataforma DEVE ser instalável em dispositivos

**SPEC-A-PWA-005:** A plataforma DEVE funcionar offline (quando possível)

**SPEC-A-PWA-006:** A plataforma DEVE exibir fallback apropriado quando offline

**SPEC-A-PWA-007:** A plataforma DEVE cachear assets estáticos (JS, CSS, imagens)

**SPEC-A-PWA-008:** A plataforma DEVE usar estratégia cache-first para assets

**SPEC-A-PWA-009:** A plataforma DEVE usar estratégia network-first para dados

**SPEC-A-PWA-010:** A plataforma DEVE sincronizar dados quando voltar online

### Manifest

**SPEC-A-PWA-011:** O Web App Manifest DEVE incluir `name`

**SPEC-A-PWA-012:** O Web App Manifest DEVE incluir `short_name`

**SPEC-A-PWA-013:** O Web App Manifest DEVE incluir `icons` (múltiplos tamanhos)

**SPEC-A-PWA-014:** O Web App Manifest DEVE incluir `start_url`

**SPEC-A-PWA-015:** O Web App Manifest DEVE incluir `display: "standalone"`

**SPEC-A-PWA-016:** O Web App Manifest DEVE incluir `theme_color`

**SPEC-A-PWA-017:** O Web App Manifest DEVE incluir `background_color`

### Service Worker

**SPEC-A-PWA-018:** O Service Worker DEVE ser registrado na inicialização

**SPEC-A-PWA-019:** O Service Worker DEVE interceptar requisições de rede

**SPEC-A-PWA-020:** O Service Worker DEVE cachear módulos carregados

**SPEC-A-PWA-021:** O Service Worker DEVE atualizar automaticamente quando nova versão disponível

**SPEC-A-PWA-022:** O Service Worker NÃO DEVE cachear dados sensíveis

### Estratégia de Cache HTML

**SPEC-A-PWA-023:** Requisições de navegação HTML DEVEM usar estratégia network-first

**SPEC-A-PWA-024:** Arquivos HTML (`/`, `/index.html`) NÃO DEVEM ser incluídos no precache do Service Worker

**SPEC-A-PWA-025:** Service Worker DEVE detectar requisições de navegação (`request.mode === 'navigate'`)

**SPEC-A-PWA-026:** Requisições de navegação DEVEM buscar da rede primeiro, usando cache apenas como fallback offline

**SPEC-A-PWA-027:** Backend DEVE definir header `Cache-Control: no-cache` para respostas HTML

**SPEC-A-PWA-028:** Assets estáticos (JS, CSS, imagens, fontes) DEVEM continuar usando estratégia cache-first

**SPEC-A-PWA-029:** Assets com hash de conteúdo no filename PODEM usar `Cache-Control: immutable`

### Justificativa

HTML usa network-first para garantir que:
1. Mudanças na configuração de portais/módulos sejam imediatamente refletidas
2. Ativação de módulos em runtime funcione sem reload de página
3. Usuários sempre recebam a estrutura de rotas e navegação atual
4. Funcionalidade offline seja preservada via fallback de cache

Esta abordagem alinha-se com SPEC-A-PWA-009 (network-first para dados), pois o conteúdo HTML depende de dados de configuração dinâmicos.

---

## 5. Responsividade

### Requisitos Gerais

**SPEC-A-R-001:** A plataforma DEVE ser totalmente responsiva

**SPEC-A-R-002:** A plataforma DEVE funcionar em dispositivos móveis (smartphones)

**SPEC-A-R-003:** A plataforma DEVE funcionar em tablets

**SPEC-A-R-004:** A plataforma DEVE funcionar em desktops

**SPEC-A-R-005:** A plataforma DEVE funcionar em telas de alta resolução (4K+)

### Breakpoints

**SPEC-A-R-006:** A plataforma DEVE usar breakpoints padrão do Tailwind CSS

**SPEC-A-R-007:** Mobile: `< 640px` (sm)

**SPEC-A-R-008:** Tablet: `640px - 1024px` (sm a lg)

**SPEC-A-R-009:** Desktop: `> 1024px` (lg+)

### Comportamento por Dispositivo

**SPEC-A-R-010:** Em mobile, menus DEVEM ser colapsáveis

**SPEC-A-R-011:** Em mobile, navegação DEVE ser otimizada para toque

**SPEC-A-R-012:** Em mobile, formulários DEVEM ter inputs apropriados (tel, email, etc)

**SPEC-A-R-013:** Em tablet, layout PODE usar versão híbrida mobile/desktop

**SPEC-A-R-014:** Em desktop, layout DEVE aproveitar espaço horizontal

**SPEC-A-R-015:** Todas as interações DEVEM funcionar tanto com mouse quanto com toque

### Touch e Gestos

**SPEC-A-R-016:** A plataforma DEVE suportar interações por toque

**SPEC-A-R-017:** Botões e links DEVEM ter área de toque mínima de 44x44px

**SPEC-A-R-018:** Gestos de swipe PODEM ser implementados onde apropriado

**SPEC-A-R-019:** Pinch-to-zoom DEVE ser desabilitado na interface (permitir apenas em conteúdo)

---

## 6. Componentes Especializados

### Estrutura de Módulos de Componentes

**SPEC-A-C-001:** Componentes especializados DEVEM ser fornecidos via módulos

**SPEC-A-C-002:** Componentes especializados NÃO DEVEM ser globais por padrão

**SPEC-A-C-003:** A plataforma DEVE fornecer três módulos de componentes: App, Media, Export

**SPEC-A-C-004:** Módulos de componentes DEVEM ser ativados como qualquer outro módulo

**SPEC-A-C-005:** Componentes DEVEM estar disponíveis globalmente após ativação do módulo no portal

### Módulo App Components

**SPEC-A-C-006:** O módulo App Components DEVE incluir TanStack Table

**SPEC-A-C-007:** O módulo App Components DEVE incluir Recharts

**SPEC-A-C-008:** O módulo App Components DEVE incluir FullCalendar

**SPEC-A-C-009:** O módulo App Components DEVE incluir @dnd-kit

**SPEC-A-C-010:** O módulo App Components DEVE incluir TipTap

**SPEC-A-C-011:** O módulo App Components DEVE incluir react-dropzone

**SPEC-A-C-012:** O módulo App Components DEVE incluir @tanstack/react-virtual

**SPEC-A-C-013:** O módulo App Components DEVE incluir react-colorful

**SPEC-A-C-014:** O módulo App Components PODE incluir outras bibliotecas relacionadas

### Módulo Media Components

**SPEC-A-C-015:** O módulo Media Components DEVE incluir react-markdown

**SPEC-A-C-016:** O módulo Media Components DEVE incluir react-pdf

**SPEC-A-C-017:** O módulo Media Components DEVE incluir Mermaid

**SPEC-A-C-018:** O módulo Media Components DEVE incluir Prism.js ou highlight.js

**SPEC-A-C-019:** O módulo Media Components DEVE incluir react-player

**SPEC-A-C-020:** O módulo Media Components DEVE incluir wavesurfer.js

**SPEC-A-C-021:** O módulo Media Components DEVE incluir Papa Parse (para leitura)

**SPEC-A-C-022:** O módulo Media Components PODE incluir outras bibliotecas relacionadas

### Módulo Export Components

**SPEC-A-C-023:** O módulo Export Components DEVE incluir pdfmake

**SPEC-A-C-024:** O módulo Export Components DEVE incluir docx.js

**SPEC-A-C-025:** O módulo Export Components DEVE incluir Papa Parse (para exportação)

**SPEC-A-C-026:** O módulo Export Components DEVE incluir file-saver ou downloadjs

**SPEC-A-C-027:** O módulo Export Components PODE incluir outras bibliotecas relacionadas

**SPEC-A-C-028:** Todas as exportações DEVEM ser processadas no frontend (sem backend)

---

## 7. Acesso a Dados

### JQEL como Padrão

**SPEC-A-D-001:** Todo acesso a dados DEVE usar JQEL

**SPEC-A-D-002:** JQEL DEVE ser a única linguagem de consulta suportada

**SPEC-A-D-003:** JQEL DEVE ser encapsulado via TanStack Query

**SPEC-A-D-004:** Queries JQEL DEVEM ser enviadas via POST para `/api/jqel`

**SPEC-A-D-005:** O Frontend NÃO DEVE acessar dados por outros meios além de JQEL

### Schemas Reservados

**SPEC-A-D-006:** A plataforma DEVE reservar três schemas JQEL: `platform`, `backend`, `system`

**SPEC-A-D-007:** Schema `platform` DEVE ser repassado ao Backbone (n8n) para processamento

**SPEC-A-D-008:** Schema `backend` DEVE ser processado pelo Backend (Express)

**SPEC-A-D-009:** Schema `system` DEVE ser processado conforme configuração da aplicação

**SPEC-A-D-010:** Schemas não listados DEVEM ser considerados schemas da aplicação

**SPEC-A-D-011:** Módulos NÃO DEVEM usar schemas reservados sem justificativa

---

## 8. Persistência de Configurações

### Armazenamento

**SPEC-A-P-001:** Configurações de portais, módulos e instâncias DEVEM ser persistidas

**SPEC-A-P-002:** Configurações PODEM ser armazenadas em um ou múltiplos arquivos JSON

**SPEC-A-P-003:** Configurações DEVEM ser acessadas exclusivamente via JQEL

**SPEC-A-P-004:** Configurações NÃO DEVEM ser acessadas diretamente via filesystem pelo Frontend

**SPEC-A-P-005:** Configurações DEVEM estar sob o schema `backend` ou `system`

### Localização

**SPEC-A-P-006:** Arquivos de configuração DEVEM estar no servidor (Backend)

**SPEC-A-P-007:** Arquivos de configuração NÃO DEVEM estar no Frontend

**SPEC-A-P-008:** Arquivos de configuração PODEM estar em `/config` no Backend

---

## 9. Lazy Loading

### Requisitos de Carregamento

**SPEC-A-LL-001:** A plataforma DEVE implementar lazy loading de módulos

**SPEC-A-LL-002:** Apenas módulos ativos DEVEM ser carregados

**SPEC-A-LL-003:** Módulos inativos NÃO DEVEM ser baixados

**SPEC-A-LL-004:** Módulos DEVEM ser carregados sob demanda (code splitting)

**SPEC-A-LL-005:** Rotas de módulos DEVEM usar lazy loading do React

### Performance

**SPEC-A-LL-006:** Landing page simples DEVE carregar em menos de 1 segundo (3G)

**SPEC-A-LL-007:** Bundle inicial DEVE ter menos de 200KB (gzipped)

**SPEC-A-LL-008:** Módulos DEVEM ser divididos em chunks separados

**SPEC-A-LL-009:** Chunks de módulos NÃO DEVEM exceder 500KB (gzipped) cada

**SPEC-A-LL-010:** A plataforma DEVE usar tree-shaking para eliminar código não usado

---

## 10. Visual e Temas

### Tema Claro/Escuro

**SPEC-A-V-001:** A plataforma DEVE suportar tema claro e escuro

**SPEC-A-V-002:** Tema DEVE ser configurável por portal via `settings-key`

**SPEC-A-V-003:** Tema DEVE ser persistido no localStorage do navegador

**SPEC-A-V-004:** Tema DEVE respeitar preferência do sistema operacional (prefers-color-scheme)

**SPEC-A-V-005:** Troca de tema DEVE ser instantânea (sem reload)

### Brand Color

**SPEC-A-V-006:** Cada portal DEVE suportar brand color customizável

**SPEC-A-V-007:** Brand color DEVE gerar paleta temática automaticamente

**SPEC-A-V-008:** Brand color DEVE ser aplicada a componentes shadcn/ui

**SPEC-A-V-009:** Brand color DEVE respeitar contraste mínimo WCAG AA

### Cores Semânticas

**SPEC-A-V-010:** A plataforma DEVE usar cores semânticas: success, warning, error, info

**SPEC-A-V-011:** Cores semânticas DEVEM funcionar em tema claro e escuro

**SPEC-A-V-012:** Ícones Lucide DEVEM ser usados para reforçar semântica visual

### Acessibilidade

**SPEC-A-V-013:** A plataforma DEVE seguir padrões WCAG 2.1 nível AA

**SPEC-A-V-014:** Contraste de texto DEVE ser mínimo 4.5:1 (texto normal)

**SPEC-A-V-015:** Contraste de texto DEVE ser mínimo 3:1 (texto grande)

**SPEC-A-V-016:** Todos os elementos interativos DEVEM ser acessíveis via teclado

**SPEC-A-V-017:** Focus DEVE ser visualmente claro

**SPEC-A-V-018:** Emojis NÃO DEVEM ser usados (exceto se explicitamente solicitado)

---

## 11. Configurações Opcionais do Frontend

### Arquivo /config/*.json

**SPEC-A-CF-001:** O Frontend PODE ter arquivos de configuração em `/config/*.json`

**SPEC-A-CF-002:** Configurações em `/config/*.json` SÃO para a plataforma React, NÃO para portais/módulos

**SPEC-A-CF-003:** Configurações de portais/módulos/instâncias DEVEM usar JQEL, NÃO `/config/*.json`

**SPEC-A-CF-004:** Exemplos válidos: acessibilidade, preferências de UI da plataforma

**SPEC-A-CF-005:** Arquivos em `/config/*.json` PODEM não existir se não forem necessários

---

*Esta especificação define requisitos arquiteturais. Implementação de canais, rotas e autenticação em especificações separadas.*