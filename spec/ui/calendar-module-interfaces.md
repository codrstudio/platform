# Calendar Module - UI/UX Interfaces

## Overview

O módulo **Calendar** fornece interfaces completas de calendário para gerenciamento de eventos, compromissos e agendamentos. Integra-se com **FullCalendar** (do módulo app-components) para fornecer visualizações ricas e interativas.

**Características principais:**
- Visualização mensal (grade completa)
- Visualização semanal (timeline detalhada)
- Visualização diária (agenda do dia)
- Criar/editar/excluir eventos
- Drag & drop para reagendar
- Recorrência de eventos
- Categorização por cores
- Integração com JQEL para persistência
- Exportação para iCalendar (.ics)
- Responsivo (mobile/tablet/desktop)

**Dependências:**
- `app-components` (FullCalendar, formulários)
- `auth` (proteção de rotas, permissões)

---

## 1. Visualização Mensal (Month View)

### 1.1 Layout Desktop (≥1024px)

```
┌─────────────────────────────────────────────────────────────────────┐
│ ◀ Novembro 2025 ▶          [Mês] [Semana] [Dia] [Hoje]  [+ Evento] │ ← Header
├─────────────────────────────────────────────────────────────────────┤
│  Dom    Seg    Ter    Qua    Qui    Sex    Sáb                     │ ← Header dias
├────────┬────────┬────────┬────────┬────────┬────────┬────────────────┤
│   26   │   27   │   28   │   29   │   30   │   31   │    1         │
│        │        │        │        │        │        │ ──────────   │
│        │        │        │        │        │        │ 09:00        │
│        │        │        │        │        │        │ Reunião...   │
│        │        │        │        │        │        │ [🔵]         │
├────────┼────────┼────────┼────────┼────────┼────────┼────────────────┤
│   2    │   3    │   4    │   5    │   6    │   7    │    8         │
│        │ ────── │ ────── │ ────── │ ────── │        │              │
│        │ 10:00  │ Sprint │ Sprint │ Sprint │        │              │
│        │ Daily  │ Review │ Planning│ Retro │        │              │
│        │ [🟢]   │ [🟢]   │ [🟢]   │ [🟢]   │        │              │
├────────┼────────┼────────┼────────┼────────┼────────┼────────────────┤
│   9    │   10   │   11   │   12   │   13   │   14   │   15         │
│        │ ────── │        │ ────── │        │        │              │
│        │ 14:00  │        │ 15:00  │        │        │              │
│        │ Design │        │ Cliente│        │        │              │
│        │ Review │        │ Demo   │        │        │              │
│        │ [🟡]   │        │ [🔴]   │        │        │              │
├────────┼────────┼────────┼────────┼────────┼────────┼────────────────┤
│   16   │   17   │   18   │   19   │   20   │   21   │   22         │
│        │        │        │        │        │        │              │
├────────┼────────┼────────┼────────┼────────┼────────┼────────────────┤
│   23   │   24   │   25   │   26   │   27   │   28   │   29         │
│        │        │        │        │        │        │              │
└────────┴────────┴────────┴────────┴────────┴────────┴────────────────┘

Legenda:
🔵 Trabalho  🟢 Reuniões  🟡 Design  🔴 Cliente
```

**Características:**
- **Grade 7x5**: Semanas em linhas, dias em colunas
- **Dias de outros meses**: Cinza claro, texto `text-muted-foreground`
- **Dia atual**: Border azul destacado, `bg-primary-50`
- **Eventos**: Máximo 3 visíveis por dia, resto como "+2 mais"
- **Cores**: Badge circular colorido por categoria
- **Hover**: Destaque do dia com `bg-muted`
- **Click dia**: Abre modal para criar evento naquele dia
- **Click evento**: Abre modal de detalhes/edição

### 1.2 Layout Mobile (<768px)

```
┌────────────────────────────────┐
│ ☰  Nov 2025  [+]      [⋮]     │ ← Header compacto
├────────────────────────────────┤
│ D  S  T  Q  Q  S  S           │ ← Dias abreviados
├────────────────────────────────┤
│ 26 27 28 29 30 31 01          │
│
│ 02 03 04 05 06 07 08          │
│    ●  ●  ●  ●                 │ ← Indicadores de eventos
│                                │
│ 09 10 11 12 13 14 15          │
│    ●     ●                     │
│                                │
│ 16 17 18 19 20 21 22          │
│                                │
│                                │
│ 23 24 25 26 27 28 29          │
│                                │
├────────────────────────────────┤
│ Eventos hoje (03 Nov):         │ ← Lista de eventos do dia selecionado
│                                │
│ ┌────────────────────────────┐ │
│ │ 🟢 10:00 - 10:30           │ │
│ │ Daily Standup              │ │
│ └────────────────────────────┘ │
│                                │
│ ┌────────────────────────────┐ │
│ │ 🔵 14:00 - 15:00           │ │
│ │ Reunião de Planejamento    │ │
│ └────────────────────────────┘ │
└────────────────────────────────┘
```

