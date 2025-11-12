# STORY-module-helpdesk-client-management.md

## Área Temática: Gestão de Clientes

### Visão Geral

Esta área representa a **gestão de organizações clientes** do sistema HelpDesk. As histórias deste grupo definem como a organização cadastra e mantém informações sobre seus clientes corporativos, incluindo suporte a estruturas hierárquicas complexas (matriz/filial).

O agrupamento forma uma unidade coesa que implementa cadastro completo de clientes, visualização e busca de clientes existentes, edição de informações e gestão de hierarquias organizacionais. Esta é a base do relacionamento B2B do sistema, permitindo organizar chamados por cliente e rastrear histórico comercial.

**IMPORTANTE**: Este documento foca no VALOR para o usuário. Detalhes técnicos estão em `SPEC-module-helpdesk-client-management.md`.

---

## User Stories

### US007 - Lista de Clientes

**Como** atendente
**Eu quero** visualizar a lista de todos os clientes cadastrados
**Para que** eu possa encontrar rapidamente informações de um cliente específico e gerenciar seus dados

**Valor de Negócio**: Permite acesso rápido às informações de clientes, facilitando o atendimento e reduzindo tempo de busca.

**Critérios de Sucesso:**

**Visualização:**
- [ ] Posso ver uma lista com todos os clientes cadastrados
- [ ] A lista mostra nome da empresa, contatos principais e status
- [ ] Consigo ver se um cliente possui filiais (indicador visual de hierarquia)
- [ ] Vejo quantos chamados cada cliente possui

**Busca e Filtros:**
- [ ] Posso buscar clientes por nome da empresa
- [ ] Posso filtrar apenas clientes ativos ou inativos
- [ ] Posso ordenar a lista por nome, data de cadastro ou número de chamados
- [ ] A busca funciona mesmo com nomes parciais

**Ações Rápidas:**
- [ ] Posso clicar em um cliente para ver todos os seus chamados
- [ ] Posso editar as informações de um cliente diretamente da lista
- [ ] Posso desativar um cliente se necessário
- [ ] A lista é dividida em páginas para não ficar muito longa

**Cenários de Uso:**

1. **Busca Rápida Durante Atendimento**
   - Atendente recebe ligação de "Empresa XYZ"
   - Busca "XYZ" na lista de clientes
   - Vê rapidamente histórico de 12 chamados abertos
   - Acessa informações de contato atualizadas

2. **Revisão de Clientes Inativos**
   - Supervisor filtra clientes inativos
   - Identifica 5 clientes sem chamados há 6+ meses
   - Decide reativar relacionamento comercial

3. **Análise de Carga por Cliente**
   - Gestor ordena lista por número de chamados
   - Identifica cliente com 50+ chamados no mês
   - Escala para equipe comercial negociar plano

---

### US008 - Cadastro de Cliente

**Como** atendente
**Eu quero** cadastrar novos clientes no sistema
**Para que** eu possa associar chamados e contatos a eles e manter informações organizadas

**Valor de Negócio**: Centraliza informações de clientes corporativos, permitindo rastreamento de relacionamento comercial e histórico de atendimento.

**Critérios de Sucesso:**

**Informações Básicas:**
- [ ] Posso inserir nome da empresa (obrigatório)
- [ ] Posso inserir nome fantasia se for diferente da razão social
- [ ] Posso adicionar CNPJ ou CPF do cliente
- [ ] Posso cadastrar email, telefone e website de contato
- [ ] Posso adicionar endereço completo (rua, cidade, estado, CEP)

**Hierarquia Organizacional:**
- [ ] Posso indicar se este cliente é filial de outro cliente (cliente matriz)
- [ ] Quando seleciono cliente matriz, vejo a estrutura hierárquica atual
- [ ] Posso cadastrar cliente como matriz (sem cliente pai)

**Configurações Avançadas:**
- [ ] Posso fazer upload de logo ou imagem do cliente
- [ ] Posso configurar limite mensal de chamados permitidos
- [ ] Posso adicionar campos personalizados (ex: número de contrato, gestor de conta)
- [ ] Posso adicionar informações como segmento de atuação e porte da empresa

**Validações e Feedback:**
- [ ] Sistema me avisa se já existe cliente com mesmo CNPJ
- [ ] Sistema valida formato de email se eu inserir um
- [ ] Vejo mensagem de sucesso quando cliente é cadastrado
- [ ] Se houver erro, vejo claramente qual campo precisa corrigir

**Cenários de Uso:**

1. **Cadastro de Novo Cliente Corporativo**
   - Cliente "TechCorp Ltda" contata empresa pela primeira vez
   - Atendente cadastra: razão social, CNPJ, email, telefone
   - Adiciona campo personalizado "Contrato: #2025-0123"
   - Define limite de 50 chamados/mês conforme contratado
   - Sistema salva e permite criar primeiro chamado

2. **Cadastro de Filial de Cliente Existente**
   - Cliente "ABC Holding" abre nova filial em SP
   - Atendente busca cliente matriz "ABC Holding"
   - Cadastra "ABC Filial SP" selecionando matriz como cliente pai
   - Sistema herda configurações base da matriz
   - Filial aparece como sub-item da matriz na lista

3. **Cadastro Rápido Durante Atendimento Urgente**
   - Cliente novo liga com problema urgente
   - Atendente preenche apenas campos obrigatórios (nome, email)
   - Salva cliente e cria chamado imediatamente
   - Completa cadastro detalhado posteriormente

