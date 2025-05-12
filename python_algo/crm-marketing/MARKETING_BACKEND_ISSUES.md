# Marketing Backend Issues

## Purpose of the Marketing Backend Server

The marketing backend server serves as a critical bridge between the CRM's customer segmentation capabilities and third-party marketing tools. Its primary purposes are:

1. **Customer Segment Access**: Connect to the segment-storing backend to retrieve customer segments created in the CRM
2. **Third-Party Integration**: Provide a unified interface to connect with external marketing services (SendGrid for email, Twilio for SMS)
3. **Campaign Management**: Create, schedule, and execute marketing campaigns targeting specific customer segments
4. **Template Management**: Store and manage reusable email and SMS templates
5. **Performance Tracking**: Monitor campaign delivery and engagement metrics

In essence, this server enables targeted marketing by:
- Taking customer segments from the CRM
- Applying marketing templates and scheduling
- Sending the marketing messages through third-party services
- Tracking the results of these campaigns

Without this server, there would be no way to utilize the customer segmentation data for actual marketing purposes, which is a core feature of the CRM system.

## Frontend Duplication Issue: Campaigns vs. Marketing Tabs

There is currently a duplication in the frontend with both a "Campaigns" page and a "Marketing" page that serve similar purposes. This needs to be addressed:

### Current State:

1. **Campaigns Page (`CampaignsPage.tsx`)**:
   - Appears to be an older implementation
   - Uses mock data from `mockData.ts`
   - Has tabs for "All Campaigns", "Active", "Scheduled", "Drafts", and "Completed"
   - Displays metrics like "Open Rate"
   - Does not appear to be connected to the marketing backend

2. **Marketing Page (`MarketingPage.tsx`)**:
   - More comprehensive implementation
   - Connects to the marketing backend via `marketingApi.ts`
   - Has tabs for "Campaigns", "Templates", and "Integrations"
   - Includes components for campaign creation, template management, and integration settings
   - Displays metrics like "Response Rate" and "Active Campaigns"

### Recommendation:

**Keep the Marketing Page and remove the Campaigns Page** for the following reasons:
- The Marketing page is more comprehensive and includes all necessary functionality
- The Marketing page is already connected to the marketing backend
- The Marketing page includes template management and integration settings
- Having two separate pages with similar functionality creates confusion for users

## Issues Overview

This document outlines issues found with the marketing backend setup that need to be addressed before it can be used effectively as a bridge between customer segments and third-party marketing tools.

## Recent Improvements

The following improvements have been made to the Marketing system:

> **IMPORTANT NOTE**: The marketing backend service is already running on port 5000. The frontend configuration has been updated to connect to this port instead of port 5002 as originally planned.

### Frontend Improvements

1. **Content Creation Tab**:
   - Added a visual email builder with pre-designed components (headers, content blocks, footers)
   - Enhanced the SMS template editor with quick templates and better character counting
   - Improved the preview functionality for both email and SMS content
   - Fixed missing icon imports in EmailTemplateEditor and SMSTemplateEditor

2. **Template Selection**:
   - Enhanced the template selection dropdown with better UI
   - Added template management buttons (edit, duplicate, clear)
   - Implemented functional "New Template" buttons that create sample templates

3. **API Configuration**:
   - Added missing proxy configuration for the marketing backend at `/api/marketing`
   - Set the target to `http://localhost:5000` for marketing backend requests (updated from 5002)
   - Fixed API_BASE_URL in marketingApi.ts to use the proxy configuration instead of hardcoded URL

4. **CORS Issues**:
   - Resolved CORS issues by using the Vite proxy configuration
   - Removed direct references to localhost URLs in API service files

### Backend Improvements

1. **Port Configuration**:
   - The backend is running on port 5000
   - Frontend configuration updated to match this port
   - No changes needed to the backend port configuration

2. **CORS Configuration**:
   - Added explicit CORS configuration for http://localhost:8083
   - Added CORS_ORIGINS environment variable to .env file
   - Updated Flask app to use the CORS_ORIGINS variable

3. **Server Startup**:
   - Enhanced start_server.bat with better information messages
   - Added clear instructions about server URL and CORS configuration
   - Note: The server is running on port 5000, not port 5002 as originally planned

These improvements make the Marketing system more functional and user-friendly, allowing users to create and manage marketing campaigns more effectively.

## Critical Issues

### 1. Port Configuration Mismatch

The marketing backend service is running on port 5000, but the frontend was configured to connect to port 5002. This mismatch was causing CORS errors.

**Error Message:**
```
Access to fetch at 'http://localhost:5000/api/marketing/campaigns' from origin 'http://localhost:8083' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Solution:**
1. The frontend configuration has been updated to use port 5000 for the marketing backend
2. The Vite proxy configuration now correctly points to `http://localhost:5000` for `/api/marketing` routes
3. No changes are needed to the backend as it's already running on port 5000

