# Chat Module - UI/UX Interfaces

## Overview

O módulo **Chat** fornece interfaces completas de conversação com agentes de IA, incluindo histórico de mensagens, renderização de conteúdo rico (Markdown), upload de arquivos, múltiplas conversas, busca no histórico e exportação.

**Características principais:**
- Interface de chat em tempo real com SSE
- Suporte a múltiplas conversas (threads)
- Renderização de Markdown com syntax highlighting
- Upload de arquivos (imagens, PDFs)
- Busca no histórico de mensagens
- Exportação para PDF/Markdown/JSON
- Sugestões rápidas (quick replies)
- Virtualização para longas conversas
- Acessibilidade WCAG 2.1 AA

**Dependências:**
- `app-components` (TipTap para Markdown, react-dropzone para upload)
- `auth` (proteção de rotas, permissões)

---

## 1. Interface Principal de Chat

### 1.1 Layout Desktop (≥1024px)

```
┌─────────────────────────────────────────────────────────────────────┐
│ Chat: Suporte Técnico                            [Search] [Export] │ ← Header
├─────────────────┬───────────────────────────────────────────────────┤
│ Conversas       │ Chat Principal                                    │
│                 │                                                   │
│ [+ Nova]        │ ┌───────────────────────────────────────────────┐ │
│                 │ │ System: Conversa iniciada em 10/11 14:30     │ │
│ ● Conversa 1    │ └───────────────────────────────────────────────┘ │
│   "Como resetar │ │                                                 │ │
│    minha senha?"│ │ ┌─────────────────────────────────────────────┐ │
│   15:30         │ │ │ User (você)                       15:30     │ │
│                 │ │ │ Como eu reseto minha senha?                 │ │
│   Conversa 2    │ │ └─────────────────────────────────────────────┘ │
│   "Erro ao      │ │                                                 │ │
│    fazer login" │ │ ┌─────────────────────────────────────────────┐ │
│   14:20         │ │ │ Agente                            15:30     │ │
│                 │ │ │ Para resetar sua senha:                     │ │
│   Conversa 3    │ │ │                                               │ │
│   "Problemas    │ │ │ 1. Acesse a tela de login                   │ │
│    com          │ │ │ 2. Clique em "Esqueci minha senha"          │ │
│    relatórios"  │ │ │ 3. Insira seu e-mail cadastrado             │ │
│   Ontem         │ │ │                                               │ │
│                 │ │ │ Você receberá um link por e-mail.           │ │
│                 │ │ └─────────────────────────────────────────────┘ │
│                 │ │                                                 │ │
│                 │ │ ┌─────────────────────────────────────────────┐ │
│                 │ │ │ User (você)                       15:31     │ │
│                 │ │ │ E se eu não receber o e-mail?               │ │
│                 │ │ └─────────────────────────────────────────────┘ │
│                 │ │                                                 │ │
│                 │ │ ┌─────────────────────────────────────────────┐ │
│                 │ │ │ Agente                   ⋯ digitando...     │ │
│                 │ │ └─────────────────────────────────────────────┘ │
│                 │ │                                                 │ │
│                 │ └─────────────────────────────────────────────────┘ │
│                 │                                                   │
│                 │ Sugestões rápidas:                                │
│                 │ [Como resetar senha?] [Problemas com login]       │
│                 │ [Erro ao acessar relatórios]                      │
│                 │                                                   │
│                 │ ┌─────────────────────────────────────────────┐   │
│                 │ │ Digite sua mensagem...                      │   │
│                 │ │                                             │   │
│                 │ └─────────────────────────────────────────────┘   │
│                 │ [📎] [😊]                          [Enviar ↑]     │
│                 │ ↑ Upload  ↑ Emoji                               │
├─────────────────┴───────────────────────────────────────────────────┤
│ 💡 Shift+Enter para nova linha • Enter para enviar                  │
└─────────────────────────────────────────────────────────────────────┘
     ↑ Sidebar                ↑ Message List           ↑ Input Area
    (240px)                    (flex-1)
```

**Características:**
- **Sidebar lateral (240px)**: Lista de conversas com preview da última mensagem
- **Área central (flex-1)**: Lista de mensagens com scroll automático
- **Input área (bottom)**: Campo de entrada com botões de ação
- **Header superior**: Título do chat, busca e exportação
- **Sugestões rápidas**: Botões com perguntas pré-definidas (opcional)
- **Status "digitando"**: Indicador visual enquanto agente processa resposta

### 1.2 Layout Mobile (<768px)

```
┌────────────────────────────────┐
│ ☰  Chat: Suporte      [⋮]     │ ← Header com menu hamburguer
├────────────────────────────────┤
│                                │
│ ┌────────────────────────────┐ │
│ │ System:                    │ │
│ │ Conversa iniciada          │ │
│ └────────────────────────────┘ │
│                                │
│ ┌────────────────────────────┐ │
│ │ Você             15:30     │ │
│ │ Como eu reseto minha senha?│ │
│ └────────────────────────────┘ │
│                                │
│ ┌────────────────────────────┐ │
│ │ Agente           15:30     │ │
│ │ Para resetar sua senha:    │ │
│ │                            │ │
│ │ 1. Acesse a tela de login  │ │
│ │ 2. Clique em "Esqueci...   │ │
│ │ 3. Insira seu e-mail       │ │
│ │                            │ │
│ │ Você receberá um link.     │ │
│ └────────────────────────────┘ │
│                                │
│ ⋯ digitando...                 │
│                                │
├────────────────────────────────┤
│ [Como resetar senha?]          │ ← Quick suggestions (scroll horizontal)
│ [Problemas com login]          │
├────────────────────────────────┤
│ ┌──────────────────────────┐   │
│ │ Digite sua mensagem...   │   │
│ └──────────────────────────┘   │
│ [📎]                  [Enviar] │
└────────────────────────────────┘

Sidebar (drawer):
┌────────────────────────────────┐
│ [X] Conversas                  │
│                                │
│ [+ Nova Conversa]              │
│                                │
│ ● Conversa 1                   │
│   "Como resetar minha senha?"  │
│   15:30                        │
│                                │
│   Conversa 2                   │
│   "Erro ao fazer login"        │
│   14:20                        │
│                                │
│   Conversa 3                   │
│   "Problemas com relatórios"   │
│   Ontem                        │
│                                │
│ ────────────────────────────   │
│ [🔍] Buscar conversas          │
│ [📥] Exportar conversa atual   │
└────────────────────────────────┘
```