---

### US009 - Edição de Cliente

**Como** atendente
**Eu quero** editar dados de clientes existentes
**Para que** eu possa manter as informações sempre atualizadas e precisas

**Valor de Negócio**: Garante qualidade dos dados cadastrais, evitando informações desatualizadas que prejudicam atendimento.

**Critérios de Sucesso:**

**Edição de Informações:**
- [ ] Posso atualizar qualquer informação do cliente (nome, email, telefone, etc.)
- [ ] Formulário vem pré-preenchido com dados atuais do cliente
- [ ] Posso alterar status do cliente (ativo/inativo/suspenso)
- [ ] Posso atualizar logo/imagem do cliente
- [ ] Posso modificar campos personalizados

**Hierarquia:**
- [ ] Posso mudar cliente matriz (mover filial entre matrizes)
- [ ] Posso transformar cliente simples em matriz
- [ ] Sistema me avisa se mudança impacta filiais existentes

**Limites e Configurações:**
- [ ] Posso ajustar limite mensal de chamados
- [ ] Posso alterar gestor de conta responsável
- [ ] Posso atualizar informações contratuais

**Segurança e Auditoria:**
- [ ] Sistema registra quem fez cada alteração e quando
- [ ] Posso ver histórico de todas as alterações feitas no cliente
- [ ] Sistema pede confirmação antes de salvar mudanças importantes
- [ ] Não posso fazer alterações que quebrem integridade (ex: remover cliente com chamados)

**Validações:**
- [ ] Sistema valida campos obrigatórios antes de salvar
- [ ] Sistema avisa se novo CNPJ já existe para outro cliente
- [ ] Vejo mensagem clara de sucesso ou erro após salvar

**Cenários de Uso:**

1. **Atualização de Contato Após Mudança**
   - Cliente "XYZ Corp" muda de endereço e telefone
   - Atendente edita cliente e atualiza informações
   - Salva alterações
   - Sistema registra: alterado por João em 12/01/2025 às 14:30

2. **Ajuste de Limite de Chamados**
   - Cliente "ABC Ltda" contrata plano maior (50 → 100 chamados/mês)
   - Supervisor edita cliente e aumenta limite
   - Sistema pede confirmação da mudança
   - Limite atualizado, cliente pode abrir mais chamados

3. **Suspensão Temporária de Cliente**
   - Cliente "DEF Inc" tem inadimplência temporária
   - Gestor marca cliente como "suspenso"
   - Sistema bloqueia abertura de novos chamados
   - Chamados existentes continuam sendo atendidos

4. **Revisão de Histórico de Alterações**
   - Supervisor nota inconsistência nos dados do cliente
   - Acessa histórico de alterações
   - Identifica que email foi alterado 3x no último mês
   - Investiga com equipe e corrige informação definitiva

---

## Hierarquia de Clientes (Exemplo de Valor)

**Cenário Real**: Empresa ABC Holding tem 3 filiais

```
ABC Holding (Matriz) - Limite: 100 chamados/mês
├── ABC Filial SP - 45 chamados este mês
├── ABC Filial RJ - 32 chamados este mês
└── ABC Filial MG - 18 chamados este mês

Total usado: 95/100 chamados (95%)
```

**Valor**:
- Gestor vê consumo consolidado da holding
- Atendente sabe que limite está quase estourando
- Comercial pode propor upgrade de plano
- Filiais mantêm dados próprios mas herdam configurações da matriz

---

## Campos Personalizados (Exemplos de Valor)

**Problema**: Cada empresa tem necessidades diferentes de rastreamento

**Solução**: Campos configuráveis por cliente

**Exemplos**:
- **Número de contrato**: "CTR-2025-0123" (rastrear SLA contratual)
- **Gestor de conta**: "Maria Silva" (responsável comercial)
- **Data de renovação**: "31/12/2025" (acompanhar vencimento)
- **Nível de serviço**: "Ouro" (Bronze/Prata/Ouro - define prioridade)
- **Centro de custo**: "CC-1001" (contabilidade interna)
- **Observações internas**: "Cliente VIP - dar prioridade" (notas da equipe)

**Valor**: Flexibilidade para adaptar sistema às necessidades específicas sem modificar código.

---

## Resumo

**Total de User Stories:** 3
**Personas Envolvidas:** Atendentes, Supervisores, Gestores
**Complexidade:** Média
**Prioridade:** Alta (necessária antes de criar chamados)
**Dependências:** Sistema de controle de acesso (definir quem pode cadastrar/editar)

**Impacto no Negócio:**
- **Organização**: Centraliza informações de clientes B2B
- **Rastreamento**: Histórico completo de relacionamento comercial
- **Controle**: Limites configuráveis por contrato
- **Flexibilidade**: Hierarquia matriz/filial e campos personalizados
- **Auditoria**: Histórico de quem alterou o quê e quando

**Métricas de Sucesso:**
- Tempo médio para encontrar informações de cliente < 10 segundos
- 100% dos clientes cadastrados antes de abrir primeiro chamado
- 0 duplicações de cadastro (validação de CNPJ)
- Histórico de alterações auditável para compliance

---

**Última atualização:** 2025-01-12
**Versão:** 3.0 (Foco em valor de usuário)
