# Notification Module - UI/UX Interfaces

## Overview

O módulo **Notification** fornece interfaces completas para visualização e gerenciamento de notificações do sistema. Integra-se com o **Canal de Eventos (SSE)** para receber notificações em tempo real e persiste estado via **JQEL**.

**Características principais:**
- Badge com contador de não lidas
- Dropdown suspenso (quick access)
- Página completa de listagem
- Toast/Snackbar para novas notificações
- Filtros por categoria, prioridade e status
- Marcar como lida/não lida
- Excluir/arquivar notificações
- Som de notificação (opcional)
- Browser Notifications API (opcional)
- Integração SSE em tempo real
- Acessibilidade WCAG 2.1 AA

**Dependências:**
- `auth` (proteção de rotas, user context)
- Canal de Eventos (SSE) para recebimento real-time

---

## 1. Badge com Ícone (Notification Icon)

### 1.1 Layout Desktop

```
┌──────────────────────────────────────────┐
│  [🔔]  ← Ícone de sino                   │
│   (3)  ← Badge com contagem              │
└──────────────────────────────────────────┘

Estados:
- Sem notificações: [🔔] sem badge
- Com notificações: [🔔] (3) badge vermelho
- Animação: Sino balança ao receber nova
```

**Características:**
- **Ícone**: Sino (Bell) do Lucide React
- **Badge**: Círculo vermelho com número branco
- **Posição**: Normalmente no header/navbar superior direito
- **Click**: Abre dropdown suspenso
- **Animação**: Shake/ring ao receber notificação nova
- **ARIA**: `aria-label="Notificações, 3 não lidas"`

### 1.2 Código do Componente

```typescript
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNotifications } from "./useNotifications";

interface NotificationIconProps {
  onClick: () => void;
  showAnimation?: boolean;
}

export function NotificationIcon({
  onClick,
  showAnimation = true
}: NotificationIconProps) {
  const { unreadCount, hasNewNotification } = useNotifications();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={cn(
        "relative",
        showAnimation && hasNewNotification && "animate-ring"
      )}
      aria-label={`Notificações${unreadCount > 0 ? `, ${unreadCount} não lidas` : ""}`}
    >
      <Bell className="w-5 h-5" />

      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}
    </Button>
  );
}

// Animação CSS
const styles = `
@keyframes ring {
  0% { transform: rotate(0deg); }
  10% { transform: rotate(15deg); }
  20% { transform: rotate(-15deg); }
  30% { transform: rotate(10deg); }
  40% { transform: rotate(-10deg); }
  50% { transform: rotate(0deg); }
  100% { transform: rotate(0deg); }
}

.animate-ring {
  animation: ring 1s ease-in-out;
}
`;
```

---

## 2. Dropdown Suspenso (Notification Dropdown)

### 2.1 Layout

```
┌─────────────────────────────────────────────┐
│ Notificações                    [⚙️] [✓✓]  │ ← Header com ações
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ ● 🔵 Processamento concluído            │ │ ← Não lida (●)
│ │   Relatório mensal gerado com sucesso   │ │   Categoria com ícone
│ │   há 5 minutos                          │ │   Timestamp relativo
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ ● 🟡 Nova tarefa atribuída              │ │
│ │   João Silva atribuiu "Design do..."   │ │
│ │   há 15 minutos                         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │   🟢 Reunião iniciada                   │ │ ← Lida (sem ●)
│ │   Daily Standup começou                 │ │
│ │   há 1 hora                             │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │   🔴 Sistema atualizado                 │ │
│ │   Nova versão 2.5 disponível            │ │
│ │   ontem                                 │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ [Ver todas as notificações]                 │ ← Link para página completa
└─────────────────────────────────────────────┘

Ícones do header:
[⚙️] = Configurações (som, browser notifications)
[✓✓] = Marcar todas como lidas
```

