/*
TBtemplate_email - Tabela de templates de email
Sistema HelpDesk - Templates para emails automáticos do sistema
Nova tabela: Não existia no tom (necessária para requisitos de comunicação)
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'sac.TBtemplate_email') IS NULL
BEGIN
    CREATE TABLE sac.TBtemplate_email (
        DFid_template_email INTEGER IDENTITY(1,1) NOT NULL,
        DFnome_template NVARCHAR(255) NOT NULL,
        DFcodigo_template NVARCHAR(100) NOT NULL,
        DFdescricao NVARCHAR(500) NULL,
        DFassunto_email NVARCHAR(500) NOT NULL,
        DFcorpo_email_html NVARCHAR(MAX) NOT NULL,
        DFcorpo_email_texto NVARCHAR(MAX) NULL,
        DFtipo_template CHAR(1) NOT NULL, -- C=Chamado, A=Atendimento, S=Sistema, N=Notificação
        DFevento_trigger NVARCHAR(100) NULL, -- Evento que dispara o template
        DFid_departamento INTEGER NULL, -- Template específico para departamento
        DFvariaveis_disponiveis NVARCHAR(MAX) NULL, -- JSON com variáveis disponíveis
        DFativo BIT NOT NULL DEFAULT 1,
        DFdata_criacao DATETIME NOT NULL DEFAULT GETDATE(),
        DFdata_ultima_atualizacao DATETIME NULL,
        DFid_atendente_criador INTEGER NULL,
        DFobservacoes NVARCHAR(MAX) NULL,

        CONSTRAINT PK__sac_TBtemplate_email PRIMARY KEY (DFid_template_email),
        CONSTRAINT UQ__sac_TBtemplate_email__DFcodigo_template UNIQUE (DFcodigo_template),
        CONSTRAINT UQ__sac_TBtemplate_email__DFnome_template UNIQUE (DFnome_template),
        CONSTRAINT CK__sac_TBtemplate_email__DFtipo_template CHECK (DFtipo_template IN ('C', 'A', 'S', 'N'))
    );
    PRINT 'Tabela sac.TBtemplate_email criada com sucesso';
END
GO


-- Relacionamentos usando API
EXEC api.CRIAR_RELACAO 'sac.TBtemplate_email', 'DFid_departamento', 'sac.TBdepartamento', 'DFid_departamento';
EXEC api.CRIAR_RELACAO 'sac.TBtemplate_email', 'DFid_atendente_criador', 'sac.TBatendente', 'DFid_atendente';
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'sac.TBtemplate_email', 'DFcodigo_template', 1; -- UNIQUE já criado via constraint
EXEC api.CRIAR_INDICE 'sac.TBtemplate_email', 'DFnome_template', 1; -- UNIQUE já criado via constraint
EXEC api.CRIAR_INDICE 'sac.TBtemplate_email', 'DFtipo_template';
EXEC api.CRIAR_INDICE 'sac.TBtemplate_email', 'DFevento_trigger';
EXEC api.CRIAR_INDICE 'sac.TBtemplate_email', 'DFid_departamento';
EXEC api.CRIAR_INDICE 'sac.TBtemplate_email', 'DFativo';
EXEC api.CRIAR_INDICE 'sac.TBtemplate_email', 'DFdata_criacao';
GO

-- População inicial (idempotente) - Templates básicos
IF NOT EXISTS (SELECT 1 FROM sac.TBtemplate_email)
BEGIN
    INSERT INTO sac.TBtemplate_email (DFnome_template, DFcodigo_template, DFdescricao, DFassunto_email, DFcorpo_email_html, DFtipo_template, DFevento_trigger) VALUES
    ('Novo Chamado - Confirmação', 'NOVO_CHAMADO_CONFIRMACAO', 'Email de confirmação para novo chamado', 'Chamado #{id_chamado} criado com sucesso', '<h2>Seu chamado foi criado!</h2><p>Olá {nome_contato},</p><p>Seu chamado <strong>#{id_chamado}</strong> foi criado com sucesso.</p><p><strong>Título:</strong> {titulo_chamado}</p><p><strong>Departamento:</strong> {nome_departamento}</p><p>Você receberá atualizações por email.</p>', 'C', 'CRIAR_CHAMADO'),
    ('Chamado Atribuído - Atendente', 'CHAMADO_ATRIBUIDO_ATENDENTE', 'Notificação de nova atribuição para atendente', 'Novo chamado atribuído: #{id_chamado}', '<h2>Novo chamado atribuído</h2><p>Olá {nome_atendente},</p><p>O chamado <strong>#{id_chamado}</strong> foi atribuído para você.</p><p><strong>Título:</strong> {titulo_chamado}</p><p><strong>Cliente:</strong> {nome_cliente}</p><p><strong>Prioridade:</strong> {prioridade}</p><p><a href="{url_chamado}">Visualizar chamado</a></p>', 'C', 'ATRIBUIR_CHAMADO'),
    ('Chamado Resolvido - Contato', 'CHAMADO_RESOLVIDO_CONTATO', 'Notificação de resolução para contato', 'Chamado #{id_chamado} foi resolvido', '<h2>Seu chamado foi resolvido!</h2><p>Olá {nome_contato},</p><p>Seu chamado <strong>#{id_chamado}</strong> foi resolvido.</p><p><strong>Resolução:</strong> {observacao_resolucao}</p><p>Por favor, avalie nosso atendimento clicando no link abaixo:</p><p><a href="{url_avaliacao}">Avaliar atendimento</a></p>', 'C', 'RESOLVER_CHAMADO');
    PRINT 'Dados iniciais inseridos em sac.TBtemplate_email';
END
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'sac.TBtemplate_email', NULL, 'Define os templates de email para comunicações automáticas do sistema';
EXEC api.CRIAR_DESCRICAO 'sac.TBtemplate_email', 'DFid_template_email', 'ID único do template de email';
EXEC api.CRIAR_DESCRICAO 'sac.TBtemplate_email', 'DFnome_template', 'Nome do template de email';
EXEC api.CRIAR_DESCRICAO 'sac.TBtemplate_email', 'DFcodigo_template', 'Código único identificador do template';
EXEC api.CRIAR_DESCRICAO 'sac.TBtemplate_email', 'DFdescricao', 'Descrição do template de email';
EXEC api.CRIAR_DESCRICAO 'sac.TBtemplate_email', 'DFassunto_email', 'Assunto do email (pode conter variáveis)';
EXEC api.CRIAR_DESCRICAO 'sac.TBtemplate_email', 'DFcorpo_email_html', 'Corpo do email em formato HTML';
EXEC api.CRIAR_DESCRICAO 'sac.TBtemplate_email', 'DFcorpo_email_texto', 'Corpo do email em formato texto puro';
EXEC api.CRIAR_DESCRICAO 'sac.TBtemplate_email', 'DFtipo_template', 'Tipo do template (C=Chamado, A=Atendimento, S=Sistema, N=Notificação)';
EXEC api.CRIAR_DESCRICAO 'sac.TBtemplate_email', 'DFevento_trigger', 'Evento que dispara o uso do template';
EXEC api.CRIAR_DESCRICAO 'sac.TBtemplate_email', 'DFid_departamento', 'Departamento específico (NULL = geral)';
EXEC api.CRIAR_DESCRICAO 'sac.TBtemplate_email', 'DFvariaveis_disponiveis', 'Variáveis disponíveis para o template em formato JSON';
EXEC api.CRIAR_DESCRICAO 'sac.TBtemplate_email', 'DFativo', 'Indica se o template está ativo (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBtemplate_email', 'DFdata_criacao', 'Data e hora de criação do registro';
EXEC api.CRIAR_DESCRICAO 'sac.TBtemplate_email', 'DFdata_ultima_atualizacao', 'Data e hora da última atualização';
EXEC api.CRIAR_DESCRICAO 'sac.TBtemplate_email', 'DFid_atendente_criador', 'Atendente que criou o template';
EXEC api.CRIAR_DESCRICAO 'sac.TBtemplate_email', 'DFobservacoes', 'Observações sobre o template';
GO

