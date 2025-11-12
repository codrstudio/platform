---
id: maestria-widget
title: Widget de Chat
estimatedTime: 6 min
objectives:
  - Conhecer o widget flutuante do NIC
  - Entender integração em outras páginas
  - Aprender a customizar aparência
icon: 🎨
---

# Widget de Chat 🎨

Bem-vindo à **fase de Maestria**! Agora você vai conhecer recursos avançados do NIC, começando pelo widget flutuante.

## 🎯 O que é o Widget?

O widget é uma **versão mini** do NIC Chat que pode ser incorporada em qualquer página web:

- Botão flutuante no canto da tela (FAB - Floating Action Button)
- Clique para expandir chat completo
- Minimiza de volta ao botão
- Mantém estado da conversa

## 🎨 Componentes do Widget

### 1. FAB (Botão Flutuante)

**Características:**
- Sempre visível no canto inferior direito
- Ícone personaliz ável (chat, ajuda, suporte)
- Badge de notificação (mensagens não lidas)
- Animação sutil de hover
- Acessível via teclado (Tab + Enter)

**Aparência:**
```
┌─────┐
│ 💬  │  ← Botão circular
└─────┘
  ^
  Badge: 3 (mensagens não lidas)
```

### 2. Chat Expandido

**Layout:**
- Painel flutuante sobre conteúdo
- 400px × 600px (desktop)
- Full-screen (mobile)
- Header com título e fechar
- Área de mensagens scrollável
- Input fixo no rodapé

**Exemplo:**
```
┌────────────────────────────┐
│ NIC Chat          [_][X]   │ ← Header
├────────────────────────────┤
│ Olá! Como posso...         │
│                            │ ← Mensagens
│ [Você] Preciso de ajuda    │
│                            │
├────────────────────────────┤
│ Digite sua mensagem...  [→]│ ← Input
└────────────────────────────┘
```

### 3. FloatingActionStack

**O que é:** Pilha de FABs que expande no hover

**Estrutura:**
```
🗺️  ← FAB Índice (mostra % progresso)
💬  ← FAB Chat principal
⚙️  ← FAB reservado (futuro)
```

**Comportamento:**
- Colapsa quando mouse sai
- Expande suavemente no hover
- Cada FAB tem tooltip
- Badge de % na de índice

## 🔧 Integração do Widget

### Como Incorporar em Outras Páginas

#### Opção 1: iframe

```html
<iframe
  src="https://nic-chat.app/widget"
  width="100%"
  height="600px"
  frameborder="0"
></iframe>
```

#### Opção 2: Script Tag

```html
<script src="https://nic-chat.app/widget.js"></script>
<script>
  NICWidget.init({
    position: 'bottom-right',
    theme: 'auto',
    greeting: 'Olá! Como posso ajudar?'
  });
</script>
```

#### Opção 3: React Component

```jsx
import { NICWidget } from '@nic-chat/widget'

function App() {
  return (
    <>
      <YourContent />
      <NICWidget
        position="bottom-right"
        theme="dark"
        onMessage={(msg) => console.log(msg)}
      />
    </>
  )
}
```

## 🎨 Customização

### Configurações Disponíveis

```javascript
{
  // Aparência
  position: 'bottom-right', // 'bottom-left', 'top-right', 'top-left'
  theme: 'auto', // 'light', 'dark', 'auto'
  primaryColor: '#3D95DF', // Cor de destaque

  // Comportamento
  autoOpen: false, // Abrir automaticamente?
  autoOpenDelay: 5000, // Delay para auto-open (ms)
  persistConversation: true, // Salvar no localStorage?

  // Conteúdo
  greeting: 'Olá! Como posso ajudar?',
  placeholder: 'Digite sua mensagem...',
  title: 'NIC Chat',
  subtitle: 'Assistente Inteligente',

  // Avançado
  apiEndpoint: 'https://n8n.../webhook/chat',
  apiKey: 'sua-chave-api',
  sessionId: 'user-123',

  // Callbacks
  onOpen: () => console.log('Widget aberto'),
  onClose: () => console.log('Widget fechado'),
  onMessage: (msg) => console.log('Nova mensagem:', msg)
}
```

