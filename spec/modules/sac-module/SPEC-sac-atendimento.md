# SPEC-sac-atendimento.md

## Especificacao: Modulo Atendimento (Live Chat)

### Escopo

Este documento define os requisitos tecnicos formais do modulo **atendimento**, que fornece interface de chat em tempo real para comunicacao sincrona entre clientes e agentes de suporte. O modulo implementa funcionalidades de live chat inspiradas em sistemas como Zendesk Chat, Intercom e LiveChat.

**Publico**: Desenvolvedores frontend/backend, arquitetos, analistas de qualidade.

**Referencias**:
- `spec/modules/sac-module/SPEC-sac-concepts.md` - Conceitos compartilhados (194 requisitos)
- `spec/modules/sac-module/atendimento/USER-STORIES.md` - 24 user stories do atendimento
- `spec/modules/sac-module/CONSTRAINTS.md` - Restricoes e limitacoes
- `spec/SPEC-events.md` - Sistema de eventos SSE
- `spec/SPEC-channels.md` - Redis Pub/Sub
- `spec/SPEC-data-access.md` - JQEL (acesso a dados)

---

## 1. Iniciacao de Chat

### Definicao

Funcionalidades de inicio de conversa por visitantes anonimos e clientes autenticados.

### Requisitos

#### 1.1. Chat Anonimo

**SPEC-sac-AT-INI-001:** Sistema DEVE permitir visitante iniciar chat sem autenticacao.

**SPEC-sac-AT-INI-002:** Widget de chat DEVE ser visivel e acessivel em todas as paginas.

**SPEC-sac-AT-INI-003:** Botao "Iniciar Conversa" DEVE estar sempre disponivel no widget.

**SPEC-sac-AT-INI-004:** Formulario pre-chat DEVE solicitar:
- Nome (obrigatorio)
- Email (opcional)
- Mensagem inicial (obrigatorio)

**SPEC-sac-AT-INI-005:** Chat DEVE ser iniciado sem necessidade de cadastro ou login.

**SPEC-sac-AT-INI-006:** Visitante DEVE entrar automaticamente na fila de atendimento.

**SPEC-sac-AT-INI-007:** Sistema DEVE exibir mensagem de aguardo enquanto espera agente.

**SPEC-sac-AT-INI-008:** Mutacao JQEL DEVE usar `schema: "sac", mutate: "atendimento", action: "insert"` com `tipo: "anonimo"`.

**SPEC-sac-AT-INI-009:** Componente React DEVE ser `<ChatWidget />` com `<PreChatForm />`.

#### 1.2. Chat Autenticado

**SPEC-sac-AT-INI-010:** Sistema DEVE identificar cliente autenticado automaticamente.

**SPEC-sac-AT-INI-011:** Cliente autenticado NAO DEVE preencher formulario pre-chat.

**SPEC-sac-AT-INI-012:** Sistema DEVE carregar historico de conversas anteriores do cliente.

**SPEC-sac-AT-INI-013:** Sistema DEVE disponibilizar contexto do cliente (tickets anteriores, compras) para agente.

**SPEC-sac-AT-INI-014:** Chat DEVE ser iniciado diretamente na fila de atendimento.

**SPEC-sac-AT-INI-015:** Mutacao JQEL DEVE usar `schema: "sac", mutate: "atendimento", action: "insert"` com `cliente_id` e `contato_id`.

#### 1.3. Fila de Espera

**SPEC-sac-AT-INI-016:** Sistema DEVE exibir posicao do visitante na fila (ex: "Voce e o 3o na fila").

**SPEC-sac-AT-INI-017:** Sistema DEVE calcular e exibir tempo estimado de espera se disponivel.

**SPEC-sac-AT-INI-018:** Posicao DEVE ser atualizada em tempo real via SSE conforme fila avanca.

**SPEC-sac-AT-INI-019:** Sistema DEVE oferecer opcao de deixar mensagem se tempo de espera muito longo (>10 min).

**SPEC-sac-AT-INI-020:** Posicao em fila DEVE ser calculada por ordem de criacao do atendimento (FIFO).

**SPEC-sac-AT-INI-021:** Query JQEL DEVE contar atendimentos com `status: "aguardando"` criados antes do atual.

---

## 2. Troca de Mensagens

### Definicao

Funcionalidades de envio, recebimento e exibicao de mensagens em tempo real.

### Requisitos

#### 2.1. Envio de Mensagem

**SPEC-sac-AT-MSG-001:** Sistema DEVE permitir digitacao e envio de mensagens de texto.

**SPEC-sac-AT-MSG-002:** Envio DEVE ocorrer ao pressionar Enter OU clicar no botao "Enviar".

