import React from 'react';
import { UserCircle } from 'lucide-react';
import AuthForm from '@/components/auth/AuthForm';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Login: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Redirect to dashboard if already authenticated
  if (isAuthenticated && !isLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 p-4">
      <div className="w-full max-w-[480px] space-y-8">
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary/50 to-primary opacity-75 blur"></div>
            <div className="relative rounded-full bg-card p-3">
              <UserCircle className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            DentaTrack
          </h1>
          <p className="text-muted-foreground">
            Dental clinic management platform
          </p>
        </div>
        
        <div className="w-full overflow-hidden rounded-xl border bg-card/50 p-8 shadow-xl backdrop-blur-sm">
          <AuthForm />
        </div>
        
        <p className="text-center text-sm text-muted-foreground">
          By using this service, you agree to our{' '}
          <a href="#" className="font-medium underline underline-offset-4 hover:text-primary">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="font-medium underline underline-offset-4 hover:text-primary">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default Login;