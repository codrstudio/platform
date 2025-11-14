# Workflows CIA Cuidadores - Agentes de IA

Este diretório contém os workflows n8n para os agentes especializados da plataforma CIA Cuidadores.

## Workflows Implementados

### 1. Recrutamento Automatizado (`recrutamento-automatizado.json`)

**Endpoint:** `POST /api/1/cia/recrutamento/entrevista`

**Descrição:** Agente especializado em conduzir entrevistas estruturadas com candidatos a cuidador, avaliando competências técnicas e comportamentais.

**Modelo:** Claude Sonnet 4 (Anthropic)

**Funcionalidades:**
- Conduz entrevista empática e profissional
- Avalia experiência técnica e habilidades interpessoais
- Gera pontuação automática (0-10) em múltiplos critérios
- Identifica fit cultural e adequação à vaga
- Fornece recomendações de próximos passos

**Critérios de Avaliação:**
1. Experiência técnica (0-10)
2. Habilidades interpessoais (0-10)
3. Empatia e cuidado (0-10)
4. Adequação à vaga (0-10)
5. Recomendação geral (0-10)

**Exemplo de Request:**
```json
{
  "candidato": {
    "nome": "Maria Silva",
    "experiencia": "5 anos como cuidadora",
    "formacao": "Técnica em Enfermagem"
  },
  "vaga": {
    "titulo": "Cuidador Idoso - Período Integral",
    "requisitos": "Experiência mínima 2 anos, paciência, empatia"
  },
  "etapa": "inicial",
  "messages": [
    {
      "role": "user",
      "content": "Olá, gostaria de participar do processo seletivo"
    }
  ]
}
```

---

### 2. Humanização de Relatórios (`humanizacao-de-relatorios.json`)

**Endpoint:** `POST /api/1/cia/humanizacao/relatorio`

**Descrição:** Transforma relatórios técnicos de cuidado em textos humanizados, empáticos e acessíveis para familiares.

**Modelo:** GPT-4o (OpenAI)

**Funcionalidades:**
- Converte jargão médico em linguagem acessível
- Mantém tom empático e acolhedor
- Preserva informações técnicas importantes
- Destaca progressos e conquistas
- Oferece recomendações práticas

**Tipos de Relatório Suportados:**
- `evolucao`: Evolução do paciente
- `incidente`: Relatório de incidente
- `alta`: Relatório de alta
- `admissao`: Relatório de admissão
- `rotina`: Relatório de rotina

**Destinatários:**
- `familia`: Familiares do paciente
- `gestor`: Gestores/coordenadores
- `medico`: Profissionais da saúde
- `paciente`: Próprio paciente

**Tons Disponíveis:**
- `empatico`: Acolhedor e empático
- `profissional`: Formal e técnico
- `educativo`: Didático e explicativo
- `celebratorio`: Positivo e motivador

**Exemplo de Request:**
```json
{
  "relatorio_tecnico": "Paciente apresentou quadro de hipertensão controlada. PA: 130/85. Deambulação com auxílio. AVDs parcialmente preservadas.",
  "tipo": "evolucao",
  "destinatario": "familia",
  "tom": "empatico",
  "incluir_recomendacoes": true
}
```

**Exemplo de Response:**
```json
{
  "code": 200,
  "data": {
    "relatorio_humanizado": "Durante esta semana, ficamos felizes em compartilhar que a pressão arterial da Dona Maria está bem controlada...",
    "relatorio_original": "Paciente apresentou...",
    "metadados": {
      "tipo": "evolucao",
      "destinatario": "familia",
      "tom": "empatico",
      "data_processamento": "2025-01-14T..."
    }
  }
}
```

---

### 3. Assistente de Expectativas Inteligente (`assistente-de-expectativas-inteligente.json`)

**Endpoint:** `POST /api/1/cia/expectativas/analise`

**Descrição:** Analisa e valida expectativas de famílias e pacientes, identificando o que é realista dentro do escopo do cuidado e prevenindo frustrações.

**Modelo:** Claude Sonnet 4 (Anthropic)

**Funcionalidades:**
- Identifica expectativas explícitas e implícitas
- Classifica expectativas (Realista/Parcialmente Realista/Irrealista)
- Explica por que certas expectativas não são alcançáveis
- Sugere alternativas construtivas
- Gera plano de alinhamento de expectativas
- Fornece scripts de comunicação

