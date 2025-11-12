# Complete Schema Guide - Coletivos HelpDesk

## 📋 Visão Geral

Este guia de referência detalha o uso correto de cada campo de cada tabela do schema SAC, garantindo implementação consistente e correta utilização em todas as fases do desenvolvimento do sistema Coletivos HelpDesk.

---

## 🔐 Tabelas de Autenticação e Usuários

### TBusuario - Usuários do Sistema

**Propósito:** Centraliza autenticação e perfil de todos os usuários do sistema (atendentes, contatos, técnicos).

| Campo | Tipo | Uso Correto | Validações | Observações |
|-------|------|-------------|------------|-------------|
| `DFid_usuario` | INT IDENTITY | PK auto-incremento | NOT NULL, UNIQUE | Nunca alterar após criação |
| `DFemail_usuario` | VARCHAR(255) | Email único para login | NOT NULL, UNIQUE, formato email | Validar formato e unicidade |
| `DFnome_exibicao` | VARCHAR(100) | Nome mostrado na interface | NOT NULL, min 2 chars | Pode ser diferente do nome real |
| `DFhash_senha` | VARCHAR(255) | Hash bcrypt da senha | NOT NULL | Nunca armazenar senha em texto |
| `DFtoken_recuperacao` | VARCHAR(100) | Token temporário para reset | NULL, único quando presente | Expirar em 24h |
| `DFdata_expiracao_token` | DATETIME | Validade do token | NULL quando sem token | Validar antes de usar token |
| `DFavatar_url` | VARCHAR(500) | URL da foto do usuário | NULL permitido | Validar URL e tamanho da imagem |
| `DFfuso_horario` | VARCHAR(50) | Timezone do usuário | DEFAULT 'America/Sao_Paulo' | Usar para cálculos de data/hora |
| `DFidioma` | CHAR(2) | Código ISO do idioma | DEFAULT 'pt' | Para internacionalização |
| `DFtema_interface` | VARCHAR(20) | Tema da interface | DEFAULT 'auto' | 'claro', 'escuro', 'auto' |
| `DFultimo_login` | DATETIME | Data do último acesso | NULL até primeiro login | Atualizar a cada login |
| `DFip_ultimo_login` | VARCHAR(45) | IP do último acesso | NULL até primeiro login | Suporta IPv4 e IPv6 |
| `DFtentativas_login_falhadas` | INT | Contador de falhas | DEFAULT 0 | Resetar após login bem-sucedido |
| `DFdata_bloqueio` | DATETIME | Quando foi bloqueado | NULL se não bloqueado | Bloquear após 5 tentativas |
| `DFativo` | BIT | Se usuário está ativo | DEFAULT 1 | Inativar em vez de deletar |
| `DFdata_criacao` | DATETIME | Quando foi criado | DEFAULT GETDATE() | Nunca alterar |
| `DFdata_ultima_atualizacao` | DATETIME | Última modificação | DEFAULT GETDATE() | Atualizar automaticamente |

**Regras de Negócio:**
- Email deve ser único em todo o sistema
- Senha deve ter hash bcrypt com salt
- Token de recuperação expira em 24 horas
- Bloquear após 5 tentativas de login falhadas
- Usuários inativos não podem fazer login
- Fuso horário usado para exibir datas localizadas

### TBpapel - Papéis do Sistema

**Propósito:** Define papéis de acesso com permissões específicas.

| Campo | Tipo | Uso Correto | Validações | Observações |
|-------|------|-------------|------------|-------------|
| `DFid_papel` | INT IDENTITY | PK auto-incremento | NOT NULL, UNIQUE | Nunca alterar após criação |
| `DFcodigo_papel` | VARCHAR(20) | Código único do papel | NOT NULL, UNIQUE | MAIÚSCULO, sem espaços |
| `DFnome_papel` | VARCHAR(50) | Nome amigável | NOT NULL | Para exibição na interface |
| `DFdescricao_papel` | VARCHAR(255) | Descrição detalhada | NULL permitido | Explicar propósito do papel |
| `DFfixo` | BIT | Se é papel fixo | DEFAULT 0 | Papéis fixos não podem ser removidos |
| `DFpermite_explorar` | BIT | Pode navegar no sistema | DEFAULT 1 | Permissão básica de leitura |
| `DFpermite_alterar` | BIT | Pode modificar dados | DEFAULT 0 | Permissão de escrita |
| `DFpermite_configurar` | BIT | Pode alterar configurações | DEFAULT 0 | Permissão administrativa |
| `DFativo` | BIT | Se papel está ativo | DEFAULT 1 | Inativar em vez de deletar |
| `DFdata_criacao` | DATETIME | Quando foi criado | DEFAULT GETDATE() | Nunca alterar |

**Regras de Negócio:**
- Papéis ESPECTADOR e ADMINISTRADOR são fixos
- Código do papel deve ser único e em maiúsculas
- Não permitir remoção de papéis fixos
- Não permitir remoção se há usuários atribuídos

### TBusuario_papel - Atribuição de Papéis

**Propósito:** Relaciona usuários com seus papéis (N:N).

| Campo | Tipo | Uso Correto | Validações | Observações |
|-------|------|-------------|------------|-------------|
| `DFid_usuario` | INT | FK para TBusuario | NOT NULL, FK válida | Usuário deve existir |
| `DFid_papel` | INT | FK para TBpapel | NOT NULL, FK válida | Papel deve estar ativo |
| `DFdata_atribuicao` | DATETIME | Quando foi atribuído | DEFAULT GETDATE() | Para auditoria |
| `DFdata_expiracao` | DATETIME | Quando expira | NULL = sem expiração | Para papéis temporários |
| `DFid_usuario_atribuidor` | INT | Quem atribuiu | NOT NULL, FK válida | Para auditoria |
| `DFativo` | BIT | Se atribuição está ativa | DEFAULT 1 | Para desativar sem deletar |

**Regras de Negócio:**
- Não permitir papéis duplicados para mesmo usuário
- Validar data de expiração > data atual
- Remover automaticamente papéis expirados
- Não permitir remoção do último ADMINISTRADOR

### TBpermissao - Catálogo de Permissões

**Propósito:** Define todas as permissões disponíveis no sistema.

| Campo | Tipo | Uso Correto | Validações | Observações |
|-------|------|-------------|------------|-------------|
| `DFid_permissao` | INT IDENTITY | PK auto-incremento | NOT NULL, UNIQUE | Nunca alterar após criação |
| `DFcodigo_permissao` | VARCHAR(100) | Código único da permissão | NOT NULL, UNIQUE | snake_case, descritivo |
| `DFnome_permissao` | VARCHAR(100) | Nome amigável | NOT NULL | Para exibição na interface |
| `DFdescricao_permissao` | VARCHAR(255) | Descrição detalhada | NULL permitido | Explicar o que a permissão permite |
| `DFcategoria` | VARCHAR(50) | Categoria da permissão | NOT NULL | Agrupar permissões similares |
| `DFtipo_acao` | VARCHAR(20) | Tipo de ação | NOT NULL | 'select', 'mutate', 'delete', etc. |
| `DFrecurso` | VARCHAR(50) | Recurso afetado | NOT NULL | 'usuario', 'chamado', 'cliente', etc. |
| `DFoperacao` | VARCHAR(50) | Operação específica | NULL permitido | 'criar', 'editar', 'remover', etc. |
| `DFativo` | BIT | Se permissão está ativa | DEFAULT 1 | Para desativar sem deletar |

