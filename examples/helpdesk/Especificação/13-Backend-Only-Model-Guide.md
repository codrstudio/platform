# Backend-Only Model Guide - Coletivos HelpDesk

## 📋 Visão Geral

Este documento cataloga **campos que existem no schema SQL** ([05-Complete-Schema-Guide.md](./05-Complete-Schema-Guide.md)) mas **não estão expostos no modelo TypeScript** ([12-Complete-Model-Guide.md](./12-Complete-Model-Guide.md)).

**Por quê esses campos não estão no modelo frontend?**

- **Segurança**: Campos sensíveis que não devem ser expostos ao cliente (senhas, tokens)
- **Controle interno**: Campos gerenciados exclusivamente pelas procedures JSQL
- **Auditoria**: Metadados preenchidos automaticamente por triggers/procedures
- **Performance**: Campos que não afetam a lógica do frontend

---

## 🔐 Módulo: Autenticação e Controle de Acesso

### TBusuario - Campos de Segurança

#### `DFhash_senha` (VARCHAR(255), NOT NULL)
**Por que não expor:** Sensível - hash bcrypt da senha
**Gerenciado por:** Procedure `n8n_get_usuario_autenticacao` (hash via N8N)
**Uso backend:**
- Armazenar senha com bcrypt (salt automático)
- Nunca retornar em SELECT
- Atualizar apenas via endpoint de troca de senha

**Validações:**
- Hash deve ter no mínimo 60 caracteres (bcrypt padrão)
- Nunca armazenar senha em texto plano
- Nunca incluir em responses JSON

---

#### `DFtoken_recuperacao` (VARCHAR(100), NULL)
**Por que não expor:** Sensível - token temporário para reset de senha
**Gerenciado por:** Workflow N8N `coletivos-aut.json`
**Uso backend:**
- Gerar token único ao solicitar recuperação de senha
- Validar token antes de permitir reset
- Limpar após uso ou expiração

**Validações:**
- Deve ser único quando preenchido
- Expirar em 24 horas (ver `DFdata_expiracao_token`)
- Usar UUID v4 ou similar

---

#### `DFdata_expiracao_token` (DATETIME, NULL)
**Por que não expor:** Controle interno de segurança
**Gerenciado por:** Workflow N8N `coletivos-aut.json`
**Uso backend:**
- Definir validade do token de recuperação
- Validar antes de aceitar reset de senha
- Limpar tokens expirados automaticamente

**Validações:**
- Deve ser preenchido junto com `DFtoken_recuperacao`
- Deve ser > data atual quando token é criado
- Padrão: GETDATE() + 24 horas

---

#### `DFtentativas_login_falhadas` (INT, DEFAULT 0)
**Por que não expor:** Controle interno de segurança
**Gerenciado por:** Procedure `n8n_get_usuario_autenticacao`
**Uso backend:**
- Incrementar a cada tentativa de login com senha errada
- Resetar para 0 após login bem-sucedido
- Bloquear após 5 tentativas (ver `DFdata_bloqueio`)

**Validações:**
- DEFAULT 0
- Bloquear usuário quando >= 5
- Resetar após login bem-sucedido

---

#### `DFdata_bloqueio` (DATETIME, NULL)
**Por que não expor:** Controle interno de segurança
**Gerenciado por:** Procedure `n8n_get_usuario_autenticacao`
**Uso backend:**
- Preenchido automaticamente quando `DFtentativas_login_falhadas` >= 5
- Impedir login enquanto != NULL
- Admin pode desbloquear manualmente (SET NULL)

**Validações:**
- NULL = não bloqueado
- NOT NULL = bloqueado
- Apenas admin pode limpar

---

### TBusuario_papel - Campos de Auditoria

#### `DFdata_atribuicao` (DATETIME, DEFAULT GETDATE())
**Por que não expor:** Metadado de auditoria
**Gerenciado por:** Procedure `jsql__mutate__usuario_papel`
**Uso backend:**
- Registrar quando o papel foi atribuído ao usuário
- Para relatórios de auditoria
- Não permitir alteração após criação

**Validações:**
- DEFAULT GETDATE()
- Nunca alterar após INSERT

---

#### `DFdata_expiracao` (DATETIME, NULL)
**Por que não expor:** Controle interno - papéis temporários
**Gerenciado por:** Procedure `jsql__mutate__usuario_papel` + JOB automático
**Uso backend:**
- Permitir papéis com prazo de validade
- NULL = sem expiração (permanente)
- Job automático remove papéis expirados

**Validações:**
- NULL = sem expiração
- Se preenchido, deve ser > `DFdata_atribuicao`
- Remover automaticamente quando expirado

---

#### `DFid_usuario_atribuidor` (INT, NOT NULL, FK)
**Por que não expor:** Metadado de auditoria
**Gerenciado por:** Procedure `jsql__mutate__usuario_papel`
**Uso backend:**
- Registrar quem atribuiu o papel
- Para auditoria e rastreabilidade
- Pegar do contexto JWT da requisição

