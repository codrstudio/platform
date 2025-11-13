# Atendimento Module - User Stories

Historias de usuario para o modulo atendimento (interface de chat em tempo real para clientes e agentes).

---

## 1. Iniciacao de Conversa

### US-AT-001: Iniciar Chat como Visitante Anonimo

> Como visitante do site,
> Quero iniciar conversa com suporte sem criar conta,
> Para tirar duvida rapidamente.

**Criterios de Aceitacao**:
- Widget de chat visivel e acessivel em todas as paginas
- Botao "Iniciar Conversa" sempre disponivel
- Formulario pre-chat solicita: nome, email (opcional), mensagem inicial
- Chat iniciado sem necessidade de cadastro ou login
- Visitante entra na fila de atendimento automaticamente
- Mensagem de aguardo exibida enquanto espera agente

---

### US-AT-002: Iniciar Chat como Cliente Autenticado

> Como cliente com conta no sistema,
> Quero iniciar chat ja identificado,
> Para nao precisar informar meus dados novamente.

**Criterios de Aceitacao**:
- Se usuario esta logado, formulario pre-chat nao e necessario
- Sistema identifica cliente automaticamente
- Historico de conversas anteriores acessivel
- Contexto do cliente (tickets anteriores, compras) disponivel para agente
- Chat iniciado diretamente na fila de atendimento

---

### US-AT-003: Ver Posicao na Fila de Espera

> Como visitante,
> Quero saber minha posicao na fila,
> Para ter expectativa de quanto tempo vou esperar.

**Criterios de Aceitacao**:
- Mensagem mostra posicao na fila (ex: "Voce e o 3o na fila")
- Tempo estimado de espera exibido se disponivel
- Posicao atualizada em tempo real conforme fila anda
- Opcao de deixar mensagem se tempo de espera muito longo

---

## 2. Troca de Mensagens

### US-AT-004: Enviar Mensagem

> Como cliente em atendimento,
> Quero digitar e enviar mensagens,
> Para comunicar meu problema ao agente.

**Criterios de Aceitacao**:
- Campo de texto para digitar mensagem
- Envio com tecla Enter ou botao "Enviar"
- Mensagem aparece instantaneamente na interface
- Indicador visual de mensagem enviada
- Suporte a emojis no texto

---

### US-AT-005: Receber Mensagem do Agente

> Como cliente em atendimento,
> Quero receber mensagens do agente em tempo real,
> Para acompanhar resposta instantaneamente.

**Criterios de Aceitacao**:
- Mensagens do agente aparecem em menos de 1 segundo
- Diferenciacao visual entre mensagens minhas e do agente
- Som ou notificacao quando nova mensagem chega
- Scroll automatico para ultima mensagem

---

### US-AT-006: Ver Indicador de Digitacao

> Como cliente em atendimento,
> Quero ver quando agente esta digitando,
> Para saber que ele esta respondendo.

**Criterios de Aceitacao**:
- Indicador "Agente digitando..." aparece quando agente escreve
- Indicador desaparece quando agente para de digitar
- Indicador desaparece quando agente envia mensagem

---

### US-AT-007: Ver Status de Leitura da Mensagem

> Como cliente em atendimento,
> Quero saber se agente viu minha mensagem,
> Para ter certeza que foi recebida.

**Criterios de Aceitacao**:
- Marcador de "Enviada" quando mensagem sai
- Marcador de "Lida" quando agente visualiza
- Marcadores visiveis nas mensagens

---

## 3. Recursos de Comunicacao

### US-AT-008: Enviar Imagem no Chat

> Como cliente em atendimento,
> Quero enviar print de tela,
> Para mostrar problema visualmente ao agente.

**Criterios de Aceitacao**:
- Botao de anexar imagem (icone clipe ou camera)
- Upload de imagens (PNG, JPG, GIF)
- Preview da imagem antes de enviar
- Imagem exibida inline na conversa
- Limite de tamanho (ex: 5MB por imagem)

---

### US-AT-009: Enviar Documento no Chat

> Como cliente em atendimento,
> Quero enviar documento (PDF, Word),
> Para compartilhar contrato ou documento relevante.

**Criterios de Aceitacao**:
- Upload de documentos (PDF, DOCX, TXT)
- Nome do arquivo exibido na conversa
- Download disponivel para agente
- Limite de tamanho (ex: 10MB por arquivo)

---

### US-AT-010: Usar Emojis e Reacoes

> Como cliente em atendimento,
> Quero usar emojis nas mensagens,
> Para expressar emocao ou reagir a mensagens.

**Criterios de Aceitacao**:
- Seletor de emojis disponivel
- Emojis exibidos corretamente na conversa
- Opcao de reagir a mensagens do agente com emoji rapido

---

## 4. Gestao de Conversas (Cliente)

### US-AT-011: Ver Historico de Conversas Anteriores

> Como cliente autenticado,
> Quero ver minhas conversas passadas,
> Para retomar contexto de atendimentos anteriores.

**Criterios de Aceitacao**:
- Portal do cliente mostra lista de chats finalizados
- Cada conversa mostra: data, agente, status (Finalizado)
- Clicar em conversa abre historico completo em modo leitura
- Busca de conversas por data ou palavra-chave

---

### US-AT-012: Reabrir Conversa Anterior

> Como cliente autenticado,
> Quero continuar conversa sobre mesmo assunto,
> Para nao precisar explicar tudo novamente.