**Características mobile:**
- **Header compacto**: Menu hamburguer para sidebar, menu de opções (⋮)
- **Sidebar como drawer**: Overlay lateral deslizante
- **Mensagens fullwidth**: Ocupam toda largura da tela
- **Quick suggestions**: Scroll horizontal em vez de wrap
- **Input fixo no bottom**: Sempre visível com altura mínima
- **Botões touch-friendly**: Min 44x44px para acessibilidade

### 1.3 Estados Visuais

#### 1.3.1 Estado Idle (Aguardando input)

```
┌─────────────────────────────────────────────┐
│ Chat Principal                              │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Agente                        15:45     │ │
│ │ Estou à disposição para ajudar!         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Sugestões:                                  │
│ [Como resetar senha?] [Falar com humano]    │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Digite sua mensagem...                  │ │ ← Cursor piscando
│ └─────────────────────────────────────────┘ │
│ [📎] [😊]                      [Enviar ↑]   │
└─────────────────────────────────────────────┘
```

#### 1.3.2 Estado Typing (Usuário digitando)

```
┌─────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────┐ │
│ │ Preciso de ajuda com                    │ │ ← Texto aparecendo
│ │ _                                       │ │
│ └─────────────────────────────────────────┘ │
│ [📎] [😊]                      [Enviar ↑]   │ ← Botão Enviar habilitado
│                                             │   (azul primário)
└─────────────────────────────────────────────┘
```

#### 1.3.3 Estado Sending (Enviando mensagem)

```
┌─────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────┐ │
│ │ Você                          15:46     │ │
│ │ Preciso de ajuda com relatórios         │ │
│ │                            [⏳] Enviando │ │ ← Indicador de envio
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │                                         │ │ ← Input desabilitado
│ └─────────────────────────────────────────┘ │
│ [📎] [😊]                      [Enviar ↑]   │ ← Botões desabilitados
└─────────────────────────────────────────────┘
```

#### 1.3.4 Estado Processing (Agente processando)

```
┌─────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────┐ │
│ │ Você                          15:46     │ │
│ │ Preciso de ajuda com relatórios         │ │
│ │                                   ✓ Sent│ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Agente                 ⋯ digitando...   │ │ ← Typing indicator
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │                                         │ │ ← Input ainda desabilitado
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

#### 1.3.5 Estado Error (Erro no envio)

```
┌─────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────┐ │
│ │ Você                          15:46     │ │
│ │ Preciso de ajuda com relatórios         │ │
│ │                                         │ │
│ │ ⚠️ Erro ao enviar mensagem              │ │ ← Mensagem de erro
│ │ [Tentar novamente]  [Cancelar]          │ │ ← Ações de recuperação
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Digite sua mensagem...                  │ │ ← Input reabilitado
│ └─────────────────────────────────────────┘ │
│ [📎] [😊]                      [Enviar ↑]   │
└─────────────────────────────────────────────┘
```

#### 1.3.6 Estado Loading History (Carregando histórico)

```
┌─────────────────────────────────────────────┐
│ Chat: Suporte Técnico                       │
├─────────────────────────────────────────────┤
│                                             │
│             ⏳ Carregando histórico...       │
│                                             │
│         [████████░░░░░░░░░░░░] 40%          │
│                                             │
└─────────────────────────────────────────────┘
```

#### 1.3.7 Estado Empty (Sem mensagens)

```
┌─────────────────────────────────────────────┐
│ Chat: Suporte Técnico                       │
├─────────────────────────────────────────────┤
│                                             │
│              💬                             │
│                                             │
│        Inicie uma conversa!                 │
│    Faça uma pergunta ou selecione uma      │
│         sugestão abaixo.                    │
│                                             │
│ Sugestões:                                  │
│ [Como resetar senha?] [Problemas login]     │
│ [Erro ao acessar relatórios]                │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Digite sua mensagem...                  │ │
│ └─────────────────────────────────────────┘ │
│ [📎] [😊]                      [Enviar ↑]   │
└─────────────────────────────────────────────┘
```

---

## 2. Componente Message (Mensagem Individual)

### 2.1 Mensagem do Usuário

```
┌─────────────────────────────────────────────┐
│                                             │
│                  ┌────────────────────────┐ │
│                  │ Você         15:30 ✓   │ │ ← Nome + timestamp + status
│                  │                        │ │
│                  │ Como eu reseto minha   │ │
│                  │ senha?                 │ │
│                  │                        │ │
│                  └────────────────────────┘ │
│                                     ↑ bg-primary-100
│                                       text-right
└─────────────────────────────────────────────┘
```

**Características:**
- **Alinhamento**: Direita
- **Background**: `bg-primary-100` (azul claro no light mode)
- **Borda arredondada**: `rounded-lg` com `rounded-tr-none` (seta visual)
- **Padding**: `p-3`
- **Status icons**:
  - `⏳` Enviando
  - `✓` Enviada
  - `✓✓` Lida (opcional)
  - `⚠️` Erro

### 2.2 Mensagem do Agente

```
┌─────────────────────────────────────────────┐
│ ┌──────────────────────────────────────┐    │
│ │ 🤖 Agente                    15:30   │    │ ← Avatar + nome + timestamp
│ │                                      │    │
│ │ Para resetar sua senha:              │    │
│ │                                      │    │
│ │ 1. Acesse a tela de login            │    │ ← Markdown formatado
│ │ 2. Clique em "Esqueci minha senha"   │    │
│ │ 3. Insira seu e-mail cadastrado      │    │
│ │                                      │    │
│ │ Você receberá um link por e-mail.    │    │
│ │                                      │    │
│ │ [👍 Útil] [👎 Não útil] [💬 Copiar]  │    │ ← Ações rápidas
│ └──────────────────────────────────────┘    │
│           ↑ bg-muted (cinza claro)          │
│             text-left                        │
└─────────────────────────────────────────────┘
```

**Características:**
- **Alinhamento**: Esquerda
- **Avatar**: Ícone ou imagem do agente (opcional)
- **Background**: `bg-muted` (cinza claro)
- **Borda arredondada**: `rounded-lg` com `rounded-tl-none`
- **Markdown**: Renderizado com syntax highlighting
- **Ações rápidas**: Feedback, copiar, compartilhar

### 2.3 Mensagem do Sistema

```
┌─────────────────────────────────────────────┐
│          ────────────────────               │
│          Conversa iniciada em               │
│          10 de Nov às 15:30                 │
│          ────────────────────               │
└─────────────────────────────────────────────┘
```

**Características:**
- **Alinhamento**: Centro
- **Estilo**: Texto pequeno, cinza, com linhas divisórias
- **Uso**: Timestamps, eventos do sistema ("Arquivo enviado", "Agente atualizado")

### 2.4 Mensagem com Arquivo Anexado

```
┌─────────────────────────────────────────────┐
│                  ┌────────────────────────┐ │
│                  │ Você         15:32     │ │
│                  │                        │ │
│                  │ Aqui está a captura:   │ │
│                  │                        │ │
│                  │ ┌──────────────────┐   │ │
│                  │ │  📷              │   │ │
│                  │ │  [Image Preview] │   │ │ ← Preview de imagem
│                  │ │  screenshot.png  │   │ │
│                  │ │  245 KB          │   │ │
│                  │ └──────────────────┘   │ │
│                  │                        │ │
│                  └────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Características:**
- **Preview inline**: Imagens mostram thumbnail clicável
- **Metadados**: Nome do arquivo + tamanho
- **Click**: Abre modal com imagem em tamanho real ou inicia download
- **Tipos suportados**: Imagens (preview), PDFs (ícone), outros (ícone genérico)

