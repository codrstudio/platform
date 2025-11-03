# SPEC-module-chat.md

## Especificação: Módulo de Chat

### Escopo
Este documento especifica o módulo Chat, responsável por fornecer interfaces de conversação com agentes de IA e usuários humanos.

---

## 1. Definição

### Propósito
O módulo Chat fornece experiências completas de conversação, incluindo histórico de mensagens, renderização de conteúdo rico, upload de arquivos e exportação de conversas.

### Natureza
- **Tipo**: Módulo de Funcionalidade
- **Dependências**: Media Components, Export Components
- **Opcional**: Sim

---

## 2. Responsabilidades

### SPEC-CHAT-R-001
O módulo Chat DEVE fornecer interface de conversação em tempo real

### SPEC-CHAT-R-002
O módulo Chat DEVE manter histórico de conversação (contexto)

### SPEC-CHAT-R-003
O módulo Chat DEVE suportar múltiplas instâncias com diferentes agentes/configurações

### SPEC-CHAT-R-004
O módulo Chat NÃO DEVE implementar lógica de IA (responsabilidade do backbone/n8n)

---

## 3. Funcionalidades Obrigatórias

### Interface de Conversação

**SPEC-CHAT-F-001:** Toda instância DEVE fornecer:
- Campo de input para mensagens
- Área de exibição de mensagens
- Indicador de status (digitando, processando)

**SPEC-CHAT-F-002:** Interface DEVE suportar envio via:
- Enter (enviar)
- Shift+Enter (nova linha)
- Botão de envio

**SPEC-CHAT-F-003:** Campo de input DEVE crescer automaticamente até limite configurado

### Histórico de Mensagens

**SPEC-CHAT-F-004:** Chat DEVE manter histórico completo da conversação

**SPEC-CHAT-F-005:** Histórico DEVE incluir:
- Mensagens do usuário
- Mensagens do agente
- Timestamp de cada mensagem
- Metadata (status, erro, arquivos anexados)

**SPEC-CHAT-F-006:** Histórico DEVE ser persistido via JQEL

**SPEC-CHAT-F-007:** Ao reabrir chat, histórico DEVE ser carregado automaticamente

### Envio de Mensagens

**SPEC-CHAT-F-008:** Envio DEVE seguir este fluxo:
```
1. Usuário digita mensagem
2. Usuário envia (Enter ou botão)
3. Mensagem aparece na interface imediatamente
4. Requisição enviada ao backend via Canal de Agentes
5. Indicador "digitando" aparece
6. Resposta do agente é recebida
7. Resposta é renderizada na interface
8. Histórico é atualizado via JQEL
```

**SPEC-CHAT-F-009:** Durante processamento, input DEVE ser desabilitado

**SPEC-CHAT-F-010:** Se erro ocorrer, mensagem DEVE mostrar status de erro com opção "Tentar novamente"

### Renderização de Conteúdo

**SPEC-CHAT-F-011:** Chat DEVE renderizar mensagens em Markdown

**SPEC-CHAT-F-012:** Chat DEVE suportar syntax highlighting em blocos de código

**SPEC-CHAT-F-013:** Chat DEVE renderizar links como clicáveis

**SPEC-CHAT-F-014:** Chat DEVE sanitizar HTML para prevenir XSS

---

## 4. Funcionalidades Opcionais

### Upload de Arquivos

**SPEC-CHAT-O-001:** Instância PODE permitir upload de arquivos

**SPEC-CHAT-O-002:** Tipos aceitos DEVEM ser configuráveis por instância

**SPEC-CHAT-O-003:** Tamanho máximo DEVE ser configurável

**SPEC-CHAT-O-004:** Arquivos enviados DEVEM ser incluídos no contexto do agente

**SPEC-CHAT-O-005:** Preview de imagens DEVE ser exibido inline

### Exportação de Conversas

**SPEC-CHAT-O-006:** Instância PODE permitir exportar conversa

**SPEC-CHAT-O-007:** Formatos suportados PODEM incluir:
- PDF (via pdfmake)
- Markdown (texto)
- JSON (dados brutos)

**SPEC-CHAT-O-008:** Exportação DEVE incluir:
- Todas as mensagens
- Timestamps
- Arquivos anexados (como links ou embedados)

### Sugestões Rápidas

**SPEC-CHAT-O-009:** Instância PODE fornecer botões de sugestão

**SPEC-CHAT-O-010:** Sugestões DEVEM ser configuráveis por instância

**SPEC-CHAT-O-011:** Ao clicar em sugestão, mensagem é enviada automaticamente

### Busca no Histórico

**SPEC-CHAT-O-012:** Instância PODE fornecer busca em mensagens anteriores

**SPEC-CHAT-O-013:** Busca DEVE destacar termos encontrados

**SPEC-CHAT-O-014:** Busca DEVE permitir navegação entre resultados

### Múltiplas Conversas

**SPEC-CHAT-O-015:** Instância PODE suportar múltiplas conversas (threads)

