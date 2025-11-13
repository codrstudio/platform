/*
TBpapel_permissao - Tabela de permissões por papel (ATUALIZADA)
Sistema HelpDesk - Define permissões em nível de papel (true/false/null)
Atualizada: Usando BIT para true/false/null
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'sac.TBpapel_permissao') IS NULL
BEGIN
    CREATE TABLE sac.TBpapel_permissao (
        DFid_papel INTEGER NOT NULL,
        DFid_permissao INTEGER NOT NULL,
        DFpermitido BIT NULL, -- true=Permitido, false=Negado, null=Indefinido
        DFdata_atribuicao DATETIME NOT NULL DEFAULT GETDATE(),
        DFid_usuario_atribuicao INTEGER NULL, -- Quem definiu a permissão
        DFobservacoes NVARCHAR(MAX) NULL,

        CONSTRAINT PK__sac_TBpapel_permissao PRIMARY KEY (DFid_papel, DFid_permissao)
    );
END
GO

-- Relacionamentos usando API
EXEC api.CRIAR_RELACAO 'sac.TBpapel_permissao', 'DFid_papel', 'sac.TBpapel', 'DFid_papel';
EXEC api.CRIAR_RELACAO 'sac.TBpapel_permissao', 'DFid_permissao', 'sac.TBpermissao', 'DFid_permissao';
EXEC api.CRIAR_RELACAO 'sac.TBpapel_permissao', 'DFid_usuario_atribuicao', 'sac.TBusuario', 'DFid_usuario';
GO

-- População inicial (idempotente) - Permissões padrão por papel
IF NOT EXISTS (SELECT 1 FROM sac.TBpapel_permissao)
BEGIN
    -- Permissões para ESPECTADOR (apenas visualização básica)
    INSERT INTO sac.TBpapel_permissao (DFid_papel, DFid_permissao, DFpermitido)
    SELECT 
        p.DFid_papel,
        perm.DFid_permissao,
        1 -- true = Permitido
    FROM sac.TBpapel p
    CROSS JOIN sac.TBpermissao perm
    WHERE p.DFcodigo_papel = 'espectador'
    AND perm.DFcodigo_permissao IN (
        'select__chamado__proprio',
        'select__contato',
        'select__cliente'
    );
    
    -- Permissões para GERENTE (visualização + alteração)
    INSERT INTO sac.TBpapel_permissao (DFid_papel, DFid_permissao, DFpermitido)
    SELECT 
        p.DFid_papel,
        perm.DFid_permissao,
        1 -- true = Permitido
    FROM sac.TBpapel p
    CROSS JOIN sac.TBpermissao perm
    WHERE p.DFcodigo_papel = 'gerente'
    AND perm.DFtipo_acao IN ('select', 'mutate')
    AND perm.DFcodigo_permissao NOT LIKE '%__remover'
    AND perm.DFcodigo_permissao NOT LIKE 'configure__%';
    
    -- Permissões para ADMINISTRADOR (tudo permitido)
    INSERT INTO sac.TBpapel_permissao (DFid_papel, DFid_permissao, DFpermitido)
    SELECT 
        p.DFid_papel,
        perm.DFid_permissao,
        1 -- true = Permitido
    FROM sac.TBpapel p
    CROSS JOIN sac.TBpermissao perm
    WHERE p.DFcodigo_papel = 'administrador';
    
    PRINT 'Permissões padrão por papel inseridas em sac.TBpapel_permissao';
END
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'sac.TBpapel_permissao', 'DFid_papel,DFid_permissao', 1; -- PK já criado
EXEC api.CRIAR_INDICE 'sac.TBpapel_permissao', 'DFid_permissao';
EXEC api.CRIAR_INDICE 'sac.TBpapel_permissao', 'DFpermitido';
EXEC api.CRIAR_INDICE 'sac.TBpapel_permissao', 'DFdata_atribuicao';
EXEC api.CRIAR_INDICE 'sac.TBpapel_permissao', 'DFid_usuario_atribuicao';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'sac.TBpapel_permissao', NULL, 'Define permissões específicas por papel (true=Permitido, false=Negado, null=Indefinido)';
EXEC api.CRIAR_DESCRICAO 'sac.TBpapel_permissao', 'DFid_papel', 'ID do papel';
EXEC api.CRIAR_DESCRICAO 'sac.TBpapel_permissao', 'DFid_permissao', 'ID da permissão';
EXEC api.CRIAR_DESCRICAO 'sac.TBpapel_permissao', 'DFpermitido', 'Status da permissão (true=Permitido, false=Negado, null=Indefinido)';
EXEC api.CRIAR_DESCRICAO 'sac.TBpapel_permissao', 'DFdata_atribuicao', 'Data e hora da definição da permissão';
EXEC api.CRIAR_DESCRICAO 'sac.TBpapel_permissao', 'DFid_usuario_atribuicao', 'Usuário que definiu a permissão';
EXEC api.CRIAR_DESCRICAO 'sac.TBpapel_permissao', 'DFobservacoes', 'Observações sobre a permissão';
GO
