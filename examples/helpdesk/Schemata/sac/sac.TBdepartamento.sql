/*
TBdepartamento - Tabela de departamentos/produtos do sistema HelpDesk
Sistema HelpDesk - Organização dos atendimentos por departamento
Derivada de: tom.TBdepartamento (estrutura otimizada)
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'sac.TBdepartamento') IS NULL
BEGIN
    CREATE TABLE sac.TBdepartamento (
        DFid_departamento INTEGER IDENTITY(1,1) NOT NULL,
        DFnome_departamento NVARCHAR(255) NOT NULL,
        DFcodigo_departamento NVARCHAR(50) NOT NULL,
        DFdescricao NVARCHAR(500) NULL,
        DFemail_departamento NVARCHAR(255) NULL,
        DFcor_hexadecimal CHAR(7) NULL DEFAULT '#007bff',
        DFicone NVARCHAR(50) NULL DEFAULT 'folder',
        DFativo BIT NOT NULL DEFAULT 1,
        DFdata_criacao DATETIME NOT NULL DEFAULT GETDATE(),
        DFdata_ultima_atualizacao DATETIME NULL,
        DFtemplate_email_criacao NVARCHAR(MAX) NULL,
        DFtemplate_email_atualizacao NVARCHAR(MAX) NULL,
        DFtemplate_email_finalizacao NVARCHAR(MAX) NULL,
        DFmensagem_inicial_padrao NVARCHAR(MAX) NULL,
        DFsla_padrao_horas INTEGER NULL DEFAULT 24,
        DFprivativo BIT NOT NULL DEFAULT 0, -- Apenas atendentes específicos
        DFpermite_chamados_externos BIT NOT NULL DEFAULT 1,
        DFobservacoes NVARCHAR(MAX) NULL,

        CONSTRAINT PK__sac_TBdepartamento PRIMARY KEY (DFid_departamento),
        CONSTRAINT UQ__sac_TBdepartamento__DFcodigo_departamento UNIQUE (DFcodigo_departamento),
        CONSTRAINT UQ__sac_TBdepartamento__DFnome_departamento UNIQUE (DFnome_departamento),
    );
    PRINT 'Tabela sac.TBdepartamento criada com sucesso';
END
GO


-- Índices usando API
EXEC api.CRIAR_INDICE 'sac.TBdepartamento', 'DFcodigo_departamento', 1; -- UNIQUE já criado via constraint
EXEC api.CRIAR_INDICE 'sac.TBdepartamento', 'DFnome_departamento', 1; -- UNIQUE já criado via constraint
EXEC api.CRIAR_INDICE 'sac.TBdepartamento', 'DFativo';
EXEC api.CRIAR_INDICE 'sac.TBdepartamento', 'DFprivativo';
EXEC api.CRIAR_INDICE 'sac.TBdepartamento', 'DFdata_criacao';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'sac.TBdepartamento', NULL, 'Define os departamentos/produtos disponíveis no sistema para organização dos atendimentos';
EXEC api.CRIAR_DESCRICAO 'sac.TBdepartamento', 'DFid_departamento', 'Código único do departamento';
EXEC api.CRIAR_DESCRICAO 'sac.TBdepartamento', 'DFnome_departamento', 'Nome do departamento';
EXEC api.CRIAR_DESCRICAO 'sac.TBdepartamento', 'DFcodigo_departamento', 'Código único identificador do departamento';
EXEC api.CRIAR_DESCRICAO 'sac.TBdepartamento', 'DFdescricao', 'Descrição detalhada do departamento';
EXEC api.CRIAR_DESCRICAO 'sac.TBdepartamento', 'DFemail_departamento', 'Email do departamento para notificações';
EXEC api.CRIAR_DESCRICAO 'sac.TBdepartamento', 'DFcor_hexadecimal', 'Cor em formato hexadecimal para identificação visual';
EXEC api.CRIAR_DESCRICAO 'sac.TBdepartamento', 'DFicone', 'Nome do ícone para exibição em interfaces';
EXEC api.CRIAR_DESCRICAO 'sac.TBdepartamento', 'DFativo', 'Indica se o departamento está ativo (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBdepartamento', 'DFdata_criacao', 'Data e hora de criação do registro';
EXEC api.CRIAR_DESCRICAO 'sac.TBdepartamento', 'DFdata_ultima_atualizacao', 'Data e hora da última atualização';
EXEC api.CRIAR_DESCRICAO 'sac.TBdepartamento', 'DFtemplate_email_criacao', 'Template de email para criação de chamados';
EXEC api.CRIAR_DESCRICAO 'sac.TBdepartamento', 'DFtemplate_email_atualizacao', 'Template de email para atualizações de chamados';
EXEC api.CRIAR_DESCRICAO 'sac.TBdepartamento', 'DFtemplate_email_finalizacao', 'Template de email para finalização de chamados';
EXEC api.CRIAR_DESCRICAO 'sac.TBdepartamento', 'DFmensagem_inicial_padrao', 'Mensagem inicial padrão para novos chamados';
EXEC api.CRIAR_DESCRICAO 'sac.TBdepartamento', 'DFsla_padrao_horas', 'SLA padrão em horas para chamados do departamento';
EXEC api.CRIAR_DESCRICAO 'sac.TBdepartamento', 'DFprivativo', 'Indica se apenas atendentes específicos podem acessar (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBdepartamento', 'DFpermite_chamados_externos', 'Permite criação de chamados por contatos externos (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBdepartamento', 'DFobservacoes', 'Observações gerais sobre o departamento';
GO

