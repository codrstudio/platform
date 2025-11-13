/*
TBchamado_satisfacao - Tabela de avaliação de satisfação dos chamados
Sistema HelpDesk - Avaliações de satisfação dos contatos sobre os chamados resolvidos
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'sac.TBchamado_satisfacao') IS NULL
BEGIN
    CREATE TABLE sac.TBchamado_satisfacao (
        DFid_satisfacao INTEGER IDENTITY(1,1) NOT NULL,
        DFid_chamado INTEGER NOT NULL,
        DFid_contato INTEGER NOT NULL,
        DFnota_avaliacao INTEGER NOT NULL, -- Ex: 1 a 5
        DFcomentario_avaliacao NVARCHAR(MAX) NULL,
        DFtoken_avaliacao VARCHAR(100) NULL, -- Token único para acesso à avaliação
        DFdata_avaliacao DATETIME NOT NULL DEFAULT GETDATE(),
        DFip_avaliacao NVARCHAR(45) NULL,
        DFdata_criacao DATETIME NOT NULL DEFAULT GETDATE(),

        CONSTRAINT PK__sac_TBchamado_satisfacao PRIMARY KEY (DFid_satisfacao),
        CONSTRAINT UQ__sac_TBchamado_satisfacao__DFid_chamado UNIQUE (DFid_chamado), -- Apenas uma avaliação por chamado
        CONSTRAINT UQ__sac_TBchamado_satisfacao__DFtoken_avaliacao UNIQUE (DFtoken_avaliacao),
        CONSTRAINT CK__sac_TBchamado_satisfacao__DFnota_avaliacao CHECK (DFnota_avaliacao BETWEEN 1 AND 5)
    );
    PRINT 'Tabela sac.TBchamado_satisfacao criada com sucesso';
END
GO

-- Evolução: Adição de novo campo (idempotente)
IF COL_LENGTH('sac.TBchamado_satisfacao', 'DFtoken_avaliacao') IS NULL
BEGIN
    ALTER TABLE sac.TBchamado_satisfacao ADD DFtoken_avaliacao VARCHAR(100) NULL;
    PRINT 'Campo DFtoken_avaliacao adicionado à tabela sac.TBchamado_satisfacao';
END
GO

-- Relacionamentos usando API
EXEC api.CRIAR_RELACAO 'sac.TBchamado_satisfacao', 'DFid_chamado', 'sac.TBchamado', 'DFid_chamado';
EXEC api.CRIAR_RELACAO 'sac.TBchamado_satisfacao', 'DFid_contato', 'sac.TBcontato', 'DFid_contato';
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'sac.TBchamado_satisfacao', 'DFid_chamado', 1; -- UNIQUE já criado via constraint
EXEC api.CRIAR_INDICE 'sac.TBchamado_satisfacao', 'DFtoken_avaliacao', 1; -- UNIQUE já criado via constraint
EXEC api.CRIAR_INDICE 'sac.TBchamado_satisfacao', 'DFid_contato';
EXEC api.CRIAR_INDICE 'sac.TBchamado_satisfacao', 'DFdata_avaliacao';
EXEC api.CRIAR_INDICE 'sac.TBchamado_satisfacao', 'DFnota_avaliacao';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_satisfacao', NULL, 'Armazena as avaliações de satisfação dos contatos sobre os chamados resolvidos';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_satisfacao', 'DFid_satisfacao', 'ID único da avaliação de satisfação';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_satisfacao', 'DFid_chamado', 'ID do chamado avaliado';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_satisfacao', 'DFid_contato', 'ID do contato que realizou a avaliação';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_satisfacao', 'DFnota_avaliacao', 'Nota da avaliação (ex: 1 a 5)';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_satisfacao', 'DFcomentario_avaliacao', 'Comentário adicional da avaliação';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_satisfacao', 'DFtoken_avaliacao', 'Token único para acesso à avaliação pelo cliente';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_satisfacao', 'DFdata_avaliacao', 'Data e hora da avaliação';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_satisfacao', 'DFip_avaliacao', 'Endereço IP de onde a avaliação foi realizada';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_satisfacao', 'DFdata_criacao', 'Data e hora de criação do registro';
GO

