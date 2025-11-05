interface RouteErrorProps {
  error?: Error;
  moduleName?: string;
  onRetry?: () => void;
  onBack?: () => void;
}

export default function RouteError({
  error,
  moduleName,
  onRetry,
  onBack
}: RouteErrorProps) {
  return (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <div style={{
        fontSize: '48px',
        marginBottom: '1rem'
      }}>⚠️</div>

      <h2 style={{ marginBottom: '0.5rem' }}>
        Failed to Load {moduleName || 'Component'}
      </h2>

      <p style={{ color: '#666', marginBottom: '1rem' }}>
        {error?.message || 'An error occurred while loading this page.'}
      </p>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        )}

        {onBack && (
          <button
            onClick={onBack}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Go Back
          </button>
        )}
      </div>

      {import.meta.env.DEV && error && (
        <details style={{ marginTop: '2rem', textAlign: 'left' }}>
          <summary style={{ cursor: 'pointer', color: '#666' }}>
            Error Details (Development Only)
          </summary>
          <pre style={{
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '0.875rem'
          }}>
            {error.stack || error.message}
          </pre>
        </details>
      )}
    </div>
  );
}
