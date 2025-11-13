# SPEC-module-helpdesk-contact-management.md

## Especificação: Módulo HelpDesk - Gestão de Contatos

### Escopo

Este documento define os **requisitos de gestão de contatos** do módulo HelpDesk.

---

## Requisitos de Contatos

**SPEC-MH-CON-001** - O sistema DEVE permitir cadastro de múltiplos contatos por cliente

**Origem:** OSD044 | **Implementa:** US010, US011 | **Prioridade:** MUST

---

**SPEC-MH-CON-002** - O sistema DEVE permitir definição de um contato principal por cliente

**Origem:** OSD045 | **Implementa:** US010, US011 | **Prioridade:** SHOULD

---

**SPEC-MH-CON-003** - O sistema DEVE suportar vinculação opcional de contatos com usuários do sistema

**Origem:** OSD046 | **Implementa:** US011, US012 | **Prioridade:** MUST

---

**SPEC-MH-CON-004** - O sistema DEVE permitir configuração de recebimento de notificações por contato

**Origem:** OSD047 | **Implementa:** US011 | **Prioridade:** SHOULD

---

**SPEC-MH-CON-005** - O sistema DEVE validar que um usuário pode ser vinculado a apenas um contato

**Origem:** OSD048 | **Implementa:** US012 | **Prioridade:** MUST

---

**SPEC-MH-CON-006** - O sistema DEVE permitir criação automática de usuário ao cadastrar contato

**Origem:** OSD049 | **Implementa:** US011, US012 | **Prioridade:** SHOULD

---

**SPEC-MH-CON-007** - O sistema DEVE enviar credenciais de acesso por email para novos usuários

**Origem:** OSD050 | **Implementa:** US012 | **Prioridade:** MUST

**Campos da Base (Validados contra `contato`):**

✅ **Campos Confirmados**:
- `email_contato` (string, obrigatório) - destino do email

**Estratégia de Implementação**:
```json
// Workflow n8n envia email após criação de usuário
{
  "to": "email_contato",
  "template": "credenciais_acesso",
  "data": {
    "nome": "nome_contato",
    "email": "email_usuario",
    "senhaTemporaria": "senha_gerada",
    "linkAcesso": "https://portal.empresa.com/login"
  }
}
```

**Fluxo**:
1. Backend/n8n cria usuário e gera senha temporária
2. n8n busca template de email
3. n8n envia email via SMTP
4. Registra envio em log/auditoria

---

### SPEC-MH-CON-008 - Troca Automática de Contato Principal

**Descrição**: O sistema DEVE trocar automaticamente o contato principal quando outro contato é marcado como principal.

**Origem:** Análise de necessidade dos usuários | **Implementa:** US011 (melhoria) | **Prioridade:** SHOULD

**Campos da Base (Validados contra `contato`):**

✅ **Campos Confirmados**:
- `contato_principal` (boolean)
- `id_cliente` (integer, obrigatório)

**Regra de Negócio** (processada no n8n):
- Apenas 1 contato pode ser principal por cliente
- Ao marcar contato X como principal:
  1. Buscar contato principal atual do mesmo cliente
  2. Desmarcar contato principal atual (`contato_principal = false`)
  3. Marcar novo contato como principal (`contato_principal = true`)

**Queries JQEL**:
```json
// 1. Buscar principal atual
{
  "schema": "sac",
  "select": "contato",
  "where": {
    "id_cliente": { "$eq": 123 },
    "contato_principal": { "$eq": true }
  }
}

// 2. Desmarcar principal atual
{
  "schema": "sac",
  "mutate": "contato",
  "action": "update",
  "values": { "contato_principal": false },
  "where": { "id_contato": { "$eq": 456 } }
}

// 3. Marcar novo principal
{
  "schema": "sac",
  "mutate": "contato",
  "action": "update",
  "values": { "contato_principal": true },
  "where": { "id_contato": { "$eq": 789 } }
}
```

---

### SPEC-MH-CON-009 - Reenvio de Credenciais de Acesso

**Descrição**: O sistema DEVE permitir reenviar email com credenciais quando usuário as perde.

**Origem:** Análise de necessidade dos usuários | **Implementa:** US012 (melhoria) | **Prioridade:** SHOULD

**Campos da Base (Validados contra `contato`):**

✅ **Campos Confirmados**:
- `id_usuario` (integer, nullable) - verifica se tem usuário vinculado
- `email_contato` (string, obrigatório)

**Estratégia de Implementação**:

**Opção 1 - Gerar nova senha temporária**:
```json
// Workflow n8n:
// 1. Valida que contato tem usuário vinculado
// 2. Gera nova senha temporária
// 3. Atualiza senha do usuário
// 4. Envia email com nova senha
```

