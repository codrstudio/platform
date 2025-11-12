/*
TBorganizacao - Tabela de organizações/empresas clientes
Sistema TomTicket HelpDesk - Gestão de organizações do sistema
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'tom.TBorganizacao') IS NULL
BEGIN
    CREATE TABLE tom.TBorganizacao (
        DFid_organizacao INTEGER NOT NULL,
        DFnome_organizacao NVARCHAR(255) NOT NULL,
        DFsite_web NVARCHAR(255) NULL,
        DFtelefone NVARCHAR(50) NULL,
        DFemail NVARCHAR(255) NULL,
        DFlimite_chamados_mensal INTEGER NULL DEFAULT 0,
        DFproibido_criar_chamados CHAR(1) NOT NULL DEFAULT 'N',
        DFcampos_personalizados NVARCHAR(MAX) NULL,

        CONSTRAINT PK__sac_TBorganizacao PRIMARY KEY (DFid_organizacao),
        CONSTRAINT CK__sac_TBorganizacao__DFproibido_criar_chamados CHECK (DFproibido_criar_chamados IN ('S', 'N'))
    );
    PRINT 'Tabela tom.TBorganizacao criada com sucesso';
END
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'tom.TBorganizacao', 'DFnome_organizacao';
EXEC api.CRIAR_INDICE 'tom.TBorganizacao', 'DFproibido_criar_chamados';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'tom.TBorganizacao', NULL, 'Define as organizações/empresas clientes no sistema TomTicket';
EXEC api.CRIAR_DESCRICAO 'tom.TBorganizacao', 'DFid_organizacao', 'Código único da organização';
EXEC api.CRIAR_DESCRICAO 'tom.TBorganizacao', 'DFnome_organizacao', 'Nome da organização';
EXEC api.CRIAR_DESCRICAO 'tom.TBorganizacao', 'DFsite_web', 'Website da organização';
EXEC api.CRIAR_DESCRICAO 'tom.TBorganizacao', 'DFtelefone', 'Telefone da organização';
EXEC api.CRIAR_DESCRICAO 'tom.TBorganizacao', 'DFemail', 'Email da organização';
EXEC api.CRIAR_DESCRICAO 'tom.TBorganizacao', 'DFlimite_chamados_mensal', 'Limite de chamados mensais para a organização';
EXEC api.CRIAR_DESCRICAO 'tom.TBorganizacao', 'DFproibido_criar_chamados', 'Indica se a organização está proibida de criar chamados';
EXEC api.CRIAR_DESCRICAO 'tom.TBorganizacao', 'DFcampos_personalizados', 'Campos extras específicos da organização em formato XML';
GO