### 2. Icon Import Issues in Template Editors

The EmailTemplateEditor and SMSTemplateEditor components were missing icon imports, causing errors when trying to render the content tab.

**Error Message:**
```
Uncaught ReferenceError: Plus is not defined
```

**Solution:**
1. Added missing icon imports to EmailTemplateEditor.tsx and SMSTemplateEditor.tsx
2. Created a test component (IconTest.tsx) to verify that icons are working properly
3. Updated the CampaignCreator component to include the test component

### 3. Missing Package Structure

The Python package structure is incomplete, which can cause import errors when running the application:

- **Missing `__init__.py` Files**:
  - `python_algo/crm-marketing/routes/__init__.py` is missing
  - `python_algo/crm-marketing/services/__init__.py` is missing
  - `python_algo/crm-marketing/utils/__init__.py` is missing

These files are necessary for Python to recognize these directories as packages, which is required for the import statements in `app.py` to work correctly:

```python
from routes.campaign_routes import campaign_bp
from routes.template_routes import template_bp
from routes.integration_routes import integration_bp
```

### 2. Frontend Integration

The Vite proxy configuration is missing an entry for the marketing backend:

- **Missing Proxy Configuration**:
  - The `vite.config.ts` file needs a proxy configuration for `/api/marketing` to route requests to the marketing backend

