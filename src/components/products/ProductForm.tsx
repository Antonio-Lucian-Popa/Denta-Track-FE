import React from 'react';
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
  SelectValue 
} from '@/components/ui/select';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Product } from '@/types';
import { useClinic } from '@/contexts/ClinicContext';

const categories = [
  'Anesthetics',
  'Antibiotics',
  'Consumables',
  'Instruments',
  'Restorative Materials',
  'Impression Materials',
  'Sterilization',
  'Other'
];

const formSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  category: z.string().min(1, 'Please select a category'),
  currentStock: z.coerce.number().min(0, 'Stock cannot be negative'),
  minimumStock: z.coerce.number().min(0, 'Minimum stock cannot be negative'),
  expiryDate: z.date().optional()
});

type FormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  onSubmit: (data: Product) => Promise<void>;
  defaultValues?: Partial<Product>;
  isSubmitting?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ 
  onSubmit, 
  defaultValues,
  isSubmitting = false
}) => {
  const { activeClinic } = useClinic();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      category: defaultValues?.category || '',
      currentStock: defaultValues?.quantity ?? 0,
      minimumStock: defaultValues?.lowStockThreshold ?? 0,
      expiryDate: defaultValues?.expirationDate
        ? new Date(defaultValues.expirationDate)
        : undefined,
    },
  });
  

  const handleSubmit = async (values: FormValues) => {
    if (!activeClinic) return;
  
    const productPayload: Product = {
      id: defaultValues?.id || '', // sau omit dacă faci `create`
      name: values.name,
      category: values.category,
      unit: 'buc', // dacă ai valoare default
      quantity: values.currentStock,
      lowStockThreshold: values.minimumStock,
      expirationDate: values.expiryDate?.toISOString(),
      clinicId: activeClinic.id,
    };
  
    await onSubmit(productPayload); // sau trimite către backend
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Lidocaine 2%" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="currentStock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Stock</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormDescription>
                  Number of units currently available
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="minimumStock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Stock</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormDescription>
                  Alert when stock falls below this level
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="expiryDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Expiry Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                When this product will expire (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full md:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : 'Save Product'}
        </Button>
      </form>
    </Form>
  );
};

export default ProductForm;