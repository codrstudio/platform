# SPEC-error-handling.md

## Especificação: Tratamento de Erros

### Escopo
Este documento especifica como erros devem ser tratados, reportados e apresentados ao usuário em toda a plataforma.

---

## 1. Princípios Gerais

### SPEC-ERR-P-001
A plataforma DEVE tratar todos os erros gracefully

### SPEC-ERR-P-002
Erros NÃO DEVEM quebrar a aplicação completamente

### SPEC-ERR-P-003
Erros DEVEM fornecer feedback claro ao usuário

### SPEC-ERR-P-004
Erros DEVEM ser logados para debugging

### SPEC-ERR-P-005
Informações sensíveis NÃO DEVEM ser expostas em mensagens de erro

---

## 2. Categorias de Erros

### Erros de Rede

**SPEC-ERR-NET-001:** Timeout de requisição
- **Timeout padrão**: 30 segundos
- **Mensagem ao usuário**: "A requisição demorou demais. Tente novamente."
- **Ação sugerida**: Retry automático (até 3 tentativas)

**SPEC-ERR-NET-002:** Conexão perdida
- **Mensagem ao usuário**: "Sem conexão com a internet. Reconectando..."
- **Ação sugerida**: Monitorar `navigator.onLine`, tentar reconectar

**SPEC-ERR-NET-003:** Erro HTTP 5xx (servidor)
- **Mensagem ao usuário**: "Erro no servidor. Tente novamente em instantes."
- **Ação sugerida**: Retry com backoff exponencial

**SPEC-ERR-NET-004:** Erro HTTP 4xx (cliente)
- **400 Bad Request**: "Dados inválidos enviados."
- **401 Unauthorized**: Redirecionar para login
- **403 Forbidden**: "Você não tem permissão para esta ação."
- **404 Not Found**: "Recurso não encontrado."
- **429 Too Many Requests**: "Muitas requisições. Aguarde um momento."

### Erros de Autenticação

**SPEC-ERR-AUTH-001:** Token expirado
- **Ação automática**: Tentar refresh token
- **Se refresh falhar**: Logout automático + "Sessão expirada. Faça login novamente."

**SPEC-ERR-AUTH-002:** Credenciais inválidas
- **Mensagem ao usuário**: "Usuário ou senha incorretos."
- **NÃO especificar** qual campo está errado (segurança)

**SPEC-ERR-AUTH-003:** Usuário bloqueado
- **Mensagem ao usuário**: "Conta temporariamente bloqueada. Contate o suporte."

**SPEC-ERR-AUTH-004:** Refresh token inválido
- **Ação automática**: Logout + "Sessão inválida. Faça login novamente."

### Erros de JQEL

**SPEC-ERR-JQEL-001:** Schema não encontrado
- **Mensagem ao usuário**: "Recurso não disponível."
- **Log para dev**: `Schema '${schema}' não existe`

**SPEC-ERR-JQEL-002:** Entity não encontrada
- **Mensagem ao usuário**: "Recurso não disponível."
- **Log para dev**: `Entity '${entity}' não existe no schema '${schema}'`

**SPEC-ERR-JQEL-003:** Action não encontrada
- **Mensagem ao usuário**: "Operação não disponível."
- **Log para dev**: `Action '${action}' não existe`

**SPEC-ERR-JQEL-004:** Validação de query falhou
- **Mensagem ao usuário**: "Dados inválidos."
- **Log para dev**: Detalhes da validação

**SPEC-ERR-JQEL-005:** Permissão negada
- **Mensagem ao usuário**: "Você não tem permissão para esta operação."
- **Log para dev**: `Permission '${permission}' denied for user '${userId}'`

**SPEC-ERR-JQEL-006:** Timeout de query
- **Mensagem ao usuário**: "A operação demorou demais. Tente novamente."
- **Ação sugerida**: Não fazer retry automático (pode ser query pesada)

### Erros de SSE (Eventos)

