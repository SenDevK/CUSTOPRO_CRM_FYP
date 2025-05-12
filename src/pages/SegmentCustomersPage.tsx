import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSegmentCustomers, getCustomSegments } from '@/services/segmentationApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Download } from 'lucide-react';
import { InfoCircledIcon } from '@radix-ui/react-icons';

export default function SegmentCustomersPage() {
  const { segmentId } = useParams<{ segmentId: string }>();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<any[]>([]);
  const [segmentInfo, setSegmentInfo] = useState<any>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch segment info
        const segments = await getCustomSegments();
        const segment = segments.find(s => s.id === segmentId);
        setSegmentInfo(segment || { name: 'Unknown Segment' });
        
        // Fetch customers
        const data = await getSegmentCustomers(segmentId!, pagination.page, pagination.limit);
        setCustomers(data.customers || []);
        setPagination({
          page: data.page || 1,
          limit: data.limit || 50,
          total: data.total || 0,
          pages: data.pages || 0
        });
      } catch (error) {
        console.error('Error fetching segment customers:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [segmentId, pagination.page]);

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleExportCSV = () => {
    // Create CSV content
    const headers = customers.length > 0 ? Object.keys(customers[0]).join(',') : '';
    const rows = customers.map(customer => 
      Object.values(customer).map(value => 
        typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
      ).join(',')
    );
    
    const csvContent = [headers, ...rows].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${segmentInfo?.name || 'segment'}_customers.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Segment Customers</h1>
        </div>
        
        <Button variant="outline" onClick={handleExportCSV} disabled={customers.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{segmentInfo?.name || 'Loading...'}</CardTitle>
          <CardDescription>
            Viewing customers in this segment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <InfoCircledIcon className="h-4 w-4" />
            <span>
              {loading ? 'Loading...' : `Showing ${customers.length} of ${pagination.total} customers`}
            </span>
          </div>
        </CardContent>
      </Card>
      
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : customers.length > 0 ? (
        <div className="space-y-4">
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  {Object.keys(customers[0]).map(key => (
                    <th key={key} className="p-2 text-left font-medium">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-muted/20' : ''}>
                    {Object.values(customer).map((value, j) => (
                      <td key={j} className="p-2">{value?.toString() || 'N/A'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {pagination.pages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination>
                <Pagination.Content>
                  <Pagination.Item>
                    <Pagination.Previous 
                      onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                      disabled={pagination.page === 1}
                    />
                  </Pagination.Item>
                  
                  {Array.from({ length: Math.min(5, pagination.pages) }).map((_, i) => {
                    let pageNum = pagination.page;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    return (
                      <Pagination.Item key={pageNum}>
                        <Pagination.Link 
                          isActive={pageNum === pagination.page}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Pagination.Link>
                      </Pagination.Item>
                    );
                  })}
                  
                  <Pagination.Item>
                    <Pagination.Next 
                      onClick={() => handlePageChange(Math.min(pagination.pages, pagination.page + 1))}
                      disabled={pagination.page === pagination.pages}
                    />
                  </Pagination.Item>
                </Pagination.Content>
              </Pagination>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <InfoCircledIcon className="h-12 w-12 text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="text-lg font-medium">No Customers Found</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  There are no customers in this segment. This could be because the segment rules are too restrictive or there's an issue with the segment configuration.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
