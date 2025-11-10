# 2025-11-09: Reestruturação do JQEL Schema e Separação de SQL Mapping

## Especificações Modificadas

### SPEC-jqel-schema.md
- **Seção 1 (Definição)**: Alterado uso de "Command Palette" para "descoberta e apresentação de objetos" (mais genérico)
- **Seção 2 (Estrutura) - REESCRITA COMPLETA**:
  - SPEC-SDL-STR-001 a 004: SDL agora é composto por três estruturas isoladas e independentes (arrays separados)
  - Removida estrutura raiz única com `{ schemas: [], entities: [], actions: [] }`
  - Cada estrutura pode ser processada independentemente
  - Actions referenciam entity e schema por nome (não aninhadas)
- **Nova Seção 2.1 (Convenção de Nomenclatura)**:
  - SPEC-SDL-NOM-001 a 004: Todos os nomes DEVEM usar snake_case
  - Justificativa: Maximiza compatibilidade com diferentes data sources
  - Exemplos de válido e inválido
- **Seção 3 (Schemas) - SIMPLIFICADA**:
  - Removidos schemas reservados (platform, backend, system, frontend)
  - Removidas regras de validação de nomenclatura (movidas para seção 2.1)
  - Mantido apenas definição básica: nome único em snake_case
- **Seção 4 (Entities) - REESCRITA**:
  - SPEC-SDL-ENT-001 a 005: Entity como estrutura isolada (não aninhada)
  - Adicionado campo opcional `sqlMapping` (referência para SPEC-jqel-schema-sql.md)
  - Adicionado campo opcional `metadata` (informações de apresentação)
  - Simplificada numeração de requisitos
- **Seção 5 (Properties) expandida**:
  - Nova subseção "Formatos Suportados"
  - SPEC-SDL-FMT-001 a 005: Formatos JSON Schema standard (email, uri, date, date-time, uuid)
  - Formatos adicionais (phone, ipv4, ipv6, hex-color, json)
  - Formatos de documentos brasileiros (cpf, cnpj, rg, cep, document)
- **Seção 6 (Actions) - REESCRITA**:
  - Actions como estruturas isoladas que referenciam entidades por nome
  - Adicionado campo opcional `sqlMapping` (string simples, não objeto)
  - SPEC-SDL-ACT-011 a 012: Actions SEM sqlMapping são válidas (interceptadas pelo caller)
  - Exemplo de action sem SQL (notify_by_email)
- **Seção 7 (Supports) - REORGANIZADA**:
  - Removido suporte a valores `true` ou `array` simples
  - SPEC-SDL-SUP-004: Estrutura `where` agora usa `properties` e `required` (JSON Schema)
  - SPEC-SDL-SUP-009: Estrutura `values` agora usa `properties` e `required` (JSON Schema)
  - Cada campo em `properties` pode ter `type`, `operators` (where), `format`, `enum` (values)
  - Simplificados `orderBy`, `limit`, `offset` para valores booleanos ou arrays
  - `output` e `except` simplificados para booleanos
- **Seção 8 (Returns) - SIMPLIFICADA**:
  - Mantidos apenas formatos array e object
  - Removidas referências cross-schema explícitas (schema:entity)
- **Seção 9 (Metadata) - NOVA**:
  - SPEC-SDL-META-001 a 007: Campo `metadata` para apresentação e descoberta
  - Substituiu a seção "Searchable (Command Palette)"
  - Campos: discoverable, severity, title, description, icon, keywords, categories
  - Valores de `severity`: grayed, normal, information, highlight, success, warning, concern, error, critical
  - Semântica visual detalhada para cada severity
- **Seção 10 (sqlMapping) - NOVA**:
  - SPEC-SDL-SQLMAP-001 a 004: Referência para SPEC-jqel-schema-sql.md
  - Nota sobre diferença entre sqlMapping em entity vs action
- **Seção 11 (Exemplos Completos) - ATUALIZADA**:
  - Exemplos refatorados para refletir nova estrutura (arrays isolados)
  - Adicionados campos `sqlMapping` e `metadata` nos exemplos
  - Formatação brasileira (usuario, cpf, telefone)
- **Seções REMOVIDAS**:
  - Seção 8 "Extensão: Searchable (Command Palette)" (substituída por Metadata)
  - Seção 9 "Convenções" (nomenclatura movida para 2.1, resto removido)
  - Seção 10 "Validação" (requisitos distribuídos nas seções relevantes)

## Especificações Criadas

### SPEC-jqel-schema-sql.md (NOVO)
Especificação completa de mapeamento SQL para entidades e ações SDL:

- **Seção 1 (Definição)**:
  - SPEC-SQLMAP-DEF-001 a 003: Definição de `sqlMapping` e diferença entre entity vs action

- **Seção 2 (Entity SQL Mapping)**:
  - SPEC-SQLMAP-ENT-001 a 003: Formato do `sqlMapping` em entity
  - **2.1 Tabela Principal**: SPEC-SQLMAP-TBL-001 a 002: Campo `table`
  - **2.2 Mapeamento de Colunas**: SPEC-SQLMAP-COL-001 a 006: Campo `columns` (simplificado e detalhado)
  - **2.3 Campos Consultáveis**: SPEC-SQLMAP-QRY-001 a 007: Campo `queryableFields`
  - **2.4 Relacionamentos**: SPEC-SQLMAP-REL-001 a RELTARGET-002:
    - Relacionamento 1:1 (Um-para-Um): tipo `"one"`
    - Relacionamento 1:N (Um-para-Muitos): tipo `"array"` com fk_source
    - Relacionamento N:N (Muitos-para-Muitos): tipo `"array"` com junction table

- **Seção 3 (Exemplo Completo - Entity Mapping)**:
  - Exemplo detalhado de entity com todos os campos
  - Demonstra relacionamentos 1:N e N:N

- **Seção 4 (Action SQL Mapping)**:
  - SPEC-SQLMAP-ACT-001 a 003: Campo simples (string) em action
  - Valores possíveis: "select", "insert", "update", "delete", "upsert", "", null, ausente
  - **4.1 Fluxo de Execução**: SPEC-SQLMAP-ACT-004: Fluxo completo (Caller → Transpiler → Query Template ou TemplateDriver)
  - **4.2 Query Templates**: SPEC-SQLMAP-QT-001 a 006: Templates padrão (SELECT, INSERT, UPDATE, DELETE, UPSERT)
  - **4.3 TemplateDriver**: SPEC-SQLMAP-DRIVER-001 a 007: Componente plugável para templates customizados

- **Seção 5 (Resultado e Metadados)**:
  - SPEC-SQLMAP-RES-001 a 008: Uso de `status.*` para retornar metadados
  - Campos de status: code, message, field, data, warnings
  - Detecção automática via primeira coluna `status.code`
  - Exemplos: status simples, status com dados, dados simples

- **Seção 6 (Validação)**:
  - SPEC-SQLMAP-VAL-001 a 002: Regras de validação para entity e action mapping

- **Seção 7 (Exemplos Completos)**:
  - Action com Query-Template (geração automática)
  - Action com Template Customizado (TemplateDriver)
  - Action sem SQL Mapping (interceptada pelo caller)

- **Seção 8 (Diferenças Entity vs Action Mapping)**:
  - Tabela comparativa resumindo diferenças estruturais e de uso
