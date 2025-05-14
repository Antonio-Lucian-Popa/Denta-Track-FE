import { post, get } from './api';
import { AuthResponse, LoginCredentials, RegisterData, TokenResponse, User, UserRole } from '@/types';

export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  return await post<AuthResponse>('/users/login', credentials);
};

export const registerUser = async (data: RegisterData): Promise<AuthResponse> => {
  return await post<AuthResponse>('/users/register', data);
};

export const registerWithInvite = async (data: RegisterData, inviteToken: string): Promise<AuthResponse> => {
  return await post<AuthResponse>(`/users/register/invite?token=${inviteToken}`, data);
};

export const getCurrentUser = async (): Promise<User> => {
  return await get<User>('/users/me');
};

export const validateInvitation = async (token: string): Promise<{ used: boolean, employeeEmail: string, role: UserRole, clinicId: string, doctorId: string }> => {
  return await get<{ used: boolean, employeeEmail: string, role: UserRole, clinicId: string, doctorId: string  }>(`/invitations/validate?token=${token}`);
};

// Refresh token
export const refreshToken = async (): Promise<TokenResponse | null> => {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) return null;

  try {
    const response = await post<TokenResponse>('/auth/refresh', {
      refreshToken: refresh
    });

    const tokens = response;

    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);

    // const callback = getOnTokenRefreshed();
    // if (callback) callback();

    return tokens;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
};