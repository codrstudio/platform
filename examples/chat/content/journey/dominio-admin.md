---
id: dominio-admin
title: Painel Administrativo
estimatedTime: 7 min
objectives:
  - Conhecer o painel de administração
  - Entender as seções disponíveis
  - Preparar-se para customizar sua experiência
icon: ⚙️
---

# Painel Administrativo ⚙️

Bem-vindo à **fase de Domínio**! Agora você vai aprender a configurar e personalizar o NIC Chat através do painel administrativo.

## 🎯 O que é o Painel Admin?

O painel Admin é sua **central de controle** do NIC Chat. Aqui você pode:

- 🎮 Configurar a jornada gamificada
- 💬 Gerenciar configurações de chat
- 📊 Visualizar e limpar histórico
- 📤 Exportar dados
- 🔧 Personalizar sua experiência

## 📍 Como Acessar

1. Clique em **"Admin"** no menu de navegação (topo da página)
2. Você será redirecionado para `/admin`
3. Todas as configurações ficam em uma única tela organizada por abas

## 🗂️ Estrutura do Painel

O painel é dividido em **4 seções principais**:

### 1. 🗺️ Jornada de Descoberta

Controle total sobre o sistema de gamificação:

- **Barra de progresso**: Mostrar/ocultar barra no topo
- **Widget de próxima etapa**: Ativar/desativar widget flutuante
- **Índice de etapas**: Visualizar todas as 14 etapas
- **Reiniciar jornada**: Reset completo do progresso

### 2. 💬 Configurações de Chat

Ajustes da experiência de conversa:

- **Provedor de IA**: Selecionar modelo (GPT-4, Claude, etc)
- **Temperatura**: Controlar criatividade das respostas
- **Máximo de tokens**: Limitar tamanho das respostas
- **Sugestões inteligentes**: Ativar/desativar sidebar de sugestões

### 3. 📜 Gerenciamento de Histórico

Controle sobre suas conversas:

- **Visualizar histórico**: Lista de todas as mensagens
- **Estatísticas**: Número de mensagens, tempo de uso
- **Limpar histórico**: Deletar todas as conversas
- **Exportar conversas**: Download em JSON ou texto

### 4. 📤 Exportação de Dados

Baixe seus dados para backup ou análise:

- **Exportar chat**: Histórico de mensagens
- **Exportar progresso**: Dados da jornada
- **Exportar configurações**: Suas preferências
- **Formato**: JSON estruturado ou texto simples

## 🎨 Design da Interface Admin

### Layout

- **Desktop**: Cards lado a lado organizados em grid
- **Mobile**: Cards empilhados verticalmente
- **Responsivo**: Adapta-se a qualquer tamanho de tela

### Elementos Visuais

- **Cards brancos**: Fundo limpo (ou escuro no dark mode)
- **Ícones descritivos**: Facilitam identificação rápida
- **Botões de ação**: CTAs claros e coloridos
- **Feedback visual**: Confirmações e avisos

## ⚡ Funcionalidades Principais

### Alternar Visibilidade de Gamificação

**Por que usar?**
- Se você quer focar apenas no chat sem distrações
- Para apresentações ou demos
- Preferência pessoal de UX minimalista

**Como fazer:**
1. Vá para seção "Jornada de Descoberta"
2. Toggle "Mostrar barra de progresso"
3. Toggle "Mostrar widget de próxima etapa"
4. Mudanças aplicam imediatamente

### Visualizar Progresso Detalhado

**Informações disponíveis:**
- Percentual de conclusão (0-100%)
- Fase atual (Descoberta, Exploração, Domínio, Maestria)
- Etapas visitadas vs. total
- Última etapa visitada
- Data/hora da última atividade

### Gerenciar Histórico de Chat

**Opções:**

1. **Ver estatísticas**
   - Total de mensagens enviadas
   - Total de respostas recebidas
   - Tempo médio de resposta
   - Dia/hora de uso mais frequente

2. **Pesquisar no histórico**
   - Busca por palavra-chave
   - Filtro por data
   - Filtro por tipo (usuário ou IA)

3. **Limpar histórico**
   - ⚠️ **Cuidado**: Ação irreversível!
   - Confirmação obrigatória
   - Opção de exportar antes de limpar

### Exportar Dados

**Formatos disponíveis:**

**JSON** (estruturado):
```json
{
  "messages": [...],
  "metadata": {
    "exportedAt": "2025-01-19T...",
    "totalMessages": 42
  }
}
```

**TXT** (legível):
```
=== NIC Chat Export ===
Date: 2025-01-19

[User]: Olá!
[NIC]: Olá! Como posso...

...
```

## 🔒 Privacidade e Dados

### Onde os dados ficam armazenados?

- **localStorage do navegador**: Tudo fica local
- **Não enviamos para servidores**: Seus dados são 100% seus
- **Sincronização entre abas**: Funciona no mesmo navegador
- **Limpeza**: Limpar cache do navegador apaga tudo

### Backup Recomendado

1. Exporte regularmente seus dados
2. Salve o JSON em local seguro (Drive, Dropbox, etc)
3. Se limpar cache do navegador, reimporte

## 💡 Dicas de Uso

💡 **Exporte antes de limpar**: Sempre faça backup antes de deletar histórico.

💡 **Desative gamificação temporariamente**: Útil para demos ou quando quiser focar só no chat.

💡 **Monitore estatísticas**: Veja como você usa o NIC e otimize seu workflow.

💡 **Reset de jornada**: Se quiser refazer o tour guiado, use a opção "Reiniciar jornada".

## 🚨 Cuidados Importantes

⚠️ **Limpar histórico é irreversível**: Não há como recuperar sem backup.

⚠️ **Configurações são locais**: Cada navegador/dispositivo tem suas próprias.

⚠️ **Modo anônimo**: Dados não persistem ao fechar janela.

## Próximos passos

Explore a seção **Configurar Jornada** para aprender a personalizar o sistema de gamificação em detalhes!

---

**Tempo estimado**: 7 minutos
**Pré-requisitos**: Exploração - Streaming
**Fase**: Domínio (50-75%)
