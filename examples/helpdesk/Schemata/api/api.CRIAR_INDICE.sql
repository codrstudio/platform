-- Procedure para criar índices com nomenclatura padronizada
-- Idempotente: não cria se já existe
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[api].[CRIAR_INDICE]') AND type in (N'P', N'PC'))
BEGIN
    EXEC dbo.sp_executesql @statement = N'CREATE PROCEDURE [api].[CRIAR_INDICE] AS'
END
GO

ALTER PROCEDURE [api].[CRIAR_INDICE]
    @tabela VARCHAR(100),
    @campos VARCHAR(500),
    @unico BIT = 0
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @nome_indice VARCHAR(255)
    DECLARE @sql NVARCHAR(MAX)
    DECLARE @campos_limpos VARCHAR(500)
    DECLARE @prefixo VARCHAR(5)
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
        -- Se não especificou schema, usa dbo como padrão
        SET @schema_nome = 'dbo'
        SET @tabela_nome = @tabela
    END

    -- Remove espaços e prepara campos
    SET @campos_limpos = REPLACE(@campos, ' ', '')

    -- Define prefixo baseado no tipo
    SET @prefixo = CASE WHEN @unico = 1 THEN 'UQ' ELSE 'IX' END

    -- Monta nome do índice seguindo padrão: XX__esquema_tabela__campos
    SET @nome_indice = @prefixo + '__' + @schema_nome + '_' + @tabela_nome + '__' + REPLACE(@campos_limpos, ',', '_')

    -- Verifica se índice já existe
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = @nome_indice)
    BEGIN
        -- Monta comando SQL
        SET @sql = 'CREATE ' + CASE WHEN @unico = 1 THEN 'UNIQUE ' ELSE '' END +
                   'INDEX [' + @nome_indice + '] ON [' + @schema_nome + '].[' + @tabela_nome + '] (' + @campos + ')'

        EXEC sp_executesql @sql
    END
END
GO