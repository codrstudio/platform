/*
TBatendimento - Tabela de atendimentos/conversas via chat
Sistema TomTicket HelpDesk - Gestão de atendimentos entre clientes e atendentes
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'tom.TBatendimento') IS NULL
BEGIN
    CREATE TABLE tom.TBatendimento (
        DFid_atendimento INTEGER NOT NULL,
        DFnome_cliente NVARCHAR(255) NOT NULL,
        DFemail_cliente NVARCHAR(255) NOT NULL,
        DFdata_inicio DATETIME NOT NULL,
        DFavaliacao_cliente CHAR(1) NULL,
        DFobservacao_atendimento NVARCHAR(MAX) NULL,
        DFsituacao_atendimento CHAR(1) NOT NULL,
        DFpagina_referencia NVARCHAR(500) NULL,
        DFcidade_acesso NVARCHAR(100) NULL,
        DFestado_acesso NVARCHAR(100) NULL,
        DFpais_acesso NVARCHAR(100) NULL,
        DFendereco_ip NVARCHAR(45) NULL,
        DFid_contato INTEGER NULL,
        DFid_atendente INTEGER NULL,
        DFcampos_personalizados NVARCHAR(MAX) NULL,
        -- Novos campos migrados de campos personalizados
        DFmodulo_wms NVARCHAR(200) NULL,
        DFmodulo_bi NVARCHAR(50) NULL,
        DFcomplexidade CHAR(1) NULL,
        DFmodulo_frente_loja NVARCHAR(100) NULL,
        DFmodulo_erp_director NVARCHAR(200) NULL,
        DFmodulo_fiscal NVARCHAR(100) NULL,

        CONSTRAINT PK__sac_TBatendimento PRIMARY KEY (DFid_atendimento),
        CONSTRAINT CK__sac_TBatendimento__DFavaliacao_cliente CHECK (DFavaliacao_cliente IN ('E', 'B', 'R', 'P')),
        CONSTRAINT CK__sac_TBatendimento__DFsituacao_atendimento CHECK (DFsituacao_atendimento IN ('A', 'F', 'U', 'P')),
        CONSTRAINT CK__sac_TBatendimento__DFcomplexidade CHECK (DFcomplexidade IN ('B', 'M', 'A', 'S'))
    );
    PRINT 'Tabela tom.TBatendimento criada com sucesso';
END
GO

-- Relacionamentos usando API
EXEC api.CRIAR_RELACAO 'tom.TBatendimento', 'DFid_contato', 'tom.TBcontato', 'DFid_contato';
EXEC api.CRIAR_RELACAO 'tom.TBatendimento', 'DFid_atendente', 'tom.TBatendente', 'DFid_atendente';

-- Relacionamentos com tabelas de tipo (lookup tables)
EXEC api.CRIAR_RELACAO 'tom.TBatendimento', 'DFavaliacao_cliente', 'tom.TBtipo_avaliacao', 'DFtipo_avaliacao';
EXEC api.CRIAR_RELACAO 'tom.TBatendimento', 'DFsituacao_atendimento', 'tom.TBtipo_situacao_atendimento', 'DFtipo_situacao_atendimento';
EXEC api.CRIAR_RELACAO 'tom.TBatendimento', 'DFcomplexidade', 'tom.TBtipo_complexidade', 'DFtipo_complexidade';
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'tom.TBatendimento', 'DFdata_inicio';
EXEC api.CRIAR_INDICE 'tom.TBatendimento', 'DFid_contato';
EXEC api.CRIAR_INDICE 'tom.TBatendimento', 'DFid_atendente';
EXEC api.CRIAR_INDICE 'tom.TBatendimento', 'DFsituacao_atendimento';
EXEC api.CRIAR_INDICE 'tom.TBatendimento', 'DFemail_cliente';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'tom.TBatendimento', NULL, 'Define os atendimentos/conversas via chat entre clientes e atendentes';
EXEC api.CRIAR_DESCRICAO 'tom.TBatendimento', 'DFid_atendimento', 'Número de protocolo único do atendimento';
EXEC api.CRIAR_DESCRICAO 'tom.TBatendimento', 'DFnome_cliente', 'Nome do cliente no atendimento';
EXEC api.CRIAR_DESCRICAO 'tom.TBatendimento', 'DFemail_cliente', 'Email do cliente no atendimento';
EXEC api.CRIAR_DESCRICAO 'tom.TBatendimento', 'DFdata_inicio', 'Data e hora do início do atendimento';
EXEC api.CRIAR_DESCRICAO 'tom.TBatendimento', 'DFavaliacao_cliente', 'Avaliação do atendimento pelo cliente (E=Excelente, B=Bom, R=Regular, P=Péssimo)';
EXEC api.CRIAR_DESCRICAO 'tom.TBatendimento', 'DFobservacao_atendimento', 'Observações adicionais sobre o atendimento';
EXEC api.CRIAR_DESCRICAO 'tom.TBatendimento', 'DFsituacao_atendimento', 'Situação atual do atendimento (A=Aberto, F=Finalizado, U=Em andamento, P=Pausado)';
EXEC api.CRIAR_DESCRICAO 'tom.TBatendimento', 'DFpagina_referencia', 'URL da página de referência de onde veio o atendimento';
EXEC api.CRIAR_DESCRICAO 'tom.TBatendimento', 'DFcidade_acesso', 'Cidade de acesso do cliente';
EXEC api.CRIAR_DESCRICAO 'tom.TBatendimento', 'DFestado_acesso', 'Estado de acesso do cliente';
EXEC api.CRIAR_DESCRICAO 'tom.TBatendimento', 'DFpais_acesso', 'País de acesso do cliente';
EXEC api.CRIAR_DESCRICAO 'tom.TBatendimento', 'DFendereco_ip', 'Endereço IP do cliente';
EXEC api.CRIAR_DESCRICAO 'tom.TBatendimento', 'DFid_contato', 'Código do cliente associado ao atendimento';
EXEC api.CRIAR_DESCRICAO 'tom.TBatendimento', 'DFid_atendente', 'Código do atendente responsável';
EXEC api.CRIAR_DESCRICAO 'tom.TBatendimento', 'DFcampos_personalizados', 'Campos extras específicos do atendimento em formato XML';
EXEC api.CRIAR_DESCRICAO 'tom.TBatendimento', 'DFmodulo_wms', 'Módulo WMS atendido';
EXEC api.CRIAR_DESCRICAO 'tom.TBatendimento', 'DFmodulo_bi', 'Módulo BI atendido';
EXEC api.CRIAR_DESCRICAO 'tom.TBatendimento', 'DFcomplexidade', 'Grau de complexidade do atendimento (B=Baixo, M=Médio, A=Alto, S=Solicitação de demanda)';
EXEC api.CRIAR_DESCRICAO 'tom.TBatendimento', 'DFmodulo_frente_loja', 'Produto frente de loja atendido';
EXEC api.CRIAR_DESCRICAO 'tom.TBatendimento', 'DFmodulo_erp_director', 'Módulo ERP Director atendido';
EXEC api.CRIAR_DESCRICAO 'tom.TBatendimento', 'DFmodulo_fiscal', 'Módulo fiscal atendido';
GO