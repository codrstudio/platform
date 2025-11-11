# PLAN_SETUP.md - Redesign da Página PortalEdit

**Objetivo**: Transformar a página `/setup/portals/:portalId` de um formulário simples para um dashboard completo de configuração do portal, melhorando a experiência do usuário com layout de 3 colunas e componentes shadcn/ui.

---

## 📋 RESUMO EXECUTIVO

### Problemas Identificados
1. ❌ **Falta de Contexto Visual**: Não mostra status do portal (módulos ativos, instâncias, tema aplicado, proteção)
2. ❌ **Hierarquia Visual Confusa**: Formulário e links de navegação têm mesmo peso visual, página não parece um "hub"
3. ❌ **Fluxo Não Otimizado**: Usuário precisa salvar antes de navegar, sem indicação de progresso de configuração
4. ⚠️ **Informações Limitadas**: Campo "removable" não visível, sem rota, sem metadados de auditoria, sem validação visual

### Solução (Baseada em Padrões)
- ✅ **Layout de 3 Colunas**: Sidebar esquerda (status/navegação), área principal (formulário/preview), contexto direita (estatísticas/ações)
- ✅ **Componentes Shadcn/UI**: Tabs, Avatar, Badge, HoverCard, Tooltip, Alert, Switch para rica experiência visual
- ✅ **Dashboard Approach**: Transformar em hub central com navegação rápida, validação em tempo real e preview integrado

---

## 🎯 FASE 1: ESTRUTURA BASE

### 1.1. Criar Estrutura de Arquivos

- [ ] Criar diretório `src/frontend/src/modules/setup/pages/PortalEdit/`
- [ ] Criar `index.tsx` (componente principal)
- [ ] Criar `PortalEditSidebar.tsx` (sidebar esquerda)
- [ ] Criar `PortalEditForm.tsx` (tab de configurações)
- [ ] Criar `PortalEditPreview.tsx` (tab de preview)
- [ ] Criar `PortalEditContext.tsx` (sidebar direita)
- [ ] Criar `types.ts` (tipos locais)
- [ ] ✅ **Checkpoint**: Estrutura de arquivos criada

**Leitura de Referência**:
- `spec/ui/setup-module-interfaces.md` - Seção 4 (Criar/Editar Portal)
- `spec/components/components-guide.md` - Componentes shadcn/ui disponíveis

### 1.2. Implementar Layout de 3 Colunas Responsivo

- [ ] Criar grid CSS responsivo no `index.tsx`
  - [ ] Desktop (>1024px): 3 colunas (280px | flex-1 | 320px)
  - [ ] Tablet (768-1024px): 2 colunas (drawer + principal 60% + contexto 40%)
  - [ ] Mobile (<768px): Stack vertical + Sheet para sidebar
- [ ] Importar componentes: `Card`, `ScrollArea`, `Separator`
- [ ] Implementar skeleton loaders para cada seção
- [ ] ✅ **Checkpoint**: Layout responsivo renderiza corretamente

**Código de Referência**:
```typescript
// index.tsx
<div className="container mx-auto p-6">
  <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-6">
    <PortalEditSidebar portal={portal} />
    <PortalEditForm portal={portal} />
    <PortalEditContext portal={portal} />
  </div>
</div>
```

### 1.3. Migrar Formulário Atual para Nova Estrutura

- [ ] Mover formulário de `PortalEdit.tsx` para `PortalEditForm.tsx`
- [ ] Implementar Tabs com `TabsList`, `TabsTrigger`, `TabsContent`
  - [ ] Tab "Configurações" (formulário atual)
  - [ ] Tab "Preview" (placeholder por enquanto)
- [ ] Manter funcionalidade atual: nome, descrição, realm, botões salvar/cancelar
- [ ] Testar que salvar/cancelar continua funcionando
- [ ] ✅ **Checkpoint**: Formulário migrado e funcional

### 1.4. Testar Fase 1 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Layout Responsivo**
  - [ ] Abrir página em desktop (>1024px)
  - [ ] Verificar 3 colunas visíveis
  - [ ] Redimensionar para tablet (768-1024px)
  - [ ] Verificar sidebar vira drawer
  - [ ] Redimensionar para mobile (<768px)
  - [ ] ✅ **Verificar**: Layout stack vertical funciona

