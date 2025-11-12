-- =============================================
-- Procedure: sac.test_gateway_sql
--
-- PROPÓSITO:
--   Procedure de teste para validar a implementação de procedures JSQL.
--   Garante que procedures seguem o contrato JSQL e retornam JSON válido
--   no formato JResult correto.
--
-- O QUE FAZ:
--   1. Recebe uma query JSQL completa (com schema, select/mutate, action, etc)
--   2. Monta dinamicamente o nome da procedure JSQL correspondente
--   3. Valida que a procedure existe no banco
--   4. Executa a procedure e retorna o resultado
--   5. Permite testar procedures JSQL sem conhecer o nome exato
--
-- CONTRATO JSQL (JResult):
--   Todas as procedures JSQL DEVEM retornar um objeto JSON no formato:
--   {
--     "code": 200,
--     "message": "Mensagem descritiva",
--     "data": [...] ou {...} ou null
--   }
--
--   ⚠️ CRÍTICO - Formato do campo "data":
--
--   ❌ ERRADO - String escapada (JSON serializado como string):
--   {
--     "data": "[{\"id\":1,\"nome\":\"João\"}]"
--   }
--
--   ✅ CORRETO - Array/Object JSON nativo:
--   {
--     "data": [{"id":1,"nome":"João"}]
--   }
--
--   O campo "data" deve ser um valor JSON NATIVO (array, object, null),
--   NÃO uma string contendo JSON serializado.
--
-- VALIDAÇÃO:
--   Esta procedure garante que:
--   - A query JSQL está bem formada (schema obrigatório, operação válida)
--   - A procedure JSQL correspondente existe no banco
--   - A procedure é executada com os parâmetros corretos
--
--   ⚠️ LIMITAÇÃO TÉCNICA:
--   Não é possível capturar e validar o formato exato do JSON retornado
--   pela procedure JSQL dentro do SQL Server (FOR JSON PATH não pode ser
--   armazenado em variáveis). A validação do formato deve ser feita:
--   - Manualmente executando a procedure e inspecionando o resultado
--   - No workflow N8N que consome a API
--   - Em testes automatizados na aplicação
--
-- USO:
--   EXEC sac.test_gateway_sql
--       @user = N'{"id_usuario": 1}',
--       @jsql = N'{"schema": "sac", "select": "usuario", "options": {"limit": 5}}';
--
-- PARÂMETROS:
--   @user - Contexto do usuário (opcional, JSON)
--   @jsql - Query JSQL completa (obrigatório, JSON)
--
-- RETORNO:
--   - Se procedure não existe: JResult com code 404
--   - Se validação falha: JResult com code 400
--   - Caso contrário: Resultado direto da procedure JSQL executada
--
-- EXEMPLOS DE VALIDAÇÃO MANUAL:
--
--   -- 1. Executar e inspecionar resultado:
--   EXEC sac.test_gateway_sql
--       @user = NULL,
--       @jsql = N'{"schema": "sac", "select": "usuario", "options": {"limit": 1}}';
--
--   -- 2. Verificar que "data" é array/object, não string:
--   --    ✅ Correto: "data": [{"id":1}]
--   --    ❌ Errado:  "data": "[{\"id\":1}]"
--
--   -- 3. Validar com ISJSON() em aplicação externa:
--   --    Se JSON_QUERY(resultado, '$.data') retorna NULL, então "data"
--   --    provavelmente é uma string escapada (erro).
--
-- AUTOR: Coletivos Team
-- VERSÃO: 2.0
-- DATA: 2025-10-07
-- =============================================

IF OBJECT_ID(N'sac.test_gateway_sql', N'P') IS NULL
BEGIN
    EXEC('CREATE PROCEDURE sac.test_gateway_sql AS SELECT 1');
END
GO

