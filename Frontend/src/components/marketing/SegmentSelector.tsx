import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Users, 
  CheckCircle2, 
  Filter, 
  Loader2 
} from "lucide-react";
import { 
  getCustomSegments, 
  runComprehensiveSegmentation, 
  transformSegmentationData, 
  Segment 
} from "@/services/segmentationApi";

interface SegmentSelectorProps {
  selectedSegmentId?: string;
  onSegmentSelected: (segment: Segment) => void;
}

export function SegmentSelector({ selectedSegmentId, onSegmentSelected }: SegmentSelectorProps) {
  const [activeTab, setActiveTab] = useState("custom");
  const [searchQuery, setSearchQuery] = useState("");
  const [customSegments, setCustomSegments] = useState<Segment[]>([]);
  const [rfmSegments, setRfmSegments] = useState<any[]>([]);
  const [preferenceSegments, setPreferenceSegments] = useState<any[]>([]);
  const [demographicSegments, setDemographicSegments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);

  // Load segments on component mount
  useEffect(() => {
    const loadSegments = async () => {
      setIsLoading(true);
      try {
        // Load custom segments
        const customSegmentsData = await getCustomSegments();
        setCustomSegments(customSegmentsData);

        // Load segmentation data
        const segmentationData = await runComprehensiveSegmentation();
        const transformedData = transformSegmentationData(segmentationData);

        // Extract RFM segments
        const rfmSegmentData = transformedData.rfmData.map(segment => ({
          id: `rfm-${segment.name.toLowerCase().replace(/\s+/g, '-')}`,
          name: segment.name,
          description: `RFM segment: ${segment.name}`,
          type: 'rfm',
          customerCount: segment.value,
          customerPercentage: Math.round((segment.value / segmentationData.customer_count) * 100),
          rules: [
            {
              id: `rule-${Date.now()}`,
              type: 'rfm_segment',
              operator: 'is',
              value: segment.name
            }
          ],
          isActive: true
        }));
        setRfmSegments(rfmSegmentData);

        // Extract preference segments
        const preferenceSegmentData = transformedData.preferenceData.map(segment => ({
          id: `preference-${segment.name.toLowerCase().replace(/\s+/g, '-')}`,
          name: segment.name,
          description: `Preference segment: ${segment.name}`,
          type: 'preference',
          customerCount: segment.value,
          customerPercentage: Math.round((segment.value / segmentationData.customer_count) * 100),
          rules: [
            {
              id: `rule-${Date.now()}`,
              type: 'preference_segment',
              operator: 'is',
              value: segment.name
            }
          ],
          isActive: true
        }));
        setPreferenceSegments(preferenceSegmentData);

        // Extract demographic segments
        const demographicSegmentData = transformedData.demographicData.map(segment => ({
          id: `demographic-${segment.name.toLowerCase().replace(/\s+/g, '-')}`,
          name: segment.name,
          description: `Demographic segment: ${segment.name}`,
          type: 'demographic',
          customerCount: segment.value,
          customerPercentage: Math.round((segment.value / segmentationData.customer_count) * 100),
          rules: [
            {
              id: `rule-${Date.now()}`,
              type: 'gender',
              operator: 'is',
              value: segment.name
            }
          ],
          isActive: true
        }));
        setDemographicSegments(demographicSegmentData);

        // Set selected segment if provided
        if (selectedSegmentId) {
          const segment = 
            customSegmentsData.find(s => s.id === selectedSegmentId) ||
            rfmSegmentData.find(s => s.id === selectedSegmentId) ||
            preferenceSegmentData.find(s => s.id === selectedSegmentId) ||
            demographicSegmentData.find(s => s.id === selectedSegmentId);
          
          if (segment) {
            setSelectedSegment(segment);
            
            // Set active tab based on segment type
            if (customSegmentsData.find(s => s.id === selectedSegmentId)) {
              setActiveTab("custom");
            } else if (rfmSegmentData.find(s => s.id === selectedSegmentId)) {
              setActiveTab("rfm");
            } else if (preferenceSegmentData.find(s => s.id === selectedSegmentId)) {
              setActiveTab("preference");
            } else if (demographicSegmentData.find(s => s.id === selectedSegmentId)) {
              setActiveTab("demographic");
            }
          }
        }
      } catch (error) {
        console.error("Error loading segments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSegments();
  }, [selectedSegmentId]);

  // Handle segment selection
  const handleSegmentSelect = (segment: Segment) => {
    setSelectedSegment(segment);
    onSegmentSelected(segment);
  };

  // Filter segments based on search query
  const filterSegments = (segments: any[]) => {
    if (!searchQuery) return segments;
    
    return segments.filter(segment => 
      segment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (segment.description && segment.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  // Render segment card
  const renderSegmentCard = (segment: any) => {
    const isSelected = selectedSegment?.id === segment.id;
    
    return (
      <Card 
        key={segment.id} 
        className={`cursor-pointer transition-all ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'}`}
        onClick={() => handleSegmentSelect(segment)}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-base">{segment.name}</CardTitle>
              <CardDescription className="text-xs mt-1">
                {segment.description || `${segment.customerCount} customers`}
              </CardDescription>
            </div>
            {isSelected && (
              <CheckCircle2 className="h-5 w-5 text-primary" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <Badge variant="secondary">
              {segment.customerCount} customers
            </Badge>
            <span className="text-muted-foreground">
              {segment.customerPercentage}% of total
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search segments..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="custom">Custom Segments</TabsTrigger>
          <TabsTrigger value="rfm">RFM Segments</TabsTrigger>
          <TabsTrigger value="preference">Preference Segments</TabsTrigger>
          <TabsTrigger value="demographic">Demographic Segments</TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading segments...</span>
          </div>
        ) : (
          <>
            <TabsContent value="custom">
              {filterSegments(customSegments).length === 0 ? (
                <div className="border border-dashed rounded-md p-8 text-center">
                  <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground mb-4">
                    {searchQuery 
                      ? "No custom segments match your search" 
                      : "No custom segments created yet"}
                  </p>
                  {!searchQuery && (
                    <Button variant="outline">
                      Create a Custom Segment
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filterSegments(customSegments).map(renderSegmentCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="rfm">
              {filterSegments(rfmSegments).length === 0 ? (
                <div className="border border-dashed rounded-md p-8 text-center">
                  <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? "No RFM segments match your search" 
                      : "No RFM segments available"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filterSegments(rfmSegments).map(renderSegmentCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="preference">
              {filterSegments(preferenceSegments).length === 0 ? (
                <div className="border border-dashed rounded-md p-8 text-center">
                  <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? "No preference segments match your search" 
                      : "No preference segments available"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filterSegments(preferenceSegments).map(renderSegmentCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="demographic">
              {filterSegments(demographicSegments).length === 0 ? (
                <div className="border border-dashed rounded-md p-8 text-center">
                  <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? "No demographic segments match your search" 
                      : "No demographic segments available"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filterSegments(demographicSegments).map(renderSegmentCard)}
                </div>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
