import { Router, Request, Response } from 'express';
import { IconService } from '../services/icon.service';
import { configService } from '../services/config.service';

const router = Router();

// Instanciar serviços
const iconService = new IconService();

interface ManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose: string;
}

interface WebAppManifest {
  name: string;
  short_name: string;
  description?: string;
  theme_color: string;
  background_color: string;
  display: string;
  scope: string;
  start_url: string;
  icons: ManifestIcon[];
}

/**
 * GET /manifest.webmanifest
 * Gera manifest PWA dinâmico baseado em realm e portal
 * Query params: realm, portal
 */
router.get('/manifest.webmanifest', async (req: Request, res: Response) => {
  try {
    const { realm, portal } = req.query;

    // Obter configurações do portal/realm
    let portalData = null;
    let realmData = null;
    let manifestName = 'Platform';
    let manifestDescription = 'Modular Application Framework';
    let themeColor = '#2e216c'; // Default purple
    let backgroundColor = '#ffffff'; // Default white

    // Buscar dados do portal
    if (portal && typeof portal === 'string') {
      portalData = await configService.getPortalById(portal);
      if (portalData) {
        manifestName = portalData.name || manifestName;
        manifestDescription = portalData.description || manifestDescription;

        // Portal não tem config.theme - buscar do realm associado
        realmData = await configService.getRealmById(portalData.realmId);
      }
    }

    // Buscar dados do realm (se ainda não foi buscado)
    if (!realmData && realm && typeof realm === 'string') {
      realmData = await configService.getRealmById(realm);
    }

    // Usar brand color do realm (se disponível)
    if (realmData?.config?.theme?.brandColor) {
      themeColor = hslToHex(realmData.config.theme.brandColor);
    }

    // Resolver URLs dos ícones
    const icons: ManifestIcon[] = [];

    // Ícone 192x192
    const icon192Path = await iconService.resolveIconPath(
      realm as string | undefined,
      portal as string | undefined,
      'pwa-192'
    );
    if (icon192Path) {
      const icon192Url = getIconUrl(icon192Path, realm as string, portal as string);
      icons.push({
        src: icon192Url,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      });
    }

    // Ícone 512x512
    const icon512Path = await iconService.resolveIconPath(
      realm as string | undefined,
      portal as string | undefined,
      'pwa-512'
    );
    if (icon512Path) {
      const icon512Url = getIconUrl(icon512Path, realm as string, portal as string);
      icons.push({
        src: icon512Url,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      });
    }

    // Construir manifest
    const manifest: WebAppManifest = {
      name: manifestName,
      short_name: manifestName.length > 12 ? manifestName.substring(0, 12) : manifestName,
      description: manifestDescription,
      theme_color: themeColor,
      background_color: backgroundColor,
      display: 'standalone',
      scope: '/',
      start_url: portal ? `/${portal}?source=pwa` : '/?source=pwa',
      icons
    };

    // Headers de cache
    res.setHeader('Content-Type', 'application/manifest+json');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hora

    res.json(manifest);
  } catch (error: any) {
    console.error('Erro ao gerar manifest:', error);

    // Fallback: manifest básico
    const fallbackManifest: WebAppManifest = {
      name: 'Platform',
      short_name: 'Platform',
      description: 'Modular Application Framework',
      theme_color: '#2e216c',
      background_color: '#ffffff',
      display: 'standalone',
      scope: '/',
      start_url: '/?source=pwa',
      icons: []
    };

    res.setHeader('Content-Type', 'application/manifest+json');
    res.setHeader('Cache-Control', 'public, max-age=60'); // 1 minuto em caso de erro
    res.json(fallbackManifest);
  }
});

/**
 * Converte HSL para HEX
 * HSL format: "221 83% 53%"
 */
function hslToHex(hsl: string): string {
  try {
    const parts = hsl.trim().split(/\s+/);
    if (parts.length !== 3) return '#2e216c';

    const h = parseInt(parts[0]);
    const s = parseInt(parts[1].replace('%', '')) / 100;
    const l = parseInt(parts[2].replace('%', '')) / 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else if (h >= 300 && h < 360) {
      r = c; g = 0; b = x;
    }

    const toHex = (n: number) => {
      const hex = Math.round((n + m) * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  } catch (error) {
    console.error('Erro ao converter HSL para HEX:', error);
    return '#2e216c';
  }
}

/**
 * Extrai URL pública do caminho do arquivo
 */
function getIconUrl(filePath: string, realm: string, portal: string): string {
  // Determinar se é system, realm ou portal
  if (filePath.includes('/portals/')) {
    const filename = filePath.split('/').pop() || '';
    return `/assets/portals/${portal}/${filename}`;
  } else if (filePath.includes('/realms/')) {
    const filename = filePath.split('/').pop() || '';
    return `/assets/realms/${realm}/${filename}`;
  } else {
    const filename = filePath.split('/').pop() || '';
    return `/assets/system/${filename}`;
  }
}

export default router;