### 2.5 Mensagem com Código

```
┌─────────────────────────────────────────────┐
│ ┌──────────────────────────────────────┐    │
│ │ Agente                       15:35   │    │
│ │                                      │    │
│ │ Aqui está um exemplo em TypeScript:  │    │
│ │                                      │    │
│ │ ╭─────────────────────────────────╮  │    │
│ │ │ typescript         [Copiar]     │  │    │ ← Header com linguagem
│ │ ├─────────────────────────────────┤  │    │
│ │ │ function greet(name: string) {  │  │    │
│ │ │   return `Hello, ${name}!`;     │  │    │ ← Syntax highlighting
│ │ │ }                               │  │    │
│ │ ╰─────────────────────────────────╯  │    │
│ │                                      │    │
│ └──────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

**Características:**
- **Syntax highlighting**: Via Prism.js ou highlight.js
- **Botão Copiar**: Copia código para clipboard
- **Linguagem**: Detectada automaticamente ou especificada no Markdown
- **Scroll horizontal**: Para códigos longos

---

## 3. Lista de Conversas (Sidebar)

### 3.1 Layout Desktop

```
┌─────────────────────────┐
│ Conversas               │ ← Header
│                         │
│ [+ Nova Conversa]       │ ← Botão criar
│                         │
│ ● Conversa Ativa        │ ← Conversa atual (highlight)
│   "Como resetar senha?" │   - bg-primary-100
│   15:30                 │   - border-l-4 primary
│                         │
│   Conversa 2            │ ← Conversa anterior
│   "Erro ao login"       │   - bg-transparent
│   14:20                 │   - hover:bg-muted
│   [2]                   │   ← Badge de não lidas
│                         │
│   Conversa 3            │
│   "Problemas com..."    │   ← Preview truncado
│   Ontem                 │   - text-ellipsis
│                         │
│   Conversa 4            │
│   "Configurar tema"     │
│   02/11                 │
│                         │
│ ─────────────────────── │
│ [🔍] Buscar             │ ← Search bar (opcional)
└─────────────────────────┘
```

**Características:**
- **Width**: 240px no desktop, drawer no mobile
- **Scroll**: Vertical quando há muitas conversas
- **Highlight**: Conversa ativa tem `bg-primary-100` e borda esquerda
- **Preview**: Primeira linha da última mensagem (truncado)
- **Timestamps**: Relativo (15:30, Ontem, 02/11)
- **Badges**: Contador de mensagens não lidas

### 3.2 Conversation Item (Item da lista)

```typescript
interface ConversationItemProps {
  id: string;
  title?: string;          // Título customizado ou primeira mensagem
  preview: string;         // Preview da última mensagem
  timestamp: string;       // Timestamp formatado
  unreadCount?: number;    // Contador de não lidas
  isActive: boolean;       // Se é a conversa atual
  onClick: () => void;
}

function ConversationItem({
  id,
  title,
  preview,
  timestamp,
  unreadCount = 0,
  isActive,
  onClick
}: ConversationItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 rounded-lg transition-colors",
        "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary",
        isActive && "bg-primary-100 border-l-4 border-primary"
      )}
    >
      {/* Indicador de ativa */}
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
      )}

      {/* Header: Título + Timestamp */}
      <div className="flex items-center justify-between mb-1">
        <h4 className="font-medium text-sm truncate flex-1">
          {title || preview.slice(0, 30)}
        </h4>
        <span className="text-xs text-muted-foreground ml-2">
          {timestamp}
        </span>
      </div>

      {/* Preview da última mensagem */}
      <p className="text-sm text-muted-foreground truncate mb-1">
        {preview}
      </p>

      {/* Badge de não lidas */}
      {unreadCount > 0 && (
        <Badge variant="destructive" className="text-xs">
          {unreadCount}
        </Badge>
      )}
    </button>
  );
}
```

### 3.3 Botão Nova Conversa

```typescript
function NewConversationButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      className="w-full mb-4"
    >
      <PlusIcon className="w-4 h-4 mr-2" />
      Nova Conversa
    </Button>
  );
}
```

**Comportamento:**
- Ao clicar, cria uma nova conversa vazia
- Nova conversa se torna ativa automaticamente
- Mensagens antigas permanecem na lista

---

## 4. Área de Input (Message Input)

### 4.1 Input Básico

```
┌─────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────┐ │
│ │ Digite sua mensagem...                  │ │ ← Textarea auto-grow
│ └─────────────────────────────────────────┘ │
│ [📎] [😊]                      [Enviar ↑]   │
│  ↑    ↑                              ↑      │
│ Upload Emoji                      Submit    │
└─────────────────────────────────────────────┘
```

**Características:**
- **Textarea**: Cresce automaticamente até `maxInputRows` (default: 5)
- **Placeholder**: Configurável via instância
- **Enter**: Envia mensagem
- **Shift+Enter**: Nova linha
- **Max length**: Configurável via `maxInputLength`

### 4.2 Input com Arquivo Anexado

```
┌─────────────────────────────────────────────┐
│ Arquivos anexados:                          │
│ ┌─────────────────────────────────────────┐ │
│ │ 📷 screenshot.png (245 KB)        [X]   │ │ ← Preview de arquivo
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Olha esse erro que apareceu             │ │
│ └─────────────────────────────────────────┘ │
│ [📎] [😊]                      [Enviar ↑]   │
└─────────────────────────────────────────────┘
```

**Características:**
- **Preview**: Lista de arquivos anexados acima do input
- **Remove**: Botão [X] para remover arquivo antes de enviar
- **Validação**: Tipo e tamanho validados no upload

### 4.3 Código do Componente

```typescript
interface MessageInputProps {
  onSend: (message: string, files?: File[]) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  maxRows?: number;
  allowFileUpload?: boolean;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
}