**SPEC-sac-AT-MSG-003:** Mensagem DEVE aparecer instantaneamente na interface do remetente.

**SPEC-sac-AT-MSG-004:** Sistema DEVE exibir indicador visual de mensagem enviada (checkmark).

**SPEC-sac-AT-MSG-005:** Sistema DEVE suportar emojis no texto da mensagem.

**SPEC-sac-AT-MSG-006:** Mutacao JQEL DEVE usar `schema: "sac", mutate: "atendimento_mensagem", action: "insert"`.

**SPEC-sac-AT-MSG-007:** Sistema DEVE publicar evento SSE ao enviar mensagem:
```json
{
  "type": "chat-message",
  "target": "chat:<atendimento_id>",
  "data": {
    "message_id": "<id>",
    "author": "<nome>",
    "timestamp": "<iso8601>"
  }
}
```

**SPEC-sac-AT-MSG-008:** Componente React DEVE ser `<MessageInput />` com campo de texto e botao enviar.

#### 2.2. Recebimento de Mensagem

**SPEC-sac-AT-MSG-009:** Sistema DEVE receber mensagens do outro participante em tempo real via SSE.

**SPEC-sac-AT-MSG-010:** Mensagens DEVEM aparecer em menos de 1 segundo apos envio.

**SPEC-sac-AT-MSG-011:** Sistema DEVE diferenciar visualmente mensagens proprias de mensagens do outro participante.

**SPEC-sac-AT-MSG-012:** Sistema DEVE reproduzir som ou notificacao quando nova mensagem chega.

**SPEC-sac-AT-MSG-013:** Sistema DEVE fazer scroll automatico para ultima mensagem ao receber nova.

**SPEC-sac-AT-MSG-014:** Frontend DEVE escutar canal SSE especifico do chat: `chat:<atendimento_id>`.

**SPEC-sac-AT-MSG-015:** Componente React DEVE ser `<MessageList />` com auto-scroll e renderizacao otimizada.

#### 2.3. Indicador de Digitacao

**SPEC-sac-AT-MSG-016:** Sistema DEVE exibir indicador "Agente digitando..." quando agente esta escrevendo.

**SPEC-sac-AT-MSG-017:** Indicador DEVE aparecer em tempo real (delay <500ms).

**SPEC-sac-AT-MSG-018:** Indicador DEVE desaparecer quando agente para de digitar.

**SPEC-sac-AT-MSG-019:** Indicador DEVE desaparecer quando agente envia mensagem.

**SPEC-sac-AT-MSG-020:** Sistema DEVE publicar evento SSE de digitacao:
```json
{
  "type": "chat-typing",
  "target": "chat:<atendimento_id>",
  "data": {
    "user": "<nome>",
    "typing": true
  }
}
```

**SPEC-sac-AT-MSG-021:** Frontend DEVE enviar evento de digitacao com debounce de 500ms.

**SPEC-sac-AT-MSG-022:** Componente React DEVE ser `<TypingIndicator />`.

#### 2.4. Status de Leitura

**SPEC-sac-AT-MSG-023:** Sistema DEVE exibir marcador de "Enviada" quando mensagem sai.

**SPEC-sac-AT-MSG-024:** Sistema DEVE exibir marcador de "Lida" quando destinatario visualiza.

**SPEC-sac-AT-MSG-025:** Marcadores DEVEM ser visiveis nas mensagens.

**SPEC-sac-AT-MSG-026:** Sistema DEVE publicar evento SSE de leitura:
```json
{
  "type": "chat-read",
  "target": "chat:<atendimento_id>",
  "data": {
    "message_id": "<id>",
    "read_by": "<usuario_id>",
    "timestamp": "<iso8601>"
  }
}
```

**SPEC-sac-AT-MSG-027:** Mutacao JQEL DEVE atualizar campo `lida_em` da mensagem.

---

## 3. Recursos de Comunicacao

### Definicao

Funcionalidades avancadas de comunicacao como anexos e reacoes.

### Requisitos

#### 3.1. Envio de Imagens

**SPEC-sac-AT-REC-001:** Sistema DEVE permitir envio de imagens (PNG, JPG, GIF).

**SPEC-sac-AT-REC-002:** Sistema DEVE exibir preview da imagem antes de enviar.

**SPEC-sac-AT-REC-003:** Imagem DEVE ser exibida inline na conversa.

**SPEC-sac-AT-REC-004:** Sistema DEVE validar limite de tamanho (configuravel, padrao: 5MB).

**SPEC-sac-AT-REC-005:** Upload DEVE ser processado via endpoint `/api/upload`.

