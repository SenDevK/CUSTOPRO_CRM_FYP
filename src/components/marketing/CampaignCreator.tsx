import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  ArrowLeft,
  Save,
  Send,
  Calendar,
  Mail,
  MessageSquare,
  Users,
  FileText,
  Settings,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SegmentSelector } from "./SegmentSelector";
import { SimpleEmailTemplateEditor } from "./SimpleEmailTemplateEditor";
import { SimpleSMSTemplateEditor } from "./SimpleSMSTemplateEditor";
import { CampaignScheduler } from "./CampaignScheduler";
import {
  createCampaign,
  getTemplates,
  getIntegrations,
  sendTestMessage,
  Campaign,
  Template,
  Integration
} from "@/services/marketingApi";
import { Segment } from "@/services/segmentationApi";

interface CampaignCreatorProps {
  onCancel: () => void;
  onSave: (campaign: Campaign) => void;
  editCampaign?: Campaign;
}

export function CampaignCreator({ onCancel, onSave, editCampaign }: CampaignCreatorProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [campaignType, setCampaignType] = useState<"email" | "sms">(editCampaign?.type || "email");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [testRecipient, setTestRecipient] = useState("");
  const [testStatus, setTestStatus] = useState<"idle" | "success" | "error">("idle");
  const [testMessage, setTestMessage] = useState("");

  // Campaign data
  const [campaignData, setCampaignData] = useState<Partial<Campaign>>({
    name: editCampaign?.name || "",
    description: editCampaign?.description || "",
    type: editCampaign?.type || "email",
    segmentId: editCampaign?.segmentId || "",
    segmentName: editCampaign?.segmentName || "",
    templateId: editCampaign?.templateId || "",
    content: editCampaign?.content || "",
    subject: editCampaign?.subject || "",
    status: "draft",
    integrationId: editCampaign?.integrationId || "",
    settings: editCampaign?.settings || {
      sender: "",
      replyTo: "",
      trackOpens: true,
      trackClicks: true,
      personalizeContent: true
    }
  });

  // Selected segment
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);

  // Load templates and integrations
  useEffect(() => {
    const loadData = async () => {
      try {
        const templatesData = await getTemplates(campaignType);
        setTemplates(templatesData);

        const integrationsData = await getIntegrations(campaignType);
        setIntegrations(integrationsData.filter(i => i.isActive));

        // Set default integration if available
        if (integrationsData.length > 0 && !campaignData.integrationId) {
          const defaultIntegration = integrationsData.find(i => i.isActive);
          if (defaultIntegration) {
            setCampaignData({
              ...campaignData,
              integrationId: defaultIntegration.id
            });
          }
        }
      } catch (error) {
        console.error("Error loading templates or integrations:", error);
      }
    };

    loadData();
  }, [campaignType]);

  // Update campaign data
  const updateCampaignData = (field: string, value: any) => {
    setCampaignData({
      ...campaignData,
      [field]: value
    });
  };

  // Update campaign settings
  const updateCampaignSettings = (field: string, value: any) => {
    setCampaignData({
      ...campaignData,
      settings: {
        ...campaignData.settings,
        [field]: value
      }
    });
  };

  // Handle segment selection
  const handleSegmentSelected = (segment: Segment) => {
    setSelectedSegment(segment);
    setCampaignData({
      ...campaignData,
      segmentId: segment.id,
      segmentName: segment.name
    });
  };

  // Handle template selection
  const handleTemplateSelected = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setCampaignData({
        ...campaignData,
        templateId: template.id,
        content: template.content,
        subject: template.subject
      });
    }
  };

  // Handle content update
  const handleContentUpdate = (content: string, subject?: string) => {
    const updates: any = { content };
    if (subject) updates.subject = subject;

    setCampaignData({
      ...campaignData,
      ...updates
    });
  };

  // Handle save
  const handleSave = async () => {
    setIsLoading(true);
    try {
      const campaign = await createCampaign(campaignData as any);
      onSave(campaign);
    } catch (error) {
      console.error("Error saving campaign:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle send test
  const handleSendTest = async () => {
    if (!testRecipient) {
      setTestStatus("error");
      setTestMessage("Please enter a valid email or phone number");
      return;
    }

    setIsSending(true);
    setTestStatus("idle");
    setTestMessage("");

    try {
      // Create a temporary campaign ID for testing
      const tempId = `temp-${Date.now()}`;
      const success = await sendTestMessage(tempId, [testRecipient]);

      if (success) {
        setTestStatus("success");
        setTestMessage(`Test message sent to ${testRecipient}`);
      } else {
        setTestStatus("error");
        setTestMessage("Failed to send test message");
      }
    } catch (error) {
      console.error("Error sending test message:", error);
      setTestStatus("error");
      setTestMessage("An error occurred while sending the test message");
    } finally {
      setIsSending(false);
    }
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      campaignData.name &&
      campaignData.segmentId &&
      campaignData.content &&
      (campaignType === 'sms' || campaignData.subject) &&
      campaignData.integrationId
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onCancel} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle>{editCampaign ? "Edit Campaign" : "Create New Campaign"}</CardTitle>
            <CardDescription>
              {editCampaign
                ? "Update your marketing campaign details"
                : "Set up a new marketing campaign targeting specific customer segments"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="details">
              <FileText className="h-4 w-4 mr-2" />
              Campaign Details
            </TabsTrigger>
            <TabsTrigger value="segment">
              <Users className="h-4 w-4 mr-2" />
              Target Segment
            </TabsTrigger>
            <TabsTrigger value="content">
              {campaignType === "email" ? (
                <Mail className="h-4 w-4 mr-2" />
              ) : (
                <MessageSquare className="h-4 w-4 mr-2" />
              )}
              Content
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="schedule">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </TabsTrigger>
          </TabsList>

          {/* Campaign Details Tab */}
          <TabsContent value="details">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="campaign-name">Campaign Name</Label>
                <Input
                  id="campaign-name"
                  placeholder="Enter campaign name"
                  value={campaignData.name}
                  onChange={(e) => updateCampaignData("name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaign-description">Description (Optional)</Label>
                <Textarea
                  id="campaign-description"
                  placeholder="Enter campaign description"
                  value={campaignData.description}
                  onChange={(e) => updateCampaignData("description", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaign-type">Campaign Type</Label>
                <Select
                  value={campaignType}
                  onValueChange={(value: "email" | "sms") => {
                    setCampaignType(value);
                    updateCampaignData("type", value);
                    // Reset template and content when changing type
                    updateCampaignData("templateId", "");
                    updateCampaignData("content", "");
                    if (value === "email") {
                      updateCampaignData("subject", "");
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select campaign type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        <span>Email Campaign</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="sms">
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        <span>SMS Campaign</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4">
                <Button onClick={() => setActiveTab("segment")}>
                  Continue to Target Segment
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Target Segment Tab */}
          <TabsContent value="segment">
            <SegmentSelector
              selectedSegmentId={campaignData.segmentId}
              onSegmentSelected={handleSegmentSelected}
            />

            <div className="pt-4 flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("details")}>
                Back
              </Button>
              <Button
                onClick={() => setActiveTab("content")}
                disabled={!campaignData.segmentId}
              >
                Continue to Content
              </Button>
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content">
            <div className="space-y-4">
              {campaignType === "email" ? (
                <SimpleEmailTemplateEditor
                  subject={campaignData.subject}
                  content={campaignData.content}
                  onContentUpdate={handleContentUpdate}
                />
              ) : (
                <SimpleSMSTemplateEditor
                  content={campaignData.content}
                  onContentUpdate={(content) => handleContentUpdate(content)}
                />
              )}

              <div className="pt-4 flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("segment")}>
                  Back
                </Button>
                <Button
                  onClick={() => setActiveTab("settings")}
                  disabled={!campaignData.content || (campaignType === "email" && !campaignData.subject)}
                >
                  Continue to Settings
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="integration">Integration</Label>
                <Select
                  value={campaignData.integrationId}
                  onValueChange={(value) => updateCampaignData("integrationId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select integration" />
                  </SelectTrigger>
                  <SelectContent>
                    {integrations.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No active integrations available
                      </SelectItem>
                    ) : (
                      integrations.map((integration) => (
                        <SelectItem key={integration.id} value={integration.id}>
                          {integration.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                {integrations.length === 0 && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No active integrations</AlertTitle>
                    <AlertDescription>
                      You need to set up and activate an integration before sending campaigns.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {campaignType === "email" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="sender">Sender Email</Label>
                    <Input
                      id="sender"
                      placeholder="noreply@yourcompany.com"
                      value={campaignData.settings?.sender || ""}
                      onChange={(e) => updateCampaignSettings("sender", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reply-to">Reply-To Email (Optional)</Label>
                    <Input
                      id="reply-to"
                      placeholder="support@yourcompany.com"
                      value={campaignData.settings?.replyTo || ""}
                      onChange={(e) => updateCampaignSettings("replyTo", e.target.value)}
                    />
                  </div>
                </>
              )}

              {campaignType === "sms" && (
                <div className="space-y-2">
                  <Label htmlFor="sender-id">Sender ID</Label>
                  <Input
                    id="sender-id"
                    placeholder="Your Company"
                    value={campaignData.settings?.sender || ""}
                    onChange={(e) => updateCampaignSettings("sender", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    The sender ID that will appear on recipients' devices. Maximum 11 characters.
                  </p>
                </div>
              )}

              <div className="pt-4 flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("content")}>
                  Back
                </Button>
                <Button
                  onClick={() => setActiveTab("schedule")}
                  disabled={!campaignData.integrationId}
                >
                  Continue to Schedule
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule">
            <CampaignScheduler
              onSchedule={(scheduledFor) => {
                updateCampaignData("scheduledFor", scheduledFor);
                updateCampaignData("status", "scheduled");
              }}
            />

            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Send Test</h3>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder={campaignType === "email" ? "Enter test email" : "Enter test phone number"}
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                />
                <Button
                  variant="outline"
                  onClick={handleSendTest}
                  disabled={isSending || !testRecipient}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Test
                    </>
                  )}
                </Button>
              </div>

              {testStatus === "success" && (
                <Alert className="mb-4">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{testMessage}</AlertDescription>
                </Alert>
              )}

              {testStatus === "error" && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{testMessage}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="pt-4 flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("settings")}>
                Back
              </Button>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    updateCampaignData("status", "draft");
                    handleSave();
                  }}
                  disabled={!isFormValid() || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save as Draft
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!isFormValid() || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {campaignData.status === "scheduled" ? "Schedule Campaign" : "Create Campaign"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
