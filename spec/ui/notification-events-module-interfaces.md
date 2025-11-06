# Notification-Events Module - UI/UX Interfaces

## Overview

O módulo **Notification-Events** é uma **especialização** do módulo Notification, focado em exibir um **feed de eventos em tempo real** com visualização detalhada, filtros avançados e análise temporal. Diferente do módulo base (que foca em notificações passivas), este módulo oferece uma interface estilo "activity log" ou "audit trail" para monitoramento de eventos do sistema.

**Características principais:**
- Feed de eventos em tempo real via SSE
- Timeline visual com agrupamento temporal
- Filtros avançados (tipo, categoria, período, origem)
- Busca full-text em eventos
- Visualização detalhada de payload
- Exportação de eventos (CSV, JSON)
- Análise de frequência e padrões
- Gráficos de distribuição temporal
- Auto-refresh configurável
- Modo "live" (sempre na última entrada)
- Acessibilidade WCAG 2.1 AA

**Dependências:**
- `notification` (módulo base, compartilha hooks e serviços)
- `app-components` (Recharts para gráficos, TanStack Table)
- `auth` (proteção de rotas, permissões)

---

## 1. Feed Principal (Event Stream)

### 1.1 Layout Desktop (≥1024px)

```
┌─────────────────────────────────────────────────────────────────────┐
│ Feed de Eventos                    [⚡ Live] [⚙️] [📊] [📥]          │ ← Header
├────────────────┬────────────────────────────────────────────────────┤
│ Filtros        │ Timeline de Eventos                                │
│                │                                                    │
│ Período        │ ┌────────────────────────────────────────────────┐ │
│ ○ Tempo real   │ │ Hoje, 6 Nov 2025                       15:45  │ │
│ ● Últimas 24h  │ └────────────────────────────────────────────────┘ │
│ ○ Última semana│                                                    │
│ ○ Customizado  │ ┌────────────────────────────────────────────────┐ │
│                │ │ ● 15:45:23                                     │ │
│ Tipo           │ │   🔵 system_info                               │ │
│ ☑ Notification │ │   Sistema atualizado para versão 2.5           │ │
│ ☑ Task         │ │   Origin: backend-api                     [>] │ │
│ ☑ Job          │ └────────────────────────────────────────────────┘ │
│                │                                                    │
│ Categoria      │ ┌────────────────────────────────────────────────┐ │
│ ☑ Sistema      │ │ ● 15:42:10                                     │ │
│ ☑ Usuário      │ │   🟢 user_action                               │ │
│ ☑ Processamento│ │   João Silva atualizou tarefa #1234            │ │
│ ☑ Alerta       │ │   Origin: task-service                    [>] │ │
│ ☐ Marco        │ └────────────────────────────────────────────────┘ │
│                │                                                    │
│ Prioridade     │ ┌────────────────────────────────────────────────┐ │
│ ☑ Baixa        │ │ ● 15:40:55                                     │ │
│ ☑ Normal       │ │   🟡 batch_processing                          │ │
│ ☑ Alta         │ │   Processamento em lote iniciado (batch-0045)  │ │
│ ☑ Urgente      │ │   Origin: n8n-workflow                    [>] │ │
│                │ └────────────────────────────────────────────────┘ │
│ Origem         │                                                    │
│ ☑ backend-api  │ ┌────────────────────────────────────────────────┐ │
│ ☑ n8n-workflow │ │   15:38:42                                     │ │
│ ☑ task-service │ │   Relatório mensal gerado                      │ │
│ ☐ auth-service │ │   11 eventos similares agrupados          [+] │ │
│                │ └────────────────────────────────────────────────┘ │
│ [Limpar]       │                                                    │
│                │ ┌────────────────────────────────────────────────┐ │
│                │ │ ● 15:35:10                                     │ │
│ ┌────────────┐ │ │   🔴 alert                                     │ │
│ │ 🔍         │ │ │   ⚠️ Uso de disco alto (85%) - web-01         │ │
│ │ Buscar...  │ │ │   Origin: monitoring                      [>] │ │
│ └────────────┘ │ └────────────────────────────────────────────────┘ │
│                │                                                    │
│                │ [Carregar anteriores]                              │
└────────────────┴────────────────────────────────────────────────────┘
     ↑ Sidebar               ↑ Feed principal (scroll infinito)
    (240px)
```

