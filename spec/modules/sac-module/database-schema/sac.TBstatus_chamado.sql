/*
TBstatus_chamado - Tabela de status/situações de chamados do sistema HelpDesk
Sistema HelpDesk - Estados possíveis para chamados
Derivada de: tom.TBsituacao_chamado (renomeada e expandida)
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'sac.TBstatus_chamado') IS NULL
BEGIN
    CREATE TABLE sac.TBstatus_chamado (
        DFid_status_chamado INTEGER IDENTITY(1,1) NOT NULL,
        DFnome_status NVARCHAR(100) NOT NULL,
        DFcodigo_status NVARCHAR(20) NOT NULL,
        DFdescricao NVARCHAR(500) NULL,
        DFcor_hexadecimal CHAR(7) NULL DEFAULT '#6c757d',
        DFicone NVARCHAR(50) NULL DEFAULT 'circle',
        DFtipo_status CHAR(1) NOT NULL DEFAULT 'A', -- A=Aberto, P=Progresso, F=Fechado, C=Cancelado
        DFpermite_reabertura BIT NOT NULL DEFAULT 1,
        DFpermite_comentario_contato BIT NOT NULL DEFAULT 1,
        DFpausa_sla BIT NOT NULL DEFAULT 0,
        DFstatus_inicial BIT NOT NULL DEFAULT 0,
        DFstatus_final BIT NOT NULL DEFAULT 0,
        DFativo BIT NOT NULL DEFAULT 1,
        DFdata_criacao DATETIME NOT NULL DEFAULT GETDATE(),
        DFdata_ultima_atualizacao DATETIME NULL,
        DFordem_exibicao INTEGER NULL DEFAULT 0,
        DFinstrucoes_uso NVARCHAR(MAX) NULL,
        DFobservacoes NVARCHAR(MAX) NULL,

        CONSTRAINT PK__sac_TBstatus_chamado PRIMARY KEY (DFid_status_chamado),
        CONSTRAINT UQ__sac_TBstatus_chamado__DFcodigo_status UNIQUE (DFcodigo_status),
        CONSTRAINT UQ__sac_TBstatus_chamado__DFnome_status UNIQUE (DFnome_status),
        CONSTRAINT CK__sac_TBstatus_chamado__DFtipo_status CHECK (DFtipo_status IN ('A', 'P', 'F', 'C')),
    );
    PRINT 'Tabela sac.TBstatus_chamado criada com sucesso';
END
GO

-- População inicial (idempotente)
IF NOT EXISTS (SELECT 1 FROM sac.TBstatus_chamado)
BEGIN
    INSERT INTO sac.TBstatus_chamado (DFnome_status, DFcodigo_status, DFdescricao, DFcor_hexadecimal, DFicone, DFtipo_status, DFstatus_inicial, DFstatus_final, DFordem_exibicao) VALUES
    ('Aberto', 'aberto', 'Chamado criado e aguardando atendimento', '#28a745', 'circle-open', 'A', 1, 0, 1),
    ('Em Atendimento', 'em_atendimento', 'Chamado sendo atendido pela equipe', '#007bff', 'progress', 'P', 0, 0, 2),
    ('Aguardando Contato', 'aguardando_contato', 'Aguardando resposta do contato', '#ffc107', 'clock', 'P', 0, 0, 3),
    ('Resolvido', 'resolvido', 'Chamado resolvido e finalizado', '#28a745', 'check-circle', 'F', 0, 1, 4),
    ('Cancelado', 'cancelado', 'Chamado cancelado', '#dc3545', 'x-circle', 'C', 0, 1, 5);
    PRINT 'Dados iniciais inseridos em sac.TBstatus_chamado';
END
GO


-- Índices usando API
EXEC api.CRIAR_INDICE 'sac.TBstatus_chamado', 'DFcodigo_status', 1; -- UNIQUE já criado via constraint
EXEC api.CRIAR_INDICE 'sac.TBstatus_chamado', 'DFnome_status', 1; -- UNIQUE já criado via constraint
EXEC api.CRIAR_INDICE 'sac.TBstatus_chamado', 'DFtipo_status';
EXEC api.CRIAR_INDICE 'sac.TBstatus_chamado', 'DFativo';
EXEC api.CRIAR_INDICE 'sac.TBstatus_chamado', 'DFordem_exibicao';
EXEC api.CRIAR_INDICE 'sac.TBstatus_chamado', 'DFstatus_inicial,DFstatus_final';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'sac.TBstatus_chamado', NULL, 'Define os status/situações possíveis para chamados no sistema';
EXEC api.CRIAR_DESCRICAO 'sac.TBstatus_chamado', 'DFid_status_chamado', 'Código único do status';
EXEC api.CRIAR_DESCRICAO 'sac.TBstatus_chamado', 'DFnome_status', 'Nome do status';
EXEC api.CRIAR_DESCRICAO 'sac.TBstatus_chamado', 'DFcodigo_status', 'Código único identificador do status';
EXEC api.CRIAR_DESCRICAO 'sac.TBstatus_chamado', 'DFdescricao', 'Descrição detalhada do status';
EXEC api.CRIAR_DESCRICAO 'sac.TBstatus_chamado', 'DFcor_hexadecimal', 'Cor em formato hexadecimal para identificação visual';
EXEC api.CRIAR_DESCRICAO 'sac.TBstatus_chamado', 'DFicone', 'Nome do ícone para exibição em interfaces';
EXEC api.CRIAR_DESCRICAO 'sac.TBstatus_chamado', 'DFtipo_status', 'Tipo do status (A=Aberto, P=Progresso, F=Fechado, C=Cancelado)';
EXEC api.CRIAR_DESCRICAO 'sac.TBstatus_chamado', 'DFpermite_reabertura', 'Permite reabrir chamado neste status (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBstatus_chamado', 'DFpermite_comentario_contato', 'Permite comentários do contato neste status (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBstatus_chamado', 'DFpausa_sla', 'Pausa contagem de SLA neste status (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBstatus_chamado', 'DFstatus_inicial', 'Indica se é status inicial para novos chamados (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBstatus_chamado', 'DFstatus_final', 'Indica se é status final (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBstatus_chamado', 'DFativo', 'Indica se o status está ativo (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBstatus_chamado', 'DFdata_criacao', 'Data e hora de criação do registro';
EXEC api.CRIAR_DESCRICAO 'sac.TBstatus_chamado', 'DFdata_ultima_atualizacao', 'Data e hora da última atualização';
EXEC api.CRIAR_DESCRICAO 'sac.TBstatus_chamado', 'DFordem_exibicao', 'Ordem de exibição em interfaces';
EXEC api.CRIAR_DESCRICAO 'sac.TBstatus_chamado', 'DFinstrucoes_uso', 'Instruções específicas para uso deste status';
EXEC api.CRIAR_DESCRICAO 'sac.TBstatus_chamado', 'DFobservacoes', 'Observações gerais sobre o status';
GO

