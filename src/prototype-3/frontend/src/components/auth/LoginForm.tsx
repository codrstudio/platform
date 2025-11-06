import { useState, type FormEvent } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { AuthClientError } from '@/services/auth/authClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * SPEC-AU-MA-001: Modules de Auth fornecem UI de login/signup
 * SPEC-AU-LI-*: Login with credentials
 *
 * LoginForm component for story 1.2.2 "Sessão persistente"
 */

export function LoginForm() {
  const { login, isLoading: authLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // SPEC-AU-LI-001: username (string, obrigatório)
      // SPEC-AU-LI-002: password (string, obrigatório)
      await login({ username, password });
    } catch (err) {
      if (err instanceof AuthClientError) {
        // SPEC-AU-LI-019: Credenciais inválidas DEVEM retornar HTTP 401
        setError(err.message || 'Invalid credentials');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = authLoading || isSubmitting;

  return (
    <div className="bg-card rounded-lg border p-6 space-y-4 max-w-md w-full">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Login</h2>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access the platform
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            required
            disabled={isLoading}
            placeholder="Enter your username"
            autoComplete="username"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !username || !password}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </form>

      <div className="text-xs text-muted-foreground">
        <p>This is a development version. Session will persist across page reloads.</p>
      </div>
    </div>
  );
}