**Características:**
- **Width**: 360px (desktop), fullscreen drawer (mobile)
- **Height**: Max 500px com scroll
- **Limite**: 5 notificações mais recentes (configurável)
- **Indicador não lida**: Ponto azul (●) à esquerda
- **Background não lida**: `bg-primary-50` (highlight sutil)
- **Click item**: Abre detalhes e marca como lida
- **Scroll**: Virtual scroll se >20 itens

### 2.2 Código do Componente

```typescript
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Settings, CheckCheck } from "lucide-react";
import { NotificationItem } from "./NotificationItem";
import { useNotifications } from "./useNotifications";

interface NotificationDropdownProps {
  maxItems?: number;
}

export function NotificationDropdown({
  maxItems = 5
}: NotificationDropdownProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isLoading
  } = useNotifications({
    limit: maxItems,
    sortBy: "timestamp:desc"
  });

  const recentNotifications = notifications.slice(0, maxItems);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div>
          <NotificationIcon onClick={() => {}} />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[360px] p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold">Notificações</h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {/* Abrir settings */}}
              aria-label="Configurações"
            >
              <Settings className="w-4 h-4" />
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={markAllAsRead}
                aria-label="Marcar todas como lidas"
              >
                <CheckCheck className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Lista de notificações */}
        <ScrollArea className="max-h-[400px]">
          {isLoading ? (
            <div className="p-8 text-center">
              <LoadingSpinner />
              <p className="text-sm text-muted-foreground mt-2">
                Carregando...
              </p>
            </div>
          ) : recentNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2">
                Nenhuma notificação
              </p>
            </div>
          ) : (
            <div className="py-2">
              {recentNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={() => markAsRead(notification.id)}
                  compact
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {recentNotifications.length > 0 && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {/* Navegar para página completa */}}
            >
              Ver todas as notificações
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## 3. Item de Notificação (Notification Item)

### 3.1 Estrutura Visual

```
┌─────────────────────────────────────────────┐
│ ● 🔵 [Título da Notificação]                │ ← Não lida + ícone categoria
│   [Mensagem/preview da notificação]         │ ← Mensagem (truncada)
│   há 5 minutos                          [X] │ ← Timestamp + botão excluir
└─────────────────────────────────────────────┘

Variações de prioridade:
- Low:    border-l-4 border-gray-400
- Normal: border-l-4 border-blue-500
- High:   border-l-4 border-red-500 + bg-red-50
```

### 3.2 Código do Componente

```typescript
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: Notification;
  onRead: () => void;
  onDelete?: () => void;
  compact?: boolean; // Modo compacto para dropdown
}

