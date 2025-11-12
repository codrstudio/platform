/*
PERMITIDO - View de permissões efetivas por usuário
Sistema HelpDesk - Mostra resultado final das permissões considerando papel + usuário
Lógica: false em qualquer um = false, true em qualquer um = true, senão = false
*/

CREATE OR ALTER VIEW sac.TBpermissao_efetiva AS
SELECT 
    u.DFid_usuario,
    u.DFemail_usuario,
    u.DFnome_exibicao,
    perm.DFid_permissao,
    perm.DFcodigo_permissao,
    perm.DFnome_permissao,
    perm.DFcategoria,
    perm.DFtipo_acao,
    perm.DFrecurso,
    perm.DFoperacao,
    
    -- Permissão consolidada dos papéis
    CASE 
        WHEN COUNT(CASE WHEN pp.DFpermitido = 0 THEN 1 END) > 0 THEN 0 -- false
        WHEN COUNT(CASE WHEN pp.DFpermitido = 1 THEN 1 END) > 0 THEN 1 -- true
        ELSE NULL -- indefinido
    END AS permissao_papel,
    
    -- Permissão específica do usuário
    uper.DFpermitido AS permissao_usuario,
    
    -- Permissão efetiva (resultado final)
    CASE 
        WHEN uper.DFpermitido = 0 OR 
             (CASE 
                WHEN COUNT(CASE WHEN pp.DFpermitido = 0 THEN 1 END) > 0 THEN 0
                WHEN COUNT(CASE WHEN pp.DFpermitido = 1 THEN 1 END) > 0 THEN 1
                ELSE NULL
              END) = 0 THEN 0 -- false (negado)
        WHEN uper.DFpermitido = 1 OR 
             (CASE 
                WHEN COUNT(CASE WHEN pp.DFpermitido = 0 THEN 1 END) > 0 THEN 0
                WHEN COUNT(CASE WHEN pp.DFpermitido = 1 THEN 1 END) > 0 THEN 1
                ELSE NULL
              END) = 1 THEN 1 -- true (permitido)
        ELSE 0 -- indefinido = negado
    END AS permitido,
    
    -- Papéis do usuário (concatenados)
    STUFF((
        SELECT ', ' + p.DFnome_papel
        FROM sac.TBusuario_papel up2
        INNER JOIN sac.TBpapel p ON p.DFid_papel = up2.DFid_papel
        WHERE up2.DFid_usuario = u.DFid_usuario
        AND up2.DFativo = 1
        AND p.DFativo = 1
        AND (up2.DFdata_expiracao IS NULL OR up2.DFdata_expiracao > GETDATE())
        FOR XML PATH('')
    ), 1, 2, '') AS papeis_usuario,
    
    -- Metadados
    uper.DFdata_expiracao AS permissao_usuario_expira_em,
    uper.DFmotivo AS motivo_permissao_usuario

FROM sac.TBusuario u
CROSS JOIN sac.TBpermissao perm
LEFT JOIN sac.TBusuario_papel up ON up.DFid_usuario = u.DFid_usuario
    AND up.DFativo = 1
    AND (up.DFdata_expiracao IS NULL OR up.DFdata_expiracao > GETDATE())
LEFT JOIN sac.TBpapel p ON p.DFid_papel = up.DFid_papel AND p.DFativo = 1
LEFT JOIN sac.TBpapel_permissao pp ON pp.DFid_papel = p.DFid_papel AND pp.DFid_permissao = perm.DFid_permissao
LEFT JOIN sac.TBusuario_permissao uper ON uper.DFid_usuario = u.DFid_usuario 
    AND uper.DFid_permissao = perm.DFid_permissao
    AND (uper.DFdata_expiracao IS NULL OR uper.DFdata_expiracao > GETDATE())

WHERE u.DFativo = 1
AND perm.DFativo = 1

GROUP BY 
    u.DFid_usuario, u.DFemail_usuario, u.DFnome_exibicao,
    perm.DFid_permissao, perm.DFcodigo_permissao, perm.DFnome_permissao,
    perm.DFcategoria, perm.DFtipo_acao, perm.DFrecurso, perm.DFoperacao,
    uper.DFpermitido, uper.DFdata_expiracao, uper.DFmotivo;

GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'sac.TBpermissao_efetiva', NULL, 'View que mostra as permissões efetivas de todos os usuários considerando papéis e overrides individuais';
GO

PRINT 'View sac.TBpermissao_efetiva criada com sucesso';
GO
