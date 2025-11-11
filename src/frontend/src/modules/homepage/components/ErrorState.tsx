import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

/**
 * ErrorState Component
 *
 * Exibe estado de erro quando falha ao carregar configuração da homepage.
 * Inclui botão de retry e mensagem descritiva do erro.
 *
 * Specs:
 * - SPEC-M-HP-F-007: Error states devem mostrar mensagem clara e action retry
 * - SPEC-M-HP-F-008: Usar Alert component do shadcn/ui variant destructive
 *
 * @param {ErrorStateProps} props - Props do componente
 * @param {Error | unknown} props.error - Erro capturado (opcional)
 * @param {() => void} props.onRetry - Callback para tentar novamente (opcional)
 *
 * @returns {JSX.Element} Estado de erro da homepage
 *
 * @example
 * ```tsx
 * const { error, refetch } = useHomepageConfig(instanceId);
 * if (error) return <ErrorState error={error} onRetry={refetch} />;
 * ```
 */

interface ErrorStateProps {
  error?: Error | unknown;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const errorMessage = error instanceof Error ? error.message : 'Failed to load homepage configuration';

  return (
    <main
      className="homepage-error min-h-screen flex items-center justify-center px-4 py-16"
      role="alert"
      aria-live="assertive"
    >
      <div className="max-w-md w-full">
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" aria-hidden="true" />
          <AlertTitle className="text-lg font-semibold">
            Erro ao Carregar Página Inicial
          </AlertTitle>
          <AlertDescription className="mt-2 space-y-4">
            <p className="text-sm">
              {errorMessage}
            </p>

            {onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="mt-4"
                aria-label="Tentar carregar novamente"
              >
                <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
                Tentar Novamente
              </Button>
            )}
          </AlertDescription>
        </Alert>

        <p className="text-muted-foreground text-sm text-center mt-6">
          Se o problema persistir, entre em contato com o suporte ou verifique a configuração no Setup.
        </p>
      </div>
    </main>
  );
}
