# Postman MCP Server

Ferramenta MCP (Model Context Protocol) para integração com a API do Postman, permitindo gerenciar programaticamente workspaces, coleções, ambientes, APIs, monitores e mock servers.

## Recursos

### 📁 Workspaces
- Listar, criar, atualizar e deletar workspaces
- Suporte para diferentes tipos: personal, team, private, public, partner

### 📚 Collections
- Gerenciar coleções de requisições API
- Criar, editar e excluir coleções
- Suporte para importação/exportação de definições

### 🌍 Environments
- Gerenciar ambientes e variáveis
- Criar conjuntos de variáveis para dev, staging, produção
- Atualizar valores de variáveis dinamicamente

### 🎯 APIs
- Gerenciar definições de API (OpenAPI, RAML, GraphQL)
- Vincular coleções e documentação
- Versionamento de APIs

### 📊 Monitors
- Criar monitores para executar coleções periodicamente
- Configurar schedules (cron)
- Executar monitores sob demanda
- Monitoramento contínuo de APIs

### 🎭 Mock Servers
- Criar servidores mock a partir de coleções
- Simular endpoints de API para desenvolvimento frontend
- Configurar mocks públicos ou privados

### 👤 User
- Obter informações do usuário autenticado

## Configuração

### 1. Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` na pasta `mcp-tools/postman/`:

```bash
cd mcp-tools/postman
cp .env.example .env
```

Edite o arquivo `.env` e configure suas credenciais:

```env
# Postman API Configuration
POSTMAN_SERVER=https://api.getpostman.com
POSTMAN_API_KEY=PMAK-your-api-key-here
```

### 2. Obter API Key do Postman

1. Acesse o Postman e faça login
2. Vá para: **Settings** > **API Keys**
3. Clique em **Generate API Key**
4. Copie a chave e adicione ao `.env`

### 3. Registro no MCP

A ferramenta já está registrada em `.mcp.json`:

```json
{
  "mcpServers": {
    "postman": {
      "type": "stdio",
      "command": "node",
      "args": ["mcp-tools/postman/server.js"],
      "env": {}
    }
  }
}
```

## Uso com IA

A ferramenta foi projetada para ser facilmente compreendida e utilizada por assistentes de IA. Cada função possui descrições detalhadas que explicam:

- **O que faz**: Propósito da operação
- **Quando usar**: Contextos apropriados
- **Parâmetros**: Detalhes sobre cada parâmetro
- **Exemplos**: Casos de uso comuns

### Exemplos de Comandos para IA

```
"Liste todos os meus workspaces do Postman"
→ Usa: postman_list_workspaces

"Crie uma nova coleção chamada 'API Testing' no workspace X"
→ Usa: postman_create_collection

"Configure um monitor para executar a coleção Y a cada hora"
→ Usa: postman_create_monitor

"Crie um ambiente de desenvolvimento com as variáveis BASE_URL e API_KEY"
→ Usa: postman_create_environment

"Crie um mock server público para a coleção Z"
→ Usa: postman_create_mock
```

## Ferramentas Disponíveis

### User
- `postman_get_user` - Informações do usuário autenticado

### Workspaces
- `postman_list_workspaces` - Listar workspaces
- `postman_get_workspace` - Detalhes de workspace
- `postman_create_workspace` - Criar workspace
- `postman_update_workspace` - Atualizar workspace
- `postman_delete_workspace` - Deletar workspace

### Collections
- `postman_list_collections` - Listar coleções
- `postman_get_collection` - Detalhes de coleção
- `postman_create_collection` - Criar coleção
- `postman_update_collection` - Atualizar coleção
- `postman_delete_collection` - Deletar coleção

### Environments
- `postman_list_environments` - Listar ambientes
- `postman_get_environment` - Detalhes de ambiente
- `postman_create_environment` - Criar ambiente
- `postman_update_environment` - Atualizar ambiente
- `postman_delete_environment` - Deletar ambiente

### APIs
- `postman_list_apis` - Listar APIs
- `postman_get_api` - Detalhes de API
- `postman_create_api` - Criar API
- `postman_update_api` - Atualizar API
- `postman_delete_api` - Deletar API

### Monitors
- `postman_list_monitors` - Listar monitores
- `postman_get_monitor` - Detalhes de monitor
- `postman_create_monitor` - Criar monitor
- `postman_update_monitor` - Atualizar monitor
- `postman_delete_monitor` - Deletar monitor
- `postman_run_monitor` - Executar monitor imediatamente

### Mocks
- `postman_list_mocks` - Listar mock servers
- `postman_get_mock` - Detalhes de mock server
- `postman_create_mock` - Criar mock server
- `postman_update_mock` - Atualizar mock server
- `postman_delete_mock` - Deletar mock server

## Arquitetura

```
mcp-tools/postman/
├── server.js         # Servidor MCP principal
├── package.json      # Dependências
└── README.md        # Esta documentação
```

### Componentes

- **PostmanClient**: Classe que encapsula todas as chamadas à API do Postman
- **MCP Server**: Servidor que expõe as ferramentas via protocolo MCP
- **Tools Definitions**: Definições detalhadas de cada ferramenta para consumo por IA

## Referências

- [Postman API Documentation](https://learning.postman.com/docs/developer/postman-api/intro-api/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Postman Workspaces](https://www.postman.com/product/workspaces/)

## Licença

MIT