**SPEC-sac-AT-REC-006:** Mutacao JQEL DEVE usar `schema: "sac", mutate: "atendimento_mensagem", action: "insert"` com `tipo: "imagem"` e `url_anexo`.

**SPEC-sac-AT-REC-007:** Componente React DEVE ser `<ImageUpload />` com preview e progress bar.

#### 3.2. Envio de Documentos

**SPEC-sac-AT-REC-008:** Sistema DEVE permitir envio de documentos (PDF, DOCX, TXT).

**SPEC-sac-AT-REC-009:** Nome do arquivo DEVE ser exibido na conversa.

**SPEC-sac-AT-REC-010:** Download DEVE estar disponivel para o destinatario.

**SPEC-sac-AT-REC-011:** Sistema DEVE validar limite de tamanho (configuravel, padrao: 10MB).

**SPEC-sac-AT-REC-012:** Mutacao JQEL DEVE usar `schema: "sac", mutate: "atendimento_mensagem", action: "insert"` com `tipo: "documento"` e `url_anexo`.

**SPEC-sac-AT-REC-013:** Componente React DEVE ser `<DocumentUpload />`.

#### 3.3. Emojis e Reacoes

**SPEC-sac-AT-REC-014:** Sistema DEVE fornecer seletor de emojis.

**SPEC-sac-AT-REC-015:** Emojis DEVEM ser exibidos corretamente na conversa.

**SPEC-sac-AT-REC-016:** Sistema DEVE permitir reagir a mensagens do outro participante com emoji rapido.

**SPEC-sac-AT-REC-017:** Reacao DEVE aparecer anexada a mensagem original.

**SPEC-sac-AT-REC-018:** Sistema DEVE publicar evento SSE de reacao:
```json
{
  "type": "chat-reaction",
  "target": "chat:<atendimento_id>",
  "data": {
    "message_id": "<id>",
    "emoji": "<emoji>",
    "user": "<usuario_id>"
  }
}
```

**SPEC-sac-AT-REC-019:** Componente React DEVE ser `<EmojiPicker />` e `<MessageReaction />`.

---

## 4. Gestao de Conversas (Cliente)

### Definicao

Funcionalidades de gerenciamento de conversas do lado do cliente.

### Requisitos

#### 4.1. Historico de Conversas

**SPEC-sac-AT-CON-001:** Cliente autenticado DEVE poder ver lista de conversas anteriores.

**SPEC-sac-AT-CON-002:** Lista DEVE exibir: data, agente, status (Finalizado).

**SPEC-sac-AT-CON-003:** Clicar em conversa DEVE abrir historico completo em modo leitura.

**SPEC-sac-AT-CON-004:** Sistema DEVE permitir busca de conversas por data ou palavra-chave.

**SPEC-sac-AT-CON-005:** Query JQEL DEVE usar `schema: "sac", select: "atendimento"` com filtro por `contato_id` e `status: "finalizado"`.

**SPEC-sac-AT-CON-006:** Componente React DEVE ser `<ChatHistory />` com lista paginada.

#### 4.2. Reabertura de Conversa

**SPEC-sac-AT-CON-007:** Sistema DEVE permitir continuar conversa sobre mesmo assunto.

**SPEC-sac-AT-CON-008:** Botao "Continuar Conversa" DEVE estar disponivel em chats finalizados.

**SPEC-sac-AT-CON-009:** Nova conversa DEVE ser criada com referencia ao chat anterior.

**SPEC-sac-AT-CON-010:** Agente DEVE ter acesso ao historico da conversa anterior.

**SPEC-sac-AT-CON-011:** Contexto DEVE ser preservado.

**SPEC-sac-AT-CON-012:** Mutacao JQEL DEVE usar `schema: "sac", mutate: "atendimento", action: "insert"` com `atendimento_anterior_id`.

#### 4.3. Encerramento pelo Cliente

**SPEC-sac-AT-CON-013:** Cliente DEVE poder encerrar conversa a qualquer momento.

**SPEC-sac-AT-CON-014:** Opcao "Encerrar Conversa" DEVE estar visivel.

**SPEC-sac-AT-CON-015:** Sistema DEVE solicitar confirmacao antes de encerrar.

**SPEC-sac-AT-CON-016:** Sistema DEVE enviar mensagem de despedida automatica.

**SPEC-sac-AT-CON-017:** Sistema DEVE solicitar avaliacao apos encerramento.

**SPEC-sac-AT-CON-018:** Mutacao JQEL DEVE atualizar `status: "finalizado"` e `data_finalizacao`.

