-- =============================================
-- Procedure: sac.jqel__mutate__categoria__delete
--
-- PROPOSITO:
--   Excluir categoria do sistema HelpDesk
--   Implementa contrato JQEL para operacao MUTATE com action DELETE
--
-- CONTRATO JQEL:
--   Entrada: @jsql com estrutura {schema, mutate, action: "delete", where}
--   Saida: JResult {code, message, data}
--
-- VALIDACOES:
--   - where.id: obrigatorio
--   - Categoria nao pode ter subcategorias
--   - Categoria nao pode estar em uso por chamados (validacao futura)
--
-- EXEMPLOS:
--   EXEC sac.jqel__mutate__categoria__delete
--       @user = N'{"sub": "1"}',
--       @jsql = N'{
--           "schema": "sac",
--           "mutate": "categoria",
--           "action": "delete",
--           "where": {"id": {"$eq": 5}}
--       }';
--
-- AUTOR: Coletivos Team
-- VERSAO: 1.0
-- DATA: 2025-11-13
-- =============================================

IF OBJECT_ID(N'sac.jqel__mutate__categoria__delete', N'P') IS NULL
BEGIN
    EXEC(N'CREATE PROCEDURE sac.jqel__mutate__categoria__delete AS SELECT 1');
END
GO

ALTER PROCEDURE sac.jqel__mutate__categoria__delete
    @user NVARCHAR(MAX) = NULL,
    @jsql NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- Extrair where do JSQL
        DECLARE @where_id INT = TRY_CAST(JSON_VALUE(@jsql, '$.where.id.$$eq') AS INT);

        -- Validar where.id obrigatorio
        IF @where_id IS NULL
        BEGIN
            SELECT
                400 AS code,
                'Campo "where.id" e obrigatorio para delete' AS message,
                NULL AS data
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
            RETURN;
        END

        -- Verificar se categoria existe
        IF NOT EXISTS (SELECT 1 FROM sac.TBcategoria WHERE DFid_categoria = @where_id)
        BEGIN
            SELECT
                404 AS code,
                'Categoria nao encontrada' AS message,
                (
                    SELECT @where_id AS id
                    FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
                ) AS data
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
            RETURN;
        END

        -- Verificar se categoria tem subcategorias
        IF EXISTS (
            SELECT 1 FROM sac.TBcategoria
            WHERE DFid_categoria_pai = @where_id
        )
        BEGIN
            DECLARE @count_subcategorias INT;
            SELECT @count_subcategorias = COUNT(*)
            FROM sac.TBcategoria
            WHERE DFid_categoria_pai = @where_id;

            SELECT
                400 AS code,
                'Nao e possivel excluir categoria que possui subcategorias' AS message,
                (
                    SELECT
                        @where_id AS id,
                        @count_subcategorias AS subcategorias_count
                    FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
                ) AS data
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
            RETURN;
        END

        -- Verificar se categoria esta em uso por chamados (se tabela existe)
        IF OBJECT_ID(N'sac.TBchamado', N'U') IS NOT NULL
        BEGIN
            IF EXISTS (
                SELECT 1 FROM sac.TBchamado
                WHERE DFid_categoria = @where_id
            )
            BEGIN
                DECLARE @count_chamados INT;
                SELECT @count_chamados = COUNT(*)
                FROM sac.TBchamado
                WHERE DFid_categoria = @where_id;

                SELECT
                    400 AS code,
                    'Nao e possivel excluir categoria que esta em uso por chamados' AS message,
                    (
                        SELECT
                            @where_id AS id,
                            @count_chamados AS chamados_count
                        FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
                    ) AS data
                FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
                RETURN;
            END
        END

        -- Capturar dados da categoria antes de excluir (para retorno)
        DECLARE @categoria_data NVARCHAR(MAX);

        SELECT @categoria_data = (
            SELECT
                DFid_categoria AS id,
                DFnome_categoria AS nome,
                DFcodigo_categoria AS codigo
            FROM sac.TBcategoria
            WHERE DFid_categoria = @where_id
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
        );

        -- Excluir categoria
        DELETE FROM sac.TBcategoria
        WHERE DFid_categoria = @where_id;

        -- Retornar sucesso
        SELECT
            200 AS code,
            'Categoria excluida com sucesso' AS message,
            JSON_QUERY(@categoria_data, '$') AS data
        FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;

    END TRY
    BEGIN CATCH
        -- Retornar erro padrao
        SELECT
            500 AS code,
            'Erro ao excluir categoria: ' + ERROR_MESSAGE() AS message,
            (
                SELECT
                    ERROR_NUMBER() AS error_number,
                    ERROR_MESSAGE() AS error_message,
                    ERROR_LINE() AS line_number
                FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
            ) AS data
        FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
    END CATCH
END;
GO

-- Testes
/*
-- Teste 1: Excluir categoria sem dependencias
EXEC sac.jqel__mutate__categoria__delete
    @user = NULL,
    @jsql = N'{
        "schema": "sac",
        "mutate": "categoria",
        "action": "delete",
        "where": {"id": {"$eq": 5}}
    }';

-- Teste 2: Erro - ID nao existe
EXEC sac.jqel__mutate__categoria__delete
    @user = NULL,
    @jsql = N'{
        "schema": "sac",
        "mutate": "categoria",
        "action": "delete",
        "where": {"id": {"$eq": 99999}}
    }';

-- Teste 3: Erro - Categoria com subcategorias
-- (Primeiro criar uma categoria pai e uma filha, depois tentar excluir a pai)
*/
