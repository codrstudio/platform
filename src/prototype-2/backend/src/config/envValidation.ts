/**
 * Environment validation helper utilities
 * Used by env.ts for startup validation
 */

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate URL format
 */
export function validateUrl(value: string, fieldName: string): ValidationError | null {
  try {
    new URL(value);
    return null;
  } catch {
    return {
      field: fieldName,
      message: `${fieldName} must be a valid URL`,
    };
  }
}

/**
 * Validate port number
 */
export function validatePort(value: number, fieldName: string): ValidationError | null {
  if (isNaN(value) || value < 1 || value > 65535) {
    return {
      field: fieldName,
      message: `${fieldName} must be a number between 1 and 65535`,
    };
  }
  return null;
}

/**
 * Validate secret minimum length
 */
export function validateSecret(
  value: string,
  fieldName: string,
  minLength: number = 32
): ValidationError | null {
  if (value.length < minLength) {
    return {
      field: fieldName,
      message: `${fieldName} must be at least ${minLength} characters`,
    };
  }
  return null;
}

/**
 * Validate enum value
 */
export function validateEnum(
  value: string,
  fieldName: string,
  allowedValues: string[]
): ValidationError | null {
  if (!allowedValues.includes(value)) {
    return {
      field: fieldName,
      message: `${fieldName} must be one of: ${allowedValues.join(', ')}`,
    };
  }
  return null;
}

/**
 * Mask sensitive value for logging
 */
export function maskSecret(value: string): string {
  if (!value || value.length < 8) {
    return '***';
  }
  return value.substring(0, 4) + '***' + value.substring(value.length - 4);
}

/**
 * Mask password in connection string
 */
export function maskConnectionString(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.password) {
      parsed.password = '***';
    }
    return parsed.toString();
  } catch {
    return '***';
  }
}

/**
 * Validate HTTPS requirement based on environment
 */
export function validateHttps(
  url: string,
  fieldName: string,
  nodeEnv: string
): ValidationError | null {
  try {
    const parsed = new URL(url);

    // Production and staging MUST use HTTPS
    if (['production', 'staging'].includes(nodeEnv)) {
      if (parsed.protocol !== 'https:') {
        return {
          field: fieldName,
          message: `${fieldName} must use HTTPS in ${nodeEnv} environment`,
        };
      }
    }

    return null;
  } catch {
    return {
      field: fieldName,
      message: `${fieldName} must be a valid URL`,
    };
  }
}

/**
 * Validate that two secrets match
 */
export function validateSecretsMatch(
  secret1: string,
  secret2: string,
  field1Name: string,
  field2Name: string
): ValidationError | null {
  if (secret1 !== secret2) {
    return {
      field: field2Name,
      message: `${field2Name} must match ${field1Name}`,
    };
  }
  return null;
}

/**
 * Validate secret strength (production only)
 */
export function validateSecretStrength(
  value: string,
  fieldName: string,
  nodeEnv: string
): ValidationError | null {
  // In production, enforce stronger validation
  if (nodeEnv === 'production') {
    // Check for alphanumeric mix
    const hasLetters = /[a-zA-Z]/.test(value);
    const hasNumbers = /[0-9]/.test(value);

    if (!hasLetters || !hasNumbers) {
      return {
        field: fieldName,
        message: `${fieldName} must contain both letters and numbers in production`,
      };
    }

    // Check it's not a placeholder
    const placeholders = ['your_secret_here', 'changeme', 'secret', 'password'];
    if (placeholders.some(p => value.toLowerCase().includes(p))) {
      return {
        field: fieldName,
        message: `${fieldName} appears to be a placeholder value - use a real secret in production`,
      };
    }
  }

  return null;
}

/**
 * Validate Redis connection string or components
 */
export function validateRedisConfig(
  host: string,
  port: number,
  password: string | undefined,
  nodeEnv: string
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate host
  if (!host || host.trim() === '') {
    errors.push({
      field: 'REDIS_HOST',
      message: 'REDIS_HOST is required',
    });
  }

  // Validate port
  const portError = validatePort(port, 'REDIS_PORT');
  if (portError) {
    errors.push(portError);
  }

  // In production, recommend password
  if (nodeEnv === 'production' && (!password || password.trim() === '')) {
    errors.push({
      field: 'REDIS_PASSWORD',
      message: 'REDIS_PASSWORD is recommended in production for security',
    });
  }

  return errors;
}