**SPEC-sac-AT-CON-019:** Sistema DEVE publicar evento SSE de finalizacao:
```json
{
  "type": "chat-ended",
  "target": "chat:<atendimento_id>",
  "data": {
    "ended_by": "client",
    "timestamp": "<iso8601>"
  }
}
```

---

## 5. Gestao de Atendimentos (Agente)

### Definicao

Funcionalidades de gerenciamento de atendimentos do lado do agente.

### Requisitos

#### 5.1. Fila de Atendimentos

**SPEC-sac-AT-ATE-001:** Sistema DEVE exibir lista de clientes aguardando atendimento.

**SPEC-sac-AT-ATE-002:** Fila DEVE mostrar: nome/identificacao, tempo de espera, mensagem inicial.

**SPEC-sac-AT-ATE-003:** Fila DEVE ser ordenada por tempo de espera (mais antigo primeiro).

**SPEC-sac-AT-ATE-004:** Sistema DEVE exibir contador de pessoas na fila.

**SPEC-sac-AT-ATE-005:** Fila DEVE ser atualizada em tempo real via SSE.

**SPEC-sac-AT-ATE-006:** Query JQEL DEVE usar `schema: "sac", select: "atendimento"` com filtro `status: "aguardando"` e `departamento_id`.

**SPEC-sac-AT-ATE-007:** Componente React DEVE ser `<ChatQueue />` com atualizacao automatica.

#### 5.2. Aceitar Chat

**SPEC-sac-AT-ATE-008:** Agente DEVE poder aceitar cliente da fila.

**SPEC-sac-AT-ATE-009:** Botao "Aceitar" DEVE estar disponivel em cada chat na fila.

**SPEC-sac-AT-ATE-010:** Chat aceito DEVE abrir em nova aba/janela de conversa.

**SPEC-sac-AT-ATE-011:** Cliente DEVE ser notificado que foi conectado com agente.

**SPEC-sac-AT-ATE-012:** Status DEVE mudar para "Em Atendimento".

**SPEC-sac-AT-ATE-013:** Sistema DEVE registrar timestamp de inicio de atendimento.

**SPEC-sac-AT-ATE-014:** Mutacao JQEL DEVE atualizar `atendente_id`, `status: "em_atendimento"`, `data_inicio`.

**SPEC-sac-AT-ATE-015:** Sistema DEVE publicar evento SSE:
```json
{
  "type": "chat-accepted",
  "target": "chat:<atendimento_id>",
  "data": {
    "agent": "<nome>",
    "timestamp": "<iso8601>"
  }
}
```

#### 5.3. Multiplos Atendimentos

**SPEC-sac-AT-ATE-016:** Agente DEVE poder gerenciar multiplas conversas simultaneamente.

**SPEC-sac-AT-ATE-017:** Interface DEVE usar abas ou lista de conversas ativas.

**SPEC-sac-AT-ATE-018:** Agente DEVE poder alternar entre conversas facilmente.

**SPEC-sac-AT-ATE-019:** Sistema DEVE exibir contador de mensagens nao lidas por conversa.

**SPEC-sac-AT-ATE-020:** Sistema DEVE emitir notificacao sonora/visual quando nova mensagem chega.

**SPEC-sac-AT-ATE-021:** Sistema DEVE limitar conversas simultaneas (configuravel, padrao: 3-5).

**SPEC-sac-AT-ATE-022:** Componente React DEVE ser `<ChatTabs />` ou `<ActiveChats />`.

#### 5.4. Transferencia de Chat

**SPEC-sac-AT-ATE-023:** Agente DEVE poder transferir conversa para colega.

**SPEC-sac-AT-ATE-024:** Botao "Transferir" DEVE estar disponivel na conversa ativa.

**SPEC-sac-AT-ATE-025:** Dialog DEVE permitir selecao de agente disponivel ou departamento.

**SPEC-sac-AT-ATE-026:** Sistema DEVE enviar mensagem automatica ao cliente informando transferencia.

**SPEC-sac-AT-ATE-027:** Historico completo DEVE ser transferido para novo agente.

**SPEC-sac-AT-ATE-028:** Novo agente DEVE aceitar transferencia.

**SPEC-sac-AT-ATE-029:** Mutacao JQEL DEVE atualizar `atendente_id` e criar entrada em historico.

**SPEC-sac-AT-ATE-030:** Sistema DEVE publicar evento SSE de transferencia.

#### 5.5. Finalizacao de Atendimento

**SPEC-sac-AT-ATE-031:** Agente DEVE poder finalizar atendimento.

**SPEC-sac-AT-ATE-032:** Botao "Finalizar Atendimento" DEVE estar disponivel.

