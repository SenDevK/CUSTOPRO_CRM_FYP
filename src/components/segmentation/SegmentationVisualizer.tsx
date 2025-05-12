import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import {
  runComprehensiveSegmentation,
  runSpecificSegmentation,
  transformSegmentationData
} from './segmentationApi';
import { DemographicTab } from './DemographicTab';
import { PreferenceTab } from './PreferenceTab';
import { ValueBasedTab } from './ValueBasedTab';

const SegmentationVisualizer = () => {
  const [activeTab, setActiveTab] = useState('value');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [segmentationData, setSegmentationData] = useState<any>(null);

  // Function to run segmentation
  const runSegmentation = async (type: 'comprehensive' | 'demographic' | 'preference' | 'rfm') => {
    setIsLoading(true);
    setError(null);

    try {
      let result: any;

      if (type === 'comprehensive') {
        result = await runComprehensiveSegmentation();
      } else {
        result = await runSpecificSegmentation(type);
      }

      // Transform the data for visualization
      const transformedData = transformSegmentationData(result);
      setSegmentationData(transformedData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while running segmentation');
    } finally {
      setIsLoading(false);
    }
  };

  // Run comprehensive segmentation on component mount
  useEffect(() => {
    runSegmentation('comprehensive');
  }, []);

  // Render loading state
  if (isLoading && !segmentationData) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-muted-foreground">Running customer segmentation analysis...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Segmentation Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>Please check the following:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Is the segmentation server running? Run <code>start_segmentation_server.bat</code></li>
              <li>Is MongoDB running and accessible?</li>
              <li>Are there customer records in the MongoDB database?</li>
              <li>Check the browser console (F12) for more detailed error messages</li>
            </ol>
            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => runSegmentation('comprehensive')}
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extract data for visualization
  const {
    rawApiData,
    demographicData,
    rfmData,
    preferenceData,
    categoryDistribution,
    materialDistribution
  } = segmentationData || {
    rawApiData: {},
    demographicData: [],
    rfmData: [],
    preferenceData: [],
    categoryDistribution: [],
    materialDistribution: []
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Customer Segmentation</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => runSegmentation('comprehensive')}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Refresh All Segments
          </Button>
        </div>
      </div>

      <Tabs defaultValue="value" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="value" onClick={() => runSegmentation('rfm')}>
            Value-Based (RFM)
          </TabsTrigger>
          <TabsTrigger value="demographic" onClick={() => runSegmentation('demographic')}>
            Demographic
          </TabsTrigger>
          <TabsTrigger value="preference" onClick={() => runSegmentation('preference')}>
            Preference-Based
          </TabsTrigger>
        </TabsList>

        <TabsContent value="value">
          <ValueBasedTab
            rfmData={rfmData}
            avgValues={rawApiData?.details?.value_based_rfm_details?.avg_values}
          />
        </TabsContent>

        <TabsContent value="demographic">
          <DemographicTab demographicData={demographicData} />
        </TabsContent>

        <TabsContent value="preference">
          <PreferenceTab
            preferenceData={preferenceData}
            categoryDistribution={categoryDistribution}
            materialDistribution={materialDistribution}
            preferenceProfiles={rawApiData?.details?.preference_details?.profiles}
            preferenceDistribution={rawApiData?.details?.preference_details?.distribution}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SegmentationVisualizer;
