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

## Resumo de Validação

### Campos Validados
- ✅ **7 campos confirmados** na base `system.cliente`
- ⚠️ **2 campos usando workaround** (limites, logo via metadados)
- ❓ **1 campo precisa confirmar** (tabela de auditoria)

### Queries JQEL Necessárias
1. **Insert**: Criar cliente
2. **Update**: Atualizar cliente
3. **Select**: Listar clientes com filtros
4. **Select**: Buscar por documento (validação unicidade)
5. **Select**: Buscar filiais de cliente (hierarquia)
6. **Select/Computed**: Contar chamados por cliente

### Dependências Externas
- Storage de arquivos para upload de logos
- Tabela de auditoria (se disponível)
- Sistema de contagem de chamados (via n8n)

---

## Resumo de Requisitos

### Estatísticas
- **Total de Requisitos:** 7
- **Requisitos Validados:** 7/7 ✅
- **Campos Confirmados:** 15+ campos na base
- **Workarounds Necessários:** 2 (via metadados JSONB)
- **Origem:** OSD037-OSD043
- **User Stories Implementadas:** US007, US008, US009

---

**Data de reorganização:** 2025-01-15
**Versão:** 3.0 (Validado contra CONSTRAINTS.md)
**Última validação:** 2025-01-12
