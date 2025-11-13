/*
TBchamado - Tabela principal de chamados/tickets do sistema HelpDesk
Sistema HelpDesk - Gestão de tickets de suporte
Derivada de: tom.TBchamado (estrutura otimizada e expandida)
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'sac.TBchamado') IS NULL
BEGIN
    CREATE TABLE sac.TBchamado (
        DFid_chamado INTEGER IDENTITY(1,1) NOT NULL,
        DFprotocolo_chamado NVARCHAR(50) NULL, -- Protocolo único (formato YYYY-NNNNNN)
        DFtitulo_chamado NVARCHAR(500) NOT NULL,
        DFdescricao_inicial NVARCHAR(MAX) NOT NULL,
        DFid_contato INTEGER NOT NULL,
        DFid_cliente INTEGER NOT NULL,
        DFid_departamento INTEGER NOT NULL,
        DFid_categoria INTEGER NULL,
        DFid_status_chamado INTEGER NOT NULL,
        DFprioridade CHAR(1) NOT NULL DEFAULT 'N', -- B=Baixa, N=Normal, A=Alta, U=Urgente
        DFid_atendente_responsavel INTEGER NULL,
        DFid_atendente_criador INTEGER NULL, -- Quem criou o chamado (pode ser diferente do responsável)
        DFdata_criacao DATETIME NOT NULL DEFAULT GETDATE(),
        DFdata_ultima_atualizacao DATETIME NULL,
        DFdata_primeira_resposta DATETIME NULL,
        DFdata_resolucao DATETIME NULL,
        DFdata_fechamento DATETIME NULL,
        DFtempo_primeira_resposta_minutos INTEGER NULL,
        DFtempo_resolucao_minutos INTEGER NULL,
        DFsla_vencimento_primeira_resposta DATETIME NULL,
        DFsla_vencimento_resolucao DATETIME NULL,
        DFsla_primeira_resposta_vencido BIT NOT NULL DEFAULT 0,
        DFsla_resolucao_vencido BIT NOT NULL DEFAULT 0,
        DFobservacao_resolucao NVARCHAR(MAX) NULL,
        DForigem_chamado NVARCHAR(50) NOT NULL DEFAULT 'PORTAL', -- PORTAL, EMAIL, CHAT, API, INTERNO
        DFurl_gitlab NVARCHAR(500) NULL, -- Integração com GitLab
        DFcampos_personalizados NVARCHAR(MAX) NULL, -- JSON com campos extras
        DFobservacoes_internas NVARCHAR(MAX) NULL,

        CONSTRAINT PK__sac_TBchamado PRIMARY KEY (DFid_chamado),
        CONSTRAINT UQ__sac_TBchamado__DFprotocolo_chamado UNIQUE (DFprotocolo_chamado),
        CONSTRAINT CK__sac_TBchamado__DFprioridade CHECK (DFprioridade IN ('B', 'N', 'A', 'U')),
        CONSTRAINT CK__sac_TBchamado__DFsla_primeira_resposta_vencido CHECK (DFsla_primeira_resposta_vencido IN ('S', 'N')),
        CONSTRAINT CK__sac_TBchamado__DFsla_resolucao_vencido CHECK (DFsla_resolucao_vencido IN ('S', 'N'))
    );
    PRINT 'Tabela sac.TBchamado criada com sucesso';
END
ELSE
BEGIN
    -- Adicionar campo DFprotocolo_chamado se não existir
    IF NOT EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID(N'sac.TBchamado')
        AND name = 'DFprotocolo_chamado'
    )
    BEGIN
        ALTER TABLE sac.TBchamado ADD DFprotocolo_chamado NVARCHAR(50) NULL;
        PRINT 'Campo DFprotocolo_chamado adicionado à tabela sac.TBchamado';

        -- Criar constraint UNIQUE
        ALTER TABLE sac.TBchamado ADD CONSTRAINT UQ__sac_TBchamado__DFprotocolo_chamado UNIQUE (DFprotocolo_chamado);
        PRINT 'Constraint UNIQUE criada para DFprotocolo_chamado';
    END
END
GO

-- Relacionamentos usando API
EXEC api.CRIAR_RELACAO 'sac.TBchamado', 'DFid_contato', 'sac.TBcontato', 'DFid_contato';
EXEC api.CRIAR_RELACAO 'sac.TBchamado', 'DFid_cliente', 'sac.TBcliente', 'DFid_cliente';
EXEC api.CRIAR_RELACAO 'sac.TBchamado', 'DFid_departamento', 'sac.TBdepartamento', 'DFid_departamento';
EXEC api.CRIAR_RELACAO 'sac.TBchamado', 'DFid_categoria', 'sac.TBcategoria', 'DFid_categoria';
EXEC api.CRIAR_RELACAO 'sac.TBchamado', 'DFid_status_chamado', 'sac.TBstatus_chamado', 'DFid_status_chamado';
EXEC api.CRIAR_RELACAO 'sac.TBchamado', 'DFid_atendente_responsavel', 'sac.TBatendente', 'DFid_atendente';
EXEC api.CRIAR_RELACAO 'sac.TBchamado', 'DFid_atendente_criador', 'sac.TBatendente', 'DFid_atendente';
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'sac.TBchamado', 'DFprotocolo_chamado', 1; -- UNIQUE já criado via constraint
EXEC api.CRIAR_INDICE 'sac.TBchamado', 'DFid_contato';
EXEC api.CRIAR_INDICE 'sac.TBchamado', 'DFid_cliente';
EXEC api.CRIAR_INDICE 'sac.TBchamado', 'DFid_departamento';
EXEC api.CRIAR_INDICE 'sac.TBchamado', 'DFid_categoria';
EXEC api.CRIAR_INDICE 'sac.TBchamado', 'DFid_status_chamado';
EXEC api.CRIAR_INDICE 'sac.TBchamado', 'DFid_atendente_responsavel';
EXEC api.CRIAR_INDICE 'sac.TBchamado', 'DFprioridade';
EXEC api.CRIAR_INDICE 'sac.TBchamado', 'DFdata_criacao';
EXEC api.CRIAR_INDICE 'sac.TBchamado', 'DFdata_ultima_atualizacao';
EXEC api.CRIAR_INDICE 'sac.TBchamado', 'DFsla_vencimento_primeira_resposta';
EXEC api.CRIAR_INDICE 'sac.TBchamado', 'DFsla_vencimento_resolucao';
EXEC api.CRIAR_INDICE 'sac.TBchamado', 'DForigem_chamado';
EXEC api.CRIAR_INDICE 'sac.TBchamado', 'DFdata_criacao,DFid_status_chamado';
EXEC api.CRIAR_INDICE 'sac.TBchamado', 'DFid_atendente_responsavel,DFid_status_chamado';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado', NULL, 'Define os chamados/tickets principais do sistema de helpdesk';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado', 'DFid_chamado', 'Código único do ticket/chamado';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado', 'DFprotocolo_chamado', 'Protocolo único do chamado em formato YYYY-NNNNNN';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado', 'DFtitulo_chamado', 'Título/assunto do chamado';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado', 'DFdescricao_inicial', 'Descrição inicial/detalhada do problema';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado', 'DFid_contato', 'Contato que criou o chamado';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado', 'DFid_cliente', 'Cliente ao qual o chamado pertence';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado', 'DFid_departamento', 'Departamento responsável pelo atendimento';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado', 'DFid_categoria', 'Categoria/tipo de assunto do chamado';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado', 'DFid_status_chamado', 'Status atual do chamado';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado', 'DFprioridade', 'Prioridade do chamado (B=Baixa, N=Normal, A=Alta, U=Urgente)';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado', 'DFid_atendente_responsavel', 'Atendente responsável pelo chamado';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado', 'DFid_atendente_criador', 'Atendente que criou o chamado (se criado internamente)';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado', 'DFdata_criacao', 'Data e hora de criação do chamado';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado', 'DFdata_ultima_atualizacao', 'Data e hora da última atualização';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado', 'DFdata_primeira_resposta', 'Data e hora da primeira resposta';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado', 'DFdata_resolucao', 'Data e hora da resolução';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado', 'DFdata_fechamento', 'Data e hora do fechamento definitivo';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado', 'DFtempo_primeira_resposta_minutos', 'Tempo até primeira resposta em minutos';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado', 'DFtempo_resolucao_minutos', 'Tempo total de resolução em minutos';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado', 'DFsla_vencimento_primeira_resposta', 'Data/hora limite para primeira resposta (SLA)';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado', 'DFsla_vencimento_resolucao', 'Data/hora limite para resolução (SLA)';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado', 'DFsla_primeira_resposta_vencido', 'Indica se SLA de primeira resposta foi vencido (S=Sim, N=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado', 'DFsla_resolucao_vencido', 'Indica se SLA de resolução foi vencido (S=Sim, N=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado', 'DFobservacao_resolucao', 'Observações sobre a resolução do chamado';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado', 'DForigem_chamado', 'Origem do chamado (PORTAL, EMAIL, CHAT, API, INTERNO)';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado', 'DFurl_gitlab', 'URL da issue relacionada no GitLab';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado', 'DFcampos_personalizados', 'Campos extras específicos em formato JSON';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado', 'DFobservacoes_internas', 'Observações internas visíveis apenas para atendentes';
GO
