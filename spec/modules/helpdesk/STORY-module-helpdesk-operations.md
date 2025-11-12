# STORY-module-helpdesk-operations.md

## Área Temática: Núcleo Operacional de Atendimento

### Visão Geral

Esta é a **maior e mais crítica área do sistema HelpDesk**, representando o coração operacional onde todo o trabalho acontece. As histórias deste grupo cobrem o ciclo de vida completo de solicitações de suporte, desde a abertura até o fechamento, incluindo tanto o fluxo assíncrono (chamados/tickets) quanto o síncrono (atendimento online via chat).

O agrupamento forma uma unidade coesa que implementa gestão completa de chamados, workflow de status, sistema de atribuição e distribuição de trabalho, comunicação rica via comentários e anexos, e toda a plataforma de atendimento em tempo real. Esta é a razão de existir do HelpDesk - facilitar e organizar o atendimento ao cliente de forma eficiente.

Com 14 User Stories (28% do total), esta área reflete a complexidade e importância central do atendimento operacional.

---

## User Stories - Gestão de Chamados

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

## User Stories - Atendimento Online

### US023 - Widget de Chat (Site Cliente)
**Como** visitante do site
**Eu quero** iniciar um atendimento online
**Para que** eu possa obter suporte imediato

**Critérios de Sucesso:**
- [ ] Widget flutuante no site
- [ ] Formulário inicial com nome e email
- [ ] Seleção de departamento
- [ ] Mensagem de boas-vindas personalizada
- [ ] Indicação de tempo de espera
- [ ] Funciona em dispositivos móveis
- [ ] Integração com sistema de filas

**Tabelas Relacionadas:** `TBatendimento`, `TBdepartamento`

---

### US024 - Console de Atendimento
**Como** atendente
**Eu quero** atender visitantes em tempo real
**Para que** eu possa fornecer suporte imediato

**Critérios de Sucesso:**
- [ ] Interface de chat em tempo real
- [ ] Lista de atendimentos em fila
- [ ] Informações do visitante (localização, página)
- [ ] Histórico de mensagens
- [ ] Envio de arquivos e imagens
- [ ] Templates de respostas rápidas
- [ ] Indicadores de digitação
- [ ] Notificações sonoras/visuais

**Tabelas Relacionadas:** `TBatendimento`, `TBatendimento_mensagem`, `TBtemplate_email`

---

### US025 - Transferência de Atendimento
**Como** atendente
**Eu quero** transferir atendimentos para outros atendentes
**Para que** o visitante seja direcionado ao especialista correto

**Critérios de Sucesso:**
- [ ] Lista de atendentes disponíveis
- [ ] Campo para motivo da transferência
- [ ] Preservação do histórico de mensagens
- [ ] Notificação ao visitante sobre transferência
- [ ] Handoff suave entre atendentes
- [ ] Possibilidade de transferir com contexto
- [ ] Registro no histórico do atendimento

**Tabelas Relacionadas:** `TBatendimento`, `TBatendente`, `TBatendimento_mensagem`

---

### US026 - Finalização de Atendimento
**Como** atendente
**Eu quero** finalizar atendimentos concluídos
**Para que** eu possa liberar a fila e registrar a resolução

**Critérios de Sucesso:**
- [ ] Botão de finalizar atendimento
- [ ] Campo para observações finais
- [ ] Opção de criar chamado a partir do atendimento
- [ ] Envio de transcrição por email (opcional)
- [ ] Pesquisa de satisfação automática
- [ ] Cálculo de tempo total de atendimento
- [ ] Liberação da capacidade do atendente

**Tabelas Relacionadas:** `TBatendimento`, `TBchamado`, `TBtemplate_email`

---

## Schema do Banco de Dados

### Tabelas de Chamados
- **TBchamado**: Dados principais dos chamados/tickets
- **TBchamado_historico**: Timeline completa de alterações
- **TBchamado_comentario**: Comentários internos e externos
- **TBchamado_anexo**: Arquivos anexados aos chamados
- **TBstatus_chamado**: Catálogo de status possíveis
- **TBtipo_prioridade**: Níveis de prioridade (baixa, média, alta, urgente)

### Tabelas de Atendimento Online
- **TBatendimento**: Sessões de chat em tempo real
- **TBatendimento_mensagem**: Histórico de mensagens do chat

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

**Criação e Edição de Chamados:**
- OSD051 a OSD057: Abertura, validação, protocolo, anexos, SLA

**Atribuição e Workflow:**
- OSD058 a OSD064: Atribuição manual/automática, validações, notificações, histórico

**Status e Workflow:**
- OSD065 a OSD071: Workflow configurável, transições, SLA, alertas, reabertura

**Comentários e Comunicação:**
- OSD072 a OSD078: Comentários internos/externos, editor rico, menções, templates

**Atendimento Online:**
- OSD079 a OSD092: Chat em tempo real, filas, transferências, conversão para chamados

---

## Fluxos Principais

### Fluxo de Chamado Completo
```
1. Abertura (US015/US016)
   ↓
2. Atribuição (US019)
   ↓
3. Trabalho (US017, US018, US020)
   ↓
4. Mudanças de Status (US021)
   ↓
5. Fechamento (US022)
   ↓
6. Pesquisa de Satisfação
```

### Fluxo de Atendimento Online
```
1. Visitante inicia chat (US023)
   ↓
2. Atendente aceita (US024)
   ↓
3. Conversação em tempo real
   ↓
4. Transferência se necessário (US025)
   ↓
5. Finalização (US026)
   ↓
6. Opcionalmente → Criar Chamado
```

---

## Resumo

**Total de User Stories:** 14 (28% do total do sistema)
**Personas Envolvidas:** Atendentes, Supervisores, Clientes, Visitantes
**Complexidade:** Muito Alta (núcleo do sistema)
**Prioridade:** Crítica (razão de existir do HelpDesk)
**Dependências:**
- STORY-module-helpdesk-identity (autenticação, permissões)
- STORY-module-helpdesk-relationships (clientes, contatos)
- STORY-module-helpdesk-administration (departamentos, categorias, SLA)