Current configuration in `vite.config.ts`:
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
  '/api': {
    target: 'http://localhost:5000', // data ingesting
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

Needed addition:
```javascript
'/api/marketing': {
  target: 'http://localhost:5001', // marketing backend
  changeOrigin: true,
  secure: false,
},
```

### 3. Dependencies

I've checked the `requirements.txt` file and it already includes SendGrid and Twilio, which is good:

Current `requirements.txt`:
```
flask==2.0.1
flask-cors==3.0.10
pymongo==4.0.1
python-dotenv==0.19.1
requests==2.26.0
sendgrid==6.9.0
twilio==7.0.0
```

This means the dependencies are correctly specified, but we should ensure they're actually installed in the virtual environment.

### 4. Testing Capability

There's no way to easily test if the backend is working correctly:

- **Missing Test Scripts**:
  - No test script to verify the backend functionality
  - No easy way to check if the API endpoints are working

## Recommended Fixes

### 1. Add Missing Package Files

Create the following empty files with a simple comment:

```python
# Routes package initialization
```

- `python_algo/crm-marketing/routes/__init__.py`
- `python_algo/crm-marketing/services/__init__.py`
- `python_algo/crm-marketing/utils/__init__.py`

### 2. Update Vite Configuration

Add the following proxy configuration to `vite.config.ts`:

```javascript
'/api/marketing': {
  target: 'http://localhost:5001', // marketing backend
  changeOrigin: true,
  secure: false,
},
```

### 3. Update Dependencies

Update `requirements.txt` to include:

```
sendgrid==6.9.0
twilio==7.0.0
```

### 4. Create Test Scripts

Create a test script to verify the backend functionality:

- `test_server.py` - Python script to test API endpoints
- `test_server.bat` - Batch file to run the test script

## Additional Recommendations

1. **Error Handling**: Improve error handling in the services to provide more detailed error messages
2. **Logging**: Add logging to help with debugging
3. **Documentation**: Add more detailed documentation on how to use the API endpoints
4. **Environment Variables**: Add more environment variables for configuration (e.g., SendGrid and Twilio credentials)

## Detailed Guide to Third-Party Tool Integration

### Setting Up SendGrid for Email Marketing

1. **Create a SendGrid Account**:
   - Go to [SendGrid's website](https://sendgrid.com/)
   - Sign up for a free account (allows 100 emails/day)
   - Verify your email address

2. **Create an API Key**:
   - Log in to your SendGrid dashboard
   - Navigate to Settings → API Keys
   - Click "Create API Key"
   - Name it (e.g., "Lanka Smart CRM")
   - Select "Full Access" or "Restricted Access" with at least "Mail Send" permissions
   - Copy the generated API key (you won't be able to see it again)

3. **Verify a Sender Identity**:
   - Go to Settings → Sender Authentication
   - Choose either "Single Sender Verification" (easiest) or "Domain Authentication" (more professional)
   - For Single Sender: Enter your name, email, and company details
   - Verify the email address by clicking the link in the verification email

4. **Add SendGrid Integration to CRM**:
   - Once the marketing backend is fixed, go to the Marketing page in the CRM
   - Navigate to the Integrations tab
   - Click "Add Integration"
   - Select "Email" and then "SendGrid"
   - Enter a name for the integration (e.g., "My SendGrid Account")
   - Enter your API key
   - Enter the verified sender email
   - Save the integration

### Setting Up Twilio for SMS Marketing

1. **Create a Twilio Account**:
   - Go to [Twilio's website](https://www.twilio.com/)
   - Sign up for a free trial account
   - Verify your email address and phone number

2. **Get Your Account Credentials**:
   - Log in to your Twilio dashboard
   - Your Account SID and Auth Token are displayed on the dashboard home page
   - Copy both of these values

3. **Get a Twilio Phone Number**:
   - Go to Phone Numbers → Manage → Buy a Number
   - Search for a number with SMS capabilities
   - Purchase the number (free during trial)

4. **Add Twilio Integration to CRM**:
   - Once the marketing backend is fixed, go to the Marketing page in the CRM
   - Navigate to the Integrations tab
   - Click "Add Integration"
   - Select "SMS" and then "Twilio"
   - Enter a name for the integration (e.g., "My Twilio Account")
   - Enter your Account SID and Auth Token
   - Enter your Twilio phone number (in E.164 format, e.g., +15551234567)
   - Save the integration

### Testing the Integration

1. **Test Email Integration**:
   - In the Integrations tab, find your SendGrid integration
   - Enter a test email address in the "Test" field
   - Click "Test" to send a test email
   - Check the recipient inbox to verify delivery

2. **Test SMS Integration**:
   - In the Integrations tab, find your Twilio integration
   - Enter a test phone number in the "Test" field (in E.164 format)
   - Click "Test" to send a test SMS
   - Check the recipient phone to verify delivery

### Creating and Sending Marketing Campaigns

1. **Create Email/SMS Templates**:
   - Go to the Templates tab in the Marketing page
   - Click "Create Template"
   - Select the type (Email or SMS)
   - Design your template with a subject and content
   - Use placeholders like {{customer.firstName}} for personalization
   - Save the template

2. **Create a Campaign**:
   - Go to the Campaigns tab
   - Click "Create Campaign"
   - Select the type (Email or SMS)
   - Enter a name and description
   - Select a target segment from your customer segments
   - Select a template
   - Select the integration to use
   - Schedule the campaign or save as draft

3. **Monitor Campaign Performance**:
   - After sending a campaign, monitor its performance in the Campaigns tab
   - View metrics like delivery rate, open rate, click rate, etc.

### Important Notes

1. **Free Tier Limitations**:
   - SendGrid: 100 emails/day on the free plan
   - Twilio: Trial accounts require verified phone numbers for recipients

2. **Testing Best Practices**:
   - Always test with your own email/phone before sending to customers
   - Start with small segments before sending to larger groups

3. **Compliance Requirements**:
   - Include an unsubscribe link in all marketing emails
   - Comply with SMS regulations (include company name, opt-out instructions)
   - Only send to customers who have opted in to marketing communications

## Reference: Twilio Sample Application

A Twilio sample application is available at `C:\IIT\4th year\FYP\3PTool\airtng-flask-master` that can be used as a reference for implementing Twilio integration. Here's what to look for in this sample:

### Key Components to Examine

1. **Twilio Client Initialization**:
   - Look for how the Twilio client is initialized with account credentials
   - Typically in a file like `__init__.py` or a configuration file

   ```python
   from twilio.rest import Client

   account_sid = 'your_account_sid'  # Usually from environment variables
   auth_token = 'your_auth_token'    # Usually from environment variables
   client = Client(account_sid, auth_token)
   ```

2. **SMS Sending Functions**:
   - Look for functions that create and send SMS messages
   - Usually in `views.py` or similar controller files

   ```python
   def send_sms(to_number, message_body):
       message = client.messages.create(
           body=message_body,
           from_='+15551234567',  # Your Twilio phone number
           to=to_number
       )
       return message.sid  # Return the message SID for tracking
   ```

3. **Error Handling**:
   - Look for how errors are caught and handled when sending messages
   - Important for providing meaningful feedback to users

   ```python
   try:
       message = client.messages.create(...)
       return {"success": True, "message_sid": message.sid}
   except Exception as e:
       return {"success": False, "error": str(e)}
   ```

4. **Environment Configuration**:
   - Look for how environment variables are loaded and used
   - Usually in a `config.py` file or similar

   ```python
   import os

   TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID')
   TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN')
   TWILIO_PHONE_NUMBER = os.environ.get('TWILIO_PHONE_NUMBER')
   ```

### Adapting for Our Marketing Backend

When implementing Twilio in our marketing backend:

1. **Use the Existing Structure**:
   - Our `sms_service.py` already has the structure for sending SMS
   - Update the `_send_with_twilio` method using patterns from the sample

2. **Keep It Simple**:
   - We only need the SMS sending functionality, not the entire application
   - Focus on the core Twilio client operations

3. **Maintain Our Error Handling**:
   - Ensure errors are properly caught and logged
   - Return meaningful error messages to the frontend

4. **Testing**:
   - Use the Twilio test credentials in development
   - Test with verified phone numbers during development

The sample application provides a good reference, but our implementation should be tailored to our specific marketing needs and existing backend structure.
