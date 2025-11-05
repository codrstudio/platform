# SPEC-routing.md

## Especificação: Sistema de Roteamento

### Escopo
Este documento define os requisitos do sistema de roteamento da plataforma, incluindo estrutura de rotas, prioridades, conflitos e carregamento dinâmico.

---

## 1. Estrutura de Rotas por Portal

### Portal Main

**SPEC-R-PM-001:** Portal "main" DEVE usar a rota raiz (`/`)

**SPEC-R-PM-002:** Portal "main" NÃO PODE ter prefixo de rota

**SPEC-R-PM-003:** Todas as rotas do portal "main" DEVEM ser relativas a `/`

**SPEC-R-PM-004:** Exemplo: módulo no portal "main" cria `/chat`, `/dashboard`, etc

### Outros Portais

**SPEC-R-PO-001:** Portais exceto "main" DEVEM usar rota `/:portalId/*`

**SPEC-R-PO-002:** `:portalId` DEVE ser o identificador único do portal

**SPEC-R-PO-003:** Todas as rotas do portal DEVEM ser relativas a `/:portalId/`

**SPEC-R-PO-004:** Exemplo portal "sac": `/sac/chat`, `/sac/dashboard`, etc

**SPEC-R-PO-005:** Exemplo portal "setup": `/setup`, `/setup/portals`, etc

### Rotas Estáticas da Plataforma

**SPEC-R-PS-001:** DEVE existir rota `/health` para health check

**SPEC-R-PS-002:** DEVE existir rota `/index.html` para página inicial

**SPEC-R-PS-003:** DEVE existir rota `/favicon.ico` para ícone do navegador

**SPEC-R-PS-004:** DEVE existir rota `/assets/*` para recursos estáticos

**SPEC-R-PS-005:** Rotas estáticas NÃO DEVEM conflitar com rotas de portais

---

## 2. Prioridade e Conflitos de Rotas

### Regra de Prioridade

**SPEC-R-PR-001:** Portal "main" DEVE ter prioridade absoluta sobre todos os outros portais

**SPEC-R-PR-002:** Rotas definidas no portal "main" DEVEM sobrescrever rotas de outros portais

**SPEC-R-PR-003:** Entre portais não-main, primeira rota registrada tem prioridade

### Exemplo de Conflito

**SPEC-R-PR-004:** Se portal "main" cria página `/sandbox` E existe portal "sandbox" em `/sandbox`:
- Rota `/sandbox` DEVE exibir página do portal "main"
- Portal "sandbox" fica inacessível via `/sandbox`

**SPEC-R-PR-005:** Configurador DEVE evitar criar rotas no portal "main" que conflitem com IDs de outros portais

### Validação de Conflitos

**SPEC-R-PR-006:** Plataforma NÃO DEVE validar conflitos de rota automaticamente

**SPEC-R-PR-007:** Conflitos de rota são responsabilidade do configurador

**SPEC-R-PR-008:** Erros do React Router DEVEM servir como feedback de conflitos

**SPEC-R-PR-009:** Se há conflito sem erro visível, configurador DEVE ajustar manualmente

### Boas Práticas

**SPEC-R-PR-010:** Portal "main" DEVE evitar rotas que coincidam com IDs de portais

**SPEC-R-PR-011:** Portais DEVEM usar IDs descritivos e únicos

**SPEC-R-PR-012:** Módulos DEVEM usar prefixos consistentes para suas rotas

---

## 3. Registro de Rotas de Módulos

### Comportamento

**SPEC-R-RM-001:** Módulos NÃO DEVEM registrar rotas diretamente no React Router

**SPEC-R-RM-002:** Módulos DEVEM exportar definições de rotas

**SPEC-R-RM-003:** Portais DEVEM carregar e injetar rotas dos módulos ativos

**SPEC-R-RM-004:** Rotas de módulos DEVEM ser relativas (sem prefixo de portal)

### Estrutura de Definição

**SPEC-R-RM-005:** Módulo DEVE exportar array de objetos de rota

