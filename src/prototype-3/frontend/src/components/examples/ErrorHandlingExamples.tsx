/**
 * Error Handling Examples
 *
 * Demonstrates various error handling patterns and components.
 * Useful for testing and documentation.
 */

import { useState } from 'react';
import { JQELError } from '@/types/jqel';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { JQELErrorBoundary } from '@/components/error/JQELErrorBoundary';
import { ErrorFallback } from '@/components/error/ErrorFallback';
import { JQELErrorFallback } from '@/components/error/JQELErrorFallback';
import { InlineErrorFallback } from '@/components/error/InlineErrorFallback';
import { MinimalErrorFallback } from '@/components/error/MinimalErrorFallback';
import { NotFound } from '@/components/error/NotFound';
import { Forbidden } from '@/components/error/Forbidden';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Button } from '@/components/ui/button';

/**
 * Component that throws an error on demand
 */
function ErrorThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('This is a test error from ErrorThrowingComponent');
  }
  return <div className="p-4 bg-green-50 border border-green-200 rounded">Component OK</div>;
}

/**
 * Component that throws a JQEL error on demand
 */
function JQELErrorThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    const jqelError = new JQELError({
      code: 403,
      message: 'You do not have permission to access this resource',
      field: 'user_id',
    });
    throw jqelError;
  }
  return <div className="p-4 bg-green-50 border border-green-200 rounded">JQEL Component OK</div>;
}

/**
 * Example 1: Generic Error Boundary
 */
function Example1() {
  const [throwError, setThrowError] = useState(false);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Example 1: Generic Error Boundary</h3>
      <p className="text-sm text-gray-600">
        Click the button to trigger an error. The error boundary will catch it and display a
        fallback.
      </p>

      <Button onClick={() => setThrowError(!throwError)} variant="outline">
        {throwError ? 'Reset' : 'Throw Error'}
      </Button>

      <ErrorBoundary
        level="component"
        category="example"
        fallback={(error, reset) => (
          <ErrorFallback error={error} onReset={reset} level="component" />
        )}
        onReset={() => setThrowError(false)}
      >
        <ErrorThrowingComponent shouldThrow={throwError} />
      </ErrorBoundary>
    </div>
  );
}

/**
 * Example 2: JQEL Error Boundary
 */
function Example2() {
  const [throwError, setThrowError] = useState(false);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Example 2: JQEL Error Boundary</h3>
      <p className="text-sm text-gray-600">
        Specialized error boundary for JQEL errors with context-aware messaging.
      </p>

      <Button onClick={() => setThrowError(!throwError)} variant="outline">
        {throwError ? 'Reset' : 'Throw JQEL Error (403)'}
      </Button>

      <JQELErrorBoundary
        schema="platform"
        entity="user"
        onReset={() => setThrowError(false)}
      >
        <JQELErrorThrowingComponent shouldThrow={throwError} />
      </JQELErrorBoundary>
    </div>
  );
}

/**
 * Example 3: JQEL Error Fallback with Different Codes
 */
