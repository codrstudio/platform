# PLAN_WEBPAGE.md - Editor Visual de Páginas com Blocos

**Objetivo**: Implementar um editor visual completo para criação de páginas usando blocos empilháveis com interface split-screen.

---

## 📋 RESUMO EXECUTIVO

### Problemas Identificados
1. ❌ Criação de páginas requer conhecimento técnico
2. ❌ Processo lento de desenvolvimento de landing pages
3. ⚠️ Dificuldade em manter consistência visual

### Solução (Baseada em Padrões)
- ✅ Editor visual drag-and-drop com 46+ tipos de blocos
- ✅ Templates prontos e sistema de publicação draft/publish
- ✅ Interface split-screen com preview em tempo real

---

## 🎯 FASE 1: FUNDAÇÃO DO EDITOR

### 1.1. Setup Inicial do Módulo

- [ ] Criar estrutura base do módulo webpage
- [ ] Configurar manifest.ts com rotas e dependências
- [ ] Implementar registro no ModuleRegistry
- [ ] Configurar lazy loading de componentes

**Leitura de Referência**
- specs/blocks-catalog.md
- specs/data-schema.md

### 1.2. Estrutura de Dados Core

- [ ] Implementar schemas TypeScript (Page, Block, Template)
- [ ] Criar factories para criação de objetos
- [ ] Implementar type guards e validação com Zod
- [ ] Criar sistema de versionamento básico

**Código de Referência**:
```typescript
interface Page {
  id: string;
  instanceId: string;
  blocks: Block[];
  status: PageStatus;
}
```

### 1.3. Preview Básico

- [ ] Criar componente PagePreview
- [ ] Implementar renderização de blocos
  - [ ] BlockRenderer com switch por tipo
  - [ ] Sistema de fallback para blocos desconhecidos
- [ ] Adicionar container responsivo
- [ ] Implementar zoom e viewport controls

### 1.4. Sistema de Blocos Inicial

- [ ] Implementar 5 blocos básicos
  - [ ] Hero Minimal
  - [ ] Text Block
  - [ ] Image Gallery
  - [ ] CTA Section
  - [ ] Spacer
- [ ] Criar BlockDefinition para cada tipo
- [ ] Implementar propriedades editáveis básicas

### 1.5. Testar Fase 1 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Renderização de Página**
  - [ ] Criar página com blocos de teste
  - [ ] Verificar preview renderiza corretamente
  - [ ] ✅ **Verificar**: Todos os 5 blocos aparecem

- [ ] **Teste 2: Responsividade**
  - [ ] Alterar viewport para mobile
  - [ ] ✅ **Resultado**: Layout adapta corretamente

---

## 🎯 FASE 2: EDITOR VISUAL

### 2.1. Interface Split-Screen

- [ ] Implementar layout split com resize
  - [ ] Preview area (60%)
  - [ ] Properties panel (40%)
- [ ] Adicionar header toolbar
- [ ] Implementar status bar
- [ ] Configurar panels colapsáveis

**Leitura de Referência**
- specs/editor-interface.md

### 2.2. Sistema Drag & Drop

- [ ] Implementar drag handles nos blocos
- [ ] Criar ghost element e drop indicators
- [ ] Implementar reordenação de blocos
  - [ ] Visual feedback durante drag
  - [ ] Spring animations no drop
- [ ] Adicionar auto-scroll nas bordas
- [ ] Implementar validação de drop zones

### 2.3. Painel de Propriedades

- [ ] Criar sistema de controles dinâmicos
  - [ ] Text input, Textarea, Select
  - [ ] Color picker, Media picker
  - [ ] Spacing controls visuais
- [ ] Implementar tabs organizadas (Content, Style, Layout)
- [ ] Adicionar validação de campos
- [ ] Criar sistema de grupos colapsáveis

### 2.4. Edição Inline

- [ ] Implementar edição de texto com duplo-clique
- [ ] Criar toolbar flutuante contextual
- [ ] Adicionar edição de imagens inline
- [ ] Implementar atalhos de teclado básicos

### 2.5. Responsividade

- [ ] Implementar device selector
- [ ] Criar sistema de breakpoints
- [ ] Adicionar propriedades por viewport
- [ ] Implementar preview com device frames

### 2.6. Testar Fase 2 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Drag and Drop**
  - [ ] Arrastar bloco para nova posição
  - [ ] Verificar animações funcionam
  - [ ] ✅ **Verificar**: Ordem persiste após drop

- [ ] **Teste 2: Edição de Propriedades**
  - [ ] Selecionar bloco
  - [ ] Alterar propriedades no painel
  - [ ] ✅ **Resultado**: Preview atualiza em tempo real

---

## 🎯 FASE 3: BLOCOS E TEMPLATES

### 3.1. Implementar Blocos Completos

- [ ] Categoria Hero (6 tipos)
  - [ ] Hero Minimal, Background, Device, Split, Gradient, Animated
