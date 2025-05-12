/**
 * API service for marketing operations
 */

// Using Vite's proxy feature to avoid CORS issues in development
// For local development with our marketing backend
const API_BASE_URL = '/api';

// Import types
import { Segment } from './segmentationApi';

// Define campaign types
export interface Campaign {
  id: string;
  name: string;
  description?: string;
  type: 'email' | 'sms';
  segmentId: string;
  segmentName: string;
  templateId?: string;
  content?: string;
  subject?: string; // For email campaigns
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'failed';
  scheduledFor?: string;
  sentAt?: string;
  reach: number;
  response: number;
  createdAt: string;
  updatedAt: string;
  integrationId?: string;
  settings?: {
    sender?: string;
    replyTo?: string;
    trackOpens?: boolean;
    trackClicks?: boolean;
    personalizeContent?: boolean;
  };
}

// Define template types
export interface Template {
  id: string;
  name: string;
  type: 'email' | 'sms';
  content: string;
  subject?: string; // For email templates
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// Define integration types
export interface Integration {
  id: string;
  name: string;
  provider: 'sendgrid' | 'mailchimp' | 'twilio' | 'messagebird' | 'dialog' | 'custom';
  type: 'email' | 'sms';
  isActive: boolean;
  credentials: {
    apiKey?: string;
    username?: string;
    password?: string;
    accountSid?: string;
    authToken?: string;
    from?: string;
    region?: string;
    endpoint?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Define analytics types
export interface CampaignAnalytics {
  campaignId: string;
  sent: number;
  delivered: number;
  opened?: number; // For email
  clicked?: number; // For email
  responded: number;
  failed: number;
  bounced?: number; // For email
  unsubscribed?: number;
  details: {
    openRate?: number;
    clickRate?: number;
    deliveryRate: number;
    responseRate: number;
    bounceRate?: number;
    unsubscribeRate?: number;
  };
  timeline: {
    date: string;
    opens?: number;
    clicks?: number;
    responses: number;
  }[];
}

/**
 * Get all campaigns
 */
export const getCampaigns = async (): Promise<Campaign[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/marketing/campaigns`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch campaigns');
    }

    const responseData = await response.json();

    // Check if the response has a data property (new backend format)
    if (responseData && responseData.data && Array.isArray(responseData.data)) {
      // Map the data to match our Campaign interface
      return responseData.data.map((campaign: any) => ({
        ...campaign,
        // Add missing properties required by the frontend
        reach: campaign.reach || 0,
        response: campaign.response || 0,
        segmentId: campaign.segmentId || 'default-segment',
        segmentName: campaign.segmentName || 'Default Segment'
      }));
    }

    // If the response is already an array, return it directly
    if (Array.isArray(responseData)) {
      return responseData;
    }

    // If we can't parse the response, throw an error
    throw new Error('Invalid response format from server');
  } catch (error) {
    console.error('Error fetching campaigns:', error);

    // Return mock data for development
    return getMockCampaigns();
  }
};

/**
 * Get a campaign by ID
 */
export const getCampaignById = async (id: string): Promise<Campaign | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/marketing/campaigns/${id}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to fetch campaign ${id}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching campaign ${id}:`, error);

    // Return mock data for development
    const campaigns = getMockCampaigns();
    return campaigns.find(c => c.id === id) || null;
  }
};

/**
 * Create a new campaign
 */
export const createCampaign = async (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'reach' | 'response'>): Promise<Campaign> => {
  try {
    // Map frontend field names to backend field names
    const backendCampaign = {
      ...campaign,
      // If campaign has scheduledAt, map it to scheduledFor
      scheduledFor: campaign.scheduledAt,
      // If campaign has content, map it to message for backend
      message: campaign.content,
      // Map status to backend status
      status: campaign.status === 'active' ? 'in_progress' : campaign.status === 'draft' ? 'pending' : campaign.status
    };

    // Remove frontend-specific fields
    const { scheduledAt, content, responseRate, ...rest } = backendCampaign as any;

    console.log('Sending campaign to backend:', rest);

    const response = await fetch(`${API_BASE_URL}/marketing/campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rest),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create campaign');
    }

    const createdCampaign = await response.json();
    console.log('Campaign created successfully:', createdCampaign);

    // If the campaign is active, execute it immediately
    if (campaign.status === 'active' && createdCampaign.id) {
      try {
        console.log('Executing campaign immediately:', createdCampaign.id);
        await executeCampaign(createdCampaign.id);
      } catch (execError) {
        console.error('Error executing campaign:', execError);
        // Continue even if execution fails - the campaign is still created
      }
    }

    return createdCampaign;
  } catch (error) {
    console.error('Error creating campaign:', error);

    // Create mock campaign for development
    const now = new Date().toISOString();
    return {
      id: `campaign-${Date.now()}`,
      ...campaign,
      reach: 0,
      response: 0,
      createdAt: now,
      updatedAt: now,
    };
  }
};

/**
 * Update an existing campaign
 */
export const updateCampaign = async (id: string, campaign: Partial<Campaign>): Promise<Campaign> => {
  try {
    const response = await fetch(`${API_BASE_URL}/marketing/campaigns/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(campaign),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to update campaign ${id}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error updating campaign ${id}:`, error);

    // Update mock campaign for development
    const campaigns = getMockCampaigns();
    const index = campaigns.findIndex(c => c.id === id);
    if (index === -1) throw new Error(`Campaign ${id} not found`);

    const updatedCampaign = {
      ...campaigns[index],
      ...campaign,
      updatedAt: new Date().toISOString(),
    };

    return updatedCampaign;
  }
};

/**
 * Delete a campaign
 */
export const deleteCampaign = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/marketing/campaigns/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to delete campaign ${id}`);
    }

    return true;
  } catch (error) {
    console.error(`Error deleting campaign ${id}:`, error);
    return false;
  }
};