**SPEC-sac-AT-ATE-033:** Sistema DEVE enviar mensagem de despedida automatica ao cliente.

**SPEC-sac-AT-ATE-034:** Status DEVE mudar para "Finalizado".

**SPEC-sac-AT-ATE-035:** Sistema DEVE registrar timestamp de finalizacao.

**SPEC-sac-AT-ATE-036:** Sistema DEVE calcular duracao total (inicio ate finalizacao).

**SPEC-sac-AT-ATE-037:** Cliente DEVE receber solicitacao de avaliacao.

**SPEC-sac-AT-ATE-038:** Mutacao JQEL DEVE atualizar `status: "finalizado"`, `data_finalizacao`, `duracao_total`.

#### 5.6. Notas Internas

**SPEC-sac-AT-ATE-039:** Agente DEVE poder adicionar nota interna no chat.

**SPEC-sac-AT-ATE-040:** Campo de nota interna DEVE ser separado do campo de mensagem.

**SPEC-sac-AT-ATE-041:** Nota DEVE ser visivel apenas para agentes (NAO para cliente).

**SPEC-sac-AT-ATE-042:** Notas DEVEM aparecer no historico com indicacao "Interno".

**SPEC-sac-AT-ATE-043:** Mutacao JQEL DEVE usar `schema: "sac", mutate: "atendimento_mensagem", action: "insert"` com `tipo: "interno"`.

**SPEC-sac-AT-ATE-044:** Componente React DEVE ser `<InternalNote />`.

---

## 6. Informacoes Contextuais

### Definicao

Funcionalidades de exibicao de contexto e informacoes do visitante para o agente.

### Requisitos

#### 6.1. Dados do Visitante

**SPEC-sac-AT-CTX-001:** Sistema DEVE exibir painel lateral com informacoes do visitante.

**SPEC-sac-AT-CTX-002:** Painel DEVE mostrar: nome, email, localizacao (cidade/pais).

**SPEC-sac-AT-CTX-003:** Painel DEVE mostrar: navegador e dispositivo usado.

**SPEC-sac-AT-CTX-004:** Painel DEVE mostrar: pagina de origem (onde iniciou chat).

**SPEC-sac-AT-CTX-005:** Painel DEVE mostrar: referrer (de onde veio ao site).

**SPEC-sac-AT-CTX-006:** Painel DEVE mostrar: IP do visitante.

**SPEC-sac-AT-CTX-007:** Informacoes DEVEM ser coletadas no momento de inicio do chat.

**SPEC-sac-AT-CTX-008:** Componente React DEVE ser `<VisitorInfo />`.

#### 6.2. Historico de Interacoes

**SPEC-sac-AT-CTX-009:** Sistema DEVE exibir historico de tickets anteriores do cliente.

**SPEC-sac-AT-CTX-010:** Sistema DEVE exibir historico de chats anteriores.

**SPEC-sac-AT-CTX-011:** Cada interacao DEVE mostrar: data, assunto, status.

**SPEC-sac-AT-CTX-012:** Sistema DEVE fornecer link para ver detalhes completos.

**SPEC-sac-AT-CTX-013:** Query JQEL DEVE usar `schema: "sac"` com joins entre `atendimento` e `chamado` por `contato_id`.

**SPEC-sac-AT-CTX-014:** Componente React DEVE ser `<CustomerHistory />`.

#### 6.3. Navegacao em Tempo Real

**SPEC-sac-AT-CTX-015:** Sistema DEVE exibir URL atual que cliente esta navegando.

**SPEC-sac-AT-CTX-016:** Sistema DEVE exibir titulo da pagina.

**SPEC-sac-AT-CTX-017:** URL DEVE ser atualizada automaticamente se cliente mudar de pagina durante chat.

**SPEC-sac-AT-CTX-018:** Sistema DEVE publicar evento SSE de mudanca de pagina:
```json
{
  "type": "visitor-navigation",
  "target": "chat:<atendimento_id>",
  "data": {
    "url": "<url>",
    "title": "<titulo>",
    "timestamp": "<iso8601>"
  }
}
```

**SPEC-sac-AT-CTX-019:** Frontend do cliente DEVE enviar evento ao mudar de pagina.

**SPEC-sac-AT-CTX-020:** Componente React DEVE ser `<CurrentPage />` com auto-refresh.

---

## 7. Avaliacao de Atendimento

### Definicao

Funcionalidades de coleta e visualizacao de feedback dos clientes sobre qualidade do chat.

### Requisitos

#### 7.1. Solicitacao de Avaliacao

**SPEC-sac-AT-AVA-001:** Sistema DEVE solicitar avaliacao ao final do chat.