**Características mobile:**
- **Grade compacta**: Dias como números pequenos
- **Indicadores**: Pontos coloridos em vez de blocos de texto
- **Lista separada**: Eventos do dia selecionado abaixo da grade
- **Tap no dia**: Seleciona dia e mostra eventos na lista
- **Tap no evento**: Abre modal de detalhes

---

## 2. Visualização Semanal (Week View)

### 2.1 Layout Desktop

```
┌─────────────────────────────────────────────────────────────────────┐
│ ◀ 3-9 Nov 2025 ▶            [Mês] [Semana] [Dia] [Hoje]  [+ Evento]│
├─────────────────────────────────────────────────────────────────────┤
│      │ Dom 3 │ Seg 4 │ Ter 5 │ Qua 6 │ Qui 7 │ Sex 8 │ Sáb 9       │
├──────┼───────┼───────┼───────┼───────┼───────┼───────┼──────────────┤
│ 08:00│       │       │       │       │       │       │              │
│ 09:00│ ┌───┐ │       │       │       │       │       │              │
│      │ │🔵 │ │       │       │       │       │       │              │
│ 10:00│ │Reu│ │ ┌─┐   │ ┌─┐   │ ┌─┐   │ ┌─┐   │       │              │
│      │ │nião│ │ │🟢│   │ │🟢│   │ │🟢│   │ │🟢│   │       │              │
│ 11:00│ └───┘ │ │D│   │ │S│   │ │S│   │ │S│   │       │              │
│      │       │ │a│   │ │p│   │ │p│   │ │R│   │       │              │
│ 12:00│       │ │i│   │ │r│   │ │l│   │ │e│   │       │              │
│      │       │ │l│   │ │i│   │ │a│   │ │t│   │       │              │
│ 13:00│       │ │y│   │ │n│   │ │n│   │ │r│   │       │              │
│      │       │ └─┘   │ │t│   │ │n│   │ │o│   │       │              │
│ 14:00│       │       │ │R│   │ │i│   │ └─┘   │ ┌───┐ │              │
│      │       │       │ │e│   │ │n│   │       │ │🟡 │ │              │
│ 15:00│       │       │ │v│   │ │g│   │ ┌───┐ │ │Des│ │              │
│      │       │       │ │i│   │ └─┘   │ │🔴 │ │ │ign│ │              │
│ 16:00│       │       │ │e│   │       │ │Cli│ │ └───┘ │              │
│      │       │       │ │w│   │       │ │ent│ │       │              │
│ 17:00│       │       │ └─┘   │       │ │e  │ │       │              │
│      │       │       │       │       │ └───┘ │       │              │
│ 18:00│       │       │       │       │       │       │              │
└──────┴───────┴───────┴───────┴───────┴───────┴───────┴──────────────┘
```

**Características:**
- **Timeline vertical**: Eixo Y = horários (06:00-22:00 configurável)
- **Colunas**: Uma por dia da semana
- **Blocos de eventos**: Altura proporcional à duração
- **Eventos simultâneos**: Lado a lado com width reduzido
- **Drag & drop**: Arrastar evento para outro horário/dia
- **Resize**: Redimensionar evento pelas bordas para ajustar duração
- **Horário de trabalho**: `bg-background`, fora do horário `bg-muted/30`
- **Hora atual**: Linha vermelha horizontal (se semana atual)

### 2.2 Layout Mobile

```
┌────────────────────────────────┐
│ ☰  3-9 Nov 2025  [+]    [⋮]   │
├────────────────────────────────┤
│ [Dom][Seg][Ter][Qua][Qui][Sex]│ ← Tabs para selecionar dia
│   3   4    5    6    7    8   │
├────────────────────────────────┤
│ Segunda-feira, 4 de Novembro   │ ← Dia selecionado
├────────────────────────────────┤
│ 08:00                          │
│ 09:00                          │
│ 10:00 ┌──────────────────────┐ │
│       │ 🟢 Daily Standup     │ │
│ 10:30 └──────────────────────┘ │
│ 11:00                          │
│ 12:00                          │
│ 13:00                          │
│ 14:00 ┌──────────────────────┐ │
│       │ 🔵 Reunião Semanal   │ │
│ 15:00 └──────────────────────┘ │
│ 16:00                          │
│ 17:00                          │
│ 18:00                          │
└────────────────────────────────┘
```

**Características mobile:**
- **Tabs horizontais**: Navegação entre dias da semana
- **Timeline simplificada**: Um dia por vez em tela cheia
- **Tap evento**: Abre modal de detalhes
- **Long press**: Menu contextual (editar, excluir, duplicar)

---

## 3. Visualização Diária (Day View)

### 3.1 Layout Desktop

