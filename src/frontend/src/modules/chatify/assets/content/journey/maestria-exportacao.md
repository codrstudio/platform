---
id: maestria-exportacao
title: Exportar Dados
estimatedTime: 5 min
objectives:
  - Dominar exportação de todos os dados
  - Entender formatos de backup
  - Aprender a migrar entre ambientes
icon: 📤
---

# Exportar Dados 📤

Última etapa da jornada! Aprenda a fazer backup completo e migrar seus dados do NIC Chat.

## 🎯 Dados Exportáveis

O NIC Chat permite exportar **3 tipos de dados**:

### 1. Histórico de Conversas

**O que inclui:**
- Todas as mensagens (usuário + IA)
- Timestamps de cada mensagem
- Metadata (modelo usado, tokens, etc)
- IDs únicos para referência

**Formatos:** JSON, TXT, Markdown

### 2. Progresso da Jornada

**O que inclui:**
- Etapas visitadas e ordem
- Porcentagem de conclusão
- Fase atual
- Última atividade
- Configurações personalizadas

**Formato:** JSON estruturado

### 3. Configurações do Sistema

**O que inclui:**
- Preferências de tema (light/dark)
- Configurações de gamificação
- Parâmetros de IA (temperatura, tokens, provedor)
- Personalização de UI

**Formato:** JSON

## 📦 Formatos de Exportação

### JSON (Recomendado para Backup)

**Vantagens:**
- Estruturado e legível
- Fácil de processar programaticamente
- Suporta re-importação
- Mantém tipos de dados

**Exemplo - Conversa:**
```json
{
  "metadata": {
    "exportedAt": "2025-01-19T10:00:00Z",
    "version": "1.0.0",
    "source": "NIC Chat",
    "totalMessages": 42
  },
  "messages": [
    {
      "id": "msg_1705680001",
      "role": "user",
      "content": "Olá!",
      "timestamp": "2025-01-19T09:00:01Z"
    },
    {
      "id": "msg_1705680002",
      "role": "assistant",
      "content": "Olá! Como posso ajudar?",
      "timestamp": "2025-01-19T09:00:02Z",
      "metadata": {
        "model": "gpt-4",
        "tokens": 8,
        "temperature": 0.7
      }
    }
  ]
}
```

**Exemplo - Progresso:**
```json
{
  "metadata": {
    "exportedAt": "2025-01-19T10:00:00Z",
    "version": "1.0.0"
  },
  "progress": {
    "visitedPages": [
      "descoberta-home",
      "descoberta-features",
      "exploracao-chat"
    ],
    "lastVisited": "exploracao-chat",
    "completionPercentage": 20.84,
    "currentPhase": "descoberta",
    "timestamp": 1705680000000,
    "settings": {
      "showProgressBar": true,
      "showNextStepWidget": true
    }
  }
}
```

### TXT (Legível para Humanos)

**Vantagens:**
- Fácil de ler
- Pode abrir em qualquer editor
- Bom para compartilhar

**Exemplo:**
```
=== NIC Chat - Histórico de Conversas ===
Exportado em: 19/01/2025 às 10:00
Total de mensagens: 42

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[09:00:01] Você:
Olá!

[09:00:02] NIC:
Olá! Como posso ajudar?

[09:01:15] Você:
Explique o que é React

[09:01:18] NIC:
React é uma biblioteca JavaScript para construir interfaces de usuário...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fim do histórico
```

### Markdown (Para Documentação)

**Vantagens:**
- Renderiza bem em GitHub, Notion, etc
- Formatação preservada
- Pode incluir code blocks e imagens

**Exemplo:**
```markdown
# Conversa com NIC Chat

**Data**: 19/01/2025
**Total de mensagens**: 42

---

## Mensagem 1
**[09:00:01] Você:**
Olá!

**[09:00:02] NIC:**
Olá! Como posso ajudar?

---

## Mensagem 2
**[09:01:15] Você:**
Explique o que é React

**[09:01:18] NIC:**
React é uma biblioteca JavaScript para construir interfaces de usuário...

```javascript
function Hello() {
  return <h1>Hello, React!</h1>
}
```
```

## 🔧 Como Exportar

### Via Painel Admin

1. **Acesse Admin**
   - Clique em "Admin" no menu

2. **Vá para seção de Exportação**
   - Scroll até "Exportação de Dados"

3. **Escolha o que exportar**
   - ☑️ Histórico de conversas
   - ☑️ Progresso da jornada
   - ☑️ Configurações

4. **Selecione formato**
   - JSON (backup completo)
   - TXT (leitura humana)
   - MD (documentação)

5. **Clique em "Exportar"**
   - Arquivo baixa para pasta Downloads
   - Nome: `nic-chat-export-2025-01-19.json`

### Via API (Avançado)

