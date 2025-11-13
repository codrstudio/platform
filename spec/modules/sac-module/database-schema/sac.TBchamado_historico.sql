/*
TBchamado_historico - Tabela de histórico e mensagens dos chamados
Sistema HelpDesk - Registro completo de interações nos chamados
Derivada de: tom.TBchamado_historico (estrutura expandida)
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'sac.TBchamado_historico') IS NULL
BEGIN
    CREATE TABLE sac.TBchamado_historico (
        DFid_historico INTEGER IDENTITY(1,1) NOT NULL,
        DFid_chamado INTEGER NOT NULL,
        DFconteudo_mensagem NVARCHAR(MAX) NOT NULL,
        DFdata_hora_mensagem DATETIME NOT NULL DEFAULT GETDATE(),
        DFtipo_mensagem CHAR(1) NOT NULL DEFAULT 'M', -- M=Mensagem, S=Sistema, A=Alteração
        DFvisibilidade CHAR(1) NOT NULL DEFAULT 'P', -- P=Público, I=Interno
        DFid_contato INTEGER NULL, -- Quem enviou (se for contato)
        DFid_atendente INTEGER NULL, -- Quem enviou (se for atendente)
        DFid_usuario_alteracao INTEGER NULL, -- Usuário que fez a alteração
        DFid_status_chamado_anterior INTEGER NULL, -- Status anterior (para mudanças)
        DFid_status_chamado_novo INTEGER NULL, -- Novo status (para mudanças)
        DFprioridade_anterior CHAR(1) NULL, -- Prioridade anterior
        DFprioridade_nova CHAR(1) NULL, -- Nova prioridade
        DFid_atendente_anterior INTEGER NULL, -- Atendente anterior
        DFid_atendente_novo INTEGER NULL, -- Novo atendente
        DFtipo_mime NVARCHAR(100) NULL DEFAULT 'text/html',
        DFendereco_ip NVARCHAR(45) NULL,
        DFuser_agent NVARCHAR(500) NULL,
        DFcanal_origem NVARCHAR(50) NULL DEFAULT 'WEB', -- WEB, EMAIL, API, CHAT
        DFobservacoes NVARCHAR(MAX) NULL,

        CONSTRAINT PK__sac_TBchamado_historico PRIMARY KEY (DFid_historico),
        CONSTRAINT CK__sac_TBchamado_historico__DFtipo_mensagem CHECK (DFtipo_mensagem IN ('M', 'S', 'A')),
        CONSTRAINT CK__sac_TBchamado_historico__DFvisibilidade CHECK (DFvisibilidade IN ('P', 'I')),
        CONSTRAINT CK__sac_TBchamado_historico__DFprioridade_anterior CHECK (DFprioridade_anterior IN ('B', 'N', 'A', 'U')),
        CONSTRAINT CK__sac_TBchamado_historico__DFprioridade_nova CHECK (DFprioridade_nova IN ('B', 'N', 'A', 'U'))
    );
    PRINT 'Tabela sac.TBchamado_historico criada com sucesso';
END
GO

-- Evolução: Adição de novo campo (idempotente)
IF COL_LENGTH('sac.TBchamado_historico', 'DFid_usuario_alteracao') IS NULL
BEGIN
    ALTER TABLE sac.TBchamado_historico ADD DFid_usuario_alteracao INTEGER NULL;
    PRINT 'Campo DFid_usuario_alteracao adicionado à tabela sac.TBchamado_historico';
END
GO

-- Relacionamentos usando API
EXEC api.CRIAR_RELACAO 'sac.TBchamado_historico', 'DFid_chamado', 'sac.TBchamado', 'DFid_chamado';
EXEC api.CRIAR_RELACAO 'sac.TBchamado_historico', 'DFid_contato', 'sac.TBcontato', 'DFid_contato';
EXEC api.CRIAR_RELACAO 'sac.TBchamado_historico', 'DFid_atendente', 'sac.TBatendente', 'DFid_atendente';
EXEC api.CRIAR_RELACAO 'sac.TBchamado_historico', 'DFid_usuario_alteracao', 'sac.TBusuario', 'DFid_usuario';
EXEC api.CRIAR_RELACAO 'sac.TBchamado_historico', 'DFid_status_chamado_anterior', 'sac.TBstatus_chamado', 'DFid_status_chamado';
EXEC api.CRIAR_RELACAO 'sac.TBchamado_historico', 'DFid_status_chamado_novo', 'sac.TBstatus_chamado', 'DFid_status_chamado';
EXEC api.CRIAR_RELACAO 'sac.TBchamado_historico', 'DFid_atendente_anterior', 'sac.TBatendente', 'DFid_atendente';
EXEC api.CRIAR_RELACAO 'sac.TBchamado_historico', 'DFid_atendente_novo', 'sac.TBatendente', 'DFid_atendente';
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'sac.TBchamado_historico', 'DFid_chamado';
EXEC api.CRIAR_INDICE 'sac.TBchamado_historico', 'DFdata_hora_mensagem';
EXEC api.CRIAR_INDICE 'sac.TBchamado_historico', 'DFtipo_mensagem';
EXEC api.CRIAR_INDICE 'sac.TBchamado_historico', 'DFvisibilidade';
EXEC api.CRIAR_INDICE 'sac.TBchamado_historico', 'DFid_contato';
EXEC api.CRIAR_INDICE 'sac.TBchamado_historico', 'DFid_atendente';
EXEC api.CRIAR_INDICE 'sac.TBchamado_historico', 'DFid_usuario_alteracao';
EXEC api.CRIAR_INDICE 'sac.TBchamado_historico', 'DFcanal_origem';
EXEC api.CRIAR_INDICE 'sac.TBchamado_historico', 'DFid_chamado,DFdata_hora_mensagem';
EXEC api.CRIAR_INDICE 'sac.TBchamado_historico', 'DFid_chamado,DFvisibilidade';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_historico', NULL, 'Histórico completo de mensagens e alterações dos chamados';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_historico', 'DFid_historico', 'ID único do registro de histórico';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_historico', 'DFid_chamado', 'ID do chamado ao qual o histórico pertence';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_historico', 'DFconteudo_mensagem', 'Conteúdo da mensagem ou descrição da alteração';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_historico', 'DFdata_hora_mensagem', 'Data e hora da mensagem/alteração';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_historico', 'DFtipo_mensagem', 'Tipo da entrada (M=Mensagem, S=Sistema, A=Alteração)';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_historico', 'DFvisibilidade', 'Visibilidade da mensagem (P=Público, I=Interno)';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_historico', 'DFid_contato', 'ID do contato que enviou a mensagem';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_historico', 'DFid_atendente', 'ID do atendente que enviou a mensagem';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_historico', 'DFid_usuario_alteracao', 'ID do usuário que realizou a alteração';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_historico', 'DFid_status_chamado_anterior', 'Status anterior (para registros de alteração)';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_historico', 'DFid_status_chamado_novo', 'Novo status (para registros de alteração)';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_historico', 'DFprioridade_anterior', 'Prioridade anterior (para registros de alteração)';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_historico', 'DFprioridade_nova', 'Nova prioridade (para registros de alteração)';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_historico', 'DFid_atendente_anterior', 'Atendente anterior (para registros de alteração)';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_historico', 'DFid_atendente_novo', 'Novo atendente (para registros de alteração)';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_historico', 'DFtipo_mime', 'Tipo MIME do conteúdo da mensagem';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_historico', 'DFendereco_ip', 'Endereço IP de origem da mensagem';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_historico', 'DFuser_agent', 'User agent do navegador/aplicação';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_historico', 'DFcanal_origem', 'Canal de origem da mensagem (WEB, EMAIL, API, CHAT)';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_historico', 'DFobservacoes', 'Observações adicionais sobre a entrada';
GO

