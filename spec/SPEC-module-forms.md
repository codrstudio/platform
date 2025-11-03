# SPEC-module-forms.md

## Especificação: Módulo de Formulários

### Escopo
Este documento especifica o módulo Forms, responsável por criar e gerenciar formulários customizáveis similar ao Google Forms.

---

## 1. Definição

### Propósito
O módulo Forms permite criar formulários dinâmicos com múltiplos tipos de campos, validação, e coleta de respostas.

### Natureza
- **Tipo**: Módulo de Funcionalidade
- **Dependências**: Nenhuma obrigatória
- **Opcional**: Sim

---

## 2. Responsabilidades

### SPEC-FORMS-R-001
O módulo Forms DEVE permitir criação de formulários via configuração declarativa

### SPEC-FORMS-R-002
O módulo Forms DEVE armazenar configurações e respostas via JQEL

### SPEC-FORMS-R-003
O módulo Forms DEVE validar campos no cliente e servidor

### SPEC-FORMS-R-004
O módulo Forms PODE criar múltiplas instâncias (formulários diferentes)

---

## 3. Estrutura de Formulário

### Schema de Configuração

**SPEC-FORMS-S-001:** Todo formulário DEVE ter esta estrutura:
```typescript
{
  formId: string;              // Identificador único
  title: string;               // Título do formulário
  description?: string;        // Descrição opcional
  fields: Field[];             // Lista de campos
  settings: FormSettings;      // Configurações gerais
  styling?: FormStyling;       // Customização visual
}
```

### Schema de Campo

**SPEC-FORMS-S-002:** Todo campo DEVE ter esta estrutura:
```typescript
{
  fieldId: string;             // Identificador único no form
  type: FieldType;             // Tipo do campo
  label: string;               // Label exibido
  description?: string;        // Texto de ajuda
  placeholder?: string;        // Placeholder do input
  required: boolean;           // Se é obrigatório
  validation?: Validation;     // Regras de validação
  options?: FieldOptions;      // Específico por tipo
}
```

---

## 4. Tipos de Campo

### Obrigatórios

**SPEC-FORMS-T-001:** Módulo DEVE suportar estes tipos básicos:

#### text
```typescript
{
  type: "text",
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;  // Regex
  }
}
```

#### textarea
```typescript
{
  type: "textarea",
  options?: {
    rows?: number;
    maxLength?: number;
  }
}
```

#### email
```typescript
{
  type: "email",
  validation?: {
    pattern?: string;  // Custom email regex
  }
}
```

#### number
```typescript
{
  type: "number",
  validation?: {
    min?: number;
    max?: number;
    step?: number;
  }
}
```

#### select
```typescript
{
  type: "select",
  options: {
    choices: Array<{
      value: string;
      label: string;
    }>;
    allowOther?: boolean;  // "Outro" como opção
  }
}
```

#### radio
```typescript
{
  type: "radio",
  options: {
    choices: Array<{
      value: string;
      label: string;
    }>;
    allowOther?: boolean;
  }
}
```

#### checkbox
```typescript
{
  type: "checkbox",
  options: {
    choices: Array<{
      value: string;
      label: string;
    }>;
    minSelected?: number;
    maxSelected?: number;
  }
}
```

#### date
```typescript
{
  type: "date",
  validation?: {
    minDate?: string;  // ISO format
    maxDate?: string;
  }
}
```

#### file
```typescript
{
  type: "file",
  options: {
    accept?: string;        // MIME types
    maxSize?: number;       // Bytes
    maxFiles?: number;      // Multiple files
  }
}
```

### Opcionais

**SPEC-FORMS-T-002:** Módulo PODE suportar tipos avançados:

#### phone
```typescript
{
  type: "phone",
  options?: {
    countryCode?: string;
    format?: string;
  }
}
```

#### url
```typescript
{
  type: "url",
  validation?: {
    protocols?: string[];  // ["http", "https"]
  }
}
```

#### rating
```typescript
{
  type: "rating",
  options: {
    max: number;          // Ex: 5 estrelas
    icon?: string;        // lucide icon name
  }
}
```

#### slider
```typescript
{
  type: "slider",
  options: {
    min: number;
    max: number;
    step?: number;
    showValue?: boolean;
  }
}
```

#### matrix
```typescript
{
  type: "matrix",
  options: {
    rows: string[];       // Questões
    columns: string[];    // Opções
  }
}
```

---

## 5. Configurações do Formulário

### FormSettings

**SPEC-FORMS-C-001:** Formulário DEVE permitir estas configurações:
```typescript
{
  allowMultipleSubmissions: boolean;  // Permitir múltiplas respostas
  requireAuth: boolean;               // Exigir autenticação
  showProgressBar: boolean;           // Barra de progresso
  shuffleFields: boolean;             // Embaralhar ordem dos campos
  confirmationMessage: string;        // Mensagem após envio
  redirectUrl?: string;               // Redirecionar após envio
  expiresAt?: string;                 // Data de expiração (ISO)
  maxSubmissions?: number;            // Limite de respostas
  notifyOnSubmit?: string[];          // Emails para notificar
}
```

