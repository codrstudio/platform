/*
TBchamado_comentario - Tabela de comentários internos dos chamados
Sistema TomTicket HelpDesk - Observações e notas dos atendentes
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'tom.TBchamado_comentario') IS NULL
BEGIN
    CREATE TABLE tom.TBchamado_comentario (
        DFid_comentario INTEGER NOT NULL,
        DFid_chamado INTEGER NOT NULL,
        DFtexto_comentario NVARCHAR(MAX) NOT NULL,
        DFdata_hora_comentario DATETIME NOT NULL,
        DFid_atendente INTEGER NULL,

        CONSTRAINT PK__tom_TBchamado_comentario PRIMARY KEY (DFid_comentario)
    );
    PRINT 'Tabela tom.TBchamado_comentario criada com sucesso';
END
GO

-- Relacionamentos usando API
EXEC api.CRIAR_RELACAO 'tom.TBchamado_comentario', 'DFid_chamado', 'tom.TBchamado', 'DFid_chamado';
EXEC api.CRIAR_RELACAO 'tom.TBchamado_comentario', 'DFid_atendente', 'tom.TBatendente', 'DFid_atendente';
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'tom.TBchamado_comentario', 'DFid_chamado';
EXEC api.CRIAR_INDICE 'tom.TBchamado_comentario', 'DFid_atendente';
EXEC api.CRIAR_INDICE 'tom.TBchamado_comentario', 'DFdata_hora_comentario';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado_comentario', NULL, 'Comentários internos dos chamados (observações dos atendentes)';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado_comentario', 'DFid_comentario', 'ID único do comentário';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado_comentario', 'DFid_chamado', 'ID do chamado ao qual o comentário pertence';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado_comentario', 'DFtexto_comentario', 'Texto do comentário interno';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado_comentario', 'DFdata_hora_comentario', 'Data e hora do comentário';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado_comentario', 'DFid_atendente', 'ID do atendente que fez o comentário';
GO