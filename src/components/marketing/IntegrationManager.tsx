import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Mail, MessageSquare, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { 
  getIntegrations, 
  createIntegration, 
  testIntegration, 
  Integration 
} from '@/services/marketingApi';

const IntegrationManager = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('email');
  const [isCreating, setIsCreating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testPhone, setTestPhone] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      name: '',
      provider: '',
      type: activeTab,
      isActive: true,
      credentials: {
        apiKey: '',
        accountSid: '',
        authToken: '',
        from: '',
        username: '',
        password: '',
        region: '',
      }
    }
  });

  // Load integrations on component mount
  useEffect(() => {
    fetchIntegrations();
  }, []);

  // Fetch integrations from API
  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const data = await getIntegrations();
      setIntegrations(data);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load integrations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    form.setValue('type', value);
  };

  // Handle form submission
  const onSubmit = async (data: any) => {
    setIsCreating(true);
    try {
      // Create integration
      const newIntegration = await createIntegration({
        ...data,
        type: activeTab,
      });
      
      // Update integrations list
      setIntegrations([...integrations, newIntegration]);
      
      // Reset form
      form.reset();
      
      // Close dialog
      setOpenDialog(false);
      
      // Show success toast
      toast({
        title: 'Integration created',
        description: `${data.name} has been created successfully`,
      });
    } catch (error) {
      console.error('Error creating integration:', error);
      toast({
        title: 'Error',
        description: 'Failed to create integration',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Handle test integration
  const handleTestIntegration = async (integration: Integration) => {
    setIsTesting(true);
    try {
      // Get test recipient based on integration type
      const testRecipient = integration.type === 'email' ? testEmail : testPhone;
      
      if (!testRecipient) {
        toast({
          title: 'Error',
          description: `Please enter a test ${integration.type === 'email' ? 'email' : 'phone number'}`,
          variant: 'destructive',
        });
        setIsTesting(false);
        return;
      }
      
      // Test integration
      const success = await testIntegration({
        ...integration,
        testRecipient,
      });
      
      // Show result toast
      if (success) {
        toast({
          title: 'Test successful',
          description: `Test message sent to ${testRecipient}`,
        });
      } else {
        toast({
          title: 'Test failed',
          description: 'Failed to send test message',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error testing integration:', error);
      toast({
        title: 'Error',
        description: 'Failed to test integration',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Render provider-specific form fields
  const renderProviderFields = () => {
    const provider = form.watch('provider');
    
    if (!provider) return null;
    
    if (activeTab === 'email') {
      if (provider === 'sendgrid') {
        return (
          <>
            <FormField
              control={form.control}
              name="credentials.apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input placeholder="SG.xxxxxxxxxxxxxxxxxxxxxxxx" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your SendGrid API key
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="credentials.from"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Email</FormLabel>
                  <FormControl>
                    <Input placeholder="marketing@yourdomain.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    The email address that will appear as the sender
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      } else if (provider === 'mailchimp') {
        return (
          <>
            <FormField
              control={form.control}
              name="credentials.apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input placeholder="xxxxxxxxxxxxxxxxxxxxxxxx-us6" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your Mailchimp API key
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="credentials.region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region</FormLabel>
                  <FormControl>
                    <Input placeholder="us6" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your Mailchimp region (e.g., us6)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      } else if (provider === 'smtp') {
        return (
          <>
            <FormField
              control={form.control}
              name="credentials.server"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SMTP Server</FormLabel>
                  <FormControl>
                    <Input placeholder="smtp.yourdomain.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="credentials.port"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SMTP Port</FormLabel>
                  <FormControl>
                    <Input placeholder="587" type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="credentials.username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="credentials.password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="password" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="credentials.from"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Email</FormLabel>
                  <FormControl>
                    <Input placeholder="marketing@yourdomain.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      }
    } else if (activeTab === 'sms') {
      if (provider === 'twilio') {
        return (
          <>
            <FormField
              control={form.control}
              name="credentials.accountSid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account SID</FormLabel>
                  <FormControl>
                    <Input placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your Twilio Account SID
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="credentials.authToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Auth Token</FormLabel>
                  <FormControl>
                    <Input placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your Twilio Auth Token
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="credentials.from"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+15551234567" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your Twilio phone number
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      } else if (provider === 'dialog') {
        return (
          <>
            <FormField
              control={form.control}
              name="credentials.apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your Dialog API key
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="credentials.from"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sender ID</FormLabel>
                  <FormControl>
                    <Input placeholder="LankaCRM" {...field} />
                  </FormControl>
                  <FormDescription>
                    The sender ID that will appear as the sender
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      }
    }
    
    return null;
  };

  // Render provider options based on integration type
  const renderProviderOptions = () => {
    if (activeTab === 'email') {
      return (
        <>
          <SelectItem value="sendgrid">SendGrid</SelectItem>
          <SelectItem value="mailchimp">Mailchimp</SelectItem>
          <SelectItem value="smtp">SMTP</SelectItem>
        </>
      );
    } else if (activeTab === 'sms') {
      return (
        <>
          <SelectItem value="twilio">Twilio</SelectItem>
          <SelectItem value="dialog">Dialog</SelectItem>
        </>
      );
    }
    
    return null;
  };

  // Filter integrations by type
  const filteredIntegrations = integrations.filter(
    integration => integration.type === activeTab
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Marketing Integrations</h2>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Integration
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Integration</DialogTitle>
              <DialogDescription>
                Connect with third-party services to send emails and SMS messages.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <Tabs value={activeTab} onValueChange={handleTabChange}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="email">
                      <Mail className="mr-2 h-4 w-4" />
                      Email
                    </TabsTrigger>
                    <TabsTrigger value="sms">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      SMS
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Integration Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My SendGrid Account" {...field} />
                      </FormControl>
                      <FormDescription>
                        A name to identify this integration
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {renderProviderOptions()}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The service provider for this integration
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {renderProviderFields()}
                
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <FormDescription>
                          Enable or disable this integration
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Integration
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="email" value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="email">
            <Mail className="mr-2 h-4 w-4" />
            Email Integrations
          </TabsTrigger>
          <TabsTrigger value="sms">
            <MessageSquare className="mr-2 h-4 w-4" />
            SMS Integrations
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="email" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Service Providers</CardTitle>
              <CardDescription>
                Connect with email service providers to send marketing emails.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredIntegrations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No email integrations found.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click "Add Integration" to connect an email service provider.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>From Email</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIntegrations.map((integration) => (
                      <TableRow key={integration.id}>
                        <TableCell className="font-medium">{integration.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {integration.provider}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {integration.isActive ? (
                            <Badge variant="success" className="bg-green-100 text-green-800">
                              <Check className="mr-1 h-3 w-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="bg-red-100 text-red-800">
                              <AlertCircle className="mr-1 h-3 w-3" />
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{integration.credentials.from}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Input
                              placeholder="Test email"
                              className="w-40"
                              value={testEmail}
                              onChange={(e) => setTestEmail(e.target.value)}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTestIntegration(integration)}
                              disabled={isTesting}
                            >
                              {isTesting && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                              Test
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sms" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>SMS Service Providers</CardTitle>
              <CardDescription>
                Connect with SMS service providers to send marketing text messages.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredIntegrations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No SMS integrations found.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click "Add Integration" to connect an SMS service provider.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>From Number/ID</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIntegrations.map((integration) => (
                      <TableRow key={integration.id}>
                        <TableCell className="font-medium">{integration.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {integration.provider}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {integration.isActive ? (
                            <Badge variant="success" className="bg-green-100 text-green-800">
                              <Check className="mr-1 h-3 w-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="bg-red-100 text-red-800">
                              <AlertCircle className="mr-1 h-3 w-3" />
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{integration.credentials.from}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Input
                              placeholder="Test phone"
                              className="w-40"
                              value={testPhone}
                              onChange={(e) => setTestPhone(e.target.value)}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTestIntegration(integration)}
                              disabled={isTesting}
                            >
                              {isTesting && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                              Test
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationManager;
