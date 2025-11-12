# Complete Model Guide - Coletivos HelpDesk

## 📋 Visão Geral

Este documento define o **modelo de dados conceitual** do sistema Coletivos HelpDesk, apresentando as **entidades** que formam o contrato de comunicação entre a camada React (frontend) e o banco de dados SQL Server (via procedures JSQL).

> **Importante:** Este é o modelo conceitual de transporte JSON, não o schema físico do banco.
> Para detalhes de implementação SQL, consulte [05-Complete-Schema-Guide.md](./05-Complete-Schema-Guide.md).

---

## 🎯 Conceitos Fundamentais

### Entidade vs Tabela

Uma **entidade** é um conceito de negócio que pode envolver:
- **Tabela principal** (ex: `TBchamado`)
- **Subtabelas relacionadas** (ex: `TBchamado_historico`, `TBchamado_comentario`, `TBchamado_anexo`)
- **Campos calculados** (ex: permissões efetivas, métricas de SLA)

O React opera sobre **entidades**, não tabelas. As procedures JSQL (`jsql__select__*`, `jsql__mutate__*`) fazem o mapeamento para o schema físico.

### Formato de Transporte

Todas as entidades seguem o padrão JSQL envelope:

```json
{
  "code": 200,
  "message": "Success",
  "data": [
    { /* entidade 1 */ },
    { /* entidade 2 */ }
  ]
}
```

**Referência:** [docs/JSQL/README.md](../../JSQL/README.md)

---

## 🗂️ Categorias de Entidades

### 1. Entidades Principais (CRUD completo)
Entidades com procedures `jsql__select__*` e `jsql__mutate__*`:
- `usuario`, `papel`, `permissao`
- `cliente`, `contato`, `atendente`, `departamento`
- `chamado`, `categoria`, `status_chamado`, `prioridade`
- `atendimento`, `tag`, `notificacao`, `template_email`
- `sla_configuracao`, `feriado`, `automacao_regra`, `auditoria`

### 2. Entidades de Relacionamento (apenas mutate)
Relacionamentos N:N gerenciados via `jsql__mutate__*`:
- `usuario_papel`, `usuario_permissao`, `papel_permissao`
- `atendente_departamento`, `entidade_tag`

### 3. Entidades Derivadas (somente leitura)
Views ou cálculos dinâmicos via `jsql__select__*`:
- `permissao_efetiva` (calcula permissões do usuário)

### 4. Entidades Virtuais (somente leitura, agregações)
Agregações dinâmicas sem tabela física:
- `dashboard`

### 5. Subtabelas (incluídas nas entidades pai)
Dados child incluídos automaticamente na entidade pai:
- `chamado` inclui: `historico[]`, `comentarios[]`, `anexos[]`, `satisfacao{}`
- `atendimento` inclui: `mensagens[]`

---

## 📦 Modelo de Entidades

### 🔐 Módulo: Autenticação e Controle de Acesso

#### **usuario**
Representa usuários do sistema (atendentes, contatos, administradores).

**Tabela principal:** `TBusuario`
**Procedures:** `jsql__select__usuario`, `jsql__mutate__usuario`

```typescript
interface Usuario {
  id_usuario: number
  email_usuario: string // UNIQUE
  nome_exibicao: string
  ativo: boolean
  avatar_url?: string
  telefone?: string
  fuso_horario: string // default 'America/Sao_Paulo'
  idioma: string // default 'pt'
  tema_interface: 'claro' | 'escuro' | 'auto' // default 'auto'
  notificacoes_email: boolean
  notificacoes_push: boolean
  ultimo_login?: string // DATETIME ISO
  ip_ultimo_login?: string
  data_criacao: string // DATETIME ISO
  data_ultima_atualizacao: string // DATETIME ISO
  observacoes?: string

  // Relacionamentos (opcionalmente expandidos)
  papeis?: Papel[] // via TBusuario_papel
}
```

