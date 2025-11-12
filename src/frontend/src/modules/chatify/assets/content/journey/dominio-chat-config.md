---
id: dominio-chat-config
title: Configurar Chat
estimatedTime: 6 min
objectives:
  - Entender parâmetros de configuração da IA
  - Ajustar temperatura e tokens
  - Selecionar provedor de modelo
icon: 💬
---

# Configurar Chat 💬

Aprenda a ajustar os parâmetros do chat para otimizar suas respostas!

## 🎛️ Parâmetros de Configuração

O NIC Chat permite customizar como a IA gera respostas através de **3 parâmetros principais**:

### 1. Provedor de IA

**O que é:** O modelo de linguagem usado para gerar respostas.

**Opções disponíveis:**
- **GPT-4 Turbo** (OpenAI) - Mais inteligente, lento
- **GPT-3.5 Turbo** (OpenAI) - Rápido, econômico
- **Claude 3 Opus** (Anthropic) - Conversacional, criativo
- **Claude 3 Sonnet** (Anthropic) - Balanceado
- **Gemini Pro** (Google) - Multimodal

**Como escolher:**
- Desenvolvimento: GPT-3.5 (rápido e barato)
- Produção: GPT-4 ou Claude Opus (qualidade máxima)
- Análise de código: GPT-4 (melhor para programação)
- Criação de conteúdo: Claude (mais natural)

### 2. Temperatura

**O que é:** Controla a "criatividade" ou "aleatoriedade" das respostas.

**Escala:** 0.0 a 1.0

**Valores:**
- **0.0 - 0.3**: Determinístico, factual, consistente
  - Bom para: Código, matemática, respostas técnicas
  - Exemplo: "Quanto é 2+2?" → Sempre "4"

- **0.4 - 0.7**: Balanceado (padrão recomendado)
  - Bom para: Conversação geral, explicações
  - Exemplo: "Explique React" → Variação razoável

- **0.8 - 1.0**: Criativo, variado, imprevisível
  - Bom para: Escrita criativa, brainstorming
  - Exemplo: "Escreva poema" → Muito variado

**Recomendações:**
```
Código/Matemática → 0.1
Tutoriais → 0.4
Conversação → 0.7
Criação → 0.9
```

### 3. Máximo de Tokens

**O que é:** Limite de tamanho da resposta.

**Unidade:** Tokens (~0.75 palavras em português)

**Conversão aproximada:**
- 100 tokens ≈ 75 palavras ≈ 1 parágrafo
- 500 tokens ≈ 375 palavras ≈ 1 página
- 2000 tokens ≈ 1500 palavras ≈ 4-5 páginas

**Valores comuns:**
- **256 tokens**: Respostas curtas e diretas
- **512 tokens**: Explicações médias (padrão)
- **1024 tokens**: Respostas detalhadas
- **2048 tokens**: Artigos completos
- **4096 tokens**: Documentação extensa

**Trade-offs:**
- ↑ Tokens = Respostas mais completas, mas mais lentas
- ↓ Tokens = Respostas rápidas, mas possivelmente incompletas

## 🎯 Cenários de Uso

### Cenário 1: Programação Técnica

```
Provedor: GPT-4 Turbo
Temperatura: 0.2
Tokens: 1024
```

**Por quê:**
- GPT-4 é melhor em código
- Baixa temperatura = respostas determinísticas
- 1024 tokens = código completo + explicação

### Cenário 2: Conversação Casual

```
Provedor: Claude 3 Sonnet
Temperatura: 0.7
Tokens: 512
```

**Por quê:**
- Claude é mais conversacional
- Temperatura média = respostas naturais
- 512 tokens = diálogo fluido

### Cenário 3: Escrita Criativa

```
Provedor: Claude 3 Opus
Temperatura: 0.9
Tokens: 2048
```

**Por quê:**
- Claude Opus é mais criativo
- Alta temperatura = máxima variação
- 2048 tokens = textos longos

### Cenário 4: Respostas Rápidas

```
Provedor: GPT-3.5 Turbo
Temperatura: 0.5
Tokens: 256
```

**Por quê:**
- GPT-3.5 é mais rápido
- Temperatura balanceada
- 256 tokens = respostas diretas

## ⚙️ Como Configurar

### Passo a passo:

1. **Acesse Admin**
   - Clique em "Admin" no menu

2. **Vá para "Configurações de Chat"**
   - Segunda seção do painel

3. **Ajuste cada parâmetro**
   - Selecione provedor no dropdown
   - Arraste slider de temperatura
   - Digite número de tokens

4. **Salve alterações**
   - Clique em "Salvar Configurações"
   - Mudanças aplicam imediatamente

5. **Teste no chat**
   - Envie mensagem e observe diferença

## 🧪 Experimentos Sugeridos

### Experimento 1: Temperatura

Pergunta fixa: "Explique o que é React"

Teste com:
- Temperatura 0.0 (3 vezes) → Compare variação
- Temperatura 0.5 (3 vezes) → Compare variação
- Temperatura 1.0 (3 vezes) → Compare variação

**Observação esperada:** Quanto maior temperatura, mais variadas as respostas.

### Experimento 2: Tokens

Pergunta: "Escreva tutorial completo de Git"

Teste com:
- 256 tokens → Resposta cortada
- 512 tokens → Resposta básica
- 1024 tokens → Resposta completa

**Observação esperada:** Mais tokens = respostas mais completas.

### Experimento 3: Provedores

Pergunta: "Escreva um poema sobre tecnologia"

Teste cada provedor:
- GPT-4
- Claude Opus
- Gemini

**Observação esperada:** Estilos diferentes de escrita.

## 📊 Custos e Performance

### Trade-off Custo vs Qualidade

```
GPT-3.5: $ | Performance: ★★★☆☆
GPT-4:   $$$ | Performance: ★★★★★
Claude:  $$ | Performance: ★★★★☆
```

### Trade-off Velocidade vs Precisão

```
Temperatura 0.0: Rápido, Determinístico
Temperatura 0.5: Médio, Balanceado
Temperatura 1.0: Lento, Criativo
```

## 💡 Dicas de Configuração

💡 **Comece com padrões**: 0.7 temperatura, 512 tokens, GPT-4.

💡 **Ajuste por tipo de tarefa**: Código → temperatura baixa, Criação → alta.

💡 **Monitore tempo de resposta**: Se muito lento, reduza tokens ou use modelo menor.

💡 **Experimente variações**: Mesma pergunta, diferentes configs → compare resultados.

## 🚨 Erros Comuns

❌ **Temperatura muito alta + código**: Respostas inconsistentes
✅ Use temperatura < 0.3 para programação

❌ **Tokens muito baixos + perguntas complexas**: Resposta cortada
✅ Use ≥ 1024 tokens para tópicos extensos

❌ **Trocar provedor frequentemente**: Inconsistência de estilo
✅ Escolha um provedor e mantenha por sessão

## Próximos passos

Continue para **Gerenciar Histórico** e aprenda a visualizar e exportar suas conversas!

---

**Tempo estimado**: 6 minutos
**Pré-requisitos**: Domínio - Configurar Jornada
**Fase**: Domínio (50-75%)