- [ ] **Teste 2: Formulário Funcional**
  - [ ] Editar campo "Nome"
  - [ ] Editar campo "Descrição"
  - [ ] Trocar "Ambiente"
  - [ ] Clicar "Salvar Alterações"
  - [ ] ✅ **Resultado**: Portal atualizado com sucesso

**✅ CHECKPOINT FASE 1**: Layout de 3 colunas responsivo criado, formulário migrado e funcional

---

## 🎯 FASE 2: SIDEBAR ESQUERDA - STATUS E NAVEGAÇÃO

### 2.1. Implementar Status do Portal

- [ ] Adicionar componente `Avatar` para ícone do portal
  - [ ] Fallback com iniciais do nome do portal
- [ ] Adicionar `Badge` para status "Ativo/Inativo"
- [ ] Adicionar `Badge` "Protegido" se `removable = false`
- [ ] Exibir nome do portal como título
- [ ] ✅ **Checkpoint**: Status visual do portal exibido

**Código de Referência**:
```typescript
<div className="flex items-center gap-3 mb-4">
  <Avatar>
    <AvatarFallback>{portal.name.substring(0,2).toUpperCase()}</AvatarFallback>
  </Avatar>
  <div>
    <h3 className="font-semibold">{portal.name}</h3>
    <div className="flex gap-1">
      <Badge variant="outline">Ativo</Badge>
      {!portal.removable && <Badge variant="secondary">Protegido</Badge>}
    </div>
  </div>
</div>
```

### 2.2. Implementar Navegação Rápida

- [ ] Criar lista de links de navegação
  - [ ] "Configurações" (tab atual)
  - [ ] "Tema do Portal" → `/setup/portals/:portalId/theme`
  - [ ] "Módulos Ativos" → `/setup/portals/:portalId/modules`
- [ ] Usar `Button` com `variant="ghost"` para cada link
- [ ] Destacar link da seção atual
- [ ] ✅ **Checkpoint**: Navegação rápida funcional

### 2.3. Implementar Validação Visual

- [ ] Criar hook `usePortalValidation.ts`
  - [ ] Validar nome não vazio
  - [ ] Validar realm válido
  - [ ] Retornar array de erros
- [ ] Exibir `Alert` com lista de erros (se houver)
- [ ] Exibir ícone ✓ "Tudo OK" se validação passar
- [ ] ✅ **Checkpoint**: Validação visual implementada

### 2.4. Testar Fase 2 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Status Visual**
  - [ ] Verificar avatar com iniciais corretas
  - [ ] Verificar badge "Ativo"
  - [ ] Editar portal "main" (removable=false)
  - [ ] ✅ **Verificar**: Badge "Protegido" aparece

- [ ] **Teste 2: Validação**
  - [ ] Limpar campo "Nome"
  - [ ] ✅ **Verificar**: Alert mostra "Nome vazio"
  - [ ] Preencher nome
  - [ ] ✅ **Verificar**: Alert desaparece, mostra "✓ Tudo OK"

**✅ CHECKPOINT FASE 2**: Sidebar esquerda com status, navegação e validação implementada

---

## 🎯 FASE 3: SIDEBAR DIREITA - CONTEXTO E AÇÕES

### 3.1. Implementar Estatísticas

- [ ] Buscar contagem de módulos ativos via `useModules(portalId)`
- [ ] Buscar contagem de instâncias via `useInstances(portalId)`
- [ ] Exibir em `Card` com `Badge` para contadores
- [ ] Adicionar links para ver módulos/instâncias
- [ ] ✅ **Checkpoint**: Estatísticas exibidas

**Código de Referência**:
```typescript
<Card>
  <CardHeader>
    <CardTitle className="text-sm">Informações Rápidas</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">Módulos Ativos</span>
      <Badge variant="secondary">{moduleCount}</Badge>
    </div>
    <Button variant="link" size="sm" onClick={() => navigate(`/setup/portals/${portalId}/modules`)}>
      Ver Módulos →
    </Button>
  </CardContent>
</Card>
```

### 3.2. Implementar Metadados de Auditoria

- [ ] Exibir campo `createdAt` (se existir no portal)
- [ ] Exibir campo `updatedAt` com formato relativo ("há 2 horas")
- [ ] Exibir usuário da última modificação (se disponível)
- [ ] Usar componente `Item` para lista key-value
- [ ] ✅ **Checkpoint**: Metadados visíveis

