/*
TBchamado_anexo - Tabela de anexos dos chamados
Sistema TomTicket HelpDesk - Arquivos e documentos anexados aos chamados
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'tom.TBchamado_anexo') IS NULL
BEGIN
    CREATE TABLE tom.TBchamado_anexo (
        DFid_anexo INTEGER IDENTITY(1,1) NOT NULL,
        DFid_chamado INTEGER NOT NULL,
        DFnome_arquivo NVARCHAR(500) NOT NULL,
        DFid_historico INTEGER NULL,
        DFid_comentario INTEGER NULL,
        DFtipo_mime NVARCHAR(100) NULL,
        DFtamanho_arquivo INTEGER NULL,
        DFurl_arquivo NVARCHAR(2000) NOT NULL,
        DFdata_upload DATETIME NULL DEFAULT GETDATE(),

        CONSTRAINT PK__tom_TBchamado_anexo PRIMARY KEY (DFid_anexo)
    );
    PRINT 'Tabela tom.TBchamado_anexo criada com sucesso';
END
GO

-- Relacionamentos usando API
EXEC api.CRIAR_RELACAO 'tom.TBchamado_anexo', 'DFid_chamado', 'tom.TBchamado', 'DFid_chamado';
EXEC api.CRIAR_RELACAO 'tom.TBchamado_anexo', 'DFid_historico', 'tom.TBchamado_historico', 'DFid_historico';
EXEC api.CRIAR_RELACAO 'tom.TBchamado_anexo', 'DFid_comentario', 'tom.TBchamado_comentario', 'DFid_comentario';
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'tom.TBchamado_anexo', 'DFid_chamado';
EXEC api.CRIAR_INDICE 'tom.TBchamado_anexo', 'DFid_historico';
EXEC api.CRIAR_INDICE 'tom.TBchamado_anexo', 'DFid_comentario';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado_anexo', NULL, 'Anexos/arquivos associados aos chamados';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado_anexo', 'DFid_anexo', 'ID único do anexo';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado_anexo', 'DFid_chamado', 'ID do chamado ao qual o anexo pertence';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado_anexo', 'DFnome_arquivo', 'Nome do arquivo anexado';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado_anexo', 'DFid_historico', 'ID do histórico ao qual o anexo está associado';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado_anexo', 'DFid_comentario', 'ID do comentário ao qual o anexo está associado';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado_anexo', 'DFtipo_mime', 'Tipo MIME do arquivo';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado_anexo', 'DFtamanho_arquivo', 'Tamanho do arquivo em bytes';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado_anexo', 'DFurl_arquivo', 'URL para download do arquivo';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado_anexo', 'DFdata_upload', 'Data e hora do upload do arquivo';
GO