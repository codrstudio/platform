/*
TBnotificacao - Tabela de notificações do sistema
Sistema HelpDesk - Gestão de notificações para atendentes e contatos
Nova tabela: Não existia no tom (necessária para requisitos de notificação)
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'sac.TBnotificacao') IS NULL
BEGIN
    CREATE TABLE sac.TBnotificacao (
        DFid_notificacao INTEGER IDENTITY(1,1) NOT NULL,
        DFtitulo_notificacao NVARCHAR(255) NOT NULL,
        DFconteudo_notificacao NVARCHAR(MAX) NOT NULL,
        DFtipo_notificacao CHAR(1) NOT NULL, -- I=Info, A=Alerta, E=Erro, S=Sucesso
        DFcanal_notificacao CHAR(1) NOT NULL, -- S=Sistema, E=Email, P=Push, W=WhatsApp
        DFid_destinatario INTEGER NOT NULL,
        DFtipo_destinatario CHAR(1) NOT NULL, -- A=Atendente, C=Contato
        DFid_remetente INTEGER NULL, -- Usuário que originou a notificação
        DFid_chamado INTEGER NULL, -- Notificação relacionada a chamado específico
        DFid_atendimento INTEGER NULL, -- Notificação relacionada a atendimento específico
        DFstatus_notificacao CHAR(1) NOT NULL DEFAULT 'P', -- P=Pendente, E=Enviada, L=Lida, F=Falhou
        DFdata_criacao DATETIME NOT NULL DEFAULT GETDATE(),
        DFdata_envio DATETIME NULL,
        DFdata_leitura DATETIME NULL,
        DFdata_expiracao DATETIME NULL,
        DFprioridade CHAR(1) NOT NULL DEFAULT 'N', -- B=Baixa, N=Normal, A=Alta, U=Urgente
        DFurl_acao NVARCHAR(500) NULL, -- URL para ação relacionada
        DFmetadados_json NVARCHAR(MAX) NULL, -- Metadados extras em JSON
        DFtentativas_envio INTEGER NOT NULL DEFAULT 0,
        DFlog_envio NVARCHAR(MAX) NULL,
        DFobservacoes NVARCHAR(MAX) NULL,

        CONSTRAINT PK__sac_TBnotificacao PRIMARY KEY (DFid_notificacao),
        CONSTRAINT CK__sac_TBnotificacao__DFtipo_notificacao CHECK (DFtipo_notificacao IN ('I', 'A', 'E', 'S')),
        CONSTRAINT CK__sac_TBnotificacao__DFcanal_notificacao CHECK (DFcanal_notificacao IN ('S', 'E', 'P', 'W')),
        CONSTRAINT CK__sac_TBnotificacao__DFtipo_destinatario CHECK (DFtipo_destinatario IN ('A', 'C')),
        CONSTRAINT CK__sac_TBnotificacao__DFstatus_notificacao CHECK (DFstatus_notificacao IN ('P', 'E', 'L', 'F')),
        CONSTRAINT CK__sac_TBnotificacao__DFprioridade CHECK (DFprioridade IN ('B', 'N', 'A', 'U'))
    );
    PRINT 'Tabela sac.TBnotificacao criada com sucesso';
END
GO

-- Evolução: Adição de novo campo (idempotente)
IF COL_LENGTH('sac.TBnotificacao', 'DFid_remetente') IS NULL
BEGIN
    ALTER TABLE sac.TBnotificacao ADD DFid_remetente INTEGER NULL;
    PRINT 'Campo DFid_remetente adicionado à tabela sac.TBnotificacao';
END
GO

-- Relacionamentos usando API
EXEC api.CRIAR_RELACAO 'sac.TBnotificacao', 'DFid_remetente', 'sac.TBusuario', 'DFid_usuario';
EXEC api.CRIAR_RELACAO 'sac.TBnotificacao', 'DFid_chamado', 'sac.TBchamado', 'DFid_chamado';
EXEC api.CRIAR_RELACAO 'sac.TBnotificacao', 'DFid_atendimento', 'sac.TBatendimento', 'DFid_atendimento';
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'sac.TBnotificacao', 'DFid_destinatario,DFtipo_destinatario';
EXEC api.CRIAR_INDICE 'sac.TBnotificacao', 'DFid_remetente';
EXEC api.CRIAR_INDICE 'sac.TBnotificacao', 'DFstatus_notificacao';
EXEC api.CRIAR_INDICE 'sac.TBnotificacao', 'DFdata_criacao';
EXEC api.CRIAR_INDICE 'sac.TBnotificacao', 'DFdata_envio';
EXEC api.CRIAR_INDICE 'sac.TBnotificacao', 'DFdata_expiracao';
EXEC api.CRIAR_INDICE 'sac.TBnotificacao', 'DFprioridade';
EXEC api.CRIAR_INDICE 'sac.TBnotificacao', 'DFcanal_notificacao';
EXEC api.CRIAR_INDICE 'sac.TBnotificacao', 'DFid_chamado';
EXEC api.CRIAR_INDICE 'sac.TBnotificacao', 'DFid_atendimento';
EXEC api.CRIAR_INDICE 'sac.TBnotificacao', 'DFstatus_notificacao,DFdata_criacao';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'sac.TBnotificacao', NULL, 'Define as notificações do sistema para atendentes e contatos';
EXEC api.CRIAR_DESCRICAO 'sac.TBnotificacao', 'DFid_notificacao', 'ID único da notificação';
EXEC api.CRIAR_DESCRICAO 'sac.TBnotificacao', 'DFtitulo_notificacao', 'Título da notificação';
EXEC api.CRIAR_DESCRICAO 'sac.TBnotificacao', 'DFconteudo_notificacao', 'Conteúdo da notificação';
EXEC api.CRIAR_DESCRICAO 'sac.TBnotificacao', 'DFtipo_notificacao', 'Tipo da notificação (I=Info, A=Alerta, E=Erro, S=Sucesso)';
EXEC api.CRIAR_DESCRICAO 'sac.TBnotificacao', 'DFcanal_notificacao', 'Canal de envio (S=Sistema, E=Email, P=Push, W=WhatsApp)';
EXEC api.CRIAR_DESCRICAO 'sac.TBnotificacao', 'DFid_destinatario', 'ID do destinatário';
EXEC api.CRIAR_DESCRICAO 'sac.TBnotificacao', 'DFtipo_destinatario', 'Tipo do destinatário (A=Atendente, C=Contato)';
EXEC api.CRIAR_DESCRICAO 'sac.TBnotificacao', 'DFid_remetente', 'ID do usuário que originou a notificação';
EXEC api.CRIAR_DESCRICAO 'sac.TBnotificacao', 'DFid_chamado', 'ID do chamado relacionado (se aplicável)';
EXEC api.CRIAR_DESCRICAO 'sac.TBnotificacao', 'DFid_atendimento', 'ID do atendimento relacionado (se aplicável)';
EXEC api.CRIAR_DESCRICAO 'sac.TBnotificacao', 'DFstatus_notificacao', 'Status da notificação (P=Pendente, E=Enviada, L=Lida, F=Falhou)';
EXEC api.CRIAR_DESCRICAO 'sac.TBnotificacao', 'DFdata_criacao', 'Data e hora de criação da notificação';
EXEC api.CRIAR_DESCRICAO 'sac.TBnotificacao', 'DFdata_envio', 'Data e hora de envio';
EXEC api.CRIAR_DESCRICAO 'sac.TBnotificacao', 'DFdata_leitura', 'Data e hora de leitura';
EXEC api.CRIAR_DESCRICAO 'sac.TBnotificacao', 'DFdata_expiracao', 'Data e hora de expiração';
EXEC api.CRIAR_DESCRICAO 'sac.TBnotificacao', 'DFprioridade', 'Prioridade da notificação (B=Baixa, N=Normal, A=Alta, U=Urgente)';
EXEC api.CRIAR_DESCRICAO 'sac.TBnotificacao', 'DFurl_acao', 'URL para ação relacionada à notificação';
EXEC api.CRIAR_DESCRICAO 'sac.TBnotificacao', 'DFmetadados_json', 'Metadados extras em formato JSON';
EXEC api.CRIAR_DESCRICAO 'sac.TBnotificacao', 'DFtentativas_envio', 'Número de tentativas de envio';
EXEC api.CRIAR_DESCRICAO 'sac.TBnotificacao', 'DFlog_envio', 'Log das tentativas de envio';
EXEC api.CRIAR_DESCRICAO 'sac.TBnotificacao', 'DFobservacoes', 'Observações sobre a notificação';
GO