function MessageInput({
  onSend,
  disabled = false,
  placeholder = "Digite sua mensagem...",
  maxLength = 4000,
  maxRows = 5,
  allowFileUpload = false,
  acceptedFileTypes = ["image/*", "application/pdf"],
  maxFileSize = 5 * 1024 * 1024 // 5MB
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = maxRows * 24; // aprox 24px por linha
      textareaRef.current.style.height =
        Math.min(scrollHeight, maxHeight) + "px";
    }
  }, [message, maxRows]);

  // Handle send
  const handleSend = async () => {
    if (!message.trim() && files.length === 0) return;
    if (isSending) return;

    setIsSending(true);
    try {
      await onSend(message, files);
      setMessage("");
      setFiles([]);
    } catch (error) {
      console.error("Error sending message:", error);
      // Error handling é feito no componente pai
    } finally {
      setIsSending(false);
    }
  };

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle file upload
  const handleFileUpload = (uploadedFiles: File[]) => {
    // Validar tipo
    const validFiles = uploadedFiles.filter(file =>
      acceptedFileTypes.some(type =>
        file.type.match(type.replace("*", ".*"))
      )
    );

    // Validar tamanho
    const sizedFiles = validFiles.filter(file =>
      file.size <= maxFileSize
    );

    setFiles(prev => [...prev, ...sizedFiles]);
  };

  // Remove file
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const canSend = (message.trim() || files.length > 0) && !disabled && !isSending;

  return (
    <div className="border-t bg-background p-4">
      {/* Arquivos anexados */}
      {files.length > 0 && (
        <div className="mb-3 space-y-2">
          <p className="text-sm text-muted-foreground">Arquivos anexados:</p>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-muted rounded"
            >
              <div className="flex items-center gap-2">
                <FileIcon className="w-4 h-4" />
                <span className="text-sm">
                  {file.name} ({formatFileSize(file.size)})
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeFile(index)}
              >
                <XIcon className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2">
        {/* Upload button */}
        {allowFileUpload && (
          <FileUploadButton
            onUpload={handleFileUpload}
            accept={acceptedFileTypes.join(",")}
            disabled={disabled || isSending}
          />
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isSending}
          maxLength={maxLength}
          className={cn(
            "flex-1 resize-none rounded-lg border bg-background px-3 py-2",
            "focus:outline-none focus:ring-2 focus:ring-primary",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          rows={1}
        />

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={!canSend}
          size="icon"
        >
          <SendIcon className="w-4 h-4" />
        </Button>
      </div>

      {/* Hint */}
      <p className="text-xs text-muted-foreground mt-2">
        💡 Shift+Enter para nova linha • Enter para enviar
      </p>
    </div>
  );
}
```

---

## 5. Busca no Histórico (Search)

### 5.1 Interface de Busca

```
┌─────────────────────────────────────────────┐
│ [🔍] Buscar no histórico        [X] Fechar │ ← Header
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ resetar senha              [Buscar]    │ │ ← Search input
│ └─────────────────────────────────────────┘ │
│                                             │
│ 3 resultados encontrados                    │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Conversa: Suporte Técnico               │ │
│ │ 10/11 15:30                             │ │
│ │                                         │ │
│ │ Como eu **resetar** minha **senha**?    │ │ ← Termos destacados
│ │                                         │ │
│ │ [Ver conversa]                          │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Conversa: Suporte Técnico               │ │
│ │ 10/11 15:45                             │ │
│ │                                         │ │
│ │ Para **resetar** sua **senha**:         │ │
│ │ 1. Acesse a tela de login...            │ │
│ │                                         │ │
│ │ [Ver conversa]                          │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [1] [2] [3]                          1 de 3 │ ← Paginação
└─────────────────────────────────────────────┘
```

**Características:**
- **Modal/Drawer**: Overlay sobre o chat
- **Search input**: Com debounce de 300ms
- **Resultados**: Lista paginada com preview
- **Highlight**: Termos buscados destacados em negrito
- **Navegação**: Botões para ir ao resultado na conversa

### 5.2 Código do Componente

```typescript
interface SearchResult {
  conversationId: string;
  conversationTitle: string;
  messageId: string;
  messageContent: string;
  timestamp: string;
  role: "user" | "agent";
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (result: SearchResult) => void;
}

function SearchModal({ isOpen, onClose, onSelectResult }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    const searchMessages = async () => {
      setIsSearching(true);
      try {
        const data = await jqelClient.query({
          schema: "chat",
          operation: "select",
          entity: "message",
          where: {
            content: { $contains: debouncedQuery }
          },
          orderBy: ["timestamp", "DESC"],
          limit: 50
        });
        setResults(data.records as SearchResult[]);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    };

    searchMessages();
  }, [debouncedQuery]);

  // Highlight matching terms
  const highlightText = (text: string, query: string) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Buscar no histórico</DialogTitle>
        </DialogHeader>

        {/* Search input */}
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite para buscar..."
            autoFocus
          />
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>

        {/* Results */}
        <ScrollArea className="flex-1">
          {isSearching ? (
            <div className="text-center py-8">
              <LoadingSpinner />
              <p className="text-sm text-muted-foreground mt-2">
                Buscando...
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8">
              <SearchIcon className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2">
                {query ? "Nenhum resultado encontrado" : "Digite para buscar"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {results.length} resultado{results.length > 1 ? "s" : ""} encontrado{results.length > 1 ? "s" : ""}
              </p>

              {results.map((result) => (
                <Card key={result.messageId} className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-sm">
                        {result.conversationTitle}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(result.timestamp)}
                      </p>
                    </div>
                    <Badge variant={result.role === "user" ? "default" : "secondary"}>
                      {result.role === "user" ? "Você" : "Agente"}
                    </Badge>
                  </div>

                  <p className="text-sm line-clamp-3 mb-2">
                    {highlightText(result.messageContent, query)}
                  </p>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSelectResult(result)}
                  >
                    Ver conversa
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 6. Exportação de Conversas

### 6.1 Modal de Exportação

```
┌─────────────────────────────────────────────┐
│ Exportar Conversa                    [X]    │
├─────────────────────────────────────────────┤
│                                             │
│ Formato:                                    │
│ ○ PDF (Documento formatado)                 │
│ ● Markdown (Texto simples)                  │
│ ○ JSON (Dados brutos)                       │
│                                             │
│ Opções:                                     │
│ ☑ Incluir timestamps                        │
│ ☑ Incluir metadados (modelo, tokens)        │
│ ☐ Incluir apenas mensagens do usuário       │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Preview:                                │ │
│ │                                         │ │
│ │ # Conversa: Suporte Técnico             │ │
│ │ Data: 10 de Nov de 2025                 │ │
│ │                                         │ │
│ │ ## Você (15:30)                         │ │
│ │ Como eu reseto minha senha?             │ │
│ │                                         │ │
│ │ ## Agente (15:30)                       │ │
│ │ Para resetar sua senha:...              │ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│               [Cancelar]  [Exportar]        │
└─────────────────────────────────────────────┘
```

**Características:**
- **Formatos**: PDF (via pdfmake), Markdown (.md), JSON (.json)
- **Opções**: Incluir/excluir timestamps, metadados, filtrar por role
- **Preview**: Visualização do conteúdo antes de exportar
- **Download**: Arquivo baixado automaticamente no browser

### 6.2 Código do Componente

```typescript
interface ExportModalProps {
  conversationId: string;
  isOpen: boolean;
  onClose: () => void;
}

type ExportFormat = "pdf" | "markdown" | "json";

interface ExportOptions {
  includeTimestamps: boolean;
  includeMetadata: boolean;
  userMessagesOnly: boolean;
}

function ExportModal({ conversationId, isOpen, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>("markdown");
  const [options, setOptions] = useState<ExportOptions>({
    includeTimestamps: true,
    includeMetadata: true,
    userMessagesOnly: false
  });
  const [isExporting, setIsExporting] = useState(false);

  const { data: messages } = useJQELQuery({
    schema: "chat",
    operation: "select",
    entity: "message",
    where: { conversationId: { $eq: conversationId } },
    orderBy: ["timestamp", "ASC"]
  });

  const handleExport = async () => {
    if (!messages?.records) return;

    setIsExporting(true);
    try {
      let content: string | Blob;
      let filename: string;
      let mimeType: string;

      switch (format) {
        case "markdown":
          content = exportToMarkdown(messages.records, options);
          filename = `conversa-${conversationId}.md`;
          mimeType = "text/markdown";
          break;

        case "json":
          content = JSON.stringify(messages.records, null, 2);
          filename = `conversa-${conversationId}.json`;
          mimeType = "application/json";
          break;

        case "pdf":
          content = await exportToPDF(messages.records, options);
          filename = `conversa-${conversationId}.pdf`;
          mimeType = "application/pdf";
          break;
      }

      // Download file
      const blob = content instanceof Blob
        ? content
        : new Blob([content], { type: mimeType });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      onClose();
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exportar Conversa</DialogTitle>
        </DialogHeader>

        {/* Format selection */}
        <div className="space-y-3">
          <Label>Formato:</Label>
          <RadioGroup value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pdf" id="pdf" />
              <Label htmlFor="pdf">PDF (Documento formatado)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="markdown" id="markdown" />
              <Label htmlFor="markdown">Markdown (Texto simples)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="json" id="json" />
              <Label htmlFor="json">JSON (Dados brutos)</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Options */}
        <div className="space-y-2">
          <Label>Opções:</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="timestamps"
                checked={options.includeTimestamps}
                onCheckedChange={(checked) =>
                  setOptions((prev) => ({ ...prev, includeTimestamps: checked as boolean }))
                }
              />
              <Label htmlFor="timestamps">Incluir timestamps</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="metadata"
                checked={options.includeMetadata}
                onCheckedChange={(checked) =>
                  setOptions((prev) => ({ ...prev, includeMetadata: checked as boolean }))
                }
              />
              <Label htmlFor="metadata">Incluir metadados</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="userOnly"
                checked={options.userMessagesOnly}
                onCheckedChange={(checked) =>
                  setOptions((prev) => ({ ...prev, userMessagesOnly: checked as boolean }))
                }
              />
              <Label htmlFor="userOnly">Apenas mensagens do usuário</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? "Exportando..." : "Exportar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper: Export to Markdown
function exportToMarkdown(
  messages: Message[],
  options: ExportOptions
): string {
  let content = `# Conversa\n\nData: ${new Date().toLocaleDateString()}\n\n`;

  messages.forEach((msg) => {
    if (options.userMessagesOnly && msg.role !== "user") return;

    const role = msg.role === "user" ? "Você" : "Agente";
    const timestamp = options.includeTimestamps
      ? ` (${formatTime(msg.timestamp)})`
      : "";

    content += `## ${role}${timestamp}\n\n${msg.content}\n\n`;

    if (options.includeMetadata && msg.metadata) {
      content += `_Metadados: ${JSON.stringify(msg.metadata)}_\n\n`;
    }
  });

  return content;
}

// Helper: Export to PDF
async function exportToPDF(
  messages: Message[],
  options: ExportOptions
): Promise<Blob> {
  // Usar pdfmake (do módulo app-components)
  const pdfMake = await import("pdfmake/build/pdfmake");
  const pdfFonts = await import("pdfmake/build/vfs_fonts");
  pdfMake.vfs = pdfFonts.pdfMake.vfs;

  const docDefinition = {
    content: [
      { text: "Conversa", style: "header" },
      { text: `Data: ${new Date().toLocaleDateString()}`, style: "subheader" },
      { text: "\n" },
      ...messages.map((msg) => ({
        text: [
          {
            text: `${msg.role === "user" ? "Você" : "Agente"}`,
            bold: true
          },
          options.includeTimestamps
            ? { text: ` (${formatTime(msg.timestamp)})`, italics: true }
            : "",
          { text: `\n${msg.content}\n\n` }
        ]
      }))
    ],
    styles: {
      header: { fontSize: 18, bold: true },
      subheader: { fontSize: 12, italics: true }
    }
  };

  return new Promise((resolve) => {
    pdfMake.createPdf(docDefinition).getBlob((blob) => {
      resolve(blob);
    });
  });
}
```

---

## 7. Sugestões Rápidas (Quick Suggestions)

### 7.1 Layout

```
┌─────────────────────────────────────────────┐
│ Sugestões rápidas:                          │
│ [Como resetar senha?] [Problemas com login] │
│ [Erro ao acessar relatórios]                │
└─────────────────────────────────────────────┘
    ↑ Botões clicáveis que enviam a pergunta
```

**Características:**
- **Posição**: Acima do input, abaixo das mensagens
- **Layout**: Horizontal wrap (desktop), scroll horizontal (mobile)
- **Aparência**: Botões `variant="outline"` com hover effect
- **Comportamento**: Ao clicar, envia mensagem automaticamente

### 7.2 Código do Componente

```typescript
interface QuickSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  disabled?: boolean;
}

function QuickSuggestions({
  suggestions,
  onSelect,
  disabled = false
}: QuickSuggestionsProps) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="px-4 py-2 border-t">
      <p className="text-xs text-muted-foreground mb-2">Sugestões rápidas:</p>
      <div className="flex flex-wrap gap-2 md:flex-nowrap md:overflow-x-auto">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onSelect(suggestion)}
            disabled={disabled}
            className="whitespace-nowrap"
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
}
```

---

## 8. Streaming de Respostas (SSE)

### 8.1 Indicador de Streaming

```
┌─────────────────────────────────────────────┐
│ ┌──────────────────────────────────────┐    │
│ │ Agente                       15:35   │    │
│ │                                      │    │
│ │ Para resetar sua senha você precisa  │    │ ← Texto aparecendo
│ │ acessar a tela de_                   │    │   char por char
│ │                                      │    │   (cursor piscando)
│ └──────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

**Características:**
- **Conexão SSE**: EventSource para `/api/agent/:provider/:agentId/stream`
- **Renderização incremental**: Caracteres aparecem progressivamente
- **Cursor piscando**: Indica que mais texto está chegando
- **Auto-scroll**: Lista rola automaticamente para baixo

### 8.2 Código de Integração

```typescript
interface StreamingMessageProps {
  conversationId: string;
  agentId: string;
  message: string;
  context: Message[];
}

function useStreamingMessage({
  conversationId,
  agentId,
  message,
  context
}: StreamingMessageProps) {
  const [streamedContent, setStreamedContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startStreaming = async () => {
    setIsStreaming(true);
    setStreamedContent("");
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      const eventSource = new EventSource(
        `/api/agent/openai/${agentId}/stream?` +
        new URLSearchParams({
          conversationId,
          message,
          context: JSON.stringify(context)
        }),
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "content") {
          setStreamedContent((prev) => prev + data.content);
        } else if (data.type === "done") {
          setIsStreaming(false);
          eventSource.close();
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE error:", error);
        setError("Erro ao receber resposta");
        setIsStreaming(false);
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    } catch (error) {
      console.error("Streaming error:", error);
      setError("Erro ao iniciar streaming");
      setIsStreaming(false);
    }
  };

  return {
    streamedContent,
    isStreaming,
    error,
    startStreaming
  };
}
```

---

## 9. Responsividade

### 9.1 Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile     | <768px | Stack vertical, sidebar como drawer |
| Tablet     | 768-1024px | Sidebar fixa (180px) + Chat |
| Desktop    | ≥1024px | Sidebar fixa (240px) + Chat |

### 9.2 Ajustes Mobile

**Header:**
- Título truncado com `text-ellipsis`
- Menu hamburguer para sidebar
- Menu de opções (⋮) para exportação/busca

**Messages:**
- Ocupam 100% da largura (menos padding)
- Font-size ligeiramente menor (14px → 13px)
- Timestamps apenas hora (sem data)

**Input:**
- Fixo no bottom da viewport
- Botões menores (36x36px min)
- Placeholder mais curto

**Quick Suggestions:**
- Scroll horizontal em vez de wrap
- Botões menores

---

## 10. Acessibilidade

### 10.1 Navegação por Teclado

**Atalhos:**
- `Tab`: Navegar entre conversas, input, botões
- `Enter`: Abrir conversa selecionada
- `Shift+Enter`: Nova linha no input
- `Ctrl/Cmd + K`: Abrir busca
- `Esc`: Fechar modais

### 10.2 Screen Readers

**ARIA Labels:**
```typescript
<div
  role="log"
  aria-live="polite"
  aria-relevant="additions"
  aria-label="Mensagens da conversa"
>
  {messages.map(msg => (
    <div
      key={msg.id}
      role="article"
      aria-label={`Mensagem de ${msg.role === 'user' ? 'você' : 'agente'} às ${formatTime(msg.timestamp)}`}
    >
      {msg.content}
    </div>
  ))}
</div>
```

**Anúncios:**
- Novas mensagens são anunciadas com `aria-live="polite"`
- Status de envio é anunciado ("Mensagem enviada", "Erro ao enviar")
- Typing indicator é anunciado ("Agente digitando")

### 10.3 Contraste e Cores

**WCAG 2.1 AA:**
- Texto: Contraste mínimo 4.5:1
- Botões: Contraste mínimo 3:1
- Focus indicators: Anel azul com 2px de largura
- Erro: Vermelho com ícone adicional (não apenas cor)

---

## 11. Performance

### 11.1 Virtualização de Mensagens

**Para conversas longas (>100 mensagens):**
```typescript
import { useVirtualizer } from "@tanstack/react-virtual";

function VirtualizedMessageList({ messages }: { messages: Message[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Altura estimada por mensagem
    overscan: 5 // Renderizar 5 itens extras acima/abaixo
  });

  return (
    <div
      ref={parentRef}
      className="flex-1 overflow-auto"
      style={{ height: "100%" }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative"
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`
            }}
          >
            <Message message={messages[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Benefícios:**
- Renderiza apenas mensagens visíveis (~10-15)
- Scroll suave mesmo com 1000+ mensagens
- Memória otimizada

### 11.2 Lazy Loading de Markdown

```typescript
import { memo } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

const MarkdownContent = memo(({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <SyntaxHighlighter
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
});
```

**Otimizações:**
- `memo()`: Evita re-renderização desnecessária
- Syntax highlighter carregado apenas quando necessário
- Markdown parseado uma única vez

### 11.3 Image Lazy Loading

```typescript
<img
  src={imageUrl}
  alt={altText}
  loading="lazy"
  className="rounded-lg max-w-full"
/>
```

---

## 12. Integração com JQEL

### 12.1 Carregar Histórico

```typescript
const { data: history, isLoading } = useJQELQuery({
  schema: "chat",
  operation: "select",
  entity: "message",
  where: {
    conversationId: { $eq: conversationId }
  },
  orderBy: ["timestamp", "ASC"],
  limit: 100
});
```

### 12.2 Salvar Mensagem

```typescript
const saveMessageMutation = useJQELMutation();

const saveMessage = async (message: Message) => {
  await saveMessageMutation.mutateAsync({
    schema: "chat",
    entity: "message",
    action: "insert",
    values: message
  });
};
```

### 12.3 Invalidação de Cache

```typescript
import { useQueryClient } from "@tanstack/react-query";

function ChatInterface() {
  const queryClient = useQueryClient();

  const handleNewMessage = async (message: Message) => {
    // Salvar mensagem
    await saveMessage(message);

    // Invalidar cache para recarregar histórico
    queryClient.invalidateQueries({
      queryKey: ["jqel", "chat", "message", { conversationId }]
    });
  };
}
```

---

## 13. Exemplo de Implementação Completa

```typescript
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useJQELQuery, useJQELMutation } from "@/services/jqel";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { ConversationList } from "./ConversationList";
import { QuickSuggestions } from "./QuickSuggestions";
import { SearchModal } from "./SearchModal";
import { ExportModal } from "./ExportModal";

interface ChatInterfaceProps {
  instanceConfig: ChatInstanceConfig;
}

export function ChatInterface({ instanceConfig }: ChatInterfaceProps) {
  const { conversationId: urlConversationId } = useParams();
  const [conversationId, setConversationId] = useState(
    urlConversationId || generateUUID()
  );
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);

  // Carregar histórico
  const { data: messages, isLoading } = useJQELQuery({
    schema: "chat",
    operation: "select",
    entity: "message",
    where: { conversationId: { $eq: conversationId } },
    orderBy: ["timestamp", "ASC"]
  });

  // Carregar lista de conversas
  const { data: conversations } = useJQELQuery({
    schema: "chat",
    operation: "select",
    entity: "conversation",
    orderBy: ["updatedAt", "DESC"],
    limit: 50
  });

  // Mutation para enviar mensagem
  const sendMessageMutation = useJQELMutation();

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle send message
  const handleSendMessage = async (content: string, files?: File[]) => {
    // 1. Create user message
    const userMessage: Message = {
      id: generateUUID(),
      conversationId,
      role: "user",
      content,
      timestamp: new Date().toISOString(),
      metadata: { files }
    };

    // 2. Save to database
    await sendMessageMutation.mutateAsync({
      schema: "chat",
      entity: "message",
      action: "insert",
      values: userMessage
    });

    // 3. Send to agent via Canal de Agentes
    const context = messages?.records.slice(-instanceConfig.contextWindow || -10) || [];

    try {
      const response = await fetch(`/api/agent/openai/${instanceConfig.agentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken()}`
        },
        body: JSON.stringify({
          message: content,
          conversationId,
          context,
          files
        })
      });

      const agentResponse = await response.json();

      // 4. Save agent response
      const agentMessage: Message = {
        id: generateUUID(),
        conversationId,
        role: "agent",
        content: agentResponse.message,
        timestamp: new Date().toISOString(),
        metadata: agentResponse.metadata
      };

      await sendMessageMutation.mutateAsync({
        schema: "chat",
        entity: "message",
        action: "insert",
        values: agentMessage
      });
    } catch (error) {
      console.error("Error sending message:", error);
      // Handle error (show error message, retry button, etc.)
    }
  };

  // Handle quick suggestion
  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  // Handle new conversation
  const handleNewConversation = () => {
    const newId = generateUUID();
    setConversationId(newId);
    navigate(`/chat/${newId}`);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar - Conversation List */}
      {instanceConfig.enableMultipleConversations && (
        <aside className="w-60 border-r bg-muted/10">
          <ConversationList
            conversations={conversations?.records || []}
            activeConversationId={conversationId}
            onSelectConversation={setConversationId}
            onNewConversation={handleNewConversation}
          />
        </aside>
      )}

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b p-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{instanceConfig.title}</h1>
            {instanceConfig.description && (
              <p className="text-sm text-muted-foreground">
                {instanceConfig.description}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {instanceConfig.enableSearch && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
              >
                <SearchIcon className="w-4 h-4 mr-2" />
                Buscar
              </Button>
            )}
            {instanceConfig.enableExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExportOpen(true)}
              >
                <DownloadIcon className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            )}
          </div>
        </header>

        {/* Message List */}
        <div ref={messageListRef} className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div className="text-center py-8">
              <LoadingSpinner />
              <p className="text-sm text-muted-foreground mt-2">
                Carregando histórico...
              </p>
            </div>
          ) : (
            <MessageList
              messages={messages?.records || []}
              showTimestamps={instanceConfig.showTimestamps}
            />
          )}
        </div>

        {/* Quick Suggestions */}
        {instanceConfig.quickSuggestions && (
          <QuickSuggestions
            suggestions={instanceConfig.quickSuggestions}
            onSelect={handleSuggestionClick}
            disabled={sendMessageMutation.isLoading}
          />
        )}

        {/* Message Input */}
        <MessageInput
          onSend={handleSendMessage}
          disabled={sendMessageMutation.isLoading}
          placeholder={instanceConfig.placeholder}
          maxLength={instanceConfig.maxInputLength}
          maxRows={instanceConfig.maxInputRows}
          allowFileUpload={instanceConfig.allowFileUpload}
          acceptedFileTypes={instanceConfig.acceptedFileTypes}
          maxFileSize={instanceConfig.maxFileSize}
        />
      </main>

      {/* Modals */}
      {instanceConfig.enableSearch && (
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelectResult={(result) => {
            setConversationId(result.conversationId);
            setIsSearchOpen(false);
          }}
        />
      )}

      {instanceConfig.enableExport && (
        <ExportModal
          conversationId={conversationId}
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
        />
      )}
    </div>
  );
}
```

---

## 14. Roadmap de Implementação

### Fase 1: MVP (Funcionalidades Obrigatórias)
**Duração estimada: 3-4 dias**

- [ ] Componente `<Message />` (usuário, agente, sistema)
- [ ] Componente `<MessageList />` com scroll automático
- [ ] Componente `<MessageInput />` com auto-grow
- [ ] Integração JQEL (carregar/salvar mensagens)
- [ ] Integração Canal de Agentes (enviar/receber)
- [ ] Renderização de Markdown básico
- [ ] Estados de loading e erro
- [ ] Página principal `<ChatInterface />`

### Fase 2: Funcionalidades Opcionais Core
**Duração estimada: 2-3 dias**

- [ ] Upload de arquivos (imagens + PDFs)
- [ ] Syntax highlighting em código
- [ ] Sugestões rápidas (quick suggestions)
- [ ] Múltiplas conversas (sidebar + lista)
- [ ] Botão "Nova Conversa"
- [ ] Timestamps configuráveis

### Fase 3: Busca e Exportação
**Duração estimada: 2 dias**

- [ ] Modal de busca no histórico
- [ ] Highlight de termos buscados
- [ ] Exportação para Markdown
- [ ] Exportação para JSON
- [ ] Exportação para PDF (via pdfmake)
- [ ] Preview de exportação

### Fase 4: Performance e UX Avançado
**Duração estimada: 2 dias**

- [ ] Virtualização de mensagens (react-virtual)
- [ ] Lazy loading de imagens
- [ ] Streaming de respostas (SSE)
- [ ] Optimistic updates
- [ ] Retry de mensagens com erro
- [ ] Paginação de histórico

### Fase 5: Acessibilidade e Polish
**Duração estimada: 1-2 dias**

- [ ] Navegação por teclado
- [ ] ARIA labels e roles
- [ ] Screen reader testing
- [ ] Contraste WCAG AA
- [ ] Animações com `prefers-reduced-motion`
- [ ] Responsive design (mobile/tablet/desktop)

**Tempo total estimado: 10-13 dias**

---

## 15. Checklist de Validação

### Funcionalidades Obrigatórias
- [ ] Enviar e receber mensagens em tempo real
- [ ] Exibir histórico de conversação
- [ ] Renderizar Markdown formatado
- [ ] Auto-scroll para última mensagem
- [ ] Input com Enter para enviar, Shift+Enter para nova linha
- [ ] Indicador "digitando..." enquanto agente processa
- [ ] Estados de erro com "Tentar novamente"
- [ ] Persistência de histórico via JQEL

### Funcionalidades Opcionais (se configuradas)
- [ ] Upload de arquivos com preview
- [ ] Exportação para PDF/Markdown/JSON
- [ ] Busca no histórico com highlight
- [ ] Múltiplas conversas com lista lateral
- [ ] Sugestões rápidas clicáveis
- [ ] Syntax highlighting em blocos de código

### Performance
- [ ] Mensagens virtualrizadas para conversas longas (>100 msgs)
- [ ] Lazy loading de imagens
- [ ] Bundle size <500KB gzipped
- [ ] Scroll suave mesmo com 1000+ mensagens
- [ ] Tempo de resposta <200ms para ações de UI

### Acessibilidade
- [ ] Navegação completa por teclado
- [ ] ARIA labels em todos os elementos interativos
- [ ] Screen reader anuncia novas mensagens
- [ ] Contraste mínimo 4.5:1 (texto) e 3:1 (UI)
- [ ] Focus indicators visíveis (2px blue ring)

### Responsive Design
- [ ] Mobile (<768px): Sidebar como drawer, input fixo
- [ ] Tablet (768-1024px): Sidebar fixa estreita (180px)
- [ ] Desktop (≥1024px): Sidebar fixa normal (240px)
- [ ] Touch targets mínimo 44x44px no mobile

### Segurança
- [ ] Sanitização de HTML para prevenir XSS
- [ ] Links com `rel="noopener noreferrer"`
- [ ] Validação de tipo e tamanho de arquivos
- [ ] Upload via backend (não direto para storage)

---

## 16. Notas de Implementação

### Dependências do Módulo
```json
{
  "dependencies": {
    "react-markdown": "^9.0.0",
    "remark-gfm": "^4.0.0",
    "react-syntax-highlighter": "^15.5.0",
    "react-dropzone": "^14.2.0",
    "@tanstack/react-virtual": "^3.0.0",
    "pdfmake": "^0.2.7",
    "date-fns": "^2.30.0"
  }
}
```

### Integração com app-components
O módulo Chat **reutiliza componentes** do módulo `app-components`:
- TipTap (editor rico, se necessário)
- react-dropzone (upload de arquivos)
- TanStack Virtual (virtualização)
- Recharts (analytics de uso, opcional)

### Configuração de Instância Exemplo
```json
{
  "instanceId": "chat-suporte",
  "moduleId": "chat",
  "portalId": "main",
  "config": {
    "agentId": "agente-suporte-gpt4",
    "route": "/chat/suporte",
    "title": "Suporte Técnico",
    "description": "Fale com nosso assistente de suporte",
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
    "exportFormats": ["pdf", "md", "json"],
    "enableSearch": true,
    "enableMultipleConversations": true,
    "maxInputLength": 4000,
    "autoGrowInput": true,
    "maxInputRows": 5,
    "showTimestamps": true,
    "showTypingIndicator": true,
    "persistHistory": true,
    "contextWindow": 10
  }
}
```

---

*Este documento especifica todas as interfaces UI/UX do módulo Chat. A implementação deve seguir as especificações em `spec/SPEC-module-chat.md` e as diretrizes gerais em `spec/SPEC-architecture.md`.*
