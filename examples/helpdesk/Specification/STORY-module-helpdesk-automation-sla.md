# STORY-module-helpdesk-automation-sla.md

## Área Temática: Automação, Templates e Auditoria

### Visão Geral

Esta área representa as **camadas avançadas de automação e governança** do sistema HelpDesk. As histórias deste grupo definem como administradores criam templates para padronizar comunicações, configuram regras de automação para reduzir trabalho manual e monitoram atividades através de logs de auditoria.

O agrupamento forma uma unidade coesa que implementa gerenciamento de templates de email (criação, versionamento, teste), sistema completo de automação baseado em regras (condições e ações configuráveis) e auditoria abrangente de todas as operações críticas do sistema. Esta área é essencial para eficiência operacional e compliance.

---

## User Stories

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

### Tabelas de Comunicação
- **TBtemplate_email**: Templates de email
  - Tipo do template
  - Nome do template
  - Assunto (com variáveis)
  - Corpo HTML
  - Corpo texto puro (fallback)
  - Variáveis suportadas (JSON)
  - Versão
  - Departamento específico (opcional)
  - Ativo/inativo
- **TBtipo_template**: Tipos de template
  - Novo chamado
  - Atualização de chamado
  - Fechamento de chamado
  - Pesquisa de satisfação
  - Recuperação de senha
  - Credenciais de acesso
  - etc.

### Tabelas de Automação
- **TBautomacao_regra**: Regras de automação
  - Nome da regra
  - Descrição
  - Condições (JSON)
  - Ações (JSON)
  - Agendamento (cron expression)
  - Última execução
  - Próxima execução
  - Total de execuções
  - Ativo/inativo
- **TBautomacao_log**: Log de execuções
  - Regra executada
  - Data/hora
  - Entidades afetadas
  - Resultado (sucesso/erro)
  - Tempo de execução

### Tabelas de Auditoria
- **TBauditoria**: Registro completo de auditoria
  - Usuário que executou
  - Data/hora
  - IP de origem
  - Tipo de operação (CREATE, UPDATE, DELETE, LOGIN, etc.)
  - Entidade afetada (tabela + ID)
  - Valores anteriores (JSON)
  - Valores novos (JSON)
  - User agent
  - Contexto adicional

---

## Requisitos Relacionados

Esta área de User Stories implementa os seguintes requisitos (OSD):

**Templates:**
- SPEC-MH-TPL-001 a SPEC-MH-TPL-007: Templates por tipo, WYSIWYG, variáveis, preview, versionamento, teste

**Automação:**
- SPEC-MH-AUTO-001 a SPEC-MH-AUTO-007: Regras visuais, condições, ações, agendamento, teste, logs

**Auditoria:**
- SPEC-MH-LOG-001 a SPEC-MH-LOG-007: Eventos de segurança, detecção de anomalias, alertas, logs estruturados

---

## Templates de Email

### Variáveis Dinâmicas Disponíveis

```
Chamado:
{{chamado_protocolo}}
{{chamado_titulo}}
{{chamado_descricao}}
{{chamado_status}}
{{chamado_prioridade}}
{{chamado_data_abertura}}
{{chamado_data_resolucao}}
{{sla_prazo}}
{{link_acompanhamento}}

Cliente/Contato:
{{cliente_nome}}
{{cliente_email}}
{{contato_nome}}
{{contato_email}}
{{contato_telefone}}

Atendimento:
{{atendente_nome}}
{{atendente_email}}
{{departamento_nome}}
{{categoria_nome}}
{{solucao}}

Sistema:
{{empresa_nome}}
{{empresa_site}}
{{link_portal}}
{{link_pesquisa_satisfacao}}
{{ano_atual}}
```

### Exemplo de Template

```html
Template: Novo Chamado Criado
Tipo: novo_chamado
Departamento: Todos

Assunto:
Chamado {{chamado_protocolo}} criado - {{chamado_titulo}}

Corpo HTML:
<html>
<body>
  <h2>Olá {{contato_nome}},</h2>

  <p>Seu chamado foi registrado com sucesso!</p>

  <table>
    <tr>
      <td><strong>Protocolo:</strong></td>
      <td>{{chamado_protocolo}}</td>
    </tr>
    <tr>
      <td><strong>Título:</strong></td>
      <td>{{chamado_titulo}}</td>
    </tr>
    <tr>
      <td><strong>Departamento:</strong></td>
      <td>{{departamento_nome}}</td>
    </tr>
    <tr>
      <td><strong>Prioridade:</strong></td>
      <td>{{chamado_prioridade}}</td>
    </tr>
  </table>

  <p>Você pode acompanhar o status do seu chamado em:<br>
  <a href="{{link_acompanhamento}}">Acompanhar Chamado</a></p>

  <p><strong>Prazo de resolução:</strong> {{sla_prazo}}</p>

  <p>Atenciosamente,<br>
  {{empresa_nome}}</p>
</body>
</html>
```

