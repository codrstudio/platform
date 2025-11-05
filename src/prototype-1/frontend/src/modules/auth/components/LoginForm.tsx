/**
 * Login Form Component
 * SPEC-AUTH-F-001 to SPEC-AUTH-F-006
 * Provides authentication UI with realm/schema support
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { AlertCircle, Loader2, LogIn } from 'lucide-react';

const loginSchema = z.object({
  realm: z.string().optional(),
  schema: z.string().optional(),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export interface LoginFormProps {
  /** Default realm value */
  defaultRealm?: string;
  /** Default schema value */
  defaultSchema?: string;
  /** Allow user to select realm */
  allowRealmSelection?: boolean;
  /** Allow user to select schema */
  allowSchemaSelection?: boolean;
  /** Callback on successful login */
  onSuccess?: () => void;
  /** Callback on login error */
  onError?: (error: Error) => void;
}

/**
 * LoginForm Component
 * SPEC-AUTH-F-002: Accepts realm, schema, username, password
 */
export function LoginForm({
  defaultRealm,
  defaultSchema,
  allowRealmSelection = false,
  allowSchemaSelection = false,
  onSuccess,
  onError,
}: LoginFormProps) {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      realm: defaultRealm,
      schema: defaultSchema,
    },
  });

  /**
   * Handle form submission
   * SPEC-AUTH-F-003: Calls /api/1/auth/login via POST
   */
  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await login({
        realm: data.realm,
        schema: data.schema,
        username: data.username,
        password: data.password,
      });

      onSuccess?.();
    } catch (err: any) {
      // SPEC-AUTH-E-001: Display clear error messages
      // SPEC-AUTH-E-002: Don't expose security details
      const message = err.message || 'Login failed. Please check your credentials.';
      setError(message);
      onError?.(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Realm Selection - SPEC-AUTH-O-007 */}
          {allowRealmSelection && (
            <div className="space-y-2">
              <Label htmlFor="realm">Realm</Label>
              <Input
                id="realm"
                type="text"
                placeholder="Enter realm (optional)"
                {...register('realm')}
                disabled={isSubmitting}
              />
              {errors.realm && (
                <p className="text-sm text-destructive">{errors.realm.message}</p>
              )}
            </div>
          )}

          {/* Schema Selection - SPEC-AUTH-O-007 */}
          {allowSchemaSelection && (
            <div className="space-y-2">
              <Label htmlFor="schema">Schema</Label>
              <Input
                id="schema"
                type="text"
                placeholder="Enter schema (optional)"
                {...register('schema')}
                disabled={isSubmitting}
              />
              {errors.schema && (
                <p className="text-sm text-destructive">{errors.schema.message}</p>
              )}
            </div>
          )}

          {/* Username - SPEC-AUTH-F-002 */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              autoComplete="username"
              {...register('username')}
              disabled={isSubmitting}
              autoFocus
            />
            {errors.username && (
              <p className="text-sm text-destructive">{errors.username.message}</p>
            )}
          </div>

          {/* Password - SPEC-AUTH-F-002 */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              {...register('password')}
              disabled={isSubmitting}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