- [ ] Categoria Conteúdo (5 tipos)
- [ ] Categoria Mídia (6 tipos)
- [ ] Categoria Navegação (3 tipos)
- [ ] Categoria Social (4 tipos)

**Leitura de Referência**
- specs/blocks-catalog.md

### 3.2. Sistema de Templates

- [ ] Implementar template loader
- [ ] Criar 10 templates base
  - [ ] SaaS Landing, Portfolio, E-commerce
  - [ ] Blog, Restaurant, Event
  - [ ] Documentation, Personal, Startup, Course
- [ ] Adicionar template preview
- [ ] Implementar customização wizard

**Leitura de Referência**
- specs/templates.md

### 3.3. Smart Blocks

- [ ] Implementar recomendações contextuais
- [ ] Criar auto-adaptação de blocos
- [ ] Adicionar smart placeholders
- [ ] Implementar sugestões de próximo bloco

### 3.4. Animações e Efeitos

- [ ] Implementar animações de entrada
- [ ] Adicionar scroll-triggered animations
- [ ] Criar hover effects
- [ ] Implementar parallax opcional

### 3.5. Testar Fase 3 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Template Application**
  - [ ] Selecionar template SaaS
  - [ ] Aplicar customização
  - [ ] ✅ **Verificar**: Página criada com todos os blocos

- [ ] **Teste 2: Animações**
  - [ ] Scroll pela página
  - [ ] ✅ **Resultado**: Animações disparam corretamente

---

## 🎯 FASE 4: SISTEMA DRAFT/PUBLISH

### 4.1. Estados de Página

- [ ] Implementar máquina de estados
  - [ ] Draft, Review, Approved, Scheduled, Published, Archived
- [ ] Criar transições entre estados
- [ ] Adicionar validações de estado
- [ ] Implementar UI de status

**Leitura de Referência**
- specs/draft-publish.md

### 4.2. Versionamento

- [ ] Implementar auto-save (30s)
- [ ] Criar sistema de versões numeradas
- [ ] Adicionar checkpoints/savepoints
- [ ] Implementar comparação de versões

### 4.3. Publicação

- [ ] Criar workflow de publicação
- [ ] Implementar preview antes de publicar
- [ ] Adicionar publicação agendada
- [ ] Criar sistema de aprovações

### 4.4. Rollback e Recovery

- [ ] Implementar rollback rápido
- [ ] Criar recovery de emergência
- [ ] Adicionar backup automático
- [ ] Implementar restore de versão

### 4.5. Testar Fase 4 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Draft/Publish Flow**
  - [ ] Editar página em draft
  - [ ] Publicar página
  - [ ] ✅ **Verificar**: Versão publicada não afetada por edições

- [ ] **Teste 2: Versionamento**
  - [ ] Fazer 5 edições com auto-save
  - [ ] Reverter para versão anterior
  - [ ] ✅ **Resultado**: Conteúdo restaurado corretamente

---

## 🎯 FASE 5: FEATURES AVANÇADAS

### 5.1. Design Tokens

- [ ] Implementar sistema de variáveis
  - [ ] Colors, Typography, Spacing
- [ ] Criar token picker no editor
- [ ] Adicionar sincronização de tokens
- [ ] Implementar export/import

### 5.2. A/B Testing

- [ ] Criar sistema de variantes
- [ ] Implementar traffic split
- [ ] Adicionar tracking de métricas
- [ ] Criar análise de resultados

### 5.3. Analytics

- [ ] Implementar tracking automático
- [ ] Criar dashboard de métricas
- [ ] Adicionar heatmaps
- [ ] Integrar Google Analytics

### 5.4. SEO Automático

- [ ] Implementar meta tags automáticas
- [ ] Adicionar schema markup
- [ ] Criar sitemap generation
- [ ] Implementar performance optimization

### 5.5. Export/Import

- [ ] Exportar como HTML/CSS/JS
- [ ] Exportar como React components
- [ ] Importar páginas externas
- [ ] Criar API de integração

### 5.6. Testar Fase 5 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Design Tokens**
  - [ ] Alterar token de cor primária
  - [ ] ✅ **Verificar**: Todas instâncias atualizam

- [ ] **Teste 2: A/B Testing**
  - [ ] Criar variante de página
  - [ ] Configurar split 50/50
  - [ ] ✅ **Resultado**: Métricas coletadas corretamente

---

## 📝 NOTAS DE IMPLEMENTAÇÃO

### Decisões Arquiteturais
- **Renderização**: React com componentes lazy-loaded por tipo de bloco
- **Estado**: Context API para editor state, TanStack Query para data
- **Persistência**: JQEL com schema="backend" para configurações

### Limitações Conhecidas
- **Upload de imagens**: Fase 1 apenas URLs, upload em fase posterior
  - Mitigação: Integração com Unsplash para imagens stock
  - Alternativa futura: Better Upload component

### Referências
- src/frontend/src/modules/webpage/specs/
- spec/components/components.md
- spec/components/components-library.md