**Modos de Operação:**
- `analise`: Análise completa e detalhada
- `validacao`: Validação objetiva (sim/não/com adaptações)
- `orientacao`: Orientação prática com scripts de comunicação

**Casos de Uso:**
1. Triagem inicial de famílias
2. Resolução de conflitos
3. Prevenção de frustrações
4. Educação sobre limitações do cuidado
5. Negociação de contratos
6. Gestão de crises

**Exemplo de Request:**
```json
{
  "expectativas": "Esperamos que a cuidadora faça fisioterapia completa, prepare todas as refeições e administre todos os medicamentos.",
  "paciente": {
    "nome": "Sr. João",
    "idade": 82,
    "condicoes": "Alzheimer moderado",
    "nivel_dependencia": "alto"
  },
  "familia": {
    "relacao": "filha"
  },
  "contexto_adicional": "Cuidadora período de 12h diárias, sem formação em fisioterapia.",
  "modo": "analise"
}
```

**Exemplo de Response:**
```json
{
  "code": 200,
  "data": {
    "analise": "## Expectativas Identificadas\n1. Fisioterapia completa...\n## Classificação...",
    "modo": "analise",
    "metadados": {...},
    "sugestoes_proximos_passos": [
      "Agendar reunião de alinhamento com a família",
      "Documentar expectativas acordadas"
    ]
  }
}
```

---

### 4. Memória de Entrevista (`memoria-de-entrevista.json`)

**Endpoint:** `POST /api/1/cia/memoria/transcrever`

**Descrição:** Transcreve áudios de entrevistas e gera memórias estruturadas com análise de adequação, pontos de atenção e recomendações.

**Modelo:** GPT-4o (OpenAI)

**Funcionalidades:**
- Transcrição automática de áudio (integração necessária)
- Estruturação de memória em formato padronizado
- Análise de adequação à vaga
- Identificação de red flags e inconsistências
- Geração de resumo executivo
- Pontuação automática em múltiplos critérios
- Recomendações de próximos passos

**Tipos de Entrevista:**
- `completa`: Entrevista detalhada (45-60 min)
- `rapida`: Triagem inicial (15-20 min)
- `seguimento`: Entrevista de follow-up

**Integrações de Transcrição Sugeridas:**
- OpenAI Whisper API (recomendado)
- Google Speech-to-Text
- AWS Transcribe
- Azure Speech Services

**Estrutura da Memória Gerada:**
1. Dados Gerais (data, participantes, duração)
2. Resumo Executivo (3-5 linhas)
3. Tópicos Discutidos
4. Respostas Relevantes (organizadas por tema)
5. Observações do Entrevistador
6. Pontos de Atenção (red flags)
7. Análise Técnica (pontuação 1-10)
8. Próximos Passos

**Exemplo de Request (com áudio):**
```json
{
  "audio_url": "https://storage.../entrevista-maria-silva.mp3",
  "candidato": {
    "nome": "Maria Silva",
    "id": "CAND-12345"
  },
  "vaga": {
    "titulo": "Cuidador Sênior",
    "id": "VAGA-001"
  },
  "tipo": "completa",
  "incluir_analise": true,
  "gerar_resumo_executivo": true
}
```

**Exemplo de Request (com transcrição):**
```json
{
  "transcricao": "Entrevistador: Bom dia Maria, obrigado por vir...\nCandidato: Bom dia, obrigada pela oportunidade...",
  "candidato": {...},
  "vaga": {...},
  "tipo": "completa"
}
```

---

## Padrões Identificados

### Estrutura de Workflow n8n
Todos os workflows seguem padrões consistentes identificados nos workflows existentes:

1. **Trigger**: Webhook HTTP (POST)
2. **Extração/Validação**: Node Code para validar e preparar dados
3. **Processamento**: AI Agent ou LangChain LLM Chain
4. **Modelo**: Anthropic Claude ou OpenAI GPT
5. **Formatação**: Node Code para formatar resposta
6. **Resposta**: Respond to Webhook

### Padrão de Resposta (JResult)
```json
{
  "code": 200 | 400 | 401 | 500,
  "message"?: "mensagem de erro",
  "field"?: "campo específico com erro",
  "data"?: { ... }
}
```

