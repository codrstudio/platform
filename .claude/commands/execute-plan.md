# Execute um PLAN.md

Execute planos de implementação coordenando agentes task-planner e task-runner.

## Arguments
- **$ARGUMENTS**: Path para PLAN.md e escopo opcional
  - Format: `@path/to/PLAN.md [scope]`
  - Examples:
    - `@src/prototype-2/PLAN.md` (executa tudo)
    - `@src/prototype-2/PLAN.md increment 1`
    - `@src/prototype-2/PLAN.md system 1.1`
    - `@src/prototype-2/PLAN.md task 1.1.1`

## Your Role

Você é um **coordenador de execução**. Seu trabalho:
1. Ler PLAN.md
2. Identificar tarefas no escopo
3. Distribuir para agentes (planner → runner)
4. Atualizar progresso
5. Continuar até completar

## Workflow

### Step 1: Parse Scope
- Sem args → Todas as tarefas `[ ]`
- "increment X" → Todas tarefas do increment
- "system X.Y" → Todas tarefas do sistema
- "task X.Y.Z" → Tarefa específica

### Step 2: Analyze Dependencies
- Agrupar tarefas independentes
- Ordenar tarefas dependentes
- Planejar batches de execução

### Step 3: Execute Pipeline

**Planning (Paralelo):**
```
@task-planner plan task 1.1.1 (nome) from path/PLAN.md
@task-planner plan task 1.1.2 (nome) from path/PLAN.md
@task-planner plan task 1.1.3 (nome) from path/PLAN.md
```

**Execution (Sequential):**
```
@task-runner execute task 1.1.1 (nome) from path/PLAN.md
[wait] → update PLAN.md
@task-runner execute task 1.1.2 (nome) from path/PLAN.md
[wait] → update PLAN.md
...
```

### Step 4: Update Progress

Após cada tarefa:
1. Marcar `[x]` no PLAN.md
2. Mostrar progresso: "Task 1.1.1 ✓ (3/15)"
3. Continuar para próxima

### Step 5: Continue Until Done

**Nunca pare** até escopo completo.

## Key Rules

1. **@agent explícito** - Sempre use @task-planner e @task-runner
2. **Planejar em paralelo** - 2-4 planners simultâneos
3. **Executar sequencial** - Um runner por vez
4. **Fluxo contínuo** - Não pergunte, continue
5. **Update imediato** - PLAN.md após cada tarefa
6. **Passar localização** - Sempre inclua path do PLAN.md
7. **Incluir nome** - Task name do PLAN.md nos comandos
8. **Parar só em erro crítico** - Runner falha = STOP

## Start Execution

Now:
1. Extract PLAN.md path de $ARGUMENTS
2. Read PLAN.md
3. Identify scope
4. Begin distribution