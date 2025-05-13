import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Search, Filter, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductForm from '@/components/products/ProductForm';
import ProductCard from '@/components/products/ProductCard';
import { useClinic } from '@/contexts/ClinicContext';
import { getClinicProducts, createProduct } from '@/services/productService';
import { Product } from '@/types';
import { toast } from 'sonner';

const Products: React.FC = () => {
  const { clinicId } = useParams<{ clinicId: string }>();
  const { activeClinic } = useClinic();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Fetch products
  const fetchProducts = async () => {
    if (clinicId && activeClinic?.id === clinicId) {
      try {
        setIsLoading(true);
        const data = await getClinicProducts(clinicId);
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error('Failed to fetch products', error);
        toast.error('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [clinicId, activeClinic]);

  // Apply filters
  useEffect(() => {
    let result = [...products];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        product => product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter) {
      result = result.filter(product => product.category === categoryFilter);
    }

    // Stock status filter
    if (stockFilter === 'low') {
      result = result.filter(product => product.isLowStock);
    } else if (stockFilter === 'expired') {
      result = result.filter(product =>
        product.expiryDate && new Date(product.expiryDate) < new Date()
      );
    }

    setFilteredProducts(result);
  }, [products, searchQuery, categoryFilter, stockFilter]);

  // Extract unique categories
  const categories = Array.from(new Set(products.map(p => p.category)));

  // Handle create product
  const handleCreateProduct = async (data: any) => {
    if (!clinicId) return;

    try {
      setIsSubmitting(true);
      await createProduct({
        ...data,
        clinicId
      });
      toast.success('Product created successfully');
      setShowAddDialog(false);
      fetchProducts();
    } catch (error) {
      console.error('Failed to create product', error);
      toast.error('Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStockUpdate = () => {
    fetchProducts();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold">Products</h1>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Add a new product to your inventory.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <ProductForm
                onSubmit={handleCreateProduct}
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
            placeholder="Search products..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 md:flex md:w-auto">
          <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val === '__all__' ? '' : val)}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>


          <Select value={stockFilter} onValueChange={(val) => setStockFilter(val === '__all__' ? '' : val)}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Stock Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Status</SelectItem>
              <SelectItem value="low">Low Stock</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>

        </div>
      </div>

      {/* Statistics */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="text-sm">
          Total Products: {products.length}
        </Badge>
        <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100">
          Low Stock: {products.filter(p => p.isLowStock).length}
        </Badge>
        <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
          Expired: {products.filter(p => p.expiryDate && new Date(p.expiryDate) < new Date()).length}
        </Badge>
      </div>

      {/* Products Grid */}
      <Tabs defaultValue="grid">
        <div className="flex justify-between">
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>

          <div className="flex items-center">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {filteredProducts.length} products
            </span>
          </div>
        </div>

        <TabsContent value="grid" className="mt-6">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery || categoryFilter || stockFilter
                  ? "Try adjusting your filters"
                  : "Add your first product to get started"}
              </p>
              {!searchQuery && !categoryFilter && !stockFilter && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowAddDialog(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onStockUpdate={handleStockUpdate}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery || categoryFilter || stockFilter
                  ? "Try adjusting your filters"
                  : "Add your first product to get started"}
              </p>
              {!searchQuery && !categoryFilter && !stockFilter && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowAddDialog(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-12 border-b bg-muted/50 p-2 text-sm font-medium">
                <div className="col-span-5">Product</div>
                <div className="col-span-2 text-center">Category</div>
                <div className="col-span-2 text-center">Current Stock</div>
                <div className="col-span-2 text-center">Min. Stock</div>
                <div className="col-span-1 text-center">Actions</div>
              </div>

              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={`grid grid-cols-12 items-center border-b p-3 ${product.isLowStock ? 'bg-amber-50 dark:bg-amber-950/20' : ''
                    }`}
                >
                  <div className="col-span-5 font-medium">
                    {product.name}
                    {product.expiryDate && new Date(product.expiryDate) < new Date() && (
                      <Badge variant="destructive" className="ml-2">Expired</Badge>
                    )}
                  </div>
                  <div className="col-span-2 text-center">{product.category}</div>
                  <div className={`col-span-2 text-center font-medium ${product.isLowStock ? 'text-amber-600 dark:text-amber-400' : ''}`}>
                    {product.currentStock}
                  </div>
                  <div className="col-span-2 text-center text-muted-foreground">
                    {product.minimumStock}
                  </div>
                  <div className="col-span-1 text-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Update
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update Stock for {product.name}</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          {/* Reusing the same component for the card view */}
                          <ProductCard
                            product={product}
                            onStockUpdate={handleStockUpdate}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Products;