```
┌─────────────────────────────────────────────────────────────────────┐
│ ◀ Segunda, 4 de Nov 2025 ▶     [Mês] [Semana] [Dia] [Hoje] [+ Evento]│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ 06:00 ────────────────────────────────────────────────────────────  │
│ 07:00 ────────────────────────────────────────────────────────────  │
│ 08:00 ────────────────────────────────────────────────────────────  │
│       ┌─────────────────────────────────────────────────────────┐  │
│ 09:00 │ 🔵 Reunião de Planejamento                             │  │
│       │                                                         │  │
│ 10:00 │ Local: Sala de Conferências A                          │  │
│       │ Participantes: João, Maria, Pedro                      │  │
│ 11:00 └─────────────────────────────────────────────────────────┘  │
│       ┌───────────────────────────────────────────┐                │
│ 12:00 │ 🟢 Daily Standup                          │                │
│ 12:30 └───────────────────────────────────────────┘                │
│ 13:00 ────────────────────────────────────────────────────────────  │
│ 14:00 ────────────────────────────────────────────────────────────  │
│       ┌─────────────────────────────────────────────────────────┐  │
│ 15:00 │ 🟡 Sessão de Design                                     │  │
│       │                                                         │  │
│ 16:00 │ Revisar protótipos do novo módulo                      │  │
│       └─────────────────────────────────────────────────────────┘  │
│ 17:00 ────────────────────────────────────────────────────────────  │
│ 18:00 ────────────────────────────────────────────────────────────  │
│       ┌───────────────────────────────────────────┐                │
│ 19:00 │ 🔴 Cliente: Apresentação Final            │                │
│ 20:00 └───────────────────────────────────────────┘                │
│ 21:00 ────────────────────────────────────────────────────────────  │
│ 22:00 ────────────────────────────────────────────────────────────  │
└─────────────────────────────────────────────────────────────────────┘
```

**Características:**
- **Timeline detalhada**: Intervalos de 30 min ou 1h (configurável)
- **Eventos expandidos**: Mostram título + descrição + detalhes
- **Hora atual**: Linha vermelha com label (se dia atual)
- **Click em espaço vazio**: Criar evento naquele horário
- **Double-click evento**: Abrir modal de edição

---

## 4. Formulário de Evento (Create/Edit Event)

### 4.1 Modal Desktop

```
┌─────────────────────────────────────────────────────────────────────┐
│ Novo Evento                                                    [X]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ Título *                                                            │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Reunião de Planejamento Sprint 15                               │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ Data e Hora *                                                       │
│ ┌──────────────────────┐  ┌──────────┐  até  ┌──────────┐         │
│ │ 04/11/2025          │  │ 09:00   │      │ 11:00   │         │
│ └──────────────────────┘  └──────────┘      └──────────┘         │
│                                                                     │
│ ☑ Dia inteiro                                                       │
│                                                                     │
│ Categoria *                                                         │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ [🔵] Trabalho        ▼                                          │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ Local                                                               │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Sala de Conferências A                                          │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ Descrição                                                           │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Planejamento das tarefas do Sprint 15.                          │ │
│ │ Revisar backlog e estimar stories.                              │ │
│ │                                                                 │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ Participantes                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ João Silva, Maria Souza, Pedro Costa              [+ Adicionar] │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ Recorrência                                                         │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Não se repete                                                 ▼│ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ Lembrete                                                            │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ 15 minutos antes                                              ▼│ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ☐ Evento privado                                                    │
│                                                                     │
│                                   [Cancelar]  [Salvar]             │
└─────────────────────────────────────────────────────────────────────┘
```

**Campos:**
- **Título** (obrigatório): Input texto, max 100 caracteres
- **Data e Hora** (obrigatório): Date picker + time picker
- **Dia inteiro**: Checkbox, remove seleção de hora
- **Categoria** (obrigatório): Select com cores, categorias configuráveis
- **Local**: Input texto opcional
- **Descrição**: Textarea opcional, suporta Markdown
- **Participantes**: Multi-select com autocompletar (busca usuários)
- **Recorrência**: Select (não repete, diária, semanal, mensal, anual, customizada)
- **Lembrete**: Select (5min, 15min, 30min, 1h, 1dia antes)
- **Privado**: Checkbox, oculta detalhes para outros usuários

### 4.2 Recorrência Avançada

Quando seleciona "Customizada" em Recorrência:

```
┌─────────────────────────────────────────────┐
│ Recorrência Customizada                     │
├─────────────────────────────────────────────┤
│                                             │
│ Repetir a cada:                             │
│ ┌───┐  ┌──────────────────────────────────┐ │
│ │ 1 │  │ Semana(s)                      ▼│ │
│ └───┘  └──────────────────────────────────┘ │
│                                             │
│ Repetir em:                                 │
│ [D] [S] [T] [Q] [Q] [S] [S]                │
│                                             │
│ Termina:                                    │
│ ○ Nunca                                     │
│ ○ Após  ┌───┐  ocorrências                 │
│         │ 10│                               │
│         └───┘                               │
│ ● Em    ┌──────────────┐                    │
│         │ 31/12/2025   │                    │
│         └──────────────┘                    │
│                                             │
│               [Cancelar]  [Aplicar]         │
└─────────────────────────────────────────────┘
```

