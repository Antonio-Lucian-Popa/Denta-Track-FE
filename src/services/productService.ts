import { get, post } from './api';
import { Product, StockAction } from '@/types';

export const getClinicProducts = async (clinicId: string): Promise<Product[]> => {
  return await get<Product[]>(`/products/clinic/${clinicId}`);
};

export const createProduct = async (data: {
  name: string;
  category: string;
  unit: string;
  quantity: number;
  lowStockThreshold: number;
  expirationDate?: string;
  clinicId: string;
}): Promise<Product> => {
  return await post<Product>('/products', data);
};

export const updateProductStock = async (
  productId: string, 
  data: {
    actionType: StockAction;
    quantity: number;
    reason: string;
  }
): Promise<Product> => {
  return await post<Product>(`/products/${productId}/stock`, data);
};

export const getLowStockProducts = async (clinicId: string): Promise<Product[]> => {
  return await get<Product[]>(`/products/clinic/${clinicId}/low-stock`);
};