**Regras de Negócio:**
- Código deve seguir padrão: tipo_acao__recurso__operacao
- Categorias ajudam na organização da interface
- Permissões inativas não aparecem na interface

### TBpapel_permissao - Permissões por Papel

**Propósito:** Define permissões de cada papel.

| Campo | Tipo | Uso Correto | Validações | Observações |
|-------|------|-------------|------------|-------------|
| `DFid_papel` | INT | FK para TBpapel | NOT NULL, FK válida | Papel deve existir |
| `DFid_permissao` | INT | FK para TBpermissao | NOT NULL, FK válida | Permissão deve estar ativa |
| `DFpermitido` | BIT | Se é permitido | NULL = indefinido | true/false/null |

**Regras de Negócio:**
- NULL significa indefinido (não permitido nem negado)
- true significa explicitamente permitido
- false significa explicitamente negado

### TBusuario_permissao - Permissões Individuais

**Propósito:** Override de permissões específicas por usuário.

| Campo | Tipo | Uso Correto | Validações | Observações |
|-------|------|-------------|------------|-------------|
| `DFid_usuario` | INT | FK para TBusuario | NOT NULL, FK válida | Usuário deve existir |
| `DFid_permissao` | INT | FK para TBpermissao | NOT NULL, FK válida | Permissão deve estar ativa |
| `DFpermitido` | BIT | Se é permitido | NULL = indefinido | true/false/null |
| `DFdata_concessao` | DATETIME | Quando foi concedido | DEFAULT GETDATE() | Para auditoria |
| `DFdata_expiracao` | DATETIME | Quando expira | NULL = sem expiração | Para permissões temporárias |
| `DFid_usuario_concessor` | INT | Quem concedeu | NOT NULL, FK válida | Para auditoria |
| `DFmotivo` | VARCHAR(255) | Justificativa | NOT NULL | Obrigatório para auditoria |

**Regras de Negócio:**
- Motivo é obrigatório para justificar exceções
- Permissões expiradas são removidas automaticamente
- Override individual tem precedência sobre papel

### TBrefresh_token - Tokens de Atualização

**Propósito:** Armazena refresh tokens para renovação de sessões com suporte a rotation e detecção de reuso.

| Campo | Tipo | Uso Correto | Validações | Observações |
|-------|------|-------------|------------|-------------|
| `DFid` | BIGINT IDENTITY | PK auto-incremento | NOT NULL, UNIQUE | BIGINT para suportar alto volume |
| `DFid_usuario` | BIGINT | FK para TBusuario | NOT NULL, FK válida | Proprietário do token |
| `DFtoken_hash` | VARCHAR(64) | Hash SHA-256 do token | NOT NULL, UNIQUE | 64 caracteres hexadecimais |
| `DFfamilia_id` | VARCHAR(36) | UUID da família | NOT NULL | Agrupa tokens da mesma cadeia |
| `DFexpira_em` | DATETIME | Data de expiração | NOT NULL | Padrão: 7 dias após criação |
| `DFcriado_em` | DATETIME | Quando foi criado | DEFAULT GETDATE() | Nunca alterar |
| `DFusado_em` | DATETIME | Quando foi usado | NULL = não usado | Preenchido na primeira renovação |
| `DFrevogado` | BIT | Se foi revogado | DEFAULT 0 | 1 = token invalidado |
| `DFdevice_info` | NVARCHAR(500) | Info do dispositivo | NULL permitido | User-Agent para auditoria |
| `DFip_origem` | VARCHAR(45) | IP de criação | NULL permitido | Suporta IPv4 e IPv6 |

**Regras de Negócio:**
- **Token Rotation:** Cada uso gera novo token, invalidando o anterior
- **Detecção de Reuso:** Se `DFusado_em` preenchido e token usado novamente, detecta comprometimento
- **Revogação em Família:** Ao detectar reuso, todos os tokens da mesma `DFfamilia_id` são revogados
- **Expiração:** Tokens expirados (`DFexpira_em` < now) são inválidos
- **Hash:** Apenas hash SHA-256 é armazenado, nunca o token original
- **Família:** UUID compartilhado por todos os tokens da mesma cadeia de rotation
- **Limpeza:** Tokens expirados e revogados devem ser removidos periodicamente

---

## 🏢 Tabelas de Clientes e Contatos

### TBcliente - Clientes/Organizações

**Propósito:** Representa organizações que utilizam o sistema de suporte.

| Campo | Tipo | Uso Correto | Validações | Observações |
|-------|------|-------------|------------|-------------|
| `DFid_cliente` | INT IDENTITY | PK auto-incremento | NOT NULL, UNIQUE | Nunca alterar após criação |
| `DFid_cliente_pai` | INT | FK para cliente pai | NULL, FK válida se preenchido | Para hierarquia organizacional |
| `DFnome_cliente` | VARCHAR(255) | Nome da organização | NOT NULL, UNIQUE | Deve ser único no sistema |
| `DFnome_fantasia` | VARCHAR(255) | Nome fantasia | NULL permitido | Nome comercial |
| `DFcnpj` | VARCHAR(18) | CNPJ formatado | NULL, formato válido | Validar formato se preenchido |
| `DFsite_web` | VARCHAR(255) | Website da empresa | NULL, formato URL | Validar URL se preenchido |
| `DFtelefone_principal` | VARCHAR(20) | Telefone principal | NULL permitido | Formato livre |
| `DFemail_principal` | VARCHAR(255) | Email principal | NULL, formato email | Para comunicações gerais |
| `DFendereco_completo` | VARCHAR(500) | Endereço completo | NULL permitido | Endereço físico |
| `DFlimite_chamados_mensal` | INT | Limite de chamados/mês | NULL = ilimitado | Para controle de quota |
| `DFativo` | BIT | Se cliente está ativo | DEFAULT 1 | Inativar em vez de deletar |
| `DFdata_criacao` | DATETIME | Quando foi criado | DEFAULT GETDATE() | Nunca alterar |
| `DFcampos_personalizados` | NVARCHAR(MAX) | JSON com campos extras | NULL, JSON válido | Para extensibilidade |

**Regras de Negócio:**
- Nome do cliente deve ser único
- Cliente pai deve ser diferente do próprio cliente
- CNPJ deve ser válido se preenchido
- Limite de chamados controla abertura mensal

### TBcontato - Contatos dos Clientes

**Propósito:** Representa pessoas físicas que interagem com o suporte.

