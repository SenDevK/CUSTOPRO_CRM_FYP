import { Navigate } from "react-router-dom";

// This component is no longer used - redirects to Analytics page
const EnhancedDashboardPage = () => {
  return <Navigate to="/analytics" />;
};

export default EnhancedDashboardPage;

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[200px] mb-2" />
              <Skeleton className="h-4 w-[150px]" />
            </CardHeader>
            <CardContent className="h-80">
              <Skeleton className="h-full w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[200px] mb-2" />
              <Skeleton className="h-4 w-[150px]" />
            </CardHeader>
            <CardContent className="h-80">
              <Skeleton className="h-full w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="page-container">
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <Button onClick={() => window.location.reload()}>
          Retry Loading Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome to CUSTOPRO</h1>
          <p className="text-muted-foreground">
            Customer Management Dashboard
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((metric) => (
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

      {/* Main Dashboard Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 md:w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
        </TabsList>

        {/* Overview Tab - Key insights and metrics */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Revenue Trend Chart */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue for the last 6 months</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {revenueData?.trends?.monthly && revenueData.trends.monthly.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={revenueData.trends.monthly.map((item: any) => ({
                        name: item.month || 'Unknown',
                        value: item.revenue || 0
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `Rs ${value/1000}k`} />
                      <Tooltip formatter={(value) => [`Rs ${Number(value).toLocaleString()}`, 'Revenue']} />
                      <Legend />
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#8884d8"
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        activeDot={{ r: 8 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center">
                    <p className="text-muted-foreground mb-2">Revenue trend data not available</p>
                    <p className="text-xs text-muted-foreground">Check if revenue service is running</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Segments Pie Chart */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Customer Segments</CardTitle>
                <CardDescription>Distribution by value segment</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {segmentationData?.rfmData && segmentationData.rfmData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                      <Legend layout="vertical" verticalAlign="middle" align="right" />
                      <Pie
                        data={segmentationData.rfmData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {segmentationData.rfmData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No segmentation data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest customer interactions and purchases</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerData?.items && customerData.items.slice(0, 5).map((customer: any, index: number) => (
                    <div key={customer.id || index} className="flex items-start space-x-4 p-3 rounded-lg bg-muted/50">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <ShoppingBag className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">{customer.firstName} {customer.lastName}</p>
                        <p className="text-sm text-muted-foreground">
                          {customer.lastPurchase ? `Last purchase on ${new Date(customer.lastPurchase).toLocaleDateString()}` : 'No purchase data'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(customer.totalSpent || 0)}</p>
                        <Badge variant="outline" className="mt-1">
                          {customer.segment?.replace('_', ' ') || 'Unknown'}
                        </Badge>
                      </div>
                    </div>
                  ))}

                  {(!customerData?.items || customerData.items.length === 0) && (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">No recent customer activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => navigate('/customers')}>
                  View All Customers
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Customers Tab - Customer demographics and insights */}
        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Gender Distribution */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Gender Distribution</CardTitle>
                <CardDescription>Customer breakdown by gender</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {segmentationData?.demographicData && segmentationData.demographicData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                      <Legend layout="vertical" verticalAlign="bottom" align="center" />
                      <Pie
                        data={segmentationData.demographicData}
                        cx="50%"
                        cy="40%"
                        labelLine={false}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {segmentationData.demographicData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No demographic data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Growth */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Customer Growth</CardTitle>
                <CardDescription>New customers over time</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {revenueData?.trends?.customer_growth ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={revenueData.trends.customer_growth.map((item: any) => ({
                        name: item.month,
                        value: item.new_customers
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [value, 'New Customers']} />
                      <Legend />
                      <Bar dataKey="value" name="New Customers" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No customer growth data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Preferences */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Customer Preferences</CardTitle>
                <CardDescription>Product category distribution</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {segmentationData?.categoryDistribution && segmentationData.categoryDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={segmentationData.categoryDistribution}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip formatter={(value) => [value, 'Customers']} />
                      <Legend />
                      <Bar dataKey="value" name="Customers" fill="#8884d8" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No preference data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Engagement */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Customer Engagement</CardTitle>
                <CardDescription>Activity metrics</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {revenueData?.overall ? (
                  <div className="h-full flex flex-col justify-center space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Repeat Purchase Rate</p>
                        <p className="text-2xl font-bold">
                          {revenueData.overall.repeat_purchase_rate ?
                            `${revenueData.overall.repeat_purchase_rate.toFixed(1)}%` :
                            'N/A'}
                        </p>
                      </div>
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Activity className="h-5 w-5 text-primary" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Avg. Order Frequency</p>
                        <p className="text-2xl font-bold">
                          {revenueData.overall.average_order_frequency ?
                            revenueData.overall.average_order_frequency.toFixed(1) :
                            'N/A'}
                        </p>
                      </div>
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Customer Retention</p>
                        <p className="text-2xl font-bold">
                          {revenueData.overall.retention_rate ?
                            `${revenueData.overall.retention_rate.toFixed(1)}%` :
                            'N/A'}
                        </p>
                      </div>
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No engagement data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Tab - Revenue analysis and trends */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Revenue Overview */}
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Monthly revenue breakdown</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {revenueData?.trends?.monthly ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={revenueData.trends.monthly.map((item: any) => ({
                        name: item.month,
                        revenue: item.revenue,
                        orders: item.order_count,
                        avg: item.average_order_value
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" tickFormatter={(value) => `Rs ${value/1000}k`} />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === 'revenue') return [`Rs ${Number(value).toLocaleString()}`, 'Revenue'];
                          if (name === 'orders') return [value, 'Orders'];
                          if (name === 'avg') return [`Rs ${Number(value).toLocaleString()}`, 'Avg. Order'];
                          return [value, name];
                        }}
                      />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="revenue"
                        stroke="#8884d8"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="orders"
                        stroke="#82ca9d"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No revenue trend data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Revenue by Segment */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Revenue by Segment</CardTitle>
                <CardDescription>Distribution across customer segments</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {revenueData?.bySegment?.segments ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.entries(revenueData.bySegment.segments).map(([name, data]: [string, any]) => ({
                        name: name.replace(/_/g, ' '),
                        revenue: data.total_revenue,
                        avg: data.average_transaction_value,
                        transactions: data.transaction_count
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `Rs ${value/1000}k`} />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === 'revenue') return [`Rs ${Number(value).toLocaleString()}`, 'Total Revenue'];
                          if (name === 'avg') return [`Rs ${Number(value).toLocaleString()}`, 'Avg. Transaction'];
                          if (name === 'transactions') return [value, 'Transactions'];
                          return [value, name];
                        }}
                      />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No revenue by segment data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Key Revenue Metrics */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
                <CardDescription>Revenue performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                {revenueData?.overall ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                        <Badge variant="outline" className="font-mono">
                          {revenueData.overall.total_revenue ?
                            formatCurrency(revenueData.overall.total_revenue) :
                            'N/A'}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">Avg. Order Value</p>
                        <Badge variant="outline" className="font-mono">
                          {revenueData.overall.average_order_value ?
                            formatCurrency(revenueData.overall.average_order_value) :
                            'N/A'}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                        <Badge variant="outline" className="font-mono">
                          {revenueData.overall.total_orders ?
                            revenueData.overall.total_orders.toLocaleString() :
                            'N/A'}
                        </Badge>
                      </div>
                    </div>

                    <div className="pt-4 border-t space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">Customer LTV</p>
                        <Badge variant="outline" className="font-mono">
                          {revenueData.overall.customer_ltv ?
                            formatCurrency(revenueData.overall.customer_ltv) :
                            'N/A'}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">Revenue Growth</p>
                        <Badge
                          variant={revenueData.overall.revenue_growth > 0 ? "default" : "destructive"}
                          className="font-mono"
                        >
                          {revenueData.overall.revenue_growth ?
                            `${revenueData.overall.revenue_growth > 0 ? '+' : ''}${revenueData.overall.revenue_growth.toFixed(1)}%` :
                            'N/A'}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                        <Badge variant="outline" className="font-mono">
                          {revenueData.overall.conversion_rate ?
                            `${revenueData.overall.conversion_rate.toFixed(1)}%` :
                            'N/A'}
                        </Badge>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">Revenue Forecast</p>
                        <Badge variant="outline" className="font-mono">
                          {revenueData.overall.revenue_forecast ?
                            formatCurrency(revenueData.overall.revenue_forecast) :
                            'N/A'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Projected for next 30 days based on current trends
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No revenue metrics available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Segments Tab - Detailed segmentation analysis */}
        <TabsContent value="segments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* RFM Segmentation */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>RFM Segmentation</CardTitle>
                <CardDescription>Value-based customer segments</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {segmentationData?.rfmData && segmentationData.rfmData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius={90} data={segmentationData.rfmData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name="Customer Distribution"
                        dataKey="value"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                      />
                      <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No RFM segmentation data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preference Segmentation */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Preference Segmentation</CardTitle>
                <CardDescription>Behavior-based customer segments</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {segmentationData?.preferenceData && segmentationData.preferenceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                      <Legend layout="vertical" verticalAlign="middle" align="right" />
                      <Pie
                        data={segmentationData.preferenceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {segmentationData.preferenceData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No preference segmentation data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Material Preferences */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Material Preferences</CardTitle>
                <CardDescription>Customer material preferences</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {segmentationData?.materialDistribution && segmentationData.materialDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={segmentationData.materialDistribution}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip formatter={(value) => [value, 'Customers']} />
                      <Legend />
                      <Bar dataKey="value" name="Customers" fill="#82ca9d" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No material preference data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Segment Trends */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Segment Trends</CardTitle>
                <CardDescription>How segments have changed over time</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {segmentationData?.segmentTrendData && segmentationData.segmentTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        type="category"
                        allowDuplicatedCategory={false}
                        data={monthLabels.map((month, index) => ({ month }))}
                      />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                      <Legend />
                      {segmentationData.segmentTrendData.map((s: any, index: number) => (
                        <Line
                          key={`line-${index}`}
                          dataKey="value"
                          data={s.data.map((value: number, i: number) => ({
                            month: monthLabels[i],
                            value
                          }))}
                          name={s.label}
                          stroke={segmentationData.rfmData[index]?.color || `#${Math.floor(Math.random()*16777215).toString(16)}`}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No segment trend data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Segment Summary */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Segment Summary</CardTitle>
                <CardDescription>Key metrics for each customer segment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-2 text-left">Segment</th>
                        <th className="p-2 text-right">Customers</th>
                        <th className="p-2 text-right">% of Total</th>
                        <th className="p-2 text-right">Avg. Revenue</th>
                        <th className="p-2 text-right">Retention</th>
                      </tr>
                    </thead>
                    <tbody>
                      {segmentationData?.rfmData && revenueData?.bySegment?.segments ? (
                        segmentationData.rfmData.map((segment: any, index: number) => {
                          const segmentKey = segment.name.toLowerCase().replace(/\s+/g, '_');
                          const revenueInfo = revenueData.bySegment.segments[segmentKey];

                          return (
                            <tr key={index} className="border-b">
                              <td className="p-2 flex items-center">
                                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: segment.color }}></div>
                                {segment.name}
                              </td>
                              <td className="p-2 text-right">
                                {revenueInfo?.customer_count?.toLocaleString() || 'N/A'}
                              </td>
                              <td className="p-2 text-right">
                                {segment.value ? `${segment.value}%` : 'N/A'}
                              </td>
                              <td className="p-2 text-right">
                                {revenueInfo?.average_transaction_value ?
                                  formatCurrency(revenueInfo.average_transaction_value) :
                                  'N/A'}
                              </td>
                              <td className="p-2 text-right">
                                {revenueInfo?.retention_rate ?
                                  `${revenueInfo.retention_rate.toFixed(1)}%` :
                                  'N/A'}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-muted-foreground">
                            No segment data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => navigate('/analytics')}>
                  View Detailed Analytics
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedDashboardPage;
