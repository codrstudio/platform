# Restrições e Limitações do Sistema HelpDesk

**IMPORTANTE**: Este arquivo define o que é **PERMITIDO** e o que é **PROIBIDO** durante especificação e implementação.

---

## 🚫 RESTRIÇÕES CRÍTICAS

### 1. Base de Dados é IMUTÁVEL

**PROIBIDO**:
- ❌ Criar novas tabelas
- ❌ Adicionar novos campos em tabelas existentes
- ❌ Modificar tipos de campos
- ❌ Alterar relacionamentos existentes
- ❌ Criar novos índices ou constraints

**PERMITIDO**:
- ✅ Usar APENAS campos existentes na base
- ✅ Criar views (se n8n suportar)
- ✅ Usar campos JSON/JSONB para dados extras (se existirem)
- ✅ Processar/transformar dados no backend/n8n

**Razão**: Não temos permissão para modificar o schema do banco de dados.

---

### 2. Lógica de Negócio NO n8n (Já Implementado)

**PROIBIDO**:
- ❌ Criar workflows n8n novos sem autorização
- ❌ Modificar workflows existentes drasticamente
- ❌ Assumir que n8n tem funcionalidade que não existe

**PERMITIDO**:
- ✅ Usar workflows n8n já existentes em `workflows/`
- ✅ Propor extensões SIMPLES aos workflows
- ✅ Criar automações que usem webhooks existentes

**Razão**: n8n é o backbone já implementado. Mudanças grandes requerem aprovação.

---

### 3. Schemas JQEL Devem Mapear Tabelas Reais

**PROIBIDO**:
- ❌ Inventar entidades que não existem no banco
- ❌ Criar schemas JQEL sem base de dados correspondente
- ❌ Assumir campos que não estão na base

**PERMITIDO**:
- ✅ Documentar schemas baseados em tabelas REAIS
- ✅ Criar campos computados (calculados em runtime)
- ✅ Usar JSONB fields para extensibilidade (se existirem)

**Razão**: JQEL mapeia para SQL. Precisa haver tabela/campo real.

---

## 📋 PROCESSO: Reality Check

### Antes de Especificar/Implementar

**1. Identificar Entidades Necessárias**
```
Exemplo: "Preciso de campo 'prioridade' em chamado"
```

**2. Consultar Base de Dados Real**
```
Perguntar: "Essa tabela/campo existe na base?"
Verificar: Existe um schema correspondente em jqel-schema/
```

**3. Se NÃO EXISTE**
```
OPÇÃO A: Usar campo existente similar
OPÇÃO B: Usar JSONB/JSON field (metadados, extras)
OPÇÃO C: Processar no backend (computed field)
OPÇÃO D: DESCARTAR a funcionalidade
```

**4. Se EXISTE**
```
✅ Prosseguir com especificação
✅ Documentar em SPEC
✅ Adicionar exemplo JQEL
```

---

## 🔍 COMO USAR ESTE ARQUIVO

### Quando Você Me Pedir Melhorias

**Você deve dizer**:
```
"Leia CONSTRAINTS.md antes de prosseguir.
Valide cada melhoria contra as restrições.
Questione se algo não está na base."
```

**Eu devo**:
1. Ler CONSTRAINTS.md
2. Para cada melhoria proposta:
   - Identificar entidades/campos necessários
   - Verificar se existem em jqel-schema/
   - Se NÃO: Propor alternativa OU questionar ANTES de especificar
3. Documentar apenas o que é viável

---

## 📝 WORKFLOW DE VALIDAÇÃO

```
┌─────────────────────────┐
│ Recebo Pedido           │
│ "Adicionar campo X"     │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 1. Leio CONSTRAINTS.md  │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 2. Campo existe na base?│
└───────┬─────────┬───────┘
        │         │
    SIM │         │ NÃO
        │         │
        ▼         ▼
┌──────────┐  ┌──────────────────────┐
│ Especifico│  │ QUESTIONO O USUÁRIO  │
│ normalmente│  │ "Este campo existe?" │
└──────────┘  │ "Podemos usar JSONB?"│
              │ "Há alternativa?"     │
              └──────────────────────┘
```

---

## 🗂️ INVENTÁRIO: O Que TEMOS na Base

**NOTA**: Este inventário deve ser atualizado conforme descobrimos a estrutura real.

### Tabelas Conhecidas (Exemplo)
```
❓ TBchamado - (VERIFICAR: quais campos existem?)
❓ TBcontato - (VERIFICAR: quais campos existem?)
❓ TBatendente - (VERIFICAR: quais campos existem?)
❓ TBdepartamento - (VERIFICAR: quais campos existem?)
```

### Campos Conhecidos (Exemplo)
```
TBchamado:
  ✅ id
  ✅ titulo
  ✅ descricao
  ✅ status
  ❓ prioridade - VERIFICAR
  ❓ clienteId - VERIFICAR
  ❓ dataAbertura - VERIFICAR
```

---

## 🎯 ESTRATÉGIAS DE CONTORNO

