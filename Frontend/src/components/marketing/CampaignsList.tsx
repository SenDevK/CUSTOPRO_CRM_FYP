import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Mail,
  MessageSquare,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  BarChart,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Plus
} from "lucide-react";
import { Campaign, deleteCampaign } from "@/services/marketingApi";
import { CampaignAnalytics } from "@/components/marketing/CampaignAnalytics";

interface CampaignsListProps {
  campaigns: Campaign[];
  isLoading: boolean;
  onCreateCampaign: () => void;
  onCampaignUpdated: (campaign: Campaign) => void;
  onCampaignDeleted: (campaignId: string) => void;
}

export function CampaignsList({
  campaigns,
  isLoading,
  onCreateCampaign,
  onCampaignUpdated,
  onCampaignDeleted
}: CampaignsListProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle campaign deletion
  const handleDeleteCampaign = async (campaignId: string) => {
    if (confirm("Are you sure you want to delete this campaign?")) {
      setIsDeleting(true);
      try {
        const success = await deleteCampaign(campaignId);
        if (success) {
          onCampaignDeleted(campaignId);
        }
      } catch (error) {
        console.error("Error deleting campaign:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            Draft
          </Badge>
        );
      case "scheduled":
        return (
          <Badge variant="outline" className="text-blue-500 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
            <Calendar className="h-3 w-3 mr-1" />
            Scheduled
          </Badge>
        );
      case "active":
        return (
          <Badge variant="outline" className="text-green-500 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="text-purple-500 border-purple-200 bg-purple-50 dark:bg-purple-950 dark:border-purple-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return "—";
      return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "—";
    }
  };

  if (showAnalytics && selectedCampaign) {
    return (
      <CampaignAnalytics
        campaign={selectedCampaign}
        onBack={() => {
          setShowAnalytics(false);
          setSelectedCampaign(null);
        }}
      />
    );
  }

  return (
    <div>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading campaigns...</span>
        </div>
      ) : campaigns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No campaigns yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Create your first marketing campaign to reach your customers with personalized messages.
            </p>
            <Button onClick={onCreateCampaign}>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Marketing Campaigns</CardTitle>
            <CardDescription>
              Manage your email and SMS marketing campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Segment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scheduled For</TableHead>
                  <TableHead className="text-right">Reach</TableHead>
                  <TableHead className="text-right">Response</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">
                      {campaign.name}
                      {campaign.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {campaign.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {campaign.type === "email" ? (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          <span>Email</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          <span>SMS</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {campaign.segmentName || 'Default Segment'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(campaign.status)}
                    </TableCell>
                    <TableCell>
                      {formatDate(campaign.scheduledFor || campaign.scheduledAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      {campaign.reach !== undefined ? campaign.reach.toLocaleString() : '0'}
                    </TableCell>
                    <TableCell className="text-right">
                      {campaign.response !== undefined && campaign.response > 0 ? (
                        <div>
                          {campaign.response.toLocaleString()}
                          <span className="text-xs text-muted-foreground block">
                            {campaign.reach && campaign.reach > 0
                              ? `${Math.round((campaign.response / campaign.reach) * 100)}%`
                              : '0%'}
                          </span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedCampaign(campaign);
                              setShowAnalytics(true);
                            }}
                          >
                            <BarChart className="h-4 w-4 mr-2" />
                            View Analytics
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Campaign
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 dark:text-red-400"
                            onClick={() => handleDeleteCampaign(campaign.id)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 mr-2" />
                            )}
                            Delete Campaign
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
