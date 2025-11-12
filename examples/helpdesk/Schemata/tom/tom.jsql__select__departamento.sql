CREATE OR ALTER PROCEDURE tom.jsql__select__departamento
    @input NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        DECLARE @operation NVARCHAR(50) = JSON_VALUE(@input, '$.operation');
        DECLARE @entity NVARCHAR(50) = JSON_VALUE(@input, '$.entity');

        IF @operation != 'query' OR @entity != 'departamento'
        BEGIN
            SELECT 400 AS code, 'Invalid operation or entity' AS message, NULL AS data
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
            RETURN;
        END

        DECLARE @filter NVARCHAR(MAX) = JSON_QUERY(@input, '$.filter');
        DECLARE @limit INT = ISNULL(JSON_VALUE(@input, '$.args.limit'), 100);
        DECLARE @offset INT = ISNULL(JSON_VALUE(@input, '$.args.offset'), 0);

        SELECT
            t.DFid_departamento AS id_departamento,
            t.DFnome_departamento AS nome_departamento,
            t.DFidentificador_produto AS identificador_produto,
            t.DFenvia_email_geral AS envia_email_geral,
            t.DFenvia_email_equipe AS envia_email_equipe,
            t.DFtemplate_email_situacao AS template_email_situacao,
            t.DFativo AS ativo,
            t.DFmensagem_inicial AS mensagem_inicial,
            t.DFprivativo AS privativo,
            t.DFemail_departamento AS email_departamento,
            t.DFenvia_email_departamento AS envia_email_departamento,
            t.DFemail_validado AS email_validado,
            t.DFdisponivel_chamado AS disponivel_chamado
        INTO #temp_result
        FROM tom.TBdepartamento t WITH (NOLOCK)
        WHERE 1=1
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.id_departamento.eq') IS NULL OR t.DFid_departamento = JSON_VALUE(@filter, '$.id_departamento.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.identificador_produto.eq') IS NULL OR t.DFidentificador_produto = JSON_VALUE(@filter, '$.identificador_produto.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.ativo.eq') IS NULL OR t.DFativo = JSON_VALUE(@filter, '$.ativo.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.privativo.eq') IS NULL OR t.DFprivativo = JSON_VALUE(@filter, '$.privativo.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.disponivel_chamado.eq') IS NULL OR t.DFdisponivel_chamado = JSON_VALUE(@filter, '$.disponivel_chamado.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.nome_departamento.like') IS NULL OR t.DFnome_departamento LIKE JSON_VALUE(@filter, '$.nome_departamento.like'))
        ORDER BY t.DFnome_departamento ASC
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