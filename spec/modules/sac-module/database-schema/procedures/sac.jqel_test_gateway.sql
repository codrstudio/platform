-- =============================================
-- Procedure: sac.jqel_test_gateway
--
-- PROPOSITO:
--   Gateway de teste para validar implementacao de procedures JQEL.
--   Garante que procedures seguem o contrato JQEL e retornam JSON valido
--   no formato JResult correto.
--
-- O QUE FAZ:
--   1. Recebe uma query JQEL completa (com schema, select/mutate, action, etc)
--   2. Monta dinamicamente o nome da procedure JQEL correspondente
--   3. Valida que a procedure existe no banco
--   4. Executa a procedure e retorna o resultado
--   5. Permite testar procedures JQEL sem conhecer o nome exato
--
-- CONTRATO JQEL (JResult):
--   Todas as procedures JQEL DEVEM retornar um objeto JSON no formato:
--   {
--     "code": 200,
--     "message": "Mensagem descritiva",
--     "data": [...] ou {...} ou null
--   }
--
--   CRITICO - Formato do campo "data":
--
--   ERRADO - String escapada (JSON serializado como string):
--   {
--     "data": "[{\"id\":1,\"nome\":\"Joao\"}]"
--   }
--
--   CORRETO - Array/Object JSON nativo:
--   {
--     "data": [{"id":1,"nome":"Joao"}]
--   }
--
--   O campo "data" deve ser um valor JSON NATIVO (array, object, null),
--   NAO uma string contendo JSON serializado.
--
-- VALIDACAO:
--   Esta procedure garante que:
--   - A query JQEL esta bem formada (schema obrigatorio, operacao valida)
--   - A procedure JQEL correspondente existe no banco
--   - A procedure e executada com os parametros corretos
--
--   LIMITACAO TECNICA:
--   Nao e possivel capturar e validar o formato exato do JSON retornado
--   pela procedure JQEL dentro do SQL Server (FOR JSON PATH nao pode ser
--   armazenado em variaveis). A validacao do formato deve ser feita:
--   - Manualmente executando a procedure e inspecionando o resultado
--   - No workflow N8N que consome a API
--   - Em testes automatizados na aplicacao
--
-- USO:
--   EXEC sac.jqel_test_gateway
--       @user = N'{"id": "1", "email": "admin@processa.com", "roles": ["admin"]}',
--       @jsql = N'{"schema": "sac", "select": "usuario", "options": {"limit": 5}}';
--
-- PARAMETROS:
--   @user - Contexto do usuario autenticado (opcional, JSON)
--           Payload do JWT decodificado contendo: sub, email, roles, etc
--   @jsql - Query JQEL completa (obrigatorio, JSON)
--           Estrutura: {schema, select/mutate, action?, where?, values?, options?, output?, except?}
--
-- RETORNO:
--   - Se procedure nao existe: JResult com code 404
--   - Se validacao falha: JResult com code 400
--   - Caso contrario: Resultado direto da procedure JQEL executada
--
-- PADROES DE NOME DE PROCEDURE:
--   SELECT: {schema}.jqel__select__{entity}
--   MUTATE: {schema}.jqel__mutate__{entity}__{action}
--
--   Exemplos:
--   - sac.jqel__select__usuario
--   - sac.jqel__mutate__usuario__insert
--   - sac.jqel__mutate__chamado__close
--
-- AUTOR: Coletivos Team
-- VERSAO: 3.0
-- DATA: 2025-11-13
-- CHANGELOG:
--   3.0 - Alinhamento com workflow n8n (jsql, autorizacao)
--   2.0 - Adicao de validacao de formato JSON
--   1.0 - Versao inicial
-- =============================================

IF OBJECT_ID (
    N'sac.jqel_test_gateway',
    N'P'
) IS NULL BEGIN EXEC (
    'CREATE PROCEDURE sac.jqel_test_gateway AS SELECT 1'
);

END

GO

