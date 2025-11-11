import multer from 'multer';
import path from 'path';
import type { Request, Response, NextFunction } from 'express';

// Configuração de storage em memória para validação antes de salvar
const storage = multer.memoryStorage();

// Filtro de tipos MIME aceitos
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    'image/x-icon',           // .ico
    'image/vnd.microsoft.icon', // .ico
    'image/png',              // .png
    'image/jpeg',             // .jpg, .jpeg
  ];

  const allowedExtensions = ['.ico', '.png', '.jpg', '.jpeg'];
  const fileExt = path.extname(file.originalname).toLowerCase();

  if (
    allowedMimeTypes.includes(file.mimetype) &&
    allowedExtensions.includes(fileExt)
  ) {
    cb(null, true);
  } else {
    cb(new Error('Formato de arquivo inválido. Aceito: ICO, PNG, JPG'));
  }
};

// Configuração do multer
export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
    files: 1 // Apenas 1 arquivo por vez
  }
});

/**
 * Middleware de tratamento de erros de upload
 */
export const handleUploadError = (
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'Arquivo muito grande. Tamanho máximo: 2MB'
      });
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Apenas 1 arquivo por vez é permitido'
      });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Campo de arquivo inesperado. Use "file" como nome do campo'
      });
    }

    return res.status(400).json({
      success: false,
      error: `Erro no upload: ${err.message}`
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      error: err.message || 'Erro ao processar upload'
    });
  }

  return next();
};