**SPEC-sac-AT-AVA-002:** Pergunta DEVE ser: "Como foi o atendimento?".

**SPEC-sac-AT-AVA-003:** Escala DEVE ser 1 a 5 estrelas OU faces (Ruim a Excelente).

**SPEC-sac-AT-AVA-004:** Sistema DEVE incluir campo opcional para comentario adicional.

**SPEC-sac-AT-AVA-005:** Avaliacao DEVE ser enviada anonimamente.

**SPEC-sac-AT-AVA-006:** Sistema DEVE exibir mensagem de agradecimento apos avaliar.

**SPEC-sac-AT-AVA-007:** Mutacao JQEL DEVE usar `schema: "sac", mutate: "atendimento", action: "update"` atualizando `nota_satisfacao` e `comentario_satisfacao`.

**SPEC-sac-AT-AVA-008:** Componente React DEVE ser `<ChatFeedback />` exibido apos finalizacao.

#### 7.2. Visualizacao de Avaliacoes

**SPEC-sac-AT-AVA-009:** Agente DEVE poder ver avaliacoes recebidas.

**SPEC-sac-AT-AVA-010:** Dashboard pessoal DEVE exibir nota media de satisfacao.

**SPEC-sac-AT-AVA-011:** Sistema DEVE listar comentarios dos clientes.

**SPEC-sac-AT-AVA-012:** Sistema DEVE permitir filtro por periodo (semana, mes).

**SPEC-sac-AT-AVA-013:** Sistema DEVE exibir comparacao com media da equipe.

**SPEC-sac-AT-AVA-014:** Query JQEL DEVE usar `schema: "sac", select: "atendimento"` com filtro por `atendente_id` e agregacao de `nota_satisfacao`.

**SPEC-sac-AT-AVA-015:** Componente React DEVE ser `<AgentChatFeedback />`.

---

## 8. Protocolo de Comunicacao Real-Time

### Definicao

Especificacao do protocolo de eventos SSE para comunicacao em tempo real.

### Requisitos

#### 8.1. Conexao SSE

**SPEC-sac-AT-SSE-001:** Frontend DEVE estabelecer conexao SSE com `/api/events/stream`.

**SPEC-sac-AT-SSE-002:** Conexao DEVE incluir autenticacao via JWT em header.

**SPEC-sac-AT-SSE-003:** Backend DEVE registrar cliente em canal Redis especifico do chat.

**SPEC-sac-AT-SSE-004:** Conexao DEVE ter auto-reconnect em caso de falha.

**SPEC-sac-AT-SSE-005:** Frontend DEVE escutar multiplos tipos de eventos:
- `chat-message` - Nova mensagem
- `chat-typing` - Indicador de digitacao
- `chat-read` - Mensagem lida
- `chat-accepted` - Chat aceito por agente
- `chat-ended` - Chat finalizado
- `chat-reaction` - Reacao a mensagem
- `visitor-navigation` - Cliente mudou de pagina

#### 8.2. Estrutura de Eventos

**SPEC-sac-AT-SSE-006:** Eventos DEVEM seguir estrutura padrao:
```json
{
  "type": "<tipo_evento>",
  "target": "chat:<atendimento_id>",
  "data": {
    // payload especifico do evento
  },
  "timestamp": "<iso8601>"
}
```

**SPEC-sac-AT-SSE-007:** Campo `type` DEVE identificar tipo de evento.

**SPEC-sac-AT-SSE-008:** Campo `target` DEVE identificar chat alvo.

**SPEC-sac-AT-SSE-009:** Campo `data` DEVE conter payload minimo (apenas IDs e metadados).

**SPEC-sac-AT-SSE-010:** Dados completos DEVEM ser buscados via JQEL apos receber evento.

#### 8.3. Canais Redis

**SPEC-sac-AT-SSE-011:** Backend DEVE publicar eventos em canal `sac:chat:<atendimento_id>`.

**SPEC-sac-AT-SSE-012:** Backend DEVE se inscrever em canais de todos os chats ativos do agente.

**SPEC-sac-AT-SSE-013:** Evento de novo chat na fila DEVE ser publicado em `sac:chat:queue:<departamento_id>`.

**SPEC-sac-AT-SSE-014:** Mensagens DEVEM trafegar apenas metadados via Redis, nao conteudo completo.

---

## 9. Componentes React

### Definicao

Especificacao dos principais componentes React que compoem a interface do modulo atendimento.

### Requisitos

