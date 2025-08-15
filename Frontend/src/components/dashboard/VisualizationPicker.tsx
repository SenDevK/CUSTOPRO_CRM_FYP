import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  PieChart,
  BarChart,
  LineChart,
  AreaChart
} from 'lucide-react'

export function VisualizationPicker({ item, setDashboardItems, index }) {
  // Get the current dashboardItems
  const dashboardItems = typeof setDashboardItems === 'function'
    ? [] // If it's a function, we'll handle it differently
    : setDashboardItems;

  // Update visualization type
  const updateVisualizationType = (value) => {
    const updatedItems = [...dashboardItems]
    updatedItems[index] = {
      ...updatedItems[index],
      visualizationType: value
    }
    setDashboardItems(updatedItems)
  }

  // Update item title
  const updateTitle = (value) => {
    const updatedItems = [...dashboardItems]
    updatedItems[index] = {
      ...updatedItems[index],
      title: value
    }
    setDashboardItems(updatedItems)
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Visualization Title</Label>
        <Input
          id="title"
          value={item.title}
          onChange={(e) => updateTitle(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="visualization-type">Visualization Type</Label>
        <Select
          value={item.visualizationType}
          onValueChange={updateVisualizationType}
        >
          <SelectTrigger id="visualization-type" className="mt-1">
            <SelectValue placeholder="Select visualization type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pie">
              <div className="flex items-center">
                <PieChart className="h-4 w-4 mr-2" />
                Pie Chart
              </div>
            </SelectItem>
            <SelectItem value="bar">
              <div className="flex items-center">
                <BarChart className="h-4 w-4 mr-2" />
                Bar Chart
              </div>
            </SelectItem>
            <SelectItem value="line">
              <div className="flex items-center">
                <LineChart className="h-4 w-4 mr-2" />
                Line Chart
              </div>
            </SelectItem>
            <SelectItem value="area">
              <div className="flex items-center">
                <AreaChart className="h-4 w-4 mr-2" />
                Area Chart
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="p-3 bg-muted rounded-md mt-4">
        <div className="flex items-center">
          {item.visualizationType === 'pie' && <PieChart className="h-5 w-5 mr-2" />}
          {item.visualizationType === 'bar' && <BarChart className="h-5 w-5 mr-2" />}
          {item.visualizationType === 'line' && <LineChart className="h-5 w-5 mr-2" />}
          {item.visualizationType === 'area' && <AreaChart className="h-5 w-5 mr-2" />}
          <span className="text-sm font-medium">Preview</span>
        </div>
        <div className="h-[100px] bg-card rounded-md mt-2 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">Visualization preview will appear here</p>
        </div>
      </div>
    </div>
  )
}
