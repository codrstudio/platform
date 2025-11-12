/*
TBatendimento_mensagem - Tabela de mensagens individuais nos atendimentos
Sistema TomTicket HelpDesk - Histórico de mensagens de chat
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'tom.TBatendimento_mensagem') IS NULL
BEGIN
    CREATE TABLE tom.TBatendimento_mensagem (
        DFid_mensagem_atendimento INTEGER IDENTITY(1,1) NOT NULL,
        DFid_atendimento INTEGER NOT NULL,
        DFconteudo_mensagem NVARCHAR(MAX) NOT NULL,
        DFdata_hora_envio DATETIME NOT NULL,
        DFtipo_remetente CHAR(1) NOT NULL,
        DFcaminho_arquivo NVARCHAR(500) NULL,
        DFtipo_mime_arquivo NVARCHAR(100) NULL,

        CONSTRAINT PK__tom_TBatendimento_mensagem PRIMARY KEY (DFid_mensagem_atendimento),
        CONSTRAINT CK__tom_TBatendimento_mensagem__DFtipo_remetente CHECK (DFtipo_remetente IN ('A', 'C', 'S'))
    );
    PRINT 'Tabela tom.TBatendimento_mensagem criada com sucesso';
END
GO

-- Relacionamentos usando API
EXEC api.CRIAR_RELACAO 'tom.TBatendimento_mensagem', 'DFid_atendimento', 'tom.TBatendimento', 'DFid_atendimento';

-- Relacionamentos com tabelas de tipo (lookup tables)
EXEC api.CRIAR_RELACAO 'tom.TBatendimento_mensagem', 'DFtipo_remetente', 'tom.TBtipo_remetente', 'DFtipo_remetente';
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'tom.TBatendimento_mensagem', 'DFid_atendimento';
EXEC api.CRIAR_INDICE 'tom.TBatendimento_mensagem', 'DFdata_hora_envio';
EXEC api.CRIAR_INDICE 'tom.TBatendimento_mensagem', 'DFtipo_remetente';
EXEC api.CRIAR_INDICE 'tom.TBatendimento_mensagem', 'DFid_atendimento,DFdata_hora_envio';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'tom.TBatendimento_mensagem', NULL, 'Define as mensagens individuais dentro dos atendimentos/conversas';
EXEC api.CRIAR_DESCRICAO 'tom.TBatendimento_mensagem', 'DFid_mensagem_atendimento', 'ID único da mensagem';
EXEC api.CRIAR_DESCRICAO 'tom.TBatendimento_mensagem', 'DFid_atendimento', 'Protocolo do atendimento ao qual a mensagem pertence';
EXEC api.CRIAR_DESCRICAO 'tom.TBatendimento_mensagem', 'DFconteudo_mensagem', 'Conteúdo da mensagem/conversa';
EXEC api.CRIAR_DESCRICAO 'tom.TBatendimento_mensagem', 'DFdata_hora_envio', 'Data e hora da mensagem';
EXEC api.CRIAR_DESCRICAO 'tom.TBatendimento_mensagem', 'DFtipo_remetente', 'Quem enviou a mensagem (A=Atendente, C=Cliente, S=Sistema)';
EXEC api.CRIAR_DESCRICAO 'tom.TBatendimento_mensagem', 'DFcaminho_arquivo', 'Caminho do arquivo anexado à mensagem';
EXEC api.CRIAR_DESCRICAO 'tom.TBatendimento_mensagem', 'DFtipo_mime_arquivo', 'Tipo MIME do arquivo anexado';
GO