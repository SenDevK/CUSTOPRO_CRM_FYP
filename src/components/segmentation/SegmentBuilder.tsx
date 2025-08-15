import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Plus, X, Save, Filter, ArrowRight, Check, Download } from 'lucide-react'
import { InfoCircledIcon, ReloadIcon } from '@radix-ui/react-icons'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
  getCustomSegments,
  createCustomSegment,
  updateCustomSegment,
  deleteCustomSegment,
  previewCustomSegment,
  getSegmentOptions,
  exportSegmentCustomers,
  getSegmentAnalytics,
  getSegmentCustomers,
  checkSegmentApiHealth,
  Segment as SegmentType,
  SegmentRule
} from '@/services/segmentationApi'

export function SegmentBuilder() {
  const [segments, setSegments] = useState<SegmentType[]>([])
  const [currentSegment, setCurrentSegment] = useState<Partial<SegmentType>>({
    name: '',
    description: '',
    rules: [],
    isActive: true
  })
  const [activeTab, setActiveTab] = useState('create')
  const [loading, setLoading] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewData, setPreviewData] = useState<{ count: number; percentage: number } | null>(null)

  // State for dynamic field options
  const [rfmSegmentOptions, setRfmSegmentOptions] = useState<string[]>([])
  const [categoryOptions, setCategoryOptions] = useState<string[]>([])
  const [materialOptions, setMaterialOptions] = useState<string[]>([])
  const [preferenceSegmentOptions, setPreferenceSegmentOptions] = useState<string[]>([])
  const [locationOptions, setLocationOptions] = useState<string[]>([])

  // API health check state
  const [apiHealthy, setApiHealthy] = useState<boolean | null>(null)
  const [checkingHealth, setCheckingHealth] = useState(false)

  // Check API health
  const checkApiHealth = async () => {
    setCheckingHealth(true)
    try {
      console.log('Checking segment API health...')
      const isHealthy = await checkSegmentApiHealth()
      console.log('API health check result:', isHealthy)
      setApiHealthy(isHealthy)

      if (isHealthy) {
        // If API is healthy, reload data
        console.log('API is healthy, reloading data...')
        await loadSegments()
        await loadSegmentOptions()
        console.log('Data reloaded successfully')
      } else {
        console.log('API is not healthy, using local data')
      }
    } catch (error) {
      console.error('Error checking API health:', error)
      setApiHealthy(false)
    } finally {
      setCheckingHealth(false)
    }
  }

  // Load segments and options on component mount
  useEffect(() => {
    checkApiHealth()
  }, [])

  // Load segments from API
  const loadSegments = async () => {
    setLoading(true)
    try {
      const data = await getCustomSegments()
      setSegments(data)
    } catch (error) {
      console.error('Error loading segments:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load segment options from API
  const loadSegmentOptions = async () => {
    try {
      const options = await getSegmentOptions()
      console.log('Loaded segment options:', options)

      // Set options in state
      setRfmSegmentOptions(options.rfm_segments || [])
      setCategoryOptions(options.categories || [])
      setMaterialOptions(options.materials || [])
      setPreferenceSegmentOptions(options.preference_segments || [])
      setLocationOptions(options.locations || [])
    } catch (error) {
      console.error('Error loading segment options:', error)
    }
  }

  // Add a new rule to the current segment
  const addRule = () => {
    setCurrentSegment({
      ...currentSegment,
      rules: [
        ...currentSegment.rules,
        {
          id: `rule-${Date.now()}`,
          type: 'gender',
          operator: 'is',
          value: '',
          valueType: 'string'
        }
      ]
    })
  }

  // Remove a rule from the current segment
  const removeRule = (ruleId: string) => {
    setCurrentSegment({
      ...currentSegment,
      rules: currentSegment.rules.filter((rule: any) => rule.id !== ruleId)
    })
  }

  // Update a rule in the current segment
  const updateRule = (ruleId: string, field: string, value: any) => {
    setCurrentSegment({
      ...currentSegment,
      rules: currentSegment.rules.map((rule: any) =>
        rule.id === ruleId ? { ...rule, [field]: value } : rule
      )
    })
  }

  // Preview the current segment
  const previewSegment = async () => {
    if (currentSegment.rules && currentSegment.rules.length > 0) {
      setPreviewLoading(true)
      try {
        // Log the rules for debugging
        console.log('Previewing segment with rules:', JSON.stringify(currentSegment.rules, null, 2))

        // Make sure all rules have the correct format
        const formattedRules = (currentSegment.rules as SegmentRule[]).map(rule => {
          // Make a copy of the rule to avoid modifying the original
          const formattedRule = { ...rule }

          // Ensure values are properly formatted for the backend
          if (rule.type === 'gender' && typeof rule.value === 'string') {
            // Gender values should be capitalized
            formattedRule.value = rule.value.charAt(0).toUpperCase() + rule.value.slice(1)
          }

          // Ensure age values are properly formatted
          if (rule.type === 'age' && typeof rule.value === 'string') {
            // Make sure the operator is set to 'is' for age ranges
            formattedRule.operator = 'is'
          }

          return formattedRule
        })

        console.log('Formatted rules:', JSON.stringify(formattedRules, null, 2))

        const data = await previewCustomSegment({
          ...currentSegment,
          rules: formattedRules
        } as any)

        setPreviewData(data)
        console.log('Preview data:', data) // Log the preview data
      } catch (error) {
        console.error('Error previewing segment:', error)
      } finally {
        setPreviewLoading(false)
      }
    }
  }

  // Automatically preview segment when rules change
  useEffect(() => {
    if (currentSegment.rules && currentSegment.rules.length > 0) {
      previewSegment()
    }
  }, [currentSegment.rules])

  // Save the current segment
  const saveSegment = async () => {
    if (!currentSegment.name) {
      alert('Please provide a name for the segment')
      return
    }

    if (!currentSegment.rules || currentSegment.rules.length === 0) {
      alert('Please add at least one rule to the segment')
      return
    }

    setLoading(true)

    try {
      // Format rules for backend
      const formattedRules = (currentSegment.rules as SegmentRule[]).map(rule => {
        // Make a copy of the rule to avoid modifying the original
        const formattedRule = { ...rule }

        // Ensure values are properly formatted for the backend
        if (rule.type === 'gender' && typeof rule.value === 'string') {
          // Gender values should be capitalized
          formattedRule.value = rule.value.charAt(0).toUpperCase() + rule.value.slice(1)
        }

        return formattedRule
      })

      console.log('Saving segment with formatted rules:', JSON.stringify(formattedRules, null, 2))

      // Create a formatted segment object
      const formattedSegment = {
        ...currentSegment,
        rules: formattedRules
      }

      // Check if we're editing an existing segment or creating a new one
      if (currentSegment.id) {
        // Update existing segment
        const updatedSegment = await updateCustomSegment(
          currentSegment.id,
          formattedSegment as Omit<SegmentType, 'id' | 'createdAt' | 'updatedAt'>
        )

        if (updatedSegment) {
          setSegments(segments.map(s => s.id === updatedSegment.id ? updatedSegment : s))
          console.log('Successfully updated segment:', updatedSegment)
        }
      } else {
        // Create new segment
        const newSegment = await createCustomSegment(
          formattedSegment as Omit<SegmentType, 'id' | 'createdAt' | 'updatedAt' | 'customerCount' | 'customerPercentage'>
        )

        if (newSegment) {
          setSegments([...segments, newSegment])
          console.log('Successfully created new segment:', newSegment)
        }
      }

      // Reset current segment
      setCurrentSegment({
        name: '',
        description: '',
        rules: [],
        isActive: true
      })

      // Reset preview data
      setPreviewData(null)

      // Switch to manage tab
      setActiveTab('manage')
    } catch (error) {
      console.error('Error saving segment:', error)
      alert('Failed to save segment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Edit an existing segment
  const editSegment = (segment: SegmentType) => {
    setCurrentSegment({ ...segment })
    setPreviewData({
      count: segment.customerCount || 0,
      percentage: segment.customerPercentage || 0
    })
    setActiveTab('create')
  }

  // Delete a segment
  const deleteSegment = async (segmentId: string) => {
    if (confirm('Are you sure you want to delete this segment?')) {
      setLoading(true)
      try {
        const success = await deleteCustomSegment(segmentId)
        if (success) {
          setSegments(segments.filter(s => s.id !== segmentId))
        } else {
          alert('Failed to delete segment. Please try again.')
        }
      } catch (error) {
        console.error('Error deleting segment:', error)
        alert('Failed to delete segment. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  }

  // Toggle segment active status
  const toggleSegmentActive = async (segmentId: string) => {
    const segment = segments.find(s => s.id === segmentId)
    if (!segment) return

    setLoading(true)
    try {
      const updatedSegment = await updateCustomSegment(segmentId, {
        ...segment,
        isActive: !segment.isActive
      })

      if (updatedSegment) {
        setSegments(segments.map(s => s.id === segmentId ? updatedSegment : s))
      } else {
        alert('Failed to update segment status. Please try again.')
      }
    } catch (error) {
      console.error('Error updating segment status:', error)
      alert('Failed to update segment status. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Get the appropriate value input based on rule type
  const getRuleValueInput = (rule: any) => {
    switch (rule.type) {
      case 'purchase':
      case 'visit':
        return (
          <Input
            type="number"
            value={rule.value}
            onChange={(e) => updateRule(rule.id, 'value', e.target.value)}
            className="w-[100px]"
          />
        )

      case 'product_category':
        return (
          <Select
            value={rule.value}
            onValueChange={(value) => updateRule(rule.id, 'value', value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.length > 0 ? (
                categoryOptions.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))
              ) : (
                <>
                  <SelectItem value="Clothing">Clothing</SelectItem>
                  <SelectItem value="Footwear">Footwear</SelectItem>
                  <SelectItem value="Accessories">Accessories</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        )

      case 'age':
        return (
          <Select
            value={rule.value}
            onValueChange={(value) => updateRule(rule.id, 'value', value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select age range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="18-24">18-24 years</SelectItem>
              <SelectItem value="25-34">25-34 years</SelectItem>
              <SelectItem value="35-44">35-44 years</SelectItem>
              <SelectItem value="45-54">45-54 years</SelectItem>
              <SelectItem value="55-64">55-64 years</SelectItem>
              <SelectItem value="65+">65+ years</SelectItem>
            </SelectContent>
          </Select>
        )

      case 'gender':
        return (
          <Select
            value={rule.value}
            onValueChange={(value) => updateRule(rule.id, 'value', value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        )

      case 'location':
        return (
          <Input
            type="text"
            value={rule.value}
            onChange={(e) => updateRule(rule.id, 'value', e.target.value)}
            className="w-[200px]"
            placeholder="City, State, or Country"
          />
        )

      case 'material':
        return (
          <Select
            value={rule.value}
            onValueChange={(value) => updateRule(rule.id, 'value', value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select material" />
            </SelectTrigger>
            <SelectContent>
              {materialOptions.length > 0 ? (
                materialOptions.map(material => (
                  <SelectItem key={material} value={material}>{material}</SelectItem>
                ))
              ) : (
                <>
                  <SelectItem value="Cotton">Cotton</SelectItem>
                  <SelectItem value="Leather">Leather</SelectItem>
                  <SelectItem value="Synthetic">Synthetic</SelectItem>
                  <SelectItem value="Wool">Wool</SelectItem>
                  <SelectItem value="Denim">Denim</SelectItem>
                  <SelectItem value="Polyester">Polyester</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        )

      case 'preference_segment':
        return (
          <Select
            value={rule.value}
            onValueChange={(value) => updateRule(rule.id, 'value', value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select preference segment" />
            </SelectTrigger>
            <SelectContent>
              {preferenceSegmentOptions.length > 0 ? (
                preferenceSegmentOptions.map(segment => (
                  <SelectItem key={segment} value={segment}>{segment}</SelectItem>
                ))
              ) : (
                <>
                  <SelectItem value="Fashion Enthusiasts">Fashion Enthusiasts</SelectItem>
                  <SelectItem value="Casual Shoppers">Casual Shoppers</SelectItem>
                  <SelectItem value="Seasonal Buyers">Seasonal Buyers</SelectItem>
                  <SelectItem value="Brand Loyalists">Brand Loyalists</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        )

      case 'rfm_segment':
        return (
          <Select
            value={rule.value}
            onValueChange={(value) => updateRule(rule.id, 'value', value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select RFM segment" />
            </SelectTrigger>
            <SelectContent>
              {rfmSegmentOptions.length > 0 ? (
                rfmSegmentOptions.map(segment => (
                  <SelectItem key={segment} value={segment}>{segment}</SelectItem>
                ))
              ) : (
                <>
                  <SelectItem value="Champions">Champions</SelectItem>
                  <SelectItem value="Loyal Customers">Loyal Customers</SelectItem>
                  <SelectItem value="Potential Loyalists">Potential Loyalists</SelectItem>
                  <SelectItem value="New Customers">New Customers</SelectItem>
                  <SelectItem value="At Risk">At Risk</SelectItem>
                  <SelectItem value="Lost Customers">Lost Customers</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        )

      default:
        return (
          <Input
            type="text"
            value={rule.value}
            onChange={(e) => updateRule(rule.id, 'value', e.target.value)}
            className="w-[150px]"
          />
        )
    }
  }

  // Get the appropriate operators based on rule type
  const getRuleOperators = (ruleType: string) => {
    switch (ruleType) {
      case 'purchase':
        return [
          { value: 'greater_than', label: 'More than' },
          { value: 'less_than', label: 'Less than' },
          { value: 'equal_to', label: 'Exactly' }
        ]

      case 'product_category':
      case 'material':
        return [
          { value: 'is', label: 'Is' },
          { value: 'is_not', label: 'Is not' }
        ]

      case 'age':
        return [
          { value: 'is', label: 'Is' }
        ]

      case 'gender':
        return [
          { value: 'is', label: 'Is' }
        ]

      case 'preference_segment':
      case 'rfm_segment':
        return [
          { value: 'is', label: 'Is' },
          { value: 'is_not', label: 'Is not' }
        ]

      default:
        return [
          { value: 'is', label: 'Is' },
          { value: 'is_not', label: 'Is not' }
        ]
    }
  }

  // Get human-readable rule description
  const getRuleDescription = (rule: any) => {
    let typeLabel = ''
    let operatorLabel = ''
    let valueLabel = rule.value

    // Type labels
    switch (rule.type) {
      case 'purchase': typeLabel = 'Total purchases'; break
      case 'product_category': typeLabel = 'Product category'; break
      case 'age': typeLabel = 'Age group'; break
      case 'gender': typeLabel = 'Gender'; break
      case 'material': typeLabel = 'Product material'; break
      case 'preference_segment': typeLabel = 'Preference segment'; break
      case 'rfm_segment': typeLabel = 'Customer value segment'; break
      default: typeLabel = rule.type
    }

    // Operator labels
    switch (rule.operator) {
      case 'greater_than': operatorLabel = 'is more than'; break
      case 'less_than': operatorLabel = 'is less than'; break
      case 'equal_to': operatorLabel = 'is exactly'; break
      case 'is': operatorLabel = 'is'; break
      case 'is_not': operatorLabel = 'is not'; break
      case 'contains': operatorLabel = 'contains'; break
      case 'in_range': operatorLabel = 'is in range'; break
      default: operatorLabel = rule.operator
    }

    // Special case for age groups
    if (rule.type === 'age') {
      return `${typeLabel} ${operatorLabel} ${rule.value || 'unknown'}`
    }

    // Special case for product category
    if (rule.type === 'product_category') {
      // Already using capitalized values, no need to transform
      valueLabel = rule.value;
    }

    // Special case for gender
    if (rule.type === 'gender') {
      // Values are already capitalized, no need to transform
      valueLabel = rule.value;
    }

    return `${typeLabel} ${operatorLabel} ${valueLabel}`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Customer Group Builder</CardTitle>
              <CardDescription>
                Create groups of customers with similar characteristics for targeted marketing
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={checkApiHealth}
                disabled={checkingHealth}
                title="Refresh"
              >
                {checkingHealth ? (
                  <ReloadIcon className="h-3 w-3 animate-spin" />
                ) : (
                  <ReloadIcon className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>


          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="create">Create Customer Group</TabsTrigger>
              <TabsTrigger value="manage">View Saved Groups</TabsTrigger>
            </TabsList>

            <TabsContent value="create">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="segment-name">Group Name</Label>
                    <Input
                      id="segment-name"
                      value={currentSegment.name}
                      onChange={(e) => setCurrentSegment({ ...currentSegment, name: e.target.value })}
                      placeholder="e.g., Female Fashion Enthusiasts"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="segment-active" className="block mb-2">Group Status</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="segment-active"
                        checked={currentSegment.isActive}
                        onCheckedChange={(checked) => setCurrentSegment({ ...currentSegment, isActive: checked })}
                      />
                      <Label htmlFor="segment-active">
                        {currentSegment.isActive ? 'Active' : 'Inactive'}
                      </Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="segment-description">Group Description</Label>
                  <Input
                    id="segment-description"
                    value={currentSegment.description}
                    onChange={(e) => setCurrentSegment({ ...currentSegment, description: e.target.value })}
                    placeholder="Describe who should be in this customer group"
                    className="mt-1"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Selection Criteria</Label>
                    <Button variant="outline" size="sm" onClick={addRule}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Criteria
                    </Button>
                  </div>

                  {currentSegment.rules.length === 0 ? (
                    <div className="border border-dashed rounded-md p-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        No criteria added yet. Click "Add Criteria" to select which customers should be in this group.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentSegment.rules.map((rule: any, index: number) => (
                        <div key={rule.id} className="flex items-center gap-2 bg-muted p-3 rounded-md">
                          {index > 0 && (
                            <Badge variant="outline" className="mr-1">AND</Badge>
                          )}

                          <Select
                            value={rule.type}
                            onValueChange={(value) => updateRule(rule.id, 'type', value)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select a field" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="purchase">Total Purchases</SelectItem>
                              <SelectItem value="product_category">Product Category</SelectItem>
                              <SelectItem value="material">Product Material</SelectItem>
                              <SelectItem value="age">Age Group</SelectItem>
                              <SelectItem value="gender">Gender</SelectItem>
                              <SelectItem value="rfm_segment">Customer Value Segment</SelectItem>
                              <SelectItem value="preference_segment">Preference Segment</SelectItem>
                            </SelectContent>
                          </Select>

                          <Select
                            value={rule.operator}
                            onValueChange={(value) => updateRule(rule.id, 'operator', value)}
                          >
                            <SelectTrigger className="w-[150px]">
                              <SelectValue placeholder="Operator" />
                            </SelectTrigger>
                            <SelectContent>
                              {getRuleOperators(rule.type).map(op => (
                                <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {getRuleValueInput(rule)}

                          <Button variant="ghost" size="icon" onClick={() => removeRule(rule.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {currentSegment.rules.length > 0 && (
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="text-sm font-medium mb-2">Group Summary</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      This group will include customers who match ALL of these criteria:
                    </p>
                    <div className="space-y-1">
                      {currentSegment.rules.map((rule: any) => (
                        <div key={rule.id} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{getRuleDescription(rule)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentSegment.rules && currentSegment.rules.length > 0 && (
                  <div className="bg-muted p-4 rounded-md mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-medium">Group Size Estimate</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={previewSegment}
                        disabled={previewLoading}
                      >
                        {previewLoading ? (
                          <ReloadIcon className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <ReloadIcon className="h-4 w-4 mr-2" />
                        )}
                        Preview Group Size
                      </Button>
                    </div>

                    {previewData ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Estimated customers in group:</span>
                          <span className="font-medium">{previewData.count.toLocaleString()}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>0%</span>
                            <span>100%</span>
                          </div>
                          <Progress value={previewData.percentage} className="h-2" />
                          <div className="text-right text-xs text-muted-foreground">
                            {previewData.percentage}% of total customers
                          </div>
                        </div>
                      </div>
                    ) : previewLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <ReloadIcon className="h-5 w-5 animate-spin mr-2" />
                        <span>Calculating group size...</span>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground text-center py-2">
                        Click "Preview Group Size" to see how many customers match these criteria
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    onClick={saveSegment}
                    disabled={loading || !currentSegment.name || !(currentSegment.rules && currentSegment.rules.length > 0)}
                  >
                    {loading ? (
                      <ReloadIcon className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Customer Group
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="manage">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <ReloadIcon className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading customer groups...</span>
                </div>
              ) : segments.length === 0 ? (
                <div className="border border-dashed rounded-md p-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    No customer groups created yet
                  </p>
                  <Button onClick={() => setActiveTab('create')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Customer Group
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {segments.map(segment => (
                    <Card key={segment.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <CardTitle>{segment.name}</CardTitle>
                              <Badge variant={segment.isActive ? 'default' : 'secondary'}>
                                {segment.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            {segment.description && (
                              <CardDescription className="mt-1">
                                {segment.description}
                              </CardDescription>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => editSegment(segment)}>
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => toggleSegmentActive(segment.id)}>
                              {segment.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => deleteSegment(segment.id)}>
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="bg-muted p-3 rounded-md">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-xs font-medium text-muted-foreground mb-1">Group Size</h4>
                                <p className="text-lg font-medium">{segment.customerCount?.toLocaleString() || 'N/A'} customers</p>
                              </div>

                            </div>
                            <div className="w-full bg-background rounded-full h-2 mt-2">
                              <div
                                className="h-2 rounded-full bg-primary"
                                style={{ width: `${segment.customerPercentage || 0}%` }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {segment.customerPercentage || 0}% of total customers
                            </p>
                          </div>

                          <div className="bg-muted p-3 rounded-md">
                            <h4 className="text-xs font-medium text-muted-foreground mb-1">Last Updated</h4>
                            <p className="text-sm">
                              {segment.updatedAt ? new Date(segment.updatedAt).toLocaleDateString() : 'N/A'}
                            </p>
                            <div className="flex flex-col gap-2 mt-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                  // Open a new tab to view customers
                                  const url = `/segment-customers/${segment.id}`;
                                  window.open(url, '_blank');
                                }}
                              >
                                <Filter className="h-3 w-3 mr-1" />
                                View Customers
                              </Button>

                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={async () => {
                                    try {
                                      setLoading(true);
                                      const exportData = await exportSegmentCustomers(segment.id, 'all');
                                      alert(`Exported ${exportData.customer_count} customers for marketing`);
                                    } catch (error) {
                                      console.error('Error exporting customers:', error);
                                      alert('Failed to export customers. Please try again.');
                                    } finally {
                                      setLoading(false);
                                    }
                                  }}
                                >
                                  <ArrowRight className="h-3 w-3 mr-1" />
                                  Export for Marketing
                                </Button>

                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="flex-1"
                                  onClick={async () => {
                                    try {
                                      setLoading(true);
                                      await exportSegmentCustomers(segment.id, 'csv');
                                    } catch (error) {
                                      console.error('Error exporting CSV:', error);
                                      alert('Failed to export CSV. Please try again.');
                                    } finally {
                                      setLoading(false);
                                    }
                                  }}
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  Export CSV
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <h3 className="text-sm font-medium mb-2">Selection Criteria</h3>
                        <div className="space-y-1">
                          {segment.rules.map((rule: any, index: number) => (
                            <div key={rule.id} className="flex items-center gap-2">
                              {index > 0 && (
                                <Badge variant="outline" className="mr-1">AND</Badge>
                              )}
                              <span className="text-sm">{getRuleDescription(rule)}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <div className="mt-6">
                <Button onClick={() => setActiveTab('create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Customer Group
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Alert>
        <InfoCircledIcon className="h-4 w-4" />
        <AlertTitle>Customer Group Usage</AlertTitle>
        <AlertDescription>
          Customer groups help you target specific types of customers for marketing campaigns.
          Create groups based on customer characteristics like age, gender, and purchase history.
        </AlertDescription>
      </Alert>
    </div>
  )
}
