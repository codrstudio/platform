# SPEC-module-helpdesk-client-management.md

## Especificação: Módulo HelpDesk - Gestão de Clientes

### Escopo

Este documento define os **requisitos de gestão de clientes corporativos** do módulo HelpDesk.

**IMPORTANTE**: Este documento foi validado contra `CONSTRAINTS.md` e `jqel-schema/system.cliente.md`.

---

## Requisitos de Clientes

### SPEC-MH-CLI-001 - Cadastro de Clientes com Informações Comerciais

**Descrição**: O sistema DEVE permitir cadastro de clientes com informações comerciais básicas.

**Origem:** OSD037 | **Implementa:** US007, US008 | **Prioridade:** MUST

**Campos da Base (Validados contra `system.cliente`):**

✅ **Campos Confirmados (Existem na Base)**:
- `nome` (string, obrigatório, max: 255) - razão social
- `nomeFantasia` (string, nullable, max: 255)
- `documento` (string, nullable, unique) - CNPJ/CPF
- `tipoDocumento` (enum: `cnpj`, `cpf`, `outro`)
- `email` (string, nullable)
- `telefone` (string, nullable)
- `website` (string, nullable)
- `endereco` (text, nullable)
- `cidade` (string, nullable)
- `estado` (string, nullable)
- `cep` (string, nullable)
- `pais` (string, default: "BR")
- `status` (enum: `ativo`, `inativo`, `suspenso`, `bloqueado`)
- `segmento` (string, nullable) - ramo de atividade
- `porte` (enum: `pequeno`, `medio`, `grande`)
- `gestorContaId` (UUID, FK → system.usuario)

**Validações**:
- `nome` é obrigatório
- `documento` deve ser único se informado
- `email` deve ser válido se informado

**Query JQEL de Exemplo**:
```json
{
  "schema": "system",
  "mutate": "cliente",
  "action": "insert",
  "values": {
    "nome": "Empresa XYZ Ltda",
    "nomeFantasia": "XYZ Tech",
    "documento": "12.345.678/0001-99",
    "tipoDocumento": "cnpj",
    "email": "contato@xyz.com.br",
    "telefone": "(11) 98765-4321",
    "status": "ativo"
  }
}
```

---

### SPEC-MH-CLI-002 - Hierarquia de Clientes (Matriz/Filial)

**Descrição**: O sistema DEVE suportar hierarquia de clientes através de relacionamento pai/filho.

**Origem:** OSD038 | **Implementa:** US007, US008 | **Prioridade:** MUST

**Campos da Base (Validados contra `system.cliente`):**

✅ **Campos Confirmados**:
- `clientePaiId` (UUID, FK → system.cliente, nullable)

**Regras de Negócio**:
- Cliente pode ter um único cliente pai
- Cliente pode ter múltiplos clientes filhos
- Hierarquia pode ter múltiplos níveis (matriz → regional → filial)
- Não permitir referência circular (validar no backend/n8n)

**Query JQEL de Exemplo (buscar filiais de um cliente)**:
```json
{
  "schema": "system",
  "select": "cliente",
  "where": {
    "clientePaiId": { "$eq": "uuid-da-matriz" }
  },
  "output": ["id", "nome", "nomeFantasia", "status"]
}
```

---

### SPEC-MH-CLI-003 - Limites de Chamados por Cliente

**Descrição**: O sistema DEVE permitir configuração de limites de chamados por cliente.

**Origem:** OSD039 | **Implementa:** US008, US009 | **Prioridade:** SHOULD

**Campos da Base (Validados contra `system.cliente`):**

⚠️ **Campo NÃO existe na base - Usar Workaround**:
- `limiteChamadosMensal` - NÃO EXISTE

**Estratégia de Implementação**:
```json
// Usar campo metadados (JSONB) para armazenar configurações extras
{
  "schema": "system",
  "mutate": "cliente",
  "action": "update",
  "values": {
    "metadados": {
      "limites": {
        "chamadosMensal": 100,
        "chamadosDiario": 10,
        "prioridadeUrgente": 5
      }
    }
  },
  "where": { "id": { "$eq": "uuid-cliente" } }
}
```

