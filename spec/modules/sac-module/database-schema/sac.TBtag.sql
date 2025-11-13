/*
TBtag - Tabela de tags universais do sistema
Sistema HelpDesk - Tags específicas por tipo de entidade
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'sac.TBtag') IS NULL
BEGIN
    CREATE TABLE sac.TBtag (
        DFtag NVARCHAR(50) NOT NULL,
        DFtipo_entidade NVARCHAR(20) NOT NULL,
        DFnome_exibicao NVARCHAR(100) NOT NULL,
        DFdescricao NVARCHAR(500) NULL,
        DFcor NVARCHAR(20) NOT NULL DEFAULT 'normal',
        DFpeso_ordenacao INTEGER NOT NULL DEFAULT 0,
        DFicone NVARCHAR(50) NULL,
        DFativo BIT NOT NULL DEFAULT 1,
        DFdata_criacao DATETIME NOT NULL DEFAULT GETDATE(),
        DFdata_ultima_atualizacao DATETIME NULL,
        DFobservacoes NVARCHAR(MAX) NULL,

        CONSTRAINT PK__sac_TBtag PRIMARY KEY (DFtag, DFtipo_entidade)
    );
    PRINT 'Tabela sac.TBtag criada com sucesso';
END
GO


-- Relacionamentos usando API
EXEC api.CRIAR_RELACAO 'sac.TBtag', 'DFcor', 'sac.TBcor_semantica', 'DFcor';
EXEC api.CRIAR_RELACAO 'sac.TBtag', 'DFtipo_entidade', 'sac.TBtipo_entidade', 'DFtipo_entidade';
GO

-- População inicial (idempotente) - Tags específicas por entidade
IF NOT EXISTS (SELECT 1 FROM sac.TBtag)
BEGIN
    -- Tags para Chamados
    INSERT INTO sac.TBtag (DFtag, DFtipo_entidade, DFnome_exibicao, DFdescricao, DFcor, DFpeso_ordenacao, DFicone) VALUES
    ('urgente', 'chamado', 'Urgente', 'Chamado que requer atenção imediata', 'critico', 100, 'alert-triangle'),
    ('bug', 'chamado', 'Bug', 'Problema ou erro no sistema', 'critico', 90, 'bug'),
    ('feature', 'chamado', 'Nova Funcionalidade', 'Solicitação de nova funcionalidade', 'destacado', 70, 'plus-circle'),
    ('melhoria', 'chamado', 'Melhoria', 'Sugestão de melhoria', 'normal', 60, 'trending-up'),
    ('duvida', 'chamado', 'Dúvida', 'Esclarecimento ou dúvida', 'trivial', 30, 'help-circle'),
    ('treinamento', 'chamado', 'Treinamento', 'Necessidade de treinamento', 'normal', 50, 'book-open'),
    ('cliente-vip', 'chamado', 'Cliente VIP', 'Chamado de cliente com atendimento prioritário', 'destacado', 95, 'star'),
    ('escalado', 'chamado', 'Escalado', 'Chamado escalado para nível superior', 'alerta', 85, 'arrow-up-circle'),
    ('critico', 'chamado', 'Crítico', 'Problema crítico que impede operação', 'critico', 98, 'alert-octagon'),
    ('recorrente', 'chamado', 'Recorrente', 'Problema que se repete frequentemente', 'alerta', 75, 'repeat'),
    
    -- Tags para Contatos
    ('vip', 'contato', 'VIP', 'Contato com prioridade especial', 'destacado', 90, 'crown'),
    ('tecnico', 'contato', 'Técnico', 'Contato com conhecimento técnico', 'azul', 70, 'tool'),
    ('decisor', 'contato', 'Decisor', 'Pessoa com poder de decisão', 'roxo', 80, 'briefcase'),
    ('usuario-final', 'contato', 'Usuário Final', 'Usuário final do sistema', 'verde', 40, 'user'),
    ('administrador', 'contato', 'Administrador', 'Administrador do sistema cliente', 'indigo', 75, 'shield'),
    ('novo-cliente', 'contato', 'Novo Cliente', 'Contato de cliente recém-adquirido', 'amarelo', 65, 'user-plus'),
    ('inativo', 'contato', 'Inativo', 'Contato que não utiliza mais o sistema', 'cinza', 10, 'user-x'),
    
    -- Tags para Atendentes
    ('especialista-erp', 'atendente', 'Especialista ERP', 'Especialista em sistemas ERP', 'azul', 85, 'database'),
    ('especialista-fiscal', 'atendente', 'Especialista Fiscal', 'Especialista em questões fiscais', 'verde', 85, 'file-text'),
    ('especialista-wms', 'atendente', 'Especialista WMS', 'Especialista em WMS', 'ciano', 85, 'package'),
    ('trainee', 'atendente', 'Trainee', 'Atendente em treinamento', 'amarelo', 20, 'graduation-cap'),
    ('supervisor', 'atendente', 'Supervisor', 'Supervisor de atendimento', 'roxo', 95, 'users'),
    ('senior', 'atendente', 'Sênior', 'Atendente sênior', 'indigo', 90, 'award'),
    ('junior', 'atendente', 'Júnior', 'Atendente júnior', 'lime', 60, 'user-plus'),
    ('lider-tecnico', 'atendente', 'Líder Técnico', 'Líder técnico da equipe', 'roxo', 92, 'star'),
    ('disponivel', 'atendente', 'Disponível', 'Atendente disponível para novos chamados', 'sucesso', 50, 'check-circle'),
    
    -- Tags para Atendimentos
    ('primeira-vez', 'atendimento', 'Primeira Vez', 'Primeiro atendimento do visitante', 'amarelo', 70, 'user-check'),
    ('recorrente', 'atendimento', 'Recorrente', 'Visitante com múltiplos atendimentos', 'laranja', 60, 'repeat'),
    ('satisfeito', 'atendimento', 'Satisfeito', 'Visitante demonstrou satisfação', 'sucesso', 50, 'thumbs-up'),
    ('insatisfeito', 'atendimento', 'Insatisfeito', 'Visitante demonstrou insatisfação', 'critico', 80, 'thumbs-down'),
    ('complexo', 'atendimento', 'Complexo', 'Atendimento de alta complexidade', 'roxo', 75, 'layers'),
    ('rapido', 'atendimento', 'Rápido', 'Atendimento resolvido rapidamente', 'sucesso', 45, 'zap'),
    ('abandonado', 'atendimento', 'Abandonado', 'Visitante abandonou o atendimento', 'alerta', 35, 'log-out'),
    
    -- Tags para Clientes
    ('premium', 'cliente', 'Premium', 'Cliente com plano premium', 'destacado', 95, 'star'),
    ('enterprise', 'cliente', 'Enterprise', 'Cliente corporativo grande', 'roxo', 90, 'building'),
    ('startup', 'cliente', 'Startup', 'Cliente startup/pequeno', 'verde', 60, 'trending-up'),
    ('parceiro', 'cliente', 'Parceiro', 'Cliente parceiro estratégico', 'azul', 85, 'handshake'),
    ('teste', 'cliente', 'Teste', 'Cliente em período de teste', 'amarelo', 40, 'clock'),
    ('inadimplente', 'cliente', 'Inadimplente', 'Cliente com pendências financeiras', 'critico', 25, 'alert-triangle'),
    ('ativo', 'cliente', 'Ativo', 'Cliente com uso regular do sistema', 'sucesso', 70, 'check-circle');
    
    PRINT 'Dados iniciais inseridos em sac.TBtag';
END
GO

-- Índices usando API
EXEC api.CRIAR_INDICE 'sac.TBtag', 'DFtag,DFtipo_entidade', 1; -- PK já criado
EXEC api.CRIAR_INDICE 'sac.TBtag', 'DFtipo_entidade';
EXEC api.CRIAR_INDICE 'sac.TBtag', 'DFcor';
EXEC api.CRIAR_INDICE 'sac.TBtag', 'DFpeso_ordenacao';
EXEC api.CRIAR_INDICE 'sac.TBtag', 'DFativo';
EXEC api.CRIAR_INDICE 'sac.TBtag', 'DFdata_criacao';
EXEC api.CRIAR_INDICE 'sac.TBtag', 'DFtipo_entidade,DFpeso_ordenacao';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'sac.TBtag', NULL, 'Define as tags específicas por tipo de entidade para categorização precisa';
EXEC api.CRIAR_DESCRICAO 'sac.TBtag', 'DFtag', 'Código da tag (chave natural composta)';
EXEC api.CRIAR_DESCRICAO 'sac.TBtag', 'DFtipo_entidade', 'Tipo de entidade para qual a tag foi criada';
EXEC api.CRIAR_DESCRICAO 'sac.TBtag', 'DFnome_exibicao', 'Nome de exibição da tag';
EXEC api.CRIAR_DESCRICAO 'sac.TBtag', 'DFdescricao', 'Descrição detalhada da tag';
EXEC api.CRIAR_DESCRICAO 'sac.TBtag', 'DFcor', 'Cor semântica da tag';
EXEC api.CRIAR_DESCRICAO 'sac.TBtag', 'DFpeso_ordenacao', 'Peso para ordenação (maior = mais importante)';
EXEC api.CRIAR_DESCRICAO 'sac.TBtag', 'DFicone', 'Nome do ícone para exibição';
EXEC api.CRIAR_DESCRICAO 'sac.TBtag', 'DFativo', 'Indica se a tag está ativa (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBtag', 'DFdata_criacao', 'Data e hora de criação do registro';
EXEC api.CRIAR_DESCRICAO 'sac.TBtag', 'DFdata_ultima_atualizacao', 'Data e hora da última atualização';
EXEC api.CRIAR_DESCRICAO 'sac.TBtag', 'DFobservacoes', 'Observações sobre a tag';
GO
