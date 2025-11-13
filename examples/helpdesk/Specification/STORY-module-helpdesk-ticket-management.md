# STORY-module-helpdesk-ticket-management.md

## Área Temática: Gestão de Chamados (Tickets)

### Visão Geral

Esta é a **área central do sistema HelpDesk**, representando o coração operacional onde o trabalho de suporte acontece. As histórias deste grupo cobrem o ciclo de vida completo de chamados desde a abertura até o fechamento, incluindo visualização, edição, atribuição, workflow de status, comunicação via comentários e gestão de anexos.

O agrupamento forma uma unidade coesa que implementa dashboard operacional, listas filtráveis de chamados, abertura por múltiplos canais (portal do cliente e atendentes), atribuição manual e automática de trabalho, gestão de status com workflow configurável, sistema rico de comentários (internos/externos) e suporte a anexos. Esta é a razão principal de existir do HelpDesk.

---

## User Stories

### US013 - Dashboard de Chamados
**Como** atendente
**Eu quero** visualizar um dashboard dos chamados
**Para que** eu possa ter uma visão geral do trabalho

**Critérios de Sucesso:**
- [ ] Cards com contadores por status
- [ ] Gráficos de chamados por período
- [ ] Lista de chamados atribuídos a mim
- [ ] Chamados próximos do vencimento SLA
- [ ] Filtros rápidos (hoje, semana, mês)
- [ ] Indicadores de performance pessoal
- [ ] Atalhos para ações frequentes

**Tabelas Relacionadas:** `TBchamado`, `TBstatus_chamado`, `TBsla_configuracao`

---

### US014 - Lista de Chamados
**Como** atendente
**Eu quero** visualizar lista completa de chamados
**Para que** eu possa gerenciar e priorizar o trabalho

**Critérios de Sucesso:**
- [ ] Lista paginada com múltiplos filtros
- [ ] Colunas configuráveis pelo usuário
- [ ] Filtros: status, prioridade, departamento, atendente
- [ ] Busca por protocolo, título ou cliente
- [ ] Ordenação por data, prioridade, SLA
- [ ] Ações em lote (atribuir, alterar status)
- [ ] Indicadores visuais de urgência
- [ ] Exportação para Excel/PDF

**Tabelas Relacionadas:** `TBchamado`, `TBstatus_chamado`, `TBtipo_prioridade`, `TBcontato`, `TBatendente`

---

### US015 - Abertura de Chamado (Portal Cliente)
**Como** contato de cliente
**Eu quero** abrir um chamado no portal
**Para que** eu possa solicitar suporte

**Critérios de Sucesso:**
- [ ] Formulário simplificado e intuitivo
- [ ] Seleção de departamento e categoria
- [ ] Campo de título obrigatório
- [ ] Editor rico para descrição
- [ ] Upload de anexos múltiplos
- [ ] Seleção de prioridade (se permitido)
- [ ] Geração automática de protocolo
- [ ] Email de confirmação automático
- [ ] Redirecionamento para acompanhamento

**Tabelas Relacionadas:** `TBchamado`, `TBdepartamento`, `TBcategoria`, `TBchamado_anexo`

---

### US016 - Abertura de Chamado (Atendente)
**Como** atendente
**Eu quero** abrir chamados em nome dos clientes
**Para que** eu possa registrar solicitações recebidas por telefone/email

**Critérios de Sucesso:**
- [ ] Busca e seleção de cliente/contato
- [ ] Todos os campos disponíveis para preenchimento
- [ ] Atribuição automática ou manual
- [ ] Definição de prioridade
- [ ] Adição de observações internas
- [ ] Anexos e documentos
- [ ] Configuração de SLA específico
- [ ] Notificação automática ao cliente

**Tabelas Relacionadas:** `TBchamado`, `TBcontato`, `TBatendente`, `TBdepartamento`, `TBcategoria`

---

### US017 - Visualização de Chamado
**Como** usuário do sistema
**Eu quero** visualizar detalhes completos de um chamado
**Para que** eu possa entender o contexto e histórico

**Critérios de Sucesso:**
- [ ] Cabeçalho com informações principais
- [ ] Timeline completa de atividades
- [ ] Comentários internos e externos separados
- [ ] Lista de anexos com download
- [ ] Informações do cliente e contato
- [ ] Status atual e histórico de mudanças
- [ ] Indicadores de SLA e prazos
- [ ] Ações disponíveis baseadas em permissões

**Tabelas Relacionadas:** `TBchamado`, `TBchamado_historico`, `TBchamado_comentario`, `TBchamado_anexo`

---

### US018 - Edição de Chamado
**Como** atendente
**Eu quero** editar informações do chamado
**Para que** eu possa corrigir dados ou atualizar informações

**Critérios de Sucesso:**
- [ ] Formulário com campos editáveis
- [ ] Validação de permissões por campo
- [ ] Registro automático no histórico
- [ ] Notificações para mudanças importantes
- [ ] Prevenção de edições conflitantes
- [ ] Campos calculados atualizados automaticamente
- [ ] Confirmação para mudanças críticas

**Tabelas Relacionadas:** `TBchamado`, `TBchamado_historico`, `TBauditoria`

---

### US019 - Atribuição de Chamados
**Como** supervisor
**Eu quero** atribuir chamados aos atendentes
**Para que** o trabalho seja distribuído adequadamente

