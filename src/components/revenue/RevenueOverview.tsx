import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getOverallRevenue } from '@/services/revenueApi';
import { ArrowUpIcon, ArrowDownIcon, ArrowUpRight, ArrowDownRight, DollarSign, ShoppingCart, Users, UserPlus, CreditCard } from 'lucide-react';

interface OverallStats {
  total_revenue: number;
  total_transactions: number;
  total_customers_with_transactions: number;
  average_revenue_per_transaction: number;
  average_revenue_per_customer: number;
  // Optional previous period values for comparison
  previous_period_revenue?: number;
  previous_period_transactions?: number;
  previous_period_customers?: number;
  previous_period_avg_transaction?: number;
  previous_period_avg_customer?: number;
}

const RevenueOverview = () => {
  const [stats, setStats] = useState<OverallStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getOverallRevenue();
        setStats(data);
        setError(null);
      } catch (err) {
        setError('Failed to load revenue statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate percentage change if available
  const getPercentageChange = (value: number, previousValue?: number) => {
    if (!previousValue) return null;
    const change = ((value - previousValue) / previousValue) * 100;
    return change.toFixed(1);
  };

  if (loading) {
    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {[...Array(4)].map((_, i) => (
          <Card key={i} className='animate-pulse'>
            <CardHeader className='pb-2'>
              <div className='h-4 bg-gray-200 rounded w-1/2'></div>
            </CardHeader>
            <CardContent>
              <div className='h-8 bg-gray-200 rounded w-3/4 mb-2'></div>
              <div className='h-4 bg-gray-200 rounded w-1/4'></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error || 'Failed to load revenue statistics'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
          <DollarSign className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{formatCurrency(stats.total_revenue)}</div>
          <div className='flex items-center pt-1'>
            <p className='text-xs text-muted-foreground'>
              From {stats.total_transactions} transactions
            </p>
            {stats.previous_period_revenue && (
              <div className={`ml-2 text-xs flex items-center ${
                getPercentageChange(stats.total_revenue, stats.previous_period_revenue)! >= 0
                  ? 'text-green-500'
                  : 'text-red-500'
              }`}>
                {getPercentageChange(stats.total_revenue, stats.previous_period_revenue)! >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                {Math.abs(parseFloat(getPercentageChange(stats.total_revenue, stats.previous_period_revenue)!))}%
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-sm font-medium'>Avg. Transaction Value</CardTitle>
          <CreditCard className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{formatCurrency(stats.average_revenue_per_transaction)}</div>
          <div className='flex items-center pt-1'>
            <p className='text-xs text-muted-foreground'>
              Per transaction
            </p>
            {stats.previous_period_avg_transaction && (
              <div className={`ml-2 text-xs flex items-center ${
                getPercentageChange(stats.average_revenue_per_transaction, stats.previous_period_avg_transaction)! >= 0
                  ? 'text-green-500'
                  : 'text-red-500'
              }`}>
                {getPercentageChange(stats.average_revenue_per_transaction, stats.previous_period_avg_transaction)! >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                {Math.abs(parseFloat(getPercentageChange(stats.average_revenue_per_transaction, stats.previous_period_avg_transaction)!))}%
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-sm font-medium'>Avg. Customer Value</CardTitle>
          <UserPlus className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{formatCurrency(stats.average_revenue_per_customer)}</div>
          <div className='flex items-center pt-1'>
            <p className='text-xs text-muted-foreground'>
              Per customer
            </p>
            {stats.previous_period_avg_customer && (
              <div className={`ml-2 text-xs flex items-center ${
                getPercentageChange(stats.average_revenue_per_customer, stats.previous_period_avg_customer)! >= 0
                  ? 'text-green-500'
                  : 'text-red-500'
              }`}>
                {getPercentageChange(stats.average_revenue_per_customer, stats.previous_period_avg_customer)! >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                {Math.abs(parseFloat(getPercentageChange(stats.average_revenue_per_customer, stats.previous_period_avg_customer)!))}%
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-sm font-medium'>Customers with Transactions</CardTitle>
          <Users className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.total_customers_with_transactions}</div>
          <div className='flex items-center pt-1'>
            <p className='text-xs text-muted-foreground'>
              Active customers
            </p>
            {stats.previous_period_customers && (
              <div className={`ml-2 text-xs flex items-center ${
                getPercentageChange(stats.total_customers_with_transactions, stats.previous_period_customers)! >= 0
                  ? 'text-green-500'
                  : 'text-red-500'
              }`}>
                {getPercentageChange(stats.total_customers_with_transactions, stats.previous_period_customers)! >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                {Math.abs(parseFloat(getPercentageChange(stats.total_customers_with_transactions, stats.previous_period_customers)!))}%
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueOverview;
