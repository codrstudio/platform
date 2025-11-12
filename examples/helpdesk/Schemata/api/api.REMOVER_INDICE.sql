-- Procedure para remover índice específico
-- Idempotente: não falha se não existir
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[api].[REMOVER_INDICE]') AND type in (N'P', N'PC'))
BEGIN
    EXEC dbo.sp_executesql @statement = N'CREATE PROCEDURE [api].[REMOVER_INDICE] AS'
END
GO

ALTER PROCEDURE [api].[REMOVER_INDICE]
    @tabela VARCHAR(100),
    @campos VARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @nome_indice_ix VARCHAR(255)
    DECLARE @nome_indice_uq VARCHAR(255)
    DECLARE @sql NVARCHAR(MAX)
    DECLARE @campos_limpos VARCHAR(500)
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

    -- Remove espaços e prepara campos
    SET @campos_limpos = REPLACE(@campos, ' ', '')

    -- Monta nomes possíveis do índice (IX e UQ)
    SET @nome_indice_ix = 'IX__' + @schema_nome + '_' + @tabela_nome + '__' + REPLACE(@campos_limpos, ',', '_')
    SET @nome_indice_uq = 'UQ__' + @schema_nome + '_' + @tabela_nome + '__' + REPLACE(@campos_limpos, ',', '_')

    -- Remove índice IX se existir
    IF EXISTS (SELECT * FROM sys.indexes WHERE name = @nome_indice_ix)
    BEGIN
        SET @sql = 'DROP INDEX [' + @nome_indice_ix + '] ON [' + @schema_nome + '].[' + @tabela_nome + ']'
        EXEC sp_executesql @sql
    END

    -- Remove índice UQ se existir
    IF EXISTS (SELECT * FROM sys.indexes WHERE name = @nome_indice_uq)
    BEGIN
        SET @sql = 'DROP INDEX [' + @nome_indice_uq + '] ON [' + @schema_nome + '].[' + @tabela_nome + ']'
        EXEC sp_executesql @sql
    END
END
GO