**Características:**
- **Sidebar de filtros (240px)**: Filtros persistentes, colapsável
- **Feed central**: Timeline cronológica reversa (mais recentes no topo)
- **Indicador "Live"**: Badge verde piscante quando em modo tempo real
- **Agrupamento**: Eventos similares agrupados com contador
- **Hover**: Destaque do evento com ações rápidas (expandir, copiar ID)
- **Badges de categoria**: Ícone + cor por tipo de evento

### 1.2 Layout Mobile (<768px)

```
┌────────────────────────────────┐
│ ☰ Feed       [⚡] [⋮]          │ ← Header compacto
├────────────────────────────────┤
│ [Filtros ▼]      [🔍]          │ ← Filtros colapsados
├────────────────────────────────┤
│ Hoje, 6 Nov             15:45  │
│                                │
│ ┌────────────────────────────┐ │
│ │ ● 15:45 🔵                 │ │
│ │ Sistema atualizado         │ │
│ │ backend-api           [>]  │ │
│ └────────────────────────────┘ │
│                                │
│ ┌────────────────────────────┐ │
│ │ ● 15:42 🟢                 │ │
│ │ João atualizou tarefa      │ │
│ │ task-service          [>]  │ │
│ └────────────────────────────┘ │
│                                │
│ ┌────────────────────────────┐ │
│ │   15:38                    │ │
│ │ Relatório gerado           │ │
│ │ 11 similares agrupados [+] │ │
│ └────────────────────────────┘ │
│                                │
│ [Carregar mais]                │
└────────────────────────────────┘
```

---

## 2. Item de Evento (Event Item)

### 2.1 Estrutura Visual - Compacto

```
┌─────────────────────────────────────────────────────────────────────┐
│ ● 15:45:23  🔵 system_info                            [📋] [>]      │
│   Sistema atualizado para versão 2.5                               │
│   Origin: backend-api                                              │
└─────────────────────────────────────────────────────────────────────┘
  ↑          ↑                                           ↑    ↑
 não lida   categoria                                  copiar expandir
```

### 2.2 Estrutura Visual - Expandido

```
┌─────────────────────────────────────────────────────────────────────┐
│ ● 15:45:23  🔵 system_info                   [📋] [📥] [▼]          │
│   Sistema atualizado para versão 2.5                               │
│   Origin: backend-api • Priority: normal                           │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Detalhes do Evento                                              │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ Event ID: evt_1730901923_a4f2                                   │ │
│ │ Type: notification                                              │ │
│ │ User ID: system                                                 │ │
│ │ Timestamp: 2025-11-06T15:45:23.120Z                            │ │
│ │                                                                 │ │
│ │ Payload:                                                        │ │
│ │ ┌─────────────────────────────────────────────────────────────┐ │ │
│ │ │ {                                                           │ │ │
│ │ │   "version": "2.5.0",                                       │ │ │
│ │ │   "changes": [                                              │ │ │
│ │ │     "Bug fixes",                                            │ │ │
│ │ │     "Performance improvements"                              │ │ │
│ │ │   ],                                                        │ │ │
│ │ │   "releaseNotes": "https://..."                             │ │ │
│ │ │ }                                                           │ │ │
│ │ └─────────────────────────────────────────────────────────────┘ │ │
│ │                                                                 │ │
│ │ Metadata:                                                       │ │
│ │ - Server: web-01                                                │ │
│ │ - Region: us-east-1                                             │ │
│ │ - Duration: 125ms                                               │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.3 Código do Componente

```typescript
import { useState } from "react";
import { ChevronRight, ChevronDown, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatTime } from "date-fns";

