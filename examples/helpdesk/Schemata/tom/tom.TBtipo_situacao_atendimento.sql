/*
TBtipo_situacao_atendimento - Tabela de situações de atendimento
Sistema TomTicket HelpDesk - Lookup table para status de atendimentos via chat
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'tom.TBtipo_situacao_atendimento') IS NULL
BEGIN
    CREATE TABLE tom.TBtipo_situacao_atendimento (
        DFtipo_situacao_atendimento CHAR(1) NOT NULL,
        DFdescricao NVARCHAR(50) NOT NULL,
        DFcor_hexadecimal CHAR(7) NULL,
        DFicone NVARCHAR(50) NULL,
        DFordem_exibicao INT NOT NULL,
        DFativo BIT DEFAULT 1,

        CONSTRAINT PK__tom_TBtipo_situacao_atendimento PRIMARY KEY (DFtipo_situacao_atendimento)
    );
    PRINT 'Tabela tom.TBtipo_situacao_atendimento criada com sucesso';
END
GO

-- População inicial (idempotente)
IF NOT EXISTS (SELECT 1 FROM tom.TBtipo_situacao_atendimento)
BEGIN
    INSERT INTO tom.TBtipo_situacao_atendimento (DFtipo_situacao_atendimento, DFdescricao, DFcor_hexadecimal, DFicone, DFordem_exibicao, DFativo) VALUES
    ('A', 'Aberto', '#28a745', 'circle-open', 1, 1),
    ('U', 'Em andamento', '#ffc107', 'progress', 2, 1),
    ('P', 'Pausado', '#6c757d', 'pause', 3, 1),
    ('F', 'Finalizado', '#dc3545', 'check-circle', 4, 1);
    PRINT 'Dados iniciais inseridos em tom.TBtipo_situacao_atendimento';
END
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'tom.TBtipo_situacao_atendimento', 'DFordem_exibicao';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'tom.TBtipo_situacao_atendimento', NULL, 'Define as situações/status possíveis de um atendimento via chat';
EXEC api.CRIAR_DESCRICAO 'tom.TBtipo_situacao_atendimento', 'DFtipo_situacao_atendimento', 'Código da situação (A=Aberto, F=Finalizado, U=Em andamento, P=Pausado)';
EXEC api.CRIAR_DESCRICAO 'tom.TBtipo_situacao_atendimento', 'DFdescricao', 'Descrição legível da situação';
EXEC api.CRIAR_DESCRICAO 'tom.TBtipo_situacao_atendimento', 'DFcor_hexadecimal', 'Cor em formato hexadecimal para exibição em interfaces';
EXEC api.CRIAR_DESCRICAO 'tom.TBtipo_situacao_atendimento', 'DFicone', 'Nome do ícone para exibição em interfaces';
EXEC api.CRIAR_DESCRICAO 'tom.TBtipo_situacao_atendimento', 'DFordem_exibicao', 'Ordem de exibição em interfaces';
EXEC api.CRIAR_DESCRICAO 'tom.TBtipo_situacao_atendimento', 'DFativo', 'Indica se a situação está ativa';
GO