**SPEC-ERR-SSE-001:** Conexão SSE falhou
- **Ação automática**: Reconectar automaticamente (backoff exponencial)
- **Mensagem ao usuário**: Nenhuma (silencioso)
- **Indicador visual**: Badge "offline" no ícone de notificações

**SPEC-ERR-SSE-002:** Evento malformado
- **Ação automática**: Ignorar evento, logar erro
- **Mensagem ao usuário**: Nenhuma
- **Log para dev**: `Malformed event: ${eventData}`

**SPEC-ERR-SSE-003:** Múltiplas falhas de reconexão
- **Após 5 tentativas falhas**: Parar de tentar
- **Mensagem ao usuário**: "Não foi possível conectar às notificações em tempo real."
- **Ação sugerida**: Botão "Tentar novamente"

### Erros de Filas (Jobs)

**SPEC-ERR-QUEUE-001:** Job timeout
- **Timeout padrão**: Configurável por fila (ex: 10min)
- **Mensagem ao usuário**: "Processamento demorou demais."
- **Ação sugerida**: Retry automático conforme configuração

**SPEC-ERR-QUEUE-002:** Job falha após múltiplas tentativas
- **Mensagem ao usuário**: "Não foi possível processar. Tente novamente mais tarde."
- **Ação sugerida**: Job move para failed queue (análise manual)

**SPEC-ERR-QUEUE-003:** Dependência externa indisponível
- **Mensagem ao usuário**: "Serviço temporariamente indisponível."
- **Ação sugerida**: Retry com backoff exponencial

**SPEC-ERR-QUEUE-004:** Dados de job inválidos
- **Mensagem ao usuário**: "Dados inválidos para processamento."
- **Ação sugerida**: Não fazer retry, mover para failed

### Erros de Carregamento de Módulos

**SPEC-ERR-MOD-001:** Falha ao carregar módulo
- **Mensagem ao usuário**: "Erro ao carregar funcionalidade. Recarregue a página."
- **Log para dev**: `Failed to load module '${moduleId}': ${error}`
- **Ação sugerida**: Botão "Recarregar página"

**SPEC-ERR-MOD-002:** Dependência de módulo não encontrada
- **Mensagem ao usuário**: "Erro de configuração. Contate o administrador."
- **Log para dev**: `Module '${moduleId}' requires '${dependencyId}' which is not loaded`

**SPEC-ERR-MOD-003:** Módulo exporta estrutura inválida
- **Mensagem ao usuário**: "Erro ao inicializar funcionalidade."
- **Log para dev**: `Module '${moduleId}' has invalid exports`

### Erros de Roteamento

**SPEC-ERR-ROUTE-001:** Rota não encontrada (404)
- **Comportamento**: Exibir página 404 customizada
- **Conteúdo**: "Página não encontrada" + link para home

**SPEC-ERR-ROUTE-002:** Rota protegida sem autenticação
- **Comportamento**: Redirecionar para login
- **Preservar**: URL original para redirecionar após login

**SPEC-ERR-ROUTE-003:** Rota sem permissão (403)
- **Comportamento**: Exibir página 403 customizada
- **Conteúdo**: "Você não tem acesso a esta página" + link para home

### Erros de Validação (Formulários)

**SPEC-ERR-FORM-001:** Campo obrigatório vazio
- **Mensagem**: "Este campo é obrigatório."
- **Posição**: Abaixo do campo

**SPEC-ERR-FORM-002:** Formato inválido
- **Mensagem**: "Formato inválido. Exemplo: ${exemplo}"
- **Posição**: Abaixo do campo

**SPEC-ERR-FORM-003:** Valor fora do range
- **Mensagem**: "Valor deve estar entre ${min} e ${max}."

**SPEC-ERR-FORM-004:** Validação assíncrona falhou (ex: email já existe)
- **Mensagem**: Específica do erro (ex: "Este email já está cadastrado.")

---

## 3. Error Boundaries (React)

### Boundary Global

**SPEC-ERR-BOUND-001:** Aplicação DEVE ter Error Boundary global

**SPEC-ERR-BOUND-002:** Boundary global DEVE capturar erros não tratados

