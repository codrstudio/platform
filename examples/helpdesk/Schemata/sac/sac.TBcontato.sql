/*
TBcontato - Tabela de contatos dos clientes (ATUALIZADA)
Sistema HelpDesk - Usuários finais dos clientes com vínculo opcional a usuário
Atualizada: Adicionado vínculo opcional com TBusuario
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'sac.TBcontato') IS NULL
BEGIN
    CREATE TABLE sac.TBcontato (
        DFid_contato INTEGER IDENTITY(1,1) NOT NULL,
        DFid_usuario INTEGER NULL, -- Vínculo opcional com usuário (para login no portal)
        DFid_cliente INTEGER NOT NULL,
        DFnome_contato NVARCHAR(255) NOT NULL,
        DFemail_contato NVARCHAR(255) NOT NULL,
        DFtelefone_contato NVARCHAR(20) NULL,
        DFcargo_contato NVARCHAR(100) NULL,
        DFdepartamento_contato NVARCHAR(100) NULL,
        DFcontato_principal BIT NOT NULL DEFAULT 0,
        DFrecebe_notificacoes BIT NOT NULL DEFAULT 1,
        DFativo BIT NOT NULL DEFAULT 1,
        DFdata_criacao DATETIME NOT NULL DEFAULT GETDATE(),
        DFdata_ultima_atualizacao DATETIME NULL,
        DFobservacoes NVARCHAR(MAX) NULL,

        CONSTRAINT PK__sac_TBcontato PRIMARY KEY (DFid_contato),
        CONSTRAINT UQ__sac_TBcontato__DFemail_contato UNIQUE (DFemail_contato)
    );
END
GO

-- Remover constraint UNIQUE antiga se existir (migração)
IF EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'UQ__sac_TBcontato__DFid_usuario')
BEGIN
    ALTER TABLE sac.TBcontato DROP CONSTRAINT UQ__sac_TBcontato__DFid_usuario;
    PRINT 'Constraint UNIQUE antiga removida de DFid_usuario';
END
GO

-- Criar UNIQUE FILTERED INDEX para DFid_usuario (permite múltiplos NULLs)
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_IDX__sac_TBcontato__DFid_usuario' AND object_id = OBJECT_ID('sac.TBcontato'))
BEGIN
    CREATE UNIQUE INDEX UQ_IDX__sac_TBcontato__DFid_usuario
    ON sac.TBcontato(DFid_usuario)
    WHERE DFid_usuario IS NOT NULL; -- Permite múltiplos NULLs, mas garante unicidade quando não é NULL
    PRINT 'UNIQUE FILTERED INDEX criado em DFid_usuario';
END
GO

-- Relacionamentos usando API
EXEC api.CRIAR_RELACAO 'sac.TBcontato', 'DFid_usuario', 'sac.TBusuario', 'DFid_usuario';
EXEC api.CRIAR_RELACAO 'sac.TBcontato', 'DFid_cliente', 'sac.TBcliente', 'DFid_cliente';
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'sac.TBcontato', 'DFemail_contato', 1; -- UNIQUE já criado via constraint
-- DFid_usuario já tem UNIQUE FILTERED INDEX criado acima
EXEC api.CRIAR_INDICE 'sac.TBcontato', 'DFid_cliente';
EXEC api.CRIAR_INDICE 'sac.TBcontato', 'DFativo';
EXEC api.CRIAR_INDICE 'sac.TBcontato', 'DFcontato_principal';
EXEC api.CRIAR_INDICE 'sac.TBcontato', 'DFdata_criacao';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'sac.TBcontato', NULL, 'Define os contatos dos clientes com vínculo opcional a usuário';
EXEC api.CRIAR_DESCRICAO 'sac.TBcontato', 'DFid_contato', 'Código único do contato';
EXEC api.CRIAR_DESCRICAO 'sac.TBcontato', 'DFid_usuario', 'Usuário vinculado (NULL = contato sem login no portal)';
EXEC api.CRIAR_DESCRICAO 'sac.TBcontato', 'DFid_cliente', 'Cliente ao qual o contato pertence';
EXEC api.CRIAR_DESCRICAO 'sac.TBcontato', 'DFnome_contato', 'Nome completo do contato';
EXEC api.CRIAR_DESCRICAO 'sac.TBcontato', 'DFemail_contato', 'Email do contato';
EXEC api.CRIAR_DESCRICAO 'sac.TBcontato', 'DFtelefone_contato', 'Telefone do contato';
EXEC api.CRIAR_DESCRICAO 'sac.TBcontato', 'DFcargo_contato', 'Cargo do contato na empresa';
EXEC api.CRIAR_DESCRICAO 'sac.TBcontato', 'DFdepartamento_contato', 'Departamento do contato na empresa';
EXEC api.CRIAR_DESCRICAO 'sac.TBcontato', 'DFcontato_principal', 'Indica se é o contato principal do cliente (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBcontato', 'DFrecebe_notificacoes', 'Indica se recebe notificações (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBcontato', 'DFativo', 'Indica se o contato está ativo (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBcontato', 'DFdata_criacao', 'Data e hora de criação do registro';
EXEC api.CRIAR_DESCRICAO 'sac.TBcontato', 'DFdata_ultima_atualizacao', 'Data e hora da última atualização';
EXEC api.CRIAR_DESCRICAO 'sac.TBcontato', 'DFobservacoes', 'Observações sobre o contato';
GO
