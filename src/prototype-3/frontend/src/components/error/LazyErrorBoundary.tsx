/**
 * Lazy Loading Error Boundary
 *
 * Handles errors during lazy loading of components (e.g., chunk load failures).
 * Implements SPEC-R-TE-004 to SPEC-R-TE-009 (Error handling for route loading).
 */

import { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface LazyErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface LazyErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary for Lazy Loading
 *
 * SPEC-R-TE-004: Display appropriate message when module fails to load
 * SPEC-R-TE-005: Include option to reload
 * SPEC-R-TE-006: Log error for debugging
 * SPEC-R-TE-007: Use Error Boundary to capture errors
 * SPEC-R-TE-008: Display fallback UI
 * SPEC-R-TE-009: Allow recovery without full reload
 */
export class LazyErrorBoundary extends Component<
  LazyErrorBoundaryProps,
  LazyErrorBoundaryState
> {
  constructor(props: LazyErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): LazyErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // SPEC-R-TE-006: Log error for debugging
    console.error('Lazy loading error:', error, errorInfo);
  }

  handleReset = (): void => {
    // SPEC-R-TE-009: Allow recovery without full reload
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  handleReload = (): void => {
    // Full page reload as fallback
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI - SPEC-R-TE-008
      const isChunkLoadError =
        this.state.error?.message?.includes('Failed to fetch') ||
        this.state.error?.message?.includes('Loading chunk') ||
        this.state.error?.name === 'ChunkLoadError';

      return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
          <div className="w-full max-w-md">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4 mb-2" />
              <h3 className="font-semibold text-lg mb-2">Failed to Load Component</h3>
              <AlertDescription className="mt-2">
                {isChunkLoadError ? (
                  <>
                    <p className="mb-2">
                      A network error occurred while loading this page. This might be
                      due to:
                    </p>
                    <ul className="list-disc list-inside mb-3 text-sm space-y-1">
                      <li>Unstable internet connection</li>
                      <li>Application was recently updated</li>
                      <li>Browser cache issues</li>
                    </ul>
                  </>
                ) : (
                  <p className="mb-2">
                    {this.state.error?.message || 'An unexpected error occurred'}
                  </p>
                )}
              </AlertDescription>

              {/* SPEC-R-TE-005: Include option to reload */}
              <div className="mt-4 flex gap-2">
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleReload}
                  variant="default"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reload Page
                </Button>
              </div>
            </Alert>

            {/* Show error details in development */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mt-4 p-4 bg-red-50 rounded-md">
                <p className="text-xs font-mono text-red-900 whitespace-pre-wrap">
                  {this.state.error.stack}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
