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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { DashboardBuilder } from '@/components/dashboard/DashboardBuilder';
import { 
  ArrowLeft, 
  Plus, 
  Save, 
  Trash2, 
  Eye, 
  Layout, 
  LayoutGrid,
  LayoutList
} from 'lucide-react';
import { 
  saveDashboardConfig, 
  getDashboardConfigs, 
  getDashboardConfigById,
  deleteDashboardConfig
} from '@/services/dashboardApi';
import { toast } from '@/components/ui/use-toast';

export default function DashboardBuilderPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('create');
  const [dashboardConfigs, setDashboardConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<any>({
    name: '',
    description: '',
    layout: 'grid',
    isDefault: false,
    items: []
  });

  // Load saved dashboard configurations
  useEffect(() => {
    const loadConfigs = async () => {
      setLoading(true);
      try {
        const configs = await getDashboardConfigs();
        setDashboardConfigs(configs);
      } catch (error) {
        console.error('Error loading dashboard configurations:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard configurations',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadConfigs();
  }, []);

  // Add a new dashboard item
  const addDashboardItem = (type: 'segment' | 'combined') => {
    const newItem = {
      id: `item-${Date.now()}`,
      type,
      title: type === 'segment' ? 'Segment Visualization' : 'Combined Segments',
      visualizationType: 'pie',
      filters: [],
      segments: []
    };

    setCurrentConfig({
      ...currentConfig,
      items: [...currentConfig.items, newItem]
    });
  };

  // Save the current dashboard configuration
  const saveDashboard = async () => {
    if (!currentConfig.name) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a name for your dashboard',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const savedConfig = await saveDashboardConfig(currentConfig);
      
      // Update the list of configurations
      if (currentConfig.id) {
        setDashboardConfigs(dashboardConfigs.map(config => 
          config.id === savedConfig.id ? savedConfig : config
        ));
      } else {
        setDashboardConfigs([...dashboardConfigs, savedConfig]);
      }

      // Reset the current config
      setCurrentConfig({
        name: '',
        description: '',
        layout: 'grid',
        isDefault: false,
        items: []
      });

      // Switch to manage tab
      setActiveTab('manage');

      toast({
        title: 'Success',
        description: 'Dashboard configuration saved successfully',
      });
    } catch (error) {
      console.error('Error saving dashboard configuration:', error);
      toast({
        title: 'Error',
        description: 'Failed to save dashboard configuration',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Edit an existing dashboard configuration
  const editDashboard = async (id: string) => {
    setLoading(true);
    try {
      const config = await getDashboardConfigById(id);
      setCurrentConfig(config);
      setActiveTab('create');
    } catch (error) {
      console.error('Error loading dashboard configuration:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard configuration',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete a dashboard configuration
  const deleteDashboard = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dashboard configuration?')) {
      return;
    }

    setLoading(true);
    try {
      await deleteDashboardConfig(id);
      setDashboardConfigs(dashboardConfigs.filter(config => config.id !== id));
      toast({
        title: 'Success',
        description: 'Dashboard configuration deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting dashboard configuration:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete dashboard configuration',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Set a dashboard as default
  const setAsDefault = async (id: string) => {
    const updatedConfigs = dashboardConfigs.map(config => ({
      ...config,
      isDefault: config.id === id
    }));

    setLoading(true);
    try {
      // Update each config
      for (const config of updatedConfigs) {
        if (config.isDefault || config.id === id) {
          await saveDashboardConfig(config);
        }
      }

      setDashboardConfigs(updatedConfigs);
      toast({
        title: 'Success',
        description: 'Default dashboard set successfully',
      });
    } catch (error) {
      console.error('Error setting default dashboard:', error);
      toast({
        title: 'Error',
        description: 'Failed to set default dashboard',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Preview a dashboard
  const previewDashboard = (id: string) => {
    navigate(`/dashboard?config=${id}`);
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Dashboard Builder</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customize Your Dashboard</CardTitle>
          <CardDescription>
            Create and manage custom dashboard layouts with the visualizations you need
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="create">Create Dashboard</TabsTrigger>
              <TabsTrigger value="manage">Manage Dashboards</TabsTrigger>
            </TabsList>

            <TabsContent value="create">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dashboard-name">Dashboard Name</Label>
                    <Input
                      id="dashboard-name"
                      value={currentConfig.name}
                      onChange={(e) => setCurrentConfig({
                        ...currentConfig,
                        name: e.target.value
                      })}
                      placeholder="My Custom Dashboard"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dashboard-layout">Layout</Label>
                    <Select
                      value={currentConfig.layout}
                      onValueChange={(value) => setCurrentConfig({
                        ...currentConfig,
                        layout: value
                      })}
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
                    value={currentConfig.description}
                    onChange={(e) => setCurrentConfig({
                      ...currentConfig,
                      description: e.target.value
                    })}
                    placeholder="A brief description of this dashboard"
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is-default"
                    checked={currentConfig.isDefault}
                    onChange={(e) => setCurrentConfig({
                      ...currentConfig,
                      isDefault: e.target.checked
                    })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="is-default">Set as default dashboard</Label>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Dashboard Items</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => addDashboardItem('segment')}>
                        <Plus className="h-3 w-3 mr-1" />
                        Add Segment
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addDashboardItem('combined')}>
                        <Plus className="h-3 w-3 mr-1" />
                        Add Combined
                      </Button>
                    </div>
                  </div>

                  {currentConfig.items.length === 0 ? (
                    <div className="text-center p-8 border border-dashed rounded-md">
                      <Layout className="h-8 w-8 mx-auto text-muted-foreground" />
                      <h3 className="mt-2 text-lg font-medium">No items added</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add segments or combined visualizations to your dashboard
                      </p>
                    </div>
                  ) : (
                    <DashboardBuilder
                      items={currentConfig.items}
                      setDashboardItems={(items) => setCurrentConfig({
                        ...currentConfig,
                        items
                      })}
                    />
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="manage">
              {dashboardConfigs.length === 0 ? (
                <div className="text-center p-8 border border-dashed rounded-md">
                  <Layout className="h-8 w-8 mx-auto text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-medium">No dashboards saved</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create your first custom dashboard to get started
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setActiveTab('create')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Dashboard
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardConfigs.map(config => (
                    <Card key={config.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{config.name}</CardTitle>
                            <CardDescription>{config.description}</CardDescription>
                          </div>
                          {config.isDefault && (
                            <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                              Default
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Layout className="h-4 w-4 mr-1" />
                          <span>
                            {config.layout === 'grid' ? 'Grid Layout' : 'List Layout'} • 
                            {config.items.length} {config.items.length === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => editDashboard(config.id)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteDashboard(config.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          {!config.isDefault && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setAsDefault(config.id)}
                            >
                              Set as Default
                            </Button>
                          )}
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => previewDashboard(config.id)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </Button>
          {activeTab === 'create' && (
            <Button 
              onClick={saveDashboard}
              disabled={loading || !currentConfig.name}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Dashboard
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
