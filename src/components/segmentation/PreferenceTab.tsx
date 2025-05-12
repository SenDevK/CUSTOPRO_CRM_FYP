import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { InfoCircledIcon, StarIcon } from '@radix-ui/react-icons'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function PreferenceTab({ preferenceData, categoryDistribution, materialDistribution, preferenceProfiles, preferenceDistribution }) {
  // Calculate total customers
  const totalCustomers = preferenceData.reduce((sum, item) => sum + item.value, 0)

  // Find top category and material
  const topCategory = categoryDistribution && categoryDistribution.length > 0 ?
    categoryDistribution.reduce(
      (max, item) => (item.value > max.value ? item : max),
      { name: '', value: 0 }
    ) : { name: 'N/A', value: 0 };

  const topMaterial = materialDistribution && materialDistribution.length > 0 ?
    materialDistribution.reduce(
      (max, item) => (item.value > max.value ? item : max),
      { name: '', value: 0 }
    ) : { name: 'N/A', value: 0 };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Preference-Based Segmentation
            <Badge variant="outline" className="ml-2">Customer Tastes</Badge>
          </CardTitle>
          <CardDescription>
            Understanding what your customers like and prefer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 mb-4 bg-slate-50 rounded-lg border border-slate-100">
            <h3 className="text-sm font-medium mb-2">What is Preference-Based Segmentation?</h3>
            <p className="text-sm text-muted-foreground">
              Preference-based segmentation groups customers based on their product and feature preferences, helping you understand what different customer groups value most.
            </p>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="h-2 w-2 rounded-full bg-amber-600"></div>
                <span><span className="font-medium text-amber-600">Categories</span> - Product types they prefer</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                <span><span className="font-medium text-blue-600">Materials</span> - Materials they favor</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="h-2 w-2 rounded-full bg-purple-600"></div>
                <span><span className="font-medium text-purple-600">Profiles</span> - Combined preference patterns</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted rounded-lg p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-medium text-muted-foreground">Most Popular Category</h3>
                <StarIcon className="h-5 w-5 text-amber-500" />
              </div>
              <p className="text-2xl font-bold mt-2">{topCategory.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Preferred by {Math.round((topCategory.value / totalCustomers) * 100)}% of customers
              </p>
              <div className="w-full bg-background rounded-full h-2 mt-2">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${(topCategory.value / totalCustomers) * 100}%`,
                    backgroundColor: topCategory.color || '#f59e0b'
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                This is your most popular product category based on customer preferences
              </p>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-medium text-muted-foreground">Favorite Material</h3>
                <StarIcon className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold mt-2">{topMaterial.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Preferred by {Math.round((topMaterial.value / totalCustomers) * 100)}% of customers
              </p>
              <div className="w-full bg-background rounded-full h-2 mt-2">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${(topMaterial.value / totalCustomers) * 100}%`,
                    backgroundColor: topMaterial.color || '#3b82f6'
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                This is your most popular material based on customer preferences
              </p>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-medium text-muted-foreground">Preference Groups</h3>
                <StarIcon className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-2xl font-bold mt-2">{preferenceData.length}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Distinct customer preference profiles
              </p>
              <div className="flex mt-2 gap-1">
                {preferenceData.map((group, index) => (
                  <div
                    key={index}
                    className="h-2 rounded-full"
                    style={{
                      width: `${(group.value / totalCustomers) * 100}%`,
                      backgroundColor: group.color || `hsl(${(index * 60) % 360}, 70%, 60%)`
                    }}
                    title={`${group.name}: ${group.value} customers`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Each group represents customers with similar preference patterns
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 border rounded-md bg-slate-50">
              <h4 className="text-xs font-medium mb-2">Preference Segmentation Data</h4>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                <li>Product categories customers have purchased</li>
                <li>Materials and features customers prefer</li>
                <li>Patterns in customer purchasing behavior</li>
                <li>Distribution of preferences across customer base</li>
              </ul>
            </div>
            <div className="p-3 border rounded-md bg-slate-50">
              <h4 className="text-xs font-medium mb-2">Data Quality</h4>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs">Preference Coverage:</span>
                <Badge variant="outline" className={
                  preferenceData.length >= 5 ?
                  "bg-green-50 text-green-700" :
                  preferenceData.length >= 3 ?
                  "bg-amber-50 text-amber-700" :
                  "bg-red-50 text-red-700"
                }>
                  {preferenceData.length >= 5 ?
                    "Comprehensive" :
                    preferenceData.length >= 3 ?
                    "Moderate" :
                    "Limited"
                  }
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {preferenceData.length} distinct preference groups identified from customer data
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Product Category Preferences</CardTitle>
          <CardDescription>
            What types of products your customers prefer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="chart">
            <TabsList className="mb-4">
              <TabsTrigger value="chart">Visual View</TabsTrigger>
              <TabsTrigger value="table">Detailed View</TabsTrigger>
              <TabsTrigger value="analysis">Category Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="chart">
              <div className="space-y-4">
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-sm text-amber-700">
                    This chart shows the distribution of product category preferences among your customers.
                    Understanding these preferences helps you optimize your product offerings and marketing strategies.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-[300px]">
                    <div className="mb-2 flex justify-between items-center">
                      <h3 className="text-sm font-medium">Category Distribution</h3>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700">Pie Chart View</Badge>
                    </div>
                    <ResponsiveContainer width="100%" height="90%">
                      <RePieChart>
                        <Tooltip
                          formatter={(value) => [`${value} customers (${Math.round((value/totalCustomers)*100)}%)`, 'Count']}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                        <Pie
                          data={categoryDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {categoryDistribution && categoryDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || `hsl(${(index * 60) % 360}, 70%, 60%)`} />
                          ))}
                        </Pie>
                        <Legend formatter={(value) => <span className="text-sm font-medium">{value}</span>} />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Top Categories</h3>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700">
                        Top {Math.min(5, categoryDistribution?.length || 0)} Categories
                      </Badge>
                    </div>
                    <div className="space-y-4">
                      {categoryDistribution && categoryDistribution.slice(0, 5).map((category) => (
                        <div key={category.name} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color || `hsl(${(categoryDistribution.indexOf(category) * 60) % 360}, 70%, 60%)` }}></div>
                              <div className="font-medium">{category.name}</div>
                            </div>
                            <div className="font-medium">{category.value} customers</div>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${(category.value / totalCustomers) * 100}%`,
                                backgroundColor: category.color || `hsl(${(categoryDistribution.indexOf(category) * 60) % 360}, 70%, 60%)`
                              }}
                            />
                          </div>
                          <div className="text-xs text-muted-foreground text-right">
                            {Math.round((category.value / totalCustomers) * 100)}% of customers
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 border rounded-md">
                    <h4 className="text-sm font-medium mb-2">Category Diversity</h4>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center bg-amber-100 text-amber-700">
                        <span className="text-lg font-bold">{categoryDistribution?.length || 0}</span>
                      </div>
                      <div>
                        <p className="font-medium">Categories</p>
                        <p className="text-xs text-muted-foreground">
                          {categoryDistribution?.length >= 5 ?
                            "Diverse product category preferences" :
                            categoryDistribution?.length >= 3 ?
                            "Moderate product category diversity" :
                            "Limited product category diversity"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 border rounded-md">
                    <h4 className="text-sm font-medium mb-2">Category Concentration</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-muted-foreground">Distributed</span>
                      <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-green-500 via-amber-300 to-red-500"></div>
                      <span className="text-xs text-muted-foreground">Concentrated</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {topCategory && (topCategory.value / totalCustomers) > 0.5 ?
                        "Your customer preferences are highly concentrated in a few categories" :
                        topCategory && (topCategory.value / totalCustomers) > 0.3 ?
                        "Your customer preferences show moderate concentration" :
                        "Your customer preferences are well distributed across categories"}
                    </p>
                  </div>

                  <div className="p-3 border rounded-md">
                    <h4 className="text-sm font-medium mb-2">Top Category</h4>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs">Dominance:</span>
                      <Badge variant="outline" className={
                        topCategory && (topCategory.value / totalCustomers) > 0.5 ?
                        "bg-red-50 text-red-700" :
                        topCategory && (topCategory.value / totalCustomers) > 0.3 ?
                        "bg-amber-50 text-amber-700" :
                        "bg-green-50 text-green-700"
                      }>
                        {topCategory && (topCategory.value / totalCustomers) > 0.5 ?
                          "High" :
                          topCategory && (topCategory.value / totalCustomers) > 0.3 ?
                          "Moderate" :
                          "Low"
                        }
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {topCategory.name} represents {Math.round((topCategory.value / totalCustomers) * 100)}% of your customer preferences
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="table">
              <div className="space-y-4">
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-sm text-amber-700">
                    This table provides detailed information about each product category, including the number of customers
                    who prefer each category and their percentage of your total customer base.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Category</th>
                        <th className="text-right py-2">Customer Count</th>
                        <th className="text-right py-2">Percentage</th>
                        <th className="text-left py-2">Popularity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryDistribution && categoryDistribution.map((category) => (
                        <tr key={category.name} className="border-b">
                          <td className="py-3 font-medium">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color || `hsl(${(categoryDistribution.indexOf(category) * 60) % 360}, 70%, 60%)` }}></div>
                              {category.name}
                            </div>
                          </td>
                          <td className="text-right py-3">{category.value.toLocaleString()}</td>
                          <td className="text-right py-3">
                            {Math.round((category.value / totalCustomers) * 100)}%
                          </td>
                          <td className="py-3 w-1/4">
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${(category.value / totalCustomers) * 100}%`,
                                  backgroundColor: category.color || `hsl(${(categoryDistribution.indexOf(category) * 60) % 360}, 70%, 60%)`
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-muted/30">
                        <td className="py-3 font-medium">Total</td>
                        <td className="text-right py-3 font-medium">{totalCustomers.toLocaleString()}</td>
                        <td className="text-right py-3 font-medium">100%</td>
                        <td className="py-3"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analysis">
              <div className="space-y-4">
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-sm text-amber-700">
                    This analysis provides detailed information about your product categories, helping you understand
                    customer preferences and optimize your product offerings.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-lg border">
                      <h3 className="text-sm font-medium mb-3">Category Distribution Overview</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {categoryDistribution?.length >= 5 ? (
                          <>Your customers have <span className="font-medium">diverse product preferences</span> across {categoryDistribution.length} different categories.</>
                        ) : categoryDistribution?.length >= 3 ? (
                          <>Your customers have <span className="font-medium">moderately diverse preferences</span> across {categoryDistribution.length} different categories.</>
                        ) : (
                          <>Your customers have <span className="font-medium">limited product preferences</span>, focusing on just {categoryDistribution?.length || 0} categories.</>
                        )}
                      </p>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs">Category Diversity:</span>
                          <Badge variant="outline" className={
                            categoryDistribution?.length >= 5 ?
                            "bg-green-50 text-green-700" :
                            categoryDistribution?.length >= 3 ?
                            "bg-amber-50 text-amber-700" :
                            "bg-red-50 text-red-700"
                          }>
                            {categoryDistribution?.length >= 5 ?
                              "High" :
                              categoryDistribution?.length >= 3 ?
                              "Moderate" :
                              "Low"
                            }
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs">Concentration:</span>
                          <Badge variant="outline" className={
                            topCategory && (topCategory.value / totalCustomers) > 0.5 ?
                            "bg-red-50 text-red-700" :
                            topCategory && (topCategory.value / totalCustomers) > 0.3 ?
                            "bg-amber-50 text-amber-700" :
                            "bg-green-50 text-green-700"
                          }>
                            {topCategory && (topCategory.value / totalCustomers) > 0.5 ?
                              "Highly Concentrated" :
                              topCategory && (topCategory.value / totalCustomers) > 0.3 ?
                              "Moderately Concentrated" :
                              "Well Distributed"
                            }
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-white rounded-lg border">
                      <h3 className="text-sm font-medium mb-3">Category Data Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mt-0.5">•</div>
                          <div>
                            <p className="text-sm font-medium">Data Collection</p>
                            <p className="text-xs text-muted-foreground">Category preferences are determined based on customer purchase history and browsing behavior.</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <div className="h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mt-0.5">•</div>
                          <div>
                            <p className="text-sm font-medium">Data Representation</p>
                            <p className="text-xs text-muted-foreground">Each category represents a distinct product type or classification in your inventory.</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <div className="h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mt-0.5">•</div>
                          <div>
                            <p className="text-sm font-medium">Data Visualization</p>
                            <p className="text-xs text-muted-foreground">Charts and tables show the distribution of customer preferences across different product categories.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-lg border">
                      <h3 className="text-sm font-medium mb-3">Top Categories Analysis</h3>

                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                        {categoryDistribution && categoryDistribution.slice(0, 5).map((category) => (
                          <div key={category.name} className="p-3 border rounded-md" style={{
                            borderColor: (category.color || `hsl(${(categoryDistribution.indexOf(category) * 60) % 360}, 70%, 60%)`) + '40',
                            backgroundColor: (category.color || `hsl(${(categoryDistribution.indexOf(category) * 60) % 360}, 70%, 60%)`) + '05'
                          }}>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="h-4 w-4 rounded-full" style={{ backgroundColor: category.color || `hsl(${(categoryDistribution.indexOf(category) * 60) % 360}, 70%, 60%)` }}></div>
                              <h4 className="font-medium">{category.name}</h4>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-2">
                              <div className="text-xs">
                                <span className="text-muted-foreground">Count:</span> {category.value.toLocaleString()}
                              </div>
                              <div className="text-xs">
                                <span className="text-muted-foreground">Percentage:</span> {Math.round((category.value / totalCustomers) * 100)}%
                              </div>
                            </div>

                            <div className="w-full bg-muted rounded-full h-2 mb-2">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${(category.value / totalCustomers) * 100}%`,
                                  backgroundColor: category.color || `hsl(${(categoryDistribution.indexOf(category) * 60) % 360}, 70%, 60%)`
                                }}
                              />
                            </div>

                            <p className="text-xs text-muted-foreground">
                              {Math.round((category.value / totalCustomers) * 100) > 30 ?
                                `${category.name} is a dominant category in your customer preferences.` :
                                Math.round((category.value / totalCustomers) * 100) > 15 ?
                                `${category.name} is a significant category in your customer preferences.` :
                                `${category.name} represents a smaller portion of your customer preferences.`
                              }
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-white rounded-lg border">
                      <h3 className="text-sm font-medium mb-3">Category Distribution Pattern</h3>
                      <p className="text-xs text-muted-foreground mb-3">
                        The distribution pattern of your category preferences can inform your business strategy.
                      </p>

                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">Your Business</span>
                            <div className="flex items-center gap-1">
                              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: categoryDistribution?.[0]?.color || '#f59e0b' }}></div>
                              <span className="text-xs">Top: {Math.round((categoryDistribution?.[0]?.value / totalCustomers || 0) * 100)}%</span>
                              <div className="h-2 w-2 rounded-full ml-2" style={{ backgroundColor: '#94a3b8' }}></div>
                              <span className="text-xs">Others: {100 - Math.round((categoryDistribution?.[0]?.value / totalCustomers || 0) * 100)}%</span>
                            </div>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full float-left" style={{
                              width: `${Math.round((categoryDistribution?.[0]?.value / totalCustomers || 0) * 100)}%`,
                              backgroundColor: categoryDistribution?.[0]?.color || '#f59e0b'
                            }}></div>
                            <div className="h-full float-left" style={{
                              width: `${100 - Math.round((categoryDistribution?.[0]?.value / totalCustomers || 0) * 100)}%`,
                              backgroundColor: '#94a3b8'
                            }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">Pattern Type:</span>
                            <Badge variant="outline" className={
                              topCategory && (topCategory.value / totalCustomers) > 0.5 ?
                              "bg-blue-50 text-blue-700" :
                              topCategory && (topCategory.value / totalCustomers) > 0.3 ?
                              "bg-purple-50 text-purple-700" :
                              "bg-green-50 text-green-700"
                            }>
                              {topCategory && (topCategory.value / totalCustomers) > 0.5 ?
                                "Dominant Category" :
                                topCategory && (topCategory.value / totalCustomers) > 0.3 ?
                                "Leading Category" :
                                "Balanced Distribution"
                              }
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {topCategory && (topCategory.value / totalCustomers) > 0.5 ?
                              "Your business has a single dominant category that most customers prefer." :
                              topCategory && (topCategory.value / totalCustomers) > 0.3 ?
                              "Your business has a leading category with significant customer interest." :
                              "Your business has a balanced distribution of customer preferences across categories."
                            }
                          </p>
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

      {/* Material Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Material Preferences</CardTitle>
          <CardDescription>
            What materials your customers prefer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-700">
                Understanding material preferences helps you optimize your product offerings, inventory management, and
                marketing strategies to better meet customer expectations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-[300px]">
                <div className="mb-2 flex justify-between items-center">
                  <h3 className="text-sm font-medium">Material Distribution</h3>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">Bar Chart View</Badge>
                </div>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart data={materialDistribution} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      tick={{ fontSize: 12, fontWeight: 500 }}
                    />
                    <Tooltip
                      formatter={(value) => [`${value} customers (${Math.round((value/totalCustomers)*100)}%)`, 'Count']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />
                    <Bar dataKey="value" name="Customers" radius={[0, 4, 4, 0]}>
                      {materialDistribution && materialDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || `hsl(${210 + (index * 30) % 360}, 70%, 60%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col justify-center">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Material Insights</h3>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    Key Information
                  </Badge>
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-white rounded-lg border">
                    <h4 className="font-medium text-sm mb-2">Top Material</h4>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: topMaterial.color ? topMaterial.color + '30' : 'rgba(59, 130, 246, 0.2)',
                          color: topMaterial.color || '#3b82f6'
                        }}>
                        <span className="text-lg font-bold">
                          {topMaterial.name?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {topMaterial.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Preferred by {Math.round((topMaterial.value / totalCustomers) * 100)}% of customers
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-lg border">
                    <h4 className="font-medium text-sm mb-2">Material Diversity</h4>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs">Total Materials:</span>
                      <Badge variant="outline" className={
                        materialDistribution?.length >= 5 ?
                        "bg-green-50 text-green-700" :
                        materialDistribution?.length >= 3 ?
                        "bg-amber-50 text-amber-700" :
                        "bg-red-50 text-red-700"
                      }>
                        {materialDistribution?.length || 0} materials
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {materialDistribution?.length >= 5 ?
                        "Your customers have diverse material preferences" :
                        materialDistribution?.length >= 3 ?
                        "Your customers have moderate material diversity" :
                        "Your customers have limited material preferences"
                      }
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border">
                    <h4 className="font-medium text-sm mb-2">Business Applications</h4>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                      <li>Optimize inventory based on material preferences</li>
                      <li>Highlight popular materials in marketing campaigns</li>
                      <li>Consider material preferences in product development</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Material</th>
                    <th className="text-right py-2">Customer Count</th>
                    <th className="text-right py-2">Percentage</th>
                    <th className="text-left py-2">Popularity</th>
                  </tr>
                </thead>
                <tbody>
                  {materialDistribution && materialDistribution.map((material) => (
                    <tr key={material.name} className="border-b">
                      <td className="py-3 font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: material.color || `hsl(${210 + (materialDistribution.indexOf(material) * 30) % 360}, 70%, 60%)` }}></div>
                          {material.name}
                        </div>
                      </td>
                      <td className="text-right py-3">{material.value.toLocaleString()}</td>
                      <td className="text-right py-3">
                        {Math.round((material.value / totalCustomers) * 100)}%
                      </td>
                      <td className="py-3 w-1/4">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${(material.value / totalCustomers) * 100}%`,
                              backgroundColor: material.color || `hsl(${210 + (materialDistribution.indexOf(material) * 30) % 360}, 70%, 60%)`
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-muted/30">
                    <td className="py-3 font-medium">Total</td>
                    <td className="text-right py-3 font-medium">{totalCustomers.toLocaleString()}</td>
                    <td className="text-right py-3 font-medium">100%</td>
                    <td className="py-3"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preference Group Profiles */}
      <Card>
        <CardHeader>
          <CardTitle>Preference Group Profiles</CardTitle>
          <CardDescription>
            Common characteristics of each preference group
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
              <p className="text-sm text-purple-700">
                Preference groups combine multiple preference factors to create distinct customer segments.
                These profiles help you understand the unique combinations of preferences that define different customer groups.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-3 border rounded-md bg-white">
                <h4 className="text-sm font-medium mb-2">Group Overview</h4>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center bg-purple-100 text-purple-700">
                    <span className="text-lg font-bold">{Object.keys(preferenceProfiles || {}).length}</span>
                  </div>
                  <div>
                    <p className="font-medium">Preference Groups</p>
                    <p className="text-xs text-muted-foreground">
                      {Object.keys(preferenceProfiles || {}).length >= 4 ?
                        "Diverse preference patterns identified" :
                        Object.keys(preferenceProfiles || {}).length >= 2 ?
                        "Moderate preference diversity" :
                        "Limited preference patterns"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 border rounded-md bg-white">
                <h4 className="text-sm font-medium mb-2">Business Applications</h4>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                  <li>Create targeted marketing campaigns for specific preference groups</li>
                  <li>Develop product bundles based on common preference combinations</li>
                  <li>Optimize store layouts to appeal to different preference groups</li>
                </ul>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Group</th>
                    <th className="text-right py-2">Size</th>
                    <th className="text-left py-2">Favorite Category</th>
                    <th className="text-left py-2">Preferred Material</th>
                    <th className="text-left py-2">Distribution</th>
                  </tr>
                </thead>
                <tbody>
                  {preferenceProfiles && Object.entries(preferenceProfiles).map(([group, profile]: [string, any], index) => (
                    <tr key={group} className="border-b">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `hsl(${260 + (index * 40) % 360}, 70%, 60%)` }}></div>
                          <span className="font-medium">{group}</span>
                        </div>
                      </td>
                      <td className="text-right py-3">
                        {preferenceDistribution?.[group] || 0} customers
                        <div className="text-xs text-muted-foreground">
                          ({Math.round(((preferenceDistribution?.[group] || 0) / totalCustomers) * 100)}%)
                        </div>
                      </td>
                      <td className="py-3">{profile?.favorite_category || 'N/A'}</td>
                      <td className="py-3">{profile?.preferred_material || 'N/A'}</td>
                      <td className="py-3 w-1/5">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${Math.round(((preferenceDistribution?.[group] || 0) / totalCustomers) * 100)}%`,
                              backgroundColor: `hsl(${260 + (index * 40) % 360}, 70%, 60%)`
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Group Profiles</h3>
                <div className="space-y-4">
                  {preferenceProfiles && Object.entries(preferenceProfiles).slice(0, 3).map(([group, profile]: [string, any], index) => (
                    <div key={group} className="p-4 border rounded-lg" style={{
                      borderColor: `hsla(${260 + (index * 40) % 360}, 70%, 60%, 0.3)`,
                      background: `linear-gradient(to bottom right, hsla(${260 + (index * 40) % 360}, 70%, 97%, 1), white)`
                    }}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-5 w-5 rounded-full" style={{ backgroundColor: `hsl(${260 + (index * 40) % 360}, 70%, 60%)` }}></div>
                        <h4 className="font-medium">{group}</h4>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Size:</p>
                          <p className="text-sm font-medium">{preferenceDistribution?.[group] || 0} customers ({Math.round(((preferenceDistribution?.[group] || 0) / totalCustomers) * 100)}%)</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Favorite Category:</p>
                          <p className="text-sm font-medium">{profile?.favorite_category || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Preferred Material:</p>
                          <p className="text-sm font-medium">{profile?.preferred_material || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Other Preferences:</p>
                          <p className="text-sm font-medium">{profile?.other_preferences || 'None specified'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Group Distribution</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Tooltip
                        formatter={(value) => [`${value} customers (${Math.round((value/totalCustomers)*100)}%)`, 'Count']}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      />
                      <Pie
                        data={Object.entries(preferenceDistribution || {}).map(([group, value], index) => ({
                          name: group,
                          value: value as number,
                          color: `hsl(${260 + (index * 40) % 360}, 70%, 60%)`
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {Object.entries(preferenceDistribution || {}).map(([group, value], index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${260 + (index * 40) % 360}, 70%, 60%)`} />
                        ))}
                      </Pie>
                      <Legend formatter={(value) => <span className="text-sm font-medium">{value}</span>} />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
