-- =============================================
-- Procedure: sac.jqel__select__categoria
--
-- PROPOSITO:
--   Consultar categorias do sistema HelpDesk
--   Implementa contrato JQEL para operacao SELECT
--
-- CONTRATO JQEL:
--   Entrada: @jsql com estrutura {schema, select, where?, options?, output?, except?}
--   Saida: JResult {code, message, data}
--
-- EXEMPLOS:
--   -- Listar todas categorias ativas
--   EXEC sac.jqel__select__categoria
--       @user = N'{"sub": "1"}',
--       @jsql = N'{"schema": "sac", "select": "categoria", "where": {"ativo": {"$eq": 1}}}';
--
--   -- Listar com limite e projecao
--   EXEC sac.jqel__select__categoria
--       @user = N'{"sub": "1"}',
--       @jsql = N'{"schema": "sac", "select": "categoria", "options": {"limit": 10}, "output": ["id", "nome", "descricao"]}';
--
-- AUTOR: Coletivos Team
-- VERSAO: 1.0
-- DATA: 2025-11-13
-- =============================================

IF OBJECT_ID(N'sac.jqel__select__categoria', N'P') IS NULL
BEGIN
    EXEC(N'CREATE PROCEDURE sac.jqel__select__categoria AS SELECT 1');
END
GO

ALTER PROCEDURE sac.jqel__select__categoria
    @user NVARCHAR(MAX) = NULL,
    @jsql NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- Extrair parametros do JSQL
        DECLARE @limit INT = JSON_VALUE(@jsql, '$.options.limit');
        DECLARE @offset INT = JSON_VALUE(@jsql, '$.options.offset');
        DECLARE @orderBy NVARCHAR(MAX) = JSON_QUERY(@jsql, '$.options.orderBy');

        -- Extrair filtros WHERE
        DECLARE @where_ativo BIT = TRY_CAST(JSON_VALUE(@jsql, '$.where.ativo.$$eq') AS BIT);
        DECLARE @where_id INT = TRY_CAST(JSON_VALUE(@jsql, '$.where.id.$$eq') AS INT);
        DECLARE @where_categoria_pai INT = TRY_CAST(JSON_VALUE(@jsql, '$.where.id_categoria_pai.$$eq') AS INT);

        -- Definir valores padrao
        SET @limit = ISNULL(@limit, 100);
        SET @offset = ISNULL(@offset, 0);

        -- Construir query dinamica
        DECLARE @sql NVARCHAR(MAX) = N'
            SELECT
                DFid_categoria AS id,
                DFnome_categoria AS nome,
                DFcodigo_categoria AS codigo,
                DFdescricao AS descricao,
                DFid_categoria_pai AS id_categoria_pai,
                DFcor_hexadecimal AS cor,
                DFicone AS icone,
                DFprioridade_padrao AS prioridade_padrao,
                DFnivel_prioridade AS nivel_prioridade,
                DFsla_padrao_horas AS sla_padrao_horas,
                DFativo AS ativo,
                DFdata_criacao AS data_criacao,
                DFdata_ultima_atualizacao AS data_atualizacao,
                DFordem_exibicao AS ordem,
                DFtemplate_descricao AS template_descricao,
                DFobservacoes AS observacoes
            FROM sac.TBcategoria
            WHERE 1=1';

        -- Aplicar filtros WHERE
        IF @where_id IS NOT NULL
        BEGIN
            SET @sql = @sql + N' AND DFid_categoria = ' + CAST(@where_id AS NVARCHAR(10));
        END

        IF @where_ativo IS NOT NULL
        BEGIN
            SET @sql = @sql + N' AND DFativo = ' + CAST(@where_ativo AS NVARCHAR(1));
        END

        IF @where_categoria_pai IS NOT NULL
        BEGIN
            SET @sql = @sql + N' AND DFid_categoria_pai = ' + CAST(@where_categoria_pai AS NVARCHAR(10));
        END

        -- Aplicar ordenacao
        SET @sql = @sql + N' ORDER BY DFordem_exibicao, DFnome_categoria';

        -- Aplicar paginacao
        SET @sql = @sql + N' OFFSET ' + CAST(@offset AS NVARCHAR(10)) + N' ROWS';
        SET @sql = @sql + N' FETCH NEXT ' + CAST(@limit AS NVARCHAR(10)) + N' ROWS ONLY';

        -- Adicionar FOR JSON PATH
        SET @sql = @sql + N' FOR JSON PATH';

        -- Executar query e capturar resultado
        DECLARE @json_result NVARCHAR(MAX);
        CREATE TABLE #temp_result (json_data NVARCHAR(MAX));

        INSERT INTO #temp_result
        EXEC sp_executesql @sql;

        SELECT @json_result = json_data FROM #temp_result;
        DROP TABLE #temp_result;

        -- Se nao houver resultados, retornar array vazio
        IF @json_result IS NULL
        BEGIN
            SET @json_result = N'[]';
        END

        -- Retornar JResult com data como JSON nativo
        -- IMPORTANTE: Usar estrutura SELECT...FOR JSON com subquery para evitar string escapada
        SELECT
            200 AS code,
            'Categorias recuperadas com sucesso' AS message,
            JSON_QUERY(@json_result, '$') AS data
        FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;

    END TRY
    BEGIN CATCH
        -- Retornar erro padrao
        SELECT
            500 AS code,
            'Erro ao consultar categorias: ' + ERROR_MESSAGE() AS message,
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
-- Teste 1: Listar todas categorias
EXEC sac.jqel__select__categoria
    @user = NULL,
    @jsql = N'{"schema": "sac", "select": "categoria"}';

-- Teste 2: Listar apenas ativas
EXEC sac.jqel__select__categoria
    @user = NULL,
    @jsql = N'{"schema": "sac", "select": "categoria", "where": {"ativo": {"$eq": 1}}}';

-- Teste 3: Buscar por ID
EXEC sac.jqel__select__categoria
    @user = NULL,
    @jsql = N'{"schema": "sac", "select": "categoria", "where": {"id": {"$eq": 1}}}';

-- Teste 4: Com paginacao
EXEC sac.jqel__select__categoria
    @user = NULL,
    @jsql = N'{"schema": "sac", "select": "categoria", "options": {"limit": 5, "offset": 0}}';
*/
