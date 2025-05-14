/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import InvitationForm from '@/components/users/InvitationForm';
import { Copy, UserPlus, Loader2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useClinic } from '@/contexts/ClinicContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { createInvitation, getClinicInvitations } from '@/services/userService';
import { UserRole, Invitation, User } from '@/types';
import { format, isPast } from 'date-fns';
import { getClinicStaff, removeUserFromClinic } from '@/services/clinicService';

const Users: React.FC = () => {
  const { clinicId } = useParams<{ clinicId: string }>();
  const { activeClinic } = useClinic();
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch invitations
  const fetchInvitations = async () => {
    if (clinicId && activeClinic?.id === clinicId) {
      try {
        setIsLoading(true);
        const data = await getClinicInvitations(clinicId);
        setInvitations(data);
      } catch (error) {
        console.error('Failed to fetch invitations', error);
        toast.error('Failed to load invitations');
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchInvitations();
    fetchStaff();
  }, [clinicId, activeClinic]);

  // Handle create invitation
  const handleCreateInvitation = async (data: { email: string, role: UserRole }) => {
    if (!clinicId) return;

    try {
      setIsSubmitting(true);
      await createInvitation({
        employeeEmail: data.email,
        role: data.role,
        clinicId,
        doctorId: user?.id
      });
      toast.success('Invitation sent successfully');
      fetchInvitations();
    } catch (error) {
      console.error('Failed to send invitation', error);
      toast.error('Failed to send invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Copy invitation link
  const copyInvitationLink = (token: string) => {
    const link = `${window.location.origin}/login?token=${token}`;
    navigator.clipboard.writeText(link);
    toast.success('Invitation link copied to clipboard');
  };

  // Mock team members data (in a real app, this would come from an API)
  // const teamMembers = [
  //   {
  //     id: '1',
  //     name: user?.name || 'Admin User',
  //     email: user?.email || 'admin@example.com',
  //     role: user?.role || UserRole.ADMIN,
  //     joinedAt: new Date().toISOString(),
  //     isOwner: true,
  //   },
  //   {
  //     id: '2',
  //     name: 'Dr. Maria Johnson',
  //     email: 'maria@example.com',
  //     role: UserRole.DOCTOR,
  //     joinedAt: '2025-01-15T10:00:00Z',
  //     isOwner: false,
  //   },
  //   {
  //     id: '3',
  //     name: 'Alex Brown',
  //     email: 'alex@example.com',
  //     role: UserRole.ASSISTANT,
  //     joinedAt: '2025-02-20T14:30:00Z',
  //     isOwner: false,
  //   },
  // ];

  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [userToRemove, setUserToRemove] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);



  const roleColors = {
    [UserRole.ADMIN]: 'bg-violet-100 text-violet-800 dark:bg-violet-800 dark:text-violet-100 hover:text-white cursor-pointer',
    [UserRole.DOCTOR]: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 hover:text-white cursor-pointer',
    [UserRole.ASSISTANT]: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 hover:text-white cursor-pointer',
  };

  const fetchStaff = async () => {
    if (!clinicId) return;

    try {
      const data = await getClinicStaff(clinicId);
      setTeamMembers(data);
    } catch (error) {
      toast.error("Failed to load clinic staff");
    }
  };

  const handleRemoveConfirm = async () => {
    if (!clinicId || !userToRemove) return;

    try {
      setIsRemoving(true);
      await removeUserFromClinic(clinicId, userToRemove);
      toast.success("User removed successfully");
      setUserToRemove(null);
      fetchStaff(); // Dacă ai funcția asta care face refetch la staff
    } catch (error) {
      console.error("Failed to remove user", error);
      toast.error("Failed to remove user");
    } finally {
      setIsRemoving(false);
    }
  };



  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold">Clinic Users</h1>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Invite a Team Member</DialogTitle>
              <DialogDescription>
                Invite a new user to your clinic with specific permissions.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <InvitationForm
                onSubmit={handleCreateInvitation}
                isSubmitting={isSubmitting}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="team">
        <TabsList>
          <TabsTrigger value="team">Team Members</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage users who have access to this clinic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>{getInitials(member.firstName + ' ' + member.lastName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            <span>{member.firstName} {member.lastName}</span>
                            {member.id === user?.id && (
                              <Badge variant="outline">Owner</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={roleColors[member.role]}>{member.role}</Badge>
                      </TableCell>
                      <TableCell>-</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={member.id === user?.id}
                          onClick={() => setUserToRemove(member.id)}
                        >
                          Remove
                        </Button>


                      </TableCell>
                    </TableRow>
                  ))}

                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="invitations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
              <CardDescription>
                Track and manage invitations sent to new users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : invitations.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <p className="text-lg font-medium">No invitations sent</p>
                  <p className="text-sm text-muted-foreground">
                    Invite team members to collaborate on your clinic
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="mt-4">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Send New Invitation
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[550px]">
                      <DialogHeader>
                        <DialogTitle>Invite a Team Member</DialogTitle>
                        <DialogDescription>
                          Invite a new user to your clinic with specific permissions.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <InvitationForm
                          onSubmit={handleCreateInvitation}
                          isSubmitting={isSubmitting}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>

                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitations.map((invitation) => {
                      const isExpired = isPast(new Date(invitation.expiresAt));

                      return (
                        <TableRow key={invitation.id}>
                          <TableCell className="font-medium">
                            {invitation.employeeEmail}
                          </TableCell>
                          <TableCell>
                            <Badge className={roleColors[invitation.role]}>
                              {invitation.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {isExpired ? (
                                <>
                                  <XCircle className="mr-2 h-4 w-4 text-destructive" />
                                  <span className="text-destructive">Expired</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="mr-2 h-4 w-4 text-amber-500" />
                                  <span className="text-amber-500">Pending</span>
                                </>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(new Date(invitation.expiresAt), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyInvitationLink(invitation.token)}
                              disabled={isExpired}
                            >
                              <Copy className="mr-2 h-3 w-3" />
                              Copy Link
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!userToRemove} onOpenChange={(open) => !open && setUserToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm removal</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this user from the clinic? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={() => setUserToRemove(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveConfirm} disabled={isRemoving}>
              {isRemoving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Users;