**SPEC-CHAT-O-016:** Cada conversa DEVE ter ID único

**SPEC-CHAT-O-017:** Usuário PODE criar nova conversa

**SPEC-CHAT-O-018:** Usuário PODE alternar entre conversas existentes

**SPEC-CHAT-O-019:** Lista de conversas DEVE mostrar preview da última mensagem

### Mensagens de Sistema

**SPEC-CHAT-O-020:** Chat PODE exibir mensagens de sistema (não do usuário nem do agente)

**SPEC-CHAT-O-021:** Exemplos: "Conversa iniciada", "Agente foi atualizado", "Arquivo enviado"

---

## 5. Configuração de Instância

### Parâmetros Obrigatórios

**SPEC-CHAT-C-001:** Toda instância DEVE configurar:
```typescript
{
  agentId: string;              // ID do agente no backbone
  route: string;                // Rota da página de chat
}
```

### Parâmetros Opcionais

**SPEC-CHAT-C-002:** Instância PODE configurar:
```typescript
{
  title: string;                      // Título exibido
  description?: string;               // Descrição do chat
  placeholder?: string;               // Placeholder do input
  welcomeMessage?: string;            // Mensagem inicial do agente
  quickSuggestions?: string[];        // Sugestões rápidas
  allowFileUpload: boolean;           // Permitir upload
  acceptedFileTypes?: string[];       // Tipos aceitos (MIME)
  maxFileSize?: number;               // Tamanho máximo (bytes)
  enableExport: boolean;              // Permitir exportação
  exportFormats?: ('pdf'|'md'|'json')[]; // Formatos disponíveis
  enableSearch: boolean;              // Busca no histórico
  enableMultipleConversations: boolean; // Múltiplas threads
  maxInputLength?: number;            // Limite de caracteres
  autoGrowInput: boolean;             // Input cresce automaticamente
  maxInputRows?: number;              // Linhas máximas do input
  showTimestamps: boolean;            // Mostrar horário das mensagens
  showTypingIndicator: boolean;       // Mostrar "digitando..."
  persistHistory: boolean;            // Salvar histórico via JQEL
  contextWindow?: number;             // Quantas mensagens enviar como contexto
}
```

---

## 6. Integração com Canal de Agentes

### Envio de Mensagem

**SPEC-CHAT-I-001:** Envio DEVE usar Canal de Agentes:
```
POST /api/agent/:provider/:agentId
Body: {
  message: string;
  conversationId?: string;
  context: Message[];
  files?: File[];
}
```

**SPEC-CHAT-I-002:** `context` DEVE incluir N mensagens anteriores (configurável via `contextWindow`)

**SPEC-CHAT-I-003:** Se `conversationId` fornecido, backend PODE carregar contexto adicional

### Resposta do Agente

**SPEC-CHAT-I-004:** Resposta DEVE ter formato:
```typescript
{
  message: string;              // Resposta do agente (Markdown)
  conversationId: string;       // ID da conversa
  metadata?: {
    model?: string;             // Modelo usado
    tokens?: number;            // Tokens consumidos
    confidence?: number;        // Confiança da resposta
  }
}
```

### Streaming (Opcional)

**SPEC-CHAT-I-005:** Instância PODE suportar respostas em streaming

**SPEC-CHAT-I-006:** Streaming DEVE usar Server-Sent Events (SSE)

**SPEC-CHAT-I-007:** Cada chunk DEVE ser renderizado incrementalmente

---

## 7. Persistência de Histórico

### Estrutura de Dados

**SPEC-CHAT-P-001:** Mensagem DEVE ter estrutura:
```typescript
{
  id: string;
  conversationId: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    files?: File[];
    error?: boolean;
    retryable?: boolean;
  }
}
```

### Operações JQEL

**SPEC-CHAT-P-002:** Salvar mensagem:
```typescript
jqel.mutate({
  schema: 'chat',
  entity: 'message',
  action: 'insert',
  values: message
})
```

**SPEC-CHAT-P-003:** Carregar histórico:
```typescript
jqel.query({
  schema: 'chat',
  operation: 'select',
  entity: 'message',
  where: { conversationId },
  orderBy: ['timestamp', 'ASC'],
  limit: 100
})
```

**SPEC-CHAT-P-004:** Histórico DEVE ser paginado para conversas longas

---

## 8. Componentes Exportados

### Obrigatórios

**SPEC-CHAT-E-001:** Módulo DEVE exportar:
- `<ChatInterface />` - Interface completa de chat
- `<MessageList />` - Lista de mensagens
- `<MessageInput />` - Campo de entrada
- `<Message />` - Componente de mensagem individual

### Opcionais

**SPEC-CHAT-E-002:** Módulo PODE exportar:
- `<ConversationList />` - Lista de conversas
- `<FileUpload />` - Upload de arquivos
- `<QuickSuggestions />` - Botões de sugestão
- `<ExportButton />` - Botão de exportação
- `<SearchBar />` - Busca no histórico
- `useChat()` - Hook para gerenciar estado do chat

