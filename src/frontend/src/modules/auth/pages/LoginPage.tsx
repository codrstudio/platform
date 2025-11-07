/**
 * Login Page Component - Auth Module
 *
 * SPEC Compliance:
 * - SPEC-AUTH-F-001: Interface de login
 * - SPEC-AUTH-F-002: Aceita realm, schema, username, password
 * - SPEC-AUTH-F-003: Chama /api/1/auth/login via POST
 * - SPEC-AUTH-I-001: Fluxo de login completo
 * - spec/ui/auth-module-interfaces.md: Layout e componentes
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useInstanceConfig } from '@/hooks/useInstance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

// Default config for when module is used standalone
const DEFAULT_CONFIG = {
  loginRoute: '/login',
  logoutRedirect: '/login',
  realm: 'default',
  schema: 'app',
  allowRealmSelection: false,
  allowSchemaSelection: false,
  realms: ['default'],
  schemas: ['app'],
  enableRememberMe: true,
  layout: 'centered' as 'centered' | 'split' | 'minimal' | 'card',
  logo: '',
  brandColor: '#3B82F6',
  backgroundImage: '',
  texts: {
    loginTitle: 'Bem-vindo de volta',
    loginSubtitle: 'Entre com suas credenciais'
  }
};

// Validation schema (SPEC-AUTH-F-002)
const createLoginSchema = (allowRealmSelection: boolean, allowSchemaSelection: boolean) => {
  const baseSchema = {
    username: z.string().min(1, 'Campo obrigatório'),
    password: z.string().min(1, 'Campo obrigatório'),
    rememberMe: z.boolean().optional(),
  };

  if (allowRealmSelection) {
    Object.assign(baseSchema, {
      realm: z.string().min(1, 'Selecione um realm')
    });
  }

  if (allowSchemaSelection) {
    Object.assign(baseSchema, {
      schema: z.string().min(1, 'Selecione um schema')
    });
  }

  return z.object(baseSchema);
};

interface LoginPageProps {
  instanceId?: string;
  portalId?: string;
  moduleId?: string;
}

export function LoginPage({ instanceId, portalId, moduleId = 'auth' }: LoginPageProps) {
  // Get instance configuration (or use defaults)
  const instanceConfig = instanceId
    ? useInstanceConfig<typeof DEFAULT_CONFIG>(portalId || 'main', moduleId, instanceId)
    : null;

  const config = instanceConfig?.config || DEFAULT_CONFIG;

  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginSchema = createLoginSchema(
    config.allowRealmSelection,
    config.allowSchemaSelection
  );

  type LoginFormValues = z.infer<typeof loginSchema>;

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
      ...(config.allowRealmSelection && { realm: config.realm }),
      ...(config.allowSchemaSelection && { schema: config.schema }),
    } as any,
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const returnUrl = sessionStorage.getItem('returnUrl') || '/';
      sessionStorage.removeItem('returnUrl');
      navigate(returnUrl, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setError(null);
      setIsSubmitting(true);

      // SPEC-AUTH-F-003: Call /api/1/auth/login
      await login({
        username: data.username,
        password: data.password,
        rememberMe: data.rememberMe,
        realm: (data as any).realm || config.realm,
        schema: (data as any).schema || config.schema,
      });

      // Navigation is handled by the useEffect above
    } catch (err) {
      const error = err as Error;

      // SPEC-AUTH-E-001: User-friendly error messages
      let errorMessage = 'Erro ao fazer login. Tente novamente.';

      if (error.message.includes('invalid_credentials') || error.message.includes('401')) {
        errorMessage = 'Credenciais inválidas. Verifique seu email e senha.';
      } else if (error.message.includes('blocked') || error.message.includes('429')) {
        errorMessage = 'Conta temporariamente bloqueada. Muitas tentativas de login.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Erro de conexão. Verifique sua internet.';
      }

      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  // Show loading during initial auth check
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Layout variants (SPEC: config.layout)
  const layoutClasses: Record<string, string> = {
    centered: 'min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4',
    split: 'min-h-screen grid md:grid-cols-2',
    minimal: 'min-h-screen flex items-center justify-center px-4',
    card: 'min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 px-4'
  };

  const layoutClass = layoutClasses[config.layout] || layoutClasses.centered;

  return (
    <div className={layoutClass}>
      {/* Split layout: Marketing side */}
      {config.layout === 'split' && (
        <div
          className="hidden md:flex flex-col justify-center p-12 bg-primary text-primary-foreground"
          style={config.backgroundImage ? {
            backgroundImage: `url(${config.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : {}}
        >
          <h1 className="text-4xl font-bold mb-4">
            {config.texts?.loginTitle || 'Bem-vindo de volta'}
          </h1>
          <p className="text-xl opacity-90">
            {config.texts?.loginSubtitle || 'Entre com suas credenciais'}
          </p>
        </div>
      )}

      {/* Form Container */}
      <div className={`w-full ${config.layout === 'split' ? 'flex items-center justify-center p-8' : 'max-w-md'} space-y-8`}>
        {/* Logo and Header */}
        {config.layout !== 'split' && (
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              {config.logo ? (
                <img src={config.logo} alt="Logo" className="h-16" />
              ) : (
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: config.brandColor }}
                >
                  <span className="text-2xl font-bold text-white">P</span>
                </div>
              )}
            </div>
            <h1 className="text-2xl font-bold">
              {config.texts?.loginTitle || 'Bem-vindo de volta'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {config.texts?.loginSubtitle || 'Entre com suas credenciais'}
            </p>
          </div>
        )}

        {/* Login Form */}
        <div className={`bg-white dark:bg-gray-800 p-8 rounded-lg ${config.layout === 'card' ? 'shadow-xl' : 'shadow-sm'} border ${config.layout === 'split' ? 'w-full max-w-md' : ''}`}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Realm Selection (SPEC-AUTH-O-007) */}
            {config.allowRealmSelection && (
              <div className="space-y-2">
                <Label htmlFor="realm">Realm *</Label>
                <select
                  id="realm"
                  disabled={isSubmitting}
                  {...form.register('realm' as keyof LoginFormValues)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {config.realms?.map((realm: string) => (
                    <option key={realm} value={realm}>
                      {realm}
                    </option>
                  ))}
                </select>
                {(form.formState.errors as any).realm && (
                  <p className="text-sm text-destructive">
                    {(form.formState.errors as any).realm.message}
                  </p>
                )}
              </div>
            )}

            {/* Schema Selection (SPEC-AUTH-O-007) */}
            {config.allowSchemaSelection && (
              <div className="space-y-2">
                <Label htmlFor="schema">Schema *</Label>
                <select
                  id="schema"
                  disabled={isSubmitting}
                  {...form.register('schema' as keyof LoginFormValues)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {config.schemas?.map((schema: string) => (
                    <option key={schema} value={schema}>
                      {schema}
                    </option>
                  ))}
                </select>
                {(form.formState.errors as any).schema && (
                  <p className="text-sm text-destructive">
                    {(form.formState.errors as any).schema.message}
                  </p>
                )}
              </div>
            )}

            {/* Username/Email Field */}
            <div className="space-y-2">
              <Label htmlFor="username">Email / Usuário *</Label>
              <Input
                id="username"
                type="text"
                placeholder="usuario@email.com"
                autoComplete="username"
                disabled={isSubmitting}
                {...form.register('username')}
                aria-invalid={!!form.formState.errors.username}
                className={
                  form.formState.errors.username
                    ? 'border-destructive focus-visible:ring-destructive'
                    : ''
                }
              />
              {form.formState.errors.username && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.username.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Senha *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  {...form.register('password')}
                  aria-invalid={!!form.formState.errors.password}
                  className={
                    form.formState.errors.password
                      ? 'border-destructive focus-visible:ring-destructive pr-10'
                      : 'pr-10'
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me (SPEC-AUTH-F-005) */}
            {config.enableRememberMe && (
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  type="checkbox"
                  disabled={isSubmitting}
                  {...form.register('rememberMe')}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label
                  htmlFor="rememberMe"
                  className="ml-2 text-sm font-normal cursor-pointer"
                >
                  Lembrar de mim
                </Label>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
              style={{ backgroundColor: config.brandColor }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        {config.layout !== 'split' && (
          <p className="text-center text-sm text-muted-foreground">
            Plataforma Modular v1.0
          </p>
        )}
      </div>
    </div>
  );
}
