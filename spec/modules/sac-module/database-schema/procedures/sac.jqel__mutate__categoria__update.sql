-- =============================================
-- Procedure: sac.jqel__mutate__categoria__update
--
-- PROPOSITO:
--   Atualizar categoria existente no sistema HelpDesk
--   Implementa contrato JQEL para operacao MUTATE com action UPDATE
--
-- CONTRATO JQEL:
--   Entrada: @jsql com estrutura {schema, mutate, action: "update", where, values}
--   Saida: JResult {code, message, data}
--
-- VALIDACOES:
--   - where.id: obrigatorio
--   - nome_categoria: se informado, deve ser unico
--   - codigo_categoria: se informado, deve ser unico
--   - prioridade_padrao: deve ser B, N, A ou U
--
-- EXEMPLOS:
--   EXEC sac.jqel__mutate__categoria__update
--       @user = N'{"sub": "1"}',
--       @jsql = N'{
--           "schema": "sac",
--           "mutate": "categoria",
--           "action": "update",
--           "where": {"id": {"$eq": 1}},
--           "values": {
--               "nome": "Suporte Tecnico Atualizado",
--               "descricao": "Nova descricao",
--               "cor": "#28a745"
--           }
--       }';
--
-- AUTOR: Coletivos Team
-- VERSAO: 1.0
-- DATA: 2025-11-13
-- =============================================

IF OBJECT_ID(N'sac.jqel__mutate__categoria__update', N'P') IS NULL
BEGIN
    EXEC(N'CREATE PROCEDURE sac.jqel__mutate__categoria__update AS SELECT 1');
END
GO

