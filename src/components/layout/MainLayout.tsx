/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useClinic } from '@/contexts/ClinicContext';
import Header from './Header';
import Sidebar from './Sidebar';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const MainLayout: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, user  } = useAuth();
  const { clinics, activeClinic, hasFetchedClinics, isLoading: clinicLoading } = useClinic();

  const navigate = useNavigate();

  useEffect(() => {
    if (
      !clinicLoading &&
      !authLoading &&
      hasFetchedClinics &&
      clinics.length === 0 &&
      !activeClinic &&
      user?.role !== 'ASSISTANT' // 👈 doar dacă nu e assistant
    ) {
      navigate('/create-clinic', { replace: true });
    }
  }, [
    clinicLoading,
    authLoading,
    hasFetchedClinics,
    clinics,
    activeClinic,
    user?.role, // 👈 adăugat în dependencies
    navigate
  ]);
  
  

  
  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Show loading while fetching clinics
  if (clinicLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading clinics...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar variant="desktop"/>
      
      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header />
        
        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;