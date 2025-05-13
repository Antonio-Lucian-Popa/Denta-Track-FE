import { get, post, put } from './api';
import { Appointment, AppointmentStatus } from '@/types';

export const getClinicAppointments = async (clinicId: string): Promise<Appointment[]> => {
  return await get<Appointment[]>(`/appointments/clinic/${clinicId}`);
};

export const createAppointment = async (data: {
  clinicId: string;
  dateTime: string;
  durationMinutes: number;
  patientName: string;
  reason: string;
}): Promise<Appointment> => {
  return await post<Appointment>('/appointments', data);
};

export const updateAppointmentStatus = async (appointmentId: string, status: AppointmentStatus): Promise<Appointment> => {
  return await put<Appointment>(`/appointments/${appointmentId}/status`, { status });
};