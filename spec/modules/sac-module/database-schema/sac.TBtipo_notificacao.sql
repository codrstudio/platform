/*
TBtipo_notificacao - Tabela de tipos de notificação
Sistema HelpDesk - Define tipos de notificação por severidade
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'sac.TBtipo_notificacao') IS NULL
BEGIN
    CREATE TABLE sac.TBtipo_notificacao (
        DFtipo_notificacao CHAR(1) NOT NULL,
        DFnome_tipo NVARCHAR(50) NOT NULL,
        DFdescricao NVARCHAR(200) NULL,
        DFcor NVARCHAR(20) NOT NULL DEFAULT 'normal',
        DFicone NVARCHAR(50) NULL,
        DFativo BIT NOT NULL DEFAULT 1,
        DFdata_criacao DATETIME NOT NULL DEFAULT GETDATE(),

        CONSTRAINT PK__sac_TBtipo_notificacao PRIMARY KEY (DFtipo_notificacao),
        CONSTRAINT UQ__sac_TBtipo_notificacao__DFnome_tipo UNIQUE (DFnome_tipo)
    );
    PRINT 'Tabela sac.TBtipo_notificacao criada com sucesso';
END
GO

-- Relacionamentos usando API
EXEC api.CRIAR_RELACAO 'sac.TBtipo_notificacao', 'DFcor', 'sac.TBcor_semantica', 'DFcor';
GO

-- População inicial (idempotente)
IF NOT EXISTS (SELECT 1 FROM sac.TBtipo_notificacao)
BEGIN
    INSERT INTO sac.TBtipo_notificacao (DFtipo_notificacao, DFnome_tipo, DFdescricao, DFcor, DFicone) VALUES
    ('I', 'Informação', 'Notificação informativa', 'normal', 'info'),
    ('A', 'Alerta', 'Notificação de alerta', 'alerta', 'alert-triangle'),
    ('E', 'Erro', 'Notificação de erro', 'critico', 'x-circle'),
    ('S', 'Sucesso', 'Notificação de sucesso', 'sucesso', 'check-circle');
    PRINT 'Dados iniciais inseridos em sac.TBtipo_notificacao';
END
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_notificacao', NULL, 'Define os tipos de notificação por severidade';
GO
