/*
TBtipo_avaliacao - Tabela de tipos de avaliação (padrão TomTicket)
Sistema HelpDesk - Lookup table para avaliações de satisfação com chave natural
Derivada de: tom.TBtipo_avaliacao (mantendo padrão de chave natural)
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'sac.TBtipo_avaliacao') IS NULL
BEGIN
    CREATE TABLE sac.TBtipo_avaliacao (
        DFtipo_avaliacao CHAR(1) NOT NULL,
        DFnome_avaliacao NVARCHAR(50) NOT NULL,
        DFdescricao NVARCHAR(200) NULL,
        DFcor NVARCHAR(20) NOT NULL DEFAULT 'normal',
        DFicone NVARCHAR(50) NULL DEFAULT 'star',
        DFpontuacao INTEGER NOT NULL DEFAULT 0, -- Para cálculos de média
        DFpeso_ordenacao INTEGER NOT NULL DEFAULT 0,
        DFativo BIT NOT NULL DEFAULT 1,
        DFdata_criacao DATETIME NOT NULL DEFAULT GETDATE(),
        DFdata_ultima_atualizacao DATETIME NULL,
        DFobservacoes NVARCHAR(MAX) NULL,

        CONSTRAINT PK__sac_TBtipo_avaliacao PRIMARY KEY (DFtipo_avaliacao),
        CONSTRAINT UQ__sac_TBtipo_avaliacao__DFnome_avaliacao UNIQUE (DFnome_avaliacao)
    );
    PRINT 'Tabela sac.TBtipo_avaliacao criada com sucesso';
END
GO


-- Relacionamentos usando API
EXEC api.CRIAR_RELACAO 'sac.TBtipo_avaliacao', 'DFcor', 'sac.TBcor_semantica', 'DFcor';
GO

-- População inicial (idempotente)
IF NOT EXISTS (SELECT 1 FROM sac.TBtipo_avaliacao)
BEGIN
    INSERT INTO sac.TBtipo_avaliacao (DFtipo_avaliacao, DFnome_avaliacao, DFdescricao, DFcor, DFicone, DFpontuacao, DFpeso_ordenacao) VALUES
    ('E', 'Excelente', 'Atendimento excepcional, superou expectativas', 'sucesso', 'star', 5, 100),
    ('B', 'Bom', 'Atendimento satisfatório, atendeu às expectativas', 'normal', 'thumbs-up', 4, 80),
    ('R', 'Regular', 'Atendimento adequado, mas com pontos de melhoria', 'alerta', 'meh', 3, 60),
    ('P', 'Péssimo', 'Atendimento insatisfatório, não atendeu às expectativas', 'critico', 'thumbs-down', 1, 20);
    PRINT 'Dados iniciais inseridos em sac.TBtipo_avaliacao';
END
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'sac.TBtipo_avaliacao', 'DFtipo_avaliacao', 1; -- PK já criado
EXEC api.CRIAR_INDICE 'sac.TBtipo_avaliacao', 'DFnome_avaliacao', 1; -- UNIQUE já criado
EXEC api.CRIAR_INDICE 'sac.TBtipo_avaliacao', 'DFcor';
EXEC api.CRIAR_INDICE 'sac.TBtipo_avaliacao', 'DFpontuacao';
EXEC api.CRIAR_INDICE 'sac.TBtipo_avaliacao', 'DFpeso_ordenacao';
EXEC api.CRIAR_INDICE 'sac.TBtipo_avaliacao', 'DFativo';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_avaliacao', NULL, 'Define os tipos de avaliação de satisfação disponíveis';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_avaliacao', 'DFtipo_avaliacao', 'Código da avaliação (chave natural)';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_avaliacao', 'DFnome_avaliacao', 'Nome da avaliação';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_avaliacao', 'DFdescricao', 'Descrição detalhada da avaliação';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_avaliacao', 'DFcor', 'Cor semântica da avaliação';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_avaliacao', 'DFicone', 'Ícone para exibição da avaliação';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_avaliacao', 'DFpontuacao', 'Pontuação numérica para cálculos de média';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_avaliacao', 'DFpeso_ordenacao', 'Peso para ordenação (maior = melhor avaliação)';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_avaliacao', 'DFativo', 'Indica se a avaliação está ativa (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_avaliacao', 'DFdata_criacao', 'Data e hora de criação do registro';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_avaliacao', 'DFdata_ultima_atualizacao', 'Data e hora da última atualização';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_avaliacao', 'DFobservacoes', 'Observações sobre a avaliação';
GO