**SPEC-ERR-BOUND-003:** Boundary global DEVE exibir fallback:
```
┌─────────────────────────────────────┐
│  Algo deu errado                    │
│                                     │
│  Ocorreu um erro inesperado.       │
│                                     │
│  [Recarregar Página]                │
│                                     │
│  Detalhes do erro (dev only)        │
└─────────────────────────────────────┘
```

**SPEC-ERR-BOUND-004:** Erro DEVE ser logado para monitoramento

### Boundary por Portal

**SPEC-ERR-BOUND-005:** Cada portal DEVE ter seu próprio Error Boundary

**SPEC-ERR-BOUND-006:** Erro em um portal NÃO DEVE afetar outros portais

**SPEC-ERR-BOUND-007:** Boundary de portal DEVE exibir fallback:
```
Este portal encontrou um erro.
[Voltar para Home] [Recarregar Portal]
```

### Boundary por Módulo

**SPEC-ERR-BOUND-008:** Módulos complexos PODEM ter Error Boundary próprio

**SPEC-ERR-BOUND-009:** Erro em módulo NÃO DEVE quebrar portal inteiro

**SPEC-ERR-BOUND-010:** Boundary de módulo DEVE exibir fallback:
```
Erro ao carregar este componente.
[Tentar Novamente]
```

---

## 4. Logging

### Níveis de Log

**SPEC-ERR-LOG-001:** Plataforma DEVE usar níveis de log:
- **ERROR**: Erros que impactam funcionalidade
- **WARN**: Situações anormais mas não críticas
- **INFO**: Eventos importantes (login, logout, etc)
- **DEBUG**: Informações detalhadas (apenas em dev)

### Estrutura de Log

**SPEC-ERR-LOG-002:** Logs DEVEM incluir:
```typescript
{
  timestamp: string;           // ISO 8601
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  category: string;            // 'auth', 'jqel', 'sse', 'module', etc
  message: string;             // Descrição legível
  error?: {
    name: string;
    message: string;
    stack?: string;            // Apenas em dev
  };
  context?: {                  // Dados adicionais
    userId?: string;
    portalId?: string;
    moduleId?: string;
    [key: string]: any;
  };
}
```

### Destinos de Log

**SPEC-ERR-LOG-003:** Em desenvolvimento:
- Console do browser (todos os níveis)

**SPEC-ERR-LOG-004:** Em produção:
- Console do browser (apenas ERROR e WARN)
- Serviço de monitoramento (ERROR apenas)

**SPEC-ERR-LOG-005:** Logs NÃO DEVEM incluir:
- Senhas
- Tokens
- Dados sensíveis de usuários
- PII (Personal Identifiable Information)

---

## 5. Feedback ao Usuário

### Toast Notifications

**SPEC-ERR-UI-001:** Erros não-críticos DEVEM usar toast via componente **Sonner**

**SPEC-ERR-UI-002:** Toast DEVE ter:
- Ícone indicando severidade (Lucide icons: XCircle, AlertTriangle, CheckCircle, Info)
- Mensagem clara e concisa (máximo 2 linhas)
- Duração automática (4-6 segundos)
- Botão de fechar (X) implícito
- Ação opcional (botão inline)

**SPEC-ERR-UI-003:** Toasts DEVEM empilhar (máximo 3 visíveis)

**SPEC-ERR-UI-004:** Posição: Canto inferior direito (padrão shadcn/ui Sonner)

**SPEC-ERR-UI-005:** Variantes de toast:
- `toast.error()` - Erros (vermelho, ícone XCircle)
- `toast.warning()` - Avisos (amarelo, ícone AlertTriangle)
- `toast.success()` - Sucesso (verde, ícone CheckCircle)
- `toast.info()` - Informação (azul, ícone Info)

**SPEC-ERR-UI-006:** Exemplo de uso:
```typescript
toast.error("Erro ao salvar dados", {
  description: "Verifique sua conexão e tente novamente",
  action: {
    label: "Tentar Novamente",
    onClick: () => retry()
  }
});
```

