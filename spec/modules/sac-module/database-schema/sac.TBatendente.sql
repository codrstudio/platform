/*
TBatendente - Tabela de atendentes do sistema HelpDesk (ATUALIZADA)
Sistema HelpDesk - Operadores do sistema com vínculo opcional a usuário
Atualizada: Adicionado vínculo opcional com TBusuario
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'sac.TBatendente') IS NULL
BEGIN
    CREATE TABLE sac.TBatendente (
        DFid_atendente INTEGER IDENTITY(1,1) NOT NULL,
        DFid_usuario INTEGER NULL, -- Vínculo opcional com usuário (para login)
        DFnome_atendente NVARCHAR(255) NOT NULL,
        DFemail_atendente NVARCHAR(255) NOT NULL,
        DFtelefone_atendente NVARCHAR(20) NULL,
        DFcargo NVARCHAR(100) NULL,
        DFnivel_experiencia CHAR(1) NULL DEFAULT 'J', -- T=Trainee, J=Junior, P=Pleno, S=Senior, L=Lider
        DFespecialidades NVARCHAR(500) NULL, -- Lista de especialidades separadas por vírgula
        DFativo BIT NOT NULL DEFAULT 1,
        DFdata_admissao DATE NULL,
        DFdata_demissao DATE NULL,
        DFdata_criacao DATETIME NOT NULL DEFAULT GETDATE(),
        DFdata_ultima_atualizacao DATETIME NULL,
        DFobservacoes NVARCHAR(MAX) NULL,

        CONSTRAINT PK__sac_TBatendente PRIMARY KEY (DFid_atendente),
        CONSTRAINT UQ__sac_TBatendente__DFemail_atendente UNIQUE (DFemail_atendente),
        CONSTRAINT UQ__sac_TBatendente__DFid_usuario UNIQUE (DFid_usuario), -- Um usuário pode ser apenas um atendente
        CONSTRAINT CK__sac_TBatendente__DFnivel_experiencia CHECK (DFnivel_experiencia IN ('T', 'J', 'P', 'S', 'L'))
    );
END
GO


-- Relacionamentos usando API
EXEC api.CRIAR_RELACAO 'sac.TBatendente', 'DFid_usuario', 'sac.TBusuario', 'DFid_usuario';
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'sac.TBatendente', 'DFemail_atendente', 1; -- UNIQUE já criado via constraint
EXEC api.CRIAR_INDICE 'sac.TBatendente', 'DFid_usuario', 1; -- UNIQUE já criado via constraint
EXEC api.CRIAR_INDICE 'sac.TBatendente', 'DFativo';
EXEC api.CRIAR_INDICE 'sac.TBatendente', 'DFnivel_experiencia';
EXEC api.CRIAR_INDICE 'sac.TBatendente', 'DFdata_criacao';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'sac.TBatendente', NULL, 'Define os atendentes do sistema com vínculo opcional a usuário';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendente', 'DFid_atendente', 'Código único do atendente';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendente', 'DFid_usuario', 'Usuário vinculado (NULL = atendente sem login)';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendente', 'DFnome_atendente', 'Nome completo do atendente';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendente', 'DFemail_atendente', 'Email do atendente';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendente', 'DFtelefone_atendente', 'Telefone do atendente';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendente', 'DFcargo', 'Cargo do atendente';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendente', 'DFnivel_experiencia', 'Nível de experiência (T=Trainee, J=Junior, P=Pleno, S=Senior, L=Lider)';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendente', 'DFespecialidades', 'Especialidades do atendente';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendente', 'DFativo', 'Indica se o atendente está ativo (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendente', 'DFdata_admissao', 'Data de admissão';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendente', 'DFdata_demissao', 'Data de demissão';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendente', 'DFdata_criacao', 'Data e hora de criação do registro';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendente', 'DFdata_ultima_atualizacao', 'Data e hora da última atualização';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendente', 'DFobservacoes', 'Observações sobre o atendente';
GO
