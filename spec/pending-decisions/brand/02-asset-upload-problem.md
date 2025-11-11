# Asset Upload Problem - Bloqueador para Brand

## Contexto

Brand precisa de assets (favicon, pwa icons, apple-touch), mas sistema atual:

- **IconUploader** tenta POST para `/api/1/assets/icons` (endpoint não existe)
- Não há pattern de upload estabelecido no sistema
- Tentativas anteriores de criar rotas de upload falharam e quebraram o sistema

## Problema: Rotas REST vs. JQEL

Sistema usa **JQEL** para acesso a dados. É **PROIBIDO criar rotas REST** sem planejamento.

IconUploader viola essa regra ao tentar:
```typescript
POST /api/1/assets/icons
DELETE /api/1/assets/icons/:scope/:scopeId/:iconType
```

## Concerns Separados

1. **Brand (conceitual)**: pode prosseguir (ver `01-brand-concept.md`)
2. **Upload de Assets**: precisa de solicitação separada, com planejamento de:
   - Pattern unificado de rotas (única rota ou pattern previsível)
   - Gestão de quota
   - Segurança
   - Validação

## Questões para Resolver

1. Upload deve ser via JQEL ou exceção com rota dedicada?
2. Se rota dedicada, qual pattern usar? (ex: `/api/1/upload/:resource`)
3. Como gerenciar quota de storage por realm/portal?
4. Onde armazenar assets? (filesystem, S3, database como blob?)
5. Como servir assets? (rota estática, CDN?)
6. Assets devem versionamento? (cache invalidation)

## Impacto no Brand

Brand **não pode ser implementado completamente** sem resolver upload de assets.

**Alternativa temporária**: Brand apenas com cor, assets vem depois.

## Ação Necessária

Criar solicitação/spec separada para **Asset Upload System** antes de prosseguir com implementação completa de Brand.
