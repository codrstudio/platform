/*
TBusuario - Tabela de usuários do sistema HelpDesk (ATUALIZADA)
Sistema HelpDesk - Gestão de autenticação e perfis de usuário
Atualizada: Removido is_admin (agora via papéis)
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'sac.TBusuario') IS NULL
BEGIN
    CREATE TABLE sac.TBusuario (
        DFid_usuario INTEGER IDENTITY(1,1) NOT NULL,
        DFemail_usuario NVARCHAR(255) NOT NULL,
        DFnome_exibicao NVARCHAR(255) NOT NULL,
        DFhash_senha NVARCHAR(255) NOT NULL,
        DFavatar_url NVARCHAR(500) NULL,
        DFtelefone NVARCHAR(20) NULL,
        DFfuso_horario NVARCHAR(50) NULL DEFAULT 'America/Sao_Paulo',
        DFidioma NVARCHAR(10) NULL DEFAULT 'pt-BR',
        DFtema_interface NVARCHAR(20) NULL DEFAULT 'claro', -- claro, escuro, auto
        DFnotificacoes_email BIT NOT NULL DEFAULT 1,
        DFnotificacoes_push BIT NOT NULL DEFAULT 1,
        DFultimo_login DATETIME NULL,
        DFip_ultimo_login NVARCHAR(45) NULL,
        DFtentativas_login_falhadas INTEGER NOT NULL DEFAULT 0,
        DFdata_bloqueio DATETIME NULL,
        DFtoken_recuperacao_senha NVARCHAR(255) NULL,
        DFdata_expiracao_token DATETIME NULL,
        DFativo BIT NOT NULL DEFAULT 1,
        DFdata_criacao DATETIME NOT NULL DEFAULT GETDATE(),
        DFdata_ultima_atualizacao DATETIME NULL,
        DFobservacoes NVARCHAR(MAX) NULL,

        CONSTRAINT PK__sac_TBusuario PRIMARY KEY (DFid_usuario),
        CONSTRAINT UQ__sac_TBusuario__DFemail_usuario UNIQUE (DFemail_usuario),
        CONSTRAINT CK__sac_TBusuario__DFtema_interface CHECK (DFtema_interface IN ('claro', 'escuro', 'auto'))
    );
END
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'sac.TBusuario', 'DFemail_usuario', 1; -- UNIQUE já criado via constraint
EXEC api.CRIAR_INDICE 'sac.TBusuario', 'DFativo';
EXEC api.CRIAR_INDICE 'sac.TBusuario', 'DFultimo_login';
EXEC api.CRIAR_INDICE 'sac.TBusuario', 'DFdata_criacao';
EXEC api.CRIAR_INDICE 'sac.TBusuario', 'DFtoken_recuperacao_senha';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario', NULL, 'Define os usuários do sistema com autenticação e perfis (papéis via TBusuario_papel)';
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario', 'DFid_usuario', 'Código único do usuário';
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario', 'DFemail_usuario', 'Email único para login';
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario', 'DFnome_exibicao', 'Nome de exibição do usuário';
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario', 'DFhash_senha', 'Hash da senha do usuário';
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario', 'DFavatar_url', 'URL do avatar do usuário';
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario', 'DFtelefone', 'Telefone do usuário';
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario', 'DFfuso_horario', 'Fuso horário preferido do usuário';
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario', 'DFidioma', 'Idioma preferido do usuário';
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario', 'DFtema_interface', 'Tema da interface (claro, escuro, auto)';
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario', 'DFnotificacoes_email', 'Receber notificações por email (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario', 'DFnotificacoes_push', 'Receber notificações push (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario', 'DFultimo_login', 'Data e hora do último login';
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario', 'DFip_ultimo_login', 'IP do último login';
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario', 'DFtentativas_login_falhadas', 'Contador de tentativas de login falhadas';
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario', 'DFdata_bloqueio', 'Data de bloqueio da conta (se aplicável)';
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario', 'DFtoken_recuperacao_senha', 'Token para recuperação de senha';
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario', 'DFdata_expiracao_token', 'Data de expiração do token de recuperação';
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario', 'DFativo', 'Indica se o usuário está ativo (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario', 'DFdata_criacao', 'Data e hora de criação do registro';
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario', 'DFdata_ultima_atualizacao', 'Data e hora da última atualização';
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario', 'DFobservacoes', 'Observações sobre o usuário';
GO
