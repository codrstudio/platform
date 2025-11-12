/*
TBsituacao_chamado - Tabela de situações/status de chamados
Sistema TomTicket HelpDesk - Estados possíveis para chamados
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'tom.TBsituacao_chamado') IS NULL
BEGIN
    CREATE TABLE tom.TBsituacao_chamado (
        DFid_situacao_chamado INTEGER NOT NULL,
        DFdescricao_situacao NVARCHAR(255) NOT NULL,
        DFinstrucoes_situacao NVARCHAR(MAX) NULL,

        CONSTRAINT PK__sac_TBsituacao_chamado PRIMARY KEY (DFid_situacao_chamado)
    );
    PRINT 'Tabela tom.TBsituacao_chamado criada com sucesso';
END
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'tom.TBsituacao_chamado', NULL, 'Define as situações disponíveis para chamados no sistema TomTicket';
EXEC api.CRIAR_DESCRICAO 'tom.TBsituacao_chamado', 'DFid_situacao_chamado', 'Código único da situação';
EXEC api.CRIAR_DESCRICAO 'tom.TBsituacao_chamado', 'DFdescricao_situacao', 'Descrição da situação do chamado';
EXEC api.CRIAR_DESCRICAO 'tom.TBsituacao_chamado', 'DFinstrucoes_situacao', 'Instruções específicas para a situação';
GO