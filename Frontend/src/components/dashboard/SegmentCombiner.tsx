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
import { Plus, X, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function SegmentCombiner({ item, setDashboardItems, index }) {
  // Get the current dashboardItems
  const dashboardItems = typeof setDashboardItems === 'function'
    ? [] // If it's a function, we'll handle it differently
    : setDashboardItems;

  // Add a segment to combine
  const addSegment = () => {
    const newSegments = [...item.segments]
    newSegments.push({
      id: `segment-${Date.now()}`,
      type: 'segment',
      value: 'loyal-customers'
    })

    const updatedItems = [...dashboardItems]
    updatedItems[index] = {
      ...updatedItems[index],
      segments: newSegments
    }
    setDashboardItems(updatedItems)
  }

  // Remove a segment
  const removeSegment = (segmentId) => {
    const newSegments = item.segments.filter(s => s.id !== segmentId)

    const updatedItems = [...dashboardItems]
    updatedItems[index] = {
      ...updatedItems[index],
      segments: newSegments
    }
    setDashboardItems(updatedItems)
  }

  // Update segment value
  const updateSegment = (segmentId, field, value) => {
    const segmentIndex = item.segments.findIndex(s => s.id === segmentId)
    if (segmentIndex !== -1) {
      const newSegments = [...item.segments]
      newSegments[segmentIndex] = {
        ...newSegments[segmentIndex],
        [field]: value
      }

      const updatedItems = [...dashboardItems]
      updatedItems[index] = {
        ...updatedItems[index],
        segments: newSegments
      }
      setDashboardItems(updatedItems)
    }
  }

  return (
    <div className="space-y-4 mb-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Combine Segments</h3>
        <Button variant="outline" size="sm" onClick={addSegment}>
          <Plus className="h-3 w-3 mr-1" />
          Add Segment
        </Button>
      </div>

      {item.segments.length === 0 ? (
        <p className="text-sm text-muted-foreground">Add segments to combine</p>
      ) : (
        <div className="space-y-2">
          {item.segments.map((segment, i) => (
            <div key={segment.id} className="flex items-center gap-2">
              {i > 0 && (
                <div className="flex items-center justify-center w-8 h-8">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              )}

              <Select
                value={segment.type}
                onValueChange={(value) => updateSegment(segment.id, 'type', value)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Segment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="segment">Value Segment</SelectItem>
                  <SelectItem value="age">Age Group</SelectItem>
                  <SelectItem value="gender">Gender</SelectItem>
                  <SelectItem value="product">Product Preference</SelectItem>
                </SelectContent>
              </Select>

              {segment.type === 'segment' && (
                <Select
                  value={segment.value}
                  onValueChange={(value) => updateSegment(segment.id, 'value', value)}
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

              {segment.type === 'age' && (
                <Select
                  value={segment.value}
                  onValueChange={(value) => updateSegment(segment.id, 'value', value)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Select age group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-18">Under 18</SelectItem>
                    <SelectItem value="18-24">18-24</SelectItem>
                    <SelectItem value="25-34">25-34</SelectItem>
                    <SelectItem value="35-44">35-44</SelectItem>
                    <SelectItem value="45-54">45-54</SelectItem>
                    <SelectItem value="55-plus">55+</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {segment.type === 'gender' && (
                <Select
                  value={segment.value}
                  onValueChange={(value) => updateSegment(segment.id, 'value', value)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {segment.type === 'product' && (
                <Input
                  className="w-[150px]"
                  placeholder="Product name"
                  value={segment.value || ''}
                  onChange={(e) => updateSegment(segment.id, 'value', e.target.value)}
                />
              )}

              <Button variant="ghost" size="icon" onClick={() => removeSegment(segment.id)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {item.segments.length > 0 && (
        <div className="pt-2">
          <div className="p-3 bg-muted rounded-md">
            <h4 className="text-sm font-medium mb-2">Combined Segment:</h4>
            <div className="flex flex-wrap gap-1">
              {item.segments.map((segment, i) => (
                <React.Fragment key={segment.id}>
                  <Badge variant="secondary">
                    {segment.type === 'segment' && segment.value.replace('-', ' ')}
                    {segment.type === 'age' && `Age ${segment.value}`}
                    {segment.type === 'gender' && `${segment.value}`}
                    {segment.type === 'product' && `${segment.value} product`}
                  </Badge>
                  {i < item.segments.length - 1 && (
                    <span className="text-muted-foreground">+</span>
                  )}
                </React.Fragment>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              This will show customers who match ALL of the above criteria
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
