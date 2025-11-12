/*
TBtipo_prioridade - Tabela de prioridades de chamado
Sistema TomTicket HelpDesk - Lookup table para níveis de prioridade de tickets
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'tom.TBtipo_prioridade') IS NULL
BEGIN
    CREATE TABLE tom.TBtipo_prioridade (
        DFtipo_prioridade CHAR(1) NOT NULL,
        DFdescricao NVARCHAR(50) NOT NULL,
        DFcor_hexadecimal CHAR(7) NULL,
        DFicone NVARCHAR(50) NULL,
        DFsla_horas INT NULL,
        DFordem_exibicao INT NOT NULL,
        DFativo BIT DEFAULT 1,

        CONSTRAINT PK__tom_TBtipo_prioridade PRIMARY KEY (DFtipo_prioridade)
    );
    PRINT 'Tabela tom.TBtipo_prioridade criada com sucesso';
END
GO

-- População inicial (idempotente)
IF NOT EXISTS (SELECT 1 FROM tom.TBtipo_prioridade)
BEGIN
    INSERT INTO tom.TBtipo_prioridade (DFtipo_prioridade, DFdescricao, DFcor_hexadecimal, DFicone, DFsla_horas, DFordem_exibicao, DFativo) VALUES
    ('U', 'Urgente', '#dc3545', 'fire', 4, 1, 1),
    ('A', 'Alta', '#ff9800', 'arrow-up', 24, 2, 1),
    ('N', 'Normal', '#007bff', 'arrow-right', 48, 3, 1),
    ('B', 'Baixa', '#28a745', 'arrow-down', 72, 4, 1);
    PRINT 'Dados iniciais inseridos em tom.TBtipo_prioridade';
END
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'tom.TBtipo_prioridade', 'DFordem_exibicao';
EXEC api.CRIAR_INDICE 'tom.TBtipo_prioridade', 'DFsla_horas';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'tom.TBtipo_prioridade', NULL, 'Define os níveis de prioridade de chamados/tickets';
EXEC api.CRIAR_DESCRICAO 'tom.TBtipo_prioridade', 'DFtipo_prioridade', 'Código da prioridade (B=Baixa, N=Normal, A=Alta, U=Urgente)';
EXEC api.CRIAR_DESCRICAO 'tom.TBtipo_prioridade', 'DFdescricao', 'Descrição legível da prioridade';
EXEC api.CRIAR_DESCRICAO 'tom.TBtipo_prioridade', 'DFcor_hexadecimal', 'Cor em formato hexadecimal para exibição em interfaces';
EXEC api.CRIAR_DESCRICAO 'tom.TBtipo_prioridade', 'DFicone', 'Nome do ícone para exibição em interfaces';
EXEC api.CRIAR_DESCRICAO 'tom.TBtipo_prioridade', 'DFsla_horas', 'Tempo de SLA em horas para esta prioridade';
EXEC api.CRIAR_DESCRICAO 'tom.TBtipo_prioridade', 'DFordem_exibicao', 'Ordem de exibição em interfaces';
EXEC api.CRIAR_DESCRICAO 'tom.TBtipo_prioridade', 'DFativo', 'Indica se a prioridade está ativa';
GO