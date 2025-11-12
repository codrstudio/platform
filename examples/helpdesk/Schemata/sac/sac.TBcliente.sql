/*
TBcliente - Tabela de clientes/empresas do sistema HelpDesk
Sistema HelpDesk - Gestão de clientes que contratam suporte
Derivada de: tom.TBorganizacao (reinterpretação: organização → cliente)
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'sac.TBcliente') IS NULL
BEGIN
    CREATE TABLE sac.TBcliente (
        DFid_cliente INTEGER IDENTITY(1,1) NOT NULL,
        DFnome_cliente NVARCHAR(255) NOT NULL,
        DFrazao_social NVARCHAR(255) NULL,
        DFcnpj NVARCHAR(18) NULL,
        DFsite_web NVARCHAR(255) NULL,
        DFtelefone NVARCHAR(50) NULL,
        DFemail NVARCHAR(255) NULL,
        DFendereco_completo NVARCHAR(500) NULL,
        DFcidade NVARCHAR(100) NULL,
        DFestado NVARCHAR(50) NULL,
        DFcep NVARCHAR(10) NULL,
        DFsegmento CHAR(1) NOT NULL DEFAULT 'V', -- A=Atacado, V=Varejo
        DFlimite_chamados_mensal INTEGER NULL DEFAULT 0,
        DFativo BIT NOT NULL DEFAULT 1,
        DFdata_criacao DATETIME NOT NULL DEFAULT GETDATE(),
        DFdata_ultima_atualizacao DATETIME NULL,
        DFid_cliente_matriz INTEGER NULL, -- Hierarquia de clientes
        DFid_atendente_responsavel INTEGER NULL,
        DFcampos_personalizados NVARCHAR(MAX) NULL,
        DFobservacoes NVARCHAR(MAX) NULL,

        CONSTRAINT PK__sac_TBcliente PRIMARY KEY (DFid_cliente),
        CONSTRAINT UQ__sac_TBcliente__DFnome_cliente UNIQUE (DFnome_cliente),
        CONSTRAINT CK__sac_TBcliente__DFsegmento CHECK (DFsegmento IN ('A', 'V'))
    );
    PRINT 'Tabela sac.TBcliente criada com sucesso';
END
GO


-- Relacionamentos usando API
EXEC api.CRIAR_RELACAO 'sac.TBcliente', 'DFid_cliente_matriz', 'sac.TBcliente', 'DFid_cliente';
EXEC api.CRIAR_RELACAO 'sac.TBcliente', 'DFid_atendente_responsavel', 'sac.TBatendente', 'DFid_atendente';
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'sac.TBcliente', 'DFnome_cliente', 1; -- UNIQUE já criado via constraint
EXEC api.CRIAR_INDICE 'sac.TBcliente', 'DFsegmento';
EXEC api.CRIAR_INDICE 'sac.TBcliente', 'DFativo';
EXEC api.CRIAR_INDICE 'sac.TBcliente', 'DFid_cliente_matriz';
EXEC api.CRIAR_INDICE 'sac.TBcliente', 'DFid_atendente_responsavel';
EXEC api.CRIAR_INDICE 'sac.TBcliente', 'DFdata_criacao';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'sac.TBcliente', NULL, 'Define os clientes/empresas que contratam suporte no sistema HelpDesk';
EXEC api.CRIAR_DESCRICAO 'sac.TBcliente', 'DFid_cliente', 'Código único do cliente';
EXEC api.CRIAR_DESCRICAO 'sac.TBcliente', 'DFnome_cliente', 'Nome fantasia do cliente';
EXEC api.CRIAR_DESCRICAO 'sac.TBcliente', 'DFrazao_social', 'Razão social da empresa';
EXEC api.CRIAR_DESCRICAO 'sac.TBcliente', 'DFcnpj', 'CNPJ da empresa';
EXEC api.CRIAR_DESCRICAO 'sac.TBcliente', 'DFsite_web', 'Website do cliente';
EXEC api.CRIAR_DESCRICAO 'sac.TBcliente', 'DFtelefone', 'Telefone principal do cliente';
EXEC api.CRIAR_DESCRICAO 'sac.TBcliente', 'DFemail', 'Email principal do cliente';
EXEC api.CRIAR_DESCRICAO 'sac.TBcliente', 'DFendereco_completo', 'Endereço completo do cliente';
EXEC api.CRIAR_DESCRICAO 'sac.TBcliente', 'DFcidade', 'Cidade do cliente';
EXEC api.CRIAR_DESCRICAO 'sac.TBcliente', 'DFestado', 'Estado/UF do cliente';
EXEC api.CRIAR_DESCRICAO 'sac.TBcliente', 'DFcep', 'CEP do cliente';
EXEC api.CRIAR_DESCRICAO 'sac.TBcliente', 'DFsegmento', 'Segmento do cliente (A=Atacado, V=Varejo)';
EXEC api.CRIAR_DESCRICAO 'sac.TBcliente', 'DFlimite_chamados_mensal', 'Limite de chamados mensais contratados';
EXEC api.CRIAR_DESCRICAO 'sac.TBcliente', 'DFativo', 'Indica se o cliente está ativo (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBcliente', 'DFdata_criacao', 'Data e hora de criação do registro';
EXEC api.CRIAR_DESCRICAO 'sac.TBcliente', 'DFdata_ultima_atualizacao', 'Data e hora da última atualização';
EXEC api.CRIAR_DESCRICAO 'sac.TBcliente', 'DFid_cliente_matriz', 'ID do cliente matriz (para hierarquia)';
EXEC api.CRIAR_DESCRICAO 'sac.TBcliente', 'DFid_atendente_responsavel', 'Atendente responsável pelo cliente';
EXEC api.CRIAR_DESCRICAO 'sac.TBcliente', 'DFcampos_personalizados', 'Campos extras específicos do cliente em formato JSON';
EXEC api.CRIAR_DESCRICAO 'sac.TBcliente', 'DFobservacoes', 'Observações gerais sobre o cliente';
GO

