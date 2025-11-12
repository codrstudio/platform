# STORY-module-helpdesk-administration.md

## Área Temática: Administração e Configuração

### Visão Geral

Esta área agrupa todas as funcionalidades que permitem **moldar o sistema** às necessidades específicas de cada organização. As histórias deste grupo definem as "engrenagens" que fazem o HelpDesk funcionar conforme as regras de negócio particulares - desde parâmetros globais até regras de automação complexas.

O agrupamento forma uma unidade coesa que implementa configurações organizacionais (empresa, emails, segurança), estruturação operacional (departamentos, categorias, SLA), padronização de comunicações (templates), automação de processos e mecanismos de auditoria. Esta área é essencial para que o sistema seja flexível e adaptável a diferentes contextos de negócio.

Com 7 User Stories focadas em administração, esta área reflete a necessidade de customização e governança do sistema.

---

## User Stories

### US034 - Configurações Gerais
**Como** administrador
**Eu quero** configurar parâmetros gerais do sistema
**Para que** o sistema funcione conforme as necessidades da empresa

**Critérios de Sucesso:**
- [ ] Configurações de empresa (nome, logo, cores)
- [ ] Parâmetros de email (SMTP)
- [ ] Configurações de segurança
- [ ] Limites e quotas do sistema
- [ ] Configurações de backup
- [ ] Integração com sistemas externos
- [ ] Logs de alterações

**Tabelas Relacionadas:** Sistema (configurações globais)

---

### US035 - Gestão de Departamentos
**Como** administrador
**Eu quero** gerenciar departamentos
**Para que** os chamados sejam organizados adequadamente

**Critérios de Sucesso:**
- [ ] Lista de departamentos existentes
- [ ] Criação/edição de departamentos
- [ ] Configuração de emails específicos
- [ ] Definição de horários de funcionamento
- [ ] Associação com atendentes
- [ ] Configurações de SLA por departamento
- [ ] Ativação/desativação

**Tabelas Relacionadas:** `TBdepartamento`, `TBatendente_departamento`

---

### US036 - Gestão de Categorias
**Como** administrador
**Eu quero** gerenciar categorias de chamados
**Para que** os chamados sejam classificados corretamente

**Critérios de Sucesso:**
- [ ] Árvore hierárquica de categorias
- [ ] Criação de categorias e subcategorias
- [ ] Definição de prioridades padrão
- [ ] Configuração de SLA por categoria
- [ ] Reordenação por drag-and-drop
- [ ] Fusão de categorias
- [ ] Relatório de uso por categoria

**Tabelas Relacionadas:** `TBcategoria`

---

### US037 - Configuração de SLA
**Como** administrador
**Eu quero** configurar acordos de nível de serviço
**Para que** o sistema monitore prazos adequadamente

**Critérios de Sucesso:**
- [ ] Definição de SLA geral e específicos
- [ ] Configuração por cliente/categoria/prioridade
- [ ] Definição de horário comercial
- [ ] Cadastro de feriados
- [ ] Configuração de escalações automáticas
- [ ] Alertas de vencimento
- [ ] Relatórios de cumprimento

**Tabelas Relacionadas:** `TBsla_configuracao`, `TBferiado`

---

### US038 - Templates de Email
**Como** administrador
**Eu quero** gerenciar templates de email
**Para que** as comunicações sejam padronizadas

**Critérios de Sucesso:**
- [ ] Lista de templates por tipo
- [ ] Editor WYSIWYG para templates
- [ ] Variáveis dinâmicas disponíveis
- [ ] Preview do template
- [ ] Versionamento de templates
- [ ] Templates específicos por departamento
- [ ] Teste de envio

**Tabelas Relacionadas:** `TBtemplate_email`, `TBtipo_template`

---

### US039 - Regras de Automação
**Como** administrador
**Eu quero** configurar regras de automação
**Para que** o sistema execute ações automaticamente

**Critérios de Sucesso:**
- [ ] Interface visual para criar regras
- [ ] Condições baseadas em campos dos chamados
- [ ] Ações: atribuição, mudança status, notificação
- [ ] Agendamento de execução
- [ ] Teste de regras antes da ativação
- [ ] Log de execuções
- [ ] Ativação/desativação de regras

**Tabelas Relacionadas:** `TBautomacao_regra`

---

