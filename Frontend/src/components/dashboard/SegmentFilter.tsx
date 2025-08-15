import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

export function SegmentFilter({ item, setDashboardItems, index }) {
  // Add a new filter
  const addFilter = () => {
    const newItems = [...item.filters]
    newItems.push({
      id: `filter-${Date.now()}`,
      type: 'segment',
      value: 'loyal-customers',
      operator: 'is'
    })

    const updatedItems = [...dashboardItems]
    updatedItems[index] = {
      ...updatedItems[index],
      filters: newItems
    }
    setDashboardItems(updatedItems)
  }

  // Remove a filter
  const removeFilter = (filterId) => {
    const newFilters = item.filters.filter(f => f.id !== filterId)

    const updatedItems = [...dashboardItems]
    updatedItems[index] = {
      ...updatedItems[index],
      filters: newFilters
    }
    setDashboardItems(updatedItems)
  }

  // Update filter value
  const updateFilter = (filterId, field, value) => {
    const filterIndex = item.filters.findIndex(f => f.id === filterId)
    if (filterIndex !== -1) {
      const newFilters = [...item.filters]
      newFilters[filterIndex] = {
        ...newFilters[filterIndex],
        [field]: value
      }

      const updatedItems = [...dashboardItems]
      updatedItems[index] = {
        ...updatedItems[index],
        filters: newFilters
      }
      setDashboardItems(updatedItems)
    }
  }

  // Get the current dashboardItems
  const dashboardItems = typeof setDashboardItems === 'function'
    ? [] // If it's a function, we'll handle it differently
    : setDashboardItems;

  return (
    <div className="space-y-4 mb-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Segment Filters</h3>
        <Button variant="outline" size="sm" onClick={addFilter}>
          <Plus className="h-3 w-3 mr-1" />
          Add Filter
        </Button>
      </div>

      {item.filters.length === 0 ? (
        <p className="text-sm text-muted-foreground">No filters applied</p>
      ) : (
        <div className="space-y-2">
          {item.filters.map(filter => (
            <div key={filter.id} className="flex items-center gap-2 bg-muted p-2 rounded-md">
              <Select
                value={filter.type}
                onValueChange={(value) => updateFilter(filter.id, 'type', value)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Filter type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="segment">Segment</SelectItem>
                  <SelectItem value="age">Age</SelectItem>
                  <SelectItem value="gender">Gender</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filter.operator}
                onValueChange={(value) => updateFilter(filter.id, 'operator', value)}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder="Operator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="is">is</SelectItem>
                  <SelectItem value="not">is not</SelectItem>
                  <SelectItem value="contains">contains</SelectItem>
                  {filter.type === 'age' && <SelectItem value="between">between</SelectItem>}
                </SelectContent>
              </Select>

              {filter.type === 'segment' && (
                <Select
                  value={filter.value}
                  onValueChange={(value) => updateFilter(filter.id, 'value', value)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Select segment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="loyal-customers">Loyal Customers</SelectItem>
                    <SelectItem value="champions">Champions</SelectItem>
                    <SelectItem value="at-risk">At Risk</SelectItem>
                    <SelectItem value="new-customers">New Customers</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {filter.type === 'age' && filter.operator === 'between' && (
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs">{filter.min || 18}</span>
                    <span className="text-xs">{filter.max || 65}</span>
                  </div>
                  <Slider
                    defaultValue={[filter.min || 18, filter.max || 65]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => {
                      updateFilter(filter.id, 'min', value[0])
                      updateFilter(filter.id, 'max', value[1])
                    }}
                  />
                </div>
              )}

              {filter.type === 'age' && filter.operator !== 'between' && (
                <Input
                  className="w-[80px]"
                  type="number"
                  placeholder="Age"
                  value={filter.value || ''}
                  onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                />
              )}

              {filter.type === 'gender' && (
                <Select
                  value={filter.value}
                  onValueChange={(value) => updateFilter(filter.id, 'value', value)}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {filter.type === 'product' && (
                <Input
                  className="flex-1"
                  placeholder="Product name or category"
                  value={filter.value || ''}
                  onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                />
              )}

              <Button variant="ghost" size="icon" onClick={() => removeFilter(filter.id)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {item.filters.length > 0 && (
        <div className="pt-2">
          <Label className="text-xs text-muted-foreground mb-1 block">Active Filters:</Label>
          <div className="flex flex-wrap gap-1">
            {item.filters.map(filter => {
              let label = ''
              if (filter.type === 'segment') {
                label = `${filter.operator} ${filter.value.replace('-', ' ')}`
              } else if (filter.type === 'age' && filter.operator === 'between') {
                label = `${filter.min || 18}-${filter.max || 65}`
              } else if (filter.type === 'age') {
                label = `${filter.operator} ${filter.value}`
              } else if (filter.type === 'gender') {
                label = `${filter.operator} ${filter.value}`
              } else if (filter.type === 'product') {
                label = `${filter.operator} ${filter.value}`
              }

              return (
                <Badge key={filter.id} variant="secondary">
                  {filter.type} {label}
                </Badge>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