ALTER PROCEDURE sac.jqel_test_gateway
    @user NVARCHAR(MAX) = NULL,
    @jsql NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- 1. Validar @jsql
        IF @jsql IS NULL OR LTRIM(RTRIM(@jsql)) = ''
        BEGIN
            SELECT
                400 AS code,
                'Parametro @jsql e obrigatorio' AS message,
                NULL AS data
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
            RETURN;
        END

        -- 2. Validar formato JSON
        IF ISJSON(@jsql) = 0
        BEGIN
            SELECT
                400 AS code,
                'Parametro @jsql deve ser um JSON valido' AS message,
                NULL AS data
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
            RETURN;
        END

        -- 3. Extrair componentes da query JQEL
        DECLARE @schema NVARCHAR(50) = JSON_VALUE(@jsql, '$.schema');
        DECLARE @select_entity NVARCHAR(100) = JSON_VALUE(@jsql, '$.select');
        DECLARE @mutate_entity NVARCHAR(100) = JSON_VALUE(@jsql, '$.mutate');
        DECLARE @action NVARCHAR(100) = JSON_VALUE(@jsql, '$.action');

        -- 4. Validar schema obrigatorio
        IF @schema IS NULL OR LTRIM(RTRIM(@schema)) = ''
        BEGIN
            DECLARE @error_data_schema NVARCHAR(MAX) = (SELECT 'schema' AS field FOR JSON PATH, WITHOUT_ARRAY_WRAPPER);
            SELECT
                400 AS code,
                'Campo "schema" e obrigatorio na query JQEL' AS message,
                JSON_QUERY(@error_data_schema, '$') AS data
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
            RETURN;
        END

        -- 5. Validar schema permitido (sac e o schema principal deste modulo)
        IF @schema NOT IN ('sac', 'system')
        BEGIN
            SELECT
                400 AS code,
                'Schema invalido. Valores permitidos: sac, system' AS message,
                (
                    SELECT
                        'schema' AS field,
                        @schema AS value,
                        'sac, system' AS allowed
                    FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
                ) AS data
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
            RETURN;
        END

        -- 6. Determinar operacao e entidade
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

            -- Action e obrigatorio para mutate
            IF @action IS NULL OR LTRIM(RTRIM(@action)) = ''
            BEGIN
                SELECT
                    400 AS code,
                    'Campo "action" e obrigatorio para operacoes "mutate"' AS message,
                    NULL AS data
                FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
                RETURN;
            END
        END
        ELSE
        BEGIN
            SELECT
                400 AS code,
                'Query deve conter "select" ou "mutate"' AS message,
                NULL AS data
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
            RETURN;
        END

        -- 7. Montar nome da procedure dinamicamente
        DECLARE @procedure_name NVARCHAR(500);

        IF @action IS NOT NULL AND LTRIM(RTRIM(@action)) != ''
        BEGIN
            SET @procedure_name = @schema + '.jqel__' + @operation + '__' + @entity + '__' + @action;
        END
        ELSE
        BEGIN
            SET @procedure_name = @schema + '.jqel__' + @operation + '__' + @entity;
        END

        -- 8. Verificar se procedure existe
        DECLARE @procedure_exists BIT = 0;
        DECLARE @object_id INT;

        -- Extrair apenas o nome da procedure (sem schema)
        DECLARE @proc_name_only NVARCHAR(128) = SUBSTRING(
            @procedure_name,
            CHARINDEX('.', @procedure_name) + 1,
            LEN(@procedure_name)
        );

        -- Verificar existencia
        SELECT @object_id = OBJECT_ID(@schema + '.' + @proc_name_only, 'P');

        IF @object_id IS NOT NULL
        BEGIN
            SET @procedure_exists = 1;
        END

        IF @procedure_exists = 0
        BEGIN
            SELECT
                404 AS code,
                'Procedure JQEL nao encontrada' AS message,
                (
                    SELECT
                        @procedure_name AS procedure_name,
                        @schema AS [schema],
                        @operation AS operation,
                        @entity AS entity,
                        @action AS action
                    FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
                ) AS data
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
            RETURN;
        END

        -- 9. Executar procedure dinamicamente
        -- IMPORTANTE: Nao podemos capturar o resultado de FOR JSON PATH via variavel
        -- A unica forma e executar diretamente e retornar o resultado
        DECLARE @sql NVARCHAR(MAX);

        -- Montar comando de execucao
        -- As procedures JQEL recebem @user e @jsql
        SET @sql = N'EXEC ' + QUOTENAME(@schema) + '.' + QUOTENAME(@proc_name_only) +
                   N' @user = @user_param, @jsql = @jsql_param';

        -- Executar e retornar resultado diretamente
        EXEC sp_executesql
            @sql,
            N'@user_param NVARCHAR(MAX), @jsql_param NVARCHAR(MAX)',
            @user_param = @user,
            @jsql_param = @jsql;

        -- Se chegou aqui, a execucao foi bem-sucedida
        -- O resultado ja foi enviado ao cliente pela procedure JQEL
        RETURN;

    END TRY
    BEGIN CATCH
        -- Retornar erro de execucao
        SELECT
            500 AS code,
            'Erro ao executar teste: ' + ERROR_MESSAGE() AS message,
            (
                SELECT
                    ERROR_NUMBER() AS error_number,
                    ERROR_MESSAGE() AS error_message,
                    ERROR_SEVERITY() AS severity,
                    ERROR_STATE() AS state,
                    ERROR_LINE() AS line_number,
                    ERROR_PROCEDURE() AS procedure_name
                FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
            ) AS data
        FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
    END CATCH
