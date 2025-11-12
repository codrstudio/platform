/*
TBtipo_complexidade - Tabela de níveis de complexidade de atendimento
Sistema TomTicket HelpDesk - Lookup table para complexidade de atendimentos
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'tom.TBtipo_complexidade') IS NULL
BEGIN
    CREATE TABLE tom.TBtipo_complexidade (
        DFtipo_complexidade CHAR(1) NOT NULL,
        DFdescricao NVARCHAR(100) NOT NULL,
        DFpontos_esforco INT NULL,
        DFordem_exibicao INT NOT NULL,
        DFativo BIT DEFAULT 1,

        CONSTRAINT PK__tom_TBtipo_complexidade PRIMARY KEY (DFtipo_complexidade)
    );
    PRINT 'Tabela tom.TBtipo_complexidade criada com sucesso';
END
GO

-- População inicial (idempotente)
IF NOT EXISTS (SELECT 1 FROM tom.TBtipo_complexidade)
BEGIN
    INSERT INTO tom.TBtipo_complexidade (DFtipo_complexidade, DFdescricao, DFpontos_esforco, DFordem_exibicao, DFativo) VALUES
    ('B', 'Baixo', 1, 1, 1),
    ('M', 'Médio', 3, 2, 1),
    ('A', 'Alto', 5, 3, 1),
    ('S', 'Solicitação de demanda', 8, 4, 1);
    PRINT 'Dados iniciais inseridos em tom.TBtipo_complexidade';
END
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'tom.TBtipo_complexidade', 'DFordem_exibicao';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'tom.TBtipo_complexidade', NULL, 'Define os níveis de complexidade de atendimentos';
EXEC api.CRIAR_DESCRICAO 'tom.TBtipo_complexidade', 'DFtipo_complexidade', 'Código da complexidade (B=Baixo, M=Médio, A=Alto, S=Solicitação de demanda)';
EXEC api.CRIAR_DESCRICAO 'tom.TBtipo_complexidade', 'DFdescricao', 'Descrição legível do nível de complexidade';
EXEC api.CRIAR_DESCRICAO 'tom.TBtipo_complexidade', 'DFpontos_esforco', 'Pontos de esforço estimados para este nível de complexidade';
EXEC api.CRIAR_DESCRICAO 'tom.TBtipo_complexidade', 'DFordem_exibicao', 'Ordem de exibição em interfaces';
EXEC api.CRIAR_DESCRICAO 'tom.TBtipo_complexidade', 'DFativo', 'Indica se o nível de complexidade está ativo';
GO