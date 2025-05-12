import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { 
  ArrowLeft, 
  Save, 
  LayoutGrid,
  LayoutList,
  BarChart,
  PieChart,
  LineChart,
  Users,
  ShoppingCart,
  Mail
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { saveDashboardConfig, getDashboardConfigs } from '@/services/dashboardApi';

// Define the available data sources
const DATA_SOURCES = [
  {
    id: 'demographic',
    name: 'Demographic Segmentation',
    description: 'Age, gender, and location-based customer segments',
    icon: <Users className="h-5 w-5" />,
    visualizations: ['pie', 'bar', 'table'],
    service: 'segmentation'
  },
  {
    id: 'rfm',
    name: 'RFM Segmentation',
    description: 'Recency, frequency, and monetary value segments',
    icon: <Users className="h-5 w-5" />,
    visualizations: ['pie', 'bar', 'table'],
    service: 'segmentation'
  },
  {
    id: 'preference',
    name: 'Preference Segmentation',
    description: 'Product preference-based customer segments',
    icon: <Users className="h-5 w-5" />,
    visualizations: ['pie', 'bar', 'table'],
    service: 'segmentation'
  },
  {
    id: 'revenue',
    name: 'Revenue Analysis',
    description: 'Revenue trends and forecasts',
    icon: <ShoppingCart className="h-5 w-5" />,
    visualizations: ['line', 'bar'],
    service: 'revenue'
  },
  {
    id: 'sales',
    name: 'Sales Performance',
    description: 'Sales metrics and performance indicators',
    icon: <ShoppingCart className="h-5 w-5" />,
    visualizations: ['line', 'bar'],
    service: 'revenue'
  },
  {
    id: 'marketing',
    name: 'Marketing Performance',
    description: 'Campaign performance and metrics',
    icon: <Mail className="h-5 w-5" />,
    visualizations: ['line', 'bar', 'pie'],
    service: 'marketing'
  }
];

// Define the available visualization types
const VISUALIZATION_TYPES = [
  {
    id: 'pie',
    name: 'Pie Chart',
    icon: <PieChart className="h-5 w-5" />
  },
  {
    id: 'bar',
    name: 'Bar Chart',
    icon: <BarChart className="h-5 w-5" />
  },
  {
    id: 'line',
    name: 'Line Chart',
    icon: <LineChart className="h-5 w-5" />
  },
  {
    id: 'table',
    name: 'Table',
    icon: <LayoutList className="h-5 w-5" />
  }
];

export default function SimpleDashboardBuilder() {
  const navigate = useNavigate();
  const [dashboardName, setDashboardName] = useState('');
  const [dashboardDescription, setDashboardDescription] = useState('');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [isDefault, setIsDefault] = useState(false);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [visualizationTypes, setVisualizationTypes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Handle source selection
  const toggleSource = (sourceId: string) => {
    if (selectedSources.includes(sourceId)) {
      setSelectedSources(selectedSources.filter(id => id !== sourceId));
      
      // Remove visualization type for this source
      const newVisualizationTypes = { ...visualizationTypes };
      delete newVisualizationTypes[sourceId];
      setVisualizationTypes(newVisualizationTypes);
    } else {
      setSelectedSources([...selectedSources, sourceId]);
      
      // Set default visualization type for this source
      const source = DATA_SOURCES.find(s => s.id === sourceId);
      if (source && source.visualizations.length > 0) {
        setVisualizationTypes({
          ...visualizationTypes,
          [sourceId]: source.visualizations[0]
        });
      }
    }
  };

  // Handle visualization type selection
  const setVisualizationType = (sourceId: string, type: string) => {
    setVisualizationTypes({
      ...visualizationTypes,
      [sourceId]: type
    });
  };

  // Save dashboard configuration
  const saveDashboard = async () => {
    if (!dashboardName) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a name for your dashboard',
        variant: 'destructive'
      });
      return;
    }

    if (selectedSources.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one data source',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Convert selected sources to dashboard items
      const items = selectedSources.map(sourceId => {
        const source = DATA_SOURCES.find(s => s.id === sourceId);
        return {
          id: `item-${Date.now()}-${sourceId}`,
          type: 'data-source',
          title: source?.name || 'Unknown Source',
          sourceId,
          service: source?.service || 'unknown',
          visualizationType: visualizationTypes[sourceId] || 'pie'
        };
      });

      // Create dashboard config
      const dashboardConfig = {
        name: dashboardName,
        description: dashboardDescription,
        layout,
        isDefault,
        items
      };

      // Save dashboard config
      await saveDashboardConfig(dashboardConfig);

      toast({
        title: 'Success',
        description: 'Dashboard saved successfully'
      });

      // Navigate back to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving dashboard:', error);
      toast({
        title: 'Error',
        description: 'Failed to save dashboard',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Simple Dashboard Builder</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Your Dashboard</CardTitle>
          <CardDescription>
            Select the data sources and visualizations you want to include in your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dashboard-name">Dashboard Name</Label>
              <Input
                id="dashboard-name"
                value={dashboardName}
                onChange={(e) => setDashboardName(e.target.value)}
                placeholder="My Custom Dashboard"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="dashboard-layout">Layout</Label>
              <Select
                value={layout}
                onValueChange={(value: 'grid' | 'list') => setLayout(value)}
              >
                <SelectTrigger id="dashboard-layout" className="mt-1">
                  <SelectValue placeholder="Select layout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">
                    <div className="flex items-center">
                      <LayoutGrid className="h-4 w-4 mr-2" />
                      Grid Layout
                    </div>
                  </SelectItem>
                  <SelectItem value="list">
                    <div className="flex items-center">
                      <LayoutList className="h-4 w-4 mr-2" />
                      List Layout
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="dashboard-description">Description</Label>
            <Input
              id="dashboard-description"
              value={dashboardDescription}
              onChange={(e) => setDashboardDescription(e.target.value)}
              placeholder="A brief description of this dashboard"
              className="mt-1"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is-default"
              checked={isDefault}
              onCheckedChange={(checked) => setIsDefault(checked as boolean)}
            />
            <Label htmlFor="is-default">Set as default dashboard</Label>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-4">Select Data Sources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DATA_SOURCES.map((source) => (
                <Card key={source.id} className={`cursor-pointer transition-all ${selectedSources.includes(source.id) ? 'ring-2 ring-primary' : 'hover:bg-muted/50'}`} onClick={() => toggleSource(source.id)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {source.icon}
                        <CardTitle className="text-base">{source.name}</CardTitle>
                      </div>
                      <Checkbox checked={selectedSources.includes(source.id)} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{source.description}</p>
                    
                    {selectedSources.includes(source.id) && (
                      <div className="mt-4">
                        <Label className="text-xs">Visualization Type</Label>
                        <Select
                          value={visualizationTypes[source.id] || source.visualizations[0]}
                          onValueChange={(value) => setVisualizationType(source.id, value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select visualization" />
                          </SelectTrigger>
                          <SelectContent>
                            {source.visualizations.map((vizType) => {
                              const viz = VISUALIZATION_TYPES.find(v => v.id === vizType);
                              return (
                                <SelectItem key={vizType} value={vizType}>
                                  <div className="flex items-center">
                                    {viz?.icon}
                                    <span className="ml-2">{viz?.name}</span>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </Button>
          <Button 
            onClick={saveDashboard}
            disabled={loading || !dashboardName || selectedSources.length === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
