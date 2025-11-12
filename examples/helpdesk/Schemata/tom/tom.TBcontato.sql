/*
TBcontato - Tabela de contatos/clientes do sistema
Sistema TomTicket HelpDesk - Gestão de clientes que podem criar chamados
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'tom.TBcontato') IS NULL
BEGIN
    CREATE TABLE tom.TBcontato (
        DFid_contato INTEGER NOT NULL,
        DFnome_completo NVARCHAR(255) NOT NULL,
        DFemail NVARCHAR(255) NOT NULL,
        DFidentificador_conta NVARCHAR(50) NULL,
        DFtelefone NVARCHAR(50) NULL,
        DFid_organizacao INTEGER NOT NULL,
        DFlimite_chamados_mensal INTEGER NULL,
        DFproibido_criar_chamados CHAR(1) NOT NULL DEFAULT 'N',
        DFid_atendente_responsavel INTEGER NULL,
        DFcampos_personalizados NVARCHAR(MAX) NULL,
        DFempresa_informada NVARCHAR(255) NULL,
        DFsetor_informado NVARCHAR(100) NULL,

        CONSTRAINT PK__sac_TBcontato PRIMARY KEY (DFid_contato),
        CONSTRAINT UQ__sac_TBcontato__DFemail UNIQUE (DFemail),
        CONSTRAINT CK__sac_TBcontato__DFproibido_criar_chamados CHECK (DFproibido_criar_chamados IN ('S', 'N'))
    );
    PRINT 'Tabela tom.TBcontato criada com sucesso';
END
GO

-- Relacionamentos usando API
EXEC api.CRIAR_RELACAO 'tom.TBcontato', 'DFid_organizacao', 'tom.TBorganizacao', 'DFid_organizacao';
EXEC api.CRIAR_RELACAO 'tom.TBcontato', 'DFid_atendente_responsavel', 'tom.TBatendente', 'DFid_atendente';
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'tom.TBcontato', 'DFemail', 1; -- UNIQUE já criado via constraint
EXEC api.CRIAR_INDICE 'tom.TBcontato', 'DFid_organizacao';
EXEC api.CRIAR_INDICE 'tom.TBcontato', 'DFid_atendente_responsavel';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'tom.TBcontato', NULL, 'Define os clientes/usuários finais que podem criar chamados no sistema';
EXEC api.CRIAR_DESCRICAO 'tom.TBcontato', 'DFid_contato', 'Código único do cliente';
EXEC api.CRIAR_DESCRICAO 'tom.TBcontato', 'DFnome_completo', 'Nome do cliente';
EXEC api.CRIAR_DESCRICAO 'tom.TBcontato', 'DFemail', 'Email do cliente';
EXEC api.CRIAR_DESCRICAO 'tom.TBcontato', 'DFidentificador_conta', 'Identificador da conta do cliente';
EXEC api.CRIAR_DESCRICAO 'tom.TBcontato', 'DFtelefone', 'Telefone do cliente';
EXEC api.CRIAR_DESCRICAO 'tom.TBcontato', 'DFid_organizacao', 'Código da organização à qual o cliente pertence';
EXEC api.CRIAR_DESCRICAO 'tom.TBcontato', 'DFlimite_chamados_mensal', 'Limite de chamados mensais para o cliente';
EXEC api.CRIAR_DESCRICAO 'tom.TBcontato', 'DFproibido_criar_chamados', 'Indica se o cliente está proibido de criar chamados';
EXEC api.CRIAR_DESCRICAO 'tom.TBcontato', 'DFid_atendente_responsavel', 'Código do atendente responsável pelo cliente';
EXEC api.CRIAR_DESCRICAO 'tom.TBcontato', 'DFcampos_personalizados', 'Campos extras específicos do cliente em formato XML';
EXEC api.CRIAR_DESCRICAO 'tom.TBcontato', 'DFempresa_informada', 'Nome da empresa informada pelo cliente';
EXEC api.CRIAR_DESCRICAO 'tom.TBcontato', 'DFsetor_informado', 'Setor informado pelo cliente';
GO