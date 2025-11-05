interface RouteLoadingProps {
  moduleName?: string;
  message?: string;
}

export default function RouteLoading({ moduleName, message }: RouteLoadingProps) {
  return (
    <div className="route-loading" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px',
      padding: '2rem'
    }}>
      <div className="loading-spinner" style={{
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <p style={{ marginTop: '1rem', color: '#666' }}>
        {message || (moduleName ? `Loading ${moduleName}...` : 'Loading...')}
      </p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
