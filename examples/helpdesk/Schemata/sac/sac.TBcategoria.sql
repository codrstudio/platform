/*
TBcategoria - Tabela de categorias/tipos de assunto do sistema HelpDesk
Sistema HelpDesk - Classificação de chamados por categoria
Derivada de: tom.TBcategoria (estrutura expandida)
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'sac.TBcategoria') IS NULL
BEGIN
    CREATE TABLE sac.TBcategoria (
        DFid_categoria INTEGER IDENTITY(1,1) NOT NULL,
        DFnome_categoria NVARCHAR(255) NOT NULL,
        DFcodigo_categoria NVARCHAR(50) NOT NULL,
        DFdescricao NVARCHAR(500) NULL,
        DFid_categoria_pai INTEGER NULL, -- Hierarquia de categorias
        DFcor_hexadecimal CHAR(7) NULL DEFAULT '#6c757d',
        DFicone NVARCHAR(50) NULL DEFAULT 'tag',
        DFprioridade_padrao CHAR(1) NULL DEFAULT 'N', -- B=Baixa, N=Normal, A=Alta, U=Urgente
        DFnivel_prioridade INTEGER NULL, -- Sugestão numérica de prioridade
        DFsla_padrao_horas INTEGER NULL,
        DFativo BIT NOT NULL DEFAULT 1,
        DFdata_criacao DATETIME NOT NULL DEFAULT GETDATE(),
        DFdata_ultima_atualizacao DATETIME NULL,
        DFordem_exibicao INTEGER NULL DEFAULT 0,
        DFtemplate_descricao NVARCHAR(MAX) NULL, -- Template para descrição de chamados
        DFobservacoes NVARCHAR(MAX) NULL,

        CONSTRAINT PK__sac_TBcategoria PRIMARY KEY (DFid_categoria),
        CONSTRAINT UQ__sac_TBcategoria__DFcodigo_categoria UNIQUE (DFcodigo_categoria),
        CONSTRAINT UQ__sac_TBcategoria__DFnome_categoria UNIQUE (DFnome_categoria),
        CONSTRAINT CK__sac_TBcategoria__DFprioridade_padrao CHECK (DFprioridade_padrao IN ('B', 'N', 'A', 'U'))
    );
    PRINT 'Tabela sac.TBcategoria criada com sucesso';
END
GO

-- Evolução: Adição de novo campo (idempotente)
IF COL_LENGTH('sac.TBcategoria', 'DFnivel_prioridade') IS NULL
BEGIN
    ALTER TABLE sac.TBcategoria ADD DFnivel_prioridade INTEGER NULL;
    PRINT 'Campo DFnivel_prioridade adicionado à tabela sac.TBcategoria';
END
GO

-- Relacionamentos usando API
EXEC api.CRIAR_RELACAO 'sac.TBcategoria', 'DFid_categoria_pai', 'sac.TBcategoria', 'DFid_categoria';
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'sac.TBcategoria', 'DFcodigo_categoria', 1; -- UNIQUE já criado via constraint
EXEC api.CRIAR_INDICE 'sac.TBcategoria', 'DFnome_categoria', 1; -- UNIQUE já criado via constraint
EXEC api.CRIAR_INDICE 'sac.TBcategoria', 'DFid_categoria_pai';
EXEC api.CRIAR_INDICE 'sac.TBcategoria', 'DFativo';
EXEC api.CRIAR_INDICE 'sac.TBcategoria', 'DFordem_exibicao';
EXEC api.CRIAR_INDICE 'sac.TBcategoria', 'DFdata_criacao';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'sac.TBcategoria', NULL, 'Define as categorias/tipos de assunto disponíveis para classificação de chamados';
EXEC api.CRIAR_DESCRICAO 'sac.TBcategoria', 'DFid_categoria', 'Código único da categoria';
EXEC api.CRIAR_DESCRICAO 'sac.TBcategoria', 'DFnome_categoria', 'Nome da categoria';
EXEC api.CRIAR_DESCRICAO 'sac.TBcategoria', 'DFcodigo_categoria', 'Código único identificador da categoria';
EXEC api.CRIAR_DESCRICAO 'sac.TBcategoria', 'DFdescricao', 'Descrição detalhada da categoria';
EXEC api.CRIAR_DESCRICAO 'sac.TBcategoria', 'DFid_categoria_pai', 'ID da categoria pai (para hierarquia)';
EXEC api.CRIAR_DESCRICAO 'sac.TBcategoria', 'DFcor_hexadecimal', 'Cor em formato hexadecimal para identificação visual';
EXEC api.CRIAR_DESCRICAO 'sac.TBcategoria', 'DFicone', 'Nome do ícone para exibição em interfaces';
EXEC api.CRIAR_DESCRICAO 'sac.TBcategoria', 'DFprioridade_padrao', 'Prioridade padrão para chamados desta categoria (B=Baixa, N=Normal, A=Alta, U=Urgente)';
EXEC api.CRIAR_DESCRICAO 'sac.TBcategoria', 'DFnivel_prioridade', 'Sugestão numérica de prioridade (valor inteiro)';
EXEC api.CRIAR_DESCRICAO 'sac.TBcategoria', 'DFsla_padrao_horas', 'SLA padrão em horas para chamados desta categoria';
EXEC api.CRIAR_DESCRICAO 'sac.TBcategoria', 'DFativo', 'Indica se a categoria está ativa (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBcategoria', 'DFdata_criacao', 'Data e hora de criação do registro';
EXEC api.CRIAR_DESCRICAO 'sac.TBcategoria', 'DFdata_ultima_atualizacao', 'Data e hora da última atualização';
EXEC api.CRIAR_DESCRICAO 'sac.TBcategoria', 'DFordem_exibicao', 'Ordem de exibição em interfaces';
EXEC api.CRIAR_DESCRICAO 'sac.TBcategoria', 'DFtemplate_descricao', 'Template padrão para descrição de chamados desta categoria';
EXEC api.CRIAR_DESCRICAO 'sac.TBcategoria', 'DFobservacoes', 'Observações gerais sobre a categoria';
GO

