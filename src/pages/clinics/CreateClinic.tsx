import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Hospital } from 'lucide-react';
// import { useAuth } from '@/contexts/AuthContext';
import { useClinic } from '@/contexts/ClinicContext';
import { createClinic } from '@/services/clinicService';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(2, 'Clinic name must be at least 2 characters'),
  address: z.string().optional(),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CreateClinic: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  //const { user } = useAuth();
  const { refreshClinics } = useClinic();
  const navigate = useNavigate();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
    }
  });
  
  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      await createClinic(data);
      toast.success('Clinic created successfully');
      await refreshClinics();
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to create clinic', error);
      toast.error('Failed to create clinic');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Hospital className="h-12 w-12 text-primary" />
          <h1 className="text-3xl font-bold">Create Your Clinic</h1>
          <p className="text-muted-foreground">
            Set up your dental clinic in DentaTrack
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Clinic Details</CardTitle>
            <CardDescription>
              Enter the information for your dental clinic
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clinic Name</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g., Smile Dental Care" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g., 123 Main St, City" {...field} />
                      </FormControl>
                      <FormDescription>
                        The physical address of your clinic
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g., (123) 456-7890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between gap-4 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/login')}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : 'Create Clinic'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateClinic;