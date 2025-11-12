/*
TBpapel - Tabela de papéis do sistema HelpDesk (ATUALIZADA)
Sistema HelpDesk - Define papéis/roles para controle de acesso
Atualizada: Apenas ESPECTADOR e ADMINISTRADOR são fixos, GERENTE é removível
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'sac.TBpapel') IS NULL
BEGIN
    CREATE TABLE sac.TBpapel (
        DFid_papel INTEGER IDENTITY(1,1) NOT NULL,
        DFcodigo_papel NVARCHAR(20) NOT NULL,
        DFnome_papel NVARCHAR(100) NOT NULL,
        DFdescricao NVARCHAR(500) NULL,
        DFfixo BIT NOT NULL DEFAULT 0, -- 1=Papel fixo (não pode ser removido), 0=Papel removível
        DFpermite_explorar BIT NOT NULL DEFAULT 1,
        DFpermite_alterar BIT NOT NULL DEFAULT 0,
        DFpermite_configurar BIT NOT NULL DEFAULT 0,
        DFcor NVARCHAR(20) NOT NULL DEFAULT 'normal',
        DFicone NVARCHAR(50) NULL DEFAULT 'user',
        DFativo BIT NOT NULL DEFAULT 1,
        DFdata_criacao DATETIME NOT NULL DEFAULT GETDATE(),
        DFdata_ultima_atualizacao DATETIME NULL,
        DFobservacoes NVARCHAR(MAX) NULL,

        CONSTRAINT PK__sac_TBpapel PRIMARY KEY (DFid_papel),
        CONSTRAINT UQ__sac_TBpapel__DFcodigo_papel UNIQUE (DFcodigo_papel),
        CONSTRAINT UQ__sac_TBpapel__DFnome_papel UNIQUE (DFnome_papel)
    );
END
GO

-- Relacionamentos usando API
EXEC api.CRIAR_RELACAO 'sac.TBpapel', 'DFcor', 'sac.TBcor_semantica', 'DFcor';
GO

-- População inicial (idempotente) - Papéis do sistema
IF NOT EXISTS (SELECT 1 FROM sac.TBpapel)
BEGIN
    INSERT INTO sac.TBpapel (DFcodigo_papel, DFnome_papel, DFdescricao, DFfixo, DFpermite_explorar, DFpermite_alterar, DFpermite_configurar, DFcor, DFicone) VALUES
    ('espectador', 'Espectador', 'Pode explorar o sistema sem fazer alterações', 1, 1, 0, 0, 'trivial', 'eye'),
    ('administrador', 'Administrador', 'Pode explorar, alterar e configurar todo o sistema', 1, 1, 1, 1, 'critico', 'shield'),
    ('gerente', 'Gerente', 'Pode explorar e alterar dados do sistema', 0, 1, 1, 0, 'destacado', 'briefcase');
    PRINT 'Papéis padrão inseridos em sac.TBpapel';
END
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'sac.TBpapel', 'DFcodigo_papel', 1; -- UNIQUE já criado via constraint
EXEC api.CRIAR_INDICE 'sac.TBpapel', 'DFnome_papel', 1; -- UNIQUE já criado via constraint
EXEC api.CRIAR_INDICE 'sac.TBpapel', 'DFfixo';
EXEC api.CRIAR_INDICE 'sac.TBpapel', 'DFativo';
EXEC api.CRIAR_INDICE 'sac.TBpapel', 'DFpermite_explorar,DFpermite_alterar,DFpermite_configurar';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'sac.TBpapel', NULL, 'Define os papéis/roles do sistema para controle de acesso';
EXEC api.CRIAR_DESCRICAO 'sac.TBpapel', 'DFid_papel', 'Código único do papel';
EXEC api.CRIAR_DESCRICAO 'sac.TBpapel', 'DFcodigo_papel', 'Código identificador do papel';
EXEC api.CRIAR_DESCRICAO 'sac.TBpapel', 'DFnome_papel', 'Nome do papel';
EXEC api.CRIAR_DESCRICAO 'sac.TBpapel', 'DFdescricao', 'Descrição detalhada do papel';
EXEC api.CRIAR_DESCRICAO 'sac.TBpapel', 'DFfixo', 'Indica se é papel fixo do sistema (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBpapel', 'DFpermite_explorar', 'Permite explorar/visualizar o sistema (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBpapel', 'DFpermite_alterar', 'Permite alterar dados do sistema (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBpapel', 'DFpermite_configurar', 'Permite configurar o sistema (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBpapel', 'DFcor', 'Cor semântica do papel';
EXEC api.CRIAR_DESCRICAO 'sac.TBpapel', 'DFicone', 'Ícone para exibição do papel';
EXEC api.CRIAR_DESCRICAO 'sac.TBpapel', 'DFativo', 'Indica se o papel está ativo (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBpapel', 'DFdata_criacao', 'Data e hora de criação do registro';
EXEC api.CRIAR_DESCRICAO 'sac.TBpapel', 'DFdata_ultima_atualizacao', 'Data e hora da última atualização';
EXEC api.CRIAR_DESCRICAO 'sac.TBpapel', 'DFobservacoes', 'Observações sobre o papel';
GO
