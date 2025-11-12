CREATE OR ALTER PROCEDURE tom.jsql__select__chamado
    @input NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        DECLARE @operation NVARCHAR(50) = JSON_VALUE(@input, '$.operation');
        DECLARE @entity NVARCHAR(50) = JSON_VALUE(@input, '$.entity');

        IF @operation != 'query' OR @entity != 'chamado'
        BEGIN
            SELECT 400 AS code, 'Invalid operation or entity' AS message, NULL AS data
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
            RETURN;
        END

        DECLARE @filter NVARCHAR(MAX) = JSON_QUERY(@input, '$.filter');
        DECLARE @limit INT = ISNULL(JSON_VALUE(@input, '$.args.limit'), 100);
        DECLARE @offset INT = ISNULL(JSON_VALUE(@input, '$.args.offset'), 0);

        SELECT
            t.DFid_chamado AS id_chamado,
            t.DFnumero_protocolo AS numero_protocolo,
            t.DFid_departamento AS id_departamento,
            t.DFid_categoria AS id_categoria,
            t.DFtitulo_chamado AS titulo_chamado,
            t.DFmensagem_inicial AS mensagem_inicial,
            t.DFdata_criacao AS data_criacao,
            t.DFdata_ultima_atualizacao AS data_ultima_atualizacao,
            t.DFid_situacao_chamado AS id_situacao_chamado,
            t.DFprioridade AS prioridade,
            t.DFid_contato AS id_contato,
            t.DFid_atendente_responsavel AS id_atendente_responsavel,
            t.DFdata_fechamento AS data_fechamento,
            t.DFsatisfacao_cliente AS satisfacao_cliente,
            t.DFobservacao_fechamento AS observacao_fechamento,
            t.DFtempo_resolucao_minutos AS tempo_resolucao_minutos,
            t.DFcampos_personalizados AS campos_personalizados,
            t.DFtarefa_gitlab AS tarefa_gitlab,
            t.DFacompanhamento_gerencial AS acompanhamento_gerencial,
            t.DFmotivo_encerramento AS motivo_encerramento,
            t.DFproduto_encerramento AS produto_encerramento,
            t.DFproblema_identificado AS problema_identificado,
            t.DFarea_contabil AS area_contabil,
            t.DFatividade_interna AS atividade_interna,
            t.DFurgencia_desenvolvimento AS urgencia_desenvolvimento
        INTO #temp_result
        FROM tom.TBchamado t WITH (NOLOCK)
        WHERE 1=1
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.id_chamado.eq') IS NULL OR t.DFid_chamado = JSON_VALUE(@filter, '$.id_chamado.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.numero_protocolo.eq') IS NULL OR t.DFnumero_protocolo = JSON_VALUE(@filter, '$.numero_protocolo.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.id_departamento.eq') IS NULL OR t.DFid_departamento = JSON_VALUE(@filter, '$.id_departamento.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.id_categoria.eq') IS NULL OR t.DFid_categoria = JSON_VALUE(@filter, '$.id_categoria.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.id_situacao_chamado.eq') IS NULL OR t.DFid_situacao_chamado = JSON_VALUE(@filter, '$.id_situacao_chamado.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.id_contato.eq') IS NULL OR t.DFid_contato = JSON_VALUE(@filter, '$.id_contato.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.id_atendente_responsavel.eq') IS NULL OR t.DFid_atendente_responsavel = JSON_VALUE(@filter, '$.id_atendente_responsavel.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.prioridade.eq') IS NULL OR t.DFprioridade = JSON_VALUE(@filter, '$.prioridade.eq'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.data_criacao.gte') IS NULL OR t.DFdata_criacao >= JSON_VALUE(@filter, '$.data_criacao.gte'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.data_criacao.lte') IS NULL OR t.DFdata_criacao <= JSON_VALUE(@filter, '$.data_criacao.lte'))
            AND (@filter IS NULL OR JSON_VALUE(@filter, '$.titulo_chamado.like') IS NULL OR t.DFtitulo_chamado LIKE JSON_VALUE(@filter, '$.titulo_chamado.like'))
        ORDER BY t.DFdata_criacao DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY;

        SELECT
            200 AS code,
            CAST(NULL AS NVARCHAR(MAX)) AS message,
            (SELECT * FROM #temp_result FOR JSON PATH) AS data
        FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;

        DROP TABLE #temp_result;

    END TRY
    BEGIN CATCH
        SELECT
            500 AS code,
            ERROR_MESSAGE() AS message,
            NULL AS data
        FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
    END CATCH
END;
GO