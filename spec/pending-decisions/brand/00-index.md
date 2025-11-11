# Brand System - Pending Decisions Index

## Contexto

Módulo de autenticação não reflete tema do ambiente. Sistema atual tem cor de tema e assets (ícones) separados. Proposta de unificar em conceito **Brand** (cor + assets) aplicável a Realm e Portal.

## Documentos

1. **[01-brand-concept.md](01-brand-concept.md)** - Conceito unificado de Brand
   - Definição: Brand = Cor + Assets
   - Escopo: Realm e Portal (com override)
   - Resolução em cascata
   - Interface unificada
   - Terminologia

2. **[02-asset-upload-problem.md](02-asset-upload-problem.md)** - Bloqueador de Assets
   - IconUploader tenta usar rotas REST (violação)
   - Sistema não tem pattern de upload estabelecido
   - Precisa de solicitação/spec separada antes de prosseguir
   - Alternativa temporária: Brand só com cor

3. **[03-crud-routes-violation.md](03-crud-routes-violation.md)** - Erro arquitetural identificado
   - Backend tem rotas REST de CRUD (violação JQEL)
   - Configs de realm/portal devem usar JQEL (schema: "backend")
   - Ação: auditar e remover rotas violadoras
   - Implementar handlers JQEL para entities realm/portal

4. **[04-login-theme-access.md](04-login-theme-access.md)** - Brand sem autenticação
   - Login precisa de brand mas usuário não está autenticado
   - 4 opções analisadas (endpoint público, pre-load, estático, ThemeProvider global)
   - Recomendação preliminar: híbrido (endpoint público + pre-load)

## Decisões Necessárias

### Imediatas
- [ ] Aprovar conceito unificado de Brand
- [ ] Definir como login acessa brand (ver 04)
- [ ] Decidir sobre endpoint público de brand (exceção justificável?)

### Dependências Externas
- [ ] Criar spec de Asset Upload System (ver 02)
- [ ] Auditar e corrigir violações CRUD REST (ver 03)

### Implementação (após decisões)
- [ ] Migração de `theme.brandColor` → `brand.color`
- [ ] Componente `BrandEditor` reutilizável
- [ ] Atualizar RealmEdit e PortalBrand (ex-ThemeConfig)
- [ ] ThemeProvider global ou por-portal?

## Próximos Passos

1. Revisar e discutir documentos 01-04
2. Tomar decisões pendentes
3. Criar specs formais (SPEC-brand.md, SPEC-asset-upload.md)
4. Corrigir violações arquiteturais (CRUD REST)
5. Implementar Brand (somente após decisões firmadas)