END;

GO

-- =============================================
-- EXEMPLOS DE USO E VALIDACAO
-- =============================================

/*

-- =============================================
-- TESTES DE SUCESSO
-- =============================================

-- Exemplo 1: Testar SELECT basico
EXEC sac.jqel_test_gateway
    @user = N'{"sub": "1", "email": "admin@processa.com", "roles": ["admin"]}',
    @jsql = N'{
        "schema": "sac",
        "select": "usuario",
        "options": {"limit": 5}
    }';

-- Resultado esperado (CORRETO):
-- {
--   "code": 200,
--   "message": "Usuarios recuperados com sucesso",
--   "data": [
--     {"id_usuario": 1, "nome_completo": "Admin", "email": "admin@test.com"},
--     {"id_usuario": 2, "nome_completo": "Joao", "email": "joao@test.com"}
--   ]
-- }
--
-- VALIDAR: "data" deve ser um ARRAY JSON, nao uma string escapada!


-- Exemplo 2: Testar SELECT com projecao (output)
EXEC sac.jqel_test_gateway
    @user = N'{"sub": "1"}',
    @jsql = N'{
        "schema": "sac",
        "select": "usuario",
        "options": {"limit": 5},
        "output": ["id_usuario", "nome_completo", "email"]
    }';

-- Resultado esperado: apenas os campos especificados em "output"


-- Exemplo 3: Testar SELECT com exclusao (except)
EXEC sac.jqel_test_gateway
    @user = N'{"sub": "1"}',
    @jsql = N'{
        "schema": "sac",
        "select": "usuario",
        "options": {"limit": 5},
        "except": ["senha_hash", "token_recuperacao"]
    }';

-- Resultado esperado: todos os campos EXCETO os listados em "except"


-- Exemplo 4: Testar SELECT com filtro (where)
EXEC sac.jqel_test_gateway
    @user = N'{"sub": "1"}',
    @jsql = N'{
        "schema": "sac",
        "select": "usuario",
        "where": {
            "ativo": {"$eq": 1}
        },
        "options": {"limit": 10}
    }';


-- Exemplo 5: Testar MUTATE com action (insert)
EXEC sac.jqel_test_gateway
    @user = N'{"sub": "1", "email": "admin@processa.com"}',
    @jsql = N'{
        "schema": "sac",
        "mutate": "usuario",
        "action": "insert",
        "values": {
            "nome_completo": "Teste Gateway",
            "email": "teste.gateway@test.com",
            "ativo": 1
        }
    }';

-- Resultado esperado (CORRETO):
-- {
--   "code": 201,
--   "message": "Usuario criado com sucesso",
--   "data": {
--     "id_usuario": 123,
--     "nome_completo": "Teste Gateway",
--     "email": "teste.gateway@test.com"
--   }
-- }
--
-- VALIDAR: "data" deve ser um OBJECT JSON, nao uma string escapada!


-- Exemplo 6: Testar MUTATE com action (update)
EXEC sac.jqel_test_gateway
    @user = N'{"sub": "1"}',
    @jsql = N'{
        "schema": "sac",
        "mutate": "usuario",
        "action": "update",
        "where": {
            "id_usuario": {"$eq": 123}
        },
        "values": {
            "nome_completo": "Teste Gateway Atualizado"
        }
    }';


-- Exemplo 7: Testar SELECT com action customizada
EXEC sac.jqel_test_gateway
    @user = N'{"sub": "1"}',
    @jsql = N'{
        "schema": "sac",
        "select": "chamado",
        "action": "dashboard",
        "where": {
            "status": {"$eq": "aberto"}
        }
    }';


-- =============================================
-- TESTES DE VALIDACAO (Erros Esperados)
-- =============================================

-- Exemplo 8: Erro - Schema ausente
EXEC sac.jqel_test_gateway
    @user = NULL,
    @jsql = N'{"select": "usuario"}';

-- Resultado esperado:
-- {
--   "code": 400,
--   "message": "Campo \"schema\" e obrigatorio na query JQEL",
--   "data": {"field": "schema"}
-- }


-- Exemplo 9: Erro - Procedure nao existe
EXEC sac.jqel_test_gateway
    @user = NULL,
    @jsql = N'{
        "schema": "sac",
        "select": "entidade_inexistente"
    }';

-- Resultado esperado:
-- {
--   "code": 404,
--   "message": "Procedure JQEL nao encontrada",
--   "data": {
--     "procedure_name": "sac.jqel__select__entidade_inexistente",
--     "schema": "sac",
--     "operation": "select",
--     "entity": "entidade_inexistente",
--     "action": null
--   }
-- }


-- Exemplo 10: Erro - Action obrigatorio para mutate
EXEC sac.jqel_test_gateway
    @user = NULL,
    @jsql = N'{
        "schema": "sac",
        "mutate": "usuario",
        "values": {"nome": "Teste"}
    }';

-- Resultado esperado:
-- {
--   "code": 400,
--   "message": "Campo \"action\" e obrigatorio para operacoes \"mutate\"",
--   "data": null
-- }


-- Exemplo 11: Erro - JSON invalido
EXEC sac.jqel_test_gateway
    @user = NULL,
    @jsql = N'{"schema": "sac", select: "usuario"}';  -- JSON invalido (falta aspas)

-- Resultado esperado:
-- {
--   "code": 400,
--   "message": "Parametro @jsql deve ser um JSON valido",
--   "data": null
-- }


-- =============================================
-- COMO VALIDAR O FORMATO JSON CORRETO
-- =============================================

-- METODO 1: Inspecao visual
-- Execute a procedure e inspecione o resultado:
-- - CORRETO: "data": [{"id":1}]  -> Array JSON nativo
-- - ERRADO:  "data": "[{\"id\":1}]"  -> String escapada

-- METODO 2: Validacao programatica (N8N, TypeScript, etc)
-- Use JSON.parse() e verifique o tipo:
--
-- const resultado = await executarProcedure(jsql);
-- const data = resultado.data;
--
-- // CORRETO: data e array ou object
-- if (Array.isArray(data) || typeof data === 'object') {
--   console.log('Formato correto!');
-- }
--
-- // ERRADO: data e string
-- if (typeof data === 'string') {
--   console.error('ERRO: data e uma string escapada, deveria ser JSON nativo!');
-- }

-- METODO 3: Validacao SQL (limitada)
-- Tente extrair com JSON_QUERY():
--
-- DECLARE @resultado NVARCHAR(MAX) = N'{"code":200,"data":[{"id":1}]}';
--
-- -- Se retorna o array, esta correto:
-- SELECT JSON_QUERY(@resultado, '$.data');  -- Retorna: [{"id":1}]
--
-- -- Se retorna NULL, provavelmente e string escapada:
-- SELECT JSON_QUERY(@resultado, '$.data');  -- Retorna: NULL (erro!)


-- =============================================
-- INTEGRACAO COM N8N WORKFLOW
-- =============================================

-- O workflow n8n "request" (ativo) espera:
-- POST https://n8n.codrstudio.dev/webhook/api/1/request
--
-- Body:
-- {
--   "schema": "sac",
--   "select": "usuario",
--   "options": {"limit": 5}
-- }
--
-- Headers:
-- Cookie: access_token={JWT_TOKEN}
--
-- O workflow:
-- 1. Valida o JWT e extrai o payload do usuario
-- 2. Checa permissoes via procedure (futuro)
-- 3. Monta o nome da procedure: sac.jqel__select__usuario
-- 4. Executa: EXEC sac.jqel__select__usuario @user='...', @jsql='...'
-- 5. Retorna o resultado com code 200/400/500

*/
