CREATE OR ALTER PROCEDURE tom.jsql__select__atendente
    @input NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        DECLARE @operation NVARCHAR(50) = JSON_VALUE(@input, '$.operation');
        DECLARE @entity NVARCHAR(50) = JSON_VALUE(@input, '$.entity');

        IF @operation != 'query' OR @entity != 'atendente'
        BEGIN
            SELECT 400 AS code, 'Invalid operation or entity' AS message, NULL AS data
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
            RETURN;
        END

        DECLARE @filter NVARCHAR(MAX) = JSON_QUERY(@input, '$.filter');
        DECLARE @limit INT = ISNULL(JSON_VALUE(@input, '$.args.limit'), 100);
        DECLARE @offset INT = ISNULL(JSON_VALUE(@input, '$.args.offset'), 0);

        SELECT
            t.DFid_atendente AS id_atendente,
            t.DFnome_completo AS nome_completo,
            t.DFemail AS email,
            t.DFassinatura_email AS assinatura_email,
            t.DFnome_exibicao AS nome_exibicao,
            t.DFsituacao_conexao_chat AS situacao_conexao_chat,
            t.DFativo AS ativo,
            t.DFsituacao_disponibilidade_chat AS situacao_disponibilidade_chat,
            t.DFgerente_geral AS gerente_geral
        INTO #temp_result
        FROM tom.TBatendente t WITH (NOLOCK)
        WHERE 1=1
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.id_atendente.eq') IS NULL OR t.DFid_atendente = JSON_VALUE(@filter, '$.id_atendente.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.email.eq') IS NULL OR t.DFemail = JSON_VALUE(@filter, '$.email.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.email.like') IS NULL OR t.DFemail LIKE JSON_VALUE(@filter, '$.email.like'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.ativo.eq') IS NULL OR t.DFativo = JSON_VALUE(@filter, '$.ativo.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.gerente_geral.eq') IS NULL OR t.DFgerente_geral = JSON_VALUE(@filter, '$.gerente_geral.eq'))
        ORDER BY t.DFid_atendente
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