**Validações:**
- NOT NULL
- FK válida para `TBusuario.DFid_usuario`
- Nunca alterar após INSERT

---

#### `DFativo` (BIT, DEFAULT 1)
**Por que não expor:** Controle interno - soft delete
**Gerenciado por:** Procedure `jsql__mutate__usuario_papel` (action: delete)
**Uso backend:**
- Inativar atribuição sem remover do banco
- Filtrar apenas ativos nas queries
- Preservar histórico de auditoria

**Validações:**
- DEFAULT 1
- 0 = inativo (não considera na validação de permissões)
- Não deletar fisicamente (soft delete)

---

### TBpapel - Campos de Documentação

#### `DFobservacoes` (NVARCHAR(MAX), NULL)
**Por que não expor:** Documentação interna
**Gerenciado por:** Admin via interface de configuração
**Uso backend:**
- Notas internas sobre o papel
- Não afeta lógica de permissões
- Apenas para documentação

**Validações:**
- NULL permitido
- Tamanho ilimitado (NVARCHAR(MAX))

---


### TBusuario_permissao - Campos de Auditoria

#### `DFdata_concessao` (DATETIME, DEFAULT GETDATE())
**Por que não expor:** Metadado de auditoria
**Gerenciado por:** Procedure `jsql__mutate__usuario_permissao`
**Uso backend:**
- Registrar quando a permissão foi concedida
- Para relatórios de auditoria
- Não permitir alteração após criação

**Validações:**
- DEFAULT GETDATE()
- Nunca alterar após INSERT

---

#### `DFid_usuario_concessor` (INT, NOT NULL, FK)
**Por que não expor:** Metadado de auditoria
**Gerenciado por:** Procedure `jsql__mutate__usuario_permissao`
**Uso backend:**
- Registrar quem concedeu a permissão individual
- Para auditoria e rastreabilidade
- Pegar do contexto JWT da requisição

**Validações:**
- NOT NULL
- FK válida para `TBusuario.DFid_usuario`
- Nunca alterar após INSERT

---

#### `DFmotivo` (VARCHAR(255), NOT NULL)
**Por que não expor:** Justificativa obrigatória (auditoria)
**Gerenciado por:** Admin via interface de configuração
**Uso backend:**
- Justificar override de permissões individuais
- Obrigatório para auditoria e compliance
- Exibir em relatórios de auditoria

**Validações:**
- NOT NULL (obrigatório)
- Mínimo 10 caracteres
- Deve explicar motivo do override

**⚠️ Observação:** Este campo **APARECE** no Model Guide apenas na VIEW `TBpermissao_efetiva.motivo_permissao_usuario`, mas não na entidade de relacionamento `UsuarioPermissao`.

---

## 🎫 Módulo: Chamados


### TBcategoria - Campo de Documentação

#### `DFdescricao_categoria` (VARCHAR(255), NULL)
**Por que não expor:** Documentação interna
**Gerenciado por:** Admin via interface de configuração
**Uso backend:**
- Descrever quando usar esta categoria
- Não afeta lógica de chamados
- Apenas para documentação

**Validações:**
- NULL permitido
- Exibir apenas em interface admin

---

## 🏷️ Módulo: Tags e Organização

### TBentidade_tag - Campo de Auditoria

#### `DFid_usuario_aplicacao` (INT, NOT NULL, FK)
**Por que não expor:** Metadado de auditoria
**Gerenciado por:** Procedure `jsql__mutate__entidade_tag`
**Uso backend:**
- Registrar quem aplicou a tag
- Para auditoria e rastreabilidade
- Pegar do contexto JWT da requisição

**Validações:**
- NOT NULL
- FK válida para `TBusuario.DFid_usuario`
- Nunca alterar após INSERT

---

## 📊 Tabela de Resumo

