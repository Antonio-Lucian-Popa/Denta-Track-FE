import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { ClinicProvider } from '@/contexts/ClinicContext';
import MainLayout from '@/components/layout/MainLayout';
import Login from '@/pages/auth/Login';
import CreateClinic from '@/pages/clinics/CreateClinic';
import Dashboard from '@/pages/dashboard/Dashboard';
import Products from '@/pages/products/Products';
import Appointments from '@/pages/appointments/Appointments';
import InventoryLogs from '@/pages/logs/InventoryLogs';
import Users from '@/pages/users/Users';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="dentatrack-theme">
      <BrowserRouter basename={'/dentatrack-fe'}>
        <AuthProvider>
          <ClinicProvider>
            <Routes>
              {/* Auth routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Create clinic route */}
              <Route path="/create-clinic" element={<CreateClinic />} />
              
              {/* Protected routes */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Navigate to={`/dashboard/default`} replace />} />
                <Route path="dashboard/:clinicId" element={<Dashboard />} />
                <Route path="clinic/:clinicId/products" element={<Products />} />
                <Route path="clinic/:clinicId/appointments" element={<Appointments />} />
                <Route path="clinic/:clinicId/logs" element={<InventoryLogs />} />
                <Route path="clinic/:clinicId/users" element={<Users />} />
                
                {/* Add more routes here */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Routes>
            
            <Toaster />
          </ClinicProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;