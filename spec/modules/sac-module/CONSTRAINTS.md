# Restrições do Sistema SAC

Este documento define as restrições técnicas e operacionais que DEVEM ser respeitadas durante o desenvolvimento dos módulos HelpDesk/SAC.

---

## Base de Dados - Somente Leitura

### SPEC-SAC-DB-001: Database Schema é Imutável

**PROIBIDO**: Modificar qualquer arquivo em `spec/modules/sac-module/database-schema/`

**Justificativa**: A base de dados **NÃO está sob nosso controle**. O schema é gerenciado por sistema externo e pode ser alterado sem aviso prévio.

**Implicações**:
- Os arquivos SQL em `database-schema/` são apenas **fonte da verdade** (read-only reference)
- Representam o estado atual do banco de dados de produção
- Qualquer mudança nestes arquivos será **ignorada** pelo sistema real
- Mudanças no schema ocorrem externamente e devem ser **refletidas** aqui quando necessário

### SPEC-SAC-DB-002: Adaptação ao Schema Existente

**OBRIGATÓRIO**: Todos os módulos (helpdesk, sac, gestao-sac) DEVEM:
- Adaptar-se ao schema existente
- Usar as tabelas e campos conforme definidos
- Implementar lógica de negócio que funcione com a estrutura atual
- Tratar campos ausentes ou alterados de forma resiliente

### SPEC-SAC-DB-003: Mapeamento JQEL

**OBRIGATÓRIO**: O mapeamento entre schemas JQEL e tabelas SQL DEVE:
- Ser documentado em `spec/modules/sac-module/{module}/jqel-mapping.md`
- Mapear entidades JQEL para tabelas existentes
- Documentar transformações de campos quando necessário
- Incluir regras de validação baseadas no schema SQL

**Exemplo de Mapeamento**:
```
JQEL: helpdesk:chamado
SQL:  sac.TBchamado

JQEL: helpdesk:comentario
SQL:  sac.TBchamado_comentario
```

### SPEC-SAC-DB-004: Versionamento do Schema

**OBRIGATÓRIO**: Quando o schema de produção for alterado:
1. Atualizar os arquivos SQL em `database-schema/` para refletir o novo estado
2. Documentar mudanças em `database-schema/CHANGELOG.md`
3. Atualizar mapeamentos JQEL afetados
4. Atualizar testes de integração
5. Versionar usando tags semânticas (`schema-v1.0.0`, `schema-v1.1.0`, etc.)

---

## Integração com n8n (Backbone)

### SPEC-SAC-INT-001: Acesso a Dados via JQEL/n8n

**OBRIGATÓRIO**: TODO acesso a dados DEVE:
- Usar JQEL como interface
- Ser processado pelo Backbone (n8n)
- NUNCA acessar banco de dados diretamente do frontend ou backend

**PROIBIDO**:
- Conexões diretas ao banco de dados
- Queries SQL no frontend ou backend
- ORMs (Sequelize, TypeORM, Prisma) para acesso direto

### SPEC-SAC-INT-002: Lógica de Negócio no Backbone

**OBRIGATÓRIO**: Lógica de negócio complexa DEVE:
- Ser implementada em workflows n8n
- Processar validações no Backbone
- Retornar erros estruturados para frontend/backend

**Exemplos de Lógica no Backbone**:
- Validação de regras de SLA
- Cálculo de prioridades automáticas
- Execução de automações
- Envio de notificações

---

## Arquitetura dos Módulos

### SPEC-SAC-ARCH-001: Independência de Módulos

**OBRIGATÓRIO**: Os três módulos (`helpdesk`, `sac`, `gestao-sac`) DEVEM:
- Funcionar independentemente
- Não ter dependências de código entre si
- Compartilhar apenas dados (via JQEL) e schemas

**PERMITIDO**:
- Módulos acessarem os mesmos schemas JQEL
- Módulos reagirem aos mesmos eventos (SSE/Redis)
- Módulos compartilharem componentes da plataforma (shadcn/ui)