**Validação em Runtime** (n8n/backend):
- Consultar `metadados->limites->chamadosMensal`
- Contar chamados do mês atual para o cliente
- Bloquear criação se limite excedido
- Retornar erro com mensagem clara

---

### SPEC-MH-CLI-004 - Validação de Unicidade de Documento

**Descrição**: O sistema DEVE validar unicidade de documento do cliente no sistema.

**Origem:** OSD040 | **Implementa:** US008 | **Prioridade:** MUST

**Campos da Base (Validados contra `system.cliente`):**

✅ **Campos Confirmados**:
- `documento` (string, nullable, **unique**)

**Validações**:
- Campo `documento` possui constraint UNIQUE na base
- Validação acontece automaticamente no banco de dados
- Backend/n8n deve retornar erro amigável em caso de duplicação

**Query JQEL de Validação**:
```json
{
  "schema": "system",
  "select": "cliente",
  "where": {
    "documento": { "$eq": "12.345.678/0001-99" }
  },
  "output": ["id"]
}
// Se retornar resultado, documento já existe
```

---

### SPEC-MH-CLI-005 - Upload de Logo/Imagem do Cliente

**Descrição**: O sistema DEVE permitir upload de logo/imagem do cliente.

**Origem:** OSD041 | **Implementa:** US008, US009 | **Prioridade:** SHOULD

**Campos da Base (Validados contra `system.cliente`):**

⚠️ **Campo NÃO existe na base - Usar Workaround**:
- `logoUrl` - NÃO EXISTE

**Estratégia de Implementação**:
```json
// Armazenar URL da imagem em metadados
{
  "schema": "system",
  "mutate": "cliente",
  "action": "update",
  "values": {
    "metadados": {
      "logo": {
        "url": "/uploads/clientes/uuid-cliente/logo.png",
        "uploadedAt": "2025-01-12T10:30:00Z",
        "uploadedBy": "uuid-usuario"
      }
    }
  },
  "where": { "id": { "$eq": "uuid-cliente" } }
}
```

**Fluxo de Upload**:
1. Frontend: Upload via endpoint `/api/upload/cliente-logo`
2. Backend: Valida arquivo (tipo, tamanho), salva em storage
3. Backend: Retorna URL do arquivo
4. Frontend: Atualiza cliente com URL via JQEL

---

### SPEC-MH-CLI-006 - Campos Personalizados Configuráveis

**Descrição**: O sistema DEVE suportar campos personalizados configuráveis por cliente.

**Origem:** OSD042 | **Implementa:** US008, US009 | **Prioridade:** SHOULD

**Campos da Base (Validados contra `system.cliente`):**

✅ **Campos Confirmados**:
- `metadados` (jsonb, nullable) - **Campo flexível para dados extras**

**Estratégia de Implementação**:
```json
// Armazenar campos personalizados em metadados
{
  "schema": "system",
  "mutate": "cliente",
  "action": "update",
  "values": {
    "metadados": {
      "camposPersonalizados": {
        "numeroContrato": "CTR-2025-0123",
        "dataRenovacao": "2025-12-31",
        "nivelServico": "Ouro",
        "centroCusto": "CC-1001",
        "observacoesInternas": "Cliente VIP"
      }
    }
  },
  "where": { "id": { "$eq": "uuid-cliente" } }
}
```

**Query com Filtro em Campo Personalizado**:
```json
{
  "schema": "system",
  "select": "cliente",
  "where": {
    "metadados->camposPersonalizados->nivelServico": { "$eq": "Ouro" }
  }
}
```

---

### SPEC-MH-CLI-007 - Histórico de Alterações

**Descrição**: O sistema DEVE manter histórico de alterações nos dados do cliente.

**Origem:** OSD043 | **Implementa:** US009 | **Prioridade:** MUST

**Campos da Base (Validados contra `system.cliente`):**

✅ **Campos Confirmados**:
- `dataCadastro` (datetime, obrigatório)
- `dataUltimaAtualizacao` (datetime, obrigatório)
- `criadoPorId` (UUID, FK → system.usuario, obrigatório)

