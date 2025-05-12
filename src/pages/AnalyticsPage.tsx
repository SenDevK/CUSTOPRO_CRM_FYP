import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BarChart3, PieChart, LineChart, Calendar, Download, Filter, LayoutDashboard } from 'lucide-react';
import {
  LineChart as ReLineChart,
  Line,
  BarChart as ReBarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { segmentData, revenueData, customerGrowthData, segmentTrendData, monthLabels } from '@/data/mockData';
import SegmentationVisualizer from '@/components/segmentation/SegmentationVisualizer';
import { SegmentBuilder } from '@/components/segmentation/SegmentBuilder';
import RevenueAnalytics from '@/components/revenue/RevenueAnalytics';

const AnalyticsPage = () => {
  const [activeTab, setActiveTab] = useState('segmentation');

  return (
    <div className='page-container'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold'>Analytics</h1>
        <p className='text-muted-foreground'>Comprehensive data analysis and reporting.</p>
      </div>

      <div className='flex items-center justify-between mb-6'>
        <Tabs defaultValue='segmentation' value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value='segmentation'>Segmentation</TabsTrigger>
            <TabsTrigger value='segment-customization'>Segment Builder</TabsTrigger>
            <TabsTrigger value='revenue'>Revenue</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' className='flex items-center gap-2'>
            <Calendar className='h-4 w-4' />
            <span>Last 30 Days</span>
          </Button>
          <Button variant='outline' size='sm' className='flex items-center gap-2'>
            <Filter className='h-4 w-4' />
            <span>Filters</span>
          </Button>
          <Button variant='outline' size='sm' className='flex items-center gap-2'>
            <Download className='h-4 w-4' />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {activeTab === 'segmentation' && (
        <SegmentationVisualizer />
      )}

      {activeTab === 'segment-customization' && (
        <SegmentBuilder />
      )}



      {activeTab === 'revenue' && (
        <RevenueAnalytics />
      )}
    </div>
  );
};

export default AnalyticsPage;
