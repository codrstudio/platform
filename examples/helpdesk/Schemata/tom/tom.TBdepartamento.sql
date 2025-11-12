/*
TBdepartamento - Tabela de departamentos/produtos do sistema
Sistema TomTicket HelpDesk - Organização dos atendimentos por departamento
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'tom.TBdepartamento') IS NULL
BEGIN
    CREATE TABLE tom.TBdepartamento (
        DFid_departamento INTEGER NOT NULL,
        DFnome_departamento NVARCHAR(255) NOT NULL,
        DFidentificador_produto NVARCHAR(50) NOT NULL,
        DFenvia_email_geral CHAR(1) NOT NULL DEFAULT 'N',
        DFenvia_email_equipe CHAR(1) NOT NULL DEFAULT 'N',
        DFtemplate_email_situacao NVARCHAR(MAX) NULL,
        DFativo CHAR(1) NOT NULL DEFAULT 'A',
        DFmensagem_inicial NVARCHAR(MAX) NULL,
        DFprivativo CHAR(1) NOT NULL DEFAULT 'N',
        DFemail_departamento NVARCHAR(255) NULL,
        DFenvia_email_departamento CHAR(1) NOT NULL DEFAULT 'S',
        DFemail_validado CHAR(1) NOT NULL DEFAULT 'S',
        DFdisponivel_chamado CHAR(1) NOT NULL DEFAULT 'S',

        CONSTRAINT PK__sac_TBdepartamento PRIMARY KEY (DFid_departamento),
        CONSTRAINT UQ__sac_TBdepartamento__DFidentificador_produto UNIQUE (DFidentificador_produto),
        CONSTRAINT CK__sac_TBdepartamento__DFenvia_email_geral CHECK (DFenvia_email_geral IN ('S', 'N')),
        CONSTRAINT CK__sac_TBdepartamento__DFenvia_email_equipe CHECK (DFenvia_email_equipe IN ('S', 'N')),
        CONSTRAINT CK__sac_TBdepartamento__DFativo CHECK (DFativo IN ('A', 'I')),
        CONSTRAINT CK__sac_TBdepartamento__DFprivativo CHECK (DFprivativo IN ('S', 'N')),
        CONSTRAINT CK__sac_TBdepartamento__DFenvia_email_departamento CHECK (DFenvia_email_departamento IN ('S', 'N')),
        CONSTRAINT CK__sac_TBdepartamento__DFemail_validado CHECK (DFemail_validado IN ('S', 'N')),
        CONSTRAINT CK__sac_TBdepartamento__DFdisponivel_chamado CHECK (DFdisponivel_chamado IN ('S', 'N'))
    );
    PRINT 'Tabela tom.TBdepartamento criada com sucesso';
END
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'tom.TBdepartamento', 'DFidentificador_produto', 1; -- UNIQUE já criado via constraint
EXEC api.CRIAR_INDICE 'tom.TBdepartamento', 'DFativo';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'tom.TBdepartamento', NULL, 'Define os departamentos/produtos disponíveis no sistema para organização dos atendimentos';
EXEC api.CRIAR_DESCRICAO 'tom.TBdepartamento', 'DFid_departamento', 'Código único do departamento/produto';
EXEC api.CRIAR_DESCRICAO 'tom.TBdepartamento', 'DFnome_departamento', 'Nome do departamento';
EXEC api.CRIAR_DESCRICAO 'tom.TBdepartamento', 'DFidentificador_produto', 'Identificador único do produto/departamento';
EXEC api.CRIAR_DESCRICAO 'tom.TBdepartamento', 'DFenvia_email_geral', 'Indica se envia email geral';
EXEC api.CRIAR_DESCRICAO 'tom.TBdepartamento', 'DFenvia_email_equipe', 'Indica se envia email para equipe';
EXEC api.CRIAR_DESCRICAO 'tom.TBdepartamento', 'DFtemplate_email_situacao', 'Template de email para mudança de situação';
EXEC api.CRIAR_DESCRICAO 'tom.TBdepartamento', 'DFativo', 'Situação do departamento (A=Ativo, I=Inativo)';
EXEC api.CRIAR_DESCRICAO 'tom.TBdepartamento', 'DFmensagem_inicial', 'Mensagem inicial padrão para atendimentos do departamento';
EXEC api.CRIAR_DESCRICAO 'tom.TBdepartamento', 'DFprivativo', 'Indica se o departamento é privativo';
EXEC api.CRIAR_DESCRICAO 'tom.TBdepartamento', 'DFemail_departamento', 'Email do departamento';
EXEC api.CRIAR_DESCRICAO 'tom.TBdepartamento', 'DFenvia_email_departamento', 'Indica se envia email do departamento';
EXEC api.CRIAR_DESCRICAO 'tom.TBdepartamento', 'DFemail_validado', 'Indica se o email foi validado';
EXEC api.CRIAR_DESCRICAO 'tom.TBdepartamento', 'DFdisponivel_chamado', 'Indica se está disponível para chamados';
GO