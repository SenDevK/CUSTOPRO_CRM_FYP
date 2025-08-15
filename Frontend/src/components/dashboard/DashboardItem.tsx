import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SegmentFilter } from './SegmentFilter'
import { SegmentCombiner } from './SegmentCombiner'
import { VisualizationPicker } from './VisualizationPicker'

interface DashboardItemProps {
  item: any;
  setDashboardItems: (items: any[]) => void;
  index: number;
}

export function DashboardItem({ item, setDashboardItems, index }: DashboardItemProps) {
  // Update a specific item in the dashboard items array
  const updateItem = (updatedItem: any) => {
    setDashboardItems((prevItems: any[]) => {
      const newItems = [...prevItems];
      newItems[index] = updatedItem;
      return newItems;
    });
  };

  return (
    <Tabs defaultValue="config">
      <TabsList className="mb-4">
        <TabsTrigger value="config">Configuration</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>

      <TabsContent value="config">
        <div className="space-y-4">
          {item.type === 'segment' && (
            <SegmentFilter
              item={item}
              setDashboardItems={setDashboardItems}
              index={index}
            />
          )}

          {item.type === 'combined' && (
            <SegmentCombiner
              item={item}
              setDashboardItems={setDashboardItems}
              index={index}
            />
          )}

          <VisualizationPicker
            item={item}
            setDashboardItems={setDashboardItems}
            index={index}
          />
        </div>
      </TabsContent>

      <TabsContent value="preview">
        <div className="h-[200px] border rounded-md flex items-center justify-center">
          <p className="text-muted-foreground">Visualization preview</p>
        </div>
      </TabsContent>
    </Tabs>
  )
}
