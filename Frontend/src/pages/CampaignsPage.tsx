
import { useState } from "react";
import { 
  Plus, 
  MoreHorizontal, 
  Mail, 
  MessageSquare,
  CheckCircle2,
  Clock,
  Play,
  FileText,
  Users,
  BarChart
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { campaignData } from "@/data/mockData";
import { CampaignData } from "@/types";

const CampaignsPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  
  const getStatusBadge = (status: CampaignData["status"]) => {
    switch(status) {
      case "active":
        return <Badge className="bg-green-600">Active</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-600">Scheduled</Badge>;
      case "completed":
        return <Badge variant="outline" className="border-green-200 text-green-800 bg-green-50">Completed</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      default:
        return null;
    }
  };
  
  const getTypeIcon = (type: CampaignData["type"]) => {
    return type === "email" ? 
      <Mail className="h-4 w-4" /> : 
      <MessageSquare className="h-4 w-4" />;
  };
  
  const getStatusIcon = (status: CampaignData["status"]) => {
    switch(status) {
      case "active":
        return <Play className="h-4 w-4 text-green-600" />;
      case "scheduled":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-800" />;
      case "draft":
        return <FileText className="h-4 w-4 text-gray-600" />;
      default:
        return null;
    }
  };
  
  const calculateResponseRate = (campaign: CampaignData) => {
    if (campaign.reach === 0) return 0;
    return Math.round((campaign.response / campaign.reach) * 100);
  };
  
  const filteredCampaigns = activeTab === "all" 
    ? campaignData
    : campaignData.filter(campaign => campaign.status === activeTab);
  
  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Campaigns</h1>
        <p className="text-muted-foreground">Create and manage marketing campaigns for your customer segments.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex">
              <div className="flex-1">
                <div className="text-sm font-medium text-muted-foreground">Open Rate</div>
                <div className="text-3xl font-bold mt-1">24.8%</div>
                <div className="text-sm text-muted-foreground mt-1">Average across all campaigns</div>
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
                <div className="text-sm font-medium text-muted-foreground">SMS Response</div>
                <div className="text-3xl font-bold mt-1">11.2%</div>
                <div className="text-sm text-muted-foreground mt-1">Average across all campaigns</div>
              </div>
              <div className="p-2 rounded-full bg-primary/10 text-primary h-fit">
                <MessageSquare className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex">
              <div className="flex-1">
                <div className="text-sm font-medium text-muted-foreground">Campaign ROI</div>
                <div className="text-3xl font-bold mt-1">342%</div>
                <div className="text-sm text-muted-foreground mt-1">Average return on investment</div>
              </div>
              <div className="p-2 rounded-full bg-primary/10 text-primary h-fit">
                <BarChart className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Campaigns</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>New Campaign</span>
        </Button>
      </div>
      
      <div className="rounded-md border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Segment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Response Rate</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCampaigns.length > 0 ? (
              filteredCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(campaign.status)}
                      <span>{campaign.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getTypeIcon(campaign.type)}
                      <span>{campaign.type === "email" ? "Email" : "SMS"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{campaign.segment}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(campaign.status)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>
                          {campaign.response} / {campaign.reach}
                        </span>
                        <span className="font-medium">
                          {calculateResponseRate(campaign)}%
                        </span>
                      </div>
                      <Progress 
                        value={calculateResponseRate(campaign)} 
                        className="h-2" 
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Campaign</DropdownMenuItem>
                        <DropdownMenuItem>
                          {campaign.status === "active" ? "Pause Campaign" : 
                           campaign.status === "draft" ? "Activate Campaign" : 
                           "View Report"}
                        </DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No campaigns found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
        <div>Showing {filteredCampaigns.length} campaigns</div>
      </div>
    </div>
  );
};

export default CampaignsPage;
