-- =============================================
-- Procedure: sac.test_jsql__mutate__departamento
-- Testa que a procedure REAL existe
-- =============================================

IF OBJECT_ID(N'sac.test_jsql__mutate__departamento', N'P') IS NULL
BEGIN
    EXEC('CREATE PROCEDURE sac.test_jsql__mutate__departamento AS SELECT 1');
END
GO

ALTER PROCEDURE sac.test_jsql__mutate__departamento
AS
BEGIN
    SET NOCOUNT ON;
    CREATE TABLE #test_results (test_case NVARCHAR(100), status NVARCHAR(10), validation_error NVARCHAR(MAX));
    DECLARE @error NVARCHAR(MAX);
    BEGIN TRY
        SET @error = NULL;
        IF OBJECT_ID(N'sac.jsql__mutate__departamento', N'P') IS NULL
            SET @error = 'Procedure não existe';
        INSERT INTO #test_results VALUES ('TC1: procedure existe', CASE WHEN @error IS NULL THEN 'PASS' ELSE 'FAIL' END, @error);
    END TRY
    BEGIN CATCH
        INSERT INTO #test_results VALUES ('TC1: procedure existe', 'FAIL', ERROR_MESSAGE());
    END CATCH
    SELECT * FROM #test_results;
    DECLARE @total INT = (SELECT COUNT(*) FROM #test_results);
    DECLARE @passed INT = (SELECT COUNT(*) FROM #test_results WHERE status = 'PASS');
    DECLARE @failed INT = (SELECT COUNT(*) FROM #test_results WHERE status = 'FAIL');
    PRINT '================================================';
    PRINT 'SUMÁRIO: sac.test_jsql__mutate__departamento';
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
