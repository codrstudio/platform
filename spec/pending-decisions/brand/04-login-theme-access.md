# Login Theme Access - Brand sem Autenticação

## Problema

Login page precisa exibir brand do ambiente (realm), mas:

- Usuário **não está autenticado** ainda
- JQEL pode exigir autenticação (JWT)
- Login renderiza **antes** de qualquer contexto de portal/realm estar disponível

## Estado Atual

- `LoginPage.tsx` usa cores hardcoded (`brandColor: '#3B82F6'`)
- Não está envolvido em `ThemeProvider` (fora do `PortalRouter`)
- Não tem acesso a `useTheme()`
- Não carrega assets (logo) do brand

## Opções de Solução

### Opção 1: Endpoint Público de Brand (sem auth)

```typescript
GET /api/1/public/brand/default
// Retorna brand do realm "default" sem exigir JWT
```

**Prós**:
- Simples, direto
- Login carrega brand on-demand

**Contras**:
- Abre exceção de rota REST (viola JQEL)
- Informação pública pode ser sensível?
- Requer tratamento especial de autenticação

### Opção 2: Pre-load via index.html

`index.html` já tem script que tenta detectar tema:

```javascript
const realmId = 'default'; // hardcoded ou detectar via URL
const brand = await fetch('/api/1/public/brand/' + realmId);
localStorage.setItem('realm:default:brand', JSON.stringify(brand));
```

ThemeProvider lê de localStorage no mount.

**Prós**:
- Brand disponível antes de React montar (FOUC-free)
- Login já tem brand no localStorage

**Contras**:
- Ainda precisa de endpoint público
- Overhead no carregamento inicial

### Opção 3: Brand Estático no Build

Brand do realm default é "baked" no build como constante:

```typescript
// gerado em build time
export const DEFAULT_BRAND = { color: "...", assets: {...} };
```

**Prós**:
- Zero latência, sem request
- Não precisa de endpoint público

**Contras**:
- Brand não muda dinamicamente (precisa rebuild)
- Inflexível para múltiplos realms

### Opção 4: ThemeProvider Global (acima de AuthProvider)

Envolver `App.tsx` com `ThemeProvider` antes de qualquer rota:

```tsx
<ThemeProvider realmId="default">
  <AuthProvider>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      ...
    </Routes>
  </AuthProvider>
</ThemeProvider>
```

`ThemeProvider` carrega brand via JQEL ou endpoint público.

**Prós**:
- `useTheme()` disponível em Login
- Consistente com resto do app

**Contras**:
- Como `ThemeProvider` carrega brand sem auth?
- Se exigir auth, bloqueia login

## Decisão Pendente

Qual abordagem usar? Considerar:

1. **Segurança**: Brand do realm é informação pública ou sensível?
2. **Performance**: Pre-load vs. on-demand?
3. **Arquitetura**: Exceção de rota REST é aceitável para brand público?
4. **Multi-tenancy**: Se houver múltiplos realms, como detectar qual usar no login?

## Recomendação Preliminar

**Opção 1 + Opção 2 (Híbrido)**:

- Criar endpoint público: `GET /api/1/public/brand/:realmId` (exceção justificada)
- Pre-load em `index.html` para realm default
- Login usa brand de localStorage ou carrega via endpoint se necessário
- ThemeProvider global lê de localStorage ou faz fetch público

Justificativa: Brand de login é informação **legítima para ser pública** (usuário precisa ver antes de autenticar).
