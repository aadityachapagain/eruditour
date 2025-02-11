import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Loader } from 'lucide-react';
import { ComponentType } from 'react';

export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>
) {
  return function WithAuthComponent(props: P) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        try {
          await axios.get('/api/verify-token', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setIsLoading(false);
        } catch (error) {
          localStorage.removeItem('token');
          router.push('/login');
        }
      };

      checkAuth();
    }, [router]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader className="w-8 h-8 animate-spin" />
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}