---

## 9. Estados da Interface

### Estados de Mensagem

**SPEC-CHAT-S-001:** Mensagem do usuário PODE ter estados:
- `sending` - Enviando ao servidor
- `sent` - Enviada com sucesso
- `error` - Erro no envio

**SPEC-CHAT-S-002:** Mensagem do agente PODE ter estados:
- `receiving` - Recebendo resposta
- `complete` - Resposta completa
- `error` - Erro na resposta

### Estados do Chat

**SPEC-CHAT-S-003:** Chat PODE ter estados:
- `idle` - Aguardando input do usuário
- `typing` - Usuário digitando
- `processing` - Aguardando resposta do agente
- `error` - Erro geral

---

## 10. Renderização de Conteúdo Rico

### Markdown

**SPEC-CHAT-R-001:** Chat DEVE usar Media Components para renderizar:
- Markdown formatado
- Syntax highlighting em código
- Tabelas
- Listas
- Links

### Arquivos Embedados

**SPEC-CHAT-R-002:** Chat PODE renderizar inline:
- Imagens (preview)
- PDFs (via react-pdf)
- Vídeos (via react-player)
- Áudio (via wavesurfer)

**SPEC-CHAT-R-003:** Arquivos grandes DEVEM ter link para download

### Diagramas

**SPEC-CHAT-R-004:** Chat PODE renderizar diagramas Mermaid inline

---

## 11. Acessibilidade

**SPEC-CHAT-A-001:** Interface DEVE ser navegável via teclado

**SPEC-CHAT-A-002:** Mensagens novas DEVEM ser anunciadas para screen readers

**SPEC-CHAT-A-003:** Botões DEVEM ter labels descritivos

**SPEC-CHAT-A-004:** Contraste DEVE seguir WCAG 2.1 AA

**SPEC-CHAT-A-005:** Auto-scroll DEVE respeitar preferências de movimento reduzido

---

## 12. Performance

**SPEC-CHAT-PERF-001:** Mensagens DEVEM usar virtualização para listas longas (react-virtual)

**SPEC-CHAT-PERF-002:** Imagens DEVEM ter lazy loading

**SPEC-CHAT-PERF-003:** Histórico DEVE ser carregado paginado (não tudo de uma vez)

**SPEC-CHAT-PERF-004:** Renderização de Markdown DEVE ser memoizada

---

## 13. Segurança

**SPEC-CHAT-SEC-001:** Conteúdo do usuário DEVE ser sanitizado antes de renderizar

**SPEC-CHAT-SEC-002:** Links DEVEM ter `rel="noopener noreferrer"`

**SPEC-CHAT-SEC-003:** Upload de arquivos DEVE validar tipo e tamanho no frontend

**SPEC-CHAT-SEC-004:** Arquivos DEVEM ser enviados via backend (não direto para storage)

---

## 14. Exemplos de Uso

### Instância Básica (Suporte Técnico)
```json
{
  "instanceId": "chat-suporte",
  "moduleId": "chat",
  "config": {
    "agentId": "agente-suporte-tecnico",
    "route": "/sac/chat/suporte",
    "title": "Suporte Técnico",
    "welcomeMessage": "Olá! Como posso ajudar você hoje?",
    "placeholder": "Digite sua dúvida...",
    "quickSuggestions": [
      "Como resetar minha senha?",
      "Problemas com login",
      "Erro ao acessar relatórios"
    ],
    "allowFileUpload": true,
    "acceptedFileTypes": ["image/*", "application/pdf"],
    "maxFileSize": 5242880,
    "enableExport": true,
    "persistHistory": true
  }
}
```

### Instância Avançada (Consulta de Documentação)
```json
{
  "instanceId": "chat-docs",
  "moduleId": "chat",
  "config": {
    "agentId": "agente-documentacao",
    "route": "/docs/chat",
    "title": "Consultar Documentação",
    "description": "Pergunte sobre nossa API e recursos",
    "welcomeMessage": "Pesquise em toda nossa documentação!",
    "enableMultipleConversations": true,
    "enableSearch": true,
    "contextWindow": 10,
    "showTimestamps": true,
    "allowFileUpload": false,
    "enableExport": true,
    "exportFormats": ["pdf", "md"]
  }
}
```

### Instância Simples (Chat de Vendas)
```json
{
  "instanceId": "chat-vendas",
  "moduleId": "chat",
  "config": {
    "agentId": "agente-vendas",
    "route": "/chat-vendas",
    "title": "Fale com Vendas",
    "welcomeMessage": "Olá! Vou te ajudar a encontrar o plano ideal.",
    "quickSuggestions": [
      "Quais são os planos?",
      "Preciso de demo",
      "Quero falar com humano"
    ],
    "persistHistory": false,
    "showTimestamps": false
  }
}
```

---

*Esta especificação define os requisitos do módulo Chat. Implementação técnica em documentação separada.*