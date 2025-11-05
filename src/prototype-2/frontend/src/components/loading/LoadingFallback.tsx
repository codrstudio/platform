interface LoadingFallbackProps {
  message?: string;
  minimal?: boolean;
}

export default function LoadingFallback({ message = 'Loading...', minimal = false }: LoadingFallbackProps) {
  if (minimal) {
    return <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>{message}</div>;
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem'
    }}>
      <div style={{
        display: 'inline-block',
        width: '20px',
        height: '20px',
        border: '3px solid #f3f3f3',
        borderTop: '3px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginRight: '0.75rem'
      }} />
      <span style={{ color: '#666' }}>{message}</span>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
