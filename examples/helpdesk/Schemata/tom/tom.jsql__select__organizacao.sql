CREATE OR ALTER PROCEDURE tom.jsql__select__organizacao
    @input NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        DECLARE @operation NVARCHAR(50) = JSON_VALUE(@input, '$.operation');
        DECLARE @entity NVARCHAR(50) = JSON_VALUE(@input, '$.entity');

        IF @operation != 'query' OR @entity != 'organizacao'
        BEGIN
            SELECT 400 AS code, 'Invalid operation or entity' AS message, NULL AS data
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
            RETURN;
        END

        DECLARE @filter NVARCHAR(MAX) = JSON_QUERY(@input, '$.filter');
        DECLARE @limit INT = ISNULL(JSON_VALUE(@input, '$.args.limit'), 100);
        DECLARE @offset INT = ISNULL(JSON_VALUE(@input, '$.args.offset'), 0);

        SELECT
            t.DFid_organizacao AS id_organizacao,
            t.DFnome_organizacao AS nome_organizacao,
            t.DFsite_web AS site_web,
            t.DFtelefone AS telefone,
            t.DFemail AS email,
            t.DFlimite_chamados_mensal AS limite_chamados_mensal,
            t.DFproibido_criar_chamados AS proibido_criar_chamados,
            t.DFcampos_personalizados AS campos_personalizados
        INTO #temp_result
        FROM tom.TBorganizacao t WITH (NOLOCK)
        WHERE 1=1
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.id_organizacao.eq') IS NULL OR t.DFid_organizacao = JSON_VALUE(@filter, '$.id_organizacao.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.nome_organizacao.eq') IS NULL OR t.DFnome_organizacao = JSON_VALUE(@filter, '$.nome_organizacao.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.nome_organizacao.like') IS NULL OR t.DFnome_organizacao LIKE JSON_VALUE(@filter, '$.nome_organizacao.like'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.email.eq') IS NULL OR t.DFemail = JSON_VALUE(@filter, '$.email.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.proibido_criar_chamados.eq') IS NULL OR t.DFproibido_criar_chamados = JSON_VALUE(@filter, '$.proibido_criar_chamados.eq'))
        ORDER BY t.DFnome_organizacao ASC
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