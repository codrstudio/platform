// Unauthorized Page (403)
// Based on SPEC-authentication.md

import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

/**
 * Unauthorized Page - 403 Error
 *
 * Shown when user tries to access a resource without proper authorization.
 * This can happen when:
 * - User doesn't have required roles (first layer authorization)
 * - User doesn't have required permissions (second layer authorization)
 */
export function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <ShieldAlert className="h-24 w-24 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-foreground">403</h1>
          <h2 className="text-2xl font-semibold">Acesso negado</h2>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar este recurso.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
          >
            Voltar
          </Button>
          <Button onClick={() => navigate('/')}>
            Ir para Início
          </Button>
        </div>
      </div>
    </div>
  );
}
