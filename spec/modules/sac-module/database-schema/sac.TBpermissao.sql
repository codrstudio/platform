/*
TBpermissao - Tabela de permissões disponíveis no sistema
Sistema HelpDesk - Define todas as permissões granulares do sistema
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'sac.TBpermissao') IS NULL
BEGIN
    CREATE TABLE sac.TBpermissao (
        DFid_permissao INTEGER IDENTITY(1,1) NOT NULL,
        DFcodigo_permissao NVARCHAR(100) NOT NULL, -- Ex: select__usuario, mutate__chamado__criar
        DFnome_permissao NVARCHAR(255) NOT NULL,
        DFdescricao NVARCHAR(500) NULL,
        DFcategoria NVARCHAR(50) NOT NULL, -- Ex: usuario, chamado, atendimento, sistema
        DFtipo_acao NVARCHAR(20) NOT NULL, -- select, mutate, configure
        DFrecurso NVARCHAR(50) NOT NULL, -- usuario, chamado, atendimento, etc
        DFoperacao NVARCHAR(50) NULL, -- criar, editar, remover, visualizar, etc
        DFativo BIT NOT NULL DEFAULT 1,
        DFdata_criacao DATETIME NOT NULL DEFAULT GETDATE(),
        DFobservacoes NVARCHAR(MAX) NULL,

        CONSTRAINT PK__sac_TBpermissao PRIMARY KEY (DFid_permissao),
        CONSTRAINT UQ__sac_TBpermissao__DFcodigo_permissao UNIQUE (DFcodigo_permissao)
    );
    PRINT 'Tabela sac.TBpermissao criada com sucesso';
END
GO

-- População inicial (idempotente) - Permissões básicas do sistema
IF NOT EXISTS (SELECT 1 FROM sac.TBpermissao)
BEGIN
    INSERT INTO sac.TBpermissao (DFcodigo_permissao, DFnome_permissao, DFdescricao, DFcategoria, DFtipo_acao, DFrecurso, DFoperacao) VALUES
    
    -- Permissões de Usuário
    ('select__usuario', 'Visualizar Usuários', 'Pode visualizar lista e detalhes de usuários', 'usuario', 'select', 'usuario', 'visualizar'),
    ('mutate__usuario__criar', 'Criar Usuários', 'Pode criar novos usuários', 'usuario', 'mutate', 'usuario', 'criar'),
    ('mutate__usuario__editar', 'Editar Usuários', 'Pode editar dados de usuários', 'usuario', 'mutate', 'usuario', 'editar'),
    ('mutate__usuario__remover', 'Remover Usuários', 'Pode remover usuários do sistema', 'usuario', 'mutate', 'usuario', 'remover'),
    ('mutate__usuario__papel', 'Gerenciar Papéis de Usuário', 'Pode atribuir/remover papéis de usuários', 'usuario', 'mutate', 'usuario', 'papel'),
    
    -- Permissões de Chamado
    ('select__chamado', 'Visualizar Chamados', 'Pode visualizar lista e detalhes de chamados', 'chamado', 'select', 'chamado', 'visualizar'),
    ('select__chamado__proprio', 'Visualizar Próprios Chamados', 'Pode visualizar apenas seus próprios chamados', 'chamado', 'select', 'chamado', 'proprio'),
    ('mutate__chamado__criar', 'Criar Chamados', 'Pode criar novos chamados', 'chamado', 'mutate', 'chamado', 'criar'),
    ('mutate__chamado__editar', 'Editar Chamados', 'Pode editar chamados', 'chamado', 'mutate', 'chamado', 'editar'),
    ('mutate__chamado__atribuir', 'Atribuir Chamados', 'Pode atribuir chamados a atendentes', 'chamado', 'mutate', 'chamado', 'atribuir'),
    ('mutate__chamado__status', 'Alterar Status de Chamados', 'Pode alterar status de chamados', 'chamado', 'mutate', 'chamado', 'status'),
    ('mutate__chamado__comentar', 'Comentar em Chamados', 'Pode adicionar comentários em chamados', 'chamado', 'mutate', 'chamado', 'comentar'),
    
    -- Permissões de Atendimento
    ('select__atendimento', 'Visualizar Atendimentos', 'Pode visualizar atendimentos', 'atendimento', 'select', 'atendimento', 'visualizar'),
    ('mutate__atendimento__iniciar', 'Iniciar Atendimentos', 'Pode iniciar novos atendimentos', 'atendimento', 'mutate', 'atendimento', 'iniciar'),
    ('mutate__atendimento__finalizar', 'Finalizar Atendimentos', 'Pode finalizar atendimentos', 'atendimento', 'mutate', 'atendimento', 'finalizar'),
    ('mutate__atendimento__transferir', 'Transferir Atendimentos', 'Pode transferir atendimentos', 'atendimento', 'mutate', 'atendimento', 'transferir'),
    
    -- Permissões de Cliente/Contato
    ('select__cliente', 'Visualizar Clientes', 'Pode visualizar dados de clientes', 'cliente', 'select', 'cliente', 'visualizar'),
    ('mutate__cliente__criar', 'Criar Clientes', 'Pode criar novos clientes', 'cliente', 'mutate', 'cliente', 'criar'),
    ('mutate__cliente__editar', 'Editar Clientes', 'Pode editar dados de clientes', 'cliente', 'mutate', 'cliente', 'editar'),
    ('select__contato', 'Visualizar Contatos', 'Pode visualizar contatos de clientes', 'contato', 'select', 'contato', 'visualizar'),
    ('mutate__contato__criar', 'Criar Contatos', 'Pode criar novos contatos', 'contato', 'mutate', 'contato', 'criar'),
    ('mutate__contato__editar', 'Editar Contatos', 'Pode editar dados de contatos', 'contato', 'mutate', 'contato', 'editar'),
    
    -- Permissões de Sistema/Configuração
    ('configure__sistema', 'Configurar Sistema', 'Pode alterar configurações gerais do sistema', 'sistema', 'configure', 'sistema', 'configurar'),
    ('configure__departamento', 'Configurar Departamentos', 'Pode gerenciar departamentos', 'sistema', 'configure', 'departamento', 'configurar'),
    ('configure__categoria', 'Configurar Categorias', 'Pode gerenciar categorias de chamados', 'sistema', 'configure', 'categoria', 'configurar'),
    ('configure__sla', 'Configurar SLA', 'Pode gerenciar configurações de SLA', 'sistema', 'configure', 'sla', 'configurar'),
    ('configure__template', 'Configurar Templates', 'Pode gerenciar templates de email', 'sistema', 'configure', 'template', 'configurar'),
    
    -- Permissões de Relatório/Auditoria
    ('select__relatorio', 'Visualizar Relatórios', 'Pode acessar relatórios do sistema', 'relatorio', 'select', 'relatorio', 'visualizar'),
    ('select__auditoria', 'Visualizar Auditoria', 'Pode acessar logs de auditoria', 'auditoria', 'select', 'auditoria', 'visualizar');
    
    PRINT 'Permissões básicas inseridas em sac.TBpermissao';
END
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'sac.TBpermissao', 'DFcodigo_permissao', 1; -- UNIQUE já criado via constraint
EXEC api.CRIAR_INDICE 'sac.TBpermissao', 'DFcategoria';
EXEC api.CRIAR_INDICE 'sac.TBpermissao', 'DFtipo_acao';
EXEC api.CRIAR_INDICE 'sac.TBpermissao', 'DFrecurso';
EXEC api.CRIAR_INDICE 'sac.TBpermissao', 'DFativo';
EXEC api.CRIAR_INDICE 'sac.TBpermissao', 'DFcategoria,DFtipo_acao';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'sac.TBpermissao', NULL, 'Define todas as permissões granulares disponíveis no sistema';
EXEC api.CRIAR_DESCRICAO 'sac.TBpermissao', 'DFid_permissao', 'Código único da permissão';
EXEC api.CRIAR_DESCRICAO 'sac.TBpermissao', 'DFcodigo_permissao', 'Código identificador da permissão (ex: select__usuario)';
EXEC api.CRIAR_DESCRICAO 'sac.TBpermissao', 'DFnome_permissao', 'Nome amigável da permissão';
EXEC api.CRIAR_DESCRICAO 'sac.TBpermissao', 'DFdescricao', 'Descrição detalhada da permissão';
EXEC api.CRIAR_DESCRICAO 'sac.TBpermissao', 'DFcategoria', 'Categoria da permissão (usuario, chamado, sistema, etc)';
EXEC api.CRIAR_DESCRICAO 'sac.TBpermissao', 'DFtipo_acao', 'Tipo de ação (select, mutate, configure)';
EXEC api.CRIAR_DESCRICAO 'sac.TBpermissao', 'DFrecurso', 'Recurso alvo da permissão';
EXEC api.CRIAR_DESCRICAO 'sac.TBpermissao', 'DFoperacao', 'Operação específica (criar, editar, remover, etc)';
EXEC api.CRIAR_DESCRICAO 'sac.TBpermissao', 'DFativo', 'Indica se a permissão está ativa (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBpermissao', 'DFdata_criacao', 'Data e hora de criação do registro';
EXEC api.CRIAR_DESCRICAO 'sac.TBpermissao', 'DFobservacoes', 'Observações sobre a permissão';
GO
