import React from 'react';
import { format } from 'date-fns';
import { Clock, Calendar, User, Phone, FileText, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Appointment, AppointmentStatus } from '@/types';
import { updateAppointmentStatus } from '@/services/appointmentService';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

interface AppointmentCardProps {
  appointment: Appointment;
  onStatusUpdate: () => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onStatusUpdate
}) => {
  const [isUpdating, setIsUpdating] = React.useState(false);
  const { user } = useAuth();

  const dateObj = new Date(appointment.dateTime);

  const statusColors = {
    [AppointmentStatus.SCHEDULED]: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
    [AppointmentStatus.COMPLETED]: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
    [AppointmentStatus.CANCELED]: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100",
  };

  const isDoctorOrAdmin = user?.role === UserRole.DOCTOR || user?.role === UserRole.ADMIN;

  const handleStatusUpdate = async (newStatus: AppointmentStatus) => {
    try {
      setIsUpdating(true);
      await updateAppointmentStatus(appointment.id, newStatus);
      toast.success(`Appointment marked as ${newStatus.toLowerCase()}`);
      onStatusUpdate();
    } catch (error) {
      console.error('Failed to update appointment status', error);
      toast.error('Failed to update appointment status');
    } finally {
      setIsUpdating(false);
    }
  };

  const isPast = dateObj < new Date();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold">{appointment.patientName}</h3>
          <Badge className={statusColors[appointment.status]}>
            {appointment.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-1">
        <div className="grid gap-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            <span>{format(dateObj, 'EEEE, MMMM d, yyyy')}</span>
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-2 h-4 w-4" />
            <span>
              {format(dateObj, 'h:mm a')} –{' '}
              {format(
                new Date(dateObj.getTime() + appointment.durationMinutes * 60000),
                'h:mm a'
              )}
              <span className="ml-1 text-xs">({appointment.durationMinutes} min)</span>
            </span>
          </div>

          {/* Doctor (by userId) */}
          <div className="flex items-center text-sm text-muted-foreground">
            <User className="mr-2 h-4 w-4" />
            <span>Dr. {appointment.userId}</span> {/* sau user lookup */}
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <Phone className="mr-2 h-4 w-4" />
            <span>{appointment.patientPhone}</span>
          </div>

          {appointment.reason && (
            <div className="mt-2 flex text-sm">
              <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
              <p className="truncate">{appointment.reason}</p>
            </div>
          )}
        </div>
      </CardContent>

      {appointment.status === AppointmentStatus.SCHEDULED && isDoctorOrAdmin && !isPast && (
        <CardFooter className="grid grid-cols-2 gap-2 pt-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full">Cancel</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel this appointment? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>No, keep it</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleStatusUpdate(AppointmentStatus.CANCELED)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Canceling...
                    </>
                  ) : 'Yes, cancel it'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            onClick={() => handleStatusUpdate(AppointmentStatus.COMPLETED)}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Completing...
              </>
            ) : 'Complete'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default AppointmentCard;