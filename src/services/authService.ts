import { post, get } from './api';
import { AuthResponse, LoginCredentials, RegisterData, User } from '@/types';

export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  return await post<AuthResponse>('/auth/login', credentials);
};

export const registerUser = async (data: RegisterData): Promise<AuthResponse> => {
  return await post<AuthResponse>('/auth/register', data);
};

export const getCurrentUser = async (): Promise<User> => {
  return await get<User>('/users/me');
};

export const validateInvitation = async (token: string): Promise<{ valid: boolean, email: string }> => {
  return await get<{ valid: boolean, email: string }>(`/invitations/validate?token=${token}`);
};