**SPEC-sac-AT-UI-001:** Modulo DEVE exportar componentes principais:
- `<ChatWidget />` - Widget de chat para clientes
- `<PreChatForm />` - Formulario pre-chat
- `<ChatWindow />` - Janela de conversa
- `<MessageList />` - Lista de mensagens
- `<MessageInput />` - Campo de entrada de mensagem
- `<ChatQueue />` - Fila de atendimentos (agente)
- `<ActiveChats />` - Conversas ativas (agente)

**SPEC-sac-AT-UI-002:** Modulo DEVE exportar componentes de mensagem:
- `<MessageBubble />` - Balao de mensagem
- `<TypingIndicator />` - Indicador de digitacao
- `<MessageReaction />` - Reacao a mensagem
- `<ImageUpload />` - Upload de imagem
- `<DocumentUpload />` - Upload de documento
- `<EmojiPicker />` - Seletor de emojis

**SPEC-sac-AT-UI-003:** Modulo DEVE exportar componentes de contexto:
- `<VisitorInfo />` - Informacoes do visitante
- `<CustomerHistory />` - Historico de interacoes
- `<CurrentPage />` - Pagina atual do visitante

**SPEC-sac-AT-UI-004:** Modulo DEVE exportar componentes de gestao:
- `<ChatHistory />` - Historico de conversas
- `<InternalNote />` - Nota interna
- `<TransferChatDialog />` - Transferencia de chat
- `<ChatFeedback />` - Avaliacao de atendimento
- `<AgentChatFeedback />` - Dashboard de avaliacoes

**SPEC-sac-AT-UI-005:** Todos os componentes DEVEM usar shadcn/ui como base.

**SPEC-sac-AT-UI-006:** Todos os componentes DEVEM suportar tema light/dark.

**SPEC-sac-AT-UI-007:** Todos os componentes DEVEM ser responsivos.

**SPEC-sac-AT-UI-008:** Widget de chat DEVE ser posicionado fixo no canto inferior direito.

**SPEC-sac-AT-UI-009:** Widget DEVE ser minimizavel/expansivel.

---

## 10. Queries JQEL

### Definicao

Especificacao das queries JQEL necessarias para acesso a dados do modulo atendimento.

### Requisitos

**SPEC-sac-AT-JQEL-001:** Sistema DEVE usar schema "sac" para todas as queries de chat.

**SPEC-sac-AT-JQEL-002:** Query de fila DEVE incluir:
```json
{
  "schema": "sac",
  "select": "atendimento",
  "where": {
    "status": { "$eq": "aguardando" },
    "departamento_id": { "$eq": "<dept_id>" }
  },
  "options": {
    "orderBy": [{ "field": "data_criacao", "direction": "asc" }],
    "limit": 50
  },
  "output": ["atendimento_id", "nome_visitante", "email", "mensagem_inicial", "data_criacao", "posicao_fila"]
}
```

**SPEC-sac-AT-JQEL-003:** Query de mensagens DEVE incluir:
```json
{
  "schema": "sac",
  "select": "atendimento_mensagem",
  "where": {
    "atendimento_id": { "$eq": "<id>" }
  },
  "options": {
    "orderBy": [{ "field": "data_hora", "direction": "asc" }],
    "limit": 100
  },
  "joins": [
    { "entity": "usuario", "on": "usuario_id" }
  ]
}
```

**SPEC-sac-AT-JQEL-004:** Query de historico de conversas DEVE incluir:
```json
{
  "schema": "sac",
  "select": "atendimento",
  "where": {
    "contato_id": { "$eq": "<id>" },
    "status": { "$eq": "finalizado" }
  },
  "options": {
    "orderBy": [{ "field": "data_finalizacao", "direction": "desc" }],
    "limit": 20
  },
  "joins": [
    { "entity": "atendente", "on": "atendente_id" }
  ]
}
```

**SPEC-sac-AT-JQEL-005:** Mutacao de criacao de chat DEVE incluir:
```json
{
  "schema": "sac",
  "mutate": "atendimento",
  "action": "insert",
  "values": {
    "nome_visitante": "<nome>",
    "email": "<email>",
    "mensagem_inicial": "<texto>",
    "status": "aguardando",
    "data_criacao": "<timestamp>",
    "departamento_id": "<id>",
    "tipo": "anonimo"
  }
}
```

**SPEC-sac-AT-JQEL-006:** Mutacao de envio de mensagem DEVE incluir:
```json
{
  "schema": "sac",
  "mutate": "atendimento_mensagem",
  "action": "insert",
  "values": {
    "atendimento_id": "<id>",
    "usuario_id": "<id>",
    "texto": "<conteudo>",
    "tipo": "texto",
    "data_hora": "<timestamp>"
  }
}
```

---

