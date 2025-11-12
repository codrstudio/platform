CREATE OR ALTER PROCEDURE tom.jsql__select__categoria
    @input NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        DECLARE @operation NVARCHAR(50) = JSON_VALUE(@input, '$.operation');
        DECLARE @entity NVARCHAR(50) = JSON_VALUE(@input, '$.entity');

        IF @operation != 'query' OR @entity != 'categoria'
        BEGIN
            SELECT 400 AS code, 'Invalid operation or entity' AS message, NULL AS data
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
            RETURN;
        END

        DECLARE @filter NVARCHAR(MAX) = JSON_QUERY(@input, '$.filter');
        DECLARE @limit INT = ISNULL(JSON_VALUE(@input, '$.args.limit'), 100);
        DECLARE @offset INT = ISNULL(JSON_VALUE(@input, '$.args.offset'), 0);

        SELECT
            t.DFid_categoria AS id_categoria,
            t.DFtitulo_categoria AS titulo_categoria,
            t.DFidentificador_categoria AS identificador_categoria,
            t.DFnivel_prioridade AS nivel_prioridade
        INTO #temp_result
        FROM tom.TBcategoria t WITH (NOLOCK)
        WHERE 1=1
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.id_categoria.eq') IS NULL OR t.DFid_categoria = JSON_VALUE(@filter, '$.id_categoria.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.identificador_categoria.eq') IS NULL OR t.DFidentificador_categoria = JSON_VALUE(@filter, '$.identificador_categoria.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.titulo_categoria.like') IS NULL OR t.DFtitulo_categoria LIKE JSON_VALUE(@filter, '$.titulo_categoria.like'))
        ORDER BY t.DFnivel_prioridade DESC, t.DFtitulo_categoria ASC
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