**Critérios de Sucesso:**
- [ ] Lista de atendentes disponíveis por departamento
- [ ] Indicação de carga de trabalho atual
- [ ] Atribuição individual ou em lote
- [ ] Regras de auto-atribuição configuráveis
- [ ] Notificação automática ao atendente
- [ ] Histórico de atribuições
- [ ] Possibilidade de reatribuição

**Tabelas Relacionadas:** `TBchamado`, `TBatendente`, `TBatendente_departamento`, `TBnotificacao`

---

### US020 - Comentários em Chamados
**Como** usuário autorizado
**Eu quero** adicionar comentários aos chamados
**Para que** eu possa comunicar atualizações e informações

**Critérios de Sucesso:**
- [ ] Editor de texto rico
- [ ] Seleção de tipo (interno/externo)
- [ ] Anexos em comentários
- [ ] Menções a outros usuários (@usuario)
- [ ] Notificações automáticas
- [ ] Edição de comentários próprios
- [ ] Histórico de edições
- [ ] Templates de respostas rápidas

**Tabelas Relacionadas:** `TBchamado_comentario`, `TBusuario`, `TBnotificacao`

---

### US021 - Mudança de Status
**Como** atendente
**Eu quero** alterar o status dos chamados
**Para que** eu possa refletir o progresso do atendimento

**Critérios de Sucesso:**
- [ ] Lista de status disponíveis baseada no atual
- [ ] Campos obrigatórios por transição de status
- [ ] Validação de regras de negócio
- [ ] Comentário obrigatório em certas mudanças
- [ ] Cálculo automático de tempos (SLA)
- [ ] Notificações automáticas
- [ ] Registro no histórico

**Tabelas Relacionadas:** `TBchamado`, `TBstatus_chamado`, `TBchamado_historico`

---

### US022 - Fechamento de Chamado
**Como** atendente
**Eu quero** fechar chamados resolvidos
**Para que** o cliente seja notificado e o SLA seja calculado

**Critérios de Sucesso:**
- [ ] Formulário de fechamento com solução
- [ ] Seleção de categoria de resolução
- [ ] Tempo gasto no atendimento
- [ ] Envio automático de pesquisa de satisfação
- [ ] Cálculo de métricas de SLA
- [ ] Possibilidade de reabrir se necessário
- [ ] Notificação ao cliente

**Tabelas Relacionadas:** `TBchamado`, `TBchamado_satisfacao`, `TBtemplate_email`

---

## Schema do Banco de Dados

### Tabelas de Chamados
- **TBchamado**: Dados principais dos chamados/tickets
- **TBchamado_historico**: Timeline completa de alterações
- **TBchamado_comentario**: Comentários internos e externos
- **TBchamado_anexo**: Arquivos anexados aos chamados
- **TBstatus_chamado**: Catálogo de status possíveis
- **TBtipo_prioridade**: Níveis de prioridade (baixa, média, alta, urgente)

### Tabelas de Suporte
- **TBatendente**: Dados dos atendentes
- **TBatendente_departamento**: Associação N:N atendentes/departamentos
- **TBdepartamento**: Departamentos de atendimento
- **TBcategoria**: Categorias hierárquicas de chamados
- **TBsla_configuracao**: Configurações de SLA
- **TBcontato**: Contatos que abrem chamados
- **TBnotificacao**: Sistema de notificações
- **TBtemplate_email**: Templates de comunicação
- **TBauditoria**: Registro de auditoria

---

## Requisitos Relacionados

Esta área de User Stories implementa os seguintes requisitos (OSD):

**Criação e Edição:**
- SPEC-MH-TKT-001 a SPEC-MH-TKT-007: Abertura, validação, protocolo, anexos, SLA

**Atribuição:**
- SPEC-MH-ASSIGN-001 a SPEC-MH-ASSIGN-007: Atribuição manual/automática, validações, notificações, histórico

**Workflow:**
- SPEC-MH-WF-001 a SPEC-MH-WF-007: Workflow configurável, transições, SLA, alertas, reabertura

**Comunicação:**
- SPEC-MH-COMM-001 a SPEC-MH-COMM-007: Comentários internos/externos, editor rico, menções, templates

---

## Fluxo de Chamado Completo

```
1. Abertura (US015/US016)
   - Cliente via portal OU atendente via sistema
   - Preenchimento de dados obrigatórios
   - Geração de protocolo único
   ↓
2. Atribuição (US019)
   - Manual por supervisor OU
   - Automática por regras
   - Notificação ao atendente
   ↓
3. Trabalho (US017, US018, US020)
   - Atendente visualiza detalhes
   - Adiciona comentários/anexos
   - Edita informações se necessário
   ↓
4. Mudanças de Status (US021)
   - Novo → Em Atendimento
   - Em Atendimento → Aguardando Cliente
   - Aguardando Cliente → Em Atendimento
   - Em Atendimento → Resolvido
   ↓
5. Fechamento (US022)
   - Registro da solução
   - Cálculo de métricas
   - Envio de pesquisa de satisfação
   ↓
6. Possível Reabertura
   - Cliente não satisfeito
   - Problema recorrente
```

---

## Resumo

**Total de User Stories:** 10 (20% do total do sistema)
**Personas Envolvidas:** Atendentes, Supervisores, Clientes
**Complexidade:** Muito Alta (núcleo do sistema)
**Prioridade:** Crítica (razão de existir do HelpDesk)
**Dependências:**
- STORY-module-helpdesk-user-profile-rbac (autenticação, permissões)
- STORY-module-helpdesk-client-management (clientes)
- STORY-module-helpdesk-contact-management (contatos)
- STORY-module-helpdesk-system-configuration (departamentos, categorias, SLA)
