# SPEC-module-journey.md

## Especificação: Módulo Journey (Jornada Guiada)

### Escopo
Este documento especifica o módulo Journey, responsável por criar experiências de onboarding interativas e gamificadas através de jornadas guiadas progressivas.

---

## 1. Definição

### Propósito
O módulo Journey fornece um sistema de navegação guiada que conduz usuários através de sequências estruturadas de páginas/conceitos, rastreando progresso e fornecendo contexto educacional.

### Natureza
- **Tipo**: Módulo de Funcionalidade
- **Dependências**: Nenhuma (recomendado com MarkBrowser para documentação)
- **Opcional**: Sim

---

## 2. Conceitos Fundamentais

### Jornada

**SPEC-JOURNEY-C-001:** Jornada é uma sequência ordenada de etapas

**SPEC-JOURNEY-C-002:** Cada jornada DEVE ter identificador único no contexto da instância

**SPEC-JOURNEY-C-003:** Jornada DEVE ter título e descrição

### Etapa

**SPEC-JOURNEY-C-004:** Etapa é uma unidade de progresso na jornada

**SPEC-JOURNEY-C-005:** Cada etapa DEVE estar associada a uma página/rota ou ação

**SPEC-JOURNEY-C-006:** Etapas DEVEM ser ordenadas sequencialmente

**SPEC-JOURNEY-C-007:** Etapa PODE ter status: `pending`, `active`, `completed`

### Seção

**SPEC-JOURNEY-C-008:** Seções agrupam etapas relacionadas

**SPEC-JOURNEY-C-009:** Cada seção DEVE ter título

**SPEC-JOURNEY-C-010:** Seções DEVEM calcular progresso baseado em etapas concluídas

---

## 3. Componentes de Interface

### Guia da Jornada (Floating Guide)

**SPEC-JOURNEY-UI-001:** DEVE existir botão flutuante fixo na tela

**SPEC-JOURNEY-UI-002:** Botão DEVE exibir progresso geral (ex: "7 de 18 etapas")

**SPEC-JOURNEY-UI-003:** Botão DEVE ser posicionado em canto inferior da tela

**SPEC-JOURNEY-UI-004:** Ao clicar no botão, DEVE abrir Índice da Jornada

**SPEC-JOURNEY-UI-005:** Botão PODE exibir badge com número de etapas novas

### Modal de Etapa

**SPEC-JOURNEY-UI-006:** Ao chegar em nova etapa, PODE exibir modal explicativo

**SPEC-JOURNEY-UI-007:** Modal DEVE conter:
- Título da etapa
- Descrição/conteúdo explicativo
- Links para documentação (opcional)
- Botão "Continuar" para próxima etapa
- Botão "Pular" ou "Depois" (opcional)

**SPEC-JOURNEY-UI-008:** Modal NÃO DEVE bloquear navegação do usuário

**SPEC-JOURNEY-UI-009:** Usuário DEVE poder fechar modal e continuar usando o sistema

### Índice da Jornada (Sidebar/Modal)

**SPEC-JOURNEY-UI-010:** Índice DEVE exibir todas as seções e etapas

**SPEC-JOURNEY-UI-011:** Índice DEVE mostrar:
```
📍 Índice da Jornada
X de Y etapas concluídas (Z%)

● Seção 1                    4/4 ✓
  ✓ Etapa 1.1
  ✓ Etapa 1.2
  ✓ Etapa 1.3
  ✓ Etapa 1.4

● Seção 2                    2/5
  ✓ Etapa 2.1
  ✓ Etapa 2.2
  ○ Etapa 2.3  ← você está aqui
  ○ Etapa 2.4
  ○ Etapa 2.5
```

**SPEC-JOURNEY-UI-012:** Etapas concluídas DEVEM ter indicador visual (✓)

**SPEC-JOURNEY-UI-013:** Etapa atual DEVE estar destacada

**SPEC-JOURNEY-UI-014:** Etapas pendentes DEVEM ter indicador visual (○)

**SPEC-JOURNEY-UI-015:** Clicar em etapa DEVE navegar para página correspondente

**SPEC-JOURNEY-UI-016:** Progresso por seção DEVE ser exibido (ex: "4/4" ou barra)

**SPEC-JOURNEY-UI-017:** Progresso geral DEVE ser exibido no topo

### Modal de Conclusão

**SPEC-JOURNEY-UI-018:** Ao completar jornada, DEVE exibir modal de congratulação

**SPEC-JOURNEY-UI-019:** Modal de conclusão DEVE conter:
- Mensagem de parabéns
- Resumo do que foi aprendido (opcional)
- CTA configurável (botão de ação)
- Opção "Fechar"

**SPEC-JOURNEY-UI-020:** CTA DEVE ser configurado na instância (texto, ação, URL)

---

## 4. Estrutura de Dados

### Definição de Jornada

