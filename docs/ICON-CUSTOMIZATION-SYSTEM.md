# Sistema de Customização de Ícones PWA

## Visão Geral

Este documento descreve o sistema completo de customização de ícones PWA implementado na plataforma. O sistema permite que usuários façam upload de ícones personalizados (favicon, PWA icons, apple-touch-icon) com invalidação automática de cache em tempo real via SSE (Server-Sent Events).

## Arquitetura

### Fluxo Completo

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   FRONTEND  │─────▶│   BACKEND   │─────▶│  BACKBONE   │
│   (React)   │◀─────│  (Express)  │◀─────│    (n8n)    │
└─────────────┘      └─────────────┘      └─────────────┘
      │                     │                     │
      │                     │                     │
      ▼                     ▼                     ▼
 IconUploader          IconService           (Futuro)
      │                     │
      │                     ▼
      │              Redis Pub/Sub ──────▶ SSE Stream
      │                     │                     │
      ▼                     │                     ▼
Service Worker◀────────────┴──────────── IconCacheManager
```

### Hierarquia de Resolução

O sistema segue uma hierarquia de 3 níveis para resolução de ícones:

1. **Portal** - `/public/assets/portals/{portalId}/`
2. **Realm** - `/public/assets/realms/{realmId}/`
3. **System** - `/public/assets/system/`

Se um ícone não for encontrado em nível de Portal, o sistema busca no Realm. Se não encontrar no Realm, utiliza o ícone do System.

## Componentes

### Backend

#### 1. IconService (`src/backend/src/services/icon.service.ts`)

Serviço principal para gerenciamento de ícones.

**Responsabilidades**:
- Upload e validação de ícones
- Processamento de imagens com Sharp
- Resolução de caminhos na hierarquia
- Emissão de eventos SSE

**Métodos principais**:
```typescript
uploadIcon(scope, scopeId, iconType, file): Promise<{url, path}>
deleteIcon(scope, scopeId, iconType): Promise<void>
resolveIconPath(realmId, portalId, iconType): Promise<string | null>
getPublicUrl(scope, scopeId, iconType): string
```

**Validações**:
- Tamanho máximo: 2MB
- Formatos aceitos: ICO, PNG, JPG
- Dimensões obrigatórias:
  - Favicon: Multi-size (16x16, 32x32, 48x48)
  - PWA 192: 192x192px
  - PWA 512: 512x512px
  - Apple Touch: 180x180px

#### 2. Upload Middleware (`src/backend/src/middleware/upload.middleware.ts`)

Middleware baseado em Multer para processamento de uploads.

**Configuração**:
- Storage: Memória (validação antes de salvar)
- Limite de tamanho: 2MB
- Limite de arquivos: 1 por vez
- Filtro de MIME types

#### 3. Rotas de Assets (`src/backend/src/routes/assets.routes.ts`)

**Endpoints**:
- `POST /api/1/assets/icons` - Upload de ícone
- `DELETE /api/1/assets/icons` - Remove customização
- `GET /api/1/assets/icons/:iconType` - Resolve e serve ícone
- `GET /api/1/assets/icons/:iconType/url` - Retorna apenas URL

#### 4. Manifest Dinâmico (`src/backend/src/routes/manifest.routes.ts`)

**Endpoint**:
- `GET /manifest.webmanifest?realm={realmId}&portal={portalId}`

**Funcionalidades**:
- Gera manifest.webmanifest dinâmicamente
- Resolve ícones na hierarquia
- Aplica brand color do tema
- Cache de 1 hora (3600s)

**Exemplo de resposta**:
```json
{
  "name": "Platform - Portal Name",
  "short_name": "Portal",
  "theme_color": "#2e216c",
  "background_color": "#ffffff",
  "display": "standalone",
  "scope": "/",
  "start_url": "/?source=pwa",
  "icons": [
    {
      "src": "/assets/portals/main/pwa-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### Frontend

#### 1. IconUploader Component (`src/frontend/src/modules/setup/components/IconUploader.tsx`)

Componente React para upload de ícones.

**Features**:
- Drag & drop e click para upload
- Preview de imagem atual
- Validação client-side (tipo, tamanho, dimensões)
- Progress bar durante upload
- Botão para remover customização
- Feedback visual (sucesso, erro, loading)

**Props**:
```typescript
interface IconUploaderProps {
  scope: 'realm' | 'portal';
  scopeId: string;
  iconType: 'favicon' | 'pwa-192' | 'pwa-512' | 'apple-touch';
  label: string;
  description: string;
  currentUrl?: string;
  onUploadComplete?: (url: string) => void;
  onDelete?: () => void;
}
```

#### 2. IconCacheManager Hook (`src/frontend/src/hooks/useIconCacheManager.ts`)

Hook React para gerenciar cache de ícones via SSE.

**Funcionalidades**:
- Conecta ao stream SSE (`/api/events/stream`)
- Escuta eventos `theme-change`
- Invalida cache do Service Worker
- Recarrega favicon, manifest e apple-touch-icon dinamicamente
- Reconexão automática em caso de erro

**Eventos tratados**:
```typescript
interface ThemeChangeEvent {
  type: 'theme-change';
  target: 'global' | 'realm:X' | 'portal:Y';
  data: {
    changeType: 'icons' | 'colors' | 'manifest';
    affectedAssets: string[];
    timestamp: string;
  };
}
```

#### 3. ThemeConfig Page (Atualizada)

A página `/setup/portals/:portalId/theme` foi atualizada com seções de ícones em ambas as abas (Realm e Portal).

**Nova estrutura**:
- Tab Ambiente: Cor do Ambiente + Ícones do Ambiente
- Tab Portal: Cor do Portal + Ícones do Portal

### Service Worker

#### Estratégias de Cache

**Icons & PWA Assets**:
```javascript
Cache: 'icons-cache'
Strategy: CacheFirst
Expiration: 7 dias
Max entries: 20
```

**Manifest**:
```javascript
Cache: 'manifest-cache'
Strategy: CacheFirst
Expiration: 1 dia
Max entries: 5
```

#### Message Handler

O Service Worker escuta mensagens do tipo `INVALIDATE_ICONS` e executa:

1. Remove todos os arquivos do `icons-cache`
2. Remove ícones específicos do `images-cache`
3. Remove manifest.webmanifest do cache
4. Responde ao client com `ICONS_CACHE_INVALIDATED`

## Fluxo de Upload

### Passo a Passo

1. **Usuário** acessa `/setup/portals/:portalId/theme`
2. **Usuário** seleciona tab (Ambiente ou Portal)
3. **Usuário** faz upload de um ícone via drag & drop ou click
4. **IconUploader** valida arquivo (tipo, tamanho)
5. **IconUploader** valida dimensões da imagem
6. **IconUploader** envia POST `/api/1/assets/icons` com FormData
7. **Backend** valida novamente e processa com Sharp
8. **Backend** salva em `/public/assets/{portals|realms}/{id}/`
9. **Backend** publica evento SSE `theme-change` via Redis Pub/Sub
10. **Todos os clientes** conectados recebem o evento
11. **IconCacheManager** invalida cache do Service Worker
12. **IconCacheManager** atualiza links de favicon e manifest (cache-busting)
13. **Service Worker** remove arquivos dos caches
14. **Usuário** vê o novo ícone aplicado imediatamente

## Estrutura de Arquivos

```
platform/
├── public/
│   └── assets/
│       ├── system/              # Ícones padrão
│       │   ├── favicon.ico
│       │   ├── pwa-192x192.png
│       │   ├── pwa-512x512.png
│       │   └── apple-touch-icon.png
│       │
│       ├── realms/              # Ícones por realm
│       │   └── {realmId}/
│       │       ├── favicon.ico
│       │       ├── pwa-192x192.png
│       │       ├── pwa-512x512.png
│       │       └── apple-touch-icon.png
│       │
│       └── portals/             # Ícones por portal
│           └── {portalId}/
│               ├── favicon.ico
│               ├── pwa-192x192.png
│               ├── pwa-512x512.png
│               └── apple-touch-icon.png
│
├── src/
│   ├── backend/
│   │   ├── services/
│   │   │   └── icon.service.ts
│   │   ├── middleware/
│   │   │   └── upload.middleware.ts
│   │   └── routes/
│   │       ├── assets.routes.ts
│   │       └── manifest.routes.ts
│   │
│   └── frontend/
│       ├── modules/setup/
│       │   ├── components/
│       │   │   └── IconUploader.tsx
│       │   └── pages/
│       │       └── ThemeConfig.tsx
│       └── hooks/
│           └── useIconCacheManager.ts
│
└── docs/
    └── ICON-CUSTOMIZATION-SYSTEM.md  # Este arquivo
```

## Tipos de Ícones

### 1. Favicon (`favicon.ico`)
- **Tamanho**: Multi-size (16x16, 32x32, 48x48)
- **Formato**: ICO, PNG
- **Uso**: Aba do navegador, favoritos

### 2. PWA 192 (`pwa-192x192.png`)
- **Tamanho**: 192x192px
- **Formato**: PNG, JPG
- **Uso**: Ícone pequeno PWA, atalhos, splash screens

### 3. PWA 512 (`pwa-512x512.png`)
- **Tamanho**: 512x512px
- **Formato**: PNG, JPG
- **Uso**: Ícone grande PWA, tela inicial, splash screens

### 4. Apple Touch (`apple-touch-icon.png`)
- **Tamanho**: 180x180px
- **Formato**: PNG, JPG
- **Uso**: iOS home screen icon, Safari

## Segurança

### Validações

**Backend**:
- Validação de MIME type (não confia no cliente)
- Limite de tamanho (2MB)
- Validação de dimensões via Sharp
- Sanitização de nome de arquivo
- Prevenção de path traversal
- Autenticação JWT obrigatória

**Frontend**:
- Validação de extensão
- Validação de tamanho
- Validação de dimensões via Image API
- Feedback de erros claro

### Permissões

- Apenas usuários autenticados podem fazer upload
- Rotas protegidas com `validateJWT` middleware
- Escopo "system" não permite uploads (apenas realm/portal)

## Performance

### Otimizações

**Processamento de Imagens**:
- Sharp para otimização PNG (compression level 9, quality 90)
- ICO salvo diretamente (sem reprocessamento)

**Cache**:
- Service Worker com CacheFirst strategy
- Headers de cache HTTP (public, max-age=3600)
- ETags baseados em hash dos arquivos (futuro)

**Rede**:
- Upload via multipart/form-data
- Limite de 1 arquivo por vez
- Validação client-side antes do upload

### Targets

- Upload: < 2s para arquivo de 1MB
- Invalidação de cache: < 500ms
- Hot-reload de ícones: Instantâneo (sem refresh)

## Compatibilidade

### Navegadores

- Chrome/Edge: ✅ Suporte completo
- Firefox: ✅ Suporte completo
- Safari: ✅ Com apple-touch-icon
- Opera: ✅ Suporte completo

### Devices

- Desktop: ✅ PWA installable
- Android: ✅ PWA installable
- iOS: ✅ Via apple-touch-icon

## Testes

### Casos de Teste

1. ✅ Upload de arquivo válido (PNG 192x192)
2. ✅ Upload de arquivo inválido (dimensões erradas)
3. ✅ Upload de arquivo muito grande (> 2MB)
4. ✅ Upload de tipo errado (GIF, BMP)
5. ✅ Deleção de ícone customizado (volta ao padrão)
6. ✅ Resolução de hierarquia (Portal → Realm → System)
7. ✅ Manifest dinâmico (com brand color e ícones corretos)
8. ✅ SSE event propagation (múltiplos clientes)
9. ✅ Cache invalidation (service worker atualiza)
10. ✅ Favicon hot-reload (sem refresh da página)

### Como Testar

#### 1. Upload de Ícone
```bash
# Acesse a página de tema
http://localhost:3000/setup/portals/sandbox/theme

# Selecione tab "Ambiente" ou "Portal"
# Arraste um PNG 192x192 para o card "Ícone Pequeno"
# Verifique sucesso no toast
```

#### 2. Invalidação de Cache
```bash
# Em outra aba, abra DevTools > Console
# Observe mensagens:
# [IconCacheManager] Theme change event received
# [SW] Icon cache invalidation complete
```

#### 3. Manifest Dinâmico
```bash
# Acesse diretamente
curl http://localhost:3000/manifest.webmanifest?portal=sandbox

# Verifique JSON com ícones corretos e brand color
```

## Troubleshooting

### Problema: Upload falha com "Dimensões inválidas"

**Causa**: Imagem não tem o tamanho exato esperado

**Solução**:
```bash
# Redimensionar com ImageMagick
convert original.png -resize 192x192! output.png
```

### Problema: Ícone não atualiza após upload

**Causa**: Cache do navegador ou Service Worker

**Solução**:
1. Verifique console do navegador
2. Force refresh com Ctrl+Shift+R
3. Limpe cache do Service Worker no DevTools
4. Verifique se SSE está conectado

### Problema: Erro "Failed to fetch" no upload

**Causa**: Backend não está rodando ou CORS

**Solução**:
```bash
# Verifique se backend está rodando
cd src/backend && npm run dev

# Verifique variável FRONTEND_URL em .env
FRONTEND_URL=http://localhost:5173
```

## Próximos Passos

### Melhorias Futuras

1. **Geração Automática de Tamanhos**
   - Upload de 1 imagem grande
   - Backend gera todos os tamanhos automaticamente

2. **Preview em Tempo Real**
   - Mostrar como ficará em diferentes contextos
   - Simulação de tela inicial Android/iOS

3. **Compressão Inteligente**
   - Usar TinyPNG API para otimização adicional
   - WebP como formato alternativo

4. **Histórico de Versões**
   - Armazenar versões anteriores
   - Permitir rollback

5. **API para Backbone**
   - Integração com n8n workflows
   - Automação de upload via API

## Referências

- [Web App Manifest Spec](https://www.w3.org/TR/appmanifest/)
- [PWA Icon Guidelines](https://web.dev/install-criteria/)
- [Apple Touch Icon](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Sharp Documentation](https://sharp.pixelplumbing.com/)
- [Multer Documentation](https://github.com/expressjs/multer)
- [Server-Sent Events Spec](https://html.spec.whatwg.org/multipage/server-sent-events.html)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

## Autor

Sistema implementado em 2025-11-10 por Claude Code seguindo as especificações da plataforma.

## Licença

Parte da plataforma codr.studio. Todos os direitos reservados.