**SPEC-R-RM-006:** Cada rota DEVE incluir `path`

**SPEC-R-RM-007:** Cada rota DEVE incluir `component` (React component)

**SPEC-R-RM-008:** Cada rota PODE incluir `requiresAuth` (boolean)

**SPEC-R-RM-009:** Cada rota PODE incluir metadados adicionais

### Exemplo Conceitual

**SPEC-R-RM-010:** Formato de exportação:
```typescript
{
  path: string,
  component: React.ComponentType,
  requiresAuth?: boolean,
  [key: string]: any
}
```

### Injeção no Portal

**SPEC-R-RM-011:** Portal DEVE prefixar rotas de módulos com sua própria rota

**SPEC-R-RM-012:** Módulo exporta `/chat/:id` → Portal "main" injeta como `/chat/:id`

**SPEC-R-RM-013:** Módulo exporta `/chat/:id` → Portal "sac" injeta como `/sac/chat/:id`

**SPEC-R-RM-014:** Injeção DEVE acontecer durante carregamento do portal

---

## 4. Tipos de Rotas por Módulo

### Módulos com Rotas Fixas

**SPEC-R-TM-001:** Alguns módulos criam rotas com estrutura fixa

**SPEC-R-TM-002:** Exemplo: módulo Chat pode criar `/chat/:instanceId`

**SPEC-R-TM-003:** Estrutura de rota é definida pelo módulo

**SPEC-R-TM-004:** Instâncias do módulo DEVEM usar a estrutura definida

### Módulos com Rotas Livres

**SPEC-R-TM-005:** Alguns módulos permitem rotas customizáveis

**SPEC-R-TM-006:** Exemplo: módulo Auth pode criar `/login`, `/signup`, `/forgot-password`

**SPEC-R-TM-007:** Rotas livres DEVEM ser configuráveis por instância

**SPEC-R-TM-008:** Rotas livres DEVEM respeitar prefixo do portal

### Módulos sem Rotas

**SPEC-R-TM-009:** Alguns módulos não exportam rotas

**SPEC-R-TM-010:** Exemplo: módulo Menu apenas exporta componentes

**SPEC-R-TM-011:** Componentes sem rota DEVEM ser disponibilizados globalmente no portal

**SPEC-R-TM-012:** Outros módulos/páginas PODEM importar e usar esses componentes

---

## 5. Camada de Roteamento

### Arquitetura

**SPEC-R-CA-001:** Plataforma DEVE usar React Router como base

**SPEC-R-CA-002:** Plataforma DEVE implementar camada de abstração sobre React Router

**SPEC-R-CA-003:** Camada de abstração DEVE gerenciar rotas de portais

**SPEC-R-CA-004:** Camada de abstração DEVE gerenciar rotas de módulos ativos

### Componentes Principais

**SPEC-R-CA-005:** DEVE existir componente `<BrowserRouter>` na raiz

**SPEC-R-CA-006:** DEVE existir componente `<PortalLoader>` para carregar portais

**SPEC-R-CA-007:** DEVE existir componente `<PortalRouter>` para gerenciar rotas de um portal

**SPEC-R-CA-008:** `<PortalRouter>` DEVE injetar rotas dos módulos ativos

### Estrutura Conceitual

**SPEC-R-CA-009:** Raiz da aplicação:
```typescript
<BrowserRouter>
  <Routes>
    <Route path="/" element={<PortalLoader portalId="main" />} />
    <Route path="/:portalId/*" element={<PortalLoader />} />
  </Routes>
</BrowserRouter>
```

**SPEC-R-CA-010:** PortalRouter gerencia rotas do portal específico

**SPEC-R-CA-011:** PortalRouter carrega módulos ativos do portal

**SPEC-R-CA-012:** PortalRouter injeta rotas dos módulos no React Router

---

## 6. Carregamento Dinâmico de Módulos

### Lazy Loading Inicial

**SPEC-R-LD-001:** Módulos ativos DEVEM ser carregados na abertura do portal

**SPEC-R-LD-002:** Módulos inativos NÃO DEVEM ser carregados