## 11. Rotas do Modulo

### Definicao

Especificacao das rotas exportadas pelo modulo atendimento.

### Requisitos

**SPEC-sac-AT-ROU-001:** Modulo DEVE exportar rotas principais:
- `/` - Dashboard de chats (agente)
- `/queue` - Fila de atendimentos
- `/active` - Chats ativos do agente
- `/chat/:id` - Janela de conversa especifica
- `/history` - Historico de conversas
- `/feedback` - Avaliacoes recebidas

**SPEC-sac-AT-ROU-002:** Todas as rotas DEVEM ser relativas (portal prefix injetado automaticamente).

**SPEC-sac-AT-ROU-003:** Rotas DEVEM usar lazy-loading via `React.lazy()`.

**SPEC-sac-AT-ROU-004:** Rotas DEVEM validar autenticacao via `<ProtectedRoute />`.

**SPEC-sac-AT-ROU-005:** Rotas DEVEM validar permissoes via RBAC (papel de agente minimo).

**SPEC-sac-AT-ROU-006:** Widget de chat publico NAO DEVE requerer autenticacao.

---

## 12. Permissoes e RBAC

### Definicao

Especificacao de controle de acesso baseado em papeis para o modulo atendimento.

### Requisitos

**SPEC-sac-AT-RBAC-001:** Acesso ao modulo de agente DEVE requerer papel minimo: "Agente".

**SPEC-sac-AT-RBAC-002:** Widget de chat publico DEVE ser acessivel sem autenticacao.

**SPEC-sac-AT-RBAC-003:** Agentes DEVEM ver apenas chats:
- Em fila de seus departamentos
- Atribuidos a eles
- Finalizados por eles

**SPEC-sac-AT-RBAC-004:** Supervisores DEVEM ver todos os chats de seus departamentos.

**SPEC-sac-AT-RBAC-005:** Administradores DEVEM ver todos os chats do sistema.

**SPEC-sac-AT-RBAC-006:** Clientes autenticados DEVEM ver apenas seus proprios chats.

**SPEC-sac-AT-RBAC-007:** Validacao DEVE ocorrer no frontend (UX) e backend (seguranca).

**SPEC-sac-AT-RBAC-008:** Backend DEVE implementar RLS via JQEL.

---

## 13. Performance e Otimizacao

### Definicao

Requisitos de performance e otimizacao para garantir experiencia fluida em tempo real.

### Requisitos

**SPEC-sac-AT-PERF-001:** Mensagem DEVE ser entregue em menos de 1 segundo.

**SPEC-sac-AT-PERF-002:** Indicador de digitacao DEVE aparecer em menos de 500ms.

**SPEC-sac-AT-PERF-003:** Lista de mensagens DEVE usar virtualizacao para historicos longos (>100 mensagens).

**SPEC-sac-AT-PERF-004:** Imagens DEVEM ser lazy-loaded e otimizadas.

**SPEC-sac-AT-PERF-005:** Componentes DEVEM usar React.memo para evitar re-renders desnecessarios.

**SPEC-sac-AT-PERF-006:** SSE DEVE usar heartbeat a cada 30 segundos para manter conexao viva.

**SPEC-sac-AT-PERF-007:** Frontend DEVE implementar reconnection exponential backoff em caso de falha SSE.

**SPEC-sac-AT-PERF-008:** Queries JQEL DEVEM usar projection para reduzir payload.

**SPEC-sac-AT-PERF-009:** Modulo DEVE ser code-split em chunks separados via Vite.

---

## 14. Integracao com Backbone

### Definicao

Pontos de integracao com workflows n8n para processos automatizados.

### Requisitos

**SPEC-sac-AT-INT-001:** Finalizacao de chat DEVE disparar workflow n8n para envio de avaliacao.

**SPEC-sac-AT-INT-002:** Finalizacao de chat DEVE disparar workflow n8n para calculo de metricas (tempo de espera, duracao).

**SPEC-sac-AT-INT-003:** Chat pode ser convertido em ticket via workflow n8n ao finalizar.

**SPEC-sac-AT-INT-004:** Workflow DEVE copiar historico completo do chat para ticket gerado.

**SPEC-sac-AT-INT-005:** Anexos do chat DEVEM ser transferidos para ticket.

**SPEC-sac-AT-INT-006:** Workflows DEVEM ser invocados via eventos SSE ou webhooks HTTP.

**SPEC-sac-AT-INT-007:** Backend DEVE publicar eventos em canal Redis `sac:chat:events`.

---

**Versao**: 1.0
**Data**: 2025-01-12
**Status**: Ativo
**Total de Requisitos**: 244
