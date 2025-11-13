# STORY-module-helpdesk-system-configuration.md

## Área Temática: Configuração do Sistema

### Visão Geral

Esta área representa as **configurações estruturais fundamentais** do sistema HelpDesk. As histórias deste grupo definem como administradores configuram parâmetros globais da empresa, organizam a estrutura de departamentos e categorias que dão forma ao sistema.

O agrupamento forma uma unidade coesa que implementa configurações gerais da empresa (branding, emails, segurança), gestão completa de departamentos (criação, horários, atendentes), estrutura hierárquica de categorias de chamados e todo o sistema de SLA (acordos de nível de serviço). Estas configurações são a fundação sobre a qual todo o sistema operacional se apoia.

---

## User Stories

### US034 - Configurações Gerais
**Como** administrador
**Eu quero** configurar parâmetros gerais do sistema
**Para que** o sistema funcione conforme as necessidades da empresa

**Critérios de Sucesso:**
- [ ] Configurações de empresa (nome, logo, cores)
- [ ] Parâmetros de email (SMTP)
- [ ] Configurações de segurança
- [ ] Limites e quotas do sistema
- [ ] Configurações de backup
- [ ] Integração com sistemas externos
- [ ] Logs de alterações

**Tabelas Relacionadas:** Sistema (configurações globais)

---

### US035 - Gestão de Departamentos
**Como** administrador
**Eu quero** gerenciar departamentos
**Para que** os chamados sejam organizados adequadamente

**Critérios de Sucesso:**
- [ ] Lista de departamentos existentes
- [ ] Criação/edição de departamentos
- [ ] Configuração de emails específicos
- [ ] Definição de horários de funcionamento
- [ ] Associação com atendentes
- [ ] Configurações de SLA por departamento
- [ ] Ativação/desativação

**Tabelas Relacionadas:** `TBdepartamento`, `TBatendente_departamento`

---

### US036 - Gestão de Categorias
**Como** administrador
**Eu quero** gerenciar categorias de chamados
**Para que** os chamados sejam classificados corretamente

**Critérios de Sucesso:**
- [ ] Árvore hierárquica de categorias
- [ ] Criação de categorias e subcategorias
- [ ] Definição de prioridades padrão
- [ ] Configuração de SLA por categoria
- [ ] Reordenação por drag-and-drop
- [ ] Fusão de categorias
- [ ] Relatório de uso por categoria

**Tabelas Relacionadas:** `TBcategoria`

---

### US037 - Configuração de SLA
**Como** administrador
**Eu quero** configurar acordos de nível de serviço
**Para que** o sistema monitore prazos adequadamente

**Critérios de Sucesso:**
- [ ] Definição de SLA geral e específicos
- [ ] Configuração por cliente/categoria/prioridade
- [ ] Definição de horário comercial
- [ ] Cadastro de feriados
- [ ] Configuração de escalações automáticas
- [ ] Alertas de vencimento
- [ ] Relatórios de cumprimento

**Tabelas Relacionadas:** `TBsla_configuracao`, `TBferiado`

---

## Schema do Banco de Dados

### Tabelas de Estrutura Organizacional
- **TBdepartamento**: Departamentos de atendimento
  - Nome do departamento
  - Email específico do departamento
  - Horário de funcionamento (JSON)
  - Configurações de SLA específicas
  - Status ativo/inativo
- **TBatendente_departamento**: Associação N:N entre atendentes e departamentos
  - Um atendente pode estar em múltiplos departamentos

### Tabelas de Classificação
- **TBcategoria**: Hierarquia de categorias de chamados
  - Estrutura de árvore ilimitada (categoria_pai_id)
  - Nome da categoria
  - Prioridade padrão
  - SLA específico (opcional)
  - Ordem de exibição
  - Status ativo/inativo

### Tabelas de SLA e Calendário
- **TBsla_configuracao**: Configurações de SLA
  - SLA geral (padrão para todos)
  - SLA específico (por cliente/categoria/prioridade)
  - Tempo de primeira resposta (horas)
  - Tempo de resolução (horas)
  - Horário comercial (JSON)
  - Escalações automáticas
- **TBferiado**: Feriados nacionais e locais
  - Data do feriado
  - Nome do feriado
  - Tipo (nacional, estadual, municipal)
  - Abrangência geográfica

---

## Requisitos Relacionados

Esta área de User Stories implementa os seguintes requisitos (OSD):

**Configurações Gerais:**
- SPEC-MH-CFG-001 a SPEC-MH-CFG-007: Empresa, branding, email, segurança, limites, backup

**Departamentos:**
- SPEC-MH-DEPT-001 a SPEC-MH-DEPT-007: Criação, emails, horários, atendentes, SLA, validação

