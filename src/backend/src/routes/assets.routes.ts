import { Router, Request, Response } from 'express';
import { IconService, IconType, IconScope } from '../services/icon.service';
import { uploadMiddleware, handleUploadError } from '../middleware/upload.middleware';
import { validateJWT } from '../middleware/auth.middleware';

const router = Router();

// Instanciar serviços
const iconService = new IconService();

/**
 * POST /api/1/assets/icons
 * Upload de ícone customizado
 */
router.post(
  '/icons',
  validateJWT,
  uploadMiddleware.single('file'),
  handleUploadError,
  async (req: Request, res: Response) => {
    try {
      const { scope, scopeId, iconType } = req.body;

      // Validar parâmetros obrigatórios
      if (!scope || !iconType) {
        return res.status(400).json({
          success: false,
          error: 'Parâmetros obrigatórios: scope, iconType'
        });
      }

      // Validar scope
      if (!['system', 'realm', 'portal'].includes(scope)) {
        return res.status(400).json({
          success: false,
          error: 'scope inválido. Use: system, realm ou portal'
        });
      }

      // Validar iconType
      const validIconTypes: IconType[] = ['favicon', 'pwa-192', 'pwa-512', 'apple-touch'];
      if (!validIconTypes.includes(iconType as IconType)) {
        return res.status(400).json({
          success: false,
          error: `iconType inválido. Use: ${validIconTypes.join(', ')}`
        });
      }

      // Validar scopeId para realm/portal
      if ((scope === 'realm' || scope === 'portal') && !scopeId) {
        return res.status(400).json({
          success: false,
          error: `scopeId é obrigatório para scope ${scope}`
        });
      }

      // Validar arquivo
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Arquivo não enviado'
        });
      }

      // Upload do ícone
      const result = await iconService.uploadIcon(
        scope as IconScope,
        scopeId,
        iconType as IconType,
        req.file
      );

      return res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Erro no upload de ícone:', error);
      return res.status(400).json({
        success: false,
        error: error.message || 'Erro ao fazer upload do ícone'
      });
    }
  }
);

/**
 * DELETE /api/1/assets/icons
 * Remove ícone customizado (volta para o nível superior)
 */
router.delete(
  '/icons',
  validateJWT,
  async (req: Request, res: Response) => {
    try {
      const { scope, scopeId, iconType } = req.body;

      // Validar parâmetros obrigatórios
      if (!scope || !iconType) {
        return res.status(400).json({
          success: false,
          error: 'Parâmetros obrigatórios: scope, iconType'
        });
      }

      // Não permitir deletar ícones do sistema
      if (scope === 'system') {
        return res.status(403).json({
          success: false,
          error: 'Não é possível deletar ícones do sistema'
        });
      }

      // Validar scope
      if (!['realm', 'portal'].includes(scope)) {
        return res.status(400).json({
          success: false,
          error: 'scope inválido. Use: realm ou portal'
        });
      }

      // Validar iconType
      const validIconTypes: IconType[] = ['favicon', 'pwa-192', 'pwa-512', 'apple-touch'];
      if (!validIconTypes.includes(iconType as IconType)) {
        return res.status(400).json({
          success: false,
          error: `iconType inválido. Use: ${validIconTypes.join(', ')}`
        });
      }

      // Validar scopeId
      if (!scopeId) {
        return res.status(400).json({
          success: false,
          error: `scopeId é obrigatório para scope ${scope}`
        });
      }

      // Deletar ícone
      await iconService.deleteIcon(
        scope as IconScope,
        scopeId,
        iconType as IconType
      );

      return res.json({
        success: true,
        message: 'Ícone deletado com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao deletar ícone:', error);
      return res.status(400).json({
        success: false,
        error: error.message || 'Erro ao deletar ícone'
      });
    }
  }
);

/**
 * GET /api/1/assets/icons/:iconType
 * Retorna ícone seguindo hierarquia (Portal → Realm → System)
 * Query params: realm, portal
 */
router.get(
  '/icons/:iconType',
  async (req: Request, res: Response) => {
    try {
      const { iconType } = req.params;
      const { realm, portal } = req.query;

      // Validar iconType
      const validIconTypes: IconType[] = ['favicon', 'pwa-192', 'pwa-512', 'apple-touch'];
      if (!validIconTypes.includes(iconType as IconType)) {
        return res.status(400).json({
          success: false,
          error: `iconType inválido. Use: ${validIconTypes.join(', ')}`
        });
      }

      // Resolver caminho do ícone
      const iconPath = await iconService.resolveIconPath(
        realm as string | undefined,
        portal as string | undefined,
        iconType as IconType
      );

      if (!iconPath) {
        return res.status(404).json({
          success: false,
          error: 'Ícone não encontrado'
        });
      }

      // Servir arquivo com cache headers
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hora
      return res.sendFile(iconPath);
    } catch (error: any) {
      console.error('Erro ao buscar ícone:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Erro ao buscar ícone'
      });
    }
  }
);

/**
 * GET /api/1/assets/icons/:iconType/url
 * Retorna apenas a URL do ícone (sem servir o arquivo)
 */
router.get(
  '/icons/:iconType/url',
  async (req: Request, res: Response) => {
    try {
      const { iconType } = req.params;
      const { realm, portal } = req.query;

      // Validar iconType
      const validIconTypes: IconType[] = ['favicon', 'pwa-192', 'pwa-512', 'apple-touch'];
      if (!validIconTypes.includes(iconType as IconType)) {
        return res.status(400).json({
          success: false,
          error: `iconType inválido. Use: ${validIconTypes.join(', ')}`
        });
      }

      // Resolver caminho do ícone
      const iconPath = await iconService.resolveIconPath(
        realm as string | undefined,
        portal as string | undefined,
        iconType as IconType
      );

      if (!iconPath) {
        return res.status(404).json({
          success: false,
          error: 'Ícone não encontrado'
        });
      }

      // Determinar scope baseado no caminho
      let scope: IconScope;
      let scopeId: string | undefined;

      if (iconPath.includes('/portals/')) {
        scope = 'portal';
        scopeId = portal as string;
      } else if (iconPath.includes('/realms/')) {
        scope = 'realm';
        scopeId = realm as string;
      } else {
        scope = 'system';
        scopeId = undefined;
      }

      // Retornar URL pública
      const publicUrl = iconService.getPublicUrl(scope, scopeId, iconType as IconType);

      return res.json({
        success: true,
        data: {
          url: publicUrl,
          scope,
          scopeId
        }
      });
    } catch (error: any) {
      console.error('Erro ao buscar URL do ícone:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Erro ao buscar URL do ícone'
      });
    }
  }
);

export default router;
