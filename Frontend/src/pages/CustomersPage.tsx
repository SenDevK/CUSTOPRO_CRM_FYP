
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  Filter,
  UserPlus,
  FileUp,
  MoreHorizontal,
  Download,
  Edit,
  Trash,
  Eye,
  Loader2,
  MapPin,
  User
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import CustomerDetailsDialog from "@/components/customers/CustomerDetailsDialog";
import { getCustomers, PaginatedResponse } from "@/services/customerApi";
import { Customer } from "@/types";

const CustomersPage = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [marketingStatusFilter, setMarketingStatusFilter] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Fetch customers from API
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await getCustomers(
          pagination.page,
          pagination.limit,
          searchQuery,
          segmentFilter === "all" ? undefined : segmentFilter,
          marketingStatusFilter || undefined
        );

        setCustomers(result.items);
        setPagination({
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: result.pages
        });
      } catch (err) {
        console.error("Failed to fetch customers:", err);
        setCustomers([]);
        setPagination({
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        });
        setError("Failed to load customers from the database. Please check your connection to the backend server.");
        toast({
          title: "Database Connection Error",
          description: "Could not connect to the customer database. Please ensure the backend server is running.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [pagination.page, pagination.limit, searchQuery, segmentFilter, marketingStatusFilter, toast]);

  const getSegmentBadge = (segment?: string) => {
    // Value-based segments
    if (segment?.includes('Loyal')) {
      return <Badge className="bg-purple-600">Loyal Customer</Badge>;
    } else if (segment?.includes('High Value')) {
      return <Badge className="bg-purple-600">High Value</Badge>;
    } else if (segment?.includes('Medium Value')) {
      return <Badge className="bg-purple-400">Medium Value</Badge>;
    } else if (segment?.includes('Low Value')) {
      return <Badge className="bg-purple-200 text-purple-800">Low Value</Badge>;
    } else if (segment?.includes('At Risk')) {
      return <Badge variant="destructive">At Risk</Badge>;
    } else if (segment?.includes('New')) {
      return <Badge className="bg-blue-500">New Customer</Badge>;
    } else if (segment?.includes('Potential')) {
      return <Badge className="bg-amber-500">Potential Loyalist</Badge>;
    } else if (segment?.includes('Promising')) {
      return <Badge className="bg-green-500">Promising</Badge>;
    } else if (segment?.includes('Needs Attention')) {
      return <Badge className="bg-orange-500">Needs Attention</Badge>;
    } else if (segment?.includes('Dormant')) {
      return <Badge className="bg-red-300">Dormant</Badge>;
    } else if (segment?.includes('Churned')) {
      return <Badge className="bg-red-500">Churned</Badge>;
    }

    // Demographic segments
    else if (segment?.includes('Gender_') || segment?.includes('Age_')) {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        {segment.replace(/_/g, ' ')}
      </Badge>;
    }

    // Preference segments
    else if (segment?.includes('Preference')) {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        {segment}
      </Badge>;
    }

    // Default case
    else {
      return <Badge variant="outline">Unclassified</Badge>;
    }
  };

  // Handle search input
  const handleSearch = () => {
    setSearchQuery(searchTerm);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on new search
  };

  // Handle search on Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle pagination
  const handlePreviousPage = () => {
    if (pagination.page > 1) {
      setPagination(prev => ({ ...prev, page: prev.page - 1 }));
    }
  };

  const handleNextPage = () => {
    if (pagination.page < pagination.pages) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
    }
  };

  // Handle customer details view
  const handleViewCustomerDetails = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setDetailsDialogOpen(true);
  };

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t('customers.title')}</h1>
        <p className="text-muted-foreground">{t('customers.subtitle')}</p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('customers.searchPlaceholder')}
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3"
            onClick={handleSearch}
          >
            {t('common.search')}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select
            value={marketingStatusFilter || segmentFilter}
            onValueChange={(value) => {
              // If selecting a marketing status filter
              if (value.startsWith('marketing_status_')) {
                setMarketingStatusFilter(value);
                setSegmentFilter('all');
              } else {
                // If selecting a segment filter
                setSegmentFilter(value);
                setMarketingStatusFilter('');
              }
              setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter change
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter customers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Segments</SelectItem>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>Value Segments</SelectLabel>
                <SelectItem value="Loyal Customers">Loyal Customers</SelectItem>
                <SelectItem value="High Value">High Value</SelectItem>
                <SelectItem value="Medium Value">Medium Value</SelectItem>
                <SelectItem value="Low Value">Low Value</SelectItem>
                <SelectItem value="At Risk">At Risk</SelectItem>
                <SelectItem value="New Customers">New Customers</SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>Demographic Segments</SelectLabel>
                <SelectItem value="Gender_Male">Male</SelectItem>
                <SelectItem value="Gender_Female">Female</SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>Preference Segments</SelectLabel>
                <SelectItem value="Preference Group 1">Preference Group 1</SelectItem>
                <SelectItem value="Preference Group 2">Preference Group 2</SelectItem>
                <SelectItem value="Preference Group 3">Preference Group 3</SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>Marketing Status</SelectLabel>
                <SelectItem value="marketing_status_active">Active</SelectItem>
                <SelectItem value="marketing_status_opted_out">Opted Out</SelectItem>
                <SelectItem value="marketing_status_deleted">Data Deletion</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>More Filters</span>
          </Button>

          <div className="flex gap-2 ml-auto">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => window.location.href = '/import'}
            >
              <FileUp className="h-4 w-4" />
              <span>{t('common.import')}</span>
            </Button>

            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span>{t('customers.addCustomer')}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-md border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('customers.name')}</TableHead>
              <TableHead>{t('customers.contact')}</TableHead>
              <TableHead>{t('customers.demographics')}</TableHead>
              <TableHead>{t('customers.segment')}</TableHead>
              <TableHead className="text-right">{t('customers.totalSpent')}</TableHead>
              <TableHead>{t('customers.status')}</TableHead>
              <TableHead className="text-right">{t('customers.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`loading-${index}`}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : error ? (
              // Error state
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-destructive">
                  {error}
                </TableCell>
              </TableRow>
            ) : customers.length > 0 ? (
              // Customer data
              customers.map((customer) => (
                <TableRow
                  key={customer.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleViewCustomerDetails(customer.id)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {customer.firstName?.[0]}{customer.lastName?.[0]}
                      </div>
                      <div>
                        {customer.firstName} {customer.lastName}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{customer.email || "No email"}</span>
                      <span className="text-xs text-muted-foreground">{customer.phone || "No phone"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="capitalize">{customer.gender || "Unknown"}</span>
                        {customer.age && <span>, {customer.age} years</span>}
                      </div>
                      {customer.demographic_segment && (
                        <span className="text-xs text-muted-foreground">
                          {customer.demographic_segment.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {customer.rfm_data ? (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            RFM: {customer.rfm_data.rfm_score || "N/A"}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {customer.value_segment || "Unknown segment"}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">No RFM data</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {typeof customer.totalSpent === 'number' ?
                      `Rs. ${customer.totalSpent.toLocaleString('en-LK')}` :
                      customer.rfm_data?.monetary ?
                      `Rs. ${Number(customer.rfm_data.monetary).toLocaleString('en-LK')}` :
                      'Rs. 0'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={customer.marketing_status === "active" ?
                        "bg-green-50 text-green-700 border-green-200" :
                        customer.marketing_status === "opted_out" ?
                        "bg-amber-50 text-amber-700 border-amber-200" :
                        customer.marketing_status === "deleted" ?
                        "bg-red-50 text-red-700 border-red-200" :
                        customer.marketing_status === "inactive" ?
                        "bg-slate-50 text-slate-700 border-slate-200" :
                        "bg-slate-100 text-slate-700 border-slate-200"
                      }
                    >
                      {customer.marketing_status === "active" ? "Active" :
                       customer.marketing_status === "opted_out" ? "Opted Out" :
                       customer.marketing_status === "deleted" ? "Data Deletion" :
                       customer.marketing_status === "inactive" ? "Inactive" :
                       "Unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewCustomerDetails(customer.id);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          <span>{t('customers.viewDetails')}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Edit className="h-4 w-4" />
                          <span>{t('common.edit')}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Download className="h-4 w-4" />
                          <span>{t('common.export')}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 text-destructive cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash className="h-4 w-4" />
                          <span>{t('common.delete')}</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              // No results
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  No customers found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
        <div>
          {loading ? (
            <Skeleton className="h-5 w-48" />
          ) : (
            <span>
              Showing {customers.length} of {pagination.total} customers
              {searchQuery && <span> matching "{searchQuery}"</span>}
              {segmentFilter !== "all" && <span> in {segmentFilter.replace(/_/g, " ")} segment</span>}
              {marketingStatusFilter && (
                <span> with {marketingStatusFilter.replace('marketing_status_', '').replace(/_/g, ' ')} marketing status</span>
              )}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={loading || pagination.page <= 1}
            onClick={handlePreviousPage}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('common.back')}
          </Button>
          {!loading && pagination.pages > 0 && (
            <span className="mx-2">
              Page {pagination.page} of {pagination.pages}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={loading || pagination.page >= pagination.pages}
            onClick={handleNextPage}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('common.next')}
          </Button>
        </div>
      </div>

      {/* Customer Details Dialog */}
      <CustomerDetailsDialog
        customerId={selectedCustomerId}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />
    </div>
  );
};

export default CustomersPage;
