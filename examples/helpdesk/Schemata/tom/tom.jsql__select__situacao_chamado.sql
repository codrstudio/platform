CREATE OR ALTER PROCEDURE tom.jsql__select__situacao_chamado
    @input NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        DECLARE @operation NVARCHAR(50) = JSON_VALUE(@input, '$.operation');
        DECLARE @entity NVARCHAR(50) = JSON_VALUE(@input, '$.entity');

        IF @operation != 'query' OR @entity != 'situacao_chamado'
        BEGIN
            SELECT 400 AS code, 'Invalid operation or entity' AS message, NULL AS data
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
            RETURN;
        END

        DECLARE @filter NVARCHAR(MAX) = JSON_QUERY(@input, '$.filter');
        DECLARE @limit INT = ISNULL(JSON_VALUE(@input, '$.args.limit'), 100);
        DECLARE @offset INT = ISNULL(JSON_VALUE(@input, '$.args.offset'), 0);

        SELECT
            t.DFid_situacao_chamado AS id_situacao_chamado,
            t.DFdescricao_situacao AS descricao_situacao,
            t.DFinstrucoes_situacao AS instrucoes_situacao
        INTO #temp_result
        FROM tom.TBsituacao_chamado t WITH (NOLOCK)
        WHERE 1=1
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.id_situacao_chamado.eq') IS NULL OR t.DFid_situacao_chamado = JSON_VALUE(@filter, '$.id_situacao_chamado.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.descricao_situacao.eq') IS NULL OR t.DFdescricao_situacao = JSON_VALUE(@filter, '$.descricao_situacao.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.descricao_situacao.like') IS NULL OR t.DFdescricao_situacao LIKE JSON_VALUE(@filter, '$.descricao_situacao.like'))
        ORDER BY t.DFid_situacao_chamado ASC
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