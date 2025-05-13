import { post, get } from './api';
import { Clinic, DashboardStats } from '@/types';

export const getClinics = async (): Promise<Clinic[]> => {
  return await get<Clinic[]>('/clinics');
};

export const createClinic = async (data: { name: string, address?: string, phone?: string }): Promise<Clinic> => {
  return await post<Clinic>('/clinics', data);
};

export const getDashboardStats = async (clinicId: string): Promise<DashboardStats> => {
  return await get<DashboardStats>(`/dashboard/clinic/${clinicId}`);
};