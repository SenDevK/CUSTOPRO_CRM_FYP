import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, X, Save, Layout, Eye, Settings, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { SegmentFilter } from './SegmentFilter'
import { VisualizationPicker } from './VisualizationPicker'
import { SegmentCombiner } from './SegmentCombiner'
import { DashboardItem } from './DashboardItem'

export function DashboardBuilder({ items = [], setDashboardItems }: { items: any[], setDashboardItems: (items: any[]) => void }) {
  const [activeTab, setActiveTab] = useState('build')

  // Add a new visualization to the dashboard
  const addVisualization = (type: string) => {
    setDashboardItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        type,
        title: type === 'segment' ? 'New Segment Visualization' :
               type === 'combined' ? 'Combined Segments' : 'Trend Analysis',
        filters: [],
        segments: [],
        visualizationType: 'pie'
      }
    ])
  }

  // Remove an item from the dashboard
  const removeItem = (index: number) => {
    const newItems = [...items]
    newItems.splice(index, 1)
    setDashboardItems(newItems)
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="build">
            <Settings className="h-4 w-4 mr-2" />
            Build
          </TabsTrigger>
          <TabsTrigger value="view">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="build">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Add Visualizations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => addVisualization('segment')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Segment Visualization
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => addVisualization('combined')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Combined Segments
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => addVisualization('trend')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Trend Analysis
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Templates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        setDashboardItems([
                          {
                            id: `item-${Date.now()}`,
                            type: 'segment',
                            title: 'Customer Value Analysis',
                            filters: [{ id: 'f1', type: 'segment', value: 'Champions', operator: 'is' }],
                            segments: [],
                            visualizationType: 'pie'
                          },
                          {
                            id: `item-${Date.now() + 1}`,
                            type: 'segment',
                            title: 'At-Risk Customers',
                            filters: [{ id: 'f2', type: 'segment', value: 'At Risk (High Value)', operator: 'is' }],
                            segments: [],
                            visualizationType: 'bar'
                          }
                        ])
                      }}
                    >
                      Customer Value Analysis
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        setDashboardItems([
                          {
                            id: `item-${Date.now()}`,
                            type: 'segment',
                            title: 'Product Preferences',
                            filters: [],
                            segments: [],
                            visualizationType: 'pie'
                          },
                          {
                            id: `item-${Date.now() + 1}`,
                            type: 'combined',
                            title: 'Loyal Customers + Denim Preference',
                            filters: [],
                            segments: [
                              { id: 's1', type: 'segment', value: 'Loyal Customers' },
                              { id: 's2', type: 'product', value: 'Denim' }
                            ],
                            visualizationType: 'pie'
                          }
                        ])
                      }}
                    >
                      Product Preference Dashboard
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        setDashboardItems([
                          {
                            id: `item-${Date.now()}`,
                            type: 'segment',
                            title: 'Gender Distribution',
                            filters: [{ id: 'f1', type: 'gender', value: 'Male', operator: 'is' }],
                            segments: [],
                            visualizationType: 'pie'
                          },
                          {
                            id: `item-${Date.now() + 1}`,
                            type: 'segment',
                            title: 'Age Distribution',
                            filters: [{ id: 'f2', type: 'age', min: 20, max: 30, operator: 'between' }],
                            segments: [],
                            visualizationType: 'bar'
                          }
                        ])
                      }}
                    >
                      Demographic Insights
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              <div className="space-y-4">
                {items.length === 0 ? (
                  <div className="border border-dashed rounded-lg p-8 text-center">
                    <p className="text-muted-foreground">
                      Add visualizations from the left panel to start building your dashboard
                    </p>
                  </div>
                ) : (
                  items.map((item, index) => (
                    <Card key={item.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <DashboardItem
                          item={item}
                          setDashboardItems={setDashboardItems}
                          index={index}
                        />
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="view">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {/* This would render the actual visualization based on the item configuration */}
                  <div className="flex items-center justify-center h-full border rounded-md">
                    <p className="text-muted-foreground">Visualization preview</p>
                  </div>
                </CardContent>
              </Card>
            ))}

            {items.length === 0 && (
              <div className="col-span-3 border border-dashed rounded-lg p-8 text-center">
                <p className="text-muted-foreground">
                  No visualizations added yet. Go to the "Build" tab to create your dashboard.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