| Campo | Tipo | Uso Correto | Validações | Observações |
|-------|------|-------------|------------|-------------|
| `DFid_contato` | INT IDENTITY | PK auto-incremento | NOT NULL, UNIQUE | Nunca alterar após criação |
| `DFid_usuario` | INT | FK para TBusuario | NULL, FK válida se preenchido | Para acesso ao portal |
| `DFid_cliente` | INT | FK para TBcliente | NOT NULL, FK válida | Contato deve pertencer a cliente |
| `DFnome_contato` | VARCHAR(100) | Nome completo | NOT NULL | Nome da pessoa |
| `DFemail_contato` | VARCHAR(255) | Email do contato | NOT NULL, formato email | Para comunicações |
| `DFtelefone_contato` | VARCHAR(20) | Telefone do contato | NULL permitido | Formato livre |
| `DFcargo_contato` | VARCHAR(100) | Cargo na empresa | NULL permitido | Posição hierárquica |
| `DFdepartamento_contato` | VARCHAR(100) | Departamento | NULL permitido | Setor de trabalho |
| `DFcontato_principal` | BIT | Se é contato principal | DEFAULT 0 | Apenas um por cliente |
| `DFrecebe_notificacoes` | BIT | Se recebe notificações | DEFAULT 1 | Para controle de comunicação |
| `DFativo` | BIT | Se contato está ativo | DEFAULT 1 | Inativar em vez de deletar |
| `DFdata_criacao` | DATETIME | Quando foi criado | DEFAULT GETDATE() | Nunca alterar |
| `DFobservacoes` | NVARCHAR(MAX) | Observações gerais | NULL permitido | Informações adicionais |

**Regras de Negócio:**
- Email deve ser único no sistema
- Apenas um contato principal por cliente
- Contato vinculado a usuário pode acessar portal
- Contatos inativos não recebem notificações

---

## 👨‍💼 Tabelas de Atendentes e Departamentos

### TBatendente - Atendentes do Sistema

**Propósito:** Representa funcionários que atendem chamados e chats.

| Campo | Tipo | Uso Correto | Validações | Observações |
|-------|------|-------------|------------|-------------|
| `DFid_atendente` | INT IDENTITY | PK auto-incremento | NOT NULL, UNIQUE | Nunca alterar após criação |
| `DFid_usuario` | INT | FK para TBusuario | NULL, FK válida se preenchido | Para acesso ao sistema |
| `DFnome_atendente` | VARCHAR(100) | Nome completo | NOT NULL | Nome do funcionário |
| `DFemail_atendente` | VARCHAR(255) | Email corporativo | NOT NULL, formato email | Para comunicações internas |
| `DFtelefone_atendente` | VARCHAR(20) | Telefone corporativo | NULL permitido | Formato livre |
| `DFcargo` | VARCHAR(100) | Cargo/função | NULL permitido | Posição na empresa |
| `DFnivel_experiencia` | CHAR(1) | Nível de experiência | DEFAULT 'J' | 'J'unior, 'P'leno, 'S'enior |
| `DFespecialidades` | VARCHAR(255) | Áreas de especialidade | NULL permitido | Lista separada por vírgula |
| `DFativo` | BIT | Se atendente está ativo | DEFAULT 1 | Inativar em vez de deletar |
| `DFdata_admissao` | DATE | Data de admissão | NULL permitido | Para cálculos de experiência |
| `DFdata_demissao` | DATE | Data de demissão | NULL se ativo | Para histórico |
| `DFdata_criacao` | DATETIME | Quando foi criado | DEFAULT GETDATE() | Nunca alterar |
| `DFobservacoes` | NVARCHAR(MAX) | Observações gerais | NULL permitido | Informações adicionais |

**Regras de Negócio:**
- Email deve ser único no sistema
- Atendente com usuário pode fazer login
- Nível de experiência afeta distribuição de chamados
- Data demissão deve ser >= data admissão

### TBdepartamento - Departamentos

**Propósito:** Organiza atendentes em grupos funcionais.

| Campo | Tipo | Uso Correto | Validações | Observações |
|-------|------|-------------|------------|-------------|
| `DFid_departamento` | INT IDENTITY | PK auto-incremento | NOT NULL, UNIQUE | Nunca alterar após criação |
| `DFnome_departamento` | VARCHAR(100) | Nome do departamento | NOT NULL, UNIQUE | Deve ser único |
| `DFdescricao_departamento` | VARCHAR(255) | Descrição detalhada | NULL permitido | Propósito do departamento |
| `DFemail_departamento` | VARCHAR(255) | Email do departamento | NULL, formato email | Para receber chamados |
| `DFativo` | BIT | Se departamento está ativo | DEFAULT 1 | Inativar em vez de deletar |
| `DFdata_criacao` | DATETIME | Quando foi criado | DEFAULT GETDATE() | Nunca alterar |
| `DFobservacoes` | NVARCHAR(MAX) | Observações gerais | NULL permitido | Informações adicionais |

**Regras de Negócio:**
- Nome deve ser único no sistema
- Email do departamento pode receber chamados via email
- Departamentos inativos não aparecem na interface

### TBatendente_departamento - Associação Atendente-Departamento

**Propósito:** Relaciona atendentes com departamentos (N:N).

| Campo | Tipo | Uso Correto | Validações | Observações |
|-------|------|-------------|------------|-------------|
| `DFid_atendente` | INT | FK para TBatendente | NOT NULL, FK válida | Atendente deve existir |
| `DFid_departamento` | INT | FK para TBdepartamento | NOT NULL, FK válida | Departamento deve estar ativo |
| `DFdata_associacao` | DATETIME | Quando foi associado | DEFAULT GETDATE() | Para auditoria |
| `DFativo` | BIT | Se associação está ativa | DEFAULT 1 | Para desativar sem deletar |

**Regras de Negócio:**
- Atendente pode pertencer a múltiplos departamentos
- Associações inativas não afetam distribuição de chamados
- Não permitir associações duplicadas ativas

---

## 🎫 Tabelas de Chamados

### TBchamado - Chamados Principais

**Propósito:** Representa solicitações de suporte dos clientes.

| Campo | Tipo | Uso Correto | Validações | Observações |
|-------|------|-------------|------------|-------------|
| `DFid_chamado` | INT IDENTITY | PK auto-incremento | NOT NULL, UNIQUE | Nunca alterar após criação |
| `DFnumero_protocolo` | VARCHAR(20) | Protocolo único | NOT NULL, UNIQUE | Gerado automaticamente |
| `DFid_departamento` | INT | FK para TBdepartamento | NOT NULL, FK válida | Departamento responsável |
| `DFid_categoria` | INT | FK para TBcategoria | NOT NULL, FK válida | Categoria do chamado |
| `DFtitulo_chamado` | VARCHAR(255) | Título/assunto | NOT NULL | Resumo do problema |
| `DFdescricao_chamado` | NVARCHAR(MAX) | Descrição detalhada | NOT NULL | Detalhes do problema |
| `DFdata_criacao` | DATETIME | Quando foi criado | DEFAULT GETDATE() | Nunca alterar |
| `DFdata_ultima_atualizacao` | DATETIME | Última modificação | DEFAULT GETDATE() | Atualizar automaticamente |
| `DFid_status_chamado` | INT | FK para TBstatus_chamado | NOT NULL, FK válida | Status atual |
| `DFid_tipo_prioridade` | INT | FK para TBtipo_prioridade | NOT NULL, FK válida | Prioridade do chamado |
| `DFid_contato` | INT | FK para TBcontato | NOT NULL, FK válida | Quem abriu o chamado |
| `DFid_atendente_responsavel` | INT | FK para TBatendente | NULL, FK válida se preenchido | Atendente atual |
| `DFid_atendente_criador` | INT | FK para TBatendente | NULL, FK válida se preenchido | Quem criou (se foi atendente) |
| `DFdata_fechamento` | DATETIME | Quando foi fechado | NULL se não fechado | Para cálculos de SLA |
| `DFtempo_resolucao_minutos` | INT | Tempo total de resolução | NULL se não fechado | Calculado automaticamente |
| `DFdata_primeira_resposta` | DATETIME | Primeira resposta | NULL se não respondido | Para SLA de resposta |
| `DFdata_vencimento_sla` | DATETIME | Vencimento do SLA | NULL se sem SLA | Calculado automaticamente |
| `DFobservacoes` | NVARCHAR(MAX) | Observações internas | NULL permitido | Notas dos atendentes |

