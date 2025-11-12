---
id: exploracao-chat
title: Interface de Chat
estimatedTime: 5 min
objectives:
  - Explorar a interface de chat em detalhes
  - Conhecer os componentes da tela
  - Entender o layout responsivo
icon: 💬
---

# Interface de Chat 💬

Bem-vindo à **fase de Exploração**! Agora vamos conhecer em detalhes cada elemento da interface de chat do NIC.

## 🖥️ Layout da Tela

A interface de chat é dividida em **três áreas principais**:

### 1. Header (Topo)

No cabeçalho você encontra:

- **Logo NIC**: Clique para voltar à home
- **Navegação**: Links para Home, Chat e Admin
- **Alternador de Tema**: Botão para mudar entre claro/escuro
- **Barra de Progresso**: Indica seu avanço na jornada (apenas desktop)

### 2. Área de Mensagens (Centro)

O coração da aplicação:

- **Histórico de conversas**: Todas as mensagens ficam visíveis
- **Mensagens do usuário**: À direita, fundo azul
- **Mensagens da IA**: À esquerda, fundo cinza
- **Botão copiar**: Em cada mensagem para copiar texto
- **Auto-scroll**: Rola automaticamente para última mensagem

### 3. Área de Input (Rodapé)

Controles de interação:

- **Campo de texto**: Digite sua mensagem aqui
- **Botão enviar**: Ícone de envio (ou pressione Enter)
- **Botão cancelar**: Aparece durante streaming para interromper
- **Contador de caracteres**: (opcional, se implementado)

## 📱 Layout Responsivo

A interface se adapta ao tamanho da tela:

### Desktop (> 768px)

- Layout completo com sidebar de sugestões
- Barra de progresso visível
- FAB stack no canto inferior direito
- Área de mensagens ampla

### Mobile (< 768px)

- Layout vertical otimizado
- Sidebar de sugestões oculta
- FAB stack oculto (economia de espaço)
- Campo de input fixo na parte inferior

## 🎨 Elementos Visuais

### Mensagens com Markdown

Todas as mensagens são renderizadas com suporte a:

- **Headings**: # Título, ## Subtítulo
- **Listas**: Numeradas e com marcadores
- **Links**: Clicáveis e coloridos
- **Código**: Inline `código` e blocos
- **Tabelas**: Formatadas automaticamente
- **Imagens**: Renderizadas inline

### Indicadores de Estado

- **Loading spinner**: Enquanto aguarda resposta
- **Typing indicator**: "..." durante streaming
- **Success feedback**: ✓ ao copiar mensagem
- **Error messages**: ⚠️ se algo der errado

## 🎯 Sidebar de Sugestões (Desktop)

No lado direito da tela (desktop):

- **Perguntas sugeridas**: Lista de tópicos prontos
- **Clique para enviar**: Pergunta é enviada automaticamente
- **Atualiza dinamicamente**: Conforme o contexto da conversa
- **Inspiração rápida**: Para quando não souber o que perguntar

## 🔄 Interações Disponíveis

### Enviar Mensagem

1. Digite no campo de texto
2. Pressione **Enter** ou clique em **Enviar**
3. Mensagem aparece à direita
4. Aguarde a resposta com streaming

### Copiar Mensagem

1. Passe o mouse sobre qualquer mensagem
2. Clique no ícone 📋
3. Texto copiado para área de transferência
4. Feedback visual "✓ Copiado!"

### Cancelar Resposta

1. Durante o streaming, botão **Cancelar** aparece
2. Clique para interromper geração
3. Texto parcial é mantido
4. Você pode enviar nova mensagem

### Scroll Manual

- Role para cima para ver histórico antigo
- Auto-scroll é pausado durante leitura
- Retoma ao enviar nova mensagem

## 💡 Dicas de Navegação

💡 **Atalho de teclado**: Pressione **Enter** para enviar (Shift+Enter para nova linha).

💡 **Scroll inteligente**: O chat mantém sua posição se você estiver lendo mensagens antigas.

💡 **Foco automático**: Após enviar mensagem, o cursor volta automaticamente para o campo de input.

💡 **Persistência**: Mesmo se você fechar a aba, o histórico fica salvo no navegador.

## 🎨 Customização Visual

### Tema Claro
- Fundo branco limpo
- Texto escuro para legibilidade
- Acentos em azul (NIC accent light)

### Tema Escuro
- Fundo escuro (#181818)
- Texto claro para conforto visual
- Acentos em azul ciano (#5FBCD3)

## Próximos passos

Agora que você conhece a interface, vá para **Primeira Conversa** e experimente enviar sua primeira mensagem!

---

**Tempo estimado**: 5 minutos
**Pré-requisitos**: Descoberta - CTA
**Fase**: Exploração (25-50%)
