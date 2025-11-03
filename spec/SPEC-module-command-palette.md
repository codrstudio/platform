# SPEC-module-command-palette.md

## Especificação: Módulo Command Palette

### Escopo
Este documento especifica o módulo Command Palette, responsável por fornecer interface unificada de busca, comandos e invocação de agentes.

---

## 1. Definição

### Propósito
O módulo Command Palette fornece um hub central de acesso rápido que permite buscar conteúdo, executar comandos e invocar agentes através de uma única interface.

### Natureza
- **Tipo**: Módulo de Funcionalidade
- **Dependências**: Media Components (para renderização de resultados ricos)
- **Opcional**: Sim

---

## 2. Responsabilidades

### SPEC-CP-R-001
O módulo Command Palette DEVE fornecer interface unificada para três tipos de interação: busca, comandos e agentes

### SPEC-CP-R-002
O módulo Command Palette DEVE consumir definições de ações via JQEL Schema

### SPEC-CP-R-003
O módulo Command Palette NÃO DEVE implementar lógica de negócio (delega para JQEL e Canal de Agentes)

### SPEC-CP-R-004
O módulo Command Palette DEVE funcionar em duas modalidades: suspensa e expandida

---

## 3. Modalidades

### Modalidade Suspensa

**SPEC-CP-M-001:** Módulo DEVE fornecer interface suspensa acionável por atalho de teclado

**SPEC-CP-M-002:** Atalho padrão DEVE ser `Ctrl+K` ou `Cmd+K` (macOS)

**SPEC-CP-M-003:** Atalho PODE ser configurado na instância

**SPEC-CP-M-004:** Interface suspensa DEVE:
- Aparecer sobreposta ao conteúdo
- Ter backdrop semi-transparente
- Fechar ao clicar fora ou pressionar `Esc`
- Manter foco no input de busca

**SPEC-CP-M-005:** Interface suspensa DEVE exibir no máximo 8 resultados por categoria

### Modalidade Expandida

**SPEC-CP-M-006:** Módulo DEVE fornecer interface expandida como página completa

**SPEC-CP-M-007:** Interface expandida DEVE ter rota configurável na instância

**SPEC-CP-M-008:** Interface expandida DEVE:
- Ocupar largura total disponível
- Exibir mais resultados (paginação ou scroll infinito)
- Permitir filtros e ordenação avançada
- Ter histórico de buscas/comandos

**SPEC-CP-M-009:** Usuário DEVE poder alternar entre modalidades

---

## 4. Três Pilares de Interação

### 4.1 Search (Busca Federada)

**SPEC-CP-S-001:** Quando usuário digita texto livre (sem prefixo), módulo DEVE executar busca

**SPEC-CP-S-002:** Busca DEVE consultar todas as actions do tipo `select` marcadas como `searchable: true`

**SPEC-CP-S-003:** Busca DEVE ser executada em paralelo em todos os schemas

**SPEC-CP-S-004:** Módulo DEVE montar `where` dinamicamente usando `searchFields` da action

**SPEC-CP-S-005:** Formato do `where` gerado DEVE ser:
```typescript
{
  $or: searchFields.map(field => ({
    [field]: { LIKE: `%${query}%` }
  }))
}
```

**SPEC-CP-S-006:** Cada action DEVE retornar no máximo `limit` configurado (padrão: 5)

**SPEC-CP-S-007:** Resultados DEVEM ser agrupados por categoria ou schema

**SPEC-CP-S-008:** Busca DEVE ser debounced (padrão: 300ms)

### 4.2 Commands (Comandos)

**SPEC-CP-C-001:** Quando usuário digita `/`, módulo DEVE filtrar apenas mutations

**SPEC-CP-C-002:** Módulo DEVE listar apenas actions do tipo `mutate` marcadas como `searchable: true`

**SPEC-CP-C-003:** Autocomplete DEVE usar campo `trigger` da action

**SPEC-CP-C-004:** Se action define `params`, módulo DEVE processar parâmetros

**SPEC-CP-C-005:** Processamento de parâmetros DEVE seguir `mode` definido:
- `inline`: parser de texto livre
- `interactive`: formulário passo-a-passo
- `hybrid`: tenta inline, se falhar abre interactive

