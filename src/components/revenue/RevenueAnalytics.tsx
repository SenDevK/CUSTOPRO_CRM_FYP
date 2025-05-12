import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Download, Filter, RefreshCw, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import RevenueOverview from './RevenueOverview';
import RevenueTrends from './RevenueTrends';
import RevenueBySegment from './RevenueBySegment';
import { getAllRevenueMetrics } from '@/services/revenueApi';

const RevenueAnalytics = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasZeroRevenue, setHasZeroRevenue] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const checkRevenueData = async () => {
      try {
        const data = await getAllRevenueMetrics();
        if (data.overall_stats && data.overall_stats.total_revenue === 0) {
          setHasZeroRevenue(true);
        } else {
          setHasZeroRevenue(false);
        }
      } catch (error) {
        console.error('Error checking revenue data:', error);
      }
    };

    checkRevenueData();
  }, [refreshKey]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey(prev => prev + 1);

    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>Revenue Analytics</h2>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            className='flex items-center gap-2'
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
          <Button variant='outline' size='sm' className='flex items-center gap-2'>
            <Calendar className='h-4 w-4' />
            <span>Last 30 Days</span>
          </Button>
          <Button variant='outline' size='sm' className='flex items-center gap-2'>
            <Filter className='h-4 w-4' />
            <span>Filters</span>
          </Button>
          <Button variant='outline' size='sm' className='flex items-center gap-2'>
            <Download className='h-4 w-4' />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {hasZeroRevenue && (
        <Alert variant="warning" className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">No Revenue Data</AlertTitle>
          <AlertDescription className="text-amber-700">
            The system found transaction records but no revenue values. This might indicate missing or incorrect transaction amounts in the database.
          </AlertDescription>
        </Alert>
      )}

      <RevenueOverview key={`overview-${refreshKey}`} />

      <div className='grid grid-cols-1 gap-6'>
        <RevenueTrends key={`trends-${refreshKey}`} />
        <RevenueBySegment key={`segments-${refreshKey}`} />
      </div>
    </div>
  );
};

export default RevenueAnalytics;