---

## 6. Lógica Condicional

### Campos Condicionais

**SPEC-FORMS-L-001:** Módulo DEVE suportar campos condicionais:
```typescript
{
  fieldId: "motivo-saida",
  type: "text",
  showIf: {
    fieldId: "status",
    operator: "equals",
    value: "desligado"
  }
}
```

**SPEC-FORMS-L-002:** Operadores suportados:
- `equals`
- `notEquals`
- `contains`
- `greaterThan`
- `lessThan`
- `isEmpty`
- `isNotEmpty`

**SPEC-FORMS-L-003:** Módulo PODE suportar condições compostas:
```typescript
{
  showIf: {
    operator: "and",
    conditions: [
      { fieldId: "idade", operator: "greaterThan", value: 18 },
      { fieldId: "pais", operator: "equals", value: "BR" }
    ]
  }
}
```

---

## 7. Validação

### Client-Side

**SPEC-FORMS-V-001:** Módulo DEVE validar campos antes de enviar

**SPEC-FORMS-V-002:** Validação DEVE ocorrer:
- Ao sair do campo (onBlur)
- Ao submeter formulário

**SPEC-FORMS-V-003:** Erros DEVEM ser exibidos inline abaixo do campo

**SPEC-FORMS-V-004:** Campos inválidos DEVEM impedir submissão

### Server-Side

**SPEC-FORMS-V-005:** Backend DEVE revalidar todos os campos

**SPEC-FORMS-V-006:** Validação server-side DEVE usar mesmas regras do cliente

**SPEC-FORMS-V-007:** Erros do servidor DEVEM ser mapeados para campos específicos

### Regras de Validação

**SPEC-FORMS-V-008:** Módulo DEVE suportar:
```typescript
{
  required: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;          // Regex
  custom?: (value) => boolean | string;  // Validação customizada
}
```

---

## 8. Submissão e Respostas

### Fluxo de Submissão

**SPEC-FORMS-SUB-001:** Submissão DEVE seguir este fluxo:
```
1. Usuário preenche formulário
2. Validação client-side
3. Se válido, POST via JQEL
4. Backend valida novamente
5. Armazena resposta
6. Retorna confirmação
7. Exibe mensagem ou redireciona
```

### Schema de Resposta

**SPEC-FORMS-SUB-002:** Resposta DEVE ter estrutura:
```typescript
{
  responseId: string;
  formId: string;
  userId?: string;           // Se autenticado
  submittedAt: string;       // ISO timestamp
  answers: {
    [fieldId: string]: any;
  };
  metadata?: {
    ip?: string;
    userAgent?: string;
    referer?: string;
  };
}
```

### Armazenamento

**SPEC-FORMS-SUB-003:** Respostas DEVEM ser armazenadas via JQEL:
```typescript
await jqel.mutate({
  schema: 'forms',
  entity: 'response',
  action: 'insert',
  values: response
});
```

**SPEC-FORMS-SUB-004:** Módulo DEVE impedir duplicação se `allowMultipleSubmissions: false`

---

## 9. Visualização de Respostas

### Lista de Respostas

**SPEC-FORMS-R-001:** Módulo DEVE fornecer interface para visualizar respostas

**SPEC-FORMS-R-002:** Visualização DEVE mostrar:
- Lista de todas as respostas
- Data de submissão
- Usuário (se autenticado)
- Filtros e busca

### Detalhes da Resposta

**SPEC-FORMS-R-003:** Módulo DEVE exibir resposta individual formatada

**SPEC-FORMS-R-004:** Cada campo DEVE mostrar label e valor

### Exportação

**SPEC-FORMS-R-005:** Módulo DEVE permitir exportar respostas

**SPEC-FORMS-R-006:** Formatos suportados:
- CSV
- Excel (se Export Components ativo)
- JSON

**SPEC-FORMS-R-007:** Exportação DEVE incluir todas as respostas ou filtradas

---

## 10. Editor de Formulários

### Interface de Criação

**SPEC-FORMS-E-001:** Módulo DEVE fornecer editor visual (drag-and-drop)

**SPEC-FORMS-E-002:** Editor DEVE permitir:
- Adicionar campos
- Reordenar campos (drag-and-drop)
- Editar propriedades de campos
- Duplicar campos
- Remover campos
- Preview em tempo real

### Biblioteca de Campos

**SPEC-FORMS-E-003:** Editor DEVE ter paleta com todos os tipos de campo

**SPEC-FORMS-E-004:** Cada tipo DEVE ter ícone e descrição

### Configuração Visual

**SPEC-FORMS-E-005:** Editor DEVE permitir configurar:
- Título e descrição do formulário
- Mensagem de confirmação
- Configurações gerais (FormSettings)
- Estilo visual (cores, fontes)

