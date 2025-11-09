# N8N MCP Tools - Guia de Uso Avançado

## 📚 Visão Geral

Este servidor MCP fornece integração completa com a API do n8n, permitindo gerenciar workflows, execuções, credenciais e muito mais através de ferramentas MCP.

## 🔍 Buscar Workflows

### Por nome específico
```javascript
mcp__n8n__n8n_list_workflows({
  name: "coletivos-requisicao",
  limit: 1
})
```

### Listar apenas workflows ativos
```javascript
mcp__n8n__n8n_list_workflows({
  active: true
})
```

### Filtrar por tags
```javascript
mcp__n8n__n8n_list_workflows({
  tags: "production,critical",
  active: true
})
```

### Paginação de resultados
```javascript
// Primeira página
page1 = mcp__n8n__n8n_list_workflows({
  limit: 10
})

// Próxima página usando cursor
page2 = mcp__n8n__n8n_list_workflows({
  limit: 10,
  cursor: page1.nextCursor
})
```

### Projeção de campos (otimizar resposta)
```javascript
mcp__n8n__n8n_list_workflows({
  limit: 5,
  projection: ["id", "name", "active", "tags"]
})
```

## 🚀 Operações com Workflows

### Criar workflow
```javascript
mcp__n8n__n8n_create_workflow({
  name: "meu-workflow",
  nodes: [...],
  connections: {...},
  settings: { executionOrder: "v1" }
})
```

### Ativar/Desativar workflow
```javascript
// Ativar
mcp__n8n__n8n_activate_workflow({
  id: "workflow-id"
})

// Desativar
mcp__n8n__n8n_deactivate_workflow({
  id: "workflow-id"
})
```

### Executar workflow
```javascript
mcp__n8n__n8n_execute_workflow({
  workflowId: "workflow-id",
  data: {
    // Dados de entrada
    campo1: "valor1",
    campo2: "valor2"
  }
})
```

## 📊 Gerenciar Execuções

### Listar execuções
```javascript
// Todas execuções
mcp__n8n__n8n_list_executions({
  limit: 20
})

// Filtrar por status
mcp__n8n__n8n_list_executions({
  status: "error",
  limit: 10
})

// Por workflow específico
mcp__n8n__n8n_list_executions({
  workflowId: "workflow-id",
  status: "success"
})
```

### Obter detalhes de execução
```javascript
mcp__n8n__n8n_get_execution({
  id: "execution-id",
  includeData: true  // Incluir dados completos
})
```

## 🔐 Credenciais

### Listar tipos de credenciais disponíveis
```javascript
mcp__n8n__n8n_get_credential_types()
```

### Criar credencial
```javascript
mcp__n8n__n8n_create_credential({
  name: "Minha API Key",
  type: "httpHeaderAuth",
  data: {
    // Dados encriptados da credencial
  }
})
```

## 🏷️ Tags

### Criar tag
```javascript
mcp__n8n__n8n_create_tag({
  name: "production"
})
```

### Listar tags
```javascript
mcp__n8n__n8n_list_tags({
  limit: 50
})
```

## 🔧 Variáveis

### Criar variável
```javascript
mcp__n8n__n8n_create_variable({
  key: "API_ENDPOINT",
  value: "https://api.example.com"
})
```

### Listar variáveis
```javascript
mcp__n8n__n8n_list_variables({
  limit: 100
})
```

## 💡 Dicas e Truques

### 1. Busca eficiente por nome
Ao invés de listar todos workflows e filtrar localmente, use o parâmetro `name`:
```javascript
// ❌ Ineficiente
workflows = mcp__n8n__n8n_list_workflows({ limit: 100 })
target = workflows.data.find(w => w.name === "meu-workflow")

// ✅ Eficiente
result = mcp__n8n__n8n_list_workflows({
  name: "meu-workflow",
  limit: 1
})
```

### 2. Combinação de filtros
Combine múltiplos filtros para resultados precisos:
```javascript
mcp__n8n__n8n_list_workflows({
  active: true,
  tags: "critical",
  name: "backup",
  limit: 5
})
```

### 3. Paginação para grandes conjuntos
Para processar todos workflows em lotes:
```javascript
let cursor = null;
do {
  const result = mcp__n8n__n8n_list_workflows({
    limit: 50,
    cursor: cursor
  });

  // Processar result.data

  cursor = result.nextCursor;
} while (cursor);
```

### 4. Projeção para otimizar performance
Quando você não precisa de todos os dados:
```javascript
// Buscar apenas informações essenciais
mcp__n8n__n8n_list_workflows({
  projection: ["id", "name", "active"],
  limit: 100
})
```

### 5. Tratamento de erros
Sempre considere que operações podem falhar:
```javascript
try {
  result = mcp__n8n__n8n_execute_workflow({
    workflowId: "workflow-id",
    data: {...}
  })
} catch (error) {
  // Tratar erro
  console.error("Workflow execution failed:", error.message)
}
```

## 📝 Parâmetros Importantes

### Parâmetro `name` em list_workflows
- **Tipo**: string
- **Descrição**: Filtra workflows por nome (correspondência exata ou parcial)
- **Exemplo**: `name: "coletivos-requisicao"`

### Parâmetro `cursor` para paginação
- **Tipo**: string
- **Descrição**: Token de paginação retornado em `nextCursor`
- **Exemplo**: `cursor: "eyJsaW1pdCI6MTAsIm9mZnNldCI6MTB9"`

### Parâmetro `projection`
- **Tipo**: array de strings
- **Descrição**: Lista de campos para incluir na resposta
- **Exemplo**: `projection: ["id", "name", "nodes"]`

## 🐛 Troubleshooting

### Erro: "Workflow not found"
- Verifique se o nome está correto (case-sensitive)
- Use o parâmetro `name` para buscar

### Erro: "Response too large"
- Use `limit` menor
- Use `projection` para reduzir campos
- Use paginação com `cursor`

### Erro: "Invalid API key"
- Verifique o arquivo `.env`
- Confirme que `N8N_API_KEY` está configurado

## 📚 Referências

- [Documentação oficial n8n API](https://docs.n8n.io/api/)
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/sdk)