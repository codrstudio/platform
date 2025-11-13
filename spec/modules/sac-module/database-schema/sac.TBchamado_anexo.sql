/*
TBchamado_anexo - Tabela de anexos dos chamados
Sistema HelpDesk - Arquivos e documentos anexados aos chamados
Derivada de: tom.TBchamado_anexo (estrutura expandida)
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'sac.TBchamado_anexo') IS NULL
BEGIN
    CREATE TABLE sac.TBchamado_anexo (
        DFid_anexo INTEGER IDENTITY(1,1) NOT NULL,
        DFid_chamado INTEGER NOT NULL,
        DFid_historico INTEGER NULL, -- Anexo vinculado a mensagem específica
        DFnome_arquivo_original NVARCHAR(500) NOT NULL,
        DFnome_arquivo_storage NVARCHAR(500) NOT NULL, -- Nome no storage
        DFcaminho_arquivo NVARCHAR(1000) NOT NULL, -- Caminho completo no storage
        DFurl_download NVARCHAR(1000) NULL, -- URL pública para download
        DFurl_thumbnail NVARCHAR(1000) NULL, -- URL do thumbnail (para imagens)
        DFtipo_mime NVARCHAR(100) NOT NULL,
        DFextensao_arquivo NVARCHAR(10) NULL,
        DFtamanho_arquivo_bytes BIGINT NOT NULL,
        DFhash_arquivo NVARCHAR(64) NULL, -- Hash MD5/SHA256 para deduplicação
        DFstatus_virus_scan CHAR(1) NOT NULL DEFAULT 'P', -- P=Pendente, L=Limpo, I=Infectado
        DFresultado_virus_scan NVARCHAR(MAX) NULL,
        DFdata_upload DATETIME NOT NULL DEFAULT GETDATE(),
        DFid_usuario_upload INTEGER NULL, -- Quem fez upload (contato ou atendente)
        DFtipo_usuario_upload CHAR(1) NOT NULL, -- C=Contato, A=Atendente
        DFvisibilidade CHAR(1) NOT NULL DEFAULT 'P', -- P=Público, I=Interno
        DFendereco_ip NVARCHAR(45) NULL,
        DFuser_agent NVARCHAR(500) NULL,
        DFativo BIT NOT NULL DEFAULT 1,
        DFobservacoes NVARCHAR(MAX) NULL,

        CONSTRAINT PK__sac_TBchamado_anexo PRIMARY KEY (DFid_anexo),
        CONSTRAINT CK__sac_TBchamado_anexo__DFstatus_virus_scan CHECK (DFstatus_virus_scan IN ('P', 'L', 'I')),
        CONSTRAINT CK__sac_TBchamado_anexo__DFtipo_usuario_upload CHECK (DFtipo_usuario_upload IN ('C', 'A')),
        CONSTRAINT CK__sac_TBchamado_anexo__DFvisibilidade CHECK (DFvisibilidade IN ('P', 'I'))
    );
    PRINT 'Tabela sac.TBchamado_anexo criada com sucesso';
END
GO


-- Relacionamentos usando API
EXEC api.CRIAR_RELACAO 'sac.TBchamado_anexo', 'DFid_chamado', 'sac.TBchamado', 'DFid_chamado';
EXEC api.CRIAR_RELACAO 'sac.TBchamado_anexo', 'DFid_historico', 'sac.TBchamado_historico', 'DFid_historico';
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'sac.TBchamado_anexo', 'DFid_chamado';
EXEC api.CRIAR_INDICE 'sac.TBchamado_anexo', 'DFid_historico';
EXEC api.CRIAR_INDICE 'sac.TBchamado_anexo', 'DFhash_arquivo';
EXEC api.CRIAR_INDICE 'sac.TBchamado_anexo', 'DFstatus_virus_scan';
EXEC api.CRIAR_INDICE 'sac.TBchamado_anexo', 'DFdata_upload';
EXEC api.CRIAR_INDICE 'sac.TBchamado_anexo', 'DFtipo_usuario_upload,DFid_usuario_upload';
EXEC api.CRIAR_INDICE 'sac.TBchamado_anexo', 'DFvisibilidade';
EXEC api.CRIAR_INDICE 'sac.TBchamado_anexo', 'DFativo';
EXEC api.CRIAR_INDICE 'sac.TBchamado_anexo', 'DFtipo_mime';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_anexo', NULL, 'Anexos/arquivos associados aos chamados e suas mensagens';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_anexo', 'DFid_anexo', 'ID único do anexo';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_anexo', 'DFid_chamado', 'ID do chamado ao qual o anexo pertence';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_anexo', 'DFid_historico', 'ID da mensagem específica à qual o anexo está vinculado';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_anexo', 'DFnome_arquivo_original', 'Nome original do arquivo como enviado pelo usuário';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_anexo', 'DFnome_arquivo_storage', 'Nome do arquivo no sistema de storage';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_anexo', 'DFcaminho_arquivo', 'Caminho completo do arquivo no storage';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_anexo', 'DFurl_download', 'URL pública para download do arquivo';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_anexo', 'DFurl_thumbnail', 'URL do thumbnail (para imagens)';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_anexo', 'DFtipo_mime', 'Tipo MIME do arquivo';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_anexo', 'DFextensao_arquivo', 'Extensão do arquivo';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_anexo', 'DFtamanho_arquivo_bytes', 'Tamanho do arquivo em bytes';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_anexo', 'DFhash_arquivo', 'Hash do arquivo para deduplicação e integridade';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_anexo', 'DFstatus_virus_scan', 'Status do scan de vírus (P=Pendente, L=Limpo, I=Infectado)';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_anexo', 'DFresultado_virus_scan', 'Resultado detalhado do scan de vírus';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_anexo', 'DFdata_upload', 'Data e hora do upload do arquivo';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_anexo', 'DFid_usuario_upload', 'ID do usuário que fez o upload';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_anexo', 'DFtipo_usuario_upload', 'Tipo do usuário que fez upload (C=Contato, A=Atendente)';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_anexo', 'DFvisibilidade', 'Visibilidade do anexo (P=Público, I=Interno)';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_anexo', 'DFendereco_ip', 'Endereço IP de origem do upload';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_anexo', 'DFuser_agent', 'User agent do navegador/aplicação';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_anexo', 'DFativo', 'Indica se o anexo está ativo (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBchamado_anexo', 'DFobservacoes', 'Observações sobre o anexo';
GO

