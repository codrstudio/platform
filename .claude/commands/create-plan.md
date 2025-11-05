# Create um PLAN.md

Cria planos de implementação detalhados a partir de especificações de projeto.

## Arguments
- **$ARGUMENTS**: Path para o arquivo de especificação do projeto
  - Format: `@path/to/PROJECT-SPEC.md`
  - Example: `@docs/chrome-extension-spec.md`

## Your Role

Você é um **arquiteto de planos**. Seu trabalho é:
1. Ler a especificação do projeto
2. Analisar requisitos e complexidade
3. Quebrar em incrementos lógicos
4. Estruturar sistemas e tarefas
5. Gerar PLAN.md completo no mesmo diretório da spec

## Workflow

### Step 1: Read Specification
- Ler arquivo de especificação completo
- Identificar objetivos principais
- Listar funcionalidades requeridas
- Entender arquitetura proposta
- Identificar dependências tecnológicas

### Step 2: Define Increments
Quebrar projeto em incrementos (fases principais):
- Increment 1: Setup e fundação
- Increment 2: Features core
- Increment 3: Features avançadas
- Increment 4: Polish e otimização

**Critérios:**
- Cada increment deve ser funcional (entrega valor)
- Incrementos são dependentes (ordem importa)
- 3-5 incrementos idealmente

### Step 3: Define Systems
Para cada increment, criar sistemas (áreas funcionais):

**Formato:**
```
Sistema X.Y: Nome do Sistema
Descrição: O que este sistema faz
Complexidade: Baixa/Média/Alta
Dependências: [lista de sistemas prerequisitos]
```

**Tipos comuns:**
- Setup (configs, estrutura)
- Core (funcionalidades principais)
- UI (interface, componentes)
- Data (storage, state)
- Integration (APIs, serviços externos)
- Testing (testes, validação)

### Step 4: Define Tasks
Para cada sistema, criar tarefas atômicas:

**Formato:**
```
- [ ] Tarefa X.Y.Z: Nome da Tarefa
  - Descrição: O que fazer
  - Output: O que será criado/modificado
  - Validação: Como verificar que está correto
```

**Critérios para boas tarefas:**
- Atômica (uma coisa só)
- Mensurável (done é claro)
- Testável (pode ser validada)
- Independente quando possível
- 15-45 min de trabalho

### Step 5: Structure Dependencies
Marcar dependências explicitamente:
```
Sistema 2.1: Nome
Dependências: Sistema 1.1, Sistema 1.2
```

### Step 6: Generate PLAN.md

**Template:**
```markdown
# PLAN.md - [Nome do Projeto]

Gerado em: [data]
Baseado em: [path da spec]

## Overview
[Resumo do que será implementado]

## Incrementos

### Increment 1: [Nome]
**Objetivo:** [O que este increment entrega]

#### Sistema 1.1: [Nome do Sistema]
**Descrição:** [O que faz]
**Complexidade:** [Baixa/Média/Alta]
**Dependências:** [Lista ou "Nenhuma"]

**Tarefas:**
- [ ] 1.1.1: [Nome]
  - Descrição: [detalhes]
  - Output: [arquivos/mudanças]
  - Validação: [como testar]

- [ ] 1.1.2: [Nome]
  ...

#### Sistema 1.2: [Nome do Sistema]
...

### Increment 2: [Nome]
...

## Metrics
- Total Increments: X
- Total Systems: Y
- Total Tasks: Z
- Estimated Time: N hours

## Notes
[Considerações importantes, riscos, dependências externas]
```

## Quality Guidelines

### Bons Incrementos
- ✓ Cada um entrega algo funcional
- ✓ Podem ser deployados independentemente
- ✓ Ordem lógica de complexidade
- ✓ 5-10 sistemas por increment

### Bons Sistemas
- ✓ Coesão alta (fazem uma coisa relacionada)
- ✓ Acoplamento baixo (independentes quando possível)
- ✓ 3-8 tarefas por sistema
- ✓ Complexidade clara

### Boas Tarefas
- ✓ Título claro e acionável
- ✓ Descrição com contexto suficiente
- ✓ Output específico
- ✓ Validação objetiva
- ✓ Tamanho gerenciável

## Example Output
```markdown
# PLAN.md - Chrome Extension Prototype

Gerado em: 2025-01-15
Baseado em: docs/chrome-extension-spec.md

## Overview
Implementação de extensão Chrome com popup e side panel usando Vite, React, TypeScript.

## Incrementos

### Increment 1: Foundation Setup
**Objetivo:** Estrutura base funcional com manifest e build

#### Sistema 1.1: Project Setup
**Descrição:** Configuração inicial do projeto
**Complexidade:** Baixa
**Dependências:** Nenhuma

**Tarefas:**
- [ ] 1.1.1: Criar estrutura de pastas
  - Descrição: Criar estrutura completa do projeto conforme especificação
  - Output: Pastas src/, public/, docs/, planning/
  - Validação: Todas as pastas existem

- [ ] 1.1.2: Configurar TypeScript
  - Descrição: Setup tsconfig.json com paths e target ES2020
  - Output: tsconfig.json
  - Validação: `tsc --noEmit` sem erros

...
```

## Rules

1. **Sempre baseado na spec** - Não invente requisitos
2. **Estrutura clara** - Hierarquia increment → system → task
3. **Tarefas atômicas** - Uma tarefa = uma mudança
4. **Dependências explícitas** - Sempre marque prerequisitos
5. **Validação clara** - Toda tarefa tem critério de sucesso
6. **Output específico** - Liste arquivos/mudanças concretas
7. **Complexidade realista** - Estime baseado em escopo
8. **Ordem lógica** - Setup antes de features, core antes de polish

## Error Prevention

**Evite:**
- ❌ Tarefas muito grandes (>1h)
- ❌ Tarefas vagas ("melhorar X")
- ❌ Dependências circulares
- ❌ Sistemas sem coesão
- ❌ Incrementos que não entregam valor

**Garanta:**
- ✓ Cada tarefa é testável
- ✓ Dependências são resolvíveis
- ✓ Ordem de execução é clara
- ✓ Métricas são calculadas
- ✓ Path do PLAN.md está correto

## Start Creation

Now:
1. Read specification from $ARGUMENTS path
2. Analyze complexity and scope
3. Design increment structure
4. Break into systems and tasks
5. Generate PLAN.md in same directory as spec
6. **No need to report** completion with metrics