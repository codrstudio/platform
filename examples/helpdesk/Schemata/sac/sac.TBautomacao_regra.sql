/*
TBautomacao_regra - Tabela de regras de automação
Sistema HelpDesk - Define regras para automações (auto-assignment, escalação, triggers)
Nova tabela: Não existia no tom (necessária para requisitos de automação)
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'sac.TBautomacao_regra') IS NULL
BEGIN
    CREATE TABLE sac.TBautomacao_regra (
        DFid_automacao_regra INTEGER IDENTITY(1,1) NOT NULL,
        DFnome_regra NVARCHAR(255) NOT NULL,
        DFdescricao NVARCHAR(500) NULL,
        DFtipo_regra CHAR(1) NOT NULL, -- A=Auto-assignment, E=Escalação, T=Trigger, N=Notificação
        DFevento_trigger NVARCHAR(100) NOT NULL, -- CRIAR_CHAMADO, ALTERAR_STATUS, VENCER_SLA, etc.
        DFcondicoes_json NVARCHAR(MAX) NOT NULL, -- JSON com condições da regra
        DFacoes_json NVARCHAR(MAX) NOT NULL, -- JSON com ações a executar
        DFprioridade_execucao INTEGER NOT NULL DEFAULT 0, -- Ordem de execução
        DFativo BIT NOT NULL DEFAULT 1,
        DFdata_criacao DATETIME NOT NULL DEFAULT GETDATE(),
        DFdata_ultima_atualizacao DATETIME NULL,
        DFdata_ultima_execucao DATETIME NULL,
        DFcontador_execucoes INTEGER NOT NULL DEFAULT 0,
        DFcontador_sucessos INTEGER NOT NULL DEFAULT 0,
        DFcontador_falhas INTEGER NOT NULL DEFAULT 0,
        DFlog_ultima_execucao NVARCHAR(MAX) NULL,
        DFobservacoes NVARCHAR(MAX) NULL,

        CONSTRAINT PK__sac_TBautomacao_regra PRIMARY KEY (DFid_automacao_regra),
        CONSTRAINT UQ__sac_TBautomacao_regra__DFnome_regra UNIQUE (DFnome_regra),
        CONSTRAINT CK__sac_TBautomacao_regra__DFtipo_regra CHECK (DFtipo_regra IN ('A', 'E', 'T', 'N'))
    );
    PRINT 'Tabela sac.TBautomacao_regra criada com sucesso';
END
GO


-- Índices usando API
EXEC api.CRIAR_INDICE 'sac.TBautomacao_regra', 'DFnome_regra', 1; -- UNIQUE já criado via constraint
EXEC api.CRIAR_INDICE 'sac.TBautomacao_regra', 'DFtipo_regra';
EXEC api.CRIAR_INDICE 'sac.TBautomacao_regra', 'DFevento_trigger';
EXEC api.CRIAR_INDICE 'sac.TBautomacao_regra', 'DFativo';
EXEC api.CRIAR_INDICE 'sac.TBautomacao_regra', 'DFprioridade_execucao';
EXEC api.CRIAR_INDICE 'sac.TBautomacao_regra', 'DFdata_ultima_execucao';
EXEC api.CRIAR_INDICE 'sac.TBautomacao_regra', 'DFtipo_regra,DFevento_trigger,DFativo';
GO

-- População inicial (idempotente) - Regras básicas
IF NOT EXISTS (SELECT 1 FROM sac.TBautomacao_regra)
BEGIN
    INSERT INTO sac.TBautomacao_regra (DFnome_regra, DFdescricao, DFtipo_regra, DFevento_trigger, DFcondicoes_json, DFacoes_json, DFprioridade_execucao) VALUES
    ('Auto-assignment Round Robin', 'Distribui chamados automaticamente entre atendentes disponíveis', 'A', 'CRIAR_CHAMADO', '{"departamento": "*", "prioridade": "*"}', '{"acao": "atribuir_round_robin", "filtro_atendentes": {"ativo": "S", "disponivel": "S"}}', 10),
    ('Escalação SLA Vencido', 'Escala chamados com SLA vencido para supervisor', 'E', 'VENCER_SLA', '{"sla_tipo": "resolucao"}', '{"acao": "escalar_supervisor", "alterar_prioridade": "A", "notificar": "S"}', 20),
    ('Notificação Nova Atribuição', 'Notifica atendente sobre nova atribuição', 'N', 'ATRIBUIR_CHAMADO', '{}', '{"acao": "enviar_email", "template": "nova_atribuicao"}', 5);
    PRINT 'Dados iniciais inseridos em sac.TBautomacao_regra';
END
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'sac.TBautomacao_regra', NULL, 'Define as regras de automação do sistema (auto-assignment, escalação, triggers)';
EXEC api.CRIAR_DESCRICAO 'sac.TBautomacao_regra', 'DFid_automacao_regra', 'ID único da regra de automação';
EXEC api.CRIAR_DESCRICAO 'sac.TBautomacao_regra', 'DFnome_regra', 'Nome da regra de automação';
EXEC api.CRIAR_DESCRICAO 'sac.TBautomacao_regra', 'DFdescricao', 'Descrição da regra de automação';
EXEC api.CRIAR_DESCRICAO 'sac.TBautomacao_regra', 'DFtipo_regra', 'Tipo da regra (A=Auto-assignment, E=Escalação, T=Trigger, N=Notificação)';
EXEC api.CRIAR_DESCRICAO 'sac.TBautomacao_regra', 'DFevento_trigger', 'Evento que dispara a regra';
EXEC api.CRIAR_DESCRICAO 'sac.TBautomacao_regra', 'DFcondicoes_json', 'Condições para execução da regra em formato JSON';
EXEC api.CRIAR_DESCRICAO 'sac.TBautomacao_regra', 'DFacoes_json', 'Ações a serem executadas em formato JSON';
EXEC api.CRIAR_DESCRICAO 'sac.TBautomacao_regra', 'DFprioridade_execucao', 'Prioridade de execução (maior número = maior prioridade)';
EXEC api.CRIAR_DESCRICAO 'sac.TBautomacao_regra', 'DFativo', 'Indica se a regra está ativa (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBautomacao_regra', 'DFdata_criacao', 'Data e hora de criação do registro';
EXEC api.CRIAR_DESCRICAO 'sac.TBautomacao_regra', 'DFdata_ultima_atualizacao', 'Data e hora da última atualização';
EXEC api.CRIAR_DESCRICAO 'sac.TBautomacao_regra', 'DFdata_ultima_execucao', 'Data e hora da última execução';
EXEC api.CRIAR_DESCRICAO 'sac.TBautomacao_regra', 'DFcontador_execucoes', 'Contador total de execuções';
EXEC api.CRIAR_DESCRICAO 'sac.TBautomacao_regra', 'DFcontador_sucessos', 'Contador de execuções bem-sucedidas';
EXEC api.CRIAR_DESCRICAO 'sac.TBautomacao_regra', 'DFcontador_falhas', 'Contador de execuções com falha';
EXEC api.CRIAR_DESCRICAO 'sac.TBautomacao_regra', 'DFlog_ultima_execucao', 'Log da última execução';
EXEC api.CRIAR_DESCRICAO 'sac.TBautomacao_regra', 'DFobservacoes', 'Observações sobre a regra';
GO

