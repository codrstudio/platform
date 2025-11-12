/*
TBchamado_historico - Tabela de histórico e mensagens dos chamados
Sistema TomTicket HelpDesk - Registro completo de interações nos chamados
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'tom.TBchamado_historico') IS NULL
BEGIN
    CREATE TABLE tom.TBchamado_historico (
        DFid_historico INTEGER NOT NULL,
        DFid_chamado INTEGER NOT NULL,
        DFconteudo_historico NVARCHAR(MAX) NOT NULL,
        DFdata_hora_historico DATETIME NOT NULL,
        DFid_situacao_chamado INTEGER NULL,
        DFid_contato INTEGER NULL,
        DFid_atendente INTEGER NULL,
        DFtipo_mime NVARCHAR(100) NULL DEFAULT 'text/plain',

        CONSTRAINT PK__tom_TBchamado_historico PRIMARY KEY (DFid_historico)
    );
    PRINT 'Tabela tom.TBchamado_historico criada com sucesso';
END
GO

-- Relacionamentos usando API
EXEC api.CRIAR_RELACAO 'tom.TBchamado_historico', 'DFid_chamado', 'tom.TBchamado', 'DFid_chamado';
EXEC api.CRIAR_RELACAO 'tom.TBchamado_historico', 'DFid_situacao_chamado', 'tom.TBsituacao_chamado', 'DFid_situacao_chamado';
EXEC api.CRIAR_RELACAO 'tom.TBchamado_historico', 'DFid_contato', 'tom.TBcontato', 'DFid_contato';
EXEC api.CRIAR_RELACAO 'tom.TBchamado_historico', 'DFid_atendente', 'tom.TBatendente', 'DFid_atendente';
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'tom.TBchamado_historico', 'DFid_chamado';
EXEC api.CRIAR_INDICE 'tom.TBchamado_historico', 'DFid_situacao_chamado';
EXEC api.CRIAR_INDICE 'tom.TBchamado_historico', 'DFid_atendente';
EXEC api.CRIAR_INDICE 'tom.TBchamado_historico', 'DFid_contato';
EXEC api.CRIAR_INDICE 'tom.TBchamado_historico', 'DFdata_hora_historico';
EXEC api.CRIAR_INDICE 'tom.TBchamado_historico', 'DFid_chamado,DFdata_hora_historico';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado_historico', NULL, 'Histórico de mensagens e interações dos chamados';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado_historico', 'DFid_historico', 'ID único do histórico';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado_historico', 'DFid_chamado', 'ID do chamado ao qual o histórico pertence';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado_historico', 'DFconteudo_historico', 'Conteúdo da mensagem/histórico';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado_historico', 'DFdata_hora_historico', 'Data e hora do histórico';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado_historico', 'DFid_situacao_chamado', 'Situação do chamado no momento do histórico';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado_historico', 'DFid_contato', 'ID do cliente/contato que enviou a mensagem';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado_historico', 'DFid_atendente', 'ID do atendente que enviou a mensagem';
EXEC api.CRIAR_DESCRICAO 'tom.TBchamado_historico', 'DFtipo_mime', 'Tipo MIME do conteúdo';
GO