**Regras de Negócio:**
- Protocolo deve ser único e gerado automaticamente
- Data fechamento só preenchida quando status = fechado
- Tempo resolução calculado entre abertura e fechamento
- SLA calculado baseado em regras configuradas

### TBstatus_chamado - Status dos Chamados

**Propósito:** Define possíveis status dos chamados.

| Campo | Tipo | Uso Correto | Validações | Observações |
|-------|------|-------------|------------|-------------|
| `DFid_status_chamado` | INT IDENTITY | PK auto-incremento | NOT NULL, UNIQUE | Nunca alterar após criação |
| `DFnome_status` | VARCHAR(50) | Nome do status | NOT NULL, UNIQUE | Para exibição |
| `DFdescricao_status` | VARCHAR(255) | Descrição detalhada | NULL permitido | Explicar quando usar |
| `DFtipo_status` | VARCHAR(20) | Tipo do status | NOT NULL | Categoria do status |
| `DFcor` | VARCHAR(20) | Cor semântica | NOT NULL | Para interface visual |
| `DFativo` | BIT | Se status está ativo | DEFAULT 1 | Inativar em vez de deletar |
| `DFdata_criacao` | DATETIME | Quando foi criado | DEFAULT GETDATE() | Nunca alterar |

**Regras de Negócio:**
- Nome deve ser único no sistema
- Tipo define comportamento (aberto, em_andamento, fechado, etc.)
- Cor deve existir em TBcor_semantica

### TBcategoria - Categorias dos Chamados

**Propósito:** Classifica chamados por tipo de problema/serviço.

| Campo | Tipo | Uso Correto | Validações | Observações |
|-------|------|-------------|------------|-------------|
| `DFid_categoria` | INT IDENTITY | PK auto-incremento | NOT NULL, UNIQUE | Nunca alterar após criação |
| `DFnome_categoria` | VARCHAR(100) | Nome da categoria | NOT NULL | Para exibição |
| `DFdescricao_categoria` | VARCHAR(255) | Descrição detalhada | NULL permitido | Quando usar esta categoria |
| `DFid_categoria_pai` | INT | FK para categoria pai | NULL, FK válida se preenchido | Para hierarquia |
| `DFnivel_prioridade` | INT | Prioridade padrão | NULL permitido | Sugestão de prioridade |
| `DFativo` | BIT | Se categoria está ativa | DEFAULT 1 | Inativar em vez de deletar |
| `DFdata_criacao` | DATETIME | Quando foi criado | DEFAULT GETDATE() | Nunca alterar |

**Regras de Negócio:**
- Permite hierarquia ilimitada de categorias
- Categoria pai deve ser diferente da própria categoria
- Nível prioridade sugere prioridade para novos chamados

### TBchamado_historico - Histórico de Alterações

**Propósito:** Registra todas as mudanças nos chamados.

| Campo | Tipo | Uso Correto | Validações | Observações |
|-------|------|-------------|------------|-------------|
| `DFid_historico` | INT IDENTITY | PK auto-incremento | NOT NULL, UNIQUE | Nunca alterar após criação |
| `DFid_chamado` | INT | FK para TBchamado | NOT NULL, FK válida | Chamado alterado |
| `DFtipo_alteracao` | VARCHAR(50) | Tipo da alteração | NOT NULL | 'status', 'atribuicao', etc. |
| `DFdescricao_alteracao` | VARCHAR(255) | Descrição da mudança | NOT NULL | O que foi alterado |
| `DFvalor_anterior` | VARCHAR(255) | Valor antes da mudança | NULL permitido | Para auditoria |
| `DFvalor_novo` | VARCHAR(255) | Valor após a mudança | NULL permitido | Para auditoria |
| `DFdata_alteracao` | DATETIME | Quando foi alterado | DEFAULT GETDATE() | Nunca alterar |
| `DFid_usuario_alteracao` | INT | FK para TBusuario | NULL, FK válida se preenchido | Quem fez a alteração |
| `DFid_contato_alteracao` | INT | FK para TBcontato | NULL, FK válida se preenchido | Se foi alteração do cliente |

**Regras de Negócio:**
- Registrar todas as alterações importantes
- Incluir valores anterior e novo para auditoria
- Identificar se alteração foi feita por usuário ou contato

### TBchamado_comentario - Comentários dos Chamados

**Propósito:** Armazena comunicação relacionada aos chamados.

| Campo | Tipo | Uso Correto | Validações | Observações |
|-------|------|-------------|------------|-------------|
| `DFid_comentario` | INT IDENTITY | PK auto-incremento | NOT NULL, UNIQUE | Nunca alterar após criação |
| `DFid_chamado` | INT | FK para TBchamado | NOT NULL, FK válida | Chamado comentado |
| `DFtexto_comentario` | NVARCHAR(MAX) | Conteúdo do comentário | NOT NULL | Texto da mensagem |
| `DFdata_comentario` | DATETIME | Quando foi criado | DEFAULT GETDATE() | Nunca alterar |
| `DFtipo_comentario` | VARCHAR(20) | Tipo do comentário | NOT NULL | 'interno' ou 'externo' |
| `DFid_usuario` | INT | FK para TBusuario | NOT NULL, FK válida | Quem fez o comentário |
| `DFativo` | BIT | Se comentário está ativo | DEFAULT 1 | Para "deletar" sem remover |

**Regras de Negócio:**
- Comentários internos só visíveis para atendentes
- Comentários externos visíveis para cliente
- Não permitir edição após 15 minutos

### TBchamado_anexo - Anexos dos Chamados

**Propósito:** Armazena arquivos relacionados aos chamados.