### Modal de Erro

**SPEC-ERR-UI-007:** Erros críticos DEVEM usar componente **Alert Dialog**

**SPEC-ERR-UI-008:** Alert Dialog DEVE ter:
- **AlertDialogHeader** com título claro ("Erro", "Atenção", etc)
- **AlertDialogDescription** com descrição do erro
- **AlertDialogFooter** com ações:
  - Ação primária via **AlertDialogAction** ("OK", "Tentar Novamente")
  - Ação secundária opcional via **AlertDialogCancel** ("Cancelar", "Voltar")

**SPEC-ERR-UI-009:** Modal DEVE bloquear interação com o resto da página (overlay)

**SPEC-ERR-UI-010:** Exemplo de estrutura:
```typescript
<AlertDialog open={hasError}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Erro ao processar</AlertDialogTitle>
      <AlertDialogDescription>
        Não foi possível completar a operação. Verifique os dados e tente novamente.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction onClick={retry}>Tentar Novamente</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Inline Errors (Formulários)

**SPEC-ERR-UI-011:** Erros de formulário DEVEM usar componente **Form** do shadcn/ui

**SPEC-ERR-UI-012:** Campo com erro DEVE usar componente **Field** que inclui:
- Label com indicação de campo obrigatório
- Input com estado de erro (borda vermelha)
- **FormMessage** com mensagem de erro abaixo do campo

**SPEC-ERR-UI-013:** Ícone de erro PODE aparecer no campo via **Input** com prefix/suffix

**SPEC-ERR-UI-014:** Exemplo de campo com erro:
```typescript
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input placeholder="seu@email.com" {...field} />
      </FormControl>
      <FormMessage /> {/* Exibe erro automaticamente */}
    </FormItem>
  )}
/>
```

### Alert Inline

**SPEC-ERR-UI-015:** Para erros contextuais não relacionados a campos, usar componente **Alert**

**SPEC-ERR-UI-016:** Alert DEVE ter variante `destructive` para erros

**SPEC-ERR-UI-017:** Alert DEVE incluir:
- Ícone via **AlertTriangle** do Lucide
- **AlertTitle** com título conciso
- **AlertDescription** com detalhes

**SPEC-ERR-UI-018:** Exemplo:
```typescript
<Alert variant="destructive">
  <AlertTriangle className="h-4 w-4" />
  <AlertTitle>Erro ao carregar dados</AlertTitle>
  <AlertDescription>
    Não foi possível carregar os dados. Tente novamente.
  </AlertDescription>
</Alert>
```

### Loading States com Erro

**SPEC-ERR-UI-019:** Componente em loading que falha DEVE usar componente **Card** com estado de erro

**SPEC-ERR-UI-020:** Card de erro DEVE incluir:
- Ícone de alerta (AlertTriangle)
- Mensagem clara
- Botão via **Button** variante "outline" ou "default"

**SPEC-ERR-UI-021:** Exemplo:
```typescript
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <AlertTriangle className="h-5 w-5 text-destructive" />
      Erro ao carregar
    </CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-muted-foreground">
      Não foi possível carregar os dados. Tente novamente.
    </p>
  </CardContent>
  <CardFooter>
    <Button onClick={retry} variant="outline">
      Tentar Novamente
    </Button>
  </CardFooter>
</Card>
```

### Empty States

**SPEC-ERR-UI-022:** Para estados vazios (não erro, mas relacionado), usar componente **Empty**

**SPEC-ERR-UI-023:** Empty state DEVE ter:
- Ícone ilustrativo do Lucide
- Título descritivo
- Descrição opcional
- Ação primária (Button)

### Loading States

**SPEC-ERR-UI-024:** Durante carregamento, usar componente **Skeleton** para placeholders

**SPEC-ERR-UI-025:** Skeleton DEVE imitar estrutura do conteúdo final:
```typescript
<Card>
  <CardHeader>
    <Skeleton className="h-4 w-[250px]" />
    <Skeleton className="h-4 w-[200px]" />
  </CardHeader>
  <CardContent>
    <Skeleton className="h-[200px] w-full" />
  </CardContent>