---

## Regras de Automação

### Estrutura de Regra

```javascript
{
  id: "regra-001",
  nome: "Auto-atribuir chamados urgentes",
  descricao: "Atribui automaticamente chamados urgentes ao supervisor",
  ativo: true,
  condicoes: {
    operador: "AND",
    regras: [
      {
        campo: "prioridade",
        operador: "igual_a",
        valor: "urgente"
      },
      {
        campo: "status",
        operador: "igual_a",
        valor: "novo"
      },
      {
        campo: "departamento",
        operador: "igual_a",
        valor: "suporte-tecnico"
      }
    ]
  },
  acoes: [
    {
      tipo: "atribuir",
      atendente_id: "supervisor-001"
    },
    {
      tipo: "notificar_email",
      destinatarios: ["supervisor@xpto.com"],
      template: "alerta-urgente"
    },
    {
      tipo: "alterar_campo",
      campo: "tag",
      valor: "supervisor-atencao"
    }
  ],
  agendamento: {
    tipo: "evento", // evento ou cron
    evento: "chamado.criado"
  },
  estatisticas: {
    ultima_execucao: "2025-01-15T10:30:00Z",
    total_execucoes: 42,
    total_sucesso: 41,
    total_erro: 1
  }
}
```

### Tipos de Condições

**Campos disponíveis:**
- status, prioridade, departamento, categoria
- cliente, contato, atendente
- data_abertura, tempo_decorrido
- tags aplicadas
- campos personalizados

**Operadores:**
- igual_a, diferente_de
- maior_que, menor_que
- contem, nao_contem
- comeca_com, termina_com
- esta_vazio, nao_esta_vazio
- esta_em_lista, nao_esta_em_lista

### Tipos de Ações

**Atribuição:**
- Atribuir a atendente específico
- Atribuir a departamento
- Auto-atribuir ao criador

**Status:**
- Alterar status
- Mover para fila específica

**Notificação:**
- Enviar email
- Criar notificação no sistema
- Enviar webhook

**Campos:**
- Alterar prioridade
- Adicionar tag
- Alterar categoria
- Atualizar campo personalizado

**Integração:**
- Disparar webhook
- Chamar API externa
- Criar registro em sistema externo

---

## Auditoria do Sistema

### Tipos de Eventos Auditados

**Autenticação:**
- LOGIN - Login bem-sucedido
- LOGIN_FAILED - Tentativa de login falha
- LOGOUT - Logout do sistema
- PASSWORD_RESET - Senha redefinida

**Dados:**
- CREATE - Criação de entidade
- UPDATE - Atualização de entidade
- DELETE - Remoção de entidade
- EXPORT - Exportação de dados

**Permissões:**
- PERMISSION_GRANT - Permissão concedida
- PERMISSION_REVOKE - Permissão revogada
- ROLE_CHANGE - Mudança de papel

**Configuração:**
- CONFIG_CHANGE - Alteração de configuração
- AUTOMATION_CHANGE - Regra de automação alterada
- TEMPLATE_CHANGE - Template modificado

### Exemplo de Registro

```javascript
{
  id: "audit-123456",
  timestamp: "2025-01-15T14:30:00Z",
  usuario: {
    id: "user-042",
    nome: "João Silva",
    email: "joao@xpto.com"
  },
  ip_origem: "192.168.1.100",
  user_agent: "Mozilla/5.0...",
  operacao: "UPDATE",
  entidade: {
    tipo: "chamado",
    id: "chamado-789",
    titulo: "Problema com impressora"
  },
  mudancas: {
    status: {
      antes: "novo",
      depois: "em-atendimento"
    },
    atendente_id: {
      antes: null,
      depois: "atendente-042"
    }
  },
  contexto: {
    origem: "web",
    modulo: "gestao-chamados",
    acao: "atribuir-chamado"
  }
}
```

### Alertas de Segurança

**Atividades Suspeitas Monitoradas:**
- Múltiplas tentativas de login falhadas
- Login de IP desconhecido
- Múltiplas alterações de permissões
- Exportação em massa de dados
- Exclusão de múltiplos registros
- Acesso fora do horário habitual
- Mudanças em configurações críticas

---

## Resumo

**Total de User Stories:** 3
**Personas Envolvidas:** Administradores, Auditores
**Complexidade:** Alta (automação e segurança)
**Prioridade:** Média-Alta (eficiência e compliance)
**Dependências:**
- STORY-module-helpdesk-user-profile-rbac (apenas administradores)
- STORY-module-helpdesk-ticket-management (entidades a serem automatizadas)