**SPEC-R-LD-003:** Carregamento DEVE usar dynamic import do JavaScript

**SPEC-R-LD-004:** Cada módulo DEVE ser um chunk separado

**SPEC-R-LD-005:** React Router DEVE usar lazy loading para rotas de módulos

### Ativação em Runtime

**SPEC-R-LD-006:** Ativação de módulo DEVE disparar download imediato

**SPEC-R-LD-007:** Download DEVE acontecer em segundo plano

**SPEC-R-LD-008:** Após download, rotas DEVEM estar disponíveis sem reload

**SPEC-R-LD-009:** Componentes do módulo DEVEM estar disponíveis imediatamente

**SPEC-R-LD-010:** Usuário NÃO DEVE precisar recarregar página

**SPEC-R-LD-018:** Service Worker DEVE usar estratégia network-first para HTML para suportar mudanças em runtime

**SPEC-R-LD-019:** HTML em cache DEVE ser usado apenas quando rede não estiver disponível (fallback offline)

### Desativação em Runtime

**SPEC-R-LD-011:** Desativação de módulo NÃO DEVE remover código da memória

**SPEC-R-LD-012:** Instâncias do módulo DEVEM ser desativadas

**SPEC-R-LD-013:** Rotas do módulo DEVEM deixar de funcionar

**SPEC-R-LD-014:** Após refresh, módulo desativado NÃO DEVE ser baixado

### Gestão de Estado

**SPEC-R-LD-015:** Estado de módulos ativos DEVE ser persistido

**SPEC-R-LD-016:** Estado DEVE ser consultado via JQEL

**SPEC-R-LD-017:** Mudança de estado DEVE refletir no próximo carregamento

---

## 7. Registro Dinâmico de Rotas

### Abordagem State-Driven

**SPEC-R-RD-001:** Rotas DEVEM ser renderizadas baseadas em estado React

**SPEC-R-RD-002:** Estado de rotas DEVE ser atualizado quando módulo é ativado/desativado

**SPEC-R-RD-003:** React DEVE re-renderizar `<Routes>` ao atualizar estado

**SPEC-R-RD-004:** Re-render DEVE ser automático via React

### Hook de Gerenciamento

**SPEC-R-RD-005:** DEVE existir hook para gerenciar rotas do portal (ex: `usePortalRoutes`)

**SPEC-R-RD-006:** Hook DEVE retornar lista de rotas ativas

**SPEC-R-RD-007:** Hook DEVE escutar eventos de ativação/desativação de módulos

**SPEC-R-RD-008:** Hook DEVE atualizar lista de rotas dinamicamente

### Registry Opcional

**SPEC-R-RD-009:** Plataforma PODE implementar registry centralizado de rotas

**SPEC-R-RD-010:** Registry facilita debugging e inspeção

**SPEC-R-RD-011:** Registry PODE ser usado para validar conflitos

**SPEC-R-RD-012:** Registry NÃO é obrigatório se abordagem state-driven funcionar bem

---

## 8. Navegação entre Portais

### Links entre Portais

**SPEC-R-NP-001:** Portais PODEM criar links para outros portais

**SPEC-R-NP-002:** Links DEVEM usar componente `<Link>` do React Router

**SPEC-R-NP-003:** Links DEVEM usar path absoluto do portal de destino

**SPEC-R-NP-004:** Exemplo: Portal "main" linka para `/setup`

### Comportamento de Navegação

**SPEC-R-NP-005:** Navegação entre portais DEVE comportar-se como navegação entre páginas

**SPEC-R-NP-006:** Estado do portal anterior NÃO DEVE ser compartilhado

**SPEC-R-NP-007:** Módulos do portal anterior NÃO DEVEM estar acessíveis

**SPEC-R-NP-008:** Portal de destino DEVE carregar seus próprios módulos

### Exceção: Módulos de Autenticação

**SPEC-R-NP-009:** Módulos de autenticação PODEM compartilhar sessão via localStorage

