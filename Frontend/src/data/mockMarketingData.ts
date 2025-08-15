import { Campaign, CampaignAnalytics } from "@/services/marketingApi";

// Enhanced mock campaigns with realistic data
export const enhancedMockCampaigns: Campaign[] = [
  {
    id: 'campaign-1',
    name: 'April New Collection Promotion',
    description: 'Special offers for our loyal customers on the new collection',
    type: 'email',
    segmentId: 'segment-1',
    segmentName: 'High Value Customers',
    templateId: 'template-1',
    subject: 'Exclusive April Offers Just For You!',
    status: 'active',
    scheduledFor: '2023-04-05T09:00:00Z',
    sentAt: '2023-04-05T09:00:00Z',
    reach: 450,
    response: 112,
    createdAt: '2023-04-01T12:00:00Z',
    updatedAt: '2023-04-01T12:00:00Z',
    integrationId: 'integration-1',
    settings: {
      sender: 'Eegent Fashion <marketing@custopro.com>',
      replyTo: 'support@custopro.com',
      trackOpens: true,
      trackClicks: true,
      personalizeContent: true
    }
  },
  {
    id: 'campaign-2',
    name: 'Customer Reactivation Campaign',
    description: 'Win back inactive customers with special offers',
    type: 'sms',
    segmentId: 'segment-2',
    segmentName: 'At Risk Customers',
    templateId: 'template-2',
    content: 'Hi {{firstName}}! We miss you at Eegent Fashion. Come back and enjoy 15% off your next purchase with code WELCOME15. Valid until April 30.',
    status: 'active',
    scheduledFor: '2023-04-08T10:00:00Z',
    sentAt: '2023-04-08T10:00:00Z',
    reach: 180,
    response: 42,
    createdAt: '2023-04-02T14:30:00Z',
    updatedAt: '2023-04-08T10:00:00Z',
    integrationId: 'integration-2',
    settings: {
      sender: 'EegentFash',
      personalizeContent: true
    }
  },
  {
    id: 'campaign-3',
    name: 'Summer Collection Preview',
    description: 'Preview of our upcoming summer collection',
    type: 'email',
    segmentId: 'segment-1',
    segmentName: 'High Value Customers',
    templateId: 'template-3',
    subject: 'Exclusive Preview: Summer Collection 2023',
    status: 'scheduled',
    scheduledFor: '2023-05-15T09:00:00Z',
    reach: 0,
    response: 0,
    createdAt: '2023-04-20T15:45:00Z',
    updatedAt: '2023-04-20T15:45:00Z',
    integrationId: 'integration-1',
    settings: {
      sender: 'Eegent Fashion <marketing@custopro.com>',
      replyTo: 'support@custopro.com',
      trackOpens: true,
      trackClicks: true,
      personalizeContent: true
    }
  },
  {
    id: 'campaign-4',
    name: 'April Newsletter',
    description: 'Monthly newsletter with updates and offers',
    type: 'email',
    segmentId: 'segment-3',
    segmentName: 'All Customers',
    templateId: 'template-4',
    subject: 'April Newsletter - Latest Trends & Exclusive Offers',
    status: 'completed',
    scheduledFor: '2023-04-05T08:00:00Z',
    sentAt: '2023-04-05T08:00:00Z',
    reach: 1750,
    response: 432,
    createdAt: '2023-04-01T11:20:00Z',
    updatedAt: '2023-04-05T08:00:00Z',
    integrationId: 'integration-1',
    settings: {
      sender: 'Eegent Fashion <newsletter@custopro.com>',
      replyTo: 'support@custopro.com',
      trackOpens: true,
      trackClicks: true,
      personalizeContent: true
    }
  },
  {
    id: 'campaign-5',
    name: 'Eid Special Promotion',
    description: 'Special offers for Eid celebration',
    type: 'email',
    segmentId: 'segment-3',
    segmentName: 'All Customers',
    templateId: 'template-5',
    subject: 'Celebrate Eid with Special Offers from Eegent Fashion',
    status: 'completed',
    scheduledFor: '2023-04-15T09:00:00Z',
    sentAt: '2023-04-15T09:00:00Z',
    reach: 1850,
    response: 523,
    createdAt: '2023-04-10T10:15:00Z',
    updatedAt: '2023-04-15T09:00:00Z',
    integrationId: 'integration-1',
    settings: {
      sender: 'Eegent Fashion <marketing@custopro.com>',
      replyTo: 'support@custopro.com',
      trackOpens: true,
      trackClicks: true,
      personalizeContent: true
    }
  },
  {
    id: 'campaign-6',
    name: 'Weekend Flash Sale',
    description: 'Limited time offers for the weekend',
    type: 'sms',
    segmentId: 'segment-3',
    segmentName: 'All Customers',
    templateId: 'template-6',
    content: 'FLASH SALE at Eegent Fashion! This weekend only, enjoy 20% off all items. Use code FLASH20 in-store or online. Shop now!',
    status: 'completed',
    scheduledFor: '2023-04-21T08:00:00Z',
    sentAt: '2023-04-21T08:00:00Z',
    reach: 1920,
    response: 387,
    createdAt: '2023-04-19T16:30:00Z',
    updatedAt: '2023-04-21T08:00:00Z',
    integrationId: 'integration-2',
    settings: {
      sender: 'EegentFash',
      personalizeContent: false
    }
  }
];

