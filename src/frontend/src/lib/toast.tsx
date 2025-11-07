/**
 * Toast Notification Helpers
 *
 * SPEC-ERR-UI-005: Variantes de toast
 * SPEC-ERR-UI-006: Exemplo de uso
 * Helpers convenientes para notificações com padrões consistentes
 */

import { toast as sonnerToast } from 'sonner';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import type { ReactNode } from 'react';

export interface ToastOptions {
  description?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  id?: string | number;
}

/**
 * Success toast with green color and check icon
 * SPEC-ERR-UI-005: toast.success() - Sucesso (verde, ícone CheckCircle)
 */
export const toastSuccess = (message: string, options?: ToastOptions) => {
  return sonnerToast.success(message, {
    ...options,
    icon: <CheckCircle className="h-5 w-5" />
  });
};

/**
 * Error toast with red color and X icon
 * SPEC-ERR-UI-005: toast.error() - Erros (vermelho, ícone XCircle)
 */
export const toastError = (message: string, options?: ToastOptions) => {
  return sonnerToast.error(message, {
    ...options,
    icon: <XCircle className="h-5 w-5" />
  });
};

/**
 * Warning toast with yellow color and triangle icon
 * SPEC-ERR-UI-005: toast.warning() - Avisos (amarelo, ícone AlertTriangle)
 */
export const toastWarning = (message: string, options?: ToastOptions) => {
  return sonnerToast.warning(message, {
    ...options,
    icon: <AlertTriangle className="h-5 w-5" />
  });
};

/**
 * Info toast with blue color and info icon
 * SPEC-ERR-UI-005: toast.info() - Informação (azul, ícone Info)
 */
export const toastInfo = (message: string, options?: ToastOptions) => {
  return sonnerToast.info(message, {
    ...options,
    icon: <Info className="h-5 w-5" />
  });
};

/**
 * Loading toast that can be updated
 * Returns ID to update/dismiss later
 */
export const toastLoading = (message: string, options?: Omit<ToastOptions, 'id'>) => {
  return sonnerToast.loading(message, options);
};

/**
 * Promise-based toast for async operations
 * Shows loading → success/error based on promise result
 */
export const toastPromise = <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: any) => string);
  },
  options?: ToastOptions
) => {
  // Sonner's promise API accepts only 2 parameters: promise and data object
  // The data object contains both messages and options merged together
  return sonnerToast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
    ...options,
  });
};

/**
 * Dismiss a specific toast or all toasts
 */
export const dismissToast = (id?: string | number) => {
  sonnerToast.dismiss(id);
};

/**
 * Common toast patterns
 */

export const toastSaved = (itemName?: string) => {
  toastSuccess(
    itemName ? `${itemName} salvo com sucesso!` : 'Salvo com sucesso!'
  );
};

export const toastDeleted = (itemName?: string) => {
  toastSuccess(
    itemName ? `${itemName} removido com sucesso!` : 'Removido com sucesso!'
  );
};

export const toastCopied = (itemName?: string) => {
  toastSuccess(
    itemName ? `${itemName} copiado!` : 'Copiado para a área de transferência!'
  );
};

export const toastNetworkError = (retry?: () => void) => {
  toastError('Erro de conexão', {
    description: 'Verifique sua internet e tente novamente',
    action: retry ? {
      label: 'Tentar novamente',
      onClick: retry
    } : undefined
  });
};

export const toastPermissionDenied = () => {
  toastError('Sem permissão', {
    description: 'Você não tem permissão para realizar esta ação'
  });
};

export const toastSessionExpired = () => {
  toastWarning('Sessão expirada', {
    description: 'Faça login novamente para continuar'
  });
};

export const toastValidationError = (fields?: string[]) => {
  toastWarning('Dados inválidos', {
    description: fields?.length
      ? `Verifique os campos: ${fields.join(', ')}`
      : 'Verifique os campos do formulário'
  });
};

/**
 * Re-export the original toast for advanced usage
 */
export const toast = sonnerToast;

/**
 * Example usage:
 *
 * import { toastSuccess, toastError, toastPromise } from '@/lib/toast';
 *
 * // Simple notifications
 * toastSuccess('Usuário criado com sucesso!');
 * toastError('Erro ao salvar', { description: 'Tente novamente' });
 *
 * // With retry action
 * toastError('Falha na conexão', {
 *   action: {
 *     label: 'Tentar novamente',
 *     onClick: () => refetch()
 *   }
 * });
 *
 * // Promise-based
 * const savePromise = saveUser(data);
 * toastPromise(savePromise, {
 *   loading: 'Salvando usuário...',
 *   success: 'Usuário salvo com sucesso!',
 *   error: (err) => `Erro: ${err.message}`
 * });
 *
 * // Loading state with update
 * const id = toastLoading('Processando...');
 * // Later...
 * dismissToast(id);
 * toastSuccess('Processamento concluído!');
 */