-- =============================================
-- Procedure: sac.test_jsql__select__tag
-- TESTE REAL v4: Detecta bugs de OFFSET com múltiplos filtros
-- USA: tag + ativo + LIMIT + OFFSET + ORDER BY
-- =============================================

IF OBJECT_ID(N'sac.test_jsql__select__tag', N'P') IS NULL
BEGIN
    EXEC('CREATE PROCEDURE sac.test_jsql__select__tag AS SELECT 1');
END
GO

ALTER PROCEDURE sac.test_jsql__select__tag
AS
BEGIN
    SET NOCOUNT ON;

    CREATE TABLE #test_results (
        test_case NVARCHAR(100),
        status NVARCHAR(10),
        validation_error NVARCHAR(MAX)
    );

    DECLARE @result NVARCHAR(MAX);
    DECLARE @code INT;
    DECLARE @data NVARCHAR(MAX);
    DECLARE @data_count INT;
    DECLARE @error NVARCHAR(MAX);

    -- =============================================
    -- TC1: MÚLTIPLOS FILTROS + OFFSET (DETECTA BUG!)
    -- Usa tag + ativo + offset para forçar código bugado
    -- =============================================
    BEGIN TRY
        EXEC sac.jsql__select__tag
            @jsql = N'{"select":"tag","where":{"tag":{"like":"%"},"ativo":{"eq":true}},"options":{"limit":5,"offset":1,"orderBy":"tag","orderDirection":"DESC"}}',
            @result = @result OUTPUT;

        SET @code = JSON_VALUE(@result, '$.code');
        SET @data = JSON_QUERY(@result, '$.data');
        SET @error = NULL;

        IF @code != 200
            SET @error = 'code != 200 (recebido: ' + CAST(@code AS NVARCHAR) + ') - msg: ' + ISNULL(JSON_VALUE(@result, '$.message'), 'sem mensagem');
        ELSE IF @data IS NULL
            SET @error = 'data é NULL (BUG DE OFFSET!)';
        ELSE
        BEGIN
            SET @data_count = (SELECT COUNT(*) FROM OPENJSON(@data));
            IF @data_count = 0
                SET @error = 'data está vazio (array com 0 registros)';
        END

        INSERT INTO #test_results VALUES (
            'TC1: tag+ativo+OFFSET',
            CASE WHEN @error IS NULL THEN 'PASS' ELSE 'FAIL' END,
            @error
        );
    END TRY
    BEGIN CATCH
        INSERT INTO #test_results VALUES ('TC1: tag+ativo+OFFSET', 'FAIL', ERROR_MESSAGE());
    END CATCH

    -- =============================================
    -- RETORNAR RESULTADOS
    -- =============================================
    SELECT test_case, status, validation_error
    FROM #test_results
    ORDER BY test_case;

    DECLARE @total INT = (SELECT COUNT(*) FROM #test_results);
    DECLARE @passed INT = (SELECT COUNT(*) FROM #test_results WHERE status = 'PASS');
    DECLARE @failed INT = (SELECT COUNT(*) FROM #test_results WHERE status = 'FAIL');

    PRINT '================================================';
    PRINT 'SUMÁRIO: sac.test_jsql__select__tag';
    PRINT '================================================';
    PRINT 'Total: ' + CAST(@total AS NVARCHAR);
    PRINT 'Passou: ' + CAST(@passed AS NVARCHAR);
    PRINT 'Falhou: ' + CAST(@failed AS NVARCHAR);
    PRINT '================================================';

    IF @failed > 0
        PRINT '❌ TESTES FALHARAM!';
    ELSE
        PRINT '✅ TODOS OS TESTES PASSARAM!';

    DROP TABLE #test_results;
END;
GO
