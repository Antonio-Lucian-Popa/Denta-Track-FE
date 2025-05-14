import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { UserRole } from '@/types';
import { useClinic } from '@/contexts/ClinicContext';
import { useAuth } from '@/contexts/AuthContext';
import { isUserClinic } from '@/services/clinicService';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: 'Please select a valid role' }),
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface InvitationFormProps {
  onSubmit: (data: FormValues) => Promise<void>;
  isSubmitting?: boolean;
}

const InvitationForm: React.FC<InvitationFormProps> = ({ 
  onSubmit,
  isSubmitting = false,
}) => {
  const { activeClinic } = useClinic();
  const { user } = useAuth();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      role: UserRole.ASSISTANT, // Default role
    }
  });

  
  const [isOwner, setIsOwner] = useState(false);
  
  const isAdmin = user?.role === UserRole.ADMIN || isOwner;

  useEffect(() => {
    const checkOwnership = async () => {
      if (!activeClinic?.id) return;
      try {
        const data = await isUserClinic(activeClinic.id);
        setIsOwner(data);
      } catch (error) {
        console.error('Error checking ownership', error);
      }
    };
    checkOwnership();
  }, [activeClinic]);
  
  
  const handleSubmit = async (data: FormValues) => {
    if (activeClinic && isAdmin) {
      await onSubmit(data);
      form.reset();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input placeholder="colleague@example.com" {...field} />
              </FormControl>
              <FormDescription>
                The invitation will be sent to this email address
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={UserRole.ASSISTANT}>Assistant</SelectItem>
                  <SelectItem value={UserRole.DOCTOR}>Doctor</SelectItem>
                  {isAdmin && (
                    <SelectItem value={UserRole.ADMIN}>Administrator</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                The permissions level for this user
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          disabled={isSubmitting || !isAdmin}
          className="w-full md:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending Invitation...
            </>
          ) : 'Send Invitation'}
        </Button>
        
        {!isAdmin && (
          <p className="text-sm text-destructive">
            Note: Only administrators can send invitations.
          </p>
        )}
      </form>
    </Form>
  );
};

export default InvitationForm;