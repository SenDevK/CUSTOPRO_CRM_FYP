import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getRevenueTrends } from '@/services/revenueApi';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TrendData {
  period: string;
  revenue: number;
}

interface CumulativeData {
  period: string;
  cumulative_revenue: number;
}

interface RevenueTrendsData {
  trend: TrendData[];
  cumulative: CumulativeData[];
}

const RevenueTrends = () => {
  const [trendsData, setTrendsData] = useState<RevenueTrendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'D' | 'W' | 'M' | 'Y'>('M');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getRevenueTrends(period);
        setTrendsData(data);
        setError(null);
      } catch (err) {
        setError('Failed to load revenue trends');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  // Format currency for tooltip
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-white p-3 border rounded shadow-sm'>
          <p className='font-medium'>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Format period label for better display
  const formatPeriodLabel = (period: string): string => {
    if (!period) return 'All Time'; // Default label for null periods

    // Handle different period formats
    if (period.match(/^\d{4}-\d{2}$/)) {
      // Monthly format (YYYY-MM)
      const [year, month] = period.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } else if (period.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Daily format (YYYY-MM-DD)
      const date = new Date(period);
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    } else if (period.match(/^\d{4}-\d{1,2}$/)) {
      // Weekly format (YYYY-W)
      const [year, week] = period.split('-');
      return `Week ${week}, ${year}`;
    }

    return period;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
          <CardDescription>Loading revenue trend data...</CardDescription>
        </CardHeader>
        <CardContent className='h-80 animate-pulse bg-gray-100'></CardContent>
      </Card>
    );
  }

  if (error || !trendsData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error || 'Failed to load revenue trends'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='col-span-full'>
      <CardHeader className='flex flex-row items-center justify-between'>
        <div>
          <CardTitle>Revenue Trends</CardTitle>
          <CardDescription>Revenue over time by {period === 'D' ? 'day' : period === 'W' ? 'week' : period === 'M' ? 'month' : 'year'}</CardDescription>
        </div>
        <Select value={period} onValueChange={(value) => setPeriod(value as 'D' | 'W' | 'M' | 'Y')}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Select period' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='D'>Daily</SelectItem>
            <SelectItem value='W'>Weekly</SelectItem>
            <SelectItem value='M'>Monthly</SelectItem>
            <SelectItem value='Y'>Yearly</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue='trend'>
          <TabsList className='mb-4'>
            <TabsTrigger value='trend'>Revenue Trend</TabsTrigger>
            <TabsTrigger value='cumulative'>Cumulative Revenue</TabsTrigger>
          </TabsList>
          <TabsContent value='trend' className='h-96'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart
                data={trendsData.trend.map(item => ({
                  ...item,
                  formattedPeriod: formatPeriodLabel(item.period)
                }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis
                  dataKey='formattedPeriod'
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  interval={0}
                />
                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                <Tooltip
                  content={<CustomTooltip />}
                  formatter={(value: any) => formatCurrency(value)}
                  labelFormatter={(label) => label}
                />
                <Legend />
                <Bar
                  dataKey='revenue'
                  name='Revenue'
                  fill='#8884d8'
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value='cumulative' className='h-96'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart
                data={trendsData.cumulative.map(item => ({
                  ...item,
                  formattedPeriod: formatPeriodLabel(item.period)
                }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis
                  dataKey='formattedPeriod'
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  interval={0}
                />
                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                <Tooltip
                  content={<CustomTooltip />}
                  formatter={(value: any) => formatCurrency(value)}
                  labelFormatter={(label) => label}
                />
                <Legend />
                <Line
                  type='monotone'
                  dataKey='cumulative_revenue'
                  name='Cumulative Revenue'
                  stroke='#8884d8'
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RevenueTrends;
