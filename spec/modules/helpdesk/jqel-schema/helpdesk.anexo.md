# Schema: helpdesk.anexo

## Descrição
Arquivos anexados a chamados ou comentários.

## Campos

- **id** (UUID, PK)
- **chamadoId** (UUID, FK → helpdesk.chamado, obrigatório)
- **comentarioId** (UUID, FK → helpdesk.comentario, nullable)
- **nomeArquivo** (string, obrigatório)
- **tamanho** (integer, obrigatório) - bytes
- **mimeType** (string, obrigatório)
- **caminhoArquivo** (string, obrigatório) - path no storage
- **urlDownload** (string, nullable) - URL temporária para download
- **enviado­PorId** (UUID, FK → system.usuario, obrigatório)
- **dataEnvio** (datetime, obrigatório)
- **visibilidade** (enum: publico, interno, default: publico)

## Relacionamentos

- Pertence a: `helpdesk.chamado`
- Pode pertencer a: `helpdesk.comentario`
- Enviado por: `system.usuario`

## Permissões

- **Read**: mesmo que o chamado/comentário associado
- **Write**: atendente, supervisor, admin, cliente (em seus chamados)
- **Delete**: admin, supervisor, autor (dentro de 15min)

## Validações

- Tamanho máximo: 50MB por arquivo
- Tipos permitidos: documentos, imagens, PDFs (configurável)
- Validação de vírus antes de aceitar upload

## Exemplo de Query JQEL

```json
{
  "schema": "helpdesk",
  "select": "anexo",
  "where": {
    "chamadoId": { "$eq": "uuid-chamado" }
  },
  "output": ["id", "nomeArquivo", "tamanho", "mimeType", "dataEnvio", "urlDownload"]
}
```