### 4.3 Validação de Formulário

**Regras:**
- Título: Obrigatório, 1-100 caracteres
- Data inicial: Obrigatória
- Data final: Deve ser >= data inicial
- Categoria: Obrigatória
- Se "Dia inteiro" = true, horários são ignorados

**Mensagens de erro:**
```typescript
{
  title: "O título é obrigatório",
  startDate: "Selecione a data de início",
  endDate: "A data final deve ser posterior à data inicial",
  category: "Selecione uma categoria"
}
```

---

## 5. Detalhes do Evento (View Event)

### 5.1 Modal de Detalhes

```
┌─────────────────────────────────────────────────────────────────────┐
│ Reunião de Planejamento Sprint 15                        [Editar][X]│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ 🔵 Trabalho                                                         │
│                                                                     │
│ 📅 Segunda-feira, 4 de Novembro de 2025                            │
│ 🕐 09:00 - 11:00 (2 horas)                                         │
│                                                                     │
│ 📍 Local                                                            │
│    Sala de Conferências A                                          │
│                                                                     │
│ 👥 Participantes (3)                                                │
│    João Silva, Maria Souza, Pedro Costa                            │
│                                                                     │
│ 📝 Descrição                                                        │
│    Planejamento das tarefas do Sprint 15.                          │
│    Revisar backlog e estimar stories.                              │
│                                                                     │
│ 🔔 Lembrete                                                         │
│    15 minutos antes (08:45)                                        │
│                                                                     │
│ 🔁 Recorrência                                                      │
│    Semanalmente às segundas-feiras                                 │
│                                                                     │
│ ────────────────────────────────────────────────────────────────   │
│                                                                     │
│ Criado por: João Silva em 01/11/2025 14:30                        │
│ Última edição: Maria Souza em 02/11/2025 09:15                    │
│                                                                     │
│                      [Excluir]  [Duplicar]  [Exportar .ics]        │
└─────────────────────────────────────────────────────────────────────┘
```

**Ações:**
- **Editar**: Abre modal de edição
- **Excluir**: Confirmação antes de deletar
- **Duplicar**: Cria cópia do evento para outra data
- **Exportar .ics**: Download do evento em formato iCalendar

---

## 6. Sidebar de Categorias

### 6.1 Layout

```
┌────────────────────────┐
│ Minhas Categorias      │
├────────────────────────┤
│ ☑ 🔵 Trabalho      (15)│ ← Checkbox + cor + nome + count
│ ☑ 🟢 Reuniões      (8) │
│ ☑ 🟡 Design        (5) │
│ ☑ 🔴 Cliente       (3) │
│ ☐ 🟣 Pessoal       (2) │ ← Desmarcada = oculta do calendário
│                        │
│ [+ Nova Categoria]     │
├────────────────────────┤
│ Outros Calendários     │
├────────────────────────┤
│ ☑ Feriados Brasil      │
│ ☐ Aniversários         │
└────────────────────────┘
```

**Características:**
- **Toggle visibility**: Marcar/desmarcar checkbox filtra eventos
- **Contador**: Número de eventos na categoria no período visível
- **Cores**: Badge circular com cor da categoria
- **Nova categoria**: Modal para criar categoria customizada

### 6.2 Criar Categoria

```
┌─────────────────────────────────┐
│ Nova Categoria             [X]  │
├─────────────────────────────────┤
│                                 │
│ Nome *                          │
│ ┌─────────────────────────────┐ │
│ │ Marketing                   │ │
│ └─────────────────────────────┘ │
│                                 │
│ Cor *                           │
│ [🔵][🟢][🟡][🔴][🟣][🟠][🟤]    │
│                                 │
│ Visível por padrão              │
│ ☑ Mostrar eventos desta categoria│
│                                 │
│          [Cancelar]  [Criar]    │
└─────────────────────────────────┘
```

---

## 7. Drag & Drop

### 7.1 Comportamento

**Arrastar evento:**
1. Usuário clica e segura no evento
2. Evento ganha `opacity-50` e `cursor-grabbing`
3. Fantasma do evento segue o cursor
4. Drop zones válidas ganham `bg-primary-50` (highlight)
5. Soltar atualiza data/hora do evento
6. Confirmação visual com toast: "Evento reagendado para [nova data]"

**Redimensionar evento (Week/Day view):**
1. Hover na borda superior/inferior do evento
2. Cursor muda para `cursor-ns-resize`
3. Arrastar ajusta duração
4. Toast: "Duração atualizada para [X horas]"

