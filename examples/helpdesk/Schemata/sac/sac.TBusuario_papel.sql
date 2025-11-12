/*
TBusuario_papel - Tabela de relacionamento N:N entre usuários e papéis
Sistema HelpDesk - Associação de papéis aos usuários para controle de acesso
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'sac.TBusuario_papel') IS NULL
BEGIN
    CREATE TABLE sac.TBusuario_papel (
        DFid_usuario INTEGER NOT NULL,
        DFid_papel INTEGER NOT NULL,
        DFdata_atribuicao DATETIME NOT NULL DEFAULT GETDATE(),
        DFdata_expiracao DATETIME NULL, -- NULL = sem expiração
        DFid_usuario_atribuicao INTEGER NULL, -- Quem atribuiu o papel
        DFativo BIT NOT NULL DEFAULT 1,
        DFobservacoes NVARCHAR(MAX) NULL,

        CONSTRAINT PK__sac_TBusuario_papel PRIMARY KEY (DFid_usuario, DFid_papel)
    );
    PRINT 'Tabela sac.TBusuario_papel criada com sucesso';
END
GO

-- Relacionamentos usando API
EXEC api.CRIAR_RELACAO 'sac.TBusuario_papel', 'DFid_usuario', 'sac.TBusuario', 'DFid_usuario';
EXEC api.CRIAR_RELACAO 'sac.TBusuario_papel', 'DFid_papel', 'sac.TBpapel', 'DFid_papel';
EXEC api.CRIAR_RELACAO 'sac.TBusuario_papel', 'DFid_usuario_atribuicao', 'sac.TBusuario', 'DFid_usuario';
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'sac.TBusuario_papel', 'DFid_usuario,DFid_papel', 1; -- PK já criado
EXEC api.CRIAR_INDICE 'sac.TBusuario_papel', 'DFid_papel';
EXEC api.CRIAR_INDICE 'sac.TBusuario_papel', 'DFativo';
EXEC api.CRIAR_INDICE 'sac.TBusuario_papel', 'DFdata_atribuicao';
EXEC api.CRIAR_INDICE 'sac.TBusuario_papel', 'DFdata_expiracao';
EXEC api.CRIAR_INDICE 'sac.TBusuario_papel', 'DFid_usuario_atribuicao';
GO

-- Verifica/ajusta o alvo para o mesmo objeto
DROP TRIGGER IF EXISTS sac.TR_TBusuario_papel__validar_papel_fixo;
GO

-- Trigger para impedir remoção de papéis fixos
CREATE OR ALTER TRIGGER TR_TBusuario_papel__validar_papel_fixo
ON sac.TBusuario_papel
AFTER DELETE, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Verificar se está tentando remover papel ADMINISTRADOR do último administrador
    IF EXISTS (
        SELECT 1 FROM deleted d
        INNER JOIN sac.TBpapel p ON p.DFid_papel = d.DFid_papel
        WHERE p.DFcodigo_papel = 'administrador'
    )
    BEGIN
        -- Contar quantos administradores restam ativos
        DECLARE @admin_count INTEGER;
        SELECT @admin_count = COUNT(*)
        FROM sac.TBusuario_papel up
        INNER JOIN sac.TBpapel p ON p.DFid_papel = up.DFid_papel
        INNER JOIN sac.TBusuario u ON u.DFid_usuario = up.DFid_usuario
        WHERE p.DFcodigo_papel = 'administrador' 
        AND up.DFativo = 'S' 
        AND u.DFativo = 'S'
        AND (up.DFdata_expiracao IS NULL OR up.DFdata_expiracao > GETDATE());
        
        IF @admin_count = 0
        BEGIN
            THROW 50001, 'Não é possível remover o último administrador do sistema', 1;
        END
    END
END
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario_papel', NULL, 'Define o relacionamento N:N entre usuários e papéis do sistema';
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario_papel', 'DFid_usuario', 'ID do usuário';
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario_papel', 'DFid_papel', 'ID do papel atribuído';
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario_papel', 'DFdata_atribuicao', 'Data e hora da atribuição do papel';
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario_papel', 'DFdata_expiracao', 'Data de expiração do papel (NULL = sem expiração)';
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario_papel', 'DFid_usuario_atribuicao', 'Usuário que atribuiu o papel';
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario_papel', 'DFativo', 'Indica se a atribuição está ativa (S=Sim, N=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario_papel', 'DFobservacoes', 'Observações sobre a atribuição do papel';
GO

PRINT 'Trigger de validação de papel fixo criado com sucesso';
GO
