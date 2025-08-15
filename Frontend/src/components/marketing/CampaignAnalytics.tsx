import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Mail, 
  MessageSquare, 
  Users, 
  BarChart, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  MousePointer, 
  MessageCircle, 
  Loader2 
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from "recharts";
import { Campaign, getCampaignAnalytics, CampaignAnalytics as AnalyticsType } from "@/services/marketingApi";

interface CampaignAnalyticsProps {
  campaign: Campaign;
  onBack: () => void;
}

export function CampaignAnalytics({ campaign, onBack }: CampaignAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      try {
        const data = await getCampaignAnalytics(campaign.id);
        setAnalytics(data);
      } catch (error) {
        console.error("Error loading analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [campaign.id]);

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "scheduled":
        return <Badge variant="outline" className="text-blue-500">Scheduled</Badge>;
      case "active":
        return <Badge variant="outline" className="text-green-500">Active</Badge>;
      case "completed":
        return <Badge variant="outline" className="text-purple-500">Completed</Badge>;
      case "failed":
        return <Badge variant="outline" className="text-red-500">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Prepare pie chart data
  const getPieChartData = () => {
    if (!analytics) return [];

    if (campaign.type === "email") {
      return [
        { name: "Opened", value: analytics.opened || 0, color: "#10b981" },
        { name: "Not Opened", value: analytics.delivered - (analytics.opened || 0), color: "#d1d5db" }
      ];
    } else {
      return [
        { name: "Responded", value: analytics.responded, color: "#10b981" },
        { name: "No Response", value: analytics.delivered - analytics.responded, color: "#d1d5db" }
      ];
    }
  };

  // Prepare timeline data
  const getTimelineData = () => {
    if (!analytics || !analytics.timeline) return [];
    return analytics.timeline;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{campaign.name}</h2>
          <p className="text-muted-foreground">
            {campaign.type === "email" ? (
              <span className="flex items-center">
                <Mail className="h-4 w-4 mr-1" />
                Email Campaign
              </span>
            ) : (
              <span className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-1" />
                SMS Campaign
              </span>
            )}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading analytics...</span>
        </div>
      ) : !analytics ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No analytics available</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Analytics data is not available for this campaign. This could be because the campaign is still in draft or has not been sent yet.
            </p>
            <Button variant="outline" onClick={onBack}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-muted-foreground">Sent</div>
                    <div className="text-3xl font-bold mt-1">{analytics.sent.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {formatDate(campaign.sentAt)}
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
                    <div className="text-sm font-medium text-muted-foreground">Delivered</div>
                    <div className="text-3xl font-bold mt-1">{analytics.delivered.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {analytics.details.deliveryRate}% delivery rate
                    </div>
                  </div>
                  <div className="p-2 rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400 h-fit">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {campaign.type === "email" && (
              <>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-muted-foreground">Opened</div>
                        <div className="text-3xl font-bold mt-1">{(analytics.opened || 0).toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {analytics.details.openRate}% open rate
                        </div>
                      </div>
                      <div className="p-2 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 h-fit">
                        <Eye className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-muted-foreground">Clicked</div>
                        <div className="text-3xl font-bold mt-1">{(analytics.clicked || 0).toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {analytics.details.clickRate}% click rate
                        </div>
                      </div>
                      <div className="p-2 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400 h-fit">
                        <MousePointer className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {campaign.type === "sms" && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-muted-foreground">Responded</div>
                      <div className="text-3xl font-bold mt-1">{analytics.responded.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {analytics.details.responseRate}% response rate
                      </div>
                    </div>
                    <div className="p-2 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400 h-fit">
                      <MessageCircle className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-6">
                <div className="flex">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-muted-foreground">Failed</div>
                    <div className="text-3xl font-bold mt-1">{analytics.failed.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {campaign.type === "email" ? (
                        <>{analytics.bounced} bounced</>
                      ) : (
                        <>Delivery failures</>
                      )}
                    </div>
                  </div>
                  <div className="p-2 rounded-full bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400 h-fit">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Overview</CardTitle>
                <CardDescription>
                  {campaign.type === "email" 
                    ? "Email opens and engagement metrics" 
                    : "SMS delivery and response metrics"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getPieChartData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {getPieChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Over Time</CardTitle>
                <CardDescription>
                  {campaign.type === "email" 
                    ? "Email opens and clicks over time" 
                    : "SMS responses over time"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={getTimelineData()}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      {campaign.type === "email" ? (
                        <>
                          <Area 
                            type="monotone" 
                            dataKey="opens" 
                            name="Opens" 
                            stackId="1" 
                            stroke="#10b981" 
                            fill="#10b981" 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="clicks" 
                            name="Clicks" 
                            stackId="2" 
                            stroke="#8b5cf6" 
                            fill="#8b5cf6" 
                          />
                        </>
                      ) : (
                        <Area 
                          type="monotone" 
                          dataKey="responses" 
                          name="Responses" 
                          stackId="1" 
                          stroke="#10b981" 
                          fill="#10b981" 
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
              <CardDescription>
                Detailed information about this campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Campaign Name</h3>
                  <p>{campaign.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Type</h3>
                  <p className="flex items-center">
                    {campaign.type === "email" ? (
                      <>
                        <Mail className="h-4 w-4 mr-1" />
                        Email Campaign
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-4 w-4 mr-1" />
                        SMS Campaign
                      </>
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                  <p>{getStatusBadge(campaign.status)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Target Segment</h3>
                  <p>{campaign.segmentName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Created</h3>
                  <p>{formatDate(campaign.createdAt)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Sent</h3>
                  <p>{formatDate(campaign.sentAt)}</p>
                </div>
                {campaign.type === "email" && campaign.subject && (
                  <div className="col-span-full">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Subject</h3>
                    <p>{campaign.subject}</p>
                  </div>
                )}
                {campaign.description && (
                  <div className="col-span-full">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                    <p>{campaign.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
