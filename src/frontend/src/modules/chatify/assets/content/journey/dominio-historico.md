---
id: dominio-historico
title: Gerenciar Histórico
estimatedTime: 5 min
objectives:
  - Visualizar histórico completo de conversas
  - Entender como dados são armazenados
  - Exportar e limpar histórico com segurança
icon: 📜
---

# Gerenciar Histórico 📜

Aprenda a controlar, visualizar e fazer backup de todas as suas conversas com o NIC!

## 📊 O que é o Histórico?

O histórico é o **registro completo** de todas as suas interações com o NIC Chat:

- Todas as mensagens que você enviou
- Todas as respostas da IA
- Timestamps de cada mensagem
- Metadata (modelo usado, tokens, etc)

## 💾 Como os Dados São Armazenados?

### Armazenamento Local (localStorage)

**Onde fica:**
- Navegador do usuário (localStorage)
- Chave: `nic-chat-messages`
- Formato: JSON estruturado

**Características:**
- ✅ **100% privado**: Nunca sai do seu navegador
- ✅ **Persistente**: Sobrevive a recarregamentos
- ✅ **Sincronizado entre abas**: Mesmo navegador
- ❌ **Local por navegador**: Não sincroniza entre dispositivos
- ❌ **Vulnerável a limpeza de cache**: Limpar dados do navegador apaga tudo

### Estrutura dos Dados

```json
[
  {
    "id": "msg_1705680001",
    "role": "user",
    "content": "Olá!",
    "timestamp": "2025-01-19T10:00:01Z"
  },
  {
    "id": "msg_1705680002",
    "role": "assistant",
    "content": "Olá! Como posso ajudar?",
    "timestamp": "2025-01-19T10:00:02Z"
  }
]
```

## 👀 Visualizando o Histórico

### No Chat

- Todas as mensagens ficam visíveis na tela
- Role para cima para ver mensagens antigas
- Mensagens do usuário à direita (azul)
- Mensagens da IA à esquerda (cinza)

### No Painel Admin

**Seção "Gerenciamento de Histórico":**

1. **Contador de mensagens**
   - Total de mensagens enviadas
   - Total de respostas recebidas
   - Média de mensagens por sessão

2. **Última atividade**
   - Data e hora da última mensagem
   - Tempo desde última interação

3. **Estatísticas**
   - Total de conversas
   - Tempo total de uso
   - Dia da semana mais ativo

## 🔍 Pesquisa no Histórico

### Busca por Palavra-chave

```
Buscar por: "React"
Resultados: 12 mensagens encontradas
```

### Filtros Disponíveis

- **Por data**: Hoje, Última semana, Último mês, Tudo
- **Por tipo**: Usuário, Assistente, Ambos
- **Por tamanho**: Curtas (<100 chars), Médias, Longas (>500 chars)

## 📤 Exportando o Histórico

### Por que exportar?

- **Backup**: Proteger contra perda de dados
- **Análise**: Estudar padrões de uso
- **Documentação**: Salvar conversas importantes
- **Migração**: Trocar de navegador/dispositivo

### Formatos de Exportação

#### 1. JSON (Estruturado)

**Melhor para:**
- Processamento automatizado
- Re-importação futura
- Análise com ferramentas

**Exemplo:**
```json
{
  "metadata": {
    "exportedAt": "2025-01-19T10:00:00Z",
    "version": "1.0",
    "totalMessages": 42
  },
  "messages": [...]
}
```

#### 2. TXT (Legível)

**Melhor para:**
- Leitura humana
- Compartilhamento
- Documentação

**Exemplo:**
```
=== NIC Chat Export ===
Exported: 2025-01-19 10:00
Total: 42 messages

[10:00] User: Olá!
[10:00] NIC: Olá! Como posso ajudar?
...
```

#### 3. Markdown (Formatado)

**Melhor para:**
- Publicação
- Tutoriais
- GitHub/Notion

**Exemplo:**
```markdown
# Conversa com NIC Chat
**Data**: 2025-01-19

## Mensagem 1
**Você**: Olá!

**NIC**: Olá! Como posso ajudar?
```

### Como Exportar

1. Vá para Admin > Histórico
2. Clique em "Exportar Conversas"
3. Escolha o formato (JSON, TXT, MD)
4. Clique em "Download"
5. Arquivo é baixado para Downloads/

## 🗑️ Limpando o Histórico

### ⚠️ Atenção: Ação Irreversível!

Limpar histórico **apaga permanentemente** todas as mensagens. Não há como recuperar sem backup.

### Quando Limpar?

- Trocar de projeto/contexto
- Liberar espaço no navegador
- Reset completo após testes
- Privacidade (compartilhar computador)

### Como Limpar com Segurança

**Passo a passo recomendado:**

1. **Exporte primeiro**
   - Admin > Histórico > Exportar
   - Salve JSON em local seguro

2. **Confirme o backup**
   - Abra o arquivo exportado
   - Verifique que está completo

3. **Limpe o histórico**
   - Admin > Histórico > Limpar
   - Confirme a ação no popup

4. **Verifique limpeza**
   - Contador deve estar em 0
   - Chat deve estar vazio

### Opções de Limpeza

- **Limpar tudo**: Apaga todas as mensagens
- **Limpar últimos 7 dias**: Mantém histórico antigo
- **Limpar sessão atual**: Mantém conversas anteriores

## 🔐 Privacidade e Segurança

### Seus dados são privados

- ❌ Não enviamos dados para servidores
- ❌ Não fazemos tracking
- ❌ Não compartilhamos com terceiros
- ✅ Tudo fica 100% local

### Cuidados com localStorage

**Riscos:**
- Qualquer pessoa com acesso ao navegador pode ver
- Extensões maliciosas podem acessar
- Modo anônimo apaga ao fechar

**Proteções:**
- Use senha no computador
- Feche navegador ao sair
- Não use em computadores públicos
- Ative criptografia de disco (BitLocker/FileVault)

### Modo Anônimo / Privado

Se usar navegador em modo anônimo:
- ✅ Histórico funciona durante sessão
- ❌ Tudo é apagado ao fechar janela
- ❌ Não há como recuperar

## 📊 Estatísticas Úteis

### Métricas Disponíveis

- **Uso ao longo do tempo**: Gráfico de mensagens por dia
- **Horários mais ativos**: Quando você mais usa
- **Tópicos frequentes**: Palavras-chave mais comuns
- **Tempo médio de resposta**: Performance da IA

### Insights

```
Você enviou 127 mensagens nos últimos 30 dias
Horário mais ativo: 14h-16h
Tópicos principais: JavaScript, React, APIs
```

## 💡 Dicas de Gerenciamento

💡 **Backup regular**: Exporte semanalmente se usa muito.

💡 **Organize por projeto**: Limpe entre diferentes contextos de trabalho.

💡 **Nomes descritivos**: Ao exportar, use nome claro: `nic-chat-2025-01-19-react-study.json`.

💡 **Cloud backup**: Salve exports no Drive/Dropbox para acessar de qualquer lugar.

## Próximos passos

Parabéns! Você completou a fase de **Domínio** (75%)! 🎉

Avance para a fase final de **Maestria** explorando recursos avançados como widgets e gamificação completa!

---

**Tempo estimado**: 5 minutos
**Pré-requisitos**: Domínio - Configurar Chat
**Fase**: Domínio (50-75%)
**Próxima fase**: Maestria (75-100%)
