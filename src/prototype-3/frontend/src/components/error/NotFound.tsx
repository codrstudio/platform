/**
 * 404 Not Found Page
 *
 * Displayed when a route or resource is not found.
 *
 * Implements:
 * - SPEC-error-handling.md (SPEC-ERR-ROUTE-001)
 */

import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchX, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface NotFoundProps {
  /**
   * Resource type that was not found (e.g., "page", "portal", "module")
   */
  resourceType?: string;
  /**
   * Custom message
   */
  message?: string;
}

/**
 * 404 Not Found Page
 *
 * SPEC-ERR-ROUTE-001: Display 404 page with link to home
 */
export function NotFound({ resourceType = 'page', message }: NotFoundProps): ReactNode {
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
          <div className="p-4 bg-gray-200 rounded-full">
            <SearchX className="h-16 w-16 text-gray-600" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          {resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} Not Found
        </h2>

        <p className="text-gray-600 mb-6">
          {message ||
            `The ${resourceType} you're looking for doesn't exist or has been moved.`}
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
