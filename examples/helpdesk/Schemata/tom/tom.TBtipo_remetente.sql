/*
TBtipo_remetente - Tabela de tipos de remetente de mensagem
Sistema TomTicket HelpDesk - Lookup table para identificar origem de mensagens
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'tom.TBtipo_remetente') IS NULL
BEGIN
    CREATE TABLE tom.TBtipo_remetente (
        DFtipo_remetente CHAR(1) NOT NULL,
        DFdescricao NVARCHAR(50) NOT NULL,
        DFicone NVARCHAR(50) NULL,
        DFordem_exibicao INT NOT NULL,
        DFativo BIT DEFAULT 1,

        CONSTRAINT PK__tom_TBtipo_remetente PRIMARY KEY (DFtipo_remetente)
    );
    PRINT 'Tabela tom.TBtipo_remetente criada com sucesso';
END
GO

-- População inicial (idempotente)
IF NOT EXISTS (SELECT 1 FROM tom.TBtipo_remetente)
BEGIN
    INSERT INTO tom.TBtipo_remetente (DFtipo_remetente, DFdescricao, DFicone, DFordem_exibicao, DFativo) VALUES
    ('C', 'Cliente', 'user', 1, 1),
    ('A', 'Atendente', 'headset', 2, 1),
    ('S', 'Sistema', 'robot', 3, 1);
    PRINT 'Dados iniciais inseridos em tom.TBtipo_remetente';
END
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'tom.TBtipo_remetente', 'DFordem_exibicao';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'tom.TBtipo_remetente', NULL, 'Define os tipos de remetente de mensagens no atendimento';
EXEC api.CRIAR_DESCRICAO 'tom.TBtipo_remetente', 'DFtipo_remetente', 'Código do tipo de remetente (C=Cliente, A=Atendente, S=Sistema)';
EXEC api.CRIAR_DESCRICAO 'tom.TBtipo_remetente', 'DFdescricao', 'Descrição legível do tipo de remetente';
EXEC api.CRIAR_DESCRICAO 'tom.TBtipo_remetente', 'DFicone', 'Nome do ícone para exibição em interfaces';
EXEC api.CRIAR_DESCRICAO 'tom.TBtipo_remetente', 'DFordem_exibicao', 'Ordem de exibição em interfaces';
EXEC api.CRIAR_DESCRICAO 'tom.TBtipo_remetente', 'DFativo', 'Indica se o tipo de remetente está ativo';
GO