| Campo | Tipo | Uso Correto | Validações | Observações |
|-------|------|-------------|------------|-------------|
| `DFid_anexo` | INT IDENTITY | PK auto-incremento | NOT NULL, UNIQUE | Nunca alterar após criação |
| `DFid_chamado` | INT | FK para TBchamado | NOT NULL, FK válida | Chamado do anexo |
| `DFnome_arquivo` | VARCHAR(255) | Nome original do arquivo | NOT NULL | Nome fornecido pelo usuário |
| `DFtipo_mime` | VARCHAR(100) | Tipo MIME do arquivo | NOT NULL | Para validação e exibição |
| `DFtamanho_arquivo` | BIGINT | Tamanho em bytes | NOT NULL | Para controle de quota |
| `DFcaminho_arquivo` | VARCHAR(500) | Caminho no storage | NOT NULL | Localização física |
| `DFid_usuario_upload` | INT | FK para TBusuario | NULL, FK válida se preenchido | Quem fez o upload |
| `DFdata_upload` | DATETIME | Quando foi enviado | DEFAULT GETDATE() | Nunca alterar |
| `DFobservacoes` | VARCHAR(255) | Observações sobre o arquivo | NULL permitido | Descrição adicional |

**Regras de Negócio:**
- Validar tipo MIME permitido
- Limitar tamanho máximo por arquivo
- Fazer scan de vírus antes de armazenar
- Gerar nome único para evitar conflitos

### TBchamado_satisfacao - Avaliações de Satisfação

**Propósito:** Armazena avaliações dos clientes sobre o atendimento.

| Campo | Tipo | Uso Correto | Validações | Observações |
|-------|------|-------------|------------|-------------|
| `DFid_satisfacao` | INT IDENTITY | PK auto-incremento | NOT NULL, UNIQUE | Nunca alterar após criação |
| `DFid_chamado` | INT | FK para TBchamado | NOT NULL, FK válida | Chamado avaliado |
| `DFnota_satisfacao` | INT | Nota de 1 a 5 | NOT NULL, 1-5 | Escala de satisfação |
| `DFcomentario_satisfacao` | NVARCHAR(MAX) | Comentário opcional | NULL permitido | Feedback detalhado |
| `DFdata_avaliacao` | DATETIME | Quando foi avaliado | DEFAULT GETDATE() | Nunca alterar |
| `DFip_avaliacao` | VARCHAR(45) | IP de onde foi avaliado | NULL permitido | Para auditoria |
| `DFtoken_avaliacao` | VARCHAR(100) | Token único da pesquisa | NOT NULL, UNIQUE | Para segurança |

**Regras de Negócio:**
- Apenas uma avaliação por chamado
- Token deve ser único e ter expiração
- Nota deve estar entre 1 e 5
- Registrar IP para auditoria

---

## 💬 Tabelas de Atendimento Online

### TBatendimento - Atendimentos Online

**Propósito:** Representa sessões de chat em tempo real.

| Campo | Tipo | Uso Correto | Validações | Observações |
|-------|------|-------------|------------|-------------|
| `DFid_atendimento` | INT IDENTITY | PK auto-incremento | NOT NULL, UNIQUE | Nunca alterar após criação |
| `DFid_contato` | INT | FK para TBcontato | NULL, FK válida se preenchido | Se visitante é contato conhecido |
| `DFid_atendente` | INT | FK para TBatendente | NULL, FK válida se preenchido | Atendente responsável |
| `DFnome_visitante` | VARCHAR(100) | Nome informado | NOT NULL | Nome fornecido no chat |
| `DFemail_visitante` | VARCHAR(255) | Email informado | NOT NULL, formato email | Email fornecido no chat |
| `DFdata_inicio` | DATETIME | Início do atendimento | DEFAULT GETDATE() | Nunca alterar |
| `DFdata_fim` | DATETIME | Fim do atendimento | NULL se não finalizado | Quando foi finalizado |
| `DFid_tipo_status_atendimento` | INT | FK para TBtipo_status_atendimento | NOT NULL, FK válida | Status atual |
| `DFip_visitante` | VARCHAR(45) | IP do visitante | NULL permitido | Para localização |
| `DFurl_referencia` | VARCHAR(500) | Página de origem | NULL permitido | De onde veio o visitante |
| `DFlocalizacao_visitante` | VARCHAR(100) | Localização geográfica | NULL permitido | País/cidade detectados |
| `DFobservacoes` | NVARCHAR(MAX) | Observações do atendimento | NULL permitido | Notas do atendente |

**Regras de Negócio:**
- Email deve ter formato válido
- Data fim só preenchida quando finalizado
- Localização detectada automaticamente pelo IP
- Pode ser convertido em chamado

### TBatendimento_mensagem - Mensagens do Atendimento

**Propósito:** Armazena mensagens trocadas durante o atendimento.

| Campo | Tipo | Uso Correto | Validações | Observações |
|-------|------|-------------|------------|-------------|
| `DFid_mensagem` | INT IDENTITY | PK auto-incremento | NOT NULL, UNIQUE | Nunca alterar após criação |
| `DFid_atendimento` | INT | FK para TBatendimento | NOT NULL, FK válida | Atendimento da mensagem |
| `DFconteudo_mensagem` | NVARCHAR(MAX) | Texto da mensagem | NOT NULL | Conteúdo da conversa |
| `DFdata_envio` | DATETIME | Quando foi enviada | DEFAULT GETDATE() | Nunca alterar |
| `DFtipo_remetente` | VARCHAR(20) | Tipo do remetente | NOT NULL | 'visitante', 'atendente', 'sistema' |
| `DFid_usuario` | INT | FK para TBusuario | NULL, FK válida se preenchido | Se remetente é usuário |
| `DFcaminho_arquivo` | VARCHAR(500) | Arquivo anexado | NULL permitido | Se mensagem tem anexo |
| `DFtipo_mime_arquivo` | VARCHAR(100) | Tipo do arquivo | NULL permitido | Se há anexo |

**Regras de Negócio:**
- Tipo remetente define origem da mensagem
- Mensagens do sistema são automáticas
- Anexos devem ser validados antes do armazenamento
- Preservar ordem cronológica das mensagens

### TBtipo_status_atendimento - Status dos Atendimentos

**Propósito:** Define possíveis status dos atendimentos online.

| Campo | Tipo | Uso Correto | Validações | Observações |
|-------|------|-------------|------------|-------------|
| `DFid_tipo_status_atendimento` | INT IDENTITY | PK auto-incremento | NOT NULL, UNIQUE | Nunca alterar após criação |
| `DFtipo_status_atendimento` | CHAR(1) | Código do status | NOT NULL, UNIQUE | Código único |
| `DFnome_status` | VARCHAR(50) | Nome do status | NOT NULL | Para exibição |
| `DFdescricao` | VARCHAR(255) | Descrição detalhada | NULL permitido | Quando usar |
| `DFativo` | BIT | Se status está ativo | DEFAULT 1 | Inativar em vez de deletar |

**Regras de Negócio:**
- Códigos padrão: A=Ativo, T=Transferido, F=Finalizado
- Status define comportamento do atendimento
- Não permitir remoção de status em uso

---

## 🏷️ Tabelas de Tags e Organização

### TBtag - Tags do Sistema

**Propósito:** Define tags para categorização flexível de entidades.

