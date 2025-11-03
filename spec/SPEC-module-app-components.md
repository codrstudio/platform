# SPEC-module-app-components.md

## Especificação: Módulo App Components

### Escopo
Este documento especifica o módulo "App Components", que fornece componentes especializados para construção de aplicativos robustos (dashboards, CRUDs, helpdesks, kanbans).

---

## 1. Propósito

### Definição
O módulo App Components é um módulo de componentes que habilita a plataforma para desenvolvimento de aplicativos complexos.

### Diferencial

**SPEC-MAC-001:** Sem este módulo, a plataforma DEVE ser capaz de servir apenas sites simples (landing pages, portais informativos)

**SPEC-MAC-002:** Com este módulo ativado, a plataforma DEVE ganhar capacidade para aplicativos com tabelas avançadas, gráficos, calendários, drag-and-drop, edição rica e upload de arquivos

**SPEC-MAC-003:** Este módulo NÃO DEVE ser obrigatório para funcionamento básico da plataforma

---

## 2. Identificação

**SPEC-MAC-004:** O identificador do módulo (`moduleId`) DEVE ser `"app-components"`

**SPEC-MAC-005:** O tipo do módulo DEVE ser `"components"`

**SPEC-MAC-006:** O módulo NÃO DEVE ter dependências de outros módulos

---

## 3. Bibliotecas Incluídas

### Requisitos de Inclusão

**SPEC-MAC-007:** O módulo DEVE incluir as seguintes bibliotecas:

| Biblioteca | Versão Mínima | Propósito |
|------------|---------------|-----------|
| Recharts | - | Gráficos e visualizações de dados |
| TanStack Table | v8+ | Tabelas com sorting, filtering, pagination |
| FullCalendar | v6+ | Calendários e agendamentos |
| @dnd-kit | - | Drag and drop (kanbans, reordenação) |
| TipTap | v2+ | Rich text editor |
| react-dropzone | - | Upload de arquivos e imagens |
| @tanstack/react-virtual | - | Virtualização para listas grandes |
| react-colorful | - | Color picker |

**SPEC-MAC-008:** Todas as bibliotecas DEVEM ser carregadas via lazy loading quando o módulo é ativado

**SPEC-MAC-009:** As bibliotecas DEVEM estar disponíveis globalmente para todos os módulos do portal onde App Components está ativo

---

## 4. Exportações

### Componentes Exportados

**SPEC-MAC-010:** O módulo DEVE exportar todos os componentes principais das bibliotecas incluídas

**SPEC-MAC-011:** Componentes DEVEM ser importáveis via caminho consistente:
```typescript
import { BarChart, LineChart } from '@platform/app-components/recharts';
import { useReactTable } from '@platform/app-components/table';
import { Calendar } from '@platform/app-components/calendar';
```

### Configurações e Utilities

**SPEC-MAC-012:** O módulo DEVE exportar utilities de configuração para integração com tema da plataforma

**SPEC-MAC-013:** Componentes DEVEM respeitar automaticamente:
- Tema claro/escuro do portal
- Brand color do portal
- Tokens de design do shadcn/ui

---

## 5. Ativação e Carregamento

### Ativação no Portal

**SPEC-MAC-014:** O módulo PODE ser ativado em qualquer portal

**SPEC-MAC-015:** Um portal SEM App Components ativo NÃO DEVE carregar as bibliotecas do módulo

**SPEC-MAC-016:** Múltiplos portais PODEM ter App Components ativo simultaneamente

### Lazy Loading

**SPEC-MAC-017:** Na abertura do portal, se App Components está ativo, o módulo DEVE ser carregado automaticamente

**SPEC-MAC-018:** O carregamento DEVE usar code splitting para cada biblioteca

**SPEC-MAC-019:** Bibliotecas não utilizadas por outros módulos ativos NÃO DEVEM ser baixadas

**SPEC-MAC-020:** Ativação em runtime DEVE disparar download imediato do módulo

---

## 6. Instâncias

### Requisitos de Instâncias

**SPEC-MAC-021:** App Components NÃO cria instâncias

**SPEC-MAC-022:** App Components NÃO gera rotas

**SPEC-MAC-023:** App Components APENAS disponibiliza componentes para uso por outros módulos

---

## 7. Dependências

### Módulos que Dependem de App Components

**SPEC-MAC-024:** Os seguintes módulos DEVEM declarar dependência de App Components:
- Dashboard
- Kanban
- Qualquer módulo que use tabelas/gráficos/calendários

**SPEC-MAC-025:** Ativação desses módulos DEVE ativar automaticamente App Components

---

## 8. Integração com Tema

### Personalização Visual

**SPEC-MAC-026:** Todos os componentes DEVEM respeitar o tema do portal (claro/escuro)

**SPEC-MAC-027:** Componentes que suportam cores DEVEM usar brand color do portal como cor primária

**SPEC-MAC-028:** Componentes DEVEM usar tokens de cor do shadcn/ui para consistência visual

### Configuração de Tema

**SPEC-MAC-029:** O módulo DEVE exportar função de configuração de tema:
```typescript
configureAppComponents({
  theme: 'dark' | 'light',
  brandColor: string,
  tokens: DesignTokens
})
```

**SPEC-MAC-030:** A configuração DEVE ser aplicada automaticamente quando portal muda tema ou brand color

---

## 9. Performance

### Requisitos de Carregamento

**SPEC-MAC-031:** O bundle completo do módulo NÃO DEVE exceder 800KB (gzipped)

**SPEC-MAC-032:** Cada biblioteca DEVE ser um chunk separado para otimizar carregamento sob demanda

**SPEC-MAC-033:** Tree shaking DEVE remover código não utilizado em produção

---

## 10. Casos de Uso

### Exemplos de Aplicação

**Dashboard com gráficos:**
```typescript
import { BarChart, LineChart } from '@platform/app-components/recharts';

// Componente usa Recharts diretamente
```

**CRUD com tabela avançada:**
```typescript
import { useReactTable } from '@platform/app-components/table';

// Tabela com sorting, filtering, pagination
```

**Sistema de agendamento:**
```typescript
import { Calendar } from '@platform/app-components/calendar';

// Calendário com eventos, drag-to-reschedule
```

**Kanban board:**
```typescript
import { DndContext, useDraggable } from '@platform/app-components/dnd';

// Drag and drop entre colunas
```

**Editor de conteúdo:**
```typescript
import { useEditor } from '@platform/app-components/tiptap';

// Rich text editor com formatação
```

---

## 11. Versionamento

**SPEC-MAC-034:** O módulo DEVE ter versionamento independente da plataforma

**SPEC-MAC-035:** Atualizações de bibliotecas internas NÃO DEVEM quebrar API exportada do módulo

**SPEC-MAC-036:** Mudanças breaking DEVEM incrementar major version do módulo

---

## 12. Testes

**SPEC-MAC-037:** Cada biblioteca incluída DEVE ter testes de integração com tema da plataforma

**SPEC-MAC-038:** Testes DEVEM validar:
- Aplicação correta de tema claro/escuro
- Uso de brand color
- Lazy loading funcional
- Tree shaking efetivo

---

## 13. Documentação de Uso

**SPEC-MAC-039:** O módulo DEVE incluir documentação com:
- Lista de todos os componentes exportados
- Exemplos de uso de cada biblioteca
- Guia de integração com tema
- Padrões recomendados

---

*Esta especificação define os requisitos do módulo App Components. Implementação técnica deve seguir estes requisitos.*