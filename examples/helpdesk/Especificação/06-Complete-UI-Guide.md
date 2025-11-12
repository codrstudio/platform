# Complete UI Guide - Coletivos HelpDesk

## 📋 Visão Geral

Este guia complementar descreve cada interface do sistema Coletivos HelpDesk, combinando as User Stories com detalhes específicos dos campos de tabelas relacionados, fornecendo uma visão completa para implementação das interfaces.

---

## 🏗️ Layout Corporativo da Área de Trabalho

### [ ] UI000 - Shell Principal da Aplicação
**Descrição:** Layout base sidebar-only que envolve todas as interfaces do sistema (exceto login e páginas públicas)
**Componentes:** MainLayout, AppSidebar, Breadcrumb, PageMenu (opcional), PageContent
**Acesso:** Usuários autenticados

**Layout Visual Completo:**
```
┌──────────────────┬─────────────────────────────────────────────────────────┐
│ [logo] Coletivos │                                                         │
│    Helpdesk  [<<]│  Home > Seção > Item                    ← Breadcrumb   │
├──────────────────┼──────────────────┬──────────────────────────────────────┤
│ [👤] User     [>]│                  │                                      │
│ [🔔] Notific. [>]│  [icon] Menu 1   │                                      │
├──────────────────┤  [icon] Menu 2   │                                      │
│ [🔍] Buscar      │  [icon] Menu 3   │        Page Content                  │
├──────────────────┤                  │                                      │
│ [🏠] Home        │   PageMenu       │                                      │
│ [🎫] Chamados    │  (opcional)      │                                      │
│ [👥] Clientes    │                  │                                      │
│ [📊] Relatórios  │                  │                                      │
├──────────────────┤                  │                                      │
│ [⚙️] Config.     │                  │                                      │
└──────────────────┴──────────────────┴──────────────────────────────────────┘
     AppSidebar          PageMenu              PageContent
    280px/80px           240px (opt)           restante
```

---

#### A. Sidebar (Navegação Lateral - 280px expandido, 80px colapsado)

**Estrutura Visual (Expandido):**
```
┌─────────────────────────┐
│ 🏢 Coletivos            │◀── Brand + Collapse
│    Helpdesk             │
├─────────────────────────┤
│                         │
│ 🔔 Notificações      ▼  │
│   └ Nenhuma notificação │
│                         │
│ 🔍 Buscar (Ctrl+P)      │◀── Command Palette
│                         │
├─────────────────────────┤
│                         │
│ 🏠 Home                 │
│ 🎫 Chamados             │
│ 👥 Clientes             │
│ 📊 Relatórios           │
│                         │
├─────────────────────────┤
├─────────────────────────┤
│                         │
│ ⚙️  Configurações       │
│                         │
│ 👤 Maria Silva       ▼  │◀── Menu de Usuário
│   └ 👤 Meu Perfil       │
│   └ 🎨 Tema: Escuro     │
│   └ ───────────────     │
│   └ 🚪 Sair             │
│                         │
└─────────────────────────┘
```

**Estrutura do Sidebar:**

| Seção | Item | Funcionalidade | Dados/Tabelas | Observações |
|-------|------|----------------|---------------|-------------|
| **Brand** | Logo + Nome | Link para home / Expandir se colapsado | - | Ícone de colapsar no canto direito |
| **Notificações** | Submenu | Dropdown de notificações | `TBnotificacao` | Badge com contador |
| **Busca** | Item de menu | Abre Command Palette (modal) | - | Atalho: `Ctrl+P` |
| **Navegação** | Home | Navega para `/` | - | Ícone: Home |
| **Navegação** | Chamados | Navega para `/chamados` | `TBchamado` | Ícone: FileText |
| **Navegação** | Clientes | Navega para `/clientes` | `TBcliente` | Ícone: Team |
| **Navegação** | Relatórios | Navega para `/relatorios` | - | Ícone: BarChart |
| **Config** | Configurações | Navega para `/configuracoes` | - | Ícone: Setting |
| **Usuário** | Menu de usuário | Submenu com perfil/tema/logout | `TBusuario` | Avatar com iniciais |

**Busca Global (Command Palette):**

**Ativação:**
- Via menu sidebar (item "Buscar")
- Atalho: `Ctrl+P` (ou `Cmd+P` no Mac)
- Tecla `/` em qualquer página (alternativa)

**Funcionalidades:**
- **Busca em múltiplas entidades:**
  - Chamados: Protocolo, título, descrição
  - Clientes: Nome, CNPJ, email
  - Contatos: Nome, email
- **Ações rápidas:**
  - ✨ Novo Chamado (`Ctrl+N` se disponível)
  - 👤 Novo Cliente
  - 💬 Iniciar Chat (se habilitado)
- **Navegação:**
  - Dashboard, Chamados, Clientes, Relatórios
  - Com atalhos visuais (ex: `G+D`)
- **Histórico:**
  - Últimos 5 comandos/buscas executados
  - Persistir em `localStorage`
- **Busca fuzzy (opcional):**
  - "ch ab" encontra "Chamados Abertos"
  - Usar biblioteca Fuse.js se necessário

**Resultados:**
- Agrupados por tipo: AÇÕES / CHAMADOS / CLIENTES / NAVEGAÇÃO
- Máximo 5 resultados por grupo
- Navegação por setas `↑` / `↓`
- `Enter` para confirmar seleção
- `Esc` para fechar

**Implementação com Ant Design:**
```tsx
<Modal
  open={visible}
  footer={null}
  onCancel={onClose}
  width={600}
>
  <Input.Search
    autoFocus
    placeholder="Digite um comando ou busque..."
    onChange={handleSearch}
  />
  <List
    dataSource={results}
    renderItem={(item) => (
      <List.Item onClick={() => handleSelect(item)}>
        {item.icon} {item.title}
      </List.Item>
    )}
  />
</Modal>
```

**Roteamento:**
- Redireciona para `/busca?q=termo` se busca textual
- Executa ação diretamente se comando
- Navega para rota se item de navegação

**Dropdown de Notificações:**
| Campo | Tabela.Campo | Observações |
|-------|--------------|-------------|
| Título | `TBnotificacao.DFtitulo_notificacao` | Truncado em 50 chars |
| Tempo | `TBnotificacao.DFdata_criacao` | Relativo: "há 5 min" |
| Tipo | `TBtipo_notificacao.DFnome_tipo` | Ícone colorido |
| Ação | `TBnotificacao.DFurl_acao` | Link para entidade |

- Limitar a 5 notificações mais recentes
- Link "Ver todas" para `/notifications`
- Item placeholder se vazio: "Nenhuma notificação"

**Menu de Usuário (Submenu):**
- Avatar circular com iniciais do usuário (primeiras letras do nome)
- Nome de exibição (`TBusuario.DFnome_exibicao`)
- Itens do menu:
  - 👤 Meu Perfil → `/configuracoes`
  - 🎨 Tema: Claro/Escuro → Alterna tema (toggle)
  - 🚪 Sair → Logout

**Rotas de Navegação:**

| Item | Rota | Permissão | Observações |
|------|------|-----------|-------------|
| Home | `/` | Todos | Dashboard principal |
| Chamados | `/chamados` | `select__chamado` | Lista de chamados |
| Clientes | `/clientes` | `select__cliente` | Lista de clientes |
| Relatórios | `/relatorios` | `select__relatorio` | Relatórios e métricas |
| Configurações | `/configuracoes` | Todos | Configurações e perfil |
| Busca | `/busca?q=termo` | Todos | Via Command Palette |

**Estado Colapsado (80px):**
- Mostrar apenas ícones
- Tooltip ao hover com nome do item
- Submenus mantidos (notificações, usuário)
- Click no brand expande sidebar
- Labels de atalhos ocultados ("Ctrl+P" some, fica só ícone)

**Comportamento de Colapso:**
- Botão collapse no canto direito do brand (quando expandido)
- Transição suave (0.2s)
- Content area ajusta margin-left automaticamente
- Breakpoint `lg` colapsa automaticamente
- Estado persiste durante navegação

---

#### B. ContentArea (Área de Conteúdo Principal)

