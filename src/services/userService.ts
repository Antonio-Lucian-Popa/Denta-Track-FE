import { post, get, del } from './api';
import { Invitation, InvitationRequest } from '@/types';

export const createInvitation = async (data: InvitationRequest): Promise<Invitation> => {
  return await post<Invitation>('/invitations', data);
};

export const getClinicInvitations = async (clinicId: string): Promise<Invitation[]> => {
  return await get<Invitation[]>(`/invitations/clinic/${clinicId}`);
};

export const deleteInvitation = async (invitationId: string): Promise<void> => {
  return await del<void>(`/invitations/${invitationId}`);
};