-- Procedure para remover todos os índices de uma tabela
-- Idempotente: não falha se não existirem
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[api].[REMOVER_INDICES]') AND type in (N'P', N'PC'))
BEGIN
    EXEC dbo.sp_executesql @statement = N'CREATE PROCEDURE [api].[REMOVER_INDICES] AS'
END
GO

ALTER PROCEDURE [api].[REMOVER_INDICES]
    @tabela VARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @nome_indice VARCHAR(255)
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

    DECLARE indice_cursor CURSOR FOR
    SELECT i.name
    FROM sys.indexes i
    INNER JOIN sys.objects o ON i.object_id = o.object_id
    INNER JOIN sys.schemas s ON o.schema_id = s.schema_id
    WHERE s.name = @schema_nome
      AND o.name = @tabela_nome
      AND i.type > 0  -- Exclui heap
      AND i.is_primary_key = 0  -- Exclui PK
      AND i.is_unique_constraint = 0  -- Exclui UC

    OPEN indice_cursor
    FETCH NEXT FROM indice_cursor INTO @nome_indice

    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @sql = 'DROP INDEX [' + @nome_indice + '] ON [' + @schema_nome + '].[' + @tabela_nome + ']'
        EXEC sp_executesql @sql

        FETCH NEXT FROM indice_cursor INTO @nome_indice
    END

    CLOSE indice_cursor
    DEALLOCATE indice_cursor
END
GO