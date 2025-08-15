import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSegmentAnalytics, getCustomSegments } from '@/services/segmentationApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';

// Define colors for consistent visualization
const COLORS = {
  gender: {
    Male: '#8884d8',
    Female: '#ff8042',
    Other: '#00C49F',
    Unknown: '#AAAAAA'
  },
  age: {
    'Under18': '#8884d8',
    'YoungAdult': '#83a6ed',
    'Millennial': '#8dd1e1',
    'GenX_Young': '#82ca9d',
    'GenX_Older': '#a4de6c',
    'BabyBoomer': '#d0ed57',
    'Senior': '#ffc658',
    'Elderly': '#ff8042',
    'Unknown': '#AAAAAA',
  },
  rfm: {
    'Champions': '#8884d8',
    'Loyal Customers': '#83a6ed',
    'Potential Loyalists': '#8dd1e1',
    'New Customers': '#82ca9d',
    'Promising': '#a4de6c',
    'Needs Attention': '#d0ed57',
    'At Risk': '#ffc658',
    'Cant Lose Them': '#ff8042',
    'Hibernating': '#AAAAAA',
    'Lost': '#FF0000',
  }
};

export default function SegmentAnalyticsPage() {
  const { segmentId } = useParams<{ segmentId: string }>();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [segmentInfo, setSegmentInfo] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch segment info
        const segments = await getCustomSegments();
        const segment = segments.find(s => s.id === segmentId);
        setSegmentInfo(segment || { name: 'Unknown Segment' });
        
        // Fetch analytics
        const data = await getSegmentAnalytics(segmentId!);
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching segment analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [segmentId]);

  // Helper function to convert object to array for charts
  const objectToChartData = (obj: Record<string, number>, colorMap: Record<string, string> = {}) => {
    return Object.entries(obj || {}).map(([name, value]) => ({
      name,
      value,
      color: colorMap[name] || `hsl(${Math.random() * 360}, 70%, 60%)`
    }));
  };

  // Prepare chart data
  const genderData = analytics ? objectToChartData(analytics.gender_distribution, COLORS.gender) : [];
  const ageData = analytics ? objectToChartData(analytics.age_distribution, COLORS.age) : [];
  const rfmData = analytics ? objectToChartData(analytics.rfm_distribution, COLORS.rfm) : [];
  const purchaseData = analytics ? objectToChartData(analytics.purchase_distribution) : [];
  const preferenceData = analytics ? objectToChartData(analytics.preference_distribution) : [];

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Segment Analytics</h1>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{segmentInfo?.name || 'Loading...'}</CardTitle>
          <CardDescription>
            Detailed analytics for this customer segment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <InfoCircledIcon className="h-4 w-4" />
            <span>
              {loading ? 'Loading...' : `Analyzing ${analytics?.customer_count?.toLocaleString() || 0} customers in this segment`}
            </span>
          </div>
        </CardContent>
      </Card>
      
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <Skeleton className="h-full w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : analytics ? (
        <Tabs defaultValue="demographics">
          <TabsList className="mb-6">
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
            <TabsTrigger value="purchasing">Purchasing Behavior</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>
          
          <TabsContent value="demographics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gender Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Gender Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {genderData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={genderData}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {genderData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [value, 'Customers']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No gender data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Age Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Age Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {ageData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ageData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={70}
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis />
                          <Tooltip
                            formatter={(value) => [`${value.toLocaleString()} customers`, 'Count']}
                            labelFormatter={(label) => `Age Group: ${label}`}
                          />
                          <Legend />
                          <Bar dataKey="value" name="Customers" radius={[4, 4, 0, 0]}>
                            {ageData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No age data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="purchasing">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* RFM Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>RFM Segments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {rfmData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={rfmData}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {rfmData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [value, 'Customers']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No RFM data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Purchase Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Purchase Frequency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {purchaseData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={purchaseData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={70}
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis />
                          <Tooltip
                            formatter={(value) => [`${value.toLocaleString()} customers`, 'Count']}
                          />
                          <Legend />
                          <Bar dataKey="value" name="Customers" radius={[4, 4, 0, 0]}>
                            {purchaseData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No purchase data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Preference Segments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  {preferenceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={preferenceData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={70}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [`${value.toLocaleString()} customers`, 'Count']}
                        />
                        <Legend />
                        <Bar dataKey="value" name="Customers" radius={[4, 4, 0, 0]}>
                          {preferenceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No preference data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <InfoCircledIcon className="h-12 w-12 text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="text-lg font-medium">No Analytics Available</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  We couldn't retrieve analytics for this segment. This could be because the segment is empty or there's an issue with the analytics service.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
