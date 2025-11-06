/**
 * Not Found Page
 *
 * 404 error page for routes that don't match any portal or route.
 */

import { useNavigate } from 'react-router-dom';

export function NotFound() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="mt-4 text-xl text-gray-600">Page Not Found</p>
        <p className="mt-2 text-sm text-gray-500">
          The page you are looking for does not exist or has been moved.
        </p>
        <button
          onClick={handleGoHome}
          className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}