### 7.2 Validações

**Regras:**
- Não permitir drop em datas passadas (opcional, configurável)
- Validar conflitos de horário (warning, não bloqueia)
- Eventos de dia inteiro só podem ser dropados em outros dias inteiros

**Confirmações:**
```typescript
// Evento recorrente
"Este evento se repete. Deseja atualizar:"
- [ ] Apenas esta ocorrência
- [ ] Esta e as próximas ocorrências
- [ ] Todas as ocorrências

[Cancelar] [Confirmar]
```

---

## 8. Responsividade

### 8.1 Breakpoints

| Breakpoint | Width | Ajustes |
|------------|-------|---------|
| Mobile     | <768px | Visualização compacta, lista de eventos separada |
| Tablet     | 768-1024px | Sidebar opcional (toggle), eventos com menos detalhes |
| Desktop    | ≥1024px | Sidebar fixa, todos os detalhes visíveis |

### 8.2 Mobile Específico

**Gestos:**
- **Swipe left/right**: Navegar entre dias/semanas/meses
- **Pinch zoom**: Ajustar zoom da timeline (week/day view)
- **Long press**: Menu contextual (editar, excluir, duplicar)

**Header compacto:**
- Menu hamburguer para sidebar de categorias
- Botão "+" para criar evento
- Seletor de visualização como dropdown

---

## 9. Integração com JQEL

### 9.1 Carregar Eventos

```typescript
const { data: events } = useJQELQuery({
  schema: "calendar",
  operation: "select",
  entity: "event",
  where: {
    startDate: { $gte: startOfMonth },
    endDate: { $lte: endOfMonth }
  },
  orderBy: ["startDate", "ASC"]
});
```

### 9.2 Criar Evento

```typescript
const createEventMutation = useJQELMutation();

const createEvent = async (event: CalendarEvent) => {
  await createEventMutation.mutateAsync({
    schema: "calendar",
    entity: "event",
    action: "insert",
    values: event
  });
};
```

### 9.3 Atualizar Evento (Drag & Drop)

```typescript
const updateEventMutation = useJQELMutation();

const rescheduleEvent = async (eventId: string, newStartDate: string) => {
  await updateEventMutation.mutateAsync({
    schema: "calendar",
    entity: "event",
    action: "update",
    where: { id: { $eq: eventId } },
    values: { startDate: newStartDate }
  });
};
```

### 9.4 Eventos Recorrentes

**Estrutura:**
```typescript
interface RecurringEvent {
  id: string;
  recurrenceRule: string; // RRULE format (RFC 5545)
  recurrenceEnd?: string;
  recurrenceCount?: number;
}

// Exemplo: Semanalmente às segundas-feiras
recurrenceRule: "FREQ=WEEKLY;BYDAY=MO"

// Exemplo: A cada 2 semanas por 10 ocorrências
recurrenceRule: "FREQ=WEEKLY;INTERVAL=2;COUNT=10"
```

---

## 10. Exportação e Importação

### 10.1 Exportar para .ics

```typescript
function exportToICS(event: CalendarEvent): string {
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Platform Calendar//EN
BEGIN:VEVENT
UID:${event.id}
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(event.startDate)}
DTEND:${formatICSDate(event.endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ""}
LOCATION:${event.location || ""}
${event.recurrenceRule ? `RRULE:${event.recurrenceRule}` : ""}
END:VEVENT
END:VCALENDAR`;
}

// Download
const blob = new Blob([icsContent], { type: "text/calendar" });
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = `${event.title}.ics`;
a.click();
```

### 10.2 Importar de .ics

```
┌─────────────────────────────────┐
│ Importar Eventos           [X]  │
├─────────────────────────────────┤
│                                 │
│ Arraste um arquivo .ics aqui    │
│ ou clique para selecionar       │
│                                 │
│ ┌─────────────────────────────┐ │
│ │  📄  Soltar arquivo aqui    │ │
│ └─────────────────────────────┘ │
│                                 │
│ Categoria de destino:           │
│ ┌─────────────────────────────┐ │
│ │ Trabalho                  ▼ │ │
│ └─────────────────────────────┘ │
│                                 │
│          [Cancelar]  [Importar] │
└─────────────────────────────────┘

