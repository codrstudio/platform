# Chatify

## Descrição

Sistema avançado de chat com IA que oferece múltiplos provedores, agentes customizáveis, gamificação e renderização rica de conteúdo.

## Funcionalidades

- Múltiplos provedores de IA (NIC, OpenAI) com seleção de modelos
- Sistema de agentes configurável (built-in, N8N-discovered, custom)
- Gamificação/Jornada de descoberta com 14 etapas progressivas
- Streaming SSE unificado (N8N + OpenAI compatible)
- Renderização avançada (Markdown + Mermaid diagrams + Imagens)
- Widget de chat flutuante
- Sistema de progresso e conquistas
- Múltiplas conversas simultâneas
- Exportação de conversas (Markdown, JSON, PDF)
- Busca no histórico

## Instalação

1. O módulo já está registrado automaticamente
2. Ative no portal desejado via módulo Setup
3. Configure as opções necessárias no formulário de instância

## Configuração

| Campo | Tipo | Descrição | Padrão |
|-------|------|-----------|--------|
| agentId | string | ID do agente padrão (obrigatório) | - |
| route | string | Rota base do módulo | '/chatify' |
| title | string | Título da interface | 'Chatify' |
| placeholder | string | Placeholder do input | 'Digite sua mensagem...' |
| enableJourney | boolean | Habilitar gamificação | true |
| enableStreaming | boolean | Habilitar streaming SSE | true |
| persistHistory | boolean | Persistir histórico | true |
| contextWindow | number | Janela de contexto (mensagens) | 100 |
| maxInputLength | number | Tamanho máximo do input | 8000 |

### Configurações Avançadas

- **allowFileUpload**: Permitir upload de arquivos
- **enableExport**: Habilitar exportação de conversas
- **enableSearch**: Habilitar busca no histórico
- **showTimestamps**: Mostrar timestamps nas mensagens
- **debugMode**: Modo debug com logs

## Uso

### Como acessar o módulo

Após ativação, acesse via menu ou diretamente em:
- Portal Main: `/chatify` ou `/chatify/chat`
- Outros portais: `/[portal-id]/chatify`

### Páginas Disponíveis

- **/** - Landing page com overview do módulo
- **/chat** - Interface principal de conversação
- **/admin** - Gerenciamento de agentes e configurações
- **/guide/:stepId** - Jornada de aprendizado guiada

### Hooks Disponíveis

```typescript
// Hook principal do chat
const {
  messages,
  sendMessage,
  isLoading,
  selectedAgent,
  setSelectedAgent,
} = useChatify({ conversationId: 'default' });

// Gerenciar agentes
const {
  config,
  selectedAgent,
  selectAgent,
  availableAgents,
} = useAgents();

// Progresso da jornada
const {
  progress,
  markPageVisited,
  getNextRecommendedStep,
  completionPercentage,
} = useJourneyProgress();

// Tema
const { theme, setTheme } = useTheme();
```

## Dependências

- Nenhuma dependência de outros módulos
- Requer n8n configurado para agentes N8N (opcional)
- Requer API keys para provedores externos (OpenAI, etc.)

## API

### Entidades JQEL

O módulo usa schema customizado `chatify`:

- **message**: Mensagens do chat
  - conversationId: ID da conversa
  - role: 'user' | 'assistant' | 'system'
  - content: Conteúdo da mensagem
  - timestamp: Data/hora da mensagem

### Eventos SSE

O módulo consome eventos de streaming:

- **token**: Token individual de resposta
- **done**: Fim do streaming
- **begin**: Início de novo item
- **item**: Item de dados
- **end**: Fim do processamento

## Desenvolvimento

### Estrutura

```
chatify/
├── assets/              # Assets internos (imagens, ícones)
├── components/          # Componentes React
│   ├── agent/          # Componentes de agentes
│   ├── chat/           # Componentes de chat
│   ├── gamification/   # Sistema de gamificação
│   ├── layout/         # Layout e navegação
│   ├── markdown/       # Renderização markdown
│   └── unified/        # Componentes unificados
├── data/               # Dados estáticos (journey steps)
├── hooks/              # React hooks customizados
├── pages/              # Páginas do módulo
├── services/           # Serviços de integração
├── types/              # TypeScript types
├── manifest.ts         # Configuração do módulo
├── index.ts           # Entry point + auto-registro
├── routes.ts          # Definição de rotas
└── README.md          # Esta documentação
```

### Comandos

```bash
# Desenvolvimento (raiz do frontend)
cd src/frontend
npm run dev

# Build
npm run build

# Type check
npm run type-check
```

## Roadmap

### v1.1.0 (Planejado)
- Suporte a múltiplos idiomas
- Temas customizáveis por instância
- Templates de agentes
- Integração com módulo de documentos

### v1.2.0 (Futuro)
- Chat em grupo
- Compartilhamento de conversas
- Análise de sentimento
- Sugestões inteligentes

## Changelog

### v1.0.0 (2025-01-16)
- Versão inicial refatorada segundo SPEC-MODULE-PATTERNS
- Sistema de múltiplos provedores de IA
- Sistema de agentes (built-in, N8N, custom)
- Gamificação completa com 14 etapas
- Streaming SSE unificado
- Renderização avançada (Markdown + Mermaid)
- Conformidade com especificações da plataforma

## Licença

Parte da plataforma codr.studio

## Suporte

Para issues e dúvidas, consulte:
- Documentação da plataforma: `spec/`
- Guia de módulos: `spec/SPEC-MODULE-PATTERNS.md`
- Módulo Blueprint (referência): `src/frontend/src/modules/blueprint/`
