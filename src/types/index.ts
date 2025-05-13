// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  clinicId?: string;
  doctorId?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  ASSISTANT = 'ASSISTANT'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

// Clinic Types
export interface Clinic {
  id: string;
  name: string;
  address?: string;
}

// Product Types
export enum StockAction {
  IN = 'IN',
  OUT = 'OUT'
}

export interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  lowStockThreshold: number;
  expirationDate?: string;
  clinicId: string;
  isLowStock?: boolean;
}

export interface StockUpdate {
  actionType: StockAction;
  quantity: number;
  reason: string;
}

// Inventory Log Types
export interface InventoryLog {
  productId: string;
  actionType: StockAction;
  quantity: number;
  reason: string;
  userId: string;
  timestamp: string;
}

export interface InventoryLogFilters {
  productId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

// Appointment Types
export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED'
}

export interface Appointment {
  id: string;
  clinicId: string;
  dateTime: string;
  durationMinutes: number;
  patientName: string;
  reason: string;
  status: AppointmentStatus;
}

export interface AppointmentUpdate {
  status: AppointmentStatus;
}

// Dashboard Types
export interface DashboardStats {
  totalAppointments: number;
  completedAppointments: number;
  canceledAppointments: number;
  lowStockCount: number;
  expiredCount: number;
  consumptionLogsThisMonth: number;
  lowStockProducts: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
  expiredProducts: Array<{
    name: string;
    expirationDate: string;
  }>;
}

// Invitation Types
export interface Invitation {
  clinicId: string;
  role: UserRole;
  doctorId?: string;
}

export interface InvitationRequest {
  clinicId: string;
  role: UserRole;
  doctorId?: string;
}