import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Clinic } from '@/types';
import { getClinics } from '@/services/clinicService';
import { useAuth } from './AuthContext';

interface ClinicContextType {
  clinics: Clinic[];
  isLoading: boolean;
  hasFetchedClinics: boolean;
  activeClinic: Clinic | null;
  setActiveClinic: (clinic: Clinic) => void;
  refreshClinics: () => Promise<void>;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

interface ClinicProviderProps {
  children: ReactNode;
}

export const ClinicProvider: React.FC<ClinicProviderProps> = ({ children }) => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [activeClinic, setActiveClinic] = useState<Clinic | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const [hasFetchedClinics, setHasFetchedClinics] = useState(false);


  const fetchClinics = async () => {
    if (!isAuthenticated) return;
  
    setIsLoading(true);
    try {
      const clinicsData = await getClinics();
      setClinics(clinicsData);
  
      const storedClinicId = localStorage.getItem('activeClinicId');
      const found = clinicsData.find(c => c.id === storedClinicId);
  
      if (found) {
        setActiveClinic(found);
      } else if (clinicsData.length > 0) {
        setActiveClinic(clinicsData[0]);
        localStorage.setItem('activeClinicId', clinicsData[0].id);
      } else {
        setActiveClinic(null);
        localStorage.removeItem('activeClinicId');
      }
    } catch (error) {
      console.error('Failed to fetch clinics', error);
      setActiveClinic(null);
    } finally {
      setIsLoading(false);
      setHasFetchedClinics(true);
    }
  };
  

  useEffect(() => {
    if (isAuthenticated) {
      fetchClinics();
    }
  }, [isAuthenticated]);

  const handleSetActiveClinic = (clinic: Clinic) => {
    setActiveClinic(clinic);
    localStorage.setItem('activeClinicId', clinic.id);
  };

  const value = {
    clinics,
    isLoading,
    activeClinic,
    setActiveClinic: handleSetActiveClinic,
    refreshClinics: fetchClinics,
    hasFetchedClinics
  };  

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
};

export const useClinic = (): ClinicContextType => {
  const context = useContext(ClinicContext);
  if (context === undefined) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};