export function NotificationItem({
  notification,
  onRead,
  onDelete,
  compact = false
}: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.read) {
      onRead();
    }
    // Navegar para URL se houver
    if (notification.data.url) {
      window.location.href = notification.data.url;
    }
  };

  // Ícone e cor por categoria
  const categoryConfig = getCategoryConfig(notification.category);

  // Timestamp relativo
  const timeAgo = formatDistanceToNow(new Date(notification.timestamp), {
    addSuffix: true,
    locale: ptBR
  });

  // Cor da borda por prioridade
  const priorityBorder = {
    low: "border-gray-400",
    normal: "border-blue-500",
    high: "border-red-500"
  }[notification.priority];

  return (
    <div
      onClick={handleClick}
      className={cn(
        "relative px-4 py-3 cursor-pointer transition-colors border-l-4",
        priorityBorder,
        !notification.read && "bg-primary-50 dark:bg-primary-950",
        "hover:bg-muted/50",
        compact && "py-2"
      )}
    >
      {/* Indicador de não lida */}
      {!notification.read && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
      )}

      {/* Conteúdo */}
      <div className={cn("flex items-start gap-3", !notification.read && "pl-4")}>
        {/* Ícone da categoria */}
        <div className={cn("flex-shrink-0 mt-0.5", categoryConfig.colorClass)}>
          {categoryConfig.icon}
        </div>

        {/* Texto */}
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            "font-medium text-sm",
            !notification.read && "font-semibold"
          )}>
            {notification.data.title}
          </h4>
          {notification.data.message && (
            <p className={cn(
              "text-sm text-muted-foreground mt-0.5",
              compact && "line-clamp-1"
            )}>
              {notification.data.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {timeAgo}
          </p>
        </div>

        {/* Botão excluir */}
        {onDelete && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="flex-shrink-0 opacity-0 group-hover:opacity-100"
            aria-label="Excluir notificação"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Ações inline (se houver) */}
      {notification.data.actions && (
        <div className="flex gap-2 mt-2 ml-9">
          {notification.data.actions.map((action: any, index: number) => (
            <Button
              key={index}
              size="sm"
              variant={action.variant || "outline"}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
              }}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper: Configuração visual por categoria
function getCategoryConfig(category: string) {
  const configs = {
    system_info: {
      icon: <Info className="w-5 h-5" />,
      colorClass: "text-blue-500"
    },
    batch_processing: {
      icon: <Loader className="w-5 h-5" />,
      colorClass: "text-purple-500"
    },
    user_action: {
      icon: <User className="w-5 h-5" />,
      colorClass: "text-green-500"
    },
    milestone: {
      icon: <Trophy className="w-5 h-5" />,
      colorClass: "text-yellow-500"
    },
    alert: {
      icon: <AlertTriangle className="w-5 h-5" />,
      colorClass: "text-red-500"
    }
  };

  return configs[category] || configs.system_info;
}
```

---

## 4. Página Completa (Notification List Page)

### 4.1 Layout Desktop

```
┌─────────────────────────────────────────────────────────────────────┐
│ Notificações                                     [⚙️] [✓✓] [🗑️]     │ ← Header
├─────────────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────────────────┐   │
│ │ [Todas ▼] [Não lidas] [Categoria ▼] [Prioridade ▼] [Buscar]  │   │ ← Filtros
│ └───────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ● 🔵 Processamento em lote concluído               há 5 min    │ │
│ │   Relatório mensal de vendas gerado com sucesso.           [X]│ │
│ │   [Ver relatório]                                              │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ● 🟡 Nova tarefa atribuída                        há 15 min    │ │
│ │   João Silva atribuiu "Design do módulo calendar" para você[X]│ │
│ │   [Ver tarefa]                                                 │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │   🟢 Reunião iniciada                             há 1 hora    │ │
│ │   Daily Standup começou. Junte-se agora.                   [X]│ │
│ │   [Entrar na reunião]                                          │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │   🔴 Alerta: Uso de disco alto                    há 2 horas   │ │
│ │   Servidor web-01 está com 85% de uso de disco.            [X]│ │
│ │   [Ver detalhes]                                               │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ [Carregar mais] ou scroll infinito                                 │
└─────────────────────────────────────────────────────────────────────┘

Ações do header:
[⚙️] = Configurações (som, browser notifications, filtros padrão)
[✓✓] = Marcar todas como lidas
[🗑️] = Excluir todas lidas
```

**Características:**
- **Filtros**: Tabs + dropdowns para filtrar
- **Busca**: Input com debounce para pesquisar no título/mensagem
- **Seleção múltipla**: Checkbox para ações em lote (opcional)
- **Paginação**: Scroll infinito ou botão "Carregar mais"
- **Empty state**: Imagem + texto quando não há notificações

### 4.2 Layout Mobile

```
┌────────────────────────────────┐
│ ☰  Notificações       [⋮]     │ ← Header compacto
├────────────────────────────────┤
│ [Filtros ▼]      [🔍]          │ ← Filtros colapsados
├────────────────────────────────┤
│                                │
│ ┌────────────────────────────┐ │
│ │ ● 🔵 Processamento OK      │ │
│ │   Relatório gerado         │ │
│ │   há 5 min            [X]  │ │
│ └────────────────────────────┘ │
│                                │
│ ┌────────────────────────────┐ │
│ │ ● 🟡 Nova tarefa           │ │
│ │   João atribuiu...         │ │
│ │   há 15 min           [X]  │ │
│ └────────────────────────────┘ │
│                                │
│ [Carregar mais]                │
└────────────────────────────────┘
```

### 4.3 Código da Página

```typescript
import { useState } from "react";
import { Search, Settings, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NotificationItem } from "./NotificationItem";
import { useNotifications } from "./useNotifications";

export function NotificationListPage() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [category, setCategory] = useState<string | null>(null);
  const [priority, setPriority] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    loadMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead
  } = useNotifications({
    filter,
    category,
    priority,
    search: searchQuery
  });

  return (
    <div className="container max-w-4xl mx-auto py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notificações</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {unreadCount} não {unreadCount === 1 ? "lida" : "lidas"}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {/* Abrir settings */}}
            aria-label="Configurações"
          >
            <Settings className="w-4 h-4" />
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="icon"
              onClick={markAllAsRead}
              aria-label="Marcar todas como lidas"
            >
              <CheckCheck className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (confirm("Excluir todas as notificações lidas?")) {
                deleteAllRead();
              }
            }}
            aria-label="Excluir todas lidas"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-card rounded-lg border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Filtro: Todas/Não lidas */}
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                Todas
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex-1">
                Não lidas
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Filtro: Categoria */}
          <Select value={category || "all"} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              <SelectItem value="system_info">Sistema</SelectItem>
              <SelectItem value="user_action">Ações de usuários</SelectItem>
              <SelectItem value="milestone">Marcos</SelectItem>
              <SelectItem value="alert">Alertas</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtro: Prioridade */}
          <Select value={priority || "all"} onValueChange={setPriority}>
            <SelectTrigger>
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas prioridades</SelectItem>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
            </SelectContent>
          </Select>

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* Lista de notificações */}
      <div className="bg-card rounded-lg border overflow-hidden">
        {isLoading && notifications.length === 0 ? (
          <div className="p-12 text-center">
            <LoadingSpinner className="mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">
              Carregando notificações...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-16 h-16 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-semibold mt-4">
              Nenhuma notificação
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Você está em dia! Não há notificações para exibir.
            </p>
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={() => markAsRead(notification.id)}
                onDelete={() => deleteNotification(notification.id)}
              />
            ))}

            {/* Load more */}
            {hasMore && (
              <div className="p-4 text-center border-t">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={isLoading}
                >
                  {isLoading ? "Carregando..." : "Carregar mais"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
```

---

## 5. Toast/Snackbar (Nova Notificação)

### 5.1 Layout

```
┌────────────────────────────────────────┐
│ 🔵 Processamento concluído        [X] │ ← Toast no canto
│ Relatório mensal foi gerado.          │
│ [Ver]  [Dispensar]                     │
└────────────────────────────────────────┘
    ↑ Aparece animado, desaparece em 5s
```

**Posições possíveis:**
- `top-right` (padrão)
- `top-left`
- `bottom-right`
- `bottom-left`
- `top-center`
- `bottom-center`

### 5.2 Código do Componente

```typescript
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotificationToastProps {
  notification: Notification;
  duration?: number; // ms (default: 5000)
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  onClose: () => void;
  onAction?: () => void;
}

export function NotificationToast({
  notification,
  duration = 5000,
  position = "top-right",
  onClose,
  onAction
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animar entrada
    setIsVisible(true);

    // Auto-dismiss
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Aguardar animação
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4"
  };

  const categoryConfig = getCategoryConfig(notification.category);

  return (
    <div
      className={cn(
        "fixed z-50 w-[360px] transition-all duration-300",
        positionClasses[position],
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="bg-card border shadow-lg rounded-lg p-4">
        <div className="flex items-start gap-3">
          {/* Ícone */}
          <div className={categoryConfig.colorClass}>
            {categoryConfig.icon}
          </div>

          {/* Conteúdo */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm">
              {notification.data.title}
            </h4>
            {notification.data.message && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {notification.data.message}
              </p>
            )}

            {/* Ações */}
            {onAction && (
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={onAction}>
                  Ver
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                  }}
                >
                  Dispensar
                </Button>
              </div>
            )}
          </div>

          {/* Botão fechar */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress bar (opcional) */}
        <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{
              animation: `shrink ${duration}ms linear`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// CSS para progress bar
const styles = `
@keyframes shrink {
  from { width: 100%; }
  to { width: 0%; }
}
`;
```

---

## 6. Browser Notifications (Notification API)

### 6.1 Permissão

```
┌────────────────────────────────────────┐
│ Ativar notificações do navegador?     │
│                                        │
│ Receba notificações mesmo quando      │
│ a aba estiver em segundo plano.       │
│                                        │
│ [Agora não]  [Ativar]                  │
└────────────────────────────────────────┘
```

### 6.2 Código de Integração

```typescript
// Hook para gerenciar browser notifications
export function useBrowserNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      console.warn("Browser não suporta Notification API");
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result === "granted";
  };

  const showNotification = (notification: Notification) => {
    if (permission !== "granted") return;

    const browserNotif = new Notification(notification.data.title || "Nova notificação", {
      body: notification.data.message,
      icon: notification.data.icon || "/logo-192x192.png",
      badge: "/badge-72x72.png",
      tag: notification.id,
      requireInteraction: notification.priority === "high",
      timestamp: new Date(notification.timestamp).getTime()
    });

    // Click handler
    browserNotif.onclick = () => {
      window.focus();
      if (notification.data.url) {
        window.location.href = notification.data.url;
      }
      browserNotif.close();
    };

    // Auto-close after 5s (se não for high priority)
    if (notification.priority !== "high") {
      setTimeout(() => browserNotif.close(), 5000);
    }
  };

  return {
    permission,
    requestPermission,
    showNotification,
    isSupported: "Notification" in window
  };
}
```

---

## 7. Hook useNotifications

### 7.1 Interface Completa

```typescript
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jqelClient } from "@/services/jqel";
import { useAuth } from "@/contexts/AuthContext";

interface UseNotificationsOptions {
  limit?: number;
  filter?: "all" | "unread";
  category?: string | null;
  priority?: string | null;
  search?: string;
  sortBy?: string;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const {
    limit = 20,
    filter = "all",
    category,
    priority,
    search,
    sortBy = "timestamp:desc"
  } = options;

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [hasNewNotification, setHasNewNotification] = useState(false);

  // Query: Buscar notificações
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["notifications", user?.id, filter, category, priority, search],
    queryFn: async () => {
      const where: any = {
        userId: { $eq: user!.id },
        type: { $eq: "notification" }
      };

      if (filter === "unread") {
        where.read = { $eq: false };
      }

      if (category) {
        where.category = { $eq: category };
      }

      if (priority) {
        where.priority = { $eq: priority };
      }

      if (search) {
        where.$or = [
          { "data.title": { $contains: search } },
          { "data.message": { $contains: search } }
        ];
      }

      return jqelClient.query({
        schema: "system",
        operation: "select",
        entity: "notification",
        where,
        orderBy: [sortBy],
        limit
      });
    },
    enabled: !!user
  });

  const notifications = data?.records || [];

  // Query: Contar não lidas
  const { data: unreadData } = useQuery({
    queryKey: ["notifications", "unread-count", user?.id],
    queryFn: async () => {
      return jqelClient.query({
        schema: "system",
        operation: "select",
        entity: "notification",
        where: {
          userId: { $eq: user!.id },
          read: { $eq: false }
        },
        output: ["count"]
      });
    },
    enabled: !!user
  });

  const unreadCount = unreadData?.records[0]?.count || 0;

  // Mutation: Marcar como lida
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return jqelClient.mutate({
        schema: "system",
        entity: "notification",
        action: "update",
        where: { id: { $eq: notificationId } },
        values: {
          read: true,
          readAt: new Date().toISOString()
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });

  // Mutation: Marcar todas como lidas
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return jqelClient.mutate({
        schema: "system",
        entity: "notification",
        action: "update",
        where: {
          userId: { $eq: user!.id },
          read: { $eq: false }
        },
        values: {
          read: true,
          readAt: new Date().toISOString()
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });

  // Mutation: Deletar notificação
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return jqelClient.mutate({
        schema: "system",
        entity: "notification",
        action: "delete",
        where: { id: { $eq: notificationId } }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });

  // Mutation: Deletar todas lidas
  const deleteAllReadMutation = useMutation({
    mutationFn: async () => {
      return jqelClient.mutate({
        schema: "system",
        entity: "notification",
        action: "delete",
        where: {
          userId: { $eq: user!.id },
          read: { $eq: true }
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });

  // SSE: Escutar novas notificações
  useEffect(() => {
    if (!user) return;

    const eventSource = new EventSource("/api/events/stream", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`
      }
    });

    eventSource.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "notification") {
        // Nova notificação recebida
        setHasNewNotification(true);
        setTimeout(() => setHasNewNotification(false), 1000);

        // Invalidar queries para refetch
        queryClient.invalidateQueries({ queryKey: ["notifications"] });

        // Tocar som (se configurado)
        if (config.behavior.playSound) {
          const audio = new Audio(config.behavior.soundFile || "/notification.mp3");
          audio.play().catch(console.error);
        }

        // Mostrar browser notification (se configurado e permitido)
        if (config.behavior.browserNotifications && Notification.permission === "granted") {
          new Notification(data.data.title, {
            body: data.data.message,
            icon: "/logo-192x192.png"
          });
        }
      }
    });

    return () => {
      eventSource.close();
    };
  }, [user, queryClient]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    hasNewNotification,
    markAsRead: (id: string) => markAsReadMutation.mutateAsync(id),
    markAllAsRead: () => markAllAsReadMutation.mutateAsync(),
    deleteNotification: (id: string) => deleteNotificationMutation.mutateAsync(id),
    deleteAllRead: () => deleteAllReadMutation.mutateAsync(),
    refetch,
    hasMore: notifications.length >= limit,
    loadMore: () => {
      // Implementar paginação (offset)
    }
  };
}
```

---

## 8. Configurações (Settings Modal)

### 8.1 Layout

```
┌─────────────────────────────────────────────┐
│ Configurações de Notificações         [X]  │
├─────────────────────────────────────────────┤
│                                             │
│ Som                                         │
│ ☑ Reproduzir som ao receber notificação    │
│                                             │
│ Notificações do navegador                  │
│ ☐ Ativar (Permissão negada)                │
│ [Solicitar permissão]                       │
│                                             │
│ Toasts                                      │
│ ☑ Mostrar toast ao receber notificação     │
│                                             │
│ Duração do toast:                           │
│ ┌───┐ segundos                              │
│ │ 5 │                                       │
│ └───┘                                       │
│                                             │
│ Agrupamento                                 │
│ ☑ Agrupar notificações similares           │
│                                             │
│ Auto-marcar como lida                       │
│ ☑ Marcar como lida ao clicar                │
│                                             │
│               [Cancelar]  [Salvar]          │
└─────────────────────────────────────────────┘
```

---

## 9. Responsividade

### 9.1 Breakpoints

| Breakpoint | Width | Ajustes |
|------------|-------|---------|
| Mobile     | <768px | Dropdown fullscreen, filtros colapsados |
| Tablet     | 768-1024px | Dropdown 320px, filtros em 2 colunas |
| Desktop    | ≥1024px | Dropdown 360px, filtros em 1 linha |

### 9.2 Mobile Específico

**Dropdown como drawer:**
- Slide from right
- Fullscreen height
- Swipe down to dismiss

**Toast posição:**
- `top-center` ou `bottom-center` no mobile
- Fullwidth com margin 16px

---

## 10. Acessibilidade

### 10.1 ARIA Labels

```typescript
// Badge
<div aria-label={`${unreadCount} notificações não lidas`} />

// Lista
<div role="list" aria-label="Notificações" />

// Item
<div
  role="listitem"
  aria-label={`${notification.data.title}, ${timeAgo}`}
  tabIndex={0}
/>

// Toast
<div role="alert" aria-live="polite" />
```

### 10.2 Navegação por Teclado

**Atalhos:**
- `Tab`: Navegar entre notificações
- `Enter`: Abrir/marcar como lida
- `Delete`: Excluir notificação selecionada
- `Ctrl/Cmd + Shift + N`: Abrir dropdown
- `Esc`: Fechar dropdown

### 10.3 Screen Readers

**Anúncios:**
- Nova notificação: "Nova notificação: [título]"
- Marcada como lida: "Notificação marcada como lida"
- Todas lidas: "Todas as notificações foram marcadas como lidas"

---

## 11. Performance

### 11.1 Virtual Scroll

Para listas com muitas notificações:
```typescript
import { useVirtualizer } from "@tanstack/react-virtual";

const virtualizer = useVirtualizer({
  count: notifications.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 80,
  overscan: 5
});
```

### 11.2 Debounce de Busca

```typescript
const debouncedSearch = useDebounce(searchQuery, 300);

useEffect(() => {
  if (debouncedSearch) {
    refetch();
  }
}, [debouncedSearch]);
```

---

## 12. Roadmap de Implementação

### Fase 1: MVP (2-3 dias)
- [ ] Hook `useNotifications`
- [ ] Componente `<NotificationIcon />` com badge
- [ ] Componente `<NotificationDropdown />`
- [ ] Componente `<NotificationItem />`
- [ ] Integração JQEL (queries e mutations)
- [ ] Marcar como lida/não lida

### Fase 2: Página Completa (1-2 dias)
- [ ] Página `<NotificationListPage />`
- [ ] Filtros (categoria, prioridade, status)
- [ ] Busca com debounce
- [ ] Paginação/scroll infinito
- [ ] Excluir notificações

### Fase 3: Real-time e Toast (1-2 dias)
- [ ] Integração SSE para notificações real-time
- [ ] Componente `<NotificationToast />`
- [ ] Som de notificação
- [ ] Animação de sino (ring)

### Fase 4: Features Avançadas (1-2 dias)
- [ ] Browser Notifications API
- [ ] Agrupamento de notificações similares
- [ ] Ações inline
- [ ] Arquivamento
- [ ] Modal de configurações

### Fase 5: Polish (1 dia)
- [ ] Responsive design
- [ ] Acessibilidade completa
- [ ] Animações suaves
- [ ] Performance (virtual scroll)

**Tempo total: 6-10 dias**

---

## 13. Checklist de Validação

### Funcionalidades Obrigatórias
- [ ] Badge com contador de não lidas
- [ ] Dropdown com últimas 5 notificações
- [ ] Página completa de listagem
- [ ] Marcar como lida (individual e todas)
- [ ] Integração SSE para real-time
- [ ] Persistência via JQEL
- [ ] Categorização visual

### Funcionalidades Opcionais
- [ ] Toast ao receber nova
- [ ] Som de notificação
- [ ] Browser Notifications
- [ ] Filtros e busca
- [ ] Excluir notificações
- [ ] Ações inline
- [ ] Agrupamento

### Performance
- [ ] Carrega notificações em <300ms
- [ ] SSE reconnect automático
- [ ] Virtual scroll para >50 itens
- [ ] Debounce em busca

### Acessibilidade
- [ ] ARIA labels completos
- [ ] Navegação por teclado
- [ ] Screen reader friendly
- [ ] Contraste WCAG AA

### Responsive
- [ ] Mobile: Dropdown fullscreen
- [ ] Tablet: Layout adaptado
- [ ] Desktop: Sidebar fixa

---

*Este documento especifica todas as interfaces UI/UX do módulo Notification. A implementação segue as diretrizes em `spec/SPEC-module-notifications.md` e `spec/SPEC-architecture.md`.*
