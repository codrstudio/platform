# Brand Concept - Unificação de Cor + Assets

## Problema Atual

- **Cor de tema**: configurada separadamente em realm e portal
- **Assets** (ícones/logos): apenas em portal, sem assets em realm
- **Interface fragmentada**: "Tema do Ambiente/Portal" e "Ícones do Aplicativo" são seções separadas
- **Login não reflete tema**: página de login usa cores hardcoded, não acessa brand do ambiente/portal

## Proposta: Conceito Unificado de Brand

### Definição

**Brand** = Cor do Tema + Assets (ícones e logos)

```typescript
interface Brand {
  color: string;      // HSL format: "221 83% 53%"
  assets: {
    favicon?: string;
    pwa192?: string;
    pwa512?: string;
    appleTouch?: string;
  };
}
```

### Escopo

- **Realm (Ambiente)**: pode ter Brand configurado
- **Portal**: pode ter Brand configurado (override do realm)

### Resolução em Cascata

```
Portal tem brand.color? → Usa
  Senão → Realm tem brand.color? → Usa
    Senão → Default

Portal tem brand.assets.favicon? → Usa
  Senão → Realm tem brand.assets.favicon? → Usa
    Senão → Default
```

Cada propriedade resolve independentemente (cor pode vir do portal, favicon do realm).

## Interface Unificada

**Antes** (fragmentado):
- Seção: "Tema do Ambiente/Portal" (só cor)
- Seção: "Ícones do Aplicativo" (só assets)

**Depois** (unificado):
- **Tema do Ambiente/Portal**
  - Cor do Tema (color picker)
  - Ícones do Tema (4 uploads: favicon, pwa192, pwa512, appleTouch)

### Componente Reutilizável

`<BrandEditor scope="realm|portal" scopeId="..." />`

- Usado em **RealmEdit** (scope="realm")
- Usado em **Portal Brand Config** (scope="portal", com toggle "Usar Tema do Ambiente")

## Aplicação ao Login

- Login page precisa acessar brand do ambiente (realm)
- Não pode depender de autenticação (usuário ainda não logou)
- Deve aplicar cor e logo do brand na interface

## Terminologia na Interface

- **Interno**: "Brand" (código, tipos, configs)
- **Interface**: "Tema" (usuário final vê como "Tema do Ambiente", "Tema do Portal")

## Decisões Pendentes

1. Como persistir Brand? (JQEL schema? backend config files?)
2. Como fazer upload de assets? (ver `02-asset-upload-problem.md`)
3. Como login acessa brand sem autenticação? (endpoint público? pre-load?)
4. ThemeProvider deve ficar global ou continuar por-portal?
5. Migração: como converter `theme.brandColor` existente para `brand.color`?
