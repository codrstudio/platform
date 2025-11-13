/*
TBatendente_departamento - Tabela de relacionamento N:N entre atendentes e departamentos
Sistema HelpDesk - Define quais departamentos cada atendente pode atender
Nova tabela: Não existia no tom (necessária para requisitos)
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'sac.TBatendente_departamento') IS NULL
BEGIN
    CREATE TABLE sac.TBatendente_departamento (
        DFid_atendente INTEGER NOT NULL,
        DFid_departamento INTEGER NOT NULL,
        DFpermissao_nivel CHAR(1) NOT NULL DEFAULT 'A', -- A=Atendimento, S=Supervisor, G=Gerente
        DFativo BIT NOT NULL DEFAULT 1,
        DFdata_atribuicao DATETIME NOT NULL DEFAULT GETDATE(),
        DFdata_remocao DATETIME NULL,
        DFid_atendente_atribuicao INTEGER NULL, -- Quem fez a atribuição
        DFobservacoes NVARCHAR(MAX) NULL,

        CONSTRAINT PK__sac_TBatendente_departamento PRIMARY KEY (DFid_atendente, DFid_departamento),
        CONSTRAINT CK__sac_TBatendente_departamento__DFpermissao_nivel CHECK (DFpermissao_nivel IN ('A', 'S', 'G'))
    );
    PRINT 'Tabela sac.TBatendente_departamento criada com sucesso';
END
GO


-- Relacionamentos usando API
EXEC api.CRIAR_RELACAO 'sac.TBatendente_departamento', 'DFid_atendente', 'sac.TBatendente', 'DFid_atendente';
EXEC api.CRIAR_RELACAO 'sac.TBatendente_departamento', 'DFid_departamento', 'sac.TBdepartamento', 'DFid_departamento';
EXEC api.CRIAR_RELACAO 'sac.TBatendente_departamento', 'DFid_atendente_atribuicao', 'sac.TBatendente', 'DFid_atendente';
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'sac.TBatendente_departamento', 'DFid_atendente,DFid_departamento', 1; -- PK já criado
EXEC api.CRIAR_INDICE 'sac.TBatendente_departamento', 'DFid_departamento';
EXEC api.CRIAR_INDICE 'sac.TBatendente_departamento', 'DFativo';
EXEC api.CRIAR_INDICE 'sac.TBatendente_departamento', 'DFpermissao_nivel';
EXEC api.CRIAR_INDICE 'sac.TBatendente_departamento', 'DFdata_atribuicao';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'sac.TBatendente_departamento', NULL, 'Define o relacionamento N:N entre atendentes e departamentos com níveis de permissão';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendente_departamento', 'DFid_atendente', 'ID do atendente';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendente_departamento', 'DFid_departamento', 'ID do departamento';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendente_departamento', 'DFpermissao_nivel', 'Nível de permissão (A=Atendimento, S=Supervisor, G=Gerente)';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendente_departamento', 'DFativo', 'Indica se a atribuição está ativa (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendente_departamento', 'DFdata_atribuicao', 'Data e hora da atribuição';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendente_departamento', 'DFdata_remocao', 'Data e hora da remoção (se aplicável)';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendente_departamento', 'DFid_atendente_atribuicao', 'Atendente que fez a atribuição';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendente_departamento', 'DFobservacoes', 'Observações sobre a atribuição';
GO

