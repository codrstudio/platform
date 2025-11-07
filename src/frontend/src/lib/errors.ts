/**
 * Error Classes and Utilities
 *
 * SPEC-ERR-UTIL-001 a SPEC-ERR-UTIL-003: Utilities e classes customizadas
 * SPEC-ERR-JQEL-001 a SPEC-ERR-JQEL-006: Mensagens específicas para erros JQEL
 */

import { Logger } from './logger';
import { toast } from 'sonner';

// SPEC-ERR-UTIL-002: Classes de erro customizadas
export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class JqelError extends Error {
  constructor(
    message: string,
    public schema?: string,
    public entity?: string,
    public action?: string,
    public code?: string
  ) {
    super(message);
    this.name = 'JqelError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public fields?: Record<string, string[]>,
    public code?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public url?: string,
    public method?: string
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ModuleError extends Error {
  constructor(
    message: string,
    public moduleId?: string,
    public instanceId?: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ModuleError';
  }
}

// Type guards
export const isAuthError = (error: any): error is AuthError =>
  error instanceof AuthError;

export const isJqelError = (error: any): error is JqelError =>
  error instanceof JqelError;

export const isValidationError = (error: any): error is ValidationError =>
  error instanceof ValidationError;

export const isNetworkError = (error: any): error is NetworkError =>
  error instanceof NetworkError;

export const isModuleError = (error: any): error is ModuleError =>
  error instanceof ModuleError;

// Helper to check if error is retryable
export const isRetryableError = (error: any): boolean => {
  // Network errors with 5xx status codes are retryable
  if (isNetworkError(error) && error.statusCode) {
    return error.statusCode >= 500 && error.statusCode < 600;
  }

  // 429 Too Many Requests is retryable (after delay)
  if (isNetworkError(error) && error.statusCode === 429) {
    return true;
  }

  // Timeout errors are retryable
  if (error?.code === 'TIMEOUT' || error?.code === 'ECONNABORTED') {
    return true;
  }

  // Connection errors are retryable
  if (error?.code === 'NETWORK_ERROR' || error?.code === 'ECONNREFUSED') {
    return true;
  }

  return false;
};

// SPEC-ERR-JQEL-001 a SPEC-ERR-JQEL-006: Mensagens específicas para erros JQEL
export const getJqelErrorMessage = (error: JqelError): string => {
  if (error.code === 'SCHEMA_NOT_FOUND') {
    return 'Recurso não disponível.';
  }

  if (error.code === 'ENTITY_NOT_FOUND') {
    return 'Recurso não disponível.';
  }

  if (error.code === 'ACTION_NOT_FOUND') {
    return 'Operação não disponível.';
  }

  if (error.code === 'VALIDATION_FAILED') {
    return 'Dados inválidos.';
  }

  if (error.code === 'PERMISSION_DENIED') {
    return 'Você não tem permissão para esta operação.';
  }

  if (error.code === 'TIMEOUT') {
    return 'A operação demorou demais. Tente novamente.';
  }

  return error.message || 'Erro ao processar operação.';
};

// SPEC-ERR-NET-001 a SPEC-ERR-NET-004: Mensagens de erro de rede
export const getNetworkErrorMessage = (error: NetworkError | any): string => {
  if (isNetworkError(error)) {
    switch (error.statusCode) {
      case 400:
        return 'Dados inválidos enviados.';
      case 401:
        return 'Sessão expirada. Faça login novamente.';
      case 403:
        return 'Você não tem permissão para esta ação.';
      case 404:
        return 'Recurso não encontrado.';
      case 429:
        return 'Muitas requisições. Aguarde um momento.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'Erro no servidor. Tente novamente em instantes.';
      default:
        if (error.statusCode && error.statusCode >= 500) {
          return 'Erro no servidor. Tente novamente em instantes.';
        }
        return error.message || 'Erro de conexão.';
    }
  }

  // Check for common network error codes
  if (error?.code === 'NETWORK_ERROR' || !navigator.onLine) {
    return 'Sem conexão com a internet. Reconectando...';
  }

  if (error?.code === 'TIMEOUT') {
    return 'A requisição demorou demais. Tente novamente.';
  }

  return 'Erro de conexão. Verifique sua internet.';
};

// SPEC-ERR-AUTH-001 a SPEC-ERR-AUTH-004: Mensagens de erro de autenticação
export const getAuthErrorMessage = (error: AuthError | any): string => {
  if (isAuthError(error)) {
    switch (error.code) {
      case 'TOKEN_EXPIRED':
        return 'Sessão expirada. Faça login novamente.';
      case 'INVALID_CREDENTIALS':
        return 'Usuário ou senha incorretos.';
      case 'USER_BLOCKED':
        return 'Conta temporariamente bloqueada. Contate o suporte.';
      case 'REFRESH_TOKEN_INVALID':
        return 'Sessão inválida. Faça login novamente.';
      default:
        return error.message || 'Erro de autenticação.';
    }
  }

  if (error?.statusCode === 401) {
    return 'Sessão expirada. Faça login novamente.';
  }

  if (error?.statusCode === 403) {
    return 'Você não tem permissão para esta ação.';
  }

  return 'Erro de autenticação.';
};

// Interface for handleError options
export interface HandleErrorOptions {
  category?: string;
  context?: Record<string, any>;
  showToast?: boolean;
  toastMessage?: string;
  toastDescription?: string;
  logLevel?: 'ERROR' | 'WARN' | 'INFO';
  retryAction?: () => void;
}

// SPEC-ERR-UTIL-001: Error handler utility
export function handleError(
  error: Error | unknown,
  options: HandleErrorOptions = {}
): void {
  const {
    category = 'general',
    context = {},
    showToast = true,
    toastMessage,
    toastDescription,
    logLevel = 'ERROR',
    retryAction
  } = options;

  // Get appropriate logger
  const loggerInstance = Logger.getInstance(category);

  // Determine error message
  let message = 'Ocorreu um erro inesperado.';
  let description: string | undefined;

  if (error instanceof Error) {
    // Handle specific error types
    if (isAuthError(error)) {
      message = getAuthErrorMessage(error);
      context.statusCode = error.statusCode;
      context.errorCode = error.code;
    } else if (isJqelError(error)) {
      message = getJqelErrorMessage(error);
      context.schema = error.schema;
      context.entity = error.entity;
      context.action = error.action;
      context.errorCode = error.code;
    } else if (isValidationError(error)) {
      message = error.message || 'Dados inválidos.';
      context.fields = error.fields;
      context.errorCode = error.code;
      // Build field errors description
      if (error.fields && Object.keys(error.fields).length > 0) {
        const fieldErrors = Object.entries(error.fields)
          .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
          .join('; ');
        description = fieldErrors;
      }
    } else if (isNetworkError(error)) {
      message = getNetworkErrorMessage(error);
      context.statusCode = error.statusCode;
      context.url = error.url;
      context.method = error.method;
    } else if (isModuleError(error)) {
      message = error.message || 'Erro ao carregar módulo.';
      context.moduleId = error.moduleId;
      context.instanceId = error.instanceId;
      context.errorCode = error.code;
    } else {
      // Generic error
      message = error.message || message;
    }

    // Log the error
    if (logLevel === 'ERROR') {
      loggerInstance.error(message, error, context);
    } else if (logLevel === 'WARN') {
      loggerInstance.warn(message, context);
    } else {
      loggerInstance.info(message, context);
    }
  } else {
    // Non-Error object
    loggerInstance.error('Unknown error type', undefined, { error, ...context });
  }

  // Show toast notification if requested
  if (showToast) {
    const finalMessage = toastMessage || message;
    const finalDescription = toastDescription || description;

    // Determine toast type based on error
    if (isValidationError(error)) {
      toast.warning(finalMessage, {
        description: finalDescription,
        action: retryAction ? {
          label: 'Tentar novamente',
          onClick: retryAction
        } : undefined
      });
    } else if (isAuthError(error) && error?.statusCode === 401) {
      toast.error(finalMessage, {
        description: 'Você será redirecionado para o login.',
      });
    } else if (isNetworkError(error) && isRetryableError(error)) {
      toast.error(finalMessage, {
        description: finalDescription || 'A operação será tentada novamente.',
        action: retryAction ? {
          label: 'Tentar agora',
          onClick: retryAction
        } : undefined
      });
    } else {
      toast.error(finalMessage, {
        description: finalDescription,
        action: retryAction ? {
          label: 'Tentar novamente',
          onClick: retryAction
        } : undefined
      });
    }
  }
}

// SPEC-ERR-UTIL-003: React hook for error handling
import { useCallback } from 'react';

export interface UseErrorHandlerOptions {
  category?: string;
  showToast?: boolean;
  defaultRetryAction?: () => void;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const {
    category = 'component',
    showToast = true,
    defaultRetryAction
  } = options;

  const handleError = useCallback(
    (error: Error | unknown, customOptions?: Partial<HandleErrorOptions>) => {
      const mergedOptions: HandleErrorOptions = {
        category,
        showToast,
        retryAction: defaultRetryAction,
        ...customOptions
      };

      handleError(error, mergedOptions);
    },
    [category, showToast, defaultRetryAction]
  );

  const showError = useCallback(
    (message: string, description?: string) => {
      toast.error(message, { description });
    },
    []
  );

  const showWarning = useCallback(
    (message: string, description?: string) => {
      toast.warning(message, { description });
    },
    []
  );

  const showSuccess = useCallback(
    (message: string, description?: string) => {
      toast.success(message, { description });
    },
    []
  );

  const showInfo = useCallback(
    (message: string, description?: string) => {
      toast.info(message, { description });
    },
    []
  );

  return {
    handleError,
    showError,
    showWarning,
    showSuccess,
    showInfo
  };
}

/**
 * Example usage:
 *
 * // In a component
 * const { handleError, showSuccess } = useErrorHandler({ category: 'user-form' });
 *
 * try {
 *   await saveUser(data);
 *   showSuccess('Usuário salvo com sucesso!');
 * } catch (error) {
 *   handleError(error, {
 *     toastMessage: 'Erro ao salvar usuário',
 *     retryAction: () => saveUser(data)
 *   });
 * }
 *
 * // Direct error class usage
 * throw new ValidationError('Invalid form data', {
 *   email: ['Email is required', 'Invalid email format'],
 *   password: ['Password must be at least 8 characters']
 * });
 *
 * throw new JqelError('Query failed', 'platform', 'user', 'select', 'PERMISSION_DENIED');
 */