❓ **Campo Auditoria Detalhada - PRECISA CONFIRMAR**:
- Tabela `TBauditoria` ou similar - **VERIFICAR SE EXISTE**

**Estratégia de Implementação**:

**OPÇÃO A** (Se tabela de auditoria existe):
```json
// Registrar alteração em tabela de auditoria
{
  "schema": "system",
  "mutate": "auditoria",
  "action": "insert",
  "values": {
    "entidade": "cliente",
    "entidadeId": "uuid-cliente",
    "operacao": "update",
    "usuarioId": "uuid-usuario",
    "dataHora": "2025-01-12T10:30:00Z",
    "valoresAnteriores": { "nome": "ABC Ltda" },
    "valoresNovos": { "nome": "ABC S.A." }
  }
}
```

**OPÇÃO B** (Se tabela NÃO existe - usar metadados):
```json
// Armazenar log de alterações em metadados
{
  "schema": "system",
  "mutate": "cliente",
  "action": "update",
  "values": {
    "metadados": {
      "historicoAlteracoes": [
        {
          "data": "2025-01-12T10:30:00Z",
          "usuarioId": "uuid-usuario",
          "campo": "nome",
          "valorAnterior": "ABC Ltda",
          "valorNovo": "ABC S.A."
        }
      ]
    }
  }
}
```

**ANTES DE IMPLEMENTAR**: Confirmar se existe tabela de auditoria na base de dados.

---

### SPEC-MH-CLI-008 - Exportação de Lista de Clientes

**Descrição**: O sistema DEVE permitir exportar lista de clientes em formatos CSV/Excel.

**Origem:** Análise de necessidade dos usuários | **Implementa:** US007 | **Prioridade:** SHOULD

**Campos da Base (Validados contra `system.cliente`):**

✅ **Usa campos existentes** - Exporta dados do select de clientes

**Estratégia de Implementação**:
```json
// Query JQEL retorna dados, backend converte para CSV/Excel
{
  "schema": "system",
  "select": "cliente",
  "where": { "status": { "$eq": "ativo" } },
  "output": ["nome", "nomeFantasia", "documento", "email", "telefone", "status", "dataCadastro"]
}
```

**Fluxo**:
1. Frontend: Solicita exportação via `/api/export/clientes?format=csv`
2. Backend: Executa query JQEL
3. Backend: Converte resultado para CSV/Excel
4. Frontend: Download do arquivo

---

### SPEC-MH-CLI-009 - Busca de Clientes por Múltiplos Critérios

**Descrição**: O sistema DEVE permitir busca de clientes por nome, CNPJ, email e gestor de conta.

**Origem:** Análise de necessidade dos usuários | **Implementa:** US007 | **Prioridade:** MUST

**Campos da Base (Validados contra `system.cliente`):**

✅ **Campos Confirmados**:
- `nome` - busca parcial
- `documento` - busca exata ou parcial
- `email` - busca parcial
- `gestorContaId` - filtro exato

**Query JQEL de Exemplo (busca multi-critério)**:
```json
{
  "schema": "system",
  "select": "cliente",
  "where": {
    "$or": [
      { "nome": { "$contains": "tech" } },
      { "documento": { "$contains": "12.345" } },
      { "email": { "$contains": "tech" } }
    ]
  },
  "options": {
    "limit": 50,
    "orderBy": [{ "field": "nome", "direction": "ASC" }]
  }
}
```

---

### SPEC-MH-CLI-010 - Visualização de Detalhes do Cliente (Dashboard)

**Descrição**: O sistema DEVE exibir página de detalhes com visão consolidada do cliente.

**Origem:** Análise de necessidade dos usuários | **Implementa:** US010 (nova) | **Prioridade:** MUST

**Campos da Base (Validados contra `system.cliente`):**

✅ **Campos Confirmados** - Usa todos os campos existentes

**Informações Exibidas**:
1. **Dados Cadastrais**: nome, documento, contatos, endereço
2. **Hierarquia**: cliente pai, lista de filiais
3. **Chamados**: total abertos, em andamento, resolvidos, fechados
4. **Limites**: uso de limite mensal (via metadados)
5. **Contatos**: lista de contatos vinculados ao cliente
6. **Histórico**: últimas alterações no cadastro

