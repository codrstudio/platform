/*
TBcor_semantica - Tabela de cores semânticas do sistema
Sistema HelpDesk - Define paleta de cores para temas claro/escuro
Nova tabela: Sistema de cores centralizadas
*/

-- Criação da tabela (idempotente)
IF OBJECT_ID(N'sac.TBcor_semantica') IS NULL
BEGIN
    CREATE TABLE sac.TBcor_semantica (
        DFcor NVARCHAR(20) NOT NULL,
        DFnome_exibicao NVARCHAR(50) NOT NULL,
        DFdescricao NVARCHAR(200) NULL,
        DFhex_claro CHAR(7) NOT NULL, -- Cor para tema claro
        DFhex_escuro CHAR(7) NOT NULL, -- Cor para tema escuro
        DFhex_vibrante CHAR(7) NULL, -- Versão mais vibrante
        DFhex_pastel CHAR(7) NULL, -- Versão mais suave
        DFordem_exibicao INTEGER NOT NULL DEFAULT 0,
        DFativo BIT NOT NULL DEFAULT 1,
        DFdata_criacao DATETIME NOT NULL DEFAULT GETDATE(),
        DFobservacoes NVARCHAR(MAX) NULL,

        CONSTRAINT PK__sac_TBcor_semantica PRIMARY KEY (DFcor)
    );
    PRINT 'Tabela sac.TBcor_semantica criada com sucesso';
END
GO

-- População inicial (idempotente) - Cores vibrantes e pastel
IF NOT EXISTS (SELECT 1 FROM sac.TBcor_semantica)
BEGIN
    INSERT INTO sac.TBcor_semantica (DFcor, DFnome_exibicao, DFdescricao, DFhex_claro, DFhex_escuro, DFhex_vibrante, DFhex_pastel, DFordem_exibicao) VALUES
    -- Cores Semânticas
    ('trivial', 'Trivial', 'Para itens de baixa importância', '#e8f5e8', '#2d5a2d', '#4caf50', '#c8e6c9', 1),
    ('normal', 'Normal', 'Para itens de importância padrão', '#e3f2fd', '#1565c0', '#2196f3', '#bbdefb', 2),
    ('destacado', 'Destacado', 'Para itens que merecem atenção', '#fff3e0', '#e65100', '#ff9800', '#ffcc80', 3),
    ('sucesso', 'Sucesso', 'Para indicar sucesso ou conclusão', '#e8f5e8', '#2e7d32', '#4caf50', '#a5d6a7', 4),
    ('alerta', 'Alerta', 'Para avisos e atenção', '#fff8e1', '#f57f17', '#ffeb3b', '#fff176', 5),
    ('critico', 'Crítico', 'Para situações críticas ou urgentes', '#ffebee', '#c62828', '#f44336', '#ef9a9a', 6),
    
    -- Cores Nomeadas
    ('verde', 'Verde', 'Cor verde padrão', '#e8f5e8', '#2e7d32', '#4caf50', '#c8e6c9', 10),
    ('ciano', 'Ciano', 'Cor ciano/azul claro', '#e0f2f1', '#00695c', '#00bcd4', '#80deea', 11),
    ('azul', 'Azul', 'Cor azul padrão', '#e3f2fd', '#1565c0', '#2196f3', '#90caf9', 12),
    ('indigo', 'Índigo', 'Cor índigo/azul escuro', '#e8eaf6', '#283593', '#3f51b5', '#9fa8da', 13),
    ('roxo', 'Roxo', 'Cor roxa/violeta', '#f3e5f5', '#6a1b9a', '#9c27b0', '#ce93d8', 14),
    ('rosa', 'Rosa', 'Cor rosa', '#fce4ec', '#ad1457', '#e91e63', '#f48fb1', 15),
    ('laranja', 'Laranja', 'Cor laranja', '#fff3e0', '#e65100', '#ff9800', '#ffb74d', 16),
    ('amarelo', 'Amarelo', 'Cor amarela', '#fffde7', '#f57f17', '#ffeb3b', '#fff59d', 17),
    ('lime', 'Lima', 'Cor verde lima', '#f9fbe7', '#827717', '#cddc39', '#dce775', 18),
    ('cinza', 'Cinza', 'Cor cinza neutra', '#fafafa', '#424242', '#9e9e9e', '#e0e0e0', 19),
    ('marrom', 'Marrom', 'Cor marrom', '#efebe9', '#3e2723', '#795548', '#bcaaa4', 20);
    
    PRINT 'Dados iniciais inseridos em sac.TBcor_semantica';
END
GO


-- Índices usando API
EXEC api.CRIAR_INDICE 'sac.TBcor_semantica', 'DFcor', 1; -- PK já criado
EXEC api.CRIAR_INDICE 'sac.TBcor_semantica', 'DFativo';
EXEC api.CRIAR_INDICE 'sac.TBcor_semantica', 'DFordem_exibicao';
GO

-- Documentação usando API
EXEC api.CRIAR_DESCRICAO 'sac.TBcor_semantica', NULL, 'Define as cores semânticas e nomeadas do sistema com suporte a temas claro/escuro';
EXEC api.CRIAR_DESCRICAO 'sac.TBcor_semantica', 'DFcor', 'Código da cor (chave natural)';
EXEC api.CRIAR_DESCRICAO 'sac.TBcor_semantica', 'DFnome_exibicao', 'Nome de exibição da cor';
EXEC api.CRIAR_DESCRICAO 'sac.TBcor_semantica', 'DFdescricao', 'Descrição do uso da cor';
EXEC api.CRIAR_DESCRICAO 'sac.TBcor_semantica', 'DFhex_claro', 'Código hexadecimal para tema claro';
EXEC api.CRIAR_DESCRICAO 'sac.TBcor_semantica', 'DFhex_escuro', 'Código hexadecimal para tema escuro';
EXEC api.CRIAR_DESCRICAO 'sac.TBcor_semantica', 'DFhex_vibrante', 'Versão vibrante da cor';
EXEC api.CRIAR_DESCRICAO 'sac.TBcor_semantica', 'DFhex_pastel', 'Versão pastel da cor';
EXEC api.CRIAR_DESCRICAO 'sac.TBcor_semantica', 'DFordem_exibicao', 'Ordem de exibição em interfaces';
EXEC api.CRIAR_DESCRICAO 'sac.TBcor_semantica', 'DFativo', 'Indica se a cor está ativa (1=Sim, 0=Não)';
EXEC api.CRIAR_DESCRICAO 'sac.TBcor_semantica', 'DFdata_criacao', 'Data e hora de criação do registro';
EXEC api.CRIAR_DESCRICAO 'sac.TBcor_semantica', 'DFobservacoes', 'Observações sobre a cor';
GO