---

## 11. Templates

### Templates Pré-definidos

**SPEC-FORMS-TPL-001:** Módulo PODE fornecer templates:
- Contato
- Pesquisa de Satisfação
- Registro de Evento
- Candidatura a Vaga
- Feedback de Produto

**SPEC-FORMS-TPL-002:** Templates DEVEM ser editáveis após seleção

### Templates Customizados

**SPEC-FORMS-TPL-003:** Usuário PODE salvar formulário como template

**SPEC-FORMS-TPL-004:** Templates customizados DEVEM ser reutilizáveis

---

## 12. Notificações

### Email ao Submeter

**SPEC-FORMS-N-001:** Formulário PODE enviar email ao receber resposta

**SPEC-FORMS-N-002:** Configuração:
```typescript
{
  notifyOnSubmit: {
    enabled: boolean;
    recipients: string[];      // Emails
    subject: string;
    template?: string;         // Template customizado
  }
}
```

**SPEC-FORMS-N-003:** Email DEVE ser enviado via workflow n8n

### Email de Confirmação

**SPEC-FORMS-N-004:** Respondente PODE receber email de confirmação

**SPEC-FORMS-N-005:** Email DEVE incluir:
- Título do formulário
- Mensagem de agradecimento
- Resumo das respostas (opcional)

---

## 13. Análise e Estatísticas

### Dashboard de Respostas

**SPEC-FORMS-A-001:** Módulo PODE fornecer dashboard com:
- Total de respostas
- Respostas ao longo do tempo (gráfico)
- Taxa de conclusão
- Campos mais preenchidos/vazios

### Análise por Campo

**SPEC-FORMS-A-002:** Para campos select/radio/checkbox, módulo PODE exibir:
- Distribuição de respostas (gráfico de pizza/barra)
- Percentual por opção

**SPEC-FORMS-A-003:** Para campos numéricos, módulo PODE exibir:
- Média
- Mediana
- Mínimo/Máximo

---

## 14. Integração com Outros Módulos

### Auth

**SPEC-FORMS-I-001:** Se `requireAuth: true`, formulário DEVE validar autenticação

**SPEC-FORMS-I-002:** Resposta DEVE incluir `userId` se autenticado

### Notifications/Tasks

**SPEC-FORMS-I-003:** Submissão PODE disparar notificação via Canal de Eventos

**SPEC-FORMS-I-004:** Formulário PODE criar task para revisão manual

---

## 15. Rotas

### Rota de Preenchimento

**SPEC-FORMS-ROUTE-001:** Cada instância DEVE gerar rota:
```
/:portalId/forms/:instanceId/fill
```

### Rota de Gerenciamento

**SPEC-FORMS-ROUTE-002:** Cada instância DEVE gerar rotas:
```
/:portalId/forms/:instanceId/edit       # Editor
/:portalId/forms/:instanceId/responses  # Listar respostas
/:portalId/forms/:instanceId/analytics  # Dashboard
```

---

## 16. Permissões

**SPEC-FORMS-P-001:** Módulo DEVE respeitar permissões:
- `forms.create` - Criar formulário
- `forms.edit` - Editar formulário
- `forms.view_responses` - Ver respostas
- `forms.delete` - Deletar formulário
- `forms.export` - Exportar respostas

**SPEC-FORMS-P-002:** Preenchimento de formulário público NÃO requer permissão

---

## 17. Configuração de Instância

### Exemplo Básico
```json
{
  "instanceId": "contato",
  "moduleId": "forms",
  "config": {
    "title": "Fale Conosco",
    "description": "Entre em contato com nossa equipe",
    "route": "/contato",
    "settings": {
      "allowMultipleSubmissions": true,
      "requireAuth": false,
      "confirmationMessage": "Obrigado! Entraremos em contato em breve."
    }
  }
}
```

### Exemplo Avançado
```json
{
  "instanceId": "candidatura-vaga",
  "moduleId": "forms",
  "config": {
    "title": "Candidatura - Desenvolvedor Full Stack",
    "route": "/vagas/fullstack/candidatura",
    "settings": {
      "allowMultipleSubmissions": false,
      "requireAuth": true,
      "expiresAt": "2025-12-31T23:59:59Z",
      "maxSubmissions": 100,
      "notifyOnSubmit": ["rh@empresa.com"],
      "redirectUrl": "/vagas/obrigado"
    }
  }
}
```

---

## 18. Acessibilidade

**SPEC-FORMS-ACC-001:** Todos os campos DEVEM ter labels associados

**SPEC-FORMS-ACC-002:** Erros DEVEM ser anunciados para screen readers

**SPEC-FORMS-ACC-003:** Formulário DEVE ser navegável via teclado

**SPEC-FORMS-ACC-004:** Campos obrigatórios DEVEM ter indicação visual e semântica

---

*Esta especificação define os requisitos do módulo Forms. Implementação técnica em documentação separada.*