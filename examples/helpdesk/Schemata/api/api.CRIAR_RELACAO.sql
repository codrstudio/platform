-- Procedure para criar foreign keys com nomenclatura padronizada
-- Idempotente: não cria se já existe
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[api].[CRIAR_RELACAO]') AND type in (N'P', N'PC'))
BEGIN
    EXEC dbo.sp_executesql @statement = N'CREATE PROCEDURE [api].[CRIAR_RELACAO] AS'
END
GO

ALTER PROCEDURE [api].[CRIAR_RELACAO]
    @tabela VARCHAR(100),
    @campo VARCHAR(100),
    @tabela_destino VARCHAR(100),
    @campo_destino VARCHAR(100),
    @on_delete VARCHAR(20) = 'NO_ACTION',
    @on_update VARCHAR(20) = 'NO_ACTION'
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @nome_fk VARCHAR(255)
    DECLARE @sql NVARCHAR(MAX)
    DECLARE @schema_origem VARCHAR(100)
    DECLARE @tabela_origem_nome VARCHAR(100)
    DECLARE @schema_destino VARCHAR(100)
    DECLARE @tabela_destino_nome VARCHAR(100)
    DECLARE @on_delete_norm VARCHAR(20)
    DECLARE @on_update_norm VARCHAR(20)

    -- Parse do nome da tabela origem (pode conter schema)
    IF CHARINDEX('.', @tabela) > 0
    BEGIN
        SET @schema_origem = SUBSTRING(@tabela, 1, CHARINDEX('.', @tabela) - 1)
        SET @tabela_origem_nome = SUBSTRING(@tabela, CHARINDEX('.', @tabela) + 1, LEN(@tabela))
    END
    ELSE
    BEGIN
        SET @schema_origem = 'dbo'
        SET @tabela_origem_nome = @tabela
    END

    -- Parse do nome da tabela destino (pode conter schema)
    IF CHARINDEX('.', @tabela_destino) > 0
    BEGIN
        SET @schema_destino = SUBSTRING(@tabela_destino, 1, CHARINDEX('.', @tabela_destino) - 1)
        SET @tabela_destino_nome = SUBSTRING(@tabela_destino, CHARINDEX('.', @tabela_destino) + 1, LEN(@tabela_destino))
    END
    ELSE
    BEGIN
        SET @schema_destino = 'dbo'
        SET @tabela_destino_nome = @tabela_destino
    END

    -- Monta nome da FK seguindo padrão: FK__esquema_tabela__esquema_tabeladestino
    SET @nome_fk = 'FK__' + @schema_origem + '_' + @tabela_origem_nome + '__' + @schema_destino + '_' + @tabela_destino_nome

    -- Normaliza e valida ações de ON DELETE / ON UPDATE
    SET @on_delete_norm = REPLACE(UPPER(COALESCE(@on_delete, 'NO_ACTION')), '_', ' ')
    SET @on_update_norm = REPLACE(UPPER(COALESCE(@on_update, 'NO_ACTION')), '_', ' ')

    IF (@on_delete_norm NOT IN ('NO ACTION', 'CASCADE', 'SET NULL', 'SET DEFAULT'))
    BEGIN
        RAISERROR('Valor inválido para @on_delete. Use: NO_ACTION, CASCADE, SET_NULL, SET_DEFAULT.', 16, 1)
        RETURN
    END

    IF (@on_update_norm NOT IN ('NO ACTION', 'CASCADE', 'SET NULL', 'SET DEFAULT'))
    BEGIN
        RAISERROR('Valor inválido para @on_update. Use: NO_ACTION, CASCADE, SET_NULL, SET_DEFAULT.', 16, 1)
        RETURN
    END

    -- Verifica se FK já existe
    IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = @nome_fk)
    BEGIN
        -- Monta comando SQL
        SET @sql = 'ALTER TABLE [' + @schema_origem + '].[' + @tabela_origem_nome + '] ADD CONSTRAINT [' + @nome_fk + '] ' +
                   'FOREIGN KEY ([' + @campo + ']) REFERENCES [' + @schema_destino + '].[' + @tabela_destino_nome + '] ([' + @campo_destino + ']) ' +
                   'ON DELETE ' + @on_delete_norm + ' ON UPDATE ' + @on_update_norm

        EXEC sp_executesql @sql
    END
END
GO
