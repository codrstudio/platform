import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { cacheEpochService } from './cache-epoch.service.js';

export type IconType = 'favicon' | 'pwa-192' | 'pwa-512' | 'apple-touch';
export type IconScope = 'system' | 'realm' | 'portal';

interface IconMetadata {
  type: IconType;
  expectedSize: { width: number; height: number } | 'multi';
  formats: string[];
  filename: string;
}

const ICON_SPECS: Record<IconType, IconMetadata> = {
  'favicon': {
    type: 'favicon',
    expectedSize: 'multi', // ICO pode ter múltiplos tamanhos
    formats: ['.ico', '.png'],
    filename: 'favicon.ico'
  },
  'pwa-192': {
    type: 'pwa-192',
    expectedSize: { width: 192, height: 192 },
    formats: ['.png', '.jpg', '.jpeg'],
    filename: 'pwa-192x192.png'
  },
  'pwa-512': {
    type: 'pwa-512',
    expectedSize: { width: 512, height: 512 },
    formats: ['.png', '.jpg', '.jpeg'],
    filename: 'pwa-512x512.png'
  },
  'apple-touch': {
    type: 'apple-touch',
    expectedSize: { width: 180, height: 180 },
    formats: ['.png', '.jpg', '.jpeg'],
    filename: 'apple-touch-icon.png'
  }
};

export class IconService {
  private readonly publicDir: string;
  private readonly assetsDir: string;
  private readonly maxFileSize = 2 * 1024 * 1024; // 2MB

  constructor() {
    this.publicDir = path.resolve(process.cwd(), 'public');
    this.assetsDir = path.join(this.publicDir, 'assets');
  }

  /**
   * Upload de ícone com validação e processamento
   */
  async uploadIcon(
    scope: IconScope,
    scopeId: string | undefined,
    iconType: IconType,
    file: Express.Multer.File
  ): Promise<{ url: string; path: string }> {
    // Validar tamanho do arquivo
    if (file.size > this.maxFileSize) {
      throw new Error(`Arquivo muito grande. Máximo: ${this.maxFileSize / 1024 / 1024}MB`);
    }

    // Validar tipo do ícone
    const spec = ICON_SPECS[iconType];
    if (!spec) {
      throw new Error(`Tipo de ícone inválido: ${iconType}`);
    }

    // Validar formato
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (!spec.formats.includes(fileExt)) {
      throw new Error(`Formato inválido. Esperado: ${spec.formats.join(', ')}`);
    }

    // Validar dimensões (exceto para favicon multi-size)
    if (spec.expectedSize !== 'multi') {
      await this.validateDimensions(file.buffer, spec.expectedSize);
    }

    // Determinar caminho de destino
    const targetDir = this.getIconDirectory(scope, scopeId);
    const targetPath = path.join(targetDir, spec.filename);

    // Criar diretório se não existir
    await fs.mkdir(targetDir, { recursive: true });

    // Processar e salvar imagem
    await this.processAndSaveIcon(file.buffer, targetPath, iconType);

    // Construir URL pública
    const publicUrl = this.getPublicUrl(scope, scopeId, iconType);

    // Invalidar cache via SSE (usa sistema existente)
    const cacheScope = iconType === 'favicon' ? 'favicon' : 'assets';
    await cacheEpochService.refreshEpoch(cacheScope);

    return {
      url: publicUrl,
      path: targetPath
    };
  }

