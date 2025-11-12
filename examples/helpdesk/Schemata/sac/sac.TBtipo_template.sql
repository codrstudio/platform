/*
TBtipo_template - Tabela de tipos de template
Sistema HelpDesk - Define tipos de template de email
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'sac.TBtipo_template') IS NULL
BEGIN
    CREATE TABLE sac.TBtipo_template (
        DFtipo_template CHAR(1) NOT NULL,
        DFnome_tipo NVARCHAR(50) NOT NULL,
        DFdescricao NVARCHAR(200) NULL,
        DFativo BIT NOT NULL DEFAULT 1,
        DFdata_criacao DATETIME NOT NULL DEFAULT GETDATE(),

        CONSTRAINT PK__sac_TBtipo_template PRIMARY KEY (DFtipo_template),
        CONSTRAINT UQ__sac_TBtipo_template__DFnome_tipo UNIQUE (DFnome_tipo)
    );
    PRINT 'Tabela sac.TBtipo_template criada com sucesso';
END
GO

-- População inicial (idempotente)
IF NOT EXISTS (SELECT 1 FROM sac.TBtipo_template)
BEGIN
    INSERT INTO sac.TBtipo_template (DFtipo_template, DFnome_tipo, DFdescricao) VALUES
    ('C', 'Chamado', 'Templates relacionados a chamados'),
    ('A', 'Atendimento', 'Templates relacionados a atendimentos'),
    ('S', 'Sistema', 'Templates do sistema'),
    ('N', 'Notificação', 'Templates de notificação');
    PRINT 'Dados iniciais inseridos em sac.TBtipo_template';
END
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_template', NULL, 'Define os tipos de template de email disponíveis';
GO