</Card>
```

**SPEC-ERR-UI-026:** Para loading inline (botões, pequenos componentes), usar componente **Spinner**

**SPEC-ERR-UI-027:** Spinner DEVE ter tamanhos: `sm`, `md`, `lg`

**SPEC-ERR-UI-028:** Durante loading, botões DEVEM usar propriedade `disabled` e mostrar Spinner:
```typescript
<Button disabled={isLoading}>
  {isLoading && <Spinner className="mr-2" />}
  Salvar
</Button>
```

### Progress Indicators

**SPEC-ERR-UI-029:** Para operações longas com progresso conhecido, usar componente **Progress**

**SPEC-ERR-UI-030:** Progress bar DEVE mostrar porcentagem quando relevante

**SPEC-ERR-UI-031:** Para processos multi-step, PODE usar Steps/Stepper visual

---

## 6. Retry Strategy

### Retry Automático

**SPEC-ERR-RETRY-001:** Requisições de rede PODEM ter retry automático

**SPEC-ERR-RETRY-002:** Máximo de tentativas: 3

**SPEC-ERR-RETRY-003:** Backoff exponencial: 1s, 2s, 4s

**SPEC-ERR-RETRY-004:** Apenas para erros temporários:
- Timeout
- 5xx (servidor)
- Perda de conexão

**SPEC-ERR-RETRY-005:** NÃO fazer retry para:
- 4xx (exceto 429)
- Erros de validação
- Erros de permissão

### Retry para Jobs (BullMQ)

**SPEC-ERR-JOB-RETRY-001:** Jobs DEVEM ter configuração de retry por fila

**SPEC-ERR-JOB-RETRY-002:** Backoff exponencial DEVE ser padrão: 2s, 4s, 8s, 16s...

**SPEC-ERR-JOB-RETRY-003:** Máximo de tentativas DEVE ser configurável (padrão: 3-10)

**SPEC-ERR-JOB-RETRY-004:** Jobs com dados inválidos NÃO DEVEM ter retry

**SPEC-ERR-JOB-RETRY-005:** Jobs com erro 4xx de API externa NÃO DEVEM ter retry

**SPEC-ERR-JOB-RETRY-006:** Jobs com erro 5xx de API externa DEVEM ter retry

**SPEC-ERR-JOB-RETRY-007:** Jobs que excedem máximo de tentativas movem para failed queue

### Retry Manual

**SPEC-ERR-RETRY-006:** Usuário DEVE poder tentar novamente manualmente

**SPEC-ERR-RETRY-007:** Botão "Tentar Novamente" DEVE:
- Limpar estado de erro
- Executar operação novamente
- Exibir loading durante tentativa

---

## 7. Tratamento por Canal

### Canal de Autenticação

**SPEC-ERR-CH-AUTH-001:** Erro 401 → Tentar refresh automático

**SPEC-ERR-CH-AUTH-002:** Refresh falha → Logout + redirect para login

**SPEC-ERR-CH-AUTH-003:** Erro 403 → Toast "Sem permissão"

**SPEC-ERR-CH-AUTH-004:** Erro de rede → Toast "Erro de conexão" + retry

### Canal de Dados (JQEL)

**SPEC-ERR-CH-JQEL-001:** TanStack Query DEVE tratar erros via `onError`

**SPEC-ERR-CH-JQEL-002:** Query falha → Componente exibe erro inline

**SPEC-ERR-CH-JQEL-003:** Mutation falha → Toast com mensagem

**SPEC-ERR-CH-JQEL-004:** Mutation com optimistic update falha → Reverter UI

**SPEC-ERR-CH-JQEL-005:** Erro de validação → Exibir erros de campo inline

### Canal de Eventos (SSE)

**SPEC-ERR-CH-SSE-001:** Conexão falha → Reconectar automaticamente (silencioso)

**SPEC-ERR-CH-SSE-002:** Após 5 falhas → Toast "Notificações offline"

**SPEC-ERR-CH-SSE-003:** Evento malformado → Ignorar + logar

**SPEC-ERR-CH-SSE-004:** Usuário pode reconectar manualmente via botão

### Canal de Agentes

**SPEC-ERR-CH-AGENT-001:** Timeout (>30s) → Toast "Agente não respondeu"

**SPEC-ERR-CH-AGENT-002:** Erro 5xx → Toast "Erro ao processar" + opção retry

**SPEC-ERR-CH-AGENT-003:** Resposta malformada → Toast "Resposta inválida"

---

## 8. Modo Desenvolvimento vs Produção

### Desenvolvimento

**SPEC-ERR-DEV-001:** Stack traces DEVEM ser visíveis

**SPEC-ERR-DEV-002:** Logs detalhados DEVEM aparecer no console

**SPEC-ERR-DEV-003:** Error boundaries PODEM exibir detalhes técnicos

**SPEC-ERR-DEV-004:** Requests DEVEM logar payloads completos

### Produção

**SPEC-ERR-PROD-001:** Stack traces NÃO DEVEM ser visíveis ao usuário

**SPEC-ERR-PROD-002:** Apenas ERROR e WARN no console

**SPEC-ERR-PROD-003:** Mensagens genéricas para erros internos

**SPEC-ERR-PROD-004:** Erros DEVEM ser enviados para serviço de monitoramento

---

## 9. Erros Específicos de Módulos

### Responsabilidade

**SPEC-ERR-MOD-R-001:** Módulos DEVEM tratar seus próprios erros

**SPEC-ERR-MOD-R-002:** Módulos NÃO DEVEM deixar erros escaparem sem tratamento

**SPEC-ERR-MOD-R-003:** Módulos DEVEM usar utilities da plataforma para logging

### Erros de Configuração

**SPEC-ERR-MOD-C-001:** Instância com config inválida:
- **Ao carregar**: Logar erro + não renderizar instância
- **Ao usuário**: "Esta funcionalidade está mal configurada."

**SPEC-ERR-MOD-C-002:** Dependência faltando:
- **Ao carregar**: Logar erro + não carregar módulo
- **Ao usuário**: "Erro de configuração. Contate o administrador."

---

## 10. Monitoramento

### Métricas

**SPEC-ERR-MON-001:** Plataforma PODE enviar métricas de erro:
- Taxa de erro por endpoint
- Taxa de erro por módulo
- Taxa de erro por portal
- Erros mais frequentes

**SPEC-ERR-MON-002:** Métricas DEVEM ser agregadas (não individuais)

**SPEC-ERR-MON-003:** Métricas NÃO DEVEM incluir dados sensíveis

### Alertas

**SPEC-ERR-MON-004:** Sistema PODE alertar quando:
- Taxa de erro > 5% em 5 minutos
- Erro crítico ocorre
- Múltiplos usuários reportam mesmo erro

---

## 11. Utilitários da Plataforma

### Error Handler Utility

**SPEC-ERR-UTIL-001:** Plataforma DEVE exportar utility:
```typescript
handleError(error: Error, options?: {
  category: string;
  context?: Record<string, any>;
  showToast?: boolean;
  toastMessage?: string;
  logLevel?: 'ERROR' | 'WARN' | 'INFO';
});
```

### Error Classes Customizadas

**SPEC-ERR-UTIL-002:** Plataforma DEVE fornecer classes:
```typescript
class AuthError extends Error { }
class JqelError extends Error { }
class ValidationError extends Error { }
class NetworkError extends Error { }
class ModuleError extends Error { }
```

### React Hook

**SPEC-ERR-UTIL-003:** Plataforma DEVE fornecer hook:
```typescript
const { handleError, showError } = useErrorHandler();

try {
  await mutation();
} catch (error) {
  handleError(error, { 
    category: 'jqel',
    showToast: true 
  });
}
```

---

*Esta especificação define como erros devem ser tratados em toda a plataforma. Implementação técnica em documentação separada.*