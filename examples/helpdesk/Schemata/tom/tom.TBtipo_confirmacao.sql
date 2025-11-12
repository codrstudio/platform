/*
TBtipo_confirmacao - Tabela de confirmação Sim/Não
Sistema TomTicket HelpDesk - Lookup table para campos booleanos codificados
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'tom.TBtipo_confirmacao') IS NULL
BEGIN
    CREATE TABLE tom.TBtipo_confirmacao (
        DFtipo_confirmacao CHAR(1) NOT NULL,
        DFdescricao NVARCHAR(50) NOT NULL,
        DFativo BIT DEFAULT 1,

        CONSTRAINT PK__tom_TBtipo_confirmacao PRIMARY KEY (DFtipo_confirmacao)
    );
    PRINT 'Tabela tom.TBtipo_confirmacao criada com sucesso';
END
GO

-- População inicial (idempotente)
IF NOT EXISTS (SELECT 1 FROM tom.TBtipo_confirmacao)
BEGIN
    INSERT INTO tom.TBtipo_confirmacao (DFtipo_confirmacao, DFdescricao, DFativo) VALUES
    ('S', 'Sim', 1),
    ('N', 'Não', 1);
    PRINT 'Dados iniciais inseridos em tom.TBtipo_confirmacao';
END
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'tom.TBtipo_confirmacao', NULL, 'Define valores de confirmação Sim/Não para campos booleanos';
EXEC api.CRIAR_DESCRICAO 'tom.TBtipo_confirmacao', 'DFtipo_confirmacao', 'Código da confirmação (S=Sim, N=Não)';
EXEC api.CRIAR_DESCRICAO 'tom.TBtipo_confirmacao', 'DFdescricao', 'Descrição legível da confirmação';
EXEC api.CRIAR_DESCRICAO 'tom.TBtipo_confirmacao', 'DFativo', 'Indica se o tipo de confirmação está ativo';
GO