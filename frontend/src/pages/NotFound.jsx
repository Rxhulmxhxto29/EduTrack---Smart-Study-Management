import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-600">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">Page Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          The page you're looking for doesn't exist
        </p>
        <Button className="mt-6" onClick={() => navigate('/')}>
          Go Home
        </Button>
      </div>
    </div>
  );
}

export default NotFound;