| Campo | Tipo | Uso Correto | Validações | Observações |
|-------|------|-------------|------------|-------------|
| `DFid_tag` | INT IDENTITY | PK auto-incremento | NOT NULL, UNIQUE | Nunca alterar após criação |
| `DFnome_tag` | VARCHAR(50) | Nome da tag | NOT NULL | Para exibição |
| `DFdescricao_tag` | VARCHAR(255) | Descrição da tag | NULL permitido | Quando usar |
| `DFid_tipo_entidade` | INT | FK para TBtipo_entidade | NOT NULL, FK válida | Tipo de entidade compatível |
| `DFcor` | VARCHAR(20) | Cor semântica | NOT NULL | Para interface visual |
| `DFpeso` | INT | Peso para ordenação | DEFAULT 0 | Para priorização |
| `DFativo` | BIT | Se tag está ativa | DEFAULT 1 | Inativar em vez de deletar |
| `DFdata_criacao` | DATETIME | Quando foi criada | DEFAULT GETDATE() | Nunca alterar |

**Regras de Negócio:**
- Nome deve ser único por tipo de entidade
- Cor deve existir em TBcor_semantica
- Peso maior = maior prioridade na exibição
- Tags inativas não aparecem na interface

### TBentidade_tag - Aplicação de Tags

**Propósito:** Relaciona tags com entidades específicas (N:N).

| Campo | Tipo | Uso Correto | Validações | Observações |
|-------|------|-------------|------------|-------------|
| `DFid_entidade` | INT | ID da entidade | NOT NULL | ID do registro taggeado |
| `DFid_tag` | INT | FK para TBtag | NOT NULL, FK válida | Tag aplicada |
| `DFdata_aplicacao` | DATETIME | Quando foi aplicada | DEFAULT GETDATE() | Para auditoria |
| `DFid_usuario_aplicacao` | INT | FK para TBusuario | NOT NULL, FK válida | Quem aplicou a tag |

**Regras de Negócio:**
- Não permitir tags duplicadas na mesma entidade
- Validar compatibilidade entre tag e tipo de entidade
- Registrar quem aplicou para auditoria
- Remover automaticamente quando entidade é excluída

### TBtipo_entidade - Tipos de Entidade

**Propósito:** Define tipos de entidades que podem receber tags.

| Campo | Tipo | Uso Correto | Validações | Observações |
|-------|------|-------------|------------|-------------|
| `DFid_tipo_entidade` | INT IDENTITY | PK auto-incremento | NOT NULL, UNIQUE | Nunca alterar após criação |
| `DFcodigo_tipo` | VARCHAR(20) | Código único | NOT NULL, UNIQUE | Identificador do tipo |
| `DFnome_tipo` | VARCHAR(50) | Nome do tipo | NOT NULL | Para exibição |
| `DFtabela_referencia` | VARCHAR(50) | Nome da tabela | NOT NULL | Tabela que contém as entidades |
| `DFativo` | BIT | Se tipo está ativo | DEFAULT 1 | Inativar em vez de deletar |

**Regras de Negócio:**
- Código deve ser único e em maiúsculas
- Tabela referência deve existir no banco
- Tipos padrão: CHAMADO, CLIENTE, CONTATO, ATENDENTE

### TBcor_semantica - Cores Semânticas

**Propósito:** Define paleta de cores com significados específicos.

