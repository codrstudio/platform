-- Procedure para remover foreign key específica
-- Idempotente: não falha se não existir
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[api].[REMOVER_RELACAO]') AND type in (N'P', N'PC'))
BEGIN
    EXEC dbo.sp_executesql @statement = N'CREATE PROCEDURE [api].[REMOVER_RELACAO] AS'
END
GO

ALTER PROCEDURE [api].[REMOVER_RELACAO]
    @tabela VARCHAR(100),
    @campo VARCHAR(100)
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

    -- Localiza a FK pelo campo
    SELECT @nome_fk = fk.name
    FROM sys.foreign_keys fk
    INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
    INNER JOIN sys.columns c ON fkc.parent_object_id = c.object_id AND fkc.parent_column_id = c.column_id
    INNER JOIN sys.objects o ON fk.parent_object_id = o.object_id
    INNER JOIN sys.schemas s ON o.schema_id = s.schema_id
    WHERE s.name = @schema_nome
      AND o.name = @tabela_nome
      AND c.name = @campo

    -- Remove FK se encontrada
    IF @nome_fk IS NOT NULL
    BEGIN
        SET @sql = 'ALTER TABLE [' + @schema_nome + '].[' + @tabela_nome + '] DROP CONSTRAINT [' + @nome_fk + ']'
        EXEC sp_executesql @sql
    END
END
GO