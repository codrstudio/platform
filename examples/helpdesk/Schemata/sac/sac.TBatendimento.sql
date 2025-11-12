/*
TBatendimento - Tabela de atendimentos/conversas via chat
Sistema HelpDesk - Gestão de atendimentos em tempo real entre contatos e atendentes
Derivada de: tom.TBatendimento (estrutura otimizada)
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'sac.TBatendimento') IS NULL
BEGIN
    CREATE TABLE sac.TBatendimento (
        DFid_atendimento INTEGER IDENTITY(1,1) NOT NULL,
        DFid_contato INTEGER NULL, -- Pode ser NULL para visitantes anônimos
        DFnome_visitante NVARCHAR(255) NOT NULL, -- Nome informado pelo visitante
        DFemail_visitante NVARCHAR(255) NOT NULL, -- Email informado pelo visitante
        DFtelefone_visitante NVARCHAR(50) NULL,
        DFid_atendente INTEGER NULL, -- Atendente responsável
        DFid_departamento INTEGER NULL, -- Departamento do atendimento
        DFstatus_atendimento CHAR(1) NOT NULL DEFAULT 'A', -- A=Aguardando, E=Em_Atendimento, F=Finalizado, C=Cancelado
        DFdata_inicio DATETIME NOT NULL DEFAULT GETDATE(),
        DFdata_primeiro_atendimento DATETIME NULL,
        DFdata_finalizacao DATETIME NULL,
        DFtempo_espera_minutos INTEGER NULL,
        DFtempo_atendimento_minutos INTEGER NULL,
        DFavaliacao_atendimento CHAR(1) NULL, -- E=Excelente, B=Bom, R=Regular, P=Péssimo
        DFcomentario_avaliacao NVARCHAR(MAX) NULL,
        DFobservacao_atendimento NVARCHAR(MAX) NULL,
        DFpagina_origem NVARCHAR(500) NULL, -- Página de onde veio o chat
        DFreferrer_url NVARCHAR(500) NULL, -- URL de referência
        DFendereco_ip NVARCHAR(45) NULL,
        DFuser_agent NVARCHAR(500) NULL,
        DFcidade_acesso NVARCHAR(100) NULL,
        DFestado_acesso NVARCHAR(100) NULL,
        DFpais_acesso NVARCHAR(100) NULL,
        DFfuso_horario NVARCHAR(50) NULL,
        DFidioma_navegador NVARCHAR(10) NULL,
        DFdispositivo_tipo NVARCHAR(20) NULL, -- DESKTOP, MOBILE, TABLET
        DFnavegador NVARCHAR(50) NULL,
        DFsistema_operacional NVARCHAR(50) NULL,
        DFcampos_personalizados NVARCHAR(MAX) NULL, -- JSON com campos extras
        DFtags NVARCHAR(MAX) NULL, -- JSON com tags do atendimento
        DFobservacoes NVARCHAR(MAX) NULL,

        CONSTRAINT PK__sac_TBatendimento PRIMARY KEY (DFid_atendimento),
        CONSTRAINT CK__sac_TBatendimento__DFstatus_atendimento CHECK (DFstatus_atendimento IN ('A', 'E', 'F', 'C')),
        CONSTRAINT CK__sac_TBatendimento__DFavaliacao_atendimento CHECK (DFavaliacao_atendimento IN ('E', 'B', 'R', 'P'))
    );
    PRINT 'Tabela sac.TBatendimento criada com sucesso';
END
GO

-- Relacionamentos usando API
EXEC api.CRIAR_RELACAO 'sac.TBatendimento', 'DFid_contato', 'sac.TBcontato', 'DFid_contato';
EXEC api.CRIAR_RELACAO 'sac.TBatendimento', 'DFid_atendente', 'sac.TBatendente', 'DFid_atendente';
EXEC api.CRIAR_RELACAO 'sac.TBatendimento', 'DFid_departamento', 'sac.TBdepartamento', 'DFid_departamento';
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'sac.TBatendimento', 'DFid_contato';
EXEC api.CRIAR_INDICE 'sac.TBatendimento', 'DFid_atendente';
EXEC api.CRIAR_INDICE 'sac.TBatendimento', 'DFid_departamento';
EXEC api.CRIAR_INDICE 'sac.TBatendimento', 'DFstatus_atendimento';
EXEC api.CRIAR_INDICE 'sac.TBatendimento', 'DFdata_inicio';
EXEC api.CRIAR_INDICE 'sac.TBatendimento', 'DFemail_visitante';
EXEC api.CRIAR_INDICE 'sac.TBatendimento', 'DFendereco_ip';
EXEC api.CRIAR_INDICE 'sac.TBatendimento', 'DFdata_inicio,DFstatus_atendimento';
EXEC api.CRIAR_INDICE 'sac.TBatendimento', 'DFid_atendente,DFstatus_atendimento';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento', NULL, 'Define os atendimentos/conversas via chat entre visitantes/contatos e atendentes';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento', 'DFid_atendimento', 'ID único do atendimento';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento', 'DFid_contato', 'ID do contato (se identificado)';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento', 'DFnome_visitante', 'Nome informado pelo visitante';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento', 'DFemail_visitante', 'Email informado pelo visitante';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento', 'DFtelefone_visitante', 'Telefone informado pelo visitante';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento', 'DFid_atendente', 'Atendente responsável pelo atendimento';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento', 'DFid_departamento', 'Departamento responsável pelo atendimento';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento', 'DFstatus_atendimento', 'Status do atendimento (A=Aguardando, E=Em_Atendimento, F=Finalizado, C=Cancelado)';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento', 'DFdata_inicio', 'Data e hora de início do atendimento';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento', 'DFdata_primeiro_atendimento', 'Data e hora do primeiro atendimento';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento', 'DFdata_finalizacao', 'Data e hora de finalização';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento', 'DFtempo_espera_minutos', 'Tempo de espera até primeiro atendimento em minutos';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento', 'DFtempo_atendimento_minutos', 'Tempo total de atendimento em minutos';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento', 'DFavaliacao_atendimento', 'Avaliação do atendimento (E=Excelente, B=Bom, R=Regular, P=Péssimo)';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento', 'DFcomentario_avaliacao', 'Comentário da avaliação';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento', 'DFobservacao_atendimento', 'Observações sobre o atendimento';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento', 'DFpagina_origem', 'Página de onde o chat foi iniciado';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento', 'DFreferrer_url', 'URL de referência';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento', 'DFendereco_ip', 'Endereço IP do visitante';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento', 'DFuser_agent', 'User agent do navegador';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento', 'DFcidade_acesso', 'Cidade de acesso (geolocalização)';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento', 'DFestado_acesso', 'Estado de acesso (geolocalização)';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento', 'DFpais_acesso', 'País de acesso (geolocalização)';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento', 'DFfuso_horario', 'Fuso horário do visitante';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento', 'DFidioma_navegador', 'Idioma do navegador';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento', 'DFdispositivo_tipo', 'Tipo de dispositivo (DESKTOP, MOBILE, TABLET)';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento', 'DFnavegador', 'Navegador utilizado';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento', 'DFsistema_operacional', 'Sistema operacional';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento', 'DFcampos_personalizados', 'Campos extras em formato JSON';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento', 'DFtags', 'Tags do atendimento em formato JSON';
EXEC api.CRIAR_DESCRICAO 'sac.TBatendimento', 'DFobservacoes', 'Observações gerais sobre o atendimento';
GO

