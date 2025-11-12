/*
TBtipo_avaliacao - Tabela de tipos de avaliação de atendimento/chamado
Sistema TomTicket HelpDesk - Lookup table para avaliações de satisfação
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'tom.TBtipo_avaliacao') IS NULL
BEGIN
    CREATE TABLE tom.TBtipo_avaliacao (
        DFtipo_avaliacao CHAR(1) NOT NULL,
        DFdescricao NVARCHAR(50) NOT NULL,
        DFordem_exibicao INT NOT NULL,
        DFativo BIT DEFAULT 1,

        CONSTRAINT PK__tom_TBtipo_avaliacao PRIMARY KEY (DFtipo_avaliacao)
    );
    PRINT 'Tabela tom.TBtipo_avaliacao criada com sucesso';
END
GO

-- População inicial (idempotente)
IF NOT EXISTS (SELECT 1 FROM tom.TBtipo_avaliacao)
BEGIN
    INSERT INTO tom.TBtipo_avaliacao (DFtipo_avaliacao, DFdescricao, DFordem_exibicao, DFativo) VALUES
    ('E', 'Excelente', 1, 1),
    ('B', 'Bom', 2, 1),
    ('R', 'Regular', 3, 1),
    ('P', 'Péssimo', 4, 1);
    PRINT 'Dados iniciais inseridos em tom.TBtipo_avaliacao';
END
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'tom.TBtipo_avaliacao', 'DFordem_exibicao';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'tom.TBtipo_avaliacao', NULL, 'Define os tipos de avaliação de satisfação do cliente';
EXEC api.CRIAR_DESCRICAO 'tom.TBtipo_avaliacao', 'DFtipo_avaliacao', 'Código do tipo de avaliação (E=Excelente, B=Bom, R=Regular, P=Péssimo)';
EXEC api.CRIAR_DESCRICAO 'tom.TBtipo_avaliacao', 'DFdescricao', 'Descrição legível do tipo de avaliação';
EXEC api.CRIAR_DESCRICAO 'tom.TBtipo_avaliacao', 'DFordem_exibicao', 'Ordem de exibição em interfaces';
EXEC api.CRIAR_DESCRICAO 'tom.TBtipo_avaliacao', 'DFativo', 'Indica se o tipo de avaliação está ativo';
GO