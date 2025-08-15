import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { InfoCircledIcon, StarIcon } from '@radix-ui/react-icons'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download } from 'lucide-react'
import { exportSegmentTypeCustomers } from '@/services/segmentationApi'

export function PreferenceTab({ preferenceData, categoryDistribution, materialDistribution, preferenceProfiles, preferenceDistribution }) {
  // State for tracking export loading state
  const [exporting, setExporting] = useState(false)

  // Function to export segment customers as CSV
  const exportSegmentCustomers = async (segmentName) => {
    try {
      setExporting(true)
      await exportSegmentTypeCustomers('preference', segmentName)
    } catch (error) {
      console.error('Error exporting customers:', error)
      alert('Failed to export customers. Please try again.')
    } finally {
      setExporting(false)
    }
  }

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
            <p className="text-sm text-muted-foreground">
              Distribution of customer preferences across different categories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Top Preference Category</h3>
              <p className="text-xl font-bold">{topCategory.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {Math.round((topCategory.value / totalCustomers) * 100)}% of customers
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
            </div>

            <div className="bg-muted rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Preference Groups</h3>
              <p className="text-xl font-bold">{preferenceData.length} groups</p>
              <div className="flex mt-3 gap-1">
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
            </div>
          </div>


        </CardContent>
      </Card>

      {/* Category Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preference Categories</CardTitle>
          <CardDescription>
            Distribution of customer preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
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
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
        </CardContent>
      </Card>

      {/* Material Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Preferences</CardTitle>
          <CardDescription>
            Distribution of feature preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={materialDistribution} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={120}
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
        </CardContent>
      </Card>

      {/* Preference Group Profiles */}
      <Card>
        <CardHeader>
          <CardTitle>Preference Group Details</CardTitle>
          <CardDescription>
            Characteristics of each preference group
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Preference Groups</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportSegmentCustomers('all')}
              disabled={exporting}
            >
              {exporting ? (
                <span className="flex items-center gap-1">
                  <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Exporting...
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Download className="h-4 w-4 mr-1" />
                  Export All as CSV
                </span>
              )}
            </Button>
          </div>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Group</th>
                  <th className="text-right py-2">Size</th>
                  <th className="text-left py-2">Primary Category</th>
                  <th className="text-left py-2">Primary Feature</th>
                  <th className="text-right py-2">Actions</th>
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
                    <td className="py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => exportSegmentCustomers(group)}
                        disabled={exporting}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
        </CardContent>
      </Card>
    </div>
  )
}
