import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Mail,
  MessageSquare,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Send
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { getIntegrations, testIntegration, createIntegration, Integration } from "@/services/marketingApi";

export function IntegrationSettings() {
  const [activeTab, setActiveTab] = useState("email");
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newIntegration, setNewIntegration] = useState<Partial<Integration>>({
    name: "",
    provider: "sendgrid",
    type: "email",
    isActive: true,
    credentials: {
      apiKey: "",
      from: ""
    }
  });

  // Load integrations on component mount
  useEffect(() => {
    const loadIntegrations = async () => {
      setIsLoading(true);
      try {
        const data = await getIntegrations();
        setIntegrations(data);
      } catch (error) {
        console.error("Error loading integrations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadIntegrations();
  }, []);

  // Filter integrations by type
  const filteredIntegrations = integrations.filter(integration => integration.type === activeTab);

  // Test integration connection
  const handleTestConnection = async (integration: Integration) => {
    setSelectedIntegration(integration);
    setIsTestingConnection(true);
    setTestResult(null);

    try {
      const success = await testIntegration(integration);
      setTestResult(success ? "success" : "error");
    } catch (error) {
      console.error("Error testing integration:", error);
      setTestResult("error");
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Toggle integration status
  const handleToggleStatus = (integration: Integration) => {
    const updatedIntegrations = integrations.map(i =>
      i.id === integration.id ? { ...i, isActive: !i.isActive } : i
    );
    setIntegrations(updatedIntegrations);
  };

  // Edit integration
  const handleEditIntegration = (integration: Integration) => {
    setSelectedIntegration(integration);
    setIsEditing(true);
  };

  // Create new integration
  const handleCreateIntegration = async () => {
    if (!newIntegration.name) {
      toast({
        title: "Name required",
        description: "Please enter a name for the integration.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (newIntegration.type === "email" && newIntegration.provider === "sendgrid") {
      if (!newIntegration.credentials?.apiKey) {
        toast({
          title: "API Key required",
          description: "Please enter your SendGrid API key.",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      if (!newIntegration.credentials?.from) {
        toast({
          title: "From Email required",
          description: "Please enter a verified sender email address.",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }
    }

    setIsCreating(true);

    try {
      const createdIntegration = await createIntegration(newIntegration as any);

      // Add the new integration to the list
      setIntegrations([...integrations, createdIntegration]);

      // Reset form and close dialog
      setNewIntegration({
        name: "",
        provider: "sendgrid",
        type: activeTab as "email" | "sms",
        isActive: true,
        credentials: {
          apiKey: "",
          from: ""
        }
      });

      setIsDialogOpen(false);

      toast({
        title: "Integration created",
        description: "Your integration has been created successfully.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error creating integration:", error);
      toast({
        title: "Error creating integration",
        description: "There was an error creating your integration. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      {isEditing && selectedIntegration ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Edit Integration</CardTitle>
                <CardDescription>
                  Update your {selectedIntegration.type} integration settings
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="integration-name">Integration Name</Label>
                <Input
                  id="integration-name"
                  value={selectedIntegration.name}
                  onChange={(e) => setSelectedIntegration({
                    ...selectedIntegration,
                    name: e.target.value
                  })}
                />
              </div>

              {selectedIntegration.provider === "sendgrid" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="api-key">API Key</Label>
                    <Input
                      id="api-key"
                      type="password"
                      value={selectedIntegration.credentials.apiKey || ""}
                      onChange={(e) => setSelectedIntegration({
                        ...selectedIntegration,
                        credentials: {
                          ...selectedIntegration.credentials,
                          apiKey: e.target.value
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="from-email">From Email</Label>
                    <Input
                      id="from-email"
                      value={selectedIntegration.credentials.from || ""}
                      onChange={(e) => setSelectedIntegration({
                        ...selectedIntegration,
                        credentials: {
                          ...selectedIntegration.credentials,
                          from: e.target.value
                        }
                      })}
                    />
                  </div>
                </>
              )}

              {selectedIntegration.provider === "twilio" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="account-sid">Account SID</Label>
                    <Input
                      id="account-sid"
                      value={selectedIntegration.credentials.accountSid || ""}
                      onChange={(e) => setSelectedIntegration({
                        ...selectedIntegration,
                        credentials: {
                          ...selectedIntegration.credentials,
                          accountSid: e.target.value
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="auth-token">Auth Token</Label>
                    <Input
                      id="auth-token"
                      type="password"
                      value={selectedIntegration.credentials.authToken || ""}
                      onChange={(e) => setSelectedIntegration({
                        ...selectedIntegration,
                        credentials: {
                          ...selectedIntegration.credentials,
                          authToken: e.target.value
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="from-number">From Number</Label>
                    <Input
                      id="from-number"
                      value={selectedIntegration.credentials.from || ""}
                      onChange={(e) => setSelectedIntegration({
                        ...selectedIntegration,
                        credentials: {
                          ...selectedIntegration.credentials,
                          from: e.target.value
                        }
                      })}
                    />
                  </div>
                </>
              )}

              <div className="flex items-center space-x-2 pt-4">
                <Switch
                  id="active"
                  checked={selectedIntegration.isActive}
                  onCheckedChange={(checked) => setSelectedIntegration({
                    ...selectedIntegration,
                    isActive: checked
                  })}
                />
                <Label htmlFor="active">Active</Label>
              </div>

              <div className="pt-4 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => handleTestConnection(selectedIntegration)}
                  disabled={isTestingConnection}
                >
                  {isTestingConnection ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>
                <Button onClick={() => {
                  // Update the integration in the list
                  if (selectedIntegration) {
                    const updatedIntegrations = integrations.map(i =>
                      i.id === selectedIntegration.id ? selectedIntegration : i
                    );
                    setIntegrations(updatedIntegrations);

                    // Close the edit form
                    setIsEditing(false);

                    toast({
                      title: "Integration updated",
                      description: "Your integration has been updated successfully.",
                      duration: 3000,
                    });
                  }
                }}>
                  <Check className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>

              {testResult === "success" && (
                <Alert className="mt-4">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>
                    Connection to {selectedIntegration.name} was successful.
                  </AlertDescription>
                </Alert>
              )}

              {testResult === "error" && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Failed to connect to {selectedIntegration.name}. Please check your credentials.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="email">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Integrations
                </TabsTrigger>
                <TabsTrigger value="sms">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  SMS Integrations
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Integration
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Integration</DialogTitle>
                  <DialogDescription>
                    Connect to a third-party service to send emails or SMS messages.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="integration-name">Integration Name</Label>
                    <Input
                      id="integration-name"
                      placeholder="e.g., SendGrid Email Service"
                      value={newIntegration.name}
                      onChange={(e) => setNewIntegration({
                        ...newIntegration,
                        name: e.target.value
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="integration-provider">Provider</Label>
                    <Select
                      value={newIntegration.provider}
                      onValueChange={(value) => setNewIntegration({
                        ...newIntegration,
                        provider: value as any
                      })}
                    >
                      <SelectTrigger id="integration-provider">
                        <SelectValue placeholder="Select a provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeTab === "email" ? (
                          <>
                            <SelectItem value="sendgrid">SendGrid</SelectItem>
                            <SelectItem value="mailchimp">Mailchimp</SelectItem>
                            <SelectItem value="custom">Custom SMTP</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="twilio">Twilio</SelectItem>
                            <SelectItem value="messagebird">MessageBird</SelectItem>
                            <SelectItem value="dialog">Dialog</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {newIntegration.provider === "sendgrid" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="api-key">API Key</Label>
                        <Input
                          id="api-key"
                          type="password"
                          placeholder="Enter your SendGrid API key"
                          value={newIntegration.credentials?.apiKey || ""}
                          onChange={(e) => setNewIntegration({
                            ...newIntegration,
                            credentials: {
                              ...newIntegration.credentials,
                              apiKey: e.target.value
                            }
                          })}
                        />
                        <p className="text-xs text-muted-foreground">
                          You can find your API key in your SendGrid account settings.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="from-email">From Email</Label>
                        <Input
                          id="from-email"
                          placeholder="noreply@yourcompany.com"
                          value={newIntegration.credentials?.from || ""}
                          onChange={(e) => setNewIntegration({
                            ...newIntegration,
                            credentials: {
                              ...newIntegration.credentials,
                              from: e.target.value
                            }
                          })}
                        />
                        <p className="text-xs text-muted-foreground">
                          This must be a verified sender email in your SendGrid account.
                        </p>
                      </div>
                    </>
                  )}

                  {newIntegration.provider === "twilio" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="account-sid">Account SID</Label>
                        <Input
                          id="account-sid"
                          placeholder="Enter your Twilio Account SID"
                          value={newIntegration.credentials?.accountSid || ""}
                          onChange={(e) => setNewIntegration({
                            ...newIntegration,
                            credentials: {
                              ...newIntegration.credentials,
                              accountSid: e.target.value
                            }
                          })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="auth-token">Auth Token</Label>
                        <Input
                          id="auth-token"
                          type="password"
                          placeholder="Enter your Twilio Auth Token"
                          value={newIntegration.credentials?.authToken || ""}
                          onChange={(e) => setNewIntegration({
                            ...newIntegration,
                            credentials: {
                              ...newIntegration.credentials,
                              authToken: e.target.value
                            }
                          })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="from-number">From Number</Label>
                        <Input
                          id="from-number"
                          placeholder="+1234567890"
                          value={newIntegration.credentials?.from || ""}
                          onChange={(e) => setNewIntegration({
                            ...newIntegration,
                            credentials: {
                              ...newIntegration.credentials,
                              from: e.target.value
                            }
                          })}
                        />
                        <p className="text-xs text-muted-foreground">
                          This must be a phone number purchased in your Twilio account.
                        </p>
                      </div>
                    </>
                  )}

                  <div className="flex items-center space-x-2 pt-4">
                    <Switch
                      id="active-new"
                      checked={newIntegration.isActive}
                      onCheckedChange={(checked) => setNewIntegration({
                        ...newIntegration,
                        isActive: checked
                      })}
                    />
                    <Label htmlFor="active-new">Active</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateIntegration}
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Create Integration
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading integrations...</span>
            </div>
          ) : filteredIntegrations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                {activeTab === "email" ? (
                  <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                ) : (
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                )}
                <h3 className="text-lg font-medium mb-2">No {activeTab} integrations yet</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Set up your first {activeTab} integration to send marketing campaigns.
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Integration
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredIntegrations.map((integration) => (
                <Card key={integration.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">{integration.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {integration.type === "email" ? (
                            <span className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              Email Integration
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              SMS Integration
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleTestConnection(integration)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Test Connection
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditIntegration(integration)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 dark:text-red-400">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">Provider: {integration.provider}</p>
                        {integration.type === "email" && integration.credentials.from && (
                          <p className="text-sm text-muted-foreground mt-1">
                            From: {integration.credentials.from}
                          </p>
                        )}
                        {integration.type === "sms" && integration.credentials.from && (
                          <p className="text-sm text-muted-foreground mt-1">
                            From: {integration.credentials.from}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`active-${integration.id}`}
                          checked={integration.isActive}
                          onCheckedChange={() => handleToggleStatus(integration)}
                        />
                        <Label htmlFor={`active-${integration.id}`}>
                          {integration.isActive ? "Active" : "Inactive"}
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {selectedIntegration && testResult && (
                <Alert variant={testResult === "success" ? "default" : "destructive"}>
                  {testResult === "success" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>
                    {testResult === "success" ? "Success" : "Error"}
                  </AlertTitle>
                  <AlertDescription>
                    {testResult === "success"
                      ? `Connection to ${selectedIntegration.name} was successful.`
                      : `Failed to connect to ${selectedIntegration.name}. Please check your credentials.`
                    }
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
