/*
TBferiado - Tabela de feriados para cálculo de SLA
Sistema HelpDesk - Define feriados que devem ser considerados no cálculo de SLA
Nova tabela: Não existia no tom (necessária para cálculos de SLA)
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'sac.TBferiado') IS NULL
BEGIN
    CREATE TABLE sac.TBferiado (
        DFid_feriado INTEGER IDENTITY(1,1) NOT NULL,
        DFnome_feriado NVARCHAR(255) NOT NULL,
        DFdata_feriado DATE NOT NULL,
        DFtipo_feriado CHAR(1) NOT NULL DEFAULT 'N', -- N=Nacional, E=Estadual, M=Municipal, C=Corporativo
        DFestado NVARCHAR(50) NULL, -- Para feriados estaduais
        DFcidade NVARCHAR(100) NULL, -- Para feriados municipais
        DFrecorrente BIT NOT NULL DEFAULT 0, -- S=Recorre anualmente, N=Data específica
        DFativo BIT NOT NULL DEFAULT 1,
        DFdata_criacao DATETIME NOT NULL DEFAULT GETDATE(),
        DFdata_ultima_atualizacao DATETIME NULL,
        DFobservacoes NVARCHAR(MAX) NULL,

        CONSTRAINT PK__sac_TBferiado PRIMARY KEY (DFid_feriado),
        CONSTRAINT UQ__sac_TBferiado__DFdata_tipo UNIQUE (DFdata_feriado, DFtipo_feriado, DFestado, DFcidade),
        CONSTRAINT CK__sac_TBferiado__DFtipo_feriado CHECK (DFtipo_feriado IN ('N', 'E', 'M', 'C')),
    );
    PRINT 'Tabela sac.TBferiado criada com sucesso';
END
GO


-- Índices usando API
EXEC api.CRIAR_INDICE 'sac.TBferiado', 'DFdata_feriado';
EXEC api.CRIAR_INDICE 'sac.TBferiado', 'DFtipo_feriado';
EXEC api.CRIAR_INDICE 'sac.TBferiado', 'DFativo';
EXEC api.CRIAR_INDICE 'sac.TBferiado', 'DFrecorrente';
EXEC api.CRIAR_INDICE 'sac.TBferiado', 'DFestado,DFcidade';
EXEC api.CRIAR_INDICE 'sac.TBferiado', 'DFdata_feriado,DFativo';
GO

-- População inicial (idempotente) - Feriados nacionais brasileiros
IF NOT EXISTS (SELECT 1 FROM sac.TBferiado)
BEGIN
    INSERT INTO sac.TBferiado (DFnome_feriado, DFdata_feriado, DFtipo_feriado, DFrecorrente) VALUES
    ('Confraternização Universal', '2024-01-01', 'N', 1),
    ('Tiradentes', '2024-04-21', 'N', 1),
    ('Dia do Trabalhador', '2024-05-01', 'N', 1),
    ('Independência do Brasil', '2024-09-07', 'N', 1),
    ('Nossa Senhora Aparecida', '2024-10-12', 'N', 1),
    ('Finados', '2024-11-02', 'N', 1),
    ('Proclamação da República', '2024-11-15', 'N', 1),
    ('Natal', '2024-12-25', 'N', 1);
    PRINT 'Dados iniciais inseridos em sac.TBferiado';
END
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'sac.TBferiado', NULL, 'Define os feriados que devem ser considerados no cálculo de SLA';
EXEC api.CRIAR_DESCRICAO 'sac.TBferiado', 'DFid_feriado', 'ID único do feriado';
EXEC api.CRIAR_DESCRICAO 'sac.TBferiado', 'DFnome_feriado', 'Nome do feriado';
EXEC api.CRIAR_DESCRICAO 'sac.TBferiado', 'DFdata_feriado', 'Data do feriado';
EXEC api.CRIAR_DESCRICAO 'sac.TBferiado', 'DFtipo_feriado', 'Tipo do feriado (N=Nacional, E=Estadual, M=Municipal, C=Corporativo)';
EXEC api.CRIAR_DESCRICAO 'sac.TBferiado', 'DFestado', 'Estado (para feriados estaduais)';
EXEC api.CRIAR_DESCRICAO 'sac.TBferiado', 'DFcidade', 'Cidade (para feriados municipais)';
EXEC api.CRIAR_DESCRICAO 'sac.TBferiado', 'DFrecorrente', 'Indica se recorre anualmente (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBferiado', 'DFativo', 'Indica se o feriado está ativo (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBferiado', 'DFdata_criacao', 'Data e hora de criação do registro';
EXEC api.CRIAR_DESCRICAO 'sac.TBferiado', 'DFdata_ultima_atualizacao', 'Data e hora da última atualização';
EXEC api.CRIAR_DESCRICAO 'sac.TBferiado', 'DFobservacoes', 'Observações sobre o feriado';
GO

