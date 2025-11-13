# STORY-module-helpdesk-live-support.md

## Área Temática: Atendimento Online (Chat em Tempo Real)

### Visão Geral

Esta área representa o **canal síncrono de atendimento** do sistema HelpDesk, complementando o modelo tradicional de tickets. As histórias deste grupo cobrem todo o fluxo de chat em tempo real, desde a iniciação pelo visitante do site até a finalização pelo atendente, incluindo transferências entre equipes.

O agrupamento forma uma unidade coesa que implementa widget de chat para sites, console de atendimento para atendentes, sistema de filas inteligente, transferência de atendimentos com contexto preservado e finalização com possibilidade de conversão para chamado. Este canal é essencial para suporte imediato e resolução rápida de dúvidas simples.

---

## User Stories

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

### Tabelas de Atendimento Online
- **TBatendimento**: Sessões de chat em tempo real
  - ID do visitante (anônimo ou autenticado)
  - Atendente responsável
  - Departamento
  - Data/hora início e fim
  - Status (aguardando, em atendimento, finalizado)
  - Tempo total de atendimento
  - Informações do visitante (IP, navegador, localização)
  - Avaliação de satisfação (opcional)
- **TBatendimento_mensagem**: Histórico de mensagens do chat
  - Atendimento relacionado
  - Autor (visitante ou atendente)
  - Conteúdo da mensagem
  - Data/hora
  - Tipo (texto, arquivo, sistema)
  - Anexos (se aplicável)

### Tabelas de Suporte
- **TBatendente**: Dados dos atendentes
- **TBdepartamento**: Departamentos de atendimento
- **TBchamado**: Para conversão de atendimento em chamado
- **TBtemplate_email**: Templates para transcrições e respostas rápidas

---

## Requisitos Relacionados

Esta área de User Stories implementa os seguintes requisitos (OSD):

**Chat em Tempo Real:**
- SPEC-MH-CHAT-001 a SPEC-MH-CHAT-007: Widget, tempo real, filas, captura de informações, arquivos, indicadores

**Gestão de Atendimentos:**
- SPEC-MH-CHATMGMT-001 a SPEC-MH-CHATMGMT-007: Transferências, histórico, finalização, conversão para chamado, métricas

---

## Fluxo de Atendimento Online

```
1. Visitante inicia chat (US023)
   - Acessa site e clica no widget
   - Preenche nome/email
   - Seleciona departamento
   - Entra na fila
   ↓
2. Sistema gerencia fila
   - Mostra tempo de espera estimado
   - Atribui próximo atendente disponível
   - Notifica atendente
   ↓
3. Atendente aceita (US024)
   - Visualiza informações do visitante
   - Abre console de chat
   - Inicia conversação
   ↓
4. Conversação em tempo real
   - Troca de mensagens
   - Envio de arquivos se necessário
   - Uso de respostas rápidas
   - Indicadores de digitação
   ↓
5. Transferência se necessário (US025)
   - Atendente identifica necessidade de especialista
   - Seleciona departamento/atendente destino
   - Adiciona contexto da transferência
   - Sistema notifica novo atendente
   - Histórico é preservado
   ↓
6. Finalização (US026)
   - Problema resolvido
   - Atendente registra observações
   - Opcionalmente cria chamado
   - Envia transcrição por email
   - Solicita avaliação de satisfação
   - Libera capacidade do atendente
```

---

## Sistema de Filas

### Lógica de Distribuição
1. Visitante entra na fila do departamento selecionado
2. Sistema identifica atendentes online naquele departamento
3. Calcula carga atual de cada atendente
4. Atribui ao atendente com menor carga
5. Se todos ocupados, mantém em fila
6. Notifica visitante sobre posição na fila

### Métricas de Fila
- Tempo médio de espera
- Tempo máximo de espera atual
- Quantidade de visitantes aguardando
- Taxa de abandono (visitantes que desistem)

---

## Console do Atendente

### Interface
```
┌─────────────────────────────────────────────────┐
│ CONSOLE DE ATENDIMENTO                          │
├─────────────────────────────────────────────────┤
│                                                 │
│  FILA (3)                 ATENDIMENTOS ATIVOS   │
│  ┌─────────────┐         ┌──────────────────┐  │
│  │ João Silva  │         │ Maria Santos     │  │
│  │ Aguarda 2min│         │ 5 min de conv.   │  │
│  └─────────────┘         │ [CHAT ATIVO]     │  │
│  ┌─────────────┐         └──────────────────┘  │
│  │ Ana Costa   │                                │
│  │ Aguarda 1min│                                │
│  └─────────────┘                                │
│                                                 │
│  HISTÓRICO DE MENSAGENS                         │
│  ┌───────────────────────────────────────────┐ │
│  │ Visitante: Olá, preciso de ajuda          │ │
│  │ Você: Olá! Como posso ajudar?             │ │
│  │ Visitante: Não consigo fazer login        │ │
│  │ Você: [digitando...]                      │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  [____________________________] [Enviar] [📎]  │
│                                                 │
│  [Transferir] [Criar Chamado] [Finalizar]      │
└─────────────────────────────────────────────────┘
```

---

## Conversão para Chamado

Quando um atendimento via chat precisa de acompanhamento posterior:

1. Atendente clica em "Criar Chamado"
2. Sistema pré-preenche formulário:
   - Título: Extraído da conversa
   - Descrição: Transcrição do chat
   - Cliente/Contato: Do atendimento
   - Departamento/Categoria: Do atendimento
3. Atendente revisa e complementa informações
4. Chamado é criado e vinculado ao atendimento
5. Visitante recebe protocolo do chamado
6. Atendimento é finalizado

---

## Resumo

**Total de User Stories:** 4
**Personas Envolvidas:** Visitantes, Atendentes, Supervisores
**Complexidade:** Alta (comunicação em tempo real)
**Prioridade:** Média-Alta (canal adicional importante)
**Dependências:**
- STORY-module-helpdesk-user-profile-rbac (autenticação de atendentes)
- STORY-module-helpdesk-system-configuration (departamentos)
- STORY-module-helpdesk-ticket-management (conversão para chamado)