**Opção 2 - Link de reset de senha**:
```json
// Workflow n8n:
// 1. Valida que contato tem usuário vinculado
// 2. Gera token de reset de senha (válido por 24h)
// 3. Envia email com link de reset
// 4. Usuário acessa link e define nova senha
```

**Preferência**: **Opção 2** (mais seguro - não envia senha por email)

**Query JQEL**:
```json
// Verificar se contato tem usuário vinculado
{
  "schema": "sac",
  "select": "contato",
  "where": {
    "id_contato": { "$eq": 123 },
    "id_usuario": { "$ne": null }
  },
  "output": ["id_contato", "nome_contato", "email_contato", "id_usuario"]
}
```

**Fluxo (Opção 2 - Recomendado)**:
1. Frontend: Atendente clica "Reenviar credenciais"
2. Backend: Valida que contato tem usuário vinculado
3. Backend/n8n: Gera token de reset (UUID + timestamp)
4. n8n: Envia email com link `https://portal.empresa.com/reset-senha?token=...`
5. Usuário: Clica no link e define nova senha
6. Backend: Valida token e atualiza senha

---

### SPEC-MH-CON-010 - Importação em Lote de Contatos

**Descrição**: O sistema DEVE permitir importar múltiplos contatos de um cliente via arquivo CSV/Excel.

**Origem:** Análise de necessidade dos usuários | **Implementa:** US011 (nova funcionalidade) | **Prioridade:** SHOULD

**Campos da Base (Validados contra `contato`):**

✅ **Usa campos existentes** para validação e inserção

**Formato CSV Esperado**:
```csv
nome_contato,email_contato,telefone_contato,cargo_contato,departamento_contato,contato_principal,recebe_notificacoes
João Silva,joao@empresa.com,(11) 98765-4321,Gerente,TI,true,true
Maria Santos,maria@empresa.com,(11) 98765-4322,Analista,Financeiro,false,true
```

**Estratégia de Implementação**:
```json
// Para cada linha do CSV, executar:
{
  "schema": "sac",
  "mutate": "contato",
  "action": "insert",
  "values": {
    "id_cliente": 123, // ID do cliente selecionado
    "nome_contato": "João Silva",
    "email_contato": "joao@empresa.com",
    "telefone_contato": "(11) 98765-4321",
    "cargo_contato": "Gerente",
    "departamento_contato": "TI",
    "contato_principal": true,
    "recebe_notificacoes": true,
    "ativo": true
  }
}
```

**Fluxo**:
1. Frontend: Upload de arquivo CSV/Excel via `/api/import/contatos`
2. Backend: Valida formato e campos obrigatórios
3. Backend: Valida email único por contato
4. Backend: Aplica regra de contato principal (apenas 1 por cliente)
5. Backend: Insere contatos em batch via JQEL
6. Backend: Retorna relatório (sucessos, erros, warnings)
7. Frontend: Exibe relatório de importação

**Validações**:
- Campo `id_cliente` obrigatório (cliente de destino)
- `nome_contato` obrigatório
- `email_contato` obrigatório e válido
- Apenas 1 contato pode ser marcado como `contato_principal = true`
- Email único no sistema (validar duplicação)

---

## Resumo de Validação

### Campos Validados
- ✅ **13 campos confirmados** na base `sac.contato`
- ✅ **Campo `id_cliente` corrigido** no schema JSON
- ✅ **Todos os campos necessários existem**

### Queries JQEL Necessárias
1. **Insert**: Criar contato
2. **Insert (batch)**: Importação em lote
3. **Update**: Atualizar contato
4. **Update**: Marcar/desmarcar contato principal
5. **Select**: Listar contatos por cliente
6. **Select**: Buscar contato por email
7. **Select**: Buscar contato principal do cliente
8. **Select**: Verificar usuário vinculado

### Dependências Externas
- Sistema de envio de emails (SMTP via n8n)
- Templates de email (credenciais, reset de senha)
- Parser CSV/Excel para importação
- Sistema de geração de tokens (reset de senha)

---

## Resumo de Requisitos

### Estatísticas
- **Total de Requisitos:** 10 (7 originais + 3 novos)
- **Requisitos Validados:** 10/10 ✅
- **Campos Confirmados:** 13 campos na base
- **Workarounds Necessários:** 0 (todos os campos existem)
- **Origem:** OSD044-OSD050 + Análise de necessidades dos usuários
- **User Stories Implementadas:** US010, US011, US012

### Novos Requisitos Adicionados (Análise de Usuários)
- **SPEC-MH-CON-008**: Troca automática de contato principal
- **SPEC-MH-CON-009**: Reenvio de credenciais de acesso
- **SPEC-MH-CON-010**: Importação em lote de contatos

---

**Data de reorganização:** 2025-01-15
**Versão:** 3.0 (Melhorias baseadas em análise de usuários + correção de schema)
**Última validação:** 2025-01-12
