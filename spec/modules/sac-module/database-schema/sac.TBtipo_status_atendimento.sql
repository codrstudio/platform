/*
TBtipo_status_atendimento - Tabela de tipos de status de atendimento (padrão TomTicket)
Sistema HelpDesk - Lookup table para status de atendimentos com chave natural
Derivada de: tom.TBtipo_situacao_atendimento (renomeada e expandida)
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'sac.TBtipo_status_atendimento') IS NULL
BEGIN
    CREATE TABLE sac.TBtipo_status_atendimento (
        DFtipo_status_atendimento CHAR(1) NOT NULL,
        DFnome_status NVARCHAR(50) NOT NULL,
        DFdescricao NVARCHAR(200) NULL,
        DFcor NVARCHAR(20) NOT NULL DEFAULT 'normal',
        DFicone NVARCHAR(50) NULL DEFAULT 'circle',
        DFstatus_ativo BIT NOT NULL DEFAULT 0, -- Indica se é status ativo (em andamento)
        DFstatus_final BIT NOT NULL DEFAULT 0, -- Indica se é status final
        DFpermite_mensagens BIT NOT NULL DEFAULT 1, -- Permite envio de mensagens
        DFpeso_ordenacao INTEGER NOT NULL DEFAULT 0,
        DFativo BIT NOT NULL DEFAULT 1,
        DFdata_criacao DATETIME NOT NULL DEFAULT GETDATE(),
        DFdata_ultima_atualizacao DATETIME NULL,
        DFobservacoes NVARCHAR(MAX) NULL,

        CONSTRAINT PK__sac_TBtipo_status_atendimento PRIMARY KEY (DFtipo_status_atendimento),
        CONSTRAINT UQ__sac_TBtipo_status_atendimento__DFnome_status UNIQUE (DFnome_status),
    );
    PRINT 'Tabela sac.TBtipo_status_atendimento criada com sucesso';
END
GO


-- Relacionamentos usando API
EXEC api.CRIAR_RELACAO 'sac.TBtipo_status_atendimento', 'DFcor', 'sac.TBcor_semantica', 'DFcor';
GO

-- População inicial (idempotente)
IF NOT EXISTS (SELECT 1 FROM sac.TBtipo_status_atendimento)
BEGIN
    INSERT INTO sac.TBtipo_status_atendimento (DFtipo_status_atendimento, DFnome_status, DFdescricao, DFcor, DFicone, DFstatus_ativo, DFstatus_final, DFpermite_mensagens, DFpeso_ordenacao) VALUES
    ('A', 'Aguardando', 'Visitante aguardando atendimento na fila', 'alerta', 'clock', 0, 0, 1, 10),
    ('E', 'Em Atendimento', 'Atendimento em andamento com atendente', 'normal', 'message-circle', 1, 0, 1, 20),
    ('P', 'Pausado', 'Atendimento temporariamente pausado', 'trivial', 'pause-circle', 0, 0, 0, 15),
    ('F', 'Finalizado', 'Atendimento concluído com sucesso', 'sucesso', 'check-circle', 0, 1, 0, 30),
    ('C', 'Cancelado', 'Atendimento cancelado pelo visitante ou sistema', 'critico', 'x-circle', 0, 1, 0, 25);
    PRINT 'Dados iniciais inseridos em sac.TBtipo_status_atendimento';
END
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'sac.TBtipo_status_atendimento', 'DFtipo_status_atendimento', 1; -- PK já criado
EXEC api.CRIAR_INDICE 'sac.TBtipo_status_atendimento', 'DFnome_status', 1; -- UNIQUE já criado
EXEC api.CRIAR_INDICE 'sac.TBtipo_status_atendimento', 'DFcor';
EXEC api.CRIAR_INDICE 'sac.TBtipo_status_atendimento', 'DFstatus_ativo';
EXEC api.CRIAR_INDICE 'sac.TBtipo_status_atendimento', 'DFstatus_final';
EXEC api.CRIAR_INDICE 'sac.TBtipo_status_atendimento', 'DFpeso_ordenacao';
EXEC api.CRIAR_INDICE 'sac.TBtipo_status_atendimento', 'DFativo';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_status_atendimento', NULL, 'Define os tipos de status disponíveis para atendimentos via chat';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_status_atendimento', 'DFtipo_status_atendimento', 'Código do status (chave natural)';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_status_atendimento', 'DFnome_status', 'Nome do status';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_status_atendimento', 'DFdescricao', 'Descrição detalhada do status';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_status_atendimento', 'DFcor', 'Cor semântica do status';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_status_atendimento', 'DFicone', 'Ícone para exibição do status';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_status_atendimento', 'DFstatus_ativo', 'Indica se é status ativo/em andamento (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_status_atendimento', 'DFstatus_final', 'Indica se é status final (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_status_atendimento', 'DFpermite_mensagens', 'Permite envio de mensagens neste status (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_status_atendimento', 'DFpeso_ordenacao', 'Peso para ordenação de status';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_status_atendimento', 'DFativo', 'Indica se o status está ativo (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_status_atendimento', 'DFdata_criacao', 'Data e hora de criação do registro';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_status_atendimento', 'DFdata_ultima_atualizacao', 'Data e hora da última atualização';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_status_atendimento', 'DFobservacoes', 'Observações sobre o status';
GO

