CREATE OR ALTER PROCEDURE tom.jsql__select__chamado_historico
    @input NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        DECLARE @operation NVARCHAR(50) = JSON_VALUE(@input, '$.operation');
        DECLARE @entity NVARCHAR(50) = JSON_VALUE(@input, '$.entity');

        IF @operation != 'query' OR @entity != 'chamado_historico'
        BEGIN
            SELECT 400 AS code, 'Invalid operation or entity' AS message, NULL AS data
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
            RETURN;
        END

        DECLARE @filter NVARCHAR(MAX) = JSON_QUERY(@input, '$.filter');
        DECLARE @limit INT = ISNULL(JSON_VALUE(@input, '$.args.limit'), 100);
        DECLARE @offset INT = ISNULL(JSON_VALUE(@input, '$.args.offset'), 0);

        SELECT
            t.DFid_historico AS id_historico,
            t.DFid_chamado AS id_chamado,
            t.DFconteudo_historico AS conteudo_historico,
            t.DFdata_hora_historico AS data_hora_historico,
            t.DFid_situacao_chamado AS id_situacao_chamado,
            t.DFid_contato AS id_contato,
            t.DFid_atendente AS id_atendente,
            t.DFtipo_mime AS tipo_mime
        INTO #temp_result
        FROM tom.TBchamado_historico t WITH (NOLOCK)
        WHERE 1=1
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.id_historico.eq') IS NULL OR t.DFid_historico = JSON_VALUE(@filter, '$.id_historico.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.id_chamado.eq') IS NULL OR t.DFid_chamado = JSON_VALUE(@filter, '$.id_chamado.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.id_situacao_chamado.eq') IS NULL OR t.DFid_situacao_chamado = JSON_VALUE(@filter, '$.id_situacao_chamado.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.id_contato.eq') IS NULL OR t.DFid_contato = JSON_VALUE(@filter, '$.id_contato.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.id_atendente.eq') IS NULL OR t.DFid_atendente = JSON_VALUE(@filter, '$.id_atendente.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.data_hora_historico.gte') IS NULL OR t.DFdata_hora_historico >= JSON_VALUE(@filter, '$.data_hora_historico.gte'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.data_hora_historico.lte') IS NULL OR t.DFdata_hora_historico <= JSON_VALUE(@filter, '$.data_hora_historico.lte'))
        ORDER BY t.DFdata_hora_historico DESC
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