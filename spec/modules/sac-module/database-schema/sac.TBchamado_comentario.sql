/*
TBchamado_comentario - Tabela de comentários dos chamados
Sistema HelpDesk - Comentários internos e externos dos chamados
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'sac.TBchamado_comentario') IS NULL
BEGIN
    CREATE TABLE sac.TBchamado_comentario (
        DFid_comentario INTEGER IDENTITY(1,1) NOT NULL,
        DFid_chamado INTEGER NOT NULL,
        DFtexto_comentario NVARCHAR(MAX) NOT NULL,
        DFdata_hora_comentario DATETIME NOT NULL DEFAULT GETDATE(),
        DFid_usuario INTEGER NULL, -- Pode ser um atendente ou um contato
        DFtipo_usuario CHAR(1) NULL, -- A=Atendente, C=Contato
        DFprivado BIT NOT NULL DEFAULT 1, -- S=Sim (interno), N=Não (visível para o cliente)
        DFdata_criacao DATETIME NOT NULL DEFAULT GETDATE(),
        DFdata_ultima_atualizacao DATETIME NULL,

        CONSTRAINT PK__sac_TBchamado_comentario PRIMARY KEY (DFid_comentario),
        CONSTRAINT CK__sac_TBchamado_comentario__DFtipo_usuario CHECK (DFtipo_usuario IN ('A', 'C')),
        CONSTRAINT CK__sac_TBchamado_comentario__DFprivado CHECK (DFprivado IN ('S', 'N'))
    );
    PRINT 'Tabela sac.TBchamado_comentario criada com sucesso';
END
GO

-- Relacionamentos usando API
EXEC api.CRIAR_RELACAO 'sac.TBchamado_comentario', 'DFid_chamado', 'sac.TBchamado', 'DFid_chamado';
-- A relação com TBatendente ou TBcontato é polimórfica, tratada na aplicação
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'sac.TBchamado_comentario', 'DFid_chamado';
EXEC api.CRIAR_INDICE 'sac.TBchamado_comentario', 'DFid_usuario,DFtipo_usuario';
EXEC api.CRIAR_INDICE 'sac.TBchamado_comentario', 'DFdata_hora_comentario';
EXEC api.CRIAR_INDICE 'sac.TBchamado_comentario', 'DFprivado';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_comentario', NULL, 'Armazena os comentários internos e externos associados a um chamado';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_comentario', 'DFid_comentario', 'ID único do comentário';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_comentario', 'DFid_chamado', 'ID do chamado ao qual o comentário pertence';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_comentario', 'DFtexto_comentario', 'Texto do comentário';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_comentario', 'DFdata_hora_comentario', 'Data e hora do comentário';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_comentario', 'DFid_usuario', 'ID do usuário que fez o comentário (atendente ou contato)';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_comentario', 'DFtipo_usuario', 'Tipo do usuário que fez o comentário (A=Atendente, C=Contato)';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_comentario', 'DFprivado', 'Indica se o comentário é privado/interno (S) ou público (N)';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_comentario', 'DFdata_criacao', 'Data e hora de criação do registro';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_comentario', 'DFdata_ultima_atualizacao', 'Data e hora da última atualização';
GO