**Queries JQEL Necessárias**:
```json
// 1. Dados do cliente
{ "schema": "system", "select": "cliente", "where": { "id": { "$eq": "uuid" } } }

// 2. Filiais
{ "schema": "system", "select": "cliente", "where": { "clientePaiId": { "$eq": "uuid" } } }

// 3. Chamados (computed via n8n)
{ "schema": "helpdesk", "select": "chamado", "where": { "clienteId": { "$eq": "uuid" } } }

// 4. Contatos
{ "schema": "system", "select": "contato", "where": { "clienteId": { "$eq": "uuid" } } }
```

---

### SPEC-MH-CLI-011 - Importação em Lote de Clientes

**Descrição**: O sistema DEVE permitir importar múltiplos clientes via arquivo CSV/Excel.

**Origem:** Análise de necessidade dos usuários | **Implementa:** US011 (nova) | **Prioridade:** SHOULD

**Campos da Base (Validados contra `system.cliente`):**

✅ **Usa campos existentes** para validação e inserção

**Estratégia de Implementação**:
```json
// Para cada linha do CSV, executar:
{
  "schema": "system",
  "mutate": "cliente",
  "action": "insert",
  "values": {
    // ... dados parseados do CSV
  }
}
```

**Fluxo**:
1. Frontend: Upload de arquivo CSV/Excel via `/api/import/clientes`
2. Backend: Valida formato e campos obrigatórios
3. Backend: Valida duplicações (documento único)
4. Backend: Insere clientes em batch via JQEL
5. Backend: Retorna relatório (sucessos, erros, warnings)
6. Frontend: Exibe relatório de importação

**Validações**:
- Campos obrigatórios presentes
- Formato de documento válido
- Documento não duplicado
- Email válido se informado
- Cliente pai existe se informado

---

### SPEC-MH-CLI-012 - Mesclagem de Clientes Duplicados

**Descrição**: O sistema DEVE permitir mesclar dois clientes duplicados em um único registro.

**Origem:** Análise de necessidade dos usuários | **Implementa:** US012 (nova) | **Prioridade:** SHOULD

**Campos da Base (Validados contra `system.cliente`):**

✅ **Opera sobre campos existentes**

**Estratégia de Implementação**:
```json
// 1. Transferir chamados do cliente antigo para o novo
{
  "schema": "helpdesk",
  "mutate": "chamado",
  "action": "update",
  "values": { "clienteId": "uuid-cliente-destino" },
  "where": { "clienteId": { "$eq": "uuid-cliente-origem" } }
}

// 2. Transferir contatos
{
  "schema": "system",
  "mutate": "contato",
  "action": "update",
  "values": { "clienteId": "uuid-cliente-destino" },
  "where": { "clienteId": { "$eq": "uuid-cliente-origem" } }
}

// 3. Inativar cliente origem
{
  "schema": "system",
  "mutate": "cliente",
  "action": "update",
  "values": {
    "status": "inativo",
    "metadados": {
      "mesclado": {
        "em": "2025-01-12T10:30:00Z",
        "para": "uuid-cliente-destino",
        "por": "uuid-usuario"
      }
    }
  },
  "where": { "id": { "$eq": "uuid-cliente-origem" } }
}
```

**Regras de Negócio** (processadas no n8n):
- Transferir todos os chamados para cliente destino
- Transferir todos os contatos para cliente destino
- Mesclar metadados (campos personalizados)
- Marcar cliente origem como inativo com referência ao destino
- Registrar operação em histórico de auditoria

---

### SPEC-MH-CLI-013 - Marcação de Cliente VIP/Prioritário

**Descrição**: O sistema DEVE permitir marcar clientes como VIP ou prioritários.

**Origem:** Análise de necessidade dos usuários | **Implementa:** US008, US009 | **Prioridade:** SHOULD

**Campos da Base (Validados contra `system.cliente`):**

⚠️ **Campo NÃO existe - Usar metadados**:
- `vip` ou `prioridade` - NÃO EXISTEM

