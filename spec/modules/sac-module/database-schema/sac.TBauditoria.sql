/*
TBauditoria - Tabela de auditoria do sistema
Sistema HelpDesk - Registro de todas as ações importantes do sistema
Nova tabela: Não existia no tom (necessária para auditoria e compliance)
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'sac.TBauditoria') IS NULL
BEGIN
    CREATE TABLE sac.TBauditoria (
        DFid_auditoria BIGINT IDENTITY(1,1) NOT NULL,
        DFdata_hora_acao DATETIME NOT NULL DEFAULT GETDATE(),
        DFtipo_acao NVARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.
        DFtabela_afetada NVARCHAR(100) NULL,
        DFid_registro_afetado INTEGER NULL,
        DFid_usuario INTEGER NULL,
        DFtipo_usuario CHAR(1) NULL, -- A=Atendente, C=Contato, S=Sistema
        DFnome_usuario NVARCHAR(255) NULL,
        DFemail_usuario NVARCHAR(255) NULL,
        DFendereco_ip NVARCHAR(45) NULL,
        DFuser_agent NVARCHAR(500) NULL,
        DFurl_requisicao NVARCHAR(1000) NULL,
        DFmetodo_http NVARCHAR(10) NULL,
        DFvalores_anteriores NVARCHAR(MAX) NULL, -- JSON com valores antes da alteração
        DFvalores_novos NVARCHAR(MAX) NULL, -- JSON com valores após a alteração
        DFdescricao_acao NVARCHAR(MAX) NULL,
        DFresultado_acao CHAR(1) NOT NULL DEFAULT 'S', -- S=Sucesso, F=Falha
        DFmensagem_erro NVARCHAR(MAX) NULL,
        DFsessao_id NVARCHAR(100) NULL,
        DFid_chamado_relacionado INTEGER NULL, -- Para ações relacionadas a chamados
        DFid_atendimento_relacionado INTEGER NULL, -- Para ações relacionadas a atendimentos
        DFmetadados_extras NVARCHAR(MAX) NULL, -- JSON com dados extras
        DFobservacoes NVARCHAR(MAX) NULL,

        CONSTRAINT PK__sac_TBauditoria PRIMARY KEY (DFid_auditoria),
        CONSTRAINT CK__sac_TBauditoria__DFtipo_usuario CHECK (DFtipo_usuario IN ('A', 'C', 'S')),
        CONSTRAINT CK__sac_TBauditoria__DFresultado_acao CHECK (DFresultado_acao IN ('S', 'F'))
    );
    PRINT 'Tabela sac.TBauditoria criada com sucesso';
END
GO

-- Relacionamentos usando API
EXEC api.CRIAR_RELACAO 'sac.TBauditoria', 'DFid_chamado_relacionado', 'sac.TBchamado', 'DFid_chamado';
EXEC api.CRIAR_RELACAO 'sac.TBauditoria', 'DFid_atendimento_relacionado', 'sac.TBatendimento', 'DFid_atendimento';
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'sac.TBauditoria', 'DFdata_hora_acao';
EXEC api.CRIAR_INDICE 'sac.TBauditoria', 'DFtipo_acao';
EXEC api.CRIAR_INDICE 'sac.TBauditoria', 'DFtabela_afetada,DFid_registro_afetado';
EXEC api.CRIAR_INDICE 'sac.TBauditoria', 'DFid_usuario,DFtipo_usuario';
EXEC api.CRIAR_INDICE 'sac.TBauditoria', 'DFemail_usuario';
EXEC api.CRIAR_INDICE 'sac.TBauditoria', 'DFendereco_ip';
EXEC api.CRIAR_INDICE 'sac.TBauditoria', 'DFresultado_acao';
EXEC api.CRIAR_INDICE 'sac.TBauditoria', 'DFsessao_id';
EXEC api.CRIAR_INDICE 'sac.TBauditoria', 'DFid_chamado_relacionado';
EXEC api.CRIAR_INDICE 'sac.TBauditoria', 'DFid_atendimento_relacionado';
EXEC api.CRIAR_INDICE 'sac.TBauditoria', 'DFdata_hora_acao,DFtipo_acao';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'sac.TBauditoria', NULL, 'Registro de auditoria de todas as ações importantes do sistema';
EXEC api.CRIAR_DESCRICAO 'sac.TBauditoria', 'DFid_auditoria', 'ID único do registro de auditoria';
EXEC api.CRIAR_DESCRICAO 'sac.TBauditoria', 'DFdata_hora_acao', 'Data e hora da ação';
EXEC api.CRIAR_DESCRICAO 'sac.TBauditoria', 'DFtipo_acao', 'Tipo da ação realizada';
EXEC api.CRIAR_DESCRICAO 'sac.TBauditoria', 'DFtabela_afetada', 'Nome da tabela afetada pela ação';
EXEC api.CRIAR_DESCRICAO 'sac.TBauditoria', 'DFid_registro_afetado', 'ID do registro afetado';
EXEC api.CRIAR_DESCRICAO 'sac.TBauditoria', 'DFid_usuario', 'ID do usuário que executou a ação';
EXEC api.CRIAR_DESCRICAO 'sac.TBauditoria', 'DFtipo_usuario', 'Tipo do usuário (A=Atendente, C=Contato, S=Sistema)';
EXEC api.CRIAR_DESCRICAO 'sac.TBauditoria', 'DFnome_usuario', 'Nome do usuário que executou a ação';
EXEC api.CRIAR_DESCRICAO 'sac.TBauditoria', 'DFemail_usuario', 'Email do usuário que executou a ação';
EXEC api.CRIAR_DESCRICAO 'sac.TBauditoria', 'DFendereco_ip', 'Endereço IP de origem da ação';
EXEC api.CRIAR_DESCRICAO 'sac.TBauditoria', 'DFuser_agent', 'User agent do navegador/aplicação';
EXEC api.CRIAR_DESCRICAO 'sac.TBauditoria', 'DFurl_requisicao', 'URL da requisição que gerou a ação';
EXEC api.CRIAR_DESCRICAO 'sac.TBauditoria', 'DFmetodo_http', 'Método HTTP da requisição';
EXEC api.CRIAR_DESCRICAO 'sac.TBauditoria', 'DFvalores_anteriores', 'Valores anteriores à alteração em formato JSON';
EXEC api.CRIAR_DESCRICAO 'sac.TBauditoria', 'DFvalores_novos', 'Valores após a alteração em formato JSON';
EXEC api.CRIAR_DESCRICAO 'sac.TBauditoria', 'DFdescricao_acao', 'Descrição detalhada da ação';
EXEC api.CRIAR_DESCRICAO 'sac.TBauditoria', 'DFresultado_acao', 'Resultado da ação (S=Sucesso, F=Falha)';
EXEC api.CRIAR_DESCRICAO 'sac.TBauditoria', 'DFmensagem_erro', 'Mensagem de erro (se aplicável)';
EXEC api.CRIAR_DESCRICAO 'sac.TBauditoria', 'DFsessao_id', 'ID da sessão do usuário';
EXEC api.CRIAR_DESCRICAO 'sac.TBauditoria', 'DFid_chamado_relacionado', 'ID do chamado relacionado (se aplicável)';
EXEC api.CRIAR_DESCRICAO 'sac.TBauditoria', 'DFid_atendimento_relacionado', 'ID do atendimento relacionado (se aplicável)';
EXEC api.CRIAR_DESCRICAO 'sac.TBauditoria', 'DFmetadados_extras', 'Metadados extras em formato JSON';
EXEC api.CRIAR_DESCRICAO 'sac.TBauditoria', 'DFobservacoes', 'Observações sobre a ação';
GO