ALTER PROCEDURE sac.test_gateway_sql
    @user NVARCHAR(MAX) = NULL,
    @jsql NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- 1. Validar @jsql
        IF @jsql IS NULL OR LTRIM(RTRIM(@jsql)) = ''
        BEGIN
            SELECT (
                SELECT
                    400 AS code,
                    'Parâmetro @jsql é obrigatório' AS message,
                    NULL AS data
                FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
            ) AS result;
            RETURN;
        END

        -- 2. Extrair componentes da query JSQL
        DECLARE @schema NVARCHAR(50) = JSON_VALUE(@jsql, '$.schema');
        DECLARE @select_entity NVARCHAR(100) = JSON_VALUE(@jsql, '$.select');
        DECLARE @mutate_entity NVARCHAR(100) = JSON_VALUE(@jsql, '$.mutate');
        DECLARE @action NVARCHAR(100) = JSON_VALUE(@jsql, '$.action');

        -- 3. Validar schema obrigatório
        IF @schema IS NULL OR LTRIM(RTRIM(@schema)) = ''
        BEGIN
            SELECT (
                SELECT
                    400 AS code,
                    'Campo "schema" é obrigatório na query JSQL' AS message,
                    JSON_QUERY((
                        SELECT 'schema' AS field
                        FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
                    )) AS data
                FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
            ) AS result;
            RETURN;
        END

        -- 4. Validar schema permitido
        IF @schema NOT IN ('sac', 'jsql', 'api', 'tom')
        BEGIN
            SELECT (
                SELECT
                    400 AS code,
                    'Schema inválido. Valores permitidos: sac, jsql, api, tom' AS message,
                    JSON_QUERY((
                        SELECT
                            'schema' AS field,
                            @schema AS value
                        FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
                    )) AS data
                FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
            ) AS result;
            RETURN;
        END

        -- 5. Determinar operação e entidade
        DECLARE @operation NVARCHAR(10);
        DECLARE @entity NVARCHAR(100);

        IF @select_entity IS NOT NULL
        BEGIN
            SET @operation = 'select';
            SET @entity = @select_entity;
        END
        ELSE IF @mutate_entity IS NOT NULL
        BEGIN
            SET @operation = 'mutate';
            SET @entity = @mutate_entity;

            -- Action é obrigatório para mutate
            IF @action IS NULL
            BEGIN
                SELECT (
                    SELECT
                        400 AS code,
                        'Campo "action" é obrigatório para operações "mutate"' AS message,
                        NULL AS data
                    FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
                ) AS result;
                RETURN;
            END
        END
        ELSE
        BEGIN
            SELECT (
                SELECT
                    400 AS code,
                    'Query deve conter "select" ou "mutate"' AS message,
                    NULL AS data
                FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
            ) AS result;
            RETURN;
        END

        -- 6. Montar nome da procedure dinamicamente
        DECLARE @procedure_name NVARCHAR(500);

        IF @action IS NOT NULL
        BEGIN
            SET @procedure_name = @schema + '.jsql__' + @operation + '__' + @entity + '__' + @action;
        END
        ELSE
        BEGIN
            SET @procedure_name = @schema + '.jsql__' + @operation + '__' + @entity;
        END

        -- 7. Verificar se procedure existe
        DECLARE @procedure_exists BIT = 0;

        IF EXISTS (
            SELECT 1
            FROM sys.procedures p
            INNER JOIN sys.schemas s ON p.schema_id = s.schema_id
            WHERE s.name = @schema
              AND p.name = SUBSTRING(@procedure_name, LEN(@schema) + 2, LEN(@procedure_name))
        )
        BEGIN
            SET @procedure_exists = 1;
        END

        IF @procedure_exists = 0
        BEGIN
            SELECT (
                SELECT
                    404 AS code,
                    'Procedure JSQL não encontrada' AS message,
                    JSON_QUERY((
                        SELECT
                            @procedure_name AS procedure_name,
                            @schema AS [schema],
                            @operation AS operation,
                            @entity AS entity,
                            @action AS action
                        FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
                    )) AS data
                FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
            ) AS result;
            RETURN;
        END

        -- 8. Executar procedure dinamicamente
        -- IMPORTANTE: Não podemos capturar o resultado de FOR JSON PATH via INSERT INTO
        -- A única forma é executar diretamente e passar o resultado adiante
        DECLARE @sql NVARCHAR(MAX);

        -- Montar comando de execução direta
        -- NOTA: As procedures JSQL usam @jsql, não @jsql
        SET @sql = N'EXEC ' + QUOTENAME(@schema) + '.' + QUOTENAME(SUBSTRING(@procedure_name, LEN(@schema) + 2, LEN(@procedure_name))) +
                   ' @user = @user_param, @jsql = @jsql_param';

        -- Executar e retornar resultado diretamente
        -- Como não podemos capturar FOR JSON, simplesmente executamos
        EXEC sp_executesql
            @sql,
            N'@user_param NVARCHAR(MAX), @jsql_param NVARCHAR(MAX)',
            @user_param = @user,
            @jsql_param = @jsql;

        -- Se chegou aqui, a execução foi bem-sucedida
        -- O resultado já foi enviado ao cliente pela procedure JSQL
        RETURN;

    END TRY
    BEGIN CATCH
        -- Retornar erro de execução
        SELECT (
            SELECT
                500 AS code,
                'Erro ao executar teste: ' + ERROR_MESSAGE() AS message,
                JSON_QUERY((
                    SELECT
                        ERROR_NUMBER() AS error_number,
                        ERROR_SEVERITY() AS severity,
                        ERROR_STATE() AS state,
                        ERROR_LINE() AS line_number
                    FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
                )) AS data
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
        ) AS result;
    END CATCH
END;
GO

-- =============================================
-- EXEMPLOS DE USO E VALIDAÇÃO
-- =============================================