**PROIBIDO**:
- Importar código de outro módulo
- Dependências diretas em `package.json` entre módulos
- Acoplamento de estado entre módulos

### SPEC-SAC-ARCH-002: Permissões por RLS

**OBRIGATÓRIO**: Controle de acesso DEVE:
- Ser implementado via Row-Level Security (RLS) no Backbone
- Usar papéis JWT para determinar acesso
- Filtrar dados automaticamente baseado em permissões

**Responsabilidades**:
- **Frontend**: Envia JWT em todas requisições JQEL
- **Backend**: Valida JWT e repassa para Backbone
- **Backbone**: Aplica filtros RLS antes de retornar dados

---

## Constraints de Tecnologia

### SPEC-SAC-TECH-001: Stack Obrigatório

**OBRIGATÓRIO**: Seguir exatamente o stack definido em `spec/STACK.md`:
- React 19 + Vite
- Tailwind CSS + shadcn/ui (ÚNICA biblioteca UI permitida)
- TanStack Query para estado assíncrono
- JQEL para acesso a dados

**PROIBIDO**:
- Outras bibliotecas UI (Material-UI, Ant Design, Chakra, etc.)
- Outras ferramentas de query (Axios direto, fetch direto, SWR)
- CSS-in-JS ou outras soluções de estilo

### SPEC-SAC-TECH-002: Lazy Loading Obrigatório

**OBRIGATÓRIO**: Todos os módulos DEVEM:
- Implementar code splitting com `React.lazy()`
- Carregar componentes sob demanda
- Manter bundle inicial < 200KB gzipped

---

## Performance e Escalabilidade

### SPEC-SAC-PERF-001: Caching Obrigatório

**OBRIGATÓRIO**: Implementar cache em múltiplas camadas:
- **Frontend**: TanStack Query (cache React)
- **Backend**: Redis para dados frequentes
- **Backbone**: n8n pode cachear queries pesadas

### SPEC-SAC-PERF-002: Paginação Obrigatória

**OBRIGATÓRIO**: Listas DEVEM:
- Implementar paginação server-side
- Limitar queries a máximo 100 registros por página
- Usar cursor-based pagination quando apropriado

---

## Segurança

### SPEC-SAC-SEC-001: Autenticação Delegada

**OBRIGATÓRIO**: Autenticação DEVE:
- Usar sistema de autenticação da plataforma
- Validar JWT em todas requisições
- NUNCA implementar login próprio

**PROIBIDO**:
- Sistema de autenticação próprio
- Armazenar senhas nos módulos
- Gerenciar sessões manualmente

### SPEC-SAC-SEC-002: Sanitização de Dados

**OBRIGATÓRIO**: Dados DEVEM:
- Ser sanitizados no Backbone antes de persistir
- Validar tipos usando Zod no frontend
- Escapar HTML em campos de texto livre

---

## Documentação

### SPEC-SAC-DOC-001: Especificações Obrigatórias

**OBRIGATÓRIO**: Cada módulo DEVE ter:
- `README.md` - Visão geral e funcionalidades
- `ARCHITECTURE.md` - Decisões arquiteturais
- `USER-STORIES.md` - Casos de uso e personas
- `SPEC.md` - Especificação técnica detalhada
- `jqel-mapping.md` - Mapeamento JQEL ↔ SQL

### SPEC-SAC-DOC-002: Atualização de Documentação

**OBRIGATÓRIO**: Ao implementar features:
- Atualizar specs ANTES de codificar
- Documentar decisões arquiteturais
- Manter mapeamentos JQEL atualizados

---

## Referências

- `spec/SPEC-*.md` - Especificações da plataforma
- `spec/STACK.md` - Stack tecnológico mandatório
- `examples/helpdesk/Specification/CONSTRAINTS.md` - Restrições originais do sistema
- `workflows/` - Workflows n8n existentes