### 3.3. Implementar Ações Rápidas

- [ ] Adicionar botão "Duplicar Portal" (placeholder por enquanto)
- [ ] Adicionar botão "Exportar Config" (placeholder por enquanto)
- [ ] Adicionar `Separator`
- [ ] Adicionar botão "Remover Portal" (`variant="destructive"`)
  - [ ] Disabled se `removable = false`
  - [ ] Modal de confirmação antes de remover
- [ ] ✅ **Checkpoint**: Ações rápidas implementadas

### 3.4. Testar Fase 3 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Estatísticas**
  - [ ] Verificar contadores de módulos/instâncias corretos
  - [ ] Clicar "Ver Módulos →"
  - [ ] ✅ **Verificar**: Navega para página de módulos

- [ ] **Teste 2: Ações**
  - [ ] Portal removível: verificar botão "Remover" enabled
  - [ ] Portal protegido: verificar botão "Remover" disabled
  - [ ] ✅ **Verificar**: Tooltip explica por que está disabled

**✅ CHECKPOINT FASE 3**: Sidebar direita com estatísticas, metadados e ações implementada

---

## 🎯 FASE 4: TAB DE PREVIEW

### 4.1. Buscar Dados do Tema

- [ ] Criar query para buscar tema do realm via `useTheme(realmId)`
- [ ] Extrair `brandColor`, `themeMode` do realm
- [ ] Criar estado local para preview
- [ ] ✅ **Checkpoint**: Dados do tema carregados

### 4.2. Implementar Preview Mockup

- [ ] Instalar/importar componente `Browser` (eldoraui)
- [ ] Criar preview simples do portal
  - [ ] Header com nome do portal
  - [ ] Aplicar `brandColor` no background
  - [ ] Botões de exemplo com tema aplicado
- [ ] Exibir badges com configurações do tema
  - [ ] Theme mode (light/dark/system)
  - [ ] Brand color (código hex)
- [ ] ✅ **Checkpoint**: Preview visual funcional

**Código de Referência**:
```typescript
<TabsContent value="preview">
  <Card>
    <CardHeader>
      <CardTitle>Preview do Portal</CardTitle>
    </CardHeader>
    <CardContent>
      <Browser>
        <div className="p-6" style={{ backgroundColor: theme.brandColor }}>
          <h1 className="text-2xl font-bold text-white">{portal.name}</h1>
          <div className="mt-4 space-x-2">
            <Button>Botão Primário</Button>
            <Button variant="secondary">Botão Secundário</Button>
          </div>
        </div>
      </Browser>
      <div className="mt-4 flex gap-2">
        <Badge>Modo: {theme.themeMode}</Badge>
        <Badge>Cor: {theme.brandColor}</Badge>
      </div>
      <Button variant="link" onClick={() => navigate(`/setup/portals/${portalId}/theme`)}>
        Editar Tema →
      </Button>
    </CardContent>
  </Card>
</TabsContent>
```

### 4.3. Testar Fase 4 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Preview**
  - [ ] Clicar tab "Preview"
  - [ ] Verificar nome do portal no preview
  - [ ] Verificar cor de fundo aplicada
  - [ ] ✅ **Verificar**: Badges mostram configurações corretas

- [ ] **Teste 2: Navegação**
  - [ ] Clicar "Editar Tema →"
  - [ ] ✅ **Verificar**: Navega para página de tema

**✅ CHECKPOINT FASE 4**: Tab de preview com mockup do portal implementada

---

## 🎯 FASE 5: MELHORIAS DE FORMULÁRIO

### 5.1. Adicionar Campo Textarea para Descrição

- [ ] Substituir `Input` por `Textarea` no campo descrição
- [ ] Configurar rows="3"
- [ ] Adicionar contador de caracteres (opcional, max 200)
- [ ] ✅ **Checkpoint**: Textarea implementada

### 5.2. Adicionar Switch para Removable

- [ ] Adicionar componente `Switch` para campo "removable"
- [ ] Label: "Portal pode ser removido"
- [ ] Disabled se `portalId = "main"`
- [ ] Adicionar `Tooltip` explicando o campo
- [ ] ✅ **Checkpoint**: Switch implementada

### 5.3. Adicionar Campo Rota (Read-only)