| Campo | Tipo | Uso Correto | Validações | Observações |
|-------|------|-------------|------------|-------------|
| `DFcor` | VARCHAR(20) | Código da cor | NOT NULL, UNIQUE | Identificador único |
| `DFnome_cor` | VARCHAR(50) | Nome da cor | NOT NULL | Para exibição |
| `DFcodigo_hex` | VARCHAR(7) | Código hexadecimal | NOT NULL, formato hex | Cor real (#RRGGBB) |
| `DFativo` | BIT | Se cor está ativa | DEFAULT 1 | Inativar em vez de deletar |

**Regras de Negócio:**
- Código deve ser único e em minúsculas
- Código hex deve ter formato válido (#RRGGBB)
- Cores padrão: normal, alerta, critico, sucesso, trivial, destacado

---

## 📊 Tabelas de Configuração e SLA

### TBsla_configuracao - Configurações de SLA

**Propósito:** Define acordos de nível de serviço por diferentes critérios.

| Campo | Tipo | Uso Correto | Validações | Observações |
|-------|------|-------------|------------|-------------|
| `DFid_sla` | INT IDENTITY | PK auto-incremento | NOT NULL, UNIQUE | Nunca alterar após criação |
| `DFnome_sla` | VARCHAR(100) | Nome da configuração | NOT NULL | Para identificação |
| `DFid_cliente` | INT | FK para TBcliente | NULL, FK válida se preenchido | SLA específico por cliente |
| `DFid_categoria` | INT | FK para TBcategoria | NULL, FK válida se preenchido | SLA específico por categoria |
| `DFid_tipo_prioridade` | INT | FK para TBtipo_prioridade | NULL, FK válida se preenchido | SLA específico por prioridade |
| `DFtempo_primeira_resposta_horas` | INT | Tempo para primeira resposta | NOT NULL | Em horas |
| `DFtempo_resolucao_horas` | INT | Tempo para resolução | NOT NULL | Em horas |
| `DFhorario_comercial_inicio` | TIME | Início do horário comercial | NOT NULL | Formato HH:MM |
| `DFhorario_comercial_fim` | TIME | Fim do horário comercial | NOT NULL | Formato HH:MM |
| `DFdias_uteis` | VARCHAR(7) | Dias úteis | DEFAULT '1111100' | Seg-Dom (1=útil, 0=não) |
| `DFativo` | BIT | Se SLA está ativo | DEFAULT 1 | Inativar em vez de deletar |
| `DFdata_criacao` | DATETIME | Quando foi criado | DEFAULT GETDATE() | Nunca alterar |

**Regras de Negócio:**
- Combinação cliente+categoria+prioridade deve ser única
- Tempos devem ser positivos
- Horário fim deve ser maior que início
- Dias úteis: string de 7 caracteres (segunda a domingo)

### TBferiado - Feriados

**Propósito:** Define feriados que afetam cálculos de SLA.

| Campo | Tipo | Uso Correto | Validações | Observações |
|-------|------|-------------|------------|-------------|
| `DFid_feriado` | INT IDENTITY | PK auto-incremento | NOT NULL, UNIQUE | Nunca alterar após criação |
| `DFdata_feriado` | DATE | Data do feriado | NOT NULL, UNIQUE | Data específica |
| `DFnome_feriado` | VARCHAR(100) | Nome do feriado | NOT NULL | Para identificação |
| `DFdescricao_feriado` | VARCHAR(255) | Descrição detalhada | NULL permitido | Informações adicionais |
| `DFrecorrente` | BIT | Se é feriado anual | DEFAULT 0 | Para feriados fixos |
| `DFativo` | BIT | Se feriado está ativo | DEFAULT 1 | Inativar em vez de deletar |

**Regras de Negócio:**
- Data deve ser única no sistema
- Feriados recorrentes se repetem anualmente
- Feriados afetam cálculos de SLA (não contam como tempo útil)

---

## 📧 Tabelas de Comunicação

### TBnotificacao - Notificações

**Propósito:** Armazena notificações enviadas aos usuários.

| Campo | Tipo | Uso Correto | Validações | Observações |
|-------|------|-------------|------------|-------------|
| `DFid_notificacao` | INT IDENTITY | PK auto-incremento | NOT NULL, UNIQUE | Nunca alterar após criação |
| `DFid_destinatario` | INT | FK para TBusuario | NOT NULL, FK válida | Quem recebe a notificação |
| `DFid_remetente` | INT | FK para TBusuario | NULL, FK válida se preenchido | Quem enviou (se aplicável) |
| `DFtitulo_notificacao` | VARCHAR(255) | Título da notificação | NOT NULL | Assunto/resumo |
| `DFconteudo_notificacao` | NVARCHAR(MAX) | Conteúdo detalhado | NOT NULL | Corpo da mensagem |
| `DFtipo_notificacao` | CHAR(1) | Tipo da notificação | NOT NULL | Código do tipo |
| `DFcanal_notificacao` | CHAR(1) | Canal de envio | NOT NULL | Como foi enviada |
| `DFdata_criacao` | DATETIME | Quando foi criada | DEFAULT GETDATE() | Nunca alterar |
| `DFdata_envio` | DATETIME | Quando foi enviada | NULL se não enviada | Para controle de fila |
| `DFdata_leitura` | DATETIME | Quando foi lida | NULL se não lida | Para marcar como lida |
| `DFurl_acao` | VARCHAR(500) | URL para ação | NULL permitido | Link relacionado |
| `DFtentativas_envio` | INT | Número de tentativas | DEFAULT 0 | Para retry de falhas |

**Regras de Negócio:**
- Tipo deve existir em TBtipo_notificacao
- Canal deve existir em TBtipo_canal_notificacao
- Data envio preenchida quando processada
- Máximo 3 tentativas de envio

### TBtemplate_email - Templates de Email

**Propósito:** Armazena templates para emails automáticos.

| Campo | Tipo | Uso Correto | Validações | Observações |
|-------|------|-------------|------------|-------------|
| `DFid_template` | INT IDENTITY | PK auto-incremento | NOT NULL, UNIQUE | Nunca alterar após criação |
| `DFcodigo_template` | VARCHAR(50) | Código único | NOT NULL, UNIQUE | Identificador do template |
| `DFnome_template` | VARCHAR(100) | Nome do template | NOT NULL | Para identificação |
| `DFtipo_template` | CHAR(1) | Tipo do template | NOT NULL | Categoria do template |
| `DFassunto_template` | VARCHAR(255) | Assunto do email | NOT NULL | Pode conter variáveis |
| `DFcorpo_template` | NVARCHAR(MAX) | Corpo do email | NOT NULL | HTML com variáveis |
| `DFvariaveis_disponiveis` | NVARCHAR(MAX) | Lista de variáveis | NULL permitido | JSON com variáveis |
| `DFativo` | BIT | Se template está ativo | DEFAULT 1 | Inativar em vez de deletar |
| `DFdata_criacao` | DATETIME | Quando foi criado | DEFAULT GETDATE() | Nunca alterar |
| `DFdata_ultima_atualizacao` | DATETIME | Última modificação | DEFAULT GETDATE() | Atualizar automaticamente |

**Regras de Negócio:**
- Código deve ser único e em maiúsculas
- Tipo deve existir em TBtipo_template
- Variáveis no formato {{variavel}}
- Suporta HTML no corpo do template

### TBtipo_notificacao - Tipos de Notificação

**Propósito:** Define tipos de notificações do sistema.

| Campo | Tipo | Uso Correto | Validações | Observações |
|-------|------|-------------|------------|-------------|
| `DFtipo_notificacao` | CHAR(1) | Código do tipo | NOT NULL, UNIQUE | Identificador único |
| `DFnome_tipo` | VARCHAR(50) | Nome do tipo | NOT NULL | Para exibição |
| `DFdescricao` | VARCHAR(255) | Descrição detalhada | NULL permitido | Quando usar |
| `DFativo` | BIT | Se tipo está ativo | DEFAULT 1 | Inativar em vez de deletar |

**Regras de Negócio:**
- Códigos padrão: I=Informativa, A=Alerta, E=Erro, S=Sucesso
- Tipos definem comportamento e aparência
- Não permitir remoção de tipos em uso

### TBtipo_canal_notificacao - Canais de Notificação

**Propósito:** Define canais disponíveis para envio de notificações.

| Campo | Tipo | Uso Correto | Validações | Observações |
|-------|------|-------------|------------|-------------|
| `DFcanal_notificacao` | CHAR(1) | Código do canal | NOT NULL, UNIQUE | Identificador único |
| `DFnome_canal` | VARCHAR(50) | Nome do canal | NOT NULL | Para exibição |
| `DFdescricao` | VARCHAR(255) | Descrição detalhada | NULL permitido | Como funciona |
| `DFativo` | BIT | Se canal está ativo | DEFAULT 1 | Inativar em vez de deletar |

**Regras de Negócio:**
- Códigos padrão: S=Sistema, E=Email, P=Push, W=WhatsApp
- Canais definem meio de entrega
- Usuários podem configurar preferências por canal

### TBtipo_template - Tipos de Template

**Propósito:** Categoriza templates de email por finalidade.

| Campo | Tipo | Uso Correto | Validações | Observações |
|-------|------|-------------|------------|-------------|
| `DFtipo_template` | CHAR(1) | Código do tipo | NOT NULL, UNIQUE | Identificador único |
| `DFnome_tipo` | VARCHAR(50) | Nome do tipo | NOT NULL | Para exibição |
| `DFdescricao` | VARCHAR(255) | Descrição detalhada | NULL permitido | Finalidade do tipo |
| `DFativo` | BIT | Se tipo está ativo | DEFAULT 1 | Inativar em vez de deletar |

**Regras de Negócio:**
- Códigos padrão: C=Chamado, A=Atendimento, S=Sistema, N=Notificação
- Tipos organizam templates por funcionalidade
- Facilita busca e manutenção de templates

---

## ⚙️ Tabelas de Automação e Auditoria

### TBautomacao_regra - Regras de Automação

**Propósito:** Define regras para automação de processos.

| Campo | Tipo | Uso Correto | Validações | Observações |
|-------|------|-------------|------------|-------------|
| `DFid_regra` | INT IDENTITY | PK auto-incremento | NOT NULL, UNIQUE | Nunca alterar após criação |
| `DFnome_regra` | VARCHAR(100) | Nome da regra | NOT NULL | Para identificação |
| `DFdescricao_regra` | VARCHAR(255) | Descrição detalhada | NULL permitido | O que a regra faz |
| `DFeventos_trigger` | VARCHAR(255) | Eventos que disparam | NOT NULL | Lista separada por vírgula |
| `DFcondicoes_json` | NVARCHAR(MAX) | Condições em JSON | NOT NULL, JSON válido | Critérios para execução |
| `DFacoes_json` | NVARCHAR(MAX) | Ações em JSON | NOT NULL, JSON válido | O que fazer quando disparar |
| `DFativa` | BIT | Se regra está ativa | DEFAULT 1 | Inativar em vez de deletar |
| `DFprioridade` | INT | Prioridade de execução | DEFAULT 0 | Ordem de processamento |
| `DFdata_criacao` | DATETIME | Quando foi criada | DEFAULT GETDATE() | Nunca alterar |
| `DFdata_ultima_execucao` | DATETIME | Última execução | NULL se nunca executada | Para monitoramento |
| `DFcontador_execucoes` | INT | Número de execuções | DEFAULT 0 | Para estatísticas |

**Regras de Negócio:**
- Nome deve ser único no sistema
- JSON de condições e ações deve ser válido
- Prioridade maior executa primeiro
- Registrar todas as execuções para auditoria

### TBauditoria - Log de Auditoria

**Propósito:** Registra todas as operações críticas do sistema.

| Campo | Tipo | Uso Correto | Validações | Observações |
|-------|------|-------------|------------|-------------|
| `DFid_auditoria` | INT IDENTITY | PK auto-incremento | NOT NULL, UNIQUE | Nunca alterar após criação |
| `DFtabela_afetada` | VARCHAR(50) | Nome da tabela | NOT NULL | Tabela que foi alterada |
| `DFid_registro_afetado` | INT | ID do registro | NOT NULL | Registro específico |
| `DFoperacao` | VARCHAR(20) | Tipo de operação | NOT NULL | INSERT, UPDATE, DELETE |
| `DFvalores_anteriores` | NVARCHAR(MAX) | Valores antes da mudança | NULL, JSON válido | Para rollback |
| `DFvalores_novos` | NVARCHAR(MAX) | Valores após a mudança | NULL, JSON válido | Para comparação |
| `DFdata_operacao` | DATETIME | Quando ocorreu | DEFAULT GETDATE() | Nunca alterar |
| `DFid_usuario_operacao` | INT | FK para TBusuario | NULL, FK válida se preenchido | Quem fez a operação |
| `DFip_operacao` | VARCHAR(45) | IP de origem | NULL permitido | Para rastreamento |
| `DFuser_agent` | VARCHAR(500) | User agent do browser | NULL permitido | Para contexto |
| `DFobservacoes` | VARCHAR(255) | Observações adicionais | NULL permitido | Contexto extra |

**Regras de Negócio:**
- Registrar todas as operações críticas
- Valores em JSON para facilitar parsing
- Manter histórico por período configurável
- Não permitir alteração de registros de auditoria

---

## 🎯 Tabelas de Tipos e Configurações

### TBtipo_prioridade - Tipos de Prioridade

**Propósito:** Define níveis de prioridade para chamados.

| Campo | Tipo | Uso Correto | Validações | Observações |
|-------|------|-------------|------------|-------------|
| `DFid_tipo_prioridade` | INT IDENTITY | PK auto-incremento | NOT NULL, UNIQUE | Nunca alterar após criação |
| `DFtipo_prioridade` | CHAR(1) | Código da prioridade | NOT NULL, UNIQUE | Identificador único |
| `DFnome_prioridade` | VARCHAR(50) | Nome da prioridade | NOT NULL | Para exibição |
| `DFdescricao` | VARCHAR(255) | Descrição detalhada | NULL permitido | Quando usar |
| `DFcor` | VARCHAR(20) | Cor semântica | NOT NULL | Para interface visual |
| `DFativo` | BIT | Se prioridade está ativa | DEFAULT 1 | Inativar em vez de deletar |

**Regras de Negócio:**
- Códigos padrão: A=Alta, M=Média, B=Baixa
- Cor deve existir em TBcor_semantica
- Prioridades afetam cálculos de SLA
- Não permitir remoção de prioridades em uso

### TBtipo_avaliacao - Tipos de Avaliação

**Propósito:** Define tipos de avaliação de satisfação.

| Campo | Tipo | Uso Correto | Validações | Observações |
|-------|------|-------------|------------|-------------|
| `DFid_tipo_avaliacao` | INT IDENTITY | PK auto-incremento | NOT NULL, UNIQUE | Nunca alterar após criação |
| `DFtipo_avaliacao` | CHAR(1) | Código do tipo | NOT NULL, UNIQUE | Identificador único |
| `DFnome_avaliacao` | VARCHAR(50) | Nome do tipo | NOT NULL | Para exibição |
| `DFdescricao` | VARCHAR(255) | Descrição detalhada | NULL permitido | Quando usar |
| `DFativo` | BIT | Se tipo está ativo | DEFAULT 1 | Inativar em vez de deletar |

**Regras de Negócio:**
- Códigos padrão: C=Chamado, A=Atendimento, G=Geral
- Tipos definem contexto da avaliação
- Usado para segmentar pesquisas de satisfação

---

## 🔍 View de Permissões

### PERMITIDO - Permissões Efetivas

**Propósito:** Calcula permissões efetivas considerando papéis e overrides individuais.

| Campo | Tipo | Uso Correto | Validações | Observações |
|-------|------|-------------|------------|-------------|
| `DFid_usuario` | INT | ID do usuário | NOT NULL | Usuário da permissão |
| `DFid_permissao` | INT | ID da permissão | NOT NULL | Permissão específica |
| `DFcodigo_permissao` | VARCHAR(100) | Código da permissão | NOT NULL | Para facilitar consultas |
| `DFpermissao_papel` | BIT | Permissão do papel | NULL | true/false/null |
| `DFpermissao_individual` | BIT | Override individual | NULL | true/false/null |
| `DFpermissao_efetiva` | BIT | Resultado final | NOT NULL | Permissão calculada |
| `DForigem_permissao` | VARCHAR(20) | Origem da permissão | NOT NULL | 'papel', 'individual', 'negada' |

**Regras de Negócio:**
- Lógica: false em qualquer nível = negado
- true em qualquer nível = permitido
- NULL em ambos = negado
- Usar esta view para verificações de permissão

---

## 📋 Resumo de Uso do Schema

### Princípios Gerais:
- **Nunca alterar PKs** após criação
- **Inativar em vez de deletar** registros importantes
- **Validar FKs** antes de inserir/atualizar
- **Usar campos de auditoria** (data_criacao, data_atualizacao)
- **Manter integridade referencial** sempre
- **Validar formatos** (email, URL, JSON) antes de armazenar

### Campos Padrão:
- **DFid_***: Primary Keys auto-incremento
- **DFativo**: Controle de ativação (BIT)
- **DFdata_criacao**: Timestamp de criação (DATETIME)
- **DFdata_ultima_atualizacao**: Timestamp de modificação (DATETIME)

### Convenções de Nomenclatura:
- **DF**: Prefixo para todos os campos
- **TB**: Prefixo para todas as tabelas
- **FK**: Campos de chave estrangeira terminam com ID da tabela referenciada
- **Códigos**: MAIÚSCULAS para códigos de sistema
- **Nomes**: Formato amigável para exibição

### Validações Críticas:
- **Emails**: Formato válido e unicidade
- **Senhas**: Sempre hash, nunca texto plano
- **Datas**: Validar intervalos lógicos
- **JSON**: Validar estrutura antes de armazenar
- **URLs**: Validar formato se preenchido
- **Códigos**: Unicidade e formato consistente

Este guia garante uso consistente e correto do schema em todas as fases de implementação do sistema.
