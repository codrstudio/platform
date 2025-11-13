/*
TBrefresh_token - Tabela de tokens de atualização (refresh tokens)
Sistema HelpDesk - Gestão de autenticação com token rotation
Implementa: Refresh Token Rotation, detecção de reuso, família de tokens
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'sac.TBrefresh_token') IS NULL
BEGIN
    CREATE TABLE sac.TBrefresh_token (
        DFid BIGINT IDENTITY(1,1) NOT NULL,
        DFid_usuario INT NOT NULL,  
        DFtoken_hash VARCHAR(64) NOT NULL,
        DFfamilia_id VARCHAR(36) NOT NULL,
        DFexpira_em DATETIME NOT NULL,
        DFcriado_em DATETIME NOT NULL DEFAULT GETDATE(),
        DFusado_em DATETIME NULL,
        DFrevogado BIT NOT NULL DEFAULT 0,
        DFdevice_info NVARCHAR(500) NULL,
        DFip_origem VARCHAR(45) NULL,

        CONSTRAINT PK__sac_TBrefresh_token PRIMARY KEY (DFid),
        CONSTRAINT UQ__sac_TBrefresh_token__DFtoken_hash UNIQUE (DFtoken_hash)
    );
END
GO

-- Relações usando API
EXEC api.CRIAR_RELACAO 'sac.TBrefresh_token', 'DFid_usuario', 'sac.TBusuario', 'DFid_usuario', @on_delete='CASCADE', @on_update='NO_ACTION';
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'sac.TBrefresh_token', 'DFtoken_hash', 1; -- UNIQUE já criado via constraint
EXEC api.CRIAR_INDICE 'sac.TBrefresh_token', 'DFid_usuario';
EXEC api.CRIAR_INDICE 'sac.TBrefresh_token', 'DFfamilia_id';
EXEC api.CRIAR_INDICE 'sac.TBrefresh_token', 'DFexpira_em';
EXEC api.CRIAR_INDICE 'sac.TBrefresh_token', 'DFrevogado';
EXEC api.CRIAR_INDICE 'sac.TBrefresh_token', 'DFusado_em';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'sac.TBrefresh_token', NULL, 'Armazena refresh tokens com suporte a rotation, detecção de reuso e revogação em família';
EXEC api.CRIAR_DESCRICAO 'sac.TBrefresh_token', 'DFid', 'Código único do registro (BIGINT para suportar alto volume)';
EXEC api.CRIAR_DESCRICAO 'sac.TBrefresh_token', 'DFid_usuario', 'Referência ao usuário proprietário do token';
EXEC api.CRIAR_DESCRICAO 'sac.TBrefresh_token', 'DFtoken_hash', 'Hash SHA-256 do refresh token (64 chars hex)';
EXEC api.CRIAR_DESCRICAO 'sac.TBrefresh_token', 'DFfamilia_id', 'UUID da família de tokens (chain de rotação)';
EXEC api.CRIAR_DESCRICAO 'sac.TBrefresh_token', 'DFexpira_em', 'Data e hora de expiração do token (padrão: 7 dias)';
EXEC api.CRIAR_DESCRICAO 'sac.TBrefresh_token', 'DFcriado_em', 'Data e hora de criação do token';
EXEC api.CRIAR_DESCRICAO 'sac.TBrefresh_token', 'DFusado_em', 'Data e hora do uso (NULL = não usado, preenchido = usado uma vez)';
EXEC api.CRIAR_DESCRICAO 'sac.TBrefresh_token', 'DFrevogado', 'Se o token foi revogado (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBrefresh_token', 'DFdevice_info', 'Informações opcionais do dispositivo (User-Agent)';
EXEC api.CRIAR_DESCRICAO 'sac.TBrefresh_token', 'DFip_origem', 'IP de origem da criação do token (IPv4 ou IPv6)';
GO
