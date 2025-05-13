import { post, get } from './api';
import { Invitation, InvitationRequest } from '@/types';

export const createInvitation = async (data: InvitationRequest): Promise<Invitation> => {
  return await post<Invitation>('/invitations', data);
};

export const getClinicInvitations = async (clinicId: string): Promise<Invitation[]> => {
  return await get<Invitation[]>(`/invitations/clinic/${clinicId}`);
};