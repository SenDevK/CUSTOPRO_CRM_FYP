import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download } from 'lucide-react'
import { exportSegmentTypeCustomers } from '@/services/segmentationApi'

// Define colors for consistent visualization
const GENDER_COLORS = {
  Male: '#8884d8',
  Female: '#ff8042',
  Other: '#00C49F',
  Unknown: '#AAAAAA'
};

const AGE_COLORS = {
  'Under18': '#8884d8',
  'YoungAdult': '#83a6ed',
  'Millennial': '#8dd1e1',
  'GenX_Young': '#82ca9d',
  'GenX_Older': '#a4de6c',
  'BabyBoomer': '#d0ed57',
  'Senior': '#ffc658',
  'Elderly': '#ff8042',
  'Unknown': '#AAAAAA',
  // Add more age groups as needed
};

export function DemographicTab({ demographicData }) {
  // State for tracking export loading state
  const [exporting, setExporting] = useState(false)

  // Function to export segment customers as CSV
  const exportSegmentCustomers = async (segmentType, segmentName) => {
    try {
      setExporting(true)
      await exportSegmentTypeCustomers(segmentType, segmentName)
    } catch (error) {
      console.error('Error exporting customers:', error)
      alert('Failed to export customers. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  // Extract gender and age data from combined segments
  const { genderData, ageOnlyData, combinedData } = useMemo(() => {
    // Initialize counters for each gender and age group
    const genderCounts = {
      Male: 0,
      Female: 0,
      Other: 0,
      Unknown: 0
    };

    const ageCounts = {
      Under18: 0,
      YoungAdult: 0, // 18-24
      Millennial: 0, // 25-34
      GenX_Young: 0, // 35-44
      GenX_Older: 0, // 45-54
      BabyBoomer: 0, // 55-64
      Senior: 0, // 65-74
      Elderly: 0, // 75+
      Unknown: 0
    };

    // Create a matrix for combined data
    const combinedMatrix = {};

    // Process each segment
    demographicData.forEach(segment => {
      // Parse the segment name to extract gender and age
      const parts = segment.name.split('_');

      // Extract gender (first part)
      let gender = parts[0];
      if (!['Male', 'Female', 'Other'].includes(gender)) {
        gender = 'Unknown';
      }

      // Extract age group (remaining parts after removing "Age")
      let ageGroup = 'Unknown';
      if (parts.length > 2 && parts[1] === 'Age') {
        // Join the remaining parts to form the age group
        ageGroup = parts.slice(2).join('_');
      }

      // Update gender counts
      genderCounts[gender] = (genderCounts[gender] || 0) + segment.value;

      // Update age counts
      ageCounts[ageGroup] = (ageCounts[ageGroup] || 0) + segment.value;

      // Update combined matrix
      if (!combinedMatrix[ageGroup]) {
        combinedMatrix[ageGroup] = {
          Male: 0,
          Female: 0,
          Other: 0,
          Unknown: 0
        };
      }
      combinedMatrix[ageGroup][gender] = segment.value;
    });

    // Convert gender counts to array format for charts
    const genderDataArray = Object.entries(genderCounts).map(([gender, value]) => ({
      name: gender,
      displayName: gender,
      value,
      color: GENDER_COLORS[gender] || '#AAAAAA'
    }));

    // Convert age counts to array format for charts
    const ageDataArray = Object.entries(ageCounts)
      .filter(([_, value]) => value > 0) // Only include age groups with data
      .map(([age, value]) => ({
        name: age,
        displayName: age.replace(/_/g, ' '),
        value,
        color: AGE_COLORS[age] || '#AAAAAA'
      }));

    // Convert combined matrix to array format for table
    const combinedDataArray = Object.entries(combinedMatrix).map(([age, genders]) => ({
      ageGroup: age,
      displayAge: age.replace(/_/g, ' '),
      ...genders,
      total: Object.values(genders).reduce((sum: number, val: number) => sum + val, 0)
    }));

    // Calculate total customers
    const totalCustomers = Object.values(genderCounts).reduce((sum: number, val: number) => sum + val, 0);

    // Calculate percentages
    const genderDataWithPercentage = genderDataArray.map(item => ({
      ...item,
      percentage: Math.round((item.value / totalCustomers) * 100)
    }));

    const ageDataWithPercentage = ageDataArray.map(item => ({
      ...item,
      percentage: Math.round((item.value / totalCustomers) * 100)
    }));

    return {
      genderData: genderDataWithPercentage,
      ageOnlyData: ageDataWithPercentage,
      combinedData: combinedDataArray,
      totalCustomers
    };
  }, [demographicData]);

  // Calculate total customers
  const totalCustomers = useMemo(() =>
    genderData.reduce((sum, item) => sum + item.value, 0),
    [genderData]
  );

  // Check if we have age data
  const hasAgeData = ageOnlyData && ageOnlyData.length > 0;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Demographic Segmentation Summary</CardTitle>
          <CardDescription>
            Overview of customer demographic distribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 mb-4 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-sm text-muted-foreground">
              Distribution of customers across demographic categories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted rounded-lg p-4 text-center">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Customers</h3>
              <p className="text-3xl font-bold">{totalCustomers.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">in demographic segmentation</p>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Gender Distribution</h3>
              <div className="flex items-center gap-3">
                {genderData.map((gender) => (
                  <div key={gender.name} className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: gender.color + '30', color: gender.color }}>
                      {gender.name === 'Male' ? 'M' : gender.name === 'Female' ? 'F' : '?'}
                    </div>
                    <span className="text-xs mt-1">{gender.percentage}%</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Click the Gender Distribution tab for detailed breakdown
              </p>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Age Insights</h3>
              {hasAgeData ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs">Youngest Age Group:</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {ageOnlyData[0]?.displayName || 'Unknown'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Largest Age Group:</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {ageOnlyData.reduce((max, item) => item.value > max.value ? item : max, {value: 0})?.displayName || 'Unknown'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Click the Age Distribution tab for detailed breakdown
                  </p>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">No age data available</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Demographic Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Demographic Segmentation</CardTitle>
          <CardDescription>
            View customer demographics by different dimensions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="gender">
            <TabsList className="mb-4">
              <TabsTrigger value="gender">Gender Distribution</TabsTrigger>
              <TabsTrigger value="age">Age Distribution</TabsTrigger>
              <TabsTrigger value="combined">Combined View</TabsTrigger>
            </TabsList>

            {/* Gender Distribution Tab */}
            <TabsContent value="gender">
              <div className="space-y-4">


                <Tabs defaultValue="chart">
                  <TabsList className="mb-4">
                    <TabsTrigger value="chart">Chart View</TabsTrigger>
                    <TabsTrigger value="table">Table View</TabsTrigger>
                  </TabsList>

                  {/* Chart View Tab */}
                  <TabsContent value="chart">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Pie Chart */}
                      <div className="h-[300px]">
                        <div className="mb-2 flex justify-between items-center">
                          <h3 className="text-sm font-medium">Gender Distribution (Pie Chart)</h3>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">Proportional View</Badge>
                        </div>
                        <ResponsiveContainer width="100%" height="90%">
                          <RePieChart>
                            <Tooltip
                              formatter={(value) => [`${value.toLocaleString()} customers`, 'Count']}
                              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            />
                            <Pie
                              data={genderData}
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              dataKey="value"
                              nameKey="displayName"
                              label={({ displayName, percent }) => `${displayName}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {genderData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Legend formatter={(value) => <span className="text-sm font-medium">{value}</span>} />
                          </RePieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Bar Chart */}
                      <div className="h-[300px]">
                        <div className="mb-2 flex justify-between items-center">
                          <h3 className="text-sm font-medium">Gender Distribution (Bar Chart)</h3>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">Quantitative View</Badge>
                        </div>
                        <ResponsiveContainer width="100%" height="90%">
                          <BarChart
                            data={genderData}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis
                              dataKey="displayName"
                              type="category"
                              width={80}
                              tick={{ fontSize: 12, fontWeight: 500 }}
                            />
                            <Tooltip
                              formatter={(value) => [`${value.toLocaleString()} customers`, 'Count']}
                              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            />
                            <Bar
                              dataKey="value"
                              name="Customers"
                              radius={[0, 4, 4, 0]}
                            >
                              {genderData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Table View Tab */}
                  <TabsContent value="table">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Gender Segments</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportSegmentCustomers('demographic', 'all_gender')}
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

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Gender</th>
                            <th className="text-right py-2">Count</th>
                            <th className="text-right py-2">Percentage</th>
                            <th className="text-left py-2">Distribution</th>
                            <th className="text-right py-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {genderData.map((segment) => (
                            <tr key={segment.name} className="border-b">
                              <td className="py-3">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: segment.color }}
                                  ></div>
                                  <span className="font-medium">{segment.displayName}</span>
                                </div>
                              </td>
                              <td className="text-right py-3">{segment.value.toLocaleString()}</td>
                              <td className="text-right py-3">{segment.percentage}%</td>
                              <td className="py-3 w-1/4">
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div
                                    className="h-2 rounded-full"
                                    style={{
                                      width: `${segment.percentage}%`,
                                      backgroundColor: segment.color
                                    }}
                                  />
                                </div>
                              </td>
                              <td className="py-3 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => exportSegmentCustomers('demographic', `Gender_${segment.name}`)}
                                  disabled={exporting}
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
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
                  </TabsContent>


                </Tabs>
              </div>
            </TabsContent>

            {/* Age Distribution Tab */}
            <TabsContent value="age">
              {hasAgeData ? (
                <div className="space-y-4">


                  <Tabs defaultValue="chart">
                    <TabsList className="mb-4">
                      <TabsTrigger value="chart">Chart View</TabsTrigger>
                      <TabsTrigger value="table">Table View</TabsTrigger>
                    </TabsList>

                    <TabsContent value="chart">
                      <div className="space-y-6">
                        <div>
                          <div className="mb-2 flex justify-between items-center">
                            <h3 className="text-sm font-medium">Age Group Distribution</h3>
                            <Badge variant="outline" className="bg-amber-50 text-amber-700">Bar Chart View</Badge>
                          </div>
                          <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={ageOnlyData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                  dataKey="displayName"
                                  angle={-45}
                                  textAnchor="end"
                                  height={70}
                                  tick={{ fontSize: 12 }}
                                />
                                <YAxis />
                                <Tooltip
                                  formatter={(value) => [`${value.toLocaleString()} customers`, 'Count']}
                                  labelFormatter={(label) => `Age Group: ${label}`}
                                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                />
                                <Legend />
                                <Bar dataKey="value" name="Customers" radius={[4, 4, 0, 0]}>
                                  {ageOnlyData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 bg-white rounded-lg border">
                            <h4 className="text-sm font-medium mb-2">Largest Age Group</h4>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full flex items-center justify-center"
                                style={{
                                  backgroundColor: ageOnlyData.reduce((max, item) => item.value > max.value ? item : max, {value: 0})?.color + '30',
                                  color: ageOnlyData.reduce((max, item) => item.value > max.value ? item : max, {value: 0})?.color
                                }}>
                                <span className="text-lg font-bold">
                                  {ageOnlyData.reduce((max, item) => item.value > max.value ? item : max, {value: 0})?.displayName?.charAt(0) || '?'}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">
                                  {ageOnlyData.reduce((max, item) => item.value > max.value ? item : max, {value: 0})?.displayName || 'Unknown'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {ageOnlyData.reduce((max, item) => item.value > max.value ? item : max, {value: 0})?.percentage || 0}% of customers
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-white rounded-lg border">
                            <h4 className="text-sm font-medium mb-2">Age Distribution</h4>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-muted-foreground">Younger</span>
                              <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-blue-500 via-green-500 to-amber-500"></div>
                              <span className="text-xs text-muted-foreground">Older</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {ageOnlyData.find(a => a.name === 'YoungAdult' || a.name === 'Under18')?.percentage > 40 ?
                                "Your customer base skews younger" :
                                ageOnlyData.find(a => a.name === 'BabyBoomer' || a.name === 'Senior' || a.name === 'Elderly')?.percentage > 40 ?
                                "Your customer base skews older" :
                                "Your customer base has a balanced age distribution"}
                            </p>
                          </div>

                          <div className="p-4 bg-white rounded-lg border">
                            <h4 className="text-sm font-medium mb-2">Age Data Quality</h4>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs">Quality Score:</span>
                              <Badge variant="outline" className={
                                (ageOnlyData.find(a => a.name === 'Unknown')?.percentage || 0) < 5 ?
                                "bg-green-50 text-green-700" :
                                (ageOnlyData.find(a => a.name === 'Unknown')?.percentage || 0) < 15 ?
                                "bg-amber-50 text-amber-700" :
                                "bg-red-50 text-red-700"
                              }>
                                {(ageOnlyData.find(a => a.name === 'Unknown')?.percentage || 0) < 5 ?
                                  "High Quality" :
                                  (ageOnlyData.find(a => a.name === 'Unknown')?.percentage || 0) < 15 ?
                                  "Moderate Quality" :
                                  "Low Quality"
                                }
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {(ageOnlyData.find(a => a.name === 'Unknown')?.percentage || 0) < 5 ?
                                "Your age data is comprehensive and reliable for decision-making." :
                                (ageOnlyData.find(a => a.name === 'Unknown')?.percentage || 0) < 15 ?
                                "Your age data has some gaps but is generally usable." :
                                "Your age data has significant gaps that may affect analysis reliability."
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="table">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Age Segments</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportSegmentCustomers('demographic', 'all_age')}
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

                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2">Age Group</th>
                              <th className="text-right py-2">Count</th>
                              <th className="text-right py-2">Percentage</th>
                              <th className="text-left py-2">Distribution</th>
                              <th className="text-right py-2">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ageOnlyData.map((segment) => (
                              <tr key={segment.name} className="border-b">
                                <td className="py-3 font-medium">{segment.displayName}</td>
                                <td className="text-right py-3">{segment.value.toLocaleString()}</td>
                                <td className="text-right py-3">{segment.percentage}%</td>
                                <td className="py-3 w-1/4">
                                  <div className="w-full bg-muted rounded-full h-2">
                                    <div
                                      className="h-2 rounded-full"
                                      style={{
                                        width: `${segment.percentage}%`,
                                        backgroundColor: segment.color
                                      }}
                                    />
                                  </div>
                                </td>
                                <td className="py-3 text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => exportSegmentCustomers('demographic', `Age_${segment.name}`)}
                                    disabled={exporting}
                                  >
                                    <Download className="h-3 w-3" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                            <tr className="bg-muted/30">
                              <td className="py-3 font-medium">Total</td>
                              <td className="text-right py-3 font-medium">
                                {ageOnlyData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                              </td>
                              <td className="text-right py-3 font-medium">100%</td>
                              <td className="py-3"></td>
                              <td className="py-3"></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>


                  </Tabs>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <InfoCircledIcon className="h-12 w-12 text-muted-foreground" />
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">No Age Data Available</h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        Age distribution data is not available from the segmentation backend.
                        This could be because age data is missing in customer profiles or the segmentation model needs to be updated.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Combined View Tab */}
            <TabsContent value="combined">
              <div className="space-y-4">
                <div className="bg-muted/30 p-4 rounded-md mb-4">
                  <h3 className="text-lg font-medium mb-2">Combined Age & Gender Distribution</h3>
                  <p className="text-sm text-muted-foreground">
                    This table shows the breakdown of customers by both age group and gender, allowing you to see the intersection of these demographic attributes.
                  </p>
                </div>

                <div className="rounded-md border overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-3 text-left font-medium">Age Group</th>
                        <th className="p-3 text-right font-medium">Male</th>
                        <th className="p-3 text-right font-medium">Female</th>
                        <th className="p-3 text-right font-medium">Other</th>
                        <th className="p-3 text-right font-medium">Unknown</th>
                        <th className="p-3 text-right font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {combinedData.map((item, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-muted/20' : ''}>
                          <td className="p-3 font-medium">{item.displayAge}</td>
                          <td className="p-3 text-right">
                            {item.Male.toLocaleString()}
                            <span className="text-muted-foreground text-xs ml-1">
                              ({Math.round((item.Male / item.total) * 100) || 0}%)
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {item.Female.toLocaleString()}
                            <span className="text-muted-foreground text-xs ml-1">
                              ({Math.round((item.Female / item.total) * 100) || 0}%)
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {item.Other.toLocaleString()}
                            <span className="text-muted-foreground text-xs ml-1">
                              ({Math.round((item.Other / item.total) * 100) || 0}%)
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {item.Unknown.toLocaleString()}
                            <span className="text-muted-foreground text-xs ml-1">
                              ({Math.round((item.Unknown / item.total) * 100) || 0}%)
                            </span>
                          </td>
                          <td className="p-3 text-right font-medium">{item.total.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="border-t bg-muted/30">
                        <td className="p-3 font-medium">Total</td>
                        <td className="p-3 text-right font-medium">
                          {genderData.find(g => g.name === 'Male')?.value.toLocaleString() || 0}
                        </td>
                        <td className="p-3 text-right font-medium">
                          {genderData.find(g => g.name === 'Female')?.value.toLocaleString() || 0}
                        </td>
                        <td className="p-3 text-right font-medium">
                          {genderData.find(g => g.name === 'Other')?.value.toLocaleString() || 0}
                        </td>
                        <td className="p-3 text-right font-medium">
                          {genderData.find(g => g.name === 'Unknown')?.value.toLocaleString() || 0}
                        </td>
                        <td className="p-3 text-right font-medium">{totalCustomers.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