interface EventItemProps {
  event: SystemEvent;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function EventItem({
  event,
  isExpanded = false,
  onToggleExpand
}: EventItemProps) {
  const [isCopied, setIsCopied] = useState(false);

  const categoryConfig = getCategoryConfig(event.category);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(event.id);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(event, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `event-${event.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={cn(
        "border-l-4 bg-card rounded-lg p-4 mb-3 transition-all",
        categoryConfig.borderColor,
        !event.read && "bg-primary-50 dark:bg-primary-950"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        {/* Timestamp + Categoria + Título */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {/* Indicador não lido */}
            {!event.read && (
              <div className="w-2 h-2 rounded-full bg-primary" />
            )}

            {/* Timestamp */}
            <span className="text-sm font-mono text-muted-foreground">
              {formatTime(new Date(event.timestamp), "HH:mm:ss")}
            </span>

            {/* Categoria com ícone */}
            <div className={cn("flex items-center gap-1", categoryConfig.colorClass)}>
              {categoryConfig.icon}
              <span className="text-xs font-medium">
                {event.category}
              </span>
            </div>

            {/* Badge de prioridade (se alta/urgente) */}
            {(event.priority === "high" || event.priority === "urgent") && (
              <Badge variant={event.priority === "urgent" ? "destructive" : "warning"}>
                {event.priority}
              </Badge>
            )}
          </div>

          {/* Título/Mensagem */}
          <h4 className="font-medium text-sm mb-1">
            {event.data.title || event.data.message}
          </h4>

          {/* Origem */}
          <p className="text-xs text-muted-foreground">
            Origin: {event.origin || "unknown"} • Priority: {event.priority}
          </p>
        </div>

        {/* Ações */}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleCopy}
            title={isCopied ? "Copiado!" : "Copiar ID"}
          >
            <Copy className="w-4 h-4" />
          </Button>

          {isExpanded && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleExport}
              title="Exportar JSON"
            >
              <Download className="w-4 h-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggleExpand}
            title={isExpanded ? "Recolher" : "Expandir"}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Detalhes expandidos */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t">
          <h5 className="font-semibold text-sm mb-3">Detalhes do Evento</h5>

          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground">Event ID:</span>
                <code className="ml-2 text-xs bg-muted px-1 rounded">
                  {event.id}
                </code>
              </div>
              <div>
                <span className="text-muted-foreground">Type:</span>
                <span className="ml-2">{event.type}</span>
              </div>
              <div>
                <span className="text-muted-foreground">User ID:</span>
                <span className="ml-2">{event.userId}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Timestamp:</span>
                <span className="ml-2 text-xs">
                  {new Date(event.timestamp).toISOString()}
                </span>
              </div>
            </div>

            {/* Payload JSON */}
            {event.data && Object.keys(event.data).length > 0 && (
              <div>
                <span className="text-muted-foreground mb-2 block">Payload:</span>
                <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                  {JSON.stringify(event.data, null, 2)}
                </pre>
              </div>
            )}

            {/* Metadata adicional */}
            {event.metadata && (
              <div>
                <span className="text-muted-foreground mb-2 block">Metadata:</span>
                <ul className="list-disc list-inside text-xs space-y-1">
                  {Object.entries(event.metadata).map(([key, value]) => (
                    <li key={key}>
                      <span className="font-medium">{key}:</span> {String(value)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper: Configuração visual por categoria
function getCategoryConfig(category: string) {
  const configs = {
    system_info: {
      icon: <Info className="w-4 h-4" />,
      colorClass: "text-blue-500",
      borderColor: "border-blue-500"
    },
    batch_processing: {
      icon: <Loader className="w-4 h-4" />,
      colorClass: "text-purple-500",
      borderColor: "border-purple-500"
    },
    user_action: {
      icon: <User className="w-4 h-4" />,
      colorClass: "text-green-500",
      borderColor: "border-green-500"
    },
    milestone: {
      icon: <Trophy className="w-4 h-4" />,
      colorClass: "text-yellow-500",
      borderColor: "border-yellow-500"
    },
    alert: {
      icon: <AlertTriangle className="w-4 h-4" />,
      colorClass: "text-red-500",
      borderColor: "border-red-500"
    }
  };

  return configs[category] || configs.system_info;
}
```

---

## 3. Sidebar de Filtros

### 3.1 Layout Completo

```
┌────────────────────────┐
│ Filtros          [✕]   │ ← Header (toggle collapse)
├────────────────────────┤
│                        │
│ Período                │
│ ○ Tempo real           │
│ ● Últimas 24h          │
│ ○ Última semana        │
│ ○ Último mês           │
│ ○ Customizado          │
│   ┌──────────────────┐ │
│   │ De: 01/11/2025   │ │
│   │ Até: 06/11/2025  │ │
│   └──────────────────┘ │
│                        │
│ Tipo de Evento         │
│ ☑ Notifications        │
│ ☑ Tasks                │
│ ☑ Jobs                 │
│                        │
│ Categoria              │
│ ☑ 🔵 Sistema      (45) │
│ ☑ 🟢 Usuário      (23) │
│ ☑ 🟡 Processamento(12) │
│ ☑ 🔴 Alerta        (3) │
│ ☐ 🟣 Marco         (1) │
│                        │
│ Prioridade             │
│ ☑ Baixa          (30) │
│ ☑ Normal         (40) │
│ ☑ Alta           (10) │
│ ☐ Urgente         (4) │
│                        │
│ Origem                 │
│ ☑ backend-api    (25) │
│ ☑ n8n-workflow   (18) │
│ ☑ task-service   (15) │
│ ☐ auth-service    (8) │
│ ☐ chat-service    (5) │
│                        │
│ [Limpar filtros]       │
│                        │
│ ────────────────────   │
│ 🔍 Busca               │
│ ┌──────────────────┐   │
│ │ Buscar eventos...│   │
│ └──────────────────┘   │
└────────────────────────┘
```

### 3.2 Código do Componente

```typescript
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";

interface EventFiltersProps {
  filters: EventFilters;
  onChange: (filters: EventFilters) => void;
  onClear: () => void;
}

export function EventFiltersSidebar({
  filters,
  onChange,
  onClear
}: EventFiltersProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const updateFilter = (key: string, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleCategory = (category: string) => {
    const current = filters.categories || [];
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    updateFilter("categories", updated);
  };

  if (isCollapsed) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsCollapsed(false)}
        className="fixed left-4 top-20 z-10"
      >
        Mostrar Filtros
      </Button>
    );
  }

  return (
    <aside className="w-60 border-r bg-card p-4 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filtros</h3>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setIsCollapsed(true)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Período */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Período</Label>
        <RadioGroup
          value={filters.period}
          onValueChange={(v) => updateFilter("period", v)}
        >
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="realtime" id="realtime" />
              <Label htmlFor="realtime">Tempo real</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="24h" id="24h" />
              <Label htmlFor="24h">Últimas 24h</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="7d" id="7d" />
              <Label htmlFor="7d">Última semana</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="30d" id="30d" />
              <Label htmlFor="30d">Último mês</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom">Customizado</Label>
            </div>
          </div>
        </RadioGroup>

        {filters.period === "custom" && (
          <div className="mt-3 space-y-2">
            <DatePicker
              label="De:"
              value={filters.startDate}
              onChange={(d) => updateFilter("startDate", d)}
            />
            <DatePicker
              label="Até:"
              value={filters.endDate}
              onChange={(d) => updateFilter("endDate", d)}
            />
          </div>
        )}
      </div>

      {/* Tipo de Evento */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Tipo de Evento</Label>
        <div className="space-y-2">
          {["notification", "task", "job"].map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={type}
                checked={filters.types?.includes(type)}
                onCheckedChange={() => {
                  const current = filters.types || [];
                  const updated = current.includes(type)
                    ? current.filter(t => t !== type)
                    : [...current, type];
                  updateFilter("types", updated);
                }}
              />
              <Label htmlFor={type} className="capitalize">
                {type}s
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Categoria */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Categoria</Label>
        <div className="space-y-2">
          {eventCategories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={cat.id}
                  checked={filters.categories?.includes(cat.id)}
                  onCheckedChange={() => toggleCategory(cat.id)}
                />
                <Label htmlFor={cat.id} className="flex items-center gap-1">
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </Label>
              </div>
              <span className="text-xs text-muted-foreground">
                ({cat.count})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Prioridade */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Prioridade</Label>
        <div className="space-y-2">
          {["low", "normal", "high", "urgent"].map((priority) => (
            <div key={priority} className="flex items-center space-x-2">
              <Checkbox
                id={priority}
                checked={filters.priorities?.includes(priority)}
                onCheckedChange={() => {
                  const current = filters.priorities || [];
                  const updated = current.includes(priority)
                    ? current.filter(p => p !== priority)
                    : [...current, priority];
                  updateFilter("priorities", updated);
                }}
              />
              <Label htmlFor={priority} className="capitalize">
                {priority === "low" ? "Baixa" :
                 priority === "normal" ? "Normal" :
                 priority === "high" ? "Alta" : "Urgente"}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Origem */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Origem</Label>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {eventOrigins.map((origin) => (
            <div key={origin.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={origin.id}
                  checked={filters.origins?.includes(origin.id)}
                  onCheckedChange={() => {
                    const current = filters.origins || [];
                    const updated = current.includes(origin.id)
                      ? current.filter(o => o !== origin.id)
                      : [...current, origin.id];
                    updateFilter("origins", updated);
                  }}
                />
                <Label htmlFor={origin.id}>{origin.label}</Label>
              </div>
              <span className="text-xs text-muted-foreground">
                ({origin.count})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Botão limpar */}
      <Button
        variant="outline"
        className="w-full"
        onClick={onClear}
      >
        Limpar filtros
      </Button>

      {/* Busca */}
      <div className="pt-4 border-t">
        <Label className="text-sm font-medium mb-2 block">🔍 Busca</Label>
        <Input
          placeholder="Buscar eventos..."
          value={filters.search || ""}
          onChange={(e) => updateFilter("search", e.target.value)}
        />
      </div>
    </aside>
  );
}
```

---

## 4. Modo Live (Real-time Mode)

### 4.1 Indicador Visual

```
┌─────────────────────────────────────────────┐
│ Feed de Eventos    [⚡ Live] [⚙️] [📊] [📥] │
│                      ↑                      │
│                  Badge verde                │
│                  piscante                   │
└─────────────────────────────────────────────┘

Estados:
- Live ativo: Badge verde piscando
- Live pausado: Badge cinza
- Novo evento: Notificação visual + scroll automático
```

### 4.2 Auto-scroll

```typescript
function EventFeed() {
  const feedRef = useRef<HTMLDivElement>(null);
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-scroll para o topo quando novo evento chega (se live mode)
  useEffect(() => {
    if (isLiveMode && !isPaused && feedRef.current) {
      feedRef.current.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  }, [events, isLiveMode, isPaused]);

  // Detectar scroll manual para pausar auto-scroll
  const handleScroll = () => {
    if (!feedRef.current) return;

    const { scrollTop } = feedRef.current;
    // Se usuário rolou para baixo, pausar auto-scroll
    if (scrollTop > 100) {
      setIsPaused(true);
    } else {
      setIsPaused(false);
    }
  };

  return (
    <div
      ref={feedRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto"
    >
      {/* Badge de pause se rolou */}
      {isPaused && (
        <div className="sticky top-0 z-10 bg-yellow-100 border-b border-yellow-300 p-2 text-center">
          <span className="text-sm">
            Auto-scroll pausado.
            <Button
              variant="link"
              size="sm"
              onClick={() => {
                feedRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                setIsPaused(false);
              }}
            >
              Voltar ao topo
            </Button>
          </span>
        </div>
      )}

      {/* Lista de eventos */}
      {events.map(event => (
        <EventItem key={event.id} event={event} />
      ))}
    </div>
  );
}
```

---

## 5. Análise e Gráficos (Analytics View)

### 5.1 Dashboard de Análise

```
┌─────────────────────────────────────────────────────────────────────┐
│ Análise de Eventos                              [📥 Exportar]       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ Estatísticas Gerais                                                 │
│ ┌────────────┬────────────┬────────────┬────────────┐              │
│ │ 1,234      │ 45         │ 3          │ 98.2%      │              │
│ │ Total      │ Por hora   │ Alertas    │ Taxa OK    │              │
│ └────────────┴────────────┴────────────┴────────────┘              │
│                                                                     │
│ Distribuição Temporal (Últimas 24h)                                │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │     ▁▂▃▄▅▆▇█                                                    │ │
│ │ 100│        ██                                                  │ │
│ │    │      ████                                                  │ │
│ │  50│    ██████      ██                                          │ │
│ │    │  ████████    ████    ██                                    │ │
│ │   0│██████████  ██████  ████  ██                                │ │
│ │    └────────────────────────────────────────────────────────    │ │
│ │     00:00  06:00  12:00  18:00  24:00                          │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ Distribuição por Categoria              Top 5 Origens              │
│ ┌───────────────────────────┐  ┌───────────────────────────────┐  │
│ │ 🔵 Sistema        45%     │  │ backend-api      350 (28%)    │  │
│ │ 🟢 Usuário        30%     │  │ n8n-workflow     280 (23%)    │  │
│ │ 🟡 Processamento  15%     │  │ task-service     220 (18%)    │  │
│ │ 🔴 Alerta          8%     │  │ auth-service     180 (15%)    │  │
│ │ 🟣 Marco           2%     │  │ chat-service     120 (10%)    │  │
│ └───────────────────────────┘  └───────────────────────────────┘  │
│                                                                     │
│ Eventos Mais Frequentes                                             │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 1. Sistema atualizado                               125x        │ │
│ │ 2. Usuário fez login                                89x         │ │
│ │ 3. Processamento em lote concluído                  67x         │ │
│ │ 4. Tarefa atribuída                                 45x         │ │
│ │ 5. Email enviado                                    34x         │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 Código dos Gráficos

```typescript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PieChart, Pie, Cell, Legend } from "recharts";

export function EventAnalytics({ events }: { events: SystemEvent[] }) {
  // Calcular estatísticas
  const stats = useMemo(() => {
    const total = events.length;
    const alerts = events.filter(e => e.category === "alert").length;
    const perHour = Math.round(total / 24);
    const successRate = ((total - alerts) / total * 100).toFixed(1);

    return { total, perHour, alerts, successRate };
  }, [events]);

  // Distribuição temporal (por hora)
  const timeDistribution = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: 0
    }));

    events.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      hours[hour].count++;
    });

    return hours.map(h => ({
      hour: `${h.hour.toString().padStart(2, "0")}:00`,
      count: h.count
    }));
  }, [events]);

  // Distribuição por categoria
  const categoryDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach(event => {
      counts[event.category] = (counts[event.category] || 0) + 1;
    });

    return Object.entries(counts).map(([category, count]) => ({
      name: category,
      value: count,
      percentage: ((count / events.length) * 100).toFixed(0)
    }));
  }, [events]);

  // Top origens
  const topOrigins = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach(event => {
      const origin = event.origin || "unknown";
      counts[origin] = (counts[origin] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([origin, count]) => ({
        origin,
        count,
        percentage: ((count / events.length) * 100).toFixed(0)
      }));
  }, [events]);

  return (
    <div className="space-y-6 p-6">
      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-4 gap-4">
        <StatsCard
          label="Total"
          value={stats.total.toLocaleString()}
          icon={<Activity />}
        />
        <StatsCard
          label="Por hora"
          value={stats.perHour}
          icon={<Clock />}
        />
        <StatsCard
          label="Alertas"
          value={stats.alerts}
          icon={<AlertTriangle />}
          variant="warning"
        />
        <StatsCard
          label="Taxa OK"
          value={`${stats.successRate}%`}
          icon={<CheckCircle />}
          variant="success"
        />
      </div>

      {/* Gráfico de distribuição temporal */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição Temporal (Últimas 24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráficos de pizza */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${entry.name} (${entry.percentage}%)`}
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={index} fill={getCategoryColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Origens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topOrigins.map((item, index) => (
                <div key={item.origin} className="flex items-center justify-between">
                  <span className="text-sm">{item.origin}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.count}</span>
                    <span className="text-xs text-muted-foreground">
                      ({item.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

## 6. Exportação de Eventos

### 6.1 Modal de Exportação

```
┌─────────────────────────────────────────────┐
│ Exportar Eventos                       [X]  │
├─────────────────────────────────────────────┤
│                                             │
│ Formato:                                    │
│ ○ CSV (Compatível com Excel)               │
│ ● JSON (Dados completos)                    │
│ ○ JSON Lines (Uma linha por evento)         │
│                                             │
│ Período:                                    │
│ ● Eventos filtrados atualmente (245)        │
│ ○ Todos os eventos (1,234)                  │
│ ○ Customizado:                              │
│   De: [01/11/2025] Até: [06/11/2025]        │
│                                             │
│ Incluir:                                    │
│ ☑ Payload completo                          │
│ ☑ Metadata adicional                        │
│ ☐ Eventos já lidos                          │
│                                             │
│               [Cancelar]  [Exportar]        │
└─────────────────────────────────────────────┘
```

### 6.2 Código de Exportação

```typescript
function exportEvents(events: SystemEvent[], format: "csv" | "json" | "jsonl") {
  let content: string;
  let filename: string;
  let mimeType: string;

  switch (format) {
    case "csv":
      content = convertToCSV(events);
      filename = `events-${Date.now()}.csv`;
      mimeType = "text/csv";
      break;

    case "json":
      content = JSON.stringify(events, null, 2);
      filename = `events-${Date.now()}.json`;
      mimeType = "application/json";
      break;

    case "jsonl":
      content = events.map(e => JSON.stringify(e)).join("\n");
      filename = `events-${Date.now()}.jsonl`;
      mimeType = "application/x-ndjson";
      break;
  }

  // Download
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function convertToCSV(events: SystemEvent[]): string {
  const headers = ["ID", "Type", "Category", "Priority", "Timestamp", "Title", "Origin"];
  const rows = events.map(e => [
    e.id,
    e.type,
    e.category,
    e.priority,
    e.timestamp,
    e.data.title || e.data.message || "",
    e.origin || ""
  ]);

  return [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
  ].join("\n");
}
```

---

## 7. Hook useEventStream

```typescript
import { useEffect, useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface UseEventStreamOptions {
  filters?: EventFilters;
  onNewEvent?: (event: SystemEvent) => void;
  autoScroll?: boolean;
}

export function useEventStream(options: UseEventStreamOptions = {}) {
  const { filters, onNewEvent, autoScroll = true } = options;
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const queryClient = useQueryClient();

  // Conectar ao SSE
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const eventSource = new EventSource("/api/events/stream", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Aplicar filtros localmente
        if (!matchesFilters(data, filters)) return;

        // Adicionar ao feed
        setEvents(prev => [data, ...prev]);

        // Callback customizado
        if (onNewEvent) {
          onNewEvent(data);
        }

        // Invalidar queries relevantes
        queryClient.invalidateQueries({ queryKey: ["events"] });
      } catch (err) {
        console.error("Error parsing SSE event:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      setIsConnected(false);
      setError(new Error("Conexão perdida. Reconectando..."));
    };

    return () => {
      eventSource.close();
    };
  }, [filters, onNewEvent, queryClient]);

  // Carregar eventos históricos (ao montar ou mudar filtros)
  useEffect(() => {
    const loadHistoricalEvents = async () => {
      try {
        const response = await jqelClient.query({
          schema: "system",
          operation: "select",
          entity: "event",
          where: buildWhereClause(filters),
          orderBy: ["timestamp:desc"],
          limit: 100
        });

        setEvents(response.records);
      } catch (err) {
        console.error("Error loading historical events:", err);
      }
    };

    loadHistoricalEvents();
  }, [filters]);

  return {
    events,
    isConnected,
    error,
    disconnect: () => eventSourceRef.current?.close()
  };
}

// Helper: Verificar se evento corresponde aos filtros
function matchesFilters(event: SystemEvent, filters?: EventFilters): boolean {
  if (!filters) return true;

  // Tipo
  if (filters.types && !filters.types.includes(event.type)) {
    return false;
  }

  // Categoria
  if (filters.categories && !filters.categories.includes(event.category)) {
    return false;
  }

  // Prioridade
  if (filters.priorities && !filters.priorities.includes(event.priority)) {
    return false;
  }

  // Origem
  if (filters.origins && event.origin && !filters.origins.includes(event.origin)) {
    return false;
  }

  // Busca textual
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    const title = (event.data.title || "").toLowerCase();
    const message = (event.data.message || "").toLowerCase();

    if (!title.includes(searchLower) && !message.includes(searchLower)) {
      return false;
    }
  }

  return true;
}
```

---

## 8. Roadmap de Implementação

### Fase 1: MVP (2-3 dias)
- [ ] Hook `useEventStream` com SSE
- [ ] Componente `<EventItem />` compacto
- [ ] Feed principal com scroll infinito
- [ ] Sidebar de filtros básicos
- [ ] Modo live com auto-scroll

### Fase 2: Filtros Avançados (1-2 dias)
- [ ] Filtros por período customizado
- [ ] Filtros por categoria/prioridade/origem
- [ ] Busca full-text
- [ ] Contadores de eventos por filtro
- [ ] Persistência de filtros (localStorage)

### Fase 3: Detalhes e Exportação (1-2 dias)
- [ ] Expandir/recolher eventos
- [ ] Visualização de payload JSON
- [ ] Copiar ID do evento
- [ ] Exportação (CSV, JSON, JSONL)
- [ ] Modal de exportação com opções

### Fase 4: Analytics (2 dias)
- [ ] Dashboard de estatísticas
- [ ] Gráfico de distribuição temporal
- [ ] Gráfico de distribuição por categoria
- [ ] Top origens
- [ ] Eventos mais frequentes

### Fase 5: Polish (1 dia)
- [ ] Responsive design
- [ ] Acessibilidade completa
- [ ] Animações suaves
- [ ] Performance (virtual scroll)
- [ ] Loading states

**Tempo total: 7-10 dias**

---

## 9. Checklist de Validação

### Funcionalidades Obrigatórias
- [ ] Feed em tempo real via SSE
- [ ] Filtros por tipo/categoria/prioridade/origem
- [ ] Busca full-text
- [ ] Modo live com auto-scroll
- [ ] Expandir detalhes do evento
- [ ] Exportação de eventos

### Funcionalidades Opcionais
- [ ] Analytics dashboard
- [ ] Gráficos de distribuição
- [ ] Agrupamento de eventos similares
- [ ] Notificações para eventos urgentes
- [ ] Salvar filtros como presets

### Performance
- [ ] SSE reconnect automático
- [ ] Carrega 100 eventos em <500ms
- [ ] Virtual scroll para >500 eventos
- [ ] Debounce em busca

### Acessibilidade
- [ ] ARIA labels completos
- [ ] Navegação por teclado
- [ ] Screen reader friendly
- [ ] Contraste WCAG AA

### Responsive
- [ ] Mobile: Filtros colapsáveis
- [ ] Tablet: Layout adaptado
- [ ] Desktop: Sidebar fixa

---

*Este documento especifica todas as interfaces UI/UX do módulo Notification-Events. A implementação segue as diretrizes em `spec/SPEC-events.md` e `spec/SPEC-architecture.md`.*