**Regras de negócio:** [05-Complete-Schema-Guide.md#TBusuario](./05-Complete-Schema-Guide.md#TBusuario)

---

#### **papel**
Define papéis de acesso (espectador, gerente, administrador).

**Tabela principal:** `TBpapel`
**Procedures:** `jsql__select__papel`, `jsql__mutate__papel`

```typescript
interface Papel {
  id_papel: number
  codigo_papel: string // UNIQUE, UPPERCASE (ex: 'ADMINISTRADOR')
  nome_papel: string
  descricao?: string
  fixo: boolean // true = não pode ser removido
  permite_explorar: boolean // permissão básica de leitura
  permite_alterar: boolean // permissão de escrita
  permite_configurar: boolean // permissão administrativa
  cor: string // referência TBcor_semantica
  icone?: string
  ativo: boolean
  data_criacao: string
  data_ultima_atualizacao: string
  observacoes?: string

  // Relacionamentos
  permissoes?: Permissao[] // via TBpapel_permissao
}
```

**Papéis fixos:** `ESPECTADOR`, `ADMINISTRADOR`
**Regras de negócio:** [05-Complete-Schema-Guide.md#TBpapel](./05-Complete-Schema-Guide.md#TBpapel)

---

#### **permissao**
Catálogo de permissões atômicas do sistema.

**Tabela principal:** `TBpermissao`
**Procedure:** `jsql__select__permissao`

```typescript
interface Permissao {
  id_permissao: number
  codigo_permissao: string // UNIQUE, formato: 'tipo_acao__recurso__operacao'
  nome_permissao: string
  descricao?: string
  categoria: string // agrupamento (ex: 'usuario', 'chamado')
  tipo_acao: 'select' | 'mutate' | 'delete' | 'configure'
  recurso: string // entidade afetada (ex: 'usuario', 'chamado')
  operacao?: string // operação específica (ex: 'criar', 'editar')
  ativo: boolean
  data_criacao: string
  observacoes?: string
}
```

**Exemplo de código:** `select__usuario`, `mutate__chamado__atribuir`
**Regras de negócio:** [05-Complete-Schema-Guide.md#TBpermissao](./05-Complete-Schema-Guide.md#TBpermissao)

---

#### **permissao_efetiva**
Permissões calculadas de um usuário (view).

**View:** `TBpermissao_efetiva`
**Procedure:** `jsql__select__permissao_efetiva`

```typescript
interface PermissaoEfetiva {
  id_usuario: number
  email_usuario: string
  nome_exibicao: string
  id_permissao: number
  codigo_permissao: string
  nome_permissao: string
  categoria: string
  tipo_acao: string
  recurso: string
  operacao?: string
  permissao_papel?: boolean // true/false/null
  permissao_usuario?: boolean // true/false/null (override)
  permitido: boolean // RESULTADO FINAL (false > true > null = false)
  papeis_usuario?: string // JSON array de papéis
  permissao_usuario_expira_em?: string // DATETIME ISO
  motivo_permissao_usuario?: string
}
```

**Lógica de resolução:** `false` > `true` > `null` = `false`
**Regras de negócio:** [05-Complete-Schema-Guide.md#PERMITIDO](./05-Complete-Schema-Guide.md#PERMITIDO)

---

#### **refresh_token**
Tokens de atualização para renovação de sessões.

**Tabela principal:** `TBrefresh_token`
**Procedures:** `jsql__select__refresh_token` (admin only), revogação via workflows N8N

```typescript
interface RefreshToken {
  id: number
  id_usuario: number
  token_hash: string // SHA-256 hash (64 chars hex)
  familia_id: string // UUID da cadeia de rotation
  expira_em: string // DATETIME ISO
  criado_em: string // DATETIME ISO
  usado_em?: string // DATETIME ISO, NULL = não usado
  revogado: boolean
  device_info?: string // User-Agent
  ip_origem?: string // IPv4 ou IPv6

  // Relacionamentos
  usuario: Usuario
}
```

**Uso:**
- Tokens não são expostos via JSQL select para usuários normais
- Gerenciados exclusivamente via workflows N8N de autenticação
- Consulta permitida apenas para administradores (auditoria)

**Regras de negócio:** [05-Complete-Schema-Guide.md#TBrefresh_token](./05-Complete-Schema-Guide.md#TBrefresh_token)

---

### 🏢 Módulo: Clientes e Contatos

#### **cliente**
Organizações que utilizam o sistema de suporte.

**Tabela principal:** `TBcliente`
**Procedures:** `jsql__select__cliente`, `jsql__mutate__cliente`

```typescript
interface Cliente {
  id_cliente: number
  id_cliente_matriz?: number // FK para cliente matriz (hierarquia)
  nome_cliente: string // UNIQUE - Nome fantasia
  nome_fantasia?: string
  razao_social?: string // Razão social oficial da empresa
  cnpj?: string // formato: 00.000.000/0000-00
  site_web?: string
  telefone?: string
  email?: string
  endereco_completo?: string
  cidade?: string
  estado?: string
  cep?: string
  segmento: 'A' | 'V' // A=Atacado, V=Varejo
  limite_chamados_mensal?: number // null = ilimitado
  id_atendente_responsavel?: number
  campos_personalizados?: Record<string, any> // JSON
  observacoes?: string
  ativo: boolean
  data_criacao: string
  data_ultima_atualizacao?: string

  // Relacionamentos
  cliente_matriz?: Cliente // se id_cliente_matriz preenchido
  filiais?: Cliente[] // clientes com id_cliente_matriz = este
  contatos?: Contato[]
  atendente_responsavel?: Atendente
}
```

**Regras de negócio:** [05-Complete-Schema-Guide.md#TBcliente](./05-Complete-Schema-Guide.md#TBcliente)

---

#### **contato**
Pessoas físicas que interagem com o suporte.

**Tabela principal:** `TBcontato`
**Procedures:** `jsql__select__contato`, `jsql__mutate__contato`

```typescript
interface Contato {
  id_contato: number
  id_usuario?: number // FK para TBusuario (acesso ao portal)
  id_cliente: number
  nome_contato: string
  email_contato: string // UNIQUE
  telefone_contato?: string
  cargo_contato?: string
  departamento_contato?: string
  contato_principal: boolean // apenas 1 por cliente
  recebe_notificacoes: boolean
  ativo: boolean
  data_criacao: string
  observacoes?: string

  // Relacionamentos
  cliente: Cliente
  usuario?: Usuario // se id_usuario preenchido
}
```

**Regras de negócio:** [05-Complete-Schema-Guide.md#TBcontato](./05-Complete-Schema-Guide.md#TBcontato)

---

### 👨‍💼 Módulo: Atendentes e Departamentos

#### **atendente**
Funcionários que atendem chamados e chats.

**Tabela principal:** `TBatendente`
**Procedures:** `jsql__select__atendente`, `jsql__mutate__atendente`

```typescript
interface Atendente {
  id_atendente: number
  id_usuario?: number // FK para TBusuario (acesso ao sistema)
  nome_atendente: string
  email_atendente: string // UNIQUE
  telefone_atendente?: string
  cargo?: string
  nivel_experiencia: 'J' | 'P' | 'S' // Junior, Pleno, Senior
  especialidades?: string // lista separada por vírgula
  ativo: boolean
  data_admissao?: string // DATE
  data_demissao?: string // DATE
  data_criacao: string
  observacoes?: string

  // Relacionamentos
  usuario?: Usuario
  departamentos?: Departamento[] // via TBatendente_departamento
}
```

**Regras de negócio:** [05-Complete-Schema-Guide.md#TBatendente](./05-Complete-Schema-Guide.md#TBatendente)

---

#### **departamento**
Grupos funcionais de atendentes.

**Tabela principal:** `TBdepartamento`
**Procedures:** `jsql__select__departamento`, `jsql__mutate__departamento`

```typescript
interface Departamento {
  id_departamento: number
  nome_departamento: string // UNIQUE
  codigo_departamento: string // UNIQUE
  descricao?: string
  email_departamento?: string // recebe chamados via email
  cor_hexadecimal?: string
  icone?: string
  ativo: boolean
  data_criacao: string
  data_ultima_atualizacao?: string
  template_email_criacao?: string
  template_email_atualizacao?: string
  template_email_finalizacao?: string
  mensagem_inicial_padrao?: string
  sla_padrao_horas?: number
  privativo: boolean
  permite_chamados_externos: boolean
  observacoes?: string
}
```

**Regras de negócio:** [05-Complete-Schema-Guide.md#TBdepartamento](./05-Complete-Schema-Guide.md#TBdepartamento)

---

### 🎫 Módulo: Chamados

#### **chamado**
Solicitações de suporte dos clientes.

**Tabela principal:** `TBchamado`
**Procedures:** `jsql__select__chamado`, `jsql__mutate__chamado`
**Subtabelas incluídas:** `TBchamado_historico`, `TBchamado_comentario`, `TBchamado_anexo`, `TBchamado_satisfacao`

```typescript
interface Chamado {
  id_chamado: number
  protocolo_chamado?: string // UNIQUE, formato YYYY-NNNNNN
  titulo_chamado: string
  descricao_inicial: string
  id_contato: number
  id_cliente: number
  id_departamento: number
  id_categoria?: number
  id_status_chamado: number
  id_tipo_prioridade: number
  prioridade: 'B' | 'N' | 'A' | 'U' // B=Baixa, N=Normal, A=Alta, U=Urgente
  id_atendente_responsavel?: number
  id_atendente_criador?: number
  data_criacao: string
  data_ultima_atualizacao?: string
  data_primeira_resposta?: string
  data_resolucao?: string
  data_fechamento?: string
  tempo_primeira_resposta_minutos?: number
  tempo_resolucao_minutos?: number
  sla_vencimento_primeira_resposta?: string
  sla_vencimento_resolucao?: string
  sla_primeira_resposta_vencido: boolean
  sla_resolucao_vencido: boolean
  observacao_resolucao?: string
  origem_chamado: string // PORTAL, EMAIL, CHAT, API, INTERNO
  url_gitlab?: string
  campos_personalizados?: Record<string, any> // JSON
  observacoes_internas?: string

  // Relacionamentos expandidos
  contato: Contato
  cliente: Cliente
  departamento: Departamento
  categoria?: Categoria
  status: StatusChamado
  prioridade: TipoPrioridade
  atendente_responsavel?: Atendente
  atendente_criador?: Atendente

  // Subtabelas (child entities)
  historico: ChamadoHistorico[]
  comentarios: ChamadoComentario[]
  anexos: ChamadoAnexo[]
  satisfacao?: ChamadoSatisfacao // 1:1
  tags?: Tag[] // via TBentidade_tag
}
```

**Regras de negócio:** [05-Complete-Schema-Guide.md#TBchamado](./05-Complete-Schema-Guide.md#TBchamado)

---

#### **status_chamado**
Status possíveis dos chamados.

**Tabela principal:** `TBstatus_chamado`
**Procedures:** `jsql__select__status_chamado`, `jsql__mutate__status_chamado`

```typescript
interface StatusChamado {
  id_status_chamado: number
  nome_status: string // UNIQUE
  codigo_status: string // UNIQUE
  descricao?: string
  cor_hexadecimal?: string
  icone?: string
  tipo_status: 'A' | 'P' | 'F' | 'C' // A=Aberto, P=Progresso, F=Fechado, C=Cancelado
  permite_reabertura: boolean
  permite_comentario_contato: boolean
  pausa_sla: boolean
  status_inicial: boolean
  status_final: boolean
  ativo: boolean
  data_criacao: string
  data_ultima_atualizacao?: string
  ordem_exibicao?: number
  instrucoes_uso?: string
  observacoes?: string
}
```

**Regras de negócio:** [05-Complete-Schema-Guide.md#TBstatus_chamado](./05-Complete-Schema-Guide.md#TBstatus_chamado)

---

#### **categoria**
Classificação hierárquica de chamados.

**Tabela principal:** `TBcategoria`
**Procedures:** `jsql__select__categoria`, `jsql__mutate__categoria`

```typescript
interface Categoria {
  id_categoria: number
  nome_categoria: string
  codigo_categoria: string // UNIQUE
  descricao?: string
  id_categoria_pai?: number // hierarquia ilimitada
  cor_hexadecimal?: string
  icone?: string
  prioridade_padrao?: 'B' | 'N' | 'A' | 'U' // B=Baixa, N=Normal, A=Alta, U=Urgente
  nivel_prioridade?: number // sugestão numérica de prioridade
  sla_padrao_horas?: number
  ativo: boolean
  data_criacao: string
  data_ultima_atualizacao?: string
  ordem_exibicao?: number
  template_descricao?: string
  observacoes?: string

  // Relacionamentos
  categoria_pai?: Categoria
  subcategorias?: Categoria[]
}
```

**Regras de negócio:** [05-Complete-Schema-Guide.md#TBcategoria](./05-Complete-Schema-Guide.md#TBcategoria)

---

#### **prioridade** (TBtipo_prioridade)
Níveis de prioridade (Alta, Média, Baixa).

**Tabela principal:** `TBtipo_prioridade`
**Procedures:** `jsql__select__prioridade`, `jsql__mutate__prioridade`

```typescript
interface TipoPrioridade {
  tipo_prioridade: 'U' | 'A' | 'N' | 'B' // PK - Urgente, Alta, Normal, Baixa
  nome_prioridade: string // UNIQUE
  descricao?: string
  cor: string // FK para TBcor_semantica
  icone?: string
  sla_horas_padrao?: number
  peso_ordenacao: number
  ativo: boolean
  data_criacao: string
  data_ultima_atualizacao?: string
  observacoes?: string
}
```

**Regras de negócio:** [05-Complete-Schema-Guide.md#TBtipo_prioridade](./05-Complete-Schema-Guide.md#TBtipo_prioridade)

---

#### Subtabelas de Chamado

**ChamadoHistorico** (`TBchamado_historico`)
```typescript
interface ChamadoHistorico {
  // Identificação
  id_historico: number
  id_chamado: number

  // Conteúdo
  conteudo_mensagem: string
  data_hora_mensagem: string
  tipo_mensagem: 'M' | 'S' | 'A' // M=Mensagem, S=Sistema, A=Alteração
  visibilidade: 'P' | 'I' // P=Público, I=Interno

  // Autoria
  id_contato?: number
  id_atendente?: number
  id_usuario_alteracao?: number

  // Mudanças de status
  id_status_chamado_anterior?: number
  id_status_chamado_novo?: number

  // Mudanças de prioridade
  prioridade_anterior?: 'B' | 'N' | 'A' | 'U'
  prioridade_nova?: 'B' | 'N' | 'A' | 'U'

  // Mudanças de atendente
  id_atendente_anterior?: number
  id_atendente_novo?: number

  // Campos genéricos (calculados)
  valor_anterior?: string
  valor_novo?: string

  // Metadados técnicos
  tipo_mime?: string
  endereco_ip?: string
  user_agent?: string
  canal_origem?: string
  observacoes?: string
}
```

**ChamadoComentario** (`TBchamado_comentario`)
```typescript
interface ChamadoComentario {
  id_comentario: number
  id_chamado: number
  texto_comentario: string
  data_hora_comentario: string
  id_usuario?: number
  tipo_usuario?: 'A' | 'C' // A=Atendente, C=Contato
  privado: boolean // true=interno, false=público
  data_criacao: string
  data_ultima_atualizacao?: string
}
```

**ChamadoAnexo** (`TBchamado_anexo`)
```typescript
interface ChamadoAnexo {
  id_anexo: number
  id_chamado: number
  id_historico?: number // Anexo vinculado a mensagem específica
  nome_arquivo_original: string
  nome_arquivo_storage: string
  caminho_arquivo: string
  url_download?: string
  url_thumbnail?: string
  tipo_mime: string
  extensao_arquivo?: string
  tamanho_arquivo_bytes: number
  hash_arquivo?: string
  status_virus_scan: 'P' | 'L' | 'I' // P=Pendente, L=Limpo, I=Infectado
  resultado_virus_scan?: string
  data_upload: string
  id_usuario_upload?: number
  tipo_usuario_upload: 'C' | 'A' // C=Contato, A=Atendente
  visibilidade: 'P' | 'I' // P=Público, I=Interno
  endereco_ip?: string
  user_agent?: string
  ativo: boolean
  observacoes?: string
}
```

**ChamadoSatisfacao** (`TBchamado_satisfacao`)
```typescript
interface ChamadoSatisfacao {
  id_satisfacao: number
  id_chamado: number
  id_contato: number
  nota_avaliacao: 1 | 2 | 3 | 4 | 5
  comentario_avaliacao?: string
  token_avaliacao?: string // UNIQUE - token para acesso à avaliação
  data_avaliacao: string
  ip_avaliacao?: string
  data_criacao: string
}
```

---

### 💬 Módulo: Atendimento Online

#### **atendimento**
Sessões de chat em tempo real.

**Tabela principal:** `TBatendimento`
**Procedures:** `jsql__select__atendimento`, `jsql__mutate__atendimento`
**Subtabelas incluídas:** `TBatendimento_mensagem`

```typescript
interface Atendimento {
  // Identificação
  id_atendimento: number
  id_contato?: number
  id_atendente?: number
  id_departamento?: number

  // Dados do visitante
  nome_visitante: string
  email_visitante: string
  telefone_visitante?: string

  // Status e datas
  status_atendimento: 'A' | 'E' | 'F' | 'C' // A=Aguardando, E=Em_Atendimento, F=Finalizado, C=Cancelado
  data_inicio: string
  data_primeiro_atendimento?: string
  data_finalizacao?: string
  tempo_espera_minutos?: number
  tempo_atendimento_minutos?: number

  // Avaliação
  avaliacao_atendimento?: 'E' | 'B' | 'R' | 'P' // E=Excelente, B=Bom, R=Regular, P=Péssimo
  comentario_avaliacao?: string
  observacao_atendimento?: string

  // Origem e contexto
  pagina_origem?: string
  referrer_url?: string
  endereco_ip?: string
  user_agent?: string

  // Geolocalização
  cidade_acesso?: string
  estado_acesso?: string
  pais_acesso?: string
  fuso_horario?: string
  idioma_navegador?: string

  // Dispositivo
  dispositivo_tipo?: string // DESKTOP, MOBILE, TABLET
  navegador?: string
  sistema_operacional?: string

  // Dados extras
  campos_personalizados?: Record<string, any>
  tags?: string // JSON
  observacoes?: string

  // Relacionamentos
  contato?: Contato
  atendente?: Atendente
  departamento?: Departamento

  // Subtabelas
  mensagens: AtendimentoMensagem[]
}
```

**Regras de negócio:** [05-Complete-Schema-Guide.md#TBatendimento](./05-Complete-Schema-Guide.md#TBatendimento)

---

#### Subtabela de Atendimento

**AtendimentoMensagem** (`TBatendimento_mensagem`)
```typescript
interface AtendimentoMensagem {
  id_mensagem: number
  id_atendimento: number
  conteudo_mensagem: string
  data_hora_envio: string
  tipo_remetente: 'V' | 'A' | 'S' // V=Visitante, A=Atendente, S=Sistema
  id_remetente?: number
  nome_remetente?: string
  status_mensagem: 'E' | 'L' | 'F' // E=Enviada, L=Lida, F=Falhou
  data_leitura?: string
  tipo_conteudo: 'T' | 'I' | 'A' | 'E' // T=Texto, I=Imagem, A=Arquivo, E=Emoji
  url_arquivo?: string
  nome_arquivo?: string
  tamanho_arquivo_bytes?: number
  tipo_mime?: string
  metadados_mensagem?: Record<string, any>
  resposta_para_id_mensagem?: number
  editada: boolean
  data_edicao?: string
  excluida: boolean
  data_exclusao?: string
  endereco_ip?: string
  user_agent?: string
  observacoes?: string
}
```

---

### 🏷️ Módulo: Tags e Organização

#### **tag**
Tags para categorização flexível.

**Tabela principal:** `TBtag`
**Procedures:** `jsql__select__tag`, `jsql__mutate__tag`

```typescript
interface Tag {
  tag: string // PK - código da tag
  tipo_entidade: string // PK - tipo de entidade
  nome_exibicao: string
  descricao?: string
  cor: string // FK para TBcor_semantica
  peso_ordenacao: number // maior = mais prioritário
  icone?: string
  ativo: boolean
  data_criacao: string
  data_ultima_atualizacao?: string
  observacoes?: string
}
```

**Aplicação de tags:** via entidade `entidade_tag` (mutate only)
**Regras de negócio:** [05-Complete-Schema-Guide.md#TBtag](./05-Complete-Schema-Guide.md#TBtag)

---

### ⚙️ Módulo: Configurações e SLA

#### **sla_configuracao**
Acordos de nível de serviço.

**Tabela principal:** `TBsla_configuracao`
**Procedures:** `jsql__select__sla_configuracao`, `jsql__mutate__sla_configuracao`

```typescript
interface SLAConfiguracao {
  id_sla_configuracao: number
  nome_sla: string // UNIQUE
  descricao?: string
  id_cliente?: number // SLA específico (NULL = geral)
  id_categoria?: number // SLA específico (NULL = geral)
  prioridade?: 'B' | 'N' | 'A' | 'U' // SLA específico (NULL = geral)
  horas_primeira_resposta: number
  horas_resolucao: number
  percentual_alerta_primeira_resposta: number
  percentual_alerta_resolucao: number
  horario_comercial_inicio: string // TIME 'HH:MM:SS'
  horario_comercial_fim: string // TIME 'HH:MM:SS'
  dias_uteis_semana: string // '1,2,3,4,5' (1=Segunda, 7=Domingo)
  considera_feriados: boolean
  ativo: boolean
  data_criacao: string
  data_ultima_atualizacao?: string
  prioridade_aplicacao: number // Ordem de aplicação (maior = mais específico)
  observacoes?: string
}
```

**Regras de negócio:** [05-Complete-Schema-Guide.md#TBsla_configuracao](./05-Complete-Schema-Guide.md#TBsla_configuracao)

---

#### **feriado**
Feriados que afetam cálculos de SLA.

**Tabela principal:** `TBferiado`
**Procedures:** `jsql__select__feriado`, `jsql__mutate__feriado`

```typescript
interface Feriado {
  id_feriado: number
  nome_feriado: string
  data_feriado: string // DATE
  tipo_feriado: 'N' | 'E' | 'M' | 'C' // N=Nacional, E=Estadual, M=Municipal, C=Corporativo
  estado?: string // Para feriados estaduais
  cidade?: string // Para feriados municipais
  recorrente: boolean
  ativo: boolean
  data_criacao: string
  data_ultima_atualizacao?: string
  observacoes?: string

  // UNIQUE: (data_feriado, tipo_feriado, estado, cidade)
}
```

**Regras de negócio:** [05-Complete-Schema-Guide.md#TBferiado](./05-Complete-Schema-Guide.md#TBferiado)

---

### 📧 Módulo: Notificações e Templates

#### **notificacao**
Notificações enviadas aos usuários.

**Tabela principal:** `TBnotificacao`
**Procedures:** `jsql__select__notificacao`, `jsql__mutate__notificacao`

```typescript
interface Notificacao {
  id_notificacao: number
  titulo_notificacao: string
  conteudo_notificacao: string
  tipo_notificacao: 'I' | 'A' | 'E' | 'S' // Info, Alerta, Erro, Sucesso
  canal_notificacao: 'S' | 'E' | 'P' | 'W' // Sistema, Email, Push, WhatsApp
  id_destinatario: number
  tipo_destinatario: 'A' | 'C' // A=Atendente, C=Contato
  id_remetente?: number
  id_chamado?: number
  id_atendimento?: number
  status_notificacao: 'P' | 'E' | 'L' | 'F' // P=Pendente, E=Enviada, L=Lida, F=Falhou
  data_criacao: string
  data_envio?: string
  data_leitura?: string
  data_expiracao?: string
  prioridade: 'B' | 'N' | 'A' | 'U'
  url_acao?: string
  metadados_json?: Record<string, any>
  tentativas_envio: number
  log_envio?: string
  observacoes?: string
}
```

**Regras de negócio:** [05-Complete-Schema-Guide.md#TBnotificacao](./05-Complete-Schema-Guide.md#TBnotificacao)

---

#### **template_email**
Templates para emails automáticos.

**Tabela principal:** `TBtemplate_email`
**Procedures:** `jsql__select__template_email`, `jsql__mutate__template_email`

```typescript
interface TemplateEmail {
  id_template_email: number
  nome_template: string // UNIQUE
  codigo_template: string // UNIQUE
  descricao?: string
  assunto_email: string // Suporta variáveis {variavel}
  corpo_email_html: string // HTML com variáveis
  corpo_email_texto?: string // Texto puro alternativo
  tipo_template: 'C' | 'A' | 'S' | 'N' // C=Chamado, A=Atendimento, S=Sistema, N=Notificação
  evento_trigger?: string // Evento que dispara o template
  id_departamento?: number // Template específico (NULL = geral)
  variaveis_disponiveis?: Record<string, any> // JSON
  ativo: boolean
  data_criacao: string
  data_ultima_atualizacao?: string
  id_atendente_criador?: number
  observacoes?: string
}
```

**Regras de negócio:** [05-Complete-Schema-Guide.md#TBtemplate_email](./05-Complete-Schema-Guide.md#TBtemplate_email)

---

### 🔧 Módulo: Automação e Auditoria

#### **automacao_regra**
Regras de automação de processos.

**Tabela principal:** `TBautomacao_regra`
**Procedures:** `jsql__select__automacao_regra`, `jsql__mutate__automacao_regra`

```typescript
interface AutomacaoRegra {
  id_automacao_regra: number
  nome_regra: string // UNIQUE
  descricao?: string
  tipo_regra: 'A' | 'E' | 'T' | 'N' // A=Auto-assignment, E=Escalação, T=Trigger, N=Notificação
  evento_trigger: string // Evento que dispara a regra
  condicoes_json: Record<string, any> // JSON
  acoes_json: Record<string, any> // JSON
  prioridade_execucao: number
  ativo: boolean
  data_criacao: string
  data_ultima_atualizacao?: string
  data_ultima_execucao?: string
  contador_execucoes: number
  contador_sucessos: number
  contador_falhas: number
  log_ultima_execucao?: string
  observacoes?: string
}
```

**Regras de negócio:** [05-Complete-Schema-Guide.md#TBautomacao_regra](./05-Complete-Schema-Guide.md#TBautomacao_regra)

---

#### **auditoria**
Log de operações críticas.

**Tabela principal:** `TBauditoria`
**Procedures:** `jsql__select__auditoria` (somente leitura)

```typescript
interface Auditoria {
  id_auditoria: number
  data_hora_acao: string
  tipo_acao: string // CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.
  tabela_afetada?: string
  id_registro_afetado?: number
  id_usuario?: number
  tipo_usuario?: 'A' | 'C' | 'S' // A=Atendente, C=Contato, S=Sistema
  nome_usuario?: string
  email_usuario?: string
  endereco_ip?: string
  user_agent?: string
  url_requisicao?: string
  metodo_http?: string
  valores_anteriores?: Record<string, any> // JSON
  valores_novos?: Record<string, any> // JSON
  descricao_acao?: string
  resultado_acao: 'S' | 'F' // S=Sucesso, F=Falha
  mensagem_erro?: string
  sessao_id?: string
  id_chamado_relacionado?: number
  id_atendimento_relacionado?: number
  metadados_extras?: Record<string, any>
  observacoes?: string
}
```

**Regras de negócio:** [05-Complete-Schema-Guide.md#TBauditoria](./05-Complete-Schema-Guide.md#TBauditoria)

---

### 📊 Módulo: Dashboard e Métricas (Entidades Virtuais)

#### **dashboard**
Agregações virtuais de métricas do sistema (sem tabela física).

**Tabela principal:** Nenhuma (agregação dinâmica)
**Procedures:** `jsql__select__dashboard__*`

> Entidade virtual: não possui tabela física. As procedures agregam dados de múltiplas fontes.

```typescript
// Não há interface única - cada action retorna estrutura específica
// Ver actions em 14-Complete-Action-Guide.md
```

---

## 🔗 Mapeamento Entidade → Tabelas

| Entidade | Tabela Principal | Subtabelas | Tipo |
|----------|------------------|------------|------|
| `usuario` | `TBusuario` | - | CRUD |
| `papel` | `TBpapel` | - | CRUD |
| `permissao` | `TBpermissao` | - | Read |
| `permissao_efetiva` | `TBpermissao_efetiva` (VIEW) | - | Read (calculada) |
| `refresh_token` | `TBrefresh_token` | - | N8N workflows only |
| `cliente` | `TBcliente` | - | CRUD |
| `contato` | `TBcontato` | - | CRUD |
| `atendente` | `TBatendente` | - | CRUD |
| `departamento` | `TBdepartamento` | - | CRUD |
| `chamado` | `TBchamado` | `TBchamado_historico`<br>`TBchamado_comentario`<br>`TBchamado_anexo`<br>`TBchamado_satisfacao` | CRUD (hierárquico) |
| `status_chamado` | `TBstatus_chamado` | - | CRUD |
| `categoria` | `TBcategoria` | - | CRUD (hierárquico) |
| `prioridade` | `TBtipo_prioridade` | - | CRUD |
| `atendimento` | `TBatendimento` | `TBatendimento_mensagem` | CRUD (hierárquico) |
| `tag` | `TBtag` | - | CRUD |
| `notificacao` | `TBnotificacao` | - | CRUD |
| `template_email` | `TBtemplate_email` | - | CRUD |
| `sla_configuracao` | `TBsla_configuracao` | - | CRUD |
| `feriado` | `TBferiado` | - | CRUD |
| `automacao_regra` | `TBautomacao_regra` | - | CRUD |
| `auditoria` | `TBauditoria` | - | Read only |
| `usuario_papel` | `TBusuario_papel` | - | Mutate only (N:N) |
| `usuario_permissao` | `TBusuario_permissao` | - | Mutate only (N:N) |
| `papel_permissao` | `TBpapel_permissao` | - | Mutate only (N:N) |
| `atendente_departamento` | `TBatendente_departamento` | - | Mutate only (N:N) |
| `entidade_tag` | `TBentidade_tag` | - | Mutate only (N:N) |
| `dashboard` | - (virtual) | Agregação dinâmica | Read only (virtual) |

---

## 📚 Referências

- **Schema SQL detalhado:** [05-Complete-Schema-Guide.md](./05-Complete-Schema-Guide.md)
- **User Stories:** [01-Complete-User-Stories.md](./01-Complete-User-Stories.md)
- **Requirements:** [02-Complete-Requirements.md](./02-Complete-Requirements.md)
- **JSQL Documentation:** [docs/JSQL/README.md](../../JSQL/README.md)
- **Procedures JSQL:** `database/schemata/sac/sac.jsql__*.sql`

---

## ✅ Cobertura do Modelo

- **19 entidades principais** com CRUD completo
- **5 entidades de relacionamento** (mutate only)
- **1 entidade derivada** (read only)
- **2 entidades hierárquicas** com subtabelas (`chamado`, `atendimento`)
- **37 tabelas SQL** mapeadas
- **100% cobertura** do schema SAC

Este modelo forma o contrato de comunicação entre React e SQL Server via JSQL.
