CREATE OR ALTER PROCEDURE tom.jsql__select__contato
    @input NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        DECLARE @operation NVARCHAR(50) = JSON_VALUE(@input, '$.operation');
        DECLARE @entity NVARCHAR(50) = JSON_VALUE(@input, '$.entity');

        IF @operation != 'query' OR @entity != 'contato'
        BEGIN
            SELECT 400 AS code, 'Invalid operation or entity' AS message, NULL AS data
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
            RETURN;
        END

        DECLARE @filter NVARCHAR(MAX) = JSON_QUERY(@input, '$.filter');
        DECLARE @limit INT = ISNULL(JSON_VALUE(@input, '$.args.limit'), 100);
        DECLARE @offset INT = ISNULL(JSON_VALUE(@input, '$.args.offset'), 0);

        SELECT
            t.DFid_contato AS id_contato,
            t.DFnome_completo AS nome_completo,
            t.DFemail AS email,
            t.DFidentificador_conta AS identificador_conta,
            t.DFtelefone AS telefone,
            t.DFid_organizacao AS id_organizacao,
            t.DFlimite_chamados_mensal AS limite_chamados_mensal,
            t.DFproibido_criar_chamados AS proibido_criar_chamados,
            t.DFid_atendente_responsavel AS id_atendente_responsavel,
            t.DFcampos_personalizados AS campos_personalizados,
            t.DFempresa_informada AS empresa_informada,
            t.DFsetor_informado AS setor_informado
        INTO #temp_result
        FROM tom.TBcontato t WITH (NOLOCK)
        WHERE 1=1
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.id_contato.eq') IS NULL OR t.DFid_contato = JSON_VALUE(@filter, '$.id_contato.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.email.eq') IS NULL OR t.DFemail = JSON_VALUE(@filter, '$.email.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.email.like') IS NULL OR t.DFemail LIKE JSON_VALUE(@filter, '$.email.like'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.identificador_conta.eq') IS NULL OR t.DFidentificador_conta = JSON_VALUE(@filter, '$.identificador_conta.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.id_organizacao.eq') IS NULL OR t.DFid_organizacao = JSON_VALUE(@filter, '$.id_organizacao.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.id_atendente_responsavel.eq') IS NULL OR t.DFid_atendente_responsavel = JSON_VALUE(@filter, '$.id_atendente_responsavel.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.proibido_criar_chamados.eq') IS NULL OR t.DFproibido_criar_chamados = JSON_VALUE(@filter, '$.proibido_criar_chamados.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.nome_completo.like') IS NULL OR t.DFnome_completo LIKE JSON_VALUE(@filter, '$.nome_completo.like'))
        ORDER BY t.DFnome_completo ASC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY;

        SELECT
            200 AS code,
            CAST(NULL AS NVARCHAR(MAX)) AS message,
            (SELECT * FROM #temp_result FOR JSON PATH) AS data
        FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;

        DROP TABLE #temp_result;

    END TRY
    BEGIN CATCH
        SELECT
            500 AS code,
            ERROR_MESSAGE() AS message,
            NULL AS data
        FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
    END CATCH
END;
GO