  /**
   * Deleta ícone customizado (volta para o nível superior)
   */
  async deleteIcon(
    scope: IconScope,
    scopeId: string | undefined,
    iconType: IconType
  ): Promise<void> {
    if (scope === 'system') {
      throw new Error('Não é possível deletar ícones do sistema');
    }

    const spec = ICON_SPECS[iconType];
    const targetDir = this.getIconDirectory(scope, scopeId);
    const targetPath = path.join(targetDir, spec.filename);

    try {
      await fs.unlink(targetPath);

      // Invalidar cache via SSE (usa sistema existente)
      const cacheScope = iconType === 'favicon' ? 'favicon' : 'assets';
      await cacheEpochService.refreshEpoch(cacheScope);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // Arquivo não existe, não é erro
        return;
      }
      throw error;
    }
  }

  /**
   * Resolve caminho do ícone seguindo hierarquia: Portal → Realm → System
   */
  async resolveIconPath(
    realmId: string | undefined,
    portalId: string | undefined,
    iconType: IconType
  ): Promise<string | null> {
    const spec = ICON_SPECS[iconType];

    // 1. Tentar Portal
    if (portalId) {
      const portalPath = path.join(
        this.assetsDir,
        'portals',
        portalId,
        spec.filename
      );
      if (await this.fileExists(portalPath)) {
        return portalPath;
      }
    }

    // 2. Tentar Realm
    if (realmId) {
      const realmPath = path.join(
        this.assetsDir,
        'realms',
        realmId,
        spec.filename
      );
      if (await this.fileExists(realmPath)) {
        return realmPath;
      }
    }

    // 3. Tentar System
    const systemPath = path.join(
      this.assetsDir,
      'system',
      spec.filename
    );
    if (await this.fileExists(systemPath)) {
      return systemPath;
    }

    return null;
  }

  /**
   * Retorna URL pública do ícone
   */
  getPublicUrl(scope: IconScope, scopeId: string | undefined, iconType: IconType): string {
    const spec = ICON_SPECS[iconType];

    if (scope === 'system') {
      return `/assets/system/${spec.filename}`;
    } else if (scope === 'realm') {
      return `/assets/realms/${scopeId}/${spec.filename}`;
    } else {
      return `/assets/portals/${scopeId}/${spec.filename}`;
    }
  }

  /**
   * Valida dimensões da imagem
   */
  private async validateDimensions(
    buffer: Buffer,
    expectedSize: { width: number; height: number }
  ): Promise<void> {
    try {
      const metadata = await sharp(buffer).metadata();

      if (!metadata.width || !metadata.height) {
        throw new Error('Não foi possível determinar as dimensões da imagem');
      }

      if (metadata.width !== expectedSize.width || metadata.height !== expectedSize.height) {
        throw new Error(
          `Dimensões inválidas. Esperado: ${expectedSize.width}x${expectedSize.height}, ` +
          `Recebido: ${metadata.width}x${metadata.height}`
        );
      }
    } catch (error: any) {
      if (error.message.includes('Dimensões inválidas')) {
        throw error;
      }
      throw new Error('Formato de imagem inválido ou corrompido');
    }
  }

  /**
   * Processa e salva ícone com otimização
   */
  private async processAndSaveIcon(
    buffer: Buffer,
    targetPath: string,
    iconType: IconType
  ): Promise<void> {
    const ext = path.extname(targetPath).toLowerCase();

    // ICO não é processado pelo sharp, salva direto
    if (ext === '.ico' || iconType === 'favicon') {
      await fs.writeFile(targetPath, buffer);
      return;
    }

    // PNG: otimiza e salva
    await sharp(buffer)
      .png({ compressionLevel: 9, quality: 90 })
      .toFile(targetPath);
  }

  /**
   * Retorna diretório do ícone baseado no escopo
   */
  private getIconDirectory(scope: IconScope, scopeId: string | undefined): string {
    if (scope === 'system') {
      return path.join(this.assetsDir, 'system');
    } else if (scope === 'realm') {
      if (!scopeId) throw new Error('realmId é obrigatório para scope realm');
      return path.join(this.assetsDir, 'realms', scopeId);
    } else {
      if (!scopeId) throw new Error('portalId é obrigatório para scope portal');
      return path.join(this.assetsDir, 'portals', scopeId);
    }
  }

  /**
   * Verifica se arquivo existe
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
