import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Calendar,
  Package2,
  AlertTriangle,
  CheckCircle,
  ArrowUpDown
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { useClinic } from '@/contexts/ClinicContext';
import { getDashboardStats } from '@/services/clinicService';
import { getLowStockProducts } from '@/services/productService';
import { getClinicAppointments } from '@/services/appointmentService';
import { DashboardStats, Product, Appointment, AppointmentStatus } from '@/types';
import { format } from 'date-fns';
import { Chart } from '@/components/ui/chart';
import { Bar, BarChart, Cell, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts';

const Dashboard: React.FC = () => {
  const { clinicId } = useParams<{ clinicId: string }>();
  const { activeClinic } = useClinic();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clinicId && activeClinic?.id === clinicId) {
      const fetchDashboardData = async () => {
        try {
          setLoading(true);
          const [statsData, productsData, appointmentsData] = await Promise.all([
            getDashboardStats(clinicId),
            getLowStockProducts(clinicId),
            getClinicAppointments(clinicId)
          ]);

          setStats(statsData);
          setLowStockProducts(productsData);

          const today = new Date();
          const upcoming = appointmentsData
            .filter(a => a.status === AppointmentStatus.SCHEDULED)
            .filter(a => new Date(a.dateTime) >= today)
            .sort((a, b) =>
              new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
            )
            .slice(0, 5);

          setUpcomingAppointments(upcoming);
        } catch (error) {
          console.error('Error fetching dashboard data', error);
        } finally {
          setLoading(false);
        }
      };

      fetchDashboardData();
    }
  }, [clinicId, activeClinic]);

  const appointmentStatusData = [
    { name: 'Completed', value: stats?.completedAppointments || 0, color: 'chart.1' },
    { name: 'Scheduled', value: (stats?.totalAppointments || 0) - (stats?.completedAppointments || 0) - (stats?.canceledAppointments || 0), color: 'chart.2' },
    { name: 'Canceled', value: stats?.canceledAppointments || 0, color: 'chart.3' },
  ];

  const stockIssuesData = [
    { name: 'Low Stock', value: stats?.lowStockCount || 0, color: 'chart.4' },
    { name: 'Expired', value: stats?.expiredCount || 0, color: 'chart.5' },
  ];

  const monthlyData = [
    { name: 'Jan', appointments: 45, stockOut: 210 },
    { name: 'Feb', appointments: 52, stockOut: 250 },
    { name: 'Mar', appointments: 61, stockOut: 320 },
    { name: 'Apr', appointments: 55, stockOut: 280 },
    { name: 'May', appointments: 60, stockOut: 290 },
    { name: 'Jun', appointments: 58, stockOut: 310 },
    { name: 'Jul', appointments: 70, stockOut: 340 },
    { name: 'Aug', appointments: 65, stockOut: 330 },
    { name: 'Sep', appointments: 62, stockOut: 305 },
    { name: 'Oct', appointments: 68, stockOut: 325 },
    { name: 'Nov', appointments: 71, stockOut: 350 },
    { name: 'Dec', appointments: 78, stockOut: 370 },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
                <Skeleton className="mt-2 h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-1/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[200px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{activeClinic?.name} Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Appointments"
          value={stats?.totalAppointments || 0}
          icon={<Calendar />}
          description="This month"
          trend={{ value: 12, isPositive: true }}
        />

        <DashboardCard
          title="Completed Appointments"
          value={stats?.completedAppointments || 0}
          icon={<CheckCircle />}
          description="This month"
          trend={{ value: 8, isPositive: true }}
        />

        <DashboardCard
          title="Stock Issues"
          value={(stats?.lowStockCount || 0) + (stats?.expiredCount || 0)}
          icon={<AlertTriangle />}
          description="Low stock or expired products"
          trend={{ value: 5, isPositive: false }}
        />

        <DashboardCard
          title="Stock OUT"
          value={stats?.consumptionLogsThisMonth || 0}
          icon={<ArrowUpDown />}
          description="Units used this month"
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appointment Overview</CardTitle>
            <CardDescription>Current month appointment distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <Chart config={{
              Completed: { color: '#10b981' },
              Scheduled: { color: '#3b82f6' },
              Canceled: { color: '#ef4444' }
            }}>
              <PieChart>
                <Pie data={appointmentStatusData} dataKey="value" nameKey="name" outerRadius={80}>
                  {appointmentStatusData.map((entry, index) => (
                    <Cell key={index} fill={`var(--color-${entry.name})`} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </Chart>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Issues</CardTitle>
            <CardDescription>Products requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <Chart config={{
              'Low Stock': { color: '#facc15' },
              Expired: { color: '#ef4444' }
            }}>
              <PieChart>
                <Pie data={stockIssuesData} dataKey="value" nameKey="name" outerRadius={80}>
                  {stockIssuesData.map((entry, index) => (
                    <Cell key={index} fill={`var(--color-${entry.name})`} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </Chart>

          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activities">
        <TabsList>
          <TabsTrigger value="activities">Activity Overview</TabsTrigger>
          <TabsTrigger value="lowstock">Low Stock Products</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>Appointments and inventory usage over time</CardDescription>
            </CardHeader>
            <CardContent>
              <Chart config={{
                appointments: { color: '#3b82f6' },
                stockOut: { color: '#ef4444' }
              }}>
                <BarChart data={monthlyData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="appointments" fill="var(--color-appointments)" />
                  <Bar dataKey="stockOut" fill="var(--color-stockOut)" />
                </BarChart>
              </Chart>

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lowstock">
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Products</CardTitle>
              <CardDescription>Products below minimum stock level</CardDescription>
            </CardHeader>
            <CardContent>
              {lowStockProducts.length === 0 ? (
                <p className="text-center py-6 text-muted-foreground">No low stock products at the moment.</p>
              ) : (
                <div className="space-y-2">
                  {lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between border-b py-2">
                      <div className="flex items-center">
                        <Package2 className="mr-2 h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <p className="text-sm text-destructive font-medium mr-2">
                          {product.quantity} / {product.lowStockThreshold}
                        </p>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Next scheduled appointments</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length === 0 ? (
                <p className="text-center py-6 text-muted-foreground">No upcoming appointments scheduled.</p>
              ) : (
                <div className="space-y-2">
                  {upcomingAppointments.map((appointment) => {
                    const date = new Date(appointment.dateTime);
                    return (
                      <div key={appointment.id} className="flex items-center justify-between border-b py-2">
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{appointment.patientName}</p>
                            <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{format(date, 'E, MMM d')}</p>
                          <p className="text-sm text-muted-foreground">{format(date, 'HH:mm')}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