**Categorias:**
- SPEC-MH-CAT-001 a SPEC-MH-CAT-007: Hierarquia, subcategorias, prioridades, SLA, reordenação, fusão

**SLA:**
- SPEC-MH-SLA-001 a SPEC-MH-SLA-007: SLA geral/específicos, horário comercial, feriados, escalações, alertas

---

## Configurações Gerais da Empresa

### Informações Básicas
```javascript
{
  empresa: {
    razao_social: "Empresa XPTO Ltda",
    nome_fantasia: "XPTO Suporte",
    cnpj: "12.345.678/0001-90",
    telefone: "+55 11 1234-5678",
    email: "contato@xpto.com",
    site: "https://xpto.com"
  }
}
```

### Branding
```javascript
{
  branding: {
    logo_principal: "/assets/logo.png",
    logo_mobile: "/assets/logo-mobile.png",
    favicon: "/assets/favicon.ico",
    cores: {
      primaria: "#3498db",
      secundaria: "#2c3e50",
      sucesso: "#27ae60",
      aviso: "#f39c12",
      erro: "#e74c3c"
    }
  }
}
```

### Configurações de Email (SMTP)
```javascript
{
  email: {
    smtp_host: "smtp.gmail.com",
    smtp_port: 587,
    smtp_secure: true,
    smtp_user: "helpdesk@xpto.com",
    smtp_password: "***",
    from_name: "XPTO Suporte",
    from_email: "helpdesk@xpto.com",
    reply_to: "noreply@xpto.com"
  }
}
```

### Configurações de Segurança
```javascript
{
  seguranca: {
    max_tentativas_login: 5,
    tempo_bloqueio_minutos: 30,
    duracao_sessao_horas: 8,
    exigir_senha_forte: true,
    tamanho_minimo_senha: 8,
    exigir_maiuscula: true,
    exigir_numero: true,
    exigir_caractere_especial: true,
    token_recuperacao_validade_horas: 24,
    forcar_https: true
  }
}
```

### Limites e Quotas
```javascript
{
  limites: {
    max_anexo_mb: 10,
    max_anexos_por_chamado: 5,
    max_usuarios: 100,
    max_chamados_abertos_simultaneos: 1000,
    chamados_por_pagina: 25,
    timeout_requisicao_segundos: 30
  }
}
```

### Backup
```javascript
{
  backup: {
    ativo: true,
    tipo: "incremental", // completo, incremental
    frequencia: "diaria",
    horario: "02:00",
    retencao_dias: 30,
    local_armazenamento: "s3://bucket-backups/helpdesk"
  }
}
```

---

## Estrutura de Departamentos

### Exemplo de Departamento

```javascript
{
  id: "dept-001",
  nome: "Suporte Técnico",
  descricao: "Atendimento de problemas técnicos",
  email: "suporte@xpto.com",
  horario_funcionamento: {
    segunda: { inicio: "08:00", fim: "18:00" },
    terca: { inicio: "08:00", fim: "18:00" },
    quarta: { inicio: "08:00", fim: "18:00" },
    quinta: { inicio: "08:00", fim: "18:00" },
    sexta: { inicio: "08:00", fim: "18:00" },
    sabado: null, // não funciona
    domingo: null  // não funciona
  },
  sla_padrao_id: "sla-tecnico",
  atendentes: [
    "atendente-001",
    "atendente-002",
    "atendente-003"
  ],
  ativo: true
}
```

### Tipos de Departamento

- **Suporte Técnico**: Problemas de TI
- **Financeiro**: Questões de pagamento/faturamento
- **Comercial**: Dúvidas sobre produtos/serviços
- **Recursos Humanos**: Questões trabalhistas
- **Facilities**: Infraestrutura física
- **Administrativo**: Geral

---

## Hierarquia de Categorias

### Exemplo de Estrutura

```
Hardware (cat-001)
├── Computadores (cat-002)
│   ├── Desktop (cat-003)
│   │   ├── Problema de inicialização (cat-004)
│   │   ├── Desempenho lento (cat-005)
│   │   └── Falha de hardware (cat-006)
│   └── Notebook (cat-007)
│       ├── Bateria (cat-008)
│       ├── Teclado/Touchpad (cat-009)
│       └── Tela/Display (cat-010)
├── Impressoras (cat-011)
│   ├── Jato de Tinta (cat-012)
│   └── Laser (cat-013)
└── Periféricos (cat-014)
    ├── Mouse (cat-015)
    ├── Teclado (cat-016)
    └── Monitor (cat-017)

Software (cat-020)
├── Sistemas Operacionais (cat-021)
│   ├── Windows (cat-022)
│   │   ├── Instalação (cat-023)
│   │   ├── Atualização (cat-024)
│   │   └── Configuração (cat-025)
│   └── Linux (cat-026)
├── Aplicativos (cat-027)
│   ├── Office (cat-028)
│   ├── Adobe (cat-029)
│   └── Navegadores (cat-030)
└── Sistemas Internos (cat-031)
    ├── ERP (cat-032)
    ├── CRM (cat-033)
    └── Email (cat-034)

Rede (cat-040)
├── Conectividade (cat-041)
│   ├── Wi-Fi (cat-042)
│   ├── Ethernet (cat-043)
│   └── VPN (cat-044)
├── Email (cat-045)
└── Acesso Remoto (cat-046)
```