ALTER PROCEDURE sac.jqel__mutate__categoria__update
    @user NVARCHAR(MAX) = NULL,
    @jsql NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- Extrair where e values do JSQL
        DECLARE @where_id INT = TRY_CAST(JSON_VALUE(@jsql, '$.where.id.eq') AS INT);
        DECLARE @values NVARCHAR(MAX) = JSON_QUERY(@jsql, '$.values');

        -- Validar where.id obrigatorio
        IF @where_id IS NULL
        BEGIN
            SELECT
                400 AS code,
                'Campo "where.id" e obrigatorio para update' AS message,
                NULL AS data
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
            RETURN;
        END

        -- Validar values obrigatorio
        IF @values IS NULL
        BEGIN
            SELECT
                400 AS code,
                'Campo "values" e obrigatorio para update' AS message,
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

        -- Extrair campos individuais
        DECLARE @nome NVARCHAR(255) = JSON_VALUE(@values, '$.nome');
        DECLARE @codigo NVARCHAR(50) = JSON_VALUE(@values, '$.codigo');
        DECLARE @descricao NVARCHAR(500) = JSON_VALUE(@values, '$.descricao');
        DECLARE @id_categoria_pai INT = TRY_CAST(JSON_VALUE(@values, '$.id_categoria_pai') AS INT);
        DECLARE @cor CHAR(7) = JSON_VALUE(@values, '$.cor');
        DECLARE @icone NVARCHAR(50) = JSON_VALUE(@values, '$.icone');
        DECLARE @prioridade_padrao CHAR(1) = JSON_VALUE(@values, '$.prioridade_padrao');
        DECLARE @nivel_prioridade INT = TRY_CAST(JSON_VALUE(@values, '$.nivel_prioridade') AS INT);
        DECLARE @sla_padrao_horas INT = TRY_CAST(JSON_VALUE(@values, '$.sla_padrao_horas') AS INT);
        DECLARE @ativo BIT = TRY_CAST(JSON_VALUE(@values, '$.ativo') AS BIT);
        DECLARE @ordem INT = TRY_CAST(JSON_VALUE(@values, '$.ordem') AS INT);
        DECLARE @template_descricao NVARCHAR(MAX) = JSON_VALUE(@values, '$.template_descricao');
        DECLARE @observacoes NVARCHAR(MAX) = JSON_VALUE(@values, '$.observacoes');

        -- Validar unicidade de nome (se informado)
        IF @nome IS NOT NULL AND EXISTS (
            SELECT 1 FROM sac.TBcategoria
            WHERE DFnome_categoria = @nome
            AND DFid_categoria != @where_id
        )
        BEGIN
            SELECT
                400 AS code,
                'Ja existe outra categoria com este nome' AS message,
                (
                    SELECT
                        'nome' AS field,
                        @nome AS value
                    FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
                ) AS data
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
            RETURN;
        END

        -- Validar unicidade de codigo (se informado)
        IF @codigo IS NOT NULL AND EXISTS (
            SELECT 1 FROM sac.TBcategoria
            WHERE DFcodigo_categoria = @codigo
            AND DFid_categoria != @where_id
        )
        BEGIN
            SELECT
                400 AS code,
                'Ja existe outra categoria com este codigo' AS message,
                (
                    SELECT
                        'codigo' AS field,
                        @codigo AS value
                    FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
                ) AS data
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
            RETURN;
        END

        -- Validar prioridade_padrao (se informado)
        IF @prioridade_padrao IS NOT NULL AND @prioridade_padrao NOT IN ('B', 'N', 'A', 'U')
        BEGIN
            SELECT
                400 AS code,
                'Prioridade padrao invalida. Valores permitidos: B, N, A, U' AS message,
                (
                    SELECT
                        'prioridade_padrao' AS field,
                        @prioridade_padrao AS value
                    FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
                ) AS data
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
            RETURN;
        END

        -- Atualizar categoria (apenas campos informados)
        UPDATE sac.TBcategoria
        SET
            DFnome_categoria = ISNULL(@nome, DFnome_categoria),
            DFcodigo_categoria = ISNULL(@codigo, DFcodigo_categoria),
            DFdescricao = CASE WHEN @descricao IS NOT NULL THEN @descricao ELSE DFdescricao END,
            DFid_categoria_pai = CASE WHEN JSON_VALUE(@values, '$.id_categoria_pai') IS NOT NULL THEN @id_categoria_pai ELSE DFid_categoria_pai END,
            DFcor_hexadecimal = ISNULL(@cor, DFcor_hexadecimal),
            DFicone = ISNULL(@icone, DFicone),
            DFprioridade_padrao = ISNULL(@prioridade_padrao, DFprioridade_padrao),
            DFnivel_prioridade = CASE WHEN JSON_VALUE(@values, '$.nivel_prioridade') IS NOT NULL THEN @nivel_prioridade ELSE DFnivel_prioridade END,
            DFsla_padrao_horas = CASE WHEN JSON_VALUE(@values, '$.sla_padrao_horas') IS NOT NULL THEN @sla_padrao_horas ELSE DFsla_padrao_horas END,
            DFativo = ISNULL(@ativo, DFativo),
            DFordem_exibicao = CASE WHEN JSON_VALUE(@values, '$.ordem') IS NOT NULL THEN @ordem ELSE DFordem_exibicao END,
            DFtemplate_descricao = CASE WHEN @template_descricao IS NOT NULL THEN @template_descricao ELSE DFtemplate_descricao END,
            DFobservacoes = CASE WHEN @observacoes IS NOT NULL THEN @observacoes ELSE DFobservacoes END,
            DFdata_ultima_atualizacao = GETDATE()
        WHERE DFid_categoria = @where_id;

        -- Retornar categoria atualizada
        DECLARE @categoria_json NVARCHAR(MAX) = (
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
                DFordem_exibicao AS ordem
            FROM sac.TBcategoria
            WHERE DFid_categoria = @where_id
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
        );

        SELECT
            200 AS code,
            'Categoria atualizada com sucesso' AS message,
            JSON_QUERY(@categoria_json, '$') AS data
        FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;

    END TRY
    BEGIN CATCH
        -- Retornar erro padrao
        SELECT
            500 AS code,
            'Erro ao atualizar categoria: ' + ERROR_MESSAGE() AS message,
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
-- Teste 1: Atualizar nome e descricao
EXEC sac.jqel__mutate__categoria__update
    @user = NULL,
    @jsql = N'{
        "schema": "sac",
        "mutate": "categoria",
        "action": "update",
        "where": {"id": {"$eq": 1}},
        "values": {
            "nome": "Novo Nome",
            "descricao": "Nova descricao"
        }
    }';

-- Teste 2: Atualizar apenas cor
EXEC sac.jqel__mutate__categoria__update
    @user = NULL,
    @jsql = N'{
        "schema": "sac",
        "mutate": "categoria",
        "action": "update",
        "where": {"id": {"$eq": 1}},
        "values": {
            "cor": "#ff5722"
        }
    }';

-- Teste 3: Erro - ID nao existe
EXEC sac.jqel__mutate__categoria__update
    @user = NULL,
    @jsql = N'{
        "schema": "sac",
        "mutate": "categoria",
        "action": "update",
        "where": {"id": {"$eq": 99999}},
        "values": {
            "nome": "Teste"
        }
    }';
*/
