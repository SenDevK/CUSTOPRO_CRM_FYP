import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { InfoCircledIcon, StarIcon, PersonIcon } from '@radix-ui/react-icons'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'

export function ValueBasedTab({ rfmData, avgValues }) {
  // Calculate total customers
  const totalCustomers = rfmData.reduce((sum, item) => sum + item.value, 0)

  // Find top segment
  const topSegment = rfmData.reduce(
    (max, item) => (item.value > max.value ? item : max),
    { name: '', value: 0 }
  )

  // Group segments into categories
  const highValueSegments = ['Champions', 'Loyal Customers', 'Potential Loyalists']
  const atRiskSegments = ['At Risk (High Frequency)', 'At Risk (High Value)', 'Lost Customers']
  const newSegments = ['New Customers']

  // Calculate customers in each category
  const highValueCount = rfmData
    .filter(item => highValueSegments.includes(item.name))
    .reduce((sum, item) => sum + item.value, 0)

  const atRiskCount = rfmData
    .filter(item => atRiskSegments.includes(item.name))
    .reduce((sum, item) => sum + item.value, 0)

  const newCount = rfmData
    .filter(item => newSegments.includes(item.name))
    .reduce((sum, item) => sum + item.value, 0)

  // Calculate percentages
  const highValuePercentage = Math.round((highValueCount / totalCustomers) * 100)
  const atRiskPercentage = Math.round((atRiskCount / totalCustomers) * 100)
  const newPercentage = Math.round((newCount / totalCustomers) * 100)

  // Prepare radar chart data
  const radarData = avgValues ? Object.entries(avgValues).map(([segment, values]: [string, any]) => ({
    segment,
    recency: values.recency,
    frequency: values.frequency,
    monetary: values.monetary / 1000 // Scale down for better visualization
  })) : [];

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Value-Based Segmentation
            <Badge variant="outline" className="ml-2">RFM Analysis</Badge>
          </CardTitle>
          <CardDescription>
            Customer segmentation based on purchase behavior
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 mb-4 bg-slate-50 rounded-lg border border-slate-100">
            <h3 className="text-sm font-medium mb-2">What is Value-Based Segmentation?</h3>
            <p className="text-sm text-muted-foreground">
              Value-based segmentation (RFM analysis) groups customers based on their purchasing behavior using three key metrics:
            </p>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                <span><span className="font-medium text-blue-600">Recency</span> - How recently they purchased</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="h-2 w-2 rounded-full bg-green-600"></div>
                <span><span className="font-medium text-green-600">Frequency</span> - How often they purchase</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="h-2 w-2 rounded-full bg-purple-600"></div>
                <span><span className="font-medium text-purple-600">Monetary</span> - How much they spend</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted rounded-lg p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-medium text-muted-foreground">High-Value Customers</h3>
                <StarIcon className="h-5 w-5 text-amber-500" />
              </div>
              <p className="text-2xl font-bold mt-2">{highValueCount.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {highValuePercentage}% of your customer base
              </p>
              <Progress value={highValuePercentage} className="mt-2" />
              <div className="flex items-center gap-2 mt-2">
                <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                <span className="text-xs text-muted-foreground">Champions, Loyal Customers, Potential Loyalists</span>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-medium text-muted-foreground">At-Risk Customers</h3>
                <InfoCircledIcon className="h-5 w-5 text-red-500" />
              </div>
              <p className="text-2xl font-bold mt-2">{atRiskCount.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {atRiskPercentage}% of your customer base
              </p>
              <Progress value={atRiskPercentage} className="mt-2" />
              <div className="flex items-center gap-2 mt-2">
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                <span className="text-xs text-muted-foreground">At Risk (High Frequency), At Risk (High Value), Lost</span>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-medium text-muted-foreground">New Customers</h3>
                <PersonIcon className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold mt-2">{newCount.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {newPercentage}% of your customer base
              </p>
              <Progress value={newPercentage} className="mt-2" />
              <div className="flex items-center gap-2 mt-2">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span className="text-xs text-muted-foreground">New Customers, First-time buyers</span>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 border rounded-md bg-slate-50">
              <h4 className="text-xs font-medium mb-2">RFM Segmentation Components</h4>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                <li>Recency: Time since last purchase</li>
                <li>Frequency: Number of purchases</li>
                <li>Monetary: Total spending amount</li>
                <li>Combined RFM score: 1-5 for each dimension</li>
              </ul>
            </div>
            <div className="p-3 border rounded-md bg-slate-50">
              <h4 className="text-xs font-medium mb-2">Data Quality</h4>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs">Segment Coverage:</span>
                <Badge variant="outline" className={
                  rfmData.length >= 7 ?
                  "bg-green-50 text-green-700" :
                  rfmData.length >= 4 ?
                  "bg-amber-50 text-amber-700" :
                  "bg-red-50 text-red-700"
                }>
                  {rfmData.length >= 7 ?
                    "Comprehensive" :
                    rfmData.length >= 4 ?
                    "Moderate" :
                    "Limited"
                  }
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {rfmData.length} distinct customer segments identified from RFM analysis
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Value Segment Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Value Segments</CardTitle>
          <CardDescription>
            How your customers are distributed across value segments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="chart">
            <TabsList className="mb-4">
              <TabsTrigger value="chart">Visual View</TabsTrigger>
              <TabsTrigger value="table">Detailed View</TabsTrigger>
              <TabsTrigger value="details">Segment Details</TabsTrigger>
            </TabsList>

            <TabsContent value="chart">
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-sm text-muted-foreground">
                    This chart shows the distribution of your customers across different value segments based on RFM analysis.
                    Each segment represents a specific pattern of customer behavior in terms of recency, frequency, and monetary value.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Tooltip
                          formatter={(value) => [`${value} customers (${Math.round((value/totalCustomers)*100)}%)`, 'Count']}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                        <Pie
                          data={rfmData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {rfmData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Legend formatter={(value) => <span className="text-sm">{value}</span>} />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Segment Breakdown</h3>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        Top {Math.min(5, rfmData.length)} Segments
                      </Badge>
                    </div>
                    <div className="space-y-4">
                      {rfmData.slice(0, 5).map((segment) => (
                        <div key={segment.name} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }}></div>
                              <div className="font-medium">{segment.name}</div>
                            </div>
                            <div className="font-medium">{segment.value} customers</div>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${(segment.value / totalCustomers) * 100}%`,
                                backgroundColor: segment.color
                              }}
                            />
                          </div>
                          <div className="text-xs text-muted-foreground text-right">
                            {Math.round((segment.value / totalCustomers) * 100)}% of customers
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 border rounded-md">
                    <h4 className="text-sm font-medium mb-2">Largest Segment</h4>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: rfmData.reduce((max, item) => item.value > max.value ? item : max, {value: 0})?.color + '30',
                          color: rfmData.reduce((max, item) => item.value > max.value ? item : max, {value: 0})?.color
                        }}>
                        <span className="text-lg font-bold">
                          {rfmData.reduce((max, item) => item.value > max.value ? item : max, {value: 0})?.name?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {rfmData.reduce((max, item) => item.value > max.value ? item : max, {value: 0})?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round((rfmData.reduce((max, item) => item.value > max.value ? item : max, {value: 0})?.value / totalCustomers) * 100) || 0}% of customers
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 border rounded-md">
                    <h4 className="text-sm font-medium mb-2">Value Distribution</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-muted-foreground">Low Value</span>
                      <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-red-300 via-amber-300 to-green-500"></div>
                      <span className="text-xs text-muted-foreground">High Value</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {highValuePercentage > 40 ?
                        "Your customer base has a high proportion of valuable customers" :
                        highValuePercentage > 20 ?
                        "Your customer base has a balanced value distribution" :
                        "Your customer base has a low proportion of high-value customers"}
                    </p>
                  </div>

                  <div className="p-3 border rounded-md">
                    <h4 className="text-sm font-medium mb-2">Segment Count</h4>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs">Total Segments:</span>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {rfmData.length} segments
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {rfmData.length >= 7 ?
                        "Your RFM analysis provides a detailed view of customer value segments" :
                        rfmData.length >= 4 ?
                        "Your RFM analysis provides a moderate level of segmentation detail" :
                        "Your RFM analysis provides a basic level of segmentation detail"
                      }
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="table">
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-sm text-muted-foreground">
                    This table provides detailed information about each customer segment, including the number of customers,
                    percentage of your customer base, and a description of the segment characteristics.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Segment</th>
                        <th className="text-right py-2">Customer Count</th>
                        <th className="text-right py-2">Percentage</th>
                        <th className="text-left py-2">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rfmData.map((segment) => (
                        <tr key={segment.name} className="border-b">
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }}></div>
                              <span className="font-medium">{segment.name}</span>
                            </div>
                          </td>
                          <td className="text-right py-3">{segment.value.toLocaleString()}</td>
                          <td className="text-right py-3">
                            {Math.round((segment.value / totalCustomers) * 100)}%
                          </td>
                          <td className="py-3 text-sm">
                            {segment.name === 'Champions' && 'High recency, frequency, and monetary values (R:4-5, F:4-5, M:4-5)'}
                            {segment.name === 'Loyal Customers' && 'Moderate to high values across all RFM dimensions (R:3-5, F:3-5, M:3-5)'}
                            {segment.name === 'Potential Loyalists' && 'High recency with moderate frequency and monetary (R:3-5, F:2-3, M:2-3)'}
                            {segment.name === 'At Risk (High Frequency)' && 'Low recency with high frequency (R:1-2, F:4-5, M:1-5)'}
                            {segment.name === 'At Risk (High Value)' && 'Low recency with high monetary value (R:1-2, F:1-5, M:4-5)'}
                            {segment.name === 'Lost Customers' && 'Low values across all RFM dimensions (R:1, F:1-2, M:1-2)'}
                            {segment.name === 'New Customers' && 'High recency with low frequency (R:4-5, F:1, M:1-3)'}
                            {segment.name === 'Regular Customers' && 'Moderate values across all RFM dimensions (R:2-3, F:2-3, M:2-3)'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details">
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-sm text-muted-foreground">
                    This view provides detailed information about each RFM segment, including typical characteristics and
                    the RFM score ranges that define each segment.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-md">
                    <h3 className="text-sm font-medium mb-3">Understanding RFM Segments</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      RFM segmentation divides customers into groups based on their purchasing behavior. Each segment has
                      distinct characteristics in terms of recency, frequency, and monetary value.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                        <span className="text-xs"><span className="font-medium">High RFM Score:</span> High values across all three dimensions (R, F, M)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                        <span className="text-xs"><span className="font-medium">Medium RFM Score:</span> Moderate values across all three dimensions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500"></div>
                        <span className="text-xs"><span className="font-medium">Low Recency:</span> Low recency score with varying frequency and monetary</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                        <span className="text-xs"><span className="font-medium">High Recency, Low Frequency:</span> Recent purchases but few of them</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-md">
                    <h3 className="text-sm font-medium mb-3">RFM Score Explanation</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Each customer receives a score from 1-5 for each RFM component, with 5 being the best. These scores are
                      combined to create segments.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                        <span className="text-xs"><span className="font-medium">Recency (R):</span> How recently a customer made a purchase</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                        <span className="text-xs"><span className="font-medium">Frequency (F):</span> How often a customer makes purchases</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                        <span className="text-xs"><span className="font-medium">Monetary (M):</span> How much a customer spends</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Segment Definitions</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 border rounded-md bg-gradient-to-br from-green-50 to-transparent">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-4 w-4 rounded-full bg-green-500"></div>
                        <h4 className="font-medium">Champions</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Customers who have purchased recently, purchase frequently, and spend significant amounts.
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 bg-white rounded-md">
                          <span className="text-xs text-muted-foreground">Recency</span>
                          <p className="font-medium text-sm">4-5</p>
                        </div>
                        <div className="p-2 bg-white rounded-md">
                          <span className="text-xs text-muted-foreground">Frequency</span>
                          <p className="font-medium text-sm">4-5</p>
                        </div>
                        <div className="p-2 bg-white rounded-md">
                          <span className="text-xs text-muted-foreground">Monetary</span>
                          <p className="font-medium text-sm">4-5</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 border rounded-md bg-gradient-to-br from-green-50 to-transparent">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-4 w-4 rounded-full bg-green-400"></div>
                        <h4 className="font-medium">Loyal Customers</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Customers who purchase regularly with moderate to high recency, frequency, and monetary values.
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 bg-white rounded-md">
                          <span className="text-xs text-muted-foreground">Recency</span>
                          <p className="font-medium text-sm">3-5</p>
                        </div>
                        <div className="p-2 bg-white rounded-md">
                          <span className="text-xs text-muted-foreground">Frequency</span>
                          <p className="font-medium text-sm">3-5</p>
                        </div>
                        <div className="p-2 bg-white rounded-md">
                          <span className="text-xs text-muted-foreground">Monetary</span>
                          <p className="font-medium text-sm">3-5</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 border rounded-md bg-gradient-to-br from-amber-50 to-transparent">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-4 w-4 rounded-full bg-amber-500"></div>
                        <h4 className="font-medium">Potential Loyalists</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Recent customers with moderate frequency and spending values.
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 bg-white rounded-md">
                          <span className="text-xs text-muted-foreground">Recency</span>
                          <p className="font-medium text-sm">3-5</p>
                        </div>
                        <div className="p-2 bg-white rounded-md">
                          <span className="text-xs text-muted-foreground">Frequency</span>
                          <p className="font-medium text-sm">2-3</p>
                        </div>
                        <div className="p-2 bg-white rounded-md">
                          <span className="text-xs text-muted-foreground">Monetary</span>
                          <p className="font-medium text-sm">2-3</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 border rounded-md bg-gradient-to-br from-red-50 to-transparent">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-4 w-4 rounded-full bg-red-500"></div>
                        <h4 className="font-medium">At Risk Customers</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Customers with low recency scores but moderate to high frequency and monetary values.
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 bg-white rounded-md">
                          <span className="text-xs text-muted-foreground">Recency</span>
                          <p className="font-medium text-sm">1-2</p>
                        </div>
                        <div className="p-2 bg-white rounded-md">
                          <span className="text-xs text-muted-foreground">Frequency</span>
                          <p className="font-medium text-sm">3-5</p>
                        </div>
                        <div className="p-2 bg-white rounded-md">
                          <span className="text-xs text-muted-foreground">Monetary</span>
                          <p className="font-medium text-sm">3-5</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 border rounded-md bg-gradient-to-br from-blue-50 to-transparent">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-4 w-4 rounded-full bg-blue-500"></div>
                        <h4 className="font-medium">New Customers</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Customers with high recency scores but low frequency and moderate monetary values.
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 bg-white rounded-md">
                          <span className="text-xs text-muted-foreground">Recency</span>
                          <p className="font-medium text-sm">4-5</p>
                        </div>
                        <div className="p-2 bg-white rounded-md">
                          <span className="text-xs text-muted-foreground">Frequency</span>
                          <p className="font-medium text-sm">1</p>
                        </div>
                        <div className="p-2 bg-white rounded-md">
                          <span className="text-xs text-muted-foreground">Monetary</span>
                          <p className="font-medium text-sm">1-3</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 border rounded-md bg-gradient-to-br from-slate-50 to-transparent">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-4 w-4 rounded-full bg-slate-500"></div>
                        <h4 className="font-medium">Lost Customers</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Customers with low scores across all three RFM dimensions.
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 bg-white rounded-md">
                          <span className="text-xs text-muted-foreground">Recency</span>
                          <p className="font-medium text-sm">1</p>
                        </div>
                        <div className="p-2 bg-white rounded-md">
                          <span className="text-xs text-muted-foreground">Frequency</span>
                          <p className="font-medium text-sm">1-2</p>
                        </div>
                        <div className="p-2 bg-white rounded-md">
                          <span className="text-xs text-muted-foreground">Monetary</span>
                          <p className="font-medium text-sm">1-2</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Segment Comparison */}
      {avgValues && Object.keys(avgValues).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Segment Comparison</CardTitle>
            <CardDescription>
              Compare key metrics across customer segments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius={90} data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="segment" />
                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                    <Radar name="Recency (days)" dataKey="recency" stroke="#8884d8" fill="#8884d8" fillOpacity={0.2} />
                    <Radar name="Frequency (orders)" dataKey="frequency" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.2} />
                    <Radar name="Monetary (thousands)" dataKey="monetary" stroke="#ffc658" fill="#ffc658" fillOpacity={0.2} />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col justify-center">
                <h3 className="text-lg font-medium mb-4">Segment Characteristics</h3>
                <div className="space-y-4">
                  {Object.entries(avgValues).slice(0, 4).map(([segment, values]: [string, any]) => (
                    <div key={segment} className="p-3 bg-muted rounded-lg">
                      <h4 className="font-medium">{segment}</h4>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Recency</p>
                          <p className="font-medium">{values.recency} days</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Frequency</p>
                          <p className="font-medium">{values.frequency} orders</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Avg. Spend</p>
                          <p className="font-medium">${values.monetary.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 border border-dashed rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <InfoCircledIcon className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">How to read this chart:</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    <strong>Recency:</strong> Measured in days since last purchase (lower values = more recent)<br />
                    <strong>Frequency:</strong> Number of purchases in the analysis period<br />
                    <strong>Monetary:</strong> Total spending amount in the analysis period
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}


    </div>
  )
}