**SPEC-CP-C-006:** Parsing inline DEVE suportar:
- Parâmetros posicionais: `/comando valor1 valor2`
- Parâmetros nomeados: `/comando --param1=valor1 --param2=valor2`
- Flags booleanas: `/comando --flag` ou `/comando --no-flag`

**SPEC-CP-C-007:** Modo interactive DEVE:
- Exibir formulário com campos definidos em `params`
- Usar `description` como hint
- Usar `placeholder` no input
- Validar `required` antes de submeter
- Aplicar `default` quando campo vazio

**SPEC-CP-C-008:** Após coletar parâmetros, módulo DEVE executar mutation via JQEL

**SPEC-CP-C-009:** Se mutation tem `async: true`, módulo DEVE:
- Extrair `taskId` do retorno
- Criar notificação "Tarefa criada"
- Opcionalmente redirecionar para `/tasks/{taskId}`

**SPEC-CP-C-010:** Se mutation é síncrona, módulo DEVE exibir feedback imediato (sucesso/erro)

### 4.3 Agentes (Invocação Ad-hoc)

**SPEC-CP-A-001:** Quando usuário digita `@`, módulo DEVE listar agentes disponíveis

**SPEC-CP-A-002:** Lista de agentes DEVE vir de configuração ou JQEL

**SPEC-CP-A-003:** Autocomplete DEVE filtrar agentes por nome

**SPEC-CP-A-004:** Após selecionar agente, usuário DEVE digitar query

**SPEC-CP-A-005:** Formato completo: `@agente-id query do usuário`

**SPEC-CP-A-006:** Módulo DEVE enviar invocação via Canal de Agentes:
```typescript
POST /api/agent/{provider}/{agentId}
Body: { query: "query do usuário" }
```

**SPEC-CP-A-007:** Invocação DEVE ser stateless (sem histórico de chat)

**SPEC-CP-A-008:** Resposta DEVE ser exibida inline ou em modal, dependendo de:
- Tamanho da resposta
- Tipo de conteúdo
- Configuração da instância

**SPEC-CP-A-009:** Resposta inline DEVE suportar:
- Texto simples
- Markdown
- Tabelas pequenas
- Cards de dados

**SPEC-CP-A-010:** Resposta em modal DEVE ser usada para:
- Conteúdo extenso
- Gráficos/visualizações
- Formulários interativos
- PDFs/imagens

---

## 5. Extensão do JQEL Schema

### Campo searchable

**SPEC-CP-J-001:** Actions PODEM ter campo opcional `searchable`

**SPEC-CP-J-002:** Estrutura de `searchable` DEVE ser:
```typescript
{
  enabled: boolean;                    // Se aparece no Command Palette
  title: string;                       // Nome exibido
  description?: string;                // Texto explicativo
  keywords?: string[];                 // Termos adicionais para matching
  category?: string;                   // Agrupamento visual
  icon?: string;                       // Ícone lucide-react
  resultComponent?: string;            // Componente customizado
  
  // Apenas para SELECT
  searchFields?: string[];             // Campos usados no WHERE
  searchOperator?: 'LIKE' | 'ILIKE' | '=';  // Operador padrão
  
  // Apenas para MUTATE
  trigger?: string;                    // Trigger do comando (ex: "/tema")
  params?: SearchableParam[];          // Parâmetros do comando
  mode?: 'inline' | 'interactive' | 'hybrid';  // Modo de entrada
  async?: boolean;                     // Se retorna taskId
}
```

### Campo params (para mutations)

**SPEC-CP-J-003:** Estrutura de `SearchableParam` DEVE ser:
```typescript
{
  name: string;                        // Nome do parâmetro
  type: 'string' | 'enum' | 'select' | 'boolean' | 'array';
  required?: boolean;                  // Se é obrigatório
  description?: string;                // Texto explicativo
  placeholder?: string;                // Exemplo no input
  default?: any;                       // Valor padrão
  
  // Para type: enum
  options?: string[];                  // Lista fixa de valores
  
  // Para type: select
  source?: {                           // Busca dinâmica
    schema: string;
    entity: string;
    labelField: string;
    valueField?: string;
  };
}
```

---

## 6. Inicialização

