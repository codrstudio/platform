CREATE OR ALTER PROCEDURE tom.jsql__select__chamado_comentario
    @input NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        DECLARE @operation NVARCHAR(50) = JSON_VALUE(@input, '$.operation');
        DECLARE @entity NVARCHAR(50) = JSON_VALUE(@input, '$.entity');

        IF @operation != 'query' OR @entity != 'chamado_comentario'
        BEGIN
            SELECT 400 AS code, 'Invalid operation or entity' AS message, NULL AS data
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
            RETURN;
        END

        DECLARE @filter NVARCHAR(MAX) = JSON_QUERY(@input, '$.filter');
        DECLARE @limit INT = ISNULL(JSON_VALUE(@input, '$.args.limit'), 100);
        DECLARE @offset INT = ISNULL(JSON_VALUE(@input, '$.args.offset'), 0);

        SELECT
            t.DFid_comentario AS id_comentario,
            t.DFid_chamado AS id_chamado,
            t.DFtexto_comentario AS texto_comentario,
            t.DFdata_hora_comentario AS data_hora_comentario,
            t.DFid_atendente AS id_atendente
        INTO #temp_result
        FROM tom.TBchamado_comentario t WITH (NOLOCK)
        WHERE 1=1
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.id_comentario.eq') IS NULL OR t.DFid_comentario = JSON_VALUE(@filter, '$.id_comentario.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.id_chamado.eq') IS NULL OR t.DFid_chamado = JSON_VALUE(@filter, '$.id_chamado.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.id_atendente.eq') IS NULL OR t.DFid_atendente = JSON_VALUE(@filter, '$.id_atendente.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.data_hora_comentario.gte') IS NULL OR t.DFdata_hora_comentario >= JSON_VALUE(@filter, '$.data_hora_comentario.gte'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.data_hora_comentario.lte') IS NULL OR t.DFdata_hora_comentario <= JSON_VALUE(@filter, '$.data_hora_comentario.lte'))
        ORDER BY t.DFdata_hora_comentario DESC
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