### Atributos de Categoria

```javascript
{
  id: "cat-003",
  nome: "Desktop",
  categoria_pai_id: "cat-002", // Computadores
  prioridade_padrao: "media",
  sla_especifico_id: "sla-hardware",
  ordem: 1,
  ativo: true,
  total_chamados: 45 // calculado
}
```

---

## Configuração de SLA

### SLA Geral (Padrão)

```javascript
{
  id: "sla-geral",
  nome: "SLA Padrão",
  descricao: "SLA aplicado quando não há configuração específica",
  primeira_resposta_horas: 4,
  resolucao_horas: 24,
  horario_comercial: {
    inicio: "08:00",
    fim: "18:00",
    dias_uteis: [1, 2, 3, 4, 5], // Seg-Sex
    feriados_parados: true
  },
  padrao: true
}
```

### SLA Específico por Prioridade

```javascript
{
  id: "sla-urgente",
  nome: "SLA Urgente",
  condicao: {
    prioridade: "urgente"
  },
  primeira_resposta_horas: 1,
  resolucao_horas: 4,
  horario_comercial: {
    disponibilidade: "24x7" // 24 horas, 7 dias
  },
  escalacao: {
    ativa: true,
    notificar_em_percentual: 80, // 80% do tempo decorrido
    notificar_usuarios: ["supervisor@xpto.com"]
  }
}
```

### SLA Específico por Cliente

```javascript
{
  id: "sla-cliente-vip",
  nome: "SLA Cliente VIP",
  condicao: {
    cliente_id: "cliente-premium-123"
  },
  primeira_resposta_horas: 2,
  resolucao_horas: 8,
  horario_comercial: {
    inicio: "06:00",
    fim: "22:00",
    dias_uteis: [0, 1, 2, 3, 4, 5, 6] // Todos os dias
  }
}
```

### SLA Específico por Categoria

```javascript
{
  id: "sla-rede-critica",
  nome: "SLA Rede Crítica",
  condicao: {
    categoria_id: "cat-040" // Rede
  },
  primeira_resposta_horas: 0.5, // 30 minutos
  resolucao_horas: 2,
  horario_comercial: {
    disponibilidade: "24x7"
  }
}
```

---

## Cadastro de Feriados

### Exemplos

```javascript
[
  {
    id: "feriado-001",
    data: "2025-01-01",
    nome: "Ano Novo",
    tipo: "nacional",
    recorrente: true // todos os anos
  },
  {
    id: "feriado-002",
    data: "2025-04-21",
    nome: "Tiradentes",
    tipo: "nacional",
    recorrente: true
  },
  {
    id: "feriado-003",
    data: "2025-01-25",
    nome: "Aniversário de São Paulo",
    tipo: "municipal",
    municipio: "São Paulo",
    recorrente: true
  },
  {
    id: "feriado-004",
    data: "2025-12-24",
    nome: "Véspera de Natal",
    tipo: "facultativo",
    horario_especial: {
      inicio: "08:00",
      fim: "14:00"
    }
  }
]
```

---

## Cálculo de SLA

### Exemplo de Cálculo

```
Chamado aberto: 15/01/2025 às 14:30
SLA aplicado: "SLA Padrão" (4h primeira resposta, 24h resolução)
Horário comercial: 08:00-18:00, Seg-Sex

Cálculo Primeira Resposta (4 horas comerciais):
14:30 + 3.5h = 18:00 (fim do expediente)
Próximo dia útil: 16/01/2025 às 08:00
08:00 + 0.5h = 08:30
Prazo: 16/01/2025 às 08:30

Cálculo Resolução (24 horas comerciais):
15/01: 14:30 → 18:00 = 3.5h
16/01: 08:00 → 18:00 = 10h (total: 13.5h)
17/01: 08:00 → 18:00 = 10h (total: 23.5h)
18/01: 08:00 → 08:30 = 0.5h (total: 24h)
Prazo: 18/01/2025 às 08:30
```

---

## Resumo

**Total de User Stories:** 4
**Personas Envolvidas:** Administradores
**Complexidade:** Alta (configurações críticas do sistema)
**Prioridade:** Alta (necessária antes de operação)
**Dependências:**
- STORY-module-helpdesk-user-profile-rbac (apenas administradores podem configurar)
