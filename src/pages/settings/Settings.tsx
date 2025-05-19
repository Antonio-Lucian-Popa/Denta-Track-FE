import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Building2,
    MapPin,
    Phone,
    Mail,
    User,
    Moon,
    Sun,
    Loader2,
    UserCircle
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/components/ui/theme-provider';
import { useClinic } from '@/contexts/ClinicContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";

const clinicFormSchema = z.object({
    name: z.string().min(2, 'Clinic name must be at least 2 characters'),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Please enter a valid email').optional(),
});

const profileFormSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    phone: z.string().optional(),
});

type ClinicFormValues = z.infer<typeof clinicFormSchema>;
type ProfileFormValues = z.infer<typeof profileFormSchema>;

const Settings: React.FC = () => {
   // const { clinicId } = useParams<{ clinicId: string }>();
    const { activeClinic } = useClinic();
    const { user } = useAuth();
    const { theme, setTheme } = useTheme();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [showProfileDialog, setShowProfileDialog] = React.useState(false);

    const clinicForm = useForm<ClinicFormValues>({
        resolver: zodResolver(clinicFormSchema),
        defaultValues: {
            name: activeClinic?.name || '',
            address: activeClinic?.address || '',
            phone: '',
            email: '',
        }
    });

    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || '',
            phone: '',
        }
    });

    const onClinicSubmit = async (data: ClinicFormValues) => {
        try {
            setIsSubmitting(true);
            // API call would go here
            console.log('Updating clinic settings:', data);
            toast.success('Clinic settings updated successfully');
        } catch (error) {
            console.error('Failed to update clinic settings', error);
            toast.error('Failed to update clinic settings');
        } finally {
            setIsSubmitting(false);
        }
    };

    const onProfileSubmit = async (data: ProfileFormValues) => {
        try {
            setIsSubmitting(true);
            // API call would go here
            console.log('Updating profile:', data);
            toast.success('Profile updated successfully');
            setShowProfileDialog(false);
        } catch (error) {
            console.error('Failed to update profile', error);
            toast.error('Failed to update profile');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your clinic settings and preferences
                </p>
            </div>

            <Tabs defaultValue="profile">
                <TabsList>
                    {user?.role === 'OWNER' && (
                        <TabsTrigger value="clinic">Clinic</TabsTrigger>
                    )}
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                </TabsList>

                {user?.role === 'OWNER' && (
                    <TabsContent value="clinic" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Clinic Information</CardTitle>
                                <CardDescription>
                                    Update your clinic's basic information
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...clinicForm}>
                                    <form onSubmit={clinicForm.handleSubmit(onClinicSubmit)} className="space-y-4">
                                        <FormField
                                            control={clinicForm.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Clinic Name</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                                            <Input placeholder="Enter clinic name" className="pl-10" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={clinicForm.control}
                                            name="address"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Address</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                                            <Input placeholder="Enter clinic address" className="pl-10" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <FormField
                                                control={clinicForm.control}
                                                name="phone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Phone Number</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                                                <Input placeholder="Enter phone number" className="pl-10" {...field} />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={clinicForm.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Email</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                                                <Input placeholder="Enter clinic email" className="pl-10" {...field} />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="mt-4"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : 'Save Changes'}
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}
                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Profile</CardTitle>
                            <CardDescription>View and update your personal information</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <div className="rounded-full bg-primary/10 p-6">
                                        <User className="h-8 w-8 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">{user?.firstName} {user?.lastName}</h3>
                                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium">Role</h4>
                                    <p className="text-sm text-muted-foreground">{user?.role}</p>
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={() => setShowProfileDialog(true)}
                                >
                                    Edit Profile
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="appearance">
                    <Card>
                        <CardHeader>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>
                                Customize how DentaTrack looks on your device
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <label className="text-base font-medium">Theme</label>
                                        <p className="text-sm text-muted-foreground">
                                            Switch between light and dark mode
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={toggleTheme}
                                    >
                                        {theme === 'light' ? (
                                            <Sun className="h-5 w-5" />
                                        ) : (
                                            <Moon className="h-5 w-5" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            {/* Profile Edit Dialog */}
            <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>
                            Update your personal information
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    <div className="rounded-full bg-primary/10 p-8">
                                        <UserCircle className="h-12 w-12 text-primary" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={profileForm.control}
                                        name="firstName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>First Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="John" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={profileForm.control}
                                        name="lastName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Last Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Doe" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={profileForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                                    <Input placeholder="your@email.com" className="pl-10" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={profileForm.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number (Optional)</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                                    <Input placeholder="(123) 456-7890" className="pl-10" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowProfileDialog(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Settings;