function Example3() {
  const [errorCode, setErrorCode] = useState<number | null>(null);

  const createJQELError = (code: number): JQELError => {
    const messages: Record<number, string> = {
      400: 'Invalid request parameters',
      401: 'Authentication required',
      403: 'Access denied to this resource',
      404: 'Resource not found',
      422: 'Validation failed for field',
      429: 'Too many requests',
      500: 'Internal server error',
      503: 'Service temporarily unavailable',
    };

    return new JQELError({
      code,
      message: messages[code] || 'Unknown error',
      field: code === 422 ? 'email' : undefined,
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Example 3: JQEL Error Codes</h3>
      <p className="text-sm text-gray-600">
        Different JQEL errors display different messages and behaviors.
      </p>

      <div className="flex flex-wrap gap-2">
        {[400, 401, 403, 404, 422, 429, 500, 503].map((code) => (
          <Button key={code} onClick={() => setErrorCode(code)} variant="outline">
            {code}
          </Button>
        ))}
        <Button onClick={() => setErrorCode(null)} variant="default">
          Clear
        </Button>
      </div>

      {errorCode && (
        <JQELErrorFallback
          error={createJQELError(errorCode)}
          onRetry={() => setErrorCode(null)}
          schema="platform"
          entity="user"
        />
      )}
    </div>
  );
}

/**
 * Example 4: Inline Error Display
 */
function Example4() {
  const [showError, setShowError] = useState(false);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Example 4: Inline Error Display</h3>
      <p className="text-sm text-gray-600">
        Compact error display for inline contexts (forms, cards, etc).
      </p>

      <Button onClick={() => setShowError(!showError)} variant="outline">
        {showError ? 'Hide' : 'Show'} Inline Error
      </Button>

      {showError && (
        <div className="space-y-3">
          <InlineErrorFallback
            error={new Error('Small error message')}
            size="sm"
            onRetry={() => setShowError(false)}
          />
          <InlineErrorFallback
            error={new Error('Medium error message with more details')}
            size="md"
            onRetry={() => setShowError(false)}
          />
          <InlineErrorFallback
            error={new Error('Large error message with even more contextual information')}
            size="lg"
            onRetry={() => setShowError(false)}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Example 5: Minimal Error Display
 */
function Example5() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Example 5: Minimal Error Display</h3>
      <p className="text-sm text-gray-600">
        Ultra-compact error indicators for tight spaces (table cells, badges, etc).
      </p>

      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <span className="text-sm w-24">Icon only:</span>
          <MinimalErrorFallback error={new Error('Icon only error')} mode="icon" />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm w-24">Text only:</span>
          <MinimalErrorFallback error={new Error('Text only error')} mode="text" />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm w-24">Both:</span>
          <MinimalErrorFallback
            error={new Error('Both icon and text')}
            mode="both"
            message="Failed"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Example 6: useErrorHandler Hook
 */
function Example6() {
  const { handleError, showError } = useErrorHandler('example');

  const simulateError = () => {
    try {
      throw new Error('Simulated error for testing');
    } catch (error) {
      handleError(error, {
        category: 'test',
        showToast: true,
        context: { example: 6 },
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Example 6: useErrorHandler Hook</h3>
      <p className="text-sm text-gray-600">
        Programmatic error handling with logging and toast notifications.
      </p>

      <div className="flex gap-2">
        <Button onClick={simulateError} variant="outline">
          Handle Error
        </Button>
        <Button onClick={() => showError('This is a user-facing error message')} variant="outline">
          Show Error Message
        </Button>
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
        Check the browser console to see logged errors.
      </div>
    </div>
  );
}

/**
 * Example 7: 404 Not Found Page
 */
function Example7() {
  const [show, setShow] = useState(false);

  if (!show) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Example 7: 404 Not Found</h3>
        <Button onClick={() => setShow(true)} variant="outline">
          Show 404 Page
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Button onClick={() => setShow(false)} variant="outline" className="mb-4">
        Hide 404 Page
      </Button>
      <NotFound resourceType="page" />
    </div>
  );
}

/**
 * Example 8: 403 Forbidden Page
 */
function Example8() {
  const [show, setShow] = useState(false);

  if (!show) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Example 8: 403 Forbidden</h3>
        <Button onClick={() => setShow(true)} variant="outline">
          Show 403 Page
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Button onClick={() => setShow(false)} variant="outline" className="mb-4">
        Hide 403 Page
      </Button>
      <Forbidden resource="admin panel" />
    </div>
  );
}

/**
 * Main Examples Component
 */
export function ErrorHandlingExamples() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Error Handling Examples</h1>
        <p className="text-gray-600">
          Interactive examples demonstrating the error handling system.
        </p>
      </div>

      <div className="grid gap-8">
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <Example1 />
        </div>
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <Example2 />
        </div>
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <Example3 />
        </div>
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <Example4 />
        </div>
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <Example5 />
        </div>
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <Example6 />
        </div>
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <Example7 />
        </div>
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <Example8 />
        </div>
      </div>
    </div>
  );
}