### Se Campo NÃO Existe

#### Estratégia 1: JSONB/Metadados
```json
// Se existe campo 'metadados' type JSONB
{
  "schema": "helpdesk",
  "select": "chamado",
  "where": {
    "metadados->prioridade": { "$eq": "alta" }
  }
}
```

#### Estratégia 2: Computed Fields
```typescript
// Backend/n8n processa
const chamado = await jqel.query(...);
chamado.prioridadeCalculada = calcularPrioridade(chamado);
```

#### Estratégia 3: Tabela Auxiliar
```
Se pudermos criar tabelas novas:
  - TBchamado_extras (id, chamadoId, chave, valor)
  - Key-value store flexível
```

#### Estratégia 4: Feature Flag OFF
```
"Esta feature requer campo X que não existe.
Marcar como 'futuro' ou remover da spec."
```

---

## 📞 PERGUNTAS A FAZER

### Quando em Dúvida

**Pergunte ao usuário**:
1. "Este campo/tabela existe na base de dados?"
2. "Temos um campo JSONB/JSON para dados extras?"
3. "Podemos criar esta tabela/campo ou é imutável?"
4. "Há um campo existente que serve de alternativa?"
5. "Posso ver o schema real da base de dados?"

**Não assuma**:
- ❌ "Provavelmente existe"
- ❌ "É comum ter esse campo"
- ❌ "Vou especificar e depois ajustamos"

---

## 🔒 CAMPOS OBRIGATÓRIOS vs OPCIONAIS

### Ao Documentar Schemas

**Marcar claramente**:
```markdown
- **id** (UUID, PK) ✅ EXISTE NA BASE
- **prioridade** (enum) ❓ VERIFICAR SE EXISTE
- **tags** (array) ⚠️ USAR metadados->tags (JSONB)
```

**Legenda**:
- ✅ Campo confirmado na base
- ❓ Campo não confirmado - PRECISA VALIDAR
- ⚠️ Campo não existe - usar workaround
- ❌ Campo não existe - feature impossível

---

## 🚀 RELEASE INCREMENTAL

### Fase 1: Usar APENAS Campos Confirmados
- Implementar funcionalidades básicas
- Apenas campos ✅ na base

### Fase 2: Validar Campos Duvidosos
- Questionar cada ❓
- Confirmar ou criar workaround

### Fase 3: Funcionalidades Avançadas
- Após validação completa
- Usar JSONB se necessário

---

## 📚 REFERÊNCIAS

### Antes de Cada Especificação, LEIA:
1. `CONSTRAINTS.md` (este arquivo)
2. `jqel-schema/*.md` (schemas documentados)
3. Pergunte ao usuário sobre campos duvidosos

### Ao Criar SPEC:
- Marcar cada campo com ✅ / ❓ / ⚠️ / ❌
- Documentar workarounds se necessário
- Listar pré-requisitos de base de dados

### Ao Criar STORY:
- Focar em valor do usuário (não em campos)
- Não mencionar tecnologia/implementação
- Deixar flexibilidade para implementação

---

## ⚡ ATALHO: Comando de Validação

**Ao me pedir melhorias, use**:
```
🔒 CONSTRAINTS MODE ON

Antes de especificar qualquer melhoria:
1. Leia spec/modules/helpdesk/CONSTRAINTS.md
2. Valide campos/tabelas contra jqel-schema/
3. Questione o que não está confirmado
4. Proponha alternativas para o que não existe
5. Marque cada campo: ✅ / ❓ / ⚠️ / ❌
```

**Eu devo responder**:
```
✅ CONSTRAINTS lido
📋 Lista de validações:
   - Campo X: ✅ existe
   - Campo Y: ❓ precisa confirmar
   - Campo Z: ⚠️ usar metadados->Z
```

---

## 🎓 EXEMPLOS

### ❌ ERRADO
```markdown
SPEC-MH-TKT-015: Sistema deve permitir definir prazo customizado

Implementação:
- Adicionar campo `prazoCustomizado` (datetime) em TBchamado
```
❌ Assumiu que pode modificar tabela

### ✅ CORRETO
```markdown
SPEC-MH-TKT-015: Sistema deve permitir definir prazo customizado

Validação:
- ❓ Campo `prazoCustomizado` existe em TBchamado?

Se NÃO:
- OPÇÃO A: Usar metadados->prazoCustomizado (JSONB)
- OPÇÃO B: Processar no backend (não persistir)
- OPÇÃO C: Adiar feature até permissão de schema

ANTES DE PROSSEGUIR: Confirmar com usuário.
```
✅ Valida antes de especificar

---

## 📢 LEMBRETE FINAL

**SEMPRE questione se algo não estiver na base.**

**NUNCA assuma que "provavelmente existe".**

**SEMPRE proponha alternativas viáveis.**

**Este arquivo é o GUARDIÃO DA REALIDADE.**

---

**Última atualização**: 2025-01-12
**Status**: Ativo - consultar antes de TODA especificação