**SPEC-JOURNEY-D-001:** Jornada DEVE ser definida como:
```typescript
{
  journeyId: string;
  title: string;
  description?: string;
  sections: Section[];
  completionCTA?: {
    text: string;
    action: 'navigate' | 'external' | 'none';
    target?: string;
  };
}
```

### Definição de Seção

**SPEC-JOURNEY-D-002:** Seção DEVE ser definida como:
```typescript
{
  sectionId: string;
  title: string;
  steps: Step[];
}
```

### Definição de Etapa

**SPEC-JOURNEY-D-003:** Etapa DEVE ser definida como:
```typescript
{
  stepId: string;
  title: string;
  description?: string;
  type: 'page' | 'action';
  target?: string;           // URL ou action identifier
  modal?: {
    title: string;
    content: string;         // Markdown suportado
    links?: Array<{
      text: string;
      url: string;
    }>;
  };
  autoComplete?: boolean;    // Marca como completa automaticamente
}
```

---

## 5. Rastreamento de Progresso

### Armazenamento

**SPEC-JOURNEY-P-001:** Progresso DEVE ser armazenado por usuário

**SPEC-JOURNEY-P-002:** Progresso DEVE persistir entre sessões

**SPEC-JOURNEY-P-003:** Progresso DEVE ser armazenado via JQEL (schema configurável)

**SPEC-JOURNEY-P-004:** Estrutura de progresso:
```typescript
{
  userId: string;
  journeyId: string;
  completedSteps: string[];      // Array de stepIds
  currentStep?: string;          // stepId atual
  completedAt?: Date;            // Data de conclusão
  lastAccessedAt: Date;
}
```

### Marcação de Conclusão

**SPEC-JOURNEY-P-005:** Etapa tipo `page` DEVE ser marcada como completa quando usuário visita a página

**SPEC-JOURNEY-P-006:** Etapa tipo `action` DEVE ser marcada como completa quando ação é executada

**SPEC-JOURNEY-P-007:** Se `autoComplete: true`, etapa DEVE ser marcada ao ser visualizada

**SPEC-JOURNEY-P-008:** Usuário PODE marcar manualmente etapa como completa via checkbox no Índice

**SPEC-JOURNEY-P-009:** Usuário PODE desmarcar etapa previamente completa

### Cálculo de Progresso

**SPEC-JOURNEY-P-010:** Progresso de seção = `(etapas_completas / total_etapas) * 100`

**SPEC-JOURNEY-P-011:** Progresso geral = `(todas_etapas_completas / total_todas_etapas) * 100`

**SPEC-JOURNEY-P-012:** Jornada é considerada completa quando todas as etapas estão completas

---

## 6. Jornada Evolutiva

### Adição de Etapas

**SPEC-JOURNEY-E-001:** Novas etapas PODEM ser adicionadas à jornada a qualquer momento

**SPEC-JOURNEY-E-002:** Ao adicionar etapas, jornadas previamente completas DEVEM voltar a estar incompletas

**SPEC-JOURNEY-E-003:** Progresso existente DEVE ser preservado

**SPEC-JOURNEY-E-004:** Apenas novas etapas DEVEM aparecer como pendentes

### Notificação de Novidades

**SPEC-JOURNEY-E-005:** Quando novas etapas são adicionadas, usuário DEVE ser notificado

**SPEC-JOURNEY-E-006:** Guia flutuante DEVE exibir badge indicando novas etapas

**SPEC-JOURNEY-E-007:** Ao abrir Índice, novas etapas DEVEM estar visualmente destacadas

### Reorganização

**SPEC-JOURNEY-E-008:** Etapas PODEM ser reordenadas sem afetar progresso

**SPEC-JOURNEY-E-009:** Seções PODEM ser adicionadas ou removidas

**SPEC-JOURNEY-E-010:** Remover etapa DEVE remover também seu status de conclusão

---

## 7. Navegação Guiada

### Botão "Continuar"

**SPEC-JOURNEY-N-001:** Modal de etapa DEVE ter botão "Continuar"

**SPEC-JOURNEY-N-002:** "Continuar" DEVE:
1. Marcar etapa atual como completa
2. Navegar para próxima etapa (se tipo `page`)
3. Fechar modal

### Navegação Automática

**SPEC-JOURNEY-N-003:** Ao completar etapa, módulo PODE automaticamente mostrar modal da próxima

**SPEC-JOURNEY-N-004:** Navegação automática DEVE ser configurável na instância

### Navegação Manual

**SPEC-JOURNEY-N-005:** Usuário PODE clicar em qualquer etapa no Índice para navegar

**SPEC-JOURNEY-N-006:** Navegação manual NÃO DEVE ser bloqueada (etapas futuras são acessíveis)

**SPEC-JOURNEY-N-007:** Visitar etapa futura NÃO marca etapas intermediárias como completas

---

## 8. Integração com Documentação

### Links Contextuais

**SPEC-JOURNEY-I-001:** Modal de etapa PODE conter links para documentação

**SPEC-JOURNEY-I-002:** Links DEVEM abrir em nova aba ou modal overlay