// Enhanced mock analytics with realistic data
export const enhancedMockAnalytics: Record<string, CampaignAnalytics> = {
  'campaign-1': {
    campaignId: 'campaign-1',
    sent: 450,
    delivered: 438,
    opened: 315,
    clicked: 172,
    responded: 112,
    failed: 12,
    bounced: 8,
    unsubscribed: 3,
    details: {
      openRate: 71.9,
      clickRate: 39.3,
      deliveryRate: 97.3,
      responseRate: 25.6,
      bounceRate: 1.8,
      unsubscribeRate: 0.7
    },
    timeline: [
      { date: '2023-04-05', opens: 280, clicks: 155, responses: 95 },
      { date: '2023-04-06', opens: 25, clicks: 12, responses: 10 },
      { date: '2023-04-07', opens: 10, clicks: 5, responses: 7 }
    ]
  },
  'campaign-2': {
    campaignId: 'campaign-2',
    sent: 180,
    delivered: 175,
    responded: 42,
    failed: 5,
    details: {
      deliveryRate: 97.2,
      responseRate: 24.0
    },
    timeline: [
      { date: '2023-04-08', responses: 35 },
      { date: '2023-04-09', responses: 5 },
      { date: '2023-04-10', responses: 2 }
    ]
  },
  'campaign-3': {
    campaignId: 'campaign-3',
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    responded: 0,
    failed: 0,
    bounced: 0,
    unsubscribed: 0,
    details: {
      openRate: 0,
      clickRate: 0,
      deliveryRate: 0,
      responseRate: 0,
      bounceRate: 0,
      unsubscribeRate: 0
    },
    timeline: []
  },
  'campaign-4': {
    campaignId: 'campaign-4',
    sent: 1750,
    delivered: 1720,
    opened: 1150,
    clicked: 632,
    responded: 432,
    failed: 30,
    bounced: 22,
    unsubscribed: 15,
    details: {
      openRate: 66.9,
      clickRate: 36.7,
      deliveryRate: 98.3,
      responseRate: 25.1,
      bounceRate: 1.3,
      unsubscribeRate: 0.9
    },
    timeline: [
      { date: '2023-04-05', opens: 920, clicks: 520, responses: 375 },
      { date: '2023-04-06', opens: 195, clicks: 92, responses: 47 },
      { date: '2023-04-07', opens: 35, clicks: 20, responses: 10 }
    ]
  },
  'campaign-5': {
    campaignId: 'campaign-5',
    sent: 1850,
    delivered: 1830,
    opened: 1320,
    clicked: 745,
    responded: 523,
    failed: 20,
    bounced: 15,
    unsubscribed: 8,
    details: {
      openRate: 72.1,
      clickRate: 40.7,
      deliveryRate: 98.9,
      responseRate: 28.6,
      bounceRate: 0.8,
      unsubscribeRate: 0.4
    },
    timeline: [
      { date: '2023-04-15', opens: 1050, clicks: 620, responses: 435 },
      { date: '2023-04-16', opens: 210, clicks: 105, responses: 72 },
      { date: '2023-04-17', opens: 60, clicks: 20, responses: 16 }
    ]
  },
  'campaign-6': {
    campaignId: 'campaign-6',
    sent: 1920,
    delivered: 1890,
    responded: 387,
    failed: 30,
    details: {
      deliveryRate: 98.4,
      responseRate: 20.5
    },
    timeline: [
      { date: '2023-04-21', responses: 325 },
      { date: '2023-04-22', responses: 52 },
      { date: '2023-04-23', responses: 10 }
    ]
  }
};
