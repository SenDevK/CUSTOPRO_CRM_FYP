# Frontend Integration Guide for Marketing Backend

## Overview

This document provides guidance on integrating the frontend with the marketing backend. It addresses common issues and provides solutions to ensure smooth integration.

## Configuration

### Vite Proxy Configuration

The frontend needs to be configured to communicate with the marketing backend. Add the following to your `vite.config.ts` file:

```javascript
'/api/marketing': {
  target: 'http://localhost:5001', // marketing backend
  changeOrigin: true,
  secure: false,
},
```

**Important**: Make sure this configuration is added before the catch-all `/api` configuration to ensure proper routing.

### Complete Proxy Configuration

Your complete proxy configuration should look like this:

```javascript
proxy: {
  '/api/segments': {
    target: 'http://localhost:5000',   // segment customization
    changeOrigin: true,
  },
  '/api/segment': {
    target: 'http://localhost:8000', // segmentation
    changeOrigin: true,
  },
  '/api/revenue': {
    target: 'http://localhost:5001', // revenue model
    changeOrigin: true,
    secure: false,
    rewrite: (path) => path,
  },
  '/api/marketing': {
    target: 'http://localhost:5001', // marketing backend
    changeOrigin: true,
    secure: false,
  },
  '/api': {
    target: 'http://localhost:5000', // data ingesting
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

## Common Issues

### 1. Icon Import Issues in Template Editors

If you encounter errors like `Uncaught ReferenceError: Plus is not defined` in the EmailTemplateEditor or SMSTemplateEditor components, ensure you have the proper icon imports:

```typescript
// For EmailTemplateEditor.tsx
import { FileText, Eye, Code, Plus, Edit, Copy } from "lucide-react";

// For SMSTemplateEditor.tsx
import { MessageSquare, AlertCircle, Plus, Edit, Copy } from "lucide-react";
```

### 2. CORS Errors

If you see CORS errors in the console:

```
Access to fetch at 'http://localhost:5001/api/marketing/campaigns' from origin 'http://localhost:8083' has been blocked by CORS policy
```

Ensure:
1. The marketing backend is running on port 5001
2. The Vite proxy configuration is correct
3. The backend has CORS enabled (it should by default)

### 3. API Connection Issues

If the frontend can't connect to the backend:

1. Verify the marketing backend is running (`http://localhost:5001/health`)
2. Check the browser console for network errors
3. Ensure the proxy configuration is correct
4. Restart both the frontend and backend servers

## Implementation Guide

### 1. Campaign Creation Flow

Implement a campaign creation wizard with the following steps:

#### Step 1: Basic Information
- Campaign name input
- Campaign type selection (email or SMS)
- Description (optional)

#### Step 2: Segment Selection
- Dropdown or searchable list of available segments
- Display segment details (customer count, description)

#### Step 3: Content Creation
- Template selection or creation
- Message editor with personalization options
- Preview functionality

#### Step 4: Settings & Scheduling
- Integration selection
- Sender information
- Schedule options (immediate or future date)

#### Step 5: Review & Launch
- Summary of all campaign details
- Confirmation button to launch or schedule the campaign

### 2. Campaign Dashboard

Implement a dashboard to monitor campaign performance:

- List of all campaigns with status indicators
- Campaign details view with performance metrics
- Filtering and sorting options

## API Usage Examples

### Fetching Campaigns

```typescript
const getCampaigns = async () => {
  try {
    const response = await fetch('/api/marketing/campaigns');
    if (!response.ok) {
      throw new Error('Failed to fetch campaigns');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return [];
  }
};
```

### Creating a Campaign

```typescript
const createCampaign = async (campaignData) => {
  try {
    const response = await fetch('/api/marketing/campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(campaignData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create campaign');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
};
```

### Sending a Test Message

```typescript
const sendTestMessage = async (campaignId, testRecipients) => {
  try {
    const response = await fetch('/api/marketing/send-test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ campaignId, testRecipients }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send test message');
    }
    
    return true;
  } catch (error) {
    console.error('Error sending test message:', error);
    return false;
  }
};
```

## Testing

After implementing the integration:

1. **Start the Marketing Backend**:
   ```
   cd C:\IIT\4th year\FYP\python_algo\crm-marketing
   start_server.bat
   ```

2. **Start the Frontend**:
   ```
   npm run dev
   ```

3. **Test the Integration**:
   - Navigate to the Marketing tab
   - Create a new campaign
   - Select a segment
   - Create content
   - Schedule the campaign
   - Monitor the campaign status

## Conclusion

This integration guide provides the requirements for implementing the frontend components that interact with the marketing backend. The goal is to create a seamless experience for business users to create and monitor marketing campaigns without needing to directly interact with third-party tools.

For any questions or clarifications, please refer to the API documentation or contact the backend development team.