**SPEC-JOURNEY-I-003:** Clicar em link de documentação NÃO DEVE fechar modal da etapa

### Integração com MarkBrowser

**SPEC-JOURNEY-I-004:** Se MarkBrowser está ativo, links PODEM abrir documentos Markdown diretamente

**SPEC-JOURNEY-I-005:** Documentação DEVE ser acessível sem sair da jornada

---

## 9. Configuração de Instância

### Parâmetros Obrigatórios

**SPEC-JOURNEY-C-001:** Toda instância DEVE definir pelo menos uma jornada

**SPEC-JOURNEY-C-002:** Jornada DEVE ter pelo menos uma seção com uma etapa

### Parâmetros Opcionais

**SPEC-JOURNEY-C-003:** Instância PODE configurar:
```typescript
{
  journeys: Journey[];             // Jornadas disponíveis
  defaultJourney: string;          // ID da jornada padrão
  autoStart: boolean;              // Iniciar automaticamente
  allowSkip: boolean;              // Permitir pular etapas
  autoNavigate: boolean;           // Navegação automática entre etapas
  storageSchema: string;           // Schema JQEL para progresso
  floatingGuide: {
    position: 'bottom-left' | 'bottom-right';
    showProgress: boolean;
    collapsible: boolean;
  };
  completionCelebration: boolean;  // Exibir modal de conclusão
}
```

---

## 10. Múltiplas Jornadas

**SPEC-JOURNEY-M-001:** Uma instância PODE ter múltiplas jornadas

**SPEC-JOURNEY-M-002:** Usuário PODE estar em múltiplas jornadas simultaneamente

**SPEC-JOURNEY-M-003:** Progresso DEVE ser rastreado independentemente por jornada

**SPEC-JOURNEY-M-004:** Guia flutuante DEVE permitir alternar entre jornadas ativas

**SPEC-JOURNEY-M-005:** Índice DEVE permitir selecionar qual jornada visualizar

---

## 11. Eventos e Callbacks

**SPEC-JOURNEY-EV-001:** Módulo DEVE disparar eventos:
- `journey:started` - Jornada iniciada
- `step:completed` - Etapa concluída
- `section:completed` - Seção concluída
- `journey:completed` - Jornada concluída

**SPEC-JOURNEY-EV-002:** Instância PODE registrar callbacks para esses eventos

**SPEC-JOURNEY-EV-003:** Callbacks PODEM executar ações customizadas (ex: analytics, notificações)

---

## 12. Acessibilidade

**SPEC-JOURNEY-A-001:** Guia flutuante DEVE ser acessível via teclado

**SPEC-JOURNEY-A-002:** Modais DEVEM seguir padrões ARIA

**SPEC-JOURNEY-A-003:** Progresso DEVE ser anunciado para screen readers

**SPEC-JOURNEY-A-004:** Navegação DEVE ser possível apenas com teclado

---

## 13. Performance

**SPEC-JOURNEY-PERF-001:** Guia flutuante NÃO DEVE impactar performance de scroll

**SPEC-JOURNEY-PERF-002:** Verificação de etapa completa DEVE ser otimizada (debounced)

**SPEC-JOURNEY-PERF-003:** Progresso DEVE ser carregado apenas uma vez por sessão

**SPEC-JOURNEY-PERF-004:** Atualização de progresso DEVE ser throttled (max 1 req/segundo)

---

## 14. Exemplo de Jornada

```json
{
  "journeyId": "onboarding-plataforma",
  "title": "Bem-vindo à Plataforma",
  "description": "Descubra todas as funcionalidades",
  "sections": [
    {
      "sectionId": "fundacao",
      "title": "Fundação",
      "steps": [
        {
          "stepId": "conceitos-basicos",
          "title": "Conceitos Básicos",
          "description": "Entenda portais, módulos e instâncias",
          "type": "page",
          "target": "/docs/conceitos",
          "modal": {
            "title": "Bem-vindo!",
            "content": "Vamos começar entendendo os **três conceitos fundamentais**...",
            "links": [
              {
                "text": "Documentação Completa",
                "url": "/docs/platform-overview"
              }
            ]
          }
        },
        {
          "stepId": "portal-main",
          "title": "Portal Main",
          "type": "page",
          "target": "/"
        }
      ]
    },
    {
      "sectionId": "configuracao",
      "title": "Configuração",
      "steps": [
        {
          "stepId": "criar-portal",
          "title": "Criar Novo Portal",
          "type": "action",
          "target": "mutate.portal.create",
          "modal": {
            "title": "Hora de Criar!",
            "content": "Use o Command Palette (`Ctrl+P`) e digite `/criar-portal`"
          }
        }
      ]
    }
  ],
  "completionCTA": {
    "text": "Explorar Módulos",
    "action": "navigate",
    "target": "/modules"
  }
}
```

---

*Esta especificação define os requisitos do módulo Journey. Implementação técnica em documentação separada.*