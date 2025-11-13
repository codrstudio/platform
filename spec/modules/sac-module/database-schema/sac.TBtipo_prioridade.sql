/*
TBtipo_prioridade - Tabela de tipos de prioridade (padrão TomTicket)
Sistema HelpDesk - Lookup table para prioridades com chave natural
Derivada de: tom.TBtipo_prioridade (mantendo padrão de chave natural)
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'sac.TBtipo_prioridade') IS NULL
BEGIN
    CREATE TABLE sac.TBtipo_prioridade (
        DFtipo_prioridade CHAR(1) NOT NULL,
        DFnome_prioridade NVARCHAR(50) NOT NULL,
        DFdescricao NVARCHAR(200) NULL,
        DFcor NVARCHAR(20) NOT NULL DEFAULT 'normal',
        DFicone NVARCHAR(50) NULL DEFAULT 'circle',
        DFsla_horas_padrao INTEGER NULL,
        DFpeso_ordenacao INTEGER NOT NULL DEFAULT 0,
        DFativo BIT NOT NULL DEFAULT 1,
        DFdata_criacao DATETIME NOT NULL DEFAULT GETDATE(),
        DFdata_ultima_atualizacao DATETIME NULL,
        DFobservacoes NVARCHAR(MAX) NULL,

        CONSTRAINT PK__sac_TBtipo_prioridade PRIMARY KEY (DFtipo_prioridade),
        CONSTRAINT UQ__sac_TBtipo_prioridade__DFnome_prioridade UNIQUE (DFnome_prioridade)
    );
    PRINT 'Tabela sac.TBtipo_prioridade criada com sucesso';
END
GO


-- Relacionamentos usando API
EXEC api.CRIAR_RELACAO 'sac.TBtipo_prioridade', 'DFcor', 'sac.TBcor_semantica', 'DFcor';
GO

-- População inicial (idempotente)
IF NOT EXISTS (SELECT 1 FROM sac.TBtipo_prioridade)
BEGIN
    INSERT INTO sac.TBtipo_prioridade (DFtipo_prioridade, DFnome_prioridade, DFdescricao, DFcor, DFicone, DFsla_horas_padrao, DFpeso_ordenacao) VALUES
    ('U', 'Urgente', 'Requer atenção imediata - problemas críticos que impedem o trabalho', 'critico', 'alert-triangle', 2, 100),
    ('A', 'Alta', 'Problemas importantes que afetam significativamente o trabalho', 'alerta', 'arrow-up', 8, 80),
    ('N', 'Normal', 'Prioridade padrão para a maioria dos chamados', 'normal', 'minus', 24, 50),
    ('B', 'Baixa', 'Problemas menores ou melhorias que podem aguardar', 'trivial', 'arrow-down', 72, 20);
    PRINT 'Dados iniciais inseridos em sac.TBtipo_prioridade';
END
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'sac.TBtipo_prioridade', 'DFtipo_prioridade', 1; -- PK já criado
EXEC api.CRIAR_INDICE 'sac.TBtipo_prioridade', 'DFnome_prioridade', 1; -- UNIQUE já criado
EXEC api.CRIAR_INDICE 'sac.TBtipo_prioridade', 'DFcor';
EXEC api.CRIAR_INDICE 'sac.TBtipo_prioridade', 'DFpeso_ordenacao';
EXEC api.CRIAR_INDICE 'sac.TBtipo_prioridade', 'DFativo';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_prioridade', NULL, 'Define os tipos de prioridade disponíveis para chamados';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_prioridade', 'DFtipo_prioridade', 'Código da prioridade (chave natural)';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_prioridade', 'DFnome_prioridade', 'Nome da prioridade';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_prioridade', 'DFdescricao', 'Descrição detalhada da prioridade';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_prioridade', 'DFcor', 'Cor semântica da prioridade';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_prioridade', 'DFicone', 'Ícone para exibição da prioridade';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_prioridade', 'DFsla_horas_padrao', 'SLA padrão em horas para esta prioridade';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_prioridade', 'DFpeso_ordenacao', 'Peso para ordenação (maior = mais prioritário)';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_prioridade', 'DFativo', 'Indica se a prioridade está ativa (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_prioridade', 'DFdata_criacao', 'Data e hora de criação do registro';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_prioridade', 'DFdata_ultima_atualizacao', 'Data e hora da última atualização';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_prioridade', 'DFobservacoes', 'Observações sobre a prioridade';
GO

