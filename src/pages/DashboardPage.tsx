
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowDown, ArrowUp, TrendingUp, Users, DollarSign, BarChart2, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { dashboardMetrics, segmentData, revenueData, customerGrowthData, monthLabels } from "@/data/mockData";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { getDefaultDashboardConfig, getDashboardConfigById, DashboardConfig } from "@/services/dashboardApi";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const configId = searchParams.get('config');

  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // Format currency
  const formatCurrency = (value: number) => {
    return `Rs. ${value.toLocaleString('en-LK')}`;
  };

  // Load dashboard configuration
  useEffect(() => {
    const loadDashboardConfig = async () => {
      setLoading(true);
      try {
        let config = null;

        if (configId) {
          // Load specific configuration
          config = await getDashboardConfigById(configId);
        } else {
          // Load default configuration
          config = await getDefaultDashboardConfig();
        }

        setDashboardConfig(config);
      } catch (error) {
        console.error('Error loading dashboard configuration:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardConfig();
  }, [configId]);

  // Render a visualization based on its configuration
  const renderVisualization = (item: any) => {
    // Handle data source based visualizations
    if (item.type === 'data-source') {
      const sourceId = item.sourceId;

      // Demographic segmentation
      if (sourceId === 'demographic') {
        if (item.visualizationType === 'pie') {
          return (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
                <Pie
                  data={segmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {segmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          );
        } else if (item.visualizationType === 'bar') {
          return (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={segmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Percentage" fill="#7E69AB" />
              </BarChart>
            </ResponsiveContainer>
          );
        } else if (item.visualizationType === 'table') {
          return (
            <div className="h-full overflow-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-2 text-left">Segment</th>
                    <th className="p-2 text-right">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {segmentData.map((segment, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2 flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: segment.color }}></div>
                        {segment.name}
                      </td>
                      <td className="p-2 text-right">{segment.value}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
      }

      // RFM segmentation
      else if (sourceId === 'rfm') {
        if (item.visualizationType === 'pie') {
          return (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
                <Pie
                  data={segmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {segmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          );
        }
      }

      // Revenue analysis
      else if (sourceId === 'revenue' || sourceId === 'sales') {
        if (item.visualizationType === 'line') {
          return (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthLabels.map((month, i) => ({ name: month, value: revenueData.data[i] }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `Rs ${value/1000}k`} />
                <Tooltip formatter={(value) => [`Rs ${value.toLocaleString()}`, 'Revenue']} />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#7E69AB" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          );
        } else if (item.visualizationType === 'bar') {
          return (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthLabels.map((month, i) => ({ name: month, value: revenueData.data[i] }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `Rs ${value/1000}k`} />
                <Tooltip formatter={(value) => [`Rs ${value.toLocaleString()}`, 'Revenue']} />
                <Legend />
                <Bar dataKey="value" name="Revenue" fill="#7E69AB" />
              </BarChart>
            </ResponsiveContainer>
          );
        }
      }

      // Marketing performance
      else if (sourceId === 'marketing') {
        if (item.visualizationType === 'bar') {
          return (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthLabels.map((month, i) => ({ name: month, value: customerGrowthData.data[i] }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="New Customers" fill="#7E69AB" />
              </BarChart>
            </ResponsiveContainer>
          );
        }
      }
    }

    // Legacy visualization types
    switch (item.visualizationType) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              <Legend layout="vertical" verticalAlign="middle" align="right" />
              <Pie
                data={segmentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {segmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthLabels.map((month, i) => ({ name: month, value: customerGrowthData.data[i] }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Customers" fill="#7E69AB" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthLabels.map((month, i) => ({ name: month, value: revenueData.data[i] }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `Rs ${value/1000}k`} />
              <Tooltip formatter={(value) => [`Rs ${value.toLocaleString()}`, 'Revenue']} />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#7E69AB" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthLabels.map((month, i) => ({ name: month, value: revenueData.data[i] }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `Rs ${value/1000}k`} />
              <Tooltip formatter={(value) => [`Rs ${value.toLocaleString()}`, 'Value']} />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#7E69AB" strokeWidth={2} fill="#7E69AB" fillOpacity={0.2} />
            </LineChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Visualization not available</p>
          </div>
        );
    }
  };

  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, Eegent Fashion</h1>
          <p className="text-muted-foreground">
            {dashboardConfig
              ? `Viewing ${dashboardConfig.name}${dashboardConfig.isDefault ? ' (Default)' : ''}`
              : "Here's what's happening with your customer data today."}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard-builder')}
        >
          <Settings className="h-4 w-4 mr-2" />
          Customize Dashboard
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {dashboardMetrics.map((metric) => (
          <Card key={metric.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.name}</p>
                  <h2 className="text-3xl font-bold mt-1">
                    {metric.name.includes("Value") ? formatCurrency(metric.value) :
                     metric.name.includes("Rate") ? `${metric.value}%` :
                     metric.value.toLocaleString()}
                  </h2>
                </div>
                <div className={`p-2 rounded-full ${
                  metric.trend === "up" ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" :
                  metric.trend === "down" && metric.name.includes("Churn") ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" :
                  metric.trend === "down" ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300" :
                  "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}>
                  {metric.trend === "up" ? <TrendingUp className="h-5 w-5" /> :
                   metric.trend === "down" ? <ArrowDown className="h-5 w-5" /> :
                   <BarChart2 className="h-5 w-5" />}
                </div>
              </div>
              <div className="flex items-center mt-3">
                <span className={`text-sm font-medium ${
                  metric.trend === "up" && !metric.name.includes("Churn") ? "text-green-600 dark:text-green-400" :
                  metric.trend === "down" && metric.name.includes("Churn") ? "text-green-600 dark:text-green-400" :
                  metric.trend === "down" ? "text-red-600 dark:text-red-400" :
                  "text-gray-600 dark:text-gray-400"
                }`}>
                  {metric.change}%
                </span>
                <span className="text-sm text-muted-foreground ml-1">
                  {metric.trend === "up" ? "increase" :
                   metric.trend === "down" ? "decrease" :
                   "no change"} from last month
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Custom Dashboard */}
      {dashboardConfig && dashboardConfig.items.length > 0 ? (
        <div className={`grid ${dashboardConfig.layout === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}>
          {dashboardConfig.items.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-2">
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>
                  {item.type === 'segment' ? 'Segment visualization' :
                   item.type === 'combined' ? 'Combined segments' :
                   'Trend analysis'}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {renderVisualization(item)}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Default Dashboard
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList className="grid grid-cols-3 md:w-[400px]">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="segments">Segments</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Monthly revenue for the last 6 months</CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthLabels.map((month, i) => ({ name: month, value: revenueData.data[i] }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `Rs ${value/1000}k`} />
                    <Tooltip formatter={(value) => [`Rs ${value.toLocaleString()}`, 'Revenue']} />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#7E69AB" strokeWidth={2} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Customer Growth</CardTitle>
                <CardDescription>New customers over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthLabels.map((month, i) => ({ name: month, value: customerGrowthData.data[i] }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="New Customers" fill="#7E69AB" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="segments" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="md:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle>Customer Segments</CardTitle>
                  <CardDescription>Distribution of customer segments</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                      <Legend layout="vertical" verticalAlign="middle" align="right" />
                      <Pie
                        data={segmentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {segmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="md:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle>Segment Details</CardTitle>
                  <CardDescription>Key metrics for each segment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {segmentData.map((segment) => (
                      <div key={segment.name} className="flex items-center">
                        <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: segment.color }}></div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="font-medium">{segment.name}</span>
                            <span>{segment.value}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                            <div
                              className="h-2 rounded-full"
                              style={{ width: `${segment.value}%`, backgroundColor: segment.color }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-primary mr-2" />
                        <span>Total Customers</span>
                      </div>
                      <span className="font-bold">1,856</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-primary mr-2" />
                        <span>Avg. CLV</span>
                      </div>
                      <span className="font-bold">Rs. 45,300</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default DashboardPage;
