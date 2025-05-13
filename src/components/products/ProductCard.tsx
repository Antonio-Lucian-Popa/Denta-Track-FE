import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  AlertCircle,
  Package,
  Calendar,
  ArrowUp,
  ArrowDown,
  Loader2
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Product, StockAction } from '@/types';
import { updateProductStock } from '@/services/productService';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  onStockUpdate: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onStockUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stockAction, setStockAction] = useState<StockAction>(StockAction.IN);
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  
  const hasExpired = product.expirationDate 
    ? new Date(product.expirationDate) < new Date() 
    : false;
  
  const handleStockUpdate = async () => {
    if (quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }
    
    if (!reason.trim()) {
      toast.error('Please provide a reason for this stock update');
      return;
    }
    
    try {
      setIsUpdating(true);
      await updateProductStock(product.id, {
        actionType: stockAction,
        quantity,
        reason
      });
      
      toast.success(`Stock successfully ${stockAction === StockAction.IN ? 'added' : 'removed'}`);
      onStockUpdate();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to update stock', error);
      toast.error('Failed to update stock');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const resetForm = () => {
    setStockAction(StockAction.IN);
    setQuantity(1);
    setReason('');
  };

  return (
    <Card className={`overflow-hidden ${hasExpired ? 'border-destructive' : product.isLowStock ? 'border-amber-500' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div>
            <CardTitle className="truncate">{product.name}</CardTitle>
            <CardDescription>Category: {product.category}</CardDescription>
          </div>
          <Badge variant={product.isLowStock ? "destructive" : "outline"} className="h-fit">
            <Package className="mr-1 h-3 w-3" /> 
            {product.quantity} in stock
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Minimum Stock:</span>
            <span className="font-medium">{product.lowStockThreshold}</span>
          </div>
          
          {product.expirationDate && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center text-muted-foreground">
                <Calendar className="mr-1 h-3 w-3" /> Expires:
              </span>
              <span className={`font-medium ${hasExpired ? 'text-destructive' : ''}`}>
                {format(new Date(product.expirationDate), 'MMM d, yyyy')}
                {hasExpired && <AlertCircle className="ml-1 h-3 w-3 inline" />}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">Update Stock</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Stock for {product.name}</DialogTitle>
              <DialogDescription>
                Add or remove stock from inventory and provide a reason.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">
                  Action
                </label>
                <Select 
                  value={stockAction} 
                  onValueChange={(value) => setStockAction(value as StockAction)}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={StockAction.IN}>
                      <div className="flex items-center">
                        <ArrowUp className="mr-2 h-4 w-4 text-green-500" />
                        <span>Stock IN</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={StockAction.OUT}>
                      <div className="flex items-center">
                        <ArrowDown className="mr-2 h-4 w-4 text-red-500" />
                        <span>Stock OUT</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">
                  Quantity
                </label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  min={1}
                  max={stockAction === StockAction.OUT ? product.quantity : undefined}
                  disabled={isUpdating}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">
                  Reason
                </label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={stockAction === StockAction.IN ? "New purchase, returned item, etc." : "Used in procedure, expired, etc."}
                  disabled={isUpdating}
                  className="col-span-3"
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleStockUpdate}
                disabled={isUpdating || quantity <= 0 || !reason.trim() || (stockAction === StockAction.OUT && quantity > product.quantity)}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : 'Update Stock'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;