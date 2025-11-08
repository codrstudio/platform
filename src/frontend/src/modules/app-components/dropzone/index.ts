/**
 * react-dropzone - Upload de arquivos e imagens
 *
 * Re-exporta hooks do react-dropzone.
 *
 * @see https://react-dropzone.js.org/
 */

export {
  useDropzone,

  // Types
  type DropzoneOptions,
  type DropzoneState,
  type FileRejection,
  type FileError,
} from 'react-dropzone';

/**
 * Configuração padrão do dropzone
 */
export const DEFAULT_DROPZONE_CONFIG = {
  maxSize: 10 * 1024 * 1024, // 10MB
  multiple: true,
  accept: {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    'application/pdf': ['.pdf'],
    'text/*': ['.txt', '.md'],
  },
};
