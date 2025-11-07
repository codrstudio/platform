# Workflows n8n - Backup

Backup dos workflows do n8n organizados por tags/pastas.

## Estrutura

```
workflows/
└── _sem-tag/          # Workflows ativos sem tag/pasta (8 workflows)
```

## Estatísticas

- **Total de workflows ativos**: 8
- **Workflows arquivados removidos**: 24
- **Última atualização**: 2025-10-29

## Workflows Ativos

### _sem-tag/ (8 workflows)

**Autenticação (4 workflows)**:
- `auth-login.json` - Login de usuários
- `auth-logout.json` - Logout individual
- `auth-logout-all.json` - Logout de todas as sessões
- `auth-refresh.json` - Refresh de token JWT

**Integrações & Utilidades (4 workflows)**:
- `emit-jwt.json` - Emissão de tokens JWT
- `find-user.json` - Busca de usuários
- `groq-chat.json` - Chat com Groq AI
- `prime-care-api-backend.json` - Backend API PrimeCare

## Como fazer backup

Para atualizar o backup dos workflows, execute:

```bash
node .tmp/backup-n8n-workflows.js
```

O script irá:
1. Conectar na API do n8n em `https://n8n.codrstudio.dev`
2. Listar todas as tags/pastas
3. Baixar todos os workflows
4. Organizar por pasta baseado nas tags
5. Salvar em formato JSON

## Configuração

As credenciais da API n8n estão em `mcp-tools/n8n/.env`:
- **Base URL**: https://n8n.codrstudio.dev
- **Auth**: API Key via header

## Formato dos arquivos

Cada workflow é salvo em JSON contendo:
- Metadados (id, nome, descrição, tags)
- Nodes (nós do workflow)
- Connections (conexões entre nós)
- Settings (configurações)

## Notas

- Os nomes dos arquivos são sanitizados (sem caracteres especiais)
- Workflows sem tag vão para a pasta `_sem-tag/`
- Se um workflow tem múltiplas tags, usa a primeira tag para determinar a pasta
- Encoding: UTF-8
