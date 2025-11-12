-- Procedure para remover descrição específica de qualquer tipo de objeto
-- Suporta: tabelas, views, procedures, functions, triggers, indexes, schemas, etc.
-- Idempotente: não falha se não existir
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[api].[REMOVER_DESCRICAO]') AND type in (N'P', N'PC'))
BEGIN
    EXEC dbo.sp_executesql @statement = N'CREATE PROCEDURE [api].[REMOVER_DESCRICAO] AS'
END
GO

ALTER PROCEDURE [api].[REMOVER_DESCRICAO]
    @objeto VARCHAR(255),           -- Nome do objeto (pode incluir schema: "schema.objeto")
    @sub_objeto VARCHAR(255) = NULL,-- Sub-objeto (coluna, parâmetro, etc.)
    @tipo_objeto VARCHAR(50) = NULL,-- Tipo do objeto: TABLE, VIEW, PROCEDURE, FUNCTION, TRIGGER, INDEX, etc.
    @tipo_sub_objeto VARCHAR(50) = 'COLUMN' -- Tipo do sub-objeto: COLUMN, PARAMETER, etc.
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @nivel0_tipo VARCHAR(50) = 'SCHEMA'
    DECLARE @nivel0_nome VARCHAR(100)
    DECLARE @nivel1_tipo VARCHAR(50)
    DECLARE @nivel1_nome VARCHAR(100)
    DECLARE @nivel2_tipo VARCHAR(50) = NULL
    DECLARE @nivel2_nome VARCHAR(100) = NULL
    DECLARE @objeto_completo VARCHAR(255)
    DECLARE @object_id INT

    -- Parse do nome do objeto (pode conter schema)
    IF CHARINDEX('.', @objeto) > 0
    BEGIN
        SET @nivel0_nome = SUBSTRING(@objeto, 1, CHARINDEX('.', @objeto) - 1)
        SET @nivel1_nome = SUBSTRING(@objeto, CHARINDEX('.', @objeto) + 1, LEN(@objeto))
    END
    ELSE
    BEGIN
        -- Se não especificou schema, usa dbo como padrão
        SET @nivel0_nome = 'dbo'
        SET @nivel1_nome = @objeto
    END

    SET @objeto_completo = @nivel0_nome + '.' + @nivel1_nome

    -- Se tipo não foi especificado, detecta automaticamente
    IF @tipo_objeto IS NULL
    BEGIN
        SELECT @tipo_objeto = CASE o.type
            WHEN 'U' THEN 'TABLE'
            WHEN 'V' THEN 'VIEW'
            WHEN 'P' THEN 'PROCEDURE'
            WHEN 'FN' THEN 'FUNCTION'
            WHEN 'IF' THEN 'FUNCTION'
            WHEN 'TF' THEN 'FUNCTION'
            WHEN 'TR' THEN 'TRIGGER'
            ELSE 'OBJECT'
        END
        FROM sys.objects o
        INNER JOIN sys.schemas s ON o.schema_id = s.schema_id
        WHERE s.name = @nivel0_nome AND o.name = @nivel1_nome

        -- Se não encontrou como objeto, verifica se é schema
        IF @tipo_objeto IS NULL AND EXISTS(SELECT 1 FROM sys.schemas WHERE name = @nivel1_nome)
        BEGIN
            SET @tipo_objeto = 'SCHEMA'
        END

        -- Se ainda não detectou, assume TABLE como padrão
        IF @tipo_objeto IS NULL
            SET @tipo_objeto = 'TABLE'
    END

    -- Define tipo do nível 1 baseado no tipo do objeto
    SET @nivel1_tipo = UPPER(@tipo_objeto)

    -- Obtém object_id para verificação
    SET @object_id = CASE
        WHEN @tipo_objeto IN ('TABLE', 'VIEW') THEN OBJECT_ID(@objeto_completo)
        WHEN @tipo_objeto IN ('PROCEDURE', 'FUNCTION') THEN OBJECT_ID(@objeto_completo)
        WHEN @tipo_objeto = 'TRIGGER' THEN OBJECT_ID(@objeto_completo, 'TR')
        WHEN @tipo_objeto = 'SCHEMA' THEN SCHEMA_ID(@nivel1_nome)
        ELSE OBJECT_ID(@objeto_completo)
    END

    -- Se sub-objeto foi especificado
    IF @sub_objeto IS NOT NULL
    BEGIN
        SET @nivel2_tipo = UPPER(@tipo_sub_objeto)
        SET @nivel2_nome = @sub_objeto
    END

    -- Para schema, ajusta hierarquia (schema não tem nível superior)
    IF @tipo_objeto = 'SCHEMA'
    BEGIN
        SET @nivel0_tipo = 'SCHEMA'
        SET @nivel0_nome = @nivel1_nome
        SET @nivel1_tipo = NULL
        SET @nivel1_nome = NULL
        SET @object_id = SCHEMA_ID(@nivel0_nome)
    END

    -- Calcula minor_id baseado no tipo de sub-objeto
    DECLARE @minor_id INT = 0
    IF @sub_objeto IS NOT NULL AND @object_id IS NOT NULL
    BEGIN
        SET @minor_id = CASE
            WHEN @tipo_sub_objeto = 'COLUMN' THEN
                ISNULL(COLUMNPROPERTY(@object_id, @sub_objeto, 'ColumnId'), 0)
            WHEN @tipo_sub_objeto = 'PARAMETER' THEN
                ISNULL((SELECT parameter_id FROM sys.parameters
                       WHERE object_id = @object_id AND name = @sub_objeto), 0)
            WHEN @tipo_sub_objeto = 'INDEX' THEN
                ISNULL((SELECT index_id FROM sys.indexes
                       WHERE object_id = @object_id AND name = @sub_objeto), 0)
            ELSE 0
        END
    END

    -- Remove descrição se existir
    IF EXISTS (
        SELECT * FROM sys.extended_properties
        WHERE major_id = ISNULL(@object_id, 0)
        AND name = 'MS_Description'
        AND minor_id = @minor_id
    )
    BEGIN
        EXEC sys.sp_dropextendedproperty
            @name = N'MS_Description',
            @level0type = @nivel0_tipo, @level0name = @nivel0_nome,
            @level1type = @nivel1_tipo, @level1name = @nivel1_nome,
            @level2type = @nivel2_tipo, @level2name = @nivel2_nome

        -- Log de sucesso
        DECLARE @msg NVARCHAR(500) = 'Descrição removida de ' +
            ISNULL(@tipo_objeto, 'OBJETO') + ' ' + @objeto_completo +
            ISNULL(' (' + @sub_objeto + ')', '')

        PRINT @msg
    END
    ELSE
    BEGIN
        -- Log se não encontrou
        DECLARE @msg_nao_encontrado NVARCHAR(500) = 'Descrição não encontrada em ' +
            ISNULL(@tipo_objeto, 'OBJETO') + ' ' + @objeto_completo +
            ISNULL(' (' + @sub_objeto + ')', '')

        PRINT @msg_nao_encontrado
    END
END
GO