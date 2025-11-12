-- Procedure para remover todas as descrições de qualquer tipo de objeto
-- Suporta: tabelas, views, procedures, functions, triggers, schemas, etc.
-- Idempotente: não falha se não existirem
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[api].[REMOVER_DESCRICOES]') AND type in (N'P', N'PC'))
BEGIN
    EXEC dbo.sp_executesql @statement = N'CREATE PROCEDURE [api].[REMOVER_DESCRICOES] AS'
END
GO

ALTER PROCEDURE [api].[REMOVER_DESCRICOES]
    @objeto VARCHAR(255),           -- Nome do objeto (pode incluir schema: "schema.objeto")
    @tipo_objeto VARCHAR(50) = NULL,-- Tipo do objeto: TABLE, VIEW, PROCEDURE, FUNCTION, TRIGGER, SCHEMA, etc.
    @incluir_sub_objetos BIT = 1    -- Se deve remover descrições de sub-objetos (colunas, parâmetros, etc.)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @nivel0_tipo VARCHAR(50) = 'SCHEMA'
    DECLARE @nivel0_nome VARCHAR(100)
    DECLARE @nivel1_tipo VARCHAR(50)
    DECLARE @nivel1_nome VARCHAR(100)
    DECLARE @objeto_completo VARCHAR(255)
    DECLARE @object_id INT
    DECLARE @contador INT = 0

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

    -- Para schema, ajusta hierarquia (schema não tem nível superior)
    IF @tipo_objeto = 'SCHEMA'
    BEGIN
        SET @nivel0_tipo = 'SCHEMA'
        SET @nivel0_nome = @nivel1_nome
        SET @nivel1_tipo = NULL
        SET @nivel1_nome = NULL
        SET @object_id = SCHEMA_ID(@nivel0_nome)

        -- Para schemas, remove todas as descrições dos objetos contidos
        IF @incluir_sub_objetos = 1
        BEGIN
            DECLARE @sub_objeto_nome VARCHAR(255)
            DECLARE @sub_object_id INT
            DECLARE @sub_tipo VARCHAR(50)

            -- Cursor para todos os objetos no schema
            DECLARE objetos_cursor CURSOR FOR
            SELECT
                o.name,
                o.object_id,
                CASE o.type
                    WHEN 'U' THEN 'TABLE'
                    WHEN 'V' THEN 'VIEW'
                    WHEN 'P' THEN 'PROCEDURE'
                    WHEN 'FN' THEN 'FUNCTION'
                    WHEN 'TR' THEN 'TRIGGER'
                    ELSE 'OBJECT'
                END as tipo_obj
            FROM sys.objects o
            INNER JOIN sys.schemas s ON o.schema_id = s.schema_id
            WHERE s.name = @nivel0_nome

            OPEN objetos_cursor
            FETCH NEXT FROM objetos_cursor INTO @sub_objeto_nome, @sub_object_id, @sub_tipo

            WHILE @@FETCH_STATUS = 0
            BEGIN
                -- Remove descrição do objeto
                DECLARE @objeto_completo_sub VARCHAR(255)
                SET @objeto_completo_sub = @nivel0_nome + '.' + @sub_objeto_nome

                EXEC [api].[REMOVER_DESCRICAO]
                    @objeto = @objeto_completo_sub,
                    @tipo_objeto = @sub_tipo

                SET @contador = @contador + 1
                FETCH NEXT FROM objetos_cursor INTO @sub_objeto_nome, @sub_object_id, @sub_tipo
            END

            CLOSE objetos_cursor
            DEALLOCATE objetos_cursor
        END
    END

    -- Remove descrição do objeto principal
    IF EXISTS (
        SELECT * FROM sys.extended_properties
        WHERE major_id = ISNULL(@object_id, 0)
        AND name = 'MS_Description'
        AND minor_id = 0
    )
    BEGIN
        EXEC sys.sp_dropextendedproperty
            @name = N'MS_Description',
            @level0type = @nivel0_tipo, @level0name = @nivel0_nome,
            @level1type = @nivel1_tipo, @level1name = @nivel1_nome

        SET @contador = @contador + 1
    END

    -- Se deve incluir sub-objetos e não é schema
    IF @incluir_sub_objetos = 1 AND @tipo_objeto != 'SCHEMA' AND @object_id IS NOT NULL
    BEGIN
        DECLARE @sub_objeto VARCHAR(255)
        DECLARE @sub_tipo_obj VARCHAR(50)

        -- Remove descrições de colunas (para tabelas e views)
        IF @tipo_objeto IN ('TABLE', 'VIEW')
        BEGIN
            DECLARE colunas_cursor CURSOR FOR
            SELECT c.name
            FROM sys.columns c
            INNER JOIN sys.extended_properties ep ON c.object_id = ep.major_id AND c.column_id = ep.minor_id
            WHERE c.object_id = @object_id
              AND ep.name = 'MS_Description'

            OPEN colunas_cursor
            FETCH NEXT FROM colunas_cursor INTO @sub_objeto

            WHILE @@FETCH_STATUS = 0
            BEGIN
                EXEC sys.sp_dropextendedproperty
                    @name = N'MS_Description',
                    @level0type = @nivel0_tipo, @level0name = @nivel0_nome,
                    @level1type = @nivel1_tipo, @level1name = @nivel1_nome,
                    @level2type = N'COLUMN', @level2name = @sub_objeto

                SET @contador = @contador + 1
                FETCH NEXT FROM colunas_cursor INTO @sub_objeto
            END

            CLOSE colunas_cursor
            DEALLOCATE colunas_cursor
        END

        -- Remove descrições de parâmetros (para procedures e functions)
        IF @tipo_objeto IN ('PROCEDURE', 'FUNCTION')
        BEGIN
            DECLARE parametros_cursor CURSOR FOR
            SELECT p.name
            FROM sys.parameters p
            INNER JOIN sys.extended_properties ep ON p.object_id = ep.major_id AND p.parameter_id = ep.minor_id
            WHERE p.object_id = @object_id
              AND ep.name = 'MS_Description'

            OPEN parametros_cursor
            FETCH NEXT FROM parametros_cursor INTO @sub_objeto

            WHILE @@FETCH_STATUS = 0
            BEGIN
                EXEC sys.sp_dropextendedproperty
                    @name = N'MS_Description',
                    @level0type = @nivel0_tipo, @level0name = @nivel0_nome,
                    @level1type = @nivel1_tipo, @level1name = @nivel1_nome,
                    @level2type = N'PARAMETER', @level2name = @sub_objeto

                SET @contador = @contador + 1
                FETCH NEXT FROM parametros_cursor INTO @sub_objeto
            END

            CLOSE parametros_cursor
            DEALLOCATE parametros_cursor
        END

        -- Remove descrições de índices (para tabelas)
        IF @tipo_objeto = 'TABLE'
        BEGIN
            DECLARE indices_cursor CURSOR FOR
            SELECT i.name
            FROM sys.indexes i
            INNER JOIN sys.extended_properties ep ON i.object_id = ep.major_id AND i.index_id = ep.minor_id
            WHERE i.object_id = @object_id
              AND i.name IS NOT NULL
              AND ep.name = 'MS_Description'

            OPEN indices_cursor
            FETCH NEXT FROM indices_cursor INTO @sub_objeto

            WHILE @@FETCH_STATUS = 0
            BEGIN
                EXEC sys.sp_dropextendedproperty
                    @name = N'MS_Description',
                    @level0type = @nivel0_tipo, @level0name = @nivel0_nome,
                    @level1type = @nivel1_tipo, @level1name = @nivel1_nome,
                    @level2type = N'INDEX', @level2name = @sub_objeto

                SET @contador = @contador + 1
                FETCH NEXT FROM indices_cursor INTO @sub_objeto
            END

            CLOSE indices_cursor
            DEALLOCATE indices_cursor
        END
    END

    -- Log de resultado
    DECLARE @msg NVARCHAR(500) = CAST(@contador AS VARCHAR(10)) + ' descrições removidas de ' +
        ISNULL(@tipo_objeto, 'OBJETO') + ' ' +
        ISNULL(@objeto_completo, @nivel0_nome) +
        CASE WHEN @incluir_sub_objetos = 1 THEN ' (incluindo sub-objetos)' ELSE '' END

    PRINT @msg
END
GO