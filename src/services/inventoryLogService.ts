import { get } from './api';
import { InventoryLog, InventoryLogFilters } from '@/types';

export const getInventoryLogs = async (clinicId: string, filters?: InventoryLogFilters): Promise<InventoryLog[]> => {
  let url = `/inventory-logs/clinic/${clinicId}`;
  
  if (filters) {
    const params = new URLSearchParams();
    
    if (filters.productId) params.append('productId', filters.productId);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
  }
  
  return await get<InventoryLog[]>(url);
};

export const exportInventoryLogs = async (clinicId: string, filters?: InventoryLogFilters): Promise<Blob> => {
  let url = `/inventory-logs/clinic/${clinicId}/export`;
  
  if (filters) {
    const params = new URLSearchParams();
    
    if (filters.productId) params.append('productId', filters.productId);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
  }
  
  return await get<Blob>(url, {
    responseType: 'blob'
  });
};