**Estrutura (3 Colunas):**
```
┌────────────────────────────────────────────────────────────────────────┐
│ Home > Chamados > #1234                                                │ ← Breadcrumb
├──────────────────┬─────────────────────────────────────────────────────┤
│                  │                                                     │
│  [icon] Detalhes │                                                     │
│  [icon] Timeline │         Conteúdo da Página                         │
│  [icon] Anexos   │                                                     │
│  [icon] Histórico│         (UI001, UI002, UI003...)                   │
│                  │                                                     │
│    PageMenu      │                                                     │
│   (opcional)     │                                                     │
│                  │                                                     │
└──────────────────┴─────────────────────────────────────────────────────┘
```

**Componentes da ContentArea:**

**1. Breadcrumb (topo)**
- Navegação hierárquica em todas as páginas internas
- Formato: `Home > Seção > Item`
- Links clicáveis para navegação
- Exemplo: `Home > Chamados > #1234`
- **Status:** Planejado (não implementado ainda)

**2. PageMenu (lateral esquerda - opcional)**
- Submenu específico por página/contexto
- Aparece apenas em páginas com múltiplas seções/abas
- Largura: 240px (pode ser colapsável no futuro)
- Estilo: Ant Design Menu vertical (`mode="inline"`)
- **Status:** Planejado (não implementado ainda)

**Páginas que usarão PageMenu:**

| Página | Rota Base | Itens do PageMenu | Observações |
|--------|-----------|-------------------|-------------|
| Detalhes Chamado | `/chamados/:id` | Detalhes, Timeline, Anexos, Histórico | Navegação entre seções do ticket |
| Configurações | `/configuracoes` | Perfil, Segurança, Notificações, Aparência | Configurações do usuário |
| Admin | `/admin` | Usuários, Papéis, Departamentos, Sistema | Área administrativa |
| Detalhes Cliente | `/clientes/:id` | Visão Geral, Contatos, Chamados, Contratos | Informações do cliente |
| Relatórios | `/relatorios` | Dashboard, Chamados, Atendimento, SLA | Diferentes tipos de relatório |

**Comportamento do PageMenu:**
- Itens selecionados baseados na sub-rota atual
- Navegação via React Router (troca apenas o PageContent)
- Mantém estado de seleção ao recarregar página
- Mobile: pode colapsar em drawer ou tabs superiores

**3. PageContent (área principal)**
- Margin-left dinâmico baseado em:
  - AppSidebar: 280px (expandido) ou 80px (colapsado)
  - PageMenu: +240px se presente
- Background: `token.colorBgLayout`
- Renderiza via `<Outlet />` do React Router

**Elementos Comuns das Páginas:**

| Elemento | Descrição | Uso |
|----------|-----------|-----|
| Breadcrumb | Navegação hierárquica | Todas as páginas internas |
| Page Header | Título + ações principais | Maioria das páginas |
| Page Actions | Botões de ação (direita) | Criar, Exportar, Filtrar |
| Content Wrapper | Container do conteúdo | Padding e max-width |
| Loading State | Skeleton ou spinner | Durante carregamentos |
| Empty State | Ilustração + mensagem | Listas vazias |

---

#### C. Responsividade

**Breakpoints:**
- **Desktop Large**: > 1200px → AppSidebar 280px + PageMenu 240px (se houver)
- **Desktop**: 992px - 1199px → AppSidebar 280px + PageMenu pode ser tabs
- **Tablet**: 768px - 991px → AppSidebar 80px + PageMenu como tabs superiores
- **Mobile**: < 768px → AppSidebar 80px + PageMenu como tabs ou drawer

**Comportamento por Dispositivo:**

**Desktop (> 992px):**
- AppSidebar: 280px expandido
- PageMenu: 240px lateral (se presente)
- PageContent: width calculado (100vw - 280px - 240px)
- Breadcrumb: sempre visível no topo

**Tablet/Mobile (≤ 992px):**
- AppSidebar: 80px colapsado automaticamente (`breakpoint="lg"`)
- PageMenu:
  - Opção 1: Tabs horizontais abaixo do breadcrumb
  - Opção 2: Drawer lateral ativado por botão
  - Opção 3: Accordion no topo do conteúdo
- PageContent: width calculado (100vw - 80px)
- Breadcrumb: pode ser simplificado (mostrar apenas último item)

**Ajustes Específicos Mobile:**
- AppSidebar: 80px fixo, apenas ícones
- Labels: Ocultados quando colapsado
- Tooltips: Aparecem ao touch/hover
- PageMenu: Transformado em tabs ou drawer
- Command Palette: Modal full-screen
- Submenus (notificações, usuário): Funcionam como dropdowns normalmente

---

#### D. Estados e Interações

**Estado de Carregamento:**
- Skeleton screens para listas
- Spinner para ações pontuais
- Progress bar para uploads/downloads

**Estado de Erro:**
- Toast notifications para erros não-críticos
- Error boundary para erros críticos
- Botão de retry quando aplicável

**Feedback de Ações:**
- Toast de sucesso após mutações
- Confirmação para ações destrutivas
- Loading inline durante processamento

**Atalhos de Teclado Globais:**
| Atalho | Ação | Observações |
|--------|------|-------------|
| `Ctrl+P` | Abrir Command Palette (busca global) | Principal atalho |
| `Ctrl+B` | Toggle sidebar (expandir/colapsar) | Já implementado |
| `/` | Busca na página atual | Opcional |
| `?` | Mostrar todos os atalhos | Modal de ajuda |
| `Esc` | Fechar modal/painel aberto | Padrão |

**Atalhos de Navegação (G + tecla):**
| Atalho | Ação | Rota |
|--------|------|------|
| `G` + `D` | Dashboard | `/` |
| `G` + `T` | Tickets (chamados) | `/chamados` |
| `G` + `C` | Clientes | `/clientes` |
| `G` + `R` | Relatórios | `/relatorios` |

**Atalhos em Listas:**
| Atalho | Ação | Contexto |
|--------|------|----------|
| `↑` / `↓` | Navegar entre itens | Listas de tickets/clientes |
| `Enter` | Abrir item selecionado | Listas |
| `Espaço` | Selecionar/desselecionar item | Modo seleção |
| `Shift` + `↑`/`↓` | Seleção múltipla | Listas |
| `Ctrl+A` | Selecionar todos | Listas |

**Atalhos em Detalhes de Ticket:**
| Atalho | Ação | Permissão necessária |
|--------|------|---------------------|
| `C` | Adicionar comentário | `mutate__chamado__comentar` |
| `E` | Editar ticket | `mutate__chamado__editar` |
| `S` | Alterar status | `mutate__chamado__status` |
| `P` | Alterar prioridade | `mutate__chamado__prioridade` |
| `A` | Atribuir a atendente | `mutate__chamado__atribuir` |
| `T` | Adicionar tag | `mutate__chamado__tags` |

**Implementação:**
- Usar `useEffect` com listeners de teclado
- Validar permissões antes de executar ações
- Exibir modal de ajuda (`?`) com todos os atalhos disponíveis no contexto atual
- Desabilitar atalhos quando em campos de texto/formulários

---

#### E. Temas e Personalização

**Modo Claro/Escuro:**
- Alternância via submenu de usuário (item "Tema: Claro/Escuro")
- Estado gerenciado por `ThemeContext`
- Persistência em `localStorage`
- Ant Design Design Tokens aplicados dinamicamente
- Logo SVG específico para cada tema:
  - Claro: `/helpdesk/assets/coletivos-logo.svg`
  - Escuro: `/helpdesk/assets/coletivos-logo-dark.svg`

**Cores do Sistema (Ant Design Tokens):**
- `token.colorPrimary`: Cor primária do tema
- `token.colorBgContainer`: Background de containers
- `token.colorBgLayout`: Background do layout
- `token.colorBorder`: Bordas
- `token.colorTextSecondary`: Textos secundários

