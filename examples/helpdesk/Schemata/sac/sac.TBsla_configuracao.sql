/*
TBsla_configuracao - Tabela de configurações de SLA
Sistema HelpDesk - Define acordos de nível de serviço por cliente, categoria e prioridade
Nova tabela: Não existia no tom (necessária para requisitos de SLA)
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'sac.TBsla_configuracao') IS NULL
BEGIN
    CREATE TABLE sac.TBsla_configuracao (
        DFid_sla_configuracao INTEGER IDENTITY(1,1) NOT NULL,
        DFnome_sla NVARCHAR(255) NOT NULL,
        DFdescricao NVARCHAR(500) NULL,
        DFid_cliente INTEGER NULL, -- SLA específico para cliente (NULL = geral)
        DFid_categoria INTEGER NULL, -- SLA específico para categoria (NULL = geral)
        DFprioridade CHAR(1) NULL, -- SLA específico para prioridade (NULL = geral)
        DFhoras_primeira_resposta INTEGER NOT NULL DEFAULT 4,
        DFhoras_resolucao INTEGER NOT NULL DEFAULT 24,
        DFpercentual_alerta_primeira_resposta INTEGER NOT NULL DEFAULT 80, -- % para alerta
        DFpercentual_alerta_resolucao INTEGER NOT NULL DEFAULT 80,
        DFhorario_comercial_inicio TIME NOT NULL DEFAULT '08:00:00',
        DFhorario_comercial_fim TIME NOT NULL DEFAULT '18:00:00',
        DFdias_uteis_semana NVARCHAR(20) NOT NULL DEFAULT '1,2,3,4,5', -- 1=Segunda, 7=Domingo
        DFconsidera_feriados BIT NOT NULL DEFAULT 1,
        DFativo BIT NOT NULL DEFAULT 1,
        DFdata_criacao DATETIME NOT NULL DEFAULT GETDATE(),
        DFdata_ultima_atualizacao DATETIME NULL,
        DFprioridade_aplicacao INTEGER NOT NULL DEFAULT 0, -- Ordem de aplicação (maior = mais específico)
        DFobservacoes NVARCHAR(MAX) NULL,

        CONSTRAINT PK__sac_TBsla_configuracao PRIMARY KEY (DFid_sla_configuracao),
        CONSTRAINT UQ__sac_TBsla_configuracao__DFnome_sla UNIQUE (DFnome_sla),
        CONSTRAINT CK__sac_TBsla_configuracao__DFprioridade CHECK (DFprioridade IN ('B', 'N', 'A', 'U')),
    );
    PRINT 'Tabela sac.TBsla_configuracao criada com sucesso';
END
GO


-- Relacionamentos usando API
EXEC api.CRIAR_RELACAO 'sac.TBsla_configuracao', 'DFid_cliente', 'sac.TBcliente', 'DFid_cliente';
EXEC api.CRIAR_RELACAO 'sac.TBsla_configuracao', 'DFid_categoria', 'sac.TBcategoria', 'DFid_categoria';
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'sac.TBsla_configuracao', 'DFnome_sla', 1; -- UNIQUE já criado via constraint
EXEC api.CRIAR_INDICE 'sac.TBsla_configuracao', 'DFid_cliente';
EXEC api.CRIAR_INDICE 'sac.TBsla_configuracao', 'DFid_categoria';
EXEC api.CRIAR_INDICE 'sac.TBsla_configuracao', 'DFprioridade';
EXEC api.CRIAR_INDICE 'sac.TBsla_configuracao', 'DFativo';
EXEC api.CRIAR_INDICE 'sac.TBsla_configuracao', 'DFprioridade_aplicacao';
EXEC api.CRIAR_INDICE 'sac.TBsla_configuracao', 'DFid_cliente,DFid_categoria,DFprioridade';
GO

-- População inicial (idempotente)
IF NOT EXISTS (SELECT 1 FROM sac.TBsla_configuracao)
BEGIN
    INSERT INTO sac.TBsla_configuracao (DFnome_sla, DFdescricao, DFprioridade, DFhoras_primeira_resposta, DFhoras_resolucao, DFprioridade_aplicacao) VALUES
    ('SLA Padrão - Urgente', 'SLA padrão para chamados urgentes', 'U', 1, 4, 10),
    ('SLA Padrão - Alta', 'SLA padrão para chamados de alta prioridade', 'A', 2, 8, 9),
    ('SLA Padrão - Normal', 'SLA padrão para chamados normais', 'N', 4, 24, 8),
    ('SLA Padrão - Baixa', 'SLA padrão para chamados de baixa prioridade', 'B', 8, 72, 7),
    ('SLA Geral', 'SLA geral para todos os chamados sem configuração específica', NULL, 4, 24, 1);
    PRINT 'Dados iniciais inseridos em sac.TBsla_configuracao';
END
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'sac.TBsla_configuracao', NULL, 'Define as configurações de SLA (Acordo de Nível de Serviço) do sistema';
EXEC api.CRIAR_DESCRICAO 'sac.TBsla_configuracao', 'DFid_sla_configuracao', 'ID único da configuração de SLA';
EXEC api.CRIAR_DESCRICAO 'sac.TBsla_configuracao', 'DFnome_sla', 'Nome da configuração de SLA';
EXEC api.CRIAR_DESCRICAO 'sac.TBsla_configuracao', 'DFdescricao', 'Descrição da configuração de SLA';
EXEC api.CRIAR_DESCRICAO 'sac.TBsla_configuracao', 'DFid_cliente', 'Cliente específico (NULL = aplicável a todos)';
EXEC api.CRIAR_DESCRICAO 'sac.TBsla_configuracao', 'DFid_categoria', 'Categoria específica (NULL = aplicável a todas)';
EXEC api.CRIAR_DESCRICAO 'sac.TBsla_configuracao', 'DFprioridade', 'Prioridade específica (NULL = aplicável a todas)';
EXEC api.CRIAR_DESCRICAO 'sac.TBsla_configuracao', 'DFhoras_primeira_resposta', 'Tempo limite para primeira resposta em horas';
EXEC api.CRIAR_DESCRICAO 'sac.TBsla_configuracao', 'DFhoras_resolucao', 'Tempo limite para resolução em horas';
EXEC api.CRIAR_DESCRICAO 'sac.TBsla_configuracao', 'DFpercentual_alerta_primeira_resposta', 'Percentual do tempo para envio de alerta de primeira resposta';
EXEC api.CRIAR_DESCRICAO 'sac.TBsla_configuracao', 'DFpercentual_alerta_resolucao', 'Percentual do tempo para envio de alerta de resolução';
EXEC api.CRIAR_DESCRICAO 'sac.TBsla_configuracao', 'DFhorario_comercial_inicio', 'Horário de início do expediente comercial';
EXEC api.CRIAR_DESCRICAO 'sac.TBsla_configuracao', 'DFhorario_comercial_fim', 'Horário de fim do expediente comercial';
EXEC api.CRIAR_DESCRICAO 'sac.TBsla_configuracao', 'DFdias_uteis_semana', 'Dias úteis da semana (1=Segunda, 7=Domingo)';
EXEC api.CRIAR_DESCRICAO 'sac.TBsla_configuracao', 'DFconsidera_feriados', 'Considera feriados no cálculo (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBsla_configuracao', 'DFativo', 'Indica se a configuração está ativa (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBsla_configuracao', 'DFdata_criacao', 'Data e hora de criação do registro';
EXEC api.CRIAR_DESCRICAO 'sac.TBsla_configuracao', 'DFdata_ultima_atualizacao', 'Data e hora da última atualização';
EXEC api.CRIAR_DESCRICAO 'sac.TBsla_configuracao', 'DFprioridade_aplicacao', 'Prioridade de aplicação (maior número = mais específico)';
EXEC api.CRIAR_DESCRICAO 'sac.TBsla_configuracao', 'DFobservacoes', 'Observações sobre a configuração de SLA';
GO

