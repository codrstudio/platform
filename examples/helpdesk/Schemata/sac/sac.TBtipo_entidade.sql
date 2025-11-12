/*
TBtipo_entidade - Tabela de tipos de entidade do sistema
Sistema HelpDesk - Define entidades válidas para sistema de tags
Nova tabela: Garantia de integridade referencial para entidades
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'sac.TBtipo_entidade') IS NULL
BEGIN
    CREATE TABLE sac.TBtipo_entidade (
        DFtipo_entidade NVARCHAR(20) NOT NULL,
        DFnome_tabela NVARCHAR(50) NOT NULL,
        DFnome_exibicao NVARCHAR(100) NOT NULL,
        DFdescricao NVARCHAR(500) NULL,
        DFcor NVARCHAR(20) NOT NULL DEFAULT 'normal',
        DFicone NVARCHAR(50) NULL DEFAULT 'database',
        DFpermite_tags BIT NOT NULL DEFAULT 1,
        DFativo BIT NOT NULL DEFAULT 1,
        DFdata_criacao DATETIME NOT NULL DEFAULT GETDATE(),
        DFdata_ultima_atualizacao DATETIME NULL,
        DFobservacoes NVARCHAR(MAX) NULL,

        CONSTRAINT PK__sac_TBtipo_entidade PRIMARY KEY (DFtipo_entidade),
        CONSTRAINT UQ__sac_TBtipo_entidade__DFnome_tabela UNIQUE (DFnome_tabela),
        CONSTRAINT UQ__sac_TBtipo_entidade__DFnome_exibicao UNIQUE (DFnome_exibicao),
    );
    PRINT 'Tabela sac.TBtipo_entidade criada com sucesso';
END
GO


-- Relacionamentos usando API
EXEC api.CRIAR_RELACAO 'sac.TBtipo_entidade', 'DFcor', 'sac.TBcor_semantica', 'DFcor';
GO

-- População inicial (idempotente) - Entidades do sistema
IF NOT EXISTS (SELECT 1 FROM sac.TBtipo_entidade)
BEGIN
    INSERT INTO sac.TBtipo_entidade (DFtipo_entidade, DFnome_tabela, DFnome_exibicao, DFdescricao, DFcor, DFicone, DFpermite_tags) VALUES
    ('chamado', 'TBchamado', 'Chamado', 'Tickets/chamados de suporte', 'azul', 'ticket', 1),
    ('contato', 'TBcontato', 'Contato', 'Usuários finais/contatos dos clientes', 'verde', 'user', 1),
    ('atendente', 'TBatendente', 'Atendente', 'Operadores do sistema de helpdesk', 'roxo', 'headset', 1),
    ('atendimento', 'TBatendimento', 'Atendimento', 'Sessões de chat/atendimento online', 'ciano', 'message-circle', 1),
    ('cliente', 'TBcliente', 'Cliente', 'Empresas/organizações clientes', 'laranja', 'building', 1),
    ('departamento', 'TBdepartamento', 'Departamento', 'Departamentos/produtos do sistema', 'indigo', 'folder', 1),
    ('categoria', 'TBcategoria', 'Categoria', 'Categorias de assunto dos chamados', 'amarelo', 'tag', 1);
    PRINT 'Dados iniciais inseridos em sac.TBtipo_entidade';
END
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'sac.TBtipo_entidade', 'DFtipo_entidade', 1; -- PK já criado
EXEC api.CRIAR_INDICE 'sac.TBtipo_entidade', 'DFnome_tabela', 1; -- UNIQUE já criado
EXEC api.CRIAR_INDICE 'sac.TBtipo_entidade', 'DFnome_exibicao', 1; -- UNIQUE já criado
EXEC api.CRIAR_INDICE 'sac.TBtipo_entidade', 'DFcor';
EXEC api.CRIAR_INDICE 'sac.TBtipo_entidade', 'DFpermite_tags';
EXEC api.CRIAR_INDICE 'sac.TBtipo_entidade', 'DFativo';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_entidade', NULL, 'Define os tipos de entidade válidos no sistema para controle de integridade';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_entidade', 'DFtipo_entidade', 'Código do tipo de entidade (nome da tabela sem prefixo TB)';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_entidade', 'DFnome_tabela', 'Nome completo da tabela (com prefixo TB)';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_entidade', 'DFnome_exibicao', 'Nome de exibição da entidade';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_entidade', 'DFdescricao', 'Descrição da entidade';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_entidade', 'DFcor', 'Cor semântica da entidade';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_entidade', 'DFicone', 'Ícone para exibição da entidade';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_entidade', 'DFpermite_tags', 'Indica se a entidade permite associação com tags (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_entidade', 'DFativo', 'Indica se o tipo de entidade está ativo (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_entidade', 'DFdata_criacao', 'Data e hora de criação do registro';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_entidade', 'DFdata_ultima_atualizacao', 'Data e hora da última atualização';
EXEC api.CRIAR_DESCRICAO 'sac.TBtipo_entidade', 'DFobservacoes', 'Observações sobre o tipo de entidade';
GO