/**
 * Execute a campaign immediately
 */
export const executeCampaign = async (id: string): Promise<Campaign> => {
  try {
    const response = await fetch(`${API_BASE_URL}/marketing/campaigns/${id}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to execute campaign ${id}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error executing campaign ${id}:`, error);
    throw error;
  }
};

/**
 * Schedule a campaign
 */
export const scheduleCampaign = async (id: string, scheduledFor: string): Promise<Campaign> => {
  try {
    const response = await fetch(`${API_BASE_URL}/marketing/campaigns/${id}/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ scheduledFor }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to schedule campaign ${id}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error scheduling campaign ${id}:`, error);

    // Update mock campaign for development
    const campaigns = getMockCampaigns();
    const index = campaigns.findIndex(c => c.id === id);
    if (index === -1) throw new Error(`Campaign ${id} not found`);

    const updatedCampaign = {
      ...campaigns[index],
      status: 'scheduled',
      scheduledFor,
      updatedAt: new Date().toISOString(),
    };

    return updatedCampaign;
  }
};

/**
 * Send a test message
 */
export const sendTestMessage = async (campaignId: string, testRecipients: string[]): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/marketing/send-test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ campaignId, testRecipients }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send test message');
    }

    return true;
  } catch (error) {
    console.error('Error sending test message:', error);
    return false;
  }
};

/**
 * Get campaign analytics
 */
export const getCampaignAnalytics = async (campaignId: string): Promise<CampaignAnalytics | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/marketing/analytics/${campaignId}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to fetch analytics for campaign ${campaignId}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching analytics for campaign ${campaignId}:`, error);

    // Return mock analytics for development
    return getMockAnalytics(campaignId);
  }
};

/**
 * Get all templates
 */
export const getTemplates = async (type?: 'email' | 'sms'): Promise<Template[]> => {
  try {
    const url = type
      ? `${API_BASE_URL}/marketing/templates?type=${type}`
      : `${API_BASE_URL}/marketing/templates`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch templates');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching templates:', error);

    // Return mock data for development
    console.log('Using mock templates data');
    return getMockTemplates(type);
  }
};

/**
 * Create a new template
 */
export const createTemplate = async (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<Template> => {
  try {
    const response = await fetch(`${API_BASE_URL}/marketing/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(template),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create template');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating template:', error);

    // Create mock template for development
    const now = new Date().toISOString();
    return {
      id: `template-${Date.now()}`,
      ...template,
      createdAt: now,
      updatedAt: now,
    };
  }
};

/**
 * Get all integrations
 */
export const getIntegrations = async (type?: 'email' | 'sms'): Promise<Integration[]> => {
  try {
    const url = type
      ? `${API_BASE_URL}/marketing/integrations?type=${type}`
      : `${API_BASE_URL}/marketing/integrations`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch integrations');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching integrations:', error);

    // Return mock data for development
    console.log('Using mock integrations data');
    return getMockIntegrations(type);
  }
};

/**
 * Create a new integration
 */
