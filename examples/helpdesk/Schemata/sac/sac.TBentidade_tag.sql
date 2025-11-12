/*
TBentidade_tag - Tabela de relacionamento N:N entre entidades e tags
Sistema HelpDesk - Associação com validação automática de compatibilidade
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'sac.TBentidade_tag') IS NULL
BEGIN
    CREATE TABLE sac.TBentidade_tag (
        DFtag NVARCHAR(50) NOT NULL,
        DFid_entidade INTEGER NOT NULL,
        DFdata_atribuicao DATETIME NOT NULL DEFAULT GETDATE(),
        DFid_usuario_atribuicao INTEGER NULL,
        DFtipo_usuario_atribuicao CHAR(1) NULL, -- A=Atendente, C=Contato, S=Sistema
        DFobservacoes NVARCHAR(MAX) NULL,

        CONSTRAINT PK__sac_TBentidade_tag PRIMARY KEY (DFtag, DFid_entidade),
        CONSTRAINT CK__sac_TBentidade_tag__DFtipo_usuario_atribuicao CHECK (DFtipo_usuario_atribuicao IN ('A', 'C', 'S'))
    );
    PRINT 'Tabela sac.TBentidade_tag criada com sucesso';
END
GO

-- Relacionamentos usando API
-- Nota: FK composta para TBtag será criada via procedure específica
-- devido à complexidade da chave composta (DFtag, DFtipo_entidade)
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'sac.TBentidade_tag', 'DFtag,DFid_entidade', 1; -- PK já criado
EXEC api.CRIAR_INDICE 'sac.TBentidade_tag', 'DFid_entidade';
EXEC api.CRIAR_INDICE 'sac.TBentidade_tag', 'DFdata_atribuicao';
EXEC api.CRIAR_INDICE 'sac.TBentidade_tag', 'DFid_usuario_atribuicao,DFtipo_usuario_atribuicao';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'sac.TBentidade_tag', NULL, 'Define o relacionamento N:N entre entidades e suas tags específicas com validação automática';
EXEC api.CRIAR_DESCRICAO 'sac.TBentidade_tag', 'DFtag', 'Tag associada (tipo de entidade vem da tag)';
EXEC api.CRIAR_DESCRICAO 'sac.TBentidade_tag', 'DFid_entidade', 'ID da entidade específica';
EXEC api.CRIAR_DESCRICAO 'sac.TBentidade_tag', 'DFdata_atribuicao', 'Data e hora da atribuição da tag';
EXEC api.CRIAR_DESCRICAO 'sac.TBentidade_tag', 'DFid_usuario_atribuicao', 'ID do usuário que atribuiu a tag';
EXEC api.CRIAR_DESCRICAO 'sac.TBentidade_tag', 'DFtipo_usuario_atribuicao', 'Tipo do usuário que atribuiu (A=Atendente, C=Contato, S=Sistema)';
EXEC api.CRIAR_DESCRICAO 'sac.TBentidade_tag', 'DFobservacoes', 'Observações sobre a atribuição da tag';
GO
