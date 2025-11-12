/*
TBcategoria - Tabela de categorias/tipos de assunto
Sistema TomTicket HelpDesk - Classificação de chamados por categoria
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'tom.TBcategoria') IS NULL
BEGIN
    CREATE TABLE tom.TBcategoria (
        DFid_categoria INTEGER NOT NULL,
        DFtitulo_categoria NVARCHAR(255) NOT NULL,
        DFidentificador_categoria NVARCHAR(50) NOT NULL,
        DFnivel_prioridade INTEGER NULL,

        CONSTRAINT PK__sac_TBcategoria PRIMARY KEY (DFid_categoria),
        CONSTRAINT UQ__sac_TBcategoria__DFidentificador_categoria UNIQUE (DFidentificador_categoria)
    );
    PRINT 'Tabela tom.TBcategoria criada com sucesso';
END
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'tom.TBcategoria', 'DFidentificador_categoria', 1; -- UNIQUE já criado via constraint
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'tom.TBcategoria', NULL, 'Define as categorias/tipos de assunto disponíveis para classificação de chamados';
EXEC api.CRIAR_DESCRICAO 'tom.TBcategoria', 'DFid_categoria', 'Código único da categoria/tipo de assunto';
EXEC api.CRIAR_DESCRICAO 'tom.TBcategoria', 'DFtitulo_categoria', 'Título da categoria';
EXEC api.CRIAR_DESCRICAO 'tom.TBcategoria', 'DFidentificador_categoria', 'Identificador único do tipo de assunto';
EXEC api.CRIAR_DESCRICAO 'tom.TBcategoria', 'DFnivel_prioridade', 'Nível de prioridade da categoria';
GO