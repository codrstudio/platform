/*
TBatendente - Tabela de atendentes/operadores do sistema
Sistema TomTicket HelpDesk - Gestão de atendentes do helpdesk
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'tom.TBatendente') IS NULL
BEGIN
    CREATE TABLE tom.TBatendente (
        DFid_atendente INTEGER NOT NULL,
        DFnome_completo NVARCHAR(255) NOT NULL,
        DFemail NVARCHAR(255) NOT NULL,
        DFassinatura_email NVARCHAR(MAX) NULL,
        DFnome_exibicao NVARCHAR(100) NULL,
        DFsituacao_conexao_chat CHAR(1) NOT NULL DEFAULT 'O',
        DFativo CHAR(1) NOT NULL DEFAULT 'A',
        DFsituacao_disponibilidade_chat CHAR(1) NOT NULL DEFAULT 'O',
        DFgerente_geral CHAR(1) NOT NULL DEFAULT 'N',

        CONSTRAINT PK__sac_TBatendente PRIMARY KEY (DFid_atendente),
        CONSTRAINT UQ__sac_TBatendente__DFemail UNIQUE (DFemail),
        CONSTRAINT CK__sac_TBatendente__DFsituacao_conexao_chat CHECK (DFsituacao_conexao_chat IN ('O', 'I', 'A')),
        CONSTRAINT CK__sac_TBatendente__DFativo CHECK (DFativo IN ('A', 'I')),
        CONSTRAINT CK__sac_TBatendente__DFsituacao_disponibilidade_chat CHECK (DFsituacao_disponibilidade_chat IN ('O', 'I', 'A', 'B')),
        CONSTRAINT CK__sac_TBatendente__DFgerente_geral CHECK (DFgerente_geral IN ('S', 'N'))
    );
    PRINT 'Tabela tom.TBatendente criada com sucesso';
END
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'tom.TBatendente', 'DFemail', 1; -- UNIQUE já criado via constraint
EXEC api.CRIAR_INDICE 'tom.TBatendente', 'DFativo';
EXEC api.CRIAR_INDICE 'tom.TBatendente', 'DFsituacao_conexao_chat,DFsituacao_disponibilidade_chat';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'tom.TBatendente', NULL, 'Define os atendentes/operadores do sistema de helpdesk';
EXEC api.CRIAR_DESCRICAO 'tom.TBatendente', 'DFid_atendente', 'Código único do atendente';
EXEC api.CRIAR_DESCRICAO 'tom.TBatendente', 'DFnome_completo', 'Nome completo do atendente';
EXEC api.CRIAR_DESCRICAO 'tom.TBatendente', 'DFemail', 'Email do atendente';
EXEC api.CRIAR_DESCRICAO 'tom.TBatendente', 'DFassinatura_email', 'Assinatura HTML do atendente para emails';
EXEC api.CRIAR_DESCRICAO 'tom.TBatendente', 'DFnome_exibicao', 'Apelido ou nome de exibição do atendente';
EXEC api.CRIAR_DESCRICAO 'tom.TBatendente', 'DFsituacao_conexao_chat', 'Situação do login no chat (O=Online, I=Inativo, A=Ausente)';
EXEC api.CRIAR_DESCRICAO 'tom.TBatendente', 'DFativo', 'Situação geral do atendente (A=Ativo, I=Inativo)';
EXEC api.CRIAR_DESCRICAO 'tom.TBatendente', 'DFsituacao_disponibilidade_chat', 'Situação específica do chat (O=Online, I=Inativo, A=Ausente, B=Ocupado)';
EXEC api.CRIAR_DESCRICAO 'tom.TBatendente', 'DFgerente_geral', 'Indica se o atendente é gerente geral';
GO