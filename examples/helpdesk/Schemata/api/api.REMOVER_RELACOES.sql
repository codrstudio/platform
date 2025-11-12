-- Procedure para remover todas as foreign keys de uma tabela
-- Idempotente: não falha se não existirem
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[api].[REMOVER_RELACOES]') AND type in (N'P', N'PC'))
BEGIN
    EXEC dbo.sp_executesql @statement = N'CREATE PROCEDURE [api].[REMOVER_RELACOES] AS'
END
GO

ALTER PROCEDURE [api].[REMOVER_RELACOES]
    @tabela VARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @nome_fk VARCHAR(255)
    DECLARE @sql NVARCHAR(MAX)
    DECLARE @schema_nome VARCHAR(100)
    DECLARE @tabela_nome VARCHAR(100)

    -- Parse do nome da tabela (pode conter schema)
    IF CHARINDEX('.', @tabela) > 0
    BEGIN
        SET @schema_nome = SUBSTRING(@tabela, 1, CHARINDEX('.', @tabela) - 1)
        SET @tabela_nome = SUBSTRING(@tabela, CHARINDEX('.', @tabela) + 1, LEN(@tabela))
    END
    ELSE
    BEGIN
        SET @schema_nome = 'dbo'
        SET @tabela_nome = @tabela
    END

    DECLARE fk_cursor CURSOR FOR
    SELECT fk.name
    FROM sys.foreign_keys fk
    INNER JOIN sys.objects o ON fk.parent_object_id = o.object_id
    INNER JOIN sys.schemas s ON o.schema_id = s.schema_id
    WHERE s.name = @schema_nome
      AND o.name = @tabela_nome

    OPEN fk_cursor
    FETCH NEXT FROM fk_cursor INTO @nome_fk

    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @sql = 'ALTER TABLE [' + @schema_nome + '].[' + @tabela_nome + '] DROP CONSTRAINT [' + @nome_fk + ']'
        EXEC sp_executesql @sql

        FETCH NEXT FROM fk_cursor INTO @nome_fk
    END

    CLOSE fk_cursor
    DEALLOCATE fk_cursor
END
GO