- [ ] Exibir campo `route` do portal (disabled)
- [ ] Adicionar `HoverCard` mostrando URL completa
- [ ] Preview: `https://plataforma.com{route}`
- [ ] ✅ **Checkpoint**: Campo rota visível

### 5.4. Adicionar Tooltips e HoverCards

- [ ] Tooltip em "Nome do Portal"
- [ ] Tooltip em "Ambiente"
- [ ] HoverCard em "Ambiente" listando outros portais no mesmo realm
- [ ] Tooltip em "Switch Removable"
- [ ] ✅ **Checkpoint**: Tooltips adicionados

### 5.5. Testar Fase 5 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Novos Campos**
  - [ ] Textarea aceita múltiplas linhas
  - [ ] Switch "removable" togglea corretamente
  - [ ] Campo rota mostra valor correto
  - [ ] ✅ **Verificar**: HoverCard mostra outros portais do realm

- [ ] **Teste 2: Portal "main"**
  - [ ] Editar portal "main"
  - [ ] ✅ **Verificar**: Switch "removable" disabled com tooltip

**✅ CHECKPOINT FASE 5**: Formulário enriquecido com Textarea, Switch, rota e tooltips

---

## 🎯 FASE 6: RESPONSIVIDADE E POLIMENTO

### 6.1. Implementar Responsividade Mobile

- [ ] Sidebar esquerda vira `Sheet` em mobile
- [ ] Adicionar botão hambúrguer para abrir Sheet
- [ ] Context direita vira acordeão no final da página
- [ ] Tabs horizontalmente scrolláveis
- [ ] ✅ **Checkpoint**: Layout mobile funcional

### 6.2. Implementar Loading States

- [ ] Skeleton loader para sidebar esquerda
- [ ] Skeleton loader para formulário
- [ ] Skeleton loader para context direita
- [ ] Spinner no botão "Salvar" enquanto salvando
- [ ] ✅ **Checkpoint**: Loading states implementados

### 6.3. Implementar Confirmação de Saída

- [ ] Detectar mudanças no formulário (`isDirty`)
- [ ] Exibir badge "Não salvo" quando `isDirty = true`
- [ ] Confirmação ao navegar/fechar com mudanças não salvas
- [ ] ✅ **Checkpoint**: Confirmação implementada

### 6.4. Adicionar Animações

- [ ] Transição suave entre tabs
- [ ] Fade-in para alertas de validação
- [ ] Hover effects em cards de navegação
- [ ] ✅ **Checkpoint**: Animações adicionadas

### 6.5. Testar Fase 6 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Mobile**
  - [ ] Redimensionar para <768px
  - [ ] Abrir menu hambúrguer
  - [ ] ✅ **Verificar**: Sheet abre com navegação

- [ ] **Teste 2: Confirmação**
  - [ ] Editar campo
  - [ ] Tentar navegar sem salvar
  - [ ] ✅ **Verificar**: Modal de confirmação aparece

**✅ CHECKPOINT FASE 6**: Responsividade mobile, loading states, confirmação e animações implementadas

---

## 📝 NOTAS DE IMPLEMENTAÇÃO

### Decisões Arquiteturais
- **Layout de 3 Colunas**: Segue padrão dashboard para hub central de configuração, separando status/navegação (esquerda), formulário (centro), e ações/contexto (direita)
- **Tabs Config/Preview**: Permite visualização sem navegação, mantendo usuário no contexto da configuração
- **Componentes Shadcn/UI**: Uso exclusivo de shadcn/ui + eldoraui para consistência visual e manutenibilidade

### Limitações Conhecidas
- **Preview do Tema**: Requer tema implementado no realm; se não existir, mostra placeholder
  - Mitigação: Fallback para tema padrão
  - Alternativa futura: Editor de tema inline
- **Metadados de Auditoria**: Depende de `createdAt`/`updatedAt` no modelo Portal
  - Mitigação: Ocultar seção se dados não disponíveis
  - Alternativa futura: Adicionar campos ao modelo

### Referências
- `spec/ui/setup-module-interfaces.md` - Seção 4 (Criar/Editar Portal)
- `spec/SPEC-module-setup.md` - Funcionalidades do módulo Setup
- `spec/components/components-guide.md` - Componentes shadcn/ui disponíveis
- `src/frontend/src/modules/setup/pages/PortalEdit.tsx` - Implementação atual