### Temas Predefinidos

#### Tema Light
```css
{
  background: '#FFFFFF',
  text: '#181818',
  primary: '#3D95DF',
  secondary: '#DEDEDE'
}
```

#### Tema Dark
```css
{
  background: '#181818',
  text: '#DEDEDE',
  primary: '#5FBCD3',
  secondary: '#212121'
}
```

#### Tema Auto
Detecta automaticamente preferência do sistema operacional.

## 📱 Responsividade

### Desktop (≥ 768px)

- Widget aparece como painel flutuante
- Dimensões fixas (400×600px)
- Posicionamento personalizável
- Pode sobrepor conteúdo

### Tablet (768px - 1024px)

- Widget ocupa 50% da largura
- Height fixo (600px)
- Posição fixa no canto

### Mobile (< 768px)

- Widget vira full-screen ao abrir
- Cobre tela inteira
- Botão de fechar no header
- Otimizado para toque

## ⚙️ Recursos Avançados

### 1. Persistência de Sessão

**Como funciona:**
- Conversas salvas em localStorage
- Restauradas ao reabrir widget
- Sincroniza entre abas
- Expira após X dias (configurável)

### 2. Notificações

**Tipos:**
- Badge numérico no FAB (mensagens não lidas)
- Notificação browser (se permitido)
- Som de notificação (opcional)
- Vibração mobile (se suportado)

### 3. Eventos Personalizados

```javascript
widget.on('message:sent', (msg) => {
  // Analytics, logging, etc
  ga('send', 'event', 'Widget', 'Message Sent')
})

widget.on('message:received', (msg) => {
  // Processar resposta da IA
  if (msg.content.includes('erro')) {
    alert('Algo deu errado!')
  }
})

widget.on('widget:opened', () => {
  // Marcar como lido, parar animações, etc
})
```

### 4. Pré-popular Contexto

```javascript
NICWidget.init({
  context: {
    user: { name: 'João', id: '123' },
    page: { url: window.location.href },
    session: { startedAt: Date.now() }
  }
})
```

A IA terá acesso a esses dados na conversa.

## 🎯 Casos de Uso

### 1. Suporte ao Cliente

Widget em site de produto para tirar dúvidas:
- Botão "Precisa de ajuda?"
- Atalhos para perguntas frequentes
- Integração com sistema de tickets

### 2. Onboarding Interativo

Guia passo a passo em dashboard:
- FAB aparece em cada etapa
- Dicas contextuais
- Pode enviar comandos (ex: "próximo passo")

### 3. Documentação Viva

Integrar em docs técnicos:
- Responde dúvidas sobre a página atual
- Sugere artigos relacionados
- Gera exemplos de código

### 4. Assistente Interno

Para ferramentas enterprise:
- Login com SSO
- Acesso a dados privados
- Ações personalizadas (criar ticket, agendar, etc)

## 💡 Melhores Práticas

💡 **Posicione estrategicamente**: Bottom-right é padrão, mas teste com seus usuários.

💡 **Não abra automaticamente**: Pode ser intrusivo. Use apenas se realmente agregar valor.

💡 **Mantenha acessível**: Garanta que funcione com leitores de tela e teclado.

💡 **Teste em mobile**: Widget pode cobrir botões importantes. Ajuste z-index se necessário.

## 🚨 Cuidados

❌ **Não abuse do auto-open**: Usuários odeiam popups agressivos
❌ **Cuidado com z-index**: Não cubra conteúdo crítico (menus, modais)
❌ **Performance**: Widget não deve travar o site principal
❌ **Privacidade**: Deixe claro que conversa pode ser gravada

## Próximos passos

Continue para **Sistema de Gamificação** e aprenda a criar jornadas personalizadas!

---

**Tempo estimado**: 6 minutos
**Pré-requisitos**: Domínio - Histórico
**Fase**: Maestria (75-100%)
