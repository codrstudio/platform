/**
 * 403 Forbidden Page
 *
 * Displayed when user lacks permission to access a resource.
 *
 * Implements:
 * - SPEC-error-handling.md (SPEC-ERR-ROUTE-003, SPEC-ERR-NET-004)
 */

import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ForbiddenProps {
  /**
   * Resource that access was denied to
   */
  resource?: string;
  /**
   * Custom message
   */
  message?: string;
}

/**
 * 403 Forbidden Page
 *
 * SPEC-ERR-ROUTE-003: Display 403 page with link to home
 * SPEC-ERR-NET-004: 403 Forbidden error handling
 */
export function Forbidden({ resource, message }: ForbiddenProps): ReactNode {
  const navigate = useNavigate();

  const handleGoHome = (): void => {
    navigate('/');
  };

  const handleGoBack = (): void => {
    navigate(-1);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-red-100 rounded-full">
            <ShieldAlert className="h-16 w-16 text-red-600" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">403</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Access Denied</h2>

        <p className="text-gray-600 mb-6">
          {message ||
            (resource
              ? `You do not have permission to access ${resource}.`
              : 'You do not have permission to access this page.')}
        </p>

        <p className="text-sm text-gray-500 mb-6">
          If you believe this is an error, please contact your administrator.
        </p>

        <div className="flex gap-3 justify-center">
          <Button onClick={handleGoBack} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>

          <Button onClick={handleGoHome} variant="default" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