**Avatar de Usuário:**
- Círculo com iniciais do nome (primeiras letras)
- Background: `token.colorPrimary`
- Cor do texto: branco (#fff)
- Tamanho: 26x26px no menu

---

#### F. Performance e Otimizações

**Carregamento:**
- Lazy loading de rotas (code splitting)
- Virtual scrolling para listas grandes (>100 itens)
- Cache de dados frequentes (React Query/SWR)
- Debounce em buscas e filtros (300ms)

**Atualização em Tempo Real:**
- WebSocket para notificações
- Polling para contadores de badges (30s)
- Otimistic updates para melhor UX

---

## 🔐 Interfaces de Autenticação

### [x] UI001 - Tela de Login
**User Story:** US001 - Login no Sistema  
**Rota:** `/login`  
**Acesso:** Público

**Campos da Interface:**
| Campo Interface | Tabela.Campo | Tipo | Validação | Observações |
|-----------------|--------------|------|-----------|-------------|
| Email | `TBusuario.DFemail_usuario` | VARCHAR(255) | Email válido, obrigatório | Campo de login principal |
| Senha | `TBusuario.DFhash_senha` | VARCHAR(255) | Mínimo 8 caracteres | Comparar hash bcrypt |
| Lembrar-me | - | BOOLEAN | - | Controla duração da sessão |

**Funcionalidades:**
- Validação em tempo real do formato de email
- Bloqueio após 5 tentativas (campo `DFtentativas_login_falhadas`)
- Atualização de `DFultimo_login` e `DFip_ultimo_login` no sucesso
- Redirecionamento baseado em papéis do usuário
- Link para recuperação de senha

**Estados da Interface:**
- Normal: Campos habilitados
- Bloqueado: Mensagem de conta bloqueada (`DFdata_bloqueio` preenchido)
- Carregando: Durante validação das credenciais

### [ ] UI002 - Recuperação de Senha
**User Story:** US002 - Recuperação de Senha  
**Rota:** `/forgot-password`  
**Acesso:** Público

**Campos da Interface:**
| Campo Interface | Tabela.Campo | Tipo | Validação | Observações |
|-----------------|--------------|------|-----------|-------------|
| Email | `TBusuario.DFemail_usuario` | VARCHAR(255) | Email válido, obrigatório | Deve existir no sistema |

**Processo:**
1. Gerar token único em `TBusuario.DFtoken_recuperacao`
2. Definir expiração em `TBusuario.DFdata_expiracao_token` (24h)
3. Enviar email usando template de `TBtemplate_email`
4. Redirecionar para página de confirmação

### [ ] UI003 - Redefinir Senha
**User Story:** US002 - Recuperação de Senha  
**Rota:** `/reset-password/:token`  
**Acesso:** Público com token válido

**Campos da Interface:**
| Campo Interface | Tabela.Campo | Tipo | Validação | Observações |
|-----------------|--------------|------|-----------|-------------|
| Nova Senha | `TBusuario.DFhash_senha` | VARCHAR(255) | Mínimo 8 chars, complexidade | Gerar hash bcrypt |
| Confirmar Senha | - | VARCHAR(255) | Igual à nova senha | Validação client-side |

**Validações:**
- Token deve existir e não estar expirado (`DFdata_expiracao_token`)
- Senha deve atender critérios de segurança
- Limpar token após uso bem-sucedido

---

## 👤 Interfaces de Perfil de Usuário

### [x] UI004 - Perfil do Usuário
**User Story:** US003 - Perfil do Usuário  
**Rota:** `/profile`  
**Acesso:** Usuários autenticados

**Campos da Interface:**
| Campo Interface | Tabela.Campo | Tipo | Validação | Observações |
|-----------------|--------------|------|-----------|-------------|
| Email | `TBusuario.DFemail_usuario` | VARCHAR(255) | Email válido, único | Não editável |
| Nome de Exibição | `TBusuario.DFnome_exibicao` | VARCHAR(100) | Obrigatório, min 2 chars | Nome mostrado na interface |
| Avatar | `TBusuario.DFavatar_url` | VARCHAR(500) | URL válida | Upload de imagem |
| Fuso Horário | `TBusuario.DFfuso_horario` | VARCHAR(50) | Timezone válido | Lista de fusos disponíveis |
| Idioma | `TBusuario.DFidioma` | CHAR(2) | Código ISO válido | pt, en, es |
| Tema | `TBusuario.DFtema_interface` | VARCHAR(20) | Valores permitidos | claro, escuro, auto |

**Seções da Interface:**
1. **Informações Básicas**: Nome, email, avatar
2. **Preferências**: Fuso horário, idioma, tema
3. **Segurança**: Alterar senha, histórico de login
4. **Notificações**: Configurações de recebimento

**Dados Somente Leitura:**
- Último login: `TBusuario.DFultimo_login`
- IP último acesso: `TBusuario.DFip_ultimo_login`
- Data de criação: `TBusuario.DFdata_criacao`

### [ ] UI005 - Alterar Senha
**User Story:** US003 - Perfil do Usuário  
**Rota:** `/profile/change-password`  
**Acesso:** Usuários autenticados

**Campos da Interface:**
| Campo Interface | Tabela.Campo | Tipo | Validação | Observações |
|-----------------|--------------|------|-----------|-------------|
| Senha Atual | `TBusuario.DFhash_senha` | VARCHAR(255) | Verificar hash atual | Para confirmação |
| Nova Senha | `TBusuario.DFhash_senha` | VARCHAR(255) | Critérios de segurança | Gerar novo hash |
| Confirmar Nova | - | VARCHAR(255) | Igual à nova senha | Validação client-side |

---

## 👥 Interfaces de Gestão de Usuários (Admin)

### [x] UI006 - Lista de Usuários
**User Story:** US004 - Gestão de Usuários (Admin)  
**Rota:** `/admin/users`  
**Acesso:** Papel ADMINISTRADOR

**Colunas da Lista:**
| Coluna | Tabela.Campo | Tipo | Observações |
|--------|--------------|------|-------------|
| ID | `TBusuario.DFid_usuario` | INT | Link para detalhes |
| Nome | `TBusuario.DFnome_exibicao` | VARCHAR(100) | Nome de exibição |
| Email | `TBusuario.DFemail_usuario` | VARCHAR(255) | Email de login |
| Papéis | `TBpapel.DFnome_papel` | VARCHAR(50) | Lista de papéis via JOIN |
| Status | `TBusuario.DFativo` | BIT | Ativo/Inativo |
| Último Login | `TBusuario.DFultimo_login` | DATETIME | Formatado localmente |
| Ações | - | - | Editar, Ativar/Desativar |

**Filtros Disponíveis:**
- Status: Ativo/Inativo (`TBusuario.DFativo`)
- Papel: Lista de papéis (`TBusuario_papel.DFid_papel`)
- Data criação: Range de datas (`TBusuario.DFdata_criacao`)

**Query Base:**
```sql
SELECT u.*, STRING_AGG(p.DFnome_papel, ', ') as papeis
FROM TBusuario u
LEFT JOIN TBusuario_papel up ON u.DFid_usuario = up.DFid_usuario
LEFT JOIN TBpapel p ON up.DFid_papel = p.DFid_papel
WHERE u.DFativo = 1
GROUP BY u.DFid_usuario
```

### [x] UI007 - Formulário de Usuário
**User Story:** US004 - Gestão de Usuários (Admin)  
**Rota:** `/admin/users/new` ou `/admin/users/:id/edit`  
**Acesso:** Papel ADMINISTRADOR

**Campos do Formulário:**
| Campo Interface | Tabela.Campo | Tipo | Validação | Observações |
|-----------------|--------------|------|-----------|-------------|
| Email | `TBusuario.DFemail_usuario` | VARCHAR(255) | Email válido, único | Obrigatório |
| Nome de Exibição | `TBusuario.DFnome_exibicao` | VARCHAR(100) | Obrigatório | Min 2 caracteres |
| Senha | `TBusuario.DFhash_senha` | VARCHAR(255) | Critérios segurança | Só na criação |
| Fuso Horário | `TBusuario.DFfuso_horario` | VARCHAR(50) | Timezone válido | Padrão: America/Sao_Paulo |
| Idioma | `TBusuario.DFidioma` | CHAR(2) | Código ISO | Padrão: pt |
| Ativo | `TBusuario.DFativo` | BIT | - | Checkbox |

**Seção de Papéis:**
- Lista de papéis disponíveis de `TBpapel` onde `DFativo = 1`
- Checkboxes para seleção múltipla
- Salvar em `TBusuario_papel` com `DFid_usuario_atribuidor`

### [x] UI008 - Gestão de Papéis
**User Story:** US005 - Gestão de Papéis (Admin)  
**Rota:** `/admin/roles`  
**Acesso:** Papel ADMINISTRADOR

**Lista de Papéis:**
| Coluna | Tabela.Campo | Tipo | Observações |
|--------|--------------|------|-------------|
| Código | `TBpapel.DFcodigo_papel` | VARCHAR(20) | Identificador único |
| Nome | `TBpapel.DFnome_papel` | VARCHAR(50) | Nome amigável |
| Descrição | `TBpapel.DFdescricao_papel` | VARCHAR(255) | Propósito do papel |
| Fixo | `TBpapel.DFfixo` | BIT | Se pode ser removido |
| Usuários | COUNT | INT | Quantidade de usuários |
| Ações | - | - | Editar (se não fixo) |

**Funcionalidades:**
- Criar novos papéis (não fixos)
- Editar papéis existentes (não fixos)
- Visualizar permissões por papel
- Não permitir remoção de papéis fixos ou com usuários

### [x] UI009 - Matriz de Permissões
**User Story:** US005 - Gestão de Papéis (Admin)  
**Rota:** `/admin/roles/:id/permissions`  
**Acesso:** Papel ADMINISTRADOR

**Interface de Matriz:**
- Linhas: Permissões agrupadas por categoria (`TBpermissao.DFcategoria`)
- Colunas: Permitido, Negado, Indefinido
- Dados: `TBpapel_permissao.DFpermitido` (true/false/null)

**Estrutura da Permissão:**
| Campo | Tabela.Campo | Uso |
|-------|--------------|-----|
| Código | `TBpermissao.DFcodigo_permissao` | Identificador técnico |
| Nome | `TBpermissao.DFnome_permissao` | Nome amigável |
| Descrição | `TBpermissao.DFdescricao_permissao` | Tooltip explicativo |
| Categoria | `TBpermissao.DFcategoria` | Agrupamento visual |

---

## 🏢 Interfaces de Clientes

### [x] UI010 - Lista de Clientes
**User Story:** US007 - Lista de Clientes  
**Rota:** `/clients`  
**Acesso:** Atendentes e superiores

**Colunas da Lista:**
| Coluna | Tabela.Campo | Tipo | Observações |
|--------|--------------|------|-------------|
| ID | `TBcliente.DFid_cliente` | INT | Link para detalhes |
| Nome | `TBcliente.DFnome_cliente` | VARCHAR(255) | Nome da organização |
| Email | `TBcliente.DFemail_principal` | VARCHAR(255) | Contato principal |
| Telefone | `TBcliente.DFtelefone_principal` | VARCHAR(20) | Telefone principal |
| Chamados | COUNT | INT | Quantidade de chamados |
| Status | `TBcliente.DFativo` | BIT | Ativo/Inativo |
| Criado em | `TBcliente.DFdata_criacao` | DATETIME | Data de cadastro |

**Filtros e Busca:**
- Status: Ativo/Inativo (`TBcliente.DFativo`)
- Busca: Nome, email, CNPJ
- Hierarquia: Clientes pai/filhos (`TBcliente.DFid_cliente_pai`)

**Query com Contadores:**
```sql
SELECT c.*, COUNT(ch.DFid_chamado) as total_chamados
FROM TBcliente c
LEFT JOIN TBcontato co ON c.DFid_cliente = co.DFid_cliente
LEFT JOIN TBchamado ch ON co.DFid_contato = ch.DFid_contato
WHERE c.DFativo = 1
GROUP BY c.DFid_cliente
```

### [x] UI011 - Formulário de Cliente
**User Story:** US008/US009 - Cadastro/Edição de Cliente  
**Rota:** `/clients/new` ou `/clients/:id/edit`  
**Acesso:** Atendentes e superiores

**Abas do Formulário:**

**Aba 1 - Dados Básicos:**
| Campo Interface | Tabela.Campo | Tipo | Validação | Observações |
|-----------------|--------------|------|-----------|-------------|
| Nome da Empresa | `TBcliente.DFnome_cliente` | VARCHAR(255) | Obrigatório, único | Razão social |
| Nome Fantasia | `TBcliente.DFnome_fantasia` | VARCHAR(255) | Opcional | Nome comercial |
| CNPJ | `TBcliente.DFcnpj` | VARCHAR(18) | Formato válido | Máscara: 00.000.000/0000-00 |
| Website | `TBcliente.DFsite_web` | VARCHAR(255) | URL válida | Validar formato |
| Cliente Pai | `TBcliente.DFid_cliente_pai` | INT | FK válida | Dropdown de clientes |

**Aba 2 - Contato:**
| Campo Interface | Tabela.Campo | Tipo | Validação | Observações |
|-----------------|--------------|------|-----------|-------------|
| Email Principal | `TBcliente.DFemail_principal` | VARCHAR(255) | Email válido | Para comunicações |
| Telefone Principal | `TBcliente.DFtelefone_principal` | VARCHAR(20) | Formato livre | Máscara opcional |
| Endereço Completo | `TBcliente.DFendereco_completo` | VARCHAR(500) | Opcional | Endereço físico |

**Aba 3 - Configurações:**
| Campo Interface | Tabela.Campo | Tipo | Validação | Observações |
|-----------------|--------------|------|-----------|-------------|
| Limite Chamados/Mês | `TBcliente.DFlimite_chamados_mensal` | INT | Positivo ou NULL | NULL = ilimitado |
| Ativo | `TBcliente.DFativo` | BIT | - | Checkbox |
| Campos Personalizados | `TBcliente.DFcampos_personalizados` | NVARCHAR(MAX) | JSON válido | Editor JSON |

### [x] UI012 - Detalhes do Cliente
**User Story:** US007 - Lista de Clientes  
**Rota:** `/clients/:id`  
**Acesso:** Atendentes e superiores

**Seções da Interface:**

**Cabeçalho:**
- Nome do cliente (`TBcliente.DFnome_cliente`)
- Status ativo/inativo (`TBcliente.DFativo`)
- Botões: Editar, Ativar/Desativar

**Cards de Métricas:**
- Total de contatos: COUNT de `TBcontato`
- Total de chamados: COUNT de `TBchamado`
- Chamados abertos: COUNT com status aberto
- Última atividade: MAX de `TBchamado.DFdata_ultima_atualizacao`

**Abas de Conteúdo:**
1. **Contatos**: Lista de `TBcontato` do cliente
2. **Chamados**: Lista de `TBchamado` via contatos
3. **Histórico**: Atividades relacionadas
4. **Configurações**: Dados editáveis do cliente

---

## 👤 Interfaces de Contatos

### [x] UI013 - Lista de Contatos
**User Story:** US010 - Lista de Contatos  
**Rota:** `/contacts`  
**Acesso:** Atendentes e superiores

**Colunas da Lista:**
| Coluna | Tabela.Campo | Tipo | Observações |
|--------|--------------|------|-------------|
| Nome | `TBcontato.DFnome_contato` | VARCHAR(100) | Nome da pessoa |
| Email | `TBcontato.DFemail_contato` | VARCHAR(255) | Email de contato |
| Cliente | `TBcliente.DFnome_cliente` | VARCHAR(255) | Via JOIN |
| Cargo | `TBcontato.DFcargo_contato` | VARCHAR(100) | Posição na empresa |
| Principal | `TBcontato.DFcontato_principal` | BIT | Ícone se principal |
| Usuário | `TBusuario.DFemail_usuario` | VARCHAR(255) | Se tem acesso ao portal |
| Status | `TBcontato.DFativo` | BIT | Ativo/Inativo |

**Filtros:**
- Cliente: Dropdown de `TBcliente`
- Status: Ativo/Inativo
- Tem usuário: Sim/Não (`TBcontato.DFid_usuario IS NOT NULL`)
- Contato principal: Sim/Não

### [x] UI014 - Formulário de Contato
**User Story:** US011 - Cadastro de Contato  
**Rota:** `/contacts/new` ou `/contacts/:id/edit`  
**Acesso:** Atendentes e superiores

**Campos do Formulário:**
| Campo Interface | Tabela.Campo | Tipo | Validação | Observações |
|-----------------|--------------|------|-----------|-------------|
| Cliente | `TBcontato.DFid_cliente` | INT | Obrigatório, FK válida | Dropdown de clientes ativos |
| Nome Completo | `TBcontato.DFnome_contato` | VARCHAR(100) | Obrigatório | Nome da pessoa |
| Email | `TBcontato.DFemail_contato` | VARCHAR(255) | Email válido, único | Para comunicações |
| Telefone | `TBcontato.DFtelefone_contato` | VARCHAR(20) | Opcional | Formato livre |
| Cargo | `TBcontato.DFcargo_contato` | VARCHAR(100) | Opcional | Posição na empresa |
| Departamento | `TBcontato.DFdepartamento_contato` | VARCHAR(100) | Opcional | Setor de trabalho |
| Contato Principal | `TBcontato.DFcontato_principal` | BIT | - | Apenas um por cliente |
| Recebe Notificações | `TBcontato.DFrecebe_notificacoes` | BIT | Padrão: true | Checkbox |
| Ativo | `TBcontato.DFativo` | BIT | Padrão: true | Checkbox |

**Seção de Usuário:**
- Checkbox "Criar usuário para portal"
- Se marcado, mostrar campos de `TBusuario`:
  - Email (preenchido automaticamente)
  - Nome de exibição (preenchido automaticamente)
  - Senha temporária (gerada automaticamente)

**Validações Especiais:**
- Apenas um contato principal por cliente
- Email único em todo o sistema
- Se criar usuário, validar unicidade do email

---

## 🎫 Interfaces de Chamados

### [ ] UI015 - Dashboard de Chamados
**User Story:** US013 - Dashboard de Chamados  
**Rota:** `/dashboard` ou `/tickets/dashboard`  
**Acesso:** Atendentes e superiores

**Cards de Métricas:**
| Métrica | Query Base | Observações |
|---------|------------|-------------|
| Chamados Abertos | COUNT com status aberto | Cor: alerta |
| Meus Chamados | COUNT onde atendente = usuário atual | Cor: normal |
| Vencendo SLA | COUNT próximos do vencimento | Cor: critico |
| Fechados Hoje | COUNT fechados hoje | Cor: sucesso |

**Gráficos:**
1. **Chamados por Status**: Donut chart com dados de `TBstatus_chamado`
2. **Tendência Semanal**: Line chart dos últimos 7 dias
3. **Por Prioridade**: Bar chart com `TBtipo_prioridade`
4. **Por Departamento**: Bar chart com `TBdepartamento`

**Listas Rápidas:**
- Meus chamados atribuídos
- Chamados sem atendente
- Vencendo SLA nas próximas 2 horas
- Aguardando minha resposta

### [x] UI016 - Lista de Chamados
**User Story:** US014 - Lista de Chamados  
**Rota:** `/tickets`  
**Acesso:** Atendentes e superiores

**Colunas da Lista:**
| Coluna | Tabela.Campo | Tipo | Observações |
|--------|--------------|------|-------------|
| Protocolo | `TBchamado.DFnumero_protocolo` | VARCHAR(20) | Link para detalhes |
| Título | `TBchamado.DFtitulo_chamado` | VARCHAR(255) | Truncado se muito longo |
| Cliente | `TBcliente.DFnome_cliente` | VARCHAR(255) | Via JOIN com contato |
| Status | `TBstatus_chamado.DFnome_status` | VARCHAR(50) | Badge colorido |
| Prioridade | `TBtipo_prioridade.DFnome_prioridade` | VARCHAR(50) | Badge colorido |
| Atendente | `TBatendente.DFnome_atendente` | VARCHAR(100) | Nome ou "Não atribuído" |
| Criado em | `TBchamado.DFdata_criacao` | DATETIME | Formato relativo |
| SLA | Calculado | - | Tempo restante ou vencido |

**Filtros Avançados:**
- Status: Multi-select de `TBstatus_chamado`
- Prioridade: Multi-select de `TBtipo_prioridade`
- Departamento: Multi-select de `TBdepartamento`
- Atendente: Multi-select de `TBatendente`
- Cliente: Busca com autocomplete
- Data criação: Range picker
- SLA: Vencido, Vencendo (2h), Normal

**Ações em Lote:**
- Atribuir a atendente
- Alterar status
- Alterar prioridade
- Adicionar tags

### [x] UI017 - Formulário de Chamado (Portal Cliente)
**User Story:** US015 - Abertura de Chamado (Portal Cliente)  
**Rota:** `/portal/tickets/new`  
**Acesso:** Contatos com usuário vinculado

**Campos do Formulário:**
| Campo Interface | Tabela.Campo | Tipo | Validação | Observações |
|-----------------|--------------|------|-----------|-------------|
| Departamento | `TBchamado.DFid_departamento` | INT | Obrigatório | Dropdown de departamentos ativos |
| Categoria | `TBchamado.DFid_categoria` | INT | Obrigatório | Dropdown hierárquico |
| Título | `TBchamado.DFtitulo_chamado` | VARCHAR(255) | Obrigatório | Resumo do problema |
| Descrição | `TBchamado.DFdescricao_chamado` | NVARCHAR(MAX) | Obrigatório | Editor rico |
| Prioridade | `TBchamado.DFid_tipo_prioridade` | INT | Opcional | Se permitido pelo cliente |
| Anexos | `TBchamado_anexo.*` | - | Opcional | Upload múltiplo |

**Campos Automáticos:**
- Contato: Usuário logado (`TBchamado.DFid_contato`)
- Data criação: Timestamp atual
- Status: Status inicial configurado
- Protocolo: Gerado automaticamente

**Validações:**
- Verificar limite mensal do cliente
- Validar tipos de arquivo permitidos
- Tamanho máximo por anexo

### [x] UI018 - Formulário de Chamado (Atendente)
**User Story:** US016 - Abertura de Chamado (Atendente)  
**Rota:** `/tickets/new`  
**Acesso:** Atendentes e superiores

**Campos Adicionais (além do portal):**
| Campo Interface | Tabela.Campo | Tipo | Validação | Observações |
|-----------------|--------------|------|-----------|-------------|
| Cliente | `TBcontato.DFid_cliente` | INT | Obrigatório | Dropdown de clientes |
| Contato | `TBchamado.DFid_contato` | INT | Obrigatório | Filtrado pelo cliente |
| Atendente | `TBchamado.DFid_atendente_responsavel` | INT | Opcional | Auto-atribuição ou manual |
| SLA Customizado | `TBchamado.DFdata_vencimento_sla` | DATETIME | Opcional | Override do SLA padrão |
| Observações Internas | `TBchamado.DFobservacoes` | NVARCHAR(MAX) | Opcional | Notas dos atendentes |

**Funcionalidades Extras:**
- Busca de cliente com autocomplete
- Filtro de contatos por cliente selecionado
- Sugestão de categoria baseada no histórico
- Cálculo automático de SLA

### [x] UI019 - Detalhes do Chamado
**User Story:** US017 - Visualização de Chamado  
**Rota:** `/tickets/:id`  
**Acesso:** Baseado em permissões

**Layout da Interface:**

**Cabeçalho:**
- Protocolo e título (`TBchamado.DFnumero_protocolo`, `DFtitulo_chamado`)
- Status atual com badge colorido (`TBstatus_chamado`)
- Prioridade com badge (`TBtipo_prioridade`)
- Botões de ação baseados em permissões

**Sidebar Direita:**
| Seção | Campos | Observações |
|-------|--------|-------------|
| Informações | Cliente, contato, departamento | Dados básicos |
| Atribuição | Atendente responsável, criador | Links para perfis |
| Datas | Criação, última atualização, fechamento | Formatadas localmente |
| SLA | Vencimento, tempo restante | Indicador visual |
| Tags | Tags aplicadas | Editáveis se permitido |

**Área Principal:**

**Aba 1 - Timeline:**
- Descrição inicial do chamado
- Histórico de mudanças (`TBchamado_historico`)
- Comentários (`TBchamado_comentario`)
- Anexos (`TBchamado_anexo`)
- Ordenação cronológica

**Aba 2 - Comentários:**
- Lista de comentários internos/externos
- Formulário para novo comentário
- Editor rico com anexos
- Menções a usuários (@usuario)

**Aba 3 - Anexos:**
- Lista de todos os anexos
- Preview para imagens
- Download individual ou em lote
- Upload de novos anexos

**Aba 4 - Histórico:**
- Log detalhado de alterações
- Quem fez, quando, o que mudou
- Valores anteriores e novos
- Filtros por tipo de alteração

### [x] UI020 - Edição de Chamado
**User Story:** US018 - Edição de Chamado  
**Rota:** `/tickets/:id/edit`  
**Acesso:** Baseado em permissões

**Campos Editáveis:**
| Campo Interface | Tabela.Campo | Permissão Necessária | Observações |
|-----------------|--------------|---------------------|-------------|
| Título | `TBchamado.DFtitulo_chamado` | mutate__chamado__editar | Sempre editável |
| Descrição | `TBchamado.DFdescricao_chamado` | mutate__chamado__editar | Editor rico |
| Departamento | `TBchamado.DFid_departamento` | mutate__chamado__reatribuir | Pode afetar SLA |
| Categoria | `TBchamado.DFid_categoria` | mutate__chamado__editar | Pode afetar SLA |
| Prioridade | `TBchamado.DFid_tipo_prioridade` | mutate__chamado__prioridade | Pode afetar SLA |
| Atendente | `TBchamado.DFid_atendente_responsavel` | mutate__chamado__atribuir | Notificar mudança |
| Status | `TBchamado.DFid_status_chamado` | mutate__chamado__status | Validar transições |

**Validações:**
- Verificar transições de status permitidas
- Recalcular SLA se necessário
- Validar permissões por campo
- Registrar mudanças no histórico

---

## 💬 Interfaces de Atendimento Online

### [ ] UI021 - Widget de Chat (Site Cliente)
**User Story:** US023 - Widget de Chat (Site Cliente)  
**Integração:** JavaScript embed  
**Acesso:** Público

**Formulário Inicial:**
| Campo Interface | Tabela.Campo | Tipo | Validação | Observações |
|-----------------|--------------|------|-----------|-------------|
| Nome | `TBatendimento.DFnome_visitante` | VARCHAR(100) | Obrigatório | Nome do visitante |
| Email | `TBatendimento.DFemail_visitante` | VARCHAR(255) | Email válido | Para contato |
| Departamento | `TBatendimento.DFid_departamento` | INT | Opcional | Se múltiplos departamentos |
| Mensagem Inicial | `TBatendimento_mensagem.DFconteudo_mensagem` | NVARCHAR(MAX) | Obrigatório | Primeira mensagem |

**Dados Automáticos:**
- IP do visitante (`TBatendimento.DFip_visitante`)
- URL de referência (`TBatendimento.DFurl_referencia`)
- Localização geográfica (`TBatendimento.DFlocalizacao_visitante`)
- Data de início (`TBatendimento.DFdata_inicio`)

**Estados do Widget:**
1. **Minimizado**: Botão flutuante
2. **Formulário**: Coleta dados iniciais
3. **Fila**: Aguardando atendente
4. **Chat**: Conversa ativa
5. **Finalizado**: Atendimento encerrado

### [ ] UI022 - Console de Atendimento
**User Story:** US024 - Console de Atendimento  
**Rota:** `/chat/console`  
**Acesso:** Atendentes com permissão de chat

**Layout da Interface:**

**Sidebar Esquerda - Filas:**
- Lista de atendimentos pendentes
- Informações do visitante
- Tempo de espera
- Botão para aceitar atendimento

**Área Principal - Chat Ativo:**
- Cabeçalho com dados do visitante
- Área de mensagens
- Campo de digitação
- Botões de ação (transferir, finalizar)

**Sidebar Direita - Informações:**
| Seção | Dados | Fonte |
|-------|-------|-------|
| Visitante | Nome, email, localização | `TBatendimento.*` |
| Sessão | Duração, página origem | Calculado |
| Histórico | Atendimentos anteriores | Query histórica |
| Ações | Templates, arquivos | Configurações |

**Funcionalidades:**
- Notificações sonoras para novos atendimentos
- Indicadores de digitação em tempo real
- Templates de respostas rápidas
- Upload de arquivos
- Transferência entre atendentes

### [ ] UI023 - Histórico de Atendimentos
**User Story:** US024 - Console de Atendimento  
**Rota:** `/chat/history`  
**Acesso:** Atendentes e superiores

**Lista de Atendimentos:**
| Coluna | Tabela.Campo | Tipo | Observações |
|--------|--------------|------|-------------|
| ID | `TBatendimento.DFid_atendimento` | INT | Link para transcrição |
| Visitante | `TBatendimento.DFnome_visitante` | VARCHAR(100) | Nome informado |
| Email | `TBatendimento.DFemail_visitante` | VARCHAR(255) | Email informado |
| Atendente | `TBatendente.DFnome_atendente` | VARCHAR(100) | Quem atendeu |
| Duração | Calculado | TIME | Tempo total |
| Status | `TBtipo_status_atendimento.DFnome_status` | VARCHAR(50) | Status final |
| Data | `TBatendimento.DFdata_inicio` | DATETIME | Quando iniciou |

**Filtros:**
- Período: Range de datas
- Atendente: Multi-select
- Status: Multi-select
- Busca: Nome ou email do visitante

---

## 🏷️ Interfaces de Tags

### [ ] UI024 - Aplicação de Tags
**User Story:** US027 - Aplicação de Tags  
**Componente:** Modal ou sidebar  
**Acesso:** Baseado em permissões

**Interface de Tags:**
- Campo de busca com autocomplete
- Lista de tags existentes por tipo de entidade
- Botão para criar nova tag
- Tags aplicadas com botão de remoção
- Cores visuais das tags

**Dados das Tags:**
| Campo | Tabela.Campo | Uso |
|-------|--------------|-----|
| Nome | `TBtag.DFnome_tag` | Exibição |
| Cor | `TBcor_semantica.DFcodigo_hex` | Background |
| Tipo | `TBtipo_entidade.DFnome_tipo` | Validação |

**Funcionalidades:**
- Busca incremental de tags
- Criação rápida de novas tags
- Validação de compatibilidade
- Aplicação/remoção com um clique

### [ ] UI025 - Gestão de Tags (Admin)
**User Story:** US028 - Gestão de Tags (Admin)  
**Rota:** `/admin/tags`  
**Acesso:** Papel ADMINISTRADOR

**Lista de Tags:**
| Coluna | Tabela.Campo | Tipo | Observações |
|--------|--------------|------|-------------|
| Nome | `TBtag.DFnome_tag` | VARCHAR(50) | Nome da tag |
| Tipo | `TBtipo_entidade.DFnome_tipo` | VARCHAR(50) | Tipo de entidade |
| Cor | `TBcor_semantica.DFnome_cor` | VARCHAR(50) | Cor semântica |
| Peso | `TBtag.DFpeso` | INT | Prioridade |
| Uso | COUNT | INT | Quantas vezes usada |
| Status | `TBtag.DFativo` | BIT | Ativo/Inativo |

**Formulário de Tag:**
| Campo Interface | Tabela.Campo | Tipo | Validação | Observações |
|-----------------|--------------|------|-----------|-------------|
| Nome | `TBtag.DFnome_tag` | VARCHAR(50) | Obrigatório, único por tipo | Nome da tag |
| Descrição | `TBtag.DFdescricao_tag` | VARCHAR(255) | Opcional | Quando usar |
| Tipo de Entidade | `TBtag.DFid_tipo_entidade` | INT | Obrigatório | Dropdown |
| Cor | `TBtag.DFcor` | VARCHAR(20) | Obrigatório | Seletor de cores |
| Peso | `TBtag.DFpeso` | INT | Padrão: 0 | Para ordenação |
| Ativo | `TBtag.DFativo` | BIT | Padrão: true | Checkbox |

---

## 📊 Interfaces de Relatórios

### [ ] UI026 - Dashboard Executivo
**User Story:** US030 - Dashboard Executivo  
**Rota:** `/reports/executive`  
**Acesso:** Gestores e superiores

**KPIs Principais:**
| Métrica | Cálculo | Fonte | Período |
|---------|---------|-------|---------|
| Chamados Abertos | COUNT status aberto | `TBchamado` | Atual |
| Tempo Médio Resolução | AVG tempo resolução | `TBchamado` | Último mês |
| SLA Cumprido | % dentro do prazo | `TBchamado` | Último mês |
| Satisfação Média | AVG nota satisfação | `TBchamado_satisfacao` | Último mês |

**Gráficos:**
1. **Tendência de Chamados**: Line chart dos últimos 12 meses
2. **Distribuição por Status**: Donut chart atual
3. **Performance por Atendente**: Bar chart do mês
4. **Satisfação por Período**: Line chart dos últimos 6 meses

**Filtros Globais:**
- Período: Seletor de datas
- Departamento: Multi-select
- Cliente: Multi-select (para gestores de conta)

### [ ] UI027 - Relatório de Chamados
**User Story:** US031 - Relatório de Chamados  
**Rota:** `/reports/tickets`  
**Acesso:** Supervisores e superiores

**Filtros do Relatório:**
| Filtro | Tabela.Campo | Tipo | Observações |
|--------|--------------|------|-------------|
| Período | `TBchamado.DFdata_criacao` | DATE RANGE | Obrigatório |
| Status | `TBchamado.DFid_status_chamado` | MULTI-SELECT | Todos por padrão |
| Prioridade | `TBchamado.DFid_tipo_prioridade` | MULTI-SELECT | Todas por padrão |
| Departamento | `TBchamado.DFid_departamento` | MULTI-SELECT | Todos por padrão |
| Atendente | `TBchamado.DFid_atendente_responsavel` | MULTI-SELECT | Todos por padrão |
| Cliente | Via `TBcontato.DFid_cliente` | MULTI-SELECT | Todos por padrão |

**Agrupamentos Disponíveis:**
- Por dia/semana/mês
- Por status
- Por prioridade
- Por departamento
- Por atendente
- Por cliente

**Formatos de Exportação:**
- PDF: Relatório formatado
- Excel: Dados tabulares
- CSV: Dados brutos

### [ ] UI028 - Pesquisa de Satisfação
**User Story:** US033 - Pesquisa de Satisfação  
**Rota:** `/satisfaction/:token`  
**Acesso:** Público com token válido

**Formulário de Avaliação:**
| Campo Interface | Tabela.Campo | Tipo | Validação | Observações |
|-----------------|--------------|------|-----------|-------------|
| Nota | `TBchamado_satisfacao.DFnota_satisfacao` | INT | 1-5 obrigatório | Estrelas clicáveis |
| Comentário | `TBchamado_satisfacao.DFcomentario_satisfacao` | NVARCHAR(MAX) | Opcional | Textarea |

**Dados Automáticos:**
- Chamado: Via token (`TBchamado_satisfacao.DFid_chamado`)
- Data: Timestamp atual (`TBchamado_satisfacao.DFdata_avaliacao`)
- IP: IP do cliente (`TBchamado_satisfacao.DFip_avaliacao`)
- Token: Para validação (`TBchamado_satisfacao.DFtoken_avaliacao`)

**Validações:**
- Token deve ser válido e não expirado
- Apenas uma avaliação por chamado
- Nota deve estar entre 1 e 5

---

## ⚙️ Interfaces de Configuração

### [ ] UI029 - Configurações Gerais
**User Story:** US034 - Configurações Gerais  
**Rota:** `/admin/settings`  
**Acesso:** Papel ADMINISTRADOR

**Abas de Configuração:**

**Aba 1 - Empresa:**
- Nome da empresa
- Logo (upload)
- Cores da interface
- Informações de contato

**Aba 2 - Email:**
- Servidor SMTP
- Porta e segurança
- Usuário e senha
- Email remetente padrão
- Teste de envio

**Aba 3 - Segurança:**
- Política de senhas
- Tempo de sessão
- Tentativas de login
- Logs de auditoria

**Aba 4 - Sistema:**
- Fuso horário padrão
- Idioma padrão
- Formato de data/hora
- Limites de upload

### [ ] UI030 - Gestão de Departamentos
**User Story:** US035 - Gestão de Departamentos  
**Rota:** `/admin/departments`  
**Acesso:** Papel ADMINISTRADOR

**Lista de Departamentos:**
| Coluna | Tabela.Campo | Tipo | Observações |
|--------|--------------|------|-------------|
| Nome | `TBdepartamento.DFnome_departamento` | VARCHAR(100) | Nome do departamento |
| Email | `TBdepartamento.DFemail_departamento` | VARCHAR(255) | Email para receber chamados |
| Atendentes | COUNT | INT | Quantidade de atendentes |
| Chamados | COUNT | INT | Quantidade de chamados |
| Status | `TBdepartamento.DFativo` | BIT | Ativo/Inativo |

**Formulário de Departamento:**
| Campo Interface | Tabela.Campo | Tipo | Validação | Observações |
|-----------------|--------------|------|-----------|-------------|
| Nome | `TBdepartamento.DFnome_departamento` | VARCHAR(100) | Obrigatório, único | Nome do departamento |
| Descrição | `TBdepartamento.DFdescricao_departamento` | VARCHAR(255) | Opcional | Propósito do departamento |
| Email | `TBdepartamento.DFemail_departamento` | VARCHAR(255) | Email válido | Para receber chamados |
| Ativo | `TBdepartamento.DFativo` | BIT | Padrão: true | Checkbox |

**Seção de Atendentes:**
- Lista de atendentes do departamento
- Adicionar/remover atendentes
- Dados de `TBatendente_departamento`

---

## 📱 Interfaces do Portal do Cliente

### [ ] UI031 - Dashboard do Cliente
**User Story:** US041 - Dashboard do Cliente  
**Rota:** `/portal/dashboard`  
**Acesso:** Contatos com usuário vinculado

**Cards de Métricas:**
| Métrica | Cálculo | Observações |
|---------|---------|-------------|
| Chamados Abertos | COUNT status aberto do cliente | Cor: alerta |
| Chamados Fechados | COUNT status fechado do mês | Cor: sucesso |
| Tempo Médio | AVG tempo resolução | Últimos 30 dias |
| Última Atividade | MAX data atualização | Formatado relativamente |

**Gráficos:**
- Chamados por status (donut)
- Tendência mensal (line chart)
- Satisfação média (gauge)

**Listas Rápidas:**
- Meus chamados abertos
- Aguardando minha resposta
- Fechados recentemente

### [ ] UI032 - Meus Chamados (Portal)
**User Story:** US042 - Meus Chamados (Portal)  
**Rota:** `/portal/tickets`  
**Acesso:** Contatos com usuário vinculado

**Colunas da Lista:**
| Coluna | Tabela.Campo | Tipo | Observações |
|--------|--------------|------|-------------|
| Protocolo | `TBchamado.DFnumero_protocolo` | VARCHAR(20) | Link para detalhes |
| Título | `TBchamado.DFtitulo_chamado` | VARCHAR(255) | Truncado se longo |
| Status | `TBstatus_chamado.DFnome_status` | VARCHAR(50) | Badge colorido |
| Prioridade | `TBtipo_prioridade.DFnome_prioridade` | VARCHAR(50) | Badge colorido |
| Atendente | `TBatendente.DFnome_atendente` | VARCHAR(100) | Nome ou "Não atribuído" |
| Criado em | `TBchamado.DFdata_criacao` | DATETIME | Formato local |
| Última Atualização | `TBchamado.DFdata_ultima_atualizacao` | DATETIME | Formato relativo |

**Filtros Simplificados:**
- Status: Dropdown simples
- Período: Últimos 30 dias, 90 dias, 1 ano
- Busca: Por protocolo ou título

**Restrições:**
- Apenas chamados do próprio cliente
- Não pode ver chamados de outros contatos
- Query: `WHERE TBcontato.DFid_cliente = :cliente_do_usuario`

### [ ] UI033 - Detalhes do Chamado (Portal)
**User Story:** US043 - Acompanhamento de Chamado (Portal)  
**Rota:** `/portal/tickets/:id`  
**Acesso:** Contatos com usuário vinculado (próprios chamados)

**Layout Simplificado:**

**Cabeçalho:**
- Protocolo e título
- Status e prioridade
- Data de criação

**Timeline:**
- Descrição inicial
- Comentários externos (não internos)
- Mudanças de status
- Anexos

**Ações Disponíveis:**
- Adicionar comentário
- Anexar arquivos
- Avaliar atendimento (se fechado)

**Restrições:**
- Não ver comentários internos
- Não alterar dados do chamado
- Não ver informações de atendentes

---

## 📧 Interfaces de Notificações

### [ ] UI034 - Central de Notificações
**User Story:** US044 - Central de Notificações  
**Rota:** `/notifications`  
**Acesso:** Usuários autenticados

**Lista de Notificações:**
| Coluna | Tabela.Campo | Tipo | Observações |
|--------|--------------|------|-------------|
| Tipo | `TBtipo_notificacao.DFnome_tipo` | VARCHAR(50) | Ícone colorido |
| Título | `TBnotificacao.DFtitulo_notificacao` | VARCHAR(255) | Título da notificação |
| Conteúdo | `TBnotificacao.DFconteudo_notificacao` | NVARCHAR(MAX) | Truncado na lista |
| Data | `TBnotificacao.DFdata_criacao` | DATETIME | Formato relativo |
| Lida | `TBnotificacao.DFdata_leitura` | DATETIME | Ícone de lida/não lida |
| Ação | `TBnotificacao.DFurl_acao` | VARCHAR(500) | Link se disponível |

**Filtros:**
- Status: Todas, Não lidas, Lidas
- Tipo: Multi-select de tipos
- Período: Range de datas

**Ações:**
- Marcar como lida/não lida
- Marcar todas como lidas
- Excluir notificação
- Ir para ação relacionada

### [ ] UI035 - Configurações de Notificação
**User Story:** US045 - Configuração de Notificações  
**Rota:** `/notifications/settings`  
**Acesso:** Usuários autenticados

**Matriz de Configurações:**
- Linhas: Tipos de eventos
- Colunas: Canais (Sistema, Email, Push, WhatsApp)
- Células: Checkboxes para ativar/desativar

**Eventos Configuráveis:**
- Novo chamado atribuído
- Mudança de status
- Novo comentário
- Vencimento de SLA
- Pesquisa de satisfação
- Transferência de atendimento

**Configurações Globais:**
- Horário para receber notificações
- Frequência de agrupamento
- Não perturbar (DND)

---

## 🎨 Padrões de Implementação de UI

### Loading States (Skeleton Screens)

**Ant Design Skeleton:**
Usar componentes nativos do Ant Design para estados de carregamento:

```tsx
import { Skeleton, Card, List, Table } from 'antd'

// Skeleton para Card
<Card>
  <Skeleton active paragraph={{ rows: 4 }} />
</Card>

// Skeleton para Lista
<List
  dataSource={isLoading ? Array(5).fill({}) : data}
  renderItem={(item) => (
    <List.Item>
      {isLoading ? (
        <Skeleton active avatar paragraph={{ rows: 2 }} />
      ) : (
        <List.Item.Meta
          avatar={<Avatar src={item.avatar} />}
          title={item.title}
          description={item.description}
        />
      )}
    </List.Item>
  )}
/>

// Skeleton para Tabela
<Table
  dataSource={data}
  loading={{
    spinning: isLoading,
    indicator: <Skeleton active />
  }}
/>
```

**Componentes disponíveis:**
- `<Skeleton />` - Básico (título + parágrafos)
- `<Skeleton.Avatar />` - Avatar circular/quadrado
- `<Skeleton.Input />` - Campo de input
- `<Skeleton.Button />` - Botão
- `<Skeleton.Image />` - Imagem

**Props importantes:**
- `active` - Adiciona animação de loading
- `loading` - Controla exibição
- `paragraph.rows` - Número de linhas

---

### Notificações e Feedback

**Quando usar cada tipo:**

**1. Sonner (Toasts) - Feedback rápido de ações:**
```tsx
import { toast } from 'sonner'

// Sucesso
toast.success('Ticket criado', { description: '#1234' })

// Erro
toast.error('Erro ao atualizar')

// Loading
toast.loading('Processando...')

// Promise
toast.promise(saveTicket(), {
  loading: 'Salvando...',
  success: 'Ticket salvo!',
  error: 'Erro ao salvar'
})
```

**Casos de uso:**
- Salvar, deletar, atualizar registros
- Confirmações rápidas de ações
- Feedback de uploads

**2. Ant Design Message - Feedback inline simples:**
```tsx
import { message } from 'antd'

message.success('Ticket criado com sucesso')
message.error('Erro ao processar')
message.loading('Carregando...', 0) // 0 = não fecha automaticamente
```

**Casos de uso:**
- Mensagens muito curtas (1-2 palavras)
- Feedback de ações triviais

**3. Ant Design Notification - Alertas importantes:**
```tsx
import { notification } from 'antd'

notification.success({
  message: 'Ticket Criado',
  description: 'Ticket #1234 foi criado com sucesso',
  placement: 'topRight',
  duration: 4.5,
})

notification.open({
  message: 'SLA Vencendo',
  description: 'O ticket #1234 vencerá em 15 minutos',
  icon: <ClockCircleOutlined style={{ color: '#faad14' }} />,
  placement: 'bottomRight',
})
```

**Casos de uso:**
- Alertas de SLA
- Menções a usuários
- Notificações de sistema importantes
- Qualquer feedback que precisa de contexto adicional

---

### Optimistic Updates

**Pattern para melhor UX:**

```typescript
async function updateTicketStatus(ticketId: string, newStatus: string) {
  // 1. Atualizar UI imediatamente (optimistic)
  updateLocalState(ticketId, { status: newStatus })
  toast.success('Status atualizado')

  try {
    // 2. Fazer requisição ao servidor
    await api.updateTicket(ticketId, { status: newStatus })
  } catch (error) {
    // 3. Reverter se falhar
    revertLocalState(ticketId)
    toast.error('Erro ao atualizar status. Revertido.')
  }
}
```

**Quando usar:**
- Mudanças de status simples
- Adição/remoção de tags
- Atribuições de tickets
- Qualquer ação que provavelmente vai funcionar

**Quando NÃO usar:**
- Criação de registros (precisa do ID do servidor)
- Operações que podem falhar frequentemente
- Mudanças que afetam cálculos complexos (SLA, etc)

---

### Checklist de Qualidade de UI

**Performance:**
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3s
- [ ] Code splitting por rota implementado
- [ ] Lazy loading de imagens (WebP quando possível)
- [ ] Virtual scrolling em listas > 100 itens

**Acessibilidade:**
- [ ] Navegação completa por teclado funcionando
- [ ] ARIA labels em elementos interativos
- [ ] Contraste de cores adequado (WCAG AA: 4.5:1 texto, 3:1 UI)
- [ ] Focus indicators visíveis
- [ ] Textos alternativos em imagens
- [ ] Suporte a screen readers testado

**Responsividade:**
- [ ] Mobile (320px - 767px) funcionando
- [ ] Tablet (768px - 1279px) funcionando
- [ ] Desktop (1280px+) funcionando
- [ ] Touch targets ≥ 44x44px em mobile
- [ ] Sem scroll horizontal em nenhum breakpoint

**Feedback e Estados:**
- [ ] Loading states em todas as ações assíncronas
- [ ] Toast notifications para sucesso/erro
- [ ] Confirmação para ações destrutivas
- [ ] Validação inline em formulários
- [ ] Mensagens de erro claras e acionáveis
- [ ] Empty states com ilustração/mensagem

**Offline Experience (PWA):**
- [ ] Service Worker cacheando assets
- [ ] Mensagem clara quando offline
- [ ] Sincronização ao voltar online
- [ ] Rascunhos salvos localmente (localStorage)

---

## 🎯 Resumo das Interfaces

### Total de Interfaces Documentadas:
- ✅ **35 Interfaces** principais cobrindo todo o sistema
- ✅ **Mapeamento Completo** de campos de tabelas
- ✅ **Validações Específicas** para cada campo
- ✅ **Permissões Detalhadas** por interface
- ✅ **Queries de Exemplo** para listas complexas
- ✅ **Estados e Comportamentos** definidos

### Categorias de Interface:
- **Autenticação**: 3 interfaces (login, recuperação, redefinição)
- **Perfil**: 2 interfaces (visualização, edição)
- **Usuários Admin**: 4 interfaces (lista, formulário, papéis, permissões)
- **Clientes**: 3 interfaces (lista, formulário, detalhes)
- **Contatos**: 2 interfaces (lista, formulário)
- **Chamados**: 6 interfaces (dashboard, lista, formulários, detalhes, edição)
- **Chat**: 3 interfaces (widget, console, histórico)
- **Tags**: 2 interfaces (aplicação, gestão)
- **Relatórios**: 3 interfaces (executivo, chamados, satisfação)
- **Configurações**: 2 interfaces (gerais, departamentos)
- **Portal Cliente**: 3 interfaces (dashboard, lista, detalhes)
- **Notificações**: 2 interfaces (central, configurações)

### Padrões de Interface:
- **Listas**: Paginação, filtros, busca, ações em lote
- **Formulários**: Validação client/server, campos obrigatórios, máscaras
- **Detalhes**: Abas, timeline, ações contextuais
- **Dashboards**: Cards de métricas, gráficos, filtros globais
- **Modais**: Confirmações, formulários rápidos, seletores

### Responsividade:
- Todas as interfaces devem ser responsivas
- Priorizar mobile-first para portal do cliente
- Adaptar tabelas para telas pequenas
- Manter funcionalidades essenciais em mobile

Este guia garante implementação consistente e completa de todas as interfaces do sistema.
