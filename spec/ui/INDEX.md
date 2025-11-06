Módulos com Interfaces UI

  1. setup (configurador visual)
  - Dashboard Principal: visão geral da plataforma com estatísticas
  - Lista de Portais: gerenciar portais existentes
  - Criar/Editar Portal: formulário de configuração de portais
  - Módulos do Portal: ativar/desativar módulos com gestão de dependências
  - Instâncias de Módulo: criar e configurar instâncias
  - Configuração de Tema: theme mode, brand color, preview dual
  - Platform Settings: visualizar variáveis de ambiente e health checks (read-only)

  2. menu
  - Menu Lateral: navegação hierárquica com ícones e badges
  - Menu Superior: navegação compacta horizontal
  - Menu Mobile: drawer/offcanvas adaptativo
  - Context Menu: menu contextual por clique direito

  3. auth
  - Login: formulário de autenticação (email/senha)
  - Logout: confirmação de saída
  - Gestão de Sessões: listar e revogar sessões ativas

  4. app-components (biblioteca de componentes)
  - Sem interfaces próprias (fornece componentes: Tables, Charts, Forms, Cards, Modals)

  5. chat
  - Interface de Chat: mensagens em tempo real com SSE
  - Lista de Conversas: sidebar com conversas ativas
  - Criação de Conversa: formulário para nova conversa

  6. calendar
  - Visualização Mensal: grade de calendário com eventos
  - Visualização Semanal: eventos em timeline
  - Visualização Diária: eventos por dia
  - Formulário de Evento: criar/editar eventos

  7. task
  - Lista de Tarefas: kanban board ou lista
  - Formulário de Tarefa: criar/editar tarefas
  - Detalhes de Tarefa: visualização expandida

  8. notification
  - Centro de Notificações: lista de notificações recentes
  - Badge de Contador: indicador visual de não lidas
  - Toast/Snackbar: notificações temporárias

  9. notification-events (especialização)
  - Feed de Eventos: stream em tempo real via SSE
  - Filtros de Eventos: por tipo, data, origem

  10. docs (não especificado detalhadamente)
      - Interface de documentação (não detalhado na spec)

  11. billing (não especificado detalhadamente)
      - Interface de cobrança (não detalhado na spec)

  12. user-settings (não especificado detalhadamente)
      - Interface de configurações de usuário (não detalhado na spec)

  ---
  Observações:
  - setup tem a especificação de interface mais completa (spec/ui/setup-module-interfaces.md)
  - Módulos como app-components são bibliotecas e não têm interfaces próprias
  - Alguns módulos (docs, billing, user-settings) são mencionados mas não têm specs detalhadas ainda
  - A maioria segue padrões comuns: Lista → Formulário → Detalhes