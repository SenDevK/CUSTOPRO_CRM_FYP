# Marketing Backend Setup Guide

## Overview

The marketing backend serves as a bridge between the CRM's customer segmentation capabilities and third-party marketing tools. It enables targeted marketing campaigns by:

1. Retrieving customer segments from the CRM
2. Managing marketing templates and campaigns
3. Sending messages through third-party services (Twilio for SMS, SendGrid for email)
4. Tracking campaign performance

## System Requirements

- Python 3.8 or higher
- MongoDB (running on localhost:27017)
- Twilio account (for SMS functionality)
- SendGrid account (for email functionality)

## Installation

1. **Clone the Repository**:
   ```
   git clone <repository-url>
   cd python_algo/crm-marketing
   ```

2. **Create a Virtual Environment**:
   ```
   python -m venv venv
   ```

3. **Activate the Virtual Environment**:
   - Windows:
     ```
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```
     source venv/bin/activate
     ```

4. **Install Dependencies**:
   ```
   pip install -r requirements.txt
   ```

5. **Configure Environment Variables**:
   - Copy the `.env.example` file to `.env`
   - Update the values with your configuration:
     ```
     MONGODB_URI=mongodb://localhost:27017/
     SEGMENT_API_URL=http://localhost:5000/api/segments
     PORT=5001
     FLASK_ENV=development
     
     # Twilio credentials
     TWILIO_ACCOUNT_SID=your_twilio_account_sid
     TWILIO_AUTH_TOKEN=your_twilio_auth_token
     TWILIO_PHONE_NUMBER=your_twilio_phone_number
     
     # SendGrid credentials
     SENDGRID_API_KEY=your_sendgrid_api_key
     SENDGRID_FROM_EMAIL=your_verified_sender_email
     ```

6. **Create Missing Package Files**:
   - Create the following empty files if they don't exist:
     ```
     touch routes/__init__.py
     touch services/__init__.py
     touch utils/__init__.py
     ```

## Running the Server

1. **Start the Server**:
   ```
   python app.py
   ```
   Or use the provided batch file:
   ```
   start_server.bat
   ```

2. **Verify the Server is Running**:
   - Open a browser and navigate to `http://localhost:5001/health`
   - You should see a JSON response with status "healthy"

## Frontend Integration

The frontend needs to be configured to communicate with the marketing backend. This requires updating the Vite proxy configuration:

1. **Update vite.config.ts**:
   ```javascript
   '/api/marketing': {
     target: 'http://localhost:5001', // marketing backend
     changeOrigin: true,
     secure: false,
   },
   ```

2. **Restart the Frontend Development Server**:
   ```
   npm run dev
   ```

## API Endpoints

### Campaigns

- `GET /api/marketing/campaigns` - List all campaigns
- `GET /api/marketing/campaigns/:id` - Get campaign details
- `POST /api/marketing/campaigns` - Create a new campaign
- `PUT /api/marketing/campaigns/:id` - Update a campaign
- `DELETE /api/marketing/campaigns/:id` - Delete a campaign
- `POST /api/marketing/campaigns/:id/schedule` - Schedule a campaign
- `POST /api/marketing/send-test` - Send a test message
- `GET /api/marketing/analytics/:id` - Get campaign analytics

### Templates

- `GET /api/marketing/templates` - List all templates
- `GET /api/marketing/templates/:id` - Get template details
- `POST /api/marketing/templates` - Create a new template
- `PUT /api/marketing/templates/:id` - Update a template
- `DELETE /api/marketing/templates/:id` - Delete a template

### Integrations

- `GET /api/marketing/integrations` - List all integrations
- `GET /api/marketing/integrations/:id` - Get integration details
- `POST /api/marketing/integrations` - Create a new integration
- `PUT /api/marketing/integrations/:id` - Update an integration
- `DELETE /api/marketing/integrations/:id` - Delete an integration
- `POST /api/marketing/integrations/test` - Test an integration

## Troubleshooting

### Common Issues

1. **Connection Refused**:
   - Ensure the server is running on port 5001
   - Check if another process is using port 5001

2. **Database Connection Failed**:
   - Verify MongoDB is running on localhost:27017
   - Check the MongoDB connection string in the .env file

3. **CORS Errors**:
   - Ensure the frontend is making requests to the correct URL
   - Verify the CORS configuration in app.py

4. **Third-Party Service Errors**:
   - Verify your Twilio/SendGrid credentials
   - Check the service status on the provider's website

### Debugging

1. **Enable Debug Mode**:
   - Set `FLASK_ENV=development` in the .env file
   - This will provide more detailed error messages

2. **Check Logs**:
   - Look for error messages in the console output
   - Check MongoDB logs for database-related issues

## Next Steps

1. **Set Up Third-Party Accounts**:
   - Create accounts with Twilio and SendGrid
   - Generate API keys and credentials

2. **Configure Integrations**:
   - Add your credentials to the marketing backend
   - Test the integrations to ensure they work

3. **Create Templates**:
   - Design reusable templates for your marketing messages
   - Test them with different customer data

4. **Launch Campaigns**:
   - Select customer segments
   - Create campaigns using your templates
   - Monitor campaign performance