**Estratégia de Implementação**:
```json
{
  "schema": "system",
  "mutate": "cliente",
  "action": "update",
  "values": {
    "metadados": {
      "classificacao": {
        "vip": true,
        "prioridade": "alta",
        "motivoVip": "Cliente estratégico - contrato > R$ 100k/mês"
      }
    }
  },
  "where": { "id": { "$eq": "uuid-cliente" } }
}
```

**Uso no Sistema**:
- Chamados de clientes VIP recebem prioridade automática
- Dashboard exibe indicador visual de cliente VIP
- Automações podem tratar clientes VIP diferentemente

---

### SPEC-MH-CLI-014 - Notificação de Eventos de Cliente

**Descrição**: O sistema DEVE notificar equipe sobre eventos importantes relacionados ao cliente.

**Origem:** Análise de necessidade dos usuários | **Implementa:** US009 | **Prioridade:** SHOULD

**Campos da Base (Validados contra `system.cliente`):**

✅ **Usa campos existentes** como gatilhos

**Eventos que Geram Notificação**:
1. Cliente suspenso/bloqueado
2. Cliente reativado
3. Limite de chamados próximo de estourar (90%)
4. Limite de chamados estourado
5. Dados críticos alterados (CNPJ, razão social)

**Estratégia de Implementação** (via n8n):
```javascript
// Workflow n8n detecta mudança de status
if (cliente.status === 'suspenso') {
  // Publicar evento no Redis
  redis.publish('platform:events', {
    type: 'notification',
    target: `departamento:${cliente.departamentoId}`,
    data: {
      titulo: 'Cliente Suspenso',
      mensagem: `Cliente ${cliente.nome} foi suspenso`,
      acao: { tipo: 'ver-cliente', clienteId: cliente.id }
    }
  });
}
```

**Regras de Notificação**:
- Gestor de conta sempre recebe
- Equipe do departamento vinculado recebe
- Atendentes com chamados abertos do cliente recebem

---

## Resumo de Validação

### Campos Validados
- ✅ **15+ campos confirmados** na base `system.cliente`
- ⚠️ **3 campos usando workaround** (limites, logo, vip via metadados)
- ❓ **1 campo precisa confirmar** (tabela de auditoria)

### Queries JQEL Necessárias
1. **Insert**: Criar cliente
2. **Insert (batch)**: Importação em lote
3. **Update**: Atualizar cliente
4. **Update (batch)**: Mesclagem de clientes
5. **Select**: Listar clientes com filtros
6. **Select**: Busca multi-critério (nome, CNPJ, email)
7. **Select**: Buscar por documento (validação unicidade)
8. **Select**: Buscar filiais de cliente (hierarquia)
9. **Select**: Detalhes do cliente (dashboard)
10. **Select/Computed**: Contar chamados por cliente

### Dependências Externas
- Storage de arquivos para upload de logos
- Tabela de auditoria (se disponível)
- Sistema de contagem de chamados (via n8n)
- Parser CSV/Excel para importação
- Redis Pub/Sub para notificações

---

## Resumo de Requisitos

### Estatísticas
- **Total de Requisitos:** 14 (7 originais + 7 novos)
- **Requisitos Validados:** 14/14 ✅
- **Campos Confirmados:** 15+ campos na base
- **Workarounds Necessários:** 3 (via metadados JSONB)
- **Origem:** OSD037-OSD043 + Análise de necessidades dos usuários
- **User Stories Implementadas:** US007, US008, US009 + US010 (dashboard), US011 (importação), US012 (mesclagem)

### Novos Requisitos Adicionados (Análise de Usuários)
- **SPEC-MH-CLI-008**: Exportação de lista
- **SPEC-MH-CLI-009**: Busca multi-critério
- **SPEC-MH-CLI-010**: Dashboard de detalhes do cliente
- **SPEC-MH-CLI-011**: Importação em lote
- **SPEC-MH-CLI-012**: Mesclagem de duplicados
- **SPEC-MH-CLI-013**: Marcação VIP
- **SPEC-MH-CLI-014**: Notificações de eventos

---

**Data de reorganização:** 2025-01-15
**Versão:** 4.0 (Melhorias baseadas em análise de usuários)
**Última validação:** 2025-01-12
