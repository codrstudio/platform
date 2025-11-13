# PLAN_HELPDESK.md - Implementacao do Modulo Helpdesk

**Objetivo**: Implementar modulo helpdesk do SAC seguindo especificacoes formais (SPEC-sac-helpdesk.md) com 233 requisitos tecnicos.

---

## RESUMO EXECUTIVO

### Problemas Identificados
1. Modulo helpdesk nao existe (precisa ser criado do zero)
2. Agentes precisam gerenciar tickets mas nao ha interface
3. Cadastros basicos (categorias, clientes, contatos) ausentes

### Solucao (Baseada em Padroes)
- Criar modulo helpdesk seguindo padrao da plataforma (lazy-loading, rotas, manifest)
- Implementar CRUDs basicos primeiro (categorias como inicio)
- Usar stack obrigatorio: React 19, shadcn/ui, TanStack Query, JQEL

---

## FASE 1: ESTRUTURA DO MODULO

**Objetivo**: Criar estrutura base do modulo helpdesk seguindo padrao da plataforma.

### 1.1. Criar Estrutura de Diretorios

- [x] Criar src/frontend/src/modules/helpdesk/ (diretorio raiz)
- [x] Criar src/frontend/src/modules/helpdesk/pages/
- [x] Criar src/frontend/src/modules/helpdesk/components/
- [x] Criar src/frontend/src/modules/helpdesk/hooks/
- [x] Criar src/frontend/src/modules/helpdesk/services/
- [x] Criar src/frontend/src/modules/helpdesk/types/

**Leitura de Referencia**:
- spec/SPEC-modules.md
- src/frontend/src/modules/auth/ (exemplo)

---

### 1.2. Criar Manifest do Modulo

- [x] Criar manifest.ts com moduleId: "helpdesk"
- [x] Definir name, version, dependencies

---

### 1.3. Criar Arquivo de Rotas

- [x] Criar routes.tsx com lazy-loading
- [x] Rota / (Dashboard de tickets)
- [x] Rota /categorias (Lista de categorias)
- [x] Rota /categorias/nova (Criar categoria)
- [x] Rota /categorias/:id (Editar categoria)

---

### 1.4. Criar Arquivo Index e Auto-registro

- [x] Criar index.ts exportando manifest e routes
- [x] Adicionar auto-registro no moduleRegistry
- [x] Importar em src/frontend/src/modules/index.ts
- [x] Adicionar entrada em src/backend/config/modules.json

---

## FASE 2: CRUD DE CATEGORIAS

**Objetivo**: Implementar CRUD completo de Categorias conforme SPEC-sac-HD-ORG-001 a ORG-006.

### 2.1. Definir Types TypeScript

- [x] Criar types/categoria.ts
- [x] Interface Categoria (campos do banco)
- [x] Type CategoriaFormData
- [x] Type CategoriaListItem

---

### 2.2. Criar Service de Categorias (JQEL)

- [x] Criar services/categoria.service.ts
- [x] getCategorias() - Query JQEL
- [x] getCategoria(id) - Query JQEL
- [x] createCategoria(data) - Mutation insert
- [x] updateCategoria(id, data) - Mutation update
- [x] deleteCategoria(id) - Mutation delete

---

### 2.3. Criar Custom Hooks (TanStack Query)

- [x] Criar hooks/useCategoria.ts
- [x] useCategorias() - useQuery
- [x] useCategoria(id) - useQuery
- [x] useCreateCategoria() - useMutation
- [x] useUpdateCategoria() - useMutation
- [x] useDeleteCategoria() - useMutation

---

### 2.4. Criar Componente de Listagem

- [x] Criar pages/CategoriaList.tsx
- [x] TanStack Table para grid
- [x] Botao Nova Categoria
- [x] Acoes: Editar, Excluir
- [x] Loading e Empty states

---

### 2.5. Criar Componente de Formulario

- [x] Criar pages/CategoriaForm.tsx
- [x] React Hook Form + Zod
- [x] Campos: nome, descricao, categoria_pai, cor, icone, ordem
- [x] Validacao e submit
- [x] Navegacao apos sucesso

---

### 2.6. Testar Fase 2 Completa

**Checklist de Testes**:
- [ ] Teste 1: Listar Categorias
  - [ ] Acessar /helpdesk/categorias
  - [ ] Verificar tabela renderizada
  - [ ] Verificar: Botao Nova Categoria visivel

- [ ] Teste 2: Criar Categoria
  - [ ] Preencher formulario
  - [ ] Resultado: Categoria criada

- [ ] Teste 3: Editar Categoria
  - [ ] Alterar nome
  - [ ] Resultado: Alteracao salva

- [ ] Teste 4: Excluir Categoria
  - [ ] Confirmar exclusao
  - [ ] Resultado: Categoria removida

- [ ] Teste 5: Validacao
  - [ ] Tentar salvar sem nome
  - [ ] Resultado: Erro exibido

---

## NOTAS DE IMPLEMENTACAO

### Decisoes Arquiteturais
- CRUD de Categorias primeiro (cadastro simples)
- TanStack Query obrigatorio
- shadcn/ui unico
- JQEL para tudo (schema: sac)
- Lazy loading obrigatorio

### Limitacoes Conhecidas
- Database imutavel (tabela TBcategoria ja existe)
- Hierarquia de categorias (categoria_pai_id nullable)

### Referencias
- spec/modules/sac-module/SPEC-sac-helpdesk.md
- spec/modules/sac-module/database-schema/sac.TBcategoria.sql
- spec/SPEC-modules.md
- spec/SPEC-data-access.md
