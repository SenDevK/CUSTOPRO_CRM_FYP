import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Customer } from "@/types";
import { getCustomerById, updateCustomer, getCustomerOptOutStatus, updateCustomerOptOutStatus } from "@/services/customerApi";
import {
  CalendarDays,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  ShoppingBag,
  AlertCircle,
  User,
  Clock,
  Tag,
  MessageSquare,
  BarChart4,
  Heart,
  ShoppingCart,
  Calendar,
  TrendingUp,
  Award,
  AlertTriangle,
  UserCheck,
  BellOff,
  Bell,
  Check,
  X,
  RefreshCw,
  Loader2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CustomerDetailsDialogProps {
  customerId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CustomerDetailsDialog = ({
  customerId,
  open,
  onOpenChange
}: CustomerDetailsDialogProps) => {
  const { toast } = useToast();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optOutStatus, setOptOutStatus] = useState<'active' | 'opted_out' | 'deleted' | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (!customerId) return;

      try {
        setLoading(true);
        setError(null);
        const data = await getCustomerById(customerId);
        setCustomer(data);

        // If customer has a phone number, fetch opt-out status
        if (data && data.phone) {
          try {
            const statusData = await getCustomerOptOutStatus(data.phone);
            setOptOutStatus(statusData.status);
          } catch (statusErr) {
            console.error("Error fetching opt-out status:", statusErr);
            toast({
              title: "Error",
              description: "Could not fetch marketing opt-out status from the server.",
              variant: "destructive",
              duration: 3000,
            });
            // Use the status from the customer data if available
            setOptOutStatus(data.marketing_status as any || 'active');
          }
        }
      } catch (err) {
        setError("Failed to load customer details from the database. Please check your connection to the backend server.");
        console.error(err);
        toast({
          title: "Database Connection Error",
          description: "Could not load customer details from the database. Please ensure the backend server is running.",
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    };

    if (open && customerId) {
      fetchCustomerDetails();
    }
  }, [customerId, open, toast]);

  // Function to update customer opt-out status
  const handleUpdateOptOutStatus = async (newStatus: 'active' | 'opted_out' | 'deleted') => {
    if (!customer || !customer.phone) return;

    try {
      setIsUpdatingStatus(true);

      // Update status in the backend
      await updateCustomerOptOutStatus(customer.phone, newStatus);

      // Update local state
      setOptOutStatus(newStatus);
      setCustomer({
        ...customer,
        marketing_status: newStatus,
        opt_out_date: newStatus !== 'active' ? new Date().toISOString() : undefined
      });

      toast({
        title: "Status updated",
        description: `Marketing status updated to ${newStatus === 'active' ? 'Active' :
                      newStatus === 'opted_out' ? 'Opted Out' : 'Deleted'}`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Error updating opt-out status:", error);
      toast({
        title: "Error updating status",
        description: "There was an error updating the marketing status. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getSegmentBadge = (segment?: string) => {
    if (!segment) return <Badge variant="outline">No Segment</Badge>;

    // Handle different segment formats
    const segmentLower = segment.toLowerCase();

    // Value-based segments (RFM)
    if (segmentLower.includes('loyal') || segmentLower.includes('champion')) {
      return <Badge className="bg-purple-600">Loyal Customer</Badge>;
    } else if (segmentLower.includes('high_value') || segmentLower.includes('high value')) {
      return <Badge className="bg-purple-600">High Value</Badge>;
    } else if (segmentLower.includes('medium_value') || segmentLower.includes('medium value')) {
      return <Badge className="bg-purple-400">Medium Value</Badge>;
    } else if (segmentLower.includes('low_value') || segmentLower.includes('low value')) {
      return <Badge className="bg-purple-200 text-purple-800">Low Value</Badge>;
    } else if (segmentLower.includes('at_risk') || segmentLower.includes('at risk')) {
      return <Badge variant="destructive">At Risk</Badge>;
    } else if (segmentLower.includes('new')) {
      return <Badge className="bg-blue-500">New Customer</Badge>;
    } else if (segmentLower.includes('potential')) {
      return <Badge className="bg-amber-500">Potential Loyalist</Badge>;
    } else if (segmentLower.includes('promising')) {
      return <Badge className="bg-green-500">Promising</Badge>;
    } else if (segmentLower.includes('needs attention')) {
      return <Badge className="bg-orange-500">Needs Attention</Badge>;
    } else if (segmentLower.includes('dormant')) {
      return <Badge className="bg-red-300">Dormant</Badge>;
    } else if (segmentLower.includes('lost') || segmentLower.includes('churned')) {
      return <Badge className="bg-red-500">Lost Customer</Badge>;
    }

    // Demographic segments
    else if (segment.includes('Gender_') || segment.includes('Age_') ||
             segment.includes('gender_') || segment.includes('age_')) {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        {segment.replace(/_/g, ' ')}
      </Badge>;
    }

    // Preference segments
    else if (segment.includes('Preference') || segment.includes('preference')) {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        {segment.replace(/_/g, ' ')}
      </Badge>;
    }

    // Return the segment as is for any other case
    else {
      return <Badge variant="outline">{segment}</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-LK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper functions for RFM segmentation descriptions
  const getRFMScoreDescription = (type: string, score?: number) => {
    if (!score) return "Unknown";

    switch(type) {
      case 'r':
        switch(score) {
          case 5: return "Very Recent";
          case 4: return "Recent";
          case 3: return "Average";
          case 2: return "Not Recent";
          case 1: return "Inactive";
          default: return "Unknown";
        }
      case 'f':
        switch(score) {
          case 5: return "Very Frequent";
          case 4: return "Frequent";
          case 3: return "Average";
          case 2: return "Infrequent";
          case 1: return "Rare";
          default: return "Unknown";
        }
      case 'm':
        switch(score) {
          case 5: return "Very High";
          case 4: return "High";
          case 3: return "Average";
          case 2: return "Low";
          case 1: return "Very Low";
          default: return "Unknown";
        }
      default:
        return "Unknown";
    }
  };

  const getRecencyInsight = (score?: number) => {
    if (!score) return "No recency data available";

    switch(score) {
      case 5: return "Customer has purchased very recently - perfect time to engage!";
      case 4: return "Customer has purchased recently - good time for follow-up";
      case 3: return "Average recency - consider a re-engagement campaign";
      case 2: return "It's been a while since their last purchase - time to reconnect";
      case 1: return "Customer hasn't purchased in a long time - needs reactivation";
      default: return "No recency data available";
    }
  };

  const getFrequencyInsight = (score?: number) => {
    if (!score) return "No frequency data available";

    switch(score) {
      case 5: return "Purchases very frequently - a loyal customer!";
      case 4: return "Purchases frequently - great engagement";
      case 3: return "Average purchase frequency - opportunity to increase";
      case 2: return "Infrequent purchases - consider loyalty incentives";
      case 1: return "Rarely purchases - needs stronger engagement";
      default: return "No frequency data available";
    }
  };

  const getMonetaryInsight = (score?: number) => {
    if (!score) return "No spending data available";

    switch(score) {
      case 5: return "Very high spending - a VIP customer!";
      case 4: return "High spending - great value customer";
      case 3: return "Average spending - potential to increase";
      case 2: return "Low spending - opportunity to upsell";
      case 1: return "Very low spending - focus on value proposition";
      default: return "No spending data available";
    }
  };

  const getValueSegmentDescription = (segment?: string) => {
    if (!segment) return "No segment information available";

    if (segment.includes("Loyal")) {
      return "This customer is one of your most valuable assets. They purchase frequently, recently, and spend significantly.";
    } else if (segment.includes("High Value")) {
      return "This customer spends well and purchases regularly. They're important to your business.";
    } else if (segment.includes("Medium Value")) {
      return "This customer shows good potential with moderate spending and engagement.";
    } else if (segment.includes("Low Value")) {
      return "This customer spends less than average and purchases infrequently.";
    } else if (segment.includes("At Risk")) {
      return "This customer hasn't purchased recently and may be at risk of churning.";
    } else if (segment.includes("New")) {
      return "This is a new customer who has started purchasing recently.";
    } else if (segment.includes("Potential")) {
      return "This customer shows potential to become a loyal customer with the right engagement.";
    } else if (segment.includes("Promising")) {
      return "This customer is showing promising signs of becoming a valuable customer.";
    } else if (segment.includes("Needs Attention")) {
      return "This customer's engagement is declining and needs attention to prevent churn.";
    } else if (segment.includes("Dormant")) {
      return "This customer hasn't purchased in a long time but may be reactivated.";
    } else if (segment.includes("Churned")) {
      return "This customer appears to have stopped purchasing and may have churned.";
    } else {
      return "This customer's segment indicates their value and engagement level with your business.";
    }
  };

  const getRecommendedActions = (segment?: string) => {
    if (!segment) return ["Collect more data to enable segmentation"];

    if (segment.includes("Loyal")) {
      return [
        "Offer exclusive VIP rewards or early access to new products",
        "Create personalized thank you messages or gifts",
        "Ask for referrals and testimonials",
        "Invite to loyalty program or special events"
      ];
    } else if (segment.includes("High Value")) {
      return [
        "Provide premium customer service",
        "Offer complementary products based on purchase history",
        "Create targeted upsell opportunities",
        "Invite to loyalty program"
      ];
    } else if (segment.includes("Medium Value")) {
      return [
        "Encourage more frequent purchases with targeted offers",
        "Provide incentives to increase average order value",
        "Engage with personalized content and recommendations",
        "Highlight benefits of your premium products/services"
      ];
    } else if (segment.includes("Low Value")) {
      return [
        "Offer entry-level products that match their spending capacity",
        "Provide educational content about your products' value",
        "Create special offers to encourage more frequent purchases",
        "Use low-cost marketing channels for communications"
      ];
    } else if (segment.includes("At Risk")) {
      return [
        "Send a re-engagement email or special offer",
        "Ask for feedback about their experience",
        "Offer a special discount on their favorite products",
        "Create a personalized win-back campaign"
      ];
    } else if (segment.includes("New")) {
      return [
        "Send a welcome series of emails",
        "Provide educational content about your products",
        "Offer a second purchase discount",
        "Ask for initial feedback on their experience"
      ];
    } else if (segment.includes("Potential") || segment.includes("Promising")) {
      return [
        "Provide personalized product recommendations",
        "Offer loyalty program benefits",
        "Create targeted content based on their interests",
        "Encourage reviews and feedback"
      ];
    } else if (segment.includes("Needs Attention")) {
      return [
        "Reach out with a personalized message",
        "Offer a special discount or incentive",
        "Ask for feedback about their experience",
        "Address any potential issues proactively"
      ];
    } else if (segment.includes("Dormant")) {
      return [
        "Create a win-back campaign with a compelling offer",
        "Ask if their needs have changed",
        "Highlight new products or improvements since their last purchase",
        "Consider a survey to understand why they stopped purchasing"
      ];
    } else if (segment.includes("Churned")) {
      return [
        "Send a last-attempt win-back offer",
        "Request feedback on why they left",
        "Consider if they're a good fit for your business",
        "Learn from their experience to prevent future churn"
      ];
    } else {
      return [
        "Analyze customer behavior to better understand their needs",
        "Create personalized communications based on their profile",
        "Offer products that match their preferences",
        "Monitor engagement to adjust marketing strategy"
      ];
    }
  };

  // Helper functions for demographic segmentation
  const getDemographicDistribution = (gender?: string) => {
    if (!gender) return "Unknown";

    switch(gender.toLowerCase()) {
      case 'male':
        return "45% of customers";
      case 'female':
        return "52% of customers";
      default:
        return "3% of customers";
    }
  };

  const getAgeGroup = (age?: number) => {
    if (!age) return "Unknown";

    if (age < 18) return "Under 18";
    if (age >= 18 && age <= 24) return "18-24";
    if (age >= 25 && age <= 34) return "25-34";
    if (age >= 35 && age <= 44) return "35-44";
    if (age >= 45 && age <= 54) return "45-54";
    if (age >= 55 && age <= 64) return "55-64";
    return "65+";
  };

  const getAgeIcon = (age?: number) => {
    if (!age) return <User className="h-5 w-5" />;

    if (age < 25) return <User className="h-5 w-5" />;
    if (age >= 25 && age <= 44) return <UserCheck className="h-5 w-5" />;
    return <User className="h-5 w-5" />;
  };

  const getGenderInsight = (gender?: string) => {
    if (!gender) return "Gender information helps tailor marketing messages appropriately.";

    switch(gender.toLowerCase()) {
      case 'male':
        return "Male customers often respond well to straightforward messaging and value-based propositions.";
      case 'female':
        return "Female customers often appreciate detailed information and relationship-building communication.";
      default:
        return "Consider using inclusive language and imagery in marketing communications.";
    }
  };

  const getAgeInsight = (age?: number) => {
    if (!age) return "Age information helps target appropriate products and messaging.";

    if (age < 18) {
      return "Very young customers may be influenced by parents or guardians in purchasing decisions.";
    } else if (age >= 18 && age <= 24) {
      return "Young adults often respond to trendy, social media-friendly marketing and value affordability.";
    } else if (age >= 25 && age <= 34) {
      return "This age group often values quality and convenience, and may be establishing brand loyalties.";
    } else if (age >= 35 && age <= 44) {
      return "This age group often has established careers and may value premium products and services.";
    } else if (age >= 45 && age <= 54) {
      return "This age group often has significant purchasing power and values quality and reliability.";
    } else if (age >= 55 && age <= 64) {
      return "This age group may be planning for retirement and values trusted brands and excellent service.";
    } else {
      return "Senior customers often value reliability, excellent customer service, and clear communication.";
    }
  };

  const getDemographicSegmentDescription = (segment?: string) => {
    if (!segment) return "Demographic segmentation helps tailor marketing messages to specific age and gender groups.";

    if (segment.includes("Male") && segment.includes("18-24")) {
      return "Young adult males often respond to messaging that emphasizes innovation, technology, and social status.";
    } else if (segment.includes("Male") && segment.includes("25-34")) {
      return "Males in this age range often value career advancement, technology, and quality products.";
    } else if (segment.includes("Male") && segment.includes("35-44")) {
      return "Males in this age range often have established careers and may be interested in premium products.";
    } else if (segment.includes("Male") && segment.includes("45-54")) {
      return "Males in this age range often have significant purchasing power and value quality and reliability.";
    } else if (segment.includes("Male") && segment.includes("55+")) {
      return "Older male customers often value reliability, excellent customer service, and clear communication.";
    } else if (segment.includes("Female") && segment.includes("18-24")) {
      return "Young adult females often respond to messaging that emphasizes social connection, trends, and value.";
    } else if (segment.includes("Female") && segment.includes("25-34")) {
      return "Females in this age range often value quality, convenience, and products that fit their lifestyle.";
    } else if (segment.includes("Female") && segment.includes("35-44")) {
      return "Females in this age range often have established careers and may be interested in premium products.";
    } else if (segment.includes("Female") && segment.includes("45-54")) {
      return "Females in this age range often have significant purchasing power and value quality and reliability.";
    } else if (segment.includes("Female") && segment.includes("55+")) {
      return "Older female customers often value reliability, excellent customer service, and clear communication.";
    } else if (segment.includes("Male")) {
      return "Male customers often respond well to straightforward messaging and value-based propositions.";
    } else if (segment.includes("Female")) {
      return "Female customers often appreciate detailed information and relationship-building communication.";
    } else if (segment.includes("18-24")) {
      return "Customers aged 18-24 often respond to trendy, social media-friendly marketing and value affordability.";
    } else if (segment.includes("25-34")) {
      return "Customers aged 25-34 often value quality and convenience, and may be establishing brand loyalties.";
    } else if (segment.includes("35-44")) {
      return "Customers aged 35-44 often have established careers and may value premium products and services.";
    } else if (segment.includes("45-54")) {
      return "Customers aged 45-54 often have significant purchasing power and value quality and reliability.";
    } else if (segment.includes("55+") || segment.includes("65+")) {
      return "Older customers often value reliability, excellent customer service, and clear communication.";
    } else {
      return "This demographic segment has specific preferences and behaviors that can inform marketing strategies.";
    }
  };

  const getDemographicRecommendations = (segment?: string, gender?: string, age?: number) => {
    // Default recommendations if no segment data
    if (!segment && !gender && !age) {
      return [
        "Collect more demographic data to enable targeted marketing",
        "Use inclusive language and imagery in marketing materials",
        "Test different messaging approaches to see what resonates",
        "Focus on product benefits that appeal to a broad audience"
      ];
    }

    // Gender-based recommendations
    if (gender && !age) {
      if (gender.toLowerCase() === 'male') {
        return [
          "Use straightforward, benefit-focused messaging",
          "Emphasize product features and performance",
          "Consider sports or technology-related promotions",
          "Use male models or spokespersons in marketing materials"
        ];
      } else if (gender.toLowerCase() === 'female') {
        return [
          "Focus on relationship-building in communications",
          "Provide detailed product information and reviews",
          "Consider lifestyle or community-related promotions",
          "Use female models or spokespersons in marketing materials"
        ];
      }
    }

    // Age-based recommendations
    if (age && !gender) {
      if (age < 25) {
        return [
          "Leverage social media platforms popular with younger audiences",
          "Create trendy, visually appealing content",
          "Offer affordable entry-level products",
          "Emphasize social proof and peer recommendations"
        ];
      } else if (age >= 25 && age <= 44) {
        return [
          "Focus on convenience and time-saving benefits",
          "Highlight quality and durability of products",
          "Offer flexible payment options or loyalty programs",
          "Use professional, polished marketing materials"
        ];
      } else {
        return [
          "Emphasize reliability and excellent customer service",
          "Use clear, straightforward language",
          "Highlight product quality and longevity",
          "Consider traditional marketing channels alongside digital"
        ];
      }
    }

    // Combined segment recommendations
    if (segment) {
      if (segment.includes("Male") && segment.includes("18-24")) {
        return [
          "Use technology and gaming-related themes in marketing",
          "Leverage social media platforms like Instagram and TikTok",
          "Emphasize innovation and trending products",
          "Consider influencer partnerships popular with young males"
        ];
      } else if (segment.includes("Male") && (segment.includes("25-34") || segment.includes("35-44"))) {
        return [
          "Focus on career advancement and professional success",
          "Highlight premium features and quality",
          "Use LinkedIn and professional networks for marketing",
          "Consider sports or technology-related promotions"
        ];
      } else if (segment.includes("Male") && (segment.includes("45+") || segment.includes("55+") || segment.includes("65+"))) {
        return [
          "Emphasize reliability and excellent customer service",
          "Focus on quality and durability in messaging",
          "Use clear, straightforward language",
          "Consider traditional marketing channels alongside digital"
        ];
      } else if (segment.includes("Female") && segment.includes("18-24")) {
        return [
          "Use lifestyle and social themes in marketing",
          "Leverage Instagram and TikTok for visual content",
          "Emphasize trends and social proof",
          "Consider influencer partnerships popular with young females"
        ];
      } else if (segment.includes("Female") && (segment.includes("25-34") || segment.includes("35-44"))) {
        return [
          "Focus on lifestyle integration and convenience",
          "Highlight quality and value for money",
          "Use detailed product information and reviews",
          "Consider community or lifestyle-related promotions"
        ];
      } else if (segment.includes("Female") && (segment.includes("45+") || segment.includes("55+") || segment.includes("65+"))) {
        return [
          "Emphasize reliability and excellent customer service",
          "Focus on quality and durability in messaging",
          "Use clear, detailed product information",
          "Consider traditional marketing channels alongside digital"
        ];
      }
    }

    // Fallback recommendations
    return [
      "Tailor marketing messages to demographic characteristics",
      "Test different approaches to see what resonates with this segment",
      "Use appropriate channels to reach this demographic group",
      "Monitor response rates to refine targeting strategy"
    ];
  };

  // Helper functions for preference segmentation
  const getPreferenceStrength = (count: number) => {
    if (count === 0) return "None";
    if (count === 1) return "Low";
    if (count === 2) return "Medium";
    return "Strong";
  };

  const getCategoryInsight = (categories: string[]) => {
    if (!categories || categories.length === 0) {
      return "No category preferences identified yet. Consider analyzing purchase history or conducting a survey.";
    }

    if (categories.length === 1) {
      return `This customer shows a strong preference for ${categories[0]}. Consider recommending similar or complementary products.`;
    }

    if (categories.length === 2) {
      return `This customer has shown interest in both ${categories[0]} and ${categories[1]}. Consider cross-category promotions.`;
    }

    return `This customer has diverse interests across ${categories.length} categories. Consider bundled offers or loyalty rewards.`;
  };

  const getMaterialInsight = (materials: string[]) => {
    if (!materials || materials.length === 0) {
      return "No material preferences identified yet. Consider analyzing purchase history or conducting a survey.";
    }

    if (materials.length === 1) {
      return `This customer shows a strong preference for ${materials[0]}. Highlight this material in product recommendations.`;
    }

    if (materials.length === 2) {
      return `This customer appreciates both ${materials[0]} and ${materials[1]}. Consider highlighting these materials in communications.`;
    }

    return `This customer has preferences for multiple materials. Emphasize material quality and variety in communications.`;
  };

  const getShoppingBehaviorInsight = (behavior: any) => {
    if (!behavior) {
      return "No shopping behavior data available. Consider tracking browsing and purchase patterns.";
    }

    if (typeof behavior === 'string') {
      switch(behavior.toLowerCase()) {
        case 'browser':
          return "This customer tends to browse extensively before making a purchase. Consider providing detailed product information.";
        case 'impulse buyer':
          return "This customer tends to make impulse purchases. Consider time-limited offers and prominent call-to-actions.";
        case 'researcher':
          return "This customer researches thoroughly before buying. Provide detailed specifications and comparisons.";
        case 'loyal':
          return "This customer shows loyalty to specific brands or products. Consider loyalty rewards and early access to new items.";
        case 'discount seeker':
          return "This customer is price-sensitive and looks for deals. Consider targeted promotions and value messaging.";
        default:
          return `This customer's shopping behavior is categorized as "${behavior}". Tailor marketing accordingly.`;
      }
    }

    // If behavior is an object with properties
    return "This customer has specific shopping patterns that can inform personalized marketing approaches.";
  };

  const getPreferenceSegmentDescription = (segment?: string) => {
    if (!segment) return "Preference segmentation helps create personalized product recommendations and targeted marketing.";

    if (segment.includes("Luxury")) {
      return "This customer prefers premium, high-quality products and may be less price-sensitive than other segments.";
    } else if (segment.includes("Value")) {
      return "This customer is value-conscious and appreciates good quality at reasonable prices.";
    } else if (segment.includes("Trendy") || segment.includes("Fashion")) {
      return "This customer follows trends and prefers contemporary, stylish products.";
    } else if (segment.includes("Traditional") || segment.includes("Classic")) {
      return "This customer prefers classic, timeless designs and established brands.";
    } else if (segment.includes("Eco") || segment.includes("Sustainable")) {
      return "This customer values sustainability and eco-friendly products and practices.";
    } else if (segment.includes("Tech") || segment.includes("Gadget")) {
      return "This customer is interested in technology and innovative products.";
    } else if (segment.includes("Convenience")) {
      return "This customer values convenience and efficiency in their shopping experience.";
    } else if (segment.includes("Group")) {
      const groupNumber = segment.match(/\d+/);
      return `This customer belongs to preference group ${groupNumber ? groupNumber[0] : ''}, which has specific product and shopping preferences.`;
    } else {
      return "This customer has specific preferences that can guide product recommendations and marketing messages.";
    }
  };

  const getPreferenceRecommendations = (segment?: string, categories?: string[], materials?: string[]) => {
    // Default recommendations if no preference data
    if (!segment && (!categories || categories.length === 0) && (!materials || materials.length === 0)) {
      return [
        "Collect more preference data through surveys or purchase analysis",
        "Offer a variety of products to gauge interests",
        "Use general best-sellers as initial recommendations",
        "Track engagement with different product categories"
      ];
    }

    // Category-based recommendations
    if (categories && categories.length > 0) {
      const category = categories[0]; // Use the first category for specific recommendations

      return [
        `Recommend best-selling products in the ${category} category`,
        `Highlight new arrivals in ${category} and related categories`,
        `Create a personalized collection based on ${category} preferences`,
        `Offer complementary products that pair well with ${category} items`
      ];
    }

    // Material-based recommendations
    if (materials && materials.length > 0) {
      const material = materials[0]; // Use the first material for specific recommendations

      return [
        `Highlight products made with ${material} in communications`,
        `Create a curated collection of ${material} products`,
        `Educate on the benefits and care of ${material} products`,
        `Recommend premium ${material} items for special occasions`
      ];
    }

    // Segment-based recommendations
    if (segment) {
      if (segment.includes("Luxury")) {
        return [
          "Highlight premium, exclusive products",
          "Emphasize craftsmanship and quality",
          "Offer personalized shopping experiences",
          "Create VIP early access to new collections"
        ];
      } else if (segment.includes("Value")) {
        return [
          "Emphasize value for money in messaging",
          "Highlight durability and versatility of products",
          "Offer bundle deals and quantity discounts",
          "Create loyalty programs with cumulative benefits"
        ];
      } else if (segment.includes("Trendy") || segment.includes("Fashion")) {
        return [
          "Highlight newest arrivals and trending items",
          "Create limited-time collections",
          "Use social media to showcase styling options",
          "Offer early access to upcoming trends"
        ];
      } else if (segment.includes("Traditional") || segment.includes("Classic")) {
        return [
          "Highlight timeless, classic products",
          "Emphasize quality and longevity",
          "Create heritage collections or limited editions",
          "Use traditional marketing channels alongside digital"
        ];
      } else if (segment.includes("Eco") || segment.includes("Sustainable")) {
        return [
          "Highlight eco-friendly and sustainable products",
          "Educate on environmental impact and benefits",
          "Emphasize ethical sourcing and production",
          "Create recycling or trade-in programs"
        ];
      } else if (segment.includes("Group")) {
        return [
          "Offer personalized product recommendations based on group preferences",
          "Create targeted promotions for this preference group",
          "Highlight products popular with similar customers",
          "Test different messaging approaches for this group"
        ];
      }
    }

    // Fallback recommendations
    return [
      "Create personalized product recommendations based on available preference data",
      "Test different product categories to expand preference profile",
      "Use purchase history to inform future recommendations",
      "Gather more preference data through surveys or feedback"
    ];
  };

  // Helper functions for marketing status
  const getMarketingRecommendations = (status?: string, consentGiven?: boolean) => {
    // No consent
    if (consentGiven === false) {
      return [
        "Request marketing consent during next interaction",
        "Highlight benefits of receiving marketing communications",
        "Ensure all communications are compliant with privacy regulations",
        "Consider transactional-only communications that don't require marketing consent"
      ];
    }

    // Has consent but inactive
    if (consentGiven === true && status === "inactive") {
      return [
        "Send a re-engagement campaign to reactivate",
        "Ask for communication preferences to improve relevance",
        "Offer an incentive to re-subscribe to marketing",
        "Review past communications to identify potential issues"
      ];
    }

    // Has consent and active
    if (consentGiven === true && status === "active") {
      return [
        "Maintain regular, relevant communications",
        "Segment marketing based on preferences and behavior",
        "Test different content types to optimize engagement",
        "Monitor engagement metrics to ensure continued interest"
      ];
    }

    // Unknown status
    return [
      "Verify marketing consent status",
      "Set up communication preferences",
      "Create a welcome series for new subscribers",
      "Establish a regular communication schedule"
    ];
  };

  const getEngagementLevel = (metrics: any) => {
    if (!metrics) return "Unknown";

    // If we have open rate and click rate
    if (metrics.email_open_rate && metrics.click_rate) {
      const openRate = parseFloat(metrics.email_open_rate);
      const clickRate = parseFloat(metrics.click_rate);

      if (openRate > 30 && clickRate > 5) return "Very High";
      if (openRate > 25 && clickRate > 3) return "High";
      if (openRate > 20 && clickRate > 2) return "Good";
      if (openRate > 15 && clickRate > 1) return "Average";
      if (openRate > 10) return "Low";
      return "Very Low";
    }

    // If we only have open rate
    if (metrics.email_open_rate) {
      const openRate = parseFloat(metrics.email_open_rate);

      if (openRate > 30) return "High";
      if (openRate > 20) return "Good";
      if (openRate > 15) return "Average";
      if (openRate > 10) return "Low";
      return "Very Low";
    }

    // If we only have click rate
    if (metrics.click_rate) {
      const clickRate = parseFloat(metrics.click_rate);

      if (clickRate > 5) return "High";
      if (clickRate > 3) return "Good";
      if (clickRate > 2) return "Average";
      if (clickRate > 1) return "Low";
      return "Very Low";
    }

    return "Unknown";
  };

  const getMetricRating = (value: string, metricType: string) => {
    const numValue = parseFloat(value);

    if (metricType === 'open_rate') {
      if (numValue > 30) return "Excellent";
      if (numValue > 25) return "Very Good";
      if (numValue > 20) return "Good";
      if (numValue > 15) return "Average";
      if (numValue > 10) return "Below Average";
      return "Poor";
    }

    if (metricType === 'click_rate') {
      if (numValue > 5) return "Excellent";
      if (numValue > 3) return "Very Good";
      if (numValue > 2) return "Good";
      if (numValue > 1) return "Average";
      if (numValue > 0.5) return "Below Average";
      return "Poor";
    }

    return "Unknown";
  };

  const getEngagementInsight = (metrics: any) => {
    if (!metrics) return "No engagement data available. Start tracking email opens and clicks to measure engagement.";

    const engagementLevel = getEngagementLevel(metrics);

    switch(engagementLevel) {
      case "Very High":
        return "This customer is highly engaged with your marketing communications. They consistently open emails and click on content. Consider VIP treatment and early access to new products or promotions.";
      case "High":
        return "This customer engages well with your marketing. They open emails regularly and click on content that interests them. Continue to provide relevant, valuable content.";
      case "Good":
        return "This customer shows good engagement with your marketing. They open emails and occasionally click on content. Focus on increasing click-through rates with more compelling calls-to-action.";
      case "Average":
        return "This customer shows average engagement with your marketing. They open some emails but don't click often. Consider testing different content types and sending times to improve engagement.";
      case "Low":
        return "This customer shows low engagement with your marketing. They rarely open emails or click on content. Consider reducing frequency and focusing on high-value content to re-engage them.";
      case "Very Low":
        return "This customer shows very low engagement with your marketing. They almost never open emails or click on content. Consider a re-engagement campaign or removing them from regular communications.";
      default:
        return "Limited engagement data available. Continue to monitor this customer's interaction with marketing communications.";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold">Error Loading Customer</h3>
            <p className="text-muted-foreground">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        ) : customer ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                {customer.firstName} {customer.lastName}
                {getSegmentBadge(customer.segment)}
              </DialogTitle>
              <DialogDescription>
                Customer since {formatDate(customer.createdAt)}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="purchases">Purchases</TabsTrigger>
                <TabsTrigger value="segments">Segments</TabsTrigger>
                <TabsTrigger value="interactions">Interactions</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xl">
                      {customer.firstName?.[0]}{customer.lastName?.[0]}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{customer.firstName} {customer.lastName}</h2>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>Customer since {formatDate(customer.createdAt)}</span>
                      </p>
                    </div>
                  </div>
                  <div>
                    {getSegmentBadge(customer.segment)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Mail className="h-5 w-5 text-primary" />
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div>
                          <div>{customer.email || "No email provided"}</div>
                          <div className="text-xs text-muted-foreground">Email</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div>
                          <div>{customer.phone || "No phone provided"}</div>
                          <div className="text-xs text-muted-foreground">Phone</div>
                        </div>
                      </div>
                      {(customer.address || customer.city) && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div>
                            <div>
                              {customer.address && <span>{customer.address}</span>}
                              {customer.address && customer.city && <span>, </span>}
                              {customer.city && <span>{customer.city}</span>}
                              {!customer.address && !customer.city && <span>No address provided</span>}
                            </div>
                            <div className="text-xs text-muted-foreground">Address</div>
                          </div>
                        </div>
                      )}
                      {customer.marketing_status && (
                        <div className="flex items-start gap-2">
                          {customer.marketing_status === 'active' ? (
                            <Bell className="h-4 w-4 mt-1 text-muted-foreground" />
                          ) : (
                            <BellOff className="h-4 w-4 mt-1 text-muted-foreground" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              {customer.marketing_status === 'active' ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Marketing Active
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                  {customer.marketing_status === 'opted_out' ? 'Opted Out' :
                                   customer.marketing_status === 'deleted' ? 'Deleted' : 'Inactive'}
                                </Badge>
                              )}
                              {customer.opt_out_date && (
                                <span className="text-xs text-muted-foreground">
                                  since {formatDate(customer.opt_out_date)}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">Marketing Status</div>
                          </div>
                        </div>
                      )}

                      {customer.gender && (
                        <div className="flex items-start gap-2">
                          <User className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div>
                            <div className="capitalize">{customer.gender}</div>
                            <div className="text-xs text-muted-foreground">Gender</div>
                          </div>
                        </div>
                      )}
                      {customer.age && (
                        <div className="flex items-start gap-2">
                          <User className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div>
                            <div>{customer.age} years</div>
                            <div className="text-xs text-muted-foreground">Age</div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                        Purchase Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-2">
                        <CreditCard className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            Rs. {typeof customer.totalSpent === 'number' ?
                              customer.totalSpent.toLocaleString('en-LK') : '0'}
                          </div>
                          <div className="text-xs text-muted-foreground">Total Spent</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <ShoppingBag className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div>
                          <div>{customer.purchaseCount || 0} purchases</div>
                          <div className="text-xs text-muted-foreground">Purchase Count</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CalendarDays className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div>
                          <div>{customer.lastPurchase ? formatDate(customer.lastPurchase) : "No purchases yet"}</div>
                          <div className="text-xs text-muted-foreground">Last Purchase</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Tag className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div>
                          <div>{getSegmentBadge(customer.segment)}</div>
                          <div className="text-xs text-muted-foreground">Customer Segment</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Award className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div>
                          <div>
                            {customer.value_segment ? (
                              <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                                {customer.value_segment}
                              </Badge>
                            ) : (
                              "Not classified"
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">Value Segment</div>
                        </div>
                      </div>
                      {customer.transactions && customer.transactions.length > 0 && (
                        <div className="flex items-start gap-2">
                          <Tag className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div>
                            <div>
                              {customer.transactions
                                .map(tx => tx.payment_method)
                                .filter((value, index, self) => value && self.indexOf(value) === index)
                                .join(', ') || 'N/A'}
                            </div>
                            <div className="text-xs text-muted-foreground">Payment Methods</div>
                          </div>
                        </div>
                      )}
                      {customer.transactions && customer.transactions.length > 0 && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div>
                            <div>
                              {customer.transactions
                                .map(tx => tx.store_location)
                                .filter((value, index, self) => value && self.indexOf(value) === index)
                                .join(', ') || 'N/A'}
                            </div>
                            <div className="text-xs text-muted-foreground">Store Locations</div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {customer.notes && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{customer.notes}</p>
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        Marketing Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Consent Status */}
                        <div>
                          <h4 className="text-sm font-medium mb-2">Consent Status</h4>
                          <div className="flex items-center gap-2">
                            {customer.consentGiven ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Consented
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                No Consent
                              </Badge>
                            )}
                            {customer.consentDate && (
                              <span className="text-sm text-muted-foreground">
                                on {formatDate(customer.consentDate)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Opt-Out Status */}
                        <div>
                          <h4 className="text-sm font-medium mb-2">Marketing Status</h4>
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center gap-2">
                              {customer.marketing_status === 'active' ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Active
                                </Badge>
                              ) : customer.marketing_status === 'opted_out' ? (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                  Opted Out
                                </Badge>
                              ) : customer.marketing_status === 'deleted' ? (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                  Data Deletion Requested
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                                  Unknown
                                </Badge>
                              )}
                              {customer.opt_out_date && (
                                <span className="text-sm text-muted-foreground">
                                  on {formatDate(customer.opt_out_date)}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                              <Select
                                value={customer.marketing_status || 'active'}
                                onValueChange={(value) => handleUpdateOptOutStatus(value as 'active' | 'opted_out' | 'deleted')}
                                disabled={isUpdatingStatus}
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="opted_out">Opted Out</SelectItem>
                                  <SelectItem value="deleted">Data Deletion</SelectItem>
                                </SelectContent>
                              </Select>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateOptOutStatus(customer.marketing_status === 'active' ? 'opted_out' : 'active')}
                                disabled={isUpdatingStatus || customer.marketing_status === 'deleted'}
                              >
                                {isUpdatingStatus ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : customer.marketing_status === 'active' ? (
                                  <BellOff className="h-4 w-4 mr-2" />
                                ) : (
                                  <Bell className="h-4 w-4 mr-2" />
                                )}
                                {customer.marketing_status === 'active' ? 'Opt Out' : 'Opt In'}
                              </Button>
                            </div>

                            <p className="text-xs text-muted-foreground mt-1">
                              {customer.marketing_status === 'active'
                                ? 'Customer is currently receiving marketing messages.'
                                : customer.marketing_status === 'opted_out'
                                ? 'Customer has opted out of marketing messages.'
                                : customer.marketing_status === 'deleted'
                                ? 'Customer has requested data deletion.'
                                : 'Status unknown.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Activity Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span className="text-sm">Created on {formatDate(customer.createdAt)}</span>
                        </div>

                        {customer.lastPurchase && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            <span className="text-sm">Last purchase on {formatDate(customer.lastPurchase)}</span>
                          </div>
                        )}

                        {customer.consentDate && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                            <span className="text-sm">
                              {customer.consentGiven ? 'Gave consent' : 'Revoked consent'} on {formatDate(customer.consentDate)}
                            </span>
                          </div>
                        )}

                        {customer.survey_responses && customer.survey_responses.length > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                            <span className="text-sm">
                              Completed {customer.survey_responses.length} survey{customer.survey_responses.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {customer.preferences && Object.keys(customer.preferences).length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Heart className="h-5 w-5 text-primary" />
                        Customer Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(customer.preferences).flatMap(([key, values]) => {
                          if (!values) return [];

                          if (Array.isArray(values)) {
                            return values.map((value, i) => (
                              <Badge key={`${key}-${i}`} variant="secondary" className="capitalize">
                                {typeof value === 'string' ? value : JSON.stringify(value)}
                              </Badge>
                            ));
                          }

                          return [
                            <Badge key={key} variant="secondary" className="capitalize">
                              {typeof values === 'string' ? values : JSON.stringify(values)}
                            </Badge>
                          ];
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="segments" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* RFM Segmentation */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart4 className="h-5 w-5 text-primary" />
                        RFM Segmentation
                      </CardTitle>
                      <CardDescription>
                        Recency, Frequency, Monetary Value Analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {customer.rfm_data ? (
                        <div className="space-y-4">
                          <details className="text-xs text-muted-foreground mb-2">
                            <summary className="text-sm font-medium cursor-pointer hover:text-primary">
                              What is RFM Analysis?
                            </summary>
                            <div className="mt-2 p-2 border rounded-md bg-slate-50">
                              <p className="mb-1">
                                <span className="font-medium">RFM</span> = <span className="text-blue-600">Recency</span>, <span className="text-green-600">Frequency</span>, <span className="text-purple-600">Monetary</span>
                              </p>
                              <p>Scores from 1-5 (5 = best) determine customer value segment.</p>
                            </div>
                          </details>

                          <div className="grid grid-cols-3 gap-2">
                            <div className="flex flex-col p-2 border rounded-md bg-blue-50/30">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-blue-600">Recency</span>
                                <span className="text-2xl font-bold text-blue-600">{customer.rfm_data.r_score || 'N/A'}</span>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {customer.rfm_data.recency !== undefined ?
                                  `${customer.rfm_data.recency} days ago` : 'N/A'}
                              </div>
                              <div className="text-xs mt-1 text-blue-600 italic">
                                {getRFMScoreDescription('r', customer.rfm_data.r_score)}
                              </div>
                            </div>

                            <div className="flex flex-col p-2 border rounded-md bg-green-50/30">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-green-600">Frequency</span>
                                <span className="text-2xl font-bold text-green-600">{customer.rfm_data.f_score || 'N/A'}</span>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {customer.rfm_data.frequency !== undefined ?
                                  `${customer.rfm_data.frequency} orders` : 'N/A'}
                              </div>
                              <div className="text-xs mt-1 text-green-600 italic">
                                {getRFMScoreDescription('f', customer.rfm_data.f_score)}
                              </div>
                            </div>

                            <div className="flex flex-col p-2 border rounded-md bg-purple-50/30">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-purple-600">Monetary</span>
                                <span className="text-2xl font-bold text-purple-600">{customer.rfm_data.m_score || 'N/A'}</span>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {customer.rfm_data.monetary !== undefined ?
                                  `Rs. ${Number(customer.rfm_data.monetary).toLocaleString('en-LK')}` : 'N/A'}
                              </div>
                              <div className="text-xs mt-1 text-purple-600 italic">
                                {getRFMScoreDescription('m', customer.rfm_data.m_score)}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col p-3 border rounded-md bg-gradient-to-r from-slate-50 to-primary/5">
                            <div className="flex items-center gap-3">
                              <Badge className="px-3 py-1 bg-primary text-primary-foreground">
                                RFM: {customer.rfm_data.rfm_score || 'N/A'}
                              </Badge>
                              <span className="text-sm font-semibold">
                                {customer.value_segment || 'Unclassified'}
                              </span>
                              <span className="text-xs text-muted-foreground ml-auto">
                                {customer.rfm_data.last_calculated ?
                                  `Updated: ${new Date(customer.rfm_data.last_calculated).toLocaleDateString('en-LK')}` : ''}
                              </span>
                            </div>

                            <details className="mt-2">
                              <summary className="text-xs font-medium cursor-pointer hover:text-primary">
                                Segment Description
                              </summary>
                              <div className="mt-2 text-xs">
                                <p>{getValueSegmentDescription(customer.value_segment)}</p>
                              </div>
                            </details>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <BarChart4 className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                          <h3 className="text-lg font-semibold">No RFM Data</h3>
                          <p className="text-muted-foreground max-w-md">
                            RFM segmentation data is not available for this customer.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Demographic Segmentation */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Demographic Segmentation
                      </CardTitle>
                      <CardDescription>
                        Age and Gender Based Segmentation
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <details className="text-xs text-muted-foreground mb-2">
                          <summary className="text-sm font-medium cursor-pointer hover:text-primary">
                            About Demographic Segmentation
                          </summary>
                          <div className="mt-2 p-2 border rounded-md bg-slate-50">
                            <p className="mb-1">
                              Groups by <span className="text-blue-600">Gender</span>, <span className="text-amber-600">Age</span>, and their combinations to tailor marketing.
                            </p>
                          </div>
                        </details>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col p-2 border rounded-md bg-blue-50/30">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-medium text-blue-600">Gender</span>
                              {customer.gender && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  {getDemographicDistribution(customer.gender)}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm font-medium capitalize">{customer.gender || 'Unknown'}</span>
                            </div>
                            {customer.gender_segment && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Segment: {customer.gender_segment.replace('Gender_', '')}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col p-2 border rounded-md bg-amber-50/30">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-medium text-amber-600">Age</span>
                              {customer.age && (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                  {getAgeGroup(customer.age)}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm font-medium">
                                {customer.age ? `${customer.age} years` : 'Unknown'}
                              </span>
                            </div>
                            {customer.demographic_segment && customer.demographic_segment.includes('Age_') && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Segment: {customer.demographic_segment.split('Age_')[1]}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col p-3 border rounded-md bg-gradient-to-r from-slate-50 to-green-50/30">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">Combined Segment:</span>
                            <Badge className="bg-green-100 text-green-800">
                              {customer.demographic_segment ?
                                customer.demographic_segment.replace(/_/g, ' ') :
                                'Unclassified'}
                            </Badge>
                          </div>

                          <details className="mt-2">
                            <summary className="text-xs font-medium cursor-pointer hover:text-primary">
                              Segment Details
                            </summary>
                            <div className="mt-2 text-xs">
                              <p>{getDemographicSegmentDescription(customer.demographic_segment)}</p>
                            </div>
                          </details>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Preference Segmentation */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Heart className="h-5 w-5 text-primary" />
                        Preference Segmentation
                      </CardTitle>
                      <CardDescription>
                        Product and Material Preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {customer.preferences || customer.favorite_category || customer.preferred_material ? (
                        <div className="space-y-4">
                          <details className="text-xs text-muted-foreground mb-2">
                            <summary className="text-sm font-medium cursor-pointer hover:text-primary">
                              About Preference Segmentation
                            </summary>
                            <div className="mt-2 p-2 border rounded-md bg-slate-50">
                              <p className="mb-1">
                                Groups by <span className="text-rose-600">Product</span>, <span className="text-purple-600">Material</span>, and <span className="text-green-600">Shopping Behavior</span> preferences for personalized marketing.
                              </p>
                            </div>
                          </details>

                          {/* Favorite Categories */}
                          <div className="flex flex-col p-3 border rounded-md bg-gradient-to-br from-rose-50 to-transparent group hover:shadow-sm transition-all">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-medium text-rose-600">Favorite Categories</span>
                              <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
                                {getPreferenceStrength(customer.preferences?.favorite_categories?.length || (customer.favorite_category ? 1 : 0))}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {customer.preferences?.favorite_categories ? (
                                customer.preferences.favorite_categories.map((category: string, index: number) => (
                                  <Badge key={index} variant="secondary" className="bg-rose-100 text-rose-800 hover:bg-rose-200 border-none">
                                    {category}
                                  </Badge>
                                ))
                              ) : customer.favorite_category ? (
                                <Badge variant="secondary" className="bg-rose-100 text-rose-800 hover:bg-rose-200 border-none">
                                  {customer.favorite_category}
                                </Badge>
                              ) : (
                                <span className="text-sm text-muted-foreground">None specified</span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-3">
                              {getCategoryInsight(customer.preferences?.favorite_categories || (customer.favorite_category ? [customer.favorite_category] : []))}
                            </div>
                          </div>

                          {/* Preferred Materials */}
                          <div className="flex flex-col p-3 border rounded-md bg-gradient-to-br from-purple-50 to-transparent group hover:shadow-sm transition-all">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-medium text-purple-600">Preferred Materials</span>
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                {getPreferenceStrength(customer.preferences?.preferred_materials?.length || (customer.preferred_material ? 1 : 0))}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {customer.preferences?.preferred_materials ? (
                                customer.preferences.preferred_materials.map((material: string, index: number) => (
                                  <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-none">
                                    {material}
                                  </Badge>
                                ))
                              ) : customer.preferred_material ? (
                                <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-none">
                                  {customer.preferred_material}
                                </Badge>
                              ) : (
                                <span className="text-sm text-muted-foreground">None specified</span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-3">
                              {getMaterialInsight(customer.preferences?.preferred_materials || (customer.preferred_material ? [customer.preferred_material] : []))}
                            </div>
                          </div>

                          {/* Shopping Behavior */}
                          {customer.shopping_behavior && (
                            <div className="flex flex-col p-3 border rounded-md bg-gradient-to-br from-amber-50 to-transparent group hover:shadow-sm transition-all">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium text-amber-600">Shopping Behavior</span>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {typeof customer.shopping_behavior === 'string' ? (
                                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none">
                                    {customer.shopping_behavior}
                                  </Badge>
                                ) : (
                                  Object.entries(customer.shopping_behavior).map(([key, value], index) => (
                                    <Badge key={index} variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none">
                                      {`${key}: ${value}`}
                                    </Badge>
                                  ))
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground mt-3">
                                {getShoppingBehaviorInsight(customer.shopping_behavior)}
                              </div>
                            </div>
                          )}

                          {/* Preference Segment */}
                          <div className="flex flex-col p-4 border rounded-md bg-gradient-to-r from-slate-50 to-green-50">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">Preference Segment</span>
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                {customer.preference_segment || 'Unclassified'}
                              </Badge>
                            </div>

                            <p className="text-sm">
                              {getPreferenceSegmentDescription(customer.preference_segment)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <Heart className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                          <h3 className="text-lg font-semibold">No Preference Data</h3>
                          <p className="text-muted-foreground max-w-md">
                            Preference data is not available for this customer.
                          </p>

                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Marketing Status */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        Marketing Status
                      </CardTitle>
                      <CardDescription>
                        Marketing Consent and Communication Status
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <details className="text-xs text-muted-foreground mb-2">
                          <summary className="text-sm font-medium cursor-pointer hover:text-primary">
                            About Marketing Status
                          </summary>
                          <div className="mt-2 p-2 border rounded-md bg-slate-50">
                            <p className="mb-1">
                              Tracks <span className="text-green-600">Consent</span>, <span className="text-blue-600">Communication Preferences</span>, and <span className="text-purple-600">Engagement</span> for compliance and effectiveness.
                            </p>
                          </div>
                        </details>

                        <div className="flex flex-col p-3 border rounded-md bg-green-50/30">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-green-700">Consent:</span>
                            {customer.consentGiven ? (
                              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                                Consented
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                                No Consent
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground ml-auto">
                              {customer.consentDate ? formatDate(customer.consentDate) : 'No date'}
                            </span>
                          </div>

                          <details className="mt-2">
                            <summary className="text-xs font-medium cursor-pointer hover:text-primary">
                              Consent Details
                            </summary>
                            <div className="mt-2 p-2 border rounded-md bg-white text-xs">
                              <p className="mb-2">
                                {customer.consentGiven ?
                                  "This customer has provided explicit consent to receive marketing communications." :
                                  "This customer has not provided consent for marketing communications."}
                              </p>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <AlertCircle className="h-3 w-3" />
                                <span>Always comply with privacy laws and regulations.</span>
                              </div>
                            </div>
                          </details>
                        </div>

                        <div className="flex flex-col p-3 border rounded-md bg-blue-50/30">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-blue-700">Status:</span>
                            <Badge
                              variant="outline"
                              className={customer.marketing_status === "active" ?
                                "bg-green-100 text-green-700 border-green-200" :
                                customer.marketing_status === "inactive" ?
                                "bg-amber-100 text-amber-700 border-amber-200" :
                                "bg-slate-100 text-slate-700 border-slate-200"
                              }
                            >
                              {customer.marketing_status === "active" ? "Active" :
                               customer.marketing_status === "inactive" ? "Inactive" :
                               customer.marketing_status === "opted_out" ? "Opted Out" :
                               "Unknown"}
                            </Badge>

                            {customer.opt_out_date && (
                              <span className="text-xs text-muted-foreground ml-auto">
                                {customer.marketing_status === "opted_out" ? `Opted out: ${formatDate(customer.opt_out_date)}` : ''}
                              </span>
                            )}
                          </div>

                          {customer.communication_preferences && (
                            <div className="flex gap-2 mt-2">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs">
                                  {customer.communication_preferences.email ? 'Email ✓' : 'Email ✗'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs">
                                  {customer.communication_preferences.sms ? 'SMS ✓' : 'SMS ✗'}
                                </span>
                              </div>
                            </div>
                          )}


                        </div>

                        {customer.marketing_metrics && (
                          <div className="flex flex-col p-3 border rounded-md bg-purple-50/30">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-purple-700">Engagement:</span>
                              <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                                {getEngagementLevel(customer.marketing_metrics)}
                              </Badge>
                            </div>

                            <div className="flex gap-4 mt-2 text-xs">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <span>Opens: {customer.marketing_metrics.email_open_rate || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MousePointer className="h-3 w-3 text-muted-foreground" />
                                <span>Clicks: {customer.marketing_metrics.click_rate || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="purchases" className="mt-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                        Purchase History
                      </CardTitle>
                      <CardDescription>
                        Detailed transaction history for this customer
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      {customer.purchaseCount || 0} Transactions
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    {customer.transactions && customer.transactions.length > 0 ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                          <div className="flex flex-col gap-1 p-4 border rounded-md">
                            <span className="text-sm text-muted-foreground">Total Spent</span>
                            <span className="text-2xl font-bold">
                              Rs. {customer.totalSpent.toLocaleString('en-LK')}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1 p-4 border rounded-md">
                            <span className="text-sm text-muted-foreground">Purchase Count</span>
                            <span className="text-2xl font-bold">
                              {customer.purchaseCount} orders
                            </span>
                          </div>
                          <div className="flex flex-col gap-1 p-4 border rounded-md">
                            <span className="text-sm text-muted-foreground">Average Order Value</span>
                            <span className="text-2xl font-bold">
                              Rs. {customer.purchaseCount && customer.totalSpent ?
                                Math.round(customer.totalSpent / customer.purchaseCount).toLocaleString('en-LK') :
                                '0'}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1 p-4 border rounded-md">
                            <span className="text-sm text-muted-foreground">Last Purchase</span>
                            <span className="text-2xl font-bold">
                              {customer.lastPurchase ?
                                new Date(customer.lastPurchase).toLocaleDateString('en-LK') :
                                'N/A'}
                            </span>
                          </div>
                        </div>

                        <ScrollArea className="h-[300px] rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Transaction ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Payment Method</TableHead>
                                <TableHead>Location</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {customer.transactions.map((transaction: any, index: number) => (
                                <TableRow key={transaction.transaction_id || index}>
                                  <TableCell className="font-medium">
                                    {transaction.transaction_id || `TX-${index + 1}`}
                                  </TableCell>
                                  <TableCell>
                                    {transaction.purchase_datetime ?
                                      new Date(transaction.purchase_datetime).toLocaleDateString('en-LK') :
                                      'N/A'}
                                  </TableCell>
                                <TableCell>
                                  Rs. {parseFloat(transaction.total_amount_lkr || 0).toLocaleString('en-LK')}
                                </TableCell>
                                <TableCell>
                                  {transaction.payment_method || 'N/A'}
                                </TableCell>
                                <TableCell>
                                  {transaction.store_location || 'N/A'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                        <h3 className="text-lg font-semibold">No Purchase History</h3>
                        <p className="text-muted-foreground max-w-md">
                          This customer hasn't made any purchases yet, or purchase data is not available.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {customer.transactions && customer.transactions.length > 0 && (
                  <Card className="mt-4">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart4 className="h-5 w-5 text-primary" />
                        Purchase Analytics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1 p-4 border rounded-md">
                          <span className="text-sm text-muted-foreground">Total Spent</span>
                          <span className="text-2xl font-bold">
                            Rs. {customer.totalSpent?.toLocaleString('en-LK') || '0'}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 p-4 border rounded-md">
                          <span className="text-sm text-muted-foreground">Average Order Value</span>
                          <span className="text-2xl font-bold">
                            Rs. {customer.purchaseCount && customer.totalSpent ?
                              Math.round(customer.totalSpent / customer.purchaseCount).toLocaleString('en-LK') :
                              '0'}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 p-4 border rounded-md">
                          <span className="text-sm text-muted-foreground">Last Purchase</span>
                          <span className="text-2xl font-bold">
                            {customer.lastPurchase ?
                              new Date(customer.lastPurchase).toLocaleDateString('en-LK') :
                              'N/A'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="interactions" className="mt-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        Survey Responses
                      </CardTitle>
                      <CardDescription>
                        Customer feedback and survey responses
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {customer.survey_responses && customer.survey_responses.length > 0 ? (
                      <ScrollArea className="h-[300px] rounded-md border">
                        <div className="p-4 space-y-6">
                          {customer.survey_responses.map((survey: any, index: number) => (
                            <div key={survey.survey_id || index} className="border-b pb-4 last:border-0">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  {survey.ingested_date ?
                                    new Date(survey.ingested_date).toLocaleDateString('en-LK') :
                                    `Survey #${index + 1}`}
                                </h4>
                                {survey.survey_id && (
                                  <Badge variant="outline" className="text-xs">
                                    ID: {survey.survey_id}
                                  </Badge>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                {Object.entries(survey)
                                  .filter(([key]) => !['survey_id', 'ingested_date', 'contact_number'].includes(key))
                                  .map(([key, value]) => (
                                    <div key={key} className="flex flex-col">
                                      <span className="text-xs text-muted-foreground capitalize">
                                        {key.replace(/_/g, ' ')}
                                      </span>
                                      <span className="text-sm">{value as string || 'N/A'}</span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                        <h3 className="text-lg font-semibold">No Survey Responses</h3>
                        <p className="text-muted-foreground max-w-md">
                          This customer has not completed any surveys yet or survey data is not available.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="mt-4">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-primary" />
                        Customer Preferences
                      </CardTitle>
                      <CardDescription>
                        Preferences and interests based on surveys and interactions
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {customer.preferences && Object.keys(customer.preferences).length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(customer.preferences).map(([key, values]) => (
                          <div key={key} className="border rounded-md p-4">
                            <h4 className="text-sm font-medium mb-2 capitalize">{key.replace(/_/g, ' ')}</h4>
                            <div className="flex flex-wrap gap-2">
                              {Array.isArray(values) ? (
                                values.map((value: any, i: number) => (
                                  <Badge key={i} variant="secondary" className="capitalize">
                                    {typeof value === 'string' ? value : JSON.stringify(value)}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  {typeof values === 'string' ? values : JSON.stringify(values)}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Heart className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                        <h3 className="text-lg font-semibold">No Preference Data</h3>
                        <p className="text-muted-foreground max-w-md">
                          No preference data is available for this customer yet.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
            </DialogFooter>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Customer Not Found</h3>
            <p className="text-muted-foreground">The requested customer could not be found.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetailsDialog;
