import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimpleEmailTemplateEditor } from "./SimpleEmailTemplateEditor";
import { SimpleSMSTemplateEditor } from "./SimpleSMSTemplateEditor";
import { SegmentSelector } from "./SegmentSelector";
import { CampaignScheduler } from "./CampaignScheduler";
import { Campaign, getIntegrations, Integration } from "@/services/marketingApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface CampaignCreatorProps {
  onCancel: () => void;
  onSave: (campaign: Campaign) => void;
}

export function SimpleCampaignCreator({ onCancel, onSave }: CampaignCreatorProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [campaignType, setCampaignType] = useState<"email" | "sms">("email");
  const [campaignData, setCampaignData] = useState({
    name: "",
    description: "",
    segmentId: "",
    templateId: "",
    subject: "",
    content: "",
    scheduledAt: "",
    sendImmediately: true,
    integrationId: "",
  });

  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(false);

  // Load integrations on component mount and when campaign type changes
  useEffect(() => {
    const loadIntegrations = async () => {
      setIsLoadingIntegrations(true);
      try {
        // Get integrations based on campaign type
        const type = campaignType === "email" ? "email" : "sms";
        const data = await getIntegrations(type);
        setIntegrations(data);

        // Set default integration if available
        if (data.length > 0 && !campaignData.integrationId) {
          // Find an active integration
          const activeIntegration = data.find(i => i.isActive);
          if (activeIntegration) {
            setCampaignData({
              ...campaignData,
              integrationId: activeIntegration.id
            });
          }
        }
      } catch (error) {
        console.error("Error loading integrations:", error);
      } finally {
        setIsLoadingIntegrations(false);
      }
    };

    loadIntegrations();
  }, [campaignType]);

  // Handle input changes
  const handleInputChange = (field: string, value: string | boolean) => {
    setCampaignData({
      ...campaignData,
      [field]: value,
    });
  };

  // Handle segment selection
  const handleSegmentSelected = (segmentId: string) => {
    setCampaignData({
      ...campaignData,
      segmentId,
    });
  };

  // Handle content update
  const handleContentUpdate = (content: string, subject?: string) => {
    if (subject !== undefined) {
      setCampaignData({
        ...campaignData,
        content,
        subject,
      });
    } else {
      setCampaignData({
        ...campaignData,
        content,
      });
    }
  };

  // Handle scheduling options
  const handleSchedulingUpdate = (sendImmediately: boolean, scheduledAt: string) => {
    setCampaignData({
      ...campaignData,
      sendImmediately,
      scheduledAt,
    });
  };

  // Handle save
  const handleSave = () => {
    // Find the selected integration
    const selectedIntegration = integrations.find(i => i.id === campaignData.integrationId);

    // Create a new campaign object
    const newCampaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'reach' | 'response'> = {
      name: campaignData.name,
      description: campaignData.description,
      type: campaignType,
      segmentId: campaignData.segmentId,
      content: campaignData.content,
      subject: campaignType === "email" ? campaignData.subject : undefined,
      status: campaignData.sendImmediately ? "active" : "scheduled",
      scheduledAt: campaignData.sendImmediately ? undefined : campaignData.scheduledAt,
      // Use selected integration ID or fallback to a default
      integrationId: campaignData.integrationId ||
        (campaignType === "email" ? "integration-1" : "integration-2"),
      // Add settings
      settings: {
        personalizeContent: true,
        // Use integration sender if available
        sender: selectedIntegration?.credentials?.from ||
          (campaignType === "email" ? "marketing@yourcompany.com" : "+1234567890"),
        replyTo: campaignType === "email" ?
          (selectedIntegration?.credentials?.replyTo || "support@yourcompany.com") :
          undefined,
        trackOpens: campaignType === "email" ? true : undefined,
        trackClicks: campaignType === "email" ? true : undefined,
      }
    };

    onSave(newCampaign as Campaign);
  };

  // Check if current tab is complete
  const isTabComplete = () => {
    switch (activeTab) {
      case "basic":
        return campaignData.name.trim() !== "";
      case "segment":
        return campaignData.segmentId !== "";
      case "content":
        return (
          campaignData.content !== "" &&
          (campaignType !== "email" || campaignData.subject !== "")
        );
      case "settings":
        return true;
      default:
        return false;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Campaign</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="segment">Segment</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="campaign-name">Campaign Name</Label>
                <Input
                  id="campaign-name"
                  placeholder="Enter campaign name"
                  value={campaignData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaign-description">Description (Optional)</Label>
                <Textarea
                  id="campaign-description"
                  placeholder="Enter campaign description"
                  value={campaignData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Campaign Type</Label>
                <RadioGroup
                  value={campaignType}
                  onValueChange={(value) => setCampaignType(value as "email" | "sms")}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="email" />
                    <Label htmlFor="email">Email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sms" id="sms" />
                    <Label htmlFor="sms">SMS</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  onClick={() => setActiveTab("segment")}
                  disabled={!isTabComplete()}
                >
                  Continue to Segment Selection
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Segment Tab */}
          <TabsContent value="segment">
            <div className="space-y-4">
              <SegmentSelector
                selectedSegmentId={campaignData.segmentId}
                onSegmentSelected={handleSegmentSelected}
              />

              <div className="pt-4 flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("basic")}>
                  Back
                </Button>
                <Button
                  onClick={() => setActiveTab("content")}
                  disabled={!isTabComplete()}
                >
                  Continue to Content
                </Button>
              </div>
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
                  disabled={!isTabComplete()}
                >
                  Continue to Settings
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Scheduling</h3>
                <CampaignScheduler
                  sendImmediately={campaignData.sendImmediately}
                  scheduledAt={campaignData.scheduledAt}
                  onUpdate={handleSchedulingUpdate}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Integration</h3>
                <div className="space-y-2">
                  <Label htmlFor="integration">Select {campaignType === "email" ? "Email" : "SMS"} Service</Label>
                  {isLoadingIntegrations ? (
                    <div className="flex items-center space-x-2 h-10">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading integrations...</span>
                    </div>
                  ) : integrations.length === 0 ? (
                    <div className="text-sm text-muted-foreground border rounded-md p-3">
                      No {campaignType} integrations found. Default settings will be used.
                    </div>
                  ) : (
                    <Select
                      value={campaignData.integrationId}
                      onValueChange={(value) => handleInputChange("integrationId", value)}
                    >
                      <SelectTrigger id="integration">
                        <SelectValue placeholder={`Select a ${campaignType} service`} />
                      </SelectTrigger>
                      <SelectContent>
                        {integrations.map((integration) => (
                          <SelectItem key={integration.id} value={integration.id}>
                            {integration.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <p className="text-xs text-muted-foreground">
                    This integration will be used to send your {campaignType === "email" ? "emails" : "SMS messages"}.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("content")}>
                  Back
                </Button>
                <div className="space-x-2">
                  <Button variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={!campaignData.segmentId}
                  >
                    {campaignData.sendImmediately ? "Launch Campaign" : "Schedule Campaign"}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
