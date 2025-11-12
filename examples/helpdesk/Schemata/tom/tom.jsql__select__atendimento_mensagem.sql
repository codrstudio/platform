CREATE OR ALTER PROCEDURE tom.jsql__select__atendimento_mensagem
    @input NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        DECLARE @operation NVARCHAR(50) = JSON_VALUE(@input, '$.operation');
        DECLARE @entity NVARCHAR(50) = JSON_VALUE(@input, '$.entity');

        IF @operation != 'query' OR @entity != 'atendimento_mensagem'
        BEGIN
            SELECT 400 AS code, 'Invalid operation or entity' AS message, NULL AS data
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
            RETURN;
        END

        DECLARE @filter NVARCHAR(MAX) = JSON_QUERY(@input, '$.filter');
        DECLARE @limit INT = ISNULL(JSON_VALUE(@input, '$.args.limit'), 100);
        DECLARE @offset INT = ISNULL(JSON_VALUE(@input, '$.args.offset'), 0);

        SELECT
            t.DFid_mensagem_atendimento AS id_mensagem_atendimento,
            t.DFid_atendimento AS id_atendimento,
            t.DFconteudo_mensagem AS conteudo_mensagem,
            t.DFdata_hora_envio AS data_hora_envio,
            t.DFtipo_remetente AS tipo_remetente,
            t.DFcaminho_arquivo AS caminho_arquivo,
            t.DFtipo_mime_arquivo AS tipo_mime_arquivo
        INTO #temp_result
        FROM tom.TBatendimento_mensagem t WITH (NOLOCK)
        WHERE 1=1
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.id_mensagem_atendimento.eq') IS NULL OR t.DFid_mensagem_atendimento = JSON_VALUE(@filter, '$.id_mensagem_atendimento.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.id_atendimento.eq') IS NULL OR t.DFid_atendimento = JSON_VALUE(@filter, '$.id_atendimento.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.tipo_remetente.eq') IS NULL OR t.DFtipo_remetente = JSON_VALUE(@filter, '$.tipo_remetente.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.data_hora_envio.gte') IS NULL OR t.DFdata_hora_envio >= JSON_VALUE(@filter, '$.data_hora_envio.gte'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.data_hora_envio.lte') IS NULL OR t.DFdata_hora_envio <= JSON_VALUE(@filter, '$.data_hora_envio.lte'))
        ORDER BY t.DFdata_hora_envio DESC
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