### Carregamento de Actions

**SPEC-CP-I-001:** Ao inicializar, módulo DEVE buscar todas as actions searchable:
```typescript
jqel.query({
  schema: 'platform',
  operation: 'select',
  entity: 'sdl_actions',
  where: { 'searchable.enabled': true }
})
```

**SPEC-CP-I-002:** Actions DEVEM ser agrupadas por:
- Schema
- Tipo (select/mutate)
- Categoria

**SPEC-CP-I-003:** Módulo DEVE construir índice de busca em memória

**SPEC-CP-I-004:** Índice DEVE incluir:
- `title`
- `description`
- `keywords`
- `trigger` (para comandos)

### Schema Frontend

**SPEC-CP-I-005:** Módulo DEVE consumir actions do `schema=frontend`

**SPEC-CP-I-006:** Frontend DEVE responder a queries deste schema sem ir ao backend

**SPEC-CP-I-007:** Exemplo de actions frontend:
```typescript
// Buscar rotas
select.route WHERE path LIKE '%query%'

// Alternar tema
mutate.theme.toggle

// Navegar para portal
mutate.navigation.goto { portalId: "..." }
```

---

## 7. Renderização de Resultados

### Componentes Padrão

**SPEC-CP-R-001:** Módulo DEVE fornecer componentes padrão de resultado:
- `<TextResult />` - Texto simples
- `<RouteResult />` - Rotas/páginas
- `<DataResult />` - Dados de entidades
- `<CommandResult />` - Comandos disponíveis
- `<AgentResult />` - Agentes disponíveis

### Componentes Customizados

**SPEC-CP-R-002:** Se action define `resultComponent`, módulo DEVE usar componente customizado

**SPEC-CP-R-003:** Componente customizado DEVE receber props:
```typescript
{
  data: any;              // Resultado da query
  query: string;          // Query do usuário
  onSelect: () => void;   // Callback ao selecionar
}
```

### Agrupamento Visual

**SPEC-CP-R-004:** Resultados DEVEM ser agrupados por:
- Categoria (se definida)
- Schema (fallback)

**SPEC-CP-R-005:** Cada grupo DEVE ter:
- Header com nome do grupo
- Contador de resultados
- Ícone representativo

**SPEC-CP-R-006:** Ordem dos grupos DEVE ser configurável

---

## 8. Navegação por Teclado

**SPEC-CP-K-001:** Interface DEVE ser 100% navegável por teclado

**SPEC-CP-K-002:** Atalhos obrigatórios:
- `↓` / `↑` - Navegar entre resultados
- `Enter` - Selecionar resultado
- `Esc` - Fechar palette
- `Tab` - Alternar entre grupos
- `Ctrl+K` / `Cmd+K` - Abrir/fechar (suspensa)

**SPEC-CP-K-003:** Atalhos opcionais:
- `Ctrl+1...9` - Selecionar resultado direto (por número)
- `Ctrl+Shift+P` - Abrir em modo expandido
- `Ctrl+H` - Ver histórico
- `Ctrl+/` - Abrir lista de comandos

**SPEC-CP-K-004:** Foco DEVE sempre voltar para input após ação

---

## 9. Histórico e Recentes

**SPEC-CP-H-001:** Módulo DEVE manter histórico de:
- Buscas realizadas
- Comandos executados
- Agentes invocados

**SPEC-CP-H-002:** Histórico DEVE ser armazenado em localStorage

**SPEC-CP-H-003:** Limite de histórico DEVE ser configurável (padrão: 50 itens)

**SPEC-CP-H-004:** Quando input vazio, módulo DEVE exibir itens recentes

**SPEC-CP-H-005:** Itens recentes DEVEM ter timestamp

**SPEC-CP-H-006:** Usuário DEVE poder limpar histórico

**SPEC-CP-H-007:** Itens frequentes DEVEM ter prioridade maior em resultados

---

## 10. Permissões

**SPEC-CP-P-001:** Módulo DEVE respeitar permissões de ações

**SPEC-CP-P-002:** Actions sem permissão NÃO DEVEM aparecer nos resultados

**SPEC-CP-P-003:** Validação DEVE usar `/api/1/auth/authorize`

