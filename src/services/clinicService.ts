import { post, get, del } from './api';
import { Clinic, DashboardStats, User } from '@/types';

export const getClinics = async (): Promise<Clinic[]> => {
  return await get<Clinic[]>('/clinics');
};

export const createClinic = async (data: { name: string, address?: string, phone?: string }): Promise<Clinic> => {
  return await post<Clinic>('/clinics', data);
};

export const getDashboardStats = async (clinicId: string): Promise<DashboardStats> => {
  return await get<DashboardStats>(`/dashboard/clinic/${clinicId}`);
};

export const getClinicStaff = async (clinicId: string): Promise<User[]> => {
  return await get(`/clinics/${clinicId}/staff`);
};

export const removeUserFromClinic = async (clinicId: string, userId: string): Promise<void> => {
  return await del(`/clinics/${clinicId}/users/${userId}`);
};

// Returneaza clinicile la care userul este owner
export const getMyClinics = async (): Promise<Clinic[]> => {
  return await get(`/clinics`);
};

// Check pentur clinica daca apartine ownerului curent
export const isUserClinic = async (clinicId: string): Promise<boolean> => {
  return await get(`/clinics/${clinicId}/is-owner`);
};
