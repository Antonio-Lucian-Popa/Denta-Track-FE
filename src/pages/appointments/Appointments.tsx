import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { format, parse, isToday, isThisWeek, isSameDay, startOfMonth, endOfMonth } from 'date-fns';
import { CalendarDays, ListFilter, Plus, Search, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import AppointmentForm from '@/components/appointments/AppointmentForm';
import AppointmentCard from '@/components/appointments/AppointmentCard';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { getClinicAppointments, createAppointment } from '@/services/appointmentService';
import { Appointment, AppointmentStatus } from '@/types';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

const Appointments: React.FC = () => {
  const { clinicId } = useParams<{ clinicId: string }>();
  const { user } = useAuth();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch appointments
  const fetchAppointments = async () => {
    if (!clinicId) return;

    try {
      setIsLoading(true);
      const data = await getClinicAppointments(clinicId);
      setAppointments(data);
      setFilteredAppointments(data);
    } catch (error) {
      console.error('Failed to fetch appointments', error);
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [clinicId]);

  // Apply filters
  useEffect(() => {
    if (!appointments.length) {
      setFilteredAppointments([]);
      return;
    }

    let result = [...appointments];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        appointment => appointment.patientName.toLowerCase().includes(query) ||
          appointment.patientPhone.includes(query)
      );
    }

    // Status filter
    if (statusFilter) {
      result = result.filter(appointment => appointment.status === statusFilter);
    }

    // Period filter
    if (periodFilter !== 'all') {
      const today = new Date();

      if (periodFilter === 'today') {
        result = result.filter(
          appointment => isToday(new Date(`${appointment.date}T${appointment.time}`))
        );
      } else if (periodFilter === 'week') {
        result = result.filter(
          appointment => isThisWeek(new Date(`${appointment.date}T${appointment.time}`))
        );
      } else if (periodFilter === 'month') {
        const startMonth = startOfMonth(today);
        const endMonth = endOfMonth(today);

        result = result.filter(appointment => {
          const appDate = new Date(`${appointment.date}T${appointment.time}`);
          return appDate >= startMonth && appDate <= endMonth;
        });
      }
    }

    // Calendar date filter (for calendar view)
    const dateFilteredAppointments = result.filter(appointment => {
      const appDate = parse(appointment.date, 'yyyy-MM-dd', new Date());
      return isSameDay(appDate, selectedDate);
    });

    setFilteredAppointments(result);
  }, [appointments, searchQuery, statusFilter, periodFilter, selectedDate]);

  // Handle create appointment
  const handleCreateAppointment = async (data: any) => {
    if (!clinicId || !user) return;

    try {
      setIsSubmitting(true);

      const appointmentData = {
        patientName: data.patientName,
        patientPhone: data.patientPhone,
        date: format(data.date, 'yyyy-MM-dd'),
        time: data.time,
        duration: data.duration,
        notes: data.notes || '',
        clinicId,
        doctorId: user.id, // Assuming current user is the doctor
        status: AppointmentStatus.SCHEDULED
      };

      await createAppointment(appointmentData);
      toast.success('Appointment scheduled successfully');
      setShowAddDialog(false);
      fetchAppointments();
    } catch (error) {
      console.error('Failed to create appointment', error);
      toast.error('Failed to schedule appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle status update
  const handleStatusUpdate = () => {
    fetchAppointments();
  };

  // Get calendar day class
  const getDayClass = (date: Date) => {
    const hasAppointment = appointments.some(appointment => {
      const appDate = parse(appointment.date, 'yyyy-MM-dd', new Date());
      return isSameDay(appDate, date);
    });

    if (hasAppointment) {
      return "bg-primary/10 text-primary font-bold";
    }

    return "";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold">Appointments</h1>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Schedule New Appointment</DialogTitle>
              <DialogDescription>
                Add a new appointment to your calendar.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <AppointmentForm
                onSubmit={handleCreateAppointment}
                isSubmitting={isSubmitting}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patient name or phone..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 md:flex md:w-auto">
          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val === '__all__' ? '' : val)}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Status</SelectItem>
              <SelectItem value={AppointmentStatus.SCHEDULED}>Scheduled</SelectItem>
              <SelectItem value={AppointmentStatus.COMPLETED}>Completed</SelectItem>
              <SelectItem value={AppointmentStatus.CANCELED}>Canceled</SelectItem>
            </SelectContent>
          </Select>


          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistics */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="text-sm">
          All Appointments: {appointments.length}
        </Badge>
        <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
          Scheduled: {appointments.filter(a => a.status === AppointmentStatus.SCHEDULED).length}
        </Badge>
        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
          Completed: {appointments.filter(a => a.status === AppointmentStatus.COMPLETED).length}
        </Badge>
        <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
          Canceled: {appointments.filter(a => a.status === AppointmentStatus.CANCELED).length}
        </Badge>
      </div>

      {/* View Options */}
      <Tabs defaultValue="list">
        <div className="flex justify-between">
          <TabsList>
            <TabsTrigger value="list">
              <ListFilter className="mr-2 h-4 w-4" />
              List View
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <CalendarDays className="mr-2 h-4 w-4" />
              Calendar View
            </TabsTrigger>
          </TabsList>
        </div>

        {/* List View */}
        <TabsContent value="list" className="mt-6">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="animate-spin text-primary">
                <CalendarDays className="h-8 w-8" />
              </div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <p className="text-lg font-medium">No appointments found</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery || statusFilter || periodFilter !== 'all'
                  ? "Try adjusting your filters"
                  : "Schedule your first appointment to get started"}
              </p>
              {!searchQuery && !statusFilter && periodFilter === 'all' && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowAddDialog(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule Appointment
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredAppointments
                .sort((a, b) => {
                  const dateA = new Date(`${a.date}T${a.time}`);
                  const dateB = new Date(`${b.date}T${b.time}`);
                  return dateA.getTime() - dateB.getTime();
                })
                .map(appointment => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))
              }
            </div>
          )}
        </TabsContent>

        {/* Calendar View */}
        <TabsContent value="calendar" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>Select a date to view appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => setSelectedDate(date || new Date())}
                  className="mx-auto"
                  modifiersClassNames={{
                    selected: "bg-primary text-primary-foreground",
                  }}
                  modifiers={{
                    appointment: (date) => {
                      return appointments.some(appointment => {
                        const appDate = parse(appointment.date, 'yyyy-MM-dd', new Date());
                        return isSameDay(appDate, date);
                      });
                    }
                  }}
                  styles={{
                    day_appointment: { fontWeight: 'bold', borderBottom: '2px solid currentColor' }
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    {format(selectedDate, 'MMMM d, yyyy')}
                  </div>
                </CardTitle>
                <CardDescription>
                  Appointments scheduled for this day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-[400px] overflow-y-auto pr-2">
                  {filteredAppointments
                    .filter(appointment => {
                      const appDate = parse(appointment.date, 'yyyy-MM-dd', new Date());
                      return isSameDay(appDate, selectedDate);
                    })
                    .sort((a, b) => {
                      return a.time.localeCompare(b.time);
                    })
                    .map(appointment => (
                      <div
                        key={appointment.id}
                        className="mb-3 rounded-md border p-3"
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <h3 className="font-medium">{appointment.patientName}</h3>
                          <Badge
                            variant="outline"
                            className={
                              appointment.status === AppointmentStatus.SCHEDULED
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                                : appointment.status === AppointmentStatus.COMPLETED
                                  ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                  : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                            }
                          >
                            {appointment.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div>
                            Time: {format(parse(appointment.time, 'HH:mm', new Date()), 'h:mm a')}
                            <span className="ml-1 text-xs">
                              ({appointment.duration} min)
                            </span>
                          </div>
                          <div>Phone: {appointment.patientPhone}</div>
                          {appointment.notes && <div>Notes: {appointment.notes}</div>}
                        </div>
                        <div className="mt-2 flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // Open the card in the list view for more options
                              document.querySelector('[value="list"]')?.click();
                            }}
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    ))
                  }

                  {filteredAppointments.filter(appointment => {
                    const appDate = parse(appointment.date, 'yyyy-MM-dd', new Date());
                    return isSameDay(appDate, selectedDate);
                  }).length === 0 && (
                      <div className="flex h-40 flex-col items-center justify-center text-center">
                        <p className="text-muted-foreground">No appointments for this day</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => setShowAddDialog(true)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add
                        </Button>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Appointments;