### Modelos de IA Utilizados
- **Claude Sonnet 4**: Análises complexas, raciocínio profundo (recrutamento, expectativas)
- **GPT-4o**: Tarefas de escrita, humanização, estruturação (relatórios, memória)

### Configurações de Temperatura
- **0.3**: Tarefas objetivas, análises técnicas (expectativas, memória)
- **0.7**: Tarefas criativas, escrita humanizada (relatórios)
- **default**: Conversação natural (recrutamento)

---

## Próximos Passos

### Integrações Necessárias

1. **Transcrição de Áudio** (`memoria-de-entrevista.json`)
   - Integrar com OpenAI Whisper API
   - Alternativas: Google STT, AWS Transcribe, Azure Speech

2. **Persistência de Dados**
   - Salvar memórias em DataTable (n8n)
   - Ou integrar com banco de dados externo

3. **Notificações**
   - Enviar notificações após processamento
   - Integrar com sistema de mensageria

4. **Autenticação**
   - Adicionar validação JWT nos webhooks
   - Usar workflow `authorize.json` existente

### Melhorias Futuras

1. **Streaming de Respostas**
   - Implementar SSE para feedback em tempo real
   - Melhorar experiência do usuário

2. **Cache de Resultados**
   - Implementar cache para reduzir custos de API
   - Acelerar respostas para consultas similares

3. **Métricas e Analytics**
   - Rastrear uso de cada agente
   - Medir qualidade das respostas
   - Identificar padrões de uso

4. **Versionamento**
   - Implementar versionamento de workflows
   - Permitir testes A/B de prompts

---

## Deployment

### Importação no n8n

1. Acesse a instância n8n
2. Vá em **Workflows** → **Import from File**
3. Selecione o arquivo JSON do workflow
4. Configure as credenciais necessárias:
   - Anthropic API Key (para Claude)
   - OpenAI API Key (para GPT-4o)
5. Ative o workflow

### Configuração de Credenciais

**Anthropic:**
- Nome: `Anthropic Credentials`
- API Key: `sk-ant-...`

**OpenAI:**
- Nome: `OpenAI Credentials`
- API Key: `sk-...`

### Testes

Para cada workflow, use o modo de teste manual do n8n:

1. Abra o workflow
2. Clique em **Execute Workflow**
3. Use o payload de exemplo da documentação
4. Verifique a resposta

### URLs dos Endpoints (após deployment)

Assumindo instância n8n em `https://n8n.codrstudio.dev`:

- Recrutamento: `https://n8n.codrstudio.dev/webhook/api/1/cia/recrutamento/entrevista`
- Humanização: `https://n8n.codrstudio.dev/webhook/api/1/cia/humanizacao/relatorio`
- Expectativas: `https://n8n.codrstudio.dev/webhook/api/1/cia/expectativas/analise`
- Memória: `https://n8n.codrstudio.dev/webhook/api/1/cia/memoria/transcrever`

---

## Custos Estimados

### Por Requisição (estimativas)

**Recrutamento Automatizado:**
- Modelo: Claude Sonnet 4
- Tokens médios: 2000 input + 1000 output
- Custo estimado: ~$0.015 por entrevista

**Humanização de Relatórios:**
- Modelo: GPT-4o
- Tokens médios: 500 input + 800 output
- Custo estimado: ~$0.008 por relatório

**Assistente de Expectativas:**
- Modelo: Claude Sonnet 4
- Tokens médios: 1500 input + 1500 output
- Custo estimado: ~$0.018 por análise

**Memória de Entrevista:**
- Modelo: GPT-4o
- Tokens médios: 3000 input + 2000 output
- Custo estimado: ~$0.025 por memória
- *Nota:* Adicionar custo de transcrição de áudio se aplicável

---

## Suporte e Documentação

Para dúvidas sobre implementação, consulte:

- Documentação n8n: https://docs.n8n.io/
- API Anthropic: https://docs.anthropic.com/
- API OpenAI: https://platform.openai.com/docs/
- Workflows de referência: `workflows/v1/auth/`, `workflows/v1/system/`

---

## Tags

`cia-cuidadores` `recrutamento` `humanizacao` `expectativas` `memoria` `ai` `n8n` `claude` `gpt-4o` `workflows`
