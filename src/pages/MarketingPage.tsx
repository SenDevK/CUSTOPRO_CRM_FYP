import { useState, useEffect } from "react";
import {
  Plus,
  Mail,
  MessageSquare,
  Users,
  BarChart,
  Settings,
  Calendar,
  FileText,
  ChevronRight
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { SimpleCampaignCreator } from "@/components/marketing/SimpleCampaignCreator";
import { CampaignsList } from "@/components/marketing/CampaignsList";
import { SimpleTemplatesList } from "@/components/marketing/SimpleTemplatesList";
import { IntegrationSettings } from "@/components/marketing/IntegrationSettings";
import { getCampaigns, createCampaign, Campaign } from "@/services/marketingApi";

const MarketingPage = () => {
  const [activeTab, setActiveTab] = useState("campaigns");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load campaigns on component mount
  useEffect(() => {
    const loadCampaigns = async () => {
      setIsLoading(true);
      try {
        const data = await getCampaigns();
        setCampaigns(data);
      } catch (error) {
        console.error("Error loading campaigns:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCampaigns();
  }, []);

  // Calculate metrics
  const metrics = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    scheduledCampaigns: campaigns.filter(c => c.status === 'scheduled').length,
    completedCampaigns: campaigns.filter(c => c.status === 'completed').length,
    totalSent: campaigns.reduce((sum, c) => sum + c.reach, 0),
    totalResponses: campaigns.reduce((sum, c) => sum + c.response, 0),
    averageResponseRate: campaigns.length > 0
      ? Math.round((campaigns.reduce((sum, c) => sum + c.response, 0) / campaigns.reduce((sum, c) => sum + (c.reach || 1), 0)) * 100)
      : 0
  };

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Marketing</h1>
        <p className="text-muted-foreground">Create and manage marketing campaigns for your customer segments.</p>
      </div>

      {isCreatingCampaign ? (
        <SimpleCampaignCreator
          onCancel={() => setIsCreatingCampaign(false)}
          onSave={async (campaignData) => {
            try {
              // Create the campaign via the API
              const createdCampaign = await createCampaign(campaignData);

              // Add the new campaign to the state
              setCampaigns([...campaigns, createdCampaign]);

              // Close the campaign creator
              setIsCreatingCampaign(false);
            } catch (error) {
              console.error("Error creating campaign:", error);
              // Still add the campaign to local state for now
              setCampaigns([...campaigns, campaignData]);
              setIsCreatingCampaign(false);
            }
          }}
        />
      ) : (
        <>
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-muted-foreground">Response Rate</div>
                    <div className="text-3xl font-bold mt-1">{metrics.averageResponseRate}%</div>
                    <div className="text-sm text-muted-foreground mt-1">Average across all campaigns</div>
                  </div>
                  <div className="p-2 rounded-full bg-primary/10 text-primary h-fit">
                    <BarChart className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-muted-foreground">Active Campaigns</div>
                    <div className="text-3xl font-bold mt-1">{metrics.activeCampaigns}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {metrics.scheduledCampaigns} scheduled
                    </div>
                  </div>
                  <div className="p-2 rounded-full bg-primary/10 text-primary h-fit">
                    <Mail className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-muted-foreground">Total Reach</div>
                    <div className="text-3xl font-bold mt-1">{metrics.totalSent.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {metrics.totalResponses.toLocaleString()} responses
                    </div>
                  </div>
                  <div className="p-2 rounded-full bg-primary/10 text-primary h-fit">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-6">
              <TabsList>
                <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="integrations">Integrations</TabsTrigger>
              </TabsList>

              <Button
                className="flex items-center gap-2"
                onClick={() => setIsCreatingCampaign(true)}
              >
                <Plus className="h-4 w-4" />
                <span>New Campaign</span>
              </Button>
            </div>

            <TabsContent value="campaigns">
              <CampaignsList
                campaigns={campaigns}
                isLoading={isLoading}
                onCreateCampaign={() => setIsCreatingCampaign(true)}
                onCampaignUpdated={(updatedCampaign) => {
                  setCampaigns(campaigns.map(c =>
                    c.id === updatedCampaign.id ? updatedCampaign : c
                  ));
                }}
                onCampaignDeleted={(campaignId) => {
                  setCampaigns(campaigns.filter(c => c.id !== campaignId));
                }}
              />
            </TabsContent>

            <TabsContent value="templates">
              <SimpleTemplatesList />
            </TabsContent>

            <TabsContent value="integrations">
              <IntegrationSettings />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default MarketingPage;