Após upload:
┌─────────────────────────────────┐
│ Importar Eventos           [X]  │
├─────────────────────────────────┤
│                                 │
│ ✓ Arquivo processado            │
│                                 │
│ Encontrados: 15 eventos         │
│                                 │
│ ☑ Reunião Semanal (10 ocorr.)   │
│ ☑ Daily Standup (20 ocorr.)     │
│ ☑ Almoço com Cliente            │
│ ☐ Evento Duplicado (já existe)  │
│                                 │
│ 3 selecionados para importar    │
│                                 │
│          [Cancelar]  [Importar] │
└─────────────────────────────────┘
```

---

## 11. Acessibilidade

### 11.1 Navegação por Teclado

**Atalhos:**
- `Tab`: Navegar entre eventos e controles
- `Arrow keys`: Navegar pela grade do calendário
- `Enter`: Abrir detalhes do evento selecionado
- `Ctrl/Cmd + N`: Criar novo evento
- `Ctrl/Cmd + E`: Editar evento selecionado
- `Delete`: Excluir evento selecionado
- `T`: Ir para hoje
- `M/W/D`: Mudar para visualização Mês/Semana/Dia

### 11.2 Screen Readers

**ARIA Labels:**
```typescript
<div
  role="grid"
  aria-label="Calendário de Novembro 2025"
  aria-describedby="calendar-instructions"
>
  <div role="row" aria-label="Semana de 3 a 9 de Novembro">
    <div
      role="gridcell"
      aria-label="Segunda-feira, 4 de Novembro, 2 eventos"
      aria-selected={isSelected}
    >
      <button aria-label="Reunião de Planejamento às 9:00">
        Reunião...
      </button>
    </div>
  </div>
</div>

<div id="calendar-instructions" className="sr-only">
  Use as setas para navegar pelo calendário.
  Pressione Enter para abrir detalhes do evento.
</div>
```

### 11.3 Contraste e Cores

**WCAG 2.1 AA:**
- Categorias: Cores com contraste 4.5:1 mínimo
- Eventos: Texto preto/branco dependendo do background
- Focus: Anel azul 2px em eventos e controles
- Hover: `bg-muted` com transição suave

---

## 12. Performance

### 12.1 Virtualização (Month View)

Para calendários com muitos eventos:
```typescript
import { useVirtualizer } from "@tanstack/react-virtual";

function VirtualizedMonthView({ events }: { events: CalendarEvent[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Agrupar eventos por dia
  const eventsByDay = useMemo(() => {
    return groupEventsByDay(events);
  }, [events]);

  // Virtualizar apenas os dias visíveis
  const virtualizer = useVirtualizer({
    count: 35, // 5 semanas x 7 dias
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // Altura estimada por dia
    overscan: 7 // Renderizar 1 semana extra
  });

  return (
    <div ref={parentRef} className="overflow-auto h-full">
      {/* Renderizar apenas células virtualizadas */}
    </div>
  );
}
```

### 12.2 Lazy Loading de Eventos

```typescript
// Carregar apenas eventos do mês visível
const { data: events } = useJQELQuery({
  schema: "calendar",
  operation: "select",
  entity: "event",
  where: {
    startDate: { $gte: currentMonth.start },
    endDate: { $lte: currentMonth.end }
  },
  // Query key inclui mês para cache separado
  queryKey: ["events", currentMonth.year, currentMonth.month]
});

// Prefetch do mês seguinte
useEffect(() => {
  queryClient.prefetchQuery({
    queryKey: ["events", nextMonth.year, nextMonth.month],
    queryFn: () => fetchEvents(nextMonth)
  });
}, [currentMonth]);
```

### 12.3 Debounce em Drag & Drop

```typescript
const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);

// Debounce do update para evitar múltiplas requisições
const debouncedUpdate = useMemo(
  () =>
    debounce((eventId: string, newDate: string) => {
      updateEventMutation.mutate({ eventId, newDate });
    }, 300),
  []
);

const handleDrop = (eventId: string, newDate: string) => {
  // Atualização otimista
  queryClient.setQueryData(["events"], (old) => {
    return old.map((e) =>
      e.id === eventId ? { ...e, startDate: newDate } : e
    );
  });

  // Debounced server update
  debouncedUpdate(eventId, newDate);
};
```

---

## 13. Código de Implementação

### 13.1 Componente Principal

```typescript
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useJQELQuery, useJQELMutation } from "@/services/jqel";
import { EventModal } from "./EventModal";
import { CategorySidebar } from "./CategorySidebar";

interface CalendarInterfaceProps {
  instanceConfig: CalendarInstanceConfig;
}

