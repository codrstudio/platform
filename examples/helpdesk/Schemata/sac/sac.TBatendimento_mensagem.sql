/*
TBatendimento_mensagem - Tabela de mensagens individuais nos atendimentos
Sistema HelpDesk - Histórico de mensagens de chat em tempo real
Derivada de: tom.TBatendimento_mensagem (estrutura expandida)
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'sac.TBatendimento_mensagem') IS NULL
BEGIN
    CREATE TABLE sac.TBatendimento_mensagem (
        DFid_mensagem INTEGER IDENTITY(1,1) NOT NULL,
        DFid_atendimento INTEGER NOT NULL,
        DFconteudo_mensagem NVARCHAR(MAX) NOT NULL,
        DFdata_hora_envio DATETIME NOT NULL DEFAULT GETDATE(),
        DFtipo_remetente CHAR(1) NOT NULL, -- V=Visitante, A=Atendente, S=Sistema
        DFid_remetente INTEGER NULL, -- ID do atendente (se tipo = A)
        DFnome_remetente NVARCHAR(255) NULL, -- Nome do remetente
        DFstatus_mensagem CHAR(1) NOT NULL DEFAULT 'E', -- E=Enviada, L=Lida, F=Falhou
        DFdata_leitura DATETIME NULL,
        DFtipo_conteudo CHAR(1) NOT NULL DEFAULT 'T', -- T=Texto, I=Imagem, A=Arquivo, E=Emoji
        DFurl_arquivo NVARCHAR(1000) NULL, -- Para arquivos/imagens
        DFnome_arquivo NVARCHAR(500) NULL,
        DFtamanho_arquivo_bytes INTEGER NULL,
        DFtipo_mime NVARCHAR(100) NULL,
        DFmetadados_mensagem NVARCHAR(MAX) NULL, -- JSON com metadados extras
        DFresposta_para_id_mensagem INTEGER NULL, -- Para respostas/threads
        DFeditada BIT NOT NULL DEFAULT 0,
        DFdata_edicao DATETIME NULL,
        DFexcluida BIT NOT NULL DEFAULT 0,
        DFdata_exclusao DATETIME NULL,
        DFendereco_ip NVARCHAR(45) NULL,
        DFuser_agent NVARCHAR(500) NULL,
        DFobservacoes NVARCHAR(MAX) NULL,

        CONSTRAINT PK__sac_TBatendimento_mensagem PRIMARY KEY (DFid_mensagem),
        CONSTRAINT CK__sac_TBatendimento_mensagem__DFtipo_remetente CHECK (DFtipo_remetente IN ('V', 'A', 'S')),
        CONSTRAINT CK__sac_TBatendimento_mensagem__DFstatus_mensagem CHECK (DFstatus_mensagem IN ('E', 'L', 'F')),
        CONSTRAINT CK__sac_TBatendimento_mensagem__DFtipo_conteudo CHECK (DFtipo_conteudo IN ('T', 'I', 'A', 'E'))
    );
    PRINT 'Tabela sac.TBatendimento_mensagem criada com sucesso';
END
GO

-- Relacionamentos usando API
EXEC api.CRIAR_RELACAO 'sac.TBatendimento_mensagem', 'DFid_atendimento', 'sac.TBatendimento', 'DFid_atendimento';
EXEC api.CRIAR_RELACAO 'sac.TBatendimento_mensagem', 'DFid_remetente', 'sac.TBatendente', 'DFid_atendente';
EXEC api.CRIAR_RELACAO 'sac.TBatendimento_mensagem', 'DFresposta_para_id_mensagem', 'sac.TBatendimento_mensagem', 'DFid_mensagem';
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'sac.TBatendimento_mensagem', 'DFid_atendimento';
EXEC api.CRIAR_INDICE 'sac.TBatendimento_mensagem', 'DFdata_hora_envio';
EXEC api.CRIAR_INDICE 'sac.TBatendimento_mensagem', 'DFtipo_remetente';
EXEC api.CRIAR_INDICE 'sac.TBatendimento_mensagem', 'DFid_remetente';
EXEC api.CRIAR_INDICE 'sac.TBatendimento_mensagem', 'DFstatus_mensagem';
EXEC api.CRIAR_INDICE 'sac.TBatendimento_mensagem', 'DFresposta_para_id_mensagem';
EXEC api.CRIAR_INDICE 'sac.TBatendimento_mensagem', 'DFexcluida';
EXEC api.CRIAR_INDICE 'sac.TBatendimento_mensagem', 'DFid_atendimento,DFdata_hora_envio';
EXEC api.CRIAR_INDICE 'sac.TBatendimento_mensagem', 'DFid_atendimento,DFexcluida';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento_mensagem', NULL, 'Define as mensagens individuais dentro dos atendimentos/conversas de chat';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento_mensagem', 'DFid_mensagem', 'ID único da mensagem';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento_mensagem', 'DFid_atendimento', 'ID do atendimento ao qual a mensagem pertence';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento_mensagem', 'DFconteudo_mensagem', 'Conteúdo da mensagem';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento_mensagem', 'DFdata_hora_envio', 'Data e hora de envio da mensagem';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento_mensagem', 'DFtipo_remetente', 'Tipo do remetente (V=Visitante, A=Atendente, S=Sistema)';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento_mensagem', 'DFid_remetente', 'ID do atendente remetente (se aplicável)';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento_mensagem', 'DFnome_remetente', 'Nome do remetente da mensagem';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento_mensagem', 'DFstatus_mensagem', 'Status da mensagem (E=Enviada, L=Lida, F=Falhou)';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento_mensagem', 'DFdata_leitura', 'Data e hora de leitura da mensagem';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento_mensagem', 'DFtipo_conteudo', 'Tipo do conteúdo (T=Texto, I=Imagem, A=Arquivo, E=Emoji)';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento_mensagem', 'DFurl_arquivo', 'URL do arquivo anexado (se aplicável)';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento_mensagem', 'DFnome_arquivo', 'Nome do arquivo anexado';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento_mensagem', 'DFtamanho_arquivo_bytes', 'Tamanho do arquivo em bytes';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento_mensagem', 'DFtipo_mime', 'Tipo MIME do arquivo';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento_mensagem', 'DFmetadados_mensagem', 'Metadados extras da mensagem em formato JSON';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento_mensagem', 'DFresposta_para_id_mensagem', 'ID da mensagem à qual esta é uma resposta';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento_mensagem', 'DFeditada', 'Indica se a mensagem foi editada (0=Não, 1=Sim)';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento_mensagem', 'DFdata_edicao', 'Data e hora da última edição';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento_mensagem', 'DFexcluida', 'Indica se a mensagem foi excluída (0=Não, 1=Sim)';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento_mensagem', 'DFdata_exclusao', 'Data e hora da exclusão';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento_mensagem', 'DFendereco_ip', 'Endereço IP de origem da mensagem';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento_mensagem', 'DFuser_agent', 'User agent do navegador/aplicação';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento_mensagem', 'DFobservacoes', 'Observações sobre a mensagem';
GO