export const createIntegration = async (integration: Omit<Integration, 'id' | 'createdAt' | 'updatedAt'>): Promise<Integration> => {
  try {
    const response = await fetch(`${API_BASE_URL}/marketing/integrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(integration),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create integration');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating integration:', error);

    // Create mock integration for development
    const now = new Date().toISOString();
    return {
      id: `integration-${Date.now()}`,
      ...integration,
      createdAt: now,
      updatedAt: now,
    };
  }
};

/**
 * Test an integration connection
 */
export const testIntegration = async (integration: Partial<Integration>): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/marketing/integrations/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(integration),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to test integration');
    }

    return true;
  } catch (error) {
    console.error('Error testing integration:', error);

    // Mock success for development (randomly succeed or fail)
    return Math.random() > 0.3; // 70% chance of success
  }
};

// Mock data functions
const getMockCampaigns = (): Campaign[] => {
  return [
    {
      id: 'campaign-1',
      name: 'April Promotion',
      description: 'Special offers for our loyal customers',
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
        sender: 'Lanka Smart CRM <marketing@lankasmartcrm.com>',
        replyTo: 'support@lankasmartcrm.com',
        trackOpens: true,
        trackClicks: true,
        personalizeContent: true
      }
    },
    {
      id: 'campaign-2',
      name: 'Reactivation Campaign',
      description: 'Bring back customers who haven\'t purchased in 3 months',
      type: 'sms',
      segmentId: 'segment-2',
      segmentName: 'At Risk Customers',
      content: 'We miss you! Come back and enjoy 15% off your next purchase with code WELCOME15. Valid until {{expiryDate}}.',
      status: 'scheduled',
      scheduledFor: '2023-04-08T10:00:00Z',
      reach: 180,
      response: 0,
      createdAt: '2023-04-02T14:30:00Z',
      updatedAt: '2023-04-02T14:30:00Z',
      integrationId: 'integration-2',
      settings: {
        sender: 'LankaCRM',
        personalizeContent: true
      }
    },
    {
      id: 'campaign-3',
      name: 'New Product Launch',
      description: 'Announcing our new summer collection',
      type: 'email',
      segmentId: 'segment-3',
      segmentName: 'All Customers',
      templateId: 'template-2',
      subject: 'Introducing Our Summer Collection!',
      status: 'draft',
      reach: 0,
      response: 0,
      createdAt: '2023-04-03T09:15:00Z',
      updatedAt: '2023-04-03T09:15:00Z'
    },
    {
      id: 'campaign-4',
      name: 'March Newsletter',
      description: 'Monthly newsletter with updates and offers',
      type: 'email',
      segmentId: 'segment-3',
      segmentName: 'All Customers',
      templateId: 'template-3',
      subject: 'March Newsletter - Latest Updates & Exclusive Offers',
      status: 'completed',
      scheduledFor: '2023-03-05T08:00:00Z',
      sentAt: '2023-03-05T08:00:00Z',
      reach: 1750,
      response: 432,
      createdAt: '2023-03-01T11:20:00Z',
      updatedAt: '2023-03-05T08:00:00Z',
      integrationId: 'integration-1',
      settings: {
        sender: 'Lanka Smart CRM <newsletter@lankasmartcrm.com>',
        replyTo: 'support@lankasmartcrm.com',
        trackOpens: true,
        trackClicks: true,
        personalizeContent: true
      }
    }
  ];
};

const getMockTemplates = (type?: 'email' | 'sms'): Template[] => {
  const templates: Template[] = [
    {
      id: 'template-1',
      name: 'Promotional Email',
      type: 'email',
      subject: 'Special Offer Just For You!',
      content: `
        <html>
          <body>
            <h1>Hello {{firstName}},</h1>
            <p>We have a special offer just for you!</p>
            <p>Use code <strong>{{promoCode}}</strong> to get {{discountPercent}}% off your next purchase.</p>
            <p>Offer valid until {{expiryDate}}.</p>
            <a href="{{shopUrl}}">Shop Now</a>
          </body>
        </html>
      `,
      tags: ['promotion', 'discount'],
      createdAt: '2023-03-15T10:00:00Z',
      updatedAt: '2023-03-15T10:00:00Z'
    },
    {
      id: 'template-2',
      name: 'Product Launch',
      type: 'email',
      subject: 'Introducing Our New Collection!',
      content: `
        <html>
          <body>
            <h1>Hello {{firstName}},</h1>
            <p>We're excited to introduce our new collection!</p>
            <p>Check out the latest products now.</p>
            <a href="{{shopUrl}}">View Collection</a>
          </body>
        </html>
      `,
      tags: ['product', 'launch', 'new'],
      createdAt: '2023-03-20T11:30:00Z',
      updatedAt: '2023-03-20T11:30:00Z'
    },
    {
      id: 'template-3',
      name: 'Monthly Newsletter',
      type: 'email',
      subject: 'Monthly Newsletter - Latest Updates & Offers',
      content: `
        <html>
          <body>
            <h1>Hello {{firstName}},</h1>
            <p>Here's what's new this month:</p>
            <ul>
              <li>New products</li>
              <li>Special offers</li>
              <li>Upcoming events</li>
            </ul>
            <a href="{{shopUrl}}">Visit Our Store</a>
          </body>
        </html>
      `,
      tags: ['newsletter', 'monthly'],
      createdAt: '2023-03-25T09:45:00Z',
      updatedAt: '2023-03-25T09:45:00Z'
    },
    {
      id: 'template-4',
      name: 'Promotional SMS',
      type: 'sms',
      content: 'Hi {{firstName}}! Enjoy {{discountPercent}}% off your next purchase with code {{promoCode}}. Valid until {{expiryDate}}. {{shopUrl}}',
      tags: ['promotion', 'sms'],
      createdAt: '2023-03-18T14:20:00Z',
      updatedAt: '2023-03-18T14:20:00Z'
    },
    {
      id: 'template-5',
      name: 'Reminder SMS',
      type: 'sms',
      content: 'Hi {{firstName}}! Just a reminder that your appointment is scheduled for {{appointmentDate}}. Reply YES to confirm or call us at {{phoneNumber}} to reschedule.',
      tags: ['reminder', 'sms'],
      createdAt: '2023-03-22T16:10:00Z',
      updatedAt: '2023-03-22T16:10:00Z'
    }
  ];

  if (type) {
    return templates.filter(t => t.type === type);
  }

  return templates;
};

const getMockIntegrations = (type?: 'email' | 'sms'): Integration[] => {
  const integrations: Integration[] = [
    {
      id: 'integration-1',
      name: 'SendGrid Email',
      provider: 'sendgrid',
      type: 'email',
      isActive: true,
      credentials: {
        apiKey: 'SG.XXXXXXXXXXXXXXXXXXXX',
        from: 'marketing@lankasmartcrm.com'
      },
      createdAt: '2023-03-10T08:30:00Z',
      updatedAt: '2023-03-10T08:30:00Z'
    },
    {
      id: 'integration-2',
      name: 'Twilio SMS',
      provider: 'twilio',
      type: 'sms',
      isActive: true,
      credentials: {
        accountSid: 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        authToken: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        from: '+15551234567'
      },
      createdAt: '2023-03-12T10:15:00Z',
      updatedAt: '2023-03-12T10:15:00Z'
    },
    {
      id: 'integration-3',
      name: 'Dialog SMS',
      provider: 'dialog',
      type: 'sms',
      isActive: false,
      credentials: {
        apiKey: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        from: 'LankaCRM'
      },
      createdAt: '2023-03-14T11:45:00Z',
      updatedAt: '2023-03-14T11:45:00Z'
    },
    {
      id: 'integration-4',
      name: 'Mailchimp',
      provider: 'mailchimp',
      type: 'email',
      isActive: false,
      credentials: {
        apiKey: 'XXXXXXXXXXXXXXXXXXXX-us6',
        region: 'us6'
      },
      createdAt: '2023-03-16T09:20:00Z',
      updatedAt: '2023-03-16T09:20:00Z'
    }
  ];

  if (type) {
    return integrations.filter(i => i.type === type);
  }

  return integrations;
};

const getMockAnalytics = (campaignId: string): CampaignAnalytics => {
  // Different analytics based on campaign ID
  switch (campaignId) {
    case 'campaign-1':
      return {
        campaignId: 'campaign-1',
        sent: 450,
        delivered: 438,
        opened: 215,
        clicked: 112,
        responded: 78,
        failed: 12,
        bounced: 8,
        unsubscribed: 3,
        details: {
          openRate: 49.1,
          clickRate: 25.6,
          deliveryRate: 97.3,
          responseRate: 17.8,
          bounceRate: 1.8,
          unsubscribeRate: 0.7
        },
        timeline: [
          { date: '2023-04-05', opens: 180, clicks: 95, responses: 65 },
          { date: '2023-04-06', opens: 25, clicks: 12, responses: 10 },
          { date: '2023-04-07', opens: 10, clicks: 5, responses: 3 }
        ]
      };
    case 'campaign-2':
      return {
        campaignId: 'campaign-2',
        sent: 0,
        delivered: 0,
        responded: 0,
        failed: 0,
        details: {
          deliveryRate: 0,
          responseRate: 0
        },
        timeline: []
      };
    case 'campaign-4':
      return {
        campaignId: 'campaign-4',
        sent: 1750,
        delivered: 1720,
        opened: 950,
        clicked: 432,
        responded: 310,
        failed: 30,
        bounced: 22,
        unsubscribed: 15,
        details: {
          openRate: 55.2,
          clickRate: 24.7,
          deliveryRate: 98.3,
          responseRate: 17.7,
          bounceRate: 1.3,
          unsubscribeRate: 0.9
        },
        timeline: [
          { date: '2023-03-05', opens: 820, clicks: 380, responses: 275 },
          { date: '2023-03-06', opens: 95, clicks: 42, responses: 30 },
          { date: '2023-03-07', opens: 35, clicks: 10, responses: 5 }
        ]
      };
    default:
      return {
        campaignId,
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
      };
  }
};
