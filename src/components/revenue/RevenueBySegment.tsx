import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getRevenueBySegment } from '@/services/revenueApi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SegmentRevenue {
  total_revenue: number;
  transaction_count: number;
  average_transaction_value: number;
  customer_count?: number;
}

interface SegmentData {
  segments: Record<string, SegmentRevenue>;
  message?: string;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
  transactions?: number;
  customers?: number;
  avgValue?: number;
}

// Enhanced color palette for better visualization
const COLORS = [
  '#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57', '#ffc658',
  '#ff8042', '#ff6361', '#bc5090', '#58508d', '#003f5c', '#7a5195', '#ef5675'
];

const RevenueBySegment = () => {
  const [segmentData, setSegmentData] = useState<SegmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [segmentField, setSegmentField] = useState<string>('value_segment');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getRevenueBySegment(segmentField);
        setSegmentData(data);
        setError(null);
      } catch (err) {
        setError('Failed to load segment revenue data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [segmentField]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Transform data for chart
  const getChartData = (): ChartData[] => {
    if (!segmentData || !segmentData.segments) return [];

    return Object.entries(segmentData.segments).map(([name, data], index) => {
      // If all revenue values are 0, use transaction count as a proxy for visualization
      // This ensures we still see meaningful charts even when revenue data is missing
      const value = data.total_revenue === 0 && data.transaction_count > 0
        ? data.transaction_count
        : data.total_revenue;

      return {
        name,
        value,
        transactions: data.transaction_count,
        customers: data.customer_count,
        avgValue: data.average_transaction_value,
        color: COLORS[index % COLORS.length],
        // Flag to indicate if we're using transaction count instead of revenue
        isUsingTransactionCount: data.total_revenue === 0 && data.transaction_count > 0
      };
    });
  };

  // Sort chart data by revenue (descending)
  const getSortedChartData = (): ChartData[] => {
    return getChartData().sort((a, b) => b.value - a.value);
  };

  // Custom tooltip component for pie chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className='bg-white p-3 border rounded shadow-sm'>
          <p className='font-medium'>{data.name}</p>
          <p style={{ color: data.color }}>Revenue: {formatCurrency(data.value)}</p>
          <p>Transactions: {data.transactions}</p>
          {data.customers && <p>Customers: {data.customers}</p>}
          <p>Avg. Value: {formatCurrency(data.avgValue || 0)}</p>
          {data.isUsingTransactionCount && (
            <p className="text-amber-600 text-xs mt-1">
              Note: Using transaction count for visualization (no revenue data).
            </p>
          )}
          {data.value === 0 && data.transactions > 0 && !data.isUsingTransactionCount && (
            <p className="text-amber-600 text-xs mt-1">
              Note: This segment has transactions but no revenue data.
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip component for bar chart
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className='bg-white p-3 border rounded shadow-sm'>
          <p className='font-medium'>{data.name}</p>
          <p style={{ color: payload[0].color }}>Revenue: {formatCurrency(data.value)}</p>
          <p>Transactions: {data.transactions}</p>
          {data.customers && <p>Customers: {data.customers}</p>}
          {data.isUsingTransactionCount && (
            <p className="text-amber-600 text-xs mt-1">
              Note: Using transaction count for visualization (no revenue data).
            </p>
          )}
          {data.value === 0 && data.transactions > 0 && !data.isUsingTransactionCount && (
            <p className="text-amber-600 text-xs mt-1">
              Note: This segment has transactions but no revenue data.
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Segment</CardTitle>
          <CardDescription>Loading segment data...</CardDescription>
        </CardHeader>
        <CardContent className='h-80 animate-pulse bg-gray-100'></CardContent>
      </Card>
    );
  }

  if (error || !segmentData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error || 'Failed to load segment revenue data'}</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = getChartData();
  const sortedChartData = getSortedChartData();

  // Display a message if there's one in the response
  if (segmentData?.message) {
    console.log("Segment data message:", segmentData.message);
  }

  return (
    <Card className='col-span-full'>
      <CardHeader className='flex flex-row items-center justify-between'>
        <div>
          <CardTitle>Revenue by Segment</CardTitle>
          <CardDescription>
            Revenue breakdown by {
              segmentField === 'value_segment' ? 'value segment' :
              segmentField === 'demographic_segment' ? 'demographic segment' :
              'preference segment'
            }
            {segmentData?.message && <span className="block text-xs text-amber-600 mt-1">{segmentData.message}</span>}
          </CardDescription>
        </div>
        <Select value={segmentField} onValueChange={setSegmentField}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Select segment type' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='value_segment'>Value Segment</SelectItem>
            <SelectItem value='demographic_segment'>Demographic Segment</SelectItem>
            <SelectItem value='preference_segment'>Preference Segment</SelectItem>
            <SelectItem value='store_location'>Store Location</SelectItem>
            <SelectItem value='payment_method'>Payment Method</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pie" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="pie">Pie Chart</TabsTrigger>
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>

          <TabsContent value="pie" className="w-full">
            <div className='h-96'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    outerRadius={130}
                    fill='#8884d8'
                    dataKey='value'
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend layout="vertical" verticalAlign="middle" align="right" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="bar" className="w-full">
            <div className='h-96'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={sortedChartData} layout="vertical" margin={{ left: 120 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend />
                  <Bar dataKey="value" name="Revenue" radius={[0, 4, 4, 0]}>
                    {sortedChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="table" className="w-full">
            <div className="max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Segment</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Transactions</TableHead>
                    {Object.values(segmentData.segments)[0]?.customer_count !== undefined && (
                      <TableHead>Customers</TableHead>
                    )}
                    <TableHead>Avg. Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(segmentData.segments)
                    .sort(([, a], [, b]) => b.total_revenue - a.total_revenue)
                    .map(([name, data]) => (
                      <TableRow key={name}>
                        <TableCell className='font-medium'>{name}</TableCell>
                        <TableCell>{formatCurrency(data.total_revenue)}</TableCell>
                        <TableCell>{data.transaction_count}</TableCell>
                        {data.customer_count !== undefined && (
                          <TableCell>{data.customer_count}</TableCell>
                        )}
                        <TableCell>{formatCurrency(data.average_transaction_value)}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RevenueBySegment;