export function CalendarInterface({ instanceConfig }: CalendarInterfaceProps) {
  const [currentView, setCurrentView] = useState<"dayGridMonth" | "timeGridWeek" | "timeGridDay">(
    "dayGridMonth"
  );
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [visibleCategories, setVisibleCategories] = useState<string[]>([]);

  // Carregar eventos
  const { data: events } = useJQELQuery({
    schema: "calendar",
    operation: "select",
    entity: "event",
    orderBy: ["startDate", "ASC"]
  });

  // Carregar categorias
  const { data: categories } = useJQELQuery({
    schema: "calendar",
    operation: "select",
    entity: "category"
  });

  // Mutations
  const createEventMutation = useJQELMutation();
  const updateEventMutation = useJQELMutation();
  const deleteEventMutation = useJQELMutation();

  // Filtrar eventos por categorias visíveis
  const filteredEvents = useMemo(() => {
    if (!events?.records) return [];
    if (visibleCategories.length === 0) return events.records;

    return events.records.filter((event) =>
      visibleCategories.includes(event.categoryId)
    );
  }, [events, visibleCategories]);

  // Converter para formato FullCalendar
  const fullCalendarEvents = useMemo(() => {
    return filteredEvents.map((event) => ({
      id: event.id,
      title: event.title,
      start: event.startDate,
      end: event.endDate,
      allDay: event.allDay,
      backgroundColor: event.category?.color,
      extendedProps: event
    }));
  }, [filteredEvents]);

  // Handle event click
  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event.extendedProps);
    setIsEventModalOpen(true);
  };

  // Handle date click (criar evento)
  const handleDateClick = (info: any) => {
    setSelectedEvent({
      startDate: info.dateStr,
      endDate: info.dateStr,
      allDay: info.allDay
    } as CalendarEvent);
    setIsEventModalOpen(true);
  };

  // Handle event drop (drag & drop)
  const handleEventDrop = async (info: any) => {
    const eventId = info.event.id;
    const newStartDate = info.event.start.toISOString();
    const newEndDate = info.event.end?.toISOString();

    try {
      await updateEventMutation.mutateAsync({
        schema: "calendar",
        entity: "event",
        action: "update",
        where: { id: { $eq: eventId } },
        values: {
          startDate: newStartDate,
          endDate: newEndDate
        }
      });

      toast.success("Evento reagendado com sucesso!");
    } catch (error) {
      info.revert(); // Reverter se falhar
      toast.error("Erro ao reagendar evento");
    }
  };

  // Handle event resize
  const handleEventResize = async (info: any) => {
    const eventId = info.event.id;
    const newEndDate = info.event.end.toISOString();

    try {
      await updateEventMutation.mutateAsync({
        schema: "calendar",
        entity: "event",
        action: "update",
        where: { id: { $eq: eventId } },
        values: { endDate: newEndDate }
      });

      toast.success("Duração atualizada!");
    } catch (error) {
      info.revert();
      toast.error("Erro ao atualizar duração");
    }
  };

  // Save event (create/update)
  const handleSaveEvent = async (event: CalendarEvent) => {
    try {
      if (event.id) {
        // Update
        await updateEventMutation.mutateAsync({
          schema: "calendar",
          entity: "event",
          action: "update",
          where: { id: { $eq: event.id } },
          values: event
        });
        toast.success("Evento atualizado!");
      } else {
        // Create
        await createEventMutation.mutateAsync({
          schema: "calendar",
          entity: "event",
          action: "insert",
          values: event
        });
        toast.success("Evento criado!");
      }

      setIsEventModalOpen(false);
    } catch (error) {
      toast.error("Erro ao salvar evento");
    }
  };

  // Delete event
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Deseja realmente excluir este evento?")) return;

    try {
      await deleteEventMutation.mutateAsync({
        schema: "calendar",
        entity: "event",
        action: "delete",
        where: { id: { $eq: eventId } }
      });
      toast.success("Evento excluído!");
      setIsEventModalOpen(false);
    } catch (error) {
      toast.error("Erro ao excluir evento");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar de Categorias */}
      <CategorySidebar
        categories={categories?.records || []}
        visibleCategories={visibleCategories}
        onToggleCategory={(categoryId) => {
          setVisibleCategories((prev) =>
            prev.includes(categoryId)
              ? prev.filter((id) => id !== categoryId)
              : [...prev, categoryId]
          );
        }}
      />

      {/* Main Calendar */}
      <main className="flex-1 p-4">
        <div className="bg-card rounded-lg shadow p-4 h-full">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={currentView}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay"
            }}
            events={fullCalendarEvents}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={3}
            weekends={true}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            height="100%"
            locale="pt-br"
            buttonText={{
              today: "Hoje",
              month: "Mês",
              week: "Semana",
              day: "Dia"
            }}
          />
        </div>
      </main>

      {/* Event Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        event={selectedEvent}
        categories={categories?.records || []}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
}
```

### 13.2 Event Modal Component

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

const eventSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(100),
  startDate: z.string(),
  endDate: z.string(),
  allDay: z.boolean().default(false),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  location: z.string().optional(),
  description: z.string().optional(),
  participants: z.array(z.string()).optional(),
  recurrenceRule: z.string().optional(),
  reminder: z.string().optional(),
  isPrivate: z.boolean().default(false)
}).refine(
  (data) => new Date(data.endDate) >= new Date(data.startDate),
  {
    message: "Data final deve ser posterior à data inicial",
    path: ["endDate"]
  }
);

type EventFormData = z.infer<typeof eventSchema>;

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  categories: Category[];
  onSave: (event: CalendarEvent) => Promise<void>;
  onDelete?: (eventId: string) => Promise<void>;
}

export function EventModal({
  isOpen,
  onClose,
  event,
  categories,
  onSave,
  onDelete
}: EventModalProps) {
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: event || {
      allDay: false,
      isPrivate: false
    }
  });

  const onSubmit = async (data: EventFormData) => {
    await onSave({ ...event, ...data });
    form.reset();
  };

  const isEditMode = !!event?.id;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Evento" : "Novo Evento"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Título */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Reunião de Planejamento" />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Data e Hora */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Início *</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fim *</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Dia inteiro */}
            <FormField
              control={form.control}
              name="allDay"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Dia inteiro</FormLabel>
                </FormItem>
              )}
            />

            {/* Categoria */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria *</FormLabel>
                  <FormControl>
                    <Select {...field}>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Local */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Local</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Sala de Conferências A" />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Descrição */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Recorrência */}
            <FormField
              control={form.control}
              name="recurrenceRule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recorrência</FormLabel>
                  <FormControl>
                    <Select {...field}>
                      <option value="">Não se repete</option>
                      <option value="FREQ=DAILY">Diariamente</option>
                      <option value="FREQ=WEEKLY">Semanalmente</option>
                      <option value="FREQ=MONTHLY">Mensalmente</option>
                      <option value="FREQ=YEARLY">Anualmente</option>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Lembrete */}
            <FormField
              control={form.control}
              name="reminder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lembrete</FormLabel>
                  <FormControl>
                    <Select {...field}>
                      <option value="">Sem lembrete</option>
                      <option value="5">5 minutos antes</option>
                      <option value="15">15 minutos antes</option>
                      <option value="30">30 minutos antes</option>
                      <option value="60">1 hora antes</option>
                      <option value="1440">1 dia antes</option>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Privado */}
            <FormField
              control={form.control}
              name="isPrivate"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Evento privado</FormLabel>
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-between pt-4">
              <div>
                {isEditMode && onDelete && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => onDelete(event.id)}
                  >
                    Excluir
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {isEditMode ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 14. Roadmap de Implementação

### Fase 1: MVP (3-4 dias)
- [ ] Visualização Mensal com FullCalendar
- [ ] Formulário de criar/editar evento
- [ ] Integração JQEL (CRUD básico)
- [ ] Visualização de detalhes
- [ ] Categorias básicas (fixas)

### Fase 2: Funcionalidades Core (2-3 dias)
- [ ] Visualização Semanal
- [ ] Visualização Diária
- [ ] Drag & Drop para reagendar
- [ ] Resize para ajustar duração
- [ ] Sidebar de categorias com toggle

### Fase 3: Recorrência e Exportação (2 dias)
- [ ] Eventos recorrentes (RRULE)
- [ ] Exportação para .ics
- [ ] Importação de .ics
- [ ] Lembretes

### Fase 4: UX Avançado (2 dias)
- [ ] Responsive design (mobile/tablet)
- [ ] Gestos mobile (swipe, pinch zoom)
- [ ] Conflito de horários (warning)
- [ ] Quick actions (duplicar, mover para categoria)

### Fase 5: Performance e Acessibilidade (1-2 dias)
- [ ] Virtualização para muitos eventos
- [ ] Lazy loading por mês
- [ ] Navegação por teclado
- [ ] ARIA labels completos
- [ ] Contraste WCAG AA

**Tempo total: 10-13 dias**

---

## 15. Checklist de Validação

### Funcionalidades Obrigatórias
- [ ] Visualização Mensal funcional
- [ ] Visualização Semanal funcional
- [ ] Visualização Diária funcional
- [ ] Criar evento com validação
- [ ] Editar evento existente
- [ ] Excluir evento com confirmação
- [ ] Categorias com cores distintas
- [ ] Filtrar eventos por categoria

### Funcionalidades Opcionais
- [ ] Drag & drop para reagendar
- [ ] Resize para ajustar duração
- [ ] Eventos recorrentes (RRULE)
- [ ] Exportação para .ics
- [ ] Importação de .ics
- [ ] Lembretes configuráveis
- [ ] Eventos privados

### Performance
- [ ] Carrega mês em <500ms
- [ ] Drag & drop suave (60fps)
- [ ] Lazy load de eventos por mês
- [ ] Bundle <500KB gzipped

### Acessibilidade
- [ ] Navegação completa por teclado
- [ ] ARIA labels em todos elementos
- [ ] Screen reader friendly
- [ ] Contraste WCAG AA
- [ ] Focus indicators visíveis

### Responsive
- [ ] Mobile: Gestos touch funcionam
- [ ] Tablet: Layout adaptado
- [ ] Desktop: Sidebar fixa

---

*Este documento especifica todas as interfaces UI/UX do módulo Calendar. A implementação usa FullCalendar (do módulo app-components) e segue as diretrizes em `spec/SPEC-architecture.md`.*
