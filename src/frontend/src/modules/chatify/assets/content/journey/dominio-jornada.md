---
id: dominio-jornada
title: Configurar Jornada
estimatedTime: 5 min
objectives:
  - Personalizar sistema de gamificação
  - Entender as 14 etapas em detalhes
  - Controlar visibilidade de elementos
icon: 🗺️
---

# Configurar Jornada 🗺️

Aprenda a personalizar completamente o sistema de jornada gamificada do NIC Chat!

## 🎮 O que é a Jornada?

A jornada é um **sistema de onboarding gamificado** com **14 etapas** distribuídas em **4 fases**:

### Fases da Jornada

1. **🔵 Descoberta** (0-25%)
   - Home, Features, Como Usar, CTA
   - Foco: Conhecer o NIC

2. **🟢 Exploração** (25-50%)
   - Chat, Primeira Mensagem, Streaming
   - Foco: Usar pela primeira vez

3. **🟡 Domínio** (50-75%)
   - Admin, Jornada, Chat Config, Histórico
   - Foco: Configurar e personalizar

4. **🟣 Maestria** (75-100%)
   - Widget, Gamificação, Exportação
   - Foco: Dominar recursos avançados

## ⚙️ Configurações Disponíveis

### 1. Barra de Progresso

**O que é:** Barra fina colorida no topo da página (desktop only)

**Configurações:**
- ✅ **Mostrar**: Barra visível, indica progresso em tempo real
- ❌ **Ocultar**: Remove barra, interface mais limpa

**Cores por fase:**
- Azul (Descoberta)
- Verde (Exploração)
- Amarelo (Domínio)
- Roxo (Maestria)
- Verde-escuro (Completo - 100%)

### 2. Widget de Próxima Etapa

**O que é:** Card flutuante no canto inferior esquerdo

**Configurações:**
- ✅ **Ativar**: Mostra sugestão de próxima etapa
- ❌ **Desativar**: Remove widget, mais espaço na tela

**Comportamento:**
- Aparece após 30s ou 70% de scroll
- Mostra mensagem de boas-vindas na primeira vez
- Sugere próxima etapa recomendada
- Botão "X" dispensa permanentemente

### 3. Visualização do Índice

**Como acessar:**
- Clique no FAB com ícone 🗺️ (desktop)
- Ou acesse pelo painel Admin

**O que mostra:**
- Todas as 14 etapas organizadas por fase
- Progresso de cada fase (X/Y concluídas)
- Status de cada etapa (✓ completa ou ○ pendente)
- Link direto para cada etapa

## 📊 Rastreamento de Progresso

### Como funciona?

O sistema rastreia automaticamente:

1. **Páginas visitadas**
   - URL completo (path + section/hash)
   - Timestamp da visita
   - Ordem de visitação

2. **Cálculo de porcentagem**
   - Cada etapa tem um peso (soma = 100%)
   - Progresso = soma dos pesos das etapas visitadas

3. **Persistência**
   - Salvo em localStorage
   - Sincronizado entre abas
   - Mantém histórico completo

### Exemplo de Progresso

```
Visitadas:
✓ descoberta-home (6.25%)
✓ descoberta-features (6.25%)
✓ exploracao-chat (8.34%)

Total: 20.84%
Fase atual: Descoberta
Próxima: descoberta-como-usar
```

## 🔄 Gerenciamento de Progresso

### Opção: Reiniciar Jornada

**Quando usar:**
- Quer refazer o tour completo
- Resetar para demonstração
- Começar do zero após mudanças no sistema

**O que acontece:**
- ❌ Todo progresso é zerado (0%)
- ❌ Histórico de visitas é limpo
- ❌ Configurações voltam ao padrão
- ✅ Pode ser feito a qualquer momento

**Como fazer:**
1. Vá para Admin > Jornada
2. Clique em "Reiniciar Jornada"
3. Confirme a ação
4. Progresso volta para 0%

### Opção: Reativar Widget

Se você dispensou o widget permanentemente:

1. Vá para Admin > Jornada
2. Toggle "Mostrar widget de próxima etapa" para ON
3. Widget volta a aparecer

## 🎯 Estratégias de Uso

### Modo Foco (sem gamificação)

Para quem quer usar só o chat:

1. Desative barra de progresso
2. Desative widget de próxima etapa
3. Interface limpa e minimalista

### Modo Aprendizado (full gamificação)

Para novos usuários ou onboarding:

1. Ative todos os elementos
2. Siga as etapas na ordem
3. Complete 100% da jornada

### Modo Híbrido

Use gamificação inicial, depois desative:

1. Complete fase de Descoberta
2. Desative widget na fase de Exploração
3. Mantenha barra para referência

## 📱 Diferenças Mobile vs Desktop

### Desktop (≥ 768px)

- Barra de progresso visível
- Widget flutuante habilitado
- FAB stack no canto inferior direito
- Índice completo em modal

### Mobile (< 768px)

- Barra de progresso oculta
- Widget desabilitado (economia de espaço)
- FAB stack oculto
- Índice acessível via menu

## 💾 Dados Salvos

O sistema persiste:

```json
{
  "visitedPages": ["descoberta-home", "descoberta-features"],
  "lastVisited": "descoberta-features",
  "completionPercentage": 12.5,
  "currentPhase": "descoberta",
  "timestamp": 1705680000000,
  "settings": {
    "showProgressBar": true,
    "showNextStepWidget": true
  }
}
```

## 💡 Dicas Avançadas

💡 **URL direta**: Você pode ir direto para qualquer etapa sem seguir ordem.

💡 **Compartilhamento**: URLs com hash (#features) contam como etapas separadas.

💡 **Multi-dispositivo**: Progresso é local por navegador/dispositivo.

💡 **Backup**: Exporte progresso pelo painel Admin antes de trocar de navegador.

## Próximos passos

Continue para **Configurar Chat** e aprenda a ajustar os parâmetros da IA!

---

**Tempo estimado**: 5 minutos
**Pré-requisitos**: Domínio - Painel Admin
**Fase**: Domínio (50-75%)
