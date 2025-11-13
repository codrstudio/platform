-- =============================================
-- Procedure: sac.jqel__mutate__categoria__insert
--
-- PROPOSITO:
--   Inserir nova categoria no sistema HelpDesk
--   Implementa contrato JQEL para operacao MUTATE com action INSERT
--
-- CONTRATO JQEL:
--   Entrada: @jsql com estrutura {schema, mutate, action: "insert", values}
--   Saida: JResult {code, message, data}
--
-- VALIDACOES:
--   - nome_categoria: obrigatorio, unico
--   - codigo_categoria: obrigatorio, unico
--   - prioridade_padrao: deve ser B, N, A ou U
--
-- EXEMPLOS:
--   EXEC sac.jqel__mutate__categoria__insert
--       @user = N'{"sub": "1", "email": "admin@test.com"}',
--       @jsql = N'{
--           "schema": "sac",
--           "mutate": "categoria",
--           "action": "insert",
--           "values": {
--               "nome": "Suporte Tecnico",
--               "codigo": "SUP-TEC",
--               "descricao": "Problemas tecnicos gerais",
--               "cor": "#007bff",
--               "icone": "wrench",
--               "ativo": 1
--           }
--       }';
--
-- AUTOR: Coletivos Team
-- VERSAO: 1.0
-- DATA: 2025-11-13
-- =============================================

IF OBJECT_ID(N'sac.jqel__mutate__categoria__insert', N'P') IS NULL
BEGIN
    EXEC(N'CREATE PROCEDURE sac.jqel__mutate__categoria__insert AS SELECT 1');
END
GO

ALTER PROCEDURE sac.jqel__mutate__categoria__insert
    @user NVARCHAR(MAX) = NULL,
    @jsql NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- Extrair values do JSQL
        DECLARE @values NVARCHAR(MAX) = JSON_QUERY(@jsql, '$.values');

        IF @values IS NULL
        BEGIN
            SELECT
                400 AS code,
                'Campo "values" e obrigatorio para insert' AS message,
                NULL AS data
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

        -- Validacoes obrigatorias
        IF @nome IS NULL OR LTRIM(RTRIM(@nome)) = ''
        BEGIN
            SELECT
                400 AS code,
                'Campo "nome" e obrigatorio' AS message,
                (SELECT 'nome' AS field FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) AS data
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
            RETURN;
        END

        IF @codigo IS NULL OR LTRIM(RTRIM(@codigo)) = ''
        BEGIN
            SELECT
                400 AS code,
                'Campo "codigo" e obrigatorio' AS message,
                (SELECT 'codigo' AS field FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) AS data
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
            RETURN;
        END

        -- Validar unicidade de nome
        IF EXISTS (SELECT 1 FROM sac.TBcategoria WHERE DFnome_categoria = @nome)
        BEGIN
            SELECT
                400 AS code,
                'Ja existe uma categoria com este nome' AS message,
                (
                    SELECT
                        'nome' AS field,
                        @nome AS value
                    FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
                ) AS data
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
            RETURN;
        END

        -- Validar unicidade de codigo
        IF EXISTS (SELECT 1 FROM sac.TBcategoria WHERE DFcodigo_categoria = @codigo)
        BEGIN
            SELECT
                400 AS code,
                'Ja existe uma categoria com este codigo' AS message,
                (
                    SELECT
                        'codigo' AS field,
                        @codigo AS value
                    FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
                ) AS data
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
            RETURN;
        END

        -- Validar prioridade_padrao
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

        -- Definir valores padrao
        SET @cor = ISNULL(@cor, '#6c757d');
        SET @icone = ISNULL(@icone, 'tag');
        SET @prioridade_padrao = ISNULL(@prioridade_padrao, 'N');
        SET @ativo = ISNULL(@ativo, 1);
        SET @ordem = ISNULL(@ordem, 0);

        -- Inserir categoria
        DECLARE @id_novo INT;

        INSERT INTO sac.TBcategoria (
            DFnome_categoria,
            DFcodigo_categoria,
            DFdescricao,
            DFid_categoria_pai,
            DFcor_hexadecimal,
            DFicone,
            DFprioridade_padrao,
            DFnivel_prioridade,
            DFsla_padrao_horas,
            DFativo,
            DFordem_exibicao,
            DFtemplate_descricao,
            DFobservacoes,
            DFdata_criacao
        )
        VALUES (
            @nome,
            @codigo,
            @descricao,
            @id_categoria_pai,
            @cor,
            @icone,
            @prioridade_padrao,
            @nivel_prioridade,
            @sla_padrao_horas,
            @ativo,
            @ordem,
            @template_descricao,
            @observacoes,
            GETDATE()
        );

        SET @id_novo = SCOPE_IDENTITY();

        -- Retornar categoria criada
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
                DFordem_exibicao AS ordem
            FROM sac.TBcategoria
            WHERE DFid_categoria = @id_novo
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
        );

        SELECT
            201 AS code,
            'Categoria criada com sucesso' AS message,
            JSON_QUERY(@categoria_json, '$') AS data
        FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;

    END TRY
    BEGIN CATCH
        -- Retornar erro padrao
        SELECT
            500 AS code,
            'Erro ao criar categoria: ' + ERROR_MESSAGE() AS message,
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
-- Teste 1: Inserir categoria basica
EXEC sac.jqel__mutate__categoria__insert
    @user = NULL,
    @jsql = N'{
        "schema": "sac",
        "mutate": "categoria",
        "action": "insert",
        "values": {
            "nome": "Suporte Tecnico",
            "codigo": "SUP-TEC",
            "descricao": "Problemas tecnicos gerais"
        }
    }';

-- Teste 2: Inserir categoria completa
EXEC sac.jqel__mutate__categoria__insert
    @user = NULL,
    @jsql = N'{
        "schema": "sac",
        "mutate": "categoria",
        "action": "insert",
        "values": {
            "nome": "Hardware",
            "codigo": "HW",
            "descricao": "Problemas com equipamentos",
            "cor": "#dc3545",
            "icone": "cpu",
            "prioridade_padrao": "A",
            "nivel_prioridade": 3,
            "sla_padrao_horas": 4,
            "ativo": 1,
            "ordem": 10
        }
    }';

-- Teste 3: Erro - Nome obrigatorio
EXEC sac.jqel__mutate__categoria__insert
    @user = NULL,
    @jsql = N'{
        "schema": "sac",
        "mutate": "categoria",
        "action": "insert",
        "values": {
            "codigo": "TEST"
        }
    }';
*/