### US040 - Auditoria do Sistema
**Como** administrador
**Eu quero** visualizar logs de auditoria
**Para que** eu possa monitorar atividades e mudanças

**Critérios de Sucesso:**
- [ ] Lista filtrada de eventos de auditoria
- [ ] Detalhes de cada operação
- [ ] Filtros por usuário, data, tipo de ação
- [ ] Busca por entidade específica
- [ ] Exportação de logs
- [ ] Retenção configurável
- [ ] Alertas para atividades suspeitas

**Tabelas Relacionadas:** `TBauditoria`

---

## Schema do Banco de Dados

### Tabelas de Estrutura Organizacional
- **TBdepartamento**: Departamentos de atendimento
  - Email específico do departamento
  - Horário de funcionamento
  - Configurações de SLA específicas
- **TBatendente_departamento**: Associação N:N entre atendentes e departamentos

### Tabelas de Classificação
- **TBcategoria**: Hierarquia de categorias de chamados
  - Estrutura de árvore ilimitada (categoria_pai_id)
  - Prioridade padrão por categoria
  - SLA específico por categoria

### Tabelas de SLA e Calendário
- **TBsla_configuracao**: Configurações de SLA
  - SLA geral (padrão)
  - SLA por cliente/categoria/prioridade (específicos)
  - Horário comercial
  - Escalações automáticas
- **TBferiado**: Feriados nacionais e locais
  - Data do feriado
  - Tipo (nacional, estadual, municipal)
  - Nome do feriado

### Tabelas de Comunicação
- **TBtemplate_email**: Templates de email
  - HTML/texto do template
  - Variáveis dinâmicas suportadas
  - Versionamento
- **TBtipo_template**: Tipos de template
  - Novo chamado, atualização, fechamento, etc.
  - Departamento específico (opcional)

### Tabelas de Automação
- **TBautomacao_regra**: Regras de automação
  - Condições (JSON)
  - Ações (JSON)
  - Agendamento (cron expression)
  - Ativo/inativo

### Tabelas de Auditoria
- **TBauditoria**: Registro completo de auditoria
  - Usuário que executou
  - Data/hora
  - Tipo de operação (INSERT, UPDATE, DELETE)
  - Entidade afetada
  - Valores anteriores e novos (JSON)
  - IP de origem

---

## Requisitos Relacionados

Esta área de User Stories implementa os seguintes requisitos (OSD):

**Configurações Gerais:**
- OSD128 a OSD134: Informações da empresa, personalização, email, segurança, limites, backup

**Gestão de Departamentos:**
- OSD135 a OSD141: Criação, emails, horários, associação com atendentes, SLA, validação

**Gestão de Categorias:**
- OSD142 a OSD148: Hierarquia, subcategorias, prioridades, SLA, reordenação, fusão

**Configuração de SLA:**
- OSD149 a OSD155: SLA geral e específicos, horário comercial, feriados, escalações, alertas

**Templates e Comunicação:**
- OSD156 a OSD162: Templates por tipo, WYSIWYG, variáveis, preview, versionamento, teste

**Automação:**
- OSD163 a OSD169: Regras visuais, condições, ações, agendamento, teste, logs

---

## Configurações Principais

### Configurações Globais
```javascript
{
  empresa: {
    nome: "Nome da Empresa",
    logo: "/assets/logo.png",
    cores: {
      primaria: "#3498db",
      secundaria: "#2c3e50"
    }
  },
  email: {
    smtp_host: "smtp.empresa.com",
    smtp_port: 587,
    smtp_user: "helpdesk@empresa.com",
    smtp_password: "***",
    from_name: "Suporte Técnico",
    from_email: "helpdesk@empresa.com"
  },
  seguranca: {
    max_tentativas_login: 5,
    tempo_bloqueio_minutos: 30,
    duracao_sessao_horas: 8,
    exigir_senha_forte: true,
    token_recuperacao_horas: 24
  },
  limites: {
    max_anexo_mb: 10,
    max_anexos_por_chamado: 5,
    chamados_por_pagina: 25
  },
  backup: {
    ativo: true,
    horario: "02:00",
    retencao_dias: 30
  }
}
```

