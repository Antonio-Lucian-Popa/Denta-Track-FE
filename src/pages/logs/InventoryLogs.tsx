import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Download,
  Loader2,
  Package,
  Search,
  ArrowUp,
  ArrowDown,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useClinic } from '@/contexts/ClinicContext';
import { getInventoryLogs, exportInventoryLogs } from '@/services/inventoryLogService';
import { getClinicProducts } from '@/services/productService';
import { InventoryLog, Product, StockAction } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const InventoryLogs: React.FC = () => {
  const { clinicId } = useParams<{ clinicId: string }>();
  const { activeClinic } = useClinic();

  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<InventoryLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  // Fetch logs and products
  const fetchData = async () => {
    if (!clinicId || !activeClinic) return;

    try {
      setIsLoading(true);
      const [logsData, productsData] = await Promise.all([
        getInventoryLogs(clinicId),
        getClinicProducts(clinicId)
      ]);

      setLogs(logsData);
      setProducts(productsData);
      setFilteredLogs(logsData);
    } catch (error) {
      console.error('Failed to fetch inventory data', error);
      toast.error('Failed to load inventory logs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [clinicId, activeClinic]);

  // Apply filters
  useEffect(() => {
    let result = [...logs];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(log => {
        const product = products.find(p => p.id === log.productId);
        return product?.name.toLowerCase().includes(query) ||
          log.reason.toLowerCase().includes(query);
      });
    }

    // Product filter
    if (productFilter) {
      result = result.filter(log => log.productId === productFilter);
    }

    // Action filter
    if (actionFilter) {
      result = result.filter(log => log.actionType === actionFilter);
    }

    // Date range filter
    if (dateRange.from || dateRange.to) {
      result = result.filter(log => {
        const logDate = new Date(log.timestamp);
        if (dateRange.from && logDate < dateRange.from) return false;
        if (dateRange.to && logDate > dateRange.to) return false;
        return true;
      });
    }

    setFilteredLogs(result);
  }, [logs, searchQuery, productFilter, actionFilter, dateRange, products]);

  // Handle export
  const handleExport = async () => {
    if (!clinicId) return;

    try {
      setIsExporting(true);
      const blob = await exportInventoryLogs(clinicId, {
        productId: productFilter || undefined,
        startDate: dateRange.from?.toISOString(),
        endDate: dateRange.to?.toISOString()
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inventory-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Export completed successfully');
    } catch (error) {
      console.error('Failed to export logs', error);
      toast.error('Failed to export logs');
    } finally {
      setIsExporting(false);
    }
  };

  // Get product name by ID
  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.name || 'Unknown Product';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold">Inventory Logs</h1>

        <Button
          onClick={handleExport}
          disabled={isExporting || filteredLogs.length === 0}
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export Logs
            </>
          )}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products or reasons..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Select value={productFilter} onValueChange={(val) => setProductFilter(val === '__all__' ? '' : val)}>
            <SelectTrigger>
              <SelectValue placeholder="All Products" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Products</SelectItem>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>


          <Select value={actionFilter} onValueChange={(val) => setActionFilter(val === '__all__' ? '' : val)}>
            <SelectTrigger>
              <SelectValue placeholder="All Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Actions</SelectItem>
              <SelectItem value={StockAction.IN}>Stock IN</SelectItem>
              <SelectItem value={StockAction.OUT}>Stock OUT</SelectItem>
            </SelectContent>
          </Select>


          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateRange.from && !dateRange.to && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd")} -{" "}
                      {format(dateRange.to, "LLL dd")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd")
                  )
                ) : (
                  "Date Range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                selected={{
                  from: dateRange.from,
                  to: dateRange.to,
                }}
                onSelect={(range) =>
                  setDateRange({
                    from: range?.from,
                    to: range?.to,
                  })
                }
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Statistics */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="text-sm">
          Total Logs: {filteredLogs.length}
        </Badge>
        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
          Stock IN: {filteredLogs.filter(log => log.actionType === StockAction.IN).length}
        </Badge>
        <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
          Stock OUT: {filteredLogs.filter(log => log.actionType === StockAction.OUT).length}
        </Badge>
      </div>

      {/* Logs Table */}
      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <Package className="h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-lg font-medium">No inventory logs found</p>
          <p className="text-sm text-muted-foreground">
            {searchQuery || productFilter || actionFilter || dateRange.from || dateRange.to
              ? "Try adjusting your filters"
              : "Stock movements will appear here"}
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Action</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((log) => (
                  <TableRow key={`${log.productId}-${log.timestamp}`}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {getProductName(log.productId)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          log.actionType === StockAction.IN
                            ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                            : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                        )}
                      >
                        {log.actionType === StockAction.IN ? (
                          <ArrowUp className="mr-1 h-3 w-3" />
                        ) : (
                          <ArrowDown className="mr-1 h-3 w-3" />
                        )}
                        Stock {log.actionType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {log.quantity}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {log.reason}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {log.userNameOfAction}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default InventoryLogs;