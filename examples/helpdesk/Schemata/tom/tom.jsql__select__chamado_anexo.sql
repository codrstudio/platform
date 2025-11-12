CREATE OR ALTER PROCEDURE tom.jsql__select__chamado_anexo
    @input NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        DECLARE @operation NVARCHAR(50) = JSON_VALUE(@input, '$.operation');
        DECLARE @entity NVARCHAR(50) = JSON_VALUE(@input, '$.entity');

        IF @operation != 'query' OR @entity != 'chamado_anexo'
        BEGIN
            SELECT 400 AS code, 'Invalid operation or entity' AS message, NULL AS data
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
            RETURN;
        END

        DECLARE @filter NVARCHAR(MAX) = JSON_QUERY(@input, '$.filter');
        DECLARE @limit INT = ISNULL(JSON_VALUE(@input, '$.args.limit'), 100);
        DECLARE @offset INT = ISNULL(JSON_VALUE(@input, '$.args.offset'), 0);

        SELECT
            t.DFid_anexo AS id_anexo,
            t.DFid_chamado AS id_chamado,
            t.DFnome_arquivo AS nome_arquivo,
            t.DFid_historico AS id_historico,
            t.DFid_comentario AS id_comentario,
            t.DFtipo_mime AS tipo_mime,
            t.DFtamanho_arquivo AS tamanho_arquivo,
            t.DFurl_arquivo AS url_arquivo,
            t.DFdata_upload AS data_upload
        INTO #temp_result
        FROM tom.TBchamado_anexo t WITH (NOLOCK)
        WHERE 1=1
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.id_anexo.eq') IS NULL OR t.DFid_anexo = JSON_VALUE(@filter, '$.id_anexo.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.id_chamado.eq') IS NULL OR t.DFid_chamado = JSON_VALUE(@filter, '$.id_chamado.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.id_historico.eq') IS NULL OR t.DFid_historico = JSON_VALUE(@filter, '$.id_historico.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.id_comentario.eq') IS NULL OR t.DFid_comentario = JSON_VALUE(@filter, '$.id_comentario.eq'))
        ORDER BY t.DFdata_upload DESC
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