**Criterios de Aceitacao**:
- Botao "Continuar Conversa" em chats finalizados
- Nova conversa criada com referencia ao chat anterior
- Agente tem acesso ao historico da conversa anterior
- Contexto preservado

---

### US-AT-013: Encerrar Conversa

> Como cliente em atendimento,
> Quero encerrar conversa quando problema resolvido,
> Para liberar atendimento.

**Criterios de Aceitacao**:
- Opcao "Encerrar Conversa" disponivel
- Confirmacao antes de encerrar
- Mensagem de despedida automatica
- Solicitacao de avaliacao apos encerramento

---

## 5. Gestao de Atendimentos (Agente)

### US-AT-014: Ver Fila de Atendimentos Aguardando

> Como agente de chat,
> Quero ver lista de clientes esperando,
> Para decidir qual atender primeiro.

**Criterios de Aceitacao**:
- Fila mostra: nome/identificacao, tempo de espera, mensagem inicial
- Ordenacao por tempo de espera (mais antigo primeiro)
- Contador de pessoas na fila
- Atualizacao em tempo real

---

### US-AT-015: Aceitar Chat da Fila

> Como agente de chat,
> Quero aceitar cliente da fila,
> Para iniciar atendimento.

**Criterios de Aceitacao**:
- Botao "Aceitar" em cada chat na fila
- Chat aceito abre em nova aba/janela de conversa
- Cliente notificado que foi conectado com agente
- Status muda para "Em Atendimento"
- Timestamp de inicio de atendimento registrado

---

### US-AT-016: Atender Multiplos Clientes Simultaneamente

> Como agente de chat,
> Quero gerenciar varias conversas ao mesmo tempo,
> Para maximizar produtividade.

**Criterios de Aceitacao**:
- Interface com abas ou lista de conversas ativas
- Alternar entre conversas facilmente
- Contador de mensagens nao lidas por conversa
- Notificacao sonora/visual quando nova mensagem chega
- Limite configuravel de conversas simultaneas (ex: 3-5)

---

### US-AT-017: Transferir Chat para Outro Agente

> Como agente de chat,
> Quero transferir conversa para colega especializado,
> Para garantir melhor atendimento ao cliente.

**Criterios de Aceitacao**:
- Botao "Transferir" na conversa ativa
- Selecao de agente disponivel ou departamento
- Mensagem automatica ao cliente informando transferencia
- Historico completo transferido para novo agente
- Novo agente aceita transferencia

---

### US-AT-018: Finalizar Atendimento

> Como agente de chat,
> Quero encerrar conversa quando problema resolvido,
> Para liberar capacidade e atender proximo cliente.

**Criterios de Aceitacao**:
- Botao "Finalizar Atendimento"
- Mensagem de despedida automatica enviada ao cliente
- Status muda para "Finalizado"
- Timestamp de finalizacao registrado
- Duracao total calculada e armazenada
- Cliente recebe solicitacao de avaliacao

---

### US-AT-019: Adicionar Nota Interna no Chat

> Como agente de chat,
> Quero adicionar nota interna,
> Para documentar informacoes importantes sem cliente ver.

**Criterios de Aceitacao**:
- Campo de nota interna separado do campo de mensagem
- Nota visivel apenas para agentes (nao para cliente)
- Notas aparecem no historico com indicacao "Interno"
- Util para documentar acoes tomadas ou informacoes relevantes

---

## 6. Informacoes Contextuais

### US-AT-020: Ver Dados do Visitante

> Como agente de chat,
> Quero ver informacoes sobre quem estou atendendo,
> Para personalizar atendimento.

**Criterios de Aceitacao**:
- Painel lateral mostra: nome, email, localizacao (cidade/pais)
- Navegador e dispositivo usado
- Pagina de origem (onde iniciou chat)
- Referrer (de onde veio ao site)
- IP do visitante

---

### US-AT-021: Ver Historico de Interacoes do Cliente

> Como agente de chat,
> Quero ver historico de tickets e chats anteriores,
> Para entender contexto e evitar perguntas repetidas.

**Criterios de Aceitacao**:
- Lista de tickets anteriores do cliente
- Lista de chats anteriores
- Resumo de cada interacao (data, assunto, status)
- Link para ver detalhes completos

---

### US-AT-022: Ver Pagina que Cliente Esta Navegando

> Como agente de chat,
> Quero saber em que pagina cliente esta,
> Para contextualizar duvida e oferecer ajuda especifica.

**Criterios de Aceitacao**:
- URL atual do cliente exibida em tempo real
- Titulo da pagina mostrado
- Atualizacao automatica se cliente mudar de pagina durante chat

---

## 7. Avaliacao de Atendimento

### US-AT-023: Avaliar Atendimento Recebido

> Como cliente,
> Quero avaliar qualidade do atendimento,
> Para ajudar empresa a melhorar servico.

**Criterios de Aceitacao**:
- Ao final do chat, pergunta: "Como foi o atendimento?"
- Escala de 1 a 5 estrelas ou faces (Ruim a Excelente)
- Campo opcional para comentario adicional
- Avaliacao enviada anonimamente
- Mensagem de agradecimento apos avaliar

---

### US-AT-024: Ver Avaliacoes que Recebi

> Como agente de chat,
> Quero ver minhas avaliacoes,
> Para entender qualidade do meu atendimento.

**Criterios de Aceitacao**:
- Dashboard pessoal com avaliacoes recebidas
- Nota media de satisfacao
- Comentarios dos clientes
- Filtro por periodo (semana, mes)
- Comparacao com media da equipe

---

**Total**: 24 historias de usuario para o modulo atendimento