| Tabela | Campo | Tipo | Motivo | Gerenciado Por |
|--------|-------|------|--------|----------------|
| **TBusuario** | `DFhash_senha` | VARCHAR(255) | Segurança | Procedure autenticação |
| **TBusuario** | `DFtoken_recuperacao` | VARCHAR(100) | Segurança | Workflow N8N |
| **TBusuario** | `DFdata_expiracao_token` | DATETIME | Controle interno | Workflow N8N |
| **TBusuario** | `DFtentativas_login_falhadas` | INT | Controle interno | Procedure autenticação |
| **TBusuario** | `DFdata_bloqueio` | DATETIME | Controle interno | Procedure autenticação |
| **TBusuario_papel** | `DFdata_atribuicao` | DATETIME | Auditoria | Procedure JSQL |
| **TBusuario_papel** | `DFdata_expiracao` | DATETIME | Controle interno | Procedure JSQL + JOB |
| **TBusuario_papel** | `DFid_usuario_atribuidor` | INT | Auditoria | Procedure JSQL |
| **TBusuario_papel** | `DFativo` | BIT | Soft delete | Procedure JSQL |
| **TBpapel** | `DFobservacoes` | NVARCHAR(MAX) | Documentação | Admin UI |
| **TBusuario_permissao** | `DFdata_concessao` | DATETIME | Auditoria | Procedure JSQL |
| **TBusuario_permissao** | `DFid_usuario_concessor` | INT | Auditoria | Procedure JSQL |
| **TBusuario_permissao** | `DFmotivo` | VARCHAR(255) | Auditoria | Admin UI |
| **TBcategoria** | `DFdescricao_categoria` | VARCHAR(255) | Documentação | Admin UI |
| **TBentidade_tag** | `DFid_usuario_aplicacao` | INT | Auditoria | Procedure JSQL |

---

## 🔒 Regras de Segurança

### Campos que NUNCA devem ser expostos ao frontend:

1. **`DFhash_senha`** - Hash de senha (bcrypt)
2. **`DFtoken_recuperacao`** - Token de reset de senha
3. **`DFdata_expiracao_token`** - Validade do token
4. **`DFtentativas_login_falhadas`** - Contador de tentativas
5. **`DFdata_bloqueio`** - Timestamp de bloqueio

### Campos que podem ser expostos em contextos específicos:

1. **`DFdescricao_categoria`** - Apenas em interfaces admin
2. **`DFmotivo`** - Apenas via VIEW `TBpermissao_efetiva` (já exposto)

### Campos de auditoria (não necessários no frontend):

- `DFdata_atribuicao`
- `DFdata_concessao`
- `DFid_usuario_atribuidor`
- `DFid_usuario_concessor`
- `DFid_usuario_aplicacao`

Esses campos são úteis para **relatórios de auditoria backend**, mas não afetam a lógica do frontend.

---

## 🛡️ Implementação nas Procedures JSQL

### SELECT - Filtragem de Campos Sensíveis

**Todas as procedures `jsql__select__*` devem:**

```sql
-- ❌ NUNCA retornar campos sensíveis
-- Exemplo: sac.jsql__select__usuario
SELECT
    DFid_usuario,
    DFemail_usuario,
    DFnome_exibicao,
    -- ... campos seguros ...
    -- ❌ NÃO incluir: DFhash_senha, DFtoken_recuperacao, etc.
FROM sac.TBusuario
WHERE DFativo = 1
```

### MUTATE - Proteção de Campos

**Procedures `jsql__mutate__*` devem:**

```sql
-- Campos sensíveis só podem ser alterados por procedures específicas
-- Exemplo: troca de senha
IF @action = 'alterar_senha'
BEGIN
    UPDATE sac.TBusuario
    SET DFhash_senha = @novo_hash_senha -- via bcrypt
    WHERE DFid_usuario = @id_usuario
END

-- ❌ Não permitir update direto via jsql__mutate__usuario
```

### Validações Automáticas

**Triggers e constraints devem:**

```sql
-- Preencher campos de auditoria automaticamente
CREATE TRIGGER TR_TBusuario_papel_INSERT
ON sac.TBusuario_papel
AFTER INSERT
AS
BEGIN
    -- Preencher automaticamente
    UPDATE sac.TBusuario_papel
    SET DFdata_atribuicao = GETDATE(),
        DFid_usuario_atribuidor = CONTEXT_INFO() -- do JWT
    WHERE DFid_usuario IN (SELECT DFid_usuario FROM INSERTED)
END
```

---

## 📚 Referências

- **Schema SQL completo:** [05-Complete-Schema-Guide.md](./05-Complete-Schema-Guide.md)
- **Modelo TypeScript:** [12-Complete-Model-Guide.md](./12-Complete-Model-Guide.md)
- **Tipos Frontend:** `src/helpdesk/src/core/types/entities.ts`
- **Procedures JSQL:** `database/schemata/sac/sac.jsql__*.sql`

---

## ✅ Checklist de Implementação

Ao criar procedures JSQL, verificar:

- [ ] Campos sensíveis (senha, tokens) **não** são retornados em SELECT
- [ ] Campos de auditoria são preenchidos **automaticamente** (triggers)
- [ ] Campos de controle interno **não** são alteráveis via MUTATE direto
- [ ] Validações de segurança (bloqueio, tentativas) são **aplicadas** nas procedures
- [ ] Campos de documentação (observações, descrições) são opcionais
- [ ] Soft delete usa campo `DFativo` em vez de DELETE físico
- [ ] Metadados (quem criou, quando) são registrados para auditoria

---

Este documento garante **separação clara** entre campos backend (segurança/auditoria) e campos frontend (lógica de negócio), mantendo a segurança e integridade do sistema.