```typescript
// Hook customizado
import { useJourneyProgress } from '@/hooks/useJourneyProgress'
import { useChatHistory } from '@/hooks/useChatHistory'

export function useDataExport() {
  const { progress } = useJourneyProgress()
  const { messages } = useChatHistory()

  function exportAll(format: 'json' | 'txt' | 'md') {
    const data = {
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        format
      },
      messages,
      progress,
      settings: {
        theme: localStorage.getItem('nic-theme'),
        // ... outras configs
      }
    }

    if (format === 'json') {
      downloadJSON(data, `nic-export-${Date.now()}.json`)
    } else if (format === 'txt') {
      downloadTXT(formatToText(data), `nic-export-${Date.now()}.txt`)
    } else {
      downloadMD(formatToMarkdown(data), `nic-export-${Date.now()}.md`)
    }
  }

  return { exportAll }
}
```

## 🔄 Importando Dados

### Re-importar Backup

**Cenário:** Trocou de navegador e quer recuperar dados

**Como fazer:**

1. **Localize arquivo de backup**
   - `nic-chat-export-2025-01-19.json`

2. **Acesse Admin > Importar**
   - Botão "Importar Backup"

3. **Selecione arquivo JSON**
   - Upload do arquivo local

4. **Escolha o que importar**
   - ☑️ Histórico (substituir ou mesclar)
   - ☑️ Progresso (substituir ou manter atual)
   - ☑️ Configurações (substituir)

5. **Confirme importação**
   - Dados são restaurados
   - Página recarrega automaticamente

### Migração Entre Ambientes

**Dev → Produção:**
```bash
# 1. Exportar do ambiente de dev
localStorage.getItem('nic-chat-messages')

# 2. Importar no ambiente de produção
localStorage.setItem('nic-chat-messages', '<dados>')
```

## 📊 Casos de Uso

### 1. Backup Regular

**Frequência:** Semanal ou mensal

**Processo:**
1. Exportar tudo em JSON
2. Salvar em Google Drive / Dropbox
3. Nomear com data: `nic-backup-2025-01-19.json`
4. Manter últimas 3 versões

### 2. Auditoria / Compliance

**Quando:** Antes de limpar dados

**Processo:**
1. Exportar histórico completo em TXT
2. Armazenar em sistema de arquivos seguro
3. Documentar data e responsável
4. Manter por X anos (conforme política)

### 3. Análise de Conversas

**Objetivo:** Entender padrões de uso

**Processo:**
1. Exportar histórico em JSON
2. Processar com script Python/Node
3. Extrair métricas (perguntas frequentes, tempo médio, etc)
4. Gerar relatório

**Exemplo de script:**
```python
import json

with open('nic-export.json') as f:
    data = json.load(f)

messages = data['messages']
user_msgs = [m for m in messages if m['role'] == 'user']

print(f"Total de perguntas: {len(user_msgs)}")
print(f"Palavras mais comuns: {analyze_keywords(user_msgs)}")
```

### 4. Portabilidade

**Cenário:** Mover para outro chat app

**Processo:**
1. Exportar em formato neutro (JSON)
2. Mapear campos para novo sistema
3. Importar via API do novo sistema

## 🔒 Segurança dos Dados

### Criptografia (Opcional)

Para dados sensíveis:

```typescript
import CryptoJS from 'crypto-js'

function exportEncrypted(data: object, password: string) {
  const json = JSON.stringify(data)
  const encrypted = CryptoJS.AES.encrypt(json, password).toString()

  downloadFile(encrypted, 'nic-export-encrypted.aes')
}

function importEncrypted(encrypted: string, password: string) {
  const decrypted = CryptoJS.AES.decrypt(encrypted, password).toString(CryptoJS.enc.Utf8)
  return JSON.parse(decrypted)
}
```

### Checklist de Segurança

- [ ] Nunca exporte dados sensíveis para serviços públicos
- [ ] Use senha forte se criptografar
- [ ] Armazene backups em local seguro (cloud criptografado)
- [ ] Delete backups antigos desnecessários
- [ ] Verifique permissões de arquivo (leitura privada)

## 🎊 Parabéns!

Você completou **100% da jornada** de descoberta do NIC Chat! 🎉

### Você agora é capaz de:

✅ Usar o chat com confiança
✅ Renderizar conteúdo rico (Markdown, Mermaid, código)
✅ Configurar IA conforme necessidade
✅ Gerenciar histórico e privacidade
✅ Fazer backups e migrar dados
✅ Dominar sistema de gamificação
✅ Integrar widget em outros projetos

### Próximos Passos

- Explore recursos avançados por conta própria
- Contribua com feedback e sugestões
- Compartilhe o NIC com amigos e colegas
- Continue aprendendo e experimentando!

---

**Tempo estimado**: 5 minutos
**Pré-requisitos**: Maestria - Gamificação
**Fase**: Maestria (75-100%)
**Status**: Jornada completa! 🏆