**SPEC-R-NP-010:** Compartilhamento é responsabilidade do módulo, não da plataforma

**SPEC-R-NP-011:** Plataforma NÃO fornece mecanismo de compartilhamento

---

## 9. Rotas Protegidas

### Autenticação

**SPEC-R-RP-001:** Rotas PODEM requerer autenticação

**SPEC-R-RP-002:** Requisito de autenticação DEVE ser declarado na definição da rota

**SPEC-R-RP-003:** Módulo de Auth DEVE fornecer componente de proteção (ex: `<ProtectedRoute>`)

**SPEC-R-RP-004:** Rota protegida sem autenticação DEVE redirecionar para login

### Autorização

**SPEC-R-RP-005:** Rotas PODEM requerer permissões específicas

**SPEC-R-RP-006:** Verificação de permissão DEVE usar Canal de Autenticação (`/api/1/auth/authorize`)

**SPEC-R-RP-007:** Permissão negada DEVE exibir mensagem apropriada

**SPEC-R-RP-008:** Permissão negada PODE redirecionar para página de erro

### Implementação

**SPEC-R-RP-009:** Proteção de rotas é responsabilidade dos módulos

**SPEC-R-RP-010:** Plataforma fornece infraestrutura (Canal de Autenticação)

**SPEC-R-RP-011:** Módulos implementam lógica de proteção

---

## 10. Tratamento de Erros de Rota

### Rota Não Encontrada

**SPEC-R-TE-001:** Rota inexistente DEVE exibir página 404

**SPEC-R-TE-002:** Página 404 DEVE ser customizável por portal

**SPEC-R-TE-003:** Página 404 padrão DEVE existir se portal não customizar

### Erro de Carregamento

**SPEC-R-TE-004:** Erro ao carregar módulo DEVE exibir mensagem apropriada

**SPEC-R-TE-005:** Erro DEVE incluir opção de recarregar

**SPEC-R-TE-006:** Erro DEVE ser logado para debugging

### Fallback

**SPEC-R-TE-007:** React DEVE usar Error Boundary para capturar erros

**SPEC-R-TE-008:** Error Boundary DEVE exibir UI de fallback

**SPEC-R-TE-009:** Fallback DEVE permitir recuperação sem reload completo quando possível

---

## 11. Performance

### Code Splitting

**SPEC-R-PE-001:** Cada módulo DEVE ser um chunk separado

**SPEC-R-PE-002:** Módulos NÃO DEVEM estar no bundle principal

**SPEC-R-PE-003:** Rotas de módulos DEVEM usar React.lazy()

**SPEC-R-PE-004:** Componentes pesados DEVEM usar lazy loading

### Prefetching

**SPEC-R-PE-005:** Plataforma PODE implementar prefetch de módulos prováveis

**SPEC-R-PE-006:** Prefetch DEVE acontecer em idle time

**SPEC-R-PE-007:** Prefetch NÃO DEVE bloquear interações do usuário

### Caching

**SPEC-R-PE-008:** Módulos carregados DEVEM ser cacheados pelo navegador

**SPEC-R-PE-009:** Service Worker DEVE cachear módulos (PWA)

**SPEC-R-PE-010:** Cache DEVE ser invalidado em nova versão da aplicação

---

## 12. Desenvolvimento e Debug

### Inspeção de Rotas

**SPEC-R-DD-001:** Em modo desenvolvimento, rotas ativas DEVEM ser inspecionáveis

**SPEC-R-DD-002:** Console PODE exibir log de rotas carregadas

**SPEC-R-DD-003:** DevTools PODE mostrar árvore de rotas

### Hot Reload

**SPEC-R-DD-004:** Mudanças em módulos DEVEM recarregar via hot reload (Vite)

**SPEC-R-DD-005:** Hot reload NÃO DEVE perder estado da aplicação quando possível

**SPEC-R-DD-006:** Hot reload de rotas DEVE atualizar React Router

---

*Esta especificação define requisitos do sistema de roteamento. Implementação de autenticação, eventos e configurações em especificações separadas.*