import { Home, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * EmptyState Component
 *
 * Exibe estado vazio quando homepage não tem seções habilitadas.
 * Inclui link para Setup module para configurar seções.
 *
 * Specs:
 * - SPEC-M-HP-F-009: Empty state quando sem sections habilitadas
 * - SPEC-M-HP-F-010: Link para Setup module para configuração
 * - SPEC-M-HP-INT-005: Integração com Setup module via link
 *
 * @returns {JSX.Element} Estado vazio da homepage
 *
 * @example
 * ```tsx
 * const { config } = useHomepageConfig(instanceId);
 * if (!config || config.sections.length === 0) return <EmptyState />;
 * ```
 */
export function EmptyState() {
  return (
    <main
      className="homepage-empty min-h-screen flex items-center justify-center px-4 py-16"
      role="status"
      aria-label="Página inicial não configurada"
    >
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div
            className="h-24 w-24 rounded-full bg-muted flex items-center justify-center"
            aria-hidden="true"
          >
            <Home className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>

        <Alert>
          <Settings className="h-5 w-5" aria-hidden="true" />
          <AlertTitle className="text-lg font-semibold">
            Nenhuma Seção Configurada
          </AlertTitle>
          <AlertDescription className="mt-2 space-y-4">
            <p className="text-sm">
              A página inicial não possui seções habilitadas para exibir. Configure o módulo Homepage
              no portal de Setup para adicionar seções Hero, Features, Portals ou CTA.
            </p>

            <Button
              asChild
              variant="default"
              size="sm"
              className="mt-4"
            >
              <a href="/setup" aria-label="Ir para configuração do Setup">
                <Settings className="h-4 w-4 mr-2" aria-hidden="true" />
                Ir para Setup
              </a>
            </Button>
          </AlertDescription>
        </Alert>

        <p className="text-muted-foreground text-xs">
          Consulte a documentação da plataforma para mais informações sobre configuração da homepage.
        </p>
      </div>
    </main>
  );
}
