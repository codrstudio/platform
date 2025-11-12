/*
TBusuario_permissao - Tabela de permissões específicas por usuário (ATUALIZADA)
Sistema HelpDesk - Override de permissões em nível individual (true/false/null)
Atualizada: Usando BIT para true/false/null
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'sac.TBusuario_permissao') IS NULL
BEGIN
    CREATE TABLE sac.TBusuario_permissao (
        DFid_usuario INTEGER NOT NULL,
        DFid_permissao INTEGER NOT NULL,
        DFpermitido BIT NULL, -- true=Permitido, false=Negado, null=Indefinido
        DFdata_atribuicao DATETIME NOT NULL DEFAULT GETDATE(),
        DFdata_expiracao DATETIME NULL, -- NULL = sem expiração
        DFid_usuario_atribuicao INTEGER NULL, -- Quem definiu a permissão
        DFmotivo NVARCHAR(500) NULL, -- Motivo da permissão específica
        DFobservacoes NVARCHAR(MAX) NULL,

        CONSTRAINT PK__sac_TBusuario_permissao PRIMARY KEY (DFid_usuario, DFid_permissao)
    );
END
GO

-- Relacionamentos usando API
EXEC api.CRIAR_RELACAO 'sac.TBusuario_permissao', 'DFid_usuario', 'sac.TBusuario', 'DFid_usuario';
EXEC api.CRIAR_RELACAO 'sac.TBusuario_permissao', 'DFid_permissao', 'sac.TBpermissao', 'DFid_permissao';
EXEC api.CRIAR_RELACAO 'sac.TBusuario_permissao', 'DFid_usuario_atribuicao', 'sac.TBusuario', 'DFid_usuario';
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'sac.TBusuario_permissao', 'DFid_usuario,DFid_permissao', 1; -- PK já criado
EXEC api.CRIAR_INDICE 'sac.TBusuario_permissao', 'DFid_permissao';
EXEC api.CRIAR_INDICE 'sac.TBusuario_permissao', 'DFpermitido';
EXEC api.CRIAR_INDICE 'sac.TBusuario_permissao', 'DFdata_atribuicao';
EXEC api.CRIAR_INDICE 'sac.TBusuario_permissao', 'DFdata_expiracao';
EXEC api.CRIAR_INDICE 'sac.TBusuario_permissao', 'DFid_usuario_atribuicao';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario_permissao', NULL, 'Define permissões específicas por usuário que sobrescrevem as permissões do papel';
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario_permissao', 'DFid_usuario', 'ID do usuário';
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario_permissao', 'DFid_permissao', 'ID da permissão';
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario_permissao', 'DFpermitido', 'Status da permissão (true=Permitido, false=Negado, null=Indefinido)';
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario_permissao', 'DFdata_atribuicao', 'Data e hora da definição da permissão';
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario_permissao', 'DFdata_expiracao', 'Data de expiração da permissão (NULL = sem expiração)';
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario_permissao', 'DFid_usuario_atribuicao', 'Usuário que definiu a permissão';
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario_permissao', 'DFmotivo', 'Motivo da permissão específica';
EXEC api.CRIAR_DESCRICAO 'sac.TBusuario_permissao', 'DFobservacoes', 'Observações sobre a permissão';
GO