**SPEC-CP-P-004:** Validação PODE ser cacheada por sessão

**SPEC-CP-P-005:** Se usuário não autenticado, apenas actions públicas DEVEM aparecer

---

## 11. Performance

**SPEC-CP-PERF-001:** Busca DEVE ser debounced (300ms padrão)

**SPEC-CP-PERF-002:** Queries DEVEM ser executadas em paralelo

**SPEC-CP-PERF-003:** Timeout por query: 5s (padrão)

**SPEC-CP-PERF-004:** Módulo DEVE mostrar loading apenas após 200ms

**SPEC-CP-PERF-005:** Resultados DEVEM usar virtualização se > 50 itens

**SPEC-CP-PERF-006:** Índice de busca DEVE ser construído em Web Worker

---

## 12. Configuração de Instância

**SPEC-CP-C-001:** Instância DEVE ter configuração mínima:
```typescript
{
  instanceId: string;
  moduleId: "command-palette";
  config: {
    mode: "suspended" | "expanded" | "both";
    suspendedShortcut?: string;        // Default: "Ctrl+K"
    expandedRoute?: string;            // Rota da página expandida
    maxResultsPerCategory?: number;    // Default: 5 (suspended), 20 (expanded)
    debounceMs?: number;               // Default: 300
    historyLimit?: number;             // Default: 50
    defaultCategories?: string[];      // Ordem de exibição
  }
}
```

---

## 13. Exemplos de Uso

### Exemplo 1: Busca de Página
```
┌─────────────────────────────────────────┐
│ dashboard                               │ ← Input
├─────────────────────────────────────────┤
│ Navegação                               │
│ ▸ Dashboard Financeiro                  │
│   /app/dashboard/financeiro             │
│                                         │
│ ▸ Dashboard Operacional                 │
│   /app/dashboard/operacional            │
│                                         │
│ Dados                                   │
│ ▸ Dashboard "Vendas Q3"                 │
│   Criado em 15/10/2024                  │
└─────────────────────────────────────────┘
```

### Exemplo 2: Comando com Parâmetros (Inline)
```
┌─────────────────────────────────────────┐
│ /tema escuro                            │ ← Input
├─────────────────────────────────────────┤
│ Comandos                                │
│ ▸ Alterar Tema → escuro                 │
│   Ativar tema escuro                    │
│                                         │
│   [Enter para executar]                 │
└─────────────────────────────────────────┘
```

### Exemplo 3: Comando Interativo
```
┌─────────────────────────────────────────┐
│ Criar Portal                            │
├─────────────────────────────────────────┤
│                                         │
│ ID do Portal *                          │
│ ┌─────────────────────────────────────┐ │
│ │ sac                                 │ │
│ └─────────────────────────────────────┘ │
│ Identificador único (alfanumérico)      │
│                                         │
│ Rota                                    │
│ ┌─────────────────────────────────────┐ │
│ │ /sac                                │ │
│ └─────────────────────────────────────┘ │
│ Caminho de acesso ao portal             │
│                                         │
│           [Cancelar]  [Criar Portal]    │
└─────────────────────────────────────────┘
```

### Exemplo 4: Invocação de Agente
```
┌─────────────────────────────────────────┐
│ @analista vendas Q3 por região          │ ← Input
├─────────────────────────────────────────┤
│ 🤖 Analisando dados...                  │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Vendas Q3 2024 por Região           │ │
│ │                                     │ │
│ │ • Sudeste: R$ 2.5M (+15%)           │ │
│ │ • Sul: R$ 1.2M (+8%)                │ │
│ │ • Nordeste: R$ 900K (+22%)          │ │
│ │                                     │ │
│ │ [Ver detalhes] [Exportar]           │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 14. Acessibilidade

**SPEC-CP-A-001:** Interface DEVE ter ARIA labels apropriados

**SPEC-CP-A-002:** Navegação por teclado DEVE ser anunciada

**SPEC-CP-A-003:** Loading states DEVEM ser anunciados

**SPEC-CP-A-004:** Resultados DEVEM ter `role="option"`

**SPEC-CP-A-005:** Grupos DEVEM ter `role="group"` com label

---

*Esta especificação define os requisitos do módulo Command Palette. Implementação técnica em documentação separada.*