# STORY-module-helpdesk-client-management.md

## Área Temática: Gestão de Clientes

### Visão Geral

Esta área representa a **gestão de organizações clientes** do sistema HelpDesk. As histórias deste grupo definem como a organização cadastra e mantém informações sobre seus clientes corporativos, incluindo suporte a estruturas hierárquicas complexas (matriz/filial).

O agrupamento forma uma unidade coesa que implementa cadastro completo de clientes, visualização e busca de clientes existentes, edição de informações e gestão de hierarquias organizacionais. Esta é a base do relacionamento B2B do sistema, permitindo organizar chamados por cliente e rastrear histórico comercial.

---

## User Stories

### US007 - Lista de Clientes
**Como** atendente
**Eu quero** visualizar a lista de clientes
**Para que** eu possa encontrar e gerenciar informações dos clientes

**Critérios de Sucesso:**
- [ ] Lista paginada com busca e filtros
- [ ] Colunas: nome, email, telefone, status, data criação
- [ ] Filtros por status (ativo/inativo)
- [ ] Ordenação por diferentes campos
- [ ] Indicador visual de clientes com hierarquia
- [ ] Contagem de chamados por cliente
- [ ] Ações rápidas (editar, desativar, ver chamados)

**Tabelas Relacionadas:** `TBcliente`, `TBchamado`

---

### US008 - Cadastro de Cliente
**Como** atendente
**Eu quero** cadastrar novos clientes
**Para que** eu possa associar chamados e contatos a eles

**Critérios de Sucesso:**
- [ ] Formulário com campos obrigatórios e opcionais
- [ ] Validação de email único
- [ ] Seleção de cliente pai (hierarquia)
- [ ] Upload de logo/imagem do cliente
- [ ] Configuração de limite de chamados mensais
- [ ] Campos personalizados configuráveis
- [ ] Salvamento com feedback visual

**Tabelas Relacionadas:** `TBcliente`

---

### US009 - Edição de Cliente
**Como** atendente
**Eu quero** editar dados de clientes existentes
**Para que** eu possa manter as informações atualizadas

**Critérios de Sucesso:**
- [ ] Formulário pré-preenchido com dados atuais
- [ ] Histórico de alterações
- [ ] Validação de campos obrigatórios
- [ ] Prevenção de alterações que quebrem integridade
- [ ] Auditoria de quem fez as alterações
- [ ] Confirmação antes de salvar mudanças críticas

**Tabelas Relacionadas:** `TBcliente`, `TBauditoria`

---

## Schema do Banco de Dados

### Tabelas Principais
- **TBcliente**: Dados dos clientes/organizações
  - Informações comerciais (razão social, CNPJ, endereço)
  - Suporta hierarquia (cliente_pai_id)
  - Limites de chamados configuráveis
  - Campos personalizados (JSON)
  - Logo/imagem do cliente
  - Status ativo/inativo
- **TBauditoria**: Registro de alterações em clientes
  - Usuário que fez a alteração
  - Data/hora
  - Valores anteriores e novos
- **TBchamado**: Referência para contagem de chamados por cliente

---

## Requisitos Relacionados

Esta área de User Stories implementa os seguintes requisitos (OSD):

**Clientes:**
- SPEC-MH-CLI-001 a SPEC-MH-CLI-007: Cadastro, hierarquia, limites, campos personalizados, histórico

---

## Hierarquia de Clientes (Exemplo)

```
Empresa ABC Holding (Matriz)
├── ABC Filial SP
│   └── Chamados: 45
├── ABC Filial RJ
│   └── Chamados: 32
└── ABC Filial MG
    └── Chamados: 18

Limite consolidado: 100 chamados/mês
Utilizado: 95 chamados
```

---

## Campos Personalizados

Exemplos de campos configuráveis por cliente:
- Número de contrato
- Gestor de conta
- Data de renovação
- Nível de serviço (Bronze/Prata/Ouro)
- Centro de custo
- Observações internas

---

## Resumo

**Total de User Stories:** 3
**Personas Envolvidas:** Atendentes, Administradores
**Complexidade:** Média
**Prioridade:** Alta (necessária antes de chamados)
**Dependências:** STORY-module-helpdesk-user-profile-rbac (controle de acesso)
