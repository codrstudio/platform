CREATE OR ALTER PROCEDURE tom.jsql__select__atendimento
    @input NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        DECLARE @operation NVARCHAR(50) = JSON_VALUE(@input, '$.operation');
        DECLARE @entity NVARCHAR(50) = JSON_VALUE(@input, '$.entity');

        IF @operation != 'query' OR @entity != 'atendimento'
        BEGIN
            SELECT 400 AS code, 'Invalid operation or entity' AS message, NULL AS data
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
            RETURN;
        END

        DECLARE @filter NVARCHAR(MAX) = JSON_QUERY(@input, '$.filter');
        DECLARE @limit INT = ISNULL(JSON_VALUE(@input, '$.args.limit'), 100);
        DECLARE @offset INT = ISNULL(JSON_VALUE(@input, '$.args.offset'), 0);

        SELECT
            t.DFid_atendimento AS id_atendimento,
            t.DFnome_cliente AS nome_cliente,
            t.DFemail_cliente AS email_cliente,
            t.DFdata_inicio AS data_inicio,
            t.DFavaliacao_cliente AS avaliacao_cliente,
            t.DFobservacao_atendimento AS observacao_atendimento,
            t.DFsituacao_atendimento AS situacao_atendimento,
            t.DFpagina_referencia AS pagina_referencia,
            t.DFcidade_acesso AS cidade_acesso,
            t.DFestado_acesso AS estado_acesso,
            t.DFpais_acesso AS pais_acesso,
            t.DFendereco_ip AS endereco_ip,
            t.DFid_contato AS id_contato,
            t.DFid_atendente AS id_atendente,
            t.DFcampos_personalizados AS campos_personalizados,
            t.DFmodulo_wms AS modulo_wms,
            t.DFmodulo_bi AS modulo_bi,
            t.DFcomplexidade AS complexidade,
            t.DFmodulo_frente_loja AS modulo_frente_loja,
            t.DFmodulo_erp_director AS modulo_erp_director,
            t.DFmodulo_fiscal AS modulo_fiscal
        INTO #temp_result
        FROM tom.TBatendimento t WITH (NOLOCK)
        WHERE 1=1
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.id_atendimento.eq') IS NULL OR t.DFid_atendimento = JSON_VALUE(@filter, '$.id_atendimento.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.id_contato.eq') IS NULL OR t.DFid_contato = JSON_VALUE(@filter, '$.id_contato.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.id_atendente.eq') IS NULL OR t.DFid_atendente = JSON_VALUE(@filter, '$.id_atendente.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.email_cliente.eq') IS NULL OR t.DFemail_cliente = JSON_VALUE(@filter, '$.email_cliente.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.email_cliente.like') IS NULL OR t.DFemail_cliente LIKE JSON_VALUE(@filter, '$.email_cliente.like'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.situacao_atendimento.eq') IS NULL OR t.DFsituacao_atendimento = JSON_VALUE(@filter, '$.situacao_atendimento.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.data_inicio.gte') IS NULL OR t.DFdata_inicio >= JSON_VALUE(@filter, '$.data_inicio.gte'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.data_inicio.lte') IS NULL OR t.DFdata_inicio <= JSON_VALUE(@filter, '$.data_inicio.lte'))
        ORDER BY t.DFid_atendimento DESC
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