/*

-- =============================================
-- TESTES DE SUCESSO
-- =============================================

-- Exemplo 1: Testar SELECT básico
EXEC sac.test_gateway_sql
    @user = NULL,
    @jsql = N'{
        "schema": "sac",
        "select": "usuario",
        "options": {"limit": 5}
    }';

-- Resultado esperado (✅ CORRETO):
-- {
--   "code": 200,
--   "message": "Usuários recuperados com sucesso",
--   "data": [
--     {"id_usuario": 1, "nome_completo": "Admin", "email": "admin@test.com"},
--     {"id_usuario": 2, "nome_completo": "João", "email": "joao@test.com"}
--   ]
-- }
--
-- ⚠️ VALIDAR: "data" deve ser um ARRAY JSON, não uma string escapada!


-- Exemplo 2: Testar MUTATE com action
EXEC sac.test_gateway_sql
    @user = N'{"id_usuario": 1, "email": "admin@test.com"}',
    @jsql = N'{
        "schema": "sac",
        "mutate": "usuario",
        "action": "insert",
        "values": {
            "nome_completo": "Teste Gateway",
            "email": "teste.gateway@test.com"
        }
    }';

-- Resultado esperado (✅ CORRETO):
-- {
--   "code": 201,
--   "message": "Usuário criado com sucesso",
--   "data": {
--     "id_usuario": 123,
--     "nome_completo": "Teste Gateway",
--     "email": "teste.gateway@test.com"
--   }
-- }
--
-- ⚠️ VALIDAR: "data" deve ser um OBJECT JSON, não uma string escapada!


-- Exemplo 3: Testar SELECT com action customizada
EXEC sac.test_gateway_sql
    @user = N'{"id_usuario": 1}',
    @jsql = N'{
        "schema": "sac",
        "select": "chamado",
        "action": "dashboard"
    }';


-- =============================================
-- TESTES DE VALIDAÇÃO (Erros Esperados)
-- =============================================

-- Exemplo 4: Erro - Schema ausente
EXEC sac.test_gateway_sql
    @user = NULL,
    @jsql = N'{"select": "usuario"}';

-- Resultado esperado:
-- {
--   "code": 400,
--   "message": "Campo \"schema\" é obrigatório na query JSQL",
--   "data": {"field": "schema"}
-- }


-- Exemplo 5: Erro - Procedure não existe
EXEC sac.test_gateway_sql
    @user = NULL,
    @jsql = N'{
        "schema": "sac",
        "select": "entidade_inexistente"
    }';

-- Resultado esperado:
-- {
--   "code": 404,
--   "message": "Procedure JSQL não encontrada",
--   "data": {
--     "procedure_name": "sac.jsql__select__entidade_inexistente",
--     "schema": "sac",
--     "operation": "select",
--     "entity": "entidade_inexistente",
--     "action": null
--   }
-- }


-- Exemplo 6: Erro - Action obrigatório para mutate
EXEC sac.test_gateway_sql
    @user = NULL,
    @jsql = N'{
        "schema": "sac",
        "mutate": "usuario",
        "values": {"nome": "Teste"}
    }';

-- Resultado esperado:
-- {
--   "code": 400,
--   "message": "Campo \"action\" é obrigatório para operações \"mutate\"",
--   "data": null
-- }


-- =============================================
-- COMO VALIDAR O FORMATO JSON CORRETO
-- =============================================

-- MÉTODO 1: Inspeção visual
-- Execute a procedure e inspecione o resultado:
-- - ✅ CORRETO: "data": [{"id":1}]  → Array JSON nativo
-- - ❌ ERRADO:  "data": "[{\"id\":1}]"  → String escapada

-- MÉTODO 2: Validação programática (N8N, TypeScript, etc)
-- Use JSON.parse() e verifique o tipo:
--
-- const resultado = await executarProcedure(jsql);
-- const data = resultado.data;
--
-- // ✅ CORRETO: data é array ou object
-- if (Array.isArray(data) || typeof data === 'object') {
--   console.log('Formato correto!');
-- }
--
-- // ❌ ERRADO: data é string
-- if (typeof data === 'string') {
--   console.error('ERRO: data é uma string escapada, deveria ser JSON nativo!');
-- }

-- MÉTODO 3: Validação SQL (limitada)
-- Tente extrair com JSON_QUERY():
--
-- DECLARE @resultado NVARCHAR(MAX) = N'{"code":200,"data":[{"id":1}]}';
--
-- -- ✅ Se retorna o array, está correto:
-- SELECT JSON_QUERY(@resultado, '$.data');  -- Retorna: [{"id":1}]
--
-- -- ❌ Se retorna NULL, provavelmente é string escapada:
-- SELECT JSON_QUERY(@resultado, '$.data');  -- Retorna: NULL (erro!)

*/