### Exemplo de Categoria Hierárquica
```
Hardware
├── Computadores
│   ├── Desktop
│   └── Notebook
├── Impressoras
│   ├── Jato de Tinta
│   └── Laser
└── Periféricos
    ├── Mouse
    ├── Teclado
    └── Monitor

Software
├── Sistemas Operacionais
│   ├── Windows
│   └── Linux
├── Aplicativos
│   ├── Office
│   └── Adobe
└── Sistemas Internos
    ├── ERP
    └── CRM
```

### Exemplo de SLA
```javascript
{
  // SLA Geral (padrão)
  sla_geral: {
    primeira_resposta_horas: 4,
    resolucao_horas: 24,
    horario_comercial: {
      inicio: "08:00",
      fim: "18:00",
      dias_uteis: [1, 2, 3, 4, 5] // Seg-Sex
    }
  },

  // SLA Específico (exemplo)
  sla_especifico: {
    cliente_id: "cliente-premium",
    categoria_id: "hardware-critico",
    prioridade: "alta",
    primeira_resposta_horas: 1,
    resolucao_horas: 4,
    horario_24x7: true
  }
}
```

### Exemplo de Template de Email
```html
<!-- Template: Novo Chamado -->
Olá {{contato_nome}},

Seu chamado foi registrado com sucesso!

Protocolo: {{chamado_protocolo}}
Título: {{chamado_titulo}}
Departamento: {{departamento_nome}}
Prioridade: {{prioridade_nome}}

Você pode acompanhar o status do seu chamado em:
{{link_acompanhamento}}

Prazo de resolução: {{sla_prazo}}

Atenciosamente,
{{empresa_nome}}
```

### Variáveis Dinâmicas Disponíveis
```
Chamado:
- {{chamado_protocolo}}
- {{chamado_titulo}}
- {{chamado_descricao}}
- {{chamado_status}}
- {{chamado_prioridade}}
- {{chamado_data_abertura}}
- {{sla_prazo}}

Cliente/Contato:
- {{cliente_nome}}
- {{contato_nome}}
- {{contato_email}}

Atendimento:
- {{atendente_nome}}
- {{departamento_nome}}
- {{categoria_nome}}

Sistema:
- {{empresa_nome}}
- {{link_acompanhamento}}
- {{link_pesquisa_satisfacao}}
```

### Exemplo de Regra de Automação
```javascript
{
  nome: "Auto-atribuir chamados urgentes",
  ativo: true,
  condicoes: {
    prioridade: "urgente",
    departamento: "suporte-tecnico",
    status: "novo"
  },
  acoes: [
    {
      tipo: "atribuir",
      atendente_id: "supervisor-plantao"
    },
    {
      tipo: "notificar",
      destinatarios: ["gestores@empresa.com"],
      mensagem: "Novo chamado urgente: {{chamado_protocolo}}"
    },
    {
      tipo: "alterar_status",
      novo_status: "em-atendimento"
    }
  ],
  agendamento: "* * * * *" // Executar a cada minuto
}
```

---

## Eventos de Auditoria

### Tipos de Operação
- **CREATE**: Criação de nova entidade
- **UPDATE**: Atualização de entidade existente
- **DELETE**: Remoção de entidade
- **LOGIN**: Login bem-sucedido
- **LOGIN_FAILED**: Tentativa de login falha
- **LOGOUT**: Logout do sistema
- **PERMISSION_CHANGE**: Mudança em permissões
- **CONFIG_CHANGE**: Alteração em configurações

### Exemplo de Registro de Auditoria
```javascript
{
  id: "audit-123456",
  timestamp: "2025-01-15T14:30:00Z",
  usuario_id: "admin-001",
  usuario_nome: "João Silva",
  ip_origem: "192.168.1.100",
  operacao: "UPDATE",
  entidade_tipo: "chamado",
  entidade_id: "chamado-789",
  valores_anteriores: {
    status: "novo",
    atendente_id: null
  },
  valores_novos: {
    status: "em-atendimento",
    atendente_id: "atendente-042"
  }
}
```

---

## Resumo

**Total de User Stories:** 7 (14% do total do sistema)
**Personas Envolvidas:** Administradores
**Complexidade:** Alta (configurações críticas)
**Prioridade:** Alta (necessária antes de operação)
**Dependências:**
- STORY-module-helpdesk-identity (usuários, auditoria)
- Nenhuma outra dependência forte (configurações são base para outras áreas)

**Impacto:** Esta área define o "como" o sistema funciona - todas as outras áreas dependem destas configurações para operar corretamente.
