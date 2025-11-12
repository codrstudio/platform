/*
TBchamado - Tabela principal de chamados/tickets
Sistema TomTicket HelpDesk - Gestão de tickets de suporte
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'tom.TBchamado') IS NULL
BEGIN
    CREATE TABLE tom.TBchamado (
        DFid_chamado INTEGER NOT NULL,
        DFnumero_protocolo INTEGER NULL,
        DFid_departamento INTEGER NOT NULL,
        DFid_categoria INTEGER NULL,
        DFtitulo_chamado NVARCHAR(500) NOT NULL,
        DFmensagem_inicial NVARCHAR(MAX) NOT NULL,
        DFdata_criacao DATETIME NOT NULL,
        DFdata_ultima_atualizacao DATETIME NULL,
        DFid_situacao_chamado INTEGER NOT NULL,
        DFprioridade CHAR(1) NULL DEFAULT 'N',
        DFid_contato INTEGER NULL,
        DFid_atendente_responsavel INTEGER NULL,
        DFdata_fechamento DATETIME NULL,
        DFsatisfacao_cliente CHAR(1) NULL,
        DFobservacao_fechamento NVARCHAR(MAX) NULL,
        DFtempo_resolucao_minutos INTEGER NULL,
        DFcampos_personalizados NVARCHAR(MAX) NULL,
        -- Novos campos migrados de campos personalizados
        DFtarefa_gitlab NVARCHAR(50) NULL,
        DFacompanhamento_gerencial CHAR(1) NULL DEFAULT 'N',
        DFmotivo_encerramento NVARCHAR(100) NULL,
        DFproduto_encerramento NVARCHAR(100) NULL,
        DFproblema_identificado NVARCHAR(200) NULL,
        DFarea_contabil NVARCHAR(100) NULL,
        DFatividade_interna NVARCHAR(100) NULL,
        DFurgencia_desenvolvimento NVARCHAR(10) NULL,

        CONSTRAINT PK__sac_TBchamado PRIMARY KEY (DFid_chamado),
        CONSTRAINT CK__sac_TBchamado__DFprioridade CHECK (DFprioridade IN ('B', 'N', 'A', 'U')),
        CONSTRAINT CK__sac_TBchamado__DFsatisfacao_cliente CHECK (DFsatisfacao_cliente IN ('E', 'B', 'R', 'P')),
        CONSTRAINT CK__sac_TBchamado__DFacompanhamento_gerencial CHECK (DFacompanhamento_gerencial IN ('S', 'N'))
    );
    PRINT 'Tabela tom.TBchamado criada com sucesso';
END
GO

-- Relacionamentos usando API
EXEC api.CRIAR_RELACAO 'tom.TBchamado', 'DFid_departamento', 'tom.TBdepartamento', 'DFid_departamento';
EXEC api.CRIAR_RELACAO 'tom.TBchamado', 'DFid_categoria', 'tom.TBcategoria', 'DFid_categoria';
EXEC api.CRIAR_RELACAO 'tom.TBchamado', 'DFid_situacao_chamado', 'tom.TBsituacao_chamado', 'DFid_situacao_chamado';
EXEC api.CRIAR_RELACAO 'tom.TBchamado', 'DFid_contato', 'tom.TBcontato', 'DFid_contato';
EXEC api.CRIAR_RELACAO 'tom.TBchamado', 'DFid_atendente_responsavel', 'tom.TBatendente', 'DFid_atendente';

-- Relacionamentos com tabelas de tipo (lookup tables)
EXEC api.CRIAR_RELACAO 'tom.TBchamado', 'DFprioridade', 'tom.TBtipo_prioridade', 'DFtipo_prioridade';
EXEC api.CRIAR_RELACAO 'tom.TBchamado', 'DFsatisfacao_cliente', 'tom.TBtipo_avaliacao', 'DFtipo_avaliacao';
EXEC api.CRIAR_RELACAO 'tom.TBchamado', 'DFacompanhamento_gerencial', 'tom.TBtipo_confirmacao', 'DFtipo_confirmacao';
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'tom.TBchamado', 'DFnumero_protocolo';
EXEC api.CRIAR_INDICE 'tom.TBchamado', 'DFid_contato';
EXEC api.CRIAR_INDICE 'tom.TBchamado', 'DFid_atendente_responsavel';
EXEC api.CRIAR_INDICE 'tom.TBchamado', 'DFid_situacao_chamado';
EXEC api.CRIAR_INDICE 'tom.TBchamado', 'DFid_departamento';
EXEC api.CRIAR_INDICE 'tom.TBchamado', 'DFid_categoria';
EXEC api.CRIAR_INDICE 'tom.TBchamado', 'DFdata_criacao,DFdata_fechamento';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado', NULL, 'Define os chamados/tickets principais do sistema de helpdesk';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado', 'DFid_chamado', 'Código único do ticket/chamado';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado', 'DFnumero_protocolo', 'Número de protocolo do chamado';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado', 'DFid_departamento', 'Código do produto/departamento responsável';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado', 'DFid_categoria', 'Código da categoria/tipo de assunto';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado', 'DFtitulo_chamado', 'Título do chamado';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado', 'DFmensagem_inicial', 'Mensagem/descrição principal do chamado';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado', 'DFdata_criacao', 'Data e hora de criação do chamado';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado', 'DFdata_ultima_atualizacao', 'Data e hora da última atualização';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado', 'DFid_situacao_chamado', 'Status atual do chamado';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado', 'DFprioridade', 'Prioridade do chamado (B=Baixa, N=Normal, A=Alta, U=Urgente)';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado', 'DFid_contato', 'Código do cliente que criou o chamado';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado', 'DFid_atendente_responsavel', 'Código do atendente responsável pelo chamado';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado', 'DFdata_fechamento', 'Data e hora de fechamento do chamado';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado', 'DFsatisfacao_cliente', 'Avaliação de satisfação do cliente (E=Excelente, B=Bom, R=Regular, P=Péssimo)';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado', 'DFobservacao_fechamento', 'Observações do fechamento do chamado';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado', 'DFtempo_resolucao_minutos', 'Tempo de resolução em minutos';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado', 'DFcampos_personalizados', 'Campos extras específicos do chamado em formato XML';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado', 'DFtarefa_gitlab', 'Referência para issue/tarefa do GitLab';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado', 'DFacompanhamento_gerencial', 'Indica se há acompanhamento gerencial no chamado';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado', 'DFmotivo_encerramento', 'Motivo do encerramento do chamado';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado', 'DFproduto_encerramento', 'Produto relacionado ao encerramento';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado', 'DFproblema_identificado', 'Problema identificado no plantão';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado', 'DFarea_contabil', 'Área contábil/folha/RH relacionada';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado', 'DFatividade_interna', 'Atividade interna realizada';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado', 'DFurgencia_desenvolvimento', 'Urgência para desenvolvimento';
GO