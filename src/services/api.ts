/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { API_URL } from '@/utils/constants';
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'sonner';
import { refreshToken } from './authService';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for adding the auth token
api.interceptors.request.use(
  (config) => {
    if (!config.url?.includes('/users/refresh') && !config.url?.includes('/users/register') && !config.url?.includes('/users/login')) {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Evită bucla infinită
    if (originalRequest.url.includes('/users/refresh')) {
      return Promise.reject(error);
    }

    // Dacă e 401 și nu s-a mai retrimis
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshed = await refreshToken();

        if (refreshed) {
          originalRequest.headers.Authorization = `Bearer ${refreshed.access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/dentatrack-fe/login';
      }
    }

    return Promise.reject(error);
  }
);
// Generic GET request
export const get = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response: AxiosResponse<T> = await api.get(url, config);
  return response.data;
};

// Generic POST request
export const post = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  const response: AxiosResponse<T> = await api.post(url, data, config);
  return response.data;
};

// Generic PUT request
export const put = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  const response: AxiosResponse<T> = await api.put(url, data, config);
  return response.data;
};

// Generic PATCH request
export const patch = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  const response: AxiosResponse<T> = await api.patch(url, data, config);
  return response.data;
};

// Generic DELETE request
export const del = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response: AxiosResponse<T> = await api.delete(url, config);
  return response.data;
};

export default api;