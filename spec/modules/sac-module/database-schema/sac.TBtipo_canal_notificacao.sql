/*
TBtipo_canal_notificacao - Tabela de tipos de canal de notificação
Sistema HelpDesk - Define canais disponíveis para notificações
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'sac.TBtipo_canal_notificacao') IS NULL
BEGIN
    CREATE TABLE sac.TBtipo_canal_notificacao (
        DFcanal_notificacao CHAR(1) NOT NULL,
        DFnome_canal NVARCHAR(50) NOT NULL,
        DFdescricao NVARCHAR(200) NULL,
        DFativo BIT NOT NULL DEFAULT 1,
        DFdata_criacao DATETIME NOT NULL DEFAULT GETDATE(),

        CONSTRAINT PK__sac_TBtipo_canal_notificacao PRIMARY KEY (DFcanal_notificacao),
        CONSTRAINT UQ__sac_TBtipo_canal_notificacao__DFnome_canal UNIQUE (DFnome_canal)
    );
    PRINT 'Tabela sac.TBtipo_canal_notificacao criada com sucesso';
END
GO

-- População inicial (idempotente)
IF NOT EXISTS (SELECT 1 FROM sac.TBtipo_canal_notificacao)
BEGIN
    INSERT INTO sac.TBtipo_canal_notificacao (DFcanal_notificacao, DFnome_canal, DFdescricao) VALUES
    ('S', 'Sistema', 'Notificação interna do sistema'),
    ('E', 'Email', 'Notificação por email'),
    ('P', 'Push', 'Notificação push no navegador'),
    ('W', 'WhatsApp', 'Notificação via WhatsApp');
    PRINT 'Dados iniciais inseridos em sac.TBtipo_canal_notificacao';
END
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_canal_notificacao', NULL, 'Define os tipos de canal disponíveis para notificações';
GO
